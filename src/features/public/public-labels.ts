import type { CompanionType, InterestTag, TransportMode } from "@/features/public/public-data";

export const TRANSPORT_LABELS: Readonly<Record<TransportMode, string>> = {
  walk: "도보",
  transit: "대중교통",
  car: "자차",
};

export const INTEREST_LABELS: Readonly<Record<InterestTag, string>> = {
  ceramics: "도자·공방",
  nature: "자연·산책",
  food: "먹거리",
  market: "시장·골목",
  slow: "느린 여행",
};

export const COMPANION_LABELS: Readonly<Record<CompanionType, string>> = {
  family: "가족",
  couple: "커플",
  solo: "혼자",
  friends: "친구",
};
