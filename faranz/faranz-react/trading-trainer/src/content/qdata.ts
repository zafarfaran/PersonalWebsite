import type { Module } from '../types'

export const qdata: Module = {
  id: 'qdata',
  title: 'Market data in Python',
  summary:
    'The raw material of every strategy and the mistakes that poison it: bars, ticks and quotes as NumPy arrays, corporate actions, cleaning, bar types, bias in data, futures and option data, and where data comes from, ending with a cleaning pipeline built from scratch.',
  lessons: [
    {
      id: 'qdata-arrays',
      title: 'Bars, ticks and quotes as arrays',
      summary: 'OHLCV as columns of numbers, timestamps in UTC, New York sessions, and joining trades to the quote in force.',
      text: [
        'Research code holds market data as **columns**: one NumPy array per field, all the same length. A year of 1-minute bars for one stock is a timestamp array and five float arrays (open, high, low, close, volume), about 98,000 rows each. Columns let you write `close[1:] / close[:-1] - 1` once instead of looping, and a float64 costs 8 bytes, so you can size a data set in your head. pandas, which most people use, is a labelled wrapper around the same arrays.',
        'Store time as an integer count from a fixed origin: seconds or nanoseconds since 1970-01-01 **UTC** (the Unix epoch), or `np.datetime64`. The `algo` module said to store UTC and convert to New York time for session rules. The conversion moves twice a year: New York is UTC−5 in winter and UTC−4 from the second Sunday of March to the first Sunday of November (in 2026, 8 March and 1 November). The regular session is 9:30 to 16:00 New York time, 390 minutes; some days before holidays close early at 13:00. Check the exchange calendar rather than assume.',
        'Know how each bar is **labelled**. A 5-minute bar stamped 10:00 may cover 10:00 to 10:05 (labelled by its start) or 9:55 to 10:00 (labelled by its end). Read the vendor documentation and test it: if you read start labels as end labels, every decision uses a close from five minutes later.',
        '**Ticks** are irregular events: trades (time, price, size) and quotes (time, bid, ask, sizes). To know the quote in force when a trade printed, take the last quote at or before the trade time, an **as-of join**. In NumPy that is `np.searchsorted(quote_time, trade_time, side="right") - 1`. Forget the `- 1` and every trade is matched to the next quote, which had not arrived yet.',
        { code: `import numpy as np

q_time = np.array([0, 5, 9])          # quote arrival, seconds
t_time = np.array([3, 5, 10])         # trade times
print(np.searchsorted(q_time, t_time, side="right") - 1)   # [0 1 2]` },
        'Check every bar before using it: high at least the larger of open and close, low at most the smaller, high at least low, volume not negative, timestamps strictly increasing, no `nan`. A bar that fails is a data error, and one bad high can set a stop, a breakout level or an ATR for weeks.',
      ],
      rules: [
        'One NumPy array per field; 8 bytes per float64 value.',
        'Store times in UTC; New York is UTC−5 in winter, UTC−4 in summer. Never hard-code one offset.',
        'Find out whether bars are labelled by their start or their end.',
        'As-of join: searchsorted with side="right", then subtract 1. Never match a trade to a later quote.',
        'Check OHLC consistency, volume, order of time and nan before anything else touches the data.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'qdata-arrays-1',
          ask: 'How many 1-minute bars does one US stock have in a year of regular sessions, taking 252 full trading days of 9:30 to 16:00?',
          answer: 98280,
          check: '252 * 6.5 * 60',
          why: '6.5 hours is 390 minutes, and 390 × 252 = 98,280. Early closes and holidays change it a little; premarket and after hours add more if you keep them.',
        },
        {
          kind: 'number',
          id: 'qdata-arrays-2',
          ask: 'You store those 98,280 bars as six float64 columns (time, open, high, low, close, volume). How many megabytes is that, taking 1 MB as 1,000,000 bytes? Give two decimals.',
          answer: 4.72,
          tol: 0.006,
          check: '98280 * 6 * 8 / 1e6',
          why: '98,280 × 6 × 8 bytes ≈ 4.72 MB for one stock-year. For 500 stocks over 10 years that is about 23.6 GB: bars fit on a laptop, ticks for the same universe do not.',
        },
        {
          kind: 'choice',
          id: 'qdata-arrays-3',
          ask: 'A 1-minute bar is stamped 13:30 UTC on 6 July 2026. What time is that in New York?',
          options: ['8:30, premarket', '9:30, the open', '10:30', '13:30'],
          answer: 1,
          why: 'In July New York is on daylight saving time, UTC−4, so 13:30 UTC is 9:30. The same stamp in January would be 8:30, premarket. A script that hard-codes UTC−5 mislabels the open for about eight months of each year.',
        },
        {
          kind: 'output',
          id: 'qdata-arrays-4',
          ask: 'An epoch timestamp converted to UTC and to New York winter time. What does this print?',
          code: `from datetime import datetime, timedelta, timezone

ts = 1767623400                       # seconds since 1970-01-01 UTC (5 January 2026)
t = datetime.fromtimestamp(ts, tz=timezone.utc)
ny = t.astimezone(timezone(timedelta(hours=-5)))
print(t.strftime('%H:%M'), ny.strftime('%H:%M'))`,
          answer: '14:30 09:30',
          why: 'In January the open, 9:30 New York, is 14:30 UTC. In real code use `zoneinfo.ZoneInfo("America/New_York")` so the offset follows daylight saving by itself; the fixed offset here is only right in winter.',
        },
        {
          kind: 'output',
          id: 'qdata-arrays-5',
          ask: 'Trades joined to the quote in force. What does this print?',
          code: `import numpy as np

q_time = np.array([0, 5, 9])
bid = np.array([99.00, 99.50, 99.20])
ask = np.array([99.10, 99.60, 99.40])
t_time = np.array([3, 5, 10])
i = np.searchsorted(q_time, t_time, side='right') - 1
mid = (bid[i] + ask[i]) / 2
print(i.tolist(), mid.round(2).tolist())`,
          answer: '[0, 1, 2] [99.05, 99.55, 99.3]',
          why: 'The trade at 3 seconds sees the quote from 0; the trade at 5 sees the quote that arrived at 5 (side="right" counts a quote at the same time as already in force); the trade at 10 sees the quote from 9.',
        },
        {
          kind: 'bug',
          id: 'qdata-arrays-6',
          ask: 'This should give, for each trade, the mid of the last quote at or before it. Trades classified with it look far better informed than they are.',
          code: `import numpy as np

def quote_mid_at(q_time, bid, ask, t_time):
    i = np.searchsorted(q_time, t_time, side='right')
    i = np.minimum(i, len(q_time) - 1)
    return (bid[i] + ask[i]) / 2`,
          line: 4,
          fix: "    i = np.searchsorted(q_time, t_time, side='right') - 1",
          why: 'searchsorted returns where the trade time would be inserted, which is the index of the first quote after it. Without `- 1` each trade sees the next quote, often the one the trade itself caused. That is lookahead inside the data join, before any strategy runs.',
        },
        {
          kind: 'choice',
          id: 'qdata-arrays-7',
          ask: "Your vendor labels 5-minute bars by their start: the bar stamped 10:00 covers 10:00 to 10:05. Your code assumes stamps are ends, so at 10:00 it decides using the close of the bar stamped 10:00. What has gone wrong?",
          options: [
            'Nothing: the label does not change the prices',
            'Each decision at 10:00 uses a close printed at 10:05: five minutes of lookahead on every bar',
            'Entries are five minutes late, which costs a little slippage',
            'Volume is counted twice',
          ],
          answer: 1,
          why: 'Reading a start label as an end label moves every close five minutes into the past, so the backtest trades on prices that did not exist yet. The opposite mistake makes entries late. Check the convention by comparing a bar with the trades inside it, or with a session boundary such as the 9:30 open.',
        },
        {
          kind: 'number',
          id: 'qdata-arrays-8',
          ask: 'A quote is bid $99.98, ask $100.02. What is the spread as a share of the mid, in basis points (1 bp = 0.01%)?',
          answer: 4,
          tol: 0.01,
          check: '(100.02 - 99.98) / 100.00 * 1e4',
          why: '0.04 ÷ 100.00 = 0.0004 = 4 bp. Storing bid and ask, not only trades, lets you charge each simulated trade the spread it would really have paid.',
        },
        {
          kind: 'write',
          id: 'qdata-arrays-9',
          numpy: true,
          ask: 'Write `bad_bars(o, h, l, c, v)`: return a boolean array, True where a bar fails a check: high below the larger of open and close, low above the smaller, volume negative, or any of the five values `nan`.',
          starter: `import numpy as np

def bad_bars(o, h, l, c, v):
    o, h, l, c, v = (np.asarray(a, dtype=float) for a in (o, h, l, c, v))
    pass`,
          solution: `import numpy as np

def bad_bars(o, h, l, c, v):
    o, h, l, c, v = (np.asarray(a, dtype=float) for a in (o, h, l, c, v))
    bad = (h < np.maximum(o, c)) | (l > np.minimum(o, c)) | (v < 0)
    bad |= np.isnan(o) | np.isnan(h) | np.isnan(l) | np.isnan(c) | np.isnan(v)
    return bad`,
          tests: `out = bad_bars([10, 10], [11, 11], [9, 9], [10.5, 10.5], [100, 100])
assert out is not None, "the function returns nothing yet"
assert out.tolist() == [False, False], f"good bars must pass, got {out.tolist()}"
o = [10, 10, 10, 10, 10]
h = [11, 10.2, 11, 11, float('nan')]
l = [9, 9, 10.1, 9, 9]
c = [10.5, 10.5, 10.5, 10.5, 10.5]
v = [100, 100, 100, -5, 100]
got = bad_bars(o, h, l, c, v).tolist()
assert got[1], "bar 1: high 10.2 is below the close 10.5"
assert got[2], "bar 2: low 10.1 is above the open 10"
assert got[3], "bar 3: negative volume"
assert got[4], "bar 4: a nan high"
assert not got[0], "bar 0 is fine"`,
          why: 'Comparisons with `nan` are always False, so a `nan` slips through every other check unless you test for it on its own. Run this on every file you load and count the failures before deciding what to do with them.',
        },
        {
          kind: 'write',
          id: 'qdata-arrays-10',
          numpy: true,
          ask: 'Write `in_session(minute_utc, offset_hours)`: `minute_utc` is an array of minutes after midnight UTC (0 to 1439), `offset_hours` is New York\'s offset from UTC that day (−5 or −4). Return True where the New York time is from 9:30 up to but not including 16:00.',
          starter: `import numpy as np

def in_session(minute_utc, offset_hours):
    m = np.asarray(minute_utc)
    pass`,
          solution: `import numpy as np

def in_session(minute_utc, offset_hours):
    m = np.asarray(minute_utc)
    local = (m + 60 * offset_hours) % 1440
    return (local >= 570) & (local < 960)`,
          tests: `out = in_session(np.array([870, 869, 1259, 1260]), -5)
assert out is not None, "the function returns nothing yet"
assert out.tolist() == [True, False, True, False], f"winter: 14:30 UTC is the open, 21:00 UTC is the close (excluded), got {out.tolist()}"
summer = in_session(np.array([810, 870, 1199, 1200]), -4)
assert summer.tolist() == [True, True, True, False], f"summer: the session is 13:30 to 20:00 UTC, got {summer.tolist()}"
assert in_session(np.array([30]), -5).tolist() == [False], "00:30 UTC is 19:30 the evening before in New York: wrap with % 1440"`,
          why: '9:30 is minute 570 and 16:00 is minute 960 of the New York day. The `% 1440` wraps minutes before midnight UTC back into the previous New York day. The offset is an argument because it changes with the date.',
        },
        {
          kind: 'design',
          id: 'qdata-arrays-11',
          ask: 'You will keep ten years of 1-minute bars and the best bid and ask at each minute for 300 US stocks and ETFs. Describe how you lay out and check the data.',
          checklist: [
            { point: 'One array or column per field, timestamps as UTC integers', why: 'Fast, compact and free of time zone ambiguity.' },
            { point: 'Record whether bars are labelled by start or end, and keep that convention everywhere', why: 'Mixed conventions shift every join by one bar.' },
            { point: 'Keep extended hours separate from, or flagged apart from, the regular session', why: 'Premarket bars are thin and distort session statistics such as the open and VWAP.' },
            { point: 'A trading calendar with holidays and early closes, by date', why: 'Without it, missing days look like data gaps and half days look like broken sessions.' },
            { point: 'Checks on load: OHLC consistency, negative volume, nan, duplicate and unsorted timestamps', why: 'Bad rows found at load cost nothing; found in a backtest they cost a week.' },
            { point: 'Storage estimate before downloading: rows × columns × 8 bytes', why: 'About 98,000 minute rows per symbol-year; quotes and ticks are far larger.' },
            { point: 'One file or partition per symbol and month, in a binary format such as Parquet or NumPy .npy', why: 'Loading only what a test needs keeps research fast; text files are slow and lose precision.' },
          ],
          why: 'Layout decisions are cheap at the start and expensive to change later. Most data bugs come from time: labels, zones, sessions and order.',
        },
      ],
    },
    {
      id: 'qdata-corporate',
      title: 'Corporate actions: splits, dividends and total return',
      summary: 'Why a raw price history lies about returns, how to adjust it, and when you need the unadjusted prices after all.',
      widget: 'qdata-adjust',
      text: [
        'A **split** changes the number of shares, not the value of the company. NVIDIA split 10-for-1 after the close on 7 June 2024: it had closed near $1,209 and opened split-adjusted trading on 10 June near $121. A return computed from those raw closes is about −90%, a loss no shareholder had. A **reverse split** (1-for-10) does the opposite and shows a fake +900%.',
        'To **split-adjust**, divide every price before the split date by the ratio and multiply every volume before it by the ratio. Adjusting the past (**back-adjusting**) keeps the latest prices equal to what you see quoted today. Returns from adjusted prices are the real ones; the adjustment only removes the jump.',
        'A cash **dividend** is paid to whoever holds the shares before the **ex-dividend date**. On that date the price opens lower by about the dividend, because new buyers will not get it. The **price return** ignores the cash; the **total return** includes it: `(P1 + D) ÷ P0 − 1`. Over decades the gap is large: dividends have been a big part of the long-run return of US stocks.',
        'Data vendors fold dividends in with a factor. The common method, used by CRSP and by the Adjusted Close on Yahoo Finance, multiplies every price before the ex-date by `1 − D ÷ P`, with P the close the day before the ex-date. Returns from the adjusted series then include the dividend. The levels, though, are numbers that never traded, and they change every time a new dividend is paid.',
        'So keep both. Use adjusted prices for returns, volatility and anything that compounds. Use **unadjusted** prices for anything about price levels at the time: a "price above $5" filter, round numbers, limit prices, option strikes, share counts and tick sizes. The safe design stores raw prices and a table of corporate actions, and computes the adjustment in your own code, so a backtest run today and next year sees the same numbers. Identify a company by a permanent id, not its ticker: tickers change on mergers and renames.',
      ],
      rules: [
        'Raw prices show fake returns at every split and every ex-dividend date.',
        'Split-adjust: divide earlier prices by the ratio, multiply earlier volumes by it.',
        'Total return = (P1 + D) ÷ P0 − 1. Price return leaves out the dividend.',
        'Dividend factor: multiply earlier prices by 1 − D ÷ (close before the ex-date).',
        'Adjusted prices for returns; unadjusted for levels, filters, strikes and share counts.',
        'Store raw prices plus an actions table; adjust in your own code.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'qdata-corporate-1',
          ask: 'A stock closes at $400, splits 4-for-1, and closes the next day at $101. A backtest on raw closes records −74.75% for that day. What was the real return? Give a percentage, for example 25%.',
          answer: 0.01,
          check: '101 / (400 / 4) - 1',
          why: 'The $400 close is $100 in post-split shares, so the day made 1%. One unadjusted split in a ten-year file can wreck the whole equity curve and every volatility estimate around it.',
        },
        {
          kind: 'number',
          id: 'qdata-corporate-2',
          ask: 'A stock split 3-for-1 last year. A bar from before the split shows a close of $600 and volume of 200,000 shares. What is the split-adjusted close, in dollars?',
          answer: 200,
          check: '600 / 3',
          why: '$600 ÷ 3 = $200. The volume becomes 600,000 shares, so the dollar value traded, 200,000 × $600 = 600,000 × $200, is unchanged. Adjust prices without volumes and every volume filter breaks at the split.',
        },
        {
          kind: 'number',
          id: 'qdata-corporate-3',
          ask: 'A stock closes at $50.00 the day before its ex-dividend date. On the ex-date it closes at $49.60 and pays a dividend of $0.50. What is the total return for the ex-date? Give a percentage, for example 25%.',
          answer: 0.002,
          tol: 0.00005,
          check: '(49.60 + 0.50) / 50.00 - 1',
          why: '(49.60 + 0.50) ÷ 50.00 − 1 = 0.2%. The price return is −0.8%, a loss that is mostly the dividend leaving the share price for your account.',
        },
        {
          kind: 'number',
          id: 'qdata-corporate-4',
          ask: 'The close before an ex-date is $80.00 and the dividend is $0.80. By what factor does the CRSP-style method multiply every earlier price? Give 4 decimals.',
          answer: 0.99,
          tol: 0.00005,
          check: '1 - 0.80 / 80.00',
          why: '1 − 0.80 ÷ 80 = 0.99. Every earlier price shrinks by 1%, so the return across the ex-date, computed on adjusted prices, no longer shows the drop caused by the dividend.',
        },
        {
          kind: 'output',
          id: 'qdata-corporate-5',
          ask: 'A 2-for-1 split takes effect at index 2. What does this print?',
          code: `import numpy as np

p = np.array([100.0, 102.0, 51.0, 52.0])
adj = p.copy()
adj[:2] /= 2
print(adj.tolist(), (adj[1:] / adj[:-1] - 1).round(3).tolist())`,
          answer: '[50.0, 51.0, 51.0, 52.0] [0.02, 0.0, 0.02]',
          why: 'Only the prices before the split date are divided. The split day now shows 0% instead of −50%, and the other returns are untouched: adjustment changes levels, never true returns.',
        },
        {
          kind: 'bug',
          id: 'qdata-corporate-6',
          ask: 'This should back-adjust closes for a list of splits, each `(i, ratio)` meaning the split takes effect at index i. After adjusting, the return on each split day is still wrong.',
          code: `import numpy as np

def split_adjust(close, splits):
    adj = np.asarray(close, dtype=float).copy()
    for i, ratio in splits:
        adj[:i + 1] /= ratio
    return adj`,
          line: 6,
          fix: '        adj[:i] /= ratio',
          why: 'The price at index i is already in post-split shares, so only indices before i are divided. Dividing it too moves the jump one day later instead of removing it.',
        },
        {
          kind: 'choice',
          id: 'qdata-corporate-7',
          ask: 'Your rule from 2015 traded only stocks priced above $5 that day. You test it on fully adjusted closes downloaded today. A stock that traded at $12 in 2015 and has since split 4-for-1 and paid dividends shows about $2.90 for that day. What happens?',
          options: [
            'Nothing: adjusted prices are always right for backtests',
            'The test wrongly excludes the stock: the filter must use the price that actually traded then',
            'The test wrongly includes the stock',
            'The filter should use the adjusted price, since that is what the stock is worth today',
          ],
          answer: 1,
          why: 'Price filters, round-number levels, strikes and limit prices are about the price on the screen at the time, which is the unadjusted one. Returns come from adjusted prices; levels from raw ones.',
        },
        {
          kind: 'choice',
          id: 'qdata-corporate-8',
          ask: 'In the figure, choose **Raw** and look at day 250. Then choose **Split-adjusted**. What does the raw series do to a backtest?',
          options: [
            'Nothing: the chart is only shifted',
            'It shows a one-day loss of about 75% that never happened, so a long strategy holding that day looks ruined and a short one looks brilliant',
            'It lowers all returns slightly',
            'It shows a gain on the split day',
          ],
          answer: 1,
          why: 'A 4-for-1 split cuts the quoted price to a quarter. Any return, stop or indicator that crosses the split on raw data sees a crash. Every strategy that held through it is mis-scored.',
        },
        {
          kind: 'choice',
          id: 'qdata-corporate-9',
          ask: 'In the figure, choose **Total return** and raise the dividend yield from 0% to 4%. What happens to the gap between the total return line and the split-adjusted price line?',
          options: [
            'It stays at zero: dividends are already in the price',
            'It grows steadily with time: the price line leaves out each dividend, the total return line reinvests it',
            'It only appears on the ex-dividend dates and then vanishes',
            'The total return line falls below the price line',
          ],
          answer: 1,
          why: 'Each ex-date drops the price by about the dividend; the total return series keeps that cash invested. The gap compounds. Comparing a strategy on total returns with a benchmark on price returns, or the reverse, is a common unfair test.',
        },
        {
          kind: 'write',
          id: 'qdata-corporate-10',
          numpy: true,
          ask: 'Write `total_return_index(close, div)`: `div[t]` is the dividend whose ex-date is day t (0 on most days). Return an index that starts at 1.0 and multiplies by `(close[t] + div[t]) / close[t − 1]` each day after the first.',
          starter: `import numpy as np

def total_return_index(close, div):
    close = np.asarray(close, dtype=float)
    div = np.asarray(div, dtype=float)
    return close / close[0]`,
          solution: `import numpy as np

def total_return_index(close, div):
    close = np.asarray(close, dtype=float)
    div = np.asarray(div, dtype=float)
    growth = (close[1:] + div[1:]) / close[:-1]
    return np.concatenate([[1.0], np.cumprod(growth)])`,
          tests: `out = total_return_index([50.0, 49.6, 49.6], [0, 0.5, 0])
assert out is not None, "the function returns nothing yet"
assert len(out) == 3, f"one value per day, got {len(out)}"
assert abs(out[0] - 1) < 1e-12, "the index starts at 1.0"
assert abs(out[1] - 50.1 / 50) < 1e-12, f"the ex-date adds the dividend back: (49.6 + 0.5) / 50, got {out[1]}"
assert abs(out[2] - 50.1 / 50) < 1e-12, "a flat day after the ex-date leaves the index unchanged"
p = np.array([10.0, 11.0, 12.1])
assert np.allclose(total_return_index(p, np.zeros(3)), p / 10), "with no dividends the index is close / close[0]"`,
          why: 'The dividend is counted on its ex-date, the day the price drops for it, so the drop and the cash cancel. Counting it on the payment date, weeks later, leaves a false loss on the ex-date and a false gain later.',
        },
        {
          kind: 'write',
          id: 'qdata-corporate-11',
          numpy: true,
          ask: 'Write `dividend_adjust(close, div)`: return a copy of `close` where, for every day t with `div[t] > 0`, all prices before t are multiplied by `1 − div[t] / close[t − 1]` (using the unadjusted close). Apply each dividend in turn.',
          starter: `import numpy as np

def dividend_adjust(close, div):
    close = np.asarray(close, dtype=float)
    div = np.asarray(div, dtype=float)
    adj = close.copy()
    return adj`,
          solution: `import numpy as np

def dividend_adjust(close, div):
    close = np.asarray(close, dtype=float)
    div = np.asarray(div, dtype=float)
    adj = close.copy()
    for t in np.nonzero(div)[0]:
        if t > 0:
            adj[:t] *= 1 - div[t] / close[t - 1]
    return adj`,
          tests: `out = dividend_adjust([80.0, 79.2, 80.0], [0, 0.8, 0])
assert out is not None, "the function returns nothing yet"
assert np.allclose(out, [79.2, 79.2, 80.0]), f"80 x 0.99 = 79.2 before the ex-date, later prices unchanged, got {out.tolist()}"
c = np.array([100.0, 100.0, 98.0, 98.0, 97.0])
d = np.array([0, 0, 2.0, 0, 1.0])
a = dividend_adjust(c, d)
want = c.copy(); want[:2] *= 0.98; want[:4] *= 1 - 1 / 98
assert np.allclose(a, want), f"two dividends: each scales every earlier price, got {a.tolist()}"
assert abs(a[-1] - 97) < 1e-12, "the latest price is never changed"`,
          why: 'The latest price stays as quoted and history shrinks. Because each new dividend rescales all earlier prices, an adjusted file downloaded next year has different numbers for 2015 than one downloaded today: store raw prices and the dividends, not someone else\'s adjusted column.',
        },
        {
          kind: 'design',
          id: 'qdata-corporate-12',
          ask: 'A colleague backtested ten years of a dividend-paying stock with limit orders at round numbers, using one column of adjusted closes from a free source. List what may be wrong and how you would rebuild the data.',
          checklist: [
            { point: 'Round-number limit prices were applied to adjusted prices that never traded', why: 'Levels must come from unadjusted prices.' },
            { point: 'Only closes: no adjusted open, high or low, so intraday fills were guessed', why: 'Mixing an adjusted close with unadjusted highs and lows can put the close outside the bar.' },
            { point: 'Get raw OHLCV and a list of splits and dividends with ex-dates', why: 'Raw data plus actions lets you adjust for any purpose yourself.' },
            { point: 'Compute returns from your own adjusted series and check them across each split and ex-date', why: 'One missed action creates a fake ±50% or larger day.' },
            { point: 'Freeze a copy of the data used for the test', why: 'Adjusted histories change with every new dividend, so the test must be reproducible.' },
            { point: 'Compare the benchmark on the same basis: total return against total return', why: 'A price-return benchmark against a total-return strategy flatters the strategy.' },
          ],
          why: 'Corporate actions are the most common reason for a fake big day in a backtest. The fix is a data design, not a patch.',
        },
      ],
    },
    {
      id: 'qdata-cleaning',
      title: 'Cleaning: gaps, bad ticks, stale prices and alignment',
      summary: 'Filling missing bars without lookahead, catching bad prints with medians, spotting stale prices, and lining up two series on time.',
      widget: 'qdata-badticks',
      text: [
        'A missing 1-minute bar in a thin stock usually means **no trades**, not missing data. Fill it by carrying the last close forward as open, high, low and close, with volume 0. Never fill backwards or interpolate between the bars either side: both use a price from the future. Keep a flag for filled bars so that no signal fires on them.',
        'A **bad tick** is a print far from its neighbours that was never a real price for you: a keying error, a mis-reported trade, a late report of an old trade. The usual detector compares each price with the **median** of a window and scales by the **median absolute deviation** (MAD): flag when `|p − median| > k × 1.4826 × MAD`. The factor 1.4826 makes MAD comparable to a standard deviation for normal data. The mean and standard deviation are useless here: one spike drags the mean and inflates the standard deviation so much that the spike scores below 3.',
        { code: `import numpy as np

w = np.array([100, 101, 100, 102, 150, 101, 100.0])
med = np.median(w); mad = np.median(np.abs(w - med))
print((150 - med) / (1.4826 * mad), (150 - w.mean()) / w.std())   # 33.05 against 2.45` },
        'A real move and a bad tick look alike for one print. The difference is **persistence**: a bad tick reverts at once, a real gap stays, with volume and with the quote moving too. In live trading you only have the past, so the window must be trailing. Cleaning history afterwards may use a centred window, but then the same rule cannot run live. Never delete large real moves: the fat tails from the quant module are real, and removing them hides your true risk.',
        'A **stale price** is one that has not changed because nothing traded: a thin stock, an option strike nobody touched since the morning, a holiday in one market. Returns from stale prices understate volatility and create false patterns: a stale series appears to lag a live one. Count runs of identical prices, and for options compare the last trade with the current bid and ask.',
        '**Aligning** two series means putting them on the same timestamps. An inner join keeps only times present in both (`np.intersect1d(t1, t2, return_indices=True)`); an as-of join carries each series\' last value forward. Markets that close at different times need care: a Tokyo close and a New York close on the same date are fourteen or more hours apart, which creates an apparent lead from New York to Tokyo that no one can trade.',
      ],
      rules: [
        'Fill gaps forward only: last close as OHLC, volume 0, and a flag. Never interpolate.',
        'Bad ticks: |p − median| > k × 1.4826 × MAD over a trailing window.',
        'One spike inflates the standard deviation enough to hide itself. Use median and MAD.',
        'Bad ticks revert; real moves persist with volume. Do not delete real crashes.',
        'Count runs of unchanged prices; stale prices fake low volatility and false lead-lag.',
        'Join on common timestamps, and know when each market closes.',
      ],
      questions: [
        {
          kind: 'choice',
          id: 'qdata-cleaning-1',
          ask: 'Bars at 10:01 and 10:04 exist; 10:02 and 10:03 have no trades. A colleague fills them by linear interpolation between the 10:01 and 10:04 closes. What is wrong?',
          options: [
            'Nothing: interpolation is smoother than carrying forward',
            'The filled bars contain the 10:04 price, which was not known at 10:02 or 10:03: lookahead',
            'Interpolation is too slow for large files',
            'The filled bars should have the average volume',
          ],
          answer: 1,
          why: 'An interpolated 10:02 close leans towards the 10:04 close, so any signal computed at 10:02 knows a little of the future. Carry the last close forward with zero volume, which is what a trader watching the screen would have seen.',
        },
        {
          kind: 'output',
          id: 'qdata-cleaning-2',
          ask: 'A forward fill in NumPy without a loop. What does this print?',
          code: `import numpy as np

x = np.array([10.0, np.nan, np.nan, 11.0, np.nan])
idx = np.where(~np.isnan(x), np.arange(len(x)), 0)
idx = np.maximum.accumulate(idx)
print(x[idx].tolist())`,
          answer: '[10.0, 10.0, 10.0, 11.0, 11.0]',
          why: 'Each position gets the index of the last non-missing value at or before it: `np.where` writes the own index where there is data, and `maximum.accumulate` carries the largest index so far forward. A leading `nan` would stay `nan`, which is right: there is nothing to carry.',
        },
        {
          kind: 'bug',
          id: 'qdata-cleaning-3',
          ask: 'This forward fill should carry the last real value into each gap. Instead it returns the first value everywhere.',
          code: `import numpy as np

def ffill(x):
    x = np.asarray(x, dtype=float)
    idx = np.where(np.isnan(x), np.arange(len(x)), 0)
    idx = np.maximum.accumulate(idx)
    return x[idx]`,
          line: 5,
          fix: '    idx = np.where(~np.isnan(x), np.arange(len(x)), 0)',
          why: 'The mask is inverted: it records the positions of the gaps, not of the data, so the accumulated index points at gaps or at 0. Test cleaning functions on a tiny hand-made array whose answer you know.',
        },
        {
          kind: 'number',
          id: 'qdata-cleaning-4',
          ask: 'Prices in a window: 100, 101, 100, 102, 150, 101, 100. The median is 101 and the MAD is 1. What is the median-based score of the 150 print, (150 − median) ÷ (1.4826 × MAD)? Give one decimal.',
          answer: 33.1,
          tol: 0.06,
          check: '(150 - 101) / (1.4826 * 1)',
          why: '49 ÷ 1.4826 ≈ 33.1: far beyond any sensible threshold. The median and MAD barely notice the spike, so it stands out against them.',
        },
        {
          kind: 'number',
          id: 'qdata-cleaning-5',
          ask: 'Same seven prices. What is the ordinary z-score of the 150 print, (150 − mean) ÷ standard deviation (population, `ddof=0`)? Give two decimals.',
          answer: 2.45,
          tol: 0.006,
          check: '(150 - np.mean([100, 101, 100, 102, 150, 101, 100])) / np.std([100, 101, 100, 102, 150, 101, 100])',
          why: 'About 2.45: a "3 standard deviations" filter would let this obvious bad tick through. The spike raised the mean and blew up the standard deviation it is measured against. That is why cleaning uses medians.',
        },
        {
          kind: 'choice',
          id: 'qdata-cleaning-6',
          ask: 'In the figure, set k to 2. Then set k to 10. Watch the bad ticks caught and the real prices flagged. Which describes the trade-off?',
          options: [
            'Lower k catches everything and costs nothing',
            'Low k flags real prices too, especially right after the real jump; high k misses the smaller bad ticks',
            'k makes no difference because the median ignores spikes',
            'High k flags more points than low k',
          ],
          answer: 1,
          why: 'Every threshold trades missed errors against false alarms. Right after a genuine jump the trailing median still sits at the old level, so the new real prices look like outliers until the window catches up. That is why a flag should be confirmed by persistence and volume before a price is thrown away.',
        },
        {
          kind: 'write',
          id: 'qdata-cleaning-7',
          numpy: true,
          ask: 'Write `flag_bad_ticks(p, window, k)`: for each t from `window` onwards, take the previous `window` prices `p[t − window:t]`, their median m and MAD, and flag t when `|p[t] − m| > k × 1.4826 × MAD`. If the MAD is 0, do not flag. The first `window` points are never flagged. Return a boolean array.',
          starter: `import numpy as np

def flag_bad_ticks(p, window, k):
    p = np.asarray(p, dtype=float)
    flags = np.zeros(len(p), dtype=bool)
    return flags`,
          solution: `import numpy as np

def flag_bad_ticks(p, window, k):
    p = np.asarray(p, dtype=float)
    flags = np.zeros(len(p), dtype=bool)
    for t in range(window, len(p)):
        w = p[t - window:t]
        m = np.median(w)
        mad = np.median(np.abs(w - m))
        if mad > 0 and abs(p[t] - m) > k * 1.4826 * mad:
            flags[t] = True
    return flags`,
          tests: `p = np.array([100, 101, 100, 102, 101, 150, 101, 100, 99, 101.0])
out = flag_bad_ticks(p, 5, 5)
assert out is not None, "the function returns nothing yet"
assert out.tolist() == [False] * 5 + [True] + [False] * 4, f"only the 150 print is bad, got {out.tolist()}"
q = p.copy(); q[3] = 500
assert not flag_bad_ticks(q, 5, 5)[3], "the first window points are never flagged"
flat = np.array([100.0] * 6 + [100.5])
assert not flag_bad_ticks(flat, 5, 5).any(), "a MAD of 0 must not flag"
r = np.array([100, 101, 100, 102, 101, 103, 140, 101.0])
f = flag_bad_ticks(r, 5, 5)
assert f[6] and not f[7], f"the window is trailing: the bad print at 6 is caught, and 7 is judged on prices 2 to 6, got {f.tolist()}"`,
          why: 'A trailing window uses only what was known before each print, so the same function can run live. The zero-MAD guard matters on quiet stocks where the price does not move for a whole window; any change would otherwise score infinity.',
        },
        {
          kind: 'number',
          id: 'qdata-cleaning-8',
          ask: 'You mark an option position at its last trade, $2.10, printed at 10:05. It is now 15:30 and the quote is $2.40 bid, $2.60 ask. By how many dollars per contract does the last trade understate the mid? (One contract is 100 shares.)',
          answer: 40,
          check: '((2.40 + 2.60) / 2 - 2.10) * 100',
          why: 'The mid is $2.50, so the stale print is $0.40 a share, $40 a contract, off. Thin strikes may not trade for hours. Mark options at the quote and know its time.',
        },
        {
          kind: 'output',
          id: 'qdata-cleaning-9',
          ask: 'The longest run of identical prices. What does this print?',
          code: `import numpy as np

p = np.array([5.0, 5.0, 5.1, 5.1, 5.1, 5.1, 5.2, 5.2])
best = run = 0
for same in np.diff(p) == 0:
    run = run + 1 if same else 0
    best = max(best, run)
print(best + 1)`,
          answer: '4',
          why: 'Three unchanged steps in a row mean four identical prices (the four 5.1s). On a liquid stock a long run in 1-minute bars points to a frozen feed, a halt or a fill-forward that never stopped.',
        },
        {
          kind: 'choice',
          id: 'qdata-cleaning-10',
          ask: "You correlate daily returns of a Tokyo index with the S&P 500 on the same calendar date and get 0.15. Tokyo's return on the next date against the S&P 500 today gives 0.45. What explains it?",
          options: [
            'A tradable lead: buy Tokyo after a strong New York day',
            'Timing: Tokyo closes before New York opens, so news from the New York session shows up in the next Tokyo close',
            'Survivorship in the index',
            'A bad tick in one series',
          ],
          answer: 1,
          why: 'The Tokyo close on a date comes about fourteen hours before the New York close of the same date. News reaches the next Tokyo session at its open, so the "lead" is mostly in the overnight gap, which you cannot capture by buying at a later close. Know when each series was stamped before reading lead-lag into it.',
        },
        {
          kind: 'write',
          id: 'qdata-cleaning-11',
          numpy: true,
          ask: 'Write `align(t1, x1, t2, x2)`: keep only the timestamps present in both sorted series and return `(t, a, b)`, the common times and each series\' values at them.',
          starter: `import numpy as np

def align(t1, x1, t2, x2):
    pass`,
          solution: `import numpy as np

def align(t1, x1, t2, x2):
    t, i, j = np.intersect1d(t1, t2, return_indices=True)
    return t, np.asarray(x1)[i], np.asarray(x2)[j]`,
          tests: `out = align(np.array([1, 2, 3, 5]), np.array([10., 20, 30, 50]), np.array([2, 3, 4, 5]), np.array([0.2, 0.3, 0.4, 0.5]))
assert out is not None, "the function returns nothing yet"
t, a, b = out
assert t.tolist() == [2, 3, 5], f"common times are 2, 3, 5, got {t.tolist()}"
assert a.tolist() == [20, 30, 50] and b.tolist() == [0.2, 0.3, 0.5], f"values must be taken at the common times, got {a.tolist()} and {b.tolist()}"
t, a, b = align(np.array([1, 2]), np.array([1., 2]), np.array([3, 4]), np.array([3., 4]))
assert len(t) == 0, "no common times gives empty arrays"`,
          why: 'Returns must be computed after aligning, from consecutive common times, or you compare a one-day return with a three-day one across a holiday that only one market had.',
        },
        {
          kind: 'design',
          id: 'qdata-cleaning-12',
          ask: 'A new vendor sends you 1-minute bars for 200 stocks. Before any research, what cleaning do you run, and what do you record?',
          checklist: [
            { point: 'Sort by time, drop exact duplicates, and report conflicting duplicates', why: 'Two different bars for one minute is a vendor error to raise, not to average.' },
            { point: 'Count missing minutes per symbol and day against the trading calendar', why: 'Thin stocks have many no-trade minutes; a liquid one with gaps signals a feed problem.' },
            { point: 'Fill gaps forward with volume 0 and a filled flag', why: 'Keeps arrays regular without inventing prices.' },
            { point: 'Flag bad ticks with a trailing median and MAD, then confirm by persistence and volume', why: 'Separates prints to remove from real moves to keep.' },
            { point: 'Look for long runs of unchanged prices', why: 'Stale data understates volatility and creates false lead-lag.' },
            { point: 'Cross-check a sample of days against a second source', why: 'Disagreement between sources finds the errors no single rule can.' },
            { point: 'Log every change made: what, where and by which rule', why: 'Cleaning is part of the result; it must be reproducible and reviewable.' },
          ],
          why: 'Cleaning decisions change results. Record them like code, apply them the same way every time, and keep the raw file.',
        },
      ],
    },
    {
      id: 'qdata-bars',
      title: 'Resampling and bar types',
      summary: 'Building bars from ticks in NumPy, and sampling by clock, trades, shares or dollars instead.',
      widget: 'qdata-bars',
      text: [
        'The charts module built 5-minute bars from 1-minute bars: first open, highest high, lowest low, last close, total volume. From ticks the same idea works with a bucket number. For time bars of `s` seconds, `bucket = t // s`; `np.unique(bucket, return_index=True)` gives where each bucket starts, and `np.maximum.reduceat(price, starts)` and `np.minimum.reduceat` give highs and lows without a loop.',
        '**Time bars** sample by the clock, but trading does not run at a steady pace. US stocks trade most heavily in the first and last half hours and least at midday, the U shape of intraday volume. Time bars therefore cut the busy open into the same number of bars as the quiet lunch, and each bar holds a very different amount of information.',
        'Bars can be sampled by activity instead. **Tick bars** close every N trades, **volume bars** every V shares, and **dollar bars** every D dollars traded (price × size). Busy periods produce more bars, quiet ones fewer. Dollar bars also stay comparable across years: 1,000 shares at $20 and at $200 are very different amounts, and a split changes share counts overnight. Marcos López de Prado popularised these bars in *Advances in Financial Machine Learning* (2018), arguing that returns sampled by activity are closer to normal and steadier in variance. Treat that as a tendency to check on your own data, not a law.',
        'Activity bars have costs. Their timestamps are irregular, so bars for two symbols do not line up on the clock. Sessions, the opening range and "the close" are clock ideas that time bars express directly. And the threshold must be set from the past: choosing D so that the whole history gives 50 bars a day uses future volume. Set it from, for example, the average daily dollar volume of the previous 20 days.',
        'Choose by the job. Time bars for anything tied to the clock, joining with other data, and execution. Activity bars for research features where you want each observation to carry a similar amount of trading. Either way, a bar is only final when it closes: for a dollar bar that is the trade that crosses the threshold.',
      ],
      rules: [
        'Time bars from ticks: bucket = t // s, then reduceat for high and low.',
        'Intraday volume is U-shaped; time bars give quiet and busy periods equal weight.',
        'Tick, volume and dollar bars close every N trades, V shares, D dollars.',
        'Dollar bars stay comparable through price changes and splits.',
        'Set thresholds from past data only.',
      ],
      questions: [
        {
          kind: 'output',
          id: 'qdata-bars-1',
          ask: 'Six trades turned into 60-second bars. What does this print?',
          code: `import numpy as np

t = np.array([3, 20, 59, 61, 90, 130])
p = np.array([10.0, 10.2, 10.1, 10.3, 9.9, 10.0])
b = t // 60
_, start = np.unique(b, return_index=True)
print(p[start].tolist(), np.maximum.reduceat(p, start).tolist(), np.minimum.reduceat(p, start).tolist())`,
          answer: '[10.0, 10.3, 10.0] [10.2, 10.3, 10.0] [10.0, 9.9, 10.0]',
          why: 'Buckets 0, 1 and 2 start at trades 0, 3 and 5. The opens are the first price in each bucket, and `reduceat` takes the max and min over each run from one start to the next. The close would be the price right before the next start.',
        },
        {
          kind: 'number',
          id: 'qdata-bars-2',
          ask: 'A stock trades about $5 billion a day on average over the last 20 days. You want about 50 dollar bars a day. What threshold do you set, in millions of dollars?',
          answer: 100,
          check: '5e9 / 50 / 1e6',
          why: '$5,000 million ÷ 50 = $100 million per bar. Computed from the previous 20 days, it is known before today starts, so it adds no lookahead. Busy days then give more bars, quiet days fewer.',
        },
        {
          kind: 'number',
          id: 'qdata-bars-3',
          ask: 'Before a 10-for-1 split you used volume bars of 1,000,000 shares. After the split, how many shares must a volume bar hold to represent the same dollar value?',
          answer: 10000000,
          check: '1_000_000 * 10',
          why: 'Each new share is worth a tenth of an old one, so ten times as many shares trade for the same money. A fixed share threshold would suddenly produce ten times as many bars; a dollar threshold does not notice the split.',
        },
        {
          kind: 'choice',
          id: 'qdata-bars-4',
          ask: 'Over ten years a stock rises from $20 to $200 with roughly constant dollar volume. Why are dollar bars better than volume bars for this history?',
          options: [
            'They are faster to compute',
            'Share volume falls as the price rises, so a fixed share count gives far fewer bars late in the history; a fixed dollar amount stays comparable',
            'Volume bars cannot be built from ticks',
            'Dollar bars remove all lookahead',
          ],
          answer: 1,
          why: 'With the same money traded at ten times the price, one tenth of the shares change hands. Volume bars would thin out by a factor of ten across the history, so early and late observations would not be comparable.',
        },
        {
          kind: 'bug',
          id: 'qdata-bars-5',
          ask: 'This should return the index of the trade that closes each volume bar. On real data it closes a bar at the first trade and then on every trade after.',
          code: `def volume_bar_ends(size, threshold):
    ends, cum = [], 0
    for i, s in enumerate(size):
        cum += s
        if cum >= threshold:
            ends.append(i)
            total = 0
    return ends`,
          line: 7,
          fix: '            cum = 0',
          why: 'The reset clears a variable nothing reads, so after the first bar the running total never falls below the threshold and every later trade closes a bar. Python does not complain about the new name; a test with a known answer catches this at once.',
        },
        {
          kind: 'write',
          id: 'qdata-bars-6',
          ask: 'Write `dollar_bar_ends(price, size, threshold)`: walk through the trades adding `price × size`; when the total reaches `threshold` or more, record that trade\'s index and reset the total to 0. Return the list of indices.',
          starter: `def dollar_bar_ends(price, size, threshold):
    ends = []
    return ends`,
          solution: `def dollar_bar_ends(price, size, threshold):
    ends, cum = [], 0.0
    for i, (p, s) in enumerate(zip(price, size)):
        cum += p * s
        if cum >= threshold:
            ends.append(i)
            cum = 0.0
    return ends`,
          tests: `out = dollar_bar_ends([10, 10, 10, 10], [50, 60, 100, 30], 1000)
assert out is not None, "the function returns nothing yet"
assert out == [1, 2], f"500 + 600 crosses 1000 at trade 1, then 1000 at trade 2, then 300 is unfinished, got {out}"
assert dollar_bar_ends([100, 200], [1, 1], 1000) == [], "no bar closes until the threshold is reached"
assert dollar_bar_ends([20, 200], [100, 10], 2000) == [0, 1], "100 shares at $20 and 10 shares at $200 are the same dollar amount"`,
          why: 'The last partial bar is not a bar: like an unfinished time bar, it must not be used until it closes. Real implementations also carry the overshoot into the next bar or split large trades; the simple reset is the common starting point.',
        },
        {
          kind: 'number',
          id: 'qdata-bars-7',
          ask: 'On a typical day 15% of the volume trades in the first 30 minutes. You build 100 volume bars a day. About how many fall in the first 30 minutes? (With 30-minute time bars, one of the 13 would.)',
          answer: 15,
          check: '0.15 * 100',
          why: 'Volume bars follow the volume, so 15% of them land in the first half hour. Time bars give that busy half hour the same single bar as a quiet half hour at lunch.',
        },
        {
          kind: 'choice',
          id: 'qdata-bars-8',
          ask: 'In the figure, switch from **Time** to **Volume** bars and read the bars per half hour. Then compare the excess kurtosis of bar returns. What do you see?',
          options: [
            'The same number of bars in every half hour for both',
            'Volume bars crowd into the open and the close, and their returns have lower excess kurtosis than time bars on this data',
            'Volume bars are spread evenly and time bars crowd into the open',
            'Volume bars have fatter tails',
          ],
          answer: 1,
          why: 'On made-up data where price moves with trading, activity bars give each bar a similar amount of movement, so returns look more normal. On real data the effect is usually there but smaller and should be measured, not assumed.',
        },
        {
          kind: 'write',
          id: 'qdata-bars-9',
          numpy: true,
          ask: 'Write `resample_ticks(t, p, v, s)`: from sorted trade times `t` (seconds), prices and sizes, build time bars of `s` seconds. Return `(start, o, h, l, c, vol)` as arrays: the start time of each bucket that has trades (`bucket × s`), open, high, low, close and summed size.',
          starter: `import numpy as np

def resample_ticks(t, p, v, s):
    t, p, v = np.asarray(t), np.asarray(p, dtype=float), np.asarray(v, dtype=float)
    pass`,
          solution: `import numpy as np

def resample_ticks(t, p, v, s):
    t, p, v = np.asarray(t), np.asarray(p, dtype=float), np.asarray(v, dtype=float)
    b = t // s
    keys, start = np.unique(b, return_index=True)
    end = np.append(start[1:], len(p)) - 1
    return (keys * s, p[start], np.maximum.reduceat(p, start),
            np.minimum.reduceat(p, start), p[end], np.add.reduceat(v, start))`,
          tests: `t = np.array([3, 20, 59, 61, 90, 130])
p = np.array([10.0, 10.2, 10.1, 10.3, 9.9, 10.0])
v = np.array([100, 200, 100, 50, 50, 10])
out = resample_ticks(t, p, v, 60)
assert out is not None, "the function returns nothing yet"
st, o, h, l, c, vol = out
assert st.tolist() == [0, 60, 120], f"bucket starts, got {st.tolist()}"
assert o.tolist() == [10.0, 10.3, 10.0], f"opens are the first trade in each bucket, got {o.tolist()}"
assert h.tolist() == [10.2, 10.3, 10.0] and l.tolist() == [10.0, 9.9, 10.0], "highs and lows over each bucket"
assert c.tolist() == [10.1, 9.9, 10.0], f"closes are the last trade in each bucket, got {c.tolist()}"
assert vol.tolist() == [400, 100, 10], f"volumes are summed, got {vol.tolist()}"`,
          why: 'Buckets with no trades do not appear: the next step, filling the clock forward, is the job of the cleaning stage. The close is the trade right before the next bucket starts, which is where most hand-written resamplers slip by one.',
        },
        {
          kind: 'output',
          id: 'qdata-bars-10',
          ask: 'How many tick bars of 4 trades, and how many volume bars of 500 shares, do these trades give?',
          code: `size = [100, 300, 50, 50, 400, 200, 100, 600, 100, 100]
ticks = len(size) // 4
vol_bars, cum = 0, 0
for s in size:
    cum += s
    if cum >= 500:
        vol_bars, cum = vol_bars + 1, 0
print(ticks, vol_bars)`,
          answer: '2 3',
          why: 'Ten trades make two complete tick bars of four. The share totals reach 500 at the fourth trade (100 + 300 + 50 + 50), then 600 at the sixth (400 + 200), then 700 at the eighth (100 + 600); the last 200 shares are an unfinished bar. One large trade can close a bar almost on its own.',
        },
        {
          kind: 'design',
          id: 'qdata-bars-11',
          ask: 'You will research a short-horizon feature on ten liquid US stocks using dollar bars from tick data. Describe how you build the bars so the research is honest.',
          checklist: [
            { point: 'Clean ticks first: drop bad prints and trades flagged as corrections or late reports', why: 'One bad tick can close a dollar bar early or set a false high.' },
            { point: 'Set each day\'s threshold from past dollar volume only, for example the previous 20 days', why: 'A threshold fitted to the whole history leaks future volume into the bars.' },
            { point: 'Decide how sessions are treated: restart bars at the open, and exclude or separate extended hours', why: 'A bar spanning the overnight gap mixes two very different periods.' },
            { point: 'Record each bar\'s open time, close time and number of trades', why: 'Irregular bars need their times kept to join with other data and to judge latency.' },
            { point: 'Use only closed bars for signals', why: 'The last partial bar changes until the threshold is crossed.' },
            { point: 'Compare results on time bars as a control', why: 'If the feature only works on one bar type, check that the difference is not an artefact.' },
          ],
          why: 'Bar construction is a modelling choice and can leak the future as surely as a bad signal. Write it down and test it like the rest.',
        },
      ],
    },
    {
      id: 'qdata-bias',
      title: 'Bias in data: survivorship, look-ahead and point-in-time',
      summary: 'The biases that live in the data itself: vanished companies, values stamped before they were known, and history that was rewritten.',
      text: [
        'The backtest module named survivorship and lookahead as bugs in a test. Many of them are already in the data before you write a line. A vendor\'s list of "all US stocks" is usually today\'s list. Companies leave it through bankruptcy, mergers, going private or being moved to another market, and a file built from the survivors quietly removes the losers. The last return matters most: a stock delisted after a collapse may lose most of its remaining value in its final days, and a data set that ends the series records nothing.',
        'Research-grade databases keep delisted securities and a **delisting return**, the return from the last trade to what holders finally received. CRSP, used in most academic work, is built this way. Even there the delisting return is sometimes missing: Shumway (1997) showed that missing values hide large losses for performance-related delistings and proposed filling them with a large negative return rather than leaving them out.',
        '**Look-ahead in the data** comes from stamping a value with the period it describes instead of the moment it became known. Earnings for a quarter ending 31 December are published weeks later. An economic figure is first released, then revised. A change to an index is announced days before it takes effect. A file that puts the final numbers on the period-end date lets every backtest trade on them early.',
        '**Point-in-time** data stores two dates with each value: the date it describes and the date it became known (the **knowledge date**). A query asks "what was known as of day d": the latest value whose knowledge date is on or before d. The same as-of search as the quote join: `np.searchsorted(known_on, d, side="right") - 1`.',
        { code: `import numpy as np

known_on = np.array([40, 130, 220])   # day each EPS figure was published
eps = np.array([1.00, 1.10, 0.90])
print(eps[np.searchsorted(known_on, 129, side="right") - 1])   # 1.0: the 1.10 is not out yet` },
        '**Restatements** rewrite history: companies correct past earnings, and many databases overwrite the old figure. A backtest then trades on numbers nobody had. Economic data has the same problem; the St. Louis Fed keeps the old releases ("vintages") in its ALFRED archive for this reason, and commercial fundamentals vendors sell point-in-time versions. Identify securities by a permanent id, such as CRSP\'s PERMNO or a FIGI, not by ticker: tickers change and are reused by different companies.',
      ],
      rules: [
        'A list of current tickers is a list of survivors. Get the delisted ones and their last returns.',
        'A missing delisting return is usually a loss, not a zero.',
        'Stamp every value with the date it became known, not the period it describes.',
        'As-of query: latest value with knowledge date ≤ d.',
        'Restated and revised data must be used as first published.',
        'Join on a permanent security id, never on ticker alone.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'qdata-bias-1',
          ask: 'A universe had 10 stocks five years ago. 8 are still listed and returned +10% each over the period. 2 were delisted after losing 90% each. A free data set shows only the 8. What was the real average return of the 10? Give a percentage, for example 25%.',
          answer: -0.1,
          check: '(8 * 0.10 + 2 * -0.90) / 10',
          why: '(8 × 10% − 2 × 90%) ÷ 10 = −10%, against +10% for the survivors. The loss is invisible in the data you downloaded, and no amount of care in the backtest code can find it.',
        },
        {
          kind: 'number',
          id: 'qdata-bias-2',
          ask: 'An equal-weight portfolio of 100 stocks. This month 3 are delisted with returns of −30% each, and the other 97 average 0%. The data set drops the delisted stocks for the month. By how much does it overstate the portfolio return? Give a percentage, for example 25%.',
          answer: 0.009,
          tol: 0.00005,
          check: '3 * 0.30 / 100',
          why: 'The true return is 3 × (−30%) ÷ 100 = −0.9%; the data set shows 0%. Less than a point a month looks small, but it repeats every month and falls exactly on the stocks a value or distress strategy buys.',
        },
        {
          kind: 'choice',
          id: 'qdata-bias-3',
          ask: 'A fundamentals file stamps each quarter\'s earnings on the last day of the quarter. Your strategy buys on 1 January the stocks whose December-quarter earnings rose most. What is wrong?',
          options: [
            'Nothing: the earnings belong to that quarter',
            'Those earnings were published weeks later, so on 1 January the strategy uses numbers no one had yet',
            'Earnings should be stamped at the start of the quarter',
            'Only the price data needs point-in-time care',
          ],
          answer: 1,
          why: 'The value describes December but becomes known in late January or February. Stamp it with its publication date, or at least with a safe lag, and query as of the trading day.',
        },
        {
          kind: 'output',
          id: 'qdata-bias-4',
          ask: 'A point-in-time query on several days at once (`nan` where nothing was known yet). What does this print?',
          code: `import numpy as np

known_on = np.array([40, 130, 220, 310])
eps = np.array([1.00, 1.10, 0.90, 1.30])
days = np.array([100, 130, 300, 20])
i = np.searchsorted(known_on, days, side='right') - 1
print(np.where(i >= 0, eps[np.maximum(i, 0)], np.nan).tolist())`,
          answer: '[1.0, 1.1, 0.9, nan]',
          why: 'Day 100 sees the figure published on day 40; day 130 sees the one published that day; day 300 the one from day 220, because 1.30 arrives on 310; day 20 is before any publication. Whether a figure published on day d can be used on day d depends on the time of day: check it.',
        },
        {
          kind: 'bug',
          id: 'qdata-bias-5',
          ask: 'This should return the latest EPS known on a given day. A backtest built on it reacts to every earnings surprise weeks before the market did.',
          code: `import numpy as np

period_end = np.array([90, 181, 273, 365])
known_on = np.array([130, 220, 310, 420])
eps = np.array([1.00, 1.10, 0.90, 1.30])

def eps_as_of(day):
    i = np.searchsorted(period_end, day, side='right') - 1
    return eps[i] if i >= 0 else np.nan`,
          line: 8,
          fix: "    i = np.searchsorted(known_on, day, side='right') - 1",
          why: 'Searching on the period end makes each figure available the day its quarter closed, about 40 days before publication here. The two dates sit side by side in the file, which is exactly why this bug is common.',
        },
        {
          kind: 'number',
          id: 'qdata-bias-6',
          ask: 'A company first reported annual EPS of $2.00 and later restated it to $1.60. The share price was $40 at the time. Your database holds only the restated figure. What P/E does the backtest use for that date?',
          answer: 25,
          check: '40 / 1.60',
          why: '$40 ÷ $1.60 = 25, while the market at the time saw 20. A value strategy would have looked at a cheaper stock than the backtest thinks; restatements tend to hit companies that are in trouble, which biases results in a consistent direction.',
        },
        {
          kind: 'write',
          id: 'qdata-bias-7',
          numpy: true,
          ask: 'Write `universe_on(day, start, end)`: stock i was listed from `start[i]` (inclusive) to `end[i]` (exclusive; `np.inf` if still listed). Return a NumPy array of the indices of stocks listed on `day`.',
          starter: `import numpy as np

def universe_on(day, start, end):
    start, end = np.asarray(start, dtype=float), np.asarray(end, dtype=float)
    return np.nonzero(end == np.inf)[0]`,
          solution: `import numpy as np

def universe_on(day, start, end):
    start, end = np.asarray(start, dtype=float), np.asarray(end, dtype=float)
    return np.nonzero((start <= day) & (day < end))[0]`,
          tests: `start = [0, 0, 50, 100]
end = [np.inf, 80, np.inf, 120]
out = universe_on(60, start, end)
assert out is not None, "the function returns nothing yet"
assert out.tolist() == [0, 1, 2], f"on day 60 stock 1 is still listed and stock 3 not yet, got {out.tolist()}"
assert universe_on(80, start, end).tolist() == [0, 2], "stock 1 is gone on its end day"
assert universe_on(110, start, end).tolist() == [0, 2, 3], "stock 3 is listed from day 100 to 119"
assert universe_on(200, start, end).tolist() == [0, 2], "delisted stocks drop out, current ones stay"`,
          why: 'Building the universe day by day from listing dates is what keeps the failures in. A strategy that selects from `universe_on(day, ...)` can buy a stock that later collapses, exactly as a real trader could.',
        },
        {
          kind: 'write',
          id: 'qdata-bias-8',
          numpy: true,
          ask: 'Write `pit_value(known_on, values, day)`: `known_on` is sorted. Return the latest value whose knowledge date is on or before `day`, or `nan` if none is known yet.',
          starter: `import numpy as np

def pit_value(known_on, values, day):
    return values[-1]`,
          solution: `import numpy as np

def pit_value(known_on, values, day):
    i = np.searchsorted(known_on, day, side='right') - 1
    return values[i] if i >= 0 else np.nan`,
          tests: `k = np.array([10, 20, 30])
v = np.array([1.0, 2.0, 3.0])
out = pit_value(k, v, 25)
assert out is not None, "the function returns nothing yet"
assert out == 2.0, f"on day 25 the value from day 20 is the latest known, got {out}"
assert pit_value(k, v, 20) == 2.0, "a value known on day 20 is usable on day 20"
assert np.isnan(pit_value(k, v, 5)), "before the first knowledge date, nothing is known: nan"
assert pit_value(k, v, 99) == 3.0, "after the last date, the last value"`,
          why: 'The one line that matters is the search on the knowledge date. Returning `nan` before the first value, rather than the first value, prevents a quiet back-fill that would leak the future into the start of the test.',
        },
        {
          kind: 'choice',
          id: 'qdata-bias-9',
          ask: 'You join price data to a news file on the ticker. A ticker you hold was used by a different company until five years ago. What happens?',
          options: [
            'Nothing: tickers are unique',
            'News and prices of two unrelated companies get mixed in the older years',
            'The join fails with an error',
            'Only the newest company appears',
          ],
          answer: 1,
          why: 'Tickers are labels that exchanges reassign, and companies change them on mergers and renames. A join on ticker silently glues two histories together. Join on a permanent id and map tickers to it by date.',
        },
        {
          kind: 'choice',
          id: 'qdata-bias-10',
          ask: 'You test a rule on "the S&P 500 stocks" from 2006 to 2026 using today\'s list of members. Which bias does this build in?',
          options: [
            'None, the index is broad',
            'Survivorship and selection: today\'s members include companies added because they grew, and leave out those removed after they fell, such as banks that failed in 2008',
            'Only look-ahead in prices',
            'A small-cap bias',
          ],
          answer: 1,
          why: 'Index membership is decided with hindsight about which companies did well. Use the historical constituents on each date, which commercial and academic sources sell; a free current list is wrong for any test that goes back in time.',
        },
        {
          kind: 'choice',
          id: 'qdata-bias-11',
          ask: 'A macro signal uses the monthly payrolls figure. Your file holds today\'s values, which include later revisions. What should the backtest use?',
          options: [
            'Today\'s revised values: they are more accurate',
            'The figure as first released, on its release date, because that is what traders reacted to',
            'An average of the first and final values',
            'Any of them: revisions are always small',
          ],
          answer: 1,
          why: 'Revised data is better economics and worse backtesting: the market moved on the first release. Archives of vintages, such as ALFRED for US economic series, exist for exactly this.',
        },
        {
          kind: 'design',
          id: 'qdata-bias-12',
          ask: 'Before testing a strategy that ranks stocks by earnings growth each month from 2005 to 2025, you audit the data for bias. What do you check?',
          checklist: [
            { point: 'The universe on each date comes from listing dates or historical constituents, not today\'s list', why: 'Otherwise the test only ever picks survivors.' },
            { point: 'Delisted stocks are present, with delisting returns, and missing ones are filled with a loss rather than dropped', why: 'Dropping them removes exactly the worst outcomes.' },
            { point: 'Every fundamental has a knowledge date, and queries are as of the trading day', why: 'Period-end stamps let the test use earnings weeks before they were published.' },
            { point: 'Figures are as first reported, not restated', why: 'Restated numbers were not available to anyone at the time.' },
            { point: 'Securities are joined on a permanent id', why: 'Ticker changes and reuse glue unrelated histories together.' },
            { point: 'Prices for returns are adjusted for splits and dividends; level filters use unadjusted prices', why: 'Corporate actions create fake returns and wrong filters.' },
            { point: 'A simple sanity test: shift the fundamentals one quarter later and see whether the result collapses', why: 'A result that depends on a few days of timing is often look-ahead, not edge.' },
          ],
          why: 'These biases all push the same way, towards better-looking results, so an unaudited backtest is not neutral: it is optimistic.',
        },
      ],
    },
    {
      id: 'qdata-derivs',
      title: 'Futures and options data',
      summary: 'Gluing futures contracts into one series without faking returns, and what an option chain snapshot does not tell you.',
      widget: 'qdata-roll',
      text: [
        'A futures contract expires, so a long history is a chain of contracts. E-mini S&P 500 futures (ES) expire quarterly, on the third Friday of March, June, September and December (month codes H, M, U, Z), and almost all trading sits in the nearest one. Traders **roll** from the expiring contract to the next one shortly before expiry. At the time of writing (2026), CME\'s customary roll date for its US equity index futures is the Monday of expiration week; before a 2022 change it was the Thursday a week before expiry. Another common rule is to roll when the next contract\'s volume overtakes the front one\'s.',
        'Two contracts trade at different prices, mostly because of carry (interest and dividends for index futures, storage for commodities). Glue raw prices together and every roll shows a jump that no one earned or lost: the **unadjusted** series. A **back-adjusted** series (the "Panama" method) adds the gap at each roll to all earlier prices, so dollar changes match what a holder made, but old prices can drift far from anything that traded, even below zero. A **ratio-adjusted** series multiplies earlier prices by the ratio instead, which keeps percentage returns right and distorts dollar ones.',
        'For research the cleanest route is to compute each day\'s return from the contract actually held and chain the returns. That includes the **roll yield**: when later contracts are dearer (**contango**), a long position keeps selling the cheap expiring contract and buying the dearer next one, and loses that difference as the new contract drifts towards spot. VIX futures are the well-known case of a market that is usually in contango.',
        'An option chain is far larger than a futures strip: an index ETF like SPY has dozens of expiries and hundreds of strikes each. Contracts are named by the OCC symbol: a root padded to six characters, the expiry as YYMMDD, C or P, and the strike × 1,000 in eight digits, so `SPY   260918C00650000` is the SPY 650 call expiring 18 September 2026.',
        'A chain **snapshot** hides a lot. The quotes on different strikes were taken at slightly different moments, and the underlying price at that moment may not be in the file. Sizes are often missing. The "last" price can be hours old on a thin strike. End-of-day files may be taken before the close: Cboe\'s DataShop end-of-day product, for example, includes a 15:45 snapshot as well as one at the close. Implied volatilities and Greeks come from the vendor\'s own model, rates and dividends. And nothing in a snapshot says whether you would have been filled at the bid, the ask or anywhere between.',
      ],
      rules: [
        'Unadjusted futures series jump at every roll. Never compute returns across a roll from them.',
        'Back-adjusted keeps dollar changes; ratio-adjusted keeps percent changes.',
        'Best for research: returns from the contract held, chained.',
        'In contango a long futures position pays roll yield; it is part of the real return.',
        'OCC symbol: root (6), YYMMDD, C/P, strike × 1,000 (8 digits).',
        'A chain snapshot lacks timing, sizes and fills. Use bid and ask with their time, never the last trade.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'qdata-derivs-1',
          ask: 'On the roll day the expiring contract settles at 5,000 and the next contract at 5,020. A month earlier the expiring contract was at 4,900. What is that earlier price in a back-adjusted (difference) series?',
          answer: 4920,
          check: '4900 + (5020 - 5000)',
          why: 'The gap of 20 points is added to every price before the roll: 4,900 + 20 = 4,920. The move from 4,920 to 5,020 now equals the 100 points a holder of the old contract made, with no jump at the roll.',
        },
        {
          kind: 'number',
          id: 'qdata-derivs-2',
          ask: 'Same contracts, ratio-adjusted instead: earlier prices are multiplied by 5,020 ÷ 5,000. What does 4,900 become? Give one decimal.',
          answer: 4919.6,
          tol: 0.06,
          check: '4900 * 5020 / 5000',
          why: '4,900 × 1.004 = 4,919.6. The percentage move to the roll, 4,900 to 5,000 = 2.04%, is preserved exactly, while the dollar move is now slightly off. Choose the method by what you measure.',
        },
        {
          kind: 'choice',
          id: 'qdata-derivs-3',
          ask: 'You will compute daily percentage returns and volatility from a 20-year continuous futures series. Which construction fits?',
          options: [
            'Unadjusted: real prices are best',
            'Back-adjusted by differences',
            'Ratio-adjusted, or returns from the held contract chained together',
            'Any of them, the differences are small',
          ],
          answer: 2,
          why: 'A difference-adjusted series can drift to small or negative prices far back, which wrecks percentage returns. Ratio adjustment, or chaining the held contract\'s own returns, keeps them right. Use back-adjusted series for dollar P&L and point-based stops.',
        },
        {
          kind: 'output',
          id: 'qdata-derivs-4',
          ask: 'Parsing an OCC option symbol. What does this print?',
          code: `sym = 'SPY   260918C00650000'
root = sym[:6].strip()
exp = '20' + sym[6:8] + '-' + sym[8:10] + '-' + sym[10:12]
kind = sym[12]
strike = int(sym[13:]) / 1000
print(root, exp, kind, strike)`,
          answer: 'SPY 2026-09-18 C 650.0',
          why: 'Six characters of root (padded with spaces), six of date, one of type, eight of strike in thousandths of a dollar. Parsing the symbol gives you the contract terms even when a vendor\'s other columns are missing or wrong.',
        },
        {
          kind: 'bug',
          id: 'qdata-derivs-5',
          ask: 'This parser reads the strike of `QQQ   261218P00480000` as 4800.0 instead of 480.0.',
          code: `def parse_occ(sym):
    root = sym[:6].strip()
    expiry = sym[6:12]
    right = sym[12]
    strike = int(sym[13:21]) / 100
    return root, expiry, right, strike`,
          line: 5,
          fix: '    strike = int(sym[13:21]) / 1000',
          why: 'The strike field is the strike times 1,000 so that it can hold three decimals. A factor of ten in the strike makes every moneyness, delta and payoff calculation nonsense while the code runs without error.',
        },
        {
          kind: 'number',
          id: 'qdata-derivs-6',
          ask: 'A VIX futures series is glued unadjusted. On the roll day the expiring contract is at 20.0 and the next one at 21.5. What return does the raw series show at the roll, if nothing else moved? Give a percentage, for example 25%.',
          answer: 0.075,
          check: '21.5 / 20.0 - 1',
          why: 'A fake +7.5% day appears at each roll in contango. A long position earned none of it; worse, the steady loss a long VIX futures holder suffers from contango disappears inside these jumps. Unadjusted series lie in both directions.',
        },
        {
          kind: 'write',
          id: 'qdata-derivs-7',
          numpy: true,
          ask: 'Write `panama(front, nxt, r)`: both arrays hold daily prices of the two contracts. Use `front` before day `r` and `nxt` from day `r` on, and add the gap `nxt[r] − front[r]` to every price before `r`.',
          starter: `import numpy as np

def panama(front, nxt, r):
    front, nxt = np.asarray(front, dtype=float), np.asarray(nxt, dtype=float)
    return np.concatenate([front[:r], nxt[r:]])`,
          solution: `import numpy as np

def panama(front, nxt, r):
    front, nxt = np.asarray(front, dtype=float), np.asarray(nxt, dtype=float)
    out = np.concatenate([front[:r], nxt[r:]])
    out[:r] += nxt[r] - front[r]
    return out`,
          tests: `front = np.array([100.0, 101, 102, 103, 104])
nxt = np.array([102.0, 103, 104.5, 105, 106])
out = panama(front, nxt, 2)
assert out is not None, "the function returns nothing yet"
assert np.allclose(out, [102.5, 103.5, 104.5, 105, 106]), f"gap is 104.5 - 102 = 2.5, added to days 0 and 1, got {out.tolist()}"
d = np.diff(out)
assert abs(d[1] - (front[2] - front[1])) < 1e-12, "the change into the roll day is the front contract's own move"
assert np.allclose(panama(front, front, 3), front), "with no gap the series is unchanged"`,
          why: 'Every daily change in the result is a change in a contract you could have held, so summing changes gives the dollar P&L of rolling. The price levels before the roll are now artificial, which is why percentage returns need the ratio method.',
        },
        {
          kind: 'write',
          id: 'qdata-derivs-8',
          numpy: true,
          ask: 'Write `held_returns(front, nxt, r)`: daily simple returns of a position that holds `front` up to and including day `r` (rolling at the close of day `r`) and `nxt` after. Return n − 1 returns: `front[t] / front[t−1] − 1` for t ≤ r, `nxt[t] / nxt[t−1] − 1` for t > r.',
          starter: `import numpy as np

def held_returns(front, nxt, r):
    front, nxt = np.asarray(front, dtype=float), np.asarray(nxt, dtype=float)
    p = np.concatenate([front[:r + 1], nxt[r + 1:]])
    return p[1:] / p[:-1] - 1`,
          solution: `import numpy as np

def held_returns(front, nxt, r):
    front, nxt = np.asarray(front, dtype=float), np.asarray(nxt, dtype=float)
    a = front[1:] / front[:-1] - 1
    b = nxt[1:] / nxt[:-1] - 1
    t = np.arange(1, len(front))
    return np.where(t <= r, a, b)`,
          tests: `front = np.array([100.0, 101, 102, 103])
nxt = np.array([110.0, 111, 112, 113.12])
out = held_returns(front, nxt, 1)
assert out is not None, "the function returns nothing yet"
assert len(out) == 3, f"n - 1 returns, got {len(out)}"
assert abs(out[0] - 0.01) < 1e-12, f"day 1 is still the front contract: 101/100 - 1, got {out[0]}"
assert abs(out[1] - (112 / 111 - 1)) < 1e-12, f"day 2 is the next contract's own return, with no jump from 101 to 112, got {out[1]}"
assert abs(out[2] - (113.12 / 112 - 1)) < 1e-12, "day 3 is the next contract"`,
          why: 'No return ever spans two contracts, so the roll gap never enters. Compounding these returns gives the ratio-adjusted series, and the roll yield is included because each contract\'s own drift towards spot is in its returns.',
        },
        {
          kind: 'choice',
          id: 'qdata-derivs-9',
          ask: 'In the figure, set the carry to a positive value (contango) and compare **Back-adjusted** with the spot index. Why does the back-adjusted series end lower than spot rose?',
          options: [
            'A bug in the adjustment',
            'Each roll buys a dearer contract that then drifts down to spot: the holder pays the carry, and the back-adjusted series records it',
            'Futures always lose money',
            'The unadjusted series is the true one',
          ],
          answer: 1,
          why: 'The back-adjusted series is the P&L of actually holding and rolling. In contango that P&L lags spot by the carry; in backwardation it leads. For index futures most of the carry is interest minus dividends, so it is not a loss of edge, only a difference from the index.',
        },
        {
          kind: 'choice',
          id: 'qdata-derivs-10',
          ask: 'An end-of-day file shows an SPY put with last price $1.05, bid $1.40, ask $1.50, at a strike that last traded at 11:20. Your backtest buys it at the close. What price do you use?',
          options: [
            'The last price, $1.05: it is a real trade',
            'The ask, $1.50, or a modelled fill between mid and ask, checked against the time of the quote',
            'The bid, $1.40',
            'The mid of last and bid',
          ],
          answer: 1,
          why: 'The last trade is hours stale and below the current bid. A buyer pays near the ask. Backtests that fill at last or mid on thin strikes invent profits; the backtest module made the same point for intraday fills.',
        },
        {
          kind: 'number',
          id: 'qdata-derivs-11',
          ask: 'An ETF has 40 expiries listed with 200 strikes each, calls and puts. You store a quote snapshot of every contract each minute of a 390-minute session. How many rows is that per day?',
          answer: 6240000,
          check: '40 * 200 * 2 * 390',
          why: '16,000 contracts × 390 snapshots = 6.24 million rows a day for one underlying, before trades. Options research data is large; minute snapshots of a few liquid underlyings, or end-of-day files, are the usual compromise.',
        },
        {
          kind: 'design',
          id: 'qdata-derivs-12',
          ask: 'You want to backtest selling one-week SPY put spreads at 15:45 each Friday for five years. What data do you need and what do you check in it?',
          checklist: [
            { point: 'Bid and ask for each leg at 15:45, with the quote time, not last trades', why: 'Fills happen at quotes, and stale lasts invent prices.' },
            { point: 'The underlying price at the same moment as the option quotes', why: 'Moneyness and delta are wrong if the underlying is from another time.' },
            { point: 'Expired contracts kept, with their final settlement or the underlying at expiry', why: 'A current chain has no history of expired options: that is survivorship again.' },
            { point: 'Expiry calendar, including weekly and holiday-moved expiries', why: 'The "one-week" contract is not always on a Friday.' },
            { point: 'Your own implied volatility and Greeks from quotes, or the vendor\'s method documented', why: 'Vendor rates, dividends and models differ.' },
            { point: 'A fill model for multi-leg orders: mid less a share of the spread, checked against a sample of real fills', why: 'Selling at the mid of two wide quotes rarely happens.' },
            { point: 'Corporate actions and contract adjustments on the underlying', why: 'Adjusted options have non-standard deliverables and symbols.' },
          ],
          why: 'Options backtests fail on data more than on logic. The quote, its time and the fill model decide the result.',
        },
      ],
    },
    {
      id: 'qdata-sources',
      title: 'Where data comes from and what it costs',
      summary: 'Exchanges, consolidated feeds and vendors; what free sources lack; licences; sizing and checking a data set.',
      text: [
        'Market data starts at the exchanges. Each sells its own direct feeds, and in the US the **consolidated tape** (the SIPs) combines every exchange\'s trades and best quotes into the national best bid and offer. Vendors collect, clean, normalise and resell. Each step adds convenience and its own errors and gaps, so every source needs checking.',
        'Free sources are fine for learning and rough research, with known limits. At the time of writing (2026): Yahoo Finance daily prices are widely used through `yfinance`, an unofficial open-source library that says it is not affiliated with Yahoo and is meant for personal use; it can break when the website changes. The SEC\'s EDGAR system gives every company filing free, and data.sec.gov serves the financial statement figures as JSON, with a fair-access limit of 10 requests a second. FRED, from the St. Louis Fed, serves US economic series and ALFRED their past vintages. Free sources usually lack delisted companies, point-in-time fundamentals, raw unadjusted prices and long intraday history.',
        'Paid sources sell exactly those things. At the time of writing (2026), examples include Databento, which prices historical data by usage per gigabyte and gives new users a $125 credit; Massive, the name Polygon.io took in October 2025, which sells stock, option and other data by subscription; CRSP, the survivorship-free US stock database with delisting returns, usually reached through WRDS at universities; OptionMetrics IvyDB, historical option prices and implied volatilities from 1996; and Cboe DataShop, which sells option end-of-day files (from 2012) with a 15:45 and a closing snapshot. Prices and terms change often. No source here is a recommendation; check the current offer yourself.',
        'Data comes with a **licence**. Exchange fees differ for professional and non-professional users, real-time display and automated (non-display) use are priced separately, and redistribution, including showing live quotes on your own website, is usually forbidden. Read it before you build anything that shares data.',
        'Size a request before you make it: rows × bytes per row. Daily bars are tiny, minute bars are megabytes per symbol-year, and quote-by-quote data for one busy stock can be gigabytes a year. Then check what arrives: compare two sources on overlapping days, reconcile the differences, and spot-check against filings or exchange records. Disagreement between sources is the cheapest way to find errors.',
      ],
      rules: [
        'Every layer, exchange to vendor, adds convenience and errors. Check every source.',
        'Free data: fine for learning; usually no delisted stocks, raw prices or point-in-time fundamentals.',
        'Facts about vendors and prices change: state the date and check the current offer.',
        'Read the licence: professional status, display against non-display, no redistribution.',
        'Size it first: rows × bytes. Compare two sources on overlapping data.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'qdata-sources-1',
          ask: 'A busy stock produces about 2,000,000 quote updates a day. Each stored row is 40 bytes. How many gigabytes is one year of 252 days? (1 GB = 10⁹ bytes.) Give two decimals.',
          answer: 20.16,
          tol: 0.006,
          check: '2e6 * 40 * 252 / 1e9',
          why: '2 million × 40 × 252 ≈ 20 GB per stock-year. Quote data for a few hundred stocks over several years is terabytes, which is why most individual research uses bars or a few names at tick level.',
        },
        {
          kind: 'number',
          id: 'qdata-sources-2',
          ask: 'A vendor charges a made-up $1.50 per GB for historical data. What would a year of quotes for 10 such stocks cost, at 20.16 GB per stock-year, in dollars?',
          answer: 302.4,
          check: '1.50 * 20.16 * 10',
          why: '20.16 × 10 × $1.50 = $302.40. Usage pricing rewards asking only for what the test needs: fewer symbols, fewer fields, bars instead of quotes where bars will do.',
        },
        {
          kind: 'choice',
          id: 'qdata-sources-3',
          ask: 'You plan a 20-year test of a strategy that buys stocks after large falls, using a free daily data source. What is the biggest data problem?',
          options: [
            'Daily data is too coarse',
            'Free sources usually lack delisted companies, so the stocks that kept falling to zero are missing',
            'Free prices are delayed',
            'The time zone of the closes',
          ],
          answer: 1,
          why: 'A strategy that buys losers is exactly the one most flattered by survivorship. Its worst trades, stocks that fell further and were delisted, are the ones a free data set leaves out.',
        },
        {
          kind: 'choice',
          id: 'qdata-sources-4',
          ask: 'Which is a fair use of an unofficial library such as `yfinance` for daily prices?',
          options: [
            'The data feed of a live automated strategy',
            'Learning, rough personal research, and cross-checking another source, knowing it may break or change without notice',
            'Republishing the prices on a commercial website',
            'A survivorship-free 30-year test',
          ],
          answer: 1,
          why: 'It is a scraper of a website, not a supported product, and its own README says it is not affiliated with Yahoo and points to Yahoo\'s terms. Good for learning and checks; not something to trade on or redistribute.',
        },
        {
          kind: 'choice',
          id: 'qdata-sources-5',
          ask: 'You take quarterly figures from SEC filings for a point-in-time data set. Which date do you store as the knowledge date?',
          options: [
            'The end of the fiscal quarter',
            'The date the filing was accepted by EDGAR, or later if the time of day is after the close',
            'The first day of the next quarter',
            'The date you downloaded it',
          ],
          answer: 1,
          why: 'The filing date is when the figures became public in that form. Many companies announce earnings in a press release a little earlier, which is safer to treat as unknown unless you have it with its time. Erring late costs a little signal; erring early is look-ahead.',
        },
        {
          kind: 'bug',
          id: 'qdata-sources-6',
          ask: 'This should keep a download loop under 10 requests a second. It waits ten seconds between requests instead.',
          code: `import time

def throttled(fetch, items, per_second=10):
    min_gap = per_second
    out, last = [], 0.0
    for item in items:
        wait = min_gap - (time.monotonic() - last)
        if wait > 0:
            time.sleep(wait)
        last = time.monotonic()
        out.append(fetch(item))
    return out`,
          line: 4,
          fix: '    min_gap = 1 / per_second',
          why: 'Ten requests a second means one every 0.1 seconds. The opposite slip, too short a gap, gets your address blocked; this one only makes a job a hundred times slower. Both are caught by timing ten calls.',
        },
        {
          kind: 'number',
          id: 'qdata-sources-7',
          ask: 'You need one JSON file for each of 8,000 companies from a service that allows 10 requests a second. At best, how many minutes does the download take? Give one decimal.',
          answer: 13.3,
          tol: 0.06,
          check: '8000 / 10 / 60',
          why: '800 seconds ≈ 13.3 minutes. Plan for retries and slower responses; save each file as it arrives so that a failure does not restart the whole job.',
        },
        {
          kind: 'output',
          id: 'qdata-sources-8',
          ask: 'Two vendors\' closes compared with a 0.5% tolerance. Which indices disagree?',
          code: `import numpy as np

a = np.array([100.0, 101.0, 102.0, 50.0, 104.0])
b = np.array([100.0, 101.2, 102.0, 103.0, np.nan])
bad = ~(np.abs(a - b) <= 0.005 * np.abs(b))
print(np.nonzero(bad)[0].tolist())`,
          answer: '[3, 4]',
          why: 'Index 1 differs by 0.2%, inside the tolerance. Index 3 differs by half, typical of a split applied by one vendor and not the other. Index 4 is missing in one source: writing the test as "not within tolerance" counts `nan` as a disagreement, because any comparison with `nan` is False.',
        },
        {
          kind: 'write',
          id: 'qdata-sources-9',
          numpy: true,
          ask: 'Write `disagreements(a, b, tol)`: return the list of indices where the relative difference `|a − b| ÷ |b|` exceeds `tol`, or where either value is `nan`.',
          starter: `import numpy as np

def disagreements(a, b, tol):
    a, b = np.asarray(a, dtype=float), np.asarray(b, dtype=float)
    return np.nonzero(np.abs(a - b) > tol * np.abs(b))[0].tolist()`,
          solution: `import numpy as np

def disagreements(a, b, tol):
    a, b = np.asarray(a, dtype=float), np.asarray(b, dtype=float)
    ok = np.abs(a - b) <= tol * np.abs(b)
    return np.nonzero(~ok)[0].tolist()`,
          tests: `out = disagreements([100, 101, 50], [100, 101.2, 103], 0.005)
assert out is not None, "the function returns nothing yet"
assert out == [2], f"only index 2 is more than 0.5% apart, got {out}"
assert disagreements([1.0, float('nan')], [1.0, 2.0], 0.01) == [1], "a nan in a must count as a disagreement"
assert disagreements([1.0, 2.0], [float('nan'), 2.0], 0.01) == [0], "a nan in b must count as a disagreement"`,
          why: 'The starter asks "is the difference too big?", which is False for `nan`, so missing values pass silently. Asking "is it close enough?" and negating catches them. A reconciliation that ignores missing data misses the most common problem.',
        },
        {
          kind: 'choice',
          id: 'qdata-sources-10',
          ask: 'You pay for a real-time feed as a non-professional and want to show its live quotes on a public web page for friends. What does a typical licence say?',
          options: [
            'Anything you pay for, you may show to anyone',
            'Redistribution is not allowed; showing it to others needs a different licence and fees',
            'It is fine if the page is free',
            'It is fine if the quotes are rounded',
          ],
          answer: 1,
          why: 'Exchange data licences separate personal display, redistribution and automated use, and price each. Read the terms before sharing; delayed or end-of-day data often has looser rules, but check them too.',
        },
        {
          kind: 'design',
          id: 'qdata-sources-11',
          ask: 'You are choosing data for a first serious research project: daily, US stocks, 15 years, including fundamentals. Write the questions you put to each candidate source.',
          checklist: [
            { point: 'Does it include delisted securities and delisting returns?', why: 'Survivorship is the largest single bias in stock data.' },
            { point: 'Are fundamentals point-in-time, with knowledge dates, as first reported?', why: 'Otherwise the test uses figures before publication or after restatement.' },
            { point: 'Can I get raw prices and the corporate actions table, not only adjusted closes?', why: 'You need both levels and returns, reproducibly.' },
            { point: 'Is there a permanent security id and a ticker history?', why: 'Joins on ticker break on renames and reuse.' },
            { point: 'What does the licence allow, and what does it cost now?', why: 'Terms and prices change; check the current offer, with the date.' },
            { point: 'How will I check it: a second source on overlapping data, and spot checks against filings?', why: 'Every source has errors; you find them by comparison.' },
          ],
          why: 'The cheapest data is often the most expensive research: a wrong answer looks the same as a right one until money is on it.',
        },
      ],
    },
    {
      id: 'qdata-lab',
      title: 'Lab: a cleaning pipeline in NumPy',
      summary: 'Adjust a split, fill missing minutes, catch bad ticks, resample, and compute returns that never cross a session, each step tested.',
      text: [
        'This lab builds the pipeline that sits between raw minute bars and any research: adjust for a split, put every minute on a regular grid, catch bad ticks with a trailing median and MAD, resample to longer bars, and compute log returns that never span the overnight gap. Each step is a small function with tests, and each later step repeats the helpers it needs, so they run on their own.',
        'All data here is made up. The order matters: adjust before cleaning, or the split itself looks like the biggest bad tick in the file; fill before resampling, or bars cover uneven spans of time; clean before computing returns, or one bad print becomes two huge returns.',
        'The point is not the code but the habits: every step is tested on a tiny case whose answer you know, nothing uses a value from the future, and every change to the data is a rule you can name.',
      ],
      rules: [
        'Order: corporate actions, gaps, bad ticks, resampling, returns.',
        'Every step trailing or forward only: no future values.',
        'Test each step on a tiny hand-made case.',
        'Returns never span the overnight gap or a filled stretch you do not trust.',
        'Keep the raw data and log every change.',
      ],
      questions: [
        {
          kind: 'write',
          id: 'qdata-lab-1',
          numpy: true,
          ask: 'Step 1: corporate actions. Write `adjust_splits(close, volume, splits)`: `splits` is a list of `(i, ratio)`, each taking effect at index i. Return adjusted copies: closes before i divided by the ratio, volumes before i multiplied by it.',
          starter: `import numpy as np

def adjust_splits(close, volume, splits):
    c = np.asarray(close, dtype=float).copy()
    v = np.asarray(volume, dtype=float).copy()
    return c, v`,
          solution: `import numpy as np

def adjust_splits(close, volume, splits):
    c = np.asarray(close, dtype=float).copy()
    v = np.asarray(volume, dtype=float).copy()
    for i, ratio in splits:
        c[:i] /= ratio
        v[:i] *= ratio
    return c, v`,
          tests: `out = adjust_splits([200.0, 202.0, 101.0], [10, 10, 20], [(2, 2)])
assert out is not None, "the function returns nothing yet"
c, v = out
assert c.tolist() == [100.0, 101.0, 101.0], f"prices before index 2 halve, got {c.tolist()}"
assert v.tolist() == [20, 20, 20], f"volumes before index 2 double, got {v.tolist()}"
c2, _ = adjust_splits([300.0, 100.0, 50.0], [1, 1, 1], [(1, 3), (2, 2)])
assert np.allclose(c2, [50.0, 50.0, 50.0]), f"two splits compound on the earliest prices, got {c2.tolist()}"
raw = np.array([200.0, 202.0, 101.0])
adjust_splits(raw, [1, 1, 1], [(2, 2)])
assert raw[0] == 200.0, "do not change the input array: keep the raw data"`,
          why: 'Earlier splits compound: a price before both a 3-for-1 and a 2-for-1 is divided by 6. Copying before changing keeps the raw array intact, which you need for level-based rules and for checking your own work.',
        },
        {
          kind: 'write',
          id: 'qdata-lab-2',
          numpy: true,
          ask: 'Step 2: gaps. Write `fill_minutes(t, close, volume)`: `t` holds sorted integer minutes with gaps. Return `(grid, c, v, filled)` on every minute from `t[0]` to `t[-1]`: closes carried forward, volume 0 on missing minutes, and `filled` True where a minute was missing.',
          starter: `import numpy as np

def fill_minutes(t, close, volume):
    t = np.asarray(t)
    grid = np.arange(t[0], t[-1] + 1)
    pass`,
          solution: `import numpy as np

def fill_minutes(t, close, volume):
    t = np.asarray(t)
    grid = np.arange(t[0], t[-1] + 1)
    pos = np.searchsorted(t, grid, side='right') - 1
    filled = t[pos] != grid
    c = np.asarray(close, dtype=float)[pos]
    v = np.where(filled, 0.0, np.asarray(volume, dtype=float)[pos])
    return grid, c, v, filled`,
          tests: `out = fill_minutes([0, 1, 4], [10.0, 11.0, 12.0], [5, 6, 7])
assert out is not None, "the function returns nothing yet"
g, c, v, f = out
assert g.tolist() == [0, 1, 2, 3, 4], f"one row per minute, got {g.tolist()}"
assert c.tolist() == [10.0, 11.0, 11.0, 11.0, 12.0], f"closes carried forward, never back, got {c.tolist()}"
assert v.tolist() == [5, 6, 0, 0, 7], f"volume 0 on filled minutes, got {v.tolist()}"
assert f.tolist() == [False, False, True, True, False], f"flag the filled minutes, got {f.tolist()}"`,
          why: 'The as-of search from the first lesson does the whole job: each grid minute takes the last real bar at or before it. Zero volume and the flag keep volume-based signals and later checks honest about which bars were real.',
        },
        {
          kind: 'write',
          id: 'qdata-lab-3',
          numpy: true,
          ask: 'Step 3: bad ticks. Write `clean_ticks(p, window, k)`: go through the prices in order; from index `window` on, compare `p[t]` with the median and MAD of the previous `window` **cleaned** prices, and when `|p[t] − median| > k × 1.4826 × MAD` (with MAD > 0), replace it by the previous cleaned price and flag it. Return `(cleaned, flags)`.',
          starter: `import numpy as np

def clean_ticks(p, window, k):
    c = np.asarray(p, dtype=float).copy()
    flags = np.zeros(len(c), dtype=bool)
    return c, flags`,
          solution: `import numpy as np

def clean_ticks(p, window, k):
    c = np.asarray(p, dtype=float).copy()
    flags = np.zeros(len(c), dtype=bool)
    for t in range(window, len(c)):
        w = c[t - window:t]
        m = np.median(w)
        mad = np.median(np.abs(w - m))
        if mad > 0 and abs(c[t] - m) > k * 1.4826 * mad:
            c[t] = c[t - 1]
            flags[t] = True
    return c, flags`,
          tests: `p = np.array([100, 100.2, 100.1, 100.3, 100.4, 130.0, 100.5, 100.3])
out = clean_ticks(p, 5, 5)
assert out is not None, "the function returns nothing yet"
c, f = out
assert f.tolist() == [False] * 5 + [True, False, False], f"only the 130 print is bad, got {f.tolist()}"
assert c[5] == 100.4 and c[6] == 100.5, f"the bad print is replaced by the previous clean price, got {c.tolist()}"
q = np.array([100, 100.2, 100.1, 100.3, 100.4, 130.0, 129.0, 100.5])
c2, f2 = clean_ticks(q, 5, 5)
assert f2[5] and f2[6], "judging against cleaned prices: the second bad print is caught too"
assert p[5] == 130.0, "do not change the input array"`,
          why: 'Using the cleaned history for the window stops one bad print from widening the window and letting a second one through. It also means a real jump keeps being "repaired" until the MAD widens; that is why the flags are kept, counted and reviewed rather than trusted blindly.',
        },
        {
          kind: 'bug',
          id: 'qdata-lab-4',
          ask: 'Step 4: resampling a complete minute grid into n-minute bars. The closes it returns are the first minute of each bar.',
          code: `import numpy as np

def resample_closes(c, n):
    m = len(c) // n * n
    bars = np.asarray(c)[:m].reshape(-1, n)
    return bars[:, 0]`,
          line: 6,
          fix: '    return bars[:, -1]',
          why: 'After the reshape each row is one bar, in time order, so the close is the last column. Using the first column shifts every close back by n − 1 minutes, a quiet error that changes every return without making any of them look wrong.',
        },
        {
          kind: 'write',
          id: 'qdata-lab-5',
          numpy: true,
          ask: 'Step 5: resample OHLCV. Write `resample_ohlcv(o, h, l, c, v, n)` for a complete minute grid: drop an unfinished last group, and return the n-minute open, high, low, close and volume as arrays.',
          starter: `import numpy as np

def resample_ohlcv(o, h, l, c, v, n):
    m = len(c) // n * n
    pass`,
          solution: `import numpy as np

def resample_ohlcv(o, h, l, c, v, n):
    m = len(c) // n * n
    r = lambda a: np.asarray(a, dtype=float)[:m].reshape(-1, n)
    return r(o)[:, 0], r(h).max(axis=1), r(l).min(axis=1), r(c)[:, -1], r(v).sum(axis=1)`,
          tests: `o = [10, 11, 12, 11, 10]
h = [11, 12, 13, 12, 11]
l = [9, 10, 11, 10, 9]
c = [11, 12, 11, 10, 10.5]
v = [100, 200, 300, 400, 500]
out = resample_ohlcv(o, h, l, c, v, 2)
assert out is not None, "the function returns nothing yet"
ro, rh, rl, rc, rv = out
assert ro.tolist() == [10, 12], f"opens are the first minute, got {ro.tolist()}"
assert rh.tolist() == [12, 13] and rl.tolist() == [9, 10], "highs are maxima, lows minima"
assert rc.tolist() == [12, 10], f"closes are the last minute, got {rc.tolist()}"
assert rv.tolist() == [300, 700], f"volumes add up, and the unfinished fifth minute is dropped, got {rv.tolist()}"`,
          why: 'On a regular grid, resampling is a reshape and four reductions, with no loop. It is only correct because step 2 made the grid regular: on data with gaps, rows of n entries would cover different spans of time.',
        },
        {
          kind: 'write',
          id: 'qdata-lab-6',
          numpy: true,
          ask: 'Step 6: returns. Write `session_returns(close, day)`: log returns between consecutive bars, keeping only those where both bars have the same `day` value. Return them as one array.',
          starter: `import numpy as np

def session_returns(close, day):
    close = np.asarray(close, dtype=float)
    return np.diff(np.log(close))`,
          solution: `import numpy as np

def session_returns(close, day):
    close = np.asarray(close, dtype=float)
    day = np.asarray(day)
    r = np.diff(np.log(close))
    return r[day[1:] == day[:-1]]`,
          tests: `close = np.array([100.0, 101.0, 105.0, 104.0])
day = np.array([1, 1, 2, 2])
out = session_returns(close, day)
assert out is not None, "the function returns nothing yet"
assert len(out) == 2, f"two returns within sessions, the overnight one is dropped, got {len(out)}"
assert np.allclose(out, [np.log(101 / 100), np.log(104 / 105)]), f"got {out.tolist()}"
assert len(session_returns([1.0, 2.0, 3.0], [5, 5, 5])) == 2, "one session keeps every return"`,
          why: 'The overnight move is a different animal: gaps after news, no trading for hours. Mixing it into intraday bar returns inflates their volatility and creates fat tails that belong to the gap. Study it separately if you need it.',
        },
        {
          kind: 'output',
          id: 'qdata-lab-7',
          ask: 'Step 7: the whole pipeline on made-up minute closes with a split at index 5, a missing minute 3 and a bad print. What does this print?',
          code: `import numpy as np

t = np.array([0, 1, 2, 4, 5, 6, 7, 8, 9, 10, 11])      # minutes; minute 3 had no trades
c = np.array([200.0, 200.4, 200.2, 200.6, 200.8, 100.5, 100.3, 130.0, 100.4, 100.6, 100.5])
c[:5] /= 2                                     # 1. a 2-for-1 split took effect at index 5
grid = np.arange(t[0], t[-1] + 1)              # 2. one row per minute, filled forward
c = c[np.searchsorted(t, grid, side='right') - 1]
for i in range(5, len(c)):                     # 3. trailing median and MAD of 5, k = 5
    w = c[i - 5:i]
    m, mad = np.median(w), np.median(np.abs(w - np.median(w)))
    if mad > 0 and abs(c[i] - m) > 5 * 1.4826 * mad:
        c[i] = c[i - 1]
bars = c.reshape(-1, 4)[:, -1]                 # 4. 4-minute closes
print(len(grid), bars.tolist(), np.round(np.diff(np.log(bars)), 4).tolist())`,
          answer: '12 [100.1, 100.3, 100.5] [0.002, 0.002]',
          why: 'Twelve minutes after filling minute 3; the 130.0 print is replaced; the 4-minute closes are minutes 3, 7 and 11. Skip step 1 and the split dominates the MAD window, skip step 3 and one bar return is about +26% then −26%. Comment out each step in turn and watch which number breaks.',
        },
        {
          kind: 'design',
          id: 'qdata-lab-8',
          ask: 'Step 8: making it trustworthy. Your pipeline will run every night on new data for 300 symbols and feed a research database. What do you add around these functions?',
          checklist: [
            { point: 'Keep raw files untouched and write cleaned data to a separate, versioned location', why: 'You can always rerun with a better rule and compare.' },
            { point: 'A log of every change: symbol, time, rule, old and new value', why: 'Cleaning is part of every result built on the data; it must be reviewable.' },
            { point: 'Counts per run: filled minutes, flagged ticks, failed bar checks, by symbol', why: 'A sudden jump in flags means a feed problem, not a market event.' },
            { point: 'Unit tests on tiny known cases for each step, run before every change', why: 'The bugs in this lab, off by one and inverted masks, are silent otherwise.' },
            { point: 'A lookahead test: change a future value and check that no earlier output moves', why: 'The simplest proof that every step is trailing.' },
            { point: 'The corporate actions table updated before cleaning, and its source recorded', why: 'A missed split looks like a crash and poisons the bad-tick filter.' },
            { point: 'A comparison with a second source on a sample of symbols', why: 'Catches what no internal rule can: a vendor that is consistently wrong.' },
          ],
          why: 'A pipeline nobody can audit turns every downstream result into a matter of faith. The tests and logs cost an afternoon; a poisoned database costs every study built on it.',
        },
      ],
    },
  ],
}
