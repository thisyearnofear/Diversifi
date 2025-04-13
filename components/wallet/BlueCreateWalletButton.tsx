"use client";

import React, { useCallback } from "react";
import { useConnect } from "wagmi";
import { CoinbaseWalletLogo } from "./CoinbaseWalletLogo";
import { toast } from "sonner";

const buttonStyles = {
  background: "transparent",
  border: "1px solid transparent",
  boxSizing: "border-box" as const,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: 200,
  fontFamily: "Arial, sans-serif",
  fontWeight: "bold",
  fontSize: 18,
  backgroundColor: "#0052FF",
  paddingLeft: 15,
  paddingRight: 30,
  borderRadius: 10,
  color: "white",
  height: 48,
  cursor: "pointer",
};

export function BlueCreateWalletButton() {
  const { connectors, connect } = useConnect();

  // Function to clean up WalletConnect sessions
  const cleanupWalletConnectSessions = useCallback(() => {
    try {
      // Clear any stored WalletConnect sessions from localStorage
      Object.keys(localStorage).forEach((key) => {
        if (
          key.startsWith("wc@2:") ||
          key.startsWith("wagmi.") ||
          key.startsWith("walletconnect:")
        ) {
          console.log(`Cleaning up WalletConnect session: ${key}`);
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error("Error cleaning up WalletConnect sessions:", error);
    }
  }, []);

  const createWallet = useCallback(() => {
    try {
      // Clean up any existing WalletConnect sessions before connecting
      cleanupWalletConnectSessions();

      console.log(
        "Available connectors:",
        connectors.map((c) => c.id)
      );
      const coinbaseWalletConnector = connectors.find(
        (connector) => connector.id === "coinbaseWalletSDK"
      );

      if (coinbaseWalletConnector) {
        console.log("Found Coinbase Wallet connector, connecting...");
        connect({ connector: coinbaseWalletConnector });
        toast.success("Connecting to Coinbase Wallet...");
      } else {
        console.error("Coinbase Wallet connector not found");
        toast.error("Coinbase Wallet connector not found");
      }
    } catch (error) {
      console.error("Error connecting to Coinbase Wallet:", error);
      toast.error("Error connecting to Coinbase Wallet");
    }
  }, [connectors, connect, cleanupWalletConnectSessions]);

  return (
    <button style={buttonStyles} onClick={createWallet}>
      <CoinbaseWalletLogo />
      <span style={{ marginLeft: 10 }}>Create Wallet</span>
    </button>
  );
}
