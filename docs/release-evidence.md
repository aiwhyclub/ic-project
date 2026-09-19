# 출시 근거 레지스터

사용 도구: 공식 문서 웹 검증 + 로컬 저장소 점검 + Vercel/Supabase/Google/Kakao Dashboard + 공개 브라우저·Cloud REST 검증

- 기준일: 2026-09-20
- 범위: Vercel, Supabase, Kakao Maps, TMAP, 장소 정보, 사진 사용권
- STORY 13.1 판정: **완료 — Git 연결과 Production READY 확인**
- STORY 13.2 판정: **완료 — Production 환경변수·지도·두 OAuth·사용자별 저장 확인**
- STORY 13.3 판정: **완료 — 계정삭제 연쇄와 운영 도메인 전환까지 검증**
- 정정 항목 1건 · 신뢰도 0.99: Supabase Dashboard Users 표의 빈 결과를 사용자 0명으로 잘못 해석했으나, Auth Admin 200 응답에서 Google·Kakao 사용자 각 1명을 확인해 정정했다.
- 원칙: 공식 1차 문서만 외부 사실 근거로 사용하고, 외부 사실과 프로젝트 결정을 분리한다.
- 보안: API 키, Client Secret, 액세스 토큰, 앱 ID, 개인 이메일, Google project ID와 Supabase project ref는 기록하지 않는다.
- 판정어: 대시보드나 실제 계정에서 확인하지 않은 값은 `계정 검증 필요`로 표시한다.

실재 장소 카탈로그 9개와 사진 미사용 정책은 로컬 fixture·Cloud seed에 반영됐다. 현재 문서는 완료된 항목과 계정·브라우저에서 아직 검증하지 못한 항목을 분리해 기록한다.

## 1. 출시 판정 요약

| 영역 | 확인된 사실 | 프로젝트 판단 | 출시 전 상태 |
| --- | --- | --- | --- |
| Vercel | Team `Drone`의 Hobby 프로젝트 `ic-project`가 GitHub `aiwhyclub/ic-project`의 `main`과 연결됐다. Production 환경변수 반영 배포가 `READY`이며 안정 URL은 `https://ictour.vercel.app`이다. | STORY 13.1 완료. 단, Hobby는 개인·비상업 범위이므로 상업 운영이면 Pro 전환이 필요하다. | **완료** |
| Supabase | `Vibe Coding Project`는 `FREE`·`Healthy`다. migration 5개가 적용됐고 Cloud DB lint는 clean이다. Site URL·redirect allow list·Google/Kakao provider를 설정했다. 삭제 전 provider별 사용자·일정 1개씩을 확인한 뒤 Google 사용자를 삭제했고, Google 소유 가족 일정도 함께 삭제됐다. | 두 OAuth 로그인·callback·사용자별 저장·격리와 계정삭제 연쇄를 확인했다. Free 자동 backup은 없지만 schema·data dump 실행 절차와 결과를 검증했다. | **완료** |
| Kakao Maps | 계정의 유일한 Drone 앱에 Kakao Map 무료 쿼터 배지가 있다. Production JavaScript SDK domain·Login Redirect URI와 실제 지도 타일·축척·저작권 링크를 확인했다. | Production domain·redirect·지도 렌더링·현재 유료비용 상한 blocker는 해제됐다. | **완료** |
| TMAP | 공개 문서에는 경로·외부 앱 연동 기능과 데이터 보관·유료 전환 경계가 있다. 세부 링크는 부록 A9~A11에 보존했다. | TMAP API 연동과 Kakao Map 내부 교차 표시는 1차 출시에서 제외한다. 재도입은 외부 앱·웹 전환부터 별도 검토하며, 내부 표시는 서면 허용 근거를 확보한 뒤에만 검토한다. | **현재 출시 범위 제외** |
| Cloud REST·RLS | 익명 조회 `places=9`, `curations=3`, `curation_stops=12`, `place_media=0`, `example.com source=0`, 익명 insert 401을 확인했다. 삭제 전 Google·Kakao 사용자는 각 1명이고 일정도 provider별 1개였으며 상대 일정을 볼 수 없었다. Google 계정삭제 뒤에는 Kakao 사용자 1명·일정 1개·stop 4개만 남고 draft는 0개였다. | 공개 읽기·익명 쓰기 차단·`auth.uid()` 소유 데이터 격리와 Google auth user·소유 일정·stop 연쇄 삭제를 확인했다. | **완료** |
| 장소 정보·사진 | `src/data/place-fixtures-*.ts`와 `supabase/seed.sql`이 실재 장소 9개·외부 사진 0개로 교체됐다. 근거는 `docs/research/verified-place-catalog.md`에 있다. | fake fixture·`example.com`·외부 사진 blocker는 해제됐다. 장소·사진 범위는 현재 photo-free 정책으로 완료다. | **완료** |
| Vercel 환경변수 | 사용자의 명시적 승인 뒤 Production 변수 8개를 Config/Secret으로 분리 등록하고 최신 production을 재배포해 `READY`를 확인했다. | 공개 앱의 Cloud DB·Kakao 지도·두 OAuth 연결에 필요한 runtime 설정을 완료했다. | **완료** |

## 2. 본문 공식 근거 5건

### F1. Vercel Git 배포 연결 방식

**사실.** Vercel은 연결된 Git 저장소의 branch push마다 Preview 배포를 만들고, production branch의 최신 변경으로 Production 배포를 만든다. 프로젝트를 가져올 때 root directory, framework preset, build output, environment variables를 설정할 수 있다. (출처: https://vercel.com/docs/git)

- `source_url`: https://vercel.com/docs/git
- `captured_at`: 2026-09-20
- `provenance_note`: Vercel 공식 Git 배포 문서의 자동 배포, 저장소 import, production branch 설명을 확인했다.

**프로젝트 사실.** Vercel Dashboard에서 Team `Drone`, Hobby, project `ic-project`, 연결 저장소 `aiwhyclub/ic-project`, production branch `main`을 확인했다. 환경변수 반영 재배포는 `READY`이고 안정 URL은 `https://ictour.vercel.app`이다. 브라우저에서 실제 Kakao 지도, 장소 9개, 큐레이션 3개도 확인했다.

**프로젝트 판단.** STORY 13.1은 완료다. 이후 Production 변수 8개를 반영한 재배포도 `READY`로 확인했다.

### F2. Vercel 플랜 경계

**사실.** Pro의 현재 공식 플랫폼 요금은 월 $20이며, 배포 가능한 좌석 1개와 월 $20 사용 크레딧을 포함하고 초과 사용은 별도 청구될 수 있다. Hobby의 무료·비상업 경계는 부록 A1에 별도 보존했다. (출처: https://vercel.com/docs/plans/pro-plan)

- `source_url`: https://vercel.com/docs/plans/pro-plan
- `captured_at`: 2026-09-20
- `provenance_note`: Vercel 공식 Pro 문서에서 플랫폼 요금, 포함 좌석, 크레딧과 사용량 과금 구조를 확인했다. Hobby의 비상업 제한은 부록 A1에 보존했다.

**프로젝트 사실.** 현재 Team plan은 Hobby다.

**프로젝트 판단.** 개인·비상업 데모라면 현재 플랜을 유지할 수 있다. 상업 서비스로 운영한다면 Hobby 조건에 맞지 않으므로 Pro 전환과 사용량 비용 상한을 출시 전에 확정해야 한다.

### F3. Supabase 가격과 백업 보존

**사실.** 공개 가격표상 Free는 월 $0이고, Pro는 월 $25부터다. Pro에는 프로젝트당 8GB 디스크, 100,000 MAU, 250GB egress와 7일 보존 일일 백업이 포함된다. 추가 프로젝트·초과 사용·부가 기능은 별도 비용이 생길 수 있다. (출처: https://supabase.com/pricing)

- `source_url`: https://supabase.com/pricing
- `captured_at`: 2026-09-20
- `provenance_note`: Supabase 공식 가격표의 Free/Pro 가격, Pro 포함량, 7일 일일 백업을 확인했다. 세부 백업 범위와 Free 대응은 부록 A2에 보존했다.

**프로젝트 사실.** `Vibe Coding Project`는 `FREE`·`Healthy`이며 Dashboard에 backup이 없다.

**프로젝트 판단.** Free 선택과 자동 backup 부재를 확인했다. `supabase db dump`로 `public` schema·data dump를 실제 생성하고 크기·SHA-256·8개 `COPY public.` 구문을 확인했으며, 저장소 밖 암호화 보관 절차를 `docs/deployment.md`에 기록했다.

### F4. Supabase Auth redirect URL

**사실.** Supabase Auth의 `redirectTo`는 Redirect URLs allow list와 일치해야 하며, Site URL은 별도 `redirectTo`가 없을 때의 기본값이다. Vercel Preview URL 패턴을 추가할 수 있지만 Production에는 정확한 redirect URL 사용이 권고된다. (출처: https://supabase.com/docs/guides/auth/redirect-urls)

- `source_url`: https://supabase.com/docs/guides/auth/redirect-urls
- `captured_at`: 2026-09-20
- `provenance_note`: Supabase 공식 redirect 문서의 Site URL, allow list, Vercel Preview 패턴과 Production 정확 URL 권고를 확인했다.

**프로젝트 사실.** Supabase Cloud `Site URL`은 `https://ictour.vercel.app`이며 redirect allow list에는 새 Production `/auth/callback`이 추가되고 기존 Production callback은 제거돼 총 3개다. Google·Kakao provider 모두 Enabled다. Google OAuth credential은 사용자가 비밀값을 노출하지 않고 직접 입력했다.

**프로젝트 판단.** 두 provider 설정과 Production 로그인·callback·일정 저장을 확인했다. Google·Kakao 사용자는 각각 별도 소유 일정 1개만 조회했으므로 STORY 13.2는 완료다.

### F5. Supabase RLS

**사실.** 노출 schema의 테이블에는 RLS를 활성화해야 하며, `auth.uid()`로 요청 사용자와 `user_id`를 비교할 수 있다. `service_role`은 RLS를 우회하므로 서버에만 둬야 한다. 공식 문서는 grant와 policy를 함께 구성하고 데이터베이스 테스트로 허용·거부를 검증하도록 안내한다. (출처: https://supabase.com/docs/guides/database/postgres/row-level-security)

- `source_url`: https://supabase.com/docs/guides/database/postgres/row-level-security
- `captured_at`: 2026-09-20
- `provenance_note`: Supabase 공식 RLS 문서의 exposed schema 보호, auth.uid(), grant/policy, service_role, 테스트 지침을 확인했다.

**프로젝트 사실.** Cloud에 기존 3개와 array type fix·publish time fix를 포함한 migration 5개가 적용됐고 DB lint는 clean이다. 익명 REST로 공개 카탈로그 수량을 확인했으며 익명 `places` insert는 HTTP 401이었다.

**프로젝트 판단.** 익명 쓰기 차단과 두 OAuth 사용자의 `auth.uid()` 소유권 격리를 증명했다. 승인된 Google 계정삭제 뒤 Auth 사용자는 Kakao 1명만 남았고, Google 소유 가족 일정은 사라졌으며 Kakao 일정 1개·stop 4개는 유지되고 draft는 0개였다. 따라서 auth user·소유 일정·stop 연쇄 삭제와 타 사용자 데이터 보존을 확인했다.

## 3. 2026-09-20 live evidence

아래는 공식 공개 문서의 일반 사실이 아니라 이번 배포·계정·브라우저·REST 검증에서 관찰한 프로젝트 상태다. 비밀값, Supabase project ref와 토큰은 기록하지 않는다.

### L1. Vercel 배포

- `evidence_source`: Vercel Dashboard, Git 연결 상태, Production deployment, 공개 브라우저
- `captured_at`: 2026-09-20
- `provenance_note`: Team·plan·project·연결 저장소·branch·READY 상태를 Dashboard에서 확인하고, 안정 URL `https://ictour.vercel.app`에서 페이지 제목과 큐레이션 3개를 확인했다.

### L2. Supabase Cloud 구성

- `evidence_source`: Supabase Dashboard와 Cloud migration/lint 결과
- `captured_at`: 2026-09-20
- `provenance_note`: project display name, FREE·Healthy, migration 5개, DB lint clean, 새 Site URL, 새 Production callback을 포함한 redirect allow list 총 3개, Google·Kakao Enabled와 backup 없음 상태를 확인했다.

### L3. Cloud REST·RLS 최소 검증

- `evidence_source`: 익명 Cloud REST 응답과 익명 insert 응답
- `captured_at`: 2026-09-20
- `provenance_note`: 공개 row 수 `places=9`, `curations=3`, `curation_stops=12`, `place_media=0`, `example.com source=0`과 익명 `places` insert HTTP 401을 확인했다. endpoint와 토큰은 기록하지 않았다.

### L4. 장소·사진 seed

- `evidence_source`: `src/data/place-fixtures-*.ts`, `src/data/place-fixture-base.ts`, `supabase/seed.sql`, `docs/research/verified-place-catalog.md`
- `captured_at`: 2026-09-20
- `provenance_note`: 실재 장소 9개, 장소별 공식 출처·확인일, `photos=[]`, `place_media=0`, `example.com` 제거를 로컬 구현과 Cloud REST 수량으로 교차 확인했다.

### L5. 배포 환경변수·재배포

- `evidence_source`: 사용자 명시적 승인, Vercel Project Settings와 Production redeploy
- `captured_at`: 2026-09-20
- `provenance_note`: Production 변수 8개를 공개 Config 6개·서버 전용 Secret 2개로 등록하고 최신 production redeploy가 READY임을 확인했다. 값은 기록하지 않았다.

### L6. Kakao production 설정·쿼터·과금 상태

- `evidence_source`: Kakao Developers 앱·플랫폼 키·Kakao Login·쿼터·Biz Wallet Dashboard
- `captured_at`: 2026-09-20
- `provenance_note`: 계정의 유일한 Drone 앱, Kakao Map 무료 쿼터 배지, Production JavaScript SDK domain과 Login Redirect URI 저장, 이번 달 무료 API `2 / 3,000,000`, 오늘 상세 Map Web SDK `1 / 300,000`, 주소검색 `18 / 100,000`, 이용 중 Biz Wallet 없음 상태를 확인했다. 앱 ID와 키 값은 기록하지 않았다.

### L7. Google OAuth production 설정

- `evidence_source`: Google Cloud Console의 project·Google Auth Platform·OAuth client와 Supabase provider Dashboard
- `captured_at`: 2026-09-20
- `provenance_note`: 별도 Google Cloud project `ic-project`를 조직 없음·결제 연결 없음으로 생성하고, Google Auth Platform 앱 `이천 세이브포인트`를 External testing audience로 설정했다. 사용자가 Google API 사용자 데이터 정책을 직접 검토·동의했고, Web OAuth client `Icheon Savepoint Web`에 Production JavaScript origin과 Supabase Cloud auth callback을 등록했다. 사용자가 credential 값을 직접 Supabase에 입력한 뒤 Google·Kakao provider 모두 Enabled임을 확인했다. 개인 이메일, Google project ID, Client ID/Secret과 Supabase project ref는 기록하지 않았다.

### L8. Production OAuth·소유권 격리·계정삭제 연쇄

- `evidence_source`: 공개 브라우저, Supabase Auth Admin 200 응답, service-role REST의 비식별 집계
- `captured_at`: 2026-09-20
- `provenance_note`: 삭제 전 Auth 사용자는 Google 1명·Kakao 1명이고, 일정은 Google 소유 가족 일정 1개·Kakao 소유 일정 1개였다. 각 마이페이지는 자기 일정 1개만 표시했다. Google 계정을 삭제한 뒤 비식별 집계는 Auth 사용자 1명(Kakao), 일정 1개, stop 4개, draft 0개였고 Google 소유 가족 일정은 사라졌다. Dashboard Users 표는 비어 있었지만 Auth Admin 200 응답과 실제 RLS 조회를 우선 근거로 사용했다. 사용자 ID·이메일·token은 기록하지 않았다.

### L9. Supabase Free 수동 백업 검증

- `evidence_source`: `supabase db dump --linked --schema public`, `--data-only --use-copy`, `wc -c`, `shasum -a 256`, `rg '^(COPY public\\.)'`
- `captured_at`: 2026-09-20
- `provenance_note`: schema dump 23,427바이트와 data dump 13,127바이트를 생성하고 SHA-256을 계산했다. data dump에 8개 public 테이블의 COPY 구문이 있음을 확인했다. 민감 dump 원본은 검증 후 삭제하고 저장소 밖 암호화 보관 절차만 `docs/deployment.md`에 남긴다.

### L10. 운영 도메인 전환

- `evidence_source`: Vercel CLI·Dashboard, Supabase Auth URL Configuration, Google Cloud OAuth client, Kakao Developers 플랫폼 키, 공개 브라우저
- `captured_at`: 2026-09-20
- `provenance_note`: 안정 URL을 `https://ictour.vercel.app`로 연결하고 Supabase Site URL·Production callback, Google 승인 JavaScript origin, Kakao JavaScript SDK domain·Login Redirect URI를 같은 도메인으로 교체했다. 기존 Production callback과 허용 origin은 제거했으며 비밀값은 기록하지 않았다.

## 4. Google·Kakao·TMAP 출시 범위 판단

Kakao Maps의 도메인, 쿼터·비용과 약관 사실은 부록 A5~A8에, TMAP 기능·대중교통 상품·약관 사실은 부록 A9~A11에 보존했다. 본문에서는 계정 값이나 공개 약관의 허용 범위를 추정하지 않고 프로젝트 결정만 기록한다.

### Google OAuth

- 별도 Google Cloud project `ic-project`는 조직 없음·결제 연결 없음 상태다.
- Google Auth Platform 앱 이름은 `이천 세이브포인트`, audience는 External testing이다.
- 사용자가 Google API 사용자 데이터 정책을 직접 검토·동의했다.
- Web OAuth client `Icheon Savepoint Web`에 `https://ictour.vercel.app` origin과 Supabase Cloud auth callback을 등록했다.
- Client ID/Secret은 사용자가 직접 Supabase에 입력했고 Google provider가 Enabled임을 확인했다. credential 값은 이 문서에 기록하지 않는다.
- 결론: **Google provider 설정·Production 로그인·callback·일정 저장 완료**.

### Kakao Maps

- Supabase Kakao provider는 Enabled다.
- Kakao 계정에는 Drone 앱 하나만 있고 해당 앱에 Kakao Map 무료 쿼터 배지가 있다.
- JavaScript SDK production domain `https://ictour.vercel.app`과 Kakao Login Redirect URI `https://ictour.vercel.app/auth/callback` 등록·저장을 확인했다.
- Dashboard 표시는 이번 달 무료 API `2 / 3,000,000`이다. 오늘 상세에는 Map Web SDK `1 / 300,000`, 주소검색 `18 / 100,000`이 각각 표시됐다. 서로 다른 집계 화면의 수치를 임의로 합산하지 않는다.
- 이용 중 Biz Wallet이 없다. 현재 계정 상태에서는 유료 API 결제가 자동 발생할 근거가 없으므로 프로젝트 비용 상한을 **0원**으로 운영한다. Biz Wallet을 연결하거나 유료 API를 활성화하면 즉시 재검토한다.
- Production에서 실제 Kakao 지도 축척·저작권 링크와 Kakao OAuth 사용자·일정 저장을 확인했다.
- 자동차 길찾기는 카카오내비 REST API의 별도 쿼터이며 Kakao Maps 추가 단가 표와 혼동하지 않는다.
- 카카오가 제공한 데이터의 저장·재사용 범위와 브랜드 표시는 약관·운영정책을 따른다.
- 결론: **Production domain·redirect·지도 렌더링·OAuth·현재 비용 상한 blocker 해제**.

### TMAP

공식 공개 문서에서 TMAP 경로 좌표를 Kakao Map 위에 표시해도 된다는 명시적 허용은 확인하지 못했다. 이는 불허 확정이 아니라 **허용 미확정**이다. 따라서 현재 `docs/prd.md`, `docs/frd.md`, `docs/plan.md`, `docs/research/map-provider-feasibility.md`의 결정을 유지한다.

- 1차 출시: TMAP API 호출·키·내부 경로 폴리라인 없음
- 재도입 1단계: 실제 동작과 일치하는 외부 TMAP 앱·웹 열기 검토
- 내부 재도입 게이트: 사용 상품·요금제, 앱 키, 무료/유료 한도, 24시간 이내 임시 데이터 처리, 출처·브랜드 표시, Kakao Map 교차 표시 허용 여부를 양사에 서면 확인
- 대중교통 재도입 게이트: 일반 TMAP API와 별도인 대중교통 상품 구매·앱 키·요금·약관을 확인

## 5. 장소 정보·사진 사용권 전수 점검

### 5.1 적용 결과

- `WEST_PLACES` 3개 + `CENTRAL_PLACES` 3개 + `EAST_PLACES` 3개 = 실재 장소 **9개/9개**.
- 각 장소는 `docs/research/verified-place-catalog.md`의 공식·시설 원출처, 확인일 `2026-09-20`과 사실 메타데이터 이용 기준을 사용한다.
- `makeVerifiedPlace`는 `photos: []`를 사용하며 외부 사진 URL·placeholder 사진을 생성하지 않는다.
- `supabase/seed.sql`은 동일한 실재 장소 9개와 큐레이션 3개·stop 12개를 seed한다.
- Cloud REST에서 `places=9`, `curations=3`, `curation_stops=12`, `place_media=0`, `example.com source=0`을 확인했다.

### 5.2 장소별 9개 전수 판정

| # | 장소 ID | 공식 명칭 | 외부 사진 | 근거 | 판정 |
| ---: | --- | --- | --- | --- | --- |
| 1 | `gyeonggi-ceramic-museum-icheon` | 경기도자미술관 | 없음 | 공식 시설 FAQ | **통과** |
| 2 | `icheon-city-museum` | 이천시립박물관 | 없음 | 이천문화재단 공식 관람안내 | **통과** |
| 3 | `seolbong-lake` | 설봉호(설봉공원) | 없음 | 이천시 문화관광 | **통과** |
| 4 | `gwango-traditional-market` | 관고전통시장 | 없음 | 이천시 문화관광 | **통과** |
| 5 | `icheon-woljeon-museum` | 이천시립월전미술관 | 없음 | 시설 공식 관람안내 | **통과** |
| 6 | `seolbong-seowon` | 설봉서원(雪峯書院) | 없음 | 이천시 문화관광 | **통과** |
| 7 | `icheon-agricultural-theme-park` | 이천농업테마공원 | 없음 | 이천시 문화관광 | **통과** |
| 8 | `icheon-sansuyu-village` | 산수유마을(체험) | 없음 | 이천시 문화관광 | **통과** |
| 9 | `seohui-history-hall` | 서희역사관 | 없음 | 이천문화재단 공식 공간소개 | **통과** |

### 5.3 사진 상태와 출시 허용 경계

- **현재 상태:** 외부 사진은 사용하지 않는다. 로컬 장소 객체는 `photos=[]`, Cloud `place_media`는 0개다.
- **사진 없이 출시하는 경우:** 현재 CSS 자체 제작 시각물·사진 없음 정책을 유지하고 외부 사진 URL을 추가하지 않는다.
- **자체 제작 사진을 쓰는 경우:** 촬영자 또는 제작자, 제작일, 권리 보유자, 인물·상표·사유지 초상/재산권 동의, 허용 범위와 파일 식별자를 남겨야 한다.
- **공식 기관 사진을 쓰는 경우:** 페이지에 표시된 공공누리 유형을 사진별로 확인하고 출처·연도·기관·작성자를 표시한다. 공공누리 표시가 없는 자료는 이천시 정책에 따라 사전 협의한다. 부록 A12 참고.
- **업소·제3자 사진을 쓰는 경우:** 원 저작권자의 상업적 웹 사용·편집·재배포 허락과 필수 표기를 사진별로 확보한다. 단순 페이지 접근 가능성이나 지도/검색 노출은 사용 허락이 아니다.

### 5.4 판정

장소 원출처·확인일·가짜 fixture·사진 권리 blocker는 **현재 photo-free 범위에서 해제**됐다. 새 외부 사진을 추가하면 사진별 권리 검증을 다시 열어야 한다.

## 6. 출시 전 계정·콘텐츠 검증 체크리스트

### Vercel

- [x] Team `Drone`의 현재 플랜이 Hobby임을 확인했다.
- [x] Vercel Project `ic-project`가 `aiwhyclub/ic-project`와 연결됐음을 확인했다.
- [x] production branch가 `main`임을 확인했다.
- [x] 최신 대상 commit Production이 `READY`임을 확인했다.
- [x] 안정 URL `https://ictour.vercel.app`에서 제목과 큐레이션 3개를 확인했다.
- [x] Production 환경변수 8개를 Config/Secret으로 분리 등록하고 값은 문서에 남기지 않았다.
- [x] 현재 배포 범위는 계획 문서의 개인·비상업 학습 MVP로 두며, 상업 운영으로 전환하면 Pro 조건을 다시 연다.

### Supabase

- [x] `Vibe Coding Project`가 FREE·Healthy임을 확인했다.
- [x] Database > Backups에 backup이 없음을 확인했다.
- [x] Free 대응으로 schema·data `db dump`, 크기·SHA-256·COPY 구문을 확인하고 저장소 밖 암호화 보관 절차를 기록했다.
- [x] Production `Site URL`을 실제 공개 URL로 설정했다.
- [x] Production `/auth/callback`을 allow list에 등록했고 총 3개 URL임을 확인했다.
- [x] migration 5개 적용과 Cloud DB lint clean을 확인했다.
- [x] 익명 공개 조회 수량과 익명 `places` insert HTTP 401을 확인했다.
- [x] 별도 Google Cloud project·External testing 앱·Web OAuth client를 구성하고 Supabase Google provider를 Enabled로 저장했다.
- [x] Google 실제 Production 로그인·callback·세션 복귀·일정 저장을 검증했다.
- [x] Kakao 실제 로그인·callback·세션 복귀·일정 저장을 검증했다.
- [x] Google·Kakao 사용자가 각자 소유 일정 1개만 조회함을 UI와 Auth Admin/REST 집계로 검증했다.
- [x] Google 계정삭제 RPC가 auth user와 소유 가족 일정·stop을 삭제하고 Kakao 소유 일정은 유지하는지 검증했다. 삭제 후 집계는 사용자 1명·일정 1개·stop 4개·draft 0개였다.
- [x] `service_role`이 코드·Vercel 공개 변수·브라우저 번들에 없고 관리 검증에만 일시 사용됐음을 확인했다.

### Kakao Maps

- [x] 실제 Production 도메인을 JavaScript 키의 `JavaScript SDK 도메인`에 등록·저장했다.
- [x] Kakao Login redirect URI를 Production `/auth/callback`과 정확히 일치하게 등록·저장했다.
- [x] Supabase Kakao provider가 Enabled임을 확인했다.
- [x] Production에서 Kakao 지도 축척과 Kakao 저작권 링크가 실제 렌더링됨을 확인했다.
- [x] Production Kakao OAuth 로그인·앱 callback·사용자별 일정 저장을 확인했다.
- [x] 유일한 Drone 앱의 `Kakao Map 무료 쿼터` 배지를 확인했다.
- [x] 월간·오늘 상세 사용량과 이용 중 Biz Wallet 없음 상태를 확인했다.
- [x] Biz Wallet 미연결 상태에서 현재 유료 API 비용 상한을 0원으로 정했다. Biz Wallet 연결 시 재검토한다.
- [x] Kakao 축척·저작권 링크와 서비스의 Kakao Map 출처 표시를 Production 화면에서 확인했다.
- [x] DB 제약과 저장 row 점검에서 공급자 원문·지도 타일·이미지·폴리라인·길안내 단계가 일정 데이터에 없음을 확인했다.

### TMAP

- [x] 현재 출시 범위에서 TMAP API 연동과 Kakao Map 내부 교차 표시를 제외한다.
- [ ] 외부 앱·웹 열기를 다시 추가할 경우 실제 모바일·데스크톱 실패 동작과 표시 문구를 확인한다.
- [ ] 내부 API 재도입 전에 TMAP/Kakao에 교차 표시·출처·브랜드·보관 조건을 서면 문의한다.
- [ ] 승인 뒤에도 API 데이터를 24시간 이상 사용하지 않는 임시 처리와 삭제 증거를 설계한다.
- [ ] 대중교통은 별도 상품 구매·앱 키·요금제를 확인한다.

### 장소 정보·사진

- [x] 실재 fixture 9개가 `VERIFIED_PLACES`에 모두 포함된다. (9/9)
- [x] 장소별 공식·운영자 원출처와 확인일 `2026-09-20`을 기록했다.
- [x] 로컬 fixture와 Cloud seed를 동일한 실재 장소 9개로 교체했다.
- [x] Cloud REST에서 `example.com` source가 0개임을 확인했다.
- [x] 사진 미사용 정책을 선택했고 로컬 `photos=[]`, Cloud `place_media=0`을 확인했다.
- [ ] 새 외부 사진을 추가할 경우 자산별 권리자·허용 범위·출처·표시 문구·파일 식별자를 새로 확인한다.

## 7. 프로젝트 로컬 근거와 공식 사실의 경계

| 구분 | 로컬 근거 | 의미 | 의미하지 않는 것 |
| --- | --- | --- | --- |
| 배포 | 현재 HEAD와 READY Production commit이 일치하고 Production 변수 8개 반영 재배포도 READY다. | 요청된 코드와 Cloud runtime 설정이 공개 URL에 배포됐음을 증명한다. | 상업 운영 시 Hobby 조건 충족 여부를 대신하지 않는다. |
| Supabase Auth | Cloud Site URL·redirect allow list, provider Enabled, 두 OAuth 로그인·세션 복귀·provider별 일정 저장을 확인했다. | Production callback과 실제 인증·저장 성공을 증명한다. | provider 자체 장애 시 가용성을 보장하지는 않는다. |
| Supabase RLS | migration 5개·lint clean·익명 REST 조회·익명 insert 401·Google/Kakao 일정 소유권 격리·Google 계정삭제 연쇄를 확인했다. | schema 적용, 공개 읽기, 익명 쓰기 차단, 두 인증 사용자의 소유 데이터 격리와 삭제 대상 소유 데이터만 제거됨을 증명한다. | 삭제 검증 뒤 Kakao 사용자·일정은 유지됐다. |
| Kakao | provider Enabled, Production domain·redirect, 무료 쿼터·Biz Wallet 없음·비용 상한 0원, 지도 렌더링과 OAuth 저장을 확인했다. | Production 계정 설정과 현재 무료 운영 경계 및 실동작을 증명한다. | 유료 API를 활성화하면 비용 상한은 재검토해야 한다. |
| TMAP | `docs/prd.md`, `docs/frd.md`, `docs/plan.md`, `docs/research/map-provider-feasibility.md`는 현재 제외와 재도입 게이트를 일관되게 기록한다. | 프로젝트 출시 범위 결정이다. | TMAP 또는 Kakao가 교차 표시를 법적·계약적으로 승인했다는 뜻이 아니다. |
| 장소 데이터 | `verified-place-catalog.md`, 실재 fixture 9개, Cloud seed·REST 9개가 일치한다. | 가짜 장소·`example.com` 출처가 제거됐음을 증명한다. | 운영정보가 영구 불변이거나 코스 이동시간이 항상 유효함을 뜻하지 않는다. |
| 사진 | 로컬 `photos=[]`, Cloud `place_media=0`이다. | 현재 출시 범위에서 외부 사진 권리 문제가 없음을 증명한다. | 나중에 추가되는 사진까지 자동 허용한다는 뜻은 아니다. |

## 부록 A. 추가 공식 근거 레코드

본문에는 5개 공식 URL만 직접 인용했다. 아래는 설정·보존·약관의 세부 검증에 사용한 추가 공식 링크다.

### A1. Vercel Hobby 상업 이용 경계

- 사실: Hobby는 무료이며 비상업 개인 용도로 제한된다.
- `source_url`: https://vercel.com/docs/plans/hobby
- `captured_at`: 2026-09-20
- `provenance_note`: Vercel 공식 Hobby 문서의 무료 플랜 설명과 fair use의 non-commercial 제한을 확인했다.

### A2. Supabase 백업·보존

- 사실: Pro/Team/Enterprise는 일일 자동 백업 대상이며 Pro는 최근 7일에 접근할 수 있다. Free에는 정기 `db dump`와 외부 보관이 안내된다. DB 백업은 Storage API 객체 자체를 포함하지 않는다. 프로젝트 삭제 시 관련 백업도 영구 삭제된다.
- `source_url`: https://supabase.com/docs/guides/platform/backups
- `captured_at`: 2026-09-20
- `provenance_note`: Supabase 공식 백업 문서에서 플랜별 보존, Free 대응, Storage 객체 제외, 프로젝트 삭제 효과를 확인했다.

### A3. Supabase Auth redirect URL

- 사실: `redirectTo`는 Redirect URLs allow list와 일치해야 하며 Site URL은 기본 redirect다. Vercel 배포는 공식 Site URL과 Preview URL 패턴을 별도로 둘 수 있고, Production에는 정확한 redirect URL 사용이 권고된다.
- `source_url`: https://supabase.com/docs/guides/auth/redirect-urls
- `captured_at`: 2026-09-20
- `provenance_note`: Supabase 공식 redirect 문서의 Site URL, allow list, Vercel preview 패턴과 Production 정확 URL 권고를 확인했다.

### A4. Supabase RLS

- 사실: 노출 schema의 테이블에는 RLS를 활성화해야 하며 정책은 `auth.uid()`로 사용자 소유 행을 제한할 수 있다. `service_role`은 RLS를 우회하므로 서버에만 둬야 한다. 공식 문서는 grant와 policy를 함께 구성하고 `supabase test db`로 검증하도록 안내한다.
- `source_url`: https://supabase.com/docs/guides/database/postgres/row-level-security
- `captured_at`: 2026-09-20
- `provenance_note`: Supabase 공식 RLS 문서의 exposed schema 보호, auth.uid(), grant/policy, service_role, 테스트 지침을 확인했다.

### A5. Kakao JavaScript SDK 허용 도메인과 Login redirect URI

- 사실: JavaScript 키는 등록된 JavaScript SDK 도메인에서만 사용할 수 있다. 최대 10개 도메인을 등록할 수 있고 wildcard를 지원한다. Kakao Login redirect URI는 등록값과 프로토콜·도메인·경로·끝 슬래시가 모두 일치해야 한다.
- `source_url`: https://developers.kakao.com/docs/ko/app-setting/app
- `captured_at`: 2026-09-20
- `provenance_note`: Kakao Developers 공식 앱 설정 문서의 JavaScript SDK 도메인과 redirect URI 등록 규칙을 확인했다.

### A6. Kakao 데이터·서비스 이용 경계

- 사실: Kakao Developers 서비스 약관은 서비스·개발자센터를 통해 얻은 데이터 등을 사전 승낙 없이 복사·복제·변경하거나 타인에게 제공하는 행위를 제한하고, 제공 한도 초과와 오인 표시를 제한한다.
- `source_url`: https://developers.kakao.com/terms/ko/site-terms
- `captured_at`: 2026-09-20
- `provenance_note`: Kakao Developers 공식 서비스 약관의 데이터 사용 제한, 제공 한도, 오인 표시 관련 조항을 확인했다.

### A7. Kakao 운영정책의 제휴 오인·상표 경계

- 사실: 앱이 Kakao 직접 제공 또는 계약·제휴 서비스인 것처럼 오인시키는 문구를 금지하고, Kakao 상표를 다른 상표와 결합·변형하지 않도록 한다.
- `source_url`: https://developers.kakao.com/terms/ko/site-policies
- `captured_at`: 2026-09-20
- `provenance_note`: Kakao Developers 공식 운영정책의 상표 사용과 제휴 오인 금지 조항을 확인했다.

### A8. Kakao Maps 쿼터와 추가 사용 비용

- 사실: 일간 무료 쿼터는 지도 Web SDK 300,000건, 키워드·카테고리 장소 검색 각 100,000건, 대중교통·도보·자전거 경로 각 1,000건이다. 추가 쿼터 공개 단가는 Web SDK 0.1원/건, 장소 검색 2원/건, 대중교통·도보·자전거 경로 10원/건이다. 무료 쿼터는 개발자 계정에서 Kakao Map API를 처음 활성화한 앱에만 적용되며 쿼터와 요금은 변경될 수 있다.
- `source_url`: https://developers.kakao.com/docs/ko/getting-started/quota
- `captured_at`: 2026-09-20
- `provenance_note`: Kakao Developers 공식 쿼터 문서의 일간 무료 제공량, 첫 활성화 앱 제한, 추가 쿼터 단가를 확인했다.

### A9. TMAP 제공 기능

- 사실: TMAP API는 자동차·보행자 경로, 다중 경유지, TMAP 앱 목적지 연동을 제공한다. 내비게이션·유가정보 API 그룹은 별도 계약 대상이라고 안내한다.
- `source_url`: https://tmap-skopenapi.readme.io/reference/t-map-%EC%86%8C%EA%B0%9C
- `captured_at`: 2026-09-20
- `provenance_note`: TMAP Mobility 공식 API 소개의 기능 목록과 별도 계약 안내를 확인했다.

### A10. TMAP 대중교통 상품

- 사실: 대중교통 API는 SK Open API에서 상품을 구매해 앱 키를 발급받고 별도 endpoint를 호출하는 절차다.
- `source_url`: https://transit.tmapmobility.com/guide/procedure
- `captured_at`: 2026-09-20
- `provenance_note`: TMAP Mobility 공식 대중교통 API 이용절차에서 회원가입, 상품 구매, 앱 키, 호출 절차를 확인했다.

### A11. TMAP API 약관 경계

- 사실: 공개 약관은 자동차·보행자 경로안내와 TMAP 앱 연동을 제공 기능으로 열거한다. 무료 제공량을 초과하면 종량제 또는 정액제 가입이 필요하며, TMAP Open API 데이터는 저장 후 24시간 이상 사용할 수 없다. 동일 서비스를 위해 다수 프로젝트를 만드는 행위도 제한한다.
- `source_url`: https://tmapapi.tmapmobility.com/terms.html
- `captured_at`: 2026-09-20
- `provenance_note`: TMAP Mobility 공식 API 약관의 제공 기능, 무료 한도, 초과 사용 조건, 24시간 데이터 사용 제한과 동일 서비스 다중 프로젝트 제한을 확인했다.

### A12. 이천시 공공저작물·사진 이용 경계

- 사실: 이천시는 공공누리 표시가 있는 저작물만 해당 유형의 조건에 따라 이용할 수 있고, 유형별로 출처표시·상업 이용·변경 허용 범위가 다르다고 안내한다. 공공누리 표시가 없는 자료는 사전 협의가 필요하다.
- `source_url`: https://www.icheon.go.kr/portal/contents.do?mid=0705000000
- `captured_at`: 2026-09-20
- `provenance_note`: 이천시청 공식 저작권보호정책의 공공누리 유형별 조건, 출처 표시와 미표시 자료의 사전 협의 요건을 확인했다.

### A13. 설봉호·설봉공원 공식 장소 페이지

- 사실: 이천시 문화관광은 설봉호(설봉공원)를 `경기도 이천시 경충대로2709번길 128`의 관광명소로 안내하고, 페이지에서 장소 설명과 이미지를 제공한다. 페이지 접근 가능성만으로 이미지별 이용조건이 자동 확정되는 것은 아니다.
- `source_url`: https://www.icheon.go.kr/tour/contents.do?mid=0101010000
- `captured_at`: 2026-09-20
- `provenance_note`: 이천시 문화관광 공식 페이지에서 설봉호·설봉공원의 명칭, 주소와 현재 페이지 접근을 확인했다.

### A14. 관고전통시장 공식 장소 페이지

- 사실: 이천시 문화관광은 관고전통시장의 주소를 `경기도 이천시 중리천로31번길 22`, 연락처를 `031-633-4243`, 이용시간을 `08:00~21:00`으로 표시한다. 현재 fixture와 Cloud seed는 이 값을 사용한다.
- `source_url`: https://www.icheon.go.kr/tour/cultureTour/manage/view.do?idx=76&mid=0402030000
- `captured_at`: 2026-09-20
- `provenance_note`: 이천시 문화관광 공식 관고전통시장 페이지의 현재 주소·연락처·이용시간을 fixture·seed 값과 대조했다.

## 부록 B. 계정·콘텐츠 검증 시 남길 증거

비밀값을 복사하지 않고 아래 메타데이터만 남긴다.

- Vercel: team name, plan name, project name, connected repository, production branch, deployment URL, commit SHA, deployment status, checked_at
- Supabase: organization/project display name, plan name, backup retention, oldest/latest restore point, Site URL, redirect URL 목록의 도메인·경로, RLS test result, checked_at
- Google OAuth: app display name, audience, authorized origin·redirect, Supabase provider 상태, checked_at. 개인 이메일·Google project ID·Client ID/Secret은 기록하지 않는다.
- Kakao: app display name, 무료 쿼터 배지 여부, JavaScript SDK domain 목록, Login redirect URI 목록, 유료 API·Biz Wallet 상태, 일간 사용량, checked_at. 앱 ID와 키 값은 기록하지 않는다.
- TMAP 재도입 시: 상품명, 계약/요금제명, 교차 표시 서면 답변 식별자, 보관 제한, 출처·브랜드 조건, checked_at
- 장소 정보: place ID, 공식·운영자 URL, 확인한 필드, 확인일, 확인자, 상충값과 처리 결과
- 사진 사용 시: asset ID·파일 해시, 원본 URL, 저작권자, 라이선스·허락 범위, 필수 표시, 촬영·제작일, 초상·상표·사유지 동의 여부
- 사진 미사용 시: 외부 이미지 요청이 없다는 네트워크·화면 증거, CSS 자체 제작 시각물임을 알리는 화면 문구, 제거된 placeholder 레코드
