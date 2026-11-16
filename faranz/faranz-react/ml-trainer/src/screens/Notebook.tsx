import { useState } from 'react'
import { Pad } from '../components/Pad'
import { Shell } from '../components/ui'
import { LESSONS } from '../lib'
import { href } from '../router'
import { addPage, deletePage, renamePage, saveNote, savePad, useStore } from '../store'

const NOTES = 'Your notes. Write the idea in your own words, the mistake you made, the thing to look up. They are saved as you type.'

/** Notes and a page to draw on, kept under one name. Used under every lesson and in the notebook. */
export function NotePad({ page, height, open = true, placeholder = NOTES }: { page: string; height?: number; open?: boolean; placeholder?: string }) {
  const s = useStore()
  const [drawing, setDrawing] = useState(open || !!s.pads[page])
  return (
    <div className="notepad">
      <textarea
        className="notes"
        rows={5}
        value={s.notes[page] ?? ''}
        placeholder={placeholder}
        aria-label="Notes"
        onChange={e => saveNote(page, e.target.value)}
      />
      {drawing ? (
        <Pad shapes={s.pads[page] ?? []} onChange={shapes => savePad(page, shapes)} height={height} />
      ) : (
        <div className="actions"><button className="btn" onClick={() => setDrawing(true)}>Add a drawing or a diagram</button></div>
      )}
    </div>
  )
}

/** Everything you have written and drawn: your own pages, and the notes you made on lessons. */
export function Notebook({ page }: { page?: string }) {
  const s = useStore()
  const own = s.pages.find(p => p.id === page)
  const noted = LESSONS.filter(({ lesson }) => s.notes[`lesson:${lesson.id}`] || s.pads[`lesson:${lesson.id}`])

  if (own) {
    return (
      <Shell back={href('notebook')} backLabel="Notebook" title={own.title || 'Untitled page'}>
        <div className="card">
          <div className="answer pagename">
            <input value={own.title} placeholder="Name of this page" aria-label="Name of this page" onChange={e => renamePage(own.id, e.target.value)} />
            <button className="btn" onClick={() => { if (window.confirm('Delete this page with its notes and drawing?')) { deletePage(own.id); window.location.hash = '/notebook' } }}>Delete page</button>
          </div>
          <NotePad page={own.id} height={560} />
        </div>
      </Shell>
    )
  }

  return (
    <Shell back={href()} backLabel="Home" title="Notebook">
      <p className="muted">
        Your own pages for notes, sketches and diagrams, and everything you have written under the lessons. Drawing a system or working a sum by hand is part of learning it.
        Everything is saved in this browser.
      </p>
      <div className="actions">
        <button className="btn primary" onClick={() => { window.location.hash = '/notebook/' + addPage('') }}>New page</button>
      </div>

      <h2 className="sidehead">Your pages</h2>
      <div className="card">
        {s.pages.length === 0 && <p className="note">No pages yet. Start one for a system you are designing, a derivation, or a list of things to revisit.</p>}
        {s.pages.map(p => (
          <a className="topic" key={p.id} href={href('notebook', p.id)}>
            <b>{p.title || 'Untitled page'}</b>
            <small>{preview(s.notes[p.id], s.pads[p.id]?.length)}</small>
          </a>
        ))}
      </div>

      <h2 className="sidehead">Notes on lessons</h2>
      <div className="card">
        {noted.length === 0 && <p className="note">Nothing yet. Every lesson has a notebook at the bottom of its page.</p>}
        {noted.map(({ module, lesson }) => (
          <a className="topic" key={lesson.id} href={href('l', lesson.id)}>
            <span className="pill">{module.title}</span>
            <b>{lesson.title}</b>
            <small>{preview(s.notes[`lesson:${lesson.id}`], s.pads[`lesson:${lesson.id}`]?.length)}</small>
          </a>
        ))}
      </div>
    </Shell>
  )
}

/** The start of a note, and whether there is a drawing with it. */
export function preview(note = '', shapes = 0): string {
  const text = note.trim().replace(/\s+/g, ' ')
  const start = text.length > 140 ? text.slice(0, 140) + '…' : text
  const drawing = shapes ? `${start ? ' · ' : ''}drawing with ${shapes} ${shapes === 1 ? 'item' : 'items'}` : ''
  return start + drawing || 'Empty'
}
