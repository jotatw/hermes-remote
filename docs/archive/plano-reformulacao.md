# Plano de Reformulação: chat-web → PWA Hermes Remote

> ⚠️ Documento de planejamento — o plano foi **executado**. Ver `../README.md` para o estado atual.

## Objetivo
Transformar o chat-web no PWA do app mobile (dashboard + chat + servidor + configurações), trocando backend de 9Router para Hermes API server.

## ✅ Concluído

1. **server.js** — proxy de 9Router para Hermes API server + endpoints `/api/status` e `/api/acao/*`
2. **Frontend** — SPA com 4 telas (dashboard, chat, servidor, config) em `public/`
3. **PWA** — manifest.json + sw.js + ícones
4. **Limpeza** — docs antigos removidos, .env.example criado, .gitignore atualizado
5. **README** — novo README principal

## Estrutura final

```
chat-web/
├── server.js            # Proxy Express → Hermes API server
├── public/
│   ├── index.html       # SPA: dashboard, chat, servidor, config
│   ├── css/style.css    # Estilos (4 temas)
│   ├── js/              # app.js, dashboard.js, sidebar.js, todos.js
│   ├── manifest.json    # PWA manifest
│   ├── sw.js            # Service worker
│   └── icons/           # Ícones
├── .env.example
├── README.md
└── docs/README.md
```

## Pendências

- Habilitar Hermes API server (`API_SERVER_KEY` no .env do Hermes)
- Testar chat end-to-end quando o Hermes estiver com API server ativo
- Expor para o celular (Tailscale/Cloudflare/Caddy)