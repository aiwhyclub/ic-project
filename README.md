# 이천 세이브포인트

서울·수도권에서 이천을 처음 방문하는 당일치기 여행자를 위한 모바일 우선 동선 계획 서비스입니다. 공개 큐레이션을 비교하거나 새 동선을 만든 뒤, 장소·방문 순서·이동수단을 직접 편집하고 Google 또는 Kakao 계정으로 저장할 수 있습니다.

**공개 서비스:** [https://ictour.vercel.app](https://ictour.vercel.app)

현재 배포는 개인·비상업 학습용 MVP입니다. 운영 환경과 계정·데이터 검증 범위는 [`docs/release-evidence.md`](docs/release-evidence.md)에 기록합니다.

## 핵심 흐름

1. 홈의 검수된 큐레이션 3개를 비교하거나 여행 조건으로 새 동선을 만듭니다.
2. 후보 1~3개를 선택해 일정별로 장소 추가·삭제, 방문 순서, 이동수단을 편집합니다.
3. 저장 시 Google 또는 Kakao OAuth로 로그인하고, 선택한 개수만큼 별도 일정을 만듭니다.
4. 마이페이지에서 본인 일정만 다시 열고 수정·삭제하거나 여행을 시작합니다.
5. 현장에서 휴관·예약 불가·날씨 등으로 계획이 막히면 플랜B 3곳을 비교해 한 장소를 교체합니다.

2026-09-20 기준 공개 데이터는 출처와 확인일이 있는 이천 장소 9개와 큐레이션 3개입니다. 외부 사진은 사용하지 않습니다.

## 기술 구성

- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4
- Supabase Postgres, Auth, Row Level Security
- Kakao Map Web SDK와 외부 Kakao Map 복구 경로
- Vercel Production 배포

프로젝트는 하나의 Next.js 애플리케이션 안에서 화면과 서버 기능을 기능별 모듈로 나누는 모듈러 모놀리식 구조입니다. 공개 장소·큐레이션과 사용자 일정은 분리하고, 사용자 데이터는 `auth.uid() = user_id`인 본인만 접근하도록 RLS로 제한합니다.

지도 타일·이미지·폴리라인·길안내 단계·공급자 원문 응답은 일정 데이터로 저장하지 않습니다. 일정에는 내부 장소 ID, 순서, 이동수단, 체류시간 같은 계획정보만 보관하고 다시 열 때 경로를 재계산합니다.

## 현재 범위

- Kakao Map을 지도와 장소 탐색 화면에 사용합니다.
- Kakao 경로가 실패하면 외부 Kakao Map으로 전환합니다.
- TMAP API와 Kakao 지도 내부 교차 표시는 서면 허용 범위를 확인하기 전까지 제외합니다.
- 위치정보는 플랜B에서 사용자가 동의한 동안만 사용하고 저장하지 않습니다.
- OAuth 제공자 비밀번호·별도 토큰과 `service_role` 키를 브라우저에 저장하거나 노출하지 않습니다.
- 외부 API가 실패해도 편집 중인 장소·순서·이동수단은 유지합니다.

## 로컬 실행

### 준비물

- Node.js와 npm
- Docker Desktop
- [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started)
- 실제 Kakao 지도를 확인하려면 Kakao Developers의 JavaScript 키
- 실제 OAuth를 확인하려면 Google·Kakao 개발자 앱 자격증명

### 실행 순서

```bash
npm ci
cp .env.example .env
cp .env.example .env.local
supabase start
npm run dev
```

기본 개발 주소는 [http://localhost:3000](http://localhost:3000)입니다.

- `.env`는 로컬 Supabase Auth provider 설정에 사용합니다.
- `.env.local`은 Next.js의 브라우저 공개값과 서버 전용값에 사용합니다.
- 두 파일의 placeholder를 로컬 Supabase와 Kakao·Google 개발 앱 값으로 교체합니다.
- 외부 연동 없이 화면 흐름만 확인할 때는 `NEXT_PUBLIC_ENABLE_DEMO_AUTH=true`를 유지합니다.
- 실제 값이 들어간 `.env*` 파일은 Git에 커밋하지 않습니다.

Kakao JavaScript 키와 OAuth callback·provider 설정은 [`docs/integration-setup.md`](docs/integration-setup.md)를 참고하세요.

## 검증

```bash
npm run lint
npm run typecheck
npm run build
supabase test db
```

`supabase test db`는 Docker와 로컬 Supabase가 실행 중일 때 사용합니다. 공개 배포를 완료로 판단하려면 로컬 검사뿐 아니라 OAuth 복귀, 사용자별 일정 격리, 계정 삭제 연쇄, Kakao 지도와 허용 도메인을 실제 Production 환경에서 확인해야 합니다.

## 주요 폴더

| 경로 | 역할 |
| --- | --- |
| `src/app` | Next.js 페이지와 Route Handler |
| `src/features` | 인증, 일정, 지도, 플랜B 등 기능 모듈 |
| `src/data` | 검증 장소와 기본 큐레이션 데이터 |
| `src/lib/domain` | 경로·큐레이션 등 순수 도메인 로직 |
| `supabase/migrations` | 데이터 구조, RLS, 계정 삭제 RPC |
| `supabase/tests` | pgTAP 데이터베이스 권한 테스트 |
| `docs` | 제품·기능·기술·배포·출시 근거 문서 |

## 문서 안내

- 제품 범위와 사용자 문제: [`docs/prd.md`](docs/prd.md)
- 기능 정의와 권한: [`docs/frd.md`](docs/frd.md)
- 기술 선택과 데이터 구조: [`docs/trd.md`](docs/trd.md)
- STORY별 개발 상태: [`docs/plan.md`](docs/plan.md)
- Kakao Map·Supabase 연동: [`docs/integration-setup.md`](docs/integration-setup.md)
- 배포 절차와 환경변수: [`docs/deployment.md`](docs/deployment.md)
- 출시 근거와 검증 경계: [`docs/release-evidence.md`](docs/release-evidence.md)
- 기능·외부 연동 점검표: [`docs/implementation-checklist.md`](docs/implementation-checklist.md)

비밀키, `.env*`, Supabase 로컬 런타임 파일, 데이터베이스 dump, 에이전트 검증 산출물은 Git에 커밋하지 않습니다.
