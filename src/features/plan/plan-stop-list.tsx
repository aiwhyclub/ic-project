"use client";

import { useState } from "react";
import type { Place, PlanStop } from "@/features/app/app-state";

type PlanStopListProps = Readonly<{
  readonly stops: readonly PlanStop[];
  readonly places: readonly Place[];
  readonly onRemove: (placeId: string) => void;
  readonly onMove: (fromIndex: number, toIndex: number) => void;
}>;

export function PlanStopList({ stops, places, onMove, onRemove }: PlanStopListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  function placeFor(stop: PlanStop): Place | null {
    return places.find((place) => place.id === stop.placeId) ?? null;
  }

  function dropAt(index: number) {
    if (draggedIndex !== null) {
      onMove(draggedIndex, index);
    }
    setDraggedIndex(null);
  }

  return (
    <ol className="plan-stop-list" aria-label="방문 순서">
      {stops.map((stop, index) => {
        const place = placeFor(stop);
        return (
          <li
            className="plan-stop-list__item"
            draggable
            key={stop.placeId}
            onDragStart={() => setDraggedIndex(index)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => dropAt(index)}
          >
            <span className="plan-stop-list__number" aria-hidden="true">{index + 1}</span>
            <div className="plan-stop-list__content">
              <strong>{place?.name ?? "확인할 수 없는 장소"}</strong>
              <span>{place?.category ?? "장소"} · 체류 {stop.dwellMinutes}분</span>
            </div>
            <div className="plan-stop-list__actions">
              <button type="button" aria-label={`${place?.name ?? "장소"} 위로 이동`} disabled={index === 0} onClick={() => onMove(index, index - 1)}>위</button>
              <button type="button" aria-label={`${place?.name ?? "장소"} 아래로 이동`} disabled={index === stops.length - 1} onClick={() => onMove(index, index + 1)}>아래</button>
              <button type="button" aria-label={`${place?.name ?? "장소"} 삭제`} onClick={() => onRemove(stop.placeId)}>삭제</button>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
