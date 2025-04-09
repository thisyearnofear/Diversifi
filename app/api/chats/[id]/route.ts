import { auth } from "@/app/auth";
import { getChatById, getMessagesByChatId } from "@/lib/db/queries";
import { NextResponse } from "next/server";

export async function GET(request: Request, context: any) {
  console.log("GET /api/chats/[id] - Checking authentication...");
  const params = context.params;
  const { id } = params;
  const session = await auth();

  try {
    if (!session?.user?.id) {
      console.log("GET /api/chats/[id] - Unauthorized: No session or user ID");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    console.log("GET /api/chats/[id] - Authenticated user:", session.user.id);
    console.log("GET /api/chats/[id] - Fetching chat:", id);

    const [chat, messages] = await Promise.all([
      getChatById({ id }),
      getMessagesByChatId({ id }),
    ]);

    if (!chat) {
      console.log("GET /api/chats/[id] - Chat not found:", id);
      return new NextResponse("Chat not found", { status: 404 });
    }

    if (chat.visibility === "private") {
      if (session.user.id !== chat.userId) {
        console.log(
          "GET /api/chats/[id] - Unauthorized: Chat belongs to different user"
        );
        console.log(
          "Chat user ID:",
          chat.userId,
          "Session user ID:",
          session.user.id
        );
        return new NextResponse("Unauthorized", { status: 401 });
      }
    }

    console.log("GET /api/chats/[id] - Returning chat data");
    return NextResponse.json({ ...chat, messages });
  } catch (error) {
    console.error("GET /api/chats/[id] - Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
