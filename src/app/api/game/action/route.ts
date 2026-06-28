import { NextResponse } from "next/server";
import { broadcast, setGameState, getGameState } from "@/lib/sse-store";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { gameCode, action, data } = body;

    if (!gameCode || !action) {
      return NextResponse.json({ error: "gameCode and action required" }, { status: 400 });
    }

    const game = await prisma.game.findUnique({ where: { codigo: gameCode } });
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    await prisma.gameAction.create({
      data: {
        gameId: game.id,
        tipo: action,
        dados: JSON.stringify(data || {}),
      },
    });

    switch (action) {
      case "QUESTION": {
        setGameState(gameCode, {
          currentScreen: "question",
          currentQuestion: data,
          currentChallenge: undefined,
        });
        broadcast(gameCode, "QUESTION", data);
        break;
      }
      case "ANSWER": {
        setGameState(gameCode, { currentScreen: "answer" });
        broadcast(gameCode, "ANSWER", data);
        break;
      }
      case "CHALLENGE": {
        setGameState(gameCode, {
          currentScreen: "challenge",
          currentChallenge: data,
          currentQuestion: undefined,
        });
        broadcast(gameCode, "CHALLENGE", data);
        break;
      }
      case "SCORE": {
        const state = getGameState(gameCode);
        if (state) {
          const teams = state.teams.map((t) => {
            const update = data.teams?.find((u: { nome: string; pontos: number }) => u.nome === t.nome);
            return update ? { ...t, pontos: update.pontos } : t;
          });
          const updated = setGameState(gameCode, { teams });

          await prisma.team.updateMany({
            where: { game: { codigo: gameCode }, nome: data.teamName },
            data: { pontos: data.pontos },
          });

          broadcast(gameCode, "SCORE", { teams: updated.teams });
        }
        break;
      }
      case "PASS":
      case "REPASS":
      case "PAY": {
        broadcast(gameCode, action, data || {});
        break;
      }
      case "CORRECT": {
        setGameState(gameCode, { currentScreen: "answer" });
        broadcast(gameCode, "CORRECT", data || {});
        break;
      }
      case "WRONG": {
        setGameState(gameCode, { currentScreen: "wrong" });
        broadcast(gameCode, "WRONG", data || {});
        break;
      }
      case "TIMER_START": {
        setGameState(gameCode, { currentScreen: "timer" });
        broadcast(gameCode, "TIMER_START", data || {});
        break;
      }
      case "TIMER_STOP": {
        broadcast(gameCode, "TIMER_STOP", {});
        break;
      }
      case "SCREEN_RESET": {
        setGameState(gameCode, { currentScreen: "idle" });
        broadcast(gameCode, "SCREEN_RESET", {});
        break;
      }
      case "GAME_OVER": {
        setGameState(gameCode, { currentScreen: "idle" });
        await prisma.game.update({
          where: { codigo: gameCode },
          data: { status: "finished" },
        });
        broadcast(gameCode, "GAME_OVER", data || {});
        break;
      }
      case "SCOREBOARD": {
        broadcast(gameCode, "SCOREBOARD", data || {});
        break;
      }
      case "CHALLENGE_RESULT": {
        broadcast(gameCode, "CHALLENGE_RESULT", data || {});
        break;
      }
      case "PENALTY": {
        broadcast(gameCode, "PENALTY", data || {});
        break;
      }
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Game action error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
