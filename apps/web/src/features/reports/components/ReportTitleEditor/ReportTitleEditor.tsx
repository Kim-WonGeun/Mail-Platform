"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Button from "@/components/ui/Button/Button";
import SectionHeading from "@/components/ui/SectionHeading/SectionHeading";
import styles from "./ReportTitleEditor.module.css";

// 확정한 값과 변경 요청에 사용할 함수를 부모에게 받습니다.
type ReportTitleEditorProps = {
  onApplyTitle: (title: string) => void;
};

export default function ReportTitleEditor({ onApplyTitle }: ReportTitleEditorProps) {
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
    <section aria-labelledby="report-title-heading" className={styles.section}>
      <SectionHeading id="report-title-heading" number="01" heading="제목" />
      <p id="report-title-helper" className={styles.helper}>
        나중에 쉽게 찾을 수 있는 이름을 지어주세요.
      </p>

      {/* 제출 버튼과 Enter 모두 같은 onSubmit 함수를 실행합니다. */}
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* 디자인에는 보이는 label이 없으므로 스크린 리더용 label만 둡니다. */}
        <label htmlFor="report-title" className="visually-hidden">
          보고서 제목
        </label>
        <input
          id="report-title"
          type="text"
          className={styles.input}
          placeholder="보고서 제목을 입력하세요"
          value={draftTitle}
          onChange={(event) => {
            setDraftTitle(event.target.value);
            setError("");
          }}
          aria-invalid={error !== ""}
          aria-describedby={error ? "report-title-helper report-title-error" : "report-title-helper"}
        />
        <Button type="submit" className={styles.submit}>
          제목 적용
        </Button>
      </form>
      {/* 검증에 실패했을 때만 오류를 표시하고 입력창과 연결합니다. */}
      {error && (
        <p id="report-title-error" role="alert" className={styles.error}>
          {error}
        </p>
      )}
    </section>
  );
}
