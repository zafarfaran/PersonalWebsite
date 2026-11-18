import type { ModuleVideos } from './types'

// Every id, title and channel below was looked up through YouTube's oembed endpoint in November 2026.
export const marketsVideos: ModuleVideos = {
  lessons: {
    'markets-instruments': [
      { id: '5A4lp_oZ5zg', title: 'Stock Indices & Index Fund Investing', by: 'The Plain Bagel' },
      { id: '-f-h7d0HH34', title: 'SPY vs SPX, the One Question to Ask Before You Trade', by: 'tastylive' },
    ],
    'markets-spread': [
      { id: 'Jxyuf-cDKeg', title: 'Bid Ask Spread Explained', by: 'Option Alpha' },
      { id: '1LNgRcjY_lo', title: 'What Is the Bid-Ask Spread? | Order Book & Trading Impact', by: "Ryan O'Connell, CFA, FRM" },
    ],
    'markets-book': [
      { id: '1WO1GmrIlS0', title: 'Market Makers (Liquidity Providers) and the Bid-Ask Spread Explained in One Minute', by: 'One Minute Economics' },
      { id: 'QqK6H1JPjv0', title: "What are 'market makers'? - MoneyWeek Investment Tutorials", by: 'MoneyWeek' },
    ],
    'markets-orders': [
      { id: 'Tiyystl8x40', title: 'Understanding Market, Limit, and Stop Orders', by: 'Charles Schwab' },
      { id: 'V-dnip2p3O4', title: 'Trading Up-Close: Stop and Stop-Limit Orders', by: 'Charles Schwab' },
    ],
    'markets-day': [{ id: 'jNeYFY2rJOE', title: 'Trading in the Pre-Market and After-Hours on Schwab.com | Comment Below', by: 'Charles Schwab' }],
    'markets-accounts': [
      { id: 'CAs_aX95tVQ', title: 'How Short Selling Works', by: 'The Plain Bagel' },
      { id: '-gR99-hUmKo', title: 'Three Ways to Use Margin and Leverage', by: 'Charles Schwab' },
    ],
    'markets-costs': [{ id: 'JsgDrKEHdLs', title: 'Payment for order flow: The relationship between brokerages and wholesalers explained', by: 'Yahoo Finance' }],
    'markets-lab': [{ id: 'BJt6PGKeO9I', title: 'Limit order book / Fundamentals of trading / Episode 4', by: 'Initial Return' }],
  },
  module: [
    { id: 'p7HKvqRI_Bo', title: 'How does the stock market work? - Oliver Elfenbaum', by: 'TED-Ed' },
    { id: 'BUxYsj99RiA', title: 'Short Selling - How Does It Work? | How Do You Short a Stock?', by: 'Patrick Boyle' },
  ],
  playlists: [
    {
      list: 'PLSQl0a2vh4HD1g_teRDEUkwMIIFlB8MJv',
      title: 'Stocks and bonds | Finance and Capital Markets | Khan Academy',
      by: 'Khan Academy',
      about: 'What shares are, how companies raise money, and how margin and short selling work, from first principles.',
      lessons: ['markets-instruments', 'markets-accounts'],
    },
    {
      list: 'PLD18sR-9Y-XHGlrT_3aKElcyzz9eTDGsy',
      title: 'The Plain Bagel Basics',
      by: 'The Plain Bagel',
      about: 'Short, plain explanations of stocks, funds, indexes and the market terms used throughout this module.',
      lessons: ['markets-instruments', 'markets-accounts'],
    },
  ],
}
