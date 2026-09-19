"use client";

import type { Place, RouteSegment } from "@/features/app/app-state";

type PlanRouteStatusProps = Readonly<{
  readonly segments: readonly RouteSegment[];
  readonly places: readonly Place[];
  readonly onRetry: (segmentId: string) => void;
  readonly onFail: (segmentId: string) => void;
}>;

function minutesLabel(minutes: number): string {
  return minutes < 60 ? `${minutes}분` : `${Math.floor(minutes / 60)}시간 ${minutes % 60}분`;
}

function segmentLabel(segment: RouteSegment, places: readonly Place[]): string {
  const from = places.find((place) => place.id === segment.fromPlaceId)?.name ?? "출발 장소";
  const to = places.find((place) => place.id === segment.toPlaceId)?.name ?? "도착 장소";
  return `${from} → ${to}`;
}

export function PlanRouteStatus({ segments, places, onRetry, onFail }: PlanRouteStatusProps) {
  const totalDistance = segments.reduce((sum, segment) => sum + segment.distanceMeters, 0);
  const totalDuration = segments.reduce((sum, segment) => sum + segment.durationMinutes, 0);
  return (
    <section className="plan-route-status" aria-labelledby="route-summary-title">
      <div className="plan-section-heading">
        <div>
          <p className="eyebrow">Kakao 경로 계산</p>
          <h2 id="route-summary-title">구간별 이동 요약</h2>
        </div>
        <p className="plan-route-status__total">전체 {Math.round(totalDistance / 100) / 10}km · {minutesLabel(totalDuration)}</p>
      </div>
      {segments.length === 0 ? (
        <p className="status-banner status-banner--info" role="status">장소를 두 곳 이상 선택하면 이동 구간이 표시됩니다.</p>
      ) : (
        <ol className="plan-route-status__list">
          {segments.map((segment) => (
            <li className="plan-route-status__item" key={segment.id}>
              <div>
                <strong>{segmentLabel(segment, places)}</strong>
                <span>
                  {segment.status === "calculating" && "계산 중입니다."}
                  {segment.status === "ready" && `${Math.round(segment.distanceMeters / 100) / 10}km · ${minutesLabel(segment.durationMinutes)} · ${segment.lastCalculatedAt === null ? "최근 계산 없음" : new Date(segment.lastCalculatedAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}`}
                  {segment.status === "idle" && "순서가 바뀌어 다시 계산이 필요합니다."}
                  {segment.status === "error" && (segment.errorMessage ?? "이 구간을 계산하지 못했습니다.")}
                </span>
              </div>
              <div className="plan-route-status__actions">
                {segment.status === "error" && <button type="button" onClick={() => onRetry(segment.id)}>다시 계산</button>}
                {segment.status === "error" && <a href={`https://map.kakao.com/?q=${encodeURIComponent(segmentLabel(segment, places))}`} target="_blank" rel="noreferrer">Kakao 지도 열기</a>}
                {segment.status !== "error" && <button type="button" onClick={() => onFail(segment.id)}>오류 시뮬레이션</button>}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
