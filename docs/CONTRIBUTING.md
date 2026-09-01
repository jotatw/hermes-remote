# Contribuição

> Guia rápido para contribuir com o Hermes Remote.

## Pré-requisitos

- Node.js ≥ 18, npm
- Leia `docs/architecture/ARCHITECTURE.md` e `docs/decisions/` antes de
  propor mudanças estruturais

## Convenções

- **Autor do commit:** `Hermes Remote <dev@hermes-remote.local>`
  (nunca nome real — repo público)
- **Formato:** `tipo(escopo): descrição` (ex.: `feat(chat): streaming`)
  - `feat(escopo):` — nova funcionalidade
  - `fix(escopo):` — correção de bug
  - `style(escopo):` — CSS, layout, design (sem mudar lógica)
  - `docs(escopo):` — documentação (README, ADRs, guias)
  - `chore(escopo):` — setup, CI, sanitização, scripts
- **Uma mudança por commit** — não acumule alterações não relacionadas.
- **Nunca commite dados pessoais** — `.env` no `.gitignore`, badges genéricos.
- **Service worker:** faça bump do cache (`hermes-remote-v<NN>`) a cada deploy.

## Processo

1. Branch a partir de `master`: `git checkout -b feat/nome-da-feature`
2. Faça commits pequenos e atômicos
3. Rode `node --check public/js/*.js` para validar sintaxe JS
4. Rode `bash scripts/scan-secrets.sh` para garantir que não vazou dados
5. Abra PR no GitHub (`git push origin feat/nome-da-feature`)
6. CI roda lint + scan automaticamente
7. Merge após revisão e CI verde

## CI

O workflow `.github/workflows/ci.yml` roda em todo push/PR:

- Lint de sintaxe JS (`node --check`)
- Varredura de segredos (`scripts/scan-secrets.sh`)