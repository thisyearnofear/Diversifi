import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, stringToHex } from "viem";
import { mainnet, base, optimism, celo, polygon } from "viem/chains";
import { auth } from "@/app/auth";

// Default contract address for Divvi Registry
const DEFAULT_CONTRACT_ADDRESS = "0xBa9655677f4E42DD289F5b7888170bC0c7dA8Cdc";

// Helper function to get the correct protocol ID for each chain
function getProtocolId(chain: string): string {
  switch (chain.toLowerCase()) {
    case "base":
      return "aerodrome";
    case "optimism":
      return "velodrome";
    case "celo":
      return "celo";
    case "polygon":
      return "allbridge";
    default:
      return chain.toLowerCase();
  }
}

// ABI for the Divvi Registry contract
const DIVVI_REGISTRY_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "userAddress", "type": "address"},
      {"internalType": "bytes32[]", "name": "protocolIds", "type": "bytes32[]"}
    ],
    "name": "isUserRegistered",
    "outputs": [{"internalType": "bool[]", "name": "", "type": "bool[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    inputs: [
      { name: "user", type: "address" }
    ],
    name: "isRegistered",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  }
];

/**
 * POST handler for checking Divvi registration status
 * @param req Request object
 * @returns Response object
 */
// GET handler for checking registration status
export async function GET(req: NextRequest) {
  try {
    // Get the address and chain from the query parameters
    const searchParams = req.nextUrl.searchParams;
    const address = searchParams.get('address');
    const chain = searchParams.get('chain');
    const contractAddress = searchParams.get('contractAddress') || DEFAULT_CONTRACT_ADDRESS;

    if (!address) {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      );
    }

    if (!chain) {
      return NextResponse.json(
        { error: "Chain is required" },
        { status: 400 }
      );
    }

    // Get the user from the session
    const session = await auth();

    // Create a public client for the specified chain
    let chainConfig;
    switch (chain.toLowerCase()) {
      case "base":
        chainConfig = base;
        break;
      case "optimism":
        chainConfig = optimism;
        break;
      case "celo":
        chainConfig = celo;
        break;
      case "polygon":
        chainConfig = polygon;
        break;
      default:
        chainConfig = mainnet;
    }

    const publicClient = createPublicClient({
      chain: chainConfig,
      transport: http(),
    });

    // Check if the user is registered with Divvi
    let isRegistered = false;

    try {
      // Try the new contract ABI first
      const result = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: DIVVI_REGISTRY_ABI,
        functionName: "isUserRegistered",
        args: [
          address as `0x${string}`,
          [stringToHex(getProtocolId(chain), { size: 32 })]
        ],
      });

      // The result is an array of booleans, one for each protocol
      if (Array.isArray(result) && result.length > 0) {
        isRegistered = result[0];
      }
      console.log(`Registration status using new ABI: ${isRegistered}`);
    } catch (error) {
      console.error("Error checking registration with new ABI:", error);

      // If the new ABI fails, try the old ABI
      try {
        const result = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: DIVVI_REGISTRY_ABI,
          functionName: "isRegistered",
          args: [address as `0x${string}`],
        });

        isRegistered = result as boolean;
        console.log(`Registration status using old ABI: ${isRegistered}`);
      } catch (oldError) {
        console.error("Error checking registration with old ABI:", oldError);
      }
    }

    return NextResponse.json({ isRegistered });
  } catch (error) {
    console.error("Error checking registration status:", error);
    return NextResponse.json(
      { error: "Failed to check registration status" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get the address and chain from the request body
    const { address, chain, contractAddress } = await req.json();

    if (!address) {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      );
    }

    if (!chain) {
      return NextResponse.json(
        { error: "Chain is required" },
        { status: 400 }
      );
    }

    if (!contractAddress) {
      return NextResponse.json(
        { error: "Contract address is required" },
        { status: 400 }
      );
    }

    // Get the user from the session
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to check registration status" },
        { status: 401 }
      );
    }

    // Determine which chain to use
    let selectedChain;
    switch (chain) {
      case "ETHEREUM":
        selectedChain = mainnet;
        break;
      case "BASE":
        selectedChain = base;
        break;
      case "OPTIMISM":
        selectedChain = optimism;
        break;
      case "CELO":
        selectedChain = celo;
        break;
      case "POLYGON":
        selectedChain = polygon;
        break;
      default:
        return NextResponse.json(
          { error: "Unsupported chain" },
          { status: 400 }
        );
    }

    // Create a public client for the selected chain
    let transport;
    if (chain === "POLYGON" && process.env.NEXT_PUBLIC_POLYGON_RPC) {
      transport = http(process.env.NEXT_PUBLIC_POLYGON_RPC);
    } else if (chain === "BASE" && process.env.NEXT_PUBLIC_BASE_RPC) {
      transport = http(process.env.NEXT_PUBLIC_BASE_RPC);
    } else if (chain === "OPTIMISM" && process.env.NEXT_PUBLIC_OPTIMISM_RPC) {
      transport = http(process.env.NEXT_PUBLIC_OPTIMISM_RPC);
    } else if (chain === "CELO" && process.env.NEXT_PUBLIC_CELO_RPC) {
      transport = http(process.env.NEXT_PUBLIC_CELO_RPC);
    } else if (chain === "ETHEREUM" && process.env.NEXT_PUBLIC_ETHEREUM_RPC) {
      transport = http(process.env.NEXT_PUBLIC_ETHEREUM_RPC);
    } else {
      transport = http();
    }

    const publicClient = createPublicClient({
      chain: selectedChain,
      transport,
    });

    // Check if the user is registered with Divvi
    let isRegistered = false;

    try {
      // Try the new contract ABI first
      const result = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: DIVVI_REGISTRY_ABI,
        functionName: "isUserRegistered",
        args: [
          address as `0x${string}`,
          [stringToHex(getProtocolId(chain), { size: 32 })]
        ],
      });

      // The result is an array of booleans, one for each protocol
      if (Array.isArray(result) && result.length > 0) {
        isRegistered = result[0];
      }
      console.log(`Registration status using new ABI: ${isRegistered}`);
    } catch (error) {
      console.error(`Error checking registration with new ABI: ${error}`);

      try {
        // Fallback to the old contract ABI
        const result = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: DIVVI_REGISTRY_ABI,
          functionName: "isRegistered",
          args: [address as `0x${string}`],
        });

        isRegistered = result as boolean;
        console.log(`Registration status using old ABI: ${isRegistered}`);
      } catch (fallbackError) {
        console.error(`Error checking registration with fallback ABI: ${fallbackError}`);
      }
    }

    return NextResponse.json({
      isRegistered,
    });
  } catch (error) {
    console.error("Error checking Divvi registration status:", error);
    return NextResponse.json(
      { error: "Failed to check registration status" },
      { status: 500 }
    );
  }
}
