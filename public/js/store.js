// ── Hermes Remote — Store (Pub/Sub + Persistência) ─────────────
// Substitui state.js v1. Mantém compatibilidade com app.state,
// app.salvarEstado(), app.getConversaAtiva(), window.dados.
// Carregado ANTES de components.js, ANTES dos demais JS.

window.app = window.app || {};
(function () {
  'use strict';

  var STORAGE_KEY = 'chatWebData';
  var SAVE_DEBOUNCE_MS = 300;

  // ── Estado interno ───────────────────────────────────────────
  // Valores padrão — nunca acessar _state diretamente fora deste módulo.
  var _state = {
    conversas: [],
    conversaAtivaId: null,
    contextoGlobal: '',
    conversando: false,
    modeloSelecionado: '',
    abortController: null,
    tema: localStorage.getItem('chatWebTheme') || 'dark',
  };

  var _listeners = {};    // { chave: [fn, fn, ...] }
  var _persistedKeys = [  // Chaves que persistem automaticamente em localStorage
    'conversas',
    'conversaAtivaId',
    'contextoGlobal',
  ];
  var _saveTimer = null;

  // ── Notificar assinantes ─────────────────────────────────────
  // Dispara todos os listeners registrados para uma chave.
  // Falhas individuais não quebram os demais listeners.
  function _emit(key, value) {
    var fns = _listeners[key];
    if (!fns) return;
    // Copia o array: listeners podem se remover durante a iteração
    [].concat(fns).forEach(function (fn) {
      try { fn(value, key); } catch (e) {
        console.error('store: erro no listener de "' + key + '"', e);
      }
    });
  }

  // ── Persistência (debounced) ─────────────────────────────────
  // Acumula múltiplas escritas e salva uma vez após SAVE_DEBOUNCE_MS.
  // Apenas as chaves em _persistedKeys são salvas.
  function _save() {
    if (_saveTimer) clearTimeout(_saveTimer);
    _saveTimer = setTimeout(function () {
      _saveTimer = null;
      try {
        var data = {};
        _persistedKeys.forEach(function (k) { data[k] = _state[k]; });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (e) {
        console.error('store: erro ao salvar estado', e);
      }
    }, SAVE_DEBOUNCE_MS);
  }

  // ── Proxy (app.state) ────────────────────────────────────────
  // Intercepta leituras/escritas diretas (backward compat com o v1)
  // e notifica assinantes + persiste automaticamente.
  app.state = new Proxy({}, {
    get: function (target, prop) {
      // Propriedades do estado interno
      if (prop in _state) return _state[prop];
      // Métodos do app (carregarEstado, salvarEstado, etc.)
      if (prop in app) return app[prop];
      return undefined;
    },
    set: function (target, prop, value) {
      // Só aceita chaves conhecidas do estado
      if (prop in _state) {
        _state[prop] = value;
        _emit(prop, value);
        if (_persistedKeys.indexOf(prop) !== -1) _save();
      }
      return true;
    },
  });

  // ── API pública ──────────────────────────────────────────────
  window.store = {
    // Ler valor de uma chave
    get: function (key) {
      return _state[key];
    },

    // Escrever valor em uma chave (dispara notificação + persistência)
    set: function (key, value) {
      if (key in _state) {
        _state[key] = value;
        _emit(key, value);
        if (_persistedKeys.indexOf(key) !== -1) _save();
      } else {
        console.warn('store: chave desconhecida "' + key + '"');
      }
    },

    // Assinar mudanças em uma chave.
    // Retorna função para cancelar a assinatura.
    on: function (key, fn) {
      if (typeof fn !== 'function') return function () {};
      if (!_listeners[key]) _listeners[key] = [];
      _listeners[key].push(fn);
      return function unsubscribe() {
        var idx = (_listeners[key] || []).indexOf(fn);
        if (idx !== -1) _listeners[key].splice(idx, 1);
      };
    },

    // Cancelar assinatura (com ou sem função específica)
    off: function (key, fn) {
      if (!fn) {
        delete _listeners[key];
        return;
      }
      var idx = (_listeners[key] || []).indexOf(fn);
      if (idx !== -1) _listeners[key].splice(idx, 1);
    },

    // Registrar chave para persistência automática
    persist: function (key) {
      if (_persistedKeys.indexOf(key) === -1) {
        _persistedKeys.push(key);
      }
    },

    // Forçar salvamento imediato (ignora debounce)
    flush: function () {
      if (_saveTimer) {
        clearTimeout(_saveTimer);
        _saveTimer = null;
      }
      try {
        var data = {};
        _persistedKeys.forEach(function (k) { data[k] = _state[k]; });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (e) {
        console.error('store: erro ao salvar estado', e);
      }
    },
  };

  // ── Backward compat (app.*) ──────────────────────────────────
  // Mantém as funções originais que o v1 (app.js, dashboard.js, sidebar.js)
  // ainda chama.

  app.carregarEstado = function () {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        var parsed = JSON.parse(saved);
        // Só restaura chaves que realmente existem no estado
        if (Array.isArray(parsed.conversas))
          store.set('conversas', parsed.conversas);
        if (typeof parsed.conversaAtivaId === 'string')
          store.set('conversaAtivaId', parsed.conversaAtivaId);
        if (typeof parsed.contextoGlobal === 'string')
          store.set('contextoGlobal', parsed.contextoGlobal);
      }
    } catch (e) {
      console.error('store: erro ao carregar estado', e);
    }
  };

  app.salvarEstado = function () {
    store.flush();
  };

  app.gerarId = function () {
    return 'c' + Date.now() + Math.floor(Math.random() * 1000);
  };

  app.getConversaAtiva = function () {
    return _state.conversas.find(function (c) {
      return c.id === _state.conversaAtivaId;
    });
  };

  app.getConversaPorId = function (id) {
    return _state.conversas.find(function (c) { return c.id === id; });
  };

  // syncState() vira no-op — o store já gerencia tudo internamente
  app.syncState = function () {};

  // ── Backward compat (window.dados) ───────────────────────────
  // Código antigo (sidebar.js, app.js) usa `dados` global.
  // Aponta para o Proxy, que responde como app.state.
  window.dados = app.state;

  // ── Carregar estado salvo na inicialização ───────────────────
  app.carregarEstado();

})();