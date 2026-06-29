import { ImageResponse } from "next/og";
import { loadOgFonts } from "@/lib/metadata/og-fonts";
import {
  fetchOgAvatarDataUrl,
  truncateOgText,
} from "@/lib/metadata/og-image-utils";
import { siteName } from "@/lib/metadata/site";
import { createClient } from "@/lib/supabase/server";
import {
  fetchPublicProfile,
  fetchPublicProfileRecords,
} from "@/lib/sharing/fetch-shared";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = {
  params: Promise<{ username: string }>;
};

export default async function Image({ params }: Props) {
  const { username } = await params;
  const supabase = await createClient();
  const profile = await fetchPublicProfile(supabase, username);

  if (!profile) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#fafafa",
            fontSize: 48,
            color: "#52525b",
          }}
        >
          {siteName}
        </div>
      ),
      { ...size },
    );
  }

  const records = await fetchPublicProfileRecords(supabase, username);
  const fonts = await loadOgFonts();
  const avatarDataUrl = await fetchOgAvatarDataUrl(profile.avatar_url);
  const displayName = truncateOgText(profile.display_name, 28);
  const usernameLabel = truncateOgText(profile.username, 32);
  const bioPreview = truncateOgText(
    profile.bio ?? "公開晩酌記録",
    80,
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "linear-gradient(135deg, #fafafa 0%, #e4e4e7 100%)",
          color: "#18181b",
          fontFamily: "NotoSansJP",
        }}
      >
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          {avatarDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarDataUrl}
              alt=""
              width={120}
              height={120}
              style={{ borderRadius: 9999, objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: 9999,
                background: "#d4d4d8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 48,
                fontWeight: 700,
              }}
            >
              {displayName.charAt(0) || "?"}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div
              style={{
                display: "flex",
                fontSize: 52,
                fontWeight: 700,
              }}
            >
              {displayName}
            </div>
            <div style={{ display: "flex", fontSize: 28, color: "#71717a" }}>
              @{usernameLabel}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 28,
            lineHeight: 1.5,
            color: "#3f3f46",
          }}
        >
          {bioPreview}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 24,
            color: "#52525b",
          }}
        >
          <span>公開記録 {records.length} 件</span>
          <span>{siteName}</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "NotoSansJP",
          data: fonts.regular,
          weight: 400,
          style: "normal",
        },
        {
          name: "NotoSansJP",
          data: fonts.bold,
          weight: 700,
          style: "normal",
        },
      ],
    },
  );
}
