import type { ModuleVideos } from './types'

export const volatilityVideos: ModuleVideos = {
  lessons: {
    'volatility-realised': [
      { id: 'v-7VLAyhmqg', title: 'How to calculate Volatility using historical returns', by: 'Edspira' },
      { id: 'QT1HN3CQfLs', title: 'Historical Volatility', by: 'Option Alpha' },
    ],
    'volatility-implied': [
      { id: 'VIHldsSmASU', title: 'Implied volatility | Finance & Capital Markets | Khan Academy', by: 'Khan Academy' },
      { id: 'DvLmayY1S7Q', title: 'Implied Volatility Explained | Options Trading Concept', by: 'projectoption' },
    ],
    'volatility-expected-move': [
      { id: 'MzVGEzQ835A', title: 'How Reliable Are Expected Moves?', by: 'tastylive' },
      { id: 'EMiYIb8lbyk', title: 'Implied Volatility vs. Historical Volatility', by: 'projectoption' },
    ],
    'volatility-rank': [
      { id: 'dbDRyOGiFOM', title: 'IV Rank vs. IV Percentile: Which is Better? | Measuring Implied Volatility', by: 'projectoption' },
      { id: 'Kvcef2A5dkc', title: 'Implied Volatility IV vs IV Percentile', by: 'Option Alpha' },
    ],
    'volatility-skew': [
      { id: 'iSthDr5xgVU', title: 'Implied Volatility Skew & Three Things it Can Tell You', by: 'projectoption' },
      { id: 'ARSQiNi2sHw', title: 'Options Volatility Smile & Volatility Skew Explained | Options Trading', by: "Ryan O'Connell, CFA, FRM" },
    ],
    'volatility-vix': [
      { id: 'XMVV4tQ6pm4', title: 'The Volatility Index (VIX) Explained - Options Pricing - Options Mechanics', by: 'Option Alpha' },
      { id: 'U2DLXKIFNaY', title: 'VIX Term Structure Explained | Volatility Trading Concept', by: 'projectoption' },
    ],
    'volatility-events': [
      { id: 'r4L9YZo4qag', title: 'Earnings Implied Volatility', by: 'tastylive' },
      { id: '1Lw3aUxXdIA', title: 'What Is An IV Crush? [Episode 579]', by: 'Option Alpha' },
    ],
    'volatility-lab': [{ id: 'pr-u4LCFYEY', title: 'Introduction to the Black-Scholes formula | Finance & Capital Markets | Khan Academy', by: 'Khan Academy' }],
  },
  module: [
    { id: 'H-NHZq-skFo', title: 'Implied Volatility Explained (The ULTIMATE Guide)', by: 'projectoption' },
    { id: '6sx4d1ez0lY', title: "What Is Implied Volatility & Why It's Important - Options Pricing - Options Mechanics", by: 'Option Alpha' },
  ],
  playlists: [
    {
      list: 'PL33AZa4cv-o4e0IDTSGc_5Av6i7vFfP-E',
      title: 'Implied Volatility for Beginners (Options Trading)',
      by: 'projectoption',
      about: 'A series on implied volatility: what it is, IV against historical volatility, the expected move, IV rank and percentile, the VIX, its term structure and VIX products.',
      lessons: ['volatility-realised', 'volatility-implied', 'volatility-expected-move', 'volatility-rank', 'volatility-vix'],
    },
    {
      list: 'PLhKnvfWKsu41LBXnTi1VGr36OMG5Vweb7',
      title: 'Options Pricing',
      by: 'Option Alpha',
      about: 'Short lessons on how options are priced: reading a pricing table, parity, the Greeks, implied volatility and the VIX.',
      lessons: ['volatility-implied', 'volatility-vix'],
    },
  ],
}
