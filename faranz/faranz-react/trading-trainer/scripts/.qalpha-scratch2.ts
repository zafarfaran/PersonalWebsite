import { gaussian, seeded } from '../src/components/Plot'
const draws = (seed: number, n: number) => { const g = gaussian(seeded(seed)); return Array.from({ length: n }, () => g()) }
const mean = (r: number[]) => r.reduce((a, b) => a + b, 0) / r.length
const MKT = draws(101, 250).map(z => 0.0006 + 0.01 * z); const mm = mean(MKT)
for (let s = 100; s < 160; s++) { const e = draws(s, 250); const me = mean(e); let c = 0, v = 0; MKT.forEach((m, i) => { c += (m - mm) * (e[i] - me); v += (m - mm) ** 2 })
  const b = c / v; const a = me - b * mm; console.log(s, (a * Math.sqrt(250)).toFixed(2), b.toFixed(3)) }
