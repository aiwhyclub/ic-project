import {
  CATEGORY_LABELS,
  DEMO_CHECKED_AT,
  DEMO_LICENSE,
  DEMO_SOURCE,
  PLACEHOLDER_LICENSE,
} from "@/lib/domain/constants";
import type {
  DayOfWeek,
  OpeningHours,
  PlaceCategory,
  PlacePhoto,
  VerifiedPlace,
} from "@/lib/domain/types";

export const STANDARD_OPENING_HOURS: readonly OpeningHours[] = [
  { day: "monday", opensAt: "09:00", closesAt: "18:00", note: "마지막 입장 17:30" },
  { day: "tuesday", opensAt: "09:00", closesAt: "18:00", note: "마지막 입장 17:30" },
  { day: "wednesday", opensAt: "09:00", closesAt: "18:00", note: "마지막 입장 17:30" },
  { day: "thursday", opensAt: "09:00", closesAt: "18:00", note: "마지막 입장 17:30" },
  { day: "friday", opensAt: "09:00", closesAt: "18:00", note: "마지막 입장 17:30" },
  { day: "saturday", opensAt: "09:00", closesAt: "18:00", note: "마지막 입장 17:30" },
  { day: "sunday", opensAt: "09:00", closesAt: "18:00", note: "마지막 입장 17:30" },
];

export const EXTENDED_OPENING_HOURS: readonly OpeningHours[] = [
  { day: "monday", opensAt: "10:00", closesAt: "20:00", note: "브레이크타임 없음" },
  { day: "tuesday", opensAt: "10:00", closesAt: "20:00", note: "브레이크타임 없음" },
  { day: "wednesday", opensAt: "10:00", closesAt: "20:00", note: "브레이크타임 없음" },
  { day: "thursday", opensAt: "10:00", closesAt: "20:00", note: "브레이크타임 없음" },
  { day: "friday", opensAt: "10:00", closesAt: "21:00", note: "저녁 운영" },
  { day: "saturday", opensAt: "10:00", closesAt: "21:00", note: "저녁 운영" },
  { day: "sunday", opensAt: "10:00", closesAt: "20:00", note: "브레이크타임 없음" },
];

export const MARKET_OPENING_HOURS: readonly OpeningHours[] = [
  { day: "monday", opensAt: "09:00", closesAt: "19:00", note: "점포별 운영시간 상이" },
  { day: "tuesday", opensAt: "09:00", closesAt: "19:00", note: "점포별 운영시간 상이" },
  { day: "wednesday", opensAt: "09:00", closesAt: "19:00", note: "점포별 운영시간 상이" },
  { day: "thursday", opensAt: "09:00", closesAt: "19:00", note: "점포별 운영시간 상이" },
  { day: "friday", opensAt: "09:00", closesAt: "20:00", note: "점포별 운영시간 상이" },
  { day: "saturday", opensAt: "09:00", closesAt: "20:00", note: "점포별 운영시간 상이" },
  { day: "sunday", opensAt: "09:00", closesAt: "18:00", note: "점포별 운영시간 상이" },
];

export const photoFor = (placeId: string, placeName: string): PlacePhoto => ({
  id: `${placeId}-primary`,
  src: `/placeholders/${placeId}.webp`,
  alt: `${placeName} 대표 이미지 플레이스홀더`,
  source: DEMO_SOURCE,
  license: PLACEHOLDER_LICENSE,
});

export type PlaceSeed = Omit<
  VerifiedPlace,
  "photos" | "source" | "license" | "checkedAt" | "verification"
>;

export const makeVerifiedPlace = (seed: PlaceSeed): VerifiedPlace => ({
  ...seed,
  photos: [photoFor(seed.id, seed.name)],
  source: DEMO_SOURCE,
  license: DEMO_LICENSE,
  checkedAt: DEMO_CHECKED_AT,
  verification: {
    status: "verified-fixture",
    source: DEMO_SOURCE,
    license: DEMO_LICENSE,
    checkedAt: DEMO_CHECKED_AT,
  },
});

export const getCategoryLabel = (category: PlaceCategory): string => CATEGORY_LABELS[category];

export const getDayLabel = (day: DayOfWeek): string => {
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
};

