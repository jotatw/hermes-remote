# Hermes Remote

**Painel de controle móvel (PWA) para o [Hermes Agent](https://hermes-agent.nousresearch.com)**
— dashboard do seu servidor, chat com o assistente e ações de energia, direto do celular.

> 📱 Mobile-first · 🌙 Dark-first (estilo Linear) · 💬 Chat estilo Intercom

---

## O que é (e o que NÃO é)

**É:** uma interface web instalável (PWA) para quem **já roda o Hermes Agent** e quer
controlar o assistente e o servidor pelo celular — sem abrir terminal.

**NÃO é:** um assistente de IA standalone. Sem um Hermes Agent acessível (com o
API server habilitado), o app não tem com o que conversar nem o que monitorar.

### Para quem serve

| Perfil | O que ganha |
|---|---|
| Quem roda **Hermes Agent num servidor** (self-host) | Chat no celular + dashboard de saúde do servidor |
| Quem tem **1 servidor + 1 notebook** (setup típico do autor) | Monitora os dois, controla energia (dormir/acordar) |
| Quem usa **Tailscale/HTTPS** para acesso remoto | PWA instalável na tela inicial, seguro |

---

## Dependências (leia antes)

Este projeto **depende de infraestrutura externa** — não funciona sozinho:

| Dependência | Obrigatória? | Para quê |
|---|---|---|
| **Hermes Agent** (gateway + API server) | ✅ Sim | Chat, modelos, cota de IA |
| **Homeserver** (Linux com scripts) | 🟡 p/ dashboard | Saúde, containers, temperatura, ações de energia |
| **Tailscale** (ou Caddy + HTTPS) | 🟡 p/ PWA remoto | Instalar como app no celular (HTTPS) |

> 💡 **Mínimo viável:** só com o Hermes Agent você já usa o **chat**.
> Dashboard/servidor/ações precisam do homeserver acessível (local ou via SSH/Tailscale).

### O que o app faz com cada peça

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
| 📊 **Dashboard** | Notebook/servidor/cota, ações rápidas, agenda de energia | Homeserver + API |
| 💬 **Chat** | Conversa com o assistente (streaming, temas, conversas, tarefas) | Hermes API server |
| 🖥️ **Servidor** | Containers, temperatura, energia, diário de saúde | Homeserver (SSH) |
| ⚙️ **Configurações** | URL/chave do API server, host SSH, teste de conexão | — |

---

## Instalação

```bash
npm install
cp .env.example .env   # preencha (ver tabela abaixo)
npm start
```

Abra http://localhost:3000 — ou instale como PWA no celular (requer HTTPS).

## Variáveis de ambiente

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

- [`docs/guia-geral.md`](docs/guia-geral.md) — **comece aqui**: o que é, para quem, dependências, arquitetura
- [`docs/README.md`](docs/README.md) — índice completo de documentação
- [`docs/design/tokens.md`](docs/design/tokens.md) — design tokens (camadas A1/A2/B-slot)
- [`SECURITY.md`](SECURITY.md) — política de segurança

## Licença

MIT
