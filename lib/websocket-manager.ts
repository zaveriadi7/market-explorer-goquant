"use client"

export interface WebSocketTickerData {
  symbol: string
  price: string
  priceChange: string
  priceChangePercent: string
  volume: string
  high: string
  low: string
  open: string
}

export interface WebSocketKlineData {
  symbol: string
  openTime: number
  closeTime: number
  open: string
  high: string
  low: string
  close: string
  volume: string
}

class WebSocketManager {
  private connections: Map<string, WebSocket> = new Map()
  private reconnectAttempts: Map<string, number> = new Map()
  private reconnectTimers: Map<string, NodeJS.Timeout> = new Map()
  private maxReconnectAttempts = 3
  private reconnectDelay = 5000
  private isClient = typeof window !== "undefined"
  private fallbackMode = false

  // Subscribe to real-time ticker data 
  subscribeToTicker(symbol: string, callback: (data: WebSocketTickerData) => void): () => void {
    if (!this.isClient) {
      console.warn("WebSocket not available on server side")
      return () => {}
    }

    const streamName = `${symbol.toLowerCase()}@ticker`

    this.tryWebSocketConnection(streamName, callback)

    return () => {
      this.cleanupConnection(streamName)
    }
  }

  private async tryWebSocketConnection(streamName: string, callback: (data: WebSocketTickerData) => void) {
    // when fallback mode, skip WebSocket try
    if (this.fallbackMode) {
      return
    }

    const wsUrl = `wss://stream.binance.com:9443/ws/${streamName}`

    try {
      const ws = new WebSocket(wsUrl)
      this.connections.set(streamName, ws)

      const connectionTimeout = setTimeout(() => {
        if (ws.readyState === WebSocket.CONNECTING) {
          console.warn(`connection timeout for ${streamName}`)
          ws.close()
          this.handleConnectionFailure(streamName)
        }
      }, 10000) // 10 second timeout

      ws.onopen = () => {
        console.log(`connected: ${streamName}`)
        clearTimeout(connectionTimeout)
        this.reconnectAttempts.set(streamName, 0)
        this.fallbackMode = false // fall back off on success
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.e === "24hrTicker") {
            callback({
              symbol: data.s,
              price: data.c,
              priceChange: data.P,
              priceChangePercent: data.P,
              volume: data.v,
              high: data.h,
              low: data.l,
              open: data.o,
            })
          }
        } catch (error) {
          console.error(`Error parsing WebSocket data: ${streamName}:`, error)
        }
      }

      ws.onclose = (event) => {
        clearTimeout(connectionTimeout)
        console.log(`WebSocket disconnected: ${streamName}`)

        // attempt reconnection for certain closures
        if (event.code !== 1000 && event.code !== 1001) {
          this.handleReconnection(streamName, callback)
        }
      }

      ws.onerror = (error) => {
        clearTimeout(connectionTimeout)
        console.warn(`WebSocket error for ${streamName}`)
        this.handleConnectionFailure(streamName)
      }
    } catch (error) {
      console.error(`Failed to create WebSocket for ${streamName}:`, error)
      this.handleConnectionFailure(streamName)
    }
  }

  private handleConnectionFailure(streamName: string) {
    this.fallbackMode = true
    this.cleanupConnection(streamName)
    console.log(`WebSocket failed for ${streamName} - use polling fallback`)
  }

  private handleReconnection(streamName: string, callback: (data: WebSocketTickerData) => void) {
    const attempts = this.reconnectAttempts.get(streamName) || 0

    if (attempts < this.maxReconnectAttempts) {
      this.reconnectAttempts.set(streamName, attempts + 1)
      const delay = this.reconnectDelay * Math.pow(1.5, attempts)

      console.log(
        `Schedule WebSocket reconnection for ${streamName}`,
      )

      const timer = setTimeout(() => {
        this.tryWebSocketConnection(streamName, callback)
      }, delay)

      this.reconnectTimers.set(streamName, timer)
    } else {
      console.log(`Max WebSocket reconnection attempts reached for ${streamName} - switching to fallback mode`)
      this.fallbackMode = true
      this.reconnectAttempts.delete(streamName)
    }
  }

  private cleanupConnection(streamName: string) {
    // Clear reconnection timer
    const timer = this.reconnectTimers.get(streamName)
    if (timer) {
      clearTimeout(timer)
      this.reconnectTimers.delete(streamName)
    }

    // Close WebSocket connection
    const ws = this.connections.get(streamName)
    if (ws) {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close(1000, "Cleanup")
      }
      this.connections.delete(streamName)
    }
  }

  getConnectionStatus(streamName: string): boolean {
    if (this.fallbackMode) return false

    const ws = this.connections.get(streamName)
    return ws?.readyState === WebSocket.OPEN
  }

  getConnectionInfo(streamName: string): { attempts: number; connected: boolean; fallbackMode: boolean } {
    const ws = this.connections.get(streamName)
    const attempts = this.reconnectAttempts.get(streamName) || 0

    return {
      attempts,
      connected: ws?.readyState === WebSocket.OPEN && !this.fallbackMode,
      fallbackMode: this.fallbackMode,
    }
  }

  // Reset fallback mode (useful for manual retry)
  resetFallbackMode() {
    this.fallbackMode = false
    console.log("🔄 Fallback mode reset - WebSocket connections will be attempted again")
  }

  cleanup() {
    console.log("Cleaning up all WebSocket connections")

    this.reconnectTimers.forEach((timer) => clearTimeout(timer))
    this.reconnectTimers.clear()

    this.connections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close(1000, "Cleanup")
      }
    })

    this.connections.clear()
    this.reconnectAttempts.clear()
    this.fallbackMode = false
  }
}

export const wsManager = new WebSocketManager()
