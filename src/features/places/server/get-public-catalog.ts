import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type PublicPlace = Pick<
  Database["public"]["Tables"]["places"]["Row"],
  "address" | "category" | "default_dwell_minutes" | "id" | "name" | "verified_at"
>;

export type PublicCuration = Pick<
  Database["public"]["Tables"]["curations"]["Row"],
  "audience_type" | "duration_minutes" | "id" | "title" | "transport_mode"
>;

export type PublicCatalogResult =
  | {
      readonly kind: "ready";
      readonly places: readonly PublicPlace[];
      readonly curations: readonly PublicCuration[];
    }
  | {
      readonly kind: "unavailable";
      readonly message: string;
    };

export async function getPublicCatalog(): Promise<PublicCatalogResult> {
  const url = process.env["SUPABASE_URL"];
  const publishableKey = process.env["SUPABASE_PUBLISHABLE_KEY"];

  if (!url || !publishableKey) {
    return {
      kind: "unavailable",
      message: "로컬 Supabase 연결값이 없어 공개 데이터를 불러오지 못했습니다.",
    };
  }

  const supabase = createClient<Database>(url, publishableKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });

  const [placesResponse, curationsResponse] = await Promise.all([
    supabase
      .from("places")
      .select("id,name,category,address,default_dwell_minutes,verified_at")
      .eq("is_active", true)
      .order("name"),
    supabase
      .from("curations")
      .select("id,title,audience_type,transport_mode,duration_minutes")
      .order("published_at"),
  ]);

  if (placesResponse.error || curationsResponse.error) {
    return {
      kind: "unavailable",
      message: "공개 데이터 연결에 실패했습니다. 잠시 뒤 다시 확인해 주세요.",
    };
  }

  return {
    kind: "ready",
    places: placesResponse.data,
    curations: curationsResponse.data,
  };
}
