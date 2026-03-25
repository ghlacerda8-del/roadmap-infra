from supabase import create_client, Client
import os

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://hxosxvuiqugzgnwrvaxz.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

def get_client() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_KEY)

async def get_active_users():
    """Retorna todos os usuarios ativos (status=1) com email cadastrado"""
    try:
        sb = get_client()
        result = sb.table("solicitacoes").select("*").eq("status", 1).execute()
        return result.data or []
    except Exception as e:
        print(f"Erro ao buscar usuarios: {e}")
        return []

async def get_all_progress():
    """Retorna o progresso de todos os usuarios"""
    try:
        sb = get_client()
        result = sb.table("progresso").select("user_cpf, dados").execute()
        return result.data or []
    except Exception as e:
        print(f"Erro ao buscar progresso: {e}")
        return []

async def get_user_progress(cpf: str):
    """Retorna o progresso de um usuario especifico"""
    try:
        sb = get_client()
        result = sb.table("progresso").select("dados").eq("user_cpf", cpf).single().execute()
        return result.data.get("dados", {}) if result.data else {}
    except Exception as e:
        print(f"Erro ao buscar progresso do usuario {cpf}: {e}")
        return {}
