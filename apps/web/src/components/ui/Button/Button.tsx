import type { ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";

// button 요소가 받는 모든 속성(type, onClick, disabled 등)에 appearance만 추가합니다.
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  appearance?: "primary" | "secondary";
};

export default function Button({
  appearance = "primary",
  className,
  ...buttonProps
}: ButtonProps) {
  // 나머지 props(...buttonProps)는 그대로 button에 전달합니다.
  // Hover/Pressed/Focus/Disabled 상태는 CSS의 :hover, :active 등이 처리합니다.
  return (
    <button
      className={[styles.button, styles[appearance], className].filter(Boolean).join(" ")}
      {...buttonProps}
    />
  );
}
