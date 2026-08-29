// ── Hermes Remote — App Principal ──────────────────────────────
// Roteamento SPA, chat, temas, configurações

const messagesEl = document.getElementById('messages');
const inputEl = document.getElementById('input');
const sendBtn = document.getElementById('sendBtn');
const modelSelect = document.getElementById('modelSelect');
const themeBtn = document.getElementById('themeBtn');
const themeMenu = document.getElementById('themeMenu');

let conversando = false;
let modeloSelecionado = '';
let abortController = null;

// ── Roteamento SPA ─────────────────────────────────────────────
function irPara(view) {
  document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
  const el = document.getElementById('view-' + view);
  if (el) el.classList.remove('hidden');

  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector('.nav-btn[data-view="' + view + '"]');
  if (btn) btn.classList.add('active');

  const titles = { dashboard: '📊 Visão Geral', chat: '💬 Chat', servidor: '🖥️ Servidor', config: '⚙️ Config' };
  document.getElementById('pageTitle').textContent = titles[view] || 'Hermes Remote';

  // Fecha o drawer no mobile ao navegar
  if (isMobile()) fecharSidebar();

  if (view === 'dashboard') { carregarDashboard(); carregarPowerSchedule(); carregarHistoricoAcoes(); }
  if (view === 'servidor') carregarServidor();
  if (view === 'chat') carregarModelos();
}

// ── Chat ───────────────────────────────────────────────────────
function formatarTimestamp(data) {
  const agora = new Date();
  const mesmaData = data.getFullYear() === agora.getFullYear() &&
    data.getMonth() === agora.getMonth() && data.getDate() === agora.getDate();
  const horas = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return mesmaData ? horas : data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ' ' + horas;
}

function limparMensagens() {
  messagesEl.innerHTML = '<div class="empty">Selecione um modelo e comece a conversar!</div>';
  inputEl.value = '';
}

function criarBolha(role, content, timestamp, isStreaming) {
  const div = document.createElement('div');
  div.className = 'message ' + role;
  if (isStreaming) div.classList.add('streaming');
  div.dataset.role = role;

  if (role === 'assistant') {
    const copiarBtn = document.createElement('button');
    copiarBtn.className = 'copy-btn';
    copiarBtn.textContent = '📋';
    copiarBtn.title = 'Copiar resposta';
    copiarBtn.onclick = function () { copiarTexto(this); };
    div.appendChild(copiarBtn);
  }

  const labelEl = document.createElement('div');
  labelEl.className = 'role-label';
  labelEl.textContent = role === 'user' ? 'Você' : 'Assistente';
  div.appendChild(labelEl);

  const contentEl = document.createElement('div');
  contentEl.className = 'content';
  contentEl.innerHTML = renderMarkdown(content);
  div.appendChild(contentEl);

  const timeEl = document.createElement('div');
  timeEl.className = 'timestamp';
  timeEl.textContent = timestamp || '';
  div.appendChild(timeEl);

  return div;
}

function exibirConversa(conv) {
  limparMensagens();
  if (!conv || !conv.mensagens || conv.mensagens.length === 0) return;
  conv.mensagens.forEach(function (msg) {
    messagesEl.appendChild(criarBolha(msg.role, msg.content, msg.timestamp || ''));
  });
  messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: 'smooth' });
}

function addMessage(role, content, isStreaming) {
  const empty = messagesEl.querySelector('.empty');
  if (empty) empty.remove();
  const agora = formatarTimestamp(new Date());
  const div = criarBolha(role, content, agora, isStreaming);
  messagesEl.appendChild(div);
  messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: 'smooth' });
  return div;
}

function updateMessageContent(div, content, final) {
  const contentEl = div.querySelector('.content');
  if (contentEl) {
    if (final) {
      contentEl.innerHTML = renderMarkdown(content);
    } else {
      contentEl.textContent = content;
    }
  }
  messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: 'smooth' });
}

function setLoading(loading) {
  conversando = loading;
  sendBtn.disabled = loading || !modeloSelecionado;
  inputEl.disabled = loading;
  document.getElementById('stopBtn').style.display = loading ? 'inline-block' : 'none';
  inputEl.placeholder = loading ? 'Aguardando resposta...' : 'Digite sua mensagem...';
  if (!loading) inputEl.focus();
}

function carregarContexto() {
  return dados && dados.contextoGlobal ? dados.contextoGlobal : '';
}

function exibirContexto() {
  const input = document.getElementById('contextoInput');
  if (input) input.value = dados && dados.contextoGlobal ? dados.contextoGlobal : '';
}

function salvarContexto() {
  const input = document.getElementById('contextoInput');
  const texto = input ? input.value.trim() : '';
  if (dados) { dados.contextoGlobal = texto; if (typeof salvarDados === 'function') salvarDados(); }
  const btn = document.querySelector('.contexto-btn');
  if (btn) { btn.textContent = '✓ Salvo!'; setTimeout(function () { btn.textContent = 'Salvar contexto'; }, 1500); }
}

function handleKey(event) {
  if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); enviarMensagem(); }
}

function salvarModeloSelecionado() {
  modeloSelecionado = modelSelect.value;
  sendBtn.disabled = !modeloSelecionado || conversando;
  localStorage.setItem('chatWebModel', modeloSelecionado);
}

function setTheme(name) {
  document.documentElement.setAttribute('data-theme', name || '');
  localStorage.setItem('chatWebTheme', name);
  document.querySelectorAll('.theme-menu button').forEach(function (btn) {
    btn.classList.toggle('active', btn.dataset.theme === (name || ''));
  });
  var icons = { '': '☀️', 'dark-blue': '🌙', 'dark-black': '🖤', 'dark-gray': '🌫️' };
  themeBtn.textContent = icons[name] || '☀️';
}

function toggleThemeMenu() { themeMenu.classList.toggle('open'); }
function selectTheme(name) { setTheme(name); themeMenu.classList.remove('open'); }

function copiarTexto(btn) {
  var content = btn.closest('.message').querySelector('.content').textContent;
  navigator.clipboard.writeText(content);
  btn.textContent = '✅'; btn.title = 'Copiado!';
  setTimeout(function () { btn.textContent = '📋'; btn.title = 'Copiar resposta'; }, 2000);
}

function novaConversa() {
  if (typeof criarConversa === 'function') criarConversa(); else limparMensagens();
  inputEl.focus();
}

async function carregarModelos() {
  try {
    var res = await fetch('/api/models');
    var data = await res.json();
    modelSelect.innerHTML = '<option value="">Selecione um modelo...</option>';
    var modelos = data.data || [];
    modelos.filter(function (m) {
      return !m.id.includes('image') && !m.id.includes('tts') && !m.id.includes('embedding') && !m.id.includes('stt') && m.id !== 'undefined';
    }).forEach(function (m) {
      var opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = m.id + (m.owned_by ? ' (' + m.owned_by + ')' : '');
      modelSelect.appendChild(opt);
    });
    var salvo = localStorage.getItem('chatWebModel');
    if (salvo && Array.from(modelSelect.options).some(function (o) { return o.value === salvo; })) {
      modelSelect.value = salvo;
    }
    salvarModeloSelecionado();
  } catch (error) {
    modelSelect.innerHTML = '<option value="">Erro ao carregar modelos</option>';
  }
}

function montarMensagensParaEnvio() {
  var msgs = [];
  var contexto = typeof carregarContexto === 'function' ? carregarContexto() : '';
  if (contexto) msgs.push({ role: 'system', content: contexto });
  var conv = typeof getConversaAtiva === 'function' ? getConversaAtiva() : null;
  if (conv && conv.mensagens) {
    conv.mensagens.forEach(function (m) { msgs.push({ role: m.role, content: m.content }); });
  }
  return msgs;
}

async function enviarMensagem() {
  var texto = inputEl.value.trim();
  if (!texto || !modeloSelecionado || conversando) return;

  inputEl.value = '';
  addMessage('user', texto);

  if (typeof adicionarMensagemNaConversa === 'function') adicionarMensagemNaConversa(texto);
  else if (typeof salvarConversaAtual === 'function') salvarConversaAtual();

  var msgs = montarMensagensParaEnvio();
  var bolha = addMessage('assistant', '', true);
  setLoading(true);
  abortController = new AbortController();

  try {
    var res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: modeloSelecionado, messages: msgs, stream: true }),
      signal: abortController.signal
    });

    if (!res.ok) {
      var err = await res.json();
      updateMessageContent(bolha, 'Erro: ' + (err.error || res.statusText), true);
      setLoading(false);
      return;
    }

    var reader = res.body.getReader();
    var decoder = new TextDecoder();
    var resposta = '';
    while (true) {
      var { done, value } = await reader.read();
      if (done) break;
      var chunk = decoder.decode(value, { stream: true });
      var lines = chunk.split('\n').filter(l => l.startsWith('data: '));
      for (var line of lines) {
        try {
          var parsed = JSON.parse(line.slice(6));
          if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta) {
            var delta = parsed.choices[0].delta.content || '';
            resposta += delta;
            updateMessageContent(bolha, resposta);
          }
        } catch (e) { /* ignore parse errors */ }
      }
    }
    bolha.classList.remove('streaming');
    updateMessageContent(bolha, resposta, true);
    if (typeof adicionarMensagemNaConversa === 'function') adicionarMensagemNaConversa(resposta, 'assistant');
  } catch (error) {
    if (error.name !== 'AbortError') {
      updateMessageContent(bolha, 'Erro: ' + error.message, true);
    }
  }
  setLoading(false);
  abortController = null;
}

function pararResposta() {
  if (abortController) { abortController.abort(); abortController = null; }
  setLoading(false);
}

// ── Sidebar toggle ─────────────────────────────────────────────
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const aberto = !sidebar.classList.contains('collapsed');
  if (aberto) {
    fecharSidebar();
  } else {
    abrirSidebar();
  }
}

function abrirSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const toggle = document.getElementById('sidebarToggle');
  if (!sidebar) return;
  sidebar.classList.remove('collapsed');
  if (overlay) {
    overlay.classList.remove('hidden');
  }
  if (toggle) toggle.setAttribute('aria-expanded', 'true');
  // Foco no primeiro item para acessibilidade
  const primeiro = sidebar.querySelector('button, input, textarea');
  if (primeiro) primeiro.focus();
}

function fecharSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const toggle = document.getElementById('sidebarToggle');
  if (!sidebar) return;
  sidebar.classList.add('collapsed');
  if (overlay) {
    overlay.classList.add('hidden');
  }
  if (toggle) toggle.setAttribute('aria-expanded', 'false');
}

// Mobile? (usado para fechar drawer apenas em telas pequenas)
function isMobile() {
  return window.matchMedia('(max-width: 767px)').matches;
}

// Fechar drawer ao clicar em item do sidebar (mobile)
document.addEventListener('click', function (e) {
  if (!isMobile()) return;
  const sidebar = document.getElementById('sidebar');
  if (!sidebar || sidebar.classList.contains('collapsed')) return;
  // Se clicou dentro do sidebar, em algo que não seja input/textarea, fecha
  if (sidebar.contains(e.target)) {
    const tag = e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    // Não fecha se clicou no export menu (precisa escolher formato)
    if (e.target.closest('.export-menu')) return;
    fecharSidebar();
  }
});

// Fechar com tecla ESC
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    fecharSidebar();
    const themeMenu = document.getElementById('themeMenu');
    if (themeMenu && themeMenu.classList.contains('open')) themeMenu.classList.remove('open');
    const exportMenu = document.getElementById('exportMenu');
    if (exportMenu && exportMenu.classList.contains('open')) exportMenu.classList.remove('open');
  }
});

function toggleExportMenu() {
  document.getElementById('exportMenu').classList.toggle('open');
}

// ── Indicador de conexão ───────────────────────────────────────
let conexaoChecada = false;

async function verificarConexao() {
  const el = document.getElementById('conexaoStatus');
  if (!el) return;
  try {
    const res = await fetch('/api/health');
    const data = await res.json();
    if (res.ok && data.status === 'ok') {
      el.textContent = '🟢 online';
      el.classList.remove('offline');
      el.classList.add('online');
    } else {
      el.textContent = '🔴 offline';
      el.classList.add('offline');
      el.classList.remove('online');
    }
  } catch (e) {
    el.textContent = '🔴 offline';
    el.classList.add('offline');
    el.classList.remove('online');
  }
  conexaoChecada = true;
}

// ── Auto-refresh do dashboard (30s) ────────────────────────────
let refreshTimer = null;

function agendarAutoRefresh() {
  if (refreshTimer) clearInterval(refreshTimer);
  refreshTimer = setInterval(function () {
    const dashboardVisivel = !document.getElementById('view-dashboard').classList.contains('hidden');
    if (dashboardVisivel) {
      carregarDashboard();
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
  deferredPrompt.userChoice.then(function (choice) {
    deferredPrompt = null;
    const btn = document.getElementById('installBtn');
    if (btn) btn.style.display = 'none';
  });
}

// ── Inicialização ──────────────────────────────────────────────
(function init() {
  var theme = localStorage.getItem('chatWebTheme') || '';
  setTheme(theme);
  irPara('dashboard');
  verificarConexao();
  agendarAutoRefresh();
  setInterval(verificarConexao, 60000); // re-checa conexão a cada minuto
})();