import type {
  PlanBReason,
  PlanBReasonRule,
  TransportMode,
} from "@/lib/domain/types";

import type {
  PlanBAlternative,
  PlanBItinerary,
  PlanBItineraryStop,
  PlanBRouteSegment,
  PlanBStore,
} from "./plan-b-types";

const FIXTURE_CHECKED_AT = "2026-09-19";
const DEFAULT_TRANSPORT_MODE: TransportMode = "car";

export const PLAN_B_REASON_LABELS: Readonly<Record<PlanBReason, string>> = {
  closure: "휴관·운영 중단",
  "reservation-unavailable": "예약 불가",
  rain: "비·날씨",
  "market-day": "장날·혼잡",
  "time-shortage": "남은 시간 부족",
};

export const DEFAULT_PLAN_B_REASON_RULES: readonly PlanBReasonRule[] = [
  {
    reason: "closure",
    label: PLAN_B_REASON_LABELS.closure,
    description: "오늘 문을 닫았거나 예정된 운영을 이용하기 어렵습니다.",
    requiredTags: ["실내", "전시"],
    excludedTags: ["야외"],
    preferredCategories: ["museum", "culture", "ceramics"],
    maxTravelMinutes: 35,
  },
  {
    reason: "reservation-unavailable",
    label: PLAN_B_REASON_LABELS["reservation-unavailable"],
    description: "예약이 필요한 체험을 지금 바로 이용할 수 없습니다.",
    requiredTags: ["예약불필요"],
    excludedTags: ["예약필수"],
    preferredCategories: ["park", "market", "cafe"],
    maxTravelMinutes: 30,
  },
  {
    reason: "rain",
    label: PLAN_B_REASON_LABELS.rain,
    description: "비가 와서 야외 장소를 이어가기 어렵습니다.",
    requiredTags: ["실내"],
    excludedTags: ["야외"],
    preferredCategories: ["museum", "cafe", "ceramics"],
    maxTravelMinutes: 40,
  },
  {
    reason: "market-day",
    label: PLAN_B_REASON_LABELS["market-day"],
    description: "장날이나 혼잡으로 계획한 장소를 이용하기 어렵습니다.",
    requiredTags: ["분산"],
    excludedTags: ["혼잡"],
    preferredCategories: ["park", "museum", "culture"],
    maxTravelMinutes: 35,
  },
  {
    reason: "time-shortage",
    label: PLAN_B_REASON_LABELS["time-shortage"],
    description: "다음 이동까지 남은 시간이 짧습니다.",
    requiredTags: ["짧은 체류"],
    excludedTags: ["장거리"],
    preferredCategories: ["cafe", "park", "market"],
    maxTravelMinutes: 20,
  },
];

export const DEFAULT_PLAN_B_ITINERARY: PlanBItinerary = {
  id: "fixture-itinerary-family-day",
  title: "가족과 함께하는 이천 도자기 하루",
  transportMode: DEFAULT_TRANSPORT_MODE,
  stops: [
    {
      placeId: "place-ceramic-village",
      name: "도자예술마을",
      categoryLabel: "도자 체험",
      address: "경기 이천시 신둔면 도자예술로",
      dwellMinutes: 90,
      position: 1,
    },
    {
      placeId: "place-seolbong-park",
      name: "설봉공원",
      categoryLabel: "공원",
      address: "경기 이천시 경충대로2709번길",
      dwellMinutes: 60,
      position: 2,
    },
    {
      placeId: "place-central-market",
      name: "이천중앙시장",
      categoryLabel: "시장",
      address: "경기 이천시 중리천로",
      dwellMinutes: 75,
      position: 3,
    },
    {
      placeId: "place-rice-cafe",
      name: "이천 쌀 디저트 카페",
      categoryLabel: "카페",
      address: "경기 이천시 영창로",
      dwellMinutes: 50,
      position: 4,
    },
  ],
};

const DEFAULT_ALTERNATIVE_DATA: readonly PlanBAlternative[] = [
  {
    id: "place-ceramic-museum",
    name: "이천시립월전미술관",
    categoryLabel: "미술관",
    address: "경기 이천시 경충대로2709번길",
    reasons: ["closure", "rain"],
    whyRecommended: "실내 전시라 비가 와도 이용할 수 있고, 설봉공원 권역에서 이동 부담이 적습니다.",
    travelMode: DEFAULT_TRANSPORT_MODE,
    travelDistanceMeters: 2800,
    travelTimeMinutes: 8,
    hoursLabel: "10:00–18:00 · 월요일 휴관",
    operatingCondition: "예약 없이 관람 가능 · 운영시간은 기본 검증정보",
    informationStatus: "verified",
    lastCheckedAt: FIXTURE_CHECKED_AT,
  },
  {
    id: "place-seolbong-lake-gallery",
    name: "설봉호수 문화산책로",
    categoryLabel: "문화 산책",
    address: "경기 이천시 관고동 설봉공원 안",
    reasons: ["reservation-unavailable", "market-day"],
    whyRecommended: "별도 예약 없이 짧게 머물 수 있어 다음 일정이 밀렸을 때 회복하기 좋습니다.",
    travelMode: DEFAULT_TRANSPORT_MODE,
    travelDistanceMeters: 1100,
    travelTimeMinutes: 5,
    hoursLabel: "상시 개방 · 우천 시 일부 구간 주의",
    operatingCondition: "야외 장소 · 날씨와 현장 안전 상태를 확인하세요",
    informationStatus: "realtime",
    lastCheckedAt: FIXTURE_CHECKED_AT,
  },
  {
    id: "place-rice-dessert-lab",
    name: "이천 쌀 디저트 연구소",
    categoryLabel: "카페",
    address: "경기 이천시 중리동",
    reasons: ["time-shortage", "rain"],
    whyRecommended: "체류시간을 짧게 조정할 수 있고 실내에서 다음 이동을 준비할 수 있습니다.",
    travelMode: DEFAULT_TRANSPORT_MODE,
    travelDistanceMeters: 4200,
    travelTimeMinutes: 12,
    hoursLabel: "11:00–20:00 · 재료 소진 시 조기 마감",
    operatingCondition: "기본 운영시간 확인 · 실시간 연결 실패 시 기본정보 사용",
    informationStatus: "realtime-unavailable",
    lastCheckedAt: FIXTURE_CHECKED_AT,
  },
];

export const DEFAULT_PLAN_B_ALTERNATIVES: readonly PlanBAlternative[] = DEFAULT_ALTERNATIVE_DATA;

function createFixtureRouteSegments(stops: readonly PlanBItineraryStop[]): readonly PlanBRouteSegment[] {
  const segments: PlanBRouteSegment[] = [];

  for (let index = 0; index < stops.length - 1; index += 1) {
    const origin = stops[index];
    const destination = stops[index + 1];

    if (!origin || !destination) {
      continue;
    }

    segments.push({
      id: `fixture-segment-${origin.placeId}-${destination.placeId}`,
      position: origin.position,
      originPlaceId: origin.placeId,
      originName: origin.name,
      destinationPlaceId: destination.placeId,
      destinationName: destination.name,
      status: "ready",
      distanceMeters: 4200 + index * 900,
      durationMinutes: 12 + index * 4,
      calculatedAt: `${FIXTURE_CHECKED_AT}T09:30:00+09:00`,
    });
  }

  return segments;
}

export const createLocalPlanBRouteSegments = createFixtureRouteSegments;

export const DEFAULT_PLAN_B_STORE: PlanBStore = {
  initialItinerary: DEFAULT_PLAN_B_ITINERARY,
  reasonRules: DEFAULT_PLAN_B_REASON_RULES,
  alternatives: DEFAULT_PLAN_B_ALTERNATIVES,
  recommend: async () => DEFAULT_PLAN_B_ALTERNATIVES,
  recalculate: async ({ itinerary }) => createFixtureRouteSegments(itinerary.stops),
  saveReplacement: async () => undefined,
  deferPlace: async () => undefined,
  refreshLive: async (alternative) => ({
    ...alternative,
    informationStatus: "realtime",
    lastCheckedAt: FIXTURE_CHECKED_AT,
  }),
};
