import type { Module } from '../types'

export const profile: Module = {
  id: 'profile',
  title: 'Volume profile and auction market theory',
  summary: 'Where the volume traded rather than when: building a volume profile, the point of control and value area, high and low volume nodes, market profile letters and day types, and how to use them as context you test, not as magnets.',
  lessons: [
    {
      id: 'profile-volume',
      title: 'Volume at price',
      summary: 'Add up the volume at each price instead of in each slice of time, and draw it sideways.',
      widget: 'profile-build',
      text: [
        'The volume bars under a chart (from the charts module) answer **when** shares traded. A **volume profile** answers **where**: it adds up the volume traded at each price and draws the totals as horizontal bars beside the price axis. Long bars are prices where a lot changed hands. Short bars are prices the market passed through with little trade.',
        'The profile is built from **rows**: price bands of a fixed size, such as 1 cent, 5 cents or 25 cents on SPY. Each trade adds its size to the row its price falls in. With trades (time and sales) the profile is exact. With bars you have to guess where inside the bar the volume traded: a common approximation spreads each bar\'s volume evenly over every row from its low to its high.',
        { code: `profile = {}
for price, size in trades:
    row = round(round(price / 0.05) * 0.05, 2)    # 5-cent rows
    profile[row] = profile.get(row, 0) + size` },
        'The total of all rows equals the total of the volume bars: it is the same shares, sorted by price instead of by time. What the profile throws away is the order of events. A row at 450.20 does not say whether its volume came at 9:35 or 15:50.',
        'The **row size** changes the picture. Tiny rows give a jagged profile with spikes at round prices. Large rows give a smooth shape but blur the detail, and each row is then a band, not a price. Bar data adds its own error: a 5-minute bar with a 1-dollar range gets its volume smeared over the whole dollar, even if most of it traded at one end.',
        'A profile is a description of where trade happened. It is useful context for the levels you already know from the charts module. It does not tell you where price goes next.',
      ],
      rules: [
        'Volume bars show when shares traded. A profile shows at what price.',
        'The profile and the volume bars have the same total: the same shares, sorted differently.',
        'From trades the profile is exact. From bars it is an approximation, usually an even spread from low to high.',
        'Choose the row size on purpose: too small is noisy, too large blurs.',
        'A profile describes the past. It is context, not a forecast.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'profile-volume-1',
          ask: 'These SPY trades print in order (price, shares): (450.10, 300), (450.20, 500), (450.10, 200), (450.00, 400), (450.10, 100). With 10-cent rows, how many shares are in the 450.10 row?',
          answer: 600,
          check: '300 + 200 + 100',
          why: 'Every trade at 450.10 adds to the same row, whenever it happened: 300 + 200 + 100 = 600. That makes 450.10 the fattest row, although the single largest trade was at 450.20.',
        },
        {
          kind: 'output',
          id: 'profile-volume-2',
          ask: 'What does this print?',
          code: `trades = [(450.10, 300), (450.20, 500), (450.10, 200), (450.00, 400), (450.10, 100)]
profile = {}
for price, size in trades:
    profile[price] = profile.get(price, 0) + size
print(sorted(profile.items()))`,
          answer: '[(450.0, 400), (450.1, 600), (450.2, 500)]',
          why: 'The dictionary adds sizes by price. Sorting the items puts the rows in price order, low to high, which is how a profile is read. The order the trades came in has gone.',
        },
        {
          kind: 'number',
          id: 'profile-volume-3',
          ask: 'You only have 5-minute bars. One bar has low 450.00, high 451.00 and volume 6,000. With 25-cent rows and an even spread over every row from low to high (both ends included), how many shares go into each row?',
          answer: 1200,
          check: '6000 / 5',
          hint: 'Count the rows: 450.00, 450.25, and so on up to 451.00.',
          why: 'The bar touches five rows (450.00, 450.25, 450.50, 450.75, 451.00), so each gets 6,000 ÷ 5 = 1,200. Forgetting that both ends count gives four rows and 1,500 each.',
        },
        {
          kind: 'bug',
          id: 'profile-volume-4',
          ask: 'This spreads a bar\'s volume evenly over the rows from its low to its high. The top row of every bar gets nothing, and a bar whose high equals its low adds no volume at all.',
          code: `def spread_bar(profile, low, high, volume, size):
    lo = round(low / size)
    hi = round(high / size)
    rows = range(lo, hi)
    for k in rows:
        price = round(k * size, 2)
        profile[price] = profile.get(price, 0) + volume / len(rows)`,
          line: 4,
          fix: '    rows = range(lo, hi + 1)',
          why: '`range(lo, hi)` stops before `hi`, so the row at the high is left out, and when low equals high the range is empty. The bar traded at its high, so that row must be included: `range(lo, hi + 1)`.',
        },
        {
          kind: 'choice',
          id: 'profile-volume-5',
          ask: 'Two traders look at the same SPY session. One has the volume bars under the chart, the other has the volume profile. What can the profile show that the volume bars cannot?',
          options: [
            'At which prices the shares changed hands',
            'At what time of day volume was heaviest',
            'Whether buyers or sellers started the trades',
            'Where price will go next',
          ],
          answer: 0,
          why: 'The profile sorts volume by price. The time of day is what the volume bars show and the profile loses. Who started each trade (the aggressor) is order flow, from the previous module. Neither picture forecasts.',
        },
        {
          kind: 'choice',
          id: 'profile-volume-6',
          ask: 'SPY opens at 445, trades heavily there for the first half hour, then climbs steadily to 452 on light volume and closes there. Where is the profile fattest?',
          options: [
            'Near 445, where the heavy early volume traded',
            'Near 452, where it closed',
            'Near 448.50, the middle of the range',
            'Evenly from 445 to 452, because price visited every price',
          ],
          answer: 0,
          why: 'A row grows with the volume traded at its price. The heavy open put most shares at 445; the steady climb left thin rows on the way up. The close and the middle of the range have no special weight.',
        },
        {
          kind: 'choice',
          id: 'profile-volume-7',
          ask: 'In the figure, move the time slider from early morning to the close. Which statement is true of the profile as it builds?',
          options: [
            'Rows only grow, and the point of control (the fattest row) can jump to a new area when another area collects more volume',
            'Rows shrink when price leaves them',
            'The fattest row is fixed once the first hour is over',
            'The profile resets every half hour',
          ],
          answer: 0,
          why: 'Trades are only ever added, so no row can shrink. The fattest row is whichever row has the most volume so far, and an area that collects volume later in the day can overtake the morning one.',
        },
        {
          kind: 'choice',
          id: 'profile-volume-8',
          ask: 'You change the row size of a SPY profile from 1 cent to 50 cents. What happens?',
          options: [
            'Fewer, fatter rows: a smoother shape, with the detail inside each 50-cent band lost',
            'The total volume grows, because rows overlap',
            'Nothing, because the trades are the same',
            'The shape becomes more jagged',
          ],
          answer: 0,
          why: 'Each 50-cent row adds up fifty 1-cent rows. The total is unchanged, the noise is smoothed away, and so is anything finer than half a dollar. Your "fattest price" is now a 50-cent band.',
        },
        {
          kind: 'number',
          id: 'profile-volume-9',
          ask: 'The 78 five-minute volume bars of a session add up to 52 million shares. Built from the same trades, what do all the rows of the session\'s volume profile add up to, in millions of shares?',
          answer: 52,
          check: '52',
          why: 'Every share traded is in exactly one bar and exactly one row. The profile sorts the same 52 million shares by price instead of by time.',
        },
        {
          kind: 'number',
          id: 'profile-volume-10',
          ask: 'A bar has low 450.00, high 450.30, close 450.30 and volume 8,000. With 10-cent rows, one platform spreads the volume evenly from low to high, another puts all of it at the close. How many shares does the even spread put in the 450.30 row?',
          answer: 2000,
          check: '8000 / 4',
          why: 'Four rows (450.00, 450.10, 450.20, 450.30) share 8,000, so 2,000 each. The close method puts all 8,000 at 450.30. Same bar, different profiles: when the shape matters, prefer trades or 1-minute bars.',
        },
        {
          kind: 'write',
          id: 'profile-volume-11',
          ask: 'Write `profile(trades, size)` that returns a dict from row price to total shares. A trade at price `p` belongs to the row `round(round(p / size) * size, 2)`.',
          starter: `def profile(trades, size):
    # trades: list of (price, shares)
    pass`,
          solution: `def profile(trades, size):
    out = {}
    for price, shares in trades:
        row = round(round(price / size) * size, 2)
        out[row] = out.get(row, 0) + shares
    return out`,
          tests: `out = profile([(450.10, 300), (450.20, 500), (450.10, 200)], 0.10)
assert out is not None, "the function returns nothing yet"
assert out == {450.1: 500, 450.2: 500}, f"two rows of 500 each, got {out}"
out = profile([(450.02, 100), (450.04, 200), (450.11, 50)], 0.05)
assert out == {450.0: 100, 450.05: 200, 450.1: 50}, f"each trade goes to its nearest 5-cent row, got {out}"
out = profile([(10.0, 1), (10.4, 2), (10.6, 4)], 1.0)
assert out == {10.0: 3, 11.0: 4}, f"with 1-dollar rows, 10.4 rounds to 10 and 10.6 to 11, got {out}"
assert sum(profile([(1.0, 7), (2.0, 5)], 1.0).values()) == 12, "the rows must add up to the total volume"`,
          hint: '`out.get(row, 0)` gives 0 for a row you have not seen yet.',
          why: 'Rounding to a row and adding into a dictionary is the whole of a volume profile. The outer `round(..., 2)` stops float noise such as 450.15000000000003 from creating two rows for one price.',
        },
        {
          kind: 'design',
          id: 'profile-volume-12',
          ask: 'You want to add a volume profile to your SPY charts. Decide its settings and write them down before you use it.',
          checklist: [
            { point: 'The data source: trades or 1-minute bars, not 5-minute bars', why: 'Coarse bars smear volume over their whole range and can move the fattest row.' },
            { point: 'The row size, fixed in advance (for example 5 or 10 cents on SPY)', why: 'Changing the row size changes the shape and every level you read from it.' },
            { point: 'The session: regular hours only or including premarket', why: 'Premarket trades are thin and can add rows the regular session never visited.' },
            { point: 'Which period the profile covers: today, yesterday, several days', why: 'The next lessons show these give different levels; mixing them muddles your notes.' },
            { point: 'That the levels are recorded in your journal with each trade', why: 'Only your own records can show whether the profile improves your decisions.' },
            { point: 'That the profile is read as a record of where trade happened, not a forecast', why: 'Treating its levels as magnets is how traders end up holding losers.' },
          ],
          why: 'A profile has more settings than it looks, and each changes the levels. Fixing them in advance stops you adjusting the picture until it agrees with the trade you want.',
        },
      ],
    },
    {
      id: 'profile-value',
      title: 'Point of control and value area',
      summary: 'The fattest row, and the band around it that holds 70% of the volume: exactly how they are computed.',
      widget: 'profile-value',
      text: [
        'The **point of control** (POC) is the row with the most volume: the price where the most trading happened. If two rows tie, a common convention takes the one nearer the middle of the range. The **value area** is the band of rows around the POC that holds a set share of the volume, usually 70%. Its top row is the **value area high** (VAH) and its bottom row the **value area low** (VAL).',
        'This course uses one exact method. Start with the POC row. The target is 70% of the total volume. While the rows taken hold less than the target, look at the next row above the band and the next row below it, and add the one with more volume (on a tie, the one above; a side with no rows left is never chosen). Stop as soon as the band reaches the target, so it usually holds a little more than 70%.',
        { code: `lo = hi = poc
taken = vols[poc]
while taken < 0.70 * sum(vols):
    up = vols[hi + 1] if hi + 1 < len(vols) else -1
    down = vols[lo - 1] if lo > 0 else -1
    if up >= down:
        hi += 1; taken += up
    else:
        lo -= 1; taken += down` },
        'Platforms differ. The classic Market Profile method compares the next **two** rows on each side and adds the larger pair; some platforms compare one row at a time, as here. They also differ on ties, on the row size and on the session. On the same data the methods can give a VAH or VAL a row or more apart. Know which one your platform uses before you compare numbers with anyone.',
        'Why 70%: it comes from the bell curve, where about 68% of a normal distribution lies within one standard deviation of the middle. It is a convention, not a law of markets. A day\'s profile is often not bell-shaped at all.',
        'Read the value area as the price band where most of the day\'s business was done: the prices the market accepted. The POC is the single most traded price. Neither is a level that price must return to.',
      ],
      rules: [
        'POC: the row with the most volume. Ties: the row nearer the middle of the range.',
        'Value area: grow from the POC, adding the bigger neighbour each step, until it holds at least 70%.',
        'VAH and VAL are the top and bottom rows of the value area.',
        'Platforms differ (one row or two at a time, ties, row size, session): know yours.',
        '70% is a convention borrowed from the bell curve, not a law.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'profile-value-1',
          ask: 'A profile has 1-dollar rows with volumes (price: thousands of shares) 100: 3, 101: 6, 102: 10, 103: 15, 104: 12, 105: 8, 106: 4, 107: 2. What is the point of control?',
          answer: 103,
          check: '[100, 101, 102, 103, 104, 105, 106, 107][int(np.argmax([3, 6, 10, 15, 12, 8, 4, 2]))]',
          why: '103 holds 15 thousand shares, more than any other row. The POC is a price, not a volume.',
        },
        {
          kind: 'number',
          id: 'profile-value-2',
          ask: 'Same profile: 3, 6, 10, 15, 12, 8, 4, 2 (thousands) from 100 to 107. How much volume must a 70% value area hold, in thousands?',
          answer: 42,
          check: '0.7 * (3 + 6 + 10 + 15 + 12 + 8 + 4 + 2)',
          why: 'The total is 60 thousand, and 70% of 60 is 42. The value area grows until it holds at least this much.',
        },
        {
          kind: 'choice',
          id: 'profile-value-3',
          ask: 'Same profile (100: 3, 101: 6, 102: 10, 103: 15, 104: 12, 105: 8, 106: 4, 107: 2), one row at a time from the POC at 103. In what order are rows added, and where does the value area end?',
          options: [
            '104, then 102, then 105: value area 102 to 105',
            '102, then 104, then 101: value area 101 to 104',
            '104, then 105, then 106: value area 103 to 106',
            '104, then 102, then 105, then 101: value area 101 to 105',
          ],
          answer: 0,
          why: '104 (12) beats 102 (10): 27. Then 102 (10) beats 105 (8): 37. Then 105 (8) beats 101 (6): 45, which passes 42, so it stops. Adding 101 as well would overshoot the rule.',
        },
        {
          kind: 'number',
          id: 'profile-value-4',
          ask: 'The value area 102 to 105 holds 45 thousand of the 60 thousand shares. What share of the volume is that? Give a percentage, for example 70%.',
          answer: 0.75,
          check: '45 / 60',
          why: '45 ÷ 60 = 75%. The method stops at the first step that reaches 70%, so the value area usually holds a little more than the target.',
        },
        {
          kind: 'number',
          id: 'profile-value-5',
          ask: 'Same profile, but now with the classic two-row method: compare the sum of the next two rows above the band with the next two below, and add the larger pair. What is the value area low?',
          answer: 101,
          check: '101',
          hint: 'Above 103: 104 + 105 = 20. Below: 102 + 101 = 16.',
          why: 'First pair: 20 above beats 16 below, band 103 to 105 holds 35. Next: 106 + 107 = 6 above against 16 below, so add 102 and 101: 51, past 42. Value area 101 to 105, against 102 to 105 one row at a time. Same data, different VAL.',
        },
        {
          kind: 'output',
          id: 'profile-value-6',
          ask: 'What does this print?',
          code: `vols = [1, 4, 8, 7, 9, 3, 2]          # rows for prices 20 to 26
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
print(20 + lo, 20 + poc, 20 + hi, taken)`,
          answer: '22 24 24 24',
          why: 'The POC is 24 (9). Below, 23 (7) beats 25 (3): 16. Then 22 (8) beats 25 (3): 24, past the target of 23.8. So VAL 22, POC 24, VAH 24: the POC can sit at the edge of its own value area when the volume is lopsided.',
        },
        {
          kind: 'bug',
          id: 'profile-value-7',
          ask: 'This value area loop gives nonsense when the band reaches the bottom row: it suddenly adds the volume of the top row.',
          code: `def value_area(vols, poc, pct=0.70):
    lo = hi = poc
    taken = vols[poc]
    while taken < pct * sum(vols):
        up = vols[hi + 1] if hi + 1 < len(vols) else -1
        down = vols[lo - 1] if lo >= 0 else -1
        if up >= down:
            hi += 1; taken += up
        else:
            lo -= 1; taken += down
    return lo, hi`,
          line: 6,
          fix: '        down = vols[lo - 1] if lo > 0 else -1',
          why: 'When `lo` is 0 there is no row below, but `lo >= 0` still reads `vols[-1]`, which in Python is the last row, the top of the profile. The check must be `lo > 0`.',
        },
        {
          kind: 'choice',
          id: 'profile-value-8',
          ask: 'Why is the value area usually set at 70%?',
          options: [
            'By analogy with the bell curve, where about 68% lies within one standard deviation of the middle; it is a convention',
            'Exchanges require it',
            'Research shows price stays inside 70% of the volume 70% of the time',
            'It is the share of volume traded by institutions',
          ],
          answer: 0,
          why: 'The early Market Profile material borrowed the idea of one standard deviation. Nothing in the market enforces it, and many profiles are not bell-shaped. Some traders use 68% or 80%; the levels move when you do.',
        },
        {
          kind: 'choice',
          id: 'profile-value-9',
          ask: 'Your VAH for yesterday is 452.30. A friend\'s platform shows 452.50 on the same session. Which explanation is most likely?',
          options: [
            'Different settings: one row or two at a time, tie rules, row size or whether premarket is included',
            'One of the platforms has wrong trade data',
            'The value area changes overnight',
            'One of you is using the wrong day',
          ],
          answer: 0,
          why: 'Small differences in method routinely move VAH and VAL by a row or two. That alone is a reason not to treat a value area edge as an exact price: it is a zone, like the levels in the charts module.',
        },
        {
          kind: 'choice',
          id: 'profile-value-10',
          ask: 'In the figure, change the value area percentage from 70% to 50% and then to 90%, and switch between one row and two rows. What never changes?',
          options: [
            'The point of control',
            'The value area high',
            'The value area low',
            'The share of volume inside the value area',
          ],
          answer: 0,
          why: 'The POC is the fattest row and does not depend on the percentage or the expansion method. VAH and VAL move with both settings, which is why two "value areas" of the same day can disagree.',
        },
        {
          kind: 'number',
          id: 'profile-value-11',
          ask: 'Yesterday SPY traded from 447.90 to 453.40. Its value area ran from VAL 449.90 to VAH 452.40. What fraction of the day\'s range did the value area cover? Give two decimals.',
          answer: 0.4545,
          tol: 0.006,
          check: '(452.40 - 449.90) / (453.40 - 447.90)',
          why: '2.50 ÷ 5.50 = 0.45. Seventy per cent of the volume traded in less than half the range: most of the day was spent in a band, and the extremes were visited briefly.',
        },
        {
          kind: 'write',
          id: 'profile-value-12',
          ask: 'Write `value_area(vols, pct)` that returns `(lo, hi)`, the row indices of the value area, using this lesson\'s method: start at the POC (the first row with the most volume is fine here), add the bigger neighbour each step (tie: the one above), stop once the band holds at least `pct` of the total.',
          starter: `def value_area(vols, pct):
    poc = vols.index(max(vols))
    # grow lo and hi from poc
    pass`,
          solution: `def value_area(vols, pct):
    poc = vols.index(max(vols))
    lo = hi = poc
    taken = vols[poc]
    while taken < pct * sum(vols):
        up = vols[hi + 1] if hi + 1 < len(vols) else -1
        down = vols[lo - 1] if lo > 0 else -1
        if up >= down:
            hi += 1
            taken += up
        else:
            lo -= 1
            taken += down
    return lo, hi`,
          tests: `out = value_area([3, 6, 10, 15, 12, 8, 4, 2], 0.70)
assert out is not None, "the function returns nothing yet"
assert out == (2, 5), f"rows 2 to 5 (prices 102 to 105), got {out}"
assert value_area([1, 4, 8, 7, 9, 3, 2], 0.70) == (2, 4), "a lopsided profile: the POC ends at the top of its value area"
assert value_area([5, 5, 5, 5], 0.70) == (0, 2), "on ties take the row above, and stop at 75%, the first share that reaches 70%"
assert value_area([1, 2, 10], 0.70) == (2, 2), "the POC alone holds 77%, so nothing is added"
assert value_area([10, 1, 1], 0.90) == (0, 1), "at the bottom row there is nothing below: only go up"`,
          hint: 'Use -1 for a side with no rows left, so it can never win the comparison.',
          why: 'Counting a missing side as -1 makes the loop take the other side without a special case, and stopping on `taken < target` gives the smallest band that reaches the target under this method.',
        },
      ],
    },
    {
      id: 'profile-nodes',
      title: 'High and low volume nodes',
      summary: 'The peaks and valleys of a profile: where the market accepted prices and where it rejected them.',
      widget: 'profile-nodes',
      text: [
        'A profile is rarely one smooth hump. A **high volume node** (HVN) is a peak: a group of rows with much more volume than the rows around it. A **low volume node** (LVN) is a valley between peaks: a group of thin rows. The POC is the highest HVN.',
        'Auction market language reads them this way. At an HVN the market spent time and did business: the price was **accepted**. At an LVN price moved through quickly with little trade: the price was **rejected**, or skipped. A day that trades in one area and then moves to another leaves two HVNs with an LVN between them.',
        'The claim often made is that price moves fast through thin areas and slows in thick ones. Part of this is true by construction: a row is thin because price spent little time and volume there. Whether price will move fast through the same area next time is a separate question, and the answer is "sometimes". Treat it as a pattern to check in your own data.',
        { code: `# a row is an LVN if it is below the k rows on each side
lvn = [i for i in range(k, len(v) - k)
       if v[i] < min(v[i - k:i]) and v[i] < min(v[i + 1:i + k + 1])]` },
        'Finding nodes needs a rule, like finding swing points in the charts module: a row is an LVN if it is lower than the `k` rows on each side, an HVN if it is higher. A small `k` finds every wiggle; a larger one finds only the big features. Profiles with tiny rows are jagged (traders cluster at round prices), so smoothing the volumes first, for example with a 3-row average, often helps.',
        'In practice traders mark the edges of HVNs and the middle of LVNs as places to watch, the same way they mark yesterday\'s high and low. A move into an LVN that is quickly pushed back reads as rejection; a move that stays and builds volume reads as acceptance. Both readings are made after the fact, so a plan needs a rule and a time limit for deciding which one it is.',
      ],
      rules: [
        'HVN: a peak in the profile, where price was accepted. LVN: a valley, where price was rejected or skipped.',
        'Thin areas were passed quickly in the past by definition. Whether they will be again is a claim to test.',
        'Find nodes with a rule: a row below (or above) the k rows on each side, after smoothing if the profile is jagged.',
        'Acceptance is time and volume building at a price. Rejection is a quick return.',
        'Decide in advance how long price must stay before you call it acceptance.',
      ],
      questions: [
        {
          kind: 'choice',
          id: 'profile-nodes-1',
          ask: 'A profile with 1-dollar rows from 100 to 112 has volumes 2, 5, 11, 14, 9, 3, 1, 2, 6, 12, 15, 10, 4. Where are the high volume nodes and the low volume node?',
          options: [
            'HVNs at 103 and 110, LVN at 106',
            'HVN at 110 only, LVN at 100',
            'HVNs at 103 and 110, LVN at 112',
            'HVN at 106, LVNs at 103 and 110',
          ],
          answer: 0,
          why: '103 (14) and 110 (15) are peaks; 106 (1) is the valley between them. 100 and 112 are thin too, but they are the ends of the profile, not a valley between two areas of acceptance.',
        },
        {
          kind: 'output',
          id: 'profile-nodes-2',
          ask: 'What does this print?',
          code: `v = [2, 5, 11, 14, 9, 3, 1, 2, 6, 12, 15, 10, 4]   # prices 100 to 112
k = 1
hvn = [100 + i for i in range(k, len(v) - k) if v[i] > v[i - 1] and v[i] > v[i + 1]]
lvn = [100 + i for i in range(k, len(v) - k) if v[i] < v[i - 1] and v[i] < v[i + 1]]
print(hvn, lvn)`,
          answer: '[103, 110] [106]',
          why: 'With k = 1 a row is compared with one neighbour on each side. 14 at 103 and 15 at 110 are above both neighbours; 1 at 106 is below both. The ends are skipped because they have no neighbour on one side.',
        },
        {
          kind: 'bug',
          id: 'profile-nodes-3',
          ask: 'This should find LVNs: rows lower than the k rows on each side. With k = 2 it reports rows that are not valleys at all.',
          code: `def lvns(v, k):
    out = []
    for i in range(k, len(v) - k):
        left = v[i - k:i]
        right = v[i + 1:i + k]
        if v[i] < min(left) and v[i] < min(right):
            out.append(i)
    return out`,
          line: 5,
          fix: '        right = v[i + 1:i + k + 1]',
          why: '`v[i + 1:i + k]` holds only k − 1 rows, so with k = 2 a row is compared with one row on its right instead of two. The slice end must be `i + k + 1`, the same mistake as with swing points in the charts module.',
        },
        {
          kind: 'choice',
          id: 'profile-nodes-4',
          ask: 'A course says: "Price always moves fast through low volume nodes." What is the honest reading?',
          options: [
            'In the past price passed through quickly, which is why the rows are thin; whether it does so next time is uncertain and worth testing',
            'It is a law: thin rows have no orders, so price must move fast',
            'It is false: LVNs are where price stops',
            'It is only true on Mondays',
          ],
          answer: 0,
          why: 'An LVN is thin because price spent little time and volume there. That is a description of one past day. The orders resting today are not in yesterday\'s profile, so the claim has to be measured, not assumed.',
        },
        {
          kind: 'number',
          id: 'profile-nodes-5',
          ask: 'Same profile (volumes 2, 5, 11, 14, 9, 3, 1, 2, 6, 12, 15, 10, 4 for 100 to 112). What share of the total volume traded in the upper node, rows 109 to 111? Give a percentage, for example 25%.',
          answer: 0.3936,
          tol: 0.006,
          check: '(12 + 15 + 10) / sum([2, 5, 11, 14, 9, 3, 1, 2, 6, 12, 15, 10, 4])',
          why: '37 of 94 thousand shares, about 39%. Three rows of thirteen held two fifths of the day: that is what acceptance looks like in a profile.',
        },
        {
          kind: 'choice',
          id: 'profile-nodes-6',
          ask: 'SPY breaks above a high volume node into a thin area at 452. Within five minutes it is back inside the node and volume at 452 stays light. How do auction traders describe that?',
          options: [
            'Rejection: the higher prices did not attract trade, so price returned',
            'Acceptance: price reached 452',
            'A breakout that has been confirmed',
            'A new value area at 452',
          ],
          answer: 0,
          why: 'Acceptance needs time and volume at the new price. A quick return on light volume is rejection. It describes the move; it does not promise the next one.',
        },
        {
          kind: 'choice',
          id: 'profile-nodes-7',
          ask: 'In the figure, raise the window k from 1 to 4. What happens to the nodes it marks?',
          options: [
            'Fewer nodes: only the larger peaks and valleys survive a wider window',
            'More nodes, because a wider window sees more rows',
            'The same nodes, because the profile has not changed',
            'All nodes move to the POC',
          ],
          answer: 0,
          why: 'A row must beat more neighbours to count, so small wiggles drop out. There is no right k: choose one in advance and keep it, as with the swing size in the charts module.',
        },
        {
          kind: 'number',
          id: 'profile-nodes-8',
          ask: 'You plan a long at 104.50, at the top edge of a node, with a stop at 103.80. The next node starts at 109.00, beyond an LVN. If price reaches that node, what is the reward to risk?',
          answer: 6.43,
          tol: 0.02,
          check: '(109.00 - 104.50) / (104.50 - 103.80)',
          why: 'Reward 4.50, risk 0.70: about 6.4. A high ratio says nothing about how often the target is reached. Thin-area targets look attractive on paper; your records decide whether they are reached often enough.',
        },
        {
          kind: 'choice',
          id: 'profile-nodes-9',
          ask: 'A 1-cent SPY profile is a saw blade: every whole and half dollar row is a spike, the rows between are low. What should you do before finding nodes?',
          options: [
            'Smooth the volumes (for example a 3-row average) or use larger rows',
            'Mark every low row as an LVN',
            'Delete the round-number rows',
            'Use a smaller row size',
          ],
          answer: 0,
          why: 'Traders cluster orders at round prices, so tiny rows are spiky for reasons that have nothing to do with acceptance. Smoothing or wider rows reveal the real shape.',
        },
        {
          kind: 'number',
          id: 'profile-nodes-10',
          ask: 'Rows have volumes 9, 3, 1, 2, 6. What is the 3-row average centred on the middle row (the 1)?',
          answer: 2,
          check: '(3 + 1 + 2) / 3',
          why: '(3 + 1 + 2) ÷ 3 = 2. Smoothing pulls single-row spikes and dips toward their neighbours, so a valley must be several rows wide to survive.',
        },
        {
          kind: 'write',
          id: 'profile-nodes-11',
          ask: 'Write `hvns(v, k)` that returns the indices of rows strictly higher than each of the `k` rows on both sides. Skip rows that do not have `k` rows on each side.',
          starter: `def hvns(v, k):
    pass`,
          solution: `def hvns(v, k):
    out = []
    for i in range(k, len(v) - k):
        if v[i] > max(v[i - k:i]) and v[i] > max(v[i + 1:i + k + 1]):
            out.append(i)
    return out`,
          tests: `v = [2, 5, 11, 14, 9, 3, 1, 2, 6, 12, 15, 10, 4]
out = hvns(v, 1)
assert out is not None, "the function returns nothing yet"
assert out == [3, 10], f"the peaks are rows 3 and 10, got {out}"
assert hvns(v, 2) == [3, 10], "both peaks are higher than 2 rows on each side"
assert hvns(v, 3) == [3], "with k = 3 row 10 has only two rows above it, so it is skipped"
assert hvns([1, 5, 2, 9, 1], 1) == [1, 3], "two separate peaks with k = 1"
assert hvns([1, 5, 2, 9, 1], 2) == [], "with k = 2 only row 2 has two rows on each side, and it is not a peak"
assert hvns([1, 4, 4, 1], 1) == [], "a flat top is not strictly higher than its neighbour"`,
          why: 'The same window rule as swing highs. Strict comparison means a flat top of two equal rows is not reported, a choice worth knowing about: smoothing first usually breaks such ties.',
        },
        {
          kind: 'design',
          id: 'profile-nodes-12',
          ask: 'Write rules for using yesterday\'s LVN as a level today, precise enough that someone else would mark the same trades.',
          checklist: [
            { point: 'How the LVN is found: row size, smoothing and the window k', why: 'Otherwise you will see a valley wherever you want one.' },
            { point: 'A zone width around the LVN, not a single price', why: 'Profiles from different settings put the valley a row or two apart.' },
            { point: 'What counts as acceptance: for example two 5-minute closes beyond it with rising volume', why: 'Without a rule, rejection and acceptance are decided after the fact.' },
            { point: 'What counts as rejection, with a time limit', why: 'A level that "might still hold" keeps you in a losing trade.' },
            { point: 'Stop beyond the zone and target at the next node, with the reward to risk worked out', why: 'Nodes give the distances; the plan must exist before the entry.' },
            { point: 'A way to count how often the pattern worked in your records', why: 'The fast-through-thin idea is a claim until your data supports it.' },
          ],
          why: 'Nodes are easy to see after the day is over. Rules turn them into something you can apply live and test.',
        },
      ],
    },
    {
      id: 'profile-auction',
      title: 'Auction market theory',
      summary: 'The market as a two-way auction searching for value: balance, imbalance, and who is acting where.',
      text: [
        '**Auction market theory** is the idea behind the profile. A market is a two-way auction: price moves up to look for sellers and down to look for buyers. When it finds a price where both sides are willing to trade, trade builds there. The phrase used by its teachers is "price advertises, time regulates, volume measures": a price attracts trade or it does not, and the volume and time spent there tell you which.',
        'In **balance**, price rotates up and down inside a range and the value areas of successive days overlap: buyers and sellers agree roughly what the market is worth. In **imbalance**, one side is in control, price moves directionally and **value migrates**: each day\'s value area sits above (or below) the last with little overlap. Markets alternate between the two.',
        '**Price against value**: when price trades outside the value area, the market is testing whether a new price is fair. If trade builds there, the new price is accepted and value moves. If it does not, price is rejected and tends to come back. Which will happen is not known in advance.',
        'Who acts where has names. Buying above the value area, or selling below it, is **initiative** activity: someone is willing to trade at prices the market has not yet accepted. Buying below value or selling above it is **responsive** activity: traders responding to prices that look cheap or dear. A long thin tail at the day\'s extreme is called **excess**: a sharp response that ended the auction in that direction.',
        'Auction teachers also distinguish the **day timeframe** trader, who must be flat by the close, from the **other timeframe** trader (funds and longer-term traders) whose larger orders move value. A day trader reading a profile is trying to tell whether the other timeframe is active today.',
        'All of this is a vocabulary for describing what you see, and a good one. It does not make the next move predictable. Its use is in framing a decision: is the market balanced or moving, is price inside value or testing outside it, and what would show that view is wrong.',
      ],
      rules: [
        'Price looks for trade. Volume and time at a price show whether it was accepted.',
        'Balance: rotation and overlapping value. Imbalance: direction and value moving away.',
        'Initiative: buying above value or selling below. Responsive: buying below value or selling above.',
        'Outside value, price is either accepted (value moves) or rejected (it returns). You find out afterwards.',
        'The theory is a way to describe and frame decisions, not a forecast.',
      ],
      questions: [
        {
          kind: 'choice',
          id: 'profile-auction-1',
          ask: 'Yesterday\'s value area was 448 to 452. Today SPY opens at 453 and buyers keep lifting it to 455 on heavy volume. How does auction market theory label that buying?',
          options: ['Initiative buying', 'Responsive buying', 'Responsive selling', 'Balance'],
          answer: 0,
          why: 'Buyers are paying prices above where value was accepted yesterday. That is initiative: acting at a price the market has not yet accepted.',
        },
        {
          kind: 'choice',
          id: 'profile-auction-2',
          ask: 'Same value area, 448 to 452. Price drops to 447 and buyers step in, pushing it back to 449. What kind of activity is that?',
          options: ['Responsive buying', 'Initiative buying', 'Initiative selling', 'Value migration'],
          answer: 0,
          why: 'Buying below value is responsive: the buyers are responding to a price that looks cheap against what was accepted. It is the activity of a balanced market.',
        },
        {
          kind: 'choice',
          id: 'profile-auction-3',
          ask: 'The value areas of the last three days were 445 to 448, then 447 to 450, then 449 to 452. What does that describe?',
          options: [
            'Value migrating higher: an imbalance, a market moving up',
            'A balanced market, because the areas overlap a little',
            'A downtrend',
            'Nothing, because value areas are random',
          ],
          answer: 0,
          why: 'Each value area sits higher than the last, with only a small overlap. Accepted prices are moving up: the definition of imbalance. It describes the last three days, not the next one.',
        },
        {
          kind: 'number',
          id: 'profile-auction-4',
          ask: 'Yesterday\'s value area ran from 448.00 to 452.00. Today\'s runs from 450.00 to 455.00. How many dollars do they overlap?',
          answer: 2,
          check: 'min(452.00, 455.00) - max(448.00, 450.00)',
          why: 'The overlap runs from the higher of the lows (450) to the lower of the highs (452): 2 dollars. No overlap at all would mean value moved completely.',
        },
        {
          kind: 'number',
          id: 'profile-auction-5',
          ask: 'Same two value areas. What fraction of today\'s value area overlaps yesterday\'s? Give two decimals.',
          answer: 0.4,
          check: '2 / (455.00 - 450.00)',
          why: '2 ÷ 5 = 0.40. Less than half of today\'s accepted prices were accepted yesterday: value moved up, but not cleanly away. Measuring overlap turns "balance or imbalance" into a number you can record.',
        },
        {
          kind: 'output',
          id: 'profile-auction-6',
          ask: 'What does this print?',
          code: `def activity(side, price, val, vah):
    if price > vah:
        return "initiative" if side == "buy" else "responsive"
    if price < val:
        return "initiative" if side == "sell" else "responsive"
    return "inside"

print(activity("buy", 453, 448, 452), activity("buy", 447, 448, 452),
      activity("sell", 455, 448, 452), activity("sell", 450, 448, 452))`,
          answer: 'initiative responsive responsive inside',
          why: 'Buying above value is initiative, buying below is responsive, selling above is responsive, and inside value the labels do not apply.',
        },
        {
          kind: 'bug',
          id: 'profile-auction-7',
          ask: 'This should label activity relative to value. It calls selling below value "responsive", which is backwards.',
          code: `def activity(side, price, val, vah):
    if price > vah:
        return "initiative" if side == "buy" else "responsive"
    if price < val:
        return "initiative" if side == "buy" else "responsive"
    return "inside"`,
          line: 5,
          fix: '        return "initiative" if side == "sell" else "responsive"',
          why: 'Below value, the side pushing into new prices is the seller. Selling below value is initiative and buying there is responsive, the mirror image of the case above value.',
        },
        {
          kind: 'choice',
          id: 'profile-auction-8',
          ask: 'Today\'s profile has a long tail of single thin rows at the low: price spent two minutes down there and snapped back. What does auction market theory call that, and what does it tell you?',
          options: [
            'Excess: a strong response that ended the auction lower today; a description, not a promise the low holds',
            'Acceptance of the low prices',
            'A low volume node that price must revisit',
            'Proof that the low of the week is in',
          ],
          answer: 0,
          why: 'A tail is excess: the market found the buyers it was looking for and left fast. Many tails hold for a while, and some are traded through the next day. It is a reading of today.',
        },
        {
          kind: 'choice',
          id: 'profile-auction-9',
          ask: 'SPY trades up to 456, two dollars above the value area, on thin volume, and spends 10 minutes there before falling back. In auction terms, what happened?',
          options: [
            'Price advertised 456 and did not attract trade: rejection',
            'Value moved up to 456',
            'Initiative buying was accepted',
            'Nothing worth noting',
          ],
          answer: 0,
          why: 'Higher price was an advertisement. Little volume and little time there means few took it up. The same move with heavy volume and a new value area building would have been acceptance.',
        },
        {
          kind: 'number',
          id: 'profile-auction-10',
          ask: 'Yesterday\'s value area was 448.00 to 452.00. SPY now trades at 454.40. How far above VAH is it, in multiples of the value area\'s width? Give two decimals.',
          answer: 0.6,
          check: '(454.40 - 452.00) / (452.00 - 448.00)',
          why: '2.40 ÷ 4.00 = 0.60 value-area widths. Scaling by the width lets you compare stretches across days with different volatility.',
        },
        {
          kind: 'design',
          id: 'profile-auction-11',
          ask: 'At 11:00 you want to describe the day in auction terms before deciding whether to trade. Write what you check.',
          checklist: [
            { point: 'Where price is against yesterday\'s value area: inside, above or below', why: 'It frames whether the market is testing new prices.' },
            { point: 'Whether today\'s developing value overlaps yesterday\'s', why: 'Overlap suggests balance; separation suggests value is moving.' },
            { point: 'Whether activity outside value is building volume (acceptance) or returning quickly (rejection)', why: 'That is the question the auction is answering.' },
            { point: 'Who appears to be acting: initiative or responsive', why: 'Initiative outside value is the sign of a moving market.' },
            { point: 'What would change your description', why: 'A description with no invalidation becomes a story you defend.' },
            { point: 'That the description leads to a decision (trade, which setup, or stand aside), not a prediction', why: 'The theory frames choices; it does not forecast.' },
          ],
          why: 'Auction language is useful when it forces a clear description and an invalidation. Used loosely, it can explain any outcome after the fact.',
        },
      ],
    },
    {
      id: 'profile-tpo',
      title: 'Market profile: letters, initial balance and day types',
      summary: 'A profile of time instead of volume: a letter for each half hour, the first hour\'s range, and the shapes days leave.',
      widget: 'profile-tpo',
      text: [
        '**Market Profile** came before the volume profile. It was devised by J. Peter Steidlmayer, a trader at the Chicago Board of Trade, and introduced by the exchange in 1985. Instead of volume it counts **time**: each half hour gets a letter, and the letter is written in every price row the market traded in during that half hour. Each mark is a **TPO** (time price opportunity).',
        'For US shares the regular session, 9:30 to 16:00, has 13 half hours, lettered A (9:30) to M (15:30). Platforms differ in lettering, so check yours. Push the letters to the left and the rows with the most letters show where price spent the most time. The TPO **POC** is the row with the most letters, and a TPO value area is built from TPO counts with the same expansion method as before. TPO and volume POCs often differ: time spent and shares traded are not the same thing.',
        'The **initial balance** (IB) is the range of the first hour: periods A and B. Trading beyond it later is **range extension**. Rows with a single letter, made by one fast half hour, are **single prints**; at the extreme of the day they form a **tail**.',
        { code: `letters = "ABCDEFGHIJKLM"
tpo = {}
for i, (lo, hi) in enumerate(periods):        # each half hour's low and high row
    for row in range(lo, hi + 1):
        tpo[row] = tpo.get(row, "") + letters[i]` },
        'Jim Dalton\'s books name the **day types** traders use. **Normal**: a wide first hour that holds most of the day (little range extension). **Normal variation**: range extension up to about twice the IB. **Trend**: open near one end, close near the other, the IB a small part of a long thin profile. **Double distribution**: a quiet area, a fast move, then a second area, separated by single prints. **Neutral**: range extension on both sides. The thresholds are rough and the label is only certain at the close.',
        'Shapes have readings too. A **D** shape is balanced. A **P** shape (fat top, thin tail below) is often read as short covering, sellers buying back, rather than new buying; a **b** shape (fat bottom, thin top) as long liquidation. These readings are interpretations of who traded, not facts the chart records. Use them to describe a day, and test anything you build on them.',
      ],
      rules: [
        'A TPO chart counts time: one letter per half hour in every row traded. US regular hours: A to M.',
        'Initial balance: the range of the first hour (A and B). Beyond it is range extension.',
        'Single prints mark fast movement; at the extreme they form a tail.',
        'Day types: normal, normal variation, trend, double distribution, neutral. Rough labels, certain only at the close.',
        'P and b shapes have common readings (short covering, long liquidation). They are interpretations.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'profile-tpo-1',
          ask: 'How many 30-minute TPO periods are there in the US regular session, 9:30 to 16:00?',
          answer: 13,
          check: '(16 * 60 - (9 * 60 + 30)) / 30',
          why: '6.5 hours is 390 minutes, and 390 ÷ 30 = 13: letters A to M.',
        },
        {
          kind: 'choice',
          id: 'profile-tpo-2',
          ask: 'With A starting at 9:30, which letter marks the half hour from 10:30 to 11:00?',
          options: ['C', 'B', 'D', 'K'],
          answer: 0,
          why: 'A is 9:30, B is 10:00, C is 10:30. The initial balance is A and B together, the first hour.',
        },
        {
          kind: 'number',
          id: 'profile-tpo-3',
          ask: 'Period A traded from 450.20 to 451.60 and period B from 450.80 to 452.00. How wide is the initial balance, in dollars?',
          answer: 1.8,
          tol: 0.005,
          check: 'max(451.60, 452.00) - min(450.20, 450.80)',
          why: 'The IB runs from the lowest low of A and B (450.20) to the highest high (452.00): 1.80. It is one range covering both periods.',
        },
        {
          kind: 'number',
          id: 'profile-tpo-4',
          ask: 'Same IB, 450.20 to 452.00. The day ends with a high of 453.10 and a low of 450.20. How many times the IB is the day\'s range? Give two decimals.',
          answer: 1.6111,
          tol: 0.006,
          check: '(453.10 - 450.20) / (452.00 - 450.20)',
          why: '2.90 ÷ 1.80 = 1.61. Range extension on one side of up to about twice the IB fits the description of a normal variation day.',
        },
        {
          kind: 'output',
          id: 'profile-tpo-5',
          ask: 'Each period is (low row, high row). What does this print?',
          code: `periods = [(3, 6), (4, 7), (5, 6), (2, 5)]
letters = "ABCD"
tpo = {}
for i, (lo, hi) in enumerate(periods):
    for row in range(lo, hi + 1):
        tpo[row] = tpo.get(row, "") + letters[i]
best = max(tpo, key=lambda r: len(tpo[r]))
print(tpo[5], best, len(tpo))`,
          answer: 'ABCD 5 6',
          why: 'All four periods traded in row 5, so it holds ABCD and is the most-letters row (row 6 has only ABC). Rows 2 to 7 were traded: six rows.',
        },
        {
          kind: 'bug',
          id: 'profile-tpo-6',
          ask: 'This should return the initial balance from a list of half-hour (low, high) ranges. Every IB it reports is too wide.',
          code: `def initial_balance(periods):
    first_hour = periods[:3]
    lo = min(p[0] for p in first_hour)
    hi = max(p[1] for p in first_hour)
    return lo, hi`,
          line: 2,
          fix: '    first_hour = periods[:2]',
          why: 'The first hour is two half hours, A and B. `periods[:3]` adds C, so the range includes 10:30 to 11:00.',
        },
        {
          kind: 'choice',
          id: 'profile-tpo-7',
          ask: 'SPY opens at its low of the day, the first hour covers 60 cents, and it closes at its high, 2.40 dollars above the low. The profile is long and thin. Which day type fits?',
          options: ['Trend day', 'Normal day', 'Neutral day', 'Non-trend day'],
          answer: 0,
          why: 'Open at one extreme, close at the other, and a range four times the IB: the trend day description. Note when you know: only late in the day.',
        },
        {
          kind: 'choice',
          id: 'profile-tpo-8',
          ask: 'A profile is fat at the top with a long thin stretch below it: a P shape. What is the honest reading?',
          options: [
            'Price rose quickly and then traded a lot near the top; it is often interpreted as short covering, which is a guess about who traded',
            'It proves short sellers bought back',
            'It means the market will fall tomorrow',
            'It shows heavy buying at the low',
          ],
          answer: 0,
          why: 'The chart records a fast move up and time spent near the top. "Short covering" is a common interpretation, not something the chart can show. Who traded is not in the data.',
        },
        {
          kind: 'choice',
          id: 'profile-tpo-9',
          ask: 'In the figure, choose "double dist." and move the slider through the day. Where are the single prints, and when were they made?',
          options: [
            'Between the two areas, made in period F during the fast move',
            'At the top, made in period M',
            'Inside the initial balance, made in period A',
            'There are none',
          ],
          answer: 0,
          why: 'A quiet area forms in A to E, then F moves fast to a new area. The rows only F traded through are single prints: the thin gap between the two distributions.',
        },
        {
          kind: 'choice',
          id: 'profile-tpo-10',
          ask: 'Your TPO POC is 451.20 and your volume POC for the same day is 450.60. Why can they differ?',
          options: [
            'TPO counts time spent at a price, the volume profile counts shares traded there; a heavy burst at 450.60 can outweigh long quiet hours at 451.20',
            'One of them is wrong',
            'TPO charts only use the first hour',
            'The volume profile ignores the open',
          ],
          answer: 0,
          why: 'Thirty quiet minutes and thirty busy minutes each add one letter, but very different volume. Both are true descriptions; they measure different things.',
        },
        {
          kind: 'write',
          id: 'profile-tpo-11',
          ask: 'Write `tpo_counts(periods)` that takes half-hour (low row, high row) pairs and returns a dict from row to the number of periods that traded in it.',
          starter: `def tpo_counts(periods):
    pass`,
          solution: `def tpo_counts(periods):
    out = {}
    for lo, hi in periods:
        for row in range(lo, hi + 1):
            out[row] = out.get(row, 0) + 1
    return out`,
          tests: `out = tpo_counts([(3, 6), (4, 7), (5, 6), (2, 5)])
assert out is not None, "the function returns nothing yet"
assert out[5] == 4, f"all four periods traded row 5, got {out.get(5)}"
assert out[2] == 1 and out[7] == 1, "rows 2 and 7 were traded by one period each"
assert sorted(out) == [2, 3, 4, 5, 6, 7], f"rows 2 to 7, got {sorted(out)}"
assert tpo_counts([(10, 10)]) == {10: 1}, "a period with low equal to high still traded one row"`,
          why: 'Each period adds one to every row from its low to its high, ends included. The row with the highest count is the TPO POC.',
        },
        {
          kind: 'design',
          id: 'profile-tpo-12',
          ask: 'You want to use day types in your plan. Write how you will classify a day as it develops, and what you will and will not do with the label.',
          checklist: [
            { point: 'The IB width compared with recent days, noted at 10:30', why: 'A narrow IB leaves room for range extension; a wide one often contains the day.' },
            { point: 'Whether and on which side range extension happens', why: 'One-sided extension points to normal variation or trend; both sides to neutral.' },
            { point: 'Where price is within the range late in the day', why: 'Trend and neutral extreme days close near an end.' },
            { point: 'That the label is provisional until the close', why: 'Days change type; a confident early label is a guess.' },
            { point: 'Numbers for the thresholds (for example range ÷ IB)', why: 'Words like "wide" and "narrow" drift with your mood.' },
            { point: 'Recording the final type with each trade', why: 'Then you can see which setups work on which days in your own results.' },
          ],
          why: 'Day types are useful labels for review and for framing a session. Used live, they must be treated as a working guess that can change.',
        },
      ],
    },
    {
      id: 'profile-which',
      title: 'Which profile: session, composite and yesterday\'s value',
      summary: 'Choosing the period a profile covers, reading the open against yesterday\'s value, and treating rules of thumb as claims.',
      text: [
        'A profile covers whatever period you choose. A **session profile** covers one day, regular hours or including the overnight session (for index futures, which trade nearly around the clock, this choice changes the profile a lot). A **composite profile** adds several days together and shows the larger area of balance. A **fixed range** or **anchored** profile starts at a point you pick, such as a news release or the start of a move. Each answers a different question, and the levels differ.',
        'The levels day traders carry over most are **yesterday\'s POC, VAH and VAL**, beside yesterday\'s high, low and close from the charts module. A **naked POC** (or virgin POC) is a past session\'s POC that price has not traded back to since. Some traders mark them; whether price returns to them more than to any other old price is a claim to test, not a fact.',
        'The open against yesterday\'s value is a common way to frame the day. **Opening inside value** suggests acceptance of yesterday\'s prices, and often (not always) a rotational day. **Opening outside value but inside yesterday\'s range** means the market is testing new prices. **Opening outside the range** is a stronger sign of imbalance. These are descriptions that help you choose which setups to look for.',
        'The **80% rule**, usually credited to Jim Dalton\'s work, is stated like this: if the market opens outside yesterday\'s value area and then trades back inside it for two consecutive half-hour periods, there is a high chance (the name says 80%) that it crosses the whole value area to the other side. Versions differ (one period or two, TPO or volume value area, regular or full session), and tests reported by independent traders come in well below 80%. Treat it as a hypothesis with a definition you write down, and measure it.',
        { code: `# one version of the 80% rule, opening below value
triggered = open_ < val and closes[0] >= val and closes[1] >= val
success = triggered and max(highs[2:]) >= vah` },
        'A sample of a few dozen days cannot pin the rate down well. With 50 qualifying days and a 62% success rate, the standard error is about 7 percentage points, so the true rate could plausibly be anywhere from about 48% to 76%. The backtest module comes back to this.',
      ],
      rules: [
        'Session, composite and anchored profiles answer different questions. Name the one you use.',
        'Carry over yesterday\'s POC, VAH and VAL beside yesterday\'s high, low and close.',
        'Open inside value, outside value, or outside the range: three ways to frame the day.',
        'The 80% rule and naked POCs are claims. Write a precise definition and test it.',
        'A few dozen cases give a rate with a wide margin of error.',
      ],
      questions: [
        {
          kind: 'choice',
          id: 'profile-which-1',
          ask: 'SPY has traded between 446 and 454 for two weeks. Which profile shows where most of that period\'s trading happened?',
          options: [
            'A composite profile of the two weeks',
            'Today\'s session profile',
            'A profile anchored at this morning\'s open',
            'Yesterday\'s session profile',
          ],
          answer: 0,
          why: 'A composite adds the sessions together and shows the value of the whole balance area. A single session shows only one day of it.',
        },
        {
          kind: 'choice',
          id: 'profile-which-2',
          ask: 'At 14:00 the Fed releases a statement and SPY moves 1.5% in ten minutes. You want to see where trade has built since the release. Which profile?',
          options: [
            'A profile anchored at the release time',
            'The composite of the last month',
            'Yesterday\'s session profile',
            'A TPO chart of the morning',
          ],
          answer: 0,
          why: 'Anchoring at the event isolates trade after the news, which the day\'s full profile would mix with the morning.',
        },
        {
          kind: 'choice',
          id: 'profile-which-3',
          ask: 'Yesterday SPY\'s value area was 448 to 452, its high 454 and its low 446. Today it opens at 453. How do you describe the open?',
          options: [
            'Above value but inside yesterday\'s range',
            'Inside value',
            'Above yesterday\'s range',
            'Below value',
          ],
          answer: 0,
          why: '453 is above VAH (452) and below the high (454). The market opens testing prices yesterday traded only briefly.',
        },
        {
          kind: 'choice',
          id: 'profile-which-4',
          ask: 'What is a naked POC?',
          options: [
            'A past session\'s point of control that price has not traded at since',
            'A POC with no volume',
            'Today\'s POC before 10:00',
            'A POC outside the value area',
          ],
          answer: 0,
          why: 'Naked or virgin means untouched since the session ended. Claims that price is drawn back to them are popular; treat them as something to measure.',
        },
        {
          kind: 'number',
          id: 'profile-which-5',
          ask: 'You test one written version of the 80% rule on two years of SPY. It triggers on 50 days and reaches the other side of value on 31. What is the success rate? Give a percentage, for example 80%.',
          answer: 0.62,
          check: '31 / 50',
          why: '31 ÷ 50 = 62%, well short of the name. Your definition and data may differ from others, which is exactly why you measure your own version.',
        },
        {
          kind: 'number',
          id: 'profile-which-6',
          ask: 'With 50 cases and a 62% rate, what is the standard error of the rate, √(p × (1 − p) ÷ n)? Give two decimals.',
          answer: 0.0686,
          tol: 0.006,
          check: 'math.sqrt(0.62 * 0.38 / 50)',
          why: '√(0.62 × 0.38 ÷ 50) = 0.069, about 7 percentage points. Two standard errors either side gives roughly 48% to 76%: fifty days cannot tell you much.',
        },
        {
          kind: 'output',
          id: 'profile-which-7',
          ask: 'Each day is (open, yesterday\'s VAL, VAH, low, high). What does this print?',
          code: `def open_type(o, val, vah, low, high):
    if val <= o <= vah:
        return "inside value"
    if low <= o <= high:
        return "outside value"
    return "outside range"

days = [(450, 448, 452, 446, 454), (453, 448, 452, 446, 454), (444, 448, 452, 446, 454)]
print([open_type(*d) for d in days])`,
          answer: "['inside value', 'outside value', 'outside range']",
          why: '450 is inside 448 to 452. 453 is above value but below the high. 444 is below yesterday\'s low.',
        },
        {
          kind: 'bug',
          id: 'profile-which-8',
          ask: 'This should check whether the 80% rule triggered after an open below value: two consecutive half-hour closes back inside value. It triggers when only one close is inside.',
          code: `def triggered(open_, val, vah, closes):
    if open_ >= val:
        return False
    for i in range(len(closes) - 1):
        if val <= closes[i] <= vah or val <= closes[i + 1] <= vah:
            return True
    return False`,
          line: 5,
          fix: '        if val <= closes[i] <= vah and val <= closes[i + 1] <= vah:',
          why: 'The rule needs both consecutive closes inside value, so the conditions are joined with `and`. With `or`, a single close inside is enough, which tests a different and looser rule.',
        },
        {
          kind: 'write',
          id: 'profile-which-9',
          ask: 'Write `eighty_rule(days)` that tests one version of the rule for opens below value. Each day is a dict with `open`, `val`, `vah` (yesterday\'s), and `periods`, a list of half-hour `(high, low, close)`. It triggers if the open is below VAL and two consecutive closes are inside value (VAL to VAH, ends included). It succeeds if any later period\'s high reaches VAH. Return `(triggered, succeeded)` counts.',
          starter: `def eighty_rule(days):
    triggered = succeeded = 0
    # for each day: find the first pair of consecutive closes inside value,
    # then look at the highs of the periods after that pair
    return triggered, succeeded`,
          solution: `def eighty_rule(days):
    triggered = succeeded = 0
    for d in days:
        if d["open"] >= d["val"]:
            continue
        closes = [p[2] for p in d["periods"]]
        for i in range(len(closes) - 1):
            if d["val"] <= closes[i] <= d["vah"] and d["val"] <= closes[i + 1] <= d["vah"]:
                triggered += 1
                later = d["periods"][i + 2:]
                if any(p[0] >= d["vah"] for p in later):
                    succeeded += 1
                break
    return triggered, succeeded`,
          tests: `win = {"open": 447, "val": 448, "vah": 452, "periods": [(448.5, 446.8, 448.2), (449.0, 448.0, 448.8), (450.5, 448.6, 450.2), (452.3, 450.0, 451.9)]}
lose = {"open": 447, "val": 448, "vah": 452, "periods": [(448.5, 446.8, 448.2), (449.0, 448.0, 448.8), (449.5, 447.0, 447.2), (448.0, 446.0, 446.5)]}
never = {"open": 447, "val": 448, "vah": 452, "periods": [(448.5, 446.8, 448.2), (448.3, 446.0, 446.4), (447.0, 445.0, 445.5)]}
inside = {"open": 450, "val": 448, "vah": 452, "periods": [(452.5, 449.0, 451.0), (451.5, 450.0, 451.0), (453.0, 451.0, 452.5)]}
early = {"open": 447, "val": 448, "vah": 452, "periods": [(452.2, 446.8, 448.2), (449.0, 448.0, 448.8), (449.5, 448.1, 449.0)]}
out = eighty_rule([win])
assert out is not None, "the function returns nothing yet"
assert out == (1, 1), f"two closes inside, then a high of 452.3 reaches VAH: (1, 1), got {out}"
assert eighty_rule([lose]) == (1, 0), "triggered but never reached VAH"
assert eighty_rule([never]) == (0, 0), "only one close inside value: not triggered"
assert eighty_rule([inside]) == (0, 0), "an open inside value is not a case for this version"
assert eighty_rule([early]) == (1, 0), "a high reached before the trigger does not count: only periods after the pair"
assert eighty_rule([win, lose, never, inside, early]) == (3, 1), "count across all days"`,
          hint: 'The pair is periods `i` and `i + 1`, so the later periods start at `i + 2`. Stop at the first pair with `break`.',
          why: 'Every choice is in the code: which opens count, what "inside" means, when the trigger is known and which highs may count afterwards. Counting a high from before the trigger is lookahead and inflates the rate.',
        },
        {
          kind: 'choice',
          id: 'profile-which-10',
          ask: 'You compare an ES futures profile of the regular session with one that includes the overnight session. Why do the POC and value area differ?',
          options: [
            'The overnight session adds hours of trading, often at different prices, to the second profile',
            'Futures have no volume overnight',
            'They should be identical; one platform is wrong',
            'Overnight trades are counted twice',
          ],
          answer: 0,
          why: 'Index futures trade nearly around the clock. Including the overnight hours adds their volume and can shift both POC and value. Pick one and use it consistently.',
        },
        {
          kind: 'choice',
          id: 'profile-which-11',
          ask: 'Two websites quote success rates of 80% and 55% for "the 80% rule". What is the most likely reason?',
          options: [
            'They tested different definitions, markets and periods, with small samples',
            'One is lying and the other is right',
            'The rule stopped working in a particular year',
            'The percentages measure the same thing in different units',
          ],
          answer: 0,
          why: 'One half hour or two, TPO or volume value, regular or full session, and the target all vary, and samples are often small. A quoted rate means little without its exact definition.',
        },
        {
          kind: 'design',
          id: 'profile-which-12',
          ask: 'Plan a test of the 80% rule on SPY before you trade it.',
          checklist: [
            { point: 'The exact definition: VA method and row size, session, one or two periods, which closes, the target', why: 'Every choice changes the rate, and a vague rule cannot be tested.' },
            { point: 'Only information available at the time: highs after the trigger, not before', why: 'Counting earlier highs is lookahead.' },
            { point: 'A time limit for success, such as by the close', why: 'Without one, "eventually" makes almost anything succeed.' },
            { point: 'Enough cases and the margin of error stated', why: 'Fifty days give a rate uncertain by about 7 points either way.' },
            { point: 'An entry, stop and target, with costs, not only the hit rate', why: 'Reaching the other side is not a profit if the stop is hit first more often than not.' },
            { point: 'Out-of-sample data kept back, then paper trading', why: 'A rule tuned on the same days it is judged on looks better than it is.' },
          ],
          why: 'A hit rate is not an edge. The test must define the trade fully and judge it on results after costs, on data it was not fitted to.',
        },
      ],
    },
    {
      id: 'profile-trading',
      title: 'Trading with the profile',
      summary: 'Levels as context, combined with VWAP and order flow, written as rules, with the ways it fails.',
      text: [
        'The profile gives you levels: yesterday\'s POC, VAH and VAL, nodes, today\'s developing value. Use them the way the charts module used support and resistance: as zones where you decide, with a stop beyond the zone and a target at the next level. A level gives you the distances for the reward to risk. It does not tell you that price will turn.',
        'VWAP and the POC are related but different. VWAP (from the charts module) is the volume-weighted **mean** price of the day; the POC is the most traded price, the **mode**. On a balanced day they are often close. On a trend day VWAP moves with the trend while the POC may stay back where the heaviest trading was. Agreement between them describes a well-balanced day; it is not a stronger signal in itself.',
        'Order flow, from the previous module, is the close-up view. A trader waiting at yesterday\'s VAL might want to see aggressive selling there fail to push price lower before buying. The profile says where to look; the tape and the footprint show what happens there. Neither replaces a stop.',
        { code: `# a setup written as rules (long side)
if open_ < val and two_closes_inside_value:
    entry = val + 0.05
    stop = min(lows_since_open) - 0.10
    target = poc                       # first target; vah beyond it
    go = (target - entry) / (entry - stop) >= 1.5` },
        'How it fails. On a trend day price runs through every level: VAL, POC, VAH and yesterday\'s high all fail in turn, and a trader who keeps fading them loses again and again. With enough lines (several days of POCs, nodes, value edges, VWAP and its bands) price is always "at a level" and the levels mean nothing. And platform differences mean your level is a zone, not a price.',
        'The honest frame: the profile describes where business was done. It can help you choose where to act and where you are wrong. Whether a setup built on it has an edge, after spreads and slippage, can only be found by writing it down as rules, testing it, then paper trading it. Most retail day traders lose money; a well-drawn profile does not change that on its own.',
      ],
      rules: [
        'Profile levels are zones to decide at, with a stop beyond and a target at the next level.',
        'VWAP is the volume-weighted mean, the POC the most traded price. They answer different questions.',
        'The profile says where to look; order flow shows what happens there. Neither replaces a stop.',
        'Trend days run through value levels. Have a rule for stopping fades.',
        'Few levels, written rules, tested with costs before real money.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'profile-trading-1',
          ask: 'SPY opened below yesterday\'s VAL of 449.00 and has closed two half hours back inside value. You plan to buy at 449.20 with a stop at 448.70, below today\'s low, and a first target at yesterday\'s POC, 450.80. What is the reward to risk?',
          answer: 3.2,
          check: '(450.80 - 449.20) / (449.20 - 448.70)',
          why: 'Reward 1.60, risk 0.50: 3.2. The levels set both numbers before entry. The ratio does not tell you the chance of reaching the target.',
        },
        {
          kind: 'number',
          id: 'profile-trading-2',
          ask: 'A tiny profile has rows 10, 11 and 12 with 5,000, 2,000 and 3,000 shares. What is the VWAP of these trades?',
          answer: 10.8,
          check: '(10 * 5000 + 11 * 2000 + 12 * 3000) / 10000',
          why: '(50,000 + 22,000 + 36,000) ÷ 10,000 = 10.80, while the POC is 10. The mean is pulled up by the trades at 12; the mode is where most shares traded.',
        },
        {
          kind: 'choice',
          id: 'profile-trading-3',
          ask: 'On a strong up day, VWAP climbs from 448 to 452 while the POC stays at 448.50 from the morning. What does the gap tell you?',
          options: [
            'Trade has moved up through the day, but the single busiest price is still the morning one',
            'Price must return to the POC before the close',
            'VWAP is wrong',
            'The day is balanced',
          ],
          answer: 0,
          why: 'VWAP follows the average of all trades, so it climbs with the move. The POC is the busiest row, still the morning one. It is a description of the day, not a pull back toward 448.50.',
        },
        {
          kind: 'choice',
          id: 'profile-trading-4',
          ask: 'You have marked yesterday\'s POC, VAH and VAL, three naked POCs, four LVNs, VWAP and its bands. Price is "at a level" almost everywhere. What is the problem?',
          options: [
            'With that many lines any price is near one, so the levels stop meaning anything; keep a few',
            'Not enough levels yet',
            'The levels are fine; price respects all of them',
            'Only VWAP matters',
          ],
          answer: 0,
          why: 'A level is useful because it is one of a few chosen places to decide. Twelve lines spaced 20 cents apart make every move look like a reaction to something.',
        },
        {
          kind: 'choice',
          id: 'profile-trading-5',
          ask: 'You wait to buy at yesterday\'s VAL. Price arrives and the order flow shows heavy aggressive selling that fails to push price lower. How should that information be used?',
          options: [
            'As a condition written into the setup in advance, with a stop below the zone in any case',
            'As proof the level will hold, so no stop is needed',
            'As a reason to double the size',
            'It should be ignored because order flow and profile never agree',
          ],
          answer: 0,
          why: 'Selling that fails to make progress (absorption, from the order flow module) is a reasonable confirmation to require. It adds no certainty, so the stop and size stay as planned.',
        },
        {
          kind: 'choice',
          id: 'profile-trading-6',
          ask: 'A trader sold every test of VAH, then the POC, then yesterday\'s high, on a day that rallied 2% from the open. What went wrong?',
          options: [
            'It was a trend day: levels fail in turn, and fading them without a rule to stop is the classic way to lose on one',
            'The levels were drawn wrongly',
            'They should have sold more at each level',
            'Nothing; it was bad luck',
          ],
          answer: 0,
          why: 'On a trend day value migrates and every level is traded through. A rule such as "no fades after two closes beyond the IB on the same side" is how a plan protects itself from this day.',
        },
        {
          kind: 'number',
          id: 'profile-trading-7',
          ask: 'A tested setup wins 45% of the time. Winners average +2R and losers −1R (R is the amount risked per trade). What is the average result per trade, in R?',
          answer: 0.35,
          check: '0.45 * 2 - 0.55 * 1',
          why: '0.45 × 2 − 0.55 × 1 = +0.35R before costs. Spreads, slippage and fees come out of that, and the risk module shows how much a small edge can shrink.',
        },
        {
          kind: 'output',
          id: 'profile-trading-8',
          ask: 'What does this print?',
          code: `levels = {"VAL": 449.00, "POC": 450.80, "VAH": 452.10, "VWAP": 450.30}
price = 450.55
above = min((v, k) for k, v in levels.items() if v > price)
below = max((v, k) for k, v in levels.items() if v < price)
print(below[1], above[1], round(above[0] - below[0], 2))`,
          answer: 'VWAP POC 0.5',
          why: 'The nearest level below 450.55 is VWAP at 450.30 and the nearest above is the POC at 450.80. Half a dollar between two levels leaves little room for a trade inside it.',
        },
        {
          kind: 'bug',
          id: 'profile-trading-9',
          ask: 'This plans a long: stop a buffer below the nearest level under the entry, target at the nearest level above. The stop it returns is above the entry.',
          code: `def plan_long(entry, levels, buffer):
    below = [x for x in levels if x < entry]
    above = [x for x in levels if x > entry]
    stop = min(above) - buffer
    target = min(above)
    return stop, target, (target - entry) / (entry - stop)`,
          line: 4,
          fix: '    stop = max(below) - buffer',
          why: 'The stop belongs under the nearest level below the entry, `max(below)`. Using the level above puts the stop over the entry, so the "risk" is negative and the ratio meaningless.',
        },
        {
          kind: 'write',
          id: 'profile-trading-10',
          ask: 'Write `plan_long(entry, levels, buffer)` that returns `(stop, target, ratio)`: stop is the nearest level below the entry minus `buffer`, target the nearest level above, ratio the reward to risk rounded to 2 decimals. Return `None` if there is no level on one side.',
          starter: `def plan_long(entry, levels, buffer):
    pass`,
          solution: `def plan_long(entry, levels, buffer):
    below = [x for x in levels if x < entry]
    above = [x for x in levels if x > entry]
    if not below or not above:
        return None
    stop = max(below) - buffer
    target = min(above)
    return stop, target, round((target - entry) / (entry - stop), 2)`,
          tests: `out = plan_long(449.20, [448.80, 449.00, 450.80, 452.10], 0.30)
assert out is not None, "the function returns nothing yet"
stop, target, ratio = out
assert abs(stop - 448.70) < 1e-9, f"the nearest level below is 449.00, minus 0.30 is 448.70, got {stop}"
assert abs(target - 450.80) < 1e-9, f"the nearest level above is 450.80, got {target}"
assert ratio == 3.2, f"1.60 / 0.50 = 3.2, got {ratio}"
assert plan_long(453.00, [449.00, 452.10], 0.2) is None, "no level above: no target, no plan"
assert plan_long(448.00, [449.00, 452.10], 0.2) is None, "no level below: no stop, no plan"`,
          why: 'Building stop and target from the levels and refusing to plan without both makes the reward to risk a fixed calculation, not a number you talk yourself into.',
        },
        {
          kind: 'design',
          id: 'profile-trading-11',
          ask: 'Write a value area re-entry setup on SPY as rules someone else could follow and test.',
          checklist: [
            { point: 'Context: open below (or above) yesterday\'s value, with the VA method stated', why: 'The setup only exists in a defined situation.' },
            { point: 'Trigger: a precise re-entry condition, such as two 30-minute closes inside value', why: 'A vague trigger cannot be tested or followed the same way twice.' },
            { point: 'Entry, stop (beyond the day\'s low or the zone) and targets (POC, then VAH)', why: 'Every trade needs its loss defined before it starts.' },
            { point: 'A minimum reward to risk and a time stop', why: 'A trade that has not worked by a set time ties up risk and attention.' },
            { point: 'Conditions to stand aside: a trend day, news due, too many levels close together', why: 'Knowing when the setup does not apply prevents its worst losses.' },
            { point: 'Size from a fixed fraction of the account, a daily loss limit, and paper trading first', why: 'Survival comes from sizing and limits, not from the setup.' },
          ],
          why: 'Written rules turn a profile idea into something you can backtest, paper trade and judge, instead of a story you adjust each day.',
        },
        {
          kind: 'choice',
          id: 'profile-trading-12',
          ask: 'A course advertises: "Naked POCs are magnets. Price returns to them 90% of the time. Buy our indicator." What is the sound response?',
          options: [
            'Ask for the exact definition and time limit, and test it yourself; "returns eventually" can be true and still give no edge',
            'Buy it, because 90% is high',
            'Trade the opposite, because sellers lie',
            'Assume levels never matter',
          ],
          answer: 0,
          why: 'With no time limit, price revisits most nearby prices eventually. A claim is useful only with a definition, a time frame, costs and an out-of-sample test. Sellers of indicators rarely supply those.',
        },
      ],
    },
    {
      id: 'profile-lab',
      title: 'Lab: a volume profile in Python',
      summary: 'From trades or bars to rows, the point of control, the value area and the nodes, with one method stated exactly.',
      text: [
        'Platforms draw profiles for you, but their settings are hidden and they differ from each other. This lab builds a volume profile from scratch so that you know exactly what every level means and can use it in a backtest.',
        'A profile here is two lists of the same length: `prices`, ascending in steps of the row size, and `vols`, the volume in each row. Rows with no trades are included with volume 0, so that the value area can only grow through neighbouring prices. Prices are assumed to lie on or near the row grid, and each is mapped to the row `round(price / size)`.',
        'The methods are the ones from the lessons. From bars, volume is spread evenly over every row from low to high. The POC is the row with the most volume, ties going to the row nearer the middle of the range and then to the lower row. The value area grows one row at a time from the POC, adding the bigger neighbour (tie: the one above) until it holds at least 70%. Nodes are rows above or below the `k` rows on each side.',
        'Write each step so that it can be tested on a case small enough to check by hand, and keep the method written down. When your numbers differ from a platform by a row, the method is the first place to look.',
      ],
      rules: [
        'Include empty rows between the lowest and highest price, with volume 0.',
        'From bars: spread each bar\'s volume evenly over its rows, low and high included.',
        'POC ties: nearer the middle, then lower. Value area: one row at a time, tie to the row above, stop at the first share at or above the target.',
        'Nodes: strictly above (HVN) or below (LVN) the k rows on each side.',
        'Write the method down: it explains every difference from a platform.',
      ],
      questions: [
        {
          kind: 'write',
          id: 'profile-lab-1',
          ask: 'Step 1: rows from trades. Write `from_trades(trades, size)` returning `(prices, vols)`: every row from the lowest to the highest traded row, ascending, prices rounded to 2 decimals, empty rows with volume 0.',
          starter: `def from_trades(trades, size):
    # trades: list of (price, shares)
    # row index k = round(price / size); row price = round(k * size, 2)
    pass`,
          solution: `def from_trades(trades, size):
    vol = {}
    for price, shares in trades:
        k = round(price / size)
        vol[k] = vol.get(k, 0) + shares
    lo, hi = min(vol), max(vol)
    prices = [round(k * size, 2) for k in range(lo, hi + 1)]
    vols = [vol.get(k, 0) for k in range(lo, hi + 1)]
    return prices, vols`,
          tests: `out = from_trades([(450.10, 300), (450.20, 500), (450.10, 200), (450.40, 100)], 0.10)
assert out is not None, "the function returns nothing yet"
prices, vols = out
assert prices == [450.1, 450.2, 450.3, 450.4], f"rows 450.10 to 450.40, empty 450.30 included, got {prices}"
assert vols == [500, 500, 0, 100], f"volumes per row, 0 for the empty row, got {vols}"
p, v = from_trades([(20.0, 1), (19.0, 2)], 0.5)
assert p == [19.0, 19.5, 20.0] and v == [2, 0, 1], f"rows must be ascending whatever the trade order, got {p}, {v}"
assert sum(from_trades([(5.0, 7), (5.5, 3)], 0.25)[1]) == 10, "the rows must add up to the total volume"`,
          hint: 'Work in integer row indices and only turn them into prices at the end.',
          why: 'Integer rows avoid float keys such as 450.30000000000001, and the zero rows matter later: without them the value area could jump over a gap as if it were a neighbouring price.',
        },
        {
          kind: 'write',
          id: 'profile-lab-2',
          ask: 'Step 2: rows from bars. Write `from_bars(bars, size)` for bars of `(high, low, volume)`, spreading each bar\'s volume evenly over every row from its low to its high, ends included. Return `(prices, vols)` as in step 1.',
          starter: `def from_bars(bars, size):
    pass`,
          solution: `def from_bars(bars, size):
    vol = {}
    for high, low, volume in bars:
        lo, hi = round(low / size), round(high / size)
        share = volume / (hi - lo + 1)
        for k in range(lo, hi + 1):
            vol[k] = vol.get(k, 0) + share
    lo, hi = min(vol), max(vol)
    prices = [round(k * size, 2) for k in range(lo, hi + 1)]
    vols = [vol.get(k, 0) for k in range(lo, hi + 1)]
    return prices, vols`,
          tests: `out = from_bars([(451.0, 450.0, 6000)], 0.25)
assert out is not None, "the function returns nothing yet"
prices, vols = out
assert prices == [450.0, 450.25, 450.5, 450.75, 451.0], f"five rows from 450.00 to 451.00, got {prices}"
assert all(abs(v - 1200) < 1e-9 for v in vols), f"6000 over five rows is 1200 each, got {vols}"
p, v = from_bars([(10.2, 10.0, 300), (10.4, 10.2, 600)], 0.1)
assert p == [10.0, 10.1, 10.2, 10.3, 10.4], f"rows 10.0 to 10.4, got {p}"
assert [round(x) for x in v] == [100, 100, 300, 200, 200], f"10.2 gets 100 from the first bar and 200 from the second, got {v}"
assert from_bars([(5.0, 5.0, 50)], 0.5) == ([5.0], [50.0]), "a bar with high equal to low puts all its volume in one row"`,
          why: 'The even spread is an assumption about where inside each bar the volume traded. It is the best you can do without trades, and the reason a profile from 1-minute bars is closer to the truth than one from 30-minute bars.',
        },
        {
          kind: 'write',
          id: 'profile-lab-3',
          ask: 'Step 3: the POC. Write `poc(vols)` returning the index of the row with the most volume. On a tie, take the row nearer the middle of the list; if still tied, the lower row.',
          starter: `def poc(vols):
    return vols.index(max(vols))`,
          solution: `def poc(vols):
    n = len(vols)
    best = max(vols)
    tied = [i for i in range(n) if vols[i] == best]
    return min(tied, key=lambda i: (abs(2 * i - (n - 1)), i))`,
          tests: `out = poc([3, 6, 10, 15, 12, 8, 4, 2])
assert out is not None, "the function returns nothing yet"
assert out == 3, f"the single largest row is index 3, got {out}"
assert poc([9, 1, 1, 1, 9, 1, 1]) == 4, "a tie between rows 0 and 4: row 4 is nearer the middle (3)"
assert poc([5, 1, 5, 5, 1, 5]) == 2, "rows 2 and 3 are equally near the middle (2.5): take the lower, 2"
assert poc([7]) == 0, "a single row is its own POC"`,
          hint: '`abs(2 * i - (n - 1))` is twice the distance from the middle and stays an integer.',
          why: 'Taking the first maximum, as the starter does, always picks the lowest tied row, which biases the POC down. Tie rules are one of the quiet reasons platforms disagree.',
        },
        {
          kind: 'write',
          id: 'profile-lab-4',
          ask: 'Step 4: the value area. Write `value_area(vols, pct=0.70)` returning `(lo, hi, share)`: row indices of VAL and VAH and the share of volume inside, rounded to 4 decimals. Use the `poc` rule from step 3 (it is in the starter), expand one row at a time, tie to the row above, stop at the first share at or above `pct`.',
          starter: `def poc(vols):
    n = len(vols)
    best = max(vols)
    tied = [i for i in range(n) if vols[i] == best]
    return min(tied, key=lambda i: (abs(2 * i - (n - 1)), i))

def value_area(vols, pct=0.70):
    p = poc(vols)
    pass`,
          solution: `def poc(vols):
    n = len(vols)
    best = max(vols)
    tied = [i for i in range(n) if vols[i] == best]
    return min(tied, key=lambda i: (abs(2 * i - (n - 1)), i))

def value_area(vols, pct=0.70):
    p = poc(vols)
    total = sum(vols)
    lo = hi = p
    taken = vols[p]
    while taken < pct * total:
        up = vols[hi + 1] if hi + 1 < len(vols) else -1
        down = vols[lo - 1] if lo > 0 else -1
        if up >= down:
            hi += 1
            taken += up
        else:
            lo -= 1
            taken += down
    return lo, hi, round(taken / total, 4)`,
          tests: `out = value_area([3, 6, 10, 15, 12, 8, 4, 2])
assert out is not None, "the function returns nothing yet"
assert out == (2, 5, 0.75), f"rows 2 to 5 holding 75%, got {out}"
assert value_area([1, 4, 8, 7, 9, 3, 2]) == (2, 4, 0.7059), "VAL row 2, VAH row 4 (the POC), 24 of 34"
assert value_area([3, 6, 10, 15, 12, 8, 4, 2], 0.5)[:2] == (2, 4), "at 50%: 15, then 12 above (27 of 60), then 10 below (37): rows 2 to 4"
assert value_area([5, 5, 5, 5])[:2] == (1, 3), "the POC is row 1 (ties go to the middle, then lower); later ties go up: rows 1 to 3"
assert value_area([0, 0, 10, 0, 0]) == (2, 2, 1.0), "all the volume in one row: the value area is that row"`,
          why: 'The function is the method written exactly. Change the tie rule or compare two rows at a time and VAH and VAL can move; that is the platform difference you saw in the lesson, now under your control.',
        },
        {
          kind: 'output',
          id: 'profile-lab-5',
          ask: 'Step 5: the same profile, one row at a time against two rows at a time. What does this print?',
          code: `vols = [3, 6, 10, 15, 12, 8, 4, 2]          # prices 100 to 107

def grow(vols, step):
    lo = hi = vols.index(max(vols))
    taken = vols[lo]
    while taken < 0.70 * sum(vols):
        up = sum(vols[hi + 1:hi + 1 + step]) if hi + 1 < len(vols) else -1
        down = sum(vols[max(0, lo - step):lo]) if lo > 0 else -1
        if up >= down:
            hi = min(hi + step, len(vols) - 1); taken += up
        else:
            lo = max(lo - step, 0); taken += down
    return 100 + lo, 100 + hi

print(grow(vols, 1), grow(vols, 2))`,
          answer: '(102, 105) (101, 105)',
          why: 'One row at a time gives 102 to 105, as in the lesson. Two rows at a time adds 104 and 105 together (20 against 16), then 102 and 101 (16 against 6), ending at 101 to 105 with 85%. Same trades, a different VAL.',
        },
        {
          kind: 'write',
          id: 'profile-lab-6',
          ask: 'Step 6: the nodes. Write `nodes(vols, k)` returning `(hvn, lvn)`: lists of row indices strictly above (HVN) or strictly below (LVN) each of the `k` rows on both sides. Rows without `k` rows on each side are skipped.',
          starter: `def nodes(vols, k):
    hvn, lvn = [], []
    return hvn, lvn`,
          solution: `def nodes(vols, k):
    hvn, lvn = [], []
    for i in range(k, len(vols) - k):
        around = vols[i - k:i] + vols[i + 1:i + k + 1]
        if vols[i] > max(around):
            hvn.append(i)
        if vols[i] < min(around):
            lvn.append(i)
    return hvn, lvn`,
          tests: `v = [2, 5, 11, 14, 9, 3, 1, 2, 6, 12, 15, 10, 4]
out = nodes(v, 1)
assert out is not None, "the function returns nothing yet"
assert out == ([3, 10], [6]), f"HVNs at rows 3 and 10, LVN at row 6, got {out}"
assert nodes(v, 2) == ([3, 10], [6]), "the same three nodes survive a window of 2"
assert nodes([1, 3, 2, 3, 1, 4, 1], 1) == ([1, 3, 5], [2, 4]), "a jagged profile has many nodes with k = 1"
assert nodes([1, 3, 2, 3, 1, 4, 1], 2) == ([], []), "with k = 2 none of these one-row wiggles survives"`,
          why: 'Joining the two sides into one list, `around`, keeps the condition short. The test with a jagged profile shows why the window size, or smoothing first, has to be chosen and fixed.',
        },
        {
          kind: 'bug',
          id: 'profile-lab-7',
          ask: 'Step 7: a profile from bars that gets the volume wrong. The rows add up to more than the total volume of the bars, and a bar whose high equals its low crashes it.',
          code: `def from_bars(bars, size):
    vol = {}
    for high, low, volume in bars:
        lo, hi = round(low / size), round(high / size)
        share = volume / (hi - lo)
        for k in range(lo, hi + 1):
            vol[k] = vol.get(k, 0) + share
    return vol`,
          line: 5,
          fix: '        share = volume / (hi - lo + 1)',
          why: 'A bar from row `lo` to row `hi` covers `hi - lo + 1` rows. Dividing by `hi - lo` gives each row too much, so the rows add up to more than the bar\'s volume, and a bar with high equal to low divides by zero. The loop and the divisor must count the same rows.',
        },
        {
          kind: 'write',
          id: 'profile-lab-8',
          ask: 'Step 8: put it together. Write `summary(trades, size)` returning a dict with keys `"poc"`, `"val"`, `"vah"` (prices) and `"share"` (from the value area). The helpers from the earlier steps are in the starter.',
          starter: `def from_trades(trades, size):
    vol = {}
    for price, shares in trades:
        k = round(price / size)
        vol[k] = vol.get(k, 0) + shares
    lo, hi = min(vol), max(vol)
    return [round(k * size, 2) for k in range(lo, hi + 1)], [vol.get(k, 0) for k in range(lo, hi + 1)]

def poc(vols):
    n = len(vols)
    best = max(vols)
    tied = [i for i in range(n) if vols[i] == best]
    return min(tied, key=lambda i: (abs(2 * i - (n - 1)), i))

def value_area(vols, pct=0.70):
    p = poc(vols)
    total = sum(vols)
    lo = hi = p
    taken = vols[p]
    while taken < pct * total:
        up = vols[hi + 1] if hi + 1 < len(vols) else -1
        down = vols[lo - 1] if lo > 0 else -1
        if up >= down:
            hi += 1
            taken += up
        else:
            lo -= 1
            taken += down
    return lo, hi, round(taken / total, 4)

def summary(trades, size):
    pass`,
          solution: `def from_trades(trades, size):
    vol = {}
    for price, shares in trades:
        k = round(price / size)
        vol[k] = vol.get(k, 0) + shares
    lo, hi = min(vol), max(vol)
    return [round(k * size, 2) for k in range(lo, hi + 1)], [vol.get(k, 0) for k in range(lo, hi + 1)]

def poc(vols):
    n = len(vols)
    best = max(vols)
    tied = [i for i in range(n) if vols[i] == best]
    return min(tied, key=lambda i: (abs(2 * i - (n - 1)), i))

def value_area(vols, pct=0.70):
    p = poc(vols)
    total = sum(vols)
    lo = hi = p
    taken = vols[p]
    while taken < pct * total:
        up = vols[hi + 1] if hi + 1 < len(vols) else -1
        down = vols[lo - 1] if lo > 0 else -1
        if up >= down:
            hi += 1
            taken += up
        else:
            lo -= 1
            taken += down
    return lo, hi, round(taken / total, 4)

def summary(trades, size):
    prices, vols = from_trades(trades, size)
    lo, hi, share = value_area(vols)
    return {"poc": prices[poc(vols)], "val": prices[lo], "vah": prices[hi], "share": share}`,
          tests: `trades = [(100, 3), (101, 6), (102, 10), (103, 15), (104, 12), (105, 8), (106, 4), (107, 2)]
out = summary(trades, 1.0)
assert out is not None, "the function returns nothing yet"
assert out["poc"] == 103.0, f"POC 103, got {out.get('poc')}"
assert out["val"] == 102.0 and out["vah"] == 105.0, f"value area 102 to 105, got {out.get('val')} to {out.get('vah')}"
assert out["share"] == 0.75, f"45 of 60 is 0.75, got {out.get('share')}"
out = summary([(50.0, 10), (50.5, 1), (52.0, 10)], 0.5)
assert out["poc"] == 50.0, f"a tie between 50.0 and 52.0 at equal distance from the middle goes to the lower row, got {out['poc']}"
assert out["vah"] == 52.0 and out["share"] == 1.0, f"to take in the volume at 52.0 the band must climb through the empty rows 51.0 and 51.5, got {out}"`,
          why: 'The second test shows the value area is a band of neighbouring rows: to take in the volume at 52.0 it has to climb through 51.0 and 51.5, where nothing traded. A value area can contain prices that were never accepted, one more reason to read it as a zone.',
        },
        {
          kind: 'design',
          id: 'profile-lab-9',
          ask: 'Step 9: before you use your profile in a backtest, how do you make sure it is right and usable?',
          checklist: [
            { point: 'Hand-worked tests for every function, kept with the code', why: 'A case you can check on paper catches most slips in the expansion and the tie rules.' },
            { point: 'A comparison with your platform on the same session, with differences explained', why: 'Differences of a row usually come from method; larger ones point to a bug or different data.' },
            { point: 'The method written down: row size, data source, session, POC ties, one or two rows, the percentage', why: 'Each changes the levels, and you need to reproduce them later.' },
            { point: 'Profiles used in a backtest built only from data before the decision', why: 'Yesterday\'s value is known today; today\'s final value is not known until the close.' },
            { point: 'The profile from bars checked against one from trades on a sample day', why: 'It shows how much the even-spread assumption moves the levels.' },
            { point: 'Levels treated as zones in any rule that uses them', why: 'A one-row difference should not flip a trade from taken to not taken.' },
          ],
          why: 'A profile is a simple algorithm with many small choices. Pinning them down, and making sure a backtest only uses profiles that were complete at the time, is what makes the levels testable.',
        },
      ],
    },
  ],
}
