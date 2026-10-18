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
