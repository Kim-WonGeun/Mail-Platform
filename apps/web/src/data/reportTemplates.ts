// 양식 하나가 가진 데이터의 모양을 정의합니다.
type ReportTemplate = {
  id: string;
  title: string;
  description: string;
};

// 여러 컴포넌트가 같은 양식 목록을 사용할 수 있도록 내보냅니다.
export const templates: ReportTemplate[] = [
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
