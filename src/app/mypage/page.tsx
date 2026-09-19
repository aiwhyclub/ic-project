import { MypageWorkspace } from "@/features/itineraries/mypage-workspace";

export default async function MyPage({ searchParams }: { readonly searchParams: Promise<{ readonly session?: string }> }) {
  const params = await searchParams;
  return <MypageWorkspace sessionExpired={params.session === "expired"} />;
}
