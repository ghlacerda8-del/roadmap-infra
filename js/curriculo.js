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
