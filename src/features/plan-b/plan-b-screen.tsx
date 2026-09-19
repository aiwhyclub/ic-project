"use client";

import { PlanBLocationStep } from "./plan-b-location-step";
import { PlanBReasonsStep } from "./plan-b-reasons-step";
import { PlanBRecommendationsStep } from "./plan-b-recommendations-step";
import { PlanBReplacementStep } from "./plan-b-replacement-step";
import { PlanBStatus } from "./plan-b-status";
import type { PlanBPhase } from "./plan-b-helpers";
import { usePlanBFlow } from "./use-plan-b-flow";

const PHASES: readonly { readonly id: PlanBPhase; readonly label: string }[] = [
  { id: "location", label: "위치 기준" },
  { id: "reasons", label: "막힌 이유" },
  { id: "recommendations", label: "3곳 비교" },
  { id: "replacement", label: "교체·저장" },
];

export function PlanBScreen() {
  const flow = usePlanBFlow();
  const phaseIndex = PHASES.findIndex((phase) => phase.id === flow.phase);

  return (
    <main className="app-canvas plan-b-page" id="main-content">
      <div className="page-shell plan-b-shell">
        <header className="plan-b-header">
          <p className="eyebrow">현장 플랜B · {flow.itinerary.title}</p>
          <h1 className="plan-b-title">막힌 순간에도, 이천의 하루를 이어가세요.</h1>
          <p className="plan-b-lead">
            한 장소만 바꾸고 나머지 방문 순서는 보존합니다. 현재 위치를 쓰지 않아도 수동 선택으로 바로 진행할 수 있습니다.
          </p>
          <ol className="plan-b-progress" aria-label="플랜B 진행 단계">
            {PHASES.map((phase, index) => (
              <li className={index <= phaseIndex ? "is-active" : ""} key={phase.id}>
                <span>{index + 1}</span> {phase.label}
              </li>
            ))}
          </ol>
        </header>

        <PlanBStatus failure={flow.failure} busyAction={flow.busyAction} onRetry={flow.retry} />

        {flow.phase === "location" ? (
          <PlanBLocationStep
            itinerary={flow.itinerary}
            regions={flow.manualRegions}
            location={flow.location}
            selectedRegionId={flow.manualRegionId}
            selectedPlaceId={flow.manualPlaceId}
            isRequesting={flow.busyAction === "location"}
            message={flow.locationMessage}
            onUseCurrentLocation={flow.useCurrentLocation}
            onRegionChange={flow.chooseManualRegion}
            onPlaceChange={flow.chooseManualPlace}
            onContinue={() => flow.setPhase("reasons")}
          />
        ) : null}

        {flow.phase === "reasons" ? (
          <PlanBReasonsStep
            rules={flow.reasonRules}
            reasons={flow.reasons}
            isBusy={flow.isBusy}
            message={flow.failure?.kind === "recommendation" ? flow.failure.message : ""}
            onToggle={flow.toggleReason}
            onContinue={flow.requestRecommendations}
          />
        ) : null}

        {flow.phase === "recommendations" ? (
          <PlanBRecommendationsStep
            alternatives={flow.alternatives}
            selectedAlternativeId={flow.selectedAlternativeId}
            isBusy={flow.isBusy}
            liveRefreshAvailable={flow.liveRefreshAvailable}
            onSelect={flow.setSelectedAlternativeId}
            onRefreshLive={(alternative) => void flow.refreshLive(alternative)}
            onContinue={() => flow.setPhase("replacement")}
            onBack={() => flow.setPhase("reasons")}
          />
        ) : null}

        {flow.phase === "replacement" || flow.phase === "saved" ? (
          <PlanBReplacementStep
            itinerary={flow.draftItinerary}
            selectedStopId={flow.selectedStopId}
            selectedAlternative={flow.selectedAlternative}
            routeSegments={flow.routeSegments}
            recalculationFromPosition={flow.recalculationFromPosition}
            replacementReady={flow.replacementReady}
            saved={flow.saved}
            isBusy={flow.isBusy}
            removedStop={flow.removedStop}
            deferred={flow.deferred}
            onSelectStop={flow.setSelectedStopId}
            onReplace={flow.replaceStop}
            onSave={flow.saveReplacement}
            onDefer={flow.deferRemovedPlace}
            onBack={() => flow.setPhase("recommendations")}
          />
        ) : null}
      </div>
    </main>
  );
}
