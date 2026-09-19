export type Json =
  | string
  | number
  | boolean
  | null
  | { readonly [key: string]: Json | undefined }
  | readonly Json[];

export type TransportMode = "walk" | "car" | "transit";
export type ItineraryStatus = "draft" | "confirmed" | "in_progress" | "completed" | "archived";

export type ItineraryDraftStop = {
  readonly place_id: string;
  readonly position: number;
  readonly dwell_minutes: number;
};

export type ItineraryDraftPayload = {
  readonly transport_mode: TransportMode;
  readonly stops: readonly ItineraryDraftStop[];
};

type Table<Row> = {
  readonly Row: Row;
  readonly Insert: Partial<Row>;
  readonly Update: Partial<Row>;
  readonly Relationships: [];
};

type PlaceRow = {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly address: string;
  readonly phone: string | null;
  readonly opening_hours: Json;
  readonly closed_days: readonly string[];
  readonly market_days: readonly string[];
  readonly reservation_required: boolean;
  readonly parking_info: string | null;
  readonly default_dwell_minutes: number;
  readonly source_url: string;
  readonly verified_at: string;
  readonly is_active: boolean;
  readonly tags: readonly string[];
  readonly created_at: string;
  readonly updated_at: string;
};

type PlaceMediaRow = {
  readonly id: string;
  readonly place_id: string;
  readonly asset_url: string;
  readonly alt_text: string;
  readonly license_source: string;
  readonly display_order: number;
  readonly created_at: string;
};

type CurationRow = {
  readonly id: string;
  readonly title: string;
  readonly audience_type: string;
  readonly transport_mode: TransportMode;
  readonly duration_minutes: number;
  readonly interest_tags: readonly string[];
  readonly recommendation_reason: string;
  readonly is_fallback: boolean;
  readonly published_at: string | null;
  readonly created_at: string;
  readonly updated_at: string;
};

type CurationStopRow = {
  readonly curation_id: string;
  readonly place_id: string;
  readonly position: number;
  readonly dwell_minutes: number;
  readonly stop_reason: string;
  readonly created_at: string;
};

type PlanBRuleRow = {
  readonly id: string;
  readonly blocked_reason: string;
  readonly required_tags: readonly string[];
  readonly excluded_tags: readonly string[];
  readonly priority: number;
  readonly max_distance_meters: number | null;
  readonly max_duration_minutes: number | null;
  readonly recommendation_reason: string;
  readonly created_at: string;
  readonly updated_at: string;
};

type ItineraryRow = {
  readonly id: string;
  readonly user_id: string;
  readonly title: string;
  readonly travel_date: string | null;
  readonly companion_type: string;
  readonly transport_mode: TransportMode;
  readonly status: ItineraryStatus;
  readonly source_curation_id: string | null;
  readonly use_realtime_info: boolean;
  readonly created_at: string;
  readonly updated_at: string;
};

type ItineraryStopRow = {
  readonly id: string;
  readonly itinerary_id: string;
  readonly place_id: string;
  readonly position: number;
  readonly dwell_minutes: number;
  readonly created_at: string;
};

type ItineraryDraftRow = {
  readonly itinerary_id: string;
  readonly user_id: string;
  readonly draft_payload: ItineraryDraftPayload;
  readonly saved_at: string;
  readonly base_updated_at: string;
};

export type Database = {
  readonly public: {
    readonly Tables: {
      readonly places: Table<PlaceRow>;
      readonly place_media: Table<PlaceMediaRow>;
      readonly curations: Table<CurationRow>;
      readonly curation_stops: Table<CurationStopRow>;
      readonly plan_b_rules: Table<PlanBRuleRow>;
      readonly itineraries: Table<ItineraryRow>;
      readonly itinerary_stops: Table<ItineraryStopRow>;
      readonly itinerary_drafts: Table<ItineraryDraftRow>;
    };
    readonly Views: Record<never, never>;
    readonly Functions: {
      readonly delete_account: {
        readonly Args: Record<string, never>;
        readonly Returns: null;
      };
    };
    readonly Enums: Record<never, never>;
    readonly CompositeTypes: Record<never, never>;
  };
};
