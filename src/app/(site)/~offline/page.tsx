import type { Metadata } from "next";
import { LinkButton } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "オフライン",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-20 sm:px-6">
      <main className="w-full max-w-md text-center">
        <p className="text-sm font-medium tracking-widest text-zinc-500 uppercase">
          Sakemem
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900">
          オフラインです
        </h1>
        <p className="mt-4 text-base leading-7 text-zinc-600">
          ネットワークに接続できません。接続が復旧したら、もう一度お試しください。
        </p>
        <div className="mt-8">
          <LinkButton href="/" size="lg">
            トップへ戻る
          </LinkButton>
        </div>
      </main>
    </div>
  );
}
