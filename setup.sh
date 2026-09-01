#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# Hermes Remote — Instalador interativo
#
# Uso:
#   bash setup.sh          → instala guiado (perguntas passo a passo)
#   bash setup.sh --auto   → instala com defaults + prompts mínimos
#   bash setup.sh --help   → esta ajuda
#
# O que faz:
#   1. Detecta o ambiente (homeserver local vs máquina remota)
#   2. Detecta IPs Tailscale, paths e scripts existentes
#   3. Gera o .env com defaults inteligentes (sem sobrescrever)
#   4. Instala dependências (npm install)
#   5. Valida a configuração (testa conexão com o Hermes API server)
#   6. Inicia o servidor
#
# Requisitos: Node.js ≥ 18, npm. Opcional: Tailscale, curl.
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

# ── Cores (com fallback se não tiver tty) ──────────────────────
if [ -t 1 ]; then
  C_GREEN=$'\e[32m'; C_CYAN=$'\e[36m'; C_YELLOW=$'\e[33m'
  C_RED=$'\e[31m'; C_BOLD=$'\e[1m'; C_DIM=$'\e[2m'; C_RESET=$'\e[0m'
else
  C_GREEN=''; C_CYAN=''; C_YELLOW=''; C_RED=''; C_BOLD=''; C_DIM=''; C_RESET=''
fi

log()  { echo "${C_CYAN}◆${C_RESET} $*"; }
ok()   { echo "${C_GREEN}✔${C_RESET} $*"; }
warn() { echo "${C_YELLOW}⚠${C_RESET} $*"; }
err()  { echo "${C_RED}✘${C_RESET} $*" >&2; }
ask()  { printf "${C_CYAN}?${C_RESET} %s " "$1"; }
title(){ echo; echo "${C_BOLD}══ $* ══${C_RESET}"; }

# ── Help ───────────────────────────────────────────────────────
if [ "${1:-}" = "--help" ] || [ "${1:-}" = "-h" ]; then
  sed -n '2,20p' "$0" | sed 's/^# \{0,1\}//'
  exit 0
fi

AUTO=0
[ "${1:-}" = "--auto" ] && AUTO=1

cd "$(dirname "$0")"

# ── 0. Requisitos ──────────────────────────────────────────────
title "Requisitos"
if ! command -v node >/dev/null 2>&1; then
  err "Node.js não encontrado. Instale Node ≥ 18 (https://nodejs.org) e rode novamente."
  exit 1
fi
NODE_MAJOR=$(node -e "console.log(process.versions.node.split('.')[0])" 2>/dev/null || echo "0")
if [ "$NODE_MAJOR" -lt 18 ]; then
  err "Node.js muito antigo (v$NODE_MAJOR). Precisa de ≥ 18."
  exit 1
fi
ok "Node.js $(node -v) detectado"
command -v npm >/dev/null 2>&1 && ok "npm detectado" || warn "npm não encontrado (Node costuma incluir)"

# ── 1. Detecção do ambiente ────────────────────────────────────
title "Detecção de ambiente"
HOSTNAME=$(hostname 2>/dev/null | tr 'A-Z' 'a-z' || echo "desconhecido")
IS_HOMESERVER=0
echo "$HOSTNAME" | grep -q "homeserver" && IS_HOMESERVER=1

if [ "$IS_HOMESERVER" = "1" ]; then
  ok "Rodando no HOMESERVER ('$HOSTNAME') — ações e dashboard serão locais."
else
  ok "Rodando em máquina remota ('$HOSTNAME') — ações no homeserver via SSH."
fi

# Auto-detecta IPs Tailscale
get_tailscale_ips() {
  command -v tailscale >/dev/null 2>&1 && tailscale ip -4 2>/dev/null | tr '\n' ' ' || echo ""
}
TAIL_IPS=$(get_tailscale_ips)
if [ -n "$TAIL_IPS" ]; then
  ok "Tailscale detectado: IPs $TAIL_IPS"
else
  warn "Tailscale não detectado (opcional — só para acesso remoto/PWA)."
fi

# ── 2. Configuração (lê .env existente se houver) ──────────────
title "Configuração"

ENV_FILE=".env"
ENV_EXAMPLE=".env.example"

# Função: ler valor do .env se existir
get_env() {
  [ -f "$ENV_FILE" ] && grep -E "^$1=" "$ENV_FILE" 2>/dev/null | head -1 | cut -d= -f2- || echo ""
}

# Defaults inteligentes
DEFAULT_HERMES_URL=$(get_env HERMES_URL || echo "http://127.0.0.1:8642")

# Pergunta: HERMES_URL
CURRENT=$(get_env HERMES_URL)
if [ -n "$CURRENT" ]; then
  ok "HERMES_URL já configurado: $CURRENT (mantendo)"
  HERMES_URL="$CURRENT"
elif [ "$AUTO" = "1" ]; then
  HERMES_URL="$DEFAULT_HERMES_URL"
  ok "HERMES_URL = $HERMES_URL (auto)"
else
  ask "URL do Hermes API server [${DEFAULT_HERMES_URL}]:"
  read -r resp
  HERMES_URL="${resp:-$DEFAULT_HERMES_URL}"
fi

# Pergunta: HERMES_API_KEY
CURRENT=$(get_env HERMES_API_KEY)
if [ -n "$CURRENT" ]; then
  ok "HERMES_API_KEY já configurado (mantendo)"
  HERMES_API_KEY="$CURRENT"
elif [ "$AUTO" = "1" ]; then
  HERMES_API_KEY=""
  warn "HERMES_API_KEY vazio (auto) — configure depois no .env"
else
  ask "Chave API do Hermes (API_SERVER_KEY) [deixe vazio p/ configurar depois]:"
  read -r resp
  HERMES_API_KEY="$resp"
fi

# Infra: IPs tailnet
CURRENT=$(get_env HOMESERVER_IP)
if [ -n "$CURRENT" ]; then
  ok "HOMESERVER_IP já configurado (mantendo)"
else
  HOMESERVER_IP=""
  if [ "$IS_HOMESERVER" = "1" ]; then
    # No homeserver, detecta o próprio IP tailnet
    FIRST_IP=$(echo "$TAIL_IPS" | awk '{print $1}')
    if [ -n "$FIRST_IP" ]; then
      HOMESERVER_IP="$FIRST_IP"
      ok "HOMESERVER_IP auto-detectado: $FIRST_IP"
    fi
  elif [ "$AUTO" = "1" ]; then
    warn "HOMESERVER_IP vazio (auto) — configure no .env"
  else
    ask "IP do homeserver (Tailscale, ex.: 100.x.x.x) [deixe vazio p/ depois]:"
    read -r resp
    HOMESERVER_IP="$resp"
  fi
fi

# ── 3. Geração do .env ─────────────────────────────────────────
title "Gerando .env"

# Cria .env a partir do .env.example se não existir
if [ ! -f "$ENV_FILE" ]; then
  if [ -f "$ENV_EXAMPLE" ]; then
    cp "$ENV_EXAMPLE" "$ENV_FILE"
    ok ".env criado a partir de .env.example"
  else
    warn ".env.example não encontrado — criando .env mínimo"
    cat > "$ENV_FILE" <<'EOF'
PORT=3000
HERMES_URL=http://127.0.0.1:8642
HERMES_API_KEY=
HERMES_TIMEOUT=120
EOF
  fi
else
  ok ".env já existe (não sobrescrito)"
fi

# Preenche valores
set_env() {
  local key="$1" val="$2"
  if [ -n "$val" ]; then
    if grep -qE "^$key=" "$ENV_FILE"; then
      # Preserva se já tem valor real (não placeholder)
      local atual; atual=$(grep -E "^$key=" "$ENV_FILE" | head -1 | cut -d= -f2-)
      if [ -n "$atual" ] && ! echo "$atual" | grep -qE "xxx|usuario@homeserver|^$"; then
        return
      fi
      sed -i "s|^$key=.*|$key=$val|" "$ENV_FILE"
    else
      echo "$key=$val" >> "$ENV_FILE"
    fi
  fi
}

set_env "HERMES_URL"     "$HERMES_URL"
set_env "HERMES_API_KEY" "$HERMES_API_KEY"
[ -n "${HOMESERVER_IP:-}" ] && set_env "HOMESERVER_IP" "$HOMESERVER_IP"
# Path padrão dos scripts do servidor (configurável — veja docs/reference/backend-contract.md)
set_env "HOMESERVER_PATH" "/opt/homeserver"
[ "$IS_HOMESERVER" = "1" ] && set_env "HOMESERVER_SSH_USER" "${USER:-usuario}"
ok ".env atualizado"

# ── 4. Instalação de dependências ──────────────────────────────
title "Dependências"
if [ -d node_modules ]; then
  ok "node_modules já existe (pulando npm install)"
else
  log "Instalando dependências (npm install)..."
  npm install --no-audit --no-fund 2>&1 | tail -5 || { err "npm install falhou"; exit 1; }
  ok "Dependências instaladas"
fi

# ── 5. Validação ───────────────────────────────────────────────
title "Validação"
if [ -n "$HERMES_API_KEY" ]; then
  log "Testando conexão com o Hermes API server..."
  # Testa /v1/models com a chave
  TEST_URL="${HERMES_URL%/}"
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 \
    -H "Authorization: Bearer $HERMES_API_KEY" \
    "$TEST_URL/v1/models" 2>/dev/null || echo "000")
  case "$HTTP_CODE" in
    200) ok "Conexão com Hermes OK (HTTP 200)" ;;
    401) warn "Resposta 401 — chave API pode estar incorreta" ;;
    000) warn "Sem resposta do servidor — verifique HERMES_URL" ;;
    *)   warn "Resposta inesperada (HTTP $HTTP_CODE)" ;;
  esac
else
  warn "HERMES_API_KEY vazio — pule a validação por enquanto"
fi

# ── 6. Início ──────────────────────────────────────────────────
title "Iniciar"
if [ "$AUTO" = "1" ]; then
  log "Iniciando servidor..."
  PORT=$(get_env PORT || echo "3000")
  npm start > /tmp/hermes-remote-start.log 2>&1 &
  NODE_PID=$!
  sleep 3
  # Verifica se o processo está vivo e respondendo
  if kill -0 "$NODE_PID" 2>/dev/null; then
    if curl -s -o /dev/null --max-time 3 "http://127.0.0.1:$PORT/api/health" 2>/dev/null; then
      ok "Servidor rodando em http://localhost:$PORT"
    else
      warn "Servidor iniciou mas não respondeu em http://localhost:$PORT/api/health"
      warn "Log: /tmp/hermes-remote-start.log"
    fi
  else
    err "Servidor NÃO iniciou (porta $PORT ocupada ou erro)"
    err "Log: /tmp/hermes-remote-start.log"
    tail -5 /tmp/hermes-remote-start.log
  fi
else
  echo
  echo "  Para iniciar manualmente:"
  echo "    ${C_BOLD}npm start${C_RESET}   → http://localhost:$(get_env PORT || echo 3000)"
  echo "    ${C_BOLD}npm run dev${C_RESET} → modo desenvolvimento (auto-reload)"
  echo
  echo "  Para acesso remoto (PWA no celular): use Tailscale + HTTPS."
fi

echo
echo "${C_GREEN}${C_BOLD}✅ Hermes Remote pronto!${C_RESET}"
