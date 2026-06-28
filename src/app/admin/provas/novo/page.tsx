"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ChallengeFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    categoria: "Habilidade",
    tempo: "30 segundos",
    nivel: "Fácil",
    instrucao: "",
  });
  const [loading, setLoading] = useState(!!editId);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editId) {
      fetch(`/api/admin/provas/${editId}`)
        .then((res) => res.json())
        .then((data) => {
          setForm({
            nome: data.nome,
            descricao: data.descricao,
            categoria: data.categoria,
            tempo: data.tempo,
            nivel: data.nivel,
            instrucao: data.instrucao,
          });
        })
        .finally(() => setLoading(false));
    }
  }, [editId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const url = editId
      ? `/api/admin/provas/${editId}`
      : "/api/admin/provas";
    const method = editId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);

    if (res.ok) {
      router.push("/admin/provas");
    } else {
      const data = await res.json();
      alert(data.error || "Erro ao salvar");
    }
  }

  if (loading) {
    return <div className="text-center py-12 font-display text-teal text-xl animate-bounce">🎪 Carregando...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-display font-bold text-zinc-800 mb-8">
        {editId ? "✏️ Editar Prova" : "✨ Nova Prova do Paga"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-[2rem] shadow-lg border-2 border-orange-100 p-8">
        <div>
          <label className="block font-display text-zinc-600 mb-1">Nome da Prova</label>
          <input
            type="text"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-orange-50 text-zinc-800 border-2 border-orange-200 focus:border-salmon focus:outline-none font-body"
            required
          />
        </div>

        <div>
          <label className="block font-display text-zinc-600 mb-1">Descrição</label>
          <textarea
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-orange-50 text-zinc-800 border-2 border-orange-200 focus:border-salmon focus:outline-none font-body"
            rows={3}
            required
          />
        </div>

        <div>
          <label className="block font-display text-zinc-600 mb-1">Instrução</label>
          <textarea
            value={form.instrucao}
            onChange={(e) => setForm({ ...form, instrucao: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-orange-50 text-zinc-800 border-2 border-orange-200 focus:border-salmon focus:outline-none font-body"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block font-display text-zinc-600 mb-1">Categoria</label>
            <select
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-orange-50 text-zinc-800 border-2 border-orange-200 font-body"
            >
              <option value="Habilidade">🎪 Habilidade</option>
              <option value="Equilíbrio">⚖️ Equilíbrio</option>
              <option value="Memória">🧠 Memória</option>
              <option value="Conhecimento">📚 Conhecimento</option>
              <option value="Coordenação">🔄 Coordenação</option>
              <option value="Humor">😂 Humor</option>
            </select>
          </div>

          <div>
            <label className="block font-display text-zinc-600 mb-1">Tempo</label>
            <select
              value={form.tempo}
              onChange={(e) => setForm({ ...form, tempo: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-orange-50 text-zinc-800 border-2 border-orange-200 font-body"
            >
              <option value="15 segundos">⏱️ 15s</option>
              <option value="30 segundos">⏱️ 30s</option>
              <option value="45 segundos">⏱️ 45s</option>
              <option value="60 segundos">⏱️ 60s</option>
              <option value="90 segundos">⏱️ 90s</option>
              <option value="120 segundos">⏱️ 120s</option>
            </select>
          </div>

          <div>
            <label className="block font-display text-zinc-600 mb-1">Dificuldade</label>
            <select
              value={form.nivel}
              onChange={(e) => setForm({ ...form, nivel: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-orange-50 text-zinc-800 border-2 border-orange-200 font-body"
            >
              <option value="Fácil">😊 Fácil</option>
              <option value="Médio">🤔 Médio</option>
              <option value="Difícil">😈 Difícil</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="btn-fun px-8 py-3 bg-salmon text-white border-salmon/80 hover:bg-salmon/90 text-lg disabled:opacity-50"
          >
            {saving ? "💾 Salvando..." : "💾 Salvar"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-fun px-8 py-3 bg-white text-zinc-600 border-zinc-300 text-lg"
          >
            ↩️ Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
