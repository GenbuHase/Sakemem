type ClientAuthStatus = "loading" | "authenticated" | "anonymous";

export function getClientAuthRedirect(
  status: ClientAuthStatus,
  pathname: string,
): string | null {
  if (status !== "anonymous") return null;

  const safePathname =
    pathname.startsWith("/") && !pathname.startsWith("//")
      ? pathname
      : "/records";
  return `/login?next=${encodeURIComponent(safePathname)}`;
}
