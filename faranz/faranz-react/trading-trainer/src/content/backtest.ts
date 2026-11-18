import type { Module } from '../types'

export const backtest: Module = {
  id: 'backtest',
  title: 'Testing an edge',
  summary:
    'Finding out whether a setup works before it costs money: journals, the statistics of a trade list, luck, honest backtests in Python, out-of-sample tests and options without option data.',
  lessons: [
    {
      id: 'backtest-journal',
      title: 'The trading journal',
      summary: 'A record of every trade, measured in R, tagged by setup, written before you know how it ends.',
      text: [
        'Every test of an edge ends in the same place: a list of trades you can measure. A backtest makes that list from past prices and your rules. A **journal** makes it from the trades you really took, paper or live. Without one you remember the wins, explain away the losses, and cannot say whether anything works.',
        'Record each trade in the same fields: date and time, ticker, setup tag, long or short, the instrument (for an option: strike, expiry, call or put), entry, stop, target, size, exit, fees, net P&L in dollars, the risk you planned at entry, the **R multiple**, whether you followed the plan, the underlying price at entry and exit, a screenshot and one line of notes.',
        'The **R multiple** is net P&L divided by the risk you planned at entry: `R = (P&L − fees) ÷ planned risk`. Planned risk is the distance from entry to stop times the size, or for a bought option the premium you would lose at your stop. A trade that risked $200 and made $300 is +1.5R. R puts a $50 trade and a $500 trade, a share trade and an option trade, on one scale.',
        'Give every trade one **setup tag** from a short fixed list (`orb`, `vwap-pullback`, `fade`) so you can group trades later, and separate **mistake tags** (`late-entry`, `moved-stop`, `no-setup`). Statistics by tag tell you which setup carries the account and what each kind of mistake costs.',
        'Write the plan (setup, entry, stop, target, reason) before the trade is closed. Once you know the outcome, memory rewrites the reason. If you moved your stop and lost three times what you planned, the trade is −3R, not −1R: that is the number that shows the mistake.',
      ],
      rules: [
        'Record every trade, including the ones you would rather forget.',
        'R = net P&L ÷ risk planned at entry. Fees come out before you divide.',
        'Write the plan and the reason before the outcome is known.',
        'One setup tag per trade from a fixed list; mistakes get their own tags.',
        'For options, record the underlying price too, so you can tell a wrong view from a bad fill.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'backtest-journal-1',
          ask: 'You buy 2 SPY call contracts at $1.50 with a stop at $1.00 on the premium, and sell them at $2.25. Ignoring fees, what is the trade in R?',
          answer: 1.5,
          check: '(2.25 - 1.50) * 100 * 2 / ((1.50 - 1.00) * 100 * 2)',
          hint: 'Planned risk is the premium you would lose at the stop, times 100, times 2 contracts.',
          why: 'Planned risk is $0.50 × 100 × 2 = $100. The profit is $0.75 × 100 × 2 = $150. $150 ÷ $100 = +1.5R. The multiplier and the number of contracts cancel, so per-share prices give the same answer.',
        },
        {
          kind: 'number',
          id: 'backtest-journal-2',
          ask: 'You buy 100 shares of QQQ at $400.00 with a stop at $398.00 and sell at $403.00. Commissions and fees for the round trip are $2. What is the trade in R? Give two decimals.',
          answer: 1.49,
          tol: 0.004,
          check: '((403 - 400) * 100 - 2) / ((400 - 398) * 100)',
          why: 'Planned risk is $2.00 × 100 = $200. Net P&L is $300 − $2 = $298. $298 ÷ $200 = 1.49R. Small, but across hundreds of trades fees add up, so they come out of every trade.',
        },
        {
          kind: 'choice',
          id: 'backtest-journal-3',
          ask: 'You planned to risk $150 on a trade. When price reached your stop you moved it lower, and you finally closed for a $450 loss. What do you record?',
          options: [
            '−1R, because the stop was eventually hit',
            '−3R, measured against the $150 you planned to risk',
            'Nothing: it was a mistake, not a real setup, so it would distort the statistics',
            '−1R, and a note that the loss was larger',
          ],
          answer: 1,
          why: 'R is always measured against the risk planned at entry: −$450 ÷ $150 = −3R. Recording −1R hides exactly what the journal is for. Leaving the trade out is worse: your account paid for it, so your statistics must too. Tag it `moved-stop`.',
        },
        {
          kind: 'choice',
          id: 'backtest-journal-4',
          ask: 'Why write the reason for a trade in the journal before you know how it ended?',
          options: [
            'Brokers require it',
            'After the outcome, memory rewrites the reason: losers become "I had doubts" and winners become "I knew it"',
            'So the screenshot has a caption',
            'It makes no difference when you write it',
          ],
          answer: 1,
          why: 'Hindsight bias is strong. A reason written after the result is fitted to the result, which makes every winner look like skill and every loser look like bad luck. The journal then teaches you nothing.',
        },
        {
          kind: 'output',
          id: 'backtest-journal-5',
          ask: 'Each pair is (net P&L, planned risk) in dollars. What does this print?',
          code: `trades = [(150, 100), (-100, 100), (-50, 100), (300, 150)]
r = [round(pnl / risk, 2) for pnl, risk in trades]
print(r)`,
          answer: '[1.5, -1.0, -0.5, 2.0]',
          why: 'Each P&L divided by its own planned risk. The −0.5R trade was closed before the stop, which R shows and dollars alone would not. The last trade made the most dollars partly because it risked more: R takes size out.',
        },
        {
          kind: 'bug',
          id: 'backtest-journal-6',
          ask: 'This should give the R multiple of a long trade, net of fees. Every trade comes out slightly better than it should.',
          code: `def r_multiple(entry, stop, exit, qty, fees):
    risk = (entry - stop) * qty
    pnl = (exit - entry) * qty + fees
    return pnl / risk`,
          line: 3,
          fix: '    pnl = (exit - entry) * qty - fees',
          why: 'Fees are a cost: they are subtracted. Adding them flatters every trade, and on a setup whose edge is a few hundredths of an R, that sign can turn a losing record into a winning one.',
        },
        {
          kind: 'output',
          id: 'backtest-journal-7',
          ask: 'Total R by setup tag. What does this print?',
          code: `trades = [('orb', 1.5), ('vwap', -1.0), ('orb', -1.0), ('fade', 2.0), ('orb', 0.5)]
total = {}
for tag, r in trades:
    total[tag] = total.get(tag, 0) + r
print(total)`,
          answer: "{'orb': 1.0, 'vwap': -1.0, 'fade': 2.0}",
          why: 'orb is 1.5 − 1.0 + 0.5 = 1.0. Dictionaries keep the order in which keys first appear. Totals by tag are the first step to seeing which setup pays, though five trades say nothing yet.',
        },
        {
          kind: 'write',
          id: 'backtest-journal-8',
          ask: 'Write `r_multiple` for both long and short trades. The trade is long when the stop is below the entry and short when it is above. Return the R multiple net of fees.',
          starter: `def r_multiple(entry, stop, exit, qty, fees):
    # long if stop < entry, short if stop > entry
    # R = (P&L - fees) / planned risk
    pass`,
          solution: `def r_multiple(entry, stop, exit, qty, fees):
    side = 1 if stop < entry else -1
    risk = abs(entry - stop) * qty
    pnl = side * (exit - entry) * qty - fees
    return pnl / risk`,
          tests: `out = r_multiple(100, 98, 103, 100, 0)
assert out is not None, "the function returns nothing yet"
assert abs(out - 1.5) < 1e-9, f"long from 100, stop 98, out at 103 is +1.5R, got {out}"
assert abs(r_multiple(100, 98, 103, 100, 2) - 1.49) < 1e-9, "fees of $2 on a $200 risk take 0.01R off"
assert abs(r_multiple(50, 51, 48, 10, 0) - 2.0) < 1e-9, "short from 50 with a stop at 51, covered at 48, is +2R"
assert abs(r_multiple(50, 51, 51.5, 10, 0) + 1.5) < 1e-9, "a short that is stopped out late at 51.5 is -1.5R"
assert r_multiple(100, 98, 98, 100, 0) == -1, "a long stopped exactly at its stop is -1R"`,
          hint: 'Work out a side of +1 or −1 from where the stop is, and multiply the price change by it.',
          why: 'A short profits when price falls, so its price change is flipped. Risk is the distance to the stop whichever side it is on. One function for both sides means one formula to check rather than two to keep in step.',
        },
        {
          kind: 'write',
          id: 'backtest-journal-9',
          ask: 'Group a journal by setup tag. Return a dict from each tag to a pair: the number of trades and the average R, rounded to 2 decimals.',
          starter: `def by_tag(trades):
    # trades: a list of (tag, r) pairs
    # returns {tag: (count, average r rounded to 2 places)}
    pass`,
          solution: `def by_tag(trades):
    groups = {}
    for tag, r in trades:
        groups.setdefault(tag, []).append(r)
    return {tag: (len(rs), round(sum(rs) / len(rs), 2)) for tag, rs in groups.items()}`,
          tests: `trades = [('orb', 1.5), ('vwap', -1.0), ('orb', -1.0), ('fade', 2.0), ('orb', 0.5), ('vwap', 0.4)]
out = by_tag(trades)
assert out is not None, "the function returns nothing yet"
assert set(out) == {'orb', 'vwap', 'fade'}, f"one entry per tag, got {sorted(out)}"
assert out['orb'] == (3, 0.33), f"orb has 3 trades averaging 1.0 / 3 = 0.33, got {out['orb']}"
assert out['vwap'] == (2, -0.3), f"vwap has 2 trades averaging -0.3, got {out['vwap']}"
assert out['fade'] == (1, 2.0), f"fade has 1 trade of 2.0, got {out['fade']}"
assert by_tag([]) == {}, "an empty journal gives an empty dict"`,
          why: 'Collect the R values per tag, then count and average each group. Showing the count beside the average matters: an average of 2.0R from one trade is an anecdote, not a statistic.',
        },
        {
          kind: 'choice',
          id: 'backtest-journal-10',
          ask: 'You journal option trades with the option prices only. A call trade lost 0.8R. Which extra fields would let you tell whether the loss came from the stock moving against you or from the spread and time decay?',
          options: [
            'The account balance before and after',
            'The underlying price and the option bid and ask at entry and at exit',
            'The time of day only',
            'The number of contracts',
          ],
          answer: 1,
          why: 'With the underlying prices you know how far the stock moved. With the bid and ask you know what the spread cost. Whatever is left over is decay and changes in implied volatility. Without them every option loss looks the same.',
        },
        {
          kind: 'design',
          id: 'backtest-journal-11',
          ask: 'Design the journal you will keep for paper trading SPY options. List the fields of one row and the rules for filling it in.',
          checklist: [
            { point: 'Date, time in and out, ticker, long or short, call or put, strike and expiry', why: 'You need to group by time of day and by contract type later, and to find the trade on a chart.' },
            { point: 'A setup tag from a fixed list, and separate mistake tags', why: 'Free-text setups cannot be grouped, and mixing mistakes into setup names hides what each costs.' },
            { point: 'Entry, stop and target written before entry, and the planned risk in dollars', why: 'R is measured against the planned risk, and a plan written afterwards is fitted to the outcome.' },
            { point: 'Exit price, size, fees and net P&L', why: 'The statistics must be net of costs, and size is needed to turn dollars into R.' },
            { point: 'The R multiple', why: 'It puts trades of different size and instrument on one scale.' },
            { point: 'Underlying price and the option bid and ask at entry and exit', why: 'They separate a wrong view from a bad fill or decay.' },
            { point: 'Followed the plan: yes or no, a screenshot and one line of notes', why: 'Rule breaks are measured separately from the setup, and the screenshot lets you review the trade without memory.' },
            { point: 'Every trade goes in, the same day', why: 'A journal with the bad trades missing measures a strategy you do not trade.' },
          ],
          why: 'A journal is the data for every statistic in the rest of this module. Fields you do not record now cannot be analysed later.',
        },
      ],
    },
    {
      id: 'backtest-stats',
      title: 'Statistics of a trade list',
      summary: 'Win rate, average R, expectancy, profit factor and maximum drawdown, computed from a list of R multiples.',
      widget: 'backtest-order',
      text: [
        'Given a list of trades in R, a handful of numbers describe it. **Win rate**: the share of trades with R above zero. **Average win** and **average loss**. **Expectancy**: the average R per trade, the same thing as `win rate × average win − loss rate × average loss` (the risk module derived it). Decide in advance how you count scratches at 0R; here they are not wins.',
        '**Profit factor** is gross wins divided by gross losses, both as positive numbers. Above 1 the list made money, below 1 it lost. It is useful beside expectancy because it shows how much room there is: a profit factor of 1.05 can be erased by costs you forgot.',
        '**Maximum drawdown** is the largest fall of the equity curve from a peak to a later low. Build the curve as the running total of R, starting at 0, keep the running peak, and take the largest gap between the peak and the curve. Starting at 0 matters: if the first trades lose, that is a drawdown from your starting balance.',
        { code: `import numpy as np

r = np.array([1.0, -1.0, -1.0, 2.0, -1.0])
equity = np.concatenate([[0], np.cumsum(r)])    # [0, 1, 0, -1, 1, 0]
peak = np.maximum.accumulate(equity)            # [0, 1, 1, 1, 1, 1]
max_dd = (peak - equity).max()                  # 2.0` },
        'Win rate, expectancy and profit factor do not depend on the order of the trades. Drawdown does. The same trades in a different order can have a much deeper drawdown, and the future will not deliver them in the order of your backtest. Treat the backtest drawdown as a low guess of what you will live through.',
      ],
      rules: [
        'Win rate counts R > 0. Decide how scratches count, and keep to it.',
        'Expectancy is the mean R per trade.',
        'Profit factor = gross wins ÷ gross losses. Close to 1 means little room for costs.',
        'Drawdown: running total from 0, minus its running peak. Take the deepest point.',
        'Order changes the drawdown, not the expectancy. Expect worse drawdowns than the backtest shows.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'backtest-stats-1',
          ask: 'A trade list in R: 2, −1, −1, 3, −1, 0.5, −1, 2. What is the win rate? Give a percentage, for example 25%.',
          answer: 0.5,
          check: 'np.mean(np.array([2, -1, -1, 3, -1, 0.5, -1, 2]) > 0)',
          why: 'Four trades are above zero (2, 3, 0.5, 2) out of eight: 50%.',
        },
        {
          kind: 'number',
          id: 'backtest-stats-2',
          ask: 'Same list: 2, −1, −1, 3, −1, 0.5, −1, 2. What is the expectancy in R per trade? Give two decimals.',
          answer: 0.44,
          tol: 0.006,
          check: 'np.mean([2, -1, -1, 3, -1, 0.5, -1, 2])',
          why: 'The total is 7.5 − 4 = 3.5R over 8 trades, so 0.4375R per trade. Check by the other route: 0.5 × 1.875 − 0.5 × 1 = 0.4375.',
        },
        {
          kind: 'number',
          id: 'backtest-stats-3',
          ask: 'Same list: 2, −1, −1, 3, −1, 0.5, −1, 2. What is the profit factor? Give two decimals.',
          answer: 1.88,
          tol: 0.006,
          check: '(2 + 3 + 0.5 + 2) / 4',
          why: 'Gross wins are 7.5R, gross losses 4R. 7.5 ÷ 4 = 1.875.',
        },
        {
          kind: 'number',
          id: 'backtest-stats-4',
          ask: 'A trade list in R: 1, 2, −1, −1, −2, 1, −1, 3. What is the maximum drawdown in R?',
          answer: 4,
          check: '(lambda e: (np.maximum.accumulate(e) - e).max())(np.concatenate([[0], np.cumsum([1, 2, -1, -1, -2, 1, -1, 3])]))',
          hint: 'Write the running total after each trade, then find the biggest fall from a high to a later low.',
          why: 'The running total goes 1, 3, 2, 1, −1, 0, −1, 2. The peak is 3 and the lowest point after it is −1: a fall of 4R. The list ends up 2R, but you had to sit through −4R to get there.',
        },
        {
          kind: 'number',
          id: 'backtest-stats-5',
          ask: 'Your account peaks at $12,000 and later falls to $9,000 before recovering. What is the drawdown as a percentage of the peak, for example 25%?',
          answer: 0.25,
          check: '(12000 - 9000) / 12000',
          why: '$3,000 ÷ $12,000 = 25%. Drawdowns in percent are measured from the peak, not from the starting balance.',
        },
        {
          kind: 'output',
          id: 'backtest-stats-6',
          ask: 'What does this print?',
          code: `import numpy as np

r = np.array([-1, -1, 2, -1, 3])
equity = np.concatenate([[0], np.cumsum(r)])
dd = np.maximum.accumulate(equity) - equity
print(equity.tolist(), dd.max())`,
          answer: '[0, -1, -2, 0, -1, 2] 2',
          why: 'The curve starts at 0 and falls to −2 before anything is won: a 2R drawdown from the starting balance. The peak only moves above 0 at the last trade.',
        },
        {
          kind: 'bug',
          id: 'backtest-stats-7',
          ask: 'For a list that starts with two losses, -1 and -1, this reports a drawdown of 1R instead of 2R.',
          code: `import numpy as np

def max_drawdown(r):
    equity = np.cumsum(r)
    peak = np.maximum.accumulate(equity)
    return (peak - equity).max()`,
          line: 4,
          fix: '    equity = np.concatenate([[0], np.cumsum(r)])',
          why: 'Without the starting 0 the first peak is the balance after the first loss, so the fall from the starting balance to it is never counted. Prepend 0 so the curve starts where the account did.',
        },
        {
          kind: 'bug',
          id: 'backtest-stats-8',
          ask: 'In this journal, scratched trades at 0R are not wins. On [1, 0, 0, -1, 2] the function returns 0.8 instead of 0.4.',
          code: `def win_rate(r):
    wins = [x for x in r if x >= 0]
    return len(wins) / len(r)`,
          line: 2,
          fix: '    wins = [x for x in r if x > 0]',
          why: 'With `>=` every scratch counts as a win, which inflates the win rate of a strategy that often closes flat. Whatever you choose, use the same rule in every test you compare.',
        },
        {
          kind: 'choice',
          id: 'backtest-stats-9',
          ask: 'Two traders took exactly the same 20 trades, but in a different order. Which statistic can differ between them?',
          options: ['Expectancy', 'Profit factor', 'Win rate', 'Maximum drawdown'],
          answer: 3,
          why: 'Expectancy, profit factor and win rate are sums and counts, which do not care about order. Drawdown depends on how losses cluster: five losses in a row hurt more than five losses spread out.',
        },
        {
          kind: 'choice',
          id: 'backtest-stats-10',
          ask: 'In the figure, note the readouts, then press **Losses first**. What changes?',
          options: [
            'Every statistic gets worse',
            'Only the maximum drawdown changes, and it becomes the total of all the losses',
            'The expectancy falls because the losses come first',
            'Nothing changes: the trades are the same',
          ],
          answer: 1,
          why: 'With every loss first, the curve falls by the sum of all losses before it rises, which is the worst drawdown that list can produce. Win rate, expectancy and profit factor do not move. Shuffle a few times to see how much drawdown varies with the luck of the order alone.',
        },
        {
          kind: 'write',
          id: 'backtest-stats-11',
          numpy: true,
          ask: 'Write `trade_stats`: from a list of R multiples return a dict with `n`, `win_rate`, `expectancy`, `profit_factor` and `max_drawdown`. Scratches are not wins. If there are no losses, the profit factor is `float("inf")`.',
          starter: `import numpy as np

def trade_stats(r):
    r = np.asarray(r, dtype=float)
    # n, win_rate, expectancy, profit_factor, max_drawdown
    pass`,
          solution: `import numpy as np

def trade_stats(r):
    r = np.asarray(r, dtype=float)
    gross_win = r[r > 0].sum()
    gross_loss = -r[r < 0].sum()
    equity = np.concatenate([[0.0], np.cumsum(r)])
    return {
        'n': len(r),
        'win_rate': float((r > 0).mean()),
        'expectancy': float(r.mean()),
        'profit_factor': float(gross_win / gross_loss) if gross_loss > 0 else float('inf'),
        'max_drawdown': float((np.maximum.accumulate(equity) - equity).max()),
    }`,
          tests: `out = trade_stats([2, -1, -1, 3, -1, 0.5, -1, 2])
assert out is not None, "the function returns nothing yet"
assert out['n'] == 8, f"there are 8 trades, got {out['n']}"
assert abs(out['win_rate'] - 0.5) < 1e-9, f"4 of 8 trades win, got {out['win_rate']}"
assert abs(out['expectancy'] - 0.4375) < 1e-9, f"the mean R is 0.4375, got {out['expectancy']}"
assert abs(out['profit_factor'] - 1.875) < 1e-9, f"7.5 / 4 = 1.875, got {out['profit_factor']}"
assert abs(out['max_drawdown'] - 2) < 1e-9, f"the curve goes 2, 1, 0: a 2R drawdown, got {out['max_drawdown']}"
s = trade_stats([-1, -1, 2])
assert abs(s['max_drawdown'] - 2) < 1e-9, "two losses from the start are a 2R drawdown: start the curve at 0"
assert abs(trade_stats([1, 0, -1])['win_rate'] - 1 / 3) < 1e-9, "a 0R trade is not a win"
assert trade_stats([1, 2])['profit_factor'] == float('inf'), "with no losses the profit factor is infinite"`,
          why: 'Five numbers from one array. The equity curve starts at 0, scratches are not wins, and an empty loss side is handled rather than dividing by zero. The lab uses the same function.',
        },
        {
          kind: 'choice',
          id: 'backtest-stats-12',
          ask: 'Setup A wins 70% of the time with an expectancy of −0.05R. Setup B wins 35% of the time with an expectancy of +0.30R. Both are measured over 400 trades. Which number tells you whether the setup paid?',
          options: [
            'The win rate: A wins twice as often',
            'The expectancy: B made more per trade on average, A lost',
            'Neither: only profit factor matters',
            'The win rate, because a low win rate means long losing streaks',
          ],
          answer: 1,
          why: 'A high win rate with small wins and occasional large losses can lose money. Expectancy combines how often and how much. B will have longer losing streaks, which is a real cost to plan for, but over these trades it paid and A did not.',
        },
      ],
    },
    {
      id: 'backtest-luck',
      title: 'Sample size and luck',
      summary: 'How many trades a win rate needs before it means anything, and why the best of many tests is usually luck.',
      widget: 'backtest-luck',
      text: [
        'A win rate from a few trades is a guess with a wide error. If the true chance of a win is p and you take n trades, the measured win rate wanders around p with a **standard error** of `√(p(1 − p) / n)`. About 95% of the time it lands within two standard errors of the truth.',
        'So 60% over 20 trades has a standard error of √(0.24 / 20) ≈ 11 points: the truth could be anywhere from about 38% to 82%. At 100 trades it is about 5 points either side. To halve the error you need four times the trades. A setup that triggers twice a month needs years of data to say much.',
        'The same applies to expectancy. Its standard error is the standard deviation of the R values divided by √n. Dividing the average R by that gives a **t statistic**: how many standard errors the average is from zero. Below 2, the result is easily luck. Above 2, it might not be, if you only tested one idea.',
        'Test many ideas and luck wins. Toss 50 fair coins 50 times each: the chance that a given coin lands heads 32 or more times is about 3%, but the chance that at least one of the 50 does is about 80%. Try 50 variations of a setup and the best one will look like an edge even if none has one. This is the **lucky coin**, and it is how many impressive backtests are made.',
        'Count every variation you tried, decide the number of trades before you judge, and treat the best of many tests with suspicion in proportion to how many you ran. The figure lets you watch it happen.',
      ],
      rules: [
        'Standard error of a win rate: √(p(1 − p) / n). Two of them either side is a rough 95% range.',
        'Four times the trades halves the error.',
        'Standard error of expectancy: standard deviation of R ÷ √n. Below t = 2, assume luck.',
        'The best of many tests is biased upwards. Count how many you ran.',
        'Decide the sample size before you look at the result.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'backtest-luck-1',
          ask: 'A setup won 60% of 40 trades. Using that as p, what is the standard error of the win rate? Give it as a decimal to 3 places.',
          answer: 0.077,
          tol: 0.002,
          check: 'math.sqrt(0.6 * 0.4 / 40)',
          why: '√(0.6 × 0.4 / 40) = √0.006 ≈ 0.077, nearly 8 percentage points. Two standard errors either side gives roughly 45% to 75%.',
        },
        {
          kind: 'number',
          id: 'backtest-luck-2',
          ask: 'Over 100 trades a setup wins 50% of the time. How many percentage points either side is two standard errors? Give a plain number.',
          answer: 10,
          check: '2 * math.sqrt(0.5 * 0.5 / 100) * 100',
          why: 'The standard error is √(0.25 / 100) = 0.05, so two of them is 0.10: 10 points either side. A measured 50% is consistent with anything from 40% to 60%.',
        },
        {
          kind: 'number',
          id: 'backtest-luck-3',
          ask: 'At a win rate near 50%, how many trades do you need for the standard error to be 2.5 percentage points?',
          answer: 400,
          check: '0.25 / 0.025 ** 2',
          hint: 'Solve √(0.25 / n) = 0.025 for n.',
          why: 'Square both sides: 0.25 / n = 0.000625, so n = 400. Going from 5 points (100 trades) to 2.5 points takes four times as many trades.',
        },
        {
          kind: 'output',
          id: 'backtest-luck-4',
          ask: 'A 55% win rate over 100 trades. What does this print?',
          code: `import math

p, n = 0.55, 100
se = math.sqrt(p * (1 - p) / n)
print(round(p - 2 * se, 2), round(p + 2 * se, 2))`,
          answer: '0.45 0.65',
          why: 'The standard error is about 0.05, so the rough 95% range is 45% to 65%. With wins and losses of equal size, 45% would be a losing setup. 100 trades cannot tell you which side of 50% you are on.',
        },
        {
          kind: 'bug',
          id: 'backtest-luck-5',
          ask: 'This should give the standard error of a win rate. For 100 trades at 50% it returns 0.005 instead of 0.05.',
          code: `import math

def win_rate_se(p, n):
    return math.sqrt(p * (1 - p)) / n`,
          line: 4,
          fix: '    return math.sqrt(p * (1 - p) / n)',
          why: 'The error shrinks with the square root of the number of trades, not with the number itself. Dividing by n makes 100 trades look ten times more precise than they are.',
        },
        {
          kind: 'number',
          id: 'backtest-luck-6',
          ask: 'A backtest of 36 trades has an average of 0.2R and a standard deviation of 1.2R. How many standard errors is the average from zero?',
          answer: 1,
          check: '0.2 / (1.2 / math.sqrt(36))',
          why: 'The standard error is 1.2 / √36 = 0.2, so the average is 1 standard error above zero. A result at least this far from zero turns up by luck about a third of the time.',
        },
        {
          kind: 'number',
          id: 'backtest-luck-7',
          ask: 'A fair coin is tossed 50 times. What is the chance it lands heads 32 or more times? Give a percentage, for example 5%, to one decimal place.',
          answer: 0.0325,
          tol: 0.001,
          check: 'sum(math.comb(50, k) for k in range(32, 51)) / 2 ** 50',
          hint: 'Count the ways to get k heads with `math.comb(50, k)` for every k from 32 to 50, and divide by 2⁵⁰.',
          why: 'About 3.2%. One coin rarely does it. The next question is what happens when you try fifty.',
        },
        {
          kind: 'output',
          id: 'backtest-luck-8',
          ask: 'You test 50 variations of a setup with no edge, 50 trades each, wins and losses of 1R. What is the chance that the best one wins 64% or more? What does this print?',
          code: `from math import comb

n = 50
p_one = sum(comb(n, k) for k in range(32, n + 1)) / 2 ** n
p_any = 1 - (1 - p_one) ** 50
print(round(p_any, 2))`,
          answer: '0.81',
          hint: 'The chance that none of the 50 does it is (1 − p_one)⁵⁰.',
          why: 'Each variation has about a 3% chance, but with 50 tries the chance that at least one gets there is about 81%. A 64% win rate on the best of 50 variations is what no edge at all looks like.',
        },
        {
          kind: 'choice',
          id: 'backtest-luck-9',
          ask: 'In the figure, set 1 strategy and 100 trades, then raise the number of strategies to 40. Every strategy is a fair coin with no edge. What happens to the best one?',
          options: [
            'It stays near zero, since none has an edge',
            'Its curve climbs well above zero and its win rate looks like an edge',
            'It always ends exactly at zero',
            'It gets worse as you add strategies',
          ],
          answer: 1,
          why: 'Picking the best of many random curves picks the luckiest. With 40 tries over 100 trades the best ends more than 20R up, with a win rate above 60%. Nothing about it would carry on into the future.',
        },
        {
          kind: 'write',
          id: 'backtest-luck-10',
          ask: 'Write `win_rate_range(wins, n)`: return the rough 95% range for the true win rate as a pair (low, high), the measured rate minus and plus two standard errors, kept between 0 and 1.',
          starter: `import math

def win_rate_range(wins, n):
    # p = wins / n, se = sqrt(p * (1 - p) / n)
    # return (low, high), each clipped to [0, 1]
    pass`,
          solution: `import math

def win_rate_range(wins, n):
    p = wins / n
    se = math.sqrt(p * (1 - p) / n)
    return max(0.0, p - 2 * se), min(1.0, p + 2 * se)`,
          tests: `out = win_rate_range(50, 100)
assert out is not None, "the function returns nothing yet"
low, high = out
assert abs(low - 0.4) < 1e-9 and abs(high - 0.6) < 1e-9, f"50 of 100 gives (0.4, 0.6), got {out}"
low, high = win_rate_range(12, 20)
assert abs(low - (0.6 - 2 * math.sqrt(0.012))) < 1e-9, f"12 of 20: 0.6 minus two standard errors, got {low}"
low, high = win_rate_range(19, 20)
assert high == 1.0, f"the top of the range cannot pass 1, got {high}"
assert win_rate_range(0, 10) == (0.0, 0.0), "no wins gives (0, 0) with this rough method"`,
          why: 'Two standard errors either side of the measured rate. The clipping keeps the range possible. This normal approximation is rough near 0% and 100% and on small samples; it is a sanity check, not a precise interval.',
        },
        {
          kind: 'write',
          id: 'backtest-luck-11',
          numpy: true,
          ask: 'Write `t_stat(r)`: the average R divided by its standard error, where the standard error is the sample standard deviation (`ddof=1`) divided by √n.',
          starter: `import numpy as np

def t_stat(r):
    r = np.asarray(r, dtype=float)
    pass`,
          solution: `import numpy as np

def t_stat(r):
    r = np.asarray(r, dtype=float)
    se = r.std(ddof=1) / np.sqrt(len(r))
    return r.mean() / se`,
          tests: `out = t_stat([1, -1, 1, -1])
assert out is not None, "the function returns nothing yet"
assert abs(out) < 1e-9, f"an average of zero gives t = 0, got {out}"
r = np.array([2.0, -1.0, 2.0, -1.0, 2.0, -1.0, -1.0, -1.0, 2.0])
want = r.mean() / (r.std(ddof=1) / 3)
assert abs(t_stat(r) - want) < 1e-9, f"expected {want:.4f}, got {t_stat(r)}: use ddof=1 and divide by sqrt(n)"
r4 = np.tile(r, 4)
assert abs(t_stat(r4) - r4.mean() / (r4.std(ddof=1) / 6)) < 1e-9, "the same list four times over: 36 trades, so divide by 6"
assert 1.9 < t_stat(r4) / t_stat(r) < 2.3, "four times the trades with the same spread should give about twice the t statistic"`,
          why: 'The same average over four times the trades gives roughly twice the t statistic, because the error shrinks with √n. That is why a small edge needs many trades before it stands out from noise.',
        },
        {
          kind: 'design',
          id: 'backtest-luck-12',
          ask: 'A friend shows you 15 trades from a new setup: 12 winners, each about +1R, and 3 losers of −1R. They want to trade it with real money at full size from Monday. What do you tell them?',
          checklist: [
            { point: 'Work out the range: 80% over 15 trades has a standard error of about 10 points', why: 'The true win rate could plausibly be anywhere from about 60% to 100%, and the sample is too small for even that to be reliable.' },
            { point: 'Ask how many variations they tried before this one', why: 'If this is the best of several ideas, the result is biased upwards by selection.' },
            { point: 'Ask whether the rules were written before the trades or fitted afterwards', why: 'Rules written after seeing the trades describe the past, they do not test anything.' },
            { point: 'Set a sample size in advance, in the hundreds if possible', why: 'Deciding when to stop after seeing results lets luck choose the answer.' },
            { point: 'Check costs and the market conditions of those 15 trades', why: 'A few weeks of one kind of market tell you little about others.' },
            { point: 'Paper trade or use the smallest size until the sample is large', why: 'The cost of being wrong stays small while the evidence builds.' },
          ],
          why: 'Fifteen trades are an anecdote. The honest answer is not "it does not work" but "we cannot tell yet", and the safe path is the one that keeps the stake small until you can.',
        },
      ],
    },
    {
      id: 'backtest-code',
      title: 'Writing a backtest',
      summary: 'Rules turned into code, bar by bar, with entries and exits at prices you could really have had.',
      text: [
        'A backtest replays the past one bar at a time and asks: knowing only what was known at that moment, what would the rules have done? The rules must be exact enough for a computer. "A strong breakout in the morning" is not a rule. "The first 5-minute close above the high of the first three bars, before 11:00" is.',
        "A signal computed from a bar's close is only known when that bar ends, so the earliest fill is the **open of the next bar**. Filling at the close or open of the signal bar itself uses the future. The loop is: if in a trade, check this bar for an exit; if flat, check the rules on bars up to this one and, if they fire, enter at the next open.",
        { code: `for i in range(start, len(c) - 1):
    if c[i] > h[i - 3:i].max():   # signal at the close of bar i, from earlier highs only
        entry = o[i + 1]          # the earliest price you could get
        break` },
        "Exits use the bar's high and low. A stop is hit if the low reaches it, a target if the high does. If price **gaps** through the stop, you are filled at the open, not at the stop. If one bar touches both stop and target, the bars cannot tell you which came first, so assume the stop. Pessimistic assumptions cost a little on paper; optimistic ones cost money later.",
        'The output is a list of trades: entry and exit bar, prices and R. Everything from the statistics lesson then applies. A plain loop is slower than a vectorised one, but it reads like the rules and makes it hard to use a price before its time, which is the commonest backtest bug.',
      ],
      rules: [
        'Write rules a computer can follow: exact trigger, time window, entry, stop, target, time exit.',
        "A signal from a bar's close fills at the next bar's open at the earliest.",
        'Stops fill at the stop or worse: a gap through it fills at the open.',
        'When a bar touches both stop and target, assume the stop.',
        'Look only backwards: indicators at bar i use bars up to i, levels use bars before i.',
      ],
      questions: [
        {
          kind: 'choice',
          id: 'backtest-code-1',
          ask: 'Your rule fires on the close of bar 10 of the day. At what price does an honest backtest enter?',
          options: ['The close of bar 10', 'The open of bar 10', 'The open of bar 11', 'The low of bar 11'],
          answer: 2,
          why: 'The close of bar 10 is only known once bar 10 has ended, and the next price you could trade at is the open of bar 11. The open of bar 10 is in the past by then, and the low of bar 11 is a price you would only know afterwards.',
        },
        {
          kind: 'choice',
          id: 'backtest-code-2',
          ask: 'You are long with a stop at 99 and a target at 102. The next 5-minute bar opens at 100 and has a low of 98.80 and a high of 102.30. What does a careful backtest record?',
          options: ['A win at 102', 'A loss at 99', 'A win at 102.30', 'Half a win and half a loss'],
          answer: 1,
          why: 'Both levels are inside the bar, and OHLC bars do not say which came first. Assuming the stop is the safe choice. If such bars are common in your test, use smaller bars to find out, because the assumption can decide the result.',
        },
        {
          kind: 'number',
          id: 'backtest-code-3',
          ask: 'You are long from $100.00 with a stop at $99.00. The next bar opens at $98.20, below your stop. At what price, in dollars, does an honest backtest fill the stop?',
          answer: 98.2,
          check: '98.20',
          why: 'A stop becomes a market order once price is through it, and the first trade available is the open at $98.20. The loss is 1.8R, not 1R. A backtest that fills at $99 hides every gap.',
        },
        {
          kind: 'number',
          id: 'backtest-code-4',
          ask: 'The regular US stock session runs from 9:30 to 16:00 New York time. How many 5-minute bars does it have?',
          answer: 78,
          check: '6.5 * 60 / 5',
          why: 'Six and a half hours is 390 minutes, and 390 ÷ 5 = 78. Knowing the bar count lets you check for missing data: a day with 74 bars has a hole in it, or was a half day.',
        },
        {
          kind: 'output',
          id: 'backtest-code-5',
          ask: 'Is the close of bar 5 above the highest high of the bars before it? Two versions of the window. What does this print?',
          code: `import numpy as np

h = np.array([10.0, 11.0, 12.0, 11.0, 13.0, 14.0])
c = np.array([9.5, 10.8, 11.5, 10.9, 12.8, 13.9])
i = 5
print(c[i] > h[i - 3:i].max(), c[i] > h[i - 3:i + 1].max())`,
          answer: 'True False',
          why: "`h[2:5]` is bars 2 to 4, with a high of 13, and 13.9 is above it. `h[2:6]` includes bar 5 itself, and a close can never be above its own bar's high, so the second rule can never fire. Including the current bar in a breakout level is a common slicing mistake.",
        },
        {
          kind: 'bug',
          id: 'backtest-code-6',
          ask: "The signal is a close above the previous bar's high. The backtest looks wonderful, because it buys at a price from before the signal was known.",
          code: `entries = []
for i in range(1, len(c) - 1):
    if c[i] > h[i - 1]:
        entries.append(o[i])`,
          line: 4,
          fix: '        entries.append(o[i + 1])',
          why: 'The signal is known at the close of bar i, but the code buys at the open of bar i, earlier in the same bar and usually lower. That is lookahead: on a rising bar it books a gain that could not have been had. Fill at the open of bar i + 1.',
        },
        {
          kind: 'bug',
          id: 'backtest-code-7',
          ask: "This checks a long trade's stop on each bar. It misses stops that are hit during a bar that then recovers, so the backtest has too few losers.",
          code: `for i in range(start, len(c)):
    if c[i] <= stop:
        exit_price = stop
        break`,
          line: 2,
          fix: '    if l[i] <= stop:',
          why: 'A bar can trade down through the stop and close above it. Your stop order would have filled. Checking the close lets those trades survive, which turns real losses into imaginary recoveries.',
        },
        {
          kind: 'write',
          id: 'backtest-code-8',
          ask: 'Write `bar_exit` for a long position: given one bar and the stop and target, return the fill price, or `None` if neither is hit. A gap through either level fills at the open. If the bar reaches both, assume the stop.',
          starter: `def bar_exit(o, h, l, stop, target):
    # o, h, l: the bar's open, high and low
    # return the exit price, or None to stay in the trade
    return o`,
          solution: `def bar_exit(o, h, l, stop, target):
    if o <= stop or o >= target:
        return o
    if l <= stop:
        return stop
    if h >= target:
        return target
    return None`,
          tests: `out = bar_exit(100.5, 101.0, 99.5, 99.0, 102.0)
assert out is None, f"a bar that reaches neither level should return None, got {out}"
assert bar_exit(100.0, 100.5, 98.9, 99.0, 102.0) == 99.0, "a low through the stop fills at the stop"
assert bar_exit(100.0, 102.4, 99.5, 99.0, 102.0) == 102.0, "a high through the target fills at the target"
assert bar_exit(98.2, 99.5, 97.9, 99.0, 102.0) == 98.2, "a gap below the stop fills at the open, not the stop"
assert bar_exit(102.6, 103.0, 102.1, 99.0, 102.0) == 102.6, "a gap above the target fills at the open"
assert bar_exit(100.0, 102.3, 98.8, 99.0, 102.0) == 99.0, "when both levels are inside the bar, assume the stop"`,
          why: 'The order of the checks is the policy: the open first (gaps), then the stop, then the target. Putting the target check first would turn every ambiguous bar into a win.',
        },
        {
          kind: 'write',
          id: 'backtest-code-9',
          ask: 'Write a time-exit backtest. When `signal[i]` is true and you are flat, buy at the open of bar `i + 1` and sell at the close of bar `i + hold`. Ignore signals while in a trade, and skip a signal if bar `i + hold` does not exist. Return a list of `(entry_bar, entry_price, exit_price)`.',
          starter: `def time_exit_trades(o, c, signal, hold):
    trades = []
    i = 0
    while i < len(c):
        # if signal[i] and there is room: record a trade and jump past its exit bar
        i += 1
    return trades`,
          solution: `def time_exit_trades(o, c, signal, hold):
    trades = []
    i = 0
    while i < len(c):
        if signal[i] and i + hold < len(c):
            trades.append((i + 1, o[i + 1], c[i + hold]))
            i += hold + 1
        else:
            i += 1
    return trades`,
          tests: `o = [10, 11, 12, 13, 14, 15, 16, 17]
c = [x + 0.5 for x in o]
signal = [True, True, False, False, False, True, True, False]
out = time_exit_trades(o, c, signal, 2)
assert out is not None, "the function returns nothing yet"
assert len(out) > 0, "these signals should produce trades"
assert out[0] == (1, 11, 12.5), f"the first signal at bar 0 buys the open of bar 1 (11) and sells the close of bar 2 (12.5), got {out[0]}"
assert out == [(1, 11, 12.5), (6, 16, 17.5)], f"the signal at bar 1 is ignored while in the trade, and the one at bar 6 too, got {out}"
assert time_exit_trades(o, c, [False] * 6 + [True, False], 2) == [], "a signal at bar 6 with hold 2 needs bar 8, which does not exist"`,
          why: 'Entry at the next open, exit at a fixed bar, and no overlapping trades. Skipping signals while in a trade matters: counting them as separate trades would multiply one market move into several "independent" results.',
        },
        {
          kind: 'design',
          id: 'backtest-code-10',
          ask: 'Turn this idea into rules a backtest can run: "Buy SPY when it breaks out strongly in the morning, and get out if it fails."',
          checklist: [
            { point: 'The bar size and the data: for example 5-minute bars of the regular session', why: 'The same rule gives different trades on different timeframes.' },
            { point: 'An exact trigger: for example the first close above the high of the first three bars', why: '"Strongly" cannot be coded; a threshold can be tested and varied.' },
            { point: 'A time window: no new entries after a set time, for example 11:00', why: '"In the morning" must be a number of bars, or the test picks its own.' },
            { point: 'The entry price: the open of the bar after the signal', why: 'This is the earliest honest fill.' },
            { point: 'A stop: for example the low of the opening range, and what "fails" means', why: 'Without an exact stop there is no R and no loss to measure.' },
            { point: 'A target or exit rule, and a time exit before the close', why: 'Every trade needs an end, or the backtest holds positions overnight that you would not.' },
            { point: 'One trade per day, and what happens on gap days or half days', why: 'Edge cases decide a surprising share of results.' },
            { point: 'Costs per trade', why: 'They belong in the rules from the start, not added at the end.' },
          ],
          why: 'If two people could code your rules and get different trades, the rules are not finished. Every vague word is a free parameter that the backtest will quietly fit.',
        },
      ],
    },
    {
      id: 'backtest-lies',
      title: 'How backtests lie',
      summary: 'Lookahead, survivorship, overfitting, missing costs and impossible fills: the ways a backtest flatters a setup.',
      widget: 'backtest-costs',
      text: [
        "**Lookahead bias** is using information that was not available at the time: entering at the open of the bar whose close made the signal, setting a stop from the day's low before the day is over, or scaling an indicator with the mean of the whole data set, future included. It is the commonest bug and it makes results look far too good.",
        "**Survivorship bias** comes from testing only what survived. Today's list of index members or popular stocks leaves out the companies that were removed, failed or were bought. A test on today's winners going back ten years quietly knows which ones won.",
        '**Overfitting** is tuning rules to the noise of the past. Every parameter (a length, a threshold, a time window, a filter) gives the test another way to fit chance. Many parameters and few trades mean the result describes your data, not the market.',
        '**Costs and slippage**: commissions, per-contract fees, the spread, and fills worse than the price you saw. Put them in R: cost in R = cost per trade ÷ risk per trade. $10 of costs on a $50 risk is 0.2R a trade, enough to sink most small edges. The figure shows how the same trades look as costs rise.',
        '**Impossible fills**: a limit order at the exact low of a bar is assumed filled, but touching a price does not mean your order was reached in the queue. Assume a limit fills only if price traded through it. Buying at the mid of an option quote, or at the last trade of a stale contract, is another fill you would not have had.',
      ],
      rules: [
        'Every value used at bar i must be known by bar i: no future data, ever.',
        'Test on what existed then, including what later failed.',
        'Fewer parameters, more trades. Count every parameter you tuned.',
        'Cost in R = cost per trade ÷ risk per trade. Small risk makes fixed costs large.',
        'A limit fills when price trades through it, not when it touches.',
      ],
      questions: [
        {
          kind: 'choice',
          id: 'backtest-lies-1',
          ask: "A backtest buys at the open and places its stop a few cents below the low of the day. Its win rate is 90%. What is wrong?",
          options: [
            "Nothing: stops below the day's low are rarely hit",
            'The low of the day is not known until the close, so the test uses the future',
            'The stop is too wide',
            'The win rate is too low for this setup',
          ],
          answer: 1,
          why: 'By definition price never goes below the low of the day, so a stop under it is never hit. At the open you cannot know where that low will be. This is lookahead, and it is why the result is too good.',
        },
        {
          kind: 'choice',
          id: 'backtest-lies-2',
          ask: 'You test a dip-buying rule on the stocks that are in the Nasdaq-100 today, going back ten years. What does the result overstate, and why?',
          options: [
            'Nothing, the Nasdaq-100 is a fair sample',
            'It overstates returns, because stocks that fell out of the index or failed are missing, and buying dips in those often lost money',
            'It understates returns, because the index has changed',
            'It overstates costs',
          ],
          answer: 1,
          why: "Today's members are partly members because they did well. Buying dips in a list chosen for having recovered is testing with the answer. A fair test uses the index members as they were on each date.",
        },
        {
          kind: 'number',
          id: 'backtest-lies-3',
          ask: 'You buy an option whose bid-ask spread is $0.10, and you are filled at the ask and later sell at the bid. Fees are $1.30 per contract for the round trip (a made-up figure). Your planned risk is $50 per contract. Measured from the mid price, how much do costs take off each trade, in R? Give two decimals.',
          answer: 0.23,
          tol: 0.005,
          check: '(0.10 * 100 + 1.30) / 50',
          hint: 'Measured from the mid, you pay half the spread going in and half coming out.',
          why: 'Half the spread each way is the full $0.10 × 100 = $10, plus $1.30 of fees: $11.30. Divided by $50 of risk, about 0.23R per trade, before any slippage.',
        },
        {
          kind: 'number',
          id: 'backtest-lies-4',
          ask: 'Your backtest at mid prices shows an expectancy of +0.15R. With the costs of the previous question, $11.30 per trade on $50 of risk, what is the expectancy in R? Give two decimals.',
          answer: -0.08,
          tol: 0.006,
          check: '0.15 - 11.30 / 50',
          why: '0.15 − 0.226 = −0.076R. The edge at mid prices was there on paper and gone after costs. Either the edge must be larger than the costs, or the risk per trade larger so that the costs are a smaller share of it.',
        },
        {
          kind: 'output',
          id: 'backtest-lies-5',
          ask: 'The same six trades before and after a cost of 0.2R each. What does this print?',
          code: `gross = [1.0, -1.0, 2.0, -1.0, -1.0, 1.5]
cost = 0.2
net = [r - cost for r in gross]
print(round(sum(gross) / 6, 2), round(sum(net) / 6, 2))`,
          answer: '0.25 0.05',
          why: 'A fixed cost per trade comes straight off the expectancy: 0.25 − 0.2 = 0.05. Four fifths of this edge went on costs, and the 0.05 left is well inside the noise of six trades.',
        },
        {
          kind: 'bug',
          id: 'backtest-lies-6',
          ask: 'This z-score of the close should use only the past `window` bars. It uses the future, so a backtest built on it is too good.',
          code: `import numpy as np

def zscore(c, window):
    z = np.full(len(c), np.nan)
    for i in range(window, len(c)):
        past = c[i - window:i]
        z[i] = (c[i] - c.mean()) / past.std()
    return z`,
          line: 7,
          fix: '        z[i] = (c[i] - past.mean()) / past.std()',
          why: '`c.mean()` is the mean of the whole series, including every bar after i. If prices end higher than they start, early bars look cheap compared with a future average. Use the mean of the past window.',
        },
        {
          kind: 'bug',
          id: 'backtest-lies-7',
          ask: 'A buy limit order in a backtest. You decided to count it as filled only when price trades below the limit, since touching it does not mean your order in the queue was reached.',
          code: `def limit_filled(bar_low, limit):
    # a buy limit at limit: filled only if price trades through it
    return bar_low <= limit`,
          line: 3,
          fix: '    return bar_low < limit',
          why: 'At the touch, orders ahead of yours in the queue fill first and price may bounce without reaching you. Counting touches as fills gives a mean-reversion strategy its best entries for free, often on exactly the trades that would have been winners.',
        },
        {
          kind: 'choice',
          id: 'backtest-lies-8',
          ask: 'A setup has 7 tuned parameters (two lengths, three thresholds, a start time and an end time) and its backtest has 60 trades. What is the main worry?',
          options: [
            'The backtest is too slow',
            'With so many knobs and so few trades, the rules have very likely been fitted to noise',
            'Seven parameters is the right number for a day-trading setup',
            'The trades are too few for costs to matter',
          ],
          answer: 1,
          why: 'Each parameter is a way to fit chance. With 60 trades there is little data per decision, so a good-looking result is what tuning produces whether or not there is an edge. Fewer parameters and an untouched out-of-sample test are the remedies.',
        },
        {
          kind: 'choice',
          id: 'backtest-lies-9',
          ask: 'In the figure, set risk per trade to $50 and the cost per trade to $10. What happens to the edge?',
          options: [
            'Nothing: costs are the same whatever the risk',
            'The cost is 0.2R a trade and the net expectancy falls below zero',
            'The gross expectancy falls',
            'The win rate rises',
          ],
          answer: 1,
          why: '$10 ÷ $50 = 0.2R, more than the 0.14R gross edge in the figure, so the net curve falls. Raise the risk to $200 with the same cost and the cost is 0.05R. Fixed costs punish small positions, which is a reason to test with the size you will really trade.',
        },
        {
          kind: 'number',
          id: 'backtest-lies-10',
          ask: 'Your stops fill on average $0.05 per share worse than the stop price. Risk is $0.50 per share, and 55% of your trades are stopped out. On average, how much does stop slippage cost per trade, in R? Give three decimals.',
          answer: 0.055,
          tol: 0.002,
          check: '0.55 * 0.05 / 0.50',
          why: 'Each stopped trade loses an extra 0.05 / 0.50 = 0.1R. Across all trades that is 0.55 × 0.1 = 0.055R per trade. It looks small and is often the size of the edge itself.',
        },
        {
          kind: 'write',
          id: 'backtest-lies-11',
          ask: 'Write `fill_price` to model a realistic fill. Given the mid price, the full spread and the slippage, a buy fills at half the spread above the mid plus slippage, and a sell at half the spread below the mid minus slippage.',
          starter: `def fill_price(side, mid, spread, slippage):
    # side is 'buy' or 'sell'
    pass`,
          solution: `def fill_price(side, mid, spread, slippage):
    if side == 'buy':
        return mid + spread / 2 + slippage
    return mid - spread / 2 - slippage`,
          tests: `out = fill_price('buy', 2.00, 0.10, 0.0)
assert out is not None, "the function returns nothing yet"
assert abs(out - 2.05) < 1e-9, f"a buy with no slippage fills at the ask, 2.05, got {out}"
assert abs(fill_price('sell', 2.00, 0.10, 0.0) - 1.95) < 1e-9, "a sell with no slippage fills at the bid, 1.95"
assert abs(fill_price('buy', 2.00, 0.10, 0.02) - 2.07) < 1e-9, "slippage makes a buy more expensive"
assert abs(fill_price('sell', 2.00, 0.10, 0.02) - 1.93) < 1e-9, "slippage makes a sell cheaper"
round_trip = fill_price('buy', 2.0, 0.10, 0.01) - fill_price('sell', 2.0, 0.10, 0.01)
assert abs(round_trip - 0.12) < 1e-9, "buying and selling at the same mid costs the full spread plus slippage twice"`,
          why: 'Costs go against you on both sides. A round trip at an unchanged mid loses the whole spread plus two lots of slippage. A backtest at mid prices assumes all of that is zero.',
        },
        {
          kind: 'design',
          id: 'backtest-lies-12',
          ask: 'Someone sends you a backtest of a 0DTE options setup with a 75% win rate and a smooth equity curve. What do you check before believing any of it?',
          checklist: [
            { point: 'Entries at prices known at the time: the next bar after the signal', why: 'Lookahead is the commonest reason for a too-good result.' },
            { point: 'Option fills at the bid and ask, not the mid or the last trade', why: 'On 0DTE options the spread can be a large share of the premium.' },
            { point: 'Commissions, fees and slippage included in every trade', why: 'Costs in R can be larger than the edge.' },
            { point: 'How many trades, and how many parameters were tuned', why: 'Few trades and many parameters mean the curve is fitted to noise.' },
            { point: 'An out-of-sample period the rules never saw', why: 'Performance on the data used to build the rules proves nothing.' },
            { point: 'Stops filled at the stop or worse, and ambiguous bars counted as losses', why: 'Optimistic intrabar assumptions turn losers into winners.' },
            { point: 'What the data covers: which dates, which market conditions, missing days', why: 'A test that only covers a calm rising market says nothing about others.' },
            { point: 'The size of the average loss compared with the average win', why: 'A 75% win rate with rare large losses can still lose money.' },
          ],
          why: 'A smooth curve with a high win rate is more often a sign of a flaw than of an edge. Check each way a backtest can lie before trusting the number.',
        },
      ],
    },
    {
      id: 'backtest-oos',
      title: 'In-sample, out-of-sample and walk-forward',
      summary: 'Keep some data the rules never saw, roll the test forward through time, and paper trade before risking money.',
      widget: 'backtest-overfit',
      text: [
        'Split your history by time. The **in-sample** part, the earlier data, is where you develop and tune the rules. The **out-of-sample** part, the later data, stays untouched until the rules are frozen, and is then run once. Split by date, not at random: markets change over time, and a random split lets the rules learn from days that come after the ones they are tested on.',
        'Expect out-of-sample results to be worse. How much worse tells you how much of the in-sample result was fitted to noise. If the out-of-sample test disappoints and you change the rules and run it again, it has become in-sample data. You get one honest look per period of data.',
        '**Walk-forward** testing repeats the split through time: tune on a window (say 12 months), test on the next (say 3 months), move both forward by 3 months and repeat. Join the test pieces and you have a long out-of-sample record, made the way you would really trade: choosing parameters from the past and using them on what comes next.',
        'Prefer parameters that sit on a **plateau**: if lengths from 10 to 30 all do about as well, the idea is more likely real than if 17 is good and 16 and 18 are not. A lone spike is usually noise, as the figure shows on data that has no edge in it at all.',
        '**Paper trading** is the last test before money: the same rules, in real time, with your own execution. It catches what a backtest cannot, such as hesitation and data you did not have in time. Paper fills are often generous, so record the price you would really have had (the ask to buy, the bid to sell). Then trade the smallest size, and compare live results with the backtest.',
      ],
      rules: [
        'Split by time: tune on the past, test on the later data.',
        'Run the out-of-sample test once. Rerunning it after changes makes it in-sample.',
        'Expect out-of-sample results to be worse; the gap measures overfitting.',
        'Walk-forward: tune on a window, test on the next, roll forward, join the tests.',
        'Prefer plateaus over spikes. Paper trade at realistic fills, then go small.',
      ],
      questions: [
        {
          kind: 'choice',
          id: 'backtest-oos-1',
          ask: 'You have three years of 5-minute bars. How do you split them for development and testing?',
          options: [
            'Pick 70% of the days at random for development and use the rest for testing',
            'Develop on the first two years and test once on the last year',
            'Develop and test on all three years, so both use as much data as possible',
            'Test first on the last year, then develop on the first two',
          ],
          answer: 1,
          why: 'A time split mimics reality: rules made from the past, used on the future. A random split mixes days from the test period into development, so the rules have seen the market they are tested on.',
        },
        {
          kind: 'choice',
          id: 'backtest-oos-2',
          ask: 'Your out-of-sample test disappoints. You change one threshold and rerun it, then another, until it looks good. What is that out-of-sample period now?',
          options: [
            'Still out-of-sample, since the rules were built on the earlier data',
            'In-sample: the rules have been tuned on it, so it no longer tests them',
            'A walk-forward test',
            'A paper-trading result',
          ],
          answer: 1,
          why: 'Each rerun lets the test data shape the rules. After a few, the period is as fitted as the development data. The honest options are to accept the result or to wait for new data.',
        },
        {
          kind: 'number',
          id: 'backtest-oos-3',
          ask: 'You have 36 months of data. Walk-forward with a 12-month tuning window and a 3-month test window, rolled forward 3 months at a time. How many test windows are there?',
          answer: 8,
          check: '(36 - 12) // 3',
          why: 'The first test starts after month 12, and the tests cover months 13 to 36: 24 months in 3-month pieces, 8 windows. Together they make a 24-month out-of-sample record.',
        },
        {
          kind: 'number',
          id: 'backtest-oos-4',
          ask: 'In-sample expectancy is 0.40R. Out-of-sample it is 0.10R. What share of the in-sample expectancy survived? Give a percentage, for example 50%.',
          answer: 0.25,
          check: '0.10 / 0.40',
          why: '0.10 ÷ 0.40 = 25%. Three quarters of the edge on the development data was fitted to it. Whether 0.10R is enough depends on the costs and on how many trades it rests on.',
        },
        {
          kind: 'output',
          id: 'backtest-oos-5',
          ask: 'A time split of ten periods. What does this print?',
          code: `import numpy as np

r = np.arange(10)
cut = int(len(r) * 0.7)
in_sample, out_sample = r[:cut], r[cut:]
print(len(in_sample), out_sample.tolist())`,
          answer: '7 [7, 8, 9]',
          why: 'The first 70% (indices 0 to 6) is in-sample, and the last three periods are out-of-sample. Slicing keeps the order, which is the point of a time split.',
        },
        {
          kind: 'bug',
          id: 'backtest-oos-6',
          ask: 'This should split trading days into development and test sets by time. The test set ends up full of days from the middle of the history.',
          code: `import numpy as np

def split_days(n_days, share):
    idx = np.random.default_rng(0).permutation(n_days)
    cut = int(n_days * share)
    return idx[:cut], idx[cut:]`,
          line: 4,
          fix: '    idx = np.arange(n_days)',
          why: "A permutation shuffles the days, so development and test days are interleaved and the rules see the test period's market. Keep the days in order and cut once.",
        },
        {
          kind: 'choice',
          id: 'backtest-oos-7',
          ask: 'An equity curve in R. The rules were tuned on the first 30 trades (in-sample) and then run on the next 30 (out-of-sample). What does it suggest?',
          chart: {
            title: 'Equity in R',
            x: 'trade',
            y: 'R',
            series: [
              { name: 'in-sample', points: [0, 1, 2, 1.5, 3, 4, 3.5, 5, 6, 7, 6.5, 8, 9, 8.5, 10, 11, 12, 11.5, 13, 14, 13.5, 15, 16, 17, 16.5, 18, 19, 20, 19.5, 21, 22], color: 'accent' },
              { name: 'out-of-sample', points: [22, 21, 22, 21, 20, 21, 20, 19, 20, 21, 20, 19, 18, 19, 20, 19, 18, 19, 20, 19, 18, 17, 18, 19, 18, 17, 18, 17, 16, 17, 17], color: 'blue' },
            ],
          },
          options: [
            'A strong edge that had a bad month',
            'The rules were fitted to the in-sample data, and the edge did not carry over',
            'The out-of-sample period is too long',
            'It proves the setup will recover',
          ],
          answer: 1,
          why: 'A smooth climb where the rules were tuned and a drift down where they were not is the signature of overfitting. Thirty trades is not much either way, but nothing here supports the in-sample curve.',
        },
        {
          kind: 'choice',
          id: 'backtest-oos-8',
          ask: 'In the figure, the prices are a random walk with no edge in them. Find the lookback with the best in-sample result. How does it do out-of-sample?',
          options: [
            'It is also the best out-of-sample',
            'It is no better than the others out-of-sample, and often worse',
            'It is always the worst out-of-sample',
            'It does exactly as well as in-sample',
          ],
          answer: 1,
          why: 'With no edge in the data, the best in-sample lookback is the one that fitted the noise of that period best, and the noise of the next period is different. Switch data sets: the in-sample winner moves around and its out-of-sample result has no pattern.',
        },
        {
          kind: 'choice',
          id: 'backtest-oos-9',
          ask: 'You test moving-average lengths from 5 to 50. Length 23 earns 0.4R a trade; 21, 22, 24 and 25 all earn about 0. Another idea earns between 0.15R and 0.2R for every length from 10 to 40. Which is more likely to be real?',
          options: [
            'Length 23, because it earns the most',
            'The second idea, because its result holds across a wide plateau of settings',
            'Neither can be judged without the win rate',
            'Both equally',
          ],
          answer: 1,
          why: 'A real effect rarely depends on one exact setting. A lone spike among neighbours that do nothing is what noise looks like after a search. A plateau also leaves room for the market to drift a little without breaking the rules.',
        },
        {
          kind: 'write',
          id: 'backtest-oos-10',
          ask: 'Write `walk_forward_windows(n, train, test)`: for `n` periods, return a list of `(train_start, train_end, test_start, test_end)` as Python slice bounds, rolling forward by `test` each time. Stop when a full test window no longer fits.',
          starter: `def walk_forward_windows(n, train, test):
    windows = []
    # first window: train on [0, train), test on [train, train + test)
    return windows`,
          solution: `def walk_forward_windows(n, train, test):
    windows = []
    start = 0
    while start + train + test <= n:
        windows.append((start, start + train, start + train, start + train + test))
        start += test
    return windows`,
          tests: `out = walk_forward_windows(36, 12, 3)
assert out is not None, "the function returns nothing yet"
assert len(out) == 8, f"36 months with 12 to tune and 3 to test give 8 windows, got {len(out)}"
assert out[0] == (0, 12, 12, 15), f"the first window tunes on 0 to 12 and tests on 12 to 15, got {out[0]}"
assert out[-1] == (21, 33, 33, 36), f"the last window tests on 33 to 36, got {out[-1]}"
assert all(w[1] == w[2] for w in out), "each test starts where its training ends"
assert walk_forward_windows(14, 12, 3) == [], "no full test window fits in 14 periods"`,
          why: 'Each test window comes straight after its training window, and the test windows tile the later data without overlapping. Joined together they are one out-of-sample record.',
        },
        {
          kind: 'write',
          id: 'backtest-oos-11',
          numpy: true,
          ask: "Write `walk_forward`: `results` is an array of shape (settings, periods) with the R earned by each parameter setting in each period. For each window, pick the setting with the highest total in its training periods, and add up that setting's R in the test periods. Return the total out-of-sample R.",
          starter: `import numpy as np

def walk_forward(results, train, test):
    results = np.asarray(results, dtype=float)
    n = results.shape[1]
    total = 0.0
    start = 0
    while start + train + test <= n:
        # choose on [start, start + train), score on the next test periods
        start += test
    return total`,
          solution: `import numpy as np

def walk_forward(results, train, test):
    results = np.asarray(results, dtype=float)
    n = results.shape[1]
    total = 0.0
    start = 0
    while start + train + test <= n:
        best = results[:, start:start + train].sum(axis=1).argmax()
        total += results[best, start + train:start + train + test].sum()
        start += test
    return total`,
          tests: `results = np.array([
    [1, 1, -1, -1, 0, 0],
    [0, 0, 2, 2, -2, 0],
])
out = walk_forward(results, 2, 2)
assert out is not None, "the function returns nothing yet"
assert abs(out - (-4)) < 1e-9, f"window 1 picks row 0 (2R in training) and earns -2 on periods 2-3; window 2 picks row 1 (4R) and earns -2 on periods 4-5: total -4, got {out}"
assert walk_forward(results, 4, 4) == 0.0, "no window fits, so the total is 0"
r = np.array([[0.5] * 10, [0.1] * 10])
assert abs(walk_forward(r, 3, 2) - 3.0) < 1e-9, "a setting that is always better is always chosen: 3 windows of 2 periods at 0.5 is 3.0"`,
          why: 'Every choice uses only the past, and every score only what came after that choice. In the test data the setting that won training lost in the next period both times, which is how a search over noise behaves.',
        },
        {
          kind: 'design',
          id: 'backtest-oos-12',
          ask: 'Your rules passed an out-of-sample test. Plan the paper-trading phase that comes before real money.',
          checklist: [
            { point: 'The same written rules as the backtest, frozen for the whole phase', why: 'Changing rules mid-way means you are testing something else.' },
            { point: 'A number of trades or weeks fixed in advance', why: 'Stopping when the result looks good lets luck decide.' },
            { point: 'Fills recorded at the price you would really have had: the ask to buy, the bid to sell', why: 'Paper platforms often fill at the mid or better, which flatters the result.' },
            { point: 'Every trade journalled with R, tags and whether you followed the rules', why: 'You are testing your execution as well as the setup.' },
            { point: 'A comparison with the backtest: win rate, expectancy, drawdown', why: 'Large differences point to a backtest flaw or to execution problems.' },
            { point: 'A written rule for what happens next: go to the smallest size, or stop', why: 'Deciding in advance prevents talking yourself into going live.' },
            { point: 'A daily loss limit and a fixed risk per trade, even on paper', why: 'Practise the habits you will need with money.' },
          ],
          why: 'Paper trading tests what backtests cannot: real-time data and your own behaviour. It only helps if it is run as strictly as a test.',
        },
      ],
    },
    {
      id: 'backtest-options',
      title: 'Backtesting options honestly',
      summary: 'Test the signal on the underlying, then model the option with delta, decay and the spread.',
      text: [
        'Historical option prices are the hard part. Each underlying has hundreds of strikes and expiries, intraday quote history is large and usually costs money, and free data often has only end-of-day prices or the last trade, which can be hours old on a thin strike. A backtest at the mid or the last price assumes fills you would not have had.',
        'So test in two steps. First test the **signal on the underlying**: stock or ETF bars are cheap, plentiful and clean. If the entries have no edge on SPY itself, an option on SPY will not add one: it changes the shape of the payoff and adds costs. Treat that as a working rule rather than a law, but it removes most bad ideas cheaply.',
        'Then **model the option** for each trade. A reminder from the pricing module: delta is how much the option moves per $1 of the underlying, gamma how much delta changes, theta the decay per day. For a move ΔS held for part of a day, the option changes by about `delta × ΔS + ½ × gamma × ΔS² − decay over the hold`. Subtract the full spread (half going in, half coming out) and the fees, and multiply by 100 per contract.',
        { code: `delta, gamma, decay = 0.50, 0.05, 0.04      # per share; decay over the hold
spread, fee = 0.06, 1.30                     # option spread; round-trip fee per contract
move = 1.50                                  # SPY move in your favour, in dollars
per_share = delta * move + 0.5 * gamma * move ** 2 - decay - spread
print(round(per_share * 100 - fee, 2))       # 69.33` },
        'The model leaves things out: implied volatility can fall after news (a right call that still loses), spreads widen in fast markets, and delta changes over larger moves. Keep estimates on the cautious side, check a sample of trades against real quotes if you can get them, and paper trade the option version before trusting it.',
      ],
      rules: [
        'Test the entries on the underlying first. No edge there, no option trade.',
        'Model the option: delta × move + ½ gamma × move² − decay, per share.',
        'Subtract the full spread for the round trip, plus fees, then × 100 per contract.',
        'Mid and last prices are not fills. Model the bid and ask.',
        'The model ignores changes in implied volatility. Check against real quotes and paper trade.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'backtest-options-1',
          ask: 'Your signal on SPY gains $2.00 per share. You model a call with delta 0.50 and decay of $0.05 per share over the hold, ignoring gamma. The option spread is $0.04 and fees are $1.30 per contract for the round trip. What is the P&L of one contract in dollars?',
          answer: 89.7,
          tol: 0.5,
          check: '(0.50 * 2.00 - 0.05 - 0.04) * 100 - 1.30',
          why: 'Per share: 0.50 × 2.00 − 0.05 − 0.04 = $0.91. Times 100 is $91, minus $1.30 of fees: $89.70.',
        },
        {
          kind: 'number',
          id: 'backtest-options-2',
          ask: 'The same model on a losing trade: SPY moves $1.00 against you. Delta 0.50, decay $0.05 per share, spread $0.04, fees $1.30 per contract, no gamma. What is the P&L of one contract in dollars?',
          answer: -60.3,
          tol: 0.5,
          check: '(0.50 * -1.00 - 0.05 - 0.04) * 100 - 1.30',
          why: 'Per share: −0.50 − 0.05 − 0.04 = −$0.59, so −$59 − $1.30 = −$60.30. Decay and costs are paid on winners and losers alike, so they shrink every win and deepen every loss.',
        },
        {
          kind: 'number',
          id: 'backtest-options-3',
          ask: 'Delta 0.50, decay $0.04 per share over the hold, spread $0.06, fees $1.30 per contract round trip. How far must the underlying move in your favour, in dollars, before the trade breaks even? Ignore gamma and give two decimals.',
          answer: 0.226,
          tol: 0.005,
          check: '(0.04 + 0.06 + 1.30 / 100) / 0.50',
          hint: 'Put every cost into dollars per share, then divide by delta.',
          why: 'Costs per share: 0.04 + 0.06 + 0.013 = $0.113. At delta 0.50 the underlying must move twice that, about $0.23, before you make anything. Every signal has to clear that hurdle on every trade.',
        },
        {
          kind: 'output',
          id: 'backtest-options-4',
          ask: "The delta-gamma estimate of an option's change for moves down and up. What does this print?",
          code: `delta, gamma = 0.40, 0.05
for move in (-2, 2):
    est = delta * move + 0.5 * gamma * move ** 2
    print(move, round(est, 2))`,
          answer: '-2 -0.7\n2 0.9',
          why: 'The gamma term ½ × 0.05 × 4 = 0.1 is positive both ways: a long option gains more than delta alone says on a move up and loses less on a move down. A delta-only model is therefore a little cautious for a bought option, before decay and volatility changes.',
        },
        {
          kind: 'bug',
          id: 'backtest-options-5',
          ask: 'This option P&L model starts and ends at mid prices. It flatters every trade, because the spread cost is only half of what you pay.',
          code: `def option_trade_pnl(delta, move, decay, spread, fee, contracts):
    per_share = delta * move - decay - spread / 2
    return per_share * 100 * contracts - fee * contracts`,
          line: 2,
          fix: '    per_share = delta * move - decay - spread',
          why: 'You pay half the spread when you buy at the ask and half again when you sell at the bid. Measured from mid to mid, the round trip costs the whole spread.',
        },
        {
          kind: 'choice',
          id: 'backtest-options-6',
          ask: 'Your opening-range signal tested on QQQ bars shows an expectancy of 0.00R before costs over 600 trades. You plan to trade it with 0DTE calls instead, because they move more. What should you expect?',
          options: [
            'The bigger percentage moves turn a flat signal into a profitable one',
            'No edge to amplify, plus spread, fees and decay: expect a loss',
            'The same 0.00R',
            'A higher win rate, since options move faster',
          ],
          answer: 1,
          why: 'An option magnifies whatever edge there is, and zero scaled is still zero. The option adds costs that the shares did not have, so the expected result is negative. Find an edge on the underlying first.',
        },
        {
          kind: 'choice',
          id: 'backtest-options-7',
          ask: 'A free data set gives the "last" price of each option at the end of the day. Why is it a poor basis for a backtest?',
          options: [
            'It is too precise',
            'The last trade on a thin strike can be hours old, and it is not a price you could have bought or sold at',
            'End-of-day data is always wrong',
            'Options do not trade at the end of the day',
          ],
          answer: 1,
          why: 'A strike that last traded at 11:00 shows that price at the close even if the stock has moved a lot since. A backtest needs the bid and ask at the time of each entry and exit.',
        },
        {
          kind: 'choice',
          id: 'backtest-options-8',
          ask: 'Your model uses delta, gamma and decay. You are long a call through an earnings report, the stock rises $2 as you expected, and the option still loses. What did the model leave out?',
          options: [
            'Gamma',
            'The fall in implied volatility after the news',
            'The multiplier of 100',
            'The commission',
          ],
          answer: 1,
          why: "Implied volatility usually falls once the news is out, and with it the option's extrinsic value. A model built on delta, gamma and decay cannot see that, so trades held through events must be checked against real prices or left out of the test.",
        },
        {
          kind: 'write',
          id: 'backtest-options-9',
          ask: 'Write `option_pnl`: the dollar P&L of a bought option position from the underlying move, using `delta × move + ½ × gamma × move² − decay − spread` per share, times 100 per contract, minus the round-trip fee per contract.',
          starter: `def option_pnl(move, delta, gamma, decay, spread, fee, contracts):
    # move: the underlying's change in dollars
    # decay and spread: dollars per share; fee: round trip per contract
    pass`,
          solution: `def option_pnl(move, delta, gamma, decay, spread, fee, contracts):
    per_share = delta * move + 0.5 * gamma * move ** 2 - decay - spread
    return (per_share * 100 - fee) * contracts`,
          tests: `out = option_pnl(2.0, 0.5, 0.0, 0.05, 0.04, 1.30, 1)
assert out is not None, "the function returns nothing yet"
assert abs(out - 89.7) < 1e-9, f"a $2 move at delta 0.5 with no gamma is $89.70, got {out}"
assert abs(option_pnl(1.5, 0.5, 0.05, 0.04, 0.06, 1.30, 1) - 69.325) < 1e-9, "with gamma 0.05 a $1.50 move gives $69.33"
assert abs(option_pnl(-1.0, 0.5, 0.0, 0.05, 0.04, 1.30, 3) - 3 * -60.3) < 1e-9, "three contracts lose three times as much"
assert abs(option_pnl(0.0, 0.5, 0.0, 0.0, 0.0, 0.0, 1)) < 1e-9, "no move and no costs is no P&L"`,
          why: 'One line of maths per share, then the multiplier and the fees. Every cost is subtracted whichever way the underlying moves.',
        },
        {
          kind: 'write',
          id: 'backtest-options-10',
          numpy: true,
          ask: 'Turn a backtest of the underlying into an option backtest. `moves` is an array of underlying moves, one per trade. Return the option result of each trade in R, where the risk per contract is `risk` dollars. Use the delta-only model: per share `delta × move − decay − spread`, then × 100 minus the fee.',
          starter: `import numpy as np

def option_r(moves, delta, decay, spread, fee, risk):
    moves = np.asarray(moves, dtype=float)
    # one R value per trade
    pass`,
          solution: `import numpy as np

def option_r(moves, delta, decay, spread, fee, risk):
    moves = np.asarray(moves, dtype=float)
    dollars = (delta * moves - decay - spread) * 100 - fee
    return dollars / risk`,
          tests: `out = option_r([2.0, -1.0], 0.5, 0.05, 0.04, 1.30, 100)
assert out is not None, "the function returns nothing yet"
assert np.shape(out) == (2,), f"one R per trade, got shape {np.shape(out)}"
assert np.allclose(out, [0.897, -0.603]), f"$89.70 and -$60.30 on $100 of risk, got {out}"
flat = option_r(np.zeros(4), 0.5, 0.05, 0.04, 1.30, 100)
assert np.allclose(flat, -0.103), f"trades where the underlying ends flat still lose the costs: -0.103R each, got {flat}"`,
          why: 'One array operation converts the whole trade list. The flat trades show the hurdle: on a signal with no edge, every option trade starts 0.1R behind.',
        },
        {
          kind: 'design',
          id: 'backtest-options-11',
          ask: 'Plan an honest backtest of an opening-range breakout traded with SPY calls, when you have years of SPY bars but no historical option quotes.',
          checklist: [
            { point: 'Test the signal on SPY bars first, with honest fills and stops, and stop there if it has no edge', why: 'The option cannot create an edge the entries lack.' },
            { point: 'Choose the option rule in advance: for example the nearest expiry with delta about 0.50', why: 'The model needs a delta, and choosing it after seeing results is another free parameter.' },
            { point: 'Convert each trade with delta (and gamma), decay over the hold and the full spread', why: 'This approximates the option P&L without option data.' },
            { point: 'Use spreads and fees that are cautious, for example wider at the open', why: 'Spreads are not constant, and optimistic costs flatter the test.' },
            { point: 'Leave out or flag trades held through news, where implied volatility can change sharply', why: 'The model cannot see volatility changes.' },
            { point: "Check a sample of trades against real quotes, for example from your broker's history or a data vendor", why: 'It shows whether the model is close enough to trust.' },
            { point: 'Keep an out-of-sample period, then paper trade the option version', why: 'The usual protections against overfitting still apply.' },
          ],
          why: 'Two cheap steps, the signal on the underlying and a cautious option model, remove most bad ideas. Real quotes and paper trading then test what the model cannot.',
        },
      ],
    },
    {
      id: 'backtest-lab',
      title: 'Lab: an opening range breakout backtest',
      summary: 'Made-up bars, an opening range, honest entries and exits, costs, statistics and an out-of-sample check, in Python and NumPy.',
      text: [
        "This lab builds a complete backtest of an **opening range breakout** on made-up 5-minute bars. The rule: the opening range is the high and low of the first `k` bars of the day. Go long on the first close above the range high, at the next bar's open. The stop is the range low, the target is `rr` times the risk above the entry, and anything still open is closed at the last bar of the day.",
        'The bars are a random walk generated from a fixed seed, so every run is the same. A random walk has no edge in it. That makes it the best possible test of a backtester: a correct one should show an expectancy close to zero before costs, and below zero after. If yours shows a strong edge on random data, it has a bug, almost always lookahead.',
        'The steps follow the order of the module: generate data, compute the levels, find signals with only past data, simulate exits with pessimistic rules, subtract costs, compute the statistics, and choose a parameter on the first part of the data before scoring it on the rest. Each step repeats the helpers it needs, so it runs on its own.',
      ],
      rules: [
        'Fix the seed: the same data every run, so results can be compared.',
        'Opening range from the first k bars; signals only from bars after them.',
        'Enter at the next open; stop first when a bar touches both; gaps fill at the open.',
        'Costs come off every trade in R.',
        'On random data a correct backtest finds no edge. A strong edge there is a bug.',
        'Choose parameters in-sample, score them once out-of-sample.',
      ],
      questions: [
        {
          kind: 'write',
          id: 'backtest-lab-1',
          numpy: true,
          ask: "Step 1: made-up bars. Return `o, h, l, c`, each of shape `(n_days, n_bars)`. Every day starts at 100. Each bar's close is the previous close plus a normal move with standard deviation 0.1; each open is the previous close (100 for the first bar); the high is the larger of open and close plus an absolute normal wick with standard deviation 0.05, and the low the smaller minus another.",
          starter: `import numpy as np

def make_bars(n_days, n_bars, seed):
    rng = np.random.default_rng(seed)
    # moves: normal(0, 0.1) of shape (n_days, n_bars); close = 100 + running sum along each day
    # open: 100 for the first bar, then the previous close
    # wicks: abs(normal(0, 0.05)) added above max(o, c) and below min(o, c)
    pass`,
          solution: `import numpy as np

def make_bars(n_days, n_bars, seed):
    rng = np.random.default_rng(seed)
    moves = rng.normal(0, 0.1, size=(n_days, n_bars))
    c = 100 + np.cumsum(moves, axis=1)
    o = np.concatenate([np.full((n_days, 1), 100.0), c[:, :-1]], axis=1)
    wick = np.abs(rng.normal(0, 0.05, size=(2, n_days, n_bars)))
    h = np.maximum(o, c) + wick[0]
    l = np.minimum(o, c) - wick[1]
    return o, h, l, c`,
          tests: `out = make_bars(200, 78, 1)
assert out is not None, "the function returns nothing yet"
o, h, l, c = out
assert o.shape == (200, 78) and c.shape == (200, 78), f"each array should be (days, bars) = (200, 78), got {o.shape}"
assert np.all(o[:, 0] == 100), "every day should open at 100"
assert np.allclose(o[:, 1:], c[:, :-1]), "each open should be the previous bar's close"
assert np.all(h >= np.maximum(o, c)) and np.all(l <= np.minimum(o, c)), "the high must be at least the open and close, the low at most"
assert abs(np.diff(c, axis=1).std() - 0.1) < 0.005, "close-to-close moves should have a standard deviation of about 0.1"
o2, h2, l2, c2 = make_bars(200, 78, 1)
assert np.array_equal(c, c2), "the same seed must give the same bars"
assert not np.array_equal(c, make_bars(200, 78, 2)[3]), "a different seed should give different bars"`,
          why: 'A cumulative sum of random moves is a random walk, and the wicks make sure the high and low wrap the open and close as real bars do. The fixed seed makes every later step reproducible.',
        },
        {
          kind: 'write',
          id: 'backtest-lab-2',
          numpy: true,
          ask: 'Step 2: the opening range. Return two arrays of shape `(n_days,)`: the highest high and the lowest low of the first `k` bars of each day.',
          starter: `import numpy as np

def opening_range(h, l, k):
    # h, l: (n_days, n_bars)
    pass`,
          solution: `import numpy as np

def opening_range(h, l, k):
    return h[:, :k].max(axis=1), l[:, :k].min(axis=1)`,
          tests: `h = np.array([[101.0, 102.0, 101.5, 105.0], [100.5, 100.2, 100.9, 99.0]])
l = np.array([[99.0, 100.0, 100.5, 101.0], [99.8, 98.5, 99.9, 97.0]])
out = opening_range(h, l, 3)
assert out is not None, "the function returns nothing yet"
hi, lo = out
assert np.shape(hi) == (2,), f"one value per day, got shape {np.shape(hi)}"
assert np.allclose(hi, [102.0, 100.9]), f"the highs of the first 3 bars are 102.0 and 100.9, got {hi}: do not include bar 3"
assert np.allclose(lo, [99.0, 98.5]), f"the lows of the first 3 bars are 99.0 and 98.5, got {lo}"
assert np.allclose(opening_range(h, l, 1)[0], [101.0, 100.5]), "with k = 1 the range is the first bar"`,
          why: '`h[:, :k]` is the first k bars of every day at once, and `axis=1` reduces along the bars. Bars from k on are left out, so the level is known before any signal is looked for.',
        },
        {
          kind: 'write',
          id: 'backtest-lab-3',
          numpy: true,
          ask: 'Step 3: the entries. For each day, find the first bar `j` from `k` on whose close is above the range high, and return the entry bar `j + 1`. If there is no signal, or the signal is on the last bar, return −1 for that day.',
          starter: `import numpy as np

def entry_bars(c, or_high, k):
    n_days, n_bars = c.shape
    out = np.full(n_days, -1)
    # for each day, scan bars k .. n_bars - 2 for the first close above or_high[d]
    return out`,
          solution: `import numpy as np

def entry_bars(c, or_high, k):
    n_days, n_bars = c.shape
    out = np.full(n_days, -1)
    for d in range(n_days):
        for j in range(k, n_bars - 1):
            if c[d, j] > or_high[d]:
                out[d] = j + 1
                break
    return out`,
          tests: `c = np.array([
    [100.0, 100.5, 101.0, 102.5, 103.0, 103.5],
    [100.0, 100.2, 99.8, 100.1, 100.0, 100.3],
    [100.0, 100.4, 100.2, 100.3, 100.1, 101.0],
    [100.0, 101.5, 100.0, 100.5, 100.0, 100.2],
])
or_high = np.array([101.2, 100.5, 100.5, 101.0])
out = entry_bars(c, or_high, 3)
assert out is not None, "the function returns nothing yet"
assert out[0] == 4, f"day 0: the close of bar 3 breaks out, so the entry is bar 4, got {out[0]}"
assert out[1] == -1, f"day 1 never closes above 100.5, got {out[1]}"
assert out[2] == -1, f"day 2 breaks out only on the last bar, with no bar left to enter on, got {out[2]}"
assert out[3] == -1, f"day 3: bar 1 is above the level but it is inside the opening range, so it does not count, got {out[3]}"`,
          why: 'Two rules keep it honest: signals are only looked for after the opening range is complete, and the entry is the bar after the signal. A signal on the last bar has nowhere to be filled.',
        },
        {
          kind: 'bug',
          id: 'backtest-lab-4',
          ask: 'Step 4: a lookahead bug. `j` is the bar whose close gave the signal. On random data, this version shows a large positive edge.',
          code: `def plan_trade(o, d, j, or_low, rr):
    # the signal came from the close of bar j on day d
    entry = o[d, j]
    risk = entry - or_low[d]
    target = entry + rr * risk
    return entry, or_low[d], target`,
          line: 3,
          fix: '    entry = o[d, j + 1]',
          why: 'It buys at the open of the bar whose close made the signal. That bar closed above the range, so it usually rose from its open: the backtest books that rise without having been able to trade it. On the lab\'s random bars this alone turns an expectancy a little below zero into one well above it. The fill must be the open of bar j + 1.',
        },
        {
          kind: 'write',
          id: 'backtest-lab-5',
          ask: "Step 5: the exit. For one day's bars (1-D lists or arrays), starting at bar `start` with a long position, return the exit price: a gap through the stop or target fills at the open, then the stop is checked before the target, and if neither is hit the trade closes at the last close of the day.",
          starter: `def exit_price(o, h, l, c, start, stop, target):
    # walk the bars from start to the end of the day
    pass`,
          solution: `def exit_price(o, h, l, c, start, stop, target):
    for i in range(start, len(o)):
        if o[i] <= stop or o[i] >= target:
            return o[i]
        if l[i] <= stop:
            return stop
        if h[i] >= target:
            return target
    return c[-1]`,
          tests: `o = [100.0, 100.4, 100.8, 101.1]
h = [100.5, 100.9, 101.2, 101.3]
l = [99.9, 100.2, 100.6, 100.9]
c = [100.4, 100.8, 101.1, 101.2]
out = exit_price(o, h, l, c, 1, 99.5, 102.0)
assert out is not None, "the function returns nothing yet"
assert out == 101.2, f"neither level is reached, so the trade closes at the last close, 101.2, got {out}"
assert exit_price(o, h, l, c, 1, 99.5, 101.0) == 101.0, "the target 101.0 is reached in bar 2"
assert exit_price(o, h, l, c, 1, 100.3, 101.0) == 100.3, "bar 1 reaches the stop 100.3 before bar 2 reaches the target"
assert exit_price(o, h, l, c, 1, 100.3, 100.85) == 100.3, "bar 1 touches both 100.3 and 100.85: assume the stop"
assert exit_price([100.0, 99.0], [100.2, 99.1], [99.8, 98.7], [100.0, 98.9], 1, 99.5, 101.0) == 99.0, "a gap below the stop fills at the open, 99.0"`,
          why: 'The same policy as in the lesson on writing a backtest, now over a whole day. Every choice that is uncertain goes against you, so the test errs on the cautious side.',
        },
        {
          kind: 'write',
          id: 'backtest-lab-6',
          numpy: true,
          ask: 'Step 6: the backtest. Put the pieces together: for each day with an entry, buy at the open of the entry bar, stop at the range low, target at `entry + rr × risk`, find the exit, and record `(exit − entry) / risk − cost`. Return a NumPy array of R, one per trade, in date order.',
          starter: `import numpy as np

def opening_range(h, l, k):
    return h[:, :k].max(axis=1), l[:, :k].min(axis=1)

def entry_bars(c, or_high, k):
    n_days, n_bars = c.shape
    out = np.full(n_days, -1)
    for d in range(n_days):
        for j in range(k, n_bars - 1):
            if c[d, j] > or_high[d]:
                out[d] = j + 1
                break
    return out

def exit_price(o, h, l, c, start, stop, target):
    for i in range(start, len(o)):
        if o[i] <= stop or o[i] >= target:
            return o[i]
        if l[i] <= stop:
            return stop
        if h[i] >= target:
            return target
    return c[-1]

def run_backtest(o, h, l, c, k, rr, cost):
    or_high, or_low = opening_range(h, l, k)
    starts = entry_bars(c, or_high, k)
    r = []
    # one trade per day with an entry
    return np.array(r)`,
          solution: `import numpy as np

def opening_range(h, l, k):
    return h[:, :k].max(axis=1), l[:, :k].min(axis=1)

def entry_bars(c, or_high, k):
    n_days, n_bars = c.shape
    out = np.full(n_days, -1)
    for d in range(n_days):
        for j in range(k, n_bars - 1):
            if c[d, j] > or_high[d]:
                out[d] = j + 1
                break
    return out

def exit_price(o, h, l, c, start, stop, target):
    for i in range(start, len(o)):
        if o[i] <= stop or o[i] >= target:
            return o[i]
        if l[i] <= stop:
            return stop
        if h[i] >= target:
            return target
    return c[-1]

def run_backtest(o, h, l, c, k, rr, cost):
    or_high, or_low = opening_range(h, l, k)
    starts = entry_bars(c, or_high, k)
    r = []
    for d in range(len(o)):
        j = starts[d]
        if j < 0:
            continue
        entry = o[d, j]
        stop = or_low[d]
        risk = entry - stop
        target = entry + rr * risk
        x = exit_price(o[d], h[d], l[d], c[d], j, stop, target)
        r.append((x - entry) / risk - cost)
    return np.array(r)`,
          tests: `o = np.array([[100.0, 100.5, 100.2, 101.2, 101.6, 102.0], [100.0, 99.8, 99.6, 99.9, 99.7, 99.5]])
c = np.array([[100.5, 100.2, 101.2, 101.6, 102.0, 102.2], [99.8, 99.6, 99.9, 99.7, 99.5, 99.4]])
h = np.maximum(o, c) + 0.1
l = np.minimum(o, c) - 0.1
out = run_backtest(o, h, l, c, 2, 2.0, 0.0)
assert out is not None, "the function returns nothing yet"
assert len(out) == 1, f"only day 0 breaks out above its opening range, so there is 1 trade, got {len(out)}"
entry, stop = 101.2, 99.9
assert abs(out[0] - (102.2 - entry) / (entry - stop)) < 1e-9, f"day 0: enter at 101.2 (open of bar 3), stop 99.9, no target hit, exit at the last close 102.2; got R = {out[0]}"
assert abs(run_backtest(o, h, l, c, 2, 2.0, 0.1)[0] - (out[0] - 0.1)) < 1e-9, "the cost comes off each trade in R"
rng = np.random.default_rng(1)
moves = rng.normal(0, 0.1, size=(300, 78))
cc = 100 + np.cumsum(moves, axis=1)
oo = np.concatenate([np.full((300, 1), 100.0), cc[:, :-1]], axis=1)
wick = np.abs(rng.normal(0, 0.05, size=(2, 300, 78)))
hh, ll = np.maximum(oo, cc) + wick[0], np.minimum(oo, cc) - wick[1]
r = run_backtest(oo, hh, ll, cc, 6, 2.0, 0.0)
assert len(r) > 150, f"on 300 random days most days should break out at some point, got {len(r)} trades"
assert abs(r.mean()) < 0.2, f"on a random walk the expectancy before costs should be near zero, got {r.mean():.3f}: look for lookahead"`,
          why: 'The loop reads like the rules, one day at a time. On random bars the expectancy comes out close to zero or a little below it: the pessimistic fills cost a little, and there is nothing to find. That is the result a correct backtester must give on data with no edge.',
        },
        {
          kind: 'write',
          id: 'backtest-lab-7',
          numpy: true,
          ask: 'Step 7: the statistics. Return a dict with `n`, `win_rate`, `expectancy`, `profit_factor` and `max_drawdown` for an array of R. Scratches are not wins, the equity curve starts at 0, and with no losses the profit factor is `float("inf")`.',
          starter: `import numpy as np

def stats(r):
    r = np.asarray(r, dtype=float)
    pass`,
          solution: `import numpy as np

def stats(r):
    r = np.asarray(r, dtype=float)
    loss = -r[r < 0].sum()
    equity = np.concatenate([[0.0], np.cumsum(r)])
    return {
        'n': len(r),
        'win_rate': float((r > 0).mean()),
        'expectancy': float(r.mean()),
        'profit_factor': float(r[r > 0].sum() / loss) if loss > 0 else float('inf'),
        'max_drawdown': float((np.maximum.accumulate(equity) - equity).max()),
    }`,
          tests: `out = stats([1.0, -1.0, -1.0, 2.0, 0.0, -1.0, 3.0])
assert out is not None, "the function returns nothing yet"
assert out['n'] == 7, f"7 trades, got {out['n']}"
assert abs(out['win_rate'] - 3 / 7) < 1e-9, f"3 of 7 trades are above zero, got {out['win_rate']}"
assert abs(out['expectancy'] - 3 / 7) < 1e-9, f"the R values add to 3 over 7 trades, got {out['expectancy']}"
assert abs(out['profit_factor'] - 2.0) < 1e-9, f"6R of wins over 3R of losses is 2.0, got {out['profit_factor']}"
assert abs(out['max_drawdown'] - 2.0) < 1e-9, f"the curve goes 1, 0, -1: a 2R drawdown, got {out['max_drawdown']}"
assert abs(stats([-1.0, -1.0])['max_drawdown'] - 2.0) < 1e-9, "start the equity curve at 0"
assert stats([1.0])['profit_factor'] == float('inf'), "no losses gives an infinite profit factor"`,
          why: 'The same five numbers as in the statistics lesson. With them in one function, every variant of the backtest can be compared in the same terms.',
        },
        {
          kind: 'write',
          id: 'backtest-lab-8',
          numpy: true,
          ask: 'Step 8: in-sample and out-of-sample. `results` maps each value of `k` to a pair `(days, r)`: the day number of each trade and its R. Choose the `k` with the highest mean R on days before `cut`, and return `(best_k, in_sample_mean, out_of_sample_mean)` for that `k`, the last measured on days from `cut` on.',
          starter: `import numpy as np

def split_test(results, cut):
    # results: {k: (days, r)} with days and r as arrays of the same length
    pass`,
          solution: `import numpy as np

def split_test(results, cut):
    best = None
    for k, (days, r) in results.items():
        days, r = np.asarray(days), np.asarray(r, dtype=float)
        ins = r[days < cut].mean()
        if best is None or ins > best[1]:
            best = (k, float(ins), float(r[days >= cut].mean()))
    return best`,
          tests: `results = {
    3: (np.array([0, 1, 2, 5, 6, 7]), np.array([1.0, -1.0, 1.0, -1.0, 1.0, -1.0])),
    6: (np.array([0, 2, 3, 5, 7]), np.array([2.0, 1.0, -1.0, -1.0, -1.0])),
    12: (np.array([1, 4, 6]), np.array([-1.0, 0.5, 2.0])),
}
out = split_test(results, 5)
assert out is not None, "the function returns nothing yet"
k, ins, oos = out
assert k == 6, f"k = 6 has the best in-sample mean, (2 + 1 - 1) / 3 = 0.667, got k = {k}"
assert abs(ins - 2 / 3) < 1e-9, f"the in-sample mean of k = 6 is 0.667, got {ins}"
assert abs(oos + 1.0) < 1e-9, f"out-of-sample, k = 6 has trades on days 5 and 7, both -1: mean -1.0, got {oos}"
k, _, _ = split_test({3: results[3]}, 5)
assert k == 3, "with one choice, that choice is returned"`,
          why: 'The choice is made only on days before the cut, and the score only on days after. In this example the in-sample winner loses out-of-sample, while a setting that looked worse did better: picking the best of a few on short samples mostly picks noise.',
        },
        {
          kind: 'design',
          id: 'backtest-lab-9',
          ask: 'Step 9: reading the result. On real SPY bars, your backtest of this breakout shows +0.12R per trade over 180 trades in-sample with k = 6, and +0.04R over 60 trades out-of-sample, both after costs. What do you conclude, and what do you do next?',
          checklist: [
            { point: 'The out-of-sample edge is a third of the in-sample one: some of the result was fitted', why: 'The drop measures how much the choice of k fitted noise.' },
            { point: 'Compute the standard error: 60 trades with a spread of about 1R gives about 0.13R, so 0.04R is well inside the noise', why: 'The out-of-sample result cannot tell an edge from no edge.' },
            { point: 'Check that costs are realistic for the instrument you will trade, especially if it is options', why: 'An edge of 0.04R is smaller than typical option costs per trade.' },
            { point: 'Look at neighbouring values of k for a plateau', why: 'If k = 5 and 7 do nothing, k = 6 is likely a spike.' },
            { point: 'Rerun the backtest on the random bars from step 1 to check it shows no edge there', why: 'A backtester that finds an edge in random data has a bug.' },
            { point: 'Do not tune again on the out-of-sample data; collect more by paper trading the frozen rules', why: 'New data is the only honest way to learn more.' },
            { point: 'Do not trade it with real size on this evidence', why: 'The evidence does not show an edge larger than costs and noise.' },
          ],
          why: 'The honest conclusion of most backtests is "not proven". That is a useful answer: it costs nothing, where finding out with real money costs a lot.',
        },
      ],
    },
  ],
}
