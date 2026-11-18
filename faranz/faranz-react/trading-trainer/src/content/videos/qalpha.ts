import type { ModuleVideos } from './types'

export const qalphaVideos: ModuleVideos = {
  lessons: {
    'qalpha-beta': [
      { id: 'z2oQe6B1Qa4', title: 'Ses 15: Portfolio Theory III & The CAPM and APT I', by: 'MIT OpenCourseWare' },
      { id: 'zXOjEc8t9LI', title: 'CAPM, Beta, Alpha, and Multifactor Asset Pricing (4a - summary)', by: 'Dr. Dicle Explains Finance' },
    ],
    'qalpha-factors': [
      { id: 'ViTnIebSzj4', title: 'Should You Be Factor Investing?', by: 'Ben Felix' },
      { id: 'kYO7xrHhqsY', title: 'The Truth About Value Investing (What the Data Shows)', by: 'Ben Felix' },
    ],
    'qalpha-xsection': [
      { id: 'eYNtOh1vNVQ', title: 'Long Short Equity', by: 'Quantopian' },
    ],
    'qalpha-clean': [
      { id: 'Ep8Y5JfQoRg', title: 'Quantopian Lecture Series: Risk Factor Expsosure', by: 'Quantopian' },
      { id: 'Af0l3TQJ3h8', title: 'Quantopian Summer Lecture: The Art of Not Following the Market', by: 'Quantopian' },
    ],
    'qalpha-judge': [
      { id: 'v5IYcBxMDYE', title: 'Quantopian Lecture Series: Factor Analysis', by: 'Quantopian' },
      { id: 'z8y-BB2Cmbk', title: 'Analyzing Alpha Factors with Alphalens - Algorithmic Trading with Python and Quantopian p. 6', by: 'sentdex' },
    ],
    'qalpha-research': [
      { id: 'KNCgvjyKrcw', title: 'Quantopian Lecture Series: Overfitting', by: 'Quantopian' },
    ],
  },
  module: [
    { id: 'P16zDtf0CE0', title: 'Quantopian Lecture Series: Fundamental Factor Models', by: 'Quantopian' },
    { id: 'ZvqO4jDun3E', title: 'Quantopian Lecture Series: Arbitrage Pricing Theory', by: 'Quantopian' },
    { id: 'N8gtnbJuMoo', title: 'Ses 16: The CAPM and APT II', by: 'MIT OpenCourseWare' },
  ],
  playlists: [
    {
      list: 'PLRFLF1OxMm_UL7WUWM31iynp0jMVf_vLW',
      title: 'Quantopian Lecture Series',
      by: 'Quantopian',
      about: 'Short lectures from a quant platform that closed in 2020: factor models, factor analysis with the IC, long-short equity, hedging exposures and overfitting.',
      lessons: ['qalpha-xsection', 'qalpha-clean', 'qalpha-judge', 'qalpha-research'],
    },
    {
      list: 'PLUl4u3cNGP63B2lDhyKOsImI7FjCf6eDW',
      title: 'MIT 15.401 Finance Theory I, Fall 2008',
      by: 'MIT OpenCourseWare',
      about: "Andrew Lo's MIT course: risk and return, portfolio theory, the CAPM and APT, and efficient markets, the theory behind beta and factors.",
      lessons: ['qalpha-beta', 'qalpha-factors'],
    },
  ],
}
