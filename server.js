const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const NINEROUTER_URL = process.env.NINEROUTER_URL;
const NINEROUTER_KEY = process.env.NINEROUTER_KEY;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

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

app.post('/api/chat', async (req, res) => {
  try {
    const { model, messages, stream = false } = req.body;

    const headers = { 'Content-Type': 'application/json' };
    if (NINEROUTER_KEY) headers['Authorization'] = `Bearer ${NINEROUTER_KEY}`;

    const body = { model, messages, stream };

    const response = await fetch(`${NINEROUTER_URL}/v1/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

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
    } else {
      const data = await response.json();
      res.json(data);
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao comunicar com 9Router: ' + error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Chat-web rodando em http://localhost:${PORT}`);
  console.log(`Conectado a 9Router em ${NINEROUTER_URL}`);
});