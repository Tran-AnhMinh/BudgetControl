function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  sidebar.classList.toggle('collapsed');
}

function renderHeaderProfile() {
  const profile = JSON.parse(localStorage.getItem('profile')) || {};
  const fullName = profile.fullName || 'Người dùng';
  const role = profile.role || '';

  document.querySelectorAll('.user-name').forEach(el => el.textContent = fullName);
  document.querySelectorAll('.user-role').forEach(el => el.textContent = role);

  document.querySelectorAll('.avatar-circle').forEach(circle => {
    const initialEl = circle.querySelector('.avatar-initial');
    const imgEl = circle.querySelector('.avatar-img');
    if (!initialEl || !imgEl) return;

    if (profile.avatar) {
      imgEl.src = profile.avatar;
      imgEl.classList.remove('d-none');
      initialEl.classList.add('d-none');
    } else {
      imgEl.classList.add('d-none');
      initialEl.classList.remove('d-none');
      initialEl.textContent = fullName.trim().charAt(0).toUpperCase() || 'U';
    }
  });
}

document.addEventListener('DOMContentLoaded', renderHeaderProfile);

window.addEventListener('pageshow', (e) => {
  if (e.persisted) renderHeaderProfile();
});
