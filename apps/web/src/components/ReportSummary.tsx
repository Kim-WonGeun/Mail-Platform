// 요약에 표시할 값은 부모에게 props로 받습니다.
type ReportSummaryProps = {
  title: string;
  templateTitle: string;
};

export default function ReportSummary({
  title,
  templateTitle,
}: ReportSummaryProps) {
  // 별도 상태 없이 전달받은 값을 표시하고, 빈 문자열이면 안내 문구를 사용합니다.
  return (
    <section aria-labelledby="report-summary-heading">
      <h2 id="report-summary-heading">보고서 설정 요약</h2>
      <dl>
        <dt>보고서 제목</dt>
        <dd>{title || "아직 적용하지 않았습니다"}</dd>
        <dt>선택한 양식</dt>
        <dd>{templateTitle || "아직 선택하지 않았습니다"}</dd>
      </dl>
    </section>
  );
}
