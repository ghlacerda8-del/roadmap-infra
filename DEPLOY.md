# Deploy — Cloudflare Pages + Fly.io

Guia passo a passo da infra profissional do Roadmap Infra.

```
Frontend (estatico) ──> Cloudflare Pages   https://roadmap-infra.pages.dev
Backend  (FastAPI)  ──> Fly.io             https://roadmap-infra-api.fly.dev
Banco               ──> Supabase
E-mail              ──> Resend
```

---

## 1. Frontend — Cloudflare Pages

### 1.1 Conectar o repositorio

1. Acesse https://dash.cloudflare.com -> **Workers & Pages** -> **Create** -> **Pages** -> **Connect to Git**.
2. Autorize o GitHub e selecione `ghlacerda8-del/roadmap-infra`.
3. Configure o build:

| Campo | Valor |
|---|---|
| Project name | `roadmap-infra` |
| Production branch | `main` |
| Framework preset | `None` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` |

> O script `npm run build` (ver `package.json`) copia apenas `index.html`, `css/`, `js/`, `docs/`, `_headers` e `_redirects` para `dist/` — assim o codigo do `roadmap-backend/` nao e exposto no CDN.

4. **Save and Deploy**. O primeiro build leva ~30s. URL final: `https://roadmap-infra.pages.dev`.

### 1.2 Verificar headers de seguranca

Apos o deploy, rode:

```bash
curl -sI https://roadmap-infra.pages.dev | grep -iE 'strict-transport|content-security|x-frame|x-content-type|referrer|permissions'
```

Deve retornar:
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `Content-Security-Policy: default-src 'self'; ...`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: ...`

Teste tambem em: https://securityheaders.com/?q=roadmap-infra.pages.dev — meta: nota A ou A+.

### 1.3 URLs limpas

O routing foi migrado de `/#curriculo` para `/curriculo`. As rotas validas (`progresso`, `semana`, `checklist`, `roadmap`, `cronograma`, `curriculo`, `admin`) estao configuradas em `_redirects` com SPA fallback.

Compatibilidade retroativa: links antigos com `#hash` ainda funcionam (`js/init.js -> restorePageFromPath`).

### 1.4 Dominio proprio (quando comprar)

1. No painel do projeto Pages: **Custom domains** -> **Set up a custom domain**.
2. Adicione `gustavolacerda.dev` (ou o que escolher) e siga o assistente de DNS.
3. Cloudflare emite TLS automaticamente (Let's Encrypt).
4. Atualize `_redirects` para redirecionar `roadmap-infra.pages.dev` -> dominio novo (opcional).
5. Atualize `ALLOWED_ORIGINS` no Fly.io (secao 2.4).

---

## 2. Backend — Fly.io

### 2.1 Instalar o flyctl

```bash
curl -L https://fly.io/install.sh | sh
fly auth login
```

### 2.2 Provisionar o app

```bash
cd roadmap-backend/backend
fly launch --no-deploy --copy-config --name roadmap-infra-api --region gru
```

> O `fly.toml` ja esta versionado com a config correta. O comando acima apenas cria o app no painel do Fly.io.

### 2.3 Configurar segredos

Nunca commite valores reais. Use `fly secrets set`:

```bash
fly secrets set \
  SUPABASE_URL="https://hxosxvuiqugzgnwrvaxz.supabase.co" \
  SUPABASE_KEY="<service_role_key>" \
  RESEND_API_KEY="re_..." \
  FROM_EMAIL="Roadmap Infra <onboarding@resend.dev>" \
  INTERNAL_TOKEN="<token_aleatorio_forte>" \
  ADMIN_EMAIL="ghlacerda8@gmail.com" \
  ADMIN_CPF="<cpf>" \
  ADMIN_NOME="Gustavo" \
  FRONTEND_URL="https://roadmap-infra.pages.dev" \
  ALLOWED_ORIGINS="https://roadmap-infra.pages.dev,https://ghlacerda8-del.github.io" \
  ALLOWED_ORIGIN_REGEX='^https://([a-z0-9-]+\.)?roadmap-infra\.pages\.dev$' \
  TOTAL_TASKS="59"
```

### 2.4 Deploy

```bash
fly deploy
```

Acompanhe os logs: `fly logs`. Health check: `curl https://roadmap-infra-api.fly.dev/health`.

### 2.5 APScheduler — atencao a escala

O `APScheduler` roda **dentro do processo**. Para garantir que e-mails nao sejam enviados em duplicidade:

- `min_machines_running = 1` (ja configurado em `fly.toml`)
- **Nao escalar acima de 1 maquina** sem migrar para cron externo:
  ```bash
  fly scale count 1
  ```

Para cargas maiores no futuro, migrar APScheduler -> Cloudflare Cron Triggers (chamando `/send-reminder` e `/send-weekly` via HTTP).

---

## 3. CI/CD

### Frontend
Cloudflare Pages faz deploy automatico em todo push:
- `main` -> producao (`roadmap-infra.pages.dev`)
- Outras branches -> preview URL unica (`<branch>.roadmap-infra.pages.dev`)

### Backend
Fly.io aceita deploy via GitHub Actions. Sugestao (criar `.github/workflows/fly-deploy.yml`):

```yaml
name: Deploy backend to Fly.io
on:
  push:
    branches: [main]
    paths: ['roadmap-backend/backend/**']
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only
        working-directory: roadmap-backend/backend
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

Gere o token: `fly tokens create deploy` e adicione em **GitHub -> Settings -> Secrets -> Actions** como `FLY_API_TOKEN`.

---

## 4. Checklist pos-deploy

- [ ] `https://roadmap-infra.pages.dev` carrega
- [ ] `securityheaders.com` retorna nota >= A
- [ ] `https://roadmap-infra-api.fly.dev/health` retorna `{"status": "online"}`
- [ ] Login admin funciona no novo dominio
- [ ] Login visitante funciona
- [ ] CORS sem erro no console (Supabase + backend)
- [ ] Lembrete diario chega no e-mail (testar via `POST /send-reminder` com `Authorization: Bearer <INTERNAL_TOKEN>`)
- [ ] URLs limpas funcionam (`/curriculo` e nao `/#curriculo`)
- [ ] Refresh em `/curriculo` mantem a pagina (SPA fallback)
- [ ] Botao voltar do navegador funciona

---

## 5. Rollback

### Frontend
Cloudflare Pages mantem todos os deploys. **Pages -> Deployments** -> selecione um deploy anterior -> **Rollback to this deployment**.

### Backend
```bash
fly releases
fly deploy --image <image-do-release-anterior>
```
