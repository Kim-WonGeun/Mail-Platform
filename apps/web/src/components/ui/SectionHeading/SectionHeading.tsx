import styles from "./SectionHeading.module.css";

// id를 받아 h2에 붙이면 상위 section이 aria-labelledby로 제목을 연결할 수 있습니다.
type SectionHeadingProps = {
  id: string;
  number: string;
  heading: string;
};

export default function SectionHeading({ id, number, heading }: SectionHeadingProps) {
  return (
    <div className={styles.sectionHeading}>
      {/* 번호는 장식이므로 스크린 리더가 제목만 읽도록 숨깁니다. */}
      <span className={styles.number} aria-hidden="true">
        {number}
      </span>
      <h2 id={id} className={styles.heading}>
        {heading}
      </h2>
    </div>
  );
}
