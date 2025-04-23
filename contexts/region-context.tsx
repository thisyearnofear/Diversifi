"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type Region =
  | "Africa"
  | "Europe"
  | "USA"
  | "LatAm"
  | "Asia"
  | "RWA"
  | "All";

interface RegionContextType {
  selectedRegion: Region;
  setSelectedRegion: (region: Region) => void;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

export function RegionProvider({ children }: { children: ReactNode }) {
  const [selectedRegion, setSelectedRegion] = useState<Region>("All");

  // Wrap setSelectedRegion to add logging
  const setRegionWithLogging = (region: Region) => {
    console.log("Setting region to:", region);
    setSelectedRegion(region);
  };

  return (
    <RegionContext.Provider
      value={{ selectedRegion, setSelectedRegion: setRegionWithLogging }}
    >
      {children}
    </RegionContext.Provider>
  );
}

export function useRegion() {
  const context = useContext(RegionContext);
  if (context === undefined) {
    throw new Error("useRegion must be used within a RegionProvider");
  }
  return context;
}
