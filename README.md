# Market Seasonality Explorer

An advanced cryptocurrency analytics platform for visualizing and analyzing market seasonality patterns, price movements, and technical indicators.

## 🚀 Features

- **Real-time Price Tracking**: Live cryptocurrency data from the Binance API  
- **Interactive Calendar View**: Visualize historical and seasonal market performance  
- **Technical Analysis**: Key indicators including RSI, Moving Averages, and more  
- **Market Comparison Tool**: Compare behavior between different dates to identify seasonality trends  
- **Detailed Metrics**: Analyze OHLC, volume, volatility, and price action  
- **Responsive Design**: Fully optimized for both desktop and mobile devices  

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.4, React 19.1, TypeScript  
- **Styling**: Tailwind CSS (Custom UI components)  
- **Charts**: Recharts for rich data visualization  
- **API Integration**: Binance API for real-time cryptocurrency data  
- **Real-time Updates**: WebSocket support for live price feeds  

## ⚙️ Getting Started

### Prerequisites

- Node.js 18.0 or later  
- npm or yarn package manager  

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/market-explorer-goquant.git
   cd market-explorer-goquant
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open in your browser**

   Visit [http://localhost:3000](http://localhost:3000)

## 🧭 Usage Guide

### 📅 Main Dashboard

View the calendar with color-coded daily metrics based on volatility, price performance, and volume.

### 📊 Detailed Analysis

Click on any date to access detailed breakdowns:

- OHLC data  
- Volume analytics  
- RSI and Moving Averages  
- Volatility scores  

### 🔍 Comparison Tool

Use the **Compare** page to select two dates and evaluate differences in performance to uncover seasonal or behavioral patterns.

## 📁 Project Structure

```
├── app/                       # Next.js app directory
│   ├── compare/               # Market comparison page
│   └── page.tsx               # Main dashboard
├── components/                # Reusable React components
│   ├── charts/                # Chart-specific components
│   └── ui/                    # Custom UI elements
├── hooks/                     # Custom React hooks
├── lib/                       # Utility functions and API clients
│   ├── binance-api.ts         # Binance API integration logic
│   └── websocket-manager.ts   # Real-time WebSocket handling
└── public/                    # Static assets
```

## 🏗️ Development & Deployment

### Build for Production

```bash
npm run build
# or
yarn build
```

### Run Production Build

```bash
npm run start
# or
yarn start
```

## 📜 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Binance API](https://binance.com/) for providing comprehensive market data  
- [Next.js](https://nextjs.org/) for the robust React framework  
- [Tailwind CSS](https://tailwindcss.com/) for modern UI styling  
- [Recharts](https://recharts.org/) for data visualization  

---

> Built with ❤️ by Aditya Zaveri
