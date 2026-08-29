const express = require('express');
const cors = require('cors');
const { execSync } = require('child_process');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ── Configuração do Hermes API server ──────────────────────────
const HERMES_URL = process.env.HERMES_URL || 'http://127.0.0.1:8642';
const HERMES_KEY = process.env.HERMES_API_KEY || '';
const HERMES_TIMEOUT = parseInt(process.env.HERMES_TIMEOUT || '120', 10);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper: headers para chamar o Hermes API server
function hermesHeaders(extra = {}) {
  const headers = { 'Content-Type': 'application/json', ...extra };
  if (HERMES_KEY) headers['Authorization'] = `Bearer ${HERMES_KEY}`;
  return headers;
}

// ── Health do próprio backend ───────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', backend: 'chat-web', hermes: HERMES_URL });
});

// ── Proxy para o Hermes API server ──────────────────────────────
app.get('/api/models', async (req, res) => {
  try {
    const response = await fetch(`${HERMES_URL}/v1/models`, { headers: hermesHeaders() });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar modelos: ' + error.message });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { model, messages, stream = false } = req.body;

    const response = await fetch(`${HERMES_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: hermesHeaders(),
      body: JSON.stringify({ model, messages, stream }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: 'Hermes API: ' + errText });
    }

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
    res.status(500).json({ error: 'Erro ao comunicar com Hermes: ' + error.message });
  }
});

// ── Status da infraestrutura (dashboard) ────────────────────────
app.get('/api/status', (req, res) => {
  const result = { notebook: null, servidor: null, cota: null };

  // Notebook
  try {
    const uptime = execSync('uptime -p', { timeout: 5000 }).toString().trim().replace(/^up\s+/, '');
    const load = execSync("uptime | grep -oP 'load average:.*' | cut -d: -f2", { timeout: 5000 }).toString().trim();
    const ram = execSync("free -h | grep Mem | awk '{print $3 \"/\" $2}'", { timeout: 5000 }).toString().trim();
    const disco = execSync("df -h / | tail -1 | awk '{print $3 \"/\" $2 \" (\" $5 \")\"}'", { timeout: 5000 }).toString().trim();
    result.notebook = { uptime, load, ram, disco };
  } catch (e) {
    result.notebook = { erro: e.message };
  }

  // Servidor (via SSH — mesmo mecanismo do diário)
  try {
    const ssh = execSync(
      "ssh -o ConnectTimeout=8 -o BatchMode=yes usuario@homeserver 'uptime -p 2>/dev/null; echo ---; cd /opt/homeserver 2>/dev/null && bash scripts/health-check.sh 2>/dev/null | grep -E \"temperatura|load|mem\"'",
      { timeout: 20000 }
    ).toString().trim();
    result.servidor = { raw: ssh };
  } catch (e) {
    result.servidor = { erro: 'servidor offline ou ssh falhou' };
  }

  // Cota FreeLLMAPI
  try {
    const key = require('fs').readFileSync(process.env.HOME + '/.hermes/.env', 'utf8')
      .match(/HERMES_CUSTOM_FREELLMAPI_API_KEY=(\S+)/)?.[1] || '';
    const models = execSync(
      `curl -sS http://127.0.0.1:3001/v1/models -H "Authorization: Bearer ${key}" 2>/dev/null | grep -o '"id":"[^"]*"' | wc -l`,
      { timeout: 8000 }
    ).toString().trim();
    result.cota = { modelos: parseInt(models || '0', 10) };
  } catch (e) {
    result.cota = { erro: 'FreeLLMAPI offline' };
  }

  res.json(result);
});

app.listen(PORT, () => {
  console.log(`Hermes Remote rodando em http://localhost:${PORT}`);
  console.log(`Conectado ao Hermes API server em ${HERMES_URL}`);
});

// ── Ações rápidas (diário, revisar, dormir) ────────────────────
// Executam os scripts existentes. Rodam em background para não
// bloquear a resposta (alguns demoram ~30s).
const { exec } = require('child_process');
const HOME = process.env.HOME;

function runScript(cmd, callback) {
  exec(cmd, { timeout: 30000, shell: '/bin/bash' }, (error, stdout, stderr) => {
    if (error) return callback(error.message + (stderr || ''));
    callback(null, stdout);
  });
}

// Diário de saúde (no homeserver)
app.post('/api/acao/diario', (req, res) => {
  const cmd = `ssh -o ConnectTimeout=10 -o BatchMode=yes usuario@homeserver 'bash /opt/homeserver/scripts/server-power.sh 2>/dev/null; bash /opt/homeserver/scripts/health-check.sh 2>/dev/null'`;
  runScript(cmd, (err, out) => {
    if (err) return res.status(500).json({ ok: false, error: 'Servidor offline: ' + err });
    res.json({ ok: true, output: out });
  });
});

// Code review (via script local — precisa do notebook acordado)
app.post('/api/acao/revisar', (req, res) => {
  const cmd = `nohup bash ${HOME}/.hermes/scripts/code-review.sh > /dev/null 2>&1 & echo "ok"`;
  runScript(cmd, (err) => {
    if (err) return res.status(500).json({ ok: false, error: err });
    res.json({ ok: true, message: 'Code review disparado' });
  });
});

// Dormir servidor (via SSH — só funciona se servidor acordado)
app.post('/api/acao/dormir', (req, res) => {
  const cmd = `ssh -o ConnectTimeout=10 -o BatchMode=yes usuario@homeserver 'sudo /usr/sbin/rtcwake -m mem -t $(date -d "tomorrow 08:00" +%s) > /dev/null 2>&1 &' && echo ok`;
  runScript(cmd, (err) => {
    if (err) return res.status(500).json({ ok: false, error: 'Não conseguiu dormir: ' + err });
    res.json({ ok: true, message: 'Servidor vai dormir (acorda 08:00)' });
  });
});