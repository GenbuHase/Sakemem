import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "ログイン | Sakemem",
};

export default function LoginPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-16">
      <Suspense
        fallback={
          <div
            className="h-80 w-full max-w-sm animate-pulse rounded-xl bg-zinc-100"
            aria-label="ログインフォームを読み込んでいます"
          />
        }
      >
        <AuthForm mode="login" />
      </Suspense>
    </div>
  );
}
