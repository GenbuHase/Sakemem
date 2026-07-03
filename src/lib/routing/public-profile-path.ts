export function isPublicProfilePath(pathname: string): boolean {
  return pathname.startsWith("/profile") || pathname.startsWith("/@");
}

/** `/@username` およびその配下（opengraph-image 等）を内部の `/profile/...` へ変換する */
export function rewriteAtUsernameToProfilePath(pathname: string): string | null {
  const match = pathname.match(/^\/@([^/]+)(\/.*)?$/);
  if (!match) {
    return null;
  }

  return `/profile/${match[1]}${match[2] ?? ""}`;
}

export function parseProfileUsername(pathname: string): string | null {
  const atProfile = pathname.match(/^\/@([^/]+)$/);
  if (atProfile) {
    return atProfile[1];
  }

  const atRecord = pathname.match(/^\/@([^/]+)\//);
  if (atRecord) {
    return atRecord[1];
  }

  const profilePage = pathname.match(/^\/profile\/([^/]+)/);
  if (profilePage) {
    return profilePage[1];
  }

  return null;
}

export function isPublicProfilePage(pathname: string): boolean {
  return (
    /^\/@[^/]+$/.test(pathname) || /^\/profile\/[^/]+$/.test(pathname)
  );
}
