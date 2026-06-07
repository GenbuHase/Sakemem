"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LinkButton } from "@/components/ui/button";
import { cx } from "@/components/ui/styles";

const NAV_LINK_CLASS =
  "rounded-md px-2.5 py-1.5 font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300";

type HeaderNavProps = {
  user: { email: string } | null;
  signOutAction: () => Promise<void>;
};

export function HeaderNav({ user, signOutAction }: HeaderNavProps) {
  const pathname = usePathname();

  if (!user) {
    return (
      <>
        <NavLink href="/login" active={pathname === "/login"}>
          ログイン
        </NavLink>
        <LinkButton href="/signup" size="sm">
          新規登録
        </LinkButton>
      </>
    );
  }

  return (
    <>
      <NavLink
        href="/records"
        active={pathname === "/records" || pathname.startsWith("/records/")}
      >
        タイムライン
      </NavLink>
      <LinkButton href="/records/new" size="sm">
        記録する
      </LinkButton>
      <span
        className="hidden max-w-[10rem] truncate text-zinc-500 sm:inline"
        title={user.email}
      >
        {user.email}
      </span>
      <form action={signOutAction}>
        <button
          type="submit"
          className={cx(
            NAV_LINK_CLASS,
            "text-zinc-500 hover:text-zinc-900",
          )}
        >
          ログアウト
        </button>
      </form>
    </>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cx(
        NAV_LINK_CLASS,
        active
          ? "bg-zinc-100 text-zinc-900"
          : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900",
      )}
    >
      {children}
    </Link>
  );
}
