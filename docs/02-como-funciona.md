# Como Funciona

## Fluxo completo de uma mensagem

```
1. Você digita "Qual é a capital do Brasil?"
        |
2. index.html mostra a mensagem como bolha azul
        |
3. index.html envia POST /api/chat para server.js
        |  Corpo: { model: "openai/gpt-5", messages: [...], stream: true }
        |
4. server.js recebe e adiciona o header Authorization com sua chave
        |
5. server.js envia para 9Router em http://localhost:20128/v1/chat/completions
        |
6. 9Router encaminha para o modelo escolhido (ex: GPT-5)
        |
7. O modelo processa e começa a responder
        |
8. A resposta volta em pedaços (streaming) para server.js
        |
9. server.js encaminha cada pedaço para index.html
        |  Formato: data: {"choices":[{"delta":{"content":"Bras"}}]}
        |
10. index.html mostra cada pedaço na tela em tempo real
        |  "Bras" → "Brasília" → "Brasília é a capital"
        |
11. Quando termina, o servidor avisa: data: [DONE]
```

## Detalhamento de cada etapa

### Frontend (index.html)

**Carregar modelos**
- Quando a página abre, faz GET /api/models
- Server.js busca na 9Router e devolve a lista
- O dropdown é preenchido com os nomes dos modelos

**Enviar mensagem**
- Pega o texto digitado e o modelo selecionado
- Cria uma bolha azul com o texto do usuário
- Cria uma bolha cinza vazia para a resposta
- Envia POST /api/chat com stream: true
- Enquanto a resposta chega, atualiza o texto da bolha cinza
- Quando termina, para de mostrar o indicador de streaming

**Nova conversa**
- Limpa todas as mensagens da tela
- Volta ao estado inicial

### Backend (server.js)

**GET /api/models**
- Faz fetch para NINEROUTER_URL/v1/models
- Retorna a lista para o frontend

**POST /api/chat**
- Recebe { model, messages, stream }
- Adiciona Authorization header com a chave
- Encaminha para 9Router
- Se stream = true:
  - Configura resposta como SSE (Server-Sent Events)
  - Lê a resposta da 9Router em pedaços
  - Envia cada pedaço para o frontend
- Se stream = false:
  - Espera a resposta completa
  - Retorna o JSON inteiro

### 9Router

- Recebe a requisição do server.js
- Verifica a chave de API
- Encaminha para o provedor/modelo correto
- Se for um combo (ex: "vip"), tenta vários provedores em sequência até um funcionar

## O que é streaming?

Sem streaming: você espera a resposta inteira e ela aparece de uma vez.
Com streaming: a resposta aparece palavra por palavra enquanto o modelo pensa.

Streaming é melhor porque:
- Parece mais rápido (você vê algo acontecendo)
- Melhor experiência de usuário
- Pode interromper antes do fim se a resposta não for boa