// Signed-cookie admin session. Uses Web Crypto (crypto.subtle) so the same
// code runs in both the Edge middleware and Node route handlers - requires
// Node 20+ (or any modern Edge runtime), where globalThis.crypto is standard.

export const COOKIE_NAME = 'admin_session';
export const MAX_AGE_SECONDS = 60 * 60 * 12; // 12 hours

function toBase64Url(bytes: Uint8Array): string {
  let str = '';
  bytes.forEach((b) => {
    str += String.fromCharCode(b);
  });
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(b64url: string): Uint8Array<ArrayBuffer> {
  const padded = b64url.replace(/-/g, '+').replace(/_/g, '/');
  const pad = (4 - (padded.length % 4)) % 4;
  const b64 = padded + '='.repeat(pad);
  const str = atob(b64);
  const bytes = new Uint8Array(new ArrayBuffer(str.length));
  for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i);
  return bytes;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

export async function signSession(secret: string): Promise<string> {
  const issuedAt = Date.now().toString();
  const key = await hmacKey(secret);
  const sigBuf = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(issuedAt));
  const sig = toBase64Url(new Uint8Array(sigBuf));
  return `${issuedAt}.${sig}`;
}

export async function verifySession(token: string | undefined | null, secret: string): Promise<boolean> {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [issuedAt, sig] = parts;
  const age = (Date.now() - Number(issuedAt)) / 1000;
  if (!Number.isFinite(age) || age < 0 || age > MAX_AGE_SECONDS) return false;
  try {
    const key = await hmacKey(secret);
    return await crypto.subtle.verify('HMAC', key, fromBase64Url(sig), new TextEncoder().encode(issuedAt));
  } catch {
    return false;
  }
}

export function timingSafeEqualStr(a: string, b: string): boolean {
  const aBytes = new TextEncoder().encode(a);
  const bBytes = new TextEncoder().encode(b);
  if (aBytes.length !== bBytes.length) return false;
  let diff = 0;
  for (let i = 0; i < aBytes.length; i++) diff |= aBytes[i] ^ bBytes[i];
  return diff === 0;
}
