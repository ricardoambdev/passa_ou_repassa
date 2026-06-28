# Como Operar o Sistema

## Acesso
- **Home**: `/` - Página inicial com links para todas as áreas
- **Apresentador**: `/apresentador` - Controle do jogo
- **Telão**: `/telao` - Tela pública para jogadores
- **Admin**: `/admin` - Área administrativa

## Administração

### Login
- Acesse `/admin/login`
- Email: `admin@jogo.com`
- Senha: `admin123`

### Dashboard
Após o login, o dashboard exibe:
- Total de perguntas cadastradas
- Total de provas do Paga
- Partidas realizadas

### Gerenciar Perguntas
- Lista todas as perguntas com busca e filtros
- Botão "Nova Pergunta" para adicionar
- Clique em "Editar" para modificar
- Clique em "Excluir" para remover (com confirmação)
- Botão "Importar" para CSV/JSON

### Gerenciar Provas do Paga
- CRUD completo com busca e filtros
- 100 provas pré-cadastradas via seed
- Categorias: Habilidade, Equilíbrio, Memória, Conhecimento, Coordenação, Humor

### Usuários Administradores
- Lista de administradores cadastrados
- Criar novo administrador
- Excluir administrador

## Apresentador
- Sorteio aleatório de perguntas
- Sorteio aleatório de provas do Paga
- Revelar resposta com um clique
- **Iniciar partida:** gera um PIN de 6 caracteres — compartilhe com os jogadores

## Telão
1. **Palavra cabalística** — digite a senha definida no ambiente (variável `MAGIC_WORD` no `.env`)
2. **PIN da partida** — insira o código de 6 caracteres gerado pelo apresentador
3. **Placar** — acompanhe os times e o jogo ao vivo

## Palavra Cabalística
A palavra cabalística é configurada via variável de ambiente:
```
MAGIC_WORD="parangaricutirimirruaru"
```
No arquivo `.env` na raiz do projeto. Altere para qualquer valor desejado.
