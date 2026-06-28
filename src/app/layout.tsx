import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Passa ou Repassa",
  description: "O jogo mais divertido da escola!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${fredoka.variable} ${nunito.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <footer className="p-4 text-center font-body text-zinc-400 text-xs border-t border-zinc-200/50 bg-white/40">
          Criado por{" "}
          <a href="https://ricardoamb.github.io" target="_blank" rel="noopener noreferrer" className="text-coral hover:text-teal transition-colors">
            Ricardo Amb
          </a>
        </footer>
      </body>
    </html>
  );
}
