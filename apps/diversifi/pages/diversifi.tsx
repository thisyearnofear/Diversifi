import { useEffect, useState } from "react";
import Head from "next/head";
import { useWalletConnection } from "../hooks/wallet/use-wallet-connection";
import { useUserRegion, type Region, REGIONS } from "../hooks/use-user-region";
import { useStablecoinBalances } from "../hooks/use-stablecoin-balances";
import { useHistoricalPerformance } from "../hooks/use-historical-performance";
import { useInflationData } from "../hooks/use-inflation-data";
import { useCurrencyPerformance } from "../hooks/use-currency-performance";
import {
  AVAILABLE_TOKENS,
  MOCK_REGION_DATA,
  REGION_COLORS,
} from "../constants/regions";
import TabNavigation from "../components/TabNavigation";
import OverviewTab from "../components/tabs/OverviewTab";
import ProtectionTab from "../components/tabs/ProtectionTab";
import AnalyticsTab from "../components/tabs/AnalyticsTab";
import StrategiesTab from "../components/tabs/StrategiesTab";
import SwapTab from "../components/tabs/SwapTab";
import InfoTab from "../components/tabs/InfoTab";

export default function DiversiFiPage() {
  // Tab state
  const [activeTab, setActiveTab] = useState("protect");
  const [selectedStrategy, setSelectedStrategy] = useState("balanced");

  // Wallet connection
  const {
    isInMiniPay,
    address,
    chainId,
    isConnecting,
    error,
    connectWallet,
    formatAddress,
  } = useWalletConnection();

  // Use our custom hooks
  const { region: detectedRegion, isLoading: isRegionLoading } =
    useUserRegion();
  const [userRegion, setUserRegion] = useState<Region>("Africa");
  const {
    isLoading: isBalancesLoading,
    regionTotals,
    totalValue,
  } = useStablecoinBalances(address);
  const { data: performanceData, isLoading: isPerformanceLoading } =
    useHistoricalPerformance(address);
  // We use inflationData in the SwapTab component
  const { inflationData } = useInflationData();
  const {
    data: currencyPerformanceData,
    isLoading: isCurrencyPerformanceLoading,
  } = useCurrencyPerformance();

  // Convert region totals to format needed for pie chart
  const [regionData, setRegionData] = useState(MOCK_REGION_DATA);

  // Update user region when detected
  useEffect(() => {
    if (!isRegionLoading && detectedRegion) {
      setUserRegion(detectedRegion);
    }
  }, [detectedRegion, isRegionLoading]);

  // Update region data when balances change
  useEffect(() => {
    if (address && !isBalancesLoading && Object.keys(regionTotals).length > 0) {
      const newRegionData = Object.entries(regionTotals).map(
        ([region, value]) => ({
          region,
          value: Math.round(value * 100), // Convert to percentage
          color:
            REGION_COLORS[region as keyof typeof REGION_COLORS] || "#CBD5E0",
        })
      );

      if (newRegionData.length > 0) {
        setRegionData(newRegionData);
      }
    }
  }, [address, isBalancesLoading, regionTotals]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Head>
        <title>DiversiFi - MiniPay</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </Head>

      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold">DiversiFi</h1>
            {isInMiniPay && (
              <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                MiniPay
              </span>
            )}
          </div>
          {address && (
            <div className="text-sm bg-gray-100 px-2 py-1 rounded-full text-gray-700">
              {formatAddress(address)}
            </div>
          )}
        </div>

        {/* Mobile tabs with icons */}
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Tab Content */}
        {activeTab === "overview" && (
          <OverviewTab
            address={address}
            isConnecting={isConnecting}
            error={error}
            connectWallet={connectWallet}
            isInMiniPay={isInMiniPay}
            formatAddress={formatAddress}
            chainId={chainId}
            regionData={regionData}
            regionTotals={regionTotals}
            totalValue={totalValue}
            isRegionLoading={isRegionLoading}
            userRegion={userRegion}
            setUserRegion={setUserRegion}
            REGIONS={REGIONS}
            isBalancesLoading={isBalancesLoading}
            setActiveTab={setActiveTab}
          />
        )}

        {/* Protection Tab */}
        {activeTab === "protect" && (
          <ProtectionTab
            userRegion={userRegion}
            setUserRegion={setUserRegion}
            regionData={regionData}
            totalValue={totalValue}
          />
        )}

        {/* Strategies Tab */}
        {activeTab === "strategies" && (
          <StrategiesTab
            userRegion={userRegion}
            regionData={regionData}
            onSelectStrategy={setSelectedStrategy}
          />
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <AnalyticsTab
            performanceData={performanceData}
            isPerformanceLoading={isPerformanceLoading}
            currencyPerformanceData={currencyPerformanceData}
            isCurrencyPerformanceLoading={isCurrencyPerformanceLoading}
            regionData={regionData}
            totalValue={totalValue}
            userRegion={userRegion}
          />
        )}

        {/* Swap Tab */}
        {activeTab === "swap" && (
          <SwapTab
            address={address}
            isConnecting={isConnecting}
            connectWallet={connectWallet}
            isInMiniPay={isInMiniPay}
            availableTokens={AVAILABLE_TOKENS}
            userRegion={userRegion}
            selectedStrategy={selectedStrategy}
            inflationData={inflationData}
          />
        )}

        {/* Info Tab */}
        {activeTab === "info" && (
          <InfoTab
            availableTokens={AVAILABLE_TOKENS}
            isInMiniPay={isInMiniPay}
            chainId={chainId}
            address={address}
            formatAddress={formatAddress}
          />
        )}
      </div>
    </div>
  );
}
