"use client"

import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart, Dot } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { TrendingUp, TrendingDown, Calendar, Activity, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import { PriceIndicator } from "@/components/ui/price-indicator"
import { LoadingSkeleton } from "@/components/ui/loading-skeleton"
import { ConnectionStatus } from "@/components/ui/connection-status"
import { useState } from "react"

interface RealtimePriceChartProps {
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
  currentPrice?: number
  priceChange?: number
  isConnected?: boolean
  loading?: boolean
  lastUpdated?: Date | null
  connectionAttempts?: number
  title?: string
  height?: number
}

interface CustomTooltipProps {
  active?: boolean
  payload?: any[]
  label?: string
}

const formatDateUTC = (dateString: string) => {
  const date = new Date(dateString + 'T00:00:00Z');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
};

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload

    return (
      <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-600/50 rounded-xl p-4 shadow-2xl">
        <div className="absolute -inset-1 bg-gradient-to-r from-green-400/20 to-blue-500/20 rounded-xl blur opacity-50"></div>
        <div className="relative">
          <div className="text-white text-sm font-bold mb-3 flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-blue-400" />
            {formatDateUTC(data.date)}
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-black/30 rounded-lg">
                <span className="text-gray-400 font-medium">Price:</span>
                <span className="text-white font-mono font-bold">${data.price?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-black/30 rounded-lg">
                <span className="text-gray-400 font-medium">High:</span>
                <span className="text-green-400 font-mono font-bold">${data.high?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-black/30 rounded-lg">
                <span className="text-gray-400 font-medium">Low:</span>
                <span className="text-red-400 font-mono font-bold">${data.low?.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-black/30 rounded-lg">
                <span className="text-gray-400 font-medium">Change:</span>
                <span
                  className={cn(
                    "font-mono font-bold flex items-center",
                    data.performance >= 0 ? "text-green-400" : "text-red-400",
                  )}
                >
                  {data.performance >= 0 ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {data.performance > 0 ? "+" : ""}
                  {data.performance?.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-black/30 rounded-lg">
                <span className="text-gray-400 font-medium">Volatility:</span>
                <span className="text-yellow-400 font-mono font-bold flex items-center">
                  <Activity className="w-3 h-3 mr-1" />
                  {data.volatility?.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-black/30 rounded-lg">
                <span className="text-gray-400 font-medium">Volume:</span>
                <span className="text-blue-400 font-mono font-bold flex items-center">
                  <BarChart3 className="w-3 h-3 mr-1" />
                  {data.volume >= 1000000
                    ? `${(data.volume / 1000000).toFixed(1)}M`
                    : `${(data.volume / 1000).toFixed(1)}K`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}

const CustomDot = (props: any) => {
  const { cx, cy, payload } = props

  if (!payload) return null

  // Highlight significant events
  const isSignificant = Math.abs(payload.performance) > 5 || payload.volatility > 10

  if (!isSignificant) return null

  return (
    <Dot
      cx={cx}
      cy={cy}
      r={4}
      fill={payload.performance >= 0 ? "#22C55E" : "#EF4444"}
      stroke="#ffffff"
      strokeWidth={2}
      className="animate-pulse"
    />
  )
}

export function RealtimePriceChart({
  data,
  currentPrice,
  priceChange = 0,
  isConnected = false,
  loading = false,
  lastUpdated,
  connectionAttempts = 0,
  title = "Real-time Price Movement",
  height = 300,
}: RealtimePriceChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<any>(null)

  if (loading) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-300">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSkeleton className="h-8 mb-4" />
          <LoadingSkeleton className={`h-[${height}px]`} />
        </CardContent>
      </Card>
    )
  }

  const chartData = data.map((item, index) => ({
    date: item.date, // keep as raw ISO string!
    price: item.close,
    high: item.high,
    low: item.low,
    volume: item.volume,
    performance: item.performance,
    volatility: item.volatility,
    index,
  }))

  // Add current price as the last point if available
  if (currentPrice && chartData.length > 0) {
    chartData.push({
      date: "Now",
      price: currentPrice,
      high: currentPrice,
      low: currentPrice,
      volume: 0,
      performance: priceChange,
      volatility: 0,
      index: chartData.length,
    })
  }

  const isPositive = data.length > 1 ? data[data.length - 1].close > data[0].close : true
  const totalChange = data.length > 1 ? ((data[data.length - 1].close - data[0].close) / data[0].close) * 100 : 0

  return (
    <Card className="bg-gray-900 border-gray-800 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-300 flex items-center">
            {title}
            <ConnectionStatus
              isConnected={isConnected}
              lastUpdated={lastUpdated}
              connectionAttempts={connectionAttempts}
              className="ml-2"
            />
          </CardTitle>
          <div className={cn("flex items-center text-sm", isPositive ? "text-green-400" : "text-red-400")}>
            {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            {isPositive ? "+" : ""}
            {totalChange.toFixed(2)}%
          </div>
        </div>
        {currentPrice && (
          <div className="mt-2">
            <PriceIndicator price={currentPrice} change={priceChange} className="text-white"/>
          </div>
        )}
      </CardHeader>
      <CardContent className="overflow-hidden">
        <ChartContainer
          config={{
            price: {
              label: "Price",
              color: isPositive ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)",
            },
          }}
          className="w-full overflow-hidden"
          style={{ height: `${height}px` }}
        >
          <ResponsiveContainer width="100%" height={height} minHeight={200}>
            <AreaChart
              data={chartData}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              onMouseMove={(e) => {
                if (e && e.activePayload && e.activePayload[0]) {
                  setHoveredPoint(e.activePayload[0].payload)
                }
              }}
              onMouseLeave={() => setHoveredPoint(null)}
            >
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={isPositive ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)"}
                    stopOpacity={0.3}
                  />
                  <stop offset="95%" stopColor={isPositive ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                stroke="#9CA3AF"
                fontSize={12}
                axisLine={false}
                interval="preserveStartEnd"
                tick={{ fontSize: 10 }}
                tickFormatter={formatDateUTC}
              />
              <YAxis
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
                domain={["dataMin - 100", "dataMax + 100"]}
                width={60}
                tick={{ fontSize: 10 }}
                reversed={false}
              />
              <ChartTooltip
                content={<CustomTooltip />}
                cursor={{ stroke: "#22C55E", strokeWidth: 1, strokeDasharray: "5 5" }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={isPositive ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)"}
                strokeWidth={2}
                fill="url(#priceGradient)"
                animationDuration={1000}
                animationEasing="ease-in-out"
                dot={<CustomDot />}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
