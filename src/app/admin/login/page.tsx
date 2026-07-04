"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao fazer login");
        return;
      }

      setRedirecting(true);
      setTimeout(() => { window.location.href = "/admin"; }, 2000);
    } catch {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{background: "linear-gradient(135deg, #FFF5E6 0%, #FFE0B2 50%, #FFCC80 100%)"}}>
      <div className="w-full max-w-md mx-4">
        <div className="bg-white rounded-[2rem] shadow-xl border-2 border-sunny p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🔐</div>
            <h1 className="text-3xl font-display font-bold text-coral">Passa ou Repassa</h1>
            <p className="text-zinc-500 font-display mt-1">Área Administrativa</p>
          </div>

          {redirecting ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4 animate-bounce">🎪</div>
              <p className="text-xl font-display text-coral">Redirecionando...</p>
              <p className="text-zinc-400 font-display text-sm mt-2">Aguarde um instante</p>
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-display text-zinc-600 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-orange-50 text-zinc-800 border-2 border-orange-200 focus:border-coral focus:outline-none font-body"
                placeholder="admin@jogo.com"
                required
              />
            </div>

            <div>
              <label className="block font-display text-zinc-600 mb-1">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-orange-50 text-zinc-800 border-2 border-orange-200 focus:border-coral focus:outline-none font-body"
                placeholder="********"
                required
              />
            </div>

            {error && (
              <div className="bg-red-100 text-red-600 px-4 py-3 rounded-xl font-display text-sm border-2 border-red-200">
                😅 {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-fun w-full py-4 bg-coral text-white border-coral/80 hover:bg-coral/90 text-xl disabled:opacity-50"
            >
              {loading ? "Entrando..." : "🎬 Entrar"}
            </button>
          </form>
          )}
        </div>
      </div>
    </div>
  );
}
