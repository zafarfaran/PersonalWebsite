import type { ModuleVideos } from './types'

export const riskVideos: ModuleVideos = {
  lessons: {
    'risk-per-trade': [
      { id: 'XtsdaIgEZ6s', title: "What Does 'Trade Small' Actually Mean? Position Sizing for Defined Risk", by: 'tastylive' },
      { id: 'pB96T0ciL5g', title: 'Trade Size & Capital Allocation - Risk Management', by: 'Option Alpha' },
    ],
    'risk-kelly': [
      { id: '-9JM9suCIHs', title: 'The Kelly Criterion', by: 'Mutual Information' },
      { id: 'UjsC2sk7vVg', title: 'How Does Leverage Affect Trading Returns? The Kelly Criterion | Coffeezilla Follow-up', by: 'Patrick Boyle' },
    ],
    'risk-stops': [
      { id: 'MXfRxbPNAKM', title: 'Applying Smarter Stop Loss Orders', by: 'Option Alpha' },
      { id: 'wUAYBMMpH6Q', title: 'Types Of Option Orders - Market, Limit, Stop Loss', by: 'Option Alpha' },
    ],
    'risk-limits': [
      { id: 'zneZrDkTwO8', title: 'Delta Does Three Things at Once. Most Traders Only Use One. Dr. Jim Schultz Explains All Three.', by: 'tastylive' },
    ],
    'risk-margin': [
      { id: 'DWygCCZadZc', title: 'Stock vs. Option Buying Power | Basic Trading Concepts', by: 'projectoption' },
      { id: 'SOSMvUzSJAs', title: 'Defined Risk vs Undefined Risk in 0 DTE Options (surprising results!) | 0 DTE Crash Course', by: 'tastylive' },
    ],
    'risk-lab': [{ id: '6-dhdMDiYWQ', title: 'Monte Carlo Simulation of a Stock Portfolio with Python', by: 'QuantPy' }],
  },
  module: [
    { id: 'A94BOkRjPmM', title: 'Options Trading Risk Management & The Indisputable Math Behind Optimal Position Sizing - Show #047', by: 'Option Alpha' },
    { id: 'sko-HlCcxQk', title: 'How Big Should You Bet? 16 Years of Backtests To Find Out | Market Measures', by: 'tastylive' },
  ],
  playlists: [
    {
      list: 'PLPVve34yolHbreC5W4WYuMAxC3Vn-DGnn',
      title: 'Calculated Risk',
      by: 'tastylive',
      about: 'Short tastylive episodes with Dr. Jim Schultz on what each options structure risks: hedges, assignment, defined-risk trades.',
      lessons: ['risk-margin'],
    },
    {
      list: 'PLhKnvfWKsu41l52gQ7TwA-6nbIVY5RbeA',
      title: 'Intermediate Playlist',
      by: 'Option Alpha',
      about: 'Option Alpha lessons past the basics, including trade size and capital allocation, black swan risk and portfolio beta-weighting.',
      lessons: ['risk-per-trade', 'risk-limits'],
    },
  ],
}
