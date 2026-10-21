"use client";

import type { ReportTemplate } from "../lib/templateApi";
import SectionHeading from "./SectionHeading";
import styles from "./TemplateList.module.css";

// 요청 진행 상태를 하나의 값으로 관리해 화면에 보여줄 내용을 정합니다.
export type LoadStatus = "loading" | "success" | "error";

// 부모가 목록과 선택 상태를 소유하고, 자식은 받은 값을 그리고 변경할 ID를 함수로 전달합니다.
type TemplateListProps = {
  templates: ReportTemplate[];
  loadStatus: LoadStatus;
  selectedTemplateId: string;
  onSelectTemplate: (templateId: string) => void;
};

export default function TemplateList({
  templates,
  loadStatus,
  selectedTemplateId,
  onSelectTemplate,
}: TemplateListProps) {
  return (
    <section aria-labelledby="template-list-heading" className={styles.section}>
      <SectionHeading id="template-list-heading" number="02" heading="양식" />
      <p className={styles.helper}>정리하려는 내용에 맞는 양식을 선택하세요.</p>

      {/* 요청 상태에 따라 안내 문구 또는 양식 목록을 보여줍니다. */}
      {loadStatus === "loading" && (
        <p role="status" className={styles.helper}>
          양식을 불러오는 중입니다.
        </p>
      )}
      {loadStatus === "error" && (
        <p role="alert" className={styles.error}>
          양식을 불러오지 못했습니다. API 서버를 확인해 주세요.
        </p>
      )}
      {loadStatus === "success" && (
        // 각 행은 겉모습만 바꾼 라디오 그룹입니다. 방향키로 선택을 옮길 수 있습니다.
        <fieldset className={styles.choices}>
          <legend className="visually-hidden">사용할 양식</legend>
          {/* map으로 각 객체를 JSX로 변환하고, 고유한 id를 key로 사용합니다. */}
          {templates.map((template) => {
            const isSelected = selectedTemplateId === template.id;
            return (
              // label이 행 전체를 감싸므로 행 어디를 눌러도 라디오가 선택됩니다.
              <label key={template.id} className={styles.card}>
                <input
                  type="radio"
                  name="report-template"
                  className="visually-hidden"
                  value={template.id}
                  checked={isSelected}
                  onChange={(event) => onSelectTemplate(event.target.value)}
                />
                {/* 이름과 설명을 왼쪽에, 선택 표시를 오른쪽에 둡니다. */}
                <span className={styles.cardText}>
                  <span className={styles.cardTitle}>{template.name}</span>
                  {/* API에서 설명은 null일 수 있으므로 값이 있을 때만 표시합니다. */}
                  {template.description && (
                    <span className={styles.cardDescription}>{template.description}</span>
                  )}
                </span>
                {/* 선택 표시는 CSS가 라디오의 checked 상태를 읽어 그리므로 장식용 span만 둡니다. */}
                <span className={styles.indicator} aria-hidden="true" />
              </label>
            );
          })}
        </fieldset>
      )}
    </section>
  );
}
