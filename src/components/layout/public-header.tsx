import Link from "next/link";
import type { ReactNode } from "react";

export function PublicHeader({ children }: { children?: ReactNode }) {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="text-sm font-semibold tracking-widest text-zinc-900 uppercase"
        >
          Sakemem
        </Link>
        <div className="flex items-center gap-3 text-sm">
          {children}
          <Link
            href="/login"
            className="rounded-md px-2.5 py-1.5 font-medium text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-900"
          >
            ログイン
          </Link>
        </div>
      </div>
    </header>
  );
}
