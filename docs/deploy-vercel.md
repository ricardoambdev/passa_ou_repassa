# Deploy na Vercel

## 1. Pré-requisitos

- Conta no [GitHub](https://github.com)
- Conta na [Vercel](https://vercel.com) (plano gratuito)
- Conta no [Neon](https://neon.tech) (PostgreSQL gratuito — 500MB)

> SQLite não funciona na Vercel (serverless). Precisa de PostgreSQL.

## 2. Criar banco no Neon

1. Acesse [Neon Console](https://console.neon.tech)
2. Crie um projeto (qualquer nome, região próxima de você)
3. Copie a `DATABASE_URL` (começa com `postgresql://...`)

## 3. Configurar o projeto

```bash
# Instalar CLI da Vercel
npm i -g vercel

# Logar na Vercel
vercel login
```

No arquivo `prisma/schema.prisma`, mude o provider para PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"
}
```

Crie um arquivo `.env` na raiz do projeto (não commitar):

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="uma-chave-segura-aqui"
```

Rodar as migrações e seed:

```bash
npx prisma db push
npx tsx prisma/seed.ts
```

## 4. Deploy na Vercel

```bash
# Iniciar (primeira vez pergunta as configs)
vercel

# Adicionar variáveis de ambiente em produção
vercel env add DATABASE_URL
vercel env add JWT_SECRET

# Fazer deploy para produção
vercel --prod
```

Ou pelo [Dashboard da Vercel](https://vercel.com):
1. "Add New" → "Project"
2. Importar repositório do GitHub
3. Em "Environment Variables", adicionar:
   - `DATABASE_URL` — URL do Neon
   - `JWT_SECRET` — chave secreta JWT
4. "Deploy"

## 5. Primeiro acesso

1. Acessar `https://seu-site.vercel.app/admin`
2. Login com email/senha criado no seed (admin@jogo.com / admin123)
3. Em Configurações, definir a **Palavra Cabalística**
4. A partir daí pode entrar com a palavra (24h de cookie)

## 6. Observações

- Plano gratuito da Vercel: 100h/mês de execução
- Para uso contínuo sem limite, plano Pro ($20/mês)
- `MAGIC_WORD` no .env não é mais usado — a palavra fica salva no banco
- Se resetar o banco, rodar `npx tsx prisma/seed.ts` de novo para criar admin e palavra padrão
