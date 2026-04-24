import resend
import os
import logging
from datetime import datetime
from jinja2 import Environment, FileSystemLoader, select_autoescape

logger = logging.getLogger(__name__)

resend.api_key = os.getenv("RESEND_API_KEY")
if not resend.api_key:
    raise RuntimeError("RESEND_API_KEY não configurada nas variáveis de ambiente")

FROM_EMAIL  = os.getenv("FROM_EMAIL", "Roadmap Infra <onboarding@resend.dev>")
TOTAL_TASKS = 59

_templates = Environment(
    loader=FileSystemLoader(os.path.join(os.path.dirname(__file__), "templates")),
    autoescape=select_autoescape(["html"]),
)

DIAS_SEMANA = {
    "Monday":    ("Segunda-feira", "Redes / Teoria",   "Aula do curso ou módulo teórico do dia"),
    "Tuesday":   ("Terça-feira",   "Python / Lab",     "Prática de código ou exercícios"),
    "Wednesday": ("Quarta-feira",  "Cloud / Lab",      "Lab Azure, Docker ou ferramentas IaC"),
    "Thursday":  ("Quinta-feira",  "Linux / Infra",    "Terminal, automação, scripts"),
    "Friday":    ("Sexta-feira",   "Projeto",          "Publicar algo concreto no GitHub"),
}

# ── Helpers ───────────────────────────────────────────────────

def calc_progress(dados: dict) -> dict:
    checked = dados.get("checked", {})
    studied = dados.get("studiedDays", [])
    done    = sum(1 for v in checked.values() if v)
    pct     = round((done / TOTAL_TASKS) * 100) if TOTAL_TASKS > 0 else 0
    return {"done": done, "total": TOTAL_TASKS, "pct": pct, "dias": len(studied)}

def get_day_info() -> tuple:
    day = datetime.now().strftime("%A")
    return DIAS_SEMANA.get(day, ("Hoje", "Estudos", "Continue seu progresso"))

def fmt_cpf(cpf: str) -> str:
    if len(cpf) == 11:
        return f"{cpf[:3]}.{cpf[3:6]}.{cpf[6:9]}-{cpf[9:]}"
    return cpf

def _render(template_name: str, **ctx) -> str:
    return _templates.get_template(template_name).render(**ctx)

def _send(to: str, subject: str, html: str) -> None:
    try:
        resend.Emails.send({"from": FROM_EMAIL, "to": [to], "subject": subject, "html": html})
        logger.info(f"E-mail enviado para {to} — {subject}")
    except Exception as e:
        logger.error(f"Erro ao enviar e-mail para {to}: {e}")

# ── Funções de envio ──────────────────────────────────────────

async def send_daily_reminder_direct(email: str, dados: dict) -> None:
    prog = calc_progress(dados)
    dia_nome, tema, detalhe = get_day_info()
    html = _render(
        "reminder.html",
        tag="— Lembrete de estudos",
        nome="",
        dia_nome=dia_nome,
        tema=tema,
        detalhe=detalhe,
        pct=prog["pct"],
    )
    _send(email, f"📚 {dia_nome} — Hora de estudar! ({prog['pct']}% concluído)", html)

async def send_weekly_personal(email: str, nome: str, prog: dict) -> None:
    html = _render(
        "weekly_personal.html",
        tag="— Resumo semanal",
        tag_color="#ffb830",
        nome=nome,
        pct=prog["pct"],
        done=prog["done"],
        total=prog["total"],
        dias=prog["dias"],
        footer="Roadmap Analista de Infra · Resumo toda sexta-feira",
    )
    _send(
        email,
        f"📊 Resumo semanal — {prog['pct']}% concluído · {prog['done']}/{TOTAL_TASKS} tarefas",
        html,
    )

async def send_weekly_summary(users: list, progress: dict, admin_email: str) -> None:
    if not admin_email:
        logger.warning("Email do admin não configurado")
        return
    users_data = sorted(
        [{"cpf": fmt_cpf(u.get("cpf", "")), **calc_progress(progress.get(u.get("cpf", ""), {}))} for u in users],
        key=lambda x: x["pct"],
        reverse=True,
    )
    html = _render(
        "weekly_admin.html",
        tag="— Resumo semanal",
        tag_color="#ffb830",
        admin_nome="Gustavo",
        users=users_data,
        footer="Roadmap Analista de Infra · Resumo toda sexta-feira",
    )
    _send(admin_email, f"📊 Resumo semanal — Roadmap Infra ({len(users_data)} usuários)", html)

async def send_admin_notification(cpf: str, admin_email: str, admin_nome: str) -> None:
    if not admin_email:
        return
    html = _render(
        "admin_notify.html",
        tag="⚠ Nova solicitação de acesso",
        tag_color="#ffb830",
        admin_nome=admin_nome or "Admin",
        cpf_fmt=fmt_cpf(cpf),
        horario=datetime.now().strftime("%d/%m/%Y às %H:%M"),
        approve_url="https://ghlacerda8-del.github.io/roadmap-infra",
        footer="Roadmap Analista de Infra · Notificação automática",
    )
    _send(admin_email, f"🔔 Nova solicitação de acesso — CPF {fmt_cpf(cpf)}", html)

async def send_daily_reminder(user: dict) -> None:
    email = user.get("email")
    if not email:
        return
    from database import get_user_progress
    dados = await get_user_progress(user.get("cpf", ""))
    await send_daily_reminder_direct(email, dados)
