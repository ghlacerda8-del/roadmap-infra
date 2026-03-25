function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + id).classList.add('active');
}

function showMsg(id, txt, type) {
  const el = document.getElementById(id);
  el.className = `auth-msg auth-${type} show`;
  el.textContent = txt;
}

function hideMsg(id) { document.getElementById(id).classList.remove('show'); }

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  document.querySelector(`[onclick="showPage('${id}')"]`).classList.add('active');
  if (id === 'semana')    renderWeek();
  if (id === 'progresso') renderProgress();
  if (id === 'admin')     loadAdminPanel();
}

document.getElementById('l-cpf').addEventListener('input', function() { this.value = fmtCpf(this.value); });
document.getElementById('l-senha').addEventListener('keydown', function(e) { if (e.key === 'Enter') doLogin(); });
document.getElementById('i-cpf').addEventListener('input', function() { this.value = fmtCpf(this.value); });
