import { AppPlanBScreen } from "@/features/plan-b/app-plan-b-screen";

type PlanBPageProps = Readonly<{
  searchParams: Promise<Readonly<{ itinerary?: string }>>;
}>;

export default async function PlanBPage({ searchParams }: PlanBPageProps) {
  const { itinerary = "" } = await searchParams;
  return <AppPlanBScreen itineraryId={itinerary} />;
}
