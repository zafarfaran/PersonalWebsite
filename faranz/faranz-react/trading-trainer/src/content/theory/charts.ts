import type { Block } from '../../types'

/** The full theory for each lesson of the charts module, keyed by lesson id. */
export const chartsTheory: Record<string, Block[]> = {
  'charts-candles': [
    { h: 'A chart is a record of trades' },
    'Every time a buyer and a seller agree, the exchange records a **trade**: a price, a number of shares and a time. A busy stock such as SPY trades millions of times a day. Nobody can read millions of rows, so charts group the trades into slices of time and summarise each slice. Everything on a chart is about trades that have already happened. That is worth holding on to, because a chart looks like a road ahead and it is really a record of the road behind.',
    'Remember from the markets module that SPY is an ETF that tracks the S&P 500 index, and that one share has a price in dollars. The examples here use made-up prices.',

    { h: 'The five numbers of a bar' },
    'One slice of time becomes a **bar** with five numbers:',
    {
      list: [
        '**Open**: the price of the first trade in the slice.',
        '**High**: the highest price traded in the slice.',
        '**Low**: the lowest price traded in the slice.',
        '**Close**: the price of the last trade in the slice.',
        '**Volume**: the total number of shares traded in the slice.',
      ],
    },
    'Together they are called **OHLCV**. In code a bar is often a tuple `(open, high, low, close, volume)`, and a day of bars is a list of tuples, oldest first.',

    { h: 'Drawing a bar as a candle' },
    { sub: 'Body and colour' },
    'A **candlestick**, or candle, draws the five numbers. The thick **body** is a box from the open to the close. If the close is above the open the candle is **green** (or hollow on some charts): price ended the slice higher than it began. If the close is below the open the candle is **red**. The size of the body is the distance from open to close, `|close − open|`, always a positive number.',
    { sub: 'Wicks' },
    'Thin lines called **wicks** (or shadows) stick out of the body to the high and the low. The top of the body is whichever of the open and close is higher, so the **upper wick** is `high − max(open, close)` and the **lower wick** is `min(open, close) − low`. Using `max` and `min` means the same formula works for green and red candles.',
    'Example: open 50.00, high 50.90, low 49.60, close 50.40. The candle is green. Body 0.40. Upper wick 50.90 − 50.40 = 0.50. Lower wick 50.00 − 49.60 = 0.40. A long upper wick means price traded well above where it closed: buyers pushed up, and by the end of the slice they had given much of it back.',

    { h: 'Timeframes and building longer bars' },
    'The length of the slice is the **timeframe**: 1-minute, 5-minute, 15-minute, hourly, daily. Day traders usually watch 1-minute or 5-minute charts for trading and a daily chart for context.',
    { sub: 'Grouping rules' },
    'Longer bars are built from shorter ones. To make one 3-minute bar from three 1-minute bars: the open is the first bar\'s open, the high is the highest of the three highs, the low is the lowest of the three lows, the close is the last bar\'s close, and the volume is the sum of the three volumes. Volume is the only field you add up; the others you pick.',
    {
      code: `bars = [(20.0, 20.3, 19.9, 20.2, 400),
        (20.2, 20.5, 20.1, 20.1, 300),
        (20.1, 20.2, 19.7, 19.8, 600)]
bar = (bars[0][0], max(b[1] for b in bars), min(b[2] for b in bars),
       bars[-1][3], sum(b[4] for b in bars))
print(bar)`,
      out: '(20.0, 20.5, 19.7, 19.8, 1300)',
    },
    '`bars[0][0]` is the open of the first bar and `bars[-1][3]` is the close of the last (index 3 in each tuple is the close). The new bar is red, because 19.8 is below 20.0, even though the first minute was green. Grouping keeps the extremes and the ends and throws away the path in between: from the 3-minute candle you cannot tell whether the high came before the low.',
    { sub: 'When a bar is finished' },
    'Most platforms label a bar by its **start time**. The 10:00 bar on a 5-minute chart covers 10:00 to 10:05. At 10:03 it is drawn on your screen, but it is not finished: its high, low and close can still change. Its "close" at that moment is only the latest trade. A rule that says "a close above the level" means the finished bar. Using an unfinished bar in a backtest is a form of **lookahead**: using information you would not have had at the time.',

    { h: 'What candles do and do not tell you' },
    'Candle shapes have names. A **doji** has almost no body: it opened and closed at nearly the same price. A **hammer** has a small body near the top and a long lower wick. Books attach meanings to these shapes, such as "indecision" or "reversal". What the candle records is narrower: where price started, how far it went each way and where it ended. Studies of candle patterns on their own have found little reliable power to forecast the next move, especially after costs. Read them as description and test any rule that claims more.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Taking the close of a grouped bar from the first small bar instead of the last.',
        'Adding up highs or averaging them, instead of taking the maximum.',
        'Acting on a bar before it has finished.',
        'Switching timeframes until one shows the pattern you hoped for. Choose the timeframe first.',
        'Forgetting to check whether the chart includes premarket and after-hours trades, which change the highs, lows and volume.',
      ],
    },
  ],

  'charts-trend': [
    { h: 'Swings and structure' },
    'Price does not move in straight lines. It rises for a while, pulls back, rises again. The turning points are called **swings**, and the pattern they make is the **structure** of the chart. Reading structure is how traders describe whether a market is going up, going down or going sideways, in a way that two people can agree on.',

    { h: 'Defining a swing point' },
    { sub: 'Swing highs and swing lows' },
    'A **swing high** is a bar whose high is above the highs of the `k` bars before it and the `k` bars after it. A **swing low** is a bar whose low is below the lows of the `k` bars on each side. `k` is a number you choose: 1 finds every little wiggle, 3 or 5 finds only the larger turns.',
    {
      code: `def swing_lows(lows, k):
    return [i for i in range(k, len(lows) - k)
            if lows[i] < min(lows[i - k:i]) and lows[i] < min(lows[i + 1:i + k + 1])]

print(swing_lows([20, 18, 19, 17, 18, 19, 18.5, 20], 1))`,
      out: '[1, 3, 6]',
    },
    '`lows[i - k:i]` is the `k` bars before bar `i` and `lows[i + 1:i + k + 1]` is the `k` bars after. Both sides must be checked. The loop stops `k` bars before the end, because the last bars do not yet have `k` bars after them. The swing lows here are 18, 17 and 18.5.',
    { sub: 'Always confirmed late' },
    'Because a swing needs `k` bars after it, you can only know a bar was a swing high once those `k` bars have finished. With `k = 3` on 5-minute bars, a swing high at 11:00 is confirmed when the 11:15 bar closes, at 11:20. Drawing swings on an old chart is easy. Using them as signals means waiting for that confirmation. Code that marks the swing at the bar itself has quietly looked into the future.',

    { h: 'Uptrend, downtrend and range' },
    {
      list: [
        'An **uptrend** makes **higher highs and higher lows**: each swing high above the previous one, and each swing low above the previous one.',
        'A **downtrend** makes **lower highs and lower lows**.',
        'A **range** is price moving between a floor and a ceiling without making progress either way.',
        'Anything else, for example a higher high with a lower low, is mixed. A higher high and a lower low means the swings are getting wider, not that a trend exists.',
      ],
    },
    'Look at the swing lows found above: 18, then 17, then 18.5. The first step is lower, the second higher. On their own they do not make a trend either way, which is a common and honest answer. Both the highs and the lows must agree before you call it a trend, and an equal high is not a higher high.',
    'To say where price sits inside a range, measure it from the floor: `(price − floor) ÷ (ceiling − floor)`. With a range from 300 to 305 and price at 301, that is 1 ÷ 5 = 0.2, near the floor.',

    { h: 'Why the timeframe changes the answer' },
    'The same stock can be in an uptrend on the 5-minute chart and a downtrend on the daily chart. A bounce that lasts a morning is a series of higher highs on 5-minute bars, while on daily bars it is one small up day inside weeks of lower highs. Both descriptions are correct. They answer different questions, about different holding periods.',
    'So always say the timeframe with the trend: "up on the 5-minute, down on the daily". Use the timeframe that matches how long you plan to hold, and look one timeframe higher to see what larger traders have been doing.',

    { h: 'When structure breaks' },
    { sub: 'A change in description' },
    'In an uptrend the most recent higher low is the line that keeps the description true. If a bar closes below it, the chart is no longer making higher lows, so "uptrend" no longer fits. That does not make it a downtrend: a downtrend also needs a lower high. And it does not tell you what happens next. Many breaks of structure are followed by a new high.',
    { sub: 'What the evidence says' },
    'Researchers have found that trends tend to persist over months in many markets, a pattern called time-series momentum. Over minutes and hours the evidence is much thinner, and trading costs take a large share of any small edge. A trend is a fact about the past. "It is trending, so it will keep going" is a guess to be tested and sized as if it could be wrong.',

    { h: 'Turning a trend into rules' },
    'To test anything built on trend, the definition has to be exact: the timeframe, the value of `k`, whether swings use highs and lows or closes, when a swing counts as confirmed, and what changes the label. Then compare results with and without the rule, after costs, on data you did not use to choose `k`. Without that, the word "trend" leaves room for hindsight.',

    { h: 'Common mistakes' },
    {
      list: [
        'Checking only the bars on one side when finding swings.',
        'Treating a swing as known at the bar where it happened.',
        'Calling a trend from the half of the picture that suits the trade you already want.',
        'Arguing about "the" trend without naming the timeframe.',
      ],
    },
  ],

  'charts-levels': [
    { h: 'What support and resistance mean' },
    '**Support** is a price area where falling prices have stopped before. **Resistance** is a price area where rising prices have stopped before. The idea is that buyers showed up at support and sellers at resistance, and some of them may show up again.',
    'There are practical reasons this can happen. Traders leave **limit orders** (orders to buy or sell at a set price or better, from the markets module) at prices they care about. They put **stop orders** a little beyond those prices. And people remember where a stock turned. When many traders watch the same price, more trading tends to happen near it. That is a reason to pay attention, not a guarantee of a turn.',

    { h: 'Which levels day traders mark' },
    { sub: 'The usual list' },
    {
      list: [
        "**Yesterday's high, low and close.** The high and low mark the extremes of the last full session. The close is where a gap would fill.",
        '**The premarket high and low**: the extremes of trading before the 9:30 open.',
        '**Recent swing highs and lows** on the daily and intraday charts.',
        '**Round numbers** such as 300.00 or 450.00. People choose round prices for orders, and option strikes are listed at round prices.',
      ],
    },
    { sub: 'Few lines, not many' },
    "A chart with twenty lines has a level at every price, so every move is \"at a level\" and the lines tell you nothing. Mark the handful you will act on. Yesterday's range is also a yardstick: `high − low` tells you how far a normal day travels, so you can judge whether this morning's move is large or small.",

    { h: 'Levels are zones' },
    'Price almost never turns at the same cent twice. A level at 300.00 might hold at 299.85 one day and 300.20 the next. So treat each level as a **zone** with a width. Two common ways to set the width: a small percentage of the price (0.1% of 300 is 0.30), or a fraction of the typical bar size, which a later lesson measures with ATR.',
    { sub: 'Breaks and failed breaks' },
    'A **break** is a bar that **closes** beyond the zone. A bar whose wick pokes through but which closes back inside is a **failed break**. Traders who bought the instant price went through are now on the wrong side, which is why failed breaks can move fast the other way.',
    {
      code: `level, half = 300.00, 0.30
for close in [299.80, 300.25, 300.45, 299.60]:
    if close > level + half:
        print(close, "above")
    elif close < level - half:
        print(close, "below")
    else:
        print(close, "inside")`,
      out: `299.8 inside
300.25 inside
300.45 above
299.6 below`,
    },
    'The zone runs from 299.70 to 300.30. A close of 300.25 is above the line but still inside the zone, so it is not a break. Comparing with the edges rather than the line stops every small wiggle across 300.00 from counting.',
    'To find the levels around the current price in a list, take the largest level below the price for the nearest support, and the smallest level above it for the nearest resistance. With levels 296, 300 and 304 and price 301.50, support is 300 and resistance is 304, 2.50 away.',

    { h: 'Using levels to plan a trade' },
    'A level gives a trade three numbers. The **entry** is near the level. The **stop**, the price at which you accept you are wrong, goes beyond the far edge of the zone with a small buffer, because a stop on the line is where every wick reaches. The **target** goes before the next level, which may stop price first.',
    'From these you get the **reward to risk**: `(target − entry) ÷ (entry − stop)` for a long trade. Example: entry 300.40, stop 299.60, target 302.80. Reward 2.40, risk 0.80, ratio 3. You know it before you enter, which is the point.',

    { h: 'How much to trust a level' },
    'A level tested several times is clearly watched. Two opposite stories are told about it: "tested many times, so strong" and "tested many times, so the buyers are used up". When both stories are common, neither is reliable. Research on whether levels hold more often than chance gives mixed results. Use levels as places to make a decision with a stop in place, and judge them by your own records over many trades.',

    { h: 'Common mistakes' },
    {
      list: [
        'Drawing so many lines that every price is near one.',
        'Treating a wick through a level as a break.',
        'Placing the stop exactly on the level.',
        'Choosing a target beyond the next level without allowing for it.',
        'Believing a level must hold because it held before.',
      ],
    },
  ],

  'charts-vwap': [
    { h: 'Volume and when it happens' },
    '**Volume** is the number of shares traded. On a chart it is drawn as bars under the price, one per candle. It tells you how much activity lay behind a move: a rise on heavy volume involved many traders, the same rise on thin volume involved few.',
    { sub: 'The U shape of the day' },
    'In US shares, volume is heavy in the first half hour after the 9:30 open, light around the middle of the day, and heavy again into the 16:00 close. Plotted across the day it looks like a U. This means raw volume misleads: a large number at 9:40 may be ordinary, and a smaller number at 12:30 may be unusual. A 15-minute slice is about 4% of the 390-minute session, but the first 15 minutes usually carry more than 4% of the day\'s volume.',
    { sub: 'Relative volume' },
    '**Relative volume** compares like with like: today\'s volume up to now, divided by the average volume up to the same time over the past 20 or so sessions. If a stock has traded 900,000 shares by 10:15 and usually trades 600,000 by 10:15, its relative volume is 1.5. High relative volume says more people are trading the name today, often because of news. It says nothing about direction.',

    { h: 'The volume-weighted average price' },
    'The **volume-weighted average price**, VWAP, is the average price paid per share since the session opened. A plain average would count every bar equally. VWAP counts each bar in proportion to how many shares traded in it, so the busy bars matter most.',
    { sub: 'The formula' },
    'For each bar, take its **typical price**, `(high + low + close) ÷ 3`, a single number standing for where that bar traded. Multiply it by the bar\'s volume. Add these products up from the open, and divide by the total volume from the open. In symbols, VWAP = Σ(typical price × volume) ÷ Σ volume, where Σ means "add up over all bars so far". It resets at the start of each session.',
    {
      code: `bars = [(51, 49, 50, 3000), (52, 50, 51, 1000), (53, 51, 52, 1000)]
pv = vol = 0
for h, l, c, v in bars:
    pv += (h + l + c) / 3 * v
    vol += v
    print(round(pv / vol, 2))`,
      out: `50.0
50.25
50.6`,
    },
    'The typical prices are 50, 51 and 52, so the plain average after three bars would be 51. VWAP is 50.6 because the first bar carried 3,000 of the 5,000 shares. The two running totals, `pv` and `vol`, are all you need to update VWAP at every bar. Dividing by the number of bars instead of the total volume is a common bug that gives a meaningless huge number.',

    { h: 'Why intraday traders watch it' },
    'Large funds that buy or sell big orders over a day are often judged on whether they did better than the day\'s VWAP. So VWAP is a number many participants care about. For a day trader it is a summary of the session: if price is above VWAP, the average share bought today is showing a profit; if below, a loss. That frames the day. It is not a signal. On a quiet day price crosses VWAP many times, and a rule that trades every cross pays the spread each time.',

    { h: 'How VWAP behaves through the day' },
    'Early in the session VWAP moves a lot, because each new bar is a large share of the total. Late in the session it barely moves. If VWAP is 120.00 on 20 million shares and the next 500,000 trade at 122.00, the new VWAP is (120 × 20 + 122 × 0.5) ÷ 20.5 ≈ 120.05. A two-dollar move shifts it by five cents. By the afternoon VWAP is close to a fixed line.',
    'Where the volume falls matters too. If most of the day\'s shares traded in the first hour at low prices, VWAP stays near those prices all day even as price climbs. The figure lets you move the volume around while keeping the prices fixed.',

    { h: 'Settings that change the number' },
    'Platforms differ on whether VWAP starts at 9:30 or includes **premarket** trades, the trading before the regular session. On a day with a big overnight move the two versions can differ noticeably. Pick one, use it consistently, and know which one a chart or a friend is showing.',

    { h: 'Common mistakes' },
    {
      list: [
        'Comparing volume at 9:45 with a full day\'s average.',
        'Dividing by the number of bars instead of the total volume.',
        'Forgetting to reset VWAP at the start of each session.',
        'Treating a cross of VWAP as a reason to trade on its own.',
        'Mixing VWAPs with and without premarket trades.',
      ],
    },
  ],

  'charts-averages': [
    { h: 'Why average prices at all' },
    'Bar-to-bar prices are noisy. A **moving average** smooths them by replacing each price with the average of the last few. It is "moving" because at each new bar the oldest price drops out of the window and the newest one comes in. Traders use moving averages to see the direction of the trend through the noise and as reference lines on the chart.',

    { h: 'The simple moving average' },
    'The **simple moving average** of length `n`, written SMA(n), is the plain mean of the last `n` closes. With closes 20, 22, 21, 25 and `n = 3`, the latest SMA is (22 + 21 + 25) ÷ 3 = 22.67. The 20 has left the window and counts for nothing. Each price inside the window counts exactly 1/n. The first SMA needs `n` closes, so a list of `m` closes has `m − n + 1` SMA values.',

    { h: 'The exponential moving average' },
    { sub: 'The weight α' },
    'The **exponential moving average**, EMA(n), gives more weight to recent prices. It uses one weight, written α (the Greek letter alpha): `α = 2 ÷ (n + 1)`. For `n = 4`, α = 0.4. Each new value is `α × new price + (1 − α) × previous EMA`. The newest price gets weight α and everything before it shares the rest, with older prices fading away.',
    { sub: 'Seeding' },
    'The first EMA value needs something to start from. Common choices are the first price or the SMA of the first `n` prices. Different platforms choose differently, so EMAs can disagree for the first stretch of bars. After a few multiples of `n` bars the starting point has faded and they agree.',
    {
      code: `prices = [10, 10, 10, 10, 14, 14, 14, 14]
n = 4
alpha = 2 / (n + 1)
ema = prices[0]
for i, p in enumerate(prices):
    if i > 0:
        ema = alpha * p + (1 - alpha) * ema
    if i >= n - 1:
        sma = sum(prices[i - n + 1:i + 1]) / n
        print(i, sma, round(ema, 2))`,
      out: `3 10.0 10.0
4 11.0 11.6
5 12.0 12.56
6 13.0 13.14
7 14.0 13.48`,
    },
    'Price jumps from 10 to 14 and stays there. The EMA reacts more on the first bar of the jump (11.6 against 11.0) because the new price gets 40% of the weight. The SMA catches up completely after `n` bars, when the old prices have all left its window. The EMA keeps a trace of the past forever, so it creeps toward 14 without reaching it. Swapping α and 1 − α in the update line is a classic bug: the average then follows price far too closely, or far too slowly.',

    { h: 'Lag' },
    'Both averages are built from past prices, so both **lag**: they turn after price turns. In a steady trend, where price rises by the same amount each bar, the SMA(n) equals the price from the middle of its window, which is `(n − 1) ÷ 2` bars ago. An SMA(11) sits 5 bars behind; on 5-minute bars that is 25 minutes. An EMA of the same length reacts sooner but still lags.',
    { sub: 'The trade-off' },
    'A short average hugs price, turns quickly and is jumpy. A long average is smooth and turns late. You cannot have quick and calm at the same time. Every choice of `n` is a choice of how much lag to accept for how much smoothing.',

    { h: 'Crossovers and false signals' },
    'A **crossover** happens when price crosses an average, or a short average crosses a long one. On daily charts, the 50-day SMA crossing above the 200-day SMA is called a "golden cross" and the reverse a "death cross". In a clean trend, a crossover rule keeps you on the side of the trend after a delay. In a range it fails: price rises, the average follows late, price crosses above it at about the time the swing ends, then falls back through it. Each round trip pays the **spread** (the gap between bid and ask, from the markets module) and slippage. Ten round trips of 100 shares at 4 cents of cost each is 40 dollars before any loss on the trades themselves.',
    'Counting crossings is easy in code: track which side of the average price is on, and add one each time the side changes, skipping bars where the average is not ready.',

    { h: 'What the research says' },
    'Moving average rules are among the most studied trading rules. Some early studies found that simple rules did well in old stock index data. Later studies that allowed for the large number of rules people had tried, and that checked later data, found the best rules did not keep working, and costs remove much of what is left. Use averages to describe trend and as lines of reference. Treat any crossover rule as untested until you have tested it with costs on data it was not chosen on.',
  ],

  'charts-indicators': [
    { h: 'Measuring how far price moves' },
    'Before you place a stop or a target you need to know how far this stock usually moves in one bar. A stop 30 cents away is wide for a quiet stock and tight for a jumpy one. The tools for this are true range and the average true range.',

    { h: 'True range' },
    'The obvious measure of a bar\'s movement is `high − low`. It misses gaps. If a stock closes at 50.00 and the next bar trades between 47.50 and 49.00, high − low is 1.50, but price really travelled from 50.00 down to 47.50.',
    { sub: 'The three distances' },
    'The **true range** (TR) is the largest of three distances: `high − low`, `|high − previous close|` and `|low − previous close|`. The bars `| |` mean the absolute value: the size of a number with its sign dropped. Forgetting the absolute value on the last one is a common bug: on a gap down, `low − previous close` is negative and can never be the largest.',
    {
      code: `prev_close = 50.0
h, l = 49.0, 47.5
tr = max(h - l, abs(h - prev_close), abs(l - prev_close))
print(tr)`,
      out: '2.5',
    },
    'The candidates are 1.5, 1.0 and 2.5, so the true range is 2.5. The first bar of a series has no previous close, so its true range is high − low.',

    { h: 'Average true range' },
    'The **average true range** (ATR) is the average of recent true ranges, usually over 14 bars. The classic version, from J. Welles Wilder who invented it, starts with the plain mean of the first 14 true ranges and then updates with `ATR = (previous ATR × 13 + new TR) ÷ 14`. In general, with length `n`: `(previous × (n − 1) + TR) ÷ n`. Example: ATR 1.20, new TR 2.60, n = 14: (1.20 × 13 + 2.60) ÷ 14 = 18.2 ÷ 14 = 1.30. One wide bar moves it a little; ATR is slow by design.',
    { sub: 'Using ATR' },
    'ATR is in dollars and has no direction. It tells you the size of a usual move. Traders use it to place stops a multiple of ATR away, for example entry minus 2 ATR for a long trade, so that ordinary noise is unlikely to hit them. When ATR rises, a stop that stays the same in dollars is closer in ATR terms and more likely to be hit by noise. Widening it means trading fewer shares or contracts to keep the dollar risk the same, which the risk module covers.',

    { h: 'The relative strength index' },
    'The **relative strength index** (RSI), also from Wilder, measures how one-sided recent moves have been. Over `n` bars, usually 14, work out each bar\'s change from the previous close. Average the up moves (the **average gain**) and the down moves taken as positive numbers (the **average loss**). Then:',
    { list: ['`RS = average gain ÷ average loss`', '`RSI = 100 − 100 ÷ (1 + RS)`'] },
    {
      code: `avg_gain, avg_loss = 0.6, 0.4
rs = avg_gain / avg_loss
print(round(100 - 100 / (1 + rs), 1))`,
      out: '60.0',
    },
    'RS is 1.5, so RSI = 100 − 100 ÷ 2.5 = 60. When there are no losses at all, RS would divide by zero and RSI is 100 by convention. When there are no gains, RSI is 0. Platforms usually smooth the averages the same way as ATR, so their RSI differs a little from one built on plain averages of the last `n` changes. The idea is the same.',
    { sub: 'Overbought and oversold' },
    'RSI above 70 is called **overbought** and below 30 **oversold**. These are labels for "recent moves have been mostly up" or "mostly down". In a strong trend RSI can stay above 70 for hours because the trend is, by definition, one-sided. Selling because the label says overbought means betting against the move the indicator is measuring.',

    { h: 'What an indicator can and cannot tell you' },
    'Every indicator is a formula applied to past prices and volume. It compresses what is already on the chart into one number; it cannot add information that is not there. Two indicators built from the same closes, such as RSI and the stochastic oscillator, mostly agree because they measure nearly the same thing. Their agreement is one fact counted twice, not two pieces of evidence.',
    'Whether an indicator predicts anything is a question for data. Most show little or no edge on their own once spreads and commissions are counted. A claim like "buy when RSI is under 30" becomes worth something only after it has been written as exact rules and tested on many trades, with costs, on data not used to choose its settings, and then paper traded. The backtest module shows how.',

    { h: 'Common mistakes' },
    {
      list: [
        'Using high − low and missing gaps.',
        'Leaving out the absolute value in the true range.',
        'Treating overbought as "sell" and oversold as "buy".',
        'Counting agreement between similar indicators as confirmation.',
        'Keeping a stop fixed in dollars while ATR doubles.',
      ],
    },
  ],

  'charts-gaps': [
    { h: 'The session and the night' },
    'Regular trading in US shares and ETFs runs from 9:30 to 16:00 Eastern time. Trading also happens before the open (**premarket**) and after the close (**after hours**), with fewer participants and wider spreads. Index futures trade nearly around the clock. News arrives at all hours: earnings, economic data, events abroad. So the first trade at 9:30 is often some way from the previous day\'s close.',

    { h: 'Gaps' },
    { sub: 'Measuring a gap' },
    'A **gap** is the difference between today\'s open and yesterday\'s close: `gap = open − previous close`. Positive is a gap up, negative a gap down. To compare gaps across stocks at different prices, express it as a percentage: `gap ÷ previous close`.',
    {
      code: `prev_close = 180.00
open_ = 177.30
gap = open_ - prev_close
print(round(gap, 2), round(gap / prev_close * 100, 2))`,
      out: '-2.7 -1.5',
    },
    'A gap down of 2.70 dollars, or 1.5%. The variable is called `open_` because `open` is already a Python built-in.',
    { sub: 'Gaps outside and inside yesterday\'s range' },
    "A gap up that opens above yesterday's high leaves yesterday's whole range below it: no price from yesterday overlaps today's open. A gap up that opens between yesterday's close and yesterday's high is smaller and sits inside the old range. Either way the gap itself is measured from the close.",
    { sub: 'Gap fills' },
    "A **gap fill** means price trades back to yesterday's close. For a gap up, that happens when the session's low reaches the previous close. For a gap down, when the session's high reaches it. You will hear that \"gaps always fill\". Some fill within minutes, some take weeks and some never do. How often they fill on the same day depends on the instrument and the size of the gap, and a trader who shorts every gap up on the strength of the saying can lose heavily on the days it keeps running. Count it on your own data.",

    { h: 'The first minutes' },
    'The open is the busiest and least orderly part of the day. Orders that built up overnight meet at once. Volume is heavy, prices swing both ways quickly, and **spreads** (the gap between the bid and the ask) are at their widest, especially on options. Many experienced traders wait for the first few minutes to pass before acting, and some never trade the first five minutes at all.',

    { h: 'The opening range' },
    { sub: 'Definition' },
    'The **opening range** is the high and low of the first `N` minutes of the session, where `N` is commonly 5, 15 or 30. It is a summary of where the opening fight took place. Its high and low then become two levels for the rest of the day.',
    {
      code: `highs = [181.2, 181.6, 181.4, 181.9]
lows = [180.5, 180.9, 180.7, 181.3]
n = 3
print(max(highs[:n]), min(lows[:n]))`,
      out: '181.6 180.5',
    },
    'With 1-minute bars, a 3-minute range uses the first three bars only. The fourth bar\'s high of 181.9 comes after the range is set: it is the first trade above the range, not part of it. The range takes the highest high and the lowest low, so it needs `max` for one and `min` for the other.',
    { sub: 'Known only when complete' },
    'A 30-minute range covers 9:30 to 10:00 and does not exist until 10:00. A new high at 9:50 is part of the range, not a break of it. In code, return nothing until enough bars have finished. Trading a "break" of a range that is not complete is lookahead in a backtest and confusion in real life.',
    { sub: 'Breaks and failures' },
    'After the range is set, a bar that closes above its high or below its low is a break. A close back inside soon after is a failed break. A longer range is wider, takes in more of the early swings and is usually broken later. No length is right on every day.',

    { h: 'Putting the range in proportion' },
    "Compare the opening range with the **daily ATR**, the average daily true range from the previous lesson. If a stock's daily ATR is 4.00 and its 30-minute range is already 1.00 wide, it has used a quarter of a usual day. If the range is 3.00 wide, it has used three quarters, and a break has less room left before it is a larger than usual day. Measure the gap against ATR the same way.",
    'How to trade breaks of the opening range is a setup, covered in the day trading module. Here the range is a measurement and a pair of levels. A break is a level being crossed, not a promise of where price goes next.',

    { h: 'Common mistakes' },
    {
      list: [
        'Measuring the gap from yesterday\'s high instead of yesterday\'s close.',
        'Treating "gaps always fill" as a rule.',
        'Including bars after the opening window in the opening range.',
        'Acting on a range before it is complete.',
        'Trading the first minutes with normal size and ignoring wide option spreads.',
      ],
    },
  ],

  'charts-lab': [
    { h: 'Why build your own indicators' },
    'Every charting platform draws SMAs, EMAs, VWAP and ATR for you. But a backtest runs on data in your own code, and a rule you cannot compute is a rule you cannot test. Writing the indicators yourself also forces you to decide the details a platform hides: how an average starts, which bars a value uses, where a session begins. Those details are where backtests go wrong.',
    'The toolkit in this lab uses plain Python: a bar is a tuple, a series of bars is a list, oldest first. Each function returns a list as long as its input, so that position `i` of every indicator belongs to bar `i`.',

    { h: 'Design rules for the toolkit' },
    { sub: 'None until ready' },
    'An SMA of length 5 has no value at bar 2: there are only three prices. Rather than invent a number, return `None` at those positions. Code that uses the indicator can then skip those bars explicitly. Filling the gap with zeros or with the price creates signals that never existed.',
    { sub: 'No values from the future' },
    'A value at bar `i` may use bars `0` to `i` and nothing after. This sounds obvious, and it is broken constantly. Common forms: comparing the close at bar `i` with the average at `i + 1`; marking a swing high at the bar it happened rather than when it was confirmed; computing an opening range from all of the day\'s bars. Each makes a backtest look better than live trading can be, and none of them crashes.',
    { sub: 'Unfinished bars are dropped' },
    'When grouping 1-minute bars into 5-minute bars, a last group with only three bars is not a 5-minute bar. Its close is not a close. Drop it until it is complete.',

    { h: 'The pieces' },
    {
      list: [
        '**Resample**: step through the bars in groups of `n`; first open, highest high, lowest low, last close, total volume.',
        '**SMA**: the mean of `values[i − n + 1 : i + 1]` once `i ≥ n − 1`.',
        '**EMA**: start at position `n − 1` with the SMA of the first `n` values, then `α × value + (1 − α) × previous` with `α = 2 ÷ (n + 1)`.',
        '**Session VWAP**: running totals of typical price × volume and volume, set back to zero whenever the date changes.',
        "**ATR**: true ranges first (the first bar's is high − low), then the mean of the first `n`, then `(previous × (n − 1) + TR) ÷ n`.",
        '**Opening range**: the highest high and lowest low of the first `N` one-minute bars, or `None` while fewer than `N` have finished.',
      ],
    },
    "Wilder's ATR update is an EMA with α = 1 ÷ n instead of 2 ÷ (n + 1): the same idea of blending the new value with the old, with a slower weight.",

    { h: 'Testing each function by hand' },
    'Every function gets a case small enough to work on paper, written as `assert` lines. If an assert fails, Python stops with the message you wrote, so write messages that say what the right answer is.',
    {
      code: `def sma(values, n):
    return [None if i < n - 1 else sum(values[i - n + 1:i + 1]) / n
            for i in range(len(values))]

assert sma([3, 6, 9], 2) == [None, 4.5, 7.5], "means of (3, 6) and (6, 9)"
assert sma([3, 6], 3) == [None, None], "too few values for any average"
print("ok")`,
      out: 'ok',
    },
    'Good cases include the edges: too few values, a length of 1, a series that resets (a new day for VWAP), a gap (for true range). An SMA of length 1 should give back the prices themselves. A VWAP of bars with equal volume should equal the plain average of their typical prices. Checks like these catch slips that look fine on a chart.',

    { h: 'A worked check of the EMA' },
    'Take values 1, 3, 5, 9 with `n = 2`. Then α = 2 ÷ 3. Position 0 is `None`. Position 1 is the SMA of the first two, 2. Position 2 is (2/3) × 5 + (1/3) × 2 = 4. Position 3 is (2/3) × 9 + (1/3) × 4 = 22/3 ≈ 7.33. Working one case through by hand like this, before running the code, tells you whether the code or your understanding is wrong when they disagree.',

    { h: 'Comparing with your platform' },
    'Put the same bars into your toolkit and your charting platform and compare. Large differences mean a bug. Small differences in the first bars of an EMA or ATR usually come from seeding, since some platforms start from the first price or use a longer history. VWAP and the opening range differ if one side includes premarket trades or uses a different time zone. Write down the choices you made so that later results can be reproduced.',

    { h: 'What the toolkit is for' },
    'These functions describe price. They do not decide anything. Their use is to turn a written rule, such as "after the 15-minute opening range, a close above its high while price is above VWAP", into code that can be tested on many days with costs. Whether such a rule has an edge is the subject of the backtest module, and the honest default answer is "not yet shown".',
  ],
}
