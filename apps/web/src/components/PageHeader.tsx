// 상태와 클릭 이벤트를 사용하기 위한 클라이언트 컴포넌트 경계입니다.
"use client";

import { useState } from "react";

// 부모가 전달할 props의 타입을 정의합니다. 실제 값은 ReportTitleEditor에서 전달합니다.
type PageHeaderProps = {
  title: string;
  description: string;
};

export default function PageHeader({ title, description }: PageHeaderProps) {
  // 현재 상태와 변경 함수를 꺼냅니다. 처음에는 설명을 숨깁니다.
  const [isDescriptionVisible, setIsDescriptionVisible] = useState(false);

  function toggleDescription() {
    // 이전 상태를 반전하면 React가 새 상태로 화면을 다시 렌더링합니다.
    setIsDescriptionVisible((previous) => !previous);
  }

  return (
    <header>
      <h1>{title}</h1>
      {/* 함수를 호출하지 않고 전달해서 클릭할 때 실행되도록 합니다. */}
      <button
        type="button"
        onClick={toggleDescription}
        aria-expanded={isDescriptionVisible}
      >
        {/* 삼항 연산자로 현재 상태에 맞는 문구를 선택합니다. */}
        {isDescriptionVisible ? "설명 숨기기" : "설명 보기"}
      </button>
      {/* 상태가 true일 때만 설명 요소를 렌더링합니다. */}
      {isDescriptionVisible && <p>{description}</p>}
    </header>
  );
}
