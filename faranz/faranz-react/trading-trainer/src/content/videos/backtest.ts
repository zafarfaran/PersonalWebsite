import type { ModuleVideos } from './types'

export const backtestVideos: ModuleVideos = {
  lessons: {
    'backtest-stats': [{ id: 'BRH-M0lTmJg', title: 'Maximum Drawdown Calculation Explained in Excel | Portfolio Risk Analysis', by: "Ryan O'Connell, CFA, FRM" }],
    'backtest-luck': [
      { id: 'XNgt7F6FqDU', title: 'The standard error, Clearly Explained!!!', by: 'StatQuest with Josh Starmer' },
      { id: 'HDCOUXE3HMM', title: 'p-hacking: What it is and how to avoid it!', by: 'StatQuest with Josh Starmer' },
    ],
    'backtest-code': [{ id: 'T3PT4eV8xFU', title: 'Backtesting.py (1/2) - Backtest Trading Strategies in Python', by: 'Part Time Larry' }],
    'backtest-lies': [{ id: 'F_HHFVJjNZI', title: 'Why Your Backtest Lies: Survivorship & Look-Ahead Bias', by: 'QuantInsti Quantitative Learning' }],
    'backtest-oos': [{ id: 'WBZ_Vv-iMv4', title: "12.1) What is 'Walk Forward Analysis' and how does it improve Trading System Optimizations", by: 'Darwinex' }],
    'backtest-lab': [{ id: 'e4ytbIm2Xg0', title: 'Backtesting.py - Full course in python', by: 'Chad Thackray' }],
  },
  module: [{ id: 'BRUlSm4gdQ4', title: 'The 7 Reasons Most Machine Learning Funds Fail Marcos Lopez de Prado from QuantCon 2018', by: 'Quantopian' }],
  playlists: [
    {
      list: 'PLblh5JKOoLUK0FLuzwntyYI10UQFUhsY9',
      title: 'Statistics Fundamentals',
      by: 'StatQuest with Josh Starmer',
      about: 'Short, clear videos on means, standard deviations, standard errors, p-values and the traps of testing many ideas.',
      lessons: ['backtest-stats', 'backtest-luck'],
    },
    {
      list: 'PLSQl0a2vh4HBrMFHsJOEQLOKpfEAyYOAJ',
      title: 'Sampling distributions | AP Statistics | Khan Academy',
      by: 'Khan Academy',
      about: 'Why a proportion measured from a sample wanders, and how its spread shrinks with the sample size.',
      lessons: ['backtest-luck'],
    },
    {
      list: 'PLRFLF1OxMm_UL7WUWM31iynp0jMVf_vLW',
      title: 'Quantopian Lecture Series',
      by: 'Quantopian',
      about: 'Lectures from Quantopian on quantitative research in Python and the statistics behind testing a trading idea.',
      lessons: ['backtest-code', 'backtest-lies', 'backtest-oos'],
    },
  ],
}
