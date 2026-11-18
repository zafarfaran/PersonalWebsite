import type { ModuleVideos } from './types'

export const pricingVideos: ModuleVideos = {
  lessons: {
    'pricing-drivers': [
      { id: 'IUnBPMEXK30', title: 'Intrinsic Value and Extrinsic Value | Options Trading For Beginners', by: 'projectoption' },
      { id: 'l9ta2nLXoao', title: 'The Greeks - Stock Option Price Factors Explained', by: 'The Plain Bagel' },
    ],
    'pricing-delta': [
      { id: 'gZqzEF-Rlnw', title: 'Option Delta Explained (The Basics, Probabilities & More)', by: 'projectoption' },
      { id: 'FP9mKcNhXno', title: 'What Is Options Delta?  The Options Greeks', by: 'Patrick Boyle' },
    ],
    'pricing-gamma': [
      { id: '-TQThX2TBl0', title: 'Option Gamma Explained (Option Greeks Tutorial)', by: 'projectoption' },
      { id: 'jrOgVLjYR1g', title: 'Options Gamma and the Rate of Delta Change', by: 'The Options Industry Council (OIC)' },
    ],
    'pricing-theta': [
      { id: '6RiHheBV9eM', title: 'Option Theta Explained (Time Decay Visualized With Examples)', by: 'projectoption' },
      { id: 'xygxdeiMLt8', title: 'Understanding Time Decay and Theta', by: 'The Options Industry Council (OIC)' },
    ],
    'pricing-vega': [
      { id: 'MEVVXTHxS0k', title: 'Option Vega Explained (The Volatility Greek Tutorial)', by: 'projectoption' },
      { id: 'Hm9APmhdOew', title: 'What is Options Vega? The Options Greeks - Options Trading Tutorial', by: 'Patrick Boyle' },
    ],
    'pricing-black-scholes': [
      { id: 'pr-u4LCFYEY', title: 'Introduction to the Black-Scholes formula | Finance & Capital Markets | Khan Academy', by: 'Khan Academy' },
      { id: 'm4mrd7sHCPM', title: 'Put-call parity | Finance & Capital Markets | Khan Academy', by: 'Khan Academy' },
    ],
    'pricing-estimate': [
      { id: 'SFebmSYSZA8', title: 'Option Greeks Explained for Beginners', by: 'projectoption' },
      { id: 'HEIjc1ftR8A', title: 'Delta, Gamma, Theta and Vega in Multi-Leg Trades', by: 'The Options Industry Council (OIC)' },
    ],
    'pricing-lab': [
      { id: 'FzeXWMlTDHY', title: 'Black-Scholes Implementation in Python', by: 'QuantPy' },
      { id: '558k7D2alxM', title: 'Calculating Option Greeks using Black-Scholes with Python', by: 'QuantPy' },
    ],
  },
  module: [
    { id: 'PcdZ3IPGHSA', title: 'The Option Greeks and Hedging - Revision Lecture', by: 'Patrick Boyle' },
    { id: 'kAYFAiB6M6I', title: 'The Greeks I: Delta, Gamma and Theta', by: 'The Options Industry Council (OIC)' },
    { id: 'TnS8kI_KuJc', title: '19. Black-Scholes Formula, Risk-neutral Valuation', by: 'MIT OpenCourseWare' },
  ],
  playlists: [
    {
      list: 'PL33AZa4cv-o7muM0tB8TSAJ4qsBU4cr6F',
      title: 'Learn to Measure Options Trading RISKS (The Option Greeks for Beginners)',
      by: 'projectoption',
      about: 'A beginner series with one video per Greek, using charts of option prices.',
      lessons: ['pricing-delta', 'pricing-gamma', 'pricing-theta', 'pricing-vega', 'pricing-estimate'],
    },
    {
      list: 'PLHC72UlhAthDu0ssGNfDibRJ5Owh4HMva',
      title: 'The Option Greeks',
      by: 'Patrick Boyle',
      about: 'Short lectures on delta, gamma, theta, vega and rho, and on hedging a position to delta neutral.',
      lessons: ['pricing-delta', 'pricing-gamma', 'pricing-theta', 'pricing-vega'],
    },
    {
      list: 'PLqpCwow11-Oq9xz_ptjN5FOKTHCL9F8LH',
      title: 'A Black-Scholes World',
      by: 'QuantPy',
      about: 'The Black-Scholes model and its Greeks, derived and then written in Python.',
      lessons: ['pricing-black-scholes', 'pricing-lab'],
    },
  ],
}
