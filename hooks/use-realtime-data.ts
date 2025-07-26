"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { binanceAPI, type ProcessedMarketData, type BinanceTicker24hr } from "@/lib/binance-api"
import { wsManager, type WebSocketTickerData } from "@/lib/websocket-manager"

interface RealtimeDataState {
  data: ProcessedMarketData[]
  ticker: BinanceTicker24hr | null
  loading: boolean
  error: string | null
  lastUpdated: Date | null
  isConnected: boolean
  priceChange: number
  connectionAttempts: number
}

export function useRealtimeData(symbol: string, timeframe: string, dateRange?: { start: Date; end: Date }) {
  const [state, setState] = useState<RealtimeDataState>({
    data: [],
    ticker: null,
    loading: true,
    error: null,
    lastUpdated: null,
    isConnected: false,
    priceChange: 0,
    connectionAttempts: 0,
  })

  const previousPriceRef = useRef<number>(0)
  const cleanupRef = useRef<(() => void) | null>(null)
  const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null)
  const connectionMonitorRef = useRef<NodeJS.Timeout | null>(null)

  const validSymbol = symbol || "BTCUSDT"

  const getInterval = (timeframe: string): "1d" | "1w" | "1M" => {
    switch (timeframe) {
      case "Daily":
        return "1d"
      case "Weekly":
        return "1w"
      case "Monthly":
        return "1M"
      default:
        return "1d"
    }
  }

  const fetchInitialData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const interval = getInterval(timeframe)

      // Calculate how much historical data we need
      let limit = 100 // Default to more data

      if (dateRange) {
        const now = new Date()
        const daysDiff = Math.ceil((now.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24))

        // For daily data, we need at least the number of days
        // For weekly/monthly, we need proportionally more
        switch (interval) {
          case "1d":
            limit = Math.max(daysDiff + 30, 100) // Add buffer
            break
          case "1w":
            limit = Math.max(Math.ceil(daysDiff / 7) + 10, 52) // ~1 year of weekly data
            break
          case "1M":
            limit = Math.max(Math.ceil(daysDiff / 30) + 6, 24) // ~2 years of monthly data
            break
        }

        // Cap the limit to reasonable values to avoid API issues
        limit = Math.min(limit, 1000)

        console.log(`Fetching ${limit} ${interval} candles for date range:`, {
          start: dateRange.start.toISOString().split("T")[0],
          end: dateRange.end.toISOString().split("T")[0],
          daysDiff,
          interval,
        })
      }

      const [klineData, tickerData] = await Promise.all([
        binanceAPI.getKlineData(validSymbol, interval, limit),
        binanceAPI.get24hrTicker(validSymbol),
      ])

      let processedData = binanceAPI.processKlineData(klineData)

      console.log(`Received ${processedData.length} data points, date range:`, {
        first: processedData[0]?.date,
        last: processedData[processedData.length - 1]?.date,
      })

      // Filter data by date range if provided
      if (dateRange) {
        const originalLength = processedData.length
        processedData = processedData.filter((data) => {
          const dataDate = new Date(data.date)
          const isInRange = dataDate >= dateRange.start && dataDate <= dateRange.end
          return isInRange
        })

        console.log(`Filtered from ${originalLength} to ${processedData.length} data points for range:`, {
          start: dateRange.start.toISOString().split("T")[0],
          end: dateRange.end.toISOString().split("T")[0],
          filteredDates: processedData.map((d) => d.date),
        })
      }

      previousPriceRef.current = Number.parseFloat(tickerData.lastPrice)

      setState((prev) => ({
        ...prev,
        data: processedData.reverse(),
        ticker: tickerData,
        loading: false,
        error: null,
        lastUpdated: new Date(),
      }))
    } catch (error) {
      console.error("Error fetching initial data:", error)
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Failed to fetch market data",
      }))
    }
  }, [validSymbol, timeframe, dateRange])

  // Enhanced fallback polling with better error handling
  const startFallbackPolling = useCallback(() => {
    if (fallbackTimerRef.current) return

    console.log("🔄 Starting enhanced fallback polling for", validSymbol)

    const poll = async () => {
      try {
        const tickerData = await binanceAPI.get24hrTicker(validSymbol)
        const currentPrice = Number.parseFloat(tickerData.lastPrice)
        const priceChange = currentPrice - previousPriceRef.current

        setState((prev) => ({
          ...prev,
          ticker: tickerData,
          lastUpdated: new Date(),
          priceChange,
          error: null,
          isConnected: false, // Mark as not connected since we're using polling
        }))

        previousPriceRef.current = currentPrice
      } catch (error) {
        console.error("Fallback polling error:", error)
        setState((prev) => ({
          ...prev,
          error: "Failed to fetch real-time data",
        }))
      }
    }

    // Start with immediate poll, then set interval
    poll()
    fallbackTimerRef.current = setInterval(poll, 10000) // Poll every 10 seconds
  }, [validSymbol])

  const stopFallbackPolling = useCallback(() => {
    if (fallbackTimerRef.current) {
      clearInterval(fallbackTimerRef.current)
      fallbackTimerRef.current = null
      console.log("⏹️ Stopped fallback polling")
    }
  }, [])

  // Setup WebSocket connection with immediate fallback
  useEffect(() => {
    if (!validSymbol) return

    console.log(`🚀 Setting up data connection for ${validSymbol}`)

    // Clean up previous connections
    if (cleanupRef.current) {
      cleanupRef.current()
    }
    stopFallbackPolling()

    // Start fallback polling immediately as primary method
    startFallbackPolling()

    // Try WebSocket as enhancement, but don't depend on it
    try {
      const cleanup = wsManager.subscribeToTicker(validSymbol, (tickerData: WebSocketTickerData) => {
        const currentPrice = Number.parseFloat(tickerData.price)
        const priceChange = currentPrice - previousPriceRef.current

        // Stop polling when WebSocket is working
        if (fallbackTimerRef.current) {
          stopFallbackPolling()
        }

        setState((prev) => ({
          ...prev,
          ticker: {
            ...prev.ticker!,
            lastPrice: tickerData.price,
            priceChange: tickerData.priceChange,
            priceChangePercent: tickerData.priceChangePercent,
            volume: tickerData.volume,
            highPrice: tickerData.high,
            lowPrice: tickerData.low,
            openPrice: tickerData.open,
          } as BinanceTicker24hr,
          lastUpdated: new Date(),
          isConnected: true,
          priceChange,
          error: null,
        }))

        previousPriceRef.current = currentPrice
      })

      cleanupRef.current = cleanup

      // Monitor WebSocket connection status
      connectionMonitorRef.current = setInterval(() => {
        const streamName = `${validSymbol.toLowerCase()}@ticker`
        const connectionInfo = wsManager.getConnectionInfo(streamName)
        const isConnected = wsManager.getConnectionStatus(streamName)

        setState((prev) => {
          // If WebSocket disconnects, restart polling
          if (!isConnected && prev.isConnected) {
            console.log("🔌 WebSocket disconnected, resuming fallback polling")
            startFallbackPolling()
          }

          return {
            ...prev,
            isConnected,
            connectionAttempts: connectionInfo.attempts,
          }
        })
      }, 3000) // Check every 3 seconds
    } catch (error) {
      console.error("Failed to setup WebSocket:", error)
      // Fallback polling is already running, so we're good
    }

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current()
      }
      if (connectionMonitorRef.current) {
        clearInterval(connectionMonitorRef.current)
      }
      stopFallbackPolling()
    }
  }, [validSymbol, startFallbackPolling, stopFallbackPolling])

  // Initial data fetch
  useEffect(() => {
    fetchInitialData()
  }, [fetchInitialData])

  // Periodic data refresh for historical data
  useEffect(() => {
    const refreshInterval = timeframe === "Daily" ? 300000 : 600000 // 5min for daily, 10min for others

    const interval = setInterval(() => {
      fetchInitialData()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [fetchInitialData, timeframe])

  // Manual retry function that resets WebSocket fallback mode
  const retryConnection = useCallback(() => {
    wsManager.resetFallbackMode()
    stopFallbackPolling()

    // Restart the connection process
    setTimeout(() => {
      startFallbackPolling()
    }, 1000)
  }, [startFallbackPolling, stopFallbackPolling])

  return {
    ...state,
    refetch: fetchInitialData,
    retryConnection,
  }
}
