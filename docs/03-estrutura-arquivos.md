# Estrutura de Arquivos

```
chat-web/
├── .env                    # Configuração: URL e chave da 9Router
├── .gitignore              # Arquivos que não vão para o Git
├── package.json            # Dependências e scripts do projeto
├── server.js               # Servidor proxy (Node.js + Express)
├── index.html              # Estrutura da página (HTML puro)
├── css/
│   └── style.css           # Estilo visual (cores, layout, temas)
├── js/
│   ├── app.js              # Lógica do chat (JS puro)
│   ├── sidebar.js          # CRUD de conversas + persistência
│   └── todos.js            # Lista TODO (3 estados) por conversa
├── README.md               # Instruções rápidas para rodar
└── docs/                   # Documentação completa
    ├── 01-visao-geral.md
    ├── 02-como-funciona.md
    ├── 03-estrutura-arquivos.md
    ├── 04-server-js.md
    ├── 05-frontend.md
    ├── 06-como-rodar.md
    ├── 07-como-melhorar.md
    ├── 08-glossario.md
    ├── 09-melhorias-futuras.md
    └── 10-sidebar.md
```

## Descrição de cada arquivo

### `.env`
Armazena as variáveis de ambiente: URL da 9Router e chave de API.
Nunca compartilhe este arquivo (por isso está no .gitignore).

### `.gitignore`
Lista arquivos que não devem ser enviados para o Git: node_modules e .env.

### `package.json`
Arquivo de configuração do Node.js. Define nome, versão, dependências e scripts.
Para instalar as dependências: `npm install`
Para rodar: `npm start`

### `server.js`
Servidor web em Node.js com Express.
Faz 3 coisas importantes:
1. Serve os arquivos estáticos (index.html, css/, js/) quando você acessa http://localhost:3000
2. GET /api/models — busca lista de modelos da 9Router
3. POST /api/chat — encaminha mensagens para a 9Router e devolve a resposta com streaming

### `index.html`
Estrutura da página (HTML puro, ~70 linhas). Contém header, área de mensagens e input.
Inclui `<link>` para `css/style.css` e `<script>` para `js/app.js`.

### `css/style.css`
Estilo visual completo (~270 linhas). Inclui:
- 4 temas de cores (claro, azul escuro, preto, cinza)
- Layout responsivo
- Animações e transições
- Estilo do menu de temas, mensagens, input, botões

### `js/app.js`
Toda a lógica do chat (~310 linhas). Inclui:
- Envio e recebimento de mensagens com streaming
- **Memória da IA** (envia histórico completo + contexto system)
- Seletor de modelos
- Seletor de temas
- Botão copiar, timestamp, placeholder rotativo
- Botão Parar para cancelar requisição

### `js/sidebar.js`
CRUD de conversas e persistência (~150 linhas). Inclui:
- Lista de conversas na sidebar (criar, renomear, trocar, excluir)
- Persistência no localStorage (`chatWebData`)
- Integração com TODOs e contexto (chama renderizarListaTodos, carregarContexto)

### `js/todos.js`
Lista TODO com 3 estados (~120 linhas). Inclui:
- Tarefas com ciclo ○ pendente → ◐ em progresso → ☑ concluída
- Lista independente por conversa
- Contador de conclusão (X/Y)
- Integração com sidebar e localStorage

### `docs/`
Pasta com documentação explicativa. Cada arquivo cobre um tópico específico para facilitar o entendimento e a manutenção.