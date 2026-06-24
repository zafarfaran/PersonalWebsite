import { useRef, useEffect, useState, useCallback } from 'react';

const COLS = 70;
const ROWS = 16;
const GROUND_Y = ROWS - 3;
const DINO_X = 8;
const TICK_MS = 55;
const HIGH_KEY = 'dino-highscore';
const GRAVITY = 0.35;
const JUMP_VEL = -2.8;

type ObsType = 'cactus_s' | 'cactus_t' | 'cactus_g' | 'bird_lo' | 'bird_hi';
type Obstacle = { x: number; type: ObsType; frame: number };

interface DinoGameProps {
  onExit: (score: number) => void;
}

const DINO_STAND_A = [
  '  ▄███▄ ',
  '  █▀ ▀█▓',
  '▄██████ ',
  ' ▀██▀▀  ',
  '  █▌ █▌ ',
  '  ▀  ▀  ',
];
const DINO_STAND_B = [
  '  ▄███▄ ',
  '  █▀ ▀█▓',
  '▄██████ ',
  ' ▀██▀▀  ',
  ' █▌  █▌ ',
  '  ▀ ▀   ',
];
const DINO_JUMP_SP = [
  '  ▄███▄ ',
  '  █▀ ▀█▓',
  '▄██████ ',
  ' ▀████▀ ',
  '  █▌ █▌ ',
];
const DINO_DUCK = [
  '         ',
  '  ▄███▄▄▓',
  ' ▄█▀▀███ ',
  '  ▀▀ ▀▀  ',
];

const CACTUS_S = [
  ' ▄ ',
  '▐█▌',
  '▐█▌',
  ' █ ',
  '▐█▌',
];
const CACTUS_T = [
  '  ▄  ',
  ' ▐█▌ ',
  '▐███▌',
  ' ▐█▌ ',
  '  █  ',
  ' ▐█▌ ',
];
const CACTUS_G = [
  ' ▄   ▄ ',
  '▐█▌ ▐█▌',
  '▐█▌ ▐█▌',
  ' █   █ ',
  '▐█▌ ▐█▌',
];

const BIRD_A = [
  ' ▄▄  ',
  '▀██▀▀',
  ' ▀▀  ',
];
const BIRD_B = [
  ' ▀▀  ',
  '▄██▄▄',
  ' ▄▄  ',
];

const SPRITES: Record<ObsType, string[]> = {
  cactus_s: CACTUS_S,
  cactus_t: CACTUS_T,
  cactus_g: CACTUS_G,
  bird_lo: BIRD_A,
  bird_hi: BIRD_A,
};

function drawSprite(grid: string[][], sprite: string[], ax: number, ay: number) {
  for (let r = 0; r < sprite.length; r++) {
    const y = ay - (sprite.length - 1 - r);
    if (y < 0 || y >= ROWS) continue;
    for (let c = 0; c < sprite[r].length; c++) {
      const ch = sprite[r][c];
      if (ch === ' ') continue;
      const x = ax + c;
      if (x >= 0 && x < COLS) grid[y][x] = ch;
    }
  }
}

function hitbox(sprite: string[], ax: number, ay: number, shrink = 1): { lx: number; rx: number; ty: number; by: number } {
  let lx = Infinity, rx = -Infinity, ty = Infinity, by = -Infinity;
  for (let r = 0; r < sprite.length; r++) {
    const y = ay - (sprite.length - 1 - r);
    for (let c = 0; c < sprite[r].length; c++) {
      if (sprite[r][c] !== ' ') {
        const x = ax + c;
        if (x < lx) lx = x;
        if (x > rx) rx = x;
        if (y < ty) ty = y;
        if (y > by) by = y;
      }
    }
  }
  return { lx: lx + shrink, rx: rx - shrink, ty: ty + shrink, by: by - shrink };
}

function boxOverlap(a: ReturnType<typeof hitbox>, b: ReturnType<typeof hitbox>): boolean {
  return a.lx <= b.rx && a.rx >= b.lx && a.ty <= b.by && a.by >= b.ty;
}

function obsAnchorY(type: ObsType): number {
  if (type === 'bird_hi') return GROUND_Y - 5;
  if (type === 'bird_lo') return GROUND_Y - 2;
  return GROUND_Y;
}

function buildFrame(
  dinoY: number,
  ducking: boolean,
  obstacles: Obstacle[],
  score: number,
  highScore: number,
  dead: boolean,
  runFrame: number,
  groundOff: number,
): string {
  const grid: string[][] = [];
  for (let y = 0; y < ROWS; y++) grid.push(new Array(COLS).fill(' '));

  // Clouds
  const co = Math.floor(groundOff / 3) % COLS;
  for (const cx of [10, 28, 48, 64]) {
    const x = (cx + co) % (COLS + 12) - 6;
    if (x > 0 && x < COLS - 7) {
      const cl = ['  ░░░  ', ' ░░░░░ '];
      drawSprite(grid, cl, x, 2);
    }
  }

  // Obstacles
  for (const obs of obstacles) {
    const isBird = obs.type === 'bird_lo' || obs.type === 'bird_hi';
    const sp = isBird ? (obs.frame % 8 < 4 ? BIRD_A : BIRD_B) : SPRITES[obs.type];
    drawSprite(grid, sp, obs.x, obsAnchorY(obs.type));
  }

  // Dino
  const dy = Math.round(dinoY);
  const onGround = dy >= GROUND_Y;
  let dinoSprite: string[];
  if (ducking && onGround) {
    dinoSprite = DINO_DUCK;
  } else if (!onGround) {
    dinoSprite = DINO_JUMP_SP;
  } else {
    dinoSprite = Math.floor(runFrame / 3) % 2 === 0 ? DINO_STAND_A : DINO_STAND_B;
  }
  const dinoAnchorY = ducking && onGround ? GROUND_Y : dy;
  drawSprite(grid, dinoSprite, DINO_X, dinoAnchorY);

  // Ground
  for (let x = 0; x < COLS; x++) {
    const p = (x + groundOff) % 6;
    grid[GROUND_Y + 1][x] = p === 0 ? '▄' : p === 3 ? '▀' : '─';
    grid[GROUND_Y + 2][x] = p === 1 || p === 4 ? '.' : ' ';
  }

  // HUD
  const sc = String(score).padStart(5, '0');
  const hi = String(highScore).padStart(5, '0');
  const hud = `  HI ${hi}  ${sc}`;
  const padded = hud.padEnd(COLS);
  const statusLine = dead ? `${padded.slice(0, COLS - 12)} GAME OVER ` : padded;

  const lines: string[] = [];
  lines.push(statusLine);
  lines.push('╔' + '═'.repeat(COLS) + '╗');
  for (let y = 0; y < ROWS; y++) {
    lines.push('║' + grid[y].join('') + '║');
  }
  lines.push('╚' + '═'.repeat(COLS) + '╝');

  return lines.join('\n');
}

export default function DinoGame({ onExit }: DinoGameProps) {
  const dinoYRef = useRef(GROUND_Y);
  const velRef = useRef(0);
  const onGroundRef = useRef(true);
  const duckingRef = useRef(false);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const scoreRef = useRef(0);
  const speedRef = useRef(1);
  const tickCountRef = useRef(0);
  const deadRef = useRef(false);
  const spawnTimerRef = useRef(0);
  const runFrameRef = useRef(0);

  const [frame, setFrame] = useState('');
  const [dead, setDead] = useState(false);
  const [generation, setGeneration] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem(HIGH_KEY) || '0', 10));

  const init = useCallback(() => {
    dinoYRef.current = GROUND_Y;
    velRef.current = 0;
    onGroundRef.current = true;
    duckingRef.current = false;
    obstaclesRef.current = [];
    scoreRef.current = 0;
    speedRef.current = 1;
    tickCountRef.current = 0;
    deadRef.current = false;
    spawnTimerRef.current = 50;
    runFrameRef.current = 0;
    setDead(false);
    setFrame(buildFrame(GROUND_Y, false, [], 0, highScore, false, 0, 0));
  }, [highScore]);

  useEffect(() => {
    init();

    function getDinoSprite(): string[] {
      const dy = Math.round(dinoYRef.current);
      const onGround = dy >= GROUND_Y;
      if (duckingRef.current && onGround) return DINO_DUCK;
      if (!onGround) return DINO_JUMP_SP;
      return Math.floor(runFrameRef.current / 3) % 2 === 0 ? DINO_STAND_A : DINO_STAND_B;
    }

    function tick() {
      if (deadRef.current) return;
      tickCountRef.current++;
      runFrameRef.current++;

      // Physics
      if (!onGroundRef.current) {
        const grav = duckingRef.current ? GRAVITY * 1.8 : GRAVITY;
        velRef.current += grav;
        dinoYRef.current += velRef.current;
        if (dinoYRef.current >= GROUND_Y) {
          dinoYRef.current = GROUND_Y;
          velRef.current = 0;
          onGroundRef.current = true;
        }
      }

      // Move obstacles
      const speed = speedRef.current;
      obstaclesRef.current = obstaclesRef.current
        .map(o => ({ ...o, x: o.x - speed, frame: o.frame + 1 }))
        .filter(o => o.x > -10);

      // Spawn
      spawnTimerRef.current--;
      if (spawnTimerRef.current <= 0) {
        const r = Math.random();
        const sc = scoreRef.current;
        let type: ObsType;
        if (sc > 80 && r > 0.75) type = r > 0.88 ? 'bird_hi' : 'bird_lo';
        else if (r > 0.7) type = 'cactus_g';
        else if (r > 0.4) type = 'cactus_t';
        else type = 'cactus_s';
        obstaclesRef.current.push({ x: COLS + 2, type, frame: 0 });
        spawnTimerRef.current = Math.max(20, 40 - Math.floor(sc / 25)) + Math.floor(Math.random() * 25);
      }

      // Score
      if (tickCountRef.current % 4 === 0) {
        scoreRef.current++;
        if (scoreRef.current % 80 === 0 && speedRef.current < 2.5) {
          speedRef.current += 0.15;
        }
      }

      // Collision
      const dinoSprite = getDinoSprite();
      const dinoAY = (duckingRef.current && onGroundRef.current) ? GROUND_Y : Math.round(dinoYRef.current);
      const dBox = hitbox(dinoSprite, DINO_X, dinoAY, 1);

      for (const obs of obstaclesRef.current) {
        const isBird = obs.type === 'bird_lo' || obs.type === 'bird_hi';
        const sp = isBird ? BIRD_A : SPRITES[obs.type];
        const oBox = hitbox(sp, obs.x, obsAnchorY(obs.type), 1);
        if (boxOverlap(dBox, oBox)) {
          deadRef.current = true;
          setDead(true);
          const sc = scoreRef.current;
          const prev = parseInt(localStorage.getItem(HIGH_KEY) || '0', 10);
          if (sc > prev) {
            localStorage.setItem(HIGH_KEY, String(sc));
            setHighScore(sc);
          }
          setFrame(buildFrame(dinoYRef.current, duckingRef.current, obstaclesRef.current, sc, Math.max(sc, prev), true, runFrameRef.current, tickCountRef.current));
          return;
        }
      }

      setFrame(buildFrame(
        dinoYRef.current, duckingRef.current, obstaclesRef.current,
        scoreRef.current, Math.max(scoreRef.current, parseInt(localStorage.getItem(HIGH_KEY) || '0', 10)),
        false, runFrameRef.current, tickCountRef.current,
      ));
    }

    const interval = setInterval(tick, TICK_MS);
    return () => clearInterval(interval);
  }, [generation, init]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'q') { onExit(scoreRef.current); return; }
      if (deadRef.current) {
        if (e.key === 'r' || e.key === 'R' || e.key === ' ') setGeneration(g => g + 1);
        return;
      }
      if ((e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w') && onGroundRef.current) {
        onGroundRef.current = false;
        velRef.current = JUMP_VEL;
        duckingRef.current = false;
        e.preventDefault();
      }
      if (e.key === 'ArrowDown' || e.key === 's') {
        duckingRef.current = true;
        e.preventDefault();
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 's') duckingRef.current = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [onExit]);

  return (
    <div className="terminal-body dino-game">
      <pre className="dino-title c-accent1">{
`    ┌─────────────────────────────────┐
    │    ▓▓▓  CHROME DINO  ▓▓▓       │
    └─────────────────────────────────┘`
      }</pre>
      <pre className="dino-board">{frame}</pre>
      <div className="dino-footer">
        {dead ? (
          <span className="c-accent5">GAME OVER — <span className="c-accent3">r</span> retry · <span className="c-accent3">q</span> quit</span>
        ) : (
          <>
            <span className="c-dimmed">
              <span className="c-accent3">↑</span>/<span className="c-accent3">space</span> jump
              {'  '}
              <span className="c-accent3">↓</span>/<span className="c-accent3">s</span> duck
              {'  '}
              <span className="c-accent3">q</span> quit
            </span>
          </>
        )}
      </div>
    </div>
  );
}
