"use client";

import { useRef, useState } from "react";
import { uploadAvatar } from "@/app/actions/profiles";
import { Button } from "@/components/ui/button";
import { validateAvatarFile } from "@/lib/profiles/upload-avatar";
import { ProfileAvatar } from "./profile-avatar";

type ProfileAvatarUploadProps = {
  displayName: string;
  avatarUrl?: string | null;
  onAvatarUrlChange: (url: string | null) => void;
};

export function ProfileAvatarUpload({
  displayName,
  avatarUrl,
  onAvatarUrlChange,
}: ProfileAvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const shownUrl = previewUrl ?? avatarUrl ?? null;

  async function handleFileChange(file: File | null) {
    if (!file) return;

    const validation = validateAvatarFile(file);
    if (!validation.ok) {
      setError(validation.error);
      return;
    }

    setError(null);
    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);

    const formData = new FormData();
    formData.set("avatar", file);
    const result = await uploadAvatar(formData);

    setUploading(false);

    if (result.error) {
      setError(result.error);
      setPreviewUrl(null);
      return;
    }

    if (result.url) {
      onAvatarUrlChange(result.url);
    }
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <ProfileAvatar
        displayName={displayName}
        avatarUrl={shownUrl}
        size="lg"
      />

      <div className="flex flex-col gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            void handleFileChange(file);
          }}
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "アップロード中..." : "画像を選ぶ"}
        </Button>
        {shownUrl ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              setPreviewUrl(null);
              onAvatarUrlChange(null);
            }}
          >
            画像を削除
          </Button>
        ) : null}
        <p className="text-xs text-zinc-500">推奨: 正方形・512px 以上</p>
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}
