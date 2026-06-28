export function getSiteUrl(): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL;
  if (base) {
    return base.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "http://localhost:3000";
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
