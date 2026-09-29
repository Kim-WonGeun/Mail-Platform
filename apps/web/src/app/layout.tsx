import type { ReactNode } from "react";

// Next.js가 연결한 페이지 내용을 children으로 받습니다. ReactNode는 그 값의 타입입니다.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
