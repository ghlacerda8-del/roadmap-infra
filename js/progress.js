function renderProgress() {
  const all = PHASES.flatMap(p => p.items), total = all.length;
  const done = all.filter(i => userProgress.checked[i.id]).length;
  const pct  = total ? Math.round((done / total) * 100) : 0;

  document.getElementById('pct-num').textContent         = pct;
  document.getElementById('pbar-geral').style.width      = pct + '%';
  document.getElementById('ps-done').textContent         = done;
  document.getElementById('ps-total').textContent        = total;
  const streak = calcStreak();
  document.getElementById('ps-streak').textContent       = streak + (streak > 0 ? ' 🔥' : '');
  document.getElementById('ps-dias').textContent         = (userProgress.studiedDays || []).length;
  document.getElementById('ps-eta').textContent          = calcETA(done, total);

  const wrap = document.getElementById('phase-prog-wrap'); wrap.innerHTML = '';
  PHASES.forEach(p => {
    const pd = p.items.filter(i => userProgress.checked[i.id]).length;
    const pp = Math.round((pd / p.items.length) * 100);
    wrap.innerHTML += `
      <div style="background:var(--bg3);border-radius:9px;padding:14px">
        <div style="font-size:12px;font-weight:600;margin-bottom:2px;color:${p.color}">${p.label}</div>
        <div style="font-size:11px;color:var(--muted);margin-bottom:7px">${p.period}</div>
        <div style="background:rgba(255,255,255,.05);border-radius:3px;height:4px;margin-bottom:5px;overflow:hidden">
          <div style="width:${pp}%;height:100%;border-radius:3px;background:${p.color};transition:width .4s"></div>
        </div>
        <div style="font-family:var(--mono);font-size:11px;color:${p.color}">${pp}% · ${pd}/${p.items.length}</div>
      </div>`;
  });
  renderHeatmap();
  const rh = document.getElementById('reminder-hour');
  if (rh) rh.value = userProgress.reminderHour || 19;
}

function calcStreak() {
  const days = userProgress.studiedDays || []; if (!days.length) return 0;
  const today = dateKey(new Date()), yest = dateKey(new Date(Date.now() - 86400000));
  if (!days.includes(today) && !days.includes(yest)) return 0;
  let streak = 0, check = new Date();
  if (days.includes(yest) && !days.includes(today)) check.setDate(check.getDate() - 1);
  while (true) { if (!days.includes(dateKey(check))) break; streak++; check.setDate(check.getDate() - 1); }
  return streak;
}

function calcETA(done, total) {
  const dias = (userProgress.studiedDays || []).length;
  if (done === 0 || dias < 2) return 'Estude mais dias';
  if (done === total) return 'Concluído! 🎉';
  const eta = new Date();
  eta.setDate(eta.getDate() + Math.ceil((total - done) / (done / dias)));
  return eta.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
}

function renderHeatmap() {
  const wrap = document.getElementById('heatmap'); wrap.innerHTML = '';
  const today = new Date(), days = userProgress.studiedDays || [];
  for (let i = 59; i >= 0; i--) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    const key = dateKey(d), el = document.createElement('div');
    el.className = 'hm-day' + (days.includes(key) ? ' studied' : '') + (i === 0 ? ' hm-today' : '');
    el.title = d.toLocaleDateString('pt-BR') + (days.includes(key) ? ' ✓' : '');
    wrap.appendChild(el);
  }
}

function updateHeaderStats() {
  const all  = PHASES.flatMap(p => p.items);
  const done = all.filter(i => userProgress.checked[i.id]).length;
  document.getElementById('h-pct').textContent    = Math.round((done / all.length) * 100) + '%';
  document.getElementById('h-streak').textContent = calcStreak();
}

function confirmReset() {
  if (confirm('Apagar todo o progresso?')) {
    const currentRh = userProgress.reminderHour || 19;
    userProgress = { checked: {}, studiedDays: [], reminderHour: currentRh };
    buildChecklist(); renderProgress(); updateHeaderStats(); scheduleSave();
  }
}

async function loadLandingCareerCard() {
  let checked = {}, studiedDays = [];
  try {
    const { data } = await sb.from('progresso').select('dados').eq('user_cpf', MASTER_CPF).maybeSingle();
    if (data?.dados) { checked = data.dados.checked || {}; studiedDays = data.dados.studiedDays || []; }
  } catch(e) {}

  const all = PHASES.flatMap(p => p.items);
  const done = all.filter(i => checked[i.id]).length;
  const pct  = all.length ? Math.round((done / all.length) * 100) : 0;

  const pctLabel = document.getElementById('lp-pct-label');
  const pctFill  = document.getElementById('lp-pct-fill');
  if (pctLabel) pctLabel.textContent = pct > 0 ? pct + '%' : 'Em andamento';
  if (pctFill)  pctFill.style.width  = pct + '%';

  const phasesEl = document.getElementById('lp-career-phases');
  if (phasesEl) {
    phasesEl.innerHTML = '';
    PHASES.forEach((p, idx) => {
      if (idx > 1) return;
      const pd  = p.items.filter(i => checked[i.id]).length;
      const pp  = Math.round((pd / p.items.length) * 100);
      phasesEl.innerHTML += `<div class="lp-phase-row">
        <span class="lp-phase-lbl">Fase ${idx}</span>
        <div class="lp-cert-bar"><div class="lp-cert-fill" style="width:${pp}%;background:${p.color}"></div></div>
        <span class="lp-phase-pct">${pp}%</span>
      </div>`;
    });
  }

  const streakEl = document.getElementById('lp-streak');
  if (streakEl) {
    streakEl.innerHTML = '';
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today); d.setDate(today.getDate() - i);
      const on   = studiedDays.includes(dateKey(d));
      const blur = i < 3 ? ' lp-blur' : '';
      const sq   = document.createElement('div');
      sq.className = 'lp-streak-sq' + (on ? ' lp-streak-on' : '') + blur;
      streakEl.appendChild(sq);
    }
  }
}

function updateReminderHour() {
  const rh = document.getElementById('reminder-hour');
  if (rh) {
    userProgress.reminderHour = parseInt(rh.value, 10) || 19;
    scheduleSave();
  }
}
