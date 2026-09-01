# UI Guidelines

> Regras de interface do Hermes Remote. Fonte de identidade:
> `design/design-foundation-v1.md`. Tokens: `design/tokens.md` (implementados
> em `public/css/tokens.css`).

## Identidade

- **Dark Infrastructure + Warm Intelligence** — fundo escuro preciso
  (`--hr-bg: #111111`), accent quente (`--hr-accent: #E6A65D`).
- **Connected Intelligence** — tudo conectado, um lugar para entender e agir.

## Paleta (dark)

| Token | Valor | Uso |
|-------|-------|-----|
| `--hr-bg` | `#111111` | Fundo |
| `--hr-panel` | `#1A1A1A` | Painéis |
| `--hr-surface` | `#242424` | Superfícies elevadas |
| `--hr-fg` | `#F5F1E8` | Texto principal |
| `--hr-accent` | `#E6A65D` | Ações, destaque |
| `--hr-border` | — | Bordas sutis |

## Regras de uso

1. **Nada de cor hard-coded** — todo valor visual vem dos tokens (`var(--hr-*)`).
2. **Ícones SVG, nunca emojis** — sprite com 27 símbolos (`icon-*`); helper `ui.icono()`.
3. **Contraste** — texto de corpo ≥ 4.5:1 (WCAG AA); accent sobre fundo ≈ 9:1.
4. **Touch targets ≥ 44px** — em celular, botões e links clicáveis.
5. **`focus-visible`** — todo elemento interativo tem anel de foco visível.
6. **`prefers-reduced-motion`** — animações desativadas/reduzidas para quem prefere.
7. **Sem emojis como elemento de design** — usar sprite SVG.
8. **Tipografia** — Inter (400/500/600), `text-wrap: balance` em títulos,
   `font-variant-numeric: tabular-nums` em números.
9. **Estados** — hover em todo interativo; `:active` com efeito de profundidade;
   disabled com opacidade reduzida + `cursor: not-allowed`.
10. **Empty states** — mensagem clara + ação, não apenas "Sem itens".

## Anti-padrões (evitar)

- Gradientes roxo/índigo (visual "IA genérica")
- Grid de 3 colunas com ícone-em-círculo (template SaaS)
- Tudo centralizado sem hierarquia
- `border-radius` uniforme e grande em tudo
- Herói genérico ("Welcome to...") — copy específica e útil
