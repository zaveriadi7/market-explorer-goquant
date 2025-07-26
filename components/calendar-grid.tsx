"use client";

import type React from "react";

import { Card } from "@/components/ui/card";
import {
  ArrowUp,
  ArrowDown,
  BarChart3,
  RefreshCw,
  Activity,
  Calendar,
  TrendingUp,
  TrendingDown,
  Zap,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRealtimeData } from "@/hooks/use-realtime-data";
import { PriceIndicator } from "@/components/ui/price-indicator";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { ConnectionStatus } from "@/components/ui/connection-status";
import { useState, useCallback, useEffect, useMemo } from "react";

interface CalendarGridProps {
  timeframe: string;
  selectedMetrics: string[];
  onDateSelect: (date: string) => void;
  selectedDate: string | null;
  selectedInstrument: string;
}

interface TooltipData {
  date: string;
  volatility: number;
  performance: number;
  volume: number;
  high: number;
  low: number;
  close: number;
}

interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  marketData?: any;
  isEmpty?: boolean;
}

export function CalendarGrid({
  timeframe,
  selectedMetrics,
  onDateSelect,
  selectedDate,
  selectedInstrument,
}: CalendarGridProps) {
  const [hoveredCell, setHoveredCell] = useState<TooltipData | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const instrument = selectedInstrument || "BTCUSDT";

  // Helper function to format date consistently
  const formatDateString = (date: Date): string => {
    // Always format as YYYY-MM-DD in UTC
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Helper function to parse date string consistently
  const parseDataDate = (dateString: string): Date => {
    // Handle both ISO format and other formats
    const date = new Date(dateString + "T00:00:00.000Z");
    return date;
  };

  // Calculate date range for the current month view with extended range for historical data
  const dateRange = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // For different timeframes, we need different ranges
    if (timeframe === "Monthly") {
      // For monthly view, get full year data
      const start = new Date(year - 1, 0, 1); // Start from previous year
      const end = new Date(year + 1, 11, 31); // End at next year
      return { start, end };
    } else if (timeframe === "Weekly") {
      // For weekly view, get current month + surrounding months
      const start = new Date(year, month - 2, 1);
      const end = new Date(year, month + 2, 0);
      return { start, end };
    } else {
      // For daily view
      const firstDay = new Date(Date.UTC(year, month, 1));
      const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

      // Extend range to include previous and next month days that appear in calendar
      const startingDayOfWeek = firstDay.getDay();
      const start = new Date(
        Date.UTC(
          year,
          month - 1,
          new Date(Date.UTC(year, month - 1, 0)).getUTCDate() -
            startingDayOfWeek +
            1
        )
      );

      // Calculate end date (42 days from start to cover full 6-week calendar)
      const end = new Date(start);
      end.setDate(start.getDate() + 41);

      // For historical months, extend the range further back
      const now = new Date();
      const isHistoricalMonth = currentMonth < now;

      if (isHistoricalMonth) {
        const extendedStart = new Date(Date.UTC(year, month - 6, 1));
        return {
          start: extendedStart,
          end: new Date(now),
        };
      }

      return { start, end };
    }
  }, [currentMonth, timeframe]);

  const {
    data,
    ticker,
    loading,
    error,
    lastUpdated,
    isConnected,
    priceChange,
    connectionAttempts,
    refetch,
    retryConnection,
  } = useRealtimeData(instrument.replace("/", ""), timeframe, dateRange);

  // Generate calendar days for daily view (only current month days)
  const generateDailyCalendarDays = (): CalendarDay[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const calendarDays: CalendarDay[] = [];

    // Get first day of month and its day of week
    const firstDay = new Date(Date.UTC(year, month, 1));
    const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Get last day of month
    const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      calendarDays.push({
        date: new Date(Date.UTC(year, month, 1 - (firstDayOfWeek - i))), // Placeholder, but in UTC
        day: 0,
        isCurrentMonth: false,
        marketData: null,
        isEmpty: true,
      });
    }

    // Add actual days of the month
    for (let day = 1; day <= lastDay; day++) {
      const date = new Date(Date.UTC(year, month, day));
      const dateString = formatDateString(date);

      // Find matching market data with exact date comparison
      const marketData = data.find((d) => {
        const dataDate = parseDataDate(d.date);
        const dataDateString = formatDateString(dataDate);
        return dataDateString === dateString;
      });

      calendarDays.push({
        date,
        day,
        isCurrentMonth: true,
        marketData,
        isEmpty: false,
      });
    }

    return calendarDays;
  };

  // Generate weeks for weekly view (only weeks that have days in current month)
  const generateWeeklyCalendarDays = (): CalendarDay[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const weeks: CalendarDay[] = [];

    // Get first and last day of the current month
    const firstDay = new Date(Date.UTC(year, month, 1));
    const lastDay = new Date(Date.UTC(year, month + 1, 0));

    // Find all weeks that contain days from this month
    const monthWeeks: { start: Date; end: Date; weekNumber: number }[] = [];

    // Start from the first day of the month
    const currentDate = new Date(firstDay);
    let weekNumber = 1;

    while (currentDate <= lastDay) {
      // Find the start of this week (Sunday)
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - currentDate.getDay());

      // Find the end of this week (Saturday)
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      // Only include weeks that have at least one day in the current month
      if (weekEnd >= firstDay && weekStart <= lastDay) {
        monthWeeks.push({ start: weekStart, end: weekEnd, weekNumber });
        weekNumber++;
      }

      // Move to next week
      currentDate.setDate(currentDate.getDate() + 7);
    }

    // Generate calendar days for each week
    for (const week of monthWeeks) {
      // Find market data for this week (only include days from current month)
      const weekData = data.filter((d) => {
        const dataDate = parseDataDate(d.date);

        // Check if data date is within this week AND in current month
        return (
          dataDate >= week.start &&
          dataDate <= week.end &&
          dataDate.getMonth() === month &&
          dataDate.getFullYear() === year
        );
      });

      // Aggregate week data
      let aggregatedData = null;
      if (weekData.length > 0) {
        const totalVolume = weekData.reduce((sum, d) => sum + d.volume, 0);
        const avgVolatility =
          weekData.reduce((sum, d) => sum + d.volatility, 0) / weekData.length;
        const weekPerformance =
          ((weekData[weekData.length - 1].close - weekData[0].open) /
            weekData[0].open) *
          100;

        aggregatedData = {
          date: formatDateString(week.start),
          day: week.weekNumber,
          open: weekData[0].open,
          high: Math.max(...weekData.map((d) => d.high)),
          low: Math.min(...weekData.map((d) => d.low)),
          close: weekData[weekData.length - 1].close,
          volume: totalVolume,
          quoteVolume: weekData.reduce((sum, d) => sum + d.quoteVolume, 0),
          performance: weekPerformance,
          volatility: avgVolatility,
          heatmapIntensity: Math.min(Math.abs(weekPerformance) / 10, 1),
          trend: weekPerformance >= 0 ? "up" : "down",
          numberOfTrades: weekData.reduce(
            (sum, d) => sum + d.numberOfTrades,
            0
          ),
        };
      }

      weeks.push({
        date: week.start,
        day: week.weekNumber,
        isCurrentMonth: true,
        marketData: aggregatedData,
        isEmpty: false,
      });
    }

    return weeks;
  };

  // Generate months for yearly view (12 months of current year)
  const generateMonthlyCalendarDays = (): CalendarDay[] => {
    const year = currentMonth.getFullYear();
    const months: CalendarDay[] = [];

    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      const monthStart = new Date(Date.UTC(year, monthIndex, 1));
      const monthEnd = new Date(Date.UTC(year, monthIndex + 1, 0));

      // Find market data for this month with exact date matching
      const monthData = data.filter((d) => {
        const dataDate = parseDataDate(d.date);
        return (
          dataDate >= monthStart &&
          dataDate <= monthEnd &&
          dataDate.getMonth() === monthIndex &&
          dataDate.getFullYear() === year
        );
      });

      // Aggregate month data
      let aggregatedData = null;
      if (monthData.length > 0) {
        const totalVolume = monthData.reduce((sum, d) => sum + d.volume, 0);
        const avgVolatility =
          monthData.reduce((sum, d) => sum + d.volatility, 0) /
          monthData.length;
        const monthPerformance =
          ((monthData[monthData.length - 1].close - monthData[0].open) /
            monthData[0].open) *
          100;

        aggregatedData = {
          date: formatDateString(monthStart),
          day: monthIndex + 1,
          open: monthData[0].open,
          high: Math.max(...monthData.map((d) => d.high)),
          low: Math.min(...monthData.map((d) => d.low)),
          close: monthData[monthData.length - 1].close,
          volume: totalVolume,
          quoteVolume: monthData.reduce((sum, d) => sum + d.quoteVolume, 0),
          performance: monthPerformance,
          volatility: avgVolatility,
          heatmapIntensity: Math.min(Math.abs(monthPerformance) / 10, 1),
          trend: monthPerformance >= 0 ? "up" : "down",
          numberOfTrades: monthData.reduce(
            (sum, d) => sum + d.numberOfTrades,
            0
          ),
        };
      }

      months.push({
        date: monthStart,
        day: monthIndex + 1,
        isCurrentMonth: true,
        marketData: aggregatedData,
        isEmpty: false,
      });
    }

    return months;
  };

  // Main function to generate calendar days based on timeframe
  const generateCalendarDays = (): CalendarDay[] => {
    switch (timeframe) {
      case "Weekly":
        return generateWeeklyCalendarDays();
      case "Monthly":
        return generateMonthlyCalendarDays();
      default:
        return generateDailyCalendarDays();
    }
  };

  // Calendar Header - Update to show different headers based on timeframe
  

  // --- Update getGridCols to always return fixed columns for week/month ---
  

  const calendarDays = generateCalendarDays();

  // Debug logging to see what data we have
  useEffect(() => {
    if (data.length > 0) {
      console.log(`Calendar for ${currentMonth.toISOString().split("T")[0]}:`, {
        timeframe,
        totalDataPoints: data.length,
        dateRange: {
          first: data[0]?.date,
          last: data[data.length - 1]?.date,
        },
        currentMonthData: data.filter((d) => {
          const dataDate = parseDataDate(d.date);
          return (
            dataDate.getMonth() === currentMonth.getMonth() &&
            dataDate.getFullYear() === currentMonth.getFullYear()
          );
        }).length,
        calendarDaysWithData: calendarDays.filter(
          (d) => d.marketData && !d.isEmpty
        ).length,
        sampleDataDates: data.slice(0, 5).map((d) => d.date),
        sampleCalendarDates: calendarDays
          .filter((d) => !d.isEmpty)
          .slice(0, 5)
          .map((d) => formatDateString(d.date)),
      });
    }
  }, [data, currentMonth, calendarDays, timeframe]);

  

    const formatVolume = (volume: number) => {
        if (volume >= 1000000) {
            return `${(volume / 1000000).toFixed(1)}M`;
        } else if (volume >= 1000) {
            return `${(volume / 1000).toFixed(1)}K`;
        }
        return volume.toFixed(0);
    };

  // Add keyboard navigation handler
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!data.length) return;

      const currentIndex = selectedDate
        ? data.findIndex((d) => d.date === selectedDate)
        : -1;
      let newIndex = currentIndex;

      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          newIndex = Math.max(0, currentIndex - 1);
          break;
        case "ArrowRight":
          event.preventDefault();
          newIndex = Math.min(data.length - 1, currentIndex + 1);
          break;
        case "ArrowUp":
          event.preventDefault();
          newIndex = Math.max(0, currentIndex - 7);
          break;
        case "ArrowDown":
          event.preventDefault();
          newIndex = Math.min(data.length - 1, currentIndex + 7);
          break;
        case "Enter":
          if (selectedDate) {
            event.preventDefault();
            onDateSelect(selectedDate);
          }
          break;
        case "Escape":
          event.preventDefault();
          onDateSelect("");
          break;
      }

      if (
        newIndex !== currentIndex &&
        newIndex >= 0 &&
        newIndex < data.length
      ) {
        onDateSelect(data[newIndex].date);
      }
    },
    [data, selectedDate, onDateSelect]
  );

  // Add useEffect for keyboard listeners
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (loading && data.length === 0) {
    return (
      <div className="flex-1 p-6 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-blue-500/5 animate-pulse"></div>
        <div className="relative mb-6">
          <LoadingSkeleton className="h-8 w-96 mb-2" />
          <LoadingSkeleton className="h-4 w-64" />
        </div>
        <div className="relative grid grid-cols-7 gap-2">
          {Array.from({ length: 42 }).map((_, i) => (
            <Card
              key={i}
              className="bg-gray-900/50 border-gray-800/50 min-h-[120px] p-3 backdrop-blur-sm"
            >
              <LoadingSkeleton rows={3} />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center relative">
        <div className="absolute inset-0"></div>
        <div className="relative text-center">
          <div className="relative group mb-6">
            <div className="absolute -inset-4 bg-gradient-to-r w-fit from-red-400/20 to-orange-500/20 rounded-full blur opacity-75 animate-pulse"></div>
            <div className="relative w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto border border-red-800/50">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </div>
          <div className="text-red-400 mb-4 text-xl font-bold">
            ⚠️ Error loading data
          </div>
          <p className="text-gray-400 mb-4">
            {error} : Please check your network settings
          </p>
          <div className="space-x-2">
            <Button
              onClick={refetch}
              variant="outline"
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-green-600/50 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-600/25 rounded-xl"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
            {retryConnection && (
              <Button
                onClick={retryConnection}
                variant="outline"
                className="border-blue-700 bg-transparent text-blue-400 hover:bg-blue-600 hover:text-white transition-all duration-300 transform hover:scale-105 rounded-xl"
              >
                <Zap className="w-4 h-4 mr-2" />
                Reset Connection
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-auto relative">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-blue-500/5 animate-pulse"></div>

      {/* Enhanced Tooltip */}
      {hoveredCell && (
        <div
          className="fixed !min-w-[400px] z-50  bg-gray-900/95 backdrop-blur-xl border border-gray-600/50 rounded-2xl p-6 shadow-2xl pointer-events-none animate-fadeIn"
          style={{
            left: Math.min(mousePosition.x + 15, window.innerWidth - 320),
            top: Math.max(mousePosition.y - 10, 10),
            transform: "translate(-150%, -150%)",
          }}
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-green-400/20 to-blue-500/20 rounded-2xl blur opacity-50"></div>
          <div className="relative">
            <div className="text-white text-sm font-bold mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-3 text-blue-400" />
              {new Date(hoveredCell.date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              <Sparkles className="w-4 h-4 ml-2 text-yellow-400" />
            </div>

            <div className="grid grid-cols-2 gap-6 text-xs">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 bg-black/30 rounded-lg">
                  <span className="text-gray-400 font-medium">Close:</span>
                  <span className="text-white font-mono font-bold">
                    ${hoveredCell.close.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-black/30 rounded-lg">
                  <span className="text-gray-400 font-medium">High:</span>
                  <span className="text-green-400 font-mono font-bold">
                    ${hoveredCell.high.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-black/30 rounded-lg">
                  <span className="text-gray-400 font-medium">Low:</span>
                  <span className="text-red-400 font-mono font-bold">
                    ${hoveredCell.low.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 bg-black/30 rounded-lg">
                  <span className="text-gray-400 font-medium">
                    Performance:
                  </span>
                  <span
                    className={cn(
                      "font-mono font-bold flex items-center",
                      hoveredCell.performance >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    )}
                  >
                    {hoveredCell.performance >= 0 ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {hoveredCell.performance > 0 ? "+" : ""}
                    {hoveredCell.performance.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-black/30 rounded-lg">
                  <span className="text-gray-400 font-medium">Volatility:</span>
                  <span className="text-yellow-400 font-mono font-bold">
                    {hoveredCell.volatility.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-black/30 rounded-lg">
                  <span className="text-gray-400 font-medium">Volume:</span>
                  <span className="text-blue-400 font-mono font-bold">
                    {formatVolume(hoveredCell.volume)}
                  </span>
                </div>
              </div>
            </div>

            {/* Tooltip arrow */}
            <div className="absolute bottom-0 left-4 transform translate-y-full">
              <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-600"></div>
            </div>
          </div>
        </div>
      )}

      <div className="relative mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base md:text-2xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
            {timeframe} Market Seasonality - {selectedInstrument || "BTC/USDT"}
          </h2>
          <div className="flex items-center space-x-4">
            <ConnectionStatus
              isConnected={isConnected}
              lastUpdated={lastUpdated}
              connectionAttempts={connectionAttempts}
              onRetry={retryConnection}
            />
            {ticker && (
              <div className="text-sm text-gray-400">
                24h:{" "}
                <span
                  className={cn(
                    "font-mono font-bold",
                    Number.parseFloat(ticker.priceChangePercent) >= 0
                      ? "text-green-400"
                      : "text-red-400"
                  )}
                >
                  {Number.parseFloat(ticker.priceChangePercent) >= 0 ? "+" : ""}
                  {Number.parseFloat(ticker.priceChangePercent).toFixed(2)}%
                </span>
              </div>
            )}
            <Button
              onClick={refetch}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white bg-gray-900/50 hover:bg-gray-800/50 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 rounded-lg group"
              disabled={loading}
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-green-400/20 to-blue-500/20 rounded-lg blur opacity-0 group-hover:opacity-75 transition duration-300"></div>
              <RefreshCw
                className={cn(
                  "w-4 h-4 relative z-10",
                  loading && "animate-spin"
                )}
              />
            </Button>
          </div>
        </div>
        <p className="text-gray-400 text-xs sm:text-lg">
          {isConnected ? "Real-time WebSocket" : "Polling mode"} data from
          Binance API • Selected metrics:{" "}
          {selectedMetrics.length > 0 ? selectedMetrics.join(", ") : "None"} •
          Click on any cell to view detailed metrics
        </p>
      </div>

      {/* Enhanced Current Price Display */}
      {ticker && (
        <div className="relative group mb-6">
          <div className="absolute -inset-1 bg-gradient-to-r from-green-400/20 to-blue-500/20 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
          <div className="relative p-4 bg-gray-900/50 rounded-xl border border-gray-800/50 backdrop-blur-sm hover:border-gray-700/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-bold text-white flex items-center">
                Live Market Data
                <div
                  className={cn(
                    "w-2 h-2 rounded-full ml-2",
                    isConnected ? "bg-green-400 animate-pulse" : "bg-blue-400"
                  )}
                ></div>
              </div>
              {lastUpdated && (
                <div className="text-xs text-gray-400">
                  Updated: {lastUpdated.toLocaleTimeString()}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-400 font-medium">Current Price</div>
                <PriceIndicator
                  price={Number.parseFloat(ticker.lastPrice)}
                  change={priceChange}
                  className="text-lg font-mono"
                />
              </div>
              <div>
                <div className="text-gray-400 font-medium">24h Volume</div>
                <div className="text-white font-mono font-bold">
                  {formatVolume(Number.parseFloat(ticker.volume))}
                </div>
                <div className="text-xs text-gray-500">
                  ${formatVolume(Number.parseFloat(ticker.quoteVolume || "0"))}{" "}
                  USDT
                </div>
              </div>
              <div>
                <div className="text-gray-400 font-medium">24h High</div>
                <div className="text-green-400 font-mono font-bold">
                  $
                  {Number.parseFloat(ticker.highPrice).toLocaleString(
                    undefined,
                    { minimumFractionDigits: 2 }
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  +
                  {(
                    ((Number.parseFloat(ticker.highPrice) -
                      Number.parseFloat(ticker.lastPrice)) /
                      Number.parseFloat(ticker.lastPrice)) *
                    100
                  ).toFixed(2)}
                  %
                </div>
              </div>
              <div>
                <div className="text-gray-400 font-medium">24h Low</div>
                <div className="text-red-400 font-mono font-bold">
                  $
                  {Number.parseFloat(ticker.lowPrice).toLocaleString(
                    undefined,
                    { minimumFractionDigits: 2 }
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {(
                    ((Number.parseFloat(ticker.lowPrice) -
                      Number.parseFloat(ticker.lastPrice)) /
                      Number.parseFloat(ticker.lastPrice)) *
                    100
                  ).toFixed(2)}
                  %
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-800/50 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-400">24h Change: </span>
                <span
                  className={cn(
                    "font-mono font-bold",
                    Number.parseFloat(ticker.priceChangePercent) >= 0
                      ? "text-green-400"
                      : "text-red-400"
                  )}
                >
                  {Number.parseFloat(ticker.priceChangePercent) >= 0 ? "+" : ""}
                  {Number.parseFloat(ticker.priceChangePercent).toFixed(2)}% ($
                  {Number.parseFloat(ticker.priceChange).toFixed(2)})
                </span>
              </div>
              <div>
                <span className="text-gray-400">Open Price: </span>
                <span className="text-white font-mono font-bold">
                  $
                  {Number.parseFloat(ticker.openPrice).toLocaleString(
                    undefined,
                    { minimumFractionDigits: 2 }
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {process.env.NODE_ENV === "development" && (
        <div className="mb-4 p-2 bg-gray-800/50 rounded text-xs text-gray-400">
          Debug: Viewing {currentMonth.toISOString().split("T")[0]} | Timeframe:{" "}
          {timeframe} | Data range: {data[0]?.date} to{" "}
          {data[data.length - 1]?.date} | Total points: {data.length} |
          {timeframe === "Weekly"
            ? "Weeks"
            : timeframe === "Monthly"
            ? "Months"
            : "Days"}{" "}
          with data:{" "}
          {calendarDays.filter((d) => d.marketData && !d.isEmpty).length}
        </div>
      )}
    </div>
  );
}
