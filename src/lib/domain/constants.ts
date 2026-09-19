import type {
  AudienceType,
  DayOfWeek,
  LicenseInfo,
  PlanBReason,
  PlaceCategory,
  SourceReference,
  TransportMode,
} from "./types";

export const TRANSPORT_LABELS: Readonly<Record<TransportMode, string>> = {
  walk: "도보",
  car: "자차",
  transit: "대중교통",
};

export const AUDIENCE_LABELS: Readonly<Record<AudienceType, string>> = {
  friends: "친구·연인",
  couple: "데이트 여행자",
  family: "아이 동반 가족",
  "first-visit": "이천 첫 방문자",
};

export const CATEGORY_LABELS: Readonly<Record<PlaceCategory, string>> = {
  park: "공원·산책",
  market: "시장",
  museum: "박물관·전시",
  ceramics: "도자·공예",
  cafe: "카페",
  restaurant: "식사",
  culture: "문화 공간",
  experience: "체험",
};

export const DAY_LABELS: Readonly<Record<DayOfWeek, string>> = {
  monday: "월요일",
  tuesday: "화요일",
  wednesday: "수요일",
  thursday: "목요일",
  friday: "금요일",
  saturday: "토요일",
  sunday: "일요일",
};

export const PLAN_B_REASON_LABELS: Readonly<Record<PlanBReason, string>> = {
  closure: "휴관·휴무",
  "reservation-unavailable": "예약 불가",
  rain: "비·날씨",
  "market-day": "장날·마감",
  "time-shortage": "남은 시간 부족",
};

export const DEMO_CHECKED_AT = "2026-09-19";
export const DEMO_CALCULATED_AT = "2026-09-19T09:00:00+09:00";

export const DEMO_SOURCE: SourceReference = {
  publisher: "이천 세이브포인트",
  title: "로컬 데모 검증 데이터",
  url: "https://example.com/icheon-savepoint/demo-source",
  checkedAt: DEMO_CHECKED_AT,
};

export const DEMO_LICENSE: LicenseInfo = {
  name: "local-demo-fixture",
  attribution: "이천 세이브포인트 로컬 데모 데이터",
  usage: "학습·로컬 데모 전용. 공개 전 원출처와 사진 사용권을 재확인해야 합니다.",
};

export const PLACEHOLDER_LICENSE: LicenseInfo = {
  name: "generated-placeholder",
  attribution: "이천 세이브포인트 생성형 플레이스홀더",
  usage: "로컬 데모 UI 확인용. 실제 서비스 출시 전 검증된 사진으로 교체해야 합니다.",
};

