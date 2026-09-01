# Variáveis de Ambiente

> Configuração do gateway via `.env` (nunca commitado). O `.env.example`
> contém os placeholders. Copie para `.env` e preencha com os valores reais.

## Servidor

| Variável | Obrigatória | Descrição | Default |
|----------|-------------|-----------|---------|
| `PORT` | Não | Porta HTTP do gateway | `3000` |
| `HERMES_URL` | Sim | URL do Hermes API server (onde o Hermes expõe o API server) | `http://127.0.0.1:8642` |
| `HERMES_API_KEY` | Sim | Chave de autenticação do Hermes API server (`API_SERVER_KEY`) | — |
| `HERMES_TIMEOUT` | Não | Timeout para chamadas ao Hermes (segundos) | `120` |

## Infraestrutura (dashboard + ações)

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `NOTEBOOK_IP` | Sim | IP tailnet (Tailscale) do notebook |
| `HOMESERVER_IP` | Sim | IP tailnet (Tailscale) do homeserver |
| `HOMESERVER_SSH_USER` | Sim | Usuário SSH para comandos remotos (use `usuario`, nunca nome real) |
| `HOMESERVER_PATH` | Não | Path dos scripts do homeserver no servidor | `/opt/homeserver` |
| `HOMESERVER_HOST` | Não | Host de deploy (ex.: `usuario@homeserver`) — usado por `deploy.sh` |

## Contrato de backend (comandos no servidor)

Cada variável `HS_*_CMD` define o comando executado para obter dados ou
disparar ações. Sobrescreva conforme o SEU servidor. Detalhes em
`backend-contract.md`.

| Variável | Função |
|----------|--------|
| `HS_HEALTH_CMD` | Saúde (temperatura) e Diário de saúde |
| `HS_DIARIO_CMD` | Relatório diário |
| `HS_POWER_CMD` | Agenda de energia (deve emitir JSON `{dorme, acorda}`) |
| `HS_REVIEW_CMD` | Code review |
| `HS_SLEEP_CMD` | Suspender servidor |
| `HS_WAKE_CMD` | Magic packet WOL |
| `HS_CONTAINERS_CMD` | Lista de containers (formato `nome|status` por linha) |

## Regras

- **Nunca commite o `.env`** — só o `.env.example` com placeholders.
- **Nenhum nome real** (usuário, IP, e-mail) em repo público. Use `usuario`,
  `100.xx.xx.xx` como placeholders.
- Fonte da verdade: `server.js` + este documento.
