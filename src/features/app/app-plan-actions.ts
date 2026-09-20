"use client";

import { useCallback, type Dispatch, type SetStateAction } from "react";
import {
  clonePlan,
  createSegments,
  currentTime,
  DEFAULT_WORKING_PLANS,
  markPlanSegmentsIdle,
  normalizeStops,
  placeById,
  planToItinerary,
} from "./app-seed";
import { deleteItineraryDraft, persistItineraries, type AppSupabaseClient } from "./app-persistence";
import type {
  AppSession,
  Itinerary,
  PlanStop,
  SaveResult,
  SegmentStatus,
  TransportMode,
  WorkingPlan,
} from "./app-types";

type PlanSetter = Dispatch<SetStateAction<readonly WorkingPlan[]>>;
type ItinerarySetter = Dispatch<SetStateAction<readonly Itinerary[]>>;
type SnapshotSetter = Dispatch<SetStateAction<readonly WorkingPlan[]>>;

type PlanActionInput = {
  readonly supabase: AppSupabaseClient | null;
  readonly workingPlans: readonly WorkingPlan[];
  readonly session: AppSession | null;
  readonly itineraries: readonly Itinerary[];
  readonly setWorkingPlans: PlanSetter;
  readonly setDraftPlans: SnapshotSetter;
  readonly setPendingSave: Dispatch<SetStateAction<readonly WorkingPlan[] | null>>;
  readonly setItineraries: ItinerarySetter;
  readonly setAuthError: Dispatch<SetStateAction<string | null>>;
};

function setSegmentStatus(segmentStatus: SegmentStatus, errorMessage: string | null) {
  return (segment: WorkingPlan["segments"][number]) => ({
    ...segment,
    status: segmentStatus,
    errorMessage,
  });
}

export function usePlanActions(input: PlanActionInput) {
  const {
    itineraries,
    session,
    supabase,
    setAuthError,
    setDraftPlans,
    setItineraries,
    setPendingSave,
    setWorkingPlans,
    workingPlans,
  } = input;

  const startPlans = useCallback((planIds?: readonly string[]) => {
    const fallback = DEFAULT_WORKING_PLANS[0];
    const requested = planIds === undefined || planIds.length === 0 ? (fallback === undefined ? [] : [fallback.id]) : planIds;
    const selected = requested.slice(0, 3).flatMap((planId) => {
      const plan = DEFAULT_WORKING_PLANS.find((item) => item.id === planId);
      return plan === undefined ? [] : [clonePlan(plan)];
    });
    if (selected.length > 0) {
      setWorkingPlans(selected);
    }
  }, [setWorkingPlans]);

  const clearWorkingPlans = useCallback(() => {
    setWorkingPlans([]);
    setDraftPlans([]);
  }, [setDraftPlans, setWorkingPlans]);

  const updatePlanStops = useCallback((planId: string, stops: readonly PlanStop[]) => {
    setWorkingPlans((current) => current.map((plan) => plan.id === planId
      ? markPlanSegmentsIdle({ ...plan, stops: normalizeStops(stops) })
      : plan));
  }, [setWorkingPlans]);

  const addStop = useCallback((planId: string, placeId: string, position: number) => {
    setWorkingPlans((current) => current.map((plan) => {
      if (plan.id !== planId || plan.stops.some((stop) => stop.placeId === placeId)) {
        return plan;
      }
      const nextStops = [...plan.stops];
      const insertAt = Math.max(0, Math.min(position, nextStops.length));
      nextStops.splice(insertAt, 0, {
        placeId,
        position: insertAt,
        dwellMinutes: placeById(placeId)?.defaultDwellMinutes ?? 60,
      });
      return markPlanSegmentsIdle({ ...plan, stops: normalizeStops(nextStops) });
    }));
  }, [setWorkingPlans]);

  const removeStop = useCallback((planId: string, placeId: string) => {
    setWorkingPlans((current) => current.map((plan) => plan.id === planId
      ? markPlanSegmentsIdle({ ...plan, stops: normalizeStops(plan.stops.filter((stop) => stop.placeId !== placeId)) })
      : plan));
  }, [setWorkingPlans]);

  const moveStop = useCallback((planId: string, fromIndex: number, toIndex: number) => {
    setWorkingPlans((current) => current.map((plan) => {
      const moved = plan.stops[fromIndex];
      if (plan.id !== planId || moved === undefined || fromIndex === toIndex) {
        return plan;
      }
      const nextStops = [...plan.stops];
      nextStops.splice(fromIndex, 1);
      nextStops.splice(Math.max(0, Math.min(toIndex, nextStops.length)), 0, moved);
      return markPlanSegmentsIdle({ ...plan, stops: normalizeStops(nextStops) });
    }));
  }, [setWorkingPlans]);

  const setTransportMode = useCallback((planId: string, transportMode: TransportMode) => {
    setWorkingPlans((current) => current.map((plan) => plan.id === planId
      ? markPlanSegmentsIdle({ ...plan, transportMode })
      : plan));
  }, [setWorkingPlans]);

  const recomputePlan = useCallback((planId: string, segmentId?: string) => {
    setWorkingPlans((current) => current.map((plan) => {
      if (plan.id !== planId) {
        return plan;
      }
      const targetIds = segmentId === undefined ? plan.segments.map((segment) => segment.id) : [segmentId];
      return { ...plan, updatedAt: currentTime(), segments: plan.segments.map((segment) => targetIds.includes(segment.id)
        ? setSegmentStatus("calculating", null)(segment)
        : segment) };
    }));
    window.setTimeout(() => setWorkingPlans((current) => current.map((plan) => {
      if (plan.id !== planId) {
        return plan;
      }
      const calculated = createSegments(plan.stops, plan.transportMode);
      const targetIds = segmentId === undefined ? calculated.map((segment) => segment.id) : [segmentId];
      return {
        ...plan,
        updatedAt: currentTime(),
        segments: calculated.map((segment) => targetIds.includes(segment.id) ? segment : { ...segment, status: "idle", lastCalculatedAt: null }),
      };
    })), 420);
  }, [setWorkingPlans]);

  const retrySegment = useCallback((planId: string, segmentId: string) => recomputePlan(planId, segmentId), [recomputePlan]);

  const savePlans = useCallback((): SaveResult => {
    const snapshots = workingPlans.map(clonePlan);
    if (session === null) {
      setPendingSave(snapshots);
      return { kind: "requires-auth", plans: snapshots };
    }
    const saved = snapshots.map((plan) => {
      const existing = plan.sourceItineraryId === null ? null : itineraries.find((item) => item.id === plan.sourceItineraryId) ?? null;
      return planToItinerary(plan, session.userId, existing);
    });
    setItineraries((current) => {
      const savedIds = new Set(saved.map((item) => item.id));
      return [...saved, ...current.filter((item) => !savedIds.has(item.id))];
    });
    setWorkingPlans([]);
    setDraftPlans([]);
    setPendingSave(null);
    if (supabase !== null && session.provider !== "demo") {
      void persistItineraries(supabase, session.userId, saved).then((result) => {
        if (result.kind === "error") {
          setAuthError(result.message);
        }
      });
      for (const plan of snapshots) {
        if (plan.sourceItineraryId !== null) {
          void deleteItineraryDraft(supabase, session.userId, plan.sourceItineraryId).then((result) => {
            if (result.kind === "error") {
              setAuthError(result.message);
            }
          });
        }
      }
    }
    return { kind: "saved", itineraryIds: saved.map((item) => item.id) };
  }, [itineraries, session, setAuthError, setDraftPlans, setItineraries, setPendingSave, setWorkingPlans, supabase, workingPlans]);

  return {
    startPlans,
    clearWorkingPlans,
    updatePlanStops,
    addStop,
    removeStop,
    moveStop,
    setTransportMode,
    recomputePlan,
    retrySegment,
    savePlans,
  };
}
