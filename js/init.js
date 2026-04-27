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
    restorePageFromPath();
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
      restorePageFromPath();
    }
  } catch(e) {
    console.error('Init error:', e);
  }
})();

function restorePageFromPath() {
  const valid = ['progresso', 'semana', 'checklist', 'roadmap', 'cronograma', 'curriculo', 'admin'];
  // Aceita /curriculo (Cloudflare Pages) e #curriculo (compat retroativa GitHub Pages)
  const fromPath = location.pathname.replace(/^\/+|\/+$/g, '').split('/').pop();
  const fromHash = location.hash.replace('#', '');
  const target = valid.includes(fromPath) ? fromPath : (valid.includes(fromHash) ? fromHash : null);
  if (target) showPage(target, false);
}
