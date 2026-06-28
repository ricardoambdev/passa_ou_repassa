# 🎮 Passa ou Repassa Web

Plataforma web completa inspirada no programa **Passa ou Repassa**, com área administrativa, sistema de partidas, banco de perguntas e provas do Paga.

## Funcionalidades

- 🎤 **Tela do Apresentador** - Controle do jogo com sorteio de perguntas e provas
- 📺 **Telão** - Tela pública para jogadores acompanharem o placar
- ⚙️ **Área Administrativa** - CRUD completo de perguntas, provas e usuários
- ❓ **Banco de Perguntas** - Cadastro com categorias, níveis e pontuações
- 🎯 **Provas do Paga** - 100 desafios pré-cadastrados em 6 categorias
- 🔐 **Autenticação JWT** - Login seguro com bcrypt

## Tecnologias

| Tecnologia | Versão |
|------------|--------|
| Next.js | 16 (App Router) |
| React | 19 |
| TypeScript | 5 |
| Tailwind CSS | 4 |
| Prisma ORM | - |
| SQLite | - |
| jsonwebtoken (JWT) | - |
| bcryptjs | - |

## Estrutura do Projeto

```
src/
├── app/
│   ├── admin/           # Área administrativa
│   │   ├── login/       # Tela de login
│   │   ├── perguntas/   # CRUD perguntas
│   │   ├── provas/      # CRUD provas
│   │   └── usuarios/    # Gerenciamento de admins
│   ├── api/             # API Routes
│   │   ├── auth/        # Autenticação
│   │   └── admin/       # CRUDs administrativos
│   ├── apresentador/    # Tela do apresentador
│   └── telao/           # Tela pública
├── lib/
│   ├── prisma.ts        # Cliente Prisma
│   └── auth.ts          # Autenticação JWT
└── middleware.ts        # Proteção de rotas
```

## Como Usar

### Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Sincronizar banco
npx prisma db push

# Seed (admin + 100 provas)
npx tsx prisma/seed.ts

# Iniciar servidor
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

### Credenciais Padrão

| Campo | Valor |
|-------|-------|
| Email | admin@jogo.com |
| Senha | admin123 |

## Comandos Úteis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run lint` | Verificar lint |
| `npx prisma db push` | Sincronizar schema |
| `npx prisma migrate dev` | Criar migração |
| `npx tsx prisma/seed.ts` | Popular banco |

## Deploy

- **Local**: `npm run build && npm start`
- **Vercel**: Requer PostgreSQL (Neon) ou Turso (SQLite Edge)
- **Render**: Suporta SQLite com disco persistente

Veja a documentação em `/docs` para mais detalhes.
