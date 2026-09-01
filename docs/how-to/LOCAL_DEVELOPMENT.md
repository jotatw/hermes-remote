# Desenvolvimento Local

> Executar o Hermes Remote no notebook para desenvolvimento. O servidor roda
> como um gateway local, consumindo APIs do Hermes e do homeserver.

## Iniciar o servidor

```bash
npm start
```

O servidor sobe na porta definida em `.env` (default `3000`). Serve o PWA em
`http://localhost:3002` (ajuste conforme a porta mapeada).

## Hot-reload (dev)

```bash
npm run dev
```

Usa `node --watch server.js` — reinicia automaticamente ao alterar o servidor.

## Estrutura

- `public/` — frontend (HTML, CSS, JS, manifest, service worker)
- `server.js` — gateway Express (~300 linhas)
- `setup.sh` / `deploy.sh` — instalação e publicação

## Testar endpoints

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/status
```

## Dependências

- `npm install` — instala express, cors, dotenv
- Sem build step — o frontend é vanilla JS, servido como estático.