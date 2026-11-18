import type { ModuleVideos } from './types'

export const engineVideos: ModuleVideos = {
  lessons: {
    'engine-design': [
      { id: 'OhGdVdolqkU', title: '"When Should You Build Your Own Backtester?" by Dr. Michael Halls-Moore', by: 'Quantopian' },
    ],
    'engine-events': [
      { id: 'wGSQ486Y4sc', title: 'Heaps & Priority Queues in Python', by: 'NeuralNine' },
    ],
    'engine-fills': [
      { id: '8yodOURXe9Q', title: 'Getting Started Lesson 9: Slippage and Commission', by: 'Quantopian' },
    ],
    'engine-live': [
      { id: 'dryNwWvSd4M', title: 'Protocols vs ABCs in Python - When to Use Which One?', by: 'ArjanCodes' },
      { id: 'DpMGEhwuuyA', title: 'Dependency Injection Makes Code Easier to Change and Test', by: 'ArjanCodes' },
    ],
    'engine-testing': [
      { id: 'mkgd9iOiICc', title: 'Property-Based Testing In Python: Hypothesis is AWESOME', by: 'ArjanCodes' },
      { id: 'KcyGUVzL7HA', title: 'Zac Hatfield-Dodds - Escape from auto-manual testing with Hypothesis! - PyCon 2019', by: 'PyCon 2019' },
    ],
  },
  module: [
    { id: 'wQrQwuWQ1FI', title: '"10 Ways Backtests Lie" by Tucker Balch', by: 'Quantopian' },
  ],
  playlists: [
    {
      list: 'PLC0nd42SBTaNuP4iB4L6SJlMaHE71FG6N',
      title: 'Software Design in Python',
      by: 'ArjanCodes',
      about: 'Software design in Python, including interfaces, dependency injection and coupling: the ideas behind swapping a simulated broker for a real one.',
      lessons: ['engine-events', 'engine-live'],
    },
    {
      list: 'PLC0nd42SBTaPYSgBqtlltw328zuafaCzA',
      title: 'Software Testing',
      by: 'ArjanCodes',
      about: 'Videos on testing Python code, for the test suite every engine needs.',
      lessons: ['engine-testing', 'engine-lab'],
    },
  ],
}
