import type { ModuleVideos } from './types'

export const portfolioVideos: ModuleVideos = {
  lessons: {
    'portfolio-variance': [
      { id: 'InJ1alATnRw', title: 'Modern Portfolio Theory Explained: The Math Behind Diversification', by: "Ryan O'Connell, CFA, FRM" },
      { id: 'ywl3pq6yc54', title: '14. Portfolio Theory', by: 'MIT OpenCourseWare' },
    ],
    'portfolio-frontier': [
      { id: 'pwyR9uAM0iU', title: 'Efficient Frontier and Portfolio Optimization Explained | The Ultimate Guide', by: "Ryan O'Connell, CFA, FRM" },
      { id: '2pbu3_6lF40', title: 'Quantopian Lecture Series: Instability of Parameters', by: 'Quantopian' },
    ],
    'portfolio-shrink': [
      { id: 'heXLyuCTP1Y', title: 'Covariance matrix shrinkage: Ledoit and Wolf (2004)', by: 'NEDL' },
      { id: 'jSAqgotWYYc', title: '"Honey, I Deep-Shrunk the Sample Covariance Matrix!" by Dr. Erk Subasi', by: 'Quantopian' },
    ],
    'portfolio-riskparity': [
      { id: 'pPl7FIUTnNM', title: 'What are Risk Parity Funds? How do they work? Investing | Ray Dalio & Bridgewater 2020', by: 'Patrick Boyle' },
      { id: 'nYgxZnvk0hg', title: 'What is risk parity? | FT Markets', by: 'Financial Times' },
    ],
    'portfolio-kelly': [
      { id: 'UjsC2sk7vVg', title: 'How Does Leverage Affect Trading Returns? The Kelly Criterion | Coffeezilla Follow-up', by: 'Patrick Boyle' },
    ],
    'portfolio-var': [
      { id: 'MrVJSizFJhs', title: 'Expected Shortfall & Conditional Value at Risk (CVaR) Explained', by: "Ryan O'Connell, CFA, FRM" },
      { id: 'eHGJFOjyzr4', title: 'FRM: Expected Shortfall (ES)', by: 'Bionic Turtle' },
    ],
    'portfolio-factors': [
      { id: 'Ep8Y5JfQoRg', title: 'Quantopian Lecture Series: Risk Factor Expsosure', by: 'Quantopian' },
      { id: 'I1z7B2_FarQ', title: 'Quantopian Lecture Series: Position Concentration Risk', by: 'Quantopian' },
    ],
  },
  module: [
    { id: '92WaNz9mPeY', title: '7. Value At Risk (VAR) Models', by: 'MIT OpenCourseWare' },
    { id: '8TJQhQ2GZ0Y', title: '16. Portfolio Management', by: 'MIT OpenCourseWare' },
    { id: 'PtDzY3-7ieE', title: 'Applied Portfolio Management - Class 1 - Risk & Return', by: 'Patrick Boyle' },
  ],
  playlists: [
    {
      list: 'PLUl4u3cNGP63ctJIEC1UnZ0btsphnnoHR',
      title: 'MIT 18.S096 Topics in Mathematics w Applications in Finance',
      by: 'MIT OpenCourseWare',
      about: 'University lectures that include portfolio theory, value at risk and portfolio management, taught by MIT faculty and practitioners.',
      lessons: ['portfolio-variance', 'portfolio-frontier', 'portfolio-var'],
    },
    {
      list: 'PLRFLF1OxMm_UL7WUWM31iynp0jMVf_vLW',
      title: 'Quantopian Lecture Series',
      by: 'Quantopian',
      about: 'Short lectures with Python notebooks on estimation error, factor exposure, hedging and position concentration.',
      lessons: ['portfolio-frontier', 'portfolio-shrink', 'portfolio-factors'],
    },
    {
      list: 'PLHC72UlhAthDJjFF1-bimGHG5Ubjff5cw',
      title: 'Applied Portfolio Management',
      by: 'Patrick Boyle',
      about: 'A full course of recorded classes on risk and return, asset classes and how professional managers build portfolios.',
      lessons: ['portfolio-variance', 'portfolio-riskparity'],
    },
  ],
}
