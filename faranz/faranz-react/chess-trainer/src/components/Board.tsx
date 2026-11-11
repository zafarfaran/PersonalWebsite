import { useMemo, useRef, useState, type PointerEvent } from 'react'
import { placementOf, turnOf, type Square } from '../chess'
import { useStore } from '../store'

export interface Highlight {
  sq: Square
  kind: 'last' | 'hint' | 'good' | 'bad'
}
export interface Arrow {
  from: Square
  to: Square
  color?: 'accent' | 'good' | 'bad'
}

interface Props {
  fen: string
  /** Legal destinations per square. Pieces can only be moved when this is given. */
  dests?: Map<Square, Square[]>
  /** Free placement: any piece may move to any empty square (setup builder). */
  free?: boolean
  onMove?: (from: Square, to: Square) => void
  highlights?: Highlight[]
  arrows?: Arrow[]
  coords?: boolean
}

interface Piece {
  id: number
  code: string
  sq: Square
}

const FILES = 'abcdefgh'
const xy = (sq: Square) => [FILES.indexOf(sq[0]), 8 - +sq[1]] as const
const SQUARES = Array.from({ length: 64 }, (_, i) => FILES[i % 8] + (8 - Math.floor(i / 8)))

/**
 * Carry piece identities from one position to the next so that a moved piece
 * keeps its element and slides to its new square instead of being redrawn.
 */
function reconcile(prev: Piece[], fen: string, nextId: { current: number }): Piece[] {
  const want = Object.entries(placementOf(fen))
  const pool = [...prev]
  const out: Piece[] = []
  const rest: [Square, string][] = []
  for (const [sq, code] of want) {
    const i = pool.findIndex(p => p.sq === sq && p.code === code)
    if (i >= 0) out.push(pool.splice(i, 1)[0])
    else rest.push([sq, code])
  }
  for (const [sq, code] of rest) {
    const [x, y] = xy(sq)
    let best = -1
    let bestDist = Infinity
    pool.forEach((p, i) => {
      if (p.code !== code) return
      const [px, py] = xy(p.sq)
      const d = Math.abs(px - x) + Math.abs(py - y)
      if (d < bestDist) [best, bestDist] = [i, d]
    })
    out.push(best >= 0 ? { ...pool.splice(best, 1)[0], sq } : { id: nextId.current++, code, sq })
  }
  return out
}

export function Board({ fen, dests, free, onMove, highlights = [], arrows = [], coords }: Props) {
  const { pieces: pieceSet } = useStore().settings
  const el = useRef<HTMLDivElement>(null)
  const nextId = useRef(1)
  const prev = useRef<Piece[]>([])
  const pieces = useMemo(() => (prev.current = reconcile(prev.current, fen, nextId)), [fen])

  const [selected, setSelected] = useState<Square | null>(null)
  const [drag, setDrag] = useState<{ sq: Square; dx: number; dy: number; x0: number; y0: number } | null>(null)

  const at = (sq: Square) => pieces.find(p => p.sq === sq)
  const interactive = !!onMove && (free || !!dests)
  const movable = (sq: Square) => {
    const p = at(sq)
    if (!p || !interactive) return false
    return free ? true : p.code[0] === turnOf(fen) && !!dests?.get(sq)?.length
  }
  const canMove = (from: Square, to: Square) => (free ? !at(to) : !!dests?.get(from)?.includes(to))
  const targets = selected && !free ? dests?.get(selected) ?? [] : []

  const squareAt = (e: PointerEvent): Square | null => {
    const r = el.current!.getBoundingClientRect()
    const f = Math.floor(((e.clientX - r.left) / r.width) * 8)
    const rank = Math.floor(((e.clientY - r.top) / r.height) * 8)
    return f < 0 || f > 7 || rank < 0 || rank > 7 ? null : FILES[f] + (8 - rank)
  }

  const down = (e: PointerEvent) => {
    if (!interactive) return
    const sq = squareAt(e)
    if (!sq) return
    if (selected && selected !== sq && canMove(selected, sq)) {
      setSelected(null)
      onMove!(selected, sq)
    } else if (movable(sq)) {
      setSelected(sq)
      setDrag({ sq, dx: 0, dy: 0, x0: e.clientX, y0: e.clientY })
      try {
        el.current!.setPointerCapture(e.pointerId)
      } catch {
        // capture is a nicety (keeps the drag alive outside the board); moves work without it
      }
    } else setSelected(null)
  }
  const move = (e: PointerEvent) => {
    if (drag) setDrag({ ...drag, dx: e.clientX - drag.x0, dy: e.clientY - drag.y0 })
  }
  const up = (e: PointerEvent) => {
    if (!drag) return
    const sq = squareAt(e)
    setDrag(null)
    if (sq && sq !== drag.sq && canMove(drag.sq, sq)) {
      setSelected(null)
      onMove!(drag.sq, sq)
    }
  }

  const hl = new Map(highlights.map(h => [h.sq, h.kind]))

  return (
    <div
      ref={el}
      className={'board' + (interactive ? ' live' : '')}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={() => setDrag(null)}
    >
      <div className="squares">
        {SQUARES.map((sq, i) => {
          const dark = (i + Math.floor(i / 8)) % 2 === 1
          const cls = ['sq', dark ? 'dark' : '', hl.get(sq) ?? '', selected === sq ? 'sel' : ''].filter(Boolean).join(' ')
          return (
            <div key={sq} className={cls}>
              {coords && sq[1] === '1' && <span className="co file">{sq[0]}</span>}
              {coords && sq[0] === 'a' && <span className="co rank">{sq[1]}</span>}
              {targets.includes(sq) && <span className={at(sq) ? 'ring' : 'dot'} />}
            </div>
          )
        })}
      </div>
      {pieces.map(p => {
        const [x, y] = xy(p.sq)
        const dragging = drag?.sq === p.sq
        return (
          <div
            key={p.id}
            className={'piece' + (dragging ? ' dragging' : '')}
            style={{
              transform: dragging
                ? `translate(calc(${x * 100}% + ${drag!.dx}px), calc(${y * 100}% + ${drag!.dy}px))`
                : `translate(${x * 100}%, ${y * 100}%)`,
              backgroundImage: `url(${import.meta.env.BASE_URL}pieces/${pieceSet}/${p.code}.svg)`,
            }}
          />
        )
      })}
      {arrows.length > 0 && (
        <svg viewBox="0 0 8 8" className="arrows">
          {arrows.map((a, i) => {
            const [fx, fy] = xy(a.from)
            const [tx, ty] = xy(a.to)
            const [x1, y1, x2, y2] = [fx + 0.5, fy + 0.5, tx + 0.5, ty + 0.5]
            const len = Math.hypot(x2 - x1, y2 - y1) || 1
            const [ux, uy] = [(x2 - x1) / len, (y2 - y1) / len]
            const [bx, by] = [x2 - ux * 0.4, y2 - uy * 0.4] // base of the arrow head
            return (
              <g key={i} className={'arrow ' + (a.color ?? 'accent')}>
                <line x1={x1 + ux * 0.3} y1={y1 + uy * 0.3} x2={bx} y2={by} />
                <polygon points={`${x2 - ux * 0.1},${y2 - uy * 0.1} ${bx - uy * 0.24},${by + ux * 0.24} ${bx + uy * 0.24},${by - ux * 0.24}`} />
              </g>
            )
          })}
        </svg>
      )}
    </div>
  )
}
