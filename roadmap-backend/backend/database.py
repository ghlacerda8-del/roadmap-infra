from supabase import create_client, Client
from functools import lru_cache
import re, os, logging

_CPF_RE = re.compile(r"\d{3}\.?\d{3}\.?\d{3}-?\d{2}")

def _mask_cpf(cpf: str) -> str:
    c = re.sub(r"\D", "", cpf or "")
    return c[:3] + "***" + c[-2:] if len(c) >= 5 else "***"

logger = logging.getLogger(__name__)

@lru_cache(maxsize=1)
def get_client() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    if not url or not key:
        raise ValueError("SUPABASE_URL e SUPABASE_KEY devem estar configuradas nas variáveis de ambiente")
    return create_client(url, key)

async def get_active_users() -> list:
    try:
        res = get_client().table("solicitacoes").select("*").eq("status", 1).execute()
        return res.data or []
    except Exception as e:
        logger.error(f"Erro ao buscar usuários ativos: {e}")
        return []

async def get_all_progress() -> dict:
    try:
        res = get_client().table("progresso").select("user_cpf, dados").execute()
        return {r["user_cpf"]: r["dados"] for r in (res.data or []) if r.get("user_cpf")}
    except Exception as e:
        logger.error(f"Erro ao buscar progresso: {e}")
        return {}

async def get_config(chave: str) -> str:
    try:
        res = get_client().table("config").select("valor").eq("chave", chave).single().execute()
        return res.data["valor"] if res.data else ""
    except Exception as e:
        logger.error(f"Erro ao buscar config '{chave}': {e}")
        return ""

async def get_user_progress(cpf: str) -> dict:
    try:
        res = get_client().table("progresso").select("dados").eq("user_cpf", cpf).single().execute()
        return res.data["dados"] if res.data else {"checked": {}, "studiedDays": []}
    except Exception as e:
        logger.error(f"Erro ao buscar progresso de {_mask_cpf(cpf)}: {e}")
        return {"checked": {}, "studiedDays": []}

async def get_admin_progress() -> dict:
    cpf = os.getenv("ADMIN_CPF", "")
    if not cpf:
        return {"checked": {}, "studiedDays": []}
    return await get_user_progress(cpf)
