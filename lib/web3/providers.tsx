"use client";

import type { ReactNode } from "react";
import { SWRConfig } from "swr";
import dynamic from "next/dynamic";
import { AuthProvider } from "@/app/providers/auth-provider";

const Web3Provider = dynamic(
  () => import("@/app/providers/web3-provider").then((mod) => mod.Web3Provider),
  { ssr: false }
);

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        provider: () => new Map(),
        revalidateOnFocus: false,
      }}
    >
      <AuthProvider>
        <Web3Provider>{children}</Web3Provider>
      </AuthProvider>
    </SWRConfig>
  );
}
