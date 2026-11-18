import type { Block } from '../../types'

/** The full theory for each lesson of the engine module, keyed by lesson id. */
export const engineTheory: Record<string, Block[]> = {
  'engine-design': [
    { h: 'Two ways to run a backtest' },
    'A **backtest** replays history to see what a trading rule would have done. The algo module showed that it can be written in two shapes. **Vectorised** code treats the whole history as arrays and computes every bar at once with NumPy. **Event-driven** code walks through history one event at a time (a new bar, a fill, a timer), the way a live trading program meets the market. This module is about building the second shape well, and the first question is when you need it.',

    { h: 'The vectorised formula' },
    { sub: 'Positions times returns' },
    'Write the **return** of bar t as `ret[t] = close[t+1] / close[t] − 1`, the move from one close to the next. A position decided at close t earns the move that follows it. So if `pos` is an array of positions, one per close, the P&L per bar is `pos[:-1] × ret`: the last position has no next bar to earn from. Costs are subtracted wherever the position changes.',
    {
      code: `import numpy as np

close = np.array([50, 51, 50.5, 52, 53.0])
pos = np.array([0, 1, 1, 0, 1.0])
ret = np.diff(close) / close[:-1]
print(np.round(pos[:-1] * ret * 100, 2).tolist())`,
      out: `[0.0, -0.98, 2.97, 0.0]`,
    },
    "`np.diff(close)` gives the change from each close to the next, so `ret` has one element fewer than `close`. Pairing `pos[:-1]` with `ret` is the timing rule in one line: today's decision, tomorrow's move. Shifting it by one in the wrong direction is the classic way to give a backtest the future.",
    { sub: 'When the formula is exact' },
    'The formula is exact when every position can be computed from data alone: a moving average rule, a z-score rule, a ranking of stocks, at a fixed size. It does not care in what order the bars are visited, which is why it can do them all at once.',

    { h: 'Path dependence' },
    'A rule is **path dependent** when what you hold now depends on what the strategy itself did before, not only on prices. Then the position at bar t needs the state left by bar t − 1, and the only way to get it is to visit the bars in order, carrying that state. That is a loop, and a loop over events is an event-driven engine.',
    {
      list: [
        'A **stop loss**: after it fires you stay out until some new condition, so the position depends on whether the stop fired before.',
        'Sizing from current **equity** (the account value) in whole shares: the size depends on all earlier P&L, and the cash left over depends on the share price.',
        'An order that **waits**, such as a limit order that lives for three bars: whether it is still alive depends on what happened since it was sent.',
        'Running out of **cash**, a **daily loss limit** that halts trading, and **partial fills** where only part of an order is done.',
      ],
    },
    'Whole shares are a small example of how a loop sees things a formula misses. With $5,000 and a $43 stock, `5000 // 43` gives 116 shares costing $4,988, leaving $12 that earns nothing. A vectorised percentage return assumes every dollar was invested.',

    { h: 'Speed and the usual workflow' },
    'The loop has a price. Pure Python handles roughly tens of thousands of events a second; NumPy processes millions of array elements in the same time. To estimate a run, multiply symbols × days × bars per day to get events, then divide by events per second. For example 100 stocks × 252 days × 78 five-minute bars is about 1.97 million events; at 20,000 a second that is about 98 seconds for one run. Multiply by the number of parameter settings you want to try and it adds up quickly.',
    'More code is also more room for bugs. So most researchers use both shapes: **screen** many ideas with vectorised code at fixed size, then **rebuild** the few survivors in the event-driven engine with stops, sizing and a fill model.',

    { h: 'Making the two engines check each other' },
    { sub: 'Agreement on the simple case' },
    'Take a strategy with no path dependence, the same cost model in both, and run it through both engines. The equity curves must be the same to rounding. If they are not, one engine has a bug. Find the **first bar where the positions differ** and look there; it is usually a timing error, such as a position earning the move that created its own signal, or a fill at the signal bar instead of the next one.',
    { sub: 'Comparing floating point numbers' },
    'Computers store prices as **floating point** numbers, which are rounded in the last binary digits. Adding the same numbers in a different order can change those last digits, so two correct engines rarely produce bit-for-bit identical equity. Never compare them with `==`. Use a tolerance: `np.allclose(a, b, rtol=0, atol=1e-6)` treats two values as equal when they differ by less than a millionth of a dollar, far below a cent and far above rounding noise.',
    {
      code: `import numpy as np

a = (0.1 + 0.2) + 0.3
b = 0.1 + (0.2 + 0.3)
print(a == b, np.allclose(a, b, rtol=0, atol=1e-9))`,
      out: `False True`,
    },

    { h: 'Mistakes that cost money' },
    {
      list: [
        'Using a vectorised result for a strategy that has a stop or equity-based sizing: it describes a different strategy.',
        'Trusting whichever engine gives the better number when the two disagree, instead of finding the bug.',
        'Comparing equity curves with `==` and chasing differences of 1e-12.',
        'Running a slow event-driven engine over hundreds of variants, then picking the best and forgetting how many were tried.',
      ],
    },
  ],

  'engine-events': [
    { h: 'What flows through an engine' },
    'An event-driven engine is a loop that takes the next **event** from a queue, hands it to whichever part handles it, and lets that part put new events on the queue. Four kinds do most of the work, each stamped with a time:',
    {
      list: [
        'A **market event**: a new bar or quote for one symbol.',
        'A **signal event**: what the strategy wants, usually a target position.',
        'An **order event**: what will be sent to the broker, after the risk checks.',
        'A **fill event**: what actually happened at the broker: quantity, price, fee.',
      ],
    },
    "Make each a small class. Python's `dataclasses` module writes the boilerplate for you, and a misspelt field name is then an error at once. With plain dictionaries, `event['qyt'] = 5` quietly creates a new key and the bug surfaces much later.",

    { h: 'Why first in, first out is not enough' },
    'The algo module used a **first in, first out** queue: events come out in the order they went in. That works while events are created in time order. It fails as soon as something is scheduled for later: a fill that arrives a moment after its order, an order that expires in three bars, a timer that flattens all positions at 15:55, or bars for the whole day loaded into the queue at the start. Each new event is appended behind everything already there, including events later in time.',
    'What the engine needs is a **priority queue**: whatever goes in, the event with the earliest time comes out next. Python provides one in the `heapq` module. A **heap** is a list kept in a special order so that the smallest item is always at index 0; `heapq.heappush` adds an item and `heapq.heappop` removes the smallest, both quickly even for millions of items.',

    { h: 'The key that orders the heap' },
    { sub: 'Tuples compare item by item' },
    'Python compares tuples one item at a time: `(1, 5) < (2, 0)` because 1 < 2, and only on a tie does it look at the next item. Pushing `(time, priority, sequence, event)` makes the heap order events by time first, then by priority, then by sequence.',
    { sub: 'Priority at a shared time' },
    'Many events share a timestamp. A fill from an order sent on the 10:00 bar may carry the same time as the 10:01 bar. Give fills a lower **priority** number than market data so they come out first: the strategy then sees its updated position before it decides again. Without that, it may still believe it is flat and send the same order twice.',
    { sub: 'The sequence number' },
    'If time and priority tie, the tuple comparison moves on to the event itself. Dataclasses and dictionaries cannot be compared with `<`, so Python raises a `TypeError`. The bug hides as long as no two events tie, which with one symbol may be never, and appears the day you add a second symbol. A **sequence number** from `itertools.count()`, a counter that only goes up, makes every key unique and keeps tied events in the order they were pushed.',
    {
      code: `import heapq, itertools

seq = itertools.count()
q = []
for t, prio, name in [(5, 1, 'bar B'), (3, 1, 'bar A'), (5, 0, 'fill A'), (3, 1, 'bar C')]:
    heapq.heappush(q, (t, prio, next(seq), {'name': name}))
print([heapq.heappop(q)[3]['name'] for _ in range(4)])`,
      out: `['bar A', 'bar C', 'fill A', 'bar B']`,
    },
    'The two time-3 bars come out in the order they were pushed; at time 5 the fill (priority 0) goes before the bar. The dictionaries were never compared.',

    { h: 'The simulation clock' },
    'The engine keeps a **simulation clock**: the time of the event being handled. It jumps from event to event and must never go backwards. An event scheduled before the current time means some part of the engine made a timing mistake, so the queue should refuse it with an exception at the line that caused it, not process it quietly.',
    'Strategy code must read time from the event or from the engine clock. `datetime.now()` returns the time on your computer, which in a backtest is the day you ran it. A rule such as "flatten after 15:55" written with `datetime.now()` either never fires or fires on every bar depending on when you run the test. Written with the event time, it is correct in the backtest and live.',

    { h: 'How many events a day' },
    'Counting events tells you where speed matters. Take 5 symbols on one-minute bars: 5 × 390 = 1,950 market events a day. If 4% of bars produce a signal, and each signal leads to one order and one fill, that adds 3 × 78 = 234 more. Market data is almost 90% of the work, so a fast data path matters far more than fast order handling.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'A first-in, first-out queue with future events already in it, so fills arrive after later bars.',
        'A heap key of (time, event), which crashes the first time two times tie.',
        'Bars handled before fills at the same time, which sends duplicate orders.',
        'Reading the wall clock inside strategy code.',
      ],
    },
  ],

  'engine-data': [
    { h: 'What a data handler is for' },
    'The **data handler** is the part of the engine that holds the market data and gives it to everyone else. It has two jobs: hand out bars in time order, and answer questions about the past ("the last 20 closes of SPY"). Built well, it makes **lookahead**, using information that was not yet available, impossible rather than merely avoided.',

    { h: 'A cursor and a history that ends at it' },
    'The handler keeps a **cursor**: the current time. Moving forward appends each new bar to what has been seen. `history(sym, n)` returns at most the last n values up to and including the cursor, and there is no method that returns anything after it. A strategy cannot misuse data it cannot reach.',
    { sub: 'The off-by-one that leaks the future' },
    'Python slices exclude their end: `x[a:b]` stops before index b. If i is the index of the current bar, `closes[i - n + 1 : i + 1]` is the last n bars including bar i. Writing `i + 2` adds the next bar, a one-character bug that makes a strategy look clairvoyant.',
    {
      code: `closes = [10, 11, 12, 13, 14]
i, n = 2, 2
print(closes[max(0, i - n + 1):i + 1], closes[max(0, i - n + 1):i + 2])`,
      out: `[11, 12] [11, 12, 13]`,
    },
    { sub: 'A test that finds leaks without reading the code' },
    'For any feature (an indicator computed from prices), change every price after time t, recompute, and check whether the value at t changed. If it did, the feature at t depends on the future. Repeat for every t with random changes from a seeded generator, and compare with `np.allclose(..., equal_nan=True)` so that empty values at the start (NaN, "not a number") count as equal. The test knows nothing about how the feature works, so it catches centred windows, scaling by the whole series and off-by-one slices alike.',

    { h: 'Several symbols at once' },
    'With more than one symbol, deliver a **time slice**: every bar that has the same timestamp, together, before the strategy acts. Otherwise a strategy that compares two symbols may see one at 10:01 and the other still at 10:00.',
    'Build the slices on the **union** of all timestamps, the set of every time at which any symbol has a bar. `heapq.merge` combines several lists that are each sorted into one sorted stream, without loading them into one big list. Merged tuples that tie on time are ordered by their next item, often the symbol name, which is alphabetical by accident; grouping by time into slices removes any dependence on it. When grouping, only close a slice that has something in it, or the first slice is an empty one stamped with no time.',
    {
      code: `import heapq

a = [(1, 'AAPL'), (3, 'AAPL')]
b = [(1, 'MSFT'), (2, 'MSFT'), (3, 'MSFT')]
print(list(heapq.merge(a, b)))`,
      out: `[(1, 'AAPL'), (1, 'MSFT'), (2, 'MSFT'), (3, 'AAPL'), (3, 'MSFT')]`,
    },

    { h: 'When a bar is known' },
    'A 15-minute bar from 10:00 to 10:15 can be stamped 10:00 (its **start**) or 10:15 (its **end**). Its close is the last trade before 10:15, so it is known only at 10:15. If your vendor stamps the start and your engine treats the stamp as the moment the bar can be used, every decision sees 15 minutes of the future. **Restamp** each bar to its end time when you load it, and store every time in UTC so that daylight saving cannot reorder anything.',

    { h: 'Missing bars, stale prices and warm-up' },
    { sub: 'No trade, no bar' },
    'A thinly traded stock may have no trade in a minute, and then it has no bar. Do not invent one by **interpolating**, drawing a line between the closes either side, because the later close is the future. For valuing a position you may **carry forward** the last close, but keep its **age** (how many bars old it is) and treat it as **stale** beyond a limit: no order fills at a stale price, and no signal is computed from one.',
    { sub: 'Warm-up' },
    'An indicator over n bars exists only from the nth bar on. With a 20-bar average on a day of 78 five-minute bars, the first value is at bar 20 and there are 78 − 20 + 1 = 59 bars with a value. Either load earlier days so the indicator exists from the first bar of the test, or emit no signals until it does. Silently using a shorter window at the start gives a different strategy.',

    { h: 'Streaming instead of loading' },
    'Data is big. One year of one-minute bars for 200 stocks, at 252 days and 390 bars a day, is about 19.7 million bars; at 5 fields of 8 bytes each that is about 0.79 GB before timestamps. Ten years of a wider universe does not fit in memory. Store bars in files sorted by time and read them with **generators**, Python functions that `yield` one item at a time, so the handler holds one slice in memory. Live data arrives the same way, one slice at a time.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'A history method that slices one bar too far.',
        'Treating bar start stamps as the time the close is known.',
        'Interpolating gaps in thin stocks.',
        'Acting on one symbol before the others in the same slice have arrived.',
      ],
    },
  ],

  'engine-portfolio': [
    { h: 'What the portfolio keeps' },
    'The **portfolio** is the engine’s record of what you own and what it is worth. It changes only on **fills**, the reports of trades that happened, never on orders, which are only intentions. From the fills it keeps, for each symbol, the **position** and the **average price**, and for the account the **cash** and the **realised P&L**. From those and current prices it computes the rest.',

    { h: 'Signed positions and cash' },
    'Use one signed number per symbol. +200 means **long** 200 shares (you own them); −200 means **short** 200 (you sold borrowed shares and must buy them back). A buy has positive quantity, a sell negative, so every fill adds its quantity to the position whether it opens, adds, reduces or reverses.',
    'Cash changes by `−qty × price × multiplier − fee` on each fill. A buy spends cash; a sell, including a short sale, brings cash in. The **multiplier** turns a price into dollars per unit: 1 for shares, and 100 for a standard US equity option contract, whose price is quoted per share for 100 shares. A **fee** is any commission or charge on the fill.',

    { h: 'Average price and realised P&L' },
    { sub: 'Adding to a position' },
    'When a fill adds in the same direction as the position (or opens one from flat), the **average price** becomes the quantity-weighted average of the old position and the new fill. Long 100 at $30, buy 50 at $33: the new average is (100 × 30 + 50 × 33) ÷ 150 = $31.',
    { sub: 'Reducing a position' },
    'When a fill goes the other way, the part that closes **realises** P&L: it becomes a fixed result. The amount is `closed × (price − avg) × sign × multiplier`, where `closed` is the number of units closed and sign is +1 for a long, −1 for a short. The average price of what remains does not change. Short 80 at $40, buy back 30 at $37: realised = 30 × (37 − 40) × −1 = +$90, and the other 50 stay short at $40.',
    { sub: 'Flipping through zero' },
    'A fill bigger than the position **flips** it. The whole old position closes and realises P&L, and the rest of the fill opens a new position the other way, with the fill price as its average. Long 60 at $10, sell 100 at $11: the 60 realise 60 × $1 = $60, and you are now short 40 at $11.',
    {
      code: `def on_fill(pos, avg, qty, price):
    realised = 0.0
    if pos == 0 or (pos > 0) == (qty > 0):
        avg = (avg * pos + price * qty) / (pos + qty)
    else:
        closed = min(abs(qty), abs(pos))
        realised = closed * (price - avg) * (1 if pos > 0 else -1)
        if abs(qty) > abs(pos):
            avg = price
    return pos + qty, avg, realised

print(on_fill(60, 10.0, -100, 11.0))`,
      out: `(-40, 11.0, 60.0)`,
    },

    { h: 'Unrealised P&L and marking to market' },
    '**Unrealised** P&L is the gain or loss on what you still hold, at a current price: `(mark − avg) × position × multiplier`. For the short 40 at $11 above, at a mark of $10.50 it is (10.50 − 11) × −40 = +$20. **Marking to market** means valuing everything at current prices: **equity** = cash + Σ position × mark × multiplier, summed over every symbol held.',
    'Which price is the **mark**? For liquid shares the last close is fine. For options the last trade may be hours old. The **mid**, halfway between the best **bid** (the highest price a buyer offers) and the best **ask** (the lowest a seller accepts), is the usual mark. The bid is the cautious mark for a long position, because it is what you could sell at now, which suits a loss limit. Marking at what you paid hides losses until you sell.',

    { h: 'The identity that checks everything' },
    'Cash comes only from fills, so it is the most reliable number in the engine. Every correct portfolio satisfies **equity − starting cash = realised + unrealised**, with fees counted in realised. Check it after every event in your tests. When it breaks, the first event where it breaks points at the bug.',

    { h: 'FIFO and average cost' },
    'Average cost treats all units held as one pool. **FIFO** (first in, first out) keeps each purchase as a separate **lot** and closes the oldest first. Buy 50 at $8, buy 50 at $10, sell 50 at $11: FIFO realises 50 × $3 = $150; average cost ($9) realises $100. The other $50 has not vanished: it is in the unrealised P&L of the shares left. Once you are flat, both methods give the same total, because total P&L is money in minus money out. The method matters for per-trade statistics and for tax timing; which one applies to your tax return depends on your country and broker, and this is not tax advice.',

    { h: 'Mistakes that cost money' },
    {
      list: [
        'Realising P&L on the whole fill when it flips the position, instead of only on what was held.',
        'Forgetting the ×100 multiplier on option fills.',
        'Leaving fees out of realised P&L while taking them from cash, so the identity breaks.',
        'Marking options at a stale last trade, which overstates the account exactly when liquidity is poor.',
      ],
    },
  ],

  'engine-fills': [
    { h: 'Why fills need a model' },
    'In a backtest no order reaches a market, so the engine must decide when an order fills, at what price, and for how much. The rules that decide are the **fill model**. Each one is a guess about the past, and the guesses that flatter the result are exactly the ones live trading takes back. Most backtests that cannot be repeated live fail here.',

    { h: 'Timing and price of a market order' },
    { sub: 'The next bar' },
    'A decision made on the close of bar t can reach the market at the earliest when bar t + 1 opens. So a **market order**, one that takes whatever price is available, fills at the next open, never at the close that triggered it.',
    { sub: 'The spread and slippage' },
    'The **spread** is the gap between the bid and the ask. A market buy pays the ask, roughly the mid plus half the spread; a market sell receives the bid. **Slippage** is any further move against you between seeing a price and trading, larger for bigger orders and fast markets. A simple model: buy at `open + half_spread + slip`, sell at `open − half_spread − slip`. Buying 500 shares with a half spread of $0.03 and slippage of $0.02 costs 500 × $0.05 = $25 more than the open suggests, and the exit costs about the same again.',

    { h: 'How much fills: volume caps and partial fills' },
    "A bar's **volume** is the number of shares traded in it. Your order cannot take all of them. A **participation cap** limits each fill to a share of bar volume, for example 5%. The rest of the order stays **working** and fills on later bars, if at all: a **partial fill**. With a 5% cap, an order for 1,000 shares against bars of 6,000 and 4,000 shares fills 300, then 200, leaving 500 still working.",
    {
      code: `import math

order, cap = 1000, 0.05
for vol in [6000, 4000, 9000]:
    fill = min(order, math.floor(cap * vol))
    order -= fill
    print(vol, fill, order)`,
      out: `6000 300 700
4000 200 500
9000 450 50`,
    },

    { h: 'Limit and stop orders inside a bar' },
    { sub: 'Limit orders' },
    'A **buy limit** at L buys at L or lower. On the next bar it fills at the open if the bar opens at or below L, which is a better price, or at L if the low goes **through** L. If the low only **touches** L, a cautious model says no fill. Your order waited in a queue behind earlier orders at that price, and a touch says only that some shares traded there. A **sell limit** is the mirror image: at the open if the bar opens at or above it, at the limit if the high goes through it.',
    'Touch-only fills matter because of **adverse selection**: the trades that only reach your price and turn back are often the good ones, and those are the ones you tend to miss live, while the ones where the price keeps going through your level always fill. In the figure, the stricter rule removes exactly those touch days.',
    { sub: 'Stop orders and gaps' },
    'A **stop order** becomes a market order once the price reaches its level. A sell stop at S triggers when the low reaches S; a buy stop when the high does. If the bar **gaps**, opening beyond the stop, the stop fills at the open, which is worse than S. A long position with a stop at $60 that opens at $57 after overnight news loses $3 a share more than planned. Gaps make stops fill worse, never better.',
    { sub: 'Two levels in one bar' },
    'A bar records open, high, low and close, not the order in which the high and low happened. If a stop and a target both lie inside one bar, you cannot tell which was hit first. Assume the stop, or load finer bars for the cases where it matters.',

    { h: 'Commissions and fees' },
    'Brokers charge in **schedules**: per share with a minimum per order, per option contract, or a percentage, and US sales also carry small regulatory fees. A minimum hurts small orders most. With a made-up schedule of $0.004 a share and a $1.00 minimum, an order of 100 shares costs $1.00, not $0.40. Fee schedules change and differ by broker, so keep them in configuration and check them with your broker before trusting a result.',

    { h: 'Leaning pessimistic' },
    'When the data cannot settle a question, choose the worse outcome: no fill on a touch, the open on a gap, the stop before the target. Then rerun the backtest with costs doubled and tripled. If a result needs the cheap assumption to survive, its edge is smaller than the uncertainty in your costs. As an example, a strategy whose gross edge is $20 per trade shows $12 net under $8 of assumed costs, and only $4 if costs turn out to be $16.',

    { h: 'Mistakes that flatter backtests' },
    {
      list: [
        'Filling market orders at the signal close or at the open with no spread.',
        'Filling limit orders on a touch.',
        'Filling stops at the stop price after a gap.',
        'Ignoring volume, so a thin stock absorbs any order size at one price.',
        'Modelling commissions as a flat rate per share and missing the minimums.',
      ],
    },
  ],

  'engine-live': [
    { h: 'One engine, three worlds' },
    'A strategy goes through three stages: the **backtest** on history, the broker’s **paper account** (simulated money against live prices), and **live** trading with real money. The algo module argued that the same strategy and risk code should run in all three. The reason is plain: code that runs only live has never been tested by the backtest. This lesson is about how to build the engine so that only a few small parts change.',

    { h: 'Interfaces' },
    { sub: 'What an interface is' },
    'An **interface** is a promise about which methods a part has, with no promise about how they work. The engine needs three. A **data feed** hands out market events and fetches history. A **broker** accepts orders and cancels, and reports fills, partial fills and rejections. A **clock** says what time it is. The backtest plugs in a file feed, a simulated broker and a clock that follows the events. Paper and live plug in a feed and a broker connection that talk to the real broker, with paper or live keys.',
    { sub: 'Writing one down in Python' },
    'An **abstract base class** writes an interface down. A class that inherits from `abc.ABC` and marks methods with `@abstractmethod` cannot be created until a subclass provides every one of them. A `typing.Protocol` is the other option: it describes the methods, and type checkers accept any class that has them, without inheritance.',
    {
      code: `from abc import ABC, abstractmethod

class Feed(ABC):
    @abstractmethod
    def history(self, sym, n): ...

class FileFeed(Feed):
    def history(self, sym, n):
        return [100.0] * n

class Broken(Feed):
    pass

print(FileFeed().history('SPY', 2))
try:
    Broken()
except TypeError as e:
    print('TypeError')`,
      out: `[100.0, 100.0]
TypeError`,
    },
    'The failure happens when the object is created, at startup, not hours later when the missing method is first needed. Choosing which implementation to create is then one line of **configuration**, not an edit to strategy code.',

    { h: 'A simulated broker shaped like a real one' },
    'A real broker accepts an order, returns an **order id** at once, and reports what happened later: a fill, maybe several partial fills, a cancel, or a rejection. If the simulated broker fills inside `submit` and returns the fill, strategy code learns that orders fill instantly and completely. Live, that assumption causes duplicate orders and positions counted twice.',
    'So the simulator returns an id and delivers fills as later events. The strategy keeps two numbers per symbol: the **position**, changed only by fills, and the **pending** quantity, sent but not yet filled. The order it sends is `target − position − pending`. A simulator that also produces partial fills, rejections and delays lets the strategy meet these cases in the backtest first.',

    { h: 'What cannot be the same' },
    'Some things differ whatever you do: **latency** (the time for messages to travel), real fills, disconnections and restarts. Put the code for them in the live adapters and in startup, not in the strategy. A line such as `if config.live:` inside strategy or risk code is a path the backtest never ran.',
    { sub: 'Starting up' },
    'A live engine that starts, or restarts after a crash, must not assume it is flat. It loads **positions and open orders** from the broker, **reconciles** them with its own records (the algo module covered reconciliation), adopts or cancels the open orders, and then **warms up** its indicators. Warm-up needs history the backtest had in its files: a strategy that needs 120 bars of 5-minute history, with 78 bars in a session, must load `math.ceil(120 / 78)` = 2 previous sessions before the open.',

    { h: 'Record and replay' },
    'The strongest test of parity is **record and replay**. Log every market event the live or paper engine receives and every decision it makes, as `(time, symbol, target)`. After the session, feed the recorded events through the backtest engine and compare decisions one by one. They should match. The first decision that does not, the **first divergence**, points at a bug or at a difference you had not noticed, and everything before it is shown to match. Compare targets with a small tolerance, since they may be computed floats.',

    { h: 'Measuring the gap and closing it' },
    'Paper and live fills tell you what the simulator got wrong. If the simulator assumes $0.01 of slippage a share and your fills show $0.04, then on 300 shares in and out, 200 times a year, the backtest overstates results by $0.03 × 300 × 2 × 200 = $3,600 a year. With one code path, closing that gap is a change to one number in configuration, and every later backtest is more honest.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Strategy code that imports the broker library directly.',
        'Updating the position when an order is sent instead of when it fills.',
        'Mode switches scattered through strategy and risk code.',
        'Starting live without loading positions, open orders and warm-up history.',
      ],
    },
  ],

  'engine-testing': [
    { h: 'Why engine bugs flatter' },
    'A bug in a trading engine is not equally likely to help or hurt. You investigate the backtests that look bad and accept the ones that look good. A bug that makes results worse gets found; a bug that makes them better survives. Over months, untested code drifts toward optimism. **Tests**, code that checks other code against answers known in advance, are the only defence that does not depend on whether you like the result.',

    { h: 'Unit tests worked out by hand' },
    'A **unit test** checks one small piece, such as one fill applied to a portfolio. The expected value must come from working it out by hand, never from running the code and copying what it printed: a test copied from buggy code locks the bug in. Write cases for every branch of the accounting: a buy, an add, a reduction, a flip through zero, a short, an option with its multiplier, a fill with a fee. Short 50 at $30, buy back 70 at $28: by hand, the 50 realise 50 × $2 = $100 and you are long 20 at $28. That is the test.',

    { h: 'Invariants and random fills' },
    { sub: 'Statements that are always true' },
    'An **invariant** is something that must hold after every event: equity − starting cash = realised + unrealised; cash changes only on fills; the position equals the sum of the fill quantities. Invariants test combinations nobody would write by hand.',
    { sub: 'Hundreds of random cases' },
    'Generate hundreds of random fills (symbols, sizes both ways, prices, fees) from a seeded generator, apply them one at a time and check the invariant after each. This is **property-based testing**. The `hypothesis` library does it thoroughly in real projects, and also shrinks a failing case to the smallest one that still fails; a NumPy loop does the same job on a small scale. Because the generator is seeded, a failure happens again on the next run, so you can debug it.',
    { sub: 'Known answers and regression' },
    'Some whole-strategy results can be computed independently. Buy and hold with no costs must end at the price ratio. The vectorised and event-driven engines must agree on a strategy with no path dependence. Every feature must pass the lookahead test from the data lesson. A **regression test** saves the full output of a reference run and fails whenever a change moves it, so any change in results is a decision you make on purpose.',

    { h: 'Reproducibility' },
    { sub: 'Seeds passed in' },
    'A backtest is **reproducible** when the same inputs give the same output, bit for bit. Anything random, such as slippage noise or simulated latency, must draw from a generator created with a **seed**, `np.random.default_rng(seed)`, and passed in to every part that needs it. The global functions such as `np.random.normal` share one hidden generator that nobody seeded; one call to them anywhere makes the whole run unrepeatable.',
    {
      code: `import numpy as np

def noisy(rng):
    return round(float(rng.normal(0, 1)), 4)

print(noisy(np.random.default_rng(3)) == noisy(np.random.default_rng(3)))`,
      out: `True`,
    },
    { sub: 'Hidden sources of change' },
    'Python **randomises string hashing** in each new process, unless the environment variable `PYTHONHASHSEED` is fixed. The order in which a `set` of strings is visited can therefore change from run to run. If that order decides which symbol gets the last of the cash, results change too. Loop over `sorted(...)` instead.',
    'A seed makes a run repeatable, not representative. If slippage is random, run several seeds and report the spread. The **standard error** of the average over k seeds is the standard deviation across seeds ÷ √k: 10 seeds with a spread of $2,000 give a standard error of about $632.',
    { sub: 'What to save with every result' },
    'Save the **configuration** (every parameter and cost assumption), the **seed**, a **fingerprint** of the input data (a hash of the files, so a corrected file is noticed) and the **code version** (the git commit). Without all four, a different number six months later cannot be explained.',

    { h: 'Logging every decision' },
    'Write each decision as one line of **JSON**, a text format for dictionaries that every language reads: time, symbol, inputs, the decision and the reason. `json.dumps(record, sort_keys=True)` writes the keys in a fixed order, so two logs can be compared line by line, as the replay test in the previous lesson does.',
    {
      code: `import json

print(json.dumps({'t': '2026-05-04T13:45:00Z', 'target': 0, 'sym': 'QQQ'}, sort_keys=True))`,
      out: `{"sym": "QQQ", "t": "2026-05-04T13:45:00Z", "target": 0}`,
    },

    { h: 'Open source frameworks' },
    'You can build on a framework instead of writing every part. At the time of writing (November 2026, checked on GitHub), these are maintained: **NautilusTrader** (a Rust core with Python strategies; its documentation says the same strategy code runs in backtest and live), **LEAN** (the open source engine behind QuantConnect, written in C#, with Python strategies), **zipline-reloaded** (the maintained fork of the Zipline engine from Quantopian, which closed in 2020), **backtesting.py**, and **vectorbt** (vectorised; the open source community edition of a separate PRO version, under Apache 2.0 with the Commons Clause, which limits selling it). **backtrader** remains widely used, but its main repository has had no changes since August 2024.',
    'Before depending on one, check when its code last changed and whether issues get answers, its **licence** (Apache, LGPL, AGPL and GPL put different conditions on your use), whether it handles your assets and data, and how its fill model treats limits, gaps and costs. A framework replaces engine code, not tests: you still test your strategy, your configuration and your use of the framework.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Expected values copied from the output of the code under test.',
        'Global random state, so two runs with one seed differ.',
        'Iterating over sets of symbols in hash order.',
        'Results saved without the configuration, seed, data fingerprint and code version.',
      ],
    },
  ],

  'engine-lab': [
    { h: 'What the lab builds' },
    'The lab assembles the parts of this module into one small **event-driven backtest engine** for several symbols, and then tests it. Each step is a class or function with one job. The algo module’s lab built a single-symbol engine with a long-only portfolio and a fixed fill rule. This one adds several symbols in time slices, signed positions with flips and fees, a fill model with spread, slippage, volume caps, limit orders and a commission schedule, and a test suite that is itself tested.',
    'All bars are made up. Nothing in the lab says the trend strategy is worth trading; it is there to drive the engine. The aim is an engine whose numbers you can trust, so that later, when a strategy looks good, you know the reason is the strategy and not the engine.',

    { h: 'The parts and their contracts' },
    { sub: 'Data handler' },
    'The handler holds the bars as `(t, o, h, l, c, v)` per symbol: time, open, high, low, close, volume. `next_slice()` moves to the next time in the union of all timestamps and returns the bars stamped with it; `history(sym, n)` returns closes up to the current slice. It is the only part that holds the whole dataset.',
    { sub: 'Simulated broker' },
    'The broker queues signed orders, market or limit, and on each slice tries to fill them with the rules of the fills lesson: next open plus or minus the half spread and slippage for market orders, through-not-touch for limits, a volume cap with remainders left working, and a commission of `max(min_fee, per_share × size)`. Its `pending(sym)` method reports what is still waiting.',
    { sub: 'Portfolio and strategy' },
    'The portfolio applies fills with signed positions, averages, flips and fees, and computes equity from marks. The strategy reads history and returns target positions. It never sees orders, fills or cash.',

    { h: 'The order of work on each slice' },
    'The engine loop does three things on every slice, always in this order:',
    {
      list: [
        'Fill orders sent on earlier slices, and pass the fills to the portfolio.',
        'Set the marks to this slice’s closes and record equity.',
        'Ask the strategy for targets and send `target − position − pending` for each symbol where it is not zero.',
      ],
    },
    'This fixed order is a small stand-in for the event queue of the events lesson: fills ahead of new decisions at a shared time. An order sent on one slice can only fill on a later one, so the bar that produced a signal never pays for it.',
    {
      code: `bars = [(20.0, 20.4), (20.5, 20.3), (20.2, 20.6)]
pending, pos, log = 0, 0, []
for i, (o, c) in enumerate(bars):
    if pending:
        log.append((i, pending, round(o + 0.01, 2)))
        pos, pending = pos + pending, 0
    target = 50 if c > o else 0
    pending = target - pos - pending
print(log, pos)`,
      out: `[(1, 50, 20.51), (2, -50, 20.21)] 0`,
    },
    'The first bar rises, so a buy of 50 waits and fills at the next open plus a cent. The second bar falls, so a sell waits and fills at the third open. The third bar rises again and a new buy is pending when the data ends.',

    { h: 'Why pending matters' },
    'When every order fills in full on the next bar, nothing is pending at decision time and `target − position` looks correct. Partial fills break that. Suppose the target is 300 and the cap lets 100 fill per bar. After one bar the position is 100 and 200 are still working. `target − position` sends 200 more, so 400 are working for a target of 300, and each later bar adds more. Subtracting `pending` sends nothing until the shortfall is real. Test the engine on thin data on purpose, so this bug cannot hide.',

    { h: 'Testing the tests' },
    'A test suite is only useful if it fails on broken code. The last coding step writes hand-worked cases for buy, add, reduce, flip and fee, each on a fresh portfolio, and catches crashes as failures. The checks then run the suite against deliberately broken portfolio classes, for example one that realises P&L on a whole flip, one that leaves fees out of realised P&L, one that averages sells into the price. Each must be caught. This is how you find out whether your tests can see the bugs you fear, before a real one meets them.',

    { h: 'What comes after the lab' },
    'A working engine on made-up data is a start, not a result. Before trusting it on real data, add the time-ordered event queue, restamping and stale flags in the data handler, stops and order expiry in the broker, the vectorised cross-check, the lookahead test, the invariant and determinism tests, and saved configuration with every run. Before the paper account, put data, broker and clock behind interfaces, add startup reconciliation and decision logs, and replay a paper day through the backtest. Even then a good backtest is an upper bound on what live trading will give.',
  ],
}
