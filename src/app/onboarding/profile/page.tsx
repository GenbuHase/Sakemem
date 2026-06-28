import type { Metadata } from "next";
import { ProfileSettingsForm } from "@/components/profiles/profile-settings-form";
import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/lib/auth/require-user";
import { fetchProfileByUserId } from "@/lib/profiles/repository";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "プロフィール設定 | Sakemem",
  robots: { index: false, follow: false },
};

export default async function OnboardingProfilePage() {
  const { supabase, user } = await requireUser();
  const profile = await fetchProfileByUserId(supabase, user.id);

  if (profile) {
    redirect("/settings/profile");
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader
        title="プロフィールを設定"
        description="共有機能を使うにはユーザー名の設定が必要です。後から変更できます。"
      />
      <ProfileSettingsForm mode="create" />
    </div>
  );
}
