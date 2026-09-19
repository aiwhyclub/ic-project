import Link from "next/link";
import {
  COMPANION_LABELS,
  getCurationPlaces,
  TRANSPORT_LABELS,
  type PublicCuration,
} from "@/features/public/public-data";

type CuratedRouteCardProps = Readonly<{
  curation: PublicCuration;
  selected: boolean;
  onToggle?: (curationId: string) => void;
  actionHref?: string;
  actionLabel?: string;
  compact?: boolean;
}>;

export function CuratedRouteCard({
  curation,
  selected,
  onToggle,
  actionHref,
  actionLabel = "지도에서 편집",
  compact = false,
}: CuratedRouteCardProps) {
  const places = getCurationPlaces(curation);
  const selectionLabel = selected ? "선택됨" : "선택하지 않음";

  return (
    <article className={`curated-route-card${selected ? " curated-route-card--selected" : ""}${compact ? " curated-route-card--compact" : ""}`}>
      <div className="curated-route-card__visual" aria-hidden="true">
        <span className="curated-route-card__visual-mark">{places.length}</span>
        <span className="curated-route-card__visual-line" />
        <span className="curated-route-card__visual-caption">{curation.isFallback ? "검증된 기본 동선" : "AI 제안 동선"}</span>
      </div>
      <div className="curated-route-card__body">
        <div className="curated-route-card__meta-row">
          <p className="curated-route-card__audience">{curation.audienceType}</p>
          {curation.isFallback ? <span className="status-badge status-badge--fallback">기본 큐레이션</span> : null}
        </div>
        <h2 className="curated-route-card__title">{curation.title}</h2>
        <p className="curated-route-card__facts">
          {TRANSPORT_LABELS[curation.transportMode]} · {Math.floor(curation.durationMinutes / 60)}시간 {curation.durationMinutes % 60 > 0 ? `${curation.durationMinutes % 60}분` : ""}
        </p>
        <ol className="curated-route-card__stops" aria-label="주요 장소">
          {places.map((place) => <li key={place.id}>{place.name}</li>)}
        </ol>
        <p className="curated-route-card__reason">{curation.recommendationReason}</p>
        <div className="curated-route-card__actions">
          {onToggle ? (
            <button
              className="button button--outline curated-route-card__select"
              type="button"
              aria-pressed={selected}
              onClick={() => onToggle(curation.id)}
            >
              <span aria-hidden="true">{selected ? "✓" : "＋"}</span>
              {selectionLabel}
            </button>
          ) : null}
          {actionHref ? <Link className="button button--primary" href={actionHref}>{actionLabel}</Link> : null}
        </div>
      </div>
      <span className="sr-only">적합도 {curation.fitScore}점</span>
      <span className="sr-only">동행 유형 {COMPANION_LABELS[curation.companionType]}</span>
    </article>
  );
}
