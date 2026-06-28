"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LinkButton } from "@/components/ui/button";
import {
  isPublicProfilePage,
  parseProfileUsername,
} from "@/lib/routing/public-profile-path";

const NAV_LINK_CLASS =
  "rounded-md px-2.5 py-1.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-900";

type PublicHeaderNavProps = {
  isLoggedIn: boolean;
  myUsername: string | null;
};

export function PublicHeaderNav({
  isLoggedIn,
  myUsername,
}: PublicHeaderNavProps) {
  const pathname = usePathname() ?? "";
  const returnPath = pathname || "/";
  const loginHref = `/login?next=${encodeURIComponent(returnPath)}`;

  const pageUsername = parseProfileUsername(pathname);
  const isOwner = Boolean(
    myUsername && pageUsername && myUsername === pageUsername,
  );
  const showEditProfile = isOwner && isPublicProfilePage(pathname);

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="text-sm font-semibold tracking-widest text-zinc-900 uppercase"
        >
          Sakemem
        </Link>
        <nav
          aria-label="公開ページナビゲーション"
          className="flex items-center gap-1.5 sm:gap-2"
        >
          {isLoggedIn ? (
            <>
              {showEditProfile ? (
                <Link href="/settings/profile" className={NAV_LINK_CLASS}>
                  プロフィールを編集
                </Link>
              ) : null}
              <Link href="/records" className={NAV_LINK_CLASS}>
                タイムライン
              </Link>
            </>
          ) : (
            <>
              <LinkButton
                href={loginHref}
                variant="secondary"
                size="sm"
                className="whitespace-nowrap"
              >
                ログイン
              </LinkButton>
              <LinkButton
                href="/signup"
                size="sm"
                className="whitespace-nowrap"
              >
                新規登録
              </LinkButton>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
