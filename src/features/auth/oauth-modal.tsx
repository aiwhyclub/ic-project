"use client";

import { useEffect, useRef, type ReactNode } from "react";

type OAuthModalProps = Readonly<{
  children: ReactNode;
  onClose: () => void;
}>;

const FOCUSABLE_SELECTOR = "button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex='-1'])";

export function OAuthModal({ children, onClose }: OAuthModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    const focusable = dialog?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? [];
    const first = focusable[0] ?? dialog;
    const last = focusable[focusable.length - 1] ?? dialog;
    const frame = window.requestAnimationFrame(() => first?.focus());

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || dialog === null) {
        return;
      }
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [onClose]);

  return (
    <div className="oauth-overlay">
      <div className="oauth-modal" role="dialog" aria-modal="true" aria-label="동선 저장을 위한 로그인" ref={dialogRef} tabIndex={-1}>
        {children}
      </div>
    </div>
  );
}
