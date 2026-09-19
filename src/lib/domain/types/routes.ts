import type { AudienceType, IsoDate, IsoDateTime, TransportMode } from "./base";
import type { CuratedRoute, VerifiedPlace } from "./catalog";

export type ItineraryStop = {
  readonly placeId: string;
  readonly position: number;
  readonly dwellMinutes: number;
};

export type ItineraryDraft = {
  readonly id: string;
  readonly sourceRouteId: string | null;
  readonly title: string;
  readonly travelDate: IsoDate | null;
  readonly companion: AudienceType;
  readonly transportMode: TransportMode;
  readonly stops: readonly ItineraryStop[];
};

export type ItinerarySavePayload = {
  readonly sourceRouteId: string | null;
  readonly title: string;
  readonly travelDate: IsoDate | null;
  readonly companion: AudienceType;
  readonly transportMode: TransportMode;
  readonly stops: readonly ItineraryStop[];
};

export type RouteSegmentStatus = "pending" | "ready" | "failed";

export type RouteCalculationFailure = {
  readonly code: "missing-place" | "provider-unavailable";
  readonly message: string;
  readonly retryable: boolean;
};

export type RouteSegment = {
  readonly id: string;
  readonly position: number;
  readonly originPlaceId: string;
  readonly originName: string;
  readonly destinationPlaceId: string;
  readonly destinationName: string;
  readonly transportMode: TransportMode;
  readonly provider: "local-fixture";
  readonly status: RouteSegmentStatus;
  readonly distanceMeters: number;
  readonly durationMinutes: number;
  readonly calculatedAt: IsoDateTime | null;
  readonly failure: RouteCalculationFailure | null;
};

export type RouteCalculation = {
  readonly transportMode: TransportMode;
  readonly provider: "local-fixture";
  readonly segments: readonly RouteSegment[];
  readonly totalDistanceMeters: number;
  readonly totalDurationMinutes: number;
  readonly calculatedAt: IsoDateTime;
};

export type CourseSort = "match" | "duration" | "recent";

export type CourseFilters = {
  readonly keyword?: string;
  readonly audience?: AudienceType;
  readonly audiences?: readonly AudienceType[];
  readonly transportMode?: TransportMode;
  readonly transportModes?: readonly TransportMode[];
  readonly minDurationMinutes?: number;
  readonly maxDurationMinutes?: number;
  readonly interestTags?: readonly string[];
};

export type CourseSearchResult = {
  readonly route: CuratedRoute;
  readonly matchScore: number;
  readonly matchedTerms: readonly string[];
};

export type CourseSearchState = {
  readonly filters: CourseFilters;
  readonly sort: CourseSort;
  readonly resultCount: number;
  readonly hasResults: boolean;
};

export type RoutePlaceLookup = {
  readonly place: VerifiedPlace;
  readonly position: number;
};

