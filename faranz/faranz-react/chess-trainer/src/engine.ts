// Thin wrapper around Stockfish running in a web worker. The single-threaded
// "lite" build is used because it needs no special server headers.
const FILE = 'engine/stockfish-17.1-lite-single-03e3232.js'

/** Strength settings, weakest first. `blunder` is the chance of a random move instead of the engine's choice. */
export const LEVELS = [
  { name: 'Beginner', skill: 0, depth: 1, blunder: 0.45 },
  { name: 'Novice', skill: 0, depth: 2, blunder: 0.25 },
  { name: 'Casual', skill: 1, depth: 3, blunder: 0.12 },
  { name: 'Improver', skill: 3, depth: 5, blunder: 0.04 },
  { name: 'Club player', skill: 6, depth: 7, blunder: 0 },
  { name: 'Strong club', skill: 10, depth: 9, blunder: 0 },
  { name: 'Expert', skill: 15, depth: 11, blunder: 0 },
  { name: 'Full strength', skill: 20, depth: 14, blunder: 0 },
]

export class Engine {
  private worker: Worker
  private handlers = new Set<(line: string) => void>()
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
      this.ask('uci', l => l === 'uciok')
        .then(() => this.ask('isready', l => l === 'readyok'))
        .then(() => resolve())
    })
  }

  /** Send a command and resolve with the first output line that matches. */
  private ask(command: string, match: (line: string) => boolean): Promise<string> {
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

  private queue: Promise<unknown> = Promise.resolve()

  /** Searches run one at a time, so a reply can never be matched to the wrong position. */
  bestMove(fen: string, level: number): Promise<{ from: string; to: string; promotion?: string }> {
    const run = async () => {
      await this.ready
      const cfg = LEVELS[level - 1] ?? LEVELS[0]
      this.worker.postMessage(`setoption name Skill Level value ${cfg.skill}`)
      this.worker.postMessage(`position fen ${fen}`)
      const line = await this.ask(`go depth ${cfg.depth}`, l => l.startsWith('bestmove'))
      const uci = line.split(' ')[1]
      return { from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] }
    }
    const result = this.queue.then(run, run)
    this.queue = result.catch(() => {})
    return result
  }

  quit() {
    this.worker.terminate()
  }
}
