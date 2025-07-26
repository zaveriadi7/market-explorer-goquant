"use client"

import { useState, useEffect } from "react"
import { binanceAPI } from "@/lib/binance-api"

interface DetailedMetrics {
  ohlc: {
    open: number
    high: number
    low: number
    close: number
  }
  volume: number
  quoteVolume: number
  volatility: number
  rsi: number
  ma20: number
  ma50: number
  change: number
  changePercent: number
  numberOfTrades: number
}

export function useDetailedMetrics(symbol: string, selectedDate: string | null) {
  const [metrics, setMetrics] = useState<DetailedMetrics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const validSymbol = symbol || "BTCUSDT"

    if (!selectedDate || !validSymbol) {
      setMetrics(null)
      return
    }

    const fetchDetailedMetrics = async () => {
      setLoading(true)
      setError(null)

      try {
        // historical data for technical indicators
        const klineData = await binanceAPI.getKlineData(validSymbol, "1d", 100)
        const processedData = binanceAPI.processKlineData(klineData)

        console.log("Selected date:", selectedDate)
        console.log(
          "Available dates:",
          processedData.map((d) => d.date),
        )

        // Try multiple date matching strategies
        let selectedData = processedData.find((d) => d.date === selectedDate)

        // If exact match fails, try to find by date parts
        if (!selectedData) {
          const targetDate = new Date(selectedDate)
          selectedData = processedData.find((d) => {
            const dataDate = new Date(d.date)
            return (
              dataDate.getFullYear() === targetDate.getFullYear() &&
              dataDate.getMonth() === targetDate.getMonth() &&
              dataDate.getDate() === targetDate.getDate()
            )
          })
        }

        // closest date match
        if (!selectedData && processedData.length > 0) {
          const targetTime = new Date(selectedDate).getTime()
          selectedData = processedData.reduce((closest, current) => {
            const currentTime = new Date(current.date).getTime()
            const closestTime = new Date(closest.date).getTime()

            return Math.abs(currentTime - targetTime) < Math.abs(closestTime - targetTime) ? current : closest
          })

        }

        // use recent data as fallback
        if (!selectedData && processedData.length > 0) {
          selectedData = processedData[processedData.length - 1]
        }

        if (!selectedData) {
          throw new Error("No market data available")
        }

        // technical indicators
        const closePrices = processedData.map((d) => d.close)
        const rsi = binanceAPI.calculateRSI(closePrices)
        const ma20 = binanceAPI.calculateMovingAverage(closePrices, 20)
        const ma50 = binanceAPI.calculateMovingAverage(closePrices, 50)

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
          rsi,
          ma20,
          ma50,
          change: selectedData.close - selectedData.open,
          changePercent: selectedData.performance,
          numberOfTrades: selectedData.numberOfTrades,
        })
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to fetch detailed metrics")
      } finally {
        setLoading(false)
      }
    }

    fetchDetailedMetrics()
  }, [symbol, selectedDate])

  return { metrics, loading, error }
}
