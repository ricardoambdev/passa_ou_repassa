"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface DashboardData {
  totalPerguntas: number;
  totalProvas: number;
  partidasRealizadas: number;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [perguntasRes, provasRes, gamesRes] = await Promise.all([
          fetch("/api/admin/perguntas?limit=1"),
          fetch("/api/admin/provas?limit=1"),
          fetch("/api/admin/games"),
        ]);
        const perguntas = await perguntasRes.json();
        const provas = await provasRes.json();
        const games = gamesRes.ok ? await gamesRes.json() : { total: 0 };

        setData({
          totalPerguntas: perguntas.total || 0,
          totalProvas: provas.total || 0,
          partidasRealizadas: games.total || 0,
        });
      } catch {
        setData({ totalPerguntas: 0, totalProvas: 0, partidasRealizadas: 0 });
      }
    }
    load();
  }, []);

  const cards = [
    {
      title: "Perguntas",
      value: data?.totalPerguntas ?? "...",
      icon: "❓",
      bg: "bg-coral",
      link: "/admin/perguntas",
    },
    {
      title: "Provas do Paga",
      value: data?.totalProvas ?? "...",
      icon: "🎯",
      bg: "bg-teal",
      link: "/admin/provas",
    },
    {
      title: "Partidas",
      value: data?.partidasRealizadas ?? "...",
      icon: "🎮",
      bg: "bg-lavender",
      link: "#",
    },
  ];

  const menuItems = [
    { title: "Gerenciar Perguntas", desc: "Adicione, edite ou remova perguntas", link: "/admin/perguntas", icon: "❓", color: "border-coral/30 hover:border-coral/60" },
    { title: "Gerenciar Provas do Paga", desc: "Crie desafios divertidos", link: "/admin/provas", icon: "🎯", color: "border-teal/30 hover:border-teal/60" },
    { title: "Usuários Administradores", desc: "Gerencie quem pode acessar", link: "/admin/usuarios", icon: "👤", color: "border-lavender/30 hover:border-lavender/60" },
    { title: "Configurações", desc: "Ajustes do sistema", link: "#", icon: "⚙️", color: "border-salmon/30 hover:border-salmon/60" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-display font-bold text-zinc-800 mb-8">📊 Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.link}
            className="bg-white rounded-[2rem] shadow-lg border-2 border-transparent hover:shadow-xl transition-all p-6"
          >
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 ${card.bg} rounded-2xl flex items-center justify-center text-3xl shadow-md`}>
                {card.icon}
              </div>
              <div>
                <p className="font-display text-zinc-500 text-sm">{card.title}</p>
                <p className="text-4xl font-display font-bold text-zinc-800">{card.value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <h2 className="text-2xl font-display font-bold text-zinc-700 mb-4">🎪 Menu Rápido</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {menuItems.map((item) => (
          <Link
            key={item.title}
            href={item.link}
            className={`bg-white rounded-[2rem] shadow-lg border-2 ${item.color} transition-all p-6`}
          >
            <div className="flex items-center gap-4 mb-2">
              <span className="text-3xl">{item.icon}</span>
              <h3 className="text-xl font-display font-bold text-zinc-700">{item.title}</h3>
            </div>
            <p className="text-zinc-500 font-body ml-12">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
