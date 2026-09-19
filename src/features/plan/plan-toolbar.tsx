"use client";

import type { WorkingPlan } from "@/features/app/app-state";

type PlanToolbarProps = Readonly<{
  readonly plans: readonly WorkingPlan[];
  readonly activePlanId: string;
  readonly onSelect: (planId: string) => void;
}>;

export function PlanToolbar({ plans, activePlanId, onSelect }: PlanToolbarProps) {
  return (
    <div className="plan-toolbar" role="tablist" aria-label="편집할 일정 선택">
      {plans.map((plan, index) => (
        <button
          className="plan-toolbar__tab"
          type="button"
          role="tab"
          aria-selected={plan.id === activePlanId}
          key={plan.id}
          onClick={() => onSelect(plan.id)}
        >
          <span>일정 {index + 1}</span>
          <strong>{plan.title}</strong>
          <small>{plan.stops.length}곳 · {plan.transportMode === "car" ? "자차" : plan.transportMode === "walk" ? "도보" : "대중교통"}</small>
        </button>
      ))}
    </div>
  );
}
