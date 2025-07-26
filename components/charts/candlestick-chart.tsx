"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"

interface CandlestickChartProps {
  data: Array<{
    date: string
    open: number
    high: number
    low: number
    close: number
  }>
  title?: string
  height?: number
}

export function CandlestickChart({ data, title = "OHLC Candlestick", height = 300 }: CandlestickChartProps) {
  const maxPrice = Math.max(...data.map((d) => d.high))
  const minPrice = Math.min(...data.map((d) => d.low))
  const priceRange = maxPrice - minPrice

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

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-gray-300 flex items-center">
          <TrendingUp className="w-4 h-4 mr-2" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative" style={{ height: `${height}px` }}>
          <svg width="100%" height="100%" className="overflow-visible">
            {data.map((candle, index) => {
              const x = (index / (data.length - 1)) * 100
              const isGreen = candle.close >= candle.open

              // Calculate positions (inverted because SVG y=0 is at top)
              const highY = ((maxPrice - candle.high) / priceRange) * 100
              const lowY = ((maxPrice - candle.low) / priceRange) * 100
              const openY = ((maxPrice - candle.open) / priceRange) * 100
              const closeY = ((maxPrice - candle.close) / priceRange) * 100

              const bodyTop = Math.min(openY, closeY)
              const bodyHeight = Math.abs(closeY - openY)

              return (
                <g key={index}>
                  {/* Wick */}
                  <line
                    x1={`${x}%`}
                    y1={`${highY}%`}
                    x2={`${x}%`}
                    y2={`${lowY}%`}
                    stroke={isGreen ? "#22C55E" : "#EF4444"}
                    strokeWidth="1"
                  />

                  {/* Body */}
                  <rect
                    x={`${x - 1}%`}
                    y={`${bodyTop}%`}
                    width="2%"
                    height={`${Math.max(bodyHeight, 0.5)}%`}
                    fill={isGreen ? "#22C55E" : "#EF4444"}
                    stroke={isGreen ? "#22C55E" : "#EF4444"}
                    strokeWidth="1"
                  />
                </g>
              )
            })}
          </svg>

          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400 -ml-16">
            <span>${maxPrice.toLocaleString()}</span>
            <span>${((maxPrice + minPrice) / 2).toLocaleString()}</span>
            <span>${minPrice.toLocaleString()}</span>
          </div>

          {/* X-axis labels */}
          <div className="absolute bottom-0 left-0 w-full flex justify-between text-xs text-gray-400 mt-2">
            <span>{formatDateUTC(data[0]?.date)}</span>
            <span>{formatDateUTC(data[Math.floor(data.length / 2)]?.date)}</span>
            <span>{formatDateUTC(data[data.length - 1]?.date)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
