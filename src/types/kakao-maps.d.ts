type KakaoLatLng = Readonly<{
  getLat: () => number;
  getLng: () => number;
}>;

type KakaoMapInstance = Readonly<{
  setCenter: (position: KakaoLatLng) => void;
}>;

type KakaoMarkerInstance = Readonly<{
  setMap: (map: KakaoMapInstance | null) => void;
}>;

type KakaoMapsApi = Readonly<{
  load: (callback: () => void) => void;
  LatLng: new (latitude: number, longitude: number) => KakaoLatLng;
  Map: new (container: HTMLElement, options: Readonly<{ center: KakaoLatLng; level: number }>) => KakaoMapInstance;
  Marker: new (options: Readonly<{ map: KakaoMapInstance; position: KakaoLatLng; title: string }>) => KakaoMarkerInstance;
  event: Readonly<{
    addListener: (target: KakaoMarkerInstance, eventName: "click", callback: () => void) => void;
  }>;
}>;

interface Window {
  kakao?: Readonly<{
    maps: KakaoMapsApi;
  }>;
}
