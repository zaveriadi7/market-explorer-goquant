// Binance API integration for cryptocurrency market data
export interface BinanceKlineData {
  openTime: number
  open: string
  high: string
  low: string
  close: string
  volume: string
  closeTime: number
  quoteAssetVolume: string
  numberOfTrades: number
  takerBuyBaseAssetVolume: string
  takerBuyQuoteAssetVolume: string
}

export interface BinanceTicker24hr {
  symbol: string
  priceChange: string
  priceChangePercent: string
  weightedAvgPrice: string
  prevClosePrice: string
  lastPrice: string
  lastQty: string
  bidPrice: string
  askPrice: string
  openPrice: string
  highPrice: string
  lowPrice: string
  volume: string
  quoteVolume: string
  openTime: number
  closeTime: number
  firstId: number
  lastId: number
  count: number
}

export interface ProcessedMarketData {
  date: string
  day: number
  open: number
  high: number
  low: number
  close: number
  volume: number
  quoteVolume: number
  performance: number
  volatility: number
  heatmapIntensity: number
  trend: "up" | "down"
  numberOfTrades: number
}

class BinanceAPI {
  private baseUrl = "https://api.binance.com/api/v3"

  // Get historical kline/candlestick data
  async getKlineData(symbol: string, interval: "1d" | "1w" | "1M", limit = 30): Promise<BinanceKlineData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`)

      if (!response.ok) {
        throw new Error(`Binance API error: ${response.status}`)
      }

      const data = await response.json()

      return data.map((kline: any[]) => ({
        openTime: kline[0],
        open: kline[1],
        high: kline[2],
        low: kline[3],
        close: kline[4],
        volume: kline[5],
        closeTime: kline[6],
        quoteAssetVolume: kline[7],
        numberOfTrades: kline[8],
        takerBuyBaseAssetVolume: kline[9],
        takerBuyQuoteAssetVolume: kline[10],
      }))
    } catch (error) {
      console.error("Error fetching Binance kline data:", error)
      throw error
    }
  }

  // Get 24hr ticker statistics
  async get24hrTicker(symbol: string): Promise<BinanceTicker24hr> {
    try {
      const response = await fetch(`${this.baseUrl}/ticker/24hr?symbol=${symbol}`)

      if (!response.ok) {
        throw new Error(`Binance API error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching Binance 24hr ticker:", error)
      throw error
    }
  }

  // Get current average price
  async getAvgPrice(symbol: string): Promise<{ mins: number; price: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/avgPrice?symbol=${symbol}`)

      if (!response.ok) {
        throw new Error(`Binance API error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching Binance average price:", error)
      throw error
    }
  }

  // Process raw kline data into calendar format
  processKlineData(klineData: BinanceKlineData[]): ProcessedMarketData[] {
    return klineData.map((kline, index) => {
      const open = Number.parseFloat(kline.open)
      const high = Number.parseFloat(kline.high)
      const low = Number.parseFloat(kline.low)
      const close = Number.parseFloat(kline.close)
      const volume = Number.parseFloat(kline.volume)
      const quoteVolume = Number.parseFloat(kline.quoteAssetVolume)

      // Calculate performance (price change percentage)
      const performance = ((close - open) / open) * 100

      // Calculate volatility (high-low range as percentage of open)
      const volatility = ((high - low) / open) * 100

      // Create date from timestamp
      const date = new Date(kline.openTime)
      const day = date.getDate()

      return {
        date: date.toISOString().split("T")[0],
        day,
        open,
        high,
        low,
        close,
        volume,
        quoteVolume,
        performance,
        volatility,
        heatmapIntensity: Math.min(Math.abs(performance) / 10, 1), // Normalize to 0-1
        trend: performance >= 0 ? "up" : "down",
        numberOfTrades: kline.numberOfTrades,
      }
    })
  }

  // Calculate technical indicators
  calculateRSI(prices: number[], period = 14): number {
    if (prices.length < period + 1) return 50 // Default neutral RSI

    let gains = 0
    let losses = 0

    // Calculate initial average gain and loss
    for (let i = 1; i <= period; i++) {
      const change = prices[i] - prices[i - 1]
      if (change > 0) {
        gains += change
      } else {
        losses += Math.abs(change)
      }
    }

    const avgGain = gains / period
    const avgLoss = losses / period

    if (avgLoss === 0) return 100

    const rs = avgGain / avgLoss
    return 100 - 100 / (1 + rs)
  }

  calculateMovingAverage(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1] || 0

    const slice = prices.slice(-period)
    return slice.reduce((sum, price) => sum + price, 0) / period
  }
}

export const binanceAPI = new BinanceAPI()
