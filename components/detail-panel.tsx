"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  X,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  Loader2,
  Download,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { binanceAPI } from "@/lib/binance-api";

interface DetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string | null;
  selectedInstrument: string;
  timeframe: "1d" | "1w" | "1M";
}

interface DetailedMetrics {
  ohlc: {
    open: number;
    high: number;
    low: number;
    close: number;
  };
  volume: number;
  quoteVolume: number;
  volatility: number;
  rsi: number;
  ma20: number;
  ma50: number;
  change: number;
  changePercent: number;
  numberOfTrades: number;
  period: string; // "Daily", "Weekly", "Monthly"
  dateRange: string; // Actual date range being shown
}

export function DetailPanel({
  isOpen,
  onClose,
  selectedDate,
  selectedInstrument,
  timeframe,
}: DetailPanelProps) {
  const [exportFormat, setExportFormat] = useState<"pdf" | "csv" | "json">(
    "pdf"
  );
  const [metrics, setMetrics] = useState<DetailedMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const instrument = selectedInstrument || "BTCUSDT";

  // Fetch and process data based on timeframe
  useEffect(() => {
    if (!selectedDate || !isOpen) {
      setMetrics(null);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const validSymbol = instrument.replace("/", "");

        // Map timeframe to Binance intervals and data amounts
        const intervalMap = {
          "1d": "1d",
          "1w": "1w",
          "1M": "1M",
        };

        const candleCount = {
          "1d": 100,
          "1w": 52,
          "1M": 24,
        };

        const binanceInterval = intervalMap[timeframe];
        const candleLimit = candleCount[timeframe];

        console.log(`Fetching ${timeframe} data for ${selectedDate}`);

        // Fetch raw data
        const klineData = await binanceAPI.getKlineData(
          validSymbol,
          binanceInterval,
          candleLimit
        );
        const processedData = binanceAPI.processKlineData(klineData);

        if (!processedData || processedData.length === 0) {
          throw new Error("No market data available");
        }

        // Find the appropriate data based on timeframe
        let selectedData;
        let period = "";
        let dateRange = "";

        if (timeframe === "1d") {
          // Daily: Find exact date or closest
          selectedData = processedData.find((d) => d.date === selectedDate);

          if (!selectedData) {
            const targetDate = new Date(selectedDate);
            selectedData = processedData.find((d) => {
              const dataDate = new Date(d.date);
              return (
                dataDate.getFullYear() === targetDate.getFullYear() &&
                dataDate.getMonth() === targetDate.getMonth() &&
                dataDate.getDate() === targetDate.getDate()
              );
            });
          }

          if (!selectedData) {
            // Find closest date
            const targetTime = new Date(selectedDate).getTime();
            selectedData = processedData.reduce((closest, current) => {
              const currentTime = new Date(current.date).getTime();
              const closestTime = new Date(closest.date).getTime();
              return Math.abs(currentTime - targetTime) <
                Math.abs(closestTime - targetTime)
                ? current
                : closest;
            });
          }

          period = "Daily";
          dateRange = selectedData
            ? new Date(selectedData.date).toLocaleDateString()
            : selectedDate;
        } else if (timeframe === "1w") {
          // Weekly: Find the week containing the selected date
          const targetDate = new Date(selectedDate);

          selectedData = processedData.find((d) => {
            const dataDate = new Date(d.date);
            const weekStart = new Date(dataDate);
            weekStart.setDate(dataDate.getDate() - dataDate.getDay()); // Start of week (Sunday)
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6); // End of week (Saturday)

            return targetDate >= weekStart && targetDate <= weekEnd;
          });

          if (!selectedData) {
            // Find closest week
            const targetTime = new Date(selectedDate).getTime();
            selectedData = processedData.reduce((closest, current) => {
              const currentTime = new Date(current.date).getTime();
              const closestTime = new Date(closest.date).getTime();
              return Math.abs(currentTime - targetTime) <
                Math.abs(closestTime - targetTime)
                ? current
                : closest;
            });
          }

          period = "Weekly";
          if (selectedData) {
            const dataDate = new Date(selectedData.date);
            const weekStart = new Date(dataDate);
            weekStart.setDate(dataDate.getDate() - dataDate.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            dateRange = `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`;
          }
        } else if (timeframe === "1M") {
          // Monthly: Find the month containing the selected date
          const targetDate = new Date(selectedDate);

          selectedData = processedData.find((d) => {
            const dataDate = new Date(d.date);
            return (
              dataDate.getFullYear() === targetDate.getFullYear() &&
              dataDate.getMonth() === targetDate.getMonth()
            );
          });

          if (!selectedData) {
            // Find closest month
            const targetTime = new Date(selectedDate).getTime();
            selectedData = processedData.reduce((closest, current) => {
              const currentTime = new Date(current.date).getTime();
              const closestTime = new Date(closest.date).getTime();
              return Math.abs(currentTime - targetTime) <
                Math.abs(closestTime - targetTime)
                ? current
                : closest;
            });
          }

          period = "Monthly";
          if (selectedData) {
            const dataDate = new Date(selectedData.date);
            const monthNames = [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ];
            dateRange = `${
              monthNames[dataDate.getMonth()]
            } ${dataDate.getFullYear()}`;
          }
        }

        if (!selectedData) {
          throw new Error(`No data found for ${period.toLowerCase()} period`);
        }

        // Calculate technical indicators
        const closePrices = processedData.map((d) => d.close);

        // Adjust MA periods based on timeframe
        let ma20Period = 20;
        let ma50Period = 50;

        if (timeframe === "1w") {
          ma20Period = 10; // 10 weeks
          ma50Period = 20; // 20 weeks
        } else if (timeframe === "1M") {
          ma20Period = 6; // 6 months
          ma50Period = 12; // 12 months
        }

        const rsi = binanceAPI.calculateRSI(closePrices);
        const ma20 = binanceAPI.calculateMovingAverage(closePrices, ma20Period);
        const ma50 = binanceAPI.calculateMovingAverage(closePrices, ma50Period);

        setMetrics({
          ohlc: {
            open: selectedData.open,
            high: selectedData.high,
            low: selectedData.low,
            close: selectedData.close,
          },
          volume: selectedData.volume,
          quoteVolume: selectedData.quoteVolume,
          volatility: selectedData.volatility,
          rsi: typeof rsi === "number" && !isNaN(rsi) ? rsi : 50,
          ma20:
            typeof ma20 === "number" && !isNaN(ma20)
              ? ma20
              : selectedData.close,
          ma50:
            typeof ma50 === "number" && !isNaN(ma50)
              ? ma50
              : selectedData.close,
          change: selectedData.close - selectedData.open,
          changePercent: selectedData.performance,
          numberOfTrades: selectedData.numberOfTrades,
          period,
          dateRange,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch data"
        );
        setMetrics(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDate, instrument, timeframe, isOpen]);

  const handleExport = () => {
    if (!metrics || !selectedDate) return;

    const data = {
      date: selectedDate,
      instrument: selectedInstrument,
      timeframe,
      period: metrics.period,
      dateRange: metrics.dateRange,
      metrics: metrics,
      exportedAt: new Date().toISOString(),
    };

    switch (exportFormat) {
      case "json":
        const jsonBlob = new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        });
        const jsonUrl = URL.createObjectURL(jsonBlob);
        const jsonLink = document.createElement("a");
        jsonLink.href = jsonUrl;
        jsonLink.download = `market-data-${metrics.period.toLowerCase()}-${selectedDate}.json`;
        jsonLink.click();
        break;

      case "csv":
        const csvData = [
          ["Metric", "Value"],
          ["Date Range", metrics.dateRange],
          ["Period", metrics.period],
          ["Instrument", selectedInstrument],
          ["Timeframe", timeframe],
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
          .join("\n");

        const csvBlob = new Blob([csvData], { type: "text/csv" });
        const csvUrl = URL.createObjectURL(csvBlob);
        const csvLink = document.createElement("a");
        csvLink.href = csvUrl;
        csvLink.download = `market-data-${metrics.period.toLowerCase()}-${selectedDate}.csv`;
        csvLink.click();
        break;

      case "pdf":
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>${metrics.period} Market Data - ${
            metrics.dateRange
          }</title>
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
                  <h1>${metrics.period} Market Data Analysis</h1>
                  <p><strong>Period:</strong> ${metrics.dateRange}</p>
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
                  <div class="metric-row"><span>Price Change:</span><span class="${
                    metrics.change >= 0 ? "positive" : "negative"
                  }">$${metrics.change.toFixed(2)}</span></div>
                  <div class="metric-row"><span>Change %:</span><span class="${
                    metrics.changePercent >= 0 ? "positive" : "negative"
                  }">${metrics.changePercent.toFixed(2)}%</span></div>
                  <div class="metric-row"><span>Volatility:</span><span>${metrics.volatility.toFixed(
                    2
                  )}%</span></div>
                  
                  <h2>Technical Indicators</h2>
                  <div class="metric-row"><span>RSI (14):</span><span>${metrics.rsi.toFixed(
                    2
                  )}</span></div>
                  <div class="metric-row"><span>MA (20):</span><span>$${metrics.ma20.toLocaleString()}</span></div>
                  <div class="metric-row"><span>MA (50):</span><span>$${metrics.ma50.toLocaleString()}</span></div>
                </div>
                <div style="margin-top: 30px; font-size: 12px; color: #666;">
                  <p>Generated on: ${new Date().toLocaleString()}</p>
                  <p>Data source: Binance API</p>
                </div>
              </body>
            </html>
          `);
          printWindow.document.close();
          printWindow.print();
        }
        break;
    }
  };

  const handleShare = async () => {
    if (!metrics || !selectedDate) return;

    const shareData = {
      title: `${metrics.period} Market Data - ${selectedInstrument}`,
      text: `${selectedInstrument} ${metrics.period.toLowerCase()} analysis for ${
        metrics.dateRange
      }: ${
        metrics.changePercent >= 0 ? "+" : ""
      }${metrics.changePercent.toFixed(
        2
      )}% change, $${metrics.ohlc.close.toLocaleString()} close`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      const textToCopy = `${shareData.title}\n${shareData.text}\n${shareData.url}`;
      navigator.clipboard.writeText(textToCopy).then(() => {
        alert("Data copied to clipboard!");
      });
    }
  };

  if (!isOpen || !selectedDate) return null;

  const isPositive = metrics ? metrics.change > 0 : false;

  return (
    <>
      {/* Mobile overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className={cn(
          "fixed right-0 top-16 bottom-0 w-96 bg-black border-l border-gray-800 z-50",
          "transform transition-transform duration-300 ease-in-out",
          "lg:relative lg:top-0 lg:transform-none lg:z-0",
          isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
      >
        <div className="h-full overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {metrics ? `${metrics.period} Analysis` : "Detailed Analysis"}
              </h3>
              <p className="text-sm text-gray-400">
                {metrics ? metrics.dateRange : selectedDate} •{" "}
                {selectedInstrument || "BTC/USDT"}
              </p>
              <p className="text-xs text-green-400">
                {metrics
                  ? `${metrics.period} data from Binance API`
                  : "Live data from Binance API"}
              </p>
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
                <span className="ml-2 text-gray-400">
                  Loading{" "}
                  {timeframe === "1d"
                    ? "daily"
                    : timeframe === "1w"
                    ? "weekly"
                    : "monthly"}{" "}
                  metrics...
                </span>
              </div>
            )}

            {error && (
              <div className="text-center py-8">
                <div className="text-red-400 mb-2">
                  ⚠️ Error loading metrics
                </div>
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
                          variant={
                            exportFormat === format ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setExportFormat(format)}
                          className={cn(
                            "text-xs transition-all duration-200 transform hover:scale-105",
                            exportFormat === format
                              ? "bg-green-600 hover:bg-green-700 text-white border-green-600 shadow-lg shadow-green-600/20"
                              : "bg-black hover:bg-gray-700 text-gray-300 border-gray-700 hover:border-gray-600"
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
                    <div className="mt-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
                      <div className="text-xs text-gray-400 mb-2">
                        {metrics.period} Summary
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="text-center">
                          <div className="text-white font-mono">
                            ${metrics.ohlc.close.toLocaleString()}
                          </div>
                          <div className="text-gray-400">Close</div>
                        </div>
                        <div className="text-center">
                          <div
                            className={cn(
                              "font-mono",
                              metrics.changePercent >= 0
                                ? "text-green-400"
                                : "text-red-400"
                            )}
                          >
                            {metrics.changePercent >= 0 ? "+" : ""}
                            {metrics.changePercent.toFixed(1)}%
                          </div>
                          <div className="text-gray-400">
                            {metrics.period} Change
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Price Overview */}
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-300 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      {metrics.period} Price Overview (OHLC)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Close:</span>
                      <span className="text-white font-mono">
                        $
                        {metrics.ohlc.close.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">
                        {metrics.period} Change:
                      </span>
                      <span
                        className={cn(
                          "font-mono flex items-center",
                          isPositive ? "text-green-400" : "text-red-400"
                        )}
                      >
                        {isPositive ? (
                          <TrendingUp className="w-3 h-3 mr-1" />
                        ) : (
                          <TrendingDown className="w-3 h-3 mr-1" />
                        )}
                        {isPositive ? "+" : ""}${metrics.change.toFixed(2)} (
                        {isPositive ? "+" : ""}
                        {metrics.changePercent.toFixed(2)}%)
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-800">
                      <div>
                        <div className="text-xs text-gray-400">Open</div>
                        <div className="text-sm text-white font-mono">
                          $
                          {metrics.ohlc.open.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">High</div>
                        <div className="text-sm text-white font-mono">
                          $
                          {metrics.ohlc.high.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-gray-400">Low</div>
                        <div className="text-sm text-white font-mono">
                          $
                          {metrics.ohlc.low.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Trades</div>
                        <div className="text-sm text-white font-mono">
                          {metrics.numberOfTrades.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Volume & Liquidity */}
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-300 flex items-center">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      {metrics.period} Volume & Liquidity
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
                        style={{
                          width: `${Math.min(
                            (metrics.volume / 1000000) * 10,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="text-xs text-gray-400">
                      Liquidity Score:{" "}
                      {Math.min((metrics.volume / 1000000) * 10, 100).toFixed(
                        1
                      )}
                      /100
                    </div>
                  </CardContent>
                </Card>

                {/* Volatility */}
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-300 flex items-center">
                      <Activity className="w-4 h-4 mr-2" />
                      {metrics.period} Volatility Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">
                        {metrics.period} Range:
                      </span>
                      <span className="text-white font-mono">
                        {metrics.volatility.toFixed(2)}%
                      </span>
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
                            : "text-green-400"
                        )}
                      >
                        {metrics.volatility > 5
                          ? "High"
                          : metrics.volatility > 2
                          ? "Medium"
                          : "Low"}
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
                            : "bg-green-500"
                        )}
                        style={{
                          width: `${Math.min(metrics.volatility * 10, 100)}%`,
                        }}
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
                            metrics.rsi > 70
                              ? "text-red-400"
                              : metrics.rsi < 30
                              ? "text-green-400"
                              : "text-white"
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
                            metrics.rsi > 70
                              ? "bg-red-400"
                              : metrics.rsi < 30
                              ? "bg-green-400"
                              : "bg-blue-400"
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
                              : "bg-gray-800 text-gray-300"
                          )}
                        >
                          {metrics.rsi > 70
                            ? "Overbought"
                            : metrics.rsi < 30
                            ? "Oversold"
                            : "Neutral"}
                        </span>
                      </div>
                    </div>

                    {/* Moving Averages with trend indicators */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">
                          MA (
                          {timeframe === "1w"
                            ? "10"
                            : timeframe === "1M"
                            ? "6"
                            : "20"}
                          )
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-mono text-sm">
                            $
                            {metrics.ma20.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                          {metrics.ohlc.close > metrics.ma20 ? (
                            <TrendingUp className="w-3 h-3 text-green-400" />
                          ) : (
                            <TrendingDown className="w-3 h-3 text-red-400" />
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">
                          MA (
                          {timeframe === "1w"
                            ? "20"
                            : timeframe === "1M"
                            ? "12"
                            : "50"}
                          )
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-mono text-sm">
                            $
                            {metrics.ma50.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                            })}
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
                      <div className="text-xs text-gray-400 mb-2">
                        Price Position Analysis
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">
                            vs MA(
                            {timeframe === "1w"
                              ? "10"
                              : timeframe === "1M"
                              ? "6"
                              : "20"}
                            ):
                          </span>
                          <span
                            className={cn(
                              "font-mono",
                              metrics.ohlc.close > metrics.ma20
                                ? "text-green-400"
                                : "text-red-400"
                            )}
                          >
                            {(
                              ((metrics.ohlc.close - metrics.ma20) /
                                metrics.ma20) *
                              100
                            ).toFixed(2)}
                            %
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">
                            vs MA(
                            {timeframe === "1w"
                              ? "20"
                              : timeframe === "1M"
                              ? "12"
                              : "50"}
                            ):
                          </span>
                          <span
                            className={cn(
                              "font-mono",
                              metrics.ohlc.close > metrics.ma50
                                ? "text-green-400"
                                : "text-red-400"
                            )}
                          >
                            {(
                              ((metrics.ohlc.close - metrics.ma50) /
                                metrics.ma50) *
                              100
                            ).toFixed(2)}
                            %
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Market Sentiment */}
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-300">
                      {metrics.period} Market Sentiment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-400">Overall Sentiment:</span>
                      <span
                        className={cn(
                          "px-2 py-1 rounded text-xs font-medium",
                          isPositive
                            ? "bg-green-900 text-green-300"
                            : "bg-red-900 text-red-300"
                        )}
                      >
                        {isPositive ? "Bullish" : "Bearish"}
                      </span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Trend Strength:</span>
                        <span className="text-white">
                          {Math.abs(metrics.changePercent) > 3
                            ? "Strong"
                            : "Weak"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">
                          Volume Confirmation:
                        </span>
                        <span className="text-white">
                          {metrics.volume > 1000000 ? "High" : "Low"}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      Analysis based on {metrics.period.toLowerCase()} price
                      action, volume, and technical indicators
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
