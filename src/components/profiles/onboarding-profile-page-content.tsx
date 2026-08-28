"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useProfile } from "@/components/providers/auth-provider";
import { ProfileSettingsForm } from "@/components/profiles/profile-settings-form";
import {
  ProfileSettingsSkeleton,
} from "@/components/profiles/profile-settings-page-content";
import { FormMessage } from "@/components/ui/form-message";
import { PageHeader } from "@/components/ui/page-header";

export function OnboardingProfilePageContent() {
  const { status, profile, error, refreshProfile } = useProfile();
  const router = useRouter();
  const initialCheckDone = useRef(false);

  useEffect(() => {
    if (status !== "ready" || initialCheckDone.current) return;

    initialCheckDone.current = true;
    if (profile) {
      router.replace("/settings/profile");
    }
  }, [profile, router, status]);

  if (status === "idle" || status === "loading" || profile) {
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
