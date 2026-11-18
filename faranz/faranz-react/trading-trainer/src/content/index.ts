import type { Module } from '../types'
import { markets } from './markets'
import { charts } from './charts'
import { orderflow } from './orderflow'
import { profile } from './profile'
import { options } from './options'
import { pricing } from './pricing'
import { volatility } from './volatility'
import { strategies } from './strategies'
import { risk } from './risk'
import { daytrading } from './daytrading'
import { backtest } from './backtest'
import { business } from './business'
import { quant } from './quant'
import { qdata } from './qdata'
import { qseries } from './qseries'
import { qalpha } from './qalpha'
import { statarb } from './statarb'
import { portfolio } from './portfolio'
import { qoptions } from './qoptions'
import { qml } from './qml'
import { algo } from './algo'
import { engine } from './engine'
import { execution } from './execution'
import { agentic } from './agentic'
import { THEORY } from './theory'

/** Every module, in the order it is meant to be taken. A module with no lessons yet is left out. */
export const MODULES: Module[] = [markets, charts, orderflow, profile, options, pricing, volatility, strategies, risk, daytrading, backtest, business, quant, qdata, qseries, qalpha, statarb, portfolio, qoptions, qml, algo, engine, execution, agentic]
  .filter(m => m.lessons.length > 0)
  .map(m => ({ ...m, lessons: m.lessons.map(l => ({ ...l, theory: THEORY[l.id] })) }))

export interface Track {
  id: string
  title: string
  summary: string
  modules: Module[]
}

const track = (id: string, title: string, summary: string, ids: string[]): Track => ({ id, title, summary, modules: MODULES.filter(m => ids.includes(m.id)) })

/** The course is two tracks. A track with no modules yet is left out. */
export const TRACKS: Track[] = [
  track("options", "Day trading options", "From the first share to a tested trading plan: markets, charts, order flow, volume profile, options, risk and the intraday playbook.", ["markets","charts","orderflow","profile","options","pricing","volatility","strategies","risk","daytrading","backtest","business"]),
  track("quant", "Quant and algorithmic trading", "Trading as research and as software: data, statistics, signals, portfolios, options maths and machine learning, then the systems that trade them, down to agents built on language models.", ["quant","qdata","qseries","qalpha","statarb","portfolio","qoptions","qml","algo","engine","execution","agentic"]),
].filter(t => t.modules.length > 0)
