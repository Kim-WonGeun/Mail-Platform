"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import PageHeader from "./PageHeader";

// 확정한 값과 변경 요청에 사용할 함수를 부모에게 받습니다.
type ReportTitleEditorProps = {
  appliedTitle: string;
  onApplyTitle: (title: string) => void;
};

export default function ReportTitleEditor({
  appliedTitle,
  onApplyTitle,
}: ReportTitleEditorProps) {
  // 입력 중인 값과 오류는 이 컴포넌트에서만 필요하므로 그대로 관리합니다.
  const [draftTitle, setDraftTitle] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // 브라우저의 기본 폼 제출 대신 React 상태를 변경합니다.
    event.preventDefault();
    const trimmedTitle = draftTitle.trim();

    // 앞뒤 공백을 제거한 결과가 비어 있으면 기존 제목을 유지합니다.
    if (trimmedTitle === "") {
      setError("보고서 제목을 입력해 주세요.");
      return;
    }

    // 유효한 제목만 부모에게 전달해 확정 상태를 변경하도록 요청합니다.
    onApplyTitle(trimmedTitle);
    setError("");
  }

  return (
    <>
      {/* 제출 버튼과 Enter 모두 같은 onSubmit 함수를 실행합니다. */}
      <form onSubmit={handleSubmit}>
        <label htmlFor="report-title">보고서 제목</label>
        <input
          id="report-title"
          type="text"
          value={draftTitle}
          onChange={(event) => {
            setDraftTitle(event.target.value);
            setError("");
          }}
          aria-invalid={error !== ""}
          aria-describedby={error ? "report-title-error" : undefined}
        />
        <button type="submit">제목 적용</button>
        {/* 검증에 실패했을 때만 오류를 표시하고 입력창과 연결합니다. */}
        {error && <p id="report-title-error" role="alert">{error}</p>}
      </form>

      {/* 작성 중인 값이 아니라 제출로 확정한 값만 자식에게 전달합니다. */}
      <PageHeader
        title={appliedTitle || "제목을 입력하세요"}
        description="메일을 분석해 보고서를 만드는 공간입니다."
      />
    </>
  );
}
