let currentUser = null;
let isMaster = false;
let isVisitor = false;
let loginMode = 'email'; // 'email' | 'cpf'

function checkInviteMode() {
  const p = new URLSearchParams(window.location.search);
  if (p.get('convite') === INVITE_TOKEN) { showScreen('invite'); return true; }
  return false;
}

function toggleLoginMode(e) {
  if (e) e.preventDefault();
  loginMode = loginMode === 'email' ? 'cpf' : 'email';
  const cpfField   = document.getElementById('l-cpf-field');
  const emailField = document.getElementById('l-email-field');
  const sub        = document.getElementById('l-sub');
  const toggleLink = document.querySelector('.auth-toggle a');
  if (loginMode === 'cpf') {
    cpfField.style.display   = '';
    emailField.style.display = 'none';
    sub.textContent          = 'Acesso administrativo via CPF';
    toggleLink.textContent   = '← Voltar ao login normal';
  } else {
    cpfField.style.display   = 'none';
    emailField.style.display = '';
    sub.textContent          = 'Entre com seu e-mail e senha para acessar';
    toggleLink.textContent   = 'Acesso administrativo →';
  }
  hideMsg('l-error'); hideMsg('l-pending');
}

async function doInviteSignup() {
  const email = document.getElementById('i-email').value.trim().toLowerCase();
  const s1    = document.getElementById('i-senha').value;
  const s2    = document.getElementById('i-senha2').value;
  const btn   = document.getElementById('btn-invite');
  hideMsg('i-error'); hideMsg('i-success');

  if (!email || !email.includes('@')) { showMsg('i-error', 'E-mail inválido.', 'error'); return; }
  if (s1.length < 6)                  { showMsg('i-error', 'Senha deve ter ao menos 6 caracteres.', 'error'); return; }
  if (s1 !== s2)                      { showMsg('i-error', 'As senhas não coincidem.', 'error'); return; }

  btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>Enviando...';
  initSB();

  const { data: exist } = await sb.from('solicitacoes').select('cpf').eq('cpf', email).single();
  if (exist) {
    showMsg('i-error', 'Este e-mail já possui uma solicitação.', 'error');
    btn.disabled = false; btn.textContent = 'Enviar solicitação'; return;
  }

  const { error: regErr } = await sb.auth.signUp({ email, password: s1 });
  if (regErr && !regErr.message.includes('already registered')) {
    showMsg('i-error', 'Erro: ' + regErr.message, 'error');
    btn.disabled = false; btn.textContent = 'Enviar solicitação'; return;
  }

  const senhaHint = '****' + s1.slice(-2);
  await sb.from('solicitacoes').insert({ cpf: email, status: 0, senha_hint: senhaHint, created_at: new Date().toISOString() });

  const msg = encodeURIComponent(
    `🔔 *Nova solicitação - Roadmap Infra*\n\nE-mail: ${email}\nHorário: ${new Date().toLocaleString('pt-BR')}\n\nAcesse para aprovar:\nhttps://ghlacerda8-del.github.io/roadmap-infra`
  );
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');

  showMsg('i-success', '✓ Solicitação enviada! Aguarde a aprovação do administrador.', 'success');
  btn.disabled = true; btn.textContent = 'Solicitação enviada ✓';
}

async function doLogin() {
  const senha = document.getElementById('l-senha').value;
  const btn   = document.getElementById('btn-login');
  hideMsg('l-error'); hideMsg('l-pending');

  if (loginMode === 'cpf') {
    // Acesso administrativo via CPF
    const cpf = cpfDigits(document.getElementById('l-cpf').value);
    if (cpf.length < 10 || cpf.length > 11) { showMsg('l-error', 'CPF inválido — digite 10 ou 11 dígitos.', 'error'); return; }
    if (senha.length < 6)                   { showMsg('l-error', 'Senha deve ter ao menos 6 caracteres.', 'error'); return; }
    const masterDigits = MASTER_CPF.replace(/\D/g, '');
    if (cpf !== masterDigits) { showMsg('l-error', 'Acesso negado. Apenas o administrador usa CPF.', 'error'); return; }
    btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>Entrando...';
    initSB();
    await loginAuth(cpf, senha, true, btn);
    return;
  }

  // Login por e-mail (usuários comuns)
  const email = document.getElementById('l-email').value.trim().toLowerCase();
  if (!email || !email.includes('@')) { showMsg('l-error', 'E-mail inválido.', 'error'); return; }
  if (senha.length < 6)              { showMsg('l-error', 'Senha deve ter ao menos 6 caracteres.', 'error'); return; }

  btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>Entrando...';
  initSB();

  const { data: sol } = await sb.from('solicitacoes').select('*').eq('cpf', email).single();
  if (!sol)           { showMsg('l-error', 'E-mail não encontrado. Solicite acesso pelo link de convite.', 'error'); btn.disabled = false; btn.textContent = 'Entrar'; return; }
  if (sol.status === 0){ showMsg('l-pending', '⏳ Sua conta está aguardando aprovação do administrador.', 'warn'); btn.disabled = false; btn.textContent = 'Entrar'; return; }
  if (sol.status === 2){ showMsg('l-error', 'Usuário inativo. Entre em contato com o administrador.', 'error'); btn.disabled = false; btn.textContent = 'Entrar'; return; }

  const { data, error } = await sb.auth.signInWithPassword({ email, password: senha });
  if (error) { showMsg('l-error', 'E-mail ou senha incorretos.', 'error'); btn.disabled = false; btn.textContent = 'Entrar'; return; }

  currentUser = { cpf: email, email, id: data.user?.id, master: false };
  isMaster = false;
  try { await sb.from('login_log').insert({ user_cpf: email, logged_at: new Date().toISOString(), user_agent: navigator.userAgent.slice(0, 200) }); } catch(e) {}
  setTimeout(() => { window.location.href = window.location.pathname; }, 300);
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
  currentUser = null; isMaster = false; isVisitor = false;
  userProgress = { checked: {}, studiedDays: [] };
  loginMode = 'email';
  // Reset login form to email mode
  const cpfField   = document.getElementById('l-cpf-field');
  const emailField = document.getElementById('l-email-field');
  const sub        = document.getElementById('l-sub');
  const toggleLink = document.querySelector('.auth-toggle a');
  if (cpfField)   cpfField.style.display   = 'none';
  if (emailField) emailField.style.display = '';
  if (sub)        sub.textContent          = 'Entre com seu e-mail e senha para acessar';
  if (toggleLink) toggleLink.textContent   = 'Acesso administrativo →';
  showScreen('login');
}
