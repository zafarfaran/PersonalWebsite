import type { ModuleVideos } from './types'

export const businessVideos: ModuleVideos = {
  lessons: {
    'business-losing': [
      { id: 'zRLA_gzCHns', title: 'Behavioral Finance Basics - Disposition Effect and Connection to Prospect Theory', by: 'Dr. Bryan Foltice - Behavioral Finance' },
      { id: 'Sl-qgzF70IM', title: 'Prospect Theory: An Overview', by: 'Ashley Hodgson' },
    ],
    'business-tilt': [{ id: 'dvM4ZZlaQJ0', title: 'Trading on Tilt (advice from trading psychologist Dr. Steenbarger)', by: 'SMB Capital' }],
    'business-process': [{ id: 'bBPa2Y_7Ps4', title: "'Resulting': Don’t mistake a bad outcome for a bad decision | Annie Duke | Big Think", by: 'Big Think' }],
    'business-scaling': [{ id: '5RRIFVgOrcE', title: 'Paper Trading vs Live Trading – What’s the Difference?', by: 'Interactive Brokers' }],
    'business-costs': [
      { id: 'qhHOmZVAqBE', title: 'The Truth About Day Trading', by: 'Ben Felix' },
      { id: 'uQZl-QzLnFA', title: 'Understanding the Wash Sale Rule', by: 'Charles Schwab' },
    ],
  },
  module: [
    { id: 'uYNsSeYjkp4', title: 'Thinking in Bets | Annie Duke | Talks at Google', by: 'Talks at Google' },
    { id: 'xi3Nc3BfvZs', title: "The Long View: Terry Odean - Who's on the Other Side of the Trade?", by: 'Morningstar, Inc.' },
    { id: 'K-U6eoICrYQ', title: 'Why You Will (Probably) Lose Money Trading Options', by: 'Ben Felix' },
  ],
  playlists: [
    {
      list: 'PLW59wUkLH8me0hNw8VdPoTe98RpXdDoKu',
      title: 'Heuristics and Biases Mini Course',
      by: 'Dr. Bryan Foltice - Behavioral Finance',
      about: 'Short lectures on mental shortcuts and biases: overconfidence and why overconfident traders trade more and earn less, hindsight, anchoring and seeing patterns in noise.',
      lessons: ['business-losing', 'business-process'],
    },
    {
      list: 'PLL6RiAl2WHXG14F7Bt64Udd6Xr-bvTGiB',
      title: 'Behavioral Economics',
      by: 'Ashley Hodgson',
      about: 'A university course on how people really decide: prospect theory, risk aversion and risk seeking, and planner-doer models of self-control.',
      lessons: ['business-losing', 'business-tilt'],
    },
  ],
}
