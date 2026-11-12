import { useEffect } from 'react'
import { lessonById, openingById } from './data'
import { href, useRoute } from './router'
import { Home, NotFound } from './screens/Home'
import { Learn } from './screens/Learn'
import { Match } from './screens/Match'
import { Memorise } from './screens/Memorise'
import { OpeningMap } from './screens/OpeningMap'
import { Calc } from './screens/Calc'
import { Fix } from './screens/Fix'
import { Game } from './screens/Game'
import { Games, Review } from './screens/Games'
import { Guide } from './screens/Guide'
import { Practise } from './screens/Practise'
import { Progress } from './screens/Progress'
import { Vision } from './screens/Vision'
import { BOARDS, PIECE_SETS, getState, updateSettings, useStore, type State } from './store'

function Screen({ route }: { route: string[] }) {
  const [page, a, b] = route
  switch (page) {
    case undefined:
      return <Home />
    case 'progress':
      return <Progress />
    case 'board':
      return <Vision />
    case 'guide':
      return <Guide />
    case 'calc':
      return <Calc />
    case 'games':
      return <Games />
    case 'fix':
      return <Fix key={a ?? 'all'} game={a} />
    case 'review':
      return <ReviewRoute id={a} />
    case 'replay': {
      // a position from one of your own games: everything before move `b`
      const saved = getState().games.find(g => g.id === a)
      const o = saved && openingById(saved.opening)
      const ply = Number(b)
      return saved && o && ply >= 0 && ply < saved.moves.length ? (
        <Game key={route.join('/')} opening={o} start={saved.moves.slice(0, ply)} />
      ) : (
        <NotFound what="saved game" />
      )
    }
    case 'game': {
      const o = openingById(a ?? '')
      return o ? <Game key={o.id} opening={o} /> : <NotFound what="opening" />
    }
    case 'o': {
      const o = openingById(a ?? '')
      return o ? <OpeningMap o={o} /> : <NotFound what="opening" />
    }
    case 'match': {
      const o = openingById(a ?? '')
      return o ? <Match key={o.id} o={o} /> : <NotFound what="opening" />
    }
    case 'memorise': {
      const o = openingById(a ?? '')
      return o ? <Memorise key={o.id} o={o} /> : <NotFound what="opening" />
    }
    case 'learn': {
      const found = lessonById(a ?? '')
      return found ? <Learn {...found} /> : <NotFound what="lesson" />
    }
    case 'play': {
      const found = lessonById(a ?? '')
      return found?.lesson.plan ? <Game key={a} {...found} /> : <NotFound what="line to play on from" />
    }
    case 'practise':
      return <Practise key={route.join('/')} kind={a ?? 'due'} id={b} />
    default:
      return <NotFound what="page" />
  }
}

function ReviewRoute({ id }: { id?: string }) {
  const game = useStore().games.find(g => g.id === id)
  return game ? <Review key={game.id} game={game} /> : <NotFound what="saved game" />
}

export function App() {
  const route = useRoute()
  const { settings } = useStore()

  useEffect(() => {
    document.documentElement.dataset.board = settings.board
  }, [settings.board])

  return (
    <>
      <header className="topbar">
        <a className="brand" href={href()}>
          <span className="good">~/chess</span> <span className="accent">$</span> opening-trainer
        </a>
        <nav>
          <a href={href()} className={route.length === 0 ? 'on' : ''}>Home</a>
          <a href={href('guide')} className={route[0] === 'guide' ? 'on' : ''}>Guide</a>
          <a href={href('board')} className={route[0] === 'board' ? 'on' : ''}>Board trainer</a>
          <a href={href('calc')} className={route[0] === 'calc' ? 'on' : ''}>Calculation</a>
          <a href={href('games')} className={['games', 'review', 'fix', 'replay'].includes(route[0]) ? 'on' : ''}>My games</a>
          <a href={href('progress')} className={route[0] === 'progress' ? 'on' : ''}>Progress</a>
          <a href="https://faranz.com/">faranz.com ↗</a>
        </nav>
        <span className="spacer" />
        <label className="pick">
          Pieces
          <select value={settings.pieces} onChange={e => updateSettings({ pieces: e.target.value as State['settings']['pieces'] })}>
            {Object.entries(PIECE_SETS).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
          </select>
        </label>
        <label className="pick">
          Board
          <select value={settings.board} onChange={e => updateSettings({ board: e.target.value as State['settings']['board'] })}>
            {Object.entries(BOARDS).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
          </select>
        </label>
      </header>

      <Screen route={route} />

      <footer className="credits">
        Built by <a href="https://faranz.com/">Faran Zafar</a>. Rules by <a href="https://github.com/jhlywa/chess.js">chess.js</a>.
        Computer opponent: <a href="https://github.com/nmrugg/stockfish.js">Stockfish</a> (GPLv3).
        Pieces from <a href="https://github.com/lichess-org/lila/blob/master/COPYING.md">Lichess</a>: Staunty and Maestro by sadsnake1
        (CC BY-NC-SA 4.0), Classic by Colin M.L. Burnett and Merida by Armando Hernandez Marroquin (GPLv2+).
      </footer>
    </>
  )
}
