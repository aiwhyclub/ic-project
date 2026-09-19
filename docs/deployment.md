# 배포 실행 안내

이 문서는 STORY 13.1~13.3의 실제 계정 연결 순서를 기록합니다. 비밀값은 Git에 저장하지 않고 각 서비스의 암호화된 설정 화면 또는 CLI 입력으로만 등록합니다.

## 1. GitHub와 Vercel 연결

1. 로컬 `main`이 `https://github.com/aiwhyclub/ic-project`의 `main`을 추적하는지 확인합니다.
2. Vercel CLI에 로그인한 뒤 계정에 팀이 여러 개면 대상 팀을 고릅니다.
3. 저장소 연결 방식으로 프로젝트를 연결합니다.

```bash
vercel login
vercel teams list --format json
vercel link --repo --scope <team-slug>
```

4. 아래 환경변수와 Supabase·Kakao 설정을 먼저 끝낸 뒤 `main`을 push합니다. Vercel의 배포 기록에서 해당 커밋이 성공 상태인지 확인합니다.

## 2. Supabase Cloud 적용

대상 프로젝트를 명시적으로 확인한 뒤 연결합니다. 프로젝트 ref나 DB 비밀번호를 문서·명령 기록에 남기지 않습니다.

```bash
supabase link --project-ref <project-ref>
supabase db push --include-seed
```

적용 전 로컬에서 `supabase test db`를 통과해야 합니다. 적용 뒤에는 Cloud SQL Editor 또는 제한된 테스트 계정으로 다음을 확인합니다.

- 공개 카탈로그는 익명 읽기만 허용됩니다.
- 일정·정류장·초안은 `auth.uid() = user_id`인 본인만 CRUD할 수 있습니다.
- `delete_account()` 뒤 Auth 사용자와 본인 일정이 함께 제거됩니다.
- 지도 타일·이미지·폴리라인·공급자 원문 응답은 사용자 일정에 저장되지 않습니다.
- `service_role`과 OAuth Client Secret은 브라우저 환경변수에 없습니다.

## 3. Vercel 환경변수

다음 변수는 Production 환경에 등록합니다. Preview OAuth를 사용할 경우 Preview에도 같은 공개값과 별도 허용 URL을 설정합니다.

| 변수 | 공개 여부 | 값의 출처 |
| --- | --- | --- |
| `SUPABASE_URL` | 서버 전용 이름 | Supabase Cloud Project URL |
| `SUPABASE_PUBLISHABLE_KEY` | 공개 키 | Supabase publishable key |
| `NEXT_PUBLIC_SUPABASE_URL` | 브라우저 공개 | 같은 Supabase Cloud Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | 브라우저 공개 | 같은 Supabase publishable key |
| `NEXT_PUBLIC_KAKAO_MAP_APP_KEY` | 브라우저 공개 | Kakao JavaScript 키 |
| `NEXT_PUBLIC_ENABLE_DEMO_AUTH` | 브라우저 공개 | Production은 `false` |
| `SUPABASE_AUTH_EXTERNAL_KAKAO_CLIENT_ID` | 서버 전용 | Kakao REST API 키 |
| `SUPABASE_AUTH_EXTERNAL_KAKAO_SECRET` | 서버 전용 비밀 | Kakao Login Client Secret |

Google Client ID·Secret은 Supabase Dashboard의 Google provider에 저장합니다. Kakao provider도 Supabase Dashboard에서 활성화하며, 이 프로젝트의 이메일 비수집 OIDC 교환을 위해 Kakao REST API 키와 Client Secret은 Vercel의 서버 전용 변수에도 필요합니다.

## 4. OAuth와 허용 도메인

배포 주소를 `https://<deployment-domain>`이라고 할 때 다음을 등록합니다.

### Supabase Dashboard

- Site URL: `https://<deployment-domain>`
- Redirect URL: `https://<deployment-domain>/auth/callback`
- Preview 로그인이 필요하면 Vercel preview wildcard를 별도로 허용합니다.
- Google·Kakao provider를 활성화하고 각 provider 자격증명을 저장합니다.

### Google Auth Platform

- Authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`
- 필요한 경우 배포 도메인을 Authorized JavaScript origin에 추가합니다.

### Kakao Developers

- JavaScript SDK 도메인: `https://<deployment-domain>`
- Kakao Login Redirect URI: `https://<deployment-domain>/auth/callback`
- Supabase 기본 Kakao provider도 사용할 경우 `https://<project-ref>.supabase.co/auth/v1/callback`을 함께 등록합니다.
- Kakao Login과 OpenID Connect를 활성화합니다.

## 5. 공개 주소 검증

다음 순서를 실제 공개 주소에서 확인한 뒤에만 배포 STORY를 완료 처리합니다.

1. 홈에서 공개 큐레이션 3개가 보이고 `/map`에서 Kakao 지도 또는 명시적 fallback이 보입니다.
2. Google 로그인 후 원래 계획으로 돌아와 일정 1개를 저장하고 다시 엽니다.
3. Kakao 로그인 후 같은 흐름을 반복합니다.
4. 서로 다른 두 테스트 계정이 상대 일정에 접근하지 못합니다.
5. 계정 삭제 후 로그아웃되고 해당 일정에 다시 접근할 수 없습니다.
6. Vercel 배포 기록이 GitHub `main`의 최신 커밋을 성공 상태로 표시합니다.
7. [`release-evidence.md`](release-evidence.md)의 계정별 확인 항목과 [`implementation-checklist.md`](implementation-checklist.md)의 외부 연동 공백을 모두 해소합니다.

## 6. 출시 중단 조건

다음 중 하나라도 남아 있으면 공개 출시를 완료로 표시하지 않습니다.

- 실제 Cloud RLS·삭제 흐름 미검증
- Google 또는 Kakao 로그인 실패
- Kakao JavaScript SDK 도메인·쿼터·비용 상태 미확인
- 장소 출처·확인일·사진 사용권 미확인
- 비밀키가 Git, 브라우저 번들 또는 로그에 노출됨
- TMAP 교차 표시 서면 승인 없음에도 앱 내부에 TMAP 경로를 표시함
