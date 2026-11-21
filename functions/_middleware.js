import { getCookie, verifySession } from './_shared/auth.js';

export async function onRequest({ request, env, next }) {
  const path = new URL(request.url).pathname;
  if (path === '/api/login' || path === '/api/logout') return next();

  const valid = env.SESSION_SECRET && await verifySession(getCookie(request, 'youth_session'), env.SESSION_SECRET);
  if (path === '/') {
    if (valid) return Response.redirect(new URL('/main.html', request.url), 302);
    return next();
  }
  if (path === '/main.html') {
    if (valid) return next();
    return Response.redirect(new URL('/', request.url), 302);
  }
  return next();
}
