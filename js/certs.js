function openCertModal(title, sub, imgPath) {
  document.getElementById('cert-modal-title').textContent = title;
  document.getElementById('cert-modal-sub').textContent = sub;

  const body = document.getElementById('cert-modal-body');
  body.innerHTML = '';

  const paths = Array.isArray(imgPath) ? imgPath : [imgPath];
  paths.forEach(function (src) {
    const img = document.createElement('img');
    img.src = src;
    img.alt = title;
    body.appendChild(img);
  });

  document.getElementById('cert-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCertModal() {
  document.getElementById('cert-modal').classList.remove('open');
  document.getElementById('cert-modal-body').innerHTML = '';
  document.body.style.overflow = '';
}

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeCertModal();
});
