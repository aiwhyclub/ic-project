"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppState } from "@/features/app/app-state";

type AuthPanelProps = Readonly<{
  readonly reason: string;
  readonly returnTo?: string;
  readonly onCancel?: () => void;
  readonly onComplete?: () => void;
}>;

export function AuthPanel({ reason, returnTo, onCancel, onComplete }: AuthPanelProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { authConfigured, authError, authPending, startDemoSession, startOAuth } = useAppState();
  const [providerMessage, setProviderMessage] = useState<string | null>(null);
  const destination = returnTo ?? pathname;
  const demoAuthEnabled = process.env["NEXT_PUBLIC_ENABLE_DEMO_AUTH"] === "true" || !authConfigured;

  async function begin(provider: "google" | "kakao") {
    const result = await startOAuth(provider, destination);
    if (result.kind === "signed-in") {
      setProviderMessage("로그인되었습니다. 요청한 작업으로 돌아갑니다.");
      onComplete?.();
      if (onComplete === undefined) {
        router.replace(destination);
      }
    }
    if (result.kind === "error") {
      setProviderMessage(result.message);
    }
  }

  function useDemoAccount() {
    startDemoSession();
    setProviderMessage("로컬 데모 계정으로 로그인했습니다.");
    onComplete?.();
  }

  return (
    <section className="oauth-card" aria-labelledby="auth-panel-title">
      <p className="eyebrow">저장 전 로그인</p>
      <h2 className="oauth-card__title" id="auth-panel-title">여행을 이어서 저장하려면 로그인이 필요해요.</h2>
      <p className="oauth-card__reason">{reason}</p>
      <p className="oauth-card__return">로그인 후 <strong>{destination}</strong>으로 돌아가 편집하던 일정을 이어갑니다.</p>
      <div className="oauth-card__actions">
        <button className="primary-status" type="button" disabled={authPending} onClick={() => void begin("google")}>
          {authPending ? "로그인 확인 중" : "Google로 로그인"}
        </button>
        <button className="navigation-link" type="button" disabled={authPending} onClick={() => void begin("kakao")}>
          Kakao로 로그인
        </button>
        {demoAuthEnabled && (
          <button className="navigation-link" type="button" disabled={authPending} onClick={useDemoAccount}>
            로컬 데모 계정으로 계속
          </button>
        )}
      </div>
      <p className="oauth-card__privacy">{authConfigured ? "Supabase Auth가 인증을 처리하며 제공자 비밀번호를 저장하지 않습니다." : "OAuth 환경변수가 없어 로컬 브라우저에만 데모 세션을 저장합니다."}{authConfigured && demoAuthEnabled ? " 로컬 개발에서는 데모 로그인을 함께 사용할 수 있습니다." : ""}</p>
      {(authError !== null || providerMessage !== null) && (
        <p className="status-banner status-banner--error" role="alert">{providerMessage ?? authError}</p>
      )}
      {onCancel !== undefined && (
        <button className="navigation-link" type="button" onClick={onCancel}>취소하고 편집으로 돌아가기</button>
      )}
    </section>
  );
}
