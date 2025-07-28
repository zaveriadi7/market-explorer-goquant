"use client";

import { RealtimePriceChart } from "./realtime-price-chart";
import { VolumeChart } from "./volume-chart";
import { VolatilityChart } from "./volatility-chart";
import { TechnicalIndicatorsChart } from "./technical-indicators-chart";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, BarChart3, Activity } from "lucide-react";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { PriceIndicator } from "@/components/ui/price-indicator";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedMarketOverviewProps {
  data: Array<{
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    performance: number;
    volatility: number;
  }>;
  technicalData?: Array<{
    date: string;
    close: number;
    ma20?: number;
    ma50?: number;
    rsi?: number;
  }>;
  currentPrice?: number;
  priceChange?: number;
  isConnected?: boolean;
  loading?: boolean;
  selectedInstrument: string;
}

export function AnimatedMarketOverview({
  data,
  technicalData,
  currentPrice,
  priceChange = 0,
  isConnected = false,
  loading = false,
  selectedInstrument,
}: AnimatedMarketOverviewProps) {
  const [expandedChart, setExpandedChart] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-gray-900 border-gray-800">
              <CardContent className="p-4">
                <LoadingSkeleton rows={2} />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-gray-900 border-gray-800">
              <CardContent className="p-4">
                <LoadingSkeleton className="h-64" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-6 text-center text-gray-400">
        <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No data available for charts</p>
      </div>
    );
  }

  const latestData = data[data.length - 1];
  const chartConfigs = [
    {
      key: "price",
      component: (
        <RealtimePriceChart
          data={data}
          currentPrice={currentPrice}
          priceChange={priceChange}
          isConnected={isConnected}
          loading={loading}
          title={`${selectedInstrument} Real-time Price`}
          height={expandedChart === "price" ? chartHeight : 250}
        />
      ),
    },
    technicalData && {
      key: "technical",
      component: (
        <TechnicalIndicatorsChart
          data={technicalData}
          title="Moving Averages"
          height={expandedChart === "technical" ? chartHeight : 285}
        />
      ),
    },
    {
      key: "volume",
      component: (
        <VolumeChart
          data={data}
          title="Trading Volume Analysis"
          height={expandedChart === "volume" ? chartHeight : 200}
        />
      ),
    },
    {
      key: "volatility",
      component: (
        <VolatilityChart
          data={data}
          title="Market Volatility"
          height={expandedChart === "volatility" ? chartHeight : 200}
        />
      ),
    },
  ].filter(Boolean); // Remove falsy items like `undefined` if technicalData is absent

  return (
    <div className="space-y-6">
      {/* Market Summary Cards with Animations */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card
          className={cn(
            "bg-gray-900 border-gray-800 transition-all duration-300 hover:scale-105",
            isConnected && "ring-1 ring-green-500/20"
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Current Price</p>
                {currentPrice ? (
                  <PriceIndicator
                    price={currentPrice}
                    change={priceChange}
                    className="text-2xl font-bold text-white"
                  />
                ) : (
                  <p className="text-sm sm:text-2xl font-bold text-white">
                    <AnimatedNumber value={latestData?.close || 0} prefix="$" />
                  </p>
                )}
              </div>
              <TrendingUp
                className={cn(
                  "hidden sm:block w-8 h-8 transition-colors duration-300",
                  priceChange > 0
                    ? "text-green-400"
                    : priceChange < 0
                    ? "text-red-400"
                    : "text-gray-400"
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800 transition-all duration-300 hover:scale-105">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">24h Change</p>
                <p
                  className={cn(
                    "text-sm sm:text-2xl font-bold transition-colors duration-300",
                    latestData?.performance >= 0
                      ? "text-green-400"
                      : "text-red-400"
                  )}
                >
                  <AnimatedNumber
                    value={latestData?.performance || 0}
                    prefix={latestData?.performance >= 0 ? "+" : ""}
                    suffix="%"
                  />
                </p>
              </div>
              <Activity className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800 transition-all duration-300 hover:scale-105">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Volume</p>
                <p className="text-sm sm:text-2xl font-bold text-white">
                  <AnimatedNumber
                    value={
                      latestData?.volume >= 1000000
                        ? latestData.volume / 1000000
                        : latestData?.volume / 1000 || 0
                    }
                    suffix={latestData?.volume >= 1000000 ? "M" : "K"}
                    decimals={1}
                  />
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800 transition-all duration-300 hover:scale-105">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Volatility</p>
                <p className="text-sm sm:text-2xl font-bold text-yellow-400">
                  <AnimatedNumber
                    value={latestData?.volatility || 0}
                    suffix="%"
                    decimals={1}
                  />
                </p>
              </div>
              <Activity className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Grid with Animations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 auto-rows-fr">
        {chartConfigs.map(({ key, component }) => (
          <div
            key={key}
            className="relative transform transition-all duration-300 hover:scale-[1.02] h-full min-h-[350px] flex flex-col"
          >
            {component}
          </div>
        ))}
      </div>

      {/* Connection Status Indicator */}
      <div
        className={cn(
          "sticky bottom-10 right-4 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300",
          isConnected
            ? "bg-green-900/80 text-green-300 border border-green-700"
            : "bg-green-900/80 text-green-300 border border-green-700"
        )}
      >
        <div className="flex items-center space-x-2">
          <div
            className={cn(
              "w-2 h-2 rounded-full",
              isConnected
                ? "bg-green-400 animate-pulse"
                : "bg-green-400 animate-pulse"
            )}
          />
          <span>
            {isConnected ? "Live Data Connected" : "Data from Binance API"}
          </span>
        </div>
      </div>
    </div>
  );
}
