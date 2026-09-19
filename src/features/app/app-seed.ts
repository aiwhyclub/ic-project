import type {
  Itinerary,
  Place,
  PlanStop,
  RouteSegment,
  SegmentStatus,
  TransportMode,
  WorkingPlan,
} from "./app-types";
import { CURATED_ROUTES, VERIFIED_PLACES } from "@/data";
import type { CuratedRoute } from "@/lib/domain/types";

export const SEED_PLACES: readonly Place[] = VERIFIED_PLACES.map((place) => ({
  id: place.id,
  name: place.name,
  category: place.categoryLabel,
  address: place.address,
  latitude: place.coordinates.latitude,
  longitude: place.coordinates.longitude,
  defaultDwellMinutes: place.defaultDwellMinutes,
  description: place.introduction,
  sourceUrl: place.source.url,
  verifiedAt: place.checkedAt,
}));

export function currentTime(): string {
  return new Date().toISOString();
}

function makeUuid(): string {
  const bytes = new Uint8Array(16);
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }
  const versionByte = bytes[6] ?? 0;
  const variantByte = bytes[8] ?? 0;
  bytes[6] = (versionByte & 0x0f) | 0x40;
  bytes[8] = (variantByte & 0x3f) | 0x80;
  const hex = Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function placeById(placeId: string): Place | null {
  return SEED_PLACES.find((place) => place.id === placeId) ?? null;
}

function createStops(route: CuratedRoute): readonly PlanStop[] {
  return route.stops.flatMap((routeStop, index) => {
    const place = placeById(routeStop.placeId);
    if (place === null) {
      return [];
    }
    return [{ placeId: place.id, position: index, dwellMinutes: routeStop.dwellMinutes }];
  });
}

function distanceMeters(from: Place, to: Place): number {
  const latitudeDistance = (from.latitude - to.latitude) * 111_000;
  const longitudeDistance =
    (from.longitude - to.longitude) * 111_000 * Math.cos((from.latitude * Math.PI) / 180);
  return Math.max(400, Math.round(Math.sqrt(latitudeDistance ** 2 + longitudeDistance ** 2)));
}

function durationMinutes(distance: number, transportMode: TransportMode): number {
  const metersPerMinute: Record<TransportMode, number> = { walk: 80, car: 420, transit: 260 };
  return Math.max(4, Math.round(distance / metersPerMinute[transportMode]));
}

export function createSegments(
  stops: readonly PlanStop[],
  transportMode: TransportMode,
  status: SegmentStatus = "ready",
  calculatedAt: string | null = currentTime(),
): readonly RouteSegment[] {
  return stops.slice(0, -1).flatMap((stop, index) => {
    const nextStop = stops[index + 1];
    if (nextStop === undefined) {
      return [];
    }
    const from = placeById(stop.placeId);
    const to = placeById(nextStop.placeId);
    if (from === null || to === null) {
      return [];
    }
    const distance = distanceMeters(from, to);
    return [{
      id: `segment-${from.id}-${to.id}`,
      fromPlaceId: from.id,
      toPlaceId: to.id,
      distanceMeters: distance,
      durationMinutes: durationMinutes(distance, transportMode),
      status,
      errorMessage: null,
      lastCalculatedAt: calculatedAt,
    }];
  });
}

function createWorkingPlan(route: CuratedRoute): WorkingPlan {
  const stops = createStops(route);
  return {
    id: route.id,
    sourceItineraryId: null,
    title: route.title,
    travelDate: "2026-10-03",
    companionType: route.audienceLabel,
    transportMode: route.transportMode,
    stops,
    segments: createSegments(stops, route.transportMode),
    updatedAt: currentTime(),
  };
}

export const DEFAULT_WORKING_PLANS: readonly WorkingPlan[] = CURATED_ROUTES.map(createWorkingPlan);

export function clonePlan(plan: WorkingPlan): WorkingPlan {
  return {
    ...plan,
    stops: plan.stops.map((stop) => ({ ...stop })),
    segments: plan.segments.map((segment) => ({ ...segment })),
  };
}

export function normalizeStops(stops: readonly PlanStop[]): readonly PlanStop[] {
  return stops.map((stop, index) => ({ ...stop, position: index }));
}

export function markPlanSegmentsIdle(plan: WorkingPlan): WorkingPlan {
  return {
    ...plan,
    updatedAt: currentTime(),
    segments: plan.segments.map((segment) => ({ ...segment, status: "idle", errorMessage: null })),
  };
}

export function planFromItinerary(itinerary: Itinerary): WorkingPlan {
  return {
    id: `editor-${itinerary.id}`,
    sourceItineraryId: itinerary.id,
    title: itinerary.title,
    travelDate: itinerary.travelDate,
    companionType: itinerary.companionType,
    transportMode: itinerary.transportMode,
    stops: itinerary.stops.map((stop) => ({ ...stop })),
    segments: createSegments(itinerary.stops, itinerary.transportMode, "idle", null),
    updatedAt: currentTime(),
  };
}

export function planToItinerary(plan: WorkingPlan, userId: string, existing: Itinerary | null): Itinerary {
  return {
    id: existing?.id ?? makeUuid(),
    userId,
    title: plan.title,
    travelDate: plan.travelDate,
    companionType: plan.companionType,
    transportMode: plan.transportMode,
    status: "confirmed",
    stops: normalizeStops(plan.stops).map((stop) => ({ ...stop })),
    createdAt: existing?.createdAt ?? currentTime(),
    updatedAt: currentTime(),
  };
}
