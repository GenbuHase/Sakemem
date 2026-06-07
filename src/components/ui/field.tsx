import type { ReactNode } from "react";

type FieldProps = {
  htmlFor?: string;
  label: ReactNode;
  children: ReactNode;
  hint?: ReactNode;
  required?: boolean;
};

export function Field({ htmlFor, label, children, hint, required }: FieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-zinc-700">
        {label}
        {required ? (
          <span className="ml-1 text-xs font-normal text-zinc-400">必須</span>
        ) : null}
      </label>
      {children}
      {hint ? <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">{hint}</p> : null}
    </div>
  );
}
