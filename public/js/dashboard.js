// ── Hermes Remote — Dashboard & Servidor ──────────────────────
// Cards de status, ações rápidas, visão do servidor

async function carregarDashboard() {
  const corpo = {
    notebook: document.getElementById('card-notebook-body'),
    servidor: document.getElementById('card-servidor-body'),
    cota: document.getElementById('card-cota-body'),
  };
  Object.values(corpo).forEach(el => { if (el) el.textContent = 'Carregando...'; });
  saudacaoHome();

  try {
    const [res, resDetalhes] = await Promise.all([
      fetch('/api/status').then(function (r) { return r.json(); }),
      fetch('/api/servidor').then(function (r) { return r.json(); })
    ]);
    const data = res;
    atualizarResumoHome(data, resDetalhes);

    // Notebook
    if (data.notebook && data.notebook.erro) {
      corpo.notebook.innerHTML = ui.icono('cross', 'icon-sm') + ' ' + ui.escapeHtml(data.notebook.erro);
    } else if (data.notebook && data.notebook.offline) {
      corpo.notebook.innerHTML = ui.icono('sleep', 'icon-sm') + ' ' + ui.escapeHtml(data.notebook.offline);
    } else if (data.notebook) {
      corpo.notebook.innerHTML =
        ui.icono('clock', 'icon-sm') + ' Uptime: <b>' + (data.notebook.uptime || '?') + '</b><br>' +
        ui.icono('ram', 'icon-sm') + ' RAM: <b>' + (data.notebook.ram || '?') + '</b><br>' +
        ui.icono('disk', 'icon-sm') + ' Disco: <b>' + (data.notebook.disco || '?') + '</b><br>' +
        (data.notebook.load ? ui.icono('activity', 'icon-sm') + ' Load: ' + data.notebook.load : '') +
        (data.notebook.local ? '<br>' + ui.icono('node', 'icon-sm') + ' rodando neste host' : '');
    } else {
      corpo.notebook.textContent = 'Sem dados';
    }

    // Servidor (com temperatura + containers)
    if (data.servidor && data.servidor.erro) {
      corpo.servidor.innerHTML = ui.icono('cross', 'icon-sm') + ' ' + ui.escapeHtml(data.servidor.erro);
    } else if (data.servidor && data.servidor.offline) {
      corpo.servidor.innerHTML = ui.icono('sleep', 'icon-sm') + ' ' + ui.escapeHtml(data.servidor.offline);
    } else if (data.servidor) {
      var servidorHtml =
        ui.icono('clock', 'icon-sm') + ' Uptime: <b>' + (data.servidor.uptime || '?') + '</b><br>' +
        ui.icono('ram', 'icon-sm') + ' RAM: <b>' + (data.servidor.ram || '?') + '</b><br>' +
        ui.icono('disk', 'icon-sm') + ' Disco: <b>' + (data.servidor.disco || '?') + '</b><br>' +
        (data.servidor.load ? ui.icono('activity', 'icon-sm') + ' Load: ' + data.servidor.load : '') +
        (data.servidor.local ? '<br>' + ui.icono('node', 'icon-sm') + ' rodando neste host' : '');

      // Temperatura
      if (resDetalhes.temperatura) {
        var temp = resDetalhes.temperatura;
        servidorHtml += '<br>' + ui.icono('temp', 'icon-sm') + ' <b>' + temp + '°C</b> ' + (temp >= 80 ? ui.icono('warn', 'icon-sm') : ui.icono('check', 'icon-sm'));
      }

      // Resumo de containers
      if (resDetalhes.containers && resDetalhes.containers.length) {
        var total = resDetalhes.containers.length;
        var down = resDetalhes.containers.filter(function (c) { return !c.rodando; }).length;
        servidorHtml += '<br>' + ui.icono('container', 'icon-sm') + ' ' + total + ' containers' + (down ? ' <span class="dim">(' + down + ' parado)</span>' : '');
      }

      corpo.servidor.innerHTML = servidorHtml;
    } else {
      corpo.servidor.textContent = 'Sem dados';
    }

    // Cota
    if (data.cota && data.cota.erro) {
      corpo.cota.innerHTML = ui.icono('cross', 'icon-sm') + ' ' + ui.escapeHtml(data.cota.erro);
    } else if (data.cota) {
      corpo.cota.innerHTML = ui.icono('target', 'icon-sm') + ' Modelos: <b>' + data.cota.modelos + '</b><br>Pool: ' + (data.cota.pool || '?');
    }
  } catch (error) {
    Object.values(corpo).forEach(el => { if (el) el.innerHTML = ui.icono('cross', 'icon-sm') + ' Erro: ' + ui.escapeHtml(error.message); });
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
      el.innerHTML = ui.icono('sleep') + ' Dorme às <b>' + d.shutdown + '</b> · Acorda às <b>' + d.wake + '</b>' +
        '<br><span class="dim">Night-off automático</span>';
    } else if (d.ok && !d.enabled) {
      el.innerHTML = ui.icono('sleep') + ' Night-off desativado';
    } else {
      el.innerHTML = ui.icono('cross', 'icon-sm') + ' ' + ui.escapeHtml(d.error || 'indisponível');
    }
  } catch (e) {
    el.innerHTML = ui.icono('cross', 'icon-sm') + ' ' + ui.escapeHtml(e.message);
  }
}

// ── Histórico de ações ─────────────────────────────────────────
async function carregarHistoricoAcoes() {
  const el = document.getElementById('home-activity-list') || document.getElementById('historico-acoes');
  if (!el) return;
  try {
    const res = await fetch('/api/acoes');
    const d = await res.json();
    if (!d.ok || !d.acoes || d.acoes.length === 0) {
      el.innerHTML = '<span class="dim">Nenhuma ação registrada ainda. Use as <a href="#" data-action="navegar" data-view-alvo="dashboard">Ações Rápidas</a> no Dashboard!</span>';
      return;
    }
    el.innerHTML = d.acoes.map(function (a) {
      return ui.historicoLinha(a);
    }).join('<br>');
  } catch (e) {
    el.innerHTML = ui.icono('cross', 'icon-sm') + ' ' + ui.escapeHtml(e.message);
  }
}

function toggleHistDetalhes(id) {
  var el = document.getElementById(id);
  if (el) el.classList.toggle('open');
}

async function carregarServidor() {
  const el = document.getElementById('servidor-detalhe');
  if (!el) return;
  el.innerHTML = ui.loading('Carregando...');

  try {
    const [resStatus, resDetalhes] = await Promise.all([
      fetch('/api/status').then(function (r) { return r.json(); }),
      fetch('/api/servidor').then(function (r) { return r.json(); })
    ]);

    const s = resStatus.servidor || {};
    if (s.erro) { el.innerHTML = ui.offline(ui.icono('cross') + ' Servidor offline', s.erro); return; }
    if (s.offline) { el.innerHTML = ui.offline(ui.icono('sleep') + ' Servidor dormindo', s.offline); return; }

    let html = '<div class="server-stats">';
    html += ui.statCard(ui.icono('clock'), 'Uptime', s.uptime);
    html += ui.statCard(ui.icono('ram'), 'RAM', s.ram);
    html += ui.statCard(ui.icono('disk'), 'Disco', s.disco);
    if (s.load) html += ui.statCard(ui.icono('activity'), 'Load', s.load);
    html += '</div>';

    // Temperatura
    if (resDetalhes.temperatura) {
      const btnDiario = '<button class="action-btn inline" data-action="diario">' + ui.icono('activity', 'icon-sm') + ' Ver Diário</button>';
      html += ui.temperatura(resDetalhes.temperatura, btnDiario);
    }

    // Containers
    if (resDetalhes.containers && resDetalhes.containers.length) {
      html += '<div class="server-section-title">' + ui.icono('container') + ' Containers (' + resDetalhes.containers.length + ')</div>';
      html += '<div class="server-containers">';
      resDetalhes.containers.forEach(function (c) { html += ui.containerChip(c); });
      html += '</div>';
    }

    html += '<div class="server-footnote">' + ui.icono('info', 'icon-sm') + ' Detalhes completos no Diário de Saúde.</div>';
    el.innerHTML = html;
  } catch (error) {
    el.innerHTML = ui.erro(error.message);
  }
}

// ── Ações rápidas ──────────────────────────────────────────────
function mostrarResultado(texto, tipo) {
  ui.resultado(tipo, texto);
}

function desabilitarBotoes(desabilitar) {
  document.querySelectorAll('.action-btn').forEach(function (b) {
    b.disabled = desabilitar;
  });
}

function acaoDiario() {
  desabilitarBotoes(true);
  mostrarResultado(ui.icono('activity') + ' Enviando diário de saúde...', 'loading');
  fetch('/api/acao/diario').then(function (r) { return r.json(); }).then(function (d) {
    desabilitarBotoes(false);
    if (d.ok) {
      var msg = ui.icono('check') + ' Diário enviado ao Telegram!';
      if (d.warnings) msg += ' ' + ui.icono('warn') + ' Com alertas';
      if (d.output) {
        // Extrair resumo do relatório
        var pass = d.output.match(/PASS\s*:\s*(\d+)/);
        var fail = d.output.match(/FAIL\s*:\s*(\d+)/);
        if (pass || fail) msg += '<br><span class="dim">' + (pass ? 'PASS: ' + pass[1] : '') + (fail && fail[1] > 0 ? ' · FAIL: ' + fail[1] : '') + '</span>';
      }
      mostrarResultado(msg, 'ok');
    } else {
      mostrarResultado(ui.icono('cross') + ' ' + ui.escapeHtml(d.error || 'falha'), 'erro');
    }
  }).catch(function (e) {
    desabilitarBotoes(false);
    mostrarResultado(ui.icono('cross') + ' ' + ui.escapeHtml(e.message), 'erro');
  });
}

function acaoRevisar() {
  desabilitarBotoes(true);
  mostrarResultado(ui.icono('refresh') + ' Disparando code review...', 'loading');
  fetch('/api/acao/revisar').then(function (r) { return r.json(); }).then(function (d) {
    desabilitarBotoes(false);
    mostrarResultado(d.ok ? ui.icono('check') + ' Code review enviado ao Telegram!' : ui.icono('cross') + ' ' + ui.escapeHtml(d.error || 'falha'), d.ok ? 'ok' : 'erro');
  }).catch(function (e) {
    desabilitarBotoes(false);
    mostrarResultado(ui.icono('cross') + ' ' + ui.escapeHtml(e.message), 'erro');
  });
}

function acaoDormir() {
  if (!confirm('Deseja suspender o homeserver? Ele acorda às 08:00.')) return;
  desabilitarBotoes(true);
  mostrarResultado(ui.icono('sleep') + ' Suspending servidor...', 'loading');
  fetch('/api/acao/dormir').then(function (r) { return r.json(); }).then(function (d) {
    desabilitarBotoes(false);
    mostrarResultado(d.ok ? ui.icono('sleep') + ' Servidor suspenso! (acorda 08:00)' : ui.icono('cross') + ' ' + ui.escapeHtml(d.error || 'falha'), d.ok ? 'ok' : 'erro');
  }).catch(function (e) {
    desabilitarBotoes(false);
    mostrarResultado(ui.icono('cross') + ' ' + ui.escapeHtml(e.message), 'erro');
  });
}

function acaoAcordar() {
  desabilitarBotoes(true);
  mostrarResultado(ui.icono('wake') + ' Enviando magic packet WOL...', 'loading');
  fetch('/api/acao/acordar').then(function (r) { return r.json(); }).then(function (d) {
    desabilitarBotoes(false);
    if (d.ok && d.ja_acordado) {
      mostrarResultado(ui.icono('check') + ' Servidor já está acordado!', 'ok');
    } else if (d.ok) {
      mostrarResultado(ui.icono('wake') + ' Magic packet enviado! Aguardando o servidor acordar (~1min)...', 'ok');
    } else {
      mostrarResultado(ui.icono('cross') + ' ' + ui.escapeHtml(d.error || 'falha'), 'erro');
    }
  }).catch(function (e) {
    desabilitarBotoes(false);
    mostrarResultado(ui.icono('cross') + ' ' + ui.escapeHtml(e.message), 'erro');
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
      ? ui.icono('check', 'icon-sm') + ' API server conectado (' + resStatus.cota.modelos + ' modelos)'
      : ui.icono('cross', 'icon-sm') + ' API server indisponível';
    const host = resStatus.app || '?';

    el.innerHTML =
      '<div><b>Backend:</b> ' + (resHealth.backend || '?') + ' <span class="dim">(roda em: ' + host + ')</span></div>' +
      '<div><b>Hermes API server:</b> ' + (resHealth.hermes || '?') + '</div>' +
      '<div><b>Status:</b> ' + statusHermes + '</div>' +
      '<div class="cfg-hint" style="margin-top:8px">' + ui.icono('info', 'icon-sm') + ' Valores vêm do <code>.env</code> do servidor. ' +
      'Para mudar, edite o <code>.env</code> e reinicie o serviço.</div>';
  } catch (e) {
    el.innerHTML = ui.icono('cross', 'icon-sm') + ' ' + ui.escapeHtml(e.message);
  }
}

// ── Home: saudação e resumo ─────────────────────────────────────
function saudacaoHome() {
  const el = document.getElementById('home-hello');
  if (!el) return;
  const h = new Date().getHours();
  let saudacao;
  if (h < 6) saudacao = 'Boa madrugada, João.';
  else if (h < 12) saudacao = 'Bom dia, João.';
  else if (h < 18) saudacao = 'Boa tarde, João.';
  else saudacao = 'Boa noite, João.';
  el.textContent = saudacao;
}

function atualizarResumoHome(data, resDetalhes) {
  // Nodes online
  const elNodes = document.getElementById('summary-nodes');
  if (elNodes) {
    var online = 0;
    if (data.notebook && !data.notebook.erro && !data.notebook.offline) online++;
    if (data.servidor && !data.servidor.erro && !data.servidor.offline) online++;
    elNodes.textContent = online + ' node' + (online !== 1 ? 's' : '') + ' online';
  }

  // Provedores IA
  const elProv = document.getElementById('summary-providers');
  if (elProv) {
    var n = (data.cota && data.cota.modelos) ? data.cota.modelos : 1;
    elProv.textContent = n + ' provedor' + (n !== 1 ? 'es' : '') + ' de IA disponível' + (n !== 1 ? 'is' : '');
  }

  atualizarConexoes();
}

// ── Home: conexões (Telegram, Discord, WhatsApp) ────────────────
function atualizarConexoes() {
  const el = document.getElementById('home-connections-body');
  if (!el) return;
  var chips = [
    { nome: 'Telegram', ativa: true },
    { nome: 'Discord', ativa: false },
    { nome: 'WhatsApp', ativa: false }
  ];
  el.innerHTML = chips.map(function (c) {
    return '<span class="conn-chip ' + (c.ativa ? 'ativa' : 'inativa') + '">' +
      (c.ativa ? ui.icono('check', 'icon-sm') : ui.icono('cross', 'icon-sm')) +
      ' ' + c.nome + '</span>';
  }).join('');
}