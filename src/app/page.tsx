"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const [locked, setLocked] = useState(true);
  const [loading, setLoading] = useState(true);
  const [magicInput, setMagicInput] = useState("");
  const [magicError, setMagicError] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    fetch("/api/auth/check-magic")
      .then((res) => res.ok && setLocked(false))
      .finally(() => setLoading(false));
  }, []);

  async function checkMagic() {
    setChecking(true);
    setMagicError(false);
    try {
      const res = await fetch("/api/auth/check-magic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: magicInput }),
      });
      if (res.ok) {
        setLocked(false);
      } else {
        setMagicError(true);
      }
    } catch {
      setMagicError(true);
    }
    setChecking(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: "linear-gradient(135deg, #FFF5E6 0%, #FFE0B2 50%, #FFCC80 100%)"}}>
        <div className="text-2xl font-display text-coral animate-bounce">🎪 Carregando...</div>
      </div>
    );
  }

  if (locked) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: "linear-gradient(135deg, #FFF5E6 0%, #FFE0B2 50%, #FFCC80 100%)"}}>
        <div className="text-center max-w-md mx-4">
          <div className="bg-white rounded-[2rem] shadow-xl p-8 border-2 border-coral/30">
            <div className="text-7xl mb-6">🎮</div>
            <h1 className="text-4xl font-display font-bold text-coral mb-2">Passa ou Repassa</h1>
            <p className="text-zinc-500 font-display mb-2">Bem-vindo ao jogo!</p>
            <p className="text-zinc-400 text-sm font-body mb-6">Digite a palavra cabalística para acessar</p>
            <input
              type="text"
              value={magicInput}
              onChange={(e) => { setMagicInput(e.target.value); setMagicError(false); }}
              placeholder="**********"
              className="w-full text-center text-xl px-6 py-4 rounded-xl bg-orange-50 text-zinc-800 placeholder-zinc-300 border-2 border-coral/30 focus:border-coral/60 focus:outline-none font-body mb-4"
              onKeyDown={(e) => e.key === "Enter" && checkMagic()}
              autoFocus
            />
            {magicError && (
              <p className="text-red-500 font-display text-sm mb-4">😅 Palavra incorreta! Tente novamente.</p>
            )}
            <button
              onClick={checkMagic}
              disabled={checking}
              className="w-full py-4 bg-coral text-white font-display font-bold text-xl rounded-2xl border-b-4 border-coral/80 hover:bg-coral/90 transition-all active:border-b-0 active:translate-y-1 disabled:opacity-50"
            >
              {checking ? "🔍 Verificando..." : "🚀 Entrar"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col" style={{background: "linear-gradient(135deg, #FFF5E6 0%, #FFE0B2 50%, #FFCC80 100%)"}}>
      <header className="p-6">
        <nav className="flex items-center justify-between max-w-6xl mx-auto">
          <h1 className="text-3xl font-display font-bold text-coral drop-shadow-sm">
            🎮 Passa ou Repassa
          </h1>
          <div className="flex gap-3">
            <Link
              href="/apresentador"
              className="btn-fun px-6 py-3 bg-teal text-white border-teal/80 hover:bg-teal/90 text-lg"
            >
              🎤 Apresentador
            </Link>
            <Link
              href="/telao"
              target="_blank"
              className="btn-fun px-6 py-3 bg-sunny text-zinc-800 border-amber-400 hover:bg-sunny/90 text-lg"
            >
              📺 Telão
            </Link>
            <Link
              href="/admin"
              className="btn-fun px-6 py-3 bg-lavender text-white border-purple-400/80 hover:bg-lavender/90 text-lg"
            >
              ⚙️ Admin
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-12">
        <div className="max-w-4xl">
          <div className="inline-block bg-white/80 backdrop-blur rounded-full px-8 py-3 mb-8 shadow-md border-2 border-sunny">
            <p className="text-lg font-display text-coral">🏫 Escola Divertida</p>
          </div>

          <h2 className="text-7xl font-display font-bold text-zinc-800 mb-4 leading-tight">
            Bem-vindo ao
          </h2>
          <h2 className="text-7xl font-display font-bold mb-8 leading-tight">
            <span className="text-coral">Passa</span>{" "}
            <span className="text-teal">ou</span>{" "}
            <span className="text-lavender">Repassa</span>
          </h2>

          <p className="text-xl text-zinc-600 mb-12 max-w-2xl mx-auto leading-relaxed font-body">
            A plataforma mais divertida para gincanas, competições e festas na escola!
            <br />
            <span className="font-display text-coral">Perguntas, provas e muita diversão!</span>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Link
              href="/apresentador"
              className="card-fun border-coral/30 hover:border-coral/60 hover:shadow-xl hover:-translate-y-1 transition-all group p-8"
            >
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform inline-block">🎤</div>
              <h3 className="text-2xl font-display font-bold text-coral mb-2">
                Apresentador
              </h3>
              <p className="text-zinc-500 font-body">
                Controle o jogo, sorteie perguntas e desafios
              </p>
            </Link>

            <Link
              href="/telao"
              target="_blank"
              className="card-fun border-teal/30 hover:border-teal/60 hover:shadow-xl hover:-translate-y-1 transition-all group p-8"
            >
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform inline-block">📺</div>
              <h3 className="text-2xl font-display font-bold text-teal mb-2">
                Telão
              </h3>
              <p className="text-zinc-500 font-body">
                Tela gigante para todos acompanharem
              </p>
            </Link>

            <Link
              href="/admin"
              className="card-fun border-lavender/30 hover:border-lavender/60 hover:shadow-xl hover:-translate-y-1 transition-all group p-8"
            >
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform inline-block">⚙️</div>
              <h3 className="text-2xl font-display font-bold text-lavender mb-2">
                Administrativo
              </h3>
              <p className="text-zinc-500 font-body">
                Gerencie perguntas, provas e equipes
              </p>
            </Link>
          </div>
        </div>
      </main>

      <footer className="p-6 text-center font-body text-zinc-400 text-sm">
        🎉 Passa ou Repassa Web &copy; {new Date().getFullYear()} — A diversão é garantida!
      </footer>
    </div>
  );
}
