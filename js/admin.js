async function loadAdminPanel() {
  const grid   = document.getElementById('admin-grid');
  const banner = document.getElementById('pending-banner');
  grid.innerHTML = '<div style="color:var(--muted);font-size:13px">Carregando...</div>';

  const inviteUrl = `${location.origin}${location.pathname}?convite=${INVITE_TOKEN}`;
  document.getElementById('invite-url-txt').textContent = inviteUrl;

  const { data: sols } = await sb.from('solicitacoes').select('*').order('created_at', { ascending: false });
  if (!sols || sols.length === 0) {
    grid.innerHTML = '<div style="color:var(--muted);font-size:13px">Nenhuma solicitação ainda.</div>';
    banner.innerHTML = ''; return;
  }

  const pendentes = sols.filter(s => s.status === 0).length;
  banner.innerHTML = pendentes > 0
    ? `<div class="pending-banner">⚠️ ${pendentes} solicitação(ões) aguardando aprovação</div>` : '';

  const { data: progs } = await sb.from('progresso').select('user_cpf,dados');
  const progMap = {};
  (progs || []).forEach(p => { if (p.user_cpf) progMap[p.user_cpf] = p.dados; });

  const allItems = PHASES.flatMap(p => p.items);
  grid.innerHTML = '';
  sols.forEach(sol => {
    const dados  = progMap[sol.cpf] || { checked: {} };
    const done   = allItems.filter(i => dados.checked?.[i.id]).length;
    const pct    = Math.round((done / allItems.length) * 100);
    const isEmail  = sol.cpf.includes('@');
    const initials = sol.cpf.slice(0, 2).toUpperCase();
    const display  = isEmail ? sol.cpf : fmtCpfDisplay(sol.cpf);
    const statusLabel = { 0: 'PENDENTE', 1: 'ATIVO', 2: 'INATIVO' };
    const sk = sol.status;
    let actions = '';
    if (sk === 0) actions = `<button class="btn-approve" onclick="updateSol('${sol.cpf}',1)">✓ Aprovar</button><button class="btn-reject" onclick="updateSol('${sol.cpf}',2)">✕ Reprovar</button>`;
    else if (sk===1) actions = `<button class="btn-revoke" onclick="updateSol('${sol.cpf}',2)">⏸ Inativar</button>`;
    else actions = `<button class="btn-approve" onclick="updateSol('${sol.cpf}',1)">▶ Reativar</button>`;

    const card = document.createElement('div'); card.className = 'user-card';
    card.innerHTML = `
      <div class="user-card-top">
        <div class="user-avatar">${initials}</div>
        <div>
          <div class="user-cpf-label">${display}</div>
          <span class="status-badge sb-${sk}">${statusLabel[sk]}</span>
          <span style="font-size:11px;color:var(--muted);margin-left:6px">${new Date(sol.created_at).toLocaleDateString('pt-BR')}</span>
          ${sol.senha_hint ? `<span style="font-family:var(--mono);font-size:10px;color:var(--muted);margin-left:6px">senha: ${sol.senha_hint}</span>` : ''}
        </div>
      </div>
      <div class="user-prog-bar"><div class="user-prog-fill" style="width:${pct}%"></div></div>
      <div class="user-prog-lbl">${pct}% concluído · ${done}/${allItems.length} tarefas</div>
      <div class="user-actions">${actions}</div>`;
    grid.appendChild(card);
  });
}

async function updateSol(cpf, status) {
  await sb.from('solicitacoes').update({ status, updated_at: new Date().toISOString() }).eq('cpf', cpf);
  loadAdminPanel();
}

function copyLink() {
  const url = `${location.origin}${location.pathname}?convite=${INVITE_TOKEN}`;
  navigator.clipboard.writeText(url).then(() => {
    const el = document.getElementById('copy-confirm');
    if (el) { el.style.display = 'block'; setTimeout(() => el.style.display = 'none', 2500); }
  }).catch(() => { prompt('Copie o link abaixo:', url); });
}

function shareWhatsApp() {
  const url = `${location.origin}${location.pathname}?convite=${INVITE_TOKEN}`;
  const msg = encodeURIComponent(
    `Olá! Você foi convidado para acompanhar o Roadmap Analista de Infra.\n\n` +
    `Para solicitar acesso, clique no link abaixo:\n${url}`
  );
  window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
}
