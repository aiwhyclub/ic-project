"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthPanel } from "@/features/auth/auth-panel";
import { useAppState } from "@/features/app/app-state";
import { DeferredPlacesPanel } from "./deferred-places-panel";
import { SavedItineraryCard } from "./saved-itinerary-card";

type MypageWorkspaceProps = Readonly<{ readonly sessionExpired: boolean }>;

export function MypageWorkspace({ sessionExpired }: MypageWorkspaceProps) {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
  const {
    authError,
    isHydrated,
    itineraries,
    places,
    session,
    deleteAccount,
    deleteItinerary,
    logout,
    openItineraryInEditor,
  } = useAppState();

  const ownedItineraries = useMemo(() => session === null ? [] : itineraries.filter((item) => item.userId === session.userId), [itineraries, session]);

  async function confirmAccountDeletion() {
    const result = await deleteAccount();
    if (!result.ok) {
      setDeleteMessage(result.message ?? "계정 삭제에 실패했습니다.");
      return;
    }
    router.replace("/?account=deleted");
  }

  if (!isHydrated) {
    return <main className="app-canvas" id="main-content"><section className="page-shell"><p className="status-banner status-banner--info">저장 동선을 불러오고 있습니다.</p></section></main>;
  }

  if (session === null) {
    return (
      <main className="app-canvas" id="main-content">
        <section className="page-shell mypage-page">
          {sessionExpired && <p className="status-banner status-banner--warning" role="status">세션이 만료되었습니다. 저장 동선을 보려면 다시 로그인해 주세요.</p>}
          <AuthPanel reason="마이페이지에서는 계정에 저장한 동선을 다시 열고 수정·삭제할 수 있습니다." returnTo="/mypage" />
        </section>
      </main>
    );
  }

  return (
    <main className="app-canvas" id="main-content">
      <section className="page-shell mypage-page">
        <header className="mypage-header">
          <div><p className="eyebrow">마이페이지</p><h1 className="catalog-title">{session.displayName}님의 이천 여행</h1><p className="catalog-description">저장한 동선은 계정별로 분리되며, 다시 열 때 최신 구간을 계산합니다.</p></div>
          <div className="mypage-header__actions"><button className="primary-status" type="button" onClick={() => router.push("/plan")}>새 동선 만들기</button><button className="navigation-link" type="button" onClick={() => void logout()}>로그아웃</button></div>
        </header>
        {authError !== null && <p className="status-banner status-banner--error" role="alert">{authError}</p>}
        {ownedItineraries.length === 0 ? (
          <section className="empty-state" aria-labelledby="empty-itineraries-title"><h2 id="empty-itineraries-title">아직 저장한 동선이 없습니다.</h2><p>계획 화면에서 장소 순서를 만든 뒤 저장하면 이곳에 일정 카드가 생깁니다.</p><button className="primary-status" type="button" onClick={() => router.push("/plan")}>첫 동선 계획하기</button></section>
        ) : (
          <section className="saved-route-list" aria-labelledby="saved-itineraries-title"><div className="plan-section-heading"><h2 id="saved-itineraries-title">저장한 동선 {ownedItineraries.length}개</h2><span>내 계정만 표시</span></div>{ownedItineraries.map((itinerary) => <SavedItineraryCard key={itinerary.id} itinerary={itinerary} places={places} deleting={deleteTarget === itinerary.id} onOpen={() => router.push(`/itineraries/${itinerary.id}`)} onEdit={() => { openItineraryInEditor(itinerary.id); router.push(`/plan?edit=${encodeURIComponent(itinerary.id)}`); }} onDeleteRequest={() => setDeleteTarget(itinerary.id)} onDeleteCancel={() => setDeleteTarget(null)} onDeleteConfirm={() => { deleteItinerary(itinerary.id); setDeleteTarget(null); }} />)}</section>
        )}
        <DeferredPlacesPanel />
        <section className="account-danger-zone" aria-labelledby="account-danger-title"><h2 id="account-danger-title">계정 및 저장정보</h2><p>계정을 삭제하면 저장 동선과 초안이 즉시 영구 삭제되고 다시 복구할 수 없습니다.</p>{deleteAccountOpen ? <div className="account-danger-zone__confirmation" role="alert"><p>정말 모든 저장정보와 계정을 삭제할까요?</p><button className="navigation-link" type="button" onClick={() => setDeleteAccountOpen(false)}>취소</button><button className="navigation-link" type="button" onClick={() => void confirmAccountDeletion()}>최종 삭제</button></div> : <button className="navigation-link" type="button" onClick={() => setDeleteAccountOpen(true)}>계정과 저장정보 삭제</button>}{deleteMessage !== null && <p className="status-banner status-banner--error" role="alert">{deleteMessage}</p>}</section>
      </section>
    </main>
  );
}
