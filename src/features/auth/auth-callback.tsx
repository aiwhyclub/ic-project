"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthPanel } from "./auth-panel";
import { useAppState } from "@/features/app/app-state";

function safeReturnTo(value: string | null): string {
  return value !== null && value.startsWith("/") && !value.startsWith("//") ? value : "/plan";
}

export function AuthCallback() {
  const router = useRouter();
  const handled = useRef(false);
  const [destination, setDestination] = useState("/plan");
  const [message, setMessage] = useState("인증 결과를 확인하고 있습니다.");
  const { completeOAuthCallback } = useAppState();

  useEffect(() => {
    if (handled.current) {
      return;
    }
    handled.current = true;
    const params = new URLSearchParams(window.location.search);
    const storedReturnTo = window.sessionStorage.getItem("kakao-oauth-return-to");
    const nextDestination = safeReturnTo(params.get("returnTo") ?? storedReturnTo);
    window.sessionStorage.removeItem("kakao-oauth-return-to");
    setDestination(nextDestination);
    void completeOAuthCallback(params.get("code"), params.get("state")).then((result) => {
      if (result.kind === "signed-in") {
        setMessage("로그인이 확인되었습니다. 원래 작업으로 돌아갑니다.");
        window.setTimeout(() => router.replace(nextDestination), 320);
      } else if (result.kind === "error") {
        setMessage(result.message);
      } else {
        setMessage("인증을 처리하고 있습니다.");
      }
    });
  }, [completeOAuthCallback, router]);

  return (
    <main className="app-canvas" id="main-content">
      <section className="page-shell auth-callback-page">
        <p className="eyebrow">OAuth 콜백</p>
        <h1 className="catalog-title">{message}</h1>
        <p className="catalog-description">편집 중이던 장소·순서·이동수단은 인증이 취소되거나 실패해도 보존됩니다.</p>
        {message.includes("실패") && <AuthPanel reason="다른 로그인 제공자를 선택하거나 로컬 데모 계정으로 작업을 계속할 수 있습니다." returnTo={destination} />}
      </section>
    </main>
  );
}
