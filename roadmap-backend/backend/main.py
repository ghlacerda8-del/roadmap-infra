from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
import os, logging
from datetime import datetime
from zoneinfo import ZoneInfo
from database import get_active_users, get_all_progress, get_config
from email_service import send_daily_reminder, send_weekly_summary, send_admin_notification

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler(timezone="America/Sao_Paulo")

@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler.add_job(
        job_daily_reminder,
        CronTrigger(day_of_week="mon-fri", hour=19, minute=0, timezone="America/Sao_Paulo"),
        id="daily_reminder", replace_existing=True
    )
    scheduler.add_job(
        job_weekly_summary,
        CronTrigger(day_of_week="fri", hour=18, minute=0, timezone="America/Sao_Paulo"),
        id="weekly_summary", replace_existing=True
    )
    scheduler.start()
    logger.info("Scheduler iniciado — lembretes ativos")
    yield
    scheduler.shutdown()

app = FastAPI(
    title="Roadmap Infra — Backend",
    description="Backend Python para notificações do Roadmap Analista de Infra",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://ghlacerda8-del.github.io"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

INTERNAL_TOKEN = os.getenv("INTERNAL_TOKEN", "roadmap_backend_2026")

def verify_token(authorization: str = Header(None)):
    if not authorization or authorization != f"Bearer {INTERNAL_TOKEN}":
        raise HTTPException(status_code=401, detail="Token inválido")

# ── JOBS ─────────────────────────────────────────────────────

async def job_hourly_reminders():
    # Obtém a hora atual em SP
    agora = datetime.now(ZoneInfo("America/Sao_Paulo"))
    hora_atual = agora.hour
    logger.info(f"Executando lembretes por hora... Hora atual (SP): {hora_atual}h")
    try:
        users = await get_active_users()
        progresses = await get_all_progress()
        sent = 0
        for user in users:
            cpf = user.get("cpf", "")
            prog = progresses.get(cpf, {})
            # A hora escolhida pelo user (padrão 19 se não configurou)
            user_hour = int(prog.get("reminderHour", 19))
            
            if user_hour == hora_atual and user.get("email"):
                await send_daily_reminder(user)
                sent += 1
                
        logger.info(f"Lembretes enviados nesta hora ({hora_atual}h): {sent}")
    except Exception as e:
        logger.error(f"Erro no envio por hora: {e}")

async def job_daily_reminder():
    logger.info("Executando lembrete diário...")
    try:
        users = await get_active_users()
        sent = 0
        for user in users:
            if user.get("email"):
                await send_daily_reminder(user)
                sent += 1
        logger.info(f"Lembretes enviados: {sent}/{len(users)}")
    except Exception as e:
        logger.error(f"Erro no lembrete diário: {e}")

async def job_weekly_summary():
    logger.info("Executando resumo semanal...")
    try:
        users    = await get_active_users()
        progress = await get_all_progress()
        admin    = await get_config("admin_email")
        await send_weekly_summary(users, progress, admin)
        logger.info("Resumo semanal enviado")
    except Exception as e:
        logger.error(f"Erro no resumo semanal: {e}")

# ── ENDPOINTS ────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "online", "service": "roadmap-infra-backend"}

@app.post("/send-reminders-hourly")
async def trigger_hourly(authorization: str = Header(None)):
    verify_token(authorization)
    await job_hourly_reminders()
    return {"message": "Processamento por hora concluído"}

@app.post("/send-reminder")
async def trigger_reminder(authorization: str = Header(None)):
    verify_token(authorization)
    await job_daily_reminder()
    return {"message": "Lembretes enviados"}

@app.post("/send-weekly")
async def trigger_weekly(authorization: str = Header(None)):
    verify_token(authorization)
    await job_weekly_summary()
    return {"message": "Resumo semanal enviado"}

@app.post("/notify-admin")
async def notify_admin(body: dict, authorization: str = Header(None)):
    verify_token(authorization)
    cpf = body.get("cpf")
    if not cpf:
        raise HTTPException(status_code=400, detail="CPF obrigatório")
    admin_email = await get_config("admin_email")
    admin_nome  = await get_config("admin_nome")
    await send_admin_notification(cpf, admin_email, admin_nome)
    return {"message": "Admin notificado"}

@app.get("/users/active")
async def list_users(authorization: str = Header(None)):
    verify_token(authorization)
    users = await get_active_users()
    return {"users": users, "total": len(users)}
