import type { Coordinates, IsoDate, PlaceCategory, TransportMode } from "./base";
import type { VerifiedPlace } from "./catalog";
import type { ItineraryStop, RouteSegment } from "./routes";

export type PlanBReason =
  | "closure"
  | "reservation-unavailable"
  | "rain"
  | "market-day"
  | "time-shortage";

export type PlanBReasonRule = {
  readonly reason: PlanBReason;
  readonly label: string;
  readonly description: string;
  readonly requiredTags: readonly string[];
  readonly excludedTags: readonly string[];
  readonly preferredCategories: readonly PlaceCategory[];
  readonly maxTravelMinutes: number | null;
};

export type PlanBLocationSource = "consented-current" | "manual-region" | "manual-place";

export type PlanBLocation = {
  readonly source: PlanBLocationSource;
  readonly label: string;
  readonly coordinates: Coordinates;
  readonly consentNotice: string;
};

export type PlanBContext = {
  readonly blockedPlaceId: string;
  readonly reasons: readonly PlanBReason[];
  readonly currentPlaceId: string | null;
  readonly currentCoordinates: Coordinates | null;
  readonly transportMode: TransportMode;
  readonly remainingMinutes: number | null;
  readonly excludedPlaceIds: readonly string[];
};

export type PlanBInformationStatus = "verified" | "realtime" | "realtime-unavailable";

export type PlanBRecommendation = {
  readonly rank: number;
  readonly place: VerifiedPlace;
  readonly placeId: string;
  readonly reasons: readonly PlanBReason[];
  readonly whyRecommended: string;
  readonly travelMode: TransportMode;
  readonly travelDistanceMeters: number;
  readonly travelTimeMinutes: number;
  readonly operatingCondition: string;
  readonly informationStatus: PlanBInformationStatus;
  readonly lastCheckedAt: IsoDate;
  readonly routeSegment: RouteSegment;
};

export type PlanBReplacement = {
  readonly blockedPlaceId: string;
  readonly replacementPlaceId: string;
  readonly stops: readonly ItineraryStop[];
};

export type PlanBRouteCandidate = {
  readonly place: VerifiedPlace;
  readonly routeSegment: RouteSegment;
  readonly score: number;
};
