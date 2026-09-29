"use client";

// 부모가 선택 상태를 소유하고, 자식은 변경할 ID를 함수로 전달합니다.
type TemplateListProps = {
  selectedTemplateId: string;
  onSelectTemplate: (templateId: string) => void;
};

// 양식 하나가 가진 데이터의 모양을 정의합니다.
type ReportTemplate = {
  id: string;
  title: string;
  description: string;
};

// 객체 하나가 양식 하나이며, 배열에 여러 양식을 모아 둡니다.
const templates: ReportTemplate[] = [
  {
    id: "weekly-summary",
    title: "주간 요약",
    description: "한 주 동안의 주요 메일 정리",
  },
  {
    id: "customer-inquiries",
    title: "고객 문의 분석",
    description: "고객 문의 유형과 주요 요청 정리",
  },
  {
    id: "work-progress",
    title: "업무 진행 현황",
    description: "메일에서 진행 상황과 후속 작업 정리",
  },
];

export default function TemplateList({
  selectedTemplateId,
  onSelectTemplate,
}: TemplateListProps) {
  // 제목은 별도 state에 저장하지 않고, ID에 맞는 객체에서 읽습니다.
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
                aria-describedby={`${template.id}-description`}
              />
              {template.title}
            </label>
            <p id={`${template.id}-description`}>{template.description}</p>
          </li>
        ))}
        </ul>
      </fieldset>
      {/* find 결과가 없을 수 있으므로 표시 전에 확인합니다. */}
      <p role="status">
        {selectedTemplate
          ? `선택한 양식: ${selectedTemplate.title}`
          : "양식을 선택해 주세요."}
      </p>
    </section>
  );
}
