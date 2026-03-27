const EXPERIENCES = [
  {
    id: 'famart',
    company: 'Faculdade Famart',
    role: 'Suporte ao Usuário e Infraestrutura',
    period: '05/2025 – Atual · Belo Horizonte, MG',
    color: 'var(--teal)',
    items: [
      { text: 'Suporte técnico direto ao usuário, resolvendo incidentes de hardware e software com foco em agilidade e satisfação.', tag: 'Suporte N1/N2' },
      { text: 'Desenvolvimento e implementação de automações com Python para otimização do fluxo de trabalho e processos de suporte.', tag: 'Automação' },
      { text: 'Manutenção e monitoramento contínuo dos ativos de rede e infraestrutura de TI da instituição.', tag: 'Infraestrutura' },
      { text: 'Realização de consultas e manutenção em banco de dados SQL para suporte aos sistemas internos da faculdade.', tag: 'SQL' },
    ]
  },
  {
    id: 'si',
    company: 'SI – Automação Comercial',
    role: 'Técnico de Suporte e Redes',
    period: '05/2024 – 05/2025 · Belo Horizonte, MG',
    color: 'var(--blue)',
    items: [
      { text: 'Manutenção de equipamentos de TI, incluindo impressoras térmicas e hardware diverso.', tag: 'Hardware' },
      { text: 'Montagem e estruturação de racks de redes e organização de cabeamento estruturado.', tag: 'Redes' },
      { text: 'Configuração e manutenção de servidores e estações de trabalho em Windows e Linux.', tag: 'Sistemas' },
      { text: 'Suporte técnico com foco na rápida identificação e resolução de problemas críticos.', tag: 'Suporte' },
    ]
  },
  {
    id: 'aec',
    company: 'AeC – Centro de Contatos',
    role: 'Atendimento Técnico',
    period: '11/2021 – 04/2024 · Belo Horizonte, MG',
    color: 'var(--amber)',
    items: [
      { text: 'Suporte ao cliente via telefone, e-mail e chat com resolução eficaz de chamados técnicos.', tag: 'Atendimento' },
      { text: 'Colaboração em equipe para criar soluções eficientes para problemas técnicos recorrentes.', tag: 'Trabalho em equipe' },
      { text: 'Manutenção de registros detalhados das interações para melhoria contínua dos processos.', tag: 'Documentação' },
    ]
  }
];

const LEVEL_MAP = {
  'Avançado':      { cls: 'cv-lvl-av',  color: 'var(--teal)' },
  'Intermediário': { cls: 'cv-lvl-int', color: 'var(--blue)' },
  'Básico':        { cls: 'cv-lvl-bas', color: 'var(--purple)' },
  'Em estudo':     { cls: 'cv-lvl-bas', color: 'var(--purple)' },
};

async function loadCvSettings() {
  if (!sb) return;
  try {
    const { data } = await sb.from('cv_settings').select('key,value');
    if (!data || data.length === 0) return;
    const map = Object.fromEntries(data.map(r => [r.key, r.value]));

    if (map.resumo) {
      const el = document.getElementById('cv-resumo-text');
      if (el) el.textContent = map.resumo;
    }

    if (map.skills && Array.isArray(map.skills)) {
      const container = document.querySelector('.cv-skills-main');
      if (container) {
        container.innerHTML = map.skills.map(sk => {
          const lv = LEVEL_MAP[sk.level] || LEVEL_MAP['Básico'];
          const label = sk.label || sk.name;
          return `
            <div class="cv-skill-row" data-skill="${sk.name}">
              <div class="cv-skill-meta">
                <span class="cv-skill-name">${label}</span>
                <span class="cv-skill-lvl ${lv.cls}">${sk.level}</span>
              </div>
              <div class="cv-skill-bar">
                <div class="cv-skill-fill" style="width:${sk.pct}%;background:${lv.color}"></div>
              </div>
            </div>`;
        }).join('');
      }
    }
  } catch(e) {}
}

function exportCvPdf() {
  const btn = document.getElementById('cv-pdf-btn');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Gerando PDF...'; }

  const root = document.documentElement;
  const lightVars = {
    '--bg':      '#ffffff',
    '--bg2':     '#f8f9fa',
    '--bg3':     '#f0f2f5',
    '--text':    '#111111',
    '--muted':   '#555555',
    '--border':  '#e0e0e0',
    '--border2': '#cccccc',
  };
  Object.entries(lightVars).forEach(([k, v]) => root.style.setProperty(k, v));

  const hideEls = [
    ...document.querySelectorAll('.cv-entry-expand'),
    ...document.querySelectorAll('.cv-cta-section'),
    btn,
  ].filter(Boolean);
  hideEls.forEach(el => { el.dataset.pdfHidden = el.style.display; el.style.display = 'none'; });

  const el = document.getElementById('page-curriculo');
  html2pdf().set({
    margin:      [8, 10, 8, 10],
    filename:    'Gustavo-Lacerda-CV.pdf',
    image:       { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false },
    jsPDF:       { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak:   { mode: ['css', 'legacy'], before: ['#cv-section-experiencia', '#cv-section-formacao'] },
  }).from(el).save().then(() => {
    Object.keys(lightVars).forEach(k => root.style.removeProperty(k));
    hideEls.forEach(el => { el.style.display = el.dataset.pdfHidden || ''; delete el.dataset.pdfHidden; });
    if (btn) { btn.disabled = false; btn.textContent = '⬇ Salvar PDF'; }
  });
}

function openExpModal(id) {
  const exp = EXPERIENCES.find(e => e.id === id);
  if (!exp) return;

  document.getElementById('pm-phase').textContent  = exp.company;
  document.getElementById('pm-phase').style.color  = exp.color;
  document.getElementById('pm-title').textContent  = exp.role;
  document.getElementById('pm-period').textContent = exp.period;

  let html = '';
  exp.items.forEach((item, idx) => {
    html += `
      <div class="pm-item">
        <div class="pm-item-icon" style="color:${exp.color}">${idx + 1}</div>
        <div class="pm-item-content">
          <div class="pm-item-text">${item.text}</div>
          <div class="pm-item-tag">${item.tag.toUpperCase()}</div>
        </div>
      </div>
    `;
  });
  document.getElementById('pm-body').innerHTML = html;

  const modalWrap = document.getElementById('phase-modal');
  modalWrap.style.display = 'flex';
  setTimeout(() => modalWrap.classList.add('active'), 10);
}
