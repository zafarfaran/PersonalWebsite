import type { Block } from '../../types'

/** The full theory for each lesson of the order flow module, keyed by lesson id. */
export const orderflowTheory: Record<string, Block[]> = {
  'orderflow-tape': [
    { h: 'Two sides to every trade' },
    'A chart shows where price went. **Order flow** is the study of the trades that took it there: who traded, at what price, how much, and which side was in a hurry. It uses the same order book you met in the markets module. As a reminder: buyers and sellers leave **limit orders** resting in the book at prices they choose, and a **market order** trades at once against those resting orders, best price first.',
    'Every trade joins one buyer and one seller for the same quantity. If 10 contracts trade, 10 were bought and 10 were sold. So a phrase like "more buyers than sellers" can never describe the contracts that changed hands. Something else is different between the two sides, and that difference is what order flow measures.',
    { sub: 'The aggressor and the passive side' },
    'One side of each trade was already waiting in the book. That is the **passive** side. The other side arrived and traded immediately, with a market order or a **marketable limit** (a limit priced at or through the opposite side of the quote). That side is the **aggressor**. The aggressor accepted the other side\'s price because it wanted to trade now. Order flow counts aggression.',

    { h: 'The tape' },
    'The **tape**, also called **time and sales**, is the list of trades in the order they happened: the time, the price and the size of each one. The name comes from the paper ticker tape of the past. Platforms often colour each print green or red by its aggressor.',
    { sub: 'Reading the side from the quote' },
    'Compare each trade with the quote at that moment. A trade at the ask means a buyer took the offer: a **buy aggressor**. A trade at the bid means a seller hit the bid: a **sell aggressor**. A trade above the ask also counts as a buy, because the quote moved up as the order walked. Futures exchanges such as CME publish the aggressor side with each trade, so in futures you do not have to guess.',
    {
      code: `bid, ask = 21000.00, 21000.25
tape = [(21000.25, 4), (21000.00, 9), (21000.25, 6), (21000.50, 2)]
buys = sum(size for price, size in tape if price >= ask)
sells = sum(size for price, size in tape if price <= bid)
print(buys, sells)`,
      out: '12 9',
    },
    'Count size, not the number of prints. Three small prints at the ask can be outweighed by one large print at the bid.',

    { h: 'How price moves' },
    'Price moves when the resting size at the best level is used up or withdrawn. Suppose an NQ (Nasdaq-100 future) book offers 8 contracts at 21000.25 and 14 at 21000.50, and a market buy for 20 arrives. It takes all 8 at 21000.25, then 12 at 21000.50. The tape shows two prints from one order, and the best ask is now 21000.50 with 2 left. The average fill is (8 × 21000.25 + 12 × 21000.50) ÷ 20 = 21000.40.',
    { sub: 'Ticks and what they are worth' },
    'A **tick** is the smallest step a price can move. ES, the E-mini S&P 500 future, moves in ticks of 0.25 index points, and each tick is worth $12.50 per contract, so one full point is $50. A futures profit or loss is ticks moved × tick value × contracts. A gain of 1.50 points on 1 ES is 6 ticks × $12.50 = $75.',
    { sub: 'Depth decides the distance' },
    'The same aggressive buying moves a thin book further than a thick one. With 5 contracts resting at each level, 50 contracts of net buying can lift price ten levels; with 100 at each level, it may not move price at all. A level only goes away when its size is filled or cancelled, and new sellers can join it at any time. That is why aggression tells you who was pushing, not how far price will go.',

    { h: 'Print size is not order size' },
    'One large order that walks several levels shows as several prints. Exchanges can also report many small orders matched at once as one trade. Some prints fall between the bid and ask: hidden orders, orders pegged to the midpoint and, in US stocks, trades done away from the exchanges and reported to the public tape afterwards. The quote cannot tell you who was the aggressor for those, so an honest count keeps them as unknown.',

    { h: 'What the tape can and cannot tell you' },
    'The tape is a precise record of what has happened. A burst of prints at the ask says buyers are paying up right now. It does not say whether the move will continue, because a patient seller with large resting orders can absorb all of it. Treat the tape as evidence about the present that you weigh with other evidence, and keep notes so that you can later check what your readings were worth.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Saying there were more buyers than sellers, when volumes are always equal.',
        'Counting prints instead of contracts.',
        'Calling a midpoint print a buy or a sell when it cannot be known.',
        'Expecting heavy buying to move a thick book as far as a thin one.',
        'Forgetting the dollar value of a tick before trading a futures contract.',
      ],
    },
  ],

  'orderflow-delta': [
    { h: 'Measuring aggression in a bar' },
    'Watching every print is slow. Traders summarise the tape bar by bar with one number. A **bar** here is a period such as five minutes, the same bars you met in the charts module.',
    { sub: 'Bar delta' },
    'A bar\'s **delta** is the volume traded at the ask minus the volume traded at the bid: buy aggression minus sell aggression. A bar with 2,100 contracts at the ask and 1,700 at the bid has a delta of +400. A positive delta means buyers were the more aggressive side in that bar. It does not mean more was bought than sold, because every contract bought was sold.',
    { sub: 'Delta as a share of volume' },
    'Delta grows with volume, so a delta of +400 means more in a bar of 1,000 contracts than in a bar of 20,000. Dividing by the bar volume puts bars on the same footing: 400 ÷ 3,800 ≈ 10.5%. If you know the volume V and the delta Δ of a bar where every trade was classified, you can recover both sides: ask volume = (V + Δ) ÷ 2 and bid volume = (V − Δ) ÷ 2. For V = 5,000 and Δ = +600, that is 2,800 at the ask and 2,200 at the bid.',

    { h: 'Cumulative delta' },
    '**Cumulative delta**, also called cumulative volume delta or CVD, adds bar deltas one after another from a starting point. It shows whether buyers or sellers have been the more aggressive side over a longer stretch.',
    {
      code: `from itertools import accumulate
deltas = [300, -500, 200, 100]
print(list(accumulate(deltas)))`,
      out: '[300, -200, 0, 100]',
    },
    '`accumulate` returns the running total after each bar. When CVD drops below zero, it means only that sellers have been slightly more aggressive since counting began.',
    { sub: 'Only the changes mean something' },
    'Starting the count later subtracts the same number from every later value, so the shape of the line is unchanged and only its level moves. Platforms usually restart CVD each session, but futures trade almost all day, and one platform may start at the overnight open (18:00 Eastern time) while another starts at the 9:30 cash open. Two screens can then show very different CVD for the same contract at the same moment. Compare changes, not levels.',

    { h: 'Delta and price usually agree' },
    'Aggressive buying takes offers, so bars that rise usually have positive delta, and bars that fall usually have negative delta. This is close to how prices work rather than a discovery. Research on order books, for example by Cont, Kukanov and Stoikov (2014), finds that the imbalance of order flow explains much of the price change over the same short interval. Explaining the same interval is description. Predicting the next one is much harder.',

    { h: 'When they disagree' },
    { sub: 'Rising on negative delta' },
    'A bar can close higher with negative delta. Sellers hit the bids, but buyers kept raising their limit bids and sellers pulled their offers higher, so the trades that did happen printed at rising prices. Passive orders that move are invisible to delta, yet they move price.',
    { sub: 'Divergence' },
    'A **divergence** is price making a new high while CVD makes a lower high, or price making a new low while CVD makes a higher low. Take two pushes in NQ: the first reaches 21040 with CVD at +5,000; the second reaches 21046 with CVD at +3,800. The new high came with less net aggressive buying. That may mean buyers are tiring, or that passive buyers are now doing the work. Prices often keep going after a divergence.',

    { h: 'Testing a divergence claim' },
    'A divergence is a question to test, not a signal. Define it exactly in code: how much higher the price high, how much lower the CVD high, over how many bars. Define the outcome exactly: a fall of so many ticks within so many minutes. Then count every case, and compare with the **base rate**, how often that fall happens after any new high of the day. If the two numbers are close, the divergence adds nothing.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Reading positive delta as "more buying than selling".',
        'Comparing CVD levels between platforms or days with different starting points.',
        'Treating every divergence as a reversal signal.',
        'Comparing raw delta between a quiet bar and a busy one.',
      ],
    },
  ],

  'orderflow-footprint': [
    { h: 'Opening up a bar' },
    'A candle shows four prices and a volume. A **footprint** chart shows what happened inside it: for every price the bar traded at, the volume that traded at the bid and the volume that traded at the ask. It is the tape of that bar, sorted by price.',
    { sub: 'Reading one row' },
    'Each row is usually written bid x ask. A row reading "40 x 175" at 21002.00 means that at 21002.00, 40 contracts were sold aggressively (they hit a bid there) and 175 were bought aggressively (they took an offer there). The bar delta is the sum of the ask column minus the sum of the bid column, the same delta as in the last lesson, now with its location.',

    { h: 'Why imbalances are diagonal' },
    'Think about the quote when a trade happens. When a buyer lifts the offer at 21002.00, the best bid at that same moment is one tick lower, at 21001.75. Any seller hitting the bid in that quote prints at 21001.75. So the fair comparison for buying at a price is selling one tick **below** it: ask volume at p against bid volume at p − one tick. For selling, compare bid volume at p with ask volume at p + one tick. Comparing within one row mixes two different quotes.',

    { h: 'Imbalances and thresholds' },
    { sub: 'The ratio' },
    'A **buying imbalance** is a price where the ask volume is at least some ratio times the bid volume diagonally below. With 210 at the ask at 21002.00 and 50 at the bid at 21001.75, the ratio is 4.2. Platforms often use 3 to 1 (300%) by default. If the bid below is 70, a 300% buying imbalance needs at least 210 at the ask.',
    { sub: 'The selling side and a minimum' },
    'A **selling imbalance** is the mirror: bid volume at a price at least the ratio times the ask volume one tick above. Many platforms also require a minimum volume, so that a price with 3 contracts against 1 does not count as an imbalance.',
    {
      code: `rows = [(21001.75, 50, 12), (21002.00, 44, 210), (21002.25, 38, 150), (21002.50, 60, 90)]
buys = []
for i in range(1, len(rows)):
    if rows[i][2] >= 3 * rows[i - 1][1]:
        buys.append(rows[i][0])
print(buys)`,
      out: '[21002.0, 21002.25]',
    },
    'Rows are (price, bid, ask) with the lowest price first, so `rows[i - 1][1]` is the bid one tick below. 210 against 50 and 150 against 44 qualify; 90 against 38 is about 2.4 and does not.',

    { h: 'Stacked imbalances' },
    '**Stacked imbalances** are three or more imbalances on the same side at **consecutive** prices, one tick apart. They show aggression that kept pressing through several levels in a row. Three buying imbalances at 21002.00, 21002.50 and 21003.00 are not a stack, because they skip prices. Four at 21002.00, 21002.25, 21002.50 and 21002.75 are. The count of three, like the ratio, is a convention.',

    { h: 'Unfinished auctions' },
    'Look at the extreme rows. If at the bar\'s high both the bid and the ask columns have volume, traders call the auction there **unfinished**: buyers and sellers were both still trading at that price when the bar moved away. If one side is zero, it is called finished. Many footprint traders believe unfinished extremes tend to be revisited. That belief is common, not proven, and you can measure it in your own data.',

    { h: 'How much to trust a footprint' },
    'Footprints are dense, and in a busy bar some imbalance appears almost every time. Change the ratio from 3.0 to 3.5 and a stack can vanish; change the bar from one minute to two and the rows change. The same flow can be cut many ways, and each cut shows a slightly different picture. Where the most volume traded inside a bar, and volume at each price across a whole session, belong to the volume profile module. Here the lesson is narrower: the footprint tells you where in the bar the aggression was, and its patterns are settings until you have tested them.',
    { list: ['Fix the ratio, minimum volume and stack length before you look.', 'Count how often a pattern appears anywhere, not only where it looked good.', 'Record what followed every time, including the failures.'] },
  ],

  'orderflow-dom': [
    { h: 'The ladder' },
    'The **depth of market** (DOM), also called the ladder or price ladder, shows the resting size at each price around the quote and updates many times a second. It is the order book from the markets module drawn as a vertical list: asks above the price, bids below, the size at each level beside it. Traders use it to see how much is resting, and to watch it change.',

    { h: 'Three ways a level changes' },
    'The size at a level changes for three reasons only: new orders join (adds), orders are withdrawn (cancels), or orders trade (fills). The tape tells you the fills. The ladder shows only the result. To separate the other two, compare two snapshots of a level with the trades in between: the change not explained by trades is after − before + traded. Negative means size was cancelled; positive means size was added.',
    {
      code: `before = {21001.00: 90, 21001.25: 400}
after = {21001.00: 30, 21001.25: 120}
traded = {21001.00: 60, 21001.25: 0}
for p in before:
    print(p, after[p] - before[p] + traded[p])`,
      out: '21001.0 0\n21001.25 -280',
    },
    'At 21001.00 the size fell by 60 and 60 traded, so fills explain it all. At 21001.25 the size fell by 280 with no trades: 280 contracts were cancelled.',
    { sub: 'Pulling and stacking' },
    '**Pulling** is size disappearing from a level without trading. **Stacking** is size being added. Most resting orders are cancelled rather than filled, many within fractions of a second, so displayed size is an intention that can change. A large bid that vanishes as price approaches bought nothing.',

    { h: 'Icebergs' },
    'An **iceberg** order shows only part of its size. When the visible part fills, the next part appears at the same price. CME Globex offers this as a display quantity, so it is a normal, legal order type, used by traders who do not want to reveal their full size.',
    { sub: 'Spotting refills' },
    'You can suspect an iceberg, or a trader refilling by hand, when more trades at a price than was ever displayed there. If a bid never shows more than 25 but 140 contracts trade at that price and it still shows 25, then at least 115 traded beyond what was displayed at the start, and the buyer there was at least 165 contracts in total.',

    { h: 'Your place in the queue' },
    'At each price, orders usually fill in the order they arrived: **first in, first out**, as on the ES book. A new limit order joins the back of the queue. If 120 contracts rest at your price and you add 3, then 123 must trade there before you are completely filled. Price touching your limit and bouncing away often leaves you with nothing.',

    { h: 'Spoofing' },
    '**Spoofing** is placing orders that you intend to cancel before they execute, to make others believe there is more supply or demand than there is. It is illegal in the US: the Dodd-Frank Act of 2010 made it a specific offence in futures markets. Michael Coscia was convicted in 2015 in the first criminal case under that law. Navinder Sarao, a trader in London whose spoofing in ES was linked to the 2010 flash crash, pleaded guilty in 2016. In 2020 JPMorgan agreed to pay about $920 million over spoofing in metals and Treasury futures. Other countries have their own rules, and many major markets ban it. An iceberg hides real interest; a spoof shows false interest.',

    { h: 'Using the ladder sensibly' },
    'Displayed depth is most useful close to the price, for judging how much you can trade without moving the market. Size far from the price is the most likely to move before it is reached. Confirm with the tape: did trades happen at the level, and did it refill?',
    { sub: 'Slippage in futures dollars' },
    'Walking the book costs real money in futures. Buy 30 ES at market against asks of 10 at 6100.25 and 25 at 6100.50: you pay an average of (10 × 6100.25 + 20 × 6100.50) ÷ 30 ≈ 6100.4167, which is about 0.1667 points worse than the best ask. At $50 a point, that is about $250 for 30 contracts.',
    {
      code: `fills = [(6100.25, 10), (6100.50, 20)]
cost = sum(p * q for p, q in fills) - 30 * 6100.25
print(round(cost * 50, 2))`,
      out: '250.0',
    },
  ],

  'orderflow-absorption': [
    { h: 'Effort and result' },
    'The last lessons measured aggression. This one compares aggression with what it achieved. When aggressive orders keep hitting a price and the price does not give way, something passive is taking the other side.',
    { sub: 'Absorption' },
    '**Absorption** is heavy aggression at a price that fails to move it. Imagine NQ at 21020.00: sellers hit the bid there for three minutes, 2,400 contracts in all, and the bid keeps refilling. Price stays within a tick. A buyer with large passive orders, perhaps an iceberg, is taking everything. On a footprint you see a large negative delta in a narrow range.',

    { h: 'Measuring it' },
    'A simple measure of effort against result is **volume per price level traded**: volume ÷ (range in ticks + 1). The + 1 counts both ends, so a bar that trades at one price has one level, not zero, and the division never fails. Compare the result with bars at the same time of day, since volume follows the daily U shape from the markets module.',
    {
      code: `bars = [(21022.00, 21020.00, 3600), (21030.00, 21020.00, 3600)]
tick = 0.25
for high, low, vol in bars:
    levels = (high - low) / tick + 1
    print(round(vol / levels))`,
      out: '400\n88',
    },
    'Both bars traded 3,600 contracts. The first covered 9 levels, the second 41. The first did far more trading per level for far less progress, which is what absorption looks like in numbers.',

    { h: 'Exhaustion' },
    '**Exhaustion** is aggression drying up at the end of a move. Each push to a new high comes with less volume and a smaller delta: for example +1,200, then +700, then +300. The aggressive side is losing its urgency. That is a change in behaviour, not a forecast: a trend can continue on passive buying, with patient buyers raising their bids instead of lifting offers.',

    { h: 'Trapped traders' },
    '**Trapped traders** are those who entered aggressively shortly before the move turned against them. Breakout buyers who lifted offers above the morning high, only to see price fall back below it within minutes, are holding losses. If they sell to get out, by choice or because their stops trigger, that adds selling. It is one reason failed breakouts can move fast.',
    { sub: 'How big the pain is' },
    'NQ is worth $20 a point. If breakout buyers hold 150 contracts bought at an average of 21050 and price is back at 21040, their open loss is 10 points × $20 × 150 = $30,000. Losses that large on positions only minutes old tend to be closed quickly.',

    { h: 'Climactic volume' },
    '**Climactic volume** is a bar with far more volume than usual at the end of an extended move: late traders pile in and the other side meets them. Sometimes the move ends there. Sometimes it is the start of a larger leg. The volume shows that a fight happened at that price, not who won it.',
    '"Far more than usual" needs a yardstick. A bar of 8,000 contracts in the first five minutes after the open may be ordinary, while the same 8,000 at 12:30 would be four or five times normal. Compare each bar with the average volume of the same five minutes over the past few weeks, the same idea as relative volume in the charts module. Without that comparison, every opening bar looks climactic and every midday bar looks quiet.',

    { h: 'Why these readings fail' },
    { sub: 'Absorption until it is not' },
    'A passive buyer has limits. When the absorber stops refilling, the same heavy selling breaks the level, often fast. In real time you cannot know whether you are watching absorption that will hold or a level about to break. That is why rules built on absorption usually wait for a sign that the aggression has stopped working, such as delta turning the other way.',
    { sub: 'Hindsight' },
    'All of these patterns are easiest to see on old charts where you already know the outcome. Examples collected after the fact are mostly winners. Define each pattern in numbers before you look, record every case, and count the failures with the same care as the successes.',
  ],

  'orderflow-data': [
    { h: 'Why futures' },
    'Most index order flow is read in index futures. A **future** is a contract to buy or sell something at a set price on a later date; traders mostly close them long before that date. **ES** is the E-mini S&P 500 future: $50 times the index, ticks of 0.25 worth $12.50. **NQ** is the E-mini Nasdaq-100 future: $20 times the index, ticks of 0.25 worth $5. Both trade on one venue, CME Globex, with one central book, and CME publishes the aggressor side with each trade. That makes futures order flow a complete record. At the time of writing (2026) they trade almost around the clock from Sunday evening to Friday afternoon, US Eastern time, with a short daily break. Check the current specifications with CME and your broker.',
    { sub: 'Contract arithmetic' },
    'The dollar size of a contract is the index level times the multiplier. NQ at 21,000 controls 21,000 × $20 = $420,000. The margin a broker asks for is a small fraction of that, which is leverage: a 1% move is $4,200 per NQ contract. **Micro** contracts are a tenth of the size: MES is $5 times the S&P 500 ($1.25 a tick) and MNQ is $2 times the Nasdaq-100 ($0.50 a tick). A loss of 6 ticks on 4 MNQ is 6 × $0.50 × 4 = $12.',

    { h: 'Stocks and fragmentation' },
    'US stocks and ETFs such as SPY trade on more than a dozen exchanges and many off-exchange venues, such as dark pools and wholesalers that fill retail orders. Off-exchange trading was about half of all US share volume in 2025. Those trades are reported to the public tape after the fact, often at prices inside the spread, and the public tape does not say who was the aggressor. Every stock delta or footprint is therefore a reconstruction.',

    { h: 'Classifying trades without a flag' },
    { sub: 'The quote rule' },
    'Compare the trade price with the **mid** of the quote at that moment: above the mid is a buy, below is a sell. A trade exactly at the mid is left open.',
    { sub: 'The tick rule' },
    'Compare the trade price with the last different trade price: higher is a buy (an up-tick), lower is a sell (a down-tick). A trade at the same price as the one before, a **zero-tick**, keeps the sign of the last move.',
    {
      code: `prices = [50.10, 50.10, 50.12, 50.12, 50.11, 50.13]
signs, last = [], 0
for prev, p in zip(prices, prices[1:]):
    if p != prev:
        last = 1 if p > prev else -1
    signs.append(last)
print(signs)`,
      out: '[0, 1, 1, -1, 1]',
    },
    'The first comparison is a zero-tick with no earlier move, so it stays 0. The variable `last` carries the sign through repeated prices.',
    { sub: 'Lee-Ready' },
    'The **Lee-Ready** method, published by Lee and Ready in 1991, uses the quote rule and falls back on the tick rule for trades at the mid. Studies on older data found such methods right roughly 80 to 85% of the time. Accuracy falls when quotes change many times a second and trade and quote time stamps do not line up.',

    { h: 'What the data costs' },
    'Real-time depth data is licensed by the exchange. At the time of writing (2026), CME charges a non-professional about $12 a month per exchange for depth, or about $37 for all four CME Group exchanges, and platforms add their own fees. Historical tick data costs more. A fixed cost has to be earned back before you make anything: $40 a month is 32 ticks of MES profit, after commissions.',

    { h: 'Big option prints' },
    '"Unusual options activity" services flag large option trades. A large print tells you that a lot of contracts traded and, from the quote, which side crossed the spread. It does not tell you whether the aggressor was opening a new position or closing an old one, whether the options hedge a stock position, or whether they are one leg of a spread with other legs elsewhere. A large call purchase can be a bet on a rise, a hedge for a short stock position, or the closing of a call that was sold earlier. The next day\'s change in open interest (the number of contracts open) shows only the net effect of all traders together.',

    { h: 'Mistakes beginners make' },
    { list: ['Treating a stock delta as a measured fact rather than an estimate.', 'Trading ES without knowing that a point is $50.', 'Reading a large option print as a directional tip.', 'Paying for data before knowing whether it changes any decision.'] },
  ],

  'orderflow-levels': [
    { h: 'A narrow question at a known place' },
    'Order flow is most useful as a second look at a place you already care about. Mark the levels before the session: yesterday\'s high and low, the overnight range, **VWAP** (the volume-weighted average price of the day, from the charts module), round numbers. When price reaches one, ask a narrow question: is the aggression against the level working, or is it failing?',
    'This keeps the reading small. You are not trying to read the whole ladder all day. You are checking one thing, at one place, decided in advance.',

    { h: 'Writing the rule' },
    'A short rule at resistance, as an example: price trades into the resistance zone; buyers are aggressive there (bar delta at least +600) but price goes no more than 2 ticks above the zone; then the next bar has negative delta and closes back below the zone. Enter short on that close. Stop 2 ticks above the high of the absorption. Target the next level below. If price instead breaks through the zone with stacked buying imbalances, there is no short.',
    {
      code: `def short_ok(delta_at_level, ticks_above, next_delta):
    return delta_at_level >= 600 and ticks_above <= 2 and next_delta < 0

print(short_ok(900, 1, -200), short_ok(900, 4, -200), short_ok(300, 1, -200))`,
      out: 'True False False',
    },
    'Writing the rule as code forces every condition into a number. Each `and` is a condition that must hold; any one failing means no trade.',
    { sub: 'Reward, risk and size' },
    'Work out the **reward to risk** before entering: (distance to target) ÷ (distance to stop). Short at 6104.00, stop 6105.50, target 6101.00: 3.00 ÷ 1.50 = 2. On 1 ES ($50 a point), the planned loss is 1.50 × $50 = $75. If you want to risk $60 on that stop with MES ($5 a point), divide: 60 ÷ (1.50 × 5) = 8 contracts.',
    { sub: 'The win rate you need' },
    'With an average win W, an average loss L and a cost C per round trip, all in ticks, a win nets W − C and a loss costs L + C. Breakeven needs p × (W − C) = (1 − p) × (L + C), so p = (L + C) ÷ (W + L). With wins of 8 ticks, losses of 5 and 1 tick of cost, p = 6 ÷ 13 ≈ 46%.',

    { h: 'Testing the filter' },
    'Every number in the rule is a choice: the delta threshold, the ticks allowed beyond the level, what counts as a close back inside. Test the rule by counting every time its conditions were met and the result in ticks after costs. Then compare with trading the same level without the order flow condition. If the filter does not improve the results across enough trades, it is decoration. Paper trade it before risking money, and record every case.',

    { h: 'From ES to SPY options' },
    'Many option traders read ES order flow but trade SPY options. SPY trades at about a tenth of the S&P 500 and ES tracks the index closely, so a 6-point ES move is about $0.60 in SPY. An option with a delta of 0.40 (the options and pricing modules explain delta; for now, the option moves about 0.40 times as much as SPY) gains about $0.24 a share, or $24 a contract. Subtract the spread you pay to get in and out. The signal and the trade are in different instruments, and the option keeps less of the move.',

    { h: 'How it fails' },
    { list: [
      'The passive side is overrun: absorption becomes a breakout, fast.',
      'Readings are ambiguous in real time and look obvious afterwards.',
      'Fast algorithms see the same book sooner than you do.',
      'Costs and slippage eat a small edge measured in ticks.',
      'Screenshots of winners build confidence the full record does not support.',
    ] },

    { h: 'Honest expectations' },
    'There is no reliable public evidence that reading footprints or the ladder gives retail traders an edge on its own, and most retail day traders lose money. Order flow can still be useful as a filter that keeps you out of entries where the level is clearly breaking. Use the smallest size, micro futures or a single option, while you test, and keep a log of every trade.',
  ],

  'orderflow-lab': [
    { h: 'What the toolkit does' },
    'Every order flow chart is built from the same few steps: label each trade as a buy or a sell, add the labels up by time to get delta, add them up by price to get a footprint, and compare neighbouring prices to find imbalances. The lab writes each step in plain Python so that nothing on those charts is a mystery.',
    'The input is a list of trades, each with its price, size and the quote at the time. In futures the exchange gives you the side; the lab works it out from the quote so that the same code also works on stock data.',

    { h: 'From trades to signs' },
    { sub: 'The quote first' },
    'A trade at or above the ask is +1, at or below the bid is −1. With the full Lee-Ready approach you compare with the mid instead: above the mid +1, below −1.',
    { sub: 'The tick rule as a fallback' },
    'For trades exactly at the mid, use the tick rule. Keep two pieces of state as you loop: the last trade price and the last tick sign. Update the tick sign on every trade whose price differs from the last one, whatever the quote rule decides, so that it is ready when a trade lands on the mid. Before any price change has been seen the sign is 0, which honestly means unknown.',

    { h: 'From signs to bars' },
    'Time bars are buckets. With times in seconds and 60-second bars, a trade at second 75 belongs to the bar starting at 75 // 60 × 60 = 60. Add size to the bar\'s volume and size × sign to its delta. A trade with sign 0 adds to volume but not to delta.',
    {
      code: `trades = [(12, 3, 1), (48, 5, -1), (70, 4, 1), (119, 2, 0)]
bars = {}
for t, size, sign in trades:
    start = t // 60 * 60
    vol, delta = bars.get(start, (0, 0))
    bars[start] = (vol + size, delta + size * sign)
print(sorted(bars.items()))`,
      out: '[(0, (8, -2)), (60, (6, 4))]',
    },
    'Sorting the dictionary items puts the bars back in time order.',

    { h: 'Cumulative delta and share of volume' },
    'Cumulative delta is a running sum of bar deltas, which `itertools.accumulate` gives you directly. Delta divided by volume gives a number between −1 and +1: −1 means every classified contract in the bar was sold aggressively. Unclassified volume pulls the share towards zero.',

    { h: 'The footprint as a dictionary' },
    'A footprint is a dictionary from price to a pair [bid volume, ask volume]. Sells (−1) add to index 0 and buys (+1) to index 1. Prices should be snapped to the tick grid first, because floating point numbers that print the same may not be exactly equal: `round(round(price / tick) * tick, 2)` turns 21000.2500001 into 21000.25.',
    {
      code: `tick = 0.25
for price in [21000.2500001, 21000.26, 21000.12]:
    print(round(round(price / tick) * tick, 2))`,
      out: '21000.25\n21000.25\n21000.0',
    },

    { h: 'Finding imbalances and stacks' },
    'For each price p in the footprint, look up its neighbours with `round(p - tick, 2)` and `round(p + tick, 2)`, using [0, 0] when a neighbour is missing. A buying imbalance needs the ask at p to be at least the minimum volume and at least the ratio times the bid below. A selling imbalance mirrors it with the bid at p and the ask above.',
    'To find stacks, walk through the sorted imbalance prices and keep a current run. If the next price is one tick above the last one in the run, extend it; otherwise close the run and start a new one. After the loop, close the last run too. Forgetting that final check misses a stack at the top of the list.',

    { h: 'What the toy leaves out' },
    { list: [
      'Quotes and trades that arrive with slightly different time stamps.',
      'Trades with no aggressor, such as opening auctions.',
      'Bars by volume instead of time, which many footprint traders use.',
      'Testing thresholds on data that was not used to choose them.',
      'Costs, slippage and tick values when results are turned into money.',
    ] },
    'Each of these can change the numbers enough to change a conclusion, so a rule tested only on the toy is not yet tested.',
  ],
}
