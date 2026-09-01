# Segurança — Checklist de publicação

> Regras para manter o repositório público livre de segredos e dados pessoais.
> Rode `bash scripts/scan-secrets.sh` antes de qualquer push e sempre que
> adicionar arquivos.

## O que nunca deve estar no repo

- **Segredos:** tokens, chaves de API, senhas (`sk-`, `ghp_`, `Bearer`, ...)
- **Dados pessoais:** nomes reais, e-mails pessoais, usuários SSH reais
- **IPs privados reais:** IPs tailnet (`100.x.y.z`) e IPs de rede (`192.168.*`)

## Substituições padrão

| Dado real | Placeholder no repo |
|-----------|---------------------|
| Usuário SSH | `usuario` |
| IP tailnet | `100.xx.xx.xx` |
| Host de deploy | `usuario@homeserver` |
| Paths (`/srv/...`) | `/opt/homeserver` |
| URLs tailnet | `tailnet.ts.net` |
| E-mail do autor | `dev@hermes-remote.local` |

## Verificações

- [ ] `.env` fora do git (só `.env.example` com placeholders)
- [ ] `scripts/scan-secrets.sh` retorna vazio
- [ ] Autor dos commits genérico (`Hermes Remote`)
- [ ] Nenhum e-mail pessoal em docs ou código
- [ ] Histórico git limpo (se vazou no passado → reescrever histórico)

## Como rodar

```bash
bash scripts/scan-secrets.sh
```

O script varre o working tree e o histórico (`git log --all`). Qualquer match
precisa ser corrigido antes de commitar.
