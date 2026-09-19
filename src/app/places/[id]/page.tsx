import { notFound } from "next/navigation";
import { PlaceDetail } from "@/features/public/place-detail";
import { getPublicPlace } from "@/features/public/public-data";

type PlaceDetailPageProps = Readonly<{
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

function safeReturnPath(value: string | string[] | undefined): string {
  const path = Array.isArray(value) ? value[0] : value;
  return path && path.startsWith("/") ? path : "/map";
}

export default async function PlaceDetailPage({ params, searchParams }: PlaceDetailPageProps) {
  const [{ id }, currentSearchParams] = await Promise.all([params, searchParams]);
  const place = getPublicPlace(id);
  if (!place) notFound();
  return <PlaceDetail place={place} returnTo={safeReturnPath(currentSearchParams["returnTo"])} />;
}
