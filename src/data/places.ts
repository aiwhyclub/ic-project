import type {
  DayOfWeek,
  OpeningHours,
  PlaceCategory,
  PlacesBounds,
  VerifiedPlace,
} from "@/lib/domain/types";
import { CENTRAL_PLACES } from "./place-fixtures-central";
import { EAST_PLACES } from "./place-fixtures-east";
import { WEST_PLACES } from "./place-fixtures-west";

export const VERIFIED_PLACES: readonly VerifiedPlace[] = [
  ...WEST_PLACES,
  ...EAST_PLACES,
  ...CENTRAL_PLACES,
];

export function findPlace(id: string): VerifiedPlace | undefined {
  return VERIFIED_PLACES.find((place) => place.id === id);
}

export function getVerifiedPlaces(): readonly VerifiedPlace[] {
  return VERIFIED_PLACES;
}

export function searchPlaces(
  keyword: string,
  category?: PlaceCategory,
): readonly VerifiedPlace[] {
  const normalizedKeyword = keyword.trim().toLocaleLowerCase();

  return VERIFIED_PLACES.filter((place) => {
    if (category !== undefined && place.category !== category) {
      return false;
    }
    if (normalizedKeyword.length === 0) {
      return true;
    }

    const searchable = [
      place.name,
      place.categoryLabel,
      place.introduction,
      ...place.tags,
    ]
      .join(" ")
      .toLocaleLowerCase();

    return searchable.includes(normalizedKeyword);
  });
}

export function findPlacesInBounds(bounds: PlacesBounds): readonly VerifiedPlace[] {
  return VERIFIED_PLACES.filter((place) => {
    const { latitude, longitude } = place.coordinates;
    return (
      latitude >= bounds.south &&
      latitude <= bounds.north &&
      longitude >= bounds.west &&
      longitude <= bounds.east
    );
  });
}

export function getOpeningHours(placeId: string): readonly OpeningHours[] {
  return findPlace(placeId)?.openingHours ?? [];
}

export function getDayLabel(day: DayOfWeek): string {
  const labels: Readonly<Record<DayOfWeek, string>> = {
    monday: "월요일",
    tuesday: "화요일",
    wednesday: "수요일",
    thursday: "목요일",
    friday: "금요일",
    saturday: "토요일",
    sunday: "일요일",
  };
  return labels[day];
}

