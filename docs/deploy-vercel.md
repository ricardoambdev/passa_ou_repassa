# Como Subir para a Vercel (Gratuito)

## Pré-requisitos
- Conta na [Vercel](https://vercel.com) (plataforma gratuita)
- Repositório no GitHub

## Passos

### 1. Preparar o Projeto

O projeto usa SQLite, que **não é compatível** com o ambiente serverless da Vercel. Para deploy gratuito, você tem duas opções:

### Opção A: Vercel + Neon (PostgreSQL - Gratuito)

1. Crie uma conta no [Neon](https://neon.tech) (plano gratuito: 500MB)
2. Copie a `DATABASE_URL` do Neon
3. Altere o provider no `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
   }
   ```
4. Execute `npx prisma db push`
5. Execute `npx tsx prisma/seed.ts`
6. Faça deploy na Vercel

### Opção B: Vercel + Turso (SQLite Edge - Gratuito)

1. Crie uma conta no [Turso](https://turso.tech)
2. Instale a CLI do Turso
3. Crie um banco de dados Turso
4. Atualize a `DATABASE_URL` com a URL do Turso
5. Configure o Prisma para usar o Turso (driver adapters)

### Opção C: Render (Alternativa Gratuita)

O Render suporta SQLite nativamente:
1. Crie conta no [Render](https://render.com)
2. Conecte seu repositório
3. Escolha "Web Service"
4. Configuração:
   - Build: `npm install && npm run build`
   - Start: `npm start`
   - Disk: Adicione um disco persistente para o SQLite

### 2. Configurar na Vercel (se usar PostgreSQL)

```bash
# Instalar CLI da Vercel
npm i -g vercel

# Deploy
vercel

# Adicionar variáveis de ambiente
vercel env add DATABASE_URL
vercel env add JWT_SECRET
```

### 3. Variáveis de Ambiente na Vercel

No dashboard da Vercel, adicione:
- `DATABASE_URL` - URL do banco (Neon/Turso)
- `JWT_SECRET` - Chave secreta JWT
- `MAGIC_WORD` - Palavra cabalística para acesso ao telão (ex: `parangaricutirimirruaru`)

## Importante
- O plano gratuito da Vercel tem limite de 100h/mês de execução
- Para uso contínuo, considere o plano Pro ($20/mês) ou use Render
- Sempre use variáveis de ambiente para dados sensíveis
