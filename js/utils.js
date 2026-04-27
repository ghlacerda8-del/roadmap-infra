function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function cpfDigits(v) { return v.replace(/\D/g, ''); }
function cpfToEmail(c) { return c + '@roadmap.infra'; }
function fmtCpf(v) {
  return v.replace(/\D/g,'').slice(0,11)
    .replace(/(\d{3})(\d)/,'$1.$2')
    .replace(/(\d{3})(\d)/,'$1.$2')
    .replace(/(\d{3})(\d{1,2})$/,'$1-$2');
}
function fmtCpfDisplay(c) { return c.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,'$1.$2.$3-$4'); }
function dateKey(d) { return d.toISOString().slice(0,10); }
