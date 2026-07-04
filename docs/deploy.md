# Deploy no Render (Recomendado)

O Render suporta SQLite com disco persistente — **zero mudanças no código**.

## 1. Pré-requisitos

- Conta no [Render](https://render.com) (plano gratuito)
- Repositório no [GitHub](https://github.com)

## 2. Conectar o repositório

1. Faça push do projeto para o GitHub
2. No [Dashboard do Render](https://dashboard.render.com), clique em **"New +"** → **"Blueprint"**
3. Conecte seu GitHub e selecione o repositório `passa_ou_repassa`
4. O Render lê o `render.yaml` e configura tudo automaticamente

## 3. Variáveis de ambiente

No Dashboard, antes de aplicar o Blueprint, preencha:

| Variável | Descrição |
|----------|-----------|
| `JWT_SECRET` | Chave secreta (ex: gere uma senha aleatória) |

A `DATABASE_URL` já vai configurada pelo `render.yaml` — aponta pro disco persistente.

## 4. Aplicar

Clique **"Apply"**. O Render vai:
1. Criar o disco de 1GB para o SQLite
2. Buildar o projeto (`npm install && npm run build`)
3. Rodar o seed automático (via `prisma/seed.ts`)
4. Iniciar o servidor

## 5. Primeiro acesso

1. Acessar `https://passa-ou-repassa.onrender.com/admin`
2. Login: `admin@jogo.com` / `admin123` (criado pelo seed)
3. Em Configurações, definir a Palavra Cabalística

## Importante

- O banco SQLite fica no disco persistente (`/data/dev.db`)
- Se resetar o deploy, os dados **não** são perdidos (disco persiste)
- Para resetar o banco, acesse o Shell do Render e rode `npx tsx prisma/seed.ts`
- Plano gratuito é sempre ligado (sem limite de horas)
