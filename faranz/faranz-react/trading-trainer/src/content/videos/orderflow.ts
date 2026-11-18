import type { ModuleVideos } from './types'

// Every id, title and channel below was looked up through YouTube's oembed endpoint in November 2026.
// Order flow on YouTube is dominated by platform vendors and course sellers, so the picks lean on a university
// microstructure course, exchange and broker education, and news. Lessons without a fair, non-sales video have none.
export const orderflowVideos: ModuleVideos = {
  lessons: {
    'orderflow-tape': [{ id: 'nPqat782ADI', title: 'Lecture 1: Concepts and Institutions (Financial Markets Microstructure)', by: 'economification' }],
    'orderflow-delta': [{ id: 'P0-92CIfAUo', title: 'Lecture 3, part 1: Information and Prices (Financial Markets Microstructure)', by: 'economification' }],
    'orderflow-dom': [
      { id: 'pO5dppc5N6s', title: 'Lecture 6: Limit Order Book Markets (Financial Markets Microstructure)', by: 'economification' },
      { id: 'hvJR02fzFIQ', title: 'What are Iceberg orders and how to use them to reduce the impact cost?', by: 'Zerodha' },
    ],
    'orderflow-data': [
      { id: 'vE0Catso-JU', title: 'Lecture 8, part 1: Market Fragmentation (Financial Markets Microstructure)', by: 'economification' },
      { id: '7K3navPkzlU', title: 'Volume & Open Interest Explained | Options Trading Concepts', by: 'tastylive' },
    ],
    'orderflow-levels': [{ id: 'ahaf_MvGsmY', title: 'Micro E-mini Futures Products Overview', by: 'CME Group' }],
  },
  module: [
    { id: '_ZDEWVJan0s', title: 'The Wild $50M Ride of the Flash Crash Trader', by: 'Bloomberg Originals' },
    { id: 'c6rpYZ3plOM', title: 'JPMorgan to Pay $920 Million in Record Spoofing Case', by: 'Bloomberg Television' },
  ],
  playlists: [
    {
      list: 'PL4pUs4P_j1Wa2_P1lw44kFWWjKDTGUY7S',
      title: "Financial Markets (UCPH, spring '20)",
      by: 'economification',
      about: 'A University of Copenhagen course on market microstructure: order types, limit order books, how order flow carries information into prices, and fragmentation across venues.',
      lessons: ['orderflow-tape', 'orderflow-delta', 'orderflow-dom', 'orderflow-data'],
    },
  ],
}
