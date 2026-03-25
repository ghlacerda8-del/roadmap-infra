let userProgress = { checked: {}, studiedDays: [] };
let saveTimer = null;
const LOC_KEY = 'roadmap_v5';

async function loadProgressFromDB() {
  if (!sb || !currentUser?.id) {
    try { const s = JSON.parse(localStorage.getItem(LOC_KEY)); if (s) userProgress = s; } catch (e) { }
    return;
  }
  const { data } = await sb.from('progresso').select('dados').eq('user_id', currentUser.id).single();
  if (data?.dados) userProgress = data.dados;
  else { try { const s = JSON.parse(localStorage.getItem(LOC_KEY)); if (s) userProgress = s; } catch (e) { } }
}

function scheduleSave() {
  setSyncStatus('saving');
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveProgress, 1200);
}

async function saveProgress() {
  localStorage.setItem(LOC_KEY, JSON.stringify(userProgress));
  if (!sb || !currentUser?.id) { setSyncStatus('ok'); return; }
  const { error } = await sb.from('progresso').upsert(
    { user_id: currentUser.id, user_cpf: currentUser.cpf, dados: userProgress, updated_at: new Date().toISOString() },
    { onConflict: 'user_id' }
  );
  setSyncStatus(error ? 'err' : 'ok');
}

function setSyncStatus(s) {
  const el = document.getElementById('sync-status');
  if (!el) return;
  if (s === 'ok') { el.className = 'sync-badge sync-ok'; el.textContent = '● salvo'; }
  if (s === 'saving') { el.className = 'sync-badge sync-ing'; el.textContent = '↑ salvando...'; }
  if (s === 'err') { el.className = 'sync-badge sync-err'; el.textContent = '✕ erro'; }
}
