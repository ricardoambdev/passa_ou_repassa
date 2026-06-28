import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const categoria = searchParams.get("categoria") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (search) where.nome = { contains: search };
  if (categoria) where.categoria = categoria;

  const [challenges, total] = await Promise.all([
    prisma.challenge.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.challenge.count({ where }),
  ]);

  return NextResponse.json({ challenges, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const challenge = await prisma.challenge.create({
      data: {
        nome: body.nome,
        descricao: body.descricao,
        categoria: body.categoria,
        tempo: body.tempo,
        nivel: body.nivel,
        instrucao: body.instrucao,
      },
    });
    return NextResponse.json(challenge, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao criar prova" }, { status: 400 });
  }
}
