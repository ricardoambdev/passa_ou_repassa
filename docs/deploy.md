# Deploy no Render + Turso

O Render (free tier) não suporta discos persistentes, então usamos **Turso** — SQLite na edge, grátis.

## 1. Criar banco no Turso

```bash
# Instalar CLI do Turso
npm install -g turso

# Logar
turso auth login

# Criar banco
turso db create passa-ou-repassa-db

# Pegar a URL de conexão
turso db show passa-ou-repassa-db --url

# Gerar token de autenticação
turso db tokens create passa-ou-repassa-db
```

Anote a URL (começa com `libsql://...`) e o token gerado.

## 2. Seed do banco

```bash
# Rodar localmente apontando pro Turso
DATABASE_URL="libsql://..." TURSO_AUTH_TOKEN="..." npx tsx prisma/seed.ts
```

## 3. Conectar o repositório no Render

1. Faça push do projeto para o GitHub
2. [Dashboard do Render](https://dashboard.render.com) → **New +** → **Blueprint**
3. Conecte seu GitHub e selecione o repositório
4. O Render lê o `render.yaml`

## 4. Preencher variáveis de ambiente

No Dashboard do Render, antes de aplicar:

| Variável | Valor |
|----------|-------|
| `DATABASE_URL` | URL do Turso (`libsql://...`) |
| `TURSO_AUTH_TOKEN` | Token gerado no Turso |
| `JWT_SECRET` | Qualquer string aleatória |

## 5. Aplicar

Clique **"Apply"**. O Render vai buildar e iniciar o servidor.

## 6. Primeiro acesso

1. Acessar `https://passa-ou-repassa.onrender.com/admin`
2. Login: `admin@jogo.com` / `admin123` (criado pelo seed)
3. Em Configurações, definir a Palavra Cabalística

## Importante

- O banco fica no Turso (nuvem), não no disco do Render
- Dados persistem mesmo resetando o deploy
- Plano gratuito do Turso: 500MB, 1 bucket, sem limite de requests
- Plano gratuito do Render: sempre ligado, sem limite de horas
