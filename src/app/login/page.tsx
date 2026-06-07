import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { FormMessage } from "@/components/ui/form-message";

export const metadata: Metadata = {
  title: "ログイン | Sakemem",
};

type LoginPageProps = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, next } = await searchParams;

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-16">
      {error ? (
        <FormMessage variant="error" className="mb-6 max-w-sm text-center">
          {error}
        </FormMessage>
      ) : null}
      <AuthForm mode="login" nextPath={next} />
    </div>
  );
}
