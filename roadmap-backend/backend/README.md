# Roadmap Infra — Backend

Backend Python com FastAPI para notificações de email do Roadmap Analista de Infra.

## Stack
- **FastAPI** — framework web moderno e rápido
- **APScheduler** — agendamento de tarefas (lembretes diários e resumo semanal)
- **Supabase Python** — conexão com o banco de dados
- **Resend** — envio de emails transacionais
- **Railway** — hospedagem gratuita

## Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/health` | Verifica se o serviço está online |
| POST | `/send-reminder` | Dispara lembretes diários manualmente |
| POST | `/send-weekly` | Dispara resumo semanal manualmente |
| POST | `/notify-admin` | Notifica admin sobre nova solicitação |
| GET | `/users/active` | Lista usuários ativos |

## Emails automáticos

- **Seg–Sex às 19h** — lembrete de estudos para cada usuário com o tema do dia
- **Sexta às 18h** — resumo semanal de progresso para o admin

## Variáveis de ambiente (Railway)

Configure no painel do Railway → Variables:

```
SUPABASE_URL     = https://hxosxvuiqugzgnwrvaxz.supabase.co
SUPABASE_KEY     = sua_service_role_key
RESEND_API_KEY   = re_...
FROM_EMAIL       = Roadmap Infra <onboarding@resend.dev>
INTERNAL_TOKEN   = roadmap_backend_2026
```

## Deploy local

```bash
pip install -r requirements.txt
cp .env.example .env
# Edite o .env com suas chaves
uvicorn main:app --reload
```

Acesse a documentação automática em: `http://localhost:8000/docs`
