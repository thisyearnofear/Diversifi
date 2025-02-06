import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { claimStarterKit } from "@/lib/db/queries";

export async function POST(
  request: Request,
  { params }: { params: { kitId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await claimStarterKit({
      kitId: params.kitId,
      userId: session.user.id,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to claim starter kit:", error);
    return NextResponse.json(
      { error: "Failed to claim starter kit" },
      { status: 500 }
    );
  }
}
