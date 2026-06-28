"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";

interface Team {
  nome: string;
  cor: string;
  pontos: number;
}

interface Question {
  id: number;
  pergunta: string;
  resposta: string;
  categoria: string;
  nivel: string;
  pontos: number;
}

interface Challenge {
  id: number;
  nome: string;
  descricao: string;
  instrucao: string;
  tempo: string;
  categoria: string;
  nivel: string;
}

export default function ApresentadorPage() {
  const [gameCode, setGameCode] = useState("");
  const [teams, setTeams] = useState<Team[]>([
    { nome: "Azul", cor: "#4A90D9", pontos: 0 },
    { nome: "Vermelho", cor: "#E74C3C", pontos: 0 },
  ]);
  const [currentContent, setCurrentContent] = useState<
    | { type: "question"; data: Question }
    | { type: "challenge"; data: Challenge }
    | null
  >(null);
  const [challengeTimerSeconds, setChallengeTimerSeconds] = useState(30);
  const [showPin, setShowPin] = useState(false);
  const [pinCode, setPinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [nextTeamIndex, setNextTeamIndex] = useState(0);
  const [questionTurn, setQuestionTurn] = useState<{
    stage: "response" | "pass" | "repass";
    currentTeam: number;
    originalTeam: number;
    currentPontos: number;
    done: boolean;
  } | null>(null);
  const [isPagaChallenge, setIsPagaChallenge] = useState(false);
  const [nextCountdown, setNextCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (errorMsg) {
      const t = setTimeout(() => setErrorMsg(""), 5000);
      return () => clearTimeout(t);
    }
  }, [errorMsg]);

  useEffect(() => {
    if (nextCountdown === null) return;
    if (nextCountdown <= 0) {
      const id = setTimeout(() => {
        setNextCountdown(null);
        pickQuestion();
      }, 0);
      return () => clearTimeout(id);
    }
    const t = setTimeout(() => setNextCountdown(nextCountdown - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextCountdown]);

  async function sendAction(action: string, data?: unknown) {
    await fetch("/api/game/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameCode, action, data }),
    });
  }

  const startGame = useCallback(async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/presenter/games", { method: "POST" });
      if (res.ok) {
        const game = await res.json();
        setGameCode(game.codigo);
        setPinCode(game.codigo);
        setShowPin(true);
        setTeams([
          { nome: "Azul", cor: "#4A90D9", pontos: 0 },
          { nome: "Vermelho", cor: "#E74C3C", pontos: 0 },
        ]);
        setCurrentContent(null);
        setQuestionTurn(null);
        setNextTeamIndex(0);
        setIsPagaChallenge(false);
      } else {
        setErrorMsg("Erro ao criar partida. Tente novamente.");
      }
    } catch {
      setErrorMsg("Erro de conexão ao criar partida");
    } finally {
      setLoading(false);
    }
  }, []);

  async function pickQuestion() {
    setErrorMsg("");
    try {
      const res = await fetch("/api/presenter/perguntas?limit=100");
      if (!res.ok) { setErrorMsg("Erro ao carregar perguntas"); return; }
      const data = await res.json();
      if (data.questions?.length > 0) {
        const q: Question = data.questions[Math.floor(Math.random() * data.questions.length)];
        const teamIdx = nextTeamIndex % teams.length;
        setNextTeamIndex((prev) => (prev + 1) % teams.length);
        setCurrentContent({ type: "question", data: q });
        setQuestionTurn({
          stage: "response",
          currentTeam: teamIdx,
          originalTeam: teamIdx,
          currentPontos: q.pontos,
          done: false,
        });
        setIsPagaChallenge(false);
        if (gameCode) {
          await sendAction("QUESTION", {
            pergunta: q.pergunta,
            resposta: q.resposta,
            categoria: q.categoria,
            nivel: q.nivel,
            pontos: q.pontos,
            currentTeam: teamIdx,
            teamName: teams[teamIdx].nome,
          });
        }
      } else {
        setErrorMsg("Nenhuma pergunta cadastrada. Vá em Admin > Perguntas para adicionar.");
      }
    } catch {
      setErrorMsg("Erro de conexão ao buscar perguntas");
    }
  }

  async function pickChallenge() {
    setErrorMsg("");
    setIsPagaChallenge(false);
    try {
      const res = await fetch("/api/presenter/provas?limit=100");
      if (!res.ok) { setErrorMsg("Erro ao carregar provas"); return; }
      const data = await res.json();
      if (data.challenges?.length > 0) {
        const c: Challenge = data.challenges[Math.floor(Math.random() * data.challenges.length)];
        setCurrentContent({ type: "challenge", data: c });
        if (gameCode) {
          await sendAction("CHALLENGE", {
            nome: c.nome,
            descricao: c.descricao,
            instrucao: c.instrucao,
            categoria: c.categoria,
            nivel: c.nivel,
            tempo: c.tempo,
          });
        }
      } else {
        setErrorMsg("Nenhuma prova cadastrada. Vá em Admin > Provas para adicionar.");
      }
    } catch {
      setErrorMsg("Erro de conexão ao buscar provas");
    }
  }

  async function handleCorrect() {
    if (!questionTurn || questionTurn.done) return;
    const team = teams[questionTurn.currentTeam];
    const pontos = questionTurn.currentPontos;
    setTeams((prev) => prev.map((t, i) => i === questionTurn.currentTeam ? { ...t, pontos: t.pontos + pontos } : t));
    setQuestionTurn((prev) => prev ? { ...prev, done: true } : null);
    if (gameCode) {
      await sendAction("SCORE", {
        teams: teams.map((t, i) => ({ nome: t.nome, pontos: t.pontos + (i === questionTurn.currentTeam ? pontos : 0) })),
        teamName: team.nome,
        pontos: team.pontos + pontos,
      });
      await sendAction("CORRECT", { team: team.nome, pontos, resposta: currentContent?.type === "question" ? currentContent.data.resposta : "" });
    }
  }

  async function handleWrong() {
    if (!questionTurn || questionTurn.done) return;
    setQuestionTurn((prev) => prev ? { ...prev, done: true } : null);
    if (gameCode) {
      await sendAction("WRONG", { resposta: currentContent?.type === "question" ? currentContent.data.resposta : "" });
    }
  }

  async function handlePass() {
    if (!questionTurn || questionTurn.stage !== "response" || questionTurn.done) return;
    const otherTeam = (questionTurn.currentTeam + 1) % teams.length;
    const halfPontos = Math.floor(questionTurn.currentPontos / 2);
    setQuestionTurn((prev) => prev ? {
      ...prev,
      stage: "pass",
      currentTeam: otherTeam,
      currentPontos: halfPontos,
    } : null);
    if (gameCode) {
      await sendAction("PASS", {
        teamName: teams[otherTeam].nome,
        pontos: halfPontos,
      });
    }
  }

  async function handleRepass() {
    if (!questionTurn || questionTurn.stage !== "pass" || questionTurn.done) return;
    const original = questionTurn.originalTeam;
    setQuestionTurn((prev) => prev ? {
      ...prev,
      stage: "repass",
      currentTeam: original,
    } : null);
    if (gameCode) {
      await sendAction("REPASS", {
        teamName: teams[original].nome,
        pontos: questionTurn.currentPontos,
      });
    }
  }

  async function handlePaga() {
    if (!questionTurn || questionTurn.stage !== "repass" || questionTurn.done) return;
    setIsPagaChallenge(true);
    setQuestionTurn((prev) => prev ? { ...prev, done: true } : null);
    try {
      const res = await fetch("/api/presenter/provas?limit=100");
      if (!res.ok) { setErrorMsg("Erro ao carregar provas"); return; }
      const data = await res.json();
      if (data.challenges?.length > 0) {
        const c: Challenge = data.challenges[Math.floor(Math.random() * data.challenges.length)];
        setCurrentContent({ type: "challenge", data: c });
        if (gameCode) {
          await sendAction("PAY", {
            teamName: teams[questionTurn.currentTeam].nome,
            pontos: questionTurn.currentPontos,
          });
          await sendAction("CHALLENGE", {
            nome: c.nome,
            descricao: c.descricao,
            instrucao: c.instrucao,
            categoria: c.categoria,
            nivel: c.nivel,
            tempo: c.tempo,
            teamName: teams[questionTurn.currentTeam].nome,
            paga: true,
          });
        }
      } else {
        setErrorMsg("Nenhuma prova cadastrada. Vá em Admin > Provas para adicionar.");
      }
    } catch {
      setErrorMsg("Erro de conexão ao buscar provas");
    }
  }

  async function handleChallengeResult(success: boolean) {
    if (!isPagaChallenge) return;
    const teamIdx = questionTurn?.originalTeam ?? 0;
    if (success) {
      const pontos = questionTurn?.currentPontos ?? 0;
      setTeams((prev) => prev.map((t, i) => i === teamIdx ? { ...t, pontos: t.pontos + pontos } : t));
      if (gameCode) {
        const team = teams[teamIdx];
        await sendAction("SCORE", {
          teams: teams.map((t, i) => ({ nome: t.nome, pontos: t.pontos + (i === teamIdx ? pontos : 0) })),
          teamName: team.nome,
          pontos: team.pontos + pontos,
        });
      }
    }
    setIsPagaChallenge(false);
    const challengePontos = questionTurn?.currentPontos ?? 0;
    if (gameCode) {
      await sendAction("CHALLENGE_RESULT", {
        success,
        teamName: teams[teamIdx].nome,
        pontos: success ? challengePontos : 0,
      });
    }
    setCurrentContent(null);
    setQuestionTurn(null);
  }

  function adjustScore(teamName: string, delta: number) {
    setTeams((prev) => {
      const next = prev.map((t) =>
        t.nome === teamName ? { ...t, pontos: Math.max(0, t.pontos + delta) } : t
      );
      if (gameCode) {
        const team = next.find((t) => t.nome === teamName);
        if (team) {
          fetch("/api/game/action", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              gameCode,
              action: "SCORE",
              data: { teams: next, teamName, pontos: team.pontos },
            }),
          });
        }
      }
      return next;
    });
  }

  async function handlePenalty(teamName: string, pontos: number) {
    const prevPontos = teams.find((t) => t.nome === teamName)?.pontos ?? 0;
    const newPontos = Math.max(0, prevPontos - pontos);
    setTeams((prev) => prev.map((t) =>
      t.nome === teamName ? { ...t, pontos: newPontos } : t
    ));
    if (gameCode) {
      await sendAction("SCORE", {
        teams: teams.map((t) => ({ nome: t.nome, pontos: t.nome === teamName ? newPontos : t.pontos })),
        teamName,
        pontos: newPontos,
      });
      await sendAction("PENALTY", { teamName, pontos });
    }
  }

  async function startTimer(seconds: number = 10, tipo: "question" | "challenge" = "question") {
    if (gameCode) {
      await sendAction("TIMER_START", { seconds, tipo });
    }
  }

  async function resetScreen() {
    setCurrentContent(null);
    setQuestionTurn(null);
    setIsPagaChallenge(false);
    setNextCountdown(null);
    if (gameCode) await sendAction("SCREEN_RESET");
  }

  async function handleShowScoreboard() {
    setNextCountdown(3);
    if (gameCode) {
      await sendAction("SCOREBOARD", { teams: teams.map(t => ({ nome: t.nome, cor: t.cor, pontos: t.pontos })) });
    }
  }

  async function endGame() {
    if (gameCode) {
      await sendAction("GAME_OVER");
      setGameCode("");
      setCurrentContent(null);
      setQuestionTurn(null);
      setIsPagaChallenge(false);
    }
  }

  if (!gameCode && !currentContent) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #FFF5E6 0%, #FFE0B2 50%, #FFCC80 100%)" }}>
        <header className="bg-white/80 backdrop-blur p-6 border-b-2 border-sunny">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <h1 className="text-3xl font-display font-bold text-coral drop-shadow-sm">🎤 Apresentador</h1>
            <Link href="/telao" target="_blank" className="btn-fun px-5 py-3 bg-white text-zinc-600 border-zinc-300">📺 Abrir Telão</Link>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center p-8">
          {errorMsg && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-red-500 text-white font-display px-6 py-3 rounded-2xl shadow-lg border-2 border-red-600 z-40 text-center max-w-md">{errorMsg}</div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
            <button onClick={pickQuestion} className="bg-white rounded-[2rem] shadow-lg border-2 border-coral/30 hover:border-coral/60 hover:shadow-xl hover:-translate-y-1 transition-all p-8 text-left group">
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform inline-block">❓</div>
              <h2 className="text-2xl font-display font-bold text-coral mb-2">Pergunta Aleatória</h2>
              <p className="text-zinc-500 font-body">Sorteie uma pergunta (sem partida)</p>
            </button>
            <button onClick={pickChallenge} className="bg-white rounded-[2rem] shadow-lg border-2 border-salmon/30 hover:border-salmon/60 hover:shadow-xl hover:-translate-y-1 transition-all p-8 text-left group">
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform inline-block">🎯</div>
              <h2 className="text-2xl font-display font-bold text-salmon mb-2">Prova do Paga</h2>
              <p className="text-zinc-500 font-body">Sorteie um desafio (sem partida)</p>
            </button>
            <button onClick={startGame} disabled={loading} className="bg-white rounded-[2rem] shadow-lg border-2 border-teal/30 hover:border-teal/60 hover:shadow-xl hover:-translate-y-1 transition-all p-8 text-left group disabled:opacity-50">
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform inline-block">🎮</div>
              <h2 className="text-2xl font-display font-bold text-teal mb-2">Nova Partida</h2>
              <p className="text-zinc-500 font-body">Iniciar partida com times e telão</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!gameCode && currentContent) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #FFF5E6 0%, #FFE0B2 50%, #FFCC80 100%)" }}>
        <header className="bg-white/80 backdrop-blur p-6 border-b-2 border-sunny">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <h1 className="text-3xl font-display font-bold text-coral drop-shadow-sm">🎤 Apresentador</h1>
            <button onClick={() => setCurrentContent(null)} className="btn-fun px-6 py-3 bg-white text-zinc-600 border-zinc-300">↩️ Voltar</button>
          </div>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-5xl mx-auto w-full">
          <div className="w-full bg-white rounded-[2rem] shadow-xl border-2 border-coral/30 p-10 mb-6">
            {currentContent.type === "question" ? (
              <>
                <div className="flex gap-2 mb-6 flex-wrap">
                  <span className="inline-block px-4 py-2 rounded-full bg-teal/10 text-teal font-display text-sm">📂 {currentContent.data.categoria}</span>
                  <span className={`inline-block px-4 py-2 rounded-full font-display text-sm ${currentContent.data.nivel === "Fácil" ? "bg-green-100 text-green-600" : currentContent.data.nivel === "Médio" ? "bg-yellow-100 text-yellow-600" : currentContent.data.nivel === "Difícil" ? "bg-red-100 text-red-600" : "bg-purple-100 text-purple-600"}`}>🎯 {currentContent.data.nivel}</span>
                  <span className="inline-block px-4 py-2 rounded-full bg-orange-100 text-orange-600 font-display text-sm">⭐ {currentContent.data.pontos} pts</span>
                </div>
                <h2 className="text-3xl font-display font-bold text-zinc-800 mb-8 text-center">{currentContent.data.pergunta}</h2>
                <div className="text-center bg-teal/5 rounded-2xl p-6 border-2 border-teal/30">
                  <p className="font-display text-zinc-500 text-lg mb-2">✅ Resposta:</p>
                  <p className="text-3xl font-display font-bold text-teal">{currentContent.data.resposta}</p>
                </div>
              </>
            ) : (
              <>
                <div className="flex gap-2 mb-4 flex-wrap">
                  <span className="inline-block px-4 py-2 rounded-full bg-lavender/10 text-lavender font-display text-sm">📂 {currentContent.data.categoria}</span>
                  <span className={`inline-block px-4 py-2 rounded-full font-display text-sm ${currentContent.data.nivel === "Fácil" ? "bg-green-100 text-green-600" : currentContent.data.nivel === "Médio" ? "bg-yellow-100 text-yellow-600" : currentContent.data.nivel === "Difícil" ? "bg-red-100 text-red-600" : "bg-purple-100 text-purple-600"}`}>🎯 {currentContent.data.nivel}</span>
                  <span className="inline-block px-4 py-2 rounded-full bg-orange-100 text-orange-600 font-display text-sm">⏱️ {currentContent.data.tempo}</span>
                </div>
                <h2 className="text-3xl font-display font-bold text-zinc-800 mb-4 text-center">🎪 {currentContent.data.nome}</h2>
                <p className="text-zinc-500 font-body text-lg text-center mb-6">{currentContent.data.descricao}</p>
                <div className="bg-orange-50 rounded-2xl p-6 border-2 border-orange-200">
                  <p className="font-display text-salmon font-semibold mb-2">📋 Instrução:</p>
                  <p className="text-zinc-600 font-body leading-relaxed">{currentContent.data.instrucao}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentTeam = questionTurn ? teams[questionTurn.currentTeam] : null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #FFF5E6 0%, #FFE0B2 50%, #FFCC80 100%)" }}>
      <header className="bg-white/80 backdrop-blur px-6 py-3 border-b-2 border-sunny">
        <div className="flex items-center justify-between max-w-6xl mx-auto flex-wrap gap-2">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-display font-bold text-coral">🎤 Apresentador</h1>
            <span className="inline-flex items-center gap-2 bg-teal/10 text-teal font-display font-bold px-4 py-2 rounded-full text-sm">🎪 {gameCode}</span>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            {teams.map((team) => (
              <div key={team.nome} className="flex items-center gap-1 bg-white/80 rounded-xl px-3 py-2 shadow-sm">
                <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: team.cor }} />
                <span className="font-display font-bold text-sm" style={{ color: team.cor }}>{team.nome}</span>
                <span className="font-display font-bold text-lg text-zinc-800 mx-1 min-w-[2ch] text-center">{team.pontos}</span>
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => adjustScore(team.nome, 5)} className="text-[10px] leading-none bg-green-100 text-green-600 rounded px-1 hover:bg-green-200 transition-colors" title="+5">▲</button>
                  <button onClick={() => adjustScore(team.nome, -5)} className="text-[10px] leading-none bg-red-100 text-red-600 rounded px-1 hover:bg-red-200 transition-colors" title="-5">▼</button>
                </div>
                <div className="flex gap-0.5 ml-1">
                  {[10, 20, 30].map((v) => (
                    <button key={v} onClick={() => adjustScore(team.nome, v)} className="text-[11px] font-display bg-teal/10 text-teal rounded px-1.5 py-0.5 hover:bg-teal/20 transition-colors">+{v}</button>
                  ))}
                </div>
              </div>
            ))}
            <Link href="/telao" target="_blank" className="btn-fun px-4 py-2 bg-white text-zinc-600 border-zinc-300 text-sm">📺 Telão</Link>
            <button onClick={() => { setShowPin(true); setPinCode(gameCode); }} className="btn-fun px-4 py-2 bg-white text-zinc-600 border-zinc-300 text-sm">📋 PIN</button>
            <button onClick={endGame} className="btn-fun px-4 py-2 bg-red-500 text-white border-red-600 text-sm">🏁 Encerrar</button>
          </div>
        </div>
      </header>

      {showPin && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] shadow-2xl p-10 max-w-md w-full mx-4 text-center border-4 border-sunny">
            <div className="text-6xl mb-4">🎉</div>
            <p className="font-display text-zinc-500 text-lg mb-2">Partida criada!</p>
            <p className="font-display text-coral text-xl mb-6">Compartilhe o PIN com os jogadores</p>
            <div className="text-6xl font-display font-bold tracking-[0.3em] text-zinc-800 bg-orange-50 rounded-2xl py-6 px-4 mb-6 select-all border-2 border-orange-200">{pinCode}</div>
            <div className="flex gap-3 justify-center">
              <button onClick={() => { navigator.clipboard?.writeText(pinCode); }} className="btn-fun px-6 py-3 bg-white text-zinc-600 border-zinc-300">📋 Copiar</button>
              <button onClick={() => setShowPin(false)} className="btn-fun px-6 py-3 bg-teal text-white border-teal/80">🎬 Vamos jogar!</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center p-6 max-w-5xl mx-auto w-full relative">
        {errorMsg && (
          <div className="bg-red-500 text-white font-display px-6 py-3 rounded-2xl shadow-lg border-2 border-red-600 mb-4 text-center max-w-md w-full">{errorMsg}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full mb-6">
          {teams.map((team, i) => (
            <div key={team.nome} className={`bg-white rounded-2xl shadow-lg border-2 p-6 text-center ${i === 0 ? "border-blue-200" : "border-red-200"}`}>
              <h2 className="text-xl font-display font-bold mb-1" style={{ color: team.cor }}>{i === 0 ? "🔵" : "🔴"} {team.nome}</h2>
              <p className="text-5xl font-display font-bold text-zinc-800 mb-3">{team.pontos}</p>
              <div className="flex gap-2 justify-center flex-wrap">
                <button onClick={() => adjustScore(team.nome, 10)} className="btn-fun px-4 py-2 bg-teal text-white border-teal/80 text-sm">+10</button>
                <button onClick={() => adjustScore(team.nome, 20)} className="btn-fun px-4 py-2 bg-teal text-white border-teal/80 text-sm">+20</button>
                <button onClick={() => adjustScore(team.nome, 30)} className="btn-fun px-4 py-2 bg-teal text-white border-teal/80 text-sm">+30</button>
                <button onClick={() => adjustScore(team.nome, -10)} className="btn-fun px-4 py-2 bg-salmon text-white border-salmon/80 text-sm">-10</button>
                <div className="w-full mt-2 pt-2 border-t border-zinc-100">
                  <p className="text-[10px] font-display text-red-400 mb-1">⚠️ Penalização</p>
                  <div className="flex gap-1 justify-center">
                    <button onClick={() => handlePenalty(team.nome, 5)} className="btn-fun px-2 py-1 bg-red-500 text-white border-red-600 text-[11px]">-5</button>
                    <button onClick={() => handlePenalty(team.nome, 10)} className="btn-fun px-2 py-1 bg-red-500 text-white border-red-600 text-[11px]">-10</button>
                    <button onClick={() => handlePenalty(team.nome, 20)} className="btn-fun px-2 py-1 bg-red-500 text-white border-red-600 text-[11px]">-20</button>
                    <button onClick={() => handlePenalty(team.nome, 30)} className="btn-fun px-2 py-1 bg-red-500 text-white border-red-600 text-[11px]">-30</button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="bg-white rounded-2xl shadow-lg border-2 border-lavender/30 p-6 flex flex-col items-center justify-center">
            <p className="text-lg font-display text-zinc-500 mb-3">Controles</p>
            <div className="flex flex-col gap-2 w-full">
              <button onClick={pickQuestion} className="btn-fun w-full py-3 bg-coral text-white border-coral/80 text-sm">🎲 Sortear Pergunta</button>
              <button onClick={pickChallenge} className="btn-fun w-full py-3 bg-salmon text-white border-salmon/80 text-sm">🎯 Sortear Prova</button>
              <button onClick={resetScreen} className="btn-fun w-full py-3 bg-white text-zinc-600 border-zinc-300 text-sm">🧹 Limpar Tela</button>
            </div>
          </div>
        </div>

        {currentContent ? (
          <div className="w-full bg-white rounded-[2rem] shadow-xl border-2 border-coral/30 p-8 mb-6">
            {currentContent.type === "question" ? (
              <>
                <div className="flex gap-2 mb-4 flex-wrap">
                  <span className="inline-block px-4 py-2 rounded-full bg-teal/10 text-teal font-display text-sm">📂 {currentContent.data.categoria}</span>
                  <span className={`inline-block px-4 py-2 rounded-full font-display text-sm ${currentContent.data.nivel === "Fácil" ? "bg-green-100 text-green-600" : currentContent.data.nivel === "Médio" ? "bg-yellow-100 text-yellow-600" : currentContent.data.nivel === "Difícil" ? "bg-red-100 text-red-600" : "bg-purple-100 text-purple-600"}`}>🎯 {currentContent.data.nivel}</span>
                  <span className="inline-block px-4 py-2 rounded-full bg-orange-100 text-orange-600 font-display text-sm">⭐ {currentContent.data.pontos} pts</span>
                </div>

                {questionTurn && !questionTurn.done && (
                  <div className="text-center mb-4">
                    <span className="inline-block px-6 py-3 rounded-2xl font-display font-bold text-lg" style={{ backgroundColor: (currentTeam?.cor ?? "#888") + "20", color: currentTeam?.cor ?? "#888" }}>
                      {questionTurn.stage === "response" ? "🗣️" : questionTurn.stage === "pass" ? "🔁" : "↩️"} {currentTeam?.nome} responde — {questionTurn.currentPontos} pts
                    </span>
                  </div>
                )}

                <h2 className="text-3xl font-display font-bold text-zinc-800 mb-6 text-center">{currentContent.data.pergunta}</h2>
                <div className="text-center bg-teal/5 rounded-2xl p-6 border-2 border-teal/30 mb-6">
                  <p className="font-display text-zinc-500 text-lg mb-2">✅ Resposta:</p>
                  <p className="text-3xl font-display font-bold text-teal">{currentContent.data.resposta}</p>
                </div>

                <div className="flex gap-3 justify-center flex-wrap mb-4">
                  <button onClick={() => startTimer(10)} className="btn-fun px-6 py-3 bg-sunny text-zinc-800 border-amber-400 hover:bg-sunny/90 text-base">⏱️ 10s</button>
                </div>

                {questionTurn && !questionTurn.done ? (
                  <div className="space-y-4">
                    <div className="flex gap-3 justify-center">
                      <button onClick={handleCorrect} className="btn-fun px-8 py-4 bg-teal text-white border-teal/80 hover:bg-teal/90 text-xl">✅ Certo</button>
                      <button onClick={handleWrong} className="btn-fun px-8 py-4 bg-salmon text-white border-salmon/80 hover:bg-salmon/90 text-xl">❌ Errado</button>
                      {questionTurn.stage === "response" && (
                        <button onClick={handlePass} className="btn-fun px-8 py-4 bg-amber-500 text-white border-amber-600 hover:bg-amber-600 text-xl">🔁 Passar</button>
                      )}
                      {questionTurn.stage === "pass" && (
                        <button onClick={handleRepass} className="btn-fun px-8 py-4 bg-lavender text-white border-lavender/80 hover:bg-lavender/90 text-xl">↩️ Repassar</button>
                      )}
                      {questionTurn.stage === "repass" && (
                        <button onClick={handlePaga} className="btn-fun px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-600 hover:opacity-90 text-xl">💰 Paga</button>
                      )}
                    </div>
                  </div>
                ) : questionTurn?.done ? (
                  <div className="text-center space-y-4">
                    <p className="text-2xl font-display font-bold text-zinc-600">✅ Questão encerrada</p>
                    <button
                      onClick={handleShowScoreboard}
                      disabled={nextCountdown !== null}
                      className="btn-fun px-8 py-4 bg-coral text-white border-coral/80 text-xl disabled:opacity-70"
                    >
                      {nextCountdown !== null ? `🏆 Placar (${nextCountdown}s)` : "🎲 Próxima Pergunta"}
                    </button>
                  </div>
                ) : null}
              </>
            ) : (
              <>
                <div className="flex gap-2 mb-4 flex-wrap">
                  <span className="inline-block px-4 py-2 rounded-full bg-lavender/10 text-lavender font-display text-sm">📂 {currentContent.data.categoria}</span>
                  <span className={`inline-block px-4 py-2 rounded-full font-display text-sm ${currentContent.data.nivel === "Fácil" ? "bg-green-100 text-green-600" : currentContent.data.nivel === "Médio" ? "bg-yellow-100 text-yellow-600" : currentContent.data.nivel === "Difícil" ? "bg-red-100 text-red-600" : "bg-purple-100 text-purple-600"}`}>🎯 {currentContent.data.nivel}</span>
                  <span className="inline-block px-4 py-2 rounded-full bg-orange-100 text-orange-600 font-display text-sm">⏱️ {currentContent.data.tempo}</span>
                </div>
                <h2 className="text-3xl font-display font-bold text-zinc-800 mb-4 text-center">🎪 {currentContent.data.nome}</h2>
                <p className="text-zinc-500 font-body text-lg text-center mb-6">{currentContent.data.descricao}</p>
                <div className="bg-orange-50 rounded-2xl p-6 border-2 border-orange-200 mb-6">
                  <p className="font-display text-salmon font-semibold mb-2">📋 Instrução:</p>
                  <p className="text-zinc-600 font-body leading-relaxed">{currentContent.data.instrucao}</p>
                </div>

                <div className="flex items-center justify-center gap-3 mb-4">
                  <select value={challengeTimerSeconds} onChange={(e) => setChallengeTimerSeconds(Number(e.target.value))} className="px-4 py-3 rounded-xl bg-white text-zinc-800 border-2 border-zinc-200 focus:border-purple-400 focus:outline-none font-display text-base">
                    <option value={10}>10s</option>
                    <option value={20}>20s</option>
                    <option value={30}>30s</option>
                    <option value={60}>1 min</option>
                    <option value={120}>2 min</option>
                    <option value={300}>5 min</option>
                  </select>
                  <button onClick={() => startTimer(challengeTimerSeconds, "challenge")} className="btn-fun px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-600 hover:opacity-90 text-lg font-bold">
                    ⚡ Valendo {challengeTimerSeconds >= 60 ? `${challengeTimerSeconds / 60} min` : `${challengeTimerSeconds}s`}
                  </button>
                </div>

                {isPagaChallenge && (
                  <div className="flex gap-3 justify-center">
                    <button onClick={() => handleChallengeResult(true)} className="btn-fun px-8 py-4 bg-teal text-white border-teal/80 hover:bg-teal/90 text-xl">
                      ✅ Prova Realizada (+{questionTurn?.currentPontos ?? 0} pts)
                    </button>
                    <button onClick={() => handleChallengeResult(false)} className="btn-fun px-8 py-4 bg-salmon text-white border-salmon/80 hover:bg-salmon/90 text-xl">
                      ❌ Prova Não Realizada (0 pts)
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="w-full bg-white/60 rounded-[2rem] border-2 border-dashed border-zinc-300 p-12 mb-6 text-center">
            <p className="text-6xl mb-4">🎮</p>
            <p className="text-xl font-display text-zinc-400">Nenhuma pergunta ou desafio ativo</p>
            <p className="font-body text-zinc-300 mt-2">Clique em &ldquo;Sortear Pergunta&rdquo; para começar</p>
          </div>
        )}
      </div>
    </div>
  );
}
