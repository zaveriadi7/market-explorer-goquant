# Market Seasonality Explorer

**Market Seasonality Explorer** is a cryptocurrency analytics platform built as part of an assignment from **GoQuants** for the Frontend Developer role.

The platform is designed to help traders, analysts, and researchers **visualize, explore, and analyze market seasonality patterns**, price volatility, liquidity shifts, and key technical indicators in an intuitive calendar-based interface.

##  Features

- **Real-time Price Tracking** – Live cryptocurrency data from the Binance API, using kline/candlestick data to retreive historical data, 24hr ticker data for 24hr performance, and a websocket stream to fetch realtime data.
- **Interactive Calendar View** – Color-coded heatmap, based on metrics such as performance, volatility and volume.
- **Technical Analysis** – RSI, Moving Averages (MA), Volatility, Change, Change Percentages.
- **Market Comparison Tool** – Compare Data and metrics between two dates.  
- **Detailed Metrics** – OHLC, volume, volatility, quote volume, trade counts. 
- **Timeframe Flexibility** –Choose between Daily (`1d`), Weekly (`1w`), and Monthly (`1M`) 
-  **Alert Functionality** – Set custom Alerts for user specified currency and thresholds.
- **Responsive UI** – Optimized for mobile and desktop  
- **Export & Share** :-  Export selected data to:
    
    -   **PDF**
        
    -   **CSV**
        
    -   **JSON**
        

##  Tech Stack

| Layer        | Tech                 |
|--------------|----------------------|
| Frontend     | **Next.js**, **React**, **TypeScript** |
| Styling      | **Tailwind CSS** (Custom components) |
| Data Charts  | **Recharts**         |
| API          | **Binance REST & WebSocket** |
| State Management  | React Hooks          |
| Utilities    | Custom lib functions and classes|

---

## Getting Started

### 🔧 Installation
In your terminal, run the following commands (ensure node version 20)
```bash
git clone https://github.com/zaveriadi7/market-explorer-goquant.git
cd market-explorer-goquant

nvm use 20
npm i --f    
npm run dev     
```

Visit: [http://localhost:3000](http://localhost:3000)

##  Project Structure

```bash
root/
├── app/
│   ├── compare/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── charts/
│   │   ├── animated-market-overview.tsx
│   │   ├── realtime-price-chart.tsx
│   │   ├── technical-indicators-chart.tsx
│   │   ├── volatility-chart.tsx
│   │   └── volume-chart.tsx
│   └── ui/
│       ├── calendar-grid.tsx
│       ├── comparison-detail-view.tsx
│       ├── detail-panel.tsx
│       ├── left-sidebar.tsx
│       ├── theme-provider.tsx
│       └── top-navigation.tsx
├── hooks/
│   ├── use-detailed-metrics.ts
│   ├── use-market-data.ts
│   ├── use-realtime-data.ts
│   ├── use-technical-data.ts
│   
├── lib/
│   ├── binance-api.ts
│   ├── utils.ts
│   └── websocket-manager.ts
├── public/{static assests}
├── styles/
│   └── globals.css
├── .gitignore
├── components.json
├── next-env.d.ts
├── next.config.mjs
├── package-lock.json
├── package.json
├── pnpm-lock.yaml
├── postcss.config.mjs
├── README.md
├── tailwind.config.ts
├── Testing.txt
└── tsconfig.json

Testing.txt is a documentation of all the Test cases and data samples as received from BINANCE API.

```
##  `lib/` Folder Explained

###  `binance-api.ts`

A comprehensive utility to fetch, process, and compute technical metrics using Binance API.

#### Functions:

- `getKlineData(symbol, interval, limit)`  
  → Fetch OHLCV data from Binance (supports "1d", "1w", "1M")

- `processKlineData(rawData)`  
  → Normalizes raw OHLCV data and calculates:
  - `volatility`
  - `performance %`
  - `quote volume`

- `calculateRSI(closingPrices: number[])`  
  → Computes 14-period RSI

- `calculateMovingAverage(prices: number[], period: number)`  
  → Returns a simple moving average array

---

###  `websocket-manager.ts`

Handles all WebSocket streaming from Binance for real-time prices.

#### Exports:

```ts
subscribeToTicker(symbol: string, callback: (data) => void)
unsubscribeFromTicker(symbol: string)
```

- Automatically reconnects
- Supports multiple symbol streams
- Calls `callback` on every price update

## `hooks/` Folder Explained

Hooks folder contains reusable React hooks that manage logic for data fetching and real-time coin market tracking.

---

### `use-detailed-metrics.ts`

> Fetches and computes advanced metrics (RSI, volatility, MA, etc.) for a selected coin and date.

- Pulls kline history via `binance-api.ts`
- Matches data for the selected `date`
- Calculates:
  - RSI
  - Moving Averages
  - Volatility %
  - Performance %
  - Trade count
- Useful for right-side detail panels or popovers

---

### `use-market-data.ts`

> Retrieves and processes market data for a symbol over time (daily, weekly, monthly).

- Uses Binance Kline Data API using getklineData
- Calls `processKlineData()`
- Returns structured `ProcessedMarketData[]` for calendar views or heatmaps

**Used in:**
- Calendar grid
- Volatility/performance overlays

---

### `use-realtime-data.ts`

> Hook for managing real-time WebSocket price updates.

- Subscribes to Binance WebSocket ticker stream for a symbol
- Updates local state with `lastPrice`, `bid/ask`, etc.
- Manages auto-reconnects and cleanup

**Used in:**
- Price badges
- Live chart headers
- Real-time overview widgets

---

### `use-technical-data.ts`

> Combines and computes technical metrics over multiple candles.

- Fetches kline history (daily/weekly)
- Computes:
  - Moving Averages
  - RSI (over rolling windows)
  - Trend direction
- Returns a time-series array with metrics per candle

**Used in:**
- Chart overlays (lines on candlesticks)
- Trend analysis modules


Each hook plays a key role in separating data logic from UI rendering, improving performance, readability, and maintainability across your app.

##  How to Use the App

###  Daily Calendar Dashboard

- Loads daily performance for selected coin
- Hover or click a date to open metrics

###  Add Alerts

- Set custom price limits on currencies
- Notification pops up whenever price limits are crossed

###  Detailed Metrics Panel

- Open, High, Low, Close
- RSI, MA20, MA50
- Quote Volume, Trade Count
- Daily/Weekly/Monthly change

###  Compare Dates Tool

- Visit `/compare`
- Choose two calendar dates
- Visualizes key metric deltas

## **TechStack/Libraries Used**

-   `next`
    
-   `react`
    
-   `react-dom`
    
-   `typescript`
    
-   `tailwindcss`
    

    
-   `tailwindcss-animate`
    
-   `clsx`
    
-   `tailwind-merge`
        

    
-   `@radix-ui`  components
    
-   `recharts` as the charting library

-   `date-fns`
    
-   `react-day-picker`
    


-   `lucide-react` (icon set)
-    `sonner` (toast notification lib)

    
## Thank You, GoQuant

I would like to thank the team at **GoQuant** for this opportunity. It was a valuable experience that allowed me to demonstrate my technical skills and approach to problem-solving.

I appreciate your time and consideration, and I look forward to the possibility of contributing further to your team.

> Built  by [Aditya Zaveri](https://adityazaveri.vercel.app/)

Google Docs link for documentation:- https://docs.google.com/document/d/1yeUlwarxtB-DJyS56WVA1zKAorlHnA7lTRYMpcfKyoU/edit?usp=sharing 
Video Submission:-https://www.loom.com/share/99443d183a7d44df8433784c477941b6