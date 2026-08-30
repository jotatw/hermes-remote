# Hermes Remote

PWA para controle remoto do **Hermes Agent** — dashboard, chat, servidor e configurações, direto do celular.

> 📱 Mobile-first · Dark-first (estilo Linear) · Chat estilo Intercom

## Funcionalidades

- 📊 **Dashboard** — visão geral do notebook, servidor e cota de IA, com ações rápidas e agenda de energia
- 💬 **Chat** — converse com o assistente (streaming em tempo real, temas, sidebar com conversas e tarefas)
- 🖥️ **Servidor** — saúde detalhada (containers, temperatura), ações de energia (dormir/acordar) e diário de saúde
- ⚙️ **Configurações** — URL do Hermes API server, chave, host SSH e teste de conexão

## Instalação

```bash
npm install
cp .env.example .env   # preencha as variáveis (ver abaixo)
npm start
```

Abra http://localhost:3000 — ou instale como PWA no celular.

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `PORT` | não | Porta do servidor (padrão 3000) |
| `HERMES_URL` | sim | URL do Hermes API server (ex.: `http://127.0.0.1:8642`) |
| `HERMES_API_KEY` | sim | Chave do API server (`API_SERVER_KEY`) |
| `HERMES_TIMEOUT` | não | Timeout das chamadas ao Hermes (segundos) |
| `NOTEBOOK_IP` / `HOMESERVER_IP` | se usar dashboard | IPs tailnet das máquinas |
| `HOMESERVER_SSH_USER` | se usar ações remotas | Usuário SSH (ex.: `usuario`) |
| `HOMESERVER_PATH` | se usar ações remotas | Path dos scripts do homeserver no servidor |
| `HOMESERVER_HOST` | para `deploy.sh` | Host de deploy (ex.: `usuario@homeserver`) |

## Backend

O app conecta ao **Hermes API server** — o listener OpenAI-compatível do gateway Hermes.
O `server.js` é um proxy fino que:

- Repassa `/v1/chat/completions` (chat + streaming) e `/v1/models` ao Hermes
- Expõe `/api/status` (notebook, servidor, cota), `/api/servidor`, `/api/power`, `/api/acoes` e `/api/acao/*` (diário, revisar, dormir, acordar)

Para acesso remoto do celular, exponha o servidor com **Tailscale** ou **Caddy** com HTTPS.

## Estrutura

```
hermes-remote/
├── server.js            # Proxy Express → Hermes API server
├── deploy.sh            # Sincroniza com o homeserver (usa HOMESERVER_HOST)
├── public/
│   ├── index.html       # SPA: dashboard, chat, servidor, config
│   ├── css/             # tokens.css (design tokens), style.css, responsive.css
│   ├── js/              # app.js, dashboard.js, sidebar.js, todos.js, markdown.js
│   ├── manifest.json    # PWA manifest
│   ├── sw.js            # Service worker (cache offline)
│   └── icons/           # Ícones do PWA
├── .env.example         # Configuração (sem segredos)
└── docs/                # Documentação (design tokens, planos)
```

## Documentação

- `docs/design/tokens.md` — design tokens (camadas A1/A2/B-slot/C-ext, tema light)
- `docs/plano-publicacao.md` — plano de publicação + auditoria de segurança
- `docs/README.md` — índice de documentação

## Segurança

- Nenhum segredo no repositório — tudo via variáveis de ambiente (`.env`, nunca commitado)
- `deploy.sh` exclui `.env` na sincronização
- Use valores genéricos (`usuario`, `100.x.x.x`) em issues/PRs públicos

## Notas

- **Servidor dorme à noite** (ex.: 22h–08h) — o gateway fica offline nesse período
- **Chat depende do Hermes API server** — habilite com `API_SERVER_KEY` no `.env` do Hermes
