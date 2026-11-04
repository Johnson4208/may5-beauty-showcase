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
const heroSlides = [...document.querySelectorAll('.hero-slide')];
const heroDots = [...document.querySelectorAll('.hero-dot')];
const heroCaption = document.querySelector('.hero-caption-text');
const heroLabel = document.querySelector('.photo-label');
const heroCount = document.querySelector('.hero-slide-count');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let activeHeroSlide = 0;
let heroTimer;

function showHeroSlide(index) {
  activeHeroSlide = (index + heroSlides.length) % heroSlides.length;
  const activeSlide = heroSlides[activeHeroSlide];
  heroSlides.forEach((slide, slideIndex) => {
    slide.classList.toggle('is-active', slideIndex === activeHeroSlide);
    slide.setAttribute('aria-hidden', String(slideIndex !== activeHeroSlide));
  });
  heroDots.forEach((dot, dotIndex) => {
    const isActive = dotIndex === activeHeroSlide;
    dot.classList.toggle('is-active', isActive);
    dot.setAttribute('aria-pressed', String(isActive));
  });
  heroCaption.textContent = activeSlide.dataset.caption;
  const [firstLine, secondLine] = activeSlide.dataset.title.split('|');
  heroLabel.replaceChildren(...[firstLine, secondLine].map((line) => {
    const span = document.createElement('span');
    span.textContent = line;
    return span;
  }));
  heroCount.innerHTML = `<span>${String(activeHeroSlide + 1).padStart(2, '0')}</span> <i>/</i> ${String(heroSlides.length).padStart(2, '0')}`;
  heroArt.classList.add('is-changing');
  window.setTimeout(() => heroArt.classList.remove('is-changing'), 280);
}

function stopHeroRotation() {
  window.clearInterval(heroTimer);
  heroTimer = undefined;
}

function startHeroRotation() {
  stopHeroRotation();
  if (!reducedMotion.matches && !document.hidden) {
    heroTimer = window.setInterval(() => showHeroSlide(activeHeroSlide + 1), 5600);
  }
}

document.querySelector('.hero-prev').addEventListener('click', () => showHeroSlide(activeHeroSlide - 1));
document.querySelector('.hero-next').addEventListener('click', () => showHeroSlide(activeHeroSlide + 1));
heroDots.forEach((dot, index) => dot.addEventListener('click', () => showHeroSlide(index)));
heroArt.addEventListener('pointerenter', stopHeroRotation);
heroArt.addEventListener('pointerleave', startHeroRotation);
heroArt.addEventListener('focusin', stopHeroRotation);
heroArt.addEventListener('focusout', (event) => {
  if (!heroArt.contains(event.relatedTarget)) startHeroRotation();
});
document.addEventListener('visibilitychange', startHeroRotation);
reducedMotion.addEventListener?.('change', startHeroRotation);
heroSlides.forEach((slide, index) => slide.setAttribute('aria-hidden', String(index !== activeHeroSlide)));
startHeroRotation();

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
