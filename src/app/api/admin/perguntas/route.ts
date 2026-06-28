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
  const nivel = searchParams.get("nivel") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (search) where.pergunta = { contains: search };
  if (categoria) where.categoria = categoria;
  if (nivel) where.nivel = nivel;

  const [questions, total] = await Promise.all([
    prisma.question.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.question.count({ where }),
  ]);

  return NextResponse.json({ questions, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const question = await prisma.question.create({
      data: {
        pergunta: body.pergunta,
        resposta: body.resposta,
        categoria: body.categoria,
        nivel: body.nivel,
        pontos: parseInt(body.pontos),
      },
    });
    return NextResponse.json(question, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao criar pergunta" }, { status: 400 });
  }
}
