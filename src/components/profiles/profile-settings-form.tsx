"use client";

import { useActionState, useEffect, useState } from "react";
import {
  createProfile,
  updateProfile,
  type ProfileActionState,
} from "@/app/actions/profiles";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { TextArea, TextInput } from "@/components/ui/inputs";
import { SectionCard } from "@/components/ui/section-card";
import type { Profile } from "@/lib/profiles/types";
import { getSiteUrl } from "@/lib/sharing/build-share-url";
import { ProfileAvatarUpload } from "./profile-avatar-upload";
import { ProfilePublicPreviewCard } from "./profile-public-preview-card";
import { UsernameField } from "./username-field";

const initialState: ProfileActionState | null = null;

type ProfileSettingsFormProps = {
  mode: "create" | "edit";
  profile?: Profile;
};

export function ProfileSettingsForm({ mode, profile }: ProfileSettingsFormProps) {
  const action = mode === "create" ? createProfile : updateProfile;
  const [state, formAction, pending] = useActionState(action, initialState);
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    profile?.avatar_url ?? null,
  );
  const [confirmUsernameChange, setConfirmUsernameChange] = useState(false);
  const [draftUsername, setDraftUsername] = useState(profile?.username ?? "");
  const [liveUsername, setLiveUsername] = useState(profile?.username ?? "");
  const [showUrlSavedNotice, setShowUrlSavedNotice] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => {
    if (profile?.username) {
      setLiveUsername(profile.username);
    }
  }, [profile?.username]);

  useEffect(() => {
    if (!state?.success || !state.username) return;

    setConfirmUsernameChange(false);
    setLiveUsername((prev) => {
      if (prev !== state.username) {
        setShowUrlSavedNotice(true);
      }
      return state.username!;
    });
    setDraftUsername(state.username);
  }, [state?.success, state?.username]);

  useEffect(() => {
    if (!showUrlSavedNotice) return;
    const timer = setTimeout(() => setShowUrlSavedNotice(false), 4000);
    return () => clearTimeout(timer);
  }, [showUrlSavedNotice]);

  let siteHost = "localhost:3000";
  try {
    siteHost = new URL(getSiteUrl()).host;
  } catch {
    // fallback
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (
      mode === "edit" &&
      profile &&
      !confirmUsernameChange
    ) {
      const form = event.currentTarget;
      const newUsername = String(
        new FormData(form).get("username") ?? "",
      ).trim();
      if (newUsername !== liveUsername) {
        event.preventDefault();
        setConfirmUsernameChange(true);
        return;
      }
    }
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className="space-y-6">
      {avatarUrl !== undefined ? (
        <input type="hidden" name="avatar_url" value={avatarUrl ?? ""} />
      ) : null}

      {mode === "edit" && profile ? (
        <ProfilePublicPreviewCard
          liveUsername={liveUsername}
          draftUsername={draftUsername}
          showSavedNotice={showUrlSavedNotice}
        />
      ) : null}

      <SectionCard title="プロフィール画像">
        <ProfileAvatarUpload
          displayName={displayName || "?"}
          avatarUrl={avatarUrl}
          onAvatarUrlChange={setAvatarUrl}
          onUploadingChange={setAvatarUploading}
        />
      </SectionCard>

      <SectionCard title="基本情報">
        <div className="space-y-4">
          <TextInput
            id="display_name"
            name="display_name"
            label="表示名"
            required
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            maxLength={50}
          />
          <UsernameField
            defaultValue={profile?.username}
            originalUsername={liveUsername}
            siteHost={siteHost}
            onUsernameChange={setDraftUsername}
          />
          <TextArea
            id="bio"
            name="bio"
            label="自己紹介（任意）"
            defaultValue={profile?.bio ?? ""}
            maxLength={200}
            placeholder="晩酌の好みなど"
          />
        </div>
      </SectionCard>

      {state?.error ? (
        <FormMessage variant="error">{state.error}</FormMessage>
      ) : null}

      {confirmUsernameChange ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-medium">ユーザー名を変更しますか？</p>
          <p className="mt-1">
            <span className="font-mono">@{liveUsername}</span>
            {" → "}
            <span className="font-mono font-medium">@{draftUsername.trim()}</span>
            {" "}に変更すると、共有 URL が変わり、旧 URL は使えなくなります。
          </p>
          <div className="mt-3 flex gap-2">
            <Button type="submit" size="sm" disabled={pending || avatarUploading}>
              {pending ? "変更中..." : "変更する"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={pending}
              onClick={() => setConfirmUsernameChange(false)}
            >
              キャンセル
            </Button>
          </div>
        </div>
      ) : (
        <Button type="submit" fullWidth size="lg" disabled={pending || avatarUploading}>
          {pending
            ? "保存中..."
            : avatarUploading
              ? "画像をアップロード中..."
              : mode === "create"
                ? "はじめる"
                : "保存する"}
        </Button>
      )}

      {state?.success ? (
        <FormMessage variant="success">
          {state.success}
          {state.profileUrl ? (
            <>
              {" "}
              <a
                href={state.profileUrl}
                className="font-medium underline"
              >
                公開プロフィールを見る
              </a>
            </>
          ) : null}
        </FormMessage>
      ) : null}
    </form>
  );
}
