"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function QuestionFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const [form, setForm] = useState({
    pergunta: "",
    resposta: "",
    categoria: "Cultura Geral",
    nivel: "Médio",
    pontos: "10",
  });
  const [loading, setLoading] = useState(!!editId);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editId) {
      fetch(`/api/admin/perguntas/${editId}`)
        .then((res) => res.json())
        .then((data) => {
          setForm({
            pergunta: data.pergunta,
            resposta: data.resposta,
            categoria: data.categoria,
            nivel: data.nivel,
            pontos: String(data.pontos),
          });
        })
        .finally(() => setLoading(false));
    }
  }, [editId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const url = editId
      ? `/api/admin/perguntas/${editId}`
      : "/api/admin/perguntas";
    const method = editId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);

    if (res.ok) {
      router.push("/admin/perguntas");
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
        {editId ? "✏️ Editar Pergunta" : "✨ Nova Pergunta"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-[2rem] shadow-lg border-2 border-orange-100 p-8">
        <div>
          <label className="block font-display text-zinc-600 mb-1">
            Pergunta
          </label>
          <textarea
            value={form.pergunta}
            onChange={(e) => setForm({ ...form, pergunta: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-orange-50 text-zinc-800 border-2 border-orange-200 focus:border-coral focus:outline-none font-body"
            rows={3}
            required
          />
        </div>

        <div>
          <label className="block font-display text-zinc-600 mb-1">
            Resposta Correta
          </label>
          <input
            type="text"
            value={form.resposta}
            onChange={(e) => setForm({ ...form, resposta: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-orange-50 text-zinc-800 border-2 border-orange-200 focus:border-coral focus:outline-none font-body"
            required
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
              <option value="Ciências">🔬 Ciências</option>
              <option value="História">📜 História</option>
              <option value="Geografia">🌍 Geografia</option>
              <option value="Matemática">➗ Matemática</option>
              <option value="Português">📖 Português</option>
              <option value="Cultura Geral">🌎 Cultura Geral</option>
              <option value="Esportes">⚽ Esportes</option>
              <option value="Entretenimento">🎬 Entretenimento</option>
            </select>
          </div>

          <div>
            <label className="block font-display text-zinc-600 mb-1">Nível</label>
            <select
              value={form.nivel}
              onChange={(e) => setForm({ ...form, nivel: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-orange-50 text-zinc-800 border-2 border-orange-200 font-body"
            >
              <option value="Fácil">😊 Fácil</option>
              <option value="Médio">🤔 Médio</option>
              <option value="Difícil">😈 Difícil</option>
              <option value="Épico">🌟 Épico</option>
            </select>
          </div>

          <div>
            <label className="block font-display text-zinc-600 mb-1">Pontos</label>
            <input
              type="number"
              value={form.pontos}
              onChange={(e) => setForm({ ...form, pontos: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-orange-50 text-zinc-800 border-2 border-orange-200 focus:border-coral focus:outline-none font-body"
              min="1"
              required
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="btn-fun px-8 py-3 bg-teal text-white border-teal/80 hover:bg-teal/90 text-lg disabled:opacity-50"
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
