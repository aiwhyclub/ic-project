"use client";

import type { Itinerary, Place } from "@/features/app/app-state";

type SavedItineraryCardProps = Readonly<{
  readonly itinerary: Itinerary;
  readonly places: readonly Place[];
  readonly deleting: boolean;
  readonly onOpen: () => void;
  readonly onEdit: () => void;
  readonly onDeleteRequest: () => void;
  readonly onDeleteCancel: () => void;
  readonly onDeleteConfirm: () => void;
}>;

export function SavedItineraryCard({ itinerary, places, deleting, onDeleteCancel, onDeleteConfirm, onDeleteRequest, onEdit, onOpen }: SavedItineraryCardProps) {
  const names = itinerary.stops.map((stop) => places.find((place) => place.id === stop.placeId)?.name ?? "장소");
  const transport = itinerary.transportMode === "car" ? "자차" : itinerary.transportMode === "walk" ? "도보" : "대중교통";
  return (
    <article className="saved-route-card">
      <div className="saved-route-card__body">
        <p className="catalog-kicker">{itinerary.companionType} · {transport}</p>
        <h2>{itinerary.title}</h2>
        <p>{itinerary.travelDate} · {names.join(" → ")}</p>
        <small>마지막 수정 {new Date(itinerary.updatedAt).toLocaleString("ko-KR")}</small>
      </div>
      {!deleting ? (
        <div className="saved-route-card__actions">
          <button className="primary-status" type="button" onClick={onOpen}>동선 열기</button>
          <button className="navigation-link" type="button" onClick={onEdit}>편집</button>
          <button className="navigation-link" type="button" onClick={onDeleteRequest}>삭제</button>
        </div>
      ) : (
        <div className="saved-route-card__confirmation" role="alert">
          <p><strong>{itinerary.title}</strong>과 장소 순서·임시 초안이 함께 삭제됩니다. 되돌릴 수 없습니다.</p>
          <button className="navigation-link" type="button" onClick={onDeleteCancel}>취소</button>
          <button className="navigation-link" type="button" onClick={onDeleteConfirm}>최종 삭제</button>
        </div>
      )}
    </article>
  );
}
