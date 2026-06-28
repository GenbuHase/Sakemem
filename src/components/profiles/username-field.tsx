"use client";

import { useEffect, useState, useTransition } from "react";
import { checkUsernameAvailable } from "@/app/actions/profiles";
import { TextInput } from "@/components/ui/inputs";
import { validateUsernameFormat } from "@/lib/profiles/validate-username";

type UsernameFieldProps = {
  defaultValue?: string;
  originalUsername?: string;
  siteHost?: string;
};

export function UsernameField({
  defaultValue = "",
  originalUsername,
  siteHost = "sakemem.app",
}: UsernameFieldProps) {
  const [value, setValue] = useState(defaultValue);
  const [debouncedValue, setDebouncedValue] = useState(defaultValue);
  const [availabilityMessage, setAvailabilityMessage] = useState<string | null>(
    null,
  );
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), 400);
    return () => clearTimeout(timer);
  }, [value]);

  const trimmed = value.trim();
  const debouncedTrimmed = debouncedValue.trim();
  const formatError = validateUsernameFormat(trimmed);
  const isUnchanged =
    Boolean(originalUsername) && debouncedTrimmed === originalUsername;

  useEffect(() => {
    if (formatError || isUnchanged || !debouncedTrimmed) {
      return;
    }

    let active = true;

    void checkUsernameAvailable(debouncedTrimmed).then((result) => {
      if (!active) return;
      startTransition(() => {
        setAvailabilityMessage(
          result.available
            ? "このユーザー名は使用できます"
            : "このユーザー名は使用されています",
        );
      });
    });

    return () => {
      active = false;
    };
  }, [debouncedTrimmed, formatError, isUnchanged]);

  const message =
    formatError ??
    (originalUsername && trimmed === originalUsername
      ? null
      : availabilityMessage);

  return (
    <div className="space-y-1">
      <TextInput
        id="username"
        name="username"
        label="ユーザー名"
        required
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          setAvailabilityMessage(null);
        }}
        autoComplete="username"
        hint={
          <span className="flex items-center gap-1 text-xs text-zinc-500">
            <span>{siteHost}/@</span>
          </span>
        }
      />
      {message ? (
        <p
          className={`text-xs ${
            message.includes("使用できます")
              ? "text-emerald-600"
              : "text-zinc-500"
          }`}
        >
          {pending && !formatError ? "確認中..." : message}
        </p>
      ) : null}
    </div>
  );
}
