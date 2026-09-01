# Hermes Remote — Design Tokens

> **Fonte da verdade** do design system do Hermes Remote PWA.
> Implementação: `public/css/tokens.css`. Contrato: open-design (nexu-io) — camadas A1/A2/B-slot/C-ext.
> Qualquer token novo nasce neste documento e chega no CSS.

## Visão Geral

App PWA de controle remoto do Hermes Agent: dashboard, chat, servidor e configurações.
Estilo: **Dark Editorial + Warm Accent** (paleta do portfolio `usuario-portfolio`) + **chat estilo Intercom** (bolhas assimétricas).

## Tokens — Camadas

Cada token responde a 2 perguntas: *quem decide?* e *o que acontece se omitido?*

| Camada | Quem decide | Se omitido | Exemplos (--hr-*) |
|---|---|---|---|
| **A1-identity** | marca | quebra | `bg`, `fg`, `accent`, `font`, `mono`, `feature` |
| **A1-structure** | marca | quebra | `panel`, `surface`, `border`, `text`, `text-xs..2xl` |
| **A2** | marca (fallback) | derive preenche | `success`, `warn`, `danger`, `space-*`, `radius-*`, `elevation-*`, `transition-*` |
| **B-slot** | alias de nível 2 | quebra | `accent-bright`, `accent-hover`, `text-2..4`, `surface-2`, `border-subtle/solid` |
| **C-ext** | específico do app | — | `surface-trans`, `surface-trans-2`, `bubble`, `bubble-text` |

## Superfícies (A1-structure)

Luminância stepping (como Linear) — o escuro é o canvas nativo, não um tema aplicado:

| Token | Valor (dark) | Uso |
|---|---|---|
| `--hr-bg` | `#111111` | canvas — Dark Editorial |
| `--hr-panel` | `#1A1A1A` | sidebar, painéis |
| `--hr-surface` | `#242424` | cards, dropdowns |
| `--hr-surface-2` | `#2A2A2A` | hover, elementos elevados |
| `--hr-surface-trans` | `rgba(255,255,255,0.02)` | card translúcido |
| `--hr-surface-trans-2` | `rgba(255,255,255,0.05)` | hover translúcido |

## Texto (A1-identity + B-slot)

| Token | Valor | Uso |
|---|---|---|
| `--hr-fg` | `#F5F1E8` | texto primário (off-white quente) |
| `--hr-text-2` | `#A8A39A` | secundário |
| `--hr-text-3` | `#8A847B` | terciário / placeholder |
| `--hr-text-4` | `#6B665E` | timestamps, metadados |

## Accent (A1-identity)

Único cromático, reservado para interação:

| Token | Valor | Uso |
|---|---|---|
| `--hr-accent` | `#E6A65D` | CTA, superfícies de marca — âmbar quente |
| `--hr-accent-bright` | `#F0B87A` | links, ativo |
| `--hr-accent-hover` | `#C98235` | hover |

## Status semânticos (A2)

| Token | Valor | Uso |
|---|---|---|
| `--hr-success` | `#27a644` | online, ok |
| `--hr-success-2` | `#10b981` | badges de conclusão |
| `--hr-warn` | `#e6b800` | atenção |
| `--hr-danger` | `#e74c3c` | erro, offline |

## Tipografia (A1-structure)

- Família: Inter (`--hr-font`) + mono (`--hr-mono`)
- OpenType: `'cv01', 'ss03'` (assinatura Linear)
- Escala semântica: `text-xs (11)` → `text-2xl (24)`, body `16px`
- Pesos: 400/500/590 (nunca 700)
- Letter-spacing negativo em display

## Espaçamento, Raio, Elevação, Transições (A2)

- Espaçamento base 8px: `space-1 (4)` → `space-8 (32)`
- Raio: `radius-sm (4)` → `radius-pill (9999)`
- Elevação por luminância (não sombra): `elevation-1`, `elevation-2`, `elevation-dialog`
- Transições: `transition (0.15s)`, `transition-slow (0.25s)`

## Chat (C-ext, estilo Intercom)

- `.message.user` → `--hr-bubble: var(--hr-accent)`, texto branco
- `.message.assistant` → `--hr-bubble: var(--hr-surface)`, texto `--hr-text`
- Cantos assimétricos; timestamps discretos (`--hr-text-4`)

## Tema Light (alternativo)

Sobrescreve A1 (bg/fg/accent) e A2 (status), mantém estrutura de espaçamento/raio.
- `--hr-bg`: `#F5F1E8` (off-white quente)
- `--hr-fg`: `#2A2620` (quase preto)
- `--hr-accent`: `#92400E` (âmbar escuro, WCAG 6.29:1)
- `--hr-accent-hover`: `#78350F`
- `--hr-border`: `#D8D2C8`

Gatilho: `[data-theme="light"]` no `<html>`.

## Deploy

- `deploy.sh` → rsync (exclui `.env`) + `systemctl --user restart chat-web.service`
- URL: `https://homeserver.tailnet.ts.net` (exemplo — substitua pelo seu)
