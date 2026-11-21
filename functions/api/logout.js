import { makeSessionCookie } from '../_shared/auth.js';

export async function onRequestPost({ request }) {
  return new Response(null, {
    status: 204,
    headers: {
      'Set-Cookie': makeSessionCookie('', request, 0),
      'Cache-Control': 'no-store',
    },
  });
}
