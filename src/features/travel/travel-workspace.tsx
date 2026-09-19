"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthPanel } from "@/features/auth/auth-panel";
import { useAppState } from "@/features/app/app-state";
import { createSegments } from "@/features/app/app-seed";

type TravelWorkspaceProps = Readonly<{ readonly itineraryId: string }>;

export function TravelWorkspace({ itineraryId }: TravelWorkspaceProps) {
  const router = useRouter();
  const { getItinerary, isHydrated, places, session, setTravelProgress, startTrip, travelProgress } = useAppState();
  const itinerary = getItinerary(itineraryId);
  const currentIndex = Math.min(travelProgress[itineraryId] ?? 0, Math.max(0, (itinerary?.stops.length ?? 1) - 1));

  useEffect(() => {
    if (itinerary !== null) {
      startTrip(itinerary.id);
    }
  }, [itinerary, startTrip]);

  if (!isHydrated) {
    return <main className="app-canvas" id="main-content"><section className="page-shell"><p className="status-banner status-banner--info">여행 화면을 준비하고 있습니다.</p></section></main>;
  }
  if (session === null) {
    return <main className="app-canvas" id="main-content"><section className="page-shell"><AuthPanel reason="여행 진행은 저장한 동선과 계정의 방문 순서를 이어서 사용합니다." returnTo={`/travel/${itineraryId}`} /></section></main>;
  }
  if (itinerary === null || itinerary.userId !== session.userId) {
    return <main className="app-canvas" id="main-content"><section className="page-shell"><section className="empty-state"><h1>여행 동선을 찾을 수 없습니다.</h1><button className="primary-status" type="button" onClick={() => router.push("/mypage")}>마이페이지로 돌아가기</button></section></section></main>;
  }

  const currentStop = itinerary.stops[currentIndex];
  const nextStop = itinerary.stops[currentIndex + 1];
  const currentPlace = currentStop === undefined ? null : places.find((place) => place.id === currentStop.placeId) ?? null;
  const nextPlace = nextStop === undefined ? null : places.find((place) => place.id === nextStop.placeId) ?? null;
  const segments = createSegments(itinerary.stops, itinerary.transportMode);
  const currentSegment = segments[currentIndex];

  return (
    <main className="app-canvas" id="main-content">
      <section className="page-shell travel-page">
        <header className="travel-header"><div><p className="eyebrow">여행 진행</p><h1 className="catalog-title">{itinerary.title}</h1><p className="catalog-description">현재 장소를 확인하고 다음 방문을 준비하세요.</p></div><button className="navigation-link" type="button" onClick={() => router.push(`/itineraries/${itinerary.id}`)}>상세로 돌아가기</button></header>
        <section className="travel-progress" aria-label="여행 진행률"><strong>{currentIndex + 1} / {itinerary.stops.length}</strong><div role="progressbar" aria-valuemin={1} aria-valuemax={itinerary.stops.length} aria-valuenow={currentIndex + 1}><span style={{ width: `${((currentIndex + 1) / itinerary.stops.length) * 100}%` }} /></div></section>
        <div className="travel-focus-grid">
          <article className="travel-focus-card travel-focus-card--current"><p className="catalog-kicker">현재 방문</p><h2>{currentPlace?.name ?? "현재 장소"}</h2><p>{currentPlace?.address}</p><p>{currentStop?.dwellMinutes ?? 0}분 머무르기</p></article>
          <article className="travel-focus-card"><p className="catalog-kicker">다음 방문</p><h2>{nextPlace?.name ?? "여행 완료"}</h2><p>{nextPlace?.address ?? "모든 장소를 방문했습니다."}</p>{currentSegment !== undefined && <p>다음 구간 {currentSegment.distanceMeters}m · 약 {currentSegment.durationMinutes}분</p>}</article>
        </div>
        <div className="travel-actions"><button className="navigation-link" type="button" disabled={currentIndex === 0} onClick={() => setTravelProgress(itinerary.id, currentIndex - 1)}>이전 장소</button>{nextStop !== undefined ? <button className="primary-status" type="button" onClick={() => setTravelProgress(itinerary.id, currentIndex + 1)}>다음 장소로</button> : <button className="primary-status" type="button" onClick={() => router.push("/mypage")}>여행 완료</button>}<button className="navigation-link" type="button" onClick={() => router.push(`/plan-b?itinerary=${encodeURIComponent(itinerary.id)}`)}>막혔어요 · 플랜B</button></div>
      </section>
    </main>
  );
}
