"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useProfile } from "@/components/providers/auth-provider";
import { ProfileSettingsForm } from "@/components/profiles/profile-settings-form";
import { FormMessage } from "@/components/ui/form-message";
import { PageHeader } from "@/components/ui/page-header";

export function ProfileSettingsPageContent() {
  const { status, profile, error, refreshProfile } = useProfile();
  const router = useRouter();

  useEffect(() => {
    if (status === "ready" && !profile) {
      router.replace("/onboarding/profile");
    }
  }, [profile, router, status]);

  if (status === "idle" || status === "loading") {
    return <ProfileSettingsSkeleton />;
  }

  if (status === "error") {
    return (
      <div className="mx-auto w-full max-w-2xl space-y-4 px-4 py-8 sm:px-6 sm:py-10">
        <FormMessage variant="error">
          {error ?? "プロフィールの取得に失敗しました。"}
        </FormMessage>
        <button
          type="button"
          className="text-sm font-medium text-zinc-700 underline"
          onClick={() => void refreshProfile()}
        >
          再試行する
        </button>
      </div>
    );
  }

  if (!profile) {
    return <ProfileSettingsSkeleton />;
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

export function ProfileSettingsSkeleton() {
  return (
    <div
      className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-10"
      aria-busy="true"
      aria-label="プロフィールを読み込んでいます"
    >
      <div className="mb-6 space-y-2">
        <div className="h-8 w-48 animate-pulse rounded bg-zinc-200" />
        <div className="h-4 w-72 animate-pulse rounded bg-zinc-100" />
      </div>
      <div className="h-96 animate-pulse rounded-xl bg-zinc-100" />
    </div>
  );
}
