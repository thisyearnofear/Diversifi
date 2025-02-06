import { tool } from "ai";
import { z } from "zod";
import {
  saveUserInformation as saveUserInfoToDb,
  getUserInformation as getUserInfoFromDb,
  deleteUserInformation as deleteUserInfoFromDb,
} from "@/lib/db/queries";
import { Session } from "next-auth";

interface UserInformationProps {
  session: Session;
}

export const saveUserInformation = ({ session }: UserInformationProps) =>
  tool({
    description:
      "Save information about a user like their interests, actions, or goals - make sure to provide content with more detailed description of the information",
    parameters: z.object({
      type: z.enum(["ACTION", "INTEREST", "GOAL"]),
      content: z
        .string()
        .describe("More detailed description about the user information"),
    }),
    execute: async ({ type, content }) => {
      if (!session.user?.id) {
        return {
          error: "User not authenticated",
        };
      }

      await saveUserInfoToDb({
        userId: session.user.id,
        type,
        content,
      });

      return {
        success: true,
        message: `Saved user ${type.toLowerCase()} information successfully`,
        type,
        content,
      };
    },
  });

export const getUserInformation = ({ session }: UserInformationProps) =>
  tool({
    description:
      "Get all stored information about a user including their interests, actions, and goals",
    parameters: z.object({}), // No parameters needed since we use the session
    execute: async () => {
      if (!session.user?.id) {
        return {
          error: "User not authenticated",
        };
      }

      const userInfo = await getUserInfoFromDb(session.user.id);

      return {
        interests: userInfo.filter((info) => info.type === "INTEREST"),
        actions: userInfo.filter((info) => info.type === "ACTION"),
        goals: userInfo.filter((info) => info.type === "GOAL"),
      };
    },
  });

export const deleteUserInformationTool = ({ session }: UserInformationProps) =>
  tool({
    description: "Delete a specific piece of user information by its ID",
    parameters: z.object({
      id: z.string().describe("The ID of the user information to delete"),
    }),
    execute: async ({ id }) => {
      if (!session.user?.id) {
        return {
          error: "User not authenticated",
        };
      }

      await deleteUserInfoFromDb(id);

      return {
        success: true,
        message: "User information deleted successfully",
        id,
      };
    },
  });
