# Planejamento — Hermes Remote & Ecossistema

> Melhorias leves (sem comprometer performance ou adicionar peso desnecessário)

## 🟢 Fáceis (horas, sem dependências)

| # | Melhoria | Onde | Por que | Esforço |
|---|----------|------|---------|---------|
| 1 | **Atalhos dos serviços na Homepage** | Homepage (config/services.yaml) | Links rápidos para Gitea, Files, Hermes Remote, API | ⭐ 30min |
| 2 | **Botão "Acordar servidor"** | App (dashboard) | Quando notebook estiver dormindo, poder acordar via WOL — **WOL testado ✅** | ⭐ 1h |
| 3 | **Comando /ligar no Telegram** | Telegram (quick_commands) | Ligar o servidor remotamente pelo bot — **WOL testado ✅** | ⭐ 1h |
| 4 | **Próximo wake schedule** | App (dashboard/servidor) | Mostrar quando o servidor vai acordar (RTC) | ⭐ 30min |
| 5 | **Histórico de ações** | App (dashboard) | Últimas ações executadas (diário, dormir, revisar) com timestamp | ⭐ 1h |
| 6 | **Versão do app + Hermes** | App (config) | Mostrar versão do Hermes e do app no rodapé | ⭐ 15min |
| 7 | **Tema personalizado** | App (config) | Seletor de cores primárias (accent) | ⭐ 30min |
| 8 | **Widget Hermes na Homepage** | Homepage (widgets.yaml) | Mostrar status do API server / última resposta | ⭐ 1h |
| 9 | **Comandos Telegram: /backup, /servicos** | Telegram (quick_commands) | Status do backup, lista de serviços online | ⭐ 1h |

## 🟡 Médios (meio período, dependências leves)

| # | Melhoria | Onde | Por que | Esforço |
|---|----------|------|---------|---------|
| 10 | **Logs do gateway no app** | App (view servidor) | Últimas linhas do journalctl do gateway | ⭐⭐ 2h |
| 11 | **Notificações Telegram de eventos** | Cron + script | Alerta quando servidor fica online/offline, cota baixa | ⭐⭐ 2h |
| 12 | **Autenticação no app** | App + server.js | Tela de login com senha (proteção básica) | ⭐⭐ 2h |
| 13 | **Backup automático config** | Cron + script | Backup diário do .env, config.yaml, state.db para o Gitea | ⭐⭐ 2h |
| 14 | **PWA: tema dinâmico (theme-color)** | App (index.html) | Mudar a cor da barra do navegador conforme o tema | ⭐ 30min |
| 15 | **Página de status do notebook** | App (view servidor) | Quando notebook estiver online, mostrar detalhes | ⭐⭐ 2h |
| 16 | **Streaming de áudio (TTS)** | App (chat) | Botão "ouvir resposta" no chat | ⭐⭐ 3h |

## 🟠 Avançados (mais complexos, maior valor)

| # | Melhoria | Onde | Por que | Esforço |
|---|----------|------|---------|---------|
| 17 | **Notificações push no celular** | App (service worker) | Alertas mesmo com app fechado (via Push API) | ⭐⭐⭐ 4h |
| 18 | **Widget Android/iOS** | App (PWA widgets) | Atalho na tela inicial com status resumido | ⭐⭐⭐ 4h |
| 19 | **Modo escuro automático** | App (JS) | Seguir o tema do sistema (prefers-color-scheme) | ⭐ 1h |
| 20 | **Histórico de conversas** | App (sidebar) | Pesquisar, favoritar, exportar conversas antigas | ⭐⭐ 3h |

---

## 🎯 Recomendação para agora

**Foco nas 5 primeiras (fáceis, mais impacto):**

1. **Atalhos na Homepage** — 30min, organiza o acesso a tudo
2. **Botão "Acordar servidor"** — 1h, complementa o "Dormir"
3. **Comando /ligar no Telegram** — 1h, acordar de qualquer lugar
4. **Próximo wake schedule** — 30min, saber quando o servidor volta
5. **Histórico de ações** — 1h, feedback de longo prazo

> Total: ~4 horas de trabalho, todas as melhorias são leves, sem novos serviços ou dependências externas.