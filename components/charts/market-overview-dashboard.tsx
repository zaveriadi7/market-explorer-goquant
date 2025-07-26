"use client"

import { PriceChart } from "./price-chart"
import { VolumeChart } from "./volume-chart"
import { VolatilityChart } from "./volatility-chart"
import { TechnicalIndicatorsChart } from "./technical-indicators-chart"
import { CandlestickChart } from "./candlestick-chart"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, BarChart3, Activity, Maximize2 } from "lucide-react"
import { useState } from "react"

interface MarketOverviewDashboardProps {
  data: Array<{
    date: string
    open: number
    high: number
    low: number
    close: number
    volume: number
    performance: number
    volatility: number
  }>
  technicalData?: Array<{
    date: string
    close: number
    ma20?: number
    ma50?: number
    rsi?: number
  }>
  selectedInstrument: string
}

export function MarketOverviewDashboard({ data, technicalData, selectedInstrument }: MarketOverviewDashboardProps) {
  const [expandedChart, setExpandedChart] = useState<string | null>(null)

  if (!data || data.length === 0) {
    return (
      <div className="p-6 text-center text-gray-400">
        <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No data available for charts</p>
      </div>
    )
  }

  const chartHeight = expandedChart ? 400 : 250

  return (
    <div className="space-y-6">
      {/* Market Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Current Price</p>
                <p className="text-2xl font-bold text-white">${data[data.length - 1]?.close.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">24h Change</p>
                <p
                  className={`text-2xl font-bold ${data[data.length - 1]?.performance >= 0 ? "text-green-400" : "text-red-400"}`}
                >
                  {data[data.length - 1]?.performance >= 0 ? "+" : ""}
                  {data[data.length - 1]?.performance.toFixed(2)}%
                </p>
              </div>
              <Activity className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Volume</p>
                <p className="text-2xl font-bold text-white">
                  {data[data.length - 1]?.volume >= 1000000
                    ? `${(data[data.length - 1]?.volume / 1000000).toFixed(1)}M`
                    : `${(data[data.length - 1]?.volume / 1000).toFixed(1)}K`}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Volatility</p>
                <p className="text-2xl font-bold text-yellow-400">{data[data.length - 1]?.volatility.toFixed(1)}%</p>
              </div>
              <Activity className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price Chart */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white"
            onClick={() => setExpandedChart(expandedChart === "price" ? null : "price")}
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
          <PriceChart
            data={data}
            title={`${selectedInstrument} Price Movement`}
            height={expandedChart === "price" ? chartHeight : 250}
          />
        </div>

        {/* Volume Chart */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white"
            onClick={() => setExpandedChart(expandedChart === "volume" ? null : "volume")}
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
          <VolumeChart
            data={data}
            title="Trading Volume Analysis"
            height={expandedChart === "volume" ? chartHeight : 200}
          />
        </div>

        {/* Volatility Chart */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white"
            onClick={() => setExpandedChart(expandedChart === "volatility" ? null : "volatility")}
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
          <VolatilityChart
            data={data}
            title="Market Volatility"
            height={expandedChart === "volatility" ? chartHeight : 200}
          />
        </div>

        {/* Technical Indicators */}
        {technicalData && (
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white"
              onClick={() => setExpandedChart(expandedChart === "technical" ? null : "technical")}
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
            <TechnicalIndicatorsChart
              data={technicalData}
              title="Moving Averages"
              height={expandedChart === "technical" ? chartHeight : 250}
            />
          </div>
        )}
      </div>

      {/* Full Width Charts */}
      <div className="space-y-6">
        {/* Candlestick Chart */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white"
            onClick={() => setExpandedChart(expandedChart === "candlestick" ? null : "candlestick")}
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
          <CandlestickChart
            data={data}
            title={`${selectedInstrument} OHLC Analysis`}
            height={expandedChart === "candlestick" ? 500 : 300}
          />
        </div>

        {/* RSI Chart */}
        {technicalData && (
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white"
              onClick={() => setExpandedChart(expandedChart === "rsi" ? null : "rsi")}
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
            <TechnicalIndicatorsChart
              data={technicalData}
              title="RSI (Relative Strength Index)"
              height={expandedChart === "rsi" ? 400 : 200}
              showRSI={true}
            />
          </div>
        )}
      </div>
    </div>
  )
}
