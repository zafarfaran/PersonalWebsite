# The course

Day trading options, from zero. Ten modules, taken in order. Each module has 7 teaching lessons and a lab (8 lessons),
each lesson 9 to 12 questions. The lesson lists below are the scope of each module: keep to your own module's
subjects so that modules do not repeat each other, and rely on what earlier modules taught (with a one-line reminder).
You may rename, merge or reorder lessons within your module where it teaches better, but cover everything listed.

Lesson ids are `<module>-<slug>`; the lab is `<module>-lab`.

## 1. `markets` — How markets work
What you are trading, who is on the other side, and what a trade costs.
- Shares, ETFs and indexes: what SPY, QQQ and SPX are; tickers; why day traders stick to liquid names
- Bid, ask and the spread: the quote, the mid, crossing the spread as a cost
- The order book and liquidity: depth, market makers, how a large order walks the book, slippage
- Order types: market, limit, stop, stop-limit, bracket orders; time in force; when each goes wrong
- The trading day: premarket, the open, midday, the close, after hours; where volume and spreads are best
- Accounts, margin and leverage: cash vs margin, buying power, settlement, short selling in brief, the pattern
  day trader rule (check its current state with a web search), what a margin call is
- What a trade costs: commissions and per-contract fees, spread, slippage; cost as a share of a small edge
- Lab: a small limit order book in Python (add orders, match, fill a market order, compute average fill and slippage)

## 2. `charts` — Reading price
A chart is a record of trades. Reading it without believing it predicts.
- Candles and timeframes: open, high, low, close, volume; building 5-minute bars from 1-minute bars
- Trend and structure: higher highs and higher lows, ranges, why timeframe changes the answer
- Support and resistance: prior highs and lows, round numbers, yesterday's range, why levels are zones
- Volume and VWAP: relative volume, the volume-weighted average price and why intraday traders watch it
- Moving averages: SMA and EMA, lag, crossovers and their false signals
- Volatility and momentum measures: true range and ATR, RSI, what an indicator can and cannot tell you
- Gaps and the opening range: gap up and down, the first 15 or 30 minutes, the opening range as levels
- Lab: an indicator toolkit in Python (resample bars, SMA, EMA, VWAP, ATR, opening range)

## 3. `options` — Options from zero
What a call and a put are, what they are worth at expiry, and how to read a chain.
- Calls and puts: the right to buy or sell, strike, expiry, premium, the 100 multiplier, buyer and seller
- Intrinsic and extrinsic value; in, at and out of the money
- Payoff at expiry for a long call and a long put: breakeven, maximum loss, the hockey stick
- Selling options: short call and short put payoffs, premium collected, why the risk is the mirror image
  (covered and cash-secured vs naked)
- Reading an option chain: strikes, expiries, bid and ask, volume, open interest, wide spreads on thin strikes
- Exercise, assignment and expiry: American vs European style, SPX cash settlement vs SPY shares, early
  assignment, what happens to an in-the-money option left open at expiry
- Leverage and why options are not shares: percent moves, the cost of being right too late, total loss
- Lab: a payoff engine in Python (single leg payoff and profit, breakeven, a position of several contracts)

## 4. `pricing` — What an option is worth before expiry: the Greeks
The five things that move an option's price and how much each one moves it.
- What drives the price: stock price, strike, time, volatility, rates; extrinsic value as the price of uncertainty
- Delta: change per $1, as a hedge ratio, as a rough probability of finishing in the money; delta of puts
- Gamma: how delta changes; why at-the-money options near expiry are explosive
- Theta: time decay, why it speeds up near expiry, decay across one trading day
- Vega: sensitivity to implied volatility; why a right call on direction can still lose
- The Black-Scholes model: its inputs, what it assumes, pricing a call and a put, put-call parity
- Estimating P&L with the Greeks: delta, gamma, theta and vega together for a move over a day; position Greeks
  for several contracts
- Lab: Black-Scholes and its Greeks from scratch in Python (normal CDF with math.erf, price, delta, gamma, theta,
  vega, a P&L estimate checked against repricing)

## 5. `volatility` — Volatility
The one input nobody can look up, and the thing option traders really trade.
- Realised volatility: returns, standard deviation, annualising with √252, daily from annual
- Implied volatility: backing it out of a price; IV as the market's forecast and the option's price tag
- The expected move: from IV and from the at-the-money straddle; one standard deviation and what it does not mean
- High or low: IV rank and IV percentile; buying cheap and selling rich as a starting idea, not a rule
- Skew and term structure: why puts cost more, the smile, near vs far expiries
- The VIX: what it measures, reading it as an expected daily move, its relationship with the index
- Events and IV crush: earnings, Fed days, CPI; why long options lose after the news even when right
- Lab: a volatility toolkit in Python (realised vol from prices, expected move, IV by bisection on Black-Scholes,
  IV rank)

## 6. `strategies` — Spreads and structures
Combining options to shape risk. Each lesson: construction, max profit, max loss, breakevens, Greeks, when it
fits and how it fails.
- Why spread: defining risk, lowering cost, the trade-off against capped profit
- Debit verticals: bull call spread, bear put spread
- Credit verticals: bull put spread, bear call spread; collecting premium with defined risk; probability vs payoff
- Straddles and strangles: long (buying movement) and short (selling it, undefined risk)
- Iron condors and iron butterflies: range trades with defined risk
- Calendars and diagonals in brief: trading time and term structure
- Choosing a structure: view on direction, on volatility and on time; matching the trade to the view; liquidity
  and fees of multi-leg orders
- Lab: a multi-leg strategy analyser in Python (legs as data, payoff across prices, max profit, max loss,
  breakevens)

## 7. `risk` — Risk and position sizing
The part that decides whether you survive. The maths of losing.
- Risk per trade: R, the 1% idea, turning a stop and an account size into a number of contracts
- Expectancy: win rate, average win and loss, why a 40% win rate can pay and a 70% one can lose
- Drawdowns and the maths of recovery: a 50% loss needs a 100% gain; losing streaks are certain
- Risk of ruin and the Kelly fraction: why full Kelly is too much, fractional sizing
- Stops and exits for options: premium stops, stops on the underlying, time stops, profit targets, why a stop is
  not a guarantee (gaps, fast markets)
- Limits above the trade: daily loss limit, maximum open risk, correlated positions, portfolio delta
- Defined vs undefined risk and margin: buying power of spreads vs naked options, how accounts blow up
- Lab: a Monte Carlo account simulator in Python (trades from a win rate and payoff, equity curves, drawdown,
  share of paths ruined, effect of size)

## 8. `daytrading` — The intraday playbook
Putting it together on one trading day. Setups as testable rules, not secrets.
- Preparing the day: economic calendar, overnight move, key levels, a watchlist, deciding in advance when not
  to trade
- What makes a setup: context, trigger, entry, stop, target, invalidation; writing one as rules
- The opening range breakout: rules, the failed breakout, why the first minutes are dangerous
- Trend days and VWAP: pullbacks to VWAP or a moving average, staying with a trend
- Range days and reversals: fading extremes, mean reversion to VWAP, telling a range day from a trend day
- Choosing the option for a day trade: delta, days to expiry, 0DTE vs a week out, spread width and liquidity,
  single option vs vertical
- Managing the trade and 0DTE in particular: scaling out, moving the stop, time of day, theta in the last hours,
  gamma risk, never holding a short option into the close by accident
- Lab: a day trade planner in Python (from account, levels and an option's delta and price to contracts, stop,
  target, R multiple and a go or no-go)

## 9. `backtest` — Testing an edge
Finding out whether a setup works before it costs money.
- The trading journal: what to record, R multiples, tagging setups, screenshots and notes
- Statistics of a trade list: win rate, average R, expectancy, profit factor, maximum drawdown
- Sample size and luck: how many trades before a win rate means anything, the standard error of a win rate,
  a lucky coin
- Writing a backtest: turning rules into code, bar by bar, entries and exits at prices that could have been had
- How backtests lie: lookahead bias, survivorship, overfitting parameters, ignoring costs and slippage, fills at
  the high or low of a bar
- In-sample, out-of-sample and walk-forward; paper trading as the last test
- Backtesting options honestly: the problem of historical option prices, testing the signal on the underlying,
  modelling the option with delta and a spread cost
- Lab: a backtest in Python and NumPy of an opening range breakout on made-up bars (signal, trades, costs, the
  statistics, in-sample vs out-of-sample)

## 10. `business` — Psychology and the business of trading
Why people who know all of the above still lose, and how to run trading like a small business.
- How traders really lose: loss aversion, cutting winners and holding losers, the disposition effect
- Tilt: revenge trading, overtrading, FOMO; circuit breakers that take the decision away from you
- Process over outcome: judging a trade by whether it followed the plan; good losses and bad wins
- The trading plan: markets, setups, sizing, limits, routine, in writing
- The daily and weekly routine: preparation, the session, review; what to review and how to change one thing
  at a time
- From paper to size: paper trading, one contract, rules for scaling up and for scaling back down
- Costs of the business: commissions, data, taxes in outline (differs by country, not advice, check with a
  professional), record keeping, what return is realistic and what the studies of day traders found
- Lab: a journal analyser in Python (from a list of trades: expectancy by setup, by time of day, rule breaks and
  what they cost, the longest losing streak)
