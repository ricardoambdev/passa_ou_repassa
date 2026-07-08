# Instalação Local

## Pré-requisitos

- Node.js 18+
- npm

## Passos

```bash
# 1. Clonar
git clone https://github.com/ricardoambdev/passa_ou_repassa.git
cd passa_ou_repassa

# 2. Instalar dependências
npm install

# 3. Configurar .env
# Editar .env na raiz do projeto:
DATABASE_URL="file:./dev.db"
JWT_SECRET="sua-chave-secreta-aqui"

# 4. Iniciar servidor
npm run dev
```

O `dev.db` já vem com o repositório — admin, perguntas, provas e palavra cabalística já estão prontos.

## Acessar

- **http://localhost:3000** — Página inicial
- **http://localhost:3000/admin** — Admin (login: `admin@jogo.com` / `admin123`)
- **http://localhost:3000/apresentador** — Apresentador
- **http://localhost:3000/telao** — Telão

## Se quiser resetar o banco

```bash
rm dev.db
npx prisma db push
npx tsx prisma/seed.ts
```

## Build de produção local

```bash
npm run build
npm start
```
