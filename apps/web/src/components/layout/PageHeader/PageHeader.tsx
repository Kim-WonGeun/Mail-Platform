import styles from "./PageHeader.module.css";

// 디자인에서 PageHeader는 고정 안내 문구를 보여주므로 상태 없이 props만 그립니다.
// "use client"가 없으면 서버 컴포넌트로, 브라우저에 JavaScript를 보내지 않습니다.
type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export default function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <header className={styles.header}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.description}>{description}</p>
    </header>
  );
}
