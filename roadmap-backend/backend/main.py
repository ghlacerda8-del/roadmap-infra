from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
import os, logging
from database import get_admin_progress
from email_service import send_daily_reminder_direct, send_weekly_personal, calc_progress

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

INTERNAL_TOKEN = os.getenv("INTERNAL_TOKEN")
if not INTERNAL_TOKEN:
    raise RuntimeError("INTERNAL_TOKEN não configurado nas variáveis de ambiente")

def verify_token(authorization: str = Header(None)):
    if not authorization or authorization != f"Bearer {INTERNAL_TOKEN}":
        raise HTTPException(status_code=401, detail="Token inválido")

# ── JOBS ─────────────────────────────────────────────────────

async def job_daily_reminder():
    logger.info("Executando lembrete diário...")
    admin_email = os.getenv("ADMIN_EMAIL", "")
    if not admin_email:
        logger.warning("ADMIN_EMAIL não configurado — pulando lembrete diário")
        return
    try:
        dados = await get_admin_progress()
        await send_daily_reminder_direct(admin_email, dados)
        logger.info(f"Lembrete enviado para {admin_email}")
    except Exception as e:
        logger.error(f"Erro no lembrete diário: {e}")

async def job_weekly_summary():
    logger.info("Executando resumo semanal...")
    admin_email = os.getenv("ADMIN_EMAIL", "")
    admin_nome  = os.getenv("ADMIN_NOME", "Admin")
    if not admin_email:
        logger.warning("ADMIN_EMAIL não configurado — pulando resumo semanal")
        return
    try:
        dados = await get_admin_progress()
        prog  = calc_progress(dados)
        await send_weekly_personal(admin_email, admin_nome, prog)
        logger.info(f"Resumo semanal enviado para {admin_email}")
    except Exception as e:
        logger.error(f"Erro no resumo semanal: {e}")

# ── ENDPOINTS ────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "online", "service": "roadmap-infra-backend"}

@app.post("/send-reminder")
async def trigger_reminder(authorization: str = Header(None)):
    verify_token(authorization)
    await job_daily_reminder()
    return {"message": "Lembrete enviado"}

@app.post("/send-weekly")
async def trigger_weekly(authorization: str = Header(None)):
    verify_token(authorization)
    await job_weekly_summary()
    return {"message": "Resumo semanal enviado"}
