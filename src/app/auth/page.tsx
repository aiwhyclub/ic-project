import { AuthPanel } from "@/features/auth/auth-panel";

type AuthPageProps = Readonly<{
  searchParams: Promise<Readonly<{ returnTo?: string | readonly string[] }>>;
}>;

function safeReturnTo(value: string | readonly string[] | undefined): string {
  const path = Array.isArray(value) ? value[0] : value;
  return typeof path === "string" && path.startsWith("/") && !path.startsWith("//") ? path : "/mypage";
}

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const { returnTo } = await searchParams;
  return (
    <main className="app-canvas" id="main-content">
      <section className="page-shell auth-page">
        <AuthPanel reason="저장 동선을 다시 열고 마이페이지에서 관리하려면 계정 확인이 필요합니다." returnTo={safeReturnTo(returnTo)} />
      </section>
    </main>
  );
}
