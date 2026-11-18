import type { Block } from '../../types'

/** The full theory for each lesson of the intraday playbook module, keyed by lesson id. */
export const daytradingTheory: Record<string, Block[]> = {
  'daytrading-prep': [
    { h: 'Why the work starts before the open' },
    'A **trading session** is the period when an exchange is open for normal trading. For US shares and options it runs from 9:30 am to 4:00 pm Eastern time. Everything in this module happens inside that window, but many of the best decisions are made before it starts.',
    'Before 9:30 you hold no position, so nothing on the screen can frighten or excite you. That is the moment to decide what you will trade, where, and when you will not trade at all. Preparation is a short routine, the same every morning, that ends in a one-page written plan. During the session your job is then to follow the plan, not to invent one.',

    { h: 'The economic calendar' },
    'An **economic calendar** lists the scheduled releases of government statistics and central bank decisions, with their dates and times. These releases move the whole market at once, so they matter even if you only trade one ticker.',
    { sub: 'Releases that move the whole market' },
    'At the time of writing (2026) three kinds stand out for US traders. The **consumer price index** (CPI), the main measure of inflation, comes out at 8:30 am Eastern, about once a month. The **jobs report** (the employment situation, with the count of new jobs called nonfarm payrolls) also comes out at 8:30 am, often but not always on the first Friday of the month. On the days when the **Federal Reserve** committee that sets interest rates (the FOMC) meets, its statement comes out at 2:00 pm Eastern, followed by a press conference at 2:30 pm. Dates and times do change, so read them each morning from an official calendar (the Bureau of Labor Statistics, the Federal Reserve) or your broker, not from memory.',
    'Two things follow from a known release. Option prices usually rise into it, because the market expects a bigger move, so options bought right before news are dear. And an 8:30 release lands before the stock market opens: index futures react at once, and the stock market opens already moved.',
    { sub: 'Earnings and single stocks' },
    'A company reports its results (its **earnings**) a few times a year, usually before the open or after the close. A stock can move many times its normal daily range on that news. If a name on your list reports today or tonight, it behaves differently from other days.',

    { h: 'The overnight move and the gap' },
    'Index futures and many shares trade before 9:30, in what is called the **premarket**. The difference between where a stock trades premarket and where it closed yesterday is the **gap**. Measure it as a percentage of yesterday\'s close so that gaps on different days and names can be compared.',
    {
      code: `prev_close = 420.00
premarket = 417.90
gap = (premarket - prev_close) / prev_close
print(f"{gap:.2%}")`,
      out: '-0.50%',
    },
    'A negative number is a gap down. The `:.2%` format multiplies by 100 and adds the percent sign. A large gap means the market has already reacted to something, often a release at 8:30, and that yesterday\'s levels may be far from where the day will be fought over.',

    { h: 'Levels worth marking' },
    'A **level** is a price where many traders are likely to act. Some levels come from yesterday and some from this morning. Mark them on the chart before the open and treat each as a zone a little wider than a single price, because orders cluster around levels rather than exactly at them (the `charts` module explains why).',
    {
      list: [
        "**Yesterday's high, low and close.** The edges of yesterday's range and the price everyone measured the day against.",
        '**The premarket high and low.** Where early trading turned.',
        '**Round numbers** such as 600 or 450 in SPY or QQQ, where orders tend to gather.',
      ],
    },

    { h: 'How far a normal day goes' },
    'Implied volatility (IV) is the market\'s estimate of how much a price will move over a year, read from option prices (the `volatility` module covers it). Dividing by the square root of 252, the number of trading days in a year, turns it into a one-day figure: the **expected daily move** is about `price × IV ÷ √252`.',
    {
      code: `import math

price, iv = 600, 0.18
print(round(price * iv / math.sqrt(252), 2))`,
      out: '6.8',
    },
    'So with the price at 600 and IV at 18%, a typical day moves about $6.80 either way. This is one **standard deviation**: if price changes followed the bell curve, about two days in three would move less than this and one in three more. Real markets have more large days than the bell curve predicts. Use the figure as a scale, not a limit: a plan that needs a move of three times the expected move is asking for an unusual day.',

    { h: 'The watchlist and the no-trade list' },
    'A **watchlist** is the short list of names you will look at today. For day trading options it should hold only liquid names, those with many shares and contracts traded and option quotes a cent or two apart: SPY, QQQ, SPX and a few of the largest stocks. A name whose options are quoted 1.00 bid and 1.40 asked costs you a large slice of the trade the moment you enter. Judge a spread against the **mid**, the price halfway between bid and ask: here 0.40 against a mid of 1.20 is a third.',
    'The **no-trade list** is the set of conditions under which you will not open a trade, written down before the open. Typical entries: within a set number of minutes of a scheduled release; when the option spread is above a set share of the price; after the daily loss limit has been reached; when you are tired, ill or upset. Each one is easy to agree to in the calm of the morning and hard to apply after a loss.',

    { h: 'Common mistakes' },
    {
      list: [
        'Finding out about a release when the price jumps. Read the calendar every day.',
        "Treating yesterday's levels as exact prices. They are zones.",
        'Reading the expected move as a ceiling. It is one standard deviation, and larger days are common.',
        'A long watchlist. Ten names watched badly are worse than three watched well.',
        'Deciding the no-trade rules during the session, when you most want to trade.',
      ],
    },
  ],

  'daytrading-setup': [
    { h: 'A trade idea and a setup' },
    'A trade idea is a sentence such as "buy strength after a good open". A **setup** is the same idea written so precisely that two people, or a computer, would take exactly the same trades from it. The difference matters because only a setup can be tested, and only a tested setup can tell you anything about your odds.',
    'A useful test of your own rules: hand them to someone else with a chart of a day you have not looked at, and see whether they mark the same entries and exits you would. Every disagreement points to a word that needs a number.',

    { h: 'The six parts of a setup' },
    { sub: 'Context' },
    'The **context** is what must be true about the market before you even look for the trade. Examples: price is above VWAP (the volume-weighted average price, covered in the `charts` module), the day so far looks like a trend day, there is no scheduled release in the next 30 minutes, the time is before 11:30.',
    { sub: 'Trigger and entry' },
    'The **trigger** is the exact event that says "now", such as a 5-minute bar closing above yesterday\'s high. The **entry** is the order you use when the trigger fires: a limit order at a stated price, or at the close of the trigger bar.',
    { sub: 'Stop, target and invalidation' },
    'The **stop** is the price at which you accept you are wrong and close with a loss. The **target** is where you take profit, or the rule that moves the exit as price goes your way. The **invalidation** is the market event that says the reason for the trade has gone, such as a close back below the level you bought above. Invalidation often comes before the stop, and acting on it gives a smaller loss.',

    { h: 'R and the R multiple' },
    'From the `risk` module: **R** is the amount you lose if the stop is hit. Measuring every result in R makes trades of different sizes comparable. For a long trade the **R multiple** of the target is `(target − entry) ÷ (entry − stop)`.',
    'An example. You buy at 250.00 with the stop at 248.50 and the target at 254.00. The risk is 1.50 and the reward is 4.00, so the target is 4.00 ÷ 1.50 ≈ 2.67R. If the trade is stopped out, the result is −1R; if it reaches the target, +2.67R; if you close it at 251.50, (251.50 − 250.00) ÷ 1.50 = +1R. For a short, the stop is above the entry and the target below, so the signs flip: reward is entry minus target.',

    { h: 'What win rate a setup needs' },
    'The **expectancy** of a setup is its average result per trade: `win rate × average win − loss rate × average loss`, with wins and losses measured in R. It must be positive for the setup to be worth trading, and it must stay positive after costs.',
    {
      code: `def expectancy(win_rate, avg_win, avg_loss):
    return win_rate * avg_win - (1 - win_rate) * avg_loss

print(round(expectancy(0.40, 2.2, 1.0), 2))`,
      out: '0.28',
    },
    'A setup that wins 40% of the time with wins of 2.2R and losses of 1R averages 0.28R a trade. A win rate below half is not a problem when the wins are larger than the losses.',
    'If every trade ends at either −1R or +k R, the win rate p that breaks even solves `p × k = (1 − p) × 1`, which gives `p = 1 ÷ (1 + k)`. For a 1.5R target that is 1 ÷ 2.5 = 40%. Costs (the bid-ask spread, slippage, fees) lower every win and deepen every loss. With a cost of c R per trade, the break-even win rate becomes `(1 + c) ÷ (k + 1)`: a cost of 0.05R on the 1.5R target raises it from 40% to 42%. Small edges are the first to disappear.',

    { h: 'A setup is a hypothesis' },
    'No setup is known to work. Each one rests on a claim about how other people trade, and claims can be wrong or can stop being true. Write the claim down next to the rules.',
    {
      list: [
        '**What must be true.** For example: buyers who missed the open step in on the first dip.',
        '**How it fails.** The dip keeps going because the buyers do not come, or the market turns on news.',
        '**How you will test it.** On past data first (the `backtest` module), then on paper, then at the smallest size, with every trade journaled.',
      ],
    },
    'Writing the failure mode down in advance tells you what to look for in the losing trades, and it guards against the habit of explaining every loss away as bad luck.',

    { h: 'Following the rules you wrote' },
    'A record of trades is only evidence about the rules if the trades followed the rules. Moving a stop further away "because it looked like it would turn", skipping a valid signal because the last one lost, or adding an entry the rules never mention all turn your record into the record of a different, unwritten strategy. The cure is simple to state and hard to do: change rules only between sessions, in writing, and test the change.',
  ],

  'daytrading-orb': [
    { h: 'The opening range' },
    'The **opening range** is the highest and lowest price traded in the first minutes of the session. Which minutes is your choice, and it must be written down: the first 5, 15 or 30 minutes are common. Its two edges become the first levels of the day.',
    'The **opening range breakout** (ORB) is a setup that trades the first decisive move out of that range. It is popular because its rules are short and easy to test, which also makes it a good first example of turning an idea into rules.',

    { h: 'A complete rule set' },
    {
      list: [
        'Range: the high and low of the first 15 minutes (three 5-minute bars).',
        'Trigger: a 5-minute bar closes above the range high (long) or below the range low (short).',
        'Entry: at the close of the trigger bar.',
        'Stop: the other side of the range, or its middle.',
        'Target: 2R, or a trailing stop.',
        'Time: no new entries after 11:30; out by the close at the latest.',
      ],
    },
    { sub: 'Why a close and not a touch' },
    'Price often pokes through a level for a moment and falls back. Requiring a bar to close outside the range filters out many of those pokes, at the cost of a slightly worse entry price.',
    { sub: 'Where the stop goes' },
    'A stop at the far side of the range says "the idea is wrong if price crosses the whole range". A stop at the middle is tighter: smaller losses, a nearer target, but price returns to the middle more often, so more trades are stopped out. Neither is better in general; it is a setting to test.',

    { h: 'A worked example' },
    'Take a 15-minute range of 410.20 to 411.60. A bar closes at 411.75, above the high: you go long at 411.75.',
    'With the stop at the range low, the risk is 411.75 − 410.20 = 1.55 per share, so 2R is 3.10 and the target is 414.85. With the stop at the middle, 410.90, the risk is 0.85, 2R is 1.70, and the target is 413.45. The same signal gives two very different trades.',
    {
      code: `bars = [(410.9, 410.2, 410.6), (411.6, 410.4, 411.3),
        (411.5, 410.8, 411.0), (411.9, 411.1, 411.75)]   # (high, low, close)
n = 3
hi = max(b[0] for b in bars[:n])
lo = min(b[1] for b in bars[:n])
for i, (h, l, c) in enumerate(bars[n:], start=n):
    if c > hi:
        print("long at bar", i, "close", c)
        break
print("range", hi, lo)`,
      out: `long at bar 3 close 411.75
range 411.6 410.2`,
    },
    '`bars[:n]` is the first n bars, the range. `enumerate(bars[n:], start=n)` walks the later bars while keeping their true index. Only the close is compared with the range.',

    { h: 'Why it might work and how it fails' },
    'The idea behind the ORB: the open gathers overnight news and a burst of orders, and when price leaves that first range with conviction, the move sometimes continues as late buyers or sellers follow. That is a hypothesis about other traders, not a law.',
    { sub: 'The failed breakout' },
    'The usual way it fails: price closes outside the range, then falls back inside and runs to the stop. On quiet, choppy days this can happen on both sides in one morning. A failed breakout is the normal loss of this setup, and its result depends on those losses staying at 1R. Re-entering at once, or reversing, is a different setup that needs its own rules and its own test.',
    { sub: 'The first minutes' },
    'The first minutes after 9:30 have the most volume and the least settled prices: option spreads are at their widest, quotes jump, and a range built from one or two minutes is so narrow that noise breaks it. This is one reason many traders wait for a 15 or 30-minute range.',

    { h: 'Filters, and the danger of tuning' },
    'A **filter** removes days the setup is not built for. A common one compares the width of the opening range with the expected daily move: if the range already covers a large share of a normal day, the stop is far away and a 2R target needs an unusual day. Others look at the size of the gap or skip days with a release inside the trading window.',
    'Each setting (range length, stop, target, filters, cut-off time) changes the results. Try enough combinations on past data and one will look excellent by chance alone. Choose the settings before you test, and check them on data you did not use to choose them.',

    { h: 'Common mistakes' },
    {
      list: [
        'Trading the first touch of the level instead of a close.',
        'Trading inside the first few minutes, when spreads are wide.',
        'Holding past the stop after a failed breakout.',
        'Changing the range length after a losing week, then again after the next.',
      ],
    },
  ],

  'daytrading-trend': [
    { h: 'What a trend day looks like' },
    'On a **trend day** price leaves its opening area early and keeps moving the same way for most of the session. Dips are shallow and bought (or rallies sold, on a day trending down), and the close lands near the high or the low of the day. Such days are a minority, but they produce many of the large intraday moves.',

    { h: 'VWAP, briefly' },
    'From the `charts` module: **VWAP**, the volume-weighted average price, is the average price of all trading since the open, with each price weighted by how many shares traded at it. In symbols, VWAP = Σ(price × volume) ÷ Σ volume, where Σ means "add up over all bars so far". It is recomputed after every bar, so it forms a line on the chart.',
    {
      code: `prices = [600.0, 601.0, 602.5, 602.0]
volumes = [500, 200, 200, 100]
pv = vol = 0.0
for p, v in zip(prices, volumes):
    pv += p * v
    vol += v
    print(round(pv / vol, 2))`,
      out: `600.0
600.29
600.78
600.9`,
    },
    'The first bar had the most volume, so VWAP stays close to 600 even as price rises: it is the average price paid, not the average of the bars. Many traders and institutions use it as a reference for whether today\'s buyers or sellers are ahead.',

    { h: 'Evidence as the day develops' },
    'You never know at 9:45 that a trend day has begun. What you can see is evidence building, and your rules may only use what was visible at the time.',
    { sub: 'Crosses and slope' },
    'Count how many times the close has changed side of VWAP. On a trend day the count stays at zero or one, and VWAP slopes steadily. On a range day the count climbs and VWAP is flat.',
    { sub: 'Where price sits in its range' },
    'Divide the distance from the day\'s low to the last price by the day\'s range. With a low of 590, a high of 600 and a last price of 598, the result is 8 ÷ 10 = 80%. Trend days keep this near one end. Early in the day, though, trend days and range days often look the same, so read the evidence as a probability that changes, not a label.',

    { h: 'The VWAP pullback setup' },
    'The setup below is a hypothesis: buyers who missed the move use VWAP as a reference to buy, so a pullback to it tends to hold while the trend lasts.',
    {
      list: [
        'Context: price has held above a rising VWAP since the first 30 minutes, with at most one cross.',
        'Pullback: price comes back to touch VWAP (or a short moving average).',
        "Trigger: after the touch, a bar closes above the previous bar's high (or close).",
        'Stop: below the pullback low.',
        "Target: the day's high, or a trailing stop.",
        'Invalidation: a 5-minute close below VWAP. Last entry: a stated time.',
      ],
    },
    'It fails when the trend is ending: the touch of VWAP becomes a break of it. That loss is part of the setup\'s cost and should show up in any honest test.',

    { h: 'Staying in a trend' },
    { sub: 'The trailing stop' },
    'A **trailing stop** is moved, by rule, in the direction of the trade as price advances: for example a little under each new higher low on the 5-minute chart. Buy at 600.00 with the stop at 599.00 (1R = $1). After two higher lows you have moved the stop to 601.20: if it is hit, you keep 1.2R. Once the stop is above the entry, the worst case is a smaller win, ignoring gaps and slippage.',
    { sub: 'Why early profit-taking hurts' },
    'Trend setups usually win less than half the time and depend on a few large winners. Suppose four trades lose 1R each and one trend pays 5R: the five trades make +1R. Take that winner off at 1.5R "to be safe" and the five trades lose 2.5R. Cutting winners short is the quiet way trend traders lose.',

    { h: 'Hindsight and other mistakes' },
    {
      list: [
        "Labelling days after the close and believing you would have known. Test rules that use only the left part of the chart.",
        'Buying every touch of VWAP on a day that has crossed it eight times.',
        'Making exceptions to the exit rule while in the trade. If a small break should not count, write a buffer into the rule and test it.',
        'Entering late in the afternoon, when the trend has little day left.',
      ],
    },
  ],

  'daytrading-range': [
    { h: 'What a range day looks like' },
    'On a **range day** price moves back and forth inside a band. It crosses VWAP again and again, VWAP itself is close to flat, pushes to yesterday\'s high or low fail, and the close lands somewhere in the middle of the day\'s range. Most days are closer to this than to a strong trend.',

    { h: 'Mean reversion as a hypothesis' },
    '**Mean reversion** is the idea that a price that has moved far from an average tends to come back towards it. On a range day the average is VWAP. The hypothesis behind fading is that on a day already behaving like a range, moves to its edges run out of buyers or sellers and return. On a trend day the same moves keep going, which is why the context matters more here than anywhere.',
    'To **fade** a move is to trade against it: sell after a rise, buy after a drop.',

    { h: 'How far from VWAP' },
    'Many charting tools draw bands around VWAP at a number of **standard deviations**, a measure of how spread out today\'s prices have been around it. The distance of price from VWAP in standard deviations is `z = (price − VWAP) ÷ standard deviation`. With VWAP at 450.00, a standard deviation of 0.80 and price at 451.60, z = 1.60 ÷ 0.80 = 2. A level such as yesterday\'s high can play the same role as a band.',

    { h: 'The fade setup, rule by rule' },
    { sub: 'Context and trigger' },
    'Context: by late morning VWAP is flat and price has crossed it several times. Trigger: price pokes outside the band or the level and a bar then closes back inside. Waiting for that close is what separates a fade from catching a falling knife, the beginner\'s habit of buying a drop because it has dropped. On a trend day the band is touched and left behind, and the trigger never fires.',
    { sub: 'Stop and target' },
    'Stop: beyond the extreme of the poke. Target: VWAP. For a short at 452.00 with the stop at 452.60 and VWAP at 450.80, the risk is 0.60 and the reward 1.20, a 2R target. Invalidation: a close outside the band again.',

    { h: 'The shape of the results' },
    'Fades tend to win often, with wins smaller than the stop, and to lose rarely but sometimes badly: when a range day turns into a trend, price can run through the stop or jump past it. The expectancy is very sensitive to that rare loss.',
    {
      code: `win, w = 0.70, 0.6      # 70% of trades win 0.6R
lose, l = 0.25, 1.0     # 25% lose 1R at the stop
tail, t = 0.05, 2.5     # 5% run through the stop for 2.5R
print(round(win * w - lose * l - tail * t, 3))`,
      out: '0.045',
    },
    'Without the tail, 70% winning 0.6R and 30% losing 1R averages 0.12R. Five bad trades in a hundred bring it down to 0.045R, and a few cents of cost per trade would take the rest. This is why the stop on a fade must sit in the market as an order and must never be widened. Each 2.5R loss needs more than four 0.6R wins to repair.',

    { h: 'Telling a range day from a trend day' },
    {
      list: [
        '**VWAP crosses**: many crosses point to a range, few to a trend.',
        "**VWAP's slope**: flat for a range, steady for a trend.",
        '**The expected move used so far**: a range day usually stays well inside it.',
        '**Edges**: levels that hold on repeated tests point to a range; levels that break and hold the other side point to a trend.',
      ],
    },
    'You only ever have evidence, never certainty, and early in the day it is thin. A good rule set has a third answer, **unclear**, and on unclear days the rule can be to do nothing. Not trading is a position.',

    { h: 'Common mistakes' },
    {
      list: [
        'Fading the first touch with no trigger.',
        'Fading on a day with a sloping VWAP and no crosses.',
        'Moving the stop "this once" because the trade "must" come back.',
        'Fading again and again in the same direction after each stop: repeated failures at an edge are themselves evidence of a trend.',
        'Judging the setup by its win rate alone, without the tail losses.',
      ],
    },
  ],

  'daytrading-option': [
    { h: 'The setup and the vehicle' },
    'A setup is a view on the **underlying**, the stock, ETF or index the option is written on: it will move from here to there before a certain time. An option is one way to carry that view. Choosing which option is a separate decision, with its own costs and its own ways to go wrong. Four choices matter: delta, days to expiry, the spread and liquidity, and whether to use one option or a spread.',

    { h: 'Delta and what you make per dollar' },
    'From the `pricing` module: **delta** is about how much the option price changes when the underlying moves $1. Calls have delta between 0 and 1, puts between −1 and 0. An option **contract** is on 100 shares, so a call with delta 0.40 gains about 0.40 × $100 = $40 per contract for a $1 rise, and about $80 for a $2 rise, if the move is quick. Put the other way, one contract moves like delta × 100 shares: a 0.40 delta contract like 40 shares.',
    'Higher delta (deeper in the money) behaves more like the stock and costs more. Lower delta (out of the money) is cheaper and moves less per dollar, so it needs a larger move; if the move does not come, most of its value disappears. Many intraday traders start from deltas around 0.40 to 0.60 because they respond to a modest move without carrying the full price of a deep option.',

    { h: 'Days to expiry' },
    { sub: 'Gamma and decay' },
    'An option that expires today is called **0DTE** (zero days to expiry). It has the most **gamma**, the rate at which delta changes as the underlying moves, so its gains speed up on a large move. It also has the most **decay** per hour, the loss of value as time passes. An option a week out decays less per hour and bends less. The price of an at-the-money option grows roughly with the square root of the time left, so an option with four times as long to run costs only about twice as much: per day of time bought, the shortest expiry is the most expensive. At the time of writing (2026) SPX has an expiry every weekday, and so do SPY and QQQ; check the chain at your broker.',
    { sub: 'Matching the expiry to the move' },
    'The comparison below prices two at-the-money calls on a $450 ETF at 20% implied volatility, one with 5 trading hours left and one with five days, and shows the P&L per contract one hour later for a small move ($0.50) and a large one ($3).',
    {
      code: `import math

def call(S, K, hours, iv):
    sd = iv * math.sqrt(hours / 6.5 / 252)
    d1 = math.log(S / K) / sd + sd / 2
    N = lambda x: 0.5 * (1 + math.erf(x / math.sqrt(2)))
    return S * N(d1) - K * N(d1 - sd)

for name, h in [("0DTE", 5), ("5 days", 31)]:
    p0 = call(450, 450, h, 0.2)
    small = 100 * (call(450.5, 450, h - 1, 0.2) - p0)
    big = 100 * (call(453, 450, h - 1, 0.2) - p0)
    print(name, round(p0, 2), round(small), round(big))`,
      out: `0DTE 1.98 5 168
5 days 4.94 18 158`,
    },
    'Time is counted in trading hours (6.5 a day, 252 days a year), a simplification. On the small move the 0DTE makes $5 against $18, because an hour of its fast decay ate most of the gain. On the large move it makes $168 against $158. The 0DTE is the better vehicle only when the move is both large and fast.',

    { h: 'The spread is a cost' },
    'The **spread** is the gap between the bid (what buyers pay) and the ask (what sellers want). Buy at the ask, sell at the bid, and you lose the whole spread on a round trip even if the mid price never moves. A quote of 3.10 / 3.20 costs 0.10 × 100 = $10 per contract, about 3% of the price. A cheap option quoted 0.15 / 0.20 costs $5, but that is 29% of its mid price of 0.175. The cheaper the option, the larger its spread tends to be as a share of its value.',
    'Prefer strikes with high **volume** (contracts traded today) and **open interest** (contracts still open), use limit orders, and decide in advance the widest spread you accept.',

    { h: 'Which underlying' },
    'SPY is an ETF on the S&P 500 at about a tenth of the index level; its options are American style and settle in shares. SPX is the index itself; its options are on 100 times an index level of several thousand, so one contract is about ten times the size of a SPY contract, and they are European style and settled in cash. XSP is a mini SPX at one tenth of the size, also cash-settled. These are contract specifications at the time of writing (2026); confirm them with your broker. Tax treatment differs between these products and between countries; that is a question for a professional, not this course.',

    { h: 'Single option or vertical' },
    'A **debit vertical** (from the `strategies` module) buys one option and sells another further out on the same expiry. A 600/604 call spread bought for 1.60 can be worth at most the 4.00 width, so its maximum profit is (4.00 − 1.60) × 100 = $240 and its maximum loss the $160 paid. Compared with the single call it costs less, decays less, and moves less with implied volatility. In exchange the profit is capped and there are two spreads to pay.',

    { h: 'Turning the stock plan into an option plan' },
    'Your setup gives a stop and a target on the underlying. To size the trade you need them in option prices. With delta alone: option at the stop ≈ option price − |delta| × distance to the stop, and option at the target ≈ option price + |delta| × distance to the target, where |delta| means delta without its sign. A call bought at 2.50 with delta 0.45 and a stop $2.00 away is worth about 2.50 − 0.90 = 1.60 at the stop. This ignores gamma, decay and changes in IV, all of which move the real price, so treat it as an estimate and keep the stop itself on the underlying\'s price.',
  ],

  'daytrading-manage': [
    { h: 'Management is part of the setup' },
    'Once a trade is open, every choice is made with money at risk and the clock running. The decisions that come up again and again are written into the setup before entry, so that during the trade you apply them instead of debating them.',
    { sub: 'Scaling out' },
    '**Scaling out** means closing part of the position at a first target and holding the rest. With three contracts bought at 1.50 and a premium stop at 0.90, you might sell one at 2.10 (+1R) and move the stop on the other two to 1.50, the entry. If those two are then stopped, the trade made (2.10 − 1.50) × 100 = $60. Scaling out turns some losers into small winners and caps some big winners. It changes the setup\'s expectancy, so test it as written.',
    { sub: 'Moving the stop' },
    'Stops move only towards the trade and only by rule: to the entry at 1R, under each new higher low, and so on. Moving a stop further away turns a planned loss into a larger unplanned one and breaks the position size, which was computed from the original stop.',
    { sub: 'Time stops' },
    'A **time stop** closes a trade that has not worked within a set time, such as 30 minutes. With options it matters more than with shares, because waiting costs decay. In code it is convenient to count time in minutes from the 9:30 open: 10:00 is minute 30, noon is minute 150 and 3:30 pm is minute 360. A trade is then out of time when the current minute minus the entry minute reaches the limit, and a flat-by rule fires once the minute reaches the stated time.',

    { h: 'Time of day' },
    'Volume and movement are highest after the open and into the close, and usually thinnest around midday, when moves are slower and spreads less forgiving relative to the move. The last hour brings its own flows as positions are closed. Many traders restrict each setup to a window of the day, and a test should check whether results differ by time.',

    { h: 'Why same-day options behave differently' },
    { sub: 'Decay and the square root of time' },
    'An at-the-money option\'s time value shrinks roughly in proportion to the **square root** of the time left (written √t). With a quarter of the time left, it is worth about √(1/4) = half. So an at-the-money 0DTE call worth 1.20 with 3 hours left is worth about 0.60 with 45 minutes left, if nothing moves, and then nothing at 4:00 pm. The last hours lose the most per hour.',
    { sub: 'Gamma near expiry' },
    'Gamma, the rate at which delta changes, grows as expiry nears. At the money it grows roughly like 1 ÷ √t: with a ninth of the time left, gamma is about three times as large. The code compares the delta of a call $1 out of the money with its delta if the stock rises $1, at three times of day.',
    {
      code: `import math

def delta(S, K, hours, iv=0.15):
    sd = iv * math.sqrt(hours / 6.5 / 252)
    d1 = math.log(S / K) / sd + sd / 2
    return 0.5 * (1 + math.erf(d1 / math.sqrt(2)))

for h in [4, 1, 0.25]:
    print(h, round(delta(500, 501, h), 2), round(delta(501, 501, h), 2))`,
      out: `4 0.4 0.5
1 0.3 0.5
0.25 0.14 0.5`,
    },
    'With 4 hours left a $1 rise moves delta from 0.40 to 0.50. With 15 minutes left the same rise moves it from 0.14 to 0.50. Late in the day a small move changes the position completely, in either direction.',

    { h: 'Expiry mechanics' },
    'From the `options` module, with the rules as they stand at the time of writing (2026). SPY options are settled in shares: a call left open in the money becomes 100 shares per contract. Option holders can usually decide to exercise after the 4:00 pm close, up to a cut-off around 5:30 pm Eastern (often earlier at a broker), so a short SPY option that closed slightly out of the money can still be assigned if the price moves after hours. SPX options are settled in cash. The same-day ones (the weekly SPXW series) settle at the closing value and stop trading at 4:00 pm; the standard monthly SPX contracts settle on opening prices instead. Your broker may close positions for you near expiry on its own terms. Check the current rules with your broker before you trade.',

    { h: 'Short options and the close' },
    'Selling an option collects a premium and takes on the obligation. A call sold for 0.30 that is worth 2.50 when the stock spikes has lost (2.50 − 0.30) × 100 = $220, more than seven times the premium, and an uncovered (naked) short call has no upper limit. A defined-risk spread caps the loss at the width minus the credit. Never let a short option reach the close by accident: write a time, such as 3:45 pm, by which every short option is closed.',

    { h: 'What the evidence says' },
    'Same-day options are now a large share of SPX option volume. A widely cited study of retail trading in 0DTE SPX options (Beckmeyer, Branger and Gayda, using data from 2021 to early 2023) estimated that retail traders lost money in aggregate, with transaction costs a large part of the losses. The exact size of those losses is debated, and a study of the past is not a forecast. It is still the base rate: the average retail trader in this product lost. Your plan should assume you start as that trader.',

    { h: 'A careful way in' },
    {
      list: [
        'Paper trade first, long enough to see many fast days.',
        'Then the smallest live size: one contract, or a narrow spread.',
        'Defined risk only. Size every bought option as if it will go to zero.',
        'A flat-by time and a daily loss limit, both fixed in writing.',
        'A journal of every trade, so that the backtest and business modules have something to work on.',
      ],
    },
  ],

  'daytrading-lab': [
    { h: 'What the planner does' },
    'Before every trade the same questions come up: how much may I lose, where will the option be at my stop and target, how many contracts does that allow, and does the trade pass my rules? Answered by hand under time pressure they are answered inconsistently. The lab turns them into a small Python program, a **day trade planner**, built one function at a time.',
    'The inputs are the account size, the risk per trade as a fraction, today\'s P&L, the daily loss limit, the option\'s bid, ask and delta, and the setup\'s entry, stop and target on the underlying. The output is a number of contracts, an option stop and target, the R multiple and a go or no-go with reasons.',

    { h: 'How much you may lose' },
    'Two limits apply at once. The per-trade limit is a fixed fraction of the account, such as 1% (the `risk` module explains why). The daily loss limit caps the whole day. What is left of the daily limit is `daily_limit + day_pnl`, since `day_pnl` is negative after losses. The **risk budget** for the next trade is the smaller of the two, and never below zero.',
    'With an account of 40,000, 1% is 400. If the daily limit is 800 and the day is down 500, only 300 is left, so the budget is 300. If the day is up, the budget stays at 400: a winning morning is not a reason to risk more per trade.',

    { h: 'The option at the stop and the target' },
    { sub: 'Estimating with delta' },
    'Delta says roughly how much the option moves per $1 in the underlying. Over a short distance: option at the stop ≈ option price − |delta| × |entry − stop|, and option at the target ≈ option price + |delta| × |target − entry|. The vertical bars mean "without the sign", so the same formula serves calls and puts: a put loses value when the stock rises to its stop, a call when the stock falls to its stop.',
    { sub: 'The floor at zero' },
    'A bought option cannot be worth less than nothing. If the estimate goes below zero, the planner should say 0, and that answer is a warning: a stop so far away that the option is worthless there means sizing for a total loss.',
    'You buy at the ask, so the ask is the entry price for the option. Using the mid price would make every plan look better than the fill you will get.',

    { h: 'How many contracts' },
    'The risk per contract is `(option entry − option stop) × 100`. Divide the budget by it and round down, so the risk never exceeds the budget. Floating-point arithmetic needs care here.',
    {
      code: `print(1.10 - 1.00)
print((1.10 - 1.00) * 100)
print(round((1.10 - 1.00) * 100, 2))`,
      out: `0.10000000000000009
10.000000000000009
10.0`,
    },
    'Computers store most decimals as close binary approximations, so 1.10 − 1.00 comes out a hair above 0.10. Dividing a budget by 10.000000000000009 and rounding down can lose a whole contract. Rounding the risk per contract to cents first removes the problem. If the risk per contract is zero or negative, the plan is broken and the answer is zero contracts, never a division by zero.',

    { h: 'The checks and the decision' },
    'The R multiple on the option is `(target − entry) ÷ (entry − stop)`. Then three rules decide. If the spread, `(ask − bid) ÷ mid`, is above your maximum, the trade fails on cost. If R is below your minimum, it fails on reward. If fewer than one contract fits the budget, it fails on size. The trade is a **go** only when none of these apply. Listing the reasons, rather than returning only yes or no, tells you which rule refused the trade and leaves a record for the review.',
    'A no-go is a result, not a failure of the tool. Late on a losing day the planner will refuse trades that are fine in themselves, because the day has used up its risk. That is the limit doing its job.',

    { h: 'What it cannot know' },
    {
      list: [
        'Gamma and decay: the real option price at the stop and target will differ from the delta estimate, most of all for 0DTE options and longer holds.',
        'Implied volatility: if it falls, the option loses value even when the underlying does what you planned.',
        'Slippage and gaps: the fill at a stop can be worse than the stop price.',
        'Fees, unless you add them, per contract on the way in and the way out.',
        'Whether the setup has an edge. The planner sizes a trade correctly; it says nothing about whether the trade is worth taking.',
      ],
    },

    { h: 'Using it on a trading day' },
    'Run the planner before every order, from the same inputs, and keep its output with the trade in your journal. Over time the journal compares the planned R with what happened, which shows how far the delta estimates are off for the options you trade. Whether the setups themselves make money is the subject of the `backtest` module: test the signal on the underlying with costs, check it on data you did not use to build it, then paper trade it with this planner before any real money.',
  ],
}
