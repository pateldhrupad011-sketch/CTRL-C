import { type NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, readToken } from "@/lib/session-token";

/**
 * First gate for /admin: signed-out visitors go to the login page.
 * Pages, actions and the export route still check the session themselves.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLogin = pathname === "/admin/login";
  const signedIn = !!readToken(request.cookies.get(SESSION_COOKIE)?.value);

  let response: NextResponse;
  if (!signedIn && !isLogin) response = NextResponse.redirect(new URL("/admin/login", request.url));
  else if (signedIn && isLogin) response = NextResponse.redirect(new URL("/admin", request.url));
  else response = NextResponse.next();

  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
