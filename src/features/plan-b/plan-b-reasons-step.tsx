"use client";

import type { PlanBReason, PlanBReasonRule } from "@/lib/domain/types";

import { getReasonLabel } from "./plan-b-helpers";

type PlanBReasonsStepProps = Readonly<{
  rules: readonly PlanBReasonRule[];
  reasons: readonly PlanBReason[];
  isBusy: boolean;
  message: string;
  onToggle: (reason: PlanBReason, checked: boolean) => void;
  onContinue: () => void;
}>;

export function PlanBReasonsStep({
  rules,
  reasons,
  isBusy,
  message,
  onToggle,
  onContinue,
}: PlanBReasonsStepProps) {
  return (
    <section className="plan-b-panel" aria-labelledby="plan-b-reasons-title">
      <div className="plan-b-step-heading">
        <span className="plan-b-step-number">2</span>
        <div>
          <p className="plan-b-kicker">상황을 한 개 이상 알려주세요</p>
          <h2 id="plan-b-reasons-title">왜 기존 장소를 이용하기 어려운가요?</h2>
        </div>
      </div>
      <p className="plan-b-explanation">
        여러 이유를 고르면 추천 규칙이 겹쳐 적용됩니다. 선택한 이유는 이번 추천 계산에만 사용하고 일정의 메모로 저장하지 않습니다.
      </p>
      <div className="plan-b-reason-list">
        {rules.map((rule) => (
          <label className="plan-b-check-card" key={rule.reason}>
            <input
              type="checkbox"
              checked={reasons.includes(rule.reason)}
              onChange={(event) => onToggle(rule.reason, event.currentTarget.checked)}
            />
            <span>
              <strong>{getReasonLabel(rule.reason)}</strong>
              <small>{rule.description}</small>
            </span>
          </label>
        ))}
      </div>
      <p className="plan-b-note" role="status">
        {message || "현재 상황에 해당하는 이유를 하나 이상 선택하세요."}
      </p>
      <button className="plan-b-button plan-b-button--primary" type="button" onClick={onContinue} disabled={isBusy}>
        대체 장소 3곳 찾기
      </button>
    </section>
  );
}
