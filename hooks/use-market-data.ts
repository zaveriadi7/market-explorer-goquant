"use client"

import { useState, useEffect, useCallback } from "react"
import { binanceAPI, type ProcessedMarketData, type BinanceTicker24hr } from "@/lib/binance-api"

interface MarketDataState {
  data: ProcessedMarketData[]
  ticker: BinanceTicker24hr | null
  loading: boolean
  error: string | null
  lastUpdated: Date | null
}

export function useMarketData(symbol: string, timeframe: string) {
  const [state, setState] = useState<MarketDataState>({
    data: [],
    ticker: null,
    loading: true,
    error: null,
    lastUpdated: null,
  })

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

  const fetchMarketData = useCallback(async () => {
    if (!validSymbol) {
      setState((prev) => ({ ...prev, loading: false, error: "No symbol provided" }))
      return
    }

    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const interval = getInterval(timeframe)
      const limit = timeframe === "Monthly" ? 12 : 30 

      const [klineData, tickerData] = await Promise.all([
        binanceAPI.getKlineData(validSymbol, interval, limit),
        binanceAPI.get24hrTicker(validSymbol),
      ])

      const processedData = binanceAPI.processKlineData(klineData)

      setState({
        data: processedData.reverse(), // recent first
        ticker: tickerData,
        loading: false,
        error: null,
        lastUpdated: new Date(),
      })
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Failed to fetch market data",
      }))
    }
  }, [validSymbol, timeframe])

  // Initial fetch
  useEffect(() => {
    fetchMarketData()
  }, [fetchMarketData])

  // refresh every 5 minutes in daily view, 30 minutes for week and month
  useEffect(() => {
    const refreshInterval = timeframe === "Daily" ? 5 * 60 * 1000 : 30 * 60 * 1000

    const interval = setInterval(fetchMarketData, refreshInterval)
    return () => clearInterval(interval)
  }, [fetchMarketData, timeframe])

  return {
    ...state,
    refetch: fetchMarketData,
  }
}
