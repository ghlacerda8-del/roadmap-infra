function buildChecklist() {
  const c = document.getElementById('cl-container'); c.innerHTML = '';
  PHASES.forEach(phase => {
    const done = phase.items.filter(i => userProgress.checked[i.id]).length;
    const pct  = Math.round((done / phase.items.length) * 100);
    const div  = document.createElement('div'); div.className = 'cl-phase';
    div.innerHTML = `
      <div class="cl-phase-header" onclick="togglePhase('${escapeHtml(phase.id)}')">
        <div class="cl-dot" style="background:${escapeHtml(phase.color)}"></div>
        <div class="cl-phase-name">${escapeHtml(phase.label)}</div>
        <div class="cl-phase-meta">
          <span class="cl-phase-count">${done}/${phase.items.length}</span>
          <span class="cl-phase-pct" style="color:${escapeHtml(phase.color)}">${pct}%</span>
        </div>
      </div>
      <div class="cl-pbar"><div class="cl-pbar-fill" style="width:${pct}%;background:${escapeHtml(phase.color)}"></div></div>
      <div class="cl-items" id="cl-items-${escapeHtml(phase.id)}">
        ${phase.items.map(item => `
          <div class="cl-item${userProgress.checked[item.id] ? ' checked' : ''}" onclick="toggleItem('${escapeHtml(item.id)}')">
            <div class="cl-box"><span class="cl-check-icon">✓</span></div>
            <div class="cl-text">${escapeHtml(item.text)}</div>
            <span class="cl-tag t-${escapeHtml(item.tag)}">${escapeHtml(item.tag)}</span>
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
