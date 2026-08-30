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
    const [res, resDetalhes] = await Promise.all([
      fetch('/api/status').then(function (r) { return r.json(); }),
      fetch('/api/servidor').then(function (r) { return r.json(); })
    ]);
    const data = res;

    // Notebook
    if (data.notebook && data.notebook.erro) {
      corpo.notebook.textContent = '❌ ' + data.notebook.erro;
    } else if (data.notebook && data.notebook.offline) {
      corpo.notebook.textContent = '😴 ' + data.notebook.offline;
    } else if (data.notebook) {
      corpo.notebook.innerHTML =
        '⏱️ Uptime: <b>' + (data.notebook.uptime || '?') + '</b><br>' +
        '💾 RAM: <b>' + (data.notebook.ram || '?') + '</b><br>' +
        '💽 Disco: <b>' + (data.notebook.disco || '?') + '</b><br>' +
        (data.notebook.load ? '📊 Load: ' + data.notebook.load : '') +
        (data.notebook.local ? '<br>📍 rodando neste host' : '');
    } else {
      corpo.notebook.textContent = 'Sem dados';
    }

    // Servidor (com temperatura + containers)
    if (data.servidor && data.servidor.erro) {
      corpo.servidor.textContent = '🔴 ' + data.servidor.erro;
    } else if (data.servidor && data.servidor.offline) {
      corpo.servidor.textContent = '😴 ' + data.servidor.offline;
    } else if (data.servidor) {
      var servidorHtml =
        '⏱️ Uptime: <b>' + (data.servidor.uptime || '?') + '</b><br>' +
        '💾 RAM: <b>' + (data.servidor.ram || '?') + '</b><br>' +
        '💽 Disco: <b>' + (data.servidor.disco || '?') + '</b><br>' +
        (data.servidor.load ? '📊 Load: ' + data.servidor.load : '') +
        (data.servidor.local ? '<br>📍 rodando neste host' : '');

      // Temperatura
      if (resDetalhes.temperatura) {
        var temp = resDetalhes.temperatura;
        servidorHtml += '<br>🌡️ <b>' + temp + '°C</b> ' + (temp >= 80 ? '⚠️' : '✅');
      }

      // Resumo de containers
      if (resDetalhes.containers && resDetalhes.containers.length) {
        var total = resDetalhes.containers.length;
        var down = resDetalhes.containers.filter(function (c) { return !c.rodando; }).length;
        servidorHtml += '<br>🐳 ' + total + ' containers' + (down ? ' <span class="dim">(' + down + ' parado)</span>' : '');
      }

      corpo.servidor.innerHTML = servidorHtml;
    } else {
      corpo.servidor.textContent = 'Sem dados';
    }

    // Cota
    if (data.cota && data.cota.erro) {
      corpo.cota.textContent = '❌ ' + data.cota.erro;
    } else if (data.cota) {
      corpo.cota.innerHTML = '🎯 Modelos: <b>' + data.cota.modelos + '</b><br>Pool: ' + (data.cota.pool || '?');
    }
  } catch (error) {
    Object.values(corpo).forEach(el => { if (el) el.textContent = '❌ Erro: ' + error.message; });
  }
}

// ── Wake schedule no dashboard ─────────────────────────────────
async function carregarPowerSchedule() {
  const el = document.getElementById('power-schedule-info');
  if (!el) return;
  try {
    const res = await fetch('/api/power');
    const d = await res.json();
    if (d.ok && d.enabled) {
      el.innerHTML = '🛌 Dorme às <b>' + d.shutdown + '</b> · Acorda às <b>' + d.wake + '</b>' +
        '<br><span class="dim">Night-off automático</span>';
    } else if (d.ok && !d.enabled) {
      el.textContent = '⏸️ Night-off desativado';
    } else {
      el.textContent = '❌ ' + (d.error || 'indisponível');
    }
  } catch (e) {
    el.textContent = '❌ ' + e.message;
  }
}

// ── Histórico de ações ─────────────────────────────────────────
async function carregarHistoricoAcoes() {
  const el = document.getElementById('historico-acoes');
  if (!el) return;
  try {
    const res = await fetch('/api/acoes');
    const d = await res.json();
    if (!d.ok || !d.acoes || d.acoes.length === 0) {
      el.innerHTML = '<span class="dim">Nenhuma ação registrada ainda. Use as <a href="#" onclick="irPara(\'dashboard\'); return false">Ações Rápidas</a> no Dashboard!</span>';
      return;
    }
    el.innerHTML = d.acoes.map(function (a) {
      const icone = a.ok ? '✅' : '❌';
      const quando = new Date(a.quando).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
      return icone + ' <b>' + a.acao + '</b> · ' + quando + (a.detalhe ? ' <span class="dim">— ' + a.detalhe + '</span>' : '');
    }).join('<br>');
  } catch (e) {
    el.textContent = '❌ ' + e.message;
  }
}

async function carregarServidor() {
  const el = document.getElementById('servidor-detalhe');
  if (!el) return;
  el.innerHTML = '<div class="server-loading">Carregando...</div>';

  try {
    // Status básico + detalhes (containers, temperatura)
    const [resStatus, resDetalhes] = await Promise.all([
      fetch('/api/status').then(function (r) { return r.json(); }),
      fetch('/api/servidor').then(function (r) { return r.json(); })
    ]);

    const s = resStatus.servidor || {};
    if (s.erro) {
      el.innerHTML = '<div class="server-offline">🔴 <b>Servidor offline</b><br>' + s.erro + '</div>';
      return;
    }
    if (s.offline) {
      el.innerHTML = '<div class="server-offline">😴 <b>Servidor dormindo</b><br>' + s.offline + '</div>';
      return;
    }

    let html = '<div class="server-stats">';

    // Métricas principais
    const metrica = function (icone, rotulo, valor) {
      return '<div class="stat-card"><div class="stat-icon">' + icone + '</div><div class="stat-label">' + rotulo + '</div><div class="stat-value">' + (valor || '?') + '</div></div>';
    };
    html += metrica('⏱️', 'Uptime', s.uptime);
    html += metrica('💾', 'RAM', s.ram);
    html += metrica('💽', 'Disco', s.disco);
    if (s.load) html += metrica('📊', 'Load', s.load);
    html += '</div>';

    // Temperatura
    if (resDetalhes.temperatura) {
      const temp = resDetalhes.temperatura;
      const alta = temp >= 80;
      html += '<div class="server-temp ' + (alta ? 'alta' : 'ok') + '">' +
        '🌡️ <b>Temperatura: ' + temp + '°C</b> ' + (alta ? '⚠️ alta' : '✅ ok');
      if (alta) {
        html += ' <button class="action-btn inline" onclick="acaoDiario()">📋 Ver Diário</button>';
      }
      html += '</div>';
    }

    // Containers Docker — badges com status
    if (resDetalhes.containers && resDetalhes.containers.length) {
      html += '<div class="server-section-title">🐳 Containers (' + resDetalhes.containers.length + ')</div>';
      html += '<div class="server-containers">';
      resDetalhes.containers.forEach(function (c) {
        const cls = c.rodando ? (c.healthy ? 'ok' : 'warn') : 'down';
        const icone = c.rodando ? (c.healthy ? '🟢' : '🟡') : '⚪';
        const label = c.rodando ? (c.status || 'rodando') : 'parado';
        html += '<div class="container-chip ' + cls + '">' + icone + ' <b>' + c.nome + '</b> <span class="dim">' + label + '</span></div>';
      });
      html += '</div>';
    }

    html += '<div class="server-footnote">ℹ️ Detalhes completos no Diário de Saúde.</div>';
    el.innerHTML = html;
  } catch (error) {
    el.innerHTML = '<div class="server-offline">❌ Erro: ' + error.message + '</div>';
  }
}

// ── Ações rápidas ──────────────────────────────────────────────
function mostrarResultado(texto, tipo) {
  const el = document.getElementById('acao-resultado');
  if (el) {
    el.textContent = texto;
    el.classList.remove('hidden');
    el.classList.remove('ok', 'erro', 'loading');
    if (tipo) el.classList.add(tipo);
  }
}

function desabilitarBotoes(desabilitar) {
  document.querySelectorAll('.action-btn').forEach(function (b) {
    b.disabled = desabilitar;
  });
}

function acaoDiario() {
  desabilitarBotoes(true);
  mostrarResultado('📋 Enviando diário de saúde...', 'loading');
  fetch('/api/acao/diario').then(function (r) { return r.json(); }).then(function (d) {
    desabilitarBotoes(false);
    if (d.ok) {
      var msg = '✅ Diário enviado ao Telegram!';
      if (d.warnings) msg += ' ⚠️ Com alertas';
      if (d.output) {
        // Extrair resumo do relatório
        var pass = d.output.match(/PASS\s*:\s*(\d+)/);
        var fail = d.output.match(/FAIL\s*:\s*(\d+)/);
        if (pass || fail) msg += '<br><span class="dim">' + (pass ? 'PASS: ' + pass[1] : '') + (fail && fail[1] > 0 ? ' · FAIL: ' + fail[1] : '') + '</span>';
      }
      mostrarResultado(msg, 'ok');
    } else {
      mostrarResultado('❌ ' + (d.error || 'falha'), 'erro');
    }
  }).catch(function (e) {
    desabilitarBotoes(false);
    mostrarResultado('❌ ' + e.message, 'erro');
  });
}

function acaoRevisar() {
  desabilitarBotoes(true);
  mostrarResultado('🔄 Disparando code review...', 'loading');
  fetch('/api/acao/revisar').then(function (r) { return r.json(); }).then(function (d) {
    desabilitarBotoes(false);
    mostrarResultado(d.ok ? '✅ Code review enviado ao Telegram!' : '❌ ' + (d.error || 'falha'), d.ok ? 'ok' : 'erro');
  }).catch(function (e) {
    desabilitarBotoes(false);
    mostrarResultado('❌ ' + e.message, 'erro');
  });
}

function acaoDormir() {
  if (!confirm('Deseja suspender o homeserver? Ele acorda às 08:00.')) return;
  desabilitarBotoes(true);
  mostrarResultado('😴 Suspending servidor...', 'loading');
  fetch('/api/acao/dormir').then(function (r) { return r.json(); }).then(function (d) {
    desabilitarBotoes(false);
    mostrarResultado(d.ok ? '😴 Servidor suspenso! (acorda 08:00)' : '❌ ' + (d.error || 'falha'), d.ok ? 'ok' : 'erro');
  }).catch(function (e) {
    desabilitarBotoes(false);
    mostrarResultado('❌ ' + e.message, 'erro');
  });
}

function acaoAcordar() {
  desabilitarBotoes(true);
  mostrarResultado('🌅 Enviando magic packet WOL...', 'loading');
  fetch('/api/acao/acordar').then(function (r) { return r.json(); }).then(function (d) {
    desabilitarBotoes(false);
    if (d.ok && d.ja_acordado) {
      mostrarResultado('🟢 Servidor já está acordado!', 'ok');
    } else if (d.ok) {
      mostrarResultado('🌅 Magic packet enviado! Aguardando o servidor acordar (~1min)...', 'ok');
    } else {
      mostrarResultado('❌ ' + (d.error || 'falha'), 'erro');
    }
  }).catch(function (e) {
    desabilitarBotoes(false);
    mostrarResultado('❌ ' + e.message, 'erro');
  });
}

function acaoStatus() {
  carregarServidor();
  carregarDashboard();
}

// ── Configurações ──────────────────────────────────────────────
// Mostra a configuração ATIVA do servidor (vinda do backend .env),
// não campos editáveis — a config vive no .env, não no navegador.
async function carregarConfig() {
  const el = document.getElementById('cfg-info');
  if (!el) return;
  try {
    const [resHealth, resStatus] = await Promise.all([
      fetch('/api/health').then(function (r) { return r.json(); }),
      fetch('/api/status').then(function (r) { return r.json(); })
    ]);

    const statusHermes = (resStatus.cota && resStatus.cota.modelos)
      ? '🟢 API server conectado (' + resStatus.cota.modelos + ' modelos)'
      : '🔴 API server indisponível';
    const host = resStatus.app || '?';

    el.innerHTML =
      '<div><b>Backend:</b> ' + (resHealth.backend || '?') + ' <span class="dim">(roda em: ' + host + ')</span></div>' +
      '<div><b>Hermes API server:</b> ' + (resHealth.hermes || '?') + '</div>' +
      '<div><b>Status:</b> ' + statusHermes + '</div>' +
      '<div class="cfg-hint" style="margin-top:8px">👆 Valores vêm do <code>.env</code> do servidor. ' +
      'Para mudar, edite o <code>.env</code> e reinicie o serviço.</div>';
  } catch (e) {
    el.innerHTML = '❌ ' + e.message;
  }
}