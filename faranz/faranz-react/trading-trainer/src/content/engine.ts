import type { Module } from '../types'

export const engine: Module = {
  id: 'engine',
  title: 'Building a backtest and trading engine',
  summary:
    'The software design of an engine you can trust: vectorised against event-driven, the event queue, data handlers that cannot see the future, accounting with shorts and flips, fill models, one code path for backtest, paper and live, and the tests that keep it honest.',
  lessons: [
    {
      id: 'engine-design',
      title: 'Vectorised against event-driven engines',
      summary: 'What array code can and cannot model, why path dependence needs a loop, and how to make the two engines check each other.',
      widget: 'engine-paths',
      text: [
        'The algo module showed the two shapes of backtest: **vectorised** code that computes a whole history with NumPy arrays, and **event-driven** code that handles one event at a time. This module is about building the second one well. The first question is when you need it at all.',
        'A vectorised backtest is a formula: `positions[:-1] × returns`, minus costs. It is exact when each position depends only on data, never on what the strategy itself did before. That covers a lot: a fixed-size position from a moving average, a z-score rule, a ranking of stocks.',
        'It breaks on **path dependence**: when what you hold now depends on your own past trades or your account. A stop loss (after it fires you are out until a new signal), sizing by current equity in whole shares, a limit order that waits for three bars, cash running out, a daily loss limit that halts trading, a partial fill. Each needs state carried from bar to bar, which means a loop, which is what an event-driven engine is.',
        { code: `import numpy as np

p = np.array([100, 102, 101, 104, 103.0])
sig = (p > 101).astype(float)      # decided at each close
ret = np.diff(p) / p[:-1]          # ret[t]: close t to close t + 1
pnl = sig[:-1] * ret               # the position decided at t earns ret[t]` },
        'The price of the loop is speed and code. A pure Python event loop handles perhaps tens of thousands of events a second; NumPy handles millions of array elements in the same time. More code also means more places for bugs to hide. So the usual workflow is both: screen ideas with vectorised code, then rebuild the survivors in the event-driven engine.',
        'Use each to check the other. On a strategy with no path dependence (fixed size, no stops, no costs, or the same simple cost model) the two engines must give the same equity curve, to rounding. When they differ, find the first bar where the positions differ: one of the two has a bug, usually a timing one.',
      ],
      rules: [
        'Vectorised is exact only when positions depend on data, not on your own past trades.',
        'Stops, equity-based sizing, waiting orders, cash limits, halts and partial fills are path dependent: they need a loop.',
        'Screen with vectorised code; rebuild survivors event-driven.',
        'On a strategy with no path dependence, both engines must agree to rounding.',
        'Compare floats with a tolerance, never with ==.',
      ],
      questions: [
        {
          kind: 'choice',
          id: 'engine-design-1',
          ask: 'Which of these can a vectorised backtest compute exactly, with array operations and no loop over bars?',
          options: [
            'Long one unit whenever the close is above its 50-day moving average, flat otherwise',
            'The same rule with a 2% stop loss, after which you stay out until the close drops below the average and crosses back',
            'Buying as many whole shares as your current cash allows on each signal',
            'A limit order that waits up to three bars and is cancelled if not filled',
          ],
          answer: 0,
          why: 'The first position depends only on prices. The others depend on what the strategy did before: whether the stop fired, how much cash is left, whether the order is still waiting. That state has to be carried from bar to bar.',
        },
        {
          kind: 'output',
          id: 'engine-design-2',
          ask: 'A vectorised backtest in five lines. What does this print (P&L per bar in percent)?',
          code: `import numpy as np

p = np.array([100, 102, 101, 104, 103.0])
sig = (p > 101).astype(float)
ret = np.diff(p) / p[:-1]
pnl = sig[:-1] * ret
print(np.round(pnl * 100, 2).tolist())`,
          answer: '[0.0, -0.98, 0.0, -0.96]',
          why: 'The signal is [0, 1, 0, 1, 1]. The position decided at close 1 (102 > 101) earns the move to 101, −0.98%; the one decided at close 3 earns the move to 103, −0.96%. `sig[:-1]` pairs each decision with the move after it.',
        },
        {
          kind: 'number',
          id: 'engine-design-3',
          ask: 'An event-driven engine in pure Python handles about 20,000 events a second. You want to run it on one-minute bars for 500 stocks over 10 years (252 days a year, 390 bars a day), one event per bar. How many hours does one run take? One decimal place.',
          answer: 6.8,
          tol: 0.06,
          check: '500 * 10 * 252 * 390 / 20000 / 3600',
          why: 'That is 491.4 million events, about 24,570 seconds or 6.8 hours, for one parameter setting. Vectorised code does the same arithmetic in seconds. This is why you screen with arrays and keep the event-driven engine for the few ideas that survive.',
        },
        {
          kind: 'choice',
          id: 'engine-design-4',
          ask: 'You coded the same moving average rule, fixed size, no stops, in both engines with the same cost model. The vectorised Sharpe is 1.2, the event-driven one 0.7. What do you do?',
          options: [
            'Trust the event-driven number because it is more realistic',
            'Trust the vectorised number because it has less code',
            'Find the first bar where the two position series differ and work out which engine is wrong there',
            'Average the two',
          ],
          answer: 2,
          why: 'With no path dependence the two must agree, so one has a bug. The usual suspect is timing: a position earning the move that created it in the vectorised code, or a fill at the signal close in the loop. The first differing bar points straight at it.',
        },
        {
          kind: 'bug',
          id: 'engine-design-5',
          ask: 'This test compares the equity curves of the two engines. They add up costs in a different order, and the test fails although they agree to 1e-12. Which line is wrong?',
          code: `import numpy as np

def engines_agree(vec_equity, evt_equity):
    a = np.asarray(vec_equity, dtype=float)
    b = np.asarray(evt_equity, dtype=float)
    if a.shape != b.shape:
        return False
    return bool((a == b).all())`,
          line: 8,
          fix: '    return bool(np.allclose(a, b, rtol=0, atol=1e-6))',
          why: 'Floating point addition is not associative: the same numbers added in another order can differ in the last bits. Compare with an absolute tolerance far below a cent and far above rounding noise.',
        },
        {
          kind: 'write',
          id: 'engine-design-6',
          ask: 'Write `stop_positions(close, signal, stop)`, the path-dependent rule. `signal[t]` is 1 or 0 at close t. When flat and armed, a signal of 1 enters long at that close (entry price = close). When long, first check the stop: if `close[t] <= entry × (1 − stop)`, exit and disarm; otherwise a signal of 0 exits. A signal of 0 re-arms. Start flat and armed. Return the list of positions held after each close.',
          starter: `def stop_positions(close, signal, stop):
    # the vectorised version ignores the stop
    return list(signal)`,
          solution: `def stop_positions(close, signal, stop):
    pos, entry, armed, out = 0, 0.0, True, []
    for c, s in zip(close, signal):
        if pos == 1:
            if c <= entry * (1 - stop):
                pos, armed = 0, False
            elif s == 0:
                pos = 0
        elif s == 1 and armed:
            pos, entry = 1, c
        if s == 0:
            armed = True
        out.append(pos)
    return out`,
          tests: `out = stop_positions([100, 101, 98, 97, 99, 102, 103], [1, 1, 1, 1, 0, 1, 1], 0.02)
assert out is not None, "the function returns nothing yet"
assert out == [1, 1, 0, 0, 0, 1, 1], f"stopped at 98 (2% below 100), out until the signal goes to 0 and back to 1: expected [1, 1, 0, 0, 0, 1, 1], got {out}"
assert stop_positions([100, 101, 98, 97], [1, 1, 1, 1], 0.5) == [1, 1, 1, 1], "a stop that is never hit leaves the signal unchanged"
assert stop_positions([10, 9, 11], [0, 1, 0], 0.1) == [0, 1, 0], "a signal of 0 exits"`,
          why: 'The state is three variables, `pos`, `entry` and `armed`, carried from one close to the next. That is exactly what an array formula cannot hold, and it is why a stop loss forces the event-driven version.',
        },
        {
          kind: 'number',
          id: 'engine-design-7',
          ask: 'You have $10,000 and buy as many whole shares as you can of a $37.00 stock, keeping the rest in cash. The stock then rises exactly 10%. What is your equity in dollars? (A vectorised backtest would say $11,000.)',
          answer: 10999,
          tol: 0.01,
          check: '(10000 // 37) * 37 * 1.10 + (10000 - (10000 // 37) * 37)',
          hint: '10,000 ÷ 37 gives 270 whole shares and $10 left over.',
          why: '270 shares cost $9,990 and are worth $10,989 after the rise; with $10 of cash that is $10,999. Small here, but whole shares, cash left idle and minimum sizes add up across thousands of trades, and only a loop sees them.',
        },
        {
          kind: 'choice',
          id: 'engine-design-8',
          ask: 'In the figure, start with the stop off, then set a 5% stop. What happens to the two equity curves?',
          options: [
            'They stay identical: the stop does not change anything',
            'They match with the stop off and part once the stop fires, because the vectorised formula cannot know the strategy was stopped out',
            'They differ even with the stop off',
            'The vectorised curve is always better',
          ],
          answer: 1,
          why: 'With the stop off, positions depend only on prices and both engines give the same curve. A stop makes the position depend on the path since entry. The vectorised formula still holds the position, so from the first stop on, the curves describe different strategies, sometimes better and sometimes worse.',
        },
        {
          kind: 'choice',
          id: 'engine-design-9',
          ask: 'Which of these is a real cost of an event-driven engine?',
          options: [
            'It is slower and has more code in which bugs can hide',
            'It cannot model partial fills',
            'It cannot run the same strategy code live',
            'It always has lookahead bias',
          ],
          answer: 0,
          why: 'The loop is slow in Python and the extra state is more to get wrong. The other three are its strengths: it can model partial fills, it can share code with live trading, and handled one event at a time it makes lookahead harder, not easier.',
        },
        {
          kind: 'design',
          id: 'engine-design-10',
          ask: 'You want to test 300 variants of a breakout idea on five years of 5-minute bars, then trade the best one with a stop and equity-based sizing. Plan which engine you use when, and how you will know both are right.',
          checklist: [
            { point: 'Screen the 300 variants with vectorised code, fixed size, no stops, a simple cost per trade', why: 'Speed matters when most variants will be thrown away.' },
            { point: 'Count all 300 tries when judging the winner', why: 'The best of 300 is biased upward, as the quant module showed.' },
            { point: 'Rebuild the few survivors in the event-driven engine', why: 'Stops and sizing are path dependent and need the loop.' },
            { point: 'Run the event-driven engine with stops and sizing turned off and require the same equity as the vectorised one', why: 'Agreement on the simple case is a test of both engines.' },
            { point: 'Then turn on stops, sizing and the fill model one at a time and look at each change', why: 'You learn what each feature costs or adds, and a bug shows up as a change you cannot explain.' },
            { point: 'Hold out recent data that neither engine has seen until the end', why: 'The engines check the code; only unseen data checks the idea.' },
          ],
          why: 'The two engines are tools for different stages. Making them agree on the simple case is cheap and catches the timing bugs that otherwise flatter every result.',
        },
      ],
    },
    {
      id: 'engine-events',
      title: 'The event queue',
      summary: 'Typed events, a priority queue ordered by time, ties broken by a sequence number, and a clock that never runs backwards.',
      widget: 'engine-queue',
      text: [
        "An engine passes four kinds of **event**. A **market event** carries a new bar or quote. A **signal event** says what the strategy wants. An **order event** says what to send, after risk checks. A **fill event** says what happened: quantity, price, commission. Give each a time and make them small classes (Python's `dataclasses` are a good fit), so a typo in a field name fails loudly instead of quietly creating a new dictionary key.",
        "The algo module's queue was first in, first out. That is enough while events arrive in time order. It breaks as soon as you schedule something for later: a fill that arrives 200 milliseconds after its order, an order that expires in three bars, a flatten-everything at 15:55, or bars that were loaded into the queue ahead of time. The queue must instead hand out the event with the **earliest time**: a priority queue, which Python provides as `heapq`.",
        { code: `import heapq, itertools

seq = itertools.count()
heap = []
heapq.heappush(heap, (time, priority, next(seq), event))
time, _, _, event = heapq.heappop(heap)    # earliest time first` },
        'Two things go in the key after the time. A **priority** orders events that share a timestamp: put fills before new market data, so the strategy sees its updated position before it decides again. A **sequence number** breaks any remaining tie in the order events were pushed. Without it `heapq` compares the events themselves, which raises a `TypeError` for dataclasses and dictionaries, and only when two times happen to tie, which is why the bug hides until you add a second symbol.',
        'The engine keeps a **simulation clock**: the time of the event being handled. It jumps from event to event and must never go backwards; an event scheduled before the current time is a bug, and the queue should refuse it. Strategy code reads the time from the event or from the engine clock, never from `datetime.now()`, which in a backtest returns the date you ran it.',
      ],
      rules: [
        'Four event types: market, signal, order, fill. Each has a time.',
        'Order the queue by (time, priority, sequence): earliest first, fills before bars at the same time, then first pushed.',
        'Without the sequence number, tied times make heapq compare events and crash.',
        'The clock only moves forward. Refuse events scheduled in the past.',
        'Read the time from the event, never from the wall clock.',
      ],
      questions: [
        {
          kind: 'output',
          id: 'engine-events-1',
          ask: 'Four events pushed in this order onto a heap of (time, priority, sequence, name). What does this print?',
          code: `import heapq

q = []
heapq.heappush(q, (2, 1, 0, 'bar SPY'))
heapq.heappush(q, (1, 1, 1, 'bar QQQ'))
heapq.heappush(q, (2, 0, 2, 'fill SPY'))
heapq.heappush(q, (1, 1, 3, 'bar SPY'))
print([heapq.heappop(q)[3] for _ in range(4)])`,
          answer: "['bar QQQ', 'bar SPY', 'fill SPY', 'bar SPY']",
          why: 'Time 1 comes first; its two bars tie on priority, so the sequence number keeps them in the order pushed. At time 2 the fill has priority 0 and goes before the bar, so the strategy sees its new position before the next bar.',
        },
        {
          kind: 'choice',
          id: 'engine-events-2',
          ask: 'Why does the heap key carry a sequence number after the time and the priority?',
          options: [
            'To make the heap faster',
            'Without it, two events with the same time and priority make heapq compare the event objects, which crashes for dataclasses and dicts, and their order would not be the order pushed',
            'To count how many events were processed',
            'Brokers require one',
          ],
          answer: 1,
          why: 'Tuples compare item by item, so a tie on the first items falls through to the event. A counter that only goes up makes every key unique and keeps tied events first in, first out.',
        },
        {
          kind: 'bug',
          id: 'engine-events-3',
          ask: "This queue worked on one symbol. With two symbols it crashes with `TypeError: '<' not supported` on the first bar where both have the same timestamp. Which line is wrong?",
          code: `import heapq
import itertools

class EventQueue:
    def __init__(self):
        self.heap = []
        self.seq = itertools.count()

    def push(self, time, event):
        heapq.heappush(self.heap, (time, event))

    def pop(self):
        return heapq.heappop(self.heap)[-1]`,
          line: 10,
          fix: '        heapq.heappush(self.heap, (time, next(self.seq), event))',
          why: 'With one symbol no two events shared a time, so the events were never compared. The counter was created and never used: put `next(self.seq)` between the time and the event.',
        },
        {
          kind: 'write',
          id: 'engine-events-4',
          ask: 'Write `EventQueue` with `push(time, priority, event)`, `pop()` and `len()`. `pop` returns the event with the earliest time, then lowest priority, then the one pushed first, and sets `self.now` to its time. `push` raises `ValueError` for a time earlier than `self.now`. Events may be dicts, which cannot be compared.',
          starter: `import heapq
import itertools

class EventQueue:
    def __init__(self):
        self.items = []
        self.now = None

    def push(self, time, priority, event):
        self.items.append(event)

    def pop(self):
        return self.items.pop(0)

    def __len__(self):
        return len(self.items)`,
          solution: `import heapq
import itertools

class EventQueue:
    def __init__(self):
        self.heap = []
        self.seq = itertools.count()
        self.now = None

    def push(self, time, priority, event):
        if self.now is not None and time < self.now:
            raise ValueError('cannot schedule an event in the past')
        heapq.heappush(self.heap, (time, priority, next(self.seq), event))

    def pop(self):
        time, _, _, event = heapq.heappop(self.heap)
        self.now = time
        return event

    def __len__(self):
        return len(self.heap)`,
          tests: `q = EventQueue()
q.push(2, 1, {'k': 'bar2'})
q.push(1, 1, {'k': 'bar1a'})
q.push(1, 1, {'k': 'bar1b'})
q.push(2, 0, {'k': 'fill2'})
out = q.pop()
assert out is not None, "pop returns nothing yet"
assert out['k'] == 'bar1a', f"the earliest time comes first, got {out}"
assert q.pop()['k'] == 'bar1b', "ties on time and priority keep the order pushed"
assert q.pop()['k'] == 'fill2', "at time 2 the fill (priority 0) comes before the bar (priority 1)"
assert q.now == 2, f"now is the time of the last event popped, got {q.now}"
assert len(q) == 1, "one event left"
try:
    q.push(1, 0, {'k': 'late'})
    assert False, "pushing an event at time 1 when now is 2 must raise ValueError"
except ValueError:
    pass
q.push(2, 5, {'k': 'same time is fine'})
assert len(q) == 2, "an event at the current time is allowed"`,
          why: 'Twenty lines, and the engine now handles any number of symbols, scheduled fills and timed events in the right order. The check on the past turns a silent timing bug into an exception at the line that caused it.',
        },
        {
          kind: 'choice',
          id: 'engine-events-5',
          ask: 'An order sent on the 10:00 bar fills at the 10:01 open. The 10:01 bar and the fill carry the same timestamp. Which should the engine handle first?',
          options: [
            'The fill, so the strategy sees its new position before it reacts to the 10:01 bar',
            'The bar, because market data always comes first',
            'Either: the order does not matter',
            'Both at once in separate threads',
          ],
          answer: 0,
          why: 'If the bar goes first, the strategy still believes it is flat and may send the same order again. Giving fills a lower priority number at a shared time removes that duplicate-order bug at its source.',
        },
        {
          kind: 'number',
          id: 'engine-events-6',
          ask: 'An engine trades 3 symbols on one-minute bars, 390 bars a day each. On 10% of bars the strategy emits a signal, and each signal becomes one order and one fill. How many events does the queue handle in a day?',
          answer: 1521,
          tol: 0.5,
          check: '3 * 390 + 3 * (0.1 * 3 * 390)',
          why: '1,170 market events, plus 117 signals, 117 orders and 117 fills: 1,521. Market data dominates, which is why the speed of the data path matters more than the speed of order handling.',
        },
        {
          kind: 'output',
          id: 'engine-events-7',
          ask: 'Three bars are loaded into a time-ordered queue. The first bar creates an order; the order creates a fill one step later. What does this print?',
          code: `import heapq, itertools

seq = itertools.count()
q = []
def push(t, prio, kind):
    heapq.heappush(q, (t, prio, next(seq), kind))

for t in (1, 2, 3):
    push(t, 1, 'bar')
log = []
while q:
    t, _, _, kind = heapq.heappop(q)
    log.append(f'{t}:{kind}')
    if kind == 'bar' and t == 1:
        push(t, 2, 'order')
    elif kind == 'order':
        push(t + 1, 0, 'fill')
print(' '.join(log))`,
          answer: '1:bar 1:order 2:fill 2:bar 3:bar',
          why: 'The order is pushed at time 1 and handled before anything at time 2. Its fill lands at time 2 with priority 0, ahead of the bar already waiting there. With a first-in, first-out queue the fill would come after bar 3.',
        },
        {
          kind: 'choice',
          id: 'engine-events-8',
          ask: 'In the figure, choose the first-in, first-out queue with all bars loaded at the start and step through. What goes wrong?',
          options: [
            'Nothing: it gives the same order as the time queue',
            'The fills are handled after every bar, so the clock jumps backwards and the strategy decides on bars while still thinking it is flat',
            'The bars come out in reverse order',
            'The queue runs out of memory',
          ],
          answer: 1,
          why: 'Appending to the end of a queue that already holds the whole future puts each new event after all of it. The readout counts the times the clock went backwards. A time-ordered queue puts each fill where it belongs.',
        },
        {
          kind: 'bug',
          id: 'engine-events-9',
          ask: 'This strategy should flatten its positions from 15:55. In the backtest it either never flattens or flattens on every bar, depending on when you run it. Which line is wrong?',
          code: `from datetime import datetime, time

def on_bar(self, event):
    if datetime.now().time() >= time(15, 55):
        return self.flatten(event)
    return self.signal(event)`,
          line: 4,
          fix: '    if event.time.time() >= time(15, 55):',
          why: '`datetime.now()` is the time on your computer while the backtest runs, not the time of the bar. Every time-of-day rule must read the event time, which in live trading is also the right answer, so the same line serves both.',
        },
        {
          kind: 'design',
          id: 'engine-events-10',
          ask: 'Write down the event types for your engine: their fields, and the priority each gets at a shared timestamp.',
          checklist: [
            { point: 'Market event: time, symbol, open, high, low, close, volume (or bid, ask and sizes for quotes)', why: 'One format for history and live, so the strategy cannot tell which it is reading.' },
            { point: 'Signal or target event: time, symbol, target position, and the reason', why: 'The reason makes the decision log readable later.' },
            { point: 'Order event: time, client order id, symbol, signed quantity, type (market, limit, stop), limit or stop price, expiry', why: 'Everything the broker needs, and an id to match fills to it.' },
            { point: 'Fill event: time, order id, symbol, signed quantity filled, price, commission', why: 'Positions and cash are built only from these.' },
            { point: 'Timer events for scheduled actions such as flatten at 15:55 or cancel after three bars', why: 'Time-based rules become events in the same queue instead of special cases.' },
            { point: 'A priority order at one timestamp: fills, then timers, then market data, then signals and orders', why: 'The strategy then always decides on its current position.' },
            { point: 'Times in UTC, as one type throughout (all datetimes or all integer nanoseconds)', why: 'Mixing types or zones breaks the ordering, as the algo module warned.' },
          ],
          why: 'The event types are the contract between every part of the engine. Getting them right early makes later parts, and the switch to live, much easier.',
        },
      ],
    },
    {
      id: 'engine-data',
      title: 'Data handlers',
      summary: 'Feeding bars one time slice at a time, an interface that cannot show the future, several symbols, missing bars and warm-up.',
      text: [
        'The **data handler** has two jobs: hand out bars in time order, and answer questions about the past. Both can be built so that lookahead is impossible rather than merely avoided. The handler keeps a cursor at the current time; `history(symbol, n)` returns at most the last n bars up to the cursor, and there is no method that returns anything after it. A strategy cannot misuse data it cannot reach.',
        "With several symbols, deliver a **time slice**: every bar stamped with the same time, together, before the strategy acts. If the strategy reacts to SPY at 10:01 before QQQ's 10:01 bar has arrived, a pairs or ranking strategy compares one symbol now with another a minute ago. Merge the symbols on the union of their timestamps; `heapq.merge` combines several time-sorted streams without loading them all.",
        'Know how your bars are **labelled**. A 5-minute bar covering 10:00 to 10:05 may be stamped 10:00 (start) or 10:05 (end). Its close is known only at 10:05. If the vendor stamps the start and your engine treats the stamp as the moment the bar is known, every decision sees five minutes of the future. Restamp bars with their end time when you load them.',
        'Thin symbols have **missing bars**: no trade, no bar. Do not invent one by interpolating, which uses the next real price. You may carry the last close forward for valuing a position, but mark it **stale** with its age, and never fill an order at a stale price. A strategy that needs n bars of history also needs a **warm-up**: no signals until n bars exist.',
        'Do not load everything. Ten years of minute bars for a few hundred stocks is tens of gigabytes. Stream them from files sorted by time with generators, one slice at a time, which is also how live data arrives.',
      ],
      rules: [
        'The handler keeps a cursor; history ends at the cursor. No method returns the future.',
        'Deliver all bars of one timestamp together before the strategy acts.',
        'Stamp bars with the time they become known: the end of the interval.',
        'Missing bars: carry forward for marking, flag as stale, never fill at a stale price, never interpolate.',
        'No signal before the warm-up history exists.',
        'Stream, do not load: generators and time-sorted merges.',
      ],
      questions: [
        {
          kind: 'output',
          id: 'engine-data-1',
          ask: 'Two time-sorted streams of (time, symbol) merged by `heapq.merge`. What does this print?',
          code: `import heapq

spy = [(1, 'SPY'), (2, 'SPY'), (4, 'SPY')]
qqq = [(2, 'QQQ'), (3, 'QQQ')]
print([s for t, s in heapq.merge(spy, qqq)])`,
          answer: "['SPY', 'QQQ', 'SPY', 'QQQ', 'SPY']",
          why: 'The merge yields in time order without building one big list. At time 2 the tuples tie on time and fall through to the symbol, and "QQQ" sorts before "SPY". That tie-break is alphabetical by accident; group by time into slices so it does not matter.',
        },
        {
          kind: 'write',
          id: 'engine-data-2',
          ask: 'Write `DataHandler`. `bars` maps a symbol to its list of `(time, close)`, sorted by time. `next_slice()` moves to the next time in the union of all times and returns `(time, {symbol: close})` for the symbols that have a bar then, or `None` at the end. `history(sym, n)` returns the last n closes of `sym` up to and including the current time.',
          starter: `class DataHandler:
    def __init__(self, bars):
        self.bars = bars

    def next_slice(self):
        return None

    def history(self, sym, n):
        return [c for t, c in self.bars[sym]][-n:]`,
          solution: `class DataHandler:
    def __init__(self, bars):
        self.bars = bars
        self.times = sorted({t for rows in bars.values() for t, _ in rows})
        self.i = -1
        self.ptr = {s: 0 for s in bars}
        self.seen = {s: [] for s in bars}

    def next_slice(self):
        self.i += 1
        if self.i >= len(self.times):
            return None
        t = self.times[self.i]
        out = {}
        for s, rows in self.bars.items():
            k = self.ptr[s]
            if k < len(rows) and rows[k][0] == t:
                out[s] = rows[k][1]
                self.seen[s].append(rows[k][1])
                self.ptr[s] = k + 1
        return t, out

    def history(self, sym, n):
        return self.seen[sym][-n:]`,
          tests: `d = DataHandler({'SPY': [(1, 10.0), (2, 11.0), (3, 12.0)], 'XYZ': [(1, 5.0), (3, 5.5)]})
out = d.next_slice()
assert out is not None, "next_slice returns nothing yet"
assert out == (1, {'SPY': 10.0, 'XYZ': 5.0}), f"time 1 has both symbols, got {out}"
assert d.history('SPY', 5) == [10.0], f"after one slice, history must hold only the first close, got {d.history('SPY', 5)}"
assert d.next_slice() == (2, {'SPY': 11.0}), "XYZ has no bar at time 2"
assert d.history('XYZ', 5) == [5.0], "XYZ history does not grow without a bar"
assert d.next_slice() == (3, {'SPY': 12.0, 'XYZ': 5.5}), "time 3 has both again"
assert d.history('SPY', 2) == [11.0, 12.0], "the last two closes"
assert d.next_slice() is None, "None at the end"`,
          why: 'The strategy only ever gets `seen`, which grows one slice at a time. There is no index into the future to get wrong. The starter shows the usual mistake: `history` reading straight from the full list.',
        },
        {
          kind: 'bug',
          id: 'engine-data-3',
          ask: '`self.i` is the index of the current bar. `history` should return the last n closes up to and including it, but the backtest looks too good. Which line is wrong?',
          code: `class Handler:
    def __init__(self, closes):
        self.closes = closes
        self.i = -1

    def step(self):
        self.i += 1

    def history(self, n):
        return self.closes[max(0, self.i - n + 1):self.i + 2]`,
          line: 10,
          fix: '        return self.closes[max(0, self.i - n + 1):self.i + 1]',
          why: 'A slice end is exclusive, so `self.i + 1` includes bar i and `self.i + 2` includes the next bar too. One character hands the strategy tomorrow. A test that changes a later price and checks that history is unchanged catches it.',
        },
        {
          kind: 'choice',
          id: 'engine-data-4',
          ask: 'Your vendor stamps each 5-minute bar with its start time. The bar stamped 10:00 holds trades from 10:00 to 10:05. When can your strategy first act on its close?',
          options: ['10:00', '10:05', '10:10', 'Any time that day'],
          answer: 1,
          why: 'The close is the last trade before 10:05. If your engine treats the 10:00 stamp as the moment the bar is known, every signal sees five minutes ahead. Restamp to the end time on load.',
        },
        {
          kind: 'number',
          id: 'engine-data-5',
          ask: "A strategy uses a 50-bar moving average of 5-minute bars, and the session has 78 such bars. With no history from earlier days, on how many of the first day's 78 bars does the average exist?",
          answer: 29,
          tol: 0.5,
          check: '78 - 50 + 1',
          why: 'The first average exists at the 50th bar, and from then on at every bar: 78 − 50 + 1 = 29. Either load earlier days for the warm-up or accept that the strategy is blind for most of the first day; never fill the gap with a shorter average silently.',
        },
        {
          kind: 'choice',
          id: 'engine-data-6',
          ask: 'At 10:01 SPY has a bar but the thin stock XYZ does not. Your strategy holds XYZ. What should the data handler do?',
          options: [
            "Carry XYZ's last close forward for valuing the position, mark it stale with its age, and let no order fill at that price",
            "Interpolate between XYZ's 10:00 and 10:02 closes",
            'Drop the 10:01 slice for both symbols',
            "Fill XYZ with SPY's return for that minute",
          ],
          answer: 0,
          why: 'Interpolating uses the 10:02 price, which is the future. Dropping slices desynchronises the whole engine. A stale flag lets the strategy and the fill model treat an old price as old.',
        },
        {
          kind: 'output',
          id: 'engine-data-7',
          ask: 'Carrying a price forward with its age. What does this print?',
          code: `xyz = [5.0, None, None, 5.2]
last, age, out = None, 0, []
for c in xyz:
    if c is None:
        age += 1
    else:
        last, age = c, 0
    out.append((last, age))
print(out)`,
          answer: '[(5.0, 0), (5.0, 1), (5.0, 2), (5.2, 0)]',
          why: 'The value is carried forward and the age says how old it is. A fill model can refuse any price older than, say, one bar, and a risk check can halt if a held position has been stale too long.',
        },
        {
          kind: 'bug',
          id: 'engine-data-8',
          ask: 'This groups time-sorted `(time, symbol, close)` rows into slices. It returns an extra empty slice `(None, {})` at the start. Which line is wrong?',
          code: `def time_slices(rows):
    out, cur, cur_t = [], {}, None
    for t, sym, close in rows:
        if t != cur_t:
            out.append((cur_t, cur))
            cur = {}
        cur_t = t
        cur[sym] = close
    if cur:
        out.append((cur_t, cur))
    return out`,
          line: 4,
          fix: '        if t != cur_t and cur:',
          why: 'On the first row the time differs from `None` and the empty starting slice is appended. A strategy handed an empty slice at time `None` may crash, or worse, act on it. Only close a slice that has something in it.',
        },
        {
          kind: 'write',
          id: 'engine-data-9',
          numpy: true,
          ask: 'Write `lookahead_leaks(feature, prices, seed=0)`: a test for any feature function. For each t from 0 to n − 2, multiply every price after t by random factors between 0.5 and 1.5 (`np.random.default_rng(seed).uniform`), recompute the feature, and record t if value t changed (use `np.allclose` with `equal_nan=True`). Return the list of such t.',
          starter: `import numpy as np

def lookahead_leaks(feature, prices, seed=0):
    p = np.asarray(prices, dtype=float)
    base = feature(p)
    return []`,
          solution: `import numpy as np

def lookahead_leaks(feature, prices, seed=0):
    p = np.asarray(prices, dtype=float)
    base = feature(p)
    rng = np.random.default_rng(seed)
    leaks = []
    for t in range(len(p) - 1):
        q = p.copy()
        q[t + 1:] = q[t + 1:] * rng.uniform(0.5, 1.5, len(p) - t - 1)
        if not np.allclose(base[t], feature(q)[t], equal_nan=True):
            leaks.append(t)
    return leaks`,
          tests: `def trailing_mean(p):
    out = np.full(len(p), np.nan)
    for t in range(2, len(p)):
        out[t] = p[t - 2:t + 1].mean()
    return out
def centred_mean(p):
    out = np.full(len(p), np.nan)
    for t in range(1, len(p) - 1):
        out[t] = p[t - 1:t + 2].mean()
    return out
prices = np.linspace(100, 110, 12)
out = lookahead_leaks(trailing_mean, prices)
assert out is not None, "the function returns nothing yet"
assert out == [], f"a trailing mean uses only the past: no leaks, got {out}"
leaks = lookahead_leaks(centred_mean, prices)
assert leaks == list(range(1, 11)), f"a centred mean uses the next price at every t from 1 to 10, got {leaks}"
assert lookahead_leaks(lambda p: p / p[-1], prices) == list(range(11)), "dividing by the last price leaks everywhere"`,
          why: 'This test knows nothing about the feature: it only checks that the past does not depend on the future. Run it on every feature and indicator you write. It catches centred windows, normalising by the whole series, and off-by-one slices alike.',
        },
        {
          kind: 'number',
          id: 'engine-data-10',
          ask: 'One-minute bars for 500 stocks over 10 years (252 days, 390 bars a day), with 5 fields per bar stored as 8-byte floats. How many gigabytes is that? Use 1 GB = 10⁹ bytes, one decimal place.',
          answer: 19.7,
          tol: 0.06,
          check: '500 * 10 * 252 * 390 * 5 * 8 / 1e9',
          why: 'About 491 million bars × 40 bytes = 19.7 GB, more memory than most laptops have, before timestamps. A handler that streams slices from time-sorted files needs only one slice at a time, and it works the same way for live data.',
        },
        {
          kind: 'design',
          id: 'engine-data-11',
          ask: 'Design the data handler for a strategy that trades SPY against a thinly traded stock on one-minute bars.',
          checklist: [
            { point: 'Bars restamped to their end time when loaded, all in UTC', why: 'Removes the start-stamp lookahead and time zone bugs before anything else sees the data.' },
            { point: 'Slices built on the union of timestamps; both symbols delivered together', why: 'The strategy compares the two at the same moment.' },
            { point: 'Missing bars for the thin stock carried forward with an age, never interpolated', why: 'Interpolation uses the next price; the age lets later parts decide.' },
            { point: 'No trading signal when either price is stale beyond a set age', why: 'A spread computed from an old price is not a real spread.' },
            { point: 'A history method that ends at the cursor, and nothing that reaches past it', why: 'Lookahead becomes impossible, not only unlikely.' },
            { point: 'A warm-up period loaded from earlier days', why: 'The lookback window exists from the first bar of the test.' },
            { point: 'The lookahead test from this lesson run on every feature', why: 'It checks the features, which the handler cannot protect.' },
          ],
          why: 'Most bad backtests are bad data handling. A handler that enforces time order and staleness removes whole classes of bug for every strategy that runs on it.',
        },
      ],
    },
    {
      id: 'engine-portfolio',
      title: 'Portfolio and accounting',
      summary: 'Signed positions with shorts and flips, average price, realised and unrealised P&L, multipliers and fees, marking to market, and the identity that checks it all.',
      widget: 'engine-ledger',
      text: [
        'The algo module kept a long-only position with an average cost. A real engine needs **signed** positions: +100 is long, −100 is short. Every fill changes **cash** by `−qty × price × multiplier − fee`. A buy (positive qty) spends cash; a sell, including a short sale, brings it in. The **multiplier** is 1 for shares and 100 for a standard US equity option contract.',
        'The **average price** changes only when a fill adds to the position in the same direction: it becomes the quantity-weighted average. A fill in the other direction **realises** P&L on the part it closes, `closed × (price − avg) × sign × multiplier`, where sign is +1 for a long and −1 for a short, and leaves the average unchanged. If the fill is bigger than the position, it **flips** it: the old position closes in full, and the rest opens at the fill price as the new average.',
        'Long 100 at $20. Sell 250 at $22. The first 100 close and realise 100 × $2 = $200. The other 150 open a short at $22. At a mark of $21 the short shows **unrealised** P&L of (21 − 22) × −150 = +$150.',
        '**Marking to market** values open positions at a current price: equity = cash + Σ position × mark × multiplier. For shares the last close is usual. For options the last trade can be hours old; the mid of the bid and ask is the common mark, and the bid (for longs) is the cautious one.',
        'Everything must satisfy one identity: **equity − starting cash = realised + unrealised**, with fees counted in realised. Check it after every event in tests. **FIFO** (first in, first out: sell the oldest lots first) gives different realised P&L per trade than average cost, but the same total once flat. Which method your tax return uses depends on your country and broker; this is not tax advice.',
      ],
      rules: [
        'Cash moves by −qty × price × multiplier − fee on every fill.',
        'Adding moves the average price; reducing realises P&L and leaves it alone.',
        'A fill bigger than the position closes it in full and opens the rest at the fill price.',
        'Equity = cash + Σ position × mark × multiplier.',
        'Check: equity − start = realised + unrealised, fees in realised.',
        'Mark options at the mid, not a stale last trade.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'engine-portfolio-1',
          ask: 'You are short 100 shares at an average of $50.00 and buy back 60 at $47.00. What P&L is realised, in dollars?',
          answer: 180,
          check: '60 * (47.00 - 50.00) * -1',
          why: 'For a short the sign is −1: 60 × (47 − 50) × −1 = +$180. The 40 still short keep their $50 average; their P&L stays unrealised until they are bought back.',
        },
        {
          kind: 'number',
          id: 'engine-portfolio-2',
          ask: 'Long 100 at $20.00. You sell 250 at $22.00. The price is now $21.00. What is your total P&L, realised plus unrealised, in dollars?',
          answer: 350,
          check: '100 * (22 - 20) + (21 - 22) * -150',
          why: 'Selling 250 closes the 100 long for +$200 and opens 150 short at $22. At $21 the short is up 150 × $1 = $150. Total $350. Equity tells the same story: no fees, so equity − start = $350.',
        },
        {
          kind: 'number',
          id: 'engine-portfolio-3',
          ask: 'You buy 3 option contracts at $2.40 and sell them at $3.10. The multiplier is 100 and fees are $0.65 per contract on each side. What is the net P&L in dollars?',
          answer: 206.1,
          tol: 0.01,
          check: '3 * 100 * (3.10 - 2.40) - 6 * 0.65',
          why: '3 × 100 × $0.70 = $210, minus 6 × $0.65 = $3.90 of fees: $206.10. Forget the multiplier and the engine reports $2.10 − $3.90, a loss, on a trade that made money.',
        },
        {
          kind: 'output',
          id: 'engine-portfolio-4',
          ask: 'Cash from fills, then equity at a mark. What does this print?',
          code: `start = 10000.0
cash = start
fills = [(100, 20.0), (-100, 21.0), (-50, 21.5)]
for qty, price in fills:
    cash -= qty * price
position = sum(q for q, _ in fills)
mark = 20.0
equity = cash + position * mark
print(position, cash, equity - start)`,
          answer: '-50 11175.0 175.0',
          why: 'Cash: −2,000, +2,100, +1,075. The position is short 50. Equity is 11,175 − 50 × 20 = 10,175. Check: the round trip realised $100 and the short is up 50 × $1.50 = $75. Cash and positions alone give the P&L; the realised and unrealised split must agree with them.',
        },
        {
          kind: 'bug',
          id: 'engine-portfolio-5',
          ask: 'This handles one fill against a signed position. Selling 250 when long 100 at $20, at $22, it reports $500 realised instead of $200. Which line is wrong?',
          code: `def on_fill(pos, avg, qty, price):
    realised = 0.0
    if pos == 0 or (pos > 0) == (qty > 0):
        avg = (avg * pos + price * qty) / (pos + qty)
    else:
        closed = min(abs(qty), abs(pos))
        realised = abs(qty) * (price - avg) * (1 if pos > 0 else -1)
        if abs(qty) > abs(pos):
            avg = price
    return pos + qty, avg, realised`,
          line: 7,
          fix: '        realised = closed * (price - avg) * (1 if pos > 0 else -1)',
          why: 'Only the 100 shares that were held can realise anything; the other 150 open a new short at $22 and have made nothing yet. The variable `closed` was computed for this and then not used.',
        },
        {
          kind: 'write',
          id: 'engine-portfolio-6',
          ask: 'Write `Portfolio` for several symbols with signed positions. `on_fill(sym, qty, price, fee=0.0, mult=1)` updates cash, position, average price and realised P&L (fees count against realised), handling adds, reductions and flips; a flat position has average 0. `unrealised(marks)` and `equity(marks)` take a dict of prices.',
          starter: `class Portfolio:
    def __init__(self, cash):
        self.cash = cash
        self.pos = {}
        self.avg = {}
        self.mult = {}
        self.realised = 0.0

    def on_fill(self, sym, qty, price, fee=0.0, mult=1):
        self.pos[sym] = self.pos.get(sym, 0) + qty

    def unrealised(self, marks):
        return 0.0

    def equity(self, marks):
        return self.cash`,
          solution: `class Portfolio:
    def __init__(self, cash):
        self.cash = cash
        self.pos = {}
        self.avg = {}
        self.mult = {}
        self.realised = 0.0

    def on_fill(self, sym, qty, price, fee=0.0, mult=1):
        self.mult[sym] = mult
        pos = self.pos.get(sym, 0)
        avg = self.avg.get(sym, 0.0)
        self.cash -= qty * price * mult + fee
        self.realised -= fee
        if pos == 0 or (pos > 0) == (qty > 0):
            avg = (avg * pos + price * qty) / (pos + qty)
        else:
            closed = min(abs(qty), abs(pos))
            sign = 1 if pos > 0 else -1
            self.realised += closed * (price - avg) * sign * mult
            if abs(qty) > abs(pos):
                avg = price
        pos += qty
        self.pos[sym] = pos
        self.avg[sym] = avg if pos != 0 else 0.0

    def unrealised(self, marks):
        return sum((marks[s] - self.avg[s]) * q * self.mult[s] for s, q in self.pos.items() if q)

    def equity(self, marks):
        return self.cash + sum(q * marks[s] * self.mult[s] for s, q in self.pos.items() if q)`,
          tests: `p = Portfolio(10000.0)
p.on_fill('SPY', 100, 50.0)
assert abs(p.cash - 5000.0) < 1e-9, f"buying 100 at 50 leaves 5,000, got {p.cash}"
p.on_fill('SPY', -250, 52.0)
assert p.pos['SPY'] == -150, f"long 100, sell 250: short 150, got {p.pos['SPY']}"
assert abs(p.realised - 200.0) < 1e-9, f"only the 100 held realise: 100 x 2 = 200, got {p.realised}"
assert abs(p.avg['SPY'] - 52.0) < 1e-9, f"the new short opens at the fill price 52, got {p.avg['SPY']}"
out = p.unrealised({'SPY': 51.0})
assert out is not None, "unrealised returns nothing yet"
assert abs(out - 150.0) < 1e-9, f"short 150 from 52, mark 51: +150, got {out}"
eq = p.equity({'SPY': 51.0})
assert abs(eq - 10350.0) < 1e-9, f"equity is cash 18,000 minus 150 x 51, got {eq}"
assert abs(eq - 10000.0 - p.realised - p.unrealised({'SPY': 51.0})) < 1e-9, "equity - start must equal realised + unrealised"
p.on_fill('SPY_C', 2, 1.50, fee=1.30, mult=100)
p.on_fill('SPY_C', -2, 2.00, fee=1.30, mult=100)
assert p.pos['SPY_C'] == 0 and p.avg['SPY_C'] == 0.0, "flat after the round trip, average 0"
assert abs(p.realised - (200 + 100 - 2.60)) < 1e-9, f"the option round trip adds 2 x 100 x 0.50 - 2.60 of fees, got {p.realised}"
p.on_fill('QQQ', -10, 400.0)
p.on_fill('QQQ', -10, 410.0)
assert abs(p.avg['QQQ'] - 405.0) < 1e-9, "adding to a short averages the price too"`,
          why: 'Three cases: add (move the average), reduce (realise, keep the average), flip (realise on what was held, restart the average at the fill). The identity test in the middle is the one to keep in your own test suite.',
        },
        {
          kind: 'choice',
          id: 'engine-portfolio-7',
          ask: 'You hold 5 calls. The last trade was $1.20 two hours ago; the quote now is bid $0.80, ask $1.00. At what price should the engine mark them for its equity and risk checks?',
          options: [
            '$1.20, the last trade',
            '$0.90, the mid, or $0.80, the bid, if you want the cautious value',
            '$1.00, the ask',
            'The average price you paid',
          ],
          answer: 1,
          why: 'An old last trade overstates the position by $150 here (5 × 100 × $0.30). The mid is the usual mark; the bid is what you could sell at now, which suits a loss limit. Never mark at cost: that hides losses until you sell.',
        },
        {
          kind: 'number',
          id: 'engine-portfolio-8',
          ask: 'Buy 100 at $10, buy 100 at $12, then sell 100 at $13. Using FIFO (the oldest shares are sold first), what P&L is realised, in dollars?',
          answer: 300,
          check: '100 * (13 - 10)',
          why: 'FIFO sells the $10 lot: 100 × $3 = $300. Average cost ($11) would realise $200. The $100 difference is still there, unrealised, in the shares left: FIFO leaves them at $12, average cost at $11.',
        },
        {
          kind: 'choice',
          id: 'engine-portfolio-9',
          ask: 'Same trades, and then you sell the other 100 at $13 too. How does total realised P&L compare under FIFO and average cost?',
          options: [
            'Both are $500: once flat, the methods agree on the total',
            'FIFO is higher by $100',
            'Average cost is higher by $100',
            'They can never be compared',
          ],
          answer: 0,
          why: 'Total P&L is what came in minus what went out: 2,600 − 2,200 = $500 either way. The method only moves P&L between trades and between realised and unrealised. That makes it matter for tax timing and per-trade statistics, not for the total.',
        },
        {
          kind: 'choice',
          id: 'engine-portfolio-10',
          ask: 'In the figure, buy 100, move the mark, then sell 300. What happens to the average price and to realised P&L?',
          options: [
            'The average becomes the mean of all fills; realised counts 300 shares',
            'The 100 long close and realise their P&L; the average becomes the sell price for the new 200 short',
            'Nothing is realised until the position is flat',
            'The average stays at the buy price',
          ],
          answer: 1,
          why: 'The flip closes everything that was held, at the fill price, and opens the rest fresh. Watch the identity line in the figure: it holds after every button.',
        },
        {
          kind: 'design',
          id: 'engine-portfolio-11',
          ask: "Over a year, your engine's final equity and the sum of its daily P&L reports differ by $37. How do you find the cause?",
          checklist: [
            { point: 'Check the identity equity − start = realised + unrealised day by day and find the first day it breaks', why: 'A one-time break points at one event; a slow drift points at a rounding or fee rule.' },
            { point: 'On that day, replay the fills one at a time and recompute cash by hand', why: 'Cash comes only from fills, so it is the easiest number to verify.' },
            { point: 'Look for flips, partial closes and fills with fees', why: 'These are where accounting code has the most branches.' },
            { point: 'Check the multiplier on every option fill', why: 'A missing ×100 makes a large error on a few trades.' },
            { point: 'Check that the daily report and the final equity use the same marks (close, mid or bid)', why: 'Two marking rules give two answers for the same positions.' },
            { point: 'Check for rounding of prices or cash to cents in one place but not the other', why: 'Small differences added over thousands of fills make a few dollars.' },
            { point: 'Add the failing case as a unit test before fixing it', why: 'The bug then cannot return unnoticed.' },
          ],
          why: 'An accounting gap is never "only rounding" until you have found it. Every bigger bug in a trading engine shows up first as a small number that does not add up.',
        },
      ],
    },
    {
      id: 'engine-fills',
      title: 'Simulating fills',
      summary: 'Next-bar timing, spread and slippage, partial fills capped by volume, limit and stop logic inside a bar, commissions, and why the fill model should lean pessimistic.',
      widget: 'engine-fills',
      text: [
        'In a backtest no order reaches a market, so a **fill model** decides three things: when the order fills, at what price, and how much of it. Every choice is a guess about the past, and the guesses that flatter the result are the ones live trading takes back. A good fill model is boring and a little pessimistic.',
        '**Timing.** An order decided on the close of bar t fills at the open of bar t + 1 at the earliest, as the algo module did. **Price.** A market buy pays the ask, not the last trade: model it as `open + half spread + slippage`, a sell as `open − half spread − slippage`. Slippage grows with size, which the execution module models properly; a fixed cents-per-share figure is the honest minimum.',
        "**Quantity.** A bar shows how many shares traded. Your order cannot take all of them. Cap each fill at a **participation** share of the bar's volume, for example 10%, and leave the rest working as a **partial fill**. Thin stocks and large orders then take several bars to fill, at several prices, which a vectorised backtest cannot see.",
        '**Limit orders.** A buy limit at L fills if the bar opens at or below L (at the open, which is better) or if the low goes **through** L (at L). A low that only touches L is not enough: other orders were in the queue ahead of yours, and the trades that only touch your price are often the ones that then rise without you. **Stop orders** are the mirror image with the opposite risk: a sell stop at S triggers when the low reaches S, but if the bar opens below S it fills at the open, worse than S. Gaps make stops fill worse, never better.',
        'A bar gives four prices and no order. If a long position has a stop and a target both inside one bar, you cannot know which was hit first: assume the stop. **Commissions** come in schedules: per share with a minimum per order, per option contract, plus small regulatory fees on sales. Fee schedules change and differ by broker, so put them in configuration and check them with your broker. Then run the backtest again with costs doubled. An edge that only survives the cheap assumption is not one to trade.',
      ],
      rules: [
        'Decided at close t, filled at open t + 1 at the earliest.',
        'Market orders pay the half spread plus slippage on top of the open.',
        'Cap fills at a share of bar volume; the rest stays working.',
        'A limit fills when the price trades through it, not when it touches. A gap fills it at the open.',
        'Stops fill at the open when the bar gaps past them.',
        'Stop and target in one bar: assume the stop. Rerun with costs doubled.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'engine-fills-1',
          ask: 'You buy 200 shares at the next open, which is $50.00. Your model adds a half spread of $0.02 and slippage of $0.01 per share. How much more than 200 × $50.00 do you pay, in dollars?',
          answer: 6,
          check: '200 * (0.02 + 0.01)',
          why: 'Each share fills at $50.03, so the order costs $6 more than the open suggests, and the same again on the way out. A backtest filling at the open pays nothing for crossing the spread, and that difference is often the whole edge of a short-term strategy.',
        },
        {
          kind: 'choice',
          id: 'engine-fills-2',
          ask: 'You rest a buy limit at $99.50. The next bar has open $100.20, high $100.50, low $99.50, close $99.90. What should a cautious fill model do?',
          options: [
            'Fill at $99.50, because the low reached the limit',
            'Not fill: the price only touched $99.50, and orders ahead of yours in the queue may have taken all the volume there',
            'Fill at the open, $100.20',
            'Fill at the close, $99.90',
          ],
          answer: 1,
          why: 'At the limit price you wait in a queue behind earlier orders. A touch says some shares traded at $99.50, not that yours did. Requiring the low to go through the limit, by at least a tick, removes fills that live trading would often not get.',
        },
        {
          kind: 'output',
          id: 'engine-fills-3',
          ask: 'A buy limit at $100.00 against four bars of (open, high, low). What does this print?',
          code: `def buy_limit_fill(limit, o, h, l):
    if o <= limit:
        return o
    if l < limit:
        return limit
    return None

bars = [(101, 102, 100.5), (100.8, 101, 99.9), (99.7, 100.2, 99.5), (100.4, 100.6, 100.0)]
print([buy_limit_fill(100.0, *b) for b in bars])`,
          answer: '[None, 100.0, 99.7, None]',
          why: 'Bar 1 never comes down to the limit. Bar 2 trades through it, so you buy at $100.00. Bar 3 opens below the limit, so you buy at the open, $99.70, which is better. Bar 4 only touches $100.00 and, under this rule, does not fill.',
        },
        {
          kind: 'bug',
          id: 'engine-fills-4',
          ask: 'This fills a buy stop (an order to buy once the price rises to `stop`). After a gap up at the open the backtest buys at the stop price, below anything that traded that day. Which line is wrong?',
          code: `def buy_stop_fill(stop, o, h):
    if o >= stop:
        return stop
    if h >= stop:
        return stop
    return None`,
          line: 3,
          fix: '        return o',
          why: 'If the bar opens above the stop, the stop triggers at once and buys at the open. Nobody sold at the stop price that day. The bug makes every gap look cheaper than it was, and gaps are exactly where breakout strategies make or lose their money.',
        },
        {
          kind: 'number',
          id: 'engine-fills-5',
          ask: 'You send a buy order for 5,000 shares of a thin stock. The fill model caps each fill at 10% of the bar volume. The next two bars trade 12,000 and 8,000 shares. How many shares are still unfilled after the second bar?',
          answer: 3000,
          check: '5000 - 0.1 * 12000 - 0.1 * 8000',
          why: 'The order fills 1,200 then 800 shares. The other 3,000 are still working, and will fill at later prices, if at all. A model that fills all 5,000 at the first open assumes you took 42% of that bar on your own.',
        },
        {
          kind: 'write',
          id: 'engine-fills-6',
          ask: "Write `fill_order(order, bar, half_spread=0.0, slip=0.0, cap=1.0)`. `order` has `side` (+1 buy, −1 sell), `qty`, `type` ('market' or 'limit') and, for limits, `limit`. `bar` has `o`, `h`, `l`, `v`. The size is the smaller of `qty` and `math.floor(cap × v)`. A market order fills at `o + side × (half_spread + slip)`. A buy limit fills at the open if the open is at or below the limit, else at the limit if the low is below it; a sell limit is the mirror image. Return `(size, price)`, or `(0, None)` for no fill.",
          starter: `import math

def fill_order(order, bar, half_spread=0.0, slip=0.0, cap=1.0):
    return order['qty'], bar['o']`,
          solution: `import math

def fill_order(order, bar, half_spread=0.0, slip=0.0, cap=1.0):
    side, qty = order['side'], order['qty']
    o, h, l, v = bar['o'], bar['h'], bar['l'], bar['v']
    size = min(qty, math.floor(cap * v))
    if size <= 0:
        return 0, None
    if order['type'] == 'market':
        return size, o + side * (half_spread + slip)
    lim = order['limit']
    if side == 1:
        if o <= lim:
            return size, o
        if l < lim:
            return size, lim
    else:
        if o >= lim:
            return size, o
        if h > lim:
            return size, lim
    return 0, None`,
          tests: `bar = {'o': 100.0, 'h': 101.0, 'l': 99.0, 'v': 10000}
out = fill_order({'side': 1, 'qty': 300, 'type': 'market'}, bar, 0.02, 0.01)
assert out is not None, "the function returns nothing yet"
assert out[0] == 300 and abs(out[1] - 100.03) < 1e-9, f"a market buy pays open + half spread + slippage: expected (300, 100.03), got {out}"
q, px = fill_order({'side': -1, 'qty': 300, 'type': 'market'}, bar, 0.02, 0.01)
assert q == 300 and abs(px - 99.97) < 1e-9, f"a market sell receives open - half spread - slippage, got {(q, px)}"
q, px = fill_order({'side': 1, 'qty': 300, 'type': 'market'}, bar, 0.02, 0.01, cap=0.01)
assert q == 100, f"1% of 10,000 shares caps the fill at 100, got {q}"
assert fill_order({'side': 1, 'qty': 300, 'type': 'limit', 'limit': 99.5}, bar) == (300, 99.5), "the low goes through 99.50: fill at the limit"
assert fill_order({'side': 1, 'qty': 300, 'type': 'limit', 'limit': 99.0}, bar) == (0, None), "a low that only touches the limit does not fill"
assert fill_order({'side': 1, 'qty': 300, 'type': 'limit', 'limit': 100.5}, bar) == (300, 100.0), "a buy limit above the open fills at the open"
assert fill_order({'side': -1, 'qty': 300, 'type': 'limit', 'limit': 100.5}, bar) == (300, 100.5), "the high goes through a sell limit at 100.50"
assert fill_order({'side': -1, 'qty': 300, 'type': 'limit', 'limit': 101.0}, bar) == (0, None), "a high that only touches a sell limit does not fill"
assert fill_order({'side': -1, 'qty': 300, 'type': 'limit', 'limit': 99.5}, bar) == (300, 100.0), "a sell limit below the open fills at the open"`,
          why: 'Twenty lines hold most of the honesty of a backtest: the spread is paid, size is limited by what traded, touches do not fill and gaps fill at the open. Every number in it should come from configuration, so you can rerun with harsher values.',
        },
        {
          kind: 'number',
          id: 'engine-fills-7',
          ask: 'A made-up commission schedule charges $0.005 a share with a minimum of $1.00 per order. Your strategy buys and later sells 150 shares per trade, and makes $3.00 per round trip on average before commissions. What share of that is eaten by commissions? Give a percentage, for example 25%.',
          answer: 0.6667,
          tol: 0.005,
          check: '2 * max(1.0, 150 * 0.005) / 3.0',
          why: '150 × $0.005 is $0.75, below the minimum, so each order costs $1.00 and a round trip $2.00: two thirds of the gross edge. Minimums hit small orders hardest. Model the schedule as written, not as a flat rate per share.',
        },
        {
          kind: 'choice',
          id: 'engine-fills-8',
          ask: 'In the figure, set the rule to "touched" and note the fills and the average P&L per fill. Then switch to "through 10¢". What happens?',
          options: [
            'Nothing changes: the rule only matters for big orders',
            'There are fewer fills, and the average P&L per fill falls, because the fills you lose are mostly days the price only reached the limit and then bounced',
            'There are more fills',
            'There are fewer fills but each one is better',
          ],
          answer: 1,
          why: 'The fills that only touched are disproportionately good: the price reached your level and turned up. Live, those are the fills you often miss, while the ones where the price kept falling through you always fill. This is **adverse selection**, and an optimistic touch rule hides it.',
        },
        {
          kind: 'choice',
          id: 'engine-fills-9',
          ask: 'You are long from $50 with a sell stop at $48. Bad news comes out overnight and the stock opens at $45. What fill should the backtest record?',
          options: [
            '$48, the stop price',
            'Around $45 or a little worse: the stop triggers at the open, the first price available',
            'No fill: the price never traded at $48',
            '$46.50, halfway between',
          ],
          answer: 1,
          why: 'A stop becomes a market order once triggered, and the first price after the trigger is the open. A model that fills at the stop understates the loss: here $3 a share per $2 of planned risk, and gaps like this are where the largest losses come from.',
        },
        {
          kind: 'choice',
          id: 'engine-fills-10',
          ask: 'You are long from $100 with a stop at $98 and a target at $103. The next bar has high $104 and low $97. Which exit should the backtest take?',
          options: [
            'The target: it is the better outcome',
            'The stop: the bar does not say which came first, so assume the worse one, or look at finer data for that bar',
            'Both, half each',
            'Neither: hold to the close',
          ],
          answer: 1,
          why: 'Open, high, low and close do not tell you the order of the high and the low. Picking the target trains the backtest to believe in wins that may not have happened. Assume the stop, or load one-minute bars for the bars where both were hit.',
        },
        {
          kind: 'number',
          id: 'engine-fills-11',
          ask: 'Your backtest assumed $6 of costs per round trip and shows $12 net per trade. Live, you measure costs of $15 per round trip. What is the net per trade, in dollars, if nothing else changes?',
          answer: 3,
          check: '12 + 6 - 15',
          why: 'The gross edge is $18. Costs 2.5 times the assumption leave $3, a quarter of what the backtest promised. Running the backtest with costs doubled and tripled shows this before real money does.',
        },
        {
          kind: 'design',
          id: 'engine-fills-12',
          ask: 'Write the fill model for a strategy that buys pullbacks in mid-sized stocks on 5-minute bars with limit orders, and exits with a stop or at the close.',
          checklist: [
            { point: 'Orders decided at a bar close are eligible from the next bar on, never the same bar', why: 'The signal bar is already over when the order exists.' },
            { point: 'Buy limits fill only when the low goes through the limit by at least a tick; at the open if the bar opens below it', why: 'Touches are where adverse selection hides.' },
            { point: 'Fills capped at a set share of bar volume, the rest working until filled or cancelled', why: 'Mid-sized stocks can be thin at times of day.' },
            { point: 'Stops fill at the open when the bar gaps past them, plus slippage', why: 'The gap is the risk the stop does not remove.' },
            { point: 'When stop and target fall in one bar, assume the stop', why: 'The bar does not reveal the order of high and low.' },
            { point: 'Exits at the close pay the spread and slippage too', why: 'Market-on-close and closing market orders are not free.' },
            { point: 'Commission schedule from configuration, checked against the broker, with minimums', why: 'Fees change, and minimums hit small orders hardest.' },
            { point: 'Results reported at 1×, 2× and 3× the cost assumptions', why: 'An edge that disappears at 2× is too thin to trade.' },
          ],
          why: 'The fill model is where a backtest most easily lies, and limit orders lie in your favour unless you stop them. Writing the rules down first also gives you something to compare live fills against.',
        },
      ],
    },
    {
      id: 'engine-live',
      title: 'One code path for backtest, paper and live',
      summary: 'Interfaces for data, broker and clock; an asynchronous broker even in simulation; starting from the broker state; replaying live data to prove parity.',
      text: [
        'The algo module made the case: the same strategy and risk code should run in the backtest, on the paper account and live, with only the data source and the broker swapped. This lesson is how to build that. Every line that differs between backtest and live is a line your backtest never tested.',
        'Define three **interfaces**, small sets of methods that every version must provide. A **data feed** hands out market events. A **broker** takes orders and reports fills, cancels and rejections. A **clock** says what time it is. The backtest plugs in a file feed, a simulated broker and a simulated clock; paper and live plug in the broker connection with paper or live keys. In Python an abstract base class (`abc.ABC` with `@abstractmethod`) or a `typing.Protocol` writes the interface down, and choosing the implementation is a line of configuration.',
        { code: `from abc import ABC, abstractmethod

class Broker(ABC):
    @abstractmethod
    def submit(self, sym, qty, limit=None): ...   # returns an order id at once
    @abstractmethod
    def cancel(self, order_id): ...
# fills, cancels and rejections come back later as events` },
        'Shape the simulated broker like the real one. A real broker accepts an order and reports the fill later, maybe in parts, maybe never, maybe as a rejection. If the simulated `submit` returns a fill at once, strategy code learns to assume instant full fills, and that assumption breaks live. Make `submit` return an id, deliver fills as events, and have the simulator produce partial fills and rejections too.',
        'Some things differ however carefully you build: latency, real fills, disconnections and restarts. Handle them in the live adapters and in startup. A live engine that restarts mid-day must load positions and open orders from the broker and reconcile them, then load enough history to **warm up** its indicators, before the strategy sees a single event.',
        'Prove parity with **record and replay**. Log every market event the live engine receives and every decision it makes. After the session, feed the recorded events through the backtest engine and compare decisions one by one. They should match exactly; the first one that does not is a bug, or a difference you had not noticed.',
      ],
      rules: [
        'Three interfaces: data feed, broker, clock. Backtest, paper and live are three sets of implementations.',
        'Strategy and risk code never import a broker library and never branch on the mode.',
        'The simulated broker is asynchronous: an id now, fills, partials and rejects later.',
        'On start, load positions and open orders from the broker and warm up indicators before trading.',
        'Record live events and replay them through the backtest; decisions must match.',
      ],
      questions: [
        {
          kind: 'choice',
          id: 'engine-live-1',
          ask: 'Which of these belongs behind the broker interface, and nowhere else in the engine?',
          options: [
            "The broker library's calls, its order id format and its status codes, translated into the engine's own fill and order events",
            'The rule that decides the target position',
            'The daily loss limit',
            'The moving average',
          ],
          answer: 0,
          why: "Everything specific to one broker lives in its adapter, which turns the broker's world into the engine's events. Strategy and risk code then cannot tell a simulated fill from a real one, which is the point.",
        },
        {
          kind: 'bug',
          id: 'engine-live-2',
          ask: "In the backtest the simulated broker filled inside `submit`, before `on_fill` was even called, and this strategy worked. Live, fills arrive later through `on_fill`, and the strategy's position ends up double the real one. Which line is wrong?",
          code: `class Strategy:
    def __init__(self, broker):
        self.broker = broker
        self.position = 0
        self.pending = 0

    def on_bar(self, bar):
        target = 100 if bar.close > bar.open else 0
        qty = target - self.position - self.pending
        if qty:
            self.broker.submit(bar.symbol, qty)
            self.position += qty

    def on_fill(self, fill):
        self.pending -= fill.qty
        self.position += fill.qty`,
          line: 12,
          fix: '            self.pending += qty',
          why: 'An order sent is pending, not held. The position must change only on a fill. A simulated broker that is asynchronous, like the real one, would have exposed this bug in the backtest.',
        },
        {
          kind: 'output',
          id: 'engine-live-3',
          ask: 'An abstract base class enforces the interface. What does this print?',
          code: `from abc import ABC, abstractmethod

class Broker(ABC):
    @abstractmethod
    def submit(self, sym, qty): ...

class Sim(Broker):
    def submit(self, sym, qty):
        return 'o1'

class Half(Broker):
    pass

print(Sim().submit('SPY', 100))
try:
    Half()
except TypeError:
    print('Half cannot be created')`,
          answer: `o1
Half cannot be created`,
          why: "A class that misses an abstract method cannot be created, so a live adapter that forgot `cancel` fails when the engine starts, not at the moment it first needs to cancel an order.",
        },
        {
          kind: 'write',
          id: 'engine-live-4',
          ask: "Write `SimBroker(slip)` shaped like a real broker. `submit(sym, qty)` raises `ValueError` if qty is 0, otherwise stores the order and returns an id 'o1', 'o2', … in order. `cancel(oid)` removes a waiting order and returns True, or returns False if there is none. `on_open(sym, price)` fills every waiting order in `sym` at `price + slip` for buys and `price − slip` for sells, removes them, and returns the fills as dicts with keys `id`, `sym`, `qty`, `price`.",
          starter: `class SimBroker:
    def __init__(self, slip=0.0):
        self.slip = slip

    def submit(self, sym, qty):
        # fills at once: convenient, and not how a broker works
        return {'sym': sym, 'qty': qty}

    def cancel(self, oid):
        return False

    def on_open(self, sym, price):
        return []`,
          solution: `class SimBroker:
    def __init__(self, slip=0.0):
        self.slip = slip
        self.orders = {}
        self.n = 0

    def submit(self, sym, qty):
        if qty == 0:
            raise ValueError('quantity must not be zero')
        self.n += 1
        oid = f'o{self.n}'
        self.orders[oid] = (sym, qty)
        return oid

    def cancel(self, oid):
        return self.orders.pop(oid, None) is not None

    def on_open(self, sym, price):
        fills = []
        for oid, (s, q) in list(self.orders.items()):
            if s == sym:
                px = price + self.slip if q > 0 else price - self.slip
                fills.append({'id': oid, 'sym': s, 'qty': q, 'price': px})
                del self.orders[oid]
        return fills`,
          tests: `b = SimBroker(slip=0.01)
oid = b.submit('SPY', 100)
assert oid is not None, "submit returns nothing yet"
assert oid == 'o1', f"submit returns an order id, not a fill: expected 'o1', got {oid}"
assert b.submit('QQQ', -50) == 'o2', "ids count up"
assert b.submit('SPY', -30) == 'o3', "ids count up"
assert b.cancel('o3') is True, "cancelling a waiting order returns True"
assert b.cancel('o3') is False, "it is gone now"
assert b.on_open('IWM', 200.0) == [], "no orders in IWM"
fills = b.on_open('SPY', 50.0)
assert len(fills) == 1 and fills[0]['id'] == 'o1' and fills[0]['qty'] == 100, f"one SPY fill for o1, got {fills}"
assert abs(fills[0]['price'] - 50.01) < 1e-9, "a buy pays the slippage"
assert b.on_open('SPY', 51.0) == [], "a filled order does not fill twice"
f2 = b.on_open('QQQ', 400.0)
assert abs(f2[0]['price'] - 399.99) < 1e-9, "a sell receives price minus slippage"
try:
    b.submit('SPY', 0)
    assert False, "a zero quantity must raise ValueError"
except ValueError:
    pass`,
          why: 'With an id now and fills later, the strategy is forced to handle the time between, which is where live bugs live: duplicate orders, cancels that race fills, positions counted twice.',
        },
        {
          kind: 'choice',
          id: 'engine-live-5',
          ask: 'Your engine has `if config.live:` in fourteen places in the strategy and risk code. What is the problem?',
          options: [
            'None, as long as the backtest passes',
            'Each branch is code that runs only live and was never tested by the backtest; the differences belong in the data, broker and clock implementations',
            'It is slow',
            'Python does not allow it',
          ],
          answer: 1,
          why: 'Fourteen live-only branches are fourteen untested paths, each able to make live behaviour differ from what you tested. Push every difference down into the adapters, behind the interfaces, where it can be tested on its own.',
        },
        {
          kind: 'number',
          id: 'engine-live-6',
          ask: 'Your strategy needs 200 bars of 5-minute history, and a regular session has 78 such bars. When the live engine starts before the open, how many previous full sessions must the data feed load to warm up?',
          answer: 3,
          check: 'math.ceil(200 / 78)',
          why: 'Two sessions give 156 bars, not enough; three give 234. The backtest had the history from the file. Live it must be fetched at startup, or the first hours of trading run on indicators the backtest never saw.',
        },
        {
          kind: 'choice',
          id: 'engine-live-7',
          ask: 'The live engine crashes at 11:00 and restarts at 11:05. In memory it starts flat; the broker shows you long 200 shares with a resting sell limit. What must happen before the strategy handles its first event?',
          options: [
            'Nothing: the strategy will rebuild its position from new fills',
            'Load positions and open orders from the broker, adopt or cancel the open orders, and warm up the indicators from history',
            'Sell the 200 shares at market to start clean',
            'Ignore the broker until the end of the day',
          ],
          answer: 1,
          why: "The broker's record is the truth. A strategy that thinks it is flat will buy again and double the position. Startup reconciliation is part of the live adapter, and it should be tested by starting the engine in a mid-trade state.",
        },
        {
          kind: 'write',
          id: 'engine-live-8',
          ask: 'Write `first_divergence(live, replay, tol=1e-9)`. Both are lists of decisions `(time, symbol, target)`. Return the index of the first decision where the time or symbol differs or the targets differ by more than `tol`; if one list is a prefix of the other, return the length of the shorter; if they match, return None.',
          starter: `def first_divergence(live, replay, tol=1e-9):
    return None`,
          solution: `def first_divergence(live, replay, tol=1e-9):
    for i, (a, b) in enumerate(zip(live, replay)):
        if a[0] != b[0] or a[1] != b[1] or abs(a[2] - b[2]) > tol:
            return i
    if len(live) != len(replay):
        return min(len(live), len(replay))
    return None`,
          tests: `live = [(1, 'SPY', 100), (2, 'SPY', 100), (3, 'QQQ', -50)]
assert first_divergence(live, list(live)) is None, "identical decisions match"
out = first_divergence(live, [(1, 'SPY', 100), (2, 'SPY', 0), (3, 'QQQ', -50)])
assert out == 1, f"the targets differ at index 1, got {out}"
assert first_divergence(live, [(1, 'SPY', 100), (2, 'QQQ', 100)]) == 1, "a different symbol is a divergence"
assert first_divergence(live, live[:2]) == 2, "the replay stopped early: divergence at 2"
assert first_divergence([(1, 'SPY', 0.1 + 0.2)], [(1, 'SPY', 0.3)]) is None, "targets within tol match"`,
          why: 'Replaying recorded live data through the backtest and comparing decisions is the strongest test of parity you can run. The first divergence tells you where to look; everything before it is proven to match.',
        },
        {
          kind: 'number',
          id: 'engine-live-9',
          ask: 'The simulated broker assumed $0.01 of slippage per share. Live fills average $0.03 per share worse than the price you saw. You trade 400 shares, enter and exit, 250 times a year. How many dollars a year does the backtest overstate, from this alone?',
          answer: 4000,
          check: '(0.03 - 0.01) * 400 * 2 * 250',
          why: '$0.02 × 400 shares × 2 sides × 250 trades = $4,000. Measure live slippage from your own fills and put it back into the simulated broker. One code path makes that a change to one number in configuration.',
        },
        {
          kind: 'design',
          id: 'engine-live-10',
          ask: 'Design the interfaces that let one engine run as a backtest, on a paper account and live.',
          checklist: [
            { point: 'A data feed interface: subscribe to symbols, hand out market events, fetch history for warm-up', why: 'File and live feeds then look the same to the strategy.' },
            { point: 'A broker interface: submit returns an id, cancel, and fills, partial fills, cancels and rejections as events', why: 'The asynchronous shape is what the real broker has.' },
            { point: "A clock interface: the simulated clock follows the events; the live clock reads the machine time in UTC", why: 'No strategy code reads the wall clock itself.' },
            { point: 'Implementation chosen by configuration, with paper and live keys kept out of the code', why: 'Switching mode is a setting, not an edit.' },
            { point: 'Startup: load positions and open orders from the broker, reconcile, then warm up indicators', why: 'Restarts mid-day must not double positions.' },
            { point: 'A simulated broker that can produce partial fills, rejections and delays', why: 'Strategy code meets live behaviour in the backtest first.' },
            { point: 'Every event and decision logged, so a live day can be replayed through the backtest', why: 'Replay proves the two paths make the same decisions.' },
          ],
          why: 'The interfaces are the seam between the part you test thoroughly and the part that touches the world. Keep that seam small and the world-touching side thin.',
        },
      ],
    },
    {
      id: 'engine-testing',
      title: 'Testing and reproducibility',
      summary: 'Hand-worked unit tests, invariants checked on random fills, seeds passed in, configuration recorded with every result, decision logs, and the open source frameworks maintained today.',
      text: [
        'Engine bugs are not neutral. You debug the backtests that look bad and keep the ones that look good, so a bug that flatters results survives and one that hurts them gets fixed. Over time the code drifts toward optimism. Tests are the only defence that does not depend on how the result looks.',
        '**Unit tests** for the accounting come first, each worked out by hand before the code runs: a buy, an add, a reduction, a flip, a short, an option with its multiplier, a fill with a fee. Then **invariants**, statements that must hold after every event: equity − start = realised + unrealised; cash changes only on fills; the position equals the sum of fill quantities. Feed hundreds of random fills from a seeded generator and check the invariants after each. The library `hypothesis` does this kind of testing thoroughly in the real world; a NumPy loop does the same job on a small scale.',
        "**Known-answer tests** run whole strategies with results you can compute: buy and hold must end at the price ratio; the vectorised engine and the event engine must agree on a strategy with no path dependence (lesson 1); every feature must pass the lookahead test (lesson 3). A **regression test** saves the full output of a reference run and fails when a change moves it, so a change in results is always a decision, never an accident.",
        '**Reproducibility** means the same inputs give the same output, bit for bit. Pass a generator, `np.random.default_rng(seed)`, into everything random (slippage noise, simulated latency) instead of using the global `np.random` functions. Iterate over `sorted(...)` rather than over a set of strings: Python randomises string hashing per process, so set order can change between runs. Save with every result the configuration, the seed, a fingerprint of the data and the code version (a git commit), and log every decision as one line of JSON with its time, inputs and reason.',
        "You do not have to write everything yourself. Checked on GitHub in November 2026: **NautilusTrader** (Rust core with Python strategies, backtest and live with the same strategy code), **LEAN** (QuantConnect's open source engine, C# with Python strategies), **zipline-reloaded** (the maintained fork of Quantopian's Zipline), **backtesting.py** and **vectorbt** (vectorised; the open source community edition of a separate PRO version, under Apache 2.0 with the Commons Clause) are all active. **backtrader** is still widely used, but its main repository has not changed since August 2024. Licences differ, from Apache to LGPL, AGPL and GPL; read them. A framework replaces your engine code, not your tests: you still test your strategy, your configuration and your use of its fill model.",
      ],
      rules: [
        'Work the expected value out by hand before writing the test.',
        'Check invariants after every event, on hundreds of seeded random fills.',
        'Pass a seeded generator into every random part; never use global random state.',
        'Save configuration, seed, data fingerprint and code version with every result.',
        'Log every decision as structured data: time, inputs, decision, reason.',
        "Check a framework's maintenance and licence before you depend on it.",
      ],
      questions: [
        {
          kind: 'output',
          id: 'engine-testing-1',
          ask: 'Three generators, two with the same seed. What does this print?',
          code: `import numpy as np

a = np.random.default_rng(7).normal(0, 1, 3)
b = np.random.default_rng(7).normal(0, 1, 3)
c = np.random.default_rng(8).normal(0, 1, 3)
print(np.array_equal(a, b), np.array_equal(a, c))`,
          answer: 'True False',
          why: 'The same seed gives the same draws, every run, on every machine with the same NumPy version. That is what makes a backtest with random slippage repeatable: the seed is part of the configuration.',
        },
        {
          kind: 'bug',
          id: 'engine-testing-2',
          ask: 'The engine is created with a seeded generator, yet two runs with the same seed give different results. Which line is wrong?',
          code: `import numpy as np

def slipped_price(price, side, rng, bps=2.0):
    noise = abs(np.random.normal(0, bps))
    return price * (1 + side * noise / 10000)

rng = np.random.default_rng(42)
print(slipped_price(100.0, 1, rng))`,
          line: 4,
          fix: '    noise = abs(rng.normal(0, bps))',
          why: 'The function takes `rng` and then ignores it, drawing from the global generator, which nobody seeded. A test that runs the engine twice with one seed and requires identical output catches this at once.',
        },
        {
          kind: 'write',
          id: 'engine-testing-3',
          numpy: true,
          ask: "Write `find_identity_break(cls, seed=0, n=200, start=10000.0)`, a randomised test of a portfolio class with `on_fill(sym, qty, price, fee)`, `realised`, `unrealised(marks)` and `equity(marks)`. With `rng = np.random.default_rng(seed)`, create `cls(start)` and repeat n times: pick a symbol from ['A', 'B'] with `rng.integers(2)`, a quantity with `int(rng.integers(-300, 301))` (skip zero), a price and a fee with `rng.uniform(10, 50)` and `rng.uniform(0, 2)`, apply the fill, draw marks for both symbols with `rng.uniform(10, 50)`, and check equity − start = realised + unrealised to 1e-6. Return the index of the first step that breaks it, or None.",
          starter: `import numpy as np

def find_identity_break(cls, seed=0, n=200, start=10000.0):
    p = cls(start)
    return None`,
          solution: `import numpy as np

def find_identity_break(cls, seed=0, n=200, start=10000.0):
    rng = np.random.default_rng(seed)
    p = cls(start)
    for i in range(n):
        sym = ['A', 'B'][rng.integers(2)]
        qty = int(rng.integers(-300, 301))
        if qty == 0:
            continue
        price = float(rng.uniform(10, 50))
        fee = float(rng.uniform(0, 2))
        p.on_fill(sym, qty, price, fee)
        marks = {s: float(rng.uniform(10, 50)) for s in ('A', 'B')}
        if abs(p.equity(marks) - start - p.realised - p.unrealised(marks)) > 1e-6:
            return i
    return None`,
          tests: `class Portfolio:
    def __init__(self, cash):
        self.cash, self.pos, self.avg, self.realised = cash, {}, {}, 0.0
    def closed_pnl(self, closed, price, avg, pos, qty):
        return closed * (price - avg) * (1 if pos > 0 else -1)
    def on_fill(self, sym, qty, price, fee=0.0):
        pos, avg = self.pos.get(sym, 0), self.avg.get(sym, 0.0)
        self.cash -= qty * price + fee
        self.realised -= fee
        if pos == 0 or (pos > 0) == (qty > 0):
            avg = (avg * pos + price * qty) / (pos + qty)
        else:
            closed = min(abs(qty), abs(pos))
            self.realised += self.closed_pnl(closed, price, avg, pos, qty)
            if abs(qty) > abs(pos):
                avg = price
        pos += qty
        self.pos[sym], self.avg[sym] = pos, (avg if pos else 0.0)
    def unrealised(self, marks):
        return sum((marks[s] - self.avg[s]) * q for s, q in self.pos.items() if q)
    def equity(self, marks):
        return self.cash + sum(q * marks[s] for s, q in self.pos.items() if q)
class FlipBug(Portfolio):
    def closed_pnl(self, closed, price, avg, pos, qty):
        return abs(qty) * (price - avg) * (1 if pos > 0 else -1)
class FeeBug(Portfolio):
    def on_fill(self, sym, qty, price, fee=0.0):
        super().on_fill(sym, qty, price, fee)
        self.realised += fee
out = find_identity_break(FlipBug)
assert out is not None, "the flip bug realises P&L on shares that were never held: your test must find it"
assert isinstance(out, int), f"return the index of the step, got {out!r}"
assert find_identity_break(FeeBug) is not None, "fees taken from cash but not from realised break the identity: your test must find it"
assert find_identity_break(Portfolio) is None, "a correct portfolio must pass every step"
assert find_identity_break(Portfolio, seed=5) is None, "and with another seed"
assert find_identity_break(FlipBug, seed=3) == find_identity_break(FlipBug, seed=3), "the same seed must give the same answer"`,
          why: 'Nobody writes a hand test for every combination of adds, reductions, flips and fees in two symbols. Two hundred random fills with an invariant checked after each one try them all, and the seed makes any failure repeatable so you can debug it.',
        },
        {
          kind: 'number',
          id: 'engine-testing-4',
          ask: 'A backtest with random slippage is run with 20 different seeds. The final P&L averages $5,000 with a standard deviation of $1,500 across the seeds. What is the standard error of that average, in dollars? One decimal place.',
          answer: 335.4,
          tol: 0.5,
          check: '1500 / math.sqrt(20)',
          why: '1,500 ÷ √20 ≈ $335. A single seed is one draw from a spread of $1,500; report the spread across seeds, not a lucky seed. A fixed seed makes a run repeatable, not representative.',
        },
        {
          kind: 'choice',
          id: 'engine-testing-5',
          ask: 'Six months from now you want to reproduce exactly the backtest you ran today. What must you have saved with its result?',
          options: [
            'The final Sharpe ratio and a screenshot of the equity curve',
            'The configuration (every parameter and cost assumption), the random seed, a fingerprint of the input data and the code version',
            'Only the strategy file',
            'The date you ran it',
          ],
          answer: 1,
          why: 'Any of the four can change the result: a parameter, a seed, a corrected data file, a fix in the fill model. Without all four, a different number later cannot be explained, and you cannot tell an improvement from a bug.',
        },
        {
          kind: 'choice',
          id: 'engine-testing-6',
          ask: 'Your engine loops `for sym in set(symbols):` to send orders. Two runs on the same data, with the same seed, give slightly different fills when the cash limit binds. Why?',
          options: [
            'Floating point is random',
            'Python randomises string hashing per process, so the order of a set of strings can change between runs; when cash runs short, whichever symbol goes first gets filled',
            'NumPy changed its seed',
            'The data changed between runs',
          ],
          answer: 1,
          why: 'Set order depends on hashes, and string hashes change per process unless `PYTHONHASHSEED` is fixed. Loop over `sorted(set(symbols))`, so the order is part of your code rather than an accident.',
        },
        {
          kind: 'output',
          id: 'engine-testing-7',
          ask: 'One decision written as one line of JSON. What does this print?',
          code: `import json

rec = {'t': '2026-03-02T14:31:00Z', 'sym': 'SPY', 'target': 100, 'reason': 'close > ma20'}
print(json.dumps(rec, sort_keys=True))`,
          answer: '{"reason": "close > ma20", "sym": "SPY", "t": "2026-03-02T14:31:00Z", "target": 100}',
          why: "One JSON object per line, keys in a fixed order, is easy to grep, to load back into Python and to compare between a live day and its replay. A free-text log line such as 'buying SPY now!' is none of those.",
        },
        {
          kind: 'bug',
          id: 'engine-testing-8',
          ask: "A teammate changed the accounting code until this test passed. Long 100 at $20, sell 250 at $22. The engine is now wrong because the test is. Which line of the test is wrong?",
          code: `def test_flip():
    p = Portfolio(10000.0)
    p.on_fill('X', 100, 20.0)
    p.on_fill('X', -250, 22.0)
    assert p.pos['X'] == -150
    assert abs(p.realised - 500.0) < 1e-9
    assert abs(p.avg['X'] - 22.0) < 1e-9`,
          line: 6,
          fix: '    assert abs(p.realised - 200.0) < 1e-9',
          why: 'Only the 100 shares held realise anything: 100 × $2 = $200. The other 150 open a short with nothing realised yet. A test whose expected value came from running the code tests nothing. Work it out by hand first.',
        },
        {
          kind: 'choice',
          id: 'engine-testing-9',
          ask: 'A blog post from 2019 recommends a backtesting framework. Before you build on it, what should you check?',
          options: [
            'Only its number of GitHub stars',
            'When its code last changed and whether issues are answered, its licence, whether it supports your assets and data, and how its fill model handles limits, gaps and costs',
            'Whether the blog author made money with it',
            'Nothing: open source code does not age',
          ],
          answer: 1,
          why: 'Stars measure past popularity. A framework that has not changed in years will not follow new Python and library versions, and its licence and fill model decide what you can do with it and how honest its results are.',
        },
        {
          kind: 'design',
          id: 'engine-testing-10',
          ask: 'Write the test plan for your engine before you trust any result it gives.',
          checklist: [
            { point: 'Hand-worked unit tests for buy, add, reduce, flip, short, option multiplier and fees', why: 'Accounting is where small bugs make large false results.' },
            { point: 'Invariants checked after every event on hundreds of seeded random fills', why: 'They test combinations no one would write by hand.' },
            { point: 'Vectorised and event-driven engines agree on a strategy with no path dependence', why: 'A timing bug in either shows up as a difference.' },
            { point: 'The lookahead test on every feature', why: 'The data handler cannot protect features from the future.' },
            { point: 'Fill model tests: touches do not fill, gaps fill at the open, volume caps hold', why: 'The fill model decides whether costs are real.' },
            { point: 'Two runs with the same configuration and seed give identical output', why: 'Hidden randomness and set ordering are caught at once.' },
            { point: 'A regression test against a saved reference run', why: 'Any change in results becomes a decision, not an accident.' },
            { point: 'Configuration, seed, data fingerprint and code version saved with every result', why: 'Every number can be reproduced and explained later.' },
          ],
          why: 'Tests do not prove a strategy works. They prove the engine computes what you think it computes, which has to be true before any result means anything.',
        },
      ],
    },
    {
      id: 'engine-lab',
      title: 'Lab: a small event-driven engine with tests',
      summary: 'A multi-symbol data handler, a simulated broker with spread, slippage, volume caps, limits and commissions, a signed portfolio, a strategy, the engine loop, and a test suite for the accounting.',
      text: [
        "This lab builds a small **event-driven backtest engine** for several symbols, a step beyond the one in the algo module. A data handler hands out one time slice at a time. A simulated broker fills orders on the next bar with a half spread, slippage, a cap on volume, limit logic and a commission schedule. A portfolio keeps signed positions, cash and realised P&L. A trend strategy sets targets. The engine joins them and records equity. The last coding step writes tests that catch broken accounting.",
        'All bars are made up. Each step repeats the classes it needs, so it runs on its own; the parts are the ones from the lessons, assembled. Nothing here says the strategy is worth trading: the point is an engine whose numbers you can trust, so that when a strategy looks good the reason is the strategy.',
        'The engine loop keeps a fixed order on every slice: fills from orders sent earlier, then marks and equity at the close, then the strategy and new orders. That order is a simple stand-in for the event queue of lesson 2, with fills ahead of new decisions at a shared time. Steps 7 and 8 are the checks: a bug that only appears with partial fills, and a test suite that is itself tested against broken portfolios.',
      ],
      rules: [
        'The strategy sees history up to the current slice and nothing after it.',
        'Orders sent on one slice fill on a later slice, at the next open or the limit.',
        'Positions and cash change only on fills.',
        'Order size = target − position − pending, or partial fills multiply orders.',
        'Every accounting rule has a test worked out by hand.',
      ],
      questions: [
        {
          kind: 'write',
          id: 'engine-lab-1',
          ask: 'Step 1: the data handler. `bars` maps each symbol to a time-sorted list of `(t, o, h, l, c, v)`. `next_slice()` returns `(t, {sym: (o, h, l, c, v)})` for the next time in the union of all times, with only the symbols that have a bar then, or `None` at the end. `history(sym, n)` returns the last n closes of `sym` up to and including the current slice.',
          starter: `class DataHandler:
    def __init__(self, bars):
        self.bars = bars

    def next_slice(self):
        return None

    def history(self, sym, n):
        return [b[4] for b in self.bars[sym]][-n:]`,
          solution: `class DataHandler:
    def __init__(self, bars):
        self.bars = bars
        self.times = sorted({b[0] for rows in bars.values() for b in rows})
        self.i = -1
        self.ptr = {s: 0 for s in bars}
        self.closes = {s: [] for s in bars}

    def next_slice(self):
        self.i += 1
        if self.i >= len(self.times):
            return None
        t = self.times[self.i]
        out = {}
        for s, rows in self.bars.items():
            k = self.ptr[s]
            if k < len(rows) and rows[k][0] == t:
                out[s] = rows[k][1:]
                self.closes[s].append(rows[k][4])
                self.ptr[s] = k + 1
        return t, out

    def history(self, sym, n):
        return self.closes[sym][-n:]`,
          tests: `d = DataHandler({'SPY': [(1, 10, 11, 9, 10.5, 1000), (2, 10.5, 12, 10, 11.5, 900)], 'XYZ': [(2, 5, 5.2, 4.9, 5.1, 300)]})
out = d.next_slice()
assert out is not None, "next_slice returns nothing yet"
assert out == (1, {'SPY': (10, 11, 9, 10.5, 1000)}), f"time 1 has only SPY, as (o, h, l, c, v), got {out}"
assert d.history('SPY', 5) == [10.5], f"history must end at the current slice, got {d.history('SPY', 5)}"
assert d.history('XYZ', 5) == [], "XYZ has no history yet"
assert d.next_slice() == (2, {'SPY': (10.5, 12, 10, 11.5, 900), 'XYZ': (5, 5.2, 4.9, 5.1, 300)}), "time 2 has both"
assert d.history('SPY', 1) == [11.5], "the last close"
assert d.next_slice() is None, "None at the end"`,
          why: 'The handler is the only thing that holds the full data, and it releases it one slice at a time. Nothing later in the engine can reach the future even by mistake.',
        },
        {
          kind: 'write',
          id: 'engine-lab-2',
          ask: "Step 2: the simulated broker. `submit(sym, qty, limit=None)` queues a signed order; `pending(sym)` is the sum of waiting quantities in `sym`. `on_slice(bars)` (bars as from step 1) tries every waiting order whose symbol has a bar: size = min(|qty|, floor(cap × v)); a market order fills at `o ± (half_spread + slip)`; a buy limit at the open if o ≤ limit, else at the limit if l < limit; a sell limit the mirror image. Fee = max(min_fee, per_share × size). Unfilled remainders keep waiting. Return fills as `(sym, signed size, price, fee)`.",
          starter: `import math

class SimBroker:
    def __init__(self, half_spread=0.0, slip=0.0, cap=1.0, per_share=0.0, min_fee=0.0):
        self.half_spread, self.slip, self.cap = half_spread, slip, cap
        self.per_share, self.min_fee = per_share, min_fee
        self.orders = []

    def submit(self, sym, qty, limit=None):
        self.orders.append({'sym': sym, 'qty': qty, 'limit': limit})

    def pending(self, sym):
        return 0

    def on_slice(self, bars):
        return []`,
          solution: `import math

class SimBroker:
    def __init__(self, half_spread=0.0, slip=0.0, cap=1.0, per_share=0.0, min_fee=0.0):
        self.half_spread, self.slip, self.cap = half_spread, slip, cap
        self.per_share, self.min_fee = per_share, min_fee
        self.orders = []

    def submit(self, sym, qty, limit=None):
        self.orders.append({'sym': sym, 'qty': qty, 'limit': limit})

    def pending(self, sym):
        return sum(o['qty'] for o in self.orders if o['sym'] == sym)

    def on_slice(self, bars):
        fills, keep = [], []
        for od in self.orders:
            bar = bars.get(od['sym'])
            if bar is None:
                keep.append(od)
                continue
            o, h, l, c, v = bar
            side = 1 if od['qty'] > 0 else -1
            size = min(abs(od['qty']), math.floor(self.cap * v))
            lim = od['limit']
            if lim is None:
                price = o + side * (self.half_spread + self.slip)
            elif side == 1:
                price = o if o <= lim else (lim if l < lim else None)
            else:
                price = o if o >= lim else (lim if h > lim else None)
            if price is None or size == 0:
                keep.append(od)
                continue
            fills.append((od['sym'], side * size, price, max(self.min_fee, self.per_share * size)))
            rest = od['qty'] - side * size
            if rest:
                keep.append({**od, 'qty': rest})
        self.orders = keep
        return fills`,
          tests: `b = SimBroker(half_spread=0.02, slip=0.01, cap=0.1, per_share=0.005, min_fee=1.0)
b.submit('SPY', 300)
b.submit('XYZ', -200, limit=20.5)
f = b.on_slice({'SPY': (50.0, 50.5, 49.8, 50.2, 2000)})
assert f is not None and len(f) == 1, f"one fill: SPY only, XYZ has no bar; got {f}"
s, q, px, fee = f[0]
assert (s, q) == ('SPY', 200), f"10% of 2,000 caps the fill at 200, got {(s, q)}"
assert abs(px - 50.03) < 1e-9, f"open + half spread + slippage = 50.03, got {px}"
assert abs(fee - 1.0) < 1e-9, f"200 x 0.005 = 1.00, got {fee}"
assert b.pending('SPY') == 100, f"100 SPY still waiting, got {b.pending('SPY')}"
assert b.pending('XYZ') == -200, "the XYZ sell is still waiting"
f = b.on_slice({'SPY': (50.2, 50.6, 50.1, 50.4, 5000), 'XYZ': (20.3, 20.6, 20.2, 20.4, 10000)})
got = sorted((s, q, round(px, 2), fee) for s, q, px, fee in f)
assert got == [('SPY', 100, 50.23, 1.0), ('XYZ', -200, 20.5, 1.0)], f"the SPY rest at 50.23 and the XYZ sell limit at 20.50 (fee at the minimum), got {got}"
assert b.pending('SPY') == 0 and b.pending('XYZ') == 0, "nothing waiting"
b.submit('SPY', 100, limit=10.0)
assert b.on_slice({'SPY': (10.2, 10.4, 10.0, 10.1, 5000)}) == [], "a low that only touches the limit does not fill"
assert b.pending('SPY') == 100, "the limit keeps waiting"`,
          why: 'Every assumption about trading costs now sits in one class with five numbers. Raise them and rerun, and you see how much of a result is the strategy and how much is the fill model being kind.',
        },
        {
          kind: 'output',
          id: 'engine-lab-3',
          ask: 'Step 3: the timing by hand. Each bar is (open, close). A pending order fills at the next open plus $0.02; the target is 100 after a bar that rises, 0 after one that falls. What does this print?',
          code: `bars = [(100.0, 101.0), (101.5, 102.0), (101.0, 100.0)]
pending, pos, fills = 0, 0, []
for i, (o, c) in enumerate(bars):
    if pending:
        fills.append((i, round(o + 0.02, 2)))
        pos += pending
        pending = 0
    target = 100 if c > o else 0
    if target - pos - pending:
        pending = target - pos - pending
print(fills, pos, pending)`,
          answer: '[(1, 101.52)] 100 -100',
          why: 'Bar 0 rises, so a buy waits and fills at the open of bar 1 for $101.52; the move from 100 to 101 was never available. Bar 1 rises again but you already hold 100, so nothing is sent. Bar 2 falls: a sell of 100 is pending when the data ends, and the position is still 100.',
        },
        {
          kind: 'write',
          id: 'engine-lab-4',
          ask: 'Step 4: the portfolio. `on_fill(sym, qty, price, fee)` updates cash (−qty × price − fee), the signed position, the average price and realised P&L (fees count against it), handling adds, reductions and flips; a flat symbol has average 0. `unrealised(marks)` and `equity(marks)` take a dict of prices for the symbols held.',
          starter: `class Portfolio:
    def __init__(self, cash):
        self.cash = cash
        self.pos, self.avg = {}, {}
        self.realised = 0.0

    def on_fill(self, sym, qty, price, fee=0.0):
        self.pos[sym] = self.pos.get(sym, 0) + qty
        self.cash -= qty * price

    def unrealised(self, marks):
        return 0.0

    def equity(self, marks):
        return self.cash`,
          solution: `class Portfolio:
    def __init__(self, cash):
        self.cash = cash
        self.pos, self.avg = {}, {}
        self.realised = 0.0

    def on_fill(self, sym, qty, price, fee=0.0):
        pos, avg = self.pos.get(sym, 0), self.avg.get(sym, 0.0)
        self.cash -= qty * price + fee
        self.realised -= fee
        if pos == 0 or (pos > 0) == (qty > 0):
            avg = (avg * pos + price * qty) / (pos + qty)
        else:
            closed = min(abs(qty), abs(pos))
            self.realised += closed * (price - avg) * (1 if pos > 0 else -1)
            if abs(qty) > abs(pos):
                avg = price
        pos += qty
        self.pos[sym] = pos
        self.avg[sym] = avg if pos else 0.0

    def unrealised(self, marks):
        return sum((marks[s] - self.avg[s]) * q for s, q in self.pos.items() if q)

    def equity(self, marks):
        return self.cash + sum(q * marks[s] for s, q in self.pos.items() if q)`,
          tests: `p = Portfolio(10000.0)
p.on_fill('A', 100, 20.0, 1.0)
assert abs(p.cash - 7999.0) < 1e-9, f"cash after buying 100 at 20 with a $1 fee is 7,999, got {p.cash}"
assert abs(p.realised + 1.0) < 1e-9, f"the fee counts against realised P&L, got {p.realised}"
p.on_fill('A', -250, 22.0, 1.0)
assert p.pos['A'] == -150 and abs(p.avg['A'] - 22.0) < 1e-9, "the flip leaves short 150 at 22"
out = p.unrealised({'A': 21.0})
assert out is not None, "unrealised returns nothing yet"
assert abs(out - 150.0) < 1e-9, f"short 150 from 22, mark 21: +150, got {out}"
assert abs(p.realised - 198.0) < 1e-9, f"200 realised on the flip minus $2 of fees, got {p.realised}"
m = {'A': 21.0}
assert abs(p.equity(m) - 10000.0 - p.realised - p.unrealised(m)) < 1e-9, "equity - start must equal realised + unrealised"
p.on_fill('B', 10, 50.0)
p.on_fill('B', -10, 48.0)
assert p.pos['B'] == 0 and p.avg['B'] == 0.0, "flat after a round trip, average 0"`,
          why: 'This is the class every result passes through. The identity in the tests is the one to keep checking: it ties the cash, which only fills change, to the P&L, which the reports show.',
        },
        {
          kind: 'write',
          id: 'engine-lab-5',
          ask: "Step 5: the strategy. `Trend(n, size).targets(data, syms)` returns a dict of target positions for the symbols in `syms`: for each one with at least n closes in `data.history(sym, n)`, `size` if the last close is above the mean of those n closes, else 0. Leave out symbols with fewer than n closes.",
          starter: `class Trend:
    def __init__(self, n, size):
        self.n, self.size = n, size

    def targets(self, data, syms):
        return {s: self.size for s in syms}`,
          solution: `class Trend:
    def __init__(self, n, size):
        self.n, self.size = n, size

    def targets(self, data, syms):
        out = {}
        for s in syms:
            h = data.history(s, self.n)
            if len(h) < self.n:
                continue
            out[s] = self.size if h[-1] > sum(h) / self.n else 0
        return out`,
          tests: `class Fake:
    def __init__(self, h):
        self.h = h
    def history(self, sym, n):
        return self.h[sym][-n:]
d = Fake({'A': [10, 11, 12], 'B': [12, 11, 10], 'C': [5]})
out = Trend(3, 100).targets(d, ['A', 'B', 'C'])
assert out is not None, "targets returns nothing yet"
assert out == {'A': 100, 'B': 0}, f"A closes above its mean, B below, C has too little history: got {out}"
assert Trend(2, 50).targets(d, ['C']) == {}, "no target without n closes"
assert Trend(3, 100).targets(Fake({'A': [10, 10, 10]}), ['A']) == {'A': 0}, "equal to the mean is not above it"`,
          why: 'The strategy asks for history and returns targets. It does not know about orders, fills, cash or whether it is running live. That narrow job is what makes it testable on its own with a fake data object.',
        },
        {
          kind: 'write',
          id: 'engine-lab-6',
          ask: "Step 6: the engine. Write `run(bars, broker, portfolio, strategy)`. For each slice from a `DataHandler(bars)`: first pass the broker's fills for this slice to the portfolio; then update the marks to each bar's close and record `portfolio.equity(marks)`; then, for each target the strategy returns for the symbols in this slice, send `target − position − broker.pending(sym)` as a market order if it is not zero. Return `{'equity': list, 'fills': number of fills, 'pos': dict of positions}`.",
          starter: `import math

class DataHandler:
    def __init__(self, bars):
        self.bars = bars
        self.times = sorted({b[0] for rows in bars.values() for b in rows})
        self.i, self.ptr = -1, {s: 0 for s in bars}
        self.closes = {s: [] for s in bars}
    def next_slice(self):
        self.i += 1
        if self.i >= len(self.times):
            return None
        t, out = self.times[self.i], {}
        for s, rows in self.bars.items():
            k = self.ptr[s]
            if k < len(rows) and rows[k][0] == t:
                out[s] = rows[k][1:]
                self.closes[s].append(rows[k][4])
                self.ptr[s] = k + 1
        return t, out
    def history(self, sym, n):
        return self.closes[sym][-n:]

class SimBroker:
    def __init__(self, half_spread=0.0, slip=0.0, cap=1.0, per_share=0.0, min_fee=0.0):
        self.half_spread, self.slip, self.cap = half_spread, slip, cap
        self.per_share, self.min_fee, self.orders = per_share, min_fee, []
    def submit(self, sym, qty, limit=None):
        self.orders.append({'sym': sym, 'qty': qty, 'limit': limit})
    def pending(self, sym):
        return sum(o['qty'] for o in self.orders if o['sym'] == sym)
    def on_slice(self, bars):
        fills, keep = [], []
        for od in self.orders:
            bar = bars.get(od['sym'])
            if bar is None:
                keep.append(od)
                continue
            o, h, l, c, v = bar
            side = 1 if od['qty'] > 0 else -1
            size = min(abs(od['qty']), math.floor(self.cap * v))
            lim = od['limit']
            if lim is None:
                price = o + side * (self.half_spread + self.slip)
            elif side == 1:
                price = o if o <= lim else (lim if l < lim else None)
            else:
                price = o if o >= lim else (lim if h > lim else None)
            if price is None or size == 0:
                keep.append(od)
                continue
            fills.append((od['sym'], side * size, price, max(self.min_fee, self.per_share * size)))
            if od['qty'] - side * size:
                keep.append({**od, 'qty': od['qty'] - side * size})
        self.orders = keep
        return fills

class Portfolio:
    def __init__(self, cash):
        self.cash, self.pos, self.avg, self.realised = cash, {}, {}, 0.0
    def on_fill(self, sym, qty, price, fee=0.0):
        pos, avg = self.pos.get(sym, 0), self.avg.get(sym, 0.0)
        self.cash -= qty * price + fee
        self.realised -= fee
        if pos == 0 or (pos > 0) == (qty > 0):
            avg = (avg * pos + price * qty) / (pos + qty)
        else:
            self.realised += min(abs(qty), abs(pos)) * (price - avg) * (1 if pos > 0 else -1)
            if abs(qty) > abs(pos):
                avg = price
        pos += qty
        self.pos[sym], self.avg[sym] = pos, (avg if pos else 0.0)
    def unrealised(self, marks):
        return sum((marks[s] - self.avg[s]) * q for s, q in self.pos.items() if q)
    def equity(self, marks):
        return self.cash + sum(q * marks[s] for s, q in self.pos.items() if q)

class Trend:
    def __init__(self, n, size):
        self.n, self.size = n, size
    def targets(self, data, syms):
        out = {}
        for s in syms:
            h = data.history(s, self.n)
            if len(h) >= self.n:
                out[s] = self.size if h[-1] > sum(h) / self.n else 0
        return out

def run(bars, broker, portfolio, strategy):
    return {'equity': [], 'fills': 0, 'pos': {}}`,
          solution: `import math

class DataHandler:
    def __init__(self, bars):
        self.bars = bars
        self.times = sorted({b[0] for rows in bars.values() for b in rows})
        self.i, self.ptr = -1, {s: 0 for s in bars}
        self.closes = {s: [] for s in bars}
    def next_slice(self):
        self.i += 1
        if self.i >= len(self.times):
            return None
        t, out = self.times[self.i], {}
        for s, rows in self.bars.items():
            k = self.ptr[s]
            if k < len(rows) and rows[k][0] == t:
                out[s] = rows[k][1:]
                self.closes[s].append(rows[k][4])
                self.ptr[s] = k + 1
        return t, out
    def history(self, sym, n):
        return self.closes[sym][-n:]

class SimBroker:
    def __init__(self, half_spread=0.0, slip=0.0, cap=1.0, per_share=0.0, min_fee=0.0):
        self.half_spread, self.slip, self.cap = half_spread, slip, cap
        self.per_share, self.min_fee, self.orders = per_share, min_fee, []
    def submit(self, sym, qty, limit=None):
        self.orders.append({'sym': sym, 'qty': qty, 'limit': limit})
    def pending(self, sym):
        return sum(o['qty'] for o in self.orders if o['sym'] == sym)
    def on_slice(self, bars):
        fills, keep = [], []
        for od in self.orders:
            bar = bars.get(od['sym'])
            if bar is None:
                keep.append(od)
                continue
            o, h, l, c, v = bar
            side = 1 if od['qty'] > 0 else -1
            size = min(abs(od['qty']), math.floor(self.cap * v))
            lim = od['limit']
            if lim is None:
                price = o + side * (self.half_spread + self.slip)
            elif side == 1:
                price = o if o <= lim else (lim if l < lim else None)
            else:
                price = o if o >= lim else (lim if h > lim else None)
            if price is None or size == 0:
                keep.append(od)
                continue
            fills.append((od['sym'], side * size, price, max(self.min_fee, self.per_share * size)))
            if od['qty'] - side * size:
                keep.append({**od, 'qty': od['qty'] - side * size})
        self.orders = keep
        return fills

class Portfolio:
    def __init__(self, cash):
        self.cash, self.pos, self.avg, self.realised = cash, {}, {}, 0.0
    def on_fill(self, sym, qty, price, fee=0.0):
        pos, avg = self.pos.get(sym, 0), self.avg.get(sym, 0.0)
        self.cash -= qty * price + fee
        self.realised -= fee
        if pos == 0 or (pos > 0) == (qty > 0):
            avg = (avg * pos + price * qty) / (pos + qty)
        else:
            self.realised += min(abs(qty), abs(pos)) * (price - avg) * (1 if pos > 0 else -1)
            if abs(qty) > abs(pos):
                avg = price
        pos += qty
        self.pos[sym], self.avg[sym] = pos, (avg if pos else 0.0)
    def unrealised(self, marks):
        return sum((marks[s] - self.avg[s]) * q for s, q in self.pos.items() if q)
    def equity(self, marks):
        return self.cash + sum(q * marks[s] for s, q in self.pos.items() if q)

class Trend:
    def __init__(self, n, size):
        self.n, self.size = n, size
    def targets(self, data, syms):
        out = {}
        for s in syms:
            h = data.history(s, self.n)
            if len(h) >= self.n:
                out[s] = self.size if h[-1] > sum(h) / self.n else 0
        return out

def run(bars, broker, portfolio, strategy):
    data = DataHandler(bars)
    marks, equity, nfills = {}, [], 0
    while True:
        sl = data.next_slice()
        if sl is None:
            break
        t, now = sl
        for sym, qty, price, fee in broker.on_slice(now):
            portfolio.on_fill(sym, qty, price, fee)
            nfills += 1
        for s, bar in now.items():
            marks[s] = bar[3]
        equity.append(portfolio.equity(marks))
        for s, tgt in strategy.targets(data, list(now)).items():
            qty = tgt - portfolio.pos.get(s, 0) - broker.pending(s)
            if qty:
                broker.submit(s, qty)
    return {'equity': equity, 'fills': nfills, 'pos': dict(portfolio.pos)}`,
          tests: `closes = [10, 10.2, 10.4, 10.6, 10.5, 10.2, 9.9, 9.7, 9.9, 10.3]
bars = {'A': [(t, c - 0.05, c + 0.1, c - 0.1, c, 10000) for t, c in enumerate(closes)]}
out = run(bars, SimBroker(), Portfolio(10000.0), Trend(3, 100))
assert out is not None and out['equity'], "run returns no equity curve yet"
assert len(out['equity']) == 10, f"one equity value per slice, got {len(out['equity'])}"
assert out['equity'][2] == 10000.0, "the first order is sent on slice 2 and cannot have filled yet"
assert out['fills'] == 3, f"buy on slice 3, sell on slice 6, buy on slice 9: 3 fills, got {out['fills']}"
assert out['pos'] == {'A': 100}, f"long 100 at the end, got {out['pos']}"
assert abs(out['equity'][-1] - 9965.0) < 1e-6, f"final equity with no costs is 9,965, got {out['equity'][-1]}"
thin = {'A': [(t, c - 0.05, c + 0.1, c - 0.1, c, 400) for t, c in enumerate(closes)]}
out2 = run(thin, SimBroker(cap=0.1), Portfolio(10000.0), Trend(3, 100))
assert max(abs(q) for q in out2['pos'].values()) <= 100, f"with partial fills the position must never pass the target of 100, got {out2['pos']}"
two = dict(bars)
two['B'] = [(t, 50 - c, 50 - c + 0.1, 50 - c - 0.2, 50 - c, 10000) for t, c in enumerate(closes) if t % 2 == 0]
out3 = run(two, SimBroker(half_spread=0.01, per_share=0.005, min_fee=1.0), Portfolio(10000.0), Trend(3, 100))
assert len(out3['equity']) == 10, "two symbols, ten times: ten slices"
assert out3['equity'][-1] < out['equity'][-1] + 100, "costs are charged"`,
          why: 'The loop is short because every part has one job: fills first, then marks, then decisions. The partial-fill test is the important one. It fails if pending orders are left out of the size, and the next step shows how that looks.',
        },
        {
          kind: 'bug',
          id: 'engine-lab-7',
          ask: 'Step 7: an earlier version of the loop. On liquid stocks it matches the final engine. On thin stocks, where orders fill in parts, positions end up several times the target. Which line is wrong?',
          code: `def run(bars, broker, portfolio, strategy):
    data = DataHandler(bars)
    marks, equity = {}, []
    while (sl := data.next_slice()) is not None:
        t, now = sl
        for sym, qty, price, fee in broker.on_slice(now):
            portfolio.on_fill(sym, qty, price, fee)
        for s, bar in now.items():
            marks[s] = bar[3]
        equity.append(portfolio.equity(marks))
        for s, tgt in strategy.targets(data, list(now)).items():
            qty = tgt - portfolio.pos.get(s, 0)
            if qty:
                broker.submit(s, qty)
    return equity`,
          line: 12,
          fix: '            qty = tgt - portfolio.pos.get(s, 0) - broker.pending(s)',
          why: 'When an order fills in full on the next bar, nothing is ever pending at decision time, so the bug is invisible. With partial fills, every bar sends the whole shortfall again on top of what is still waiting, and the waiting orders pile up. Test the engine on thin data on purpose.',
        },
        {
          kind: 'write',
          id: 'engine-lab-8',
          ask: "Step 8: tests for the accounting. Write `accounting_suite(cls)`, which runs hand-worked cases on a portfolio class with the step 4 interface and returns the names of the cases that fail (a crash counts as a failure), each on a fresh `cls(10000.0)`: 'buy' (buy 100 at 50: cash 5,000, position 100, average 50); 'add' (then buy 100 at 52: average 51); 'reduce' (buy 100 at 50, sell 50 at 52: realised 100, average still 50); 'flip' (buy 100 at 20, sell 250 at 22: realised 200, position −150, average 22); 'fee' (buy 100 at 50 with a fee of 1: realised −1, cash 4,999).",
          starter: `def accounting_suite(cls):
    failed = []
    return failed`,
          solution: `def accounting_suite(cls):
    def near(a, b):
        return abs(a - b) < 1e-9

    def buy(p):
        p.on_fill('X', 100, 50.0, 0.0)
        return near(p.cash, 5000.0) and p.pos['X'] == 100 and near(p.avg['X'], 50.0)

    def add(p):
        p.on_fill('X', 100, 50.0, 0.0)
        p.on_fill('X', 100, 52.0, 0.0)
        return near(p.avg['X'], 51.0)

    def reduce(p):
        p.on_fill('X', 100, 50.0, 0.0)
        p.on_fill('X', -50, 52.0, 0.0)
        return near(p.realised, 100.0) and near(p.avg['X'], 50.0)

    def flip(p):
        p.on_fill('X', 100, 20.0, 0.0)
        p.on_fill('X', -250, 22.0, 0.0)
        return near(p.realised, 200.0) and p.pos['X'] == -150 and near(p.avg['X'], 22.0)

    def fee(p):
        p.on_fill('X', 100, 50.0, 1.0)
        return near(p.realised, -1.0) and near(p.cash, 4999.0)

    failed = []
    for name, case in [('buy', buy), ('add', add), ('reduce', reduce), ('flip', flip), ('fee', fee)]:
        try:
            ok = case(cls(10000.0))
        except Exception:
            ok = False
        if not ok:
            failed.append(name)
    return failed`,
          tests: `class Portfolio:
    def __init__(self, cash):
        self.cash, self.pos, self.avg, self.realised = cash, {}, {}, 0.0
    def on_fill(self, sym, qty, price, fee=0.0):
        pos, avg = self.pos.get(sym, 0), self.avg.get(sym, 0.0)
        self.cash -= qty * price + fee
        self.realised -= fee
        if pos == 0 or (pos > 0) == (qty > 0):
            avg = (avg * pos + price * qty) / (pos + qty)
        else:
            closed = min(abs(qty), abs(pos))
            self.realised += closed * (price - avg) * (1 if pos > 0 else -1)
            if abs(qty) > abs(pos):
                avg = price
        pos += qty
        self.pos[sym], self.avg[sym] = pos, (avg if pos else 0.0)
class FlipBug(Portfolio):
    def on_fill(self, sym, qty, price, fee=0.0):
        pos, avg = self.pos.get(sym, 0), self.avg.get(sym, 0.0)
        super().on_fill(sym, qty, price, fee)
        if pos and (pos > 0) != (qty > 0) and abs(qty) > abs(pos):
            self.realised += (abs(qty) - abs(pos)) * (price - avg) * (1 if pos > 0 else -1)
class FeeBug(Portfolio):
    def on_fill(self, sym, qty, price, fee=0.0):
        super().on_fill(sym, qty, price, fee)
        self.realised += fee
class AverageBug(Portfolio):
    def on_fill(self, sym, qty, price, fee=0.0):
        pos, avg = self.pos.get(sym, 0), self.avg.get(sym, 0.0)
        self.cash -= qty * price + fee
        self.realised -= fee
        pos += qty
        self.pos[sym] = pos
        self.avg[sym] = (avg * (pos - qty) + price * qty) / pos if pos else 0.0
out = accounting_suite(Portfolio)
assert out is not None, "accounting_suite returns nothing yet"
assert out == [], f"a correct portfolio passes every case, got {out}"
assert 'flip' in accounting_suite(FlipBug), "realising P&L on the shares that open the new short must fail 'flip'"
assert 'fee' in accounting_suite(FeeBug), "a fee left out of realised P&L must fail 'fee'"
r = accounting_suite(AverageBug)
assert 'reduce' in r and 'flip' in r, f"averaging sells into the price and never realising must fail 'reduce' and 'flip', got {r}"
assert 'buy' not in r and 'add' not in r, f"that bug does not affect buying, got {r}"`,
          why: 'A test suite is only worth having if it fails on broken code. Running it against deliberately broken classes, as these tests do, is how you test the tests. Every expected number here was worked out by hand, not copied from the code.',
        },
        {
          kind: 'design',
          id: 'engine-lab-9',
          ask: 'Step 9: the engine runs on made-up bars and passes its tests. List what you would add before trusting its results on real data, and then before pointing it at a paper account.',
          checklist: [
            { point: 'A time-ordered event queue with fills before bars at a shared time, in place of the fixed order in the loop', why: 'Delayed fills, timers and expiring orders need it.' },
            { point: 'Bars restamped to their end time, stale prices flagged, a warm-up from earlier data', why: 'The data handler is where most lookahead starts.' },
            { point: 'Stop orders, order expiry and cancels in the simulated broker', why: 'Real strategies use them, and gaps through stops are where losses grow.' },
            { point: 'The vectorised cross-check and the lookahead test on every feature', why: 'They catch timing bugs the unit tests cannot see.' },
            { point: 'The invariant test on random fills and a run-twice determinism test', why: 'Combinations and hidden randomness are checked every time the code changes.' },
            { point: 'Configuration, seed, data fingerprint and code version saved with every result', why: 'Every number must be reproducible.' },
            { point: 'Data, broker and clock behind interfaces, with a paper adapter that returns ids now and fills later', why: 'The same strategy and portfolio code then runs on the paper account.' },
            { point: 'Startup reconciliation, decision logs and a replay of the paper day through the backtest', why: 'Parity is shown, not assumed.' },
          ],
          why: 'A working engine is the start. The tests and the parity checks are what let you believe a number it prints, and even then a good backtest is an upper bound on what live trading will give.',
        },
      ],
    },
  ],
}
