import { CURATED_ROUTES } from "@/data/routes";
import { VERIFIED_PLACES } from "@/data/places";
import type { AudienceType, CuratedRoute, VerifiedPlace } from "@/lib/domain/types";

export type TransportMode = "walk" | "transit" | "car";
export type CompanionType = "family" | "couple" | "solo" | "friends";
export type InterestTag = "ceramics" | "nature" | "food" | "market" | "slow";

export type PublicPlace = Readonly<{
  id: string;
  name: string;
  category: string;
  area: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  openingHours: string;
  closedDays: string;
  marketDays: string;
  reservationRequired: boolean;
  reservationNote: string;
  parkingInfo: string;
  defaultDwellMinutes: number;
  sourceName: string;
  sourceUrl: string;
  verifiedAt: string;
  licenseSource: string;
  intro: string;
  recommendationReason: string;
  mediaAlt: string;
  supportsRealtime: boolean;
  realtimeUpdatedAt: string | null;
}>;

export type PublicCuration = Readonly<{
  id: string;
  title: string;
  audienceType: string;
  companionType: CompanionType;
  transportMode: TransportMode;
  durationMinutes: number;
  interestTags: readonly InterestTag[];
  placeIds: readonly string[];
  recommendationReason: string;
  isFallback: boolean;
  publishedAt: string;
  fitScore: number;
}>;

function formatOpeningHours(place: VerifiedPlace): string {
  const firstDay = place.openingHours[0];
  if (firstDay === undefined) return "운영정보 확인 필요";
  return firstDay.opensAt && firstDay.closesAt ? `${firstDay.opensAt}–${firstDay.closesAt}` : firstDay.note;
}

function toPublicPlace(place: VerifiedPlace): PublicPlace {
  const firstPhoto = place.photos[0];
  return {
    id: place.id,
    name: place.name,
    category: place.categoryLabel,
    area: place.address.split(" ").slice(1, 3).join(" ") || "이천",
    address: place.address,
    latitude: place.coordinates.latitude,
    longitude: place.coordinates.longitude,
    phone: place.phone,
    openingHours: formatOpeningHours(place),
    closedDays: place.closedDays.length > 0 ? place.closedDays.join(" · ") : "없음",
    marketDays: place.marketDays.length > 0 ? place.marketDays.join(" · ") : "해당 없음",
    reservationRequired: place.reservation.required,
    reservationNote: place.reservation.note,
    parkingInfo: place.parkingInfo,
    defaultDwellMinutes: place.defaultDwellMinutes,
    sourceName: place.source.publisher,
    sourceUrl: place.source.url,
    verifiedAt: place.checkedAt,
    licenseSource: `${place.license.name} · ${place.license.attribution}`,
    intro: place.introduction,
    recommendationReason: place.recommendationReason,
    mediaAlt: firstPhoto?.alt ?? `${place.name} 대표 이미지`,
    supportsRealtime: place.category === "park" || place.category === "museum",
    realtimeUpdatedAt: place.category === "park" || place.category === "museum" ? `${place.checkedAt} 10:00` : null,
  };
}

function toInterestTags(tags: readonly string[]): readonly InterestTag[] {
  const text = tags.join(" ");
  const values: InterestTag[] = [];
  if (text.includes("도자") || text.includes("체험")) values.push("ceramics");
  if (text.includes("산책") || text.includes("호수")) values.push("nature");
  if (text.includes("카페") || text.includes("식사") || text.includes("먹")) values.push("food");
  if (text.includes("시장")) values.push("market");
  if (text.includes("로컬") || text.includes("가족") || text.includes("친구")) values.push("slow");
  return values.length > 0 ? values : ["slow"];
}

function toCompanionType(audience: AudienceType): CompanionType {
  if (audience === "family") return "family";
  if (audience === "couple") return "couple";
  if (audience === "friends") return "friends";
  return "solo";
}

function toPublicCuration(route: CuratedRoute, index: number): PublicCuration {
  return {
    id: route.id,
    title: route.title,
    audienceType: route.audienceLabel,
    companionType: toCompanionType(route.audience),
    transportMode: route.transportMode,
    durationMinutes: route.durationMinutes,
    interestTags: toInterestTags(route.interestTags),
    placeIds: route.stops.map((stop) => stop.placeId),
    recommendationReason: route.recommendationReason,
    isFallback: route.isFallback,
    publishedAt: route.checkedAt,
    fitScore: 96 - index * 4,
  };
}

export const PUBLIC_PLACES: readonly PublicPlace[] = VERIFIED_PLACES.map(toPublicPlace);
export const PUBLIC_CURATIONS: readonly PublicCuration[] = CURATED_ROUTES.map(toPublicCuration);

export function getPublicPlace(placeId: string): PublicPlace | undefined {
  return PUBLIC_PLACES.find((place) => place.id === placeId);
}

export function getCurationPlaces(curation: PublicCuration): readonly PublicPlace[] {
  return curation.placeIds
    .map((placeId) => getPublicPlace(placeId))
    .filter((place): place is PublicPlace => place !== undefined);
}

export { COMPANION_LABELS, INTEREST_LABELS, TRANSPORT_LABELS } from "@/features/public/public-labels";
