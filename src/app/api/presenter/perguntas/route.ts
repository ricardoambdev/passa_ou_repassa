import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "100");
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (search) where.pergunta = { contains: search };

  const [questions, total] = await Promise.all([
    prisma.question.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
    prisma.question.count({ where }),
  ]);

  return NextResponse.json({ questions, total, page, totalPages: Math.ceil(total / limit) });
}
