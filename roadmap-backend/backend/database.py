from supabase import create_client, Client
import os, logging

logger = logging.getLogger(__name__)

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://hxosxvuiqugzgnwrvaxz.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

_client: Client = None

def get_client() -> Client:
    global _client
    if not _client:
        if not SUPABASE_KEY:
            raise ValueError("SUPABASE_KEY não configurada nas variáveis de ambiente")
        _client = create_client(SUPABASE_URL, SUPABASE_KEY)
    return _client

async def get_active_users() -> list:
    """Retorna todos os usuários com status=1 (ativo) que têm email cadastrado."""
    try:
        sb = get_client()
        res = sb.table("solicitacoes").select("*").eq("status", 1).execute()
        return res.data or []
    except Exception as e:
        logger.error(f"Erro ao buscar usuários ativos: {e}")
        return []

async def get_all_progress() -> dict:
    """Retorna dicionário {user_cpf: dados} com o progresso de todos."""
    try:
        sb = get_client()
        res = sb.table("progresso").select("user_cpf, dados").execute()
        return {r["user_cpf"]: r["dados"] for r in (res.data or []) if r.get("user_cpf")}
    except Exception as e:
        logger.error(f"Erro ao buscar progresso: {e}")
        return {}

async def get_config(chave: str) -> str:
    """Retorna valor de configuração da tabela config."""
    try:
        sb = get_client()
        res = sb.table("config").select("valor").eq("chave", chave).single().execute()
        return res.data["valor"] if res.data else ""
    except Exception as e:
        logger.error(f"Erro ao buscar config '{chave}': {e}")
        return ""

async def get_user_progress(cpf: str) -> dict:
    """Retorna o progresso de um usuário específico."""
    try:
        sb = get_client()
        res = sb.table("progresso").select("dados").eq("user_cpf", cpf).single().execute()
        return res.data["dados"] if res.data else {"checked": {}, "studiedDays": []}
    except Exception as e:
        logger.error(f"Erro ao buscar progresso de {cpf}: {e}")
        return {"checked": {}, "studiedDays": []}
