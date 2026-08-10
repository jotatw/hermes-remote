# Deploy com PM2

O PM2 é um gerenciador de processos para Node.js que mantém o chat-web rodando em segundo plano, reinicia automaticamente se cair e pode iniciar com o sistema.

## Instalação

```bash
npm install -g pm2
```

## Iniciar o chat-web

```bash
cd /home/usuario/IdeaProjects/hermes-remote
pm2 start server.js --name chat-web
```

Saída esperada:
```
┌─────┬──────────┬──────────┬──────┬───────────┬──────────┬──────────┐
│ id  │ name     │ mode     │ ↺    │ status    │ cpu      │ memory   │
├─────┼──────────┼──────────┼──────┼───────────┼──────────┼──────────┤
│ 0   │ chat-web │ fork     │ 0    │ online    │ 0%       │ 30.1mb   │
└─────┴──────────┴──────────┴──────┴───────────┴──────────┴──────────┘
```

## Comandos úteis

```bash
pm2 status              # ver status
pm2 logs chat-web       # ver logs em tempo real
pm2 logs chat-web --lines 50   # últimas 50 linhas
pm2 restart chat-web    # reiniciar
pm2 stop chat-web       # parar
pm2 delete chat-web     # remover do PM2
```

## Iniciar automaticamente com o sistema

```bash
pm2 save
pm2 startup
```

O `pm2 startup` vai gerar um comando. Copie e execute ele. Pronto: o chat-web sobe sozinho quando o computador ligar.

## Atualizar após mudanças no código

```bash
pm2 restart chat-web
```

## Verificar se está rodando

```bash
curl http://localhost:3000/api/health
# → {"status":"ok"}
```

## Solução de problemas

| Problema | Causa | Solução |
|---|---|---|
| `pm2: command not found` | PM2 não instalado globalmente | `npm install -g pm2` |
| Porta 3000 ocupada | Outro processo na porta | `kill $(lsof -ti:3000)` ou mude `PORT` no `.env` |
| `pm2 startup` não funcionou | Precisa de sudo | O comando gerado já pede sudo se necessário |