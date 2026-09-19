# 개발 계획 — 이천 세이브포인트

상태: 완료

진행 방법: $vibe:build 를 입력하면 첫 미완료 STORY부터 하나씩 개발합니다.

🎯 1차 목표: EPIC 8까지 (STORY 61개) — 여기까지 하면 큐레이션 후보 3개 중 1~3개 선택부터 선택 일정별 지도 편집, OAuth 로그인, 선택 개수만큼 별도 저장과 재열기까지 핵심 흐름이 끝까지 동작합니다.

개발 순서 결정: A. 현재 순서 유지 `(확정)`

저장 범위 결정: 후보 3개 중 사용자가 1~3개를 복수 선택하고, 1개 선택 시 1개·2개 선택 시 2개·3개 선택 시 3개의 별도 일정으로 저장함. 지도 타일·이미지·경로 원문은 저장하지 않고 각 일정을 다시 열 때 최신 지도를 재계산함 `(확정)`

최종 승인: A. 개발 계획 승인 `(확정)`

## 개발 준비도 점검

- 문서 연결과 커버리지: FRD 필수 기능 ID 84개가 모두 STORY에 1회씩 연결됨
- 문서 충돌: 개발을 막는 PRD·FRD·TRD 충돌 없음
- 미확정 항목: 세 문서에 `(추정)` 표기 없음
- 범위 조정: TMAP 앱 내부 교차 표시는 공개 근거만으로 허용이 확인되지 않아 2026-09-20 현재 계획에서 제외. 기존 외부 Kakao Map 전환을 유지하고, TMAP을 다시 도입하면 외부 전환으로만 별도 검토
- 주의 STORY: STORY 5.7 경로 재계산, STORY 6.5 OAuth 원래 작업 복귀, STORY 7.9 계정·저장정보 영구 삭제
- 준비도 판정: 개발 시작 준비 완료

## 문서 연결표

| PRD 핵심 기능 | FRD 기능 ID | TRD 구현 근거 | STORY |
|---|---|---|---|
| 공통 데이터·보안·복구 | F10.1~F10.6 | Supabase 공개/사용자 데이터 분리, RLS 기본 거부, 지도 원문 미저장, 서버 전용 비밀키 | STORY 2.1~2.6 |
| AI 큐레이션 3개와 새 동선 생성 | F1.1~F1.9 | `places`·`curations`·`curation_stops`, 후보 1~3개 복수 선택, Gemini 공급자 경계, 검수된 기본 3개 대체 | STORY 3.1~3.9 |
| 장소 빠른 정보와 상세 화면 | F5.1~F5.5 | `places`·`place_media`, 출처·확인일·사진 사용권, 코스 복귀 상태 | STORY 4.1~4.5 |
| Kakao Map 동선 편집·경로 재계산·저장 | F4.1~F4.14 | Kakao 우선 경로, 구간별 계산, 브라우저 편집 상태, 확정 일정/JSON 초안 분리 | STORY 5.1~5.14 |
| Google·Kakao OAuth와 세션 | F6.1~F6.8 | Supabase Auth, PKCE·상태값, 원래 작업 복귀, 공급자 토큰 미저장 | STORY 6.1~6.8 |
| 마이페이지 일정 관리 | F7.1~F7.9 | `itineraries`·`itinerary_stops`, 본인 데이터 RLS, 연쇄 삭제 | STORY 7.1~7.9 |
| 저장 동선 재열기와 여행 시작 | F8.1~F8.8 | 장소 순서 우선 복원, 최신 좌표와 승인 공급자로 경로 재계산 | STORY 8.1~8.8 |
| 여행 코스 찾기 | F2.1~F2.7 | 공개 큐레이션 읽기, 조건 적합도/소요시간/최근 확인일 기준 조회 | STORY 9.1~9.7 |
| 지도 보기와 검증 장소 탐색 | F3.1~F3.7 | Kakao Map 단일 화면, WGS84 장소 좌표, 지도/목록 동등 정보 | STORY 10.1~10.7 |
| 현장 플랜B 교체 | F9.1~F9.11 | `plan_b_rules`, 동의 중 위치 일시 사용, 작업 ID, 이후 구간 재계산 | STORY 11.1~11.11 |
| 선택 기능 | F5.6, F8.9, F10.7~F10.8 | 실시간 상태, 여행 강조·다음 방문·공유 | STORY 12.2~12.5 |

## EPIC 1: 프로젝트 세팅과 첫 화면

- [x] STORY 1.1: Next.js·TypeScript·Tailwind 프로젝트와 기능별 폴더를 구성한다 (완료 확인: `localhost` 주소를 열면 오류 없이 서비스 첫 화면이 보입니다.)
  - 기록: Next.js 16·TypeScript·Tailwind 기반과 기능별 폴더, 디자인 토큰 기반 첫 화면을 구성함 / 변경 파일: package.json, src/app/page.tsx, src/app/globals.css, src/features/ / Turbopack 빌드의 로컬 포트 제한을 피해 Webpack 빌드로 검증함 / 실행 주소: http://localhost:3000
- [x] STORY 1.2: 모바일 우선 공통 틀과 홈·코스·지도·계획·장소·마이페이지 이동 경로를 만든다 (완료 확인: 휴대폰과 PC 화면에서 각 메뉴를 눌러 빈 화면이라도 해당 주소로 이동할 수 있습니다.)
  - 기록: 모바일·태블릿·PC 공통 셸과 홈·코스·지도·계획·장소·마이페이지 이동 경로를 구성함 / 변경 파일: src/app/layout.tsx, src/app/globals.css, src/components/primary-navigation.tsx, src/components/route-placeholder.tsx, src/app/*/page.tsx / 모바일은 고정 하단 메뉴, 768px 이상은 상단 메뉴로 분리함 / 실행 주소: http://localhost:3001

## EPIC 2: 공통 데이터·보안·복구 기반

- [x] STORY 2.1 [F10.1]: 공개 장소·사진·큐레이션·큐레이션 장소·플랜B 규칙 데이터 구조와 읽기 권한을 만든다 (완료 확인: 로그인하지 않아도 연습용 장소와 공개 큐레이션을 볼 수 있고 화면에서는 내용을 바꿀 수 없습니다.)
  - 기록: 공개 카탈로그 5개 테이블과 익명 읽기 전용 RLS, 연습 데이터 조회 화면을 구성함 / 변경 파일: supabase/migrations/20260919090000_create_public_catalog.sql, supabase/tests/database/public_catalog_rls.test.sql, supabase/seed.sql, src/features/places/server/get-public-catalog.ts, src/app/places/page.tsx / 로컬 테스트는 Docker Desktop의 Supabase, 실제 운영은 Supabase Cloud를 사용함 / 실행 주소: http://127.0.0.1:3000/places
- [x] STORY 2.2 [F10.2]: 사용자 일정·장소 순서·초안 구조와 본인 전용 RLS를 만든다 (완료 확인: 두 테스트 계정으로 접속했을 때 서로의 일정이 보이거나 수정되지 않습니다.)
  - 기록: 사용자 일정·정류장·초안 테이블과 auth.uid() 기반 CRUD RLS를 구현하고 공개·사용자 RLS pgTAP 44개를 통과함 / 변경 파일: supabase/migrations/20260919100000_create_user_itineraries.sql, supabase/tests/database/user_itineraries_rls.test.sql, src/features/app/app-storage.ts, src/features/app/app-provider.tsx / 사용자 데이터는 계정별로 분리함
- [x] STORY 2.3 [F10.3]: 지도 원문을 제외한 계획정보만 저장하도록 데이터 제약을 적용한다 (완료 확인: 저장된 일정에는 내부 장소 ID·순서·이동수단·체류시간만 있고 지도 이미지나 경로 원문은 없습니다.)
  - 기록: provider-neutral payload 제약으로 장소 ID·순서·이동수단·체류시간만 허용하고 지도·폴리라인·공급자 원문을 거부함 / 변경 파일: supabase/migrations/20260919100000_create_user_itineraries.sql, supabase/tests/database/user_itineraries_rls.test.sql, src/features/app/app-persistence.ts, src/features/app/app-persistence-load.ts / 경로 원문은 저장하지 않고 재계산함
- [x] STORY 2.4 [F10.4]: 외부 API가 실패해도 편집 장소·순서·이동수단을 유지하는 공통 상태를 만든다 (완료 확인: 실패 상태를 켜도 편집하던 장소와 순서가 화면에 그대로 남습니다.)
  - 기록: 편집 스냅샷과 경로 구간별 상태를 분리해 외부 계산 실패에도 장소·순서·이동수단을 유지함 / 변경 파일: src/features/app/app-persistence.ts, src/features/app/app-persistence-load.ts, src/features/plan/plan-route-status.tsx, src/features/plan/plan-workspace.tsx / 실패 구간만 재시도 가능함
- [x] STORY 2.5 [F10.5]: 출처·확인일·사진 사용권이 있는 연습용 장소와 기본 큐레이션 3개를 시드 데이터로 넣는다 (완료 확인: 장소마다 출처와 확인일이 있고 기본 큐레이션 카드가 정확히 3개 보입니다.)
  - 기록: 출처·확인일·사진 사용권 메타데이터가 있는 이천 장소 fixture와 기본 큐레이션 3개를 구성함 / 변경 파일: supabase/seed.sql, src/data/place-fixture-base.ts, src/data/places.ts, src/data/courses.ts, src/features/public/public-data.ts / 실행 주소: http://127.0.0.1:3002
- [x] STORY 2.6 [F10.6]: 위치정보 동의·일시 사용·폐기 규칙과 비밀정보 로그 제외를 적용한다 (완료 확인: 위치 동의 전에는 위치를 읽지 않고, 거부해도 진행할 수 있으며 로그에 현재 위치와 비밀키가 남지 않습니다.)
  - 기록: 명시적 동의 뒤에만 위치를 읽고 지역 선택 후 좌표를 폐기하며 거부 시 수동 선택으로 전환함 / 변경 파일: src/features/plan-b/plan-b-location-actions.ts, src/features/plan-b/plan-b-location-step.tsx, src/features/plan-b/plan-b-types.ts, src/features/plan-b/use-plan-b-flow.ts / 위치와 비밀키를 로그·저장 payload에 넣지 않음 / 실행 주소: http://127.0.0.1:3002

## EPIC 3: AI 큐레이션 홈

- [x] STORY 3.1 [F1.1]: 홈에서 공개 큐레이션 3개를 보여준다 (완료 확인: 로그인하지 않은 첫 화면에 서로 다른 카드 3개가 보입니다.)
  - 기록: 공개 큐레이션을 읽어 홈에 서로 다른 추천 카드 3개를 렌더링함 / 변경 파일: src/app/page.tsx, src/features/public/public-data.ts, src/features/public/curated-route-card.tsx / 실행 주소: http://127.0.0.1:3002
- [x] STORY 3.2 [F1.2]: 카드에 대상·이동수단·소요시간·주요 장소·추천 이유를 표시한다 (완료 확인: 각 카드만 보고 누구에게 맞고 어떻게 이동하는 코스인지 비교할 수 있습니다.)
  - 기록: 큐레이션 카드에 대상·이동수단·시간·주요 장소·추천 이유를 함께 표시함 / 변경 파일: src/features/public/curated-route-card.tsx, src/features/public/public-labels.ts, src/data/courses.ts / 실행 주소: http://127.0.0.1:3002
- [x] STORY 3.3 [F1.3]: 큐레이션 1~3개를 복수 선택해 선택 일정별 지도 편집을 시작한다 (완료 확인: 1개부터 3개까지 선택할 수 있고 선택한 각 일정의 장소 순서가 별도 지도 계획으로 열립니다.)
  - 기록: 큐레이션 카드를 1~3개까지 선택하고 선택한 각 동선을 계획 workspace로 전달함 / 변경 파일: src/features/public/courses-browser.tsx, src/features/public/curated-route-card.tsx, src/features/plan/plan-workspace.tsx, src/features/app/app-seed.ts / 실행 주소: http://127.0.0.1:3002
- [x] STORY 3.4 [F1.4]: 새 동선 조건 패널을 연다 (완료 확인: 새 동선 만들기를 누르면 조건 입력칸이 펼쳐집니다.)
  - 기록: 새 동선 만들기 버튼으로 조건 입력 패널을 열고 닫는 상태를 연결함 / 변경 파일: src/features/public/courses-browser.tsx, src/features/plan/plan-workspace.tsx, src/app/plan/page.tsx / 실행 주소: http://127.0.0.1:3002
- [x] STORY 3.5 [F1.5]: 출발 위치·여행시간·동행 유형·이동수단·관심사를 입력받는다 (완료 확인: 다섯 조건을 입력하고 잘못된 필수값은 입력칸 가까이에서 확인할 수 있습니다.)
  - 기록: 출발 위치·시간·동행·이동수단·관심사 입력과 필수값별 인라인 오류를 구현함 / 변경 파일: src/features/plan/plan-workspace.tsx, src/features/public/courses-browser.tsx, src/lib/domain/courses.ts / 실행 주소: http://127.0.0.1:3002
- [x] STORY 3.6 [F1.6]: 검증 장소만 사용해 성격이 다른 후보 동선 3개를 생성한다 (완료 확인: 조건을 제출하면 장소 구성이 다른 후보가 정확히 3개 보입니다.)
  - 기록: 검증 fixture에서 조건별로 장소 구성이 다른 후보를 생성하고 항상 3개로 정규화함 / 변경 파일: src/data/courses.ts, src/lib/domain/courses.ts, src/features/public/courses-browser.tsx / 실행 주소: http://127.0.0.1:3002
- [x] STORY 3.7 [F1.7]: 후보 3개의 장소·이동시간·추천 이유를 비교한다 (완료 확인: 한 화면에서 세 후보의 차이를 확인할 수 있습니다.)
  - 기록: 후보 3개를 카드 그리드로 배치하고 장소·이동시간·추천 이유를 비교 표시함 / 변경 파일: src/features/public/courses-browser.tsx, src/features/public/curated-route-card.tsx, src/features/public/public-labels.ts / 실행 주소: http://127.0.0.1:3002
- [x] STORY 3.8 [F1.8]: 후보 1~3개를 복수 선택해 선택 일정별 지도 편집을 시작한다 (완료 확인: 선택 개수가 표시되고 선택한 각 후보의 장소와 순서가 별도 계획 화면에 나타납니다.)
  - 기록: 후보 선택 수를 표시하고 선택한 후보별 장소·순서를 독립 계획 초안으로 전달함 / 변경 파일: src/features/public/courses-browser.tsx, src/features/plan/plan-workspace.tsx, src/features/app/app-plan-actions.ts / 실행 주소: http://127.0.0.1:3002
- [x] STORY 3.9 [F1.9]: AI 지연·오류·검증 실패 때 기본 큐레이션 3개로 전환한다 (완료 확인: AI 실패를 가정해도 빈 화면 대신 검수된 카드 3개와 안내 문구가 보입니다.)
  - 기록: 생성 실패·지연·검증 오류를 안내하고 검수된 기본 큐레이션 3개로 fallback함 / 변경 파일: src/features/public/courses-browser.tsx, src/features/public/public-data.ts, src/data/courses.ts / 실행 주소: http://127.0.0.1:3002

## EPIC 4: 장소 상세정보

- [x] STORY 4.1 [F5.1]: 지도나 목록에서 빠른 장소정보 패널을 연다 (완료 확인: 장소를 누르면 페이지를 떠나지 않고 이름·운영시간·체류시간이 보입니다.)
  - 기록: 지도·목록에서 선택한 장소의 이름·운영시간·체류시간을 인라인 패널로 표시함 / 변경 파일: src/features/public/map-explorer.tsx, src/features/public/place-detail.tsx, src/features/public/public-data.ts / 실행 주소: http://127.0.0.1:3002
- [x] STORY 4.2 [F5.2]: 빠른 정보에서 독립 장소 상세 화면을 연다 (완료 확인: 상세보기를 누르면 해당 장소 전용 주소와 전체 정보 화면이 열립니다.)
  - 기록: 빠른 정보에서 장소 slug 기반 독립 상세 route로 이동하도록 연결함 / 변경 파일: src/features/public/place-detail.tsx, src/app/places/[id]/page.tsx, src/features/public/public-data.ts / 실행 주소: http://127.0.0.1:3002
- [x] STORY 4.3 [F5.3]: 사진·소개·주소·연락처·운영·휴무·장날·예약·주차·체류시간을 보여준다 (완료 확인: 장소를 코스에 넣을지 판단할 정보가 한 화면에 빠짐없이 보입니다.)
  - 기록: 장소 상세에 사진·소개·주소·연락처·운영·휴무·장날·예약·주차·체류시간 필드를 구성함 / 변경 파일: src/features/public/place-detail.tsx, src/features/public/public-data.ts, src/app/places/[id]/page.tsx / 실행 주소: http://127.0.0.1:3002
- [x] STORY 4.4 [F5.4]: 정보 출처와 확인일을 표시한다 (완료 확인: 운영정보 아래에서 출처와 마지막 확인 날짜를 확인할 수 있습니다.)
  - 기록: 운영 정보 하단에 source URL·확인일·사진 사용권 메타데이터를 표시함 / 변경 파일: src/features/public/place-detail.tsx, src/features/public/public-data.ts, src/data/place-fixture-base.ts / 실행 주소: http://127.0.0.1:3002
- [x] STORY 4.5 [F5.5]: 장소를 현재 코스에 추가하고 이전 편집 화면으로 돌아간다 (완료 확인: 상세 화면에서 추가한 장소가 기존 코스의 선택 위치에 들어가고 편집 화면으로 복귀합니다.)
  - 기록: 장소 상세의 코스 추가 action이 선택 위치와 returnTo를 보존해 계획 편집으로 복귀함 / 변경 파일: src/features/public/place-detail.tsx, src/features/plan/plan-workspace.tsx, src/features/app/app-plan-actions.ts / 실행 주소: http://127.0.0.1:3002

## EPIC 5: 지도 동선 계획

- [x] STORY 5.1 [F4.1]: 장소 목록·방문 순서·Kakao 지도 마커를 함께 보여준다 (완료 확인: 같은 장소들이 번호 순서대로 목록과 지도에 함께 보입니다.)
  - 기록: 계획 workspace의 순서 목록과 지도 canvas에 동일한 번호·장소를 함께 표시함 / 변경 파일: src/features/plan/plan-workspace.tsx, src/features/plan/plan-stop-list.tsx, src/features/maps/kakao-map-canvas.tsx / Kakao Web SDK key가 없으면 동일 선택이 가능한 mock map fallback을 사용하며 실제 SDK는 환경변수 설정 경계임 / 실행 주소: http://127.0.0.1:3002
- [x] STORY 5.2 [F4.2]: 장소명·카테고리 검색 결과를 보여준다 (완료 확인: 장소 추가 패널에서 이름이나 카테고리로 검증 장소를 찾을 수 있습니다.)
  - 기록: 장소 추가 패널에서 이름·카테고리 검색과 검증 fixture 필터를 연결함 / 변경 파일: src/features/plan/plan-workspace.tsx, src/features/plan/plan-stop-list.tsx, src/features/app/app-place-ids.ts / 실행 주소: http://127.0.0.1:3002
- [x] STORY 5.3 [F4.3]: 장소를 일정 끝이나 지정 위치에 추가한다 (완료 확인: 추가 위치를 고르면 장소 번호와 목록 순서가 그 위치에 맞게 바뀝니다.)
  - 기록: 끝 또는 지정 삽입 위치로 장소를 추가하고 position을 다시 정렬함 / 변경 파일: src/features/plan/plan-workspace.tsx, src/features/plan/plan-stop-list.tsx, src/features/app/app-plan-actions.ts / 실행 주소: http://127.0.0.1:3002
- [x] STORY 5.4 [F4.4]: 일정에서 장소를 삭제한다 (완료 확인: 삭제한 장소가 목록과 지도에서 함께 사라집니다.)
  - 기록: 장소 삭제 action이 목록·지도 상태와 편집 초안을 함께 갱신함 / 변경 파일: src/features/plan/plan-workspace.tsx, src/features/plan/plan-stop-list.tsx, src/features/app/app-plan-actions.ts / 실행 주소: http://127.0.0.1:3002
- [x] STORY 5.5 [F4.5]: 드래그와 위·아래 버튼으로 방문 순서를 바꾼다 (완료 확인: 마우스와 키보드 어느 쪽으로도 순서를 바꾸면 번호가 즉시 갱신됩니다.)
  - 기록: 키보드 접근 가능한 위·아래 이동과 drag reorder로 방문 순서·번호를 즉시 갱신함 / 변경 파일: src/features/plan/plan-stop-list.tsx, src/features/plan/plan-workspace.tsx, src/features/app/app-plan-actions.ts / 실행 주소: http://127.0.0.1:3002
- [x] STORY 5.6 [F4.6]: 도보·자차·대중교통을 선택한다 (완료 확인: 세 이동수단 중 하나를 선택할 수 있고 현재 선택이 글자로 표시됩니다.)
  - 기록: walk·car·transit 선택과 현재 이동수단 라벨을 계획 toolbar에 연결함 / 변경 파일: src/features/plan/plan-toolbar.tsx, src/features/plan/plan-workspace.tsx, src/features/app/app-types.ts / 실행 주소: http://127.0.0.1:3002
- [x] STORY 5.7 [F4.7]: 변경된 전체 또는 인접 구간의 경로를 다시 계산한다 (완료 확인: 장소나 순서를 바꾸면 영향받은 구간에 계산 중 상태와 새 결과가 나타납니다.)
  - 기록: 장소·순서·이동수단 변경 시 인접 구간을 계산 상태로 전환하고 로컬 route adapter로 결과를 갱신함 / 변경 파일: src/features/plan/plan-workspace.tsx, src/features/plan/plan-route-status.tsx, src/lib/domain/routes.ts, src/features/app/app-plan-actions.ts / 실행 주소: http://127.0.0.1:3002
- [x] STORY 5.8 [F4.8]: 구간별 거리·시간과 전체 요약을 보여준다 (완료 확인: 각 장소 사이 거리·시간과 하루 전체 이동시간을 함께 볼 수 있습니다.)
  - 기록: 각 인접 구간의 거리·시간과 전체 이동시간 요약을 표시함 / 변경 파일: src/features/plan/plan-route-status.tsx, src/features/plan/plan-workspace.tsx, src/lib/domain/routes.ts / 실행 주소: http://127.0.0.1:3002
- [x] STORY 5.9 [F4.9]: 특정 구간 실패를 다른 구간과 분리해 표시한다 (완료 확인: 한 구간을 실패시켜도 성공한 구간과 장소 순서는 그대로 보입니다.)
  - 기록: 구간별 pending·success·error를 분리해 한 구간 실패에도 다른 결과와 장소 순서를 유지함 / 변경 파일: src/features/plan/plan-route-status.tsx, src/features/plan/plan-workspace.tsx, src/lib/domain/routes.ts / 실행 주소: http://127.0.0.1:3002
- [x] STORY 5.10 [F4.10]: 마지막 정상 계산시각·실패 사유·재시도를 보여준다 (완료 확인: 실패 구간에서 언제까지 정상이었고 왜 실패했는지 본 뒤 다시 계산할 수 있습니다.)
  - 기록: 실패 구간에 마지막 정상 시각·실패 사유·재시도 action을 함께 표시함 / 변경 파일: src/features/plan/plan-route-status.tsx, src/features/plan/plan-workspace.tsx, src/features/plan/plan-toolbar.tsx / 실행 주소: http://127.0.0.1:3002
- [x] STORY 5.11 [F4.11]: Kakao 실패 시 외부 Kakao Map 또는 승인된 TMAP 열기를 제공한다 (완료 확인: 경로 실패 안내에서 사용 가능한 외부 지도 버튼이 보이고 새 창으로 열립니다.)
  - 기록: 경로 실패 시 외부 Kakao Map 열기 fallback을 제공하고 TMAP 앱 내부 표시는 약관 승인 전 비활성화함 / 변경 파일: src/features/plan/plan-route-status.tsx, src/features/plan/plan-toolbar.tsx, src/features/plan/plan-workspace.tsx / 실행 주소: http://127.0.0.1:3002
- [x] STORY 5.12 [F4.12]: 선택한 1~3개 일정의 편집 상태를 유지한 채 한 번에 저장을 요청한다 (완료 확인: 저장을 눌러 로그인 화면이 떠도 선택한 각 일정의 장소·순서·이동수단이 사라지지 않습니다.)
  - 기록: 복수 계획을 하나의 저장 요청으로 묶고 인증 화면 전후에 편집 snapshot을 보존함 / 변경 파일: src/features/plan/plan-workspace.tsx, src/features/app/app-plan-actions.ts, src/features/app/app-persistence.ts, src/features/auth/auth-panel.tsx / 실행 주소: http://127.0.0.1:3002
- [x] STORY 5.13 [F4.13]: 선택 개수만큼 계획정보를 각각 별도 확정 일정으로 저장한다 (완료 확인: 1개 선택 시 1개, 2개 선택 시 2개, 3개 선택 시 3개의 일정 카드가 마이페이지에 생기며 지도 원문은 저장되지 않습니다.)
  - 기록: 선택한 각 계획을 별도 confirmed itinerary와 stop 순서로 저장하고 provider-neutral payload만 전달함 / 변경 파일: src/features/app/app-plan-actions.ts, src/features/app/app-persistence.ts, src/features/app/app-storage.ts, supabase/migrations/20260919100000_create_user_itineraries.sql / 실행 주소: http://127.0.0.1:3002
- [x] STORY 5.14 [F4.14]: 로그인 사용자의 일정별 변경을 임시 초안으로 자동 보호하고 저장 버튼으로 함께 확정한다 (완료 확인: 화면을 벗어났다가 돌아오면 선택한 각 일정의 초안이 복구되고 저장 전에는 확정본이 바뀌지 않습니다.)
  - 기록: 일정별 JSON 초안을 자동 저장·복구하고 명시적 저장 전 confirmed 상태를 변경하지 않음 / 변경 파일: src/features/app/app-persistence.ts, src/features/app/app-persistence-load.ts, src/features/app/app-plan-actions.ts, src/features/plan/plan-workspace.tsx / 실행 주소: http://127.0.0.1:3002

## EPIC 6: OAuth 인증과 세션

- [x] STORY 6.1 [F6.1]: 저장 또는 마이페이지 진입 시 로그인 이유를 안내한다 (완료 확인: 비회원에게 필요한 이유와 로그인 후 돌아갈 위치가 보입니다.)
  - 기록: 저장·마이페이지 보호 화면에 로그인 필요 이유와 원래 작업으로 돌아갈 경로를 안내함 / 변경 파일: src/features/auth/auth-panel.tsx, src/features/plan/plan-workspace.tsx, src/app/my/page.tsx / 실행 주소: http://127.0.0.1:3002
- [x] STORY 6.2 [F6.2]: Supabase Google OAuth 로그인을 시작한다 (완료 확인: Google 버튼을 누르면 테스트 로그인 절차가 시작됩니다.)
  - 기록: Supabase Google provider 시작과 returnTo·PKCE 상태 전달을 구현함 / 변경 파일: src/features/auth/oauth-modal.tsx, src/features/auth/auth-panel.tsx, src/features/app/app-auth-actions.ts, src/features/auth/auth-callback.tsx / 실제 provider client ID·redirect 허용 도메인은 Supabase 설정 경계로 남김 / 실행 주소: http://127.0.0.1:3002
- [x] STORY 6.3 [F6.3]: Supabase Kakao OAuth 로그인을 시작한다 (완료 확인: Kakao 버튼을 누르면 테스트 로그인 절차가 시작됩니다.)
  - 기록: 이메일을 요청하지 않는 Kakao OIDC 시작·state 검증·서버 token 교환·Supabase ID Token 세션 생성을 구현하고 실제 Kakao 계정으로 확인함 / 변경 파일: src/app/auth/kakao/start/route.ts, src/app/api/auth/kakao/exchange/route.ts, src/features/app/app-auth-actions.ts, src/features/auth/auth-callback.tsx, supabase/config.toml / 실행 주소: http://localhost:3002
- [x] STORY 6.4 [F6.4]: OAuth 콜백 처리 중 상태를 표시한다 (완료 확인: 인증에서 돌아온 뒤 완료 전까지 처리 중이라는 문구를 볼 수 있습니다.)
  - 기록: callback route에서 code 교환·세션 복구·오류 상태를 처리하고 진행 문구를 표시함 / 변경 파일: src/app/auth/callback/page.tsx, src/features/auth/auth-callback.tsx, src/features/auth/oauth-modal.tsx / 실제 OAuth 자격증명 교환은 외부 provider 설정 후 검증함 / 실행 주소: http://127.0.0.1:3002
- [x] STORY 6.5 [F6.5]: 로그인 성공 뒤 복수 일정 저장 또는 마이페이지 작업을 이어간다 (완료 확인: 로그인 후 홈으로 튕기지 않고 선택한 일정들과 편집 상태가 복원되어 요청했던 작업이 계속됩니다.)
  - 기록: callback의 returnTo와 저장 snapshot을 복원하고 `/auth?returnTo=/plan`의 Kakao 재로그인 후 실제 `/plan` 복귀와 4개 장소 편집 화면 복원을 확인함 / 변경 파일: src/app/auth/page.tsx, src/features/auth/auth-callback.tsx, src/features/app/app-provider.tsx, src/features/app/app-persistence-load.ts, src/features/plan/plan-workspace.tsx / 실행 주소: http://localhost:3002
- [x] STORY 6.6 [F6.6]: 한 제공자 실패 시 다른 제공자를 선택한다 (완료 확인: Google 또는 Kakao 실패 안내에서 다른 로그인 버튼을 바로 누를 수 있습니다.)
  - 기록: Google·Kakao provider별 오류를 공통 모달에 표시하고 다른 provider 버튼을 유지함 / 변경 파일: src/features/auth/oauth-modal.tsx, src/features/auth/auth-panel.tsx, src/features/auth/auth-callback.tsx / 실행 주소: http://127.0.0.1:3002
- [x] STORY 6.7 [F6.7]: 로그인 취소·실패 후 편집 동선을 복원한다 (완료 확인: 인증을 취소해도 원래 계획 화면의 장소와 순서가 남아 있습니다.)
  - 기록: 인증 취소·오류에도 returnTo와 local snapshot을 보존해 원래 장소·순서 화면을 복원함 / 변경 파일: src/features/auth/auth-callback.tsx, src/features/app/app-persistence.ts, src/features/plan/plan-workspace.tsx / 실행 주소: http://127.0.0.1:3002
- [x] STORY 6.8 [F6.8]: 유효 세션을 유지하고 로그아웃한다 (완료 확인: 새로고침 뒤에도 로그인 상태가 유지되고 로그아웃하면 보호 화면에 접근할 수 없습니다.)
  - 기록: 세션 변화 구독·hydration·로그아웃 후 보호 route 재진입 차단을 연결하고 Kakao 로그인 뒤 새로고침에서도 인증 세션과 계획 편집 화면이 유지됨을 확인함 / 변경 파일: src/features/app/app-auth-actions.ts, src/features/app/app-provider.tsx, src/features/app/app-storage.ts, src/features/auth/auth-panel.tsx / 실행 주소: http://localhost:3002

## EPIC 7: 마이페이지 일정 관리

- [x] STORY 7.1 [F7.1]: 본인의 저장 동선 목록을 보여준다 (완료 확인: 로그인 계정으로 선택해 저장한 일정들이 각각 별도 카드로 보이고 다른 계정의 일정은 보이지 않습니다.)
  - 기록: 현재 세션의 저장 일정만 조회해 카드 목록으로 표시하고 비로그인·오류 상태를 분리함 / 변경 파일: src/features/itineraries/mypage-workspace.tsx, src/features/itineraries/saved-itinerary-card.tsx, src/features/app/app-provider.tsx, src/features/app/app-storage.ts / 실행 주소: http://127.0.0.1:3002
- [x] STORY 7.2 [F7.2]: 일정명·여행일·동행 유형·이동수단·수정일을 표시한다 (완료 확인: 각 카드에서 다섯 정보를 비교할 수 있습니다.)
  - 기록: 저장 일정 카드에 일정명·여행일·동행·이동수단·수정일을 표시함 / 변경 파일: src/features/itineraries/saved-itinerary-card.tsx, src/features/itineraries/mypage-workspace.tsx, src/features/app/app-types.ts / 실행 주소: http://127.0.0.1:3002
- [x] STORY 7.3 [F7.3]: 저장 동선을 다시 연다 (완료 확인: 카드를 누르면 저장된 장소 순서가 있는 상세 화면이 열립니다.)
  - 기록: 저장 카드에서 itinerary id 기반 상세 route로 이동하고 장소 순서를 복원함 / 변경 파일: src/features/itineraries/saved-itinerary-card.tsx, src/app/my/[id]/page.tsx, src/features/itineraries/itinerary-detail.tsx / 실행 주소: http://127.0.0.1:3002
- [x] STORY 7.4 [F7.4]: 저장 동선을 편집해 갱신한다 (완료 확인: 장소나 순서를 바꿔 저장한 뒤 다시 열면 변경 내용이 보입니다.)
  - 기록: 저장 상세에서 편집 workspace로 전환하고 장소·순서 변경을 itinerary action으로 갱신함 / 변경 파일: src/features/itineraries/itinerary-detail.tsx, src/features/app/app-itinerary-actions.ts, src/features/app/app-persistence.ts / 실행 주소: http://127.0.0.1:3002
- [x] STORY 7.5 [F7.5]: 일정 삭제 전 영향과 되돌릴 수 없음을 안내한다 (완료 확인: 삭제 버튼을 누르면 삭제 대상과 취소·최종 삭제 선택이 보입니다.)
  - 기록: 삭제 전 대상 일정과 연결된 정류장·초안 영향을 안내하는 확인 modal을 제공함 / 변경 파일: src/features/itineraries/mypage-workspace.tsx, src/features/itineraries/saved-itinerary-card.tsx, src/app/globals.css / 실행 주소: http://127.0.0.1:3002
- [x] STORY 7.6 [F7.6]: 확인한 저장 동선을 삭제하고 목록에서 제거한다 (완료 확인: 삭제 성공 즉시 해당 카드가 마이페이지 목록에서 사라지고 새로고침 뒤에도 다시 나타나지 않으며 연결된 장소 순서·초안도 삭제됩니다.)
  - 기록: 확인된 일정 삭제 action과 optimistic 목록 제거, stops·draft cascade를 연결함 / 변경 파일: src/features/app/app-itinerary-actions.ts, src/features/app/app-storage.ts, src/features/itineraries/mypage-workspace.tsx, supabase/migrations/20260919100000_create_user_itineraries.sql / 실행 주소: http://127.0.0.1:3002
- [x] STORY 7.7 [F7.7]: 빈 목록·조회 실패·세션 만료 상태를 처리한다 (완료 확인: 세 상태마다 원인과 다시 시도하거나 로그인할 방법이 보입니다.)
  - 기록: 빈 목록·조회 오류·세션 만료를 구분해 설명과 retry·login action을 제공함 / 변경 파일: src/features/itineraries/mypage-workspace.tsx, src/features/app/app-provider.tsx, src/features/auth/auth-panel.tsx / 실행 주소: http://127.0.0.1:3002
- [x] STORY 7.8 [F7.8]: 마이페이지에서 새 동선 만들기로 연결한다 (완료 확인: 버튼을 누르면 새 동선 조건 입력 화면으로 이동합니다.)
  - 기록: 마이페이지 empty·list 상태에 새 동선 만들기 link를 배치함 / 변경 파일: src/features/itineraries/mypage-workspace.tsx, src/app/plan/page.tsx, src/components/primary-navigation.tsx / 실행 주소: http://127.0.0.1:3002
- [x] STORY 7.9 [F7.9]: 계정과 모든 저장정보 삭제 전 영향 확인 후 삭제한다 (완료 확인: 최종 확인 뒤 즉시 로그아웃되고 그 계정과 일정으로 다시 접근할 수 없습니다.)
  - 기록: 계정·저장정보 영구 삭제 영향 확인과 delete-account RPC 호출 후 세션 정리를 구현함 / 변경 파일: src/features/app/app-auth-actions.ts, src/features/app/app-storage.ts, supabase/migrations/20260919110000_delete_account_rpc.sql, src/features/auth/auth-panel.tsx / 실제 Cloud RPC·세션 삭제는 Supabase 설정 후 검증함 / 실행 주소: http://127.0.0.1:3002

## EPIC 8: 저장 동선 상세와 여행 진행 ← 1차 목표

- [x] STORY 8.1 [F8.1]: 저장된 장소 순서를 경로보다 먼저 복원한다 (완료 확인: 동선을 열면 외부 경로 계산을 기다리지 않고 장소 순서가 즉시 보입니다.)
  - 기록: itinerary stops를 먼저 hydrate한 뒤 route 계산을 별도 상태로 시작해 장소 순서를 즉시 표시함 / 변경 파일: src/features/itineraries/itinerary-detail.tsx, src/features/app/app-itinerary-actions.ts, src/features/app/app-persistence-load.ts / 실행 주소: http://127.0.0.1:3002
- [x] STORY 8.2 [F8.2]: 최신 장소 좌표와 승인된 공급자로 경로를 다시 계산한다 (완료 확인: 저장 당시 경로 원문 없이도 현재 경로가 새로 나타납니다.)
  - 기록: 저장된 내부 장소 ID를 최신 fixture 좌표로 해석해 provider-neutral route를 다시 계산함 / 변경 파일: src/features/itineraries/itinerary-detail.tsx, src/features/plan/plan-route-status.tsx, src/lib/domain/routes.ts / 실행 주소: http://127.0.0.1:3002
- [x] STORY 8.3 [F8.3]: 구간별 계산 중·완료·실패 상태를 표시한다 (완료 확인: 각 구간이 어떤 상태인지 글자와 아이콘으로 구분됩니다.)
  - 기록: 저장 동선 상세에서 각 구간의 계산 중·완료·실패 상태를 텍스트와 상태 UI로 표시함 / 변경 파일: src/features/itineraries/itinerary-detail.tsx, src/features/plan/plan-route-status.tsx, src/lib/domain/routes.ts / 실행 주소: http://127.0.0.1:3002
- [x] STORY 8.4 [F8.4]: 최신 거리와 이동시간을 보여준다 (완료 확인: 재계산이 끝나면 각 구간과 전체의 최신 수치를 확인할 수 있습니다.)
  - 기록: 재계산 결과의 최신 구간 거리·이동시간과 전체 합계를 표시함 / 변경 파일: src/features/itineraries/itinerary-detail.tsx, src/features/plan/plan-route-status.tsx, src/lib/domain/routes.ts / 실행 주소: http://127.0.0.1:3002
- [x] STORY 8.5 [F8.5]: 실패 구간을 재시도하거나 외부 지도로 연다 (완료 확인: 실패한 구간에서 다른 장소를 잃지 않고 두 복구 방법 중 하나를 선택할 수 있습니다.)
  - 기록: 실패 구간별 재시도와 외부 Kakao Map fallback을 제공하고 나머지 장소 상태를 유지함 / 변경 파일: src/features/itineraries/itinerary-detail.tsx, src/features/plan/plan-route-status.tsx, src/features/plan/plan-workspace.tsx / 실행 주소: http://127.0.0.1:3002
- [x] STORY 8.6 [F8.6]: 저장 동선을 편집 화면으로 전환한다 (완료 확인: 편집 버튼을 누르면 같은 장소 순서가 수정 가능한 계획 화면에 나타납니다.)
  - 기록: 저장 상세의 편집 link가 동일 itinerary snapshot을 계획 workspace로 전달함 / 변경 파일: src/features/itineraries/itinerary-detail.tsx, src/app/plan/page.tsx, src/features/plan/plan-workspace.tsx / 실행 주소: http://127.0.0.1:3002
- [x] STORY 8.7 [F8.7]: 저장 동선으로 여행을 시작한다 (완료 확인: 여행 시작을 누르면 현재 일정의 장소 순서와 구간 정보가 여행 화면에 보입니다.)
  - 기록: 저장 상세에서 여행 route로 이동하고 현재 일정의 장소·구간 정보를 표시함 / 변경 파일: src/features/itineraries/itinerary-detail.tsx, src/features/travel/travel-workspace.tsx, src/app/travel/[id]/page.tsx / 실행 주소: http://127.0.0.1:3002
- [x] STORY 8.8 [F8.8]: 여행 중 플랜B 화면으로 진입한다 (완료 확인: 여행 화면에서 계획이 막혔을 때 플랜B 시작 버튼으로 이동할 수 있습니다.)
  - 기록: 여행 화면의 플랜B 시작 action에 itinerary id와 현재 stop을 전달함 / 변경 파일: src/features/travel/travel-workspace.tsx, src/features/travel/plan-b-workspace.tsx, src/app/travel/plan-b/page.tsx / 실행 주소: http://127.0.0.1:3002

## EPIC 9: 여행 코스 찾기

- [x] STORY 9.1 [F2.1]: 공개 큐레이션 목록을 보여준다 (완료 확인: 로그인하지 않아도 공개 코스 목록을 스크롤해 볼 수 있습니다.)
  - 기록: 공개 코스 목록을 로그인 없이 읽고 카드 목록으로 스크롤할 수 있게 구성함 / 변경 파일: src/app/courses/page.tsx, src/features/public/courses-browser.tsx, src/features/public/public-data.ts / 실행 주소: http://127.0.0.1:3002
- [x] STORY 9.2 [F2.2]: 키워드로 코스를 찾는다 (완료 확인: 제목이나 주요 장소 키워드를 입력하면 맞는 코스만 보입니다.)
  - 기록: 제목·주요 장소를 대상으로 한 keyword 검색을 카드 결과에 적용함 / 변경 파일: src/features/public/courses-browser.tsx, src/features/public/public-data.ts, src/lib/domain/courses.ts / 실행 주소: http://127.0.0.1:3002
- [x] STORY 9.3 [F2.3]: 대상·이동수단·소요시간·관심사 필터를 적용한다 (완료 확인: 여러 조건을 함께 선택하면 모두 맞는 결과로 좁혀집니다.)
  - 기록: 대상·이동수단·시간·관심사 다중 조건을 AND 필터로 적용함 / 변경 파일: src/features/public/courses-browser.tsx, src/features/public/public-data.ts, src/lib/domain/courses.ts / 실행 주소: http://127.0.0.1:3002
- [x] STORY 9.4 [F2.4]: 적용 필터·결과 수를 표시하고 초기화한다 (완료 확인: 현재 조건과 결과 개수가 보이고 한 번에 전체 조건을 지울 수 있습니다.)
  - 기록: 활성 필터 chip·결과 수·전체 초기화 control을 구현함 / 변경 파일: src/features/public/courses-browser.tsx, src/features/public/public-labels.ts, src/app/globals.css / 실행 주소: http://127.0.0.1:3002
- [x] STORY 9.5 [F2.5]: 결과 없음·조회 실패와 재시도를 처리한다 (완료 확인: 빈 결과와 오류가 구분되고 입력 조건을 잃지 않은 채 다시 시도할 수 있습니다.)
  - 기록: 결과 없음과 조회 실패를 별도 상태로 렌더링하고 검색 조건을 유지한 채 재시도함 / 변경 파일: src/features/public/courses-browser.tsx, src/features/public/public-data.ts, src/app/courses/page.tsx / 실행 주소: http://127.0.0.1:3002
- [x] STORY 9.6 [F2.6]: 선택 코스를 지도 편집으로 연다 (완료 확인: 코스 카드에서 편집을 누르면 동일한 장소 순서가 계획 화면에 나타납니다.)
  - 기록: 코스 카드 편집 action이 동일한 stop order를 계획 workspace에 전달함 / 변경 파일: src/features/public/courses-browser.tsx, src/features/public/curated-route-card.tsx, src/app/plan/page.tsx / 실행 주소: http://127.0.0.1:3002
- [x] STORY 9.7 [F2.7]: 조건 적합도·소요시간·최근 정보 확인순으로 정렬한다 (완료 확인: 기본은 조건 적합도순이고 다른 정렬을 고르면 카드 순서가 바뀝니다.)
  - 기록: 적합도·소요시간·최근 확인일 정렬과 기본 적합도순을 구현함 / 변경 파일: src/features/public/courses-browser.tsx, src/features/public/public-data.ts, src/lib/domain/courses.ts / 실행 주소: http://127.0.0.1:3002

## EPIC 10: 지도 보기

- [x] STORY 10.1 [F3.1]: 이천 검증 장소를 Kakao 지도와 목록으로 보여준다 (완료 확인: 지도 마커와 같은 장소 목록이 동시에 보입니다.)
  - 기록: 이천 검증 장소를 지도 marker와 동일 순서의 목록으로 함께 표시하고 실제 Kakao 지도 타일·축척·저작권 링크가 fallback 타이머 이후에도 유지됨을 확인함 / 변경 파일: src/app/map/page.tsx, src/features/public/map-explorer.tsx, src/features/maps/kakao-map-canvas.tsx / key가 없거나 SDK가 실패하면 연습 지도 fallback을 표시함 / 실행 주소: http://localhost:3002
- [x] STORY 10.2 [F3.2]: 장소명·카테고리로 찾는다 (완료 확인: 검색어 또는 카테고리를 고르면 지도와 목록 결과가 함께 좁혀집니다.)
  - 기록: 장소명·카테고리 필터를 지도 marker와 목록 양쪽에 동일하게 적용함 / 변경 파일: src/features/public/map-explorer.tsx, src/features/maps/kakao-map-canvas.tsx, src/features/public/public-data.ts / 실행 주소: http://127.0.0.1:3002
- [x] STORY 10.3 [F3.3]: 현재 지도 영역에서 장소를 다시 찾는다 (완료 확인: 지도를 옮긴 뒤 버튼을 누르면 새 화면 범위의 장소만 갱신됩니다.)
  - 기록: 지도 bounds 이동 상태와 현재 영역에서 다시 찾기 action을 연결함 / 변경 파일: src/features/public/map-explorer.tsx, src/features/maps/kakao-map-canvas.tsx, src/types/kakao-maps.d.ts / 실행 주소: http://127.0.0.1:3002
- [x] STORY 10.4 [F3.4]: 마커와 목록 선택 상태를 동기화한다 (완료 확인: 어느 쪽에서 장소를 골라도 지도와 목록의 같은 장소가 함께 강조됩니다.)
  - 기록: marker click과 목록 click을 동일 selectedPlaceId 상태로 연결함 / 변경 파일: src/features/public/map-explorer.tsx, src/features/maps/kakao-map-canvas.tsx, src/features/public/public-data.ts / 실행 주소: http://127.0.0.1:3002
- [x] STORY 10.5 [F3.5]: 선택한 장소의 빠른 정보를 보여준다 (완료 확인: 마커나 목록을 누르면 운영시간과 확인일이 있는 패널이 열립니다.)
  - 기록: 선택 장소의 운영시간·확인일·체류시간을 지도 옆 quick panel에 표시함 / 변경 파일: src/features/public/map-explorer.tsx, src/features/public/place-detail.tsx, src/features/public/public-data.ts / 실행 주소: http://127.0.0.1:3002
- [x] STORY 10.6 [F3.6]: 장소 상세 또는 새 동선 추가로 연결한다 (완료 확인: 빠른 정보에서 상세보기와 동선 추가 중 하나를 선택할 수 있습니다.)
  - 기록: quick panel에서 장소 상세 route와 새 동선 추가 action을 모두 제공함 / 변경 파일: src/features/public/map-explorer.tsx, src/features/public/place-detail.tsx, src/app/map/page.tsx / 실행 주소: http://127.0.0.1:3002
- [x] STORY 10.7 [F3.7]: 지도·장소 조회 실패 때 기존 결과를 유지하고 재시도한다 (완료 확인: 오류를 발생시켜도 직전 장소가 남고 다시 찾기 버튼이 보입니다.)
  - 기록: 조회·지도 오류를 별도 상태로 표시하면서 직전 결과를 보존하고 재시도 action을 제공함 / 변경 파일: src/features/public/map-explorer.tsx, src/features/maps/kakao-map-canvas.tsx, src/features/public/public-data.ts / 실행 주소: http://127.0.0.1:3002

## EPIC 11: 현장 플랜B

- [x] STORY 11.1 [F9.1]: 위치 사용 목적을 안내하고 권한을 요청한다 (완료 확인: 위치 요청 전에 쓰임과 저장 여부를 읽고 허용·거부할 수 있습니다.)
  - 기록: 위치 사용 목적·저장하지 않음 안내 후 명시적 동의 버튼에서만 브라우저 권한을 요청함 / 변경 파일: src/features/plan-b/plan-b-location-step.tsx, src/features/plan-b/plan-b-location-actions.ts, src/features/plan-b/plan-b-screen.tsx / 실행 주소: http://127.0.0.1:3002
- [x] STORY 11.2 [F9.2]: 위치 거부·실패 시 이천 권역이나 현재 장소를 직접 고른다 (완료 확인: 위치를 거부해도 수동 선택으로 다음 단계에 갈 수 있습니다.)
  - 기록: 위치 거부·실패 상태에서 이천 권역과 현재 일정 장소를 수동 선택하는 fallback을 제공함 / 변경 파일: src/features/plan-b/plan-b-location-step.tsx, src/features/plan-b/plan-b-location-actions.ts, src/features/plan-b/use-plan-b-flow.ts / 실행 주소: http://127.0.0.1:3002
- [x] STORY 11.3 [F9.3]: 휴관·예약 불가·비·시간 부족 등 막힌 이유를 선택한다 (완료 확인: 현재 문제에 맞는 이유를 하나 이상 고를 수 있습니다.)
  - 기록: 휴관·예약 불가·비·장날·시간 부족 사유를 복수 선택하고 다음 단계 validation을 연결함 / 변경 파일: src/features/plan-b/plan-b-reasons-step.tsx, src/features/plan-b/use-plan-b-flow.ts, src/features/plan-b/plan-b-types.ts / 실행 주소: http://127.0.0.1:3002
- [x] STORY 11.4 [F9.4]: 조건에 맞는 대체 장소 3곳을 추천한다 (완료 확인: 기존 장소 대신 갈 수 있는 카드가 정확히 3개 보입니다.)
  - 기록: 위치·사유·이동수단 조건을 사용해 대체 후보를 만들고 항상 정확히 3개로 정규화함 / 변경 파일: src/features/plan-b/plan-b-recommendations-step.tsx, src/features/plan-b/use-plan-b-flow.ts, src/features/plan-b/plan-b-fixtures.ts / 실행 주소: http://127.0.0.1:3002
- [x] STORY 11.5 [F9.5]: 추천 이유·이동시간·이동법·운영 조건을 비교한다 (완료 확인: 세 카드에서 선택에 필요한 차이를 한눈에 볼 수 있습니다.)
  - 기록: 세 후보 카드에 추천 이유·이동시간·이동법·운영시간·주의 조건을 비교 표시함 / 변경 파일: src/features/plan-b/plan-b-recommendations-step.tsx, src/features/plan-b/plan-b-types.ts, src/features/plan-b/plan-b-status.ts / 실행 주소: http://127.0.0.1:3002
- [x] STORY 11.6 [F9.6]: 기본 검증정보와 실시간 정보 상태를 구분한다 (완료 확인: 각 카드가 어떤 정보 기준인지와 확인 또는 갱신 시각이 글자로 보입니다.)
  - 기록: 후보 카드별 verified·realtime 상태 chip과 확인·갱신 날짜를 분리 표시함 / 변경 파일: src/features/plan-b/plan-b-recommendations-step.tsx, src/features/plan-b/plan-b-status.ts, src/features/plan-b/plan-b-types.ts / 실행 주소: http://127.0.0.1:3002
- [x] STORY 11.7 [F9.7]: 대체 장소 하나를 선택한다 (완료 확인: 선택한 카드가 강조되고 교체 전 확인 내용이 보입니다.)
  - 기록: 후보 카드 선택 상태와 교체 전 확인 단계로 이어지는 action을 구현함 / 변경 파일: src/features/plan-b/plan-b-recommendations-step.tsx, src/features/plan-b/use-plan-b-flow.ts, src/features/plan-b/plan-b-replacement-step.tsx / 실행 주소: http://127.0.0.1:3002
- [x] STORY 11.8 [F9.8]: 기존 장소 하나를 선택한 장소로 바꾼다 (완료 확인: 나머지 장소 순서는 유지되고 해당 위치의 장소만 교체됩니다.)
  - 기록: selected stop 하나만 replacement place로 치환하고 나머지 stop 순서를 보존함 / 변경 파일: src/features/plan-b/plan-b-replacement-step.tsx, src/features/plan-b/use-plan-b-flow.ts, src/features/plan-b/plan-b-helpers.ts / 실행 주소: http://127.0.0.1:3002
- [x] STORY 11.9 [F9.9]: 교체 뒤 이후 구간을 다시 계산한다 (완료 확인: 바뀐 장소부터 다음 장소까지 새 거리와 시간이 표시됩니다.)
  - 기록: replacement 위치 이후 route segments를 다시 생성하고 변경된 거리·시간을 표시함 / 변경 파일: src/features/plan-b/plan-b-replacement-step.tsx, src/features/plan-b/use-plan-b-flow.ts, src/features/plan-b/plan-b-helpers.ts / 실행 주소: http://127.0.0.1:3002
- [x] STORY 11.10 [F9.10]: 변경한 계획정보를 저장한다 (완료 확인: 여행 화면을 다시 열어도 교체된 내부 장소 ID와 순서가 유지됩니다.)
  - 기록: 교체 결과를 shared app provider의 itinerary action으로 저장하고 재열기 시 내부 ID·순서를 복원함 / 변경 파일: src/features/plan-b/app-plan-b-screen.tsx, src/features/app/app-provider.tsx, src/features/app/app-itinerary-actions.ts, src/features/app/app-persistence.ts / 실행 주소: http://127.0.0.1:3002
- [x] STORY 11.11 [F9.11]: 추천·경로·실시간·저장 실패를 구분해 복구한다 (완료 확인: 실패 종류에 맞는 재시도 또는 기본정보 전환이 보이고 기존 일정은 남습니다.)
  - 기록: recommendation·route·realtime·save 실패를 별도 failure kind로 표시하고 retry·verified fallback을 제공함 / 변경 파일: src/features/plan-b/use-plan-b-flow.ts, src/features/plan-b/plan-b-status.tsx, src/features/plan-b/app-plan-b-screen.tsx / 실행 주소: http://127.0.0.1:3002
- [x] STORY 11.12: PRD 대조 점검을 수행한다 (완료 확인: PRD의 9개 화면, 핵심 기능, 두 사용자 집단 성공 기준을 체크리스트로 직접 확인할 수 있습니다.)
  - 기록: PRD 9개 화면·플랜B 핵심 동작·사용자 성공 기준을 검토 화면과 체크리스트로 정리함 / 변경 파일: src/app/review/page.tsx, src/app/review/review-checklist.tsx, docs/implementation-checklist.md / 실행 주소: http://127.0.0.1:3002

## EPIC 12: 부가 기능(선택)

- [x] STORY 12.2 [F5.6]: 지원 장소의 실시간 정보 반영 여부와 갱신시각을 보여준다 (완료 확인: 옵션을 켜고 끌 수 있고 실패하면 기본 검증정보로 돌아갑니다.)
  - 기록: 실시간 정보 사용 toggle과 갱신시각·verified fallback 상태를 구현함 / 변경 파일: src/features/plan-b/plan-b-recommendations-step.tsx, src/features/plan-b/plan-b-status.ts, src/features/plan-b/app-plan-b-screen.tsx / 외부 실시간 공급자 자격증명 없이 로컬 fallback으로 동작함 / 실행 주소: http://127.0.0.1:3002
- [x] STORY 12.3 [F8.9]: 여행 중 현재 장소·다음 장소·현재 구간을 강조한다 (완료 확인: 여행 화면에서 지금 위치한 단계와 다음 단계가 구분됩니다.)
  - 기록: 여행 workspace에 현재 stop·다음 stop·현재 route segment 강조 상태를 구성함 / 변경 파일: src/features/travel/travel-workspace.tsx, src/app/travel/[id]/page.tsx, src/lib/domain/routes.ts / 실행 주소: http://127.0.0.1:3002
- [x] STORY 12.4 [F10.7]: 포기한 장소를 다음에 가기로 저장한다 (완료 확인: 제외한 장소를 별도 목록에 넣고 다시 확인할 수 있습니다.)
  - 기록: 교체로 제외한 장소를 다음에 가기 목록에 저장하고 마이페이지에서 다시 확인하게 연결함 / 변경 파일: src/features/itineraries/deferred-places-panel.tsx, src/features/plan-b/use-plan-b-flow.ts, src/features/plan-b/app-plan-b-screen.tsx / 실행 주소: http://127.0.0.1:3002
- [x] STORY 12.5 [F10.8]: 완성한 코스를 링크로 공유한다 (완료 확인: 공유 링크를 복사해 다른 브라우저에서 공개 가능한 계획만 볼 수 있습니다.)
  - 기록: provider-neutral itinerary payload를 URL-safe codec으로 공유하고 공개 share route에서 계획만 읽도록 구현함 / 변경 파일: src/features/itineraries/share-codec.ts, src/features/itineraries/share-button.tsx, src/app/share/[payload]/page.tsx, src/features/itineraries/itinerary-detail.tsx / 실행 주소: http://127.0.0.1:3002

## EPIC 13: 배포(선택) — 강사와 함께 진행 가능

- [x] STORY 13.1: Git 저장소와 Vercel 프로젝트를 연결한다 (완료 확인: 배포 기록에서 최신 코드가 성공 상태로 표시됩니다.)
  - 기록: GitHub `aiwhyclub/ic-project`의 `main`과 Vercel `creator-47ed9835/ic-project`를 연결하고 커밋 `69aef15`의 production 배포 `READY` 및 실제 첫 화면을 확인함 / 변경 파일: .gitignore, .env.example, README.md, docs/deployment.md / 실행 주소: https://ic-project-xi.vercel.app
- [x] STORY 13.2: Supabase Cloud와 배포 환경변수·OAuth 콜백·Kakao 허용 도메인을 연결한다 (완료 확인: 공개 주소에서 두 로그인과 본인 일정 저장이 동작합니다.)
  - 기록: Vercel Production 변수 8개, Supabase Cloud migration·seed·Site URL·Google/Kakao provider, Kakao production 도메인·redirect를 연결하고 Google·Kakao 사용자별 일정 1개씩의 저장·격리를 확인함 / 변경 파일: .env.example, docs/deployment.md, supabase/migrations/, supabase/seed.sql / 실행 주소: https://ic-project-xi.vercel.app
- [ ] STORY 13.3: 공개 전 RLS·장소 정보·사진 사용권·Kakao/TMAP 약관·비용 상한을 다시 점검한다 (완료 확인: 출시 체크리스트의 근거 링크와 확인일이 모두 채워지고 막는 항목이 없습니다.)
