import type { ModuleVideos } from './types'

export const quantVideos: ModuleVideos = {
  lessons: {
    'quant-returns': [
      { id: 'PtoUlt3V0CI', title: 'FRM: Why we use log returns in finance', by: 'Bionic Turtle' },
      { id: 'NNu1DjWcYeY', title: 'Python for Finance: Are stock returns normally distributed?', by: 'QuantPy' },
    ],
    'quant-signal': [
      { id: 'vemZtEM63GY', title: 'p-values: What they are and how to interpret them', by: 'StatQuest with Josh Starmer' },
      { id: 'YiDfbYtgUPc', title: 'Quantopian Lecture Series: p-Hacking and Multiple Comparisons Bias', by: 'Quantopian' },
    ],
    'quant-series': [
      { id: 'fnrSZvla51Y', title: 'Quantopian Lecture Series: Autocorrelation and AR Models', by: 'Quantopian' },
      { id: 'uBeM1FUk4Ps', title: '8. Time Series Analysis I', by: 'MIT OpenCourseWare' },
    ],
    'quant-sharpe': [
      { id: 'j4c2XqiJzRU', title: 'Python for Finance: Historical Volatility & Risk-Return Ratios', by: 'QuantPy' },
    ],
    'quant-features': [
      { id: 'JRuPx6lhP9M', title: 'P-Values and IC Analysis', by: 'Quantopian' },
      { id: 'v5IYcBxMDYE', title: 'Quantopian Lecture Series: Factor Analysis', by: 'Quantopian' },
    ],
    'quant-pairs': [
      { id: 'Pn_RiDbK82M', title: 'Integration, Cointegration, and Stationarity', by: 'Quantopian' },
      { id: 'g-qvFjvyqcs', title: '"Basic Statistical Arbitrage: Understanding the Math Behind Pairs Trading" by Max Margenot', by: 'Quantopian' },
    ],
    'quant-portfolio': [
      { id: 'I1z7B2_FarQ', title: 'Quantopian Lecture Series: Position Concentration Risk', by: 'Quantopian' },
      { id: 'ywl3pq6yc54', title: '14. Portfolio Theory', by: 'MIT OpenCourseWare' },
    ],
  },
  module: [
    { id: 'omgx5OjjwPo', title: 'Quant Trading - A History', by: 'Patrick Boyle' },
    { id: 'L3nlGfSyHV0', title: 'False Discovery Rates, FDR, clearly explained', by: 'StatQuest with Josh Starmer' },
  ],
  playlists: [
    {
      list: 'PLUl4u3cNGP63ctJIEC1UnZ0btsphnnoHR',
      title: 'MIT 18.S096 Topics in Mathematics w Applications in Finance',
      by: 'MIT OpenCourseWare',
      about: 'University lectures on the maths behind quant finance: time series, regression, portfolio theory and more, taught by MIT and industry practitioners.',
      lessons: ['quant-series', 'quant-portfolio'],
    },
    {
      list: 'PLqpCwow11-Oq_ENXbaHso3WqUjRq_xhRG',
      title: 'Python for Finance',
      by: 'QuantPy',
      about: 'Hands-on Python for market data: returns, their distribution, volatility and risk-return ratios.',
      lessons: ['quant-returns', 'quant-sharpe'],
    },
  ],
}
