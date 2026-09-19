"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { KakaoMapCanvas } from "@/features/maps/kakao-map-canvas";
import { PUBLIC_PLACES, getPublicPlace } from "@/features/public/public-data";

const MARKER_POSITIONS: Readonly<Record<string, Readonly<{ left: string; top: string }>>> = {
  "gyeonggi-ceramic-museum-icheon": { left: "40%", top: "50%" },
  "icheon-city-museum": { left: "46%", top: "53%" },
  "seolbong-lake": { left: "47%", top: "45%" },
  "gwango-traditional-market": { left: "57%", top: "49%" },
  "icheon-woljeon-museum": { left: "41%", top: "43%" },
  "seolbong-seowon": { left: "36%", top: "41%" },
  "icheon-agricultural-theme-park": { left: "60%", top: "80%" },
  "icheon-sansuyu-village": { left: "65%", top: "15%" },
  "seohui-history-hall": { left: "75%", top: "50%" },
};

export function MapExplorer() {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [selectedPlaceId, setSelectedPlaceId] = useState("gyeonggi-ceramic-museum-icheon");
  const [boundsVersion, setBoundsVersion] = useState(0);
  const [failed, setFailed] = useState(false);
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);
  const [notice, setNotice] = useState("이천 전체 영역의 검증된 장소를 보고 있어요.");

  const categories = useMemo(() => Array.from(new Set(PUBLIC_PLACES.map((place) => place.category))), []);
  const results = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    return PUBLIC_PLACES.filter((place) => {
      const keywordMatches = query.length === 0 || `${place.name} ${place.category} ${place.area}`.toLowerCase().includes(query);
      return keywordMatches && (!category || place.category === category);
    });
  }, [category, keyword]);

  const activePlaceId = results.some((place) => place.id === selectedPlaceId) ? selectedPlaceId : (results[0]?.id ?? "");
  const selectedPlace = getPublicPlace(activePlaceId);

  function refreshBounds(): void {
    const nextVersion = boundsVersion + 1;
    setBoundsVersion(nextVersion);
    setNotice(`현재 지도 영역을 다시 확인했어요. ${nextVersion}번째 갱신 결과입니다.`);
  }

  function selectPlace(placeId: string): void {
    setSelectedPlaceId(placeId);
    setNotice("지도와 목록에서 같은 장소를 선택했어요.");
  }

  return (
    <main className="app-canvas map-page" id="main-content">
      <section className="page-shell map-page__shell">
        <header className="page-intro page-intro--map">
          <div>
            <p className="eyebrow">지도 보기</p>
            <h1 className="page-title">이천의 장소를 지도와 목록으로 탐색하세요.</h1>
            <p className="page-description">Kakao Map을 붙이기 전에도 확인된 장소와 선택 흐름을 같은 정보로 연습할 수 있습니다.</p>
          </div>
          <span className="map-source-badge">Kakao Map 기준</span>
        </header>

        <div className="map-split-pane">
          <section className="map-canvas-panel" aria-label="이천 장소 지도">
            <div className="map-canvas-panel__header">
              <span className="map-canvas-panel__title">이천 공개 장소</span>
              <span className="map-attribution">Kakao Map 기반 · 연습 지도</span>
            </div>
            <KakaoMapCanvas
              places={results}
              selectedPlaceId={activePlaceId}
              onSelect={selectPlace}
              fallback={<div className="mock-map" role="img" aria-label="이천 공개 장소를 표시한 지도 모형">
                <div className="mock-map__river" />
                <div className="mock-map__road mock-map__road--one" />
                <div className="mock-map__road mock-map__road--two" />
                {results.map((place) => {
                  const position = MARKER_POSITIONS[place.id];
                  return position ? (
                    <button className={`map-marker${place.id === activePlaceId ? " map-marker--selected" : ""}`} type="button" style={{ left: position.left, top: position.top }} aria-label={`${place.name} 선택`} aria-pressed={place.id === activePlaceId} key={place.id} onClick={() => selectPlace(place.id)}>
                      <span className="map-marker__number">{PUBLIC_PLACES.findIndex((item) => item.id === place.id) + 1}</span>
                      <span className="map-marker__label">{place.name}</span>
                    </button>
                  ) : null;
                })}
              </div>}
            />
          </section>

          <section className={`place-list-panel${isSheetExpanded ? " place-list-panel--expanded" : ""}`} id="map-place-sheet" aria-labelledby="place-list-heading">
            <div className="place-list-panel__header">
              <div><p className="eyebrow">검증된 장소</p><h2 className="section-title" id="place-list-heading">{results.length}곳</h2></div>
              <span className="list-scope">{category || "전체 분류"}</span>
              <button className="mobile-sheet-toggle" type="button" aria-controls="map-place-sheet" aria-expanded={isSheetExpanded} onClick={() => setIsSheetExpanded((current) => !current)}>{isSheetExpanded ? "지도 더 보기" : "장소 목록 펼치기"}</button>
            </div>
            <div className="map-toolbar" role="search">
              <label className="map-search-field" htmlFor="map-keyword">장소 검색
                <input id="map-keyword" type="search" value={keyword} placeholder="장소명·권역으로 찾기" onChange={(event) => setKeyword(event.target.value)} />
              </label>
              <label className="map-filter-field" htmlFor="map-category">분류
                <select id="map-category" value={category} onChange={(event) => setCategory(event.target.value)}>
                  <option value="">전체 분류</option>
                  {categories.map((item) => <option value={item} key={item}>{item}</option>)}
                </select>
              </label>
              <button className="button button--outline" type="button" onClick={() => { setKeyword(""); setCategory(""); }}>검색 초기화</button>
              <button className="button button--quiet" type="button" onClick={() => setFailed((current) => !current)}>{failed ? "조회 재시도" : "오류 상태 보기"}</button>
            </div>
            <div className="map-status-row" aria-live="polite">
              <span>{notice}</span>
              <button className="button button--outline" type="button" onClick={refreshBounds}>현재 지도 영역에서 다시 찾기</button>
            </div>
            {failed ? (
              <div className="status-banner status-banner--error" role="alert">
                <strong>장소 조회가 잠시 지연되고 있어요.</strong>
                <span>직전 결과를 유지했습니다. 다시 찾기를 누르면 이 영역을 재조회합니다.</span>
                <button className="button button--outline" type="button" onClick={() => setFailed(false)}>다시 시도</button>
              </div>
            ) : null}
            {results.length === 0 ? <div className="empty-state"><strong>이 영역에 맞는 장소가 없어요.</strong><span>검색어나 분류를 바꿔 보세요.</span></div> : (
              <ul className="place-list">
                {results.map((place) => (
                  <li className="place-list__item" key={place.id}>
                    <button className={`place-list-item${place.id === activePlaceId ? " place-list-item--selected" : ""}`} type="button" aria-pressed={place.id === activePlaceId} onClick={() => selectPlace(place.id)}>
                      <span className="place-list-item__category">{place.category}</span>
                      <strong>{place.name}</strong>
                      <span>{place.area} · {place.openingHours}</span>
                      <span className="place-list-item__verified">확인 {place.verifiedAt}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {selectedPlace ? (
          <aside className="quick-place-panel" aria-labelledby="quick-place-heading">
            <div className="quick-place-panel__content">
              <p className="eyebrow">빠른 장소정보 · {selectedPlace.category}</p>
              <h2 className="section-title" id="quick-place-heading">{selectedPlace.name}</h2>
              <p>{selectedPlace.intro}</p>
              <dl className="quick-place-facts">
                <div><dt>운영</dt><dd>{selectedPlace.openingHours}</dd></div>
                <div><dt>체류</dt><dd>{selectedPlace.defaultDwellMinutes}분</dd></div>
                <div><dt>확인일</dt><dd>{selectedPlace.verifiedAt}</dd></div>
              </dl>
            </div>
            <div className="quick-place-panel__actions">
              <Link className="button button--outline" href={`/places/${selectedPlace.id}?returnTo=%2Fmap`}>상세보기</Link>
              <Link className="button button--primary" href={`/plan?addPlace=${selectedPlace.id}&returnTo=%2Fmap`}>새 동선에 추가</Link>
            </div>
          </aside>
        ) : null}
      </section>
    </main>
  );
}
