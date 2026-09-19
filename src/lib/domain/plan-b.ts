import { DEMO_CALCULATED_AT, PLAN_B_REASON_LABELS } from "./constants";
import {
  calculateDistanceMeters,
  calculateRouteSegment,
  calculateTravelMinutes,
} from "./routes";
import type {
  Coordinates,
  PlanBContext,
  PlanBRecommendation,
  PlanBReason,
  PlanBReasonRule,
  RouteSegment,
  VerifiedPlace,
} from "./types";

const hasAllTags = (place: VerifiedPlace, tags: readonly string[]): boolean =>
  tags.every((tag) => place.tags.includes(tag));

const hasAnyTag = (place: VerifiedPlace, tags: readonly string[]): boolean =>
  tags.some((tag) => place.tags.includes(tag));

const joinLabels = (reasons: readonly PlanBReason[]): string =>
  reasons.map((reason) => PLAN_B_REASON_LABELS[reason]).join(", ");

const getAnchorCoordinates = (
  context: PlanBContext,
  blockedPlace: VerifiedPlace | undefined,
): Coordinates | null => {
  if (context.currentCoordinates !== null) {
    return context.currentCoordinates;
  }
  if (blockedPlace !== undefined) {
    return blockedPlace.coordinates;
  }
  return null;
};

const getRouteSegment = (
  anchorCoordinates: Coordinates,
  anchorPlace: VerifiedPlace | undefined,
  candidate: VerifiedPlace,
  context: PlanBContext,
): RouteSegment => {
  if (anchorPlace !== undefined) {
    return calculateRouteSegment(
      anchorPlace,
      candidate,
      context.transportMode,
      1,
      DEMO_CALCULATED_AT,
    );
  }

  const distanceMeters = calculateDistanceMeters(anchorCoordinates, candidate.coordinates);
  return {
    id: `current:${candidate.id}`,
    position: 1,
    originPlaceId: "current-location",
    originName: "현재 위치",
    destinationPlaceId: candidate.id,
    destinationName: candidate.name,
    transportMode: context.transportMode,
    provider: "local-fixture",
    status: "ready",
    distanceMeters,
    durationMinutes: calculateTravelMinutes(distanceMeters, context.transportMode),
    calculatedAt: DEMO_CALCULATED_AT,
    failure: null,
  };
};

const mergeRuleValues = <T>(
  rules: readonly PlanBReasonRule[],
  pick: (rule: PlanBReasonRule) => readonly T[],
): readonly T[] => {
  const values: T[] = [];
  for (const rule of rules) {
    for (const value of pick(rule)) {
      if (!values.includes(value)) {
        values.push(value);
      }
    }
  }
  return values;
};

const relevantRules = (
  reasons: readonly PlanBReason[],
  rules: readonly PlanBReasonRule[],
): readonly PlanBReasonRule[] => rules.filter((rule) => reasons.includes(rule.reason));

export function normalizePlanBReasons(
  reasons: PlanBReason | readonly PlanBReason[],
): readonly PlanBReason[] {
  const values = typeof reasons === "string" ? [reasons] : reasons;
  return values.length === 0 ? ["closure"] : [...new Set(values)];
}

export function recommendPlanBPlaces(
  context: PlanBContext,
  places: readonly VerifiedPlace[],
  rules: readonly PlanBReasonRule[],
): readonly PlanBRecommendation[] {
  const blockedPlace = places.find((place) => place.id === context.blockedPlaceId);
  const anchorPlace =
    context.currentPlaceId === null
      ? blockedPlace
      : places.find((place) => place.id === context.currentPlaceId);
  const anchorCoordinates = getAnchorCoordinates(context, blockedPlace);
  const reasons: readonly PlanBReason[] =
    context.reasons.length === 0 ? ["closure"] : context.reasons;
  const activeRules = relevantRules(reasons, rules);
  const requiredTags = mergeRuleValues(activeRules, (rule) => rule.requiredTags);
  const excludedTags = mergeRuleValues(activeRules, (rule) => rule.excludedTags);
  const preferredCategories = mergeRuleValues(activeRules, (rule) => rule.preferredCategories);
  const maxTravelMinutes = activeRules
    .map((rule) => rule.maxTravelMinutes)
    .filter((value): value is number => value !== null)
    .reduce<number | null>((current, value) => (current === null ? value : Math.min(current, value)), null);

  if (anchorCoordinates === null) {
    return [];
  }

  const excluded = new Set([context.blockedPlaceId, ...context.excludedPlaceIds]);
  const scored = places
    .filter((place) => !excluded.has(place.id))
    .map((place) => {
      const routeSegment = getRouteSegment(anchorCoordinates, anchorPlace, place, context);
      const requiredMatch = hasAllTags(place, requiredTags);
      const excludedMatch = hasAnyTag(place, excludedTags);
      const preferredCategory = preferredCategories.includes(place.category);
      const withinTime = maxTravelMinutes === null || routeSegment.durationMinutes <= maxTravelMinutes;
      const score =
        (requiredMatch ? 50 : 0) +
        (preferredCategory ? 25 : 0) +
        (withinTime ? 20 : 0) +
        (place.reservation.required ? 0 : 5) -
        (excludedMatch ? 100 : 0) -
        routeSegment.durationMinutes / 100;

      return { place, routeSegment, score, excludedMatch };
    })
    .filter((candidate) => !candidate.excludedMatch)
    .sort((first, second) => {
      if (first.score !== second.score) {
        return second.score - first.score;
      }
      if (first.routeSegment.durationMinutes !== second.routeSegment.durationMinutes) {
        return first.routeSegment.durationMinutes - second.routeSegment.durationMinutes;
      }
      return first.place.name < second.place.name ? -1 : first.place.name === second.place.name ? 0 : 1;
    });

  const fallbackCandidates = places
    .filter((place) => !excluded.has(place.id) && !scored.some((candidate) => candidate.place.id === place.id))
    .map((place) => {
      const routeSegment = getRouteSegment(anchorCoordinates, anchorPlace, place, context);
      return { place, routeSegment, score: -routeSegment.durationMinutes };
    })
    .sort((first, second) => first.routeSegment.durationMinutes - second.routeSegment.durationMinutes);

  const selected = [...scored, ...fallbackCandidates].slice(0, 3);
  const reasonLabel = joinLabels(reasons);

  return selected.map((candidate, index) => ({
    rank: index + 1,
    place: candidate.place,
    placeId: candidate.place.id,
    reasons,
    whyRecommended: `${reasonLabel} 상황에 ${candidate.place.recommendationReason}`,
    travelMode: context.transportMode,
    travelDistanceMeters: candidate.routeSegment.distanceMeters,
    travelTimeMinutes: candidate.routeSegment.durationMinutes,
    operatingCondition: candidate.place.reservation.required
      ? `예약 필요: ${candidate.place.reservation.note}`
      : `운영 확인: ${candidate.place.openingHours[0]?.note ?? "방문 전 확인"}`,
    informationStatus: "verified",
    lastCheckedAt: candidate.place.checkedAt,
    routeSegment: candidate.routeSegment,
  }));
}

export function replacePlanBStop(
  stops: readonly { readonly placeId: string; readonly position: number; readonly dwellMinutes: number }[],
  blockedPlaceId: string,
  replacementPlaceId: string,
): readonly { readonly placeId: string; readonly position: number; readonly dwellMinutes: number }[] {
  return stops.map((stop) =>
    stop.placeId === blockedPlaceId ? { ...stop, placeId: replacementPlaceId } : stop,
  );
}
