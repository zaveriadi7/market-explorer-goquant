"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface AnimatedNumberProps {
  value: number
  className?: string
  prefix?: string
  suffix?: string
  decimals?: number
  duration?: number
}

export function AnimatedNumber({
  value,
  className,
  prefix = "",
  suffix = "",
  decimals = 2,
  duration = 1000,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (displayValue === value) return

    setIsAnimating(true)
    const startValue = displayValue
    const endValue = value
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3)

      const currentValue = startValue + (endValue - startValue) * easeOut
      setDisplayValue(currentValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setIsAnimating(false)
      }
    }

    requestAnimationFrame(animate)
  }, [value, displayValue, duration])

  return (
    <span className={cn("transition-colors duration-300", isAnimating && "text-green-400", className)}>
      {prefix}
      {displayValue.toFixed(decimals)}
      {suffix}
    </span>
  )
}
