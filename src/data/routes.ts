import {
  AUDIENCE_LABELS,
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
  RouteCalculation,
  RouteSegment,
  TransportMode,
  VerifiedPlace,
} from "@/lib/domain/types";
import { VERIFIED_PLACES, findPlace } from "./places";

const ROUTE_CHECKED_AT = "2026-09-20";
const ROUTE_SOURCE = {
  publisher: "이천 세이브포인트",
  title: "공식 출처 기반 기본 동선 편집안",
  url: "https://github.com/aiwhyclub/ic-project/blob/main/docs/research/verified-place-catalog.md",
  checkedAt: ROUTE_CHECKED_AT,
} satisfies CuratedRoute["source"];
const ROUTE_LICENSE = {
  name: "자체 작성 큐레이션",
  attribution: "이천 세이브포인트 · 장소별 공식 출처 표시",
  usage: "사실 메타데이터를 바탕으로 직접 작성했으며 외부 사진과 설명문을 복제하지 않습니다.",
} satisfies CuratedRoute["license"];

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
  source: ROUTE_SOURCE,
  license: ROUTE_LICENSE,
  checkedAt: ROUTE_CHECKED_AT,
  isFallback: true,
});

export const CURATED_ROUTES: readonly CuratedRoute[] = [
  makeRoute(
    "route-ceramics-and-lake",
    "도자기와 설봉호수 산책",
    "도자·지역사 전시와 설봉호 산책을 함께 이어 보는 반나절 코스",
    "friends",
    "transit",
    330,
    ["도자", "산책", "미술", "친구·연인"],
    "공식 운영정보가 있는 전시 공간과 설봉호 산책을 한 권역에서 비교할 수 있습니다.",
    [
      { placeId: "gyeonggi-ceramic-museum-icheon", position: 1, dwellMinutes: 90 },
      { placeId: "icheon-city-museum", position: 2, dwellMinutes: 75 },
      { placeId: "seolbong-lake", position: 3, dwellMinutes: 60 },
      { placeId: "icheon-woljeon-museum", position: 4, dwellMinutes: 75 },
    ],
  ),
  makeRoute(
    "route-family-rice-and-craft",
    "아이와 함께 만나는 이천",
    "농업·농촌 체험과 역사 전시를 함께 담은 자차 중심 가족 하루 코스",
    "family",
    "car",
    420,
    ["가족", "체험", "농촌", "역사"],
    "계절 체험과 실내 전시를 섞어 가족이 이천의 농업과 역사를 함께 만날 수 있습니다.",
    [
      { placeId: "icheon-agricultural-theme-park", position: 1, dwellMinutes: 100 },
      { placeId: "icheon-sansuyu-village", position: 2, dwellMinutes: 90 },
      { placeId: "seohui-history-hall", position: 3, dwellMinutes: 70 },
      { placeId: "gyeonggi-ceramic-museum-icheon", position: 4, dwellMinutes: 90 },
    ],
  ),
  makeRoute(
    "route-market-and-local-life",
    "시장과 설봉 문화 산책",
    "관고전통시장과 설봉권 문화 공간을 연결한 도보 생활문화 코스",
    "couple",
    "walk",
    300,
    ["시장", "로컬", "역사", "산책"],
    "시장과 서원·미술관·호수를 연결해 이천의 생활과 향토 문화를 함께 볼 수 있습니다.",
    [
      { placeId: "gwango-traditional-market", position: 1, dwellMinutes: 70 },
      { placeId: "seolbong-seowon", position: 2, dwellMinutes: 45 },
      { placeId: "icheon-woljeon-museum", position: 3, dwellMinutes: 75 },
      { placeId: "seolbong-lake", position: 4, dwellMinutes: 60 },
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
