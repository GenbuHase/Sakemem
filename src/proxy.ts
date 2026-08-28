import { NextResponse, type NextRequest } from "next/server";
import { rewriteAtUsernameToProfilePath } from "@/lib/routing/public-profile-path";

export function proxy(request: NextRequest) {
  const profilePath = rewriteAtUsernameToProfilePath(request.nextUrl.pathname);
  if (!profilePath) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = profilePath;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: "/@:username/:path*",
};
