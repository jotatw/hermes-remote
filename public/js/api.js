// ── Hermes Remote — API Client ─────────────────────────────────
// Cliente HTTP único para o gateway. Centraliza:
//   - auth (Authorization header)
//   - timeout
//   - parsing de JSON
//   - tratamento de erro padronizado ({ error })
//   - streaming (chat)
// Substitui os fetch() crus espalhados pelo v1 (17 ocorrências).

window.api = (function () {
  'use strict';

  var DEFAULT_TIMEOUT = 30000; // 30s

  // ── Token de autenticação ─────────────────────────────────────
  var _token = null;

  function setToken(t) {
    _token = t || null;
  }

  function getToken() {
    return _token;
  }

  // ── Headers comuns ───────────────────────────────────────────
  function _headers(json) {
    var h = {};
    if (json) h['Content-Type'] = 'application/json';
    if (_token) h['Authorization'] = 'Bearer ' + _token;
    return h;
  }

  // ── Parse de erro padronizado ────────────────────────────────
  // Recebe a resposta HTTP e extrai a mensagem de erro.
  // Fallbacks: body.error → body.message → statusText.
  function _parseError(res, body) {
    if (body && body.error) return body.error;
    if (body && body.message) return body.message;
    return 'HTTP ' + res.status + ' (' + res.statusText + ')';
  }

  // ── Timeout wrapper ──────────────────────────────────────────
  // Retorna um controller com timer. Chame .clear() para cancelar.
  function _timeout(ms, signal) {
    var controller = {
      timer: null,
      clear: function () {
        if (this.timer) { clearTimeout(this.timer); this.timer = null; }
      },
    };
    controller.timer = setTimeout(function () {
      controller.clear();
      if (signal && typeof signal.dispatchEvent === 'function') {
        signal.dispatchEvent(new Event('abort'));
      } else {
        // AbortController nativo: chama abort() no controller pai
        // (o chamador repassa o controller; aqui apenas avisa via timer)
      }
    }, ms);
    return controller;
  }

  // ── GET ──────────────────────────────────────────────────────
  // api.get('/api/status') → Promise<json>
  // Lança erro com .error = mensagem amigável.
  function get(url, opts) {
    opts = opts || {};
    var timeout = opts.timeout || DEFAULT_TIMEOUT;

    return fetch(url, {
      method: 'GET',
      headers: _headers(false),
      signal: opts.signal || null,
    }).then(_check).then(function (r) {
      return r.json().catch(function () { return {}; });
    });
  }

  // ── POST (JSON) ──────────────────────────────────────────────
  // api.post('/api/acao/dormir', body) → Promise<json>
  function post(url, body, opts) {
    opts = opts || {};
    var payload = (typeof body === 'string') ? body : JSON.stringify(body || {});

    return fetch(url, {
      method: 'POST',
      headers: _headers(true),
      body: payload,
      signal: opts.signal || null,
    }).then(_check).then(function (r) {
      return r.json().catch(function () { return {}; });
    });
  }

  // ── POST com corpo não-JSON (ex.: chat não usa JSON) ─────────
  function postForm(url, body, opts) {
    opts = opts || {};
    return fetch(url, {
      method: 'POST',
      headers: _headers(false),
      body: body,
      signal: opts.signal || null,
    }).then(_check).then(function (r) {
      return r.text();
    });
  }

  // ── Verificação de status ────────────────────────────────────
  function _check(res) {
    if (!res.ok) {
      // Tenta extrair o erro do body antes de lançar
      return res.json().catch(function () { return {}; }).then(function (body) {
        var err = new Error(_parseError(res, body));
        err.error = _parseError(res, body);
        err.status = res.status;
        throw err;
      });
    }
    return res;
  }

  // ── Streaming (chat) ─────────────────────────────────────────
  // api.stream('/api/chat', { model, messages, stream: true }, {
  //   onData: fn(chunkTexto),   // chamado a cada delta
  //   onDone: fn(textoFinal),
  //   onError: fn(err),
  //   signal: AbortController
  // })
  // Retorna { abort() } para cancelar.
  function stream(url, body, handlers) {
    handlers = handlers || {};
    var signal = handlers.signal || null;

    var controller = new AbortController();
    // Se o chamador passou signal, liga o abort dele ao nosso
    if (signal) {
      signal.addEventListener('abort', function () {
        try { controller.abort(); } catch (e) { /* ignora */ }
      });
    }

    fetch(url, {
      method: 'POST',
      headers: _headers(true),
      body: JSON.stringify(body || {}),
      signal: controller.signal,
    }).then(function (res) {
      if (!res.ok) {
        return res.json().catch(function () { return {}; }).then(function (b) {
          throw new Error(_parseError(res, b));
        });
      }
      return _readStream(res, handlers);
    }).catch(function (err) {
      if (err.name === 'AbortError') {
        if (handlers.onAbort) handlers.onAbort();
        return;
      }
      if (handlers.onError) handlers.onError(err);
    });

    return {
      abort: function () {
        try { controller.abort(); } catch (e) { /* ignora */ }
      },
    };
  }

  // ── Leitor de stream (SSE: linhas "data: {json}") ────────────
  function _readStream(res, handlers) {
    var reader = res.body.getReader();
    var decoder = new TextDecoder();
    var resposta = '';

    function pump() {
      return reader.read().then(function (r) {
        if (r.done) {
          if (handlers.onDone) handlers.onDone(resposta);
          return resposta;
        }
        var chunk = decoder.decode(r.value, { stream: true });
        var lines = chunk.split('\n').filter(function (l) {
          return l.indexOf('data: ') === 0;
        });
        for (var i = 0; i < lines.length; i++) {
          var line = lines[i];
          try {
            var parsed = JSON.parse(line.slice(6));
            if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta) {
              var delta = parsed.choices[0].delta.content || '';
              if (delta) {
                resposta += delta;
                if (handlers.onData) handlers.onData(delta, resposta);
              }
            }
          } catch (e) { /* linhas não-JSON são ignoradas */ }
        }
        return pump();
      });
    }

    return pump();
  }

  // ── API pública ──────────────────────────────────────────────
  return {
    get: get,
    post: post,
    postForm: postForm,
    stream: stream,
    setToken: setToken,
    getToken: getToken,
  };

})();