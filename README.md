# Hermes Remote

PWA para controle remoto do **Hermes Agent** — dashboard, chat, servidor e configurações, direto do celular.

> ⚠️ **Repositório privado** — contém caminhos e configurações pessoais do ambiente.

## Funcionalidades

- 📊 **Dashboard** — visão geral do notebook, servidor e cota de IA
- 💬 **Chat** — converse com o assistente (streaming em tempo real, temas, sidebar com conversas)
- 🖥️ **Servidor** — saúde detalhada + ações de energia (dormir, diário)
- ⚙️ **Configurações** — URL do Hermes API server, chave e conexão

## Como rodar

```bash
npm install
cp .env.example .env   # preencha HERMES_URL e HERMES_API_KEY
npm start
```

Abra http://localhost:3000 (ou use o PWA no celular).

## Backend

O app conecta ao **Hermes API server** (`http://127.0.0.1:8642`), o listener
OpenAI-compatível do gateway Hermes. O `server.js` é um proxy fino que:

- Repassa `/v1/chat/completions` (chat + streaming) e `/v1/models` ao Hermes
- Expõe `/api/status` (notebook, servidor, cota) e `/api/acao/*` (diário, revisar, dormir)

Para acesso remoto do celular, exponha o servidor com **Tailscale**, **Cloudflare Tunnel**
ou **Caddy** com HTTPS + autenticação.

## Estrutura

```
chat-web/
├── server.js            # Proxy Express → Hermes API server
├── public/
│   ├── index.html       # SPA: dashboard, chat, servidor, config
│   ├── css/style.css    # Estilos (4 temas)
│   ├── js/              # app.js, dashboard.js, sidebar.js, todos.js
│   ├── manifest.json    # PWA manifest
│   ├── sw.js            # Service worker (cache offline)
│   └── icons/           # Ícones do PWA
├── .env.example         # Configuração (sem segredos)
└── docs/                # Documentação
```

## Documentação

- `docs/plano-reformulacao.md` — plano de transformação do chat-web para o PWA
- `docs/README.md` — índice de documentação

## Notas

- **Servidor dorme às 22h** (night-off) — o gateway no homeserver fica offline nesse período
- **Chat depende do Hermes API server** — habilite com `API_SERVER_KEY` no .env do Hermes
