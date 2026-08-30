# 📋 Plano: Tornar hermes-remote Público

> **Objetivo:** tornar o [repositório hermes-remote](https://github.com/usuario/hermes-remote) público
> com segurança, sem expor dados pessoais/infraestrutura, e com melhorias contínuas.
> **Estado atual:** privado, 13 commits, 1 branch (master)

---

## ⚠️ Auditoria de Segurança — Achados

### Código atual (precisa limpeza antes de tornar público)

| # | Arquivo | O que expõe | Risco | Correção |
|---|---------|------------|-------|----------|
| 1 | `server.js:85-86` | IPs tailnet reais (ex.: `100.78.x.x`, `100.118.x.x`) | 🟡 Médio | Mover para `.env` (`NOTEBOOK_IP`, `HOMESERVER_IP`) |
| 2 | `server.js` (6 linhas) | Usuário real em comandos SSH | 🟡 Médio | Substituir por `usuario@` + var de ambiente |
| 3 | `server.js` (5 linhas) | Paths reais `/srv/.../homeserver/...` | 🟡 Médio | Mover para `.env` (`HOMESERVER_PATH`) |
| 4 | `deploy.sh:7-19` | `usuario@homeserver` + IP tailnet real | 🟡 Médio | Substituir por `HOMESERVER_HOST` (.env) |
| 5 | `docs/design/tokens.md:94` | URL real `homeserver.tailXXXXX.ts.net` | ⚪ Baixo | Substituir por `homeserver.tailnet.ts.net` (genérico) |

### Histórico git (requer decisão)

| Dado | Ocorrências no histórico | Risco |
|------|------------------------|-------|
| `usuario@homeserver` | 10 | 🟡 Médio |
| `/srv/.../homeserver` | 9 | 🟡 Médio |
| IPs tailnet | 3 (ex.: `100.118.x.x`×2, `100.78.x.x`×1) | 🟡 Médio |
| URL real | 1 (`homeserver.tailXXXXX.ts.net`) | ⚪ Baixo |

**Decisão:** 13 commits, reescrever com `git filter-repo` é barato e seguro. Único risco: força push. Mas o servidor roda via rsync (não git clone), então não há conflito. **Recomendado limpar o histórico.**

### ✅ Já OK (nada a fazer)

- `.env` nunca esteve no git ✓
- Nenhuma chave de API real no histórico ✓
- `.gitignore` correto (node_modules, .env, public/icons) ✓
- `.env.example` com placeholders ✓

---

## 📋 Tarefas (ordem de execução)

### Fase 1 — Limpeza do código atual (antes de tornar público)

1. `server.js`: extrair IPs, host, paths para variáveis de ambiente
2. `deploy.sh`: extrair host para `HOMESERVER_HOST` (.env)
3. `docs/design/tokens.md`: URL genérica
4. `server.js`: usuário real → `usuario@` + var de ambiente
5. Validar que o app ainda funciona com as variáveis de ambiente

### Fase 2 — Limpeza do histórico git

6. `git filter-repo` para remover IPs, nomes, paths reais
7. `git push --force origin master`
8. Sincronizar o notebook (clone fresco)

### Fase 3 — Melhorias contínuas (pós-publicação)

9. **Auditoria de segurança automatizada** — GitHub Secret Scanning (automático) + script de scan local
10. **CI/CD básico** — GitHub Actions para testar deploy (dry-run)
11. **README.md** — atualizar com instruções de deploy, variáveis de ambiente, screenshots
12. **Documentação de segurança** — SECURITY.md, CONTRIBUTING.md
13. **Melhorias de UX** pendentes (HomeServer App, Melody-Sync, etc.)

### Fase 4 — Tomar público

14. Revisão final do checklist de segurança
15. `gh repo edit --visibility public`
16. Anunciar/atualizar links

---

## 🛡️ Proteções contínuas (pós-publicação)

- **GitHub Secret Scanning** — cobre automaticamente repositórios públicos
- **Script de scan local** — rodar antes de cada `git push`
- **Regra**: nunca hardcodear IP/host/usuário/email — sempre `.env` + `.env.example`
- **Review de segurança** antes de merge de PRs externos

---

## 🔧 Dependências técnicas

- `git filter-repo` — `pip install git-filter-repo` (ou `sudo apt install git-filter-repo`)
- Variáveis de ambiente a adicionar no `.env.example`:
  ```
  HOMESERVER_IP=100.xxx.xxx.xxx
  NOTEBOOK_IP=100.xxx.xxx.xxx
  HOMESERVER_HOST=usuario@homeserver
  HOMESERVER_PATH=/opt/homeserver
  ```
- O servidor (homeserver) vai precisar do `.env` atualizado com os valores reais (já existe)

---

## 📊 Estimativa

| Fase | Tarefas | Esforço |
|------|---------|---------|
| 1 | 4-5 arquivos | ~30 min |
| 2 | git filter-repo + force push | ~15 min |
| 3 | Documentação + CI | ~30 min |
| 4 | Revisão + tornar público | ~5 min |

**Total:** ~1h20min para projeto completo.