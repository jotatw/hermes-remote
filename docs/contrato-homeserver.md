# 🔌 Contrato de Backend — Homeserver

> O Hermes Remote **não é um servidor de infraestrutura** — ele **consome** comandos
> do seu servidor. Este documento define o **contrato**: o que o app espera do
> servidor para cada funcionalidade, e como plugar o **seu** servidor.

## Ideia central

O Hermes Remote executa **comandos** no servidor para obter dados (saúde, energia)
e disparar ações (diário, revisar, dormir, acordar). Cada comando é uma **variável
de ambiente** (`HS_*_CMD`) com um default razoável. Você sobrescreve conforme o
seu servidor — não precisa ter os scripts do autor.

```
Hermes Remote (server.js)
   │  executa (local se roda no homeserver, senão via SSH)
   ▼
HS_HEALTH_CMD  →  stdout com temperatura (ex.: "Temperatura: 52C")
HS_POWER_CMD   →  stdout JSON  { dorme: "22:00", acorda: "08:00" }
HS_DIARIO_CMD  →  gera o relatório de saúde
HS_REVIEW_CMD  →  dispara code review
HS_SLEEP_CMD   →  suspende o servidor
HS_WAKE_CMD    →  envia magic packet WOL
```

## Variáveis do contrato

| Variável | O que o comando deve fazer | Saída esperada |
|---|---|---|
| `HS_HEALTH_CMD` | Reportar saúde/temperatura | Texto com `NN C` ou `NN°C` (regex `(\d+)C`) |
| `HS_POWER_CMD` | Ler agendamento de energia | **JSON** (ver formato abaixo) |
| `HS_DIARIO_CMD` | Gerar o diário de saúde | Texto livre (exibido no app) |
| `HS_REVIEW_CMD` | Disparar code review | Exit 0 = ok |
| `HS_SLEEP_CMD` | Suspender o servidor | Exit 0 = ok |
| `HS_WAKE_CMD` | Acordar via WOL | Texto; contém "já está acordado" = já acordado |

## Formato do JSON de energia (HS_POWER_CMD)

O app espera JSON com pelo menos os campos:

```json
{
  "dorme": "22:00",
  "acorda": "08:00",
  "habilitado": true
}
```

Exemplo de script que gera isso:

```bash
#!/usr/bin/env bash
# power-status.sh — emite o agendamento de energia em JSON
echo '{"dorme": "22:00", "acorda": "08:00", "habilitado": true}'
```

## Como o app decide local vs SSH

| Onde o app roda | Comando executado |
|---|---|
| **No próprio homeserver** (hostname contém "homeserver") | `HS_*_CMD` direto (local) |
| **Em outra máquina** (notebook, desktop) | `ssh SSH_USER@HOMESERVER_IP 'HS_*_CMD'` |

O `HOMESERVER_SSH_USER` e o `HOMESERVER_IP` precisam estar no `.env` para o modo
remoto.

## Defaults (setup do autor — substitua pelos seus)

| Variável | Default |
|---|---|
| `HS_HEALTH_CMD` | `bash ${HOMESERVER_PATH}/scripts/health-check.sh 2>/dev/null` |
| `HS_POWER_CMD` | `sudo -n ${HOMESERVER_PATH}/core/hs.sh power status 2>/dev/null` |
| `HS_DIARIO_CMD` | `bash ${HOMESERVER_PATH}/scripts/health-check.sh 2>/dev/null` |
| `HS_REVIEW_CMD` | `nohup bash ${HOME}/.hermes/scripts/code-review.sh ... & echo "ok"` |
| `HS_SLEEP_CMD` | `sudo /usr/sbin/rtcwake -m mem -t $(date -d "tomorrow 08:00" +%s) ...` |
| `HS_WAKE_CMD` | `bash ${HOME}/.hermes/scripts/server-wol.sh 2>&1` |

> 💡 **Sem homeserver?** Não configure as vars — o app funciona no modo chat
> (dashboard mostra "servidor offline" e ações retornam erro amigável).

## Exemplo: plugar um servidor diferente

Se o seu servidor usa `systemctl` para energia e um script próprio de saúde:

```bash
# .env
HS_HEALTH_CMD=sudo /usr/local/bin/my-health.sh 2>/dev/null
HS_POWER_CMD=/usr/local/bin/schedule.sh --json
HS_SLEEP_CMD=sudo systemctl suspend
HS_WAKE_CMD=/usr/local/bin/wol.py --mac 00:11:22:33:44:55
```

Nenhuma mudança no código do Hermes Remote — só o `.env`.

## Verificar

Depois de configurar, teste cada endpoint:

```bash
curl http://localhost:3000/api/status      # servidor: uptime/ram/disco
curl http://localhost:3000/api/servidor    # temperatura + containers
curl http://localhost:3000/api/power       # JSON de energia
curl -X POST http://localhost:3000/api/acao/diario   # diário
```
