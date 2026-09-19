"use client";

import type { PlanBAlternative, PlanBItinerary, PlanBItineraryStop, PlanBRouteSegment } from "./plan-b-types";
import { formatSegmentStatus } from "./plan-b-helpers";

type PlanBReplacementStepProps = Readonly<{
  itinerary: PlanBItinerary;
  selectedStopId: string;
  selectedAlternative: PlanBAlternative | null;
  routeSegments: readonly PlanBRouteSegment[];
  recalculationFromPosition: number | null;
  replacementReady: boolean;
  saved: boolean;
  isBusy: boolean;
  removedStop: PlanBItineraryStop | null;
  deferred: boolean;
  onSelectStop: (placeId: string) => void;
  onReplace: () => void;
  onSave: () => void;
  onDefer: () => void;
  onBack: () => void;
}>;

export function PlanBReplacementStep({
  itinerary,
  selectedStopId,
  selectedAlternative,
  routeSegments,
  recalculationFromPosition,
  replacementReady,
  saved,
  isBusy,
  removedStop,
  deferred,
  onSelectStop,
  onReplace,
  onSave,
  onDefer,
  onBack,
}: PlanBReplacementStepProps) {
  return (
    <section className="plan-b-panel" aria-labelledby="plan-b-replacement-title">
      <div className="plan-b-step-heading">
        <span className="plan-b-step-number">4</span>
        <div>
          <p className="plan-b-kicker">일정은 한 곳만 바꿉니다</p>
          <h2 id="plan-b-replacement-title">교체할 기존 장소를 확인하세요</h2>
        </div>
      </div>
      <p className="plan-b-explanation">
        아래 순서에서 한 곳만 선택합니다. 선택하지 않은 장소와 방문 순서는 그대로 유지하고, 선택한 위치 이후 구간만 다시 계산합니다.
      </p>
      <div className="plan-b-stop-list" role="list" aria-label="교체할 일정 장소">
        {itinerary.stops.map((stop) => {
          const selected = stop.placeId === selectedStopId;
          return (
            <button
              className={`plan-b-stop-row${selected ? " is-selected" : ""}`}
              key={`${stop.position}-${stop.placeId}`}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelectStop(stop.placeId)}
              disabled={isBusy || saved}
            >
              <span className="plan-b-stop-position">{stop.position}</span>
              <span>
                <strong>{stop.name}</strong>
                <small>{stop.categoryLabel} · {stop.dwellMinutes}분</small>
              </span>
            </button>
          );
        })}
      </div>
      <div className="plan-b-replacement-summary">
        <p>교체 대상: <strong>{removedStop?.name ?? itinerary.stops.find((stop) => stop.placeId === selectedStopId)?.name ?? "장소를 선택하세요"}</strong></p>
        <p>선택 후보: <strong>{selectedAlternative?.name ?? "추천 카드에서 장소를 선택하세요"}</strong></p>
      </div>
      <div className="plan-b-panel-actions">
        <button className="plan-b-button plan-b-button--secondary" type="button" onClick={onBack} disabled={isBusy || saved}>
          추천 다시 보기
        </button>
        <button className="plan-b-button plan-b-button--primary" type="button" onClick={onReplace} disabled={!selectedAlternative || !selectedStopId || isBusy || saved}>
          장소 교체 후 구간 재계산
        </button>
      </div>
      {recalculationFromPosition !== null ? (
        <p className="plan-b-selection" role="status">
          {recalculationFromPosition}번 장소부터 이후 구간을 다시 계산했습니다. 기존 순서는 유지됩니다.
        </p>
      ) : null}
      {routeSegments.length > 0 ? (
        <div className="plan-b-segment-list" aria-label="교체 후 이동 구간">
          {routeSegments.map((segment) => (
            <div className={`plan-b-segment${recalculationFromPosition !== null && segment.position >= recalculationFromPosition ? " is-updated" : ""}`} key={segment.id}>
              <span>{segment.originName} → {segment.destinationName}</span>
              <strong>{formatSegmentStatus(segment)}</strong>
            </div>
          ))}
        </div>
      ) : null}
      {replacementReady && !saved ? (
        <button className="plan-b-button plan-b-button--primary plan-b-save-button" type="button" onClick={onSave} disabled={isBusy}>
          변경한 계획 저장하기
        </button>
      ) : null}
      {saved ? (
        <div className="plan-b-saved-box" role="status">
          <strong>플랜B 교체를 저장했습니다.</strong>
          <p>기존 장소 ‘{removedStop?.name ?? "선택한 장소"}’가 일정에서 빠졌고, 나머지 장소와 순서는 보존되었습니다.</p>
          {removedStop && !deferred ? (
            <button className="plan-b-button plan-b-button--secondary" type="button" onClick={onDefer} disabled={isBusy}>
              다음에 가기로 저장 · {removedStop.name}
            </button>
          ) : null}
          {deferred ? <p className="plan-b-note">마이페이지의 다음 방문 목록에 보관했습니다.</p> : null}
        </div>
      ) : null}
    </section>
  );
}
