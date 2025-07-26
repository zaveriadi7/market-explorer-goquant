"use client"

import { Wifi, AlertTriangle, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface ConnectionStatusProps {
  isConnected: boolean
  lastUpdated?: Date | null
  connectionAttempts?: number
  className?: string
  onRetry?: () => void
}

export function ConnectionStatus({
  isConnected,
  lastUpdated,
  connectionAttempts = 0,
  className,
  onRetry,
}: ConnectionStatusProps) {
  const getStatusColor = () => {
    if (isConnected) return "text-green-400"
    return "text-blue-400" // Use blue for polling mode instead of red
  }

  const getStatusText = () => {
    if (isConnected) return "Live WebSocket"
    return "Polling Mode"
  }

  const getStatusIcon = () => {
    if (isConnected) return <Wifi className="w-3 h-3" />
    return <Zap className="w-3 h-3" /> // Use lightning bolt for polling
  }

  return (
    <div className={cn("hidden sm:flex items-center space-x-2 text-sm", getStatusColor(), className)}>
      {getStatusIcon()}
      <span>{getStatusText()}</span>
      {connectionAttempts > 0 && (
        <div className="flex items-center space-x-1">
          <AlertTriangle className="w-3 h-3" />
          <span className="text-xs">({connectionAttempts} attempts)</span>
        </div>
      )}
      {lastUpdated && <span className="text-xs text-gray-500">• {lastUpdated.toLocaleTimeString()}</span>}
      {onRetry && !isConnected && (
        <button onClick={onRetry} className="text-xs text-blue-400 hover:text-blue-300 underline ml-2">
          Retry WebSocket
        </button>
      )}
    </div>
  )
}
