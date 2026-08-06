export interface Experience {
  company: string;
  location: string;
  position: string;
  period: string;
  bullets: string[];
  url?: string;
}

export const experiences: Experience[] = [
  {
    company: 'RealityMine',
    location: 'Manchester, UK',
    position: 'Machine Learning Engineer',
    period: 'Apr 2026 – Present',
    bullets: [
      'Migrated transformer-based models from Azkaban to Airflow, modernising ML orchestration and deployment',
      'Added contrastive learning to the model, improving accuracy by ~8%',
      'Designed Auto-Research — a CLI for autonomous ML experiments with Claude and OpenAI',
    ],
  },
  {
    company: 'RealityMine',
    location: 'Manchester, UK',
    position: 'Software Engineer',
    period: 'Dec 2024 – Apr 2026',
    bullets: [
      'Built an AI-powered server management and diagnostics tool that autonomously triages errors and runs remediation, cutting MTTR from ~60 min to minutes',
      'Built an agentic automation tool that converts raw web-traffic captures into extraction code, eliminating ~20 hours/week of manual analysis',
      'Optimized 600 GB/day data pipeline, improving throughput by 86%',
      'Reduced legacy system alarms/crashes by ~95%',
    ],
  },
  {
    company: 'Acumei',
    location: 'Manchester, UK',
    position: 'Founder',
    period: '2025 – Present',
    url: 'https://acumei.com',
    bullets: [
      'Building AI automation ("AI Brain") for British SMEs — agentic pipelines handling calls, dispatch, rebooking, stock, and invoicing across CRM, POS, and diary systems',
      'Shipped production integrations for plumbing, hospitality, and salon clients: 14-second avg dispatch, 24% food-waste reduction, 7x weekly rebookings',
      'End-to-end custom builds in 3–14 days with full code/prompt ownership and GDPR-compliant data handling',
    ],
  },
  {
    company: 'Ovalens',
    location: 'London, UK',
    position: 'Founder & CTO',
    period: 'Jan 2026 – April 2026',
    url: 'https://ovalens.com',
    bullets: [
      'Raised £7k through a hackathon win',
      'Implemented a deterministic UK tax engine (16 modules) incl. income tax, NI, AA, HICBC, loans, ANI, BED/ISA',
      'Shipped Claude-powered chat (streaming) with 6 tools for modelling, dashboards, and note search',
      'Delivered 30+ REST APIs, async processing via Redis, 280+ tests, and production observability with Sentry',
    ],
  },
  {
    company: 'Google DeepMind',
    location: 'Birmingham, UK',
    position: 'Research Intern',
    period: 'July 2024 – Aug 2024',
    url: 'https://deepmind.google',
    bullets: [
      'Developed Adaptive Memory RAG (AMRAG) framework, integrating self-checks and web search, leading to 88% improvement in response accuracy',
      'Applied decomposition, QA context generation, hallucination detection, and retrieval augmentation',
      'Achieved sub-5-second response times',
    ],
  },
  {
    company: 'Aston University',
    location: 'Birmingham, UK',
    position: 'Teaching Assistant',
    period: 'Oct 2023 – July 2024',
    url: 'https://www.aston.ac.uk',
    bullets: [
      'Mentored 10+ student teams in OOP',
      'Led 8+ hands-on workshops on advanced OOP topics',
    ],
  },
];

export const education = {
  institution: 'Aston University',
  location: 'Birmingham, UK',
  degree: 'BSc in Computer Science',
  period: 'Sept 2021 – Sept 2024',
  description:
    'First Class Honours (4.0 GPA). Distinction in: DSA in Java, OOP, Computer Systems, AI, Data Mining, Game Development, Information Security, Software Project Management, Secure Network Services',
};
