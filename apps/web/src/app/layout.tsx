import type { ReactNode } from "react";
import { Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
import Sidebar from "@/components/layout/Sidebar/Sidebar";
import TopBar from "@/components/layout/TopBar/TopBar";
import styles from "./layout.module.css";
// 전역 CSS는 루트 레이아웃에서 한 번만 불러오면 모든 페이지에 적용됩니다.
import "./globals.css";

// next/font는 빌드할 때 글꼴을 내려받아 같은 서버에서 제공합니다.
// variable로 지정한 CSS 변수 이름을 globals.css에서 사용합니다.
const notoSans = Noto_Sans_KR({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-sans",
});
const notoSerif = Noto_Serif_KR({
  weight: ["500"],
  subsets: ["latin"],
  variable: "--font-serif",
});

// Next.js가 연결한 페이지 내용을 children으로 받습니다. ReactNode는 그 값의 타입입니다.
// 레이아웃은 페이지가 바뀌어도 유지되므로 Sidebar와 TopBar 같은 공통 화면을 둡니다.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" className={`${notoSans.variable} ${notoSerif.variable}`}>
      <body>
        <div className={styles.shell}>
          <Sidebar />
          <div className={styles.main}>
            <TopBar breadcrumb={["워크스페이스", "새 보고서"]} context="초안" />
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
