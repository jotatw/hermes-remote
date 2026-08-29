const STORAGE_KEY = 'chatWebData';

let dados = carregarDados();

function carregarDados() {
  try {
    const salvo = localStorage.getItem(STORAGE_KEY);
    if (salvo) return JSON.parse(salvo);
  } catch (e) {
    console.error('Erro ao ler dados salvos:', e);
  }
  return { conversas: [], conversaAtivaId: null, contextoGlobal: '' };
}

function salvarDados() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
}

function gerarId() {
  return 'c' + Date.now() + Math.floor(Math.random() * 1000);
}

function getConversaAtiva() {
  return dados.conversas.find(function (c) { return c.id === dados.conversaAtivaId; });
}

function getConversaPorId(id) {
  return dados.conversas.find(function (c) { return c.id === id; });
}

function renderizarListaConversas() {
  const lista = document.getElementById('listaConversas');
  lista.innerHTML = '';

  dados.conversas.forEach(function (conv) {
    const li = document.createElement('li');
    li.className = 'conversa-item' + (conv.id === dados.conversaAtivaId ? ' active' : '');
    if (typeof conversando !== 'undefined' && conversando) li.classList.add('bloqueado');
    li.title = conv.titulo;

    const span = document.createElement('span');
    span.className = 'conversa-nome';
    span.textContent = conv.titulo;
    span.onclick = function () { trocarConversa(conv.id); };

    const acoes = document.createElement('div');
    acoes.className = 'conversa-acoes';

    const btnRenomear = document.createElement('button');
    btnRenomear.className = 'icon-btn';
    btnRenomear.textContent = '✏️';
    btnRenomear.title = 'Renomear conversa';
    btnRenomear.onclick = function (event) {
      event.stopPropagation();
      renomearConversa(conv.id);
    };

    const btnExcluir = document.createElement('button');
    btnExcluir.className = 'icon-btn';
    btnExcluir.textContent = '🗑️';
    btnExcluir.title = 'Excluir conversa';
    btnExcluir.onclick = function (event) {
      event.stopPropagation();
      excluirConversa(conv.id);
    };

    acoes.appendChild(btnRenomear);
    acoes.appendChild(btnExcluir);
    li.appendChild(span);
    li.appendChild(acoes);
    lista.appendChild(li);
  });
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