export type TransportMode = "walk" | "car" | "transit";
export type AuthProvider = "google" | "kakao" | "demo";
export type SegmentStatus = "idle" | "calculating" | "ready" | "error";

export type Place = {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly address: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly defaultDwellMinutes: number;
  readonly description: string;
  readonly sourceUrl: string;
  readonly verifiedAt: string;
};

export type PlanStop = {
  readonly placeId: string;
  readonly position: number;
  readonly dwellMinutes: number;
};

export type RouteSegment = {
  readonly id: string;
  readonly fromPlaceId: string;
  readonly toPlaceId: string;
  readonly distanceMeters: number;
  readonly durationMinutes: number;
  readonly status: SegmentStatus;
  readonly errorMessage: string | null;
  readonly lastCalculatedAt: string | null;
};

export type WorkingPlan = {
  readonly id: string;
  readonly sourceItineraryId: string | null;
  readonly title: string;
  readonly travelDate: string;
  readonly companionType: string;
  readonly transportMode: TransportMode;
  readonly stops: readonly PlanStop[];
  readonly segments: readonly RouteSegment[];
  readonly updatedAt: string;
};

export type Itinerary = {
  readonly id: string;
  readonly userId: string;
  readonly title: string;
  readonly travelDate: string;
  readonly companionType: string;
  readonly transportMode: TransportMode;
  readonly status: "confirmed";
  readonly stops: readonly PlanStop[];
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type AppSession = {
  readonly userId: string;
  readonly email: string;
  readonly displayName: string;
  readonly provider: AuthProvider;
};

export type SaveResult =
  | { readonly kind: "requires-auth"; readonly plans: readonly WorkingPlan[] }
  | { readonly kind: "saved"; readonly itineraryIds: readonly string[] };

export type AuthStartResult =
  | { readonly kind: "redirecting" }
  | { readonly kind: "signed-in" }
  | { readonly kind: "error"; readonly message: string };

export type PersistedState = {
  readonly session: AppSession | null;
  readonly workingPlans: readonly WorkingPlan[];
  readonly pendingSave: readonly WorkingPlan[] | null;
  readonly draftPlans: readonly WorkingPlan[];
  readonly itineraries: readonly Itinerary[];
  readonly activeItineraryId: string | null;
  readonly travelProgress: Readonly<Record<string, number>>;
};

export type AppState = {
  readonly isHydrated: boolean;
  readonly session: AppSession | null;
  readonly authConfigured: boolean;
  readonly authPending: boolean;
  readonly authError: string | null;
  readonly places: readonly Place[];
  readonly workingPlans: readonly WorkingPlan[];
  readonly pendingSave: readonly WorkingPlan[] | null;
  readonly itineraries: readonly Itinerary[];
  readonly activeItineraryId: string | null;
  readonly travelProgress: Readonly<Record<string, number>>;
  readonly startPlans: (planIds?: readonly string[]) => void;
  readonly clearWorkingPlans: () => void;
  readonly updatePlanStops: (planId: string, stops: readonly PlanStop[]) => void;
  readonly addStop: (planId: string, placeId: string, position: number) => void;
  readonly removeStop: (planId: string, placeId: string) => void;
  readonly moveStop: (planId: string, fromIndex: number, toIndex: number) => void;
  readonly setTransportMode: (planId: string, transportMode: TransportMode) => void;
  readonly recomputePlan: (planId: string, segmentId?: string) => void;
  readonly markSegmentFailure: (planId: string, segmentId: string) => void;
  readonly retrySegment: (planId: string, segmentId: string) => void;
  readonly savePlans: () => SaveResult;
  readonly startOAuth: (provider: Exclude<AuthProvider, "demo">, returnTo: string) => Promise<AuthStartResult>;
  readonly startDemoSession: () => void;
  readonly completeOAuthCallback: (code: string | null, state: string | null) => Promise<AuthStartResult>;
  readonly logout: () => Promise<void>;
  readonly deleteAccount: () => Promise<{ readonly ok: boolean; readonly message?: string }>;
  readonly getItinerary: (itineraryId: string) => Itinerary | null;
  readonly openItineraryInEditor: (itineraryId: string) => boolean;
  readonly deleteItinerary: (itineraryId: string) => void;
  readonly startTrip: (itineraryId: string) => void;
  readonly setTravelProgress: (itineraryId: string, position: number) => void;
  readonly replaceTravelStop: (itineraryId: string, position: number, placeId: string) => boolean;
};
