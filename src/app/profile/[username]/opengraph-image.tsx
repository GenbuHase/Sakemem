import { ImageResponse } from "next/og";
import {
  buildOgImageOptions,
  loadOgFonts,
  OG_FONT_FAMILY,
} from "@/lib/metadata/og-fonts";
import {
  fetchOgAvatarDataUrl,
  splitOgBioLineSegments,
  splitOgBioLines,
  truncateOgText,
} from "@/lib/metadata/og-image-utils";
import { siteName } from "@/lib/metadata/site";
import { getPublicProfilePageData } from "@/lib/sharing/public-data";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = {
  params: Promise<{ username: string }>;
};

export default async function Image({ params }: Props) {
  const { username } = await params;
  const { profile, totalRecords } = await getPublicProfilePageData(username);

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

  const [fonts, avatarDataUrl] = await Promise.all([
    loadOgFonts(),
    fetchOgAvatarDataUrl(profile.avatar_url),
  ]);
  const displayName = truncateOgText(profile.display_name, 28);
  const usernameLabel = truncateOgText(profile.username, 32);
  const bioPreview = splitOgBioLines(profile.bio ?? "公開晩酌記録");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: 64,
          background: "linear-gradient(135deg, #fafafa 0%, #e4e4e7 100%)",
          color: "#18181b",
          fontFamily: OG_FONT_FAMILY,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 32,
            alignItems: "center",
            flexShrink: 0,
          }}
        >
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
            flex: 1,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 4,
          }}
        >
          {bioPreview.map((line, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                columnGap: 8,
                rowGap: 4,
                width: "100%",
                fontSize: 28,
                lineHeight: 1.5,
                color: "#3f3f46",
              }}
            >
              {splitOgBioLineSegments(line).map((segment, segmentIndex) => (
                <span key={segmentIndex} style={{ display: "flex" }}>
                  {segment}
                </span>
              ))}
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexShrink: 0,
            fontSize: 24,
            color: "#52525b",
          }}
        >
          <span>公開記録 {totalRecords} 件</span>
          <span>{siteName}</span>
        </div>
      </div>
    ),
    buildOgImageOptions(fonts, size),
  );
}
