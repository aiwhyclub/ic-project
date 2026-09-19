import {
  PLAN_B_REASON_LABELS,
  DEMO_CHECKED_AT,
} from "@/lib/domain/constants";
import {
  normalizePlanBReasons,
  recommendPlanBPlaces,
  replacePlanBStop,
} from "@/lib/domain/plan-b";
import type {
  ItineraryStop,
  PlanBReason,
  PlanBReasonRule,
  PlanBRecommendation,
  TransportMode,
} from "@/lib/domain/types";
import { VERIFIED_PLACES } from "./places";

export const PLAN_B_RULES: readonly PlanBReasonRule[] = [
  {
    reason: "closure",
    label: PLAN_B_REASON_LABELS.closure,
    description: "현재 장소가 휴관·휴무라 방문할 수 없습니다.",
    requiredTags: [],
    excludedTags: [],
    preferredCategories: ["museum", "culture", "cafe", "restaurant", "market"],
    maxTravelMinutes: null,
  },
  {
    reason: "reservation-unavailable",
    label: PLAN_B_REASON_LABELS["reservation-unavailable"],
    description: "예약이 필요한 체험의 잔여 자리가 없습니다.",
    requiredTags: ["walk-in"],
    excludedTags: [],
    preferredCategories: ["market", "cafe", "culture", "restaurant"],
    maxTravelMinutes: null,
  },
  {
    reason: "rain",
    label: PLAN_B_REASON_LABELS.rain,
    description: "비가 와서 야외 장소를 이용하기 어렵습니다.",
    requiredTags: ["indoor"],
    excludedTags: ["outdoor"],
    preferredCategories: ["museum", "ceramics", "culture", "cafe", "restaurant"],
    maxTravelMinutes: null,
  },
  {
    reason: "market-day",
    label: PLAN_B_REASON_LABELS["market-day"],
    description: "장날·마감 시간과 맞지 않아 다음 장소가 필요합니다.",
    requiredTags: ["indoor"],
    excludedTags: [],
    preferredCategories: ["culture", "museum", "cafe", "restaurant"],
    maxTravelMinutes: null,
  },
  {
    reason: "time-shortage",
    label: PLAN_B_REASON_LABELS["time-shortage"],
    description: "남은 시간 안에 이동하고 둘러볼 장소가 필요합니다.",
    requiredTags: ["walk-in"],
    excludedTags: [],
    preferredCategories: ["cafe", "culture", "market", "park"],
    maxTravelMinutes: 25,
  },
];

export const PLAN_B_REASON_OPTIONS: readonly {
  readonly value: PlanBReason;
  readonly label: string;
  readonly description: string;
}[] = PLAN_B_RULES.map((rule) => ({
  value: rule.reason,
  label: rule.label,
  description: rule.description,
}));

export function getPlanBRecommendations(
  excludedPlaceId: string,
  reasons: PlanBReason | readonly PlanBReason[] = [],
  transportMode: TransportMode = "transit",
): readonly PlanBRecommendation[] {
  const normalizedReasons = normalizePlanBReasons(reasons);
  return recommendPlanBPlaces(
    {
      blockedPlaceId: excludedPlaceId,
      reasons: normalizedReasons,
      currentPlaceId: null,
      currentCoordinates: null,
      transportMode,
      remainingMinutes: null,
      excludedPlaceIds: [excludedPlaceId],
    },
    VERIFIED_PLACES,
    PLAN_B_RULES,
  );
}

export function replacePlaceInItinerary(
  stops: readonly ItineraryStop[],
  excludedPlaceId: string,
  replacementPlaceId: string,
): readonly ItineraryStop[] {
  return replacePlanBStop(stops, excludedPlaceId, replacementPlaceId);
}

export function getPlanBCheckedAt(): string {
  return DEMO_CHECKED_AT;
}

