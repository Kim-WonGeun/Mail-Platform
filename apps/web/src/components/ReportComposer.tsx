"use client";

import { useState } from "react";
import ReportTitleEditor from "./ReportTitleEditor";
import TemplateList from "./TemplateList";

export default function ReportComposer() {
  // 양식 선택 상태를 공통 부모로 옮겨 한곳에서 관리합니다.
  const [selectedTemplateId, setSelectedTemplateId] = useState("");

  return (
    <>
      <ReportTitleEditor />
      {/* 현재 값과 변경 함수를 함께 전달합니다. 여기서는 함수를 호출하지 않습니다. */}
      <TemplateList
        selectedTemplateId={selectedTemplateId}
        onSelectTemplate={setSelectedTemplateId}
      />
    </>
  );
}
