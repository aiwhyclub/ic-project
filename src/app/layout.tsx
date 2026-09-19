import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { PrimaryNavigation } from "@/components/primary-navigation";
import { AppProvider } from "@/features/app/app-state";
import "./globals.css";

export const metadata: Metadata = {
  title: "이천 세이브포인트",
  description: "좋은 길이, 더 특별한 하루를 만드는 이천 여행 동선 서비스",
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ko">
      <body>
        <AppProvider>
          <a className="skip-link" href="#main-content">
            본문으로 바로가기
          </a>
          <div className="app-shell">
            <header className="site-header">
              <Link className="brand-link" href="/" aria-label="이천 세이브포인트 홈">
                <span className="brand-name">이천 세이브포인트</span>
                <span className="brand-tagline">좋은 길이, 더 특별한 하루를 만든다.</span>
              </Link>
              <PrimaryNavigation variant="desktop" />
              <p className="map-source">Kakao Map 기반으로 만나는 이천의 여행</p>
            </header>
            {children}
            <PrimaryNavigation variant="mobile" />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
