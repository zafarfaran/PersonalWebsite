import type { ModuleVideos } from './types'

export const qdataVideos: ModuleVideos = {
  lessons: {
    'qdata-arrays': [{ id: '-5wpm-gesOY', title: 'The Problem with Time & Timezones - Computerphile', by: 'Computerphile' }],
    'qdata-corporate': [
      { id: '59qyW1RxKIE', title: 'Stock Split', by: 'Edspira' },
      { id: 'kC-p84fmazI', title: 'What Is The Ex-Dividend Date?', by: 'PensionCraft' },
    ],
    'qdata-cleaning': [{ id: 'wCXQo6OYbhg', title: 'Modified Z-Score Explained (Python Outlier Detection)', by: 'AnalytiCode' }],
    'qdata-bars': [{ id: 'BRUlSm4gdQ4', title: 'The 7 Reasons Most Machine Learning Funds Fail Marcos Lopez de Prado from QuantCon 2018', by: 'Quantopian' }],
    'qdata-bias': [
      { id: 'bpf18AoZNug', title: 'Survivorship Bias Explained in One Minute: From Definition/Meaning to Examples (Finance and Trading)', by: 'One Minute Economics' },
    ],
    'qdata-derivs': [
      { id: '73RMlTVGCUc', title: 'Understanding Futures Expiration & Contract Roll', by: 'CME Group' },
      { id: 'n8j80VKJS-0', title: 'Options Symbols and Chains for Beginners', by: 'The Options Industry Council (OIC)' },
    ],
    'qdata-sources': [{ id: '1GKe5ghKJMc', title: 'What is FRED? | Federal Reserve Economic Data', by: 'Federal Reserve Bank of St. Louis' }],
  },
  module: [
    { id: 'm7IPbPg_ME8', title: '"Beware of Low Frequency Data" by Ernest Chan', by: 'Quantopian' },
    { id: 'QUT1VHiLmmI', title: 'Python NumPy Tutorial for Beginners', by: 'freeCodeCamp.org' },
  ],
  playlists: [
    {
      list: 'PLRFLF1OxMm_UL7WUWM31iynp0jMVf_vLW',
      title: 'Quantopian Lecture Series',
      by: 'Quantopian',
      about: 'Short lectures on quant research in Python, from data and statistics to the traps of estimation and overfitting.',
      lessons: ['qdata-cleaning', 'qdata-bias'],
    },
    {
      list: 'PLKcwEC4jDwiN5sOIay2qkpjTuvRTvkdso',
      title: 'How to Use FRED',
      by: 'Federal Reserve Bank of St. Louis',
      about: 'How to find, chart and download US economic series from FRED, a free source used in the sources lesson.',
      lessons: ['qdata-sources'],
    },
  ],
}
