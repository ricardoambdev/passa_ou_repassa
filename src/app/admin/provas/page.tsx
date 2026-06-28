/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Challenge {
  id: number;
  nome: string;
  descricao: string;
  categoria: string;
  tempo: string;
  nivel: string;
  instrucao: string;
}

export default function ProvasPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("");
  const [loading, setLoading] = useState(true);

  const totalPages = Math.ceil(total / 20);

  async function loadChallenges() {
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);
    if (categoria) params.set("categoria", categoria);

    const res = await fetch(`/api/admin/provas?${params}`);
    const data = await res.json();
    setChallenges(data.challenges || []);
    setTotal(data.total || 0);
    setLoading(false);
  }

  useEffect(() => {
    loadChallenges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, categoria]);

  async function handleDelete(id: number) {
    if (!confirm("Tem certeza que deseja excluir essa prova?")) return;
    const res = await fetch(`/api/admin/provas/${id}`, { method: "DELETE" });
    if (res.ok) loadChallenges();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-display font-bold text-zinc-800">🎯 Provas do Paga</h1>
        <Link
          href="/admin/provas/novo"
          className="btn-fun px-5 py-3 bg-salmon text-white border-salmon/80 hover:bg-salmon/90"
        >
          ✨ Nova Prova
        </Link>
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="🔍 Buscar provas..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 min-w-[200px] px-4 py-3 rounded-xl bg-white text-zinc-800 border-2 border-orange-200 focus:border-salmon focus:outline-none font-body"
        />
        <select
          value={categoria}
          onChange={(e) => { setCategoria(e.target.value); setPage(1); }}
          className="px-4 py-3 rounded-xl bg-white text-zinc-800 border-2 border-orange-200 font-body"
        >
          <option value="">📂 Todas</option>
          <option value="Habilidade">🎪 Habilidade</option>
          <option value="Equilíbrio">⚖️ Equilíbrio</option>
          <option value="Memória">🧠 Memória</option>
          <option value="Conhecimento">📚 Conhecimento</option>
          <option value="Coordenação">🔄 Coordenação</option>
          <option value="Humor">😂 Humor</option>
        </select>
      </div>

      <div className="bg-white rounded-[2rem] shadow-lg border-2 border-orange-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center font-display text-teal text-xl animate-bounce">🎪 Carregando...</div>
        ) : challenges.length === 0 ? (
          <div className="p-12 text-center font-display text-zinc-400 text-xl">📭 Nenhuma prova encontrada</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-orange-100 bg-orange-50">
                  <th className="p-4 font-display text-zinc-500 text-left">Nome</th>
                  <th className="p-4 font-display text-zinc-500 text-left">Descrição</th>
                  <th className="p-4 font-display text-zinc-500 text-left">Categoria</th>
                  <th className="p-4 font-display text-zinc-500 text-left">Tempo</th>
                  <th className="p-4 font-display text-zinc-500 text-left">Nível</th>
                  <th className="p-4 font-display text-zinc-500 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {challenges.map((c) => (
                  <tr key={c.id} className="border-b border-orange-50 hover:bg-orange-50/50 transition-colors">
                    <td className="p-4 font-body font-semibold text-zinc-700">{c.nome}</td>
                    <td className="p-4 font-body text-zinc-500 max-w-xs truncate">{c.descricao}</td>
                    <td className="p-4">
                      <span className="inline-block px-3 py-1 rounded-full bg-lavender/10 text-lavender font-display text-sm">
                        {c.categoria}
                      </span>
                    </td>
                    <td className="p-4 font-body text-zinc-500">{c.tempo}</td>
                    <td className="p-4">
                      <span className={`inline-block px-3 py-1 rounded-full font-display text-sm ${
                        c.nivel === "Fácil" ? "bg-green-100 text-green-600" :
                        c.nivel === "Médio" ? "bg-yellow-100 text-yellow-600" :
                        c.nivel === "Difícil" ? "bg-red-100 text-red-600" :
                        "bg-purple-100 text-purple-600"
                      }`}>
                        {c.nivel}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/provas/novo?id=${c.id}`}
                          className="btn-fun px-4 py-2 bg-teal text-white border-teal/80 text-sm"
                        >
                          ✏️ Editar
                        </Link>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="btn-fun px-4 py-2 bg-salmon text-white border-salmon/80 text-sm"
                        >
                          🗑️ Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-fun px-5 py-3 bg-white text-zinc-600 border-zinc-300 disabled:opacity-50"
          >
            ⬅️ Anterior
          </button>
          <span className="font-display text-zinc-500">{page} de {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn-fun px-5 py-3 bg-white text-zinc-600 border-zinc-300 disabled:opacity-50"
          >
            Próxima ➡️
          </button>
        </div>
      )}
    </div>
  );
}
