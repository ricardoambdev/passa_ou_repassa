## Summary

### Completed
- All pages redesigned with cartoon theme: Home, Apresentador, Telão, Admin login/layout/dashboard, CRUDs (perguntas, provas, usuarios), Configurações (team customization, max 2 teams).
- SSE infrastructure: client store, GET /api/sse, POST /api/game/action.
- Full game flow: response → pass → repass → paga (challenge) with stage buttons.
- 524 questions across 8 categories (Fácil=10/Médio=20/Difícil=30/Épico=50pts).
- 100 challenges seeded.
- Sound system: 12 WAV files, useSounds hook.
- Timer: question timer (inline circle), challenge timer (fullscreen + loop sound).
- Repassa auto-dismiss (5s), Pass auto-dismiss (3s), Challenge result auto-dismiss (4s) on telão.
- Answer always visible on apresentador.
- New question flow: 2 teams interleaved, half original pontos on pass/repass/paga (not fixed 15), wrong = 0.
- CHALLENGE_RESULT event, "Prova realizada"/"Prova não realizada" buttons, telão display.
- Challenge timer shows small team name on telão.
- Lint + build pass with 0 errors.
- **Scoreboard between questions**: apresentador shows 10s countdown, sends SCOREBOARD event, telão displays big placar.
- **Corner scores**: during questions/answers/challenges on telão, team scores shown in compact top corners.

### In Progress
- Nada no momento.

### Key Decisions
- JWT auth (jose + bcryptjs) for admin only; no session/auth required for apresentador or telão.
- SSE rather than WebSockets: one-way broadcast to all telões, actions via POST.
- Points stay at half of original (Fácil=5, Médio=10, Difícil=15, Épico=25) regardless of pass/repass/paga stage.
- Prisma + SQLite for local dev simplicity.
- Telão uses playSound on event, apresentador has manual sound buttons.
- Question stage flow always interleaves teams: first unanswered team gets next turn, respect done flag.

### Known Issues
- No persistent SSE reconnection (browser native EventSource automatically retries).
- No push notifications for wrong/challenge events on apresentador (must refresh manually via "Atualizar" button).
- Seed data is static; no admin UI to edit challenges yet.

### Critical Context
- Teams array is managed by the presenting flow, not by Prisma (no DB persistence for games).
- Points mapping: Fácil=10, Médio=20, Difícil=30, Épico=50.
- No auth middleware on /apresentador or /telao (public by design).
- Event types: INIT, QUESTION, ANSWER, WRONG, TIMER, CHALLENGE, CHALLENGE_RESULT, PASS, REPASS, PAY, SCOREBOARD, SCREEN_RESET, GAME_OVER.
- Sound events: score, game-over, tick, pass used on telão.

### Next Steps
- Nada pendente.
