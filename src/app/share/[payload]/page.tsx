import Link from "next/link";
import { SEED_PLACES } from "@/features/app/app-seed";
import { decodeSharedItinerary } from "@/features/itineraries/share-codec";

type SharedItineraryPageProps = Readonly<{
  params: Promise<Readonly<{ payload: string }>>;
}>;

const TRANSPORT_LABELS = {
  walk: "도보",
  car: "자차",
  transit: "대중교통",
} as const;

export default async function SharedItineraryPage({ params }: SharedItineraryPageProps) {
  const { payload } = await params;
  const itinerary = decodeSharedItinerary(payload);

  if (itinerary === null) {
    return <main className="app-canvas" id="main-content"><section className="page-shell"><div className="empty-state"><h1>공유 동선을 열 수 없습니다.</h1><p>링크가 손상되었거나 지원하지 않는 형식입니다.</p><Link className="button button--primary" href="/courses">공개 코스 보기</Link></div></section></main>;
  }

  return (
    <main className="app-canvas" id="main-content">
      <section className="page-shell itinerary-detail-page">
        <header className="itinerary-detail-header">
          <div><p className="eyebrow">공개 공유 동선</p><h1 className="catalog-title">{itinerary.title}</h1><p className="catalog-description">{itinerary.travelDate} · {TRANSPORT_LABELS[itinerary.transportMode]} · 지도 원문 없이 장소 순서만 공유합니다.</p></div>
          <Link className="button button--primary" href="/plan">내 동선 만들기</Link>
        </header>
        <section className="saved-itinerary-stops" aria-labelledby="shared-stops-title">
          <div className="plan-section-heading"><h2 id="shared-stops-title">방문 순서</h2><span>{itinerary.stops.length}곳</span></div>
          <ol>{itinerary.stops.map((stop, index) => {
            const place = SEED_PLACES.find((item) => item.id === stop.placeId);
            return <li key={`${stop.placeId}-${stop.position}`}><span>{index + 1}</span><strong>{place?.name ?? "공개 장소"}</strong><small>체류 {stop.dwellMinutes}분</small></li>;
          })}</ol>
        </section>
        <p className="status-banner status-banner--info">공유 링크에는 내부 장소 ID·순서·이동수단·체류시간만 포함되며 지도 이미지와 경로 원문은 포함되지 않습니다.</p>
      </section>
    </main>
  );
}
