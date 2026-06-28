# Regras de Desenvolvimento - Passa ou Repassa

## Stack
- Next.js (App Router) + TypeScript
- Tailwind CSS
- Prisma ORM + SQLite
- Autenticação JWT com jose + bcryptjs

## Estrutura
- `/src/app` - Rotas App Router
- `/src/app/api` - API Routes
- `/src/lib` - Utilitários (prisma, auth)
- `/src/components` - Componentes reutilizáveis
- `/prisma/schema.prisma` - Schema do banco
- `/docs/` - Documentação do sistema

## Convenções
- Server Components por padrão, "use client" quando necessário
- API Routes sempre validam autenticação via getSession()
- Senhas sempre hash com bcryptjs (10 rounds)
- Tokens JWT expiram em 24h
- Rotas /admin protegidas por middleware
- Formulários usam state local (useState)
- Tabelas com paginação, busca e filtros

## Comandos
- `npm run dev` - Desenvolvimento
- `npm run build` - Build
- `npm run lint` - Lint
- `npx prisma migrate dev` - Migrações
- `npx prisma db push` - Sincronizar schema
- `npx tsx prisma/seed.ts` - Seed do banco
