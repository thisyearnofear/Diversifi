// Region colors for visualization
export const REGION_COLORS = {
  USA: "#4299E1", // blue
  Europe: "#48BB78", // green
  LatAm: "#F6AD55", // orange
  Africa: "#F56565", // red
  Asia: "#9F7AEA", // purple
};

// Available tokens
export const AVAILABLE_TOKENS = [
  { symbol: "CUSD", name: "Celo Dollar", region: "USA" },
  { symbol: "CEUR", name: "Celo Euro", region: "Europe" },
  { symbol: "CREAL", name: "Celo Brazilian Real", region: "LatAm" },
  { symbol: "CKES", name: "Celo Kenyan Shilling", region: "Africa" },
  { symbol: "CCOP", name: "Celo Colombian Peso", region: "LatAm" },
  { symbol: "PUSO", name: "Philippine Peso", region: "Asia" },
  { symbol: "CGHS", name: "Celo Ghana Cedi", region: "Africa" },
  { symbol: "EXOF", name: "CFA Franc", region: "Africa" },
];

// Mock data for region visualization (used as initial state)
export const MOCK_REGION_DATA = [
  { region: "USA", value: 25, color: REGION_COLORS.USA },
  { region: "Europe", value: 22, color: REGION_COLORS.Europe },
  { region: "LatAm", value: 18, color: REGION_COLORS.LatAm },
  { region: "Africa", value: 26, color: REGION_COLORS.Africa },
  { region: "Asia", value: 9, color: REGION_COLORS.Asia },
];
