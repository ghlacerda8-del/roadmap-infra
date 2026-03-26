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
  const btn = document.querySelector(`[onclick="showPage('${id}')"]`);
  if (btn) btn.classList.add('active');
  if (id === 'semana')    renderWeek();
  if (id === 'progresso') renderProgress();
  if (id === 'admin')     loadAdminPanel();
}

document.getElementById('l-cpf').addEventListener('input', function() { this.value = fmtCpf(this.value); });
document.getElementById('l-senha').addEventListener('keydown', function(e) { if (e.key === 'Enter') doLogin(); });

function openPhaseModal(pid) {
  const phase = PHASES.find(p => p.id === pid);
  if (!phase) return;
  document.getElementById('pm-phase').textContent = phase.label.split('—')[0].trim();
  document.getElementById('pm-phase').style.color = phase.color;
  document.getElementById('pm-title').textContent = phase.label.split('—')[1]?.trim() || phase.label;
  document.getElementById('pm-period').textContent = phase.period;
  
  let html = '';
  phase.items.forEach((item, idx) => {
    const isDone = userProgress?.checked && userProgress.checked[item.id];
    const icon = isDone ? '✓' : (idx + 1);
    const opacity = isDone ? '0.6' : '1';
    const textDecor = isDone ? 'line-through' : 'none';
    
    html += `
      <div class="pm-item" style="opacity: ${opacity}">
        <div class="pm-item-icon" style="color: ${isDone ? '#00e5a0' : phase.color}">${icon}</div>
        <div class="pm-item-content">
          <div class="pm-item-text" style="text-decoration: ${textDecor}">${item.text}</div>
          <div class="pm-item-tag">${item.tag.toUpperCase()}</div>
        </div>
      </div>
    `;
  });
  document.getElementById('pm-body').innerHTML = html;
  
  const modalWrap = document.getElementById('phase-modal');
  modalWrap.style.display = 'flex'; // Ensure it's not display:none if hidden globally
  // Small delay for CSS transition to trigger
  setTimeout(() => modalWrap.classList.add('active'), 10);
}

function closePhaseModal(e) {
  if (e) e.stopPropagation();
  const modalWrap = document.getElementById('phase-modal');
  modalWrap.classList.remove('active');
  // Optional: setTimeout(() => modalWrap.style.display='none', 300);
}
