// ── Hermes Remote — Componentes de UI ─────────────────────────
// Funções puras que retornam HTML (componentes visuais reutilizáveis).
// Carregado ANTES dos arquivos de tela (app.js, dashboard.js...).
// Padrão: ui.<componente>(args) → string HTML pronta para innerHTML.

const ui = (function () {
  'use strict';

  // ── Helpers ──────────────────────────────────────────────────
  function escapeHtml(text) {
    return (text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ── Ícone SVG (sprite inline no index.html) ──────────────────
  // Uso: ui.icono('home') ou ui.icono('home', 'icon-sm')
  function icono(name, cls) {
    return '<svg class="' + (cls || 'icon') + '"><use href="#icon-' + name + '"/></use></svg>';
  }

  // ── Estados (loading / vazio / offline / erro) ────────────────
  function loading(msg) {
    return '<div class="server-loading">' + (msg || 'Carregando...') + '</div>';
  }

  function vazio(msg) {
    return '<div class="empty">' + msg + '</div>';
  }

  function offline(titulo, detalhe) {
    return '<div class="server-offline"><b>' + titulo + '</b>' +
      (detalhe ? '<br>' + escapeHtml(detalhe) : '') + '</div>';
  }

  function erro(msg) {
    return offline(icono('cross') + ' Erro', msg);
  }

  // ── Cards e métricas ─────────────────────────────────────────
  function statCard(icone, rotulo, valor) {
    return '<div class="stat-card">' +
      '<div class="stat-icon">' + icone + '</div>' +
      '<div class="stat-label">' + rotulo + '</div>' +
      '<div class="stat-value">' + (valor || '?') + '</div>' +
      '</div>';
  }

  // ── Badges / chips ───────────────────────────────────────────
  function containerChip(container) {
    const cls = container.rodando ? (container.healthy ? 'ok' : 'warn') : 'down';
    const icone = container.rodando ? (container.healthy ? icono('check', 'icon-sm') : icono('warn', 'icon-sm')) : icono('cross', 'icon-sm');
    const label = container.rodando ? (container.status || 'rodando') : 'parado';
    return '<div class="container-chip ' + cls + '">' + icone +
      ' <b>' + escapeHtml(container.nome) + '</b> <span class="dim">' + label + '</span></div>';
  }

  function temperatura(temp, onVerDiario) {
    if (!temp) return '';
    const alta = temp >= 80;
    let html = '<div class="server-temp ' + (alta ? 'alta' : 'ok') + '">' +
      icono('temp') + ' <b>Temperatura: ' + temp + '°C</b> ' + (alta ? icono('warn', 'icon-sm') + ' alta' : icono('check', 'icon-sm') + ' ok');
    if (alta && onVerDiario) html += ' ' + onVerDiario;
    html += '</div>';
    return html;
  }

  // ── Ações (resultado) ────────────────────────────────────────
  function resultado(tipo, texto) {
    const el = document.getElementById('acao-resultado');
    if (!el) return;
    el.innerHTML = texto;
    el.classList.remove('hidden');
    el.classList.remove('ok', 'erro', 'loading');
    if (tipo) el.classList.add(tipo);
  }

  // ── Histórico ────────────────────────────────────────────────
  function historicoLinha(a) {
    const icone = a.ok ? icono('check', 'icon-sm') : icono('cross', 'icon-sm');
    const quando = new Date(a.quando).toLocaleString('pt-BR',
      { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    let linha = icone + ' <b>' + a.acao + '</b> · ' + quando +
      (a.detalhe ? ' <span class="dim">— ' + a.detalhe + '</span>' : '');
    if (a.output) {
      const id = 'out-' + a.quando.replace(/[^0-9]/g, '').slice(0, 12);
      linha += ' <button class="hist-btn" data-toggle-det="' + id + '">' + icono('activity', 'icon-sm') + '</button>';
      linha += '<div id="' + id + '" class="hist-det"><pre>' + escapeHtml(a.output) + '</pre></div>';
    }
    return linha;
  }

  // ── Expor API pública ────────────────────────────────────────
  return {
    escapeHtml: escapeHtml,
    icono: icono,
    loading: loading,
    vazio: vazio,
    offline: offline,
    erro: erro,
    statCard: statCard,
    containerChip: containerChip,
    temperatura: temperatura,
    resultado: resultado,
    historicoLinha: historicoLinha
  };
})();
