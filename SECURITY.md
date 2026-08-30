# 🔒 Segurança — Hermes Remote

Políticas e práticas de segurança deste repositório público.

## Modelo de ameaça

Este projeto conecta a um **Hermes Agent** pessoal (chat, dashboard de infraestrutura e
ações de energia via SSH). É um painel de controle de máquinas pessoais — por isso a
postura de segurança é conservadora.

## O que NUNCA deve estar neste repositório

| Item | Onde deve viver |
|---|---|
| `HERMES_API_KEY` | `.env` local (nunca commitado) |
| IPs reais (tailnet/LAN) | `.env` (`NOTEBOOK_IP`, `HOMESERVER_IP`) |
| Usuário SSH real | `.env` (`HOMESERVER_SSH_USER`) |
| Paths reais do servidor | `.env` (`HOMESERVER_PATH`) |
| Emails/nomes pessoais | em nenhum lugar — use `usuario@example.com` |

## Reportar uma vulnerabilidade

Este é um projeto pessoal. Para reportar um problema de segurança:

1. **Não abra issue pública** com dados sensíveis.
2. Envie um email para o mantenedor (via perfil do GitHub) ou abra uma issue
   **privada** descrevendo a falha **sem** incluir chaves, tokens ou IPs.

## Práticas de deploy

- `deploy.sh` sincroniza via rsync **excluindo `.env`** — o arquivo de segredos
  nunca viaja para o repo.
- O serviço roda atrás de **HTTPS** (Caddy/Tailscale) com autenticação no API server.
- Se você for expor publicamente, proteja as rotas `/api/*` atrás de autenticação.

## Scan automatizado

- `scripts/scan-secrets.sh` — varre o histórico completo por segredos/padrões.
- Rodar **antes de cada push** (ou confiar no CI, que executa o mesmo scan).

## Dependências

Mantenha as dependências atualizadas (`npm audit`) e use versões pinadas
(`package-lock.json` commitado).
