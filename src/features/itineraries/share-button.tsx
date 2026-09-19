"use client";

import { useState } from "react";
import type { Itinerary } from "@/features/app/app-state";
import { encodeSharedItinerary } from "./share-codec";

type ShareButtonProps = Readonly<{
  itinerary: Itinerary;
}>;

export function ShareButton({ itinerary }: ShareButtonProps) {
  const [status, setStatus] = useState("공유 링크 복사");
  const [shareHref, setShareHref] = useState<string | null>(null);

  async function copyShareLink(): Promise<void> {
    const encoded = encodeSharedItinerary(itinerary);
    const link = `${window.location.origin}/share/${encoded}`;
    setShareHref(link);
    try {
      await navigator.clipboard.writeText(link);
      setStatus("복사됐어요");
    } catch (error) {
      if (error instanceof DOMException) {
        window.prompt("아래 공유 링크를 복사해 주세요.", link);
        setStatus("링크 준비 완료");
        return;
      }
      throw error;
    }
  }

  return <span className="share-link-actions"><button className="navigation-link" type="button" onClick={() => void copyShareLink()}>{status}</button>{shareHref === null ? null : <a className="navigation-link" href={shareHref} target="_blank" rel="noreferrer">공개 링크 열기</a>}</span>;
}
