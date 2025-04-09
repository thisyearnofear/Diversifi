"use server";

import { cookies } from "next/headers";

import { createPublicClient, http } from "viem";
import { base, baseSepolia } from "viem/chains";

import {
  createSiweMessage,
  verifySiweMessage,
  generateSiweNonce,
  parseSiweMessage,
} from "viem/siwe";
import {
  createSession,
  decrypt,
  type SessionPayload,
} from "@/lib/auth/session";

const chain =
  process.env.NEXT_PUBLIC_ACTIVE_CHAIN === "base" ? base : baseSepolia;
const domain = process.env.NEXT_PUBLIC_APP_URL || "localhost:3000";
const uri = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const generateSiweChallenge = async (address: `0x${string}`) => {
  const nonce = generateSiweNonce();
  const cookieStore = await cookies();
  cookieStore.set("nonce", nonce);
  const message = createSiweMessage({
    nonce,
    address,
    domain,
    uri,
    version: "1",
    chainId: chain.id,
  });
  return message;
};

const publicClient = createPublicClient({
  chain,
  transport: http(),
});

export const verifySiwe = async (message: string, signature: `0x${string}`) => {
  try {
    console.log("Verifying SIWE message:", {
      message,
      signature: signature.slice(0, 10) + "...",
    });

    const cookieStore = await cookies();
    const nonce = cookieStore.get("nonce");
    if (!nonce) {
      console.error("SIWE verification failed: No nonce found in cookies");
      return { status: "failed", error: "No nonce found" };
    }

    const parsedMessage = parseSiweMessage(message);
    console.log("Parsed SIWE message:", parsedMessage);

    if (!parsedMessage.address) {
      console.error("SIWE verification failed: No address in parsed message");
      return { status: "failed", error: "No address in message" };
    }

    try {
      const verified = await verifySiweMessage(publicClient, {
        message,
        signature,
      });

      console.log("SIWE verification result:", verified);

      if (!verified) {
        console.error(
          "SIWE verification failed: Signature verification failed"
        );
        return { status: "failed", error: "Signature verification failed" };
      }

      // Create session and explicitly set cookie
      await createSession(parsedMessage.address);
      console.log("Session created for address:", parsedMessage.address);

      return { status: "success", address: parsedMessage.address };
    } catch (verifyError) {
      console.error("SIWE verification error:", verifyError);
      const errorMessage =
        verifyError instanceof Error ? verifyError.message : "Unknown error";
      return { status: "failed", error: "Verification error: " + errorMessage };
    }
  } catch (error) {
    console.error("Error verifying SIWE:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return { status: "failed", error: "General error: " + errorMessage };
  }
};

export const auth = async () => {
  console.log("Checking authentication state...");
  const cookieStore = await cookies();
  const session = cookieStore.get("session");

  if (!session) {
    console.log("No session cookie found");
    return { user: undefined, expires: "" };
  }

  console.log("Session cookie found, decrypting...");
  const payload = await decrypt(session.value);

  if (!payload || !isSessionPayload(payload)) {
    console.log("Invalid session payload:", payload);
    return { user: undefined, expires: "" };
  }

  if (new Date(payload.expires) < new Date()) {
    console.log("Session expired, logging out");
    await logout();
    return { user: undefined, expires: "" };
  }

  console.log("Valid session found for user:", payload.user.id);
  return payload;
};

function isSessionPayload(payload: any): payload is SessionPayload {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "user" in payload &&
    typeof payload.user === "object" &&
    "id" in payload.user &&
    typeof payload.user.id === "string" &&
    "expires" in payload &&
    typeof payload.expires === "string"
  );
}

export const logout = async () => {
  const cookieStore = await cookies();
  cookieStore.delete("session");
};
