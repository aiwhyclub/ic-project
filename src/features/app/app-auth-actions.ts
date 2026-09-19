"use client";

import { useCallback, type Dispatch, type SetStateAction } from "react";
import { sessionFromSupabase } from "./app-storage";
import type { AppSupabaseClient } from "./app-persistence";
import type { AppSession, AuthProvider, AuthStartResult, Itinerary, WorkingPlan } from "./app-types";

type AuthActionInput = {
  readonly supabase: AppSupabaseClient | null;
  readonly session: AppSession | null;
  readonly setSession: Dispatch<SetStateAction<AppSession | null>>;
  readonly setAuthPending: Dispatch<SetStateAction<boolean>>;
  readonly setAuthError: Dispatch<SetStateAction<string | null>>;
  readonly setWorkingPlans: Dispatch<SetStateAction<readonly WorkingPlan[]>>;
  readonly setDraftPlans: Dispatch<SetStateAction<readonly WorkingPlan[]>>;
  readonly setPendingSave: Dispatch<SetStateAction<readonly WorkingPlan[] | null>>;
  readonly setItineraries: Dispatch<SetStateAction<readonly Itinerary[]>>;
  readonly clearAccountState: () => void;
};

export function useAuthActions(input: AuthActionInput) {
  const {
    clearAccountState,
    setAuthError,
    setAuthPending,
    setDraftPlans,
    setItineraries,
    setPendingSave,
    setSession,
    setWorkingPlans,
    session,
    supabase,
  } = input;

  const startDemoSession = useCallback(() => {
    setSession({
      userId: "local-demo-user",
      email: "demo@icheon-savepoint.local",
      displayName: "로컬 데모 여행자",
      provider: "demo",
    });
    setAuthError(null);
  }, [setAuthError, setSession]);

  const startOAuth = useCallback(async (
    provider: Exclude<AuthProvider, "demo">,
    returnTo: string,
  ): Promise<AuthStartResult> => {
    setAuthPending(true);
    setAuthError(null);
    if (supabase === null) {
      startDemoSession();
      setAuthPending(false);
      return { kind: "signed-in" };
    }
    if (provider === "kakao") {
      window.sessionStorage.setItem("kakao-oauth-return-to", returnTo);
      window.location.assign(new URL("/auth/kakao/start", window.location.origin).toString());
      return { kind: "redirecting" };
    }
    const result = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?returnTo=${encodeURIComponent(returnTo)}`,
      },
    });
    setAuthPending(false);
    if (result.error !== null) {
      const name = provider === "google" ? "Google" : "Kakao";
      const message = `${name} 로그인에 실패했습니다. 다른 로그인 방법을 선택해 주세요.`;
      setAuthError(message);
      return { kind: "error", message };
    }
    return { kind: "redirecting" };
  }, [setAuthError, setAuthPending, startDemoSession, supabase]);

  const completeOAuthCallback = useCallback(async (code: string | null, state: string | null): Promise<AuthStartResult> => {
    if (supabase === null) {
      startDemoSession();
      return { kind: "signed-in" };
    }
    if (state?.startsWith("kakao.")) {
      if (code === null || code.length === 0) {
        const message = "Kakao 로그인 확인에 실패했습니다. 다시 시도해 주세요.";
        setAuthError(message);
        return { kind: "error", message };
      }
      const exchangeResponse = await fetch("/api/auth/kakao/exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, state }),
      });
      const exchangePayload: unknown = await exchangeResponse.json().catch(() => null);
      const idToken = exchangePayload !== null && typeof exchangePayload === "object" && "idToken" in exchangePayload
        ? exchangePayload.idToken
        : null;
      if (!exchangeResponse.ok || typeof idToken !== "string") {
        const message = "Kakao 로그인 확인에 실패했습니다. 편집 중인 일정은 그대로 보존됩니다.";
        setAuthError(message);
        return { kind: "error", message };
      }
      const result = await supabase.auth.signInWithIdToken({ provider: "kakao", token: idToken });
      if (result.error !== null || result.data.session === null) {
        const message = "Kakao 로그인 세션을 만들지 못했습니다. 다시 시도해 주세요.";
        setAuthError(message);
        return { kind: "error", message };
      }
      setSession(sessionFromSupabase(result.data.session));
      return { kind: "signed-in" };
    }
    if (code !== null && code.length > 0) {
      const result = await supabase.auth.exchangeCodeForSession(code);
      if (result.error !== null || result.data.session === null) {
        const message = "로그인 확인에 실패했습니다. 편집 중인 일정은 그대로 보존되어 다시 시도할 수 있습니다.";
        setAuthError(message);
        return { kind: "error", message };
      }
      setSession(sessionFromSupabase(result.data.session));
    }
    return { kind: "signed-in" };
  }, [setAuthError, setSession, startDemoSession, supabase]);

  const logout = useCallback(async () => {
    if (supabase !== null) {
      await supabase.auth.signOut();
    }
    setSession(null);
    setWorkingPlans([]);
    setDraftPlans([]);
    setPendingSave(null);
    setItineraries([]);
    clearAccountState();
    setAuthError(null);
  }, [clearAccountState, setAuthError, setDraftPlans, setItineraries, setPendingSave, setSession, setWorkingPlans, supabase]);

  const deleteAccount = useCallback(async (): Promise<{ readonly ok: boolean; readonly message?: string }> => {
    if (supabase !== null && session !== null) {
      const result = await supabase.rpc("delete_account");
      if (result.error !== null) {
        return { ok: false, message: "계정 삭제 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요." };
      }
      await supabase.auth.signOut();
    }
    setSession(null);
    setWorkingPlans([]);
    setDraftPlans([]);
    setPendingSave(null);
    setItineraries([]);
    clearAccountState();
    return { ok: true };
  }, [clearAccountState, session, setDraftPlans, setItineraries, setPendingSave, setSession, setWorkingPlans, supabase]);

  return { startDemoSession, startOAuth, completeOAuthCallback, logout, deleteAccount };
}
