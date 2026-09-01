# Hermes Remote — Design Foundation v1

> **Connected Intelligence** — *Everything connected. One place to understand and interact with it.*
> 
> **Dark Infrastructure + Warm Intelligence** — infraestrutura escura e precisa, inteligência quente e acessível.
>
> Documento oficial de identidade e design do Hermes Remote PWA.
> Versão: 1.0 — Setembro 2026

---

## 01. Conceito e Posicionamento

### Definição

> **Hermes Remote é uma plataforma web pessoal para monitorar, acessar e interagir com servidores, computadores e sistemas de IA distribuídos pela sua infraestrutura, de qualquer lugar.**

### Pilares

```
Hermes
├── Think   → raciocínio, decisão, automação
├── Connect → conecta sistemas, canais, serviços
└── Act    → executa, monitora, responde
```

### Relação Hermes × Hermes Remote

| Camada | Função |
|---|---|
| **Hermes** (agente) | Faz, entende, conecta — processa comandos, envia relatórios, interage com APIs |
| **Hermes Remote** (PWA) | Mostra, organiza, monitora e permite controlar — interface visual do ecossistema |

### Três princípios de design

1. **Hermes is the center** — o agente é a entidade central; tudo parte dele e volta para ele
2. **Everything is connected** — a interface mostra relações entre AI, infraestrutura, conexões e automações
3. **Complexity is progressive** — a tela inicial é simples e informativa; detalhes aparecem sob demanda

---

## 02. Identidade Visual

### Direção visual

```
Minimal
Dark-first
Warm accent
Soft glass surfaces
Network-inspired details
```

### Linguagem visual

Elementos gráficos baseados em:

```
Nodes       ●
Connections ───
Signals     ▶
Paths       ═══
```

Usados de forma sutil em:
- Backgrounds e superfícies translúcidas
- Loading states animados
- Estados de conexão dos Nodes
- Favicon e ícone PWA

### Tom de voz

| Contexto | Tom |
|---|---|
| Home / boas-vindas | Calmo, informativo, pessoal |
| Status / alertas | Direto, objetivo, com ação |
| Chat | Utilitário, sem personalidade fingida |
| Erros | Específico, com próximo passo |

---

## 03. Paleta

### Dark theme (padrão)

| Token | Valor | Papel |
|---|---|---|
| `--hr-bg` | `#111111` | Canvas principal |
| `--hr-panel` | `#1A1A1A` | Sidebar, painéis |
| `--hr-surface` | `#242424` | Cards, dropdowns |
| `--hr-surface-2` | `#2A2A2A` | Hover, elevado |
| `--hr-fg` | `#F5F1E8` | Texto primário (off-white quente) |
| `--hr-text-2` | `#A8A39A` | Texto secundário |
| `--hr-accent` | `#E6A65D` | Acento único — âmbar quente |
| `--hr-accent-hover` | `#C98235` | Hover do acento |
| `--hr-border` | `rgba(255,255,255,0.08)` | Bordas translúcidas |
| `--hr-border-solid` | `#353535` | Borda sólida (separadores) |

### Light theme (alternativo)

| Token | Valor |
|---|---|
| `--hr-bg` | `#F5F1E8` |
| `--hr-fg` | `#2A2620` |
| `--hr-accent` | `#92400E` (âmbar escuro, WCAG 6.29:1) |
| `--hr-border` | `#D8D2C8` |

### Status semânticos

| Estado | Dark | Light |
|---|---|---|
| Success | `#27a644` | `#16a34a` |
| Warn | `#e6b800` | `#a16207` |
| Danger | `#e74c3c` | `#dc2626` |

---

## 04. Tipografia

| Uso | Família | Stack |
|---|---|---|
| Body / UI | Inter | `'Inter', system-ui, -apple-system, sans-serif` |
| Código | JetBrains Mono | `'JetBrains Mono', ui-monospace, monospace` |
| OpenType | Linear signature | `'cv01', 'ss03'` |

### Escala semântica

| Token | Tamanho | Uso |
|---|---|---|
| `--hr-text-xs` | 11px | Timestamps, metadados |
| `--hr-text-sm` | 13px | Captions, labels |
| `--hr-text-base` | **16px** | Body (mínimo acessível) |
| `--hr-text-lg` | 17px | Subtítulos |
| `--hr-text-xl` | 20px | Títulos de view |
| `--hr-text-2xl` | 24px | Títulos grandes |

### Regras tipográficas

- Pesos: 400 (regular), 500 (medium), **590** (semibold — **nunca 700**)
- `text-wrap: balance` em títulos de view
- `font-variant-numeric: tabular-nums` em colunas numéricas
- `letter-spacing: -0.02em` em títulos grandes (display)
- `line-height: 1.5` body, `1.2` headings

---

## 05. Iconografia

### Princípios

- **Emoji como ícone funcional** — emoji são usados como ícones (📋💬📊⚙️), não como decoração
- **Nenhum ícone em círculo colorido** — sem o padrão "SaaS starter template"
- **Ícone único de marca** — símbolo abstrato baseado em Node + Signal + Movement

### Proposta de favicon / ícone PWA

Símbolo abstrato representando:

```
Signal     ▶
+          
Node       ●
+          
Movement   ═══
```

Design: quadrado escuro com cantos arredondados (`rx=12`), contendo um ponto central (node) com uma linha ondulada ou seta (signal/movement) em âmbar (`#E6A65D`). Reutilizável como base de ícone para outros projetos do ecossistema.

### Ícones de estado

| Estado | Glifo | Cor |
|---|---|---|
| Online | ● (ponto cheio) | `--hr-success` |
| Offline | × | `--hr-danger` |
| Atenção | ! | `--hr-warn` |
| Conectando | ↻ (rotação) | `--hr-text-3` |
| Desconhecido | ? | `--hr-text-4` |

---

## 06. Componentes

### Biblioteca de UI

Namespace `ui.*` em `public/js/components.js` — funções puras que retornam HTML:

| Função | Retorna |
|---|---|
| `ui.statCard(icon, label, value)` | Card de métrica (stat-value com tabular-nums) |
| `ui.containerChip(container)` | Chip de container Docker (nome + status) |
| `ui.temperatura(temp, actionBtn)` | Badge de temperatura com cor semântica |
| `ui.loading(msg)` | Texto com shimmer pulse |
| `ui.vazio(msg)` | Empty state com ilustração 📭 |
| `ui.offline(titulo, detalhe)` | Estado offline com motivo |
| `ui.erro(msg)` | Mensagem de erro estilizada |
| `ui.resultado(tipo, texto)` | Feedback de ação (ok/erro/loading) |
| `ui.historicoLinha(acao)` | Linha de histórico com botão expansível |

### Design system tokens

- `public/css/tokens.css` — 4 camadas (A1-identity, A1-structure, A2, B-slot, C-ext)
- `public/css/style.css` — mapeia `var(--hr-*)` para classes de UI
- `public/css/responsive.css` — breakpoints mobile-first

### Estado centralizado

- `public/js/state.js` — `app.state` único (conversas, contexto, tema, sessão)
- `public/js/components.js` — carregado antes dos demais scripts
- Delegação de eventos via `data-action` (zero `onclick=` inline)

---

## 07. Estrutura de Navegação

### Views

| View | Rota | Função principal |
|---|---|---|
| **Home** | `/` (dashboard) | Visão geral: status dos Nodes, conexões, atividade recente |
| **Nodes** | servidor | Detalhes de cada node (HomeServer, Notebook) |
| **Connections** | *(futuro)* | Status das conexões (Telegram, Discord, WhatsApp) |
| **Chat** | chat | Conversa com o Hermes (streaming, histórico) |
| **Config** | config | Configurações do app (read-only, aponta para .env) |

### Navegação mobile

Bottom nav fixa com 4-5 itens:
```
🏠 💬 🖥️ ⚙️
```
Cada botão com `aria-label` + indicador de tela ativa.

### Navegação desktop

Mesma bottom nav, mas os labels ficam visíveis.

---

## 08. Estados dos Nodes

### O que é um Node

Um Node é qualquer dispositivo conectado ao ecossistema Hermes:

| Node | Tipo | Status atual |
|---|---|---|
| **HomeServer** | Servidor principal | Online (uptime, RAM, disco, temperatura) |
| **Notebook** | Estação de trabalho | Online (uptime, RAM, disco, SSH) |
| *(futuro)* | Celular, servidor cloud, etc. | — |

### Estados de um Node

| Estado | Glifo | Cor | Descrição |
|---|---|---|---|
| Online | ● | `--hr-success` | Node ativo, respondendo |
| Atenção | ! | `--hr-warn` | Online, mas com alerta (ex.: temperatura alta) |
| Offline | × | `--hr-danger` | Node inacessível ou desligado |
| Dormindo | 😴 | `--hr-text-3` | Suspenso (auto-suspend ativo) |
| Conectando | ↻ | `--hr-text-3` | Tentando reconectar |

### Card de Node (implementado)

```
┌──────────────────────────┐
│  ● HomeServer            │
│  ⏱️ Uptime: 1 semana     │
│  💾 RAM: 1.1Gi/2.7Gi     │
│  💽 Disco: 32G/290G      │
│  🌡️ 82°C ⚠️              │
│  🐳 5 containers          │
└──────────────────────────┘
```

---

## 09. Estados das Connections

### O que é uma Connection

Uma Connection é um canal de comunicação que o Hermes usa para interagir com o mundo externo:

| Conexão | Status | Uso |
|---|---|---|
| **Telegram** | ✅ Conectado | Diário de saúde, comandos, alertas |
| **Discord** | *(futuro)* | Comandos, notificações |
| **WhatsApp** | *(futuro)* | Comandos, notificações |
| **E-mail** | *(futuro)* | Relatórios |

### Estados de uma Connection

| Estado | Glifo | Cor |
|---|---|---|
| Conectado | ● | `--hr-success` |
| Desconectado | × | `--hr-danger` |
| Não configurado | ○ (circulo vazio) | `--hr-text-4` |
| Erro de autenticação | ! | `--hr-warn` |

---

## 10. Wireframe da Home

### Conceito

A Home deve responder imediatamente:

> **"Qual é o estado do meu ecossistema agora?"**

### Layout proposto (primeira versão)

```
┌──────────────────────────────────────┐
│  🌙                        [⚙️]      │  ← header minimal
│                                      │
│  Good evening, João.                 │
│  Hermes is ready.                    │
│                                      │
│  ● 2 nodes online                    │  ← resumo em linguagem natural
│  ● 1 connection active               │
│  ● 5 automations active              │
│  ● 2 AI providers available          │
│                                      │
│  [💬 Ask Hermes]                     │  ← CTA primário (campo de pergunta)
│                                      │
│  ─── Recent activity ───             │
│                                      │
│  ✓ Daily report sent to Telegram     │  ← timeline das últimas ações
│  ✓ HomeServer backup completed       │
│  ⚠ Container restarted               │
│                                      │
│  ┌──────────┐  ┌──────────┐          │
│  │  Nodes   │  │Connections│          │  ← cards de resumo
│  │ ● HS     │  │ ● Telegram│          │
│  │ ● NB     │  │ ○ Discord │          │
│  └──────────┘  └──────────┘          │
│                                      │
│  [🏠] [💬] [🖥️] [⚙️]                 │  ← bottom nav
└──────────────────────────────────────┘
```

### Cards de detalhe (abaixo do resumo)

```
┌──────────────────────────────────────┐
│  Components da Home                  │
│                                      │
│  ├── Status bar (header)             │
│  │   ├── Conexão (online/offline)    │
│  │   └── Tema toggle                 │
│  │                                   │
│  ├── Greeting + Summary              │
│  │   ├── Saudação personalizada      │
│  │   ├── Resumo em linguagem natural │
│  │   └── CTA "Ask Hermes"            │
│  │                                   │
│  ├── Recent Activity                 │
│  │   ├── Timeline das últimas ações  │
│  │   └── Cada ação → link para       │
│  │       detalhes                     │
│  │                                   │
│  └── Node / Connection cards         │
│      ├── Resumo visual compacto      │
│      └── Clique → view detalhada     │
└──────────────────────────────────────┘
```

### Estado atual da navegação

A Home atual (dashboard) já implementa parte disso:

- ✅ Cards de Node (HomeServer + Notebook)
- ✅ Atividade recente (histórico de ações)
- ✅ Status dos containers
- ✅ Temperatura com badge

A evoluir (ver "Ideias futuras"):
- Saudação personalizada ("Good evening, João")
- Resumo em linguagem natural ("2 nodes online")
- CTA "Ask Hermes" na Home
- Cards de Connections (Telegram, etc.)
- Timeline mais rica de atividade recente

---

## Ideias futuras

- **Símbolo do favicon**: implementar o ícone abstrato Node + Signal + Movement em SVG
- **Seção Connections**: view dedicada para visualizar e gerenciar canais (Telegram, Discord, WhatsApp)
- **Animações sutis**: fade-up na Home, hover nodes com destaque, loading com pulsar de Node
- **Nodes dinâmicos**: detecção automática de novos dispositivos na rede Tailscale
- **Tema por node**: card com cor de fundo sutilmente diferente por tipo de dispositivo

---

## Referências

- `docs/design/tokens.md` — fonte da verdade dos tokens CSS
- `docs/arquitetura.html` — diagrama de conexões do ecossistema
- `public/css/tokens.css` — implementação dos tokens
- `public/js/components.js` — biblioteca de componentes UI
- `public/js/state.js` — estado centralizado do app
- `ROADMAP.md` — plano incremental de funcionalidades