"use client";

import type { ReportTemplate } from "../lib/templateApi";

// 부모가 목록과 선택 상태를 소유하고, 자식은 받은 값을 그리고 변경할 ID를 함수로 전달합니다.
type TemplateListProps = {
  templates: ReportTemplate[];
  selectedTemplateId: string;
  onSelectTemplate: (templateId: string) => void;
};

export default function TemplateList({
  templates,
  selectedTemplateId,
  onSelectTemplate,
}: TemplateListProps) {
  // 이름은 별도 state에 저장하지 않고, ID에 맞는 객체에서 읽습니다.
  const selectedTemplate = templates.find(
    (template) => template.id === selectedTemplateId,
  );

  return (
    <section aria-labelledby="template-list-heading">
      <h2 id="template-list-heading">보고서 양식</h2>
      <fieldset>
        <legend>사용할 양식</legend>
        <ul>
        {/* map으로 각 객체를 JSX로 변환하고, 고유한 id를 key로 사용합니다. */}
        {templates.map((template) => (
          <li key={template.id}>
            <label>
              {/* 같은 name으로 묶고, 현재 선택한 ID와 같을 때만 체크합니다. */}
              <input
                type="radio"
                name="report-template"
                value={template.id}
                checked={selectedTemplateId === template.id}
                onChange={(event) => onSelectTemplate(event.target.value)}
                aria-describedby={
                  template.description ? `${template.id}-description` : undefined
                }
              />
              {template.name}
            </label>
            {/* API에서 설명은 null일 수 있으므로 값이 있을 때만 표시합니다. */}
            {template.description && (
              <p id={`${template.id}-description`}>{template.description}</p>
            )}
          </li>
        ))}
        </ul>
      </fieldset>
      {/* find 결과가 없을 수 있으므로 표시 전에 확인합니다. */}
      <p role="status">
        {selectedTemplate
          ? `선택한 양식: ${selectedTemplate.name}`
          : "양식을 선택해 주세요."}
      </p>
    </section>
  );
}
