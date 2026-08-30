#!/usr/bin/env bash
# deploy.sh — Sincroniza o app com o homeserver e reinicia o serviço
# Uso: bash deploy.sh
# Requer: HOMESERVER_HOST definido no .env (ex.: usuario@homeserver)
set -euo pipefail

# Carrega variáveis do .env local (HOMESERVER_HOST etc.) se existir
if [ -f .env ]; then
  set -a; . ./.env; set +a
fi

HOST="${HOMESERVER_HOST:-usuario@homeserver}"

echo "📦 Sincronizando com homeserver..."
rsync -az --exclude node_modules --exclude .git --exclude .env --delete \
  ~/IdeaProjects/chat-web/ "${HOST}:~/apps/chat-web/"

echo "🔄 Reiniciando serviço..."
ssh "${HOST}" 'systemctl --user restart chat-web.service'

echo "⏳ Aguardando..."
sleep 2

echo "📋 Status:"
ssh "${HOST}" 'systemctl --user status chat-web.service --no-pager | grep Active'

echo "✅ Deploy concluído: http://homeserver.tailnet.ts.net"