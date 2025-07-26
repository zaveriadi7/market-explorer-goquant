"use client"

import { useState, useEffect } from "react"
import { TopNavigation } from "@/components/top-navigation"
import { LeftSidebar } from "@/components/left-sidebar"
import { CalendarGrid } from "@/components/calendar-grid"
import { ComparisonDetailView } from "@/components/comparison-detail-view"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Menu, 
  X, 
  Calendar, 
  ArrowRight, 
  RotateCcw, 
  Sparkles, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  Activity,
  Zap
} from "lucide-react"
import { useRealtimeData } from "@/hooks/use-realtime-data"
import { wsManager } from "@/lib/websocket-manager"
import { cn } from "@/lib/utils"
import { Toaster } from "sonner"

export default function ComparePage() {
  const [selectedInstrument, setSelectedInstrument] = useState("BTC/USDT")
  const [timeframe, setTimeframe] = useState("Daily")
  const [selectedMetrics, setSelectedMetrics] = useState(["Volatility", "Performance"])
  
  // Two dates for comparison
  const [firstSelectedDate, setFirstSelectedDate] = useState<string | null>(null)
  const [secondSelectedDate, setSecondSelectedDate] = useState<string | null>(null)
  const [activeSelection, setActiveSelection] = useState<"first" | "second">("first")
  const [showComparison, setShowComparison] = useState(false)
  
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false)

  const {
    data: marketData,
    ticker,
    isConnected,
    priceChange,
    loading,
    lastUpdated,
    refetch,
  } = useRealtimeData(selectedInstrument.replace("/", ""), timeframe)

  const handleDateSelect = (date: string) => {
    if (activeSelection === "first") {
      setFirstSelectedDate(date)
      if (!secondSelectedDate) {
        setActiveSelection("second")
      }
    } else {
      setSecondSelectedDate(date)
      setActiveSelection("first")
    }
  }

  const handleReset = () => {
    setFirstSelectedDate(null)
    setSecondSelectedDate(null)
    setActiveSelection("first")
    setShowComparison(false)
  }

  const handleCompare = () => {
    if (firstSelectedDate && secondSelectedDate) {
      setShowComparison(true)
    }
  }

  const handleBackToSelection = () => {
    setShowComparison(false)
  }
  const filteredData = marketData.filter(item => 
    item.date === firstSelectedDate || item.date === secondSelectedDate
  );
  
  // Cleanup WebSocket connections on unmount
  useEffect(() => {
    return () => {
      wsManager.cleanup()
    }
  }, [])

  const currentPrice = ticker ? Number.parseFloat(ticker.lastPrice) : undefined
  const bothDatesSelected = firstSelectedDate && secondSelectedDate

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-orange-500/5 animate-pulse"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
      <Toaster richColors position="top-right" />

      <div className="relative">
        <TopNavigation isConnected={isConnected} currentPrice={currentPrice} priceChange={priceChange} />

        <div className="flex h-[calc(100vh-80px)]">
          {/* Enhanced Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "fixed top-4 right-4 z-50 md:hidden transition-all duration-500 transform hover:scale-110 group",
              "bg-gray-900/80 backdrop-blur-xl hover:bg-gray-800/80 border border-gray-700/50 shadow-2xl rounded-xl w-9 h-9",
              leftSidebarOpen && "rotate-180",
            )}
            onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-400/20 to-orange-500/20 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
            {leftSidebarOpen ? <X className="h-5 w-5 relative z-10" /> : <Menu className="h-5 w-5 relative z-10" />}
          </Button>

          {/* Left Sidebar */}
          <div
            className={cn(
              "fixed inset-y-0 left-0 top-0 z-40 w-80 transform transition-all duration-700 ease-in-out",
              "md:relative md:top-0 md:translate-x-0 md:z-0",
              leftSidebarOpen ? "translate-x-0" : "-translate-x-full",
              "shadow-2xl md:shadow-none",
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
              variant="compare"
            />
          </div>

          {/* Enhanced Mobile overlay */}
          {leftSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden transition-all duration-500"
              onClick={() => setLeftSidebarOpen(false)}
            />
          )}

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0 bg-gradient-to-br from-gray-900/30 to-black/30 backdrop-blur-sm">
            {!showComparison ? (
              <>
                {/* Date Selection Header */}
                <div className="relative p-6 border-b border-black/50 bg-black backdrop-blur-xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-orange-500/5"></div>
                  <div className="relative flex flex-col gap-4">
                    {/* Title and Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="relative group">
                          <div className="absolute -inset-2 bg-gradient-to-r from-purple-400/20 to-orange-500/20 rounded-xl blur opacity-50 group-hover:opacity-75 transition duration-300"></div>
                          <Calendar className="w-5 h-5sm:w-8 sm:h-8 text-purple-400 relative z-10" />
                        </div>
                        <div>
                          <h1 className="text-md md:text-2xl font-bold bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent">
                            Compare Market Data
                          </h1>
                          <p className="text-gray-400 text-xs sm:text-sm">Select two dates to compare market performance</p>
                        </div>
                      </div>

                      {/* Control Buttons */}
                      <div className="flex items-center gap-2">
                        {(firstSelectedDate || secondSelectedDate) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleReset}
                            className="bg-gray-900/50 hover:bg-gray-800/50 border-gray-700/50 text-gray-300 hover:text-white backdrop-blur-sm"
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Reset
                          </Button>
                        )}
                        {bothDatesSelected && (
                          <Button
                            onClick={handleCompare}
                            className="bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 text-white border-0 shadow-lg shadow-purple-600/25"
                          >
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Compare
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Selection Status Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                      {/* First Date Selection */}
                      <Card className="relative h-fit group cursor-pointer" onClick={() => setActiveSelection("first")}>
                        <div className={cn(
                          "absolute -inset-1 rounded-lg blur opacity-25 transition duration-300",
                          activeSelection === "first" 
                            ? "bg-gradient-to-r from-purple-400/40 to-purple-600/40 opacity-75" 
                            : "bg-gradient-to-r from-gray-400/20 to-gray-600/20",
                          firstSelectedDate && "group-hover:opacity-75"
                        )}></div>
                        <CardContent className={cn(
                          "relative p-2 md:p-6 rounded-lg border backdrop-blur-sm transition-all duration-300",
                          activeSelection === "first"
                            ? "bg-purple-900/20 border-purple-600/50 shadow-lg shadow-purple-600/10"
                            : "bg-purple-900/30 border-gray-700/50"
                        )}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-fit h-fit sm:w-4 sm:h-4 rounded-full",
                                activeSelection === "first" ? "bg-purple-400 animate-pulse" : "bg-purple-500"
                              )}></div>
                              <div>
                                <div className="text-xs sm:text-sm font-medium text-white">First Date</div>
                                <div className={cn(
                                  "text-xs sm:text-xl font-bold",
                                  firstSelectedDate ? "text-white" : "text-gray-500"
                                )}>
                                  {firstSelectedDate || "Select a date"}
                                </div>
                              </div>
                            </div>
                            {activeSelection === "first" && <Sparkles className="w-6 h-6 text-purple-400" />}
                            {firstSelectedDate && <TrendingUp className="w-6 h-6 text-purple-400" />}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Second Date Selection */}
                      <Card className="relative h-fit group cursor-pointer" onClick={() => setActiveSelection("second")}>
                        <div className={cn(
                          "absolute -inset-1 rounded-lg blur opacity-25 transition duration-300",
                          activeSelection === "second" 
                            ? "bg-gradient-to-r from-orange-400/40 to-orange-600/40 opacity-75" 
                            : "bg-gradient-to-r from-orange-400/40 to-orange-600/40",
                          secondSelectedDate && "group-hover:opacity-75"
                        )}></div>
                        <CardContent className={cn(
                          "relative p-2 md:p-6 rounded-lg border backdrop-blur-sm transition-all duration-300",
                          activeSelection === "second"
                            ? "bg-orange-900/20 border-orange-600/50 shadow-lg shadow-orange-600/10"
                            : "bg-orange-900/30 border-orange-700/50"
                        )}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "q-fit h-fit sm:w-4 sm:h-4 rounded-full",
                                activeSelection === "second" ? "bg-orange-400 animate-pulse" : "bg-orange-500"
                              )}></div>
                              <div>
                                <div className="text-xs sm:text-sm font-medium text-white">Second Date</div>
                                <div className={cn(
                                  "text-xs md:text-xl font-bold",
                                  secondSelectedDate ? "text-white" : "text-gray-500"
                                )}>
                                  {secondSelectedDate || "Select a date"}
                                </div>
                              </div>
                            </div>
                            {activeSelection === "second" && <Sparkles className="w-6 h-6 text-orange-400" />}
                            {secondSelectedDate && <TrendingDown className="w-6 h-6 text-orange-400" />}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Instructions */}
                    <div className="text-center py-2">
                      {!firstSelectedDate && !secondSelectedDate && (
                        <p className="text-gray-400 text-xs sm:text-sm">
                          Click on a calendar date below to select your first comparison point
                        </p>
                      )}
                      {firstSelectedDate && !secondSelectedDate && (
                        <p className="text-gray-400 text-sm">
                          Now select a second date to compare with <span className="text-purple-400 font-medium">{firstSelectedDate}</span>
                        </p>
                      )}
                      {bothDatesSelected && (
                        <div className="flex items-center justify-center gap-2 text-green-400">
                          <Activity className="w-4 h-4" />
                          <span className="text-sm font-medium">Ready to compare! Click the Compare button above.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Calendar */}
                <div className="flex-1 overflow-auto">
                  <CalendarGrid
                    timeframe={timeframe}
                    selectedMetrics={selectedMetrics}
                    onDateSelect={handleDateSelect}
                    selectedDate={activeSelection === "first" ? firstSelectedDate : secondSelectedDate}
                    selectedInstrument={selectedInstrument}
                    comparisonMode={true}
                    firstSelectedDate={firstSelectedDate}
                    secondSelectedDate={secondSelectedDate}
                    activeSelection={activeSelection}
                    currentPrice={currentPrice}
                  />
                </div>
              </>
            ) : (
              <>
                {/* Comparison View Header */}
                <div className="relative p-0 md:p-6 border-b border-gray-800/50 bg-gradient-to-r from-gray-900/30 to-gray-800/30 backdrop-blur-xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-orange-500/5"></div>
                  <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="relative group">
                        <div className="absolute -inset-2 bg-gradient-to-r from-purple-400/20 to-orange-500/20 rounded-xl blur opacity-50 group-hover:opacity-75 transition duration-300"></div>
                        <BarChart3 className="w-8 h-8 text-purple-400 relative z-10" />
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent">
                          Detailed Comparison
                        </h1>
                        <p className="text-gray-400 text-sm">
                          Comparing <span className="text-purple-400 font-medium">{firstSelectedDate}</span> vs <span className="text-orange-400 font-medium">{secondSelectedDate}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={handleBackToSelection}
                        className="bg-gray-900/50 hover:bg-gray-800/50 border-gray-700/50 text-gray-300 hover:text-white backdrop-blur-sm"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Back to Selection
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Comparison Content */}
                <div className="flex-1 overflow-auto">
                  <ComparisonDetailView
                    firstDate={firstSelectedDate!}
                    secondDate={secondSelectedDate!}
                    filtereddata={filteredData}
                    selectedInstrument={selectedInstrument}
                    timeframe={timeframe}
                    selectedMetrics={selectedMetrics}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Enhanced Loading overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-400/20 to-orange-500/20 rounded-2xl blur opacity-75 animate-pulse"></div>
              <div className="relative bg-gray-900/90 rounded-2xl p-8 border border-gray-700/50 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin"></div>
                    <div className="absolute inset-2 w-8 h-8 border-4 border-orange-400/30 border-t-orange-400 rounded-full animate-spin animate-reverse"></div>
                  </div>
                  <div>
                    <div className="text-white font-bold text-lg">Loading Market Data</div>
                    <div className="text-gray-400 text-sm">Preparing comparison analysis...</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}