export const runtime = "nodejs";
import { NextResponse, NextRequest } from "next/server";
import { GetUserRole } from "./lib/getUserRole";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const role = await GetUserRole();

  // 🔒 No logged-in user → redirect to home
  if (!role) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // ✅ Employer-only routes
  if (pathname.startsWith("/dashboard/employer") && role !== "employer") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // ✅ Seeker-only routes
  if (pathname.startsWith("/dashboard/seeker") && role !== "seeker") {
    return NextResponse.redirect(new URL("/", request.url));
  }


  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/employer/:path*",
    "/dashboard/seeker/:path*",
    
  ],
};
