import { configured, rpc, signIn } from './order-api.js';

const login = document.querySelector('#admin-login');
const loginButton = login.querySelector('button');
const dashboard = document.querySelector('#admin-dashboard');
const logout = document.querySelector('#admin-logout');
const message = document.querySelector('#admin-message');
const list = document.querySelector('#admin-orders');
const refresh = document.querySelector('#admin-refresh');
const more = document.querySelector('#admin-more');
const statuses = {
  new: 'Chờ gọi xác nhận',
  confirmed: 'Đã xác nhận',
  paid: 'Đã thanh toán',
  cancelled: 'Đã hủy',
};
const services = {
  manicure: 'Manicure tinh tế',
  facial: 'Chăm sóc da cơ bản',
  combo: 'Combo chăm sóc & thư giãn',
};
const dateFormat = new Intl.DateTimeFormat('vi', { dateStyle: 'medium', timeStyle: 'short' });
let token;
let cursor;
let busy = false;
let expiry;

function resetSession(note = '') {
  clearTimeout(expiry);
  token = cursor = undefined;
  list.replaceChildren();
  dashboard.hidden = logout.hidden = true;
  login.hidden = false;
  message.textContent = note;
}

function element(tag, text) {
  const node = document.createElement(tag);
  node.textContent = text;
  return node;
}

function orderCard(order) {
  const card = document.createElement('article');
  card.className = 'admin-order';
  const phone = element('a', 'Gọi ' + order.phone);
  phone.href = 'tel:' + order.phone.replace(/[^+0-9]/g, '');
  const select = document.createElement('select');
  for (const [value, label] of Object.entries(statuses)) select.add(new Option(label, value));
  select.value = order.status;
  select.setAttribute('aria-label', 'Trạng thái yêu cầu ' + order.id);
  const save = element('button', 'Lưu trạng thái');
  save.type = 'button';
  save.className = 'order-plain';
  const actions = document.createElement('div');
  actions.className = 'admin-order-actions';
  actions.append(select, save);
  const note = element('p', '');
  note.setAttribute('role', 'status');
  save.addEventListener('click', async () => {
    const session = token;
    save.disabled = select.disabled = true;
    try {
      const saved = await rpc('may5_update_order', {
        p_id: order.id, p_previous: order.status, p_status: select.value,
      }, session);
      if (token !== session) return;
      if (saved !== true) {
        note.textContent = 'Trạng thái đã thay đổi. Hãy làm mới danh sách.';
        return;
      }
      order.status = select.value;
      note.textContent = 'Đã lưu trạng thái.';
    } catch (error) {
      if (token !== session) return;
      if ([401, 403].includes(error.status)) resetSession('Phiên đã hết hạn hoặc không còn quyền quản trị.');
      else note.textContent = 'Chưa lưu được. Vui lòng thử lại.';
    } finally {
      save.disabled = select.disabled = false;
    }
  });

  card.append(
    element('small', dateFormat.format(new Date(order.created_at)) + ' · ' + order.id),
    element('h3', order.customer_name),
    element('p', order.services.map(id => services[id] || id).join(' · ')),
    element('p', order.email),
    phone,
    actions,
    note,
  );
  return card;
}

async function loadOrders(append = false) {
  if (busy || !token) return;
  const session = token;
  const before = append ? cursor : undefined;
  busy = refresh.disabled = more.disabled = loginButton.disabled = true;
  message.textContent = 'Đang tải yêu cầu…';
  try {
    const rows = await rpc('may5_list_orders', {
      p_before: before?.created_at || null,
      p_before_id: before?.id || null,
    }, session);
    if (token !== session) return;
    const page = rows.slice(0, 50);
    if (!append) list.replaceChildren();
    list.append(...page.map(orderCard));
    cursor = page.at(-1);
    more.hidden = rows.length <= 50;
    login.hidden = true;
    dashboard.hidden = logout.hidden = false;
    message.textContent = list.childElementCount ? '' : 'Chưa có yêu cầu đặt dịch vụ.';
  } catch (error) {
    if (token !== session) return;
    if (dashboard.hidden || [401, 403].includes(error.status)) {
      resetSession([401, 403].includes(error.status)
        ? 'Tài khoản chưa có quyền quản trị hoặc phiên đã hết hạn.'
        : 'Chưa tải được yêu cầu. Vui lòng đăng nhập lại.');
    } else message.textContent = 'Chưa tải được yêu cầu. Vui lòng thử lại.';
  } finally {
    busy = refresh.disabled = more.disabled = loginButton.disabled = false;
  }
}

login.addEventListener('submit', async event => {
  event.preventDefault();
  if (!configured || loginButton.disabled) return;
  loginButton.disabled = true;
  const fields = new FormData(login);
  login.reset();
  try {
    const session = await signIn(fields.get('email').trim(), fields.get('password'));
    token = session.access_token;
    if (!token) throw new Error('Missing session');
    expiry = setTimeout(() => resetSession('Phiên đã hết hạn. Vui lòng đăng nhập lại.'), session.expires_in * 1000);
    await loadOrders();
  } catch {
    resetSession('Không đăng nhập được. Kiểm tra email và mật khẩu rồi thử lại.');
  } finally {
    loginButton.disabled = false;
  }
});
logout.addEventListener('click', () => resetSession('Đã đăng xuất.'));
refresh.addEventListener('click', () => loadOrders());
more.addEventListener('click', () => loadOrders(true));
loginButton.disabled = !configured;
if (!configured) {
  message.textContent = 'Trang quản trị đang chờ kết nối hệ thống lưu yêu cầu.';
}
