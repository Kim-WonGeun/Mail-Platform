"use client";

import { useEffect, useState } from "react";
import { fetchTemplates } from "@/features/templates/api";
import type { ReportTemplate } from "@/features/templates/types";
import PageHeader from "@/components/layout/PageHeader/PageHeader";
import ReportPreview from "@/features/reports/components/ReportPreview/ReportPreview";
import ReportTitleEditor from "@/features/reports/components/ReportTitleEditor/ReportTitleEditor";
import TemplateList, { type LoadStatus } from "@/features/templates/components/TemplateList/TemplateList";
import styles from "./ReportComposer.module.css";

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
    // 왼쪽은 입력 영역, 오른쪽은 미리보기 영역입니다. 두 영역 모두 같은 부모 상태를 봅니다.
    <div className={styles.composer}>
      <div className={styles.form}>
        <PageHeader
          eyebrow="새 보고서"
          title="보고서 설정"
          description="제목과 양식을 정하면 오른쪽에서 보고서 모양을 바로 확인할 수 있어요."
        />
        {/* 검증된 제목을 부모에게 알릴 수 있도록 변경 함수를 전달합니다. */}
        <ReportTitleEditor onApplyTitle={setAppliedTitle} />
        {/* 목록 데이터와 요청 상태도 props로 전달해 TemplateList는 받은 값만 그리게 합니다. */}
        <TemplateList
          templates={templates}
          loadStatus={loadStatus}
          selectedTemplateId={selectedTemplateId}
          onSelectTemplate={setSelectedTemplateId}
        />
      </div>
      {/* 같은 상태를 미리보기에도 전달하므로, 왼쪽에서 바꾸면 오른쪽이 함께 다시 그려집니다. */}
      <ReportPreview title={appliedTitle} template={selectedTemplate} />
    </div>
  );
}
