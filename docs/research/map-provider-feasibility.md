# Kakao Map 단일 지도 UI와 선택형 TMAP 경로 보완 검토

- 최초 검토일: 2026-09-16
- 재확인일: 2026-09-20
- 범위: 웹 여행 동선의 지도 표시, 장소 탐색, 도보·자차·대중교통 경로, 저장 동선 재계산, 장애 대응, 데이터 저장·표시 제한
- 근거 원칙: Kakao Developers, Kakao Mobility Developers, TMAP Mobility의 공식 문서와 약관만 사용

## 결론

1차 제품은 **지도 화면과 장소 탐색을 Kakao Map으로 통일**하고, **도보·대중교통은 Kakao Map REST API, 자차는 Kakao Mobility 길찾기 API를 기본 경로로 사용**한다. Kakao Map은 지도 SDK와 위치·장소·경로 REST API를 별도로 제공하고, Kakao Mobility는 자동차 길찾기 API를 제공한다. [Kakao Map 이해하기](https://developers.kakao.com/docs/ko/kakaomap/common), [Kakao Map REST API](https://developers.kakao.com/docs/ko/kakaomap/rest-api), [Kakao Mobility 길찾기 API](https://developers.kakaomobility.com/guide/navi-api/start)

TMAP은 기본 지도 UI가 아니라 다음 상황에서만 선택적으로 사용한다.

- Kakao 계열 경로가 실패했을 때 사용자가 TMAP 앱에서 목적지 안내를 계속하도록 하는 **외부 전환 수단**
- 경로 품질이나 가용성 보완이 필요하고, TMAP 응답을 제품 안에서 사용하는 범위에 대해 약관·라이선스 확인을 마친 경우의 **보조 경로 공급자**

TMAP 공식 문서는 자동차·보행자 경로 API와 별도의 대중교통 API, TMAP 앱을 실행해 목적지를 안내하는 연동 기능을 제공한다고 설명한다. 그러나 확인한 공식 공개 문서에는 **TMAP 경로 데이터를 Kakao Map 지도 위에 표시해도 된다는 명시적 허용 문구가 없다**. 따라서 교차 표시는 양사에 사용 방식과 계약 조건을 확인한 뒤 적용한다. 확인 전에는 Kakao 계열 경로만 Kakao Map에 표시하고 TMAP은 외부 앱 전환으로 제한한다. [TMAP API 소개](https://tmap-skopenapi.readme.io/reference/t-map-%EC%86%8C%EA%B0%9C), [TMAP API 약관](https://tmapapi.tmapmobility.com/terms.html)

### 2026-09-20 공개 문서 재확인

- TMAP API 약관은 경로안내와 TMAP 앱 연동을 제공 기능으로 열거하고 API 데이터의 24시간 초과 사용을 금지하지만, TMAP 경로 좌표를 타사 지도 위에 그리는 행위를 허용한다는 문구는 확인되지 않았다.
- Kakao 플랫폼 서비스 약관과 운영정책은 제3자 권리 침해와 카카오 제휴로 오인시키는 표시를 금지하고, 상표를 다른 상표와 결합하지 않도록 요구한다. 그러나 Kakao Map 위에 TMAP 경로를 표시해도 된다는 승인 문구는 확인되지 않았다.
- 따라서 현재 판정은 **불허 확정이 아니라 허용 미확정**이다. 양사의 서면 확인 없이 STORY 12.1 코드, TMAP API 키, 경로 폴리라인과 공급자 배지를 활성화하지 않는다.
- 공식 문의 경로는 [TMAP 제휴 문의](https://tmapapi.tmapmobility.com/partnership.html), [SK Open API 1:1 문의](https://openapi.sk.com/qnaCommunity/list), [Kakao 제휴 안내](https://with.kakao.com/)와 Kakao Developers 운영정책이 안내하는 DevTalk이다.
- 제품 범위 결정: STORY 12.1과 F4.15를 현재 계획에서 제외한다. 현재 구현의 외부 Kakao Map 전환을 유지하고, TMAP을 다시 도입한다면 외부 전환부터 별도 계획으로 검토한다. 내부 교차 표시는 양사의 서면 승인을 확보한 뒤에만 재검토한다.

서면 확인에는 아래 질문을 모두 포함한다.

1. TMAP 자동차·보행자·대중교통 REST API가 반환한 경로 좌표와 요약값을 Kakao Map Web SDK 지도 위에 일시 표시할 수 있는가?
2. 허용된다면 필요한 TMAP·Kakao 출처, 로고, 문구, 최소 크기와 배치 규칙은 무엇인가?
3. 브라우저 메모리, Next.js 서버 메모리와 로그에서 허용되는 보관 기간은 각각 얼마이며 24시간보다 짧은 즉시 폐기 방식이면 충분한가?
4. 무료 API 프로젝트에서 가능한가, 아니면 유료 계약·제휴·별도 상품 신청이 필요한가?
5. Kakao Map 위의 제3자 경로선이 Kakao 제공 경로 또는 양사 제휴 기능으로 오인되지 않게 하는 별도 고지 문구가 필요한가?

## 공급자 역할

| 계층 | 1차 기본 | TMAP 사용 범위 | 판정 |
| --- | --- | --- | --- |
| 지도 표시·조작 | Kakao Map Web SDK | 사용하지 않음 | 지도 UI는 Kakao Map 단일화 |
| 장소 검색·좌표·상세 연결 | Kakao Map Local REST API와 자체 검증 장소 DB | 기본 범위에서 사용하지 않음 | 공급자 혼합 최소화 |
| 도보 경로 | Kakao Map 도보 경로 API | 계약·표시 범위 확인 후 보조 가능 | 기본은 Kakao |
| 자차 경로 | Kakao Mobility 자동차·다중 경유지 길찾기 | 계약·표시 범위 확인 후 보조 가능 | 기본은 Kakao Mobility |
| 대중교통 경로 | Kakao Map 대중교통 경로 API | 별도 상품·표시 범위 확인 후 보조 가능 | 기본은 Kakao |
| 장애 시 외부 길찾기 | 외부 Kakao Map 열기 | 외부 TMAP 열기 | 내부 계획 유지 |

### 공식 기능 근거

- Kakao Map API는 REST API와 지도 SDK를 구분한다. REST API는 장소·주소·좌표·경로 데이터를 조회하고, Web SDK는 웹 서비스에 지도를 표시하고 제어한다. [Kakao Map 이해하기](https://developers.kakao.com/docs/ko/kakaomap/common), [Kakao Map Web API 가이드](https://apis.map.kakao.com/web/guide/)
- Kakao Map REST API는 도보·대중교통·자전거 경로 조회를 제공한다. 대중교통 응답에는 이동 구간, 거리, 시간, 환승, 요금과 경로 좌표가 포함된다. [Kakao Map REST API](https://developers.kakao.com/docs/ko/kakaomap/rest-api)
- Kakao Mobility는 자동차 길찾기와 다중 경유지 자동차 길찾기를 별도 API로 제공한다. [Kakao Mobility 길찾기 API](https://developers.kakaomobility.com/guide/navi-api/start)
- TMAP API는 자동차·보행자 경로와 TMAP 앱 목적지 안내 연동을 제공한다. [TMAP API 소개](https://tmap-skopenapi.readme.io/reference/t-map-%EC%86%8C%EA%B0%9C), [TMAP 자동차 경로안내](https://tmap-skopenapi.readme.io/reference/%EC%9E%90%EB%8F%99%EC%B0%A8-%EA%B2%BD%EB%A1%9C%EC%95%88%EB%82%B4), [TMAP 보행자 경로안내](https://tmap-skopenapi.readme.io/reference/%EB%B3%B4%ED%96%89%EC%9E%90-%EA%B2%BD%EB%A1%9C%EC%95%88%EB%82%B4)
- TMAP 대중교통은 일반 TMAP 경로 API와 구분된 상품·호출 절차를 사용하며, 출발지와 목적지 사이의 대중교통 경로와 전체 보행 구간을 반환한다. [TMAP 대중교통 이용 절차](https://transit.tmapmobility.com/guide/procedure), [TMAP 대중교통 경로 API](https://transit.tmapmobility.com/docs/routes)

## 지도 표시와 경로 공급자의 분리

애플리케이션 구조에서는 다음 두 계층을 분리한다.

1. **지도 UI 계층:** Kakao Map Web SDK로 지도, 마커, 오버레이와 사용자 조작을 제공한다.
2. **경로 계산 계층:** 출발지·목적지·이동수단을 경로 API에 보내 거리, 시간, 구간과 경로 결과를 받는다.

이 분리는 장애 처리와 테스트를 단순하게 하지만, **기술적 분리가 교차 표시 권한을 뜻하지는 않는다**. TMAP 응답을 Kakao Map 위에 그리거나 Kakao 장소 데이터와 결합해 표시하려면 다음 사항을 출시 전에 서면으로 확인한다.

- TMAP 경로 좌표·요약값·길안내 정보를 Kakao Map 위에 표시할 수 있는지
- Kakao Map 위에 다른 공급자의 경로를 표시할 때 필요한 출처·로고·고지 방식
- 응답을 브라우저 메모리나 서버 캐시에 보관할 수 있는 기간과 허용 목적
- 유료 계약 또는 별도 제휴가 필요한 기능 범위

공식 공개 문서만으로 위 항목이 확인되지 않으면 교차 표시를 구현하지 않는다. 이 경우 TMAP은 “TMAP에서 길찾기”처럼 외부 앱을 여는 대체 행동으로만 제공한다. TMAP은 공식 기능 목록에서 TMAP 앱을 실행해 목적지를 바로 안내하는 연동 기능을 명시한다. [TMAP API 소개](https://tmap-skopenapi.readme.io/reference/t-map-%EC%86%8C%EA%B0%9C)

## 이동수단별 처리

### 도보

- 기본: Kakao Map 도보 경로 API를 호출하고 Kakao Map에 표시한다. [Kakao Map REST API](https://developers.kakao.com/docs/ko/kakaomap/rest-api)
- 선택 보조: TMAP 보행자 경로 API는 출발지·목적지와 최대 5개 경유지를 받는다. 제품 내부 표시는 라이선스 확인 후에만 적용하고, 확인 전에는 외부 전환만 제공한다. [TMAP 보행자 경로안내](https://tmap-skopenapi.readme.io/reference/%EB%B3%B4%ED%96%89%EC%9E%90-%EA%B2%BD%EB%A1%9C%EC%95%88%EB%82%B4)

### 자차

- 기본: Kakao Mobility 자동차 길찾기 또는 다중 경유지 길찾기를 사용한다. [Kakao Mobility 길찾기 API](https://developers.kakaomobility.com/guide/navi-api/start)
- 선택 보조: TMAP 자동차 경로 API는 교통 최적, 최소 시간, 무료 우선 등 탐색 옵션과 경유지를 지원한다. 제품 내부 표시는 라이선스 확인 후에만 적용하고, 확인 전에는 외부 전환만 제공한다. [TMAP 자동차 경로안내](https://tmap-skopenapi.readme.io/reference/%EC%9E%90%EB%8F%99%EC%B0%A8-%EA%B2%BD%EB%A1%9C%EC%95%88%EB%82%B4)

### 대중교통

- 기본: Kakao Map 대중교통 경로 API를 구간별로 호출한다. 공식 API는 출발지와 목적지 좌표를 받아 대중교통 경로를 반환한다. [Kakao Map REST API](https://developers.kakao.com/docs/ko/kakaomap/rest-api)
- 선택 보조: TMAP 대중교통 API는 별도 상품이며 별도의 앱 키 발급·사용 신청 절차가 필요하다. 계약·교차 표시 범위를 확인하기 전에는 기본 경로로 간주하지 않는다. [TMAP 대중교통 이용 절차](https://transit.tmapmobility.com/guide/procedure), [TMAP 대중교통 경로 API](https://transit.tmapmobility.com/docs/routes)

## 데이터 저장 정책

### 공식 제한

- Kakao 플랫폼 서비스 약관은 서비스와 개발자센터에서 얻은 데이터 등의 정보를 사전 승낙 없이 복사·복제·변경하거나 다른 방식으로 사용·제공하는 행위를 제한한다. [Kakao 플랫폼 서비스 약관 제11조](https://developers.kakao.com/terms/ko/site-terms)
- TMAP API 약관은 TMAP Open API로 얻은 데이터를 저장한 뒤 24시간 이상 사용할 수 없다고 명시한다. [TMAP API 약관](https://tmapapi.tmapmobility.com/terms.html)

### 보수적 저장 원칙

위 제한을 고려해 영구 데이터베이스에는 공급자 응답을 저장하지 않는다.

**저장하는 정보**

- 자체 `internal_place_id`
- 방문 순서
- 사용자가 선택한 이동수단
- 사용자가 입력한 일정명·여행일
- 자체 조사·검증한 예상 체류시간과 장소 운영 정보
- 자체 권한으로 관리하는 최신 좌표와 검증 출처
- 마지막 경로 계산 성공·실패 시각과 상태 코드처럼 공급자 원문을 재현하지 않는 운영 메타데이터

**저장하지 않는 정보**

- 지도 타일·정적 지도 이미지·스크린샷
- 공급자 장소 검색 원문, 장소 ID, 상세 URL과 원문 응답
- 경로 폴리라인·경로 좌표 배열
- 길안내 단계·도로명·대중교통 구간 원문
- 공급자 응답 전체와 이를 가공한 장기 캐시

경로 결과는 현재 화면을 그리는 동안에만 사용하고, 저장 동선을 다시 열 때 내부 장소 ID와 자체 좌표로 새로 요청한다. TMAP 보조를 계약상 허용해도 공식 약관의 24시간 제한보다 짧은 임시 캐시만 사용하고 만료 즉시 삭제한다. 장기 저장이 필요한 기능은 별도 계약에서 허용 범위를 확인한 뒤 설계한다. [Kakao 플랫폼 서비스 약관](https://developers.kakao.com/terms/ko/site-terms), [TMAP API 약관](https://tmapapi.tmapmobility.com/terms.html)

## 출처와 브랜드 표시

- Kakao Map 지도·정적 이미지와 관련 브랜드 표시는 공식 가이드를 따르고 로고를 임의로 제거·변형하지 않는다. Kakao 정적 지도 API는 응답 이미지의 Kakao 로고를 제거할 수 없다고 명시한다. [Kakao Map REST API](https://developers.kakao.com/docs/ko/kakaomap/rest-api), [Kakao Map BI 가이드](https://developers.kakao.com/tool/resource/static/pdf/map/kakaomap_design_guidelines.pdf)
- TMAP을 외부 전환으로 사용할 때는 기능을 “TMAP에서 길찾기”처럼 실제 동작에 맞게 표시하고, 제휴 관계가 확인되지 않았다면 제휴·공식 서비스로 오인시키는 표현을 사용하지 않는다. [TMAP API 소개](https://tmap-skopenapi.readme.io/reference/t-map-%EC%86%8C%EA%B0%9C)
- 교차 표시가 승인된 경우에도 화면에서 지도 출처는 Kakao Map, 경로 출처는 TMAP으로 구분해 표시하고 양사의 별도 브랜드 조건을 함께 따른다.

## 실패 처리

### Kakao Map 지도 UI 실패

1. 장소 목록, 방문 순서와 사용자가 편집한 계획정보는 유지한다.
2. 지도 대신 목록 중심의 축소 화면을 제공한다.
3. 다시 불러오기와 외부 Kakao Map 열기를 제공한다.
4. TMAP 외부 전환이 활성화돼 있으면 다음 목적지를 TMAP에서 여는 보조 행동을 추가한다.

### Kakao 경로 실패·결과 없음·쿼터 초과

1. 실패한 구간만 오류로 표시하고 다른 장소와 순서는 유지한다.
2. 마지막 정상 계산시각, 실패한 이동수단과 재시도 행동을 표시한다.
3. 동일 공급자 재시도를 우선 제공한다.
4. TMAP 내부 보조가 계약상 승인된 경우에만 해당 구간을 TMAP으로 다시 계산한다.
5. 승인되지 않은 경우 TMAP 앱 외부 열기를 제공하되 제품 내부에 TMAP 경로를 그리지 않는다.

Kakao Map REST API와 TMAP API는 정상 결과 외에 결과 없음·요청 오류 등 상태를 문서화한다. 공급자 오류를 사용자 계획 데이터의 삭제나 초기화로 처리하지 않는다. [Kakao Map REST API](https://developers.kakao.com/docs/ko/kakaomap/rest-api), [TMAP 대중교통 경로 API](https://transit.tmapmobility.com/docs/routes), [TMAP API 오류 코드](https://tmap-skopenapi.readme.io/reference/error-code-10)

### TMAP 보조 실패

- Kakao Map 지도 UI는 그대로 유지한다.
- Kakao 경로 재시도 또는 외부 Kakao Map 열기로 돌아갈 수 있게 한다.
- TMAP 장애를 이유로 장소·순서·저장 일정 상태를 변경하지 않는다.
- 외부 앱이 설치되지 않았거나 열리지 않으면 설치 안내 또는 웹 대체 경로를 제공하되, 구현 가능 여부는 선택한 TMAP 연동 방식의 공식 문서로 다시 확인한다.

## 안전한 PRD 문구

> 서비스의 지도 화면, 장소 마커와 장소 탐색은 Kakao Map으로 통일한다. 도보·대중교통 경로는 Kakao Map 경로 API를, 자차 경로는 Kakao Mobility 길찾기 API를 기본으로 사용한다.

> TMAP은 Kakao 계열 경로의 품질·가용성 보완이 필요한 경우에만 선택적으로 사용한다. TMAP 지도 화면은 제품의 기본 UI로 제공하지 않는다.

> TMAP 경로 데이터를 Kakao Map 위에 표시하는 기능은 양사의 약관·라이선스와 출처 표시 조건을 서면으로 확인한 뒤에만 활성화한다. 확인 전에는 Kakao 계열 경로만 제품 내부에 표시하고 TMAP은 외부 길찾기 전환으로만 제공한다.

> 사용자 일정에는 지도 타일·이미지, 공급자 장소 원문, 경로 폴리라인, 길안내 단계와 공급자 원문 응답을 저장하지 않는다. 자체 장소 ID, 방문 순서, 이동수단과 자체 검증 계획정보만 저장하고, 저장 동선을 다시 열 때 경로·거리·이동시간을 새로 계산한다.

> 지도·장소·경로 API 장애나 결과 없음이 발생해도 편집 중인 장소 목록과 방문 순서는 유지한다. 실패한 구간, 마지막 정상 계산시각과 재시도 행동을 표시하며, 승인된 TMAP 보조가 없으면 외부 TMAP 길찾기만 제공한다.

## 구현 전 확인 게이트

| 확인 항목 | 1차 상태 | 통과 조건 |
| --- | --- | --- |
| Kakao Map 단일 지도 UI | 확정 | Web SDK와 출처 표시 검증 |
| Kakao 도보·대중교통 경로 | 확정 | 실제 이천 구간 응답·오류 시나리오 검증 |
| Kakao Mobility 자차 경로 | 확정 | 키·쿼터·다중 경유지 범위 검증 |
| TMAP 외부 길찾기 | 선택 | 앱·웹 전환 방식과 실패 동작 검증 |
| TMAP 경로의 Kakao Map 교차 표시 | 미승인 | 양사 약관·라이선스·브랜드 조건의 서면 확인 |
| TMAP 대중교통 내부 보조 | 미승인 | 별도 상품 신청과 교차 표시 허용 범위 확인 |
| 공급자 원문 장기 저장 | 제외 | 별도 계약이 없는 한 구현하지 않음 |

## 최종 판정

- **Kakao Map만 지도 UI로 사용하는 구성:** 구현 가능
- **Kakao 계열 API로 도보·자차·대중교통 경로를 제공하는 구성:** 구현 가능
- **TMAP을 외부 길찾기 대체 행동으로 사용하는 구성:** 구현 가능하나 실제 앱·웹 전환 검증 필요
- **TMAP 경로를 Kakao Map 위에 표시하는 구성:** 공개 문서만으로 허용 여부를 확정할 수 없어 출시 전 서면 확인 필요
- **공급자 원문을 저장하지 않고 내부 계획정보만 저장한 뒤 재계산하는 구성:** 약관 위험을 줄이는 보수적 기본안

따라서 제품 문서는 **“Kakao Map 단일 지도 + Kakao 기본 경로 + 필요 시 승인된 TMAP 보조 또는 외부 전환”**으로 통일한다. TMAP 교차 표시는 승인 전 기능으로 간주하지 않는다.
