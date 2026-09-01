# Problemas Conhecidos

> Issues ativas e workarounds. Atualizar quando um problema for resolvido
> (mover para o `CHANGELOG.md` como fix).

## Layout shift nos cards Nodes (Home)

- **Sintoma:** ao carregar o dashboard, os cards Notebook/Servidor/Cota
  redimensionam a página (conteúdo chega por AJAX em momentos diferentes).
- **Mitigação aplicada:** `min-height` nos sub-cards + refatoração da grid.
- **Status:** parcialmente resolvido no v1; reestruturar na reescrita (v2)
  com skeleton estável (ver `ARCHITECTURE.md`).

## Cache do service worker mostra versão antiga

- **Sintoma:** após deploy, o celular continua com o layout antigo.
- **Mitigação:** bump de `hermes-remote-v<NN>` no `sw.js` + force-refresh.
- **Status:** conhecido; manter a prática de bump a cada deploy.

## Chat não envia automaticamente no primeiro uso

- **Sintoma:** o CTA "Ask Hermes" preenche o input do Chat mas não dispara
  o envio quando a lista de modelos ainda não carregou.
- **Mitigação:** o usuário aperta Enter no Chat.
- **Status:** conhecido; resolver no v2 (aguardar modelos antes do auto-send).

## Animações com `opacity: 0` podem esconder conteúdo

- **Sintoma:** se a animação de entrada não roda (`prefers-reduced-motion`,
  baixa performance), o conteúdo fica invisível.
- **Mitigação:** `animation-fill-mode: forwards` + fallback.
- **Status:** conhecido; na reescrita (v2), começar visível e só animar
  `transform` (ver `UI_GUIDELINES.md`).