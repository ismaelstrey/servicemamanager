/* Smoke test for Equipment routes */
const base = process.env.API_URL || 'http://localhost:4002';

async function request(path, { method = 'GET', token, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${base}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  return { status: res.status, data };
}

async function post(path, body, token) { return request(path, { method: 'POST', body, token }); }
async function get(path, token) { return request(path, { method: 'GET', token }); }
async function put(path, body, token) { return request(path, { method: 'PUT', body, token }); }
async function del(path, token) { return request(path, { method: 'DELETE', token }); }

function generateRandomBase12() {
  let s = '';
  for (let i = 0; i < 12; i++) s += Math.floor(Math.random() * 10);
  // Avoid all digits being the same
  if (/^([0-9])\1{11}$/.test(s)) return generateRandomBase12();
  return s;
}

function generateCnpj(baseDigits = generateRandomBase12()) {
  const calcDigit = (nums, startWeight) => {
    let sum = 0;
    let weight = startWeight;
    for (let i = 0; i < nums.length; i++) {
      sum += parseInt(nums[i], 10) * weight;
      weight = weight === 2 ? 9 : weight - 1;
    }
    const r = sum % 11;
    return r < 2 ? 0 : 11 - r;
  };
  const d1 = calcDigit(baseDigits, 5);
  const d2 = calcDigit(baseDigits + String(d1), 6);
  return baseDigits + String(d1) + String(d2);
}

function randomSerial() {
  return 'SN-' + Math.random().toString(36).slice(2, 10).toUpperCase();
}

async function ensureLogin(email, password) {
  const login = await post('/auth/login', { email, password });
  if (login.status === 200 && login.data && login.data.token) {
    return login.data.token;
  }
  const reg = await post('/auth/register', { name: 'Tester', email, password });
  if (reg.status !== 201 || !reg.data || !reg.data.token) {
    throw new Error('Register failed: ' + JSON.stringify(reg));
  }
  const reLogin = await post('/auth/login', { email, password });
  if (reLogin.status !== 200 || !reLogin.data || !reLogin.data.token) {
    throw new Error('Login failed after register: ' + JSON.stringify(reLogin));
  }
  return reLogin.data.token;
}

async function main() {
  console.log('Base URL:', base);
  const email = 'tester@example.com';
  const password = 'secret123';

  console.log('Logging in...');
  const token = await ensureLogin(email, password);
  console.log('Token acquired');

  const cnpj = generateCnpj();
  const workspace = 'ws-' + Math.random().toString(36).slice(2, 8);
  console.log('Creating provider...');
  const provRes = await post('/api/providers', { name: 'Test Provider', cnpj, email: 'prov@example.com', workspace }, token);
  if (provRes.status !== 201) {
    throw new Error('Provider create failed: ' + JSON.stringify(provRes));
  }
  const providerId = provRes.data.data.provider.id;
  console.log('Provider created:', providerId);

  console.log('Listing equipments (initial)...');
  const list1 = await get(`/api/providers/${providerId}/equipments?limit=5&page=1`, token);
  console.log('List1:', list1.status, list1.data);

  console.log('Creating equipment...');
  const create = await post(`/api/providers/${providerId}/equipments`, {
    label: 'Core Switch',
    type: 'switch',
    serial: randomSerial(),
    status: 'active'
  }, token);
  if (create.status !== 201) {
    throw new Error('Create equipment failed: ' + JSON.stringify(create));
  }
  const eqId = create.data.data.id;
  console.log('Equipment created:', eqId);

  console.log('Get equipment by id...');
  const one = await get(`/api/providers/equipments/${eqId}`, token);
  console.log('Get one:', one.status, one.data);

  console.log('Update equipment...');
  const upd = await put(`/api/providers/equipments/${eqId}`, { label: 'Core Switch - Updated', status: 'maintenance' }, token);
  console.log('Update:', upd.status, upd.data);

  console.log('Get stats...');
  const stats1 = await get(`/api/providers/${providerId}/equipments/stats`, token);
  console.log('Stats1:', stats1.status, stats1.data);

  console.log('Delete equipment...');
  const delRes = await del(`/api/providers/equipments/${eqId}`, token);
  console.log('Delete:', delRes.status, delRes.data);

  console.log('Listing equipments (after delete)...');
  const list2 = await get(`/api/providers/${providerId}/equipments?limit=5&page=1`, token);
  console.log('List2:', list2.status, list2.data);

  console.log('Get stats after delete...');
  const stats2 = await get(`/api/providers/${providerId}/equipments/stats`, token);
  console.log('Stats2:', stats2.status, stats2.data);

  console.log('Equipment smoke test completed successfully.');
}

main().catch(err => { console.error('Smoke test failed:', err); process.exit(1); });