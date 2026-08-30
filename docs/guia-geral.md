# 🧭 Guia Geral — Hermes Remote

> **Comece aqui.** Este guia explica o que é o Hermes Remote, do que ele depende,
> para quem serve e como ele se encaixa no ecossistema Hermes Agent + homeserver.

---

## 1. O que é o Hermes Remote?

Um **PWA (Progressive Web App)** que vira um painel de controle no seu celular para:

- 💬 **Conversar** com o seu Hermes Agent (chat com streaming)
- 📊 **Monitorar** o servidor (uptime, RAM, disco, containers, temperatura)
- ⚡ **Controlar energia** (dormir/acordar o servidor)
- 🛠️ **Executar ações** (diário de saúde, code review)

É uma **interface**, não um assistente. Ele **conecta** ao Hermes Agent e aos
scripts do homeserver — se essas peças não existirem, o app não tem o que fazer.

---

## 2. Ecossistema (do que ele depende)

```
┌─────────────────────────────────────────────────────────┐
│                      SEU CELULAR                        │
│              Hermes Remote (PWA instalado)              │
│         dashboard · chat · servidor · config            │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS (Tailscale/Caddy)
┌──────────────────────▼──────────────────────────────────┐
│                  HERMES REMOTE (Node)                   │
│         server.js — proxy fino + rotas /api/*           │
└──────┬───────────────────────────────┬──────────────────┘
       │ /v1/models, /v1/chat          │ /api/status, /api/servidor,
       │ /v1/chat/completions          │ /api/power, /api/acao/*
┌──────▼───────────────┐      ┌────────▼──────────────────┐
│   HERMES AGENT       │      │      HOMESERVER          │
│  (gateway + API      │      │  (Linux + scripts +      │
│   server :8642)      │      │   Tailscale + Docker)    │
└──────────────────────┘      └──────────────────────────┘
```

| Camada | Papel | Acesso |
|---|---|---|
| **Celular** | Roda o PWA (instalado na tela inicial) | HTTPS via Tailscale/Caddy |
| **Hermes Remote** | Servidor Node — serve o frontend + proxy para o Hermes | Roda no homeserver (ou qualquer máquina) |
| **Hermes Agent** | O assistente de IA — expõe API OpenAI-compatível | `HERMES_URL` + `HERMES_API_KEY` |
| **Homeserver** | Máquina monitorada — scripts de saúde, energia, Docker | Local ou SSH (`HOMESERVER_*`) |

---

## 3. Dependências em detalhe

### 3.1 Hermes Agent (obrigatório para chat)

O Hermes Agent é o assistente. O Hermes Remote conversa com ele via **API server**
(OpenAI-compatible, porta padrão `8642`).

**Requisitos no Hermes:**
1. `API_SERVER_KEY` definido no `.env` do Hermes (habilita o API server)
2. API server escutando em `HERMES_URL` (ex.: `http://127.0.0.1:8642`)
3. Modelos configurados (provider + chaves de API)

> Sem isso: o chat não funciona. Dashboard/servidor ainda funcionam.

### 3.2 Homeserver (necessário para dashboard/ações)

O dashboard lê saúde do servidor e executa ações. Se o Hermes Remote roda **no
próprio homeserver**, ele detecta (`IS_HOMESERVER`) e usa comandos locais.
Se roda em outra máquina, usa **SSH** (`HOMESERVER_IP` + `HOMESERVER_SSH_USER`).

**O Hermes Remote não impõe scripts específicos** — ele define um *contrato* de
comandos configuráveis (`HS_*_CMD` no `.env`). Você pluga o **seu** servidor:

- `HS_HEALTH_CMD` / `HS_DIARIO_CMD` — saúde (incl. temperatura)
- `HS_POWER_CMD` — agendamento de energia (JSON)
- `HS_SLEEP_CMD` / `HS_WAKE_CMD` — energia
- `HS_REVIEW_CMD` — code review

> 📖 **Detalhes completos no [`contrato-homeserver.md`](contrato-homeserver.md)** —
> formato de saída, exemplo de JSON, e como plugar um servidor diferente.

> Sem homeserver: chat funciona; dashboard mostra "servidor offline".

### 3.3 Tailscale / HTTPS (necessário para PWA no celular)

Para **instalar o app no celular** e acessar de fora da LAN, você precisa de HTTPS:
- **Tailscale** (recomendado) — IPs privados `100.x`, MagicDNS, certificados
  HTTPS automáticos via `tailscale cert`
- **Caddy** — reverse proxy com certificado (pode usar o cert do Tailscale)

> Sem HTTPS: dá para usar em `http://<ip>:3002` no desktop, mas o PWA
> (instalação + service worker) exige HTTPS.

---

## 4. Para quem serve

### ✅ Ideal para

- **Usuários do Hermes Agent que fazem self-host** — querem o assistente no bolso
- **Setup "1 servidor + 1 notebook"** (como o do autor) — monitora as duas máquinas
- **Quem já tem Tailscale** — o PWA fica instalado e acessível em qualquer lugar
- **Quem quer um dashboard simples de saúde do servidor** — sem abrir terminal

### ⚠️ Não é para

- **Quem não usa Hermes Agent** — não há assistente para conversar
- **Quem quer um assistente pronto** (ChatGPT-like) — isso é o Hermes, não este app
- **Multi-tenant / uso comercial** — é um painel pessoal de máquinas

---

## 5. Modos de uso

| Modo | Configuração | O que funciona |
|---|---|---|
| **Mínimo (só chat)** | `HERMES_URL` + `HERMES_API_KEY` | Chat, modelos |
| **Local (no homeserver)** | Roda no homeserver | Tudo (detecta automaticamente) |
| **Remoto (notebook → homeserver)** | + `HOMESERVER_IP`, `HOMESERVER_SSH_USER` | Tudo via SSH |
| **PWA no celular** | + HTTPS (Tailscale/Caddy) | Tudo + instalação |

---

## 6. Começando rápido

**Com o instalador (recomendado):**

```bash
# 1. Clone
git clone https://github.com/usuario/hermes-remote.git
cd hermes-remote

# 2. Rode o instalador (detecta ambiente, pergunta o essencial,
#    gera .env, instala deps, valida conexão e inicia)
bash setup.sh

# Sem prompts:
bash setup.sh --auto
```

**Manual:**

```bash
npm install
cp .env.example .env   # edite: HERMES_URL, HERMES_API_KEY (+ HOMESERVER_* se for monitorar)
npm start
```

Depois, para o celular: HTTPS + instalação do PWA (ver seção 3.3).

---

## 7. Referências

| Documento | O que é |
|---|---|
| [`README.md`](../README.md) | Visão geral curta |
| [`docs/README.md`](README.md) | Índice de documentação |
| [`docs/design/tokens.md`](design/tokens.md) | Design tokens do app |
| [`SECURITY.md`](../SECURITY.md) | Segurança — o que nunca versionar |
| [`docs/plano-publicacao.md`](plano-publicacao.md) | Histórico do plano de publicação |
