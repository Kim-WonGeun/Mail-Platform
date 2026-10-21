import styles from "./TopBar.module.css";

// 경로는 배열로 받아 화면마다 다른 단계를 보여줄 수 있게 합니다.
type TopBarProps = {
  breadcrumb: string[];
  context: string;
};

export default function TopBar({ breadcrumb, context }: TopBarProps) {
  return (
    <header className={styles.topBar}>
      <p className={styles.breadcrumb}>{breadcrumb.join("   /   ")}</p>
      <p className={styles.context}>{context}</p>
    </header>
  );
}
