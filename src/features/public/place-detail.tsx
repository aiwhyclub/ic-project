"use client";

import Link from "next/link";
import { useState } from "react";
import { type PublicPlace } from "@/features/public/public-data";

type PlaceDetailProps = Readonly<{
  place: PublicPlace;
  returnTo: string;
}>;

export function PlaceDetail({ place, returnTo }: PlaceDetailProps) {
  const [liveEnabled, setLiveEnabled] = useState(false);
  const [liveFailed, setLiveFailed] = useState(false);
  const addHref = `/plan?addPlace=${place.id}&returnTo=${encodeURIComponent(returnTo)}`;

  function handleRealtimeChange(): void {
    if (!place.supportsRealtime) return;
    setLiveFailed(false);
    setLiveEnabled((current) => !current);
  }

  return (
    <main className="app-canvas place-detail-page" id="main-content">
      <section className="page-shell place-detail-page__shell">
        <nav className="breadcrumb" aria-label="현재 위치">
          <Link href={returnTo}>장소 탐색</Link>
          <span aria-hidden="true">/</span>
          <span>{place.name}</span>
        </nav>

        <header className="place-detail-header">
          <div className="place-detail-header__copy">
            <p className="eyebrow">{place.category} · {place.area}</p>
            <h1 className="page-title">{place.name}</h1>
            <p className="place-detail-header__intro">{place.intro}</p>
            <p className="place-detail-header__reason">{place.recommendationReason}</p>
          </div>
          <div className="place-detail-media" role="img" aria-label={place.mediaAlt}>
            <span className="place-detail-media__label">이천 공개 장소</span>
            <span className="place-detail-media__shape" aria-hidden="true" />
          </div>
        </header>

        <div className="place-detail-layout">
          <section className="place-detail-card" aria-labelledby="place-facts-heading">
            <div className="place-detail-card__header">
              <div><p className="eyebrow">방문 전 확인</p><h2 className="section-title" id="place-facts-heading">한눈에 보는 정보</h2></div>
              <span className="verified-badge">확인 {place.verifiedAt}</span>
            </div>
            <dl className="place-facts-grid">
              <div><dt>주소</dt><dd>{place.address}</dd></div>
              <div><dt>연락처</dt><dd>{place.phone ? <a href={`tel:${place.phone.replaceAll("-", "")}`}>{place.phone}</a> : "공식 연락처 미제공"}</dd></div>
              <div><dt>운영시간</dt><dd>{place.openingHours}</dd></div>
              <div><dt>휴무일</dt><dd>{place.closedDays}</dd></div>
              <div><dt>장날·행사</dt><dd>{place.marketDays}</dd></div>
              <div><dt>예약</dt><dd>{place.reservationNote}</dd></div>
              <div><dt>주차</dt><dd>{place.parkingInfo}</dd></div>
              <div><dt>추천 체류</dt><dd>{place.defaultDwellMinutes}분</dd></div>
            </dl>
          </section>

          <aside className="place-detail-source" aria-labelledby="source-heading">
            <p className="eyebrow">정보의 근거</p>
            <h2 className="section-title" id="source-heading">출처와 사용권</h2>
            <dl className="source-facts">
              <div><dt>정보 출처</dt><dd><a href={place.sourceUrl} target="_blank" rel="noreferrer">{place.sourceName}</a></dd></div>
              <div><dt>마지막 확인</dt><dd>{place.verifiedAt}</dd></div>
              <div><dt>정보 이용 범위</dt><dd>{place.licenseSource}</dd></div>
            </dl>
            <p className="source-note">지도 타일과 경로 원문은 저장하지 않으며, 장소를 일정에 넣을 때는 장소 ID와 순서만 이어집니다.</p>
          </aside>
        </div>

        {place.supportsRealtime ? (
          <section className="realtime-panel" aria-labelledby="realtime-heading">
            <div>
              <p className="eyebrow">선택 기능</p>
              <h2 className="section-title" id="realtime-heading">실시간 정보 반영</h2>
              <p>기본 검증정보와 별도로 최신 운영 상태를 확인해 볼 수 있습니다. 연결에 실패하면 확인일이 있는 기본 정보로 돌아갑니다.</p>
            </div>
            <div className="realtime-panel__controls">
              <label className="toggle-control"><input type="checkbox" checked={liveEnabled} onChange={handleRealtimeChange} /><span>실시간 정보 사용</span></label>
              {liveEnabled && !liveFailed ? <p className="live-status live-status--ready">실시간 반영 중 · {place.realtimeUpdatedAt}</p> : <p className="live-status">기본 검증정보 사용 · {place.verifiedAt}</p>}
              {liveEnabled ? <button className="button button--quiet" type="button" onClick={() => setLiveFailed((current) => !current)}>{liveFailed ? "실시간 재시도" : "연결 실패 가정"}</button> : null}
              {liveFailed ? <p className="form-feedback form-feedback--warning" role="status">실시간 연결이 끊겨 기본 검증정보를 보여드리고 있어요.</p> : null}
            </div>
          </section>
        ) : (
          <section className="realtime-panel realtime-panel--unavailable" aria-label="실시간 정보 상태">
            <strong>실시간 정보 미지원 장소</strong>
            <span>확인일이 표시된 기본 정보로 안내합니다.</span>
          </section>
        )}

        <div className="place-detail-actions">
          <Link className="button button--outline" href={returnTo}>이전 화면으로 돌아가기</Link>
          <Link className="button button--primary" href={addHref}>현재 동선에 장소 추가</Link>
        </div>
      </section>
    </main>
  );
}
