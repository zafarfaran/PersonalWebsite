import type { Block } from '../../types'

/** The full theory for each lesson of the business module, keyed by lesson id. */
export const businessTheory: Record<string, Block[]> = {
  'business-losing': [
    { h: 'Knowing is not the same as doing' },
    'By this point in the course you can price an option, size a trade and test a setup. None of that protects you from making a different decision with money moving than the one you would make on paper. The mistakes follow from how people feel about gains and losses, so they are predictable, and rules can be written against them.',
    'Two ideas carry most of this lesson. **Loss aversion** is the feeling. The **disposition effect** is what that feeling does to a list of trades.',

    { h: 'Loss aversion' },
    'Loss aversion means a loss hurts more than a gain of the same size pleases. Losing $100 feels worse than winning $100 feels good. Daniel Kahneman and Amos Tversky measured this in experiments with choices between gambles, and the ratio came out at roughly 2: a loss weighs about twice as much as an equal gain. Later studies find numbers in the same region, with wide variation between people, so treat "about twice" as a rule of thumb.',
    { sub: 'How it shows up in a trade' },
    'While a position is open, a loss can still feel temporary. Closing it makes it final, and that is the moment loss aversion fights. So people hold losing positions longer than their plan said, move the stop further away, or buy more at a lower price to "average down". Each of these turns a planned small loss into a larger one. The loss was already real: the position is worth its current price whether you sell it or not.',

    { h: 'The disposition effect' },
    'The disposition effect is the habit of selling winners too early and holding losers too long. The name comes from Hersh Shefrin and Meir Statman (1985). Terrance Odean then measured it in the records of 10,000 accounts at a US discount broker (1998). Investors took about 14.8% of the gains available to them and about 9.8% of the losses: gains were realised at roughly 1.5 times the rate of losses. The winners they sold went on, on average, to do better than the losers they kept, so the habit cost money. The one month that broke the pattern was December, when selling a loser can reduce the tax bill, and losses were taken more readily.',
    { sub: 'The fingerprint in a journal' },
    'A trader with this habit has a recognisable record: many small wins, a high win rate, and a few large losses that wipe the wins out. The **win rate** is the share of trades that make money. On its own it says nothing about profit. What matters is the **expectancy**, the average result per trade:',
    { code: `expectancy = win_rate * average_win - loss_rate * average_loss` },
    'Take a record with a 70% win rate, an average win of $50 and an average loss of $150. Expectancy is 0.7 × 50 − 0.3 × 150 = 35 − 45 = −$10 a trade. Seven trades in ten win, and the account shrinks.',

    { h: 'Why a high win rate can be manufactured' },
    'Suppose a stock moves at random, up or down with equal chances, with no drift. You buy it with a **target** a dollars above the entry and a **stop** b dollars below. Whichever is hit first ends the trade. A classic result for a random walk says the target is hit first with probability b ÷ (a + b). So the further away the stop and the closer the target, the higher the win rate.',
    'Now work out the expectancy: win with probability b ÷ (a + b) and make a, lose with probability a ÷ (a + b) and lose b. That is (b × a − a × b) ÷ (a + b) = 0. Whatever exits you choose, the average result on a random price is zero, before costs. After costs it is negative.',
    {
      code: `for a, b in [(1, 1), (1, 2), (0.5, 2)]:
    p = b / (a + b)
    e = p * a - (1 - p) * b
    print(a, b, round(p, 3), abs(round(e, 3)))`,
      out: `1 1 0.5 0.0
1 2 0.667 0.0
0.5 2 0.8 0.0`,
    },
    '(`abs` only hides the −0.0 that floating-point arithmetic can produce.) The win rate climbs from 50% to 80% and the expectancy stays at zero in every row. This is exactly what the disposition effect does to a trader with no edge: it raises the win rate, which feels like progress, and changes nothing else. Costs are paid on every trade, so any per-trade cost turns zero into a steady loss. The figure in this lesson lets you try this with a cost slider.',

    { h: 'Why options make it worse' },
    'A bought option loses **time value** every day (theta, from the pricing module). An option that is **out of the money** (a call with the stock below the strike, a put with the stock above it) is made of time value only, and that value falls fastest in the last days before expiry. Hold such an option while the stock goes nowhere and it keeps losing value, and at expiry it is worth nothing. Waiting is not free.',
    'A **short** option (one you sold) that moves against you can lose many times the premium collected, and loss aversion makes people slow to close it.',

    { h: 'Rules that take the decision away' },
    'The answer is to decide exits before the entry, when nothing is at stake, and to make them hard to undo:',
    {
      list: [
        'Write the stop and the target before you enter. A stop may be tightened, never widened.',
        'Put them into the order where the broker allows it: a **bracket order** attaches a stop and a target to the entry, and when one fills the other is cancelled.',
        'Add a **time stop**: if neither level is reached by a set time, close the trade.',
        'Do not add to a losing position.',
        'Measure every trade in **R**, the amount you planned to risk on it. A loss bigger than 1R is a rule break that needs explaining.',
        'Every week, compare your average win with your average loss in R. That ratio exposes the disposition effect.',
      ],
    },
    { sub: 'When you write exit code' },
    'If you write code that checks exits, be careful with signs. A stop of $50 written as a positive number means "exit when the result is −$50 or worse", which is `pnl <= -stop`. Test such code with a loss, a small win and a flat result before trusting it with money.',
  ],

  'business-tilt': [
    { h: 'What tilt is' },
    '**Tilt** is a poker word for playing worse because of how you feel. A player who has lost a big hand starts making bets they would never make calmly. Traders do the same after a run of losses, after a loss that felt unfair (a stop hit by one tick before the price turned), and also after a big win. In each case the plan you wrote calmly stops being the plan you follow.',
    'Tilt is not a character flaw that only weak traders have. It is a normal reaction to losing money, and everyone who trades will feel it. The useful question is not how to avoid the feeling but how to stop it turning into orders.',

    { h: 'Three forms it takes' },
    { sub: 'Revenge trading' },
    'Revenge trading is trading to win back a loss today: a bigger position, a trade that is not in the plan, a cheaper option further out of the money because "a small move will pay". The goal has quietly changed from following the plan to getting back to zero for the day, and the market does not care about your zero.',
    'The extreme version is doubling after each loss. Starting with one unit of risk and doubling after every loss, a losing run of n trades costs 1 + 2 + 4 + … + 2ⁿ⁻¹ = 2ⁿ − 1 units. Three losses cost 7 units, five losses cost 31. Losing runs are not rare: over 300 trades, a strategy with a 50% win rate has a run of five or more losses more than 99% of the time.',
    { code: `risk = 50   # dollars per unit
for n in [3, 5, 6]:
    print(n, (2 ** n - 1) * risk)`, out: `3 350
5 1550
6 3150` },
    { sub: 'Overtrading' },
    'Overtrading is taking trades that are not in the plan because sitting still feels like falling behind. Every trade pays a round trip of costs: commission, fees, the spread and slippage. Those costs are certain, and an unplanned trade has no edge you have measured. If a round trip costs $6 and you add 10 unplanned trades a day, that is $60 a day, about $1,200 over 20 trading days, before asking whether those trades made anything.',
    { sub: 'FOMO' },
    '**FOMO**, the fear of missing out, is chasing a move that has already happened. The problem is geometric. A setup defines where the stop goes, for example back inside a range that the price broke out of. If you enter late, the price is far from that level. Either you keep the stop where it belongs, so the risk per contract is much larger and you can afford fewer contracts, or you tighten the stop to keep the size, and it now sits in ordinary noise and gets hit. A missed trade costs nothing. A chased trade often costs a full loss.',

    { h: 'Tilt after a win' },
    'A big morning can be as dangerous as a bad one. Feeling that you cannot miss, you raise size or loosen the setup rules, and a single loss at double size gives back the morning. A rule such as "no size increase during the session" covers both directions at once. Some traders add a rule that protects a good day, such as stopping once half of the day\'s gain has been given back.',

    { h: 'Circuit breakers' },
    'Willpower is weakest exactly when tilt arrives, so the defence has to be decided in advance. A **circuit breaker** is a rule, set before the session, that stops trading or limits it when a condition is met. The idea comes from exchanges, which pause trading after very large moves.',
    {
      list: [
        '**Daily loss limit**: stop for the day once losses reach a set amount, for example 3R or 2% of the account. Turn it into a number of losing trades: a $300 limit with $75 risked per trade is four losses.',
        '**Maximum number of trades** per day, which caps overtrading.',
        '**Losses in a row**: stop after, say, three consecutive losses, even if the daily limit is not reached.',
        '**No size increase** during the session.',
        '**A break** away from the screen after any loss larger than planned.',
      ],
    },
    { sub: 'Enforcing them' },
    'A rule you have to remember while upset will be broken. Use the tools your broker offers where they exist, such as account loss limits or position limits; write the limits on a card beside the screen; close the platform when a limit is hit. If you write your own code to enforce a limit, test it at exactly the limit. A check written as `trades_today > max_trades` lets one extra trade through, because at the limit the two numbers are equal.',
    { sub: 'What they cannot do' },
    'A circuit breaker is checked between trades. A trade already open can still lose more than planned, and a fast market can jump past a stop, so a day can end beyond the limit. And a breaker does not make a bad habit profitable: if the trades taken on tilt lose money, a limit only means fewer of them. What it removes is the long tail, the rare day when one loss turns into ten and the account never recovers. The figure in this lesson shows both effects over 250 made-up days.',

    { h: 'A breaker in code' },
    'Here is a losses-in-a-row breaker applied to a list of results in R, in the order the trades came:',
    {
      code: `pnl = [1, -1, -1, 2, -1, -1, -1, -1]
streak, taken = 0, 0
for r in pnl:
    taken += 1
    streak = streak + 1 if r < 0 else 0
    if streak == 3:
        break
print(taken, sum(pnl[:taken]))`,
      out: '7 -2',
    },
    'The streak resets on the win at the fourth trade and reaches three at the seventh, so seven trades are taken for −2R, and the eighth loss is never taken. On a good day such a rule sometimes stops you before a recovery; that is the price of insurance, and it is repaid on the days when the losing streak would have kept going.',

    { h: 'Mistakes to watch for' },
    {
      list: [
        'Deciding the loss limit after the losses have started. By then it is the tilted you deciding.',
        'Treating the limit as a target: "I can still lose another 1R today."',
        'Switching to cheaper, far out-of-the-money options after losses. Smaller premium, smaller chance, same tilt.',
        'Ignoring tilt after wins.',
      ],
    },
  ],

  'business-process': [
    { h: 'Decisions and results are different things' },
    'Every trade has two parts: the **decision** (what you did, with what you knew at the time) and the **outcome** (what the market then did). A good decision can lose and a bad one can win, because the outcome of a single trade is mostly chance. Driving home drunk and arriving safely does not make it a good decision.',
    'The poker player Annie Duke calls the habit of judging a decision by its result **resulting**. In trading, resulting leads to two expensive errors: abandoning a good setup after a few losses, and repeating a reckless trade because it happened to pay.',

    { h: 'The four boxes' },
    'Judge each trade on two separate questions. Was the decision good: a setup from the written plan, the right size, the stop and target set before entry, inside the limits? And was the outcome a win or a loss? That gives four boxes.',
    {
      list: [
        '**Deserved win**: good decision, good outcome.',
        '**Good loss**: good decision, bad outcome. The odds went against you. Accept it and take the next setup; there is nothing to fix.',
        '**Bad win**: bad decision, good outcome. The most dangerous box, because the reward teaches you to repeat the behaviour that will one day produce a large loss. Log it as a rule break.',
        '**Bad loss**: bad decision, bad outcome. Usually the easiest to learn from.',
      ],
    },

    { h: 'How much luck there is in a few trades' },
    'Take a setup that wins 50% of the time, makes 1.5R on a win and loses 1R on a loss. Its expectancy is 0.5 × 1.5 − 0.5 × 1 = +0.25R per trade, a good setup by most standards. Over 40 trades you would expect 40 × 0.25 = 10R. But the trades come in a random order.',
    { sub: 'Losing streaks' },
    'If each trade is independent, the chance of losing the next n trades in a row is the loss rate multiplied by itself n times: (loss rate)ⁿ. With a 50% loss rate, four in a row has a chance of 0.5⁴ = 0.0625, about 6%. With a 70% loss rate it would be 0.7⁴ = 0.24. A setup with a real edge will produce such streaks regularly.',
    { sub: 'Being behind after a number of trades' },
    'Over n trades with W winners, the result in R is 1.5W − (n − W). After 10 trades you are behind when 2.5W − 10 < 0, which means 3 winners or fewer. The chance of exactly k winners in n trades, each with win probability p, is given by the **binomial** formula: the number of ways to choose which k trades win, times pᵏ, times (1 − p)ⁿ⁻ᵏ. Python\'s `math.comb(n, k)` counts the ways.',
    {
      code: `import math

p, n = 0.5, 10
behind = sum(math.comb(n, k) * p ** k * (1 - p) ** (n - k) for k in range(4))
print(round(0.5 ** 4, 4), round(behind, 3))`,
      out: '0.0625 0.172',
    },
    '`range(4)` gives k = 0, 1, 2 and 3, the winner counts that leave you behind. About 17% of the time, this good setup is behind after 10 trades. With fewer trades it is worse; with hundreds it becomes rare. The figure in this lesson shows forty traders running the same rules, and how their results only line up behind the rules as the number of trades grows. A setup with a high win rate but losses larger than its wins can look good over 20 trades and still lose over 200.',

    { h: 'Measuring the process' },
    { sub: 'A grade at the time' },
    'Grade each trade at entry, before you know the result: was it in the plan, sized right, with exits set? Grading afterwards lets the outcome leak into the judgement, and the bad wins quietly become "good reads".',
    { sub: 'Rule adherence' },
    '**Rule adherence** is the share of trades that followed every rule: trades that followed ÷ all trades. It is the one number that says whether you are running the strategy you tested. A month at 70% means three trades in ten were something else.',
    {
      code: `trades = [(1.5, True), (-1.0, True), (2.5, False),
          (-1.0, True), (-3.0, False)]
kept = [r for r, ok in trades if ok]
print(len(kept) / len(trades), sum(kept))`,
      out: '0.6 -0.5',
    },
    'Each pair is (result in R, rules followed). Three of five trades followed the rules, so adherence is 0.6; they lost 0.5R between them, and the two rule breaks were a 2.5R bad win and a 3R loss, three times the planned risk. Splitting results this way shows what the plan earns and what your behaviour costs. Note that the share is divided by the number of trades, `len(trades)`, not by the count of kept trades.',

    { h: 'When the outcome does matter' },
    'Process over outcome applies to single trades and short runs. It is not a reason to ignore results for ever. If you followed the rules over a large sample, say a few hundred trades, and the setup still lost after costs, the result is the verdict: the setup has no edge as you trade it. Stop trading it live and go back to testing. Changing the exits to raise the win rate does not create an edge, as the first lesson of this module showed.',
    'In between, a bad week with full adherence and controlled losses is a normal week for a real setup. The right response is to do nothing, not to change the setup and not to trade bigger to catch up.',

    { h: 'A process scorecard' },
    'A short scorecard filled in for every trade makes all this routine: the setup tag, whether it was in the plan, whether the size matched the risk rule, whether the stop and target were set before entry and kept, whether the trade was inside the circuit breakers, the grade given at entry, and the result in R recorded separately.',
  ],

  'business-plan': [
    { h: 'Why write a plan' },
    'A **trading plan** is a written document that says what you trade, when, how much, and when you stop. It exists for one reason: decisions made during the session, with money moving and feelings running, are worse than decisions made the evening before. The plan moves as many decisions as possible to the calm side of the open.',
    'The rule that goes with it: during the session you follow the plan; you change it only outside market hours, after a review. A plan changed mid-session is a plan written by your mood.',

    { h: 'The parts of a plan' },
    { sub: 'Markets' },
    'The exact list of what you trade. For example: options on SPY and QQQ only, with one to seven days to expiry, and only strikes where the bid-ask spread is a few cents wide. Also what you will not touch, such as single stocks on earnings day. A short list keeps you on liquid contracts you know.',
    { sub: 'Setups' },
    'Each setup written as rules, as in the day trading module: the **context** (when the setup applies), the **trigger** (the event that starts the trade), the **entry**, the **stop**, the **target** and the **invalidation** (what tells you the idea is wrong before the stop is hit).',
    { sub: 'Sizing' },
    'The fraction of the account at risk per trade, and the formula that turns it into a number of contracts (below).',
    { sub: 'Limits' },
    'The circuit breakers from the tilt lesson: a daily loss limit, a maximum number of trades, a losses-in-a-row stop, and a **maximum open risk**, the most that may be at risk across all open positions at once. With a $30,000 account and a 2% cap on open risk, no more than $600 may be at risk at any moment, however many setups appear.',
    { sub: 'Routine and exceptions' },
    'The hours you trade, what you do before the open and what you do after the close. And the days you do not trade, for example the day of a Fed decision if your setups were never tested on such days.',

    { h: 'Rules that can be checked' },
    'Every rule should be **testable**: two people reading the plan and looking at the same chart should agree whether a trade broke it. "Trade only high-quality setups" cannot be broken, so it constrains nothing. "Buy a put when a 5-minute bar closes below the opening range low after 9:45 ET, stop at the opening range high" can be checked by anyone.',
    'A testable plan can even be written as data and checked by code before an order is sent:',
    {
      code: `plan = {'tickers': {'SPY', 'QQQ'}, 'max_risk': 100}
trade = {'ticker': 'QQQ', 'risk': 120}
problems = []
if trade['ticker'] not in plan['tickers']:
    problems.append('ticker')
if trade['risk'] > plan['max_risk']:
    problems.append('risk')
print(problems)`,
      out: "['risk']",
    },
    'QQQ is allowed, but $120 is above the $100 limit. A risk exactly equal to the limit would pass, because the check is `>`, not `>=`.',

    { h: 'Sizing in the plan' },
    'Sizing is arithmetic, covered in the risk module. The **risk budget** is the account times the fraction at risk. The **risk per contract** is the distance from entry to stop on the option price, times 100 shares per contract. The number of contracts is the budget divided by the risk per contract, **always rounded down**.',
    'Worked example: a $25,000 account risking 0.5% has a budget of $125. A put bought at $1.90 with a stop at $1.30 risks $0.60 × 100 = $60 per contract. 125 ÷ 60 = 2.08, so 2 contracts, risking $120. Rounding up to 3 would risk $180, well above the budget.',
    {
      code: `import math

def contracts(account, risk_pct, entry, stop):
    risk_per_contract = (entry - stop) * 100
    return math.floor(account * risk_pct / risk_per_contract)

print(contracts(25000, 0.005, 1.90, 1.30))`,
      out: '2',
    },
    'If the answer is 0, the trade is too large for the account and is skipped. The same arithmetic turns the daily loss limit into a count: a limit of 1.5% of $20,000 is $300, which is three full losses at $100 each.',

    { h: 'If-then rules' },
    'Plans fail at the awkward moments, so write rules for them as if-then statements. If I hit the daily loss limit, then I close the platform. If a fill is much worse than expected, then I log it and do not chase. If I break a rule, then the next trade is at half size. If I see a pattern that is not in the plan, then I screenshot it and test it after the session; I do not trade it. That last one matters: a new pattern has no measured edge, and adopting it mid-session is the decision the plan exists to prevent.',

    { h: 'What a weak plan looks like' },
    {
      list: [
        'No limits. A 1% risk per trade is harmless for three trades and ruinous for thirty.',
        'A monthly profit target. It pushes you to trade when there is nothing to trade, or to size up at the end of the month.',
        'Rules that cannot be checked, such as "wait for confirmation".',
        'Changes made during the session, or several at once.',
        'A plan that is never read. Read it before every session.',
      ],
    },
  ],

  'business-routine': [
    { h: 'A day in three parts' },
    'A trading day has three parts: before the session, the session, and after it. Beginners put all their attention on the middle part. The two outside parts decide most of the result, because they are where the decisions are made and where mistakes are found.',
    { sub: 'Before the session' },
    'Read the plan. Check the calendar of scheduled news (economic releases, Fed speakers, earnings for the names you trade). Mark the levels from the day trading module. Write a short watchlist and the setups you are looking for today. Then check yourself: how you slept, your mood, anything that will pull your attention. Your state is part of the system. The plan should say in advance what a bad state means, for example half size and a lower loss limit, or no trading at all, so the decision is made once rather than argued every morning.',
    { sub: 'During the session' },
    'Take only plan trades. Log each one as you take it. Stop at the limits.',
    { sub: 'After the session' },
    'Finish the journal before you look at anything else. Then close the platform.',

    { h: 'The journal' },
    'The **journal** is the record of every trade, and the raw material for every review. For each trade:',
    {
      list: [
        'Date and time of entry and exit.',
        'Underlying, and the option: call or put, strike, expiry.',
        'Entry and exit prices, number of contracts, commissions and fees.',
        'The result in dollars and in R.',
        'The setup tag, such as `orb` for opening range breakout or `vwap` for a pullback to VWAP.',
        'Whether every rule was followed, and if not, which one was broken.',
        'A screenshot of the chart at entry.',
        'One line on why you took it and how you felt.',
      ],
    },
    'Prices and fees can be copied from the broker statement later. The reason and the feeling cannot: within hours, memory rewrites both to fit the result. Write them at the time.',

    { h: 'The weekly review' },
    'Once a week, read the journal in a fixed order. A fixed agenda stops the review drifting into reliving the best and worst trades.',
    {
      list: [
        '**Adherence**: the share of trades that followed every rule, and what the rule breaks cost in R and in dollars.',
        '**By setup**: for each setup, the count, win rate, average win, average loss and expectancy.',
        '**By time**: results by hour of the day and by day of the week.',
        '**The largest losses**: each one planned, or a rule break?',
        '**Skipped trades** that met the rules: hesitation biases the record too.',
        '**The change under test**: how many trades so far against the number agreed.',
      ],
    },
    { sub: 'Totals by setup in code' },
    {
      code: `journal = [('orb', 2.0), ('orb', -1.0), ('vwap', -1.0),
           ('vwap', -1.0), ('orb', 1.5)]
totals = {}
for tag, r in journal:
    totals[tag] = totals.get(tag, 0) + r
print(totals, min(totals, key=totals.get))`,
      out: "{'orb': 2.5, 'vwap': -2.0} vwap",
    },
    '`totals.get(tag, 0)` returns the running total for the tag, or 0 the first time it appears. `min(totals, key=totals.get)` returns the tag with the smallest total. If you write such a search by hand with a loop, the comparison for the worst is "smaller than the worst so far", `<`; using `>` finds the best instead. Rounding the totals with `round(v, 1)` before printing hides tiny floating-point errors that sums of decimals can produce.',
    { sub: 'Putting a price on rule breaks' },
    'Add up the R of every trade that broke a rule, and multiply by your R in dollars. Rule breaks of −2R, −1.5R and +1R in a week with R = $80 cost (−2 − 1.5 + 1) × 80 = −$200. Seeing that figure every week is one of the strongest arguments for following the rules.',

    { h: 'One change at a time' },
    'The review ends in at most one change. If you change two things at once, say a closer stop and no trades after lunch, and results improve, you cannot tell which helped. One might have helped a lot while the other hurt a little. Change one thing, and the next review can measure it.',
    { sub: 'Writing the change down' },
    'A good change is a single, precise rule with a date, a reason and a point at which it will be judged: "From Monday, no new trades after 14:30 ET; review after 30 trades." Decide the number of trades in advance. At about 5 qualifying trades a week, 40 trades takes 8 weeks. That feels slow, and it is still a small sample, so treat the verdict as provisional. "Be more disciplined" is not a change; it is a wish.',
    'Changes to a setup itself should be tested on paper or in a backtest before you trade them with money.',

    { h: 'The loop' },
    'Put together, the routine is a feedback loop: plan, act, record, review, adjust, and around again. A suspicion such as "I trade badly in the afternoon" becomes a fact or is dropped when you split the journal by hour. Without the record there is nothing to review, and without the review the same mistakes repeat for years.',
  ],

  'business-scaling': [
    { h: 'Paper trading' },
    '**Paper trading** means trading a simulated account at real market prices with no money at stake. Most brokers offer one. It tests whether you can follow your plan, use the platform, place orders without mistakes (wrong strike, wrong expiry, buying when you meant to sell), and keep the journal. It costs nothing, so it is the right first step for every new setup and every new trader.',
    { sub: 'Two ways paper flatters you' },
    'First, the fills. A simulator often fills you at the mid or the last traded price, instantly and in full, with no one on the other side. In the real market you usually buy nearer the ask and sell nearer the bid, and on fast moves you get worse prices still. Second, the feelings. With nothing at stake, loss aversion, fear and tilt are missing, and they are what change real decisions. A strong paper record shows you can execute the plan. It does not show you can do it with money moving.',

    { h: 'Making paper honest' },
    'You can remove most of the first problem. Record paper fills at the far side of the spread: buy at the ask, sell at the bid. Or add a fixed slippage per contract to every fill. Charge the real commissions and fees. Size as you would with your real account, not with a paper million.',
    'Worked example: paper fills at the mid; live, you pay $0.04 above the mid when you buy and receive $0.04 below it when you sell. That is $0.08 per share across a round trip, or $8 per contract. On 2 contracts, $16 a trade. If the paper record showed $15 per contract per trade, the honest figure is $15 − $8 = $7.',
    {
      code: `extra_per_share = 0.04 + 0.04
per_contract = extra_per_share * 100
print(round(per_contract, 2), round(per_contract * 2, 2), 15 - round(per_contract, 2))`,
      out: '8.0 16.0 7.0',
    },
    'For short-term option trades, honest fills are often the whole difference between a paper record that looks good and a live one that does not.',

    { h: 'Going live' },
    'Decide the criteria for going live in advance and write them down, so impatience cannot bend them. A reasonable set: at least 50 paper trades of the setup, rule adherence of 90% or better, and positive expectancy after honest fills and fees. Three good days, or a paper account up a lot over a handful of trades, is not evidence.',
    'Then start at the smallest size: one contract, often as a **defined-risk** structure such as a vertical spread (from the strategies module), whose maximum loss is known before entry. The first live weeks are a test of you, not of the setup: you will find out whether you still follow the plan when the money is real.',

    { h: 'Scaling rules in both directions' },
    { sub: 'Up slowly' },
    'Add size only on a record: for example, one more contract after another 50 trades at the current size, with adherence above your threshold and the account at a new high. A rule can also tie size to profit, adding one contract for each full step of profit above the starting balance:',
    {
      code: `def size(equity, start, step):
    return 1 + max(0, int((equity - start) // step))

print(size(9000, 10000, 2500), size(12400, 10000, 2500), size(15100, 10000, 2500))`,
      out: '1 1 3',
    },
    '`//` is floor division: it keeps only full steps. $2,400 of profit is less than one $2,500 step, so the size stays at 1; $5,100 is two full steps, so 3. `max(0, ...)` stops a loss from pushing the size to zero or below. This rule never cuts size on a drawdown, which is why it needs a partner.',
    { sub: 'Down fast' },
    'A **drawdown** is a fall from the highest value the account has reached, its **peak**, measured as a fraction of that peak: (peak − now) ÷ peak. An account that peaked at $16,000 and is now $14,400 is in a 10% drawdown, even if it is still above where it started. A typical rule: halve the size at a 10% drawdown, and go back to paper if the drawdown reaches 20% or the rules are broken repeatedly.',
    'Scaling down fast matters because losses compound: a deeper hole needs a larger gain to climb out of, as the risk module showed. When the rule triggers, apply it from the next trade. Feeling sure that next week will be better is common after a drawdown and tells you nothing.',
    'When you code a size rule, be sure the "nothing happened" branch returns the size unchanged. A branch that grows the size every time it runs turns a slow scaling rule into a fast one without anyone deciding it.',

    { h: 'Account rules for small accounts' },
    'For years, US brokers applied FINRA\'s pattern day trader rule: an account that made four or more day trades in five business days needed at least $25,000 of equity in a margin account. At the time of writing (2026), FINRA has replaced that rule, including the $25,000 minimum, with new intraday margin standards that took effect on 4 June 2026, and brokers may phase them in until 20 October 2027. Brokers can also set stricter rules of their own. Rules in other countries are different again. Before you plan around any of this, check what your broker applies to your account.',

    { h: 'Mistakes to watch for' },
    {
      list: [
        'Treating a paper record with mid-price fills as proof of an edge.',
        'Going live at full size because the paper results were good.',
        'Scaling up after a few good days, or to make back a loss.',
        'Having a rule to scale up and no rule to scale down.',
        'Measuring drawdown from the starting balance instead of from the peak.',
      ],
    },
  ],

  'business-costs': [
    { h: 'Trading as a small business' },
    'Treat trading as a business and it has a profit and loss account like any other. The **gross edge** is what your trades make on average before any cost. Out of it come three kinds of cost, and only what is left is profit.',
    { sub: 'Per-trade costs' },
    'Commissions, often charged per contract each way; exchange and regulatory fees, usually a few cents per contract; the spread you cross; and slippage, the difference between the price you expected and the price you got. On short-term option trades the spread is often the largest of these. Buy 3 contracts at an ask of $0.85 when the bid is $0.80, sell them later at the bid with the quote unchanged, and the spread alone costs $0.05 × 100 × 3 = $15.',
    { sub: 'Fixed costs' },
    'Market data subscriptions, platform or software fees, charting tools, hardware, courses. They are paid whether you trade well or badly, and whether you trade at all.',
    { sub: 'Tax' },
    'Tax on profits, covered in outline below.',

    { h: 'How costs scale' },
    'Per-trade costs grow with activity. If a trade makes $9 on average before costs and costs $7, it nets $2, and trading twice as often doubles the $2. If the gross edge is smaller than the cost, every extra trade loses more: activity multiplies whatever the net edge is, including when it is negative. Costs can take a large share of a small edge: $7 out of $9 is 78%, and a slightly wider spread would wipe out the rest.',
    'The **break-even gross edge** per trade is the per-trade cost plus the fixed cost divided by the number of trades:',
    {
      code: `per_trade, fixed_month, trades_month = 7.0, 200.0, 60
print(round(per_trade + fixed_month / trades_month, 2))`,
      out: '10.33',
    },
    'With $200 a month of fixed costs and 60 trades a month, every trade has to make $10.33 on average before costs to break even. A trader who takes few trades carries more fixed cost per trade. The figure in this lesson shows a year of this arithmetic.',

    { h: 'Taxes in outline' },
    'Tax depends on the country you live in and on your own circumstances, and the rules change. What follows is a short outline of the US federal rules at the time of writing (2026), to show the kind of thing that matters. It is not advice. Check with a tax professional where you live.',
    {
      list: [
        '**Short-term and long-term**: gains on positions held one year or less are short-term and taxed as ordinary income. Nearly all day trading is short-term.',
        '**Losses**: if capital losses exceed capital gains for the year, up to $3,000 of the excess ($1,500 if married filing separately) can be set against other income. The rest is carried forward to later years.',
        '**Wash sales**: a loss is disallowed if you buy the same or a substantially identical security within 30 days before or after the sale. The disallowed loss is added to the cost of the new position, so it is deferred rather than lost, and it lowers the gain when that position is sold. Someone who trades the same options every day can find many losses deferred at year end.',
        '**Section 1256 contracts**: options on broad-based indexes, such as SPX, are treated as 60% long-term and 40% short-term whatever the holding period, and positions still open at year end are treated as if sold at their market value (marked to market). Options on SPY are options on an ETF and do not get this treatment, even though they follow the same index.',
        '**Trader tax status** and a mark-to-market election exist for people whose trading is a business in the tax sense. They are complicated, with strict conditions and deadlines: a matter for a professional.',
      ],
    },
    'Other countries treat trading in completely different ways: some tax it as capital gains, some as income when it is frequent, some treat particular products specially. Do not carry the US outline to another country.',

    { h: 'Records' },
    'Keep records as a business would: every trade with its fees, the monthly broker statements, and the yearly tax forms your broker issues (in the US, Form 1099-B). Keep them for years. The journal from the routine lesson already holds most of what you need, and it is also your evidence if a figure on a tax form looks wrong.',

    { h: 'What the studies of day traders found' },
    'A few markets record every trade by every individual, which lets researchers measure how day traders really do.',
    { sub: 'Taiwan' },
    'Brad Barber, Yi-Tsung Lee, Yu-Jane Liu and Terrance Odean studied every day trader in Taiwan from 1992 to 2006. In "The cross-section of speculator skill" (Journal of Financial Markets, 2014) they found that fewer than 1% of day traders could predictably and reliably earn positive returns after fees. A small group of skilled traders exists, so the honest summary is "very few", not "none". In "Learning, fast or slow" (Review of Asset Pricing Studies, 2020, with Ke Zhang) they found that day traders as a group lose money, and estimated that 97% of day traders are likely to lose money in future day trading.',
    { sub: 'Brazil' },
    'Fernando Chague, Rodrigo De-Losso and Bruno Giovannetti followed everyone who began day trading mini index futures in Brazil from 2013 to 2015 and kept going for more than 300 days ("Day trading for a living?", 2019). 97% lost money. Only about 1% earned more than the Brazilian minimum wage, and fewer still more than the starting salary of a bank teller. They found no sign that traders improved with experience. Because the study counted only those who persisted, it answers the claim that the losers are the people who gave up too soon.',

    { h: 'What return is realistic' },
    'Work the salary sum backwards. To take $30,000 a year from a $15,000 account without shrinking it, the account must return 200% a year, every year. The studies above say very few people manage any positive return after costs. The realistic plan is to treat a small account as a place to learn and test, keep your income from elsewhere, risk only money you can afford to lose, and judge the business on its record after every cost, not on its best month.',
  ],

  'business-lab': [
    { h: 'What the analyser is for' },
    'A journal you never read is a diary. Read by eye, it favours the trades you remember: the big win, the painful loss. This lab builds a small analyser in plain Python that turns a list of trades into the numbers a weekly review needs, so the review starts from facts.',
    { sub: 'The data' },
    'Each trade is a **dict**, a Python mapping from names to values:',
    { code: `{'setup': 'orb', 'hour': 10, 'r': 1.5, 'followed': True}` },
    '`setup` is the setup tag, `hour` the hour of entry, `r` the result in **R** (the result divided by the amount you planned to risk), and `followed` whether every rule was kept. Measuring in R lets you add and compare trades of different sizes: a $150 win on a $100 risk is 1.5R, whatever the number of contracts. The journal is a list of these dicts, in the order the trades were taken.',

    { h: 'Expectancy and groups' },
    'The **expectancy** is the average result per trade: the sum of the R values divided by their count. It already contains the win rate and the sizes of the wins and losses. A function that computes it must handle an empty list, because a group can be empty; returning 0.0 for no trades avoids a division by zero.',
    { sub: 'Grouping by any key' },
    'To see results by setup, by hour or by anything else you record, collect the R values for each value of a key. `dict.setdefault(key, [])` returns the list stored under a key, creating an empty one the first time, so you can append to it in one line:',
    {
      code: `trades = [{'setup': 'a', 'r': 1.0}, {'setup': 'b', 'r': -1.0},
          {'setup': 'a', 'r': 2.0}]
groups = {}
for t in trades:
    groups.setdefault(t['setup'], []).append(t['r'])
print(groups)`,
      out: "{'a': [1.0, 2.0], 'b': [-1.0]}",
    },
    'From there, each group gives a count and an expectancy. Keep the count beside the expectancy: a setup with three trades says almost nothing, as the process lesson showed. Python dicts keep keys in the order they were first added, which is why the printed order follows the data.',
    { sub: 'Parts of the day' },
    'Hours can be grouped further into parts of the session with a small function that returns a label, such as the open, midday and the close, and the totals added up per label. With a handful of trades in each part, a difference is something to watch, not a rule to adopt.',

    { h: 'Rule breaks and tilt' },
    { sub: 'What the rule breaks cost' },
    'Split the R values into trades that followed the rules and trades that broke them, and add up each list. The count and the total of the broken trades are the cost of your behaviour; the total of the followed trades is what the plan itself earned. Round totals of decimals before comparing them: 0.1 + 0.2 is not exactly 0.3 in floating point.',
    { sub: 'Trades taken after a loss' },
    'Tilt shows in data as worse results straight after a loss. To check, walk through the results with `enumerate`, which gives each position and value, and look at the previous result. The first trade has no previous trade, so it goes with the others.',
    {
      code: `rs = [1.0, -1.0, 2.0, -1.0, -1.0]
for i, r in enumerate(rs):
    if i > 0 and rs[i - 1] < 0:
        print(i, r)`,
      out: `2 2.0
4 -1.0`,
    },
    'Trades 2 and 4 follow a loss. Average those against the rest. On a real journal with enough trades, a clear gap is a reason for a rule such as a break after every loss.',

    { h: 'Streaks and drawdown' },
    { sub: 'The longest losing streak' },
    'Keep a running count that adds one on every loss and resets to zero on anything else, a flat 0R trade included, and remember the largest value it reached. Compare it with what the risk module says to expect for your win rate: a streak longer than your plan can absorb is a sizing problem, not a setup problem.',
    { sub: 'The deepest drawdown in R' },
    'Add the results one by one to get the running total, the **equity** in R. Track the highest value so far, the **peak**. At each step, equity − peak is zero at a new high and negative below it. The deepest drawdown is the most negative of these values, so it is found with `min`, starting from 0.',
    {
      code: `equity, peak, worst = 0.0, 0.0, 0.0
for r in [1.0, 2.0, -1.0, -1.5, 3.0, -0.5]:
    equity += r
    peak = max(peak, equity)
    worst = min(worst, equity - peak)
print(equity, peak, worst)`,
      out: '3.0 3.5 -2.5',
    },
    'The total rose to 3R, fell to 0.5R (a drawdown of 2.5R), recovered to a new peak of 3.5R and ended at 3R.',

    { h: 'The report' },
    'The last code step puts the pieces into one function that returns a dict: the number of trades, the expectancy, the groups by setup, the rule-break figures, the longest losing streak and the deepest drawdown. Each part is a function you have already tested, so the report is a few lines that call them. Round the numbers you will read, and keep the raw ones for any further calculation.',

    { h: 'From numbers to one decision' },
    'A report is for making one decision, in the spirit of the routine lesson. Read it in order. First the rule breaks: if they cost more than any setup lost, behaviour is the first thing to fix. Then the tilt check: a large gap after losses suggests a rule about what happens after a loss. Then the setups, keeping their sample sizes in mind: do not drop a setup on a small sample whose expectancy is near zero; mark it to watch. Check the longest streak against your daily limit and sizing. Then choose a single change, write it down with the date, and decide how many trades it gets before you judge it.',
  ],
}
