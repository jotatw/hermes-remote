# API — Referência

> Todos os endpoints são servidos pelo gateway (homeserver), prefixo `/api`.
> Respostas em JSON. Erros retornam `{ "error": "mensagem" }` com status HTTP coerente.
> O backend consome comandos do servidor via variáveis `HS_*_CMD` (ver `backend-contract.md`).

## Endpoints

### `GET /api/health`

Saúde do gateway.

- **Resposta 200:** `{ "status": "ok" }`
- **Fonte:** server.js

### `GET /api/models`

Lista os modelos disponíveis no Hermes API server (proxy para o notebook).

- **Resposta 200:** lista de modelos
- **Fonte:** `HERMES_URL` + `HERMES_API_KEY`

### `POST /api/chat`

Envia uma mensagem ao Hermes Agent (streaming).

- **Body:** `{ "message": "...", "modelo": "...", "contexto": "..." }`
- **Resposta:** streaming `text/event-stream`
- **Fonte:** proxy para o Hermes API server
- **Timeout:** `HERMES_TIMEOUT` (default 120s)

### `GET /api/status`

Status dos nodes: notebook, homeserver e cota IA.

- **Resposta 200:** `{ notebook: {...}, servidor: {...}, cota: {...} }`
- **Fonte:** `NOTEBOOK_IP`, `HOMESERVER_IP`, `HERMES_URL`

### `GET /api/servidor`

Detalhes do homeserver: uptime, RAM, disco, load, containers, temperatura.

- **Resposta 200:** dados do servidor
- **Fonte:** comandos locais ou SSH + `HS_HEALTH_CMD`

### `GET /api/power`

Agenda de energia.

- **Resposta 200:** `{ dorme: "22:00", acorda: "08:00", ... }`
- **Fonte:** `HS_POWER_CMD` (deve emitir JSON)

### `GET /api/acoes`

Histórico de ações recentes.

- **Resposta 200:** lista de ações
- **Fonte:** armazenamento interno

### `POST /api/acao/diario`

Dispara o relatório diário de saúde.

- **Resposta 200:** `{ ok: true }`
- **Fonte:** `HS_DIARIO_CMD`

### `POST /api/acao/revisar`

Dispara code review.

- **Resposta 200:** `{ ok: true }`
- **Fonte:** `HS_REVIEW_CMD`

### `POST /api/acao/dormir`

Suspende o homeserver.

- **Resposta 200:** `{ ok: true }`
- **Fonte:** `HS_SLEEP_CMD`

### `POST /api/acao/acordar`

Envia magic packet WOL.

- **Resposta 200:** `{ ok: true, ja_acordado: false }` (ou `ja_acordado: true`)
- **Fonte:** `HS_WAKE_CMD`

### `GET /api/config`

Config ativa do backend (vem do `.env`, não editável pelo cliente).

- **Resposta 200:** valores de configuração

## Regras

- **Auth:** rotas protegidas exigem header de autenticação (ver `AUTH.md`).
- **Streaming:** `/api/chat` usa `text/event-stream`; cliente aborta com `AbortController`.
- **Fonte de verdade:** este arquivo + `server.js`. Qualquer endpoint novo nasce aqui.
