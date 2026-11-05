// Use only the public Supabase publishable key here.
const projectUrl = '';
const publicKey = '';

export const configured = Boolean(projectUrl && publicKey);

async function request(path, body, token) {
  if (!configured) throw new Error('Hệ thống đặt dịch vụ đang được thiết lập.');
  const headers = { apikey: publicKey, 'Content-Type': 'application/json' };
  if (token) headers.Authorization = 'Bearer ' + token;
  const response = await fetch(projectUrl + path, {
    method: 'POST',
    signal: AbortSignal.timeout(15000),
    headers,
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const error = new Error('Yêu cầu chưa được xử lý. Vui lòng thử lại.');
    error.status = response.status;
    throw error;
  }
  return response.json();
}

export function rpc(name, body, token) {
  return request('/rest/v1/rpc/' + name, body, token);
}

export function signIn(email, password) {
  return request('/auth/v1/token?grant_type=password', { email, password });
}
