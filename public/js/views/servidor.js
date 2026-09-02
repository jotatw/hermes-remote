// ── Hermes Remote — View: Servidor (v2) ────────────────────────
// Renderiza a view Servidor: stats, temperatura, containers,
// acesso rápido (links para serviços do homeserver) e energia.
// Usa store (estado), api (dados), router (navegação).

window.ServidorView = (function () {
  'use strict';

  var _container = null;
  var _unsubs = [];

  // Base dos atalhos — usa o host atual (tailnet) e paths do Caddy.
  // O Caddyfile expõe: /git (Gitea), /files (FileBrowser), /app (API),
  // /api/v1 (API do HomeServer), / (Homepage).
  function baseUrl() {
    return window.location.origin;
  }

  var ATALHOS = [
    { nome: 'Gitea', url: '/git/', icon: 'git' },
    { nome: 'Arquivos', url: '/files/', icon: 'files' },
    { nome: 'HomeServer App', url: '/app/', icon: 'app' },
    { nome: 'Homepage', url: '/', icon: 'home' },
  ];

  // ── Ícones inline SVG ─────────────────────────────────────────
  function icon(name, cls, size) {
    var c = cls || 'icon';
    var s = size || 16;
    var paths = {
      clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>',
      ram: '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="2" width="6" height="4"/><path d="M9 14h6M9 18h6"/>',
      disk: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>',
      activity: '<path d="M12 2v20M2 12h20"/>',
      temp: '<path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>',
      moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
      sun: '<path d="M18.4 12.7a7 7 0 1 1-6.3-6.6 5 5 0 0 0 6.3 6.6z"/>',
      refresh: '<path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.5 9a9 9 0 0 1 14.8-3.4L23 10M1 14l4.7 4.4A9 9 0 0 0 20.5 15"/>',
      external: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14 21 3"/>',
      git: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="12" r="3"/><path d="M8.5 8.5 15.5 10.5M8.5 15.5 15.5 13.5"/>',
      files: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
      app: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>',
      home: '<path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z"/>',
    };
    return '<svg class="' + c + '" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      (paths[name] || paths.home) + '</svg>';
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── Template ──────────────────────────────────────────────────
  function template() {
    return '' +
      '<div class="srv-stats" id="srvStats">' +
      '  <div class="srv-stat"><div class="stat-icon">' + icon('clock') + '</div><div class="stat-label">Uptime</div><div class="stat-value dim">-</div></div>' +
      '  <div class="srv-stat"><div class="stat-icon">' + icon('ram') + '</div><div class="stat-label">RAM</div><div class="stat-value dim">-</div></div>' +
      '  <div class="srv-stat"><div class="stat-icon">' + icon('disk') + '</div><div class="stat-label">Disco</div><div class="stat-value dim">-</div></div>' +
      '  <div class="srv-stat"><div class="stat-icon">' + icon('activity') + '</div><div class="stat-label">Load</div><div class="stat-value dim">-</div></div>' +
      '</div>' +
      '<div class="srv-temp" id="srvTemp"></div>' +
      '<div class="srv-section-title">Containers</div>' +
      '<div class="srv-containers" id="srvContainers"><span class="dim">Carregando...</span></div>' +
      '<div class="srv-section-title">Acesso rápido</div>' +
      '<div class="srv-links" id="srvLinks">' + linksHTML() + '</div>' +
      '<div class="srv-section-title">Energia</div>' +
      '<div class="srv-energy">' +
      '  <button class="action-btn" data-action="dormir"><span class="a-icon">' + icon('moon') + '</span>Dormir</button>' +
      '  <button class="action-btn" data-action="acordar"><span class="a-icon">' + icon('sun') + '</span>Acordar</button>' +
      '  <button class="action-btn" data-action="atualizar"><span class="a-icon">' + icon('refresh') + '</span>Atualizar</button>' +
      '</div>';
  }

  function linksHTML() {
    var base = baseUrl();
    return ATALHOS.map(function (l) {
      return '<a class="srv-link" href="' + base + l.url + '" target="_blank" rel="noopener">' +
        '<span class="l-icon">' + icon(l.icon) + '</span>' +
        '<span class="l-name">' + esc(l.nome) + '</span>' +
        '<span class="l-url dim">' + esc(l.url) + '</span>' +
        '<span class="l-external">' + icon('external', 'icon', 12) + '</span>' +
        '</a>';
    }).join('');
  }

  // ── Render ────────────────────────────────────────────────────
  function render(container) {
    _container = container;
    container.innerHTML = template();
    bindEnergy();
    carregarDados();
  }

  function destroy() {
    _unsubs.forEach(function (fn) { fn(); });
    _unsubs = [];
    _container = null;
  }

  function refresh() {
    carregarDados();
  }

  // ── Dados ─────────────────────────────────────────────────────
  function carregarDados() {
    var pStatus = api.get('/api/status').catch(function () { return null; });
    var pDetalhes = api.get('/api/servidor').catch(function () { return null; });

    Promise.all([pStatus, pDetalhes]).then(function (r) {
      atualizarStats(r[0]);
      atualizarTemp(r[1]);
      atualizarContainers(r[1]);
    });
  }

  function atualizarStats(status) {
    if (!status || !status.servidor) return;
    var s = status.servidor;
    var el = document.getElementById('srvStats');
    if (!el) return;

    var valores = el.querySelectorAll('.stat-value');
    if (valores[0]) valores[0].textContent = s.uptime || '?';
    if (valores[1]) valores[1].textContent = s.ram || '?';
    if (valores[2]) valores[2].textContent = s.disco || '?';
    if (valores[3]) valores[3].textContent = s.load || '?';
    valores.forEach(function (v) { v.classList.remove('dim'); });
  }

  function atualizarTemp(detalhes) {
    var el = document.getElementById('srvTemp');
    if (!el) return;
    var temp = detalhes && detalhes.temperatura;
    if (!temp) {
      el.innerHTML = '';
      return;
    }
    var alta = temp >= 80;
    el.innerHTML =
      '<div class="temp-icon">' + icon('temp') + '</div>' +
      '<div class="temp-text"><div class="t">Temperatura</div><div class="d">Sensor do homeserver</div></div>' +
      '<div class="temp-badge ' + (alta ? 'alta' : 'ok') + '">' + temp + '°C · ' + (alta ? 'alta' : 'ok') + '</div>';
  }

  function atualizarContainers(detalhes) {
    var el = document.getElementById('srvContainers');
    if (!el) return;
    var containers = (detalhes && detalhes.containers) || [];
    if (!containers.length) {
      el.innerHTML = '<span class="dim">Nenhum container detectado</span>';
      return;
    }
    el.innerHTML = containers.map(function (c) {
      var dot = c.rodando ? (c.healthy ? 'ok' : 'warn') : 'down';
      return '<div class="srv-container">' +
        '<span class="c-dot ' + dot + '"></span>' +
        '<span class="c-name">' + esc(c.nome) + '</span>' +
        '<span class="c-status">' + esc(c.status || (c.rodando ? 'rodando' : 'parado')) + '</span>' +
        '</div>';
    }).join('');
  }

  // ── Energia ───────────────────────────────────────────────────
  function bindEnergy() {
    var el = _container.querySelector('.srv-energy');
    if (!el) return;
    el.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-action]');
      if (!btn) return;
      var acao = btn.dataset.action;

      if (acao === 'dormir') {
        if (!window.confirm('Deseja suspender o homeserver? Ele acorda às 08:00.')) return;
      }

      var urls = {
        dormir: '/api/acao/dormir',
        acordar: '/api/acao/acordar',
        atualizar: null,
      };
      if (acao === 'atualizar') {
        carregarDados();
        return;
      }

      var original = btn.innerHTML;
      btn.disabled = true;
      api.post(urls[acao], {}).then(function (d) {
        if (d && d.message) {
          alert(d.message);
        }
        carregarDados();
      }).catch(function (err) {
        alert('Erro: ' + (err.error || err.message || 'falhou'));
      }).finally(function () {
        btn.disabled = false;
        btn.innerHTML = original;
      });
    });
  }

  // ── API pública ───────────────────────────────────────────────
  return {
    render: render,
    destroy: destroy,
    refresh: refresh,
  };

})();