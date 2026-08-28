"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Header } from "@/components/header";
import { useAuth } from "@/components/providers/auth-provider";
import { RecordsProvider } from "@/components/providers/records-provider";
import { getClientAuthRedirect } from "@/lib/auth/client-guard";

export function AuthenticatedApp({ children }: { children: React.ReactNode }) {
  const { status, user } = useAuth();
  const pathname = usePathname() ?? "/records";
  const router = useRouter();
  const redirectTo = getClientAuthRedirect(status, pathname);

  useEffect(() => {
    if (redirectTo) {
      router.replace(redirectTo);
    }
  }, [redirectTo, router]);

  return (
    <>
      <Header />
      {status === "authenticated" ? (
        <RecordsProvider key={user?.id}>{children}</RecordsProvider>
      ) : (
        <main
          className="flex flex-1 items-center justify-center px-4 py-16"
          aria-busy="true"
          aria-live="polite"
        >
          <div className="h-6 w-40 animate-pulse rounded bg-zinc-200" />
          <span className="sr-only">
            {status === "loading"
              ? "ログイン状態を確認しています"
              : "ログイン画面へ移動しています"}
          </span>
        </main>
      )}
    </>
  );
}
