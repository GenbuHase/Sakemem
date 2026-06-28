import Link from "next/link";
import { headers } from "next/headers";
import { signOut } from "@/app/actions/auth";
import { HeaderNav } from "@/components/header-nav";
import { createClient } from "@/lib/supabase/server";

function isPublicProfilePath(pathname: string): boolean {
  return pathname.startsWith("/profile") || pathname.startsWith("/@");
}

export async function Header() {
  const pathname = (await headers()).get("x-pathname") ?? "";

  if (isPublicProfilePath(pathname)) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="shrink-0 rounded-md px-1 py-0.5 text-sm font-semibold tracking-widest text-zinc-900 uppercase transition hover:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300"
        >
          Sakemem
        </Link>

        <nav
          aria-label="メインナビゲーション"
          className="flex shrink-0 items-center text-sm"
        >
          <HeaderNav isLoggedIn={!!user} signOutAction={signOut} />
        </nav>
      </div>
    </header>
  );
}
