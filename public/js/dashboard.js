// ── Hermes Remote — Dashboard & Servidor ──────────────────────
// Cards de status, ações rápidas, visão do servidor

async function carregarDashboard() {
  const corpo = {
    notebook: document.getElementById('card-notebook-body'),
    servidor: document.getElementById('card-servidor-body'),
    cota: document.getElementById('card-cota-body'),
  };
  Object.values(corpo).forEach(el => { if (el) el.textContent = 'Carregando...'; });

  try {
    const res = await fetch('/api/status');
    const data = await res.json();

    // Notebook
    if (data.notebook && data.notebook.erro) {
      corpo.notebook.textContent = '❌ ' + data.notebook.erro;
    } else if (data.notebook) {
      corpo.notebook.innerHTML =
        '⏱️ Uptime: <b>' + data.notebook.uptime + '</b><br>' +
        '💾 RAM: <b>' + data.notebook.ram + '</b><br>' +
        '💽 Disco: <b>' + data.notebook.disco + '</b><br>' +
        '📊 Load: ' + data.notebook.load;
    } else {
      corpo.notebook.textContent = 'Sem dados';
    }

    // Servidor
    if (data.servidor && data.servidor.erro) {
      corpo.servidor.textContent = '🔴 ' + data.servidor.erro;
    } else if (data.servidor && data.servidor.raw) {
      const linhas = data.servidor.raw.split('\n').filter(Boolean);
      corpo.servidor.innerHTML = linhas.slice(0, 4).map(l => {
        const limpa = l.replace(/✔|✘/g, '').trim();
        const ok = l.includes('✔');
        return (ok ? '🟢 ' : '🔴 ') + limpa;
      }).join('<br>');
    } else {
      corpo.servidor.textContent = 'Sem dados';
    }

    // Cota
    if (data.cota && data.cota.erro) {
      corpo.cota.textContent = '❌ ' + data.cota.erro;
    } else if (data.cota) {
      corpo.cota.innerHTML = '🎯 Modelos: <b>' + data.cota.modelos + '</b><br>Pool FreeLLMAPI';
    }
  } catch (error) {
    Object.values(corpo).forEach(el => { if (el) el.textContent = '❌ Erro: ' + error.message; });
  }
}

async function carregarServidor() {
  const el = document.getElementById('servidor-detalhe');
  if (!el) return;
  el.textContent = 'Carregando...';

  try {
    const res = await fetch('/api/status');
    const data = await res.json();
    if (data.servidor && data.servidor.erro) {
      el.innerHTML = '🔴 <b>Servidor offline</b><br>' + data.servidor.erro;
      return;
    }
    if (data.servidor && data.servidor.raw) {
      const linhas = data.servidor.raw.split('\n').filter(Boolean);
      el.innerHTML = linhas.map(l => {
        const limpa = l.replace(/✔|✘/g, '').trim();
        const ok = l.includes('✔');
        return (ok ? '🟢 ' : '🔴 ') + limpa;
      }).join('<br>');
    }
  } catch (error) {
    el.textContent = '❌ Erro: ' + error.message;
  }
}

// ── Ações rápidas ──────────────────────────────────────────────
function mostrarResultado(texto) {
  const el = document.getElementById('acao-resultado');
  if (el) { el.textContent = texto; el.classList.remove('hidden'); }
}

function acaoDiario() {
  mostrarResultado('📋 Enviando diário de saúde ao Telegram...');
  fetch('/api/acao/diario').then(r => r.json()).then(d => {
    mostrarResultado(d.ok ? '✅ Diário enviado!' : '❌ ' + (d.error || 'falha'));
  }).catch(e => mostrarResultado('❌ ' + e.message));
}

function acaoRevisar() {
  mostrarResultado('🔄 Disparando code review...');
  fetch('/api/acao/revisar').then(r => r.json()).then(d => {
    mostrarResultado(d.ok ? '✅ Code review enviado ao Telegram!' : '❌ ' + (d.error || 'falha'));
  }).catch(e => mostrarResultado('❌ ' + e.message));
}

function acaoDormir() {
  if (!confirm('Deseja suspender o homeserver?')) return;
  mostrarResultado('😴 Suspending servidor...');
  fetch('/api/acao/dormir').then(r => r.json()).then(d => {
    mostrarResultado(d.ok ? '😴 Servidor suspenso!' : '❌ ' + (d.error || 'falha'));
  }).catch(e => mostrarResultado('❌ ' + e.message));
}

function acaoStatus() {
  carregarServidor();
}

// ── Configurações ──────────────────────────────────────────────
function testarConexao() {
  const el = document.getElementById('cfg-resultado');
  const url = document.getElementById('cfgUrl').value || 'http://localhost:8642';
  const key = document.getElementById('cfgKey').value || '';
  localStorage.setItem('hermesUrl', url);
  localStorage.setItem('hermesKey', key);
  el.textContent = 'Testando ' + url + '...';

  fetch('/api/health').then(r => r.json()).then(d => {
    el.textContent = '✅ Backend OK. Conectado a: ' + d.hermes;
  }).catch(e => { el.textContent = '❌ ' + e.message; });
}