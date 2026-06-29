import { ImageResponse } from "next/og";
import { getCategoryLabel } from "@/lib/constants/categories";
import { isFoodCategory } from "@/lib/constants/categories";
import {
  buildOgImageOptions,
  loadOgFonts,
  OG_FONT_FAMILY,
} from "@/lib/metadata/og-fonts";
import { truncateOgText } from "@/lib/metadata/og-image-utils";
import { siteName } from "@/lib/metadata/site";
import { createClient } from "@/lib/supabase/server";
import {
  fetchSharedPairRecords,
  fetchSharedRecord,
} from "@/lib/sharing/fetch-shared";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = {
  params: Promise<{ username: string; id: string }>;
};

export default async function Image({ params }: Props) {
  const { username, id } = await params;
  const supabase = await createClient();
  const record = await fetchSharedRecord(supabase, username, id);

  if (!record) {
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

  let pairLabel = "";
  if (record.pair_id) {
    const pairRecords = await fetchSharedPairRecords(
      supabase,
      username,
      record.pair_id,
      record.id,
    );
    const foods = pairRecords.filter((r) => isFoodCategory(r.category));
    if (foods.length > 0) {
      pairLabel = `合わせて: ${foods.map((f) => f.name).join("、")}`;
    }
  }

  const fonts = await loadOgFonts();
  const recordName = truncateOgText(record.name, 32);
  const producer = record.producer
    ? truncateOgText(record.producer, 48)
    : null;
  const pairLabelSanitized = pairLabel
    ? truncateOgText(pairLabel, 64)
    : "";
  const profileUsername = truncateOgText(record.profile_username, 24);
  const profileDisplayName = truncateOgText(record.profile_display_name, 24);
  const rating =
    record.rating !== null ? `★${record.rating}` : "評価なし";

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
          background: "linear-gradient(135deg, #18181b 0%, #3f3f46 100%)",
          color: "white",
          fontFamily: OG_FONT_FAMILY,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              alignSelf: "flex-start",
              padding: "8px 16px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.15)",
              fontSize: 24,
            }}
          >
            {getCategoryLabel(record.category)}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 56,
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            {recordName}
          </div>
          {producer ? (
            <div style={{ display: "flex", fontSize: 28, opacity: 0.85 }}>
              {producer}
            </div>
          ) : null}
          <div style={{ display: "flex", fontSize: 36, color: "#fbbf24" }}>
            {rating}
          </div>
          {pairLabelSanitized ? (
            <div style={{ display: "flex", fontSize: 26, opacity: 0.9 }}>
              {pairLabelSanitized}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 24,
            opacity: 0.9,
          }}
        >
          <span>
            @{profileUsername} · {profileDisplayName}
          </span>
          <span>{siteName}</span>
        </div>
      </div>
    ),
    buildOgImageOptions(fonts, size),
  );
}
