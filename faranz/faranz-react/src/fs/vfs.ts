import { experiences, education } from '../data/experience';
import { projects as projectData } from '../data/projects';
import { skills } from '../data/skills';

const MAX_TMP_FILES = 10;
const MAX_FILE_SIZE = 5120; // 5KB
const STORAGE_KEY = 'terminal-vfs-tmp';

export interface FsNode {
  type: 'file' | 'dir';
  name: string;
  content?: string;
  children?: Map<string, FsNode>;
  readonly?: boolean;
}

function makeDir(name: string, readonly = true): FsNode {
  return { type: 'dir', name, children: new Map(), readonly };
}

function makeFile(name: string, content: string, readonly = true): FsNode {
  return { type: 'file', name, content, readonly };
}

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function buildInitialFs(): FsNode {
  const root = makeDir('~');

  root.children!.set('README.md', makeFile('README.md', `# Faran Zafar — Terminal Portfolio

Welcome to my terminal portfolio.

Type 'help' for available commands.
Use 'ls' to explore the filesystem.
Use 'cd' to navigate directories.
Use 'cat <file>' to read any file.

Directories:
  experience/   — Work history
  projects/     — Shipped projects
  education/    — Academic background
  skills/       — Tech stack
  contact/      — Social links & email
  tmp/          — Writable sandbox

  -- faran
`));

  root.children!.set('about.txt', makeFile('about.txt', `Faran Zafar
===========

ML Engineer | AI Specialist | 6x Hackathon Winner

Building agentic AI systems that solve real problems.
Currently at RealityMine (Manchester) and running Acumei.

Languages:  Python, TypeScript, Java, SQL, C#
Focus:      Multi-Agent Systems, RAG, LLM Engineering
Projects:   14 shipped
Hackathons: 6x Winner

"I build things that think."
`));

  // ~/experience/
  const expDir = makeDir('experience');
  for (const exp of experiences) {
    const filename = `${slug(exp.company)}.md`;
    const lines = [
      `# ${exp.company}`,
      `> ${exp.position} — ${exp.period}`,
      `> ${exp.location}`,
      exp.url ? `> ${exp.url}` : '',
      '',
      ...exp.bullets.map(b => `- ${b}`),
      '',
    ].filter(l => l !== undefined);
    expDir.children!.set(filename, makeFile(filename, lines.join('\n')));
  }
  root.children!.set('experience', expDir);

  // ~/education/
  const eduDir = makeDir('education');
  eduDir.children!.set('degree.md', makeFile('degree.md', `# ${education.institution}
> ${education.degree} — ${education.period}
> ${education.location}

${education.description}
`));
  root.children!.set('education', eduDir);

  // ~/projects/
  const projDir = makeDir('projects');
  for (const p of projectData) {
    const filename = `${slug(p.name)}.md`;
    const content = [
      `# ${p.name} — ${p.brief} (${p.year})`,
      '',
      p.subtitle,
      '',
      p.description,
      '',
      `Tags: ${p.tags.join(', ')}`,
      p.link ? `Link: ${p.link}` : '',
      '',
    ].filter(l => l !== undefined).join('\n');
    projDir.children!.set(filename, makeFile(filename, content));
  }
  root.children!.set('projects', projDir);

  // ~/skills/
  const skillDir = makeDir('skills');
  for (const cat of skills) {
    const filename = `${slug(cat.name)}.txt`;
    const content = `${cat.name}\n${'='.repeat(cat.name.length)}\n\n${cat.items.join('\n')}\n`;
    skillDir.children!.set(filename, makeFile(filename, content));
  }
  skillDir.children!.set('all.txt', makeFile('all.txt',
    skills.map(c => `[${c.name}]\n${c.items.join(', ')}`).join('\n\n') + '\n'
  ));
  root.children!.set('skills', skillDir);

  // ~/contact/
  const contactDir = makeDir('contact');
  contactDir.children!.set('github.txt', makeFile('github.txt', 'https://github.com/farandead/\n'));
  contactDir.children!.set('linkedin.txt', makeFile('linkedin.txt', 'https://www.linkedin.com/in/faranzafar/\n'));
  contactDir.children!.set('medium.txt', makeFile('medium.txt', 'https://medium.com/@faranzafar\n'));
  contactDir.children!.set('instagram.txt', makeFile('instagram.txt', 'https://www.instagram.com/humangasorus/\n'));
  contactDir.children!.set('email.txt', makeFile('email.txt', 'faranzafar2001@gmail.com\n'));
  contactDir.children!.set('all.txt', makeFile('all.txt', `GitHub:    https://github.com/farandead/
LinkedIn:  https://www.linkedin.com/in/faranzafar/
Medium:    https://medium.com/@faranzafar
Instagram: https://www.instagram.com/humangasorus/
Email:     faranzafar2001@gmail.com
`));
  root.children!.set('contact', contactDir);

  // ~/tmp/ — writable
  const tmp = makeDir('tmp', false);
  root.children!.set('tmp', tmp);

  // ~/.bashrc (easter egg)
  root.children!.set('.bashrc', makeFile('.bashrc', `# faran's terminal config
export PS1="\\u@portfolio:\\w$ "
alias ll="ls -la"
alias cls="clear"
alias hack="echo 'nice try'"

# the cake is a lie
`));

  // ~/.gitconfig (easter egg)
  root.children!.set('.gitconfig', makeFile('.gitconfig', `[user]
    name = Faran Zafar
    email = faranzafar2001@gmail.com
[core]
    editor = nano
[init]
    defaultBranch = main
[alias]
    s = status
    co = checkout
    lg = log --oneline --graph
`));

  return root;
}

let fsRoot: FsNode = buildInitialFs();
let cwd: string[] = []; // path segments relative to ~

function loadTmpFromStorage(): void {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    const files: Record<string, string> = JSON.parse(saved);
    const tmp = fsRoot.children!.get('tmp')!;
    for (const [name, content] of Object.entries(files)) {
      tmp.children!.set(name, makeFile(name, content, false));
    }
  } catch {
    // ignore corrupt storage
  }
}

function saveTmpToStorage(): void {
  const tmp = fsRoot.children!.get('tmp')!;
  const files: Record<string, string> = {};
  for (const [name, node] of tmp.children!) {
    if (node.type === 'file') {
      files[name] = node.content || '';
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
}

loadTmpFromStorage();

// Resolve a path string to path segments
function resolvePath(input: string): string[] {
  if (input === '~' || input === '/') return [];

  let segments: string[];
  if (input.startsWith('~/') || input.startsWith('/')) {
    segments = input.replace(/^~?\/?/, '').split('/').filter(Boolean);
  } else {
    segments = [...cwd, ...input.split('/').filter(Boolean)];
  }

  // Handle . and ..
  const resolved: string[] = [];
  for (const seg of segments) {
    if (seg === '.') continue;
    if (seg === '..') {
      resolved.pop();
    } else {
      resolved.push(seg);
    }
  }
  return resolved;
}

function getNode(pathSegments: string[]): FsNode | null {
  let node = fsRoot;
  for (const seg of pathSegments) {
    if (node.type !== 'dir' || !node.children) return null;
    const child = node.children.get(seg);
    if (!child) return null;
    node = child;
  }
  return node;
}

function isInsideTmp(pathSegments: string[]): boolean {
  return pathSegments.length >= 1 && pathSegments[0] === 'tmp';
}

function getParentNode(pathSegments: string[]): FsNode | null {
  if (pathSegments.length === 0) return fsRoot;
  return getNode(pathSegments.slice(0, -1));
}

// --- Public API ---

export function getCwd(): string {
  return '~' + (cwd.length > 0 ? '/' + cwd.join('/') : '');
}

export function getCwdShort(): string {
  if (cwd.length === 0) return '~';
  return '~/' + cwd.join('/');
}

export function pwd(): string {
  return getCwd();
}

export function cd(path: string): string | null {
  if (!path || path === '~' || path === '/') {
    cwd = [];
    return null;
  }

  const target = resolvePath(path);
  const node = getNode(target);

  if (!node) return `cd: no such file or directory: ${path}`;
  if (node.type !== 'dir') return `cd: not a directory: ${path}`;

  cwd = target;
  return null;
}

export interface LsEntry {
  name: string;
  type: 'file' | 'dir';
  size: number;
  readonly: boolean;
}

export function ls(path?: string): LsEntry[] | string {
  const target = path ? resolvePath(path) : cwd;
  const node = getNode(target);

  if (!node && target.length === 0) {
    // root
    return lsNode(fsRoot);
  }
  if (!node) return `ls: cannot access '${path}': No such file or directory`;
  if (node.type === 'file') {
    return [{ name: node.name, type: 'file', size: (node.content || '').length, readonly: !!node.readonly }];
  }
  return lsNode(node);
}

function lsNode(node: FsNode): LsEntry[] {
  const entries: LsEntry[] = [];
  if (node.children) {
    for (const [, child] of node.children) {
      entries.push({
        name: child.name,
        type: child.type,
        size: child.type === 'file' ? (child.content || '').length : 0,
        readonly: !!child.readonly,
      });
    }
  }
  entries.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  return entries;
}

export function cat(path: string): string {
  const target = resolvePath(path);
  const node = getNode(target);
  if (!node) return `cat: ${path}: No such file or directory`;
  if (node.type === 'dir') return `cat: ${path}: Is a directory`;
  return node.content || '';
}

export function touch(path: string): string | null {
  const target = resolvePath(path);
  if (!isInsideTmp(target)) return `touch: permission denied: ${path} (only ~/tmp/ is writable)`;

  const parent = getParentNode(target);
  if (!parent || parent.type !== 'dir') return `touch: cannot create '${path}': No such directory`;

  const fileName = target[target.length - 1];
  if (parent.children!.has(fileName)) return null; // already exists

  const tmpDir = fsRoot.children!.get('tmp')!;
  if (countFiles(tmpDir) >= MAX_TMP_FILES) return `touch: tmp/ limit reached (max ${MAX_TMP_FILES} files)`;

  parent.children!.set(fileName, makeFile(fileName, '', false));
  saveTmpToStorage();
  return null;
}

export function mkdir(path: string): string | null {
  const target = resolvePath(path);
  if (!isInsideTmp(target)) return `mkdir: permission denied: ${path} (only ~/tmp/ is writable)`;

  const parent = getParentNode(target);
  if (!parent || parent.type !== 'dir') return `mkdir: cannot create '${path}': No such directory`;

  const dirName = target[target.length - 1];
  if (parent.children!.has(dirName)) return `mkdir: cannot create '${dirName}': File exists`;

  parent.children!.set(dirName, makeDir(dirName, false));
  saveTmpToStorage();
  return null;
}

export function rm(path: string): string | null {
  const target = resolvePath(path);
  if (!isInsideTmp(target)) return `rm: permission denied: ${path} (only ~/tmp/ is writable)`;

  const parent = getParentNode(target);
  if (!parent || parent.type !== 'dir') return `rm: cannot remove '${path}': No such file or directory`;

  const name = target[target.length - 1];
  if (!parent.children!.has(name)) return `rm: cannot remove '${path}': No such file or directory`;

  const node = parent.children!.get(name)!;
  if (node.type === 'dir' && node.children && node.children.size > 0) {
    return `rm: cannot remove '${name}': Directory not empty (use rm -r)`;
  }

  parent.children!.delete(name);
  saveTmpToStorage();
  return null;
}

export function rmRecursive(path: string): string | null {
  const target = resolvePath(path);
  if (!isInsideTmp(target)) return `rm: permission denied: ${path} (only ~/tmp/ is writable)`;
  if (target.length === 1 && target[0] === 'tmp') return `rm: cannot remove tmp/ itself`;

  const parent = getParentNode(target);
  if (!parent || parent.type !== 'dir') return `rm: cannot remove '${path}': No such file or directory`;

  const name = target[target.length - 1];
  if (!parent.children!.has(name)) return `rm: cannot remove '${path}': No such file or directory`;

  parent.children!.delete(name);
  saveTmpToStorage();
  return null;
}

export function writeFile(path: string, content: string): string | null {
  const target = resolvePath(path);
  if (!isInsideTmp(target)) return `write: permission denied: ${path} (only ~/tmp/ is writable)`;

  if (content.length > MAX_FILE_SIZE) {
    return `write: file too large (max ${MAX_FILE_SIZE / 1024}KB)`;
  }

  const parent = getParentNode(target);
  if (!parent || parent.type !== 'dir') return `write: no such directory`;

  const fileName = target[target.length - 1];
  const existing = parent.children!.get(fileName);

  if (!existing) {
    const tmpDir = fsRoot.children!.get('tmp')!;
    if (countFiles(tmpDir) >= MAX_TMP_FILES) {
      return `write: tmp/ limit reached (max ${MAX_TMP_FILES} files)`;
    }
  }

  parent.children!.set(fileName, makeFile(fileName, content, false));
  saveTmpToStorage();
  return null;
}

export function readFile(path: string): { content: string; readonly: boolean } | string {
  const target = resolvePath(path);
  const node = getNode(target);
  if (!node) return `File not found: ${path}`;
  if (node.type === 'dir') return `Is a directory: ${path}`;
  return { content: node.content || '', readonly: !!node.readonly };
}

export function resolveForNano(path: string): { absPath: string; segments: string[] } {
  const segments = resolvePath(path);
  return { absPath: '~/' + segments.join('/'), segments };
}

function countFiles(node: FsNode): number {
  let count = 0;
  if (node.children) {
    for (const [, child] of node.children) {
      if (child.type === 'file') count++;
      else count += countFiles(child);
    }
  }
  return count;
}
