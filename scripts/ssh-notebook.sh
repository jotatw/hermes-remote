#!/usr/bin/env bash
# Consulta status do notebook via SSH — retorna uptime, RAM, disco
# Formato de saída (uma linha por campo):
#   uptime
#   ---
#   RAM usado/total
#   ---
#   DISCO usado/total (pct)
# Uso: ssh-notebook.sh <IP-do-notebook>
set -uo pipefail

HOST="${1:-}"
if [ -z "$HOST" ]; then
  echo "USO: ssh-notebook.sh <IP>" >&2
  exit 1
fi

REMOTE_CMD='uptime -p; echo ---; free -h | grep Mem | awk "{print \$3\"/\"\$2}"; echo ---; df -h / | tail -1 | awk "{print \$3\"/\"\$2 \" (\" \$5 \")\"}"'

# ssh com BatchMode=yes: não pede senha — se a chave não estiver configurada, falha rápido
ssh -o ConnectTimeout=6 -o BatchMode=yes "usuario@${HOST}" "$REMOTE_CMD" 2>/dev/null
