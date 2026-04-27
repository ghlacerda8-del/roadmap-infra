const EXPERIENCES = [
  {
    id: 'famart',
    company: 'Faculdade Famart',
    role: 'Suporte ao Usuário e Infraestrutura',
    period: '05/2025 – Atual · Belo Horizonte, MG',
    color: 'var(--teal)',
    items: [
      { text: 'Suporte técnico N1/N2, resolução de incidentes de hardware e software com foco em agilidade e first-call resolution.', tag: 'Suporte N1/N2' },
      { text: 'Desenvolvimento de scripts Python em servidor Ubuntu para automação de processos operacionais internos.', tag: 'Automação' },
      { text: 'Monitoramento de redes com Grafana e consultas SQL nos sistemas acadêmicos da faculdade.', tag: 'Grafana/SQL' },
      { text: 'Manutenção e monitoramento contínuo dos ativos de rede e infraestrutura de TI da instituição.', tag: 'Infraestrutura' },
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
  'Avançado': { cls: 'cv-lvl-av', color: 'var(--teal)' },
  'Intermediário': { cls: 'cv-lvl-int', color: 'var(--blue)' },
  'Básico': { cls: 'cv-lvl-bas', color: 'var(--purple)' },
  'Em estudo': { cls: 'cv-lvl-bas', color: 'var(--purple)' },
};

// Module-level state – populated by loadCvSettings, read by PDF export + modal
let _cvExp = [];
let _cvFormacao = [];
let _cvIdiomas = [];

function _expFromLegacy() {
  return EXPERIENCES.map(e => ({
    role: e.role,
    company: e.company,
    location: 'Belo Horizonte, MG',
    period: e.period.replace(' · Belo Horizonte, MG', ''),
    items: e.items.map(i => i.text),
  }));
}

function _renderFormacao() {
  const el = document.getElementById('cv-formacao-list');
  if (!el) return;
  const data = _cvFormacao.length ? _cvFormacao : CV_FORMACAO_DEFAULT;
  el.innerHTML = data.map(f => `
    <div class="cv-entry">
      <div class="cv-entry-header">
        <div>
          <div class="cv-entry-title">${escapeHtml(f.course)}</div>
          <div class="cv-entry-company">${escapeHtml(f.institution)}${f.type ? ' · ' + escapeHtml(f.type) : ''}</div>
        </div>
        <div class="cv-entry-period">${escapeHtml(f.period)}</div>
      </div>
    </div>`).join('');
}

function _renderIdiomas() {
  const el = document.getElementById('cv-idiomas-list');
  if (!el) return;
  const data = _cvIdiomas.length ? _cvIdiomas : CV_IDIOMAS_DEFAULT;
  el.innerHTML = data.map(lang => `
    <div class="cv-entry" style="padding:12px 20px">
      <div style="display:flex;align-items:center;gap:16px">
        <span style="font-size:13px;font-weight:600;color:var(--text)">${escapeHtml(lang.name)}</span>
        <span class="cv-entry-period">${escapeHtml(lang.level)}</span>
        <div class="cv-lang-bar">
          <div class="cv-lang-fill" style="width:${Number(lang.pct) || 0}%"></div>
        </div>
      </div>
    </div>`).join('');
}

function _renderExp() {
  const el = document.getElementById('cv-exp-list');
  if (!el) return;
  el.innerHTML = _cvExp.map((exp, idx) => `
    <div class="cv-entry cv-entry-clickable" onclick="openExpModal(${idx})">
      <div class="cv-entry-header">
        <div>
          <div class="cv-entry-title">${escapeHtml(exp.role)}</div>
          <div class="cv-entry-company">${escapeHtml(exp.company)}${exp.location ? ' · ' + escapeHtml(exp.location) : ''}</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <div class="cv-entry-period">${escapeHtml(exp.period)}</div>
          <span class="cv-entry-expand"></span>
        </div>
      </div>
      <ul class="cv-entry-list">
        ${exp.items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
      </ul>
    </div>`).join('');
}

async function loadCvSettings() {
  // Set defaults before async call so page renders immediately
  _cvExp = _expFromLegacy();
  _cvFormacao = CV_FORMACAO_DEFAULT.map(f => ({ ...f }));
  _cvIdiomas = CV_IDIOMAS_DEFAULT.map(l => ({ ...l }));

  if (!sb) {
    _renderFormacao(); _renderIdiomas(); _renderExp();
    return;
  }
  try {
    const { data } = await sb.from('cv_settings').select('key,value');
    if (data && data.length > 0) {
      const map = Object.fromEntries(data.map(r => [r.key, r.value]));

      if (map.resumo) {
        const el = document.getElementById('cv-resumo-text');
        if (el) el.textContent = map.resumo;
      }

      if (Array.isArray(map.skills) && map.skills.length > 0) {
        const container = document.querySelector('.cv-skills-main');
        if (container) {
          const SKILL_RANK = { 'Avançado': 4, 'Intermediário': 3, 'Básico': 2, 'Em estudo': 1 };
          container.innerHTML = map.skills
            .filter(sk => sk.level !== 'Em estudo')
            .sort((a, b) => (SKILL_RANK[b.level] || 0) - (SKILL_RANK[a.level] || 0))
            .map(sk => {
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

      if (Array.isArray(map.experiencias) && map.experiencias.length > 0) _cvExp = map.experiencias;
      if (Array.isArray(map.formacao) && map.formacao.length > 0) _cvFormacao = map.formacao;
      if (Array.isArray(map.idiomas) && map.idiomas.length > 0) _cvIdiomas = map.idiomas;
    }
  } catch (e) { }

  _renderFormacao();
  _renderIdiomas();
  _renderExp();
}

function exportCvPdf() {
  const btn = document.getElementById('cv-pdf-btn');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Gerando PDF...'; }

  const resumo = document.getElementById('cv-resumo-text')?.textContent?.trim() || '';

  const DEFAULT_LABELS = {
    suporte: 'Suporte Técnico N1/N2', hardware: 'Hardware & Manutenção',
    linux: 'Linux', winserver: 'Windows Server', redes: 'Redes & Infraestrutura',
    python: 'Python', sql: 'SQL', azure: 'Azure', docker: 'Docker & Kubernetes',
  };

  const LEVEL_RANK = { 'Avançado': 4, 'Intermediário': 3, 'Básico': 2, 'Em estudo': 1 };

  const skillsList = Array.from(document.querySelectorAll('.cv-skills-main .cv-skill-row'))
    .map(row => {
      const key = row.dataset.skill || '';
      const raw = row.querySelector('.cv-skill-name')?.textContent?.trim() || '';
      const name = (raw.length > 3 && raw !== key) ? raw : (DEFAULT_LABELS[key] || raw);
      const level = row.querySelector('.cv-skill-lvl')?.textContent?.trim() || '';
      return { name, level };
    })
    .filter(s => s.level !== 'Em estudo')                          // remove "Em estudo"
    .reduce((acc, s) => {                                          // deduplica pelo nome
      const existing = acc.find(a => a.name.toLowerCase() === s.name.toLowerCase());
      if (!existing) {
        acc.push(s);
      } else if ((LEVEL_RANK[s.level] || 0) > (LEVEL_RANK[existing.level] || 0)) {
        existing.level = s.level;                                  // mantém o nível mais alto
      }
      return acc;
    }, []);

  const skRow = (a, b) => `
    <tr>
      <td style="width:50%;vertical-align:top;padding:0 12px 5px 0">
        ${a ? `<span style="color:#00c47a;font-size:7.5pt;margin-right:4px">●</span><span style="font-size:9pt;color:#333">${a.name}</span>${a.level ? `<span style="font-size:7.5pt;color:#888;margin-left:3px">${a.level}</span>` : ''}` : ''}
      </td>
      <td style="width:50%;vertical-align:top;padding:0 0 5px 0">
        ${b ? `<span style="color:#00c47a;font-size:7.5pt;margin-right:4px">●</span><span style="font-size:9pt;color:#333">${b.name}</span>${b.level ? `<span style="font-size:7.5pt;color:#888;margin-left:3px">${b.level}</span>` : ''}` : ''}
      </td>
    </tr>`;

  const skRows = [];
  for (let i = 0; i < skillsList.length; i += 2) skRows.push(skRow(skillsList[i], skillsList[i + 1]));
  const skillsTable = `<table style="width:100%;border-collapse:collapse">${skRows.join('')}</table>`;

  const secTitle = (t) =>
    `<div style="font-size:7pt;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#111;
      border-bottom:2px solid #00e5a0;padding-bottom:2px;margin-bottom:8px">${t}</div>`;

  const expBlock = (role, per, co, items) => `
    <div style="margin-bottom:7px;page-break-inside:avoid;break-inside:avoid">
      <table style="width:100%;border-collapse:collapse;margin-bottom:1px">
        <tr>
          <td style="font-size:10pt;font-weight:700;color:#0d1421">${role}</td>
          <td style="text-align:right;font-size:8pt;color:#666;white-space:nowrap">${per}</td>
        </tr>
      </table>
      <div style="font-size:8pt;color:#00a06e;font-weight:600;margin-bottom:3px">${co}</div>
      ${items.slice(0, 3).map(li => `
        <div style="font-size:8.5pt;color:#444;line-height:1.5;margin-bottom:1px;padding-left:13px;position:relative">
          <span style="position:absolute;left:0;top:2px;color:#00c47a;font-size:7.5pt">●</span>${li}
        </div>`).join('')}
    </div>`;

  // Use dynamic data (populated by loadCvSettings) with fallbacks
  const fData = _cvFormacao.length ? _cvFormacao : CV_FORMACAO_DEFAULT;
  const formacaoHtml = fData.map(f =>
    `<div style="font-size:9.5pt;font-weight:700;color:#0d1421">${f.course}</div>
     <div style="font-size:8pt;color:#555;margin-top:1px">${f.institution}${f.type ? ' &nbsp;·&nbsp; ' + f.type : ''} &nbsp;·&nbsp; ${f.period}</div>`
  ).join('');

  const iData = _cvIdiomas.length ? _cvIdiomas : CV_IDIOMAS_DEFAULT;
  const idiomasHtml = iData.map(lang =>
    `<div style="font-size:9pt;color:#333;margin-bottom:3px;padding-left:13px;position:relative">
       <span style="position:absolute;left:0;color:#00c47a;font-size:7.5pt">●</span>${lang.name} — ${lang.level}
     </div>`
  ).join('');

  const expData = _cvExp.length ? _cvExp : _expFromLegacy();
  const experienciasHtml = expData.map(exp =>
    expBlock(
      exp.role,
      exp.period,
      exp.company + (exp.location ? ' &nbsp;·&nbsp; ' + exp.location : ''),
      exp.items
    )
  ).join('');

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{background:#fff}
  body{font-family:'Segoe UI',Arial,sans-serif;color:#222;width:190mm;padding:0}
</style>
</head><body>
<div style="padding:16px 22px 12px;border-bottom:3px solid #00e5a0">
  <div style="font-size:18pt;font-weight:800;color:#0d1421;line-height:1.1">Gustavo Henrique Da Cruz Lacerda</div>
  <div style="font-size:8.5pt;color:#00a06e;font-weight:600;margin-top:3px;text-transform:uppercase;letter-spacing:.06em">Suporte Técnico N1/N2 &nbsp;·&nbsp; Infraestrutura de Redes &nbsp;·&nbsp; Automação com Python</div>
  <div style="font-size:7.5pt;color:#555;margin-top:8px">
    (31) 98339-1648 &nbsp;·&nbsp; Belo Horizonte, MG &nbsp;·&nbsp; ghlacerda8@gmail.com &nbsp;·&nbsp; linkedin.com/in/gustavo-henriquedcl &nbsp;·&nbsp; github.com/ghlacerda8-del
  </div>
</div>

<div style="padding:10px 22px">

  <div style="margin-bottom:9px">
    ${secTitle('Resumo')}
    <div style="font-size:8.5pt;line-height:1.6;color:#333">${resumo || 'Profissional de TI com atuação desde 2024 em suporte técnico N1/N2, infraestrutura de redes e automação com Python. Experiência em ambientes Linux (Ubuntu) e Windows Server, com scripts de automação em servidores reais, monitoramento de redes com Grafana e configuração de VPN open source. Perfil analítico e orientado à resolução ágil de problemas, com foco em alta disponibilidade dos serviços de TI.'}</div>
  </div>

  <div style="margin-bottom:9px">
    ${secTitle('Skills')}
    ${skillsTable}
  </div>

  <div style="margin-bottom:9px">
    ${secTitle('Formação')}
    ${formacaoHtml}
  </div>

  <div style="margin-bottom:9px">
    ${secTitle('Idiomas')}
    ${idiomasHtml}
  </div>

  <div style="margin-bottom:9px">
    ${secTitle('Experiência Profissional')}
    ${experienciasHtml}
  </div>

  <div>
    ${secTitle('Projeto em Destaque')}
    <div style="page-break-inside:avoid;break-inside:avoid">
      <div style="font-size:9pt;font-weight:700;color:#0d1421">Servidor VPN Linux (OpenVPN) <span style="font-weight:400;font-size:7.5pt;color:#666">· Projeto Pessoal · Ubuntu · 2025</span></div>
      <div style="font-size:8.5pt;color:#444;line-height:1.5;margin-top:3px">Servidor Ubuntu local com OpenVPN, firewall, autenticação por certificado e scripts Python para automação — acesso remoto seguro com IP fixo, solução 100% open source.</div>
    </div>
  </div>

</div>
</body></html>`;

  html2pdf().set({
    margin: 10,
    filename: 'Gustavo-Lacerda-CV.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    html2canvas: {
      scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false,
      onclone: (clonedDoc) => {
        ['phase-modal', 'screen-login'].forEach(id => {
          const el = clonedDoc.getElementById(id);
          if (el) el.remove();
        });
        clonedDoc.querySelectorAll('.nav, .header, .modal-overlay').forEach(el => el.remove());
      },
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  }).from(html).save().then(() => {
    if (btn) { btn.disabled = false; btn.textContent = '⬇ Salvar PDF'; }
  }).catch(err => {
    console.error('exportCvPdf error:', err);
    if (btn) { btn.disabled = false; btn.textContent = '⬇ Salvar PDF'; }
  });
}

function openExpModal(idx) {
  const exp = _cvExp[idx];
  if (!exp) return;

  const colors = ['var(--teal)', 'var(--blue)', 'var(--amber)'];
  const color = colors[idx] || 'var(--teal)';

  document.getElementById('pm-phase').textContent = exp.company;
  document.getElementById('pm-phase').style.color = color;
  document.getElementById('pm-title').textContent = exp.role;
  document.getElementById('pm-period').textContent = exp.period + (exp.location ? ' · ' + exp.location : '');

  let html = '';
  exp.items.forEach((item, i) => {
    html += `
      <div class="pm-item">
        <div class="pm-item-icon" style="color:${color}">${i + 1}</div>
        <div class="pm-item-content">
          <div class="pm-item-text">${item}</div>
        </div>
      </div>`;
  });
  document.getElementById('pm-body').innerHTML = html;

  const modalWrap = document.getElementById('phase-modal');
  modalWrap.style.display = 'flex';
  setTimeout(() => modalWrap.classList.add('active'), 10);
}
