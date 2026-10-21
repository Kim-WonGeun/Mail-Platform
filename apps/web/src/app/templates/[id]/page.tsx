import TemplateDetail from "@/features/templates/components/TemplateDetail/TemplateDetail";

// [id] 폴더 이름이 URL의 값을 받는 자리입니다. /templates/abc면 id는 "abc"입니다.
// Next.js 15에서 params는 Promise이므로 await로 값을 꺼냅니다.
type TemplateDetailPageProps = {
  params: Promise<{ id: string }>;
};

// "use client"가 없으므로 서버 컴포넌트입니다. URL 값만 꺼내 클라이언트 컴포넌트에 넘깁니다.
export default async function TemplateDetailPage({
  params,
}: TemplateDetailPageProps) {
  const { id } = await params;

  return (
    <main>
      <TemplateDetail templateId={id} />
    </main>
  );
}
