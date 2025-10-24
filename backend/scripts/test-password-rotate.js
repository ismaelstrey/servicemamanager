/* Smoke test for Password Vault rotation */
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

function generateRandomBase12() {
  let s = '';
  for (let i = 0; i < 12; i++) s += Math.floor(Math.random() * 10);
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

async function ensureLogin(email, password) {
  const login = await post('/auth/login', { email, password });
  if (login.status === 200 && login.data && login.data.token) {
    return login.data.token;
  }
  const reg = await post('/auth/register', { name: 'Rotate Tester', email, password });
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
  const email = 'rotate.tester@example.com';
  const password = 'secret123';

  console.log('Logging in...');
  const token = await ensureLogin(email, password);
  console.log('Token acquired');

  const cnpj = generateCnpj();
  const workspace = 'ws-' + Math.random().toString(36).slice(2, 8);
  console.log('Creating provider...');
  const provRes = await post('/api/providers', { name: 'Rotate Test Provider', cnpj, email: 'prov.rotate@example.com', workspace }, token);
  if (provRes.status !== 201) {
    throw new Error('Provider create failed: ' + JSON.stringify(provRes));
  }
  const providerId = provRes.data.data.provider.id;
  console.log('Provider created:', providerId);

  console.log('Creating password entry with rotationIntervalDays=7...');
  const create = await post(`/api/providers/${providerId}/passwords`, {
    label: 'Rotate Vault',
    username: 'rotator',
    password: 'initialPass!123',
    rotationIntervalDays: 7
  }, token);
  if (create.status !== 201) {
    throw new Error('Create password failed: ' + JSON.stringify(create));
  }
  const passId = create.data.data.id;
  console.log('Password created:', passId);

  console.log('Rotate password (generate new)...');
  const rotate = await post(`/api/providers/passwords/${passId}/rotate`, {
    length: 20,
    includeSymbols: true,
    excludeSimilar: true
  }, token);
  console.log('Rotate:', rotate.status, rotate.data);

  console.log('Get by id after rotation...');
  const one = await get(`/api/providers/passwords/${passId}`, token);
  console.log('Get one:', one.status, one.data);

  console.log('Rotation smoke test completed successfully.');
}

main().catch(err => { console.error('Rotation smoke test failed:', err); process.exit(1); });