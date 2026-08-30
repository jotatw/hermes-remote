# ✅ Checklist final — antes de tornar hermes-remote público

> Rodar TODOS os itens e marcar antes de `gh repo edit --visibility public`.
> Escopo de risco: repositório pessoal de controle do Hermes Agent.

## 1. Segredos e dados pessoais

- [x] Nenhum `.env` no git (só `.env.example` com placeholders)
- [x] Nenhum token/chave real no histórico (scan-secrets.sh retorna vazio)
- [x] IPs tailnet real → `100.xx.xx.xx` (conteúdo e histórico)
- [x] Usuário SSH real → `usuario` (conteúdo e histórico)
- [x] Paths `/srv/...` → `/opt/homeserver` (conteúdo e histórico)
- [x] URLs tailnet reais → `tailnet.ts.net` (conteúdo e histórico)
- [x] Autor dos commits → genérico "Hermes Remote"
- [x] Emails pessoais ausentes

## 2. CI / segurança automatizada

- [ ] `.github/workflows/ci.yml` pushed (bloqueado: falta escopo `workflow`)
- [ ] Scan-secrets.sh versionado
- [ ] SECURITY.md versionado
- [ ] CI passando (lint + scan) após push

## 3. Documentação

- [x] README.md alinhado ao nome hermes-remote
- [x] docs/design/tokens.md URL genérica
- [x] docs/plano-publicacao.md atualizado
- [ ] Verificar que docs não citam infra real

## 4. App funcionando

- [x] Deploy funciona (HOMESERVER_HOST via .env)
- [x] /api/health, /api/status, /api/servidor OK
- [x] PWA instalável (manifest, sw v4)

## 5. Decisão final (usuário)

- [ ] Revisar este checklist com o usuário
- [ ] Tornar público: `gh repo edit --visibility public`

---

## Comandos úteis

```bash
# Rodar o scan local
bash scripts/scan-secrets.sh

# Ver escopos do token
gh auth status

# Tornar público (depois de tudo OK)
gh repo edit --visibility public

# Se precisar re-sincronizar após force push
git fetch origin && git reset --hard origin/master
```
