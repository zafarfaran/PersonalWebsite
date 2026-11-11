// Thin wrapper around Stockfish running in a web worker. The single-threaded
// "lite" build is used because it needs no special server headers.
const FILE = 'engine/stockfish-17.1-lite-single-03e3232.js'

/**
 * Opponent strength, weakest first. The engine always searches properly; the
 * opponent is weakened by how it chooses among the best few moves:
 * `spread` is how many candidate moves it considers, `temp` how readily it
 * picks a worse one (in centipawns), and `blunder` the chance of a random move.
 */
export const LEVELS = [
  { name: 'Beginner', spread: 6, temp: 250, blunder: 0.22 },
  { name: 'Novice', spread: 6, temp: 180, blunder: 0.12 },
  { name: 'Casual', spread: 5, temp: 120, blunder: 0.06 },
  { name: 'Improver', spread: 4, temp: 80, blunder: 0.02 },
  { name: 'Club player', spread: 4, temp: 50, blunder: 0 },
  { name: 'Strong club', spread: 3, temp: 30, blunder: 0 },
  { name: 'Expert', spread: 2, temp: 15, blunder: 0 },
  { name: 'Full strength', spread: 1, temp: 0, blunder: 0 },
]

export interface Line {
  /** First move of the line. */
  from: string
  to: string
  promotion?: string
  /** Score in centipawns for the side to move. Forced mates are about ±10000. */
  cp: number
}

/** Reads one "info ... multipv N score cp X ... pv e2e4 ..." line of engine output. */
export function parseInfo(text: string): { index: number; line: Line } | null {
  if (!text.startsWith('info') || / (upper|lower)bound /.test(text)) return null
  const pv = text.match(/ pv ([a-h][1-8])([a-h][1-8])([qrbn])?/)
  const score = text.match(/ score (cp|mate) (-?\d+)/)
  if (!pv || !score) return null
  const n = +score[2]
  const cp = score[1] === 'cp' ? n : Math.sign(n) * (10000 - Math.abs(n) * 10)
  return { index: +(text.match(/ multipv (\d+)/)?.[1] ?? 1), line: { from: pv[1], to: pv[2], promotion: pv[3], cp } }
}

/** Pick a move the way an opponent of the given level would. `lines` are best first. */
export function chooseMove(lines: Line[], level: number, random = Math.random): Line {
  const cfg = LEVELS[level - 1] ?? LEVELS[0]
  const pool = lines.slice(0, cfg.spread)
  // never pass up a forced mate, and never choose to walk into one when there is a way out
  const sane = pool.filter(l => l.cp > -9000)
  const options = pool[0].cp > 9000 || sane.length === 0 || cfg.temp === 0 ? [pool[0]] : sane
  const weights = options.map(l => Math.exp(-(options[0].cp - l.cp) / Math.max(1, cfg.temp)))
  let r = random() * weights.reduce((a, b) => a + b, 0)
  for (let i = 0; i < options.length; i++) {
    r -= weights[i]
    if (r <= 0) return options[i]
  }
  return options[0]
}

export class Engine {
  private worker: Worker
  private handlers = new Set<(line: string) => void>()
  private queue: Promise<unknown> = Promise.resolve()
  readonly ready: Promise<void>

  constructor() {
    this.worker = new Worker(import.meta.env.BASE_URL + FILE)
    this.worker.onmessage = e => {
      const line = String(e.data)
      this.handlers.forEach(h => h(line))
    }
    this.ready = new Promise<void>((resolve, reject) => {
      this.worker.onerror = () => reject(new Error('The chess engine could not be loaded.'))
      setTimeout(() => reject(new Error('The chess engine took too long to start.')), 30000)
      this.wait('uci', l => l === 'uciok')
        .then(() => this.wait('isready', l => l === 'readyok'))
        .then(() => resolve())
    })
  }

  /** Send a command and resolve with the first output line that matches. */
  private wait(command: string, match: (line: string) => boolean): Promise<string> {
    return new Promise(resolve => {
      const handler = (line: string) => {
        if (!match(line)) return
        this.handlers.delete(handler)
        resolve(line)
      }
      this.handlers.add(handler)
      this.worker.postMessage(command)
    })
  }

  /**
   * The best `count` moves in a position, best first, searched for `ms` milliseconds.
   * Searches run one at a time, so a result can never be matched to the wrong position.
   */
  analyse(fen: string, count: number, ms: number): Promise<Line[]> {
    const run = async () => {
      await this.ready
      const found = new Map<number, Line>()
      const collect = (text: string) => {
        const info = parseInfo(text)
        if (info) found.set(info.index, info.line)
      }
      this.handlers.add(collect)
      this.worker.postMessage(`setoption name MultiPV value ${count}`)
      this.worker.postMessage(`position fen ${fen}`)
      await this.wait(`go movetime ${ms}`, l => l.startsWith('bestmove'))
      this.handlers.delete(collect)
      return [...found.entries()].sort((a, b) => a[0] - b[0]).map(([, line]) => line)
    }
    const result = this.queue.then(run, run)
    this.queue = result.catch(() => {})
    return result
  }

  quit() {
    this.worker.terminate()
  }
}
