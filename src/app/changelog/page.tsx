import type { Metadata } from "next";
import { ChangelogList } from "@/components/announcements/changelog-list";
import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/lib/auth/require-user";

export const metadata: Metadata = {
  title: "更新情報 | Sakemem",
  robots: { index: false, follow: false },
};

export default async function ChangelogPage() {
  await requireUser();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader
        backHref="/records"
        backLabel="タイムラインに戻る"
        title="更新情報"
        description="Sakemem の機能追加や改善のお知らせです。"
      />
      <ChangelogList />
    </div>
  );
}
