# 🗺️ Mapa de Funções — Hermes Remote

> Todas as funcionalidades do app, seus endpoints, dependências e
> o que simplificar/observar.

---

## 📊 Dashboard

| Funcionalidade | Endpoint | Depende de | Observação |
|---|---|---|---|
| Card Notebook | `GET /api/status` | `NOTEBOOK_IP` (SSH) | Mostra "dormindo" se offline |
| Card Servidor | `GET /api/status` | `HOMESERVER_IP` (local/SSH) | Uptime, RAM, disco, load |
| Card Cota IA | `GET /api/status` | `HERMES_URL` | Modelos disponíveis no pool |
| Ações Rápidas | — | JS local + `/api/acao/*` | 5 botões (ver ações) |
| Agenda | `GET /api/power` | `HS_POWER_CMD` | Horário de dormir/acordar |
| Últimas Ações | `GET /api/acoes` | `acoes.log.json` (local) | Últimas 30 ações |

**Pontos de atrito:** Ações Rápidas duplicam alguns botões da tela Servidor (Dormir/Acordar). É intencional (atalho), mas pode confundir.

---

## 💬 Chat

| Funcionalidade | Endpoint | Depende de | Observação |
|---|---|---|---|
| Listar modelos | `GET /api/models` (proxy → `/v1/models`) | `HERMES_URL` + `HERMES_API_KEY` | Filtra modelos de imagem/tts/embedding |
| Conversar (streaming) | `POST /api/chat` (proxy → `/v1/chat/completions`) | `HERMES_URL` + `HERMES_API_KEY` | Streaming SSE |
| Histórico de conversas | — | localStorage | Persistido no navegador |
| Tarefas (todo) | — | localStorage | Sidebar |
| Contexto global | — | localStorage | Instruções do sistema |
| Exportar conversa | — | JS local | TXT, MD, JSON |

**Pontos de atrito:** Estado vazio é só texto ("Selecione um modelo e comece a conversar!") — sem ilustração ou sugestão. O modelo precisa ser selecionado manualmente (não salva o último).

---

## 🖥️ Servidor

| Funcionalidade | Endpoint | Depende de | Observação |
|---|---|---|---|
| Status (uptime, RAM, disco) | `GET /api/status` | `HOMESERVER_IP` | Mesmo dado do dashboard |
| Temperatura | `GET /api/servidor` | `HS_HEALTH_CMD` | Parseia regex `(\d+)C` |
| Containers | `GET /api/servidor` | `HS_CONTAINERS_CMD` (opcional) | Lista nome + status |
| Dormir | `POST /api/acao/dormir` | `HS_SLEEP_CMD` | rtcwake |
| Acordar | `POST /api/acao/acordar` | `HS_WAKE_CMD` | WOL |
| Atualizar | — | JS local | Recarrega status + servidor |

**Pontos de atrito:** Temperatura e containers aparecem SÓ aqui (não no dashboard). O "Atualizar" recarrega ambos os endpoints.

---

## ⚙️ Configurações

| Funcionalidade | Endpoint | Depende de | Observação |
|---|---|---|---|
| URL do API server | — | localStorage | Salva ao testar |
| Chave API | — | localStorage | Campo password |
| Testar Conexão | `GET /api/health` | `HERMES_URL` | Mostra CTA "Ir para o Chat" se OK |
| Host SSH | — | localStorage | Só usado em deploy.sh |

**Pontos de atrito:** Host SSH é apenas informativo (não usado pelo server.js). O deploy.sh usa `.env` local, não o valor salvo no navegador.

---

## 🔧 Ações (API)

| Ação | Método | Rota | Depende |
|---|---|---|---|
| Diário de Saúde | `POST` | `/api/acao/diario` | `HS_DIARIO_CMD` |
| Code Review | `POST` | `/api/acao/revisar` | `HS_REVIEW_CMD` |
| Dormir | `POST` | `/api/acao/dormir` | `HS_SLEEP_CMD` |
| Acordar | `POST` | `/api/acao/acordar` | `HS_WAKE_CMD` |

---

## 📋 Resumo de dependências

| Dependência | Afeta |
|---|---|
| `HERMES_URL` + `HERMES_API_KEY` | Chat, modelos, cota |
| `NOTEBOOK_IP` + `HOMESERVER_SSH_USER` | Card Notebook (dashboard) |
| `HOMESERVER_IP` + `HOMESERVER_SSH_USER` | Card Servidor (dashboard) + tela Servidor |
| `HS_POWER_CMD` | Agenda (dashboard) |
| `HS_HEALTH_CMD` | Temperatura (servidor) |
| `HS_CONTAINERS_CMD` | Containers (servidor) |
| `HS_SLEEP_CMD` / `HS_WAKE_CMD` | Ações de energia |
| `HS_DIARIO_CMD` / `HS_REVIEW_CMD` | Ações de diário/review |

---

## 💡 Simplificações aplicadas

| # | O que | Status |
|---|---|---|
| 1 | Docker opcional (`HS_CONTAINERS_CMD`) | ✅ Implementado (server.js + contrato) |
| 2 | Chat lembrar último modelo | ✅ Já existia (`localStorage` seleciona ao abrir o chat) |
| 3 | Estado vazio do chat com sugestões | ✅ Implementado ("Como está o servidor?", "Me ajude com...") |
| 4 | Tela Config informativa (remover campos falsos) | ✅ Implementado (mostra conexão ativa do backend) |
| 5 | Card "Últimas Ações" vazio com link | ✅ Implementado (link para Ações Rápidas) |

## Ideias futuras (não implementadas)

- Renomear/excluir conversa dentro do dropdown do chat (hoje é preciso via menu)
- Sincronizar conversas entre dispositivos (hoje ficam no localStorage do navegador)
- Autenticação nas rotas `/api/*` para uso público além do PWA