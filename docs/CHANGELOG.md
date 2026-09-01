# Changelog

> Histórico de mudanças por versão. Atualizar a cada commit relevante.

## v1.0.0 — 2026-09-01

### Arquitetura e estado

- Estado centralizado em `app.state` (`state.js`) com persistência em `localStorage`.
- Event delegation: `data-action` centralizado no `document` (sem `onclick` inline).
- Design tokens: paleta Dark Editorial + Warm Accent (`tokens.css`).

### Home (Connected Intelligence)

- Redesign da Home: saudação dinâmica, resumo em linha, CTA "Ask Hermes",
  atividade recente, cards Nodes/Conexões, ações rápidas e agenda.
- Favicon SVG (Node + Signal) + sprite de 27 ícones; emojis removidos do código.
- Quick wins de acessibilidade: `focus-visible`, `::selection`,
  `text-wrap: balance`, `tabular-nums`, `prefers-reduced-motion`.
- Ajustes de espaçamento lateral (padding 24px), gap nos cards e layout shift
  dos Nodes.

### Documentação

- `ARCHITECTURE.md` — contrato do v2 (topologia gateway → Hermes).
- 5 ADRs em `docs/decisions/` (vanilla JS, gateway único, cliente único,
  chat offline, push).
- Sanitização: histórico git reescrito sem dados pessoais
  (`joao` → `usuario`, `jotatw` → `usuario`, IPs → `100.x.x.x`).
