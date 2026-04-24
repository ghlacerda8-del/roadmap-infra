(async function init() {
  if (SUPABASE_URL.includes('COLE')) return;
  initSB();
  loadLandingCareerCard();

  // Restaura sessão de visitante sem precisar de auth Supabase
  if (sessionStorage.getItem('roadmap_visitor') === '1') {
    currentUser = { cpf: 'visitante', email: null, id: null, master: false };
    isMaster = false;
    isVisitor = true;
    showApp();
    restorePageFromHash();
    return;
  }

  try {
    const { data: { session } } = await sb.auth.getSession();
    if (session?.user) {
      const email = session.user.email;
      let identifier, master;
      if (email.endsWith('@roadmap.infra')) {
        identifier = session.user.user_metadata?.cpf || email.split('@')[0];
        master     = identifier === MASTER_CPF.replace(/\D/g, '');
      } else {
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
      restorePageFromHash();
    }
  } catch(e) {
    console.error('Init error:', e);
  }
})();

function restorePageFromHash() {
  const hash = location.hash.replace('#', '');
  const valid = ['progresso', 'semana', 'checklist', 'roadmap', 'cronograma', 'curriculo', 'admin'];
  if (hash && valid.includes(hash)) showPage(hash, false);
}
