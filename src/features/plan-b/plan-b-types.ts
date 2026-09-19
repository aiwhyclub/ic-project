import type {
  PlanBInformationStatus,
  PlanBReason,
  PlanBReasonRule,
  RouteSegmentStatus,
  TransportMode,
} from "@/lib/domain/types";

export type PlanBLocationSelection = {
  readonly source: "consented-current" | "manual-region" | "manual-place";
  readonly label: string;
  readonly placeId: string | null;
};

export type PlanBItineraryStop = {
  readonly placeId: string;
  readonly name: string;
  readonly categoryLabel: string;
  readonly address: string;
  readonly dwellMinutes: number;
  readonly position: number;
};

export type PlanBItinerary = {
  readonly id: string;
  readonly title: string;
  readonly transportMode: TransportMode;
  readonly stops: readonly PlanBItineraryStop[];
};

export type PlanBAlternative = {
  readonly id: string;
  readonly name: string;
  readonly categoryLabel: string;
  readonly address: string;
  readonly reasons: readonly PlanBReason[];
  readonly whyRecommended: string;
  readonly travelMode: TransportMode;
  readonly travelDistanceMeters: number;
  readonly travelTimeMinutes: number;
  readonly hoursLabel: string;
  readonly operatingCondition: string;
  readonly informationStatus: PlanBInformationStatus;
  readonly lastCheckedAt: string;
};

export type PlanBRouteSegment = {
  readonly id: string;
  readonly position: number;
  readonly originPlaceId: string;
  readonly originName: string;
  readonly destinationPlaceId: string;
  readonly destinationName: string;
  readonly status: RouteSegmentStatus;
  readonly distanceMeters: number;
  readonly durationMinutes: number;
  readonly calculatedAt: string | null;
};

export type PlanBRecommendationRequest = {
  readonly blockedPlaceId: string;
  readonly reasons: readonly PlanBReason[];
  readonly location: PlanBLocationSelection;
  readonly transportMode: TransportMode;
  readonly excludedPlaceIds: readonly string[];
  readonly remainingMinutes: number | null;
};

export type PlanBRouteRequest = {
  readonly itinerary: PlanBItinerary;
  readonly changedStopId: string;
  readonly replacementPlaceId: string;
  readonly recalculateFromPosition: number;
};

export type PlanBSaveRequest = {
  readonly operationId: string;
  readonly itineraryId: string;
  readonly replacedPlaceId: string;
  readonly replacementPlaceId: string;
  readonly stops: readonly PlanBItineraryStop[];
};

export type PlanBDeferRequest = {
  readonly operationId: string;
  readonly itineraryId: string;
  readonly placeId: string;
  readonly placeName: string;
};

export type PlanBStore = {
  readonly initialItinerary: PlanBItinerary;
  readonly reasonRules: readonly PlanBReasonRule[];
  readonly alternatives: readonly PlanBAlternative[];
  readonly recommend?: (
    request: PlanBRecommendationRequest,
  ) => Promise<readonly PlanBAlternative[]>;
  readonly recalculate?: (
    request: PlanBRouteRequest,
  ) => Promise<readonly PlanBRouteSegment[]>;
  readonly saveReplacement?: (request: PlanBSaveRequest) => Promise<void>;
  readonly deferPlace?: (request: PlanBDeferRequest) => Promise<void>;
  readonly refreshLive?: (
    alternative: PlanBAlternative,
  ) => Promise<PlanBAlternative>;
};
