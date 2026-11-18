import type { ComponentType } from 'react'
import { marketsWidgets } from './markets'
import { chartsWidgets } from './charts'
import { optionsWidgets } from './options'
import { pricingWidgets } from './pricing'
import { volatilityWidgets } from './volatility'
import { strategiesWidgets } from './strategies'
import { riskWidgets } from './risk'
import { daytradingWidgets } from './daytrading'
import { backtestWidgets } from './backtest'
import { businessWidgets } from './business'

/** Every interactive figure, by the name a lesson refers to it with. Names start with the module: "options-payoff". */
export const WIDGETS: Record<string, ComponentType> = {
  ...marketsWidgets,
  ...chartsWidgets,
  ...optionsWidgets,
  ...pricingWidgets,
  ...volatilityWidgets,
  ...strategiesWidgets,
  ...riskWidgets,
  ...daytradingWidgets,
  ...backtestWidgets,
  ...businessWidgets,
}
