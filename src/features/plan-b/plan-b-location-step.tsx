"use client";

import type { ChangeEvent } from "react";

import type { PlanBItinerary } from "./plan-b-types";
import type { PlanBManualRegion } from "./plan-b-helpers";
import { getLocationSourceLabel } from "./plan-b-helpers";

type PlanBLocationStepProps = Readonly<{
  itinerary: PlanBItinerary;
  regions: readonly PlanBManualRegion[];
  location: {
    readonly source: "consented-current" | "manual-region" | "manual-place";
    readonly label: string;
  } | null;
  selectedRegionId: string;
  selectedPlaceId: string;
  isRequesting: boolean;
  message: string;
  onUseCurrentLocation: () => void;
  onRegionChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  onPlaceChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  onContinue: () => void;
}>;

export function PlanBLocationStep({
  itinerary,
  regions,
  location,
  selectedRegionId,
  selectedPlaceId,
  isRequesting,
  message,
  onUseCurrentLocation,
  onRegionChange,
  onPlaceChange,
  onContinue,
}: PlanBLocationStepProps) {
  return (
    <section className="plan-b-panel" aria-labelledby="plan-b-location-title">
      <div className="plan-b-step-heading">
        <span className="plan-b-step-number">1</span>
        <div>
          <p className="plan-b-kicker">먼저 위치 기준을 정합니다</p>
          <h2 id="plan-b-location-title">어디에서 다음 장소를 찾을까요?</h2>
        </div>
      </div>
      <p className="plan-b-explanation">
        현재 위치는 대체 장소까지의 가까운 이동시간을 계산할 때만 잠시 사용합니다. 권한을 누르기 전에는 위치를 읽지 않으며,
        지역을 정한 뒤 좌표를 저장하거나 기록하지 않습니다.
      </p>
      <div className="plan-b-choice-grid">
        <button
          className="plan-b-choice plan-b-choice--primary"
          type="button"
          onClick={onUseCurrentLocation}
          disabled={isRequesting}
        >
          <strong>{isRequesting ? "위치 확인 중…" : "현재 위치로 찾기"}</strong>
          <span>브라우저 권한을 한 번 요청합니다.</span>
        </button>
        <label className="plan-b-field">
          <span>이천 권역 직접 선택</span>
          <select value={selectedRegionId} onChange={onRegionChange}>
            <option value="">권역을 선택하세요</option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.label}
              </option>
            ))}
          </select>
        </label>
        <label className="plan-b-field">
          <span>현재 장소 직접 선택</span>
          <select value={selectedPlaceId} onChange={onPlaceChange}>
            <option value="">일정의 장소를 선택하세요</option>
            {itinerary.stops.map((stop) => (
              <option key={stop.placeId} value={stop.placeId}>
                {stop.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      {location ? (
        <p className="plan-b-selection" role="status">
          선택됨: <strong>{location.label}</strong> · {getLocationSourceLabel(location.source)}
        </p>
      ) : null}
      <p className="plan-b-note" role="status">
        {message}
      </p>
      <button className="plan-b-button plan-b-button--primary" type="button" onClick={onContinue} disabled={!location}>
        막힌 이유 선택하기
      </button>
    </section>
  );
}
