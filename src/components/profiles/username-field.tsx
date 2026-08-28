"use client";

import { useEffect, useId, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { TextInput } from "@/components/ui/inputs";
import { isUsernameAvailable } from "@/lib/profiles/repository";
import { validateUsernameFormat } from "@/lib/profiles/validate-username";
import { createClient } from "@/lib/supabase/client";

type UsernameFieldProps = {
  defaultValue?: string;
  originalUsername?: string;
  onUsernameChange?: (username: string) => void;
};

export function UsernameField({
  defaultValue = "",
  originalUsername,
  onUsernameChange,
}: UsernameFieldProps) {
  const { user } = useAuth();
  const messageId = useId();
  const [supabase] = useState(createClient);
  const [value, setValue] = useState(defaultValue);
  const [debouncedValue, setDebouncedValue] = useState(defaultValue);
  const [availabilityMessage, setAvailabilityMessage] = useState<string | null>(
    null,
  );
  const [checkedValue, setCheckedValue] = useState(defaultValue);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), 400);
    return () => clearTimeout(timer);
  }, [value]);

  const trimmed = value.trim();
  const debouncedTrimmed = debouncedValue.trim();
  const formatError = validateUsernameFormat(trimmed);
  const isUnchanged =
    Boolean(originalUsername) && debouncedTrimmed === originalUsername;
  const shouldCheck = Boolean(
    !formatError && !isUnchanged && debouncedTrimmed && user,
  );
  const checking = shouldCheck && checkedValue !== debouncedTrimmed;

  useEffect(() => {
    if (formatError || isUnchanged || !debouncedTrimmed || !user) {
      return;
    }

    let active = true;

    void isUsernameAvailable(supabase, debouncedTrimmed, user.id)
      .then((available) => {
        if (!active) return;
        setAvailabilityMessage(
          available
            ? "このユーザー名は使用できます"
            : "このユーザー名は使用されています",
        );
      })
      .catch(() => {
        if (active) {
          setAvailabilityMessage("ユーザー名を確認できませんでした");
        }
      })
      .finally(() => {
        if (active) {
          setCheckedValue(debouncedTrimmed);
        }
      });

    return () => {
      active = false;
    };
  }, [debouncedTrimmed, formatError, isUnchanged, supabase, user]);

  const message =
    formatError ??
    (originalUsername && trimmed === originalUsername
      ? null
      : availabilityMessage);
  const displayedMessage =
    checking && !formatError ? "確認中..." : message;
  const invalid = Boolean(
    formatError || message === "このユーザー名は使用されています",
  );

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
          onUsernameChange?.(event.target.value);
        }}
        autoComplete="username"
        aria-describedby={displayedMessage ? messageId : undefined}
        aria-invalid={invalid}
      />
      {displayedMessage ? (
        <p
          id={messageId}
          role="status"
          className={`text-xs ${
            displayedMessage.includes("使用できます")
              ? "text-emerald-600"
              : "text-zinc-500"
          }`}
        >
          {displayedMessage}
        </p>
      ) : null}
    </div>
  );
}
