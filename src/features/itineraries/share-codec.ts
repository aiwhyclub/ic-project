import type { Itinerary, PlanStop, TransportMode } from "@/features/app/app-state";

export type SharedItinerary = Readonly<{
  title: string;
  travelDate: string;
  transportMode: TransportMode;
  stops: readonly PlanStop[];
}>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isTransportMode(value: unknown): value is TransportMode {
  return value === "walk" || value === "car" || value === "transit";
}

function isPlanStop(value: unknown): value is PlanStop {
  if (!isRecord(value)) {
    return false;
  }
  return typeof value["placeId"] === "string"
    && typeof value["position"] === "number"
    && typeof value["dwellMinutes"] === "number";
}

function isSharedItinerary(value: unknown): value is SharedItinerary {
  if (!isRecord(value)) {
    return false;
  }
  return typeof value["title"] === "string"
    && typeof value["travelDate"] === "string"
    && isTransportMode(value["transportMode"])
    && Array.isArray(value["stops"])
    && value["stops"].every(isPlanStop);
}

function toBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function fromBase64Url(value: string): string {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeSharedItinerary(itinerary: Itinerary): string {
  const payload: SharedItinerary = {
    title: itinerary.title,
    travelDate: itinerary.travelDate,
    transportMode: itinerary.transportMode,
    stops: itinerary.stops,
  };
  return toBase64Url(JSON.stringify(payload));
}

export function decodeSharedItinerary(encoded: string): SharedItinerary | null {
  try {
    const parsed: unknown = JSON.parse(fromBase64Url(encoded));
    return isSharedItinerary(parsed) ? parsed : null;
  } catch (error) {
    if (error instanceof SyntaxError || error instanceof DOMException) {
      return null;
    }
    throw error;
  }
}
