import { configured, rpc } from './order-api.js';

const addButtons = [...document.querySelectorAll('[data-add-service]')];
const services = new Map(addButtons.map(button => [
  button.dataset.addService,
  button.closest('article').querySelector('h3').textContent.trim(),
]));
const storageKey = 'may5-service-cart';
const dialog = document.querySelector('#order-dialog');
const title = document.querySelector('#order-title');
const cartStep = document.querySelector('#cart-step');
const checkout = document.querySelector('#checkout-step');
const success = document.querySelector('#order-success');
const list = document.querySelector('#cart-items');
const confirm = document.querySelector('#cart-confirm');
const error = document.querySelector('#checkout-error');
const send = checkout.querySelector('[type="submit"]');
let cart = new Set();
let pending = false;
let requestKey;
let requestSignature;

try {
  const saved = JSON.parse(localStorage.getItem(storageKey));
  if (Array.isArray(saved)) cart = new Set(saved.filter(id => services.has(id)));
} catch {
  // The cart still works when browser storage is disabled.
}

function renderCart() {
  list.replaceChildren();
  for (const id of cart) {
    const row = document.createElement('li');
    const label = document.createElement('span');
    const remove = document.createElement('button');
    label.textContent = services.get(id);
    remove.type = 'button';
    remove.className = 'order-plain';
    remove.textContent = 'Bỏ';
    remove.setAttribute('aria-label', 'Bỏ ' + label.textContent);
    remove.addEventListener('click', () => {
      cart.delete(id);
      saveCart();
      (list.querySelector('button') || title).focus();
    });
    row.append(label, remove);
    list.append(row);
  }
  document.querySelector('#cart-empty').hidden = cart.size > 0;
  confirm.disabled = cart.size === 0;
  for (const button of addButtons) {
    const selected = cart.has(button.dataset.addService);
    button.setAttribute('aria-label', (selected ? 'Xem giỏ có ' : 'Thêm vào giỏ: ') + services.get(button.dataset.addService));
    button.textContent = selected ? 'Đã thêm · Xem giỏ →' : 'Thêm vào giỏ +';
  }
  for (const badge of document.querySelectorAll('[data-cart-count]')) {
    badge.hidden = cart.size === 0;
    badge.textContent = cart.size;
  }
}

function saveCart() {
  try {
    localStorage.setItem(storageKey, JSON.stringify([...cart]));
  } catch {
    // Only service IDs are saved, and the current cart remains usable.
  }
  renderCart();
}

function show(step, heading) {
  for (const panel of [cartStep, checkout, success]) panel.hidden = panel !== step;
  title.textContent = heading;
  title.focus();
}

function openCart() {
  if (dialog.open) return;
  dialog.showModal();
  show(cartStep, 'Giỏ dịch vụ');
}

for (const button of document.querySelectorAll('[data-open-cart]')) {
  button.addEventListener('click', openCart);
}
for (const button of addButtons) {
  button.addEventListener('click', () => {
    const id = button.dataset.addService;
    if (cart.has(id)) {
      openCart();
      return;
    }
    cart.add(id);
    saveCart();
    document.querySelector('#order-feedback').textContent = 'Đã thêm ' + services.get(id) + ' vào giỏ.';
  });
}
confirm.addEventListener('click', () => {
  if (!cart.size) return;
  error.hidden = configured;
  if (!configured) error.textContent = 'May5 chưa mở nhận yêu cầu trực tuyến. Bạn có thể liên hệ May5 qua mục Liên hệ.';
  send.disabled = !configured;
  document.querySelector('#checkout-summary').textContent = [...cart].map(id => services.get(id)).join(' · ');
  show(checkout, 'Thông tin liên hệ');
});
document.querySelector('#checkout-back').addEventListener('click', () => show(cartStep, 'Giỏ dịch vụ'));
dialog.addEventListener('cancel', event => { if (pending) event.preventDefault(); });
dialog.addEventListener('close', () => checkout.reset());

checkout.addEventListener('submit', async event => {
  event.preventDefault();
  if (!configured || pending || !cart.size) return;

  const fields = new FormData(checkout);
  const name = fields.get('name').trim();
  const email = fields.get('email').trim().toLowerCase();
  const phone = fields.get('phone').trim();
  const digits = phone.replace(/\D/g, '');
  if (name.length < 2 || !/^\+?[0-9 ().-]+$/.test(phone) || digits.length < 7 || digits.length > 15) {
    error.textContent = 'Vui lòng kiểm tra lại họ tên và số điện thoại.';
    error.hidden = false;
    return;
  }

  const serviceIds = [...cart].sort();
  const signature = JSON.stringify([name, email, phone, serviceIds]);
  if (signature !== requestSignature) {
    requestKey = crypto.randomUUID();
    requestSignature = signature;
  }

  pending = true;
  const close = dialog.querySelector('.order-close button');
  const back = document.querySelector('#checkout-back');
  send.disabled = close.disabled = back.disabled = true;
  error.hidden = true;
  send.textContent = 'Đang gửi…';
  try {
    const receipt = await rpc('may5_submit_order', {
      p_request_id: requestKey,
      p_name: name,
      p_email: email,
      p_phone: phone,
      p_services: serviceIds,
    });
    if (typeof receipt !== 'string') throw new Error('Invalid receipt');
    cart.clear();
    saveCart();
    checkout.reset();
    requestKey = requestSignature = undefined;
    document.querySelector('#order-receipt').textContent = 'Mã yêu cầu: ' + receipt;
    show(success, 'Đã gửi yêu cầu');
  } catch {
    error.textContent = 'Chưa thể xác nhận yêu cầu. Giỏ vẫn được giữ để bạn thử gửi lại.';
    error.hidden = false;
  } finally {
    pending = false;
    send.disabled = close.disabled = back.disabled = false;
    send.textContent = 'Gửi yêu cầu đặt dịch vụ';
  }
});

renderCart();
