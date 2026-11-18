import type { Block } from '../../types'

/** The full theory for each lesson of the risk module, keyed by lesson id. */
export const riskTheory: Record<string, Block[]> = {
  'risk-per-trade': [
    { h: 'Why risk comes before reward' },
    'A new trader looks at a trade and asks how much it could make. A trader who lasts asks first how much it costs if the idea is wrong. The second question has a precise answer you control; the first does not. You cannot decide how far the market will move in your favour, but you can decide where you get out if it moves against you, and how many contracts you hold when it does.',
    'Most retail day traders lose money, and the usual way a small account is destroyed is not one bad idea but a few trades that were far too big. This lesson is about making that impossible.',

    { h: 'R: one unit of risk' },
    '**R** is the amount of money you lose if a trade hits its planned exit for being wrong (its **stop**). It is fixed before you enter. If you plan to lose $120 when the stop is hit, R for that trade is $120.',
    { sub: 'Measuring results in R' },
    'Once R is fixed, every result can be written as a multiple of it, called an **R multiple**. Make $240 on a trade where R was $120 and the trade was +2R. Lose the planned $120 and it was −1R. Lose $60 because you got out early and it was −0.5R. R multiples let you compare trades made at different sizes, months apart, on accounts of different values. They are the language of the rest of this module and of the backtest module.',

    { h: 'The fixed fraction idea' },
    'The common rule is to make R a small, fixed **fraction** of the account: often between 0.5% and 2%, with 1% as the usual starting point. On a $12,000 account at 1%, R is $120. This is a rule of thumb from experience, not a law. Its purpose is survival: at 1%, even ten losses in a row leave you down about 10%, which ordinary trading can repair.',
    'Because R is a fraction of the account as it is **now**, it changes. After a run of losses the account is smaller and so is R, which slows the damage. After wins R grows. Recalculate it on a fixed schedule, for example at the start of each day or week. Never raise it to win back losses faster: that is how a drawdown becomes a disaster.',

    { h: 'From R to a number of contracts' },
    'One option contract covers 100 shares, and option prices are quoted per share. So when an option falls from $1.80 to $1.20, one contract loses $0.60 × 100 = $60. Forgetting the 100 is one of the most expensive slips a beginner can make: it makes every position look 100 times smaller than it is.',
    { sub: 'The sizing formula' },
    'For a bought option with a stop on its own price (a **premium stop**), the loss per contract at the stop is `(entry − stop) × 100`, plus the fees you pay to get in and out (the **round trip**). Then the number of contracts is R divided by that, rounded **down**: `floor(R ÷ loss per contract)`. Rounding up would break your risk rule on every single trade. If the answer is 0, the trade does not fit this account. Skip it, or choose a cheaper structure.',
    {
      code: `def contracts(account, risk_pct, entry, stop):
    budget = account * risk_pct
    per_contract = round((entry - stop) * 100, 2)
    return int(budget // per_contract)

print(contracts(12000, 0.01, 1.80, 1.20), contracts(12000, 0.01, 1.80, 0.90))`,
      out: '2 1',
    },
    'R is $120 in both cases. With a $0.60 stop each contract risks $60, so 2 fit. With a $0.90 stop each risks $90 and only 1 fits. In Python, `//` divides and rounds down, and `int` turns the result into a whole number.',
    { sub: 'Rounding money in code' },
    'Computers store most decimals slightly inexactly. `(1.10 − 0.80) × 100` comes out as 30.000000000000004, not 30, and `90 // 30.000000000000004` gives 2 instead of 3. Rounding the per-contract loss to cents with `round(x, 2)` before dividing removes the problem. Any code that handles money should do this.',

    { h: 'Stops on the underlying and no stop at all' },
    'With no stop, a bought option can lose its entire premium, so the loss per contract is `premium × 100`. A $1.40 option risks $140 a contract.',
    'Often the stop is on the share price instead: "I am wrong if the stock falls $1 from here." To turn that into an option loss, use **delta**, from the pricing module: the change in the option price for a $1 move in the stock. A call with delta 0.40 loses about $0.40 per share, $40 a contract, if the stock falls $1. So the estimated loss per contract is `delta × distance × 100`. It is only an estimate, because delta changes as the price moves and time decay keeps eating the option.',

    { h: 'Mistakes that cost the most' },
    {
      list: [
        'Sizing from conviction. Feeling sure is not information. Size comes from the stop and the fraction, every time.',
        'Forgetting the 100 multiplier, or the fees, when working out the loss per contract.',
        'Rounding up to "make it fit". The rounding is part of the risk rule.',
        'Treating the stop as a guarantee. A gap can open beyond it, so for options held overnight or near expiry, check what you lose if the whole premium goes.',
        'Keeping R fixed in dollars after the account has fallen.',
      ],
    },
  ],

  'risk-expectancy': [
    { h: 'What a win rate does not tell you' },
    'The **win rate** is the share of trades that make money. It is the number most often quoted and the least useful on its own. A trader who wins 80% of the time can lose money, and one who wins 35% of the time can make it. What decides is how big the wins are compared with the losses.',

    { h: 'Expectancy' },
    '**Expectancy**, written E, is the average result per trade over a long run of trades. It needs three numbers: the win rate p (a number between 0 and 1), the **average win** W and the **average loss** L, both written as positive amounts.',
    '`E = p × W − (1 − p) × L`',
    'The first part is what wins bring in on average; the second is what losses take out. Measured in R, L is usually close to 1, because a planned loss is −1R by definition.',
    { sub: 'A worked example' },
    'A setup wins 45% of the time, wins average 1.5R and losses 1R. Then E = 0.45 × 1.5 − 0.55 × 1 = 0.675 − 0.55 = +0.125R. On average each trade adds an eighth of R. With R = $100 that is $12.50 a trade, over many trades.',
    'Now a setup that wins 75% of the time, with wins of 0.25R and losses of 1R: E = 0.75 × 0.25 − 0.25 × 1 = 0.1875 − 0.25 = −0.0625R. Right three times out of four, and losing money.',
    { sub: 'Expectancy from a trade list' },
    'If you have a journal of results in R, you do not need W and L separately: the expectancy is the plain average of the R multiples.',
    {
      code: `trades = [1.5, -1, 2, -1, -1, 0.5]
print(round(sum(trades) / len(trades), 3))`,
      out: '0.167',
    },

    { h: 'The payoff ratio and the breakeven line' },
    'The **payoff ratio** b is the average win divided by the average loss, b = W ÷ L. Setting E to zero and solving gives the **breakeven win rate**: `p = 1 ÷ (1 + b)`. At a payoff of 4 you need to win more than 20% of the time; at 1, more than 50%; at 0.5, more than about 67%.',
    'Plot win rate along one axis and payoff along the other, and the breakeven curve divides the picture into setups that pay and setups that do not. Moving along the curve trades one for the other: tighter profit targets raise the win rate and lower the payoff.',

    { h: 'Costs come off every trade' },
    'Commissions, exchange fees, the bid-ask spread and slippage are paid on every trade, winner or loser. Write the cost per round trip as a fraction of R, called c, and the expectancy becomes `E = p × W − (1 − p) × L − c`. Solving for the breakeven win rate with costs: p × W − L + p × L − c = 0, so `p = (L + c) ÷ (W + L)`.',
    'Costs hurt small edges most. A setup with E = +0.06R before costs, traded with R = $50 and $5 of costs a round trip (0.1R), has E = −0.04R after costs. Cheap options with wide spreads, traded in small size, are where this happens most.',

    { h: 'From R to dollars, and why short runs mislead' },
    'Multiply E by R to get the average dollars per trade, and by the number of trades for a total. E = +0.1R with R = $250 is $25 a trade on average, $2,500 over 100 trades on average. The word "average" is doing a lot of work. Any one run of 100 trades scatters widely around that figure, and can easily end below zero. The backtest module shows how many trades you need before a measured expectancy means anything.',

    { h: 'The high win rate trap' },
    'Strategies that take small profits often and accept rare large losses produce smooth, rising results for weeks, then one loss takes back many wins. Selling cheap options for small premiums often looks like this. Judging such a strategy by its win rate, or by a few good weeks, is the classic mistake. Always ask for the average loss and the largest loss, and work out E with costs.',
    {
      list: [
        'Quoting a win rate without the payoff ratio.',
        'Leaving costs out, or measuring them per winner only.',
        'Weighting losses by p instead of 1 − p in a formula.',
        'Trusting E from 20 or 30 trades.',
      ],
    },
  ],

  'risk-drawdown': [
    { h: 'Peaks, troughs and drawdowns' },
    'Track the value of your account after every trade and you get its **equity curve**. The highest value it has reached so far is the running **peak**. A **drawdown** is the fall from that peak to a later value, as a fraction of the peak. If the account reaches $15,000 and later falls to $12,000, the drawdown is $3,000 ÷ $15,000 = 20%.',
    'The **maximum drawdown** is the largest such fall over a period. It matters more than almost any other number because it decides whether you keep trading: few people stick to a plan through a 40% drawdown, and a deep enough one ends the account.',
    { sub: 'Computing it' },
    'Walk through the curve once, keeping the highest value so far and the worst fall from it.',
    {
      code: `equity = [100, 105, 98, 112, 101, 115]
peak, worst = equity[0], 0.0
for x in equity:
    peak = max(peak, x)
    worst = max(worst, (peak - x) / peak)
print(round(worst, 3))`,
      out: '0.098',
    },
    'Here 112 to 101 is a fall of 11 ÷ 112 ≈ 9.8%, larger than 105 to 98 (6.7%). The peak must be updated with `max`, so falls are measured from the highest point reached, not from the start or from the previous value.',

    { h: 'The maths of recovery' },
    'Losses and gains are not symmetric. Lose a fraction d of the account and you are left with 1 − d of it. To get back you must multiply that by 1 ÷ (1 − d), a gain of `d ÷ (1 − d)`.',
    {
      list: [
        'Lose 10%: you need 0.1 ÷ 0.9 ≈ 11.1%.',
        'Lose 30%: you need 0.3 ÷ 0.7 ≈ 42.9%.',
        'Lose 60%: you need 0.6 ÷ 0.4 = 150%.',
        'Lose 90%: you need 900%.',
      ],
    },
    'The same arithmetic means a percentage loss followed by the same percentage gain leaves you below where you started. Small drawdowns are repaired by ordinary trading. Deep ones may need years, or never be repaired.',

    { h: 'Losing streaks under fixed fractional sizing' },
    'With a fixed fraction f risked per trade, each loss multiplies the account by 1 − f. After n losses in a row you have `(1 − f)ⁿ` of it, and the drawdown is `1 − (1 − f)ⁿ`. At 3% risk, eight straight losses leave 0.97⁸ ≈ 0.784 of the account: a drawdown of about 21.6%, a little less than 8 × 3% = 24% because each loss is taken from a smaller account. At 15% risk the same eight losses leave about 27%.',

    { h: 'Why streaks are certain' },
    'If a setup loses with probability q, the chance that a particular run of k trades are all losers is `qᵏ`, assuming trades do not affect each other. With q = 0.45 and k = 4 that is 0.45⁴ ≈ 0.041, about one in 24.',
    { sub: 'Many chances to start a streak' },
    'One in 24 sounds rare, but a streak can start at any trade. Over hundreds of trades there are hundreds of starting points, so long streaks become close to certain. A simulation of 200 trades at a 55% loss rate puts the typical longest losing streak at about eight, with five or more in nearly every run. None of this means the setup stopped working. It is what a fair coin does.',
    'Counting the longest streak in a journal is a short loop: keep a counter that adds one on each loss and resets to zero on each win, and remember the largest value it reached.',

    { h: 'Planning for drawdowns' },
    'Decide your response while calm. Choose a risk per trade small enough that a long, ordinary streak costs a drawdown you can live with. Then write down levels, for example: at 10% from the peak, halve R; at 20%, stop live trading and review the journal; return only after a set number of paper trades or small trades go to plan. Compare any streak with what the win rate predicts: a streak in the expected range calls for patience; one far outside it suggests something has changed.',
    {
      list: [
        'Measuring drawdown from the starting value instead of the running peak.',
        'Assuming a 30% loss needs a 30% gain.',
        'Reading an ordinary streak as proof the setup is broken, or an extraordinary one as bad luck.',
        'Raising size to recover faster.',
      ],
    },
  ],

  'risk-kelly': [
    { h: 'Ruin' },
    '**Ruin** is reaching a point from which you cannot or will not continue. It may be an empty account, a balance below the broker minimum, or, more often, a loss deep enough that you stop. Many traders treat a 50% drawdown as ruin. **Risk of ruin** is the probability of getting there.',
    'A positive expectancy does not protect you. A trader with a real edge who risks too much per trade can still be ruined by an ordinary losing streak before the edge has time to work. At 5% risk per trade, fourteen losses in a row take the account below half (0.95¹⁴ ≈ 0.49). To find the number of losses that halve the account at fraction f, solve (1 − f)ⁿ = 0.5: `n = log(0.5) ÷ log(1 − f)`, rounded up.',

    { h: 'Why growth is multiplicative' },
    'Under fixed fractional sizing, a win of b times the amount risked multiplies the account by `1 + b·f`, and a loss multiplies it by `1 − f`, where f is the fraction risked. The order does not matter, only how many of each. And multiplications do not average the way additions do.',
    { sub: 'An example with too much size' },
    'Risk 40% on a bet that wins 60% of the time at even money. The expectancy is 0.6 × 1 − 0.4 × 1 = +0.2R per bet. Over ten bets, six wins and four losses multiply the account by 1.4⁶ × 0.6⁴ ≈ 0.98. A typical run loses money even though every bet had an edge.',
    { sub: 'The growth rate' },
    'The tool that captures this is the logarithm, written ln, which turns multiplying into adding. The average **log growth per trade** is:',
    '`g(f) = p · ln(1 + b·f) + (1 − p) · ln(1 − f)`',
    'If g is positive the account tends to grow; over n trades the typical multiple is about e raised to n × g. If g is negative, the typical account shrinks, whatever the expectancy says.',
    {
      code: `import math

def growth(p, b, f):
    return p * math.log(1 + b * f) + (1 - p) * math.log(1 - f)

for f in [0.05, 0.1, 0.2, 0.4]:
    print(f, round(growth(0.6, 1, f), 4))`,
      out: `0.05 0.0088
0.1 0.015
0.2 0.0201
0.4 -0.0024`,
    },

    { h: 'The Kelly fraction' },
    'The fraction that makes g as large as possible is the **Kelly fraction**, after John Kelly who derived it in 1956:',
    '`f* = p − (1 − p) ÷ b`',
    'For p = 0.6 and b = 1 it is 0.6 − 0.4 = 0.2, which is where the growth in the code above peaks. Three facts follow from the shape of the curve.',
    {
      list: [
        'Below Kelly, growth is slower but swings are smaller.',
        'Above Kelly, growth falls and swings grow. Around twice Kelly the growth is close to zero (at 0.4 above it is slightly negative), and beyond that it is negative.',
        'If f* is zero or negative, the setup has no edge, and the only sensible size is nothing.',
      ],
    },
    { sub: 'Fractional Kelly' },
    'Betting half the Kelly fraction keeps about three quarters of the growth (0.015 against 0.0201 above) with far smaller drawdowns. Traders who use Kelly at all usually use a half or a quarter of it.',

    { h: 'Why full Kelly is too much for a trader' },
    'Kelly is exact only when you know p and b. You do not. You estimate them from a journal or a backtest, and those estimates are noisy: 100 trades can easily make a modest edge look twice as large. Because growth falls off sharply above Kelly, overestimating your edge puts you on the bad side of the curve without your knowing it. Even with the true numbers, full Kelly brings drawdowns of a size most people abandon their plan in. And real trading adds things the formula leaves out: costs, gaps past the stop, edges that fade.',
    'So treat Kelly as a **ceiling**. If a careful, pessimistic estimate gives a Kelly fraction of 10%, risking 1% a trade leaves a wide margin for being wrong about your edge. That margin is the point.',

    { h: 'Common mistakes' },
    {
      list: [
        'Using the expectancy alone to choose size. Expectancy says whether to trade; g says how much.',
        'Plugging a backtest win rate into Kelly and betting the result.',
        'Taking the opposite trade when Kelly is negative. You pay costs both ways and the payoffs are not mirror images.',
        'Writing the loss term as ln(1 + f). A loss shrinks the account.',
      ],
    },
  ],

  'risk-stops': [
    { h: 'Three exits, decided in advance' },
    'An exit plan answers three questions before you enter. Where am I wrong? Where do I take profit? How long do I give it? The answers are the **stop**, the **target** and the **time stop**. Deciding them later means deciding while the position is moving against you, which is when people move stops, add to losers and hope.',

    { h: 'Premium stops' },
    'A **premium stop** exits when the option itself falls to a set price, often a percentage of what you paid. Buy at $3.00 with a 30% stop and the stop is at $3.00 × 0.7 = $2.10; the planned loss is $0.90 × 100 = $90 a contract. It fixes the dollar loss exactly, which makes sizing simple.',
    { sub: 'Its weakness' },
    'An option price moves for several reasons besides the share price: time decay (**theta**), changes in implied volatility, and the width of the quote. Option quotes, especially on less traded strikes, can widen for a moment, with the bid dropping and the ask jumping, while the stock barely moves. A stop that reacts to the option price can trigger on that flicker and sell you at a poor bid even though your idea was fine. Brokers differ in what price triggers an option stop, so find out how yours works.',

    { h: 'Stops on the underlying' },
    'A stop on the **underlying** exits when the share or index crosses the level that proves the idea wrong: back below the level it broke out of, for example. It ties the exit to the reason for the trade, and noise in the option quote cannot trigger it. Many traders set an alert on the stock and exit the option with a limit order when it fires.',
    { sub: 'Estimating the option price at that stop' },
    'Use delta. A call worth $3.50 with delta 0.55 and a stop $2 below the stock price should be worth about $3.50 − 0.55 × 2 = $2.40 at the stop. The real number differs: delta falls as a call loses value (which helps), time passes (which hurts), and volatility may change. Treat it as a rough guide for sizing.',

    { h: 'Targets and time stops' },
    'A **profit target** written in R keeps you consistent. If you buy at $1.50 with a stop at $1.10, 1R is $0.40 a share; a 2.5R target is $1.50 + 2.5 × $0.40 = $2.50. At the target you can exit fully, or take part off and trail a stop on the rest.',
    'A **time stop** exits if the move has not happened by a set time. A bought option loses value every hour, and a setup built on a move "this morning" has lost its reason by the afternoon. Exiting at the time stop, even at a small loss above the stop price, is the plan working.',
    { sub: 'Checking exits in code' },
    'When you test exits on a series of prices, the order of the checks is a decision. A simple rule: on each bar, check the stop first, then the target, then the time limit, and exit at the price of that bar.',
    {
      code: `prices = [1.50, 1.62, 1.41, 1.18, 1.05]
stop = 1.10
for i, p in enumerate(prices):
    if p <= stop:
        print('stop at bar', i, 'price', p)
        break`,
      out: 'stop at bar 4 price 1.05',
    },
    "For a bought option the stop is below the entry, so the test is `p <= stop`. The fill is the price that was there, $1.05, not the stop level. Testing with fills at exactly the stop flatters every result. `enumerate` hands the loop each bar number with its price. A function can return several values at once as a tuple, such as `return 'stop', i, p`, and `print(*result)` prints the parts of a tuple separated by spaces.",

    { h: 'Why a stop is not a guarantee' },
    'A **stop order** is an instruction to send a market order once a price is touched. It guarantees that you get out, not the price. When the market jumps, the first price after the trigger can be far beyond the stop.',
    {
      list: [
        '**Gaps**: a stock that closes at $50 can open at $46 after news. A stop at $49 fills near $46 or worse.',
        '**Fast markets**: on data releases prices move several levels between trades, and option spreads widen at the same moment.',
        '**Halts**: trading in a stock can be paused; nothing fills until it reopens, at whatever price that is.',
      ],
    },
    'For a bought option, the loss can never exceed the premium you paid. For a **sold** option there is no such floor. Sell a call for $0.80 planning to buy it back at $1.60, and if it opens at $4.00 after a gap, buying it back costs ($4.00 − $0.80) × 100 = $320 a contract, four times the plan. Only a bought option held as protection, as in a spread, puts a hard limit under a short option.',

    { h: 'Mistakes with exits' },
    {
      list: [
        'Moving the stop further away once the trade is losing.',
        'Ignoring the time stop because the price stop "has not been hit".',
        'Using stop orders on options with wide spreads without knowing what triggers them.',
        'Sizing a position held overnight as if the stop were a guarantee.',
      ],
    },
  ],

  'risk-limits': [
    { h: 'Why one trade is not the whole picture' },
    'Sizing each trade at 1% protects you from any one trade. It does not protect you from five trades open at once that all lose on the same move, or from ten trades in a row taken angrily after the first two lost. Limits **above the trade** cover those cases. They are set before the session, written down, and not open to debate while you are trading.',

    { h: 'The daily loss limit' },
    'A **daily loss limit** ends the trading day once the day\'s losses reach a set amount, such as 3R or 2% to 3% of the account. With R = $80 and a 4R limit you stop at a $320 loss. After that, no more trades, whatever appears.',
    { sub: 'Why it must be absolute' },
    'After a losing morning, judgement is at its worst and every setup looks like the way back to even. That is when traders double size, take setups they would normally skip, and turn a −3R day into a −8R day. The limit is valuable precisely because it does not bend for a "great" setup. If a setup appears after the limit, write it in the journal; you can check later whether it would have worked at no cost.',
    'In code, P&L for the day is negative when losing and the limit is usually a positive number, so the test is `day_pnl <= -limit`. Getting that sign wrong blocks every day or none. Some brokers offer tools that lock trading after a set loss; if yours does, use it.',

    { h: 'Maximum open risk' },
    'Add up the R of every open position: that is your **open risk**. A cap such as 3% to 5% of the account stops you stacking trades whose stops could all be hit together. On a $25,000 account with a 4% cap, open risk can be at most $1,000. With trades risking $300 and $450 open, a new trade may risk at most $1,000 − $750 = $250. If the answer is zero or less, there is no room.',

    { h: 'Correlated positions' },
    'Two positions are **correlated** when they tend to move together. Calls on SPY, QQQ and a large technology stock are three tickets on one idea: the market goes up. On the day it falls, all three lose together. Three trades at 1% each on correlated names behave much like one trade at 3%. When you check your open risk and your daily limit, count correlated positions as one bet.',

    { h: 'Portfolio delta' },
    'Delta, from the pricing module, says how much an option\'s price changes for a $1 move in the stock. Multiply by 100 and by the number of contracts and you get the position\'s **delta in shares**: how many shares it behaves like.',
    { sub: 'Signs' },
    {
      list: [
        'Long call: positive delta (gains when the stock rises).',
        'Long put: negative delta.',
        'Short call: negative delta. Selling flips the sign.',
        'Short put: positive delta. You gain when the stock rises.',
      ],
    },
    'Writing short positions as negative contracts handles the signs automatically: contracts × delta × 100.',
    {
      code: `positions = [(5, 0.35), (-2, 0.60), (-3, -0.20)]   # long calls, short calls, short puts
total = sum(n * d * 100 for n, d in positions)
print(round(total))`,
      out: '115',
    },
    'Five long calls add 175, two short calls take away 120, and three short puts add 60: the book acts like 115 shares. Multiply by the share price for the **dollar delta**: at $250 a share, 115 shares is $28,750 of exposure, so a 1% move changes the position by about $287. A few cheap options can carry exposure far larger than the cash they cost. Some traders also cap total delta relative to the account.',

    { h: 'Writing and enforcing the limits' },
    'A full set of limits covers risk per trade, a daily limit, a weekly or monthly limit that cuts size or pauses trading, a cap on open risk, a rule for correlated positions and a ceiling on delta. Enforcement matters as much as the numbers: a printed checklist before each order, broker tools where they exist, a trading partner you report to. Limits that rely on willpower in the moment tend to fail in exactly the moment they are needed.',
  ],

  'risk-margin': [
    { h: 'Defined and undefined risk' },
    'A position has **defined risk** when its largest possible loss is known the moment you open it. A position has **undefined risk** when the loss can be much larger than anything you planned, with no fixed limit. The difference decides how you can size a trade.',
    { sub: 'Defined-risk positions' },
    {
      list: [
        'A bought option: the most you lose is the premium paid.',
        'A **debit spread** (buy one option, sell a cheaper one further out): the most you lose is the debit paid.',
        'A **credit spread** (sell one option, buy a cheaper one further out as protection): the most you lose is the width between the strikes minus the credit, times 100.',
      ],
    },
    'For example, sell a 60 put and buy a 57 put for a credit of $0.90. If the stock ends below $57, the spread is worth the full $3 width against you, and you keep the $0.90, so the loss is ($3 − $0.90) × 100 = $210.',
    { sub: 'Undefined-risk positions' },
    'A naked **short call** loses more the higher the stock goes, with no ceiling. A naked **short put** can lose down to the stock going to zero: (strike − premium) × 100. Short straddles and strangles carry both. If you sold a 70 call for $1.50 and the stock jumps to $85 on news, the call is worth at least its **intrinsic value** (from the options module: how far it is in the money), $15, and buying it back costs ($15 − $1.50) × 100 = $1,350.',

    { h: 'Margin and buying power' },
    '**Margin**, shown by brokers as **buying power** used, is the money set aside in your account while you hold a position. It is a deposit, not a payment.',
    {
      list: [
        'Bought options and debit spreads are paid for in full.',
        'For credit spreads, brokers usually hold the maximum loss: width minus credit.',
        'For naked short options, a formula sets the amount.',
      ],
    },
    { sub: 'The naked option formula' },
    "At the time of writing (2026), Cboe's standard for a naked short option on a stock is: the premium plus 20% of the share price, minus any **out-of-the-money amount**, with a minimum of the premium plus 10% of the share price for calls, or 10% of the strike for puts. A put is out of the money by share price minus strike when the price is above the strike; a call by strike minus share price. Broad stock indexes use 15% instead of 20%. Brokers can and often do require more, and portfolio margin accounts use different rules. Check your broker before relying on any of these numbers.",
    'Take a $80 stock and a naked 75 put sold for $1.20. Main formula: $120 + (20% × $80 − $5) × 100 = $120 + $1,100 = $1,220. Minimum: $120 + 10% × $75 × 100 = $870. The requirement is the larger, $1,220.',
    {
      code: `price, strike, premium = 80, 75, 1.20
otm = max(0, price - strike)
main = premium * 100 + (0.20 * price - otm) * 100
floor = premium * 100 + 0.10 * strike * 100
print(round(max(main, floor)), round((strike - premium) * 100))`,
      out: '1220 7380',
    },

    { h: 'Margin is not the maximum loss' },
    'The second number printed is the worst case: the stock going to zero costs $7,380, six times the margin. Margin is set for an ordinary bad day, not for a crash or a takeover gap. A trader who sizes by buying power ("I have room for eight of these") can hold several times the risk the account can survive.',
    { sub: 'Margin moves against you' },
    'The requirement is recalculated as prices move. When the stock falls toward a short put, the put is worth more and the out-of-the-money amount shrinks, so the margin rises. Implied volatility usually jumps in a sell-off too, raising option prices further. The account is shrinking while the requirement grows.',

    { h: 'How accounts blow up' },
    'When equity falls below what the positions require, the broker issues a **margin call**: deposit money or reduce positions. If you do not, or cannot in time, the broker closes positions for you, usually at the worst prices of the day. With naked options, losses can exceed the whole account, leaving you owing the broker money. The common story is the same each time: steady small profits from selling options sized by buying power, then one gap or crash that takes everything.',

    { h: 'Sizing by the worst case' },
    'Defined-risk structures make the sizing rule from the first lesson work: `contracts = floor(R ÷ maximum loss per position)`. With R = $250 and a credit spread whose maximum loss is $210, you can sell one. This is the safe default for anyone learning. Undefined risk is a choice for experienced traders with large accounts and a written plan for the gap case, never a way to squeeze more trades out of a small account. Approval to trade naked options is also restricted by brokers, and the rules differ by broker and product; check them, and paper trade any strategy first.',
  ],

  'risk-lab': [
    { h: 'What a Monte Carlo simulation is' },
    'Expectancy describes the average of many trades. You will live through one particular sequence of them. A **Monte Carlo simulation** generates many possible sequences at random from the same rules (the same win rate, the same payoff) and looks at the whole spread of results: the typical outcome, the bad ones, and how often an account falls to a level you would call ruin. The name comes from the casino; the method is used throughout finance and science.',

    { h: 'Random numbers you can repeat' },
    'NumPy makes random numbers with a **generator**: `rng = np.random.default_rng(seed)`. The **seed** is a whole number that fixes the sequence. The same seed gives the same numbers every time, which means your results can be checked and repeated. `rng.random(n)` gives n numbers spread evenly between 0 and 1, and `rng.random((rows, cols))` gives a table of them.',
    { sub: 'Turning random numbers into trades' },
    'A number from `rng.random()` falls below 0.45 with probability 0.45. So comparing a batch with the win rate marks the winners, and `np.where` turns each mark into an R multiple.',
    {
      code: `import numpy as np

rng = np.random.default_rng(42)
wins = rng.random(8) < 0.5
print(np.where(wins, 2.0, -1.0))`,
      out: '[-1.  2. -1. -1.  2. -1. -1. -1.]',
    },
    'NumPy prints floats like `2.` and `-1.` without trailing zeros. Change the seed and you get a different, equally valid sequence.',

    { h: 'From trades to an equity curve' },
    'Under fixed fractional sizing with fraction f, a trade of r R multiplies the account by `1 + f × r`. A run of trades multiplies these factors together. `np.cumprod` gives the running product: the first factor, then the first two multiplied, and so on. Multiply by the starting balance and put the start in front, and you have the **equity curve**.',
    {
      code: `import numpy as np

r = np.array([2.0, -1.0, -1.0])
curve = 5000 * np.cumprod(1 + 0.02 * r)
print([round(float(x), 2) for x in curve])`,
      out: '[5200.0, 5096.0, 4994.08]',
    },
    'A loss takes 2% of what is there now, not of the start: $5,200 × 0.98 = $5,096. Checking a tiny case by hand like this before running thousands is how you catch bugs. `np.concatenate` or `np.hstack` join arrays when you want the starting value as the first entry.',

    { h: 'Drawdown with NumPy' },
    '`np.maximum.accumulate(curve)` gives, at each point, the highest value up to there: the running peak. Then `(peaks − curve) ÷ peaks` is the drawdown at each point, and its largest value is the maximum drawdown. Divide by the peak, not by the current value. Dividing by the current value gives the gain needed to recover instead, a different and larger number.',

    { h: 'Many paths at once' },
    'Draw a whole table of random numbers, one row per path and one column per trade. Every operation above works on the table: comparisons and `np.where` act on every entry, and `np.cumprod(..., axis=1)` runs along each row. **axis=1** means "along the columns of each row"; **axis=0** would run down each column instead. Thousands of paths of hundreds of trades take a fraction of a second.',
    { sub: 'Counting ruined paths' },
    'Pick a ruin level, for example half the starting balance. `curves.min(axis=1)` gives the lowest point of each path. Comparing with the level gives True or False per path, and the mean of True and False values is the share that are True. A path counts as ruined if it touched the level at any time, even if it later recovered: a real trader often stops at the bottom.',

    { h: 'What the simulation shows' },
    'Run the same setup at several sizes. With a 50% win rate and 1.2R wins (E = +0.1R), small risk per trade gives slow, steady curves where almost no path halves. Larger risk raises the typical final balance for a while and then the share of ruined paths climbs fast, until too much size makes even the typical path shrink. The edge is identical in every run; only the size changed. This is the whole module in one table.',
    { sub: 'What it leaves out' },
    {
      list: [
        'Costs and slippage on every trade.',
        'Losses larger than 1R from gaps past the stop.',
        'Losing streaks that cluster, for example when the market changes character.',
        'An edge that shrinks over time, and estimates of p and b that were too optimistic to begin with.',
      ],
    },
    'Each of these makes reality worse than the model, so read the results as a best case. Feed in your journal numbers and also worse ones, look at the worst paths rather than the average, and choose a size whose bad paths you could actually live through.',
  ],
}
