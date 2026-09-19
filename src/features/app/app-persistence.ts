import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { Itinerary, WorkingPlan } from "./app-types";
import { toDatabasePlaceId } from "./app-place-ids";

export type AppSupabaseClient = SupabaseClient<Database>;

export type PersistenceResult =
  | { readonly kind: "ok" }
  | { readonly kind: "error"; readonly message: string };

export type LoadedAccountData =
  | {
      readonly kind: "ready";
      readonly itineraries: readonly Itinerary[];
      readonly drafts: readonly WorkingPlan[];
    }
  | { readonly kind: "error"; readonly message: string };

type ItineraryInsert = Database["public"]["Tables"]["itineraries"]["Insert"];
type ItineraryStopInsert = Database["public"]["Tables"]["itinerary_stops"]["Insert"];
type ItineraryDraftInsert = Database["public"]["Tables"]["itinerary_drafts"]["Insert"];

const PERSIST_ERROR = "저장한 동선을 계정에 반영하지 못했습니다. 잠시 후 다시 시도해 주세요.";
const DRAFT_ERROR = "편집 중인 초안을 계정에 동기화하지 못했습니다.";

function failed(message: string): PersistenceResult {
  return { kind: "error", message };
}

type ItineraryDraftPayload = Database["public"]["Tables"]["itinerary_drafts"]["Row"]["draft_payload"];

function draftPayload(plan: WorkingPlan): ItineraryDraftPayload {
  return {
    transport_mode: plan.transportMode,
    stops: plan.stops.flatMap((stop) => {
      const placeId = toDatabasePlaceId(stop.placeId);
      return placeId === null ? [] : [{
        place_id: placeId,
        position: stop.position + 1,
        dwell_minutes: stop.dwellMinutes,
      }];
    }),
  };
}

function toItineraryInsert(itinerary: Itinerary): ItineraryInsert {
  return {
    id: itinerary.id,
    user_id: itinerary.userId,
    title: itinerary.title,
    travel_date: itinerary.travelDate.length === 0 ? null : itinerary.travelDate,
    companion_type: itinerary.companionType,
    transport_mode: itinerary.transportMode,
    status: "confirmed",
    source_curation_id: null,
    use_realtime_info: false,
  };
}

function toStopInserts(itinerary: Itinerary): ItineraryStopInsert[] {
  return itinerary.stops.flatMap((stop) => {
    const placeId = toDatabasePlaceId(stop.placeId);
    return placeId === null ? [] : [{
      itinerary_id: itinerary.id,
      place_id: placeId,
      position: stop.position + 1,
      dwell_minutes: stop.dwellMinutes,
    }];
  });
}

export async function persistItinerary(
  supabase: AppSupabaseClient,
  userId: string,
  itinerary: Itinerary,
): Promise<PersistenceResult> {
  if (itinerary.userId !== userId) {
    return { kind: "error", message: PERSIST_ERROR };
  }
  try {
    const itineraryResponse = await supabase
      .from("itineraries")
      .upsert(toItineraryInsert(itinerary), { onConflict: "id" });
    if (itineraryResponse.error !== null) {
      return failed(PERSIST_ERROR);
    }

    const deleteStopsResponse = await supabase
      .from("itinerary_stops")
      .delete()
      .eq("itinerary_id", itinerary.id);
    if (deleteStopsResponse.error !== null) {
      return failed(PERSIST_ERROR);
    }

    const stops = toStopInserts(itinerary);
    if (stops.length !== itinerary.stops.length) {
      return failed(PERSIST_ERROR);
    }
    if (stops.length > 0) {
      const stopsResponse = await supabase.from("itinerary_stops").insert(stops);
      if (stopsResponse.error !== null) {
        return failed(PERSIST_ERROR);
      }
    }
    return { kind: "ok" };
  } catch {
    return { kind: "error", message: PERSIST_ERROR };
  }
}

export async function persistItineraries(
  supabase: AppSupabaseClient,
  userId: string,
  itineraries: readonly Itinerary[],
): Promise<PersistenceResult> {
  for (const itinerary of itineraries) {
    const result = await persistItinerary(supabase, userId, itinerary);
    if (result.kind === "error") {
      return result;
    }
  }
  return { kind: "ok" };
}

export async function deletePersistedItinerary(
  supabase: AppSupabaseClient,
  userId: string,
  itineraryId: string,
): Promise<PersistenceResult> {
  try {
    const response = await supabase
      .from("itineraries")
      .delete()
      .eq("id", itineraryId)
      .eq("user_id", userId);
    return response.error === null ? { kind: "ok" } : failed(PERSIST_ERROR);
  } catch {
    return { kind: "error", message: PERSIST_ERROR };
  }
}

export async function upsertItineraryDraft(
  supabase: AppSupabaseClient,
  userId: string,
  itinerary: Itinerary,
  plan: WorkingPlan,
): Promise<PersistenceResult> {
  if (itinerary.userId !== userId || plan.sourceItineraryId !== itinerary.id) {
    return { kind: "error", message: DRAFT_ERROR };
  }
  const row: ItineraryDraftInsert = {
    itinerary_id: itinerary.id,
    user_id: userId,
    draft_payload: draftPayload(plan),
    saved_at: new Date().toISOString(),
    base_updated_at: itinerary.updatedAt,
  };
  try {
    const response = await supabase.from("itinerary_drafts").upsert(row, { onConflict: "itinerary_id" });
    return response.error === null ? { kind: "ok" } : failed(DRAFT_ERROR);
  } catch {
    return { kind: "error", message: DRAFT_ERROR };
  }
}

export async function deleteItineraryDraft(
  supabase: AppSupabaseClient,
  userId: string,
  itineraryId: string,
): Promise<PersistenceResult> {
  try {
    const response = await supabase
      .from("itinerary_drafts")
      .delete()
      .eq("itinerary_id", itineraryId)
      .eq("user_id", userId);
    return response.error === null ? { kind: "ok" } : failed(DRAFT_ERROR);
  } catch {
    return { kind: "error", message: DRAFT_ERROR };
  }
}
