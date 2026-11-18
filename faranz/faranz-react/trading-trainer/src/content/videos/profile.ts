import type { ModuleVideos } from './types'

export const profileVideos: ModuleVideos = {
  lessons: {
    'profile-volume': [
      { id: 'fcQQqCyCwCA', title: 'Volume Profiles 101: Tutorial', by: 'TradingView' },
      { id: 'JmmE97AnpjE', title: 'Seeing Volume Differently: Trading Entry and Exit Signals With the Volume Profile Indicator', by: 'Charles Schwab' },
    ],
    'profile-value': [
      { id: 'y1nr5FN1XZE', title: 'The Basics of Volume Profiles: Tutorial', by: 'TradingView' },
      { id: 'P-TcEMTYWME', title: 'Auction Market Theory Explained: How Volume Profile Guides Trades', by: 'tastylive' },
    ],
    'profile-nodes': [
      { id: '8_tBudkEc1w', title: 'This 5-Minute Video Will Teach You the 3 Parts of Volume Profile Every Trader Needs to Know.', by: 'tastylive' },
      {
        id: 'HRhl8GfV-vs',
        title: 'A Closer Look at the Volume Profile Tool on thinkorswim Desktop | Getting Started with thinkorswim',
        by: 'Trader Talks: Schwab Coaching Webcasts',
      },
    ],
    'profile-auction': [
      { id: 'LgIPFsIjyLs', title: 'The Market Profile: Trading Value versus Price', by: 'James Dalton' },
    ],
    'profile-tpo': [
      { id: 'UwxZ_JCrt0o', title: 'Introducing Time Price Opportunity (TPO): Tutorial', by: 'TradingView' },
      { id: 'wK8dDwUZaxs', title: 'Market Profile Strategies: Trade Setups & Profit Targets Using TPO Profile Charts', by: 'NexusFi' },
    ],
    'profile-which': [
      { id: 'jYv_HKxEcVw', title: 'The Session Volume Profile: Tutorial', by: 'TradingView' },
      { id: 'mH_kGj0rLgA', title: 'Fixed Range Volume Profile: Tutorial', by: 'TradingView' },
    ],
    'profile-trading': [
      {
        id: 'QjxdXeAtmwk',
        title: 'Volume Profile: Is Everyone Using This Popular Chart Tool Wrong? | Getting Started with thinkorswim',
        by: 'Trader Talks: Schwab Coaching Webcasts',
      },
    ],
  },
  module: [
    { id: 'qXoxOk0Segg', title: 'Volume Strips with J. Peter Steidlmayer', by: 'Profile Trading' },
    { id: 'IuQTHTqRu9k', title: 'Auction Market Theory - Volume Profile - Rob Mitchell', by: 'NexusFi' },
  ],
  playlists: [
    {
      list: 'PLo4O5L04aNGD1G560WGpwpaSTzOP1YmDD',
      title: 'Volume Analysis',
      by: 'TradingView',
      about: "TradingView's own short tutorials on its volume profile tools: session, fixed range, anchored and visible range profiles, POC and value area settings.",
      lessons: ['profile-volume', 'profile-value', 'profile-nodes', 'profile-which'],
    },
    {
      list: 'PL11Eaf9X7GfDmR0vUCAToA7eGujgMotGp',
      title: 'Public Webinars',
      by: 'Jim Dalton Trading',
      about: 'Jim Dalton, author of Mind Over Markets, reading Market Profile and auction structure on live markets.',
      lessons: ['profile-auction', 'profile-tpo', 'profile-which', 'profile-trading'],
    },
  ],
}
