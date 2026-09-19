import { ItineraryDetail } from "@/features/itineraries/itinerary-detail";

export default async function ItineraryDetailPage({ params }: { readonly params: Promise<{ readonly id: string }> }) {
  const { id } = await params;
  return <ItineraryDetail itineraryId={id} />;
}
