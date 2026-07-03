import { signOut } from "@/app/actions/auth";
import { HeaderNav } from "@/components/header-nav";
import { SiteLogo } from "@/components/layout/site-logo";
import { getHeaderContext } from "@/lib/layout/header-context";

export async function Header() {
  const { isLoggedIn, userProfile } = await getHeaderContext();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-4 px-4 sm:px-6">
        <SiteLogo className="shrink-0 rounded-md px-1 py-0.5 transition hover:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300" />

        <nav
          aria-label="メインナビゲーション"
          className="flex shrink-0 items-center text-sm"
        >
          <HeaderNav
            isLoggedIn={isLoggedIn}
            signOutAction={signOut}
            userProfile={userProfile}
          />
        </nav>
      </div>
    </header>
  );
}
