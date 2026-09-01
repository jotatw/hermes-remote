# Arquitetura — Hermes Remote v2

> Status: **Planejado** — documento de contrato para a reescrita do app.
> Substitui o `plano-reformulacao.md` (executado no v1) e o `planejamento-melhorias.md` (lista de ideias absorvida pelo `ROADMAP.md`).

## 1. Visão geral

O Hermes Remote é um PWA de controle remoto do Hermes Agent, usado a partir do
celular e do notebook, com acesso pela rede local ou via VPN (Tailscale).

**Três máquinas envolvidas:**

| Máquina | Papel | Observação |
|---------|-------|------------|
| Homeserver | Gateway + infra 24/7 | Sempre ligado; expõe a API; roda containers, Gitea, etc. |
| Notebook | Roda o Hermes Agent | Nem sempre ligado; chat fica indisponível quando dorme |
| Celular | Cliente (PWA) | Interface única via navegador |

## 2. Topologia

```
Celular / Notebook (cliente PWA)
        │  HTTPS (local: porta 3002 | remoto: homeserver.tail*.ts.net)
        ▼
┌────────────────────────────┐
│  Gateway (homeserver)      │  ← sempre ligado
│  ├── /api/chat  → notebook │     (proxy para o Hermes Agent)
│  ├── /api/status, /api/*   │     (dados do próprio homeserver)
│  ├── /api/acao/*           │     (WOL, suspend, backup)
│  └── push notifications    │     (Telegram base, Web Push depois)
└────────────────────────────┘
        │
        ▼
┌────────────────────────────┐
│  Notebook (Hermes Agent)   │  ← quando ligado
└────────────────────────────┘
```

## 3. Princípios

1. **Vanilla JS** — sem framework, sem build step. Substituir por framework só
   se a complexidade justificar (ver ADR-001).
2. **Camadas com responsabilidade única** — views não fazem `fetch` direto;
   dados passam por `api.js`; estado por `store.js`.
3. **Estado centralizado** — um único store com Pub/Sub; nada de globais soltos
   (`window.conversando`, etc.).
4. **Roteamento real** — `history.pushState` + `popstate`, com URL refletindo
   a view ativa (profundidade de link possível).
5. **Design tokens** — todo valor visual vem de `tokens.css`; nada de cores
   hard-coded no CSS ou JS.
6. **Mobile-first** — touch targets ≥ 44px, responsivo, sem scroll horizontal.
7. **Segurança** — auth por senha no gateway, TLS, repo público sem dados
   pessoais (ver seção 11).

## 4. Camadas (estrutura de pastas)

```
public/
├── index.html          # shell único + sprite SVG
├── manifest.json       # PWA manifest
├── sw.js               # service worker (cache versionado)
├── css/
│   ├── tokens.css      # design tokens (fonte da verdade)
│   ├── base.css        # reset, tipografia, utilitários
│   ├── home.css        # estilos da view Início
│   ├── chat.css        # estilos da view Chat
│   └── servidor.css    # estilos da view Servidor
└── js/
    ├── store.js        # estado centralizado (Pub/Sub + persistência)
    ├── router.js       # roteador (history API)
    ├── api.js          # cliente HTTP único (fetch, auth, erros, abort)
    ├── components.js   # helpers de UI puros (retornam string HTML)
    └── views/
        ├── home.js     # monta a view Início
        ├── chat.js     # monta a view Chat
        └── servidor.js # monta a view Servidor
```

## 5. Contrato entre camadas

| De → Para | Regra |
|-----------|-------|
| View → API | Nunca `fetch` direto. Sempre via `api.get('/api/status')`. |
| View → Store | Ler via `store.get()`; alterar via `store.set(chave, valor)`. |
| View → View | Nunca. Comunicação apenas via store. |
| Componente → DOM | Funções puras retornam string HTML; a view faz `innerHTML`. |
| Router → View | `router.mount('home')` chama o render da view ativa. |

## 6. Store (estado centralizado)

Padrão **Pub/Sub** em ~40 linhas:

```js
const store = {
  _state: {},
  _listeners: {},
  get: (k) => this._state[k],
  set: (k, v) => { this._state[k] = v; this._emit(k, v); },
  on: (k, fn) => { (this._listeners[k] ||= []).push(fn); },
  _emit: (k, v) => (this._listeners[k] || []).forEach(fn => fn(v)),
};
```

- **Escrita:** somente via `set()` — nunca `state.chave = x` direto.
- **Leitura:** `get()` em qualquer camada.
- **Persistência:** `localStorage` por chave (ex.: `hermes-remote:conversas`),
  com `JSON.parse` seguro e fallback.
- **Assinatura:** views chamam `store.on('nodes', render)` para re-renderizar
  quando o dado muda.

## 7. Roteador

- URL base: `#/home`, `#/chat`, `#/servidor` (hash — funciona em PWA estático
  sem config de servidor).
- Troca de view: `router.go('/chat')` → atualiza hash + chama
  `views[rota].render(container)`.
- `popstate`/`hashchange`: navegação por botões voltar/avançar do navegador
  funciona naturalmente.
- View desconhecida → redireciona para `#/home`.

## 8. API (endpoints)

Todas as chamadas passam pelo gateway (homeserver). Prefixo `/api`.

| Endpoint | Método | Origem | Descrição |
|----------|--------|--------|-----------|
| `/api/health` | GET | homeserver | Saúde do gateway + versão |
| `/api/status` | GET | homeserver | Status dos nodes (notebook, servidor, cota IA) |
| `/api/servidor` | GET | homeserver | Detalhes do servidor (CPU, RAM, disco, containers, temp) |
| `/api/power` | GET | homeserver | Agenda de energia (22:00 → 08:00) |
| `/api/acoes` | GET | homeserver | Histórico de ações recentes |
| `/api/models` | GET | notebook (proxy) | Modelos disponíveis no Hermes |
| `/api/chat` | POST | notebook (proxy) | Envia mensagem ao Hermes (streaming) |
| `/api/acao/diario` | POST | homeserver | Dispara relatório diário |
| `/api/acao/revisar` | POST | homeserver | Dispara code review |
| `/api/acao/dormir` | POST | homeserver | Suspende o servidor |
| `/api/acao/acordar` | POST | homeserver | Envia magic packet (WOL) |
| `/api/config` | GET | homeserver | Config ativa (vem do `.env`, não editável) |

Regras:
- **Erro:** toda resposta de erro retorna `{ error: "mensagem" }` com status HTTP coerente.
- **Auth:** rotas protegidas exigem header `Authorization` (ver seção 11).
- **Streaming:** `/api/chat` responde em `text/event-stream`; o cliente aborta
  com `AbortController` (ver seção 10).

## 9. Views

| View | Rota | Conteúdo |
|------|------|----------|
| Início | `#/home` | Saudação, resumo, CTA Ask Hermes, atividade recente, cards Nodes/Conexões, ações rápidas, agenda |
| Chat | `#/chat` | Lista de conversas, streaming de resposta, seleção de modelo, parar resposta |
| Servidor | `#/servidor` | Detalhes do servidor, containers, temperatura, ações de energia |

Cada view é um módulo (`views/home.js`) que exporta `render(container)` e
`destroy()` (remove listeners próprios).

## 10. Streaming (chat)

- O `AbortController` vive **na view** (Chat), não no store — sair da view
  aborta a resposta em andamento.
- Estados: `idle` → `streaming` → `done` / `error` / `aborted`.
- Durante o streaming, a view re-renderiza apenas o bloco da resposta
  (não o histórico inteiro).

## 11. Segurança

- **Auth:** senha única configurada no `.env` do gateway. Cliente envia
  `Authorization: Bearer <token>` obtido no login. Nada de senha em URL.
- **CORS:** apenas origens permitidas (local: `http://localhost:3002`,
  remoto: `https://homeserver.tail*.ts.net`).
- **TLS:** todo acesso remoto via Caddy/Tailscale com HTTPS. Sem HTTP puro
  fora da rede local.
- **Segredos:** nunca no cliente. Tokens do Hermes ficam no `.env` do servidor.
- **Repo público:** sem nomes reais, IPs ou emails commitados. Autor de commits
  genérico: `Hermes Remote <dev@hermes-remote.local>`.

## 12. Deploy e PWA

- **Deploy:** `deploy.sh` → rsync `--exclude .env --exclude .git` +
  restart do serviço (`systemctl --user restart chat-web.service`).
- **Service worker:** cache versionado (`hermes-remote-v<NN>`); bump a cada
  deploy para invalidar clientes antigos.
- **Ícones:** sprite SVG inline + favicon SVG + PNG fallback (PWA/iOS).
- **Push:** Telegram base (infra existente) + Web Push depois (ADR-005).

## 13. Decisões registradas e fora de escopo

Decisões em `docs/decisions/`:

| ADR | Decisão |
|-----|---------|
| ADR-001 | Manter vanilla JS |
| ADR-002 | Gateway único no homeserver |
| ADR-003 | Cliente único PWA |
| ADR-004 | Chat indisponível quando notebook dorme |
| ADR-005 | Push: Telegram base + Web Push depois |

**Fora de escopo (v2):**
- Múltiplos servidores / multi-tenant
- Dashboard de métricas históricas (gráficos)
- OAuth complexo (login social)
- Colaboração em tempo real
- Modo offline completo (só cache de shell)
