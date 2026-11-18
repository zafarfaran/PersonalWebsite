import type { ModuleVideos } from './types'

export const optionsVideos: ModuleVideos = {
  lessons: {
    'options-basics': [
      { id: '9ToOIp9Yp7w', title: 'Basics of Calls & Puts', by: 'The Options Industry Council (OIC)' },
      { id: 'y1L3RtcuyfM', title: 'What is a Put Option?', by: 'The Options Industry Council (OIC)' },
    ],
    'options-moneyness': [
      { id: 'IUnBPMEXK30', title: 'Intrinsic Value and Extrinsic Value | Options Trading For Beginners', by: 'projectoption' },
      { id: 'yRrfxp9AEYc', title: 'Intrinsic value and Time Value of Financial Options', by: 'Patrick Boyle' },
    ],
    'options-long': [
      { id: 'MZQxeQYQCUg', title: 'Call payoff diagram | Finance & Capital Markets | Khan Academy', by: 'Khan Academy' },
      { id: 'VST_U297pH0', title: 'Put payoff diagram | Finance & Capital Markets | Khan Academy', by: 'Khan Academy' },
    ],
    'options-short': [
      { id: 'TdW3LdN5SJw', title: 'Call writer payoff diagram | Finance & Capital Markets | Khan Academy', by: 'Khan Academy' },
      { id: 'WFuLVSz6n8M', title: 'Put writer payoff diagrams | Finance & Capital Markets | Khan Academy', by: 'Khan Academy' },
    ],
    'options-chain': [
      { id: 'WOhvdu4HpLY', title: 'Reading an Options Pricing Table - Options Pricing - Options Trading For Beginners', by: 'Option Alpha' },
      { id: '3o82OwR78wU', title: 'Actual option quotes | Finance & Capital Markets | Khan Academy', by: 'Khan Academy' },
    ],
    'options-exercise': [
      { id: 'OC-gkRp9hlw', title: 'Option Exercise and Assignment', by: 'The Options Industry Council (OIC)' },
      { id: '7pTb1a5IgKM', title: 'Early Options Assignment Risk (When to Worry & When to Chill)', by: 'projectoption' },
    ],
    'options-leverage': [{ id: 'N8h45mDI80s', title: 'Call option as leverage | Finance & Capital Markets | Khan Academy', by: 'Khan Academy' }],
  },
  module: [
    { id: '7PM4rNDr4oI', title: 'Options Trading for Beginners (The ULTIMATE In-Depth Guide)', by: 'projectoption' },
    { id: '11yxMH3p4gE', title: 'The Fundamentals of Options Trading [Beginners]', by: 'The Options Industry Council (OIC)' },
  ],
  playlists: [
    {
      list: 'PLSQl0a2vh4HB6DIcKXD2PgI7mYaqw0abW',
      title: 'Options, swaps, futures, MBSs, CDOs, and other derivatives | Finance and Capital Markets | Khan Academy',
      by: 'Khan Academy',
      about: 'Whiteboard lessons on derivatives; the option videos cover payoff diagrams, leverage, American options and real quotes, beside futures and swaps.',
      lessons: ['options-long', 'options-short', 'options-chain', 'options-leverage'],
    },
    {
      list: 'PLK_ozbfIM7m3zr5dlX5P40N_b_Eaq6g_6',
      title: 'Options Core Concepts - Level 1',
      by: 'The Options Industry Council (OIC)',
      about: 'Short videos from the industry educator on calls and puts, moneyness, expiration, exercise and assignment, covered calls and cash-secured puts.',
      lessons: ['options-basics', 'options-moneyness', 'options-short', 'options-exercise'],
    },
    {
      list: 'PL33AZa4cv-o58ldr-5zSn4ROx4SZG7Jyo',
      title: 'Become an Options Trading PRO (Options Trading for Beginners)',
      by: 'projectoption',
      about: 'Beginner tutorials on calls and puts, moneyness, buying against selling, why options are rarely exercised, early assignment and getting filled.',
      lessons: ['options-basics', 'options-moneyness', 'options-short', 'options-chain', 'options-exercise'],
    },
  ],
}
