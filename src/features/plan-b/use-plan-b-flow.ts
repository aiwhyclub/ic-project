"use client";

import { useState } from "react";

import type { Coordinates, PlanBReason } from "@/lib/domain/types";

import { usePlanBStore } from "./plan-b-context";
import {
  createLocalPlanBRouteSegments,
  DEFAULT_PLAN_B_STORE,
} from "./plan-b-fixtures";
import {
  createOperationId,
  ensureThreeAlternatives,
  findAlternative,
  hasFailedSegment,
  PLAN_B_MANUAL_REGIONS,
  type PlanBBusyAction,
  type PlanBFailure,
  type PlanBPhase,
} from "./plan-b-helpers";
import { createPlanBLocationActions } from "./plan-b-location-actions";
import { retryPlanB, updatePlanBReasons } from "./plan-b-controls";
import type {
  PlanBAlternative,
  PlanBItinerary,
  PlanBItineraryStop,
  PlanBLocationSelection,
  PlanBRouteSegment,
} from "./plan-b-types";

export function usePlanBFlow() {
  const providedStore = usePlanBStore();
  const store = providedStore ?? DEFAULT_PLAN_B_STORE;
  const [itinerary, setItinerary] = useState<PlanBItinerary>(() => store.initialItinerary);
  const [draftItinerary, setDraftItinerary] = useState<PlanBItinerary>(() => store.initialItinerary);
  const [routeSegments, setRouteSegments] = useState<readonly PlanBRouteSegment[]>(() =>
    createLocalPlanBRouteSegments(store.initialItinerary.stops),
  );
  const [location, setLocation] = useState<PlanBLocationSelection | null>(null);
  const [manualRegionId, setManualRegionId] = useState("");
  const [manualPlaceId, setManualPlaceId] = useState("");
  const [locationMessage, setLocationMessage] = useState("위치 기준을 정하면 다음 단계가 열립니다.");
  const [reasons, setReasons] = useState<readonly PlanBReason[]>([]);
  const [alternatives, setAlternatives] = useState<readonly PlanBAlternative[]>([]);
  const [selectedAlternativeId, setSelectedAlternativeId] = useState<string | null>(null);
  const [selectedStopId, setSelectedStopId] = useState(store.initialItinerary.stops[0]?.placeId ?? "");
  const [phase, setPhase] = useState<PlanBPhase>("location");
  const [busyAction, setBusyAction] = useState<PlanBBusyAction>(null);
  const [failure, setFailure] = useState<PlanBFailure | null>(null);
  const [recalculationFromPosition, setRecalculationFromPosition] = useState<number | null>(null);
  const [replacementReady, setReplacementReady] = useState(false);
  const [saved, setSaved] = useState(false);
  const [removedStop, setRemovedStop] = useState<PlanBItineraryStop | null>(null);
  const [deferredPlaceIds, setDeferredPlaceIds] = useState<readonly string[]>([]);
  const [, setEphemeralCoordinates] = useState<Coordinates | null>(null);

  const selectedAlternative = findAlternative(alternatives, selectedAlternativeId);
  const deferred = removedStop ? deferredPlaceIds.includes(removedStop.placeId) : false;
  const { chooseManualRegion, chooseManualPlace, useCurrentLocation } = createPlanBLocationActions({
    itinerary,
    setLocation,
    setManualRegionId,
    setManualPlaceId,
    setLocationMessage,
    setFailure,
    setBusyAction,
    setEphemeralCoordinates,
  });
  async function requestRecommendations() {
    if (!location) {
      setPhase("location");
      setFailure({ kind: "location", message: "현재 위치나 이천 권역을 먼저 선택하세요.", retryable: false, fallbackUsed: false });
      return;
    }

    if (reasons.length === 0) {
      setPhase("reasons");
      setFailure({ kind: "recommendation", message: "막힌 이유를 하나 이상 선택해야 합니다.", retryable: false, fallbackUsed: false });
      return;
    }

    setBusyAction("recommendation");
    setFailure(null);

    try {
      const candidates = store.recommend
        ? await store.recommend({
            blockedPlaceId: selectedStopId,
            reasons,
            location,
            transportMode: draftItinerary.transportMode,
            excludedPlaceIds: draftItinerary.stops.map((stop) => stop.placeId),
            remainingMinutes: 120,
          })
        : store.alternatives;
      const normalized = ensureThreeAlternatives(candidates);
      setAlternatives(normalized);
      setSelectedAlternativeId(null);
      setPhase("recommendations");
      if (candidates.length === 0) {
        setFailure({ kind: "recommendation", message: "추천 공급자가 응답하지 않아 검수된 기본 3곳을 표시합니다.", retryable: true, fallbackUsed: true });
      }
    } catch {
      setAlternatives(ensureThreeAlternatives([]));
      setSelectedAlternativeId(null);
      setPhase("recommendations");
      setFailure({ kind: "recommendation", message: "추천 계산에 실패해 검수된 기본 3곳을 표시합니다.", retryable: true, fallbackUsed: true });
    } finally {
      setBusyAction(null);
    }
  }
  async function refreshLive(alternative: PlanBAlternative) {
    setBusyAction("live");
    setFailure(null);

    try {
      if (!store.refreshLive) throw new Error("live-provider-unavailable");
      const refreshed = await store.refreshLive(alternative);
      setAlternatives((current) => current.map((item) => (item.id === refreshed.id ? refreshed : item)));
    } catch {
      setFailure({ kind: "live", message: "실시간 확인에 실패했지만 기본 검증정보와 확인일은 유지합니다.", retryable: true, fallbackUsed: true });
    } finally {
      setBusyAction(null);
    }
  }
  async function replaceStop() {
    const target = draftItinerary.stops.find((stop) => stop.placeId === selectedStopId);
    if (!target || !selectedAlternative) return;

    const nextStops = draftItinerary.stops.map((stop) =>
      stop.placeId === target.placeId
        ? { ...stop, placeId: selectedAlternative.id, name: selectedAlternative.name, categoryLabel: selectedAlternative.categoryLabel, address: selectedAlternative.address }
        : stop,
    );
    const nextItinerary: PlanBItinerary = { ...draftItinerary, stops: nextStops };
    setBusyAction("route");
    setFailure(null);

    try {
      const nextSegments = store.recalculate
        ? await store.recalculate({ itinerary: nextItinerary, changedStopId: target.placeId, replacementPlaceId: selectedAlternative.id, recalculateFromPosition: target.position })
        : createLocalPlanBRouteSegments(nextStops);
      if (hasFailedSegment(nextSegments)) throw new Error("route-segment-failed");
      setDraftItinerary(nextItinerary);
      setRouteSegments(nextSegments);
      setRemovedStop(target);
      setRecalculationFromPosition(target.position);
      setReplacementReady(true);
      setSaved(false);
      setPhase("replacement");
    } catch {
      setFailure({ kind: "route", message: "일부 구간을 다시 계산하지 못해 기존 일정과 경로를 그대로 유지합니다.", retryable: true, fallbackUsed: false });
    } finally {
      setBusyAction(null);
    }
  }
  async function saveReplacement() {
    if (!replacementReady || !selectedAlternative || !removedStop) return;
    setBusyAction("save");
    setFailure(null);

    try {
      if (store.saveReplacement) {
        await store.saveReplacement({
          operationId: createOperationId("plan-b-save"),
          itineraryId: draftItinerary.id,
          replacedPlaceId: removedStop.placeId,
          replacementPlaceId: selectedAlternative.id,
          stops: draftItinerary.stops,
        });
      }
      setItinerary(draftItinerary);
      setSaved(true);
      setPhase("saved");
    } catch {
      setFailure({ kind: "save", message: "저장에 실패했지만 화면의 교체안과 기존 장소 순서는 유지합니다.", retryable: true, fallbackUsed: false });
    } finally {
      setBusyAction(null);
    }
  }
  async function deferRemovedPlace() {
    if (!removedStop) return;
    setBusyAction("save");
    setFailure(null);

    try {
      if (store.deferPlace) {
        await store.deferPlace({ operationId: createOperationId("plan-b-defer"), itineraryId: itinerary.id, placeId: removedStop.placeId, placeName: removedStop.name });
      }
      setDeferredPlaceIds((current) => (current.includes(removedStop.placeId) ? current : [...current, removedStop.placeId]));
    } catch {
      setFailure({ kind: "save", message: "다음 방문 목록 저장에 실패했지만 교체된 일정은 그대로 보존합니다.", retryable: true, fallbackUsed: false });
    } finally {
      setBusyAction(null);
    }
  }
  return {
    itinerary,
    draftItinerary,
    routeSegments,
    location,
    manualRegions: PLAN_B_MANUAL_REGIONS,
    manualRegionId,
    manualPlaceId,
    locationMessage,
    reasons,
    alternatives,
    selectedAlternative,
    selectedAlternativeId,
    selectedStopId,
    phase,
    busyAction,
    failure,
    recalculationFromPosition,
    replacementReady,
    saved,
    removedStop,
    deferred,
    isBusy: busyAction !== null,
    reasonRules: store.reasonRules,
    liveRefreshAvailable: Boolean(store.refreshLive),
    chooseManualRegion,
    chooseManualPlace,
    useCurrentLocation,
    toggleReason: (reason: PlanBReason, checked: boolean) => updatePlanBReasons(reason, checked, setReasons, setFailure),
    requestRecommendations,
    refreshLive,
    setSelectedAlternativeId,
    setSelectedStopId,
    replaceStop,
    saveReplacement,
    deferRemovedPlace,
    setPhase,
    retry: () => retryPlanB(
      failure,
      {
        requestRecommendations,
        replaceStop,
        saveReplacement,
        refreshLive: async () => {
          if (selectedAlternative) await refreshLive(selectedAlternative);
        },
      },
      setFailure,
    ),
  };
}
