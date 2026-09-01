// ── Hermes Remote — Router (hash-based) ────────────────────────
// Roteamento via URL hash (#/home, #/chat, #/servidor).
// Compatível com o v1 (que não usa hash) — o v1 continua funcionando
// como antes; as views v2 usarão o router.
// Escuta hashchange + popstate para navegação com botão voltar.

window.router = (function () {
  'use strict';

  var _routes = {};
  var _container = null;
  var _current = null;
  var _defaultRoute = '/home';
  var _initialized = false;
  var _onUnknown = null;

  // ── Navegar para uma rota ────────────────────────────────────
  function go(path) {
    if (path[0] !== '/') path = '/' + path;
    window.location.hash = '#' + path;
    // O listener hashchange chama _resolve()
  }

  // ── Registrar handler de rota ─────────────────────────────────
  function on(path, fn) {
    if (typeof fn !== 'function') return;
    if (path[0] !== '/') path = '/' + path;
    _routes[path] = fn;
  }

  // ── Remover handler de rota ───────────────────────────────────
  function off(path) {
    if (path[0] !== '/') path = '/' + path;
    delete _routes[path];
  }

  // ── Definir container ─────────────────────────────────────────
  function mount(el) {
    _container = el;
  }

  // ── Rota atual (sem hash) ─────────────────────────────────────
  function current() {
    return _current;
  }

  // ── Callback para rota desconhecida ───────────────────────────
  function onUnknown(fn) {
    _onUnknown = fn;
  }

  // ── Resolver rota ─────────────────────────────────────────────
  function _resolve() {
    var hash = window.location.hash.replace(/^#/, '') || _defaultRoute;
    if (hash[0] !== '/') hash = '/' + hash;

    var fn = _routes[hash];

    if (fn && _container) {
      _current = hash;
      try {
        fn(_container);
      } catch (e) {
        console.error('router: erro ao renderizar rota "' + hash + '"', e);
      }
    } else if (hash !== _current || !fn) {
      // Rota não registrada ou handler removido — redireciona para padrão
      _current = _defaultRoute;
      window.location.hash = '#' + _defaultRoute;
      if (typeof _onUnknown === 'function') {
        try { _onUnknown(hash); } catch (e) { /* ignora */ }
      }
    }
  }

  // ── Inicializar ───────────────────────────────────────────────
  function init() {
    if (_initialized) return;
    _initialized = true;

    window.addEventListener('hashchange', _resolve);
    window.addEventListener('popstate', _resolve);

    // Se não há hash, define o padrão
    if (!window.location.hash) {
      window.location.hash = '#' + _defaultRoute;
    } else {
      // Já tem hash — resolve imediatamente
      _resolve();
    }
  }

  // ── API pública ──────────────────────────────────────────────
  return {
    go: go,
    on: on,
    off: off,
    mount: mount,
    current: current,
    onUnknown: onUnknown,
    init: init,
  };

})();