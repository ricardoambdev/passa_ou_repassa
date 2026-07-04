# Deploy na Vercel

O banco Turso já está criado e populado. Basta conectar na Vercel.

## 1. Fazer push no GitHub

```bash
git push origin master
```

## 2. Importar na Vercel

1. Acesse https://vercel.com/new
2. Importe o repositório `passa_ou_repassa`
3. Em **Environment Variables**, adicione:

| Variável | Valor |
|----------|-------|
| `DATABASE_URL` | `libsql://passa-ou-repassa-db-ricardoambdev.aws-us-east-2.turso.io` |
| `TURSO_AUTH_TOKEN` | token gerado no Turso |
| `JWT_SECRET` | uma string segura qualquer |

4. Clique **Deploy**

## 3. Primeiro acesso

1. Acessar `https://seu-site.vercel.app/admin`
2. Login: `admin@jogo.com` / `admin123`
3. Em Configurações, definir a Palavra Cabalística

## Importante

- O banco fica no Turso, os dados persistem entre deploys
- Plano gratuito da Vercel: 100h/mês de execução
- Para uso contínuo sem limite, upgrade pro Pro ($20/mês)
