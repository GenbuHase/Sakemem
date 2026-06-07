import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link, { type LinkProps } from "next/link";
import {
  BUTTON_BASE_CLASS,
  BUTTON_SIZE_CLASS,
  BUTTON_VARIANT_CLASS,
  type ButtonSize,
  type ButtonVariant,
  cx,
} from "./styles";

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: ReactNode;
  className?: string;
};

type ButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps>;

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        BUTTON_BASE_CLASS,
        BUTTON_VARIANT_CLASS[variant],
        BUTTON_SIZE_CLASS[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

type LinkButtonProps = CommonProps & LinkProps;

export function LinkButton({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Link
      className={cx(
        BUTTON_BASE_CLASS,
        BUTTON_VARIANT_CLASS[variant],
        BUTTON_SIZE_CLASS[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
