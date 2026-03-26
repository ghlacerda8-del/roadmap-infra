(async function init() {
  if (SUPABASE_URL.includes('COLE')) return;
  initSB();
  try {
    const { data: { session } } = await sb.auth.getSession();
    if (session?.user) {
      const email = session.user.email;
      let identifier, master;
      if (email.endsWith('@roadmap.infra')) {
        // Conta master (CPF-based)
        identifier = session.user.user_metadata?.cpf || email.split('@')[0];
        master     = identifier === MASTER_CPF.replace(/\D/g, '');
      } else {
        // Conta de usuário comum (email real)
        identifier = email;
        master     = false;
      }
      currentUser = { cpf: identifier, email, id: session.user.id, master };
      isMaster    = master;
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
