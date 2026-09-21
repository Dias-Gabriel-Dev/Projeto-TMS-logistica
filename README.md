# API Logística

API RESTful desenvolvida em Node.js e TypeScript para orquestração e despacho de entregas. O sistema gerencia motoristas, veículos, rotas e entregas, aplicando regras de negócio rigorosas, controle de concorrência e segurança de borda.

## Tecnologias e Arquitetura

- Backend: Node.js (ES Modules) com Express v5 e TypeScript.
- Banco de Dados: PostgreSQL orquestrado via Prisma ORM 7.
- Validação de Contratos: Zod para schemas de requisição e tipagem estrita.
- Arquitetura: Baseada em conceitos de Clean Architecture e Domain-Driven Design (DDD), dividida em camadas lógicas de Transporte (Controllers), Domínio (Services) e Dados (Repositories).
- Segurança: Autenticação JWT, BcryptJS, Helmet, CORS e Limitação de Taxa (Rate Limit).
- Infraestrutura: Docker, Docker Compose e pipeline de CI/CD configurada via GitHub Actions.
- Documentação da API: Swagger / OpenAPI 3.0.

## Funcionalidades Principais

### Gestão de Operadores e Autenticação

- Criação de usuários (operadores e administradores).
- Autenticação JWT Stateless.
- Proteção nativa contra enumeração de contas e mitigação de ataques de força bruta.

### Gestão Operacional de Frota

- Cadastro e manutenção de Motoristas, com validação estrita de documentação (CNH, CPF) e disponibilidade de status.
- Cadastro e manutenção de Veículos, com amarração de propriedades dimensionais e posse exclusiva de um motorista existente.
- Transição de estados atômica e simultânea (AVAILABLE vs IN_TRANSIT).

### Orquestração de Entregas (Despacho)

- Validação de negócio em cascata para criação de despachos (validação de rota, motorista e veículo em uma única requisição).
- Transações Atômicas implementadas no Prisma para garantir consistência em falhas de rede.
- Prevenção ativa contra Dupla Alocação (Race Conditions) em ambientes de alta concorrência.
- Geração de códigos de rastreio de alta entropia.
- Event Sourcing: Linha do tempo cronológica com o histórico imutável de eventos logísticos de cada pacote.

### Resiliência de Aplicação (Cloud Readiness)

- Probes de Liveness e Readiness (Endpoints `/health` e `/health/ready`).
- Rotina de Graceful Shutdown programada para interromper recebimentos e drenar conexões de banco de dados de forma limpa.
- Validação estrutural de falha rápida (Fail-Fast) impedindo boot de instâncias com variáveis de ambiente ausentes.

## Instruções de Execução Local

### Pré-requisitos

- Docker e Docker Compose instalados na máquina hospedeira.

### Passos de Instalação

1. Configuração de Ambiente
   Copie o arquivo de propriedades de exemplo para criar o ambiente ativo:

   ```bash
   cp .env.example .env
   ```

   Edite o arquivo `.env` recém-criado, preenchendo as variáveis ausentes (se houver). O ambiente orquestrado consumirá estas variáveis automaticamente.

2. Inicialização da Infraestrutura
   Inicie a construção da imagem Docker da aplicação e o levante do servidor de banco de dados em background:

   ```bash
   docker compose up --build -d
   ```

3. Sincronização do Banco de Dados
   Execute a migração de esquemas do Prisma diretamente de dentro do contêiner da aplicação:

   ```bash
   docker compose exec api npx prisma db push
   ```

4. Utilização
   A aplicação entrará em estado de escuta nativa na porta configurada.
   - Acesso base HTTP: `http://localhost:3000`
   - Documentação de Integração (Swagger UI): `http://localhost:3000/api-docs`
