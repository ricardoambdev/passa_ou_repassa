import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const teams = await prisma.teamConfig.findMany({ orderBy: { ordem: "asc" } });
  return NextResponse.json({ teams });
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { teams } = body as { teams: { id?: number; nome: string; cor: string; ordem: number }[] };

    await prisma.teamConfig.deleteMany();

    for (const team of teams) {
      await prisma.teamConfig.create({
        data: { nome: team.nome, cor: team.cor, ordem: team.ordem },
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro ao salvar times" }, { status: 400 });
  }
}
