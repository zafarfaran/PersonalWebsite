import type { Module } from '../types'

export const algo: Module = {
  id: 'algo',
  title: 'Algorithmic trading systems',
  summary:
    'Turning tested rules into a program that trades, and keeping it from hurting you: the parts of a trading system, market data and broker APIs, order states, execution algorithms, risk checks and kill switches, and the road from backtest to paper to live.',
  lessons: [
    {
      id: 'algo-kinds',
      title: 'What a trading algorithm is',
      summary: 'Execution, market making, statistical arbitrage and rule-based systems, and the race on speed that an individual should not enter.',
      text: [
        'An **algorithm** here is a program that turns market data into orders without a person clicking. It can do two separate jobs, and most systems do only one: deciding **what** to hold (the strategy) and deciding **how** to trade it (execution). By volume, most algorithmic trading is the second: funds and brokers working large orders into the market so they cost less.',
        'There are four broad kinds. **Execution algorithms** take a trade someone has already decided on and slice it into the market. **Market making** quotes a bid and an ask all day, earns the spread and must manage the inventory it is left holding. **Statistical arbitrage** makes many small bets on relationships between prices (the quant module). **Trend and rule-based systems** act on bars and hold for minutes to weeks.',
        "**Latency** is the time from an event to your order reaching the market. Firms that compete on speed rent space beside the exchange's servers (**co-location**) and count in microseconds, millionths of a second. A program at home talking to a broker over the internet takes tens to hundreds of milliseconds, thousandths of a second, plus the broker's own routing: a thousand times slower or more. Any edge that depends on being first, such as reacting to headlines, arbitrage between venues or being at the front of the queue, belongs to them.",
        'What automation gives an individual is **consistency**: the rules run the same way on every bar, without hesitation, fatigue or revenge trades. It does not give an edge the rules lack. A rule with negative expectancy, automated, loses money faster, because a program trades more often than you would and never stops to wonder.',
        'So an individual works at horizons where a few hundred milliseconds do not matter, in liquid instruments, with limit orders, on rules whose expectancy after costs was measured before anything was automated. Most retail day traders lose money, and a program does not change those odds by itself.',
      ],
      rules: [
        'Strategy decides what to hold; execution decides how to trade it.',
        'The kinds: execution, market making, statistical arbitrage, trend and rule-based.',
        'You cannot win a race measured in microseconds from a home connection. Do not enter it.',
        'Automation buys consistency, not edge. A losing rule automated loses faster.',
        'Pick horizons where a few hundred milliseconds of delay cost little.',
      ],
      questions: [
        {
          kind: 'choice',
          id: 'algo-kinds-1',
          ask: 'A pension fund has decided to buy 2 million shares of a stock today and wants to pay as little as possible above the current price. What kind of algorithm does it need?',
          options: ['Market making', 'An execution algorithm', 'Statistical arbitrage', 'A trend-following system'],
          answer: 1,
          why: 'The decision to buy is made. What is left is how to trade it at the lowest cost, which is the job of an execution algorithm. A trend system would decide whether to buy at all.',
        },
        {
          kind: 'choice',
          id: 'algo-kinds-2',
          ask: 'A market-making program quotes a stock at 50.00 bid and 50.01 ask all day. What is its main risk?',
          options: [
            'That a one-cent spread is too small to matter',
            'Being left holding shares shortly before the price moves against it, often because faster or better-informed traders took its quotes',
            'Paying the spread on every trade',
            'Running out of orders to send',
          ],
          answer: 1,
          why: 'A market maker earns the spread when buyers and sellers arrive at random. When its quotes are hit because someone knows the price is about to move, it ends up long before a fall or short before a rise. That is called adverse selection, and managing it needs speed and data an individual does not have.',
        },
        {
          kind: 'number',
          id: 'algo-kinds-3',
          ask: 'A co-located firm reacts to a price change in 50 microseconds. Your program needs 80 milliseconds from the same change to its order reaching the exchange. How many times slower are you?',
          answer: 1600,
          check: '0.080 / 0.000050',
          hint: 'Put both in seconds: a microsecond is 0.000001 s and a millisecond is 0.001 s.',
          why: '0.080 ÷ 0.000050 = 1,600. By the time your order arrives, the firm could have reacted 1,600 times. Strategies that need to be first are not available to you.',
        },
        {
          kind: 'number',
          id: 'algo-kinds-4',
          ask: 'A made-up market maker quotes 100.00 bid and 100.02 ask. In a day it buys 100 shares at the bid and later sells them at the ask 500 times. Fees are $0.003 per share on every trade. If the price never moved against it, how much does it make in dollars?',
          answer: 700,
          check: '(0.02 - 2 * 0.003) * 100 * 500',
          why: 'Each round trip earns 2 cents a share and pays 0.6 cents in fees: 1.4 cents × 100 shares × 500 = $700. The "if" carries the risk: a few round trips where the price runs away while it holds inventory can take all of that back.',
        },
        {
          kind: 'choice',
          id: 'algo-kinds-5',
          ask: 'Which of these could an individual with a home connection and a broker API realistically run?',
          options: [
            'Buying futures the moment the ETF ticks up on another exchange, a few microseconds earlier',
            'A rule on 15-minute SPY bars that holds for an hour or more and enters with limit orders',
            'Trading headlines within a millisecond of their release',
            'Quoting both sides of SPY all day to earn the spread',
          ],
          answer: 1,
          why: 'Only the 15-minute rule does not depend on speed. A few hundred milliseconds of delay is small next to an hour-long hold. The other three are races that co-located firms win.',
        },
        {
          kind: 'output',
          id: 'algo-kinds-6',
          ask: 'A buy signal fires, and the best ask then moves every 10 milliseconds. How much more than the ask at the signal do you pay with 10 ms and with 40 ms of delay? What does this print?',
          code: `asks = [100.00, 100.01, 100.03, 100.04, 100.06]   # best ask every 10 ms after the signal
for latency_ms in (10, 40):
    fill = asks[latency_ms // 10]
    print(latency_ms, round(fill - asks[0], 2))`,
          answer: '10 0.01\n40 0.06',
          why: 'The order meets the ask that is there when it arrives: index 1 after 10 ms and index 4 after 40 ms. Signals that fire when price is moving, such as breakouts, keep moving while your order travels, so delay costs most exactly when you most want in.',
        },
        {
          kind: 'write',
          id: 'algo-kinds-7',
          ask: 'Write `late_fill`: given quote times in milliseconds (sorted) and the best ask at each, return the ask your order meets when it was sent at `signal_time` and takes `latency` ms to arrive: the first ask whose time is at or after the arrival. Return `None` if the order arrives after the last quote.',
          starter: `def late_fill(times, asks, signal_time, latency):
    # the first ask at or after signal_time + latency
    pass`,
          solution: `def late_fill(times, asks, signal_time, latency):
    arrive = signal_time + latency
    for t, a in zip(times, asks):
        if t >= arrive:
            return a
    return None`,
          tests: `times = [0, 10, 20, 30, 40]
asks = [100.00, 100.01, 100.03, 100.04, 100.06]
out = late_fill(times, asks, 0, 15)
assert out is not None, "the function returns nothing yet"
assert out == 100.03, f"an order arriving at 15 ms meets the ask quoted at 20 ms, 100.03, got {out}"
assert late_fill(times, asks, 0, 0) == 100.00, "with no delay you meet the ask at the signal"
assert late_fill(times, asks, 10, 30) == 100.06, "a signal at 10 ms with 30 ms of delay arrives at 40 ms"
assert late_fill(times, asks, 0, 50) is None, "an order arriving after the last quote has no price here"`,
          why: 'The price you get is the one in force when the order arrives, not when you decided. Replaying quotes with a delay like this is a cheap way to see how much latency costs a signal before you trade it.',
        },
        {
          kind: 'choice',
          id: 'algo-kinds-8',
          ask: 'What does automating a rule you have already tested give an individual trader?',
          options: [
            'Speed that beats professional firms',
            'The same decision on every bar, without hesitation, fatigue or revenge trades',
            'An edge the rule did not have when traded by hand',
            'Protection from losses, because the program always follows the stop',
          ],
          answer: 1,
          why: 'Consistency is the real benefit. Speed goes to co-located firms, an edge must already be in the rule, and a program follows its stop only as well as it was written and only while it is running.',
        },
        {
          kind: 'number',
          id: 'algo-kinds-9',
          ask: 'A rule has an expectancy of −0.05R per trade after costs. By hand you take 4 trades a day; automated it takes 40. With R = $50, how much more does the automated version lose per day on average, in dollars?',
          answer: 90,
          check: '40 * 0.05 * 50 - 4 * 0.05 * 50',
          why: 'By hand: 4 × 0.05 × $50 = $10 a day. Automated: 40 × 0.05 × $50 = $100. The program multiplies whatever edge the rule has, and here it multiplies a loss by ten.',
        },
        {
          kind: 'choice',
          id: 'algo-kinds-10',
          ask: 'Which of these is statistical arbitrage?',
          options: [
            'Buying one oil company and shorting another when the gap between them is unusually wide, across hundreds of such pairs',
            'Splitting a 50,000-share order into slices through the day',
            'Quoting a bid and an ask in one stock',
            'Buying SPY when it closes above its 20-bar high',
          ],
          answer: 0,
          why: 'Statistical arbitrage bets on relationships between prices, many at once, each with a small edge. The second option is execution, the third market making and the fourth a rule-based trend system.',
        },
        {
          kind: 'design',
          id: 'algo-kinds-11',
          ask: 'You trade an opening range breakout on SPY by hand and have a tested record of it. You want to automate it. Write down what kind of system it is, what you will and will not try to do with it, and what must exist before it trades money.',
          checklist: [
            { point: 'It is a rule-based system on bars, holding minutes to hours', why: 'The horizon decides whether latency matters, and at this one a few hundred milliseconds barely do.' },
            { point: 'No part of the edge depends on being first', why: 'A home connection loses every race against co-located firms.' },
            { point: 'Orders are limit orders, or marketable limits with a price cap', why: 'Market orders in a fast open pay whatever the book offers.' },
            { point: 'The automated rules are exactly the tested rules', why: 'Adding filters while automating means you are running something untested.' },
            { point: 'Expectancy after costs measured before automating', why: 'Automation multiplies whatever edge there is, including a negative one.' },
            { point: 'Risk checks and a kill switch before any live order', why: 'A program can repeat a mistake hundreds of times before you notice.' },
            { point: 'Paper trading first, then the smallest live size', why: 'The rule may be old, but the program, the data and the broker connection are new.' },
          ],
          why: 'Automation is an engineering project around a trading rule. The rule has to earn its keep first, and the engineering has to stop the program from doing harm when something breaks.',
        },
      ],
    },
    {
      id: 'algo-anatomy',
      title: 'Anatomy of a trading system',
      summary: 'Data feed, strategy, risk checks, execution and records, joined by an event loop; event-driven code against vectorised code.',
      text: [
        'A trading system is five parts with narrow jobs. The **data feed** receives bars or ticks and turns them into events of one format. The **strategy** reads events and says what position it wants. **Risk checks** look at every order before it leaves and can refuse it. **Execution** turns the wanted position into broker orders and follows them until they finish. **Record keeping** writes down every event, order and fill, and keeps the positions and the P&L.',
        'The strategy never talks to the broker. It returns an intent, such as "I want to hold 100 SPY", and only execution sends orders, and only after the risk checks have passed them. This one rule means a limit set in one place cannot be gone around.',
        'The parts are joined by an **event loop**: a queue of events handled one at a time. A bar event goes to the strategy, which may produce an order event, which goes through risk to execution, whose fills come back as fill events for the records. Each handler may add new events to the queue.',
        { code: `from collections import deque

queue = deque([{'type': 'bar', 'close': 101.2}])
while queue:
    event = queue.popleft()                    # first in, first out
    for new in handlers[event['type']](event):  # a handler returns new events
        queue.append(new)` },
        '**Vectorised** code computes a whole history at once with NumPy arrays. It is fast, and ideal for a first look at an idea. It cannot model what happens between events (an order waiting, a partial fill, a check that refuses an order), and it makes lookahead easy, because the whole future is in the array. **Event-driven** code handles one event at a time, as live trading does, and its prize is that the same strategy and risk code runs in the backtest and live: only the data source and the broker are swapped.',
      ],
      rules: [
        'Five parts: data feed, strategy, risk checks, execution, records.',
        'The strategy returns an intent. Only execution sends orders, and only after risk passes them.',
        'An event loop takes events first in, first out; handlers may add new ones.',
        'Vectorised code to discard ideas fast; event-driven code for anything you will run.',
        'Positions and P&L come from fills, not from what you meant to do.',
      ],
      questions: [
        {
          kind: 'choice',
          id: 'algo-anatomy-1',
          ask: 'In a well-built system, which path does an order take?',
          options: [
            'Data feed → strategy → broker, with risk checked afterwards from the fills',
            'Data feed → strategy → risk checks → execution → broker, with every step recorded',
            'Strategy → broker → data feed → records',
            'Risk checks → strategy → broker, so the strategy only sees safe data',
          ],
          answer: 1,
          why: 'Risk sits between the decision and the broker, so it can refuse an order before it exists in the market. Checking after the fill is too late, and records only help if every step is in them.',
        },
        {
          kind: 'output',
          id: 'algo-anatomy-2',
          ask: 'A tiny event loop. What does this print?',
          code: `from collections import deque

q = deque(['bar'])
log = []
while q:
    e = q.popleft()
    log.append(e)
    if e == 'bar':
        q.append('signal')
    elif e == 'signal':
        q.append('order')
    elif e == 'order':
        q.append('fill')
print(log)`,
          answer: "['bar', 'signal', 'order', 'fill']",
          why: 'Each handler adds the next event to the queue, and the loop runs until the queue is empty. One bar produced a chain of three more events. In a real system each step can also stop the chain: the strategy may see no signal, or risk may refuse the order.',
        },
        {
          kind: 'bug',
          id: 'algo-anatomy-3',
          ask: 'A vectorised test of "hold for one bar after an up close". `ret[i]` is the return from close i to close i + 1. The result is far too good: one line lets each position earn the very move that created it.',
          code: `import numpy as np

def strategy_returns(c):
    ret = np.diff(c) / c[:-1]       # ret[i]: from close i to close i + 1
    up = c[1:] > c[:-1]             # up[i]: close i + 1 is above close i
    pos = up.astype(float)
    return pos * ret`,
          line: 6,
          fix: '    pos = np.concatenate([[0.0], up[:-1].astype(float)])',
          why: '`up[i]` is only known at close i + 1, the end of the move `ret[i]`. Multiplying them books every up move as a win. Shifting by one makes position i depend on close i compared with close i − 1, which is known before the move it earns. This is the commonest bug in vectorised backtests.',
        },
        {
          kind: 'choice',
          id: 'algo-anatomy-4',
          ask: 'Why do people build an event-driven system even though vectorised code is much faster?',
          options: [
            'Event-driven code always finds better strategies',
            'The same strategy and risk code can run in the backtest and live, with only the data source and broker swapped, and it can model waiting orders, partial fills and refusals',
            'Brokers only accept orders from event loops',
            'Vectorised code cannot use NumPy',
          ],
          answer: 1,
          why: 'Two programs, one for testing and one for trading, drift apart, and then the live program is untested. One program with swappable edges means that what you tested is what runs.',
        },
        {
          kind: 'write',
          id: 'algo-anatomy-5',
          ask: 'Write the event loop `run(first_events, handlers)`. Events are dicts with a `type`. `handlers` maps a type to a function that takes the event and returns a list of new events. Process events first in, first out, and return the list of types in the order they were processed. An event with no handler is recorded and produces nothing.',
          starter: `from collections import deque

def run(first_events, handlers):
    # process first in, first out; return the types in the order processed
    pass`,
          solution: `from collections import deque

def run(first_events, handlers):
    queue = deque(first_events)
    seen = []
    while queue:
        event = queue.popleft()
        seen.append(event['type'])
        handler = handlers.get(event['type'])
        if handler:
            queue.extend(handler(event))
    return seen`,
          tests: `handlers = {
    'bar': lambda e: [{'type': 'order'}] if e['close'] > 100 else [],
    'order': lambda e: [{'type': 'fill'}],
}
out = run([{'type': 'bar', 'close': 99}, {'type': 'bar', 'close': 101}], handlers)
assert out is not None, "the function returns nothing yet"
assert out == ['bar', 'bar', 'order', 'fill'], f"first in, first out: both bars, then the order from the second bar, then its fill; got {out}"
assert run([], handlers) == [], "no events, nothing processed"
assert run([{'type': 'fill'}], handlers) == ['fill'], "an event with no handler is recorded and produces nothing"`,
          why: 'A deque gives first-in, first-out order cheaply. The loop knows nothing about trading: all the behaviour is in the handlers, which is what lets you swap a simulated broker for a real one without touching the loop.',
        },
        {
          kind: 'bug',
          id: 'algo-anatomy-6',
          ask: 'This bar handler should never let an order reach the broker without passing the risk checks. Which line breaks the rule?',
          code: `def on_bar(bar, state, risk, broker):
    if bar['close'] > state['level']:
        order = {'symbol': 'SPY', 'side': 'buy', 'qty': 100}
        broker.submit(order)`,
          line: 4,
          fix: '        if risk.check(order): broker.submit(order)',
          why: 'One path around the risk checks is enough for a bug to send orders without limit. Better still, the strategy would return the order and let execution do the check and the sending, so there is only one place that can talk to the broker.',
        },
        {
          kind: 'number',
          id: 'algo-anatomy-7',
          ask: 'Your records show these fills in one stock: buy 100 at $50.00, buy 50 at $50.30, sell 120 at $50.50. Using the average cost of the shares held, what is the realised P&L in dollars?',
          answer: 48,
          check: '120 * (50.50 - (100 * 50.00 + 50 * 50.30) / 150)',
          hint: 'The average cost of the 150 shares is (100 × 50.00 + 50 × 50.30) ÷ 150.',
          why: 'Average cost is $7,515 ÷ 150 = $50.10. Selling 120 at $50.50 realises 120 × $0.40 = $48. The 30 shares left still cost $50.10 each, and their P&L is unrealised until they are sold.',
        },
        {
          kind: 'write',
          id: 'algo-anatomy-8',
          ask: 'Write `apply_fills(fills)` for a long-only position. Each fill is `(qty, price)` with positive qty for a buy and negative for a sell (never more than held). Return `(position, avg_cost, realised)`, using average cost; when the position returns to 0, the average cost is 0.',
          starter: `def apply_fills(fills):
    position, avg, realised = 0, 0.0, 0.0
    for qty, price in fills:
        pass
    return position, avg, realised`,
          solution: `def apply_fills(fills):
    position, avg, realised = 0, 0.0, 0.0
    for qty, price in fills:
        if qty > 0:
            avg = (avg * position + price * qty) / (position + qty)
        else:
            realised += -qty * (price - avg)
        position += qty
        if position == 0:
            avg = 0.0
    return position, avg, realised`,
          tests: `out = apply_fills([(100, 50.00), (50, 50.30), (-120, 50.50)])
assert out is not None, "the function returns nothing yet"
pos, avg, realised = out
assert pos == 30, f"150 bought, 120 sold leaves 30, got {pos}"
assert abs(avg - 50.10) < 1e-9, f"the average cost is 50.10 and selling does not change it, got {avg}"
assert abs(realised - 48.0) < 1e-9, f"120 shares sold 0.40 above cost is 48, got {realised}"
pos, avg, realised = apply_fills([(10, 20.0), (-10, 19.0)])
assert pos == 0 and avg == 0.0, "a flat position has no average cost"
assert abs(realised + 10.0) < 1e-9, f"10 shares sold 1.00 below cost lose 10, got {realised}"`,
          why: 'Buys move the average cost; sells realise P&L against it and leave it unchanged. This is the record keeping every later part depends on, and it is built from fills, which are facts, rather than from orders, which are wishes.',
        },
        {
          kind: 'output',
          id: 'algo-anatomy-9',
          ask: 'Positions kept from a list of fills. What does this print?',
          code: `fills = [('SPY', 'buy', 100), ('QQQ', 'buy', 50), ('SPY', 'sell', 40)]
pos = {}
for sym, side, qty in fills:
    pos[sym] = pos.get(sym, 0) + (qty if side == 'buy' else -qty)
print(pos)`,
          answer: "{'SPY': 60, 'QQQ': 50}",
          why: 'Buys add, sells subtract, per symbol. Your program needs this book of positions to check limits, and it must agree with the broker, which the lesson on orders covers.',
        },
        {
          kind: 'choice',
          id: 'algo-anatomy-10',
          ask: 'When is vectorised NumPy code the right tool?',
          options: [
            'For the program that sends live orders',
            'For a first test of many simple ideas on history, to throw away the bad ones quickly',
            'Whenever orders can be partly filled',
            'Never, because it always has lookahead',
          ],
          answer: 1,
          why: 'Vectorised tests are fast enough to try hundreds of variants, and most ideas fail there. Lookahead is a risk you control by shifting signals, not a certainty. Anything you will run gets the event-driven version.',
        },
        {
          kind: 'design',
          id: 'algo-anatomy-11',
          ask: 'Sketch the parts of your own system and what passes between them, so that the same code can run in a backtest, on a paper account and live.',
          checklist: [
            { point: 'One event format for bars, whether from history or from the live feed', why: 'The strategy then cannot tell a backtest from live, and runs the same code in both.' },
            { point: 'The strategy returns a target position or an intent and never calls the broker', why: 'One path to the broker means one place to put the limits.' },
            { point: 'Risk checks as a separate gate that every order passes and that can refuse it', why: 'Limits inside the strategy are only as good as the strategy code.' },
            { point: 'Execution behind a broker interface with a simulated, a paper and a live version', why: 'Swapping only this edge is what makes the backtest a test of the live program.' },
            { point: 'An append-only log of every event, order, fill and risk decision, with timestamps', why: 'When something goes wrong, the log is the only witness.' },
            { point: 'Positions and P&L kept from fills and compared with the broker', why: "Your view and the broker's drift apart; the broker's is the one that counts." },
            { point: 'A kill switch outside the strategy that execution obeys', why: 'It must work when the strategy is the thing that is broken.' },
          ],
          why: 'Narrow parts with clear interfaces are what make a trading program testable. The interfaces matter more than the code inside each part.',
        },
      ],
    },
    {
      id: 'algo-data',
      title: 'Market data and broker APIs',
      summary: 'Bars and ticks, REST and streaming, paper accounts, rate limits, and the clock and time zone bugs that catch everyone.',
      text: [
        '**Bars** summarise an interval: open, high, low, close and volume. **Ticks** are the events themselves: every trade, and every change in the best bid and ask (quotes). Bars are built from ticks, and ticks are large: a busy stock produces many thousands of quotes a minute. A bar is final only when its interval ends. Many feeds stream a bar while it is still forming, and a strategy that acts on it sees signals that can vanish by the close of the bar.',
        "Broker APIs come in two shapes. **REST** is request and response over HTTP: you ask for your account, send an order, fetch history. **Streaming**, usually over a **WebSocket**, keeps a connection open and the server pushes quotes, trades, bars and order updates as they happen. Prices and order updates belong on the stream. Asking for prices over REST in a loop is slow and uses up your **rate limit**, the number of requests allowed per minute. Over the limit, the server refuses with HTTP status 429, and your code must wait and retry rather than hammer it.",
        "At the time of writing (2026), Alpaca offers a trading API for US stocks and options with REST and WebSocket streaming, and a free paper trading environment that simulates fills against real-time quotes; its free data plan streams real-time stock quotes from the IEX exchange only and allows 200 historical data calls a minute. Interactive Brokers offers its TWS API (through its desktop platform or gateway) and a Web API, with paper trading accounts. These details change, so read your broker's documentation. Start on the paper account, and keep API keys in environment variables, never in code or a repository.",
        'Time is a common source of bugs. US stocks trade 9:30 to 16:00 **New York time**, which is UTC−5 in winter and UTC−4 in summer, when daylight saving applies. Store every timestamp in UTC, convert to New York time with a time zone library (`zoneinfo` in Python) for session rules, and never hard-code an offset. Know whether your bars are labelled by their start or their end. Keep the machine clock synchronised, or checks on the age of a quote lie.',
        'Treat incoming data as untrusted: sort it by time, drop duplicates, notice gaps, and refuse to trade on a quote that is more than a few seconds old.',
      ],
      rules: [
        'A bar is final only when its interval ends. Act on finished bars, as the backtest did.',
        'Stream prices and order updates; use REST for actions and occasional checks.',
        'Respect the rate limit: on HTTP 429, wait and retry, never loop faster.',
        'Store times in UTC; convert to New York time with a time zone library. Never hard-code the offset.',
        'Paper account first; API keys in environment variables, never in code.',
        'Sort, de-duplicate and check data for gaps and staleness before the strategy sees it.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'algo-data-1',
          ask: 'In July, New York is on daylight saving time (UTC−4). The market opens at 9:30 New York time. What time is that in UTC? Give hours as a decimal, for example 13:15 is 13.25.',
          answer: 13.5,
          check: '9.5 + 4',
          why: 'Add 4 hours: 13:30 UTC. In winter the same open is 14:30 UTC. A program that schedules the open at a fixed UTC time is an hour wrong for part of the year.',
        },
        {
          kind: 'number',
          id: 'algo-data-2',
          ask: 'In January, New York is on standard time (UTC−5). The regular session closes at 16:00 New York time. What time is that in UTC? Give the hour as a number.',
          answer: 21,
          check: '16 + 5',
          why: '16:00 + 5 hours = 21:00 UTC. In July it would be 20:00 UTC. This is why session rules should be written in New York time and converted with a time zone library.',
        },
        {
          kind: 'bug',
          id: 'algo-data-3',
          ask: 'This should say whether a UTC timestamp falls in the regular session, 9:30 to 16:00 New York time. It computes the local time and then does not use it.',
          code: `from datetime import timedelta

def in_session(ts_utc, offset_hours):
    # offset_hours: New York time minus UTC, -4 in summer and -5 in winter
    local = ts_utc + timedelta(hours=offset_hours)
    minutes = ts_utc.hour * 60 + ts_utc.minute
    return 9 * 60 + 30 <= minutes < 16 * 60`,
          line: 6,
          fix: '    minutes = local.hour * 60 + local.minute',
          why: 'Comparing a UTC clock with New York session hours shifts the session by four or five hours, so the program trades in the afternoon thinking it is the open. In real code, get the offset from `zoneinfo` rather than passing it in.',
        },
        {
          kind: 'output',
          id: 'algo-data-4',
          ask: 'Converting a UTC time to New York summer time. What does this print?',
          code: `from datetime import datetime, timedelta, timezone

ny_summer = timezone(timedelta(hours=-4))
t = datetime(2026, 7, 1, 13, 30, tzinfo=timezone.utc)
print(t.astimezone(ny_summer).strftime('%H:%M'))`,
          answer: '09:30',
          why: '13:30 UTC minus 4 hours is 09:30, the open. A fixed offset is fine for a one-off check on a date you know; for a running program use `zoneinfo.ZoneInfo("America/New_York")`, which knows when daylight saving starts and ends.',
        },
        {
          kind: 'write',
          id: 'algo-data-5',
          ask: 'Write a rate limiter. `allow(now)` returns True, and records the request, if fewer than `limit` requests were allowed in the last `window` seconds (a request exactly `window` seconds old has left the window). Otherwise it returns False and records nothing.',
          starter: `class RateLimiter:
    def __init__(self, limit, window):
        self.limit = limit      # requests allowed
        self.window = window    # per this many seconds
        self.times = []         # times of the requests allowed

    def allow(self, now):
        return True`,
          solution: `class RateLimiter:
    def __init__(self, limit, window):
        self.limit = limit
        self.window = window
        self.times = []

    def allow(self, now):
        self.times = [t for t in self.times if t > now - self.window]
        if len(self.times) < self.limit:
            self.times.append(now)
            return True
        return False`,
          tests: `rl = RateLimiter(3, 60)
out = rl.allow(0)
assert out is not None, "allow returns nothing yet"
assert out is True, "the first request is allowed"
assert rl.allow(1) and rl.allow(2), "requests 2 and 3 are inside the limit"
assert rl.allow(3) is False, "a 4th request within 60 seconds is refused"
assert rl.allow(30) is False, "still 3 requests in the last 60 seconds at t = 30"
assert rl.allow(60.5) is True, "at t = 60.5 the request from t = 0 has left the window"
assert rl.allow(60.6) is False, "the requests at 1, 2 and 60.5 are all in the window"`,
          why: 'Keeping your own count means you slow down before the server refuses you. Refused requests are not recorded, so waiting is enough to get capacity back. Brokers state their limits in their documentation, and they change.',
        },
        {
          kind: 'choice',
          id: 'algo-data-6',
          ask: 'Your program needs the best bid and ask of SPY as they change, and to know at once when an order fills. How should it get them?',
          options: [
            'Ask the REST quote endpoint as often as the rate limit allows',
            'Subscribe to streaming quotes and order updates, and use REST for actions and occasional checks',
            'Download one-minute bars once a minute',
            "Read them from the broker's web page",
          ],
          answer: 1,
          why: 'A stream pushes each change as it happens, with no wasted requests. Polling is always late by up to the polling interval and burns the rate limit you need for orders. REST stays useful for sending orders and for checking state after a reconnect.',
        },
        {
          kind: 'choice',
          id: 'algo-data-7',
          ask: 'Your strategy acts on every bar update from the stream. At 10:02 the 10:00–10:05 bar shows a close above your level and the program buys. At 10:05 the bar closes below the level. What went wrong?',
          options: [
            'Nothing: signals sometimes fail',
            'It acted on a bar that was still forming; the backtest only saw finished bars, so live it trades a different rule',
            'The level was set wrong',
            'The stream was delayed by three minutes',
          ],
          answer: 1,
          why: "Until 10:05 the bar's close is the latest trade, not the close. The backtest only had final closes, so this signal never existed there. Act on bars once they are complete, or test the rule on the same partial updates you will trade.",
        },
        {
          kind: 'write',
          id: 'algo-data-8',
          ask: 'Write `clean_bars(bars, step)`. `bars` is a list of `(t, close)` in the order received, with `t` in minutes. Return `(clean, missing)`: `clean` is sorted by time with one bar per time (the one received last wins), and `missing` lists the times between the first and last bar, every `step` minutes, that have no bar.',
          starter: `def clean_bars(bars, step):
    # one bar per time (last received wins), sorted; and the missing times
    return bars, []`,
          solution: `def clean_bars(bars, step):
    latest = {}
    for t, close in bars:
        latest[t] = close
    clean = sorted(latest.items())
    if not clean:
        return [], []
    missing = [t for t in range(clean[0][0], clean[-1][0] + 1, step) if t not in latest]
    return clean, missing`,
          tests: `bars = [(0, 10.0), (10, 10.2), (5, 10.1), (10, 10.3), (20, 10.5)]
out = clean_bars(bars, 5)
assert out is not None, "the function returns nothing yet"
clean, missing = out
assert clean == [(0, 10.0), (5, 10.1), (10, 10.3), (20, 10.5)], f"sorted, one bar per time, the later 10.3 replacing 10.2; got {clean}"
assert missing == [15], f"the bar at 15 is missing, got {missing}"
assert clean_bars([], 5) == ([], []), "no bars, nothing to report"`,
          why: 'Out-of-order, repeated and missing bars all happen on real feeds, especially after a reconnect. A strategy that counts bars to compute a moving average gives a different answer on dirty data, and nobody notices unless the data is checked first.',
        },
        {
          kind: 'number',
          id: 'algo-data-9',
          ask: 'A quote is stamped 14:30:02.150 and your clock reads 14:30:07.400. How old is the quote, in seconds?',
          answer: 5.25,
          check: '7.400 - 2.150',
          why: '7.400 − 2.150 = 5.25 seconds. If your rule refuses quotes older than 2 seconds, this one is stale: the feed may have stopped, and an order priced from it could be far from the market. The check is only as good as your clock, so keep it synchronised.',
        },
        {
          kind: 'number',
          id: 'algo-data-10',
          ask: 'Your program asks a REST endpoint for the latest price of 50 symbols, one request per symbol, every 10 seconds. How many requests is that per minute?',
          answer: 300,
          check: '50 * 60 / 10',
          why: '50 requests every 10 seconds is 300 a minute, over a limit of 200 and with nothing left for orders. One streaming subscription to the same symbols does the job with no requests at all.',
        },
        {
          kind: 'choice',
          id: 'algo-data-11',
          ask: 'Where do the API keys for your paper account belong?',
          options: [
            'In the strategy file, so the program runs anywhere',
            'In environment variables or a secrets file kept out of version control, with live keys kept apart from paper keys',
            'In a public repository, since paper money is not real',
            'In a comment at the top of the code',
          ],
          answer: 1,
          why: 'Keys in code end up in a repository, a screenshot or a backup. Paper keys leak the same way as live ones, and the habit is what you will carry to the live account. Keeping them apart also stops a program meant for paper from trading live by accident.',
        },
        {
          kind: 'design',
          id: 'algo-data-12',
          ask: 'List the checks your program runs on market data before the strategy is allowed to see it.',
          checklist: [
            { point: 'Timestamps in UTC, converted to New York time with a time zone library for session rules', why: 'Hard-coded offsets are wrong for part of every year.' },
            { point: 'Only finished bars reach the strategy, labelled consistently by start or end', why: 'The backtest saw finished bars; live must see the same thing.' },
            { point: 'Sort by time and drop duplicates', why: 'Reconnects replay and reorder messages.' },
            { point: 'Detect gaps, and decide whether to wait, fill from REST history or stop', why: 'Indicators computed across a hole are wrong without warning.' },
            { point: 'Refuse quotes older than a few seconds, and stop trading if data stops', why: 'A stale price is a price nobody can trade at.' },
            { point: 'Sanity checks on values: no zero or negative prices, bid below ask, no jumps far outside the recent range without confirmation', why: 'Bad ticks happen, and a program believes them.' },
            { point: 'Log what was rejected and why', why: 'Silent fixes hide feed problems you need to know about.' },
          ],
          why: 'Most live bugs that are not in the strategy are in the data. Checks at the door are cheaper than explaining a trade made on a price that never existed.',
        },
      ],
    },
    {
      id: 'algo-orders',
      title: 'Orders in code',
      summary: 'The life of an order from new to filled, cancelled or rejected; idempotent retries with client order ids; reconciling with the broker.',
      widget: 'algo-orders',
      text: [
        'An order is not a function call that returns a fill. It is a small process with **states**. You create and send it. The broker **accepts** it (it is now working, often shown as `new`) or **rejects** it (not enough buying power, a price outside the allowed range, the market closed). A working order can be **partially filled**, then **filled**. It can be **cancelled** by you, or **expire** at the end of its time in force. Filled, cancelled, rejected and expired are **terminal**: nothing more happens to the order after them.',
        'Your code keeps the same state machine. Each update from the broker moves an order from one state to another, and some moves are impossible: a filled order cannot be cancelled. Keep the **cumulative filled quantity** and the average fill price, and work out what remains as ordered minus filled. A cancel is a request, not a fact. A fill can arrive while the cancel is on its way, and then the order ends filled. The figure lets you play with this.',
        "**Idempotency** means that doing something twice has the same effect as doing it once. Networks fail in the worst way: a request times out, and you do not know whether the broker got it. Resend blindly and you may hold twice what you meant. Give every order a unique **client order id** before the first attempt, reuse it on every retry, and after a timeout ask the broker for that id before sending again. At the time of writing (2026), Alpaca's API accepts a client order id on each order and lets you look an order up by it.",
        "**Reconciliation** compares what your program believes with what the broker reports. Messages get lost, programs restart, someone trades by hand. At startup and on a schedule, fetch positions and open orders from the broker, whose records are the ones that count, and compare. A mismatch stops new orders and raises an alert. Do not let the program fix it by trading: if it is wrong about the position, it may be wrong about the fix.",
        "Brokers name states differently. Alpaca's documentation, at the time of writing, lists `new`, `partially_filled`, `filled`, `canceled`, `expired`, `rejected` and `pending_cancel` among others. Map your broker's names onto your own small set.",
      ],
      rules: [
        'Terminal states: filled, cancelled, rejected, expired. Ignore updates after them.',
        'Track cumulative filled quantity; remaining = ordered − filled.',
        'A cancel is a request. A fill can still arrive.',
        'One client order id per order, reused on every retry. After a timeout, look it up before resending.',
        "The broker's positions are the truth. On a mismatch, stop and alert; do not trade to fix it.",
      ],
      questions: [
        {
          kind: 'choice',
          id: 'algo-orders-1',
          ask: 'Which set lists only terminal states, after which nothing more happens to an order?',
          options: [
            'new, partially filled, filled',
            'filled, cancelled, rejected, expired',
            'pending cancel, cancelled, filled',
            'partially filled, rejected, expired',
          ],
          answer: 1,
          why: 'A new or partially filled order is still working, and an order waiting for its cancel can still fill. Only the four in the second option are final.',
        },
        {
          kind: 'number',
          id: 'algo-orders-2',
          ask: 'You send a buy order for 300 shares. Two fills arrive: 100 at $50.10 and 150 at $50.12. What is the average fill price so far? Give three decimals.',
          answer: 50.112,
          tol: 0.0005,
          check: '(100 * 50.10 + 150 * 50.12) / 250',
          why: '(100 × 50.10 + 150 × 50.12) ÷ 250 = $12,528 ÷ 250 = $50.112. The average is weighted by size, so the larger fill counts for more.',
        },
        {
          kind: 'number',
          id: 'algo-orders-3',
          ask: 'Same order: 300 shares ordered, fills of 100 and 150. How many shares remain to be filled?',
          answer: 50,
          check: '300 - 100 - 150',
          why: 'Remaining is ordered minus the cumulative filled: 300 − 250 = 50. If your program counted only the last fill it would think 150 remained and might send more.',
        },
        {
          kind: 'output',
          id: 'algo-orders-4',
          ask: 'A state machine as a dictionary of allowed moves; anything not in it is ignored. What does this print?',
          code: `moves = {('new', 'fill'): 'partially_filled',
         ('partially_filled', 'fill'): 'partially_filled',
         ('new', 'cancel'): 'canceled',
         ('partially_filled', 'cancel'): 'canceled'}
state = 'new'
for event in ['fill', 'fill', 'cancel', 'fill']:
    state = moves.get((state, event), state)
print(state)`,
          answer: 'canceled',
          why: 'Two fills leave it partially filled, the cancel makes it cancelled, and the last fill has no entry from `canceled`, so it is ignored. A table of allowed moves makes impossible transitions visible instead of silently corrupting the order.',
        },
        {
          kind: 'write',
          id: 'algo-orders-5',
          ask: 'Write `apply_event(order, event)`. The order is a dict with `qty`, `filled`, `avg` and `state`. Events: `accepted` (pending → new), `rejected` (pending → rejected), `fill` with `qty` and `price`, `cancel_requested` (new or partially filled → pending_cancel) and `canceled`. A fill adds to `filled` (never past `qty`), updates `avg`, and sets the state to `filled` when complete, otherwise `partially_filled` (or leaves `pending_cancel` as it is). Once `filled`, `canceled` or `rejected`, ignore every event. Update the order in place and return it.',
          starter: `TERMINAL = {'filled', 'canceled', 'rejected'}

def apply_event(order, event):
    return order`,
          solution: `TERMINAL = {'filled', 'canceled', 'rejected'}

def apply_event(order, event):
    kind = event['type']
    if order['state'] in TERMINAL:
        return order
    if kind == 'accepted' and order['state'] == 'pending':
        order['state'] = 'new'
    elif kind == 'rejected' and order['state'] == 'pending':
        order['state'] = 'rejected'
    elif kind == 'fill':
        q = min(event['qty'], order['qty'] - order['filled'])
        order['avg'] = (order['avg'] * order['filled'] + event['price'] * q) / (order['filled'] + q)
        order['filled'] += q
        if order['filled'] == order['qty']:
            order['state'] = 'filled'
        elif order['state'] != 'pending_cancel':
            order['state'] = 'partially_filled'
    elif kind == 'cancel_requested' and order['state'] in ('new', 'partially_filled'):
        order['state'] = 'pending_cancel'
    elif kind == 'canceled':
        order['state'] = 'canceled'
    return order`,
          tests: `o = {'qty': 100, 'filled': 0, 'avg': 0.0, 'state': 'pending'}
out = apply_event(o, {'type': 'accepted'})
assert out is not None, "the function returns nothing yet"
assert o['state'] == 'new', f"an accepted order is new (working), got {o['state']}"
apply_event(o, {'type': 'fill', 'qty': 40, 'price': 10.0})
assert o['state'] == 'partially_filled' and o['filled'] == 40, f"40 of 100 filled is a partial fill, got {o}"
apply_event(o, {'type': 'cancel_requested'})
assert o['state'] == 'pending_cancel', f"a cancel request is not a cancel yet, got {o['state']}"
apply_event(o, {'type': 'fill', 'qty': 60, 'price': 10.5})
assert o['state'] == 'filled' and o['filled'] == 100, f"the fill won the race with the cancel, got {o}"
assert abs(o['avg'] - 10.3) < 1e-9, f"the average of 40 at 10.0 and 60 at 10.5 is 10.3, got {o['avg']}"
apply_event(o, {'type': 'canceled'})
assert o['state'] == 'filled', "a filled order cannot become cancelled"
r = {'qty': 10, 'filled': 0, 'avg': 0.0, 'state': 'pending'}
apply_event(r, {'type': 'rejected'})
apply_event(r, {'type': 'fill', 'qty': 10, 'price': 5.0})
assert r['state'] == 'rejected' and r['filled'] == 0, "nothing happens to a rejected order"`,
          why: 'Every update goes through one function with explicit rules, and terminal states are final. The cancel race is the case people forget: the program must not assume a cancel worked until the broker says so, and must accept the fill if it comes first.',
        },
        {
          kind: 'bug',
          id: 'algo-orders-6',
          ask: 'This fill handler is wrong after the second partial fill: the order shows less filled than it is, and the program thinks more remains.',
          code: `def on_fill(order, fill_qty, fill_price):
    order['avg'] = (order['avg'] * order['filled'] + fill_price * fill_qty) / (order['filled'] + fill_qty)
    order['filled'] = fill_qty
    order['remaining'] = order['qty'] - order['filled']`,
          line: 3,
          fix: "    order['filled'] += fill_qty",
          why: 'Filled quantity is cumulative. Setting it to the size of the latest fill forgets the earlier ones, so a program working the remainder would buy again what it already holds. Some brokers send the cumulative quantity with each update; know which one yours sends.',
        },
        {
          kind: 'choice',
          id: 'algo-orders-7',
          ask: 'Your program sends a buy order and the request times out with no reply. What should it do next?',
          options: [
            'Send the order again at once with a new id',
            'Ask the broker for the order by its client order id, and resend with the same id only if the broker has no record of it',
            'Assume it failed and carry on',
            'Send a market order instead to make sure something fills',
          ],
          answer: 1,
          why: 'A timeout says nothing about whether the order arrived. Looking it up by the id you chose tells you. Resending with a new id risks a second order; assuming failure risks an untracked position.',
        },
        {
          kind: 'bug',
          id: 'algo-orders-8',
          ask: 'This retry loop is meant to be safe to repeat, but after a timeout it can create a second order at the broker.',
          code: `import uuid

def submit_with_retry(broker, order, tries=3):
    for _ in range(tries):
        order['client_order_id'] = str(uuid.uuid4())
        try:
            return broker.submit(order)
        except TimeoutError:
            continue
    raise RuntimeError('could not submit')`,
          line: 5,
          fix: "        order.setdefault('client_order_id', str(uuid.uuid4()))",
          why: 'A fresh id on every attempt makes each retry look like a new order. The id must be fixed once, before the first attempt, so the broker (and your lookup) can recognise a repeat.',
        },
        {
          kind: 'write',
          id: 'algo-orders-9',
          ask: 'The made-up `FlakyBroker` below receives the first order but loses the reply, raising `TimeoutError`; it refuses a second order with the same id. Change `submit_once` so that after a timeout it looks the order up with `broker.find` and returns it if the broker has it, and only otherwise tries again.',
          starter: `class FlakyBroker:
    """A made-up broker: the first submit reaches it, but the reply is lost."""
    def __init__(self):
        self.orders = {}
        self.calls = 0

    def submit(self, order):
        self.calls += 1
        cid = order['client_order_id']
        if cid in self.orders:
            raise ValueError('duplicate client_order_id')
        self.orders[cid] = dict(order)
        if self.calls == 1:
            raise TimeoutError('no reply')
        return self.orders[cid]

    def find(self, cid):
        return self.orders.get(cid)


def submit_once(broker, order, tries=3):
    for _ in range(tries):
        try:
            return broker.submit(order)
        except TimeoutError:
            pass
    return None`,
          solution: `class FlakyBroker:
    """A made-up broker: the first submit reaches it, but the reply is lost."""
    def __init__(self):
        self.orders = {}
        self.calls = 0

    def submit(self, order):
        self.calls += 1
        cid = order['client_order_id']
        if cid in self.orders:
            raise ValueError('duplicate client_order_id')
        self.orders[cid] = dict(order)
        if self.calls == 1:
            raise TimeoutError('no reply')
        return self.orders[cid]

    def find(self, cid):
        return self.orders.get(cid)


def submit_once(broker, order, tries=3):
    for _ in range(tries):
        try:
            return broker.submit(order)
        except TimeoutError:
            found = broker.find(order['client_order_id'])
            if found is not None:
                return found
    return None`,
          tests: `b = FlakyBroker()
out = submit_once(b, {'client_order_id': 'orb-2026-03-02-1', 'symbol': 'SPY', 'side': 'buy', 'qty': 10})
assert out is not None, "the order reached the broker: return the broker's copy"
assert len(b.orders) == 1, f"exactly one order should exist at the broker, got {len(b.orders)}"
assert out['client_order_id'] == 'orb-2026-03-02-1', "return the broker's copy of this order"
b2 = FlakyBroker()
b2.calls = 1
out2 = submit_once(b2, {'client_order_id': 'x-1', 'symbol': 'SPY', 'side': 'buy', 'qty': 5})
assert out2 is not None and len(b2.orders) == 1, "when the first call gets a reply, one order and that reply"`,
          why: 'The lookup turns an unknown into a known before anything is resent. Without it the starter retries blindly; this broker refuses the duplicate, but a broker that did not would now hold two orders.',
        },
        {
          kind: 'write',
          id: 'algo-orders-10',
          ask: 'Write `reconcile(local, broker)`: both are dicts from symbol to signed position. Return a dict of every symbol where they differ, mapped to `(local, broker)`, treating a missing symbol as 0.',
          starter: `def reconcile(local, broker):
    return {}`,
          solution: `def reconcile(local, broker):
    out = {}
    for sym in set(local) | set(broker):
        a, b = local.get(sym, 0), broker.get(sym, 0)
        if a != b:
            out[sym] = (a, b)
    return out`,
          tests: `out = reconcile({'SPY': 100, 'QQQ': 50}, {'SPY': 100, 'QQQ': 30, 'IWM': -20})
assert out is not None, "the function returns nothing yet"
assert out == {'QQQ': (50, 30), 'IWM': (0, -20)}, f"QQQ differs and IWM exists only at the broker; got {out}"
assert reconcile({'SPY': 0}, {}) == {}, "a zero position and a missing one are the same"
assert reconcile({'AAPL': 10}, {}) == {'AAPL': (10, 0)}, "a position only you believe in is a mismatch"`,
          why: 'The union of symbols catches positions on either side that the other does not know about, such as one opened by hand. What to do with the result is a decision for a person: stop new orders and alert.',
        },
        {
          kind: 'choice',
          id: 'algo-orders-11',
          ask: 'In the figure, press **Accept**, **Fill 40**, **Cancel request**, then **Fill 40** twice. What state does the order end in?',
          options: [
            'Cancelled, with 40 filled',
            'Filled, with all 100: the fills arrived before the cancel was confirmed',
            'Pending cancel, with 80 filled',
            'Rejected',
          ],
          answer: 1,
          why: 'While the cancel is pending the order is still working. 40 + 40 + 20 reaches 100 and the order is filled, so a cancel confirmation that came next would be ignored. A program that marked the order cancelled when it sent the request would now hold 100 shares it does not know about.',
        },
        {
          kind: 'design',
          id: 'algo-orders-12',
          ask: 'Your program crashed in the middle of the session and you restart it. Write the steps it takes before it is allowed to send a new order.',
          checklist: [
            { point: 'Load its own records of orders and positions from the log', why: 'It needs to know what it believed before the crash.' },
            { point: 'Fetch open orders, recent fills and positions from the broker', why: "The broker's records are the ones that count, and fills may have arrived while it was down." },
            { point: 'Match open orders by client order id and update their states', why: "The ids are what link your records to the broker's." },
            { point: 'Reconcile positions; on any mismatch, stay halted and alert a person', why: 'Trading to fix an unexplained position can double the mistake.' },
            { point: 'Decide what to do with orders it does not recognise: cancel them, and say so in the log', why: 'Unknown working orders are risk nobody is managing.' },
            { point: 'Rebuild indicator state from finished bars before acting on new ones', why: 'A strategy that starts with empty history gives different signals.' },
            { point: 'Resume only when every check passes', why: 'A clean start is worth a missed trade.' },
          ],
          why: 'Restarts are routine, and they are when local state and broker state are most likely to disagree. A written procedure, run by the program, turns a crash into a pause.',
        },
      ],
    },
    {
      id: 'algo-execution',
      title: 'Execution algorithms',
      summary: 'Slicing a parent order: TWAP, VWAP and participation, measured against the arrival price by implementation shortfall.',
      widget: 'algo-execution',
      text: [
        'A large order sent at once walks the book (the markets module): it takes the best price, then the next, and everyone watching sees a buyer. So the **parent order**, the whole quantity, is cut into **child orders** sent over time. Execution algorithms differ in how they choose the size and timing of the children.',
        "**TWAP** (time-weighted average price) sends equal slices at equal intervals: 6,000 shares over an hour as twelve slices of 500, one every five minutes. **VWAP** (volume-weighted average price) sizes each slice in proportion to the volume expected in its interval. US stocks trade most near the open and the close and least at midday, a U-shaped curve, so a VWAP algorithm trades more at the ends of the day. Its aim is an average fill close to the day's VWAP. **Participation**, or percentage of volume, trades a fixed share of the volume as it prints, for example 10%: it stays inconspicuous, but you do not know when it will finish.",
        'The honest benchmark is the **arrival price**: the mid when you decided to trade. **Implementation shortfall** is what execution cost against it. For a buy it is `(average fill − arrival) × quantity`, and the sign flips for a sell. In **basis points** (hundredths of a percent) it is `(average fill − arrival) ÷ arrival × 10,000`. Shares you never got because the price ran away cost something too: the **opportunity cost**.',
        'The trade-off has no free setting. Trade fast and you push the price (**impact**); trade slowly and the price may drift away before you finish (**timing risk**). The figure shows TWAP and VWAP schedules on a made-up day and where each average fill lands.',
        'Most of this is for size. Two SPY option contracts or a few hundred shares of a liquid ETF are tiny next to the volume, and one limit order near the mid is the execution algorithm. Slicing matters when your order is large compared with the size displayed, as on a thin option strike.',
      ],
      rules: [
        'Parent order, child orders: slice to hide size and limit impact.',
        'TWAP: equal slices in time. VWAP: slices in proportion to expected volume. Participation: a fixed share of actual volume.',
        'Benchmark against the arrival price. Shortfall in bps = (avg fill − arrival) ÷ arrival × 10,000, sign flipped for sells.',
        'Fast means impact, slow means timing risk.',
        'For small orders in liquid names, one well-priced limit order is enough.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'algo-execution-1',
          ask: 'A TWAP algorithm must buy 6,000 shares between 9:30 and 15:30, sending one slice every 30 minutes. How many shares are in each slice?',
          answer: 500,
          check: '6000 / (6 * 60 / 30)',
          why: 'Six hours is 12 half-hour intervals, so 6,000 ÷ 12 = 500 shares a slice. Equal slices regardless of how much is trading at the time.',
        },
        {
          kind: 'number',
          id: 'algo-execution-2',
          ask: 'A VWAP algorithm expects 400,000 shares to trade in the first interval, 200,000 in the second and 400,000 in the third. It must buy 20,000 shares across the three. How many does it buy in the first interval?',
          answer: 8000,
          check: '20000 * 400 / (400 + 200 + 400)',
          why: 'The first interval holds 40% of the expected volume, so it gets 40% of the order: 8,000 shares. The quiet middle interval gets 4,000.',
        },
        {
          kind: 'number',
          id: 'algo-execution-3',
          ask: 'You decided to buy 10,000 shares when the mid was $50.00 and your average fill was $50.06. What is the implementation shortfall in dollars?',
          answer: 600,
          check: '(50.06 - 50.00) * 10000',
          why: '$0.06 × 10,000 = $600. That is what execution cost you compared with trading at the price when you decided. It counts against the strategy as surely as a commission.',
        },
        {
          kind: 'number',
          id: 'algo-execution-4',
          ask: 'Same trade: arrival $50.00, average fill $50.06. What is the shortfall in basis points?',
          answer: 12,
          check: '(50.06 - 50.00) / 50.00 * 10000',
          why: '0.06 ÷ 50 = 0.0012, which is 12 basis points. Basis points let you compare execution across stocks of different prices.',
        },
        {
          kind: 'number',
          id: 'algo-execution-5',
          ask: 'A participation algorithm trades 10% of the volume. The stock trades 30,000 shares a minute. How many minutes does it take to buy 15,000 shares?',
          answer: 5,
          check: '15000 / (0.10 * 30000)',
          why: '10% of 30,000 is 3,000 shares a minute, so 15,000 takes 5 minutes. If volume halves, so does the speed: you control the footprint, not the finishing time.',
        },
        {
          kind: 'output',
          id: 'algo-execution-6',
          ask: 'TWAP slices in whole shares. What does this print?',
          code: `def twap(qty, n):
    base, extra = divmod(qty, n)
    return [base + (1 if i < extra else 0) for i in range(n)]

print(twap(1000, 3), twap(10, 4))`,
          answer: '[334, 333, 333] [3, 3, 2, 2]',
          why: 'Whole shares do not always divide evenly. `divmod` gives the base size and the remainder, and the remainder is spread one share at a time over the first slices, so the total is exact.',
        },
        {
          kind: 'write',
          id: 'algo-execution-7',
          ask: 'Write `vwap_schedule(qty, profile)`: split `qty` whole shares across intervals in proportion to the expected volumes in `profile`. The slices must add up to exactly `qty`. Hint: round the cumulative target after each interval and take differences.',
          starter: `def vwap_schedule(qty, profile):
    total = sum(profile)
    return [qty * v / total for v in profile]`,
          solution: `def vwap_schedule(qty, profile):
    total = sum(profile)
    out, done, cum = [], 0, 0
    for v in profile:
        cum += v
        target = round(qty * cum / total)
        out.append(target - done)
        done = target
    return out`,
          tests: `out = vwap_schedule(20000, [400, 200, 400])
assert out is not None, "the function returns nothing yet"
assert out == [8000, 4000, 8000], f"20,000 shares split 40%, 20%, 40%, got {out}"
s = vwap_schedule(10, [1, 1, 1])
assert all(isinstance(x, int) for x in s), f"share counts are whole numbers, got {s}"
assert sum(s) == 10, f"the slices must add up to the parent order, got {s}"
assert all(abs(x - 10 / 3) < 1 for x in s), f"each slice within one share of 3.33, got {s}"
u = vwap_schedule(1000, [30, 12, 8, 6, 5, 5, 6, 8, 10, 20])
assert sum(u) == 1000 and u[0] > u[4] < u[-1], f"a U-shaped profile gives big slices at the ends, got {u}"`,
          why: 'Rounding each slice on its own can leave the total a share or two off. Rounding the running target and taking differences keeps every slice within a share of its exact size and the total exact.',
        },
        {
          kind: 'bug',
          id: 'algo-execution-8',
          ask: 'This should return the shortfall in basis points, positive when execution cost you money. For sells it reports a cost as a saving.',
          code: `def shortfall_bps(side, arrival, avg_fill):
    cost = (avg_fill - arrival) / arrival * 10_000
    return cost if side == 'buy' else cost`,
          line: 3,
          fix: "    return cost if side == 'buy' else -cost",
          why: 'A seller is hurt by a lower price. Selling at an average below the arrival price is a cost, so the sign flips. Without the flip, every badly executed sale looks like a good one.',
        },
        {
          kind: 'write',
          id: 'algo-execution-9',
          ask: "Write `pov_fills(volumes, pct, qty)`: a participation algorithm buys `pct` percent of each interval's volume (rounded down to whole shares) until `qty` is done. Return the shares bought in each interval, one per entry in `volumes`.",
          starter: `def pov_fills(volumes, pct, qty):
    return [v * pct // 100 for v in volumes]`,
          solution: `def pov_fills(volumes, pct, qty):
    out, left = [], qty
    for v in volumes:
        q = min(v * pct // 100, left)
        out.append(q)
        left -= q
    return out`,
          tests: `out = pov_fills([30000, 20000, 50000, 40000], 10, 9000)
assert out is not None, "the function returns nothing yet"
assert out == [3000, 2000, 4000, 0], f"10% each interval, stopping at 9,000 shares; got {out}"
assert pov_fills([30000, 20000, 50000, 40000], 10, 50000) == [3000, 2000, 5000, 4000], "an order larger than 10% of the volume is not finished"
assert pov_fills([999], 10, 500) == [99], "round down to whole shares"`,
          why: 'Participation follows the market: busy intervals buy more, quiet ones less, and when volume is thin the order is not done by the end. That is the price of a small footprint.',
        },
        {
          kind: 'choice',
          id: 'algo-execution-10',
          ask: "In the figure, look at each of the three days. Which average fill sits closer to the day's market VWAP?",
          options: [
            'TWAP, on every day',
            'The VWAP schedule, because it trades most when the market trades most',
            'They are always exactly equal',
            'Neither: both always equal the arrival price',
          ],
          answer: 1,
          why: "The day's VWAP weights each price by the volume traded there. A schedule that follows the expected volume curve puts nearly the same weights on the same prices, so it lands close; TWAP weights midday as heavily as the open. Close to VWAP is not the same as cheap: on day 1, which rises, both pay about a full percent more than the arrival price.",
        },
        {
          kind: 'choice',
          id: 'algo-execution-11',
          ask: 'You must buy a large block and the price is rising. You slow your algorithm down to cut its impact. What risk grows?',
          options: [
            'The commission per share',
            'Timing risk: the price may keep rising before you finish, and you may not finish at all',
            'The bid-ask spread',
            'None: slower is always cheaper',
          ],
          answer: 1,
          why: 'Slow execution trades impact for exposure to the price moving away. Neither extreme is free; the right speed depends on how urgent the trade is and how much your own orders move the price.',
        },
        {
          kind: 'design',
          id: 'algo-execution-12',
          ask: 'Your program wants to buy 20 contracts of an option quoted 1.20 bid, 1.40 ask, with 5 contracts shown at the ask. Plan the execution.',
          checklist: [
            { point: 'Start with a limit at or near the mid, never a market order', why: 'A market order for 20 takes the 5 shown and then whatever is behind them, at worse prices.' },
            { point: 'Set the worst price you will pay before you start', why: 'Without a cap, patient slicing can still chase the price up.' },
            { point: 'Work it in small clips and step the limit toward the ask slowly', why: 'Each step pays a little more; jumping straight to the ask gives away the spread.' },
            { point: 'Decide in advance what happens if only part fills', why: 'A partial position must still fit the risk plan, with its size and stop adjusted.' },
            { point: 'Record the arrival mid and compute the shortfall afterwards', why: 'You cannot improve execution you do not measure.' },
            { point: 'Ask whether the trade still pays after this cost, or choose a more liquid strike', why: 'A spread of 0.20 on a 1.30 option is about 15% of the price; it may be larger than the edge.' },
          ],
          why: 'On thin options, execution is where small edges die. A rule for working the order, with a price cap, is part of the strategy.',
        },
      ],
    },
    {
      id: 'algo-risk',
      title: 'Risk controls and kill switches',
      summary: 'Checks on every order, a kill switch that works when the strategy does not, and what Knight Capital lost in 45 minutes.',
      widget: 'algo-risk',
      text: [
        'Risk checks run on every order before it leaves, in code the strategy cannot skip. A maximum **order size**, in shares or contracts and in dollars. A maximum **position** per symbol and in total, checked on the position the order would create. A **price collar** that refuses a limit price more than a set percentage from the current price, and any order when there is no recent price. A maximum number of **orders per minute**. A **daily loss limit**, counting realised and unrealised P&L, after which only orders that reduce risk are allowed. The risk module set these limits for a person; here they are code.',
        'Checks **fail closed**: if a check cannot be computed, because a price is missing or a number is not a number, the order is refused. A check that lets orders through when it is unsure is not a check.',
        "A **kill switch** is one action that blocks new orders, cancels every open order and, where your plan says so, closes positions. It can be pressed by hand, and it trips by itself on the loss limit, too many rejects, stale data, a position mismatch, or a lost heartbeat. It must work when the strategy is broken, so it lives outside the strategy, is short, and is tested. Use your broker's own limits too where they exist, and fund the account the program trades with no more than you can afford to lose.",
        "On 1 August 2012 Knight Capital, then one of the largest traders of US stocks, deployed new code to its order router for the NYSE's new Retail Liquidity Program. A technician did not copy it to one of the eight servers. The new code reused a flag that had once switched on an old function called **Power Peg**, and on the eighth server the flag woke that dead code up. Power Peg no longer saw that its orders had been filled, so it kept sending them: in about 45 minutes, 212 parent orders became millions of child orders and more than 4 million executions in 154 stocks, over 397 million shares. Knight reported a loss of about $440 million (the SEC later put it above $460 million), needed about $400 million of rescue money within days, and merged into a new firm with Getco in 2013. The SEC fined it $12 million for breaking its market access rule, which requires brokers to control the risk of the orders they send.",
        'The lessons apply at any size: limits on position and on order rate that would have stopped the flood, checks that compare what was sent with what was filled, a kill switch people know how to use, and no dead code left behind a reused flag.',
      ],
      rules: [
        'Every order passes size, position, collar, rate and loss checks before it leaves.',
        'Check the position the order would create, not the order alone.',
        'Fail closed: no price, no order.',
        'The kill switch lives outside the strategy, cancels everything, blocks new orders, and is tested.',
        'Knight Capital, 1 August 2012: one server with old code, about 45 minutes, over $440 million.',
      ],
      questions: [
        {
          kind: 'choice',
          id: 'algo-risk-1',
          ask: "What set off Knight Capital's losses on 1 August 2012?",
          options: [
            'A trader typed an extra zero into one order',
            'New code was not copied to one of eight servers; a reused flag woke old Power Peg code there, which kept sending orders because it no longer saw its fills',
            'A cyber attack on the exchange',
            'A market-wide crash that hit every firm alike',
          ],
          answer: 1,
          why: 'It was a deployment error meeting dead code. Each piece alone was survivable; together, with no automatic limit that stopped the orders, they cost the firm its independence in under an hour.',
        },
        {
          kind: 'number',
          id: 'algo-risk-2',
          ask: 'Knight traded more than 397 million shares in about 45 minutes. On average, roughly how many shares a second is that? Round to the nearest thousand.',
          answer: 147000,
          tol: 1000,
          check: '397e6 / (45 * 60)',
          why: '397,000,000 ÷ 2,700 seconds ≈ 147,000 shares a second. No person can watch that, which is why the limits have to be in code and the stop has to be automatic.',
        },
        {
          kind: 'number',
          id: 'algo-risk-3',
          ask: 'The last trade is $50.00 and your price collar is 2%. What is the highest limit price, in dollars, that a buy order may carry?',
          answer: 51,
          check: '50.00 * 1.02',
          why: '2% of $50 is $1, so $51.00. A buy limit far above the market would fill at whatever the sellers ask; the collar stops a bug or a typo from turning into that.',
        },
        {
          kind: 'number',
          id: 'algo-risk-4',
          ask: 'Your daily loss limit is $400. Today the program has realised −$300 and its open position shows −$150. By how many dollars is it past the limit?',
          answer: 50,
          check: '(300 + 150) - 400',
          why: 'The loss that counts is realised plus unrealised: $450, which is $50 past the limit. Counting only realised P&L lets a losing open position grow without ever triggering the limit.',
        },
        {
          kind: 'output',
          id: 'algo-risk-5',
          ask: 'Size and position checks on three buy orders while you hold 600 shares. What does this print?',
          code: `limits = {'max_qty': 500, 'max_pos': 800}
position = 600
for qty in (100, 300, 700):
    if qty > limits['max_qty']:
        print(qty, 'blocked: order size')
    elif position + qty > limits['max_pos']:
        print(qty, 'blocked: position')
    else:
        print(qty, 'ok')`,
          answer: '100 ok\n300 blocked: position\n700 blocked: order size',
          why: '100 takes the position to 700, inside 800. 300 is a fine order size but would make 900. 700 fails the size check first. The checks are independent, and an order must pass all of them.',
        },
        {
          kind: 'bug',
          id: 'algo-risk-6',
          ask: 'This should refuse any order that would leave the position beyond `max_position` either way. With a position of 900 and a limit of 1,000, it lets a buy of 500 through.',
          code: `def position_ok(position, side, qty, max_position):
    signed = qty if side == 'buy' else -qty
    new_position = position + signed
    return abs(signed) <= max_position`,
          line: 4,
          fix: '    return abs(new_position) <= max_position',
          why: 'Checking the order alone lets a run of small orders build any position. The limit is on what you would hold after the order, which is exactly what a looping bug produces.',
        },
        {
          kind: 'bug',
          id: 'algo-risk-7',
          ask: 'A price collar. When the feed has stopped and there is no reference price, it lets every order through.',
          code: `def collar_ok(limit_price, ref_price, pct):
    if ref_price is None:
        return True
    return abs(limit_price - ref_price) / ref_price <= pct`,
          line: 3,
          fix: '        return False',
          why: 'No price means the program does not know where the market is, which is the worst time to trade. Checks fail closed.',
        },
        {
          kind: 'write',
          id: 'algo-risk-8',
          ask: "Write `check_order(order, state, limits)` returning `(ok, reason)`. Apply the checks in this order and return the first failure: `'halted'` if `state['halted']`; `'no price'` if `state['last']` is None; `'size'` if qty > `max_qty`; `'position'` if the new position's size > `max_position`; `'collar'` if the limit is more than `collar` (a fraction) from the last price; `'rate'` if `orders_last_minute` ≥ `max_orders`; `'loss limit'` if `day_pnl` ≤ −`max_loss` and the order would make the position larger. Otherwise `(True, 'ok')`.",
          starter: `def check_order(order, state, limits):
    # order: {'side': 'buy' | 'sell', 'qty', 'limit'}
    # state: {'position', 'last', 'orders_last_minute', 'day_pnl', 'halted'}
    # limits: {'max_qty', 'max_position', 'collar', 'max_orders', 'max_loss'}
    return True, 'ok'`,
          solution: `def check_order(order, state, limits):
    if state['halted']:
        return False, 'halted'
    last = state['last']
    if last is None:
        return False, 'no price'
    if order['qty'] > limits['max_qty']:
        return False, 'size'
    signed = order['qty'] if order['side'] == 'buy' else -order['qty']
    new = state['position'] + signed
    if abs(new) > limits['max_position']:
        return False, 'position'
    if abs(order['limit'] - last) / last > limits['collar']:
        return False, 'collar'
    if state['orders_last_minute'] >= limits['max_orders']:
        return False, 'rate'
    if state['day_pnl'] <= -limits['max_loss'] and abs(new) > abs(state['position']):
        return False, 'loss limit'
    return True, 'ok'`,
          tests: `L = {'max_qty': 500, 'max_position': 1000, 'collar': 0.02, 'max_orders': 30, 'max_loss': 400}
S = {'position': 0, 'last': 50.0, 'orders_last_minute': 0, 'day_pnl': 0.0, 'halted': False}
buy = {'side': 'buy', 'qty': 100, 'limit': 50.05}
out = check_order(buy, S, L)
assert out is not None, "the function returns nothing yet"
assert out == (True, 'ok'), f"a small buy near the price passes, got {out}"
assert check_order(buy, {**S, 'halted': True}, L) == (False, 'halted'), "nothing passes a halted system"
assert check_order(buy, {**S, 'last': None}, L) == (False, 'no price'), "no price, no order: fail closed"
assert check_order({**buy, 'qty': 600}, S, L) == (False, 'size'), "600 is over the 500 order limit"
assert check_order(buy, {**S, 'position': 950}, L) == (False, 'position'), "950 + 100 is over the 1,000 position limit"
assert check_order({**buy, 'limit': 51.5}, S, L) == (False, 'collar'), "51.50 is 3% from 50.00"
assert check_order(buy, {**S, 'orders_last_minute': 30}, L) == (False, 'rate'), "30 orders this minute is the limit"
assert check_order(buy, {**S, 'position': 200, 'day_pnl': -450.0}, L) == (False, 'loss limit'), "past the loss limit, no adding"
sell = {'side': 'sell', 'qty': 200, 'limit': 49.95}
assert check_order(sell, {**S, 'position': 200, 'day_pnl': -450.0}, L) == (True, 'ok'), "past the loss limit, reducing is allowed"`,
          why: 'Each check is a line, and their order gives a clear reason for every refusal, which goes in the log. Letting risk-reducing orders through after the loss limit matters: a check that also blocks the exit traps you in the losing position.',
        },
        {
          kind: 'write',
          id: 'algo-risk-9',
          ask: 'Write the kill switch. `trip(reason)` halts the system, keeps the first reason it was given, and cancels every open order through the broker. `allow()` says whether a new order may be sent.',
          starter: `class FakeBroker:
    def __init__(self):
        self.open_orders = ['a', 'b']

    def cancel_all(self):
        self.open_orders = []


class KillSwitch:
    def __init__(self, broker):
        self.broker = broker
        self.halted = False
        self.reason = None

    def trip(self, reason):
        pass

    def allow(self):
        return True`,
          solution: `class FakeBroker:
    def __init__(self):
        self.open_orders = ['a', 'b']

    def cancel_all(self):
        self.open_orders = []


class KillSwitch:
    def __init__(self, broker):
        self.broker = broker
        self.halted = False
        self.reason = None

    def trip(self, reason):
        if not self.halted:
            self.halted = True
            self.reason = reason
        self.broker.cancel_all()

    def allow(self):
        return not self.halted`,
          tests: `b = FakeBroker()
k = KillSwitch(b)
assert k.allow() is True, "before anything goes wrong, orders are allowed"
k.trip('daily loss limit')
assert k.allow() is False, "after a trip, no new orders"
assert b.open_orders == [], "tripping cancels every open order"
k.trip('stale data')
assert k.reason == 'daily loss limit', f"keep the first reason, it is the one to investigate; got {k.reason}"
assert k.allow() is False, "a second trip changes nothing"`,
          why: 'Short enough to read at a glance and to trust. Cancelling again on a second trip is harmless and catches orders that slipped in. Resetting is left out on purpose: a person should decide when trading resumes.',
        },
        {
          kind: 'choice',
          id: 'algo-risk-10',
          ask: 'In the figure, a bug sends a burst of identical buy orders part-way through. Set the maximum orders per minute and the maximum position to their highest values. What happens, and what stops the burst?',
          options: [
            'The burst is blocked anyway, because each order is small',
            'Most of the burst passes and the position climbs; lowering either the orders per minute or the maximum position stops it',
            'The collar stops it, because the prices are all far from the market',
            'Nothing can stop it once it starts',
          ],
          answer: 1,
          why: 'Each order in the burst is a normal size at a normal price, so size and collar checks pass them. Only limits on rate and on total position see that something is wrong. Checks that look at the sum, not at one order, are the ones that stop a runaway loop.',
        },
        {
          kind: 'number',
          id: 'algo-risk-11',
          ask: 'A bug sends an order every 50 milliseconds. Without a rate limit, how many orders go out in one minute?',
          answer: 1200,
          check: '60 / 0.050',
          why: '60 ÷ 0.05 = 1,200 orders. With a limit of 30 orders a minute, 30 go out and the next is refused and raises the alarm, which is a problem you can survive.',
        },
        {
          kind: 'design',
          id: 'algo-risk-12',
          ask: 'Write the specification of the kill switch for your program: what trips it, what it does, and how trading resumes.',
          checklist: [
            { point: 'Trips on the daily loss limit, counting unrealised P&L', why: 'The open position is where losses grow without being realised.' },
            { point: 'Trips on a position mismatch with the broker', why: 'A program wrong about what it holds will be wrong about its next order.' },
            { point: 'Trips when market data stops or goes stale for a set number of seconds', why: 'Prices you cannot see cannot be risk-managed.' },
            { point: 'Trips on too many orders or rejects in a short time', why: 'Bursts of orders or rejects are the signature of a loop gone wrong.' },
            { point: 'A manual button that works even if the strategy process has hung', why: 'You must be able to stop it from outside.' },
            { point: 'Action: block new orders, cancel all open orders, flatten if the plan says so, alert you', why: 'Stopping new orders is not enough while old ones are working.' },
            { point: 'Reset only by a person, after the cause is found and written down', why: 'An automatic restart repeats the failure.' },
            { point: 'Tested on paper by tripping it on purpose', why: 'An untested kill switch is a hope.' },
          ],
          why: 'The kill switch is the last line between a bug and the account. It has to be simpler and better tested than anything it protects.',
        },
      ],
    },
    {
      id: 'algo-live',
      title: 'From backtest to live, and automating options',
      summary: 'Paper first, then small; why live trails the backtest; monitoring and alerts; choosing contracts by delta, spreads as one order, always limits.',
      widget: 'algo-live',
      text: [
        "A tested rule goes live in stages, with the same code all the way: backtest, then the broker's **paper account** for weeks, then the **smallest live size**, then larger only by a rule written in advance. At each stage compare with the one before: win rate, average R, slippage per trade. Paper tests the plumbing and the timing. Small live size tests the fills, which paper accounts make generous: Alpaca's own documentation, at the time of writing, says its paper trading does not account for market impact, slippage from latency or queue position.",
        'Live results trail the backtest for known reasons: the spread and **slippage** (fills worse than the price you saw), **latency** (price moves while the order travels, usually against a momentum entry), limit orders that do not fill on the trades that would have won, fees, data that differs from the history you tested on, and an edge that was partly overfitted. Each comes off every trade. Measure them in R, as the backtest module did with costs, and expect the live curve to sit below the backtest curve, as in the figure.',
        '**Monitoring**: log every event, order, fill and risk decision with a timestamp; keep a heartbeat; alert yourself (a phone notification or an email) when the kill switch trips, the loss limit is near, data stops, orders are rejected or positions do not match. Read a short report every day. A program nobody watches is how a small bug becomes a large loss.',
        'Options in code: choose the contract by rule, not by eye. From the chain, keep contracts with an acceptable spread (for example under 10% of the mid) and a bid above zero, then pick the one whose delta is closest to your target. Send a spread as **one multi-leg order** with a net limit price, so the legs fill together or not at all; legging in one at a time can leave you holding half a position while the price moves. At the time of writing (2026), Alpaca supports multi-leg option orders and Interactive Brokers supports combination orders; check what your broker offers.',
        "**Always use limit orders on options.** Option spreads are wide, and wider at the open; a market order pays whatever is there. Start at the mid, step toward the **natural** price (the price you pay by crossing every leg's spread) in small steps, and stop at a limit set in advance. Close positions at a set time before the close, and never leave a short option open into expiry by accident.",
      ],
      rules: [
        'Backtest, paper, smallest size, then scale by a written rule. Same code throughout.',
        'Live trails backtest: spread, slippage, latency, missed fills, fees, overfitting. Measure each in R.',
        'Log everything; alert on trips, limits, stale data, rejects and mismatches.',
        'Choose option contracts by delta after filtering on spread and a bid above zero.',
        'Spreads go as one multi-leg order. Options always go as limit orders, with a price cap.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'algo-live-1',
          ask: 'Your fills are on average $0.02 a share worse than the backtest at entry and again at exit. Risk is $0.40 a share. How much does slippage cost per trade, in R?',
          answer: 0.1,
          check: '2 * 0.02 / 0.40',
          why: 'Two lots of $0.02 is $0.04 a share per round trip, and $0.04 ÷ $0.40 = 0.1R. It comes off winners and losers alike.',
        },
        {
          kind: 'number',
          id: 'algo-live-2',
          ask: 'The backtest shows +0.15R per trade before slippage. With the 0.1R of slippage from the previous question, what expectancy should you plan on live, in R?',
          answer: 0.05,
          check: '0.15 - 0.10',
          why: 'A third of the edge is left, before latency and missed fills. Whether 0.05R over your sample is distinguishable from zero is the next question, and often the answer is no.',
        },
        {
          kind: 'number',
          id: 'algo-live-3',
          ask: 'On your breakout entries the price moves against you by about half a cent per share for every 100 milliseconds after the signal. Your latency is 300 ms and your risk is $0.30 a share. What does latency cost per trade, in R? Give two decimals.',
          answer: 0.05,
          check: '0.005 * 3 / 0.30',
          why: '300 ms is three lots of 100 ms, so 1.5 cents a share. $0.015 ÷ $0.30 = 0.05R. Measure this from your own logs: the time and price at the signal against the time and price of the fill.',
        },
        {
          kind: 'number',
          id: 'algo-live-4',
          ask: 'A call vertical: buy the 450 call (bid 3.10, ask 3.20) and sell the 455 call (bid 1.40, ask 1.48). What is the natural price of the spread, the debit you pay by buying at the ask and selling at the bid?',
          answer: 1.8,
          check: '3.20 - 1.40',
          why: '3.20 − 1.40 = 1.80. The mid of the spread is 3.15 − 1.44 = 1.71. Starting at 1.71 and working toward 1.80 can save up to 9 cents, $9 a spread, on every trade.',
        },
        {
          kind: 'output',
          id: 'algo-live-5',
          ask: 'A program walks its limit price from the mid toward the natural price. What does this print?',
          code: `mid, natural, step = 1.71, 1.80, 0.03
prices = []
p = mid
while p < natural:
    prices.append(round(p, 2))
    p += step
prices.append(natural)
print(prices)`,
          answer: '[1.71, 1.74, 1.77, 1.8]',
          why: 'It tries the mid first, then steps up by 3 cents, and the natural price is the cap. Adding 0.03 three times to 1.71 gives a number a hair above 1.80 in floating point, so the loop stops and the cap is added once. Rounding prices to the cent before sending matters: brokers reject prices off the tick size.',
        },
        {
          kind: 'write',
          id: 'algo-live-6',
          ask: 'Write `choose_by_delta(chain, target, max_spread)`. `chain` is a list of dicts with `symbol`, `delta`, `bid` and `ask`. Ignore contracts with a bid of zero or a spread (ask − bid) above `max_spread` as a fraction of the mid. Of the rest, return the symbol whose delta is closest to `target`, or `None` if none is left.',
          starter: `def choose_by_delta(chain, target, max_spread):
    return chain[0]['symbol']`,
          solution: `def choose_by_delta(chain, target, max_spread):
    best, gap = None, None
    for c in chain:
        if c['bid'] <= 0:
            continue
        mid = (c['bid'] + c['ask']) / 2
        if (c['ask'] - c['bid']) / mid > max_spread:
            continue
        d = abs(c['delta'] - target)
        if gap is None or d < gap:
            best, gap = c['symbol'], d
    return best`,
          tests: `chain = [
    {'symbol': 'SPY C500', 'delta': 0.62, 'bid': 4.10, 'ask': 4.20},
    {'symbol': 'SPY C505', 'delta': 0.48, 'bid': 2.00, 'ask': 2.60},
    {'symbol': 'SPY C510', 'delta': 0.35, 'bid': 0.95, 'ask': 1.00},
    {'symbol': 'SPY C515', 'delta': 0.22, 'bid': 0.40, 'ask': 0.43},
    {'symbol': 'SPY C530', 'delta': 0.05, 'bid': 0.00, 'ask': 0.02},
]
out = choose_by_delta(chain, 0.50, 0.10)
assert out is not None, "the function returns nothing yet"
assert out == 'SPY C500', f"C505 is nearest 0.50 but its spread is 26% of the mid; of the rest C500 (0.62) is nearest, got {out}"
assert choose_by_delta(chain, 0.30, 0.10) == 'SPY C510', "0.35 is nearer 0.30 than 0.22"
assert choose_by_delta(chain, 0.05, 0.10) == 'SPY C515', "a contract with no bid is never chosen"
assert choose_by_delta(chain, 0.50, 0.30) == 'SPY C505', "with a looser spread limit C505 is allowed"
assert choose_by_delta(chain, 0.50, 0.01) is None, "no contract has a spread under 1%"`,
          why: 'Filtering first and choosing second means the program never picks a contract it could not trade at a fair price. Returning None is a valid answer: no trade is better than a bad fill.',
        },
        {
          kind: 'bug',
          id: 'algo-live-7',
          ask: 'This should return the contract whose delta is nearest the target. It always returns the one with the lowest delta.',
          code: `def nearest_delta(chain, target):
    best, best_gap = None, None
    for c in chain:
        gap = c['delta'] - target
        if best_gap is None or gap < best_gap:
            best, best_gap = c['symbol'], gap
    return best`,
          line: 4,
          fix: "        gap = abs(c['delta'] - target)",
          why: 'Without the absolute value, a delta far below the target has a large negative gap and wins. The program would buy far out-of-the-money options, which behave very differently from the ones the strategy was tested on.',
        },
        {
          kind: 'choice',
          id: 'algo-live-8',
          ask: 'Why send a call vertical as one multi-leg order rather than buying one call and then selling the other?',
          options: [
            'It is cheaper in commissions at every broker',
            'The legs fill together at a net price or not at all; legging in can leave you holding one leg while the price moves',
            'Single-leg orders cannot be limit orders',
            'Exchanges do not allow the legs to be traded separately',
          ],
          answer: 1,
          why: 'Between the two fills you hold a different position from the one you planned, with different risk. A program that sends the legs separately also needs code for every way the second leg can fail, which a single order avoids.',
        },
        {
          kind: 'choice',
          id: 'algo-live-9',
          ask: 'At 9:31 a 0DTE SPY call is quoted 1.10 bid, 1.40 ask. Your program sends a market order for 10 contracts. What is the problem?',
          options: [
            'None: SPY options are liquid',
            'It pays at least the ask, 0.15 above the mid, which is $150 on 10 contracts, and more if the size shown is small',
            'Market orders are not allowed on options',
            'It will be filled at the mid',
          ],
          answer: 1,
          why: '(1.40 − 1.25) × 100 × 10 = $150 given away at the start, and possibly more if 10 contracts go past the size at the ask. A limit near the mid with a cap would have cost a little patience instead.',
        },
        {
          kind: 'choice',
          id: 'algo-live-10',
          ask: 'In the figure, start with slippage and latency at zero, then set slippage to 2 cents a side and latency to 200 ms. What happens?',
          options: [
            'The two curves stay together: costs are too small to see',
            'Costs reach 0.125R a trade and the live curve falls well below the backtest, with most of the edge gone',
            'The backtest curve falls too',
            'The win rate of the backtest changes',
          ],
          answer: 1,
          why: '(2 × 2 + 200 ÷ 100 × 0.5) cents = 5 cents on a 40-cent risk = 0.125R. The backtest does not move because it never paid these costs; that gap is what going live costs a strategy.',
        },
        {
          kind: 'write',
          id: 'algo-live-11',
          ask: "Write `alerts(state, now, limits)`: return a list of alert strings, in this order, for each that applies: `'kill switch'` if `state['halted']`; `'stale data'` if more than `limits['stale']` seconds have passed since `state['last_data']`; `'loss limit'` if `state['day_pnl']` ≤ −`limits['max_loss']`; `'mismatch'` if `state['position']` differs from `state['broker_position']`.",
          starter: `def alerts(state, now, limits):
    return []`,
          solution: `def alerts(state, now, limits):
    out = []
    if state['halted']:
        out.append('kill switch')
    if now - state['last_data'] > limits['stale']:
        out.append('stale data')
    if state['day_pnl'] <= -limits['max_loss']:
        out.append('loss limit')
    if state['position'] != state['broker_position']:
        out.append('mismatch')
    return out`,
          tests: `L = {'stale': 10, 'max_loss': 400}
ok = {'halted': False, 'last_data': 100.0, 'day_pnl': -50.0, 'position': 100, 'broker_position': 100}
out = alerts(ok, 105.0, L)
assert out is not None, "the function returns nothing yet"
assert out == [], f"nothing is wrong, got {out}"
assert alerts(ok, 111.0, L) == ['stale data'], "11 seconds without data is stale"
assert alerts({**ok, 'day_pnl': -400.0}, 105.0, L) == ['loss limit'], "the loss limit is reached at exactly -400"
assert alerts({**ok, 'broker_position': 0}, 105.0, L) == ['mismatch'], "100 here, 0 at the broker"
bad = {'halted': True, 'last_data': 0.0, 'day_pnl': -500.0, 'position': 100, 'broker_position': 200}
assert alerts(bad, 60.0, L) == ['kill switch', 'stale data', 'loss limit', 'mismatch'], "every alert, in order"`,
          why: 'Alerts are how a person finds out. Each condition here is cheap to check every few seconds, and the one that is easiest to forget, stale data, is the one that hides all the others.',
        },
        {
          kind: 'design',
          id: 'algo-live-12',
          ask: 'Your strategy has passed its backtest. Write the plan that takes it to live trading.',
          checklist: [
            { point: 'Run the same code on the paper account for a fixed number of weeks or trades, set in advance', why: 'Stopping when it looks good lets luck decide.' },
            { point: 'Compare paper with the backtest trade by trade: signals, fill prices, slippage in R', why: 'Differences show bugs in the program or in the backtest before they cost money.' },
            { point: 'Go live with the smallest size, one contract or a few shares', why: 'Paper fills are generous; real fills are the next unknown.' },
            { point: 'A written rule for scaling up and one for scaling back or stopping', why: 'Decisions made after a good week or a bad one are rarely good.' },
            { point: 'Risk checks, a daily loss limit and a tested kill switch from the first live order', why: 'The first live day is when unknown bugs appear.' },
            { point: 'Logs, a heartbeat and alerts to your phone; a daily report you read', why: 'Problems you do not see cannot be fixed.' },
            { point: 'For options: limit orders only, contracts chosen by rule, spreads as one order, positions closed before the close', why: 'Each removes a way an options program loses money that has nothing to do with the strategy.' },
            { point: 'An account funded with money you can afford to lose', why: 'The program can lose faster than you can react.' },
          ],
          why: 'Going live is a sequence of small tests, each cheap compared with the one after it. The plan exists so that you do not skip one because the last went well.',
        },
      ],
    },
    {
      id: 'algo-lab',
      title: 'Lab: an event-driven trading engine',
      summary: 'Bars in, a strategy, a risk gate, a simulated broker that fills on the next bar, a portfolio, and a halt on the loss limit.',
      text: [
        "This lab builds a small **event-driven trading engine** on made-up bars. Bars arrive one at a time. A strategy says what position it wants. A risk gate checks every order. A simulated broker fills orders at the next bar's open plus slippage. A portfolio keeps the position, the P&L and the equity. When the loss from the start reaches a limit, the engine halts, closes the position and refuses anything that adds risk.",
        'Nothing touches a real broker. The broker is a small class with the shape a real one has (`submit` now, fills later), which is how an engine is tested before it is pointed at a paper account. The last step is about what changes for that.',
        'Each step repeats the classes it needs, so it runs on its own. The rules from the module apply throughout: the strategy sees only the past, an order fills after it is sent and never on the bar that created it, every order passes the risk gate, and positions come from fills.',
      ],
      rules: [
        'The strategy computes its levels from closes before the current one.',
        'An order sent on bar i fills at the open of bar i + 1, plus slippage.',
        'Every order passes the risk gate; when halted, only orders that reduce the position pass.',
        'Positions and P&L are built from fills.',
        'Order size = target − position − orders already pending.',
        'Simulated first, paper next. A real broker adds states, ids and reconciliation.',
      ],
      questions: [
        {
          kind: 'write',
          id: 'algo-lab-1',
          ask: 'Step 1: the strategy. `on_bar(close)` returns the target position: `size` after a close above the highest of the previous `n` closes, 0 after a close below the lowest of them, and otherwise the last target. Until `n` earlier closes exist, keep the last target (0 at the start).',
          starter: `class Breakout:
    def __init__(self, n, size):
        self.n = n
        self.size = size
        self.closes = []
        self.target = 0

    def on_bar(self, close):
        self.closes.append(close)
        return self.target`,
          solution: `class Breakout:
    def __init__(self, n, size):
        self.n = n
        self.size = size
        self.closes = []
        self.target = 0

    def on_bar(self, close):
        past = self.closes[-self.n:]
        if len(past) == self.n:
            if close > max(past):
                self.target = self.size
            elif close < min(past):
                self.target = 0
        self.closes.append(close)
        return self.target`,
          tests: `s = Breakout(3, 100)
out = [s.on_bar(c) for c in [10, 11, 12, 13, 12.5, 11.0, 10.5, 12.0]]
assert out is not None, "the function returns nothing yet"
assert out[3] == 100, f"13 is above the previous three closes (10, 11, 12): target 100, got {out}"
assert out == [0, 0, 0, 100, 100, 0, 0, 0], f"expected [0, 0, 0, 100, 100, 0, 0, 0], got {out}"
s2 = Breakout(2, 50)
assert [s2.on_bar(c) for c in [5, 6]] == [0, 0], "no signal until 2 earlier closes exist"`,
          why: 'The level is computed from the closes before this one, and the current close is appended afterwards. Appending first would put the close inside its own level, and a close can never be above a maximum that includes itself, so the strategy would never trade.',
        },
        {
          kind: 'write',
          id: 'algo-lab-2',
          ask: 'Step 2: the risk gate. `check(qty, position, price)` gets a signed order size (+ buy, − sell) and the current signed position. Refuse (return False) if there is no usable price (None, not a number, or not above zero), if the size is over `max_order`, or if the position after the order would be beyond `max_position` either way. When `halted`, also refuse any order that does not reduce the size of the position.',
          starter: `class RiskGate:
    def __init__(self, max_order, max_position):
        self.max_order = max_order
        self.max_position = max_position
        self.halted = False

    def check(self, qty, position, price):
        return True`,
          solution: `class RiskGate:
    def __init__(self, max_order, max_position):
        self.max_order = max_order
        self.max_position = max_position
        self.halted = False

    def check(self, qty, position, price):
        if price is None or price != price or price <= 0:
            return False
        if abs(qty) > self.max_order:
            return False
        new = position + qty
        if abs(new) > self.max_position:
            return False
        if self.halted and abs(new) >= abs(position):
            return False
        return True`,
          tests: `g = RiskGate(max_order=100, max_position=200)
out = g.check(100, 0, 50.0)
assert out is not None, "the function returns nothing yet"
assert out is True, "a buy of 100 from flat passes"
assert g.check(150, 0, 50.0) is False, "150 is over the order limit"
assert g.check(100, 150, 50.0) is False, "150 + 100 is over the position limit"
assert g.check(-100, -150, 50.0) is False, "the position limit applies to shorts too"
assert g.check(10, 0, None) is False, "no price: refuse"
assert g.check(10, 0, float('nan')) is False, "a price that is not a number: refuse"
g.halted = True
assert g.check(50, 100, 50.0) is False, "halted: adding to the position is refused"
assert g.check(-100, 100, 50.0) is True, "halted: closing the position is allowed"`,
          why: '`price != price` is True only for NaN, a cheap way to catch it without importing anything. Allowing reducing orders while halted is what lets the engine get out of a position after the halt.',
        },
        {
          kind: 'write',
          id: 'algo-lab-3',
          ask: 'Step 3: the simulated broker. `submit(qty)` queues a signed order. `on_bar_open(open_price)` fills every queued order at this open, buys at `open + slippage` and sells at `open − slippage`, clears the queue and returns the fills as a list of `(qty, price)`.',
          starter: `class SimBroker:
    def __init__(self, slippage):
        self.slippage = slippage
        self.pending = []

    def submit(self, qty):
        self.pending.append(qty)

    def on_bar_open(self, open_price):
        return []`,
          solution: `class SimBroker:
    def __init__(self, slippage):
        self.slippage = slippage
        self.pending = []

    def submit(self, qty):
        self.pending.append(qty)

    def on_bar_open(self, open_price):
        fills = []
        for qty in self.pending:
            price = open_price + self.slippage if qty > 0 else open_price - self.slippage
            fills.append((qty, price))
        self.pending = []
        return fills`,
          tests: `b = SimBroker(0.02)
b.submit(100)
out = b.on_bar_open(50.0)
assert out is not None, "the function returns nothing yet"
assert len(out) == 1 and out[0][0] == 100 and abs(out[0][1] - 50.02) < 1e-9, f"a buy of 100 fills at 50.02, got {out}"
assert b.on_bar_open(50.5) == [], "the queue is empty after filling"
b.submit(-100)
q, p = b.on_bar_open(51.0)[0]
assert q == -100 and abs(p - 50.98) < 1e-9, f"a sell fills at 51.00 - 0.02 = 50.98, got {(q, p)}"`,
          why: 'Orders wait for the next bar, which is the honest fill from the backtest module, and slippage always goes against you. A real broker adapter replaces this class; nothing else in the engine needs to know.',
        },
        {
          kind: 'output',
          id: 'algo-lab-4',
          ask: 'Step 4: the timing, by hand. Each bar is (open, close). A buy is queued when a bar rises while flat, and filled at the next open plus a cent. What does this print?',
          code: `pending, position, cash = [], 0, 10000.0
bars = [(50.0, 50.4), (50.5, 51.0), (51.2, 50.6)]
for o, c in bars:
    for q in pending:
        position += q
        cash -= q * (o + 0.01)
    pending = []
    if position == 0 and c > o:
        pending.append(100)
print(position, round(cash, 2), round(cash + position * bars[-1][1], 2))`,
          answer: '100 4949.0 10009.0',
          why: 'The first bar rises, so a buy is queued; it fills at the second open, 50.50 + 0.01, costing $5,051. Marked at the last close of 50.60, equity is $4,949 + $5,060 = $10,009. The rise of the first bar, from 50.00 to 50.40, was never available to the trade.',
        },
        {
          kind: 'write',
          id: 'algo-lab-5',
          ask: 'Step 5: the portfolio, long only. `on_fill(qty, price, fee)` updates cash, position, average cost and realised P&L (fees count against realised P&L); a sell never exceeds the position, and the average cost returns to 0 when flat. `equity(mark)` is cash plus the position valued at `mark`.',
          starter: `class Portfolio:
    def __init__(self, cash):
        self.cash = cash
        self.position = 0
        self.avg = 0.0
        self.realised = 0.0

    def on_fill(self, qty, price, fee=0.0):
        self.position += qty

    def equity(self, mark):
        return self.cash`,
          solution: `class Portfolio:
    def __init__(self, cash):
        self.cash = cash
        self.position = 0
        self.avg = 0.0
        self.realised = 0.0

    def on_fill(self, qty, price, fee=0.0):
        self.cash -= qty * price + fee
        self.realised -= fee
        if qty > 0:
            self.avg = (self.avg * self.position + price * qty) / (self.position + qty)
        else:
            self.realised += -qty * (price - self.avg)
        self.position += qty
        if self.position == 0:
            self.avg = 0.0

    def equity(self, mark):
        return self.cash + self.position * mark`,
          tests: `p = Portfolio(10000.0)
p.on_fill(100, 50.0)
assert p.position == 100 and abs(p.cash - 5000.0) < 1e-9, f"buying 100 at 50 leaves 5,000 cash, got {p.position}, {p.cash}"
p.on_fill(100, 52.0)
assert abs(p.avg - 51.0) < 1e-9, f"the average cost of 100 at 50 and 100 at 52 is 51, got {p.avg}"
p.on_fill(-150, 53.0)
assert abs(p.realised - 300.0) < 1e-9, f"150 sold 2.00 above cost realises 300, got {p.realised}"
out = p.equity(54.0)
assert out is not None, "equity returns nothing yet"
assert abs(out - 10450.0) < 1e-9, f"300 realised plus 50 shares 3.00 above cost: equity 10,450, got {out}"
q = Portfolio(1000.0)
q.on_fill(10, 20.0, fee=1.0)
q.on_fill(-10, 21.0, fee=1.0)
assert q.position == 0 and q.avg == 0.0, "flat after selling everything"
assert abs(q.realised - 8.0) < 1e-9 and abs(q.equity(99.0) - 1008.0) < 1e-9, f"10 profit minus 2 of fees is 8, got {q.realised}"`,
          why: 'Cash and position give equity at any mark, and average cost splits the gain into realised and unrealised P&L. The two must agree: equity minus the starting cash equals realised plus unrealised, a check worth adding to the live engine too.',
        },
        {
          kind: 'bug',
          id: 'algo-lab-6',
          ask: 'Step 6: the main loop of an early version of the engine. Its backtest looks better than it should, because one line fills an order at a price it could not have had.',
          code: `for o, c in bars:
    for qty in broker.pending:          # orders sent on the previous bar
        portfolio.on_fill(qty, o)
    broker.pending = []
    target = strategy.on_bar(c)
    qty = target - portfolio.position
    if qty and gate.check(qty, portfolio.position, c):
        portfolio.on_fill(qty, c)`,
          line: 8,
          fix: '        broker.submit(qty)',
          why: 'The signal is known only at the close of the bar, and the order cannot fill at that same close: by the time it reaches the market, the close is gone. On breakouts the next open is usually worse, so filling at the signal close flatters every entry. Queue it and fill at the next open.',
        },
        {
          kind: 'write',
          id: 'algo-lab-7',
          numpy: true,
          ask: "Step 7: the engine. Write `run(bars, strategy, gate, broker, portfolio, max_loss)`. For each bar `(open, close)`: fill pending orders at the open; record equity at the close; if equity is `max_loss` or more below the starting cash, set `gate.halted`; get the strategy's target, and use 0 instead when halted; send `target − position − pending` if it is not zero and the gate passes it. Return a dict with `fills` (the number of fills), `position`, `realised`, `equity` (a NumPy array, one per bar) and `halted`.",
          starter: `import numpy as np

class Breakout:
    def __init__(self, n, size):
        self.n, self.size, self.closes, self.target = n, size, [], 0

    def on_bar(self, close):
        past = self.closes[-self.n:]
        if len(past) == self.n:
            if close > max(past):
                self.target = self.size
            elif close < min(past):
                self.target = 0
        self.closes.append(close)
        return self.target

class RiskGate:
    def __init__(self, max_order, max_position):
        self.max_order, self.max_position, self.halted = max_order, max_position, False

    def check(self, qty, position, price):
        if price is None or price != price or price <= 0:
            return False
        new = position + qty
        if abs(qty) > self.max_order or abs(new) > self.max_position:
            return False
        if self.halted and abs(new) >= abs(position):
            return False
        return True

class SimBroker:
    def __init__(self, slippage):
        self.slippage, self.pending = slippage, []

    def submit(self, qty):
        self.pending.append(qty)

    def on_bar_open(self, open_price):
        fills = [(q, open_price + self.slippage if q > 0 else open_price - self.slippage) for q in self.pending]
        self.pending = []
        return fills

class Portfolio:
    def __init__(self, cash):
        self.cash, self.position, self.avg, self.realised = cash, 0, 0.0, 0.0

    def on_fill(self, qty, price, fee=0.0):
        self.cash -= qty * price + fee
        self.realised -= fee
        if qty > 0:
            self.avg = (self.avg * self.position + price * qty) / (self.position + qty)
        else:
            self.realised += -qty * (price - self.avg)
        self.position += qty
        if self.position == 0:
            self.avg = 0.0

    def equity(self, mark):
        return self.cash + self.position * mark

def run(bars, strategy, gate, broker, portfolio, max_loss):
    start = portfolio.cash
    fills, equity = 0, []
    for o, c in bars:
        pass
    return {'fills': fills, 'position': portfolio.position, 'realised': portfolio.realised,
            'equity': np.array(equity), 'halted': gate.halted}`,
          solution: `import numpy as np

class Breakout:
    def __init__(self, n, size):
        self.n, self.size, self.closes, self.target = n, size, [], 0

    def on_bar(self, close):
        past = self.closes[-self.n:]
        if len(past) == self.n:
            if close > max(past):
                self.target = self.size
            elif close < min(past):
                self.target = 0
        self.closes.append(close)
        return self.target

class RiskGate:
    def __init__(self, max_order, max_position):
        self.max_order, self.max_position, self.halted = max_order, max_position, False

    def check(self, qty, position, price):
        if price is None or price != price or price <= 0:
            return False
        new = position + qty
        if abs(qty) > self.max_order or abs(new) > self.max_position:
            return False
        if self.halted and abs(new) >= abs(position):
            return False
        return True

class SimBroker:
    def __init__(self, slippage):
        self.slippage, self.pending = slippage, []

    def submit(self, qty):
        self.pending.append(qty)

    def on_bar_open(self, open_price):
        fills = [(q, open_price + self.slippage if q > 0 else open_price - self.slippage) for q in self.pending]
        self.pending = []
        return fills

class Portfolio:
    def __init__(self, cash):
        self.cash, self.position, self.avg, self.realised = cash, 0, 0.0, 0.0

    def on_fill(self, qty, price, fee=0.0):
        self.cash -= qty * price + fee
        self.realised -= fee
        if qty > 0:
            self.avg = (self.avg * self.position + price * qty) / (self.position + qty)
        else:
            self.realised += -qty * (price - self.avg)
        self.position += qty
        if self.position == 0:
            self.avg = 0.0

    def equity(self, mark):
        return self.cash + self.position * mark

def run(bars, strategy, gate, broker, portfolio, max_loss):
    start = portfolio.cash
    fills, equity = 0, []
    for o, c in bars:
        for qty, price in broker.on_bar_open(o):
            portfolio.on_fill(qty, price)
            fills += 1
        eq = portfolio.equity(c)
        equity.append(eq)
        if eq - start <= -max_loss:
            gate.halted = True
        target = strategy.on_bar(c)
        if gate.halted:
            target = 0
        qty = target - portfolio.position - sum(broker.pending)
        if qty != 0 and gate.check(qty, portfolio.position, c):
            broker.submit(qty)
    return {'fills': fills, 'position': portfolio.position, 'realised': portfolio.realised,
            'equity': np.array(equity), 'halted': gate.halted}`,
          tests: `bars = [(100, 100), (100, 101), (101, 102), (102, 103), (103, 104), (104, 103),
        (103, 99), (99, 98), (98, 97), (97, 100), (100, 101)]
def fresh(max_loss):
    return run(bars, Breakout(2, 10), RiskGate(10, 10), SimBroker(0.0), Portfolio(10000.0), max_loss)
out = fresh(1e9)
assert out is not None, "the function returns nothing yet"
assert out['fills'] == 3, f"buy at the open of bar 3, sell at the open of bar 7, buy again at the open of bar 10: 3 fills, got {out['fills']}"
assert out['position'] == 10, f"the last breakout leaves 10 shares, got {out['position']}"
assert abs(out['realised'] + 30.0) < 1e-9, f"bought at 102, sold at 99: -30 realised, got {out['realised']}"
assert len(out['equity']) == len(bars), "one equity value per bar"
assert abs(out['equity'][3] - 10010.0) < 1e-9, f"after buying 10 at 102, the close of 103 gives equity 10,010, got {out['equity'][3]}"
h = fresh(20.0)
assert h['halted'] is True, "the close of 99 on bar 6 puts equity 30 below the start: halt"
assert h['fills'] == 2 and h['position'] == 0, f"after the halt the new breakout is ignored and the engine stays flat, got {h['fills']} fills and position {h['position']}"`,
          why: 'The loop is the module in miniature: fills first, then marking and the loss check, then the strategy, then the gate. Subtracting pending orders stops the engine from sending the same order twice while the first is waiting, the event-driven form of the duplicate-order problem.',
        },
        {
          kind: 'bug',
          id: 'algo-lab-8',
          ask: 'Step 8: another version of the loop. It holds a losing position far past its loss limit and never halts, because one line counts the wrong loss.',
          code: `start = portfolio.cash
for o, c in bars:
    for qty, price in broker.on_bar_open(o):
        portfolio.on_fill(qty, price)
    eq = portfolio.equity(c)
    if portfolio.realised <= -max_loss:
        gate.halted = True
    target = 0 if gate.halted else strategy.on_bar(c)`,
          line: 6,
          fix: '    if eq - start <= -max_loss:',
          why: 'Realised P&L only moves when a position is closed, so an open position can lose without limit while the realised figure stays at zero. The loss limit must count the open position at its current price, which is what equity does.',
        },
        {
          kind: 'design',
          id: 'algo-lab-9',
          ask: 'Step 9: the engine works on made-up bars. List what has to change or be added before it runs against a broker paper account.',
          checklist: [
            { point: 'A broker adapter with the same `submit` interface, using the paper endpoint and keys from environment variables', why: 'Only the edge changes, so the tested engine stays the same.' },
            { point: 'Limit orders with client order ids, and full state tracking: accepted, partial fills, rejects, cancels', why: 'The simulated broker fills everything at once; a real one does not.' },
            { point: 'Reconciliation with the broker at startup and on a schedule, with a mismatch tripping the halt', why: "Local state drifts, and the broker's is the one that counts." },
            { point: 'Bars from the stream, finished bars only, UTC timestamps, and a halt on stale data', why: 'Live data has gaps, partial bars and delays the made-up bars do not.' },
            { point: 'More checks in the gate: price collar, orders per minute, a loss limit on realised plus unrealised P&L', why: 'The lab gate covers size and position only.' },
            { point: 'Logs of every event and decision, alerts to your phone, and a manual kill switch', why: 'Someone has to know when it stops or misbehaves.' },
            { point: 'A fixed paper period, then a comparison with the backtest of the same engine', why: 'Differences point to bugs before money is at stake.' },
          ],
          why: 'The engine is the easy part. The adapter, the checks and the monitoring are where the work and the safety are, and every one of them is tested on paper before a live order.',
        },
      ],
    },
  ],
}
