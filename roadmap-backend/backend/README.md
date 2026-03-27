# Roadmap Infra — Backend

Backend Python com FastAPI para notificações de email do Roadmap Analista de Infra.

## Stack
- **FastAPI** — framework web moderno e rápido
- **APScheduler** — agendamento de tarefas (lembretes diários e resumo semanal)
- **Supabase Python** — conexão com o banco de dados
- **Resend** — envio de emails transacionais
- **Render** — hospedagem (render.com)

## Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/health` | Verifica se o serviço está online |
| POST | `/send-reminder` | Dispara lembrete diário manualmente |
| POST | `/send-weekly` | Dispara resumo semanal manualmente |

## Emails automáticos

- **Seg–Sex às 19h** — lembrete de estudos pessoal com o tema do dia
- **Sexta às 18h** — resumo semanal com progresso pessoal

## Variáveis de ambiente (Render)

Configure no painel do Render → Environment:

```
SUPABASE_URL     = https://hxosxvuiqugzgnwrvaxz.supabase.co
SUPABASE_KEY     = sua_service_role_key
RESEND_API_KEY   = re_...
FROM_EMAIL       = Roadmap Infra <onboarding@resend.dev>
INTERNAL_TOKEN   = roadmap_backend_2026
ADMIN_EMAIL      = ghlacerda8@gmail.com
ADMIN_CPF        = seu_cpf_aqui
ADMIN_NOME       = Gustavo
```

## Deploy local

```bash
pip install -r requirements.txt
cp .env.example .env
# Edite o .env com suas chaves
uvicorn main:app --reload
```

Acesse a documentação automática em: `http://localhost:8000/docs`
