import { lessonById, moduleById } from './lib'
import { href, useRoute } from './router'
import { LessonPage, ModulePage } from './screens/Course'
import { Drill, Progress } from './screens/Drill'
import { Home, NotFound } from './screens/Home'
import { Notebook } from './screens/Notebook'

function Screen({ route }: { route: string[] }) {
  const [page, a] = route
  switch (page) {
    case undefined:
      return <Home />
    case 'm': {
      const m = moduleById(a ?? '')
      return m ? <ModulePage key={m.id} m={m} /> : <NotFound what="module" />
    }
    case 'l': {
      const found = lessonById(a ?? '')
      return found ? <LessonPage key={found.lesson.id} m={found.module} lesson={found.lesson} /> : <NotFound what="lesson" />
    }
    case 'drill':
      return a && (['due', 'mixed', 'weak'].includes(a) || moduleById(a)) ? <Drill key={a} kind={a} /> : <NotFound what="drill" />
    case 'notebook':
      return <Notebook key={a ?? 'all'} page={a} />
    case 'progress':
      return <Progress />
    default:
      return <NotFound what="page" />
  }
}

export function App() {
  const route = useRoute()
  return (
    <>
      <header className="topbar">
        <a className="brand" href={href()}>
          <span className="good">~/trading</span> <span className="accent">$</span> trainer
        </a>
        <nav>
          <a href={href()} className={route.length === 0 || ['m', 'l'].includes(route[0]) ? 'on' : ''}>Course</a>
          <a href={href('drill', 'due')} className={route[0] === 'drill' && route[1] === 'due' ? 'on' : ''}>Review</a>
          <a href={href('drill', 'mixed')} className={route[0] === 'drill' && route[1] !== 'due' ? 'on' : ''}>Mixed drill</a>
          <a href={href('notebook')} className={route[0] === 'notebook' ? 'on' : ''}>Notebook</a>
          <a href={href('progress')} className={route[0] === 'progress' ? 'on' : ''}>Progress</a>
          <a href="https://faranz.com/">faranz.com ↗</a>
        </nav>
      </header>

      <Screen route={route} />

      <footer className="credits">
        Built by <a href="https://faranz.com/">Faran Zafar</a>. Exercises run on <a href="https://pyodide.org/">Pyodide</a>, Python compiled for the browser.
        <br />
        For education only, not financial advice. Most people who day trade lose money, and options can lose all of what you put in, or more when you sell them. All prices in the figures are made up.
      </footer>
    </>
  )
}
