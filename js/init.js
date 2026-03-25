(async function init() {
  if (checkInviteMode()) return;
  if (SUPABASE_URL.includes('COLE')) return;
  initSB();
  try {
    const { data: { session } } = await sb.auth.getSession();
    if (session?.user) {
      const cpf    = session.user.user_metadata?.cpf || session.user.email.split('@')[0];
      const master = cpf === MASTER_CPF.replace(/\D/g, '');
      currentUser  = { cpf, email: session.user.email, id: session.user.id, master };
      isMaster     = master;
      try {
        await Promise.race([
          loadProgressFromDB(),
          new Promise(r => setTimeout(r, 4000))
        ]);
      } catch(e) {}
      showApp();
    }
  } catch(e) {
    console.error('Init error:', e);
  }
})();
