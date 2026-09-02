// ── Hermes Remote — App Principal (v2) ─────────────────────────
// Shell do SPA: tema, conexão, router, auto-refresh, PWA e
// delegador central de eventos. As views v2 (HomeView, ChatView,
// ServidorView, ConfigView) gerenciam o próprio conteúdo.

// ── Tema ───────────────────────────────────────────────────────
function setTheme(name) {
  // Migra temas antigos (dark-blue/black/gray) para o novo padrão escuro
  const antigos = ['dark-blue', 'dark-black', 'dark-gray'];
  if (antigos.includes(name)) name = '';
  document.documentElement.setAttribute('data-theme', name || '');
  localStorage.setItem('chatWebTheme', name);
  document.querySelectorAll('.theme-menu button').forEach(function (btn) {
    btn.classList.toggle('active', btn.dataset.theme === (name || ''));
  });
  const icone = (name === 'light')
    ? '<svg class="icon"><use href="#icon-sun"/></use></svg>'
    : '<svg class="icon"><use href="#icon-moon"/></use></svg>';
  const themeBtn = document.getElementById('themeBtn');
  if (themeBtn) themeBtn.innerHTML = icone;
}

function toggleThemeMenu() {
  const menu = document.getElementById('themeMenu');
  if (!menu) return;
  const aberto = menu.classList.toggle('open');
  const themeBtn = document.getElementById('themeBtn');
  if (themeBtn) themeBtn.setAttribute('aria-expanded', aberto ? 'true' : 'false');
}
function selectTheme(name) { setTheme(name); toggleThemeMenu(); }

// ── Roteamento SPA ─────────────────────────────────────────────
// Mapas: nome da view (nav/data-view-alvo) -> seção no HTML.
// 'dashboard' é a Home (rota canônica '/home').
const VIEWS = {
  dashboard: { id: 'view-dashboard', root: 'home-root',     titulo: 'Visão Geral', view: 'HomeView' },
  chat:      { id: 'view-chat-v2',   root: 'chat-root',     titulo: 'Chat',        view: 'ChatView' },
  servidor:  { id: 'view-servidor-v2', root: 'servidor-root', titulo: 'Servidor',  view: 'ServidorView' },
  config:    { id: 'view-config-v2',   root: 'config-root',   titulo: 'Configurações', view: 'ConfigView' },
};

function irPara(view) {
  const cfg = VIEWS[view];
  if (!cfg) view = 'dashboard';

  // Alterna seções
  document.querySelectorAll('.view').forEach(v => {
    v.classList.remove('view-enter');
    v.classList.add('hidden');
  });
  const secao = document.getElementById(cfg.id);
  if (secao) {
    secao.classList.remove('hidden');
    // Adiciona classe de fade-in (remove no fim da animação)
    secao.classList.add('view-enter');
    setTimeout(function () { if (secao) secao.classList.remove('view-enter'); }, 300);
  }

  // Nav ativa
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector('.nav-btn[data-view="' + view + '"]');
  if (btn) btn.classList.add('active');

  // Título
  const pageTitle = document.getElementById('pageTitle');
  if (pageTitle) pageTitle.textContent = cfg.titulo || 'Hermes Remote';

  // Renderiza view v2 no mount point
  const root = document.getElementById(cfg.root);
  const View = window[cfg.view];
  if (root && View && typeof View.render === 'function') {
    View.render(root);
  }

  // Fecha menus abertos ao navegar
  const themeMenu = document.getElementById('themeMenu');
  if (themeMenu && themeMenu.classList.contains('open')) themeMenu.classList.remove('open');
  const chatMenu = document.getElementById('chatMenu');
  if (chatMenu && chatMenu.classList.contains('open')) chatMenu.classList.remove('open');
}

// ── Indicador de conexão ───────────────────────────────────────
async function verificarConexao() {
  const el = document.getElementById('conexaoStatus');
  if (!el) return;
  try {
    const res = await fetch('/api/health');
    const data = await res.json();
    if (res.ok && data.status === 'ok') {
      el.innerHTML = '<svg class="icon-sm"><use href="#icon-check"/></use></svg> online';
      el.classList.remove('offline');
      el.classList.add('online');
    } else {
      el.innerHTML = '<svg class="icon-sm"><use href="#icon-cross"/></use></svg> offline';
      el.classList.add('offline');
      el.classList.remove('online');
    }
  } catch (e) {
    el.innerHTML = '<svg class="icon-sm"><use href="#icon-cross"/></use></svg> offline';
    el.classList.add('offline');
    el.classList.remove('online');
  }
}

// ── Auto-refresh da Home (30s) ─────────────────────────────────
let refreshTimer = null;

function agendarAutoRefresh() {
  if (refreshTimer) clearInterval(refreshTimer);
  refreshTimer = setInterval(function () {
    const homeVisivel = !document.getElementById('view-dashboard').classList.contains('hidden');
    if (homeVisivel && window.HomeView && typeof HomeView.refresh === 'function') {
      HomeView.refresh();
    }
  }, 30000);
}

// ── Instalação do PWA ──────────────────────────────────────────
let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', function (e) {
  e.preventDefault();
  deferredPrompt = e;
  const btn = document.getElementById('installBtn');
  if (btn) btn.style.display = 'inline-block';
});

window.addEventListener('appinstalled', function () {
  deferredPrompt = null;
  const btn = document.getElementById('installBtn');
  if (btn) btn.style.display = 'none';
});

function instalarPWA() {
  if (!deferredPrompt) {
    alert('Use o menu do navegador: "Adicionar à tela inicial" (Android) ou "Adicionar ao ecrã inicial" (iPhone/Safari).');
    return;
  }
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then(function () {
    deferredPrompt = null;
    const btn = document.getElementById('installBtn');
    if (btn) btn.style.display = 'none';
  });
}

// ── Teclado (global) ───────────────────────────────────────────
document.addEventListener('keydown', function (e) {
  // Fecha menus com Escape
  if (e.key === 'Escape') {
    ['themeMenu', 'chatMenu', 'exportMenu'].forEach(function (id) {
      const menu = document.getElementById(id);
      if (menu && menu.classList.contains('open')) menu.classList.remove('open');
    });
  }
  // Ask Hermes da Home (Enter no input)
  if (e.key === 'Enter' && e.target && e.target.id === 'homeAskInput') {
    e.preventDefault();
    const btn = document.querySelector('[data-action="ask-hermes"]');
    if (btn) btn.click();
  }
});

// ── Event Delegation (central) ─────────────────────────────────
// Views v2 gerenciam os próprios cliques dentro dos mount points.
// Este handler cobre apenas o shell (nav, tema, PWA, ask-hermes).
document.addEventListener('click', function (e) {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const action = btn.dataset.action;

  // Views v2 gerenciam cliques internos (HomeView, ChatView, etc.)
  const mount = btn.closest('#home-root, #chat-root, #servidor-root, #config-root');
  if (mount) return;

  switch (action) {
    case 'navegar':
      if (btn.dataset && btn.dataset.viewAlvo) {
        // 'dashboard' é a view v1; a rota canônica da Home é '/home'
        var rota = btn.dataset.viewAlvo === 'dashboard' ? '/home' : '/' + btn.dataset.viewAlvo;
        router.go(rota);
      }
      break;
    case 'instalar':
      if (typeof instalarPWA === 'function') instalarPWA();
      break;
    case 'tema-menu':
      if (typeof toggleThemeMenu === 'function') toggleThemeMenu();
      break;
    case 'tema':
      if (typeof selectTheme === 'function') selectTheme(btn.dataset.theme);
      break;
    case 'ask-hermes': {
      const input = document.getElementById('homeAskInput');
      if (input && input.value.trim()) {
        const texto = input.value.trim();
        input.value = '';
        // Guarda o draft e navega — a ChatView v2 consome o draft
        store.set('draftMensagem', texto);
        router.go('/chat');
      }
      break;
    }
    default:
      console.warn('Ação desconhecida:', action);
  }
});

// ── Inicialização ──────────────────────────────────────────────
(function init() {
  var theme = localStorage.getItem('chatWebTheme') || '';
  setTheme(theme);

  // Router (v2): registra rotas que delegam para o irPara.
  if (typeof router !== 'undefined' && typeof router.on === 'function') {
    router.mount(document.getElementById('home-root') || document.createElement('div'));
    router.on('/home', function () { irPara('dashboard'); });
    router.on('/dashboard', function () { irPara('dashboard'); });
    router.on('/chat', function () { irPara('chat'); });
    router.on('/servidor', function () { irPara('servidor'); });
    router.on('/config', function () { irPara('config'); });
    router.init();
  } else {
    irPara('dashboard');
  }

  verificarConexao();
  agendarAutoRefresh();
  setInterval(verificarConexao, 60000); // re-checa conexão a cada minuto
})();