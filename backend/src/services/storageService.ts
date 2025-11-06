import { Client } from 'minio';

const endpoint = process.env.S3_ENDPOINT || '';
const publicEndpoint = process.env.S3_PUBLIC_ENDPOINT || '';
const accessKey = process.env.S3_ACCESS_KEY || '';
const secretKey = process.env.S3_SECRET_KEY || '';
const bucket = process.env.S3_BUCKET || '';

let minioClient: Client | null = null;

function getClient(): Client {
  if (minioClient) return minioClient;
  if (!endpoint || !accessKey || !secretKey) {
    throw new Error('S3/MinIO env vars missing: S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY');
  }
  const url = new URL(endpoint);
  const useSSL = url.protocol === 'https:';
  const port = url.port ? parseInt(url.port, 10) : (useSSL ? 443 : 80);

  minioClient = new Client({
    endPoint: url.hostname,
    port,
    useSSL,
    accessKey,
    secretKey,
  });
  return minioClient;
}

export async function ensureBucketExists(): Promise<void> {
  if (!bucket) throw new Error('S3_BUCKET env var missing');
  const client = getClient();
  const exists = await client.bucketExists(bucket).catch(() => false);
  if (!exists) {
    await client.makeBucket(bucket, 'us-east-1');
  }
}

export async function uploadBuffer(
  key: string,
  buffer: Buffer,
  mimeType: string
): Promise<{ url: string; key: string }> {
  if (!bucket) throw new Error('S3_BUCKET env var missing');
  const client = getClient();
  await ensureBucketExists();
  await client.putObject(bucket, key, buffer, buffer.length, {
    'Content-Type': mimeType,
  });

  const baseRaw = publicEndpoint || endpoint;
  const base = baseRaw.endsWith('/') ? baseRaw.slice(0, -1) : baseRaw;
  const url = `${base}/${bucket}/${encodeURIComponent(key)}`;
  return { url, key };
}

export function getPublicUrl(key: string): string {
  const baseRaw = publicEndpoint || endpoint;
  const base = baseRaw.endsWith('/') ? baseRaw.slice(0, -1) : baseRaw;
  return `${base}/${bucket}/${encodeURIComponent(key)}`;
}

export async function deleteByUrl(url: string): Promise<void> {
  if (!bucket) throw new Error('S3_BUCKET env var missing');
  const client = getClient();
  // Espera formato: `${endpoint}/${bucket}/{key}`
  const idx = url.indexOf(`/${bucket}/`);
  if (idx === -1) throw new Error('URL não corresponde ao bucket configurado');
  const key = decodeURIComponent(url.substring(idx + bucket.length + 2));
  await client.removeObject(bucket, key);
}