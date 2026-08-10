# Sidebar, Conversas, Tarefas e Contexto (Fases 1, 2 e 3)

## Visão geral

A Fase 1 adicionou ao chat:
1. **Sidebar lateral** colapsável (botão ☰ no header)
2. **Múltiplas conversas** com CRUD completo (criar, renomear, trocar, excluir)
3. **Memória da IA** — o modelo agora recebe o histórico completo + contexto, em vez de só a última mensagem

A Fase 2 adicionou:
4. **Lista TODO** com 3 estados (○ pendente → ◐ em progresso → ☑ concluída)

A Fase 3 adicionou:
5. **Contexto global editável** — instruções que o assistente recebe como `system` message

## Estrutura visual

```
┌────────┬──────────────────────────────┐
│ ☰      │  Header (modelo, tema, +Nova) │
├────────┼──────────────────────────────┤
│ SIDEBAR│  Messages (chat)             │
│ 💬     │                               │
│  Conversas                            │
│  + Nova conversa   │                   │
│  📄 Conversa 1   │                   │
│  📄 Conversa 2   │                   │
│         │          │                   │
│ 📝     │          │                   │
│  Tarefas          │                   │
│  [input][➕]      │                   │
│  ○ Tarefa 1       │                   │
│  ◐ Tarefa 2       │                   │
│  ☑ Tarefa 3       │                   │
│  1/3 concluídas   │                   │
│         │          │                   │
│ ⚙️     │          │                   │
│  Contexto          │                   │
│  [textarea         │                   │
│   instruções...]   │                   │
│  [Salvar contexto] │                   │
├────────┴──────────────────────────────┤
│  [textarea...]              [➤]      │
└───────────────────────────────────────┘
```

## Arquivos alterados

| Arquivo | O que mudou |
|---|---|
| `index.html` | Botão ☰ + `<aside id="sidebar">` + seção Tarefas + `<div class="main">` |
| `css/style.css` | Layout flex com sidebar + estilos dos itens de conversa + estilos da lista TODO |
| `js/sidebar.js` | CRUD de conversas + persistência |
| `js/todos.js` | **NOVO** — lista TODO com 3 estados |
| `js/app.js` | Memória da IA, `exibirConversa`, `limparMensagens` |

## js/sidebar.js — CRUD de conversas

### Estrutura de dados (localStorage)

```js
chatWebData = {
  conversas: [
    {
      id: "c1710000000000",
      titulo: "Nova conversa",
      criadaEm: "2026-07-31T...",
      mensagens: [ { role, content, timestamp }, ... ],
      todos: []              // reservado para Fase 2 (TODO)
    }
  ],
  conversaAtivaId: "c1710000000000",
  contextoGlobal: ""         // reservado para Fase 3 (contexto)
}
```

### Funções

| Função | O que faz |
|---|---|
| `carregarDados()` | Lê do localStorage, retorna default se vazio |
| `salvarDados()` | Persiste tudo no localStorage |
| `gerarId()` | Gera id único baseado em `Date.now()` |
| `getConversaAtiva()` | Retorna a conversa ativa |
| `criarConversa()` | Cria nova conversa, ativa, limpa chat |
| `trocarConversa(id)` | Salva atual, carrega a escolhida |
| `renomearConversa(id)` | Usa `prompt()` para renomear |
| `excluirConversa(id)` | Confirma, remove. Se era a última, cria uma nova |
| `renderizarListaConversas()` | Redesenha a lista na sidebar |
| `initSidebar()` | Inicializa: cria conversa se não houver, renderiza |

### Fluxo de `initSidebar()`

```
1. Se não há conversa ativa → cria uma
2. Exibe a conversa ativa no chat
3. Renderiza a lista de conversas
4. Carrega contexto (Fase 3, hoje vazio)
```

## Memória da IA (app.js)

### Antes (sem memória)

```js
messages: [{ role: 'user', content: texto }]  // só a última mensagem
```

### Depois (com memória)

```js
messages: [
  ...(contexto ? [{ role: 'system', content: contexto }] : []),  // contexto (Fase 3)
  ...históricoCompleto,   // todas as mensagens anteriores
  { role: 'user', content: texto }  // nova mensagem
]
```

### Funções novas/changed em app.js

| Função | O que faz |
|---|---|
| `limparMensagens()` | Limpa o chat na tela (sem apagar dados) |
| `exibirConversa(conv)` | Renderiza as mensagens salvas de uma conversa |
| `montarMensagensParaEnvio()` | Monta array com contexto + histórico + nova mensagem |
| `carregarContexto()` | Retorna o contexto global (hoje vazio, Fase 3) |

### Como a mensagem é salva

1. Usuário digita → `conv.mensagens.push({role:'user', content, timestamp})`
2. IA responde → depois do streaming, `conv.mensagens.push({role:'assistant', content, timestamp})`
3. `salvarDados()` grava no localStorage
4. Na primeira resposta, a conversa ganha título automático (primeiras palavras da pergunta)

## Testes realizados (Fase 1)

- ☰ abre/fecha a sidebar
- Criar conversa aparece na lista
- Enviar mensagem → IA lembra do contexto anterior
- Trocar conversa → mensagens carregam corretamente
- Recarregar página → conversas persistem
- Excluir conversa → confirma e remove; se era a última, cria nova
- Renomear conversa → nome atualiza
- Contexto system entra no início do array de mensagens

---

## Fase 2 — Lista TODO

### js/todos.js — Lista de tarefas com 3 estados

Cada tarefa pertence a uma conversa (campo `todos` na estrutura de dados). Tarefas de conversas diferentes são independentes.

### Estrutura de dados

```js
conv.todos = [
  { id: "c1710000000000", texto: "Estudar JavaScript", estado: "pendente" }
]
```

### Estados (ciclo)

| Ícone | Estado | Clicar para |
|---|---|---|
| ○ | pendente | → em progresso |
| ◐ | em progresso | → concluída |
| ☑ | concluída | → pendente |

### Funções

| Função | O que faz |
|---|---|
| `getTodosDaConversa()` | Retorna os todos da conversa ativa |
| `adicionarTodo()` | Lê o input, adiciona tarefa pendente, salva |
| `alternarEstadoTodo(id)` | Avança para o próximo estado no ciclo |
| `excluirTodo(id)` | Remove a tarefa |
| `renderizarListaTodos()` | Redesenha a lista + contador (X/Y concluídas) |
| `initTodos()` | Liga o Enter do input, renderiza lista |

### Integração com conversas

- `initSidebar()` chama `initTodos()`
- `trocarConversa(id)` chama `renderizarListaTodos()` (cada conversa tem sua lista)
- `criarConversa()` chama `renderizarListaTodos()` (nova conversa começa vazia)

### Testes realizados (Fase 2)

- Adicionar tarefa → estado pendente, input limpo
- Ciclo de estados: pendente → em progresso → concluída → pendente
- Excluir tarefa
- Persistência no localStorage
- Independência: cada conversa tem sua própria lista

---

## Fase 3 — Contexto global editável

### Como funciona

O contexto é um texto único global (não por conversa) salvo em `dados.contextoGlobal`. Toda mensagem enviada inclui esse texto como primeira mensagem `system`.

```
Dados:
  contextoGlobal: "Sempre responda em português"

Envio:
  messages: [
    { role: 'system', content: 'Sempre responda em português' },
    { role: 'user', content: 'Olá!' },
    ...histórico...
  ]
```

### Exemplos de uso

- **Persona**: "Você é um professor de programação paciente"
- **Idioma**: "Sempre responda em português do Brasil"
- **Estilo**: "Seja direto, máximo 3 parágrafos"
- **Regras**: "Explique cada conceito como se eu fosse iniciante"

### Funções (app.js)

| Função | O que faz |
|---|---|
| `carregarContexto()` | Retorna o contexto salvo (usado na montagem das mensagens) |
| `exibirContexto()` | Preenche o textarea da sidebar com o contexto salvo |
| `salvarContexto()` | Lê o textarea, salva em `dados.contextoGlobal`, mostra "✓ Salvo!" |

### Fluxo

1. Usuário escreve instruções no textarea "⚙️ Contexto"
2. Clica em "Salvar contexto" → `salvarContexto()` grava no localStorage
3. Ao enviar mensagem, `montarMensagensParaEnvio()` coloca o contexto como `system` primeiro
4. Se o contexto estiver vazio, nenhuma mensagem system é enviada

### Testes realizados (Fase 3)

- Contexto vazio por padrão
- Salvar contexto → persiste no localStorage
- `montarMensagensParaEnvio` coloca system primeiro com o conteúdo correto
- `exibirContexto` restaura o texto no textarea
- Salvar vazio remove a mensagem system

---

## Fase 4 — Exportar conversa

### Como funciona

Botão "⬇ Exportar conversa" na sidebar (seção Conversas) abre um menu com 3 formatos:

| Formato | Extensão | Conteúdo |
|---|---|---|
| 📄 TXT | `.txt` | Texto simples legível |
| 📝 Markdown | `.md` | Cabeçalhos + formatação |
| 🧾 JSON | `.json` | Dados completos (mensagens, todos, contexto, modelo) |

### Funções (sidebar.js)

| Função | O que faz |
|---|---|
| `toggleExportMenu()` | Abre/fecha o menu de formatos |
| `exportarConversa(formato)` | Gera o conteúdo e dispara o download |

### O que o export inclui

- Título, modelo usado, data de criação
- Contexto global (se houver)
- Todas as mensagens com timestamp
- Todos (tarefas) — no JSON

### Download no navegador

```js
var blob = new Blob([conteudo], { type: tipoMime + ';charset=utf-8' });
var url = URL.createObjectURL(blob);
var a = document.createElement('a');
a.href = url;
a.download = nomeBase + '.' + extensao;
a.click();
```

## Fase 4 — Contador de tokens

- Durante o streaming, o último chunk pode conter `usage` (quantidade de tokens)
- Se retornar, aparece discretamente abaixo da resposta: `⚡ 12 in · 34 out · 46 tok`
- Se o modelo não retornar `usage`, nada é exibido (sem erro)
- Também salvo no histórico da conversa

---

## Nota importante: scripts no navegador compartilham escopo

Os arquivos `sidebar.js`, `todos.js` e `app.js` compartilham o mesmo escopo global no navegador. Isso significa que:
- `dados` (definido no sidebar.js) é acessível no app.js e todos.js
- Funções podem ser chamadas entre arquivos
- A ordem de carregamento é importante: `sidebar.js` → `todos.js` → `app.js` (app.js orquestra no final com `initSidebar()`)
