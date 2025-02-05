import { generateSiweChallenge } from "@/app/auth-actions";

export async function POST(request: Request) {
  const { address } = await request.json();

  if (!address) {
    return new Response("Address is required", { status: 400 });
  }

  try {
    const message = await generateSiweChallenge(address as `0x${string}`);
    return new Response(JSON.stringify({ message }));
  } catch (error) {
    return new Response("Failed to generate challenge", { status: 400 });
  }
}
