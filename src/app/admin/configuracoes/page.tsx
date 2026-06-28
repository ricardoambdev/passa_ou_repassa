"use client";

import { useEffect, useState } from "react";

interface TeamConfig {
  id?: number;
  nome: string;
  cor: string;
  ordem: number;
}

export default function ConfiguracoesPage() {
  const [teams, setTeams] = useState<TeamConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/team-config")
      .then((res) => res.json())
      .then((data) => setTeams(data.teams || []))
      .finally(() => setLoading(false));
  }, []);

  function updateTeam(index: number, field: keyof TeamConfig, value: string) {
    setTeams((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function addTeam() {
    if (teams.length >= 2) return;
    setTeams((prev) => [...prev, { nome: "", cor: "#000000", ordem: prev.length }]);
  }

  function removeTeam(index: number) {
    setTeams((prev) => prev.filter((_, i) => i !== index));
  }

  async function save() {
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/team-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teams: teams.map((t, i) => ({ ...t, ordem: i })),
        }),
      });
      if (res.ok) {
        setMsg("✅ Times salvos com sucesso!");
      } else {
        setMsg("😅 Erro ao salvar");
      }
    } catch {
      setMsg("😅 Erro de conexão");
    }
    setSaving(false);
    setTimeout(() => setMsg(""), 3000);
  }

  if (loading) {
    return <div className="text-2xl font-display text-zinc-400 animate-pulse">🎪 Carregando...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-display font-bold text-zinc-800 mb-8">⚙️ Configurações</h1>

      <div className="bg-white rounded-[2rem] shadow-lg border-2 border-zinc-200 p-8 max-w-2xl">
        <h2 className="text-2xl font-display font-bold text-zinc-700 mb-6">🎪 Times do Jogo</h2>
        <p className="text-zinc-500 font-body mb-6">
          Personalize os nomes e cores dos times que aparecerão ao criar uma nova partida.
        </p>

        <div className="space-y-4 mb-6">
          {teams.map((team, i) => (
            <div key={i} className="flex items-center gap-3 p-4 bg-orange-50 rounded-2xl border-2 border-orange-200">
              <span className="font-display text-zinc-400 text-sm w-6">{i + 1}.</span>
              <input
                type="color"
                value={team.cor}
                onChange={(e) => updateTeam(i, "cor", e.target.value)}
                className="w-10 h-10 rounded-xl border-2 border-zinc-200 cursor-pointer"
              />
              <input
                type="text"
                value={team.nome}
                onChange={(e) => updateTeam(i, "nome", e.target.value)}
                placeholder="Nome do time"
                className="flex-1 px-4 py-2 rounded-xl bg-white text-zinc-800 border-2 border-zinc-200 focus:border-coral focus:outline-none font-display"
              />
              <button
                onClick={() => removeTeam(i)}
                className="text-red-400 hover:text-red-600 transition-colors text-xl disabled:opacity-30 disabled:cursor-not-allowed"
                title="Remover time"
                disabled={teams.length <= 2}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mb-6">
          <button
            onClick={addTeam}
            className="btn-fun px-5 py-3 bg-white text-zinc-600 border-zinc-300 text-sm"
          >
            + Adicionar Time
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="btn-fun px-6 py-3 bg-teal text-white border-teal/80 text-sm disabled:opacity-50"
          >
            {saving ? "💾 Salvando..." : "💾 Salvar Times"}
          </button>
        </div>

        {msg && (
          <div className="bg-teal/10 text-teal px-4 py-3 rounded-xl font-display text-sm border-2 border-teal/30">
            {msg}
          </div>
        )}
      </div>
    </div>
  );
}
