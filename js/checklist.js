function buildChecklist() {
  const c = document.getElementById('cl-container'); c.innerHTML = '';
  PHASES.forEach(phase => {
    const done = phase.items.filter(i => userProgress.checked[i.id]).length;
    const pct  = Math.round((done / phase.items.length) * 100);
    const div  = document.createElement('div'); div.className = 'cl-phase';
    div.innerHTML = `
      <div class="cl-phase-header" onclick="togglePhase('${phase.id}')">
        <div class="cl-dot" style="background:${phase.color}"></div>
        <div class="cl-phase-name">${phase.label}</div>
        <div class="cl-phase-meta">
          <span class="cl-phase-count">${done}/${phase.items.length}</span>
          <span class="cl-phase-pct" style="color:${phase.color}">${pct}%</span>
        </div>
      </div>
      <div class="cl-pbar"><div class="cl-pbar-fill" style="width:${pct}%;background:${phase.color}"></div></div>
      <div class="cl-items" id="cl-items-${phase.id}">
        ${phase.items.map(item => `
          <div class="cl-item${userProgress.checked[item.id] ? ' checked' : ''}" onclick="toggleItem('${item.id}')">
            <div class="cl-box"><span class="cl-check-icon">✓</span></div>
            <div class="cl-text">${item.text}</div>
            <span class="cl-tag t-${item.tag}">${item.tag}</span>
          </div>`).join('')}
      </div>`;
    c.appendChild(div);
  });
}

function toggleItem(id) {
  if (isVisitor) return;
  userProgress.checked[id] = !userProgress.checked[id];
  buildChecklist(); renderProgress(); updateHeaderStats(); scheduleSave();
}

function togglePhase(id) {
  const el = document.getElementById('cl-items-' + id);
  el.style.display = el.style.display === 'none' ? '' : 'none';
}
