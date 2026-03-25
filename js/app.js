function showApp() {
  showScreen('app');

  const roleEl = document.getElementById('nav-role');

  if (isVisitor) {
    document.getElementById('nav-cpf').textContent = 'Visitante';
    roleEl.textContent = 'VISITANTE'; roleEl.className = 'nav-role role-visitor';
    document.getElementById('nav-admin').style.display = 'none';
    // Esconde botões de nav irrelevantes para visitante
    ['progresso', 'semana', 'checklist'].forEach(page => {
      const btn = document.querySelector(`[onclick="showPage('${page}')"]`);
      if (btn) btn.style.display = 'none';
    });
    showPage('roadmap');
    return;
  }

  // Garante que todos os botões de nav estejam visíveis (para usuários que retornam após visitor)
  ['progresso', 'semana', 'checklist', 'roadmap', 'cronograma'].forEach(page => {
    const btn = document.querySelector(`[onclick="showPage('${page}')"]`);
    if (btn) btn.style.display = '';
  });

  const display = currentUser.cpf.includes('@') ? currentUser.cpf : fmtCpfDisplay(currentUser.cpf);
  document.getElementById('nav-cpf').textContent = display;

  if (isMaster) {
    roleEl.textContent = 'MASTER'; roleEl.className = 'nav-role role-master';
    document.getElementById('nav-admin').style.display = '';
  } else {
    roleEl.textContent = 'VIEWER'; roleEl.className = 'nav-role role-viewer';
    document.getElementById('nav-admin').style.display = 'none';
  }
  buildChecklist(); renderProgress(); updateHeaderStats();
}
