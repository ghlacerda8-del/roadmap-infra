from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from database import get_active_users, get_all_progress
from email_service import send_daily_reminder, send_weekly_summary, send_admin_notification

API_SECRET = os.getenv("API_SECRET", "roadmap_secret_2026")

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Backend Roadmap Infra iniciado")
    yield

app = FastAPI(
    title="Roadmap Infra — Backend",
    description="Backend Python para notificacoes do Roadmap Analista de Infra",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://ghlacerda8-del.github.io", "http://localhost"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

def verify_secret(x_api_secret: str = Header(None)):
    if x_api_secret != API_SECRET:
        raise HTTPException(status_code=401, detail="Nao autorizado")

@app.get("/health")
async def health():
    return {"status": "online", "service": "roadmap-infra-backend"}

@app.post("/send-reminder")
async def send_reminder(x_api_secret: str = Header(None)):
    verify_secret(x_api_secret)
    try:
        users = await get_active_users()
        if not users:
            return {"message": "Nenhum usuario ativo", "sent": 0}
        sent = 0
        errors = []
        for user in users:
            if not user.get("email"):
                continue
            result = await send_daily_reminder(
                email=user["email"],
                nome=user.get("nome", user["cpf"]),
                horario=user.get("horario_lembrete", "19:00")
            )
            if result:
                sent += 1
            else:
                errors.append(user["cpf"])
        return {"message": f"Lembretes enviados: {sent}/{len(users)}", "sent": sent, "errors": errors}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/send-weekly")
async def send_weekly(x_api_secret: str = Header(None)):
    verify_secret(x_api_secret)
    try:
        users = await get_active_users()
        progress = await get_all_progress()
        prog_map = {p["user_cpf"]: p["dados"] for p in progress if p.get("user_cpf")}
        sent = 0
        for user in users:
            if not user.get("email"):
                continue
            cpf = user["cpf"]
            dados = prog_map.get(cpf, {"checked": {}, "studiedDays": []})
            checked = dados.get("checked", {})
            studied = dados.get("studiedDays", [])
            total_tasks = 59
            done = sum(1 for v in checked.values() if v)
            pct = round((done / total_tasks) * 100)
            result = await send_weekly_summary(
                email=user["email"],
                nome=user.get("nome", cpf),
                pct=pct,
                done=done,
                total=total_tasks,
                days_studied=len(studied)
            )
            if result:
                sent += 1
        admin_email = os.getenv("ADMIN_EMAIL", "ghalcerda8@gmail.com")
        await send_admin_notification(
            email=admin_email,
            subject="Resumo semanal — Roadmap Infra",
            body=f"Resumo semanal enviado para {sent} usuario(s)."
        )
        return {"message": f"Resumos enviados: {sent}", "sent": sent}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/notify-admin")
async def notify_admin(x_api_secret: str = Header(None)):
    verify_secret(x_api_secret)
    try:
        admin_email = os.getenv("ADMIN_EMAIL", "ghalcerda8@gmail.com")
        result = await send_admin_notification(
            email=admin_email,
            subject="Nova solicitacao de acesso — Roadmap Infra",
            body="Um novo usuario solicitou acesso ao Roadmap. Acesse o painel Admin para aprovar."
        )
        return {"message": "Admin notificado", "success": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
