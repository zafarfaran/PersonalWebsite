import type { ModuleVideos } from './types'

export const daytradingVideos: ModuleVideos = {
  lessons: {
    'daytrading-prep': [{ id: 'UGhvZp28MDg', title: 'The Economic Calendar for Traders: Tutorial', by: 'TradingView' }],
    'daytrading-orb': [
      { id: 'pEWHxe75nEo', title: 'How to Scan for OPENING RANGE Breakout Signals with thinkScript! | Trading with thinkScript®', by: 'Trader Talks: Schwab Coaching Webcasts' },
    ],
    'daytrading-trend': [
      { id: 'xoRVowzJQDI', title: 'Timing Trades to the Minute with Volume-Weighted Average Price (VWAP)', by: 'Trader Talks: Schwab Coaching Webcasts' },
      { id: 'zZ8zhme77sU', title: 'Understanding VWAP', by: 'tastylive' },
    ],
    'daytrading-range': [{ id: 'h42rp41RUy8', title: 'Most Traders Chase Breakouts. Chris Drysdale Fades Them Using One Line.', by: 'tastylive' }],
    'daytrading-option': [
      { id: 'WBbLPbB5SkM', title: '0DTE Options Trading Explained With Examples', by: 'projectoption' },
      { id: 'YH_hL1oRjU0', title: 'How We Trade 0DTE Vertical Spreads (without over spending) | Zero Days to Expiration Options', by: 'tastylive' },
    ],
    'daytrading-manage': [
      { id: '5atTocDOTpY', title: '0DTE: Inside the Explosion of Ultra-Risky Options Trading | WSJ', by: 'The Wall Street Journal' },
      { id: 'tRAAlL5yC7Y', title: 'Do Stop Losses Actually Help on Zero DTE Trades', by: 'tastylive' },
    ],
  },
  module: [
    { id: 'qhHOmZVAqBE', title: 'The Truth About Day Trading', by: 'Ben Felix' },
    { id: 'K-U6eoICrYQ', title: 'Why You Will (Probably) Lose Money Trading Options', by: 'Ben Felix' },
  ],
  playlists: [
    {
      list: 'PLPVve34yolHZmqmWi3TBXsfeNegyOWmwy',
      title: '0 DTE Options, Explained',
      by: 'tastylive',
      about: 'Short episodes on how same-day options behave, how they are traded and what their research found about managing them.',
      lessons: ['daytrading-option', 'daytrading-manage'],
    },
    {
      list: 'PL8a6s5nq1lPS9SVZZbuQhFRhONix0wg_f',
      title: 'Advanced Charting Techniques | Schwab Coaching',
      by: 'Trader Talks: Schwab Coaching Webcasts',
      about: 'Recorded coaching webcasts on VWAP, anchored VWAP, levels and planning a trade from a chart.',
      lessons: ['daytrading-trend', 'daytrading-range', 'daytrading-orb'],
    },
  ],
}
