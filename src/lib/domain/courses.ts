import type {
  CourseFilters,
  CourseSearchResult,
  CourseSearchState,
  CourseSort,
  CuratedRoute,
  VerifiedPlace,
} from "./types";

const normalize = (value: string): string => value.trim().toLocaleLowerCase();

const routeSearchText = (
  route: CuratedRoute,
  places: readonly VerifiedPlace[],
): string => {
  const placeById = new Map<string, VerifiedPlace>();
  for (const place of places) {
    placeById.set(place.id, place);
  }

  const stopNames = route.stops.flatMap((stop) => {
    const place = placeById.get(stop.placeId);
    return place === undefined ? [] : [place.name, place.categoryLabel, ...place.tags];
  });

  return [
    route.title,
    route.summary,
    route.audienceLabel,
    route.recommendationReason,
    ...route.interestTags,
    ...stopNames,
  ]
    .join(" ")
    .toLocaleLowerCase();
};

const includesNormalized = (values: readonly string[], expected: string): boolean =>
  values.some((value) => normalize(value) === expected);

const matchesFilters = (
  route: CuratedRoute,
  filters: CourseFilters,
  places: readonly VerifiedPlace[],
): boolean => {
  if (filters.audience !== undefined && route.audience !== filters.audience) {
    return false;
  }
  if (
    filters.audiences !== undefined &&
    filters.audiences.length > 0 &&
    !filters.audiences.includes(route.audience)
  ) {
    return false;
  }
  if (
    filters.transportMode !== undefined &&
    route.transportMode !== filters.transportMode
  ) {
    return false;
  }
  if (
    filters.transportModes !== undefined &&
    filters.transportModes.length > 0 &&
    !filters.transportModes.includes(route.transportMode)
  ) {
    return false;
  }
  if (
    filters.minDurationMinutes !== undefined &&
    route.durationMinutes < filters.minDurationMinutes
  ) {
    return false;
  }
  if (
    filters.maxDurationMinutes !== undefined &&
    route.durationMinutes > filters.maxDurationMinutes
  ) {
    return false;
  }
  if (
    filters.interestTags !== undefined &&
    filters.interestTags.length > 0 &&
    !filters.interestTags.every((tag) =>
      includesNormalized(route.interestTags, normalize(tag)),
    )
  ) {
    return false;
  }
  if (filters.keyword !== undefined && filters.keyword.trim().length > 0) {
    const keyword = normalize(filters.keyword);
    if (!routeSearchText(route, places).includes(keyword)) {
      return false;
    }
  }

  return true;
};

export function calculateCourseMatchScore(
  route: CuratedRoute,
  filters: CourseFilters,
  places: readonly VerifiedPlace[],
): number {
  let score = 0;
  const searchText = routeSearchText(route, places);

  if (filters.audience !== undefined && route.audience === filters.audience) {
    score += 30;
  }
  if (filters.audiences?.includes(route.audience) === true) {
    score += 30;
  }
  if (filters.transportMode !== undefined && route.transportMode === filters.transportMode) {
    score += 25;
  }
  if (filters.transportModes?.includes(route.transportMode) === true) {
    score += 25;
  }
  if (filters.minDurationMinutes !== undefined && route.durationMinutes >= filters.minDurationMinutes) {
    score += 10;
  }
  if (filters.maxDurationMinutes !== undefined && route.durationMinutes <= filters.maxDurationMinutes) {
    score += 10;
  }
  if (filters.interestTags !== undefined) {
    score += filters.interestTags.filter((tag) =>
      includesNormalized(route.interestTags, normalize(tag)),
    ).length * 10;
  }
  if (filters.keyword !== undefined && filters.keyword.trim().length > 0) {
    score += searchText.includes(normalize(filters.keyword)) ? 25 : 0;
  }

  return score;
}

export function getMatchedCourseTerms(
  route: CuratedRoute,
  filters: CourseFilters,
  places: readonly VerifiedPlace[],
): readonly string[] {
  const matchedTerms: string[] = [];
  if (filters.keyword !== undefined && routeSearchText(route, places).includes(normalize(filters.keyword))) {
    matchedTerms.push(filters.keyword.trim());
  }
  if (filters.audience !== undefined && route.audience === filters.audience) {
    matchedTerms.push(route.audienceLabel);
  }
  if (filters.transportMode !== undefined && route.transportMode === filters.transportMode) {
    matchedTerms.push(route.transportMode);
  }
  if (filters.interestTags !== undefined) {
    for (const tag of filters.interestTags) {
      if (includesNormalized(route.interestTags, normalize(tag))) {
        matchedTerms.push(tag);
      }
    }
  }
  return matchedTerms;
}

export function filterCuratedRoutes(
  routes: readonly CuratedRoute[],
  filters: CourseFilters,
  places: readonly VerifiedPlace[],
): readonly CuratedRoute[] {
  return routes.filter((route) => matchesFilters(route, filters, places));
}

export function sortCuratedRoutes(
  routes: readonly CuratedRoute[],
  sort: CourseSort,
  filters: CourseFilters,
  places: readonly VerifiedPlace[],
): readonly CuratedRoute[] {
  const indexedRoutes = routes.map((route, index) => ({
    route,
    index,
    score: calculateCourseMatchScore(route, filters, places),
  }));

  indexedRoutes.sort((first, second) => {
    if (sort === "duration" && first.route.durationMinutes !== second.route.durationMinutes) {
      return first.route.durationMinutes - second.route.durationMinutes;
    }
    if (sort === "recent" && first.route.checkedAt !== second.route.checkedAt) {
      return first.route.checkedAt < second.route.checkedAt ? 1 : -1;
    }
    if (sort === "match" && first.score !== second.score) {
      return second.score - first.score;
    }
    if (first.route.title === second.route.title) {
      return first.index - second.index;
    }
    return first.route.title < second.route.title ? -1 : 1;
  });

  return indexedRoutes.map((entry) => entry.route);
}

export function findCuratedCourses(
  routes: readonly CuratedRoute[],
  filters: CourseFilters,
  sort: CourseSort,
  places: readonly VerifiedPlace[],
): readonly CourseSearchResult[] {
  const filteredRoutes = filterCuratedRoutes(routes, filters, places);
  const sortedRoutes = sortCuratedRoutes(filteredRoutes, sort, filters, places);

  return sortedRoutes.map((route) => ({
    route,
    matchScore: calculateCourseMatchScore(route, filters, places),
    matchedTerms: getMatchedCourseTerms(route, filters, places),
  }));
}

export function describeCourseSearch(
  routes: readonly CuratedRoute[],
  filters: CourseFilters,
  sort: CourseSort,
  places: readonly VerifiedPlace[],
): CourseSearchState {
  const filteredRoutes = filterCuratedRoutes(routes, filters, places);
  return {
    filters,
    sort,
    resultCount: filteredRoutes.length,
    hasResults: filteredRoutes.length > 0,
  };
}

