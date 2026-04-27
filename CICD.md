# CI/CD — Roadmap Infra

Documentação do pipeline de deploy e operações do projeto.

---

## 1. Arquitetura atual

```
┌─────────────────────────────────────────────────────────┐
│                     USUÁRIO (browser)                   │
└───────────────┬─────────────────────┬───────────────────┘
                │                     │
                ▼                     ▼
   ┌──────────────────────┐   ┌──────────────────────┐
   │  Cloudflare Pages    │   │  Fly.io (FastAPI)    │
   │  (frontend estatico) │   │  Docker · região GRU │
   │  CDN · CSP · HSTS    │   │  Python 3.12         │
   └──────────────────────┘   └──────────┬───────────┘
                                          │
                                          ▼
                               ┌──────────────────────┐
                               │  Supabase            │
                               │  PostgreSQL + Auth   │
                               │  Storage + RLS       │
                               └──────────────────────┘
```

| Camada    | Serviço          | Repositório                         | Branch |
|-----------|------------------|-------------------------------------|--------|
| Frontend  | Cloudflare Pages | ghlacerda8-del/roadmap-infra        | main   |
| Backend   | Fly.io           | ghlacerda8-del/roadmap-infra        | main   |
| Banco     | Supabase         | Projeto no painel Supabase          | —      |

> Guia passo a passo de provisionamento em **[DEPLOY.md](DEPLOY.md)**.

---

## 2. Fluxo de deploy atual

### Frontend — Cloudflare Pages

Deploy automatico a cada `git push` na branch `main` (via integracao GitHub <-> Cloudflare).

```
codigo local  ->  git push origin main  ->  Cloudflare Pages build  ->  no ar em ~30s
```

**URL de producao:** `https://roadmap-infra.pages.dev`

Outras branches geram preview URLs unicas: `<branch>.roadmap-infra.pages.dev`. Build command: `npm run build`. Output dir: `dist`.

Passos manuais:
```bash
# 1. Verificar o que mudou
git status
git diff

# 2. Adicionar arquivos alterados
git add index.html css/auth.css js/progress.js   # arquivos específicos
# ou
git add -p   # adicionar por trecho (mais seguro)

# 3. Commit com mensagem descritiva
git commit -m "feat: descrição da mudança"

# 4. Push — o deploy acontece automaticamente
git push origin main
```

> Cloudflare Pages roda `npm run build` (definido em `package.json`) que copia
> apenas `index.html`, `css/`, `js/`, `docs/`, `_headers` e `_redirects` para
> `dist/`. O codigo do backend Python nao e exposto no CDN.

---

### Backend — Fly.io

O deploy do backend e feito via `fly deploy` (manual) ou GitHub Actions
(automatico — ver `.github/workflows/fly-deploy.yml` em DEPLOY.md secao 3).

```
codigo local  ->  git push origin main  ->  Fly.io build (Docker)  ->  FastAPI online em ~1 min
```

**URL de producao:** `https://roadmap-infra-api.fly.dev`

Passos manuais:
```bash
cd roadmap-backend/backend

# 1. Editar codigo (main.py, database.py, email_service.py...)

# 2. Deploy direto via flyctl
fly deploy

# 3. Acompanhar logs
fly logs
```

**Variaveis de ambiente no Fly.io** (via `fly secrets set` — ver DEPLOY.md secao 2.3):
| Variavel              | Descricao                                       |
|-----------------------|-------------------------------------------------|
| `SUPABASE_URL`        | URL do projeto Supabase                         |
| `SUPABASE_KEY`        | Service role key (privada)                      |
| `RESEND_API_KEY`      | Chave da API de e-mail Resend                   |
| `INTERNAL_TOKEN`      | Token para endpoints `/send-*` (forte!)         |
| `ALLOWED_ORIGINS`     | Origens CORS permitidas                         |
| `ALLOWED_ORIGIN_REGEX`| Regex pra previews (`*.roadmap-infra.pages.dev`)|
| `FRONTEND_URL`        | URL do frontend (usado em e-mails)              |
| `ADMIN_EMAIL/CPF/NOME`| Dados do administrador                          |

---

### Banco — Supabase

O banco não tem pipeline de deploy automatizado. Alterações de schema são feitas diretamente no painel do Supabase ou via SQL Editor.

**Tabelas principais:**
| Tabela       | Descrição                              |
|--------------|----------------------------------------|
| `progresso`  | Progresso do checklist por usuário     |
| `cv_settings`| Dados do currículo (resumo, exp, etc.) |
| `login_log`  | Registro de acessos                    |

**Acesso:**
- Painel: `https://supabase.com/dashboard`
- SQL Editor: executar migrations manualmente
- Row Level Security (RLS): deve estar ativo em todas as tabelas

---

## 3. Próximos passos recomendados

### CI com GitHub Actions

Criar `.github/workflows/deploy.yml` para validar o frontend antes do deploy:

```yaml
name: CI Frontend

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Verificar HTML
        run: npx html-validate index.html || true
      - name: Verificar JS
        run: npx eslint js/ --ext .js || true
```

### Testes automáticos (backend)

Criar `roadmap-backend/backend/tests/test_main.py`:

```python
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
```

Rodar localmente:
```bash
cd roadmap-backend/backend
pip install pytest httpx
pytest tests/
```

### Variáveis de ambiente e secrets

- **Frontend (público):** `SUPABASE_URL` e `SUPABASE_KEY` (anon) ficam em `js/config.js` — aceitável com RLS ativo
- **Backend (privado):** todas as chaves ficam em `.env` (nunca no git) e no Fly.io via `fly secrets set`
- **GitHub Secrets:** adicionar no repositório para uso em Actions: `Settings > Secrets and variables > Actions`

### Monitoramento

| O que monitorar          | Onde ver                                      |
|--------------------------|-----------------------------------------------|
| Logs do backend          | `fly logs` ou Fly.io Dashboard > Monitoring   |
| Erros de autenticacao    | Supabase > Authentication > Logs              |
| Queries lentas           | Supabase > Database > Query Performance       |
| Uptime do backend        | UptimeRobot (gratuito) ou Better Uptime       |
| Deploy do frontend       | Cloudflare Dashboard > Pages > Deployments    |
| Analytics frontend       | Cloudflare Dashboard > Pages > Analytics      |
| Headers de seguranca     | https://securityheaders.com (meta: A ou A+)   |

---

## 4. Comandos úteis do dia a dia

### Deploy de atualização (rotina normal)

```bash
# Frontend
cd d:/roadmap-infra
git add <arquivos>
git commit -m "feat|fix|chore: descrição"
git push origin main
# Aguardar ~30s e verificar em https://roadmap-infra.pages.dev

# Backend
cd d:/roadmap-infra/roadmap-backend/backend
fly deploy
fly logs   # acompanhar deploy
```

### Verificar status atual

```bash
git status           # arquivos modificados
git log --oneline -10  # últimos 10 commits
git diff             # o que mudou (não commitado)
git diff HEAD~1      # diferença do último commit
```

### Rollback de emergência (frontend)

```bash
# Ver histórico
git log --oneline

# Reverter para o commit anterior (cria novo commit de reversão — seguro)
git revert HEAD
git push origin main

# Ou fazer checkout de um commit específico em nova branch para analisar
git checkout -b hotfix abc1234
```

### Rollback no Fly.io (backend)

```bash
fly releases                          # ver historico
fly deploy --image <image-tag>        # voltar para release anterior
```

### Rollback no Cloudflare Pages (frontend)

Painel: `Pages > roadmap-infra > Deployments > [deploy anterior] > Rollback to this deployment`.

### Rodar backend localmente

```bash
cd roadmap-backend/backend
python -m venv venv
venv/Scripts/activate       # Windows
source venv/bin/activate    # Linux/Mac
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# API disponível em http://localhost:8000
# Docs em http://localhost:8000/docs
```

---

## Convenção de commits

| Prefixo   | Quando usar                              |
|-----------|------------------------------------------|
| `feat:`   | Nova funcionalidade                      |
| `fix:`    | Correção de bug                          |
| `chore:`  | Ajuste menor, sem impacto funcional      |
| `style:`  | Mudança visual/CSS sem lógica            |
| `refactor:` | Refatoração sem mudança de comportamento |
| `docs:`   | Documentação                             |
