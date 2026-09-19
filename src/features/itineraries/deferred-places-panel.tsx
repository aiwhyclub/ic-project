"use client";

import { useEffect, useState } from "react";

const DEFERRED_PLACES_KEY = "icheon-savepoint-deferred-places";

function readDeferredPlaces(): readonly string[] {
  const stored = window.localStorage.getItem(DEFERRED_PLACES_KEY);
  if (stored === null) {
    return [];
  }
  return stored.split("|").flatMap((item) => {
    const separator = item.indexOf(":");
    return separator < 0 ? [] : [item.slice(separator + 1)];
  });
}

export function DeferredPlacesPanel() {
  const [places, setPlaces] = useState<readonly string[]>([]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setPlaces(readDeferredPlaces()));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  if (places.length === 0) {
    return null;
  }

  return (
    <section className="deferred-places-panel" aria-labelledby="deferred-places-title">
      <div className="plan-section-heading"><h2 id="deferred-places-title">다음에 가기</h2><span>{places.length}곳</span></div>
      <ul>{places.map((place) => <li key={place}>{place}</li>)}</ul>
    </section>
  );
}
