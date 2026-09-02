# Plano: Centralização dos Serviços do Homeserver no Hermes Remote

> Criado: 2026-09-02
> Contexto: Após migrar o gateway para o homeserver e acumular scripts de energia,
> backup, automações e monitoramento espalhados, decidiu-se centralizar tudo no
> Hermes Remote como painel único de controle.

---

## 1. Situação Atual

### Serviços conhecidos (inventário de 2026-09-02)

| Categoria | Serviço | Status | Observação |
|-----------|---------|--------|------------|
| **Infra** | `homepage` (:3000) | ✅ Ativo | Dashboard visual |
| | `caddy` (:80/:443) | ✅ Ativo | Proxy reverso / TLS |
| | `gitea` (:3001) | ✅ Ativo | Git local |
| | `files` (:8080) | ✅ Ativo | FileBrowser |
| | `api-api-1` (:8000) | ✅ Ativo | API do HS |
| **Energia** | `hs-power-save.service` | ✅ Ativo | Boot economy |
| | `hs-task-auto-suspend.timer` | ✅ Ativo | A cada 5min |
| | `hs-task-night-off.timer` | ✅ Ativo | 22:00 |
| | `energy-watchdog.sh` (cron) | ✅ Ativo | A cada 30min |
| **Backup** | Pendrive 15G ext4 | ✅ Montado | `/srv/backup` |
| | `hs-task-backup.timer` | ✅ Ativo | 07:30 |
| | `hs-task-backup-check.timer` | ✅ Ativo | 08:30 |
| **Sincronia** | `hs-syncthing.service` | ✅ Ativo | Celular → servidor |
| **Automação** | `hs-watch-fotos.service` | ❌ Falha | Permissão logs |
| | `hs-space.service` | ⚠️ Inativo | Espaço em disco |
| | `hs-verify.service` | ⚠️ Inativo | Integridade snapshots |
| | `hs-events.service` | ❌ Falha | Script do notebook (inexistente) |
| **Monitor** | `watchdog-energia` (cron) | ✅ Ativo | A cada 30min |
| | `homeserver-health-digest.sh` | ✅ Script | Envia para Telegram |
| | `service-watchdog.sh` | ✅ Ativo | A cada 15min |
| **Rede** | Tailscale | ✅ Ativo | Mesh: notebook, homeserver, celular |
| | SSH tunnel 8642 | ✅ Ativo | Notebook → homeserver |

### Dados que já existem como JSON

- `hs.sh system status` → host, CPU, RAM, disco, containers, backup, WOL, storage
- `hs.sh scheduler list` → tarefas agendadas
- `hs.sh hardware temp` → temperatura
- `hs.sh power status` → energia
- Hermes Remote `/api/servidor` → containers + temperatura
- Hermes Remote `/api/status` → notebook + servidor + cota

---

## 2. Problemas a Resolver

1. **Dados espalhados**: `hs.sh` é CLI (não HTTP), Hermes Remote só mostra containers,
   Homepage é dashboard estático, Telegram é texto.
2. **Sem visão unificada**: não há um lugar que responda "o que está funcionando agora?"
3. **Serviços quebrados**: `hs-events` (script inexistente), `hs-watch-fotos` (permissão),
   `hs-verify` e `hs-space` parados.
4. **fstab duplicado**: entrada do pendrive repetida 3×.
5. **Sem API de status**: nenhum endpoint HTTP agrega todos os serviços.

---

## 3. Arquitetura Proposta

```
HERMES REMOTE (hub central — déjà existente, expandir)
┌─────────────────────────────────────────────────────┐
│  Frontend PWA (hash router + views)                 │
│  ├── 🏠 Home     — dashboard resumo                 │
│  ├── 💬 Chat     — Hermes IA                        │
│  ├── 🖥️ Servidor — containers + serviços + energia │
│  └── ⚙️ Config   — conexões                         │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP (localhost:3002)
                       ▼
┌──────────────────────────────────────────────────────┐
│  server.js (Express — proxy + agregador)             │
│                                                      │
│  Endpoints existentes:                               │
│  ├── /api/health      — saúde do gateway             │
│  ├── /api/status      — notebook + servidor + cota   │
│  ├── /api/servidor    — containers + temperatura     │
│  ├── /api/chat        — chat com Hermes              │
│  ├── /api/acoes       — histórico de ações           │
│  ├── /api/power       — agenda de energia            │
│  ├── /api/acao/*      — dormir, acordar, diário      │
│  │                                                    │
│  └── NOVO: /api/servicos                              │
│       ├── Containers Docker (docker ps)               │
│       ├── Serviços systemd hs-* (status)              │
│       ├── Timers ativos (systemctl list-timers)       │
│       ├── Tarefas do scheduler (hs.sh scheduler list) │
│       ├── Backup (pendrive montado + último backup)   │
│       ├── Energia (GPU, timer, power-save)            │
│       └── Syncthing                                   │
└──────────────────────┬──────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
   hs.sh CLI     systemctl      docker ps
   (JSON)        (status)       (containers)
```

---

## 4. Etapas de Implementação

### ✅ Fase 0 — Fundação (já feito)
- [x] Repositório privado (`jotatw/hermes-remote`)
- [x] ARCHITECTURE.md documentado
- [x] ADRs (001 a 005) registrados
- [x] PWA funcional com router, views, store, API client
- [x] Deploy no homeserver (`~/apps/chat-web`, porta 3002)

### 🔲 Fase 1 — Endpoint `/api/servicos` (API central)
- [ ] Criar endpoint que agrega:
  - `hs.sh system status` (JSON) → host, containers, backup
  - `hs.sh scheduler list` → tarefas agendadas
  - `systemctl is-active` para cada serviço `hs-*`
  - `systemctl list-timers` → timers ativos
  - `mountpoint -q /srv/backup` → pendrive montado?
  - `df -h /srv/backup` → espaço do backup
  - `tail -1 /var/log/hs-auto-suspend.log` → última ação de energia
- [ ] Formato: `{ "timestamp", "servicos": [...], "timers": [...], "backup": {...}, "energia": {...} }`
- [ ] Cache curto (~30s) para não sobrecarregar o servidor
- [ ] Proteger com auth (mesmo padrão dos outros endpoints)

### 🔲 Fase 2 — View "Serviços" no frontend
- [ ] Nova view `servicos.js` (rota `#/servicos`)
- [ ] Semáforo 🟢🔴 por serviço
- [ ] Cards por categoria: Infra, Energia, Backup, Automação, Monitor
- [ ] Auto-refresh a cada 30s
- [ ] Indicador de pendrive montado + espaço livre

### 🔲 Fase 3 — Corrigir serviços quebrados
- [ ] `hs-watch-fotos.service`: `chown -R joao:joao /srv/automations/logs/`
- [ ] `hs-events.service`: `systemctl disable --now hs-events.service hs-events.timer`
- [ ] `hs-verify.service` e `hs-space.service`: investigar se devem ser reativados
- [ ] Limpar entradas duplicadas do fstab (pendrive repetido 3×)

### 🔲 Fase 4 — Dashboard da Homepage como complemento
- [ ] Manter Homepage (:3000) como dashboard visual rápido
- [ ] Widget customapi para `/api/servicos` (já tem padrão com Hermes IA)
- [ ] Homepage = resumo, Hermes Remote = controle completo

### 🔲 Fase 5 — Documentação
- [ ] Atualizar ARCHITECTURE.md com o novo endpoint `/api/servicos`
- [ ] Documentar a view Serviços
- [ ] Manter runbook de energia (`runbook-energia.md`) referenciado

---

## 5. Decisões de Arquitetura

| Decisão | Opção escolhida | Alternativa descartada |
|---------|----------------|----------------------|
| Onde hospedar a API de status | No Hermes Remote (server.js) | API nova separada (overhead) |
| Fonte da verdade | `hs.sh` CLI (já existe) | Scripts ad-hoc (duplicação) |
| Como consumir no frontend | View PWA dedicada (`#/servicos`) | Widget Homepage (só visual) |
| Periodicidade de refresh | 30s (polling) | WebSocket (complexidade extra) |
| Cache do endpoint | 30s em memória no server.js | Sem cache (múltiplas chamadas por view) |

---

## 6. Dependências

- `hs.sh` funcional no homeserver (já instalado em `/srv/git/homeserver/core/hs.sh`)
- Node.js no homeserver (já instalado para o chat-web)
- Acesso SSH local (não precisa de senha — o server.js roda no próprio homeserver)
- `systemctl` acessível (roda como `joao`, sem sudo — apenas `is-active` que não precisa de root)

---

## 7. Riscos

- `hs.sh system status` pode demorar → timeout no endpoint. Mitigação: timeout de 5s, fallback silencioso.
- Serviço systemd pode estar em estado inesperado. Mitigação: mostrar `unknown` em vez de quebrar.
- Pendrive pode ser removido. Mitigação: `mountpoint -q` + `df` com fallback.
- Notebook dormindo → `/api/servicos` mostra notebook como offline (comportamento esperado).