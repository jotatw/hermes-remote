# Como Melhorar o Projeto

Ideias de evolução organizadas por dificuldade.

## Nível Fácil (só mexe em index.html)

### Mudar as cores do tema
Edite as variáveis CSS no `:root` do index.html. Mude `--user-msg`, `--bg`, etc.

### Adicionar botão de copiar resposta
Adicione um botão em cada bolha do assistente que copia o texto para a área de transferência com `navigator.clipboard.writeText()`.

### Mostrar data/hora das mensagens
Adicione um timestamp pequeno abaixo de cada mensagem. Use `new Date().toLocaleTimeString()`.

### Placeholder com dicas
Mude o placeholder do input para sugestões: "Pergunte algo...", "Traduza um texto...", etc.

### Tecla Escape para limpar input
Adicione no handleKey: se `event.key === 'Escape'`, limpa o input.

## Nível Médio (mexe em index.html e talvez server.js)

### Dark mode
Crie um botão de toggle que muda as variáveis CSS entre tema claro e escuro. Salve a preferência no localStorage.

### Histórico de conversas (localStorage)
Salve as mensagens no localStorage quando chegar uma resposta. Na abertura da página, pergunte: "Continuar conversa anterior?".

### Múltiplas conversas (abas)
Crie uma sidebar com lista de conversas. Cada conversa é um array de mensagens salvo no localStorage com nome e data.

### Indicador de digitação
Enquanto espera a resposta, mostre "Assistente está digitando..." com animação de pontinhos.

### Botão de parar
Adicione um botão "Parar" que cancela a requisição em andamento (use `AbortController`).

### Selecionar modelo antes de enviar
Se o usuário tentar enviar sem selecionar modelo, destaque o dropdown com borda vermelha e mostre um aviso.

### Responsividade para mobile
Melhore o layout para telas menores (já tem um básico, mas pode ajustar fontes e padding).

## Nível Difícil (mexe em server.js e adiciona arquivos)

### Banco de dados SQLite
Em vez de localStorage, use SQLite no servidor para salvar conversas permanentemente. Use a biblioteca `better-sqlite3`.

### Autenticação
Adicione login com senha para proteger o acesso ao chat. Use `express-session` e um banco de usuários.

### Exportar conversa
Botão para baixar a conversa como TXT, JSON ou PDF. No servidor, gere o arquivo e envie como download.

### Upload de arquivos
Permita enviar imagens ou PDFs para o chat (se o modelo suportar visão). Adicione `multer` no server.js para upload.

### Múltiplos usuários
Se tiver banco de dados, múltiplos usuários podem ter suas próprias conversas separadas.

### Responder com voz (TTS)
Adicione um botão "Ouvir resposta" que usa a 9Router de TTS para transformar o texto em áudio.

## Nível Avançado

### Migrar para React
Crie componentes separados: ChatHeader, MessageList, MessageBubble, ChatInput. Use Vite + React.

### Migrar para Next.js
Transforme o projeto em Next.js com API routes (elimina server.js separado). Adicione rotas para conversas.

### WebSockets
Em vez de streaming via SSE, use WebSockets para comunicação bidirecional em tempo real.

### Plugins
Permita que o chat execute funções externas (buscar clima, calcular, pesquisar na web) via function calling da 9Router.

## Como decidir qual melhoria fazer?

Pergunte-se:
1. **O que está te incomodando?** (ex: "quero ver a hora da mensagem")
2. **Qual melhoria dá mais resultado com menos código?** (cores > dark mode > histórico)
3. **O que você quer aprender?** (React? Banco de dados? Streaming?)

Comece pelas fáceis e vá subindo. Cada melhoria te ensina algo novo.