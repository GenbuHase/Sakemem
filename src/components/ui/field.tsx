import type { ReactNode } from "react";
import { FIELD_LABEL_CLASS } from "./styles";

type FieldProps = {
  htmlFor?: string;
  label: ReactNode;
  children: ReactNode;
  hint?: ReactNode;
};

export function Field({ htmlFor, label, children, hint }: FieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className={FIELD_LABEL_CLASS}>
        {label}
      </label>
      {children}
      {hint ? <p className="mt-1 text-xs text-zinc-500">{hint}</p> : null}
    </div>
  );
}
