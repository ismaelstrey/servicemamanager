"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureBucketExists = ensureBucketExists;
exports.uploadBuffer = uploadBuffer;
exports.getPublicUrl = getPublicUrl;
exports.deleteByUrl = deleteByUrl;
const minio_1 = require("minio");
const endpoint = process.env.S3_ENDPOINT || '';
const accessKey = process.env.S3_ACCESS_KEY || '';
const secretKey = process.env.S3_SECRET_KEY || '';
const bucket = process.env.S3_BUCKET || '';
let minioClient = null;
function getClient() {
    if (minioClient)
        return minioClient;
    if (!endpoint || !accessKey || !secretKey) {
        throw new Error('S3/MinIO env vars missing: S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY');
    }
    const url = new URL(endpoint);
    const useSSL = url.protocol === 'https:';
    const port = url.port ? parseInt(url.port, 10) : (useSSL ? 443 : 80);
    minioClient = new minio_1.Client({
        endPoint: url.hostname,
        port,
        useSSL,
        accessKey,
        secretKey,
    });
    return minioClient;
}
async function ensureBucketExists() {
    if (!bucket)
        throw new Error('S3_BUCKET env var missing');
    const client = getClient();
    const exists = await client.bucketExists(bucket).catch(() => false);
    if (!exists) {
        await client.makeBucket(bucket, 'us-east-1');
    }
}
async function uploadBuffer(key, buffer, mimeType) {
    if (!bucket)
        throw new Error('S3_BUCKET env var missing');
    const client = getClient();
    await ensureBucketExists();
    await client.putObject(bucket, key, buffer, buffer.length, {
        'Content-Type': mimeType,
    });
    const base = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint;
    const url = `${base}/${bucket}/${encodeURIComponent(key)}`;
    return { url, key };
}
function getPublicUrl(key) {
    const base = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint;
    return `${base}/${bucket}/${encodeURIComponent(key)}`;
}
async function deleteByUrl(url) {
    if (!bucket)
        throw new Error('S3_BUCKET env var missing');
    const client = getClient();
    // Espera formato: `${endpoint}/${bucket}/{key}`
    const idx = url.indexOf(`/${bucket}/`);
    if (idx === -1)
        throw new Error('URL não corresponde ao bucket configurado');
    const key = decodeURIComponent(url.substring(idx + bucket.length + 2));
    await client.removeObject(bucket, key);
}
