import { PlanBWorkspace } from "@/features/travel/plan-b-workspace";

export default async function TravelPlanBPage({ searchParams }: { readonly searchParams: Promise<{ readonly itinerary?: string; readonly position?: string }> }) {
  const params = await searchParams;
  const itineraryId = params.itinerary ?? "";
  const parsedPosition = Number(params.position ?? "0");
  const position = Number.isFinite(parsedPosition) && parsedPosition >= 0 ? parsedPosition : 0;
  return <PlanBWorkspace itineraryId={itineraryId} position={position} />;
}
