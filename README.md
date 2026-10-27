# ⚡ SPDA - Sistema de Rastreabilidade e Auditoria Digital

> **Solução Full Stack para inspeção técnica, conformidade normativa e rastreabilidade digital de Sistemas de Proteção contra Descargas Atmosféricas (SPDA) com identificação óptica via QR Code, em conformidade com as diretrizes da norma ABNT NBR 5419.**

![NodeJS](https://img.shields.io/badge/Node.js-18.x+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-5.x-000000?style=for-the-badge&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma_ORM-5.14-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Security](https://img.shields.io/badge/Auth-Google_OAuth2_%7C_Bcrypt-blue?style=for-the-badge&logo=google)

---

## 📌 Sobre o Projeto

Em plantas industriais de grande porte (como usinas, refinarias, polos petroquímicos e metalúrgicas), os Sistemas de Proteção contra Descargas Atmosféricas possuem dezenas ou centenas de pontos de aterramento e captores distribuídos por vastas áreas. 

Historicamente, a gestão dessas vistorias é feita em pranchetas de papel ou planilhas desconexas, o que acarreta:
1. **Falta de garantia de presença física:** Risco de laudos preenchidos sem que o técnico tenha ido fisicamente até a haste ou captor.
2. **Extravio e atraso de informações:** Dificuldade em manter laudos fotográficos e histórico cronológico de medições ôhmicas.
3. **Identificação confusa dos pontos:** Ausência de codificação padronizada entre áreas e unidades fabris.
4. **Vulnerabilidade em auditorias:** Falta de indicadores imediatos para órgãos fiscalizadores e seguradoras (exigências da **ABNT NBR 5419** e **NR-10**).

### A Solução
O **SPDA Digital** moderniza esse fluxo através de uma plataforma integrada que conecta a operação de campo à gestão executiva:
- O técnico utiliza a câmera do próprio celular para escanear a etiqueta física de **QR Code** instalada no ponto de inspeção.
- O sistema abre instantaneamente a ficha técnica do ponto, permitindo registrar medições elétricas (continuidade e resistência ôhmica), conformidade e **evidência fotográfica**.
- O gestor acompanha em tempo real o **Dashboard com taxa de conformidade**, resistências médias, pontos críticos e emite relatórios em PDF com rastreabilidade auditável.

---

## 🚀 Principais Funcionalidades

### 📱 Operação de Campo (Inspetor - Mobile First)
- **Leitor de QR Code via Câmera Nativa:** Acesso direto via navegador através da API WebRTC (`Html5-QRCode`), com acionamento automático da câmera traseira e detecção instantânea.
- **Registro Rápido de Laudo Técnico:** Formulário otimizado para celulares com campos para:
  - Resistência de Aterramento (Ω) e Continuidade Elétrica (mΩ).
  - Análise visual, presença de oxidação e necessidade de correção.
  - Upload de foto do ponto no momento da inspeção (via `Multer`).
- **Validação Automática de Conformidade:** Sinalização visual imediata de aprovação ou não conformidade do ponto.

### 💻 Gestão e Auditoria (Painel do Gestor)
- **Dashboard Gerencial:** Visão consolidada com Total de Pontos, Taxa de Conformidade Geral (%), Resistência Média de Aterramento e linha do tempo das últimas vistorias.
- **Codificação Industrial Padronizada (Tag Inteligente):** Geração algorítmica de códigos únicos sem colisões no padrão:  
  `[SIGLA_CLIENTE]-SPDA-[SIGLA_AREA]-[SIGLA_TIPO]-[ID_SEQUENCIAL]` (exemplo: `MET-SPDA-GLP-HST-001`).
- **Gerador de Etiquetas QR Code:** Geração vetorial no navegador (`QRCodeJS`) e fallback via API, permitindo impressão imediata das tags industriais.
- **Ficha Técnica & Exportação:** Histórico cronológico detalhado de medições com visualização de fotos das vistorias e exportação para PDF (`html2pdf.js`).
- **Arquivo Morto com Soft Delete:** Mecanismo seguro de inativação lógica com análise prévia de impacto cadastral, evitando perda de integridade referencial no banco.

---

## 🏛️ Arquitetura e Decisões de Engenharia

O projeto foi arquitetado com separação estrita de camadas e foco em performance e simplicidade:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CAMADA DE APRESENTAÇÃO                          │
│   Landing Page  •  Dashboard Gestor  •  Scanner WebRTC  •  Laudos      │
│     (HTML5 Semântico, CSS3 com Design System e Vanilla JS Modular)     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Requisições HTTP / REST / JSON
┌───────────────────────────────────▼────────────────────────────────────┐
│                       BACKEND & API (Node.js)                          │
│  - Express.js 5.x: Servidor HTTP, roteamento REST e middlewares        │
│  - Segurança: Google OAuth 2.0 (Google Auth Library) + Hash Bcrypt     │
│  - Storage de Mídia: Multer para persistência segura de fotos          │
│  - Camada de Dados: Prisma ORM (Client type-safe e migrações)          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Protocolo TCP / Porta 3306
┌───────────────────────────────────▼────────────────────────────────────┐
│                      BANCO DE DADOS RELACIONAL                         │
│   MySQL 8.x (7 Tabelas normalizadas, integridade referencial estrita)   │
│   [Clientes] ──< [Unidades] ──< [Áreas] ──< [Pontos] ──< [Inspeções]   │
└────────────────────────────────────────────────────────────────────────┘
```

### Destaques Técnicos para Avaliação:
1. **Segurança Híbrida & RBAC:** Suporte a login corporativo via Google Identity Services (com verificação de assinatura do ID Token no backend) e login tradicional por e-mail/senha com hash salgado via `bcryptjs` (salt rounds = 10). O controle de acesso diferencia perfis de *Gestor* e *Inspetor*.
2. **Modelagem Relacional com Prisma ORM:** Esquema estruturado cobrindo a hierarquia industrial completa, com uso de transações, chaves estrangeiras e preservação de histórico por inativação lógica (`Soft Delete`).
3. **Frontend Leve e Autocontido:** Desenvolvido em Vanilla JavaScript (ES6+) e CSS puro baseado em variáveis de design (*tokens*), eliminando o overhead de *bundles* volumosos de frameworks em conexões lentas de chão de fábrica.
4. **Documentação Técnica Estruturada:** Contratos de API (OpenAPI 3.0), diagramas de sequência em Mermaid e análise de riscos disponíveis na pasta [`docs/`](docs/).

---

## 🛠️ Tecnologias Utilizadas

| Camada | Tecnologia | Versão | Função no Projeto |
|---|---|---|---|
| **Ambiente / Runtime** | Node.js | >= 18.x | Ambiente de execução JavaScript assíncrono no servidor |
| **Framework Backend** | Express.js | 5.2.1 | Criação de rotas da API RESTful, controllers e middlewares |
| **Banco de Dados** | MySQL | 8.x | Persistência relacional com integridade referencial estrita |
| **ORM / Migrations** | Prisma ORM | 5.14.0 | Modelagem declarativa, tipagem e interface com banco |
| **Autenticação Segura** | Google Auth Library | 10.9.0 | Validação criptográfica do OAuth2 ID Token da Google |
| **Criptografia** | Bcrypt.js | 3.0.3 | Hashing irreversível de senhas com salt |
| **Upload de Arquivos** | Multer | 2.2.0 | Processamento de laudos fotográficos multipart/form-data |
| **Scanner de Câmera** | Html5-QRCode | 2.3.8 | Acesso à câmera WebRTC para leitura de QR Code em campo |
| **Gerador de Etiquetas** | QRCodeJS | 1.0.0 | Geração de imagem vetorial de QR Code no frontend |
| **Frontend / UI** | HTML5 / Vanilla CSS3 | - | Interface moderna com Design Tokens e responsividade |

---

## ⚡ Guia de Execução Rápida (Quick Start)

> **Nota para Avaliadores:** O projeto inclui um script automatizado (`npm run setup`) que instala as dependências, cria as tabelas no MySQL e injeta **14 pontos de SPDA completos com laudos e medições históricas**, permitindo testar todos os gráficos e recursos imediatamente sem esforço cadastral.

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- Servidor **MySQL** rodando localmente na porta 3306 (via XAMPP, MySQL Installer, Docker ou similar).

---

### Passo a Passo

#### 1. Clonar o Repositório
```bash
git clone https://github.com/Erick-143/SPDA.git
cd SPDA
```

#### 2. Configurar Variáveis de Ambiente
Na pasta `backend`, crie o arquivo `.env` (ou duplique o modelo pronto `backend/.env.example`):
```env
DATABASE_URL="mysql://root:suasenha@localhost:3306/spda"
GOOGLE_CLIENT_ID="629604508013-83t8kmdlt1gq798k92nrgdtlmm9e2g7t.apps.googleusercontent.com"
PORT=3000
```
*(Substitua `root` e `suasenha` pelas credenciais do seu MySQL local. O banco `spda` será provisionado automaticamente).*

#### 3. Executar o Setup Automatizado
Abra o terminal na pasta `backend` e execute:
```bash
cd backend
npm run setup
```
**O que esse comando faz nos bastidores?**
- Executa `npm install` de todas as dependências.
- Sincroniza o schema e cria as 7 tabelas no banco MySQL via `prisma db push`.
- Executa `seed.js` e `seedMock.js`, gerando os clientes, unidades, áreas e 14 pontos com inspeções e gráficos populados.

#### 4. Iniciar a API
```bash
npm start
```
*O backend estará rodando e respondendo em `http://localhost:3000`.*

#### 5. Acessar a Aplicação
Abra a pasta do projeto em um servidor estático local (como a extensão **Live Server** do VS Code na porta 5500 ou executando `npx serve .`). Acesse:
```
http://127.0.0.1:5500/frontend/landingPage.html
```

---

## 🔑 Credenciais Prontas para Avaliação

O script de mock já disponibiliza perfis com permissões configuradas:

| Perfil | E-mail de Teste | Senha Padrão | Fluxo e Telas Liberadas |
|---|---|---|---|
| **Gestor** *(Acesso Completo)* | `gestorexemplo12@gmail.com` | `1@gestor12345` | Dashboard gerencial, cadastro de pontos, configurações e arquivo morto |
| **Inspetor de Campo** | `inspetorexemplo12@gmail.com` | *Definir via `criar_senha.html` ou Google Login* | Scanner de QR Code e formulário de nova inspeção |

> 💡 **Quer testar com sua própria conta Google?**  
> Abra um terminal na pasta `backend`, digite `npx prisma studio` e adicione um registro na tabela `usuarios` com seu nome, seu e-mail exato do Google e o perfil `gestor`. Em seguida, basta clicar no botão "Entrar com o Google" na tela de login.

---

## 📂 Estrutura do Repositório

```text
SPDA/
├── backend/
│   ├── prisma/             # Schema declarativo do banco e migrações
│   ├── src/
│   │   ├── controllers/    # Lógica de negócio e regras das tags inteligentes
│   │   ├── routes/         # Endpoints modulares da API REST
│   │   └── prismaClient.js # Conexão singleton com o Prisma ORM
│   ├── uploads/            # Armazenamento de fotos dos laudos técnicos
│   ├── server.js           # Inicialização do Express, middlewares e CORS
│   └── seedMock.js         # Gerador de massa de testes (14 pontos e laudos)
├── frontend/
│   ├── css/                # Sistema de design modular (tokens, layout, temas)
│   ├── js/                 # Lógica de frontend (WebRTC, scanner, API fetch)
│   ├── painel_gestor.html  # Dashboard principal com KPIs
│   ├── leitura.html        # Scanner de QR Code via câmera
│   ├── cadastro_ponto.html # Cadastro e gerador de etiquetas QR
│   ├── nova_insp.html      # Formulário de laudo com upload de fotos
│   └── ficha_ponto.html    # Ficha técnica histórica e impressão em PDF
└── docs/                   # Documentação técnica e de engenharia detalhada
```

---

## 📚 Documentação Técnica Aprofundada

Para examinar em detalhes o design de engenharia e os artefatos técnicos do sistema, consulte a documentação na pasta [`docs/`](docs/):

1. **[01. Visão Geral e Arquitetura do Sistema](docs/01-visao-geral.md)** - Diagramas de arquitetura e escopo funcional.
2. **[02. Estrutura e Organização do Projeto](docs/02-estrutura-do-projeto.md)** - Matriz de rastreabilidade entre camadas.
3. **[03. Documentação do Frontend](docs/03-frontend.md)** - Componentes de interface e fluxo de captura por câmera.
4. **[04. Documentação do Backend](docs/04-backend.md)** - Controladores, regras de negócio e validações.
5. **[05. Especificação da API REST](docs/05-api.md)** - Dicionário de endpoints e especificação OpenAPI 3.0.
6. **[06. Modelagem do Banco de Dados](docs/06-banco-de-dados.md)** - Esquema relacional, regras de cascata e ERD.
7. **[07. Fluxos do Sistema](docs/07-fluxos-do-sistema.md)** - Diagramas de sequência ponta a ponta (Mermaid).
8. **[08. Segurança e Autenticação](docs/08-seguranca.md)** - Matriz de riscos e mecanismos de proteção.
9. **[09. Guia de Instalação e Execução](docs/09-instalacao-e-execucao.md)** - Troubleshooting e configuração em detalhes.
10. **[10. Plano de Testes e Qualidade](docs/10-testes.md)** - Estratégia proposta para testes unitários e de integração.
11. **[11. Implantação e Produção](docs/11-implantacao.md)** - Containerização (Docker) e proxy reverso Nginx.
12. **[12. Análise Técnica e Melhorias](docs/12-analise-tecnica.md)** - Diagnóstico de código e plano de refatorações.
13. **[13. Glossário Técnico e Normativo](docs/13-glossario.md)** - Conceitos elétricos da NBR 5419 e termos de software.
