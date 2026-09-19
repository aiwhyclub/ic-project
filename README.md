# 이천 세이브포인트

이천 당일치기 여행자를 위한 모바일 우선 동선 계획 서비스입니다. 공개 큐레이션 3개를 비교하고, 장소·방문 순서·이동수단을 편집한 뒤 Supabase OAuth로 로그인해 일정을 저장할 수 있습니다.

## 기술 구성

- Next.js 16, React 19, TypeScript, Tailwind CSS
- Supabase Postgres, Auth, Row Level Security
- Kakao Map Web SDK와 외부 Kakao Map 복구 경로
- Vercel 배포

지도 타일·이미지·폴리라인·공급자 원문 응답은 일정 데이터로 저장하지 않습니다. 일정에는 내부 장소 ID, 순서, 이동수단, 체류시간만 보관하고 다시 열 때 경로를 재계산합니다.

## 로컬 실행

```bash
npm ci
cp .env.example .env.local
supabase start
npm run dev
```

`.env.local`의 placeholder를 로컬 Supabase와 Kakao 개발 앱 값으로 교체합니다. 자세한 OAuth·지도 설정은 [`docs/integration-setup.md`](docs/integration-setup.md)를 참고하세요.

## 검증

```bash
npm run lint
npm run typecheck
npm run build
supabase test db
```

## 배포

- 배포 절차와 환경변수: [`docs/deployment.md`](docs/deployment.md)
- 출시 근거와 계정별 확인 항목: [`docs/release-evidence.md`](docs/release-evidence.md)
- 기능·외부 연동 점검표: [`docs/implementation-checklist.md`](docs/implementation-checklist.md)

비밀키, `.env*`, Supabase 로컬 런타임 파일, 에이전트 검증 산출물은 Git에 커밋하지 않습니다.
