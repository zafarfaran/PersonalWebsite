import { gaussian, seeded } from '../src/components/Plot'
const mean = (r: number[]) => r.reduce((a, b) => a + b, 0) / r.length
const sd = (r: number[]) => { const m = mean(r); return Math.sqrt(r.reduce((a, b) => a + (b - m) ** 2, 0) / (r.length - 1)) }
const draws = (seed: number, n: number) => { const g = gaussian(seeded(seed)); return Array.from({ length: n }, () => g()) }
const MKT = draws(101, 250).map(z => 0.0006 + 0.01 * z); const EPS = draws(100, 250)
for (const [beta, alpha, noise] of [[1.5, 0, 0.015], [1.5, 0.04, 0.015], [1, 0.04, 0.015], [1, 0.04, 0.005], [2, 0, 0.015], [0.5, 0, 0.015]]) {
  const r = MKT.map((m, i) => alpha / 252 + beta * m + noise * EPS[i]); const mm = mean(MKT), mr = mean(r)
  let c = 0, v = 0; MKT.forEach((m, i) => { c += (m - mm) * (r[i] - mr); v += (m - mm) ** 2 })
  const b = c / v, a = mr - b * mm; const res = r.map((x, i) => x - a - b * MKT[i]); const t = a / (sd(res) / Math.sqrt(250))
  const tot = (x: number[]) => x.reduce((acc, y) => acc * (1 + y), 1) - 1
  console.log('beta', beta, alpha, noise, b.toFixed(2), (a * 252 * 100).toFixed(1), t.toFixed(1), (tot(r) * 100).toFixed(0), (tot(MKT) * 100).toFixed(0))
}
const QZ = Array.from({ length: 60 }, (_, t) => draws(500 + t, 200)); const QE = Array.from({ length: 60 }, (_, t) => draws(900 + t, 200))
for (const ic of [0, 0.02, 0.05, 0.1]) for (const q of [5, 10]) {
  const sums = Array(q).fill(0); const sp: number[] = []
  for (let t = 0; t < 60; t++) { const z = QZ[t]; const f = z.map((v, i) => 0.06 * (ic * v + Math.sqrt(1 - ic * ic) * QE[t][i])); const o = z.map((_, i) => i).sort((i, j) => z[i] - z[j])
    const m = Array.from({ length: q }, (_, k) => mean(o.slice(Math.round(k * 200 / q), Math.round((k + 1) * 200 / q)).map(i => f[i]))); m.forEach((v, k) => (sums[k] += v / 60)); sp.push(m[q - 1] - m[0]) }
  console.log('q', ic, q, sums.map(x => (x * 100).toFixed(2)).join(' '), 'spread', (mean(sp) * 100).toFixed(2), 't', (mean(sp) / (sd(sp) / Math.sqrt(60))).toFixed(1))
}
const SID = draws(77, 30); const sec = (i: number) => Math.floor(i / 10); const SE = [1, -0.4, -0.6]
for (const tilt of [0, 1, 2]) for (const neu of [false, true]) {
  const raw = SID.map((e, i) => tilt * SE[sec(i)] + e); const sm = (x: number[], k: number) => mean(x.filter((_, i) => sec(i) === k))
  const adj = neu ? raw.map((v, i) => v - sm(raw, sec(i))) : raw.map(v => v - mean(raw)); const g = adj.reduce((a, v) => a + Math.abs(v), 0); const w = adj.map(v => 2 * v / g)
  const net = [0, 1, 2].map(k => w.filter((_, i) => sec(i) === k).reduce((a, v) => a + v, 0)); const tot = w.reduce((a, v) => a + v * v, 0); const bt = [0, 1, 2].reduce((a, k) => a + 10 * sm(w, k) ** 2, 0)
  console.log('n', tilt, neu, net.map(x => (x * 100).toFixed(0)).join(' '), (100 * bt / tot).toFixed(0))
}
const KZ = draws(4242, 500)
for (const [n, y] of [[1, 5], [10, 5], [100, 5], [200, 3], [500, 1], [100, 20], [500, 20]]) { const est = KZ.slice(0, n).map(z => z / Math.sqrt(y)); console.log('s', n, y, Math.max(...est).toFixed(2), est.filter(v => v > 1).length) }
