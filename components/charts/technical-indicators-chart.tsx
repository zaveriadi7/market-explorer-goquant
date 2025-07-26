"use client"

import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { TrendingUp } from "lucide-react"

interface TechnicalIndicatorsChartProps {
  data: Array<{
    date: string
    close: number
    ma20?: number
    ma50?: number
    rsi?: number
  }>
  title?: string
  height?: number
  showRSI?: boolean
}

export function TechnicalIndicatorsChart({
  data,
  title = "Technical Indicators",
  height = 300,
  showRSI = false,
}: TechnicalIndicatorsChartProps) {
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
    price: item.close,
    ma20: item.ma20,
    ma50: item.ma50,
    rsi: item.rsi,
  }))

  if (showRSI) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-300 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            RSI Indicator
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <ChartContainer
            config={{
              rsi: {
                label: "RSI",
                color: "hsl(280, 100%, 70%)",
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
                  domain={[0, 100]}
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                  tick={{ fontSize: 10 }}
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  labelFormatter={(label) => formatDateUTC(label)}
                  formatter={(value: number) => [value?.toFixed(1) || "N/A", "RSI"]}
                />
                <ReferenceLine y={70} stroke="#EF4444" strokeDasharray="5 5" />
                <ReferenceLine y={30} stroke="#22C55E" strokeDasharray="5 5" />
                <ReferenceLine y={50} stroke="#6B7280" strokeDasharray="2 2" />
                <Line
                  type="monotone"
                  dataKey="rsi"
                  stroke="rgb(168, 85, 247)"
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-gray-300 flex items-center">
          <TrendingUp className="w-4 h-4 mr-2" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-hidden">
        <ChartContainer
          config={{
            price: {
              label: "Price",
              color: "hsl(0, 0%, 100%)",
            },
            ma20: {
              label: "MA(20)",
              color: "hsl(142, 76%, 36%)",
            },
            ma50: {
              label: "MA(50)",
              color: "hsl(217, 91%, 60%)",
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
                tick={{ fontSize: 10, formatter: (value: string) => formatDateUTC(value) }}
              />
              <YAxis
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
                width={60}
                tick={{ fontSize: 10 }}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                labelFormatter={(label) => formatDateUTC(label)}
                formatter={(value: number, name: string) => [
                  value ? `$${value.toLocaleString()}` : "N/A",
                  name === "price" ? "Price" : name === "ma20" ? "MA(20)" : "MA(50)",
                ]}
              />
              <Line type="monotone" dataKey="price" stroke="white" strokeWidth={2} dot={false} />
              <Line
                type="monotone"
                dataKey="ma20"
                stroke="rgb(34, 197, 94)"
                strokeWidth={1.5}
                dot={false}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="ma50"
                stroke="rgb(59, 130, 246)"
                strokeWidth={1.5}
                dot={false}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
