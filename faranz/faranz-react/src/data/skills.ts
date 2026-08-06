export interface SkillCategory {
  name: string;
  items: string[];
}

export const skills: SkillCategory[] = [
  {
    name: 'Languages',
    items: ['Python', 'TypeScript', 'JavaScript', 'Java', 'C++', 'PHP', 'SQL', 'C#'],
  },
  {
    name: 'AI / ML',
    items: [
      'LangChain',
      'RAG',
      'Multi-Agent Systems',
      'Claude AI',
      'GPT-4',
      'PyTorch',
      'TensorFlow',
      'Reinforcement Learning',
      'Computer Vision',
      'NLP',
    ],
  },
  {
    name: 'Backend',
    items: ['FastAPI', 'Node.js', 'Redis', 'Celery', 'PostgreSQL', 'SQLite', 'REST APIs', 'MCP Servers'],
  },
  {
    name: 'Frontend',
    items: ['React', 'Next.js', 'React Native', 'Vite', 'Framer Motion', 'Tailwind CSS'],
  },
  {
    name: 'Infrastructure',
    items: ['AWS Bedrock', 'Cloudflare Workers', 'Docker', 'Airflow', 'CI/CD', 'Sentry', 'Vercel'],
  },
  {
    name: 'Tools & Patterns',
    items: [
      'Git',
      'MCP Protocol',
      'Tool Calling',
      'Prompt Engineering',
      'AST Analysis',
      'Sigstore',
      'ElevenLabs',
      'Firecrawl',
    ],
  },
];
