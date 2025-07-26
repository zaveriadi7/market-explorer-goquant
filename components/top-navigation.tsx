"use client"

import { useEffect, useState } from "react"
import { TrendingUp, Wifi, Zap, BellPlus, X } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface TopNavigationProps {
  isConnected?: boolean
  currentPrice?: number
  priceChange?: number
  coinSymbol?: string
}

type ThresholdMap = {
  [coinSymbol: string]: {
    upper?: number
    lower?: number
  }
}

export function TopNavigation({
  isConnected = false,
  currentPrice,
  priceChange = 0,
  coinSymbol = "BTC",
}: TopNavigationProps) {
  const [thresholds, setThresholds] = useState<ThresholdMap>({})
  const [notifiedUpper, setNotifiedUpper] = useState<string[]>([])
  const [notifiedLower, setNotifiedLower] = useState<string[]>([])
  const [showModal, setShowModal] = useState(false)
  const [newCoin, setNewCoin] = useState("")
  const [newUpper, setNewUpper] = useState("")
  const [newLower, setNewLower] = useState("")

  useEffect(() => {
    if (!coinSymbol || currentPrice === undefined) return

    const symbol = coinSymbol.toUpperCase()
    const threshold = thresholds[symbol]

    if (!threshold) return

    if (threshold.upper !== undefined && !notifiedUpper.includes(symbol)) {
      if (currentPrice >= threshold.upper) {
        toast.success(
          `${symbol} crossed the UPPER threshold of $${threshold.upper}. Current: $${currentPrice.toLocaleString()}`,
          {
            description: "Your upper price alert just triggered.",
            duration: 6000,
          }
        )
        setNotifiedUpper((prev) => [...prev, symbol])
      }
    }

    if (threshold.lower !== undefined && !notifiedLower.includes(symbol)) {
      if (currentPrice <= threshold.lower) {
        toast.warning(
          `${symbol} dropped below the LOWER threshold of $${threshold.lower}. Current: $${currentPrice.toLocaleString()}`,
          {
            description: "Your lower price alert just triggered.",
            duration: 6000,
          }
        )
        setNotifiedLower((prev) => [...prev, symbol])
      }
    }
  }, [coinSymbol, currentPrice, thresholds, notifiedUpper, notifiedLower])

  const handleAddThreshold = () => {
    const symbol = newCoin.trim().toUpperCase()
    const upper = parseFloat(newUpper)
    const lower = parseFloat(newLower)

    if (!symbol || (isNaN(upper) && isNaN(lower))) {
      toast.error("Enter a valid coin and at least one numeric threshold.")
      return
    }

    setThresholds((prev) => ({
      ...prev,
      [symbol]: {
        upper: !isNaN(upper) ? upper : prev[symbol]?.upper,
        lower: !isNaN(lower) ? lower : prev[symbol]?.lower,
      },
    }))

    setNotifiedUpper((prev) => prev.filter((s) => s !== symbol))
    setNotifiedLower((prev) => prev.filter((s) => s !== symbol))

    toast(`Alert set for ${!isNaN(lower) ? `  $${lower} ≤ ` : ""}${symbol}${!isNaN(upper) ? ` ≥ $${upper}` : ""}`)
    setShowModal(false)
    setNewCoin("")
    setNewUpper("")
    setNewLower("")
  }

  return (
    <>
      {/* Main Navbar */}
      <nav className="relative bg-gradient-to-r from-gray-900 via-black to-gray-900 border-b border-gray-800/50 px-3 py-3 md:px-4 md:py-4 shadow-2xl backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-blue-500/5 animate-pulse pointer-events-none z-0" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
          {/* Logo & Title */}
          <div className="flex items-start sm:items-center gap-3 md:gap-4">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />
              <div className="relative w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-400 via-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-all duration-300">
                <TrendingUp className="w-5 h-5 md:w-7 md:h-7 text-white drop-shadow-lg" />
                <div className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-blue-500 rounded-full animate-pulse shadow-lg shadow-blue-500/50" />
              </div>
            </div>
            <div className="space-y-0.5 md:space-y-1">
              <h1 className="text-md font-mono md:text-2xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                Market Seasonality Explorer
              </h1>
              <p className="text-xs md:text-sm text-gray-400 font-medium">
                Advanced Cryptocurrency Analytics Platform
              </p>
            </div>
          </div>

          {/* Price, Connection, Alert Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-6">
            {/* Live Price */}
            {currentPrice !== undefined && (
              <div className="relative group w-full sm:w-auto">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-400/20 to-blue-500/20 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-300" />
                <div className="hidden  relative sm:flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 md:space-x-4 px-2 py-1 md:px-4 md:py-3 bg-gray-800/50 rounded-xl border border-gray-700/50 backdrop-blur-sm hover:border-gray-600/50 transition-all duration-300 w-full sm:w-auto">
                  <div className="text-left sm:text-right">
                    <div className="text-[8px] md:text-xs text-gray-400 font-medium">Live Price</div>
                    <div className="text-xs md:text-xl font-mono font-bold text-white">
                      ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div
                    className={cn(
                      "flex items-center space-x-1 md:space-x-2 px-2 md:px-3 py-1 md:py-2 rounded-lg text-[10px] md:text-sm font-bold transition-all duration-300",
                      priceChange >= 0
                        ? "bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-300 border border-green-500/30"
                        : "bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-300 border border-red-500/30"
                    )}
                  >
                    <TrendingUp className={cn("w-3 h-3 md:w-4 md:h-4", priceChange < 0 && "rotate-180")} />
                    <span>
                      {priceChange >= 0 ? "+" : ""}
                      {priceChange.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="relative group hidden md:flex">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-400/20 to-blue-500/20 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-300" />
              <div className="relative flex items-center space-x-3 px-4 py-3 bg-gray-800/50 rounded-xl border border-gray-700/50 backdrop-blur-sm hover:border-gray-600/50 transition-all duration-300">
                {isConnected ? (
                  <>
                    <Wifi className="w-5 h-5 text-green-400" />
                    <div className="text-sm">
                      <div className="text-green-400 font-bold">Live WebSocket</div>
                      <div className="text-gray-400">Real-time</div>
                    </div>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 text-blue-400" />
                    <div className="text-sm">
                      <div className="text-blue-400 font-bold">Polling Mode</div>
                      <div className="text-gray-400">Reliable</div>
                    </div>
                  </>
                )}
                <div
                  className={cn(
                    "w-3 h-3 rounded-full shadow-lg",
                    isConnected
                      ? "bg-green-400 animate-pulse shadow-green-400/50"
                      : "bg-blue-400 shadow-blue-400/50"
                  )}
                />
              </div>
            </div>

            {/* Set Alert Button */}
            <button
  onClick={() => setShowModal(true)}
  className="flex justify-center items-center gap-2 bg-gradient-to-br from-green-500/10 to-blue-500/10 hover:from-green-500/20 hover:to-blue-500/20 border border-gray-600/50 px-4 py-2 rounded-xl text-sm text-white backdrop-blur-md transition duration-300 w-full sm:w-fit text-center"
>
  <BellPlus className="w-4 h-4" />
  Set Alert
</button>

          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent"></div>
      </nav>

      {/* Alert Setup Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
          <div className="bg-gray-900 rounded-xl border border-gray-700 w-[90%] max-w-sm p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white mb-4">Set Price Alert</h2>
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm">Coin Symbol</label>
                <input
                  value={newCoin}
                  onChange={(e) => setNewCoin(e.target.value)}
                  placeholder="e.g. BTC"
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm">Upper Threshold (≥)</label>
                <input
                  value={newUpper}
                  onChange={(e) => setNewUpper(e.target.value)}
                  placeholder="e.g. 30000"
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm">Lower Threshold (≤)</label>
                <input
                  value={newLower}
                  onChange={(e) => setNewLower(e.target.value)}
                  placeholder="e.g. 25000"
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleAddThreshold}
                className="w-full bg-green-500 hover:bg-green-700 text-white py-2 rounded-lg transition"
              >
                Add Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
