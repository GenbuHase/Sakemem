"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useId,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { ProfileAvatar } from "@/components/profiles/profile-avatar";
import { cx } from "@/components/ui/styles";

type HeaderUserMenuProps = {
  displayName: string;
  username: string;
  avatarUrl: string | null;
  onSignOut: () => Promise<void>;
  signOutPending?: boolean;
};

type MenuState = {
  open: boolean;
  pathname: string;
};

const MENU_ITEM_CLASS =
  "block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300";

export function HeaderUserMenu({
  displayName,
  username,
  avatarUrl,
  onSignOut,
  signOutPending = false,
}: HeaderUserMenuProps) {
  const pathname = usePathname();
  const menuId = useId();
  const [menuState, setMenuState] = useState<MenuState>({
    open: false,
    pathname,
  });
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

  return (
    <div className="relative">
      <button
        type="button"
        className="inline-flex rounded-full ring-offset-2 transition hover:ring-2 hover:ring-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300"
        aria-expanded={menuOpen}
        aria-controls={menuId}
        aria-haspopup="menu"
        aria-label={`${displayName} のアカウントメニュー`}
        onClick={() => setMenuOpen((current) => !current)}
      >
        <ProfileAvatar
          displayName={displayName}
          avatarUrl={avatarUrl}
          size="sm"
        />
      </button>

      {menuOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 top-14 z-40"
            aria-label="メニューを閉じる"
            onClick={() => setMenuOpen(false)}
          />
          <div
            id={menuId}
            role="menu"
            aria-label="アカウントメニュー"
            className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-zinc-200 bg-white p-2 shadow-lg"
          >
            <div className="border-b border-zinc-100 px-3 py-2.5">
              <p className="truncate text-sm font-medium text-zinc-900">
                {displayName}
              </p>
              <p className="truncate text-xs text-zinc-500">@{username}</p>
            </div>
            <div className="py-1">
              <a
                href={`/@${username}`}
                role="menuitem"
                className={MENU_ITEM_CLASS}
                onClick={() => setMenuOpen(false)}
              >
                公開プロフィールを見る
              </a>
              <Link
                href="/settings/profile"
                role="menuitem"
                className={MENU_ITEM_CLASS}
                onClick={() => setMenuOpen(false)}
              >
                プロフィール設定
              </Link>
              <Link
                href="/changelog"
                role="menuitem"
                className={MENU_ITEM_CLASS}
                onClick={() => setMenuOpen(false)}
              >
                更新情報
              </Link>
            </div>
            <div className="border-t border-zinc-100 pt-1">
              <button
                type="button"
                role="menuitem"
                className={cx(MENU_ITEM_CLASS, "text-zinc-600")}
                disabled={signOutPending}
                onClick={() => {
                  setMenuOpen(false);
                  void onSignOut();
                }}
              >
                {signOutPending ? "ログアウト中..." : "ログアウト"}
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
