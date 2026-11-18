import type { Module } from '../types'

export const risk: Module = {
  id: 'risk',
  title: 'Risk and position sizing',
  summary:
    'The arithmetic of losing: how much to risk on one trade, what a win rate is worth, how drawdowns and losing streaks compound, and the limits that keep one bad day from ending the account.',
  lessons: [
    {
      id: 'risk-per-trade',
      title: 'Risk per trade: R and the 1% idea',
      summary: 'Decide what a trade may cost you before you enter, then let that number pick the size.',
      widget: 'risk-sizer',
      text: [
        'Before you ask what a trade could make, ask what it costs you if you are wrong. That amount, fixed before you enter, is **R**: one unit of risk. Results are then measured in R. A trade that makes $300 when R was $150 is a **+2R** trade; a trade stopped out as planned is **−1R**.',
        'The **1% idea**: risk a small, fixed fraction of the account on each trade, often between 0.5% and 2%. With $20,000 and 1%, R is $200. It is a rule of thumb, not a law of nature. Its point is that no single trade, and no ordinary run of losses, can do serious damage. Because R is a fraction of what the account is worth now, R shrinks after losses and grows after wins.',
        'To turn R into a number of contracts, work out what one contract loses if your stop is hit. For a bought option with a stop on its premium, that is `(entry − stop) × 100`, plus the fees for getting in and out. Then `contracts = floor(R ÷ risk per contract)`. Always round down. If the answer is 0, the trade is too big for this account: skip it or pick a cheaper structure.',
        { code: `def contracts(account, risk_pct, entry, stop, fee=0.0):
    budget = account * risk_pct                   # R in dollars
    per_contract = (entry - stop) * 100 + fee     # loss per contract at the stop
    return int(budget // per_contract)            # round down

print(contracts(20000, 0.01, 2.50, 1.50))         # 2` },
        'With no stop, the risk per contract of a bought option is its whole premium times 100. With a stop on the underlying share price instead, estimate the option loss with delta (from the pricing module): `delta × distance to the stop × 100` per contract. That estimate is rough, which is a reason to size a little smaller.',
        'Size comes from the stop and the fraction, never from how sure you feel. Conviction is not information the market has to respect. And a stop is a plan, not a promise (the stops lesson shows why): a gap can take you past it, so with options near expiry many traders size as if the whole premium could be lost.',
      ],
      rules: [
        'R is the dollar loss if the stop is hit, decided before entry.',
        'Risk a small fixed fraction per trade, commonly 0.5% to 2% of the account.',
        'Contracts = floor(R ÷ loss per contract at the stop, fees included). Round down.',
        'One option contract is 100 shares: multiply premium moves by 100.',
        'If the answer is 0 contracts, the trade does not fit the account. Skip it.',
        'Size from the stop, never from conviction.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'risk-per-trade-1',
          ask: 'Your account is $25,000 and you risk 1% per trade. What is R, in dollars?',
          answer: 250,
          check: '25000 * 0.01',
          why: '1% of $25,000 is $250. Every trade is then sized so that hitting its stop costs about $250.',
        },
        {
          kind: 'number',
          id: 'risk-per-trade-2',
          ask: 'R is $200. You buy a call at $2.50 and will sell if it falls to $1.50. Ignoring fees, how many contracts?',
          answer: 2,
          check: '(200 // ((2.50 - 1.50) * 100))',
          hint: 'One contract loses (entry − stop) × 100 at the stop.',
          why: 'Each contract loses $1.00 × 100 = $100 at the stop, so $200 of risk buys 2 contracts.',
        },
        {
          kind: 'number',
          id: 'risk-per-trade-3',
          ask: 'R was $150. The trade closed with a profit of $450. What was the result in R?',
          answer: 3,
          check: '450 / 150',
          why: '$450 ÷ $150 = 3, a +3R trade. Measuring in R lets you compare trades made at different sizes and account values.',
        },
        {
          kind: 'choice',
          id: 'risk-per-trade-4',
          ask: 'You are unusually sure about the next trade. Your rule says risk 1%. What should change?',
          options: [
            'Risk 3%, since the odds are better this time',
            'Nothing about the size: it comes from the stop and the fixed fraction',
            'Remove the stop so a shake-out cannot stop you',
            'Buy cheaper options so you can hold more contracts',
          ],
          answer: 1,
          why: 'Feeling sure is not evidence. Traders who size up on conviction tend to take their largest losses on their "best" ideas. If a setup really is better, a journal will show it over many trades, and that is the time to revisit the rules.',
        },
        {
          kind: 'output',
          id: 'risk-per-trade-5',
          ask: 'What does this print?',
          code: `def contracts(account, risk_pct, entry, stop):
    budget = account * risk_pct
    per_contract = round((entry - stop) * 100, 2)
    return int(budget // per_contract)

print(contracts(10000, 0.01, 1.20, 0.80), contracts(10000, 0.01, 3.00, 1.50))`,
          answer: '2 0',
          why: 'R is $100 both times. The first trade risks $40 a contract, so 100 ÷ 40 = 2.5, rounded down to 2. The second risks $150 a contract, more than R, so the answer is 0: this trade does not fit a $10,000 account at 1%.',
        },
        {
          kind: 'bug',
          id: 'risk-per-trade-6',
          ask: 'This sizer tells a $10,000 account to buy 250 contracts of a $1.20 option with a $0.80 stop. Which line is wrong?',
          code: `def contracts(account, risk_pct, entry, stop):
    budget = account * risk_pct
    per_contract = entry - stop
    return int(budget // per_contract)`,
          line: 3,
          fix: '    per_contract = (entry - stop) * 100',
          why: 'Option prices are quoted per share and a contract covers 100 shares. Without the multiplier the loss per contract looks 100 times smaller and the size 100 times larger. This is one of the most expensive slips a beginner can make.',
        },
        {
          kind: 'number',
          id: 'risk-per-trade-7',
          ask: 'Your account is $8,000 and you risk 2%. You buy a $1.60 option with no stop, so you treat the whole premium as at risk. How many contracts?',
          answer: 1,
          check: '(8000 * 0.02) // (1.60 * 100)',
          why: 'R is $160 and one contract can lose $160, the whole premium. So 1 contract. With no stop, a bought option can lose everything you paid for it.',
        },
        {
          kind: 'number',
          id: 'risk-per-trade-8',
          ask: 'R is $300. Your stop is on the share price, $2 below where it is now. The call you are buying has a delta of 0.50. Using delta to estimate the loss, how many contracts?',
          answer: 3,
          check: '300 // (0.50 * 2 * 100)',
          hint: 'Estimated option loss per contract = delta × distance × 100.',
          why: 'A $2 drop moves the option about 0.50 × $2 = $1.00, or $100 a contract. $300 ÷ $100 = 3. Treat it as an estimate: time decay and a falling delta change the real number.',
        },
        {
          kind: 'choice',
          id: 'risk-per-trade-9',
          ask: 'You risk 1% per trade. After a bad month the account has fallen from $20,000 to $16,000. What is R now?',
          options: ['Still $200, since the plan was set at $20,000', '$160', '$400, to win the losses back sooner', '$0 until the account is back at $20,000'],
          answer: 1,
          why: 'R is a fraction of what the account is worth today: 1% of $16,000 is $160. Shrinking R after losses slows the damage of a bad run. Raising it to win money back is how a drawdown becomes a disaster.',
        },
        {
          kind: 'write',
          id: 'risk-per-trade-10',
          ask: 'Write the sizer. Return the whole number of contracts whose loss at the stop, fees included, fits within `account × risk_pct`. Return 0 if none fits. Watch out for floating point: `(2.10 − 1.60) × 100` is not exactly 50.',
          starter: `def contracts(account, risk_pct, entry, stop, fee=0.0):
    # entry and stop are option prices per share; fee is per contract, round trip
    pass`,
          solution: `def contracts(account, risk_pct, entry, stop, fee=0.0):
    budget = round(account * risk_pct, 2)
    per_contract = round((entry - stop) * 100 + fee, 2)
    if per_contract <= 0:
        return 0
    return int(budget // per_contract)`,
          tests: `out = contracts(20000, 0.01, 2.50, 1.50)
assert out is not None, "the function returns nothing yet"
assert out == 2, f"$200 of risk at $100 a contract is 2 contracts, got {out}"
assert contracts(10000, 0.01, 1.20, 0.80) == 2, "100 / 40 = 2.5 should round down to 2"
assert contracts(20000, 0.01, 2.50, 1.50, fee=1.30) == 1, "with fees one contract risks $101.30, so only 1 fits in $200"
assert contracts(5000, 0.01, 3.00, 1.50) == 0, "a contract that risks more than R gives 0"
assert contracts(30000, 0.01, 2.10, 1.60) == 6, "$300 at $50 a contract is 6: round the cents before dividing"
assert isinstance(contracts(30000, 0.01, 2.10, 1.60), int), "return a whole number"`,
          hint: 'Round both amounts to cents with `round(x, 2)` before the floor division `//`.',
          why: 'R, loss per contract, round down. The rounding to cents matters: 0.5000000000000002 × 100 is a hair above 50, and 300 divided by it floors to 5 instead of 6. Money code should round to cents before it compares or divides.',
        },
        {
          kind: 'choice',
          id: 'risk-per-trade-11',
          ask: 'In the figure, set the account to $10,000, risk to 1% and the stop to $0.50 below entry. Then widen the stop to $1.00. What happens?',
          options: [
            'Contracts stay at 2 and the dollar risk doubles',
            'Contracts fall from 2 to 1 and the dollar risk stays at or under $100',
            'Contracts rise, because a wider stop is safer',
            'Nothing, the stop does not affect size',
          ],
          answer: 1,
          why: 'R stays $100. A wider stop means each contract can lose more, so fewer contracts fit. The dollar risk of the trade stays the same; only the size moves. That is the whole idea of sizing from the stop.',
        },
        {
          kind: 'design',
          id: 'risk-per-trade-12',
          ask: 'You have $15,000 and want to buy SPY calls at $3.20. Your chart says the idea is wrong if SPY falls $1.50; the calls have a delta of about 0.45. Write your sizing plan, step by step, before the trade.',
          checklist: [
            { point: 'Fix R first: for example 1% of $15,000 = $150', why: 'The risk budget is set by the account, not by the trade.' },
            { point: 'Estimate the loss per contract at the stop: 0.45 × $1.50 × 100 ≈ $68, plus fees', why: 'The stop is on SPY, so delta turns it into an option loss.' },
            { point: 'Divide and round down: $150 ÷ about $70 = 2 contracts', why: 'Rounding up would break the risk rule on every trade.' },
            { point: 'Check the worst case: 2 contracts can lose at most $640 if the premium goes to zero', why: 'A gap can skip the stop; know the number beyond R.' },
            { point: 'Write R, the stop and the size down before entering', why: 'A number decided in advance cannot be argued with in the heat of the trade.' },
            { point: 'Note the spread and fees and include them in the risk', why: 'Costs are part of the loss when the stop is hit.' },
          ],
          why: 'Sizing is a fixed routine: budget, loss per contract, round down, check the worst case. Done before the entry, it removes the most dangerous decision from the moment you are least able to make it.',
        },
      ],
    },
    {
      id: 'risk-expectancy',
      title: 'Expectancy: win rate against payoff',
      summary: 'Why a 40% win rate can make money and a 70% one can lose it.',
      widget: 'risk-expectancy',
      text: [
        'A win rate on its own says almost nothing. What matters is the **expectancy**: the average result per trade over many trades. With win rate p, average win W and average loss L, `E = p × W − (1 − p) × L`. Measured in R, the average loss is usually close to 1.',
        'Win 40% of the time, make 2R on wins and lose 1R on losses: `0.4 × 2 − 0.6 × 1 = +0.2R` a trade. Win 70% of the time, make 0.3R and lose 1R: `0.7 × 0.3 − 0.3 × 1 = −0.09R`. The second trader is right more often and loses money. Taking small profits quickly and letting losses run produces exactly this.',
        'For a payoff ratio b = W ÷ L, the **breakeven win rate** is `1 ÷ (1 + b)`. At 2 to 1 you need to win more than a third of the time; at 1 to 1, more than half; at 0.3 to 1, more than 77%. Every point on that line has zero expectancy.',
        '**Costs** come off every trade, win or lose: commissions, fees, the spread, slippage. Expressed in R, they subtract straight from E. An edge of +0.05R disappears if each round trip costs 0.08R, which is easy with small accounts and wide option spreads.',
        'Expectancy is a long-run average. Individual trades scatter widely around it, so a short run of results says little about E (the backtest module covers how many trades you need). Multiply E by R to get dollars: +0.1R with R = $250 is about $25 a trade on average, before any luck.',
      ],
      rules: [
        'E = p × W − (1 − p) × L. A win rate alone tells you nothing.',
        'Breakeven win rate = 1 ÷ (1 + payoff ratio).',
        'Costs are paid on every trade: subtract them from E.',
        'High win rates with small wins and rare large losses can still be losing systems.',
        'E is an average over many trades. Short runs scatter widely around it.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'risk-expectancy-1',
          ask: 'A setup wins 40% of the time. Wins average 2R and losses 1R. What is the expectancy, in R per trade?',
          answer: 0.2,
          check: '0.4 * 2 - 0.6 * 1',
          why: '0.4 × 2 − 0.6 × 1 = 0.8 − 0.6 = +0.2R. It loses more often than it wins and still pays, because the wins are twice the size of the losses.',
        },
        {
          kind: 'number',
          id: 'risk-expectancy-2',
          ask: 'A setup wins 70% of the time. Wins average 0.3R and losses 1R. What is the expectancy, in R per trade? Give two decimals.',
          answer: -0.09,
          tol: 0.005,
          check: '0.7 * 0.3 - 0.3 * 1',
          why: '0.21 − 0.30 = −0.09R. Seven small wins do not pay for three full losses. A high win rate feels good and can hide a losing system.',
        },
        {
          kind: 'number',
          id: 'risk-expectancy-3',
          ask: 'Your wins average 3R and your losses 1R. What win rate do you need to break even? Give a percentage, for example 10%.',
          answer: 0.25,
          check: '1 / (1 + 3)',
          tol: 0.005,
          why: '1 ÷ (1 + 3) = 25%. Check: 0.25 × 3 − 0.75 × 1 = 0. Above 25% the setup pays before costs.',
        },
        {
          kind: 'choice',
          id: 'risk-expectancy-4',
          ask: 'System A wins 65% of trades, with an average win of $100 and an average loss of $200. System B wins 35%, with an average win of $300 and an average loss of $100. Which has the better expectancy?',
          options: ['A, because it wins almost twice as often', 'B', 'They are the same', 'You cannot tell without the number of trades'],
          answer: 1,
          why: 'A: 0.65 × 100 − 0.35 × 200 = 65 − 70 = −$5 a trade. B: 0.35 × 300 − 0.65 × 100 = 105 − 65 = +$40 a trade. You do need many trades to trust either estimate, but on these numbers B is the one with an edge.',
        },
        {
          kind: 'output',
          id: 'risk-expectancy-5',
          ask: 'A journal of eight trades in R. What does this print?',
          code: `trades = [2, -1, -1, 3, -1, -1, 1.5, -1]
wins = [t for t in trades if t > 0]
print(len(wins) / len(trades), round(sum(trades) / len(trades), 2))`,
          answer: '0.375 0.19',
          why: 'Three wins out of eight is 0.375. The R values sum to 1.5, and 1.5 ÷ 8 = 0.1875, printed as 0.19. The average of the R multiples is the expectancy: you do not need W and L separately.',
        },
        {
          kind: 'number',
          id: 'risk-expectancy-6',
          ask: 'A setup wins 50% of the time with average win 1.2R and average loss 1R. R is $200 and each round trip costs $24 in commissions, fees and spread. What is the expectancy after costs, in R? Give two decimals.',
          answer: -0.02,
          tol: 0.005,
          check: '0.5 * 1.2 - 0.5 * 1 - 24 / 200',
          why: 'Before costs: 0.6 − 0.5 = +0.10R. Costs are $24 ÷ $200 = 0.12R on every trade. Net: −0.02R. The edge was real and smaller than the cost of trading it.',
        },
        {
          kind: 'bug',
          id: 'risk-expectancy-7',
          ask: 'This gives an expectancy of 0 for a setup that wins 30% of the time at 1 to 1. Which line is wrong?',
          code: `def expectancy(p, avg_win, avg_loss):
    win_part = p * avg_win
    loss_part = p * avg_loss
    return win_part - loss_part`,
          line: 3,
          fix: '    loss_part = (1 - p) * avg_loss',
          why: 'Losses happen with probability 1 − p, not p. As written, the win and loss parts are weighted alike, so any payoff above 1 looks profitable whatever the win rate. With the fix, 0.3 × 1 − 0.7 × 1 = −0.4R.',
        },
        {
          kind: 'choice',
          id: 'risk-expectancy-8',
          ask: 'This is the running total, in R, of 60 trades of a system that won 90% of them. What does it show?',
          chart: {
            title: 'Cumulative result',
            x: 'trade',
            y: 'R',
            series: [
              {
                name: 'running total',
                points: [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, -0.4, -0.3, -0.2, -0.1, 0.0, 0.1, 0.2, 0.3, 0.4, 0.5, -0.7, -0.6, -0.5, -0.4, -0.3, -0.2, -0.1, 0.0, 0.1, -1.1, -1.0, -0.9, -0.8, -0.7, -0.6, -0.5, -0.4, -0.3, -0.2, -1.4, -1.3, -1.2, -1.1, -1.0, -0.9, -0.8, -0.7, -0.6, -1.8, -1.7, -1.6, -1.5, -1.4, -1.3, -1.2, -1.1, -1.0, -0.9, -2.1, -2.0, -1.9, -1.8],
                color: 'accent',
              },
            ],
          },
          options: [
            'A good system that had bad luck: 90% winners cannot lose over time',
            'Small steady wins of 0.1R are wiped out by rare losses of 1.2R: the expectancy is negative',
            'The losses are random, so the system breaks even',
            'The system is fine, it only needs a tighter profit target',
          ],
          answer: 1,
          why: '0.9 × 0.1 − 0.1 × 1.2 = −0.03R a trade. The long climbs feel like proof, then one loss takes back twelve wins. Selling options for small premiums often has this shape, which is why the loss side must be measured, not hoped away.',
        },
        {
          kind: 'number',
          id: 'risk-expectancy-9',
          ask: 'A setup has an expectancy of +0.15R after costs and you risk R = $200. On average, what do 100 trades make, in dollars?',
          answer: 3000,
          check: '0.15 * 200 * 100',
          why: '0.15 × $200 = $30 a trade on average, times 100 = $3,000. The actual result of any 100 trades will scatter around this, sometimes well below zero.',
        },
        {
          kind: 'choice',
          id: 'risk-expectancy-10',
          ask: 'In the figure, set the win rate to 30% and the cost to 0. How large must the payoff ratio be before the dot moves above the breakeven line?',
          options: ['Above 1', 'Above about 2.33', 'Above 3', 'Above 0.7'],
          answer: 1,
          why: 'Breakeven needs 0.3 × b = 0.7, so b = 0.7 ÷ 0.3 ≈ 2.33. Add costs and the line moves up: low win rate setups need their big wins to be really big.',
        },
        {
          kind: 'write',
          id: 'risk-expectancy-11',
          ask: 'Write the breakeven win rate: the p at which `p × avg_win − (1 − p) × avg_loss − cost` is exactly zero. All three are in R.',
          starter: `def breakeven_win_rate(avg_win, avg_loss, cost=0.0):
    # returns p between 0 and 1
    pass`,
          solution: `def breakeven_win_rate(avg_win, avg_loss, cost=0.0):
    return (avg_loss + cost) / (avg_win + avg_loss)`,
          tests: `out = breakeven_win_rate(2, 1)
assert out is not None, "the function returns nothing yet"
assert abs(out - 1 / 3) < 1e-9, f"at 2 to 1 you need a third, got {out}"
assert abs(breakeven_win_rate(1, 1) - 0.5) < 1e-9, "at 1 to 1 you need half"
assert abs(breakeven_win_rate(2, 1, 0.2) - 0.4) < 1e-9, "a cost of 0.2R raises the 2 to 1 breakeven to 40%"
assert abs(breakeven_win_rate(0.3, 1) - 1 / 1.3) < 1e-9, "small wins of 0.3R need about 77% winners"`,
          hint: 'Expand: p × W − L + p × L − c = 0, then solve for p.',
          why: 'p(W + L) = L + c, so p = (L + c) ÷ (W + L). With no cost and L = 1 this is the 1 ÷ (1 + b) from the text. Costs push the bar up for every setup, most of all for those with small wins.',
        },
        {
          kind: 'design',
          id: 'risk-expectancy-12',
          ask: 'An online course advertises a 0DTE strategy with a "78% win rate". Before you believe it means anything, what do you need to know?',
          checklist: [
            { point: 'The average win and the average loss, in dollars or R', why: 'A win rate with no payoff ratio cannot give an expectancy.' },
            { point: 'The largest single loss and the worst losing run', why: 'High win rate systems often hide rare large losses.' },
            { point: 'Whether costs, spreads and slippage were included', why: 'On cheap 0DTE options, costs can be a large share of each trade.' },
            { point: 'How many trades the figure is based on', why: 'A win rate from 30 trades is very noisy.' },
            { point: 'Whether the trades were real, paper or a backtest, and over which period', why: 'Backtests and hand-picked periods flatter results.' },
            { point: 'The expectancy computed from all of the above', why: 'Only E per trade, after costs, says whether the method pays.' },
          ],
          why: 'A win rate is the one number that sounds impressive and proves nothing. Ask for the full trade list and work out the expectancy yourself.',
        },
      ],
    },
    {
      id: 'risk-drawdown',
      title: 'Drawdowns, recovery and losing streaks',
      summary: 'A 50% loss needs a 100% gain, and runs of losses are not bad luck but certainty.',
      widget: 'risk-drawdown',
      text: [
        'A **drawdown** is a fall from the highest value the account has reached (its **peak**) to a later low, as a share of the peak. The **maximum drawdown** is the largest such fall over a period. It is the number that decides whether you, and your account, can keep going.',
        'Losses and gains are not symmetric. After losing a fraction d you need a gain of `d ÷ (1 − d)` to get back. Lose 10% and you need 11.1%. Lose 25%, 33.3%. Lose 50%, 100%. Lose 75%, 300%. Small drawdowns are repaired by ordinary trading; deep ones may never be.',
        'Under fixed fractional sizing, n losses in a row at a fraction f leave `(1 − f)ⁿ` of the account. Ten straight losses at 1% cost about 9.6%; at 5%, about 40%. Size decides how deep a losing run cuts.',
        '**Losing streaks are certain**, not unlucky. If you lose 55% of trades, the chance that any given five trades are all losers is 0.55⁵ ≈ 5%. Over 200 trades a streak of eight or more losses happens in about half of all runs, even though every trade was fair.',
        { code: `def max_drawdown(equity):
    peak, worst = equity[0], 0.0
    for x in equity:
        peak = max(peak, x)
        worst = max(worst, (peak - x) / peak)
    return worst` },
        'Plan for streaks before they happen: pick a risk per trade small enough that the worst streak you expect costs a drawdown you can live with, and decide in advance what you will do at, say, 10% and 20% down. Never raise size to win a drawdown back faster.',
      ],
      rules: [
        'Drawdown is measured from the running peak, not from where you started.',
        'After a loss of d, you need a gain of d ÷ (1 − d) to recover.',
        'n losses in a row at fraction f leave (1 − f)ⁿ of the account.',
        'Long losing streaks happen to fair systems. Size so that they do not end you.',
        'Decide in advance what you do at each level of drawdown.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'risk-drawdown-1',
          ask: 'Your account falls by 20%. What gain do you need to get back to where you were? Give a percentage, for example 10%.',
          answer: 0.25,
          check: '0.2 / (1 - 0.2)',
          why: '$100 becomes $80, and $80 needs $20 more, which is 25% of $80. In general d ÷ (1 − d) = 0.2 ÷ 0.8.',
        },
        {
          kind: 'number',
          id: 'risk-drawdown-2',
          ask: 'An account falls from $40,000 to $30,000. What percentage gain does it need to recover? Give a percentage, for example 10%.',
          answer: 0.3333,
          tol: 0.005,
          check: '40000 / 30000 - 1',
          why: 'The loss was 25% of the peak, but the gain needed is $10,000 on $30,000, which is 33.3%. The deeper the hole, the more lopsided this gets.',
        },
        {
          kind: 'number',
          id: 'risk-drawdown-3',
          ask: 'You risk 2% of the current account on every trade and lose 10 in a row. How far down is the account? Give a percentage, for example 10%, to one decimal place.',
          answer: 0.1829,
          tol: 0.003,
          check: '1 - 0.98 ** 10',
          why: '0.98¹⁰ ≈ 0.817, so the account is down about 18.3%. Slightly less than 10 × 2% = 20%, because each loss is 2% of a smaller account.',
        },
        {
          kind: 'number',
          id: 'risk-drawdown-4',
          ask: 'A setup wins half the time. What is the probability that the next six trades are all losers? Give three decimal places.',
          answer: 0.0156,
          tol: 0.001,
          check: '0.5 ** 6',
          why: '0.5⁶ = 1/64 ≈ 0.016. Small for one particular six, but over hundreds of trades there are hundreds of places for such a run to start, so you should expect to meet it.',
        },
        {
          kind: 'output',
          id: 'risk-drawdown-5',
          ask: 'What does this print?',
          code: `equity = [100, 120, 90, 110, 130, 95, 140]
peak, worst = equity[0], 0.0
for x in equity:
    peak = max(peak, x)
    worst = max(worst, (peak - x) / peak)
print(round(worst, 3))`,
          answer: '0.269',
          why: 'Two falls from a peak: 120 to 90 is 25%, and 130 to 95 is 35 ÷ 130 ≈ 26.9%. The second is larger, even though the account ended at a new high.',
        },
        {
          kind: 'bug',
          id: 'risk-drawdown-6',
          ask: 'This should give the maximum drawdown. For `[100, 120, 90, 110]` it returns 0.0 instead of 0.25. Which line is wrong?',
          code: `def max_drawdown(equity):
    peak, worst = equity[0], 0.0
    for x in equity:
        peak = x
        worst = max(worst, (peak - x) / peak)
    return worst`,
          line: 4,
          fix: '        peak = max(peak, x)',
          why: 'Setting the peak to every new value means each value is measured against itself, so every drawdown comes out as zero. The peak must be the highest value seen so far.',
        },
        {
          kind: 'choice',
          id: 'risk-drawdown-7',
          ask: 'You lose 50% of an account and then make 50% on what is left. Where are you?',
          options: ['Back to where you started', 'Down 25%', 'Up 25%', 'Down 50%'],
          answer: 1,
          why: '$100 → $50 → $75. A 50% gain on half the money only gets back a quarter. Percent losses and gains do not cancel.',
        },
        {
          kind: 'output',
          id: 'risk-drawdown-8',
          ask: 'A string of wins and losses. What does this print?',
          code: `results = 'WLLWLLLWWLLLLW'
longest = run = 0
for r in results:
    run = run + 1 if r == 'L' else 0
    longest = max(longest, run)
print(longest)`,
          answer: '4',
          why: 'The runs of L are 2, 3 and 4. The counter resets on every win, and `longest` keeps the biggest. This sequence has 9 losses out of 14, a little worse than a 55% loss rate.',
        },
        {
          kind: 'choice',
          id: 'risk-drawdown-9',
          ask: 'In the figure, set 10 losses in a row at 2% risk, then move the risk to 10%. What are the drawdown and the gain needed to recover?',
          options: [
            'About 18% down needing about 22%, then about 65% down needing about 187%',
            '20% down needing 20%, then 100% down',
            'About 18% down needing 18%, then 65% down needing 65%',
            'The same at both sizes, since the losses are the same trades',
          ],
          answer: 0,
          why: '0.98¹⁰ ≈ 0.817 and 0.9¹⁰ ≈ 0.349. From 34.9% of the account you need ×2.87, a gain of about 187%. The same ten trades are an annoyance at 2% and close to fatal at 10%.',
        },
        {
          kind: 'write',
          id: 'risk-drawdown-10',
          ask: 'Write `max_drawdown`: given a list of account values in time order, return the largest fall from a running peak, as a fraction of that peak.',
          starter: `def max_drawdown(equity):
    # equity: a list of account values, oldest first
    pass`,
          solution: `def max_drawdown(equity):
    peak, worst = equity[0], 0.0
    for x in equity:
        peak = max(peak, x)
        worst = max(worst, (peak - x) / peak)
    return worst`,
          tests: `out = max_drawdown([100, 120, 90, 110])
assert out is not None, "the function returns nothing yet"
assert abs(out - 0.25) < 1e-9, f"120 to 90 is a 25% drawdown, got {out}"
assert max_drawdown([100, 110, 120]) == 0, "a curve that only rises has no drawdown"
assert abs(max_drawdown([100, 120, 90, 110, 130, 95, 140]) - 35 / 130) < 1e-9, "measure from the highest peak so far: 130 to 95"
assert abs(max_drawdown([100, 50, 200, 150]) - 0.5) < 1e-9, "the 50% fall from the start counts even though a new high came later"`,
          why: 'One pass with two running values: the highest point so far and the worst fall from it. Drawdown measured from the starting value instead would miss falls that begin after a new high, which is where most of them begin.',
        },
        {
          kind: 'number',
          id: 'risk-drawdown-11',
          ask: 'A setup wins 40% of the time. What is the chance that the next five trades all lose? Give three decimal places.',
          answer: 0.0778,
          tol: 0.001,
          check: '0.6 ** 5',
          why: '0.6⁵ ≈ 0.078, nearly one in thirteen. A trader who loses 60% of the time, even with a positive expectancy from big wins, meets five-loss runs regularly.',
        },
        {
          kind: 'design',
          id: 'risk-drawdown-12',
          ask: 'Write a drawdown plan for your trading: what happens at each level of loss from your peak, and how you decide when to return to normal.',
          checklist: [
            { point: 'Levels set in advance, for example 10% and 20% from the peak', why: 'Decisions made during a drawdown are made under stress.' },
            { point: 'Cut size at the first level, for example to half R', why: 'Smaller size slows the damage while you find out what is wrong.' },
            { point: 'Stop live trading at the second level and review the journal', why: 'A deep drawdown may mean the edge has gone, not only bad luck.' },
            { point: 'Compare the streak with what the win rate predicts', why: 'A streak within the expected range calls for patience, one far outside it for doubt.' },
            { point: 'A rule never to raise size to win losses back', why: 'Bigger size in a drawdown is how accounts are wiped out.' },
            { point: 'A clear condition to return, such as paper trading results or a fixed number of trades at small size', why: 'Without one, the return is decided by mood.' },
          ],
          why: 'Every trader has drawdowns. The ones who survive decided their response while calm and wrote it down.',
        },
      ],
    },
    {
      id: 'risk-kelly',
      title: 'Risk of ruin and the Kelly fraction',
      summary: 'Why too large a size loses even with an edge, and why traders bet a fraction of Kelly.',
      widget: 'risk-kelly',
      text: [
        '**Ruin** is reaching a level from which you cannot or will not go on: an empty account, or a loss so deep (often taken as 50%) that you stop. **Risk of ruin** is the chance of getting there. A positive expectancy does not protect you from it. Size does.',
        'When you risk a fraction f of the account and win b times what you risk with probability p, each trade multiplies the account by `1 + b·f` or by `1 − f`. Over many trades what matters is the average log growth per trade: `g(f) = p · ln(1 + b·f) + (1 − p) · ln(1 − f)`. Risk half the account on a fair coin that pays 2 to 1 and a win then a loss multiply it by 2 × 0.5 = 1: no growth at all, despite +0.5R a trade.',
        'The **Kelly fraction** maximises that growth: `f* = p − (1 − p) ÷ b`. For p = 0.5 and b = 2 it is 0.25. Betting more than Kelly gives slower growth with deeper drawdowns; at about twice Kelly growth falls to zero, and beyond that it turns negative, even with a real edge. If f* is zero or negative, there is no edge and the right size is nothing.',
        '**Full Kelly is too much** for trading. Your p and b are estimates from a noisy journal, and overestimating them puts you above Kelly without knowing. Even with true numbers, full Kelly brings drawdowns most people cannot sit through. **Half Kelly** keeps about three quarters of the growth with far smaller swings.',
        'Use Kelly as a ceiling, not a target. A day trader risking 0.5% to 2% a trade is usually well below any honest Kelly estimate, and that margin of safety is the point.',
      ],
      rules: [
        'Long-run growth depends on g(f) = p·ln(1 + b·f) + (1 − p)·ln(1 − f), not on expectancy alone.',
        'Kelly: f* = p − (1 − p) ÷ b. Zero or negative means do not trade it.',
        'Above Kelly, growth falls; around twice Kelly it is zero or worse.',
        'Your p and b are estimates. Use a fraction of Kelly, as a ceiling.',
        'Bigger risk per trade raises the chance of ruin fast.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'risk-kelly-1',
          ask: 'A bet wins half the time and pays 2 to 1. What is the Kelly fraction? Give a decimal.',
          answer: 0.25,
          check: '0.5 - 0.5 / 2',
          why: 'f* = 0.5 − 0.5 ÷ 2 = 0.25. Kelly says risk a quarter of the account, which is far more than any trader should, as the next questions show.',
        },
        {
          kind: 'number',
          id: 'risk-kelly-2',
          ask: 'A setup wins 60% of the time at 1 to 1. What is the Kelly fraction? Give a decimal.',
          answer: 0.2,
          check: '0.6 - 0.4 / 1',
          why: '0.6 − 0.4 ÷ 1 = 0.2. At even money, Kelly is the win rate minus the loss rate.',
        },
        {
          kind: 'choice',
          id: 'risk-kelly-3',
          ask: 'Your journal shows a 40% win rate with average wins of 1.2R. Kelly gives 0.4 − 0.6 ÷ 1.2 = −0.1. What does that mean?',
          options: [
            'Risk 10% of the account',
            'The setup has a negative expectancy: the right size is zero',
            'Take the opposite trade and risk 10%',
            'Risk 1%, since Kelly is always too high',
          ],
          answer: 1,
          why: 'A negative Kelly fraction means there is no edge: E = 0.4 × 1.2 − 0.6 = −0.12R. No size makes a losing setup grow. Doing the opposite trade does not hand you the reverse edge, because you pay costs both ways and the payoffs are not mirror images.',
        },
        {
          kind: 'output',
          id: 'risk-kelly-4',
          ask: 'A bet that wins half the time and pays 2 to 1. What does this print?',
          code: `import math

def growth(p, b, f):
    return p * math.log(1 + b * f) + (1 - p) * math.log(1 - f)

print(round(growth(0.5, 2, 0.25), 3), round(growth(0.5, 2, 0.5), 3))`,
          answer: '0.059 0.0',
          why: 'At the Kelly fraction 0.25 the account grows about 5.9% a bet in log terms. At 0.5 a win doubles it and a loss halves it, so the growth is exactly zero: twice Kelly throws away the whole edge.',
        },
        {
          kind: 'choice',
          id: 'risk-kelly-5',
          ask: 'Your journal suggests a Kelly fraction of 12%. Why do experienced traders still risk 1% or less a trade?',
          options: [
            'Because Kelly only works for casinos',
            'Because p and b are noisy estimates, overestimating them pushes you past Kelly, and full Kelly drawdowns are brutal',
            'Because brokers do not allow more than 1%',
            'Because smaller size raises the expectancy',
          ],
          answer: 1,
          why: 'Kelly is exact only for known odds. A journal of 100 trades can easily overstate the edge by half, and then a "Kelly" bet is far above the true Kelly. Size does not change expectancy per R; it changes how much variance you have to survive.',
        },
        {
          kind: 'number',
          id: 'risk-kelly-6',
          ask: 'You risk 60% of the account on a coin flip that pays 2 to 1. You start with $10,000, win once and lose once. What is the account, in dollars?',
          answer: 8800,
          check: '10000 * (1 + 2 * 0.6) * (1 - 0.6)',
          why: 'A win adds 2 × 60% = 120% (×2.2), a loss takes 60% (×0.4): 10,000 × 2.2 × 0.4 = $8,800. Every bet had an expectancy of +0.5R and the money shrank. Too much size turns an edge into a loss.',
        },
        {
          kind: 'bug',
          id: 'risk-kelly-7',
          ask: 'This growth rate says that risking more and more always grows the account faster. Which line is wrong?',
          code: `import math

def growth(p, b, f):
    up = p * math.log(1 + b * f)
    down = (1 - p) * math.log(1 + f)
    return up + down`,
          line: 5,
          fix: '    down = (1 - p) * math.log(1 - f)',
          why: 'A loss shrinks the account to 1 − f of itself. With 1 + f the "losses" add money, so g rises for ever. With the fix, g rises, peaks at Kelly and falls.',
        },
        {
          kind: 'choice',
          id: 'risk-kelly-8',
          ask: 'In the figure, set a 55% win rate and a payoff of 1.5. Kelly is 0.25. Now move the fraction you risk to 0.50. What happens to the growth rate?',
          options: [
            'It doubles, because you risk twice as much',
            'It falls to about zero, slightly negative',
            'It stays the same, because the edge is the same',
            'It rises a little',
          ],
          answer: 1,
          why: 'g(0.5) = 0.55 · ln 1.75 + 0.45 · ln 0.5 ≈ −0.004. At twice Kelly the edge is used up by the size of the swings. Beyond that the account shrinks while every trade still has a positive expectancy.',
        },
        {
          kind: 'number',
          id: 'risk-kelly-9',
          ask: 'A setup wins 55% of the time at 1.5 to 1. What is half Kelly? Give a percentage, for example 10%.',
          answer: 0.125,
          check: '(0.55 - 0.45 / 1.5) / 2',
          tol: 0.002,
          why: 'Kelly is 0.55 − 0.45 ÷ 1.5 = 0.25, so half Kelly is 12.5%. Still far more than a sensible risk per trade, because these numbers came from a perfect estimate you will never have.',
        },
        {
          kind: 'write',
          id: 'risk-kelly-10',
          ask: 'Write the Kelly fraction for win rate `p` and payoff ratio `b`. Return 0 when there is no edge, never a negative number.',
          starter: `def kelly(p, b):
    # p: win rate   b: average win divided by average loss
    pass`,
          solution: `def kelly(p, b):
    return max(0.0, p - (1 - p) / b)`,
          tests: `out = kelly(0.5, 2)
assert out is not None, "the function returns nothing yet"
assert abs(out - 0.25) < 1e-9, f"p = 0.5, b = 2 gives 0.25, got {out}"
assert abs(kelly(0.6, 1) - 0.2) < 1e-9, "p = 0.6 at even money gives 0.2"
assert kelly(0.4, 1.2) == 0, "a setup with no edge should get 0, not a negative size"
assert abs(kelly(0.3, 3) - (0.3 - 0.7 / 3)) < 1e-9, "p = 0.3, b = 3 gives about 0.067"`,
          why: 'f* = p − (1 − p) ÷ b, floored at zero because a negative size has no meaning for a setup you can only take one way. In practice you would then divide it by two or more.',
        },
        {
          kind: 'choice',
          id: 'risk-kelly-11',
          ask: 'Two traders have the same setup with a real edge. One risks 1% a trade, the other 10%. Both call it ruin if the account falls by half. Which is more likely to be ruined, and why?',
          options: [
            'The 1% trader, because small size cannot make back losses',
            'The 10% trader: seven losses in a row take them below half, while the 1% trader needs about 69',
            'Neither, because the edge is positive',
            'Both equally, since they trade the same setup',
          ],
          answer: 1,
          why: '0.9⁷ ≈ 0.48, so seven straight losses ruin the 10% trader. At 1%, it takes 69 losses (0.99⁶⁹ ≈ 0.50). A seven-loss run is common; a 69-loss run with a real edge essentially never happens.',
        },
        {
          kind: 'number',
          id: 'risk-kelly-12',
          ask: 'You risk 10% of the current account per trade. How many losses in a row take the account below half its starting value?',
          answer: 7,
          check: 'math.ceil(math.log(0.5) / math.log(0.9))',
          why: '0.9⁶ ≈ 0.53 and 0.9⁷ ≈ 0.48. Seven losses: for a setup that loses half the time, any given run of seven trades is all losers with probability 1/128, and over hundreds of trades such a run is likely.',
        },
      ],
    },
    {
      id: 'risk-stops',
      title: 'Stops and exits for options',
      summary: 'Premium stops, stops on the underlying, time stops and targets, and why none is a guarantee.',
      text: [
        'Every trade needs three exits written down before entry: where you are **wrong** (the stop), where you **take profit** (the target), and **when you give up** if nothing happens (the time stop). Deciding them later means deciding them while losing money, which is when judgement is worst.',
        'A **premium stop** exits when the option itself falls to a price, for example 40% or 50% below what you paid. It fixes the dollar loss exactly, which makes sizing easy. Its weakness: option prices move for reasons besides your idea. Wider spreads, falling implied volatility and time decay can hit the stop while the share price has barely moved.',
        'A **stop on the underlying** exits when the share or index crosses the level that proves the idea wrong, such as SPY back below the range it broke out of. It ties the exit to the reason for the trade. The option loss at that level is only an estimate: about `delta × distance` per share, moved by time decay and changing delta.',
        'A **time stop** exits if the move has not come by a set time. A bought option loses value every hour it waits (theta), so a trade that has not worked by its deadline has usually lost its reason. A **profit target** in R or at a price level stops you giving back a winner. Some traders take part off at the target and trail the rest.',
        '**A stop is not a guarantee.** A triggered stop order becomes a market order and fills at whatever price is there. In a fast market, in a trading halt or on a gap overnight, that price can be far beyond your stop. Option spreads often widen in exactly those moments. A bought option can lose at most its premium; a sold option has no such floor, and its loss past the stop can be many times the credit.',
      ],
      rules: [
        'Write the stop, the target and the time stop before you enter.',
        'Premium stops fix the dollar loss but can be hit by noise in the option price.',
        'Underlying stops tie the exit to your reason; the option loss is an estimate.',
        'A stop order becomes a market order: gaps and fast markets fill beyond it.',
        'For a bought option the worst case is the premium; for a sold one it can be far larger.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'risk-stops-1',
          ask: 'You buy a call at $4.00 with a stop at 40% below the entry price. At what option price is the stop, in dollars?',
          answer: 2.4,
          check: '4.00 * (1 - 0.40)',
          why: '40% of $4.00 is $1.60, so the stop is at $2.40.',
        },
        {
          kind: 'number',
          id: 'risk-stops-2',
          ask: 'Same trade: bought at $4.00, stop at $2.40. What is the planned loss per contract, in dollars, before fees?',
          answer: 160,
          check: '(4.00 - 2.40) * 100',
          why: '$1.60 per share × 100 shares = $160 per contract. That is the number your sizing divides into R.',
        },
        {
          kind: 'number',
          id: 'risk-stops-3',
          ask: 'You hold a call worth $2.00 with a delta of 0.40. Your stop is on the stock, $1.50 below the current price. Using delta, roughly what will the option be worth at your stop, in dollars?',
          answer: 1.4,
          check: '2.00 - 0.40 * 1.50',
          why: 'The option should fall about 0.40 × $1.50 = $0.60, to about $1.40. Delta shrinks as the call loses value, which helps a little, and time decay hurts, so treat it as a rough figure.',
        },
        {
          kind: 'choice',
          id: 'risk-stops-4',
          ask: 'You hold calls overnight with a stop order on the stock at $98. It closes at $100 and opens at $94 after bad news. What happens?',
          options: [
            'You are sold out at $98, as planned',
            'The stop triggers at the open and you sell at the price then available, near $94 or worse',
            'The stop is cancelled because the price jumped over it',
            'You lose nothing until the stock trades at $98',
          ],
          answer: 1,
          why: 'Nothing traded between $100 and $94, so the stop triggers on the first price below $98 and becomes a market order. The loss is far larger than planned. This is why positions held overnight, or into news, are sized as if the stop may not work.',
        },
        {
          kind: 'choice',
          id: 'risk-stops-5',
          ask: 'At midday you hold an option quoted $1.20 bid, $1.30 ask, with a sell stop at $1.15. For a few seconds the quote flickers to $1.05 bid, $1.45 ask while the stock barely moves. What is the risk?',
          options: [
            'None: stops only trigger on real moves in the stock',
            'The stop can trigger on the wide quote and fill you near $1.05 even though your idea was not wrong',
            'The broker will refuse to fill a stop on a wide spread',
            'You will be filled at $1.15 exactly',
          ],
          answer: 1,
          why: 'A premium stop reacts to the option price, and thin option quotes widen often. Brokers differ in what triggers an option stop, so find out how yours works. Many traders use a stop on the underlying, or an alert and a limit order, for options with wide spreads.',
        },
        {
          kind: 'number',
          id: 'risk-stops-6',
          ask: 'You buy an option at $2.00 with a stop at $1.40. Your target is 2R. At what option price is the target, in dollars?',
          answer: 3.2,
          check: '2.00 + 2 * (2.00 - 1.40)',
          why: '1R is $0.60 a share. 2R above entry is $2.00 + $1.20 = $3.20. Stating the target in R makes it consistent across trades of different sizes.',
        },
        {
          kind: 'output',
          id: 'risk-stops-7',
          ask: 'Option prices, one per bar, after entry at $2.00. What does this print?',
          code: `def first_exit(prices, stop, target, max_bars):
    for i, p in enumerate(prices):
        if p <= stop:
            return 'stop', i, p
        if p >= target:
            return 'target', i, p
        if i == max_bars:
            return 'time', i, p
    return 'end', len(prices) - 1, prices[-1]

print(*first_exit([2.0, 2.3, 2.1, 1.7, 1.35, 1.6], 1.40, 3.20, 10))`,
          answer: 'stop 4 1.35',
          why: 'The price first reaches the stop at bar 4, but at $1.35, not $1.40: the price jumped past the level. A simulation that fills you at exactly the stop price flatters the results.',
        },
        {
          kind: 'bug',
          id: 'risk-stops-8',
          ask: 'This exit check for a bought option sells on the first bar, every time. Which line is wrong?',
          code: `def check_exit(price, stop, target):
    if price >= stop:
        return 'stop'
    if price >= target:
        return 'target'
    return 'hold'`,
          line: 2,
          fix: '    if price <= stop:',
          why: 'For a long option the stop is below the entry, so it triggers when the price falls to it or lower. With >= the stop fires whenever the price is above it, which is always at entry.',
        },
        {
          kind: 'write',
          id: 'risk-stops-9',
          ask: 'Write `first_exit` for a bought option. Walk through the bar prices in order. On each bar check the stop first (price at or below), then the target (at or above), then the time stop (bar number equal to `max_bars`). Return `(reason, bar, price)` for the first exit; if none happens, return `("end", last bar, last price)`.',
          starter: `def first_exit(prices, stop, target, max_bars):
    # reasons: 'stop', 'target', 'time', 'end'
    pass`,
          solution: `def first_exit(prices, stop, target, max_bars):
    for i, p in enumerate(prices):
        if p <= stop:
            return 'stop', i, p
        if p >= target:
            return 'target', i, p
        if i == max_bars:
            return 'time', i, p
    return 'end', len(prices) - 1, prices[-1]`,
          tests: `out = first_exit([2.0, 2.3, 2.1, 1.7, 1.35, 1.6], 1.40, 3.20, 10)
assert out is not None, "the function returns nothing yet"
assert tuple(out) == ('stop', 4, 1.35), f"the stop is hit at bar 4 at 1.35, got {out}"
assert tuple(first_exit([2.0, 2.5, 3.3, 1.0], 1.40, 3.20, 10)) == ('target', 2, 3.3), "the target comes first here, at bar 2"
assert tuple(first_exit([2.0, 2.1, 1.9, 2.0, 2.05], 1.40, 3.20, 3)) == ('time', 3, 2.0), "nothing happened by bar 3: a time exit"
assert tuple(first_exit([2.0, 2.1, 2.2], 1.40, 3.20, 10)) == ('end', 2, 2.2), "no exit at all gives 'end' at the last bar"
assert tuple(first_exit([2.0, 1.40], 1.40, 3.20, 10)) == ('stop', 1, 1.40), "a price equal to the stop triggers it"`,
          why: 'The order of the checks is a choice you must make on purpose: here a bar that is both at the stop and at the time limit counts as a stop. Returning the actual price, not the stop level, keeps slippage visible in any test you build on it.',
        },
        {
          kind: 'number',
          id: 'risk-stops-10',
          ask: 'You sold a put for $1.00 with a plan to buy it back if it reaches $2.00 (a loss of $100 per contract). Overnight the stock gaps down and the put opens at $5.00. If you buy it back there, what is the loss per contract, in dollars?',
          answer: 400,
          check: '(5.00 - 1.00) * 100',
          why: '($5.00 − $1.00) × 100 = $400, four times the planned loss. For a short option a stop limits nothing in a gap. Only a bought option held as protection (a spread) puts a hard floor under the loss.',
        },
        {
          kind: 'choice',
          id: 'risk-stops-11',
          ask: 'Your plan said SPY would break out by 11:00. It is 12:30, SPY is flat, and your call is down 25%, not yet at its stop. What does the plan say to do?',
          options: [
            'Hold: the stop has not been hit',
            'Exit: the time stop has passed and the reason for the trade is gone',
            'Buy more at the lower price',
            'Move the stop lower to give it room',
          ],
          answer: 1,
          why: 'A time stop is part of the plan for exactly this case. Every hour of waiting costs theta, and the setup you traded was a breakout by 11:00. Moving the stop or adding size turns a planned small loss into an unplanned large one.',
        },
        {
          kind: 'design',
          id: 'risk-stops-12',
          ask: 'Write the full exit plan for buying a QQQ call on a breakout above a morning high, to be closed the same day.',
          checklist: [
            { point: 'Invalidation on the underlying: back below the breakout level', why: 'The stop belongs where the reason for the trade stops being true.' },
            { point: 'The maximum premium loss you accept, tied to R', why: 'It turns the chart stop into a dollar number for sizing.' },
            { point: 'A time stop, for example out by a set time if the move has not come', why: 'Bought options lose value while you wait.' },
            { point: 'A target in R or at a level, and what you do there (all out, or part out and trail)', why: 'Without a target, winners are often given back.' },
            { point: 'How the exit is executed: stop order, alert plus limit order, or bracket', why: 'Wide option spreads make the choice of order matter.' },
            { point: 'What you do if the market moves fast or halts, and a firm close before the end of the day', why: 'A stop is not a guarantee; size for the gap case.' },
          ],
          why: 'Three exits (wrong, right, too slow), how each is executed, and what happens when the market does not give you your price. With these written down, managing the trade is following a list.',
        },
      ],
    },
    {
      id: 'risk-limits',
      title: 'Limits above the trade',
      summary: 'Daily loss limits, maximum open risk, correlated positions and portfolio delta.',
      text: [
        'Sizing each trade well is not enough. Bad days come from several trades at once, or from trade after trade after a loss. Limits above the trade cap those. They are set in advance, in writing, and they are not negotiable during the session.',
        'A **daily loss limit** ends the day after a set loss, for example 3R or 2% to 3% of the account. Hit it and you stop: no more trades, whatever appears. Its value comes from being absolute. Some brokers offer tools that enforce a loss limit or lock trading; use them if yours does.',
        '**Maximum open risk** caps the sum of R over all open positions, for example 3% to 5% of the account. Three trades each risking 1% are 3% at risk at once. Before adding a trade, check that its R fits in what is left.',
        "**Correlated positions** are one bet in disguise. Calls on SPY, QQQ and a large tech stock all win and lose together when the market moves. Three 1% trades on them are close to one 3% trade on the market's direction. Count correlated positions as one when you check your limits.",
        "**Portfolio delta** adds up the direction of everything you hold. Each option's delta times 100 times the number of contracts gives its delta in shares; a long put or a short call has negative delta, a short put positive. The sum says how many shares of exposure you have, and multiplying by the share price gives the dollar delta.",
        { code: `positions = [(4, 0.30), (-1, -0.50)]   # (contracts, delta per share): 4 long calls, 1 short put
share_delta = sum(n * d * 100 for n, d in positions)
print(round(share_delta))                   # 170: like owning 170 shares` },
      ],
      rules: [
        'Set a daily loss limit, in R or percent, and stop when it is hit.',
        'Cap the total R open at once.',
        'Correlated positions count as one bet.',
        'Position delta = contracts × delta × 100. Short a put and the sign flips to positive.',
        'Limits are decided before the session and are not up for debate during it.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'risk-limits-1',
          ask: 'R is $150 and your daily loss limit is 3R. At what loss for the day do you stop, in dollars?',
          answer: 450,
          check: '3 * 150',
          why: '3 × $150 = $450. Expressing the limit in R keeps it in proportion when R changes with the account.',
        },
        {
          kind: 'number',
          id: 'risk-limits-2',
          ask: 'Your account is $20,000. You have three open trades with planned losses of $200, $150 and $250. What share of the account is at risk? Give a percentage, for example 10%.',
          answer: 0.03,
          check: '(200 + 150 + 250) / 20000',
          tol: 0.001,
          why: '$600 ÷ $20,000 = 3%. If all three stops are hit in the same move, that is the loss.',
        },
        {
          kind: 'number',
          id: 'risk-limits-3',
          ask: 'You are long 3 calls with delta 0.45 and short 2 puts with delta −0.30. What is your position delta, in shares?',
          answer: 195,
          check: '3 * 0.45 * 100 + (-2) * (-0.30) * 100',
          hint: 'A short put has the opposite sign of a long put.',
          why: 'Calls: 3 × 0.45 × 100 = 135. Short puts: −2 × −0.30 × 100 = +60. Total 195 shares. Both positions gain when the stock rises, so they add.',
        },
        {
          kind: 'number',
          id: 'risk-limits-4',
          ask: 'Your position delta is 195 shares of a stock trading at $600. What is your dollar delta, in dollars?',
          answer: 117000,
          check: '195 * 600',
          why: '195 × $600 = $117,000. A 1% move in the stock, $6, changes the position by about 195 × $6 = $1,170. A few cheap options can carry a large exposure.',
        },
        {
          kind: 'choice',
          id: 'risk-limits-5',
          ask: 'You hold calls on SPY, QQQ and AAPL, each sized to risk 1%. How should you count them against a 3% maximum open risk?',
          options: [
            'As three separate 1% trades on three different things',
            'As close to one 3% bet that the market goes up: they tend to move together',
            'As 1% in total, since they spread the risk',
            'Correlation only matters for long-term investors',
          ],
          answer: 1,
          why: 'On a day the market drops, all three stops are likely to be hit together. Spreading money across names that move together does not spread the risk.',
        },
        {
          kind: 'output',
          id: 'risk-limits-6',
          ask: 'Positions as (contracts, delta per share); negative contracts are short. What does this print?',
          code: `positions = [(2, 0.50), (-3, 0.25), (1, -0.40)]
total = 0
for n, d in positions:
    total += n * d * 100
print(round(total))`,
          answer: '-15',
          why: '2 long calls: +100. 3 short calls: −75. 1 long put: −40. Total −15 shares. The book is close to flat on direction, though each piece is not.',
        },
        {
          kind: 'bug',
          id: 'risk-limits-7',
          ask: '`day_pnl` is negative on a losing day and `limit` is a positive dollar amount. This check stops trading on almost every day, even winning ones. Which line is wrong?',
          code: `def can_trade(day_pnl, limit):
    # limit is a positive dollar amount, for example 450
    if day_pnl <= limit:
        return False
    return True`,
          line: 3,
          fix: '    if day_pnl <= -limit:',
          why: 'A loss of $450 is a P&L of −450. Comparing against +450 blocks every day with less than $450 of profit. Sign errors in risk code fail silently in the direction you least want.',
        },
        {
          kind: 'write',
          id: 'risk-limits-8',
          ask: "Write `room_for_new_risk`: the most a new trade may risk, in dollars. It is 0 if the day's loss has reached the daily limit; otherwise it is the maximum open risk (`account × max_open_pct`) minus the risk already open, and never below 0.",
          starter: `def room_for_new_risk(account, open_risks, max_open_pct, day_pnl, daily_limit):
    # open_risks: dollars at risk in each open trade
    # day_pnl: today's P&L, negative when losing   daily_limit: positive dollars
    pass`,
          solution: `def room_for_new_risk(account, open_risks, max_open_pct, day_pnl, daily_limit):
    if day_pnl <= -daily_limit:
        return 0
    return max(0, account * max_open_pct - sum(open_risks))`,
          tests: `out = room_for_new_risk(30000, [400, 350], 0.04, 0, 600)
assert out is not None, "the function returns nothing yet"
assert abs(out - 450) < 1e-6, f"4% of $30,000 is $1,200, minus $750 open leaves $450, got {out}"
assert room_for_new_risk(30000, [400, 350], 0.04, -600, 600) == 0, "at the daily limit the answer is 0"
assert room_for_new_risk(30000, [], 0.04, 200, 600) == 1200, "with nothing open and a winning day the whole cap is free"
assert room_for_new_risk(30000, [800, 600], 0.04, 0, 600) == 0, "already over the cap: 0, never negative"`,
          why: 'The daily limit is checked first because it overrides everything. The cap minus what is open gives the room, floored at zero. A real version would also count correlated trades together.',
        },
        {
          kind: 'choice',
          id: 'risk-limits-9',
          ask: 'You hit your daily loss limit at 10:40. At 11:15 the cleanest setup of the week appears. What do you do?',
          options: [
            'Take it at half size',
            'Take it: the limit is for bad setups',
            'Do not trade. Note the setup in the journal and review it tomorrow',
            'Take it on a different account',
          ],
          answer: 2,
          why: 'A limit that bends for a good-looking setup is not a limit, and after a losing morning every setup looks good. Logging it lets you see later whether it would have worked, at no cost.',
        },
        {
          kind: 'number',
          id: 'risk-limits-10',
          ask: 'Your account is $30,000 and your maximum open risk is 4%. Two trades are open, risking $400 and $350. What is the most the next trade may risk, in dollars?',
          answer: 450,
          check: '30000 * 0.04 - 400 - 350',
          why: '$1,200 − $750 = $450. If your normal R is larger than that, you trade smaller or wait for a position to close.',
        },
        {
          kind: 'choice',
          id: 'risk-limits-11',
          ask: "A trader's running P&L for one day, in R, trade by trade. Their daily limit is 3R. Which rule, kept, would have saved most of this day?",
          chart: {
            title: 'P&L through the day',
            x: 'trade',
            y: 'R',
            series: [{ name: 'running P&L', points: [0, 1, 0, -1, -2, -3, -2.5, -4, -5.5, -7], color: 'bad' }],
          },
          options: [
            'A tighter stop on each trade',
            'Stopping at −3R after the fifth trade',
            'A higher profit target on the first trade',
            'Trading more liquid options',
          ],
          answer: 1,
          why: 'The day was −3R after five trades. The next four, taken while trying to get back to even, cost another 4R. A daily limit exists for exactly this pattern.',
        },
        {
          kind: 'design',
          id: 'risk-limits-12',
          ask: 'Write the risk limits for your trading, above the level of a single trade.',
          checklist: [
            { point: 'Risk per trade, as a fraction of the account', why: 'It is the unit every other limit is measured in.' },
            { point: 'A daily loss limit in R or percent, and what you do when it is hit', why: 'It caps the worst day and stops revenge trading.' },
            { point: 'A weekly or monthly loss limit that cuts size or pauses trading', why: 'Several bad days in a row need a response of their own.' },
            { point: 'Maximum total R open at once', why: 'Several stops can be hit by one move.' },
            { point: 'How correlated positions are counted', why: 'Calls on SPY, QQQ and big tech are one bet.' },
            { point: 'A ceiling on position delta, or dollar delta, relative to the account', why: 'Options can carry large exposure for little cash.' },
            { point: 'How the limits are enforced: broker tools, a checklist, someone you report to', why: 'Limits that rely on willpower in the moment fail.' },
          ],
          why: 'Per-trade size, daily and weekly loss limits, total open risk, correlation and direction, plus a way to enforce them. Together they turn a bad day into a small one.',
        },
      ],
    },
    {
      id: 'risk-margin',
      title: 'Defined risk, undefined risk and margin',
      summary: 'Buying power is not your risk. How spreads and naked options are margined, and how accounts blow up.',
      text: [
        'A position has **defined risk** when its maximum loss is known when you open it. A bought option can lose its premium. A debit spread can lose the debit. A credit spread can lose the width between its strikes minus the credit, times 100. A position has **undefined risk** when the loss can be far larger: a naked short call (no limit), a naked short put (down to the stock going to zero), a short straddle or strangle.',
        "**Margin**, or **buying power** used, is the money the broker sets aside while you hold a position. For a bought option or a debit spread you pay in full. For a credit spread brokers usually hold the width minus the credit, which equals the maximum loss. For a naked short equity option, Cboe's standard at the time of writing (2026) is the premium plus 20% of the share price minus any out-of-the-money amount, with a floor of the premium plus 10% of the share price (calls) or 10% of the strike (puts). Brokers can and do ask for more; check yours.",
        'For naked options, **margin is not the maximum loss**. Sell a 90 put on a $100 stock for $2.00: the formula holds $1,200. The worst case is the stock going to zero, a loss of ($90 − $2) × 100 = $8,800. Sizing by buying power instead of by maximum loss lets a small account hold several times the risk it can survive.',
        'This is how accounts blow up. A trader sells many naked options because buying power allows it. A gap or a crash moves the stock through the strikes; the options rise in price and implied volatility rises with them; the margin needed goes up at the same moment the account goes down. The result is a **margin call**, and if it is not met the broker closes positions at the worst prices of the day. The account can end below zero, owing the broker money.',
        'Defined-risk structures let you size by the true worst case: `contracts = floor(R ÷ max loss per spread)`. That is the safe default for anyone learning. Undefined risk is a decision for a trader with experience, a large account and a written plan for the gap case, not a way to get more trades out of a small account.',
      ],
      rules: [
        'Defined risk: you know the maximum loss at entry. Size by it.',
        'Credit spread maximum loss = (width − credit) × 100.',
        'Margin on a naked option is a deposit, not the maximum loss.',
        'Margin requirements rise when the market moves against short options.',
        'Rules and figures here are from 2026; check your broker, which may require more.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'risk-margin-1',
          ask: 'You sell a 100 put and buy a 95 put on the same stock and expiry for a net credit of $1.20. What is the maximum loss per spread, in dollars?',
          answer: 380,
          check: '(5 - 1.20) * 100',
          why: 'Below $95 the spread is worth the full $5 width against you. You keep the $1.20 credit, so the loss is ($5 − $1.20) × 100 = $380.',
        },
        {
          kind: 'number',
          id: 'risk-margin-2',
          ask: 'Your broker holds the maximum loss as margin for that credit spread. How much buying power do 3 spreads use, in dollars?',
          answer: 1140,
          check: '3 * (5 - 1.20) * 100',
          why: '3 × $380 = $1,140. For defined-risk spreads, the buying power used and the worst case are the same number.',
        },
        {
          kind: 'number',
          id: 'risk-margin-3',
          ask: 'A stock is at $50. You sell one naked 45 put for $1.00. Using the formula in the text (premium plus 20% of the share price minus the out-of-the-money amount, at least premium plus 10% of the strike), what margin is required, in dollars?',
          answer: 600,
          check: 'max(1.00 * 100 + (0.20 * 50 - (50 - 45)) * 100, 1.00 * 100 + 0.10 * 45 * 100)',
          why: 'Main formula: $100 + ($10 − $5) × 100 = $600. Floor: $100 + $450 = $550. The larger, $600, applies. Your broker may ask for more.',
        },
        {
          kind: 'number',
          id: 'risk-margin-4',
          ask: 'Same naked 45 put sold for $1.00. What is the maximum loss if the stock goes to zero, in dollars?',
          answer: 4400,
          check: '(45 - 1.00) * 100',
          why: '($45 − $1) × 100 = $4,400, more than seven times the $600 of margin. Margin covers a typical bad day, not the worst one.',
        },
        {
          kind: 'choice',
          id: 'risk-margin-5',
          ask: 'A $10,000 account has enough buying power to sell 12 naked puts like the one above. Why is that a dangerous way to size?',
          options: [
            'It is not: the broker would not allow it if it were dangerous',
            'Buying power is set for normal moves; a gap can cost far more than the margin and more than the whole account',
            'Because naked puts can only be sold in cash accounts',
            'Because the premium collected is too small to matter',
          ],
          answer: 1,
          why: '12 puts at a $4,400 worst case is $52,800 of risk on a $10,000 account. A 20% gap, from $50 to $40, would put each put about $5 in the money: roughly $4,800 lost across the twelve, half the account in one morning. Brokers margin for ordinary risk; surviving the extraordinary is your job.',
        },
        {
          kind: 'number',
          id: 'risk-margin-6',
          ask: 'R is $400. How many of the credit spreads with a maximum loss of $380 can you sell?',
          answer: 1,
          check: '400 // 380',
          why: 'One spread risks $380, which fits; two would risk $760. Sizing a spread is the same rule as any trade: R ÷ worst case, rounded down.',
        },
        {
          kind: 'choice',
          id: 'risk-margin-7',
          ask: 'You are short naked SPY puts when the market falls sharply and implied volatility jumps. What happens to the margin required?',
          options: [
            'It stays fixed at what it was when you opened the trade',
            'It rises, because the puts are worth more and closer to the money, at the same time as your account value falls',
            'It falls, because the puts are now in the money',
            'It disappears once the trade is losing',
          ],
          answer: 1,
          why: 'Margin is recalculated as prices move. Higher option prices and a smaller out-of-the-money amount raise the requirement while losses shrink the account. That squeeze produces margin calls and forced selling near the lows.',
        },
        {
          kind: 'output',
          id: 'risk-margin-8',
          ask: 'What does this print?',
          code: `def naked_put_margin(price, strike, premium):
    otm = max(0, price - strike)
    main = premium * 100 + (0.20 * price - otm) * 100
    floor = premium * 100 + 0.10 * strike * 100
    return round(max(main, floor))

print(naked_put_margin(50, 45, 1.00), naked_put_margin(100, 80, 0.50))`,
          answer: '600 850',
          why: 'The first is the case worked above. For the second, the put is $20 out of the money, so the main formula gives $50 + ($20 − $20) × 100 = $50, and the floor of $50 + $800 = $850 applies. Far out-of-the-money puts are held at the 10% floor.',
        },
        {
          kind: 'bug',
          id: 'risk-margin-9',
          ask: 'This should give the maximum loss of a credit spread. For a $5 wide spread sold for $1.20 it says $620. Which line is wrong?',
          code: `def credit_spread_max_loss(short_strike, long_strike, credit):
    width = abs(short_strike - long_strike)
    loss = width * 100 + credit * 100
    return loss`,
          line: 3,
          fix: '    loss = width * 100 - credit * 100',
          why: 'You keep the credit whatever happens, so it reduces the loss: ($5 − $1.20) × 100 = $380. Adding it overstates the loss, which errs on the safe side but makes every spread look worse than it is and sizes you too small.',
        },
        {
          kind: 'write',
          id: 'risk-margin-10',
          ask: 'Write `naked_put_margin` per contract, using the formula from the text: the larger of premium × 100 + (20% of the price − the out-of-the-money amount) × 100, and premium × 100 + 10% of the strike × 100. Round to whole dollars.',
          starter: `def naked_put_margin(price, strike, premium):
    # a put is out of the money by (price - strike) when price is above strike
    pass`,
          solution: `def naked_put_margin(price, strike, premium):
    otm = max(0, price - strike)
    main = premium * 100 + (0.20 * price - otm) * 100
    floor = premium * 100 + 0.10 * strike * 100
    return round(max(main, floor))`,
          tests: `out = naked_put_margin(50, 45, 1.00)
assert out is not None, "the function returns nothing yet"
assert out == 600, f"a 45 put on a $50 stock for $1.00 needs $600, got {out}"
assert naked_put_margin(100, 80, 0.50) == 850, "far out of the money, the 10% of strike floor applies: $850"
assert naked_put_margin(100, 105, 6.00) == 2600, "an in-the-money put has no out-of-the-money amount: $600 + $2,000"
assert naked_put_margin(200, 190, 2.00) == 3200, "a 190 put on a $200 stock for $2.00 needs $3,200"`,
          why: "Two formulas and the larger of them. The out-of-the-money amount is never negative: an in-the-money put has none to subtract. A broker may apply a higher rate than this; the code shows the shape of the rule, not your broker's number.",
        },
        {
          kind: 'number',
          id: 'risk-margin-11',
          ask: 'You sold a naked 105 call for $1.00 on a stock at $100. After a takeover bid it opens at $130. Buying the call back for its intrinsic value, what is the loss per contract, in dollars?',
          answer: 2400,
          check: '((130 - 105) - 1.00) * 100',
          why: 'The call is worth at least $25. ($25 − $1) × 100 = $2,400, 24 times the credit. With a naked call there is no ceiling: a bigger jump means a bigger loss.',
        },
        {
          kind: 'design',
          id: 'risk-margin-12',
          ask: 'A friend with a $12,000 account plans to sell naked SPX puts expiring the same day, "for income", using all the buying power. Write your review of the plan.',
          checklist: [
            { point: 'Work out the worst case per contract and in total, not the margin', why: 'Margin hides the loss in a crash or a sharp intraday fall.' },
            { point: 'Compare the total worst case with the account', why: 'If one bad day can exceed the account, the plan can end in debt.' },
            { point: 'Ask what happens in a fast fall: stops, spreads widening, margin rising', why: 'Same-day options react to the index very fast near the strike.' },
            { point: 'Suggest a defined-risk version, such as a put credit spread', why: 'A bought put below caps the loss and lets them size by it.' },
            { point: 'Size by R ÷ maximum loss, not by buying power', why: 'It ties the trade to what the account can lose.' },
            { point: 'Count the expectancy after costs, including the rare large loss', why: 'Steady small wins can hide a negative expectancy.' },
            { point: "Paper trade first and check the broker's rules for this product", why: 'Margin and approval rules differ by broker and product.' },
          ],
          why: 'Selling premium is a real strategy with a real tail. The review asks for the worst case, a defined-risk version and sizing by maximum loss, and refuses to let buying power stand in for risk.',
        },
      ],
    },
    {
      id: 'risk-lab',
      title: 'Lab: a Monte Carlo account simulator',
      summary: 'Simulate thousands of accounts from a win rate and a payoff, and see what size does to drawdown and ruin.',
      text: [
        'Expectancy says what happens on average. Your account lives one path, not the average. A **Monte Carlo simulation** draws many possible sequences of trades from the same win rate and payoff and shows the spread of outcomes: how deep the drawdowns go, and how many accounts are ruined at each size.',
        'You build it in steps with NumPy: trade results in R from a random generator with a fixed seed, an equity curve under fixed fractional sizing, the maximum drawdown, thousands of paths at once, and the share of paths that fall below a ruin level. Each step is tested on its own.',
        'The model is simple on purpose: a fixed win rate, wins of exactly `payoff` R and losses of exactly 1R, trades independent of each other. Real trading has gaps beyond the stop, costs, and an edge that changes. So the simulation is optimistic, and it still shows clearly what size does.',
        'With a 45% win rate and 1.5R wins (expectancy +0.125R), risking 1% a trade almost never halves the account in 200 trades. Risking 10% halves it in nearly half of all paths, with the same trades. That is the lesson of the whole module in one table.',
      ],
      rules: [
        'Fix the random seed so results can be repeated and checked.',
        'Equity under fixed fractional sizing: multiply by (1 + f × R multiple) each trade.',
        'Drawdown is measured from the running peak: `np.maximum.accumulate`.',
        'Look at the spread of paths and the share ruined, not only the average.',
        'The simple model is optimistic: no gaps, no costs, a constant edge.',
      ],
      questions: [
        {
          kind: 'write',
          id: 'risk-lab-1',
          numpy: true,
          ask: 'Step 1: trade results. Return an array of `n` R multiples: `payoff` with probability `win_rate`, otherwise −1. Use the generator `rng` you are given (`rng.random(n)` gives n numbers between 0 and 1).',
          starter: `import numpy as np

def trade_results(n, win_rate, payoff, rng):
    # returns a float array of length n with values payoff or -1.0
    pass`,
          solution: `import numpy as np

def trade_results(n, win_rate, payoff, rng):
    wins = rng.random(n) < win_rate
    return np.where(wins, payoff, -1.0)`,
          tests: `out = trade_results(10000, 0.4, 2.0, np.random.default_rng(0))
assert out is not None, "the function returns nothing yet"
assert len(out) == 10000, f"one result per trade: expected 10000, got {len(out)}"
assert set(np.unique(out)) <= {2.0, -1.0}, f"results should be 2.0 or -1.0 only, got {np.unique(out)}"
share = np.mean(out == 2.0)
assert abs(share - 0.4) < 0.02, f"about 40% should be wins, got {share:.3f}"
a = trade_results(50, 0.5, 1.5, np.random.default_rng(7))
b = trade_results(50, 0.5, 1.5, np.random.default_rng(7))
assert np.array_equal(a, b), "the same seed must give the same trades: use the rng you are given"`,
          why: 'A uniform number below `win_rate` happens with probability `win_rate`, so it marks a win. `np.where` picks the payoff or −1 for every trade at once. Passing the generator in, rather than creating one inside, lets the caller fix the seed.',
        },
        {
          kind: 'write',
          id: 'risk-lab-2',
          numpy: true,
          ask: 'Step 2: one equity curve. Starting from `start`, each trade multiplies the account by `1 + risk_frac × r`. Return the curve including the starting value, so it has one more entry than there are trades.',
          starter: `import numpy as np

def equity_curve(start, r, risk_frac):
    # r: R multiples of each trade, in order
    pass`,
          solution: `import numpy as np

def equity_curve(start, r, risk_frac):
    growth = np.cumprod(1 + risk_frac * np.asarray(r, dtype=float))
    return np.concatenate([[start], start * growth])`,
          tests: `out = equity_curve(10000, [1, -1, 2], 0.01)
assert out is not None, "the function returns nothing yet"
assert len(out) == 4, f"3 trades give 4 values including the start, got {len(out)}"
assert np.allclose(out, [10000, 10100, 9999, 10198.98]), f"expected [10000, 10100, 9999, 10198.98], got {list(out)}"
assert np.allclose(equity_curve(5000, [], 0.02), [5000]), "no trades: the curve is the start alone"
assert np.allclose(equity_curve(100, [-1] * 3, 0.5), [100, 50, 25, 12.5]), "each loss takes half of what is left at 50% risk"`,
          hint: '`np.cumprod` gives the running product of the growth factors.',
          why: 'Fixed fractional sizing compounds: every trade risks a fraction of the current account, so the curve is a running product. The 1% loss after a win is 1% of $10,100, which is why the account ends that trade at $9,999 and not $10,000.',
        },
        {
          kind: 'output',
          id: 'risk-lab-3',
          ask: 'Step 3: check the curve by hand. What does this print?',
          code: `import numpy as np

def equity_curve(start, r, risk_frac):
    growth = np.cumprod(1 + risk_frac * np.asarray(r, dtype=float))
    return np.concatenate([[start], start * growth])

curve = equity_curve(10000, [1, -1, 2], 0.01)
print([round(float(x), 2) for x in curve])`,
          answer: '[10000.0, 10100.0, 9999.0, 10198.98]',
          why: '+1R at 1% makes $10,100. −1R takes 1% of that, $101, leaving $9,999. +2R adds 2% of $9,999, $199.98. Working one small case by hand before trusting thousands of simulated ones is how you catch the bugs.',
        },
        {
          kind: 'write',
          id: 'risk-lab-4',
          numpy: true,
          ask: 'Step 4: maximum drawdown with NumPy. Return the largest fall from the running peak as a fraction of that peak. Use `np.maximum.accumulate` for the running peak.',
          starter: `import numpy as np

def max_drawdown(curve):
    # curve: a 1-D array of account values
    pass`,
          solution: `import numpy as np

def max_drawdown(curve):
    curve = np.asarray(curve, dtype=float)
    peaks = np.maximum.accumulate(curve)
    return float(((peaks - curve) / peaks).max())`,
          tests: `out = max_drawdown(np.array([100, 120, 90, 110, 130, 95, 140]))
assert out is not None, "the function returns nothing yet"
assert abs(out - 35 / 130) < 1e-9, f"the largest fall is 130 to 95, 26.9%, got {out}"
assert max_drawdown(np.array([1.0, 2.0, 3.0])) == 0, "a rising curve has no drawdown"
assert abs(max_drawdown([100, 50, 200, 150]) - 0.5) < 1e-9, "it should also accept a list, and find the 50% fall"`,
          why: '`np.maximum.accumulate` gives the highest value so far at every point. The gap from it, divided by it, is the drawdown at each point, and the largest of those is the maximum drawdown. Same idea as the loop, without one.',
        },
        {
          kind: 'bug',
          id: 'risk-lab-5',
          ask: 'Step 5: this drawdown is too large. For `[100, 50]` it reports 1.0, a total loss, instead of 0.5. Which line is wrong?',
          code: `import numpy as np

def max_drawdown(curve):
    curve = np.asarray(curve, dtype=float)
    peaks = np.maximum.accumulate(curve)
    return float(((peaks - curve) / curve).max())`,
          line: 6,
          fix: '    return float(((peaks - curve) / peaks).max())',
          why: 'Drawdown is the fall as a share of the peak. Dividing by the current value gives the gain needed to recover instead: 50 ÷ 50 = 100%. Both numbers are useful, and mixing them up makes every deep drawdown look far worse than it is.',
        },
        {
          kind: 'write',
          id: 'risk-lab-6',
          numpy: true,
          ask: 'Step 6: many paths at once. Return an array of shape `(n_paths, n_trades + 1)`: each row an equity curve starting at `start`. Draw all the results with one call, `rng.random((n_paths, n_trades))`, from `np.random.default_rng(seed)`.',
          starter: `import numpy as np

def simulate(n_paths, n_trades, win_rate, payoff, risk_frac, seed, start=10000.0):
    pass`,
          solution: `import numpy as np

def simulate(n_paths, n_trades, win_rate, payoff, risk_frac, seed, start=10000.0):
    rng = np.random.default_rng(seed)
    wins = rng.random((n_paths, n_trades)) < win_rate
    r = np.where(wins, payoff, -1.0)
    growth = np.cumprod(1 + risk_frac * r, axis=1)
    return np.hstack([np.full((n_paths, 1), start), start * growth])`,
          tests: `out = simulate(500, 100, 0.5, 1.0, 0.02, seed=3)
assert out is not None, "the function returns nothing yet"
assert out.shape == (500, 101), f"expected shape (500, 101), got {out.shape}"
assert np.all(out[:, 0] == 10000), "every path starts at 10000"
steps = out[:, 1:] / out[:, :-1]
assert np.allclose(np.unique(np.round(steps, 9)), [0.98, 1.02]), "each step should be x0.98 or x1.02 at 2% risk and 1 to 1"
assert np.array_equal(out, simulate(500, 100, 0.5, 1.0, 0.02, seed=3)), "the same seed must give the same paths"
assert not np.array_equal(out[0], out[1]), "the paths should differ from each other"`,
          hint: '`np.cumprod(..., axis=1)` runs along each row. `np.hstack` puts the column of starting values in front.',
          why: 'One random draw for the whole table and one running product along each row. Thousands of paths take a fraction of a second, which is why there is no excuse for not running this before choosing a size.',
        },
        {
          kind: 'write',
          id: 'risk-lab-7',
          numpy: true,
          ask: 'Step 7: the share ruined. Return the fraction of paths (rows) whose lowest value is at or below `level × start`, where `start` is the first column.',
          starter: `import numpy as np

def ruin_share(curves, level=0.5):
    # curves: (n_paths, n_steps), first column is the start
    pass`,
          solution: `import numpy as np

def ruin_share(curves, level=0.5):
    start = curves[:, 0]
    return float(np.mean(curves.min(axis=1) <= level * start))`,
          tests: `curves = np.array([[100, 80, 60, 70], [100, 40, 90, 120], [100, 110, 50, 150], [100, 90, 95, 99]], dtype=float)
out = ruin_share(curves)
assert out is not None, "the function returns nothing yet"
assert abs(out - 0.5) < 1e-9, f"paths 2 and 3 touch 50 or below, so 0.5, got {out}"
assert abs(ruin_share(curves, level=0.7) - 0.75) < 1e-9, "at a 30% ruin level three of four paths are ruined"
assert ruin_share(curves, level=0.3) == 0, "no path falls to 30"`,
          why: 'Ruin counts a path that touched the level at any point, even if it later recovered, as path 3 does. A trader who was down 50% at some point often stopped there, whatever the simulation did next.',
        },
        {
          kind: 'choice',
          id: 'risk-lab-8',
          run: true,
          ask: 'Step 8: the same 2,000 paths of 200 trades (45% wins, 1.5R payoff, expectancy +0.125R) at three sizes. Which output does this print? Each line is the risk per trade and the share of paths that touched half the starting account.',
          code: `import numpy as np

def simulate(n_paths, n_trades, win_rate, payoff, risk_frac, seed):
    rng = np.random.default_rng(seed)
    wins = rng.random((n_paths, n_trades)) < win_rate
    r = np.where(wins, payoff, -1.0)
    return 10000 * np.cumprod(1 + risk_frac * r, axis=1)

for f in [0.01, 0.05, 0.10]:
    curves = simulate(2000, 200, 0.45, 1.5, f, 1)
    print(f, round(float(np.mean(curves.min(axis=1) <= 5000)), 2))`,
          options: ['0.01 0.0\n0.05 0.14\n0.1 0.48', '0.01 0.0\n0.05 0.0\n0.1 0.0', '0.01 0.05\n0.05 0.05\n0.1 0.05', '0.01 0.48\n0.05 0.14\n0.1 0.0'],
          answer: 0,
          why: 'Same trades, same edge. At 1% no path halves; at 5% about one in seven does; at 10% almost half. The 10% paths do have a higher median at the end, which is exactly the trap: the typical outcome looks better while the chance of ruin climbs.',
        },
        {
          kind: 'design',
          id: 'risk-lab-9',
          ask: 'Step 9: you want to use this simulator to choose your own risk per trade. What do you feed it, what do you look at, and what does it leave out?',
          checklist: [
            { point: 'Feed it a win rate and payoff from your journal, then also worse ones', why: 'Your estimates are noisy; test the size against an edge smaller than you think.' },
            { point: 'Look at the spread of maximum drawdowns, for example the worst 5% of paths', why: 'You must survive the bad paths, not the average one.' },
            { point: 'Look at the share of paths that hit your personal ruin level', why: 'Ruin is where you would stop, which may be well before zero.' },
            { point: 'Pick the size where those numbers are ones you could live through', why: 'A plan you abandon in a drawdown is worth nothing.' },
            { point: 'Add costs per trade and occasional losses larger than 1R', why: 'Gaps past stops and fees make the real world worse than the model.' },
            { point: 'Note that it assumes independent trades and a constant edge', why: 'Real losses cluster and edges fade, so read the results as a best case.' },
          ],
          why: 'The simulator turns a win rate and a payoff into a picture of drawdowns and ruin at each size. Fed with honest, even pessimistic, numbers it is one of the best tools a new trader has for choosing size.',
        },
      ],
    },
  ],
}
