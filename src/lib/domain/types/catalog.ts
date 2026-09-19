import type {
  AudienceType,
  Coordinates,
  IsoDate,
  LicenseInfo,
  OpeningHours,
  PlaceCategory,
  PlacePhoto,
  ReservationPolicy,
  SourceReference,
  TransportMode,
  VerificationRecord,
} from "./base";

export type VerifiedPlace = {
  readonly id: string;
  readonly name: string;
  readonly category: PlaceCategory;
  readonly categoryLabel: string;
  readonly coordinates: Coordinates;
  readonly address: string;
  readonly phone: string;
  readonly introduction: string;
  readonly tags: readonly string[];
  readonly openingHours: readonly OpeningHours[];
  readonly closedDays: readonly string[];
  readonly marketDays: readonly string[];
  readonly reservation: ReservationPolicy;
  readonly parkingInfo: string;
  readonly defaultDwellMinutes: number;
  readonly recommendationReason: string;
  readonly photos: readonly PlacePhoto[];
  readonly source: SourceReference;
  readonly license: LicenseInfo;
  readonly checkedAt: IsoDate;
  readonly verification: VerificationRecord;
};

export type CuratedRouteStop = {
  readonly placeId: string;
  readonly position: number;
  readonly dwellMinutes: number;
  readonly stopReason: string;
};

export type CuratedRoute = {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly audience: AudienceType;
  readonly audienceLabel: string;
  readonly transportMode: TransportMode;
  readonly durationMinutes: number;
  readonly interestTags: readonly string[];
  readonly recommendationReason: string;
  readonly stops: readonly CuratedRouteStop[];
  readonly source: SourceReference;
  readonly license: LicenseInfo;
  readonly checkedAt: IsoDate;
  readonly isFallback: boolean;
};
