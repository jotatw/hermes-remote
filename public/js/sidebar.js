// Estado centralizado: `dados` aponta para app.state (state.js)
let dados = app.state;

function salvarDados() {
  app.salvarEstado();
}

function gerarId() {
  return app.gerarId();
}

function getConversaAtiva() {
  return dados.conversas.find(function (c) { return c.id === dados.conversaAtivaId; });
}

function getConversaPorId(id) {
  return dados.conversas.find(function (c) { return c.id === id; });
}

function renderizarListaConversas() {
  const select = document.getElementById('conversaSelect');
  if (!select) return;
  select.innerHTML = '';

  dados.conversas.forEach(function (conv) {
    const opt = document.createElement('option');
    opt.value = conv.id;
    opt.textContent = conv.titulo;
    if (conv.id === dados.conversaAtivaId) opt.selected = true;
    select.appendChild(opt);
  });

  // Trocar conversa ao mudar o dropdown
  select.onchange = function () { trocarConversa(select.value); };
}

function criarConversa() {
  const nova = {
    id: gerarId(),
    titulo: 'Nova conversa',
    criadaEm: new Date().toISOString(),
    mensagens: [],
    todos: [],
    modelo: null
  };
  dados.conversas.push(nova);
  dados.conversaAtivaId = nova.id;
  salvarDados();
  renderizarListaConversas();
  if (typeof limparMensagens === 'function') limparMensagens();
  if (typeof renderizarListaTodos === 'function') renderizarListaTodos();
  return nova;
}

function trocarConversa(id) {
  if (typeof conversando !== 'undefined' && conversando) return;
  const conv = dados.conversas.find(function (c) { return c.id === id; });
  if (!conv) return;
  dados.conversaAtivaId = id;
  salvarDados();
  renderizarListaConversas();
  if (typeof exibirConversa === 'function') exibirConversa(conv);
  if (typeof renderizarListaTodos === 'function') renderizarListaTodos();
}

function renomearConversa(id) {
  const conv = dados.conversas.find(function (c) { return c.id === id; });
  if (!conv) return;
  const novoNome = prompt('Novo nome da conversa:', conv.titulo);
  if (novoNome && novoNome.trim()) {
    conv.titulo = novoNome.trim();
    salvarDados();
    renderizarListaConversas();
  }
}

function excluirConversa(id) {
  const conv = dados.conversas.find(function (c) { return c.id === id; });
  if (!conv) return;
  if (!confirm('Excluir a conversa "' + conv.titulo + '"? Essa ação não pode ser desfeita.')) return;

  dados.conversas = dados.conversas.filter(function (c) { return c.id !== id; });

  if (dados.conversaAtivaId === id) {
    if (dados.conversas.length > 0) {
      dados.conversaAtivaId = dados.conversas[dados.conversas.length - 1].id;
      const ativa = getConversaAtiva();
      if (typeof exibirConversa === 'function') exibirConversa(ativa);
      if (typeof renderizarListaTodos === 'function') renderizarListaTodos();
    } else {
      criarConversa();
      return;
    }
  }

  salvarDados();
  renderizarListaConversas();
}

function initSidebar() {
  if (!getConversaAtiva()) criarConversa();
  var ativa = getConversaAtiva();
  if (ativa && typeof exibirConversa === 'function') exibirConversa(ativa);
  renderizarListaConversas();
  if (typeof carregarContexto === 'function') carregarContexto();
  if (typeof exibirContexto === 'function') exibirContexto();
  if (typeof initTodos === 'function') initTodos();
}

function toggleExportMenu() {
  var menu = document.getElementById('exportMenu');
  if (menu) menu.classList.toggle('open');
}

// ── Chat menu (⋯) ─────────────────────────────────────────────
function toggleChatMenu() {
  var menu = document.getElementById('chatMenu');
  var btn = document.getElementById('chatMenuBtn');
  if (!menu) return;
  var aberto = menu.classList.toggle('open');
  if (btn) btn.setAttribute('aria-expanded', aberto ? 'true' : 'false');
}

function toggleContextoPanel() {
  var panel = document.getElementById('contextoPanel');
  var menu = document.getElementById('chatMenu');
  if (panel) panel.classList.toggle('hidden');
  if (menu) menu.classList.remove('open');
  var btn = document.getElementById('chatMenuBtn');
  if (btn) btn.setAttribute('aria-expanded', 'false');
}

function toggleTodosPanel() {
  var panel = document.getElementById('todosPanel');
  var menu = document.getElementById('chatMenu');
  if (panel) panel.classList.toggle('hidden');
  if (menu) menu.classList.remove('open');
  var btn = document.getElementById('chatMenuBtn');
  if (btn) btn.setAttribute('aria-expanded', 'false');
}

function exportarConversa(formato) {
  var menu = document.getElementById('exportMenu');
  if (menu) menu.classList.remove('open');

  var conv = getConversaAtiva();
  if (!conv) return;
  if (!conv.mensagens || conv.mensagens.length === 0) {
    alert('A conversa está vazia. Nada para exportar.');
    return;
  }

  var nomeBase = (conv.titulo || 'conversa').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  var conteudo;
  var tipoMime;
  var extensao;

  if (formato === 'json') {
    extensao = 'json';
    tipoMime = 'application/json';
    conteudo = JSON.stringify({
      titulo: conv.titulo,
      modelo: conv.modelo || null,
      criadaEm: conv.criadaEm,
      contextoGlobal: dados.contextoGlobal || '',
      mensagens: conv.mensagens,
      todos: conv.todos || []
    }, null, 2);
  } else if (formato === 'md') {
    extensao = 'md';
    tipoMime = 'text/markdown';
    var linhasMd = [];
    linhasMd.push('# ' + conv.titulo);
    linhasMd.push('');
    linhasMd.push('- **Modelo**: ' + (conv.modelo || '—'));
    linhasMd.push('- **Criada em**: ' + new Date(conv.criadaEm).toLocaleString('pt-BR'));
    linhasMd.push('- **Contexto global**: ' + (dados.contextoGlobal || '—'));
    linhasMd.push('');
    conv.mensagens.forEach(function (m) {
      var quem = m.role === 'user' ? '**Você**' : '**Assistente**';
      linhasMd.push('### ' + quem + ' — ' + (m.timestamp || ''));
      linhasMd.push('');
      linhasMd.push(m.content);
      linhasMd.push('');
    });
    conteudo = linhasMd.join('\n');
  } else {
    extensao = 'txt';
    tipoMime = 'text/plain';
    var linhasTxt = [];
    linhasTxt.push('=== ' + conv.titulo + ' ===');
    linhasTxt.push('Modelo: ' + (conv.modelo || '—'));
    linhasTxt.push('Criada em: ' + new Date(conv.criadaEm).toLocaleString('pt-BR'));
    if (dados.contextoGlobal) {
      linhasTxt.push('Contexto global: ' + dados.contextoGlobal);
    }
    linhasTxt.push('');
    conv.mensagens.forEach(function (m) {
      var quem = m.role === 'user' ? 'Você' : 'Assistente';
      linhasTxt.push('[' + quem + '] ' + (m.timestamp || ''));
      linhasTxt.push(m.content);
      linhasTxt.push('');
    });
    conteudo = linhasTxt.join('\n');
  }

  var blob = new Blob([conteudo], { type: tipoMime + ';charset=utf-8' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = nomeBase + '.' + extensao;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
}