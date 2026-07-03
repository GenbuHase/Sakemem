import { rewriteAtUsernameToProfilePath } from "@/lib/routing/public-profile-path";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function rewriteAtUsername(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;
  const profilePath = rewriteAtUsernameToProfilePath(pathname);

  if (!profilePath) {
    return null;
  }

  const url = request.nextUrl.clone();
  url.pathname = profilePath;
  const response = NextResponse.rewrite(url);
  response.headers.set("x-pathname", pathname);
  return response;
}

export async function updateSession(request: NextRequest) {
  const rewriteResponse = rewriteAtUsername(request);
  if (rewriteResponse) {
    return rewriteResponse;
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isProtectedPage =
    pathname.startsWith("/records") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/changelog");

  if (!user && isProtectedPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/records";
    return NextResponse.redirect(url);
  }

  if (user && pathname === "/onboarding/profile") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (profile) {
      const url = request.nextUrl.clone();
      url.pathname = "/settings/profile";
      return NextResponse.redirect(url);
    }
  }

  const response = supabaseResponse;
  response.headers.set("x-pathname", pathname);
  return response;
}
