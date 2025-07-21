import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // TODO: Uncomment this entire function when backend authentication is ready
  // For now, allow all requests to pass through for UI exploration

  return NextResponse.next();

  // const { pathname } = request.nextUrl

  // // Skip middleware for API routes and static files
  // if (pathname.startsWith("/api/") || pathname.startsWith("/_next/") || pathname.includes(".")) {
  //   return NextResponse.next()
  // }

  // // Allow access to login page
  // if (pathname === "/login") {
  //   return NextResponse.next()
  // }

  // // Check for authentication token
  // const token =
  //   request.cookies.get("space_optimizer_token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

  // // Redirect to login if no token
  // if (!token && pathname !== "/login") {
  //   return NextResponse.redirect(new URL("/login", request.url))
  // }

  // return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
