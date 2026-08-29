#!/usr/bin/env bash
# deploy.sh — Sincroniza o app com o homeserver e reinicia o serviço
# Uso: bash deploy.sh
set -euo pipefail

echo "📦 Sincronizando com homeserver..."
rsync -az --exclude node_modules --exclude .git --exclude .env --delete \
  ~/IdeaProjects/chat-web/ usuario@homeserver:~/apps/chat-web/

echo "🔄 Reiniciando serviço..."
ssh usuario@homeserver 'systemctl --user restart chat-web.service'

echo "⏳ Aguardando..."
sleep 2

echo "📋 Status:"
ssh usuario@homeserver 'systemctl --user status chat-web.service --no-pager | grep Active'

echo "✅ Deploy concluído: http://100.118.xx.xx:3002"