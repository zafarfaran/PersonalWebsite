import type { ModuleVideos } from './types'

export const chartsVideos: ModuleVideos = {
  lessons: {
    'charts-candles': [
      { id: 'BbsvIVjiVNY', title: 'How to Read a Stock Chart', by: 'Charles Schwab' },
      {
        id: 'HrfZHn9QLVQ',
        title: 'Candlesticks - What They Are & How Traders Might Use Them | Getting Started with Technical Analysis',
        by: 'Trader Talks: Schwab Coaching Webcasts',
      },
    ],
    'charts-trend': [
      { id: 'A3jaE4vABKU', title: 'How to Identify Stock Trend Changes', by: 'Charles Schwab' },
    ],
    'charts-levels': [
      { id: 'xzUCED09Z_A', title: 'How to Use Support and Resistance to Read Stock Charts', by: 'Charles Schwab' },
    ],
    'charts-vwap': [
      { id: 'KOoW7toVIC0', title: 'What You Can Learn From Stock Trading Volume', by: 'Charles Schwab' },
      {
        id: 'xoRVowzJQDI',
        title: 'Timing Trades to the Minute with Volume-Weighted Average Price (VWAP)',
        by: 'Trader Talks: Schwab Coaching Webcasts',
      },
    ],
    'charts-averages': [
      { id: 'IvvUbh-cnX4', title: 'Stock Trading: Moving Averages', by: 'Charles Schwab' },
      { id: 'hO0oUSk6SJY', title: 'Trading Up-Close: SMA vs EMA', by: 'Charles Schwab' },
    ],
    'charts-indicators': [
      { id: 'KJgvIlBJeYg', title: 'Calculating Volatility with Average True Range | Investopedia', by: 'Investopedia' },
      { id: 'hbcCykbX14U', title: 'How to Use the Relative Strength Index (RSI)', by: 'Charles Schwab' },
    ],
    'charts-gaps': [
      {
        id: 'uyKyushL2xY',
        title: 'Candlestick Patterns: A Bullish Gap | Trade Management Mini Session',
        by: 'Trader Talks: Schwab Coaching Webcasts',
      },
    ],
    'charts-lab': [
      { id: 's3KIV-WaNuQ', title: 'Technical Analysis Library in Python Tutorial', by: 'Part Time Larry' },
      { id: '-pIyZh2kp_I', title: 'Technical Analysis in Python Made Easy with Pandas TA', by: 'NeuralNine' },
    ],
  },
  module: [
    {
      id: 'Um2BvTo2IS8',
      title: 'Intro to Technical Analysis: Lesson 1 | Getting Started with Technical Analysis | 6-23-26',
      by: 'Trader Talks: Schwab Coaching Webcasts',
    },
    {
      id: 'T2kF3hpXAyg',
      title: 'Support, Resistance and Trends | Technical Analysis Virtual Workshop | 4-27-26',
      by: 'Trader Talks: Schwab Coaching Webcasts',
    },
  ],
  playlists: [
    {
      list: 'PL8a6s5nq1lPSAWNZY0fBW06pPq0dV_U-L',
      title: 'Getting Started with Technical Analysis | Schwab Coaching',
      by: 'Trader Talks: Schwab Coaching Webcasts',
      about: 'A beginner class in sessions: charts, candlesticks, trends, support and resistance, and indicators',
      lessons: ['charts-candles', 'charts-trend', 'charts-levels', 'charts-averages', 'charts-indicators'],
    },
    {
      list: 'PLvzuUVysUFOuUKZzfbZCZph5mKr7GUHwy',
      title: 'Technical Analysis Libraries',
      by: 'Part Time Larry',
      about: 'Computing moving averages, RSI, ATR and other indicators from price data with Python libraries',
      lessons: ['charts-lab'],
    },
  ],
}
