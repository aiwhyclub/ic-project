import {
  AUDIENCE_LABELS,
  DEMO_CHECKED_AT,
  DEMO_LICENSE,
  DEMO_SOURCE,
  PLACEHOLDER_LICENSE,
} from "@/lib/domain/constants";
import {
  deriveRouteSegmentsForPlaces,
  calculateItineraryRoute,
  routePlaceIds,
  type RouteCalculationOptions,
} from "@/lib/domain/routes";
import {
  filterCuratedRoutes,
  findCuratedCourses,
  sortCuratedRoutes,
} from "@/lib/domain/courses";
import type {
  CourseFilters,
  CourseSearchResult,
  CourseSort,
  CuratedRoute,
  CuratedRouteStop,
  ItineraryDraft,
  ItineraryStop,
  PlacePhoto,
  RouteCalculation,
  RouteSegment,
  TransportMode,
  VerifiedPlace,
} from "@/lib/domain/types";
import { VERIFIED_PLACES, findPlace } from "./places";

const routePhotoFor = (routeId: string, title: string): PlacePhoto => ({
  id: `${routeId}-cover`,
  src: `/placeholders/${routeId}.webp`,
  alt: `${title} 대표 이미지 플레이스홀더`,
  source: DEMO_SOURCE,
  license: PLACEHOLDER_LICENSE,
});

type RouteSeedStop = {
  readonly placeId: string;
  readonly position: number;
  readonly dwellMinutes: number;
  readonly stopReason?: string;
};

const makeRoute = (
  id: string,
  title: string,
  summary: string,
  audience: CuratedRoute["audience"],
  transportMode: TransportMode,
  durationMinutes: number,
  interestTags: readonly string[],
  recommendationReason: string,
  stops: readonly RouteSeedStop[],
): CuratedRoute => ({
  id,
  title,
  summary,
  audience,
  audienceLabel: AUDIENCE_LABELS[audience],
  transportMode,
  durationMinutes,
  interestTags,
  recommendationReason,
  stops: stops.map(
    (stop): CuratedRouteStop => ({
      placeId: stop.placeId,
      position: stop.position,
      dwellMinutes: stop.dwellMinutes,
      stopReason: stop.stopReason ?? "검증 장소를 순서대로 연결한 데모 코스입니다.",
    }),
  ),
  photo: routePhotoFor(id, title),
  source: DEMO_SOURCE,
  license: DEMO_LICENSE,
  checkedAt: DEMO_CHECKED_AT,
  isFallback: true,
});

export const CURATED_ROUTES: readonly CuratedRoute[] = [
  makeRoute(
    "route-ceramics-and-lake",
    "도자기와 설봉호수 산책",
    "이천의 도자 문화와 호수 산책을 천천히 이어 보는 반나절 코스",
    "friends",
    "transit",
    330,
    ["도자", "산책", "카페", "친구·연인"],
    "대중교통으로 접근한 뒤 전시와 호수 산책 사이에 차 한 잔의 여유를 넣을 수 있습니다.",
    [
      { placeId: "icheon-ceramics-museum", position: 1, dwellMinutes: 75 },
      { placeId: "ceramic-tea-house", position: 2, dwellMinutes: 55 },
      { placeId: "seolbong-park", position: 3, dwellMinutes: 60 },
      { placeId: "seolbong-lake-cafe", position: 4, dwellMinutes: 50 },
    ],
  ),
  makeRoute(
    "route-family-rice-and-craft",
    "아이와 함께 만나는 이천",
    "도자 체험과 쌀 문화를 함께 담은 자차 중심 가족 하루 코스",
    "family",
    "car",
    420,
    ["가족", "체험", "쌀", "도자"],
    "주차가 가능한 실내·체험 장소를 섞어 날씨가 바뀌어도 하루 흐름을 이어가기 쉽습니다.",
    [
      { placeId: "yes-park", position: 1, dwellMinutes: 100 },
      { placeId: "rice-cultural-center", position: 2, dwellMinutes: 80 },
      { placeId: "sulsul-rice-kitchen", position: 3, dwellMinutes: 80 },
      { placeId: "icheon-ceramics-museum", position: 4, dwellMinutes: 75 },
    ],
  ),
  makeRoute(
    "route-market-and-local-life",
    "시장부터 옛 이천역까지",
    "관고전통시장과 로컬 공간을 짧은 이동으로 엮은 도보 생활문화 코스",
    "couple",
    "walk",
    300,
    ["시장", "로컬", "식사", "산책"],
    "시장 먹거리와 지역 이야기를 가까운 거리에서 비교하며 이천의 일상을 만날 수 있습니다.",
    [
      { placeId: "icheon-traditional-market", position: 1, dwellMinutes: 70 },
      { placeId: "sulsul-rice-kitchen", position: 2, dwellMinutes: 80 },
      { placeId: "old-icheon-station", position: 3, dwellMinutes: 35 },
      { placeId: "seolbong-lake-cafe", position: 4, dwellMinutes: 50 },
    ],
  ),
];

export const FALLBACK_CURATED_ROUTES: readonly CuratedRoute[] = CURATED_ROUTES;

export function findRoute(id: string): CuratedRoute | undefined {
  return CURATED_ROUTES.find((route) => route.id === id);
}

export function getCuratedRoutes(): readonly CuratedRoute[] {
  return CURATED_ROUTES;
}

export function getFallbackRoutes(): readonly CuratedRoute[] {
  return FALLBACK_CURATED_ROUTES;
}

export function getRouteStops(routeId: string): readonly ItineraryStop[] {
  return findRoute(routeId)?.stops ?? [];
}

export function getRoutePlaces(routeId: string): readonly VerifiedPlace[] {
  const route = findRoute(routeId);
  if (route === undefined) {
    return [];
  }
  return route.stops.flatMap((stop) => {
    const place = findPlace(stop.placeId);
    return place === undefined ? [] : [place];
  });
}

export function deriveRouteSegments(
  placeIds: readonly string[],
  transportMode: TransportMode,
  options: RouteCalculationOptions = {},
): readonly RouteSegment[] {
  return deriveRouteSegmentsForPlaces(placeIds, transportMode, VERIFIED_PLACES, options);
}

export function deriveRouteCalculation(
  placeIds: readonly string[],
  transportMode: TransportMode,
  options: RouteCalculationOptions = {},
): RouteCalculation {
  return calculateItineraryRoute(
    placeIds.map((placeId, index) => ({
      placeId,
      position: index + 1,
      dwellMinutes: findPlace(placeId)?.defaultDwellMinutes ?? 0,
    })),
    transportMode,
    VERIFIED_PLACES,
    options,
  );
}

export function filterCourses(
  routes: readonly CuratedRoute[],
  filters: CourseFilters,
): readonly CuratedRoute[] {
  return filterCuratedRoutes(routes, filters, VERIFIED_PLACES);
}

export function sortCourses(
  routes: readonly CuratedRoute[],
  sort: CourseSort,
  filters: CourseFilters = {},
): readonly CuratedRoute[] {
  return sortCuratedRoutes(routes, sort, filters, VERIFIED_PLACES);
}

export function findCourses(
  filters: CourseFilters = {},
  sort: CourseSort = "match",
): readonly CourseSearchResult[] {
  return findCuratedCourses(CURATED_ROUTES, filters, sort, VERIFIED_PLACES);
}

export function createItineraryDraft(
  routeId: string,
  itineraryId: string,
  travelDate: string | null = null,
): ItineraryDraft | undefined {
  const route = findRoute(routeId);
  if (route === undefined) {
    return undefined;
  }

  return {
    id: itineraryId,
    sourceRouteId: route.id,
    title: route.title,
    travelDate,
    companion: route.audience,
    transportMode: route.transportMode,
    stops: route.stops.map((stop) => ({
      placeId: stop.placeId,
      position: stop.position,
      dwellMinutes: stop.dwellMinutes,
    })),
  };
}

export function routePlaceIdsByRouteId(routeId: string): readonly string[] {
  const route = findRoute(routeId);
  return route === undefined ? [] : routePlaceIds(route.stops);
}
