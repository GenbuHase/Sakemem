"use client";

import { useId, useState } from "react";
import { cx } from "@/components/ui/styles";

type RatingInputProps = {
  name: string;
  label: string;
  defaultValue?: number | null;
};

const RATING_VALUES = [1, 2, 3, 4, 5] as const;

export function RatingInput({ name, label, defaultValue }: RatingInputProps) {
  const groupId = useId();
  const [selected, setSelected] = useState<number | null>(
    defaultValue ?? null,
  );
  const [hovered, setHovered] = useState<number | null>(null);

  const displayValue = hovered ?? selected;

  return (
    <fieldset>
      <legend className="mb-2 block text-sm font-medium text-zinc-700">
        {label}
        <span className="ml-1.5 text-xs font-normal text-zinc-400">任意</span>
      </legend>

      <input
        type="radio"
        name={name}
        value=""
        checked={selected === null}
        onChange={() => setSelected(null)}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />

      <div className="flex flex-wrap items-center gap-1">
        {RATING_VALUES.map((value) => {
          const filled = displayValue !== null && value <= displayValue;

          return (
            <label
              key={value}
              className={cx(
                "flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-lg transition",
                "focus-within:ring-2 focus-within:ring-zinc-300",
                filled
                  ? "text-amber-500"
                  : "text-zinc-300 hover:text-amber-400",
              )}
              onMouseEnter={() => setHovered(value)}
              onMouseLeave={() => setHovered(null)}
            >
              <input
                type="radio"
                name={name}
                value={value}
                checked={selected === value}
                onChange={() => setSelected(value)}
                className="sr-only"
                aria-labelledby={`${groupId}-${value}`}
              />
              <span id={`${groupId}-${value}`} aria-hidden="true">
                ★
              </span>
            </label>
          );
        })}

        {selected !== null ? (
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="ml-2 rounded-md px-2 py-1 text-xs text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-700"
          >
            クリア
          </button>
        ) : (
          <span className="ml-2 text-xs text-zinc-400">未評価</span>
        )}
      </div>
    </fieldset>
  );
}
