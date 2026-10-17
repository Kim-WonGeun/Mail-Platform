// API 응답(docs/api.md의 GET /api/v1/templates)과 같은 모양으로 타입을 정의합니다.
export type ReportTemplate = {
  id: string;
  name: string;
  description: string | null;
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
