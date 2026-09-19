import type {
  Coordinates,
  IsoDateTime,
  ItineraryStop,
  RouteCalculation,
  RouteCalculationFailure,
  RouteSegment,
  TransportMode,
  VerifiedPlace,
} from "./types";
import { DEMO_CALCULATED_AT } from "./constants";

type RouteProfile = {
  readonly averageSpeedKph: number;
  readonly distanceMultiplier: number;
  readonly minimumMinutes: number;
};

export type RouteCalculationOptions = {
  readonly failedSegmentIds?: readonly string[];
  readonly calculatedAt?: IsoDateTime;
};

const ROUTE_PROFILES: Readonly<Record<TransportMode, RouteProfile>> = {
  walk: { averageSpeedKph: 4.8, distanceMultiplier: 1.1, minimumMinutes: 3 },
  car: { averageSpeedKph: 28, distanceMultiplier: 1.25, minimumMinutes: 4 },
  transit: { averageSpeedKph: 20, distanceMultiplier: 1.35, minimumMinutes: 8 },
};

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

export function calculateDistanceMeters(
  origin: Coordinates,
  destination: Coordinates,
): number {
  const earthRadiusMeters = 6_371_000;
  const latitudeDelta = toRadians(destination.latitude - origin.latitude);
  const longitudeDelta = toRadians(destination.longitude - origin.longitude);
  const originLatitude = toRadians(origin.latitude);
  const destinationLatitude = toRadians(destination.latitude);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(originLatitude) *
      Math.cos(destinationLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;
  const arc = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

  return Math.round(earthRadiusMeters * arc);
}

export function calculateTravelMinutes(
  distanceMeters: number,
  transportMode: TransportMode,
): number {
  const profile = ROUTE_PROFILES[transportMode];
  const routedDistanceMeters = distanceMeters * profile.distanceMultiplier;
  const travelHours = routedDistanceMeters / 1000 / profile.averageSpeedKph;
  return Math.max(profile.minimumMinutes, Math.ceil(travelHours * 60));
}

const missingPlaceFailure = (placeId: string): RouteCalculationFailure => ({
  code: "missing-place",
  message: `검증된 장소 ${placeId}를 찾을 수 없습니다.`,
  retryable: false,
});

const unavailableFailure = (): RouteCalculationFailure => ({
  code: "provider-unavailable",
  message: "로컬 경로 계산을 사용할 수 없습니다.",
  retryable: true,
});

const createFailedSegment = (
  position: number,
  originPlaceId: string,
  originName: string,
  destinationPlaceId: string,
  destinationName: string,
  transportMode: TransportMode,
  calculatedAt: IsoDateTime,
  failure: RouteCalculationFailure,
): RouteSegment => ({
  id: `${originPlaceId}:${destinationPlaceId}`,
  position,
  originPlaceId,
  originName,
  destinationPlaceId,
  destinationName,
  transportMode,
  provider: "local-fixture",
  status: "failed",
  distanceMeters: 0,
  durationMinutes: 0,
  calculatedAt,
  failure,
});

export function calculateRouteSegment(
  origin: VerifiedPlace,
  destination: VerifiedPlace,
  transportMode: TransportMode,
  position = 1,
  calculatedAt: IsoDateTime = DEMO_CALCULATED_AT,
): RouteSegment {
  const distanceMeters = calculateDistanceMeters(origin.coordinates, destination.coordinates);
  const durationMinutes = calculateTravelMinutes(distanceMeters, transportMode);

  return {
    id: `${origin.id}:${destination.id}`,
    position,
    originPlaceId: origin.id,
    originName: origin.name,
    destinationPlaceId: destination.id,
    destinationName: destination.name,
    transportMode,
    provider: "local-fixture",
    status: "ready",
    distanceMeters,
    durationMinutes,
    calculatedAt,
    failure: null,
  };
}

export function calculateRouteSegments(
  placeIds: readonly string[],
  transportMode: TransportMode,
  places: readonly VerifiedPlace[],
  options: RouteCalculationOptions = {},
): readonly RouteSegment[] {
  const placeById = new Map<string, VerifiedPlace>();
  for (const place of places) {
    placeById.set(place.id, place);
  }

  const calculatedAt = options.calculatedAt ?? DEMO_CALCULATED_AT;
  const segments: RouteSegment[] = [];

  for (let index = 0; index < placeIds.length - 1; index += 1) {
    const originPlaceId = placeIds[index];
    const destinationPlaceId = placeIds[index + 1];
    if (originPlaceId === undefined || destinationPlaceId === undefined) {
      continue;
    }

    const segmentId = `${originPlaceId}:${destinationPlaceId}`;
    const origin = placeById.get(originPlaceId);
    const destination = placeById.get(destinationPlaceId);
    const failedByOption = options.failedSegmentIds?.includes(segmentId) ?? false;

    if (origin === undefined || destination === undefined) {
      segments.push(
        createFailedSegment(
          index + 1,
          originPlaceId,
          origin?.name ?? originPlaceId,
          destinationPlaceId,
          destination?.name ?? destinationPlaceId,
          transportMode,
          calculatedAt,
          missingPlaceFailure(origin === undefined ? originPlaceId : destinationPlaceId),
        ),
      );
      continue;
    }

    if (failedByOption) {
      segments.push(
        createFailedSegment(
          index + 1,
          origin.id,
          origin.name,
          destination.id,
          destination.name,
          transportMode,
          calculatedAt,
          unavailableFailure(),
        ),
      );
      continue;
    }

    segments.push(calculateRouteSegment(origin, destination, transportMode, index + 1, calculatedAt));
  }

  return segments;
}

export function calculateRoute(
  placeIds: readonly string[],
  transportMode: TransportMode,
  places: readonly VerifiedPlace[],
  options: RouteCalculationOptions = {},
): RouteCalculation {
  const calculatedAt = options.calculatedAt ?? DEMO_CALCULATED_AT;
  const segments = calculateRouteSegments(placeIds, transportMode, places, options);
  const successfulSegments = segments.filter((segment) => segment.status === "ready");

  return {
    transportMode,
    provider: "local-fixture",
    segments,
    totalDistanceMeters: successfulSegments.reduce(
      (total, segment) => total + segment.distanceMeters,
      0,
    ),
    totalDurationMinutes: successfulSegments.reduce(
      (total, segment) => total + segment.durationMinutes,
      0,
    ),
    calculatedAt,
  };
}

export function deriveRouteSegmentsForPlaces(
  placeIds: readonly string[],
  transportMode: TransportMode,
  places: readonly VerifiedPlace[],
  options: RouteCalculationOptions = {},
): readonly RouteSegment[] {
  return calculateRouteSegments(placeIds, transportMode, places, options);
}

export function routePlaceIds(stops: readonly ItineraryStop[]): readonly string[] {
  return [...stops]
    .sort((first, second) => first.position - second.position)
    .map((stop) => stop.placeId);
}

export function calculateItineraryRoute(
  stops: readonly ItineraryStop[],
  transportMode: TransportMode,
  places: readonly VerifiedPlace[],
  options: RouteCalculationOptions = {},
): RouteCalculation {
  return calculateRoute(routePlaceIds(stops), transportMode, places, options);
}

export function replaceItineraryStop(
  stops: readonly ItineraryStop[],
  blockedPlaceId: string,
  replacementPlaceId: string,
): readonly ItineraryStop[] {
  return stops.map((stop) =>
    stop.placeId === blockedPlaceId ? { ...stop, placeId: replacementPlaceId } : stop,
  );
}

