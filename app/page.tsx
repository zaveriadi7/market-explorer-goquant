"use client";

import { useState, useEffect } from "react";
import { TopNavigation } from "@/components/top-navigation";
import { LeftSidebar } from "@/components/left-sidebar";
import { CalendarGrid } from "@/components/calendar-grid";
import { DetailPanel } from "@/components/detail-panel";
import { AnimatedMarketOverview } from "@/components/charts/animated-market-overview";
import { Button } from "@/components/ui/button";
import { Menu, X, BarChart3, Calendar, Sparkles, Zap } from "lucide-react";
import { useRealtimeData } from "@/hooks/use-realtime-data";
import { useTechnicalData } from "@/hooks/use-technical-data";
import { wsManager } from "@/lib/websocket-manager";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";

export default function MarketSeasonalityExplorer() {
  const [selectedInstrument, setSelectedInstrument] = useState("BTC/USDT");
  const [timeframe, setTimeframe] = useState("Daily");
  const [selectedMetrics, setSelectedMetrics] = useState([
    "Volatility",
    "Performance",
  ]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [currentView, setCurrentView] = useState<"calendar" | "charts">(
    "calendar"
  );

  const {
    data: marketData,
    ticker,
    isConnected,
    priceChange,
    loading,
    lastUpdated,
    refetch,
  } = useRealtimeData(selectedInstrument.replace("/", ""), timeframe);

  const { technicalData } = useTechnicalData(
    selectedInstrument.replace("/", ""),
    timeframe
  );

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setRightPanelOpen(true);
  };

  // Cleanup WebSocket connections on unmount
  useEffect(() => {
    return () => {
      wsManager.cleanup();
    };
  }, []);

  const currentPrice = ticker ? Number.parseFloat(ticker.lastPrice) : undefined;
  function mapTimeframe(view: string): "1d" | "1w" | "1M" {
    switch (view) {
      case "Daily":
        return "1d";
      case "Weekly":
        return "1w";
      case "Monthly":
        return "1M";
      default:
        return "1d"; // Fallback
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-blue-500/5 animate-pulse"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900/20 via-transparent to-transparent"></div>
      <Toaster richColors position="top-right" />

      <div className="relative">
        <TopNavigation
          isConnected={isConnected}
          currentPrice={currentPrice}
          priceChange={priceChange}
        />

        <div className="flex h-[calc(100vh-80px)]">
          {/* Enhanced Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "fixed top-4 right-4 z-50 md:hidden transition-all duration-500 transform hover:scale-110 group",
              "bg-gray-900/80 backdrop-blur-xl hover:bg-gray-800/80 border border-gray-700/50 shadow-2xl rounded-xl w-9 h-9",
              leftSidebarOpen && "rotate-180"
            )}
            onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-green-400/20 to-blue-500/20 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
            {leftSidebarOpen ? (
              <X className="h-5 w-5 relative z-10" />
            ) : (
              <Menu className="h-5 w-5 relative z-10" />
            )}
          </Button>

          {/* Left Sidebar */}
          <div
            className={cn(
              "fixed inset-y-0 left-0 top-0 z-40 w-80 transform transition-all duration-700 ease-in-out",
              "md:relative md:top-0 md:translate-x-0 md:z-0",
              leftSidebarOpen ? "translate-x-0" : "-translate-x-full",
              "shadow-2xl md:shadow-none"
            )}
          >
            <LeftSidebar
              selectedInstrument={selectedInstrument}
              setSelectedInstrument={setSelectedInstrument}
              timeframe={timeframe}
              setTimeframe={setTimeframe}
              selectedMetrics={selectedMetrics}
              setSelectedMetrics={setSelectedMetrics}
              isConnected={isConnected}
              lastUpdated={lastUpdated}
              onRefresh={refetch}
            />
          </div>

          {/* Enhanced Mobile overlay */}
          {leftSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden transition-all duration-500"
              onClick={() => setLeftSidebarOpen(false)}
            />
          )}

          {/* Enhanced Main Content */}
          <div className="flex-1 flex flex-col min-w-0 bg-gradient-to-br from-gray-900/30 to-black/30 backdrop-blur-sm">
            {/* Enhanced View Toggle */}
            <div className="relative p-6  bg-black/10 backdrop-blur-xl">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-blue-500/5"></div>
              <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
                {/* Button Group */}
                <div className="flex flex-row items-center justify-start gap-2 sm:gap-3 w-full overflow-x-auto">
                  <Button
                    variant={currentView === "calendar" ? "default" : "outline"}
                    size="lg"
                    onClick={() => setCurrentView("calendar")}
                    className={cn(
                      "transition-all duration-500 transform hover:scale-105 shadow-lg rounded-xl h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base min-w-[130px] sm:min-w-0 group relative overflow-hidden",
                      currentView === "calendar"
                        ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-green-600/50 shadow-green-600/25"
                        : "bg-black/30 hover:bg-gray-800/50 text-gray-300 hover:text-white border-gray-700/50 hover:border-gray-600/50 backdrop-blur-sm"
                    )}
                  >
                    {currentView === "calendar" && (
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-green-600/20 animate-pulse" />
                    )}
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-3 relative z-10" />
                    <span className="text-xs font-bold relative z-10 whitespace-nowrap">
                      Calendar View
                    </span>
                    {currentView === "calendar" && (
                      <Sparkles className="hidden sm:block w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1 relative z-10" />
                    )}
                  </Button>

                  <Button
                    variant={currentView === "charts" ? "default" : "outline"}
                    size="lg"
                    onClick={() => setCurrentView("charts")}
                    className={cn(
                      "transition-all duration-500 transform hover:scale-105 shadow-lg rounded-xl h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base min-w-[130px] sm:min-w-0 group relative overflow-hidden",
                      currentView === "charts"
                        ? "bg-gradient-to-r from-gray-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-blue-600/50 shadow-blue-600/25"
                        : "bg-black/30 hover:bg-gray-800/50 text-white hover:text-white border-gray-700/50 hover:border-gray-600/50 backdrop-blur-sm"
                    )}
                  >
                    {currentView === "charts" && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-blue-600/20 animate-pulse" />
                    )}
                    <BarChart3 className="w-2 h-2 sm:w-5 sm:h-5  sm:mr-3 relative z-10" />
                    <span className="font-bold relative z-10 whitespace-nowrap">
                      Charts & Analytics
                    </span>
                    {currentView === "charts" && (
                      <Zap className="hidden sm:block w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1 relative z-10" />
                    )}
                  </Button>
                </div>

                {/* Enhanced Status indicators - hidden on mobile */}
                <div className="hidden sm:flex items-center space-x-4">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-green-400/20 to-blue-500/20 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
                    <div className="relative flex items-center space-x-2 px-4 py-2 bg-gray-900/50 rounded-lg border border-gray-700/50 backdrop-blur-sm">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          isConnected
                            ? "bg-green-400 animate-pulse"
                            : "bg-blue-400"
                        )}
                      ></div>
                      <span className="text-sm text-gray-300 font-bold">
                        {marketData.length} data points
                      </span>
                    </div>
                  </div>

                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
                    <div className="relative flex items-center space-x-2 px-4 py-2 bg-gray-900/50 rounded-lg border border-gray-700/50 backdrop-blur-sm">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-gray-300 font-bold">
                        {selectedMetrics.length} metrics active
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Content Area */}
            <div className="flex-1 overflow-auto relative">
              {currentView === "calendar" ? (
                <CalendarGrid
                  timeframe={timeframe}
                  selectedMetrics={selectedMetrics}
                  onDateSelect={handleDateSelect}
                  selectedDate={selectedDate}
                  selectedInstrument={selectedInstrument}
                  currentPrice={currentPrice}
                />
              ) : (
                <div className="p-6">
                  {timeframe === "Daily" ? (
                    <AnimatedMarketOverview
                      data={marketData}
                      technicalData={technicalData}
                      currentPrice={currentPrice}
                      priceChange={priceChange}
                      isConnected={isConnected}
                      loading={loading}
                      selectedInstrument={selectedInstrument}
                    />
                  ) : (
                    <div className="text-center text-gray-400 text-lg p-12">
                      Charts are only available in Daily mode.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel */}
          <DetailPanel
            isOpen={rightPanelOpen}
            onClose={() => setRightPanelOpen(false)}
            selectedDate={selectedDate}
            selectedInstrument={selectedInstrument}
            timeframe={mapTimeframe(timeframe)}
          />
        </div>

        {/* Enhanced Loading overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-green-400/20 to-blue-500/20 rounded-2xl blur opacity-75 animate-pulse"></div>
              <div className="relative bg-gray-900/90 rounded-2xl p-8 border border-gray-700/50 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-green-400/30 border-t-green-400 rounded-full animate-spin"></div>
                    <div className="absolute inset-2 w-8 h-8 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin animate-reverse"></div>
                  </div>
                  <div>
                    <div className="text-white font-bold text-lg">
                      Loading Market Data
                    </div>
                    <div className="text-gray-400 text-sm">
                      Fetching real-time information...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
