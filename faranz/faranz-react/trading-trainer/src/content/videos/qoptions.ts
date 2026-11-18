import type { ModuleVideos } from './types'

export const qoptionsVideos: ModuleVideos = {
  lessons: {
    'qoptions-replication': [
      { id: 'k7z1eniyS7Y', title: 'How to Price Options using a Binomial Tree (The Portfolio Approach)', by: 'Patrick Boyle' },
      { id: '2UCHztlWuZg', title: 'Lecture 21: Black-Scholes Formula, Risk Neutral Valuation', by: 'MIT OpenCourseWare' },
    ],
    'qoptions-binomial': [
      { id: 'a3906k9C0fM', title: 'Binomial Option Pricing Model || Theory & Implementation in Python', by: 'QuantPy' },
      { id: 'K2Iy8bCmXjk', title: 'American Option Pricing with Binomial Trees || Theory & Implementation in Python', by: 'QuantPy' },
    ],
    'qoptions-montecarlo': [
      { id: 'pR32aii3shk', title: 'Monte Carlo Simulation for Option Pricing with Python (Basic Ideas Explained)', by: 'QuantPy' },
      { id: '2uTVahxdqek', title: 'Monte Carlo Variance Reduction with Control Variates | Option Pricing Accuracy', by: 'QuantPy' },
    ],
    'qoptions-iv': [
      { id: 'mPgVeazeq5U', title: "Option Implied Volatility using Newton's Method in Python", by: 'QuantPy' },
    ],
    'qoptions-surface': [
      { id: 'ruFWFUkpbQk', title: 'The Volatility Smile - Options Trading Lessons', by: 'Patrick Boyle' },
      { id: 'si7pmNWwSu8', title: 'The Term Structure of Volatility and the Volatility Surface', by: 'Patrick Boyle' },
    ],
    'qoptions-hedging': [
      { id: 'By3G_qs9ADU', title: 'What is Delta Hedging || Dynamic Delta Hedging like a Quant || Profit & Loss Options Trading', by: 'QuantPy' },
      { id: 'Q_Qrw-OH6yE', title: 'Dynamic Hedging of Options - Option Trading Strategies', by: 'Patrick Boyle' },
    ],
    'qoptions-varprem': [
      { id: 'XO1vKxx4z0M', title: 'What are Variance Swaps? Financial Derivatives - Trading Volatility', by: 'Patrick Boyle' },
      { id: 'IalwZ4MNPVE', title: 'How to Calculate the VIX Index', by: 'Cboe Global Markets' },
    ],
  },
  module: [
    { id: 'Ryiy_Rw4iEg', title: 'The Volatility Surface and Exotics - Revision Lecture', by: 'Patrick Boyle' },
    { id: 'D1OKeE0N71Q', title: 'Volatility Arbitrage - How does it work? - Options Trading Lessons', by: 'Patrick Boyle' },
  ],
  playlists: [
    {
      list: 'PLqpCwow11-OqqfELduCMcRI6wcnoM3GAZ',
      title: 'Monte Carlo for Finance',
      by: 'QuantPy',
      about: 'Monte Carlo in Python: option pricing, antithetic and control variates, barrier and Asian options, and portfolio value at risk.',
      lessons: ['qoptions-montecarlo', 'qoptions-lab'],
    },
    {
      list: 'PLHC72UlhAthC-AvkRjPoLjs_BDHgcF17E',
      title: 'Dynamic Hedging - Options',
      by: 'Patrick Boyle',
      about: 'Short lectures on delta-neutral portfolios, dynamic hedging, volatility trading and arbitrage, volatility and variance swaps, and VIX futures.',
      lessons: ['qoptions-hedging', 'qoptions-varprem'],
    },
    {
      list: 'PLHC72UlhAthB4P-kZS49NX1JgBI1lK-dF',
      title: 'The Term Structure of Volatility',
      by: 'Patrick Boyle',
      about: 'Short lectures on implied volatility, the smile, the term structure and the volatility surface, with volatility swaps and the VIX.',
      lessons: ['qoptions-iv', 'qoptions-surface'],
    },
  ],
}
