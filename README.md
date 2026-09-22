# API Logística (TMS Local / Last Mile)

API RESTful desenvolvida em Node.js e TypeScript focada em orquestração de entregas e despacho ágil (modelo Food Delivery / Last Mile). O sistema gerencia entregadores parceiros, rotas, despachos e fornece telemetria analítica com rigorosas regras de negócio, controle de concorrência e segurança de borda.

## Tecnologias e Arquitetura

- Backend: Node.js com Express v5 e TypeScript.
- Banco de Dados: PostgreSQL orquestrado via Prisma ORM 7.
- Validação de Contratos: Zod para schemas de requisição e tipagem estrita (Fail-fast).
- Arquitetura: Baseada em Clean Architecture e Domain-Driven Design (DDD), separando lógicas de Transporte (Controllers), Negócio (Services) e Acesso a Dados (Repositories).
- Segurança: Autenticação JWT Stateless, BcryptJS, Helmet, CORS e Limitação de Taxa (Rate Limit).
- Qualidade e TDD: Bateria de testes automatizados com Jest, ESLint estrito e CI/CD via GitHub Actions.
- Infraestrutura: Docker, Docker Compose, Healthchecks e Graceful Shutdown.
- Documentação da API: Swagger / OpenAPI 3.0.

## Funcionalidades Principais e Regras de Negócio

### Autenticação e Autorização (RBAC)

- Criação de usuários (Operadores e Administradores).
- Segurança baseada em JWT com proteção contra ataques de força bruta e enumeração de contas.

### Gestão Operacional de Entregadores (Couriers)

- Cadastro e manutenção de Entregadores parceiros.
- Classificação do tipo de transporte operacional (MOTO ou BIKE).
- Transição de estado de disponibilidade isolada (AVAILABLE vs IN_TRANSIT).

### Despacho de Entregas e Cálculo de Frete

- Criação de entregas vinculando Rotas e Entregadores disponíveis.
- Cálculo de Frete: O custo operacional é automatizado considerando uma taxa base e um multiplicador financeiro sobre a distância estimada da rota.
- Prevenção de Dupla Alocação: Uso de atualizações condicionais atômicas (TOCTOU lock) no banco de dados para impedir que dois despachantes aloquem o mesmo entregador simultaneamente.
- Transações Atômicas (ACID): Em caso de falha de validação de disponibilidade durante o despacho, toda a operação sofre rollback automático.

### Rastreamento (Event Sourcing)

- Geração de código de rastreamento de alta entropia para acesso de clientes e operadores.
- Histórico imutável de eventos logísticos. Os pacotes transitam pelos estados PENDING, IN_TRANSIT e DELIVERED, com logs cronológicos garantidos.

### Telemetria e Analytics

- Painel analítico gerado com agregações otimizadas diretamente no PostgreSQL via Prisma.
- Métricas em tempo real sobre status da frota e disponibilidade operacional.
- Faturamento total do sistema (Revenue) e métricas de distâncias acumuladas.
- Ranking de entregadores baseado no volume de entregas concluídas.

## Instruções de Execução Local

### Pré-requisitos

- Docker e Docker Compose instalados na máquina hospedeira.

### Passos de Instalação

1. Configuração de Ambiente
   Copie o arquivo de propriedades de exemplo para criar o ambiente ativo:

   ```bash
   cp .env.example .env
   ```

   Edite o arquivo `.env` para inserir suas configurações de porta ou credenciais, caso diferem do padrão.

2. Inicialização da Infraestrutura
   Inicie a construção da imagem Docker da aplicação e levante o servidor de banco de dados em background:

   ```bash
   docker compose up --build -d
   ```

3. Sincronização do Banco de Dados
   Execute a migração de esquemas do Prisma dentro do contêiner da aplicação:

   ```bash
   docker compose exec api npx prisma db push
   ```

4. Utilização
   A aplicação entrará em estado de escuta nativa na porta configurada.
   - Acesso base HTTP: <http://localhost:3000>
   - Documentação de Integração (Swagger UI): <http://localhost:3000/api-docs>

## Testes Automatizados

O sistema foi rigorosamente desenvolvido sob a filosofia TDD (Test-Driven Development).
Para executar toda a suíte de testes unitários e de integração, utilize o comando:

```bash
npm run test
```
