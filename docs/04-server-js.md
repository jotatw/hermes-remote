# Server.js explicado

Este arquivo cria um servidor web que funciona como intermediário entre o navegador e a 9Router.

## Código completo com explicações

```javascript
// Importa as bibliotecas necessárias
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Cria o servidor
const app = express();
const PORT = process.env.PORT || 3000;
const NINEROUTER_URL = process.env.NINEROUTER_URL;
const NINEROUTER_KEY = process.env.NINEROUTER_KEY;
```

**O que cada linha faz:**
- `require('express')` — importa o Express, biblioteca para criar servidores web
- `require('cors')` — importa o CORS, para permitir que o navegador acesse o servidor
- `require('dotenv').config()` — carrega as variáveis do arquivo .env
- `app = express()` — cria o servidor de fato
- `PORT`, `NINEROUTER_URL`, `NINEROUTER_KEY` — lê as configurações do .env

```javascript
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
```

**Middleware** (funções que processam as requisições):
- `cors()` — libera o acesso de qualquer origem
- `express.json()` — permite receber JSON no corpo das requisições
- `express.static(__dirname)` — serve arquivos estáticos (index.html) da pasta atual

```javascript
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});
```

**Rota de saúde**: usada para verificar se o servidor está rodando.

```javascript
app.get('/api/models', async (req, res) => {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (NINEROUTER_KEY) headers['Authorization'] = `Bearer ${NINEROUTER_KEY}`;

    const response = await fetch(`${NINEROUTER_URL}/v1/models`, { headers });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar modelos: ' + error.message });
  }
});
```

**GET /api/models**: busca a lista de modelos disponíveis na 9Router e retorna para o frontend. O `try/catch` captura erros (ex: 9Router offline).

```javascript
app.post('/api/chat', async (req, res) => {
  try {
    const { model, messages, stream = false } = req.body;

    const headers = { 'Content-Type': 'application/json' };
    if (NINEROUTER_KEY) headers['Authorization'] = `Bearer ${NINEROUTER_KEY}`;

    const body = { model, messages, stream };
```

**POST /api/chat**: recebe os dados do frontend (modelo, mensagens, streaming). Prepara os headers com a chave de API.

```javascript
    const response = await fetch(`${NINEROUTER_URL}/v1/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
```

Faz a requisição para a 9Router, igual ao curl da skill 9router-chat.

```javascript
    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(decoder.decode(value));
      }
      res.end();
    }
```

**Streaming**: configura headers especiais (SSE) e lê a resposta da 9Router em pedaços. Cada pedaço é enviado imediatamente para o frontend, criando o efeito de texto aparecendo em tempo real.

```javascript
    } else {
      const data = await response.json();
      res.json(data);
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao comunicar com 9Router: ' + error.message });
  }
});
```

Sem streaming: espera a resposta completa e devolve de uma vez.

```javascript
app.listen(PORT, () => {
  console.log(`Chat-web rodando em http://localhost:${PORT}`);
  console.log(`Conectado a 9Router em ${NINEROUTER_URL}`);
});
```

**Inicialização**: liga o servidor na porta configurada e mostra mensagem no terminal.

## Para modificar o server.js

| Se quiser | Onde mexer |
|---|---|
| Mudar a porta | Altere PORT no .env |
| Adicionar log de requisições | Adicione `app.use(morgan('dev'))` |
| Usar outro endpoint da 9Router | Mude a URL no fetch |
| Adicionar autenticação | Adicione headers antes do fetch |
| Adicionar cache de respostas | Crie um objeto antes do app.listen |