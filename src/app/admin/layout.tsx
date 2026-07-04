"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ nome: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then((data) => setUser(data.user))
      .catch(() => router.push("/admin/login"))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  if (pathname.startsWith("/admin/login")) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: "linear-gradient(135deg, #FFF5E6 0%, #FFE0B2 50%, #FFCC80 100%)"}}>
        <div className="text-2xl font-display text-coral animate-bounce">
          🎪 Carregando...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: "linear-gradient(135deg, #FFF5E6 0%, #FFE0B2 50%, #FFCC80 100%)"}}>
        <div className="text-center">
          <div className="text-2xl font-display text-zinc-500">🔁 Redirecionando...</div>
        </div>
      </div>
    );
  }

  const links = [
    { href: "/admin", label: "Dashboard", icon: "📊", color: "text-coral border-coral/30 hover:bg-coral/10" },
    { href: "/admin/perguntas", label: "Perguntas", icon: "❓", color: "text-teal border-teal/30 hover:bg-teal/10" },
    { href: "/admin/provas", label: "Provas", icon: "🎯", color: "text-salmon border-salmon/30 hover:bg-salmon/10" },
    { href: "/admin/usuarios", label: "Usuários", icon: "👤", color: "text-lavender border-lavender/30 hover:bg-lavender/10" },
    { href: "/admin/configuracoes", label: "Configurações", icon: "⚙️", color: "text-salmon border-salmon/30 hover:bg-salmon/10" },
  ];

  return (
    <div className="min-h-screen flex" style={{background: "linear-gradient(135deg, #FFF5E6 0%, #FFE0B2 50%, #FFCC80 100%)"}}>
      <aside className="w-64 bg-white/90 backdrop-blur border-r-2 border-sunny flex flex-col shrink-0">
        <div className="p-6 border-b-2 border-sunny">
          <h2 className="font-display font-bold text-coral text-xl">🎮 Passa ou Repassa</h2>
          <p className="text-zinc-500 font-display text-sm mt-1">Olá, {user.nome}! 👋</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {links.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-display text-lg transition-all border-2 ${
                  isActive
                    ? "bg-white shadow-md " + link.color
                    : "text-zinc-500 border-transparent hover:border-zinc-200"
                }`}
              >
                <span className="text-2xl">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t-2 border-sunny">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-zinc-400 hover:text-coral transition-all w-full px-4 py-3 rounded-2xl font-display"
          >
            🚪 Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
