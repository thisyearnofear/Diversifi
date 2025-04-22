import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/app/auth";

export async function middleware(request: NextRequest) {
  try {
    // If this is a production build and we're in the build process, bypass auth
    if (process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'preview') {
      console.log('Bypassing auth check during build process');
      return NextResponse.next();
    }

    // Skip authentication for public routes
    const publicPaths = [
      "/api/auth/siwe",
      "/api/auth/nonce",
      "/api/auth/logout",
      "/api/actions/by-title",
      "/api/actions/user",
    ];

    // Check if the path is in the public paths list
    const isPublicPath = publicPaths.some((path) =>
      request.nextUrl.pathname === path ||
      request.nextUrl.pathname.startsWith(`${path}/`)
    );

    if (isPublicPath) {
      return NextResponse.next();
    }

    const session = await auth();

    if (!session?.user) {
      console.log('Unauthorized access attempt to:', request.nextUrl.pathname);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Authentication error in middleware:', error);
    // Allow the request to proceed to avoid blocking the site from loading
    // The API endpoints will handle their own auth checks
    return NextResponse.next();
  }
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    "/api/vote",
    "/api/history",
    "/api/files/upload",
    "/api/document",
    "/api/suggestions",
    // Excluding /api/chat to allow unauthenticated access
  ],
};
