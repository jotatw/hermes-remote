# Glossário

Termos técnicos usados no projeto, explicados de forma simples.

---

### API (Application Programming Interface)
Interface que programas usam para conversar entre si. É como um garçom: você (o programa) pede algo, a API leva o pedido para a cozinha (outro programa) e traz a resposta.

### Backend
A parte do sistema que roda no servidor (não visível para o usuário). No nosso caso: server.js e a 9Router.

### CORS (Cross-Origin Resource Sharing)
Mecanismo de segurança do navegador que bloqueia requisições para domínios diferentes. Ex: sua página em localhost:3000 não pode consultar diretamente localhost:20128. O servidor proxy resolve isso.

### Endpoint
Uma URL específica que faz uma ação. Ex: `/api/models` retorna a lista de modelos. Cada endpoint é como uma "porta" diferente para uma funcionalidade.

### Express
Biblioteca do Node.js para criar servidores web de forma simples. É o que usamos no server.js.

### fetch
Função do JavaScript para fazer requisições HTTP. Permite buscar dados de APIs ou enviar informações.

### Frontend
A parte do sistema que roda no navegador (visível para o usuário). No nosso caso: index.html (HTML + CSS + JavaScript).

### Gateway
Ponto de entrada que centraliza e encaminha requisições para vários destinos. A 9Router é um gateway de IA: você manda uma requisição para ela, e ela decide para qual modelo enviar.

### JSON (JavaScript Object Notation)
Formato de texto para representar dados estruturados. Ex: `{"nome": "João", "idade": 30}`. É o formato usado para comunicação entre frontend e backend.

### Middleware
Função no Express que processa requisições antes delas chegarem ao destino final. Ex: cors(), express.json().

### Modelo de IA
Programa treinado para realizar tarefas de inteligência artificial. Ex: GPT-5, Claude, Llama. No chat, você escolhe qual modelo quer usar.

### Node.js
Ambiente que permite rodar JavaScript no servidor (fora do navegador). É o que usamos para criar o server.js.

### npm (Node Package Manager)
Gerenciador de pacotes do Node.js. Com `npm install` você baixa bibliotecas que outras pessoas criaram (express, cors, etc.).

### Proxy
Intermediário que recebe uma requisição e encaminha para outro destino. O server.js é um proxy: recebe do frontend e encaminha para a 9Router.

### Porta
"Janela" numérica que um programa usa para se comunicar na rede. Ex: 3000 (chat-web), 20128 (9Router), 80 (HTTP padrão).

### SSE (Server-Sent Events)
Tecnologia que permite ao servidor enviar dados para o navegador aos poucos, em tempo real. Usamos para streaming das respostas.

### Streaming
Técnica onde os dados são enviados em pedaços conforme são gerados, em vez de esperar tudo ficar pronto. No chat, a resposta aparece palavra por palavra.

### Variável de ambiente
Valor configurado fora do código, geralmente em um arquivo .env. Usado para guardar informações sensíveis como chaves de API.

### require
Função do Node.js para importar bibliotecas. Ex: `const express = require('express')`.

### try/catch
Estrutura do JavaScript para capturar e tratar erros. O código "perigoso" vai no `try`, e se algo der errado, o `catch` executa.

### async/await
Palavras-chave do JavaScript para trabalhar com operações demoradas (como buscar dados na internet) sem travar o programa.

---
*Este glossário vai crescer conforme você adicionar mais funcionalidades.*