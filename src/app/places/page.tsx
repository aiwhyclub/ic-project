import Link from "next/link";
import { PUBLIC_CURATIONS, PUBLIC_PLACES, TRANSPORT_LABELS } from "@/features/public/public-data";

export default function PlacesPage() {
  return (
    <main className="app-canvas catalog-page" id="main-content">
      <section className="page-shell catalog-page__shell">
        <header className="catalog-header">
          <div>
            <p className="eyebrow">공개 장소 탐색</p>
            <h1 className="catalog-title">이천의 검증된 장소를 먼저 살펴보세요.</h1>
            <p className="catalog-description">로그인 없이 장소의 운영정보와 출처를 확인하고, 상세 화면에서 현재 동선에 추가할 수 있습니다.</p>
          </div>
          <span className="read-only-badge">읽기 전용</span>
        </header>

        <section aria-labelledby="places-title">
          <div className="catalog-section-heading">
            <div><p className="eyebrow">공개 장소</p><h2 id="places-title">{PUBLIC_PLACES.length}곳</h2></div>
            <Link className="button button--outline" href="/map">지도에서 보기</Link>
          </div>
          <div className="catalog-grid catalog-grid--places">
            {PUBLIC_PLACES.map((place) => (
              <article className="catalog-card" key={place.id}>
                <p className="catalog-kicker">{place.category} · {place.area}</p>
                <h3>{place.name}</h3>
                <p>{place.intro}</p>
                <dl className="catalog-meta">
                  <div><dt>운영</dt><dd>{place.openingHours}</dd></div>
                  <div><dt>권장 체류</dt><dd>{place.defaultDwellMinutes}분</dd></div>
                  <div><dt>확인일</dt><dd>{place.verifiedAt}</dd></div>
                </dl>
                <Link className="button button--outline" href={`/places/${place.id}?returnTo=%2Fplaces`}>상세보기</Link>
              </article>
            ))}
          </div>
        </section>

        <section className="catalog-curations" aria-labelledby="curations-title">
          <div className="catalog-section-heading">
            <div><p className="eyebrow">공개 큐레이션</p><h2 id="curations-title">{PUBLIC_CURATIONS.length}개 동선</h2></div>
            <Link className="button button--outline" href="/courses">코스 비교하기</Link>
          </div>
          <div className="catalog-grid catalog-grid--curations">
            {PUBLIC_CURATIONS.map((curation) => (
              <article className="catalog-card catalog-card--accent" key={curation.id}>
                <p className="catalog-kicker">{curation.audienceType}</p>
                <h3>{curation.title}</h3>
                <p>{TRANSPORT_LABELS[curation.transportMode]} · {curation.durationMinutes}분</p>
                <p>{curation.recommendationReason}</p>
                <Link className="button button--primary" href={`/plan?curation=${curation.id}`}>동선 열기</Link>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
