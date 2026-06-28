import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "100");
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (search) where.nome = { contains: search };

  const [challenges, total] = await Promise.all([
    prisma.challenge.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
    prisma.challenge.count({ where }),
  ]);

  return NextResponse.json({ challenges, total, page, totalPages: Math.ceil(total / limit) });
}
