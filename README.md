# Roadmap Infra — Portfólio Interativo

Aplicação web fullstack para acompanhamento de plano de carreira em infraestrutura de TI. Inclui autenticação, progresso persistido em banco, notificações por e-mail e currículo interativo.

**Produção:** https://ghlacerda8-del.github.io/roadmap-infra/

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | HTML · CSS · JavaScript (vanilla) |
| Backend | Python · FastAPI · APScheduler |
| Banco | Supabase (PostgreSQL + Auth) |
| E-mail | Resend API · Jinja2 |
| Frontend host | GitHub Pages |
| Backend host | Render |

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
  ├── GitHub Pages (HTML/CSS/JS estático)
  │     └── Supabase JS SDK (auth + banco)
  └── Render (FastAPI)
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

```bash
# Frontend — GitHub Pages (automático no push)
git add .
git commit -m "feat: descrição"
git push origin main

# Backend — Render (automático no push do repositório do backend)
```

Convenção de commits: `feat:` · `fix:` · `chore:` · `style:` · `refactor:` · `docs:` · `security:`
