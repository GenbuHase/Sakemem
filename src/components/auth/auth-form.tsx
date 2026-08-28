"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { TextInput } from "@/components/ui/inputs";
import { SectionCard } from "@/components/ui/section-card";
import { createClient } from "@/lib/supabase/client";

type AuthFormProps = {
  mode: "login" | "signup";
  nextPath?: string;
};

type AuthFormState = {
  error?: string;
  success?: string;
};

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
  const [supabase] = useState(createClient);
  const [state, setState] = useState<AuthFormState | null>(null);
  const [pending, setPending] = useState(false);
  const { status } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const config = MODE_CONFIG[mode];
  const requestedNext = nextPath ?? searchParams.get("next") ?? "";
  const queryError = mode === "login" ? searchParams.get("error") : null;
  const safeNext =
    requestedNext.startsWith("/") && !requestedNext.startsWith("//")
      ? requestedNext
      : "/records";

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(safeNext);
    }
  }, [router, safeNext, status]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setState(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          setState({
            error:
              "ログインに失敗しました。メールアドレスとパスワードを確認してください。",
          });
          return;
        }

        router.replace(safeNext);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setState({
          error: "登録に失敗しました。別のメールアドレスをお試しください。",
        });
        return;
      }

      if (data.user && !data.session) {
        setState({
          success:
            "確認メールを送信しました。メール内のリンクから登録を完了してください。",
        });
        return;
      }

      router.replace(safeNext);
    } catch {
      setState({
        error:
          mode === "login"
            ? "ログインに失敗しました。通信環境を確認してください。"
            : "登録に失敗しました。通信環境を確認してください。",
      });
    } finally {
      setPending(false);
    }
  }

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
        <form onSubmit={handleSubmit} className="space-y-4">
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

          {state?.error ?? queryError ? (
            <FormMessage variant="error">
              {state?.error ?? queryError}
            </FormMessage>
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
