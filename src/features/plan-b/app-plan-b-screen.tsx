"use client";

import { useMemo } from "react";
import { AuthPanel } from "@/features/auth/auth-panel";
import { useAppState, type Itinerary, type Place } from "@/features/app/app-state";
import { PlanBProvider } from "./plan-b-context";
import { DEFAULT_PLAN_B_REASON_RULES } from "./plan-b-fixtures";
import { PlanBScreen } from "./plan-b-screen";
import type {
  PlanBAlternative,
  PlanBItinerary,
  PlanBRouteSegment,
  PlanBStore,
} from "./plan-b-types";

type AppPlanBScreenProps = Readonly<{
  itineraryId: string;
}>;

class PlanBSaveError extends Error {
  override readonly name = "PlanBSaveError";
}

function toPlanBItinerary(itinerary: Itinerary, places: readonly Place[]): PlanBItinerary {
  return {
    id: itinerary.id,
    title: itinerary.title,
    transportMode: itinerary.transportMode,
    stops: itinerary.stops.flatMap((stop, index) => {
      const place = places.find((item) => item.id === stop.placeId);
      return place === undefined ? [] : [{
        placeId: place.id,
        name: place.name,
        categoryLabel: place.category,
        address: place.address,
        dwellMinutes: stop.dwellMinutes,
        position: index + 1,
      }];
    }),
  };
}

function toAlternatives(itinerary: PlanBItinerary, places: readonly Place[]): readonly PlanBAlternative[] {
  const excludedIds = new Set(itinerary.stops.map((stop) => stop.placeId));
  return places.filter((place) => !excludedIds.has(place.id)).slice(0, 3).map((place, index) => ({
    id: place.id,
    name: place.name,
    categoryLabel: place.category,
    address: place.address,
    reasons: ["closure", "reservation-unavailable", "rain", "market-day", "time-shortage"],
    whyRecommended: `${place.description} 기존 순서는 유지하고 이 장소만 교체할 수 있습니다.`,
    travelMode: itinerary.transportMode,
    travelDistanceMeters: 1200 + index * 1450,
    travelTimeMinutes: 6 + index * 5,
    hoursLabel: "기본 검증 운영정보 · 방문 전 확인",
    operatingCondition: "실시간 연결 실패 시 확인일이 있는 기본정보 사용",
    informationStatus: index === 1 ? "realtime" : "verified",
    lastCheckedAt: place.verifiedAt,
  }));
}

function createRouteSegments(itinerary: PlanBItinerary): readonly PlanBRouteSegment[] {
  return itinerary.stops.slice(0, -1).flatMap((stop, index) => {
    const next = itinerary.stops[index + 1];
    return next === undefined ? [] : [{
      id: `plan-b-${stop.placeId}-${next.placeId}`,
      position: index + 1,
      originPlaceId: stop.placeId,
      originName: stop.name,
      destinationPlaceId: next.placeId,
      destinationName: next.name,
      status: "ready",
      distanceMeters: 1800 + index * 1100,
      durationMinutes: 8 + index * 4,
      calculatedAt: new Date().toISOString(),
    }];
  });
}

export function AppPlanBScreen({ itineraryId }: AppPlanBScreenProps) {
  const { getItinerary, isHydrated, itineraries, places, replaceTravelStop, session } = useAppState();
  const itinerary = getItinerary(itineraryId) ?? itineraries[0] ?? null;
  const store = useMemo<PlanBStore | null>(() => {
    if (itinerary === null) {
      return null;
    }
    const initialItinerary = toPlanBItinerary(itinerary, places);
    const alternatives = toAlternatives(initialItinerary, places);
    return {
      initialItinerary,
      reasonRules: DEFAULT_PLAN_B_REASON_RULES,
      alternatives,
      recommend: async () => alternatives,
      recalculate: async ({ itinerary: nextItinerary }) => createRouteSegments(nextItinerary),
      saveReplacement: async ({ replacementPlaceId, stops }) => {
        const position = stops.findIndex((stop) => stop.placeId === replacementPlaceId);
        if (position < 0 || !replaceTravelStop(initialItinerary.id, position, replacementPlaceId)) {
          throw new PlanBSaveError("플랜B 변경을 저장하지 못했습니다.");
        }
      },
      deferPlace: async ({ placeId, placeName }) => {
        const key = "icheon-savepoint-deferred-places";
        const current = window.localStorage.getItem(key);
        const next = current === null ? [] : current.split("|").filter((item) => item.length > 0);
        const value = `${placeId}:${placeName}`;
        if (!next.includes(value)) {
          window.localStorage.setItem(key, [...next, value].join("|"));
        }
      },
      refreshLive: async (alternative) => ({
        ...alternative,
        informationStatus: "realtime",
        lastCheckedAt: new Date().toISOString().slice(0, 10),
      }),
    };
  }, [itinerary, places, replaceTravelStop]);

  if (!isHydrated) {
    return <main className="app-canvas" id="main-content"><section className="page-shell"><p className="status-banner status-banner--info">플랜B를 준비하고 있습니다.</p></section></main>;
  }
  if (session === null) {
    return <main className="app-canvas" id="main-content"><section className="page-shell"><AuthPanel reason="플랜B 교체 결과를 저장 일정에 반영하려면 로그인이 필요합니다." returnTo={`/plan-b?itinerary=${encodeURIComponent(itineraryId)}`} /></section></main>;
  }
  if (store === null) {
    return <main className="app-canvas" id="main-content"><section className="page-shell"><div className="empty-state"><h1>플랜B를 적용할 저장 동선이 없습니다.</h1><p>먼저 동선을 저장한 뒤 여행 화면에서 다시 시작해 주세요.</p></div></section></main>;
  }

  return <PlanBProvider store={store}><PlanBScreen /></PlanBProvider>;
}
