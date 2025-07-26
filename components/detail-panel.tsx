"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, TrendingUp, TrendingDown, BarChart3, Activity, Loader2, Download, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useDetailedMetrics } from "@/hooks/use-detailed-metrics"
import { useState } from "react"

interface DetailPanelProps {
  isOpen: boolean
  onClose: () => void
  selectedDate: string | null
  selectedInstrument: string
  timeframe: string
}

export function DetailPanel({ isOpen, onClose, selectedDate, selectedInstrument, timeframe }: DetailPanelProps) {
  const [exportFormat, setExportFormat] = useState<"pdf" | "csv" | "json">("pdf")

  const instrument = selectedInstrument || "BTCUSDT"

  const { metrics, loading, error } = useDetailedMetrics(instrument.replace("/", ""), selectedDate)

  const handleExport = () => {
    if (!metrics || !selectedDate) return

    const data = {
      date: selectedDate,
      instrument: selectedInstrument,
      metrics: metrics,
      exportedAt: new Date().toISOString(),
    }

    switch (exportFormat) {
      case "json":
        const jsonBlob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
        const jsonUrl = URL.createObjectURL(jsonBlob)
        const jsonLink = document.createElement("a")
        jsonLink.href = jsonUrl
        jsonLink.download = `market-data-${selectedDate}.json`
        jsonLink.click()
        break

      case "csv":
        const csvData = [
          ["Metric", "Value"],
          ["Date", selectedDate],
          ["Instrument", selectedInstrument],
          ["Open", metrics.ohlc.open],
          ["High", metrics.ohlc.high],
          ["Low", metrics.ohlc.low],
          ["Close", metrics.ohlc.close],
          ["Volume", metrics.volume],
          ["Quote Volume", metrics.quoteVolume],
          ["Volatility %", metrics.volatility],
          ["RSI", metrics.rsi],
          ["MA(20)", metrics.ma20],
          ["MA(50)", metrics.ma50],
          ["Change", metrics.change],
          ["Change %", metrics.changePercent],
          ["Number of Trades", metrics.numberOfTrades],
        ]
          .map((row) => row.join(","))
          .join("\n")

        const csvBlob = new Blob([csvData], { type: "text/csv" })
        const csvUrl = URL.createObjectURL(csvBlob)
        const csvLink = document.createElement("a")
        csvLink.href = csvUrl
        csvLink.download = `market-data-${selectedDate}.csv`
        csvLink.click()
        break

      case "pdf":
        // For PDF, we'll create a simple HTML version and print it
        const printWindow = window.open("", "_blank")
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>Market Data - ${selectedDate}</title>
                <style>
                  body { font-family: Arial, sans-serif; margin: 20px; }
                  .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
                  .metric-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee; }
                  .positive { color: green; }
                  .negative { color: red; }
                </style>
              </head>
              <body>
                <div class="header">
                  <h1>Market Data Analysis</h1>
                  <p><strong>Date:</strong> ${selectedDate}</p>
                  <p><strong>Instrument:</strong> ${selectedInstrument}</p>
                  <p><strong>Timeframe:</strong> ${timeframe}</p>
                </div>
                <div class="metrics">
                  <h2>Price Data (OHLC)</h2>
                  <div class="metric-row"><span>Open:</span><span>$${metrics.ohlc.open.toLocaleString()}</span></div>
                  <div class="metric-row"><span>High:</span><span>$${metrics.ohlc.high.toLocaleString()}</span></div>
                  <div class="metric-row"><span>Low:</span><span>$${metrics.ohlc.low.toLocaleString()}</span></div>
                  <div class="metric-row"><span>Close:</span><span>$${metrics.ohlc.close.toLocaleString()}</span></div>
                  
                  <h2>Volume & Trading</h2>
                  <div class="metric-row"><span>Volume:</span><span>${metrics.volume.toLocaleString()}</span></div>
                  <div class="metric-row"><span>Quote Volume:</span><span>$${metrics.quoteVolume.toLocaleString()}</span></div>
                  <div class="metric-row"><span>Number of Trades:</span><span>${metrics.numberOfTrades.toLocaleString()}</span></div>
                  
                  <h2>Performance & Volatility</h2>
                  <div class="metric-row"><span>Price Change:</span><span class="${metrics.change >= 0 ? "positive" : "negative"}">$${metrics.change.toFixed(2)}</span></div>
                  <div class="metric-row"><span>Change %:</span><span class="${metrics.changePercent >= 0 ? "positive" : "negative"}">${metrics.changePercent.toFixed(2)}%</span></div>
                  <div class="metric-row"><span>Volatility:</span><span>${metrics.volatility.toFixed(2)}%</span></div>
                  
                  <h2>Technical Indicators</h2>
                  <div class="metric-row"><span>RSI (14):</span><span>${metrics.rsi.toFixed(2)}</span></div>
                  <div class="metric-row"><span>MA (20):</span><span>$${metrics.ma20.toLocaleString()}</span></div>
                  <div class="metric-row"><span>MA (50):</span><span>$${metrics.ma50.toLocaleString()}</span></div>
                </div>
                <div style="margin-top: 30px; font-size: 12px; color: #666;">
                  <p>Generated on: ${new Date().toLocaleString()}</p>
                  <p>Data source: Binance API</p>
                </div>
              </body>
            </html>
          `)
          printWindow.document.close()
          printWindow.print()
        }
        break
    }
  }

  const handleShare = async () => {
    if (!metrics || !selectedDate) return

    const shareData = {
      title: `Market Data - ${selectedInstrument}`,
      text: `${selectedInstrument} analysis for ${selectedDate}: ${metrics.changePercent >= 0 ? "+" : ""}${metrics.changePercent.toFixed(2)}% change, $${metrics.ohlc.close.toLocaleString()} close`,
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      const textToCopy = `${shareData.title}\n${shareData.text}\n${shareData.url}`
      navigator.clipboard.writeText(textToCopy).then(() => {
        alert("Data copied to clipboard!")
      })
    }
  }

  if (!isOpen || !selectedDate) return null

  const isPositive = metrics ? metrics.change > 0 : false

  return (
    <>
      {/* Mobile overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onClose} />

      {/* Panel */}
      <div
        className={cn(
          "fixed right-0 top-16 bottom-0 w-96 bg-black border-l border-gray-800 z-50",
          "transform transition-transform duration-300 ease-in-out",
          "lg:relative lg:top-0 lg:transform-none lg:z-0",
          isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0",
        )}
      >
        <div className="h-full overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <div>
              <h3 className="text-lg font-semibold text-white">Detailed Analysis</h3>
              <p className="text-sm text-gray-400">
                {selectedDate} • {selectedInstrument || "BTC/USDT"}
              </p>
              <p className="text-xs text-green-400">Live data from Binance API</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="text-gray-400 hover:text-white hover:bg-gray-800"
                disabled={!metrics}
              >
                <Share2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-green-500" />
                <span className="ml-2 text-gray-400">Loading detailed metrics...</span>
              </div>
            )}

            {error && (
              <div className="text-center py-8">
                <div className="text-red-400 mb-2">⚠️ Error loading metrics</div>
                <p className="text-gray-400 text-sm">{error}</p>
              </div>
            )}

            {metrics && !loading && (
              <>
                {/* Export Controls */}
                <Card className="bg-gray-900 border-gray-800 animate-slideIn">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-300 flex items-center">
                      <Download className="w-4 h-4 mr-2" />
                      Export & Share
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex space-x-2">
                      {(["pdf", "csv", "json"] as const).map((format) => (
                        <Button
                          key={format}
                          variant={exportFormat === format ? "default" : "outline"}
                          size="sm"
                          onClick={() => setExportFormat(format)}
                          className={cn(
                            "text-xs transition-all duration-200 transform hover:scale-105",
                            exportFormat === format
                              ? "bg-green-600 hover:bg-green-700 text-white border-green-600 shadow-lg shadow-green-600/20"
                              : "bg-black hover:bg-gray-700 text-gray-300 border-gray-700 hover:border-gray-600",
                          )}
                        >
                          {format.toUpperCase()}
                        </Button>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={handleExport}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-green-600/20"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>

                      <Button
                        onClick={handleShare}
                        size="sm"
                        variant="outline"
                        className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white transition-all duration-200 transform hover:scale-105 bg-transparent"
                        disabled={!metrics}
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>

                    {/* Quick stats preview */}
                    {metrics && (
                      <div className="mt-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
                        <div className="text-xs text-gray-400 mb-2">Quick Preview</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="text-center">
                            <div className="text-white font-mono">${metrics.ohlc.close.toLocaleString()}</div>
                            <div className="text-gray-400">Close</div>
                          </div>
                          <div className="text-center">
                            <div
                              className={cn(
                                "font-mono",
                                metrics.changePercent >= 0 ? "text-green-400" : "text-red-400",
                              )}
                            >
                              {metrics.changePercent >= 0 ? "+" : ""}
                              {metrics.changePercent.toFixed(1)}%
                            </div>
                            <div className="text-gray-400">Change</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Price Overview */}
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-300 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Price Overview (OHLC)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Close:</span>
                      <span className="text-white font-mono">
                        ${metrics.ohlc.close.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Change:</span>
                      <span
                        className={cn("font-mono flex items-center", isPositive ? "text-green-400" : "text-red-400")}
                      >
                        {isPositive ? (
                          <TrendingUp className="w-3 h-3 mr-1" />
                        ) : (
                          <TrendingDown className="w-3 h-3 mr-1" />
                        )}
                        {isPositive ? "+" : ""}${metrics.change.toFixed(2)} ({isPositive ? "+" : ""}
                        {metrics.changePercent.toFixed(2)}%)
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-800">
                      <div>
                        <div className="text-xs text-gray-400">Open</div>
                        <div className="text-sm text-white font-mono">
                          ${metrics.ohlc.open.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">High</div>
                        <div className="text-sm text-white font-mono">
                          ${metrics.ohlc.high.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-gray-400">Low</div>
                        <div className="text-sm text-white font-mono">
                          ${metrics.ohlc.low.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Trades</div>
                        <div className="text-sm text-white font-mono">{metrics.numberOfTrades.toLocaleString()}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Volume & Liquidity */}
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-300 flex items-center">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Volume & Liquidity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Base Volume:</span>
                      <span className="text-white font-mono">
                        {metrics.volume >= 1000000
                          ? `${(metrics.volume / 1000000).toFixed(1)}M`
                          : `${(metrics.volume / 1000).toFixed(1)}K`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Quote Volume:</span>
                      <span className="text-white font-mono">
                        $
                        {metrics.quoteVolume >= 1000000
                          ? `${(metrics.quoteVolume / 1000000).toFixed(1)}M`
                          : `${(metrics.quoteVolume / 1000).toFixed(1)}K`}
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min((metrics.volume / 1000000) * 10, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-400">
                      Liquidity Score: {Math.min((metrics.volume / 1000000) * 10, 100).toFixed(1)}/100
                    </div>
                  </CardContent>
                </Card>

                {/* Volatility */}
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-300 flex items-center">
                      <Activity className="w-4 h-4 mr-2" />
                      Volatility Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Daily Range:</span>
                      <span className="text-white font-mono">{metrics.volatility.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Volatility Level:</span>
                      <span
                        className={cn(
                          "text-sm font-medium",
                          metrics.volatility > 5
                            ? "text-red-400"
                            : metrics.volatility > 2
                              ? "text-yellow-400"
                              : "text-green-400",
                        )}
                      >
                        {metrics.volatility > 5 ? "High" : metrics.volatility > 2 ? "Medium" : "Low"}
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className={cn(
                          "h-2 rounded-full transition-all duration-1000",
                          metrics.volatility > 5
                            ? "bg-red-500"
                            : metrics.volatility > 2
                              ? "bg-yellow-500"
                              : "bg-green-500",
                        )}
                        style={{ width: `${Math.min(metrics.volatility * 10, 100)}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Technical Indicators */}
                <Card className="bg-gray-900 border-gray-800 animate-slideIn">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-300 flex items-center">
                      <Activity className="w-4 h-4 mr-2" />
                      Technical Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* RSI with visual indicator */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">RSI (14)</span>
                        <span
                          className={cn(
                            "font-mono text-sm",
                            metrics.rsi > 70 ? "text-red-400" : metrics.rsi < 30 ? "text-green-400" : "text-white",
                          )}
                        >
                          {metrics.rsi.toFixed(1)}
                        </span>
                      </div>

                      {/* RSI visual bar */}
                      <div className="relative w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div className="absolute inset-y-0 left-0 w-full flex">
                          <div className="w-[30%] bg-green-500/30"></div>
                          <div className="w-[40%] bg-gray-600/30"></div>
                          <div className="w-[30%] bg-red-500/30"></div>
                        </div>
                        <div
                          className={cn(
                            "absolute inset-y-0 w-1 rounded-full transition-all duration-500",
                            metrics.rsi > 70 ? "bg-red-400" : metrics.rsi < 30 ? "bg-green-400" : "bg-blue-400",
                          )}
                          style={{ left: `${metrics.rsi}%` }}
                        />
                      </div>

                      <div className="text-xs text-center">
                        <span
                          className={cn(
                            "px-2 py-1 rounded text-xs",
                            metrics.rsi > 70
                              ? "bg-red-900/50 text-red-300"
                              : metrics.rsi < 30
                                ? "bg-green-900/50 text-green-300"
                                : "bg-gray-800 text-gray-300",
                          )}
                        >
                          {metrics.rsi > 70 ? "Overbought" : metrics.rsi < 30 ? "Oversold" : "Neutral"}
                        </span>
                      </div>
                    </div>

                    {/* Moving Averages with trend indicators */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">MA (20)</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-mono text-sm">
                            ${metrics.ma20.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                          {metrics.ohlc.close > metrics.ma20 ? (
                            <TrendingUp className="w-3 h-3 text-green-400" />
                          ) : (
                            <TrendingDown className="w-3 h-3 text-red-400" />
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">MA (50)</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-mono text-sm">
                            ${metrics.ma50.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                          {metrics.ohlc.close > metrics.ma50 ? (
                            <TrendingUp className="w-3 h-3 text-green-400" />
                          ) : (
                            <TrendingDown className="w-3 h-3 text-red-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Price vs MA analysis */}
                    <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                      <div className="text-xs text-gray-400 mb-2">Price Position Analysis</div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">vs MA(20):</span>
                          <span
                            className={cn(
                              "font-mono",
                              metrics.ohlc.close > metrics.ma20 ? "text-green-400" : "text-red-400",
                            )}
                          >
                            {(((metrics.ohlc.close - metrics.ma20) / metrics.ma20) * 100).toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">vs MA(50):</span>
                          <span
                            className={cn(
                              "font-mono",
                              metrics.ohlc.close > metrics.ma50 ? "text-green-400" : "text-red-400",
                            )}
                          >
                            {(((metrics.ohlc.close - metrics.ma50) / metrics.ma50) * 100).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Market Sentiment */}
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-300">Market Sentiment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-400">Overall Sentiment:</span>
                      <span
                        className={cn(
                          "px-2 py-1 rounded text-xs font-medium",
                          isPositive ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300",
                        )}
                      >
                        {isPositive ? "Bullish" : "Bearish"}
                      </span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Trend Strength:</span>
                        <span className="text-white">{Math.abs(metrics.changePercent) > 3 ? "Strong" : "Weak"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Volume Confirmation:</span>
                        <span className="text-white">{metrics.volume > 1000000 ? "High" : "Low"}</span>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      Analysis based on price action, volume, and technical indicators
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
