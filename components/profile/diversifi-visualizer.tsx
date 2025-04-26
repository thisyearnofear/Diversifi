import React, { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { scaleLinear } from "d3-scale";
import { cn } from "@/lib/utils";
import { Info, PieChart } from "lucide-react";
import * as d3 from "d3";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Define our regions and their colors
const REGIONS = [
  {
    id: "Africa",
    name: "Africa",
    color: "#10b981", // green-500
    darkColor: "#059669", // green-600
    position: { x: 150, y: 150 },
    tokens: ["cUSD", "cEUR", "USDT"],
  },
  {
    id: "Europe",
    name: "Europe",
    color: "#3b82f6", // blue-500
    darkColor: "#2563eb", // blue-600
    position: { x: 230, y: 100 },
    tokens: ["EURT", "EURS", "PAR", "agEUR", "EURe"],
  },
  {
    id: "USA",
    name: "USA",
    color: "#ef4444", // red-500
    darkColor: "#dc2626", // red-600
    position: { x: 100, y: 100 },
    tokens: ["USDC", "USDT", "BUSD", "TUSD", "USDe"],
  },
  {
    id: "LatAm",
    name: "Latin America",
    color: "#f59e0b", // amber-500
    darkColor: "#d97706", // amber-600
    position: { x: 120, y: 170 },
    tokens: ["USDT", "BRZ", "USDP", "USDC"],
  },
  {
    id: "Asia",
    name: "Asia",
    color: "#8b5cf6", // purple-500
    darkColor: "#7c3aed", // purple-600
    position: { x: 250, y: 130 },
    tokens: ["USDT", "XSGD", "USDC", "IDRT", "CNHT"],
  },
  {
    id: "RWA",
    name: "Real World Assets",
    color: "#a855f7", // purple-500
    darkColor: "#9333ea", // purple-600
    position: { x: 200, y: 180 },
    tokens: ["USDR", "USDM", "EURC", "PAXG"],
  },
];

// D3 scale for heat coloring based on allocation (0 = none, 1 = max)
const colorScale = scaleLinear<string>()
  .domain([0, 0.3, 0.6, 1])
  .range(["#ececec", "#c7d2fe", "#818cf8", "#4f46e5"]); // light to strong indigo

interface DiversifiVisualizerProps {
  regionAllocations: Record<string, number>;
  onRefresh: () => void;
}

interface RegionData {
  region: string;
  value: number;
  color: string;
}

interface PieArcDatum extends d3.PieArcDatum<RegionData> {
  data: RegionData;
}

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

export const DiversifiVisualizer: React.FC<DiversifiVisualizerProps> = ({
  regionAllocations,
  onRefresh,
}) => {
  // Calculate metrics
  const weights = Object.values(regionAllocations);
  const hhi = calcHHI(weights);
  const entropy = calcShannonEntropy(weights);
  const spread = calcGeographicSpread(weights);
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const vizRef = useRef<HTMLDivElement>(null);

  // Check if there's any data to display
  const hasData = weights.some((weight) => weight > 0);

  // Find the region with the highest allocation
  const mainRegion = hasData
    ? Object.entries(regionAllocations).reduce((a, b) =>
        b[1] > a[1] ? b : a
      )[0]
    : "None";
  const mainPct = hasData ? regionAllocations[mainRegion] * 100 : 0;

  // Get all regions with non-zero allocations
  const regionLabels = Object.entries(regionAllocations)
    .filter(([_, value]) => value > 0)
    .map(([key]) => key);

  // Create unified visualization
  useEffect(() => {
    if (!vizRef.current) return;

    // Clear previous visualization
    d3.select(vizRef.current).selectAll("*").remove();

    const width = vizRef.current.clientWidth;
    const height = 350;
    const centerX = width / 2;
    const centerY = height / 2;

    const svg = d3
      .select(vizRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("style", "overflow: visible;");

    // Create the circular background that will serve as our world representation
    svg
      .append("circle")
      .attr("cx", centerX)
      .attr("cy", centerY)
      .attr("r", Math.min(width, height) / 2.5)
      .attr("fill", "#e2e8f0")
      .attr("stroke", "#cbd5e1")
      .attr("stroke-width", 1)
      .attr("opacity", 0.5);

    // Add regions as circles with sizes proportional to allocations
    REGIONS.forEach((region) => {
      const allocation = regionAllocations[region.id] || 0;
      // Base size: 10-20px depending on screen width, plus allocation boost
      const baseSize = Math.max(width / 55, 10);
      const radius =
        allocation > 0 ? baseSize + allocation * baseSize * 5 : baseSize;
      const color = allocation > 0 ? colorScale(allocation) : "#e5e7eb";
      const isActive = activeRegion === region.id || !activeRegion;

      // Calculate position based on the center
      const posX = centerX + (region.position.x - 175) * (width / 400);
      const posY = centerY + (region.position.y - 140) * (height / 300);

      const regionGroup = svg
        .append("g")
        .attr("transform", `translate(${posX}, ${posY})`)
        .attr("class", "region-node")
        .style("cursor", "pointer")
        .on("mouseenter", () => setActiveRegion(region.id))
        .on("mouseleave", () => setActiveRegion(null));

      // Add animated ripple effect for active regions with allocations
      if (allocation > 0) {
        const ripple = regionGroup
          .append("circle")
          .attr("r", radius + 5)
          .attr("fill", "none")
          .attr("stroke", region.color)
          .attr("stroke-width", 1.5)
          .attr("stroke-opacity", isActive ? 0.6 : 0)
          .attr("stroke-dasharray", "3,3");

        // Add subtle animation to the ripple
        if (isActive) {
          ripple.attr("opacity", 0.7).call((node) => {
            node
              .transition()
              .duration(2000)
              .attr("r", radius + 8)
              .attr("opacity", 0)
              .on("end", function () {
                d3.select(this)
                  .attr("r", radius + 5)
                  .attr("opacity", 0.7)
                  .call((node) => {
                    node
                      .transition()
                      .duration(2000)
                      .attr("r", radius + 8)
                      .attr("opacity", 0);
                  });
              });
          });
        }
      }

      // Main circle for the region
      regionGroup
        .append("circle")
        .attr("r", radius)
        .attr("fill", color)
        .attr("stroke", region.color)
        .attr("stroke-width", allocation > 0 ? 2 : 1)
        .attr("opacity", isActive ? 1 : 0.7);

      // Region label
      regionGroup
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", allocation > 0 ? "white" : "currentColor")
        .attr("font-weight", allocation > 0 ? "bold" : "normal")
        .attr("font-size", allocation > 0 ? "12px" : "10px")
        .text(region.name);

      // Percentage label for regions with allocations
      if (allocation > 0) {
        regionGroup
          .append("text")
          .attr("text-anchor", "middle")
          .attr("y", radius + 15)
          .attr("fill", "#1e293b")
          .attr("font-weight", "medium")
          .attr("font-size", "11px")
          .text(`${Math.round(allocation * 100)}%`);
      }
    });

    // Add connections between regions with allocations > 0
    const regionsWithAllocations = REGIONS.filter(
      (region) => (regionAllocations[region.id] || 0) > 0
    );

    // Create connections between allocated regions
    for (let i = 0; i < regionsWithAllocations.length; i++) {
      for (let j = i + 1; j < regionsWithAllocations.length; j++) {
        const region1 = regionsWithAllocations[i];
        const region2 = regionsWithAllocations[j];

        const x1 = centerX + (region1.position.x - 175) * (width / 400);
        const y1 = centerY + (region1.position.y - 140) * (height / 300);
        const x2 = centerX + (region2.position.x - 175) * (width / 400);
        const y2 = centerY + (region2.position.y - 140) * (height / 300);

        svg
          .append("line")
          .attr("x1", x1)
          .attr("y1", y1)
          .attr("x2", x2)
          .attr("y2", y2)
          .attr("stroke", "#94a3b8")
          .attr("stroke-width", 1)
          .attr("stroke-opacity", 0.3)
          .attr("stroke-dasharray", "3,3");
      }
    }

    // Add legend if there are allocations
    if (regionsWithAllocations.length > 0) {
      const legend = svg
        .append("g")
        .attr("transform", `translate(20, ${height - 15})`)
        .attr("class", "legend");

      legend
        .append("text")
        .attr("fill", "currentColor")
        .attr("font-size", "10px")
        .text(
          `${regionLabels.length} of ${REGIONS.length} regions active · ${
            spread > 0 ? (spread * 100).toFixed(0) : 0
          }% geographic spread`
        );
    }
  }, [regionAllocations, activeRegion, vizRef]);

  // Create pie chart
  const pieChartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pieChartRef.current) return;

    // Clear previous chart
    d3.select(pieChartRef.current).selectAll("*").remove();

    const regionsWithAllocations = REGIONS.filter(
      (region) => (regionAllocations[region.id] || 0) > 0
    );

    if (regionsWithAllocations.length === 0) return;

    const width = pieChartRef.current.clientWidth;
    const height = 200;
    const radius = Math.min(width, height) / 3;

    const data: RegionData[] = REGIONS.map((region) => ({
      region: region.id,
      value: regionAllocations[region.id] || 0,
      color: region.color,
    })).filter((d) => d.value > 0);

    const svg = d3
      .select(pieChartRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const pie = d3
      .pie<RegionData>()
      .sort(null)
      .value((d) => d.value);

    const arc = d3
      .arc<PieArcDatum>()
      .innerRadius(radius * 0.6) // Donut chart
      .outerRadius(radius);

    const arcs = svg
      .selectAll("g.arc")
      .data(pie(data))
      .enter()
      .append("g")
      .attr("class", "arc")
      .style("cursor", "pointer")
      .on("mouseenter", (_event, d) => {
        setActiveRegion(d.data.region);
      })
      .on("mouseleave", () => {
        setActiveRegion(null);
      });

    arcs
      .append("path")
      .attr("d", arc)
      .attr("fill", (d) => d.data.color)
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .style("opacity", (d) =>
        activeRegion === d.data.region || !activeRegion ? 1 : 0.7
      );

    // Add percentage labels
    arcs
      .append("text")
      .attr("transform", (d) => {
        const centroid = arc.centroid(d);
        const x = centroid[0];
        const y = centroid[1];
        const h = Math.sqrt(x * x + y * y);
        return `translate(${(x / h) * radius * 0.8},${(y / h) * radius * 0.8})`;
      })
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .attr("fill", "currentColor")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("pointer-events", "none")
      .text((d) =>
        d.data.value >= 0.05 ? `${Math.round(d.data.value * 100)}%` : ""
      );

    // Add center text
    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.2em")
      .style("font-size", "14px")
      .style("fill", "currentColor")
      .text("Portfolio");

    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1em")
      .style("font-size", "14px")
      .style("fill", "currentColor")
      .text("Distribution");

    // Add legend
    const legend = svg
      .append("g")
      .attr("transform", `translate(${radius + 20}, -${radius / 2})`);

    data.forEach((d, i) => {
      const legendRow = legend
        .append("g")
        .attr("transform", `translate(0, ${i * 20})`);

      legendRow
        .append("rect")
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", d.color)
        .attr("rx", 2);

      legendRow
        .append("text")
        .attr("x", 20)
        .attr("y", 10)
        .attr("font-size", "12px")
        .attr("fill", "currentColor")
        .text(`${d.region} (${Math.round(d.value * 100)}%)`);
    });
  }, [regionAllocations, activeRegion]);

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      {/* Header with title, badge, and refresh button */}
      <div className="w-full max-w-3xl mx-auto flex items-center justify-between pb-2 border-b">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-medium">Geographic Distribution</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                >
                  Stable Station tokens only
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[250px] text-xs">
                Shows only tokens available on Stable Station platform
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="flex items-center gap-1.5 text-xs hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-refresh-cw"
          >
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
            <path d="M21 3v5h-5"></path>
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
            <path d="M3 21v-5h5"></path>
          </svg>
          Refresh Portfolio
        </Button>
      </div>

      {/* Main visualization area */}
      <div className="w-full max-w-3xl mx-auto">
        <div className="relative bg-slate-50 dark:bg-slate-900/50 rounded-lg border shadow-sm overflow-hidden text-slate-900 dark:text-slate-200">
          {!hasData ? (
            <div className="w-full h-[350px] flex flex-col items-center justify-center p-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg max-w-md text-center">
                <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-2">
                  No Stablecoins Found
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  We couldn't find any stablecoins in your wallet. To visualize
                  your geographic distribution, you'll need to acquire
                  stablecoins from different regions.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                  onClick={onRefresh}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-refresh-cw mr-1.5"
                  >
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                    <path d="M21 3v5h-5"></path>
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                    <path d="M3 21v-5h5"></path>
                  </svg>
                  Refresh Data
                </Button>
              </div>
            </div>
          ) : (
            <div ref={vizRef} className="w-full h-[350px]"></div>
          )}
        </div>
      </div>

      {/* Pie chart below the map */}
      {hasData && (
        <div className="w-full max-w-3xl mx-auto">
          <div className="relative bg-slate-50 dark:bg-slate-900/50 rounded-lg border shadow-sm overflow-hidden text-slate-900 dark:text-slate-200">
            <div ref={pieChartRef} className="w-full h-[200px]"></div>
          </div>
        </div>
      )}

      {/* Metrics section with full names on desktop */}
      {hasData && (
        <div className="w-full max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="w-full">
                <div className="w-full h-full flex flex-col items-center p-3 border rounded-lg bg-slate-50 dark:bg-slate-900/50 cursor-help">
                  <div className="w-full text-center">
                    <span className="block text-xs text-slate-500 md:hidden">
                      HHI
                    </span>
                    <span className="hidden text-xs text-slate-500 md:block">
                      Herfindahl-Hirschman Index
                    </span>
                  </div>
                  <div className="font-medium mt-2">{hhi.toFixed(2)}</div>
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="text-xs max-w-[200px] text-center z-50"
              >
                Concentration measure: lower values indicate better
                diversification
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="w-full">
                <div className="w-full h-full flex flex-col items-center p-3 border rounded-lg bg-slate-50 dark:bg-slate-900/50 cursor-help">
                  <div className="w-full text-center">
                    <span className="block text-xs text-slate-500 md:hidden">
                      Entropy
                    </span>
                    <span className="hidden text-xs text-slate-500 md:block">
                      Shannon Entropy
                    </span>
                  </div>
                  <div className="font-medium mt-2">{entropy.toFixed(2)}</div>
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="text-xs max-w-[200px] text-center z-50"
              >
                Diversity measure: higher values indicate more even distribution
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="w-full">
                <div className="w-full h-full flex flex-col items-center p-3 border rounded-lg bg-slate-50 dark:bg-slate-900/50 cursor-help">
                  <div className="w-full text-center">
                    <span className="block text-xs text-slate-500 md:hidden">
                      Spread
                    </span>
                    <span className="hidden text-xs text-slate-500 md:block">
                      Geographic Spread Ratio
                    </span>
                  </div>
                  <div className="font-medium mt-2">
                    {(spread * 100).toFixed(0)}%
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="text-xs max-w-[200px] text-center z-50"
              >
                Percentage of available regions where you have holdings
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="w-full">
                <div className="w-full h-full flex flex-col items-center p-3 border rounded-lg bg-slate-50 dark:bg-slate-900/50 cursor-help">
                  <div className="w-full text-center">
                    <span className="text-xs text-slate-500">Main Region</span>
                  </div>
                  <div className="font-medium mt-2">
                    {mainPct >= 1
                      ? `${mainRegion} (${mainPct.toFixed(0)}%)`
                      : "None"}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="text-xs max-w-[200px] text-center z-50"
              >
                Region with the highest allocation in your portfolio
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  );
};
