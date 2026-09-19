export type IsoDate = string;
export type IsoDateTime = string;

export type Coordinates = {
  readonly latitude: number;
  readonly longitude: number;
};

export type TransportMode = "walk" | "car" | "transit";

export type AudienceType = "friends" | "couple" | "family" | "first-visit";

export type PlaceCategory =
  | "park"
  | "market"
  | "museum"
  | "ceramics"
  | "cafe"
  | "restaurant"
  | "culture"
  | "experience";

export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type SourceReference = {
  readonly publisher: string;
  readonly title: string;
  readonly url: string;
  readonly checkedAt: IsoDate;
};

export type LicenseInfo = {
  readonly name: string;
  readonly attribution: string;
  readonly usage: string;
};

export type PlacePhoto = {
  readonly id: string;
  readonly src: string;
  readonly alt: string;
  readonly source: SourceReference;
  readonly license: LicenseInfo;
};

export type OpeningHours = {
  readonly day: DayOfWeek;
  readonly opensAt: string | null;
  readonly closesAt: string | null;
  readonly note: string;
};

export type ReservationPolicy = {
  readonly required: boolean;
  readonly note: string;
};

export type VerificationRecord = {
  readonly status: "verified-fixture";
  readonly source: SourceReference;
  readonly license: LicenseInfo;
  readonly checkedAt: IsoDate;
};

export type PlacesBounds = {
  readonly north: number;
  readonly south: number;
  readonly east: number;
  readonly west: number;
};

