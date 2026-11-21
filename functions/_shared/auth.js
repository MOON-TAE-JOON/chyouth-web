const encoder = new TextEncoder();

function encodeBase64Url(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function decodeBase64Url(value) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64 + '='.repeat((4 - base64.length % 4) % 4));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function signingKey(secret) {
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

export async function createSession(hp, secret) {
  const payload = encodeBase64Url(encoder.encode(JSON.stringify({ hp, exp: Date.now() + 8 * 60 * 60 * 1000 })));
  const signature = await crypto.subtle.sign('HMAC', await signingKey(secret), encoder.encode(payload));
  return `${payload}.${encodeBase64Url(new Uint8Array(signature))}`;
}

export async function verifySession(token, secret) {
  if (!token || !secret) return false;
  const [payload, signature, extra] = token.split('.');
  if (!payload || !signature || extra !== undefined) return false;
  try {
    const valid = await crypto.subtle.verify('HMAC', await signingKey(secret), decodeBase64Url(signature), encoder.encode(payload));
    if (!valid) return false;
    const session = JSON.parse(new TextDecoder().decode(decodeBase64Url(payload)));
    return typeof session.hp === 'string' && Number.isFinite(session.exp) && session.exp > Date.now();
  } catch {
    return false;
  }
}

export function getCookie(request, name) {
  const prefix = `${name}=`;
  const entry = (request.headers.get('Cookie') || '').split(';').map((part) => part.trim()).find((part) => part.startsWith(prefix));
  return entry ? entry.slice(prefix.length) : '';
}

export function makeSessionCookie(token, request, maxAge = 8 * 60 * 60) {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return `youth_session=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}
