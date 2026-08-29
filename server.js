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
// Auto-detecta onde o app roda: no HOMESERVER → servidor é local,
// notebook via SSH (best-effort). No NOTEBOOK → notebook é local,
// servidor via SSH.
const os = require('os');
const HOSTNAME = os.hostname().toLowerCase();
const IS_HOMESERVER = HOSTNAME.includes('homeserver');
const NOTEBOOK_IP = process.env.NOTEBOOK_IP || '100.78.xx.xx'; // tailnet
const HOMESERVER_IP = process.env.HOMESERVER_IP || '100.118.xx.xx'; // tailnet

function localStatus() {
  const uptime = execSync('uptime -p', { timeout: 5000 }).toString().trim().replace(/^up\s+/, '');
  const load = execSync("uptime | grep -oP 'load average:.*' | cut -d: -f2", { timeout: 5000 }).toString().trim();
  const ram = execSync("free -h | grep Mem | awk '{print $3 \"/\" $2}'", { timeout: 5000 }).toString().trim();
  const disco = execSync("df -h / | tail -1 | awk '{print $3 \"/\" $2 \" (\" $5 \")\"}'", { timeout: 5000 }).toString().trim();
  return { uptime, load, ram, disco };
}

function sshStatus(host) {
  try {
    return execSync(
      `ssh -o ConnectTimeout=6 -o BatchMode=yes usuario@${host} 'uptime -p 2>/dev/null; echo ---; free -h | grep Mem | awk "{print \\$3\\"/\\"\\$2}"; df -h / | tail -1 | awk "{print \\$3\\"/\\"\\$2 \\"(\\" \\$5 \\")\\"}"'`,
      { timeout: 15000 }
    ).toString().trim();
  } catch (e) {
    return null;
  }
}

app.get('/api/status', (req, res) => {
  const result = { notebook: null, servidor: null, cota: null, app: HOSTNAME };

  if (IS_HOMESERVER) {
    // Servidor = local; notebook via SSH (pode estar dormindo)
    try { result.servidor = { local: true, ...localStatus() }; }
    catch (e) { result.servidor = { erro: e.message }; }

    const nb = sshStatus(NOTEBOOK_IP);
    if (nb) {
      const [uptime, ram, disco] = nb.split('---').map(s => (s || '').trim());
      result.notebook = { uptime, ram, disco };
    } else {
      result.notebook = { offline: 'notebook dormindo ou inacessível' };
    }
  } else {
    // Notebook = local; servidor via SSH
    try { result.notebook = { local: true, ...localStatus() }; }
    catch (e) { result.notebook = { erro: e.message }; }

    const sv = sshStatus(HOMESERVER_IP);
    if (sv) {
      const [uptime, ram, disco] = sv.split('---').map(s => (s || '').trim());
      result.servidor = { uptime, ram, disco };
    } else {
      result.servidor = { offline: 'servidor offline ou ssh falhou' };
    }
  }

  // Cota de IA — modelos disponíveis no Hermes API server
  fetch(`${HERMES_URL}/v1/models`, { headers: hermesHeaders() })
    .then(r => r.json())
    .then(data => {
      result.cota = { modelos: (data.data || []).length, pool: 'Hermes API server' };
      res.json(result);
    })
    .catch(() => {
      result.cota = { erro: 'API server indisponível' };
      res.json(result);
    });
});

app.listen(PORT, () => {
  console.log(`Hermes Remote rodando em http://localhost:${PORT}`);
  console.log(`Conectado ao Hermes API server em ${HERMES_URL}`);
});

// ── Detalhes do servidor (containers, serviços, temperatura) ────
app.get('/api/servidor', (req, res) => {
  const resultado = { host: HOSTNAME, containers: [], temperatura: null, erro: null };

  try {
    // Containers Docker (status + nome)
    const docker = execSync(
      "docker ps -a --format '{{.Names}}|{{.Status}}' 2>/dev/null",
      { timeout: 10000, shell: '/bin/bash' }
    ).toString().trim();

    if (docker) {
      resultado.containers = docker.split('\n').filter(Boolean).map(function (linha) {
        const [nome, status] = linha.split('|');
        const rodando = status.startsWith('Up');
        const healthy = status.includes('healthy');
        return { nome, status, rodando, healthy };
      });
    }

    // Temperatura (se health-check existir)
    try {
      const health = execSync(
        "bash /opt/homeserver/scripts/health-check.sh 2>/dev/null | grep -i 'temperatura' || true",
        { timeout: 15000, shell: '/bin/bash' }
      ).toString().trim();
      const temp = (health.match(/(\d+)C/) || [])[1];
      if (temp) resultado.temperatura = parseInt(temp, 10);
    } catch (e) { /* temperatura indisponível */ }

    res.json(resultado);
  } catch (e) {
    resultado.erro = e.message;
    res.status(500).json(resultado);
  }
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

// Diário de saúde — local se no homeserver, senão via SSH
app.post('/api/acao/diario', (req, res) => {
  const local = 'bash /opt/homeserver/scripts/health-check.sh 2>/dev/null';
  const viaSsh = `ssh -o ConnectTimeout=8 -o BatchMode=yes usuario@${HOMESERVER_IP} '${local}'`;
  runScript(IS_HOMESERVER ? local : viaSsh, (err, out) => {
    if (err) return res.status(500).json({ ok: false, error: 'Servidor offline: ' + err });
    res.json({ ok: true, output: out });
  });
});

// Code review (script local do Hermes — no homeserver também existe cópia)
app.post('/api/acao/revisar', (req, res) => {
  const script = `${HOME}/.hermes/scripts/code-review.sh`;
  const cmd = `nohup bash ${script} > /dev/null 2>&1 & echo "ok"`;
  runScript(cmd, (err) => {
    if (err) return res.status(500).json({ ok: false, error: err });
    res.json({ ok: true, message: 'Code review disparado' });
  });
});

// Dormir servidor — local se no homeserver, senão via SSH
app.post('/api/acao/dormir', (req, res) => {
  const local = 'sudo /usr/sbin/rtcwake -m mem -t $(date -d "tomorrow 08:00" +%s) > /dev/null 2>&1 & echo ok';
  const viaSsh = `ssh -o ConnectTimeout=8 -o BatchMode=yes usuario@${HOMESERVER_IP} '${local}'`;
  runScript(IS_HOMESERVER ? local : viaSsh, (err) => {
    if (err) return res.status(500).json({ ok: false, error: 'Não conseguiu dormir: ' + err });
    res.json({ ok: true, message: 'Servidor vai dormir (acorda 08:00)' });
  });
});