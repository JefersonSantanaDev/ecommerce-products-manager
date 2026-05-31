# ClapsTech

Aplicacao front-end para gerenciamento de produtos de e-commerce, desenvolvida como prova tecnica para vaga de Front-end.

## Objetivo

Implementar um fluxo completo de produtos com:

- cadastro
- edicao
- exclusao
- listagem com filtros por categoria, status e faixa de preco

## Stack oficial

- Angular 21
- TypeScript
- SCSS
- Reactive Forms (tipado)
- json-server (API mock REST)
- NgRx SignalStore
- Jest (testes unitarios)
- Playwright (testes E2E)

## Requisitos atendidos da prova

- Framework front-end moderno: Angular 21
- TypeScript: aplicado em toda a aplicacao
- SCSS: aplicado em componentes e paginas
- Estrutura organizada por feature
- Consumo de API REST via json-server
- Formularios com validacao
- Boas praticas de componentizacao e legibilidade
- Testes de regra de negocio
- Diferencial: gerenciamento de estado com NgRx SignalStore

## Funcionalidades implementadas

- Listagem de produtos com cards
- Filtros por:
  - categoria
  - status (Ativo/Inativo)
  - preco minimo e preco maximo
- Cadastro de produto
- Edicao de produto
- Exclusao de produto com confirmacao
- Feedback visual de:
  - loading
  - sucesso
  - erro
- Estado vazio para busca sem resultados
- Layout responsivo

## Decisoes tecnicas

1. Arquitetura por feature para escalabilidade e manutencao.
2. SignalStore para centralizar estado de `items`, `loading`, `error`, `notice` e `filters`.
3. Reactive Forms tipado com validacao declarativa.
4. Componentes compartilhados para padrao visual e reuso:
  - `custom-select`
  - `confirm-dialog`
  - `feedback-toast`
  - `breadcrumb`

## Arquitetura

```text
src/app/
  core/
    models/
    services/
    utils/
  features/
    products/
      components/
      pages/
      store/
  shared/
    components/
```

## Rotas

- `/products`: listagem + filtros
- `/products/new`: cadastro
- `/products/:id/edit`: edicao

## Como executar localmente

### Pre-requisitos

- Node.js 22+ (recomendado 24)
- npm 11+

### Passos

1. Instalar dependencias:

```bash
npm install
```

2. Subir API mock:

```bash
npm run api:mock
```

3. Em outro terminal, subir frontend:

```bash
npm run start
```

4. Acessar:

```text
http://localhost:4200
```

Observacao:

- Em desenvolvimento, o frontend usa proxy `/api` para `http://localhost:3000`.

## Como executar com Docker

### Pre-requisitos

- Docker Desktop ativo
- WSL2 funcionando corretamente no Windows

### Passos

1. Build e subida da aplicacao (frontend + API):

```bash
docker compose up --build
```

2. Acessar:

```text
http://localhost:8080
```

3. Parar containers:

```bash
docker compose down
```

Observacao:

- No Docker, o Nginx faz proxy de `/api` para o container da API mock.

## Scripts uteis

- `npm run start`: sobe frontend em dev mode com proxy
- `npm run build`: build de producao
- `npm run watch`: build de desenvolvimento em watch
- `npm run lint`: analise de qualidade
- `npm run test`: testes unitarios (Jest)
- `npm run test:watch`: testes unitarios em watch
- `npm run test:coverage`: cobertura de testes unitarios
- `npm run e2e`: testes E2E (headless)
- `npm run e2e:headed`: testes E2E com navegador aberto
- `npm run e2e:ui`: modo interativo do Playwright
- `npm run e2e:reset-db`: reseta base dedicada do E2E
- `npm run api:mock`: API mock principal (`db.json`)
- `npm run api:mock:readonly`: API mock em modo somente leitura
- `npm run api:mock:e2e`: API mock dedicada para testes E2E
- `npm run check`: lint + unit tests + build

## Testes

### Unitarios (Jest)

Cobertura principal:

- utilitario de moeda (`currency.util`)
- utilitario de filtros (`product-filters.util`)
- store de produtos (`products.store`)

Comando:

```bash
npm run test
```

### E2E (Playwright)

Fluxos cobertos:

- listagem inicial
- filtro por categoria (custom-select)
- validacao de campos obrigatorios no cadastro
- CRUD completo:
  - criar produto
  - editar produto
  - excluir produto

Comando:

```bash
npm run e2e
```

Observacao:

- O E2E usa base dedicada e executa reset automatico antes dos testes.

## API mock (json-server)

Base URL local:

- `http://localhost:3000`

Recurso principal:

- `/products`

Operacoes:

- `GET /products`
- `GET /products/:id`
- `POST /products`
- `PUT /products/:id`
- `DELETE /products/:id`
