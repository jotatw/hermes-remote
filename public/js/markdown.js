// ── Markdown leve — renderiza markdown como HTML (sem XSS) ─────
// Suporta: títulos, negrito, itálico, código inline, blocos de código,
// links, listas (ordenadas e não-ordenadas), blocos de citação, hr, quebras.
// Escapa HTML primeiro e depois aplica markdown com segurança.

function escapeHtml(texto) {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderInline(texto) {
  var t = escapeHtml(texto);

  // Código inline: `code`
  t = t.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Negrito: **texto** ou __texto__
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/__([^_]+)__/g, '<strong>$1</strong>');

  // Itálico: *texto* ou _texto_ (não pega markdown já convertido)
  t = t.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  t = t.replace(/(^|[^_])_([^_\n]+)_/g, '$1<em>$2</em>');

  // Links: [texto](url)
  t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (m, texto, url) {
    var safe = url.replace(/"/g, '');
    // só permite http(s) e mailto para segurança
    if (/^(https?:\/\/|mailto:)/i.test(safe)) {
      return '<a href="' + safe + '" target="_blank" rel="noopener noreferrer">' + texto + '</a>';
    }
    return texto;
  });

  return t;
}

function renderMarkdown(md) {
  if (!md) return '';

  var linhas = md.replace(/\r\n/g, '\n').split('\n');
  var html = '';
  var i = 0;
  var emLista = false;
  var listaTipo = '';
  var emBloco = false;
  var emCita = false;

  function fecharLista() {
    if (emLista) { html += '</' + listaTipo + '>'; emLista = false; }
  }
  function fecharBloco() {
    if (emBloco) { html += '</code></pre>'; emBloco = false; }
  }
  function fecharCita() {
    if (emCita) { html += '</blockquote>'; emCita = false; }
  }

  while (i < linhas.length) {
    var linha = linhas[i];

    // Bloco de código
    if (/^```/.test(linha)) {
      fecharLista(); fecharCita();
      if (emBloco) { fecharBloco(); }
      else { html += '<pre><code>'; emBloco = true; }
      i++;
      continue;
    }
    if (emBloco) {
      html += escapeHtml(linha) + '\n';
      i++;
      continue;
    }

    // Títulos
    var h = /^(#{1,6})\s+(.*)/.exec(linha);
    if (h) {
      fecharLista(); fecharCita();
      var nivel = h[1].length;
      html += '<h' + nivel + '>' + renderInline(h[2]) + '</h' + nivel + '>';
      i++;
      continue;
    }

    // Bloco de citação
    if (/^&gt;\s?/.test(escapeHtml(linha).slice(0, 6)) || /^>\s?/.test(linha)) {
      fecharLista();
      var limpa = linha.replace(/^>\s?/, '');
      if (!emCita) { html += '<blockquote>'; emCita = true; }
      html += renderInline(limpa) + '<br>';
      i++;
      continue;
    }

    // Linha separadora
    if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(linha)) {
      fecharLista(); fecharCita();
      html += '<hr>';
      i++;
      continue;
    }

    // Lista não-ordenada
    if (/^\s*[-*+]\s+/.test(linha)) {
      fecharCita();
      if (!emLista || listaTipo !== 'ul') {
        fecharLista();
        html += '<ul>';
        emLista = true; listaTipo = 'ul';
      }
      var item = linha.replace(/^\s*[-*+]\s+/, '');
      html += '<li>' + renderInline(item) + '</li>';
      i++;
      continue;
    }

    // Lista ordenada
    if (/^\s*\d+[.)]\s+/.test(linha)) {
      fecharCita();
      if (!emLista || listaTipo !== 'ol') {
        fecharLista();
        html += '<ol>';
        emLista = true; listaTipo = 'ol';
      }
      var itemO = linha.replace(/^\s*\d+[.)]\s+/, '');
      html += '<li>' + renderInline(itemO) + '</li>';
      i++;
      continue;
    }

    // Linha vazia
    if (/^\s*$/.test(linha)) {
      fecharLista(); fecharCita();
      html += '<br>';
      i++;
      continue;
    }

    // Parágrafo normal
    fecharLista(); fecharCita();
    html += '<p>' + renderInline(linha) + '</p>';
    i++;
  }

  fecharLista(); fecharBloco(); fecharCita();
  return html;
}