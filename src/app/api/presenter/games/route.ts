import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setGameState } from "@/lib/sse-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const codigo = searchParams.get("codigo");

  if (!codigo) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  const game = await prisma.game.findUnique({ where: { codigo } });

  return NextResponse.json({ valid: !!game, game: game ? { id: game.id, codigo: game.codigo } : null });
}

export async function POST() {
  try {
    const codigo = Math.random().toString(36).substring(2, 8).toUpperCase();

    const teamConfigs = await prisma.teamConfig.findMany({ orderBy: { ordem: "asc" } });

    const game = await prisma.game.create({
      data: {
        codigo,
        status: "active",
        teams: {
          create: teamConfigs.map((tc) => ({
            nome: tc.nome,
            cor: tc.cor,
            pontos: 0,
          })),
        },
      },
    });

    const teams = await prisma.team.findMany({ where: { gameId: game.id } });

    setGameState(codigo, {
      teams: teams.map((t) => ({ nome: t.nome, cor: t.cor, pontos: t.pontos })),
      currentScreen: "idle",
    });

    return NextResponse.json({ ...game, teams }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao criar partida" }, { status: 400 });
  }
}
