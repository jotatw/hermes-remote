# Deploy

> Publica o app no homeserver e reinicia o serviço. Requer `HOMESERVER_HOST`
> definido no `.env` local (ex.: `usuario@homeserver`).

## Comando

```bash
bash deploy.sh
```

O que o script faz:

1. Carrega variáveis do `.env` local (se existir).
2. Sincroniza com o homeserver via rsync:

   ```bash
   rsync -az --exclude node_modules --exclude .git --exclude .env --delete \
     ~/IdeaProjects/chat-web/ "${HOST}:~/apps/chat-web/"
   ```

3. Reinicia o serviço:

   ```bash
   ssh "${HOST}" 'systemctl --user restart chat-web.service'
   ```

4. Mostra o status do serviço.

## Regras

- **`.env` nunca é sincronizado** (excluído no rsync) — o servidor tem o seu.
- **Service worker:** após cada deploy, faça bump da versão do cache
  (`hermes-remote-v<NN>`) no `sw.js` para invalidar clientes antigos.
- Verificação: `curl https://<gateway>/api/health` deve responder 200.
