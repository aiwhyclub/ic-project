import type { Database } from "@/types/database";
import { planFromItinerary } from "./app-seed";
import type { Itinerary, PlanStop } from "./app-types";
import type { AppSupabaseClient, LoadedAccountData } from "./app-persistence";
import { toAppPlaceId } from "./app-place-ids";

type ItineraryRow = Database["public"]["Tables"]["itineraries"]["Row"];
type ItineraryStopRow = Database["public"]["Tables"]["itinerary_stops"]["Row"];
type ItineraryDraftPayload = Database["public"]["Tables"]["itinerary_drafts"]["Row"]["draft_payload"];

const ACCOUNT_LOAD_ERROR = "저장한 동선을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.";

function toPlanStop(row: ItineraryStopRow): PlanStop {
  return { placeId: toAppPlaceId(row.place_id) ?? row.place_id, position: Math.max(0, row.position - 1), dwellMinutes: row.dwell_minutes };
}

function toItinerary(row: ItineraryRow, stops: readonly PlanStop[]): Itinerary | null {
  if (row.status !== "confirmed") {
    return null;
  }
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    travelDate: row.travel_date ?? "",
    companionType: row.companion_type,
    transportMode: row.transport_mode,
    status: "confirmed",
    stops,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function draftStops(payload: ItineraryDraftPayload): readonly PlanStop[] {
  return payload.stops.filter((stop) => stop.position > 0).map((stop) => ({
    placeId: toAppPlaceId(stop.place_id) ?? stop.place_id,
    position: stop.position - 1,
    dwellMinutes: stop.dwell_minutes,
  }));
}

export async function loadAccountData(supabase: AppSupabaseClient, userId: string): Promise<LoadedAccountData> {
  try {
    const itineraryResponse = await supabase
      .from("itineraries")
      .select("id,user_id,title,travel_date,companion_type,transport_mode,status,source_curation_id,use_realtime_info,created_at,updated_at")
      .eq("user_id", userId)
      .eq("status", "confirmed")
      .order("updated_at", { ascending: false });
    if (itineraryResponse.error !== null || itineraryResponse.data === null) {
      return { kind: "error", message: ACCOUNT_LOAD_ERROR };
    }

    const rows = itineraryResponse.data.filter((row) => row.user_id === userId && row.status === "confirmed");
    const itineraryIds = rows.map((row) => row.id);
    if (itineraryIds.length === 0) {
      return { kind: "ready", itineraries: [], drafts: [] };
    }

    const [stopsResponse, draftsResponse] = await Promise.all([
      supabase.from("itinerary_stops").select("id,itinerary_id,place_id,position,dwell_minutes,created_at").in("itinerary_id", itineraryIds).order("position"),
      supabase.from("itinerary_drafts").select("itinerary_id,user_id,draft_payload,saved_at,base_updated_at").eq("user_id", userId).in("itinerary_id", itineraryIds),
    ]);
    if (stopsResponse.error !== null || stopsResponse.data === null || draftsResponse.error !== null || draftsResponse.data === null) {
      return { kind: "error", message: ACCOUNT_LOAD_ERROR };
    }

    const stopsByItinerary = new Map<string, PlanStop[]>();
    for (const row of stopsResponse.data) {
      const stops = stopsByItinerary.get(row.itinerary_id) ?? [];
      stops.push(toPlanStop(row));
      stopsByItinerary.set(row.itinerary_id, stops);
    }
    const itineraries = rows.flatMap((row) => {
      const itinerary = toItinerary(row, stopsByItinerary.get(row.id) ?? []);
      return itinerary === null ? [] : [itinerary];
    });
    const itineraryById = new Map(itineraries.map((itinerary) => [itinerary.id, itinerary]));
    const drafts = draftsResponse.data.flatMap((row) => {
      const itinerary = itineraryById.get(row.itinerary_id);
      if (itinerary === undefined || row.user_id !== userId) {
        return [];
      }
      return [planFromItinerary({ ...itinerary, transportMode: row.draft_payload.transport_mode, stops: draftStops(row.draft_payload) })];
    });
    return { kind: "ready", itineraries, drafts };
  } catch {
    return { kind: "error", message: ACCOUNT_LOAD_ERROR };
  }
}
