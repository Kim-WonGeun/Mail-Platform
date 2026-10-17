"use client";

import { useState } from "react";
import { templates } from "../data/reportTemplates";
import ReportSummary from "./ReportSummary";
import ReportTitleEditor from "./ReportTitleEditor";
import TemplateList from "./TemplateList";

export default function ReportComposer() {
  // 확정한 제목은 부모가, 작성 중인 제목은 입력 컴포넌트가 관리합니다.
  const [appliedTitle, setAppliedTitle] = useState("");
  // 양식 선택 상태를 공통 부모로 옮겨 한곳에서 관리합니다.
  const [selectedTemplateId, setSelectedTemplateId] = useState("");

  // 선택한 양식은 기존 ID로 계산하므로 별도 상태로 저장하지 않습니다.
  const selectedTemplate = templates.find(
    (template) => template.id === selectedTemplateId,
  );

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
      {/* 확정 제목과 양식 이름을 전달하고, 선택 전에는 빈 문자열을 사용합니다. */}
      <ReportSummary
        title={appliedTitle}
        templateTitle={selectedTemplate?.title ?? ""}
      />
    </>
  );
}
