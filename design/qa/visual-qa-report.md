# 이천 세이브포인트 시안 Visual QA

- 검증일: 2026-09-16
- 대상: PRD 7개 화면의 데스크톱·모바일 보드 7개
- 파일 형식: 모두 PNG, 1672×941, RGB
- 디자인 시스템 검토: PASS, HIGH confidence
- 시각·한글 정밀도 검토: PASS, HIGH confidence
- Pretendard 단일 패밀리·굵기 위계 검토: PASS, HIGH confidence
- Google Stitch 14개 반응형 프레임 검토: PASS (`design/qa/stitch-qa.md`)
- 사용자 시안 승인: 완료 (2026-09-19)
- 차단 항목: 없음

## 파일과 SHA-256

| 화면 | 파일 | SHA-256 |
| --- | --- | --- |
| 01 AI 큐레이션 홈 | design/01-ai-curation-home.png | 6fa33223240b859f61f1d0d36a89c3fb20703ddd993b64ffec5cdcad1e79ce37 |
| 02 지도 동선 계획 | design/02-route-map.png | ec7cd7c9ed26b77a90730066f02cc63f26435e9f7e0f75e1afc68a219ea3b061 |
| 03 장소 상세 | design/03-place-detail.png | f9464662cd8cda91e6357084c57e019e56af71295ba927cb24fd1ad37d4a8d99 |
| 04 Supabase OAuth | design/04-oauth-login.png | 0f39dff2d036e6b12f9a18064aca95cadb48a3e4788d8b5ed449c3fe932152e3 |
| 05 마이페이지 | design/05-my-page.png | 23b22d8d7d43c8b0719abbc2bf9a7f76f78d82212610d0a6df7cc30035997461 |
| 06 저장 동선 상세·여행 | design/06-saved-route.png | 0c178165dd4e6f58f6cade04586196b756f9880d3ba99a7a23f3d8e52073b3db |
| 07 플랜B | design/07-plan-b.png | 97d453f4c81ad2f9e1c888d2b7ee2ce96472516ff72456d18638436dace7e0db |

## 1차 검토에서 수정한 항목

- Screen 02: 데스크톱·모바일 빠른 장소정보 패널 추가
- Screen 02: 모바일 위·아래·삭제 버튼과 Kakao 경로 계산 실패 출처 명시
- Screen 05: 저장 목록과 동시에 노출되던 모순된 빈 상태를 다음 여행 준비 카드로 교체
- Screen 07: 모바일 카드 선택 버튼과 고정 이 장소로 교체 CTA 추가
- Screen 07: 실시간 실패 문구 전체 노출과 저장 재시도 영역 분리
- 전체 화면: Pretendard 단일 폰트 패밀리로 통일하고 큰 제목 700, 단계명·핵심 항목 600, 본문 400, 보조 표기 500 적용

## 최종 확인 사항

- 7개 화면과 PRD 화면 목록이 1:1로 대응합니다.
- 모든 보드는 같은 세라믹 에디토리얼 팔레트·타입·모서리·이미지 처리 방식을 사용합니다.
- Kakao Map만 지도 캔버스로 사용하며 TMAP은 선택형 경로 보완 표기로만 나타납니다.
- 데스크톱·모바일이 같은 제품 흐름을 유지합니다.
- 한글 문구에 차단 수준의 잘림·깨짐·두부 문자가 없습니다.
- 모든 데스크톱·모바일 시안에서 잔여 세리프 없이 Pretendard 계열과 요청된 굵기 위계가 유지됩니다.
- 정적 시안이므로 키보드, 스크린리더, 실제 지도·OAuth·경로 API 동작은 구현 단계 검증 항목입니다.

## 구현 단계 주의

- 모바일 큐레이션 카드의 칩 밀도를 줄입니다.
- 모바일 지도 버튼의 실제 히트 영역을 44px 이상으로 구현합니다.
- 생성 이미지 속 간판·장소명은 실제 사진 교체 전 플레이스홀더임을 유지합니다.
- 플랜B 고정 CTA에 모바일 안전 하단 여백을 적용합니다.
