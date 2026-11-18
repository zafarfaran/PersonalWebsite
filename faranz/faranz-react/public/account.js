// Sign-in and saved progress for the trainers. Each trainer keeps its progress in one localStorage entry;
// this copies that entry to the account's row on the server and back, so progress survives a cleared browser
// and follows you between devices. Signed out, nothing leaves the browser and the trainers work as before.
//
// Included as <script src="/account.js" data-app="trading" data-key="trading-trainer:v1" defer>.
// The server is api/index.ts.
;(() => {
  const API = 'https://api-production-2e686d96.up.railway.app'
  const script = document.currentScript
  const app = script.dataset.app
  const key = script.dataset.key
  const ACCOUNT = 'faranz-account:v1'
  const META = `faranz-sync:${app}`

  const read = (k, fallback = null) => {
    try {
      return JSON.parse(localStorage.getItem(k) ?? 'null') ?? fallback
    } catch {
      return fallback
    }
  }
  const write = (k, v) => {
    try {
      v === null ? localStorage.removeItem(k) : localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v))
    } catch {
      // storage full or blocked: nothing to sync from
    }
  }
  const local = () => {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  }

  let account = read(ACCOUNT) // { token, user }
  let meta = read(META, { version: 0, synced: null }) // what the server had when we last agreed with it
  let status = ''
  let busy = false

  // ---- merging two copies of the progress, when two devices both changed it ----

  const isRecord = v => v && typeof v === 'object' && !Array.isArray(v)
  const COUNTS = ['right', 'wrong', 'runs', 'answered', 'matches']
  const weight = v => COUNTS.reduce((n, c) => n + (typeof v[c] === 'number' ? v[c] : 0), 0)

  function merge(mine, theirs) {
    if (mine === undefined) return theirs
    if (theirs === undefined) return mine
    if (typeof mine === 'number' && typeof theirs === 'number') return Math.max(mine, theirs)
    if (Array.isArray(mine) && Array.isArray(theirs)) {
      const all = [...mine, ...theirs]
      if (all.every(v => typeof v !== 'object')) return [...new Set(all)]
      if (all.every(v => isRecord(v) && 'id' in v)) {
        const seen = new Set()
        const joined = all.filter(v => !seen.has(v.id) && seen.add(v.id))
        return joined.every(v => typeof v.at === 'number') ? joined.sort((a, b) => b.at - a.at) : joined
      }
      return mine
    }
    if (isRecord(mine) && isRecord(theirs)) {
      // one question's or one line's history is kept whole: the copy with more answers, then the later review date
      if (typeof mine.due === 'number' && typeof theirs.due === 'number') {
        const [a, b] = [weight(mine), weight(theirs)]
        return b > a || (b === a && theirs.due > mine.due) ? theirs : mine
      }
      const out = {}
      for (const k of new Set([...Object.keys(mine), ...Object.keys(theirs)])) out[k] = merge(mine[k], theirs[k])
      return out
    }
    return mine
  }

  // ---- talking to the server ----

  async function call(path, options = {}) {
    const res = await fetch(API + path, {
      ...options,
      headers: { 'content-type': 'application/json', ...(account ? { authorization: `Bearer ${account.token}` } : {}) },
    })
    if (res.status === 401 && account) signOut(false)
    return { status: res.status, body: await res.json().catch(() => ({})) }
  }

  /** Take a copy from the server as this browser's progress. The trainer reads it when the page loads. */
  function adopt(text, version) {
    const changed = text !== local()
    write(key, text)
    meta = { version, synced: text }
    write(META, meta)
    if (changed) location.reload()
  }

  async function push(text, base) {
    const { status: code, body } = await call(`/progress/${app}`, { method: 'PUT', body: JSON.stringify({ data: JSON.parse(text), baseVersion: base }) })
    if (code === 200) {
      meta = { version: body.version, synced: text }
      write(META, meta)
      return true
    }
    if (code === 409) return settle(body)
    throw new Error(body.error || 'Could not save')
  }

  /** Bring this browser and the server into agreement, given what the server holds. */
  async function settle(remote) {
    const mine = local()
    if (!remote.data) return mine ? push(mine, 0) : true
    const theirs = JSON.stringify(remote.data)
    if (remote.version === meta.version) return mine && mine !== meta.synced ? push(mine, remote.version) : true
    // the server has moved on since this browser last agreed with it
    if (!mine || mine === meta.synced || mine === theirs) return adopt(theirs, remote.version), true
    const merged = JSON.stringify(merge(JSON.parse(mine), remote.data))
    if (merged !== theirs && !(await push(merged, remote.version))) return false
    return adopt(merged, meta.version > remote.version ? meta.version : remote.version), true
  }

  async function sync() {
    if (!account || busy) return
    busy = true
    setStatus('Saving…')
    try {
      const { status: code, body } = await call(`/progress/${app}`)
      if (code === 200) {
        await settle(body)
        setStatus('Saved')
      } else if (account) setStatus('Not saved')
    } catch {
      setStatus('Offline: saved in this browser')
    }
    busy = false
  }

  function signOut(tellServer = true) {
    if (tellServer && account) call('/auth/logout', { method: 'POST' }).catch(() => {})
    account = null
    meta = { version: 0, synced: null }
    write(ACCOUNT, null)
    write(META, null)
    setStatus('')
    render()
  }

  async function signIn(credential) {
    setStatus('Signing in…')
    try {
      const { status: code, body } = await call('/auth/google', { method: 'POST', body: JSON.stringify({ credential }) })
      if (code !== 200) return setStatus(body.error || 'Sign-in failed')
      account = { token: body.token, user: body.user }
      write(ACCOUNT, account)
      open = false
      render()
      sync()
    } catch {
      setStatus('Could not reach the server')
    }
  }

  // ---- the button in the corner ----

  const host = document.createElement('div')
  const root = host.attachShadow({ mode: 'open' })
  root.innerHTML = `<style>
    :host { position: fixed; right: 12px; bottom: 12px; z-index: 1000; font: 12px/1.4 'JetBrains Mono', ui-monospace, monospace; color: #d7dae0; }
    .pill, .panel { background: #14161b; border: 1px solid #2c313a; border-radius: 8px; }
    .pill { display: flex; align-items: center; gap: 8px; padding: 6px 10px; cursor: pointer; color: inherit; font: inherit; }
    .pill:hover { border-color: #4b5563; }
    .pill img { width: 18px; height: 18px; border-radius: 50%; }
    .dim { color: #8b93a1; }
    .panel { position: absolute; right: 0; bottom: 40px; width: 250px; padding: 12px; display: grid; gap: 10px; }
    .panel p { margin: 0; }
    button.link { background: none; border: 0; padding: 0; color: #7cc4ff; font: inherit; cursor: pointer; text-align: left; }
    button.link.danger { color: #f38b8b; }
  </style><div id="box"></div>`
  const box = root.getElementById('box')
  let open = false
  let clientId = read('faranz-google-client')

  function setStatus(text) {
    status = text
    const el = root.getElementById('status')
    if (el) el.textContent = text
  }

  function render() {
    const user = account?.user
    box.innerHTML = `
      ${open ? `<div class="panel">${
        user
          ? `<p>Signed in as<br><b></b></p><p class="dim">Progress in all the trainers is saved to this account.</p>
             <button class="link" id="out">Sign out</button>
             <button class="link danger" id="forget">Delete my account and saved progress</button>`
          : `<p>Sign in to save your progress and pick it up on another device.</p><div id="google"></div>
             <p class="dim">Without an account, progress stays in this browser only. <a href="/privacy.html" target="_blank" style="color:#7cc4ff">Privacy</a></p>`
      }</div>` : ''}
      <button class="pill" id="pill">${user?.picture ? '<img alt="" referrerpolicy="no-referrer">' : ''}<span>${user ? '' : 'Sign in to save progress'}</span><span class="dim" id="status"></span></button>`
    if (user) {
      root.querySelector('.pill span').textContent = user.name || user.email
      if (user.picture) root.querySelector('.pill img').src = user.picture
      if (open) root.querySelector('.panel b').textContent = user.email
    }
    root.getElementById('status').textContent = status
    root.getElementById('pill').onclick = () => ((open = !open), render())
    if (!open) return
    if (user) {
      root.getElementById('out').onclick = () => signOut()
      root.getElementById('forget').onclick = async function () {
        if (this.dataset.sure !== 'yes') return (this.dataset.sure = 'yes'), void (this.textContent = 'Click again to delete everything saved on the server')
        await call('/me', { method: 'DELETE' }).catch(() => {})
        signOut(false)
      }
    } else googleButton(root.getElementById('google'))
  }

  async function googleButton(slot) {
    try {
      if (!clientId) {
        clientId = (await call('/config')).body.googleClientId
        if (clientId) write('faranz-google-client', JSON.stringify(clientId))
      }
      if (!clientId) return void (slot.textContent = 'Sign-in is not set up yet.')
      if (!window.google?.accounts?.id)
        await new Promise((done, fail) => {
          const s = document.createElement('script')
          s.src = 'https://accounts.google.com/gsi/client'
          s.onload = done
          s.onerror = fail
          document.head.append(s)
        })
      google.accounts.id.initialize({ client_id: clientId, callback: r => signIn(r.credential) })
      // Google's button cannot be drawn inside a shadow root, so it sits in the page, placed over the panel's slot
      const holder = document.createElement('div')
      holder.style.cssText = 'position:fixed;z-index:1001;color-scheme:light'
      document.body.append(holder)
      const place = () => {
        if (!slot.isConnected) return holder.remove()
        const r = slot.getBoundingClientRect()
        holder.style.left = r.left + 'px'
        holder.style.top = r.top + 'px'
        requestAnimationFrame(place)
      }
      slot.style.height = '40px'
      place()
      google.accounts.id.renderButton(holder, { theme: 'filled_black', size: 'large', width: 224, text: 'signin_with' })
    } catch {
      slot.textContent = 'Could not load Google sign-in.'
    }
  }

  const start = () => {
    document.body.append(host)
    render()
    sync()
    // the trainers write their entry whenever something changes: notice it and save
    setInterval(() => account && !busy && local() !== meta.synced && sync(), 4000)
    document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && sync())
    window.addEventListener('pagehide', () => {
      const mine = local()
      if (account && mine && mine !== meta.synced)
        fetch(`${API}/progress/${app}`, { method: 'PUT', keepalive: true, headers: { 'content-type': 'application/json', authorization: `Bearer ${account.token}` }, body: JSON.stringify({ data: JSON.parse(mine), baseVersion: meta.version }) }).catch(() => {})
    })
  }
  document.body ? start() : document.addEventListener('DOMContentLoaded', start)
})()
