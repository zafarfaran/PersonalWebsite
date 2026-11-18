import type { Module } from '../types'

export const daytrading: Module = {
  id: 'daytrading',
  title: 'The intraday playbook',
  summary:
    'One trading day from preparation to the close: setups written as testable rules, the option to carry them, and how to manage the trade, with 0DTE treated as the sharp tool it is.',
  lessons: [
    {
      id: 'daytrading-prep',
      title: 'Preparing the day',
      summary: 'The calendar, the overnight move, the levels, a short watchlist and the conditions under which you do not trade.',
      text: [
        'Most of the decisions in a trading day are better made before 9:30 Eastern, when nothing is moving and no money is at risk. Preparation is a short, fixed routine that turns into a one-page plan for the day.',
        '**The calendar.** Scheduled news moves the whole market at known times. At the time of writing (2026) the US consumer price index (CPI) and the monthly jobs report come out at 8:30 am Eastern, and the Federal Reserve (FOMC) statement at 2:00 pm with a press conference at 2:30 pm on meeting days. Single stocks have earnings dates. Look them up every morning; dates and times change, so check the official calendars or your broker.',
        '**The overnight move and the levels.** Compare where the index trades before the open with yesterday\'s close: that is the **gap**. Then mark the levels other traders watch: yesterday\'s high, low and close, the premarket high and low, and nearby round numbers. Treat them as zones, not exact prices (the `charts` module covers why).',
        '**How far can it go.** The **expected daily move** from implied volatility (from the `volatility` module) is about `price × IV ÷ √252`. With SPY at 500 and IV at 16% that is about $5. It is one standard deviation, not a limit, but it tells you whether a target is ordinary or asks for an unusual day.',
        '**A short watchlist and the no-trade list.** Day trade only liquid names whose options are a cent or two wide: SPY, QQQ, SPX and a few large stocks. Then write down, in advance, when you will not trade: inside a window around scheduled news, when the option spread is too wide, after your daily loss limit, or when you are not in a state to follow rules. Deciding this at 8:45 is easy. Deciding it at 10:15 after a loss is not.',
      ],
      rules: [
        'Check the economic and earnings calendar every morning, from an official source.',
        'Gap = premarket price minus yesterday\'s close, usually as a percentage of the close.',
        'Mark yesterday\'s high, low and close, the premarket high and low, and round numbers.',
        'Expected daily move ≈ price × IV ÷ √252: one standard deviation, not a ceiling.',
        'Trade a short list of liquid names, and write your no-trade conditions before the open.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'daytrading-prep-1',
          ask: 'SPY closed at 500.00 yesterday. At 9:00 it trades at 503.50 premarket. What is the gap, as a percentage of the close (for example 0.5%)?',
          answer: 0.007,
          tol: 0.0005,
          check: '(503.5 - 500) / 500',
          why: 'The gap is 503.50 − 500.00 = 3.50, and 3.50 ÷ 500 = 0.7%. Measuring from yesterday\'s close lets you compare gaps across days and names.',
        },
        {
          kind: 'number',
          id: 'daytrading-prep-2',
          ask: 'SPY is at 400 and its implied volatility is 20%. What is the expected daily move in dollars, to 2 decimal places?',
          answer: 5.04,
          tol: 0.05,
          check: '400 * 0.20 / math.sqrt(252)',
          hint: 'Price × IV ÷ √252, and √252 is about 15.87.',
          why: '400 × 0.20 = 80 for a year, and 80 ÷ 15.87 ≈ 5.04 for a day. Roughly two days in three should move less than this, if returns behaved like the model. Real days have more big moves than the model says.',
        },
        {
          kind: 'number',
          id: 'daytrading-prep-3',
          ask: 'QQQ is at 450 with implied volatility of 24%. What is the expected daily move in dollars, to 2 decimal places?',
          answer: 6.8,
          tol: 0.05,
          check: '450 * 0.24 / math.sqrt(252)',
          why: '450 × 0.24 = 108, and 108 ÷ 15.87 ≈ 6.80. Higher implied volatility means a wider normal day, so stops and targets that suit a quiet SPY day can be too tight here.',
        },
        {
          kind: 'choice',
          id: 'daytrading-prep-4',
          ask: 'CPI is released at 8:30 Eastern, an hour before the stock market opens. What should your plan for the open assume?',
          options: [
            'The reaction will be over by 9:30, so the open will be calm',
            'Price may already have moved far from yesterday\'s levels, and the open can be fast with wide option spreads: plan from where price is at 9:25',
            'Options will be cheaper than usual right before the release',
            'Nothing special: scheduled news is always fully priced in',
          ],
          answer: 1,
          why: 'Index futures trade before the open, so much of the first reaction happens premarket and shows up as a gap. The open then inherits it, often with a second leg. Implied volatility usually rises into a known release, so options cost more before it, not less.',
        },
        {
          kind: 'choice',
          id: 'daytrading-prep-5',
          ask: 'An FOMC day: the statement is at 2:00 pm Eastern and the press conference at 2:30. At 1:45 you hold a 0DTE call that is up 1R, and your plan has no rule for this. What is the sound course?',
          options: [
            'Hold: the morning trend will carry on through the statement',
            'Buy more, because the big move is about to come',
            'Act on a rule written before the day, such as flat before 2:00 on Fed days; then add that rule to your plan',
            'Move the stop further away so the spike does not shake you out',
          ],
          answer: 2,
          why: 'A release can move price several times the morning range in either direction within minutes, and a 0DTE option magnifies that. The decision belongs in the morning plan. Widening the stop raises the risk exactly when it is least known.',
        },
        {
          kind: 'output',
          id: 'daytrading-prep-6',
          ask: "Yesterday's bars, shortened to four. What does this print?",
          code: `bars = [  # yesterday's bars: (high, low, close)
    (502.1, 500.4, 501.8),
    (503.6, 501.5, 503.0),
    (503.2, 499.7, 500.2),
    (501.0, 499.9, 500.6),
]
high = max(b[0] for b in bars)
low = min(b[1] for b in bars)
close = bars[-1][2]
print(high, low, close)`,
          answer: '503.6 499.7 500.6',
          why: "Yesterday's high is the largest high, the low the smallest low, and the close is the close of the last bar. These three are among the first levels to write on today's plan.",
        },
        {
          kind: 'bug',
          id: 'daytrading-prep-7',
          ask: 'This should give a positive number for a gap up. It reports gap ups as negative.',
          code: `def gap_percent(prev_close, premarket):
    # how far premarket is from yesterday's close, in percent
    change = prev_close - premarket
    return 100 * change / prev_close`,
          line: 3,
          fix: '    change = premarket - prev_close',
          why: 'The gap is today minus yesterday. With the subtraction the wrong way round, a scanner that looks for gap ups finds gap downs instead, and every rule built on it is backwards.',
        },
        {
          kind: 'choice',
          id: 'daytrading-prep-8',
          ask: 'The expected move in SPY today is about $5. At 10:30 SPY is already $4.50 above yesterday\'s close, and a setup offers a long with a target $3 higher. How should you read the target?',
          options: [
            'It cannot be reached: the expected move is a ceiling',
            'It asks for a total move of $7.50, half as much again as a one-standard-deviation day: possible, but a reason to want a nearer target or to skip, as your rules say',
            'The expected move has nothing to say about it',
            'A strong day makes the target more likely, so take it at full size',
          ],
          answer: 1,
          why: 'The expected move is a scale, not a wall. Days larger than one standard deviation happen often. But a target that needs an unusual day should be priced as such, and your rules should say in advance what you do with it.',
        },
        {
          kind: 'choice',
          id: 'daytrading-prep-9',
          ask: 'Which name should come off a day-trading watchlist?',
          options: [
            'SPY, with its options bid 1.24 and asked 1.25',
            'A stock whose at-the-money options are bid 1.00 and asked 1.40, trading a few hundred contracts a day',
            'QQQ, with its options bid 2.10 and asked 2.12',
            'A large stock on a quiet day, its options a cent or two wide',
          ],
          answer: 1,
          why: 'A 0.40 spread on a 1.20 option is a third of its value. Buy at the ask and sell at the bid and you lose that before the stock moves at all. No intraday edge survives a cost like that.',
        },
        {
          kind: 'write',
          id: 'daytrading-prep-10',
          ask: 'Write the morning no-trade check. Return a list of reasons, in this order: `"news"` if a scheduled release is between 0 and 15 minutes away, `"spread"` if the option spread is more than 5% of the mid price, `"limit"` if the day\'s P&L has reached minus the daily loss limit. An empty list means you may trade.',
          starter: `def no_trade_reasons(minutes_to_news, bid, ask, day_pnl, daily_limit):
    # minutes_to_news: minutes until the next scheduled release, or None if there is none today
    # day_pnl: today's P&L in dollars (negative when losing); daily_limit: a positive number of dollars
    reasons = []
    return reasons`,
          solution: `def no_trade_reasons(minutes_to_news, bid, ask, day_pnl, daily_limit):
    reasons = []
    if minutes_to_news is not None and 0 <= minutes_to_news < 15:
        reasons.append("news")
    mid = (bid + ask) / 2
    if (ask - bid) / mid > 0.05:
        reasons.append("spread")
    if day_pnl <= -daily_limit:
        reasons.append("limit")
    return reasons`,
          tests: `out = no_trade_reasons(None, 2.00, 2.02, 0, 500)
assert out is not None, "the function returns nothing yet"
assert out == [], f"a quiet day, a tight spread and no losses should give [], got {out}"
assert no_trade_reasons(10, 2.00, 2.02, 0, 500) == ["news"], "a release 10 minutes away should give ['news']"
assert no_trade_reasons(40, 2.00, 2.02, 0, 500) == [], "a release 40 minutes away is outside the window"
assert no_trade_reasons(None, 1.00, 1.40, 0, 500) == ["spread"], "a 0.40 spread on a 1.20 mid is 33%: that should give ['spread']"
assert no_trade_reasons(None, 2.00, 2.02, -500, 500) == ["limit"], "losing exactly the daily limit should stop you"
assert no_trade_reasons(5, 1.00, 1.40, -600, 500) == ["news", "spread", "limit"], "all three reasons, in the order news, spread, limit"`,
          hint: 'Three separate `if` checks. The mid is the average of the bid and the ask.',
          why: 'Rules you can run as code are rules you can follow when you are tired or upset. The check also leaves a record of why you sat out, which is useful in the review.',
        },
        {
          kind: 'design',
          id: 'daytrading-prep-11',
          ask: 'Tomorrow CPI comes out at 8:30 Eastern. Write the one-page plan you would have in front of you at 9:25.',
          why: 'A plan made before the open is made without a position and without fear or greed. Its value is that you follow it when the screen is moving.',
          checklist: [
            { point: 'The calendar: CPI at 8:30, anything else that day, and earnings for names on the list', why: 'Known events are the cheapest risk to avoid: you know the time in advance.' },
            { point: 'The gap and where price is relative to yesterday\'s high, low and close', why: 'A big gap can make yesterday\'s levels irrelevant for the morning.' },
            { point: 'The levels for today as zones, including premarket high and low and round numbers', why: 'These are where setups trigger and where stops and targets go.' },
            { point: 'The expected move, and how much of it the gap has already used', why: 'It tells you whether a target is ordinary or needs an unusual day.' },
            { point: 'Which setups you are allowed to take, and in which scenario (above or below a level)', why: 'Deciding the menu in advance stops you inventing trades during the session.' },
            { point: 'No-trade conditions: a time window after the release, a maximum option spread', why: 'The first minutes after news have the widest spreads and the least reliable prices.' },
            { point: 'Risk per trade in dollars and the daily loss limit, written as numbers', why: 'Numbers written down before the open are much harder to bargain with later.' },
          ],
        },
      ],
    },
    {
      id: 'daytrading-setup',
      title: 'What makes a setup',
      summary: 'Context, trigger, entry, stop, target and invalidation: a trade idea written so precisely that a computer could test it.',
      text: [
        'A **setup** is a trade idea written as rules. It has six parts. The **context**: what must be true about the day before you even look for the trade (above VWAP, a trend day, no news within 30 minutes). The **trigger**: the exact event that says now (a 5-minute bar closes above a level). The **entry**: the price or order you use. The **stop**: where you are out with a loss. The **target**: where you take profit, or the rule that trails it. The **invalidation**: the market condition that says the idea itself is wrong, which may come before the stop.',
        'Every part must be checkable. "Price looks strong" is not a rule. "A 5-minute close above 503.20 while above VWAP, before 11:30" is. If two people reading your rules would take different trades, the rules are not finished.',
        'The stop and the target give the trade\'s **R multiple**: reward divided by risk, `(target − entry) ÷ (entry − stop)` for a long. From the `risk` module, R is the amount you lose when stopped, and expectancy is `win rate × average win − loss rate × average loss`. With a 2R target and a 1R stop you break even at a win rate of 1 ÷ (1 + 2) = 33%, before costs. Costs push that number up.',
        'Write a setup as a **hypothesis**, not a promise: what has to be true in the market for it to work (for example, that moves out of the opening range tend to carry on), how it fails (the move reverses), and how you will test it (the `backtest` module). Nobody can tell you a setup works. Only your own test on enough trades can tell you whether it might, and even that can be luck.',
        'Once the rules are written, follow them exactly. A stop moved "because it looked like it would turn" makes your record describe a different strategy from the one you tested.',
      ],
      rules: [
        'A setup has context, trigger, entry, stop, target and invalidation, each written as a rule.',
        'If two people could read your rules and take different trades, rewrite them.',
        'R multiple = (target − entry) ÷ (entry − stop) for a long.',
        'Breakeven win rate for a target of k R is 1 ÷ (1 + k), before costs.',
        'A setup is a hypothesis to test, never a fact. Follow the rules or your results mean nothing.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'daytrading-setup-1',
          ask: 'A long: entry 502.00, stop 501.00, target 504.50. What is the R multiple of the target?',
          answer: 2.5,
          check: '(504.5 - 502) / (502 - 501)',
          why: 'Reward is 2.50, risk is 1.00, so the target is 2.5R. A trade is described by its R multiple, not its dollars, so trades of different sizes can be compared.',
        },
        {
          kind: 'number',
          id: 'daytrading-setup-2',
          ask: 'A setup always risks 1R and targets 2R, and every trade ends at one or the other. What win rate breaks even, before costs? Give a percentage, for example 25%.',
          answer: 0.3333,
          tol: 0.005,
          check: '1 / (1 + 2)',
          why: 'Break even when p × 2 = (1 − p) × 1, so p = 1/3, about 33%. Above that the setup has a positive expectancy on paper; below it, it loses.',
        },
        {
          kind: 'number',
          id: 'daytrading-setup-3',
          ask: 'The same setup, but spread, slippage and fees cost 0.1R on every trade, win or lose. What win rate now breaks even? Give a percentage, for example 25%.',
          answer: 0.3667,
          tol: 0.005,
          check: '1.1 / (1.9 + 1.1)',
          hint: 'A win is now worth 1.9R and a loss costs 1.1R.',
          why: 'p × 1.9 = (1 − p) × 1.1 gives p = 1.1 ÷ 3.0 ≈ 36.7%. A cost of a tenth of R moves the bar by more than three points of win rate. Small edges are eaten by costs first.',
        },
        {
          kind: 'number',
          id: 'daytrading-setup-4',
          ask: 'A setup wins 45% of the time with an average win of 1.8R and an average loss of 1R. What is its expectancy in R per trade?',
          answer: 0.26,
          check: '0.45 * 1.8 - 0.55 * 1',
          why: '0.45 × 1.8 = 0.81 and 0.55 × 1 = 0.55, so 0.26R per trade. It wins less than half the time and still has a positive expectancy, if those figures hold up on enough trades.',
        },
        {
          kind: 'choice',
          id: 'daytrading-setup-5',
          ask: 'Which of these is a trigger you could test?',
          options: [
            'Buyers are clearly in control',
            'A 5-minute bar closes above 503.20 while price is above VWAP, before 11:30',
            'The chart looks like it is about to break out',
            'Price is strong compared with the market',
          ],
          answer: 1,
          why: 'Only the second can be checked bar by bar, by you or by code, with the same answer every time. The others are feelings, and feelings change with your P&L.',
        },
        {
          kind: 'choice',
          id: 'daytrading-setup-6',
          ask: 'Your idea: SPY holds above yesterday\'s high at 503 and trends. Your written invalidation is "a 5-minute close back under 503". You bought at 503.40 with the stop at 502.60. A bar closes at 502.80. The stop has not been touched.',
          options: [
            'Stay in: the stop has not been hit',
            'Exit: the idea is invalidated, and the rule says so',
            'Lower the stop to give the trade more room',
            'Buy more at the better price',
          ],
          answer: 1,
          why: 'The stop is the worst case. Invalidation is the market telling you the reason for the trade is gone, and it often comes first and cheaper. If your rules name an invalidation, act on it.',
        },
        {
          kind: 'output',
          id: 'daytrading-setup-7',
          ask: 'Three long trades. What does this print?',
          code: `trades = [  # (entry, stop, exit) for long trades
    (100.0, 99.0, 102.0),
    (50.0, 49.5, 49.5),
    (20.0, 19.0, 20.5),
]
rs = [(x - e) / (e - s) for e, s, x in trades]
print(rs, sum(rs))`,
          answer: '[2.0, -1.0, 0.5] 1.5',
          why: 'Each result is divided by its own risk: +2 over 1 is 2R, −0.5 over 0.5 is −1R, +0.5 over 1 is 0.5R. In R the three trades can be added up even though the prices are different.',
        },
        {
          kind: 'bug',
          id: 'daytrading-setup-8',
          ask: 'This should give the result of a trade in R. Every short that made money comes out as a loss.',
          code: `def r_multiple(entry, stop, exit, side):
    risk = abs(entry - stop)
    if side == "long":
        return (exit - entry) / risk
    return (exit - entry) / risk`,
          line: 5,
          fix: '    return (entry - exit) / risk',
          why: 'A short makes money when the exit is below the entry, so its result is entry minus exit. A journal with this bug shows every good short as a loss and you would drop the wrong setup.',
        },
        {
          kind: 'write',
          id: 'daytrading-setup-9',
          ask: 'Write `target_price(entry, stop, r)`: the price that is `r` times the risk away from the entry, in the direction of the trade. It must work for longs (stop below entry) and shorts (stop above entry).',
          starter: `def target_price(entry, stop, r):
    # long: stop below entry, target above. short: stop above entry, target below.
    pass`,
          solution: `def target_price(entry, stop, r):
    return entry + r * (entry - stop)`,
          tests: `out = target_price(502.0, 501.0, 2)
assert out is not None, "the function returns nothing yet"
assert abs(out - 504.0) < 1e-9, f"a long from 502 with the stop at 501 and r = 2 targets 504, got {out}"
assert abs(target_price(100.0, 99.5, 3) - 101.5) < 1e-9, "a long from 100 with a 0.50 risk and r = 3 targets 101.50"
assert abs(target_price(505.0, 505.8, 2) - 503.4) < 1e-9, "a short from 505 with the stop at 505.80 and r = 2 targets 503.40: the target is below the entry"`,
          hint: 'For a long, entry − stop is positive; for a short it is negative. That sign does the work.',
          why: '`entry − stop` is the risk with a sign: positive for a long, negative for a short. Multiplying it by r and adding it to the entry gives the target on the correct side in both cases, with no `if`.',
        },
        {
          kind: 'design',
          id: 'daytrading-setup-10',
          ask: 'A friend says: "Buy the first pullback after a gap up." Turn it into a setup you could test.',
          why: 'Writing it down forces every vague word into a number, and those numbers are exactly what a backtest needs.',
          checklist: [
            { point: 'Context: what counts as a gap up (for example at least 0.5% above yesterday\'s close) and on which names', why: 'Without a threshold, "gap up" means something different every morning.' },
            { point: 'What a pullback is: for example two 5-minute bars with lower highs, holding above VWAP or the gap level', why: 'This defines which dips qualify and which mean the idea has failed.' },
            { point: 'The trigger: a bar closing above the previous bar\'s high', why: 'Buying while price is still falling is guessing the bottom.' },
            { point: 'Stop below the pullback low, target in R or at a level, and a time window for entries', why: 'Stop and target define R; the window stops you taking it at 3:30 pm.' },
            { point: 'Invalidation: a close below VWAP or back into yesterday\'s range', why: 'It gets you out when the reason for the trade is gone, before the stop if need be.' },
            { point: 'The hypothesis and how it fails: early buyers return on a dip; it fails when the gap fills', why: 'Knowing the failure mode tells you what to look for in the losing trades.' },
            { point: 'How it will be tested: on past data first, then on paper, with costs', why: 'Until it has been tested, it is an idea, not an edge.' },
          ],
        },
        {
          kind: 'choice',
          id: 'daytrading-setup-11',
          ask: 'Over 40 trades you often moved the stop further away "because it looked like it would turn". What do those 40 results tell you about the setup as written?',
          options: [
            'They show it works, because the moved stops often saved the trade',
            'Little: they are the results of a different strategy, your rules plus improvised stops',
            'They show it works better than tested',
            'They are fine as long as the total is positive',
          ],
          answer: 1,
          why: 'The written rules were not what you traded, so the record cannot tell you whether the rules have an edge. And stops widened at will tend to create the rare large loss that the record has not met yet.',
        },
      ],
    },
    {
      id: 'daytrading-orb',
      title: 'The opening range breakout',
      summary: 'Mark the range of the first minutes, trade the first close outside it, and know how it fails.',
      widget: 'daytrading-orb',
      text: [
        'The **opening range** is the high and low of the first minutes of the session: 5, 15 or 30 minutes are common choices. The **opening range breakout** (ORB) takes the first decisive move out of it. A typical rule set: after the first 15 minutes, go long when a 5-minute bar closes above the range high (short below the range low), stop at the other side of the range or at its middle, target a multiple of R or trail the stop, no new entries after a cut-off time, out by the close.',
        'The hypothesis behind it: the open concentrates overnight news and a wave of orders, and when price leaves that first range with participation, the move sometimes carries on. That is a claim to test, not a known fact. Whether it held in the past, on which names and with which settings, is exactly what the `backtest` module checks.',
        'How it fails: the **failed breakout**. Price closes outside the range, pulls in buyers, then falls back inside and runs to the stop. On quiet, choppy days this can happen on both sides. A range that is very wide makes the stop far away, so R is big in dollars and the target needs an unusual day. A range that is very narrow is broken by noise.',
        'The first minutes are the most dangerous of the day. Option spreads are at their widest, quotes jump, and prices that look like levels are often one large order. Many ORB rules therefore wait for a 15 or 30-minute range, and many filters skip days when the range is already a large part of the expected move.',
        'Every choice here (range length, stop at the far side or the middle, target, cut-off time, filters) changes the results, and with enough choices you can make any past period look good. Decide them before you test, and test them on data you did not use to choose them.',
      ],
      rules: [
        'Opening range = high and low of the first n minutes. Write down n.',
        'Trigger on a bar close outside the range, not on a touch.',
        'Stop at the other side or the middle of the range; target in R; a cut-off time for entries.',
        'Expect failed breakouts. They are the normal loss of this setup, not a surprise.',
        'Skip ranges too wide for the expected move. Avoid trading inside the first few minutes.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'daytrading-orb-1',
          ask: 'The 15-minute opening range is 500.80 to 502.40. You go long at 502.50 on a close above the high, with the stop at the range low and a 2R target. What is the target price?',
          answer: 505.9,
          tol: 0.01,
          check: '502.5 + 2 * (502.5 - 500.8)',
          why: 'Risk is 502.50 − 500.80 = 1.70, so 2R is 3.40 and the target is 505.90. A wide range makes for a distant target.',
        },
        {
          kind: 'number',
          id: 'daytrading-orb-2',
          ask: 'Same trade, but the stop goes at the middle of the range, 501.60. What is the 2R target now?',
          answer: 504.3,
          tol: 0.01,
          check: '502.5 + 2 * (502.5 - (500.8 + 502.4) / 2)',
          why: 'Risk is 502.50 − 501.60 = 0.90, so 2R is 1.80 and the target is 504.30. Both stop and target are closer.',
        },
        {
          kind: 'choice',
          id: 'daytrading-orb-3',
          ask: 'What do you trade away by moving the stop from the far side of the range to its middle?',
          options: [
            'Nothing: smaller losses are always better',
            'Each loss is smaller and the target closer, but price comes back to the middle of the range more often, so more trades are stopped out; only a test says which is better',
            'The win rate goes up because the target is closer, with no cost',
            'It turns the setup into a different market',
          ],
          answer: 1,
          why: 'A tighter stop changes the win rate as well as the size of the loss. Whether the trade-off helps depends on how price behaves after breakouts, which is an empirical question.',
        },
        {
          kind: 'output',
          id: 'daytrading-orb-4',
          ask: 'The 15-minute opening range from 5-minute bars. What does this print?',
          code: `bars = [  # 5-minute bars from 9:30: (high, low)
    (501.2, 499.8),
    (501.9, 500.6),
    (501.5, 500.1),
    (502.8, 501.4),
]
first = bars[:3]
hi = max(h for h, l in first)
lo = min(l for h, l in first)
print(hi, lo, round(hi - lo, 2))`,
          answer: '501.9 499.8 2.1',
          why: 'Fifteen minutes is the first three 5-minute bars. The fourth bar (9:45) is after the range and does not count, even though its high of 502.8 is the highest.',
        },
        {
          kind: 'bug',
          id: 'daytrading-orb-5',
          ask: 'This should return the opening range. The range comes out far too narrow.',
          code: `def opening_range(bars, n):
    first = bars[:n]
    hi = max(b["high"] for b in first)
    lo = max(b["low"] for b in first)
    return hi, lo`,
          line: 4,
          fix: '    lo = min(b["low"] for b in first)',
          why: 'The range low is the lowest low. The highest low sits inside the range, so the "range" shrinks and nearly every bar looks like a breakout.',
        },
        {
          kind: 'write',
          id: 'daytrading-orb-6',
          ask: 'Write `orb_signal(bars, n, last)`: the opening range is the first `n` bars. Look at bars from index `n` up to but not including `last`, and return `("long", i)` for the first bar that closes above the range high or `("short", i)` for the first that closes below the range low. Return `None` if neither happens.',
          starter: `def orb_signal(bars, n, last):
    # bars: list of dicts with "high", "low", "close"
    pass`,
          solution: `def orb_signal(bars, n, last):
    hi = max(b["high"] for b in bars[:n])
    lo = min(b["low"] for b in bars[:n])
    for i in range(n, min(last, len(bars))):
        if bars[i]["close"] > hi:
            return ("long", i)
        if bars[i]["close"] < lo:
            return ("short", i)
    return None`,
          tests: `def bar(h, l, c):
    return {"high": h, "low": l, "close": c}
bars = [bar(501, 499, 500), bar(501.5, 499.5, 501), bar(501, 500, 500.5), bar(502, 500.5, 501.8), bar(503, 501.5, 502.5)]
out = orb_signal(bars, 2, 10)
assert out is not None, "the function returns nothing for a clear breakout"
assert out == ("long", 3), f"the range is 499 to 501.5 and bar 3 closes at 501.8: expected ('long', 3), got {out}"
assert orb_signal(bars, 2, 3) is None, "with last = 3 no bar after the range may be used"
bars2 = [bar(501, 499, 500), bar(501.5, 499.5, 501), bar(502, 500, 501.4), bar(500, 498, 498.6)]
assert orb_signal(bars2, 2, 10) == ("short", 3), "a high above the range is not a trigger; only closes count, so this is ('short', 3)"
assert orb_signal(bars2, 1, 10) == ("long", 2), "with a 1-bar range of 499 to 501, bar 1 closes at 501 (not above it) and bar 2 closes above at 501.4: expected ('long', 2)"`,
          hint: 'Find the range from `bars[:n]`, then loop over the later bars and compare each close with it.',
          why: 'Using closes rather than highs and lows is part of the rule: a wick through the level that closes back inside is not a breakout. The cut-off index enforces the time window.',
        },
        {
          kind: 'choice',
          id: 'daytrading-orb-7',
          ask: 'You went long on the close above the range high (upper dashed line). The chart shows what happened next. Price is back inside the range and heading for your stop at the range low. What do you do?',
          chart: {
            title: 'A failed breakout',
            x: '5-minute bars',
            y: 'price',
            series: [
              { name: 'price', points: [501.0, 501.3, 501.6, 502.0, 502.6, 502.4, 502.0, 501.5, 501.0, 500.6], color: 'accent' },
              { name: 'range high', points: [502.3, 502.3, 502.3, 502.3, 502.3, 502.3, 502.3, 502.3, 502.3, 502.3], color: 'muted' },
              { name: 'range low', points: [500.4, 500.4, 500.4, 500.4, 500.4, 500.4, 500.4, 500.4, 500.4, 500.4], color: 'muted' },
            ],
          },
          options: [
            'Hold past the stop: it was a real breakout and will come back',
            'Take the loss as the rules say, at the stop or on your written exit for a close back inside; a failed breakout is the normal loss of this setup',
            'Reverse to a short at once, because failed breakouts always reverse',
            'Buy more, since the price is better now',
          ],
          answer: 1,
          why: 'The setup expects some breakouts to fail. Its result depends on those losses being 1R and not more. A reversal can be its own setup, but only if you have written and tested it.',
        },
        {
          kind: 'choice',
          id: 'daytrading-orb-8',
          ask: 'Why do many ORB rules wait for a 15 or 30-minute range instead of trading the range of the first minute or two?',
          options: [
            'Exchanges do not allow trading in the first minutes',
            'Volume is lowest at the open',
            'Option spreads are widest and quotes jumpiest in the first minutes, and a very short range is often broken by noise that then reverses',
            'Prices in the first minutes are not real prices',
          ],
          answer: 2,
          why: 'Volume is in fact highest at the open. The problem is that prices are least settled: spreads are wide and a tiny range turns ordinary noise into signals.',
        },
        {
          kind: 'number',
          id: 'daytrading-orb-9',
          ask: 'Your filter skips the ORB when the opening range is more than 50% of the expected daily move. Today the range is $4.00 wide and the expected move is $5.00. What share of the expected move is the range? Give a percentage, for example 25%.',
          answer: 0.8,
          tol: 0.005,
          check: '4.0 / 5.0',
          why: '4 ÷ 5 = 80%, well over 50%: you skip. With a stop at the far side, R would be $4 or more and a 2R target would need a move far beyond a normal day.',
        },
        {
          kind: 'choice',
          id: 'daytrading-orb-10',
          ask: 'In the figure, keep the stop at the far side and switch from the 15-minute range to the 5-minute range. What happens?',
          options: [
            'The total improves because the entries come earlier',
            'Nothing changes: the breakout days are the same',
            'Five of the six days are stopped out and the total falls from about +1.5R to about −4R',
            'Every day becomes a winner because the risk is smaller',
          ],
          answer: 2,
          why: 'The first 5-minute bar gives a narrow range that noise breaks in both directions. Same market, same rule, one setting changed, and the result flips. That is why a setting must be chosen before testing and checked on fresh data.',
        },
        {
          kind: 'design',
          id: 'daytrading-orb-11',
          ask: 'Write a complete ORB rule set for SPY that you could hand to someone else, or to a backtest.',
          why: 'Every unwritten choice is a choice you will make differently on different days, and the backtest will test something you do not trade.',
          checklist: [
            { point: 'Range length (for example the first 15 minutes) and the bar size used for the trigger', why: 'The setting changes the results a great deal, as the figure shows.' },
            { point: 'Trigger on a close outside the range, and which side or sides you trade', why: 'A touch is not a close; wicks through levels are common.' },
            { point: 'Stop (far side or middle) and target (fixed R or a trailing rule)', why: 'These set R and the win rate together.' },
            { point: 'Filters: range width against the expected move, a gap size, no news within a window', why: 'They remove days the setup is not built for.' },
            { point: 'A cut-off time for entries and a time to be flat', why: 'A breakout at 2:30 pm is a different trade from one at 10:00.' },
            { point: 'What you do after a failed breakout: nothing, or a separately written reversal setup', why: 'Improvised re-entries are where losing days get worse.' },
            { point: 'Costs and how you will test it: past data, out-of-sample period, then paper', why: 'The rules are a hypothesis until they survive that.' },
          ],
        },
      ],
    },
    {
      id: 'daytrading-trend',
      title: 'Trend days and VWAP',
      summary: 'Recognise a trend day as it develops, buy pullbacks to VWAP by rule, and stay with the move until it is invalidated.',
      widget: 'daytrading-vwap',
      text: [
        'On a **trend day** price leaves its opening area and keeps going one way. It stays on one side of VWAP almost all day, pullbacks are shallow, and it closes near the high (or the low). From the `charts` module: **VWAP** is the volume-weighted average price since the open, `Σ(price × volume) ÷ Σ volume`, the average price paid today.',
        'You cannot know at 9:45 that it will be a trend day. You can only see evidence build up: price holding above a rising VWAP, few or no crosses of VWAP, each dip bought higher than the last, the close of each hour near its high. Labelling a day after the close is easy and misleading; the rules must only use what was visible at the time.',
        'A **VWAP pullback** setup, written as a hypothesis. Context: price has stayed above a rising VWAP since the first 30 minutes. Trigger: price pulls back to touch VWAP (or a short moving average), then a bar closes back above the previous bar\'s high. Stop: below the pullback low. Target: the day\'s high, or a trailing stop. Invalidation: a 5-minute close below VWAP. The idea is that buyers who missed the move use VWAP as a reference to buy. It fails when the trend is ending and the touch of VWAP becomes a break of it.',
        '**Staying with a trend** is the hard part. A trend gives one large winner for several small ones, so taking profit at the first wiggle removes the trade\'s point. A **trailing stop** under each new higher low locks in profit by rule while leaving room. If the stop has been trailed to above the entry, the worst case is a smaller win.',
        'Trends end, often late in the day or on news. A trend-following rule needs a written exit, and the losses on days that only looked like trends are part of its cost.',
      ],
      rules: [
        'VWAP = Σ(price × volume) ÷ Σ volume, from the open.',
        'Trend day evidence: price on one side of a sloping VWAP, few crosses, shallow pullbacks.',
        'Buy the pullback only after a trigger shows it turning; the stop goes under the pullback low.',
        'Trail the stop under higher lows; let a trend pay for the small losses.',
        'Only use what was visible at the time. Day type is known for sure only after the close.',
      ],
      questions: [
        {
          kind: 'output',
          id: 'daytrading-trend-1',
          ask: 'VWAP and the plain average of three prices. What does this print?',
          code: `prices = [10.0, 11.0, 12.0]
volumes = [100, 100, 300]
pv = sum(p * v for p, v in zip(prices, volumes))
vwap = pv / sum(volumes)
print(round(vwap, 2), round(sum(prices) / len(prices), 2))`,
          answer: '11.4 11.0',
          why: '(1000 + 1100 + 3600) ÷ 500 = 11.4. Most shares traded at 12, so VWAP leans towards 12, while the plain average ignores volume and stays at 11.',
        },
        {
          kind: 'bug',
          id: 'daytrading-trend-2',
          ask: 'This should return VWAP after every bar. The values come out far too large.',
          code: `def running_vwap(prices, volumes):
    out, pv, vol = [], 0.0, 0.0
    for p, v in zip(prices, volumes):
        pv += p * v
        vol += 1
        out.append(pv / vol)
    return out`,
          line: 5,
          fix: '        vol += v',
          why: 'VWAP divides by the total volume, not by the number of bars. Counting bars gives price × average volume, a number nowhere near any price.',
        },
        {
          kind: 'number',
          id: 'daytrading-trend-3',
          ask: 'You bought at 501.00 with the stop at 500.00 (1R = $1.00 per share). Price has trended up and you have trailed the stop to 502.50, under the latest higher low. If the stop is hit now, what is the result in R?',
          answer: 1.5,
          check: '(502.5 - 501.0) / (501.0 - 500.0)',
          why: '502.50 − 501.00 = 1.50, and 1.50 ÷ 1.00 = 1.5R. Once the stop is above the entry, the trade cannot lose (apart from slippage and gaps), and the rest of the trend is free to run.',
        },
        {
          kind: 'choice',
          id: 'daytrading-trend-4',
          ask: 'By 11:00 price has crossed VWAP eight times and VWAP is flat. Your VWAP pullback setup needs a trend day. What do you do?',
          options: [
            'Take the next touch of VWAP as a long entry',
            'Nothing: the context the setup requires is not there, so the setup is off for now',
            'Take both sides, long and short, at every cross',
            'Widen the stop so the crosses do not hit it',
          ],
          answer: 1,
          why: 'Context comes first. Many crosses of a flat VWAP are what a range day looks like, and buying touches of VWAP on such a day is buying the middle of a range.',
        },
        {
          kind: 'number',
          id: 'daytrading-trend-5',
          ask: 'The day\'s range so far is 500.00 to 510.00 and the last price is 509.00. Where does it sit within the range? Give a percentage, for example 25%.',
          answer: 0.9,
          tol: 0.005,
          check: '(509 - 500) / (510 - 500)',
          why: '(509 − 500) ÷ (510 − 500) = 90%. Trend days tend to close near one end of their range; a close near the middle is more typical of a range day.',
        },
        {
          kind: 'choice',
          id: 'daytrading-trend-6',
          ask: 'Ten closing prices (yellow) and VWAP (blue) on a trend day, bars numbered 1 to 10. Your trigger is: after a close at or below VWAP, buy the first close above the previous close. On which bar do you enter?',
          chart: {
            title: 'A pullback to VWAP',
            x: 'bar',
            y: 'price',
            series: [
              { name: 'close', points: [500.2, 500.8, 501.5, 501.9, 501.6, 501.2, 501.0, 501.4, 502.0, 502.6], color: 'accent' },
              { name: 'VWAP', points: [500.1, 500.3, 500.6, 500.9, 501.0, 501.05, 501.05, 501.1, 501.2, 501.35], color: 'blue' },
            ],
          },
          options: ['Bar 3, the strongest bar', 'Bar 5, as soon as price starts falling towards VWAP', 'Bar 8, the first close up after the close at VWAP', 'Bar 10, once a new high confirms it'],
          answer: 2,
          why: 'Bar 7 closes at 501.00, below VWAP at 501.05. Bar 8 closes at 501.40, above bar 7: that is the trigger. Bar 5 is buying while it still falls; bar 10 gives away most of the move and puts the stop far away.',
        },
        {
          kind: 'write',
          id: 'daytrading-trend-7',
          ask: 'Write `vwap_crosses(closes, vwaps)`: how many times the close changes side of VWAP from one bar to the next. A bar counts as above when its close is greater than its VWAP.',
          starter: `def vwap_crosses(closes, vwaps):
    # closes and vwaps have the same length, one value per bar
    pass`,
          solution: `def vwap_crosses(closes, vwaps):
    above = [c > v for c, v in zip(closes, vwaps)]
    return sum(1 for a, b in zip(above, above[1:]) if a != b)`,
          tests: `out = vwap_crosses([1, 2, 3], [0, 0, 0])
assert out is not None, "the function returns nothing yet"
assert out == 0, f"always above VWAP is 0 crosses, got {out}"
assert vwap_crosses([1, -1, 1, -1], [0, 0, 0, 0]) == 3, "above, below, above, below is 3 crosses"
assert vwap_crosses([5, 5, 4, 6], [4, 6, 5, 5]) == 2, "compare each close with its own bar's VWAP"
assert vwap_crosses([3], [2]) == 0, "one bar cannot cross"`,
          hint: 'Make a list of True or False for "above", then count neighbours that differ.',
          why: 'The count of crosses is a simple, rule-based way to measure what "choppy" means. Few crosses fit a trend day, many fit a range day, and both can be computed from what you saw so far.',
        },
        {
          kind: 'choice',
          id: 'daytrading-trend-8',
          ask: 'In the figure, set the time to 10:10 and switch between the two days. Then set it to 12:00 and switch again. What do you see?',
          options: [
            'The trend day is obvious from the first bars',
            'At 10:10 the two days are identical; by 12:00 the range day has crossed VWAP several times while the trend day has stayed above it',
            'The range day crosses VWAP less often than the trend day',
            'Both days look the same all day',
          ],
          answer: 1,
          why: 'The two days share their first 40 minutes, as real days often look alike early. By noon the trend day has 1 cross and the range day 5. Day type is evidence that builds up, not something you know at the open.',
        },
        {
          kind: 'choice',
          id: 'daytrading-trend-9',
          ask: 'You are long on a trend day and up 2R. Your exit rule is a 5-minute close below VWAP. A bar closes 0.05 below VWAP. What do you do?',
          options: [
            'Exit, as the rule says',
            'Wait: 0.05 is too small to count',
            'Wait for one more bar to be sure',
            'Move the rule to a close below the day\'s low',
          ],
          answer: 0,
          why: 'A rule with exceptions decided on the spot is not a rule. If 0.05 is too small to count, write a buffer into the rule and test it; do not invent it while holding the position.',
        },
        {
          kind: 'design',
          id: 'daytrading-trend-10',
          ask: 'Write the rules for a VWAP pullback long, complete enough to test.',
          why: 'A trend setup lives or dies on its context filter and its exit, so those need the most care.',
          checklist: [
            { point: 'Context: price above a rising VWAP for a stated time, with at most a stated number of crosses', why: 'This is the trend-day filter, using only what is visible so far.' },
            { point: 'What counts as the pullback: a touch of VWAP or of a stated moving average', why: 'It defines which dips are entries.' },
            { point: 'The trigger: a close above the previous bar\'s high after the touch', why: 'It waits for evidence of the turn instead of guessing it.' },
            { point: 'Stop under the pullback low, and the dollar risk it implies', why: 'The stop must be beyond the level the idea depends on.' },
            { point: 'Target or trailing rule, written precisely', why: 'How you exit winners decides most of a trend setup\'s result.' },
            { point: 'Invalidation (a close below VWAP) and a last entry time', why: 'Trends end, and late entries have little day left.' },
            { point: 'What would show the hypothesis is wrong in a test: for example, pullbacks that break VWAP as often as they hold', why: 'A test only teaches you something if you said beforehand what failure looks like.' },
          ],
        },
      ],
    },
    {
      id: 'daytrading-range',
      title: 'Range days and reversals',
      summary: 'Fading the edges of a range back to VWAP, telling a range day from a trend day, and why mean reversion needs hard stops.',
      text: [
        'On a **range day** price rotates. It crosses VWAP again and again, VWAP itself is flat, highs and lows fail near earlier levels, and the close is somewhere in the middle. Most days are not strong trend days, which is why fading extremes appeals to many traders.',
        'A **mean reversion** setup, as a hypothesis: on a day that already looks like a range, a move far from VWAP tends to come back. Context: a flat VWAP and several crosses by late morning. Trigger: price pokes outside a band (for example 2 standard deviations from VWAP, or yesterday\'s high) and then a bar closes back inside. Entry against the move. Stop beyond the extreme. Target: VWAP. Invalidation: a close outside the band again.',
        'The trigger matters. Fading the first touch of a band with no sign of a turn is "catching a falling knife": on a trend day the band is touched and then left behind. Waiting for a close back inside costs a little price and avoids many of those.',
        'Mean reversion has a typical shape: a high win rate, wins smaller than the stop, and a rare large loss when a range day turns into a trend day. Its expectancy is very sensitive to that rare loss, so the stop must be hard, placed in the market and never widened. One loss of 3R on a setup that wins 0.8R needs four wins to repair.',
        'Telling the two kinds of day apart is the core skill, and you only ever have evidence, never certainty: count VWAP crosses, look at VWAP\'s slope, how much of the expected move has been used, and whether the edges are holding. When it is unclear, the rule can be to do nothing.',
      ],
      rules: [
        'Range day evidence: flat VWAP, many crosses, edges holding, close in the middle.',
        'Fade only after a trigger shows the move turning, never on the first touch.',
        'Stop beyond the extreme, target VWAP; the stop is hard and never widened.',
        'High win rate, small wins: one large loss can erase many trades. Check expectancy with it included.',
        '"Unclear" is an answer. On unclear days the rule can be to stay out.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'daytrading-range-1',
          ask: 'A fade on a range day: short at 505.00, stop at 505.80, target VWAP at 503.40. What is the R multiple of the target?',
          answer: 2,
          check: '(505.0 - 503.4) / (505.8 - 505.0)',
          why: 'Reward is 1.60, risk is 0.80, so 2R. A fade near the edge of a range can offer a good ratio because the stop is close to the extreme.',
        },
        {
          kind: 'number',
          id: 'daytrading-range-2',
          ask: 'A fade setup wins 65% of the time, with an average win of 0.8R and an average loss of 1R. What is its expectancy in R per trade?',
          answer: 0.17,
          check: '0.65 * 0.8 - 0.35 * 1',
          why: '0.65 × 0.8 = 0.52 and 0.35 × 1 = 0.35, so 0.17R. Positive, but most of it comes from the high win rate.',
        },
        {
          kind: 'number',
          id: 'daytrading-range-3',
          ask: 'Now include the trend days: 65% of trades win 0.8R, 30% lose 1R, and 5% are trend days where price gaps through the stop and you lose 3R. What is the expectancy in R per trade?',
          answer: 0.07,
          check: '0.65 * 0.8 - 0.30 * 1 - 0.05 * 3',
          why: '0.52 − 0.30 − 0.15 = 0.07R. One trade in twenty took most of the edge. A small cost per trade on top would make it negative.',
        },
        {
          kind: 'number',
          id: 'daytrading-range-4',
          ask: 'With wins of 0.8R, how many winning trades does it take to make back one 3R loss? Give the exact number, to 2 decimal places.',
          answer: 3.75,
          check: '3 / 0.8',
          why: '3 ÷ 0.8 = 3.75, so four wins in practice. That is why a fade stop that is widened "this once" is so expensive.',
        },
        {
          kind: 'output',
          id: 'daytrading-range-5',
          ask: 'How far price is from VWAP, in standard deviations. What does this print?',
          code: `price, vwap, sd = 506.0, 503.0, 1.5
z = (price - vwap) / sd
print(z, "fade zone" if abs(z) >= 2 else "inside")`,
          answer: '2.0 fade zone',
          why: '(506 − 503) ÷ 1.5 = 2.0, which meets the 2-band. Being in the zone is only the context; the trade still needs its trigger, a close back inside.',
        },
        {
          kind: 'bug',
          id: 'daytrading-range-6',
          ask: 'This should signal a short when the last bar poked above the upper band and this bar closed back inside. It signals while price is still running higher.',
          code: `def fade_short(prev_high, close, upper):
    # the last bar poked above the band; this bar closed back below it
    poked = prev_high > upper
    back_inside = close > upper
    return poked and back_inside`,
          line: 4,
          fix: '    back_inside = close < upper',
          why: 'Back inside means a close below the upper band. As written it shorts when price closes above the band again, which is a breakout, the exact case where fades take their large losses.',
        },
        {
          kind: 'choice',
          id: 'daytrading-range-7',
          ask: 'At 11:30 VWAP is flat, price has crossed it six times, and two pushes to yesterday\'s high have failed. What kind of day is the evidence pointing to?',
          options: ['A trend day up', 'A range day', 'A trend day down', 'There is no way to say anything'],
          answer: 1,
          why: 'A flat VWAP, many crosses and a level that keeps holding are what a range day looks like so far. It is evidence, not proof: the afternoon can still break out, which is why the fade needs its stop.',
        },
        {
          kind: 'choice',
          id: 'daytrading-range-8',
          ask: 'You bought the first touch of the lower band (dashed line). Price kept falling. Which part of the setup was missing?',
          chart: {
            title: 'Buying the first touch',
            x: '5-minute bars',
            y: 'price',
            series: [
              { name: 'price', points: [503.0, 502.6, 502.0, 501.5, 501.0, 500.4, 499.9, 499.2, 498.8, 498.1], color: 'accent' },
              { name: 'lower band', points: [501.5, 501.4, 501.3, 501.2, 501.0, 500.8, 500.6, 500.4, 500.2, 500.0], color: 'muted' },
            ],
          },
          options: [
            'A tighter target',
            'A trigger: a close back inside the band showing the move had turned, plus a stop beyond the extreme',
            'A larger position to average the price down',
            'Nothing: this happens and you hold until it comes back',
          ],
          answer: 1,
          why: 'Price closed further outside the band bar after bar: it never turned, and a trend down leaves the band behind. The trigger keeps you out of most of these; the stop limits the rest.',
        },
        {
          kind: 'write',
          id: 'daytrading-range-9',
          ask: 'Write `classify_day(closes, vwaps)`. Return `"range"` if the close has changed side of VWAP at least 4 times, otherwise `"trend"` if at least 85% of closes are on one side of VWAP (above, or not above), otherwise `"unclear"`.',
          starter: `def classify_day(closes, vwaps):
    # a close is "above" when it is greater than that bar's VWAP
    return "unclear"`,
          solution: `def classify_day(closes, vwaps):
    above = [c > v for c, v in zip(closes, vwaps)]
    crosses = sum(1 for a, b in zip(above, above[1:]) if a != b)
    if crosses >= 4:
        return "range"
    share = sum(above) / len(above)
    if share >= 0.85 or share <= 0.15:
        return "trend"
    return "unclear"`,
          tests: `out = classify_day([2] * 10, [1] * 10)
assert out is not None, "the function returns nothing yet"
assert out == "trend", f"ten closes above VWAP is a trend so far, got {out}"
assert classify_day([0] * 10, [1] * 10) == "trend", "ten closes below VWAP is a trend down"
assert classify_day([2, 0, 2, 0, 2, 2, 2, 2], [1] * 8) == "range", "four crosses make it a range"
assert classify_day([2, 2, 2, 2, 2, 0, 0, 0, 0, 0], [1] * 10) == "unclear", "one cross and half the bars on each side is unclear"`,
          hint: 'Count the crosses first. Then the share of closes above VWAP: near 1 or near 0 both mean one side.',
          why: 'The order matters: the cross count catches choppy days first. "Unclear" is a real answer and the most common one early in the day; a rule set should say what to do with it, usually nothing.',
        },
        {
          kind: 'design',
          id: 'daytrading-range-10',
          ask: 'Review this losing day: you faded three pushes to new highs, lost 1R, 1R and then 2.5R when the last stop was moved, and the day closed at its high.',
          why: 'A review looks for which rule failed or was broken, and changes one thing. It does not conclude that the setup is broken from one day.',
          checklist: [
            { point: 'Was the context there? Count the VWAP crosses and the VWAP slope at each entry', why: 'Fading on a trend day is the setup\'s known failure; the filter should have kept you out.' },
            { point: 'Did each entry have its trigger, a close back inside?', why: 'Fading without a trigger is the most common way this setup loses.' },
            { point: 'The moved stop: a rule break, and its cost (1.5R extra)', why: 'Separate the cost of the setup from the cost of breaking its rules.' },
            { point: 'A rule to stop fading after two failed fades in one direction', why: 'Repeated failures at the edge are themselves evidence of a trend.' },
            { point: 'Whether the daily loss limit should have stopped the third trade', why: 'Limits exist for days exactly like this.' },
            { point: 'Record it and change at most one rule, then test the change', why: 'Changing several things at once means you never learn which one mattered.' },
          ],
        },
        {
          kind: 'choice',
          id: 'daytrading-range-11',
          ask: 'Why must the stop on a mean reversion trade be placed in the market and never widened?',
          options: [
            'Because brokers require it',
            'Because the setup lives on many small wins, and the occasional trend day that runs through a wide or missing stop can erase dozens of them',
            'Because stops make the win rate higher',
            'It does not matter on range days',
          ],
          answer: 1,
          why: 'The asymmetry is the risk: small wins, rare big losses. A hard stop caps the big loss at about 1R; without it, the tail decides the result.',
        },
      ],
    },
    {
      id: 'daytrading-option',
      title: 'Choosing the option for a day trade',
      summary: 'Delta, days to expiry, spread and liquidity, and when a vertical beats a single option for an intraday move.',
      widget: 'daytrading-choose',
      text: [
        'The setup is a view on the underlying: SPY will move from here to there before a time. The option is the vehicle that carries the view, and choosing it is a separate decision with its own costs. Four choices matter: delta, days to expiry, the spread, and single option or vertical.',
        '**Delta** (from the `pricing` module) is roughly how many dollars the option moves per $1 in the stock. A 0.50 delta call gains about $50 per contract on a $1 rise. Higher delta behaves more like the stock and costs more; low delta is cheap and needs a large, fast move, and loses most of its value when the move does not come.',
        '**Days to expiry.** A same-day (**0DTE**) option has the most gamma: its delta changes fastest, so it gains most on a big quick move. It also has the most decay per hour. An option a week out decays more slowly per hour and bends less. For a small move held for an hour, the week-out option can make as much as the 0DTE with less decay; the 0DTE pays more only when the move is large and fast. At the time of writing (2026) SPX has expiries every weekday, as do SPY and QQQ; check your broker\'s chain.',
        '**The spread is a cost you pay on every trade.** Buy at the ask and sell at the bid and you lose the full spread even if nothing moves: on a 1.95 / 2.05 quote that is $10 per contract, 5% of the price. On cheap, far out-of-the-money options the same cents are a much larger share. Use liquid strikes with high volume and open interest, and limit orders.',
        'A **debit vertical** (from the `strategies` module) buys one option and sells a further one. It costs less, decays less, and is less exposed to implied volatility, but caps the profit and has two spreads to cross. To plan a trade, convert the stop and target on the underlying into option prices with delta: option stop ≈ option price − delta × distance to the stop. This ignores gamma, decay and changes in implied volatility, so treat it as an estimate.',
      ],
      rules: [
        'P&L per contract ≈ delta × stock move × 100, for small moves held briefly.',
        'Round-trip spread cost per contract = (ask − bid) × 100. Compare it with your expected gain.',
        '0DTE: most gamma, most decay per hour. A week out: less of both.',
        'Debit vertical: cheaper and steadier, profit capped at width − debit.',
        'Option stop ≈ option price − delta × distance to the underlying stop. An estimate only.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'daytrading-option-1',
          ask: 'You hold one call with a delta of 0.50. The stock rises $1.20 within a few minutes. About how much is the P&L per contract, in dollars?',
          answer: 60,
          check: '0.50 * 1.20 * 100',
          why: '0.50 × 1.20 = 0.60 per share, times 100 shares per contract = $60. Over a few minutes, delta does most of the work; over hours, decay and gamma also count.',
        },
        {
          kind: 'number',
          id: 'daytrading-option-2',
          ask: 'An option is bid 1.95 and asked 2.05. You buy at the ask and later sell at the bid, and the mid price has not changed. What did the round trip cost per contract, in dollars?',
          answer: 10,
          check: '(2.05 - 1.95) * 100',
          why: 'You pay 2.05 and receive 1.95: 0.10 per share, $10 per contract. Every trade starts this far behind, before any fee.',
        },
        {
          kind: 'number',
          id: 'daytrading-option-3',
          ask: 'A cheap out-of-the-money option is bid 0.40 and asked 0.50. As a share of the mid price, what does a round trip at the ask and then the bid cost? Give a percentage, for example 25%.',
          answer: 0.2222,
          tol: 0.005,
          check: '(0.50 - 0.40) / 0.45',
          why: '0.10 ÷ 0.45 ≈ 22%. The same ten cents that is 5% of a $2 option is 22% of a $0.45 one. Cheap options are expensive to trade.',
        },
        {
          kind: 'number',
          id: 'daytrading-option-4',
          ask: 'You buy a call at 3.00 with a delta of 0.60. Your stop on the stock is $1.50 below where you entered. Using delta alone, about what will the call be worth at the stop?',
          answer: 2.1,
          check: '3.00 - 0.60 * 1.50',
          why: '0.60 × 1.50 = 0.90, so about 2.10. In fact delta falls as the stock falls (gamma), and time passes, so the real price may differ. That is why it is an estimate, and why you watch the stock level for the stop.',
        },
        {
          kind: 'output',
          id: 'daytrading-option-5',
          ask: 'An at-the-money call on a $500 stock at 15% implied volatility, with 1 and with 5 trading days left. What does this print?',
          code: `import math

def call(S, K, days, iv):
    t = days / 252
    sd = iv * math.sqrt(t)
    d1 = math.log(S / K) / sd + sd / 2
    N = lambda x: 0.5 * (1 + math.erf(x / math.sqrt(2)))
    return S * N(d1) - K * N(d1 - sd)

print(round(call(500, 500, 1, 0.15), 2), round(call(500, 500, 5, 0.15), 2))`,
          answer: '1.88 4.21',
          why: 'At the money, the price grows with the square root of time, so five times the time costs about √5 ≈ 2.2 times as much. Per day of time bought, the short-dated option is the expensive one.',
        },
        {
          kind: 'choice',
          id: 'daytrading-option-6',
          ask: 'Your setup targets a $1 move in SPY within about an hour, with a stop $0.50 away. Which is the fairest comparison of a 0DTE and a week-out at-the-money call?',
          options: [
            '0DTE is always better for day trading because it moves faster',
            'For a small move over an hour the week-out call makes about as much with less decay; the 0DTE only pays more on a larger, faster move, and loses more if the move does not come',
            'The week-out call cannot be traded intraday',
            'They behave identically because both have a delta near 0.50',
          ],
          answer: 1,
          why: 'Same delta at entry, different gamma and decay. The 0DTE bends more: more gain on a big move, more decay on no move. The right choice depends on the size and speed of the move you expect.',
        },
        {
          kind: 'number',
          id: 'daytrading-option-7',
          ask: 'A 500/505 bull call spread costs 2.20. What is its maximum profit per contract at expiry, in dollars?',
          answer: 280,
          check: '(5 - 2.20) * 100',
          why: 'The most the spread can be worth is the strike width, 5.00. Profit is 5.00 − 2.20 = 2.80 per share, $280 per contract. The most you can lose is the 2.20 you paid.',
        },
        {
          kind: 'choice',
          id: 'daytrading-option-8',
          ask: 'Compared with buying the 500 call alone, what does buying the 500/505 call spread change?',
          options: [
            'It removes all risk',
            'It costs less and decays less per hour, but profit is capped above 505 and there are two bid-ask spreads to pay',
            'It increases delta',
            'It makes the trade cash-settled',
          ],
          answer: 1,
          why: 'The short call pays for part of the long one and offsets part of its decay and volatility exposure. The price is a cap on the gain and an extra leg to fill.',
        },
        {
          kind: 'bug',
          id: 'daytrading-option-9',
          ask: 'This should say how many option contracts move about as much as a number of shares. It gives an answer 100 times too large.',
          code: `def contracts_for_shares(shares, delta):
    # one contract moves about delta x 100 shares
    per_contract = delta
    return round(shares / per_contract)`,
          line: 3,
          fix: '    per_contract = delta * 100',
          why: 'Each contract is on 100 shares, so a 0.50 delta contract moves like 50 shares. Forgetting the 100 is a sizing error that could put on a hundred times the intended position.',
        },
        {
          kind: 'choice',
          id: 'daytrading-option-10',
          ask: 'In the figure, set the strike to the stock price (0), minutes held to 30 and the stock move to +$1. Compare the three expiries. Then set the move to 0.',
          options: [
            'The 0DTE makes the most on +$1 and loses the least on no move',
            'On +$1 the week-out call makes slightly more (about $49 against $46), and on no move the 0DTE loses the most (about $10 against $3)',
            'All three give the same P&L in both cases',
            'The week-out call loses money on +$1 because of decay',
          ],
          answer: 1,
          why: 'Over 30 minutes the 0DTE\'s faster decay costs more than its extra gamma adds on a $1 move. Try +$3: then the 0DTE makes the most. The option should match the size and speed of the move you plan for.',
        },
        {
          kind: 'design',
          id: 'daytrading-option-11',
          ask: 'Your ORB setup says long SPY above 502.40, stop 501.60, target 504.00, out by 11:30. Choose the option for it and say why.',
          why: 'The same view can be carried by many options with very different results. The choice should follow from the setup, not from what is cheap.',
          checklist: [
            { point: 'An expiry that matches the holding time and the size of the move, with the 0DTE trade-off stated', why: 'More gamma helps on a fast large move and hurts on a slow small one.' },
            { point: 'A delta (for example around 0.50) and the strike that gives it', why: 'It sets how much the option moves per dollar and how much decay you carry.' },
            { point: 'The spread and volume at that strike, and a maximum spread you accept', why: 'The round-trip cost has to be small next to the expected gain.' },
            { point: 'Option stop and target estimated with delta, and the R they imply', why: 'Sizing needs the option\'s risk per contract, not the stock\'s.' },
            { point: 'Single call or debit vertical, and why', why: 'The vertical trades upside for less decay and lower cost.' },
            { point: 'Number of contracts from the dollar risk, and a limit order', why: 'Market orders on options pay the whole spread and sometimes more.' },
          ],
        },
      ],
    },
    {
      id: 'daytrading-manage',
      title: 'Managing the trade, and 0DTE in particular',
      summary: 'Scaling out, moving stops by rule, time stops, and what decay, gamma and expiry do to same-day options in the last hours.',
      widget: 'daytrading-0dte',
      text: [
        'Management is part of the setup and is written before entry. **Scaling out**: sell part at a first target (for example half at 1R) and move the stop on the rest to the entry. It smooths results but changes the setup\'s expectancy, so test it as written. **Moving the stop**: only towards the trade, only by rule (under each higher low, to breakeven at 1R). Never further away. **Time stop**: if the trade has not worked within a set time, close it; on options, waiting costs decay.',
        'Same-day options magnify everything. An at-the-money option\'s time value shrinks roughly with the square root of the time left, so the last hours lose the most per hour: with a quarter of the time left it is worth about half. **Gamma** grows as expiry nears: on a $500 stock at 15% implied volatility with 15 minutes left, a $1 rise takes a call from $1 out of the money to at the money and its delta from about 0.14 to 0.50. A bought 0DTE option can go to zero in hours. A sold one can lose many times the premium collected within minutes.',
        'Expiry has mechanics, from the `options` module. At the time of writing (2026), SPY options settle in shares: an in-the-money call left open becomes 100 shares per contract, and holders may exercise after the 4:00 pm close (the usual cut-off is 5:30 pm Eastern, often earlier at your broker), so a short option that closed slightly out of the money can still be assigned if the stock moves after hours. Same-day SPX options (the SPXW series) are cash-settled at the closing value and stop trading at 4:00 pm on expiry; the standard monthly SPX contracts settle on opening prices instead. Check the current rules with your broker.',
        'So: never hold a short option into the close by accident. Have a written time by which you are flat (many traders use 3:45 pm or earlier), and do not sell options without a defined-risk structure. Studies of retail 0DTE trading on SPX (for example Beckmeyer, Branger and Gayda, on 2021 to 2023 data) found that retail traders lost money in aggregate, much of it to transaction costs. That is not a law, but it is the base rate you start from.',
        'If you trade 0DTE at all: paper trade it first, then the smallest size, defined risk only, a premium stop you accept losing in full, and a hard daily loss limit.',
      ],
      rules: [
        'Write management rules before entry: scale-out, stop moves, time stop, flat time.',
        'Stops move only towards the trade. Never widen one.',
        'ATM time value ≈ ∝ √(time left): the last hours decay fastest.',
        'Gamma explodes near expiry: delta and P&L swing in minutes.',
        'Never hold a short option into the close by accident. Know the settlement and cut-off times.',
        'A bought option can go to zero; a naked sold one can lose many times its premium.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'daytrading-manage-1',
          ask: 'An at-the-money 0DTE call is worth 1.60 with 4 hours left. The stock and implied volatility do not change. Using the square-root rule, about what is it worth with 1 hour left?',
          answer: 0.8,
          check: '1.60 * math.sqrt(1 / 4)',
          why: 'A quarter of the time left means √(1/4) = half the value: 0.80. Half the value is lost in the last quarter of the time, and the rest in the final hour.',
        },
        {
          kind: 'number',
          id: 'daytrading-manage-2',
          ask: 'You buy 2 calls at 2.00 with a premium stop at 1.00 (1R = 1.00 per share). At 3.00 you sell one and move the stop on the other to 2.00. It is then stopped out at 2.00. What is the total P&L, in dollars?',
          answer: 100,
          check: '(3.00 - 2.00) * 100 + (2.00 - 2.00) * 100',
          why: 'The first contract makes 1.00 × 100 = $100, the second breaks even. Scaling out gave a win on a trade that would have been a scratch, and capped the gain on days it runs.',
        },
        {
          kind: 'number',
          id: 'daytrading-manage-3',
          ask: 'You sold a 0DTE call for 0.50. The stock spikes and the call is now 4.00. What is the loss per contract, in dollars?',
          answer: 350,
          check: '(4.00 - 0.50) * 100',
          why: '(4.00 − 0.50) × 100 = $350, seven times the $50 collected. A naked short call has no cap at all.',
        },
        {
          kind: 'number',
          id: 'daytrading-manage-4',
          ask: 'A 0DTE SPX put spread: short the 6000 put and long the 5990 put, for a credit of 2.00. SPX settles at 5988. What is the loss per spread, in dollars (positive number)? The SPX multiplier is 100.',
          answer: 800,
          check: '((6000 - 5988) - (5990 - 5988) - 2.00) * 100',
          why: 'The short put is worth 12 and the long put 2, so the spread is worth 10, its full width. Loss = (10 − 2) × 100 = $800. Defined risk: it could not lose more, but it was four times the credit.',
        },
        {
          kind: 'choice',
          id: 'daytrading-manage-5',
          ask: 'You are short a SPY 500 call expiring today. SPY closes at 499.90, so you leave it. After hours, news lifts SPY to 501. What can happen?',
          options: [
            'Nothing: it expired out of the money at 4:00',
            'The holder can still exercise before the cut-off, and you may be assigned: short 100 shares per contract on Monday morning',
            'The exchange closes it for you at 4:00 pm',
            'You receive the premium again',
          ],
          answer: 1,
          why: 'SPY options settle in shares and exercise decisions can be made after the close, up to the cut-off. An unplanned short stock position over a weekend is exactly the accident to avoid. Close short options before the close.',
        },
        {
          kind: 'output',
          id: 'daytrading-manage-6',
          ask: 'Gamma of an at-the-money call with 30 minutes left compared with 4 hours left. What does this print?',
          code: `import math

def atm_gamma(S, iv, hours):
    sd = iv * math.sqrt(hours / 6.5 / 252)
    d1 = sd / 2
    return math.exp(-d1 * d1 / 2) / math.sqrt(2 * math.pi) / (S * sd)

print(round(atm_gamma(500, 0.15, 0.5) / atm_gamma(500, 0.15, 4), 2))`,
          answer: '2.83',
          why: 'At the money, gamma grows like 1 ÷ √(time left), and √(4 ÷ 0.5) = √8 ≈ 2.83. In the last half hour delta moves almost three times as fast per dollar as it did at noon.',
        },
        {
          kind: 'bug',
          id: 'daytrading-manage-7',
          ask: 'This should close every position from 3:45 pm on, and close a trade that has not reached 0.5R within 30 minutes. It closes every trade the moment it opens.',
          code: `def should_exit(minute, entry_minute, r_now, time_stop=30, flat_by=375):
    # minute counts from the 9:30 open; 375 is 3:45 pm
    if minute <= flat_by:
        return True
    if minute - entry_minute >= time_stop and r_now < 0.5:
        return True
    return False`,
          line: 3,
          fix: '    if minute >= flat_by:',
          why: 'The flat rule applies from 3:45 on, so the test is `minute >= flat_by`. With `<=` every minute of the day qualifies.',
        },
        {
          kind: 'write',
          id: 'daytrading-manage-8',
          ask: 'Write `exit_reason(price, stop, target, minute, entry_minute, side)` for a trade on the underlying. Check in this order and return the first that applies: `"stop"` if the stop is reached, `"target"` if the target is reached, `"flat"` if `minute >= 375` (3:45 pm), `"time"` if 30 or more minutes have passed since entry. Otherwise return `None`.',
          starter: `def exit_reason(price, stop, target, minute, entry_minute, side):
    # side is "long" or "short"; minute counts from the 9:30 open
    return None`,
          solution: `def exit_reason(price, stop, target, minute, entry_minute, side):
    if (side == "long" and price <= stop) or (side == "short" and price >= stop):
        return "stop"
    if (side == "long" and price >= target) or (side == "short" and price <= target):
        return "target"
    if minute >= 375:
        return "flat"
    if minute - entry_minute >= 30:
        return "time"
    return None`,
          tests: `assert exit_reason(502.0, 501.0, 504.0, 60, 50, "long") is None, "inside stop and target, 10 minutes in: no exit"
assert exit_reason(500.9, 501.0, 504.0, 60, 50, "long") == "stop", "a long below its stop should give 'stop'"
assert exit_reason(504.1, 501.0, 504.0, 60, 50, "long") == "target", "a long above its target should give 'target'"
assert exit_reason(502.0, 501.0, 504.0, 380, 370, "long") == "flat", "at 3:50 pm (minute 380) you should be flat"
assert exit_reason(502.0, 501.0, 504.0, 90, 50, "long") == "time", "40 minutes without stop or target should give 'time'"
assert exit_reason(505.9, 505.8, 503.4, 60, 50, "short") == "stop", "a short above its stop should give 'stop'"
assert exit_reason(503.3, 505.8, 503.4, 60, 50, "short") == "target", "a short below its target should give 'target'"
assert exit_reason(500.0, 501.0, 504.0, 400, 50, "long") == "stop", "the stop is checked first"`,
          hint: 'For a short the stop is above and the target below, so the comparisons flip.',
          why: 'Written as code, the management plan is the same on every trade. The order matters: a stop hit at 3:50 pm is a stop, and that is what the journal should say.',
        },
        {
          kind: 'choice',
          id: 'daytrading-manage-9',
          ask: 'In the figure, set implied vol to 15% and compare a strike $3 out of the money with an at-the-money strike as the hours left go from 3 to 1. Roughly how much of its value does each lose?',
          options: [
            'Both lose about the same share',
            'The out-of-the-money call loses about 86% of its value, the at-the-money one about 42%',
            'The out-of-the-money call loses less because it is cheaper',
            'Neither loses anything while the stock does not move',
          ],
          answer: 1,
          why: 'The $3 out-of-the-money call goes from about 0.31 to 0.04, the at-the-money one from about 1.28 to 0.74. Cheap 0DTE options look like small bets, but their value drains fastest in proportion.',
        },
        {
          kind: 'choice',
          id: 'daytrading-manage-10',
          ask: 'Your 0DTE call is down 40% and near your premium stop. You want to move the stop lower "to give it room". What is the problem?',
          options: [
            'None, as long as you move it back later',
            'It turns a planned 1R loss into a larger unplanned one, on an option that loses value every minute you wait',
            'It is fine because 0DTE options always bounce',
            'Only that it costs a commission',
          ],
          answer: 1,
          why: 'Stops move only towards the trade. On a 0DTE, time works against the long while you hope; the wider stop also breaks the sizing that assumed 1R.',
        },
        {
          kind: 'design',
          id: 'daytrading-manage-11',
          ask: 'You want to try 0DTE SPX trades in the last two hours of the day. Write the rules you would accept before placing the first one.',
          why: 'The last two hours are where 0DTE options are most leveraged and most fragile. Rules written beforehand are the only protection that works at 3:30 pm.',
          checklist: [
            { point: 'Paper trade first, for a stated number of trades, then the smallest live size', why: 'You learn the speed of 0DTE prices without paying for the lesson.' },
            { point: 'Defined risk only: bought options or spreads, no naked short options', why: 'A naked short 0DTE can lose many times its premium in minutes.' },
            { point: 'A dollar risk per trade you accept losing in full', why: 'A bought 0DTE can go to zero; size for that, not for the stop.' },
            { point: 'A flat-by time, for example 3:45 pm, with no exceptions', why: 'It removes expiry and settlement surprises.' },
            { point: 'A daily loss limit and a maximum number of trades', why: 'Fast instruments invite fast, repeated, emotional trades.' },
            { point: 'The spread you will accept and limit orders only', why: 'Spreads on fast options can be a large share of the price.' },
            { point: 'A written setup with a test plan, and a journal of every trade', why: 'Without records, you cannot tell skill from luck, and the base rate for retail 0DTE traders is losing.' },
          ],
        },
        {
          kind: 'choice',
          id: 'daytrading-manage-12',
          ask: 'Why does an at-the-money option lose more value between 3:00 and 4:00 pm on its expiry day than between 10:00 and 11:00 am, if nothing moves?',
          options: [
            'Because volume is higher in the afternoon',
            'Because time value shrinks roughly with the square root of the time left, which falls fastest at the end',
            'Because market makers lower prices in the afternoon',
            'It does not: decay is the same every hour',
          ],
          answer: 1,
          why: 'With 6 hours left √6 ≈ 2.45 and with 5 hours √5 ≈ 2.24, a small drop. From 1 hour to 0, √1 = 1 goes to 0: the whole remaining time value goes in the last hour.',
        },
      ],
    },
    {
      id: 'daytrading-lab',
      title: 'Lab: a day trade planner',
      summary: 'From account, levels and an option quote to contracts, stop, target, R and a go or no-go.',
      text: [
        'This lab builds the calculator you would run before every trade. It takes the account size, the day\'s P&L, the setup\'s levels on the underlying and the option\'s quote and delta, and returns how many contracts to buy, where the option stop and target are, the trade\'s R multiple, and whether the trade passes your rules.',
        'The steps follow the order of a real decision: how much may I lose (the risk budget, capped by what is left of the daily limit), where does the option stand at my stop and target (estimated with delta), how many contracts does that allow, and does the trade clear my minimum R and maximum spread.',
        'The estimates use delta alone. They ignore gamma, decay, changes in implied volatility, slippage and gaps through the stop. A planner like this makes your decisions consistent; it does not make them right. Whether a setup has an edge is a question for the `backtest` module.',
      ],
      rules: [
        'Risk budget = the smaller of account × risk % and what is left of the daily limit.',
        'Option stop and target ≈ option price ∓ |delta| × distance on the underlying.',
        'Contracts = risk budget ÷ (risk per contract), rounded down. Zero means no trade.',
        'Go only if contracts ≥ 1, R ≥ your minimum and the spread is within your limit.',
        'The planner is consistent, not clever: its numbers are estimates, so test the setup separately.',
      ],
      questions: [
        {
          kind: 'write',
          id: 'daytrading-lab-1',
          ask: 'Step 1: the risk budget. Return the dollars you may risk on the next trade: the smaller of `account × risk_pct` and what is left of the daily loss limit (`daily_limit + day_pnl`, where `day_pnl` is negative after losses). Never less than 0.',
          starter: `def risk_budget(account, risk_pct, day_pnl, daily_limit):
    # risk_pct: 0.01 means 1%; daily_limit: positive dollars
    pass`,
          solution: `def risk_budget(account, risk_pct, day_pnl, daily_limit):
    left = daily_limit + day_pnl
    return max(0.0, min(account * risk_pct, left))`,
          tests: `out = risk_budget(25000, 0.01, 0, 500)
assert out is not None, "the function returns nothing yet"
assert abs(out - 250) < 1e-9, f"1% of 25,000 with nothing lost today is 250, got {out}"
assert abs(risk_budget(25000, 0.01, -400, 500) - 100) < 1e-9, "after losing 400 of a 500 limit, only 100 is left"
assert risk_budget(25000, 0.01, -600, 500) == 0, "past the daily limit the budget is 0, not negative"
assert abs(risk_budget(25000, 0.01, 300, 500) - 250) < 1e-9, "a winning day does not raise the risk per trade above 1%"`,
          why: 'The per-trade risk and the daily limit are two separate brakes. Taking the smaller one means the last trade of a bad day can never take you past the limit.',
        },
        {
          kind: 'write',
          id: 'daytrading-lab-2',
          ask: 'Step 2: the option price at the stop. Estimate it with delta: the option price minus `|delta|` times the distance from the entry to the stop on the underlying. Never below 0. Round to 2 decimals. It must work for calls (delta positive) and puts (delta negative).',
          starter: `def option_at(opt_price, delta, entry_under, level_under):
    # estimated option price if the underlying goes from entry_under to the stop level_under
    pass`,
          solution: `def option_at(opt_price, delta, entry_under, level_under):
    return round(max(0.0, opt_price - abs(delta) * abs(entry_under - level_under)), 2)`,
          tests: `out = option_at(3.00, 0.60, 500.0, 498.5)
assert out is not None, "the function returns nothing yet"
assert abs(out - 2.10) < 1e-9, f"3.00 - 0.60 x 1.50 = 2.10, got {out}"
assert abs(option_at(2.00, -0.50, 500.0, 501.0) - 1.50) < 1e-9, "a put with delta -0.50 and its stop $1 higher loses about 0.50"
assert option_at(0.40, 0.30, 500.0, 498.0) == 0, "an estimate below zero should be 0: an option cannot be worth less than nothing"`,
          hint: 'Both distances are positive whichever way the trade goes, so use `abs` on the delta and on the price distance.',
          why: 'For the stop the option always loses value: a call when the stock falls, a put when it rises. Using absolute values makes one function serve both, and the floor at zero reminds you a bought option can lose everything.',
        },
        {
          kind: 'write',
          id: 'daytrading-lab-3',
          ask: 'Step 3: the number of contracts. Risk per contract is `(opt_price − opt_stop) × 100`, rounded to cents. Return the whole number of contracts the budget allows, rounded down; 0 if the risk per contract is not positive.',
          starter: `def contracts(budget, opt_price, opt_stop):
    pass`,
          solution: `import math

def contracts(budget, opt_price, opt_stop):
    per = round((opt_price - opt_stop) * 100, 2)
    if per <= 0:
        return 0
    return math.floor(budget / per)`,
          tests: `out = contracts(250, 3.00, 2.10)
assert out is not None, "the function returns nothing yet"
assert out == 2, f"each contract risks 90 dollars, so 250 allows 2, got {out}"
assert isinstance(out, int), "return a whole number of contracts"
assert contracts(30, 1.10, 1.00) == 3, "30 / 10 is exactly 3 contracts: round the risk per contract to cents before dividing"
assert contracts(80, 3.00, 2.10) == 0, "a budget smaller than one contract's risk means no trade"
assert contracts(250, 2.00, 2.00) == 0, "zero risk per contract is a broken plan, not infinite contracts"`,
          hint: '`math.floor` rounds down. Without rounding the risk per contract to cents, 1.10 − 1.00 is 0.10000000000000009, and 30 divided by 10.000000000000009 rounds down to 2.',
          why: 'Rounding down keeps the risk at or below the budget. The zero cases matter most: a planner that rounds up or divides by zero will one day put on a position you never meant to.',
        },
        {
          kind: 'output',
          id: 'daytrading-lab-4',
          ask: 'Step 4: run the sizing for a put. What does this print?',
          code: `import math

budget = min(25000 * 0.01, 500 - 150)
opt_price, delta = 2.40, -0.40
opt_stop = round(opt_price - abs(delta) * abs(498.0 - 499.5), 2)
per = round((opt_price - opt_stop) * 100, 2)
print(budget, opt_stop, per, math.floor(budget / per))`,
          answer: '250.0 1.8 60.0 4',
          why: 'The budget is the smaller of 250 and the 350 left today. The put loses about 0.40 × 1.50 = 0.60 at the stop, so 60 dollars a contract, and 250 ÷ 60 = 4.17 rounds down to 4 contracts, risking 240.',
        },
        {
          kind: 'write',
          id: 'daytrading-lab-5',
          ask: 'Step 5: the target and the R multiple. Write `option_target` (the option price plus `|delta|` times the distance to the target, rounded to 2 decimals) and `r_multiple(entry, stop, target)` for option prices, rounded to 2 decimals.',
          starter: `def option_target(opt_price, delta, entry_under, target_under):
    pass

def r_multiple(entry, stop, target):
    pass`,
          solution: `def option_target(opt_price, delta, entry_under, target_under):
    return round(opt_price + abs(delta) * abs(target_under - entry_under), 2)

def r_multiple(entry, stop, target):
    return round((target - entry) / (entry - stop), 2)`,
          tests: `out = option_target(3.05, 0.50, 500.0, 502.5)
assert out is not None, "option_target returns nothing yet"
assert abs(out - 4.30) < 1e-9, f"3.05 + 0.50 x 2.50 = 4.30, got {out}"
assert abs(option_target(2.40, -0.40, 498.0, 495.5) - 3.40) < 1e-9, "a put gains when the stock falls to the target: 2.40 + 0.40 x 2.50 = 3.40"
r = r_multiple(3.05, 2.55, 4.30)
assert r is not None, "r_multiple returns nothing yet"
assert abs(r - 2.5) < 1e-9, f"reward 1.25 over risk 0.50 is 2.5, got {r}"`,
          why: 'For a long option both the stop and the target are measured on the option, below and above the entry. The R from delta alone is the same as on the stock; gamma usually makes the real upside a little larger and decay makes both sides worse over time.',
        },
        {
          kind: 'bug',
          id: 'daytrading-lab-6',
          ask: 'Step 6: dollars at risk including fees. It understates the risk when you buy several contracts.',
          code: `def dollars_at_risk(n, opt_price, opt_stop, fee_per_contract):
    # loss if stopped out, with a fee to open and another to close each contract
    move = (opt_price - opt_stop) * 100
    fees = 2 * fee_per_contract
    return n * move + fees`,
          line: 5,
          fix: '    return n * (move + fees)',
          why: 'Fees are charged per contract, so they scale with n too. With 10 contracts and a $0.65 fee each way, the bug drops $11.70 of real cost.',
        },
        {
          kind: 'write',
          id: 'daytrading-lab-7',
          ask: 'Step 7: the planner. You buy at the ask. Return a dict with `contracts`, `stop`, `target`, `r` and `reasons`, a list of the rules the trade fails, in the order `"spread"` (spread over `max_spread` of the mid), `"reward"` (r below `min_r`), `"size"` (fewer than 1 contract). `go` is True only when `reasons` is empty.',
          starter: `import math

def option_at(opt_price, delta, entry_under, level_under):
    return round(max(0.0, opt_price - abs(delta) * abs(entry_under - level_under)), 2)

def plan(account, risk_pct, day_pnl, daily_limit, bid, ask, delta, entry_under, stop_under, target_under, min_r=1.5, max_spread=0.05):
    # returns {"contracts": ..., "stop": ..., "target": ..., "r": ..., "reasons": [...], "go": ...}
    pass`,
          solution: `import math

def option_at(opt_price, delta, entry_under, level_under):
    return round(max(0.0, opt_price - abs(delta) * abs(entry_under - level_under)), 2)

def plan(account, risk_pct, day_pnl, daily_limit, bid, ask, delta, entry_under, stop_under, target_under, min_r=1.5, max_spread=0.05):
    budget = max(0.0, min(account * risk_pct, daily_limit + day_pnl))
    stop = option_at(ask, delta, entry_under, stop_under)
    target = round(ask + abs(delta) * abs(target_under - entry_under), 2)
    per = round((ask - stop) * 100, 2)
    n = math.floor(budget / per) if per > 0 else 0
    r = round((target - ask) / (ask - stop), 2) if ask > stop else 0.0
    reasons = []
    if (ask - bid) / ((ask + bid) / 2) > max_spread:
        reasons.append("spread")
    if r < min_r:
        reasons.append("reward")
    if n < 1:
        reasons.append("size")
    return {"contracts": n, "stop": stop, "target": target, "r": r, "reasons": reasons, "go": not reasons}`,
          tests: `p = plan(25000, 0.01, -100, 500, 2.95, 3.05, 0.50, 500.0, 499.0, 502.5)
assert p is not None, "the function returns nothing yet"
assert p["stop"] == 2.55 and p["target"] == 4.30, f"from the ask of 3.05: stop 2.55 and target 4.30, got {p['stop']} and {p['target']}"
assert p["contracts"] == 5, f"250 budget over 50 dollars a contract is 5, got {p['contracts']}"
assert p["r"] == 2.5 and p["reasons"] == [] and p["go"] is True, f"a 2.5R trade with a 3% spread should be a go, got {p}"
p = plan(25000, 0.01, -100, 500, 0.40, 0.50, 0.30, 500.0, 499.0, 502.5)
assert p["reasons"][0] == "spread", f"a 0.10 spread on a 0.45 mid fails the spread rule first, got {p['reasons']}"
p = plan(25000, 0.01, -100, 500, 2.95, 3.05, 0.50, 500.0, 499.0, 500.5)
assert p["reasons"] == ["reward"] and p["go"] is False, f"a target 0.50 away for a 1.00 stop is 0.5R and fails min_r, got {p['reasons']}"
p = plan(25000, 0.01, -480, 500, 2.95, 3.05, 0.50, 500.0, 499.0, 502.5)
assert p["contracts"] == 0 and p["reasons"] == ["size"], f"with 20 dollars of the daily limit left no contract fits, got {p}"`,
          hint: 'Reuse the earlier steps in order: budget, stop and target from the ask, contracts, R, then the three checks.',
          why: 'Every number in the plan is computed the same way on every trade, and the reasons tell you why a trade was refused. A no-go is a result, not a failure of the tool.',
        },
        {
          kind: 'output',
          id: 'daytrading-lab-8',
          ask: 'Step 8: a plan late in a losing day, with the `plan` function from step 7. What does this print?',
          code: `import math

def option_at(opt_price, delta, entry_under, level_under):
    return round(max(0.0, opt_price - abs(delta) * abs(entry_under - level_under)), 2)

def plan(account, risk_pct, day_pnl, daily_limit, bid, ask, delta, entry_under, stop_under, target_under, min_r=1.5, max_spread=0.05):
    budget = max(0.0, min(account * risk_pct, daily_limit + day_pnl))
    stop = option_at(ask, delta, entry_under, stop_under)
    target = round(ask + abs(delta) * abs(target_under - entry_under), 2)
    per = round((ask - stop) * 100, 2)
    n = math.floor(budget / per) if per > 0 else 0
    r = round((target - ask) / (ask - stop), 2) if ask > stop else 0.0
    reasons = []
    if (ask - bid) / ((ask + bid) / 2) > max_spread:
        reasons.append("spread")
    if r < min_r:
        reasons.append("reward")
    if n < 1:
        reasons.append("size")
    return {"contracts": n, "stop": stop, "target": target, "r": r, "reasons": reasons, "go": not reasons}

p = plan(10000, 0.01, -260, 300, 1.48, 1.52, 0.45, 600.0, 599.0, 602.0)
print(p["contracts"], p["r"], p["go"], p["reasons"])`,
          answer: "0 2.0 False ['size']",
          why: 'Only 300 − 260 = 40 dollars of the daily limit is left, less than the 45 dollars one contract risks (0.45 × 1.00 × 100). The trade itself is fine at 2R; the day is not. The planner enforces the limit for you.',
        },
        {
          kind: 'design',
          id: 'daytrading-lab-9',
          ask: 'Step 9: the planner says go. List what it does not know, and how you would find out whether trades it approves actually make money.',
          why: 'A tool that produces precise numbers invites more trust than its inputs deserve. Knowing its blind spots tells you what to check and what to test.',
          checklist: [
            { point: 'Gamma and decay: the option at the stop and target will differ from the delta estimate, more so for 0DTE and longer holds', why: 'The real R can be quite different from the planned one.' },
            { point: 'Implied volatility can change, especially around news', why: 'A right call on direction can still lose if IV falls.' },
            { point: 'Slippage and gaps: a stop is not a guaranteed price, and fills can be worse than the quote', why: 'The loss can exceed the budget on fast moves.' },
            { point: 'Fees, which step 6 adds and the plan leaves out', why: 'They reduce every result and matter most on small trades.' },
            { point: 'Whether the setup has an edge at all: the planner only sizes it', why: 'Correct sizing of a losing setup loses money slowly and steadily.' },
            { point: 'The test: backtest the signal on the underlying with costs, check out-of-sample, then paper trade with this planner and journal every trade', why: 'That is the order in which the next module turns an idea into evidence.' },
          ],
        },
      ],
    },
  ],
}
