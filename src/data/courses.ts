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
} from "@/lib/domain/types";
import { CURATED_ROUTES } from "./routes";
import { VERIFIED_PLACES } from "./places";

export function getFilteredCourses(
  filters: CourseFilters = {},
): readonly CuratedRoute[] {
  return filterCuratedRoutes(CURATED_ROUTES, filters, VERIFIED_PLACES);
}

export function getSortedCourses(
  sort: CourseSort = "match",
  filters: CourseFilters = {},
): readonly CuratedRoute[] {
  return sortCuratedRoutes(CURATED_ROUTES, sort, filters, VERIFIED_PLACES);
}

export function getCourseSearch(
  filters: CourseFilters = {},
  sort: CourseSort = "match",
): readonly CourseSearchResult[] {
  return findCuratedCourses(CURATED_ROUTES, filters, sort, VERIFIED_PLACES);
}

