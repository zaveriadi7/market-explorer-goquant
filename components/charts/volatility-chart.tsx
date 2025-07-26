"use client"

import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Activity } from "lucide-react"

interface VolatilityChartProps {
  data: Array<{
    date: string
    volatility: number
  }>
  title?: string
  height?: number
}

export function VolatilityChart({ data, title = "Volatility Analysis", height = 200 }: VolatilityChartProps) {
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

  const chartData = data.map((item) => ({
    date: item.date, // keep as raw ISO string!
    volatility: item.volatility,
  }))

  const avgVolatility = data.reduce((sum, item) => sum + item.volatility, 0) / data.length

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-gray-300 flex items-center">
          <Activity className="w-4 h-4 mr-2" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-hidden">
        <ChartContainer
          config={{
            volatility: {
              label: "Volatility",
              color: "hsl(45, 93%, 47%)",
            },
          }}
          className="w-full overflow-hidden"
          style={{ height: `${height}px` }}
        >
          <ResponsiveContainer width="100%" height={height} minHeight={150}>
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
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
                tickFormatter={(value) => `${value.toFixed(1)}%`}
                width={50}
                tick={{ fontSize: 10 }}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                labelFormatter={(label) => formatDateUTC(label)}
                formatter={(value: number) => [`${value.toFixed(2)}%`, "Volatility"]}
              />
              <ReferenceLine
                y={avgVolatility}
                stroke="#6B7280"
                strokeDasharray="5 5"
                label={{ value: "Avg", position: "right" }}
              />
              <Line
                type="monotone"
                dataKey="volatility"
                stroke="rgb(245, 158, 11)"
                strokeWidth={2}
                dot={{ fill: "rgb(245, 158, 11)", strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: "rgb(245, 158, 11)", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
