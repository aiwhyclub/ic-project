"use client";

import { useMemo, useState } from "react";
import { CuratedRouteCard } from "@/features/public/curated-route-card";
import {
  COMPANION_LABELS,
  INTEREST_LABELS,
  PUBLIC_CURATIONS,
  TRANSPORT_LABELS,
  getCurationPlaces,
  type CompanionType,
  type InterestTag,
  type PublicCuration,
  type TransportMode,
} from "@/features/public/public-data";

type SortMode = "fit" | "duration" | "recent";
type DurationFilter = "" | "short" | "day" | "long";

function isCompanionType(value: string): value is CompanionType {
  return value === "family" || value === "couple" || value === "solo" || value === "friends";
}

function isTransportMode(value: string): value is TransportMode {
  return value === "walk" || value === "transit" || value === "car";
}

function isInterestTag(value: string): value is InterestTag {
  return value === "ceramics" || value === "nature" || value === "food" || value === "market" || value === "slow";
}

function matchesDuration(curation: PublicCuration, duration: DurationFilter): boolean {
  if (!duration) return true;
  if (duration === "short") return curation.durationMinutes <= 360;
  if (duration === "day") return curation.durationMinutes > 360 && curation.durationMinutes <= 480;
  return curation.durationMinutes > 480;
}

export function CoursesBrowser() {
  const [keyword, setKeyword] = useState("");
  const [companion, setCompanion] = useState<CompanionType | "">("");
  const [transport, setTransport] = useState<TransportMode | "">("");
  const [duration, setDuration] = useState<DurationFilter>("");
  const [interest, setInterest] = useState<InterestTag | "">("");
  const [sort, setSort] = useState<SortMode>("fit");
  const [failed, setFailed] = useState(false);

  const results = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    const filtered = PUBLIC_CURATIONS.filter((curation) => {
      const placeText = getCurationPlaces(curation).map((place) => `${place.name} ${place.category}`).join(" ").toLowerCase();
      const keywordMatches = query.length === 0 || `${curation.title} ${curation.audienceType} ${placeText}`.toLowerCase().includes(query);
      const companionMatches = !companion || curation.companionType === companion;
      const transportMatches = !transport || curation.transportMode === transport;
      const interestMatches = !interest || curation.interestTags.includes(interest);
      return keywordMatches && companionMatches && transportMatches && interestMatches && matchesDuration(curation, duration);
    });
    return [...filtered].sort((left, right) => {
      if (sort === "duration") return left.durationMinutes - right.durationMinutes;
      if (sort === "recent") return right.publishedAt.localeCompare(left.publishedAt);
      return right.fitScore - left.fitScore;
    });
  }, [companion, duration, interest, keyword, sort, transport]);

  function resetFilters(): void {
    setKeyword("");
    setCompanion("");
    setTransport("");
    setDuration("");
    setInterest("");
    setSort("fit");
    setFailed(false);
  }

  const activeFilterCount = [companion, transport, duration, interest].filter((filter) => filter.length > 0).length;

  return (
    <main className="app-canvas courses-page" id="main-content">
      <section className="page-shell courses-page__shell">
        <header className="page-intro">
          <div>
            <p className="eyebrow">여행 코스 찾기</p>
            <h1 className="page-title">내 하루에 맞는 이천 코스를 찾아보세요.</h1>
            <p className="page-description">공개 큐레이션을 장소, 취향, 이동수단으로 좁혀 보고 바로 지도 편집을 시작할 수 있습니다.</p>
          </div>
          <span className="read-only-badge">로그인 없이 탐색</span>
        </header>

        <section className="course-search-panel" aria-labelledby="course-search-heading">
          <h2 className="section-title" id="course-search-heading">조건으로 찾기</h2>
          <div className="course-search-panel__keyword">
            <label htmlFor="course-keyword">키워드</label>
            <input id="course-keyword" type="search" value={keyword} placeholder="코스 제목이나 장소를 입력하세요" onChange={(event) => setKeyword(event.target.value)} />
          </div>
          <div className="filter-grid">
            <label className="form-field" htmlFor="course-companion">대상
              <select id="course-companion" value={companion} onChange={(event) => { const value = event.target.value; setCompanion(isCompanionType(value) ? value : ""); }}>
                <option value="">전체 대상</option>
                {Object.entries(COMPANION_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label className="form-field" htmlFor="course-transport">이동수단
              <select id="course-transport" value={transport} onChange={(event) => { const value = event.target.value; setTransport(isTransportMode(value) ? value : ""); }}>
                <option value="">전체 이동수단</option>
                {Object.entries(TRANSPORT_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label className="form-field" htmlFor="course-duration">소요시간
              <select id="course-duration" value={duration} onChange={(event) => { const value = event.target.value; setDuration(value === "short" || value === "day" || value === "long" ? value : ""); }}>
                <option value="">전체 시간</option>
                <option value="short">반나절 이하</option>
                <option value="day">하루 코스</option>
                <option value="long">긴 하루</option>
              </select>
            </label>
            <label className="form-field" htmlFor="course-interest">관심사
              <select id="course-interest" value={interest} onChange={(event) => { const value = event.target.value; setInterest(isInterestTag(value) ? value : ""); }}>
                <option value="">전체 관심사</option>
                {Object.entries(INTEREST_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
          </div>
          <div className="course-search-panel__footer">
            <span className="active-filter-summary">필터 {activeFilterCount}개 적용</span>
            <button className="button button--outline" type="button" onClick={resetFilters}>조건 초기화</button>
          </div>
        </section>

        <section className="course-results" aria-labelledby="course-results-heading">
          <div className="results-toolbar">
            <div>
              <p className="eyebrow">공개 큐레이션</p>
              <h2 className="section-title" id="course-results-heading">{results.length}개의 코스</h2>
              <p className="results-caption">조건 적합도와 최근 확인일을 기준으로 비교합니다.</p>
            </div>
            <div className="results-toolbar__actions">
              <label className="sort-control" htmlFor="course-sort">정렬
                <select id="course-sort" value={sort} onChange={(event) => { const value = event.target.value; setSort(value === "duration" || value === "recent" ? value : "fit"); }}>
                  <option value="fit">조건 적합도순</option>
                  <option value="duration">소요시간순</option>
                  <option value="recent">최근 확인순</option>
                </select>
              </label>
              <button className="button button--quiet" type="button" onClick={() => setFailed((current) => !current)}>{failed ? "조회 재시도" : "오류 상태 보기"}</button>
            </div>
          </div>
          {failed ? (
            <div className="status-banner status-banner--error" role="alert">
              <strong>코스 조회가 잠시 멈췄어요.</strong>
              <span>입력한 키워드와 필터는 그대로 두었습니다. 다시 시도해 주세요.</span>
              <button className="button button--outline" type="button" onClick={() => setFailed(false)}>다시 시도</button>
            </div>
          ) : results.length === 0 ? (
            <div className="empty-state"><strong>조건에 맞는 코스가 없어요.</strong><span>키워드나 필터를 조금 넓혀 보세요.</span><button className="button button--outline" type="button" onClick={resetFilters}>전체 코스 보기</button></div>
          ) : (
            <div className="course-result-grid">
              {results.map((curation) => <CuratedRouteCard curation={curation} key={curation.id} selected={false} actionHref={`/plan?curation=${curation.id}`} actionLabel="지도에서 편집" compact />)}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
