// ── Hermes Remote — View: Chat (v2) ────────────────────────────
// Renderiza a view Chat conforme mockup aprovado (mobile + desktop).
// Usa store (estado), api (dados), router (navegação).
// Independente dos globals do v1 (messagesEl, inputEl, sendBtn, modelSelect).
// Convenção: exporta ChatView com render(container), destroy(), refresh().

window.ChatView = (function () {
  'use strict';

  var _container = null;
  var _unsubs = [];
  var _conversando = false;
  var _abort = null;
  var _modelo = '';
  var _streaming = false;

  // ── Ícones (inline SVG — sprite será integrado depois) ────────
  function icon(name, cls) {
    var c = cls || 'icon';
    var paths = {
      send: '<path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/>',
      stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
      user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/>',
      assistant: '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="12" cy="12" r="3.5" fill="currentColor"/>',
    };
    return '<svg class="' + c + '" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      (paths[name] || paths.assistant) + '</svg>';
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── Modelos filtrados (mesmo critério do v1) ─────────────────
  function filtroModelo(m) {
    return m && m.id &&
      m.id.indexOf('image') === -1 && m.id.indexOf('tts') === -1 &&
      m.id.indexOf('embedding') === -1 && m.id.indexOf('stt') === -1 &&
      m.id !== 'undefined';
  }

  // ── Template da view ──────────────────────────────────────────
  function template() {
    return '' +
      '<div class="chat-messages" id="chatMessages"></div>' +
      '<div class="chat-input">' +
      '  <div class="chat-model-row">' +
      '    <select class="chat-model-select" id="chatModel" aria-label="Modelo"></select>' +
      '  </div>' +
      '  <div class="chat-input-row">' +
      '    <textarea id="chatInput" rows="1" placeholder="Digite sua mensagem..." aria-label="Mensagem"></textarea>' +
      '    <button class="stop-btn" id="chatStop" disabled>Parar</button>' +
      '    <button class="send-btn" id="chatSend" disabled aria-label="Enviar">' + icon('send') + '</button>' +
      '  </div>' +
      '</div>';
  }

  // ── Conversas (via store) ─────────────────────────────────────
  function getConversas() {
    return (store.get('conversas') || []);
  }

  function getConversaAtivaId() {
    return store.get('conversaAtivaId');
  }

  function getConversaAtiva() {
    var id = getConversaAtivaId();
    return getConversas().find(function (c) { return c.id === id; }) || null;
  }

  function salvarConversas(lista) {
    store.set('conversas', lista);
  }

  // ── Render ────────────────────────────────────────────────────
  function render(container) {
    _container = container;
    container.innerHTML = template();

    carregarModelos();
    exibirConversaAtiva();
    bindInput();
    bindStop();

    _unsubs.push(store.on('conversas', function () {
      if (_container && _container.isConnected) exibirConversaAtiva();
    }));

    // Usa o draft vindo da Home (Ask Hermes)
    var draft = store.get('draftMensagem');
    if (draft) {
      var input = document.getElementById('chatInput');
      if (input) input.value = draft;
      store.set('draftMensagem', '');
      if (input) input.focus();
    }
  }

  function destroy() {
    pararResposta();
    _unsubs.forEach(function (unsub) { unsub(); });
    _unsubs = [];
    _container = null;
  }

  function refresh() {
    carregarModelos();
    exibirConversaAtiva();
  }

  // ── Modelos ───────────────────────────────────────────────────
  function carregarModelos() {
    // Preenche os <select> de modelo (topbar e/ou onde houver)
    var selects = _container ? _container.querySelectorAll('.chat-model-select') : [];
    api.get('/api/models').then(function (data) {
      var modelos = (data.data || []).filter(filtroModelo);
      selects.forEach(function (sel) {
        sel.innerHTML = '<option value="">Selecione um modelo...</option>';
        modelos.forEach(function (m) {
          var opt = document.createElement('option');
          opt.value = m.id;
          opt.textContent = m.id + (m.owned_by ? ' (' + m.owned_by + ')' : '');
          sel.appendChild(opt);
        });
        var salvo = localStorage.getItem('chatWebModel');
        if (salvo && Array.from(sel.options).some(function (o) { return o.value === salvo; })) {
          sel.value = salvo;
        }
        _modelo = sel.value;
        atualizarBotoes();
      });
    }).catch(function () {
      selects.forEach(function (sel) {
        sel.innerHTML = '<option value="">Erro ao carregar modelos</option>';
      });
    });
  }

  // ── Mensagens ─────────────────────────────────────────────────
  function exibirConversaAtiva() {
    var el = document.getElementById('chatMessages');
    if (!el || !_container || !_container.isConnected) return;

    var conv = getConversaAtiva();
    if (!conv || !conv.mensagens || conv.mensagens.length === 0) {
      el.innerHTML = '<div class="chat-empty">' + icon('assistant') +
        '<b>Comece uma conversa</b>' +
        'Pergunte sobre o servidor, peça um resumo ou code review.<br>' +
        '<span class="dim">Ex: "Como está o servidor?"</span></div>';
      return;
    }

    el.innerHTML = '';
    conv.mensagens.forEach(function (msg) {
      el.appendChild(criarBolha(msg.role, msg.content, msg.timestamp || ''));
    });
    el.scrollTop = el.scrollHeight;
  }

  function criarBolha(role, content, timestamp) {
    var div = document.createElement('div');
    div.className = 'chat-msg ' + role;
    var avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.innerHTML = role === 'user' ? icon('user') : icon('assistant');
    var bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = content || '';
    div.appendChild(avatar);
    div.appendChild(bubble);
    return div;
  }

  function addMensagem(role, content, isStreaming) {
    var el = document.getElementById('chatMessages');
    if (!el) return null;
    var empty = el.querySelector('.chat-empty');
    if (empty) empty.remove();
    var div = criarBolha(role, content, '');
    if (isStreaming) div.querySelector('.bubble').classList.add('streaming');
    el.appendChild(div);
    el.scrollTop = el.scrollHeight;
    return div;
  }

  function updateBolha(div, content, final) {
    if (!div) return;
    var bubble = div.querySelector('.bubble');
    if (!bubble) return;
    if (final) {
      bubble.classList.remove('streaming');
      bubble.innerHTML = typeof renderMarkdown === 'function' ? renderMarkdown(content) : esc(content);
    } else {
      bubble.textContent = content;
    }
    var el = document.getElementById('chatMessages');
    if (el) el.scrollTop = el.scrollHeight;
  }

  // ── Input ─────────────────────────────────────────────────────
  function bindInput() {
    var input = document.getElementById('chatInput');
    var send = document.getElementById('chatSend');
    if (!input || !send) return;
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        enviar();
      }
    });
    input.addEventListener('input', function () {
      if (send) send.disabled = !input.value.trim() || _conversando || !_modelo;
    });
    send.addEventListener('click', enviar);

    // Modelo: mudança no select atualiza _modelo e habilita envio
    var modelSel = document.getElementById('chatModel');
    if (modelSel) {
      modelSel.addEventListener('change', function () {
        _modelo = modelSel.value;
        localStorage.setItem('chatWebModel', _modelo);
        atualizarBotoes();
      });
    }
  }

  function bindStop() {
    var stop = document.getElementById('chatStop');
    if (stop) stop.addEventListener('click', pararResposta);
  }

  function enviar() {
    if (_conversando) return;
    var input = document.getElementById('chatInput');
    if (!input) return;
    var texto = input.value.trim();
    if (!texto || !_modelo) return;

    input.value = '';
    addMensagem('user', texto);
    registrarMensagem(texto, 'user');

    var msgs = montarMensagens(texto);
    var bolha = addMensagem('assistant', '', true);
    setConversando(true);
    _abort = new AbortController();

    api.stream('/api/chat', { model: _modelo, messages: msgs, stream: true }, {
      signal: _abort.signal,
      onData: function (delta, total) { updateBolha(bolha, total, false); },
      onDone: function (total) {
        updateBolha(bolha, total, true);
        registrarMensagem(total, 'assistant');
        setConversando(false);
        _abort = null;
      },
      onError: function (err) {
        updateBolha(bolha, 'Erro: ' + (err.error || err.message || 'falhou'), true);
        setConversando(false);
        _abort = null;
      },
      onAbort: function () {
        updateBolha(bolha, '_Resposta interrompida_', true);
        setConversando(false);
        _abort = null;
      },
    });
  }

  function montarMensagens(texto) {
    var msgs = [];
    var contexto = store.get('contextoGlobal') || '';
    if (contexto) msgs.push({ role: 'system', content: contexto });
    var conv = getConversaAtiva();
    if (conv && conv.mensagens) {
      conv.mensagens.forEach(function (m) { msgs.push({ role: m.role, content: m.content }); });
    }
    msgs.push({ role: 'user', content: texto });
    return msgs;
  }

  function registrarMensagem(content, role) {
    var conv = getConversaAtiva();
    if (!conv) return;
    conv.mensagens = conv.mensagens || [];
    conv.mensagens.push({ role: role, content: content, timestamp: new Date().toISOString() });
    salvarConversas(getConversas());
  }

  function setConversando(v) {
    _conversando = v;
    atualizarBotoes();
  }

  function atualizarBotoes() {
    var input = document.getElementById('chatInput');
    var send = document.getElementById('chatSend');
    var stop = document.getElementById('chatStop');
    if (input) input.disabled = _conversando;
    if (send) send.disabled = _conversando || !input || !input.value.trim() || !_modelo;
    if (stop) stop.disabled = !_conversando;
  }

  function pararResposta() {
    if (_abort) {
      _abort.abort();
      _abort = null;
    }
    if (_streaming) {
      _streaming = false;
      setConversando(false);
    }
    setConversando(false);
  }

  // ── API pública ───────────────────────────────────────────────
  return {
    render: render,
    destroy: destroy,
    refresh: refresh,
    _test: { esc: esc, icon: icon, filtroModelo: filtroModelo },
  };

})();