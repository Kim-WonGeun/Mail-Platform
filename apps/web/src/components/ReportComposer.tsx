"use client";

import { useEffect, useState } from "react";
import { fetchTemplates, type ReportTemplate } from "../lib/templateApi";
import ReportSummary from "./ReportSummary";
import ReportTitleEditor from "./ReportTitleEditor";
import TemplateList from "./TemplateList";

// 요청 진행 상태를 하나의 값으로 관리해 화면에 보여줄 내용을 정합니다.
type LoadStatus = "loading" | "success" | "error";

export default function ReportComposer() {
  // 확정한 제목은 부모가, 작성 중인 제목은 입력 컴포넌트가 관리합니다.
  const [appliedTitle, setAppliedTitle] = useState("");
  // 양식 선택 상태를 공통 부모로 옮겨 한곳에서 관리합니다.
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  // API에서 받은 양식 목록과 요청 상태입니다. 처음에는 빈 목록과 로딩 상태로 시작합니다.
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loadStatus, setLoadStatus] = useState<LoadStatus>("loading");

  // useEffect는 화면이 그려진 뒤 실행됩니다. 빈 배열([])이면 처음 한 번만 실행합니다.
  useEffect(() => {
    const controller = new AbortController();

    fetchTemplates(controller.signal)
      .then((data) => {
        setTemplates(data);
        setLoadStatus("success");
      })
      .catch((error) => {
        // 정리 함수가 요청을 취소한 경우는 오류로 보지 않습니다.
        if (controller.signal.aborted) return;
        console.error(error);
        setLoadStatus("error");
      });

    // 정리(cleanup) 함수: 컴포넌트가 사라지면 진행 중인 요청을 취소합니다.
    // 개발 모드의 Strict Mode는 effect를 두 번 실행하므로, 첫 요청은 여기서 취소됩니다.
    return () => controller.abort();
  }, []);

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
      {/* 요청 상태에 따라 안내 문구 또는 양식 목록을 보여줍니다. */}
      {loadStatus === "loading" && <p role="status">양식을 불러오는 중입니다.</p>}
      {loadStatus === "error" && (
        <p role="alert">양식을 불러오지 못했습니다. API 서버를 확인해 주세요.</p>
      )}
      {loadStatus === "success" && (
        // 목록 데이터도 props로 전달해 TemplateList는 받은 값만 그리게 합니다.
        <TemplateList
          templates={templates}
          selectedTemplateId={selectedTemplateId}
          onSelectTemplate={setSelectedTemplateId}
        />
      )}
      {/* 확정 제목과 양식 이름을 전달하고, 선택 전에는 빈 문자열을 사용합니다. */}
      <ReportSummary
        title={appliedTitle}
        templateTitle={selectedTemplate?.name ?? ""}
      />
    </>
  );
}
