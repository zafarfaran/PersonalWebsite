// Runs Python in the browser with Pyodide, in a worker so that a loop that never
// ends can be stopped. Nothing is downloaded until the first exercise is run.

const PYODIDE = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/'
const TIMEOUT_MS = 15000

export interface RunResult {
  ok: boolean
  /** Everything the code printed. */
  out: string
  /** The last line of the error, e.g. "AssertionError: softmax should sum to 1". */
  error?: string
}

const WORKER = `
importScripts('${PYODIDE}pyodide.js')
let ready = null
let hasNumpy = false
self.onmessage = async e => {
  const { id, code, numpy } = e.data
  let out = ''
  try {
    ready = ready || loadPyodide({ indexURL: '${PYODIDE}' })
    const py = await ready
    if (numpy && !hasNumpy) { await py.loadPackage('numpy'); hasNumpy = true }
    py.setStdout({ batched: s => { out += s + '\\n' } })
    py.setStderr({ batched: () => {} })
    // a fresh namespace for every run, so that one attempt cannot lean on the last
    const scope = py.globals.get('dict')()
    try { await py.runPythonAsync(code, { globals: scope }) } finally { scope.destroy() }
    self.postMessage({ id, ok: true, out })
  } catch (err) {
    const lines = String(err && err.message ? err.message : err).trim().split('\\n')
    self.postMessage({ id, ok: false, out, error: lines[lines.length - 1] })
  }
}
`

let worker: Worker | null = null
/** Whether the interpreter in the current worker has finished loading. The first run gets more time. */
let loaded = false
const FIRST_TIMEOUT_MS = 90000
let next = 1
const waiting = new Map<number, (r: RunResult) => void>()

function start(): Worker {
  const w = new Worker(URL.createObjectURL(new Blob([WORKER], { type: 'text/javascript' })))
  w.onmessage = e => {
    const { id, ...result } = e.data as RunResult & { id: number }
    waiting.get(id)?.(result)
    waiting.delete(id)
  }
  w.onerror = () => {
    for (const done of waiting.values()) done({ ok: false, out: '', error: 'Python could not be loaded. Check your connection and try again.' })
    waiting.clear()
    worker = null
  }
  return w
}

/** Run Python and collect what it prints. The first call downloads the interpreter (about 10 MB). */
export function runPython(code: string, numpy = false): Promise<RunResult> {
  worker ??= start()
  const id = next++
  return new Promise(resolve => {
    const timer = setTimeout(() => {
      // still running: most likely an endless loop. Stop the interpreter; the next run starts a new one.
      worker?.terminate()
      worker = null
      waiting.delete(id)
      resolve({ ok: false, out: '', error: loaded ? 'Stopped after 15 seconds. Is there a loop that never ends?' : 'Python took too long to download. Check your connection and try again.' })
      loaded = false
    }, loaded ? TIMEOUT_MS : FIRST_TIMEOUT_MS)
    waiting.set(id, result => {
      loaded = true
      clearTimeout(timer)
      resolve(result)
    })
    worker!.postMessage({ id, code, numpy })
  })
}
