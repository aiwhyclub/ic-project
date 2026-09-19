import { TravelWorkspace } from "@/features/travel/travel-workspace";

export default async function TravelPage({ params }: { readonly params: Promise<{ readonly id: string }> }) {
  const { id } = await params;
  return <TravelWorkspace itineraryId={id} />;
}
