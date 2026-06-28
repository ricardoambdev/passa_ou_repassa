import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { word } = await request.json();
  const magicWord = process.env.MAGIC_WORD || "parangaricutirimirruaru";

  if (word?.toLowerCase() !== magicWord.toLowerCase()) {
    return NextResponse.json({ ok: false, error: "Palavra incorreta" }, { status: 401 });
  }

  const token = Buffer.from(`magic:${Date.now()}:${magicWord}`).toString("base64");
  const res = NextResponse.json({ ok: true });
  res.cookies.set("magic_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });
  return res;
}

export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").filter(Boolean).map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k, v.join("=")];
    })
  );
  const token = cookies["magic_token"];
  if (!token) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }

  const magicWord = process.env.MAGIC_WORD || "parangaricutirimirruaru";
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    if (decoded.endsWith(magicWord)) {
      return NextResponse.json({ valid: true });
    }
  } catch {}
  return NextResponse.json({ valid: false }, { status: 401 });
}
