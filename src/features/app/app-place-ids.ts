const PLACE_DATABASE_IDS: Readonly<Record<string, string>> = {
  "gyeonggi-ceramic-museum-icheon": "01000000-0000-4000-8000-000000000001",
  "icheon-city-museum": "01000000-0000-4000-8000-000000000002",
  "seolbong-lake": "01000000-0000-4000-8000-000000000003",
  "gwango-traditional-market": "01000000-0000-4000-8000-000000000004",
  "icheon-woljeon-museum": "01000000-0000-4000-8000-000000000005",
  "seolbong-seowon": "01000000-0000-4000-8000-000000000006",
  "icheon-agricultural-theme-park": "01000000-0000-4000-8000-000000000007",
  "icheon-sansuyu-village": "01000000-0000-4000-8000-000000000008",
  "seohui-history-hall": "01000000-0000-4000-8000-000000000009",
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
