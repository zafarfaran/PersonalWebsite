import type { ComponentType } from 'react'
import { marketsWidgets } from './markets'
import { chartsWidgets } from './charts'
import { orderflowWidgets } from './orderflow'
import { profileWidgets } from './profile'
import { optionsWidgets } from './options'
import { pricingWidgets } from './pricing'
import { volatilityWidgets } from './volatility'
import { strategiesWidgets } from './strategies'
import { riskWidgets } from './risk'
import { daytradingWidgets } from './daytrading'
import { backtestWidgets } from './backtest'
import { businessWidgets } from './business'
import { quantWidgets } from './quant'
import { qdataWidgets } from './qdata'
import { qseriesWidgets } from './qseries'
import { qalphaWidgets } from './qalpha'
import { statarbWidgets } from './statarb'
import { portfolioWidgets } from './portfolio'
import { qoptionsWidgets } from './qoptions'
import { qmlWidgets } from './qml'
import { algoWidgets } from './algo'
import { engineWidgets } from './engine'
import { executionWidgets } from './execution'
import { agenticWidgets } from './agentic'

/** Every interactive figure, by the name a lesson refers to it with. Names start with the module: "options-payoff". */
export const WIDGETS: Record<string, ComponentType> = {
  ...marketsWidgets,
  ...chartsWidgets,
  ...orderflowWidgets,
  ...profileWidgets,
  ...optionsWidgets,
  ...pricingWidgets,
  ...volatilityWidgets,
  ...strategiesWidgets,
  ...riskWidgets,
  ...daytradingWidgets,
  ...backtestWidgets,
  ...businessWidgets,
  ...quantWidgets,
  ...qdataWidgets,
  ...qseriesWidgets,
  ...qalphaWidgets,
  ...statarbWidgets,
  ...portfolioWidgets,
  ...qoptionsWidgets,
  ...qmlWidgets,
  ...algoWidgets,
  ...engineWidgets,
  ...executionWidgets,
  ...agenticWidgets,
}
