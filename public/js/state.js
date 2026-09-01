// ── Hermes Remote — Estado Centralizado ────────────────────────
// Objeto app.state único para toda a aplicação.
// Carregado DEPOIS de components.js, ANTES dos demais JS.
// Backward compat: `dados` global aponta para app.state durante migração.

window.app = window.app || {};
(function () {
  'use strict';

  const STORAGE_KEY = 'chatWebData';

  // ── Estado inicial ───────────────────────────────────────────
  app.state = {
    // Conversas (persistido em localStorage)
    conversas: [],
    conversaAtivaId: null,
    contextoGlobal: '',

    // Estado da sessão (não persiste na conversa)
    conversando: false,
    modeloSelecionado: '',
    abortController: null,

    // Tema (persiste separado)
    tema: localStorage.getItem('chatWebTheme') || '',
  };

  // ── Persistência ─────────────────────────────────────────────
  app.carregarEstado = function () {
    try {
      const salvo = localStorage.getItem(STORAGE_KEY);
      if (salvo) {
        const parsed = JSON.parse(salvo);
        app.state.conversas = parsed.conversas || [];
        app.state.conversaAtivaId = parsed.conversaAtivaId || null;
        app.state.contextoGlobal = parsed.contextoGlobal || '';
      }
    } catch (e) {
      console.error('Erro ao carregar estado:', e);
    }
  };

  app.salvarEstado = function () {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        conversas: app.state.conversas,
        conversaAtivaId: app.state.conversaAtivaId,
        contextoGlobal: app.state.contextoGlobal,
      }));
    } catch (e) {
      console.error('Erro ao salvar estado:', e);
    }
  };

  app.gerarId = function () {
    return 'c' + Date.now() + Math.floor(Math.random() * 1000);
  };

  // ── Helpers de conversa ──────────────────────────────────────
  app.getConversaAtiva = function () {
    return app.state.conversas.find(function (c) { return c.id === app.state.conversaAtivaId; });
  };

  app.getConversaPorId = function (id) {
    return app.state.conversas.find(function (c) { return c.id === id; });
  };

  // ── Sincronizar estado global ─────────────────────────────────
  // app.js usa variáveis locais (conversando, modeloSelecionado, abortController)
  // que começam com app.state. Esta função sincroniza mudanças de volta.
  app.syncState = function () {
    app.state.conversando = window.conversando;
    app.state.modeloSelecionado = window.modeloSelecionado;
    app.state.abortController = window.abortController || null;
  };

  // ── Backward compatibility (migração gradual) ────────────────
  // As funções antigas (sidebar.js, app.js) usam `dados` global.
  // `dados` aponta para app.state até que todas sejam refatoradas.
  window.dados = app.state;

  // Carrega estado salvo na inicialização
  app.carregarEstado();

})();