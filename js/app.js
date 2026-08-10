const messagesEl = document.getElementById('messages');
const inputEl = document.getElementById('input');
const sendBtn = document.getElementById('sendBtn');
const modelSelect = document.getElementById('modelSelect');
const themeBtn = document.getElementById('themeBtn');
const themeMenu = document.getElementById('themeMenu');

let conversando = false;
let modeloSelecionado = '';
let abortController = null;

function formatarTimestamp(data) {
  var agora = new Date();
  var mesmaData = data.getFullYear() === agora.getFullYear() &&
    data.getMonth() === agora.getMonth() &&
    data.getDate() === agora.getDate();
  var horas = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  if (mesmaData) return horas;
  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ' ' + horas;
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
  contentEl.textContent = content;
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

function updateMessageContent(div, content) {
  const contentEl = div.querySelector('.content');
  if (contentEl) contentEl.textContent = content;
  messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: 'smooth' });
}

function setLoading(loading) {
  conversando = loading;
  sendBtn.disabled = loading || !modeloSelecionado;
  inputEl.disabled = loading;
  document.getElementById('stopBtn').style.display = loading ? 'inline-block' : 'none';
  inputEl.placeholder = loading ? 'Aguardando resposta...' : (typeof dicas !== 'undefined' ? dicas[0] : 'Digite sua mensagem...');
  if (!loading) inputEl.focus();
}

function carregarContexto() {
  return dados && dados.contextoGlobal ? dados.contextoGlobal : '';
}

function exibirContexto() {
  const input = document.getElementById('contextoInput');
  if (input) {
    input.value = dados && dados.contextoGlobal ? dados.contextoGlobal : '';
  }
}

function salvarContexto() {
  const input = document.getElementById('contextoInput');
  const texto = input ? input.value.trim() : '';
  if (dados) {
    dados.contextoGlobal = texto;
    if (typeof salvarDados === 'function') salvarDados();
  }
  const btn = document.querySelector('.contexto-btn');
  if (btn) {
    btn.textContent = '✓ Salvo!';
    setTimeout(function () {
      btn.textContent = 'Salvar contexto';
    }, 1500);
  }
}

function handleKey(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    enviarMensagem();
  }
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

function toggleThemeMenu() {
  themeMenu.classList.toggle('open');
}

function selectTheme(name) {
  setTheme(name);
  themeMenu.classList.remove('open');
}

function copiarTexto(btn) {
  var content = btn.closest('.message').querySelector('.content').textContent;
  navigator.clipboard.writeText(content);
  btn.textContent = '✅';
  btn.title = 'Copiado!';
  setTimeout(function () {
    btn.textContent = '📋';
    btn.title = 'Copiar resposta';
  }, 2000);
}

function novaConversa() {
  if (typeof criarConversa === 'function') {
    criarConversa();
  } else {
    limparMensagens();
  }
  inputEl.focus();
}

async function carregarModelos() {
  try {
    var res = await fetch('/api/models');
    var data = await res.json();

    modelSelect.innerHTML = '<option value="">Selecione um modelo...</option>';

    var modelos = data.data || [];
    var modelosChat = modelos.filter(function (m) {
      return !m.id.includes('image') &&
        !m.id.includes('tts') &&
        !m.id.includes('embedding') &&
        !m.id.includes('stt') &&
        m.id !== 'undefined';
    });

    modelosChat.forEach(function (m) {
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
    console.error('Erro ao carregar modelos:', error);
  }
}

function montarMensagensParaEnvio() {
  var msgs = [];
  var contexto = typeof carregarContexto === 'function' ? carregarContexto() : '';
  if (contexto) {
    msgs.push({ role: 'system', content: contexto });
  }
  var conv = typeof getConversaAtiva === 'function' ? getConversaAtiva() : null;
  if (conv && conv.mensagens) {
    conv.mensagens.forEach(function (m) {
      msgs.push({ role: m.role, content: m.content });
    });
  }
  return msgs;
}

async function enviarMensagem() {
  var texto = inputEl.value.trim();
  if (!texto || !modeloSelecionado || conversando) return;

  inputEl.value = '';
  inputEl.style.height = 'auto';

  var convAtivaId = typeof getConversaAtiva === 'function' ? getConversaAtiva()?.id : null;
  var conv = typeof getConversaAtiva === 'function' ? getConversaAtiva() : null;
  var agora = formatarTimestamp(new Date());
  if (conv) {
    conv.mensagens.push({ role: 'user', content: texto, timestamp: agora });
    if (!conv.modelo) conv.modelo = modeloSelecionado;
  }

  addMessage('user', texto);
  var msgDiv = addMessage('assistant', 'Aguardando resposta...', true);
  setLoading(true);

  abortController = new AbortController();
  var mensagensCompletas = montarMensagensParaEnvio();

  try {
    var res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modeloSelecionado,
        messages: mensagensCompletas,
        stream: true,
      }),
      signal: abortController.signal,
    });

    if (!res.ok) {
      var err = await res.json().catch(function () { return { error: 'Erro desconhecido' }; });
      updateMessageContent(msgDiv, 'Erro: ' + (err.error || res.statusText));
      msgDiv.classList.remove('streaming');
      abortController = null;
      setLoading(false);
      return;
    }

    var reader = res.body.getReader();
    var decoder = new TextDecoder();
    var buffer = '';
    var respostaCompleta = '';
    var ultimoUso = null;

    while (true) {
      var result = await reader.read();
      if (result.done) break;

      buffer += decoder.decode(result.value, { stream: true });
      var linhas = buffer.split('\n');
      buffer = linhas.pop();

      for (var i = 0; i < linhas.length; i++) {
        var linha = linhas[i];
        if (linha.startsWith('data: ') && linha !== 'data: [DONE]') {
          try {
            var json = JSON.parse(linha.slice(6));
            var conteudo = json.choices?.[0]?.delta?.content || '';
            if (conteudo) {
              respostaCompleta += conteudo;
              updateMessageContent(msgDiv, respostaCompleta);
            }
            if (json.usage && json.usage.total_tokens) {
              ultimoUso = json.usage;
            }
          } catch (e) {}
        }
      }
    }

    msgDiv.classList.remove('streaming');
    if (!respostaCompleta) {
      updateMessageContent(msgDiv, '(resposta vazia)');
    } else {
      var convOrigem = typeof getConversaPorId === 'function' ? getConversaPorId(convAtivaId) : null;
      if (convOrigem) {
        var agora = formatarTimestamp(new Date());
        convOrigem.mensagens.push({ role: 'assistant', content: respostaCompleta, timestamp: agora });
        if (typeof salvarDados === 'function') salvarDados();
        if (convOrigem.titulo === 'Nova conversa' && respostaCompleta.length > 3) {
          convOrigem.titulo = texto.length > 30 ? texto.slice(0, 30) + '...' : texto;
          if (typeof renderizarListaConversas === 'function') renderizarListaConversas();
        }
      }
      if (ultimoUso && ultimoUso.total_tokens) {
        var usoEl = document.createElement('div');
        usoEl.className = 'tokens-uso';
        usoEl.textContent = '⚡ ' + ultimoUso.prompt_tokens + ' in · ' +
          ultimoUso.completion_tokens + ' out · ' + ultimoUso.total_tokens + ' tok';
        msgDiv.appendChild(usoEl);
      }
    }
  } catch (error) {
    if (error.name !== 'AbortError') {
      updateMessageContent(msgDiv, 'Erro de conexão: ' + error.message);
      msgDiv.classList.remove('streaming');
    }
  }

  abortController = null;
  setLoading(false);
}

function pararResposta() {
  if (abortController) {
    abortController.abort();
    abortController = null;
  }
}

inputEl.addEventListener('input', function () {
  this.style.height = 'auto';
  this.style.height = Math.min(this.scrollHeight, 120) + 'px';
});

document.addEventListener('click', function (e) {
  if (!e.target.closest('.theme-picker')) {
    themeMenu.classList.remove('open');
  }
  if (!e.target.closest('.export-group')) {
    var exportMenu = document.getElementById('exportMenu');
    if (exportMenu) exportMenu.classList.remove('open');
  }
});

document.addEventListener('click', function (e) {
  var sidebar = document.getElementById('sidebar');
  if (sidebar && !sidebar.classList.contains('collapsed') && !e.target.closest('#sidebar') && !e.target.closest('#sidebarToggle') && window.innerWidth <= 600) {
    sidebar.classList.add('collapsed');
  }
});

var temaSalvo = localStorage.getItem('chatWebTheme');
if (temaSalvo) setTheme(temaSalvo);

var dicas = [
  'Pergunte algo...',
  'Traduza um texto...',
  'Resuma um artigo...',
  'Escreva um código...',
  'Explique um conceito...'
];
var dicaIndex = 0;
setInterval(function () {
  if (!conversando && !inputEl.value) {
    dicaIndex = (dicaIndex + 1) % dicas.length;
    inputEl.placeholder = dicas[dicaIndex];
  }
}, 5000);

carregarModelos();
if (typeof initSidebar === 'function') initSidebar();