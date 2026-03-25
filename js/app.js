function showApp() {
  showScreen('app');
  document.getElementById('nav-cpf').textContent = fmtCpfDisplay(currentUser.cpf);
  const roleEl = document.getElementById('nav-role');
  if (isMaster) {
    roleEl.textContent = 'MASTER'; roleEl.className = 'nav-role role-master';
    document.getElementById('nav-admin').style.display = '';
  } else {
    roleEl.textContent = 'VIEWER'; roleEl.className = 'nav-role role-viewer';
    document.getElementById('nav-admin').style.display = 'none';
  }
  buildChecklist(); renderProgress(); updateHeaderStats();
}
