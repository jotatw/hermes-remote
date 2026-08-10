# index.html + style.css + app.js explicados

O projeto foi organizado em **3 arquivos** separados para facilitar a manutenção:

| Arquivo | Função | Linhas |
|---|---|---|
| `index.html` | Estrutura da página (HTML puro) | ~70 |
| `css/style.css` | Estilo visual (cores, layout, animações) | ~270 |
| `js/app.js` | Lógica do chat (JS puro) | ~230 |

## index.html — Estrutura da página

```
┌──────────────────────────────────────────────┐
│  Header                                       │
│  [Título]  [Modelo ▼] [☀️ ▼] [⏹Parar] [+Nova] │
├──────────────────────────────────────────────┤
│                                               │
│  Messages (área de mensagens)                 │
│  ┌───────────────────────────────┐            │
│  │   VOCÊ                        │            │
│  │   Qual é a capital do Brasil? │            │
│  │   14:30                       │            │
│  └───────────────────────────────┘            │
│  ┌───────────────────────────────┐            │
│  │ [📋] ASSISTENTE               │            │
│  │   A capital do Brasil é...    │            │
│  │   14:30                       │            │
│  └───────────────────────────────┘            │
│                                               │
├──────────────────────────────────────────────┤
│  Input area                                   │
│  [Digite sua mensagem...          ] [➤]      │
└──────────────────────────────────────────────┘
```

**Header** contém:
- Título "Chat Web"
- Seletor de modelo (carregado da 9Router)
- Seletor de tema (☀️ Claro, 🌙 Azul, 🖤 Preto, 🌫️ Cinza)
- Botão "Parar" (⏹), aparece só durante streaming
- Botão "+ Nova" para nova conversa

O HTML inclui `<link rel="stylesheet" href="css/style.css">` e `<script src="js/app.js">` — ambos carregados pelo `express.static` do servidor.

---

## css/style.css — Estilo visual

### Variáveis de tema (4 temas)

O CSS usa variáveis no `:root` com paletas diferentes para cada tema:

```css
/* Tema claro (padrão) */
:root {
  --bg: #f0f2f5;
  --surface: #ffffff;
  --user-msg: #0084ff;
  --accent: #0084ff;
}

/* Tema dark azul */
[data-theme="dark-blue"] {
  --bg: #1a1a2e;
  --surface: #16213e;
  --accent: #e94560;
}

/* Tema dark preto */
[data-theme="dark-black"] {
  --bg: #000000;
  --surface: #0d0d0d;
  --accent: #bb86fc;
}

/* Tema dark cinza */
[data-theme="dark-gray"] {
  --bg: #2a2a2a;
  --surface: #3a3a3a;
  --accent: #4a90e2;
}
```

**Para mudar as cores:** edite as variáveis `--bg`, `--surface`, `--user-msg`, `--bot-msg`, `--accent` em qualquer bloco de tema.

### Menu de temas

O seletor de temas é um menu dropdown com posicionamento absoluto:

```css
.theme-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  padding: 6px;
  display: none;          /* escondido por padrão */
  flex-direction: column;
  min-width: 140px;
  z-index: 10;
}

.theme-menu.open {
  display: flex;          /* aparece quando clica no botão */
}
```

### Responsividade

Layout adaptável para celular com `@media (max-width: 600px)`:
- Remove bordas arredondadas e margens
- Dropdown de modelos ocupa linha inteira
- Mensagens ocupam 90% da largura

### Animações

- `fadeIn` — mensagens aparecem com transição suave de 0.2s
- `.copy-btn opacity` — botão de copiar aparece ao passar mouse na bolha

---

## js/app.js — Lógica do chat

### Variáveis globais

| Variável | Tipo | Função |
|---|---|---|
| `conversando` | boolean | Controla se há requisição ativa |
| `modeloSelecionado` | string | Modelo atual selecionado no dropdown |
| `abortController` | AbortController | Permite cancelar requisição (botão Parar) |

### Funções principais

| Função | O que faz |
|---|---|
| `addMessage(role, content, isStreaming)` | Cria bolha (user/assistant) com timestamp + botão copiar |
| `updateMessageContent(div, content)` | Atualiza texto de uma bolha durante streaming |
| `setLoading(loading)` | Ativa/desativa input, botões e botão Parar |
| `enviarMensagem()` | Envia pergunta para servidor e lê resposta com streaming |
| `pararResposta()` | Cancela requisição em andamento via AbortController |
| `novaConversa()` | Limpa mensagens da tela |
| `carregarModelos()` | Busca modelos da 9Router e preenche dropdown |
| `handleKey(event)` | Captura Enter (com Shift para nova linha) |
| `setTheme(name)` | Aplica tema e salva no localStorage |
| `copiarTexto(btn)` | Copia conteúdo da resposta para área de transferência |

### Fluxo de enviarMensagem()

```
1. Valida: texto não vazio, modelo selecionado, não está conversando
2. Limpa input e cria bolha do usuário + bolha vazia do assistente
3. setLoading(true): desabilita input, mostra botão ⏹ Parar
4. Cria AbortController para permitir cancelamento
5. POST /api/chat com { model, messages, stream: true }
6. Lê resposta chunk por chunk via reader
7. Cada chunk: extrai delta.content, atualiza bolha do assistente
8. Quando data: [DONE]: remove indicador de streaming
9. Se erro: mostra mensagem de erro na bolha
10. setLoading(false): reabilita tudo, esconde botão Parar
```

### Tratamento de erros

- **Erro HTTP** (ex: 500): mostra erro retornado pelo servidor
- **Erro de conexão** (ex: servidor offline): mostra "Erro de conexão"
- **Resposta vazia**: mostra "(resposta vazia)"
- **AbortError** (usuário clicou Parar): ignora silenciosamente

### localStorage

| Chave | Valor | Função |
|---|---|---|
| `chatWebModel` | id do modelo | Restaura modelo selecionado |
| `chatWebTheme` | nome do tema | Restaura tema escolhido |

---

## Melhorias implementadas

| Funcionalidade | Arquivo | O que faz |
|---|---|---|
| 4 temas visuais | `style.css` + `app.js` | ☀️ Claro, 🌙 Azul, 🖤 Preto, 🌫️ Cinza |
| Timestamp | `app.js` | Mostra HH:MM nas mensagens |
| Copiar resposta | `app.js` | Botão 📋 com tooltip "Copiar resposta" |
| Auto-scroll suave | `app.js` | Rolagem animada pra última mensagem |
| Placeholder rotativo | `app.js` | Dicas mudam a cada 5s |
| Botão Parar | `index.html` + `app.js` | Cancela requisição em andamento |

## Para modificar a interface

| Se quiser | Onde mexer |
|---|---|
| Mudar cores de um tema | Edite as variáveis em `css/style.css` dentro do bloco do tema |
| Adicionar novo tema | Copie um bloco `[data-theme="..."]` no CSS + opção no menu em `index.html` |
| Mudar placeholder do input | Edite `placeholder` no `index.html` |
| Adicionar botão no header | Adicione o botão em `index.html` e a função em `js/app.js` |
| Mudar dicas do placeholder | Edite array `dicas` em `js/app.js` |