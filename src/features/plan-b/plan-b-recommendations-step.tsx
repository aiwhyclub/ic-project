"use client";

import type { PlanBAlternative } from "./plan-b-types";
import {
  formatDistance,
  getInformationStatusLabel,
  getReasonLabel,
  getTransportLabel,
} from "./plan-b-helpers";

type PlanBRecommendationsStepProps = Readonly<{
  alternatives: readonly PlanBAlternative[];
  selectedAlternativeId: string | null;
  isBusy: boolean;
  liveRefreshAvailable: boolean;
  onSelect: (alternativeId: string) => void;
  onRefreshLive: (alternative: PlanBAlternative) => void;
  onContinue: () => void;
  onBack: () => void;
}>;

export function PlanBRecommendationsStep({
  alternatives,
  selectedAlternativeId,
  isBusy,
  liveRefreshAvailable,
  onSelect,
  onRefreshLive,
  onContinue,
  onBack,
}: PlanBRecommendationsStepProps) {
  return (
    <section className="plan-b-panel" aria-labelledby="plan-b-recommendations-title">
      <div className="plan-b-step-heading">
        <span className="plan-b-step-number">3</span>
        <div>
          <p className="plan-b-kicker">조건에 맞는 후보를 비교합니다</p>
          <h2 id="plan-b-recommendations-title">대체 장소는 정확히 3곳입니다</h2>
        </div>
      </div>
      <p className="plan-b-explanation">
        추천 이유와 이동시간을 먼저 비교하세요. 카드에는 기본 검증정보와 실시간 확인 상태를 구분해 표시합니다.
      </p>
      <div className="plan-b-alternative-grid">
        {alternatives.map((alternative) => {
          const selected = alternative.id === selectedAlternativeId;
          return (
            <article className={`plan-b-alternative-card${selected ? " is-selected" : ""}`} key={alternative.id}>
              <div className="plan-b-card-topline">
                <span className="plan-b-rank">추천 {alternative.id === alternatives[0]?.id ? 1 : alternative.id === alternatives[1]?.id ? 2 : 3}</span>
                <span className="plan-b-status-chip">{getInformationStatusLabel(alternative.informationStatus)}</span>
              </div>
              <h3>{alternative.name}</h3>
              <p className="plan-b-card-category">{alternative.categoryLabel} · {alternative.address}</p>
              <p className="plan-b-card-reason">{alternative.whyRecommended}</p>
              <dl className="plan-b-card-meta">
                <div>
                  <dt>이동</dt>
                  <dd>{alternative.travelTimeMinutes}분 · {getTransportLabel(alternative.travelMode)} · {formatDistance(alternative.travelDistanceMeters)}</dd>
                </div>
                <div>
                  <dt>운영시간</dt>
                  <dd>{alternative.hoursLabel}</dd>
                </div>
                <div>
                  <dt>주의</dt>
                  <dd>{alternative.operatingCondition}</dd>
                </div>
                <div>
                  <dt>맞는 이유</dt>
                  <dd>{alternative.reasons.map(getReasonLabel).join(" · ")}</dd>
                </div>
              </dl>
              <p className="plan-b-card-checked">정보 확인일: {alternative.lastCheckedAt}</p>
              <div className="plan-b-card-actions">
                <button
                  className="plan-b-button plan-b-button--secondary"
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onSelect(alternative.id)}
                  disabled={isBusy}
                >
                  {selected ? "선택된 장소" : "이 장소 선택"}
                </button>
                {liveRefreshAvailable ? (
                  <button
                    className="plan-b-text-button"
                    type="button"
                    onClick={() => onRefreshLive(alternative)}
                    disabled={isBusy}
                  >
                    실시간 확인
                  </button>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
      <div className="plan-b-panel-actions">
        <button className="plan-b-button plan-b-button--secondary" type="button" onClick={onBack} disabled={isBusy}>
          조건 다시 고르기
        </button>
        <button className="plan-b-button plan-b-button--primary" type="button" onClick={onContinue} disabled={!selectedAlternativeId || isBusy}>
          교체할 장소 고르기
        </button>
      </div>
    </section>
  );
}
