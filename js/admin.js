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

const CV_FORMACAO_DEFAULT = [
  { course: 'Análise e Desenvolvimento de Sistemas', institution: 'Universidade Estácio de Sá', type: 'Graduação', period: 'Concluído em 2024.2' }
];

const CV_IDIOMAS_DEFAULT = [
  { name: 'Português', level: 'Domínio', pct: 100 },
  { name: 'Inglês',    level: 'Básico',  pct: 25  },
];

const CV_EXPERIENCIAS_DEFAULT = [
  {
    role: 'Suporte ao Usuário e Infraestrutura',
    company: 'Faculdade Famart',
    location: 'Belo Horizonte, MG',
    period: '05/2025 – Atual',
    items: [
      'Suporte técnico direto ao usuário, resolvendo incidentes de hardware e software.',
      'Implementação de automações com Python para otimização do fluxo de trabalho e suporte.',
      'Manutenção e monitoramento dos ativos de rede e da infraestrutura de TI.',
      'Consultas em banco de dados SQL para suporte aos sistemas internos da faculdade.',
    ]
  },
  {
    role: 'Técnico de Suporte e Redes',
    company: 'SI – Automação Comercial',
    location: 'Belo Horizonte, MG',
    period: '05/2024 – 05/2025',
    items: [
      'Manutenção de equipamentos de TI, incluindo impressoras térmicas e hardware diverso.',
      'Montagem e estruturação de racks de redes e organização de cabeamento estruturado.',
      'Configuração e manutenção de servidores e estações de trabalho em Windows e Linux.',
      'Suporte técnico focado na rápida identificação e resolução de problemas críticos.',
    ]
  },
  {
    role: 'Atendimento Técnico',
    company: 'AeC – Centro de Contatos',
    location: 'Belo Horizonte, MG',
    period: '11/2021 – 04/2024',
    items: [
      'Suporte ao cliente via telefone, e-mail e chat, garantindo resolução eficaz de chamados.',
      'Colaboração em equipe para criar soluções eficientes para problemas técnicos recorrentes.',
      'Manutenção de registros detalhados das interações para melhoria contínua dos processos.',
    ]
  }
];

const LEVEL_OPTIONS  = ['Avançado', 'Intermediário', 'Básico', 'Em estudo'];
const LEVEL_PCT_AUTO = { 'Avançado': 85, 'Intermediário': 65, 'Básico': 45, 'Em estudo': 25 };

const LEVEL_STYLE = {
  'Avançado':      { cls: 'cv-lvl-av',  color: 'var(--teal)'   },
  'Intermediário': { cls: 'cv-lvl-int', color: 'var(--blue)'   },
  'Básico':        { cls: 'cv-lvl-bas', color: 'var(--purple)' },
  'Em estudo':     { cls: 'cv-lvl-bas', color: 'var(--purple)' },
};

function onSkillLevelChange(sel) {
  const row      = sel.closest('.cv-admin-skill-row');
  const skillKey = row.dataset.skillName;
  const level    = sel.value;
  const pct      = LEVEL_PCT_AUTO[level] ?? 50;
  const lv       = LEVEL_STYLE[level] || LEVEL_STYLE['Básico'];

  // Atualiza barra ao vivo no currículo
  const cvRow = skillKey && document.querySelector(`.cv-skill-row[data-skill="${skillKey}"]`);
  if (cvRow) {
    if (level === 'Em estudo') {
      cvRow.style.display = 'none';
    } else {
      cvRow.style.display = '';
      const fill  = cvRow.querySelector('.cv-skill-fill');
      const lvlEl = cvRow.querySelector('.cv-skill-lvl');
      if (fill)  { fill.style.width = pct + '%'; fill.style.background = lv.color; }
      if (lvlEl) { lvlEl.className = `cv-skill-lvl ${lv.cls}`; lvlEl.textContent = level; }
    }
  }

  // Reordena container do currículo do maior para o menor nível
  const cvContainer = document.querySelector('.cv-skills-main');
  if (cvContainer) {
    Array.from(cvContainer.querySelectorAll('.cv-skill-row'))
      .sort((a, b) => {
        const la = a.querySelector('.cv-skill-lvl')?.textContent?.trim() || '';
        const lb = b.querySelector('.cv-skill-lvl')?.textContent?.trim() || '';
        return (LEVEL_PCT_AUTO[lb] || 0) - (LEVEL_PCT_AUTO[la] || 0);
      })
      .forEach(r => cvContainer.appendChild(r));
  }
}

const ROW_STYLE  = 'display:flex;align-items:center;gap:8px;margin-bottom:8px;flex-wrap:wrap';
const INPUT_STYLE = 'background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:5px 8px;font-size:11px;color:var(--text);font-family:var(--mono)';
const BTN_DEL    = 'background:transparent;border:1px solid var(--border);border-radius:6px;color:var(--muted);font-size:13px;line-height:1;padding:4px 8px;cursor:pointer';
const BTN_ADD    = 'margin-top:4px;background:transparent;border:1px dashed var(--border);border-radius:6px;color:var(--teal);font-family:var(--mono);font-size:11px;padding:4px 12px;cursor:pointer;width:100%';

function escHtml(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ─── Skills ───────────────────────────────────────────────────────────────────

function buildSkillRow(sk) {
  const levelOpts = LEVEL_OPTIONS.map(l =>
    `<option value="${l}"${sk.level === l ? ' selected' : ''}>${l}</option>`
  ).join('');
  return `
    <div class="cv-admin-skill-row" data-skill-name="${escHtml(sk.name)}" style="${ROW_STYLE}">
      <input class="cv-skill-label-input" type="text" value="${escHtml(sk.label)}" placeholder="Nome da skill"
        style="${INPUT_STYLE};min-width:140px;flex:1">
      <select data-cv-field="level" style="${INPUT_STYLE}" onchange="onSkillLevelChange(this)">${levelOpts}</select>
      <button onclick="deleteSkillRow(this)" style="${BTN_DEL}" title="Remover skill">✕</button>
    </div>`;
}

function addSkillRow() {
  const container = document.getElementById('cv-skills-admin-list');
  if (!container) return;
  container.insertAdjacentHTML('beforeend', buildSkillRow({ name: '', label: '', level: 'Básico', pct: 45 }));
}

function deleteSkillRow(btn) {
  btn.closest('.cv-admin-skill-row').remove();
}

// ─── Experiências ──────────────────────────────────────────────────────────────

function buildExpItem(item) {
  return `
    <div class="cv-admin-exp-item" style="display:flex;align-items:center;gap:6px;margin-bottom:5px">
      <input type="text" value="${escHtml(item)}" placeholder="Descreva a atividade..."
        style="${INPUT_STYLE};flex:1">
      <button onclick="this.closest('.cv-admin-exp-item').remove()" style="${BTN_DEL}">✕</button>
    </div>`;
}

function buildExpBlock(exp, idx) {
  const itemsHtml = (exp.items || []).map(buildExpItem).join('');
  return `
    <div class="cv-admin-exp-block" style="background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:14px;margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <div style="font-size:11px;font-weight:600;color:var(--teal)">Experiência ${idx + 1}</div>
        <button onclick="this.closest('.cv-admin-exp-block').remove()" style="${BTN_DEL};font-size:11px">✕ Remover</button>
      </div>
      <div style="${ROW_STYLE}">
        <input type="text" value="${escHtml(exp.role)}" placeholder="Cargo / Função" data-exp-field="role"
          style="${INPUT_STYLE};flex:2;min-width:140px">
        <input type="text" value="${escHtml(exp.period)}" placeholder="Período (ex: 05/2024 – Atual)" data-exp-field="period"
          style="${INPUT_STYLE};flex:1;min-width:120px">
      </div>
      <div style="${ROW_STYLE}">
        <input type="text" value="${escHtml(exp.company)}" placeholder="Empresa" data-exp-field="company"
          style="${INPUT_STYLE};flex:2;min-width:140px">
        <input type="text" value="${escHtml(exp.location)}" placeholder="Cidade, Estado" data-exp-field="location"
          style="${INPUT_STYLE};flex:1;min-width:100px">
      </div>
      <div style="font-size:10px;color:var(--muted);margin:6px 0 4px">Atividades:</div>
      <div class="cv-admin-exp-items">${itemsHtml}</div>
      <button onclick="addExpItem(this)" style="${BTN_ADD}">＋ Adicionar atividade</button>
    </div>`;
}

function addExpItem(btn) {
  const container = btn.previousElementSibling;
  container.insertAdjacentHTML('beforeend', buildExpItem(''));
}

function addExpBlock() {
  const container = document.getElementById('cv-admin-exp-list');
  if (!container) return;
  const idx = container.querySelectorAll('.cv-admin-exp-block').length;
  container.insertAdjacentHTML('beforeend', buildExpBlock({ role: '', company: '', location: '', period: '', items: [''] }, idx));
}

// ─── Formação ─────────────────────────────────────────────────────────────────

function buildFormacaoRow(f) {
  return `
    <div class="cv-admin-formacao-row" style="${ROW_STYLE};background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:10px;margin-bottom:8px">
      <input type="text" value="${escHtml(f.course)}" placeholder="Curso" data-form-field="course"
        style="${INPUT_STYLE};flex:2;min-width:140px">
      <input type="text" value="${escHtml(f.institution)}" placeholder="Instituição" data-form-field="institution"
        style="${INPUT_STYLE};flex:2;min-width:120px">
      <input type="text" value="${escHtml(f.type)}" placeholder="Tipo (ex: Graduação)" data-form-field="type"
        style="${INPUT_STYLE};min-width:100px">
      <input type="text" value="${escHtml(f.period)}" placeholder="Período" data-form-field="period"
        style="${INPUT_STYLE};min-width:120px">
      <button onclick="this.closest('.cv-admin-formacao-row').remove()" style="${BTN_DEL}">✕</button>
    </div>`;
}

function addFormacaoRow() {
  const container = document.getElementById('cv-admin-formacao-list');
  if (!container) return;
  container.insertAdjacentHTML('beforeend', buildFormacaoRow({ course: '', institution: '', type: '', period: '' }));
}

// ─── Idiomas ──────────────────────────────────────────────────────────────────

function buildIdiomaRow(lang) {
  return `
    <div class="cv-admin-idioma-row" style="${ROW_STYLE};background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:10px;margin-bottom:8px">
      <input type="text" value="${escHtml(lang.name)}" placeholder="Idioma" data-lang-field="name"
        style="${INPUT_STYLE};min-width:100px;flex:1">
      <input type="text" value="${escHtml(lang.level)}" placeholder="Nível (ex: Domínio, Básico)" data-lang-field="level"
        style="${INPUT_STYLE};min-width:100px;flex:1">
      <input type="number" min="0" max="100" value="${lang.pct}" data-lang-field="pct"
        style="${INPUT_STYLE};width:56px">
      <span style="font-size:11px;color:var(--muted)">%</span>
      <button onclick="this.closest('.cv-admin-idioma-row').remove()" style="${BTN_DEL}">✕</button>
    </div>`;
}

function addIdiomaRow() {
  const container = document.getElementById('cv-admin-idiomas-list');
  if (!container) return;
  container.insertAdjacentHTML('beforeend', buildIdiomaRow({ name: '', level: '', pct: 50 }));
}

// ─── Build admin panel ────────────────────────────────────────────────────────

async function buildCvAdminSection() {
  const section = document.getElementById('cv-admin-section');
  if (!section) return;

  let resumo      = '';
  let skills      = CV_SKILLS_DEFAULT.map(s => ({ ...s }));
  let experiencias = CV_EXPERIENCIAS_DEFAULT.map(e => ({ ...e, items: [...e.items] }));
  let formacao    = CV_FORMACAO_DEFAULT.map(f => ({ ...f }));
  let idiomas     = CV_IDIOMAS_DEFAULT.map(l => ({ ...l }));

  try {
    const { data } = await sb.from('cv_settings').select('key,value');
    if (data) {
      const map = Object.fromEntries(data.map(r => [r.key, r.value]));
      if (map.resumo) resumo = map.resumo;
      if (Array.isArray(map.skills)       && map.skills.length       > 0) {
        skills = map.skills.map(sk => ({
          name:  sk.name  || '',
          label: sk.label || CV_SKILLS_DEFAULT.find(d => d.name === sk.name)?.label || sk.name,
          level: sk.level || 'Básico',
          pct:   sk.pct   ?? 0,
        }));
      }
      if (Array.isArray(map.experiencias) && map.experiencias.length > 0) experiencias = map.experiencias;
      if (Array.isArray(map.formacao)     && map.formacao.length     > 0) formacao     = map.formacao;
      if (Array.isArray(map.idiomas)      && map.idiomas.length      > 0) idiomas      = map.idiomas;
    }
  } catch(e) {}

  const card    = 'background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:18px 20px;margin-bottom:14px';
  const sub     = 'font-size:12px;font-weight:600;color:var(--text);margin-bottom:12px';
  const addBtn  = 'margin-top:6px;background:transparent;border:1px dashed var(--border);border-radius:6px;color:var(--teal);font-family:var(--mono);font-size:11px;padding:6px 14px;cursor:pointer;width:100%';

  section.innerHTML = `
    <div style="${card}">
      <div style="${sub}">Resumo Profissional</div>
      <textarea id="cv-admin-resumo" rows="4"
        style="width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:10px 12px;font-size:13px;color:var(--text);font-family:var(--sans);resize:vertical;box-sizing:border-box">${escHtml(resumo)}</textarea>
    </div>

    <div style="${card}">
      <div style="${sub}">Principais Competências</div>
      <div id="cv-skills-admin-list">${skills.map(buildSkillRow).join('')}</div>
      <button onclick="addSkillRow()" style="${addBtn}">＋ Adicionar skill</button>
    </div>

    <div style="${card}">
      <div style="${sub}">Experiência Profissional</div>
      <div id="cv-admin-exp-list">${experiencias.map((e, i) => buildExpBlock(e, i)).join('')}</div>
      <button onclick="addExpBlock()" style="${addBtn}">＋ Adicionar experiência</button>
    </div>

    <div style="${card}">
      <div style="${sub}">Formação</div>
      <div id="cv-admin-formacao-list">${formacao.map(buildFormacaoRow).join('')}</div>
      <button onclick="addFormacaoRow()" style="${addBtn}">＋ Adicionar formação</button>
    </div>

    <div style="${card}">
      <div style="${sub}">Idiomas</div>
      <div id="cv-admin-idiomas-list">${idiomas.map(buildIdiomaRow).join('')}</div>
      <button onclick="addIdiomaRow()" style="${addBtn}">＋ Adicionar idioma</button>
    </div>

    <button onclick="saveCvSettings()" class="btn-sm teal" style="padding:9px 20px">&#10003; Salvar currículo</button>
    <span id="cv-save-confirm" style="font-family:var(--mono);font-size:11px;color:var(--teal);margin-left:10px;display:none">&#10003; Salvo!</span>
  `;
}

// ─── Save ─────────────────────────────────────────────────────────────────────

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
      pct:   LEVEL_PCT_AUTO[row.querySelector('[data-cv-field="level"]')?.value] ?? 45,
    };
  }).filter(s => s.label);

  const experiencias = Array.from(document.querySelectorAll('.cv-admin-exp-block')).map(block => ({
    role:     block.querySelector('[data-exp-field="role"]')?.value.trim()     || '',
    company:  block.querySelector('[data-exp-field="company"]')?.value.trim()  || '',
    location: block.querySelector('[data-exp-field="location"]')?.value.trim() || '',
    period:   block.querySelector('[data-exp-field="period"]')?.value.trim()   || '',
    items:    Array.from(block.querySelectorAll('.cv-admin-exp-item input'))
                .map(inp => inp.value.trim()).filter(Boolean),
  })).filter(e => e.role || e.company);

  const formacao = Array.from(document.querySelectorAll('.cv-admin-formacao-row')).map(row => ({
    course:      row.querySelector('[data-form-field="course"]')?.value.trim()      || '',
    institution: row.querySelector('[data-form-field="institution"]')?.value.trim() || '',
    type:        row.querySelector('[data-form-field="type"]')?.value.trim()        || '',
    period:      row.querySelector('[data-form-field="period"]')?.value.trim()      || '',
  })).filter(f => f.course || f.institution);

  const idiomas = Array.from(document.querySelectorAll('.cv-admin-idioma-row')).map(row => ({
    name:  row.querySelector('[data-lang-field="name"]')?.value.trim()  || '',
    level: row.querySelector('[data-lang-field="level"]')?.value.trim() || '',
    pct:   Math.max(0, Math.min(100, parseInt(row.querySelector('[data-lang-field="pct"]')?.value) || 0)),
  })).filter(l => l.name);

  try {
    await sb.from('cv_settings').upsert([
      { key: 'resumo',       value: resumo       },
      { key: 'skills',       value: skills       },
      { key: 'experiencias', value: experiencias },
      { key: 'formacao',     value: formacao     },
      { key: 'idiomas',      value: idiomas      },
    ], { onConflict: 'key' });
    const confirm = document.getElementById('cv-save-confirm');
    if (confirm) { confirm.style.display = 'inline'; setTimeout(() => confirm.style.display = 'none', 2500); }
    loadCvSettings();
  } catch(e) {
    alert('Erro ao salvar: ' + e.message);
  }
}

// ─── Init ─────────────────────────────────────────────────────────────────────

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
