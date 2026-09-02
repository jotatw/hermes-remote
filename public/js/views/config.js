// ── Hermes Remote — View: Configurações (v2) ───────────────────
// Renderiza a view Config conforme mockup aprovado.
// Usa store (estado), api (dados), router (navegação).
// Convenção: exporta ConfigView com render(container), destroy(), refresh().

window.ConfigView = (function () {
  'use strict';

  var _container = null;
  var _unsubs = [];
  var _timeout = null;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── Template ──────────────────────────────────────────────────
  function template() {
    return '' +
      '<div class="cfg-overview" id="cfgOverview">' +
      '  <div class="cfg-overview-item"><div class="num" id="cfgNumModelos">-</div><div class="lbl">Modelos</div></div>' +
      '  <div class="cfg-overview-item"><div class="num" id="cfgNumNodes">-</div><div class="lbl">Nodes</div></div>' +
      '  <div class="cfg-overview-item"><div class="num" id="cfgUptime">-</div><div class="lbl">Uptime</div></div>' +
      '</div>' +
      '<div class="cfg-section-title">Conexão</div>' +
      '<div class="cfg-card" id="cfgConexao">' +
      '  <div class="cfg-row"><div class="label">Backend</div><div class="value dim">Carregando...</div></div>' +
      '  <div class="cfg-row"><div class="label">Hermes API</div><div class="value dim">Carregando...</div></div>' +
      '  <div class="cfg-row"><div class="label">Status</div><div class="value dim">Carregando...</div></div>' +
      '</div>' +
      '<div class="cfg-section-title">Servidor</div>' +
      '<div class="cfg-card" id="cfgServidor">' +
      '  <div class="cfg-row"><div class="label">Host</div><div class="value dim">Carregando...</div></div>' +
      '  <div class="cfg-row"><div class="label">Versão</div><div class="value">v1.0.0</div></div>' +
      '  <div class="cfg-row"><div class="label">Uptime</div><div class="value dim">Carregando...</div></div>' +
      '</div>' +
      '<div class="cfg-section-title">Configuração</div>' +
      '<div class="cfg-hint">' +
      'A configuração do servidor é feita no arquivo <code>.env</code> na máquina que roda o Hermes Remote.<br><br>' +
      'Variáveis: <code>HERMES_URL</code>, <code>HERMES_API_KEY</code>, <code>HOMESERVER_*</code>, <code>HS_*_CMD</code>.<br><br>' +
      'Edite o <code>.env</code> e reinicie o serviço para aplicar mudanças.' +
      '</div>';
  }

  // ── Render ────────────────────────────────────────────────────
  function render(container) {
    _container = container;
    container.innerHTML = template();
    carregarDados();
  }

  function destroy() {
    _unsubs.forEach(function (fn) { fn(); });
    _unsubs = [];
    _container = null;
    if (_timeout) { clearTimeout(_timeout); _timeout = null; }
  }

  function refresh() {
    carregarDados();
  }

  // ── Dados ─────────────────────────────────────────────────────
  function carregarDados() {
    // Busca health, status e modelos em paralelo
    var pHealth = api.get('/api/health').catch(function () { return null; });
    var pStatus = api.get('/api/status').catch(function () { return null; });
    var pModels = api.get('/api/models').catch(function () { return null; });

    Promise.all([pHealth, pStatus, pModels]).then(function (results) {
      atualizarConexao(results[0], results[1]);
      atualizarServidor(results[1], results[0]);
      atualizarOverview(results[1], results[2]);
    }).catch(function () {
      // Fallback: mostra "indisponível" nos campos
    });
  }

  function atualizarOverview(status, models) {
    var elNum = document.getElementById('cfgNumModelos');
    if (elNum) {
      var qtd = (status && status.cota && status.cota.modelos) || 0;
      elNum.textContent = qtd || 0;
    }

    var elNodes = document.getElementById('cfgNumNodes');
    if (elNodes) {
      var online = 0;
      if (status && status.notebook && !status.notebook.erro && !status.notebook.offline) online++;
      if (status && status.servidor && !status.servidor.erro && !status.servidor.offline) online++;
      elNodes.textContent = online;
    }

    var elUp = document.getElementById('cfgUptime');
    if (elUp) {
      var uptime = (status && status.servidor && status.servidor.uptime) || (status && status.notebook && status.notebook.uptime) || '?';
      // Extrai o primeiro número (ex: "1 week, 3 days" → "1sem")
      var match = String(uptime).match(/(\d+)\s*(\w)/);
      if (match) {
        var num = match[1];
        var unid = match[2] === 'w' ? 'sem' : (match[2] === 'd' ? 'd' : match[2]);
        elUp.textContent = num + unid;
      } else {
        elUp.textContent = uptime;
      }
    }
  }

  function atualizarConexao(health, status) {
    // Backend
    var elBackend = document.querySelector('#cfgConexao .cfg-row:nth-child(1) .value');
    if (elBackend && health && health.backend) {
      elBackend.textContent = health.backend;
      elBackend.classList.remove('dim');
    }

    // Hermes API URL
    var elApi = document.querySelector('#cfgConexao .cfg-row:nth-child(2) .value');
    if (elApi && health && health.hermes) {
      elApi.innerHTML = esc(health.hermes) + ' <span class="ok">&#10003;</span>';
      elApi.classList.remove('dim');
    }

    // Status
    var elStatus = document.querySelector('#cfgConexao .cfg-row:nth-child(3) .value');
    if (elStatus) {
      var modelos = (status && status.cota && status.cota.modelos) || 0;
      if (modelos > 0) {
        elStatus.innerHTML = '<span class="ok">&#10003;</span> API server conectado (' + modelos + ' modelos)';
      } else {
        elStatus.innerHTML = '<span class="warn">&#9888;</span> API server indisponível';
      }
      elStatus.classList.remove('dim');
    }
  }

  function atualizarServidor(status, health) {
    // Host
    var elHost = document.querySelector('#cfgServidor .cfg-row:nth-child(1) .value');
    if (elHost) {
      elHost.textContent = (status && status.app) || '?';
      elHost.classList.remove('dim');
    }

    // Uptime
    var elUp = document.querySelector('#cfgServidor .cfg-row:nth-child(3) .value');
    if (elUp && status && status.servidor && status.servidor.uptime) {
      elUp.textContent = status.servidor.uptime;
      elUp.classList.remove('dim');
    }
  }

  // ── API pública ───────────────────────────────────────────────
  return {
    render: render,
    destroy: destroy,
    refresh: refresh,
  };

})();