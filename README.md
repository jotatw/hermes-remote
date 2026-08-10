# Chat Web - 9Router

Chat web para conversar com modelos de IA via 9Router.

## Como rodar

```bash
npm install
npm start
```

Abra http://localhost:3000

## Documentação

A pasta `docs/` explica cada parte do projeto em detalhes.

| Arquivo | O que explica |
|---|---|
| [01-visao-geral.md](docs/01-visao-geral.md) | O que é o projeto |
| [02-como-funciona.md](docs/02-como-funciona.md) | Fluxo da aplicação |
| [03-estrutura-arquivos.md](docs/03-estrutura-arquivos.md) | O que cada arquivo faz |
| [04-server-js.md](docs/04-server-js.md) | Server.js explicado linha a linha |
| [05-frontend.md](docs/05-frontend.md) | index.html, css/style.css e js/app.js explicados |
| [06-como-rodar.md](docs/06-como-rodar.md) | Passo a passo para rodar |
| [07-como-melhorar.md](docs/07-como-melhorar.md) | Ideias de próximos passos |
| [08-glossario.md](docs/08-glossario.md) | Termos técnicos explicados |
| [09-melhorias-futuras.md](docs/09-melhorias-futuras.md) | Histórico de melhorias |
| [10-sidebar.md](docs/10-sidebar.md) | Sidebar, conversas, tarefas e contexto |
| [11-deploy.md](docs/11-deploy.md) | Como rodar com PM2 em produção |

## Arquivos principais

```
chat-web/
├── server.js         # servidor proxy (conecta frontend com 9Router)
├── index.html        # estrutura da página
├── css/style.css     # estilo visual (cores, temas, layout)
├── js/app.js         # lógica do chat (envio, streaming, temas)
├── js/sidebar.js     # CRUD de conversas + persistência
├── js/todos.js       # lista TODO (3 estados)
└── .env              # configuração (URL e chave da 9Router)
```

## Deploy

Para rodar em produção com reinício automático, use o PM2:

```bash
npm install -g pm2
pm2 start server.js --name chat-web
pm2 save
pm2 startup
```

Veja [docs/11-deploy.md](docs/11-deploy.md) para instruções completas.

## Funcionalidades

- Chat com streaming em tempo real
- Seletor de modelos (carregado automaticamente da 9Router)
- **4 temas visuais**: ☀️ Claro, 🌙 Azul, 🖤 Preto, 🌫️ Cinza
- **Sidebar com múltiplas conversas** (criar, renomear, trocar, excluir)
- **Lista TODO** com 3 estados (○ pendente / ◐ em progresso / ☑ concluída)
- **Contexto global editável** — instruções enviadas como system message
- **Memória da IA** — o modelo lembra do contexto da conversa
- **Exportar conversa** em TXT, Markdown ou JSON
- **Contador de tokens** discreto (quando a 9Router retorna `usage`)
- Botão **⏹ Parar** para cancelar requisição em andamento
- Timestamp com data nas mensagens
- Botão de copiar resposta (📋)
- Auto-scroll suave
- Placeholder rotativo com dicas