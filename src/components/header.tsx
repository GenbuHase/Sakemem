import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { LinkButton } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-sm font-semibold tracking-widest text-zinc-900 uppercase"
        >
          Sakemem
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          {user ? <SignedInNav email={user.email ?? ""} /> : <SignedOutNav />}
        </nav>
      </div>
    </header>
  );
}

function SignedInNav({ email }: { email: string }) {
  return (
    <>
      <Link
        href="/records"
        className="font-medium text-zinc-700 transition hover:text-zinc-900"
      >
        タイムライン
      </Link>
      <LinkButton href="/records/new" size="sm">
        記録する
      </LinkButton>
      <span className="hidden text-zinc-500 sm:inline">{email}</span>
      <form action={signOut}>
        <button
          type="submit"
          className="font-medium text-zinc-700 transition hover:text-zinc-900"
        >
          ログアウト
        </button>
      </form>
    </>
  );
}

function SignedOutNav() {
  return (
    <>
      <Link
        href="/login"
        className="font-medium text-zinc-700 transition hover:text-zinc-900"
      >
        ログイン
      </Link>
      <LinkButton href="/signup" size="sm">
        新規登録
      </LinkButton>
    </>
  );
}
