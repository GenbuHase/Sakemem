"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { HeaderNav } from "@/components/header-nav";
import { SiteLogo } from "@/components/layout/site-logo";
import {
  useAuth,
  useProfile,
} from "@/components/providers/auth-provider";

export function Header() {
  const { status, signOut } = useAuth();
  const { profile } = useProfile();
  const router = useRouter();
  const [signOutPending, setSignOutPending] = useState(false);

  async function handleSignOut() {
    setSignOutPending(true);
    try {
      await signOut();
      router.replace("/login");
    } catch {
      window.alert("ログアウトに失敗しました。もう一度お試しください。");
    } finally {
      setSignOutPending(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-4 px-4 sm:px-6">
        <SiteLogo className="shrink-0 rounded-md px-1 py-0.5 transition hover:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300" />

        <nav
          aria-label="メインナビゲーション"
          className="flex shrink-0 items-center text-sm"
        >
          <HeaderNav
            isLoggedIn={status === "authenticated"}
            loading={status === "loading"}
            onSignOut={handleSignOut}
            signOutPending={signOutPending}
            userProfile={
              profile
                ? {
                    displayName: profile.display_name,
                    username: profile.username,
                    avatarUrl: profile.avatar_url,
                  }
                : null
            }
          />
        </nav>
      </div>
    </header>
  );
}
