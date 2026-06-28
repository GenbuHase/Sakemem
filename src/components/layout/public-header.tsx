import Link from "next/link";
import { headers } from "next/headers";
import { LinkButton } from "@/components/ui/button";
import { fetchProfileByUserId } from "@/lib/profiles/repository";
import { createClient } from "@/lib/supabase/server";

const NAV_LINK_CLASS =
  "rounded-md px-2.5 py-1.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-900";

function parseProfileUsername(pathname: string): string | null {
  const atProfile = pathname.match(/^\/@([^/]+)$/);
  if (atProfile) {
    return atProfile[1];
  }

  const atRecord = pathname.match(/^\/@([^/]+)\//);
  if (atRecord) {
    return atRecord[1];
  }

  const profilePage = pathname.match(/^\/profile\/([^/]+)/);
  if (profilePage) {
    return profilePage[1];
  }

  return null;
}

function isPublicProfilePage(pathname: string): boolean {
  return (
    /^\/@[^/]+$/.test(pathname) || /^\/profile\/[^/]+$/.test(pathname)
  );
}

export async function PublicHeader() {
  const pathname = (await headers()).get("x-pathname") ?? "";
  const returnPath = pathname || "/";
  const loginHref = `/login?next=${encodeURIComponent(returnPath)}`;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isOwner = false;
  if (user) {
    const myProfile = await fetchProfileByUserId(supabase, user.id);
    const pageUsername = parseProfileUsername(pathname);
    isOwner = Boolean(
      myProfile && pageUsername && myProfile.username === pageUsername,
    );
  }

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
          {user ? (
            <>
              {showEditProfile ? (
                <Link
                  href="/settings/profile"
                  className={NAV_LINK_CLASS}
                >
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
