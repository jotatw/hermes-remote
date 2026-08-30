#!/usr/bin/env bash
# ==========================================================
# scan-secrets.sh — varredura de dados sensíveis no repositório
#
# Uso: bash scripts/scan-secrets.sh
# Roda no repo atual. Procura no histórico COMPLETO (git log --all):
#   1. padrões de token/chave (sk-, ghp_, AKIA, Bearer <valor>)
#   2. arquivos de credenciais versionados
#   3. emails pessoais
#   4. IPs de rede privada / tailnet
#   5. nomes pessoais (usuario, usuario, rosangela)
#   6. caminhos pessoais (/home/<usuario>, /srv/git)
#   7. URLs reais do tailnet
#
# O resultado é um RELATÓRIO, não uma correção. Rodar antes de
# qualquer push em repo público (ou automatizar no CI).
# ==========================================================

set -u
cd "$(dirname "$0")/.." || exit 1

echo "=== 1. Padrões de token/chave no histórico"
git log --all -p 2>/dev/null |
  grep -aoE "(sk-[a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{20,}|gho_[a-zA-Z0-9]{20,}|AKIA[0-9A-Z]{16}|xox[baprs]-[a-zA-Z0-9-]{10,}|Bearer [A-Za-z0-9._-]{20,})" |
  sort -u | head -20

echo
echo "=== 2. Arquivos de credenciais versionados?"
git log --all --oneline --name-only --diff-filter=A |
  grep -iE "credential|secret|senha|\.env(\.|$)|password" | sort -u | head -20

echo
echo "=== 3. Emails nos autores dos commits"
git log --all --format="%ae %an" | sort -u

echo
echo "=== 4. IPs privados / tailnet no histórico"
git log --all -p 2>/dev/null |
  grep -aoE "(192\.168\.[0-9]+\.[0-9]+|10\.[0-9]+\.[0-9]+\.[0-9]+|172\.(1[6-9]|2[0-9]|3[01])\.[0-9]+\.[0-9]+|100\.[0-9]+\.[0-9]+\.[0-9]+)" |
  sort -u | head -20

echo
echo "=== 5. Nomes pessoais no histórico"
for nome in usuario usuario rosangela; do
  git log --all -p 2>/dev/null | grep -a "$nome" | head -3
done

echo
echo "=== 6. Caminhos pessoais no histórico"
git log --all -p 2>/dev/null | grep -aE "/home/[a-z]+|/srv/git|/srv/scripts" | head -5

echo
echo "=== 7. URLs reais do tailnet"
git log --all -p 2>/dev/null | grep -aoE "https://[a-z0-9-]+\.tail[0-9a-f]+\.ts\.net" | sort -u | head -10

echo
echo "=== 8. .env no índice (não pode existir)"
git ls-files | grep -c "^\.env$" | sed 's/^/ocorrências: /'

echo
echo "Varredura concluída. Classificar achados e decidir com o usuário."
