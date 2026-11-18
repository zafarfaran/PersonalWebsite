import type { ModuleVideos } from './types'

export const executionVideos: ModuleVideos = {
  lessons: {
    'execution-book': [
      { id: 'pO5dppc5N6s', title: 'Lecture 6: Limit Order Book Markets (Financial Markets Microstructure)', by: 'economification' },
    ],
    'execution-cost': [
      { id: '8hYE-QMI2Yg', title: 'Lecture 2: Measuring Liquidity (Financial Markets Microstructure)', by: 'economification' },
      { id: 'Y9LCCnQe4X8', title: 'Physical Review Journal Club: Strict Universality of Square-Root Law in Price Impact Across Stocks', by: 'American Physical Society' },
    ],
    'execution-optimal': [
      { id: 'LaXVzC05Qgc', title: 'FCA Seminar / Prof Lillo - Market impact and optimal execution with transient models', by: 'UCL Financial Computing' },
    ],
    'execution-passive': [
      { id: 'W58yBI7owRs', title: 'Lecture 3, part 2: Glosten-Milgrom Model (Financial Markets Microstructure)', by: 'economification' },
    ],
    'execution-mm': [
      { id: 'S7eig5VXFpY', title: 'Where market making meets market microstructure', by: 'Sasha Stoikov' },
      { id: 'DLD_P2G5m5Q', title: 'Costis Maglaras: High-Frequency Trading', by: 'Columbia Business School' },
    ],
    'execution-venues': [
      { id: 'vtZ-J6an-s4', title: 'Dark Pools Explained - How Institutional Investors Utilize Off-Exchange Trading', by: 'The Plain Bagel' },
      { id: 'vE0Catso-JU', title: 'Lecture 8, part 1: Market Fragmentation (Financial Markets Microstructure)', by: 'economification' },
    ],
    'execution-tca': [
      { id: 'wGeG8POK1_E', title: 'How Much Does Payment for Order Flow Cost You? We Did an Experiment.', by: "Barron's" },
    ],
  },
  module: [
    { id: 'II0tXd4nADo', title: 'Lecture 12, part 1: High-Frequency and Algorithmic Trading (Financial Markets Microstructure)', by: 'economification' },
    { id: '2HSWM3fKldY', title: 'Dark Pools, Payment for Order Flow & Market Structure | Office Hours with Gary Gensler', by: 'U.S. Securities and Exchange Commission' },
  ],
  playlists: [
    {
      list: 'PL4pUs4P_j1Wa2_P1lw44kFWWjKDTGUY7S',
      title: "Financial Markets (UCPH, spring '20)",
      by: 'economification',
      about: 'A full university course on financial markets microstructure from the University of Copenhagen: liquidity, information and prices, limit order books, market design, fragmentation and high-frequency trading.',
      lessons: ['execution-book', 'execution-cost', 'execution-passive', 'execution-venues'],
    },
  ],
}
