# Roadmap Infra — Portfólio Interativo

Aplicação web fullstack para acompanhamento de plano de carreira em infraestrutura de TI. Inclui autenticação, progresso persistido em banco, notificações por e-mail e currículo interativo.

**Produção:** https://roadmap-infra.pages.dev (Cloudflare Pages)

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | HTML · CSS · JavaScript (vanilla) |
| Backend | Python · FastAPI · APScheduler |
| Banco | Supabase (PostgreSQL + Auth) |
| E-mail | Resend API · Jinja2 |
| Frontend host | Cloudflare Pages (CDN global · CSP · HSTS) |
| Backend host | Fly.io (Docker · região GRU) |

---

## Funcionalidades

- **Autenticação** via Supabase Auth com roles (visitante / viewer / master)
- **Checklist interativo** com progresso salvo em banco por usuário
- **Heatmap** de dias estudados (últimos 60 dias) e streak tracker
- **Progresso por fase** — 4 fases, 24 meses, 800h de carga total
- **Currículo interativo** com exportação para PDF
- **Certificados** com visualização em modal por imagem
- **Lembretes diários por e-mail** via cron (seg–sex, 19h)
- **Resumo semanal** com progresso consolidado (sexta, 18h)
- **Sessão persistida** — refresh não desloga o usuário

---

## Arquitetura

```
Browser
  ├── Cloudflare Pages (HTML/CSS/JS estático · CDN global · CSP/HSTS)
  │     └── Supabase JS SDK (auth + banco)
  └── Fly.io (FastAPI em Docker · região GRU)
        ├── APScheduler (cron de e-mails)
        ├── Resend API (envio de e-mail)
        └── Supabase Python SDK (leitura de progresso)
```

---

## Rodar localmente

### Frontend
Abra `index.html` diretamente no browser ou use Live Server (VS Code).

### Backend
```bash
cd roadmap-backend/backend
python -m venv venv
source venv/bin/activate      # Linux/Mac
venv\Scripts\activate         # Windows
pip install -r requirements.txt
cp .env.example .env          # preencha as variáveis
uvicorn main:app --reload --port 8000
```

Documentação automática da API: http://localhost:8000/docs

---

## Variáveis de ambiente (backend)

Copie `.env.example` para `.env` e preencha:

| Variável | Descrição |
|---|---|
| `SUPABASE_URL` | URL do projeto Supabase |
| `SUPABASE_KEY` | Service role key (privada) |
| `RESEND_API_KEY` | Chave da API Resend |
| `FROM_EMAIL` | Remetente dos e-mails |
| `INTERNAL_TOKEN` | Token de autenticação interno |
| `ADMIN_EMAIL` | E-mail do administrador |
| `ADMIN_CPF` | CPF do administrador |
| `ADMIN_NOME` | Nome do administrador |

---

## Testes

```bash
cd roadmap-backend/backend
pip install pytest httpx
pytest tests/ -v
```

---

## Deploy

Veja o passo a passo completo em **[DEPLOY.md](DEPLOY.md)** (Cloudflare Pages + Fly.io).

```bash
# Frontend — Cloudflare Pages (deploy automatico no push para main)
git add . && git commit -m "feat: descricao" && git push origin main

# Backend — Fly.io
cd roadmap-backend/backend && fly deploy
```

Convenção de commits: `feat:` · `fix:` · `chore:` · `style:` · `refactor:` · `docs:` · `security:`
