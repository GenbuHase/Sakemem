export function getSiteUrl(): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL;
  if (!base) {
    throw new Error("NEXT_PUBLIC_SITE_URL is not set");
  }
  return base.replace(/\/$/, "");
}

export function buildRecordShareUrl(
  username: string,
  recordId: string,
): string {
  return `${getSiteUrl()}/@${username}/${recordId}`;
}

export function buildProfileUrl(username: string): string {
  return `${getSiteUrl()}/@${username}`;
}
