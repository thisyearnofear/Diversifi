import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { scaleLinear } from "d3-scale";
// npm install react-simple-maps d3-scale
import {
  ComposableMap,
  Geographies,
  Geography,
  GeographyProps,
} from "react-simple-maps";

// region mapping for world map coloring
const regionToGeos: Record<string, string[]> = {
  Africa: [
    "DZA",
    "AGO",
    "BEN",
    "BWA",
    "BFA",
    "BDI",
    "CMR",
    "CPV",
    "CAF",
    "TCD",
    "COM",
    "COG",
    "CIV",
    "COD",
    "DJI",
    "EGY",
    "GNQ",
    "ERI",
    "SWZ",
    "ETH",
    "GAB",
    "GMB",
    "GHA",
    "GIN",
    "GNB",
    "KEN",
    "LSO",
    "LBR",
    "LBY",
    "MDG",
    "MWI",
    "MLI",
    "MRT",
    "MUS",
    "MAR",
    "MOZ",
    "NAM",
    "NER",
    "NGA",
    "RWA",
    "STP",
    "SEN",
    "SYC",
    "SLE",
    "SOM",
    "ZAF",
    "SSD",
    "SDN",
    "TGO",
    "TUN",
    "UGA",
    "TZA",
    "ZMB",
    "ZWE",
  ],
  Europe: [
    "ALB",
    "AND",
    "AUT",
    "BLR",
    "BEL",
    "BIH",
    "BGR",
    "HRV",
    "CYP",
    "CZE",
    "DNK",
    "EST",
    "FRO",
    "FIN",
    "FRA",
    "DEU",
    "GIB",
    "GRC",
    "GGY",
    "HUN",
    "ISL",
    "IRL",
    "IMN",
    "ITA",
    "JEY",
    "LVA",
    "LIE",
    "LTU",
    "LUX",
    "MLT",
    "MDA",
    "MCO",
    "MNE",
    "NLD",
    "MKD",
    "NOR",
    "POL",
    "PRT",
    "ROU",
    "RUS",
    "SMR",
    "SRB",
    "SVK",
    "SVN",
    "ESP",
    "SWE",
    "CHE",
    "UKR",
    "GBR",
    "VAT",
  ],
  USA: ["USA"],
  LatAm: [
    "ARG",
    "BOL",
    "BRA",
    "CHL",
    "COL",
    "ECU",
    "FLK",
    "GUF",
    "GUY",
    "PRY",
    "PER",
    "SUR",
    "URY",
    "VEN",
    "BLZ",
    "CRI",
    "SLV",
    "GTM",
    "HND",
    "MEX",
    "NIC",
    "PAN",
    "BES",
    "CUW",
    "DMA",
    "DOM",
    "GRD",
    "GLP",
    "GTM",
    "HTI",
    "JAM",
    "MTQ",
    "PRI",
    "KNA",
    "LCA",
    "VCT",
    "TTO",
    "TCA",
    "VGB",
    "VIR",
  ],
  Asia: [
    "AFG",
    "ARM",
    "AZE",
    "BHR",
    "BGD",
    "BTN",
    "BRN",
    "KHM",
    "CHN",
    "HKG",
    "IND",
    "IDN",
    "IRN",
    "IRQ",
    "ISR",
    "JPN",
    "JOR",
    "KAZ",
    "KWT",
    "KGZ",
    "LAO",
    "LBN",
    "MAC",
    "MYS",
    "MDV",
    "MNG",
    "MMR",
    "NPL",
    "PRK",
    "OMN",
    "PAK",
    "PSE",
    "PHL",
    "QAT",
    "SAU",
    "SGP",
    "KOR",
    "LKA",
    "SYR",
    "TWN",
    "TJK",
    "THA",
    "TLS",
    "TUR",
    "TKM",
    "ARE",
    "UZB",
    "VNM",
    "YEM",
  ],
  RWA: [], // left empty for now, could map to countries as 'Other'
};

// D3 scale for heat coloring based on allocation (0 = none, 1 = max)
const colorScale = scaleLinear<string>()
  .domain([0, 0.6, 1])
  .range(["#ececec", "#a5b4fc", "#4338ca"]); // light to strong indigo

/**
 * Calculates Herfindahl-Hirschman Index
 * @param {number[]} weights - Array of portfolio weight fractions per region (sum to 1).
 * @returns {number}
 */
function calcHHI(weights: number[]): number {
  return weights.reduce((sum, w) => sum + Math.pow(w, 2), 0);
}

/**
 * Calculates Shannon entropy
 * @param {number[]} weights - Array of portfolio weight fractions per region.
 * @returns {number}
 */
function calcShannonEntropy(weights: number[]): number {
  return -weights.reduce((sum, w) => (w > 0 ? sum + w * Math.log(w) : sum), 0);
}

/**
 * Calculates geographic spread ratio
 * @param {number[]} weights - Array of portfolio weight fractions per region.
 * @returns {number} - Fraction of regions with non-zero weight.
 */
function calcGeographicSpread(weights: number[]): number {
  const nonZeroRegions = weights.filter((w) => w > 0).length;
  return weights.length > 0 ? nonZeroRegions / weights.length : 0;
}

interface DiversifiVisualizerProps {
  regionAllocations: Record<string, number>; // e.g. { Africa: 0.2, Europe: 0.5, USA: 0.3 }
}

// Use a public TopoJSON world map file for react-simple-maps
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export const DiversifiVisualizer: React.FC<DiversifiVisualizerProps> = ({
  regionAllocations,
}) => {
  const regionLabels = Object.keys(regionAllocations);
  const regionWeights = regionLabels.map((k) => regionAllocations[k]);
  const total = regionWeights.reduce((a, b) => a + b, 0) || 1;
  const weights = regionWeights.map((w) => w / total);

  const hhi = calcHHI(weights);
  const entropy = calcShannonEntropy(weights);
  const spread = calcGeographicSpread(weights);

  // For world map: create a lookup by ISO_A3 code to allocation value
  const countryAllocations: Record<string, number> = {};
  regionLabels.forEach((region, idx) => {
    const isoList = regionToGeos[region];
    if (isoList) {
      isoList.forEach((country) => {
        countryAllocations[country] = weights[idx];
      });
    }
  });

  // Custom recommendation as before
  const mainRegionIdx = weights.indexOf(Math.max(...weights));
  const mainRegion = regionLabels[mainRegionIdx];
  const mainPct = Math.round(weights[mainRegionIdx] * 100);

  return (
    <div className="flex flex-col items-center gap-8 py-12">
      {/* Interactive Flat World Map Heatmap */}
      <div className="w-full max-w-2xl mx-auto">
        <ComposableMap
          projection="geoEqualEarth"
          width={430}
          height={230}
          style={{ width: "100%", height: "auto" }}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }: { geographies: Array<any> }) =>
              geographies.map((geo: any) => {
                // Use country ISO_A3 to look up allocation/weight
                const allocation = countryAllocations[geo.id] || 0;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={allocation > 0 ? colorScale(allocation) : "#e5e7eb"}
                    stroke="#312e81"
                    strokeWidth={0.35}
                    style={
                      {
                        default: { outline: "none" },
                        hover: { opacity: 0.8, filter: "brightness(1.2)" },
                        pressed: { outline: "none" },
                      } as GeographyProps["style"]
                    }
                  >
                    <title>
                      {geo.properties.name}{" "}
                      {allocation > 0
                        ? `• ${Math.round(allocation * 100)}%`
                        : ""}
                    </title>
                  </Geography>
                );
              })
            }
          </Geographies>
        </ComposableMap>
        <div className="w-full text-center text-sm text-indigo-900 dark:text-white/70 mt-2">
          Portfolio Global Heatmap (by allocation per region)
        </div>
      </div>

      {/* Diversification Metrics with Tooltips */}
      <div className="w-full max-w-xl flex flex-col items-center gap-4">
        <h3 className="text-lg font-semibold">Diversification Scores</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center p-4 border rounded-lg bg-violet-50 dark:bg-violet-900/20 cursor-help">
                  <span className="font-medium">
                    Herfindahl-Hirschman Index
                  </span>
                  <span className="text-2xl font-mono font-bold">
                    {hhi.toFixed(2)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Lower = More Diversified
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="text-xs max-w-[200px] text-center"
              >
                This score measures concentration: 1 means entirely in one
                region, lower is better (1/N is ideal).
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center p-4 border rounded-lg bg-violet-50 dark:bg-violet-900/20 cursor-help">
                  <span className="font-medium">Shannon Entropy</span>
                  <span className="text-2xl font-mono font-bold">
                    {entropy.toFixed(2)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Higher = More Diverse
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="text-xs max-w-[200px] text-center"
              >
                Shannon entropy captures information diversity: higher values
                reflect more evenly split portfolios.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center p-4 border rounded-lg bg-indigo-50 dark:bg-indigo-900/20 cursor-help">
                  <span className="font-medium">Geographic Spread Ratio</span>
                  <span className="text-2xl font-mono font-bold">
                    {(spread * 100).toFixed(0)}%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Regions Used / Total
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="text-xs max-w-[200px] text-center"
              >
                What fraction of regions contain any of your funds? 100% means
                you have balances in all covered regions.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center p-4 border rounded-lg bg-indigo-50 dark:bg-indigo-900/20 cursor-help">
                  <span className="font-medium">Custom Recommendation</span>
                  <span className="text-base text-center">
                    {mainPct >= 80
                      ? `Your portfolio is heavily concentrated in ${mainRegion} (${mainPct}%). Consider allocating more to other regions.`
                      : `Diversified across ${regionLabels.length} regions. Good job!`}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="text-xs max-w-[200px] text-center"
              >
                An actionable summary of your current portfolio composition.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};
