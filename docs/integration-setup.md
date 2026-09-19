# Kakao Map·Supabase 연동 설정

상태: 로컬 DB·RLS, Kakao 지도, Kakao OIDC 로그인, Kakao Developers, Supabase Cloud provider·URL 설정 완료. Google OAuth와 배포 도메인은 미설정. TMAP 연동과 Kakao 지도 내부 교차 표시는 현재 계획에서 제외

## 현재 자동 설정된 항목

- 로컬 Supabase 마이그레이션 적용 완료
- pgTAP 44개 통과, DB lint 오류 0건
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 로컬 연결 완료
- Supabase Auth 허용 앱 콜백:
  - `http://127.0.0.1:3000/auth/callback`
  - `http://127.0.0.1:3002/auth/callback`
- OAuth 설정 전 로컬 검증용 `NEXT_PUBLIC_ENABLE_DEMO_AUTH=true`
- 기존 Kakao JavaScript 키를 `NEXT_PUBLIC_KAKAO_MAP_APP_KEY`에 연결
- 기존 Kakao REST API 키·Client Secret을 로컬 Supabase Kakao provider에 연결
- 로컬 Auth settings에서 `external.kakao=true` 확인
- Kakao JavaScript SDK 도메인과 Kakao Login Redirect URI 저장 완료
- Kakao Login과 OpenID Connect 활성화 완료
- Supabase Cloud Site URL·Redirect URL과 Kakao provider 저장 완료
- `/map`에서 실제 Kakao 지도 타일·축척·저작권 링크 렌더링 확인
- Kakao 로그인 → 앱 callback → Supabase 세션 생성 → 요청한 `/plan` 복귀 확인
- 로컬 Auth에 Kakao 사용자 1명 생성, 이메일 미저장 확인

## Kakao Map 설정

Kakao 지도는 **JavaScript 키**를 사용합니다. Kakao 로그인에서 사용하는 REST API 키와 구분해야 합니다.

1. [Kakao Developers](https://developers.kakao.com/)에서 앱을 생성하거나 기존 앱을 선택합니다.
2. `앱 > 앱 설정 > 앱 > 플랫폼 키 > JavaScript 키`로 이동합니다.
3. JavaScript SDK 도메인에 아래 주소를 등록합니다.
   - `http://localhost:3002`
   - `http://127.0.0.1:3000`
   - `http://127.0.0.1:3002`
   - 배포 후 실제 `https://` 도메인
4. JavaScript 키를 `.env.local`의 `NEXT_PUBLIC_KAKAO_MAP_APP_KEY`에 저장합니다.
5. Next.js를 다시 빌드·실행합니다.

공식 근거: [Kakao 지도 Web API 가이드](https://apis.map.kakao.com/web/guide/), [Kakao 앱 키·도메인 설정](https://developers.kakao.com/docs/en/app-setting/app)

## Supabase Kakao OAuth 설정

Kakao OAuth의 `client_id`는 **REST API 키**, `client_secret`은 **Kakao Login Client Secret**입니다.

1. Kakao Developers의 `플랫폼 키 > REST API 키`에서 Client Secret을 발급하고 활성화합니다.
2. REST API 키의 Kakao Login Redirect URI에 아래 주소를 등록합니다.
   - `http://127.0.0.1:54321/auth/v1/callback`
   - `http://localhost:3002/auth/callback`
   - `http://127.0.0.1:3002/auth/callback`
   - 필요하면 `http://localhost:54321/auth/v1/callback`도 함께 등록
   - 배포 시 Supabase Dashboard에 표시되는 `https://<project-ref>.supabase.co/auth/v1/callback`
   - 앱 callback은 반드시 **카카오 로그인 리다이렉트 URI** 영역에 넣습니다. 바로 아래 비즈니스 인증 리다이렉트 URI에 넣으면 KOE006이 발생합니다.
3. `카카오 로그인 > 사용 설정`을 ON으로 바꿉니다.
4. `카카오 로그인 > OpenID Connect`를 ON으로 바꿉니다.
5. 동의 항목에서 `profile_nickname`, `profile_image`를 설정합니다. 이메일이 필요하면 `account_email`을 추가합니다.
6. `.env.local`에 아래 값을 저장합니다.

```dotenv
SUPABASE_AUTH_EXTERNAL_KAKAO_CLIENT_ID=<REST API key>
SUPABASE_AUTH_EXTERNAL_KAKAO_SECRET=<Kakao Login Client Secret>
```

7. `supabase/config.toml`에 아래 설정을 추가합니다.

```toml
[auth.external.kakao]
enabled = true
client_id = "env(SUPABASE_AUTH_EXTERNAL_KAKAO_CLIENT_ID)"
secret = "env(SUPABASE_AUTH_EXTERNAL_KAKAO_SECRET)"
email_optional = true
```

### 비즈 앱이 아닌 경우의 Kakao OIDC 경로

Supabase Auth의 기본 Kakao OAuth provider는 현재 `account_email`, `profile_image`, `profile_nickname`을 항상 요청합니다. Kakao 비즈 앱이 아니면 `account_email` 권한을 받을 수 없어 KOE205가 발생할 수 있습니다. 이 프로젝트는 이메일을 수집하지 않도록 다음 OIDC 경로를 사용합니다.

1. `/auth/kakao/start`가 CSRF state 쿠키를 만들고 `openid profile_nickname profile_image`만 요청합니다.
2. Kakao가 `/auth/callback`으로 돌려보낸 code와 state를 `/api/auth/kakao/exchange`가 검증합니다.
3. 서버가 Client Secret으로 code를 ID Token으로 교환합니다.
4. 브라우저는 `supabase.auth.signInWithIdToken({ provider: "kakao" })`으로 Supabase 세션을 만듭니다.

Client Secret은 서버 환경변수에만 두며 브라우저 번들·URL·로그에 넣지 않습니다. Kakao 동의항목에서는 닉네임을 필수, 프로필 사진을 선택으로 설정하고 이메일 항목은 요청하지 않습니다.

공식 근거: [Supabase Kakao 로그인](https://supabase.com/docs/guides/auth/social-login/auth-kakao), [Kakao 로그인 사전 설정](https://developers.kakao.com/docs/en/kakaologin/prerequisite)

## Supabase Google OAuth 설정

1. Google Auth Platform에서 Web application OAuth Client를 생성합니다.
2. Authorized JavaScript origins에 아래 주소를 등록합니다.
   - `http://127.0.0.1:3000`
   - `http://127.0.0.1:3002`
3. Authorized redirect URIs에 `http://127.0.0.1:54321/auth/v1/callback`을 등록합니다.
4. `.env.local`에 Client ID와 Client Secret을 저장합니다.

```dotenv
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=<Google Web Client ID>
SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=<Google Client Secret>
```

5. `supabase/config.toml`에 아래 설정을 추가합니다.

```toml
[auth.external.google]
enabled = true
client_id = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID)"
secret = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET)"
skip_nonce_check = false
```

공식 근거: [Supabase Google 로그인](https://supabase.com/docs/guides/auth/social-login/auth-google)

## 설정 반영과 확인

OAuth 값을 추가한 뒤 아래 순서로 재시작합니다.

```bash
supabase stop
supabase start
npm run build
npm run start -- --port 3002
```

확인 항목:

1. `/map`에서 연습 지도 대신 실제 Kakao 지도 타일과 마커가 보입니다.
2. Google 또는 Kakao 로그인 후 `/auth/callback`을 거쳐 원래 계획 화면으로 돌아옵니다.
3. 두 계정이 서로의 일정을 볼 수 없습니다.
4. 저장 동선을 다시 열면 장소 순서를 먼저 복원하고 경로를 새로 계산합니다.
5. 실제 연동 완료 후 `NEXT_PUBLIC_ENABLE_DEMO_AUTH=false`로 변경합니다.

## 배포 시 추가 설정

- Kakao JavaScript SDK 도메인에 실제 배포 도메인 추가
- Kakao REST API 키의 Redirect URI에 Supabase Cloud callback 추가
- Supabase Dashboard `Authentication > URL Configuration`에 실제 `/auth/callback` 추가
- Supabase Dashboard `Authentication > Providers`에서 Google·Kakao 활성화
- Vercel 환경변수에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_KAKAO_MAP_APP_KEY` 추가
- Google·Kakao Client Secret은 공개 변수로 만들지 않고 Supabase provider 설정에만 저장

## TMAP 보완 경로 승인 게이트

2026-09-20에 TMAP·Kakao 공식 공개 문서를 다시 확인했지만, TMAP 경로 데이터를 Kakao Map Web SDK 위에 표시해도 된다는 명시적 허용 근거는 찾지 못했습니다. 현재 상태는 **불허 확정이 아니라 허용 미확정**입니다.

- [TMAP API 약관](https://tmapapi.tmapmobility.com/terms.html)은 경로안내와 외부 TMAP 연동을 제공 기능으로 안내하고 API 데이터의 24시간 초과 사용을 금지합니다.
- [Kakao 플랫폼 서비스 약관](https://developers.kakao.com/terms/ko/site-terms)과 [운영정책](https://developers.kakao.com/terms/ko/site-policies)은 제3자 권리 침해와 제휴 오인 표시를 금지하지만 TMAP 교차 표시를 승인하지는 않습니다.
- 서면 승인 전에는 TMAP 앱·웹 외부 열기만 유지하고, TMAP API 키·서버 호출·경로 폴리라인·공급자 배지를 제품 내부에 추가하지 않습니다.
- 승인 문의 항목과 공식 문의 경로는 `docs/research/map-provider-feasibility.md`의 `2026-09-20 공개 문서 재확인`을 기준으로 합니다.

서면 승인을 받은 뒤에만 다음 설정을 진행합니다.

1. 허용된 이동수단과 API 상품에 맞는 TMAP 프로젝트·앱 키를 발급합니다.
2. 앱 키는 서버 전용 환경변수에 저장하고 브라우저 번들에 노출하지 않습니다.
3. 경로 응답은 현재 화면에서만 사용하고 일정·초안·로그에 폴리라인이나 원문 응답을 저장하지 않습니다.
4. Kakao 지도 출처와 TMAP 경로 출처를 승인된 형식으로 분리 표시합니다.
5. 허용 범위, 브랜드 표시, 보관 제한, 비용 상한을 실제 공개 주소에서 다시 검증합니다.
