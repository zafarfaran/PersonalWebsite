import type { Block } from '../../types'

/** The full theory for each lesson of the profile module, keyed by lesson id. */
export const profileTheory: Record<string, Block[]> = {
  'profile-volume': [
    { h: 'Where trade happened, not when' },
    'Remember from the charts module that a **bar** sums up one slice of time with five numbers: open, high, low, close and **volume**, the number of shares traded. The volume bars drawn under a price chart therefore answer one question: when did the trading happen? A busy open, a quiet lunch and a busy close show up as tall, short and tall bars.',
    'A **volume profile** asks a different question: at what price did the trading happen? It takes the same trades and adds up the shares traded at each price, ignoring the time. The totals are drawn as horizontal bars beside the price axis, so the chart looks like a histogram turned on its side. A long bar means many shares changed hands at that price. A short bar means the market passed that price with little trade.',

    { h: 'Building a profile from trades' },
    { sub: 'Rows' },
    'A price can be any cent, so the profile groups prices into **rows**: bands of a fixed size, such as 5 or 10 cents on SPY. Each trade is put in the row nearest its price, and its shares are added to that row. If you have every trade (the record of trades is called **time and sales**, from the order flow module), the profile is exact.',
    {
      code: `trades = [(301.22, 200), (301.31, 100), (301.19, 400), (301.38, 300)]
rows = {}
for price, size in trades:
    row = round(round(price / 0.10) * 0.10, 2)
    rows[row] = rows.get(row, 0) + size
print(rows)`,
      out: '{301.2: 600, 301.3: 100, 301.4: 300}',
    },
    '`price / 0.10` counts how many 10-cent steps the price is from zero, and the inner `round` picks the nearest whole step. Multiplying back by 0.10 gives the row price. The trades at 301.22 and 301.19 both land in the 301.20 row, which ends up the fattest with 600 shares although neither trade was the largest.',
    { sub: 'Why the outer round' },
    'Computers store prices like 301.3 as binary fractions that are very slightly off, so `3013 * 0.10` can come out as 301.30000000000001. Without the outer `round(..., 2)` the same price could create two different dictionary keys and split one row in two. Working in whole row numbers and turning them into prices at the end avoids the problem.',

    { h: 'Building a profile from bars' },
    { sub: 'The even spread' },
    'Often you only have bars, not trades. A bar tells you the volume and the range, but not where inside the range the shares traded. The usual approximation spreads the volume evenly over every row the bar touched, from the low to the high with both ends included. A bar with low 300.00, high 300.40 and 1,000 shares touches five 10-cent rows (300.00, 300.10, 300.20, 300.30, 300.40), so each gets 200 shares. Counting only four rows is the classic slip, and it drops the row at the high.',
    { sub: 'Other approximations' },
    'Some platforms put all of a bar\'s volume at its close, or at its typical price. On the bar above, the close method would put all 1,000 shares in one row. The approximations disagree most when bars are long, so a profile from 1-minute bars is much closer to the truth than one from 30-minute bars.',

    { h: 'Choosing the row size' },
    'Small rows show detail but are jagged: traders like round prices, so whole and half dollars collect spikes of volume. Large rows are smooth, but each row is then a band. With 50-cent rows, the busiest "price" is really a 50-cent zone. The total volume does not change with the row size, only how it is grouped. Pick a size that suits the instrument and keep it fixed, so that levels from different days are comparable.',

    { h: 'The profile and the volume bars together' },
    'Every share traded sits in exactly one time bar and exactly one row, so the profile and the volume bars always have the same total. What the profile throws away is the order of events: a row cannot tell you whether its volume came at the open or the close. This matters on a real day. US shares trade most heavily near the open and the close (the U shape from the charts module), so prices visited at the open tend to collect fat rows even if price only stayed there briefly. The profile mixes time spent at a price with how busy that time was.',
    'Watching a profile build through a day, rows only ever grow, because trades are only added. The fattest row can change as a new area collects volume in the afternoon.',

    { h: 'What a profile is for' },
    'A profile is a record of where the market did business. It sits well beside the levels from the charts module: yesterday\'s high and low, round numbers, VWAP. It does not tell you where price goes next, and it is not a set of magnets. The rest of this module builds levels from it, and every one of them is a description you can use as context and test in your own records.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Reading a profile built from coarse bars as if it were exact.',
        'Leaving out the row at a bar\'s high when spreading its volume.',
        'Changing the row size until the picture looks convincing.',
        'Mixing profiles with and without premarket trades.',
        'Treating a fat row as a price the market must return to.',
      ],
    },
  ],

  'profile-value': [
    { h: 'The busiest price and the busy band' },
    'Once you have a profile, two summaries are used everywhere. The **point of control** (POC) is the single row with the most volume. The **value area** is a band of neighbouring rows around the POC that holds a chosen share of the day\'s volume, usually 70%. Its top row is the **value area high** (VAH) and its bottom row the **value area low** (VAL). Platforms draw these for you, but they do not all compute them the same way, so it pays to know the steps.',

    { h: 'The point of control' },
    'Find the row with the largest volume and read off its price. The POC is a price, not a volume. When two rows tie, a common convention takes the one nearer the middle of the day\'s range, and if they are equally near, the lower one. Other platforms take the first or the last. The tie rule rarely matters on a busy instrument, but it is one of the small reasons two charts of the same day can differ.',

    { h: 'Growing the value area' },
    { sub: 'The rule this course uses' },
    {
      list: [
        'Add up the total volume and take 70% of it: the target.',
        'Start with the POC row alone.',
        'Look at the next row above the band and the next row below it.',
        'Add whichever has more volume. On a tie, add the one above. A side with no rows left is never chosen.',
        'Stop as soon as the band holds at least the target.',
      ],
    },
    'Because it stops at the first step that reaches the target, the band usually holds a little more than 70%.',
    { sub: 'A worked example' },
    'Rows from 50 to 56 hold 2, 7, 12, 9, 11, 4 and 1 thousand shares: 46 thousand in all, so the target is 32.2. The POC is 52 with 12. Above is 53 (9), below is 51 (7): add 53, total 21. Next, 54 (11) against 51 (7): add 54, total 32, still short of 32.2. Next, 55 (4) against 51 (7): add 51, total 39. The value area runs from 51 to 54.',
    {
      code: `vols = [2, 7, 12, 9, 11, 4, 1]          # prices 50 to 56
poc = vols.index(max(vols))
lo = hi = poc
taken = vols[poc]
while taken < 0.70 * sum(vols):
    up = vols[hi + 1] if hi + 1 < len(vols) else -1
    down = vols[lo - 1] if lo > 0 else -1
    if up >= down:
        hi += 1; taken += up
    else:
        lo -= 1; taken += down
print(50 + lo, 50 + hi, round(taken / sum(vols), 3))`,
      out: '51 54 0.848',
    },
    { sub: 'The edges of the list' },
    'When the band reaches the top or bottom row there is nothing further on that side. Using -1 for the missing side means it can never win the comparison. Be careful with the bottom: in Python `vols[-1]` is the last item of the list, so a check written as `lo >= 0` would quietly read the top row when `lo` is 0. The check must be `lo > 0`.',

    { h: 'Why platforms disagree' },
    'The classic Market Profile method compares the next **two** rows on each side and adds the larger pair. Some platforms document a one-row comparison, as used here. On the example above, comparing pairs adds 53 and 54 together first (20 against 9), and the band can end in a different place from the one-row method. Platforms also differ on the tie rule, the row size, whether the overnight or premarket session is included, and the percentage itself (68%, 70% and 80% are all seen). A VAH that differs by a row or two between two charts is normal. Treat value area edges as zones, the way the charts module treated support and resistance.',

    { h: 'Why 70 per cent' },
    'The figure comes from statistics. A **normal distribution** is the bell-shaped curve that many measurements follow, and its **standard deviation** measures how spread out it is. About 68% of a normal distribution lies within one standard deviation either side of the middle. Early Market Profile material borrowed this and rounded it to 70%. It is a convention, not a fact about markets. Many days do not have a bell-shaped profile at all, and the percentage you choose moves the edges.',

    { h: 'Reading the levels on a trading day' },
    'The value area is the band of prices where most of the day\'s business was done: the prices the market accepted. A useful check is how much of the day\'s range it covers. If a day traded from 300.00 to 304.00 and its value area ran from 301.00 to 302.60, value covered 1.60 ÷ 4.00 = 0.40 of the range: most shares traded in a narrow band and the extremes were visited briefly. Lopsided profiles are common too, and the POC can sit at the very edge of its own value area when volume is heavier on one side. None of these levels is a price the market must come back to.',

    { h: 'Common mistakes' },
    {
      list: [
        'Comparing your levels with someone else\'s without knowing either method.',
        'Adding rows past the target, or stopping one row short of it.',
        'Reading the volume of the POC instead of its price.',
        'Treating VAH and VAL as exact prices rather than zones.',
      ],
    },
  ],

  'profile-nodes': [
    { h: 'Peaks and valleys' },
    'A profile is rarely one smooth hump. Many days trade in one area for a while, move, and trade in another. The profile then has two or more peaks with thin stretches between them. A **high volume node** (HVN) is a peak: a group of rows with much more volume than the rows around it. A **low volume node** (LVN) is a valley between peaks: a group of thin rows. The POC is the tallest HVN. The thin rows at the very top and bottom of a profile are not usually called LVNs, because they are the ends of the day, not a gap between two areas of trade.',

    { h: 'Acceptance and rejection' },
    'Profile traders use two words for what nodes record. Where the market spent time and did a lot of business, the price was **accepted**: buyers and sellers both found it fair enough to trade there. Where price moved through quickly with little trade, the price was **rejected**, or skipped. In practice, acceptance is judged by time and volume building at a price; rejection by a quick return. A move into a thin area that is pushed back within minutes on light volume reads as rejection. A move that stays, and builds a new node, reads as acceptance. You only know which it was afterwards, so a plan needs a rule for deciding, with a time limit.',

    { h: 'Finding nodes with a rule' },
    { sub: 'The window rule' },
    'Eyeballing nodes invites seeing what you want. A rule like the swing points of the charts module works: a row is an HVN if its volume is strictly above each of the `k` rows on either side, and an LVN if it is strictly below each of them.',
    {
      code: `v = [4, 9, 6, 2, 3, 8, 12, 7]
k = 1
hvn = [i for i in range(k, len(v) - k) if v[i] > max(v[i - k:i] + v[i + 1:i + k + 1])]
lvn = [i for i in range(k, len(v) - k) if v[i] < min(v[i - k:i] + v[i + 1:i + k + 1])]
print(hvn, lvn)`,
      out: '[1, 6] [3]',
    },
    '`v[i - k:i]` is the `k` rows below row `i` and `v[i + 1:i + k + 1]` the `k` rows above. Adding two lists joins them, so `max` and `min` see both sides at once. The loop starts at `k` and stops `k` rows before the end, because rows near the ends do not have `k` neighbours on both sides.',
    { sub: 'Choosing k and smoothing' },
    'A small `k` marks every wiggle; a large one keeps only the big features, so raising `k` can only remove nodes. Very small rows make a profile jagged, because traders cluster orders at round prices. Smoothing first helps: replace each row by the average of itself and its neighbours.',
    {
      code: `v = [5, 1, 6, 2, 7, 3]
smooth = [round(sum(v[max(0, i - 1):i + 2]) / len(v[max(0, i - 1):i + 2]), 2) for i in range(len(v))]
print(smooth)`,
      out: '[3.0, 4.0, 3.0, 5.0, 4.0, 5.0]',
    },
    'The saw-tooth of the raw rows is much flatter after smoothing, so a valley has to be several rows wide to survive. Whatever you choose, fix it in advance.',

    { h: 'Fast through thin, slow through thick' },
    'A popular claim is that price moves fast through LVNs and slows down at HVNs. Part of this is true by construction. A row is thin because price spent little time and volume there on that day, so in the past price did pass it quickly. Whether it will move quickly through the same prices next time is a separate question. The orders resting in the market today are not in yesterday\'s profile. Sometimes price slices through an old LVN; sometimes it stops in it and builds a new node. Treat the claim as something to count in your own data, not as a law.',

    { h: 'Using nodes on a trading day' },
    'Traders mark the edges of HVNs and the middle of LVNs as zones to watch, beside the levels they already have. Nodes give distances. Suppose you buy at 300.60 at the top edge of a node, with a stop at 300.20 below it, and the next node starts at 302.00 beyond a thin area. The reward if the target is reached is 1.40 and the risk 0.40, a ratio of 3.5. That ratio says nothing about how often price reaches 302.00. Only your records can say that.',
    'You can also measure how concentrated a node is: the share of the day\'s volume in its rows. A node holding 40% of the volume in a fifth of the rows is a strong area of acceptance on that day.',

    { h: 'Common mistakes' },
    {
      list: [
        'Calling the thin ends of the profile LVNs.',
        'Taking a slice one row short, so the window checks too few neighbours.',
        'Finding nodes on a jagged 1-cent profile without smoothing.',
        'Treating "fast through thin" as certain.',
        'Calling acceptance or rejection without a rule decided in advance.',
      ],
    },
  ],

  'profile-auction': [
    { h: 'The market as an auction' },
    '**Auction market theory** is the way of thinking behind the profile. It treats the market as a continuous two-way auction. When price rises it is looking for sellers; when it falls it is looking for buyers. When it finds a price where both sides are willing to trade, business builds there. When a price attracts no one, the auction moves on. The profile is the record of that search: fat where the auction settled, thin where it passed through.',

    { h: 'Price, time and volume' },
    'Teachers of the theory sum it up as "price advertises, time regulates, volume measures". A new price is an advertisement: here is an opportunity to trade. Time spent at the price and volume traded there measure how many people took it up. A rally to a new high that lasts a few minutes on thin volume advertised a price nobody wanted. The same rally followed by an hour of heavy trade at the new level was taken up. This is the acceptance and rejection of the previous lesson, seen as an auction.',

    { h: 'Balance and imbalance' },
    { sub: 'Balance' },
    'In **balance**, price rotates up and down inside a range. Buyers step in near the bottom, sellers near the top, and the value areas of successive days overlap. The market broadly agrees what the instrument is worth.',
    { sub: 'Imbalance and value migration' },
    'In **imbalance**, one side is in control. Price moves directionally and **value migrates**: each day\'s value area sits above (or below) the one before with little overlap. Markets alternate between the two, and a balance area often ends with a move into imbalance and a new balance somewhere else.',
    'Overlap can be measured. For two value areas, the overlap runs from the higher of the two lows to the lower of the two highs, or is zero if that is negative.',
    {
      code: `def overlap(a, b):
    return max(0.0, min(a[1], b[1]) - max(a[0], b[0]))

print(overlap((300, 305), (303, 306)), overlap((300, 302), (303, 306)))`,
      out: '2 0.0',
    },
    'Value areas of 300 to 305 and 303 to 306 overlap by 2 dollars, two thirds of the second area\'s width of 3. Areas of 300 to 302 and 303 to 306 do not overlap at all: value moved completely. Recording the overlap turns "balanced or moving" into a number.',

    { h: 'Price against value' },
    'When price trades outside the value area, the market is testing whether a new price is fair. Two outcomes are possible. If trade builds outside, the price is accepted and value moves to it. If it does not, the price is rejected and tends to come back toward value. Which will happen is not known in advance, and this is where most profile-based decisions are made. A useful yardstick is how far outside value price is, measured in value-area widths: 1.50 dollars above a 3-dollar value area is half a width.',

    { h: 'Initiative and responsive activity' },
    'The theory names activity by where it happens relative to value:',
    {
      list: [
        '**Initiative buying**: buying above the value area, at prices the market has not yet accepted.',
        '**Initiative selling**: selling below the value area.',
        '**Responsive buying**: buying below value, responding to a price that looks cheap.',
        '**Responsive selling**: selling above value, responding to a price that looks dear.',
      ],
    },
    'Responsive activity is what keeps a market in balance. Initiative activity that is accepted is what moves value.',
    { sub: 'Excess and tails' },
    'A long thin tail of rows at the day\'s high or low, visited briefly and left fast, is called **excess**. It is read as a strong response that ended the auction in that direction for the day. It describes the day. Many tails hold for a while, and some are traded straight through the next session.',

    { h: 'Day timeframe and other timeframe' },
    'Auction teachers separate the **day timeframe** trader, who must be flat by the close, from the **other timeframe** trader: funds and longer-term traders whose larger orders move value over days. Wide ranges, initiative activity and migrating value are read as signs that the other timeframe is active. A day trader uses that to choose between setups that expect rotation and setups that expect movement.',

    { h: 'Using the vocabulary honestly' },
    'Auction theory gives you a clear way to describe a market: balanced or moving, price inside or outside value, initiative or responsive, accepted or rejected. That is valuable because it forces you to state a view and what would show it wrong. It is not a forecasting machine. Used loosely, the same words can explain any outcome after the fact, which is the warning sign of a story rather than a method.',
  ],

  'profile-tpo': [
    { h: 'Market Profile: a profile of time' },
    '**Market Profile** came before the volume profile. It was devised by J. Peter Steidlmayer, a trader at the Chicago Board of Trade (CBOT, now part of CME Group), and the exchange introduced it to the public in 1985. Steidlmayer wanted to see how value developed through a day. Instead of counting volume at each price, Market Profile counts time.',

    { h: 'Letters and TPOs' },
    { sub: 'Lettering the session' },
    'The day is cut into half hours, and each half hour gets a letter. For US shares the regular session runs from 9:30 to 16:00, 390 minutes, which is 13 half hours: A for 9:30 to 10:00, B for 10:00 to 10:30, and so on to M for 15:30 to 16:00. In every price row the market traded during a half hour, that half hour\'s letter is written. Each letter is a **TPO**, short for time price opportunity. Platforms differ in lettering (some letter the overnight session too, some use lower case), so check yours.',
    { sub: 'Collapsing the letters' },
    'Push all the letters in each row to the left and you get a profile made of letters: rows with many letters are prices the market visited in many half hours.',
    {
      code: `periods = [(10, 13), (11, 15), (12, 14)]
letters = "ABC"
tpo = {}
for i, (lo, hi) in enumerate(periods):
    for row in range(lo, hi + 1):
        tpo[row] = tpo.get(row, "") + letters[i]
for row in sorted(tpo, reverse=True):
    print(row, tpo[row])`,
      out: '15 B\n14 BC\n13 ABC\n12 ABC\n11 AB\n10 A',
    },
    'Each period is given as its low and high row. `range(lo, hi + 1)` includes both ends, because the period traded at its high and its low. Printing from the highest row down gives the familiar picture.',

    { h: 'The TPO point of control and value area' },
    'The **TPO POC** is the row with the most letters, with ties usually going to the row nearer the middle of the range. A TPO value area is built from the letter counts with the same expansion method as a volume value area. TPO and volume levels often differ. A quiet hour at one price adds two letters and little volume; a frantic ten minutes at another adds one letter and a lot of volume. Both are true descriptions of the day; they measure different things.',

    { h: 'The initial balance and range extension' },
    'The **initial balance** (IB) is the range of the first hour: from the lowest low to the highest high of periods A and B together. If A traded from 300.10 to 300.90 and B from 300.40 to 301.30, the IB runs from 300.10 to 301.30, a width of 1.20. Trading beyond the IB later in the day is **range extension**. If that day ends with a range from 299.70 to 301.30, the range is 1.60, which is 1.33 times the IB, all of the extension being on the downside. Comparing the day\'s range with the IB is the main number behind the day types below.',

    { h: 'Single prints and tails' },
    'A row with only one letter was traded in only one half hour: price moved through it quickly. These are **single prints**. A run of single prints in the middle of a profile separates two areas of trade, a TPO version of a low volume node. At the top or bottom of the day, single prints form a **tail**, the excess of the auction lesson.',

    { h: 'Day types' },
    'Jim Dalton\'s books (Mind Over Markets is the best known) describe day types by how the day develops from its initial balance. The thresholds are rough, and a day\'s type is only certain at the close.',
    { sub: 'Days that stay near the first hour' },
    {
      list: [
        '**Normal**: a wide IB that holds most of the day, with little range extension.',
        '**Normal variation**: range extension on one side, taking the range to about twice the IB.',
        '**Neutral**: range extension on both sides of the IB, often closing in the middle.',
        '**Non-trend**: a narrow, quiet day with little activity.',
      ],
    },
    { sub: 'Days that move' },
    {
      list: [
        '**Trend**: opens near one end and closes near the other; the IB is a small part of a long, thin profile, often with single prints.',
        '**Double distribution**: a quiet first area, a fast move, then a second area, the two separated by single prints.',
      ],
    },

    { h: 'Profile shapes and their readings' },
    'Shapes are named after letters. A **D** shape is fat in the middle and thin at both ends: a balanced day. A **P** shape has a fat top and a thin stretch below: price rose quickly and then traded a lot near the top. It is often read as **short covering**, meaning traders who had sold short buying back, rather than new buying. A **b** shape is the mirror image, often read as **long liquidation**, holders selling out. The chart records the move and the time spent; who was trading is an interpretation, because the data does not say. Use the shapes to describe and review days, and test anything you build on them.',
  ],

  'profile-which': [
    { h: 'One profile, many periods' },
    'A profile can be built over any stretch of time, and each choice answers a different question. The levels it gives differ too, so name the one you use.',
    { sub: 'Session profiles' },
    'A **session profile** covers one day. For US shares that usually means the regular session, 9:30 to 16:00, though some platforms include premarket trades. Index futures such as ES trade nearly around the clock, so their traders choose between a regular-hours profile and a full-session profile that adds the overnight trading. The two can have different POCs and value areas for the same day.',
    { sub: 'Composite profiles' },
    'A **composite profile** adds several sessions together, for example the last two weeks. It shows the larger area of balance that the daily profiles are part of, and where the most business was done over the whole period.',
    { sub: 'Anchored and fixed range profiles' },
    'A **fixed range** or **anchored** profile starts at a point you choose: a news release, the start of a sharp move, the open. It isolates the trading since that point, which a full-day profile would mix with everything before it.',

    { h: 'Yesterday\'s levels' },
    'The levels day traders carry over most are **yesterday\'s POC, VAH and VAL**, marked beside yesterday\'s high, low and close from the charts module. A **naked POC** (also called a virgin POC) is the POC of an earlier session that price has not traded at since. Some traders mark them and expect price to return. Over a long enough time price revisits most nearby prices, so the claim only means something with a time limit, and whether naked POCs attract price more than any other old price is a question for data.',

    { h: 'Reading the open against yesterday\'s value' },
    'Where today opens relative to yesterday\'s value is a common way to frame the day:',
    {
      list: [
        '**Inside value**: the market accepts yesterday\'s prices for now; a rotational day is more likely, though not certain.',
        '**Outside value but inside yesterday\'s range**: the market is testing prices that were traded only briefly yesterday.',
        '**Outside yesterday\'s range**: a stronger sign of imbalance, with value possibly moving.',
      ],
    },
    {
      code: `def open_type(o, val, vah, low, high):
    if val <= o <= vah:
        return "inside value"
    if low <= o <= high:
        return "outside value"
    return "outside range"

print(open_type(301.5, 300, 303, 298, 305), "/", open_type(297, 300, 303, 298, 305))`,
      out: 'inside value / outside range',
    },
    'The order of the checks matters: value lies inside the range, so value is checked first. These labels choose which setups to look for. They are not forecasts.',

    { h: 'The 80% rule as a claim' },
    'The best-known rule of thumb in this area is the **80% rule**, usually credited to Jim Dalton\'s work. It says: if the market opens outside yesterday\'s value area and then trades back inside it for two consecutive half-hour periods, there is a high chance, the name says 80%, that it travels through the whole value area to the other side.',
    'Versions differ. Some need one half-hour period inside, some two; some use a TPO value area, some a volume one; some use the regular session, some the full session; and they differ on how long the market has to reach the other side. Tests reported by independent traders generally come in well below 80%, and there is no reliable published figure. That does not make the idea useless. It makes it a hypothesis.',
    { sub: 'Writing it down exactly' },
    'To test it you must define every part: which opens count, what "inside" means (closes within VAL to VAH, ends included, for example), which two periods, and which later prices can count as reaching the other side. Only prices after the trigger may count. A high made before the trigger was in place is not something a trader could have used, and counting it is **lookahead**, which inflates the success rate.',

    { h: 'How much a few dozen days can tell you' },
    'A success rate from a small sample is uncertain. A common measure is the **standard error** of a rate, √(p × (1 − p) ÷ n), where p is the rate found and n the number of cases. Roughly, the true rate is likely to lie within two standard errors of the one you found.',
    {
      code: `import math
p, n = 0.70, 40
se = math.sqrt(p * (1 - p) / n)
print(round(se, 3), round(p - 2 * se, 2), round(p + 2 * se, 2))`,
      out: '0.072 0.56 0.84',
    },
    'Seventy per cent from 40 days could be anything from about 56% to 84%. Two websites quoting very different rates for "the same" rule usually tested different definitions on small samples. The backtest module returns to sample size in detail.',

    { h: 'Common mistakes' },
    {
      list: [
        'Mixing regular-session and full-session profiles in the same notes.',
        'Quoting a success rate without the exact rule behind it.',
        'Counting prices from before the trigger.',
        'Testing without a time limit, so that "eventually" counts as success.',
        'Judging a rule by its hit rate alone, without entries, stops and costs.',
      ],
    },
  ],

  'profile-trading': [
    { h: 'Levels as places to decide' },
    'The profile gives you a handful of levels: yesterday\'s POC, VAH and VAL, the edges of nodes, today\'s developing value. Use them the way the charts module used support and resistance. They are zones where you decide whether to act, with a stop beyond the zone and a target at the next level. They tell you where you would be wrong and how far the next obstacle is. They do not tell you that price will turn.',

    { h: 'Reward to risk from profile levels' },
    'For a long trade, the **risk** per share is entry minus stop and the **reward** is target minus entry. Their ratio is the reward to risk. Suppose price has come back inside value from below and you plan to buy at 300.40, with a stop at 299.85 under today\'s low and a first target at yesterday\'s POC, 301.50. The reward is 1.10, the risk 0.55, a ratio of 2. Building the stop from the nearest level below the entry and the target from the nearest level above makes this a calculation rather than a hope. If there is no level on one side, there is no plan.',

    { h: 'VWAP and the POC: mean and mode' },
    'Remember from the charts module that **VWAP** is the volume-weighted average price of the day. The POC is the price where the most shares traded. In statistics the first is a **mean** and the second a **mode**.',
    {
      code: `rows = {20: 1000, 21: 1000, 22: 4000}
vwap = sum(p * v for p, v in rows.items()) / sum(rows.values())
poc = max(rows, key=rows.get)
print(vwap, poc)`,
      out: '21.5 22',
    },
    'The mean is pulled toward every trade, the mode only shows the busiest price. On a balanced day the two are often close. On a trend day VWAP moves with the trend while the POC can stay where the heaviest trading was, often in the morning. Neither gap is a pull: it describes how the day traded. Agreement of VWAP and the POC at one price describes a balanced day; it is not a stronger signal in itself.',

    { h: 'The profile and order flow' },
    'Order flow, from the previous module, is the close-up view of who is trading aggressively right now. The profile says where to look; order flow shows what happens there. A trader waiting to buy at yesterday\'s VAL might require that heavy aggressive selling there fails to push price lower (absorption) before entering. That is a reasonable condition to write into a setup. It does not make the trade certain, so the stop and size stay as planned.',

    { h: 'A setup written as rules' },
    'A setup is only testable when someone else could follow it and mark the same trades:',
    {
      list: [
        '**Context**: for example, an open below yesterday\'s value, with the value area method stated.',
        '**Trigger**: an exact condition, such as two half-hour closes back inside value.',
        '**Entry, stop and targets**: from the levels, with a minimum reward to risk.',
        '**Time stop**: if the trade has not worked by a set time, it is closed.',
        '**Stand aside**: news due, a trend day developing, too many levels bunched together.',
        '**Size**: a fixed fraction of the account at risk, inside a daily loss limit.',
      ],
    },
    { sub: 'Judging results in R' },
    'Traders often measure results in **R**, the amount risked on a trade. A trade that loses its full stop is −1R; one that makes twice the risk is +2R. If a setup wins 40% of the time, its winners average +2.5R and its losers −1R, the average trade is 0.4 × 2.5 − 0.6 × 1 = +0.4R before costs. Spreads, slippage and fees come out of that, and the risk module shows how fast a small edge can disappear.',

    { h: 'How it fails' },
    { sub: 'Trend days' },
    'On a trend day value migrates and every level is traded through in turn: VAL, POC, VAH, yesterday\'s high. A trader who fades each one, selling every test of resistance, loses again and again on the one day that matters most. A plan needs a rule that stops fades, for example after two closes beyond the initial balance on the same side.',
    { sub: 'Too many lines' },
    'Marking several days of POCs, every node, both value edges, VWAP and its bands gives a chart where price is always near a level. The levels then mean nothing, because any move can be described as a reaction to one of them. Keep a few, chosen before the session.',
    { sub: 'Claims sold as facts' },
    'Profile levels are marketed as magnets with impressive hit rates. A hit rate with no definition, no time limit and no costs is not evidence. Ask for the exact rule and test it yourself.',

    { h: 'The honest frame' },
    'The profile describes where business was done. It can help you choose where to act and where you are wrong. Whether a setup built on it has an edge can only be found by writing it as rules, testing it with costs, then paper trading and trading the smallest size. Most retail day traders lose money, and a well-drawn profile does not change that on its own.',
  ],

  'profile-lab': [
    { h: 'What the lab builds' },
    'The lab builds a volume profile from scratch in plain Python: rows from trades and from bars, the point of control, the value area and the nodes. Platforms compute these for you, but they hide their settings and they differ from each other. Writing the method yourself means you know exactly what every level means, and you can use the same code in a backtest without guessing what a platform did.',

    { h: 'Representing a profile' },
    { sub: 'Two lists' },
    'A profile is held as two lists of the same length: `prices`, ascending in steps of the row size, and `vols`, the volume in each row. Index `i` in one list belongs with index `i` in the other.',
    { sub: 'Empty rows and whole row numbers' },
    'Every row from the lowest to the highest traded price is included, with volume 0 where nothing traded. This matters for the value area, which grows one neighbouring row at a time: without the empty rows, a gap in the prices would look like two neighbouring rows. Prices are turned into whole row numbers with `round(price / size)`, all the adding is done on those integers, and they are turned back into prices with `round(k * size, 2)` at the end. That avoids float keys such as 450.30000000000001.',

    { h: 'From trades and from bars' },
    'From trades, each trade adds its shares to its row. From bars of (high, low, volume), each bar\'s volume is spread evenly over every row from its low to its high. A bar covering rows `lo` to `hi` covers `hi - lo + 1` rows, so that is the divisor. Dividing by `hi - lo` instead gives each row too much, makes the profile add up to more than the volume traded, and divides by zero for a bar whose high equals its low. A quick test that catches this family of mistakes: the rows must add up to the total volume.',

    { h: 'The point of control and its ties' },
    'The POC is the row with the most volume. The tie rule used here takes the tied row nearest the middle of the list, then the lower one. Twice the distance from the middle of `n` rows is `abs(2 * i - (n - 1))`, which stays a whole number.',
    {
      code: `vols = [6, 2, 6, 6, 1]
n = len(vols)
tied = [i for i in range(n) if vols[i] == max(vols)]
print(tied, min(tied, key=lambda i: (abs(2 * i - (n - 1)), i)))`,
      out: '[0, 2, 3] 2',
    },
    'Three rows tie at 6. The middle of five rows is index 2, which is itself tied, so it wins. The key is a pair: Python compares the distance first and the index second, which is what breaks a tie between two rows equally far from the middle. `vols.index(max(vols))` would have picked index 0, the lowest tied row, which biases the POC down.',

    { h: 'The value area, exactly' },
    { sub: 'One row at a time' },
    'Start at the POC. While the band holds less than 70% of the total, compare the next row above with the next row below, counting a missing side as -1, and add the larger (the one above on a tie). Return the indices of the bottom and top rows and the share of volume inside. Because the band is built from neighbouring rows, it can include empty rows: if volume sits at both ends of a gap, the band has to climb through the gap to reach it. A value area can therefore contain prices where nothing traded, one more reason to read it as a zone.',
    { sub: 'Two rows at a time' },
    'The classic method compares pairs of rows. The lab runs both on the same profile so you can see the edges move. Neither is wrong; they are different definitions, and the one you test must be the one you trade.',

    { h: 'Nodes' },
    'An HVN is a row strictly above each of the `k` rows on both sides, an LVN a row strictly below them. Joining the two sides into one list keeps the condition short, and rows without `k` neighbours on each side are skipped. Equal neighbours fail a strict comparison, so a flat top of two equal rows is not reported. Smoothing first usually breaks such ties.',

    { h: 'Checking your work' },
    'Test each function on a case small enough to work by hand, and keep the tests with the code. Compare your levels with your platform on the same session: a difference of a row usually comes from the method, a larger one from a bug or different data. Write the method down: data source, row size, session, tie rule, one or two rows, the percentage. Finally, in any backtest, use only profiles that were complete at the time of the decision. Yesterday\'s value area is known this morning; today\'s final value area is not known until the close, and using it earlier is lookahead.',
  ],
}
