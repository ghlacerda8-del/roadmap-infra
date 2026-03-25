let weekOffset = 0;

function getWeekDates(off) {
  const t = new Date(), dow = t.getDay();
  const mon = new Date(t);
  mon.setDate(t.getDate() - (dow === 0 ? 6 : dow - 1) + (off * 7));
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(mon); d.setDate(mon.getDate() + i); return d;
  });
}

function renderWeek() {
  const dates = getWeekDates(weekOffset), today = dateKey(new Date());
  const fmt = d => d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  document.getElementById('wv-label').textContent =
    `Semana: ${fmt(dates[0])} – ${fmt(dates[4])}${weekOffset === 0 ? ' (atual)' : ''}`;
  const c = document.getElementById('week-days'); c.innerHTML = '';
  dates.forEach((d, i) => {
    const key = dateKey(d), isToday = key === today;
    const isDone = (userProgress.studiedDays || []).includes(key);
    const info = WEEK_SCHEDULE[i], card = document.createElement('div');
    card.className = `wdc${isDone ? ' done' : ''}${isToday ? ' today-card' : ''}`;
    card.innerHTML = `
      <div class="wdc-head">
        <span class="wdc-name">${info.name}</span>
        <span class="wdc-date">${d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
      </div>
      <div class="wdc-tema">${info.tema}</div>
      <div class="wdc-detalhe">${info.detalhe}</div>
      <div class="wdc-btn">${isDone ? '✓ Estudei este dia' : '○ Marcar como estudado'}</div>`;
    card.onclick = () => toggleStudyDay(key);
    c.appendChild(card);
  });
}

function toggleStudyDay(key) {
  if (!userProgress.studiedDays) userProgress.studiedDays = [];
  const idx = userProgress.studiedDays.indexOf(key);
  if (idx >= 0) userProgress.studiedDays.splice(idx, 1);
  else          userProgress.studiedDays.push(key);
  renderWeek(); renderProgress(); updateHeaderStats(); scheduleSave();
}
