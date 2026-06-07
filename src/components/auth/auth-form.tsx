"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  login,
  signup,
  type AuthActionState,
} from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { TextInput } from "@/components/ui/inputs";
import { SectionCard } from "@/components/ui/section-card";

type AuthFormProps = {
  mode: "login" | "signup";
  nextPath?: string;
};

const initialState: AuthActionState | null = null;

const MODE_CONFIG = {
  login: {
    title: "ログイン",
    submitLabel: "ログイン",
    alternateHref: "/signup",
    alternateLabel: "アカウントをお持ちでない方はこちら",
    passwordAutoComplete: "current-password" as const,
  },
  signup: {
    title: "新規登録",
    submitLabel: "登録する",
    alternateHref: "/login",
    alternateLabel: "すでにアカウントをお持ちの方はこちら",
    passwordAutoComplete: "new-password" as const,
  },
};

export function AuthForm({ mode, nextPath }: AuthFormProps) {
  const action = mode === "login" ? login : signup;
  const [state, formAction, pending] = useActionState(action, initialState);

  const config = MODE_CONFIG[mode];

  return (
    <div className="w-full max-w-sm">
      <div className="mb-6 text-center">
        <p className="text-sm font-medium tracking-widest text-zinc-500 uppercase">
          Sakemem
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">
          {config.title}
        </h1>
      </div>

      <SectionCard>
        <form action={formAction} className="space-y-4">
          {mode === "login" && nextPath ? (
            <input type="hidden" name="next" value={nextPath} />
          ) : null}

          <TextInput
            id="email"
            name="email"
            type="email"
            label="メールアドレス"
            autoComplete="email"
            required
            placeholder="you@example.com"
          />

          <TextInput
            id="password"
            name="password"
            type="password"
            label="パスワード"
            autoComplete={config.passwordAutoComplete}
            required
            minLength={6}
            placeholder="6文字以上"
          />

          {state?.error ? (
            <FormMessage variant="error">{state.error}</FormMessage>
          ) : null}

          {state?.success ? (
            <FormMessage variant="success">{state.success}</FormMessage>
          ) : null}

          <Button type="submit" fullWidth disabled={pending}>
            {pending ? "処理中..." : config.submitLabel}
          </Button>
        </form>
      </SectionCard>

      <p className="mt-6 text-center text-sm text-zinc-600">
        <Link
          href={config.alternateHref}
          className="font-medium text-zinc-900 underline-offset-4 hover:underline"
        >
          {config.alternateLabel}
        </Link>
      </p>
    </div>
  );
}
