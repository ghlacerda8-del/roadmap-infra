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

  // Ler dados atuais do DOM (já carregados pelo loadCvSettings)
  const resumo = document.getElementById('cv-resumo-text')?.textContent?.trim() || '';

  const DEFAULT_LABELS = {
    suporte: 'Suporte Técnico N1/N2', hardware: 'Hardware & Manutenção',
    linux: 'Linux', winserver: 'Windows Server', redes: 'Redes & Infraestrutura',
    python: 'Python', sql: 'SQL', azure: 'Azure', docker: 'Docker & Kubernetes',
  };

  const skillsList = Array.from(document.querySelectorAll('.cv-skills-main .cv-skill-row')).map(row => {
    const key  = row.dataset.skill || '';
    const raw  = row.querySelector('.cv-skill-name')?.textContent?.trim() || '';
    const name = (raw.length > 3 && raw !== key) ? raw : (DEFAULT_LABELS[key] || raw);
    const level = row.querySelector('.cv-skill-lvl')?.textContent?.trim() || '';
    return { name, level };
  });

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
  for (let i = 0; i < skillsList.length; i += 2) skRows.push(skRow(skillsList[i], skillsList[i+1]));
  const skillsTable = `<table style="width:100%;border-collapse:collapse">${skRows.join('')}</table>`;

  const secTitle = (t) =>
    `<div style="font-size:7pt;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#111;
      border-bottom:2px solid #00e5a0;padding-bottom:2px;margin-bottom:8px">${t}</div>`;

  const expBlock = (role, per, co, items) => `
    <div style="margin-bottom:11px;page-break-inside:avoid;break-inside:avoid">
      <table style="width:100%;border-collapse:collapse;margin-bottom:1px">
        <tr>
          <td style="font-size:10pt;font-weight:700;color:#0d1421">${role}</td>
          <td style="text-align:right;font-size:8pt;color:#666;white-space:nowrap">${per}</td>
        </tr>
      </table>
      <div style="font-size:8pt;color:#00a06e;font-weight:600;margin-bottom:4px">${co}</div>
      ${items.map(li => `
        <div style="font-size:9pt;color:#444;line-height:1.6;margin-bottom:2px;padding-left:13px;position:relative">
          <span style="position:absolute;left:0;top:2px;color:#00c47a;font-size:7.5pt">●</span>${li}
        </div>`).join('')}
    </div>`;

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

<div style="padding:12px 22px">

  <div style="margin-bottom:12px">
    ${secTitle('Resumo')}
    <div style="font-size:9pt;line-height:1.7;color:#333">${resumo || 'Profissional de TI com atuação desde 2024 em suporte técnico N1/N2, infraestrutura de redes e manutenção de hardware. Experiência prática em ambientes Windows Server e Linux, com desenvolvimento de scripts Python para automação de processos e consultas SQL para suporte a sistemas internos. Perfil analítico e orientado à resolução ágil de problemas, com foco em alta disponibilidade e qualidade dos serviços de TI.'}</div>
  </div>

  <div style="margin-bottom:12px">
    ${secTitle('Skills')}
    ${skillsTable}
  </div>

  <div style="margin-bottom:12px">
    ${secTitle('Educação')}
    <div style="font-size:9.5pt;font-weight:700;color:#0d1421">Análise e Desenvolvimento de Sistemas</div>
    <div style="font-size:8pt;color:#555;margin-top:1px">Universidade Estácio de Sá &nbsp;·&nbsp; Graduação &nbsp;·&nbsp; Concluído em 2024.2</div>
  </div>

  <div style="margin-bottom:12px">
    ${secTitle('Idiomas')}
    <div style="font-size:9pt;color:#333;margin-bottom:3px;padding-left:13px;position:relative"><span style="position:absolute;left:0;color:#00c47a;font-size:7.5pt">●</span>Português — Nativo</div>
    <div style="font-size:9pt;color:#333;margin-bottom:3px;padding-left:13px;position:relative"><span style="position:absolute;left:0;color:#00c47a;font-size:7.5pt">●</span>Inglês — Básico</div>
  </div>

  <div>
    ${secTitle('Experiência Profissional')}
    ${expBlock('Suporte ao Usuário e Infraestrutura', '05/2025 – Atual', 'Faculdade Famart &nbsp;·&nbsp; Belo Horizonte, MG', [
      'Atendo chamados N1/N2, solucionando incidentes de hardware, software e conectividade com foco em first-call resolution.',
      'Desenvolvi scripts Python para automação de tarefas operacionais, reduzindo tempo de execução de processos manuais.',
      'Realizo monitoramento preventivo da infraestrutura de rede e ativos de TI, garantindo alta disponibilidade dos serviços.',
      'Executo consultas SQL para diagnóstico e suporte aos sistemas acadêmicos internos.',
    ])}
    ${expBlock('Técnico de Suporte e Redes', '05/2024 – 05/2025', 'SI – Automação Comercial &nbsp;·&nbsp; Belo Horizonte, MG', [
      'Realizei manutenção corretiva e preventiva de equipamentos de TI, impressoras térmicas e periféricos.',
      'Executei montagem de racks, cabeamento Cat5e/Cat6 e configuração de servidores Windows Server e Linux.',
      'Participei da implantação de novos equipamentos garantindo integração segura à infraestrutura existente.',
      'Prestei suporte técnico on-site com priorização de chamados críticos e cumprimento de SLA.',
    ])}
    ${expBlock('Atendimento Técnico', '11/2021 – 04/2024', 'AeC – Centro de Contatos &nbsp;·&nbsp; Belo Horizonte, MG', [
      'Realizei atendimento multicanal (telefone, e-mail e chat) com foco em resolução no primeiro contato.',
      'Documentei chamados de forma estruturada, contribuindo para a base de conhecimento e melhoria de processos.',
    ])}
  </div>

</div>
</body></html>`;

  html2pdf().set({
    margin:      10,
    filename:    'Gustavo-Lacerda-CV.pdf',
    image:       { type: 'jpeg', quality: 0.98 },
    pagebreak:   { mode: ['avoid-all', 'css', 'legacy'] },
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
    jsPDF:       { unit: 'mm', format: 'a4', orientation: 'portrait' },
  }).from(html).save().then(() => {
    if (btn) { btn.disabled = false; btn.textContent = '⬇ Salvar PDF'; }
  }).catch(err => {
    console.error('exportCvPdf error:', err);
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
