"use client";

import { useCallback, type Dispatch, type SetStateAction } from "react";
import { planFromItinerary, placeById, currentTime } from "./app-seed";
import { deletePersistedItinerary, persistItinerary, type AppSupabaseClient } from "./app-persistence";
import type { AppSession, Itinerary, WorkingPlan } from "./app-types";

type ItineraryActionInput = {
  readonly supabase: AppSupabaseClient | null;
  readonly session: AppSession | null;
  readonly itineraries: readonly Itinerary[];
  readonly setItineraries: Dispatch<SetStateAction<readonly Itinerary[]>>;
  readonly setWorkingPlans: Dispatch<SetStateAction<readonly WorkingPlan[]>>;
  readonly setActiveItineraryId: Dispatch<SetStateAction<string | null>>;
  readonly setTravelProgress: Dispatch<SetStateAction<Readonly<Record<string, number>>>>;
  readonly setAuthError: Dispatch<SetStateAction<string | null>>;
};

export function useItineraryActions(input: ItineraryActionInput) {
  const {
    itineraries,
    session,
    setAuthError,
    setActiveItineraryId,
    setItineraries,
    setTravelProgress,
    setWorkingPlans,
    supabase,
  } = input;

  const getItinerary = useCallback((itineraryId: string): Itinerary | null => {
    return itineraries.find((itinerary) => itinerary.id === itineraryId) ?? null;
  }, [itineraries]);

  const openItineraryInEditor = useCallback((itineraryId: string): boolean => {
    const itinerary = itineraries.find((item) => item.id === itineraryId);
    if (itinerary === undefined) {
      return false;
    }
    setWorkingPlans([planFromItinerary(itinerary)]);
    setActiveItineraryId(itineraryId);
    return true;
  }, [itineraries, setActiveItineraryId, setWorkingPlans]);

  const deleteItinerary = useCallback((itineraryId: string) => {
    const itinerary = itineraries.find((item) => item.id === itineraryId);
    if (itinerary === undefined) {
      return;
    }
    setItineraries((current) => current.filter((itinerary) => itinerary.id !== itineraryId));
    setTravelProgress((current) => {
      const next = { ...current };
      delete next[itineraryId];
      return next;
    });
    if (supabase !== null && session !== null && session.provider !== "demo" && itinerary.userId === session.userId) {
      void deletePersistedItinerary(supabase, session.userId, itineraryId).then((result) => {
        if (result.kind === "error") {
          setAuthError(result.message);
        }
      });
    }
  }, [itineraries, session, setAuthError, setItineraries, setTravelProgress, supabase]);

  const startTrip = useCallback((itineraryId: string) => {
    setActiveItineraryId(itineraryId);
    setTravelProgress((current) => ({ ...current, [itineraryId]: current[itineraryId] ?? 0 }));
  }, [setActiveItineraryId, setTravelProgress]);

  const setTravelPosition = useCallback((itineraryId: string, position: number) => {
    setTravelProgress((current) => ({ ...current, [itineraryId]: Math.max(0, position) }));
  }, [setTravelProgress]);

  const replaceTravelStop = useCallback((itineraryId: string, position: number, placeId: string): boolean => {
    const place = placeById(placeId);
    if (place === null) {
      return false;
    }
    const itinerary = itineraries.find((item) => item.id === itineraryId);
    const stop = itinerary?.stops[position];
    if (itinerary === undefined || stop === undefined) {
      return false;
    }
    const updatedItinerary: Itinerary = {
      ...itinerary,
      stops: itinerary.stops.map((candidate, index) => index === position
        ? { ...candidate, placeId, dwellMinutes: place.defaultDwellMinutes }
        : candidate),
      updatedAt: currentTime(),
    };
    setItineraries((current) => current.map((item) => {
      if (item.id !== itineraryId) {
        return item;
      }
      return updatedItinerary;
    }));
    if (supabase !== null && session !== null && session.provider !== "demo" && itinerary.userId === session.userId) {
      void persistItinerary(supabase, session.userId, updatedItinerary).then((result) => {
        if (result.kind === "error") {
          setAuthError(result.message);
        }
      });
    }
    return true;
  }, [itineraries, session, setAuthError, setItineraries, supabase]);

  return { getItinerary, openItineraryInEditor, deleteItinerary, startTrip, setTravelPosition, replaceTravelStop };
}
