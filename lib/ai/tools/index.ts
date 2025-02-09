import type { Session } from "next-auth";
import type { DataStreamWriter } from "ai";
import { createDocument } from "./create-document";
import { updateDocument } from "./update-document";
import { requestSuggestions } from "./request-suggestions";
import {
  saveUserInformation,
  getUserInformation,
  deleteUserInformationTool,
} from "./user-information";
import { agentKitToTools } from "@/lib/web3/agentkit/framework-extensions/ai-sdk";
import type { AgentKit } from "@coinbase/agentkit";

export const setupTools = async ({
  session,
  dataStream,
  agentKit,
}: {
  session: Session;
  dataStream: DataStreamWriter;
  agentKit: AgentKit;
}) => {
  const baseTools = agentKitToTools(agentKit);

  return {
    ...baseTools,
    createDocument: createDocument({ session, dataStream }),
    updateDocument: updateDocument({ session, dataStream }),
    requestSuggestions: requestSuggestions({
      session,
      dataStream,
    }),
    saveUserInformation: saveUserInformation({ session }),
    getUserInformation: getUserInformation({ session }),
    deleteUserInformation: deleteUserInformationTool({ session }),
  };
};
