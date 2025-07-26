"use client";

import { TopNavigation } from "@/components/top-navigation";
import { useEffect, useState } from "react";

export default function MockPage() {
  const [price, setPrice] = useState(29500);
  const [isConnected, setIsConnected] = useState(true);

  // Simulate price changes for testing thresholds
  useEffect(() => {
    const interval = setInterval(() => {
      setPrice((prev) => {
        const change = (Math.random() - 0.5) * 500; // ±250 fluctuation
        return Math.max(0, prev + change);
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <TopNavigation
        isConnected={isConnected}
        currentPrice={price}
        priceChange={Math.random() * 10 - 5} // Random % between -5% to +5%
        coinSymbol="BTC"
      />
    </div>
  );
}
