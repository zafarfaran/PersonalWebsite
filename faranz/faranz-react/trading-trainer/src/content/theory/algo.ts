import type { Block } from '../../types'

/** The full theory for each lesson of the algo module, keyed by lesson id. */
export const algoTheory: Record<string, Block[]> = {
  'algo-kinds': [
    { h: 'What a trading algorithm does' },
    'In trading, an **algorithm** is a program that reads market data and sends orders without a person clicking each one. That covers a wide range of programs, and it helps to split what they do into two jobs.',
    'The first job is deciding **what** to hold: buy SPY now, sell it at the close, hold no position at all. That is the **strategy**. The second job is deciding **how** to trade a position someone has already chosen: in one go or in pieces, at what prices, how fast. That is **execution**. Many programs do only one of the two. A fund manager may decide to sell 500,000 shares of a stock, and a program then works that sale into the market over the day without ever asking whether selling was wise.',
    'Most algorithmic trading, by volume, is execution: funds and brokers slicing large orders so that they cost less. The programs that decide what to hold are the smaller, more visible part.',

    { h: 'Four kinds of algorithm' },
    { sub: 'Execution algorithms' },
    'They take a decided trade and feed it to the market in slices. Their success is measured by how close the average price comes to a benchmark, such as the price when the decision was made. A later lesson covers them.',
    { sub: 'Market making' },
    'A **market maker** posts a bid and an ask at the same time and earns the **spread**, the gap between them, each time one buyer and one seller trade with it. Take a made-up stock quoted 20.00 bid and 20.03 ask. If a market maker buys 100 shares at the bid and later sells them at the ask, 200 times in a day, and pays fees of $0.002 a share on each trade, it makes (0.03 − 0.004) × 100 × 200 = $520, if the price stays put.',
    'It rarely stays put. The market maker is left holding **inventory**, shares it bought and has not yet sold. When someone better informed or faster sells to it shortly before the price drops, it loses more than many spreads earn. That is **adverse selection**: your quotes are taken most eagerly when they are wrong. Surviving it takes speed, very low fees and a great deal of data.',
    { sub: 'Statistical arbitrage' },
    'Many small bets on relationships between prices: two similar companies whose prices usually move together, or a basket of stocks against an index. Each bet has a small edge and the edge comes from doing hundreds of them. The quant module covers the statistics.',
    { sub: 'Trend and rule-based systems' },
    'Rules applied to bars: buy when the price closes above a level, sell at a stop or a target, hold for minutes, hours or weeks. These are the rules this course has written and tested. Automating them is what this module is mostly about.',

    { h: 'Latency and the speed race' },
    '**Latency** is the delay between something happening in the market and your order arriving at the exchange. It is measured in **milliseconds** (thousandths of a second, ms) and **microseconds** (millionths, μs). Firms that compete on speed rent rack space in the same building as the exchange computers, called **co-location**, and react in microseconds. A program on a home computer sends its order across the internet to a broker, which checks it and routes it on: tens to hundreds of milliseconds.',
    {
      code: `firm = 20e-6     # 20 microseconds, in seconds
you = 0.050      # 50 milliseconds, in seconds
print(round(you / firm))`,
      out: '2500',
    },
    'Put both delays in seconds before dividing. The firm here is 2,500 times faster. Any edge that depends on arriving first, such as trading on a headline, on a price that changed on another exchange a moment ago, or on being first in the queue at a price, goes to it.',
    'Latency also costs you on ordinary trades. A breakout signal fires because price is moving; while your order travels, the price keeps moving, and you buy higher than the price that triggered the signal. The faster the market at that moment, the more the delay costs.',

    { h: 'Where an individual can compete' },
    {
      list: [
        'Horizons long enough that a few hundred milliseconds do not matter: rules on 5-minute or 15-minute bars, held for many minutes or longer.',
        'Liquid instruments such as SPY, QQQ and large stocks, where the spread is small and your order is tiny next to the volume.',
        'Limit orders, so that a slow arrival costs you a missed trade rather than a bad price.',
        'Rules you have already tested, with expectancy measured after costs.',
      ],
    },
    'Out of reach: market making, arbitrage between venues, reacting to news in milliseconds, and anything else where the winner is whoever is first.',

    { h: 'What automation changes' },
    'Automation gives **consistency**. The program applies the rule on every bar, the same way, without hesitating after a loss, getting tired at 3 pm or taking a revenge trade. That is real value for a trader whose results suffer from those things.',
    'It does not create an edge. Recall from the backtest module that **expectancy** is the average result per trade in R, where R is the amount risked. A program multiplies whatever expectancy the rule has by the number of trades it takes. Take a rule at −0.02R with R = $100: ten trades a day by hand lose $20 on average; fifty trades a day automated lose $100. A losing rule, automated, loses faster. Most retail day traders lose money, and a program does not change that by itself.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Believing that a program is fast because computers are fast. Yours is slow next to the firms you would be racing.',
        'Automating a rule before measuring its expectancy after costs.',
        'Adding new filters while automating, and so trading a rule that was never tested.',
        'Choosing a market-making or arbitrage idea because it looks like free money in a backtest that ignores queue position and latency.',
      ],
    },
  ],

  'algo-anatomy': [
    { h: 'Five parts with narrow jobs' },
    'A trading program is easier to test and harder to break when it is split into parts that each do one thing and talk through small interfaces.',
    {
      list: [
        'The **data feed** receives bars or ticks from history or from the broker and turns them into **events** of one format, such as `{"type": "bar", "close": 101.2}`.',
        'The **strategy** reads events and says what position it wants. It knows nothing about brokers.',
        'The **risk checks** look at every proposed order and may refuse it.',
        '**Execution** turns the wanted position into orders, sends them, and follows each one until it is finished.',
        '**Record keeping** writes every event, order, fill and decision to a log, and keeps positions and profit and loss (**P&L**).',
      ],
    },

    { h: 'One path to the broker' },
    'The strategy returns an **intent**, such as "hold 200 SPY", and never sends an order itself. Execution compares the intent with the current position, works out the order, passes it through the risk checks, and only then sends it. With one path to the broker, a limit written in the risk checks cannot be bypassed by some other line of strategy code. A second path, added in a hurry, is how limits stop working.',

    { h: 'The event loop' },
    { sub: 'Queues and first in, first out' },
    'The parts are joined by an **event loop**: a queue of events processed one at a time. A **queue** is a list where items join at the back and leave from the front, so the oldest event is handled first (**first in, first out**). In Python, `collections.deque` does this efficiently: `append` adds to the back and `popleft` removes from the front.',
    { sub: 'Handlers that create events' },
    'Each type of event has a **handler**, a function that receives the event and may return new events. A bar handler might return an order event; the order handler, after the checks, returns a fill event when the broker reports one. The loop keeps going until the queue is empty.',
    {
      code: `from collections import deque

handlers = {'bar': lambda e: ['order'] if e == 'bar' else [], 'order': lambda e: ['fill']}
q, seen = deque(['bar', 'bar']), []
while q:
    e = q.popleft()
    seen.append(e)
    q.extend(handlers.get(e, lambda e: [])(e))
print(seen)`,
      out: "['bar', 'bar', 'order', 'order', 'fill', 'fill']",
    },
    'Both bars are handled before either order, because the orders joined the back of the queue. An event with no handler (here `fill`) is recorded and produces nothing.',

    { h: 'Records built from fills' },
    { sub: 'Positions per symbol' },
    'A **fill** is the broker telling you that part or all of an order traded, at a price. Positions are built from fills, never from orders, because an order is a wish and a fill is a fact. A dictionary from symbol to signed quantity is enough: buys add, sells subtract.',
    { sub: 'Average cost and realised P&L' },
    'The **average cost** of a position is the total paid divided by the shares held. Buying 200 at $10.00 and 100 at $10.30 costs $3,030 for 300 shares, an average of $10.10. Selling 150 at $10.50 **realises** 150 × (10.50 − 10.10) = $60: that profit is now locked in. The 150 shares still held have **unrealised** P&L, which changes with the price until they are sold. Selling does not change the average cost of what is left.',
    {
      code: `fills = [(200, 10.00), (100, 10.30), (-150, 10.50)]
pos, avg, realised = 0, 0.0, 0.0
for qty, price in fills:
    if qty > 0:
        avg = (avg * pos + price * qty) / (pos + qty)
    else:
        realised += -qty * (price - avg)
    pos += qty
print(pos, round(avg, 2), round(realised, 2))`,
      out: '150 10.1 60.0',
    },

    { h: 'Vectorised and event-driven code' },
    '**Vectorised** code computes a whole history at once with NumPy arrays. It runs thousands of times faster than a loop and is the right tool for a first look: test fifty variants of an idea and throw away the forty-five that fail. It cannot represent what happens between events: an order that waits, fills in parts, or is refused by a check.',
    { sub: 'The lookahead trap' },
    'Vectorised code also makes **lookahead**, using information before it was available, very easy, because the future sits in the same array. `np.diff(c) / c[:-1]` gives the return from each close to the next. A signal computed from close i + 1 must not be multiplied by the return that ends at close i + 1: shift the signal one place, so each position uses only closes already known.',
    {
      code: `import numpy as np

c = np.array([10.0, 11.0, 10.0, 11.0, 12.0])
ret = np.diff(c) / c[:-1]
up = (c[1:] > c[:-1]).astype(float)
leaked = (up * ret).sum()
honest = (np.concatenate([[0.0], up[:-1]]) * ret).sum()
print(round(leaked, 3), round(honest, 3))`,
      out: '0.291 0.0',
    },
    'The leaked version earns every up move, because it "decides" to hold using the move itself. The shifted version holds only after an up close, and on these prices that earns nothing.',
    '**Event-driven** code handles one event at a time, as live trading does. It is slower, but the same strategy and risk code can run in a backtest, on a paper account and live, with only the data source and the broker swapped. What you tested is then what runs.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Letting the strategy call the broker directly "for this one case".',
        'Keeping positions from orders sent rather than from fills received.',
        'Writing one program for backtests and a different one for live trading.',
        'Trusting a vectorised result without checking that every signal is shifted.',
      ],
    },
  ],

  'algo-data': [
    { h: 'Bars and ticks' },
    'Market data comes in two grains. A **tick** is a single event: a trade (price and size) or a change in the best bid and ask, called a **quote**. A **bar** summarises an interval, such as five minutes, by its open, high, low, close and volume (the charts module built bars from smaller bars). Ticks are complete and large: a busy stock produces many thousands of quotes a minute. Bars are small and lose the order of events inside the interval.',
    { sub: 'A bar is final only at its end' },
    'Many feeds send a bar while it is still forming, updating its high, low and close as trades arrive. Until the interval ends, its "close" is the latest trade. A rule tested on finished bars that acts on these updates is a different rule: it can buy at 10:02 on a close that has gone by 10:05. Act on finished bars, or test on the same updates you will trade.',

    { h: 'REST and streaming' },
    'A broker or data vendor offers an **API** (application programming interface): a way for your program to talk to its systems. There are two common shapes.',
    {
      list: [
        '**REST**: your program sends an HTTP request and gets one response. Good for actions and lookups: place an order, cancel it, fetch your account, download history.',
        '**Streaming**: your program opens a connection, usually a **WebSocket**, and the server pushes messages as things happen: new quotes, trades, bars and updates on your orders.',
      ],
    },
    'Prices and order updates belong on the stream. Polling REST for prices is late by up to the polling interval and uses up requests.',
    { sub: 'Rate limits and HTTP 429' },
    'A **rate limit** caps the requests you may make in a period, for example a few hundred a minute. Over it, the server answers with HTTP status **429** (too many requests). The correct reaction is to wait and retry later, not to try again at once in a loop. Count your own requests: 30 symbols polled every 5 seconds is 30 × 12 = 360 requests a minute before a single order is sent. A common way to keep count is a **sliding window**: remember the times of recent requests, forget those older than the window, and allow a new one only if fewer than the limit remain.',

    { h: 'Brokers at the time of writing' },
    "At the time of writing (2026), Alpaca offers an API for US stocks and options, with REST endpoints and WebSocket streams for market data and order updates. Its paper trading environment simulates fills against real-time quotes. Its free data plan streams real-time stock quotes from one exchange, IEX, rather than all of them, and allows 200 historical data requests a minute; a paid plan covers all US exchanges. Interactive Brokers offers the TWS API, which talks to its desktop platform or a gateway program running on your machine, and a Web API, and provides paper trading accounts. Both change their offers, so read the broker's documentation before relying on any detail.",
    'Two habits from the first day. Use the **paper account**, which trades with pretend money against real prices. And keep API keys out of code: load them from environment variables, keep paper and live keys apart, and never put them in a file that goes into version control.',
    { code: `import os

key_id = os.environ.get('BROKER_PAPER_KEY_ID')   # set outside the program
if key_id is None:
    raise SystemExit('no paper key set: refusing to start')` },

    { h: 'Clocks and time zones' },
    { sub: 'UTC and New York time' },
    'US stocks trade from 9:30 to 16:00 **New York time**. New York is 5 hours behind **UTC** (Coordinated Universal Time) in winter and 4 hours behind in summer, when **daylight saving time** applies, so the open in UTC moves by an hour twice a year. Store every timestamp in UTC, where nothing jumps, and convert to New York time only to apply session rules. In real code use a time zone library such as `zoneinfo.ZoneInfo("America/New_York")`, which knows the dates of the changes. A fixed offset shows the arithmetic:',
    {
      code: `from datetime import datetime, timedelta, timezone

ny_winter = timezone(timedelta(hours=-5))
t = datetime(2026, 1, 15, 20, 45, tzinfo=timezone.utc)
print(t.astimezone(ny_winter).strftime('%H:%M'))`,
      out: '15:45',
    },
    'The same 20:45 UTC in July would be 16:45 in New York, after the close. A program with a hard-coded offset trades at the wrong time for part of every year. Also check whether your bars are labelled by the time they start or the time they end: a 10:00 bar may mean 10:00 to 10:05, or 9:55 to 10:00.',
    { sub: 'Clocks that drift' },
    "A computer's clock drifts unless it is synchronised with a time server, which operating systems do through **NTP** (Network Time Protocol). It matters because you judge whether a quote is **stale** by its age: your clock minus the quote's timestamp. A quote stamped 11:00:01.200 read at 11:00:04.000 is 2.8 seconds old. If your clock is two seconds fast, every quote looks two seconds older than it is.",

    { h: 'Cleaning incoming data' },
    'Treat the feed as untrusted. After a reconnect, messages arrive twice or out of order, and bars go missing. Before the strategy sees anything: sort by time, keep one record per timestamp, list the gaps, and decide what a gap means (wait, fetch the history over REST, or stop).',
    {
      code: `bars = [(0, 5.0), (2, 5.2), (1, 5.1), (2, 5.3), (4, 5.6)]
latest = dict(bars)                 # the later value for t = 2 wins
clean = sorted(latest.items())
missing = [t for t in range(clean[0][0], clean[-1][0] + 1) if t not in latest]
print(clean, missing)`,
      out: '[(0, 5.0), (1, 5.1), (2, 5.3), (4, 5.6)] [3]',
    },

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Acting on a bar that is still forming.',
        'Polling prices in a loop and hitting the rate limit when an order needs to go out.',
        'Hard-coding a UTC offset for the open.',
        'Putting API keys in the script.',
        'Trading on a quote that stopped updating a minute ago.',
      ],
    },
  ],

  'algo-orders': [
    { h: 'An order is a process' },
    'When you send an order to a broker you do not get a fill back. You get, over the following seconds or hours, a series of messages about it. Your program must follow those messages, because what it holds depends on them and not on what it asked for.',

    { h: 'The states of an order' },
    {
      list: [
        '**Sent** (sometimes called pending): your program has sent it and has not heard back.',
        '**New** (accepted, working): the broker took it and it is live at the exchange.',
        '**Rejected**: the broker or exchange refused it, for example for lack of buying power, a price outside allowed limits, or a closed market.',
        '**Partially filled**: some of the quantity has traded; the rest is still working.',
        '**Filled**: all of it has traded.',
        '**Pending cancel**: you asked to cancel and the answer has not come back.',
        '**Cancelled**: the cancel succeeded; whatever had filled stays filled.',
        '**Expired**: its **time in force** ran out, for example a day order at the close.',
      ],
    },
    'Filled, cancelled, rejected and expired are **terminal states**: nothing more will happen. Updates that arrive afterwards are ignored or flagged. Brokers use their own names; at the time of writing Alpaca uses `new`, `partially_filled`, `filled`, `canceled`, `expired`, `rejected` and `pending_cancel`, among others. Map them onto your own short list.',
    { sub: 'Partial fills and cumulative quantity' },
    'An order can fill in pieces at different prices. Keep the **cumulative filled quantity** (the total so far), the size-weighted average price, and the remaining quantity, ordered minus filled. For a buy of 200 shares filled 50 at $20.00 and then 100 at $20.06:',
    {
      code: `fills = [(50, 20.00), (100, 20.06)]
filled = sum(q for q, p in fills)
avg = sum(q * p for q, p in fills) / filled
print(filled, round(avg, 2), 200 - filled)`,
      out: '150 20.04 50',
    },
    { sub: 'The cancel race' },
    'A cancel request and a fill can cross on the way. If the exchange fills the order before the cancel reaches it, the order ends filled and the cancel fails. So a program never marks an order cancelled when it asks; it waits for the broker to confirm, and it accepts any fill that comes first.',

    { h: 'The state machine in code' },
    'A **state machine** is a set of states and the events allowed to move between them. Writing the allowed moves as a table makes the impossible ones visible: any (state, event) pair not in the table is ignored or logged.',
    {
      code: `moves = {('sent', 'accepted'): 'new', ('new', 'cancel_requested'): 'pending_cancel',
         ('pending_cancel', 'canceled'): 'canceled'}
state = 'sent'
for event in ['accepted', 'cancel_requested', 'accepted', 'canceled']:
    state = moves.get((state, event), state)
print(state)`,
      out: 'canceled',
    },
    'The second `accepted` is not a legal move from pending cancel, so the state does not change.',

    { h: 'Idempotency and client order ids' },
    'An operation is **idempotent** when doing it twice has the same effect as doing it once. Sending an order is not idempotent by nature: send it twice and you have two orders.',
    { sub: 'What a timeout tells you' },
    'Nothing. A request that times out may never have arrived, or may have arrived and been accepted while the reply was lost. Sending it again might double your position; assuming it failed might leave a position you do not know about.',
    { sub: 'Retrying safely' },
    'Give each order a **client order id**, a unique string you choose, such as the strategy name, the date and a counter, before the first attempt. Keep the same id on every retry. After a timeout, ask the broker for the order by that id. If it exists, carry on with it; if not, send it again with the same id. At the time of writing Alpaca accepts a client order id on each order and lets you look an order up by it.',

    { h: 'Reconciliation' },
    "**Reconciliation** means comparing your program's view of positions and open orders with the broker's. The broker's view counts: it is what you will be charged for. Do it at startup, after any reconnect, and on a schedule. Compare every symbol on either side, treating a missing one as zero.",
    {
      code: `mine = {'SPY': 200, 'QQQ': 0}
broker = {'SPY': 100, 'IWM': 50}
diff = {s: (mine.get(s, 0), broker.get(s, 0)) for s in sorted(set(mine) | set(broker))
        if mine.get(s, 0) != broker.get(s, 0)}
print(diff)`,
      out: "{'IWM': (0, 50), 'SPY': (200, 100)}",
    },
    'On a mismatch, stop new orders and alert a person. Do not let the program trade to make the numbers agree: a program that is wrong about what it holds may be wrong about the fix too.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Treating "order sent" as "position held".',
        'Storing the size of the latest fill as if it were the total.',
        'Marking an order cancelled when the cancel is requested.',
        'Generating a new id on every retry.',
        'Restarting the program without reconciling first.',
      ],
    },
  ],

  'algo-execution': [
    { h: 'Why large orders are sliced' },
    'The markets module showed a large market order **walking the book**: it takes all the shares at the best price, then the next price, and so on, paying more as it goes. It also tells everyone watching that a large buyer is there. So a large **parent order** is cut into many **child orders**, sent over minutes or hours. An **execution algorithm** decides how big each child is and when it goes.',

    { h: 'TWAP' },
    '**TWAP**, time-weighted average price, sends equal slices at equal intervals. To buy 4,800 shares over four hours with a slice every 20 minutes, there are 12 slices of 400. It is simple and predictable, and it ignores how much is trading: a slice at a quiet midday moment is as large as one in the busy first half hour.',
    'Shares come in whole numbers, so the slices must add up exactly. Divide with remainder and spread the leftover shares one at a time:',
    {
      code: `base, extra = divmod(100, 7)
slices = [base + (1 if i < extra else 0) for i in range(7)]
print(slices, sum(slices))`,
      out: '[15, 15, 14, 14, 14, 14, 14] 100',
    },

    { h: 'VWAP' },
    "The **VWAP**, volume-weighted average price, of a period is the average price of all its trades, each weighted by its size: Σ(price × volume) ÷ Σ volume. If 1,000 shares trade at $10 and 3,000 at $11, the VWAP is (10,000 + 33,000) ÷ 4,000 = $10.75. Many institutions judge an execution by how close its average fill came to the day's VWAP.",
    'A **VWAP algorithm** sizes each slice in proportion to the volume expected in its interval, using a curve estimated from past days. In US stocks that curve is U-shaped: heavy near the open and the close, light at midday. If an interval usually holds 15% of the day\'s volume, it gets 15% of the order. Then the algorithm\'s weights match the market\'s weights, and its average lands near VWAP, unless volume arrives at unusual times that day.',
    { sub: 'Whole shares that add up' },
    'Rounding each slice separately can leave the total a share or two out. Rounding the cumulative target after each interval and taking differences keeps the total exact:',
    {
      code: `profile = [5, 3, 2, 3, 7]          # expected volume in each interval
qty, total, done, cum, out = 1001, sum(profile), 0, 0, []
for v in profile:
    cum += v
    target = round(qty * cum / total)
    out.append(target - done)
    done = target
print(out, sum(out))`,
      out: '[250, 150, 100, 151, 350] 1001',
    },

    { h: 'Participation' },
    'A **participation** or **percentage of volume** algorithm trades a fixed share of the volume as it happens: at 5%, if 40,000 shares trade in a minute, it buys 2,000. Its footprint stays small and steady, but the finishing time depends on the market. On a quiet day the order may not be done by the close.',

    { h: 'Measuring what execution cost' },
    { sub: 'Arrival price and implementation shortfall' },
    'The fair benchmark is the **arrival price**: the mid price (halfway between bid and ask) when you decided to trade. **Implementation shortfall** is how much worse your average fill was. For a buy it is (average fill − arrival) × shares. For a sell a lower price hurts, so the sign is flipped: (arrival − average fill) × shares.',
    'In **basis points** (bps), where one basis point is 0.01%: shortfall ÷ (arrival × shares) × 10,000. A sale of 5,000 shares decided at $80.00 and filled at an average of $79.92 has a shortfall of 0.08 × 5,000 = $400, which is 0.08 ÷ 80 × 10,000 = 10 bps.',
    { sub: 'Opportunity cost' },
    'Shares you meant to buy and never got also cost something if the price ran away from you. That missed gain is the **opportunity cost**, and a patient algorithm that leaves half the order unfilled can look cheap on the shares it did buy while doing badly overall.',

    { h: 'Impact against timing risk' },
    'Trading fast pushes the price against you: **market impact**. Trading slowly leaves you exposed to the price drifting away before you finish: **timing risk**. The choice depends on how urgent the trade is and how large it is compared with normal volume. There is no setting that avoids both.',

    { h: 'What this means for a small account' },
    'Two option contracts or a few hundred shares of SPY are a tiny fraction of the volume. For orders like these, the execution algorithm is one limit order at or near the mid, with a worst price set in advance. Slicing starts to matter when your order is large compared with the size shown at the best prices, which on thin option strikes can be only a few contracts.',
  ],

  'algo-risk': [
    { h: 'Why the checks sit outside the strategy' },
    'A strategy decides what it wants. Risk checks decide whether it may have it. Keeping them apart means a bug in the strategy, which is where most bugs are, cannot also switch off the limits. Every order passes the checks before it leaves the program, and the strategy has no way round them.',
    'The risk module set limits for a person trading by hand: risk per trade, a daily loss limit, maximum open risk. A program needs the same limits written as code, plus some a person never needs, because a person does not send a hundred orders a second by mistake.',

    { h: 'The pre-trade checks' },
    {
      list: [
        '**Order size**: no single order above a maximum number of shares or contracts, and above a maximum dollar value.',
        '**Position**: no order that would leave the position, per symbol and in total, above a maximum.',
        '**Price collar**: no limit price more than a set percentage from the current price.',
        '**Order rate**: no more than a set number of orders per minute.',
        '**Daily loss limit**: once the day\'s loss reaches the limit, only orders that reduce risk.',
      ],
    },
    { sub: 'The position after the order' },
    'The position check looks at what you would hold after the order, not at the order alone. Holding 700 shares with a limit of 1,000, a buy of 400 is a modest order but would leave 1,100, so it is refused. Checking only order sizes lets a loop of small orders build any position.',
    { sub: 'Price collar' },
    'With the last trade at $120.00 and a 1.5% collar, a buy limit may be at most 120 × 1.015 = $121.80 and a sell limit at least $118.20. A typo or a bug that prices an order far from the market is caught before it trades at whatever the book offers.',
    { sub: 'Daily loss limit' },
    'The loss that counts is realised plus unrealised: what closed trades lost and what the open position shows now. With a limit of $500, a day with −$350 realised and an open position showing −$200 is $50 past it. After the limit, orders that add to the position are refused and orders that reduce it are allowed, so the program can still get out.',

    { h: 'Fail closed' },
    'A check that cannot be computed must refuse the order. If there is no recent price, the collar cannot be checked and the position cannot be valued, so nothing goes out. This is called **failing closed**, like a door that locks when the power goes. The opposite, failing open, lets orders through exactly when the program knows least.',
    {
      code: `def collar_ok(limit, ref, pct):
    if ref is None or ref <= 0:
        return False                 # no price: refuse
    return abs(limit - ref) / ref <= pct

print(collar_ok(121.5, 120.0, 0.015), collar_ok(123.0, 120.0, 0.015), collar_ok(120.0, None, 0.015))`,
      out: 'True False False',
    },

    { h: 'The kill switch' },
    'A **kill switch** is one action that stops the program from trading: it blocks new orders, cancels every open order, and, if your plan says so, closes positions. A person can press it, and it trips by itself when something is wrong: the loss limit is hit, the position disagrees with the broker, market data stops, orders or rejects come too fast, or the program stops sending its **heartbeat** (a regular "I am alive" message to a monitor).',
    'It must work when the strategy is broken, so it is separate from the strategy, short enough to read in a minute, and tested by tripping it on purpose on the paper account. It should remember the first reason it tripped, which is the one to investigate, and only a person should reset it. Use the broker\'s own limits too where they exist, and fund the account the program trades with no more than you can afford to lose.',

    { h: 'Knight Capital, 1 August 2012' },
    'Knight Capital was one of the largest traders of US stocks. For the launch of the New York Stock Exchange\'s Retail Liquidity Program it deployed new code to SMARS, its system for routing orders. A technician did not copy the code to one of the eight servers. The new code reused a flag that years earlier had switched on an old function called **Power Peg**, which had been retired but never deleted. On the eighth server, orders carrying the flag woke Power Peg up.',
    'Power Peg was meant to send child orders until a parent order was complete. The part that counted its fills had been changed long before, so it never saw that it was done, and it kept sending. In about 45 minutes after the open, 212 parent orders produced millions of child orders: more than 4 million executions in 154 stocks, over 397 million shares. Knight reported a loss of about $440 million (the SEC later put it above $460 million). Within days it took about $400 million from rescue investors, and in 2013 it merged with Getco to form a new firm, KCG. In 2013 the SEC fined Knight $12 million for breaking its **market access rule**, which requires brokers that send orders to the market to have controls on the risk of those orders.',
    { sub: 'What would have stopped it' },
    'A limit on position per stock and in total. A limit on orders per minute. A check that compared what was sent with what was filled. A kill switch that tripped automatically and that people knew how to use. And no dead code left behind a flag that someone might reuse. None of these is clever; all of them have to exist before the day they are needed.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Putting the limits inside the strategy code.',
        'Checking order size but not the position the order would create.',
        'Letting orders through when the price is missing.',
        'A kill switch that blocks new orders but leaves old ones working.',
        'Never having tested the kill switch.',
      ],
    },
  ],

  'algo-live': [
    { h: 'From backtest to live in stages' },
    'A rule that passed its backtest goes live in steps, each cheap compared with the next, with the same code throughout:',
    {
      list: [
        '**Paper trading**: the program runs on the broker\'s paper account, with real prices and pretend money, for a period fixed in advance. It tests the plumbing: data, orders, states, reconnects, the kill switch.',
        '**Smallest live size**: one option contract or a few shares. It tests real fills, which paper accounts make generous. Alpaca\'s documentation, at the time of writing, says its paper trading does not account for market impact, slippage from latency or queue position.',
        '**Scaling up** by a rule written before you start, and a rule for scaling back down or stopping.',
      ],
    },
    'At every stage, compare trade by trade with the stage before: the same signals, the fill prices, the cost per trade in R.',

    { h: 'Why live trails the backtest' },
    { sub: 'Slippage' },
    '**Slippage** is the gap between the price your backtest assumed and the price you got. Measure it in R: the cost per share divided by the risk per share. If you lose $0.03 a share at entry and again at exit, with $0.50 a share at risk, slippage costs 0.06 ÷ 0.50 = 0.12R on every trade, winners and losers alike.',
    { sub: 'Latency' },
    'While your order travels, the price moves. On a breakout entry it usually moves against you. Log the time and price at the signal and at the fill, and you can measure the cost per 100 milliseconds of delay. If the price drifts 0.4 cents a share per 100 ms and your delay is 250 ms, that is 1 cent a share.',
    {
      code: `def cost_in_r(slip_each_side, drift_per_100ms, latency_ms, risk):
    return (2 * slip_each_side + drift_per_100ms * latency_ms / 100) / risk

print(round(cost_in_r(0.03, 0.004, 250, 0.50), 3))`,
      out: '0.14',
    },
    { sub: 'Missed fills, data and overfitting' },
    'A limit order that is not filled misses the trade, and the trades it misses are often the ones that ran away from you, the winners. Live data can differ from the history you tested on (a different exchange, bars built differently). Fees and commissions apply. And part of the backtest edge was probably fitted to noise. Each of these comes off every trade, which is why a small backtest edge often disappears live.',

    { h: 'Monitoring and alerts' },
    'Log every event, order, fill and risk decision with a timestamp, in a file you can search. Send a **heartbeat** so that a separate monitor notices if the program stops. Send yourself an **alert**, a phone notification or an email, when the kill switch trips, the loss limit is reached, data has not arrived for longer than a set number of seconds, orders are rejected, or positions disagree with the broker. Read a short report at the end of each day. A program that nobody watches turns small bugs into large losses.',

    { h: 'Choosing an option contract in code' },
    'Recall from the pricing module that an option\'s **delta** is roughly how much its price moves for a $1 move in the stock. A strategy usually wants a particular delta, such as 0.50. Choosing by rule means: drop contracts with no bid, drop those whose spread is too wide as a share of the mid (for example over 10%), and of the rest take the one whose delta is closest to the target, measured as an absolute distance so that contracts above and below are compared fairly. If none passes, the answer is no trade.',
    {
      code: `chain = [('C440', 0.71, 6.10, 6.20), ('C445', 0.52, 3.00, 3.60), ('C450', 0.41, 1.90, 2.00)]
ok = [(s, d) for s, d, bid, ask in chain if bid > 0 and (ask - bid) / ((ask + bid) / 2) <= 0.10]
print(min(ok, key=lambda x: abs(x[1] - 0.50))[0])`,
      out: 'C450',
    },
    'C445 has the nearest delta, but its spread is 0.60 on a mid of 3.30, about 18%, so it is dropped, and C450 (0.41) is nearer 0.50 than C440 (0.71).',

    { h: 'Sending spreads and pricing them' },
    { sub: 'One order for all the legs' },
    'A spread such as a call vertical has two **legs**, one bought and one sold. Sent as two orders, the first can fill while the second does not, leaving you with a position you did not plan. A **multi-leg order** sends both legs together with one net limit price, and they fill together or not at all. At the time of writing, Alpaca supports multi-leg option orders and Interactive Brokers supports combination orders; check your own broker.',
    { sub: 'Mid, natural and walking the limit' },
    'The **natural** price of a spread is what you pay by crossing every leg\'s spread: buy each long leg at its ask and sell each short leg at its bid. The **mid** uses the middle of each leg. For a long 460 call quoted 2.40/2.50 and a short 465 call quoted 0.90/0.96, the natural debit is 2.50 − 0.90 = 1.60 and the mid is 2.45 − 0.93 = 1.52. Start at the mid, raise the limit in small steps, and stop at a cap set in advance. Always use limit orders on options: a market order on a wide spread pays whatever is there. Close positions at a set time before the close, and never leave a short option open into expiry by accident.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Going from backtest straight to full size.',
        'Judging paper results as if paper fills were real.',
        'Choosing the delta nearest the target without checking the spread.',
        'Sending spread legs one at a time.',
        'Market orders on options.',
      ],
    },
  ],

  'algo-lab': [
    { h: 'What the engine does' },
    'The lab builds a small **trading engine**: a program that takes bars one at a time and turns them into trades under the rules of this module. It has four parts, each a small class, and a loop that joins them. Bars are made up and the broker is simulated, so you can test every part and know the right answer before anything touches a real account.',
    {
      list: [
        'A **strategy** that turns each close into a target position.',
        'A **risk gate** that can refuse any order.',
        'A **simulated broker** that queues orders and fills them at the next bar\'s open.',
        'A **portfolio** that keeps cash, position, average cost, P&L and equity, all from fills.',
      ],
    },

    { h: 'The strategy sees only the past' },
    'The lab strategy is a breakout: hold a fixed size after a close above the highest of the previous n closes, and hold nothing after a close below the lowest of them. "Previous" is the whole point. The class keeps a list of closes, computes the level from the last n entries before adding the current close, and only then appends it. If the current close were added first, it would be inside its own maximum and could never exceed it. A **target position** is what the strategy wants to hold, not an order: the engine works out the order from the difference.',
    { sub: 'Target, position and pending' },
    'The order to send is target − position − pending, where **pending** is the total of orders already sent and not yet filled. Without the pending term, the engine would send the same order again on every bar until the first one filled.',

    { h: 'The risk gate' },
    'The gate receives the signed order size (positive to buy, negative to sell), the current position and a price. It refuses when the price is unusable, the order is too big, or the position afterwards would be beyond the limit in either direction. Once the engine is **halted**, it also refuses anything that would not shrink the position, so the way out stays open and the way in is shut.',
    'An unusable price includes **NaN**, "not a number", the value a float takes after an invalid calculation. NaN is the only float that is not equal to itself, so `price != price` is True exactly when the price is NaN. Together with `price is None` and `price <= 0`, that covers the ways a price goes bad.',

    { h: 'The simulated broker and its timing' },
    'An order created at the close of a bar cannot trade at that close: by the time it reaches the market, the close is gone. The simulated broker therefore keeps orders in a queue and fills them at the open of the next bar, plus a slippage amount for buys and minus it for sells. A real broker sends fills later still and in pieces; replacing this class with an adapter for a paper account is the step after the lab.',
    { code: `pending, fills = [50], []
for open_price in [20.10, 20.30]:            # two bars
    fills += [(q, round(open_price + 0.01, 2)) for q in pending]
    pending = []
print(fills)`, out: '[(50, 20.11)]' },

    { h: 'The portfolio and equity' },
    'Cash goes down by quantity × price on a buy and up on a sell, and fees always come off. **Equity** is cash plus the position valued at the current price, the **mark**. Start with $5,000, buy 40 at $25 (cash $4,000), and with the price at $26 equity is $4,000 + 40 × $26 = $5,040. Average cost splits the gain: realised P&L on shares sold, unrealised on shares held. Their sum must equal equity minus the starting cash, which is a useful check on the bookkeeping.',
    {
      code: `cash, pos, avg = 5000.0, 0, 0.0
for qty, price in [(40, 25.0), (20, 26.0)]:
    cash -= qty * price
    avg = (avg * pos + price * qty) / (pos + qty)
    pos += qty
mark = 26.5
print(pos, round(avg, 3), cash + pos * mark, round(pos * (mark - avg), 2))`,
      out: '60 25.333 5070.0 70.0',
    },

    { h: 'The main loop' },
    'For each bar, the order of operations decides what the engine could have known. First, fill what was pending at this bar\'s open. Then mark the portfolio at the close and record equity. Then check the loss: if equity is the limit or more below the starting cash, halt. Then ask the strategy for its target, replace it with zero if halted, and send the difference if the gate allows it. Recording equity as a NumPy array at the end makes it easy to plot or to compute a drawdown.',
    { sub: 'Testing it' },
    'Build tiny bar lists where you can work out every fill by hand, and check the engine gets the same answer: which bar each order fills on, the realised P&L, the position at the end, and that a halt stops a later entry. Then run it on random bars, where a correct engine should find no edge before costs.',

    { h: 'From simulated to paper' },
    'The engine is the small part of a live system. To point it at a paper account it needs a broker adapter with the same interface, limit orders with client order ids and full state tracking, reconciliation, finished bars from the stream with stale-data checks, more checks in the gate, logs and alerts. Then it runs on paper for a fixed period and is compared with its own backtest before any money is involved.',
  ],
}
