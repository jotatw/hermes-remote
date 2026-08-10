# Melhorias Implementadas e Futuras

## Já implementadas

### Versão inicial (2026-07-31)
- Chat com streaming em tempo real
- Seletor de modelos (carregado da 9Router)
- Modelos persistidos no localStorage

### Melhorias fáceis (2026-07-31)
| # | Melhoria | Status |
|---|---|---|
| 1 | Dark mode (botão 🌙/☀️) | OK |
| 2 | Timestamp nas mensagens | OK |
| 3 | Botão copiar resposta | OK |
| 4 | Auto-scroll suave | OK |
| 5 | Placeholder rotativo | OK |

### Refatoração + temas múltiplos (2026-07-31)
| # | Melhoria | Status |
|---|---|---|
| 6 | Refatoração: separar HTML/CSS/JS em 3 arquivos | OK |
| 7 | 4 temas visuais (☀️ Claro, 🌙 Azul, 🖤 Preto, 🌫️ Cinza) | OK |
| 8 | Botão ⏹ Parar (AbortController) | OK |
| 9 | Documentação atualizada | OK |

### Fase 1 — Sidebar e conversas (2026-07-31)
| # | Melhoria | Status |
|---|---|---|
| 10 | Sidebar lateral colapsável (botão ☰) | OK |
| 11 | Múltiplas conversas com CRUD (criar, renomear, trocar, excluir) | OK |
| 12 | **Memória da IA** (envia histórico completo + contexto system) | OK |
| 13 | Título automático da conversa (primeiras palavras da pergunta) | OK |
| 14 | Persistência das conversas no localStorage | OK |

### Fase 2 — Lista TODO (2026-07-31)
| # | Melhoria | Status |
|---|---|---|
| 15 | Lista TODO com 3 estados (○ pendente / ◐ em progresso / ☑ concluída) | OK |
| 16 | Input + contador (X/Y concluídas) na sidebar | OK |
| 17 | Tarefas independentes por conversa | OK |
| 18 | Persistência no localStorage | OK |

### Fase 3 — Contexto global (2026-07-31)
| # | Melhoria | Status |
|---|---|---|
| 19 | Textarea de contexto na sidebar | OK |
| 20 | Contexto enviado como mensagem `system` | OK |
| 21 | Botão "Salvar contexto" com feedback visual | OK |
| 22 | Persistência no localStorage | OK |

### Qualidade + Interface + Deploy (2026-07-31)
| # | Melhoria | Status |
|---|---|---|
| 23 | Timestamp com data (31/07 12:30) | OK |
| 24 | Helper criarBolha (elimina duplicação) | OK |
| 25 | Tela cheia (sem max-height/margem) | OK |
| 26 | Header reordenado (☰ título modelo ⏹ +Nova 🌙) | OK |
| 27 | Fechar sidebar clicando fora (mobile) | OK |
| 28 | Troca de conversa travada durante streaming | OK |
| 29 | Deploy com PM2 (docs/11-deploy.md) | OK |

### Fase 4 — Extras (2026-07-31)
| # | Melhoria | Status |
|---|---|---|
| 30 | Exportar conversa (TXT/MD/JSON) | OK |
| 31 | Modelo usado salvo por conversa | OK |
| 32 | Contador de tokens discreto (se 9Router retornar usage) | OK |

## Próximas (planejadas)

### Nível médio
- [ ] Página separada para contexto (mais espaço de edição)
- [ ] Busca textual dentro das conversas (memórias pesquisáveis)

### Nível difícil
- [ ] **SQLite para persistência no servidor**
- [ ] Migrar de localStorage para banco (conversas, todos, contexto)
- [ ] Autenticação simples
- [ ] Upload de arquivos (se modelo suportar)
- [ ] Resposta em voz (TTS)
- [ ] Backup/restauração dos dados exportados

## Sobre o próximo passo (SQLite)

A ideia é criar um "contexto global" que toda conversa nova herda automaticamente.

```
Contexto Global (system prompt)
  ↓
Conversa A → usa contexto + mensagens próprias
Conversa B → usa contexto + mensagens próprias
```

Exemplo de uso:
- Definir persona do assistente: "Você é um professor de programação"
- Definir idioma: "Sempre responda em português"
- Definir regras: "Seja direto, máximo 3 parágrafos"

### Como funcionaria na prática

1. Botão "⚙️ Contexto" no header
2. Abre um modal com textarea
3. Usuário escreve o contexto global
4. É salvo no servidor (SQLite) ou localStorage
5. Toda mensagem enviada inclui esse contexto como `system` message

### Estrutura de dados (futura)

```sql
CREATE TABLE config (
  chave TEXT PRIMARY KEY,
  valor TEXT
);

CREATE TABLE conversas (
  id INTEGER PRIMARY KEY,
  nome TEXT,
  criada_em TIMESTAMP
);

CREATE TABLE mensagens (
  id INTEGER PRIMARY KEY,
  conversa_id INTEGER,
  role TEXT,
  content TEXT,
  timestamp TIMESTAMP,
  FOREIGN KEY (conversa_id) REFERENCES conversas(id)
);
```

A tabela `config` guardaria o `contexto_global` que toda conversa usa no início.

### Dependências que serão adicionadas

- `better-sqlite3` — driver SQLite síncrono, sem callback
- (ou) `sqlite3` — driver assíncrono, mais tradicional

### Arquivos novos previstos

```
chat-web/
├── database.js          # conexão e queries SQLite
├── data/
│   └── chat.db          # arquivo do banco (criado automaticamente)
├── server.js            # ganha endpoints pra contexto e conversas
└── js/
    └── context.js       # (futuro) lógica do contexto no frontend
```