import type { Coordinates, PlanBReason, TransportMode } from "@/lib/domain/types";

import {
  DEFAULT_PLAN_B_ALTERNATIVES,
  PLAN_B_REASON_LABELS,
} from "./plan-b-fixtures";
import type {
  PlanBAlternative,
  PlanBLocationSelection,
  PlanBRouteSegment,
} from "./plan-b-types";

export type PlanBPhase = "location" | "reasons" | "recommendations" | "replacement" | "saved";
export type PlanBBusyAction = "location" | "recommendation" | "route" | "live" | "save" | null;
export type PlanBFailureKind = "location" | "recommendation" | "route" | "live" | "save";

export type PlanBFailure = {
  readonly kind: PlanBFailureKind;
  readonly message: string;
  readonly retryable: boolean;
  readonly fallbackUsed: boolean;
};

export type PlanBManualRegion = {
  readonly id: string;
  readonly label: string;
};

export const PLAN_B_MANUAL_REGIONS: readonly PlanBManualRegion[] = [
  { id: "region-seolbong", label: "설봉공원 권역" },
  { id: "region-ceramics", label: "도자예술마을 권역" },
  { id: "region-market", label: "이천중앙시장 권역" },
];

export function getTransportLabel(mode: TransportMode): string {
  if (mode === "walk") return "도보";
  if (mode === "transit") return "대중교통";
  return "자차";
}

export function getLocationSourceLabel(source: PlanBLocationSelection["source"]): string {
  if (source === "consented-current") return "동의한 현재 위치";
  if (source === "manual-place") return "직접 고른 현재 장소";
  return "직접 고른 이천 권역";
}

export function getInformationStatusLabel(status: PlanBAlternative["informationStatus"]): string {
  if (status === "realtime") return "실시간 확인";
  if (status === "realtime-unavailable") return "실시간 실패 · 기본 검증정보 사용";
  return "기본 검증정보";
}

export function getReasonLabel(reason: PlanBReason): string {
  return PLAN_B_REASON_LABELS[reason];
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

export function deriveRegionLabel(coordinates: Coordinates): string {
  const nearIcheon = coordinates.latitude >= 37.1 && coordinates.latitude <= 37.4;
  const longitudeInRange = coordinates.longitude >= 127.2 && coordinates.longitude <= 127.7;
  return nearIcheon && longitudeInRange ? "이천 현재 위치 권역" : "이천 인근 현재 위치 권역";
}

export function ensureThreeAlternatives(
  candidates: readonly PlanBAlternative[],
): readonly PlanBAlternative[] {
  const merged: PlanBAlternative[] = [];

  for (const candidate of candidates) {
    if (merged.length === 3) break;
    if (!merged.some((item) => item.id === candidate.id)) merged.push(candidate);
  }

  for (const candidate of DEFAULT_PLAN_B_ALTERNATIVES) {
    if (merged.length === 3) break;
    if (!merged.some((item) => item.id === candidate.id)) merged.push(candidate);
  }

  return merged;
}

export function findAlternative(
  alternatives: readonly PlanBAlternative[],
  id: string | null,
): PlanBAlternative | null {
  if (!id) return null;
  return alternatives.find((alternative) => alternative.id === id) ?? null;
}

export function hasFailedSegment(segments: readonly PlanBRouteSegment[]): boolean {
  return segments.some((segment) => segment.status === "failed");
}

export function formatSegmentStatus(segment: PlanBRouteSegment): string {
  if (segment.status === "pending") return "계산 중";
  if (segment.status === "failed") return "계산 실패";
  return `${segment.durationMinutes}분 · ${formatDistance(segment.distanceMeters)}`;
}

export function createOperationId(prefix: string): string {
  return `${prefix}-${Date.now()}`;
}
