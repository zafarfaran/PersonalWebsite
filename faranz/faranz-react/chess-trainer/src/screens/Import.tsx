import { useRef, useState } from 'react'
import { parsePgn, sideOf, toSaved, type PgnGame } from '../pgn'
import type { Side } from '../data'
import { go } from '../router'
import { getState, saveGame, updateSettings, useStore } from '../store'

/** Load games played elsewhere from a PGN file or pasted PGN text, to review them here. */
export function Import() {
  const players = useStore().settings.players
  const [text, setText] = useState('')
  // games in which it is not yet known which player you were
  const [waiting, setWaiting] = useState<PgnGame[]>([])
  const [message, setMessage] = useState<{ tone: 'good' | 'bad'; text: string } | null>(null)
  const [over, setOver] = useState(false)
  const picker = useRef<HTMLInputElement>(null)
  const batch = useRef<string[]>([]) // ids of the games loaded in one go

  const keep = (g: PgnGame, side: Side) => {
    const saved = toSaved(g, side)
    // a game that is already here keeps its analysis
    if (!getState().games.some(x => x.id === saved.id)) saveGame(saved)
    batch.current.push(saved.id)
  }

  /** Save every game whose side is known, and ask about the first one that is not. */
  const place = (games: PgnGame[], names: string[], skipped = 0) => {
    const unknown: PgnGame[] = []
    for (const g of games) {
      const side = sideOf(g, names)
      if (side) keep(g, side)
      else unknown.push(g)
    }
    setWaiting(unknown)
    if (unknown.length) return
    const ids = batch.current
    batch.current = []
    setText('')
    if (ids.length === 1 && !skipped) go('review', ids[0])
    else setMessage({ tone: 'good', text: `Loaded ${ids.length} games${skipped ? `, ${skipped} could not be read` : ''}. They are in the list below.` })
  }

  const read = (pgn: string) => {
    setMessage(null)
    batch.current = []
    try {
      const { games, skipped } = parsePgn(pgn)
      place(games, players, skipped)
    } catch (err) {
      setWaiting([])
      setMessage({ tone: 'bad', text: err instanceof Error ? err.message : 'That is not a game in PGN format.' })
    }
  }

  const readFiles = async (files: FileList | null) => {
    if (!files?.length) return
    read((await Promise.all([...files].map(f => f.text()))).join('\n\n'))
  }

  const iAm = (side: Side) => {
    const [g, ...rest] = waiting
    const name = side === 'w' ? g.white : g.black
    const names = name && !players.some(p => p.toLowerCase() === name.toLowerCase()) ? [...players, name] : players
    if (names !== players) updateSettings({ players: names })
    keep(g, side)
    place(rest, names)
  }

  const asked = waiting[0]
  return (
    <div
      className={'card import' + (over ? ' over' : '')}
      onDragOver={e => { e.preventDefault(); setOver(true) }}
      onDragLeave={() => setOver(false)}
      onDrop={e => { e.preventDefault(); setOver(false); readFiles(e.dataTransfer.files) }}
    >
      <div className="eyebrow">Load a game you played elsewhere</div>
      <p>
        Choose a PGN file from Chess.com or Lichess, drop it on this box, or paste the PGN text. The computer then goes through the game and
        marks every move of yours that gave something away, with the move you should have played.
      </p>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder={'[White "you"]\n[Black "them"]\n\n1. e4 e5 2. Nf3 Nc6 …'}
        spellCheck={false}
        aria-label="PGN text"
      />
      <div className="actions">
        <button className="btn primary" onClick={() => picker.current?.click()}>Choose a PGN file</button>
        <button className="btn" onClick={() => read(text)} disabled={!text.trim()}>Load the pasted game</button>
        <input ref={picker} type="file" accept=".pgn,.txt,text/plain" multiple hidden onChange={e => { readFiles(e.target.files); e.target.value = '' }} />
      </div>
      {asked && (
        <div className="ask">
          <strong>Which player were you?</strong>
          <p className="note">
            {asked.white || 'White'} against {asked.black || 'Black'}, {Math.ceil(asked.moves.length / 2)} moves. Your name is remembered, so later games are
            recognised without asking.
          </p>
          <div className="actions">
            <button className="btn" onClick={() => iAm('w')}>{asked.white || 'White'} (White)</button>
            <button className="btn" onClick={() => iAm('b')}>{asked.black || 'Black'} (Black)</button>
          </div>
        </div>
      )}
      {message && <p className={message.tone}>{message.text}</p>}
      {players.length > 0 && (
        <p className="note">
          Games by {players.join(', ')} are taken as yours.{' '}
          <button className="link" onClick={() => updateSettings({ players: [] })}>Forget {players.length === 1 ? 'this name' : 'these names'}</button>
        </p>
      )}
    </div>
  )
}
