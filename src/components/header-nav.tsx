"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState, type Dispatch, type SetStateAction } from "react";
import { HeaderUserMenu } from "@/components/header-user-menu";
import { Button, LinkButton } from "@/components/ui/button";
import { cx, MOBILE_NAV_LINK_CLASS, NAV_LINK_CLASS } from "@/components/ui/styles";

type HeaderUserProfile = {
  displayName: string;
  username: string;
  avatarUrl: string | null;
};

type HeaderNavProps = {
  isLoggedIn: boolean;
  loading?: boolean;
  onSignOut: () => Promise<void>;
  signOutPending?: boolean;
  userProfile?: HeaderUserProfile | null;
};

type MenuState = {
  open: boolean;
  pathname: string;
};

export function HeaderNav({
  isLoggedIn,
  loading = false,
  onSignOut,
  signOutPending = false,
  userProfile,
}: HeaderNavProps) {
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

  if (loading) {
    return (
      <div
        className="h-9 w-36 animate-pulse rounded-lg bg-zinc-100"
        aria-label="ナビゲーションを読み込んでいます"
      />
    );
  }

  if (!isLoggedIn) {
    return (
      <>
        <div className="hidden items-center gap-1.5 sm:flex sm:gap-2">
          <LinkButton
            href="/login"
            variant="secondary"
            size="sm"
            className="whitespace-nowrap"
          >
            ログイン
          </LinkButton>
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
          <LinkButton
            href="/login"
            variant="secondary"
            size="sm"
            fullWidth
            className="whitespace-nowrap"
            onClick={() => setMenuOpen(false)}
          >
            ログイン
          </LinkButton>
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
        {userProfile ? (
          <HeaderUserMenu
            displayName={userProfile.displayName}
            username={userProfile.username}
            avatarUrl={userProfile.avatarUrl}
            onSignOut={onSignOut}
            signOutPending={signOutPending}
          />
        ) : (
          <>
            <NavLink href="/settings/profile">プロフィール設定</NavLink>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="whitespace-nowrap"
              disabled={signOutPending}
              onClick={() => void onSignOut()}
            >
              {signOutPending ? "ログアウト中..." : "ログアウト"}
            </Button>
          </>
        )}
      </div>

      <div className="flex items-center gap-1.5 sm:hidden">
        {userProfile ? (
          <HeaderUserMenu
            displayName={userProfile.displayName}
            username={userProfile.username}
            avatarUrl={userProfile.avatarUrl}
            onSignOut={onSignOut}
            signOutPending={signOutPending}
          />
        ) : null}
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
          {!userProfile ? (
            <MobileNavLink
              href="/settings/profile"
              onNavigate={() => setMenuOpen(false)}
            >
              プロフィール設定
            </MobileNavLink>
          ) : null}
          <MobileNavLink
            href="/changelog"
            onNavigate={() => setMenuOpen(false)}
          >
            更新情報
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
          {!userProfile ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              fullWidth
              className="whitespace-nowrap"
              disabled={signOutPending}
              onClick={() => void onSignOut()}
            >
              {signOutPending ? "ログアウト中..." : "ログアウト"}
            </Button>
          ) : null}
        </MobileMenu>
      </div>
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
