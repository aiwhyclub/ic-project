"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type KakaoMapPlace = Readonly<{
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}>;

type KakaoMapCanvasProps = Readonly<{
  places: readonly KakaoMapPlace[];
  selectedPlaceId?: string;
  onSelect?: (placeId: string) => void;
  fallback: ReactNode;
}>;

const KAKAO_SCRIPT_ID = "kakao-map-sdk";
type MapLoadStatus = "loading" | "ready" | "failed";

export function KakaoMapCanvas({ places, selectedPlaceId, onSelect, fallback }: KakaoMapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<MapLoadStatus>("loading");
  const appKey = process.env["NEXT_PUBLIC_KAKAO_MAP_APP_KEY"];

  useEffect(() => {
    if (!appKey) {
      return;
    }
    const timeout = window.setTimeout(() => setStatus("failed"), 4500);
    const finish = (nextStatus: MapLoadStatus) => {
      window.clearTimeout(timeout);
      setStatus(nextStatus);
    };
    const complete = () => {
      const maps = window.kakao?.maps;
      if (maps === undefined) {
        finish("failed");
        return;
      }
      maps.load(() => finish("ready"));
    };
    const fail = () => finish("failed");
    if (window.kakao !== undefined) {
      complete();
      return () => window.clearTimeout(timeout);
    }
    const existing = document.getElementById(KAKAO_SCRIPT_ID);
    if (existing !== null) {
      existing.addEventListener("load", complete, { once: true });
      existing.addEventListener("error", fail, { once: true });
      return () => {
        window.clearTimeout(timeout);
        existing.removeEventListener("load", complete);
        existing.removeEventListener("error", fail);
      };
    }
    const script = document.createElement("script");
    script.id = KAKAO_SCRIPT_ID;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(appKey)}&autoload=false`;
    script.async = true;
    script.addEventListener("load", complete, { once: true });
    script.addEventListener("error", fail, { once: true });
    document.head.append(script);
    return () => {
      window.clearTimeout(timeout);
      script.removeEventListener("load", complete);
      script.removeEventListener("error", fail);
    };
  }, [appKey]);

  useEffect(() => {
    const maps = window.kakao?.maps;
    const container = containerRef.current;
    const firstPlace = places.find((place) => place.id === selectedPlaceId) ?? places[0];
    if (status !== "ready" || maps === undefined || container === null || firstPlace === undefined) {
      return;
    }
    const center = new maps.LatLng(firstPlace.latitude, firstPlace.longitude);
    const map = new maps.Map(container, { center, level: 7 });
    const markers = places.map((place) => {
      const marker = new maps.Marker({
        map,
        position: new maps.LatLng(place.latitude, place.longitude),
        title: place.name,
      });
      if (onSelect !== undefined) {
        maps.event.addListener(marker, "click", () => onSelect(place.id));
      }
      return marker;
    });
    return () => markers.forEach((marker) => marker.setMap(null));
  }, [onSelect, places, selectedPlaceId, status]);

  if (!appKey || status === "failed") {
    return fallback;
  }

  return <div className="kakao-map-live" ref={containerRef} role="img" aria-label="Kakao Map에 표시한 이천 장소" aria-busy={status === "loading"} />;
}
