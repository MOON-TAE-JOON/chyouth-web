# 창일교회 청소년부 로그인

Cloudflare Pages Functions와 D1을 이용한 로그인입니다. 아이디는 `user.hp`, 비밀번호는 요청에 지정된 `user.id` 컬럼과 비교합니다. 로그인 성공 시 `main.html` 소개 페이지로 이동하고, 세션이 없으면 해당 페이지에 접근할 수 없습니다.

## Cloudflare 설정

1. `wrangler.toml`의 D1 이름과 ID가 Cloudflare 계정의 실제 `changil-youth-db` 데이터베이스와 일치하는지 확인합니다.
2. 스키마를 원격 D1에 한 번 적용합니다: `npx wrangler d1 migrations apply changil-youth-db --remote`
3. Cloudflare Pages 프로젝트의 Functions 환경 변수/시크릿에 `SESSION_SECRET`을 설정합니다. 충분히 긴 무작위 문자열을 사용하세요. 예: `npx wrangler pages secret put SESSION_SECRET --project-name chyouth-web`
4. Pages 프로젝트가 저장소 루트를 빌드 출력 디렉터리로 사용하도록 설정합니다. 빌드 명령은 비워 두고 출력 디렉터리는 `.`로 둡니다.

`migrations/0001_create_user.sql`은 `