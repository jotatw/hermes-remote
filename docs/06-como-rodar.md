# Como Rodar o Projeto

## Pré-requisitos

- **Node.js** versão 18 ou superior
  - Para verificar se tem: `node --version`
  - Para instalar: https://nodejs.org (baixe a versão LTS)
- **9Router** rodando em http://localhost:20128
  - Para verificar: `curl http://localhost:20128/api/health`
  - Deve retornar: `{"ok":true}`

## Passo a passo

### 1. Entre na pasta do projeto

```bash
cd /home/usuario/IdeaProjects/hermes-remote
```

### 2. Configure o .env

Edite o arquivo `.env` com suas configurações:

```
NINEROUTER_URL=http://localhost:20128
NINEROUTER_KEY=sk-sua-chave-aqui
PORT=3000
```

- Se a 9Router não exigir chave: deixe `NINEROUTER_KEY` vazio
- Se quiser outra porta: mude `PORT`

### 3. Instale as dependências

```bash
npm install
```

Isso baixa as bibliotecas necessárias (express, cors, dotenv).

### 4. Inicie o servidor

```bash
npm start
```

Você verá:
```
Chat-web rodando em http://localhost:3000
Conectado a 9Router em http://localhost:20128
```

### 5. Abra no navegador

Acesse: http://localhost:3000

### 6. Use o chat

1. Selecione um modelo no dropdown
2. Digite uma mensagem
3. Pressione Enter ou clique no botão ➤
4. Veja a resposta aparecer em tempo real

## Para desenvolvimento (com reload automático)

```bash
npm run dev
```

O servidor reinicia automaticamente quando você altera server.js.

## Verificando se está tudo funcionando

### Testar o servidor
```bash
curl http://localhost:3000/api/health
```
Resposta esperada: `{"status":"ok"}`

### Testar modelos
```bash
curl http://localhost:3000/api/models
```
Resposta esperada: lista de modelos da 9Router

## Solução de problemas

| Problema | Causa provável | Solução |
|---|---|---|
| `ECONNREFUSED` | 9Router não está rodando | Inicie a 9Router |
| `fetch failed` | URL errada no .env | Verifique NINEROUTER_URL |
| 401 Unauthorized | Chave errada ou ausente | Verifique NINEROUTER_KEY |
| Página em branco | Porta ocupada | Mude PORT no .env |
| Modelos não carregam | 9Router sem modelos configurados | Verifique a 9Router |