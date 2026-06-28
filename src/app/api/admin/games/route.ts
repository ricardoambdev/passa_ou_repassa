import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const total = await prisma.game.count();
  return NextResponse.json({ total });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const codigo = Math.random().toString(36).substring(2, 8).toUpperCase();

    const game = await prisma.game.create({
      data: {
        codigo,
        status: body.status || "pending",
      },
    });

    return NextResponse.json(game, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao criar partida" }, { status: 400 });
  }
}
