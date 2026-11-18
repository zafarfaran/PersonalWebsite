import type { ModuleVideos } from './types'

export const algoVideos: ModuleVideos = {
  lessons: {
    'algo-kinds': [
      { id: 'zi78J-h1XgY', title: 'High Frequency Trading and its Impact on Markets', by: 'The Plain Bagel' },
      { id: 'omgx5OjjwPo', title: 'Quant Trading - A History', by: 'Patrick Boyle' },
    ],
    'algo-anatomy': [{ id: 'gOuAqRaDdHA', title: 'Event-Driven Architecture: Explained in 7 Minutes!', by: 'Alex Hyett' }],
    'algo-data': [
      { id: 'Mv6c_9FqNx4', title: 'Alpaca Market Data API (Part 1) - Streaming with Python and Websockets', by: 'Part Time Larry' },
      { id: '-5wpm-gesOY', title: 'The Problem with Time & Timezones - Computerphile', by: 'Computerphile' },
    ],
    'algo-orders': [{ id: 'XAccGbtl3Z8', title: 'Idempotency - What it is and How to Implement it', by: 'Alex Hyett' }],
    'algo-execution': [
      { id: 'D0nxk7JsxfU', title: 'What is TWAP Trading Strategy? | How it Works? | Algo Trading Strategies', by: 'QuantInsti Quantitative Learning' },
      { id: 'Okzx4_oFc6w', title: 'Implementation Shortfall Explained from Start to Finish | CFA Level III', by: 'Zain Academy' },
    ],
    'algo-risk': [{ id: 'oIhn-l0y6dI', title: 'Knight Capital algorithm malfunction', by: 'Financial Times' }],
    'algo-live': [
      { id: 'yX43RYerHhU', title: 'Single vs  Multi Leg Options Strategies - Options Trading For Beginners', by: 'Option Alpha' },
      { id: 'fyg9A9ay8Z8', title: 'Build Multi-Leg Option Trades', by: 'Interactive Brokers' },
    ],
  },
  module: [{ id: 'XNZ7o3621FY', title: 'Algorithmic Trading and Machine Learning', by: 'Simons Institute for the Theory of Computing' }],
  playlists: [
    {
      list: 'PL71vNXrERKUpPreMb3z1WGx6fOTCzMaH1',
      title: 'TWS & CP (RESTful) API',
      by: 'Interactive Brokers',
      about: "The broker's own walk-through of its trading APIs: connecting, market data, orders and positions, best tried on a paper account.",
      lessons: ['algo-data', 'algo-orders', 'algo-live'],
    },
    {
      list: 'PLvzuUVysUFOsM5qSAr9ONVlhboRIOrSMR',
      title: 'Interactive Brokers API Tutorials',
      by: 'Part Time Larry',
      about: 'A programmer building trading tools on a broker API in Python, step by step, from data to orders.',
      lessons: ['algo-anatomy', 'algo-data', 'algo-lab'],
    },
  ],
}
