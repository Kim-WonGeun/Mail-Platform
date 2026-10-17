"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchTemplate, type ReportTemplate } from "../lib/templateApi";

type TemplateDetailProps = {
  templateId: string;
};

// 목록 화면과 달리 "찾을 수 없음"(not-found) 상태가 하나 더 있습니다.
type LoadStatus = "loading" | "success" | "not-found" | "error";

export default function TemplateDetail({ templateId }: TemplateDetailProps) {
  const [template, setTemplate] = useState<ReportTemplate | null>(null);
  const [loadStatus, setLoadStatus] = useState<LoadStatus>("loading");

  // 의존성 배열에 templateId를 넣으면, 다른 양식 주소로 바뀔 때 다시 요청합니다.
  useEffect(() => {
    const controller = new AbortController();
    setLoadStatus("loading");

    fetchTemplate(templateId, controller.signal)
      .then((data) => {
        setTemplate(data);
        setLoadStatus(data ? "success" : "not-found");
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        console.error(error);
        setLoadStatus("error");
      });

    return () => controller.abort();
  }, [templateId]);

  return (
    <section aria-labelledby="template-detail-heading">
      {/* Link는 페이지 전체를 다시 불러오지 않고 클라이언트에서 화면만 바꿉니다. */}
      <Link href="/">← 양식 목록으로</Link>
      <h2 id="template-detail-heading">양식 상세</h2>

      {loadStatus === "loading" && <p role="status">양식을 불러오는 중입니다.</p>}
      {loadStatus === "not-found" && (
        <p role="alert">양식을 찾을 수 없습니다.</p>
      )}
      {loadStatus === "error" && (
        <p role="alert">양식을 불러오지 못했습니다. API 서버를 확인해 주세요.</p>
      )}
      {loadStatus === "success" && template && (
        <dl>
          <dt>이름</dt>
          <dd>{template.name}</dd>
          <dt>설명</dt>
          <dd>{template.description ?? "설명이 없습니다"}</dd>
        </dl>
      )}
    </section>
  );
}
