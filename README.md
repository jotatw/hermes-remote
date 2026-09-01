# Hermes Remote

**Painel de controle móvel (PWA) para o [Hermes Agent](https://hermes-agent.nousresearch.com)** — dashboard do seu servidor, chat com o assistente e ações de energia, direto do celular.

Mobile-first · Dark-first (estilo Linear) · Chat estilo Intercom

---

## O que é (e o que NÃO é)

**É:** uma interface web instalável (PWA) para quem **já roda o Hermes Agent** e quer controlar o assistente e o servidor pelo celular — sem abrir terminal.

**NÃO é:** um assistente de IA standalone. Sem um Hermes Agent acessível (com o API server habilitado), o app não tem com o que conversar nem o que monitorar.

### Para quem serve

| Perfil | O que ganha |
|--------|-------------|
| Quem roda **Hermes Agent num servidor** (self-host) | Chat no celular + dashboard de saúde do servidor |
| Quem tem **1 servidor + 1 notebook** (setup típico do autor) | Monitora os dois, controla energia (dormir/acordar) |
| Quem usa **Tailscale/HTTPS** para acesso remoto | PWA instalável na tela inicial, seguro |

---

## Objetivo

O Hermes Remote existe para colocar o controle do seu servidor e do seu assistente de IA local no seu celular. Ele elimina a necessidade de abrir um terminal para executar comandos, conferir status ou bater papo — tudo a partir de uma interface pensada para telas pequenas, com design mobile-first e conexão segura via Tailscale.

---

## Dependências

Este projeto **depende de infraestrutura externa** — não funciona sozinho:

| Dependência | Obrigatória? | Para quê |
|---|---|---|
| **Hermes Agent** (gateway + API server) | Sim | Chat, modelos, cota de IA |
| **Homeserver** (Linux com scripts) | p/ dashboard | Saúde, containers, temperatura, ações de energia |
| **Tailscale** (ou Caddy + HTTPS) | p/ PWA remoto | Instalar como app no celular (HTTPS) |

**Mínimo viável:** só com o Hermes Agent você já usa o **chat**. Dashboard/servidor/ações precisam do homeserver acessível (local ou via SSH/Tailscale).

### Como o app se conecta a cada peça

```
Hermes Agent ──(API server :8642)──► Chat + Modelos + Cota
     ▲
Homeserver ──(local ou SSH)────────► Uptime, RAM, disco, containers,
                                     temperatura, energia (dormir/acordar)
     ▲
Tailscale/HTTPS ───────────────────► Instalação do PWA no celular
```

---

## Funcionalidades

| Tela | O que faz | Depende de |
|---|---|---|
| **Dashboard** | Notebook/servidor/cota, ações rápidas, agenda de energia | Homeserver + API |
| **Chat** | Conversa com o assistente (streaming, temas, conversas, tarefas) | Hermes API server |
| **Servidor** | Containers, temperatura, energia, diário de saúde | Homeserver (SSH) |
| **Configurações** | Mostra conexão ativa (backend, URL, status) + como configurar | — |

---

## Tecnologias

| Área | Stack |
|------|-------|
| **Backend** | Node.js, Express |
| **Frontend** | HTML, CSS, JavaScript (vanilla + PWA) |
| **PWA** | Service Worker, Web App Manifest |
| **Deploy** | Shell script (`deploy.sh`) |
| **Configuração** | dotenv |
| **Design System** | Tokens (camadas A1/A2/B-slot), estilo Linear (dark-first) |
| **CI/CD** | GitHub Actions |
| **Arquitetura** | API-first: Hermes Agent (chat) + Homeserver (dashboard) |

---

## Estrutura do Projeto

```
hermes-remote/
├── public/                # Frontend estático (PWA)
│   ├── index.html         # Entry point
│   ├── css/               # Estilos (tokens, componentes)
│   ├── js/                # JavaScript da interface
│   ├── icons/             # Ícones PWA
│   ├── manifest.json      # Web App Manifest (instalação PWA)
│   └── sw.js              # Service Worker
├── server.js              # Backend Node.js + Express (gateway)
├── setup.sh               # Instalador interativo guiado
├── deploy.sh              # Script de deploy
├── .env.example           # Template de configuração
├── docs/                  # Documentação detalhada
│   ├── architecture/      # ARCHITECTURE.md (topologia, camadas)
│   ├── decisions/         # ADRs (decisões de arquitetura)
│   ├── design/            # Identidade visual + tokens + UI guidelines
│   ├── reference/         # API, AUTH, ENV_VARS, contrato de backend
│   ├── how-to/            # Setup, deploy, desenvolvimento local, segurança
│   ├── troubleshooting/   # FAQ + problemas conhecidos
│   └── README.md          # Índice da documentação
├── scripts/               # Scripts utilitários
├── .github/               # Workflows de CI/CD
└── SECURITY.md            # Política de segurança
```

---

## Instalação

**Requisitos:** Node.js 20+, npm.

**Modo mais rápido — instalador interativo:**

```bash
npm install   # ou: rode direto (o setup também instala)
bash setup.sh # guiado passo a passo (detecta ambiente, auto-preenche, valida)
```

Ou, sem prompts (usa defaults + mantém o `.env` existente):

```bash
bash setup.sh --auto
```

**Manualmente:**

```bash
npm install
cp .env.example .env   # preencha (ver tabela abaixo)
npm start
```

Abra http://localhost:3000 — ou instale como PWA no celular (requer HTTPS).

### Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `PORT` | não | Porta do servidor (padrão 3000) |
| `HERMES_URL` | sim (chat) | URL do Hermes API server (ex.: `http://127.0.0.1:8642`) |
| `HERMES_API_KEY` | sim (chat) | Chave do API server (`API_SERVER_KEY` do Hermes) |
| `HERMES_TIMEOUT` | não | Timeout das chamadas ao Hermes (segundos) |
| `NOTEBOOK_IP` / `HOMESERVER_IP` | p/ dashboard | IPs tailnet das máquinas |
| `HOMESERVER_SSH_USER` | p/ ações remotas | Usuário SSH (ex.: `usuario`) |
| `HOMESERVER_PATH` | p/ ações remotas | Path dos scripts do homeserver no servidor |
| `HOMESERVER_HOST` | para `deploy.sh` | Host de deploy (ex.: `usuario@homeserver`) |

---

## Documentação

- [`docs/README.md`](docs/README.md) — Índice completo da documentação
- [`docs/architecture/ARCHITECTURE.md`](docs/architecture/ARCHITECTURE.md) — Topologia, camadas e decisões do v2
- [`docs/reference/backend-contract.md`](docs/reference/backend-contract.md) — Contrato de backend: plugue QUALQUER servidor
- [`docs/design/tokens.md`](docs/design/tokens.md) — Design tokens
- [`SECURITY.md`](SECURITY.md) — Política de segurança

---

## Status

**Em reestruturação (v2)** — base documental completa (arquitetura, ADRs, API, how-to); implementação do v2 em andamento conforme `docs/architecture/ARCHITECTURE.md`.

---

## Licença

MIT — consulte [`LICENSE`](LICENSE).