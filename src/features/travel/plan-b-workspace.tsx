"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthPanel } from "@/features/auth/auth-panel";
import { useAppState } from "@/features/app/app-state";

type PlanBWorkspaceProps = Readonly<{ readonly itineraryId: string; readonly position: number }>;

export function PlanBWorkspace({ itineraryId, position }: PlanBWorkspaceProps) {
  const router = useRouter();
  const { getItinerary, isHydrated, places, replaceTravelStop, session } = useAppState();
  const [blockedReason, setBlockedReason] = useState("휴관 또는 예약 불가");
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  const itinerary = getItinerary(itineraryId);
  const blockedPlaceId = itinerary?.stops[position]?.placeId;
  const candidates = useMemo(() => {
    if (itinerary === null) {
      return [];
    }
    return places.filter((place) => place.id !== blockedPlaceId && !itinerary.stops.some((stop) => stop.placeId === place.id)).slice(0, 3);
  }, [blockedPlaceId, itinerary, places]);

  if (!isHydrated) {
    return <main className="app-canvas" id="main-content"><section className="page-shell"><p className="status-banner status-banner--info">플랜B 후보를 준비하고 있습니다.</p></section></main>;
  }
  if (session === null) {
    return <main className="app-canvas" id="main-content"><section className="page-shell"><AuthPanel reason="플랜B 교체 결과를 저장하려면 계정 확인이 필요합니다." returnTo={`/travel/plan-b?itinerary=${encodeURIComponent(itineraryId)}&position=${position}`} /></section></main>;
  }
  if (itinerary === null || itinerary.userId !== session.userId || blockedPlaceId === undefined) {
    return <main className="app-canvas" id="main-content"><section className="page-shell"><section className="empty-state"><h1>플랜B를 시작할 일정을 찾을 수 없습니다.</h1><button className="primary-status" type="button" onClick={() => router.push("/mypage")}>마이페이지로 돌아가기</button></section></section></main>;
  }

  const confirmedItinerary = itinerary;

  function applyReplacement() {
    if (selectedPlaceId === null) {
      return;
    }
    if (replaceTravelStop(confirmedItinerary.id, position, selectedPlaceId)) {
      router.push(`/travel/${confirmedItinerary.id}`);
    }
  }

  return (
    <main className="app-canvas" id="main-content">
      <section className="page-shell plan-b-page">
        <header className="plan-b-header"><div><p className="eyebrow">현장 플랜B</p><h1 className="catalog-title">막힌 장소를 바로 바꿔보세요.</h1><p className="catalog-description">현재 위치는 저장하지 않고, 선택한 장소만 일정에 반영합니다. 교체 뒤 이후 구간은 다시 계산됩니다.</p></div><button className="navigation-link" type="button" onClick={() => router.push(`/travel/${itinerary.id}`)}>여행으로 돌아가기</button></header>
        <label htmlFor="blocked-reason">막힌 이유</label><select id="blocked-reason" value={blockedReason} onChange={(event) => setBlockedReason(event.target.value)}><option>휴관 또는 예약 불가</option><option>비가 와서 야외 장소를 피하고 싶어요</option><option>남은 시간이 부족해요</option></select>
        <p className="status-banner status-banner--info" role="status">{places.find((place) => place.id === blockedPlaceId)?.name ?? "현재 장소"} 대신 {blockedReason} 조건에 맞는 후보 3곳을 보여줍니다.</p>
        <section className="plan-b-candidates" aria-labelledby="plan-b-candidates-title"><div className="plan-section-heading"><h2 id="plan-b-candidates-title">대체 장소</h2><span>{candidates.length}곳</span></div>{candidates.map((place) => <button className={selectedPlaceId === place.id ? "plan-b-card plan-b-card--selected" : "plan-b-card"} type="button" key={place.id} onClick={() => setSelectedPlaceId(place.id)}><strong>{place.name}</strong><span>{place.category} · 약 {place.defaultDwellMinutes}분</span><small>{place.description}</small><small>기본 검증정보 · {place.verifiedAt}</small></button>)}</section>
        <button className="primary-status" type="button" disabled={selectedPlaceId === null} onClick={applyReplacement}>선택 장소로 교체하고 다시 계산</button>
      </section>
    </main>
  );
}
