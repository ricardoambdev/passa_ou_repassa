export interface GameState {
  codigo: string;
  teams: { nome: string; cor: string; pontos: number }[];
  currentScreen: "idle" | "question" | "answer" | "wrong" | "challenge" | "pass" | "repass" | "pay" | "timer";
  currentQuestion?: {
    pergunta: string;
    resposta: string;
    categoria: string;
    nivel: string;
    pontos: number;
  };
  currentChallenge?: {
    nome: string;
    descricao: string;
    instrucao: string;
    categoria: string;
    nivel: string;
    tempo: string;
  };
}

const clientsByGame = new Map<string, Set<ReadableStreamDefaultController>>();
const gameStates = new Map<string, GameState>();
const encoder = new TextEncoder();

export function subscribe(
  gameCode: string,
  controller: ReadableStreamDefaultController
): () => void {
  if (!clientsByGame.has(gameCode)) {
    clientsByGame.set(gameCode, new Set());
  }
  clientsByGame.get(gameCode)!.add(controller);

  const state = gameStates.get(gameCode);
  if (state) {
    const init = `event: INIT\ndata: ${JSON.stringify(state)}\n\n`;
    try {
      controller.enqueue(encoder.encode(init));
    } catch {
      clientsByGame.get(gameCode)?.delete(controller);
    }
  }

  return () => {
    clientsByGame.get(gameCode)?.delete(controller);
    if (clientsByGame.get(gameCode)?.size === 0) {
      clientsByGame.delete(gameCode);
    }
  };
}

export function broadcast(gameCode: string, event: string, data: unknown) {
  const clients = clientsByGame.get(gameCode);
  if (!clients) return;
  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  const encoded = encoder.encode(message);
  for (const client of clients) {
    try {
      client.enqueue(encoded);
    } catch {
      clients.delete(client);
    }
  }
}

export function setGameState(gameCode: string, partial: Partial<GameState>) {
  const existing = gameStates.get(gameCode) || {
    codigo: gameCode,
    teams: [],
    currentScreen: "idle",
  };
  const next: GameState = { ...existing, ...partial };
  gameStates.set(gameCode, next);
  return next;
}

export function getGameState(gameCode: string): GameState | undefined {
  return gameStates.get(gameCode);
}
