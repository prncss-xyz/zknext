import { NextResponse, NextRequest } from "next/server";

function shouldBlock(request: NextRequest) {
  const host = request.headers.get("host");
  if (host?.startsWith("localhost:")) return false;
  const { pathname } = new URL(request.url);
  if (pathname.startsWith("/_next/static/")) return false;
  if (["/", "/favicon.ico", "/denied"].includes(pathname)) return false;
  return true;
}

export function middleware(request: NextRequest) {
  if (process.env.ZKNEXT_DEMO !== "ZKNEXT_DEMO" && shouldBlock(request))
    return NextResponse.redirect(new URL("/denied", request.url));
}

export const config = {
  matcher: "/:path*",
};
