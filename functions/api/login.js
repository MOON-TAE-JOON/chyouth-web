import { createSession, makeSessionCookie } from '../_shared/auth.js';

export async function onRequestPost({ request, env }) {
  if (!env.DB || !env.SESSION_SECRET) {
    return Response.json({ error: '서버 설정이 완료되지 않았습니다.' }, { status: 500 });
  }

  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) {
    return Response.json({ error: '요청을 확인할 수 없습니다.' }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: '로그인 정보를 확인해 주세요.' }, { status: 400 });
  }

  const hp = typeof body?.hp === 'string' ? body.hp.trim() : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  if (!hp || !password || hp.length > 100 || password.length > 256) {
    return Response.json({ error: '아이디와 비밀번호를 입력해 주세요.' }, { status: 400 });
  }

  try {
    // Per requested schema, hp is the username and id stores the password.
    const user = await env.DB.prepare('SELECT hp FROM "user" WHERE hp = ? AND id = ? LIMIT 1')
      .bind(hp, password)
      .first();
    if (!user) return Response.json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 });

    const token = await createSession(user.hp, env.SESSION_SECRET);
    return Response.json({ ok: true }, {
      headers: { 'Set-Cookie': makeSessionCookie(token, request), 'Cache-Control': 'no-store' },
    });
  } catch {
    return Response.json({ error: '로그인 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
