const ESTADOS_TODO = ['pendente', 'em-progresso', 'feito'];

const ICONES_TODO = {
  'pendente': '○',
  'em-progresso': '◐',
  'feito': '☑'
};

function getTodosDaConversa() {
  const conv = getConversaAtiva();
  if (!conv) return [];
  if (!Array.isArray(conv.todos)) conv.todos = [];
  return conv.todos;
}

function proximoEstadoTodo(estadoAtual) {
  const idx = ESTADOS_TODO.indexOf(estadoAtual);
  if (idx === -1) return 'pendente';
  return ESTADOS_TODO[(idx + 1) % ESTADOS_TODO.length];
}

function adicionarTodo() {
  const input = document.getElementById('todoInput');
  const texto = input.value.trim();
  if (!texto) return;

  const conv = getConversaAtiva();
  if (!conv) return;
  if (!Array.isArray(conv.todos)) conv.todos = [];

  conv.todos.push({
    id: gerarId(),
    texto: texto,
    estado: 'pendente'
  });

  salvarDados();
  renderizarListaTodos();
  input.value = '';
  input.focus();
}

function alternarEstadoTodo(id) {
  const todos = getTodosDaConversa();
  const todo = todos.find(function (t) { return t.id === id; });
  if (!todo) return;
  todo.estado = proximoEstadoTodo(todo.estado);
  salvarDados();
  renderizarListaTodos();
}

function excluirTodo(id) {
  const conv = getConversaAtiva();
  if (!conv) return;
  conv.todos = (conv.todos || []).filter(function (t) { return t.id !== id; });
  salvarDados();
  renderizarListaTodos();
}

function renderizarListaTodos() {
  const lista = document.getElementById('listaTodos');
  const contador = document.getElementById('todoContador');
  const todos = getTodosDaConversa();

  lista.innerHTML = '';

  if (todos.length === 0) {
    contador.textContent = 'Nenhuma tarefa ainda.';
    return;
  }

  const feitos = todos.filter(function (t) { return t.estado === 'feito'; }).length;
  contador.textContent = feitos + '/' + todos.length + ' concluída' + (feitos === 1 ? '' : 's');

  todos.forEach(function (todo) {
    const li = document.createElement('li');
    li.className = 'todo-item';
    li.title = 'Estado: ' + todo.estado + ' (clique para alternar)';

    const icone = document.createElement('span');
    icone.className = 'todo-icone';
    icone.textContent = ICONES_TODO[todo.estado] || '○';
    icone.onclick = function () { alternarEstadoTodo(todo.id); };

    const texto = document.createElement('span');
    texto.className = 'todo-texto' + (todo.estado === 'feito' ? ' feito' : '');
    texto.textContent = todo.texto;
    texto.onclick = function () { alternarEstadoTodo(todo.id); };

    const excluir = document.createElement('button');
    excluir.className = 'todo-excluir';
    excluir.textContent = '✕';
    excluir.title = 'Excluir tarefa';
    excluir.onclick = function () { excluirTodo(todo.id); };

    li.appendChild(icone);
    li.appendChild(texto);
    li.appendChild(excluir);
    lista.appendChild(li);
  });
}

function initTodos() {
  renderizarListaTodos();
  const input = document.getElementById('todoInput');
  if (input) {
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        adicionarTodo();
      }
    });
  }
}