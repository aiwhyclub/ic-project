"use client";

import type { ChangeEvent, Dispatch, SetStateAction } from "react";

import type { Coordinates } from "@/lib/domain/types";

import { deriveRegionLabel, PLAN_B_MANUAL_REGIONS, type PlanBBusyAction, type PlanBFailure } from "./plan-b-helpers";
import type { PlanBItinerary, PlanBLocationSelection } from "./plan-b-types";

type LocationActionInput = Readonly<{
  itinerary: PlanBItinerary;
  setLocation: Dispatch<SetStateAction<PlanBLocationSelection | null>>;
  setManualRegionId: Dispatch<SetStateAction<string>>;
  setManualPlaceId: Dispatch<SetStateAction<string>>;
  setLocationMessage: Dispatch<SetStateAction<string>>;
  setFailure: Dispatch<SetStateAction<PlanBFailure | null>>;
  setBusyAction: Dispatch<SetStateAction<PlanBBusyAction>>;
  setEphemeralCoordinates: Dispatch<SetStateAction<Coordinates | null>>;
}>;

export function createPlanBLocationActions(input: LocationActionInput) {
  function chooseManualRegion(event: ChangeEvent<HTMLSelectElement>) {
    const regionId = event.currentTarget.value;
    input.setManualRegionId(regionId);
    input.setManualPlaceId("");
    const region = PLAN_B_MANUAL_REGIONS.find((item) => item.id === regionId);

    if (!region) {
      input.setLocation(null);
      input.setLocationMessage("권역 또는 현재 장소를 선택하세요.");
      return;
    }

    input.setLocation({ source: "manual-region", label: region.label, placeId: null });
    input.setLocationMessage("수동으로 고른 권역을 기준으로 추천합니다.");
    input.setFailure(null);
  }

  function chooseManualPlace(event: ChangeEvent<HTMLSelectElement>) {
    const placeId = event.currentTarget.value;
    input.setManualPlaceId(placeId);
    input.setManualRegionId("");
    const place = input.itinerary.stops.find((stop) => stop.placeId === placeId);

    if (!place) {
      input.setLocation(null);
      input.setLocationMessage("권역 또는 현재 장소를 선택하세요.");
      return;
    }

    input.setLocation({ source: "manual-place", label: place.name, placeId: place.placeId });
    input.setLocationMessage("일정의 장소를 기준으로 추천합니다.");
    input.setFailure(null);
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      input.setFailure({ kind: "location", message: "이 브라우저에서는 위치를 사용할 수 없습니다. 아래의 수동 선택을 이용하세요.", retryable: false, fallbackUsed: true });
      return;
    }

    input.setBusyAction("location");
    input.setFailure(null);
    input.setLocationMessage("브라우저 권한을 기다리는 중입니다.");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates: Coordinates = { latitude: position.coords.latitude, longitude: position.coords.longitude };
        input.setEphemeralCoordinates(coordinates);
        const label = deriveRegionLabel(coordinates);
        input.setLocation({ source: "consented-current", label, placeId: null });
        input.setEphemeralCoordinates(null);
        input.setLocationMessage("지역을 정한 뒤 현재 좌표는 즉시 폐기했습니다.");
        input.setBusyAction(null);
      },
      () => {
        input.setEphemeralCoordinates(null);
        input.setBusyAction(null);
        input.setFailure({ kind: "location", message: "위치를 확인하지 못했습니다. 권한을 허용하거나 수동 위치를 선택하세요.", retryable: true, fallbackUsed: true });
        input.setLocationMessage("위치 실패 후에도 수동 선택으로 계속할 수 있습니다.");
      },
      { enableHighAccuracy: false, maximumAge: 0, timeout: 8_000 },
    );
  }

  return { chooseManualRegion, chooseManualPlace, useCurrentLocation };
}
