"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AppStateContext } from "./app-context";
import { useAuthActions } from "./app-auth-actions";
import { useItineraryActions } from "./app-itinerary-actions";
import { usePlanActions } from "./app-plan-actions";
import { SEED_PLACES, planToItinerary, clonePlan } from "./app-seed";
import { createSupabaseClient, isRemoteSession, readPersistedState, sessionFromSupabase, STORAGE_KEY } from "./app-storage";
import { loadAccountData } from "./app-persistence-load";
import { persistItineraries, upsertItineraryDraft } from "./app-persistence";
import type { AppSession, AppState, Itinerary, PersistedState, WorkingPlan } from "./app-types";

export function AppProvider({ children }: Readonly<{ children: ReactNode }>) {
  const supabase = useMemo(() => createSupabaseClient(), []);
  const [isHydrated, setIsHydrated] = useState(false);
  const [session, setSession] = useState<AppSession | null>(null);
  const [authPending, setAuthPending] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [workingPlans, setWorkingPlans] = useState<readonly WorkingPlan[]>([]);
  const [draftPlans, setDraftPlans] = useState<readonly WorkingPlan[]>([]);
  const [pendingSave, setPendingSave] = useState<readonly WorkingPlan[] | null>(null);
  const [itineraries, setItineraries] = useState<readonly Itinerary[]>([]);
  const [activeItineraryId, setActiveItineraryId] = useState<string | null>(null);
  const [travelProgress, setTravelProgressState] = useState<Readonly<Record<string, number>>>({});
  const remoteUserId = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let loadVersion = 0;
    const storedState = readPersistedState();
    if (storedState !== null) {
      const isDemo = storedState.session?.provider === "demo";
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate browser-owned demo/anonymous state.
      setSession(isDemo ? storedState.session : null);
      setWorkingPlans(isDemo || storedState.session === null ? storedState.workingPlans : []);
      setDraftPlans(isDemo ? storedState.draftPlans : []);
      setPendingSave(storedState.session === null ? storedState.pendingSave : null);
      setItineraries(isDemo ? storedState.itineraries : []);
      setActiveItineraryId(isDemo ? storedState.activeItineraryId : null);
      setTravelProgressState(isDemo ? storedState.travelProgress : {});
    }
    if (supabase === null) {
      setIsHydrated(true);
      return;
    }
    const client = supabase;

    async function loadAuthenticatedState(nextSession: Parameters<typeof sessionFromSupabase>[0]) {
      const appSession = sessionFromSupabase(nextSession);
      const version = loadVersion + 1;
      loadVersion = version;
      remoteUserId.current = appSession.userId;
      setIsHydrated(false);
      setSession(appSession);
      setItineraries([]);
      setDraftPlans([]);
      setWorkingPlans([]);
      const loaded = await loadAccountData(client, appSession.userId);
      if (cancelled || loadVersion !== version) {
        return;
      }
      if (loaded.kind === "ready") {
        setItineraries(loaded.itineraries);
        setDraftPlans(loaded.drafts.map(clonePlan));
        setWorkingPlans(loaded.drafts.map(clonePlan));
        setAuthError(null);
      } else {
        setAuthError(loaded.message);
      }
      setIsHydrated(true);
    }

    const listener = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (nextSession !== null) {
        void loadAuthenticatedState(nextSession);
      } else if (remoteUserId.current !== null) {
        remoteUserId.current = null;
        loadVersion += 1;
        setSession(null);
        setItineraries([]);
        setDraftPlans([]);
        setWorkingPlans([]);
        setPendingSave(null);
        setActiveItineraryId(null);
        setTravelProgressState({});
        setIsHydrated(true);
      }
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (cancelled) {
        return;
      }
      if (data.session === null) {
        setIsHydrated(true);
        return;
      }
      return loadAuthenticatedState(data.session);
    });
    return () => {
      cancelled = true;
      listener.data.subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    if (isRemoteSession(session)) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }
    const isDemo = session?.provider === "demo";
    const persisted: PersistedState = {
      session: isDemo ? session : null,
      workingPlans,
      pendingSave,
      draftPlans: isDemo ? draftPlans : [],
      itineraries: isDemo ? itineraries : [],
      activeItineraryId: isDemo ? activeItineraryId : null,
      travelProgress: isDemo ? travelProgress : {},
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
  }, [activeItineraryId, draftPlans, isHydrated, itineraries, pendingSave, session, travelProgress, workingPlans]);

  useEffect(() => {
    if (!isHydrated || session === null) {
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- persist the current authenticated draft snapshot.
    setDraftPlans(workingPlans.length === 0 ? [] : workingPlans.map(clonePlan));
    if (session.provider !== "demo" && supabase !== null) {
      for (const plan of workingPlans) {
        if (plan.sourceItineraryId === null) {
          continue;
        }
        const itinerary = itineraries.find((item) => item.id === plan.sourceItineraryId);
        if (itinerary !== undefined) {
          void upsertItineraryDraft(supabase, session.userId, itinerary, plan).then((result) => {
            if (result.kind === "error") {
              setAuthError(result.message);
            }
          });
        }
      }
    }
  }, [isHydrated, itineraries, session, supabase, workingPlans]);

  useEffect(() => {
    if (!isHydrated || session === null || pendingSave === null || pendingSave.length === 0) {
      return;
    }
    const nextItineraries = pendingSave.map((plan) => planToItinerary(plan, session.userId, null));
    // eslint-disable-next-line react-hooks/set-state-in-effect -- flush the pending save after authentication completes.
    setItineraries((current) => [...nextItineraries, ...current]);
    setWorkingPlans([]);
    setDraftPlans([]);
    setPendingSave(null);
    if (session.provider !== "demo" && supabase !== null) {
      void persistItineraries(supabase, session.userId, nextItineraries).then((result) => {
        if (result.kind === "error") {
          setAuthError(result.message);
        }
      });
    }
  }, [isHydrated, pendingSave, session, supabase]);

  const planActions = usePlanActions({
    itineraries,
    session,
    supabase,
    setAuthError,
    setDraftPlans,
    setItineraries,
    setPendingSave,
    setWorkingPlans,
    workingPlans,
  });
  const itineraryActions = useItineraryActions({
    itineraries,
    session,
    setAuthError,
    setActiveItineraryId,
    setItineraries,
    setTravelProgress: setTravelProgressState,
    setWorkingPlans,
    supabase,
  });
  const clearAccountState = () => {
    setActiveItineraryId(null);
    setTravelProgressState({});
  };
  const authActions = useAuthActions({
    clearAccountState,
    session,
    supabase,
    setAuthError,
    setAuthPending,
    setDraftPlans,
    setItineraries,
    setPendingSave,
    setSession,
    setWorkingPlans,
  });

  const contextValue = useMemo<AppState>(() => ({
    isHydrated,
    session,
    authConfigured: supabase !== null,
    authPending,
    authError,
    places: SEED_PLACES,
    workingPlans,
    pendingSave,
    itineraries,
    activeItineraryId,
    travelProgress,
    ...planActions,
    ...authActions,
    ...itineraryActions,
    setTravelProgress: itineraryActions.setTravelPosition,
  }), [
    activeItineraryId,
    authActions,
    authError,
    authPending,
    isHydrated,
    itineraries,
    itineraryActions,
    pendingSave,
    planActions,
    session,
    supabase,
    travelProgress,
    workingPlans,
  ]);

  return <AppStateContext.Provider value={contextValue}>{children}</AppStateContext.Provider>;
}
