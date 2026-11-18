import type { ModuleVideos } from './types'

export const qseriesVideos: ModuleVideos = {
  lessons: {
    'qseries-acf': [
      { id: 'DeORzP0go5I', title: 'Time Series Talk : Autocorrelation and Partial Autocorrelation', by: 'ritvikmath' },
      { id: 'NzOF932JBwE', title: '2.13: The Ljung-Box test', by: 'Imran Arif, Ph.D' },
    ],
    'qseries-arma': [
      { id: '5-2C4eO4cPQ', title: 'Time Series Talk : Autoregressive Model', by: 'ritvikmath' },
      { id: 'voryLhxiPzE', title: 'Time Series Talk : Moving Average Model', by: 'ritvikmath' },
    ],
    'qseries-unitroot': [
      { id: '2GxWgIumPTA', title: 'Dickey Fuller test for unit root', by: 'Ben Lambert' },
      { id: 'eozA46jWBck', title: 'Spurious regression', by: 'Ben Lambert' },
    ],
    'qseries-ewma': [
      { id: 'ffDLG7Vt6JE', title: 'Volatility: Exponentially weighted moving average, EWMA (FRM T2-22)', by: 'Bionic Turtle' },
      { id: 'd8MBpc3ST10', title: 'Comparing volatility approaches: MA versus EWMA versus GARCH (FRM T2-25)', by: 'Bionic Turtle' },
    ],
    'qseries-garch': [
      { id: 'inoBpq1UEn4', title: 'GARCH Model : Time Series Talk', by: 'ritvikmath' },
      { id: '96nSIMS9_Y0', title: 'Coding the GARCH Model : Time Series Talk', by: 'ritvikmath' },
    ],
    'qseries-realised': [
      { id: '_v1UHy7OpjU', title: 'OHLC volatility (Part 1) - Parkinson and Garman Klass (Excel)', by: 'NEDL' },
    ],
    'qseries-regimes': [
      { id: 'iS9GnpPdmTQ', title: 'Markov chain regime switching models explained: bull and bear markets', by: 'NEDL' },
    ],
  },
  module: [
    { id: 'zapp8smQKhg', title: 'Lecture 19: Volatility Modeling', by: 'MIT OpenCourseWare' },
  ],
  playlists: [
    {
      list: 'PLvcbYUQ5t0UHOLnBzl46_Q6QKtFgfMGc3',
      title: 'Time Series Analysis',
      by: 'ritvikmath',
      about: 'Short whiteboard lessons on autocorrelation, AR, MA and ARMA models, stationarity, unit roots, ARCH and GARCH, with code examples.',
      lessons: ['qseries-acf', 'qseries-arma', 'qseries-unitroot', 'qseries-garch'],
    },
    {
      list: 'PL2A7DC11EB4C91AB5',
      title: 'Volatility',
      by: 'Bionic Turtle',
      about: 'Risk-management lessons on estimating volatility: historical windows, EWMA and GARCH(1,1), and how they compare.',
      lessons: ['qseries-ewma', 'qseries-garch'],
    },
  ],
}
