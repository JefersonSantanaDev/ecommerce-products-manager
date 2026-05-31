# Decisoes Tecnicas

## 1. Arquitetura por feature
Adotei organizacao por dominio (`features/products`) para manter escalabilidade, facilitar manutencao e separar responsabilidades entre UI, estado e acesso a dados.

## 2. Estado com NgRx SignalStore
Centralizei estado de produtos em uma store (`items`, `loading`, `error`, `notice`, `filters`) para garantir previsibilidade no fluxo de CRUD e filtros.

## 3. Formularios com Reactive Forms tipado
Utilizei Reactive Forms com validacoes declarativas para cadastro/edicao, priorizando robustez, tipagem e melhor tratamento de erros de usuario.

## 4. API mock com json-server
Usei `json-server` para simular contrato REST real (`/products`), permitindo desenvolvimento desacoplado de backend e validacao completa das operacoes.

## 5. Componentizacao e reuso
Criei componentes reutilizaveis (`custom-select`, `confirm-dialog`, `feedback-toast`, `breadcrumb`) para padronizar comportamento visual e reduzir duplicacao.

## 6. Qualidade de codigo
Mantive tipagem estrita, sem uso de `any`, e separacao clara entre camada de apresentacao, estado e servicos.

## 7. Testes
Implementei testes unitarios (Jest) para regras de negocio e store, e testes E2E (Playwright) para fluxos principais e CRUD completo.

## 8. Execucao em ambiente real
Estruturei execucao local e via Docker (frontend + API mock), facilitando reproducao do projeto pelo avaliador.
