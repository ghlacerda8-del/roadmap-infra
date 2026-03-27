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

  const lvlCls   = { 'Avançado': 'lv-av', 'Intermediário': 'lv-int', 'Básico': 'lv-bas', 'Em estudo': 'lv-bas' };
  const lvlColor = { 'Avançado': '#00c47a', 'Intermediário': '#3a8ee6', 'Básico': '#8b6fe0', 'Em estudo': '#8b6fe0' };

  const skillsHtml = Array.from(document.querySelectorAll('.cv-skills-main .cv-skill-row')).map(row => {
    const name  = row.querySelector('.cv-skill-name')?.textContent || '';
    const level = row.querySelector('.cv-skill-lvl')?.textContent || 'Básico';
    const fill  = row.querySelector('.cv-skill-fill');
    const pct   = fill ? parseInt(fill.style.width) || 0 : 0;
    const cls   = lvlCls[level]   || 'lv-bas';
    const color = lvlColor[level] || '#8b6fe0';
    return `
      <div class="sk">
        <div class="sk-meta">
          <span class="sk-name">${name}</span>
          <span class="sk-lvl ${cls}">${level}</span>
        </div>
        <div class="sk-bar"><div class="sk-fill" style="width:${pct}%;background:${color}"></div></div>
      </div>`;
  }).join('');

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;font-size:9.5px;color:#111;background:#fff;width:794px}
.hd{background:#0d0f14;color:#fff;padding:24px 28px;display:flex;justify-content:space-between;align-items:flex-start}
.hd-name{font-size:24px;font-weight:800;letter-spacing:-.3px;line-height:1.15;text-transform:uppercase;color:#fff}
.hd-title{font-size:10px;color:#00e5a0;font-weight:500;margin-top:6px;letter-spacing:.1em;text-transform:uppercase}
.hd-info{text-align:right;font-size:8.5px;color:rgba(255,255,255,.7);line-height:2}
.hd-info span{color:#00e5a0}
.accent{height:3px;background:#00e5a0}
.body{display:flex}
.left{flex:0 0 58%;padding:18px 18px 18px 28px;border-right:1px solid #ebebeb}
.right{flex:0 0 42%;padding:18px 28px 18px 18px;background:#f9fafb}
.sec{margin-bottom:14px}
.sec-t{font-size:8.5px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:#009966;
       border-bottom:1.5px solid #00e5a0;padding-bottom:3px;margin-bottom:9px}
.summary{font-size:9px;line-height:1.65;color:#333}
.exp{margin-bottom:10px}
.exp-hd{display:flex;justify-content:space-between;align-items:flex-start;gap:6px;margin-bottom:1px}
.exp-role{font-size:10px;font-weight:700;color:#0d0f14}
.exp-per{font-size:7.5px;font-weight:600;color:#009966;background:rgba(0,153,102,.07);
          border:1px solid rgba(0,153,102,.2);padding:1.5px 6px;border-radius:8px;white-space:nowrap}
.exp-co{font-size:8.5px;color:#555;margin-bottom:4px}
.exp-ul{padding-left:11px}
.exp-ul li{font-size:8.5px;color:#444;line-height:1.6;margin-bottom:.5px}
.sk{margin-bottom:7px}
.sk-meta{display:flex;justify-content:space-between;align-items:center;margin-bottom:2px}
.sk-name{font-size:9px;color:#222;font-weight:500}
.sk-lvl{font-size:7px;font-weight:700;padding:1px 5px;border-radius:8px;border:1px solid}
.lv-av {background:rgba(0,153,102,.09);color:#007a4d;border-color:rgba(0,153,102,.25)}
.lv-int{background:rgba(0,80,200,.07);color:#1a56c4;border-color:rgba(0,80,200,.2)}
.lv-bas{background:rgba(100,60,200,.07);color:#5a32b8;border-color:rgba(100,60,200,.2)}
.sk-bar{height:4px;background:#e5e5e5;border-radius:4px;overflow:hidden}
.sk-fill{height:100%;border-radius:4px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.edu{margin-bottom:8px}
.edu-deg{font-size:10px;font-weight:700;color:#0d0f14}
.edu-sch{font-size:8.5px;color:#555;margin-bottom:1px}
.edu-yr{font-size:8px;color:#009966;font-weight:600}
.lang{display:flex;align-items:center;gap:8px;margin-bottom:5px}
.lang-name{font-size:9px;font-weight:600;color:#222;min-width:44px}
.lang-lv{font-size:8px;color:#009966;min-width:36px}
.lang-bar{flex:1;height:3px;background:#e5e5e5;border-radius:3px;overflow:hidden}
.lang-fill{height:100%;background:#00e5a0;border-radius:3px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.tags{display:flex;flex-wrap:wrap;gap:4px}
.tag{font-size:7.5px;font-weight:600;padding:2px 6px;border-radius:8px;border:1px solid;letter-spacing:.03em}
.tg{background:rgba(0,153,102,.07);color:#007a4d;border-color:rgba(0,153,102,.22)}
.tb{background:rgba(0,80,200,.06);color:#1a56c4;border-color:rgba(0,80,200,.18)}
.ta{background:rgba(180,100,0,.06);color:#935200;border-color:rgba(180,100,0,.18)}
.tp{background:rgba(90,50,184,.06);color:#5a32b8;border-color:rgba(90,50,184,.18)}
</style></head><body>
<div class="hd">
  <div>
    <div class="hd-name">Gustavo Henrique<br>Da Cruz Lacerda</div>
    <div class="hd-title">Suporte Técnico &nbsp;·&nbsp; Infraestrutura &nbsp;·&nbsp; Automação com Python</div>
  </div>
  <div class="hd-info">
    <div>📍 Belo Horizonte, MG</div>
    <div>📞 (31) 98339-1648</div>
    <div><span>ghlacerda8@gmail.com</span></div>
    <div><span>linkedin.com/in/gustavo-henriquedcl</span></div>
    <div><span>github.com/ghlacerda8-del</span></div>
  </div>
</div>
<div class="accent"></div>
<div class="body">
  <div class="left">
    <div class="sec">
      <div class="sec-t">Resumo Profissional</div>
      <div class="summary">${resumo || 'Profissional de TI com experiência em suporte help desk, manutenção de hardware e administração de sistemas Windows e Linux. Foco em infraestrutura de redes e automação de processos com Python.'}</div>
    </div>
    <div class="sec">
      <div class="sec-t">Experiência Profissional</div>
      <div class="exp">
        <div class="exp-hd"><div class="exp-role">Suporte ao Usuário e Infraestrutura</div><div class="exp-per">05/2025 – Atual</div></div>
        <div class="exp-co">Faculdade Famart &nbsp;·&nbsp; Belo Horizonte, MG</div>
        <ul class="exp-ul">
          <li>Suporte técnico N1/N2 com foco em resolução ágil de incidentes de hardware e software.</li>
          <li>Automações com Python para otimização de processos e fluxo de trabalho.</li>
          <li>Manutenção e monitoramento de ativos de rede e infraestrutura de TI.</li>
          <li>Consultas e manutenção em banco de dados SQL para suporte aos sistemas internos.</li>
        </ul>
      </div>
      <div class="exp">
        <div class="exp-hd"><div class="exp-role">Técnico de Suporte e Redes</div><div class="exp-per">05/2024 – 05/2025</div></div>
        <div class="exp-co">SI – Automação Comercial &nbsp;·&nbsp; Belo Horizonte, MG</div>
        <ul class="exp-ul">
          <li>Manutenção de equipamentos de TI, impressoras térmicas e hardware diverso.</li>
          <li>Montagem de racks, cabeamento estruturado e configuração de servidores Windows/Linux.</li>
          <li>Suporte técnico com foco na resolução rápida de problemas críticos.</li>
        </ul>
      </div>
      <div class="exp">
        <div class="exp-hd"><div class="exp-role">Atendimento Técnico</div><div class="exp-per">11/2021 – 04/2024</div></div>
        <div class="exp-co">AeC – Centro de Contatos &nbsp;·&nbsp; Belo Horizonte, MG</div>
        <ul class="exp-ul">
          <li>Suporte via telefone, e-mail e chat com resolução eficaz de chamados técnicos.</li>
          <li>Colaboração em equipe e documentação de interações para melhoria contínua.</li>
        </ul>
      </div>
    </div>
  </div>
  <div class="right">
    <div class="sec">
      <div class="sec-t">Competências Técnicas</div>
      ${skillsHtml}
    </div>
    <div class="sec">
      <div class="sec-t">Formação Acadêmica</div>
      <div class="edu">
        <div class="edu-deg">Análise e Desenvolvimento de Sistemas</div>
        <div class="edu-sch">Universidade Estácio de Sá &nbsp;·&nbsp; Graduação</div>
        <div class="edu-yr">Concluído em 2024.2</div>
      </div>
    </div>
    <div class="sec">
      <div class="sec-t">Idiomas</div>
      <div class="lang">
        <span class="lang-name">Português</span>
        <span class="lang-lv">Nativo</span>
        <div class="lang-bar"><div class="lang-fill" style="width:100%"></div></div>
      </div>
      <div class="lang">
        <span class="lang-name">Inglês</span>
        <span class="lang-lv">Básico</span>
        <div class="lang-bar"><div class="lang-fill" style="width:25%"></div></div>
      </div>
    </div>
    <div class="sec">
      <div class="sec-t">Ferramentas &amp; Tecnologias</div>
      <div class="tags">
        <span class="tag tg">Git</span><span class="tag tg">FastAPI</span><span class="tag tg">Scripts de TI</span>
        <span class="tag tb">TCP/IP</span><span class="tag tb">VLANs</span><span class="tag tb">VPN</span><span class="tag tb">Cabeamento</span>
        <span class="tag ta">Bash</span><span class="tag ta">Ansible</span>
        <span class="tag tp">PostgreSQL</span><span class="tag tp">ITSM</span>
      </div>
    </div>
  </div>
</div>
</body></html>`;

  html2pdf().set({
    margin:      0,
    filename:    'Gustavo-Lacerda-CV.pdf',
    image:       { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false },
    jsPDF:       { unit: 'mm', format: 'a4', orientation: 'portrait' },
  }).from(html).save().then(() => {
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
