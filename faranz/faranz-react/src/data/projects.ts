export interface Project {
  year: string;
  name: string;
  brief: string;
  subtitle: string;
  description: string;
  tags: string[];
  link?: string;
}

export const projects: Project[] = [
  {
    year: '2026',
    name: 'Chainwatch',
    brief: 'npm Supply Chain Risk Analyzer',
    subtitle:
      'Open-source, local-first tool that catches malicious packages before you install them.',
    description:
      'Multi-phase analysis pipeline: metadata heuristics, typosquatting detection, Sigstore provenance verification, AST-based behavioral analysis, obfuscation detection, and dependency tree walking. 138+ tests including red-team attack simulations.',
    tags: ['TypeScript', 'MCP Server', 'AST Analysis', 'Sigstore', 'Supply Chain Security'],
    link: 'https://watchman-rust.vercel.app/',
  },
  {
    year: '2026',
    name: 'Donald',
    brief: 'Voice "roast" + CV coaching',
    subtitle:
      '~40k views in 72 hours, 300+ users. Voice-first CV coach with Firecrawl research and ElevenLabs.',
    description:
      'PostgreSQL for accounts; Redis for rate limits and session; Celery workers for Firecrawl research. FastAPI + Next.js with Claude and ElevenLabs.',
    tags: ['FastAPI', 'Next.js', 'PostgreSQL', 'Redis', 'Celery', 'Claude', 'ElevenLabs'],
  },
  {
    year: '2026',
    name: 'GalleryGen',
    brief: 'AI-Curated 3D Gallery',
    subtitle:
      'Won ElevenHacks. Upload photos and walk through exhibitions arranged by a Claude curator.',
    description:
      'React + react-three-fiber walkable 3D renderer; Node/Express + Prisma curator agent with tool-calling (theme, hero, captions, layout); Python/FastAPI vision service. Pure layout engine emits scene.json with multi-room overflow and doorway placement.',
    tags: ['react-three-fiber', 'Claude', 'Express', 'Prisma', 'FastAPI', 'TypeScript'],
    link: 'https://ai-gallery-sooty.vercel.app/',
  },
  {
    year: '2026',
    name: 'GetOut',
    brief: 'Voice + text "social wingman"',
    subtitle:
      'Events, commitments, and similar users via embeddings; LLM tool-calling on Cloudflare edge.',
    description:
      'Next.js 14 + Worker; D1, Vectorize, 3 Durable Objects, 2 Queues; 5 agent tools, 3 event sources.',
    tags: ['Next.js', 'Cloudflare Workers', 'D1', 'Vectorize', 'Durable Objects', 'Workers AI'],
  },
  {
    year: '2026',
    name: 'Fixie',
    brief: 'Manuals → voice-enabled walkthroughs',
    subtitle:
      'Turns PDFs and URLs into guided, visual repair walkthroughs with durable storage and workers.',
    description:
      'PostgreSQL, Redis broker, Celery workers for PDF parsing and Replicate video jobs. FastAPI + Next.js with Claude and ElevenLabs.',
    tags: ['FastAPI', 'Next.js', 'PostgreSQL', 'Redis', 'Celery', 'Claude', 'ElevenLabs'],
  },
  {
    year: '2026',
    name: 'Urlybird',
    brief: 'Agentic Web Traffic to Structured Events',
    subtitle:
      'Built for RealityMine. MCP server enabling AI agents to autonomously analyse web traffic.',
    description:
      'MCP server with 7 tools over stdio/SSE. Sandboxed execution of AI-generated Python; BM25 retrieval and context-window optimisation.',
    tags: ['MCP Server', 'AI-Generated Code', 'Sandboxed Execution', 'Polars', 'SQLite/FTS5', 'Python'],
  },
  {
    year: '2026',
    name: 'Nova',
    brief: 'AI Document Management for Accountants',
    subtitle:
      'Won Saturn Hackathon. Scaling to startup. AI Operating System for Accountants.',
    description:
      'Multi-agent autonomous system with automated document processing, compliance validation, AI-powered data extraction, VAT validation, duplicate detection, and AI chat with tool calling.',
    tags: ['Multi-Agent Systems', 'Claude AI', 'OCR', 'Compliance', 'Tool Calling'],
  },
  {
    year: '2026',
    name: 'BRRR Agent',
    brief: 'Property Search & BRRR Analysis',
    subtitle:
      'Claude plugin for property search and BRRR deal analysis with full price breakdowns.',
    description:
      'Python Claude plugin that screens investment properties, runs BRRR (Buy, Rehab, Rent, Refinance) analysis, and returns purchase, rehab, rent, and cash-flow price breakdowns.',
    tags: ['Python', 'Claude Plugin', 'BRRR', 'Property Analysis', 'Tool Calling'],
  },
  {
    year: '2026',
    name: 'Katsu',
    brief: 'Agentic Server Management',
    subtitle:
      'Built at RealityMine. LLM-powered agentic fleet management.',
    description:
      'CLI interface, Slack integration, automated alarm remediation. Reduced MTTR from 1-2 hours to minutes. Multi-agent architecture with verifier agents, prompt injection prevention, HITL workflows.',
    tags: ['AWS Bedrock', 'LangChain', 'Multi-Agent', 'CLI'],
  },
  {
    year: '2026',
    name: 'flashbits',
    brief: 'Coding Interview Prep',
    subtitle:
      'Sold. AI-powered swipe-based mobile learning platform.',
    description:
      'Swipe-based learning with AI-generated quizzes, spaced repetition, gamification with XP system, 1,700+ curated DSA problems.',
    tags: ['AI Assistant', 'Spaced Repetition', 'React Native', 'Gamification'],
  },
  {
    year: '2025',
    name: 'Arc',
    brief: 'AI Productivity Assistant',
    subtitle:
      'Multi-agent productivity system with intelligent task management.',
    description:
      'AI-powered platform with multi-agent assistant for task decomposition, automated day planning, calendar integration with conflict resolution.',
    tags: ['Multi-Agent', 'Agent Orchestration', 'LangChain', 'Calendar API'],
  },
  {
    year: '2024',
    name: 'Litigat8',
    brief: 'Legal AI Assistant',
    subtitle:
      'Multi-agent RAG system with workflow orchestration and shared memory.',
    description:
      'Production multi-agent system with task decomposition, inter-agent communication, hierarchical document chunking, hybrid retrieval, and query routing.',
    tags: ['Multi-Agent', 'RAG', 'Pinecone', 'GPT-4', 'Workflow Mgmt'],
  },
  {
    year: '2023',
    name: 'Hunter & Prey',
    brief: 'Multi-Agent RL',
    subtitle:
      'Multi-agent reinforcement learning in POMDPs using actor-critic PPO.',
    description:
      'Curriculum learning, reward shaping, experience replay, prioritized sampling with CTDE architecture for competitive environments.',
    tags: ['Reinforcement Learning', 'PPO', 'Unity ML-Agents', 'PyTorch'],
  },
  {
    year: '2023',
    name: 'Stock Price Prediction',
    brief: 'LSTM Neural Networks',
    subtitle:
      'Time-series forecasting with stacked LSTMs and attention mechanisms.',
    description:
      'Technical indicator pipelines, walk-forward validation, backtesting frameworks, model serving with drift detection.',
    tags: ['LSTM', 'Time-Series', 'TensorFlow', 'Attention', 'MLflow'],
  },
  {
    year: '2022',
    name: 'Facial Recognition',
    brief: 'Attendance System',
    subtitle:
      'Production CV pipeline with MTCNN face detection and deep metric learning.',
    description:
      'Cosine similarity matching, liveness detection, anti-spoofing, GDPR-compliant biometric hashing.',
    tags: ['Computer Vision', 'MTCNN', 'FaceNet', 'FastAPI'],
  },
];
