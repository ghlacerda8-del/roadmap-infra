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
    // Renomeia abas para linguagem amigável ao visitante
    const roadmapBtn    = document.querySelector(`[onclick="showPage('roadmap')"]`);
    const cronogramaBtn = document.querySelector(`[onclick="showPage('cronograma')"]`);
    if (roadmapBtn)    roadmapBtn.textContent    = 'Plano de Carreira';
    if (cronogramaBtn) cronogramaBtn.textContent = 'Cronograma de Estudos';
    showPage('curriculo');
    return;
  }

  // Garante que todos os botões de nav estejam visíveis e com nomes originais
  ['progresso', 'semana', 'checklist', 'roadmap', 'cronograma', 'curriculo'].forEach(page => {
    const btn = document.querySelector(`[onclick="showPage('${page}')"]`);
    if (btn) btn.style.display = '';
  });
  // Restaura nomes originais caso tenha entrado como visitante antes
  const roadmapBtnR    = document.querySelector(`[onclick="showPage('roadmap')"]`);
  const cronogramaBtnR = document.querySelector(`[onclick="showPage('cronograma')"]`);
  if (roadmapBtnR)    roadmapBtnR.textContent    = 'Roadmap';
  if (cronogramaBtnR) cronogramaBtnR.textContent = 'Cronograma';

  const display = currentUser.cpf.includes('@') ? currentUser.cpf : fmtCpfDisplay(currentUser.cpf);
  document.getElementById('nav-cpf').textContent = display;

  if (isMaster) {
    roleEl.textContent = 'MASTER'; roleEl.className = 'nav-role role-master';
    document.getElementById('nav-admin').style.display = '';
  } else {
    roleEl.textContent = 'VIEWER'; roleEl.className = 'nav-role role-viewer';
    document.getElementById('nav-admin').style.display = 'none';
  }
  buildChecklist(); updateHeaderStats();
  showPage('progresso');
}
