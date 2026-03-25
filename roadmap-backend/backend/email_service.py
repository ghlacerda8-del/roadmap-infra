import resend
import os
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

resend.api_key = os.getenv("RESEND_API_KEY", "re_QpuSPZLM_523rF72kD13rxzJcnkT58UDB")

FROM_EMAIL = os.getenv("FROM_EMAIL", "Roadmap Infra <onboarding@resend.dev>")

TOTAL_TASKS = 59  # Total de tarefas no roadmap

DIAS_SEMANA = {
    "Monday":    ("Segunda-feira", "Redes / Teoria",   "Aula do curso ou módulo teórico do dia"),
    "Tuesday":   ("Terça-feira",   "Python / Lab",     "Prática de código ou exercícios"),
    "Wednesday": ("Quarta-feira",  "Cloud / Lab",      "Lab Azure, Docker ou ferramentas IaC"),
    "Thursday":  ("Quinta-feira",  "Linux / Infra",    "Terminal, automação, scripts"),
    "Friday":    ("Sexta-feira",   "Projeto",          "Publicar algo concreto no GitHub"),
}

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

# ── TEMPLATES HTML ────────────────────────────────────────────

def template_reminder(nome: str, dia_nome: str, tema: str, detalhe: str, pct: int) -> str:
    return f"""
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{{margin:0;padding:0;background:#0d0f14;font-family:'Segoe UI',Arial,sans-serif;color:#e8eaf0}}
  .wrap{{max-width:560px;margin:0 auto;padding:32px 16px}}
  .card{{background:#13161e;border:1px solid rgba(255,255,255,.08);border-radius:14px;overflow:hidden}}
  .header{{background:#13161e;padding:28px 32px 20px;border-bottom:1px solid rgba(255,255,255,.06)}}
  .tag{{font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#00e5a0;margin-bottom:10px}}
  .title{{font-size:22px;font-weight:700;color:#e8eaf0;line-height:1.2}}
  .title span{{color:#00e5a0}}
  .body{{padding:24px 32px}}
  .day-card{{background:#1a1e28;border-radius:10px;padding:18px;margin-bottom:16px}}
  .day-label{{font-size:11px;color:#7a7f94;text-transform:uppercase;letter-spacing:.1em;margin-bottom:6px}}
  .day-tema{{font-size:18px;font-weight:600;color:#e8eaf0;margin-bottom:4px}}
  .day-detail{{font-size:13px;color:#7a7f94}}
  .progress-wrap{{margin-bottom:20px}}
  .progress-label{{font-size:12px;color:#7a7f94;margin-bottom:6px;display:flex;justify-content:space-between}}
  .progress-bar{{background:rgba(255,255,255,.06);border-radius:6px;height:8px;overflow:hidden}}
  .progress-fill{{background:#00e5a0;height:100%;border-radius:6px}}
  .btn{{display:block;text-align:center;background:#00e5a0;color:#000;font-weight:700;font-size:13px;padding:13px;border-radius:8px;text-decoration:none;letter-spacing:.04em}}
  .footer{{padding:16px 32px;font-size:11px;color:#7a7f94;text-align:center;border-top:1px solid rgba(255,255,255,.06)}}
</style>
</head>
<body>
<div class="wrap">
  <div class="card">
    <div class="header">
      <div class="tag">— Lembrete de estudos</div>
      <div class="title">Roadmap<br><span>Analista de Infra</span></div>
    </div>
    <div class="body">
      <p style="font-size:14px;color:#7a7f94;margin:0 0 20px">Olá{', ' + nome if nome else ''}! É hora de estudar. Aqui está sua tarefa de hoje:</p>
      <div class="day-card">
        <div class="day-label">{dia_nome}</div>
        <div class="day-tema">{tema}</div>
        <div class="day-detail">{detalhe}</div>
      </div>
      <div class="progress-wrap">
        <div class="progress-label">
          <span>Seu progresso geral</span>
          <span style="color:#00e5a0;font-weight:600">{pct}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width:{pct}%"></div>
        </div>
      </div>
      <a href="https://ghlacerda8-del.github.io/roadmap-infra" class="btn">Abrir Roadmap →</a>
    </div>
    <div class="footer">Roadmap Analista de Infra · 2h/dia · Seg–Sex · 24 meses</div>
  </div>
</div>
</body></html>"""

def template_weekly(admin_nome: str, users_data: list) -> str:
    rows = ""
    for u in users_data:
        cpf  = fmt_cpf(u["cpf"])
        pct  = u["pct"]
        done = u["done"]
        cor  = "#00e5a0" if pct >= 50 else "#ffb830" if pct >= 20 else "#ff5f5f"
        rows += f"""
        <tr>
          <td style="padding:10px 12px;font-size:13px;color:#e8eaf0;border-bottom:1px solid rgba(255,255,255,.05)">{cpf}</td>
          <td style="padding:10px 12px;text-align:center;border-bottom:1px solid rgba(255,255,255,.05)">
            <span style="font-weight:700;color:{cor}">{pct}%</span>
          </td>
          <td style="padding:10px 12px;text-align:center;font-size:12px;color:#7a7f94;border-bottom:1px solid rgba(255,255,255,.05)">{done}/{TOTAL_TASKS}</td>
        </tr>"""

    return f"""
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8">
<style>
  body{{margin:0;padding:0;background:#0d0f14;font-family:'Segoe UI',Arial,sans-serif;color:#e8eaf0}}
  .wrap{{max-width:600px;margin:0 auto;padding:32px 16px}}
  .card{{background:#13161e;border:1px solid rgba(255,255,255,.08);border-radius:14px;overflow:hidden}}
  .header{{padding:28px 32px 20px;border-bottom:1px solid rgba(255,255,255,.06)}}
  .tag{{font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#ffb830;margin-bottom:10px}}
  .title{{font-size:22px;font-weight:700;color:#e8eaf0}}
  .title span{{color:#ffb830}}
  .body{{padding:24px 32px}}
  table{{width:100%;border-collapse:collapse;background:#1a1e28;border-radius:10px;overflow:hidden}}
  th{{padding:10px 12px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:#7a7f94;background:#1a1e28;border-bottom:1px solid rgba(255,255,255,.08)}}
  .btn{{display:block;text-align:center;background:#ffb830;color:#000;font-weight:700;font-size:13px;padding:13px;border-radius:8px;text-decoration:none;margin-top:20px}}
  .footer{{padding:16px 32px;font-size:11px;color:#7a7f94;text-align:center;border-top:1px solid rgba(255,255,255,.06)}}
</style>
</head>
<body>
<div class="wrap">
  <div class="card">
    <div class="header">
      <div class="tag">— Resumo semanal</div>
      <div class="title">Roadmap<br><span>Analista de Infra</span></div>
    </div>
    <div class="body">
      <p style="font-size:14px;color:#7a7f94;margin:0 0 20px">Olá {admin_nome}! Aqui está o resumo de progresso da semana:</p>
      <table>
        <thead><tr>
          <th>Usuário (CPF)</th>
          <th style="text-align:center">Progresso</th>
          <th style="text-align:center">Tarefas</th>
        </tr></thead>
        <tbody>{rows}</tbody>
      </table>
      <a href="https://ghlacerda8-del.github.io/roadmap-infra" class="btn">Abrir Painel Admin →</a>
    </div>
    <div class="footer">Roadmap Analista de Infra · Resumo toda sexta-feira</div>
  </div>
</div>
</body></html>"""

def template_admin_notify(cpf: str, admin_nome: str, approve_url: str) -> str:
    return f"""
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8">
<style>
  body{{margin:0;padding:0;background:#0d0f14;font-family:'Segoe UI',Arial,sans-serif;color:#e8eaf0}}
  .wrap{{max-width:520px;margin:0 auto;padding:32px 16px}}
  .card{{background:#13161e;border:1px solid rgba(255,184,48,.2);border-radius:14px;overflow:hidden}}
  .header{{padding:24px 28px 18px;border-bottom:1px solid rgba(255,255,255,.06)}}
  .tag{{font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#ffb830;margin-bottom:8px}}
  .title{{font-size:20px;font-weight:700;color:#e8eaf0}}
  .body{{padding:22px 28px}}
  .info-box{{background:#1a1e28;border-radius:10px;padding:16px;margin-bottom:18px}}
  .info-label{{font-size:11px;color:#7a7f94;margin-bottom:4px;text-transform:uppercase;letter-spacing:.08em}}
  .info-val{{font-size:15px;font-weight:600;color:#e8eaf0}}
  .btn{{display:block;text-align:center;background:#00e5a0;color:#000;font-weight:700;font-size:13px;padding:13px;border-radius:8px;text-decoration:none}}
  .footer{{padding:14px 28px;font-size:11px;color:#7a7f94;text-align:center;border-top:1px solid rgba(255,255,255,.06)}}
</style>
</head>
<body>
<div class="wrap">
  <div class="card">
    <div class="header">
      <div class="tag">⚠ Nova solicitação de acesso</div>
      <div class="title">Roadmap Analista de Infra</div>
    </div>
    <div class="body">
      <p style="font-size:14px;color:#7a7f94;margin:0 0 18px">Olá {admin_nome}! Um novo usuário solicitou acesso ao Roadmap.</p>
      <div class="info-box">
        <div class="info-label">CPF solicitante</div>
        <div class="info-val">{fmt_cpf(cpf)}</div>
      </div>
      <div class="info-box">
        <div class="info-label">Horário</div>
        <div class="info-val">{datetime.now().strftime("%d/%m/%Y às %H:%M")}</div>
      </div>
      <a href="{approve_url}" class="btn">Acessar painel para aprovar →</a>
    </div>
    <div class="footer">Roadmap Analista de Infra · Notificação automática</div>
  </div>
</div>
</body></html>"""

# ── FUNÇÕES DE ENVIO ──────────────────────────────────────────

async def send_daily_reminder(user: dict):
    email = user.get("email")
    cpf   = user.get("cpf", "")
    if not email:
        return
    from database import get_user_progress
    dados  = await get_user_progress(cpf)
    prog   = calc_progress(dados)
    dia_nome, tema, detalhe = get_day_info()
    try:
        resend.Emails.send({
            "from":    FROM_EMAIL,
            "to":      [email],
            "subject": f"📚 {dia_nome} — Hora de estudar! ({prog['pct']}% concluído)",
            "html":    template_reminder("", dia_nome, tema, detalhe, prog["pct"])
        })
        logger.info(f"Lembrete enviado para {email}")
    except Exception as e:
        logger.error(f"Erro ao enviar lembrete para {email}: {e}")

async def send_weekly_summary(users: list, progress: dict, admin_email: str):
    if not admin_email:
        logger.warning("Email do admin não configurado")
        return
    users_data = []
    for u in users:
        cpf  = u.get("cpf", "")
        prog = calc_progress(progress.get(cpf, {}))
        users_data.append({"cpf": cpf, **prog})
    users_data.sort(key=lambda x: x["pct"], reverse=True)
    try:
        resend.Emails.send({
            "from":    FROM_EMAIL,
            "to":      [admin_email],
            "subject": f"📊 Resumo semanal — Roadmap Infra ({len(users_data)} usuários)",
            "html":    template_weekly("Gustavo", users_data)
        })
        logger.info(f"Resumo semanal enviado para {admin_email}")
    except Exception as e:
        logger.error(f"Erro ao enviar resumo: {e}")

async def send_admin_notification(cpf: str, admin_email: str, admin_nome: str):
    if not admin_email:
        return
    approve_url = "https://ghlacerda8-del.github.io/roadmap-infra"
    try:
        resend.Emails.send({
            "from":    FROM_EMAIL,
            "to":      [admin_email],
            "subject": f"🔔 Nova solicitação de acesso — CPF {fmt_cpf(cpf)}",
            "html":    template_admin_notify(cpf, admin_nome or "Admin", approve_url)
        })
        logger.info(f"Admin notificado sobre CPF {cpf}")
    except Exception as e:
        logger.error(f"Erro ao notificar admin: {e}")
