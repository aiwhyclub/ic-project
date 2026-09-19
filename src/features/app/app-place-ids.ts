const PLACE_DATABASE_IDS: Readonly<Record<string, string>> = {
  "seolbong-park": "01000000-0000-4000-8000-000000000001",
  "icheon-ceramics-museum": "01000000-0000-4000-8000-000000000002",
  "old-icheon-station": "01000000-0000-4000-8000-000000000003",
  "icheon-traditional-market": "01000000-0000-4000-8000-000000000004",
  "ceramic-tea-house": "01000000-0000-4000-8000-000000000005",
  "yes-park": "01000000-0000-4000-8000-000000000006",
  "rice-cultural-center": "01000000-0000-4000-8000-000000000007",
  "sulsul-rice-kitchen": "01000000-0000-4000-8000-000000000008",
  "seolbong-lake-cafe": "01000000-0000-4000-8000-000000000009",
} as const;

const APP_PLACE_IDS: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(PLACE_DATABASE_IDS).map(([appId, databaseId]) => [databaseId, appId]),
);

export function toDatabasePlaceId(appPlaceId: string): string | null {
  return PLACE_DATABASE_IDS[appPlaceId] ?? null;
}

export function toAppPlaceId(databasePlaceId: string): string | null {
  return APP_PLACE_IDS[databasePlaceId] ?? null;
}
