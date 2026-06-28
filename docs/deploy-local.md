# Como Subir Versão Local

## Pré-requisitos
- Node.js 18+
- npm

## Passos

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
# Editar .env:
DATABASE_URL="file:./dev.db"
JWT_SECRET="sua-chave-secreta-aqui"
MAGIC_WORD="parangaricutirimirruaru"

# 3. Sincronizar banco de dados
npx prisma db push

# 4. Executar seed (admin + 100 provas)
npx tsx prisma/seed.ts

# 5. Iniciar servidor de desenvolvimento
npm run dev

# 6. Acessar
# http://localhost:3000
```

## Build de Produção Local

```bash
npm run build
npm start
```

## Credenciais Padrão
- Email: `admin@jogo.com`
- Senha: `admin123`
