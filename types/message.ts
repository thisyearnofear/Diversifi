import { Message as AIMessage } from "ai";
import { UserAction } from "@/lib/utils/message-helpers";

export interface Message extends AIMessage {
  userActions?: UserAction[];
}
