import { href, useRoute } from './router'
import { Home, NotFound } from './screens/Home'
import { Learn } from './screens/Learn'
import { Memorise } from './screens/Memorise'
import { Practise } from './screens/Practise'
import { Progress } from './screens/Progress'
import { Sprint } from './screens/Sprint'
import { trickById } from './tricks'

function Screen({ route }: { route: string[] }) {
  const [page, a, b] = route
  switch (page) {
    case undefined:
      return <Home />
    case 'progress':
      return <Progress />
    case 'sprint':
      return <Sprint />
    case 'memorise':
      return <Memorise />
    case 'learn': {
      const trick = trickById(a ?? '')
      return trick ? <Learn key={trick.id} trick={trick} /> : <NotFound />
    }
    case 'practise':
      return <Practise key={route.join('/')} kind={a ?? 'mix'} id={b} />
    default:
      return <NotFound />
  }
}

export function App() {
  const route = useRoute()
  return (
    <>
      <header className="topbar">
        <a className="brand" href={href()}>
          <span className="good">~/math</span> <span className="accent">$</span> mental-trainer
        </a>
        <nav>
          <a href={href()} className={route.length === 0 ? 'on' : ''}>Home</a>
          <a href={href('progress')} className={route[0] === 'progress' ? 'on' : ''}>Progress</a>
          <a href="/chess/">Chess trainer</a>
          <a href="/">faranz.com</a>
        </nav>
      </header>
      <Screen route={route} />
      <footer className="credits">
        Built by <a href="/">Faran Zafar</a>. Questions are generated fresh each time, so you never see the same set twice.
      </footer>
    </>
  )
}
