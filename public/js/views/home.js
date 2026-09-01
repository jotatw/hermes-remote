// ── Hermes Remote — View: Home (v2) ────────────────────────────
// Renderiza a view Início conforme mockup aprovado (mobile + desktop).
// Usa store (estado), api (dados), router (navegação).
// Convenção: exporta HomeView com render(container) e destroy().

window.HomeView = (function () {
  'use strict';

  var _container = null;
  var _unsubs = [];

  // ── Helpers de ícone (SVG inline — sprite será integrado depois) ──
  function icon(name, cls) {
    var c = cls || 'icon';
    var paths = {
      doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
      check: '<path d="M20 6 9 17l-5-5"/>',
      refresh: '<path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.5 9a9 9 0 0 1 14.8-3.4L23 10M1 14l4.7 4.4A9 9 0 0 0 20.5 15"/>',
      send: '<path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/>',
      moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
      sun: '<path d="M18.4 12.7a7 7 0 1 1-6.3-6.6 5 5 0 0 0 6.3 6.6z"/>',
      clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>',
      node: '<rect x="2" y="2" width="8" height="8" rx="2"/><rect x="14" y="2" width="8" height="8" rx="2"/><rect x="8" y="14" width="8" height="8" rx="2"/>',
      link: '<path d="M18 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/><path d="M10 16a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/><path d="M8 17 16 9"/>',
      bolt: '<path d="M13 2 3 14h8l-1 8 11-13h-8l1-7z"/>',
      home: '<path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z"/>',
      chat: '<path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.8-.9L3 21l2-5.2A8.4 8.4 0 1 1 21 11.5z"/>',
      server: '<rect x="2" y="4" width="20" height="14" rx="2"/><path d="M8 21h8M12 18v3"/>',
      config: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h.1a1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.5 1h.1a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    };
    return '<svg class="' + c + '" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      (paths[name] || paths.doc) + '</svg>';
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── Template da Home ──────────────────────────────────────────
  function template() {
    return '' +
      '<div class="home-greeting">' +
      '  <span class="home-hello" id="homeHello">Olá.</span>' +
      '  <span class="home-sub" id="homeSub">Conectando...</span>' +
      '</div>' +
      '<div class="home-summary" id="homeSummary" aria-live="polite">' +
      '  <span class="dim">Carregando resumo...</span>' +
      '</div>' +
      '<div class="home-ask">' +
      '  <input class="home-ask-input" id="homeAskInput" type="text" placeholder="Ask Hermes..." maxlength="200" autocomplete="off" aria-label="Perguntar ao Hermes">' +
      '  <button class="home-ask-btn" data-action="ask-hermes" title="Perguntar">' + icon('send', 'icon') + '</button>' +
      '</div>' +
      '<div class="home-section-title">' + icon('node', 'icon-sm') + 'Nodes</div>' +
      '<div class="home-nodes" id="homeNodes">' +
      '  <div class="node-card"><div class="node-name"><span class="dot off"></span>Notebook</div><div class="node-metric dim">Carregando...</div></div>' +
      '  <div class="node-card"><div class="node-name"><span class="dot off"></span>Servidor</div><div class="node-metric dim">Carregando...</div></div>' +
      '  <div class="node-card"><div class="node-name"><span class="dot off"></span>Cota IA</div><div class="node-metric dim">Carregando...</div></div>' +
      '</div>' +
      '<div class="home-section-title home-conn">' + icon('link', 'icon-sm') + 'Conexões</div>' +
      '<div class="conn-chips" id="homeConns">' +
      '  <span class="conn-chip inativa"><span class="cd"></span>Telegram</span>' +
      '  <span class="conn-chip inativa"><span class="cd"></span>Discord</span>' +
      '  <span class="conn-chip inativa"><span class="cd"></span>WhatsApp</span>' +
      '</div>' +
      '<div class="home-section-title">' + icon('refresh', 'icon-sm') + 'Atividade recente</div>' +
      '<div class="home-activity" id="homeActivity">' +
      '  <span class="dim">Carregando...</span>' +
      '</div>' +
      '<div class="home-section-title">' + icon('bolt', 'icon-sm') + 'Ações rápidas</div>' +
      '<div class="home-actions">' +
      '  <div class="actions-grid">' +
      '    <button class="action-btn" data-action="diario"><span class="a-icon">' + icon('doc', 'icon') + '</span>Diário</button>' +
      '    <button class="action-btn" data-action="revisar"><span class="a-icon neutral">' + icon('check', 'icon') + '</span>Code Review</button>' +
      '    <button class="action-btn" data-action="dormir"><span class="a-icon neutral">' + icon('moon', 'icon') + '</span>Dormir</button>' +
      '    <button class="action-btn" data-action="acordar"><span class="a-icon">' + icon('sun', 'icon') + '</span>Acordar</button>' +
      '  </div>' +
      '</div>' +
      '<div class="acao-resultado oculto" id="acaoResultado" role="status"></div>' +
      '<div class="home-agenda" id="homeAgenda">' +
      '  <div class="a-icon">' + icon('clock', 'icon') + '</div>' +
      '  <div class="a-text"><div class="t">Energia programada</div><div class="d dim">Carregando...</div></div>' +
      '</div>';
  }

  // ── Saudação dinâmica ─────────────────────────────────────────
  function saudacao() {
    var h = new Date().getHours();
    if (h < 6) return 'Boa madrugada.';
    if (h < 12) return 'Bom dia.';
    if (h < 18) return 'Boa tarde.';
    return 'Boa noite.';
  }

  // ── Render ────────────────────────────────────────────────────
  function render(container) {
    _container = container;
    container.innerHTML = template();

    // Saudação
    var hello = document.getElementById('homeHello');
    if (hello) hello.textContent = saudacao();
    var sub = document.getElementById('homeSub');
    if (sub) sub.textContent = 'Hermes está pronto.';

    carregarStatus();
    carregarAcoes();
    carregarPower();
    bindAsk();
    bindActions();

    // Re-renderizar saudação quando a view voltar ao foco
    _unsubs.push(store.on('rota', function (rota) {
      if (rota === '/home') {
        var h2 = document.getElementById('homeHello');
        if (h2) h2.textContent = saudacao();
      }
    }));
  }

  function destroy() {
    _unsubs.forEach(function (unsub) { unsub(); });
    _unsubs = [];
    _container = null;
  }

  // ── Dados: status (nodes + resumo + conexões) ────────────────
  function carregarStatus() {
    api.get('/api/status').then(function (data) {
      atualizarResumo(data);
      atualizarNodes(data);
      atualizarConexoes(data);
    }).catch(function (err) {
      var resumo = document.getElementById('homeSummary');
      if (resumo) resumo.innerHTML = '<span class="summary-line">' + icon('node', 'icon-sm') + ' Indisponível: ' + esc(err.error || err.message) + '</span>';
    });
  }

  function atualizarResumo(data) {
    var el = document.getElementById('homeSummary');
    if (!el) return;

    var online = 0;
    if (data.notebook && !data.notebook.erro && !data.notebook.offline) online++;
    if (data.servidor && !data.servidor.erro && !data.servidor.offline) online++;

    var prov = (data.cota && data.cota.modelos) ? data.cota.modelos : 0;
    var provText = prov + ' provedor' + (prov !== 1 ? 'es' : '') + ' de IA';
    var conn = (data.conexoes && Array.isArray(data.conexoes))
      ? data.conexoes.filter(function (c) { return c.ativa; }).length
      : 1;

    el.innerHTML =
      '<span class="summary-line">' + icon('node', 'icon-sm') + ' <b>' + online + '</b> ' + (online !== 1 ? 'nodes' : 'node') + ' online</span>' +
      '<span class="summary-sep">·</span>' +
      '<span class="summary-line">' + icon('link', 'icon-sm') + ' <b>' + conn + '</b> conexão ativa</span>' +
      '<span class="summary-sep">·</span>' +
      '<span class="summary-line">' + icon('bolt', 'icon-sm') + ' ' + provText + '</span>';
  }

  function atualizarNodes(data) {
    var el = document.getElementById('homeNodes');
    if (!el) return;

    function cardNode(nome, n) {
      var dot = 'off', conteudo = '';
      if (!n) { conteudo = '<div class="node-erro">sem dados</div>'; }
      else if (n.erro) { dot = 'warn'; conteudo = '<div class="node-erro">' + esc(n.erro) + '</div>'; }
      else if (n.offline) { dot = 'off'; conteudo = '<div class="node-erro">offline</div>'; }
      else {
        dot = 'on';
        var linhas = [];
        if (n.uptime) linhas.push('<div class="node-metric"><b>' + esc(n.uptime) + '</b> de uptime</div>');
        if (n.ram) linhas.push('<div class="node-metric"><b>' + esc(n.ram) + '</b> RAM</div>');
        if (n.disco) linhas.push('<div class="node-metric"><b>' + esc(n.disco) + '</b> disco</div>');
        conteudo = linhas.join('') || '<div class="node-metric dim">ok</div>';
      }
      return '<div class="node-card">' +
        '<div class="node-name"><span class="dot ' + dot + '"></span>' + esc(nome) + '</div>' +
        conteudo + '</div>';
    }

    el.innerHTML =
      cardNode('Notebook', data.notebook) +
      cardNode('Servidor', data.servidor) +
      cardNode('Cota IA', { modelos: (data.cota && data.cota.modelos) || 0, uptime: null, ram: null, disco: null });
  }

  function atualizarConexoes(data) {
    var el = document.getElementById('homeConns');
    if (!el) return;
    var conns = (data.conexoes && Array.isArray(data.conexoes))
      ? data.conexoes
      : [
        { nome: 'Telegram', ativa: true },
        { nome: 'Discord', ativa: false },
        { nome: 'WhatsApp', ativa: false },
      ];
    el.innerHTML = conns.map(function (c) {
      return '<span class="conn-chip ' + (c.ativa ? 'ativa' : 'inativa') + '"><span class="cd"></span>' + esc(c.nome) + '</span>';
    }).join('');
  }

  // ── Dados: atividade recente ──────────────────────────────────
  function carregarAcoes() {
    api.get('/api/acoes').then(function (data) {
      var lista = (data && data.acoes) || [];
      var el = document.getElementById('homeActivity');
      if (!el) return;
      if (!lista.length) {
        el.innerHTML = '<div class="home-empty">Nenhuma ação registrada ainda.</div>';
        return;
      }
      el.innerHTML = lista.slice(0, 5).map(function (a) {
        var cls = a.ok ? 'ok' : 'fail';
        var icone = a.ok ? 'check' : 'doc';
        var quando = a.quando ? new Date(a.quando) : null;
        var hora = quando ? quando.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';
        return '<div class="activity-item">' +
          '<div class="a-icon ' + cls + '">' + icon(icone, 'icon') + '</div>' +
          '<div class="a-text"><div class="t">' + esc(a.acao || 'ação') + '</div>' +
          '<div class="d">' + esc(a.detalhe || '') + '</div></div>' +
          '<div class="a-time">' + esc(hora) + '</div>' +
          '</div>';
      }).join('');
    }).catch(function () {
      var el = document.getElementById('homeActivity');
      if (el) el.innerHTML = '<div class="home-empty">Atividade indisponível.</div>';
    });
  }

  // ── Dados: agenda de energia ──────────────────────────────────
  function carregarPower() {
    api.get('/api/power').then(function (data) {
      var el = document.getElementById('homeAgenda');
      if (!el) return;
      var t = el.querySelector('.t');
      var d = el.querySelector('.d');
      if (data && data.dorme && data.acorda) {
        if (t) t.textContent = 'Energia programada';
        if (d) d.textContent = 'Dorme às ' + data.dorme + ' · Acorda às ' + data.acorda;
      } else {
        if (d) d.textContent = 'Agenda indisponível';
      }
    }).catch(function () {
      var el = document.getElementById('homeAgenda');
      if (el) {
        var d = el.querySelector('.d');
        if (d) d.textContent = 'Agenda indisponível';
      }
    });
  }

  // ── Ask Hermes ────────────────────────────────────────────────
  function bindAsk() {
    var input = document.getElementById('homeAskInput');
    if (!input) return;
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') enviarAsk();
    });
    var btn = _container.querySelector('[data-action="ask-hermes"]');
    if (btn) btn.addEventListener('click', enviarAsk);
  }

  function enviarAsk() {
    var input = document.getElementById('homeAskInput');
    if (!input || !input.value.trim()) return;
    store.set('draftMensagem', input.value.trim());
    input.value = '';
    if (window.router) router.go('/chat');
  }

  // ── Ações rápidas ─────────────────────────────────────────────
  function bindActions() {
    var grid = _container.querySelector('.actions-grid');
    if (!grid) return;
    grid.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-action]');
      if (!btn) return;
      var acao = btn.dataset.action;
      executarAcao(acao, btn);
    });
  }

  var ACOES = {
    diario: { url: '/api/acao/diario', label: 'Diário' },
    revisar: { url: '/api/acao/revisar', label: 'Code Review' },
    dormir: { url: '/api/acao/dormir', label: 'Dormir' },
    acordar: { url: '/api/acao/acordar', label: 'Acordar' },
  };

  function executarAcao(acao, btn) {
    var conf = ACOES[acao];
    if (!conf) return;

    if (acao === 'dormir') {
      if (!window.confirm('Deseja suspender o homeserver? Ele acorda às 08:00.')) return;
    }

    var original = btn.innerHTML;
    btn.disabled = true;
    mostrarResultado('Executando ' + conf.label + '...', false);

    api.post(conf.url, {}).then(function (d) {
      var ok = !(d && d.error);
      mostrarResultado(
        d && d.message ? d.message : (ok ? conf.label + ' concluído' : (d.error || 'Falhou')),
        !ok
      );
      // Atualiza atividades após ação
      carregarAcoes();
    }).catch(function (err) {
      mostrarResultado('Erro: ' + (err.error || err.message || 'falhou'), true);
    }).finally(function () {
      btn.disabled = false;
      btn.innerHTML = original;
    });
  }

  function mostrarResultado(texto, erro) {
    var el = document.getElementById('acaoResultado');
    if (!el) return;
    el.textContent = texto;
    el.className = 'acao-resultado' + (erro ? ' erro' : '');
  }

  // ── API pública ───────────────────────────────────────────────
  return {
    render: render,
    destroy: destroy,
    _test: { icon: icon, esc: esc, saudacao: saudacao },
  };

})();