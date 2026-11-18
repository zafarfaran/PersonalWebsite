import { useMemo, useState, type ComponentType } from 'react'
import { Dot, Path, Plot, Readout, Seg, Slider, fmt, gaussian, seeded } from '../components/Plot'

type Pt = [number, number]

const mean = (r: number[]) => r.reduce((a, b) => a + b, 0) / r.length
const corr = (a: number[], b: number[]) => {
  const ma = mean(a)
  const mb = mean(b)
  let sab = 0
  let saa = 0
  let sbb = 0
  a.forEach((x, i) => {
    sab += (x - ma) * (b[i] - mb)
    saa += (x - ma) ** 2
    sbb += (b[i] - mb) ** 2
  })
  return sab / Math.sqrt(saa * sbb)
}

/** Solves A x = b by Gaussian elimination with partial pivoting. */
function solve(A: number[][], b: number[]): number[] {
  const n = b.length
  const M = A.map((row, i) => [...row, b[i]])
  for (let c = 0; c < n; c++) {
    let p = c
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r
    ;[M[c], M[p]] = [M[p], M[c]]
    for (let r = c + 1; r < n; r++) {
      const f = M[r][c] / M[c][c]
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]
    }
  }
  const x = new Array(n).fill(0)
  for (let r = n - 1; r >= 0; r--) {
    let s = M[r][n]
    for (let k = r + 1; k < n; k++) s -= M[r][k] * x[k]
    x[r] = s / M[r][r]
  }
  return x
}

/** 2,500 made-up (x, e) pairs for each of 40 samples. */
const SNR_MAX = 2500
const SNR_POOL: { x: number[]; e: number[] }[] = Array.from({ length: 40 }, (_, k) => {
  const g = gaussian(seeded(500 + k))
  return { x: Array.from({ length: SNR_MAX }, () => g()), e: Array.from({ length: SNR_MAX }, () => g()) }
})

/** A feature and the next return with a chosen correlation: what a realistic signal looks like. */
function Snr() {
  const [rho, setRho] = useState(0.05)
  const [n, setN] = useState(250)
  const [k, setK] = useState(0)
  const { x, e } = SNR_POOL[k % SNR_POOL.length]
  const xs = x.slice(0, n)
  const ys = xs.map((v, i) => rho * v + Math.sqrt(1 - rho * rho) * e[i])
  const r = corr(xs, ys)
  const hit = xs.filter((v, i) => Math.sign(v) === Math.sign(ys[i])).length / n
  const shown = Math.min(n, 400)
  return (
    <div className="widget">
      <Plot x={[-3.2, 3.2]} y={[-3.2, 3.2]} xLabel="feature (z-score)" yLabel="next return (z-score)">
        {s => (
          <>
            {xs.slice(0, shown).map((v, i) => <Dot key={i} s={s} x={v} y={ys[i]} r={1.8} color="muted" opacity={0.55} />)}
            <Seg s={s} a={[-3.2, -3.2 * rho]} b={[3.2, 3.2 * rho]} color="blue" dash="5 4" width={2} />
            <Seg s={s} a={[-3.2, -3.2 * r]} b={[3.2, 3.2 * r]} color="accent" width={2.5} />
          </>
        )}
      </Plot>
      <Slider label="true correlation ρ" value={rho} min={0} max={0.3} step={0.01} onChange={setRho} />
      <Slider label="days of data" value={n} min={100} max={SNR_MAX} step={50} onChange={setN} />
      <div className="actions">
        <button className="btn" onClick={() => setK(k + 1)}>New sample</button>
      </div>
      <Readout
        items={[
          ['measured ρ', fmt(r, 3), 'accent'],
          ['noise band', `±${fmt(2 / Math.sqrt(n), 3)}`],
          ['sign right', `${fmt(100 * hit, 1)}%`],
          ['theory', `${fmt(100 * (0.5 + Math.asin(rho) / Math.PI), 1)}%`, 'blue'],
          ['R² (ρ²)', `${fmt(100 * r * r, 2)}%`],
        ]}
      />
      <p className="caption">
        Made-up daily data: each dot is a day, the blue dashed line is the true relationship and the yellow line the one measured from this sample. Set ρ to 0.05, a good daily
        signal, and press New sample a few times with 250 days, then with 2,500. The measured slope only settles when the noise band is well inside ρ.
      </p>
    </div>
  )
}

/** Ridge on 30 standardised features, 3 of them real: in-sample and out-of-sample R² for each λ. */
const RN = 120
const RT = 600
const RP = 30
const RIDGE = (() => {
  const g = gaussian(seeded(77))
  const beta = Array.from({ length: RP }, (_, j) => [0.25, -0.2, 0.15][j] ?? 0)
  const X = Array.from({ length: RN + RT }, () => Array.from({ length: RP }, () => g()))
  const y = X.map(row => row.reduce((a, v, j) => a + v * beta[j], 0) + g())
  const tr = X.slice(0, RN)
  const mu = Array.from({ length: RP }, (_, j) => mean(tr.map(r => r[j])))
  const sd = Array.from({ length: RP }, (_, j) => Math.sqrt(mean(tr.map(r => (r[j] - mu[j]) ** 2))))
  const Z = X.map(row => row.map((v, j) => (v - mu[j]) / sd[j]))
  const ym = mean(y.slice(0, RN))
  const yc = y.map(v => v - ym)
  const Ztr = Z.slice(0, RN)
  const XtX = Array.from({ length: RP }, (_, a) => Array.from({ length: RP }, (_, b) => Ztr.reduce((s, r) => s + r[a] * r[b], 0)))
  const Xty = Array.from({ length: RP }, (_, a) => Ztr.reduce((s, r, i) => s + r[a] * yc[i], 0))
  const r2 = (from: number, to: number, b: number[]) => {
    let sse = 0
    let sst = 0
    for (let i = from; i < to; i++) {
      const f = Z[i].reduce((s, v, j) => s + v * b[j], 0)
      sse += (yc[i] - f) ** 2
      sst += yc[i] ** 2
    }
    return 1 - sse / sst
  }
  return Array.from({ length: 51 }, (_, i) => {
    const lg = -1 + i * 0.1
    const b = solve(XtX.map((row, a) => row.map((v, c) => v + (a === c ? 10 ** lg : 0))), Xty)
    const abs = b.map(Math.abs)
    return { lg, inR2: r2(0, RN, b), outR2: r2(RN, RN + RT, b), size: abs.reduce((a, v) => a + v, 0) }
  })
})()

function Ridge() {
  const [lg, setLg] = useState(-1)
  const cur = RIDGE[Math.round((lg + 1) * 10)]
  const best = RIDGE.reduce((a, c) => (c.outR2 > a.outR2 ? c : a))
  return (
    <div className="widget">
      <Plot x={[-1, 4]} y={[-0.4, 0.5]} xLabel="log10 λ (more shrinkage →)" yLabel="R²">
        {s => (
          <>
            <Path s={s} pts={RIDGE.map(c => [c.lg, c.inR2] as Pt)} color="blue" />
            <Path s={s} pts={RIDGE.map(c => [c.lg, c.outR2] as Pt)} color="accent" />
            <Seg s={s} a={[lg, -0.4]} b={[lg, 0.5]} color="muted" dash="4 4" />
            <Dot s={s} x={cur.lg} y={cur.inR2} color="blue" />
            <Dot s={s} x={cur.lg} y={cur.outR2} color="accent" />
          </>
        )}
      </Plot>
      <Slider label="log10 λ" value={lg} min={-1} max={4} step={0.1} onChange={setLg} show={v => `λ = ${fmt(10 ** v, v < 0 ? 2 : 0)}`} />
      <Readout
        items={[
          ['in-sample R²', `${fmt(100 * cur.inR2, 1)}%`, 'blue'],
          ['out-of-sample R²', `${fmt(100 * cur.outR2, 1)}%`, cur.outR2 >= 0 ? 'good' : 'bad'],
          ['size of b, Σ|b|', fmt(cur.size, 2)],
          ['best λ out of sample', fmt(10 ** best.lg, 0), 'accent'],
        ]}
      />
      <p className="caption">
        Made-up data: 120 training days, 30 standardised features of which only 3 matter, scored on 600 later days. Blue is the fit on the training days, yellow on the later
        ones. Slide λ up from almost nothing: the in-sample R² only falls, while the out-of-sample R² climbs from below zero to a peak and then fades as the real effects are
        shrunk away too.
      </p>
    </div>
  )
}

/** Boosting stumps on one feature: the fit and its training and test error, round by round. */
const BN = 80
const BT = 400
const BR = 300
const LR = 0.1
type Stump = { t: number; lo: number; hi: number }
const signal = (x: number) => (x < 0.3 ? -0.5 : x < 0.7 ? 0.6 : 0) + 0.4 * Math.sin(9 * x)
const BOOST = [
  { amp: 1, noise: 0.25 },
  { amp: 0.35, noise: 1 },
].map(({ amp, noise }, m) => {
  const rnd = seeded(900 + m)
  const g = gaussian(seeded(950 + m))
  const make = (n: number) => {
    const x = Array.from({ length: n }, () => rnd())
    return { x, y: x.map(v => amp * signal(v) + noise * g()) }
  }
  const train = make(BN)
  const test = make(BT)
  const order = train.x.map((_, i) => i).sort((a, b) => train.x[a] - train.x[b])
  const xs = order.map(i => train.x[i])
  let pred = new Array(BN).fill(mean(train.y))
  let tpred = new Array(BT).fill(mean(train.y))
  const stumps: Stump[] = []
  const mse = (p: number[], y: number[]) => mean(p.map((v, i) => (v - y[i]) ** 2))
  const err = [{ tr: mse(pred, train.y), te: mse(tpred, test.y) }]
  for (let k = 0; k < BR; k++) {
    const res = order.map(i => train.y[i] - pred[i])
    const total = res.reduce((a, v) => a + v, 0)
    let left = 0
    let best = { score: -Infinity, t: 0, lo: 0, hi: 0 }
    for (let j = 0; j < BN - 1; j++) {
      left += res[j]
      if (xs[j] === xs[j + 1]) continue
      const nl = j + 1
      const score = (left * left) / nl + ((total - left) ** 2) / (BN - nl)
      if (score > best.score) best = { score, t: (xs[j] + xs[j + 1]) / 2, lo: left / nl, hi: (total - left) / (BN - nl) }
    }
    stumps.push(best)
    const step = (v: number) => LR * (v <= best.t ? best.lo : best.hi)
    pred = pred.map((p, i) => p + step(train.x[i]))
    tpred = tpred.map((p, i) => p + step(test.x[i]))
    err.push({ tr: mse(pred, train.y), te: mse(tpred, test.y) })
  }
  return { train, start: mean(train.y), stumps, err, amp }
})

function Boost() {
  const [mode, setMode] = useState(1)
  const [rounds, setRounds] = useState(10)
  const d = BOOST[mode]
  const grid = Array.from({ length: 201 }, (_, i) => i / 200)
  const fit = grid.map(x => d.stumps.slice(0, rounds).reduce((a, st) => a + LR * (x <= st.t ? st.lo : st.hi), d.start))
  const ys = d.train.y
  const lo = Math.min(...ys) - 0.2
  const hi = Math.max(...ys) + 0.2
  const bestR = d.err.reduce((a, e, i) => (e.te < d.err[a].te ? i : a), 0)
  const emax = Math.max(...d.err.map(e => e.te)) * 1.1
  return (
    <div className="widget">
      <div className="seg">
        <button className={mode === 0 ? 'on' : ''} onClick={() => setMode(0)}>Strong signal</button>
        <button className={mode === 1 ? 'on' : ''} onClick={() => setMode(1)}>Noisy, like returns</button>
      </div>
      <Plot x={[0, 1]} y={[lo, hi]} height={220} xLabel="feature" yLabel="label">
        {s => (
          <>
            {d.train.x.map((x, i) => <Dot key={i} s={s} x={x} y={ys[i]} r={2.5} color="muted" opacity={0.7} />)}
            <Path s={s} pts={grid.map(x => [x, d.amp * signal(x)] as Pt)} color="blue" dash="5 4" width={1.5} />
            <Path s={s} pts={grid.map((x, i) => [x, fit[i]] as Pt)} color="accent" width={2.5} />
          </>
        )}
      </Plot>
      <Plot x={[0, BR]} y={[0, emax]} height={170} xLabel="boosting rounds" yLabel="error (MSE)">
        {s => (
          <>
            <Path s={s} pts={d.err.map((e, i) => [i, e.tr] as Pt)} color="blue" />
            <Path s={s} pts={d.err.map((e, i) => [i, e.te] as Pt)} color="accent" />
            <Seg s={s} a={[rounds, 0]} b={[rounds, emax]} color="muted" dash="4 4" />
          </>
        )}
      </Plot>
      <Slider label="rounds (learning rate 0.1)" value={rounds} min={0} max={BR} step={1} onChange={setRounds} />
      <Readout
        items={[
          ['training error', fmt(d.err[rounds].tr, 3), 'blue'],
          ['test error', fmt(d.err[rounds].te, 3), 'accent'],
          ['best rounds on test', bestR],
        ]}
      />
      <p className="caption">
        Eighty made-up training points (grey), the true pattern (blue dashed) and the boosted fit (yellow). Below, training error in blue and error on 400 new points in yellow.
        With the strong signal, rounds help for a long time. Switch to the noisy data and raise the rounds: the fit starts chasing single points, and the test error turns up early.
      </p>
    </div>
  )
}

/** Shuffled k-fold against purged walk-forward, on pure noise with overlapping labels. */
const LN = 800
const LW = [20, 40, 60]
const LEAK = (() => {
  const g = gaussian(seeded(31))
  const e = Array.from({ length: LN + 100 }, () => g())
  const raw = Array.from({ length: LN }, (_, i) => LW.map(w => mean(e.slice(i + 70 - w, i + 70))))
  const sds = LW.map((_, j) => Math.sqrt(mean(raw.map(r => r[j] ** 2))))
  const X = raw.map(r => r.map((v, j) => v / sds[j]))
  const rnd = seeded(37)
  const perm = Array.from({ length: LN }, (_, i) => i)
  for (let i = LN - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[perm[i], perm[j]] = [perm[j], perm[i]]
  }
  return { e, X, perm }
})()
const HS = [1, 2, 5, 10, 20]

function Leak() {
  const [h, setH] = useState(20)
  const res = useMemo(() => {
    const y = Array.from({ length: LN }, (_, i) => Math.sign(LEAK.e.slice(i + 70, i + 70 + h).reduce((a, v) => a + v, 0)) || 1)
    const nn = (train: number[], test: number[]) => {
      let right = 0
      for (const t of test) {
        let best = -1
        let bd = Infinity
        for (const r of train) {
          const d = (LEAK.X[t][0] - LEAK.X[r][0]) ** 2 + (LEAK.X[t][1] - LEAK.X[r][1]) ** 2 + (LEAK.X[t][2] - LEAK.X[r][2]) ** 2
          if (d < bd) [bd, best] = [d, r]
        }
        if (y[best] === y[t]) right++
      }
      return right / test.length
    }
    const folds = Array.from({ length: 5 }, (_, k) => LEAK.perm.slice(k * 160, (k + 1) * 160))
    const shuffled = folds.map(f => {
      const inF = new Set(f)
      return nn(LEAK.perm.filter(i => !inF.has(i)), f)
    })
    const wf = [300, 400, 500, 600, 700].map(s => nn(Array.from({ length: s - h + 1 }, (_, i) => i), Array.from({ length: 100 }, (_, i) => s + i)))
    return { shuffled, wf }
  }, [h])
  const bars = [...res.shuffled.map((v, i) => ({ x: i + 0.6, v, c: 'var(--bad)' })), ...res.wf.map((v, i) => ({ x: i + 6.4, v, c: 'var(--blue)' }))]
  return (
    <div className="widget">
      <div className="seg">
        {HS.map(v => (
          <button key={v} className={h === v ? 'on' : ''} onClick={() => setH(v)}>{v} day{v > 1 ? 's' : ''}</button>
        ))}
      </div>
      <Plot x={[0, 11.4]} y={[0.3, 0.9]} xLabel="shuffled 5-fold (red)    walk-forward, purged (blue)" yLabel="accuracy">
        {s => (
          <>
            {bars.map(b => <rect key={b.x} x={s.x(b.x)} width={s.w(0.8)} y={s.y(Math.max(b.v, 0.3))} height={Math.max(0, s.y(0.3) - s.y(Math.max(b.v, 0.3)))} fill={b.c} opacity={0.75} />)}
            <Seg s={s} a={[0, 0.5]} b={[11.4, 0.5]} color="text" dash="5 4" />
          </>
        )}
      </Plot>
      <Readout
        items={[
          ['label horizon', `${h} day${h > 1 ? 's' : ''}`],
          ['shuffled k-fold', `${fmt(100 * mean(res.shuffled), 1)}%`, 'bad'],
          ['purged walk-forward', `${fmt(100 * mean(res.wf), 1)}%`, 'blue'],
        ]}
      />
      <p className="caption">
        Pure noise: 800 made-up days, features are trailing 20, 40 and 60-day averages of the noise, and the label is the sign of the next h days. A nearest-neighbour model
        cannot really beat 50% (dashed line). Choose the label horizon and compare the two ways of testing it. The longer the labels overlap, the more shuffled folds flatter it.
      </p>
    </div>
  )
}

/** From forecast to positions: a threshold, costs, and what is left. */
const TN = 5040
const TRHO = 0.06
const TDATA = (() => {
  const g = gaussian(seeded(78))
  const z = Array.from({ length: TN }, () => g())
  const r = z.map(v => 0.01 * (TRHO * v + Math.sqrt(1 - TRHO * TRHO) * g()))
  return { z, r }
})()

function Threshold() {
  const [k, setK] = useState(0)
  const [bp, setBp] = useState(2)
  const { z, r } = TDATA
  const pos = z.map(v => (Math.abs(v) > k ? Math.sign(v) : 0))
  const gross = pos.map((p, i) => p * r[i])
  const cost = pos.map((p, i) => (bp / 10000) * Math.abs(p - (i ? pos[i - 1] : 0)))
  const net = gross.map((v, i) => v - cost[i])
  let a = 0
  let b = 0
  const step = 20
  const gc: Pt[] = [[0, 0]]
  const nc: Pt[] = [[0, 0]]
  net.forEach((v, i) => {
    a += 100 * gross[i]
    b += 100 * v
    if ((i + 1) % step === 0) {
      gc.push([(i + 1) / 252, a])
      nc.push([(i + 1) / 252, b])
    }
  })
  const traded = pos.filter(p => p !== 0).length
  const right = pos.filter((p, i) => p !== 0 && Math.sign(r[i]) === p).length
  const m = mean(net)
  const sd = Math.sqrt(mean(net.map(v => (v - m) ** 2)))
  const all = [...gc.map(p => p[1]), ...nc.map(p => p[1])]
  return (
    <div className="widget">
      <Plot x={[0, TN / 252]} y={[Math.min(0, ...all) - 5, Math.max(...all) + 5]} xLabel="years" yLabel="cumulative %">
        {s => (
          <>
            <Path s={s} pts={gc} color="muted" width={1.5} />
            <Path s={s} pts={nc} color={b >= 0 ? 'good' : 'bad'} />
          </>
        )}
      </Plot>
      <Slider label="threshold k (trade when |forecast| > k)" value={k} min={0} max={2} step={0.1} onChange={setK} />
      <Slider label="cost per unit traded" value={bp} min={0} max={10} step={0.5} onChange={setBp} show={v => `${fmt(v, 1)} bp`} />
      <Readout
        items={[
          ['days in market', `${fmt((100 * traded) / TN, 0)}%`],
          ['hit rate when in', `${fmt(traded ? (100 * right) / traded : 0, 1)}%`],
          ['gross a year', `${fmt((100 * 252 * mean(gross)), 1)}%`],
          ['costs a year', `${fmt(100 * 252 * mean(cost), 1)}%`, 'bad'],
          ['net Sharpe', fmt(sd ? (m / sd) * Math.sqrt(252) : 0), 'accent'],
        ]}
      />
      <p className="caption">
        Twenty made-up years of a daily forecast with an IC of 0.06; grey is before costs, the coloured line after. At 0 bp the sign of every forecast is worth trading. Raise the
        cost to 5 bp and almost nothing is left. Then raise the threshold: costs and gross return both fall, the net Sharpe recovers, and past about 2 so few trades are left that the record is mostly noise.
      </p>
    </div>
  )
}

export const qmlWidgets: Record<string, ComponentType> = {
  'qml-snr': Snr,
  'qml-ridge': Ridge,
  'qml-boost': Boost,
  'qml-leak': Leak,
  'qml-threshold': Threshold,
}
