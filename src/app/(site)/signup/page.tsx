import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "新規登録 | Sakemem",
};

export default function SignupPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-16">
      <Suspense
        fallback={
          <div
            className="h-80 w-full max-w-sm animate-pulse rounded-xl bg-zinc-100"
            aria-label="登録フォームを読み込んでいます"
          />
        }
      >
        <AuthForm mode="signup" />
      </Suspense>
    </div>
  );
}
