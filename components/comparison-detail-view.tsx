"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  DollarSign, 
  BarChart3, 
  Zap,
  ArrowUp,
  ArrowDown,
  Minus,
  Target,
  Clock,
  Calendar,
  Volume2,
  LineChart,
  ArrowRight
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ComparisonDetailViewProps {
  firstDate: string
  secondDate: string
  selectedInstrument: string
  timeframe: string
  selectedMetrics: string[],
  filtereddata:any
}

interface ComparisonData {
  firstDate: {
    date: string
    price: number
    volume: number
    volatility: number
    performance: number
    rsi: number
    bollinger: { upper: number; middle: number; lower: number }
  }
  secondDate: {
    date: string
    price: number
    volume: number
    volatility: number
    performance: number
    rsi: number
    bollinger: { upper: number; middle: number; lower: number }
  }
  summary: {
    priceChange: number
    priceChangePercent: number
    volumeChange: number
    volatilityChange: number
    performanceChange: number
    overallTrend: "bullish" | "bearish" | "neutral"
    significantChanges: string[]
  }
}

export function ComparisonDetailView({
  firstDate,
  secondDate,
  selectedInstrument,
  timeframe,
  selectedMetrics,
  filtereddata
}: ComparisonDetailViewProps) {
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null)
  const [loading, setLoading] = useState(true)

  const generateData = (): ComparisonData => {
    const firstPrice = filtereddata[0].close; 
    const secondPrice = filtereddata[1].close;
    
    return {
      firstDate: {
        date: firstDate,
        price: firstPrice,
        volume: filtereddata[0].volume,
        volatility: filtereddata[0].volatility,
        performance: filtereddata[0].performance,
        rsi: Math.max(
          0,
          Math.min(
            100,
            filtereddata[0].performance > 0
              ? 60 + filtereddata[0].performance * 10
              : 40 + filtereddata[0].performance * 10
          )
        ),
        bollinger: {
          upper: firstPrice * 1.02,
          middle: firstPrice,
          lower: firstPrice * 0.98,
        },
      },
      secondDate: {
        date: secondDate,
        price: secondPrice,
        volume: filtereddata[1].volume,
        volatility: filtereddata[1].volatility,
        performance: filtereddata[1].performance,
        rsi: Math.max(
          0,
          Math.min(
            100,
            filtereddata[1].performance > 0
              ? 60 + filtereddata[1].performance * 10
              : 40 + filtereddata[1].performance * 10
          )
        ),
        bollinger: {
          upper: secondPrice * 1.02,
          middle: secondPrice,
          lower: secondPrice * 0.98,
        },
      },
      summary: {
        priceChange: secondPrice - firstPrice,
        priceChangePercent: ((secondPrice - firstPrice) / firstPrice) * 100,
        volumeChange: filtereddata[1].volume - filtereddata[0].volume,
        volatilityChange:
          filtereddata[1].volatility - filtereddata[0].volatility,
        performanceChange:
          filtereddata[1].performance - filtereddata[0].performance,
        overallTrend: secondPrice > firstPrice ? "bullish" : "bearish",
        significantChanges: [],
      },
    };
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      const data = generateData()
      
      data.summary.volumeChange = data.secondDate.volume - data.firstDate.volume
      data.summary.volatilityChange = data.secondDate.volatility - data.firstDate.volatility
      data.summary.performanceChange = data.secondDate.performance - data.firstDate.performance
      
      const changes: string[] = []
      if (Math.abs(data.summary.priceChangePercent) > 5) {
        changes.push(`Price ${data.summary.priceChangePercent > 0 ? 'increased' : 'decreased'} by ${Math.abs(data.summary.priceChangePercent).toFixed(1)}%`)
      }
      if (Math.abs(data.summary.volatilityChange) > 5) {
        changes.push(`Volatility ${data.summary.volatilityChange > 0 ? 'increased' : 'decreased'} significantly`)
      }
      data.summary.significantChanges = changes
      
      setComparisonData(data)
      setLoading(false)
    }

    loadData()
  }, [firstDate, secondDate, selectedInstrument])

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="w-4 h-4 text-green-400" />
    if (change < 0) return <ArrowDown className="w-4 h-4 text-red-400" />
    return <Minus className="w-4 h-4 text-gray-400" />
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-400"
    if (change < 0) return "text-red-400"
    return "text-gray-400"
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  const formatNumber = (value: number, decimals: number = 2) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value)
  }

  const formatVolume = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`
    }
    return value.toString()
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          
          <p className="text-gray-400">Loading comparison data...</p>
        </div>
      </div>
    )
  }

  if (!comparisonData) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-400">Failed to load comparison data</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Summary Header */}
      <Card className="relative group">
        <div className="absolute -inset-1 bg-black rounded-lg blur "></div>
        <CardHeader className="relative bg-gray-900/20 backdrop-blur-sm rounded-t-lg">
          <CardTitle className="flex items-center gap-3">
            <Target className="w-6 h-6 text-green-400" />
            <span className="text-green-500 bg-clip-text">
              Comparison Summary
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative bg-gray-900/30 backdrop-blur-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Price Change */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                {getChangeIcon(comparisonData.summary.priceChange)}
                <span className="text-sm text-gray-400">Price Change</span>
              </div>
              <div className={cn("text-2xl font-bold", getChangeColor(comparisonData.summary.priceChange))}>
                {formatCurrency(Math.abs(comparisonData.summary.priceChange))}
              </div>
              <div className={cn("text-sm", getChangeColor(comparisonData.summary.priceChangePercent))}>
                {comparisonData.summary.priceChangePercent > 0 ? '+' : ''}{comparisonData.summary.priceChangePercent.toFixed(2)}%
              </div>
            </div>

            {/* Overall Trend */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-gray-400">Overall Trend</span>
              </div>
              <Badge 
                variant={comparisonData.summary.overallTrend === "bullish" ? "default" : "destructive"}
                className={cn(
                  "text-lg px-4 py-2",
                  comparisonData.summary.overallTrend === "bullish" 
                    ? "bg-green-600/20 text-green-400 border-green-500/50" 
                    : "bg-red-600/20 text-red-400 border-red-500/50"
                )}
              >
                {comparisonData.summary.overallTrend === "bullish" ? (
                  <TrendingUp className="w-4 h-4 mr-2" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-2" />
                )}
                {comparisonData.summary.overallTrend.toUpperCase()}
              </Badge>
            </div>

            {/* Significant Changes */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="text-sm text-gray-400">Key Changes</span>
              </div>
              <div className="text-lg font-bold text-white">
                {comparisonData.summary.significantChanges.length}
              </div>
              <div className="text-sm text-gray-400">
                Significant shifts detected
              </div>
            </div>
          </div>

          {/* Significant Changes List */}
          {comparisonData.summary.significantChanges.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-700/50">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Notable Changes:</h4>
              <div className="space-y-2">
                {comparisonData.summary.significantChanges.map((change, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span className="text-gray-300">{change}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Side-by-Side Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* First Date Card */}
        <Card className="relative group">
          <div className="absolute -inset-1 bg-black rounded-lg blur "></div>
          <CardHeader className="relative bg-gradient-to-r from-purple-900/30 to-purple-800/30 backdrop-blur-sm rounded-t-lg border-b border-purple-700/50">
            <CardTitle className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-purple-400" />
              <span className="text-purple-400">{firstDate}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative bg-gray-900/30 backdrop-blur-sm p-6 space-y-4">
            {/* Price */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300">Price</span>
              </div>
              <span className="text-lg font-bold text-white">
                {formatCurrency(comparisonData.firstDate.price)}
              </span>
            </div>

            {/* Volume */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300">Volume</span>
              </div>
              <span className="text-lg font-bold text-white">
                {formatVolume(comparisonData.firstDate.volume)}
              </span>
            </div>

            {/* Volatility */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300">Volatility</span>
              </div>
              <span className="text-lg font-bold text-white">
                {formatNumber(comparisonData.firstDate.volatility)}%
              </span>
            </div>

            {/* Performance */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300">Performance</span>
              </div>
              <span className={cn(
                "text-lg font-bold",
                getChangeColor(comparisonData.firstDate.performance)
              )}>
                {comparisonData.firstDate.performance > 0 ? '+' : ''}{formatNumber(comparisonData.firstDate.performance)}%
              </span>
            </div>

            {/* RSI */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LineChart className="w-4 h-4 text-purple-400" />
                  <span className="text-gray-300">RSI</span>
                </div>
                <span className="text-lg font-bold text-white">
                  {formatNumber(comparisonData.firstDate.rsi)}
                </span>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Second Date Card */}
        <Card className="relative group">
          <div className="absolute -inset-1 bg-black rounded-lg blur "></div>
          <CardHeader className="relative bg-gradient-to-r from-orange-900/30 to-orange-800/30 backdrop-blur-sm rounded-t-lg border-b border-orange-700/50">
            <CardTitle className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-orange-400" />
              <span className="text-orange-400">{secondDate}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative bg-gray-900/30 backdrop-blur-sm p-6 space-y-4">
            {/* Price */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-orange-400" />
                <span className="text-gray-300">Price</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-white">
                  {formatCurrency(comparisonData.secondDate.price)}
                </span>
                {getChangeIcon(comparisonData.summary.priceChange)}
              </div>
            </div>

            {/* Volume */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-orange-400" />
                <span className="text-gray-300">Volume</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-white">
                  {formatVolume(comparisonData.secondDate.volume)}
                </span>
                {getChangeIcon(comparisonData.summary.volumeChange)}
              </div>
            </div>

            {/* Volatility */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-orange-400" />
                <span className="text-gray-300">Volatility</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-white">
                  {formatNumber(comparisonData.secondDate.volatility)}%
                </span>
                {getChangeIcon(comparisonData.summary.volatilityChange)}
              </div>
            </div>

            {/* Performance */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-orange-400" />
                <span className="text-gray-300">Performance</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-lg font-bold",
                  getChangeColor(comparisonData.secondDate.performance)
                )}>
                  {comparisonData.secondDate.performance > 0 ? '+' : ''}{formatNumber(comparisonData.secondDate.performance)}%
                </span>
                {getChangeIcon(comparisonData.summary.performanceChange)}
              </div>
            </div>

            {/* RSI */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LineChart className="w-4 h-4 text-orange-400" />
                  <span className="text-gray-300">RSI</span>
                </div>
                <span className="text-lg font-bold text-white">
                  {formatNumber(comparisonData.secondDate.rsi)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Technical Analysis Comparison */}
      <Card className="relative group">
        <div className="absolute -inset-1 bg-black rounded-lg blur "></div>
        <CardHeader className="relative bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-t-lg border-b border-gray-700/50">
          <CardTitle className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            <span className="bg-green-400 bg-clip-text text-transparent">
              Technical Analysis Comparison
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative bg-gray-900/30 backdrop-blur-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bollinger Bands Comparison */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Bollinger Bands</h4>
              
              {/* First Date Bollinger */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-purple-400 font-medium">{firstDate}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Upper</span>
                    <span className="text-white">{formatCurrency(comparisonData.firstDate.bollinger.upper)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Middle</span>
                    <span className="text-white">{formatCurrency(comparisonData.firstDate.bollinger.middle)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Lower</span>
                    <span className="text-white">{formatCurrency(comparisonData.firstDate.bollinger.lower)}</span>
                  </div>
                </div>
              </div>

              {/* Second Date Bollinger */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-orange-400 font-medium">{secondDate}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Upper</span>
                    <span className="text-white">{formatCurrency(comparisonData.secondDate.bollinger.upper)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Middle</span>
                    <span className="text-white">{formatCurrency(comparisonData.secondDate.bollinger.middle)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Lower</span>
                    <span className="text-white">{formatCurrency(comparisonData.secondDate.bollinger.lower)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Market Sentiment Analysis */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Market Sentiment</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">RSI Comparison</span>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400 text-sm">{formatNumber(comparisonData.firstDate.rsi)}</span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <span className="text-orange-400 text-sm">{formatNumber(comparisonData.secondDate.rsi)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}