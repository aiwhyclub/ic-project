"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthPanel } from "@/features/auth/auth-panel";
import { useAppState } from "@/features/app/app-state";
import { createSegments, currentTime } from "@/features/app/app-seed";
import type { RouteSegment } from "@/features/app/app-state";
import { PlanRouteStatus } from "@/features/plan/plan-route-status";
import { ShareButton } from "./share-button";

type ItineraryDetailProps = Readonly<{ readonly itineraryId: string }>;

function displaySegment(segment: RouteSegment, failed: boolean): RouteSegment {
  return failed
    ? { ...segment, status: "error", errorMessage: "최신 경로 공급자 응답이 없어 이 구간만 실패했습니다." }
    : segment;
}

export function ItineraryDetail({ itineraryId }: ItineraryDetailProps) {
  const router = useRouter();
  const { getItinerary, isHydrated, places, session, startTrip, openItineraryInEditor } = useAppState();
  const itinerary = getItinerary(itineraryId);
  const [failedSegments, setFailedSegments] = useState<readonly string[]>([]);
  const [recalculating, setRecalculating] = useState(false);
  const routeSegments = useMemo(() => itinerary === null ? [] : createSegments(itinerary.stops, itinerary.transportMode, recalculating ? "calculating" : "ready", recalculating ? null : currentTime()), [itinerary, recalculating]);
  const segments = routeSegments.map((segment) => displaySegment(segment, failedSegments.includes(segment.id)));

  useEffect(() => {
    if (itinerary === null) {
      return;
    }
    const timer = window.setTimeout(() => {
      setRecalculating(false);
    }, 520);
    return () => window.clearTimeout(timer);
  }, [itinerary]);

  function failSegment(segmentId: string) {
    setFailedSegments((current) => current.includes(segmentId) ? current : [...current, segmentId]);
  }

  function retrySegment(segmentId: string) {
    setFailedSegments((current) => current.filter((id) => id !== segmentId));
  }

  if (!isHydrated) {
    return <main className="app-canvas" id="main-content"><section className="page-shell"><p className="status-banner status-banner--info">저장 동선을 복원하고 있습니다.</p></section></main>;
  }
  if (session === null) {
    return <main className="app-canvas" id="main-content"><section className="page-shell"><AuthPanel reason="저장한 동선은 로그인한 계정에서만 다시 열 수 있습니다." returnTo={`/itineraries/${itineraryId}`} /></section></main>;
  }
  if (itinerary === null || itinerary.userId !== session.userId) {
    return <main className="app-canvas" id="main-content"><section className="page-shell"><section className="empty-state"><h1>동선을 찾을 수 없습니다.</h1><p>삭제되었거나 현재 로그인한 계정에 속하지 않는 일정입니다.</p><button className="primary-status" type="button" onClick={() => router.push("/mypage")}>마이페이지로 돌아가기</button></section></section></main>;
  }

  return (
    <main className="app-canvas" id="main-content">
      <section className="page-shell itinerary-detail-page">
        <header className="itinerary-detail-header"><div><p className="eyebrow">저장 동선 상세</p><h1 className="catalog-title">{itinerary.title}</h1><p className="catalog-description">장소 순서를 먼저 복원한 뒤 현재 장소 좌표와 승인된 경로 공급자로 구간을 다시 계산합니다.</p></div><div className="itinerary-detail-header__actions"><button className="navigation-link" type="button" onClick={() => { openItineraryInEditor(itinerary.id); router.push(`/plan?edit=${encodeURIComponent(itinerary.id)}`); }}>편집</button><button className="primary-status" type="button" onClick={() => { startTrip(itinerary.id); router.push(`/travel/${itinerary.id}`); }}>여행 시작</button></div></header>
        <section className="saved-itinerary-stops" aria-labelledby="saved-stops-title"><div className="plan-section-heading"><h2 id="saved-stops-title">방문 순서</h2><span>{itinerary.stops.length}곳 · {itinerary.travelDate}</span></div><ol>{itinerary.stops.map((stop, index) => <li key={stop.placeId}><span>{index + 1}</span><strong>{places.find((place) => place.id === stop.placeId)?.name ?? "장소"}</strong><small>체류 {stop.dwellMinutes}분</small></li>)}</ol></section>
        {recalculating && <p className="status-banner status-banner--info" role="status">최신 경로를 계산하고 있습니다. 장소 순서는 이미 준비되었습니다.</p>}
        <PlanRouteStatus segments={segments} places={places} onRetry={retrySegment} onFail={failSegment} />
        <nav className="itinerary-detail-links" aria-label="저장 동선 다음 작업"><button className="navigation-link" type="button" onClick={() => router.push(`/plan-b?itinerary=${encodeURIComponent(itinerary.id)}`)}>여행 중 플랜B 열기</button><ShareButton itinerary={itinerary} /><button className="navigation-link" type="button" onClick={() => router.push("/mypage")}>저장 동선 목록</button></nav>
      </section>
    </main>
  );
}
