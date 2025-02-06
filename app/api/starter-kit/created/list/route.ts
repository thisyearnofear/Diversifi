import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { getCreatedStarterKits } from "@/lib/db/queries";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const kits = await getCreatedStarterKits(session.user.id);
    return NextResponse.json(kits);
  } catch (error) {
    console.error("Failed to list created starter kits:", error);
    return NextResponse.json(
      { error: "Failed to list created starter kits" },
      { status: 500 }
    );
  }
}
