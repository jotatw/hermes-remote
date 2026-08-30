# ✅ Checklist de publicação — hermes-remote (CONCLUÍDO)

> O repositório já está **público**. Este documento registra o que foi feito
> e o que manter daqui para frente.

## 1. Segredos e dados pessoais (feito)

- [x] Nenhum `.env` no git (só `.env.example` com placeholders)
- [x] Nenhum token/chave real no histórico (scan-secrets.sh retorna vazio)
- [x] IPs tailnet real → `100.xx.xx.xx` (conteúdo e histórico)
- [x] Usuário SSH real → `usuario` (conteúdo e histórico)
- [x] Paths `/srv/...` → `/opt/homeserver` (conteúdo e histórico)
- [x] URLs tailnet reais → `tailnet.ts.net` (conteúdo e histórico)
- [x] Autor dos commits → genérico "Hermes Remote"
- [x] Emails pessoais ausentes

## 2. CI / segurança automatizada (feito)

- [x] `.github/workflows/ci.yml` pushed e passando (lint + scan)
- [x] `scripts/scan-secrets.sh` versionado
- [x] `SECURITY.md` versionado

## 3. Documentação (feita)

- [x] README.md alinhado ao nome hermes-remote
- [x] docs/guia-geral.md (ecossistema + dependências)
- [x] docs/contrato-homeserver.md (contrato de backend)
- [x] docs/funcoes.md (mapa de funções)
- [x] Docs sem dados de infra real

## 4. Publicação (feita)

- [x] Repo renomeado de `chat-web` → `hermes-remote`
- [x] `gh repo edit --visibility public`

## 5. Manutenção contínua

- Rodar `bash scripts/scan-secrets.sh` antes de qualquer push
- Não adicionar dados pessoais em issues/PRs (usar `usuario`, `100.x.x.x`)
- Bump do cache do service worker (`sw.js`) ao mudar HTML/CSS/JS
- Manter `SECURITY.md` atualizado se o modelo de ameaça mudar
