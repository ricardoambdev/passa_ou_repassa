import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const config = await prisma.systemConfig.findUnique({ where: { key: "magic_word" } });
  return NextResponse.json({ word: config?.value || "parangaricutirimirruaru" });
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { word } = await request.json();
  if (!word || typeof word !== "string" || word.trim().length < 3) {
    return NextResponse.json({ error: "Palavra deve ter pelo menos 3 caracteres" }, { status: 400 });
  }

  await prisma.systemConfig.upsert({
    where: { key: "magic_word" },
    update: { value: word.trim() },
    create: { key: "magic_word", value: word.trim() },
  });

  return NextResponse.json({ ok: true });
}
