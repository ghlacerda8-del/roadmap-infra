const CV_SKILLS_DEFAULT = [
  { name: 'suporte',   label: 'Suporte Técnico N1/N2', level: 'Avançado',      pct: 85 },
  { name: 'hardware',  label: 'Hardware & Manutenção',  level: 'Avançado',      pct: 80 },
  { name: 'linux',     label: 'Linux',                  level: 'Intermediário', pct: 65 },
  { name: 'winserver', label: 'Windows Server',         level: 'Intermediário', pct: 65 },
  { name: 'redes',     label: 'Redes & Infraestrutura', level: 'Intermediário', pct: 60 },
  { name: 'python',    label: 'Python',                 level: 'Básico',        pct: 25 },
  { name: 'sql',       label: 'SQL',                    level: 'Intermediário', pct: 55 },
  { name: 'azure',     label: 'Azure',                  level: 'Em estudo',     pct: 30 },
  { name: 'docker',    label: 'Docker & Kubernetes',    level: 'Em estudo',     pct: 25 },
];

const LEVEL_OPTIONS = ['Avançado', 'Intermediário', 'Básico', 'Em estudo'];

const ROW_STYLE = 'display:flex;align-items:center;gap:8px;margin-bottom:8px;flex-wrap:wrap';
const INPUT_STYLE = 'background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:5px 8px;font-size:11px;color:var(--text);font-family:var(--mono)';

function buildSkillRow(sk) {
  const levelOpts = LEVEL_OPTIONS.map(l =>
    `<option value="${l}"${sk.level === l ? ' selected' : ''}>${l}</option>`
  ).join('');
  return `
    <div class="cv-admin-skill-row" data-skill-name="${sk.name}" style="${ROW_STYLE}">
      <input class="cv-skill-label-input" type="text" value="${sk.label}" placeholder="Nome da skill"
        style="${INPUT_STYLE};min-width:140px;flex:1">
      <select data-cv-field="level" style="${INPUT_STYLE}">${levelOpts}</select>
      <input type="number" min="0" max="100" value="${sk.pct}" data-cv-field="pct"
        style="${INPUT_STYLE};width:56px">
      <span style="font-size:11px;color:var(--muted)">%</span>
      <button onclick="deleteSkillRow(this)"
        style="background:transparent;border:1px solid var(--border);border-radius:6px;color:var(--muted);
               font-size:13px;line-height:1;padding:4px 8px;cursor:pointer"
        title="Remover skill">✕</button>
    </div>`;
}

function addSkillRow() {
  const container = document.getElementById('cv-skills-admin-list');
  if (!container) return;
  const newSk = { name: '', label: '', level: 'Básico', pct: 50 };
  container.insertAdjacentHTML('beforeend', buildSkillRow(newSk));
}

function deleteSkillRow(btn) {
  btn.closest('.cv-admin-skill-row').remove();
}

async function buildCvAdminSection() {
  const section = document.getElementById('cv-admin-section');
  if (!section) return;

  let resumo = '';
  let skills = CV_SKILLS_DEFAULT.map(s => ({ ...s }));
  try {
    const { data } = await sb.from('cv_settings').select('key,value');
    if (data) {
      const map = Object.fromEntries(data.map(r => [r.key, r.value]));
      if (map.resumo) resumo = map.resumo;
      if (Array.isArray(map.skills) && map.skills.length > 0) {
        skills = map.skills.map(sk => ({
          name:  sk.name  || '',
          label: sk.label || CV_SKILLS_DEFAULT.find(d => d.name === sk.name)?.label || sk.name,
          level: sk.level || 'Básico',
          pct:   sk.pct   ?? 0,
        }));
      }
    }
  } catch(e) {}

  const skillRows = skills.map(buildSkillRow).join('');

  section.innerHTML = `
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:18px 20px;margin-bottom:14px">
      <div style="font-size:12px;font-weight:600;color:var(--text);margin-bottom:8px">Resumo Profissional</div>
      <textarea id="cv-admin-resumo" rows="4"
        style="width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:10px 12px;font-size:13px;color:var(--text);font-family:var(--sans);resize:vertical;box-sizing:border-box">${resumo}</textarea>
    </div>
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:18px 20px;margin-bottom:14px">
      <div style="font-size:12px;font-weight:600;color:var(--text);margin-bottom:14px">Skills — Nível e Porcentagem</div>
      <div id="cv-skills-admin-list">${skillRows}</div>
      <button onclick="addSkillRow()"
        style="margin-top:6px;background:transparent;border:1px dashed var(--border);border-radius:6px;
               color:var(--teal);font-family:var(--mono);font-size:11px;padding:6px 14px;cursor:pointer;width:100%">
        ＋ Adicionar skill
      </button>
    </div>
    <button onclick="saveCvSettings()" class="btn-sm teal" style="padding:9px 20px">&#10003; Salvar currículo</button>
    <span id="cv-save-confirm" style="font-family:var(--mono);font-size:11px;color:var(--teal);margin-left:10px;display:none">&#10003; Salvo!</span>
  `;
}

async function saveCvSettings() {
  const resumo = (document.getElementById('cv-admin-resumo')?.value || '').trim();

  const skills = Array.from(document.querySelectorAll('.cv-admin-skill-row')).map(row => {
    const label = row.querySelector('.cv-skill-label-input')?.value.trim() || '';
    const existingName = row.dataset.skillName;
    const name = existingName
      || label.toLowerCase().replace(/[\s&\/]+/g, '_').replace(/[^a-z0-9_]/g, '')
         + '_' + Math.random().toString(36).slice(2, 5);
    return {
      name,
      label,
      level: row.querySelector('[data-cv-field="level"]')?.value || 'Básico',
      pct:   Math.max(0, Math.min(100, parseInt(row.querySelector('[data-cv-field="pct"]')?.value) || 0)),
    };
  }).filter(s => s.label);

  try {
    await sb.from('cv_settings').upsert(
      [{ key: 'resumo', value: resumo }, { key: 'skills', value: skills }],
      { onConflict: 'key' }
    );
    const confirm = document.getElementById('cv-save-confirm');
    if (confirm) { confirm.style.display = 'inline'; setTimeout(() => confirm.style.display = 'none', 2500); }
    loadCvSettings();
  } catch(e) {
    alert('Erro ao salvar: ' + e.message);
  }
}

async function loadAdminPanel() {
  const urlEl = document.getElementById('portfolio-url-txt');
  if (urlEl) urlEl.textContent = location.origin + location.pathname;
  buildCvAdminSection();
}

function copyPortfolioLink() {
  const url = location.origin + location.pathname;
  navigator.clipboard.writeText(url).then(() => {
    const el = document.getElementById('copy-confirm');
    if (el) { el.style.display = 'block'; setTimeout(() => el.style.display = 'none', 2500); }
  }).catch(() => { prompt('Copie o link abaixo:', url); });
}

function sharePortfolioWhatsApp() {
  const url = location.origin + location.pathname;
  const msg = encodeURIComponent(`Olá! Confira o portfólio de TI e Infraestrutura:\n${url}`);
  window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
}
