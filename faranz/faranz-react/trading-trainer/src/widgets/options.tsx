import { useState, type ComponentType } from 'react'
import { Curve, Dot, Label, Plot, Readout, Seg, Slider, fmt } from '../components/Plot'

type Kind = 'call' | 'put'
const payoff = (kind: Kind, S: number, K: number) => (kind === 'call' ? Math.max(S - K, 0) : Math.max(K - S, 0))
const money = (v: number) => `${v < 0 ? '−' : ''}$${Math.abs(v).toLocaleString('en-US', { maximumFractionDigits: 0 })}`

/** Normal CDF from an erf approximation (Abramowitz and Stegun 7.1.26), good to about 1e-7. */
function ncdf(x: number) {
  const z = Math.abs(x) / Math.SQRT2
  const t = 1 / (1 + 0.3275911 * z)
  const erf = 1 - t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429)))) * Math.exp(-z * z)
  return x >= 0 ? 0.5 * (1 + erf) : 0.5 * (1 - erf)
}

/** A model price with no interest rate (the pricing module explains the model). */
function modelPrice(kind: Kind, S: number, K: number, years: number, vol: number) {
  if (years <= 0) return payoff(kind, S, K)
  const sd = vol * Math.sqrt(years)
  const d1 = (Math.log(S / K) + 0.5 * sd * sd) / sd
  const d2 = d1 - sd
  return kind === 'call' ? S * ncdf(d1) - K * ncdf(d2) : K * ncdf(-d2) - S * ncdf(-d1)
}

function KindButtons({ kind, set }: { kind: Kind; set: (k: Kind) => void }) {
  return (
    <div className="seg">
      {(['call', 'put'] as Kind[]).map(k => <button key={k} className={k === kind ? 'on' : ''} onClick={() => set(k)}>{k === 'call' ? 'Call' : 'Put'}</button>)}
    </div>
  )
}

/** An option's price split into intrinsic and extrinsic value, as the stock and the days to expiry change. */
function Value() {
  const [kind, setKind] = useState<Kind>('call')
  const [S, setS] = useState(103)
  const [days, setDays] = useState(30)
  const K = 100
  const price = (s: number) => modelPrice(kind, s, K, days / 365, 0.3)
  const p = price(S)
  const intrinsic = payoff(kind, S, K)
  const where = intrinsic > 0 ? 'in the money' : Math.abs(S - K) < 0.5 ? 'at the money' : 'out of the money'
  return (
    <div className="widget">
      <KindButtons kind={kind} set={setKind} />
      <Plot x={[80, 120]} y={[0, 22]} xLabel="stock price" yLabel="option price" onDrag={x => setS(Math.round(x * 2) / 2)}>
        {s => (
          <>
            <Curve s={s} f={x => payoff(kind, x, K)} color="muted" dash="5 4" />
            <Curve s={s} f={price} color="accent" />
            <Seg s={s} a={[S, intrinsic]} b={[S, p]} color="good" width={4} />
            <Dot s={s} x={S} y={p} />
            <Label s={s} x={K} y={0.4} color="muted" anchor="middle" dy={-4}>strike 100</Label>
          </>
        )}
      </Plot>
      <Slider label="stock price" value={S} min={80} max={120} step={0.5} onChange={setS} />
      <Slider label="days to expiry" value={days} min={0} max={60} step={1} onChange={setDays} />
      <Readout items={[['price', fmt(p), 'accent'], ['intrinsic', fmt(intrinsic)], ['extrinsic', fmt(p - intrinsic), 'good'], ['', where]]} />
      <p className="caption">
        The dashed line is <b>intrinsic value</b>, what exercising pays now. The yellow curve is a model price and the green bar between them is <b>extrinsic value</b>. It is
        largest at the strike. Slide the days to 0 and the curve collapses onto the dashed line: at expiry an option is worth its intrinsic value and nothing more.
      </p>
    </div>
  )
}

/** Profit at expiry of bought calls or puts: strike, premium and number of contracts. */
function Payoff() {
  const [kind, setKind] = useState<Kind>('call')
  const [K, setK] = useState(100)
  const [prem, setPrem] = useState(2)
  const [n, setN] = useState(1)
  const [S, setS] = useState(106)
  const profit = (s: number) => (payoff(kind, s, K) - prem) * 100 * n
  const be = kind === 'call' ? K + prem : K - prem
  return (
    <div className="widget">
      <KindButtons kind={kind} set={setKind} />
      <Plot x={[70, 130]} y={[-1000 * n, 2500 * n]} xLabel="stock price at expiry" yLabel="profit, $" onDrag={x => setS(Math.round(x))}>
        {s => (
          <>
            <Curve s={s} f={profit} color="accent" n={240} />
            <Dot s={s} x={be} y={0} color="blue" ring />
            <Label s={s} x={be} y={0} color="blue" dy={16}>breakeven {fmt(be)}</Label>
            <Dot s={s} x={S} y={profit(S)} color={profit(S) >= 0 ? 'good' : 'bad'} />
          </>
        )}
      </Plot>
      <Slider label="strike" value={K} min={90} max={110} step={1} onChange={setK} />
      <Slider label="premium" value={prem} min={0.5} max={8} step={0.25} onChange={setPrem} show={v => v.toFixed(2)} />
      <Slider label="contracts" value={n} min={1} max={5} step={1} onChange={setN} />
      <Slider label="stock at expiry" value={S} min={70} max={130} step={1} onChange={setS} />
      <Readout
        items={[
          ['profit at expiry', money(profit(S)), profit(S) >= 0 ? 'good' : 'bad'],
          ['breakeven', fmt(be)],
          ['max loss', money(-prem * 100 * n), 'bad'],
          ['max profit', kind === 'call' ? 'no limit' : money((K - prem) * 100 * n), 'good'],
        ]}
      />
      <p className="caption">
        The hockey stick of a bought option. Below the strike a call loses its whole premium; above it every dollar the stock gains comes back to you, and profit starts at the
        <b> breakeven</b>, strike + premium. Raise the premium and the whole line drops. More contracts scale everything, the loss included.
      </p>
    </div>
  )
}

const MIRROR = ['Short call', 'Short put', 'Covered call', 'Cash-secured put'] as const
type MirrorName = (typeof MIRROR)[number]

/** The seller's side: short options, their mirror image, and the covered and cash-secured versions. */
function Mirror() {
  const [name, setName] = useState<MirrorName>('Short call')
  const [K, setK] = useState(105)
  const [prem, setPrem] = useState(2)
  const [S, setS] = useState(112)
  const [buyer, setBuyer] = useState(false)
  const kind: Kind = name.endsWith('call') ? 'call' : 'put'
  const option = (s: number) => (prem - payoff(kind, s, K)) * 100
  const shares = (s: number) => (name === 'Covered call' ? (s - 100) * 100 : 0)
  const seller = (s: number) => option(s) + shares(s)
  const maxProfit = name === 'Covered call' ? (K - 100 + prem) * 100 : prem * 100
  const maxLoss = name === 'Short call' ? 'no limit' : money(seller(0))
  return (
    <div className="widget">
      <div className="seg">{MIRROR.map(m => <button key={m} className={m === name ? 'on' : ''} onClick={() => setName(m)}>{m}</button>)}</div>
      <Plot x={[60, 140]} y={[-4000, 2500]} xLabel="stock price at expiry" yLabel="profit, $" onDrag={x => setS(Math.round(x))}>
        {s => (
          <>
            {buyer && <Curve s={s} f={x => -option(x)} color="blue" dash="5 4" n={240} />}
            <Curve s={s} f={seller} color="accent" n={240} />
            <Dot s={s} x={S} y={seller(S)} color={seller(S) >= 0 ? 'good' : 'bad'} />
            {buyer && <Dot s={s} x={S} y={-option(S)} color="blue" />}
          </>
        )}
      </Plot>
      <div className="actions"><button className="btn" onClick={() => setBuyer(!buyer)}>{buyer ? 'Hide' : 'Show'} the buyer line</button></div>
      <Slider label="strike" value={K} min={90} max={115} step={1} onChange={setK} />
      <Slider label="premium" value={prem} min={0.5} max={6} step={0.25} onChange={setPrem} show={v => v.toFixed(2)} />
      <Slider label="stock at expiry" value={S} min={60} max={140} step={1} onChange={setS} />
      <Readout
        items={[
          ['seller', money(seller(S)), seller(S) >= 0 ? 'good' : 'bad'],
          ...(buyer ? [['buyer of the option', money(-option(S)), 'blue'] as [string, string, 'blue']] : []),
          ['max profit', money(maxProfit), 'good'],
          ['max loss', maxLoss, 'bad'],
          ...(name === 'Cash-secured put' ? [['cash held', money(K * 100)] as [string, string]] : []),
        ]}
      />
      <p className="caption">
        The seller keeps the premium at best and owes the payoff at worst. Show the buyer line: the two always add up to zero. Covered call assumes 100 shares bought at 100, so
        the loss of the call is paid by the shares but the gain stops at the strike. A cash-secured put has the same line as a short put: the cash makes it payable, not safer.
      </p>
    </div>
  )
}

/** $1,000 in shares or in calls: percentage return at expiry. */
function Leverage() {
  const [prem, setPrem] = useState(2.5)
  const [S, setS] = useState(106)
  const budget = 1000
  const contracts = Math.floor(budget / (prem * 100))
  const shareRet = (s: number) => (s - 100)
  const callRet = (s: number) => ((payoff('call', s, 100) - prem) / prem) * 100
  const callPnl = (payoff('call', S, 100) - prem) * 100 * contracts
  return (
    <div className="widget">
      <Plot x={[85, 125]} y={[-150, 800]} xLabel="stock price at expiry" yLabel="return, %" onDrag={x => setS(Math.round(x * 2) / 2)}>
        {s => (
          <>
            <Curve s={s} f={shareRet} color="blue" />
            <Curve s={s} f={callRet} color="accent" n={160} />
            <Dot s={s} x={S} y={shareRet(S)} color="blue" />
            <Dot s={s} x={S} y={callRet(S)} />
          </>
        )}
      </Plot>
      <Slider label="call premium" value={prem} min={0.5} max={6} step={0.25} onChange={setPrem} show={v => v.toFixed(2)} />
      <Slider label="stock at expiry" value={S} min={85} max={125} step={0.5} onChange={setS} />
      <Readout
        items={[
          ['10 shares', `${money((S - 100) * 10)} (${fmt(shareRet(S), 1)}%)`, 'blue'],
          [`${contracts} calls`, `${money(callPnl)} (${fmt(callRet(S), 0)}%)`, callPnl >= 0 ? 'good' : 'bad'],
          ['call breakeven', fmt(100 + prem)],
          ['notional', money(contracts * 100 * 100)],
        ]}
      />
      <p className="caption">
        $1,000 with the stock at 100: blue is 10 shares, yellow is 100-strike calls, as a return on the money spent. Drag the stock price. The calls lose everything at 100 or
        below, lose less than all of it up to the breakeven, and outrun the shares far above it. Cheaper calls make both ends more extreme.
      </p>
    </div>
  )
}

export const optionsWidgets: Record<string, ComponentType> = {
  'options-value': Value,
  'options-payoff': Payoff,
  'options-mirror': Mirror,
  'options-leverage': Leverage,
}
