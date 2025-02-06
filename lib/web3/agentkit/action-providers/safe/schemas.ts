import { z } from "zod";

/**
 * Input schema for create safe action.
 */
export const CreateSafeSchema = z
  .object({
    owners: z
      .array(z.string())
      .describe("The addresses of the owners of the safe"),
    threshold: z
      .number()
      .describe("The minimum number of owners required to confirm a transaction"),
  })
  .strip()
  .describe("Instructions for creating a safe (multisig wallet)");
