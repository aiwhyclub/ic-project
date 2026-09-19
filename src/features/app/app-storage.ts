import {
  createClient,
  type Session,
  type SupabaseClient,
} from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type {
  AppSession,
  AuthProvider,
  Itinerary,
  PersistedState,
  PlanStop,
  RouteSegment,
  SegmentStatus,
  TransportMode,
  WorkingPlan,
} from "./app-types";

export const STORAGE_KEY = "icheon-savepoint:app-state:v2";

export function readPersistedState(): PersistedState | null {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === null) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(stored);
    return isPersistedState(parsed) ? parsed : null;
  } catch (error) {
    if (error instanceof SyntaxError) {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    return null;
  }
}

export function isRemoteSession(session: AppSession | null): boolean {
  return session !== null && session.provider !== "demo";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isTransportMode(value: unknown): value is TransportMode {
  return value === "walk" || value === "car" || value === "transit";
}

function isAuthProvider(value: unknown): value is AuthProvider {
  return value === "google" || value === "kakao" || value === "demo";
}

function isSession(value: unknown): value is AppSession {
  return isRecord(value) && typeof value["userId"] === "string" && typeof value["email"] === "string" &&
    typeof value["displayName"] === "string" && isAuthProvider(value["provider"]);
}

function isPlanStop(value: unknown): value is PlanStop {
  return isRecord(value) && typeof value["placeId"] === "string" && typeof value["position"] === "number" &&
    typeof value["dwellMinutes"] === "number";
}

function isSegmentStatus(value: unknown): value is SegmentStatus {
  return value === "idle" || value === "calculating" || value === "ready" || value === "error";
}

function isRouteSegment(value: unknown): value is RouteSegment {
  return isRecord(value) && typeof value["id"] === "string" && typeof value["fromPlaceId"] === "string" &&
    typeof value["toPlaceId"] === "string" && typeof value["distanceMeters"] === "number" &&
    typeof value["durationMinutes"] === "number" && isSegmentStatus(value["status"]) &&
    (typeof value["errorMessage"] === "string" || value["errorMessage"] === null) &&
    (typeof value["lastCalculatedAt"] === "string" || value["lastCalculatedAt"] === null);
}

function isWorkingPlan(value: unknown): value is WorkingPlan {
  return isRecord(value) && typeof value["id"] === "string" &&
    (typeof value["sourceItineraryId"] === "string" || value["sourceItineraryId"] === null) &&
    typeof value["title"] === "string" && typeof value["travelDate"] === "string" &&
    typeof value["companionType"] === "string" && isTransportMode(value["transportMode"]) &&
    Array.isArray(value["stops"]) && value["stops"].every(isPlanStop) && Array.isArray(value["segments"]) &&
    value["segments"].every(isRouteSegment) && typeof value["updatedAt"] === "string";
}

function isItinerary(value: unknown): value is Itinerary {
  return isRecord(value) && typeof value["id"] === "string" && typeof value["userId"] === "string" &&
    typeof value["title"] === "string" && typeof value["travelDate"] === "string" &&
    typeof value["companionType"] === "string" && value["status"] === "confirmed" &&
    isTransportMode(value["transportMode"]) && Array.isArray(value["stops"]) && value["stops"].every(isPlanStop) &&
    typeof value["createdAt"] === "string" && typeof value["updatedAt"] === "string";
}

export function isPersistedState(value: unknown): value is PersistedState {
  if (!isRecord(value)) {
    return false;
  }
  const pendingSave = value["pendingSave"];
  const activeItineraryId = value["activeItineraryId"];
  const travelProgress = value["travelProgress"];
  return (value["session"] === null || isSession(value["session"])) && Array.isArray(value["workingPlans"]) &&
    value["workingPlans"].every(isWorkingPlan) &&
    (pendingSave === null || (Array.isArray(pendingSave) && pendingSave.every(isWorkingPlan))) &&
    Array.isArray(value["draftPlans"]) && value["draftPlans"].every(isWorkingPlan) &&
    Array.isArray(value["itineraries"]) && value["itineraries"].every(isItinerary) &&
    (activeItineraryId === null || typeof activeItineraryId === "string") &&
    isRecord(travelProgress) && Object.values(travelProgress).every((position) => typeof position === "number");
}

export function sessionFromSupabase(session: Session): AppSession {
  const providerValue = session.user.app_metadata["provider"];
  const provider: AuthProvider = providerValue === "google" || providerValue === "kakao" ? providerValue : "demo";
  const fullName = session.user.user_metadata["full_name"];
  const shortName = session.user.user_metadata["name"];
  const displayName = typeof fullName === "string" ? fullName : typeof shortName === "string" ? shortName : session.user.email ?? "이천 여행자";
  return { userId: session.user.id, email: session.user.email ?? "", displayName, provider };
}

export function createSupabaseClient(): SupabaseClient<Database> | null {
  if (typeof window === "undefined") {
    return null;
  }
  const url = process.env["NEXT_PUBLIC_SUPABASE_URL"];
  const key = process.env["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"] ?? process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"];
  if (!url || !key) {
    return null;
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: true, detectSessionInUrl: true, persistSession: true },
  });
}
