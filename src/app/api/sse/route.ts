import { subscribe } from "@/lib/sse-store";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const codigo = searchParams.get("codigo");

  if (!codigo || codigo.length < 4) {
    return new Response("Missing or invalid codigo", { status: 400 });
  }

  const game = await prisma.game.findUnique({ where: { codigo } });
  if (!game) {
    return new Response("Game not found", { status: 404 });
  }

  let keepAlive: ReturnType<typeof setInterval> | undefined;
  let cleanup: (() => void) | undefined;

  const stream = new ReadableStream({
    start(controller) {
      cleanup = subscribe(codigo, controller);
      keepAlive = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(":keepalive\n\n"));
        } catch {
          clearInterval(keepAlive);
          cleanup?.();
        }
      }, 15000);
    },
    cancel() {
      clearInterval(keepAlive);
      cleanup?.();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
