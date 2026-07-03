# Projeto SPDA - Rastreabilidade Digital

Este é o repositório do Sistema de Rastreabilidade Digital de Pontos de Inspeção de SPDA por QR Code.

## 🛠️ Pré-requisitos para a Equipe

Antes de iniciar o projeto na sua máquina, certifique-se de ter os seguintes programas instalados:
1. **Node.js**: [Download aqui](https://nodejs.org/)
2. **MySQL**: Um servidor de banco de dados rodando localmente (pode usar XAMPP, MySQL Installer, Wamp, etc).

## ⚙️ Passo a Passo para Configuração Inicial

Quando você clonar o projeto do GitHub pela primeira vez no seu computador, siga os passos abaixo para deixar tudo rodando em menos de 1 minuto:

### 1. Criar o arquivo de Banco de Dados
Na pasta `backend`, crie um arquivo chamado `.env` e adicione a string de conexão com o seu banco de dados MySQL local. Exemplo:

```env
DATABASE_URL="mysql://usuario:senha@localhost:3306/spda"
GOOGLE_CLIENT_ID="629604508013-83t8kmdlt1gq798k92nrgdtlmm9e2g7t.apps.googleusercontent.com"
```
*(Troque `usuario` e `senha` pelas credenciais do seu MySQL local. O banco "spda" será criado/usado pelo Prisma).*

### 2. Rodar o Comando Mágico de Setup
Abra o terminal na pasta `backend` e rode **um único comando** para instalar dependências, construir as tabelas no banco e injetar os dados falsos do Desafio:

```bash
npm run setup
```
**O que esse comando faz?**
- `npm install`: Instala Prisma, Express, Bcrypt, Autenticação Google, etc.
- `npx prisma db push`: Sincroniza e cria as tabelas no seu banco MySQL zerado.
- `node seedMock.js`: Gera os 14 pontos, áreas, unidades e laudos que precisamos para apresentar.

### 3. Iniciar o Servidor no Dia a Dia
Após rodar o setup na primeira vez, sempre que for programar e testar, basta ligar o servidor digitando na pasta `backend`:

```bash
npm start
```

### 4. Como Testar o Login do Google?
Lembre-se: Após rodar o setup, o banco estará com os dados simulados (Mock). Para conseguir logar com o seu e-mail do Google, você precisará adicionar o seu e-mail na tabela `usuarios`.
Para fazer isso, abra um terminal na pasta `backend` e digite `npx prisma studio`. Adicione seu nome, o seu e-mail exato do Google, e a palavra "gestor" no perfil. Pronto! Pode logar na interface web.