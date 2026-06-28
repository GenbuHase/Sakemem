import type { PublicProfile } from "@/lib/profiles/types";
import { siteName } from "./site";

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

export function buildPublicProfileTitle(profile: Pick<PublicProfile, "display_name">): string {
  return `${profile.display_name} | ${siteName}`;
}

export function buildPublicProfileDescription(
  profile: Pick<PublicProfile, "bio" | "username">,
  recordCount: number,
): string {
  if (profile.bio) {
    return truncate(profile.bio, 120);
  }
  return `@${profile.username} の公開晩酌記録（${recordCount}件）`;
}

export function buildPublicProfileMetadataInput(
  profile: PublicProfile,
  recordCount: number,
) {
  return {
    title: buildPublicProfileTitle(profile),
    description: buildPublicProfileDescription(profile, recordCount),
    path: `/@${profile.username}`,
    robots: { index: true, follow: true } as const,
  };
}
