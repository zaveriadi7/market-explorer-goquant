"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  Clock,
  BarChart3,
  Activity,
  Zap,
  Database,
  RefreshCw,
  Layers,
  CheckCircle,
  Circle,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface LeftSidebarProps {
  selectedInstrument: string
  setSelectedInstrument: (value: string) => void
  timeframe: string
  setTimeframe: (value: string) => void
  selectedMetrics: string[]
  setSelectedMetrics: (value: string[]) => void
  isConnected?: boolean
  lastUpdated?: Date | null
  onRefresh?: () => void
}

const instruments = [
  {
    value: "BTC/USDT",
    label: "Bitcoin",
    icon: "₿",
    color: "text-orange-400",
    gradient: "from-orange-400 to-orange-600",
  },
  { value: "ETH/USDT", label: "Ethereum", icon: "Ξ", color: "text-blue-400", gradient: "from-blue-400 to-blue-600" },
  { value: "ADA/USDT", label: "Cardano", icon: "₳", color: "text-blue-300", gradient: "from-blue-300 to-blue-500" },
  {
    value: "SOL/USDT",
    label: "Solana",
    icon: "◎",
    color: "text-purple-400",
    gradient: "from-purple-400 to-purple-600",
  },
  {
    value: "MATIC/USDT",
    label: "Polygon",
    icon: "⬟",
    color: "text-purple-300",
    gradient: "from-purple-300 to-purple-500",
  },
  { value: "DOT/USDT", label: "Polkadot", icon: "●", color: "text-pink-400", gradient: "from-pink-400 to-pink-600" },
]

const timeframes = [
  {
    value: "Daily",
    label: "Daily Analysis",
    icon: Clock,
    description: "Day-by-day market data",
    gradient: "from-green-400 to-green-600",
  },
  {
    value: "Weekly",
    label: "Weekly Overview",
    icon: BarChart3,
    description: "Weekly aggregated data",
    gradient: "from-blue-400 to-blue-600",
  },
  {
    value: "Monthly",
    label: "Monthly Trends",
    icon: TrendingUp,
    description: "Monthly market patterns",
    gradient: "from-purple-400 to-purple-600",
  },
]

const metrics = [
  {
    value: "Volatility",
    label: "Price Volatility",
    icon: Activity,
    color: "text-yellow-400",
    description: "Measures price fluctuation intensity",
    gradient: "from-yellow-400 to-orange-500",
  },
  {
    value: "Liquidity",
    label: "Trading Volume",
    icon: BarChart3,
    color: "text-blue-400",
    description: "Shows market liquidity levels",
    gradient: "from-blue-400 to-cyan-500",
  },
  {
    value: "Performance",
    label: "Price Performance",
    icon: TrendingUp,
    color: "text-green-400",
    description: "Tracks price change percentage",
    gradient: "from-green-400 to-emerald-500",
  },
]

export function LeftSidebar({
  selectedInstrument,
  setSelectedInstrument,
  timeframe,
  setTimeframe,
  selectedMetrics,
  setSelectedMetrics,
  isConnected = false,
  lastUpdated,
  onRefresh,
}: LeftSidebarProps) {
  const handleMetricChange = (metric: string, checked: boolean) => {
    if (checked) {
      setSelectedMetrics([...selectedMetrics, metric])
    } else {
      setSelectedMetrics(selectedMetrics.filter((m) => m !== metric))
    }
  }

  const selectedInstrumentData = instruments.find((i) => i.value === selectedInstrument)

  return (
    <div className="w-80 bg-gradient-to-b from-black via-black to-gray-900 border-r border-gray-800/50 h-full overflow-y-auto relative">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 via-transparent to-blue-500/5 animate-pulse"></div>

      <div className="relative p-4 space-y-4">
        {/* Enhanced Header */}
        <div className="relative group">
          <div className="absolute -inset-2 bg-gradient-to-r from-green-400/20 to-blue-500/20 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
         
        </div>
        <a href="/compare">
        <Button
  className="ml-1 mb-4 relative group h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base w-full md:w-min rounded-xl overflow-hidden 
             transition-all duration-500 transform hover:scale-105 
             bg-black/20 hover:bg-green-600/30 
             text-green-200 hover:text-green-100 
             border border-green-400/40 hover:border-green-300/70 
             shadow-[0_0_10px_2px_rgba(34,197,94,0.4)] hover:shadow-[0_0_15px_4px_rgba(34,197,94,0.6)]
             backdrop-blur-sm">
  
  {/* Glowing background gradient animation */}
  <div className="absolute inset-0 bg-gradient-to-br from-green-400/30 via-transparent to-green-700/20 
                  opacity-30 group-hover:opacity-50 transition-opacity duration-700 pointer-events-none" />

  <BarChart3 className="w-3 h-3 sm:w-5 sm:h-5  text-green-300 drop-shadow-[0_0_3px_rgba(34,197,94,0.7)] relative z-10" />
  
  <span className="font-semibold relative z-10 whitespace-nowrap 
                   text-shadow-[0_0_2px_rgba(34,197,94,0.8)]">
    Compare between dates
  </span>
</Button>
</a>

        {/* Trading Pair Selection - More Accessible */}
        <Card className="relative group bg-gray-900/30 border-gray-800/50 backdrop-blur-sm hover:bg-gray-900/50 transition-all duration-500 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="relative pb-2">
            <CardTitle className="text-sm font-bold text-gray-300 flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              Trading Pair
              <Badge variant="secondary" className="ml-auto bg-gray-800/50 text-gray-300 border-gray-700/50 text-xs">
                Live Data
              </Badge>
            </CardTitle>
            <p className="text-xs text-gray-500">Select cryptocurrency to analyze</p>
          </CardHeader>
          <CardContent className="relative pt-0 hover:text-white">
            <Select value={selectedInstrument} onValueChange={setSelectedInstrument}>
              <SelectTrigger className="bg-black/50 border-gray-700/50 text-white hover:border-gray-600/50 transition-all duration-300 h-14 rounded-xl focus:ring-2 focus:ring-green-500/50">
                <SelectValue>
                  {selectedInstrumentData && (
                    <div className="flex items-center space-x-3">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br shadow-lg",
                          selectedInstrumentData.gradient,
                        )}
                      >
                        <span className="text-white font-bold text-base">{selectedInstrumentData.icon}</span>
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-bold text-base">{selectedInstrument}</div>
                        <div className="text-xs text-gray-400">{selectedInstrumentData.label}</div>
                      </div>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-black/95 border-gray-700/50 backdrop-blur-xl hover:text-white">
                {instruments.map((instrument) => (
                  <SelectItem
                    key={instrument.value}
                    value={instrument.value}
                    className="text-white hover:text-white hover:bg-white-80/50 focus:bg-gray-800/50 transition-all duration-300 rounded-lg m-1 cursor-pointer"
                  >
                    <div className="flex items-center space-x-3 w-full py-2 hover:text-white">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br shadow-lg",
                          instrument.gradient,
                        )}
                      >
                        <span className="text-white font-bold text-base">{instrument.icon}</span>
                      </div>
                      <div className="flex-1 hover:text-white">
                        <div className="font-bold hover:text-white">{instrument.value}</div>
                        <div className="text-xs text-white">{instrument.label}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Timeframe Selection - More Accessible */}
        <Card className="relative group bg-gray-900/30 border-gray-800/50 backdrop-blur-sm hover:bg-gray-900/50 transition-all duration-500 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="relative pb-2">
            <CardTitle className="text-sm font-bold text-gray-300 flex items-center">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
              Analysis Timeframe
              <Clock className="w-4 h-4 ml-auto text-blue-400" />
            </CardTitle>
            <p className="text-xs text-gray-500">Choose data aggregation period</p>
          </CardHeader>
          <CardContent className="relative pt-0">
            <div className="space-y-2">
              {timeframes.map((tf) => {
                const Icon = tf.icon
                const isSelected = timeframe === tf.value
                return (
                  <button
                    key={tf.value}
                    onClick={() => setTimeframe(tf.value)}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-green-500/50 group/button",
                      isSelected
                        ? "bg-gradient-to-r from-green-600/20 to-green-700/20 border-green-600/50 shadow-lg shadow-green-600/10"
                        : "bg-black/20 hover:bg-gray-800/30 border-gray-700/50 hover:border-gray-600/50",
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300",
                          isSelected
                            ? "bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/25"
                            : "bg-gray-700/50 group-hover/button:bg-gray-600/50",
                        )}
                      >
                        <Icon className={cn("w-5 h-5", isSelected ? "text-white" : "text-gray-400")} />
                      </div>
                      <div className="flex-1">
                        <div className={cn("font-bold text-sm", isSelected ? "text-white" : "text-gray-300")}>
                          {tf.label}
                        </div>
                        <div className="text-xs text-gray-500">{tf.description}</div>
                      </div>
                      {isSelected && <CheckCircle className="w-5 h-5 text-green-400 animate-pulse" />}
                    </div>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Metrics Selection - More Accessible */}
        <Card className="relative group bg-gray-900/30 border-gray-800/50 backdrop-blur-sm hover:bg-gray-900/50 transition-all duration-500 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="relative pb-2">
            <CardTitle className="text-sm font-bold text-gray-300 flex items-center">
              <div className="w-2 h-2 bg-purple-400 rounded-full mr-2 animate-pulse"></div>
              Analysis Metrics
              <Badge variant="secondary" className="ml-auto bg-gray-800/50 text-gray-300 border-gray-700/50 text-xs">
                {selectedMetrics.length} active
              </Badge>
            </CardTitle>
            <p className="text-xs text-gray-500">Select data points to visualize</p>
          </CardHeader>
          <CardContent className="relative pt-0">
            <div className="space-y-3">
              {metrics.map((metric) => {
                const Icon = metric.icon
                const isSelected = selectedMetrics.includes(metric.value)
                return (
                  <div
                    key={metric.value}
                    className={cn(
                      "relative group/metric flex items-start space-x-3 p-3 rounded-xl border transition-all duration-300 cursor-pointer hover:scale-[1.02] focus-within:ring-2 focus-within:ring-green-500/50",
                      isSelected
                        ? "bg-gray-800/50 border-gray-600/50 shadow-lg"
                        : "bg-black/20 border-gray-800/50 hover:bg-gray-800/30 hover:border-gray-700/50",
                    )}
                    onClick={() => handleMetricChange(metric.value, !isSelected)}
                  >
                    <div className="flex items-center pt-1">
                      <Checkbox
                        id={metric.value}
                        checked={isSelected}
                        onCheckedChange={(checked) => handleMetricChange(metric.value, checked as boolean)}
                        className="border-gray-700/50 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 focus:ring-2 focus:ring-green-500/50"
                      />
                    </div>
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br transition-all duration-300",
                        isSelected ? metric.gradient + " shadow-lg" : "bg-gray-700/50",
                      )}
                    >
                      <Icon className={cn("w-5 h-5", isSelected ? "text-white" : "text-gray-400")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Label
                        htmlFor={metric.value}
                        className={cn(
                          "text-sm cursor-pointer font-bold block transition-colors duration-300",
                          isSelected ? "text-white" : "text-gray-300",
                        )}
                      >
                        {metric.label}
                      </Label>
                      <div className="text-xs text-gray-500 mt-1 leading-relaxed">{metric.description}</div>
                    </div>
                    {isSelected && (
                      <div className="flex items-center pt-1">
                        <CheckCircle className="w-4 h-4 text-green-400 animate-pulse" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Quick Actions */}
            <div className="mt-4 pt-4 border-t border-gray-800/50">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedMetrics([])}
                  className="bg-black/30 border-gray-700/50 text-gray-300 hover:bg-gray-800/50 hover:border-gray-600/50 transition-all duration-300 rounded-lg font-medium text-xs"
                >
                  <Circle className="w-3 h-3 mr-1" />
                  Clear All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedMetrics(metrics.map((m) => m.value))}
                  className="bg-black/30 border-gray-700/50 text-gray-300 hover:bg-gray-800/50 hover:border-gray-600/50 transition-all duration-300 rounded-lg font-medium text-xs"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Select All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connection Status - More Accessible */}
        <Card className="relative group bg-gradient-to-br from-gray-900 to-gray-900 border-gray-800/50 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="relative pb-2">
            <CardTitle className="text-sm font-bold text-gray-300 flex items-center">
              <div className="w-2 h-2 bg-cyan-400 rounded-full mr-2 animate-pulse"></div>
              Data Connection
              <Database className="w-4 h-4 ml-auto text-cyan-400" />
            </CardTitle>
            <p className="text-xs text-gray-500">Real-time market data status</p>
          </CardHeader>
          <CardContent className="relative pt-0 space-y-3">
            <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg border border-gray-800/50">
              <span className="text-gray-400 text-sm font-medium">Trading Pair:</span>
              <Badge variant="outline" className="border-green-600/50 text-green-400 bg-green-900/20 font-bold text-xs">
                {selectedInstrument}
              </Badge>
            </div>

            <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg border border-gray-800/50">
              <span className="text-gray-400 text-sm font-medium">Data Source:</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-white text-sm font-bold">Binance API</span>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg border border-gray-800/50">
              <span className="text-gray-400 text-sm font-medium">Update Rate:</span>
              <span className="text-gray-300 text-sm font-mono font-bold">
                {timeframe === "Daily" ? "5 min" : "30 min"}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg border border-gray-800/50">
              <span className="text-gray-400 text-sm font-medium">Connection:</span>
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <>
                    <Zap className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm font-bold">WebSocket Live</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-400 text-sm font-bold">Polling Mode</span>
                  </>
                )}
              </div>
            </div>

            {lastUpdated && (
              <div className="pt-3 border-t border-gray-800/50">
                <div className="text-xs text-gray-500 text-center font-medium">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
