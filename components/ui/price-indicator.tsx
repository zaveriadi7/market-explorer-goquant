"use client"

import { useEffect, useState } from "react"
import { TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface PriceIndicatorProps {
  price: number
  change: number
  className?: string
}

export function PriceIndicator({ price, change, className }: PriceIndicatorProps) {
  const [flash, setFlash] = useState<"up" | "down" | null>(null)

  useEffect(() => {
    if (change !== 0) {
      setFlash(change > 0 ? "up" : "down")
      const timer = setTimeout(() => setFlash(null), 500)
      return () => clearTimeout(timer)
    }
  }, [change])

  return (
    <div
      className={cn(
        "flex items-center space-x-2 transition-all duration-300",
        flash === "up" && "bg-green-500/20 rounded px-2 py-1",
        flash === "down" && "bg-red-500/20 rounded px-2 py-1",
        className,
      )}
    >
      <span className="font-mono text-lg">${price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
      {change !== 0 && (
        <div className={cn("hidden sm:flex items-center", change > 0 ? "text-green-400" : "text-red-400")}>
          {change > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span className="text-sm ml-1">
            {change > 0 ? "+" : ""}
            {change.toFixed(2)}
          </span>
        </div>
      )}
    </div>
  )
}
