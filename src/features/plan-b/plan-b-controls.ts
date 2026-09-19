import type { Dispatch, SetStateAction } from "react";

import type { PlanBReason } from "@/lib/domain/types";

import type { PlanBFailure } from "./plan-b-helpers";

export function updatePlanBReasons(
  reason: PlanBReason,
  checked: boolean,
  setReasons: Dispatch<SetStateAction<readonly PlanBReason[]>>,
  setFailure: Dispatch<SetStateAction<PlanBFailure | null>>,
) {
  setReasons((current) => {
    if (checked) return current.includes(reason) ? current : [...current, reason];
    return current.filter((item) => item !== reason);
  });
  setFailure(null);
}

type RetryActions = Readonly<{
  requestRecommendations: () => Promise<void>;
  replaceStop: () => Promise<void>;
  saveReplacement: () => Promise<void>;
  refreshLive: () => Promise<void>;
}>;

export function retryPlanB(failure: PlanBFailure | null, actions: RetryActions, setFailure: Dispatch<SetStateAction<PlanBFailure | null>>) {
  if (!failure) return;
  if (failure.kind === "recommendation") void actions.requestRecommendations();
  if (failure.kind === "route") void actions.replaceStop();
  if (failure.kind === "save") void actions.saveReplacement();
  if (failure.kind === "live") void actions.refreshLive();
  if (failure.kind === "location") setFailure(null);
}
