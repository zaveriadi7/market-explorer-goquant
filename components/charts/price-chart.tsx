"use client"

import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface PriceChartProps {
  data: Array<{
    date: string
    open: number
    high: number
    low: number
    close: number
    volume: number
  }>
  title?: string
  height?: number
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

export function PriceChart({ data, title = "Price Movement", height = 300 }: PriceChartProps) {
  const chartData = data.map((item) => ({
    date: item.date, 
    price: item.close,
    high: item.high,
    low: item.low,
    volume: item.volume,
  }))

  const isPositive = data.length > 1 ? data[data.length - 1].close > data[0].close : true
  const priceChange = data.length > 1 ? ((data[data.length - 1].close - data[0].close) / data[0].close) * 100 : 0

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-300">{title}</CardTitle>
          <div className={cn("flex items-center text-sm", isPositive ? "text-green-400" : "text-red-400")}>
            {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            {isPositive ? "+" : ""}
            {priceChange.toFixed(2)}%
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            price: {
              label: "Price",
              color: isPositive ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)",
            },
          }}
          className="h-full w-full
          "
        >
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={chartData}>
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
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10 }}
                tickFormatter={formatDateUTC}
              />
              <YAxis
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                labelFormatter={(label) => formatDateUTC(label)}
                formatter={(value: number) => [`$${value.toLocaleString()}`, "Price"]}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={isPositive ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)"}
                strokeWidth={2}
                fill="url(#priceGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
