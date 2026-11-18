import type { ModuleVideos } from './types'

export const statarbVideos: ModuleVideos = {
  lessons: {
    'statarb-idea': [
      { id: 'RDdX7IfCM20', title: 'Applied Portfolio Management |  Hedge Funds (Part 2) How Hedge Funds Invest | Trading Strategies', by: 'Patrick Boyle' },
    ],
    'statarb-finding': [
      { id: 'JTucMRYMOyY', title: 'Introduction to Pairs Trading', by: 'Quantopian' },
    ],
    'statarb-coint': [
      { id: 'vvTKjm94Ars', title: 'Cointegration - an introduction', by: 'Ben Lambert' },
      { id: 'q5wbOSjbVW4', title: 'Cointegration tests', by: 'Ben Lambert' },
    ],
    'statarb-ou': [
      { id: 'vFjW-tSR0IQ', title: 'Ornstein-Uhlenbeck process | An Introduction', by: "Vahe's science channel" },
    ],
    'statarb-baskets': [
      { id: 'czg9bnDBcgY', title: 'What Is the Creation/Redemption Mechanism?', by: 'ETFcom' },
    ],
    'statarb-breaks': [
      { id: 'P5NnsFIQvFI', title: 'Short Selling Disasters!', by: 'Patrick Boyle' },
    ],
  },
  module: [
    { id: 'ToGIX1op0bY', title: 'Applied Portfolio Management - Class 7 - Hedge Fund Strategies - How Hedge Funds Invest', by: 'Patrick Boyle' },
    { id: 'C6j45b26b34', title: 'Basic Statistical Arbitrage: Understanding the Math Behind Pairs Trading', by: 'Quantopian' },
  ],
  playlists: [
    {
      list: 'PLwJRxp3blEvZyQBTTOMFRP_TDaSdly3gU',
      title: 'A full course in econometrics - undergraduate level - part 1',
      by: 'Ben Lambert',
      about: 'Short lectures on regression and time series, including stationarity, spurious regression, Dickey-Fuller tests and cointegration.',
      lessons: ['statarb-coint', 'statarb-ou'],
    },
    {
      list: 'PLHC72UlhAthDJjFF1-bimGHG5Ubjff5cw',
      title: 'Applied Portfolio Management',
      by: 'Patrick Boyle',
      about: 'A university course on how funds invest, including hedge fund strategies such as index arbitrage and statistical arbitrage.',
      lessons: ['statarb-idea', 'statarb-breaks'],
    },
  ],
}
