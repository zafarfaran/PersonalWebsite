import type { Block } from '../../types'

/** The full theory for each lesson of the backtest module, keyed by lesson id. */
export const backtestTheory: Record<string, Block[]> = {
  'backtest-journal': [
    { h: 'Why a record beats memory' },
    'A **trade** is one round trip: you open a position and later close it. After a few weeks of trading, memory gives you a story about those trades, not the trades themselves. The big winner stays vivid. The five small losers before it fade. The trade where you broke your own rule gets explained away. None of that can be measured.',
    'A **trading journal** is a table with one row per trade, filled in the same way every time. It turns your trading into data. Once you have the data you can ask the questions that matter: does this setup make money, how often do I break my rules, and what do the breaks cost?',
    { sub: 'The same list from two sources' },
    'A **backtest** replays a set of rules on past prices and produces a list of trades that the rules would have taken. A journal produces the list of trades you really took, on paper or with money. The rest of this module treats both lists the same way, with the same statistics. Comparing them later is how you find out whether you trade the way your backtest assumes.',

    { h: 'What goes in each row' },
    {
      list: [
        '**When and what**: date, time in, time out, ticker, long or short.',
        '**The plan**: setup, entry price, stop price, target price, size, written before the trade is closed.',
        '**The result**: exit price, fees, net profit or loss (**P&L**) in dollars after fees.',
        '**The risk**: the dollars you planned to lose if the stop was hit, and the **R multiple** (explained below).',
        '**The judgement**: did you follow the plan, yes or no, a screenshot of the chart and one line of notes.',
      ],
    },
    { sub: 'Extra fields for option trades' },
    'An option contract covers 100 shares, so its prices are quoted per share and multiplied by 100. For an option trade, also record the strike, the expiry, call or put, the option bid and ask at entry and at exit, and the price of the **underlying** (the stock or ETF the option is on) at entry and at exit. Without the underlying prices you cannot tell whether a losing option trade lost because the stock went the wrong way or because the spread and time decay ate a small move.',

    { h: 'The R multiple' },
    'Dollars are a poor way to compare trades, because the size changes. A $200 win on a trade that risked $1,000 is not as good as a $200 win on a trade that risked $100. The **R multiple** fixes this by measuring every result in units of the risk you planned to take.',
    '**Planned risk** is what you would lose if the trade hit its stop: the distance from the entry to the stop, times the number of shares. For a bought option it is the premium you would lose at your stop, times 100, times the number of contracts. Then `R = net P&L ÷ planned risk`, where net P&L is after fees.',
    { sub: 'A worked example' },
    'You buy 50 shares at $80.00 with a stop at $79.00. Planned risk is $1.00 × 50 = $50. You sell at $82.50, a gain of $2.50 × 50 = $125, and pay $1 in fees, so the net P&L is $124. The trade is 124 ÷ 50 = +2.48R. A trade stopped out exactly at its stop, with no fees, is −1R.',
    {
      code: `def r_long(entry, stop, exit, qty, fees):
    risk = (entry - stop) * qty
    pnl = (exit - entry) * qty - fees
    return round(pnl / risk, 2)

print(r_long(80, 79, 82.5, 50, 1))
print(r_long(80, 79, 78.6, 50, 1))`,
      out: `2.48
-1.42`,
    },
    'The second trade gapped through the stop and was sold at $78.60, so it lost more than planned: −1.42R. That number tells the truth about the trade. For a **short** trade, where you profit when the price falls, the stop sits above the entry and the price change is flipped in sign.',

    { h: 'Tags for setups and for mistakes' },
    { sub: 'One setup tag from a fixed list' },
    'A **setup** is a named pattern you trade, such as an opening range breakout or a pullback to VWAP. Keep a short fixed list of names and give every trade exactly one. Free text like "breakout-ish" cannot be grouped, and grouping is the point: you want the statistics of each setup on its own.',
    { sub: 'Mistake tags' },
    'Keep a separate list for mistakes: `late-entry`, `moved-stop`, `no-setup`, `oversized`. Mixing them into setup names hides them. Counted separately, they tell you what each habit costs.',
    {
      code: `from collections import Counter

mistakes = ['late-entry', 'moved-stop', 'late-entry', 'oversized', 'late-entry']
print(Counter(mistakes).most_common(2))`,
      out: `[('late-entry', 3), ('moved-stop', 1)]`,
    },

    { h: 'Writing the plan before the outcome' },
    '**Hindsight bias** is the habit of believing, once you know an outcome, that you saw it coming. Write the reason for a trade after it has closed and the reason bends to fit the result. So the plan goes in first, and the outcome is added afterwards.',
    'The same honesty applies to R. Suppose you planned to risk $80, then moved your stop when price got close, and closed for a $200 loss. The trade is −2.5R, measured against the $80 you planned. Recording it as −1R would hide exactly the behaviour the journal exists to catch.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Leaving out the trades that embarrass them. The statistics then describe someone else.',
        'Measuring R against the actual loss instead of the planned risk, which makes every blown stop look like −1R.',
        'Recording gross P&L and forgetting fees, which flatters every row.',
        'Filling in the journal days later from memory, when the details have already been rewritten.',
        'Judging a setup on five trades because the tags make it easy to look.',
      ],
    },
  ],

  'backtest-stats': [
    { h: 'A trade list as data' },
    'Whether it comes from a backtest or a journal, the raw material is the same: a list of R multiples in the order the trades happened. Take this list of ten trades as the example for the whole lesson: 3, −1, −1, −1, 1.5, −1, 0, 2, −1, −1.',
    'A handful of numbers describe such a list. Each answers a different question, and none of them is enough on its own.',

    { h: 'Win rate and the averages' },
    'The **win rate** is the share of trades with an R above zero. Here three trades win (3, 1.5 and 2), so the win rate is 3 out of 10, or 30%.',
    'The **average win** is the mean of the winning trades: (3 + 1.5 + 2) ÷ 3 ≈ 2.17R. The **average loss** is the mean size of the losing trades: six losses of 1R, so 1R.',
    { sub: 'Scratches' },
    'A **scratch** is a trade closed at about 0R. Decide in advance whether it counts as a win, and keep to that decision in every test you compare. Here scratches are not wins, so the 0 in the list is neither a win nor a loss. Counting scratches as wins raises the win rate of a strategy that often closes flat, without changing how much money it makes.',

    { h: 'Expectancy' },
    '**Expectancy** is the average R per trade: add up all the R values and divide by the number of trades. The list adds to 3 + 1.5 + 2 − 6 = 0.5R over 10 trades, an expectancy of 0.05R. The risk module showed the same number another way: win rate × average win − loss rate × average loss. Here that is 0.3 × 2.17 − 0.6 × 1 = 0.05. The loss rate is 60%, not 70%, because of the scratch.',
    'Expectancy is the number that says whether a list paid. A high win rate with large occasional losses can have negative expectancy; a low win rate with large winners can have positive expectancy.',

    { h: 'Profit factor' },
    'The **profit factor** is gross wins divided by gross losses, both taken as positive numbers. Here it is 6.5 ÷ 6 ≈ 1.08. Above 1 the list made money, below 1 it lost, and exactly 1 is breaking even.',
    { sub: 'Why it is worth having beside expectancy' },
    'Profit factor shows how much room there is. A profit factor of 1.08 means the wins only barely cover the losses: a small cost per trade that you forgot to include would turn it below 1. If there are no losing trades at all, the division is by zero and the profit factor is taken as infinite, which mostly means the sample is too small.',

    { h: 'Maximum drawdown' },
    { sub: 'Building the equity curve' },
    'The **equity curve** is the running total of R after each trade, starting from 0 before the first trade. For the example list it goes 0, 3, 2, 1, 0, 1.5, 0.5, 0.5, 2.5, 1.5, 0.5. Next to it keep the **running peak**: the highest value reached so far. A **drawdown** is the gap between the peak and the curve. The **maximum drawdown** is the largest such gap. Here the curve peaks at 3 and later falls to 0, a maximum drawdown of 3R.',
    {
      code: `import numpy as np

r = np.array([3, -1, -1, -1, 1.5, -1, 0, 2, -1, -1])
equity = np.concatenate([[0], np.cumsum(r)])
peak = np.maximum.accumulate(equity)
print(equity.tolist())
print((peak - equity).max())`,
      out: `[0.0, 3.0, 2.0, 1.0, 0.0, 1.5, 0.5, 0.5, 2.5, 1.5, 0.5]
3.0`,
    },
    '`np.cumsum` gives the running total and `np.maximum.accumulate` the running peak. Putting 0 at the front matters: if a list starts with losses, the fall from your starting balance is a drawdown too, and without the 0 it is never counted.',
    { sub: 'In dollars and percent' },
    'In money, drawdown is measured from the peak balance. An account that rises to $20,000 and then falls to $17,000 has a drawdown of $3,000, which is 15% of the peak.',

    { h: 'Order matters only for drawdown' },
    'Shuffle the list and the win rate, expectancy and profit factor stay exactly the same: they are counts and sums, and sums do not care about order. The drawdown changes, because it depends on how losses bunch together. Put all six losses first and the drawdown becomes 6R. The figure lets you try this. Your future trades will not arrive in the order of your backtest, so treat the backtest drawdown as a low guess.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Choosing a strategy on win rate alone.',
        'Starting the equity curve at the first trade instead of at 0.',
        'Counting scratches as wins in one test and not in another, then comparing them.',
        'Expecting live drawdowns to be no deeper than the backtest showed.',
      ],
    },
  ],

  'backtest-luck': [
    { h: 'A win rate is an estimate' },
    'Every setup has some true chance of winning that you cannot see. What you can see is how often it won in the trades you have. Those two numbers differ by luck, the same way a fair coin tossed ten times can easily land heads seven times.',
    'The question is how big that difference usually is. If it is large compared with the edge you think you have, your result does not tell you much yet.',

    { h: 'The standard error of a win rate' },
    { sub: 'The formula' },
    'Call the true win rate p and the number of trades n. The **standard error** is the typical size of the gap between the win rate you measure and the true one: `√(p(1 − p) / n)`. You do not know p, so you plug in the win rate you measured. About 95% of the time, the measured rate is within two standard errors of the true one, so "measured rate ± two standard errors" is a rough range for the truth.',
    { sub: 'A worked example' },
    'A setup won 45% of 80 trades. The standard error is √(0.45 × 0.55 ÷ 80) = √0.0031 ≈ 0.056, about 5.6 percentage points. Two of them is about 11 points, so the true win rate could be anywhere from about 34% to 56%. That range includes rates that make money and rates that lose it.',
    { sub: 'Four times the trades for half the error' },
    'The trade count sits under a square root, so the error shrinks slowly. Quadruple the trades and the error halves.',
    {
      code: `import math

for n in (25, 100, 400, 1600):
    two_se = 2 * math.sqrt(0.4 * 0.6 / n)
    print(n, round(100 * two_se, 1))`,
      out: `25 19.6
100 9.8
400 4.9
1600 2.4`,
    },
    'At a 40% win rate, 25 trades leave you nearly 20 points either way. It takes over a thousand trades to get within 2 or 3 points. A setup that triggers twice a month gives you about 24 trades a year.',

    { h: 'The standard error of expectancy' },
    'The same idea applies to the average R. Its standard error is the **standard deviation** of the R values (how spread out they are around their average) divided by √n. When you estimate a standard deviation from a sample, use the **sample** version, which divides by n − 1 instead of n; in NumPy that is `np.std(r, ddof=1)`.',
    { sub: 'The t statistic' },
    'Divide the average R by its standard error and you get the **t statistic**: how many standard errors the average is away from zero. Say 64 trades average 0.15R with a standard deviation of 1.4R. The standard error is 1.4 ÷ 8 = 0.175, and t = 0.15 ÷ 0.175 ≈ 0.86. Below about 2, an average that size turns up by luck all the time. Above 2 it is less likely to be luck, but only if this was the one idea you tested.',

    { h: 'The lucky coin' },
    'Test many ideas on the same data and the best one will look good whether or not any of them works. Take a fair coin tossed 40 times. The chance it lands heads 26 or more times is small. But toss 30 such coins and the chance that at least one of them does it is much larger.',
    {
      code: `from math import comb

p_one = sum(comb(40, k) for k in range(26, 41)) / 2 ** 40
p_any = 1 - (1 - p_one) ** 30
print(round(p_one, 3), round(p_any, 2))`,
      out: `0.04 0.71`,
    },
    '`comb(40, k)` counts the ways to get k heads in 40 tosses, and there are 2⁴⁰ equally likely sequences in all. One coin has about a 4% chance. The chance that none of 30 coins gets there is (1 − 0.04)³⁰, so the chance that at least one does is about 71%. A backtest search over 30 variations of a setup is the same experiment. Picking the best of many results picks the luckiest; this is called **multiple testing**, or **p-hacking** in research.',

    { h: 'Protecting yourself from luck' },
    {
      list: [
        'Write down every variation you test, including the ones you throw away.',
        'Decide the number of trades before you judge a result, and do not stop early because it looks good.',
        'Work out the standard error before getting excited about a win rate.',
        'Expect the best of many tests to do worse on new data.',
        'Keep the stake small while the sample is small.',
      ],
    },

    { h: 'Mistakes beginners make' },
    'Trusting 20 trades. Dividing by n instead of √n, which makes a sample look ten times more precise than it is at 100 trades. Forgetting how many ideas were tried before the one that worked. And reading "not proven" as "proven wrong": a small sample cannot tell either way.',
  ],

  'backtest-code': [
    { h: 'What a backtest does' },
    'A **backtest** replays the past one price bar at a time. A **bar** summarises a stretch of time, such as five minutes, by four prices: the open, high, low and close (OHLC). At each bar the backtest asks one question: knowing only what was known at that moment, what would the rules have done? The answer is a list of trades, and the statistics of that list are the result.',
    'Everything that makes a backtest honest or dishonest lives in the phrase "knowing only what was known at that moment".',

    { h: 'Rules a computer can follow' },
    { sub: 'Vague words are hidden parameters' },
    '"Buy when it looks strong" cannot be coded. "Buy at the open of the next bar after the first 5-minute close above yesterday\'s high, before 10:30, with a stop at the low of the signal bar" can. Every vague word has to become a number, and each of those numbers is a **parameter**: a setting you could change. If you leave a word vague, you end up choosing its meaning after seeing results, which fits the rules to the past.',
    { sub: 'What a complete rule set names' },
    'The data and bar size, the trigger, the time window, the entry price, the stop, the target, a time exit, how many trades per day, and the costs. If two people could code your rules and get different trades, the rules are not finished.',

    { h: 'The loop, bar by bar' },
    { sub: 'Signals at the close, fills at the next open' },
    'A signal based on a bar\'s close only exists once that bar has finished. By then the next price you can trade at is the open of the next bar. So a signal at the close of bar i is filled at the open of bar i + 1. Filling at the close or the open of bar i itself uses a price from before you could have known.',
    {
      code: `o = [50.0, 50.4, 50.2, 50.9, 51.3]
h = [50.5, 50.6, 50.8, 51.4, 51.6]
c = [50.4, 50.2, 50.9, 51.3, 51.5]
for i in range(2, len(c) - 1):
    if c[i] > max(h[i - 2:i]):        # highs of the two bars before only
        print('signal at bar', i, 'buy at', o[i + 1])
        break`,
      out: 'signal at bar 2 buy at 50.9',
    },
    'The slice `h[i - 2:i]` stops before bar i, because a close can never be above its own bar\'s high. The loop stops one bar early so that `o[i + 1]` always exists.',

    { h: 'Exits inside a bar' },
    { sub: 'Stops and targets' },
    'For a long trade, the stop is hit if the bar\'s low reaches it and the target is hit if the bar\'s high reaches it. Checking the close instead misses every bar that dipped through the stop and recovered, and your real stop order would have filled on those.',
    { sub: 'Gaps' },
    'If a bar opens beyond your stop, the stop fills at that open, not at the stop price. Long from $40.00 with a stop at $39.50, a bar that opens at $39.20 fills you at $39.20: −1.6R, not −1R. The same goes for a target: a gap above it fills at the open.',
    { sub: 'Both levels in one bar' },
    'Sometimes a bar\'s range includes both the stop and the target. OHLC data cannot say which came first. The cautious rule is to assume the stop. If many trades hit this case, test with smaller bars, because the assumption may be deciding your result.',

    { h: 'Time exits and one trade at a time' },
    'A **time exit** closes the trade after a set number of bars or at a set time, for example before the close so that nothing is held overnight. While a trade is open, further signals are usually ignored. Counting overlapping signals as separate trades turns one market move into several results that are not independent, which makes a sample look larger than it is.',

    { h: 'From trades to statistics' },
    'The backtest\'s output is a list of trades: entry bar, exit bar, prices and R. From there the statistics lesson applies. A plain Python loop like the one above is slower than array code that works on every bar at once, but it reads like the rules and makes it hard to use a price before its time. Write it as a loop first; speed it up only once it is right, and check that both versions give the same trades.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Entering at the close or open of the bar that produced the signal.',
        'Including the current bar in a level it is supposed to break.',
        'Checking stops against the close.',
        'Filling gapped stops at the stop price.',
        'Counting ambiguous bars as wins.',
      ],
    },
  ],

  'backtest-lies': [
    { h: 'Why backtests flatter' },
    'A backtest is a program, and programs do what they are told, including things that were impossible in real time. Nearly every mistake in a backtest makes the result look better, not worse, because a result that looks bad gets checked and a result that looks good gets believed. Five kinds of mistake cause most of the damage.',

    { h: 'Lookahead bias' },
    '**Lookahead bias** is using information that did not exist yet at the moment of the decision.',
    { sub: 'How it gets in' },
    {
      list: [
        'Entering at a price from the bar whose close made the signal.',
        'Using a level such as the day\'s high or low before the day has ended.',
        'Scaling an indicator with the average or range of the whole data set, which includes the future.',
        'Using a data set that has been corrected after the fact, such as revised figures.',
      ],
    },
    { sub: 'A test for it' },
    'Run the backtest on made-up random prices that contain no edge. A correct backtester shows an average close to zero before costs. If it finds a strong edge in random data, something is reading the future. The lab uses this test.',

    { h: 'Survivorship bias' },
    '**Survivorship bias** comes from testing only what still exists. Take today\'s list of the largest companies and test a strategy on them over the past ten years: you have quietly removed every company that shrank, was taken over or went bankrupt. Those are often exactly the cases where a strategy lost. A fair test uses the list as it stood on each past date, which needs data that keeps delisted companies.',

    { h: 'Overfitting' },
    '**Overfitting** is tuning rules until they match the noise of the past. Every parameter (a length, a threshold, a time of day, a filter) is another way for the test to fit chance.',
    { sub: 'Counting parameters' },
    'A useful habit is to count every setting you tried, not only the ones in the final rules. Ten settings tried on 80 trades leave very little evidence per decision. The more parameters and the fewer trades, the more the result describes your data and the less it describes the market.',

    { h: 'Costs and slippage' },
    'Every trade pays **commissions** and per-contract **fees**, crosses the **spread** (the gap between the bid and the ask), and often fills a little worse than the price on the screen, which is called **slippage**. A backtest that leaves these out is testing a market that does not exist.',
    { sub: 'Costs in R' },
    'Put the costs on the same scale as the results: cost in R = cost per trade ÷ risk per trade. Measured from the mid price, a round trip pays half the spread going in and half coming out, so the whole spread. An option with a $0.04 spread costs $4 per contract for the round trip; add made-up fees of $1.30 and the cost is $5.30. On $80 of risk that is about 0.066R a trade.',
    {
      code: `cost = 8.0                     # dollars per round trip
for risk in (40, 100, 250):
    print(risk, round(cost / risk, 3))`,
      out: `40 0.2
100 0.08
250 0.032`,
    },
    'The same dollar cost is six times larger in R on a $40 risk than on a $250 risk. Small positions pay proportionally more, so test at the size you will really trade.',

    { h: 'Fills that never happened' },
    { sub: 'Limit orders and the queue' },
    'A **limit order** waits at a price. Many orders can be waiting at the same price, filled in the order they arrived. When price only touches your level, the orders ahead of yours may use up all the trading there. A cautious backtest counts a limit order as filled only if price trades through it.',
    { sub: 'Mid and last prices' },
    'The **mid** is halfway between the bid and the ask; nobody guarantees you a fill there. The **last** price is the most recent trade, which on a quiet option strike can be hours old. A backtest built on either assumes fills you would not have had.',

    { h: 'Mistakes beginners make' },
    'Believing a smooth curve because it is smooth. Adding costs at the end as an afterthought. Testing on today\'s list of stocks. Tuning until the result looks right and calling the last version "the strategy".',
  ],

  'backtest-oos': [
    { h: 'Data you have not looked at' },
    'Once you have tuned rules on some data, a good result on that same data proves little: the rules were shaped to fit it. The only fair test is data the rules have never seen. This lesson is about creating that data out of your own history, and then about the last test before money, which is trading in real time on paper.',

    { h: 'Splitting by time' },
    'Divide your history into two parts. The **in-sample** part is the earlier data: develop and tune the rules there. The **out-of-sample** part is the later data: leave it alone until the rules are frozen, then run it once.',
    { sub: 'Why not a random split' },
    'Markets change. A random split puts days from every period into both parts, so rules tuned on one part have already seen the conditions of the other. A time split copies reality: you build rules from the past and use them on a future you have not seen.',
    {
      code: `r = [0.5, -1, 1.2, -1, 2.5, -1, -1, 0.8, -1, 1.6]   # R per trade, oldest first
cut = 6
print(round(sum(r[:cut]) / cut, 2), round(sum(r[cut:]) / (len(r) - cut), 2))`,
      out: '0.2 0.1',
    },
    'The first six trades average 0.2R and the last four 0.1R. Slicing a list keeps its order, which is what makes this a time split.',

    { h: 'Running the test once' },
    'Expect the out-of-sample result to be worse than the in-sample one. Part of any in-sample result is noise that your tuning happened to fit, and that part does not repeat. The size of the drop is a measure of how much was fitted.',
    { sub: 'One look per period' },
    'If the out-of-sample result disappoints and you change the rules and run it again, those later data have now shaped the rules. Do it a few times and the "out-of-sample" period is as fitted as the rest. You get one honest look at each period. After that, the only source of new evidence is new data.',

    { h: 'Walk-forward testing' },
    '**Walk-forward** testing repeats the split through time. Tune on a window, test on the window right after it, then move both forward by the length of the test window and repeat. Each test uses only settings chosen from the data before it, which is exactly how you would trade.',
    { sub: 'A worked example' },
    'With 48 months of data, a 24-month tuning window and a 6-month test window, the tests cover months 25 to 48: 24 months in 6-month pieces, so 4 windows. Joined end to end, the four tests make a 24-month out-of-sample record. The settings may change from one window to the next; that is allowed, because each choice uses only the past.',

    { h: 'Plateaus and spikes' },
    'Plot the result against a parameter, such as the length of a moving average. A **plateau** is a broad region where many neighbouring settings do about equally well. A **spike** is one setting that does well while its neighbours do nothing. A real effect rarely depends on one exact number, so a plateau is more believable, and it also survives the market drifting a little. The figure shows spikes appearing in data that has no edge at all.',

    { h: 'Paper trading' },
    { sub: 'What it tests' },
    '**Paper trading** means following your rules in real time with simulated money. It tests what a backtest cannot: whether you get the data in time, whether you hesitate, whether you follow the rules when the trade is live. Fix the rules and the number of trades in advance, journal every trade and compare the results with the backtest.',
    { sub: 'Its own flatteries' },
    'Paper platforms often fill orders at the mid price or at prices that touched briefly. Record the fill you would really have had: the ask when buying, the bid when selling. When paper trading is done, move to the smallest real size, not to full size.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Shuffling days into training and test sets.',
        'Peeking at the out-of-sample data while still tuning.',
        'Rerunning the out-of-sample test after every change.',
        'Choosing the single best setting instead of the middle of a plateau.',
        'Treating a good paper result at mid prices as proof.',
      ],
    },
  ],

  'backtest-options': [
    { h: 'Why options are hard to backtest' },
    'Testing a rule on shares needs one series of prices per stock. Testing it on options needs the price of the specific contract you would have bought, at the moment you would have bought it, and again when you sold.',
    { sub: 'The size of the data' },
    'One underlying (the stock or ETF an option is on) can have hundreds of strikes across many expiries, each with its own bid and ask changing all day. Intraday quote history for all of that is very large and usually has to be bought from a data vendor.',
    { sub: 'Stale and mid prices' },
    'Free data often has only the **last** trade price at the end of the day. On a strike that barely trades, the last trade can be from hours earlier, when the stock was somewhere else. The **mid** price, halfway between bid and ask, is not a price anyone promised to trade with you. A backtest built on either assumes fills you would not have had.',

    { h: 'Step one: test the signal on the underlying' },
    'Bars for SPY or QQQ are cheap, plentiful and clean. Test your entries and exits there first, with every rule from the earlier lessons: next-bar fills, cautious stops, costs, an out-of-sample period.',
    'If the entries show no edge on the underlying, stop. An option on that underlying will not create one. It changes the shape of the payoff, adds the spread and fees, and loses value with time. Treat this as a working rule rather than a law, but it throws out most bad ideas before you spend anything on option data.',

    { h: 'Step two: an option model' },
    { sub: 'The Greeks as a reminder' },
    'From the pricing module: **delta** is roughly how much the option price moves per $1 move in the underlying. **Gamma** is how much delta itself changes per $1 move, which bends the option\'s response. **Theta** is the loss of value per day from time passing, called **decay**; for a trade held a few hours you use the decay over the time held.',
    'For an underlying move ΔS, the option price changes by about `delta × ΔS + ½ × gamma × ΔS² − decay`. The gamma term is always positive for a bought option, so it adds a little on moves either way.',
    { sub: 'The spread and the fees' },
    'You buy at the ask and sell at the bid. Measured from the mid, that is half the spread each way, so the full spread for the round trip. Subtract it per share, multiply by 100 for one contract, and subtract the fees per contract.',
    {
      code: `delta, gamma, decay = 0.60, 0.04, 0.03
spread, fee = 0.05, 1.30
move = 1.20
per_share = delta * move + 0.5 * gamma * move ** 2 - decay - spread
print(round(per_share * 100 - fee, 2))`,
      out: '65.58',
    },
    'Per share: 0.72 from delta, 0.0288 from gamma, minus 0.03 of decay and 0.05 of spread, which is 0.6688. One contract is $66.88, less $1.30 of fees.',
    { sub: 'The hurdle on every trade' },
    'Decay, spread and fees are paid on every trade, winners and losers alike. Divide the per-share costs by delta to see how far the underlying must move before the trade breaks even. With delta 0.40 and costs of $0.08 per share, the stock must move $0.20 your way before the option makes anything.',

    { h: 'What the model leaves out' },
    {
      list: [
        '**Implied volatility**, the level of future movement the option price assumes, often falls after news such as earnings. The option can lose value even when the stock moves the way you expected. The model above cannot see this.',
        'Spreads widen at the open, near the close and in fast markets.',
        'Delta changes over large moves and as expiry nears, so the estimate drifts on big or long trades.',
      ],
    },
    'Keep the model cautious: wider spreads than you hope for, and leave out or flag trades held through scheduled news.',

    { h: 'Checking the model' },
    'Take a sample of trades and look up what the real option prices were, from your broker\'s history or a data vendor. If the model is close on those, trust it more; if not, find out why. Then paper trade the option version, recording fills at the bid and ask, before any money is involved.',

    { h: 'Mistakes beginners make' },
    'Backtesting with mid or last prices. Counting half the spread instead of the whole. Expecting an option to rescue a signal with no edge. Holding through earnings in a model that knows nothing about implied volatility.',
  ],

  'backtest-lab': [
    { h: 'What the lab builds' },
    'The lab builds a complete backtest of an **opening range breakout**, one of the setups from the day-trading module, on made-up 5-minute bars. The **opening range** is the high and low of the first k bars of the day. The rule: go long at the next bar\'s open after the first close above the range high; the stop is the range low; the target is rr times the risk above the entry; anything still open is sold at the last close of the day.',
    'Each step is one function. Together they make data, find signals, simulate exits, subtract costs, compute statistics and judge one parameter choice out-of-sample.',

    { h: 'Made-up bars from a seed' },
    { sub: 'A random walk' },
    'A **random walk** is a price that moves by a random amount each step, with no tendency up or down. The lab builds each day as a random walk starting at 100: each close is the previous close plus a small random move, each open is the previous close, and the high and low add small random wicks above and below.',
    { sub: 'The seed' },
    'A random number generator started from a fixed **seed** produces the same numbers every time. That makes the made-up data identical on every run, so two versions of the backtest can be compared fairly.',
    {
      code: `import numpy as np

rng = np.random.default_rng(42)
moves = rng.normal(0, 0.1, size=(3, 5))       # 3 days of 5 bars
c = 100 + np.cumsum(moves, axis=1)
print(c.shape, np.array_equal(c, 100 + np.cumsum(np.random.default_rng(42).normal(0, 0.1, size=(3, 5)), axis=1)))`,
      out: '(3, 5) True',
    },
    'Rows are days and columns are bars. `axis=1` makes the running total run along each day, so every day starts fresh near 100. Rebuilding with the same seed gives exactly the same prices.',
    { sub: 'Why random data is the right test' },
    'A random walk has no edge in it. A correct backtester should therefore find an average result close to zero before costs and below zero after. If yours finds a strong edge, it is reading the future somewhere.',

    { h: 'Levels and signals' },
    'The opening range uses only the first k bars, so the levels are known before any signal is looked for. Signals are searched for from bar k on: the first close above the range high. The entry is the open of the bar after the signal, so a signal on the last bar of the day cannot be traded. Entering at the open of the signal bar itself is lookahead, and on random bars it alone produces an apparent edge.',

    { h: 'Exits and R' },
    'Each day with an entry is walked bar by bar from the entry: a gap through the stop or target fills at the open, then the stop is checked before the target, and if neither is hit the trade closes at the last close.',
    { sub: 'A worked example' },
    'The range low is 99.90 and the entry is 100.40, so the risk is 0.50 per share. With rr = 2 the target is 100.40 + 2 × 0.50 = 101.40. If the day ends with neither hit and the last close is 100.90, the trade made 0.50, which is +1.0R. With a cost of 0.1R per trade, it is recorded as +0.9R.',

    { h: 'Statistics and the random-walk check' },
    'The trades go into the same statistics as the earlier lesson: number of trades, win rate, expectancy, profit factor and maximum drawdown, with the equity curve starting at 0 and scratches not counted as wins. Then compare with what random data should give. An expectancy within a few hundredths of zero before costs is a pass. A large positive number is a bug to find before going any further.',

    { h: 'Choosing k honestly' },
    { sub: 'In-sample choice' },
    'Run the backtest for several values of k and keep each trade\'s day number with its R. Choose the k with the best average on the days before a cut-off date. That is the in-sample choice.',
    { sub: 'Out-of-sample score' },
    'Score only that chosen k on the days after the cut-off, once. Expect it to do worse than it did in-sample. On random data it will do no better than the others, because the in-sample winner won by fitting noise.',

    { h: 'Reading the result' },
    'On real data, a backtest that survives all of this is still only evidence, not proof. Work out the standard error of the out-of-sample expectancy, check that the costs fit the instrument you would really trade, look for a plateau around the chosen k, and then paper trade the frozen rules. The most common honest conclusion is "not proven yet", and reaching it on paper costs nothing.',
  ],
}
