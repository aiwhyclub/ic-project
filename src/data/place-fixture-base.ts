import {
  CATEGORY_LABELS,
} from "@/lib/domain/constants";
import type {
  DayOfWeek,
  LicenseInfo,
  OpeningHours,
  PlaceCategory,
  SourceReference,
  VerifiedPlace,
} from "@/lib/domain/types";

const DAYS: readonly DayOfWeek[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const VERIFIED_CHECKED_AT = "2026-09-20";

export const OFFICIAL_FACTS_LICENSE: LicenseInfo = {
  name: "공식 출처 사실 메타데이터",
  attribution: "장소별 공식 출처 표시 · 외부 사진 미사용",
  usage: "명칭·주소·대표 연락처·운영정보만 요약하며 공식 설명문과 이미지는 복제하지 않습니다.",
};

export function officialSource(
  publisher: string,
  title: string,
  url: string,
): SourceReference {
  return { publisher, title, url, checkedAt: VERIFIED_CHECKED_AT };
}

export function dailyOpeningHours(
  opensAt: string | null,
  closesAt: string | null,
  note: string,
): readonly OpeningHours[] {
  return DAYS.map((day) => ({ day, opensAt, closesAt, note }));
}

export type PlaceSeed = Omit<
  VerifiedPlace,
  "photos" | "verification"
>;

export const makeVerifiedPlace = (seed: PlaceSeed): VerifiedPlace => ({
  ...seed,
  photos: [],
  verification: {
    status: "verified-fixture",
    source: seed.source,
    license: seed.license,
    checkedAt: seed.checkedAt,
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
