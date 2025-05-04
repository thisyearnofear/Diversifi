import React from "react";
import PerformanceChart from "../PerformanceChart";
import CurrencyPerformanceChart from "../CurrencyPerformanceChart";
import { useDiversification } from "@/hooks/use-diversification";

interface AnalyticsTabProps {
  performanceData: any;
  isPerformanceLoading: boolean;
  currencyPerformanceData: any;
  isCurrencyPerformanceLoading: boolean;
  regionData: Array<{ region: string; value: number; color: string }>;
  totalValue: number;
  userRegion: string;
}

export default function AnalyticsTab({
  performanceData,
  isPerformanceLoading,
  currencyPerformanceData,
  isCurrencyPerformanceLoading,
  regionData,
  totalValue,
  userRegion,
}: AnalyticsTabProps) {
  const {
    diversificationScore,
    diversificationRating,
    diversificationDescription,
    diversificationTips,
  } = useDiversification(regionData, userRegion);

  return (
    <div className="space-y-4">
      {/* Performance Chart */}
      {isPerformanceLoading ? (
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4 flex items-center justify-center h-48">
          <div className="flex items-center text-gray-600">
            <svg
              className="animate-spin -ml-1 mr-3 size-5 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading performance data...
          </div>
        </div>
      ) : (
        <PerformanceChart
          data={performanceData}
          title="Portfolio Performance"
        />
      )}

      {/* Currency Performance Chart */}
      {isCurrencyPerformanceLoading ? (
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4 flex items-center justify-center h-48">
          <div className="flex items-center text-gray-600">
            <svg
              className="animate-spin -ml-1 mr-3 size-5 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading currency data...
          </div>
        </div>
      ) : (
        <CurrencyPerformanceChart
          data={currencyPerformanceData}
          title="Currency Performance (Value of $1 over time)"
        />
      )}

      {/* Portfolio Metrics */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <h2 className="text-lg font-semibold mb-4">Portfolio Metrics</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="text-sm text-gray-500">Total Value</div>
            <div className="text-xl font-semibold">
              ${totalValue ? totalValue.toFixed(2) : "0.00"}
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-md">
            <div className="text-sm text-gray-500">Regions</div>
            <div className="text-xl font-semibold">
              {regionData.filter((r) => r.value > 0).length}
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-md">
            <div className="text-sm text-gray-500">Volatility</div>
            <div className="text-xl font-semibold">
              {performanceData.volatility.toFixed(2)}%
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-md">
            <div className="text-sm text-gray-500">30-Day Change</div>
            <div
              className={`text-xl font-semibold ${
                performanceData.percentChange >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {performanceData.percentChange >= 0 ? "+" : ""}
              {performanceData.percentChange.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      {/* Diversification Score */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <h2 className="text-lg font-semibold mb-2">Diversification Score</h2>

        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                {diversificationScore}%
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-blue-600">
                {diversificationRating}
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
            <div
              style={{ width: `${diversificationScore}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
            />
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Your portfolio is {diversificationDescription}
        </p>

        <div className="bg-blue-50 p-3 rounded-md">
          <h3 className="font-medium text-blue-700 mb-1">How to Improve</h3>
          <ul className="text-sm text-blue-600 list-disc pl-5 space-y-1">
            {diversificationTips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
