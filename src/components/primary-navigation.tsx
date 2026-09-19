"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAVIGATION_ITEMS = [
  { href: "/", label: "홈" },
  { href: "/courses", label: "코스" },
  { href: "/map", label: "지도" },
  { href: "/plan", label: "계획" },
  { href: "/places", label: "장소" },
  { href: "/mypage", label: "마이페이지" },
] as const;

type PrimaryNavigationProps = Readonly<{
  variant: "desktop" | "mobile";
}>;

export function PrimaryNavigation({ variant }: PrimaryNavigationProps) {
  const pathname = usePathname();

  return (
    <nav className={`primary-navigation primary-navigation--${variant}`} aria-label="주요 메뉴">
      {NAVIGATION_ITEMS.map((item) => {
        const isCurrent = pathname === item.href;

        return (
          <Link
            className="navigation-link"
            href={item.href}
            aria-current={isCurrent ? "page" : undefined}
            key={item.href}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
