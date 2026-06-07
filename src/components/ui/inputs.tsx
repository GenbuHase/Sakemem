import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { Field } from "./field";
import { FIELD_CONTROL_CLASS, cx } from "./styles";

type WithLabel<TElement> = TElement & {
  label?: ReactNode;
  hint?: ReactNode;
};

type TextInputProps = WithLabel<InputHTMLAttributes<HTMLInputElement>>;

export function TextInput({
  label,
  hint,
  className,
  id,
  type = "text",
  ...props
}: TextInputProps) {
  const input = (
    <input
      id={id}
      type={type}
      className={cx(FIELD_CONTROL_CLASS, className)}
      {...props}
    />
  );

  if (!label) {
    return input;
  }

  return (
    <Field htmlFor={id} label={label} hint={hint}>
      {input}
    </Field>
  );
}

type TextAreaProps = WithLabel<TextareaHTMLAttributes<HTMLTextAreaElement>>;

export function TextArea({
  label,
  hint,
  className,
  id,
  rows = 3,
  ...props
}: TextAreaProps) {
  const textarea = (
    <textarea
      id={id}
      rows={rows}
      className={cx(FIELD_CONTROL_CLASS, className)}
      {...props}
    />
  );

  if (!label) {
    return textarea;
  }

  return (
    <Field htmlFor={id} label={label} hint={hint}>
      {textarea}
    </Field>
  );
}

type SelectProps = WithLabel<SelectHTMLAttributes<HTMLSelectElement>> & {
  children: ReactNode;
};

export function Select({
  label,
  hint,
  className,
  id,
  children,
  ...props
}: SelectProps) {
  const select = (
    <select
      id={id}
      className={cx(FIELD_CONTROL_CLASS, className)}
      {...props}
    >
      {children}
    </select>
  );

  if (!label) {
    return select;
  }

  return (
    <Field htmlFor={id} label={label} hint={hint}>
      {select}
    </Field>
  );
}
