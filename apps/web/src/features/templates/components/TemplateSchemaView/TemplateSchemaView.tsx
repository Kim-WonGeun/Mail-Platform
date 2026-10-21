import type {
  FieldOptions,
  FieldType,
  TemplateField,
  TemplateSchema,
} from "@/features/templates/types";
import styles from "./TemplateSchemaView.module.css";

// 화면에 보여줄 타입 이름입니다. Record<FieldType, string>이므로 타입을 하나라도 빠뜨리면 컴파일 오류가 납니다.
const fieldTypeLabels: Record<FieldType, string> = {
  TEXT: "짧은 글",
  RICH_TEXT: "긴 글",
  NUMBER: "숫자",
  DATE: "날짜",
  SELECT: "단일 선택",
  MULTI_SELECT: "다중 선택",
  LIST: "목록",
  TABLE: "표",
  STATIC: "고정 문구",
};

const variableTypeLabels: Record<string, string> = {
  TEXT: "글",
  NUMBER: "숫자",
  DATE: "날짜",
  DATE_RANGE: "기간",
  SELECT: "선택",
};

// 타입별 옵션을 "최대 120자 · 단위 %"처럼 한 줄로 요약합니다. 선택지와 표의 열은 따로 보여줍니다.
function summarizeOptions(options: FieldOptions | undefined): string | null {
  if (!options) return null;

  const parts: string[] = [];
  if (options.maxLength !== undefined) parts.push(`최대 ${options.maxLength}자`);
  if (options.unit) parts.push(`단위 ${options.unit}`);
  if (options.min !== undefined) parts.push(`최소 ${options.min}`);
  if (options.max !== undefined) parts.push(`최대 ${options.max}`);
  if (options.minItems !== undefined) parts.push(`최소 ${options.minItems}개`);
  if (options.maxItems !== undefined) parts.push(`최대 ${options.maxItems}개`);
  if (options.maxRows !== undefined) parts.push(`최대 ${options.maxRows}행`);

  return parts.length > 0 ? parts.join(" · ") : null;
}

function Choices({ choices }: { choices: string[] }) {
  return (
    <ul className={styles.choices} aria-label="선택지">
      {choices.map((choice) => (
        <li key={choice} className={styles.choice}>
          {choice}
        </li>
      ))}
    </ul>
  );
}

// 필드 하나를 보여줍니다. STATIC은 AI가 쓰지 않는 고정 문구라서 내용을 그대로 보여줍니다.
function FieldItem({ field }: { field: TemplateField }) {
  const optionSummary = summarizeOptions(field.options);

  return (
    <li className={styles.field}>
      <div className={styles.fieldHeader}>
        <span className={styles.fieldLabel}>{field.label}</span>
        <span className={styles.badge}>{fieldTypeLabels[field.type]}</span>
        {field.required && <span className={styles.required}>필수</span>}
      </div>

      {field.type === "STATIC" && field.content && (
        <blockquote className={styles.staticContent}>{field.content}</blockquote>
      )}
      {field.instructions && (
        <p className={styles.instructions}>작성 지침: {field.instructions}</p>
      )}
      {optionSummary && <p className={styles.meta}>{optionSummary}</p>}
      {field.options?.choices && <Choices choices={field.options.choices} />}

      {/* 표 필드는 열 구성을 작은 표로 보여줍니다. */}
      {field.options?.columns && (
        <table className={styles.columns}>
          <thead>
            <tr>
              <th scope="col">열</th>
              <th scope="col">타입</th>
              <th scope="col">설정</th>
            </tr>
          </thead>
          <tbody>
            {field.options.columns.map((column) => (
              <tr key={column.key}>
                <td>{column.label}</td>
                <td>{fieldTypeLabels[column.type]}</td>
                <td>
                  {[
                    summarizeOptions(column.options),
                    column.options?.choices?.join(", "),
                    column.instructions,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </li>
  );
}

type TemplateSchemaViewProps = {
  schema: TemplateSchema;
};

// 양식 스키마를 읽기 전용으로 보여줍니다. 편집은 다음 단위(양식 빌더)에서 다룹니다.
export default function TemplateSchemaView({ schema }: TemplateSchemaViewProps) {
  return (
    <div className={styles.schema}>
      <dl className={styles.overview}>
        <dt>보고서 제목 형식</dt>
        <dd>
          <code>{schema.titleFormat}</code>
        </dd>
        {schema.instructions && (
          <>
            <dt>전체 작성 지침</dt>
            <dd>{schema.instructions}</dd>
          </>
        )}
        {schema.variables && schema.variables.length > 0 && (
          <>
            <dt>생성 시 입력값</dt>
            <dd>
              <ul className={styles.variables}>
                {schema.variables.map((variable) => (
                  <li key={variable.key}>
                    {variable.label}
                    <span className={styles.meta}>
                      {" "}
                      ({variableTypeLabels[variable.type]}
                      {variable.required ? ", 필수" : ""})
                    </span>
                  </li>
                ))}
              </ul>
            </dd>
          </>
        )}
      </dl>

      {/* 섹션 순서가 곧 보고서의 순서입니다. ol로 순서를 드러냅니다. */}
      <ol className={styles.sections}>
        {schema.sections.map((section) => (
          <li key={section.key} className={styles.section}>
            <h3 className={styles.sectionTitle}>{section.title}</h3>
            {section.instructions && (
              <p className={styles.instructions}>작성 지침: {section.instructions}</p>
            )}
            <ul className={styles.fields}>
              {section.fields.map((field) => (
                <FieldItem key={field.key} field={field} />
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}
