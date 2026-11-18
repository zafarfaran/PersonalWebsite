// Accounts and saved progress for the trainers on faranz.com.
// Runs as a Railway Function (one file, Bun). Deployed copy: project "faranz-trainers", service "api".
//
// Sign-in is Google only: the browser gets an ID token from Google, this checks it and hands back a session
// token of its own. Progress is one JSON document per user and trainer, saved with a version number so that
// two devices cannot silently overwrite each other.
//
// Row level security: every read and write of a user's data runs as the role `app_user` inside a transaction
// that carries the user's id, and the policies only let that role see rows with that id.
import { sql } from 'bun'

const APPS = new Set(['chess', 'math', 'ml', 'trading'])
const ORIGINS = new Set((Bun.env.ALLOWED_ORIGINS ?? 'https://faranz.com,https://www.faranz.com').split(',').map(o => o.trim()))
const CLIENT_ID = Bun.env.GOOGLE_CLIENT_ID ?? ''
const SESSION_DAYS = 90
const MAX_BODY = 4 * 1024 * 1024

await sql.unsafe(`
  create table if not exists users (
    id uuid primary key default gen_random_uuid(),
    google_sub text unique not null,
    email text not null,
    name text,
    picture text,
    created_at timestamptz not null default now(),
    last_seen_at timestamptz not null default now()
  );
  create table if not exists sessions (
    token_hash text primary key,
    user_id uuid not null references users(id) on delete cascade,
    created_at timestamptz not null default now(),
    expires_at timestamptz not null
  );
  create index if not exists sessions_user on sessions(user_id);
  create table if not exists progress (
    user_id uuid not null references users(id) on delete cascade,
    app text not null,
    data jsonb not null,
    version integer not null default 1,
    updated_at timestamptz not null default now(),
    primary key (user_id, app)
  );

  do $$ begin
    if not exists (select from pg_roles where rolname = 'app_user') then create role app_user nologin; end if;
  end $$;
  revoke all on users, sessions, progress from app_user;
  grant select on users to app_user;
  grant select, insert, update, delete on progress to app_user;

  alter table users enable row level security;
  alter table users force row level security;
  alter table sessions enable row level security;
  alter table sessions force row level security;
  alter table progress enable row level security;
  alter table progress force row level security;

  drop policy if exists users_self on users;
  create policy users_self on users for select to app_user
    using (id = current_setting('app.user_id', true)::uuid);
  drop policy if exists progress_owner on progress;
  create policy progress_owner on progress for all to app_user
    using (user_id = current_setting('app.user_id', true)::uuid)
    with check (user_id = current_setting('app.user_id', true)::uuid);
`)

const hash = async (text: string) =>
  Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))), b => b.toString(16).padStart(2, '0')).join('')

const newToken = () => Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join('')

/** Run queries as the signed-in user: the role and the user id last for this transaction only. */
const asUser = <T,>(userId: string, work: (tx: typeof sql) => Promise<T>) =>
  sql.begin(async tx => {
    await tx`select set_config('app.user_id', ${userId}, true)`
    await tx.unsafe('set local role app_user')
    return work(tx as unknown as typeof sql)
  }) as Promise<T>

async function sessionUser(req: Request): Promise<string | null> {
  const token = req.headers.get('authorization')?.match(/^Bearer ([0-9a-f]{64})$/)?.[1]
  if (!token) return null
  const rows = await sql`select user_id from sessions where token_hash = ${await hash(token)} and expires_at > now()`
  return rows[0]?.user_id ?? null
}

/** Ask Google whether an ID token is real, and check it was issued to this site. */
async function googleProfile(credential: string) {
  const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`)
  if (!res.ok) return null
  const t = (await res.json()) as Record<string, string>
  const issuerOk = t.iss === 'accounts.google.com' || t.iss === 'https://accounts.google.com'
  if (t.aud !== CLIENT_ID || !issuerOk || t.email_verified !== 'true' || Number(t.exp) * 1000 < Date.now()) return null
  return { sub: t.sub, email: t.email, name: t.name ?? null, picture: t.picture ?? null }
}

const parse = (data: unknown) => (typeof data === 'string' ? JSON.parse(data) : data)

async function handle(req: Request, url: URL): Promise<Response> {
  const path = url.pathname.replace(/\/+$/, '') || '/'
  const json = (body: unknown, status = 200) => Response.json(body, { status })

  if (path === '/' || path === '/health') return json({ ok: true })
  if (path === '/config') return json({ googleClientId: CLIENT_ID || null })

  if (path === '/auth/google' && req.method === 'POST') {
    if (!CLIENT_ID) return json({ error: 'Sign-in is not set up yet.' }, 503)
    const { credential } = (await req.json()) as { credential?: string }
    const profile = typeof credential === 'string' ? await googleProfile(credential) : null
    if (!profile) return json({ error: 'Google did not accept that sign-in.' }, 401)
    const [user] = await sql`
      insert into users (google_sub, email, name, picture) values (${profile.sub}, ${profile.email}, ${profile.name}, ${profile.picture})
      on conflict (google_sub) do update set email = excluded.email, name = excluded.name, picture = excluded.picture, last_seen_at = now()
      returning id, email, name, picture`
    const token = newToken()
    await sql`delete from sessions where expires_at < now()`
    await sql`insert into sessions (token_hash, user_id, expires_at) values (${await hash(token)}, ${user.id}, now() + make_interval(days => ${SESSION_DAYS}))`
    return json({ token, user: { email: user.email, name: user.name, picture: user.picture } })
  }

  const userId = await sessionUser(req)
  if (!userId) return json({ error: 'Not signed in.' }, 401)

  if (path === '/auth/logout' && req.method === 'POST') {
    const token = req.headers.get('authorization')!.slice(7)
    await sql`delete from sessions where token_hash = ${await hash(token)}`
    return json({ ok: true })
  }

  if (path === '/me' && req.method === 'GET') {
    const [user] = await asUser(userId, tx => tx`select email, name, picture from users`)
    return user ? json({ user }) : json({ error: 'Not signed in.' }, 401)
  }

  if (path === '/me' && req.method === 'DELETE') {
    await sql`delete from users where id = ${userId}`
    return json({ ok: true })
  }

  const app = path.match(/^\/progress\/([a-z]+)$/)?.[1]
  if (app && APPS.has(app)) {
    if (req.method === 'GET') {
      const [row] = await asUser(userId, tx => tx`select data, version, updated_at from progress where app = ${app}`)
      return json(row ? { data: parse(row.data), version: row.version, updatedAt: row.updated_at } : { data: null, version: 0 })
    }
    if (req.method === 'PUT') {
      const text = await req.text()
      if (text.length > MAX_BODY) return json({ error: 'Too much to save.' }, 413)
      const body = JSON.parse(text) as { data?: unknown; baseVersion?: number }
      if (!body.data || typeof body.data !== 'object' || Array.isArray(body.data)) return json({ error: 'Nothing to save.' }, 400)
      const base = Number(body.baseVersion ?? 0)
      const doc = JSON.stringify(body.data)
      return asUser(userId, async tx => {
        const [row] = await tx`select data, version from progress where app = ${app} for update`
        if ((row?.version ?? 0) !== base) return json({ error: 'Changed on another device.', data: row ? parse(row.data) : null, version: row?.version ?? 0 }, 409)
        if (!row) await tx`insert into progress (user_id, app, data) values (${userId}, ${app}, ${doc}::jsonb)`
        else await tx`update progress set data = ${doc}::jsonb, version = version + 1, updated_at = now() where app = ${app}`
        return json({ version: base + 1 })
      })
    }
  }

  return json({ error: 'Not found.' }, 404)
}

Bun.serve({
  port: Number(Bun.env.PORT ?? 3000),
  async fetch(req) {
    const origin = req.headers.get('origin') ?? ''
    const cors: Record<string, string> = ORIGINS.has(origin)
      ? { 'access-control-allow-origin': origin, 'access-control-allow-headers': 'authorization, content-type', 'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS', 'access-control-max-age': '86400', vary: 'origin' }
      : {}
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })
    let res: Response
    try {
      res = await handle(req, new URL(req.url))
    } catch (err) {
      console.error(err)
      res = Response.json({ error: 'Something went wrong.' }, { status: 500 })
    }
    for (const [k, v] of Object.entries(cors)) res.headers.set(k, v)
    return res
  },
})
