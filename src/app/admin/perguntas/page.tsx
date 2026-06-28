/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Question {
  id: number;
  pergunta: string;
  resposta: string;
  categoria: string;
  nivel: string;
  pontos: number;
}

export default function PerguntasPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("");
  const [nivel, setNivel] = useState("");
  const [loading, setLoading] = useState(true);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");

  const totalPages = Math.ceil(total / 20);

  async function loadQuestions() {
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);
    if (categoria) params.set("categoria", categoria);
    if (nivel) params.set("nivel", nivel);

    const res = await fetch(`/api/admin/perguntas?${params}`);
    const data = await res.json();
    setQuestions(data.questions || []);
    setTotal(data.total || 0);
    setLoading(false);
  }

  useEffect(() => {
    loadQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, categoria, nivel]);

  async function handleDelete(id: number) {
    if (!confirm("Tem certeza que deseja excluir essa pergunta?")) return;
    const res = await fetch(`/api/admin/perguntas/${id}`, { method: "DELETE" });
    if (res.ok) loadQuestions();
  }

  async function handleImport() {
    try {
      const linhas = importText.trim().split("\n");
      const cabecalho = linhas[0].toLowerCase();
      const ehCsv = cabecalho.includes("pergunta");

      for (let i = 1; i < linhas.length; i++) {
        const linha = linhas[i].trim();
        if (!linha) continue;

        let parts: string[];
        if (ehCsv) {
          parts = linha.split(",");
        } else {
          try {
            const obj = JSON.parse(linha);
            parts = [obj.pergunta, obj.resposta, obj.categoria, obj.nivel, String(obj.pontos)];
          } catch {
            continue;
          }
        }

        if (parts.length >= 4) {
          await fetch("/api/admin/perguntas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              pergunta: parts[0].trim(),
              resposta: parts[1].trim(),
              categoria: parts[2]?.trim() || "Geral",
              nivel: parts[3]?.trim() || "Médio",
              pontos: parseInt(parts[4]?.trim()) || 10,
            }),
          });
        }
      }
      setShowImport(false);
      setImportText("");
      loadQuestions();
    } catch {
      alert("Erro ao importar");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-display font-bold text-zinc-800">❓ Perguntas</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowImport(!showImport)}
            className="btn-fun px-5 py-3 bg-white text-zinc-600 border-zinc-300 hover:border-zinc-400"
          >
            📥 Importar
          </button>
          <Link
            href="/admin/perguntas/novo"
            className="btn-fun px-5 py-3 bg-coral text-white border-coral/80 hover:bg-coral/90"
          >
            ✨ Nova Pergunta
          </Link>
        </div>
      </div>

      {showImport && (
        <div className="mb-6 p-6 bg-white rounded-[2rem] shadow-lg border-2 border-teal/30">
          <h3 className="text-xl font-display font-bold text-teal mb-2">📥 Importar Perguntas</h3>
          <p className="text-zinc-500 font-body text-sm mb-3">
            Cole CSV ou JSON. Formato: <code className="bg-orange-100 px-2 rounded">pergunta,resposta,categoria,nivel,pontos</code>
          </p>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            className="w-full h-32 rounded-xl bg-orange-50 text-zinc-800 p-4 border-2 border-orange-200 font-body mb-3"
            placeholder="pergunta,resposta,categoria,nivel,pontos"
          />
          <button
            onClick={handleImport}
            className="btn-fun px-5 py-3 bg-teal text-white border-teal/80 hover:bg-teal/90"
          >
            📤 Importar
          </button>
        </div>
      )}

      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="🔍 Buscar perguntas..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 min-w-[200px] px-4 py-3 rounded-xl bg-white text-zinc-800 border-2 border-orange-200 focus:border-coral focus:outline-none font-body"
        />
        <select
          value={categoria}
          onChange={(e) => { setCategoria(e.target.value); setPage(1); }}
          className="px-4 py-3 rounded-xl bg-white text-zinc-800 border-2 border-orange-200 font-body"
        >
          <option value="">📂 Todas</option>
          <option value="Ciências">🔬 Ciências</option>
          <option value="História">📜 História</option>
          <option value="Geografia">🌍 Geografia</option>
          <option value="Matemática">➗ Matemática</option>
          <option value="Português">📖 Português</option>
          <option value="Cultura Geral">🌎 Cultura Geral</option>
          <option value="Esportes">⚽ Esportes</option>
          <option value="Entretenimento">🎬 Entretenimento</option>
        </select>
        <select
          value={nivel}
          onChange={(e) => { setNivel(e.target.value); setPage(1); }}
          className="px-4 py-3 rounded-xl bg-white text-zinc-800 border-2 border-orange-200 font-body"
        >
          <option value="">🎯 Todos</option>
          <option value="Fácil">😊 Fácil</option>
          <option value="Médio">🤔 Médio</option>
          <option value="Difícil">😈 Difícil</option>
          <option value="Épico">🌟 Épico</option>
        </select>
      </div>

      <div className="bg-white rounded-[2rem] shadow-lg border-2 border-orange-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center font-display text-teal text-xl animate-bounce">🎪 Carregando...</div>
        ) : questions.length === 0 ? (
          <div className="p-12 text-center font-display text-zinc-400 text-xl">📭 Nenhuma pergunta encontrada</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-orange-100 bg-orange-50">
                  <th className="p-4 font-display text-zinc-500 text-left">Pergunta</th>
                  <th className="p-4 font-display text-zinc-500 text-left">Resposta</th>
                  <th className="p-4 font-display text-zinc-500 text-left">Categoria</th>
                  <th className="p-4 font-display text-zinc-500 text-left">Nível</th>
                  <th className="p-4 font-display text-zinc-500 text-left">Pontos</th>
                  <th className="p-4 font-display text-zinc-500 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q) => (
                  <tr key={q.id} className="border-b border-orange-50 hover:bg-orange-50/50 transition-colors">
                    <td className="p-4 font-body text-zinc-700">{q.pergunta}</td>
                    <td className="p-4 font-body text-zinc-500">{q.resposta}</td>
                    <td className="p-4">
                      <span className="inline-block px-3 py-1 rounded-full bg-teal/10 text-teal font-display text-sm">
                        {q.categoria}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-3 py-1 rounded-full font-display text-sm ${
                        q.nivel === "Fácil" ? "bg-green-100 text-green-600" :
                        q.nivel === "Médio" ? "bg-yellow-100 text-yellow-600" :
                        q.nivel === "Difícil" ? "bg-red-100 text-red-600" :
                        "bg-purple-100 text-purple-600"
                      }`}>
                        {q.nivel}
                      </span>
                    </td>
                    <td className="p-4 font-display font-bold text-coral">{q.pontos}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/perguntas/novo?id=${q.id}`}
                          className="btn-fun px-4 py-2 bg-teal text-white border-teal/80 text-sm"
                        >
                          ✏️ Editar
                        </Link>
                        <button
                          onClick={() => handleDelete(q.id)}
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
          <span className="font-display text-zinc-500">
            {page} de {totalPages}
          </span>
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
