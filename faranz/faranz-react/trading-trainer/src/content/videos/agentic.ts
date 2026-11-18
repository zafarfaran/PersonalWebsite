import type { ModuleVideos } from './types'

export const agenticVideos: ModuleVideos = {
  lessons: {
    'agentic-what': [
      { id: 'UwfjzyLnvMg', title: 'CMU AI Agents 2026: 1. What are Agents and How Do They Work?', by: 'Graham Neubig' },
      { id: 'sal78ACtGTc', title: "What's next for AI agentic workflows ft. Andrew Ng of AI Fund", by: 'Sequoia Capital' },
    ],
    'agentic-llms': [
      { id: 'LPZh9BOjkQs', title: 'Large Language Models explained briefly', by: '3Blue1Brown' },
    ],
    'agentic-tools': [
      { id: 'jXChFB4JSyw', title: 'CMU AI Agents 2026: 2. Tool Use for Language Model Agents', by: 'Graham Neubig' },
      { id: 's0S38lz6O7M', title: 'How AI Agents Use Tools: Function Calling & MCP | Stanford CS329Z Lecture 4 with Diyi Yang', by: 'Stanford Online' },
    ],
    'agentic-research': [
      { id: 'of4UDMvi2Kw', title: 'A Helping Hand for LLMs (Retrieval Augmented Generation) - Computerphile', by: 'Computerphile' },
    ],
    'agentic-multi': [
      { id: 'TlX_ft_PQIM', title: 'Multi-Agent Systems: When More Agents Help or Hurt | Stanford CS329Z Lecture 8 with Michael Ryan', by: 'Stanford Online' },
      { id: 'S8v-dR4s29M', title: 'CMU AI Agents 2026: 5. Planning, Task Decomposition, and Multi-Agent Coordination', by: 'Graham Neubig' },
    ],
    'agentic-guardrails': [
      { id: 'rAEqP9VEhe8', title: "Generative AI's Greatest Flaw - Computerphile", by: 'Computerphile' },
      { id: 'Mbonnq-PUGM', title: 'CMU AI Agents 2026: 13. Agentic Safety', by: 'Graham Neubig' },
    ],
  },
  module: [
    { id: 'zjkBMFhNj_g', title: '[1hr Talk] Intro to Large Language Models', by: 'Andrej Karpathy' },
    { id: 'JAcwtV_bFp4', title: 'The Hard Problem of Controlling Powerful AI Systems - Computerphile', by: 'Computerphile' },
  ],
  playlists: [
    {
      list: 'PLSN0qpDfUvTM',
      title: 'CMU 11-768, AI Agents: Fall 2026',
      by: 'Graham Neubig',
      about: 'A university course on language model agents: what they are, tool use, planning and multi-agent coordination, memory, and agent safety.',
      lessons: ['agentic-what', 'agentic-tools', 'agentic-multi', 'agentic-guardrails'],
    },
    {
      list: 'PLPRcF5HR02_U',
      title: 'Stanford CS329Z Engineering AI Agents | Autumn 2026',
      by: 'Stanford Online',
      about: 'Stanford lectures on building agents: function calling and tool protocols, design patterns such as ReAct, memory, and when more agents help or hurt.',
      lessons: ['agentic-tools', 'agentic-multi'],
    },
    {
      list: 'PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi',
      title: 'Neural networks',
      by: '3Blue1Brown',
      about: 'Visual explanations of neural networks, transformers and attention: what sits inside a language model.',
      lessons: ['agentic-llms'],
    },
  ],
}
