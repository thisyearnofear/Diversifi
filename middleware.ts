import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/app/auth";

export async function middleware(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
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
