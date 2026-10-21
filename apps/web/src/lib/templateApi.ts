// API 응답(docs/api.md의 GET /api/v1/templates)과 같은 모양으로 타입을 정의합니다.
export type ReportTemplate = {
  id: string;
  name: string;
  description: string | null;
};

// 아래 타입은 packages/report-schema/template.schema.json의 모양을 TypeScript로 옮긴 것입니다.
// 화면에서 읽기만 하므로 options는 타입별로 나누지 않고 선택 항목(?)으로 모아 둡니다.
export type FieldType =
  | "TEXT"
  | "RICH_TEXT"
  | "NUMBER"
  | "DATE"
  | "SELECT"
  | "MULTI_SELECT"
  | "LIST"
  | "TABLE"
  | "STATIC";

export type VariableType = "TEXT" | "NUMBER" | "DATE" | "DATE_RANGE" | "SELECT";

export type FieldOptions = {
  maxLength?: number;
  unit?: string;
  min?: number;
  max?: number;
  choices?: string[];
  minItems?: number;
  maxItems?: number;
  columns?: TemplateColumn[];
  maxRows?: number;
};

export type TemplateColumn = {
  key: string;
  label: string;
  type: FieldType;
  instructions?: string;
  options?: FieldOptions;
};

export type TemplateField = {
  key: string;
  label: string;
  type: FieldType;
  // STATIC 필드에는 required가 없습니다.
  required?: boolean;
  instructions?: string;
  options?: FieldOptions;
  // STATIC 필드의 고정 문구입니다.
  content?: string;
};

export type TemplateSection = {
  key: string;
  title: string;
  instructions?: string;
  fields: TemplateField[];
};

export type TemplateVariable = {
  key: string;
  label: string;
  type: VariableType;
  required: boolean;
  options?: FieldOptions;
};

export type TemplateSchema = {
  schemaVersion: number;
  titleFormat: string;
  instructions?: string;
  variables?: TemplateVariable[];
  sections: TemplateSection[];
};

// 상세 API(GET /api/v1/templates/{id}) 응답입니다. 목록 항목에 버전과 스키마가 더해집니다.
// & 는 두 타입의 속성을 합친 타입(교차 타입)을 만듭니다.
export type ReportTemplateDetail = ReportTemplate & {
  version: number | null;
  schema: TemplateSchema | null;
};

// 양식 목록을 API에서 가져옵니다.
// signal을 받으면 컴포넌트가 사라질 때 진행 중인 요청을 취소할 수 있습니다.
export async function fetchTemplates(
  signal?: AbortSignal,
): Promise<ReportTemplate[]> {
  // 같은 출처의 /api로 요청하고, 개발 중에는 next.config.ts가 API 서버로 전달합니다.
  const response = await fetch("/api/v1/templates", { signal });

  // fetch는 4xx, 5xx 응답에서도 예외를 던지지 않으므로 직접 확인합니다.
  if (!response.ok) {
    throw new Error(`양식 목록 요청 실패: ${response.status}`);
  }

  return response.json();
}

// 양식 하나를 가져옵니다. 404는 "없는 양식"이라는 정상적인 결과이므로 null로 돌려줍니다.
export async function fetchTemplate(
  id: string,
  signal?: AbortSignal,
): Promise<ReportTemplateDetail | null> {
  // id에 /나 ? 같은 문자가 있어도 경로가 깨지지 않도록 인코딩합니다.
  const response = await fetch(`/api/v1/templates/${encodeURIComponent(id)}`, {
    signal,
  });

  // 형식이 잘못된 id(400)도 화면에서는 찾을 수 없는 양식으로 다룹니다.
  if (response.status === 404 || response.status === 400) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`양식 요청 실패: ${response.status}`);
  }

  return response.json();
}
