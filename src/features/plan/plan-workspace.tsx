"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CURATED_ROUTES } from "@/data";
import { AuthPanel } from "@/features/auth/auth-panel";
import { OAuthModal } from "@/features/auth/oauth-modal";
import { useAppState, type TransportMode } from "@/features/app/app-state";
import { KakaoMapCanvas } from "@/features/maps/kakao-map-canvas";
import { PlanRouteStatus } from "./plan-route-status";
import { PlanStopList } from "./plan-stop-list";
import { PlanToolbar } from "./plan-toolbar";

const TRANSPORT_OPTIONS: readonly { readonly value: TransportMode; readonly label: string }[] = [
  { value: "walk", label: "도보" },
  { value: "car", label: "자차" },
  { value: "transit", label: "대중교통" },
];

function placeName(placeId: string, places: ReturnType<typeof useAppState>["places"]): string {
  return places.find((place) => place.id === placeId)?.name ?? "확인할 수 없는 장소";
}

export function PlanWorkspace() {
  const router = useRouter();
  const initialized = useRef(false);
  const [activePlanId, setActivePlanId] = useState("");
  const [search, setSearch] = useState("");
  const [insertPosition, setInsertPosition] = useState(0);
  const [showAuth, setShowAuth] = useState(false);
  const [waitingForAuth, setWaitingForAuth] = useState(false);
  const [isEditorExpanded, setIsEditorExpanded] = useState(false);
  const {
    isHydrated,
    authError,
    places,
    pendingSave,
    session,
    workingPlans,
    addStop,
    clearWorkingPlans,
    markSegmentFailure,
    moveStop,
    openItineraryInEditor,
    recomputePlan,
    removeStop,
    retrySegment,
    savePlans,
    setTransportMode,
    startPlans,
  } = useAppState();

  useEffect(() => {
    if (!isHydrated || initialized.current) {
      return;
    }
    initialized.current = true;
    const params = new URLSearchParams(window.location.search);
    const requestedValue = params.get("plans") ?? params.get("curations") ?? params.get("curation") ?? "";
    const requestedPlans = requestedValue.split(",").filter((id) => id.length > 0);
    const addedPlaceId = params.get("addPlace");
    const itineraryId = params.get("edit");
    if (itineraryId !== null) {
      openItineraryInEditor(itineraryId);
    }
    if (requestedPlans.length > 0) {
      startPlans(requestedPlans);
    } else if (workingPlans.length === 0 && pendingSave === null) {
      startPlans();
    }
    if (addedPlaceId !== null) {
      const targetPlanId = requestedPlans[0] ?? workingPlans[0]?.id ?? CURATED_ROUTES[0]?.id;
      if (targetPlanId !== undefined) {
        window.setTimeout(() => {
          addStop(targetPlanId, addedPlaceId, Number.MAX_SAFE_INTEGER);
          recomputePlan(targetPlanId);
        }, 0);
      }
    }
  }, [addStop, isHydrated, openItineraryInEditor, pendingSave, recomputePlan, startPlans, workingPlans]);

  useEffect(() => {
    if (waitingForAuth && session !== null && pendingSave === null && workingPlans.length === 0) {
      router.push("/mypage");
    }
  }, [pendingSave, router, session, waitingForAuth, workingPlans.length]);

  const activePlan = workingPlans.find((plan) => plan.id === activePlanId) ?? workingPlans[0] ?? null;
  const selectedPlanId = activePlan?.id ?? activePlanId;
  const availablePlaces = useMemo(() => {
    if (activePlan === null) {
      return [];
    }
    const normalized = search.trim().toLocaleLowerCase("ko-KR");
    return places.filter((place) => !activePlan.stops.some((stop) => stop.placeId === place.id) &&
      (normalized.length === 0 || `${place.name} ${place.category}`.toLocaleLowerCase("ko-KR").includes(normalized)));
  }, [activePlan, places, search]);
  const activePlanPlaces = useMemo(() => activePlan?.stops.flatMap((stop) => {
    const place = places.find((item) => item.id === stop.placeId);
    return place === undefined ? [] : [place];
  }) ?? [], [activePlan, places]);

  function saveAll() {
    const result = savePlans();
    if (result.kind === "requires-auth") {
      setShowAuth(true);
      setWaitingForAuth(true);
    } else {
      router.push("/mypage");
    }
  }

  const closeAuth = useCallback(() => {
    setShowAuth(false);
    setWaitingForAuth(false);
  }, []);

  function resetEditor() {
    clearWorkingPlans();
    startPlans();
  }

  function addPlace(placeId: string) {
    if (activePlan === null) {
      return;
    }
    addStop(activePlan.id, placeId, insertPosition);
    setSearch("");
    setInsertPosition(activePlan.stops.length + 1);
    window.setTimeout(() => recomputePlan(activePlan.id), 0);
  }

  if (!isHydrated || activePlan === null) {
    return <main className="app-canvas" id="main-content"><section className="page-shell"><p className="status-banner status-banner--info">편집할 일정을 준비하고 있습니다.</p></section></main>;
  }

  return (
    <main className="app-canvas" id="main-content">
      <section className="page-shell plan-workspace">
        <header className="plan-header">
          <div>
            <p className="eyebrow">지도 동선 계획</p>
            <h1 className="catalog-title">장소와 순서를 나만의 하루로 엮어보세요.</h1>
            <p className="catalog-description">선택한 일정은 각각 독립적으로 편집되며, 지도 원문은 저장하지 않고 최신 경로를 다시 계산합니다.</p>
          </div>
          <div className="plan-header__actions">
            <button className="navigation-link" type="button" onClick={resetEditor}>새 계획</button>
            <button className="primary-status" type="button" onClick={saveAll}>선택 일정 {workingPlans.length}개 저장</button>
          </div>
        </header>
        {authError !== null ? <p className="status-banner status-banner--error" role="alert">{authError}</p> : null}

        <PlanToolbar plans={workingPlans} activePlanId={selectedPlanId} onSelect={setActivePlanId} />
        <div className="plan-layout">
          <section className={`plan-editor-panel${isEditorExpanded ? " plan-editor-panel--expanded" : ""}`} aria-labelledby="plan-editor-title">
            <div className="plan-section-heading">
              <div><p className="eyebrow">일정 편집</p><h2 id="plan-editor-title">{activePlan.title}</h2></div>
              <span className="read-only-badge">초안 자동 보호 {session === null ? "대기" : "중"}</span>
              <button className="mobile-sheet-toggle" type="button" aria-expanded={isEditorExpanded} onClick={() => setIsEditorExpanded((current) => !current)}>{isEditorExpanded ? "지도 더 보기" : "편집 목록 펼치기"}</button>
              <button className="mobile-plan-save" type="button" onClick={saveAll}>선택 일정 {workingPlans.length}개 저장</button>
            </div>
            <div className="plan-field-row">
              <label htmlFor="transport-mode">이동수단</label>
              <select id="transport-mode" value={activePlan.transportMode} onChange={(event) => {
                const mode = event.target.value;
                if (mode === "walk" || mode === "car" || mode === "transit") {
                  setTransportMode(activePlan.id, mode);
                  window.setTimeout(() => recomputePlan(activePlan.id), 0);
                }
              }}>
                {TRANSPORT_OPTIONS.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
              </select>
              <button className="navigation-link" type="button" onClick={() => recomputePlan(activePlan.id)}>전체 다시 계산</button>
            </div>
            <PlanStopList
              stops={activePlan.stops}
              places={places}
              onRemove={(placeId) => { removeStop(activePlan.id, placeId); window.setTimeout(() => recomputePlan(activePlan.id), 0); }}
              onMove={(from, to) => { moveStop(activePlan.id, from, to); window.setTimeout(() => recomputePlan(activePlan.id), 0); }}
            />
            <div className="plan-add-panel">
              <div className="plan-section-heading"><h3>장소 추가</h3><span>{availablePlaces.length}곳 검색됨</span></div>
              <label htmlFor="place-search">장소명 또는 카테고리</label>
              <input id="place-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="예: 공원, 도자" />
              <label htmlFor="insert-position">추가 위치</label>
              <select id="insert-position" value={insertPosition} onChange={(event) => setInsertPosition(Number(event.target.value))}>
                {Array.from({ length: activePlan.stops.length + 1 }, (_, index) => <option value={index} key={index}>{index + 1}번째</option>)}
              </select>
              <div className="plan-add-panel__results">
                {availablePlaces.map((place) => <button type="button" key={place.id} onClick={() => addPlace(place.id)}><strong>{place.name}</strong><span>{place.category} · {place.address}</span></button>)}
              </div>
            </div>
          </section>
          <aside className="plan-map-panel" aria-label="Kakao 지도와 경로 요약">
            <KakaoMapCanvas places={activePlanPlaces} fallback={<div className="plan-map-canvas"><p className="eyebrow">Kakao Map 미리보기</p><h2>방문 마커 {activePlan.stops.length}개</h2><ol>{activePlan.stops.map((stop, index) => <li key={stop.placeId}><span>{index + 1}</span>{placeName(stop.placeId, places)}</li>)}</ol><p>실제 지도 연결 전에도 장소·순서·구간 상태를 편집할 수 있습니다.</p></div>} />
            <PlanRouteStatus segments={activePlan.segments} places={places} onRetry={(segmentId) => retrySegment(activePlan.id, segmentId)} onFail={(segmentId) => markSegmentFailure(activePlan.id, segmentId)} />
          </aside>
        </div>
        {showAuth && <OAuthModal onClose={closeAuth}><AuthPanel reason="선택한 일정들을 계정에 저장하고 다음 방문에도 다시 열기 위해서입니다." returnTo="/plan" onCancel={closeAuth} onComplete={() => setShowAuth(false)} /></OAuthModal>}
      </section>
    </main>
  );
}
