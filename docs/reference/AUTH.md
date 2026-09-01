# Autenticação

> Modelo de segurança do Hermes Remote. O gateway (homeserver) é o único
> ponto que autentica — o notebook (Hermes) nunca é exposto diretamente.

## Modelo

```
Cliente (PWA)  ── Authorization: Bearer <token> ──►  Gateway (homeserver)
                                                       │
                                                       ├── /api/chat → notebook (Hermes, com HERMES_API_KEY)
                                                       └── /api/status, /api/acao/* → local/SSH
```

## Fluxo

1. O usuário faz login no PWA com a senha configurada no gateway.
2. O gateway valida e devolve um token de sessão.
3. O cliente envia `Authorization: Bearer <token>` em todas as chamadas `/api/*`.
4. Rotas protegidas rejeitam com `401` se o token faltar ou for inválido.

## Regras

- **Senha nunca vai na URL** — sempre no body (login) ou header (demais).
- **CORS** — apenas origens permitidas:
  - Local: `http://localhost:3002`
  - Remoto: `https://homeserver.tail*.ts.net`
- **TLS** — acesso remoto somente via HTTPS (Caddy/Tailscale). Sem HTTP puro
  fora da rede local.
- **Segredos do Hermes** (`HERMES_API_KEY`) ficam no `.env` do gateway —
  nunca no cliente.
- Repo público: nenhuma credencial real em código ou docs.
