import type { Module } from '../types'

export const orderflow: Module = {
  id: 'orderflow',
  title: 'Order flow',
  summary:
    'Reading who traded aggressively, at which prices and against how much resting size: the tape, delta, footprint charts and the depth of market, taught as a detailed record that gives context, not as a way to predict price.',
  lessons: [
    {
      id: 'orderflow-tape',
      title: 'From the book to the tape',
      summary: 'Time and sales, the aggressor, and why every trade prints at the bid or at the ask.',
      widget: 'orderflow-tape',
      text: [
        'Every trade has a buyer and a seller, and they trade the same quantity. So "more buyers than sellers" can never be true of the contracts that traded. What differs is who was in a hurry. The **aggressor** is the side whose order arrived and traded at once: a market order or a marketable limit. The other side was a **passive** limit order resting in the book (a reminder from the markets module: resting orders make the book, market orders take from it).',
        'The **tape**, or **time and sales**, lists every trade as it happens: time, price, size. A trade at the ask means a buyer lifted the offer: a **buy aggressor**. A trade at the bid means a seller hit the bid: a **sell aggressor**. Many platforms colour the prints that way, and futures exchanges such as CME publish the aggressor side with each trade.',
        'Price moves when the resting size at the best price is used up or withdrawn. If 12 contracts rest at the ask of 6000.25 and a market buy for 30 arrives, it takes the 12 and then the next level: the tape shows prints at 6000.25 and 6000.50, and the best ask is now higher. Aggressive buying moves price only as far as the book lets it.',
        { code: `bid, ask = 6000.00, 6000.25
for price, size in [(6000.25, 5), (6000.00, 7)]:
    side = "buy" if price >= ask else "sell" if price <= bid else "unknown"` },
        'Some prints sit between the bid and the ask: hidden or midpoint orders, and in US stocks trades reported from off-exchange venues. Their aggressor cannot be read from the quote. Also, one large order can show as many small prints, and many orders can be reported as one, so print size is not the same as order size.',
        'The tape is a record, not a forecast. Fast prints all at the ask tell you buyers are paying up now. They do not tell you whether the move continues, because the resting sellers they meet may be large and patient.',
      ],
      rules: [
        'Every trade has a buyer and a seller of equal size; the question is who was aggressive.',
        'A print at the ask is a buy aggressor; a print at the bid is a sell aggressor.',
        'Price moves when the size at the best level is used up or pulled.',
        'Prints between the bid and ask, or reported off-exchange, have no clear aggressor.',
        'Print size is not order size, and a busy tape is a description, not a prediction.',
      ],
      questions: [
        {
          kind: 'choice',
          id: 'orderflow-tape-1',
          ask: 'ES (the E-mini S&P 500 future) is quoted 6000.00 x 6000.25. A trade of 8 contracts prints at 6000.25. What happened?',
          options: [
            'A seller sent a market order and was filled at the ask',
            'A buyer sent a market or marketable order and took 8 contracts resting at the ask',
            'There were 8 more buyers than sellers',
            'It cannot be known from the quote',
          ],
          answer: 1,
          why: 'A trade at the ask means someone accepted the offer immediately: the buyer was the aggressor. The seller was a resting limit order. The trade still had exactly one buyer and one seller of 8 contracts.',
        },
        {
          kind: 'choice',
          id: 'orderflow-tape-2',
          ask: 'A commentator says ES rose "because there were more buyers than sellers". What is the accurate way to say it?',
          options: [
            'It is accurate as it stands',
            'Buyers were more aggressive: their market orders used up the resting offers level by level, so trades printed at higher prices',
            'More contracts were bought than were sold',
            'Sellers stopped trading altogether',
          ],
          answer: 1,
          why: 'Every contract bought was sold by someone, so volumes are always equal. Price rises when aggressive buyers take the offers faster than new offers arrive, or when offers are pulled. That is the mechanism order flow tries to watch.',
        },
        {
          kind: 'number',
          id: 'orderflow-tape-3',
          ask: 'The ask side holds 12 contracts at 6000.25, 20 at 6000.50 and 25 at 6000.75. A market buy for 30 contracts arrives. How many contracts print at 6000.50?',
          answer: 18,
          check: '30 - 12',
          why: 'The order takes all 12 at 6000.25 and the remaining 18 at 6000.50. 2 contracts stay at 6000.50 as the new best ask, and the tape shows two prints from one order.',
        },
        {
          kind: 'number',
          id: 'orderflow-tape-4',
          ask: 'For that 30-contract market buy, what is the average fill price? Give two decimal places.',
          answer: 6000.4,
          tol: 0.005,
          check: '(12 * 6000.25 + 18 * 6000.50) / 30',
          why: '(12 × 6000.25 + 18 × 6000.50) ÷ 30 = 6000.40. The order walked the book exactly as in the markets module; the tape is the public record of that walk.',
        },
        {
          kind: 'number',
          id: 'orderflow-tape-5',
          ask: 'One ES contract moves $12.50 per tick of 0.25 points ($50 per point). You buy 1 contract at 6000.25 and sell at 6002.75. What is your profit in dollars before costs?',
          answer: 125,
          check: '(6002.75 - 6000.25) / 0.25 * 12.50',
          why: '2.50 points is 10 ticks, and 10 × $12.50 = $125. Futures P&L is ticks times tick value times contracts; know the tick value before you trade any contract.',
        },
        {
          kind: 'output',
          id: 'orderflow-tape-6',
          ask: 'A short tape with an unchanged quote. What does this print?',
          code: `bid, ask = 6000.00, 6000.25
tape = [(6000.25, 5), (6000.25, 12), (6000.00, 7), (6000.25, 3), (6000.00, 20)]
buy = sum(s for p, s in tape if p >= ask)
sell = sum(s for p, s in tape if p <= bid)
print(buy, sell, buy - sell)`,
          answer: '20 27 -7',
          why: 'Prints at the ask add 5 + 12 + 3 = 20 of buy aggression; prints at the bid add 7 + 20 = 27 of sell aggression. More prints were at the ask, but more contracts were at the bid: count size, not prints.',
        },
        {
          kind: 'bug',
          id: 'orderflow-tape-7',
          ask: 'This should label a trade "buy" at or above the ask, "sell" at or below the bid, and `None` in between. A trade at the midpoint comes back as "sell".',
          code: `def aggressor(price, bid, ask):
    if price >= ask:
        return "buy"
    if price >= bid:
        return "sell"
    return None`,
          line: 4,
          fix: '    if price <= bid:',
          why: 'Any price above the bid passes `price >= bid`, so every midpoint print is called a sell. That quietly biases delta downwards in a market with many midpoint trades.',
        },
        {
          kind: 'choice',
          id: 'orderflow-tape-8',
          ask: 'SPY is quoted 600.00 x 600.02 and a print of 300 shares appears at 600.01. Who was the aggressor?',
          options: [
            'The buyer, because the price is above the bid',
            'The seller, because the price is below the ask',
            'It cannot be told from the quote: midpoint, hidden and off-exchange trades fill between the bid and ask',
            'Both sides equally',
          ],
          answer: 2,
          why: 'A print inside the spread did not lift the displayed offer or hit the displayed bid. It may be a midpoint order, hidden size or an off-exchange fill. Classification rules guess at these; the data lesson covers how.',
        },
        {
          kind: 'choice',
          id: 'orderflow-tape-9',
          ask: 'In the figure, set buyers to 70% and depth to 20 contracts per level. Then raise depth to 80 without changing buyers. What changes?',
          options: [
            'Delta stays the same and price moves fewer ticks, because each level now takes more contracts to use up',
            'Delta grows, because a deeper book attracts more buyers',
            'Nothing changes',
            'Price moves more ticks, because there is more size to trade',
          ],
          answer: 0,
          why: 'The same trades with the same sides give the same delta. How far price travels depends on how much resting size the aggressors meet. The same aggression moves a thick book less than a thin one, which is why delta alone does not tell you the size of a move.',
        },
        {
          kind: 'choice',
          id: 'orderflow-tape-10',
          ask: 'ES is quoted 6000.00 x 6000.25 with 40 contracts showing at the ask. When does the best ask move to 6000.50?',
          options: [
            'As soon as any buy trade prints',
            'When the 40 contracts at 6000.25 have been bought or cancelled and nothing new has joined there',
            'After one minute without a trade',
            'When more than 40 contracts trade anywhere in the book',
          ],
          answer: 1,
          why: 'A level disappears only when its resting size is gone, by fills or by cancels. New sellers can join at 6000.25 at any time, which is how a level can hold against heavy buying.',
        },
        {
          kind: 'write',
          id: 'orderflow-tape-11',
          ask: 'Write a function that totals a tape against a fixed quote. Return `(buy_volume, sell_volume, unknown_volume)`: at or above the ask is buy, at or below the bid is sell, anything between is unknown.',
          starter: `def tape_totals(trades, bid, ask):
    # trades: list of (price, size)
    pass`,
          solution: `def tape_totals(trades, bid, ask):
    buy = sell = unknown = 0
    for price, size in trades:
        if price >= ask:
            buy += size
        elif price <= bid:
            sell += size
        else:
            unknown += size
    return buy, sell, unknown`,
          tests: `out = tape_totals([(6000.25, 5), (6000.00, 7)], 6000.00, 6000.25)
assert out is not None, "the function returns nothing yet"
assert out == (5, 7, 0), f"5 at the ask is buy, 7 at the bid is sell: expected (5, 7, 0), got {out}"
out = tape_totals([(600.02, 100), (600.01, 300), (600.00, 200), (600.03, 50)], 600.00, 600.02)
assert out == (150, 200, 300), f"600.03 is above the ask (buy) and 600.01 is inside the spread (unknown): expected (150, 200, 300), got {out}"
assert tape_totals([], 1.0, 1.1) == (0, 0, 0), "an empty tape totals (0, 0, 0)"`,
          why: 'Keeping the unknown volume separate is the honest choice. Folding it into buys or sells makes delta look more certain than the data allows.',
        },
        {
          kind: 'design',
          id: 'orderflow-tape-12',
          ask: 'You will watch the ES tape for ten minutes around a level you marked in advance. Write down what you will note, so that afterwards you can compare what you saw with what price did.',
          why: 'Watching the tape without a record turns into stories told after the fact. Notes made at the time are the only way to learn whether what you see means anything.',
          checklist: [
            { point: 'The level and the time window, written before you watch', why: 'Deciding afterwards which moments mattered is hindsight.' },
            { point: 'Volume at the bid and at the ask at the level, not the number of prints', why: 'Size, not the count of prints, measures aggression.' },
            { point: 'Whether the best bid or ask kept refilling at the same price', why: 'A level that refills under heavy aggression is the first sign of absorption.' },
            { point: 'How many ticks price moved for the volume that traded', why: 'The same aggression moving price far or not at all says different things.' },
            { point: 'What price did over the next 5 or 10 minutes', why: 'Without the outcome you cannot test the reading.' },
            { point: 'A note on anything ambiguous, such as prints inside the spread or a news release', why: 'Ambiguous episodes should not be counted as evidence either way.' },
          ],
        },
      ],
    },
    {
      id: 'orderflow-delta',
      title: 'Delta and cumulative delta',
      summary: 'Buy aggression minus sell aggression, bar by bar and through the day, and what a divergence does and does not say.',
      widget: 'orderflow-cvd',
      text: [
        "A bar's **delta** is the volume traded at the ask minus the volume traded at the bid: buy aggression minus sell aggression. A bar with 1,250 contracts at the ask and 980 at the bid has a delta of +270. Delta is about who was in a hurry. It is not net buying, because every contract bought was also sold.",
        '**Cumulative delta** (or cumulative volume delta, CVD) adds the bar deltas from a starting point, usually the session open. Its level depends entirely on where you start counting; only its changes mean something. Two platforms that start at different times, or treat unclassified trades differently, show different numbers for the same market.',
        { code: `from itertools import accumulate
deltas = [270, -120, 340, -500]
cvd = list(accumulate(deltas))   # [270, 150, 490, -10]` },
        'Most of the time delta and price move together within a bar: aggressive buying lifts offers, so up bars tend to have positive delta. That is close to a definition, not a discovery. The interesting cases are when they disagree. A **divergence** is price making a new high while CVD makes a lower high (or the mirror image at a low): the new price was reached with less net aggression than before.',
        'A bar can close up with negative delta. Aggressive sellers hit the bids, but buyers kept raising their limit bids and sellers pulled their offers higher, so trades printed at rising prices. Passive orders move price too, and delta does not see them.',
        'Treat divergence as a question, not a signal. Prices often keep going after one, and the same picture can be read as "buyers are tiring" or "passive buyers are doing the work". If you want to use it, write it as a rule and count how often it was followed by the move you expect, against how often by the opposite.',
      ],
      rules: [
        'Delta = volume at the ask − volume at the bid, per bar.',
        'Cumulative delta adds bar deltas from a chosen start; its level is arbitrary, its changes are not.',
        'Up bars with positive delta are the normal case, not a signal.',
        'Price can rise on negative delta when passive buyers raise their bids or offers are pulled.',
        'A divergence is a question to test, not a reversal signal.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'orderflow-delta-1',
          ask: 'A 5-minute bar has 1,250 contracts traded at the ask and 980 at the bid. What is its delta?',
          answer: 270,
          check: '1250 - 980',
          why: 'Delta = ask volume − bid volume = 1,250 − 980 = +270. It says buyers were the more aggressive side in this bar, nothing more.',
        },
        {
          kind: 'number',
          id: 'orderflow-delta-2',
          ask: 'For the same bar, what is delta as a share of total volume? Give a percentage, for example 15%.',
          answer: 0.1211,
          tol: 0.002,
          check: '(1250 - 980) / (1250 + 980)',
          why: '270 ÷ 2,230 ≈ 12.1%. Delta grows with volume, so a delta of +270 means more in a quiet bar than in a busy one. Comparing delta as a share of volume puts bars on the same footing.',
        },
        {
          kind: 'number',
          id: 'orderflow-delta-3',
          ask: 'A bar traded 8,000 contracts in total, all classified, with a delta of −1,200. How many contracts traded at the bid?',
          answer: 4600,
          check: '(8000 + 1200) / 2',
          hint: 'ask + bid = 8,000 and ask − bid = −1,200.',
          why: 'Subtracting the second equation from the first gives 2 × bid = 9,200, so bid = 4,600 and ask = 3,400. Sellers were the aggressive side on 57.5% of the volume.',
        },
        {
          kind: 'output',
          id: 'orderflow-delta-4',
          ask: 'What does this print?',
          code: `from itertools import accumulate
deltas = [400, -150, -300, 250, 600]
cvd = list(accumulate(deltas))
print(cvd)`,
          answer: '[400, 250, -50, 200, 800]',
          why: 'Each value is the running total: 400, 400 − 150, then − 300, + 250, + 600. The third bar takes CVD below zero, which only means that since the start of counting sellers have been slightly more aggressive.',
        },
        {
          kind: 'choice',
          id: 'orderflow-delta-5',
          ask: 'The chart shows price and cumulative delta through a morning (CVD scaled to fit). What is the most accurate reading?',
          chart: {
            title: 'Price and cumulative delta',
            x: 'bar',
            series: [
              { name: 'price − 6000', points: [0, 3, 6, 4, 2, 5, 8, 7], color: 'accent' },
              { name: 'CVD ÷ 300', points: [0, 3, 6, 4.3, 3, 4, 5, 4.3], color: 'blue' },
            ],
          },
          options: [
            'A sure sign that price will now fall',
            'A divergence: the second high was reached with less net aggressive buying than the first; context to weigh, not a sell signal',
            'Proof that large sellers are hiding in the book',
            'Nothing: CVD and price always move together',
          ],
          answer: 1,
          why: 'Price made a higher high while CVD made a lower high. That says less about the future than it seems: the push may have been carried by passive buyers, and prices often continue after such divergences. It is a reason to look closer, not to act.',
        },
        {
          kind: 'choice',
          id: 'orderflow-delta-6',
          ask: 'A bar closes 3 ticks higher than it opened, with a delta of −400. How can that happen?',
          options: [
            'It cannot: a negative delta bar must close lower',
            'Sellers hit the bids, but buyers kept raising their limit bids and sellers pulled offers higher, so trades printed at rising prices',
            'The exchange reported the bar wrongly',
            'Delta counts only the first trade of each bar',
          ],
          answer: 1,
          why: 'Delta counts aggressive orders only. Passive buyers who keep moving their bids up, and sellers who withdraw their offers, move price without showing up in delta. This is one reason delta and price disagree.',
        },
        {
          kind: 'bug',
          id: 'orderflow-delta-7',
          ask: 'This should return the cumulative delta after each bar. It returns the bar deltas unchanged.',
          code: `def cvd(deltas):
    total = 0
    out = []
    for d in deltas:
        total = d
        out.append(total)
    return out`,
          line: 5,
          fix: '        total += d',
          why: 'The running total must add each delta to what came before. Assigning instead of adding throws away the history, which is the whole point of a cumulative line.',
        },
        {
          kind: 'choice',
          id: 'orderflow-delta-8',
          ask: 'In the figure, choose Together and move "start counting at bar" from 0 to 30. What happens to the CVD line?',
          options: [
            'Its shape after bar 30 is unchanged; it only shifts so that it starts from zero at bar 30',
            'It changes shape completely',
            'It turns into the price line',
            'It becomes flat',
          ],
          answer: 0,
          why: 'CVD is a running sum, so starting later subtracts a constant. The rises and falls are the same; only the level changes. Comparing CVD levels between platforms or days without the same starting point compares nothing.',
        },
        {
          kind: 'number',
          id: 'orderflow-delta-9',
          ask: 'CVD stands at +1,500 at the start of a bar. The bar has 2,600 contracts at the bid and 500 at the ask. What is CVD at the end of the bar?',
          answer: -600,
          check: '1500 + (500 - 2600)',
          why: "The bar's delta is 500 − 2,600 = −2,100, and 1,500 − 2,100 = −600. One heavy bar can erase a morning of mild buy aggression.",
        },
        {
          kind: 'choice',
          id: 'orderflow-delta-10',
          ask: 'At 11:00 ET two platforms show ES cumulative delta of +4,200 and −1,300 for the same contract. What is the most likely reason?',
          options: [
            'One of the platforms is reporting fake trades',
            'They start counting at different times (for example the overnight session at 18:00 ET against the 9:30 open), or treat unclassified trades differently',
            'Delta is random',
            'One platform uses ES and the other SPY, which is the same thing',
          ],
          answer: 1,
          why: 'A running sum depends on its starting point. Futures trade nearly around the clock, so "the session" can mean the overnight start or the US cash open. Check the setting before comparing any CVD number.',
        },
        {
          kind: 'write',
          id: 'orderflow-delta-11',
          ask: 'Write a function that returns cumulative delta for a list of bars, restarting at zero whenever the session changes. Each bar is `(session, ask_volume, bid_volume)`.',
          starter: `def session_cvd(bars):
    # bars: list of (session, ask_volume, bid_volume) in time order
    pass`,
          solution: `def session_cvd(bars):
    out = []
    total = 0
    current = None
    for session, ask_vol, bid_vol in bars:
        if session != current:
            total = 0
            current = session
        total += ask_vol - bid_vol
        out.append(total)
    return out`,
          tests: `bars = [("mon", 500, 300), ("mon", 200, 400), ("tue", 100, 600), ("tue", 700, 100)]
out = session_cvd(bars)
assert out is not None, "the function returns nothing yet"
assert len(out) == 4, f"one value per bar, got {len(out)}"
assert out[:2] == [200, 0], f"Monday: +200 then +200 - 200 = 0, got {out[:2]}"
assert out[2:] == [-500, 100], f"Tuesday restarts at zero: -500 then +100, got {out[2:]}: reset when the session changes"
assert session_cvd([]) == [], "no bars, no values"`,
          why: 'The reset is the choice platforms make for you. Writing it yourself makes the arbitrary starting point visible, and lets you test whether your reading changes when the start moves.',
        },
        {
          kind: 'design',
          id: 'orderflow-delta-12',
          ask: 'Someone claims that "a CVD divergence at the high of the day predicts a reversal". Design how you would test the claim on recorded ES data before believing it.',
          why: 'Divergences are easy to see in hindsight on the charts that worked. A written test with every case counted is the only way to know how often they mean anything.',
          checklist: [
            { point: 'An exact definition of divergence in code: how much higher the price high, how much lower the CVD high, over what window', why: 'A loose definition lets you count the examples you like and skip the rest.' },
            { point: 'An exact definition of "reversal": a fall of a set number of ticks within a set time', why: 'Without it any later dip can be called a success.' },
            { point: 'The base rate: how often price falls that far after any high of the day, divergence or not', why: 'If reversals are common anyway, the divergence adds nothing.' },
            { point: 'Every occurrence counted, including the ones where price kept rising', why: 'Leaving out failures is how false patterns survive.' },
            { point: 'Enough cases, and results split by time period', why: 'A handful of examples, or a pattern that worked in one month only, is luck until shown otherwise.' },
            { point: 'Costs and slippage included in any trading version of the test', why: 'A small edge in ticks can vanish after commission and the spread.' },
          ],
        },
      ],
    },
    {
      id: 'orderflow-footprint',
      title: 'Footprint charts',
      summary: 'Bid and ask volume at each price inside a bar, diagonal imbalances, stacked imbalances and unfinished auctions.',
      widget: 'orderflow-footprint',
      text: [
        'A **footprint** chart opens up a bar. For each price the bar traded at, it shows the volume that traded at the bid and the volume that traded at the ask, usually written bid x ask: "25 x 160" at 6001.00 means 25 contracts were sold aggressively at that price and 160 bought aggressively. The bar delta is the sum of the ask column minus the sum of the bid column.',
        'Imbalances are compared **diagonally**. When a buyer lifts the offer at 6001.00, the best bid at that moment is one tick lower, at 6000.75. So the fair comparison for buying at 6001.00 is the selling at 6000.75: ask volume at a price against bid volume one tick below. For selling, compare bid volume at a price with ask volume one tick above.',
        { code: `tick, ratio = 0.25, 3.0
# rows: {price: (bid_volume, ask_volume)}
buy_imbalance = rows[p][1] >= ratio * rows[p - tick][0]
sell_imbalance = rows[p][0] >= ratio * rows[p + tick][1]` },
        'A **buying imbalance** is a price where ask volume is at least some ratio, often 3 to 1 (300%), times the bid volume diagonally below. **Stacked imbalances** are three or more imbalances on the same side at consecutive prices: aggression that kept pressing through several levels. The ratio and the count of three are platform defaults and rules of thumb, not laws.',
        'At the extremes of a bar, look at both sides. If both bid and ask volume traded at the high (or the low), the auction there is called **unfinished**: buyers and sellers both still traded at that price. Many footprint traders expect such prices to be revisited. Treat that as a claim to test.',
        'Footprints are dense, and imbalances are common in any busy bar. The highest-volume price inside a bar, and the spread of volume across prices, belong to the volume profile module. Here the point is narrower: a footprint shows where in the bar the aggression happened, which a candle hides.',
      ],
      rules: [
        'A footprint row is bid volume x ask volume at one price inside the bar.',
        'Compare diagonally: ask at a price against bid one tick below; bid at a price against ask one tick above.',
        'An imbalance is a ratio over a threshold, often 3 to 1; the threshold is a choice.',
        'Stacked imbalances: three or more consecutive prices imbalanced on the same side.',
        'Unfinished auction: both sides traded at the bar high or low. A tendency claimed, not a rule.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'orderflow-footprint-1',
          ask: 'In a footprint, 240 contracts traded at the ask at 6001.00, and 60 traded at the bid at 6000.75. What is the diagonal buy ratio at 6001.00?',
          answer: 4,
          check: '240 / 60',
          why: '240 ÷ 60 = 4, or 400%. At a 300% threshold this is a buying imbalance at 6001.00.',
        },
        {
          kind: 'choice',
          id: 'orderflow-footprint-2',
          ask: 'Why do footprint imbalances compare ask volume at a price with bid volume one tick below, instead of with bid volume at the same price?',
          options: [
            'Because the exchange requires it',
            'Because when buyers lift the offer at a price, the best bid then is one tick lower: those two numbers were traded in the same quote',
            'Because bid volume at the same price is always zero',
            'It makes no difference which one you use',
          ],
          answer: 1,
          why: 'Ask volume at 6001.00 was traded when the quote was 6000.75 x 6001.00, and the selling in that same quote printed at 6000.75. Comparing within a row mixes two different quotes.',
        },
        {
          kind: 'number',
          id: 'orderflow-footprint-3',
          ask: 'Bid volume at 6000.75 is 45. With a 300% threshold, what is the smallest ask volume at 6001.00 that makes 6001.00 a buying imbalance?',
          answer: 135,
          check: '3 * 45',
          why: '3 × 45 = 135. Change the threshold to 250% and the answer is 113 (rounded up): the count of imbalances on a chart depends on a setting you choose.',
        },
        {
          kind: 'output',
          id: 'orderflow-footprint-4',
          ask: 'A footprint bar, low price first, rows as (price, bid, ask). What does this print?',
          code: `rows = [(6000.00, 30, 5), (6000.25, 40, 20), (6000.50, 25, 130),
        (6000.75, 20, 90), (6001.00, 35, 45)]
buys = [rows[i][0] for i in range(1, len(rows))
        if rows[i][2] >= 3 * rows[i - 1][1]]
print(buys)`,
          answer: '[6000.5, 6000.75]',
          why: '6000.25: 20 against 30, no. 6000.50: 130 against 40, yes. 6000.75: 90 against 25, yes. 6001.00: 45 against 20 is 2.25, no. Two imbalances in a row, one short of a stack of three.',
        },
        {
          kind: 'number',
          id: 'orderflow-footprint-5',
          ask: 'For the same bar (bids 30, 40, 25, 20, 35 and asks 5, 20, 130, 90, 45), what is the bar delta?',
          answer: 140,
          check: '(5 + 20 + 130 + 90 + 45) - (30 + 40 + 25 + 20 + 35)',
          why: 'Ask total 290, bid total 150: delta +140. The footprint adds where in the bar it happened: most of the buying was at 6000.50 and 6000.75.',
        },
        {
          kind: 'choice',
          id: 'orderflow-footprint-6',
          ask: 'Using three as the count, which set of buying imbalances in one bar is a stacked imbalance? (Tick 0.25.)',
          options: [
            '6001.00, 6001.50, 6002.00',
            '6001.00, 6001.25, 6001.50',
            '6001.00, 6001.25',
            '6000.50, 6001.25, 6002.00, 6002.75',
          ],
          answer: 1,
          why: 'Stacked means consecutive prices: 6001.00, 6001.25 and 6001.50 are three neighbours. Imbalances spaced out across the bar are not a stack, however many there are.',
        },
        {
          kind: 'bug',
          id: 'orderflow-footprint-7',
          ask: 'This should list buying imbalances, comparing ask volume diagonally with the bid one row below. It compares within the same row instead.',
          code: `def buy_imbalances(rows, ratio):
    out = []
    for i in range(1, len(rows)):
        price, bid, ask = rows[i]
        if ask >= ratio * bid:
            out.append(price)
    return out`,
          line: 5,
          fix: '        if ask >= ratio * rows[i - 1][1]:',
          why: 'Row i holds (price, bid, ask), so the bid one tick below is `rows[i - 1][1]`. The horizontal version compares two different quotes and finds different imbalances.',
        },
        {
          kind: 'choice',
          id: 'orderflow-footprint-8',
          ask: 'In the figure, set the ratio to 3.0, then to 3.5. What happens?',
          options: [
            'At 3.0 buying imbalances at 6001.00, 6001.25 and 6001.50 make a stack; at 3.5 the 6001.50 one drops out and the stack is gone',
            'Nothing changes: the bar is the same',
            'At 3.5 more imbalances appear',
            'The bar delta changes with the ratio',
          ],
          answer: 0,
          why: 'At 6001.50 the ask volume is exactly 3.0 times the bid below it, so it qualifies at 3.0 and not at 3.5. Whether a chart "shows a stacked imbalance" can hang on a setting. Delta does not depend on the ratio at all.',
        },
        {
          kind: 'choice',
          id: 'orderflow-footprint-9',
          ask: 'The top row of a bar, at its high, reads 14 x 9 (bid x ask). What do footprint traders call this, and how should you treat it?',
          options: [
            'A finished auction: price will not return there',
            'An unfinished auction: both sides traded at the high; some expect a revisit, which is a tendency to test, not a rule',
            'A buying imbalance',
            'An error, since nothing can trade at both sides of the high',
          ],
          answer: 1,
          why: 'Volume on both sides at the extreme means trading there had not dried up. The idea that price tends to come back is a common belief. Check how often it happens in your own data before relying on it.',
        },
        {
          kind: 'write',
          id: 'orderflow-footprint-10',
          ask: 'Write a function that finds diagonal imbalances in one footprint bar. Rows are `(price, bid, ask)`, lowest price first, one tick apart. Return `(buys, sells)`: buy at row i when ask[i] ≥ ratio × bid[i − 1]; sell at row i when bid[i] ≥ ratio × ask[i + 1]. Only count a side with volume above zero.',
          starter: `def imbalances(rows, ratio):
    buys, sells = [], []
    return buys, sells`,
          solution: `def imbalances(rows, ratio):
    buys, sells = [], []
    for i in range(len(rows)):
        price, bid, ask = rows[i]
        if i > 0 and ask > 0 and ask >= ratio * rows[i - 1][1]:
            buys.append(price)
        if i < len(rows) - 1 and bid > 0 and bid >= ratio * rows[i + 1][2]:
            sells.append(price)
    return buys, sells`,
          tests: `rows = [(6000.00, 30, 5), (6000.25, 40, 20), (6000.50, 25, 130), (6000.75, 20, 90), (6001.00, 35, 45)]
out = imbalances(rows, 3)
assert out is not None, "the function returns nothing yet"
buys, sells = out
assert buys == [6000.5, 6000.75], f"buying imbalances at 6000.50 and 6000.75, got {buys}"
assert sells == [], f"no bid is 3 times the ask one tick above it in this bar, got {sells}"
rows2 = [(6000.00, 90, 0), (6000.25, 10, 20), (6000.50, 50, 10)]
b2, s2 = imbalances(rows2, 3)
assert s2 == [6000.0], f"90 at the bid at 6000.00 against 20 at the ask at 6000.25 is 4.5 to 1: a selling imbalance, got {s2}"
assert b2 == [], f"20 against 90 and 10 against 10 are not buying imbalances, got {b2}"
assert imbalances([(1.0, 0, 0), (1.25, 0, 0)], 3) == ([], []), "rows with no volume have no imbalances"`,
          why: 'Two comparisons, each looking one row in a different direction. The guard against zero volume stops a price where nothing traded from counting as an imbalance against another empty price.',
        },
        {
          kind: 'design',
          id: 'orderflow-footprint-11',
          ask: 'You want to turn "stacked buying imbalances near support" into a rule you can test. Write the rule and the decisions it needs.',
          why: 'Footprint patterns sound precise but hide many free choices. Fixing each one in advance is what makes the rule testable rather than something you see when you want to.',
          checklist: [
            { point: 'The ratio, the minimum volume and the number of rows that count as a stack', why: 'Each changes how often the pattern appears, so each must be fixed before testing.' },
            { point: 'The bar type and length (for example 1-minute or 2,000-contract bars)', why: 'The same flow cut into different bars gives different footprints.' },
            { point: 'What "near support" means: a zone in ticks around a level marked before the session', why: 'Levels drawn after the fact always look respected.' },
            { point: 'Entry, stop and target in ticks', why: 'A pattern is not a trade until it has an exit for both outcomes.' },
            { point: 'How often the pattern appears without a level, and what follows then', why: 'That base rate tells you whether the level adds anything.' },
            { point: 'A record of every case with costs included', why: 'The test must count the failures and pay the spread and commission.' },
          ],
        },
      ],
    },
    {
      id: 'orderflow-dom',
      title: 'Depth of market and liquidity',
      summary: 'Resting size on the ladder, pulling and stacking, icebergs, why displayed depth misleads, and spoofing.',
      widget: 'orderflow-ladder',
      text: [
        'The **depth of market** (DOM), or ladder, shows the resting size at each price around the quote, updated as orders are added, cancelled and filled. It is the order book from the markets module, shown live. A level changes for three reasons only: new orders join, orders are cancelled, or orders are filled. The tape tells you the fills; the rest you have to infer.',
        '**Pulling** is size disappearing from a level without trading; **stacking** is size being added. Most resting orders are cancelled rather than filled, many within fractions of a second, so a large number on the ladder is an intention that can change, not a commitment. A wall of 500 contracts that vanishes as price approaches told you nothing about real selling.',
        'An **iceberg** order shows only part of its size: when the shown part fills, the next part appears at the same price. CME Globex supports this as a display quantity. You can suspect one when more trades at a price than was ever displayed there: 160 contracts traded at a level that never showed more than 40.',
        { code: `before, after, traded = 120, 40, 80
unexplained = after - before + traded   # 0: fills explain it all
# negative: size was pulled; positive: size was added` },
        'Displayed depth misleads in several ways: icebergs hide size, cancels are faster than you can see, and your platform may group or delay updates. You also join the back of the queue at a price: orders ahead of you fill first (on most futures books, first in, first out). **Spoofing** is placing orders you intend to cancel before they execute, to make others think there is supply or demand. It is illegal in the US under the Dodd-Frank Act of 2010, and has been prosecuted: Michael Coscia was convicted in 2015, Navinder Sarao pleaded guilty in 2016, and JPMorgan paid about $920 million in 2020 to settle spoofing charges.',
        'Use the ladder for practical things: how much size you can trade near the quote, and whether a level is being refilled or pulled as price reaches it. Do not treat big numbers far from the price as a forecast.',
      ],
      rules: [
        'A level changes only through adds, cancels and fills.',
        'Size that vanishes without trading was pulled; resting size is an intention, not a commitment.',
        'More traded at a price than was ever shown suggests an iceberg or refilling.',
        'You join the back of the queue at your price.',
        'Spoofing, orders meant to be cancelled before execution, is illegal in the US.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'orderflow-dom-1',
          ask: 'The ladder never showed more than 40 contracts offered at 6001.00, yet the tape shows 160 contracts traded there and the level still shows 40. At least how many contracts traded there beyond the 40 displayed at the start?',
          answer: 120,
          check: '160 - 40',
          why: '160 − 40 = 120 traded against size that was not on display at the start: an iceberg or a seller refilling the level. And another 40 still rests, so the selling there was at least 200 contracts, never more than 40 visible.',
        },
        {
          kind: 'choice',
          id: 'orderflow-dom-2',
          ask: 'A bid of 500 contracts sits 4 ticks below the price. As price drops to within one tick of it, it disappears, with no trades at that price. What does this tell you?',
          options: [
            'A large buyer bought 500 contracts',
            'The size was pulled: it was never a commitment to buy, and its presence earlier told you little',
            'The exchange removed it as an error',
            'The buyer moved to a better price and will certainly buy',
          ],
          answer: 1,
          why: 'No trades printed, so nothing was bought. Size that disappears as price comes near was cancelled. It may have been a cautious trader, an algorithm managing risk or, if done with intent to deceive, spoofing. You cannot know which from the ladder.',
        },
        {
          kind: 'choice',
          id: 'orderflow-dom-3',
          ask: 'Which statement about spoofing is correct at the time of writing (2026)?',
          options: [
            'It is a legal way of hiding your intentions',
            'It is placing orders with intent to cancel them before execution, to mislead others; illegal in the US since the Dodd-Frank Act of 2010 and prosecuted in cases such as Coscia (2015) and Sarao (2016)',
            'It means using iceberg orders',
            'It is only illegal in stock markets, not futures',
          ],
          answer: 1,
          why: 'Iceberg orders are a legitimate order type that hides size; spoofing is about intent to cancel and mislead. US enforcement has included criminal convictions and, in 2020, about $920 million paid by JPMorgan. Rules differ in other countries, and many major markets ban it too.',
        },
        {
          kind: 'number',
          id: 'orderflow-dom-4',
          ask: 'You place a buy limit for 5 contracts at 6000.00, joining 300 contracts already resting there. Nobody ahead of you cancels. How many contracts must trade at 6000.00 before your whole order is filled?',
          answer: 305,
          check: '300 + 5',
          why: 'First in, first out: the 300 ahead of you fill first, then your 5. If price touches 6000.00 and only 100 trade there before it bounces, you get nothing. A price touching your limit is not a fill.',
        },
        {
          kind: 'output',
          id: 'orderflow-dom-5',
          ask: 'Two snapshots of the ask side a second apart, and the trades in between. What does this print?',
          code: `before = {6001.00: 120, 6001.25: 300}
after = {6001.00: 40, 6001.25: 50}
traded = {6001.00: 80}
for p in before:
    print(p, after[p] - before[p] + traded.get(p, 0))`,
          answer: '6001.0 0\n6001.25 -250',
          why: 'At 6001.00 the fall of 80 is exactly the 80 traded. At 6001.25 the size fell by 250 with no trades: 250 contracts were pulled. The ladder alone shows both as "less size"; only with the tape can you tell fills from cancels.',
        },
        {
          kind: 'bug',
          id: 'orderflow-dom-6',
          ask: 'This should return the change at a level that trades do not explain (negative means pulled, positive means added). A level where 80 traded and size fell by 80 shows −160 instead of 0.',
          code: `def unexplained(before, after, traded):
    out = {}
    for p in before:
        out[p] = after.get(p, 0) - before[p] - traded.get(p, 0)
    return out`,
          line: 4,
          fix: '        out[p] = after.get(p, 0) - before[p] + traded.get(p, 0)',
          why: 'Fills remove size, so they explain part of the fall. Adding them back leaves only the part caused by cancels or new orders. With the wrong sign, every trade looks like pulling.',
        },
        {
          kind: 'choice',
          id: 'orderflow-dom-7',
          ask: 'In the figure, choose Honest and press "market buy 20" ten times, then Reset, choose Pulled and do the same. Where is the last trade in each?',
          options: [
            'Both at 6001.50',
            'Honest at 6001.50, where the 250-lot offer starts to fill; Pulled at 6002.00, because the offer vanished as price approached',
            'Both at 6002.00',
            'Honest at 6002.00 and Pulled at 6001.50',
          ],
          answer: 1,
          why: 'The same 200 contracts of buying stop at the wall when it is real and run two ticks further when it is pulled. Anyone who sold because they saw the wall was misled. The ladder showed the same picture in both cases until the last moment.',
        },
        {
          kind: 'number',
          id: 'orderflow-dom-8',
          ask: 'ES asks: 10 at 6000.25, 15 at 6000.50, 30 at 6000.75. You buy 50 at market. ES is worth $50 per point. How many dollars of slippage is that against the best ask?',
          answer: 812.5,
          check: '(10 * 6000.25 + 15 * 6000.50 + 25 * 6000.75 - 50 * 6000.25) * 50',
          why: 'The fills cost 0.325 points more per contract on average (average 6000.575), and 0.325 × $50 × 50 contracts = $812.50. In futures a few ticks of slippage on size is real money.',
        },
        {
          kind: 'choice',
          id: 'orderflow-dom-9',
          ask: 'Why is it risky to read "500 offered at 6005.00, only 50 bid at 5995.00" as a sign that price will fall?',
          options: [
            'Because the ladder is always wrong',
            'Because displayed size can be cancelled in an instant, icebergs hide real size, and resting orders far from price show intentions that change',
            'Because futures cannot fall',
            'Because only the bid side matters',
          ],
          answer: 1,
          why: 'Displayed depth is a snapshot of orders that are free to leave. Size that is far from the price is especially likely to move or vanish before it is reached.',
        },
        {
          kind: 'write',
          id: 'orderflow-dom-10',
          ask: 'Write `unexplained(before, after, traded)`: for every price in either snapshot, return the change in size not explained by trades, `after − before + traded` (a missing price counts as 0). Return a dict.',
          starter: `def unexplained(before, after, traded):
    # before, after: {price: size}; traded: {price: contracts traded}
    pass`,
          solution: `def unexplained(before, after, traded):
    out = {}
    for p in set(before) | set(after):
        out[p] = after.get(p, 0) - before.get(p, 0) + traded.get(p, 0)
    return out`,
          tests: `out = unexplained({6001.00: 120, 6001.25: 300}, {6001.00: 40, 6001.25: 50}, {6001.00: 80})
assert out is not None, "the function returns nothing yet"
assert out[6001.0] == 0, f"80 fell and 80 traded: nothing unexplained, got {out[6001.0]}"
assert out[6001.25] == -250, f"250 vanished without trading: -250, got {out[6001.25]}"
out = unexplained({6001.00: 40}, {6001.00: 40, 6001.50: 200}, {6001.00: 160})
assert out[6001.0] == 160, f"160 traded and the level still shows 40: 160 was added (refilled), got {out[6001.0]}"
assert out.get(6001.5) == 200, f"a new level of 200 appeared: +200, got {out.get(6001.5)}"`,
          why: 'This is the arithmetic behind reading pulling, stacking and icebergs. A big positive number at a level that keeps trading is refilling; a big negative number with no trades is pulling.',
        },
        {
          kind: 'design',
          id: 'orderflow-dom-11',
          ask: 'Write the rules for how you will use the depth of market in your trading, and how you will avoid being fooled by it.',
          why: 'The ladder is the most hypnotic screen in trading. Limits written in advance keep it to the questions it can answer.',
          checklist: [
            { point: 'Use it to judge how much size you can trade near the quote', why: 'That is what displayed depth can tell you with some reliability.' },
            { point: 'Ignore large size far from the price unless it is still there as price arrives', why: 'Distant size is the most likely to be pulled.' },
            { point: 'Confirm with the tape: did trades happen at the level, and did it refill?', why: 'Only fills are commitments; displayed size is not.' },
            { point: 'Expect to be at the back of the queue with a passive order', why: 'A touch of your price does not mean a fill.' },
            { point: 'Never place orders you mean to cancel to move others', why: 'That is spoofing, which is illegal.' },
            { point: 'Record ladder-based decisions and check them later', why: 'Impressions from a moving screen are easy to misremember.' },
          ],
        },
      ],
    },
    {
      id: 'orderflow-absorption',
      title: 'Absorption and exhaustion',
      summary: 'Heavy aggression that fails to move price, aggression that dries up, trapped traders and climactic volume.',
      text: [
        '**Absorption** is heavy aggression at a price that fails to move it. Sellers hit the bid at 5995.00 again and again, 1,800 contracts in two minutes, and the bid keeps refilling: price stays within a tick or two. Someone with large passive orders, often an iceberg, is taking everything offered. The footprint shows a big negative delta in a narrow range.',
        'A simple measure is volume per price level traded: volume ÷ (range in ticks + 1). A bar with 3,000 contracts over 3 price levels did more work for less progress than a bar with 3,000 contracts over 13 levels. Compare it with typical bars at the same time of day, since volume follows the daily U shape.',
        '**Exhaustion** is the opposite: aggression drying up at the end of a move. Each new push makes a new high on less volume and smaller delta, and the last prints are small. It says the aggressive side is running out of urgency. It does not say who will take over.',
        '**Trapped traders** are those who entered aggressively shortly before the move went against them, for example buyers who lifted offers on a breakout above a high that then fell back below. They are holding losses, and their stops below can add selling. Trapped traders explain why failed breakouts sometimes move fast; they are not a guarantee that it happens.',
        '**Climactic volume** is a bar with far more volume than usual at the end of an extended move. Sometimes it marks a turn, as late traders pile in and the other side absorbs them; sometimes it is the start of a bigger move. All of these patterns are clearest in hindsight. In real time absorption lasts until it does not: the passive buyer can be overrun, and then the same picture is a breakdown.',
      ],
      rules: [
        'Absorption: heavy aggression, little progress, a level that keeps refilling.',
        'Volume per level traded = volume ÷ (range in ticks + 1); compare with similar bars.',
        'Exhaustion: each push makes less progress on less aggression.',
        'Trapped traders entered aggressively shortly before a reversal; their exits can speed it up.',
        'These patterns are clear in hindsight; absorption can fail and become a breakout.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'orderflow-absorption-1',
          ask: 'Bar A traded 3,000 contracts over a range of 2 ticks (3 price levels). Bar B traded 3,000 over 12 ticks (13 levels). How many times more volume per level traded did bar A have than bar B? Round to one decimal place.',
          answer: 4.3,
          tol: 0.05,
          check: '(3000 / 3) / (3000 / 13)',
          why: 'A: 3,000 ÷ 3 = 1,000 per level. B: 3,000 ÷ 13 ≈ 231. A is about 4.3 times as dense: the same volume bought almost no progress, which is what absorption looks like.',
        },
        {
          kind: 'choice',
          id: 'orderflow-absorption-2',
          ask: 'Which of these is the clearest picture of absorption at support?',
          options: [
            'Price falls through support on rising volume and strongly negative delta',
            '1,800 contracts sold at the bid at 5995.00 in two minutes, the bid refilling each time, price holding within a tick',
            'Volume dries up and price drifts sideways',
            'A single print of 500 contracts at the ask',
          ],
          answer: 1,
          why: 'Heavy aggression meeting a level that does not give way is absorption. The first option is the opposite: aggression that works. Quiet drifting is lack of interest, not absorption.',
        },
        {
          kind: 'choice',
          id: 'orderflow-absorption-3',
          ask: 'ES breaks above the morning high at 6010.00 with heavy buying at the ask, then falls back to 6007.50 within three minutes. Who is trapped, and why might it matter?',
          options: [
            'The sellers at 6010.00, because they sold too low',
            'The breakout buyers who lifted offers near 6010.00: they hold losses, and their stops below may add selling',
            'Nobody: losses are not a market force',
            'Market makers, who must buy everything',
          ],
          answer: 1,
          why: 'Aggressive buyers near the high are now under water. If they exit, by choice or by stop, that is extra selling. This can speed a failed breakout down, but it is an explanation of what may happen, not a forecast.',
        },
        {
          kind: 'number',
          id: 'orderflow-absorption-4',
          ask: 'Breakout buyers bought 400 ES contracts averaging 6010.00. Price is now 6007.50, and ES is worth $50 per point. What is their combined open loss in dollars?',
          answer: 50000,
          check: '(6010.00 - 6007.50) * 50 * 400',
          why: '2.5 points × $50 × 400 = $50,000. Losses of that size on a breakout that failed in minutes are why trapped traders react quickly.',
        },
        {
          kind: 'choice',
          id: 'orderflow-absorption-5',
          ask: 'After a long fall, a 5-minute bar trades four times the usual volume for that time of day and closes near its high. What does this climactic volume tell you?',
          options: [
            'The low of the day is in',
            'Many traders were active at that price and the late sellers met buyers; it can mark a turn or be followed by more selling, so it is a place to watch, not a signal',
            'Nothing: volume is never informative',
            'The market will now rise by the same amount it fell',
          ],
          answer: 1,
          why: 'Huge volume at the end of a move shows a fight at that price. Which side wins is decided later. Many famous "climax" bars on charts were followed by another leg in the same direction.',
        },
        {
          kind: 'output',
          id: 'orderflow-absorption-6',
          ask: 'Bars as (high, low, volume), tick 0.25. What does this print?',
          code: `bars = [(6004.00, 6001.00, 2400), (6001.50, 6000.75, 3300), (6005.00, 6002.00, 1800)]
tick = 0.25
per = [round(v / ((h - l) / tick + 1)) for h, l, v in bars]
print(per, per.index(max(per)))`,
          answer: '[185, 825, 138] 1',
          why: 'Levels traded: 13, 4 and 13. Volume per level: 2,400 ÷ 13 ≈ 185, 3,300 ÷ 4 = 825, 1,800 ÷ 13 ≈ 138. The second bar did the most volume in the least space.',
        },
        {
          kind: 'bug',
          id: 'orderflow-absorption-7',
          ask: 'This should return volume per price level traded. For a bar from 6001.00 to 6004.00 with 2,400 contracts it returns about 0.05 instead of about 185.',
          code: `def volume_per_level(high, low, volume, tick):
    levels = (high + low) / tick + 1
    return volume / levels`,
          line: 2,
          fix: '    levels = (high - low) / tick + 1',
          why: 'The range is high minus low. Adding them gives a number near 48,000 levels. The + 1 counts both ends, so a bar that trades at one price has one level, not zero.',
        },
        {
          kind: 'choice',
          id: 'orderflow-absorption-8',
          ask: 'Three pushes to new highs have deltas of +900, +500 and +200, each on less volume than the one before. What is the fairest description?',
          options: [
            'Exhaustion of the buy side: each push needed, and got, less aggression; it may precede a turn or a pause, or the trend may continue on passive buying',
            'A guaranteed reversal',
            'Strong buying, since all deltas are positive',
            'Absorption by buyers',
          ],
          answer: 0,
          why: 'Shrinking aggression at new highs is what exhaustion means. It is a change in behaviour, not a forecast: a trend can grind higher on passive orders with modest delta.',
        },
        {
          kind: 'write',
          id: 'orderflow-absorption-9',
          ask: 'Write a function that flags possible absorption bars: return the indexes of bars whose absolute delta is at least `min_delta` and whose range is at most `max_ticks` ticks. Bars are `(high, low, delta)`.',
          starter: `def absorption_bars(bars, tick, min_delta, max_ticks):
    pass`,
          solution: `def absorption_bars(bars, tick, min_delta, max_ticks):
    out = []
    for i, (high, low, delta) in enumerate(bars):
        ticks = round((high - low) / tick)
        if abs(delta) >= min_delta and ticks <= max_ticks:
            out.append(i)
    return out`,
          tests: `bars = [(5995.50, 5995.00, -1800), (6000.00, 5996.00, -1900), (5996.00, 5995.75, -300), (5997.00, 5996.50, 1200)]
out = absorption_bars(bars, 0.25, 1000, 2)
assert out is not None, "the function returns nothing yet"
assert out == [0, 3], f"bars 0 and 3 have |delta| >= 1000 within 2 ticks; bar 1 moved 16 ticks and bar 2 has small delta: expected [0, 3], got {out}"
assert absorption_bars(bars, 0.25, 2000, 2) == [], "with a higher delta threshold nothing qualifies"`,
          why: 'Both directions count: heavy selling into a bid that holds, and heavy buying into an offer that holds. Rounding the tick count avoids floating point surprises such as 1.9999999 ticks.',
        },
        {
          kind: 'design',
          id: 'orderflow-absorption-10',
          ask: 'You believe that absorption at a support level marked before the open is worth trading long. Write how you would define it, enter, exit and judge whether it works.',
          why: 'Absorption is easy to see in old charts and hard to see in real time. A written definition and a record of every case keep you honest about the times it failed.',
          checklist: [
            { point: 'A numeric definition: minimum delta, maximum range in ticks, minimum time at the level', why: 'Vague definitions turn every bounce into absorption after the fact.' },
            { point: 'Wait for a sign that the aggression stopped working, such as delta turning positive or price reclaiming a tick above', why: 'Absorption continues until it fails; entering in the middle of it is a guess.' },
            { point: 'A stop beyond the absorption low, outside the level zone', why: 'If the passive buyer is overrun the idea is wrong and you must be out.' },
            { point: 'A target before the next level, with the reward to risk worked out', why: 'A reading without an exit plan is not a trade.' },
            { point: 'Every case recorded, including breakdowns through the level', why: 'The failures are where you learn whether the edge is real.' },
            { point: 'Costs and slippage at the level counted in the results', why: 'Several ticks of edge can be eaten by fills in a fast market.' },
          ],
        },
      ],
    },
    {
      id: 'orderflow-data',
      title: 'Where order flow can be read, and its limits',
      summary: 'Index futures, classifying trades without an aggressor flag, the cost of data, and why a big option print does not tell you the bet.',
      text: [
        'Index order flow is read mostly in **futures**: ES (the E-mini S&P 500, $50 times the index, a tick of 0.25 is $12.50) and NQ (the E-mini Nasdaq-100, $20 times the index, $5 a tick). Each trades on one venue, CME Globex, with one central book, and CME publishes the aggressor side with each trade. At the time of writing (2026) they trade almost around the clock from Sunday evening to Friday afternoon, US Eastern time, with a short daily break. Micro contracts (MES at $5 and MNQ at $2 times the index) are a tenth of the size. Check the specifications with CME and your broker.',
        'US stocks and ETFs such as SPY are split across more than a dozen exchanges and many off-exchange venues. Off-exchange trading was about half of all US share volume in 2025. The public tape does not say who was the aggressor, so platforms must guess, and a stock "footprint" is a reconstruction.',
        'The guessing rules are old and simple. The **quote rule**: above the mid is a buy, below is a sell. The **tick rule**: a trade above the last different price is a buy, below is a sell. The **Lee-Ready** method (1991) uses the quote rule and falls back on the tick rule for trades at the mid. Studies on older data found such methods right roughly 80 to 85% of the time; fast quotes and time stamps that do not line up make them worse.',
        { code: `def lee_ready(price, bid, ask, prev_diff_price):
    mid = (bid + ask) / 2
    if price != mid:
        return 1 if price > mid else -1
    return 1 if price > prev_diff_price else -1` },
        'Order flow costs money. Real-time CME depth data for a non-professional costs about $12 a month per exchange, or about $37 for the four CME Group exchanges, at the time of writing (2026), before any platform fee; historical tick data costs more. Trading futures also needs a futures account, and one ES contract controls about $300,000 at an index of 6,000, so a few ticks against you is real money.',
        '"Unusual options activity" alerts report large option trades. A print of 5,000 calls tells you size, not intent: the trade may have been a buyer or a seller, opening or closing, a hedge against shares, or one leg of a spread. Even a print at the ask only tells you who was in a hurry, not why.',
      ],
      rules: [
        'Index order flow is read in ES and NQ: one venue, one book, the aggressor published.',
        'Stock order flow is split across venues, about half off-exchange, and the aggressor is guessed.',
        'Quote rule, tick rule, Lee-Ready: useful guesses, often wrong on a meaningful share of trades.',
        'Data, platforms and futures margin cost money; know the tick value of what you trade.',
        'A large option print shows size, not direction or purpose.',
      ],
      questions: [
        {
          kind: 'choice',
          id: 'orderflow-data-1',
          ask: 'Why do index order flow traders usually watch ES rather than SPY?',
          options: [
            'SPY has no volume',
            'ES trades on one exchange with one central book and the aggressor published with each trade; SPY volume is spread across many venues, much of it off-exchange, with the side guessed',
            'ES always moves first',
            'SPY is not allowed to be day traded',
          ],
          answer: 1,
          why: 'Completeness and the aggressor flag make futures data the cleaner record. It is still a record of one instrument: ES and SPY track the same index but are not the same thing.',
        },
        {
          kind: 'output',
          id: 'orderflow-data-2',
          ask: 'The tick rule on a list of trade prices. What does this print?',
          code: `prices = [100.00, 100.02, 100.02, 100.01, 100.01, 100.03]
signs, last = [], 0
for prev, p in zip(prices, prices[1:]):
    if p != prev:
        last = 1 if p > prev else -1
    signs.append(last)
print(signs)`,
          answer: '[1, 1, -1, -1, 1]',
          why: 'An up-tick is a buy, a down-tick a sell, and a trade at the same price keeps the last sign (a zero-tick). The tick rule never looks at the quote, which is why it is a fallback.',
        },
        {
          kind: 'output',
          id: 'orderflow-data-3',
          ask: 'Lee-Ready on four trades, each (price, bid, ask). What does this print?',
          code: `trades = [(600.02, 600.00, 600.02), (600.01, 600.00, 600.02),
          (600.00, 600.00, 600.02), (600.01, 600.00, 600.02)]
signs, prev = [], None
for price, bid, ask in trades:
    mid = (bid + ask) / 2
    if abs(price - mid) > 1e-9:
        signs.append(1 if price > mid else -1)
    else:
        signs.append(1 if price > prev else -1)
    prev = price
print(signs)`,
          answer: '[1, -1, -1, 1]',
          why: 'Trade 1 is above the mid: buy. Trade 2 is at the mid and below the previous price: sell by the tick rule. Trade 3 is below the mid: sell. Trade 4 is at the mid and above the previous price: buy. (This sketch uses the previous price, not the last different one.)',
        },
        {
          kind: 'bug',
          id: 'orderflow-data-4',
          ask: 'This should apply the tick rule, where a trade at the same price as the one before keeps the previous sign. Instead every zero-tick is called a sell.',
          code: `def tick_rule(prices):
    signs, last = [], 0
    for prev, p in zip(prices, prices[1:]):
        if p != prev:
            last = 1 if p > prev else -1
        signs.append(1 if p > prev else -1)
    return signs`,
          line: 6,
          fix: '        signs.append(last)',
          why: 'The line recomputes the sign from the two prices, so an unchanged price gives −1. The variable `last` exists to carry the sign through zero-ticks. Bugs like this bias reconstructed delta in one direction.',
        },
        {
          kind: 'number',
          id: 'orderflow-data-5',
          ask: 'ES is $50 times the index. With the index future at 6,000, roughly how many dollars of index does one ES contract control?',
          answer: 300000,
          check: '6000 * 50',
          why: '6,000 × $50 = $300,000. The margin needed is much smaller, which is leverage: a 1% move is $3,000 per contract.',
        },
        {
          kind: 'number',
          id: 'orderflow-data-6',
          ask: 'You are long 2 ES contracts ($12.50 per tick) and price moves 8 ticks against you. What is the loss in dollars?',
          answer: 200,
          check: '8 * 12.50 * 2',
          why: '8 ticks × $12.50 × 2 = $200. Two points on ES with two contracts is a meaningful loss for a small account.',
        },
        {
          kind: 'number',
          id: 'orderflow-data-7',
          ask: 'MES (Micro E-mini S&P 500) is a tenth of ES: $1.25 per tick. What is the loss on 3 MES contracts after a move of 4 ticks against you?',
          answer: 15,
          check: '4 * 1.25 * 3',
          why: '4 × $1.25 × 3 = $15. Micros let you size futures trades to a small account, which matters more than any order flow reading.',
        },
        {
          kind: 'choice',
          id: 'orderflow-data-8',
          ask: 'An alert says "10,000 SPY calls bought at the ask, expiring Friday". What can you actually conclude?',
          options: [
            'A large trader expects SPY to rise by Friday',
            'Someone traded 10,000 calls and was in a hurry; it may have been closing a short, hedging a short stock position or one leg of a spread, so the direction of the bet is unknown',
            'Smart money is certainly bullish',
            'The calls will finish in the money',
          ],
          answer: 1,
          why: 'The print shows size and which side crossed the spread. It does not show whether the trade opened or closed a position, what else the trader holds, or why. Treating it as a directional tip is the error alerts invite.',
        },
        {
          kind: 'choice',
          id: 'orderflow-data-9',
          ask: 'Your platform shows a "cumulative delta" for a large US stock. Why is it less reliable than ES delta?',
          options: [
            'Stocks have no aggressive traders',
            'About half of US share volume trades off-exchange, and the aggressor is not reported, so delta is built from guesses on reports that may not line up with the quote',
            'Stock delta is always zero',
            'Exchanges hide stock trades',
          ],
          answer: 1,
          why: 'Off-exchange prints often fall inside the spread, and the classification rules are wrong on a meaningful share of trades. The resulting delta is an estimate, and different platforms build it differently.',
        },
        {
          kind: 'write',
          id: 'orderflow-data-10',
          ask: 'Write `lee_ready(trades)`: trades are `(price, bid, ask)`. Above the mid is +1, below is −1. At the mid use the tick rule against the last different trade price; if there is none yet, use 0.',
          starter: `def lee_ready(trades):
    signs = []
    return signs`,
          solution: `def lee_ready(trades):
    signs = []
    last_price, last_sign = None, 0
    for price, bid, ask in trades:
        mid = (bid + ask) / 2
        if last_price is not None and price != last_price:
            last_sign = 1 if price > last_price else -1
        if abs(price - mid) > 1e-9:
            signs.append(1 if price > mid else -1)
        else:
            signs.append(last_sign)
        last_price = price
    return signs`,
          tests: `t = [(600.01, 600.00, 600.02), (600.02, 600.00, 600.02), (600.01, 600.00, 600.02), (600.01, 600.00, 600.02), (600.00, 600.00, 600.02)]
out = lee_ready(t)
assert out is not None, "the function returns nothing yet"
assert len(out) == 5, f"one sign per trade, got {len(out)}"
assert out[0] == 0, f"the first trade is at the mid with no earlier price: 0, got {out[0]}"
assert out[1] == 1, f"600.02 is above the mid: +1, got {out[1]}"
assert out[2] == -1, f"600.01 at the mid, down from 600.02: -1, got {out[2]}"
assert out[3] == -1, f"600.01 again: a zero-tick keeps the last sign, -1, got {out[3]}"
assert out[4] == -1, f"600.00 is below the mid: -1, got {out[4]}"`,
          why: 'The quote decides where it can; the tick rule fills the gap at the mid, carrying the last sign through repeated prices. Every platform that shows stock delta does something like this, with the same weaknesses.',
        },
        {
          kind: 'number',
          id: 'orderflow-data-11',
          ask: 'Depth data and an order flow platform together cost you $62 a month. How many ticks of MES ($1.25 a tick) net profit per month do you need to pay for them? Give one decimal place.',
          answer: 49.6,
          tol: 0.05,
          check: '62 / 1.25',
          why: '62 ÷ 1.25 = 49.6 ticks a month, after commissions and slippage, before you have made anything. Tools are a fixed cost the edge must cover.',
        },
        {
          kind: 'design',
          id: 'orderflow-data-12',
          ask: 'You are deciding whether to pay for order flow data and a footprint platform. Write how you will decide.',
          why: 'Order flow tools are sold with the promise of an edge. Treating them as a cost to justify, like any other, protects you from paying for a feeling of insight.',
          checklist: [
            { point: 'What you will trade: futures (which need a futures account) or options on SPY, and how ES flow would inform that', why: 'Reading ES flow and trading SPY options are different instruments with different costs.' },
            { point: 'The monthly cost of data and platform, written next to your expected profit per month', why: 'Fixed costs hurt small accounts most.' },
            { point: 'A free or trial period used to record readings before paying for a year', why: 'You can test whether you use it consistently before committing.' },
            { point: 'Whether the product shows the true aggressor or reconstructs it', why: 'Futures data is reported; stock delta is guessed.' },
            { point: 'Scepticism toward vendors who sell signals or claim high win rates', why: 'Order flow has no published, reliable evidence of a standalone retail edge.' },
            { point: 'A date to review whether it changed your results', why: 'A tool that does not change decisions is only a cost.' },
          ],
        },
      ],
    },
    {
      id: 'orderflow-levels',
      title: 'Order flow at a level',
      summary: 'Using order flow to confirm or reject a trade at support, resistance or VWAP, written as rules, and how it fails.',
      text: [
        "Order flow is most useful as a second look at a place you already care about. Mark the levels before the session: yesterday's high and low, the overnight range, VWAP, round numbers (the charts module covers these). Then ask one narrow question when price reaches a level: is the aggression against the level working or failing?",
        'A long rule at support might read: price trades into the support zone; sellers are aggressive there (bar delta at most −500) but price holds within 2 ticks of the zone low; then the next bar has positive delta and closes back above the zone. Enter on that close, stop 2 ticks beyond the absorption low, target the next level or VWAP. If price instead breaks the zone with stacked selling imbalances, there is no long trade.',
        { code: `def long_ok(delta_at_level, ticks_beyond, next_delta, reclaimed):
    return delta_at_level <= -500 and ticks_beyond <= 2 and next_delta > 0 and reclaimed` },
        'Every number in that rule is a choice, and each one must be tested: count every time the conditions were met, the result in ticks after costs, and compare with taking the same level without the order flow condition. If the filter does not improve the results across enough trades, it is decoration.',
        'It fails in known ways. The passive buyer is overrun and absorption becomes a breakdown. Readings are ambiguous in real time and clear afterwards, so screenshots of winners teach false confidence. Fast algorithms see the same book sooner. And if you read ES but trade SPY options, the option moves by its delta times the SPY move, minus the spread: a 4-point ES move is about $0.40 in SPY, about $0.20 on a 0.50-delta option.',
        'There is no reliable public evidence that reading footprints gives retail traders an edge on its own. Use it to avoid bad entries at levels, size small (micro futures or one option), and keep a record.',
      ],
      rules: [
        'Mark levels first; use order flow to ask whether aggression against the level is working.',
        'Write the confirmation as numbers: delta threshold, ticks allowed beyond the level, what counts as a reclaim.',
        'A break through the level with stacked imbalances against you cancels the trade.',
        'Test the filter against the same level without it, after costs.',
        'Readings look clear in hindsight; record every case, not the screenshots of winners.',
      ],
      questions: [
        {
          kind: 'choice',
          id: 'orderflow-levels-1',
          ask: 'Your long rule at support: delta at most −500 at the level, price no more than 2 ticks below the zone, then a bar with positive delta that closes back above the zone. At support: delta −900, price 1 tick below the zone, next bar delta +250 and closes above. What does the rule say?',
          options: ['Enter long on that close', 'No trade: delta was too negative', 'Short, because delta was negative', 'Wait for three more bars'],
          answer: 0,
          why: 'Every condition is met: heavy selling (−900 ≤ −500) that did not push price more than 2 ticks through, then buying that reclaimed the zone. The rule exists so the answer does not depend on how you feel at the time.',
        },
        {
          kind: 'choice',
          id: 'orderflow-levels-2',
          ask: 'With the same rule, price reaches support and falls 6 ticks through the zone with stacked selling imbalances and delta of −1,400. What does the rule say?',
          options: [
            'Buy, since the selling must be exhausted',
            'No long trade: aggression against the level is working, which is exactly the case the rule rejects',
            'Double the position',
            'Move the support level lower and buy there',
          ],
          answer: 1,
          why: 'The order flow condition is a filter: it is meant to keep you out when the level is being broken. Redrawing the level after the fact defeats it.',
        },
        {
          kind: 'number',
          id: 'orderflow-levels-3',
          ask: 'Entry 5995.50, stop 5993.00, target 6000.50. What is the reward-to-risk ratio?',
          answer: 2,
          check: '(6000.50 - 5995.50) / (5995.50 - 5993.00)',
          why: 'Reward 5.00 points, risk 2.50 points: 2 to 1. Work it out before the trade, from levels you can name.',
        },
        {
          kind: 'number',
          id: 'orderflow-levels-4',
          ask: 'You take that trade with 2 ES contracts ($50 per point). How many dollars do you lose if the stop fills exactly at 5993.00?',
          answer: 250,
          check: '(5995.50 - 5993.00) * 50 * 2',
          why: '2.5 points × $50 × 2 = $250, before slippage and commission. In a fast break the stop can fill worse.',
        },
        {
          kind: 'number',
          id: 'orderflow-levels-5',
          ask: 'You want to risk $250 on the same 2.5-point stop using MES ($5 per point). How many MES contracts is that?',
          answer: 20,
          check: '250 / (2.5 * 5)',
          why: '2.5 × $5 = $12.50 risk per MES, and 250 ÷ 12.50 = 20. Micros let you choose a risk that fits your account instead of the contract choosing it for you.',
        },
        {
          kind: 'output',
          id: 'orderflow-levels-6',
          ask: 'A long rule written in code. What does this print?',
          code: `def go(delta_at_level, ticks_beyond, next_delta):
    return delta_at_level <= -500 and ticks_beyond <= 2 and next_delta > 0

print(go(-800, 1, 150), go(-800, 5, 150), go(-200, 1, 150))`,
          answer: 'True False False',
          why: 'The first meets every condition. The second let price go 5 ticks through the level. The third had too little selling to call absorption. Writing the rule as code makes each condition checkable.',
        },
        {
          kind: 'bug',
          id: 'orderflow-levels-7',
          ask: 'This long rule should require the next bar to show buying (positive delta). It takes trades where sellers are still in control.',
          code: `def long_ok(delta_at_level, ticks_beyond, next_delta):
    heavy_selling = delta_at_level <= -500
    held = ticks_beyond <= 2
    turned = next_delta < 0
    return heavy_selling and held and turned`,
          line: 4,
          fix: '    turned = next_delta > 0',
          why: 'The confirmation is that aggression flipped to the buy side. With the sign reversed the rule buys while selling continues, the case it was written to avoid.',
        },
        {
          kind: 'number',
          id: 'orderflow-levels-8',
          ask: 'Your level trade wins 10 ticks on average and loses 6 ticks on average, and costs 1 tick per round trip. What win rate do you need to break even? Give a percentage, for example 40%.',
          answer: 0.4375,
          tol: 0.002,
          check: '(6 + 1) / (10 + 6)',
          why: 'A win nets 9 and a loss costs 7: p × 9 = (1 − p) × 7 gives p = 7 ÷ 16 = 43.75%. The same formula as in the markets module, in ticks.',
        },
        {
          kind: 'choice',
          id: 'orderflow-levels-9',
          ask: 'You collect screenshots of your best absorption trades and they look convincing. What is the problem with learning from them?',
          options: [
            'Screenshots are too small',
            'They show only the cases that worked; the same picture also came before losses, and only a record of every case shows how often it works',
            'Absorption cannot be photographed',
            'There is no problem',
          ],
          answer: 1,
          why: 'Selecting winners after the fact builds confidence in patterns that may have no edge. A complete log, losses included, is the only fair sample.',
        },
        {
          kind: 'choice',
          id: 'orderflow-levels-10',
          ask: 'You read ES order flow but trade SPY options. ES rises 4 points after your signal. Roughly what happens to a 0.50-delta SPY call?',
          options: [
            'It gains about $2.00, the same as ES in points',
            'SPY moves about $0.40 (a tenth), so the call gains about $0.20, $20 per contract, before the spread',
            'It gains $200, the ES dollar value of 4 points',
            'Nothing: options do not follow futures',
          ],
          answer: 1,
          why: 'SPY is about a tenth of the S&P 500 and ES tracks the index closely, so 4 points is about $0.40 in SPY. Delta 0.50 turns that into about $0.20 per share, $20 per contract. If the spread is $0.05 you give back a quarter of it on the round trip.',
        },
        {
          kind: 'design',
          id: 'orderflow-levels-11',
          ask: 'Write a complete short rule for using order flow at VWAP from below (price rallies up to VWAP), and say how it fails.',
          why: 'Writing the rule in full forces every vague idea ("buyers look weak") into a number you can test and a loss you have planned for.',
          checklist: [
            { point: 'Context: price below VWAP, the level and its zone width defined in ticks', why: 'The rule must say where it applies before it says what to look for.' },
            { point: 'The order flow condition in numbers, for example buy delta at VWAP of at least +500 with price held within 2 ticks above it', why: 'Absorption of buyers is the mirror of the long case.' },
            { point: 'A trigger, such as the next bar with negative delta closing back below the zone', why: 'You enter when aggression has turned, not while it is still working.' },
            { point: 'Stop beyond the absorption high, target the next level, R worked out', why: 'Exits for both outcomes are part of the rule.' },
            { point: 'The cancel condition: price accepted above VWAP with stacked buying imbalances', why: 'The filter must say when to stay out.' },
            { point: 'How it fails: the passive seller is overrun, readings are ambiguous, costs eat a small edge', why: 'Naming the failures in advance makes them easier to accept and to measure.' },
            { point: 'Size: a fixed risk per trade in micros or one option', why: 'An untested rule deserves the smallest size.' },
          ],
        },
      ],
    },
    {
      id: 'orderflow-lab',
      title: 'Lab: an order flow toolkit in Python',
      summary: 'From a list of trades with the quote: classify the aggressor, build bar delta and cumulative delta, a footprint, and find imbalances and stacks.',
      text: [
        'This lab builds the tools behind every order flow chart, in plain Python. Seeing the arithmetic is the best defence against treating the charts as magic: every number on a footprint is a sum of classified trades, and every imbalance is a ratio over a threshold someone chose.',
        'The input is a list of trades with the quote at the time of each trade. You will classify each trade (quote rule, with the tick rule at the mid), group trades into time bars with volume and delta, add up cumulative delta, build a footprint of bid and ask volume by price, and find diagonal imbalances and stacks of them.',
        'Prices in the examples are ES-style, with a tick of 0.25. Each step repeats what it needs from the steps before, so every step runs on its own.',
      ],
      rules: [
        'Classify with the quote first and the tick rule at the mid; keep unknowns separate.',
        'Delta = ask volume − bid volume; cumulative delta is a running sum from a chosen start.',
        'A footprint is volume at each price split by aggressor side.',
        'Imbalances compare diagonally, against a ratio and a minimum volume you choose.',
        'Every threshold is a parameter to test, not a fact.',
      ],
      questions: [
        {
          kind: 'write',
          id: 'orderflow-lab-1',
          ask: 'Step 1: write `side(price, bid, ask)`. Return 1 for a trade at or above the ask, −1 at or below the bid, and 0 in between.',
          starter: `def side(price, bid, ask):
    pass`,
          solution: `def side(price, bid, ask):
    if price >= ask:
        return 1
    if price <= bid:
        return -1
    return 0`,
          tests: `out = side(6000.25, 6000.00, 6000.25)
assert out is not None, "the function returns nothing yet"
assert out == 1, f"a trade at the ask is a buy aggressor: 1, got {out}"
assert side(6000.00, 6000.00, 6000.25) == -1, "a trade at the bid is a sell aggressor: -1"
assert side(600.01, 600.00, 600.02) == 0, "a trade inside the spread is unknown: 0"
assert side(6000.50, 6000.00, 6000.25) == 1, "a trade above the ask (the quote moved) still counts as a buy"`,
          why: 'The quote rule in its plainest form. Returning 0 for trades inside the spread keeps the uncertainty visible instead of hiding it in a guess.',
        },
        {
          kind: 'write',
          id: 'orderflow-lab-2',
          ask: 'Step 2: write `classify(trades)`. Trades are `(price, size, bid, ask)`. Use the quote rule: above the mid is 1, below is −1. At the mid, use the tick rule against the last different price (1 if higher, −1 if lower, and keep the last tick sign on a repeated price); 0 if there is no earlier price. Return the list of signs.',
          starter: `def classify(trades):
    signs = []
    return signs`,
          solution: `def classify(trades):
    signs = []
    last_price, tick_sign = None, 0
    for price, size, bid, ask in trades:
        if last_price is not None and price != last_price:
            tick_sign = 1 if price > last_price else -1
        mid = (bid + ask) / 2
        if abs(price - mid) > 1e-9:
            signs.append(1 if price > mid else -1)
        else:
            signs.append(tick_sign)
        last_price = price
    return signs`,
          tests: `t = [(600.01, 100, 600.00, 600.02), (600.02, 200, 600.00, 600.02), (600.01, 50, 600.00, 600.02),
     (600.01, 70, 600.00, 600.02), (600.00, 300, 600.00, 600.02), (600.01, 40, 600.00, 600.02)]
out = classify(t)
assert out is not None, "the function returns nothing yet"
assert out == [0, 1, -1, -1, -1, 1], f"expected [0, 1, -1, -1, -1, 1], got {out}"
assert classify([(6000.25, 5, 6000.00, 6000.25)]) == [1], "a trade at the ask is a buy even with no history"`,
          why: 'This is the Lee-Ready idea. The tick sign is updated on every trade, whatever the quote rule says, so it is ready the moment a trade lands on the mid.',
        },
        {
          kind: 'write',
          id: 'orderflow-lab-3',
          ask: 'Step 3: write `bar_deltas(trades, seconds)`. Trades are `(time_in_seconds, price, size, sign)` in time order. Group them into bars starting at `time // seconds * seconds` and return a list of `(bar_start, volume, delta)` for bars that have trades, in time order. Delta adds `size × sign`.',
          starter: `def bar_deltas(trades, seconds):
    pass`,
          solution: `def bar_deltas(trades, seconds):
    bars = {}
    for t, price, size, sign in trades:
        start = t // seconds * seconds
        vol, delta = bars.get(start, (0, 0))
        bars[start] = (vol + size, delta + size * sign)
    return [(s, v, d) for s, (v, d) in sorted(bars.items())]`,
          tests: `trades = [(5, 6000.25, 10, 1), (30, 6000.00, 4, -1), (61, 6000.25, 7, 1), (95, 6000.50, 3, 0), (130, 6000.25, 20, -1)]
out = bar_deltas(trades, 60)
assert out is not None, "the function returns nothing yet"
assert out == [(0, 14, 6), (60, 10, 7), (120, 20, -20)], f"expected [(0, 14, 6), (60, 10, 7), (120, 20, -20)], got {out}"
assert bar_deltas([], 60) == [], "no trades, no bars"`,
          why: 'Unclassified trades (sign 0) count in volume but not in delta, which is why delta as a share of volume can never reach 100% when some trades are unknown.',
        },
        {
          kind: 'output',
          id: 'orderflow-lab-4',
          ask: 'Step 4: cumulative delta from the bars of step 3. What does this print?',
          code: `from itertools import accumulate
bars = [(0, 14, 6), (60, 10, 7), (120, 20, -20), (180, 9, 5)]
cvd = list(accumulate(d for _, _, d in bars))
share = [round(d / v, 2) for _, v, d in bars]
print(cvd, share)`,
          answer: '[6, 13, -7, -2] [0.43, 0.7, -1.0, 0.56]',
          why: 'The running sum is 6, 13, −7, −2. Delta as a share of volume shows the third bar was all selling (−1.0) and the second mostly buying, even though some of its volume was unclassified.',
        },
        {
          kind: 'write',
          id: 'orderflow-lab-5',
          ask: 'Step 5: write `footprint(trades, tick)`. Trades are `(price, size, sign)`. Return a dict `{price: [bid_volume, ask_volume]}`: sign −1 adds to bid volume, sign 1 to ask volume, sign 0 is skipped. Round each price to the tick grid: `round(round(price / tick) * tick, 2)`.',
          starter: `def footprint(trades, tick):
    fp = {}
    return fp`,
          solution: `def footprint(trades, tick):
    fp = {}
    for price, size, sign in trades:
        if sign == 0:
            continue
        key = round(round(price / tick) * tick, 2)
        row = fp.setdefault(key, [0, 0])
        row[0 if sign < 0 else 1] += size
    return fp`,
          tests: `trades = [(6000.25, 10, 1), (6000.00, 4, -1), (6000.25, 7, -1), (6000.50, 3, 0), (6000.2500001, 5, 1)]
out = footprint(trades, 0.25)
assert out is not None, "the function returns nothing yet"
assert out.get(6000.25) == [7, 15], f"6000.25 has 7 at the bid and 10 + 5 at the ask, got {out.get(6000.25)}"
assert out.get(6000.0) == [4, 0], f"6000.00 has 4 at the bid, got {out.get(6000.0)}"
assert 6000.5 not in out, "an unclassified trade is skipped"`,
          why: 'Rounding to the tick grid makes prices that differ by floating point dust land in the same row. The footprint is this dictionary, drawn as a column of numbers.',
        },
        {
          kind: 'write',
          id: 'orderflow-lab-6',
          ask: 'Step 6: write `imbalances(fp, tick, ratio, min_vol)`. A buy imbalance at price p: ask[p] ≥ min_vol and ask[p] ≥ ratio × bid[p − tick]. A sell imbalance at p: bid[p] ≥ min_vol and bid[p] ≥ ratio × ask[p + tick]. A missing neighbour counts as 0. Return `(buys, sells)` as sorted lists. Look neighbours up with `round(p ± tick, 2)`.',
          starter: `def imbalances(fp, tick, ratio, min_vol):
    buys, sells = [], []
    return buys, sells`,
          solution: `def imbalances(fp, tick, ratio, min_vol):
    buys, sells = [], []
    for p, (bid, ask) in fp.items():
        below = fp.get(round(p - tick, 2), [0, 0])[0]
        above = fp.get(round(p + tick, 2), [0, 0])[1]
        if ask >= min_vol and ask >= ratio * below:
            buys.append(p)
        if bid >= min_vol and bid >= ratio * above:
            sells.append(p)
    return sorted(buys), sorted(sells)`,
          tests: `fp = {6000.0: [35, 0], 6000.25: [60, 22], 6000.5: [48, 41], 6000.75: [30, 95], 6001.0: [25, 160],
      6001.25: [40, 130], 6001.5: [52, 120], 6001.75: [70, 66], 6002.0: [44, 38], 6002.25: [18, 11]}
out = imbalances(fp, 0.25, 3, 20)
assert out is not None, "the function returns nothing yet"
buys, sells = out
assert buys == [6001.0, 6001.25, 6001.5], f"buying imbalances at 6001.00, 6001.25 and 6001.50, got {buys}"
assert sells == [6002.0], f"44 at the bid at 6002.00 against 11 at the ask above is 4 to 1: [6002.0], got {sells}"
b2, s2 = imbalances(fp, 0.25, 3, 150)
assert b2 == [6001.0] and s2 == [], f"with a minimum of 150 only 6001.00 (160) qualifies, got {b2} and {s2}"`,
          why: 'The minimum volume stops a thin price with 3 contracts against 1 from counting as an imbalance. Change the ratio or the minimum and the list changes: that is the setting the chart hides from you.',
        },
        {
          kind: 'write',
          id: 'orderflow-lab-7',
          ask: 'Step 7: write `stacks(prices, tick, n)`. From a sorted list of imbalance prices, return the runs of at least `n` consecutive prices (one tick apart) as `(low, high)` tuples.',
          starter: `def stacks(prices, tick, n):
    pass`,
          solution: `def stacks(prices, tick, n):
    out = []
    run = []
    for p in prices:
        if run and abs(p - run[-1] - tick) < 1e-9:
            run.append(p)
        else:
            if len(run) >= n:
                out.append((run[0], run[-1]))
            run = [p]
    if len(run) >= n:
        out.append((run[0], run[-1]))
    return out`,
          tests: `out = stacks([6001.0, 6001.25, 6001.5], 0.25, 3)
assert out is not None, "the function returns nothing yet"
assert out == [(6001.0, 6001.5)], f"three consecutive prices are one stack, got {out}"
assert stacks([6000.0, 6000.25, 6001.0, 6001.25, 6001.5, 6001.75], 0.25, 3) == [(6001.0, 6001.75)], "only the run of four counts; the run of two is too short"
assert stacks([6001.0, 6001.5, 6002.0], 0.25, 3) == [], "prices two ticks apart are not consecutive"
assert stacks([], 0.25, 3) == [], "no prices, no stacks"`,
          why: 'Remember to close the last run after the loop: forgetting it misses a stack at the top of the bar, which is where buying stacks usually are.',
        },
        {
          kind: 'bug',
          id: 'orderflow-lab-8',
          ask: 'Step 8: this footprint puts buy aggression in the bid column and sell aggression in the ask column, so every imbalance comes out on the wrong side.',
          code: `def footprint(trades, tick):
    fp = {}
    for price, size, sign in trades:
        if sign == 0:
            continue
        key = round(round(price / tick) * tick, 2)
        row = fp.setdefault(key, [0, 0])
        row[0 if sign > 0 else 1] += size
    return fp`,
          line: 8,
          fix: '        row[0 if sign < 0 else 1] += size',
          why: 'Rows are [bid, ask]: sells (−1) go to index 0 and buys (+1) to index 1. A swapped column turns every buying stack into a selling one, and a strategy built on it would trade the wrong way.',
        },
        {
          kind: 'design',
          id: 'orderflow-lab-9',
          ask: 'Step 9: your toolkit works on a list of trades. List what you would add or check before using it to test a trading rule on real data.',
          why: 'A toolkit that is right on toy data can still mislead on real data. Knowing its gaps tells you how far to trust any result built on it.',
          checklist: [
            { point: 'Use the exchange aggressor flag where it exists (futures) and compare it with your classification', why: 'It measures how wrong the guessing rules are on your data.' },
            { point: 'Line up trades with the quote in force at the time, not a later one', why: 'Misaligned time stamps are a main source of wrong classifications.' },
            { point: 'A clear session start for cumulative delta', why: 'The level of CVD depends on it.' },
            { point: 'Bars by volume or by time, chosen and fixed', why: 'Footprints and imbalances change with the bar type.' },
            { point: 'Ratio, minimum volume and stack length as parameters, tested on data not used to choose them', why: 'Tuning thresholds on the same data you test on overfits.' },
            { point: 'Costs, slippage and contract tick values in any P&L', why: 'A rule must make money after costs in ticks and dollars.' },
            { point: 'Handling of trades with no aggressor, such as opening auctions', why: 'They are real volume with no side.' },
          ],
        },
      ],
    },
  ],
}
