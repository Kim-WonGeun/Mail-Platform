import type { ReportTemplate } from "../lib/templateApi";
import styles from "./ReportPreview.module.css";

// 미리보기는 부모가 가진 값을 받아 그리기만 하므로 state가 없습니다.
// 양식은 아직 선택하지 않았을 수 있어 undefined를 허용합니다.
type ReportPreviewProps = {
  title: string;
  template: ReportTemplate | undefined;
};

// 실제 분석 결과가 들어갈 자리를 회색 줄로 보여주는 샘플 섹션입니다.
// 각 숫자는 줄의 너비(%)입니다. 나중에 양식의 섹션 데이터로 바꿀 수 있습니다.
const placeholderSections = [
  { heading: "주요 내용", lines: [92, 74] },
  { heading: "확인이 필요한 항목", lines: [84, 58] },
  { heading: "후속 조치", lines: [66] },
];

export default function ReportPreview({ title, template }: ReportPreviewProps) {
  // 두 값이 모두 있을 때만 준비 완료로 보고, 이 값으로 상태 문구를 계산합니다.
  const isReady = title !== "" && template !== undefined;
  // toLocaleDateString으로 오늘 날짜를 한국어 형식(2026. 10. 17.)으로 만듭니다.
  const today = new Date().toLocaleDateString("ko-KR");

  return (
    <section aria-labelledby="report-preview-heading" className={styles.panel}>
      <div className={styles.toolbar}>
        <h2 id="report-preview-heading" className={styles.label}>
          미리보기
        </h2>
        {/* data-ready 속성 값에 따라 CSS가 점의 색을 바꿉니다. */}
        <p className={styles.status} data-ready={isReady}>
          {isReady ? "설정 완료" : "설정 중"}
        </p>
      </div>

      {/* article은 그 자체로 완결된 문서를 뜻하는 요소입니다. */}
      <article className={styles.paper}>
        {/* 값이 없으면 안내 문구를 보여주고, data-empty로 흐린 색을 적용합니다. */}
        <h3 className={styles.title} data-empty={title === ""}>
          {title || "보고서 제목을 적용해 주세요"}
        </h3>
        <p className={styles.meta}>
          {template ? template.name : "양식 미선택"} · {today}
        </p>
        {template?.description && (
          <p className={styles.description}>{template.description}</p>
        )}

        <ol className={styles.sections}>
          {placeholderSections.map((section) => (
            <li key={section.heading} className={styles.section}>
              <p className={styles.sectionHeading}>{section.heading}</p>
              {section.lines.map((width, index) => (
                // 같은 섹션 안에서는 순서가 바뀌지 않으므로 index를 key로 써도 됩니다.
                <span
                  key={index}
                  className={styles.line}
                  style={{ width: `${width}%` }}
                  aria-hidden="true"
                />
              ))}
            </li>
          ))}
        </ol>
      </article>
    </section>
  );
}
