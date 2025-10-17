/* Simple script to validate /auth/register and /auth/login endpoints */
const base = process.env.API_URL || 'http://localhost:4000';

async function postJson(path, body) {
  const res = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  return { status: res.status, data };
}

async function main() {
  const creds = { name: 'Tester', email: 'tester@example.com', password: 'secret123' };

  console.log(`Registering user at ${base}/auth/register ...`);
  const reg = await postJson('/auth/register', creds);
  console.log('Register response:', reg.status, reg.data);

  console.log(`Logging in user at ${base}/auth/login ...`);
  const login = await postJson('/auth/login', { email: creds.email, password: creds.password });
  console.log('Login response:', login.status, login.data);
}

main().catch((err) => { console.error(err); process.exit(1); });