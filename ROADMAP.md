# 🗺️ Roadmap — Hermes Remote

> **Princípio:** evoluir o que já funciona, validar cada etapa, não adicionar função desnecessária.
> Baseado no mapa de conexões real (docs/arquitetura.html).

## 🟢 Concluído (funcionando em produção)

| Funcionalidade | Status |
|---|---|
| Dashboard com dados do servidor (uptime, RAM, disco, load) | ✅ |
| Chat com streaming (hermes-agent → deepseek-v4-flash) | ✅ |
| Aba Servidor visual (cards, badges, chips de container) | ✅ |
| Diário de Saúde (Telegram + relatório inline no app) | ✅ |
| Dormir / Acordar servidor (auto-suspend.sh + WOL) | ✅ |
| Code Review (disparo no Hermes) | ✅ |
| Power Schedule (22:00 → 08:00) | ✅ |
| Histórico de ações com output detalhado expansível | ✅ |
| Notebook detectado como online (uptime, RAM, disco) | ✅ |
| Temperatura real (CPU, não GPU — 82°C, sem falso alarme) | ✅ |
| PWA instalável (cache v8, manifest, service worker) | ✅ |
| SSH notebook → homeserver e homeserver → notebook | ✅ |
| Deploy via rsync + systemctl | ✅ |
| Setup interativo (setup.sh) | ✅ |
| Skill de planejamento (planejamento-execucao) | ✅ |

## 🔵 Fase 1 — Polimento (próximo)

O que já funciona mas pode ser melhorado sem adicionar complexidade:

- [ ] **Chat com fallback local** — quando Api.b.ai cair, usar ollama (qwen2.5-coder) no notebook automaticamente
- [ ] **Autenticação básica** — senha nas rotas /api/* (repo público, qualquer um pode apontar)
- [ ] **Notificações push** — alerta de temperatura/container no PWA mesmo fechado
- [ ] **Melhorar fluxo de conversas** — conversas recentes ao abrir o chat, botão "nova conversa" mais visível

## 🟡 Fase 2 — Integrações úteis

Funções que agregam valor real no dia a dia:

- [ ] **Backup do vault** — botão no app para disparar backup do Obsidian
- [ ] **Logs do servidor** — ver logs recentes (journalctl, docker logs) pelo app
- [ ] **Status dos containers** — restart/start/stop container pelo app
- [ ] **Gateway do notebook** — ativar gateway Hermes no notebook para enviar comandos de lá

## 🟠 Fase 3 — Quando precisar

Só implementar se houver necessidade real:

- [ ] Modo offline PWA (cache de conversas, dashboard sem internet)
- [ ] Integração Gitea (PRs, issues, commits)
- [ ] Comandos de voz (TTS/STT)
- [ ] Múltiplos provedores de IA (trocar entre deepseek, ollama, etc.)

## ⚠️ Não fazer (fora de escopo)

- **Não** adicionar autenticação OAuth complexa (senha simples resolve)
- **Não** criar dashboard de métricas históricas (o diário já cobre)
- **Não** suportar múltiplos servidores (foco no homeserver atual)
- **Não** modo multiplayer / colaborativo

## Como decidimos o próximo passo

1. Pegamos o item mais alto da lista **não concluído**
2. Definimos escopo claro (o que será feito, o que NÃO será)
3. Executamos uma tarefa por vez, validando cada etapa
4. Só depois partimos para o próximo

---

> 📅 Última atualização: Agosto 2026
> 📍 Repositório: github.com/usuario/hermes-remote