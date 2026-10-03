"use client";

import { useState } from "react";
import ReportTitleEditor from "./ReportTitleEditor";
import TemplateList from "./TemplateList";

export default function ReportComposer() {
  // 확정한 제목은 부모가, 작성 중인 제목은 입력 컴포넌트가 관리합니다.
  const [appliedTitle, setAppliedTitle] = useState("");
  // 양식 선택 상태를 공통 부모로 옮겨 한곳에서 관리합니다.
  const [selectedTemplateId, setSelectedTemplateId] = useState("");

  return (
    <>
      {/* 검증된 제목을 부모에게 알릴 수 있도록 변경 함수를 전달합니다. */}
      <ReportTitleEditor
        appliedTitle={appliedTitle}
        onApplyTitle={setAppliedTitle}
      />
      {/* 현재 값과 변경 함수를 함께 전달합니다. 여기서는 함수를 호출하지 않습니다. */}
      <TemplateList
        selectedTemplateId={selectedTemplateId}
        onSelectTemplate={setSelectedTemplateId}
      />
    </>
  );
}
