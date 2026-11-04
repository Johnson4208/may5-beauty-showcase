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
