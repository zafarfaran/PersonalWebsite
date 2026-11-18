import type { Module } from '../types'

export const charts: Module = {
  id: 'charts',
  title: 'Reading price',
  summary: 'Candles, trend, levels, volume, VWAP, moving averages, ATR, RSI and the opening range: what each one records, how to compute it, and why none of them predicts on its own.',
  lessons: [
    {
      id: 'charts-candles',
      title: 'Candles and timeframes',
      summary: 'A bar is a summary of every trade in a slice of time. Change the slice and the picture changes.',
      widget: 'charts-resample',
      text: [
        'A price chart is a record of trades that have already happened. Each **bar** sums up every trade in one slice of time with five numbers: the **open** (the first trade), the **high**, the **low**, the **close** (the last trade) and the **volume** (how many shares changed hands). Together they are called **OHLCV**.',
        'A **candle** draws those numbers. The thick **body** runs from the open to the close. It is green (or hollow) when the close is above the open and red when it is below. The thin **wicks** reach up to the high and down to the low. The upper wick is `high − max(open, close)` and the lower wick is `min(open, close) − low`.',
        'The **timeframe** is the length of the slice: 1 minute, 5 minutes, a day. Longer bars are built from shorter ones. Five 1-minute bars make one 5-minute bar: the open of the first, the highest high, the lowest low, the close of the last, and the sum of the volumes.',
        { code: `group = bars[0:5]                      # five 1-minute bars: (o, h, l, c, v)
bar5 = (group[0][0], max(b[1] for b in group), min(b[2] for b in group),
        group[-1][3], sum(b[4] for b in group))` },
        'Most platforms label a bar with its start time, so the 9:30 bar on a 5-minute chart covers 9:30 to 9:35 and is not finished until 9:35. Until then its high, low and close can still change. Acting on a bar as if it were complete is one of the commonest mistakes, live and in backtests.',
        'Candle shapes have names (doji, hammer, engulfing) and long lists of meanings. A shape tells you how the fight went inside that bar. On its own it has little proven power to forecast the next one. Read candles as description, and treat any claim that a shape predicts as something to test.',
      ],
      rules: [
        'A bar is open, high, low, close and volume for one slice of time.',
        'Grouping bars: first open, highest high, lowest low, last close, total volume.',
        'A bar is not finished until its time slice ends. Do not act on it as if it were.',
        'The same trades look different on each timeframe. Choose the timeframe before you look.',
        'Candle shapes describe what happened. They are not forecasts.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'charts-candles-1',
          ask: 'A 5-minute candle has open 410.20, high 411.50, low 409.80 and close 411.00. How long is its upper wick, in dollars?',
          answer: 0.5,
          tol: 0.005,
          check: '411.50 - max(410.20, 411.00)',
          why: 'The upper wick runs from the top of the body to the high. The close is the top of this green body, so the wick is 411.50 − 411.00 = 0.50.',
        },
        {
          kind: 'number',
          id: 'charts-candles-2',
          ask: 'Same candle: open 410.20, high 411.50, low 409.80, close 411.00. How long is the lower wick, in dollars?',
          answer: 0.4,
          tol: 0.005,
          check: 'min(410.20, 411.00) - 409.80',
          why: 'The lower wick runs from the bottom of the body down to the low. In a green candle the bottom of the body is the open: 410.20 − 409.80 = 0.40.',
        },
        {
          kind: 'choice',
          id: 'charts-candles-3',
          ask: 'Five 1-minute bars (open, high, low, close): (450.00, 450.40, 449.90, 450.30), (450.30, 450.80, 450.20, 450.70), (450.70, 450.75, 450.10, 450.15), (450.15, 450.50, 449.70, 449.85), (449.85, 450.20, 449.80, 450.05). What is the 5-minute bar?',
          options: [
            'Open 450.00, high 450.80, low 449.70, close 450.05',
            'Open 450.00, high 450.20, low 449.80, close 450.05',
            'Open 450.30, high 450.80, low 449.70, close 450.70',
            'Open 450.00, high 450.80, low 449.90, close 449.85',
          ],
          answer: 0,
          why: 'First open (450.00), highest of the five highs (450.80, in the second bar), lowest of the five lows (449.70, in the fourth), last close (450.05). Taking the high and low of only the last bar is a common slip.',
        },
        {
          kind: 'output',
          id: 'charts-candles-4',
          ask: 'Three 1-minute bars as (open, high, low, close, volume). What does this print?',
          code: `bars = [(10.0, 10.4, 9.9, 10.2, 300),
        (10.2, 10.6, 10.1, 10.5, 200),
        (10.5, 10.5, 9.8, 9.9, 500)]
o = bars[0][0]
h = max(b[1] for b in bars)
l = min(b[2] for b in bars)
c = bars[-1][3]
v = sum(b[4] for b in bars)
print(o, h, l, c, v)`,
          answer: '10.0 10.6 9.8 9.9 1000',
          why: 'Open from the first bar, the highest high (10.6), the lowest low (9.8), the close of the last bar and the total volume 300 + 200 + 500. The 3-minute candle is red: it closed below where it opened, although the middle bar was green.',
        },
        {
          kind: 'bug',
          id: 'charts-candles-5',
          ask: 'This should turn a group of 1-minute bars into one longer bar. Every bar it makes has the wrong close.',
          code: `def combine(group):
    # group: a list of (open, high, low, close, volume), oldest first
    o = group[0][0]
    h = max(b[1] for b in group)
    l = min(b[2] for b in group)
    c = group[0][3]
    v = sum(b[4] for b in group)
    return (o, h, l, c, v)`,
          line: 6,
          fix: '    c = group[-1][3]',
          why: 'The close is the last trade of the whole period, so it comes from the last bar. `group[0][3]` is the close of the first minute.',
        },
        {
          kind: 'number',
          id: 'charts-candles-6',
          ask: 'Five 1-minute bars traded 12,000, 8,000, 9,500, 7,000 and 13,500 shares. What is the volume of the 5-minute bar made from them?',
          answer: 50000,
          check: '12000 + 8000 + 9500 + 7000 + 13500',
          why: 'Volume adds up: every share traded in one of the minutes was traded in the five minutes. It is the one field you sum rather than pick.',
        },
        {
          kind: 'choice',
          id: 'charts-candles-7',
          ask: 'It is 9:33. Your 5-minute chart shows the 9:30 bar as a large green candle closing near its high. What do you know?',
          options: [
            'Buyers won the first five minutes',
            'The bar is still forming: its high, low and close can all change before 9:35',
            'The next bar will be green too',
            'The bar is final because it already has a high and a low',
          ],
          answer: 1,
          why: 'The 9:30 bar covers 9:30 to 9:35. At 9:33 its "close" is the latest trade, not the final one. Two minutes of selling can turn it red. Rules that say "on a close above" mean the completed bar.',
        },
        {
          kind: 'choice',
          id: 'charts-candles-8',
          ask: 'A 5-minute candle opens and closes at the same price with long wicks above and below (a doji). What does it tell you?',
          options: [
            'Price moved both ways in those five minutes and ended where it started',
            'A reversal is coming',
            'The trend will continue',
            'Volume was low',
          ],
          answer: 0,
          why: 'That is all the candle records. Names like "indecision" are a story about it. Whether a doji is followed by anything in particular is a question for data on your instrument, not a rule.',
        },
        {
          kind: 'choice',
          id: 'charts-candles-9',
          ask: 'In the figure, switch from 1m to 5m and then to 15m. What happens to the highest high, the lowest low and the number of bars?',
          options: [
            'The extremes stay the same and the bars fall from 60 to 12 to 4',
            'The highest high falls, because longer bars average the prices',
            'The extremes and the bar count stay the same',
            'The lowest low rises, because some lows are dropped',
          ],
          answer: 0,
          why: 'Grouping takes the maximum of the highs and the minimum of the lows, so the extremes survive. What is lost is the order of events inside each bar: from a 15-minute candle you cannot tell whether the high came before the low.',
        },
        {
          kind: 'write',
          id: 'charts-candles-10',
          ask: 'Write `candle_parts(o, h, l, c)` that returns `(body, upper_wick, lower_wick, direction)`. The body is the size of the move from open to close (never negative). Direction is `"up"`, `"down"` or `"flat"`.',
          starter: `def candle_parts(o, h, l, c):
    # body: |close - open|
    # upper wick: high - the top of the body
    # lower wick: the bottom of the body - low
    pass`,
          solution: `def candle_parts(o, h, l, c):
    body = abs(c - o)
    upper = h - max(o, c)
    lower = min(o, c) - l
    direction = "up" if c > o else "down" if c < o else "flat"
    return body, upper, lower, direction`,
          tests: `out = candle_parts(10.0, 11.0, 9.5, 10.6)
assert out is not None, "the function returns nothing yet"
body, upper, lower, d = out
assert abs(body - 0.6) < 1e-9, f"open 10.0 and close 10.6 give a body of 0.6, got {body}"
assert abs(upper - 0.4) < 1e-9, f"the upper wick runs from the close (10.6) to the high (11.0): 0.4, got {upper}"
assert abs(lower - 0.5) < 1e-9, f"the lower wick runs from the open (10.0) down to the low (9.5): 0.5, got {lower}"
assert d == "up", f"close above open is up, got {d}"
body, upper, lower, d = candle_parts(10.6, 11.0, 9.5, 10.0)
assert abs(body - 0.6) < 1e-9, "a red candle's body should be positive too: use abs"
assert abs(upper - 0.4) < 1e-9 and abs(lower - 0.5) < 1e-9, "in a red candle the top of the body is the open and the bottom is the close"
assert d == "down", f"close below open is down, got {d}"
assert candle_parts(5.0, 5.2, 4.8, 5.0)[3] == "flat", "open equal to close is flat"`,
          hint: 'The top of the body is `max(o, c)` and the bottom is `min(o, c)`, whatever the colour.',
          why: 'Using `max` and `min` for the ends of the body makes the same code work for green and red candles. Forgetting that the open is the top of a red body is the usual bug.',
        },
        {
          kind: 'design',
          id: 'charts-candles-11',
          ask: 'You plan to day trade SPY options. Decide which charts and timeframes you will use and how, and write it down before your first session.',
          checklist: [
            { point: 'A higher timeframe for context, such as the daily chart, read before the open', why: 'It shows the levels and the trend that the intraday moves sit inside.' },
            { point: 'One execution timeframe, such as 5-minute or 1-minute, fixed in advance', why: 'Flicking between timeframes until one shows the signal you want is a way of fooling yourself.' },
            { point: 'Signals only on completed bars', why: 'A forming bar can change completely before it closes.' },
            { point: 'Whether the chart includes premarket and after-hours trades', why: 'Extended-hours bars change highs, lows and indicators, and are thin and jumpy.' },
            { point: 'Volume shown under the price', why: 'A move on very little volume is a different event from the same move on heavy volume.' },
            { point: 'Candle shapes treated as description, any pattern rule tested before use', why: 'Patterns on their own have little proven predictive power.' },
          ],
          why: 'A written chart setup removes choices you would otherwise make in the moment, when you are most likely to see what you want to see.',
        },
      ],
    },
    {
      id: 'charts-trend',
      title: 'Trend and structure',
      summary: 'Higher highs and higher lows, ranges, and why the answer depends on the timeframe you ask.',
      text: [
        'Price moves in swings. A **swing high** is a bar whose high is above the highs of the `k` bars on each side of it. A **swing low** is a bar whose low is below the lows of the `k` bars on each side. Joining them shows the **structure** of the chart.',
        'An **uptrend** makes **higher highs and higher lows**: each swing high above the last, each swing low above the last. A **downtrend** makes lower highs and lower lows. Anything else is a **range** (price bouncing between a floor and a ceiling) or a mixed picture with no clear label.',
        { code: `def swing_highs(highs, k):
    return [i for i in range(k, len(highs) - k)
            if highs[i] > max(highs[i - k:i]) and highs[i] > max(highs[i + 1:i + k + 1])]` },
        'A swing point needs `k` bars after it, so you only know it was a swing high `k` bars later. Structure is always confirmed late. Code that marks a swing at bar `i` using bars after `i` is fine for drawing a chart and wrong for a signal.',
        'Trend depends on the timeframe. A 5-minute chart can make higher highs all morning while the daily chart is in a downtrend. Both are true at once: they describe different holding periods. Say which one you mean ("up on the 5-minute"), use the timeframe that matches how long you hold, and look one timeframe higher for context.',
        'Structure describes what happened. In an uptrend, a close below the last higher low means the description has changed, not that a downtrend has begun. Studies find trends tend to persist over months in many markets, but over minutes the evidence is thin and costs take much of any edge. Treat "it is trending, so it will keep going" as a guess to be tested.',
      ],
      rules: [
        'Uptrend: higher highs and higher lows. Downtrend: lower highs and lower lows. Otherwise a range or unclear.',
        'A swing point is confirmed only after the bars that follow it, so structure is always late.',
        'Name the timeframe with the trend: up on the 5-minute can be down on the daily.',
        'A close below the last higher low changes the description, not the future.',
        'Structure describes the past. Test any rule built on it before trusting it.',
      ],
      questions: [
        {
          kind: 'choice',
          id: 'charts-trend-1',
          ask: 'On a 5-minute chart the last three swing highs are 100, 102, 104 and the last three swing lows are 98, 99, 101. How do you describe it?',
          options: ['Uptrend on the 5-minute chart', 'Downtrend', 'Range', 'Uptrend on every timeframe'],
          answer: 0,
          why: 'Every high is above the last and every low is above the last: higher highs and higher lows. It says nothing about the daily chart, which may look quite different.',
        },
        {
          kind: 'choice',
          id: 'charts-trend-2',
          ask: 'The last swing highs are 105 then 106, and the last swing lows are 100 then 99. What is the structure?',
          options: [
            'Uptrend, because the high is higher',
            'Downtrend, because the low is lower',
            'Neither: a higher high with a lower low is a widening range, not a trend',
            'An uptrend about to reverse',
          ],
          answer: 2,
          why: 'A trend needs highs and lows moving the same way. Here they move apart. Picking the half that fits the trade you already want is how bias gets into chart reading.',
        },
        {
          kind: 'output',
          id: 'charts-trend-3',
          ask: 'What does this print?',
          code: `def swing_highs(highs, k):
    out = []
    for i in range(k, len(highs) - k):
        left = highs[i - k:i]
        right = highs[i + 1:i + k + 1]
        if highs[i] > max(left) and highs[i] > max(right):
            out.append(i)
    return out

print(swing_highs([10, 12, 11, 13, 15, 14, 16, 15], 1))`,
          answer: '[1, 4, 6]',
          why: 'With k = 1 a bar must be above both neighbours. 12 (index 1), 15 (index 4) and 16 (index 6) are. 13 is not, because 15 follows it. The swing highs 12, 15, 16 are higher highs.',
        },
        {
          kind: 'bug',
          id: 'charts-trend-4',
          ask: 'This should say whether bar `i` is a swing high with `k` bars on each side. It marks far too many bars in a rising market.',
          code: `def is_swing_high(highs, i, k):
    left = highs[i - k:i]
    right = highs[i + 1:i + k + 1]
    return highs[i] > max(left)`,
          line: 4,
          fix: '    return highs[i] > max(left) and highs[i] > max(right)',
          why: 'It only checks the bars to the left. In a rising market almost every bar is above the bars before it, so almost every bar counts as a swing high. A swing high must also be above the bars that follow.',
        },
        {
          kind: 'number',
          id: 'charts-trend-5',
          ask: 'You find swing highs on a 5-minute chart with k = 2. The 10:00 bar turns out to be a swing high. How many minutes after 10:00 is the earliest you could know that?',
          answer: 15,
          check: '5 * (1 + 2)',
          hint: 'The 10:00 bar must finish, and then two more bars must finish.',
          why: 'The 10:00 bar ends at 10:05, then the 10:05 and 10:10 bars must close without a higher high: 10:15. A backtest that marks the swing at 10:00 is using 15 minutes of the future.',
        },
        {
          kind: 'choice',
          id: 'charts-trend-6',
          ask: 'QQQ makes higher highs and higher lows on the 5-minute chart all morning, while the daily chart shows lower highs and lower lows for three weeks. Which is right?',
          options: [
            'The daily chart, because longer timeframes are true',
            'The 5-minute chart, because it is more recent',
            'Both: they describe different holding periods',
            'Neither, because they disagree',
          ],
          answer: 2,
          why: 'A bounce inside a downtrend is an uptrend on a shorter timeframe. A day trader holding for an hour cares most about the 5-minute picture, and the daily chart tells them where the larger sellers have been.',
        },
        {
          kind: 'choice',
          id: 'charts-trend-7',
          ask: 'SPY is in an uptrend on the 5-minute chart. The last higher low is 448.50. A bar closes at 448.20. What is the accurate reading?',
          options: [
            'A downtrend has started',
            'The pattern of higher lows is broken on this timeframe, so the uptrend label no longer fits',
            'Nothing has changed until a lower high forms',
            'Buy, because the trend will resume',
          ],
          answer: 1,
          why: 'The chart has stopped making higher lows, so it is no longer an uptrend by the definition. It is not yet a downtrend, which also needs a lower high. Many breaks of structure are followed by a new high: it is a change in description, not a prediction.',
        },
        {
          kind: 'number',
          id: 'charts-trend-8',
          ask: 'A stock has been in a range between 448 and 452 for an hour. It trades at 451.20. Where is it in the range, as a fraction from 0 (the floor) to 1 (the ceiling)? Give two decimals.',
          answer: 0.8,
          check: '(451.20 - 448) / (452 - 448)',
          why: '(451.20 − 448) ÷ 4 = 0.8. Four fifths of the way up the range, close to the ceiling where it has turned before.',
        },
        {
          kind: 'write',
          id: 'charts-trend-9',
          ask: 'Write `structure(swing_highs, swing_lows)`. Each is a list of prices, oldest first, with at least two entries. Compare the last two of each and return `"up"`, `"down"` or `"range"`.',
          starter: `def structure(swing_highs, swing_lows):
    # "up": last high above the one before AND last low above the one before
    # "down": both lower
    # anything else: "range"
    pass`,
          solution: `def structure(swing_highs, swing_lows):
    higher_high = swing_highs[-1] > swing_highs[-2]
    higher_low = swing_lows[-1] > swing_lows[-2]
    lower_high = swing_highs[-1] < swing_highs[-2]
    lower_low = swing_lows[-1] < swing_lows[-2]
    if higher_high and higher_low:
        return "up"
    if lower_high and lower_low:
        return "down"
    return "range"`,
          tests: `out = structure([100, 102, 104], [98, 99, 101])
assert out is not None, "the function returns nothing yet"
assert out == "up", f"higher highs and higher lows is up, got {out}"
assert structure([104, 102], [101, 99]) == "down", "lower highs and lower lows is down"
assert structure([105, 106], [100, 99]) == "range", "a higher high with a lower low is not a trend"
assert structure([105, 104], [99, 100]) == "range", "a lower high with a higher low is not a trend"
assert structure([90, 104, 102], [80, 101, 99]) == "down", "use only the last two swings, not the first"
assert structure([100, 100], [98, 99]) == "range", "an equal high is not a higher high"`,
          why: 'Both conditions must agree for a trend. Using only the last two swings keeps the label current, and treating an equal high as "not higher" avoids calling a flat top a trend.',
        },
        {
          kind: 'design',
          id: 'charts-trend-10',
          ask: 'You want to test whether "trade only in the direction of the 5-minute trend" helps your results. Write the definition of trend precisely enough for code.',
          checklist: [
            { point: 'The timeframe and the swing size k', why: 'Different choices give different labels for the same day.' },
            { point: 'Which prices: highs and lows of bars, or closes', why: 'Wicks and closes give different swing points.' },
            { point: 'When a swing is confirmed: k bars after it', why: 'Using it before then is lookahead and makes the test look better than reality.' },
            { point: 'What changes the label: a close below the last higher low, or a lower high as well', why: 'The rule must be mechanical so you cannot reinterpret it after the fact.' },
            { point: 'A comparison: results with the filter against results without it', why: 'A filter only helps if the filtered trades do better than the unfiltered ones.' },
            { point: 'Costs included and the rule fixed before looking at new data', why: 'A small edge from filtering can vanish after spreads, and tuning k on the same data overfits.' },
          ],
          why: '"Trend" in words leaves room for hindsight. In code it has to be a rule you can run on bars you have not seen.',
        },
        {
          kind: 'choice',
          id: 'charts-trend-11',
          ask: 'A friend says: "It is clearly in an uptrend, so it will keep going up. I will buy calls with half my account." What is the soundest reply?',
          options: [
            'Agree, because trends persist',
            'The trend describes what has happened. Whether it continues is uncertain, so size the trade as if it could fail',
            'Buy puts instead, because trends always reverse',
            'Wait for the trend to be confirmed on the 1-minute chart, then go all in',
          ],
          answer: 1,
          why: 'Structure is a description. Even if trends continue a little more often than not on some timeframe, plenty fail, and a bought call can go to zero. Sizing for being wrong is what keeps a trader in the game.',
        },
      ],
    },
    {
      id: 'charts-levels',
      title: 'Support and resistance',
      summary: 'Prices where buying or selling showed up before, why traders watch them, and why they are zones and not lines.',
      text: [
        '**Support** is a price area where falls have stopped before. **Resistance** is an area where rises have stopped before. They are where traders expect activity, because orders, stops and memories cluster there.',
        'The levels day traders mark most: **yesterday\'s high, low and close**, the **premarket high and low**, recent swing highs and lows, and **round numbers** such as 450.00, where option strikes and resting orders gather. Mark a few that matter rather than a ladder of lines.',
        'A level is a **zone**, not an exact price. Price rarely turns at the same cent. Give each level a width, for example a fraction of a percent of the price, or a fraction of the typical bar size. A **break** is a close beyond the zone. A wick through it that closes back inside is a **failed break**.',
        { code: `level, half = 450.00, 0.20
close = 450.15
state = "above" if close > level + half else "below" if close < level - half else "inside"` },
        'Levels are where you make decisions. A trade near support has its stop a little beyond the zone and its target before the next level. The distances give the **reward to risk**: (target − entry) ÷ (entry − stop). A stop placed exactly on the line sits where every wick reaches.',
        'Be modest about levels. They are places where something is more likely to happen, not promises. A level that has been tested many times is well watched, but each test can also use up the orders resting there. Evidence that levels hold more often than chance is mixed, so judge them by your own records.',
      ],
      rules: [
        "Mark yesterday's high, low and close, the premarket high and low, recent swings and round numbers.",
        'A level is a zone with a width, not a single price.',
        'A break needs a close beyond the zone. A wick through and back is a failed break.',
        'Put the stop beyond the zone, not on the line.',
        'A level is a place to decide, not a promise that price turns.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'charts-levels-1',
          ask: "Yesterday SPY's high was 452.40 and its low was 447.60. How wide was yesterday's range, in dollars?",
          answer: 4.8,
          tol: 0.005,
          check: '452.40 - 447.60',
          why: '452.40 − 447.60 = 4.80. The range is a useful yardstick: a move of 2 dollars this morning is less than half a normal day.',
        },
        {
          kind: 'number',
          id: 'charts-levels-2',
          ask: 'You make a zone around 450.00 that reaches 0.15% of the price above and below it. Where is the top of the zone? Give two decimals.',
          answer: 450.675,
          tol: 0.01,
          check: '450 * (1 + 0.0015)',
          why: '0.15% of 450 is 0.675, so the zone runs from 449.33 to 450.68. Expressing width as a percentage or a fraction of the typical bar size makes it scale with the stock.',
        },
        {
          kind: 'choice',
          id: 'charts-levels-3',
          ask: "Yesterday's high was 452.40. A 5-minute bar trades up to 452.55 and closes at 452.10. What happened?",
          options: [
            'A breakout above yesterday\'s high',
            'A failed break: price went through the level and closed back below it',
            'Nothing, because price never reached the level',
            'A new uptrend on the daily chart',
          ],
          answer: 1,
          why: 'Only the wick went through. The bar closed back under the level, so by the close rule it is not a break. Traders who bought the moment it printed 452.41 are now below their entry.',
        },
        {
          kind: 'number',
          id: 'charts-levels-4',
          ask: 'You buy at 450.30 near a support zone of 449.80 to 450.20. Your stop is 449.70, below the zone. The next resistance is 452.40. What is the reward to risk to that target?',
          answer: 3.5,
          check: '(452.40 - 450.30) / (450.30 - 449.70)',
          why: 'Reward 452.40 − 450.30 = 2.10, risk 450.30 − 449.70 = 0.60, ratio 3.5. The levels set both numbers before the trade, which is how a plan should be built.',
        },
        {
          kind: 'choice',
          id: 'charts-levels-5',
          ask: 'You buy near support at 450.00. Where does the stop make most sense?',
          options: [
            'At 450.00 exactly, the level itself',
            'A little beyond the bottom of the zone, with a small buffer',
            'A long way below, so it is never hit',
            'No stop, because support will hold',
          ],
          answer: 1,
          why: 'Price probes a level by a few cents all the time. A stop on the line is taken out by noise. A stop beyond the zone is hit only when the level has actually failed, which is the event that proves the trade wrong.',
        },
        {
          kind: 'output',
          id: 'charts-levels-6',
          ask: 'What does this print?',
          code: `levels = [447.60, 450.00, 452.40, 455.00]
price = 451.10
below = max(x for x in levels if x < price)
above = min(x for x in levels if x > price)
print(below, above, round(above - price, 2))`,
          answer: '450.0 452.4 1.3',
          why: 'The nearest level below is the largest one under the price, and the nearest above is the smallest one over it. Price has 1.30 to run before it meets the next resistance.',
        },
        {
          kind: 'bug',
          id: 'charts-levels-7',
          ask: 'This should return the nearest level above the price, the next resistance. It returns a level below.',
          code: `def next_resistance(levels, price):
    above = [x for x in levels if x < price]
    if not above:
        return None
    return min(above)`,
          line: 2,
          fix: '    above = [x for x in levels if x > price]',
          why: 'The filter keeps the levels under the price, so it returns the lowest support instead. Resistance is above: `x > price`, and the nearest of those is the smallest.',
        },
        {
          kind: 'write',
          id: 'charts-levels-8',
          ask: 'Write `zone_state(close, level, half_width)` that returns `"above"` if the close is beyond the top of the zone, `"below"` if it is beyond the bottom, and `"inside"` otherwise.',
          starter: `def zone_state(close, level, half_width):
    # the zone runs from level - half_width to level + half_width
    pass`,
          solution: `def zone_state(close, level, half_width):
    if close > level + half_width:
        return "above"
    if close < level - half_width:
        return "below"
    return "inside"`,
          tests: `out = zone_state(450.50, 450.00, 0.20)
assert out is not None, "the function returns nothing yet"
assert out == "above", f"450.50 is above the top of the zone (450.20), got {out}"
assert zone_state(450.15, 450.00, 0.20) == "inside", "450.15 is through the line but still inside the zone"
assert zone_state(449.85, 450.00, 0.20) == "inside", "449.85 is below the line but still inside the zone"
assert zone_state(449.70, 450.00, 0.20) == "below", "449.70 is below the bottom of the zone (449.80)"
assert zone_state(450.20, 450.00, 0.20) == "inside", "a close exactly on the edge has not broken out"`,
          why: 'Comparing the close with the edges of the zone, not the line, is what stops every wiggle across 450.00 from counting as a break.',
        },
        {
          kind: 'choice',
          id: 'charts-levels-9',
          ask: 'Why might a round number such as 450.00 matter on SPY more than 449.37?',
          options: [
            'Round numbers have special mathematical properties',
            'Many traders place orders there and option strikes sit there, so more activity tends to gather at it',
            'The exchange stops trading at round numbers',
            'Price always reverses at round numbers',
          ],
          answer: 1,
          why: 'People pick round prices for limit orders, stops and targets, and strikes are listed at round prices. That can mean more trading near them. It does not mean price must turn there.',
        },
        {
          kind: 'design',
          id: 'charts-levels-10',
          ask: 'Before tomorrow\'s open, mark the levels you will use for SPY and say what you will do at each. Write the plan.',
          checklist: [
            { point: "Yesterday's high, low and close", why: 'They are the levels most traders watch on the day.' },
            { point: 'Premarket high and low, checked shortly before the open', why: 'They show where trading has already turned overnight.' },
            { point: 'Nearby round numbers and the recent daily swing highs and lows', why: 'They mark where larger orders and memories sit.' },
            { point: 'A width for each zone, from the typical bar size or a small percentage', why: 'Exact lines produce false breaks and badly placed stops.' },
            { point: 'For each level: what a break looks like and what a rejection looks like', why: 'Deciding in advance stops you inventing a reason in the moment.' },
            { point: 'No more than a handful of lines', why: 'With enough lines, every price is "at a level" and the levels mean nothing.' },
            { point: 'Distances between levels, so you know the room for a target', why: 'A target beyond the next level may need price to break through it first.' },
          ],
          why: 'Levels are useful when they are few, have widths and come with decisions attached. The plan is made when you are calm, not when price is moving.',
        },
        {
          kind: 'choice',
          id: 'charts-levels-11',
          ask: 'A level has held five times today. What is the honest reading for the sixth test?',
          options: [
            'It will certainly hold again',
            'It is well watched, but repeated tests can use up the orders there; whether it holds is uncertain',
            'It will certainly break, because levels weaken',
            'Five tests make it a guaranteed entry',
          ],
          answer: 1,
          why: 'Both stories are told, "strong level" and "weakened level", which is a sign that neither is reliable. Treat it as a place to decide with a stop, not a forecast.',
        },
      ],
    },
    {
      id: 'charts-vwap',
      title: 'Volume and VWAP',
      summary: 'How much traded, compared fairly across the day, and the average price paid per share since the open.',
      widget: 'charts-vwap',
      text: [
        '**Volume** is the number of shares traded. In US shares it is heavy at the open, light around midday and heavy again into the close, a U shape. So 2 million shares in the first 15 minutes may be normal while the same number at 12:30 is unusual. Compare like with like.',
        '**Relative volume** does that: volume so far today divided by the average volume up to the same time over the past 20 or so days. A relative volume of 2 means twice the usual activity for this time of day. High relative volume says more people are trading the name today. It does not say which way.',
        'The **volume-weighted average price** (VWAP) is the average price paid per share since the open. For each bar take the **typical price** `(high + low + close) ÷ 3`, multiply by the bar\'s volume, add these up, and divide by the total volume. It resets each session.',
        { code: `pv = vol = 0
for h, l, c, v in bars:
    pv += (h + l + c) / 3 * v
    vol += v
vwap = pv / vol` },
        'Large funds are often judged on whether they bought below or sold above the day\'s VWAP, which is one reason many traders watch it. Price above VWAP means the average share bought today is showing a profit, and below means it is showing a loss. That is a description of the day so far. A cross of VWAP is not a signal on its own.',
        'Two practical points. Late in the day VWAP hardly moves, because the new volume is small against everything already counted. And platforms differ on whether premarket trades are included, so the same chart can show two VWAPs. Check the setting.',
      ],
      rules: [
        'Compare volume to the same time of day on other days: relative volume.',
        'VWAP = Σ(typical price × volume) ÷ Σ volume, from the open, reset each day.',
        'Above VWAP, the average buyer today is ahead. Below, behind. A description, not a signal.',
        'VWAP moves less and less as the day goes on.',
        'Check whether your platform includes premarket trades in VWAP.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'charts-vwap-1',
          ask: 'Three bars have typical prices 100, 102 and 101 and volumes 1,000, 3,000 and 1,000. What is the VWAP?',
          answer: 101.4,
          tol: 0.005,
          check: '(100 * 1000 + 102 * 3000 + 101 * 1000) / 5000',
          why: '(100,000 + 306,000 + 101,000) ÷ 5,000 = 101.40. The plain average is 101, but the bar at 102 carried most of the shares, so it pulls VWAP up.',
        },
        {
          kind: 'number',
          id: 'charts-vwap-2',
          ask: 'By 10:00, AAPL has traded 4.2 million shares. Over the past 20 days it averaged 2.8 million by 10:00. What is its relative volume?',
          answer: 1.5,
          check: '4.2 / 2.8',
          why: '4.2 ÷ 2.8 = 1.5: half as much again as usual at this time. It means interest is unusual today, not that price will go up.',
        },
        {
          kind: 'choice',
          id: 'charts-vwap-3',
          ask: 'By 9:45 a stock has traded 1 million shares. Its average full-day volume is 10 million. A trader says "volume is light today, only 10% of normal". What is wrong?',
          options: [
            'Nothing, 1 is 10% of 10',
            'Volume is concentrated at the open and close, so a quarter-hour should be compared with the same quarter-hour on other days',
            'Volume should be measured in dollars',
            'Only the closing volume matters',
          ],
          answer: 1,
          why: 'Fifteen minutes is about 4% of the 390-minute session, but the open usually carries more than its share of the day. Without comparing to the same time on past days, the 10% figure means little.',
        },
        {
          kind: 'output',
          id: 'charts-vwap-4',
          ask: 'Bars as (high, low, close, volume). What does this print?',
          code: `bars = [(101, 99, 100, 2000),
        (103, 100, 102, 1000),
        (102, 98, 98, 1000)]
pv = sum((h + l + c) / 3 * v for h, l, c, v in bars)
vol = sum(v for _, _, _, v in bars)
print(round(pv / vol, 2))`,
          answer: '100.25',
          why: 'The typical prices are 100, 101.67 and 99.33. Weighted by 2,000, 1,000 and 1,000 shares they give 401,000 ÷ 4,000 = 100.25. The first bar counts twice as much as each of the others.',
        },
        {
          kind: 'bug',
          id: 'charts-vwap-5',
          ask: 'This VWAP comes out far too large on every stock.',
          code: `def vwap(bars):
    # bars: (high, low, close, volume)
    pv = 0
    for h, l, c, v in bars:
        pv += (h + l + c) / 3 * v
    return pv / len(bars)`,
          line: 6,
          fix: '    return pv / sum(b[3] for b in bars)',
          why: 'Price times volume must be divided by the total volume, not the number of bars. Dividing by the bar count gives a number in the hundreds of thousands, price times shares per bar.',
        },
        {
          kind: 'choice',
          id: 'charts-vwap-6',
          ask: 'At 12:30, QQQ trades at 0.8% above its VWAP. What does that tell you?',
          options: [
            'QQQ will fall back to VWAP',
            'On average, shares bought today cost less than the current price',
            'Large funds are buying right now',
            'QQQ is overbought and should be sold',
          ],
          answer: 1,
          why: 'VWAP is the average price paid today, so price above it means the average buyer is ahead. Whether price returns to VWAP, or keeps going, is not in the number.',
        },
        {
          kind: 'choice',
          id: 'charts-vwap-7',
          ask: 'In the figure, slide the time to the close and switch between U-shaped, even and heavy open. Where does VWAP end with the heavy-open profile, compared with the plain average?',
          options: [
            'Well below the plain average, because most shares traded at the lower morning prices',
            'Above the plain average, because the price rose',
            'Equal to the plain average',
            'Equal to the closing price',
          ],
          answer: 0,
          why: 'The prices are the same in every profile; only the weights change. With heavy volume early, the cheap morning prices dominate, so VWAP ends near 453.6 while the plain average is about 454.9. With even volume the two are almost the same.',
        },
        {
          kind: 'number',
          id: 'charts-vwap-8',
          ask: 'At 15:00 SPY\'s VWAP is 450.00 on 50 million shares. In the next minutes 1 million shares trade at an average of 455.00. What is the new VWAP? Give two decimals.',
          answer: 450.098,
          tol: 0.006,
          check: '(450 * 50 + 455 * 1) / 51',
          why: '(450 × 50 + 455 × 1) ÷ 51 = 450.10. A 5-dollar move in price shifts VWAP by 10 cents because the new shares are a small part of the day. Late in the session VWAP is close to a fixed line.',
        },
        {
          kind: 'write',
          id: 'charts-vwap-9',
          ask: 'Write `running_vwap(bars)` that returns the VWAP after each bar, as a list the same length as `bars`. Bars are (high, low, close, volume).',
          starter: `def running_vwap(bars):
    # one value per bar: the VWAP of all bars up to and including this one
    pass`,
          solution: `def running_vwap(bars):
    out = []
    pv = 0.0
    vol = 0
    for h, l, c, v in bars:
        pv += (h + l + c) / 3 * v
        vol += v
        out.append(pv / vol)
    return out`,
          tests: `bars = [(101, 99, 100, 2000), (103, 100, 102, 1000), (102, 98, 98, 1000)]
out = running_vwap(bars)
assert out is not None, "the function returns nothing yet"
assert len(out) == 3, f"one value per bar, got {len(out)}"
assert abs(out[0] - 100) < 1e-9, f"after one bar VWAP is that bar's typical price, 100, got {out[0]}"
assert abs(out[1] - (200000 + 101666.6667) / 3000) < 1e-3, f"after two bars VWAP is about 100.56, got {out[1]}"
assert abs(out[2] - 100.25) < 1e-9, f"after three bars VWAP is 100.25, got {out[2]}"
same = running_vwap([(10, 10, 10, 5), (12, 12, 12, 5)])
assert abs(same[1] - 11) < 1e-9, "with equal volumes VWAP is the plain average"`,
          why: 'Keep two running totals, price times volume and volume, and divide at each bar. The same totals are what charting platforms keep, which is why VWAP can be updated cheaply with every trade.',
        },
        {
          kind: 'design',
          id: 'charts-vwap-10',
          ask: 'Write how you will use VWAP and relative volume on a trading day without treating either as a buy or sell signal.',
          checklist: [
            { point: 'The VWAP setting: regular session only, or including premarket', why: 'The two give different lines; mixing them muddles your records.' },
            { point: 'VWAP as context: price above or below it describes who is ahead today', why: 'It frames a setup but is not the setup.' },
            { point: 'Relative volume compared at the same time of day', why: 'Raw volume early in the day is always high.' },
            { point: 'VWAP combined with a level or a structure, not used alone', why: 'Crossings of VWAP happen many times on a quiet day.' },
            { point: 'What would show the read is wrong', why: 'Without an invalidation, any outcome can be explained after the fact.' },
            { point: 'Recording the VWAP context of every trade in your journal', why: 'Only your own records can show whether it helps your results.' },
          ],
          why: 'VWAP and relative volume are measurements of the day. They earn a place in a plan by improving results in your records, not because many traders watch them.',
        },
        {
          kind: 'choice',
          id: 'charts-vwap-11',
          ask: 'You and a friend look at the same stock at 10:30 and your VWAPs differ by 40 cents. The stock moved a lot before the open. What is the likely reason?',
          options: [
            'One platform has a bug',
            'One VWAP includes premarket trades and the other starts at 9:30',
            'VWAP is random',
            'One of you uses closes instead of typical prices, which always makes a 40-cent difference',
          ],
          answer: 1,
          why: 'VWAP depends on where it starts. Premarket prices differ most from the session on a gap day, so including them shifts the line. The typical price choice matters a little; the start time matters more.',
        },
      ],
    },
    {
      id: 'charts-averages',
      title: 'Moving averages',
      summary: 'SMA and EMA, why every average lags, and why crossovers give false signals in a range.',
      widget: 'charts-averages',
      text: [
        'A **simple moving average** SMA(n) is the mean of the last `n` closes, recomputed at every bar. Each of the `n` closes counts equally and the one before them not at all.',
        'An **exponential moving average** EMA(n) weights recent prices more. Its weight is `α = 2 ÷ (n + 1)`, and each new value is `α × price + (1 − α) × previous EMA`. It needs a starting value, usually the first price or the SMA of the first `n`, so platforms can differ for the first bars and then agree.',
        { code: `alpha = 2 / (n + 1)
ema = closes[0]
for p in closes[1:]:
    ema = alpha * p + (1 - alpha) * ema` },
        'Every average **lags**: it is built from the past, so it turns after price turns. In a steady trend an SMA(n) sits about `(n − 1) ÷ 2` bars behind price. An EMA of the same length reacts sooner but still lags. A short average follows price closely and is noisy. A long one is smooth and late. No length is both quick and calm.',
        'A **crossover** is price crossing an average, or a fast average crossing a slow one (on daily charts, the 50-day over the 200-day is called a "golden cross"). In a trend a crossover can keep you on the right side. In a range price crosses back and forth, and each false signal costs a spread and slippage.',
        'Moving average rules are among the most tested ideas in finance. Some old studies found that they worked in past data. Later work that allowed for how many rules had been tried found that the best ones did not keep working afterwards. Use averages to describe trend and as reference lines, and test any crossover rule with costs before trusting it.',
      ],
      rules: [
        'SMA(n): the plain mean of the last n closes.',
        'EMA(n): α = 2 ÷ (n + 1); new = α × price + (1 − α) × old.',
        'Every average lags. SMA(n) is about (n − 1) ÷ 2 bars behind in a steady trend.',
        'Shorter is faster and noisier. Longer is smoother and later.',
        'In a range, crossovers flip back and forth, and each one costs the spread.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'charts-averages-1',
          ask: 'The last four closes are 10, 11, 12 and 15. What is the 3-bar SMA now? Give two decimals.',
          answer: 12.667,
          tol: 0.006,
          check: '(11 + 12 + 15) / 3',
          why: 'Only the last three count: (11 + 12 + 15) ÷ 3 = 12.67. The 10 has dropped out of the window.',
        },
        {
          kind: 'number',
          id: 'charts-averages-2',
          ask: 'What is α, the weight on the newest price, for a 9-bar EMA?',
          answer: 0.2,
          check: '2 / (9 + 1)',
          why: '2 ÷ (9 + 1) = 0.2. Each new price gets 20% of the weight and the old EMA keeps 80%.',
        },
        {
          kind: 'number',
          id: 'charts-averages-3',
          ask: 'A 9-bar EMA stands at 100. The next close is 106. What is the new EMA?',
          answer: 101.2,
          check: '0.2 * 106 + 0.8 * 100',
          why: '0.2 × 106 + 0.8 × 100 = 101.2. A 6-dollar jump moves the average by a fifth of that, which is the lag in one line.',
        },
        {
          kind: 'output',
          id: 'charts-averages-4',
          ask: 'What does this print?',
          code: `closes = [10, 11, 12, 13, 14, 18]
n = 3
sma = [sum(closes[i - n + 1:i + 1]) / n for i in range(n - 1, len(closes))]
print(sma)`,
          answer: '[11.0, 12.0, 13.0, 15.0]',
          why: 'The first average needs three closes, so there are four values for six closes. The jump to 18 lifts the average from 13 to 15: a third of the 4-dollar surprise, because 18 is one of three equal weights.',
        },
        {
          kind: 'bug',
          id: 'charts-averages-5',
          ask: 'Called with n = 20, this EMA follows price almost bar for bar, far faster than a 20-bar average should.',
          code: `def ema(prices, n):
    alpha = 2 / (n + 1)
    out = [prices[0]]
    for p in prices[1:]:
        out.append(alpha * out[-1] + (1 - alpha) * p)
    return out`,
          line: 5,
          fix: '        out.append(alpha * p + (1 - alpha) * out[-1])',
          why: 'The weights are swapped. With n = 20, α is about 0.095, so as written the newest price gets about 0.905 of the weight and the old average almost none. The new price should get α and the old EMA keep 1 − α.',
        },
        {
          kind: 'number',
          id: 'charts-averages-6',
          ask: 'Price rises by the same amount every bar. About how many bars behind price is a 21-bar SMA?',
          answer: 10,
          check: '(21 - 1) / 2',
          why: 'The SMA of a straight line equals the price at the middle of the window: (21 − 1) ÷ 2 = 10 bars back. On 5-minute bars that is 50 minutes of delay.',
        },
        {
          kind: 'choice',
          id: 'charts-averages-7',
          ask: 'In the figure, choose SMA and set the length to 5, then to 30. What happens?',
          options: [
            'The crossings in the trend half fall from 10 to 0 and the gap behind price grows, but the range half still has 12 crossings',
            'Fewer crossings everywhere, so a longer average solves false signals',
            'Nothing changes except the colour',
            'The longer average crosses more often in the trend',
          ],
          answer: 0,
          why: 'A long average stops whipsawing in the trend but sits further behind: about 1.73 behind price at bar 59 against 0.20. In the range it crosses as often as the short one. Length trades lag for noise; it does not remove false signals in a range.',
        },
        {
          kind: 'choice',
          id: 'charts-averages-8',
          ask: 'The chart shows price and a slow average on a quiet morning. What happens to a rule that buys when price crosses above the average and sells when it crosses below?',
          chart: {
            title: 'Price and a slow average',
            x: 'bar',
            y: 'price',
            series: [
              { name: 'price', points: [100, 100.8, 101.2, 100.6, 99.8, 99.4, 99.9, 100.7, 101.1, 100.5, 99.7, 99.3, 99.8, 100.6, 101.0, 100.4], color: 'muted' },
              { name: 'average', points: [100.2, 100.3, 100.4, 100.5, 100.5, 100.4, 100.3, 100.2, 100.2, 100.3, 100.3, 100.2, 100.1, 100.1, 100.2, 100.3], color: 'accent' },
            ],
          },
          options: [
            'It catches each swing early',
            'It buys after each rise and sells after each fall, losing a little plus costs on most round trips',
            'It does nothing, because the average is flat',
            'It makes money because there are many trades',
          ],
          answer: 1,
          why: 'Because the average lags, each cross comes after price has already moved, and in a range the move then reverses. Many small losses plus the spread on every trade.',
        },
        {
          kind: 'number',
          id: 'charts-averages-9',
          ask: 'A crossover rule trades 100 shares and makes 12 round trips on a range day. Spread and slippage cost 0.05 per share per round trip. What do costs alone take, in dollars?',
          answer: 60,
          check: '12 * 0.05 * 100',
          why: '12 × 0.05 × 100 = 60 dollars before any losses from the trades themselves. Rules that trade often need a large edge per trade to cover this.',
        },
        {
          kind: 'write',
          id: 'charts-averages-10',
          ask: 'Write `count_crosses(prices, ma)` that counts how many times price moves from one side of the average to the other. `ma` has `None` where the average is not ready yet; skip those bars.',
          starter: `def count_crosses(prices, ma):
    # a cross: the sign of (price - ma) changes from one ready bar to the next
    pass`,
          solution: `def count_crosses(prices, ma):
    count = 0
    prev = None
    for p, m in zip(prices, ma):
        if m is None:
            continue
        side = p > m
        if prev is not None and side != prev:
            count += 1
        prev = side
    return count`,
          tests: `out = count_crosses([1, 3, 1, 3], [2, 2, 2, 2])
assert out is not None, "the function returns nothing yet"
assert out == 3, f"1, 3, 1, 3 around 2 crosses three times, got {out}"
assert count_crosses([1, 2, 3, 4], [0, 0, 0, 0]) == 0, "price always above the average never crosses"
assert count_crosses([5, 1, 3, 1], [None, None, 2, 2]) == 1, "skip the bars where the average is None"
assert count_crosses([3], [2]) == 0, "one bar cannot cross"`,
          why: 'Track which side of the average price is on and count the changes. This is the count the figure shows, and on a range day it is a quick measure of how much a crossover rule would churn.',
        },
        {
          kind: 'choice',
          id: 'charts-averages-11',
          ask: 'A news site says a "golden cross" on SPY, the 50-day average crossing above the 200-day, is "bullish". What is the honest reading?',
          options: [
            'A reliable buy signal that institutions follow',
            'A description that the recent average is above the longer one; tests of such rules show weak and unstable results once you account for how many rules were tried',
            'A sell signal, because everyone already knows',
            'Meaningless, because averages are not real prices',
          ],
          answer: 1,
          why: 'It records that prices over the last 50 days averaged more than over the last 200. That is a fact about the past. Any claim that it predicts needs a test with costs, on data the rule was not chosen on.',
        },
      ],
    },
    {
      id: 'charts-indicators',
      title: 'ATR and RSI: what indicators can tell you',
      summary: 'Measuring how far price moves and how one-sided it has been, and the limits of any indicator.',
      text: [
        'The **true range** of a bar is the largest of three distances: high − low, |high − previous close| and |low − previous close|. The last two count a gap: if price closed at 100 and the next bar trades between 96 and 98, the true range is 4, not 2.',
        'The **average true range** (ATR) is the average of recent true ranges, usually 14 bars. The common version (Wilder\'s) starts with the plain mean of the first 14 and then updates `ATR = (previous ATR × 13 + new TR) ÷ 14`. ATR is in dollars and says how far price usually moves in one bar. It says nothing about direction. Traders use it to size stops, set zone widths and judge whether a target is realistic.',
        'The **relative strength index** (RSI) measures how one-sided recent moves were. Over `n` bars (usually 14), take the average gain on up bars and the average loss on down bars, both as positive numbers. `RS = average gain ÷ average loss` and `RSI = 100 − 100 ÷ (1 + RS)`. It runs from 0 to 100.',
        { code: `rs = avg_gain / avg_loss
rsi = 100 - 100 / (1 + rs)` },
        'RSI above 70 is called **overbought** and below 30 **oversold**. These are labels, not instructions. In a strong trend RSI can stay above 70 for hours while price keeps rising. Selling because RSI reads 75 is betting against the very move it measures.',
        'Every indicator is a formula applied to past prices and volume. It compresses what is on the chart and adds no new information. Two indicators built from the same closes agreeing is one fact counted twice. Whether any of them predicts is an empirical question, and most do little on their own once costs are counted. Test before trusting.',
      ],
      rules: [
        'True range = max(high − low, |high − previous close|, |low − previous close|).',
        'ATR is the average true range: the size of a usual move in dollars, with no direction.',
        'RSI = 100 − 100 ÷ (1 + average gain ÷ average loss).',
        'Overbought and oversold are labels. RSI can stay above 70 through a strong trend.',
        'An indicator is a summary of past prices. It adds no information that is not on the chart.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'charts-indicators-1',
          ask: 'The previous close was 100. Today\'s bar has high 103 and low 101. What is its true range?',
          answer: 3,
          check: 'max(103 - 101, abs(103 - 100), abs(101 - 100))',
          why: 'The candidates are 2, 3 and 1. The gap up from 100 to 101 is part of the move, so the true range is 3, from the previous close to the high.',
        },
        {
          kind: 'number',
          id: 'charts-indicators-2',
          ask: 'The previous close was 100. The next bar gaps down and trades between 96 and 98. What is its true range?',
          answer: 4,
          check: 'max(98 - 96, abs(98 - 100), abs(96 - 100))',
          why: 'High − low is only 2, but price travelled from 100 down to 96: |96 − 100| = 4. Without the previous close, ATR would ignore gaps and understate risk.',
        },
        {
          kind: 'number',
          id: 'charts-indicators-3',
          ask: 'Over 14 bars the average gain is 1.5 and the average loss is 0.5. What is the RSI?',
          answer: 75,
          check: '100 - 100 / (1 + 1.5 / 0.5)',
          why: 'RS = 1.5 ÷ 0.5 = 3, so RSI = 100 − 100 ÷ 4 = 75. Gains have been three times the size of losses.',
        },
        {
          kind: 'number',
          id: 'charts-indicators-4',
          ask: 'A 14-bar ATR (Wilder\'s method) is 2.00. The new bar\'s true range is 3.40. What is the new ATR?',
          answer: 2.1,
          check: '(2.00 * 13 + 3.40) / 14',
          why: '(2.00 × 13 + 3.40) ÷ 14 = 29.40 ÷ 14 = 2.10. One wide bar moves ATR by a tenth: it is slow to react, by design.',
        },
        {
          kind: 'output',
          id: 'charts-indicators-5',
          ask: 'Bars as (high, low, close). What does this print?',
          code: `bars = [(101, 99, 100), (103, 101, 102), (101, 97, 98)]
trs = []
for i in range(1, len(bars)):
    h, l, _ = bars[i]
    prev_close = bars[i - 1][2]
    trs.append(max(h - l, abs(h - prev_close), abs(l - prev_close)))
print(trs)`,
          answer: '[3, 5]',
          why: 'Bar 2: max(2, 3, 1) = 3. Bar 3: max(4, 1, 5) = 5, because the low of 97 is 5 below the previous close of 102. The first bar has no previous close, so the loop starts at 1.',
        },
        {
          kind: 'bug',
          id: 'charts-indicators-6',
          ask: 'This true range is right on gap-up days but too small on gap-down days.',
          code: `def true_range(h, l, prev_close):
    a = h - l
    b = abs(h - prev_close)
    c = l - prev_close
    return max(a, b, c)`,
          line: 4,
          fix: '    c = abs(l - prev_close)',
          why: 'On a gap down the low is below the previous close, so `l - prev_close` is negative and never wins the `max`. The distance needs `abs`.',
        },
        {
          kind: 'choice',
          id: 'charts-indicators-7',
          ask: 'On a steady up day, 5-minute RSI has been above 70 for three hours. What does that tell you?',
          options: [
            'Price must fall soon, because it is overbought',
            'Up moves have been much larger than down moves for a long time; it says nothing reliable about the next bar',
            'The RSI is broken',
            'Buy more, because RSI above 70 means strength will continue',
          ],
          answer: 1,
          why: 'RSI measures how one-sided the recent moves were. A trend is one-sided by definition, so RSI stays high. Fading it because of the label is betting against the move it describes.',
        },
        {
          kind: 'choice',
          id: 'charts-indicators-8',
          ask: 'A stock\'s 5-minute ATR rises from 0.50 to 1.00. You keep the same 0.60 stop. What has changed?',
          options: [
            'Nothing: the stop is the same in dollars',
            'The stop is now less than one usual bar away, so ordinary noise is far more likely to hit it',
            'The stock is about to go up',
            'The stop is now safer',
          ],
          answer: 1,
          why: 'ATR doubled, so bars move twice as far. A 0.60 stop was 1.2 ATR and is now 0.6 ATR. Either widen the stop and trade fewer shares, or accept being stopped out by noise more often.',
        },
        {
          kind: 'number',
          id: 'charts-indicators-9',
          ask: 'You buy at 450.00 and put your stop 1.5 ATR below the entry. The 5-minute ATR is 0.80. Where is the stop?',
          answer: 448.8,
          tol: 0.005,
          check: '450.00 - 1.5 * 0.80',
          why: '1.5 × 0.80 = 1.20 below 450: 448.80. Tying the stop to ATR keeps it outside ordinary noise however quiet or busy the stock is.',
        },
        {
          kind: 'write',
          id: 'charts-indicators-10',
          ask: 'Write `rsi(closes, n)` using the plain average of the last `n` price changes (not Wilder\'s smoothing). Return 100.0 when there were no losses.',
          starter: `def rsi(closes, n):
    # changes: closes[i] - closes[i - 1], use only the last n of them
    # average gain and average loss: sum of each divided by n, losses as positive numbers
    pass`,
          solution: `def rsi(closes, n):
    changes = [b - a for a, b in zip(closes[:-1], closes[1:])][-n:]
    avg_gain = sum(c for c in changes if c > 0) / n
    avg_loss = sum(-c for c in changes if c < 0) / n
    if avg_loss == 0:
        return 100.0
    rs = avg_gain / avg_loss
    return 100 - 100 / (1 + rs)`,
          tests: `out = rsi([10, 11, 12, 11, 12], 4)
assert out is not None, "the function returns nothing yet"
assert abs(out - 75) < 1e-9, f"changes +1, +1, -1, +1 give RS 3 and RSI 75, got {out}"
assert rsi([1, 2, 3, 4], 3) == 100.0, "no losses should give 100"
assert abs(rsi([4, 3, 2, 1], 3)) < 1e-9, "no gains should give 0"
assert rsi([5, 1, 2, 3, 4, 5], 4) == 100.0, "use only the last n changes: the early drop is outside the window"
assert abs(rsi([10, 12, 11, 13, 12], 4) - 66.6667) < 1e-3, "gains 2 and 2, losses 1 and 1: RS 2, RSI 66.67"`,
          hint: '`zip(closes[:-1], closes[1:])` pairs each close with the next one.',
          why: 'RSI is a ratio of average up moves to average down moves, squeezed into 0 to 100. Platforms usually use Wilder\'s smoothing, so their numbers differ a little from this plain version; the idea is the same.',
        },
        {
          kind: 'choice',
          id: 'charts-indicators-11',
          ask: 'RSI and the stochastic oscillator both read "overbought" on the same chart. Is that two pieces of evidence?',
          options: [
            'Yes, two indicators agreeing doubles the confidence',
            'No: both are computed from the same recent prices, so they mostly agree by construction',
            'Yes, because they use different formulas',
            'No, because the stochastic is always wrong',
          ],
          answer: 1,
          why: 'Both measure where price sits relative to its recent moves. Stacking indicators built from the same closes adds lines, not information.',
        },
        {
          kind: 'design',
          id: 'charts-indicators-12',
          ask: 'Someone claims "buy SPY when 5-minute RSI drops below 30". Plan how you would find out whether that has any edge before risking money.',
          checklist: [
            { point: 'Exact rules: RSI version and length, entry on the close of the signal bar, exit rule and stop', why: 'A vague rule cannot be tested and can always be reinterpreted.' },
            { point: 'Enough signals over different kinds of days, not one good week', why: 'A handful of trades is mostly luck.' },
            { point: 'Spread, commissions and slippage on every trade', why: 'Short-term rules often have edges smaller than their costs.' },
            { point: 'A comparison with entries at random times with the same exits', why: 'Shows whether the RSI condition adds anything beyond being in the market.' },
            { point: 'Settings fixed before checking on data not used to choose them', why: 'Tuning the length and threshold on the same data overfits.' },
            { point: 'Paper trading the rule before using real money, then the smallest size', why: 'Live fills and your own behaviour differ from a test.' },
          ],
          why: 'An indicator rule is a hypothesis. The module on testing an edge goes into detail; the point here is that a label like "oversold" is not evidence.',
        },
      ],
    },
    {
      id: 'charts-gaps',
      title: 'Gaps and the opening range',
      summary: 'What happened overnight, the first minutes of the session, and the opening range as a pair of levels.',
      widget: 'charts-range',
      text: [
        'US regular trading runs from 9:30 to 16:00 Eastern time. News arrives overnight, futures and premarket trading move, and the stock often opens away from yesterday\'s close. That jump is a **gap**: `open − previous close`, and in percent, divided by the previous close.',
        'A gap up that opens above yesterday\'s high leaves the whole of yesterday\'s range behind it; one that opens inside yesterday\'s range is smaller. A **gap fill** means price trades back to yesterday\'s close. "Gaps always fill" is folklore: many do not fill that day, and how often they do depends on the instrument and the size of the gap. Measure it before relying on it.',
        'The first minutes are the most active and the least orderly. Volume is heavy, spreads on shares and especially options are at their widest, and price can swing both ways quickly. Many traders wait before acting.',
        'The **opening range** is the high and low of the first `N` minutes, commonly 5, 15 or 30. It is known only when those minutes have ended. After that, its high and low act as two levels: a close above or below is a break, and a close back inside soon after is a failed break.',
        { code: `first = bars[:15]                     # the first fifteen 1-minute bars
or_high = max(b.high for b in first)
or_low = min(b.low for b in first)` },
        'Compare the opening range with the daily ATR. A range that already covers most of a usual day leaves less room to run. How to trade a break is a setup, covered in the day trading module. Here the range is a measurement and a pair of levels, not a signal.',
      ],
      rules: [
        'Gap = open − previous close. In percent, divide by the previous close.',
        "A gap fill means trading back to yesterday's close. Gaps do not always fill.",
        'The opening range is the high and low of the first N minutes, known only after those minutes end.',
        'Measure the opening range against the daily ATR.',
        'The first minutes have the widest spreads and the fastest moves.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'charts-gaps-1',
          ask: 'SPY closed at 450.00 and opens at 454.50. What is the gap as a percentage (for example 2%)?',
          answer: 0.01,
          tol: 0.0005,
          check: '(454.50 - 450.00) / 450.00',
          why: '4.50 ÷ 450 = 0.01, a 1% gap up. Percentages let you compare gaps across stocks at different prices.',
        },
        {
          kind: 'number',
          id: 'charts-gaps-2',
          ask: 'SPY closed at 450.00 and opens at 446.40. What is the gap in dollars (negative for a gap down)?',
          answer: -3.6,
          tol: 0.005,
          check: '446.40 - 450.00',
          why: '446.40 − 450.00 = −3.60. A fill would mean trading back up to 450.00.',
        },
        {
          kind: 'choice',
          id: 'charts-gaps-3',
          ask: "Yesterday's high was 452.00 and the close was 450.00. Today the stock opens at 453.00. Which describes it?",
          options: [
            "A gap up that opens above yesterday's whole range",
            "A gap up that opens inside yesterday's range",
            'A gap down',
            'No gap, because it is only 1 dollar above the high',
          ],
          answer: 0,
          why: "The open (453) is above yesterday's high (452), so nothing from yesterday's range overlaps. The gap is still measured from the close: 3 dollars.",
        },
        {
          kind: 'number',
          id: 'charts-gaps-4',
          ask: 'The first five 1-minute bars have highs 452.10, 452.60, 452.40, 452.90, 452.70 and lows 451.50, 451.80, 451.70, 452.20, 452.30. How wide is the 5-minute opening range, in dollars?',
          answer: 1.4,
          tol: 0.005,
          check: 'max(452.10, 452.60, 452.40, 452.90, 452.70) - min(451.50, 451.80, 451.70, 452.20, 452.30)',
          why: 'Highest high 452.90, lowest low 451.50: 1.40 wide. The high and low come from different bars, as they usually do.',
        },
        {
          kind: 'output',
          id: 'charts-gaps-5',
          ask: 'Bars as (time, high, low). What does this print?',
          code: `bars = [("09:30", 452.1, 451.5), ("09:31", 452.6, 451.8),
        ("09:32", 452.9, 452.2), ("09:33", 453.4, 452.6),
        ("09:34", 453.0, 452.4), ("09:35", 454.0, 453.1)]
n = 5
first = bars[:n]
high = max(b[1] for b in first)
low = min(b[2] for b in first)
print(high, low)`,
          answer: '453.4 451.5',
          why: 'Only the first five bars, 9:30 to 9:34, are in the 5-minute range. The 9:35 bar at 454.0 comes after the range is set: it is the first trade above it, not part of it.',
        },
        {
          kind: 'bug',
          id: 'charts-gaps-6',
          ask: 'This opening range is always far too narrow, and sometimes its low is above its high.',
          code: `def opening_range(bars, n):
    # bars: (time, high, low), one per minute from 09:30
    first = bars[:n]
    high = max(b[1] for b in first)
    low = max(b[2] for b in first)
    return high, low`,
          line: 5,
          fix: '    low = min(b[2] for b in first)',
          why: 'The low of the range is the lowest low, so it needs `min`. Taking the highest low gives a level inside the range, narrowing it.',
        },
        {
          kind: 'choice',
          id: 'charts-gaps-7',
          ask: 'In the figure, on Day A, compare the 15-minute and 30-minute opening ranges. What do you see?',
          options: [
            'The 15-minute range breaks above and is back inside within 10 minutes; the 30-minute range is wider, breaks later and holds',
            'Both ranges give the same levels',
            'The 30-minute range breaks first',
            'Neither range is ever broken',
          ],
          answer: 0,
          why: 'A longer range takes in more of the early swings, so it is wider and broken later. On this made-up day that filtered out a failed break, but on Day B with 30 minutes the break fails instead. No length is right on every day.',
        },
        {
          kind: 'number',
          id: 'charts-gaps-8',
          ask: 'The 30-minute opening range is 3.00 wide. The daily ATR is 6.00. What fraction of a usual day has the opening range already covered?',
          answer: 0.5,
          check: '3.00 / 6.00',
          why: 'Half a usual day in the first half hour. A break may still run, but there is less room than on a day with a narrow opening range.',
        },
        {
          kind: 'choice',
          id: 'charts-gaps-9',
          ask: 'You use a 15-minute opening range. At 9:40 price trades above the highest price so far. What is it?',
          options: [
            'A break of the 15-minute opening range',
            'Not a break: the range is not set until 9:45, so this is a new high inside it',
            'A gap fill',
            'A failed break',
          ],
          answer: 1,
          why: 'The 15-minute range covers 9:30 to 9:45. A move at 9:40 becomes part of the range. Treating the range as known before it ends is lookahead.',
        },
        {
          kind: 'write',
          id: 'charts-gaps-10',
          ask: "Write `gap_filled(prev_close, open_, high, low)`, where high and low are the session's so far. Return True if the gap has filled. With no gap there is nothing to fill: return False.",
          starter: `def gap_filled(prev_close, open_, high, low):
    # gap up: filled once the low reaches the previous close
    # gap down: filled once the high reaches the previous close
    pass`,
          solution: `def gap_filled(prev_close, open_, high, low):
    if open_ > prev_close:
        return low <= prev_close
    if open_ < prev_close:
        return high >= prev_close
    return False`,
          tests: `out = gap_filled(450.0, 454.5, 455.0, 452.0)
assert out is not None, "the function returns nothing yet"
assert out is False, "a gap up whose low is 452 has not come back to 450"
assert gap_filled(450.0, 454.5, 455.0, 449.9) is True, "a gap up filled once the low reaches 450"
assert gap_filled(450.0, 446.4, 450.0, 445.0) is True, "a gap down filled once the high touches 450"
assert gap_filled(450.0, 446.4, 449.0, 445.0) is False, "a gap down whose high is 449 has not filled"
assert gap_filled(450.0, 450.0, 451.0, 449.0) is False, "no gap, nothing to fill"`,
          why: 'Which side to check depends on the direction of the gap. Writing this out is the first step to counting how often gaps on your instrument really fill, instead of trusting the saying.',
        },
        {
          kind: 'design',
          id: 'charts-gaps-11',
          ask: 'SPY is up 1.2% in premarket after strong economic news. Write your plan for the first 30 minutes.',
          checklist: [
            { point: 'The gap measured in dollars, percent and against the daily ATR', why: 'A gap that is already most of a usual day changes what is realistic.' },
            { point: "Levels marked: yesterday's close and high, premarket high and low", why: "They are where the gap fill or the continuation will be tested." },
            { point: 'No trade until the chosen opening range is complete', why: 'The first minutes are the most erratic and the most expensive to trade.' },
            { point: 'Option spreads checked before any order', why: 'Spreads are widest at the open, and crossing them is a cost every time.' },
            { point: 'Both scenarios written: the gap holds and extends, or it fails toward the fill', why: 'Deciding only one story in advance makes you blind to the other.' },
            { point: 'Smaller size than on a normal morning', why: 'Wider swings need a wider stop, and fewer contracts keep the dollar risk the same.' },
          ],
          why: 'Gap mornings feel urgent. A written plan, measured against the usual day and with both outcomes in mind, keeps the urgency from making the decisions.',
        },
        {
          kind: 'choice',
          id: 'charts-gaps-12',
          ask: 'A forum post says "gaps always fill, so short every gap up at the open". What is the honest response?',
          options: [
            'Correct, gaps always fill eventually',
            'Many gaps do not fill on the day; how often they do depends on the instrument and gap size, and has to be measured with costs',
            'Correct for SPY but not for single stocks',
            'Gaps never fill',
          ],
          answer: 1,
          why: '"Eventually" can mean weeks, which is no use to a day trader, and a short against a gap that keeps running can lose a lot. Count it on your own data first.',
        },
      ],
    },
    {
      id: 'charts-lab',
      title: 'Lab: an indicator toolkit in Python',
      summary: 'Resampling, SMA, EMA, session VWAP, ATR and the opening range, from scratch and checked step by step.',
      text: [
        'Charting platforms compute indicators for you, but you cannot backtest a rule, or trust one, until you can compute it yourself and know exactly which bars it uses. This lab builds a small toolkit in plain Python: lists of tuples in, lists of numbers out.',
        'The pieces are the ones from this module: grouping 1-minute bars into longer bars, the simple and exponential moving averages, VWAP that resets each session, true range and ATR with Wilder\'s smoothing, and the opening range. Each returns `None` where it does not have enough data yet, rather than a made-up number.',
        'Two habits run through it. First, every value at bar `i` uses only bars up to and including `i`, so the same code can be used in a backtest without seeing the future. Second, you test each function on a case small enough to work out by hand.',
        'Your numbers will not always match a platform to the cent. Platforms seed EMAs and ATRs differently and may include premarket trades. That is expected; know which choice you made.',
      ],
      rules: [
        'Resample: first open, highest high, lowest low, last close, total volume; drop an unfinished group.',
        'Return `None` until an indicator has enough bars. Never invent the early values.',
        'A value at bar i may use bars up to i and nothing after.',
        'VWAP resets each session. ATR uses the previous close.',
        'Test every function on a case you can work out by hand.',
        'Small differences from your platform usually come from seeding and session settings.',
      ],
      questions: [
        {
          kind: 'write',
          id: 'charts-lab-1',
          ask: 'Step 1: resampling. Group bars of (open, high, low, close, volume) into bars `n` times longer. Drop a final group that has fewer than `n` bars: it is not finished.',
          starter: `def resample(bars, n):
    # bars: list of (o, h, l, c, v), oldest first
    # returns a list of (o, h, l, c, v), one per complete group of n
    pass`,
          solution: `def resample(bars, n):
    out = []
    for start in range(0, len(bars) - n + 1, n):
        g = bars[start:start + n]
        out.append((g[0][0], max(b[1] for b in g), min(b[2] for b in g), g[-1][3], sum(b[4] for b in g)))
    return out`,
          tests: `bars = [(10, 11, 9, 10.5, 100), (10.5, 12, 10, 11, 200), (11, 11.5, 8, 9, 300),
        (9, 10, 8.5, 9.5, 100), (9.5, 9.8, 9.1, 9.6, 50)]
out = resample(bars, 2)
assert out is not None, "the function returns nothing yet"
assert len(out) == 2, f"5 bars in groups of 2 make 2 complete bars, the fifth is unfinished; got {len(out)}"
assert out[0] == (10, 12, 9, 11, 300), f"the first group is (10, 12, 9, 11, 300), got {out[0]}"
assert out[1] == (11, 11.5, 8, 9.5, 400), f"the second group is (11, 11.5, 8, 9.5, 400), got {out[1]}"
assert resample(bars, 5) == [(10, 12, 8, 9.6, 750)], "all five bars in one group"
assert resample(bars, 6) == [], "not enough bars for one group"`,
          why: 'Stepping `start` by `n` and stopping when a full group no longer fits drops the unfinished bar. Keeping it would put a bar on your chart whose close is not yet a close.',
        },
        {
          kind: 'write',
          id: 'charts-lab-2',
          ask: 'Step 2: the SMA. Return a list as long as `values`, with `None` for the first `n − 1` positions and the mean of the last `n` values after that.',
          starter: `def sma(values, n):
    pass`,
          solution: `def sma(values, n):
    out = []
    for i in range(len(values)):
        if i < n - 1:
            out.append(None)
        else:
            out.append(sum(values[i - n + 1:i + 1]) / n)
    return out`,
          tests: `out = sma([1, 2, 3, 4, 5], 3)
assert out is not None, "the function returns nothing yet"
assert len(out) == 5, "one value per input, so it lines up with the bars"
assert out[:2] == [None, None], f"the first n - 1 values are None, got {out[:2]}"
assert out[2:] == [2.0, 3.0, 4.0], f"means of (1,2,3), (2,3,4), (3,4,5), got {out[2:]}"
assert sma([5, 7], 1) == [5.0, 7.0], "an SMA of length 1 is the price itself"
assert sma([1, 2], 3) == [None, None], "not enough values for any average"`,
          why: 'Keeping the output the same length as the input, with `None` padding, means `sma(closes, n)[i]` always belongs to bar `i`. Lists that start at the first full window are where off-by-one bugs come from.',
        },
        {
          kind: 'write',
          id: 'charts-lab-3',
          ask: 'Step 3: the EMA. Same length as `values`. `None` before position `n − 1`, the SMA of the first `n` at position `n − 1`, then `α × value + (1 − α) × previous` with `α = 2 ÷ (n + 1)`.',
          starter: `def ema(values, n):
    alpha = 2 / (n + 1)
    pass`,
          solution: `def ema(values, n):
    alpha = 2 / (n + 1)
    out = [None] * len(values)
    if len(values) < n:
        return out
    out[n - 1] = sum(values[:n]) / n
    for i in range(n, len(values)):
        out[i] = alpha * values[i] + (1 - alpha) * out[i - 1]
    return out`,
          tests: `out = ema([2, 4, 6, 8, 16], 3)
assert out is not None, "the function returns nothing yet"
assert len(out) == 5, "one value per input"
assert out[:2] == [None, None], f"None before position n - 1, got {out[:2]}"
assert abs(out[2] - 4) < 1e-9, f"seed with the SMA of the first 3 values, 4, got {out[2]}"
assert abs(out[3] - 6) < 1e-9, f"alpha is 0.5, so 0.5 * 8 + 0.5 * 4 = 6, got {out[3]}"
assert abs(out[4] - 11) < 1e-9, f"0.5 * 16 + 0.5 * 6 = 11, got {out[4]}"
assert ema([1, 2], 3) == [None, None], "not enough values to seed"`,
          why: 'Seeding with the SMA is one common choice; seeding with the first price is another. After a few multiples of `n` bars the seed hardly matters, which is why platforms agree later in the series.',
        },
        {
          kind: 'write',
          id: 'charts-lab-4',
          ask: 'Step 4: VWAP by session. Bars are (day, high, low, close, volume). Return the running VWAP for each bar, starting again whenever the day changes.',
          starter: `def session_vwap(bars):
    # typical price (h + l + c) / 3; running totals reset when the day changes
    pass`,
          solution: `def session_vwap(bars):
    out = []
    day = None
    pv = vol = 0.0
    for d, h, l, c, v in bars:
        if d != day:
            day, pv, vol = d, 0.0, 0.0
        pv += (h + l + c) / 3 * v
        vol += v
        out.append(pv / vol)
    return out`,
          tests: `bars = [("mon", 10, 10, 10, 100), ("mon", 13, 13, 13, 200),
        ("tue", 20, 20, 20, 50), ("tue", 22, 22, 22, 50)]
out = session_vwap(bars)
assert out is not None, "the function returns nothing yet"
assert len(out) == 4, "one value per bar"
assert abs(out[0] - 10) < 1e-9 and abs(out[1] - 12) < 1e-9, f"Monday: 10, then (1000 + 2600) / 300 = 12, got {out[:2]}"
assert abs(out[2] - 20) < 1e-9, f"Tuesday starts again at its own first price, 20, got {out[2]}: reset the totals"
assert abs(out[3] - 21) < 1e-9, f"Tuesday's second bar: equal volumes average to 21, got {out[3]}"`,
          why: "Without the reset, Tuesday's VWAP would be dragged toward Monday's prices. Resetting on a change of day is the whole difference between a session VWAP and a long-run average.",
        },
        {
          kind: 'write',
          id: 'charts-lab-5',
          ask: "Step 5: ATR with Wilder's smoothing. Bars are (high, low, close). The first bar's true range is high − low. `None` before position `n − 1`, the mean of the first `n` true ranges at `n − 1`, then `(previous × (n − 1) + TR) ÷ n`.",
          starter: `def atr(bars, n):
    # true range: max(h - l, |h - previous close|, |l - previous close|)
    pass`,
          solution: `def atr(bars, n):
    trs = []
    for i, (h, l, c) in enumerate(bars):
        if i == 0:
            trs.append(h - l)
        else:
            pc = bars[i - 1][2]
            trs.append(max(h - l, abs(h - pc), abs(l - pc)))
    out = [None] * len(bars)
    if len(bars) < n:
        return out
    out[n - 1] = sum(trs[:n]) / n
    for i in range(n, len(bars)):
        out[i] = (out[i - 1] * (n - 1) + trs[i]) / n
    return out`,
          tests: `bars = [(11, 9, 10), (12, 10, 11), (11, 7, 8), (9, 8, 8.5)]
out = atr(bars, 2)
assert out is not None, "the function returns nothing yet"
assert len(out) == 4, "one value per bar"
assert out[0] is None, "None before position n - 1"
assert abs(out[1] - 2) < 1e-9, f"true ranges 2 and 2 average to 2, got {out[1]}"
assert abs(out[2] - 3) < 1e-9, f"the third true range is max(4, 0, 4) = 4, so (2 * 1 + 4) / 2 = 3, got {out[2]}"
assert abs(out[3] - 2) < 1e-9, f"the fourth true range is max(1, 1, 0) = 1, so (3 + 1) / 2 = 2, got {out[3]}"
gap = atr([(10, 10, 10), (7, 6, 6.5)], 2)
assert abs(gap[1] - 2) < 1e-9, "a gap down from 10 to a high of 7 is a true range of 4: use the previous close"`,
          why: "Wilder's smoothing is an EMA with α = 1/n, so ATR reacts slowly. Starting with the plain mean is the classic seed; some platforms seed differently, so early values can differ.",
        },
        {
          kind: 'write',
          id: 'charts-lab-6',
          ask: 'Step 6: the opening range. Bars are 1-minute (high, low) from 9:30, in order. Return `(high, low)` of the first `minutes` bars, or `None` if fewer than `minutes` bars have finished: the range is not known yet.',
          starter: `def opening_range(bars, minutes):
    pass`,
          solution: `def opening_range(bars, minutes):
    if len(bars) < minutes:
        return None
    first = bars[:minutes]
    return max(b[0] for b in first), min(b[1] for b in first)`,
          tests: `bars = [(452.1, 451.5), (452.6, 451.8), (452.9, 452.2), (453.4, 452.6), (453.0, 452.4), (454.0, 453.1)]
out = opening_range(bars, 5)
assert out is not None, "the function returns nothing yet, or None with enough bars"
assert out == (453.4, 451.5), f"the 5-minute range is (453.4, 451.5), got {out}: do not include the sixth bar"
assert opening_range(bars, 6) == (454.0, 451.5), "with 6 minutes the sixth bar counts"
assert opening_range(bars[:3], 5) is None, "after only 3 minutes a 5-minute range is not known yet"`,
          why: 'Returning `None` until the range is complete makes lookahead impossible: a backtest cannot trade a break of a range that does not exist yet.',
        },
        {
          kind: 'output',
          id: 'charts-lab-7',
          ask: 'Step 7: check the averages by hand. What does this print?',
          code: `def sma(values, n):
    return [None if i < n - 1 else sum(values[i - n + 1:i + 1]) / n for i in range(len(values))]

def ema(values, n):
    a = 2 / (n + 1)
    out = [None] * len(values)
    out[n - 1] = sum(values[:n]) / n
    for i in range(n, len(values)):
        out[i] = a * values[i] + (1 - a) * out[i - 1]
    return out

v = [2, 4, 6, 8, 16]
print(sma(v, 3)[-1], ema(v, 3)[-1])`,
          answer: '10.0 11.0',
          why: 'SMA: (6 + 8 + 16) ÷ 3 = 10. EMA with α = 0.5: seed 4, then 6, then 0.5 × 16 + 0.5 × 6 = 11. The EMA gives the jump to 16 more weight, so it is closer to the last price.',
        },
        {
          kind: 'bug',
          id: 'charts-lab-8',
          ask: 'Step 8: a signal on top of the toolkit. It should mark bars where the close crosses above the average. The backtest built on it looks far too good.',
          code: `def cross_up(closes, avg):
    # avg[i] is the average of bars up to and including bar i
    out = []
    for i in range(1, len(closes) - 1):
        if closes[i] > avg[i + 1] and closes[i - 1] <= avg[i - 1]:
            out.append(i)
    return out`,
          line: 5,
          fix: '        if closes[i] > avg[i] and closes[i - 1] <= avg[i - 1]:',
          why: '`avg[i + 1]` includes the next bar\'s close, which is not known at bar `i`. That is lookahead: the signal quietly uses the future, so the backtest looks better than any live result could.',
        },
        {
          kind: 'design',
          id: 'charts-lab-9',
          ask: 'Step 9: before you use the toolkit in a backtest, how do you make sure it is right?',
          checklist: [
            { point: 'Hand-worked cases for every function, kept as tests', why: 'A small case you can check on paper catches most formula slips.' },
            { point: 'A comparison against your charting platform on the same bars', why: 'Large differences point to a bug; small ones usually to seeding.' },
            { point: 'The seeding of EMA and ATR written down', why: 'It explains differences from other tools and keeps results reproducible.' },
            { point: 'Session boundaries and time zone handled, and whether premarket is included', why: 'VWAP and the opening range depend on where the session starts.' },
            { point: 'A check that no value at bar i uses bars after i', why: 'Lookahead is the most common way a backtest lies.' },
            { point: 'Missing or unfinished bars handled with None, not filled in', why: 'Invented values become invented signals.' },
          ],
          why: 'Indicators are simple formulas, which makes it easy to trust them without checking. The bugs that matter most, lookahead and wrong sessions, do not crash: they make results look better.',
        },
      ],
    },
  ],
}
