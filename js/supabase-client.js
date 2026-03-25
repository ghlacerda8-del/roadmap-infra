let sb = null;

function initSB() {
  try {
    sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    return true;
  } catch(e) {
    return false;
  }
}
