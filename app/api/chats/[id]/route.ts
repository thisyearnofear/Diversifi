import { auth } from "@/app/auth";
import { getChatById, getMessagesByChatId } from "@/lib/db/queries";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const session = await auth();
  const { id } = resolvedParams;

  try {
    const [chat, messages] = await Promise.all([
      getChatById({ id }),
      getMessagesByChatId({ id }),
    ]);

    if (!chat) {
      return new NextResponse("Chat not found", { status: 404 });
    }

    if (chat.visibility === "private") {
      if (!session?.user || session.user.id !== chat.userId) {
        return new NextResponse("Unauthorized", { status: 401 });
      }
    }

    return NextResponse.json({ ...chat, messages });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
