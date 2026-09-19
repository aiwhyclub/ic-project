# 이천 실재 장소 검증 카탈로그

- 상태: 9개 후보 공식 출처 확인 완료, 구현 미적용
- 확인일: 2026-09-20
- 목적: 가짜 fixture 9개를 실재 장소로 교체할 때 사용할 source-backed 입력안
- 범위: `WEST_PLACES`, `CENTRAL_PLACES`, `EAST_PLACES` 각 3개와 기본 코스 3개의 의도 유지
- 사진 정책: 외부 사진을 사용하지 않는다. 사진 URL을 제안하거나 공식 페이지 이미지를 복제하지 않는다.
- 좌표 정책: 공식 페이지가 수치 좌표를 제공하지 않으면 추정하지 않고 `Kakao Local API 확인 필요`로 기록한다.
- 보안: API 키, 토큰, 개인 연락처를 기록하지 않는다. 아래 전화번호는 시설이 공식 공개한 대표 연락처만 사용한다.

## 1. 권역별 9개 후보

기존 배열명은 구현 호환용 그룹명으로 유지한다. `EAST_PLACES`는 엄밀한 동쪽 경계가 아니라 외곽 가족·농촌 코스 묶음이다.

| 배열·권역 | 제안 ID | 공식 명칭 | 카테고리 | 기본 코스 역할 | 근거 |
| --- | --- | --- | --- | --- | --- |
| `WEST_PLACES` · 설봉·도자 | `gyeonggi-ceramic-museum-icheon` | 경기도자미술관 | `museum` | 도자 문화 핵심 전시 | S1 |
| `WEST_PLACES` · 설봉·도자 | `icheon-city-museum` | 이천시립박물관 | `museum` | 이천 역사·도자 보완 전시 | S2 |
| `WEST_PLACES` · 설봉·도자 | `seolbong-lake` | 설봉호(설봉공원) | `park` | 호수 산책·야외 휴식 | S3 |
| `CENTRAL_PLACES` · 도심 시장·문화 | `gwango-traditional-market` | 관고전통시장 | `market` | 시장·지역생활 | S4 |
| `CENTRAL_PLACES` · 도심 시장·문화 | `icheon-woljeon-museum` | 이천시립월전미술관 | `museum` | 지역 미술·실내 관람 | S5 |
| `CENTRAL_PLACES` · 도심 시장·문화 | `seolbong-seowon` | 설봉서원(雪峯書院) | `culture` | 향토 역사·전통문화 | S6 |
| `EAST_PLACES` · 외곽 가족·농촌 | `icheon-agricultural-theme-park` | 이천농업테마공원 | `experience` | 쌀·농업·가족 체험 | S7 |
| `EAST_PLACES` · 외곽 가족·농촌 | `icheon-sansuyu-village` | 산수유마을(체험) | `experience` | 농촌·자연·가족 체험 | S8 |
| `EAST_PLACES` · 외곽 가족·농촌 | `seohui-history-hall` | 서희역사관 | `museum` | 가족 역사교육·실내 대안 | S9 |

계수 결과: 후보 9개, ID 9개, 중복 0개, 공식·시설 원출처가 없는 후보 0개.

## 2. 출시 입력용 상세 데이터

`공식 근거 미제공`은 해당 값이 없다는 뜻이 아니라, 이번에 확인한 공식 페이지로 확정할 수 없다는 뜻이다.

| ID | 주소·공식 연락처 | 운영시간·휴무 | 예약·주차 | 좌표 | 데이터 이용 근거 | 출처 |
| --- | --- | --- | --- | --- | --- | --- |
| `gyeonggi-ceramic-museum-icheon` | 경기도 이천시 경충대로 2697번길 263<br>031-645-0730 | 화~일 10:00~18:00, 입장 마감 17:00<br>월요일, 1월 1일, 설날·추석 휴관. 월요일이 공휴일이면 다음 날 휴관 | 일반 관람은 현장 발권 가능. 단체는 전화 문의. 체험은 별도 예약<br>미술관 앞 무료 주차장 | Kakao Local API 확인 필요 | U2: 사실 메타데이터만 사용, 설명문·사진 미복제 | S1 |
| `icheon-city-museum` | 경기도 이천시 경충대로2697번길 172(관고동)<br>031-633-9734 | 09:00~18:00, 입장 마감 17:30<br>월요일, 1월 1일, 설·추석 당일 휴관. 월요일이 공휴일이면 다음 날 휴관 | 10명 이내 불필요, 10~20명 권장, 20명 이상 2주 전 예약<br>설봉공원 제4주차장 | Kakao Local API 확인 필요 | U2: 사실 메타데이터만 사용, 설명문·사진 미복제 | S2 |
| `seolbong-lake` | 경기도 이천시 경충대로2709번길 128<br>공식 연락처 미제공 | 방문 전 공식 페이지 확인<br>휴무 공식 근거 미제공 | 예약 공식 근거 미제공<br>주차 상세 공식 근거 미제공 | Kakao Local API 확인 필요 | U1: 이천시 공공누리 출처표시 조건으로 사실 메타데이터 사용, 사진 미사용 | S3 |
| `gwango-traditional-market` | 경기도 이천시 중리천로31번길 22<br>031-633-4243 | 공식 페이지 표시 08:00~21:00<br>상설 운영, 2·7일 장날. 휴무 공식 근거 미제공 | 예약 공식 근거 미제공<br>공식 페이지는 주차시설 보유를 안내하나 세부 조건 미제공 | Kakao Local API 확인 필요 | U1: 이천시 공공누리 출처표시 조건으로 사실 메타데이터 사용, 사진 미사용 | S4 |
| `icheon-woljeon-museum` | 경기도 이천시 경충대로 2709번길 185(관고동)<br>031-637-0032 | 10:00~18:00, 입장 마감 17:30<br>월요일, 1월 1일, 설·추석 당일 휴관 | 일반 관람 예약 공식 근거 미제공<br>주차 공식 근거 미제공 | Kakao Local API 확인 필요 | U2: 사실 메타데이터만 사용, 설명문·사진 미복제 | S5 |
| `seolbong-seowon` | 경기도 이천시 경충대로2709번길 276<br>031-632-6564 | 일반 관람시간 공식 근거 미제공: 방문 전 공식 페이지·전화 확인<br>휴무 공식 근거 미제공 | 체험교육은 공식 연락처 문의<br>주차 공식 근거 미제공 | Kakao Local API 확인 필요 | U1: 이천시 공공누리 출처표시 조건으로 사실 메타데이터 사용, 사진 미사용 | S6 |
| `icheon-agricultural-theme-park` | 경기도 이천시 모가면 공원로 48<br>031-632-6607 | 4~10월 09:30~18:30, 11~3월 09:30~17:00<br>휴무 공식 근거 미제공: 방문 전 공식 페이지 확인 | 일반 관람·체험 예약 공식 근거 미제공<br>주차 공식 근거 미제공 | Kakao Local API 확인 필요 | U1: 이천시 공공누리 출처표시 조건으로 사실 메타데이터 사용, 사진 미사용 | S7 |
| `icheon-sansuyu-village` | 경기도 이천시 백사면 원적로775번길 17<br>031-632-4304 | 상시 운영, 연중무휴 | 체험은 전화예약<br>무료 주차 400대 이상 안내 | Kakao Local API 확인 필요 | U1: 이천시 공공누리 출처표시 조건으로 사실 메타데이터 사용, 사진 미사용 | S8 |
| `seohui-history-hall` | 이천시 부발읍 무촌로18번길 130<br>031-633-9743 | 09:00~18:00, 입장 마감 17:30<br>월요일, 공휴일 다음 날, 1월 1일, 설·추석 휴관. 월요일이 공휴일이면 다음 날 휴관 | 일반 관람 예약 공식 근거 미제공. 단체 프로그램은 공지별 신청<br>주차 공식 근거 미제공 | Kakao Local API 확인 필요 | U2: 사실 메타데이터만 사용, 설명문·사진 미복제 | S9 |

## 3. 기본 코스 3개 유지안

| 기존 코스 ID | 유지할 의도 | 새 장소 순서 제안 | 출시 전 추가 검증 |
| --- | --- | --- | --- |
| `route-ceramics-and-lake` | 도자·전시·호수 산책 | 경기도자미술관 → 이천시립박물관 → 설봉호(설봉공원) → 이천시립월전미술관 | 좌표 확보 후 도보·대중교통 구간과 휴관일 조합 재계산 |
| `route-family-rice-and-craft` | 가족·쌀·농촌·체험 | 이천농업테마공원 → 산수유마을(체험) → 서희역사관 → 경기도자미술관 | 자차 이동시간, 체험 예약 가능일, 계절 운영 재확인 |
| `route-market-and-local-life` | 시장·향토 역사·지역문화 | 관고전통시장 → 설봉서원 → 이천시립월전미술관 → 설봉호(설봉공원) | 좌표 확보 후 도보 가능성 검증. 불가능하면 대중교통 또는 자차로 변경 |

이 문서는 장소 후보와 공식 사실만 확정한다. 코스 이동시간과 순서는 Kakao Local API로 좌표를 확보하고 승인된 경로 API로 재계산한 뒤 확정한다.

## 4. 데이터 이용 기준

### U1. 이천시 공식 페이지

- 사실: 이천시는 공공누리 표시가 있는 저작물을 표시된 유형의 조건에 따라 이용할 수 있고, 제1유형은 출처표시를 조건으로 상업적 이용과 변경을 허용한다고 안내한다. 공공누리 표시가 없는 자료는 사전 협의가 필요하다.
- `source_url`: https://www.icheon.go.kr/portal/contents.do?mid=0705000000
- `captured_at`: 2026-09-20
- `provenance_note`: 이천시청 공식 저작권보호정책에서 공공누리 유형별 조건과 미표시 자료의 사전 협의 요건을 확인했다. 각 장소 페이지의 공공누리 표시를 구현 직전에 다시 확인한다.

프로젝트 적용: 장소명, 주소, 대표전화, 운영시간, 휴무, 예약·주차 같은 사실 메타데이터와 source URL만 저장하고 이천시 출처를 표시한다. 외부 사진과 설명문은 복제하지 않는다.

### U2. 시설 공식 사이트

- 사실: 경기도자미술관, 이천문화재단 시설 사이트와 이천시립월전미술관 사이트는 자체 저작권 고지를 제공한다. 이 카탈로그는 공식 페이지의 사실 메타데이터만 요약하고 이미지나 표현적 설명문을 복제하지 않는다.
- `source_url`: https://gmocca.org/info<br>https://www.artic.or.kr/icmus/main/view<br>https://www.artic.or.kr/shmus/main/view<br>https://www.iwoljeon.co.kr/main/main.php
- `captured_at`: 2026-09-20
- `provenance_note`: 각 시설 공식 사이트의 운영 주체, 현재 접근 가능성, 주소·연락처·운영정보와 저작권 고지를 확인했다.

프로젝트 적용: 사실 메타데이터와 공식 링크만 사용한다. 사이트 이미지, 로고, 전시 설명, 홍보 문구는 별도 허락 없이 복제하지 않는다.

## 5. 장소별 공식 근거 레코드

### S1. 경기도자미술관

- `source_url`: https://gmocca.org/FAQ
- `captured_at`: 2026-09-20
- `provenance_note`: 공식 FAQ에서 이천 주소, 대표전화, 관람시간, 휴관일, 일반·단체 예약, 체험 예약과 무료 주차장을 확인했다.

### S2. 이천시립박물관

- `source_url`: https://www.artic.or.kr/icmus/main/view<br>https://www.artic.or.kr/icmus/contents/view?contentsNo=44&menuLevel=2&menuNo=42<br>https://www.artic.or.kr/icmus/contents/view?contentsNo=41&menuLevel=2&menuNo=46
- `captured_at`: 2026-09-20
- `provenance_note`: 공식 메인·관람안내에서 시간·휴관·단체 예약을, 공식 오시는 길에서 주소·대표전화·설봉공원 제4주차장을 확인했다.

### S3. 설봉호(설봉공원)

- `source_url`: https://www.icheon.go.kr/tour/contents.do?mid=0101010000
- `captured_at`: 2026-09-20
- `provenance_note`: 이천시 문화관광 공식 페이지에서 공식 명칭, 주소, 설봉공원 내 위치와 산책 공간 성격을 확인했다. 운영시간·휴무·예약·주차 세부는 확정하지 않았다.

### S4. 관고전통시장

- `source_url`: https://www.icheon.go.kr/tour/cultureTour/manage/view.do?idx=76&mid=0402030000
- `captured_at`: 2026-09-20
- `provenance_note`: 이천시 문화관광 공식 페이지에서 명칭, 주소, 대표전화, 표시 운영시간, 상설 운영과 2·7일 장날, 주차시설 안내를 확인했다.

### S5. 이천시립월전미술관

- `source_url`: https://www.iwoljeon.co.kr/intro/intro.php?sp=view
- `captured_at`: 2026-09-20
- `provenance_note`: 시설 공식 관람안내에서 명칭, 주소, 대표전화, 관람시간, 입장 마감과 휴관일을 확인했다. 일반 예약과 주차는 공식 근거를 확보하지 못했다.

### S6. 설봉서원

- `source_url`: https://www.icheon.go.kr/tour/cultureTour/manage/view.do?idx=114&mid=0302040000
- `captured_at`: 2026-09-20
- `provenance_note`: 이천시 문화관광 공식 페이지에서 명칭, 주소, 관람·체험교육 문의 연락처와 교육 프로그램 운영을 확인했다. 일반 관람시간·휴무·주차는 확정하지 않았다.

### S7. 이천농업테마공원

- `source_url`: https://www.icheon.go.kr/tour/cultureTour/manage/view.do?idx=32&mid=0101030000
- `captured_at`: 2026-09-20
- `provenance_note`: 이천시 문화관광 공식 페이지에서 명칭, 주소, 대표전화, 계절별 운영시간과 쌀문화관·농업체험 공간을 확인했다. 휴무·예약·주차 세부는 확정하지 않았다.

### S8. 산수유마을(체험)

- `source_url`: https://www.icheon.go.kr/tour/cultureTour/manage/view.do?idx=191&mid=0101040000<br>https://www.icheon.go.kr/tour/cultureTour/manage/view.do?idx=12&mid=0402020000
- `captured_at`: 2026-09-20
- `provenance_note`: 이천시 문화관광 공식 체험 페이지에서 명칭, 주소, 대표전화, 상시 운영·연중무휴와 전화예약을 확인하고, 공식 산수유마을 페이지에서 무료 주차 400대 이상 안내를 교차 확인했다.

### S9. 서희역사관

- `source_url`: https://www.artic.or.kr/base/contents/view?contentsNo=7&menuLevel=3&menuNo=13
- `captured_at`: 2026-09-20
- `provenance_note`: 이천문화재단 공식 공간소개에서 명칭, 주소, 대표전화, 관람시간과 휴관일을 확인했다. 일반 예약·주차는 공식 근거를 확보하지 못했다.

## 6. 미해결과 구현 전 게이트

1. **좌표 9개 전부 미확정:** 장소명·주소로 Kakao Local API를 호출해 좌표를 확보하고 결과의 place ID·도로명주소를 공식 데이터와 대조한다.
2. **운영정보 일부 미확정:** 설봉호, 설봉서원, 이천농업테마공원의 휴무·예약·주차와 월전미술관·서희역사관의 주차를 방문 직전 공식 페이지 또는 대표전화로 다시 확인한다.
3. **코스 이동성 미검증:** 새 좌표로 세 코스의 도보·대중교통·자차 구간을 재계산한다. 이동수단과 맞지 않으면 장소가 아니라 코스 이동수단·순서를 조정한다.
4. **계절·행사 변동:** 산수유 체험, 농업테마공원과 시장 장날은 계절·행사에 따라 변동할 수 있으므로 `lastVerifiedAt`을 장소별로 갱신한다.
5. **사진 없음이 기본:** 공개 UI는 CSS 자체 제작 시각물 또는 “사진 없음” 상태를 사용한다. 공식 페이지 사진·로고 URL을 seed에 저장하지 않는다.
6. **출처 표시:** 각 장소 상세에 공식 명칭, source URL, `lastVerifiedAt=2026-09-20`, 데이터 이용 근거를 표시한다.

현재 판정: **장소 후보 9개는 확보했지만 좌표·일부 운영정보와 코스 이동성이 미확정이므로 구현 즉시 출시 완료로 간주하면 안 된다.**
