# FAQ

> Perguntas frequentes sobre o Hermes Remote.

## Chat não responde — o que pode ser?

O Hermes Agent roda no **notebook**. Se o notebook está desligado ou dormindo,
o chat fica indisponível (decisão registrada em ADR-004). Verifique:

1. O notebook está ligado?
2. O Hermes API server está de pé? (`curl http://<notebook-ip>:8642/health`)
3. O `HERMES_URL` e `HERMES_API_KEY` no `.env` do gateway estão corretos?

## O app mostra uma versão antiga depois de um deploy

O service worker cacheia o app. Após o deploy, faça bump da versão do cache
(`hermes-remote-v<NN>` no `sw.js`) e recarregue com force-refresh (Ctrl+Shift+R).

## "Servidor offline" no dashboard

O gateway não conseguiu coletar dados do homeserver. Verifique:

- O `HOMESERVER_IP` e `HOMESERVER_SSH_USER` estão no `.env`?
- A chave SSH para o homeserver está configurada?
- Os comandos `HS_*_CMD` funcionam manualmente no servidor?
- Teste a API localmente: `curl http://localhost:3000/api/status`

## Como acessar de fora da rede local?

Via Tailscale (VPN mesh). O gateway fica em
`https://homeserver.tail*.ts.net`. Todo acesso remoto é HTTPS.

## Onde ficam as credenciais?

No `.env` do gateway, que **nunca** é commitado. O repo público só tem
`.env.example` com placeholders. Ver `docs/reference/ENV_VARS.md`.