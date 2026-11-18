import type { ModuleVideos } from './types'

export const strategiesVideos: ModuleVideos = {
  lessons: {
    'strategies-why': [
      { id: 'vserTCJvBfQ', title: 'What Options Traders MUST KNOW About Vertical Spreads', by: 'projectoption' },
      { id: 'yWJzxfssVF8', title: 'Defined Risk Spreads Explained | Options Trading Concepts', by: 'tastylive' },
    ],
    'strategies-debit': [
      { id: 'GnVOPn8QjB0', title: 'Bull Call Spread Tutorial & Trade Examples', by: 'projectoption' },
      { id: 'DbWfecrc3QQ', title: 'Bear Put Spread', by: 'The Options Industry Council (OIC)' },
    ],
    'strategies-credit': [
      { id: 'nVN7lpKMNnM', title: 'Put Credit Spread Explained (Setup, Trade Examples, & More)', by: 'projectoption' },
      { id: 'rKa3pkape1U', title: 'Bear Call Spread Explained', by: 'The Options Industry Council (OIC)' },
    ],
    'strategies-straddle': [
      { id: '4UlIMmXhjsc', title: 'Long Straddle Options Strategy (Best Guide w/ Examples!)', by: 'projectoption' },
      { id: 'zqdR4q-N5KQ', title: 'The Short Strangle Strategy Explained', by: 'The Options Industry Council (OIC)' },
    ],
    'strategies-condor': [
      { id: '2LqHVUwralQ', title: 'Iron Condor Options Strategy', by: 'The Options Industry Council (OIC)' },
      { id: '7CBW_Oidsd0', title: 'Short Iron Butterfly Options Strategy (Best Guide w/ Examples)', by: 'projectoption' },
    ],
    'strategies-calendar': [
      { id: 'kC8zobuTnmw', title: 'Options Calendar Spread Basics: What You Need To Know', by: 'The Options Industry Council (OIC)' },
      { id: 'xooFqACk_yg', title: 'How Long Calendar Spreads Work (w/ Examples) | Options Trading Explained', by: 'projectoption' },
    ],
    'strategies-choose': [{ id: 'rw3_XlfFkkQ', title: 'The Top Options Trading Strategies for Beginners', by: 'projectoption' }],
  },
  module: [
    { id: 'mwttDWfDQ9c', title: 'The Vertical Spread Options Strategies (The ULTIMATE In-Depth Guide)', by: 'projectoption' },
    { id: 'd6CTCLHrvhw', title: 'Trading Bull and Bear Spreads', by: 'The Options Industry Council (OIC)' },
    { id: 'i7JJLEkQWXg', title: 'Complex Spreads I: Iron Condors and Iron Butterflies', by: 'The Options Industry Council (OIC)' },
  ],
  playlists: [
    {
      list: 'PL33AZa4cv-o6r4wU-2pMzz_vjdvI94AYU',
      title: 'Vertical Spreads Explained (Options Trading)',
      by: 'projectoption',
      about: 'All four vertical spreads, then how time decay, implied volatility, the expiry and the strikes change what they make.',
      lessons: ['strategies-why', 'strategies-debit', 'strategies-credit'],
    },
    {
      list: 'PL33AZa4cv-o7Scu6We9uiI3goQIDCjDeC',
      title: 'Options Trading Strategy Guides',
      by: 'projectoption',
      about: 'One guide per strategy with payoff diagrams and worked examples, from single options and covered positions to spreads, for comparing structures side by side.',
      lessons: ['strategies-choose'],
    },
  ],
}
