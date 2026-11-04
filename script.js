const cards = [...document.querySelectorAll('.product-card')];
const filters = [...document.querySelectorAll('.filter-chip')];
const search = document.querySelector('#product-search');
const emptyState = document.querySelector('#empty-state');

function updateProducts() {
  const selected = document.querySelector('.filter-chip.active')?.dataset.filter ?? 'all';
  const query = search.value.trim().toLocaleLowerCase('vi');
  let visible = 0;
  for (const card of cards) {
    const matchesCategory = selected === 'all' || card.dataset.category === selected;
    const matchesQuery = card.dataset.name.toLocaleLowerCase('vi').includes(query);
    card.hidden = !(matchesCategory && matchesQuery);
    if (!card.hidden) visible += 1;
  }
  emptyState.hidden = visible !== 0;
}

filters.forEach((button) => button.addEventListener('click', () => {
  filters.forEach((item) => item.classList.toggle('active', item === button));
  updateProducts();
}));
search.addEventListener('input', updateProducts);

const dialog = document.querySelector('#product-dialog');
const dialogTitle = document.querySelector('#dialog-title');
const dialogEmail = document.querySelector('#dialog-email');
document.querySelectorAll('[data-product]').forEach((button) => button.addEventListener('click', () => {
  const product = button.dataset.product;
  dialogTitle.textContent = product;
  dialogEmail.href = `mailto:May5beautynz@gmail.com?subject=${encodeURIComponent(`Tư vấn: ${product}`)}`;
  dialog.showModal();
}));
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && dialog.open) dialog.close();
});

document.querySelectorAll('[data-email]').forEach((button) => button.addEventListener('click', () => {
  const product = button.dataset.email;
  window.location.href = `mailto:May5beautynz@gmail.com?subject=${encodeURIComponent(`Tư vấn sản phẩm: ${product}`)}`;
}));
document.querySelectorAll('[data-service]').forEach((link) => {
  link.href = `mailto:May5beautynz@gmail.com?subject=${encodeURIComponent(`Tư vấn dịch vụ: ${link.dataset.service}`)}`;
});

const heroArt = document.querySelector('.hero-art');
const heroPhoto = document.querySelector('.hero-photo-wrap');
heroArt.addEventListener('pointermove', (event) => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.innerWidth < 800) return;
  const bounds = heroArt.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width - 0.5;
  const y = (event.clientY - bounds.top) / bounds.height - 0.5;
  heroPhoto.style.setProperty('--tilt-x', `${y * -1.5}deg`);
  heroPhoto.style.setProperty('--tilt-y', `${x * 1.5}deg`);
});
heroArt.addEventListener('pointerleave', () => {
  heroPhoto.style.setProperty('--tilt-x', '0deg');
  heroPhoto.style.setProperty('--tilt-y', '0deg');
});

const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');
menuToggle.addEventListener('click', () => {
  const isOpen = navigation.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});
navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  navigation.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
}));
document.querySelector('#year').textContent = new Date().getFullYear();

