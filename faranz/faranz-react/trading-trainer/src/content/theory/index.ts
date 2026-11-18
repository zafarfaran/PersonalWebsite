import type { Block } from '../../types'
import { marketsTheory } from './markets'
import { chartsTheory } from './charts'
import { optionsTheory } from './options'
import { pricingTheory } from './pricing'
import { volatilityTheory } from './volatility'
import { strategiesTheory } from './strategies'
import { riskTheory } from './risk'
import { daytradingTheory } from './daytrading'
import { backtestTheory } from './backtest'
import { businessTheory } from './business'

/** The full theory of every lesson, keyed by lesson id. */
export const THEORY: Record<string, Block[]> = { ...marketsTheory, ...chartsTheory, ...optionsTheory, ...pricingTheory, ...volatilityTheory, ...strategiesTheory, ...riskTheory, ...daytradingTheory, ...backtestTheory, ...businessTheory }
