# Setup — Instalação

> Guia para instalar o Hermes Remote do zero no homeserver.

## Requisitos

- Node.js ≥ 18 e npm
- Opcional: Tailscale (para acesso remoto), curl

## Passos

1. Clone o repositório:

   ```bash
   git clone https://github.com/hermes-remote/hermes-remote.git
   cd hermes-remote
   ```

2. Rode o instalador interativo:

   ```bash
   bash setup.sh
   ```

   O script detecta o ambiente (homeserver local vs máquina remota),
   detecta IPs Tailscale, gera o `.env` com defaults (sem sobrescrever),
   instala dependências (`npm install`), valida a conexão com o Hermes
   API server e inicia o servidor.

   Variantes:

   - `bash setup.sh --auto` — instala com defaults + prompts mínimos
   - `bash setup.sh --help` — mostra a ajuda

3. Preencha o `.env` com os valores reais (ver `reference/ENV_VARS.md`).

4. Confirme que o gateway está de pé:

   ```bash
   curl http://localhost:3000/api/health
   ```

## Após instalar

- O app fica em `http://localhost:3002` (local) ou no IP tailnet (remoto).
- Para publicar mudanças, use `bash deploy.sh` (ver `how-to/DEPLOY.md`).
