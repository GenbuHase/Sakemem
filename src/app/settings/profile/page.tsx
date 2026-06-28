import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProfileSettingsForm } from "@/components/profiles/profile-settings-form";
import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/lib/auth/require-user";
import { fetchProfileByUserId } from "@/lib/profiles/repository";

export const metadata: Metadata = {
  title: "プロフィール設定 | Sakemem",
  robots: { index: false, follow: false },
};

export default async function SettingsProfilePage() {
  const { supabase, user } = await requireUser();
  const profile = await fetchProfileByUserId(supabase, user.id);

  if (!profile) {
    redirect("/onboarding/profile");
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader
        backHref="/records"
        backLabel="タイムラインに戻る"
        title="プロフィール設定"
        description="公開プロフィールの見た目を調整できます。"
      />
      <ProfileSettingsForm mode="edit" profile={profile} />
    </div>
  );
}
