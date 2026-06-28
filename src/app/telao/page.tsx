"use client";

import { useState, useEffect, useRef } from "react";
import { useSounds } from "@/lib/useSounds";

interface Team {
  nome: string;
  cor: string;
  pontos: number;
}

interface QuestionData {
  pergunta: string;
  resposta: string;
  categoria: string;
  nivel: string;
  pontos: number;
}

interface ChallengeData {
  nome: string;
  descricao: string;
  instrucao: string;
  categoria: string;
  nivel: string;
  tempo: string;
}

type ScreenState = "idle" | "question" | "answer" | "wrong" | "challenge" | "pass" | "repass" | "pay" | "timer" | "challenge_result" | "scoreboard" | "penalty";

export default function TelaoPage() {
  const { playSound, stopSound } = useSounds();
  const [step, setStep] = useState<"code" | "game">("code");
  const [codigo, setCodigo] = useState("");
  const [codeError, setCodeError] = useState(false);
  const [checking, setChecking] = useState(false);

  const [teams, setTeams] = useState<Team[]>([]);
  const [screen, setScreen] = useState<ScreenState>("idle");
  const [question, setQuestion] = useState<QuestionData | null>(null);
  const [challenge, setChallenge] = useState<ChallengeData | null>(null);
  const [timerRemaining, setTimerRemaining] = useState(0);
  const [timerTotal, setTimerTotal] = useState(10);
  const [timerActive, setTimerActive] = useState(false);
  const [resultInfo, setResultInfo] = useState<{ acertou: boolean; team?: string; pontos?: number } | null>(null);
  const [passRepassInfo, setPassRepassInfo] = useState<{ action: string; teamName?: string; pontos?: number } | null>(null);
  const [challengeResult, setChallengeResult] = useState<{ success: boolean; teamName?: string; pontos?: number } | null>(null);
  const [penaltyInfo, setPenaltyInfo] = useState<{ teamName: string; pontos: number } | null>(null);
  const [currentQuizInfo, setCurrentQuizInfo] = useState<{ pergunta: string; originalPontos: number; currentPontos: number } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inlineTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoReturnRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const screenRef = useRef(screen);
  const playSoundRef = useRef(playSound);
  const stopSoundRef = useRef(stopSound);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    screenRef.current = screen;
    if (autoReturnRef.current) {
      clearTimeout(autoReturnRef.current);
      autoReturnRef.current = null;
    }
    if (screen === "repass") {
      autoReturnRef.current = setTimeout(() => {
        setScreen("question");
        autoReturnRef.current = null;
      }, 5000);
    } else if (screen === "pass") {
      autoReturnRef.current = setTimeout(() => {
        setScreen("question");
        autoReturnRef.current = null;
      }, 3000);
    } else if (screen === "challenge_result") {
      autoReturnRef.current = setTimeout(() => {
        setScreen("idle");
        autoReturnRef.current = null;
      }, 4000);
    } else if (screen === "scoreboard") {
      autoReturnRef.current = setTimeout(() => {
        setScreen("idle");
        autoReturnRef.current = null;
      }, 3500);
    } else if (screen === "penalty") {
      autoReturnRef.current = setTimeout(() => {
        setScreen("idle");
        setPenaltyInfo(null);
        autoReturnRef.current = null;
      }, 3500);
    }
    return () => {
      if (autoReturnRef.current) clearTimeout(autoReturnRef.current);
    };
  }, [screen]);

  useEffect(() => {
    playSoundRef.current = playSound;
    stopSoundRef.current = stopSound;
  }, [playSound, stopSound]);

  useEffect(() => {
    if (screen !== "timer") {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    timerRef.current = setInterval(() => {
      setTimerRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          playSoundRef.current("timer-end");
          setScreen("challenge");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [screen]);

  useEffect(() => {
    if (!timerActive) {
      if (inlineTimerRef.current) {
        clearInterval(inlineTimerRef.current);
        inlineTimerRef.current = null;
      }
      return;
    }
    inlineTimerRef.current = setInterval(() => {
      setTimerRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(inlineTimerRef.current!);
          inlineTimerRef.current = null;
          playSoundRef.current("timer-end");
          setTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (inlineTimerRef.current) clearInterval(inlineTimerRef.current);
    };
  }, [timerActive]);

  useEffect(() => {
    if (step !== "game" || !codigo) return;

    const es = new EventSource(`/api/sse?codigo=${codigo}`);
    esRef.current = es;

    es.addEventListener("INIT", (e) => {
      const data = JSON.parse(e.data);
      if (data.teams) setTeams(data.teams);
      if (data.currentScreen) setScreen(data.currentScreen);
      if (data.currentQuestion) setQuestion(data.currentQuestion);
      if (data.currentChallenge) setChallenge(data.currentChallenge);
    });

    es.addEventListener("QUESTION", (e) => {
      const data = JSON.parse(e.data);
      setQuestion(data);
      setCurrentQuizInfo({ pergunta: data.pergunta, originalPontos: data.pontos, currentPontos: data.pontos });
      setChallenge(null);
      setResultInfo(null);
      setChallengeResult(null);
      setPassRepassInfo(null);
      setTimerActive(false);
      setScreen("question");
      playSound("question");
    });

    es.addEventListener("CORRECT", (e) => {
      const data = JSON.parse(e.data);
      setQuestion((prev) => prev ? { ...prev, resposta: data.resposta } : prev);
      setResultInfo({ acertou: true, team: data.team, pontos: data.pontos });
      setPassRepassInfo(null);
      setScreen("answer");
      playSound("correct");
    });

    es.addEventListener("WRONG", (e) => {
      const data = JSON.parse(e.data);
      setQuestion((prev) => prev ? { ...prev, resposta: data.resposta } : prev);
      setResultInfo({ acertou: false });
      setScreen("wrong");
      playSound("wrong");
    });

    es.addEventListener("ANSWER", (e) => {
      const data = JSON.parse(e.data);
      setQuestion((prev) => prev ? { ...prev, resposta: data.resposta } : prev);
      setScreen("answer");
    });

    es.addEventListener("CHALLENGE", (e) => {
      const data = JSON.parse(e.data);
      setChallenge(data);
      setQuestion(null);
      setChallengeResult(null);
      setPassRepassInfo(null);
      setScreen("challenge");
      playSound("challenge");
    });

    es.addEventListener("SCORE", (e) => {
      const data = JSON.parse(e.data);
      if (data.teams) setTeams(data.teams);
      playSound("score");
    });

    es.addEventListener("PASS", (e) => {
      const data = JSON.parse(e.data);
      setPassRepassInfo({ action: "pass", teamName: data.teamName, pontos: data.pontos });
      setCurrentQuizInfo((prev) => prev ? { ...prev, currentPontos: data.pontos } : prev);
      setScreen("pass");
      playSound("pass");
    });

    es.addEventListener("REPASS", (e) => {
      const data = JSON.parse(e.data);
      setPassRepassInfo({ action: "repass", teamName: data.teamName, pontos: data.pontos });
      setCurrentQuizInfo((prev) => prev ? { ...prev, currentPontos: data.pontos } : prev);
      setScreen("repass");
      playSound("repass");
    });

    es.addEventListener("PAY", (e) => {
      const data = JSON.parse(e.data);
      if (data.pontos) {
        setCurrentQuizInfo((prev) => prev ? { ...prev, currentPontos: data.pontos } : prev);
      }
      setPassRepassInfo({ action: "pay", teamName: data.teamName, pontos: data.pontos });
      setScreen("pay");
      playSound("pay");
    });

    es.addEventListener("TIMER_START", (e) => {
      const data = JSON.parse(e.data);
      setTimerTotal(data.seconds || 10);
      setTimerRemaining(data.seconds || 10);
      if (data.tipo === "challenge") {
        setScreen("timer");
        playSound("timer-loop");
      } else {
        setTimerActive(true);
        playSound("timer-tick");
      }
    });

    es.addEventListener("TIMER_STOP", () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (inlineTimerRef.current) clearInterval(inlineTimerRef.current);
      setTimerActive(false);
      playSound("timer-end");
    });

    es.addEventListener("CHALLENGE_RESULT", (e) => {
      const data = JSON.parse(e.data);
      setChallengeResult({ success: data.success, teamName: data.teamName, pontos: data.pontos });
      setScreen("challenge_result");
      if (data.success) playSound("michael-jackson-hee-hee");
    });

    es.addEventListener("SCOREBOARD", (e) => {
      const data = JSON.parse(e.data);
      if (data.teams) setTeams(data.teams);
      setScreen("scoreboard");
      playSound("score");
    });

    es.addEventListener("PENALTY", (e) => {
      const data = JSON.parse(e.data);
      setPenaltyInfo({ teamName: data.teamName, pontos: data.pontos });
      setScreen("penalty");
      playSound("penalty");
    });

    es.addEventListener("SCREEN_RESET", () => {
      setScreen("idle");
      setQuestion(null);
      setChallenge(null);
      setResultInfo(null);
      setChallengeResult(null);
      setPassRepassInfo(null);
      setPenaltyInfo(null);
      setCurrentQuizInfo(null);
      setTimerActive(false);
    });

    es.addEventListener("GAME_OVER", () => {
      setScreen("idle");
      setQuestion(null);
      setChallenge(null);
      setResultInfo(null);
      setChallengeResult(null);
      setPassRepassInfo(null);
      setPenaltyInfo(null);
      setCurrentQuizInfo(null);
      setTimerActive(false);
      playSound("game-over");
    });

    es.onerror = () => {
      // EventSource auto-reconnects
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [step, codigo, playSound, stopSound]);

  async function connect() {
    if (codigo.length < 4) return;
    setChecking(true);
    setCodeError(false);
    try {
      const res = await fetch(`/api/presenter/games?codigo=${codigo}`);
      if (res.ok) {
        const data = await res.json();
        if (data.valid) {
          setStep("game");
        } else {
          setCodeError(true);
        }
      } else {
        setCodeError(true);
      }
    } catch {
      setCodeError(true);
    }
    setChecking(false);
  }

  if (step === "code") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
        <div className="text-center max-w-md mx-4">
          <div className="bg-white/10 backdrop-blur rounded-[2rem] p-8 border-2 border-white/20">
            <div className="text-7xl mb-6">🎪</div>
            <h1 className="text-4xl font-display font-bold text-white mb-2">Passa ou Repassa</h1>
            <p className="text-white/70 font-display mb-6">Insira o PIN da partida</p>
            <input
              type="text"
              value={codigo}
              onChange={(e) => { setCodigo(e.target.value.toUpperCase()); setCodeError(false); }}
              placeholder="PIN"
              className="w-full text-center text-2xl px-6 py-4 rounded-xl bg-white/20 text-white placeholder-white/40 border-2 border-white/30 focus:border-white/60 focus:outline-none font-body mb-4 uppercase tracking-widest backdrop-blur"
              maxLength={6}
              onKeyDown={(e) => e.key === "Enter" && connect()}
              autoFocus
            />
            {codeError && (
              <p className="text-yellow-300 font-display text-sm mb-4">😅 PIN inválido! Verifique com o apresentador.</p>
            )}
            <button
              onClick={connect}
              disabled={checking}
              className="w-full py-4 bg-white/20 backdrop-blur text-white font-display font-bold text-xl rounded-2xl border-2 border-white/30 hover:bg-white/30 transition-all disabled:opacity-50"
            >
              {checking ? "🔍 Validando..." : "🎬 Entrar"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-6" style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }}>
      <div className="text-center mb-6">
        <div className="inline-block bg-white/10 backdrop-blur rounded-full px-8 py-2 border-2 border-white/20">
          <p className="text-lg font-display text-white">🎮 AO VIVO — Partida {codigo}</p>
        </div>
      </div>

      {screen === "question" || screen === "answer" || screen === "wrong" || screen === "challenge" || screen === "timer" ? (
        <div className="flex justify-between items-start max-w-6xl mx-auto w-full mb-4 px-2">
          {teams.map((team, i) => (
            <div
              key={team.nome}
              className={`rounded-2xl px-6 py-3 text-center border-2 backdrop-blur transition-all duration-500 ${
                i === 0 ? "bg-blue-500/20 border-blue-300/30" : "bg-red-500/20 border-red-300/30"
              }`}
            >
              <h2 className="text-xl font-display font-bold" style={{ color: team.cor }}>
                {i === 0 ? "🔵" : "🔴"} {team.nome}
              </h2>
              <p className="text-4xl font-display font-bold text-white">{team.pontos}</p>
            </div>
          ))}
        </div>
      ) : screen !== "scoreboard" && screen !== "penalty" ? (
        <div className="grid grid-cols-2 gap-6 max-w-4xl mx-auto w-full mb-8">
          {teams.map((team, i) => (
            <div
              key={team.nome}
              className={`rounded-[2rem] p-8 text-center border-2 backdrop-blur transition-all duration-500 ${
                i === 0
                  ? "bg-blue-500/20 border-blue-300/30"
                  : "bg-red-500/20 border-red-300/30"
              }`}
            >
              <h2 className="text-3xl font-display font-bold mb-2" style={{ color: team.cor }}>
                {i === 0 ? "🔵" : "🔴"} {team.nome}
              </h2>
              <p className={`text-7xl font-display font-bold transition-all duration-500 ${
                screen === "pass" || screen === "repass" || screen === "pay"
                  ? "text-yellow-300 animate-pulse"
                  : "text-white"
              }`}>
                {team.pontos}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex-1 flex items-center justify-center max-w-5xl mx-auto w-full">
        {screen === "idle" && (
          <div className="text-center">
            <p className="text-8xl mb-6">🎮</p>
            <p className="text-4xl font-display font-bold text-white mb-4">Passa ou Repassa</p>
            <p className="text-2xl font-display text-white/50 animate-pulse">
              ⏳ Aguardando apresentador...
            </p>
          </div>
        )}

        {(screen === "question" || screen === "answer" || screen === "wrong") && question && (
          <div className="w-full bg-white/10 backdrop-blur rounded-[2rem] p-10 border-2 border-white/20 text-center relative">
            {timerActive && (
              <div className="absolute top-4 right-4 z-10">
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 42}`}
                      strokeDashoffset={`${2 * Math.PI * 42 * (1 - timerRemaining / timerTotal)}`}
                      strokeLinecap="round" className="transition-all duration-1000" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-3xl font-display font-bold text-white drop-shadow-lg">
                    {timerRemaining}
                  </span>
                </div>
              </div>
            )}
            <div className="flex gap-3 justify-center mb-6 flex-wrap">
              <span className="px-5 py-2 rounded-full bg-teal/20 text-teal-300 font-display text-lg">
                📂 {question.categoria}
              </span>
              <span className={`px-5 py-2 rounded-full font-display text-lg ${
                 question.nivel === "Fácil" ? "bg-green-500/20 text-green-300" :
                question.nivel === "Médio" ? "bg-yellow-500/20 text-yellow-300" :
                question.nivel === "Difícil" ? "bg-red-500/20 text-red-300" :
                "bg-purple-500/20 text-purple-300"
              }`}>
                🎯 {question.nivel}
              </span>
              <span className="px-5 py-2 rounded-full bg-orange-500/20 text-orange-300 font-display text-lg">
                ⭐ {question.pontos} pts
              </span>
            </div>
            <p className="text-4xl font-display font-bold text-white mb-10 leading-relaxed">
              {question.pergunta}
            </p>
            {(screen === "answer" || screen === "wrong") && (
              <div className={`rounded-2xl p-6 border-2 animate-bounceIn ${
                screen === "wrong"
                  ? "bg-red-500/20 border-red-400/40"
                  : "bg-teal/10 border-teal/30"
              }`}>
                {screen === "wrong" ? (
                  <p className="font-display text-red-300 text-3xl mb-2">❌ Errou!</p>
                ) : resultInfo ? (
                  <p className="font-display text-teal-300 text-3xl mb-2">
                    ✅ {resultInfo.team} acertou! +{resultInfo.pontos} pts
                  </p>
                ) : (
                  <p className="font-display text-teal-300 text-2xl mb-2">✅ Resposta:</p>
                )}
                <p className={`text-5xl font-display font-bold ${
                  screen === "wrong" ? "text-red-200" : "text-teal-200"
                }`}>
                  {question.resposta}
                </p>
              </div>
            )}
          </div>
        )}

        {screen === "challenge" && challenge && (
          <div className="w-full bg-white/10 backdrop-blur rounded-[2rem] p-10 border-2 border-white/20 text-center">
            <div className="flex gap-3 justify-center mb-6 flex-wrap">
              <span className="px-5 py-2 rounded-full bg-lavender/20 text-purple-300 font-display text-lg">
                📂 {challenge.categoria}
              </span>
              <span className={`px-5 py-2 rounded-full font-display text-lg ${
                 challenge.nivel === "Fácil" ? "bg-green-500/20 text-green-300" :
                challenge.nivel === "Médio" ? "bg-yellow-500/20 text-yellow-300" :
                challenge.nivel === "Difícil" ? "bg-red-500/20 text-red-300" :
                "bg-purple-500/20 text-purple-300"
              }`}>
                🎯 {challenge.nivel}
              </span>
              <span className="px-5 py-2 rounded-full bg-orange-500/20 text-orange-300 font-display text-lg">
                ⏱️ {challenge.tempo}
              </span>
            </div>
            <p className="text-5xl font-display font-bold text-white mb-4">
              🎪 {challenge.nome}
            </p>
            <p className="text-2xl font-display text-white/70 mb-8">{challenge.descricao}</p>
            <div className="bg-orange-500/10 rounded-2xl p-6 border-2 border-orange-500/30">
              <p className="font-display text-orange-300 text-xl mb-2">📋 Instrução:</p>
              <p className="text-2xl font-body text-white/80 leading-relaxed">{challenge.instrucao}</p>
            </div>
          </div>
        )}

        {screen === "timer" && (
          <div className="text-center">
            {challenge && (
              <p className="text-2xl font-display text-white/80 mb-4">🎪 {challenge.nome}</p>
            )}
            <div className="relative inline-flex items-center justify-center mb-4">
              <svg className="w-64 h-64 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - timerRemaining / timerTotal)}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <span className="absolute text-8xl font-display font-bold text-white drop-shadow-lg">
                {timerRemaining}
              </span>
            </div>
            <p className="text-3xl font-display text-white/50 animate-pulse">⏱️ Cronômetro</p>
          </div>
        )}

        {(screen === "pass" || screen === "repass") && (
          <div className="text-center w-full max-w-4xl mx-auto">
            {currentQuizInfo && (
              <div className="bg-white/10 backdrop-blur rounded-[2rem] p-6 border-2 border-white/20 mb-6">
                <p className="text-2xl font-display font-bold text-white mb-4 leading-relaxed">
                  {currentQuizInfo.pergunta}
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <span className="px-4 py-2 rounded-full bg-red-500/30 text-red-300 font-display text-lg relative">
                    <span className="line-through decoration-2 decoration-red-400">⭐ {currentQuizInfo.originalPontos} pts</span>
                  </span>
                  <span className="px-4 py-2 rounded-full bg-teal/20 text-teal-300 font-display text-lg animate-pulse">
                    ⭐ VALENDO {currentQuizInfo.currentPontos} pts
                  </span>
                </div>
              </div>
            )}
            <p className="text-9xl mb-6 animate-bounce">{screen === "pass" ? "🔁" : "↩️"}</p>
            <p className="text-7xl font-display font-bold text-yellow-300 animate-pulse">
              {screen === "pass" ? "PASSA!" : "REPASSA!"}
            </p>
            {passRepassInfo?.teamName && (
              <p className="text-3xl font-display text-white/70 mt-4">
                {screen === "pass"
                  ? `${passRepassInfo.teamName} responde por ${passRepassInfo.pontos} pts`
                  : `Volta para ${passRepassInfo.teamName} — ${passRepassInfo.pontos} pts`}
              </p>
            )}
          </div>
        )}

        {screen === "pay" && (
          <div className="text-center w-full max-w-4xl mx-auto">
            {currentQuizInfo && (
              <div className="bg-white/10 backdrop-blur rounded-[2rem] p-6 border-2 border-white/20 mb-6">
                <p className="text-2xl font-display font-bold text-white mb-4 leading-relaxed">
                  {currentQuizInfo.pergunta}
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <span className="px-4 py-2 rounded-full bg-red-500/30 text-red-300 font-display text-lg relative">
                    <span className="line-through decoration-2 decoration-red-400">⭐ {currentQuizInfo.originalPontos} pts</span>
                  </span>
                  <span className="px-4 py-2 rounded-full bg-teal/20 text-teal-300 font-display text-lg animate-pulse">
                    ⭐ VALENDO {passRepassInfo?.pontos ?? currentQuizInfo.currentPontos} pts
                  </span>
                </div>
              </div>
            )}
            <p className="text-9xl mb-6 animate-bounce">💰</p>
            <p className="text-7xl font-display font-bold text-yellow-300 animate-pulse">PAGA!</p>
            {passRepassInfo?.teamName && (
              <p className="text-3xl font-display text-white/70 mt-4">
                {passRepassInfo.teamName} — {passRepassInfo.pontos} pts
              </p>
            )}
          </div>
        )}

        {screen === "challenge_result" && (
          <div className="text-center">
            <p className="text-8xl mb-6">{challengeResult?.success ? "✅" : "❌"}</p>
            {challengeResult?.success ? (
              <p className="text-5xl font-display font-bold text-teal-300 mb-4">
                {challengeResult.teamName} completou a prova!<br />
                <span className="text-4xl text-teal-200">+{challengeResult.pontos} pts</span>
              </p>
            ) : (
              <p className="text-5xl font-display font-bold text-red-300 mb-4">
                {challengeResult?.teamName} não completou a prova<br />
                <span className="text-4xl text-red-200">0 pts</span>
              </p>
            )}
          </div>
        )}

        {screen === "scoreboard" && (
          <div className="text-center w-full max-w-4xl mx-auto">
            <p className="text-7xl mb-6">🏆</p>
            <p className="text-5xl font-display font-bold text-white mb-10">PLACAR</p>
            <div className="grid grid-cols-2 gap-10 max-w-3xl mx-auto">
              {teams.map((team, i) => (
                <div
                  key={team.nome}
                  className={`rounded-[2rem] p-10 backdrop-blur border-2 ${
                    i === 0 ? "bg-blue-500/20 border-blue-300/30" : "bg-red-500/20 border-red-300/30"
                  }`}
                >
                  <h2 className="text-4xl font-display font-bold mb-4" style={{ color: team.cor }}>
                    {i === 0 ? "🔵" : "🔴"} {team.nome}
                  </h2>
                  <p className="text-8xl font-display font-bold text-white">{team.pontos}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {screen === "penalty" && penaltyInfo && (
          <div className="text-center animate-bounceIn">
            <p className="text-8xl mb-6">⚠️</p>
            <p className="text-6xl font-display font-bold text-red-400 mb-4">PENALIZAÇÃO</p>
            <p className="text-5xl font-display font-bold text-white mb-4">
              {penaltyInfo.teamName}
            </p>
            <p className="text-6xl font-display font-bold text-red-400">
              -{penaltyInfo.pontos} pts
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
