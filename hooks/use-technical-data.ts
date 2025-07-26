"use client"

import { useState, useEffect } from "react"
import { binanceAPI } from "@/lib/binance-api"

interface TechnicalData {
  date: string
  close: number
  ma20?: number
  ma50?: number
  rsi?: number
}

export function useTechnicalData(symbol: string, timeframe: string) {
  const [technicalData, setTechnicalData] = useState<TechnicalData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const validSymbol = symbol || "BTCUSDT"

    const fetchTechnicalData = async () => {
      setLoading(true)
      setError(null)

      try {
        const interval = timeframe === "Daily" ? "1d" : timeframe === "Weekly" ? "1w" : "1M"
        const klineData = await binanceAPI.getKlineData(validSymbol, interval, 100)
        const processedData = binanceAPI.processKlineData(klineData)

        const closePrices = processedData.map((d) => d.close)

        const technicalDataWithIndicators = processedData.map((data, index) => {
          const pricesUpToIndex = closePrices.slice(0, index + 1)

          return {
            date: data.date,
            close: data.close,
            ma20: index >= 19 ? binanceAPI.calculateMovingAverage(pricesUpToIndex, 20) : undefined,
            ma50: index >= 49 ? binanceAPI.calculateMovingAverage(pricesUpToIndex, 50) : undefined,
            rsi: index >= 14 ? binanceAPI.calculateRSI(pricesUpToIndex, 14) : undefined,
          }
        })

        setTechnicalData(technicalDataWithIndicators.slice(-30)) // Last 30 periods
      } catch (error) {
        console.error("Error fetching technical data:", error)
        setError(error instanceof Error ? error.message : "Failed to fetch technical data")
      } finally {
        setLoading(false)
      }
    }

    fetchTechnicalData()
  }, [symbol, timeframe])

  return { technicalData, loading, error }
}
