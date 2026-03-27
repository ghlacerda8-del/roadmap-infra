let currentUser = null;
let isMaster = false;
let isVisitor = false;
let adminMode = false;

function toggleLoginMode(e) {
  if (e) e.preventDefault();
  adminMode = !adminMode;
  const adminFields  = document.getElementById('l-admin-fields');
  const landingMain  = document.getElementById('landing-main');
  const toggleLink   = document.getElementById('admin-toggle-link');
  if (adminMode) {
    adminFields.style.display = '';
    landingMain.style.display = 'none';
    toggleLink.textContent    = '← Voltar';
  } else {
    adminFields.style.display = 'none';
    landingMain.style.display = '';
    toggleLink.textContent    = '⚙ Acesso administrativo';
  }
  hideMsg('l-error'); hideMsg('l-pending');
}

async function doLogin() {
  const cpf   = cpfDigits(document.getElementById('l-cpf').value);
  const senha = document.getElementById('l-senha').value;
  const btn   = document.getElementById('btn-login');
  hideMsg('l-error'); hideMsg('l-pending');

  if (cpf.length < 10 || cpf.length > 11) { showMsg('l-error', 'CPF inválido — digite 10 ou 11 dígitos.', 'error'); return; }
  if (senha.length < 6)                   { showMsg('l-error', 'Senha deve ter ao menos 6 caracteres.', 'error'); return; }
  const masterDigits = MASTER_CPF.replace(/\D/g, '');
  if (cpf !== masterDigits) { showMsg('l-error', 'Acesso negado.', 'error'); return; }

  btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>Entrando...';
  initSB();
  await loginAuth(cpf, senha, true, btn);
}

async function loginAuth(cpf, senha, master, btn) {
  const email = cpfToEmail(cpf);
  let { data, error } = await sb.auth.signInWithPassword({ email, password: senha });

  if (error) {
    if (master && (error.message.includes('Invalid') || error.message.includes('invalid'))) {
      const { data: reg, error: re } = await sb.auth.signUp({ email, password: senha, options: { data: { cpf } } });
      if (re) { showMsg('l-error', 'Erro: ' + re.message, 'error'); btn.disabled = false; btn.textContent = 'Entrar'; return; }
      const { data: d2 } = await sb.auth.signInWithPassword({ email, password: senha });
      if (!d2?.user) { showMsg('l-error', 'Conta criada! Tente entrar novamente.', 'error'); btn.disabled = false; btn.textContent = 'Entrar'; return; }
      data = d2;
    } else {
      showMsg('l-error', 'CPF ou senha incorretos.', 'error'); btn.disabled = false; btn.textContent = 'Entrar'; return;
    }
  }

  currentUser = { cpf, email, id: data.user?.id, master };
  isMaster = master;
  try { await sb.from('login_log').insert({ user_cpf: cpf, logged_at: new Date().toISOString(), user_agent: navigator.userAgent.slice(0, 200) }); } catch(e) {}
  setTimeout(() => { window.location.href = window.location.pathname; }, 300);
}

function doVisitorLogin() {
  currentUser = { cpf: 'visitante', email: null, id: null, master: false };
  isMaster = false;
  isVisitor = true;
  showApp();
}

async function doLogout() {
  if (sb && !isVisitor) await sb.auth.signOut();
  currentUser = null; isMaster = false; isVisitor = false; adminMode = false;
  userProgress = { checked: {}, studiedDays: [] };
  // Reset login form
  const adminFields = document.getElementById('l-admin-fields');
  const landingMain = document.getElementById('landing-main');
  const toggleLink  = document.getElementById('admin-toggle-link');
  if (adminFields) adminFields.style.display = 'none';
  if (landingMain) landingMain.style.display = '';
  if (toggleLink)  toggleLink.textContent    = '⚙ Acesso administrativo';
  showScreen('login');
}
