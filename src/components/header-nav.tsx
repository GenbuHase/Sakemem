"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState, type Dispatch, type SetStateAction } from "react";
import { LinkButton } from "@/components/ui/button";
import { cx } from "@/components/ui/styles";

const NAV_LINK_CLASS =
  "rounded-md px-2.5 py-1.5 font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300";

const MOBILE_NAV_LINK_CLASS =
  "block rounded-lg px-3 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300";

type HeaderNavProps = {
  user: { email: string } | null;
  signOutAction: () => Promise<void>;
};

type MenuState = {
  open: boolean;
  pathname: string;
};

export function HeaderNav({ user, signOutAction }: HeaderNavProps) {
  const pathname = usePathname();
  const [menuState, setMenuState] = useState<MenuState>({
    open: false,
    pathname,
  });
  const menuId = useId();
  const menuOpen = menuState.open && menuState.pathname === pathname;
  const setMenuOpen: Dispatch<SetStateAction<boolean>> = (value) => {
    setMenuState((current) => {
      const nextOpen =
        typeof value === "function" ? value(current.open) : value;

      return { open: nextOpen, pathname };
    });
  };

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuState({ open: false, pathname });
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [menuOpen, pathname]);

  if (!user) {
    return (
      <>
        <div className="hidden items-center gap-1.5 sm:flex sm:gap-2">
          <NavLink href="/login">ログイン</NavLink>
          <LinkButton href="/signup" size="sm" className="whitespace-nowrap">
            新規登録
          </LinkButton>
        </div>

        <MobileMenu
          menuId={menuId}
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          onToggle={() => setMenuOpen((current) => !current)}
        >
          <MobileNavLink
            href="/login"
            onNavigate={() => setMenuOpen(false)}
          >
            ログイン
          </MobileNavLink>
          <LinkButton
            href="/signup"
            size="sm"
            fullWidth
            className="whitespace-nowrap"
            onClick={() => setMenuOpen(false)}
          >
            新規登録
          </LinkButton>
        </MobileMenu>
      </>
    );
  }

  return (
    <>
      <div className="hidden items-center gap-1.5 sm:flex sm:gap-2">
        <NavLink href="/records">タイムライン</NavLink>
        <LinkButton href="/records/new" size="sm" className="whitespace-nowrap">
          記録する
        </LinkButton>
        <span
          className="max-w-[10rem] truncate text-zinc-500"
          title={user.email}
        >
          {user.email}
        </span>
        <form action={signOutAction}>
          <button
            type="submit"
            className={cx(
              NAV_LINK_CLASS,
              "whitespace-nowrap text-zinc-500 hover:text-zinc-900",
            )}
          >
            ログアウト
          </button>
        </form>
      </div>

      <MobileMenu
        menuId={menuId}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onToggle={() => setMenuOpen((current) => !current)}
      >
        <MobileNavLink
          href="/records"
          onNavigate={() => setMenuOpen(false)}
        >
          タイムライン
        </MobileNavLink>
        <LinkButton
          href="/records/new"
          size="sm"
          fullWidth
          className="whitespace-nowrap"
          onClick={() => setMenuOpen(false)}
        >
          記録する
        </LinkButton>
        <p className="truncate px-3 py-1 text-xs text-zinc-500" title={user.email}>
          {user.email}
        </p>
        <form action={signOutAction}>
          <button
            type="submit"
            className={cx(
              MOBILE_NAV_LINK_CLASS,
              "w-full text-left text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900",
            )}
          >
            ログアウト
          </button>
        </form>
      </MobileMenu>
    </>
  );
}

function MobileMenu({
  menuId,
  open,
  onClose,
  onToggle,
  children,
}: {
  menuId: string;
  open: boolean;
  onClose: () => void;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative sm:hidden">
      <button
        type="button"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-zinc-700 transition hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={open ? "メニューを閉じる" : "メニューを開く"}
        onClick={onToggle}
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 top-14 z-40"
            aria-label="メニューを閉じる"
            onClick={onClose}
          />
          <nav
            id={menuId}
            aria-label="メインメニュー"
            className="absolute right-0 z-50 mt-2 w-52 rounded-xl border border-zinc-200 bg-white p-2 shadow-lg"
          >
            <div className="flex flex-col gap-1">{children}</div>
          </nav>
        </>
      ) : null}
    </div>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cx(
        NAV_LINK_CLASS,
        "whitespace-nowrap text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900",
      )}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  onNavigate,
  children,
}: {
  href: string;
  onNavigate: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cx(
        MOBILE_NAV_LINK_CLASS,
        "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900",
      )}
    >
      {children}
    </Link>
  );
}

function MenuIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 5h14M3 10h14M3 15h14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="m5 5 10 10M15 5 5 15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
