/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";

interface User {
  id: number;
  nome: string;
  email: string;
  createdAt: string;
}

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nome: "", email: "", password: "" });

  const loadUsers = async () => {
    const res = await fetch("/api/admin/usuarios");
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setShowForm(false);
      setForm({ nome: "", email: "", password: "" });
      loadUsers();
    } else {
      const data = await res.json();
      alert(data.error || "Erro ao criar");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Excluir este usuário?")) return;
    const res = await fetch(`/api/admin/usuarios/${id}`, { method: "DELETE" });
    if (res.ok) loadUsers();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-display font-bold text-zinc-800">👤 Usuários</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-fun px-5 py-3 bg-lavender text-white border-lavender/80 hover:bg-lavender/90"
        >
          ✨ Novo Usuário
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-6 bg-white rounded-[2rem] shadow-lg border-2 border-lavender/30">
          <h3 className="text-xl font-display font-bold text-lavender mb-4">👤 Novo Administrador</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <input
              type="text"
              placeholder="Nome"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-orange-50 text-zinc-800 border-2 border-orange-200 focus:border-lavender focus:outline-none font-body"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-orange-50 text-zinc-800 border-2 border-orange-200 focus:border-lavender focus:outline-none font-body"
              required
            />
            <input
              type="password"
              placeholder="Senha"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-orange-50 text-zinc-800 border-2 border-orange-200 focus:border-lavender focus:outline-none font-body"
              required
            />
            <div className="flex gap-3">
              <button type="submit" className="btn-fun px-5 py-3 bg-teal text-white border-teal/80">
                ✅ Criar
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-fun px-5 py-3 bg-white text-zinc-600 border-zinc-300">
                ↩️ Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-[2rem] shadow-lg border-2 border-orange-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center font-display text-teal text-xl animate-bounce">🎪 Carregando...</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center font-display text-zinc-400 text-xl">📭 Nenhum usuário</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-orange-100 bg-orange-50">
                  <th className="p-4 font-display text-zinc-500 text-left">Nome</th>
                  <th className="p-4 font-display text-zinc-500 text-left">Email</th>
                  <th className="p-4 font-display text-zinc-500 text-left">Criado em</th>
                  <th className="p-4 font-display text-zinc-500 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-orange-50">
                    <td className="p-4 font-body text-zinc-700">{u.nome}</td>
                    <td className="p-4 font-body text-zinc-500">{u.email}</td>
                    <td className="p-4 font-body text-zinc-400 text-sm">
                      {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="btn-fun px-4 py-2 bg-salmon text-white border-salmon/80 text-sm"
                      >
                        🗑️ Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
