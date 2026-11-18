import type { Block } from '../../types'

/** The full theory for each lesson of the qdata module, keyed by lesson id. */
export const qdataTheory: Record<string, Block[]> = {
  'qdata-arrays': [
    { h: 'Market data as columns of numbers' },
    'Every strategy you test is built on a file of prices. If that file is wrong, every number built on it is wrong too, and nothing in the backtest will warn you. This module is about that raw material: what it looks like, how it goes wrong and how to check it. All the data in it is made up or generated with a fixed seed.',
    'Research code holds market data as **columns**: one NumPy array per field, every array the same length, row i of each array describing the same moment. Columns let you work on a whole history in one line. pandas, the library most quants use, is a labelled wrapper around the same arrays; here you use NumPy directly so you see what happens underneath.',
    {
      code: `import numpy as np

close = np.array([50.0, 50.5, 50.25, 51.0])
print((close[1:] / close[:-1] - 1).round(4).tolist())
print(close.nbytes)`,
      out: `[0.01, -0.005, 0.0149]
32`,
    },
    'The first line is every one-step return at once: each close divided by the one before, minus 1. The second shows the memory used: four values of type **float64**, 8 bytes each. Rows × columns × 8 bytes tells you how big a data set is before you download it.',

    { h: 'Bars, ticks and quotes' },
    { sub: 'OHLCV bars' },
    'A **bar** summarises a stretch of time: the **open** (first trade), **high**, **low**, **close** (last trade) and **volume** (shares traded). That is **OHLCV**. A US stock has 390 one-minute bars in a regular session, so a year of minute bars is a few hundred thousand rows per symbol: small enough for a laptop.',
    { sub: 'Trades and quotes' },
    '**Ticks** are the individual events behind the bars. A **trade** has a time, a price and a size. A **quote** has a time, the **bid** (best price a buyer offers) and the **ask** (best price a seller asks), each with a size. Ticks arrive at irregular times, thousands or millions a day. The **mid** is (bid + ask) ÷ 2, and the **spread** is ask − bid, often quoted in **basis points** of the mid (1 bp = 0.01%). A spread of 6 cents on a $60 mid is 0.06 ÷ 60 = 10 bp. Keeping quotes, not only trades, lets a backtest charge each fill the spread it would have paid.',

    { h: 'Time: UTC, New York and the session' },
    { sub: 'Storing time' },
    'Store every timestamp as an integer count from a fixed origin, usually seconds or nanoseconds since 1 January 1970 in **UTC** (Coordinated Universal Time, the clock with no daylight saving). This is the **Unix epoch**. In Python, `datetime.fromtimestamp(ts, tz=timezone.utc)` turns a count into a date and time, and `.strftime("%H:%M")` formats it.',
    { sub: 'Daylight saving' },
    'New York is five hours behind UTC in winter and four in summer. In 2026 the change happens on 8 March and 1 November. Convert with the named zone, `zoneinfo.ZoneInfo("America/New_York")`, which knows the dates. A fixed offset is right for only part of the year:',
    {
      code: `from datetime import datetime, timezone, timedelta

t = datetime(2026, 7, 15, 14, 0, tzinfo=timezone.utc)
print(t.astimezone(timezone(timedelta(hours=-4))).strftime('%H:%M'))`,
      out: '10:00',
    },
    { sub: 'The session and its calendar' },
    'The regular US session runs 9:30 to 16:00 New York time. As minutes after midnight that is 570 up to 960. If you hold minutes after midnight UTC, add 60 × offset and take the result modulo 1440 (the minutes in a day) so a time shortly after midnight UTC wraps back to the evening before. Some days close early at 13:00 and some are holidays, so keep a trading calendar by date.',

    { h: 'How a bar is labelled' },
    'A 5-minute bar stamped 10:00 may cover 10:00 to 10:05 (**start label**) or 9:55 to 10:00 (**end label**). Vendors differ. If you read start labels as end labels, every decision at 10:00 uses a close that printed at 10:05: five minutes of **lookahead**, the use of information that did not exist yet. The reverse mistake makes every entry late. Check the convention against something you know, such as the first bar of the day sitting at the 9:30 open.',

    { h: 'Joining trades to quotes' },
    'To know the quote in force when a trade printed, take the last quote at or before the trade: an **as-of join**. `np.searchsorted(a, v, side="right")` returns how many entries of the sorted array a are at or before v, so subtracting 1 gives the index of the last one.',
    {
      code: `import numpy as np

q_time = np.array([10, 20, 30])
t_time = np.array([15, 20, 35, 5])
print((np.searchsorted(q_time, t_time, side='right') - 1).tolist())`,
      out: '[0, 1, 2, -1]',
    },
    'The trade at 20 sees the quote that arrived at 20. The trade at 5 gets −1: no quote yet. Handle that case on purpose, because index −1 in NumPy silently means the last quote of the day.',

    { h: 'Checking every bar' },
    'A valid bar has a high at least the larger of open and close, a low at most the smaller, volume of zero or more, and timestamps strictly increasing (`np.all(np.diff(t) > 0)`). Test for `nan` (not a number, the marker for a missing value) separately, because every comparison with it is False:',
    {
      code: `import numpy as np

print(np.nan > 5, np.nan < 5, np.nan == np.nan)`,
      out: 'False False False',
    },
    'A check written as "flag if high < close" lets a `nan` high through. Use `np.isnan` on each field.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Hard-coding UTC−5 and mislabelling the open for most of the year.',
        'Assuming bar labels without checking them.',
        'Matching each trade to the next quote, which often is the one the trade caused.',
        'Loading data without counting bad bars, unsorted times and duplicates first.',
        'Storing large histories as text files, which are slow and lose precision; binary formats such as Parquet or NumPy `.npy`, split by symbol and month, load only what a test needs.',
      ],
    },
  ],

  'qdata-corporate': [
    { h: 'Why a raw price history lies' },
    'A company does things that change its share price without changing what a shareholder owns. It splits its shares, it pays dividends, it merges and renames. These are **corporate actions**. A file of the prices that printed each day, the **raw** or **unadjusted** prices, shows a sudden move at each one. A backtest that computes returns from raw prices records gains and losses that nobody had.',

    { h: 'Splits' },
    { sub: 'What a split does' },
    'In a **split** of N-for-1 each share becomes N shares, and the price falls to about 1/N. A 3-for-1 split of a $90 stock leaves you with three $30 shares: the same $90. A **reverse split** of 1-for-N does the opposite, usually for companies whose price has fallen very low. Raw prices show a fake loss of two thirds at a 3-for-1 split and a fake gain of several hundred percent at a reverse split.',
    { sub: 'Split-adjusting' },
    'To remove the jump, divide every price before the split date by the ratio and multiply every volume before it by the ratio. The dollar value traded, price × volume, is unchanged. Changing the past rather than the future is **back-adjusting**: the latest prices stay equal to what you see quoted today.',
    {
      code: `import numpy as np

p = np.array([90.0, 93.0, 31.5, 32.0])
v = np.array([1000.0, 1200.0, 3300.0, 3000.0])
p[:2] /= 3
v[:2] *= 3
print(p.tolist(), v.tolist())`,
      out: '[30.0, 31.0, 31.5, 32.0] [3000.0, 3600.0, 3300.0, 3000.0]',
    },
    'The split takes effect at index 2, so only indices 0 and 1 change; the price at index 2 is already in new shares. Several splits compound: a price before both a 2-for-1 and a 5-for-1 is divided by 10.',

    { h: 'Dividends and total return' },
    { sub: 'The ex-dividend date' },
    'A cash **dividend** is paid to whoever owns the shares at a cut-off. The day from which a buyer no longer gets it is the **ex-dividend date**, and on that day the price tends to open lower by about the dividend. The cash itself arrives on the later **payment date**, but for returns the ex-date is the one that matters, because that is when the price drops.',
    { sub: 'Price return and total return' },
    'The **price return** of a day is P1 ÷ P0 − 1 and ignores the cash. The **total return** adds it back: (P1 + D) ÷ P0 − 1, where D is the dividend going ex that day. Take a close of $40.00, a dividend of $0.40 and an ex-date close of $39.80:',
    {
      code: `p0, p1, d = 40.0, 39.8, 0.4
print(round(p1 / p0 - 1, 4), round((p1 + d) / p0 - 1, 4), round(1 - d / p0, 4))`,
      out: '-0.005 0.005 0.99',
    },
    'The price return is −0.5%, the total return +0.5%. Chaining total returns day by day, starting from 1.0, gives a **total return index**: what $1 grows to with every dividend reinvested. Over many years the gap between that index and the price compounds into a large difference.',
    { sub: 'The adjustment factor' },
    'Vendors fold dividends into an adjusted price with a factor. The common method, used by CRSP (the Center for Research in Security Prices) and in the Adjusted Close on Yahoo Finance, multiplies every price before the ex-date by 1 − D ÷ P, where P is the close the day before. That is the third number above: 0.99. Returns from the adjusted series then include the dividend, very nearly as the total return formula does.',

    { h: 'Adjusted against unadjusted' },
    'Adjusted prices are numbers that never traded. Every new dividend rescales all earlier prices again, so an adjusted file downloaded next year has different numbers for the same old dates. That makes it right for some jobs and wrong for others.',
    {
      list: [
        'Use adjusted prices for anything that compounds: returns, volatility, correlations, equity curves.',
        'Use unadjusted prices for anything about a price level at the time: a "price above $5" filter, round numbers, limit prices, option strikes, share counts and tick sizes.',
        'Use the same basis for a strategy and its benchmark: total return against total return.',
      ],
    },
    'A file of adjusted closes next to raw highs and lows mixes the two bases, and a close can then sit outside its own bar.',

    { h: 'A data design that survives' },
    'Store the raw OHLCV and a separate table of corporate actions: date, type, ratio or amount. Compute adjustments in your own code. A test run today and next year then sees the same numbers, and you can produce adjusted or raw prices for any purpose. Identify each company by a permanent id rather than its ticker, because tickers change on mergers and renames. After adjusting, check the return on every action date: a missed split shows up as a fake day of −50% or worse.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Computing returns from raw closes across a split.',
        'Adjusting prices but not volumes, so every volume filter breaks at the split date.',
        'Dividing the split day itself, which moves the jump instead of removing it.',
        'Counting a dividend on its payment date instead of its ex-date.',
        'Applying price filters and round-number levels to adjusted prices.',
      ],
    },
  ],

  'qdata-cleaning': [
    { h: 'What cleaning is for' },
    'Raw market data has holes, wrong prints and frozen values. **Cleaning** repairs or flags them before research starts. Every repair is a decision that changes results, so it must follow written rules, use no future information and be logged. Keep the raw file untouched.',

    { h: 'Missing bars' },
    { sub: 'No trades is not missing data' },
    'A thin stock may go several minutes without a trade, so its 1-minute file has gaps. The price did not vanish; it stayed where it was. The honest fill is a **forward fill**: carry the last close forward as open, high, low and close, with volume 0, and mark the bar as filled so no signal fires on it.',
    {
      code: `x = [10.0, None, None, 10.4, None]
out, last = [], None
for val in x:
    last = val if val is not None else last
    out.append(last)
print(out)`,
      out: '[10.0, 10.0, 10.0, 10.4, 10.4]',
    },
    'NumPy can do the same without a loop by carrying the index of the last real value forward with `np.maximum.accumulate`.',
    { sub: 'Fills that leak the future' },
    'Filling backwards, or interpolating in a straight line between the bars on either side, puts a later price into an earlier bar. A signal computed on that bar knows a little of the future. It looks harmless on a chart and quietly flatters a backtest.',

    { h: 'Bad ticks' },
    'A **bad tick** is a print far from its neighbours that was never a price you could trade at: a keying error, a mis-reported size, a late report of an old trade.',
    { sub: 'Median and MAD' },
    'Compare each price with the **median** of a window of prices (the middle value when sorted) and measure spread with the **median absolute deviation**, MAD: the median of the distances from that median. Flag a price when `|p − median| > k × 1.4826 × MAD`. The factor 1.4826 scales MAD so that, for normal data, it matches the standard deviation; k is your threshold, often between 3 and 10.',
    { sub: 'Why not the mean and standard deviation' },
    'One spike drags the mean towards itself and inflates the standard deviation it is measured against. With n prices and population standard deviation, no single point can ever score more than √(n − 1) standard deviations from the mean. In a 10-price window that is 3, however wild the spike:',
    {
      code: `import numpy as np

w = np.array([50, 50.2, 49.9, 50.1, 60, 50, 50.1, 49.8, 50.2, 50.0])
med = np.median(w)
mad = np.median(np.abs(w - med))
print(round((60 - med) / (1.4826 * mad), 1), round((60 - w.mean()) / w.std(), 2))`,
      out: '67.1 3.0',
    },
    'The median-based score is 67; the ordinary z-score is 3.0, and a "more than 3" rule would miss it. If every price in the window is equal, the MAD is 0 and any change would score infinity, so skip the check when MAD is 0.',
    { sub: 'Trailing windows and persistence' },
    'In live trading only the past exists, so the window must be **trailing**: the prices before t, not around it. A centred window can clean history, but the same rule cannot run live. A real move and a bad tick look the same for one print. The difference is **persistence**: a bad tick reverts at once, a real move stays, with volume and with the quote moving too. Right after a real jump the trailing median is still at the old level, so the first new prices get flagged. Confirm before deleting, and never remove large real moves: fat tails are part of your true risk.',

    { h: 'Stale prices' },
    'A **stale** price has not changed because nothing traded. Returns from it understate volatility, and a stale series appears to lag a live one, which looks like a pattern. Count runs of identical prices: k unchanged steps in a row means k + 1 equal prices. For options, a "last" price can be hours old. Mark a position at the current mid instead, and remember one contract covers 100 shares, so a $0.30 error per share is $30 per contract.',

    { h: 'Aligning two series' },
    'Two series must share timestamps before you compare them. An **inner join** keeps only the times present in both:',
    {
      code: `import numpy as np

t1, x1 = np.array([1, 2, 4, 5]), np.array([10.0, 11, 12, 13])
t2, x2 = np.array([2, 3, 4]), np.array([7.0, 8, 9])
tt, i1, i2 = np.intersect1d(t1, t2, return_indices=True)
print(tt.tolist(), x1[i1].tolist(), x2[i2].tolist())`,
      out: '[2, 4] [11.0, 12.0] [7.0, 9.0]',
    },
    'Compute returns after aligning, so both series measure the same span. Also know when each value was stamped. Markets on different continents close hours apart, so "the same date" holds two different moments, and news from the later market shows up in the earlier one the next day. That looks like a lead you could trade, but it sits in the overnight gap.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Interpolating gaps, which leaks the next price.',
        'Filtering spikes with a standard deviation the spike itself inflates.',
        'Deleting every large move, including the real crashes.',
        'Marking options at stale last trades.',
        'Cleaning without a log, so nobody can tell which results depend on which repairs.',
      ],
    },
  ],

  'qdata-bars': [
    { h: 'Bars are a sampling choice' },
    'A bar is a summary of many trades. Which trades go into one bar is a choice, and it changes every statistic you compute. The charts module built longer bars from shorter ones by the clock: the first open, the highest high, the lowest low, the last close and the summed volume. This lesson builds bars from ticks and then samples by activity instead of by time.',

    { h: 'Time bars from ticks in NumPy' },
    { sub: 'Bucket numbers' },
    'For bars of s seconds, each trade gets a **bucket** number `t // s` (integer division). Trades at 0 to 59 seconds land in bucket 0 for 60-second bars, 60 to 119 in bucket 1, and so on. Because the trades are sorted, each bucket is one run of consecutive rows.',
    { sub: 'Where each bucket starts' },
    '`np.unique(bucket, return_index=True)` returns the distinct buckets and the row where each one first appears. The open of a bar is the price at its start row. `np.maximum.reduceat(price, starts)` takes the maximum over each run from one start to the next, and `np.minimum.reduceat` the minimum; `np.add.reduceat` sums sizes.',
    {
      code: `import numpy as np

t = np.array([1, 4, 7, 12, 14, 25])
p = np.array([20.0, 20.3, 19.9, 20.1, 20.4, 20.2])
keys, start = np.unique(t // 10, return_index=True)
print(keys.tolist(), start.tolist(), np.maximum.reduceat(p, start).tolist())`,
      out: '[0, 1, 2] [0, 3, 5] [20.3, 20.4, 20.2]',
    },
    { sub: 'The close' },
    'The close is the last trade of each run: the row before the next start, and the final row for the last bar. This is where hand-written resamplers most often slip by one. Buckets with no trades do not appear at all; filling them is the cleaning stage\'s job.',

    { h: 'Trading does not run at a steady pace' },
    'US stocks trade most in the first and last half hours of the session and least around midday: the **U shape** of intraday volume. Time bars give the busy open and the quiet lunch the same number of bars, so some bars hold many trades and large moves while others hold almost nothing. Returns from such a mix have **fat tails**: more very small and very large values than a normal curve. The quant module measured this with **excess kurtosis**, which is 0 for a normal curve and positive for fat tails.',

    { h: 'Bars sampled by activity' },
    { sub: 'Tick, volume and dollar bars' },
    'A **tick bar** closes every N trades, a **volume bar** every V shares, a **dollar bar** every D dollars traded, where the dollars of one trade are price × size. Walk through the trades keeping a running total; when it reaches the threshold, the current trade closes the bar and the total resets.',
    {
      code: `price = [50, 50, 51, 51, 52]
size = [300, 500, 200, 400, 600]
cum, ends = 0, []
for i, (pp, s) in enumerate(zip(price, size)):
    cum += pp * s
    if cum >= 40000:
        ends.append(i)
        cum = 0
print(ends)`,
      out: '[1, 4]',
    },
    'Busy periods produce many bars and quiet periods few, so each bar carries a similar amount of trading. Marcos López de Prado popularised these bars in *Advances in Financial Machine Learning* (2018), arguing that returns sampled this way are closer to normal. Treat that as a tendency to measure on your own data, not a law.',
    { sub: 'Why dollars rather than shares' },
    'If a stock rises from $20 to $200 over ten years, the same money buys a tenth as many shares, so a fixed share threshold thins out across the history. A split multiplies share counts overnight. A dollar threshold notices neither.',

    { h: 'Setting the threshold honestly' },
    'Choose the threshold from data known before the day starts. If a stock traded on average $2 billion a day over the previous 20 days and you want about 40 bars a day, D = $2,000 million ÷ 40 = $50 million. Fitting D to the whole history uses future volume. And a bar is final only when it closes: the last, partial bar of a day keeps changing until the threshold is crossed, so no signal may use it.',

    { h: 'Costs of activity bars' },
    {
      list: [
        'Their timestamps are irregular, so bars of two symbols do not line up on the clock.',
        'Sessions, the opening range and the close are clock ideas that time bars express directly.',
        'One very large trade can close a bar almost by itself; real implementations carry the overshoot over or split the trade.',
        'Bars should restart at each open, or one bar spans the overnight gap.',
      ],
    },
    'Use time bars for anything tied to the clock, for joining with other data and for execution. Use activity bars for research features where you want each observation to carry a similar amount of trading, and compare against time bars as a control.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Taking the close from the wrong row.',
        'Resetting the running total in the wrong place, so bars close on every trade.',
        'Fixing thresholds with hindsight.',
        'Using the unfinished last bar.',
      ],
    },
  ],

  'qdata-bias': [
    { h: 'Bias that lives in the data' },
    'The backtest module treated survivorship and lookahead as bugs in test code. Many of them are already in the data before you write a line, and they all push the same way: towards better-looking results. A **bias** here means a systematic error, one that does not average out.',

    { h: 'Survivorship' },
    { sub: 'A list of survivors' },
    'A vendor\'s list of "all US stocks" is usually today\'s list. Companies leave it through bankruptcy, mergers, going private or moving to another market. A history built only from companies alive today has quietly removed the failures. Suppose a universe had 20 stocks; 15 survived and gained 20% each, 5 failed and lost 80% each. The survivors average +20%, the whole universe (15 × 20% − 5 × 80%) ÷ 20 = −5%. No care in the backtest code can find the missing five.',
    { sub: 'Delisting returns' },
    'When a stock is **delisted**, removed from its exchange, holders still end up with something: cash from a merger, or very little after a collapse. The return from the last trade to that final value is the **delisting return**. CRSP, the database most academic studies use, keeps delisted stocks and these returns. Even there some are missing, and Tyler Shumway (1997) showed that the missing ones hide large losses for delistings caused by poor performance; he proposed filling them with a large negative return rather than leaving them out. A missing delisting return is usually a loss, not a zero.',
    { sub: 'Index membership' },
    'An index such as the S&P 500 adds companies that have grown and removes ones that have shrunk or failed. Today\'s member list is chosen with hindsight. A test going back years needs the members **on each date**. Building the universe from listing dates, each stock included from its first day to the day before it left, keeps the failures in.',

    { h: 'Look-ahead in the data' },
    'A value describes a period but becomes known at a later moment. Earnings for a quarter ending 31 March are published weeks later. An economic figure is released, then **revised** in later months. A change to an index is announced days before it takes effect. A file that stamps each value with the period it describes lets every backtest use it early.',

    { h: 'Point-in-time data' },
    { sub: 'Two dates per value' },
    '**Point-in-time** data stores two dates with each value: the period it describes and the **knowledge date**, when it became public. A query asks: what was known on day d? The answer is the latest value whose knowledge date is on or before d, the same as-of search used to join trades to quotes.',
    {
      code: `import numpy as np

known_on = np.array([45, 135, 225])
value = np.array([2.0, 2.4, 1.8])
for day in (44, 45, 200):
    i = np.searchsorted(known_on, day, side='right') - 1
    print(day, value[i] if i >= 0 else np.nan)`,
      out: `44 nan
45 2.0
200 2.4`,
    },
    'Before the first publication nothing is known, so the answer is `nan`, not the first value. Whether a figure published on day d is usable on day d depends on the time of day: earnings released after the close can only be traded the next morning. When unsure, lag the knowledge date by a day; erring late costs a little signal, erring early is look-ahead.',
    { sub: 'Restatements and vintages' },
    'Companies sometimes **restate** past results, and many databases overwrite the old figure. A backtest then uses numbers nobody had. If a stock traded at $30 with reported earnings of $2.00 a share, the market saw a price-to-earnings ratio of 15; a restated $1.50 makes the backtest see 20. Restatements cluster in companies in trouble, so the error has a direction. Economic data has the same problem; the St. Louis Fed keeps each past release (each **vintage**) of US series in its ALFRED archive for this reason.',

    { h: 'Identity: tickers are not ids' },
    'Tickers change on renames and mergers and are reused by unrelated companies. A join on ticker can glue two companies\' histories together. Use a permanent id, such as CRSP\'s PERMNO or a FIGI (Financial Instrument Global Identifier), and map tickers to it by date.',

    { h: 'Auditing a data set' },
    {
      list: [
        'Is the universe on each date built from listing dates or historical constituents?',
        'Are delisted stocks present, with delisting returns, and missing ones filled with a loss?',
        'Does every fundamental carry a knowledge date, with queries made as of the trading day?',
        'Are figures as first reported?',
        'Are joins on a permanent id?',
        'Does the result survive shifting the fundamentals one quarter later? A result that depends on a few days of timing is often look-ahead.',
      ],
    },
  ],

  'qdata-derivs': [
    { h: 'Futures contracts expire' },
    'A **futures contract** is an agreement to buy or sell something at a set price on a set date, its **expiry**. E-mini S&P 500 futures (ES) expire quarterly, on the third Friday of March, June, September and December, written with the month codes H, M, U and Z. Almost all trading sits in the nearest contract, the **front month**. So a ten-year history of "the S&P future" is really forty contracts in a row, and you have to decide how to glue them.',

    { h: 'Rolling' },
    'Traders **roll**: shortly before expiry they sell the expiring contract and buy the next one. At the time of writing (2026), CME\'s customary roll date for its US equity index futures is the Monday of expiration week; before a change in 2022 it was the Thursday a week before expiry. Another common rule is to roll when the next contract\'s daily volume overtakes the front one\'s. Check the current calendar on the exchange site.',
    'Two contracts trade at different prices. For an index future the gap mostly reflects **carry**: interest you save by not buying the shares, minus the dividends you miss. Roughly, F ≈ S × (1 + (r − q) × T), where S is the index, r the interest rate, q the dividend yield and T the years to expiry. For commodities storage costs add in.',

    { h: 'Three ways to glue contracts' },
    'Take a roll day on which the expiring contract is at 2,000 and the next at 2,010, and an earlier day when the expiring one was at 1,950.',
    { sub: 'Unadjusted' },
    'Use the front contract\'s raw price and switch at the roll. The series jumps 10 points on the roll day, a move nobody earned. Returns computed across it are wrong.',
    { sub: 'Back-adjusted' },
    'Add the gap, here +10, to every price before the roll, so the earlier 1,950 becomes 1,960. Each daily change in the result is a change of a contract you really held, so summed changes equal the dollar P&L of rolling. This is often called the **Panama** method. After many rolls the old prices drift far from anything that traded, sometimes below zero, which wrecks percentage returns.',
    { sub: 'Ratio-adjusted' },
    'Multiply earlier prices by the ratio 2,010 ÷ 2,000 instead: 1,950 becomes 1,959.75. Percentage moves are kept exactly; dollar moves are slightly off. Choose by what you measure.',
    { sub: 'Returns from the held contract' },
    'The cleanest route for research is to compute each day\'s return from the contract actually held that day and chain the returns. No return ever spans two contracts, so the gap never enters.',

    { h: 'Roll yield, contango and backwardation' },
    'When later contracts are dearer than nearer ones the curve is in **contango**; when they are cheaper, **backwardation**. In contango a long holder keeps selling the cheaper expiring contract and buying the dearer next one, which then drifts down towards the spot price as its own expiry approaches. That drag is the **roll yield**, and it is part of the real return. VIX futures are the well-known case: usually in contango, so long positions have tended to lose to the drift. An unadjusted series hides this: the drag disappears inside the upward jumps at each roll.',

    { h: 'Option chains' },
    { sub: 'Size' },
    'An option chain is far larger than a futures strip. An index ETF can have dozens of expiries, hundreds of strikes each, calls and puts. Ten expiries of 100 strikes is 2,000 contracts; a quote snapshot of each every minute of a 390-minute session is 780,000 rows a day, for one underlying.',
    { sub: 'The OCC symbol' },
    'Every listed US option has an **OCC symbol** (after the Options Clearing Corporation): the root padded with spaces to six characters, the expiry as YYMMDD, C or P, and the strike × 1,000 in eight digits. `AAPL  270115P00180000` is the Apple 180 put expiring 15 January 2027: the strike field `00180000` is 180,000 thousandths of a dollar. Parsing the symbol yourself checks the vendor\'s other columns.',

    { h: 'What a snapshot hides' },
    {
      list: [
        'Quotes on different strikes were taken at slightly different moments, and the underlying at that moment may be missing.',
        'Sizes are often absent, and the "last" price can be hours old on a thin strike.',
        'End-of-day files may be taken before the close: Cboe DataShop\'s end-of-day option files, at the time of writing (2026), carry a 15:45 snapshot as well as one at the close.',
        'Implied volatilities and Greeks come from the vendor\'s model, rates and dividends.',
        'Nothing says where you would have been filled. A buyer pays near the ask, a seller receives near the bid.',
        'Expired contracts vanish from a current chain: a backtest needs historical chains, which is survivorship again.',
      ],
    },

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Computing returns across a roll from an unadjusted series.',
        'Using back-adjusted prices for percentage returns over long histories.',
        'Reading the strike field with the wrong scale.',
        'Filling option trades at the last price or the mid on thin strikes.',
      ],
    },
  ],

  'qdata-sources': [
    { h: 'From exchange to your laptop' },
    'Market data starts at the **exchanges**, where orders meet. Each exchange sells its own direct feeds. In the US the **consolidated tape**, run by the **SIPs** (securities information processors), combines every exchange\'s trades and best quotes into one stream with the national best bid and offer, the **NBBO**. **Vendors** collect these feeds, clean them, normalise their formats and resell them. Each layer adds convenience and its own errors, gaps and choices, so every source needs checking.',

    { h: 'Free sources' },
    'Free data is fine for learning and rough research, if you know what it lacks. At the time of writing (2026):',
    {
      list: [
        'Yahoo Finance daily prices are widely used through `yfinance`, an unofficial open-source library that says it is not affiliated with Yahoo and is meant for personal use. It reads the website, so it can break when the site changes.',
        'The SEC\'s EDGAR system gives every US company filing for free, and data.sec.gov serves the reported financial figures as JSON, with a fair-access limit of 10 requests a second.',
        'FRED, from the Federal Reserve Bank of St. Louis, serves US economic series, and ALFRED their past vintages.',
      ],
    },
    'Free sources usually lack delisted companies, point-in-time fundamentals, raw unadjusted prices and long intraday history: exactly what the bias lesson said a serious test needs.',

    { h: 'Paid sources' },
    'Paid sources sell those missing pieces. As examples at the time of writing (2026), not recommendations: Databento prices historical data by usage per gigabyte and gives new users a $125 credit; Massive, the name Polygon.io took in October 2025, sells stock, option and other data by subscription; CRSP is the survivorship-free US stock database with delisting returns, usually reached through WRDS at universities; OptionMetrics IvyDB has historical option prices and implied volatilities from 1996; Cboe DataShop sells end-of-day option files from 2012 with a 15:45 and a closing snapshot. Prices, terms and even company names change often, so check the current offer and write down the date you checked.',

    { h: 'Licences' },
    'Data comes with a **licence**, and it matters as much as the price. Exchange fees differ for **professional** and **non-professional** users. Showing data on a screen (display use) and feeding it to a program that trades (non-display use) are priced separately. **Redistribution**, including showing live quotes on your own website, is usually forbidden without a separate agreement. Delayed and end-of-day data often has looser terms, but read them too.',

    { h: 'Sizing and pacing a download' },
    { sub: 'Bytes before buying' },
    'Size every request first: rows × bytes per row. Daily bars are tiny. A stock that prints 500,000 quote updates a day at 32 bytes each is 16 MB a day, about 4 GB over 252 trading days, for one name. Usage-priced data costs roughly gigabytes × price per gigabyte, so ask only for the symbols, fields and granularity a test needs.',
    { sub: 'Rate limits' },
    'A service that allows R requests a second needs a gap of at least 1 ÷ R seconds between requests. At 5 a second, 3,000 files take at least 600 seconds, ten minutes, before retries. Save each file as it arrives so a failure does not restart the job.',

    { h: 'Checking what arrives' },
    'Every source has errors, and the cheapest way to find them is a second source. Compare overlapping days with a tolerance and investigate each disagreement: a difference of exactly a half often means one vendor applied a split and the other did not. Write the comparison so that missing values count as disagreements. "Flag if the difference is too big" is False for `nan` and lets gaps pass silently; "flag unless close enough" catches them:',
    {
      code: `import numpy as np

a, b = np.array([20.0, np.nan]), np.array([20.5, 21.0])
print((np.abs(a - b) > 0.01 * b).tolist(), (~(np.abs(a - b) <= 0.01 * b)).tolist())`,
      out: '[True, False] [True, True]',
    },
    'For fundamentals, spot-check a few figures against the filings themselves, and store the EDGAR acceptance date as the knowledge date, later if the filing came after the close.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Running a 20-year test of a strategy that buys falling stocks on free data without delisted companies.',
        'Treating an unofficial scraper as a production data feed.',
        'Sharing paid live data with friends on a web page.',
        'Downloading terabytes before estimating the size.',
        'Trusting one source without a cross-check.',
      ],
    },
  ],

  'qdata-lab': [
    { h: 'What the pipeline does' },
    'Between raw minute bars and any research sits a **cleaning pipeline**: a fixed sequence of small functions that turn what the vendor sent into data you trust. This lab builds one in NumPy, on made-up data: adjust for a split, put every minute on a regular grid, catch bad ticks, resample to longer bars and compute returns that never span the overnight gap. Each step reuses an idea from an earlier lesson in this module.',

    { h: 'Why the order matters' },
    {
      list: [
        'Corporate actions first. A 2-for-1 split halves the price overnight, and a bad-tick filter run before the adjustment flags the split as the largest bad print in the file.',
        'Gaps second. Resampling by reshaping assumes every minute is present; with gaps, a row of n entries covers more than n minutes.',
        'Bad ticks third, on the regular grid, before anything is aggregated: a bad print inside a 5-minute bar sets a false high that no later step can undo.',
        'Resampling fourth, then returns last, so one bad print does not become two huge returns.',
      ],
    },

    { h: 'The steps one at a time' },
    { sub: 'Splits' },
    'Divide closes before each split index by its ratio and multiply volumes by it. Splits compound on the earliest prices. Work on a copy: the raw array is still needed for level-based rules and for checking your own output.',
    { sub: 'Filling the grid' },
    'Build every minute from the first to the last with `np.arange`, then find for each grid minute the last real bar at or before it with the as-of search, `searchsorted(..., side="right") - 1`. A grid minute is filled when the bar found has a different time. Filled minutes get the carried close, volume 0 and a flag.',
    { sub: 'Bad ticks against cleaned history' },
    'Judge each price against the median and MAD of the previous few prices. If you judge against the raw history, one bad print widens the window and helps a second one through. Judging against already-cleaned prices, and replacing a flagged print with the previous clean price, avoids that. It also means a genuine jump keeps being "repaired" until the window catches up, which is why flags are counted and reviewed, not trusted blindly.',
    { sub: 'Resampling by reshape' },
    'On a complete grid, n-minute bars are a reshape into rows of n, after dropping an unfinished last group. Each row is one bar in time order, so the open is the first column and the close the last:',
    {
      code: `import numpy as np

c = np.arange(10.0, 22.0)
bars = c.reshape(-1, 4)
print(bars[:, 0].tolist(), bars[:, -1].tolist())`,
      out: '[10.0, 14.0, 18.0] [13.0, 17.0, 21.0]',
    },
    'Highs are the row maximum, lows the row minimum and volume the row sum, all with `axis=1`.',
    { sub: 'Returns within a session' },
    'Take log returns, `np.diff(np.log(close))`, and keep only those whose two bars belong to the same day. The overnight move follows hours without trading and often news; mixed into intraday returns it inflates their volatility and adds tails that belong to the gap. Study it separately.',

    { h: 'Testing each step' },
    'Each function gets a tiny hand-made case whose answer you can work out on paper: three prices and one split, five minutes with two missing, eight prices with one spike. Bugs in this kind of code are silent. An inverted mask, a close taken from the first column, a window off by one: each produces numbers that look plausible. A test with a known answer is the only thing that catches them.',
    { sub: 'The lookahead test' },
    'A direct test for leakage: change a value late in the input and check that no earlier output moves. A trailing calculation passes; a centred one fails.',
    {
      code: `import numpy as np

x = np.array([1.0, 2, 3, 4, 5, 6]); y = x.copy(); y[5] = 60
centred = lambda a: np.convolve(a, np.ones(3) / 3, mode='same')
trailing = lambda a: np.array([a[max(0, t - 2):t + 1].mean() for t in range(len(a))])
print(np.nonzero(centred(x) != centred(y))[0].tolist(), np.nonzero(trailing(x) != trailing(y))[0].tolist())`,
      out: '[4, 5] [5]',
    },
    'Changing the value at index 5 moved the centred average at index 4: it used the future. The trailing one changed only at 5.',

    { h: 'From a script to a pipeline you can trust' },
    'Run nightly on hundreds of symbols, the same functions need more around them: raw files kept untouched with cleaned output written elsewhere and versioned; a log of every change by symbol, time and rule; counts of filled minutes and flagged ticks per run, where a sudden jump means a feed problem; the corporate actions table updated before cleaning; and a regular comparison against a second source. None of this makes a strategy profitable. It makes a result believable enough to be worth testing further.',
  ],
}
