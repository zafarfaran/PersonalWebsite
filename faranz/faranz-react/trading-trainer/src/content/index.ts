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
import { quant } from './quant'
import { algo } from './algo'
import { business } from './business'
import { THEORY } from './theory'

/** The course, in the order it is meant to be taken. A module with no lessons yet is left out. */
export const MODULES: Module[] = [markets, charts, orderflow, profile, options, pricing, volatility, strategies, risk, daytrading, backtest, quant, algo, business]
  .filter(m => m.lessons.length > 0)
  .map(m => ({ ...m, lessons: m.lessons.map(l => ({ ...l, theory: THEORY[l.id] })) }))
