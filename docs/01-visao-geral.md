# Visão Geral

## O que é este projeto?

É uma página web que funciona como um chat para conversar com modelos de Inteligência Artificial. Você digita uma pergunta e recebe uma resposta em tempo real — igual ao ChatGPT, mas usando a 9Router como intermediário.

## Para que serve?

- Conversar com modelos de IA (GPT, Claude, etc.) sem precisar de chave direta de cada provedor
- Testar diferentes modelos de IA em uma interface bonita e simples
- Aprender como frontend e backend se comunicam

## Tecnologias usadas

| Tecnologia | Função |
|---|---|
| HTML | Estrutura da página (o que aparece na tela) |
| CSS | Estilo visual (cores, tamanhos, posições) |
| JavaScript | Lógica do chat (enviar mensagem, receber resposta) |
| Node.js + Express | Servidor que faz a ponte entre o navegador e a 9Router |
| 9Router | Gateway de IA que conecta a vários modelos |

## Como os componentes se encaixam

```
Navegador (index.html)
    ↓ envia mensagem
Servidor (server.js) - porta 3000
    ↓ encaminha com chave secreta
9Router - porta 20128
    ↓ encaminha para o modelo escolhido
Modelo de IA (GPT, Claude, etc.)
    ↓ resposta volta pelo mesmo caminho
Navegador exibe a resposta
```

## Por que existe um servidor no meio?

1. **Segurança**: a chave de API da 9Router fica no servidor, o navegador nunca a vê
2. **CORS**: navegadores bloqueiam requisições para domínios diferentes. O servidor resolve isso.
3. **Flexibilidade**: podemos mudar a lógica do backend sem mexer no frontend

## Pré-requisitos

- Node.js instalado (versão 18 ou superior)
- 9Router rodando em http://localhost:20128
- Uma chave de API da 9Router (se autenticação estiver ativada)