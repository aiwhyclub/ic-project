"use client";

import type { PlanBBusyAction, PlanBFailure } from "./plan-b-helpers";

type PlanBStatusProps = Readonly<{
  failure: PlanBFailure | null;
  busyAction: PlanBBusyAction;
  onRetry: () => void;
}>;

const FAILURE_LABELS: Readonly<Record<PlanBFailure["kind"], string>> = {
  location: "위치 선택",
  recommendation: "추천 계산",
  route: "경로 재계산",
  live: "실시간 정보",
  save: "변경 저장",
};

export function PlanBStatus({ failure, busyAction, onRetry }: PlanBStatusProps) {
  if (busyAction) {
    const busyLabel =
      busyAction === "location"
        ? "현재 위치를 확인하는 중입니다."
        : busyAction === "recommendation"
          ? "조건에 맞는 대체 장소 3곳을 찾는 중입니다."
          : busyAction === "route"
            ? "교체된 장소 이후 구간을 다시 계산하는 중입니다."
            : busyAction === "live"
              ? "실시간 운영정보를 확인하는 중입니다."
              : "변경한 계획을 저장하는 중입니다.";

    return (
      <p className="plan-b-status plan-b-status--busy" role="status" aria-live="polite">
        {busyLabel}
      </p>
    );
  }

  if (!failure) return null;

  return (
    <div className="plan-b-status plan-b-status--error" role="alert">
      <p>
        <strong>{FAILURE_LABELS[failure.kind]}에 문제가 생겼습니다.</strong> {failure.message}
      </p>
      {failure.retryable ? (
        <button className="plan-b-button plan-b-button--secondary" type="button" onClick={onRetry}>
          다시 시도
        </button>
      ) : null}
    </div>
  );
}
