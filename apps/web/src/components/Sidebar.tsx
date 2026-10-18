import Link from "next/link";
import styles from "./Sidebar.module.css";

// 메뉴 데이터를 배열로 두고 map으로 그립니다. href가 없으면 아직 만들지 않은 화면입니다.
const navigationItems: { label: string; href?: string }[] = [
  { label: "보고서 작성", href: "/" },
  { label: "보고서 양식" },
  { label: "내 보고서" },
];

// 지금은 페이지가 하나뿐이므로 현재 경로를 고정합니다.
// 페이지가 늘어나면 usePathname으로 실제 경로를 읽도록 바꿉니다.
const currentPath = "/";

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <p className={styles.brandName}>mailnote</p>
        <p className={styles.caption}>메일을 보고서로</p>
      </div>

      <nav aria-labelledby="workspace-nav-heading" className={styles.navigation}>
        <p id="workspace-nav-heading" className={styles.eyebrow}>
          WORKSPACE
        </p>
        <ul className={styles.navList}>
          {navigationItems.map((item) => {
            const isActive = item.href === currentPath;
            return (
              <li key={item.label}>
                {item.href ? (
                  // 현재 페이지에만 Active 스타일과 aria-current="page"를 적용합니다.
                  <Link
                    href={item.href}
                    className={isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className={styles.navItem}>{item.label}</span>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={styles.profile}>
        <span className={styles.avatar} aria-hidden="true">
          W
        </span>
        <div>
          <p className={`${styles.caption} ${styles.workspace}`}>나의 워크스페이스</p>
          <p className={styles.eyebrow}>Personal workspace</p>
        </div>
      </div>
    </aside>
  );
}
