import type { Module } from '../types'

export const execution: Module = {
  id: 'execution',
  title: 'Execution and market microstructure',
  summary:
    'How a trade really gets done: the order book as a queue, what impact and timing risk cost, optimal schedules in the spirit of Almgren and Chriss, passive against aggressive orders, market making, venues and routing, and measuring your own slippage, with NumPy throughout.',
  lessons: [
    {
      id: 'execution-book',
      title: 'The limit order book as a data structure',
      summary: 'Every resting order kept in a queue at its price: price-time priority, queue position, matching, and the venues that share fills pro rata instead.',
      widget: 'execution-queue',
      text: [
        'The markets lab kept a book as price levels with a total size at each. An exchange keeps more: every resting order with its id, side, price, size and arrival time. At each price the orders wait in a **queue**. Most stock and option venues match by **price-time priority**: a better price goes first, and at the same price the order that arrived first goes first (first in, first out, **FIFO**).',
        "An incoming order that can trade at once, a buy at or above the best ask or a sell at or below the best bid, is **marketable**. It trades against resting orders, best price first and oldest first within a price, and **at the resting order's price**. A buy limit at 50.05 that meets an ask at 50.02 pays 50.02. Whatever is left of a limit order then rests at its own price; what is left of a market order walks to the next level.",
        { code: `from collections import deque

bids = {50.00: deque([["A", 300], ["B", 500]])}   # price -> queue of [order_id, size]
asks = {50.02: deque([["C", 200]]), 50.03: deque([["D", 400]])}
best_bid, best_ask = max(bids), min(asks)          # 50.00, 50.02` },
        "**Queue position** decides whether a passive order fills. Your bid fills only after every share ahead of you at that price has traded or been cancelled. A trade printed at your price does not mean you were filled. Shares ahead shrink through trades and through cancels; orders that arrive after yours do not matter to you. Cancelling and resending puts you at the back. On many venues reducing an order's size keeps its place while raising the size or changing the price loses it; check the rules of the venue.",
        'Not every market is FIFO. Some futures contracts use **pro-rata** matching, where a fill at a price is shared among resting orders in proportion to their size, often after a top-of-queue allowance. Pro rata rewards large resting orders; FIFO rewards being early, which is one reason fast firms race to be first in the queue when a new price level opens.',
      ],
      rules: [
        'Price-time priority: better price first, then earlier order first.',
        "A marketable order trades at the resting order's price, best level first.",
        'You fill only after every share ahead of you at your price trades or cancels.',
        'Cancel and resend sends you to the back of the queue.',
        'Pro-rata venues share a fill by size; FIFO venues reward being early.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'execution-book-1',
          ask: 'The bid at $50.00 holds, in time order: A 300 shares, B 500, your order 200, C 400. A market sell for 900 shares arrives. How many of your shares fill?',
          answer: 100,
          check: 'min(200, max(0, 900 - (300 + 500)))',
          why: 'A and B are ahead of you and take 800. Only 100 of the sell is left when it reaches you, so you get 100 and keep 100 resting. C, behind you, gets nothing.',
        },
        {
          kind: 'number',
          id: 'execution-book-2',
          ask: 'Same queue: A 300, B 500, you 200, C 400. Before the sell arrives, B cancels. Then the market sell for 900 shares arrives. How many shares does C get?',
          answer: 400,
          check: 'min(400, 900 - 300 - 200)',
          why: 'With B gone, A takes 300, you take all 200, and C gets the last 400. A cancel ahead of you moves you up as surely as a trade does, which is why your fill time depends on other people changing their minds.',
        },
        {
          kind: 'number',
          id: 'execution-book-3',
          ask: 'Asks: 100 shares at $50.02 and 300 at $50.04. You send a buy limit for 300 shares at $50.05. What is your average fill price? Give 4 decimal places.',
          answer: 50.0333,
          tol: 0.0001,
          check: '(100 * 50.02 + 200 * 50.04) / 300',
          why: 'Your order trades at the resting prices: 100 at 50.02, then 200 at 50.04, an average of 50.0333. Your limit of 50.05 was the worst you would accept, not the price you pay.',
        },
        {
          kind: 'choice',
          id: 'execution-book-4',
          ask: 'You rest a bid for 200 shares at $50.00 behind 3,000 shares. You decide you want 300 and raise the size of the same order. On a typical price-time venue, what happens to your place?',
          options: [
            'Nothing: same order, same price, same place',
            'The order usually loses its place and goes to the back of the queue',
            'It moves to the front because it is now larger',
            'Only the extra 100 shares go to the back; the first 200 keep their place on every venue',
          ],
          answer: 1,
          why: 'Raising the size is treated like a new order on most price-time venues, so the whole order loses its time priority. If keeping your place matters, leave the order as it is and add a second order for 100 behind it.',
        },
        {
          kind: 'output',
          id: 'execution-book-5',
          ask: 'A market buy for 450 shares meets the queue at the best ask. What does this print?',
          code: `from collections import deque

q = deque([["A", 200], ["B", 100], ["C", 300]])
left = 450
fills = []
while left > 0 and q:
    oid, size = q[0]
    take = min(left, size)
    fills.append((oid, take))
    left -= take
    if take == size:
        q.popleft()
    else:
        q[0][1] -= take
print(fills, q[0])`,
          answer: "[('A', 200), ('B', 100), ('C', 150)] ['C', 150]",
          why: "A and B are taken in full in time order and removed. C is partly filled: 150 trade and 150 stay at the front of the queue, keeping C's place.",
        },
        {
          kind: 'bug',
          id: 'execution-book-6',
          ask: 'This should fill a market order against one price level in time order. In a test, the order that arrived last is always filled first.',
          code: `def fill_level(q, qty):
    fills = []
    while qty > 0 and q:
        oid, size = q.pop()
        take = min(qty, size)
        fills.append((oid, take))
        qty -= take
        if take < size:
            q.appendleft([oid, size - take])
    return fills`,
          line: 4,
          fix: '        oid, size = q.popleft()',
          why: '`pop` takes from the right end, the newest order: that is last in, first out. Price-time priority serves the oldest order first, from the left. The partial refill with `appendleft` was already right, which shows the queue was meant to be read from the left.',
        },
        {
          kind: 'choice',
          id: 'execution-book-7',
          ask: 'In the figure, set 1,500 shares ahead of you and a cancel rate of 0, and note when you fill. Then raise the cancel rate. Market sells are the same in both runs. What changes?',
          options: [
            'Nothing: only trades can move you up the queue',
            'You fill earlier, because cancels ahead of you shrink the queue as trades do',
            'You fill later, because cancels make the book thinner',
            'You fill at a better price',
          ],
          answer: 1,
          why: 'Shares ahead of you disappear either by trading or by being cancelled. With heavy cancelling you reach the front with far less selling. The price you get is your limit either way; only the time, and whether you fill at all, changes.',
        },
        {
          kind: 'number',
          id: 'execution-book-8',
          ask: 'A pro-rata level holds three resting buy orders of 600, 300 and 100 contracts. A sell of 500 contracts arrives and is shared in proportion to size, with no top-of-queue allowance. How many contracts does the 300 order get?',
          answer: 150,
          check: '500 * 300 / (600 + 300 + 100)',
          why: 'The 300 order is 30% of the 1,000 resting, so it gets 30% of 500. Arrival time does not matter, so on pro-rata venues traders rest more size than they want and expect partial fills.',
        },
        {
          kind: 'write',
          id: 'execution-book-9',
          ask: 'Write `shares_ahead(queue, my_id)`: `queue` is a list of `[order_id, size]` in time order at one price. Return the total size ahead of the order `my_id`, or `None` if it is not in the queue.',
          starter: `def shares_ahead(queue, my_id):
    pass`,
          solution: `def shares_ahead(queue, my_id):
    total = 0
    for oid, size in queue:
        if oid == my_id:
            return total
        total += size
    return None`,
          tests: `out = shares_ahead([["A", 300], ["me", 200], ["B", 400]], "me")
assert out is not None, "the function returns nothing yet"
assert out == 300, f"only A is ahead of you: 300, got {out}"
assert shares_ahead([["me", 200], ["B", 400]], "me") == 0, "at the front, nothing is ahead"
assert shares_ahead([["A", 100], ["B", 50], ["me", 10], ["C", 999]], "me") == 150, "orders behind you do not count"
assert shares_ahead([["A", 100]], "me") is None, "an order that is not there has no position"`,
          why: 'This one number is what a passive trader watches. Your own size does not matter to your position, and nothing behind you does either.',
        },
        {
          kind: 'write',
          id: 'execution-book-10',
          ask: 'Write `fill_queue(queue, qty)`: `queue` is a list of `[order_id, size]` in time order. Fill `qty` shares first in, first out. Return `(fills, rest)`: `fills` a list of `(order_id, shares)` and `rest` the queue left over, with a partly filled order keeping its place at the front. Do not change the list passed in.',
          starter: `def fill_queue(queue, qty):
    fills = []
    rest = [list(o) for o in queue]
    return fills, rest`,
          solution: `def fill_queue(queue, qty):
    fills = []
    rest = [list(o) for o in queue]
    while qty > 0 and rest:
        oid, size = rest[0]
        take = min(qty, size)
        fills.append((oid, take))
        qty -= take
        if take == size:
            rest.pop(0)
        else:
            rest[0][1] = size - take
    return fills, rest`,
          tests: `q = [["A", 300], ["B", 500], ["C", 200]]
out = fill_queue(q, 600)
assert out is not None, "the function returns nothing yet"
fills, rest = out
assert fills == [("A", 300), ("B", 300)], f"A in full, then 300 of B, got {fills}"
assert rest == [["B", 200], ["C", 200]], f"B keeps its place with 200 left, got {rest}"
assert q == [["A", 300], ["B", 500], ["C", 200]], "do not change the queue passed in"
f2, r2 = fill_queue(q, 5000)
assert sum(s for _, s in f2) == 1000 and r2 == [], "an order bigger than the queue takes everything and leaves it empty"
assert fill_queue(q, 0) == ([], q), "nothing to fill: no fills, queue unchanged"`,
          why: 'This is the inner loop of every price-time matching engine. A real one keeps the queue as a linked list or deque with a map from order id to its place, so a cancel is found without scanning.',
        },
        {
          kind: 'design',
          id: 'execution-book-11',
          ask: "You are writing the matching engine for a paper-trading simulator that will replay quotes and trades and fill your strategy's limit orders. What must it handle to give fills you could believe?",
          checklist: [
            { point: 'Queue position: your order joins behind the displayed size at its price when you send it', why: 'Assuming you fill whenever price touches your limit overstates passive fills badly.' },
            { point: 'Shares ahead shrink only through trades at your price and through cancels, which you must estimate', why: 'Replayed data shows size changing at a level but rarely says whether it was ahead of you.' },
            { point: 'Marketable orders fill at resting prices and walk the book', why: 'A large order does not fill at the top price alone.' },
            { point: 'Partial fills, cancels, and the loss of priority on a size increase or price change', why: 'Order life cycles in the algo module depend on these states.' },
            { point: 'Latency between your decision and the order reaching the book', why: 'In that time the queue and the price move without you.' },
            { point: 'The matching rule of the real venue (FIFO or pro rata)', why: 'The same order fills very differently under the two rules.' },
            { point: 'A check against reality: compare simulated fill rates with a period of real paper or small live orders', why: 'Fill models are guesses until measured.' },
          ],
          why: 'Simulated passive fills are the most common way a microstructure backtest flatters itself. A fill model that ignores the queue is not a simplification but a different strategy.',
        },
      ],
    },
    {
      id: 'execution-cost',
      title: 'The cost of trading: spread, impact and timing risk',
      summary: 'Half the spread, the impact of your own order, and the risk of waiting; temporary against permanent impact, and the square-root rule of thumb.',
      widget: 'execution-impact',
      text: [
        'Measured against the **arrival mid**, the mid when you decided to trade, a buy costs four things. The **half spread** for crossing to the ask. **Impact**: your own buying pushes the price up while you trade. **Timing risk**: the price wanders while you wait, which can help or hurt and is a risk rather than an expected cost. And **fees**. Shares you never get because the price ran away carry an **opportunity cost**.',
        'Impact has two parts. **Temporary impact** is the concession you pay for taking liquidity quickly; it fades once you stop. **Permanent impact** is the part that stays, because your trading told the market something, or looked as if it did. Studies of large institutional orders find that after an order ends the price falls back part of the way: by the close it sits at roughly two thirds of the peak, and it keeps fading over the following days (Bucci and others, 2019, on a large database of US institutional orders).',
        'The best-known rule of thumb is the **square-root law**: the impact of an order of Q shares in a stock that trades V shares a day with daily volatility σ is about `Y × σ × √(Q / V)`, where Y is a number of order one estimated from many orders. It has been found in stocks, futures and other markets (Tóth and others, 2011, among many). It describes averages over many orders; a single order can do much better or much worse.',
        { code: `import math

def impact_bps(q, v, sigma, y=1.0):
    return y * sigma * math.sqrt(q / v) * 10_000

print(round(impact_bps(10_000, 1_000_000, 0.02)))   # 1% of a day's volume: 20 bps` },
        'Two consequences. Impact per share grows with the square root of size, so doubling an order adds about 41% per share and 2.8 times the total dollars. And trading slowly lowers impact but leaves you holding the risk of the price moving for longer: over a fraction T of a day that risk is about `σ × √T`. For a few hundred shares of SPY the spread is the whole cost; impact matters once your order is a visible share of what trades, as on a thin option strike.',
      ],
      rules: [
        'Cost against arrival = half spread + impact + fees; timing risk adds variance.',
        'Temporary impact fades when you stop; permanent impact stays.',
        'Square-root rule: impact ≈ Y × σ × √(Q / V), Y of order one.',
        'Double the size: about 1.41 times the cost per share, 2.83 times the dollars.',
        'Waiting a fraction T of a day exposes you to about σ × √T of price risk.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'execution-cost-1',
          ask: 'A stock has a daily volatility of 2% and trades 2 million shares a day. Using the square-root rule with Y = 1, what is the impact of buying 20,000 shares? Give basis points.',
          answer: 20,
          check: '1.0 * 0.02 * math.sqrt(20000 / 2000000) * 10000',
          why: '20,000 is 1% of the day, √0.01 = 0.1, and 0.1 × 2% = 0.2%, or 20 bps. That is several times the spread of a liquid stock, so at this size impact is the main cost.',
        },
        {
          kind: 'number',
          id: 'execution-cost-2',
          ask: 'Same stock (σ = 2%, 2 million shares a day, Y = 1). You buy 80,000 shares instead. What is the impact in basis points?',
          answer: 40,
          check: '0.02 * math.sqrt(80000 / 2000000) * 10000',
          why: 'Four times the size is twice the impact per share: √4 = 2. The cost per share grows more slowly than the size, but it grows.',
        },
        {
          kind: 'choice',
          id: 'execution-cost-3',
          ask: 'Under the square-root rule, you double the size of an order. What happens to the impact per share and to the total impact cost in dollars?',
          options: [
            'Both double',
            'Per share × 1.41, dollars × 2.83',
            'Per share unchanged, dollars × 2',
            'Per share × 2, dollars × 4',
          ],
          answer: 1,
          why: 'Per share it scales with √2 ≈ 1.41. The dollars are per-share cost times shares, 1.41 × 2 ≈ 2.83. Total cost grows like Q to the power 1.5, which is why big orders are split and spread over time.',
        },
        {
          kind: 'number',
          id: 'execution-cost-4',
          ask: 'You buy 50,000 shares of a $40 stock. You estimate impact at 25 bps and the half spread at 2 bps. What is the expected cost in dollars, before fees?',
          answer: 5400,
          check: '50000 * 40 * (25 + 2) / 10000',
          why: 'The order is $2,000,000, and 27 bps of that is $5,400. Work costs out in bps first, then turn them into dollars; it keeps orders of different size comparable.',
        },
        {
          kind: 'output',
          id: 'execution-cost-5',
          ask: 'Impact in basis points at three order sizes, as a share of daily volume. What does this print?',
          code: `import math

sigma = 0.015
for share in (0.01, 0.04, 0.09):
    print(round(sigma * math.sqrt(share) * 10_000), end=" ")`,
          answer: '15 30 45',
          why: 'Square roots of 1%, 4% and 9% of a day are 0.1, 0.2 and 0.3. Nine times the size costs three times as much per share.',
        },
        {
          kind: 'bug',
          id: 'execution-cost-6',
          ask: "This should give square-root impact in bps. It says 1% of a day's volume costs 2 bps in a 2% volatility stock, which is ten times too little.",
          code: `def impact_bps(q, v, sigma, y=1.0):
    share = q / v
    cost = y * sigma * share
    return cost * 10_000`,
          line: 3,
          fix: '    cost = y * sigma * share ** 0.5',
          why: 'Without the square root the model is linear: 2% × 0.01 = 0.02%, 2 bps. With it, 2% × 0.1 = 20 bps. A linear model badly understates the cost of small and medium orders, and overstates that of very large ones.',
        },
        {
          kind: 'choice',
          id: 'execution-cost-7',
          ask: 'You finish buying a large order at 11:00; the price peaked at your last fill. By the close it has fallen back about a third of the way to where you started. What does that fall represent?',
          options: [
            'The temporary part of your impact fading; what is left is the permanent part',
            'Proof that the stock was overvalued',
            'Bad luck unrelated to your order',
            'A sign that you should have bought more at the peak',
          ],
          answer: 0,
          why: 'The concession you paid for liquidity relaxes once your pressure stops. The fills cost what they cost, but the position is now marked lower than your last fills, so judging the trade by the price at your last fill flatters the move you caused for good.',
        },
        {
          kind: 'number',
          id: 'execution-cost-8',
          ask: 'A stock has a daily volatility of 1.5%. You plan to work an order over a quarter of the trading day. About how large is one standard deviation of the price move over that time? Give a percentage, for example 25%.',
          answer: 0.0075,
          tol: 0.0001,
          check: '0.015 * math.sqrt(0.25)',
          why: "1.5% × √0.25 = 0.75%. Risk grows with the square root of time, so a quarter of a day carries half a day's volatility, not a quarter. It can help or hurt, but it is variance you choose by choosing to wait.",
        },
        {
          kind: 'choice',
          id: 'execution-cost-9',
          ask: 'In the figure, raise the order from 1% to 4% of daily volume and keep the volatility the same. What happens to the peak impact and to the dollar cost?',
          options: [
            'Peak ×4, dollar cost ×4',
            'Peak ×2, dollar cost ×8',
            'Peak ×2, dollar cost ×2',
            'Peak unchanged, dollar cost ×4',
          ],
          answer: 1,
          why: 'The peak follows √(Q / V): √4 = 2. The dollar cost is the per-share cost, also doubled, times four times the shares: eight times. Size is the most expensive dial in execution.',
        },
        {
          kind: 'write',
          id: 'execution-cost-10',
          ask: 'Write `expected_cost_bps(q, v, sigma, spread_bps, y=1.0)`: the expected cost of an order in basis points, half the quoted spread plus square-root impact `y × sigma × √(q / v)` in bps.',
          starter: `import math

def expected_cost_bps(q, v, sigma, spread_bps, y=1.0):
    pass`,
          solution: `import math

def expected_cost_bps(q, v, sigma, spread_bps, y=1.0):
    return spread_bps / 2 + y * sigma * math.sqrt(q / v) * 10_000`,
          tests: `out = expected_cost_bps(20_000, 2_000_000, 0.02, 4)
assert out is not None, "the function returns nothing yet"
assert abs(out - 22) < 1e-9, f"2 bps half spread + 20 bps impact = 22, got {out}"
assert abs(expected_cost_bps(1, 10**12, 0.02, 4) - 2) < 0.01, "a tiny order pays about the half spread only"
assert abs(expected_cost_bps(80_000, 2_000_000, 0.02, 0, y=0.5) - 20) < 1e-9, "y scales the impact: 0.5 x 40 bps = 20"`,
          why: "A pre-trade estimate like this belongs in a backtest's cost model, so a strategy that trades big in thin names is charged for it. The spread part is the floor; the impact part grows with size.",
        },
        {
          kind: 'design',
          id: 'execution-cost-11',
          ask: 'Your strategy wants to buy 200 SPY call contracts at a strike that trades about 1,000 contracts a day, quoted $2.40 to $2.60 with 20 contracts on each side. Before sending anything, how do you estimate what execution will cost?',
          checklist: [
            { point: 'The half spread alone is $0.10 a contract, about 4% of the price: $2,000 on 200 contracts', why: 'On options the spread is often the biggest cost before impact even starts.' },
            { point: "200 contracts is 20% of a day's volume and ten times the displayed size", why: 'At that share of volume impact is large and the square-root rule is only a rough guide.' },
            { point: 'Market makers will widen or move their quotes as you take size', why: 'Displayed size is not a promise to trade more at the same price.' },
            { point: 'Consider a more liquid strike or expiry, or SPY shares for part of the exposure', why: 'Choosing a liquid instrument usually saves more than any slicing.' },
            { point: 'Work it with limit orders near the mid over time, accepting timing risk', why: 'Patience lowers impact but leaves you exposed to the underlying moving.' },
            { point: "Put the estimated cost into the trade's expectancy before deciding", why: 'An edge smaller than the round-trip cost is not an edge.' },
          ],
          why: 'The square-root rule was measured on stocks and futures; on a thin option strike treat it as a floor, and let the spread and displayed size tell you most of the story.',
        },
      ],
    },
    {
      id: 'execution-optimal',
      title: 'Optimal execution: impact against risk',
      summary: 'The Almgren-Chriss trade-off in plain words: expected cost plus a price on risk, why equal slices suit the risk-neutral, and why risk aversion front-loads.',
      widget: 'execution-schedule',
      text: [
        'The algo module stated the trade-off: trade fast and pay impact, trade slowly and carry timing risk. Almgren and Chriss (Journal of Risk, 2000) turned it into a choice you can compute: pick the schedule that minimises **expected cost + λ × variance of cost**, where λ (lambda) is your **risk aversion**, the price you put on uncertainty.',
        'A small version. Sell X shares over N periods. In period k you trade `n_k` shares and hold `x_k` afterwards. **Temporary impact** is linear: each share traded in period k costs `η × n_k`, so the period costs `η × n_k²` and the total is `η × Σ n_k²`. Linear **permanent impact** costs almost the same whatever the schedule, so it does not change which schedule is best. **Risk**: the price moves by a random amount with standard deviation σ each period on what you still hold, so the variance of the result is `σ² × Σ x_k²`.',
        'Because cost grows with the square of each slice, equal slices minimise expected cost: with λ = 0 the best schedule is TWAP. Any λ > 0 makes holding expensive, so you sell more early. The solution is `x_j = X × sinh(κ(N − j)) / sinh(κN)`, with `cosh κ = 1 + λσ² / (2η)`: the larger κ, the faster the position comes down.',
        { code: `import math

def holdings(X, N, lam, sigma, eta):
    k = math.acosh(1 + lam * sigma ** 2 / (2 * eta))
    if k == 0:
        return [X * (N - j) / N for j in range(N + 1)]
    return [X * math.sinh(k * (N - j)) / math.sinh(k * N) for j in range(N + 1)]

print([round(x) for x in holdings(6000, 4, 1e-4, 0.5, 1e-4)])   # [6000, 3537, 1959, 871, 0]` },
        'Every λ gives one pair of expected cost and standard deviation; together they form an **efficient frontier**, and no point on it is best for everyone. A forecast that the price will move against you while you wait (**alpha decay**) adds urgency as risk does. The model is a way of thinking, not a machine: real impact is closer to square-root than linear, η and σ are estimated with error, and practical algorithms re-plan as fills and prices arrive.',
      ],
      rules: [
        'Minimise expected cost + λ × variance; λ is the price you put on risk.',
        'Linear temporary impact: cost = η × Σ n_k². Equal slices minimise it.',
        'Risk: variance = σ² × Σ x_k², the shares still held each period.',
        'λ = 0 gives TWAP; larger λ front-loads the schedule.',
        'A forecast against you adds urgency, like risk aversion.',
        'The model guides judgement; its inputs are rough and live algorithms re-plan.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'execution-optimal-1',
          ask: 'You sell 6,000 shares in 3 equal slices. Temporary impact costs η × n² per slice with η = $0.0002 per share per share. What is the expected impact cost in dollars?',
          answer: 2400,
          check: '0.0002 * 3 * 2000 ** 2',
          why: 'Each slice is 2,000 shares and costs 0.0002 × 2,000² = $800; three slices make $2,400.',
        },
        {
          kind: 'number',
          id: 'execution-optimal-2',
          ask: 'Same model (η = $0.0002). You sell all 6,000 shares in the first period instead. What is the impact cost in dollars?',
          answer: 7200,
          check: '0.0002 * 6000 ** 2',
          why: '0.0002 × 36,000,000 = $7,200, three times the cost of three equal slices. Squaring punishes concentration: the cost of N equal slices is the cost of one big trade divided by N.',
        },
        {
          kind: 'number',
          id: 'execution-optimal-3',
          ask: 'The 3-slice schedule leaves you holding 4,000 shares after the first trade, 2,000 after the second and 0 after the third. The price moves with a standard deviation of $0.40 per period on what you hold. What is the standard deviation of the result in dollars? Round to the nearest dollar.',
          answer: 1789,
          tol: 1,
          check: '0.4 * math.sqrt(4000 ** 2 + 2000 ** 2 + 0 ** 2)',
          why: 'Variance = 0.4² × (4,000² + 2,000²) = 0.16 × 20,000,000 = 3,200,000, whose square root is about $1,789. Trading faster shrinks the holdings, and with them this number, at the price of more impact.',
        },
        {
          kind: 'choice',
          id: 'execution-optimal-4',
          ask: 'In the Almgren-Chriss model you raise λ, the risk aversion. What happens to the schedule?',
          options: [
            'It stays at equal slices: risk does not change the best schedule',
            'It sells more early (front-loaded), lowering risk and raising expected cost',
            'It sells more late, to wait for a better price',
            'It sells everything in the first period whatever λ is',
          ],
          answer: 1,
          why: 'Holding shares is what creates variance, so a higher price on variance makes you shed them sooner. You accept bigger early slices, and the extra impact they cost, in exchange for less exposure.',
        },
        {
          kind: 'output',
          id: 'execution-optimal-5',
          ask: 'Holdings after each period for a risk-neutral seller and a risk-averse one. What does this print?',
          code: `import math

def holdings(X, N, lam, sigma, eta):
    k = math.acosh(1 + lam * sigma ** 2 / (2 * eta))
    if k == 0:
        return [round(X * (N - j) / N) for j in range(N + 1)]
    return [round(X * math.sinh(k * (N - j)) / math.sinh(k * N)) for j in range(N + 1)]

print(holdings(8000, 4, 0.0, 0.5, 1e-4))
print(holdings(8000, 4, 4e-4, 0.5, 1e-4))`,
          answer: `[8000, 6000, 4000, 2000, 0]
[8000, 3048, 1143, 381, 0]`,
          why: 'With λ = 0 the holdings fall in a straight line: TWAP. With λ = 4e-4, cosh κ = 1 + 0.0001 / 0.0002 = 1.5, and the seller sells over 60% of the shares in the first period. The same model gives both; only the price of risk differs.',
        },
        {
          kind: 'bug',
          id: 'execution-optimal-6',
          ask: 'This should give a front-loaded schedule. Instead the holdings rise from 0 to X, as if the seller started flat and bought.',
          code: `import math

def holdings(X, N, lam, sigma, eta):
    k = math.acosh(1 + lam * sigma ** 2 / (2 * eta))
    return [X * math.sinh(k * j) / math.sinh(k * N) for j in range(N + 1)]`,
          line: 5,
          fix: '    return [X * math.sinh(k * (N - j)) / math.sinh(k * N) for j in range(N + 1)]',
          why: 'The holdings must start at X when j = 0 and end at 0 when j = N, so the argument is the time left, N − j. Checking the two ends of any schedule is the quickest test there is.',
        },
        {
          kind: 'choice',
          id: 'execution-optimal-7',
          ask: 'In the figure, move the risk aversion from its lowest setting to its highest. How do the expected cost and the standard deviation in the readout change?',
          options: [
            'Both fall',
            'Expected cost rises and the standard deviation falls',
            'Expected cost falls and the standard deviation rises',
            'Both rise',
          ],
          answer: 1,
          why: 'At the lowest setting the schedule is close to TWAP: cheapest on average, most exposed. Raising λ buys certainty with impact. Each setting is one point on the frontier; which one is right depends on how much the risk matters to you.',
        },
        {
          kind: 'write',
          id: 'execution-optimal-8',
          ask: 'Write `schedule_cost(trades, eta, sigma)`: `trades` is the list of shares sold in each period, summing to X. Return `(expected_cost, sd)`: `eta × Σ n²`, and `sigma × √(Σ x²)` where x is the holding left after each trade.',
          starter: `import math

def schedule_cost(trades, eta, sigma):
    pass`,
          solution: `import math

def schedule_cost(trades, eta, sigma):
    left = sum(trades)
    var = 0.0
    for n in trades:
        left -= n
        var += left ** 2
    return eta * sum(n * n for n in trades), sigma * math.sqrt(var)`,
          tests: `out = schedule_cost([2000, 2000, 2000], 0.0002, 0.4)
assert out is not None, "the function returns nothing yet"
cost, sd = out
assert abs(cost - 2400) < 1e-6, f"3 slices of 2,000 at eta 0.0002 cost 2,400, got {cost}"
assert abs(sd - 0.4 * math.sqrt(4000 ** 2 + 2000 ** 2)) < 1e-6, f"holdings left are 4,000, 2,000 and 0, got sd {sd}"
c1, s1 = schedule_cost([6000], 0.0002, 0.4)
assert abs(c1 - 7200) < 1e-6 and s1 == 0, "selling all at once costs 7,200 and leaves no risk"
c2, s2 = schedule_cost([3000, 2000, 1000], 0.0002, 0.4)
assert c2 > cost and s2 < sd, "a front-loaded schedule costs more and risks less than equal slices"`,
          why: 'With this function you can score any schedule, not only the optimal ones: a VWAP curve, a schedule a trader typed in, or one an algorithm proposes. The last test is the whole trade-off in one line.',
        },
        {
          kind: 'write',
          id: 'execution-optimal-9',
          ask: 'Write `ac_trades(X, N, lam, sigma, eta)`: return the list of N shares to sell in each period, from the holdings `x_j = X × sinh(κ(N − j)) / sinh(κN)` with `cosh κ = 1 + λσ² / (2η)`. When λ = 0 return equal slices.',
          starter: `import math

def ac_trades(X, N, lam, sigma, eta):
    return [X / N] * N`,
          solution: `import math

def ac_trades(X, N, lam, sigma, eta):
    k = math.acosh(1 + lam * sigma ** 2 / (2 * eta))
    if k == 0:
        return [X / N] * N
    x = [X * math.sinh(k * (N - j)) / math.sinh(k * N) for j in range(N + 1)]
    return [x[j] - x[j + 1] for j in range(N)]`,
          tests: `out = ac_trades(8000, 4, 0.0, 0.5, 1e-4)
assert out is not None, "the function returns nothing yet"
assert all(abs(n - 2000) < 1e-6 for n in out), f"lambda 0 gives equal slices, got {out}"
t = ac_trades(8000, 4, 4e-4, 0.5, 1e-4)
assert len(t) == 4, f"one trade per period, got {len(t)}"
assert abs(sum(t) - 8000) < 1e-6, f"the trades must add up to X, got {sum(t)}"
assert all(t[i] > t[i + 1] for i in range(3)), f"a risk-averse schedule sells less each period, got {t}"
k = math.acosh(1.5)
assert abs(t[0] - (8000 - 8000 * math.sinh(k * 3) / math.sinh(k * 4))) < 1e-6, "the first trade is X minus the holding after period 1"`,
          why: "Trades are the differences between successive holdings. The shape, large then smaller, is what front-loaded means; a VWAP curve, by contrast, follows the market's volume and is large at both ends of the day.",
        },
        {
          kind: 'choice',
          id: 'execution-optimal-10',
          ask: 'You must buy a stock, and your signal says it will rise about 30 bps over the next hour. Compared with the schedule you would use with no forecast, what should the expected drift do to your plan?',
          options: [
            'Nothing: the model only cares about variance',
            'Buy faster, front-loading, because waiting now costs money on average, not only risk',
            'Buy slower, to let the rise happen first',
            'Switch to a VWAP schedule',
          ],
          answer: 1,
          why: 'A drift against you makes every share bought later expected to cost more, which adds to the case for speed exactly as risk aversion does. If the forecast is wrong, you paid extra impact for nothing; that is why forecasts used for execution must be tested like any other signal.',
        },
        {
          kind: 'design',
          id: 'execution-optimal-11',
          ask: "A portfolio manager hands you an order to sell 3% of a stock's average daily volume by the close, starting at 13:00. How do you choose the schedule?",
          checklist: [
            { point: 'Estimate the inputs: daily volatility, expected volume for the afternoon, the spread, an impact coefficient from past orders', why: 'The schedule is only as good as η and σ, which are rough.' },
            { point: 'Ask how urgent the order is and whether the manager expects the price to move', why: 'Risk aversion and alpha decay set how fast to go.' },
            { point: 'Score a few candidates (TWAP, VWAP over the afternoon, front-loaded) on expected cost and standard deviation', why: 'Seeing the frontier makes the choice explicit rather than habitual.' },
            { point: 'Plan for the closing auction as a source of liquidity for part of the order', why: 'Afternoon volume is concentrated near and at the close.' },
            { point: 'Cap the participation rate so you are not most of the volume in any interval', why: 'A high share of volume raises impact and reveals the order.' },
            { point: 'Re-plan as fills come in and if volume or volatility differ from the forecast', why: 'A fixed schedule ignores what the market tells you while you trade.' },
            { point: 'Measure the result against the arrival price afterwards', why: 'Only measured shortfall tells you whether the choice was good on average.' },
          ],
          why: 'Almgren-Chriss gives the shape of the answer: equal slices if you only care about the average, faster if risk or a forecast pushes you. The numbers in it come from your own data and should be treated as rough.',
        },
      ],
    },
    {
      id: 'execution-passive',
      title: 'Passive against aggressive',
      summary: 'Crossing the spread buys certainty; resting saves the spread but fills when you least want it to. Fill probability, adverse selection, markouts, and when to cross.',
      text: [
        'An **aggressive** order crosses the spread: it is sure to fill now and pays the half spread against the mid. A **passive** order rests on your side of the book: if it fills, it saves the half spread and on some venues earns a rebate, but it may not fill at all. Which is cheaper depends on what happens around the fill, not on the quote.',
        '**Fill probability** depends on your place in the queue, how far your price is from the touch, and which way the price moves. Here is the trap: a resting bid fills most often when sellers are pushing the price down through it, that is, shortly before the price is lower. A bid that does not fill is usually one the price ran away from, so you buy later, higher. This is **adverse selection**: your passive fills are selected towards the bad ones.',
        'Put it in one line, per share, against the value of the stock a little after the trade. Aggressive costs h, the half spread. Passive costs `p × (A − h) + (1 − p) × (M + h)`: with probability p you fill at the bid, saving h but losing A to the price falling after the fill; with probability 1 − p you miss, the price has risen by M, and you cross the spread anyway. Passive wins when fills are likely and A and M are small.',
        { code: `import numpy as np

fill = np.array([50.00, 49.98, 50.01])       # passive buys
later = np.array([49.97, 49.97, 50.02])      # mid one minute after each fill
markout_cents = (later - fill) * 100
print(markout_cents.round(1), markout_cents.mean().round(1))   # [-3. -1.  1.] -1.0` },
        'A **markout** measures A directly: for a buy, the mid some time after the fill minus the fill price (the other way round for a sell), averaged over many fills at 1 second, 10 seconds, 1 minute. Negative average markouts on passive fills are adverse selection, measured. Cross when the order is urgent (a signal that decays in seconds, a stop, the close), when the spread is one tick and the queue is long, or when your size is small next to what is shown. Rest when you can wait, when the spread is wide relative to the tick, or when you are near the front of the queue.',
      ],
      rules: [
        'Aggressive: certain fill, pays the half spread. Passive: saves it, may not fill.',
        'Passive fills come when the price is moving through you: adverse selection.',
        'Passive cost ≈ p × (A − h) + (1 − p) × (M + h). Compare with h.',
        'Markout for a buy = later mid − fill price; average it over many fills.',
        'Cross when urgent or when the queue is hopeless; rest when you can wait.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'execution-passive-1',
          ask: 'Half spread h = 2 cents. A resting bid fills with probability 0.5. When it fills, the mid falls 1 cent afterwards on average (A = 1); when it misses, the price has risen 1 cent (M = 1) and you cross. Using p × (A − h) + (1 − p) × (M + h), what is the expected cost of the passive route in cents per share?',
          answer: 1,
          check: '0.5 * (1 - 2) + 0.5 * (1 + 2)',
          why: '0.5 × (−1) + 0.5 × 3 = 1 cent, against 2 cents for crossing now. With mild adverse selection, patience pays.',
        },
        {
          kind: 'number',
          id: 'execution-passive-2',
          ask: 'Same stock, h = 2 cents and p = 0.5, but now informed sellers are active: after a fill the mid falls 2.5 cents (A = 2.5) and after a miss it has risen 2.5 cents (M = 2.5). What is the expected passive cost in cents per share?',
          answer: 2.5,
          check: '0.5 * (2.5 - 2) + 0.5 * (2.5 + 2)',
          why: '0.5 × 0.5 + 0.5 × 4.5 = 2.5 cents, more than the 2 cents of crossing. The quote did not change; the information in the order flow did. That is why passive strategies watch their markouts.',
        },
        {
          kind: 'number',
          id: 'execution-passive-3',
          ask: 'Your passive buys filled at $20.00, $20.01 and $19.99. One minute after each fill the mid was $19.98, $20.00 and $19.99. What is the average one-minute markout in cents? A negative number means the price went against you.',
          answer: -1,
          check: '((19.98 - 20.00) + (20.00 - 20.01) + (19.99 - 19.99)) / 3 * 100',
          why: 'The markouts are −2, −1 and 0 cents, averaging −1. You saved the half spread on each fill, but the stock was worth less soon after you bought it. Three fills prove nothing; hundreds start to.',
        },
        {
          kind: 'choice',
          id: 'execution-passive-4',
          ask: 'Why does a resting bid tend to fill shortly before the price falls?',
          options: [
            'Exchanges fill passive orders at the worst moment on purpose',
            'It fills when sellers trade through the queue at your price, which is the same selling pressure that pushes the price lower',
            'Because market makers can see your order and trade against it',
            'It does not: fills are independent of what the price does next',
          ],
          answer: 1,
          why: 'Your bid is reached only when enough sell orders arrive to eat the queue ahead of you. Those are the moments when sellers dominate, so the price is more likely to tick down next. When buyers dominate, the price lifts away and your bid never trades.',
        },
        {
          kind: 'output',
          id: 'execution-passive-5',
          ask: 'Ten passive buy orders: which filled, and the one-minute markout in cents of those that did. What does this print?',
          code: `import numpy as np

filled = np.array([1, 0, 1, 1, 0, 0, 1, 0, 1, 0], dtype=bool)
markout = np.array([-2, 0, -1, -3, 0, 0, 1, 0, -1, 0])
print(filled.mean(), markout[filled].mean())`,
          answer: '0.5 -1.2',
          why: 'Half the orders filled, and their average markout was (−2 − 1 − 3 + 1 − 1) ÷ 5 = −1.2 cents. Averaging over the unfilled orders too would dilute the number with zeros that are not fills at all.',
        },
        {
          kind: 'bug',
          id: 'execution-passive-6',
          ask: 'This should give markouts in cents, positive when the fill turned out well, for buys (side = 1) and sells (side = −1). A sell at 50.00 followed by a mid of 49.95 shows −5 cents, but that sale went well.',
          code: `import numpy as np

def markouts(fill, side, later):
    fill, side, later = map(np.asarray, (fill, side, later))
    return (later - fill) * 100`,
          line: 5,
          fix: '    return side * (later - fill) * 100',
          why: 'A buy does well when the price rises after it, a sell when it falls. Multiplying by the side puts both on the same scale, so buys and sells can be averaged together. Forgetting the side makes a good seller look like a bad buyer.',
        },
        {
          kind: 'write',
          id: 'execution-passive-7',
          numpy: true,
          ask: 'Write `markout_report(fill, side, later, filled)`: all arguments are arrays of the same length; `side` is 1 for a buy and −1 for a sell; `filled` is True where the order filled. Return `(fill_rate, mean_markout_cents)`, the markout averaged over filled orders only, positive when good. If nothing filled, return `(0.0, 0.0)`.',
          starter: `import numpy as np

def markout_report(fill, side, later, filled):
    pass`,
          solution: `import numpy as np

def markout_report(fill, side, later, filled):
    fill, side, later = (np.asarray(a, dtype=float) for a in (fill, side, later))
    filled = np.asarray(filled, dtype=bool)
    if not filled.any():
        return 0.0, 0.0
    m = side * (later - fill) * 100
    return float(filled.mean()), float(m[filled].mean())`,
          tests: `out = markout_report([10.00, 10.00, 10.05], [1, 1, -1], [9.98, 10.03, 10.02], [True, False, True])
assert out is not None, "the function returns nothing yet"
rate, m = out
assert abs(rate - 2 / 3) < 1e-9, f"two of three filled, got {rate}"
assert abs(m - 0.5) < 1e-9, f"the buy marks -2 cents and the sell +3 cents: average 0.5 over filled orders, got {m}"
assert markout_report([1.0], [1], [2.0], [False]) == (0.0, 0.0), "nothing filled: (0.0, 0.0)"`,
          why: 'Fill rate and markout belong together. A passive tactic with a high fill rate and poor markouts is paying for its fills in adverse selection; one with good markouts and a low fill rate leaves you chasing the rest.',
        },
        {
          kind: 'write',
          id: 'execution-passive-8',
          ask: 'Write `choose_route(h, p, a, m)`: return `"passive"` if the expected passive cost `p × (a − h) + (1 − p) × (m + h)` is below the aggressive cost `h`, else `"aggressive"`.',
          starter: `def choose_route(h, p, a, m):
    return "passive"`,
          solution: `def choose_route(h, p, a, m):
    passive = p * (a - h) + (1 - p) * (m + h)
    return "passive" if passive < h else "aggressive"`,
          tests: `out = choose_route(2, 0.5, 1, 1)
assert out is not None, "the function returns nothing yet"
assert out == "passive", f"1 cent passive against 2 aggressive: passive, got {out}"
assert choose_route(2, 0.5, 2.5, 2.5) == "aggressive", "2.5 cents passive against 2 aggressive: cross"
assert choose_route(1, 0.1, 0, 3) == "aggressive", "a 10% fill chance with a 3-cent chase: cross"
assert choose_route(5, 0.9, 1, 1) == "passive", "a wide spread and likely fills favour resting"`,
          why: 'The hard part is not the formula but the inputs: p, A and M must come from your own past orders in similar conditions. Without them the choice is a guess dressed as arithmetic.',
        },
        {
          kind: 'choice',
          id: 'execution-passive-9',
          ask: 'SPY is quoted one cent wide with about 400,000 shares on the bid. Your signal says buy 300 shares and has historically lost most of its value within a few seconds. Which order fits?',
          options: [
            'Join the bid and wait',
            'A marketable limit at the ask: pay one cent of spread and get the fill now',
            'A bid one cent below the best bid, to save more',
            'Do not trade until the queue is shorter',
          ],
          answer: 1,
          why: 'Behind 400,000 shares a passive bid may never fill, and the signal will be gone before it does. Half a cent a share against the mid is a small price for certainty. A limit at the ask rather than a market order still caps the worst price.',
        },
        {
          kind: 'choice',
          id: 'execution-passive-10',
          ask: 'An option is quoted $2.40 to $2.60 and you want one contract, with no urgency. Which approach fits best?',
          options: [
            'A market order: options always fill at the mid',
            'A limit at the mid, then move a cent or two towards the ask after a set time if unfilled',
            'A limit at $2.40 and wait as long as it takes',
            'A market order, because the spread is too wide to matter',
          ],
          answer: 1,
          why: 'With a wide spread, the half spread is 10 cents a contract, worth working for. Starting at the mid and stepping towards the ask on a timer is a passive start with a rule for when to stop waiting. A bid at $2.40 may never fill if the price moves away.',
        },
        {
          kind: 'number',
          id: 'execution-passive-11',
          ask: 'A venue pays a rebate of $0.0020 per share to orders that rest and charges $0.0030 per share to orders that take. For 1,000 shares, how many dollars of fees separate filling passively from crossing, ignoring the spread?',
          answer: 5,
          check: '(0.0030 + 0.0020) * 1000',
          why: 'Taking costs $3 and resting earns $2, a gap of $5 per 1,000 shares, or half a cent a share. That is half the spread of a one-cent stock, which is why fee schedules shape how fast firms route orders. Fee levels differ by venue and change; check them.',
        },
        {
          kind: 'design',
          id: 'execution-passive-12',
          ask: 'Write the rules an execution algorithm uses to decide, every few seconds, whether a child order should rest on the bid or cross to the ask.',
          checklist: [
            { point: 'Urgency: time left in the schedule and how far behind it the order is', why: 'Falling behind schedule turns timing risk into a forced, expensive catch-up.' },
            { point: 'Spread against tick size and the size of the queue ahead', why: 'A one-tick spread with a long queue rarely rewards waiting.' },
            { point: 'Recent markouts and fill rates for passive fills in this name', why: 'They measure adverse selection instead of guessing it.' },
            { point: 'Short-term signals such as book imbalance or a fast move', why: 'Resting into a move against you is how passive orders get picked off.' },
            { point: 'A timer after which an unfilled passive order is repriced or crosses', why: 'Waiting without a limit turns a cheap order into an unfinished one.' },
            { point: 'A limit price on every aggressive order', why: 'Even a crossing order should cap the worst price it will accept.' },
            { point: 'Logging every decision with the quote, so the rules can be reviewed with TCA', why: 'Rules you cannot measure cannot be improved.' },
          ],
          why: 'There is no permanent answer to passive or aggressive. Good algorithms switch between them as urgency, queue and information change, and they check the switch against measured outcomes.',
        },
      ],
    },
    {
      id: 'execution-mm',
      title: 'Market making',
      summary: 'Quoting both sides for the spread, and the three things that take it back: inventory, informed traders and faster rivals. Skewing quotes, and why it is a speed game.',
      widget: 'execution-mm',
      text: [
        'A **market maker** quotes a bid and an ask at once. If buyers and sellers arrive in equal numbers and the price stands still, it buys at the bid, sells at the ask and keeps the spread on every **round trip**. Three things take that money back: **inventory risk** (the price moves while it holds shares), **adverse selection** (some of the people trading with it know more), and **competition** (rivals quote tighter or faster).',
        'Glosten and Milgrom (1985) showed why a spread exists even with no costs at all. Suppose the stock is worth either a high or a low value, each equally likely, and a share μ of traders know which. A buy is more likely to come from someone who knows the value is high, so the ask must be the **expected value given that a buy arrives**, and the bid the expected value given a sell. The more informed traders, or the more uncertain the value, the wider the spread must be to break even.',
        'Inventory is managed by moving the quotes. A maker that is long wants sellers less and buyers more, so it **skews** both quotes down: a lower bid attracts fewer sells, a lower ask more buys. Avellaneda and Stoikov (2008) wrote this as a **reservation price** `r = mid − q × γ × σ² × (T − t)`: q the inventory, γ risk aversion, σ volatility and T − t the time left. Quotes are centred on r instead of the mid.',
        { code: `def quotes(mid, half, inv, k):
    centre = mid - k * inv          # long inventory pushes both quotes down
    return round(centre - half, 2), round(centre + half, 2)

print(quotes(100.00, 0.02, 500, 0.00004))   # (99.96, 100.0)` },
        'At the top of stocks and futures this is a **speed** business. When the price moves, a quote that has not been updated is **stale**, and faster traders pick it off. Makers survive by cancelling first and by being early in queues, which needs co-location and very fast systems. Exchanges add **maker-taker** fees: resting orders often earn a rebate and taking orders pay, under a US cap of 30 cents per 100 shares for most stocks; a 2024 SEC rule lowers it to 10 cents, with compliance delayed to November 2027 at the time of writing (2026). An individual cannot win that race; a limit order at the mid of an option spread is a small taste of the same trade, with the same adverse selection.',
      ],
      rules: [
        'A round trip at the bid and the ask earns the spread; inventory and information take it back.',
        'Glosten-Milgrom: ask = E[value | buy], bid = E[value | sell]. More informed flow, wider spread.',
        'Long inventory: skew both quotes down. Short: skew them up.',
        'Reservation price r = mid − q × γ × σ² × (T − t).',
        'P&L = spread captured + inventory marked to market.',
        'Stale quotes get picked off: market making in liquid markets is a speed game.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'execution-mm-1',
          ask: 'A stock is worth $102 or $98, each with probability 0.5. A quarter of traders (μ = 0.25) know the value and buy only if it is $102; the rest buy or sell at random, half each way. What ask makes the maker break even, E[value | a buy arrives]? Give dollars.',
          answer: 100.5,
          tol: 0.001,
          check: '((0.25 + 0.375) * 102 + 0.375 * 98) / ((0.25 + 0.375) + 0.375)',
          hint: 'A buy arrives with probability 0.25 + 0.375 = 0.625 when the value is high, and 0.375 when it is low.',
          why: 'Given a buy, the value is high with probability 0.625 / (0.625 + 0.375) = 0.625, so the ask is 0.625 × 102 + 0.375 × 98 = $100.50. The maker charges 50 cents over the unconditional value because buys carry news.',
        },
        {
          kind: 'number',
          id: 'execution-mm-2',
          ask: 'Same stock, $102 or $98. Now half the traders are informed (μ = 0.5). What is the break-even spread, ask minus bid, in dollars?',
          answer: 2,
          check: '((0.75 * 102 + 0.25 * 98)) - ((0.25 * 102 + 0.75 * 98))',
          why: 'The ask is 0.75 × 102 + 0.25 × 98 = $101 and the bid $99, a spread of $2. In this model the spread is μ times the gap between the values: doubling the informed share doubles it.',
        },
        {
          kind: 'number',
          id: 'execution-mm-3',
          ask: 'A maker quotes a one-cent spread and completes 5,000 round trips of 100 shares in a day. How many dollars of spread does it capture, before inventory losses and fees?',
          answer: 5000,
          check: '5000 * 100 * 0.01',
          why: 'Each round trip earns 1 cent on 100 shares, $1, and 5,000 of them make $5,000. Tiny per trade, large in total, and easily wiped out by an inventory that moves against it.',
        },
        {
          kind: 'number',
          id: 'execution-mm-4',
          ask: 'The mid is $100.00. A maker is long 200 shares, uses γ = 0.0001, σ = 0.5 dollars per square-root hour, and has 2 hours left. What is its reservation price r = mid − q × γ × σ² × (T − t)? Give dollars to 2 decimals.',
          answer: 99.99,
          tol: 0.001,
          check: '100 - 200 * 0.0001 * 0.5 ** 2 * 2',
          why: '200 × 0.0001 × 0.25 × 2 = 0.01, so r = $99.99. Its quotes centre a cent below the mid: it is a little keener to sell and a little less keen to buy. The skew shrinks as the time left runs out in this model, and grows with volatility and inventory.',
        },
        {
          kind: 'choice',
          id: 'execution-mm-5',
          ask: 'After a run of sell orders hitting your bid, you are long 500 shares and the mid has not moved. What do you do with your quotes?',
          options: [
            'Leave them centred on the mid; the inventory will balance out',
            'Lower both the bid and the ask, so you buy less and sell more',
            'Raise both quotes, to sell your shares at a higher price',
            'Widen only the ask',
          ],
          answer: 1,
          why: 'Skewing down makes your bid less attractive to sellers and your ask more attractive to buyers, so the inventory is worked off. A run of sells may also mean informed selling, which is another reason not to keep buying at the old bid.',
        },
        {
          kind: 'choice',
          id: 'execution-mm-6',
          ask: 'In the figure, set the skew to 0 and look at the inventory and the readout. Then raise the skew. What changes?',
          options: [
            'Nothing: skew only changes the spread',
            'Inventory swings shrink and the inventory part of the P&L varies less, at the cost of a little spread',
            'Inventory grows, because skewed quotes attract one-sided flow',
            'The maker stops trading',
          ],
          answer: 1,
          why: 'With no skew the inventory wanders like a random walk and the P&L is dominated by where the price happened to go. Skew pulls the inventory back towards zero, so more of the P&L comes from the spread, which is the part the maker is paid for.',
        },
        {
          kind: 'output',
          id: 'execution-mm-7',
          ask: 'A maker’s fills over a short spell: positive size for buys at its bid, negative for sells at its ask. What does this print: the spread captured, the inventory, and the total P&L marked at the last mid?',
          code: `fills = [(+100, 49.99), (-100, 50.01), (+100, 49.98), (+100, 49.97)]
mids = [50.00, 50.00, 49.99, 49.98]
last_mid = 49.95

spread = sum(-q * (p - m) for (q, p), m in zip(fills, mids))
inv = sum(q for q, _ in fills)
cash = sum(-q * p for q, p in fills)
print(round(spread, 2), inv, round(cash + inv * last_mid, 2))`,
          answer: '4.0 200 -3.0',
          why: 'Each fill earned a cent against its mid: $4 of spread. But the maker ended long 200 shares as the mid fell to 49.95, and the total is −$3. The fills looked good one by one; the inventory they left behind was the loss.',
        },
        {
          kind: 'bug',
          id: 'execution-mm-8',
          ask: 'This should skew both quotes against the inventory. When the maker is long, its ask moves down as it should, but its bid moves up, so it keeps buying.',
          code: `def skewed_quotes(mid, half, inv, k):
    bid = mid - half + k * inv
    ask = mid + half - k * inv
    return bid, ask`,
          line: 2,
          fix: '    bid = mid - half - k * inv',
          why: 'Skew shifts the whole quote, both sides in the same direction. Moving the two sides opposite ways only narrows the spread when long, which makes the maker more eager to buy exactly when it holds too much.',
        },
        {
          kind: 'write',
          id: 'execution-mm-9',
          ask: 'Write `quotes(mid, half, inv, k, max_inv)`: return `(bid, ask)` centred on `mid − k × inv` with half-width `half`, each rounded to 2 decimals. If `inv >= max_inv` return `None` for the bid (stop buying); if `inv <= −max_inv` return `None` for the ask.',
          starter: `def quotes(mid, half, inv, k, max_inv):
    return round(mid - half, 2), round(mid + half, 2)`,
          solution: `def quotes(mid, half, inv, k, max_inv):
    centre = mid - k * inv
    bid = round(centre - half, 2)
    ask = round(centre + half, 2)
    if inv >= max_inv:
        bid = None
    if inv <= -max_inv:
        ask = None
    return bid, ask`,
          tests: `out = quotes(100.00, 0.02, 0, 0.0001, 1000)
assert out is not None, "the function returns nothing yet"
assert out == (99.98, 100.02), f"flat: centred on the mid, got {out}"
assert quotes(100.00, 0.02, 500, 0.00004, 1000) == (99.96, 100.0), "long 500 with k 0.00004 moves both quotes down 2 cents"
assert quotes(100.00, 0.02, -500, 0.00004, 1000) == (100.0, 100.04), "short moves both quotes up"
assert quotes(100.00, 0.02, 1000, 0.0, 1000) == (None, 100.02), "at the long limit, stop bidding"
assert quotes(100.00, 0.02, -1000, 0.0, 1000) == (99.98, None), "at the short limit, stop offering"`,
          why: 'Skew handles normal swings; a hard limit handles the day the flow is all one way, which is usually the day someone knows something. Real makers also hedge, for example with a correlated future or ETF.',
        },
        {
          kind: 'choice',
          id: 'execution-mm-10',
          ask: 'News moves a stock’s fair value up 5 cents. Two makers had asks at the old price; one cancels in 20 microseconds, the other in 2 milliseconds. What happens to the slower one?',
          options: [
            'Nothing: both quotes are cancelled before anyone can trade',
            'Its ask is likely bought by a fast trader before it cancels, and it sells 5 cents below fair value',
            'It earns the spread on the new price',
            'The exchange cancels its order for it',
          ],
          answer: 1,
          why: 'In those two milliseconds, faster firms buy every stale ask below the new value. This "picking off" is adverse selection by speed, and it is why liquid-market making is dominated by firms spending heavily on latency.',
        },
        {
          kind: 'number',
          id: 'execution-mm-11',
          ask: 'In an hour a maker captures $45 of spread but ends the hour long 2,000 shares after the mid fell 3 cents from where it built the position. Ignoring fees, what is its P&L for the hour in dollars?',
          answer: -15,
          check: '45 - 2000 * 0.03',
          why: 'The inventory lost 2,000 × $0.03 = $60, more than the $45 of spread. A maker that is long into a fall is the textbook case of adverse selection and inventory risk arriving together.',
        },
        {
          kind: 'design',
          id: 'execution-mm-12',
          ask: 'You are tempted to run a bot that posts bids and offers at the mid of a thin option series through a retail broker’s API, hoping to earn half the spread. What do you weigh before trying it, even on paper?',
          checklist: [
            { point: 'Your latency through a retail broker is far slower than professional makers', why: 'When the underlying moves, your quotes go stale and are picked off first.' },
            { point: 'Fills at the mid are likely to be adversely selected', why: 'Someone taking your quote at the mid often has a reason.' },
            { point: 'Inventory in options carries delta, gamma and vega risk, not only price risk', why: 'A filled option leaves you exposed to the underlying and to volatility until you hedge or exit.' },
            { point: 'Per-contract fees and the spread you pay to get out', why: 'Half a spread earned can be less than the costs of a round trip.' },
            { point: 'Hard limits on inventory and a kill switch', why: 'One-way flow on news can build a large position fast.' },
            { point: "Your broker's rules on order rates, cancels and API use", why: 'Rapid quoting may break terms of service or rate limits.' },
            { point: 'A measured test: markouts and P&L on paper or tiny size before anything else', why: 'Only measured fills show whether the spread survives adverse selection.' },
          ],
          why: 'Market making looks like collecting a toll; in practice it is being paid for absorbing risk and information. Without a speed or information advantage, the toll usually goes to those who have one.',
        },
      ],
    },
    {
      id: 'execution-venues',
      title: 'Venues and routing',
      summary: 'Exchanges, dark pools and wholesalers; the opening and closing auctions; payment for order flow; and how a smart order router chooses where to send an order.',
      text: [
        'A US stock trades in many places at once: more than a dozen **lit exchanges** that display quotes (a new one, the Texas Stock Exchange, began trading in July 2026), **dark pools** (alternative trading systems that show no quotes and usually match at the midpoint), and **wholesalers** that fill retail orders off exchange. In 2025 off-exchange trading was about half of all US share volume for a full year for the first time (about 50.6% by Cboe and Rosenblatt counts), with dark pools near 18% and wholesalers most of the rest. These shares move each year; check current figures.',
        'Rules tie the venues together. The **NBBO** is the best bid and offer across all exchanges. Under Regulation NMS Rule 611, the **order protection rule**, a venue may not trade through a better price displayed elsewhere; at the time of writing (2026) the SEC has proposed rescinding it, and the proposal is not final. Exchanges charge **taker fees** and pay **maker rebates**, or the reverse on "inverted" venues, so the best price after fees is not always the best quoted price.',
        'The day opens and closes with **auctions**: orders are collected, and the exchange picks the single price that lets the most volume trade. The closing auction has grown to roughly 8% to 10% of all US volume on a normal day in 2025, and far more on index rebalance days, because funds are valued at the close.',
        '**Payment for order flow** (PFOF): a retail broker sends its customers’ orders to a wholesaler, which pays the broker for them and fills them, often at a small **price improvement** inside the NBBO. The broker can then charge no commission; the question is whether customers would get better prices elsewhere. Brokers publish quarterly routing reports (SEC Rule 606) showing where orders went and what they were paid. The EU banned PFOF in amendments to MiFIR that took effect in March 2024, with a transition for some member states until mid-2026; in the US it remains legal, and an SEC proposal to force retail orders into auctions was withdrawn in June 2025. Rules here change; check the current state.',
        'A **smart order router** splits an order across venues using displayed price and size, fees and rebates, the chance of a fill, hidden liquidity found by sending small orders into dark pools, and the risk of revealing the order. As an individual you do not choose the route, but you can read your broker’s 606 report and compare your fills with the NBBO at the time.',
      ],
      rules: [
        'Lit exchanges, dark pools and wholesalers all trade the same stock; about half of 2025 US volume was off exchange.',
        'NBBO: the best bid and offer across exchanges. Rule 611 bars trading through it (rescission proposed in 2026).',
        'Compare prices after fees and rebates, not before.',
        'An auction picks the price that lets the most volume trade.',
        'PFOF: wholesalers pay brokers for retail orders and give some price improvement; read the 606 report.',
        'A router weighs price, size, fees, fill chance and information leakage.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'execution-venues-1',
          ask: 'The NBBO is $20.00 bid, $20.02 offered. Your broker routes your market buy of 500 shares to a wholesaler, which fills it at $20.012. How many dollars of price improvement did you get against the NBBO?',
          answer: 4,
          check: '(20.02 - 20.012) * 500',
          why: 'You paid 0.8 of a cent less than the offer on 500 shares: $4. Improvement against the NBBO is real, but the fair comparison is with what the order could have got elsewhere, including at the midpoint, $20.01.',
        },
        {
          kind: 'number',
          id: 'execution-venues-2',
          ask: 'Two exchanges both offer a stock at $30.00. Venue A charges takers $0.0030 a share; venue B charges $0.0010. How many dollars do you save on 1,000 shares by taking on B?',
          answer: 2,
          check: '(0.0030 - 0.0010) * 1000',
          why: 'Same quoted price, $2 apart after fees. Routers rank venues by price after fees, and a sub-penny fee difference matters when the spread itself is one cent.',
        },
        {
          kind: 'output',
          id: 'execution-venues-3',
          ask: 'An opening auction with three buy and three sell limit orders. For each candidate price, the volume that could trade is the smaller of the buy size at or above it and the sell size at or below it. What does this print?',
          code: `buys = [(10.05, 300), (10.03, 200), (10.01, 400)]
sells = [(10.00, 200), (10.02, 300), (10.04, 400)]
prices = sorted({p for p, _ in buys + sells})
vol = []
for p in prices:
    demand = sum(s for b, s in buys if b >= p)
    supply = sum(s for a, s in sells if a <= p)
    vol.append(min(demand, supply))
print(vol)`,
          answer: '[200, 200, 500, 500, 300, 300]',
          why: 'At 10.02 and 10.03, 500 shares can trade on each side; below that sellers are scarce and above it buyers are. Real auctions break a tie like this by the smallest leftover imbalance and then by closeness to a reference price.',
        },
        {
          kind: 'bug',
          id: 'execution-venues-4',
          ask: 'This should count the shares that could trade at an auction price p. It says that at a price of 10.00 every buyer can trade, including one whose limit is 9.95.',
          code: `def matched(buys, sells, p):
    demand = sum(s for b, s in buys if b <= p)
    supply = sum(s for a, s in sells if a <= p)
    return min(demand, supply)`,
          line: 2,
          fix: '    demand = sum(s for b, s in buys if b >= p)',
          why: 'A buyer with limit b will pay any price up to b, so it trades at p only if b ≥ p. A seller with limit a accepts any price from a up, so it trades if a ≤ p. Getting one side backwards counts exactly the wrong orders.',
        },
        {
          kind: 'write',
          id: 'execution-venues-5',
          ask: 'Write `auction_price(buys, sells)`: `buys` and `sells` are lists of `(limit, size)`. Try every limit price that appears; return `(price, volume)` for the price where the most shares can trade, the lowest such price if several tie, or `(None, 0)` if nothing can trade.',
          starter: `def auction_price(buys, sells):
    return None, 0`,
          solution: `def auction_price(buys, sells):
    best = (None, 0)
    for p in sorted({x for x, _ in buys + sells}):
        demand = sum(s for b, s in buys if b >= p)
        supply = sum(s for a, s in sells if a <= p)
        v = min(demand, supply)
        if v > best[1]:
            best = (p, v)
    return best`,
          tests: `out = auction_price([(10.05, 300), (10.03, 200), (10.01, 400)], [(10.00, 200), (10.02, 300), (10.04, 400)])
assert out is not None, "the function returns nothing yet"
assert out == (10.02, 500), f"500 shares can trade at 10.02 and 10.03; take the lower, got {out}"
assert auction_price([(9.90, 100)], [(10.00, 100)]) == (None, 0), "no buyer reaches any seller: nothing trades"
assert auction_price([(20.0, 100)], [(19.0, 300)]) == (19.0, 100), "only 100 can trade; at 19.0 both sides accept"
assert auction_price([(5.0, 50), (5.2, 50)], [(5.1, 80)]) == (5.1, 50), "at 5.1 only the 5.2 buyer remains, 50 shares"`,
          why: 'One price for everyone, chosen to trade the most, is what makes auctions a good place for size: no one walks a book. That is why so much volume, and so many funds valued at the close, go into the closing auction.',
        },
        {
          kind: 'number',
          id: 'execution-venues-6',
          ask: 'A stock usually trades 400,000 shares in its closing auction. You send a market-on-close order for 50,000. What share of the auction is your order? Give a percentage, for example 25%.',
          answer: 0.125,
          check: '50000 / 400000',
          why: '12.5% of the auction is a large footprint. Auctions are deep, but an order that size can move the closing price, and exchanges publish imbalance information before the close that others trade on.',
        },
        {
          kind: 'choice',
          id: 'execution-venues-7',
          ask: 'An institution sends part of an order to a dark pool rather than an exchange. What does it gain and what does it risk?',
          options: [
            'It gains a guaranteed fill at the midpoint and risks nothing',
            'It hides its order and may fill at the midpoint, but the fill is uncertain and fast traders may detect and trade ahead of it',
            'It avoids all fees and regulation',
            'It gets a better price than the NBBO on every order',
          ],
          answer: 1,
          why: 'No displayed order means less to react to, and midpoint fills save the half spread. But a dark order fills only if someone else is there, and probing orders can reveal it. Several dark pool operators have been fined for misleading users about who traded in them.',
        },
        {
          kind: 'choice',
          id: 'execution-venues-8',
          ask: 'Which statement about payment for order flow is right?',
          options: [
            'Wholesalers pay brokers for retail orders because those orders are, on average, less likely to be informed, so filling them is profitable',
            'PFOF means retail orders always get the best possible price',
            'PFOF is banned in the United States',
            'Brokers do not have to disclose PFOF',
          ],
          answer: 0,
          why: 'Retail flow carries less adverse selection than professional flow, which is what makes it worth paying for and worth improving slightly. Whether customers would do better elsewhere is the open question; disclosure comes through 606 reports. In the EU it is banned, with a transition in some member states.',
        },
        {
          kind: 'choice',
          id: 'execution-venues-9',
          ask: 'Exchange X displays an offer at $10.02. Under the order protection rule as it stands at the time of writing, can exchange Y execute your buy at $10.03?',
          options: [
            'Yes, any venue can trade at any price',
            'Not while the better $10.02 offer is displayed and accessible elsewhere; Y must route to X or match it',
            'Yes, if Y charges lower fees',
            'Only in the closing auction',
          ],
          answer: 1,
          why: 'Rule 611 forbids trading through a protected better quote. In June 2026 the SEC proposed rescinding it, arguing that best-execution duties already cover the same ground; whether that happens is not settled. Check the current rules.',
        },
        {
          kind: 'design',
          id: 'execution-venues-10',
          ask: 'You suspect your broker gets you poor fills. How do you check, with the information available to you?',
          checklist: [
            { point: "Read the broker's Rule 606 report: where orders were routed and the payments received", why: 'It shows the incentives behind the routing.' },
            { point: 'Record the NBBO at the time of each of your orders and compare it with your fill', why: 'Price improvement or slippage against the quote is the direct measure.' },
            { point: 'Compare against the midpoint, not only the far side of the quote', why: 'Improvement against the offer can still be worse than what a midpoint order could get.' },
            { point: 'Measure separately for market and limit orders, and by order size and time of day', why: 'Different order types are routed and filled differently.' },
            { point: 'Use enough orders to tell a real difference from noise', why: 'A few fills prove nothing either way.' },
            { point: 'For options, look at per-contract fees and fills against the mid', why: 'Option spreads are wide, so routing quality matters more per trade.' },
          ],
          why: 'You cannot see the route, but you can measure the result. Fills compared with the quote at the time are the evidence, and they are cheap to collect if you log them.',
        },
      ],
    },
    {
      id: 'execution-tca',
      title: 'Transaction cost analysis',
      summary: 'Arrival, VWAP and close benchmarks; splitting shortfall into delay, execution and opportunity cost; and measuring your own slippage well enough to trust.',
      text: [
        '**Transaction cost analysis** (TCA) measures, after the fact and over many orders, what execution cost against a **benchmark**. The **decision price** is the mid when the idea was formed; the **arrival price** is the mid when the order reached the market; **interval VWAP** is the average price of all trading while you worked the order; the **close** is the closing price. Each answers a different question, and each can be gamed.',
        '**Implementation shortfall** (Perold, 1988) compares the real trade with a paper trade that filled everything at the decision price. For a buy it splits into **delay cost** (decision to arrival, on the shares filled), **execution cost** (arrival to average fill), **opportunity cost** (the move on shares never filled, measured to a later price such as the close) and **fees**. Costs are positive numbers; for a sell, the signs of the price differences flip.',
        { code: `def slippage_bps(side, arrival, avg_fill):
    # positive = cost; side is 1 for a buy, -1 for a sell
    return side * (avg_fill - arrival) / arrival * 10_000

print(round(slippage_bps(1, 50.00, 50.03), 1), round(slippage_bps(-1, 50.00, 50.03), 1))   # 6.0 -6.0` },
        'VWAP is an easy benchmark to meet and a poor one to judge by. If your order is a large part of the day’s volume, your own trades are much of the VWAP, so you will be close to it whatever you did, and on a day that trends against you, matching VWAP can still mean a large shortfall against arrival. The close suits funds that are valued at the close; arrival price suits a trader who wants to know what the decision cost.',
        'To measure your own slippage, log for every order the decision time and mid, the arrival mid, every fill with its time and fees, and the order type. Compute signed bps per order, then the mean, its standard error and t statistic, and split by size, time of day, order type and urgency. Then compare with the costs your backtest assumed: if live slippage is twice the assumption, the backtest edge shrinks by that difference on every trade, and a thin edge can vanish.',
      ],
      rules: [
        'Benchmarks: decision, arrival, interval VWAP, close. Name the one you use.',
        'Slippage in bps = side × (avg fill − arrival) ÷ arrival × 10,000; positive is a cost.',
        'Shortfall = delay + execution + opportunity + fees.',
        'A big order nearly matches VWAP by construction; do not judge it by VWAP alone.',
        'Average slippage needs a standard error; split it by size, time and order type.',
        'Feed measured costs back into the backtest.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'execution-tca-1',
          ask: 'A buy order arrived when the mid was $25.00 and its average fill was $25.03. What is the slippage against arrival in basis points?',
          answer: 12,
          check: '(25.03 - 25.00) / 25.00 * 10000',
          why: '3 cents on $25 is 0.12%, or 12 bps. Basis points let you compare orders in stocks at very different prices.',
        },
        {
          kind: 'number',
          id: 'execution-tca-2',
          ask: 'A sell order arrived at a mid of $80.00 and filled on average at $79.92. What is the cost against arrival in basis points (positive means a cost)?',
          answer: 10,
          check: '-1 * (79.92 - 80.00) / 80.00 * 10000',
          why: 'Selling 8 cents below the arrival mid on $80 is 10 bps of cost. For a sell, a lower fill is worse, so the sign of the difference flips.',
        },
        {
          kind: 'number',
          id: 'execution-tca-3',
          ask: 'You decide to buy 10,000 shares at a mid of $50.00. By the time the order arrives the mid is $50.05. You fill 8,000 shares at an average of $50.10 and give up on the rest; the stock closes at $50.30. Fees are $0.002 a share on what filled. Against a paper trade of all 10,000 at $50.00 valued at the close, what is the total implementation shortfall in dollars?',
          answer: 1416,
          check: '10000 * (50.30 - 50.00) - (8000 * (50.30 - 50.10) - 8000 * 0.002)',
          why: 'The paper trade made 10,000 × $0.30 = $3,000. The real one made 8,000 × $0.20 − $16 = $1,584. The gap is $1,416: delay $400, execution $400, opportunity $600 and fees $16.',
        },
        {
          kind: 'number',
          id: 'execution-tca-4',
          ask: 'Same order: 2,000 of the 10,000 shares never filled, the decision mid was $50.00 and the close $50.30. What is the opportunity cost in dollars?',
          answer: 600,
          check: '2000 * (50.30 - 50.00)',
          why: '2,000 × $0.30 = $600, the largest single part of the shortfall. Cancelling an unfilled order looks free in a report that measures only fills; opportunity cost puts the missed shares back in.',
        },
        {
          kind: 'choice',
          id: 'execution-tca-5',
          ask: 'Your algorithm bought 40% of a stock’s volume today and beat the day’s VWAP by 1 bp. The stock rose 2% from arrival to the close while you bought. What does the VWAP result tell you?',
          options: [
            'Execution was excellent: you beat the benchmark',
            'Little: with 40% of the volume your trades largely set the VWAP, and your own buying may have pushed the price up',
            'The algorithm should trade 80% of the volume next time',
            'VWAP is the only fair benchmark for large orders',
          ],
          answer: 1,
          why: 'Being close to an average that you make up much of is almost automatic. Against arrival the order cost a lot, and some of the 2% rise may be your own impact. Judge large orders against arrival, with VWAP as a secondary view.',
        },
        {
          kind: 'choice',
          id: 'execution-tca-6',
          ask: 'You group a year of your orders by size and plot the average slippage against arrival. What does this chart suggest?',
          chart: {
            title: 'Average slippage by order size',
            x: 'order size as % of daily volume (0.5% to 8%)',
            y: 'slippage (bps)',
            series: [{ name: 'slippage', points: [3, 4.5, 6.5, 9, 13], color: 'accent' }],
          },
          options: [
            'Slippage is random and unrelated to size',
            'Cost rises with size but more slowly than in proportion, as the square-root rule suggests; size and pre-trade estimates should use it',
            'Large orders are cheaper per share',
            'Cost rises exactly in proportion to size',
          ],
          answer: 1,
          why: 'Size goes up sixteenfold from the first group to the last while cost goes up about fourfold, close to √16 = 4. Your own measured curve is the best impact model you will have; use it in sizing and in the backtest.',
        },
        {
          kind: 'output',
          id: 'execution-tca-7',
          ask: 'Slippage of five buy orders in bps, its mean and t statistic. What does this print?',
          code: `import numpy as np

arrival = np.array([50.00, 20.00, 100.00, 40.00, 25.00])
fill = np.array([50.02, 20.01, 100.03, 39.99, 25.02])
bps = (fill - arrival) / arrival * 10_000
t = bps.mean() / (bps.std(ddof=1) / np.sqrt(len(bps)))
print(bps.round(1).tolist(), round(bps.mean(), 1), round(t, 1))`,
          answer: '[4.0, 5.0, 3.0, -2.5, 8.0] 3.5 2.0',
          why: 'Mean 3.5 bps with a t of 2.0: a cost that is probably real, but measured very roughly on five orders. Each order counts once in this average whatever its size; a dollar-weighted average answers a different question.',
        },
        {
          kind: 'bug',
          id: 'execution-tca-8',
          ask: 'This should give slippage in bps, positive for a cost, for buys (side = 1) and sells (side = −1). It reports a sell filled below arrival as a saving.',
          code: `def slippage_bps(side, arrival, avg_fill):
    diff = avg_fill - arrival
    return diff / arrival * 10_000`,
          line: 3,
          fix: '    return side * diff / arrival * 10_000',
          why: 'A sell that fills below arrival received less than the price when it was sent: a cost. Multiplying by the side makes every cost positive, so buys and sells can be averaged in one report.',
        },
        {
          kind: 'write',
          id: 'execution-tca-9',
          ask: 'Write `shortfall_parts(side, qty, decision, arrival, filled, avg_fill, end_price, fee_per_share)`. Return a dict with `delay`, `execution`, `opportunity`, `fees` and `total` in dollars, costs positive: delay = side × (arrival − decision) × filled; execution = side × (avg_fill − arrival) × filled; opportunity = side × (end_price − decision) × (qty − filled); fees = fee_per_share × filled.',
          starter: `def shortfall_parts(side, qty, decision, arrival, filled, avg_fill, end_price, fee_per_share):
    return {}`,
          solution: `def shortfall_parts(side, qty, decision, arrival, filled, avg_fill, end_price, fee_per_share):
    parts = {
        "delay": side * (arrival - decision) * filled,
        "execution": side * (avg_fill - arrival) * filled,
        "opportunity": side * (end_price - decision) * (qty - filled),
        "fees": fee_per_share * filled,
    }
    parts["total"] = sum(parts.values())
    return parts`,
          tests: `out = shortfall_parts(1, 10_000, 50.00, 50.05, 8_000, 50.10, 50.30, 0.002)
assert out is not None and out != {}, "the function returns nothing yet"
want = {"delay": 400, "execution": 400, "opportunity": 600, "fees": 16, "total": 1416}
for k, v in want.items():
    assert abs(out.get(k, 1e9) - v) < 1e-6, f"{k} should be {v}, got {out.get(k)}"
s = shortfall_parts(-1, 1_000, 30.00, 29.98, 1_000, 29.95, 29.00, 0.0)
assert abs(s["delay"] - 20) < 1e-6 and abs(s["execution"] - 30) < 1e-6, "for a sell, a falling price is a cost: delay 20, execution 30"
assert abs(s["opportunity"]) < 1e-9 and abs(s["total"] - 50) < 1e-6, "everything filled: no opportunity cost, total 50"`,
          why: 'Each part points at a different fix. Delay cost is about how fast decisions reach the market; execution cost about the algorithm; opportunity cost about giving up too soon or limiting too tightly.',
        },
        {
          kind: 'write',
          id: 'execution-tca-10',
          numpy: true,
          ask: 'Write `slippage_stats(side, arrival, fill)`: arrays of the same length. Return `(mean_bps, t)`: the mean of the signed slippage in bps (positive = cost) and its t statistic, mean ÷ (sample standard deviation with `ddof=1` ÷ √n).',
          starter: `import numpy as np

def slippage_stats(side, arrival, fill):
    pass`,
          solution: `import numpy as np

def slippage_stats(side, arrival, fill):
    side, arrival, fill = (np.asarray(a, dtype=float) for a in (side, arrival, fill))
    bps = side * (fill - arrival) / arrival * 10_000
    return float(bps.mean()), float(bps.mean() / (bps.std(ddof=1) / np.sqrt(len(bps))))`,
          tests: `out = slippage_stats([1, 1, 1, 1, 1], [50, 20, 100, 40, 25], [50.02, 20.01, 100.03, 39.99, 25.02])
assert out is not None, "the function returns nothing yet"
m, t = out
assert abs(m - 3.5) < 1e-9, f"mean slippage is 3.5 bps, got {m}"
assert abs(t - 2.0) < 0.05, f"t is about 2.0, got {t}"
m2, _ = slippage_stats([1, -1], [10.0, 10.0], [10.01, 9.99])
assert abs(m2 - 10) < 1e-9, "a buy 1 cent up and a sell 1 cent down are both 10 bps of cost"`,
          why: 'An average without its uncertainty invites over-reading. Slippage is noisy order to order, so a few dozen orders give a rough number and a few hundred a usable one.',
        },
        {
          kind: 'number',
          id: 'execution-tca-11',
          ask: 'A backtest shows a gross edge of 10 bps per round trip and assumed costs of 2 bps per side. Live, your measured slippage plus fees is 6 bps per side. What is the net edge per round trip live, in bps?',
          answer: -2,
          check: '10 - 2 * 6',
          why: 'The backtest said 10 − 4 = 6 bps net; live it is 10 − 12 = −2. Nothing about the signal changed, only the cost. This is why TCA belongs in strategy research and not only in a compliance report.',
        },
        {
          kind: 'design',
          id: 'execution-tca-12',
          ask: 'You trade a few times a day through a broker API. Design the TCA you will run on your own orders.',
          checklist: [
            { point: 'Log decision time and mid, send time, arrival mid, each fill with time and fee, order type and limit', why: 'Without these records no benchmark can be computed later.' },
            { point: 'Compute signed bps against arrival per order, and the decision-to-arrival delay separately', why: 'Delay and execution have different causes and different fixes.' },
            { point: 'Count unfilled and cancelled orders with their opportunity cost', why: 'Ignoring them makes passive tactics look cheaper than they are.' },
            { point: 'Report the mean with a standard error, and split by order type, size, time of day and instrument', why: 'Averages hide where the cost comes from and how sure you can be.' },
            { point: 'Add markouts after fills at a few horizons', why: 'They show adverse selection that arrival slippage misses.' },
            { point: 'Compare measured costs with the backtest assumptions, and update the backtest', why: 'The edge you can trade is the edge after the costs you actually pay.' },
          ],
          why: 'Your own TCA is the cheapest research you will ever do: the data comes free with every trade, as long as you record it at the time.',
        },
      ],
    },
    {
      id: 'execution-lab',
      title: 'Lab: a matching engine and two execution schedules',
      summary: 'Build an order book with price-time priority, then buy a parent order by TWAP and by a front-loaded schedule under a simple impact model and compare their shortfall.',
      text: [
        'This lab builds the two halves of execution. First a small **matching engine**: an order book that keeps every order in a queue at its price and fills incoming orders by price-time priority. Then an **execution simulator**: a parent buy order cut into child orders on a schedule, filled under a simple impact model, and scored by implementation shortfall against the arrival price.',
        'The impact model is the one from the optimal execution lesson, made concrete. Each period the mid first moves by a random amount (standard deviation σ, made-up and seeded); then you buy n shares at the mid plus `η × n` (temporary impact); then the mid rises by `γ × n` (permanent impact) and stays there. The shortfall is `Σ n × (fill − arrival)`.',
        'You will compare a TWAP schedule with a front-loaded one over many seeded paths. The numbers are made up and the model is deliberately simple: real impact is closer to square-root, fills are not certain, and other traders react. The lab shows the shape of the trade-off, not a forecast of your costs. Each step repeats the helpers it needs, so every step runs on its own.',
      ],
      rules: [
        'Keep every order, in time order, at its price; fill best price first, oldest first.',
        'Trades happen at the resting price; empty levels are removed.',
        'Schedules must add up to the parent order exactly.',
        'Score every schedule against the arrival price, with the same random paths.',
        'Front-loading trades expected cost for lower variance; the model sets the size of each.',
      ],
      questions: [
        {
          kind: 'write',
          id: 'execution-lab-1',
          ask: 'Step 1: the book. Complete `OrderBook`: `add(oid, side, price, size)` appends `[oid, size]` to the queue (a `deque`) at that price in `self.bids` (side `"buy"`) or `self.asks` (side `"sell"`), creating the level if needed. `best_bid()` and `best_ask()` return the best price or `None` if that side is empty. No matching yet.',
          starter: `from collections import deque

class OrderBook:
    def __init__(self):
        self.bids = {}   # price -> deque of [oid, size]
        self.asks = {}

    def add(self, oid, side, price, size):
        pass

    def best_bid(self):
        pass

    def best_ask(self):
        pass`,
          solution: `from collections import deque

class OrderBook:
    def __init__(self):
        self.bids = {}
        self.asks = {}

    def add(self, oid, side, price, size):
        levels = self.bids if side == "buy" else self.asks
        levels.setdefault(price, deque()).append([oid, size])

    def best_bid(self):
        return max(self.bids) if self.bids else None

    def best_ask(self):
        return min(self.asks) if self.asks else None`,
          tests: `b = OrderBook()
assert b.best_bid() is None and b.best_ask() is None, "an empty book has no best prices"
b.add("A", "buy", 10.00, 100)
b.add("B", "buy", 10.01, 200)
b.add("C", "buy", 10.00, 300)
b.add("D", "sell", 10.03, 50)
b.add("E", "sell", 10.02, 70)
assert b.best_bid() == 10.01, f"the best bid is the highest, got {b.best_bid()}"
assert b.best_ask() == 10.02, f"the best ask is the lowest, got {b.best_ask()}"
assert [o[0] for o in b.bids[10.00]] == ["A", "C"], "orders at one price queue in arrival order"
assert list(b.bids[10.00][1]) == ["C", 300], "each queued order is [oid, size]"`,
          why: 'A dict of queues is enough to learn on. Real engines keep prices in a sorted structure so the best price is found without scanning, and a map from order id to its place so cancels are instant.',
        },
        {
          kind: 'write',
          id: 'execution-lab-2',
          ask: 'Step 2: matching. Add `market(side, size)`: a `"buy"` takes from the asks, lowest price first and oldest first; a `"sell"` takes from the bids, highest first. Return a list of fills `(oid, price, shares)`. Partly filled orders keep their place; remove orders and levels that are used up. Stop when filled or the book side is empty.',
          starter: `from collections import deque

class OrderBook:
    def __init__(self):
        self.bids = {}
        self.asks = {}

    def add(self, oid, side, price, size):
        levels = self.bids if side == "buy" else self.asks
        levels.setdefault(price, deque()).append([oid, size])

    def best_bid(self):
        return max(self.bids) if self.bids else None

    def best_ask(self):
        return min(self.asks) if self.asks else None

    def market(self, side, size):
        fills = []
        return fills`,
          solution: `from collections import deque

class OrderBook:
    def __init__(self):
        self.bids = {}
        self.asks = {}

    def add(self, oid, side, price, size):
        levels = self.bids if side == "buy" else self.asks
        levels.setdefault(price, deque()).append([oid, size])

    def best_bid(self):
        return max(self.bids) if self.bids else None

    def best_ask(self):
        return min(self.asks) if self.asks else None

    def market(self, side, size):
        fills = []
        levels = self.asks if side == "buy" else self.bids
        while size > 0 and levels:
            price = min(levels) if side == "buy" else max(levels)
            q = levels[price]
            while size > 0 and q:
                oid, rest = q[0]
                take = min(size, rest)
                fills.append((oid, price, take))
                size -= take
                if take == rest:
                    q.popleft()
                else:
                    q[0][1] = rest - take
            if not q:
                del levels[price]
        return fills`,
          tests: `b = OrderBook()
for oid, px, sz in [("A", 10.02, 100), ("B", 10.02, 200), ("C", 10.03, 300)]:
    b.add(oid, "sell", px, sz)
b.add("X", "buy", 10.00, 500)
out = b.market("buy", 350)
assert out is not None and out != [], "the function returns no fills yet"
assert out == [("A", 10.02, 100), ("B", 10.02, 200), ("C", 10.03, 50)], f"A, then B, then 50 of C, got {out}"
assert 10.02 not in b.asks, "an emptied level is removed"
assert list(b.asks[10.03][0]) == ["C", 250], "C keeps its place with 250 left"
assert b.market("sell", 600) == [("X", 10.00, 500)], "a sell takes the bids; it stops when the side is empty"
assert b.best_bid() is None, "the bid side is now empty"`,
          why: 'Two loops: across price levels, best first, and within a level, oldest first. The fill price is always the resting price, which is why a market order can never do better than the book and often does worse.',
        },
        {
          kind: 'bug',
          id: 'execution-lab-3',
          ask: 'Step 3: limit orders. This matches an incoming buy limit against the asks before resting the rest. A buy at 10.05 refuses an ask at 10.02, while a buy at 10.00 trades with an ask at 10.05.',
          code: `def match_buy_limit(asks, price, size):
    # asks: dict of price -> list of [oid, size], oldest first
    fills = []
    while size > 0 and asks:
        best = min(asks)
        if best < price:
            break
        q = asks[best]
        oid, rest = q[0]
        take = min(size, rest)
        fills.append((oid, best, take))
        size -= take
        if take == rest:
            q.pop(0)
        else:
            q[0][1] = rest - take
        if not q:
            del asks[best]
    return fills, size`,
          line: 6,
          fix: '        if best > price:',
          why: 'A buy limit trades with any ask at or below its limit and must stop at the first ask above it. The reversed test stops when the book offers a better price and trades through the limit when it does not, which is the one thing a limit order exists to prevent.',
        },
        {
          kind: 'write',
          id: 'execution-lab-4',
          ask: 'Step 4: two schedules in whole shares. `twap(X, N)`: N slices as equal as possible, the first `X % N` slices one share larger. `front_loaded(X, N, kappa)`: round the holdings `x_j = X × sinh(κ(N − j)) / sinh(κN)` for j = 0..N to whole shares and return the differences. Both must add up to X exactly.',
          starter: `import math

def twap(X, N):
    return [X // N] * N

def front_loaded(X, N, kappa):
    return twap(X, N)`,
          solution: `import math

def twap(X, N):
    base, extra = divmod(X, N)
    return [base + (1 if k < extra else 0) for k in range(N)]

def front_loaded(X, N, kappa):
    x = [round(X * math.sinh(kappa * (N - j)) / math.sinh(kappa * N)) for j in range(N + 1)]
    return [x[j] - x[j + 1] for j in range(N)]`,
          tests: `out = twap(1000, 3)
assert out is not None, "the function returns nothing yet"
assert out == [334, 333, 333], f"1,000 in 3: one slice of 334 then two of 333, got {out}"
assert sum(twap(6001, 4)) == 6001, "slices must add up to the parent order"
f = front_loaded(1000, 3, 1.0)
assert f == [638, 245, 117], f"rounded sinh holdings give [638, 245, 117], got {f}"
assert sum(front_loaded(6000, 4, 0.8)) == 6000, "front-loaded slices must add up exactly too"
assert front_loaded(6000, 4, 0.8)[0] > 1500, "front-loaded: the first slice is bigger than a TWAP slice"`,
          why: 'Rounding the holdings rather than each trade guarantees the trades add up: the differences telescope to X − 0. Rounding each slice separately can leave a share or two over or short, which a live system must never do.',
        },
        {
          kind: 'write',
          id: 'execution-lab-5',
          numpy: true,
          ask: 'Step 5: the simulator. Write `shortfall(trades, arrival, sigma, eta, gamma, seed)` for a buy: draw `z = rng.normal(0, sigma, len(trades))` with `rng = np.random.default_rng(seed)`. For each period k: `mid += z[k]`, buy `n = trades[k]` at `mid + eta × n`, add `n × (fill − arrival)` to the shortfall, then `mid += gamma × n`. Start with `mid = arrival`. Return the shortfall in dollars.',
          starter: `import numpy as np

def shortfall(trades, arrival, sigma, eta, gamma, seed):
    rng = np.random.default_rng(seed)
    z = rng.normal(0, sigma, len(trades))
    return 0.0`,
          solution: `import numpy as np

def shortfall(trades, arrival, sigma, eta, gamma, seed):
    rng = np.random.default_rng(seed)
    z = rng.normal(0, sigma, len(trades))
    mid = arrival
    cost = 0.0
    for n, e in zip(trades, z):
        mid += e
        fill = mid + eta * n
        cost += n * (fill - arrival)
        mid += gamma * n
    return float(cost)`,
          tests: `out = shortfall([1500] * 4, 50.0, 0.0, 1e-5, 2e-6, 0)
assert out is not None, "the function returns nothing yet"
assert abs(out - 117.0) < 1e-6, f"with no noise TWAP costs 22.5 + 27 + 31.5 + 36 = 117, got {out}"
assert abs(shortfall([6000], 50.0, 0.0, 1e-5, 2e-6, 0) - 360.0) < 1e-6, "all at once: 6,000 x 0.06 = 360"
a = shortfall([1500] * 4, 50.0, 0.05, 1e-5, 2e-6, 7)
assert a == shortfall([1500] * 4, 50.0, 0.05, 1e-5, 2e-6, 7), "the same seed must give the same result"
assert abs(shortfall([1500] * 4, 50.0, 0.05, 0.0, 0.0, 3) - sum(1500 * np.cumsum(np.random.default_rng(3).normal(0, 0.05, 4)))) < 1e-6, "with no impact, the shortfall is the noise on what you buy"`,
          why: 'The order of events matters: the market moves, you trade at the moved price plus your temporary impact, and only then does your permanent impact shift the price for the next slice. Swap them and every schedule looks cheaper or dearer than it is.',
        },
        {
          kind: 'output',
          id: 'execution-lab-6',
          ask: 'Step 6: no noise. With σ = 0 only impact is left. What does this print for TWAP and for the front-loaded schedule of 6,000 shares in 4 periods?',
          code: `import math

def front_loaded(X, N, kappa):
    x = [round(X * math.sinh(kappa * (N - j)) / math.sinh(kappa * N)) for j in range(N + 1)]
    return [x[j] - x[j + 1] for j in range(N)]

def cost(trades, eta=1e-5, gamma=2e-6):
    mid, total = 0.0, 0.0
    for n in trades:
        total += n * (mid + eta * n)
        mid += gamma * n
    return round(total, 2)

fl = front_loaded(6000, 4, 0.8)
print(fl, cost([1500] * 4), cost(fl))`,
          answer: '[3322, 1514, 729, 435] 117.0 162.44',
          why: 'With nothing to fear from waiting, equal slices are cheapest: $117 against $162.44. The front-loaded schedule pays about $45 more in impact for the chance to finish early. Whether that is worth it depends on the risk, which this run leaves out.',
        },
        {
          kind: 'write',
          id: 'execution-lab-7',
          numpy: true,
          ask: 'Step 7: many paths. Write `simulate(trades, n_paths, arrival, sigma, eta, gamma)`: run `shortfall` with seeds 0 to n_paths − 1 and return `(mean, sd)` of the results, the standard deviation with `ddof=1`.',
          starter: `import numpy as np

def shortfall(trades, arrival, sigma, eta, gamma, seed):
    rng = np.random.default_rng(seed)
    z = rng.normal(0, sigma, len(trades))
    mid = arrival
    cost = 0.0
    for n, e in zip(trades, z):
        mid += e
        cost += n * (mid + eta * n - arrival)
        mid += gamma * n
    return float(cost)

def simulate(trades, n_paths, arrival, sigma, eta, gamma):
    pass`,
          solution: `import numpy as np

def shortfall(trades, arrival, sigma, eta, gamma, seed):
    rng = np.random.default_rng(seed)
    z = rng.normal(0, sigma, len(trades))
    mid = arrival
    cost = 0.0
    for n, e in zip(trades, z):
        mid += e
        cost += n * (mid + eta * n - arrival)
        mid += gamma * n
    return float(cost)

def simulate(trades, n_paths, arrival, sigma, eta, gamma):
    c = np.array([shortfall(trades, arrival, sigma, eta, gamma, s) for s in range(n_paths)])
    return float(c.mean()), float(c.std(ddof=1))`,
          tests: `out = simulate([1500] * 4, 50, 50.0, 0.0, 1e-5, 2e-6)
assert out is not None, "the function returns nothing yet"
m, s = out
assert abs(m - 117.0) < 1e-6 and abs(s) < 1e-9, f"no noise: every path costs 117 with sd 0, got {out}"
c = np.array([shortfall([1500] * 4, 50.0, 0.05, 1e-5, 2e-6, k) for k in range(300)])
m2, s2 = simulate([1500] * 4, 300, 50.0, 0.05, 1e-5, 2e-6)
assert abs(m2 - c.mean()) < 1e-9, "use seeds 0 to n_paths - 1"
assert abs(s2 - c.std(ddof=1)) < 1e-9, "the standard deviation uses ddof=1"`,
          why: 'Using the same seeds for every schedule means each one faces the same market paths. The difference between schedules is then the schedule, not the luck of the draw, which makes small differences visible with fewer paths.',
        },
        {
          kind: 'output',
          id: 'execution-lab-8',
          ask: 'Step 8: the trade-off. 2,000 seeded paths with σ = $0.05 per period. What does this print for TWAP and then the front-loaded schedule (mean and standard deviation of the shortfall, in dollars)?',
          code: `import numpy as np

def shortfall(trades, arrival, sigma, eta, gamma, seed):
    rng = np.random.default_rng(seed)
    z = rng.normal(0, sigma, len(trades))
    mid, cost = arrival, 0.0
    for n, e in zip(trades, z):
        mid += e
        cost += n * (mid + eta * n - arrival)
        mid += gamma * n
    return cost

for trades in ([1500] * 4, [3322, 1514, 729, 435]):
    c = np.array([shortfall(trades, 50.0, 0.05, 1e-5, 2e-6, s) for s in range(2000)])
    print(round(c.mean()), round(c.std(ddof=1)))`,
          answer: `124 414
169 335`,
          why: 'TWAP is cheaper on average, about $124 against $169 (its noise-free cost is $117; the gap is sampling noise), but its standard deviation is $414 against $335. The front-loaded schedule pays about $45 of expected cost to cut the spread of outcomes by about a fifth. Neither is "right": the choice is the price you put on risk.',
        },
        {
          kind: 'design',
          id: 'execution-lab-9',
          ask: 'Step 9: reading the result. Before trusting this comparison for a real order, what does the toy model leave out, and how would you close each gap?',
          checklist: [
            { point: 'Impact is linear here; measured impact is closer to square-root in size', why: 'The relative cost of big slices is overstated, which favours TWAP more than reality might.' },
            { point: 'Every slice fills in full; real child orders can miss or partly fill', why: 'Unfilled shares carry opportunity cost and push work into later periods.' },
            { point: 'The spread and fees are missing', why: 'They add to every slice and change how many slices are worth sending.' },
            { point: 'Temporary impact vanishes instantly; in reality it decays over time', why: 'Slices close together pay for each other’s impact, so pace matters within a period.' },
            { point: 'η, γ and σ are made up; estimate them from your own fills and TCA', why: 'The schedule is only as good as these inputs.' },
            { point: 'Other traders react to your pattern, and volume varies through the day', why: 'A predictable schedule can be detected and traded against; VWAP-style shaping follows real liquidity.' },
            { point: 'Check the engine by hand on tiny cases, as the tests did', why: 'A simulator with an accounting bug ranks schedules wrongly with total confidence.' },
          ],
          why: 'A simple model that you understand is the right place to start. It shows the direction of the trade-off; how far to lean is a question for data on your own orders.',
        },
      ],
    },
  ],
}
