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
import { createSession, decrypt, SessionPayload } from "@/lib/auth/session";

const chain = process.env.PRIMARY_CHAIN === "base" ? base : baseSepolia;
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
    const cookieStore = await cookies();
    const nonce = cookieStore.get("nonce");
    if (!nonce) {
      return { status: "failed" };
    }
    const parsedMessage = parseSiweMessage(message);
    if (!parsedMessage.address) {
      return { status: "failed" };
    }
    const verified = await verifySiweMessage(publicClient, {
      message,
      signature,
    });
    if (!verified) {
      return { status: "failed" };
    }

    createSession(parsedMessage.address);

    return { status: "success" };
  } catch (error) {
    console.error("Error verifying SIWE:", error);
    return { status: "failed" };
  }
};

export const auth = async () => {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  if (!session) {
    return { user: undefined, expires: "" };
  }

  const payload = await decrypt(session.value);
  if (!payload || !isSessionPayload(payload)) {
    return { user: undefined, expires: "" };
  }

  if (new Date(payload.expires) < new Date()) {
    await logout();
    return { user: undefined, expires: "" };
  }

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
