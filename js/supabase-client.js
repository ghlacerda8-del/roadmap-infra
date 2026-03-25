let sb = null;

function initSB() {
  if (sb) return true; // já iniciado — não cria de novo
  try {
    sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    return true;
  } catch (e) {
    return false;
  }
}