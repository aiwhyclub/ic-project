import { redirect } from "next/navigation";

type MyItineraryAliasProps = Readonly<{
  params: Promise<Readonly<{ id: string }>>;
}>;

export default async function MyItineraryAlias({ params }: MyItineraryAliasProps) {
  const { id } = await params;
  redirect(`/itineraries/${encodeURIComponent(id)}`);
}
