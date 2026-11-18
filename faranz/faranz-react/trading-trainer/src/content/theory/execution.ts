import type { Block } from '../../types'

/** The full theory for each lesson of the execution module, keyed by lesson id. */
export const executionTheory: Record<string, Block[]> = {
  'execution-book': [
    { h: 'What the exchange actually stores' },
    'In the markets module the **order book** was a list of prices with a total size at each: 300 shares bid at $40.00, 500 at $39.99. That picture is what most trading screens show, and it hides the thing that decides who trades. An exchange does not store "300 shares at $40.00". It stores each **resting order** separately: an order id, a side (buy or sell), a price, a size, and the moment it arrived. Ten different traders can each have an order at $40.00, and the exchange knows exactly which came first.',
    'A **matching engine** is the program that keeps this book and decides, for every incoming order, what trades with what. To use the market well, and to simulate it honestly in a backtest, you need to know its rules.',

    { h: 'Price-time priority' },
    { sub: 'Better price first' },
    'Most stock and option venues use **price-time priority**. The first rule is price: a buyer bidding $40.01 is served before any buyer at $40.00, because a seller would rather get more. On the sell side, a lower offer goes first.',
    { sub: 'Earlier order first' },
    'The second rule breaks ties at the same price by time. Orders at one price wait in a **queue**, and the oldest is served first: **first in, first out**, or **FIFO**. Your place in that line is your **queue position**, and it is measured by the number of shares ahead of you, not the number of orders.',
    { sub: 'What changes your place' },
    'Cancelling an order and sending a new one puts you at the back. On most venues, changing the price or raising the size counts as a new order and also sends you to the back, while lowering the size keeps your place. Venues publish these rules; check the one you trade on.',

    { h: 'How an incoming order is matched' },
    'An incoming order that can trade straight away is called **marketable**: a buy priced at or above the best ask, or a sell at or below the best bid. A market order is always marketable. The engine fills it against the best price level first, oldest order first, then moves to the next level if the order is bigger than that level. Each trade happens **at the resting order\'s price**. A buy limit at $40.05 that meets an ask at $40.02 trades at $40.02: the limit is the worst price you accept, not the price you pay.',
    'Whatever is left of a marketable limit order after it reaches its limit stays in the book at its own price, at the back of that queue. Whatever is left of a market order keeps walking until it is filled or the book is empty.',
    {
      code: `from collections import deque

queue = deque([["A", 300], ["B", 200], ["C", 400]])   # one price level, oldest first
sell = 450
while sell > 0 and queue:
    oid, size = queue[0]
    take = min(sell, size)
    print(oid, take)
    sell -= take
    if take == size:
        queue.popleft()
    else:
        queue[0][1] -= take`,
      out: `A 300
B 150`,
    },
    'A `deque` is a list that is quick to change at both ends. `queue[0]` is the oldest order; `popleft()` removes it once it is used up. B was only partly filled, so it stays at the front with 50 shares and keeps its place.',

    { h: 'Queue position in practice' },
    'Suppose you rest a bid for 100 shares at $40.00 behind 700 shares. You fill only after those 700 shares are gone. They can go two ways: market sells trade against them, or their owners cancel. Orders that arrive at $40.00 after yours join behind you and do not matter to you at all.',
    'This has two consequences. First, a trade printed at your price on the tape does not mean you traded. If 300 shares sold at $40.00 while 700 were ahead of you, you are now 400 from the front and still unfilled. Second, cancels ahead of you help you as much as trades do, so your fill time depends on other people changing their minds, which you cannot see.',
    'A small worked example. The queue at $40.00 is X 400, you 100, Y 300. A market sell for 450 arrives: X takes 400, you take 50, and you keep 50 resting at the front. If X had cancelled first, you would have taken all 100, Y all 300, and the last 50 shares of the sell would have walked to the next price down.',

    { h: 'Pro-rata matching' },
    'Not every market uses time as the tie-break. Some futures contracts use **pro-rata** matching: a fill at a price is shared among all resting orders in proportion to their size, sometimes after giving a fixed amount to the first order at that price. If orders of 800 and 200 rest and a 100-lot sell arrives, they get 80 and 20.',
    'The rules shape behaviour. Under FIFO, being early is everything, so fast firms race to be first at each new price. Under pro rata, size is everything, so traders rest more than they want and expect partial fills.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Assuming a limit order filled because the price touched it.',
        'Cancelling and resending to "refresh" an order, and losing a good place in the queue.',
        'Expecting to trade at their limit price when the book offered better.',
        'Writing a backtest that fills passive orders without modelling the queue ahead.',
      ],
    },
  ],

  'execution-cost': [
    { h: 'What a trade really costs' },
    'The markets module listed the visible costs: commission, the spread, slippage. For anything larger than a few hundred shares there is a bigger one you cannot see on the screen: the cost of your own order moving the price. This lesson takes the whole bill apart, measured against the **arrival mid**: the midpoint of the bid and ask at the moment you decided to trade.',

    { h: 'The parts of the bill' },
    { sub: 'The half spread' },
    'A buy that crosses to the ask pays the gap between the ask and the mid: the **half spread**. It is the floor of execution cost for an aggressive order and, for a small order in a liquid name, nearly all of it.',
    { sub: 'Impact' },
    '**Impact** is the move your own order causes. Buying takes the cheapest offers, and the sellers who remain ask more; other traders see the buying and raise their prices too. A large buy order is filled at higher and higher prices as it goes.',
    { sub: 'Timing risk and opportunity cost' },
    'While you work an order slowly, the price also moves for reasons that have nothing to do with you. That is **timing risk**: it can help or hurt, so on average it costs nothing, but it widens the range of outcomes. If the price runs away and you give up, the shares you never bought carry an **opportunity cost**. Fees complete the bill.',

    { h: 'Temporary and permanent impact' },
    'Impact has two parts. **Temporary impact** is the premium you pay for getting liquidity quickly. When you stop buying, the pressure stops and this part fades. **Permanent impact** is the part that stays, because other traders took your buying as information, whether or not it was.',
    'Large studies of institutional orders give a consistent picture. During an order the price rises with the shares done. After the order ends it falls back part of the way: by the end of the day it typically sits at about two thirds of the peak, and it keeps fading for days after (Bucci and others, 2019, using a large database of US institutional orders). This matters for how you judge a trade: the price at your last fill overstates how much you moved it for good.',

    { h: 'The square-root rule' },
    'The most widely used rule of thumb for impact is the **square-root law**. For an order of Q shares in a stock that trades V shares a day, with **daily volatility** σ (the standard deviation of daily returns, from the volatility module):',
    { code: `impact ≈ Y × σ × √(Q / V)` },
    'Y is a number of order one that each firm estimates from its own orders. The law has been found in stocks, futures, options and other markets (one well-known paper is Tóth and others, 2011). It is an average over many orders; any single order can land far from it.',
    'Take a stock with σ = 3% that trades 5 million shares a day, and an order of 125,000 shares, 2.5% of the day.',
    {
      code: `import math

sigma, V = 0.03, 5_000_000
for Q in (125_000, 500_000):
    bps = sigma * math.sqrt(Q / V) * 10_000
    print(Q, round(bps, 1))`,
      out: `125000 47.4
500000 94.9`,
    },
    'Multiplying by 10,000 turns a fraction into **basis points** (bps), hundredths of a percent. Four times the shares costs twice as much per share, because √4 = 2. The total dollar cost is cost per share times shares, so it grows faster: like Q to the power 1.5. That is the core reason large orders are split up and spread over time.',

    { h: 'Turning bps into dollars' },
    'Execution costs are quoted in bps so that orders of different size and price can be compared, then turned into dollars for the account. An order of 30,000 shares of a $60 stock is $1,800,000. If you expect 15 bps of impact and a half spread of 1 bp, the expected cost is 16 bps of $1,800,000, which is $2,880.',

    { h: 'The price of waiting' },
    'Spreading an order out lowers impact, but you hold the risk longer. Volatility grows with the square root of time (the volatility module annualised with √252 for the same reason), so over a fraction T of a day the price move has a standard deviation of about `σ × √T`. With σ = 2%, a sixteenth of a day carries 0.5% of risk, and four sixteenths carry 1%. The next lesson turns this trade-off into a schedule.',

    { h: 'What this means at your size' },
    'For 200 shares of SPY, impact is far below a cent and the spread is the whole cost. The rule matters when your order is a visible share of the volume: a large stock order, or a few dozen option contracts on a strike that trades a few hundred a day. There, displayed size is small, market makers widen their quotes as you take it, and the square-root rule is best read as a floor.',
    {
      list: [
        'Mistake: treating the quoted spread as the whole cost of a large order.',
        'Mistake: using a linear impact model, which badly understates the cost of medium orders.',
        'Mistake: forgetting that waiting adds risk even though it lowers impact.',
      ],
    },
  ],

  'execution-optimal': [
    { h: 'The problem an execution desk solves' },
    'Someone has decided to sell a block of shares. How fast should it be sold? Sell all at once and pay heavy impact. Sell slowly and the price may drift away while you hold the rest. The algo module described this trade-off and the TWAP and VWAP schedules. Robert Almgren and Neil Chriss (Journal of Risk, 2000) turned it into an optimisation: choose the schedule that minimises **expected cost + λ × variance of cost**.',
    'The **variance** is the square of the standard deviation, a measure of how spread out the possible results are. λ (the Greek letter lambda) is your **risk aversion**: how many dollars of expected cost you would pay to remove one unit of variance. A trader who only cares about the average sets λ = 0.',

    { h: 'A small model' },
    { sub: 'Trades and holdings' },
    'Sell X shares over N equal periods. Call `n_k` the shares sold in period k and `x_k` the shares still held after it, so `x_0 = X` and `x_N = 0`. A schedule is the list of trades, or equivalently the list of holdings.',
    { sub: 'The cost of trading fast' },
    'Assume **linear temporary impact**: each share sold in period k fetches η × n_k less than the market price, where η (eta) is a constant in dollars per share per share traded. A period that sells n shares then costs `η × n²`, and the whole schedule costs `η × Σ n_k²`, where Σ means "add up over all periods". Linear **permanent impact**, which shifts the price for good, costs about the same whatever the order of the trades, so it does not change which schedule is best and can be left aside.',
    { sub: 'The risk of trading slowly' },
    'Each period the price moves by a random amount with standard deviation σ dollars. Whatever you still hold rides that move. The moves are independent from period to period, so their variances add: the variance of the result is `σ² × Σ x_k²`.',

    { h: 'Working the numbers by hand' },
    'Take X = 9,000 shares in N = 3 periods, η = $0.0001 and σ = $0.30.',
    {
      code: `import math

eta, sigma = 0.0001, 0.30
for trades in ([3000, 3000, 3000], [5000, 3000, 1000]):
    held = [9000 - sum(trades[:k + 1]) for k in range(3)]
    cost = eta * sum(n * n for n in trades)
    sd = sigma * math.sqrt(sum(x * x for x in held))
    print(trades, held, round(cost), round(sd))`,
      out: `[3000, 3000, 3000] [6000, 3000, 0] 2700 2012
[5000, 3000, 1000] [4000, 1000, 0] 3500 1237`,
    },
    'Equal slices cost $2,700 with a standard deviation of $2,012. Selling more early costs $3,500 but cuts the standard deviation to $1,237. Neither is wrong; they are two points on a trade-off.',

    { h: 'The shape of the best schedule' },
    { sub: 'When only the average matters' },
    'Because each period\'s cost is a square, concentration is punished: one trade of 2n costs 4ηn², two trades of n cost only 2ηn². With λ = 0 the best schedule is equal slices, which is TWAP.',
    { sub: 'When risk has a price' },
    'With λ > 0, holding shares becomes expensive, and the best schedule sells more early. Almgren and Chriss showed the holdings follow a curve built from the **hyperbolic sine**, `sinh`, a function available as `math.sinh`:',
    { code: `x_j = X × sinh(κ(N − j)) / sinh(κN),   with   cosh κ = 1 + λσ² / (2η)` },
    'κ (kappa) is the urgency. `cosh` is the hyperbolic cosine, and `math.acosh` undoes it, so κ = acosh(1 + λσ²/(2η)). When λ = 0, κ = 0 and the curve becomes the straight line of TWAP. The bigger λσ² is compared with η, the bigger κ and the faster the holdings fall. Each λ gives one schedule and one pair of expected cost and standard deviation; plotted together these pairs form the **efficient frontier**.',
    {
      code: `import math

def holdings(X, N, lam, sigma, eta):
    k = math.acosh(1 + lam * sigma ** 2 / (2 * eta))
    return [round(X * math.sinh(k * (N - j)) / math.sinh(k * N)) for j in range(N + 1)]

print(holdings(9000, 3, 2e-4, 0.3, 1e-4))`,
      out: `[9000, 5229, 2398, 0]`,
    },

    { h: 'Forecasts, and the limits of the model' },
    'If you expect the price to move against you while you trade, for example because the signal that started the trade predicts a rise and you are buying, every share bought later is expected to cost more. This **alpha decay** pushes the schedule earlier in the same way risk aversion does.',
    'Treat the model as a way to think, not a machine. Measured impact is closer to the square-root rule than to linear; η and σ are estimated with error; volume is not spread evenly through the day; and real algorithms re-plan as fills and prices arrive. What survives all of that is the shape of the answer: equal slices if you only care about the average, faster when risk or a forecast pushes you.',
    {
      list: [
        'Mistake: calling TWAP "optimal" without saying for which risk aversion.',
        'Mistake: checking a schedule without checking its ends: holdings must start at X and end at 0.',
        'Mistake: trusting the model\'s inputs more than their rough estimates deserve.',
      ],
    },
  ],

  'execution-passive': [
    { h: 'Two ways to buy' },
    'Every buy order is a choice between two kinds. An **aggressive** order crosses the spread: a market order, or a limit at or above the ask. It is filled now and pays the **half spread**, the gap between the ask and the mid. A **passive** order rests on the bid. If someone sells to it, you save the half spread, and on some exchanges you earn a small **rebate** for providing liquidity. But nobody has to sell to it. The quote makes passive look free. This lesson shows why it is not.',

    { h: 'Fill probability' },
    'The chance that a resting order fills, its **fill probability**, depends on three things: your place in the queue (the first lesson of this module), how far your price is from the best price, and which way the market moves. Joining a long queue at the best bid might fill a third of the time over a minute; a bid one tick below the best might fill a tenth of the time. These numbers vary enormously by stock and time of day and must be measured.',

    { h: 'Adverse selection' },
    { sub: 'Why fills come at bad moments' },
    'Your bid is reached only when enough sell orders arrive to use up the queue ahead of you. Those are the moments when sellers outnumber buyers, and the same imbalance tends to push the price lower next. So, given that your bid filled, the price is more likely to be lower a little later. Meanwhile the times your bid did not fill are mostly times the price rose away from you, and you then buy higher.',
    { sub: 'The name for it' },
    'This is **adverse selection**: the fills you get are selected towards the ones you would rather not have. It is the same force that makes market makers widen their spreads when informed traders are about, which the next lesson covers.',

    { h: 'Putting a number on the choice' },
    'Measure everything in cents per share, against the value of the stock shortly after the decision. Let h be the half spread, p the fill probability, A the average fall in the mid after a passive fill, and M the average rise in price when the order misses.',
    {
      list: [
        'Aggressive: cost h.',
        'Passive and filled (probability p): you save h, but the stock is then worth A less, so the cost is A − h.',
        'Passive and missed (probability 1 − p): the price is M higher and you cross anyway, so the cost is M + h.',
      ],
    },
    'The expected passive cost is `p × (A − h) + (1 − p) × (M + h)`. Try h = 3 cents, p = 0.6, A = 1, M = 2: the passive route costs 0.6 × (−2) + 0.4 × 5 = 0.8 cents, against 3 for crossing. Now let informed sellers arrive so that A = M = 4: it costs 0.6 × 1 + 0.4 × 7 = 3.4 cents, worse than crossing. The quote is identical in both cases. What changed is the information in the order flow.',

    { h: 'Markouts' },
    'A **markout** measures A from your own fills. For a buy it is the mid some time after the fill minus the fill price; for a sell it is the fill price minus the later mid. Positive means the fill turned out well. Multiplying by a **side** of +1 for buys and −1 for sells puts both on the same scale.',
    {
      code: `import numpy as np

side = np.array([1, 1, -1, -1])
fill = np.array([30.00, 30.01, 30.05, 30.04])
later = np.array([29.98, 30.02, 30.06, 30.01])   # mid 30 seconds after each fill
m = side * (later - fill) * 100
print(m.round(1).tolist(), round(m.mean(), 2))`,
      out: `[-2.0, 1.0, -1.0, 3.0] 0.25`,
    },
    'Markouts are usually computed at several horizons (one second, ten seconds, a minute) and averaged over many fills, filled orders only. A consistently negative average on passive fills is adverse selection made visible. Report it next to the **fill rate**, the share of orders that filled; one without the other misleads.',

    { h: 'When to cross and when to wait' },
    { sub: 'Reasons to cross' },
    'Cross when the order is urgent: a signal that loses its value in seconds, a stop that must be executed, an order that must be done by the close. Cross when the spread is one tick and the queue is so long that a passive fill is unlikely before the reason for the trade is gone. Use a limit at the far side of the spread rather than a market order, so the worst price is still capped.',
    { sub: 'Reasons to wait' },
    'Rest when you can wait, when the spread is wide compared with the tick (common in options, where a 20-cent spread on a $3 option is normal), or when you are near the front of the queue. A middle path is to start at the mid and move towards the far side after a set time if unfilled.',
    { sub: 'Fees' },
    'Exchanges often charge takers a fee per share and pay makers a rebate, and the gap between them can be a meaningful share of a one-cent spread. Fee schedules differ by venue and change; check the current ones.',
  ],

  'execution-mm': [
    { h: 'Selling immediacy' },
    'A **market maker** posts a bid and an ask at the same time and lets others trade with it. What it sells is **immediacy**: anyone who wants to trade now can, at its price. If buyers and sellers arrive in equal numbers and the price stays put, it buys at the bid, sells at the ask, and keeps the spread on each pair of trades, called a **round trip**. Quoting 2 cents wide in a 200-share size, each round trip earns $4.',
    'That is the whole income. Three things take it back.',

    { h: 'Three risks' },
    { sub: 'Inventory risk' },
    'Order flow is not perfectly balanced, so the maker ends up holding shares, its **inventory**, or being short. While it holds them the price moves. Long 1,000 shares through a 5-cent fall loses $50, which is a lot of 2-cent spreads.',
    { sub: 'Adverse selection' },
    'Some traders know more than the maker: about news, about a large order coming, or only about where the price is going in the next second. They buy when the price is about to rise and sell when it is about to fall. Every trade with them loses money on average.',
    { sub: 'Competition' },
    'Other makers quote tighter or update faster. The one that is slowest to move its quotes after news is the one whose stale quotes get traded against.',

    { h: 'Why a spread exists: Glosten and Milgrom' },
    'Glosten and Milgrom (1985) showed that adverse selection alone forces a spread, even with no costs. Suppose a stock is worth either $55 or $45, each with probability one half. A share μ (mu) of traders know which; they buy if it is $55 and sell if it is $45. The rest buy or sell at random, half each way.',
    'If the value is $55, a buy arrives with probability μ + (1 − μ)/2; if it is $45, with probability (1 − μ)/2. The maker sets its ask at the **expected value of the stock given that a buy arrives**, so it breaks even on average against the mix of traders. Here is that sum for μ = 0.2:',
    {
      code: `mu, hi, lo = 0.2, 55.0, 45.0
p_buy_hi = mu + (1 - mu) / 2
p_buy_lo = (1 - mu) / 2
ask = (p_buy_hi * hi + p_buy_lo * lo) / (p_buy_hi + p_buy_lo)
bid = (p_buy_lo * hi + p_buy_hi * lo) / (p_buy_hi + p_buy_lo)
print(round(ask, 2), round(bid, 2), round(ask - bid, 2))`,
      out: `51.0 49.0 2.0`,
    },
    'A buy shifts the odds towards the high value, so the ask sits above the $50 average; a sell does the reverse. In this model the spread equals μ × (high − low): more informed traders, or more uncertainty about the value, mean a wider spread.',

    { h: 'Managing inventory by skewing' },
    'A maker that has bought too much wants fewer sellers and more buyers. It moves both quotes down together, which is called **skewing**. A lower bid attracts fewer sells; a lower ask attracts more buys. The spread stays the same width; only its centre moves.',
    'Avellaneda and Stoikov (2008) gave a formula for the centre, the **reservation price**: `r = mid − q × γ × σ² × (T − t)`. Here q is the inventory in shares, γ (gamma) the maker\'s risk aversion, σ the volatility of the price per unit of time, and T − t the time left before the maker wants to be flat. More inventory, more volatility or more time left all push the centre further from the mid. Many real makers use a simpler version: shift both quotes by a constant k times the inventory, and stop quoting one side entirely when inventory hits a hard limit.',

    { h: 'Where the P&L comes from' },
    'A maker\'s profit splits cleanly into two parts. **Spread captured** is, for each fill, the distance between the fill price and the mid at that moment, times the size. **Inventory P&L** is everything else: the effect of price moves on the shares it held.',
    {
      code: `fills = [(+200, 30.00), (-200, 30.03), (+200, 29.99)]   # size (+ bought), price
mids = [30.01, 30.02, 30.00]
cash = sum(-q * p for q, p in fills)
inv = sum(q for q, _ in fills)
captured = sum(-q * (p - m) for (q, p), m in zip(fills, mids))
print(round(captured, 2), inv, round(cash + inv * 29.97, 2))`,
      out: `6.0 200 2.0`,
    },
    'Each fill was a cent better than the mid, $6 in all, but the maker ended long 200 shares and the price fell to $29.97, which took $4 of it back. A good market-making system tracks the two parts separately, because the first is what it is paid for and the second is the risk it is trying to control.',

    { h: 'A speed business' },
    'In liquid stocks and futures, the main danger is the **stale quote**. When news moves the fair price, every quote still at the old price is a free option for whoever trades first. Faster traders **pick off** the slow quotes. So makers invest in being first to cancel and first in the queue at each new price: servers in the exchange\'s building (**co-location**), dedicated network links, specialised hardware.',
    'Exchange fees reinforce this. Under the common **maker-taker** model, orders that rest earn a rebate and orders that take pay a fee. US rules cap that fee at 30 cents per 100 shares for most stocks; a 2024 SEC rule cuts it to 10 cents, but compliance has been delayed to November 2027 at the time of writing (2026). Check current rules.',
    'For an individual the conclusion is plain. You cannot win that race through a retail broker. Resting a limit order at the mid of a wide option spread is a small version of the same business, and it carries the same adverse selection: when someone takes your price straight away, ask why.',
  ],

  'execution-venues': [
    { h: 'One stock, many places to trade it' },
    'In the United States a single stock trades in many places at once. Knowing what they are explains where your order goes and why your fill can differ from the quote on your screen. The figures below are as of the time of writing (2026); market shares change every year.',
    { sub: 'Lit exchanges' },
    '**Lit exchanges** display their bids and offers publicly. There are more than a dozen in the US, owned by a few groups, and new ones still appear: the Texas Stock Exchange began trading in July 2026.',
    { sub: 'Dark pools' },
    '**Dark pools**, regulated as alternative trading systems, show no quotes. Orders wait unseen and usually trade at the **midpoint** of the best public bid and offer. In 2025 they handled roughly 18% of US share volume.',
    { sub: 'Wholesalers' },
    '**Wholesalers** are large market-making firms that fill orders sent by retail brokers, off exchange. Together with dark pools they made off-exchange trading about half of all US share volume in 2025, the first full year above half by Cboe and Rosenblatt counts.',

    { h: 'The rules that join the venues' },
    'The **national best bid and offer**, the **NBBO**, is the highest bid and lowest offer across all lit exchanges at a moment. Under Regulation NMS Rule 611, the **order protection rule**, a venue may not execute a trade at a price worse than a protected quote displayed elsewhere: if one exchange offers at $15.10, another may not sell to you at $15.11. In June 2026 the SEC proposed rescinding this rule; at the time of writing the proposal is not final.',
    'Venues also compete on fees. Under **maker-taker** pricing an order that takes liquidity pays a fee and one that rests earns a rebate; **inverted** venues do the opposite. Two exchanges showing the same price are therefore not the same deal. Buying 2,000 shares at $15.10 with a $0.0030 fee costs $6 more than at a venue charging nothing, which on a one-cent spread is a third of the spread.',

    { h: 'Auctions' },
    'Trading opens and closes with **auctions**. Instead of matching orders one by one, the exchange collects orders for a while and then picks one price at which everything that can trade does. The usual rule is the price that **maximises the volume traded**. At a candidate price p, every buyer with a limit at or above p is willing, and every seller with a limit at or below p is willing; the volume that can trade is the smaller of the two totals.',
    {
      code: `buys = [(15.12, 200), (15.10, 300)]
sells = [(15.08, 100), (15.11, 400)]
for p in (15.08, 15.10, 15.11, 15.12):
    demand = sum(s for b, s in buys if b >= p)
    supply = sum(s for a, s in sells if a <= p)
    print(p, demand, supply, min(demand, supply))`,
      out: `15.08 500 100 100
15.1 500 100 100
15.11 200 500 200
15.12 200 500 200`,
    },
    'Here 200 shares can trade at $15.11 or $15.12. Exchanges break ties with further rules, typically the smallest leftover imbalance and then the price closest to a reference. Everyone in the auction gets the same price, so nobody walks a book. The **closing auction** is especially large because funds are valued at the closing price: in 2025 it was roughly 8% to 10% of all US volume on a normal day and far more on index rebalance days. Exchanges publish the order imbalance before the close, and other traders react to it.',

    { h: 'Payment for order flow' },
    'Most US retail brokers send customer orders to wholesalers, which pay the broker for them: **payment for order flow**, or **PFOF**. Retail orders are attractive because they are, on average, less informed than professional ones, so trading against them carries less adverse selection. The wholesaler shares some of that value as **price improvement**: filling a buy a fraction of a cent below the NBBO offer, for example.',
    'Whether customers end up better or worse off than if their orders went to an exchange is argued over. Brokers must publish quarterly **Rule 606 reports** listing where orders were routed and the payments received. Rules differ by country: the EU banned PFOF in amendments to its MiFIR regulation that took effect in March 2024, with a transition for some member states until mid-2026, while in the US it is legal and an SEC proposal to make retail orders go through competitive auctions was withdrawn in June 2025. Check the current rules where you trade.',

    { h: 'Smart order routing' },
    'An institution\'s order is sent by a **smart order router**, a program that splits it across venues. It weighs the displayed price and size at each, the fee or rebate, the chance a resting order there will fill, hidden liquidity that it discovers by sending small orders into dark pools, and **information leakage**: the risk that others notice the order and trade ahead of it.',
    'As an individual you do not choose the route; your broker does. What you can do is read the broker\'s 606 report, record the NBBO at the moment of each order, and compare your fills with it, with the midpoint as the fairer reference for small orders.',
    {
      list: [
        'Mistake: comparing venues by quoted price and ignoring fees.',
        'Mistake: reading price improvement against the offer as proof of a good fill, when the midpoint was available.',
        'Mistake: stating market-structure rules from memory; they change, so check the current state.',
      ],
    },
  ],

  'execution-tca': [
    { h: 'Measuring execution after the fact' },
    'Every lesson so far has been about choosing how to trade. **Transaction cost analysis**, **TCA**, checks the result: what did execution actually cost, compared with a reference price called a **benchmark**, averaged over many orders? Without it, you cannot tell a good execution habit from a lucky one, and your backtest keeps assuming costs you never measured.',

    { h: 'Benchmarks' },
    { sub: 'Decision and arrival' },
    'The **decision price** is the mid when you decided to trade. The **arrival price** is the mid when the order reached the market. For a person clicking a button they are nearly the same; for a system with a queue of work, or a manager who calls a desk, they can be minutes apart.',
    { sub: 'Interval VWAP' },
    '**Interval VWAP** is the volume-weighted average price of all trading in the stock while your order was being worked. It answers "did I trade at about the average price of the period?"',
    { sub: 'The close' },
    'The **closing price** suits funds that are valued at the close: they want their trades to match the price at which the fund is marked.',

    { h: 'Slippage in basis points' },
    'The basic measure is **slippage**: how far the average fill was from the benchmark, as a share of the benchmark, in basis points. To make every cost a positive number, multiply by the side, +1 for a buy and −1 for a sell: for a sell, filling below the benchmark is the bad outcome.',
    {
      code: `def slippage_bps(side, bench, fill):
    return side * (fill - bench) / bench * 10_000

print(round(slippage_bps(1, 40.00, 40.02), 1))    # bought 2 cents above
print(round(slippage_bps(-1, 40.00, 40.02), 1))   # sold 2 cents above`,
      out: `5.0
-5.0`,
    },
    'A negative result is a gain against the benchmark. Averaging slippage over many orders gives your typical cost; averaging without the side would let buys and sells cancel out and hide everything.',

    { h: 'Implementation shortfall, piece by piece' },
    'André Perold (1988) defined **implementation shortfall** as the gap between a **paper portfolio**, which traded everything instantly at the decision price, and the real one. For a buy it breaks into four parts, each a cost when positive:',
    {
      list: [
        '**Delay cost**: (arrival − decision) × shares filled. The price moved before the order even reached the market.',
        '**Execution cost**: (average fill − arrival) × shares filled. What working the order cost.',
        '**Opportunity cost**: (later price − decision) × shares never filled. The move you missed on what you gave up.',
        '**Fees**: commissions and exchange fees on what filled.',
      ],
    },
    'For a sell, each price difference is multiplied by −1. A worked example: you decide to buy 5,000 shares at a mid of $20.00. The order arrives with the mid at $20.02. You fill 4,000 at an average of $20.05, cancel the rest, and the stock ends the day at $20.20. Fees are $0.001 a share. Delay cost is 0.02 × 4,000 = $80; execution 0.03 × 4,000 = $120; opportunity 0.20 × 1,000 = $200; fees $4. Total: $404. Each part points at a different fix: decisions reaching the market faster, a better algorithm, or not giving up so soon.',

    { h: 'Why VWAP can flatter you' },
    'VWAP is easy to meet and can be a poor judge. If your order is a large share of the day\'s volume, your own trades make up much of the VWAP, so you will be near it whatever you did. And if the stock trends against you all day, matching VWAP still means a large cost against arrival. Large orders are best judged against arrival, with VWAP as a second view.',

    { h: 'Measuring your own slippage' },
    'You need records made at the time: the decision time and mid, the arrival mid, each fill with its time, size and fee, the order type and limit price, and what happened to anything unfilled. From them compute signed bps per order. Then ask how sure the average is. The **standard error** of a mean is the sample standard deviation divided by √n, and the **t statistic** is the mean divided by its standard error, as in the backtest and quant modules.',
    {
      code: `import numpy as np

bps = np.array([6.0, 2.0, -1.0, 4.0, 9.0, 3.0])
se = bps.std(ddof=1) / np.sqrt(len(bps))
print(round(bps.mean(), 2), round(se, 2), round(bps.mean() / se, 1))`,
      out: `3.83 1.4 2.7`,
    },
    'Then split the results: by order size (cost usually rises with size, roughly as the square-root rule suggests), time of day, order type and instrument. Add markouts after fills to catch adverse selection that arrival slippage misses.',

    { h: 'Feeding costs back into research' },
    'The point of measuring is to correct the backtest. A strategy that earns 12 bps per round trip before costs, tested with 2 bps per side, shows 8 bps net. If live costs are 5 bps per side, it earns 2. Nothing about the signal changed; only the cost did. Most short-horizon edges are small enough that this is the difference between a strategy and a hobby.',
    {
      list: [
        'Mistake: reporting slippage without the side, so sells and buys cancel.',
        'Mistake: ignoring unfilled orders, which hides opportunity cost.',
        'Mistake: reading a five-order average as if it were precise.',
      ],
    },
  ],

  'execution-lab': [
    { h: 'What you are building' },
    'This lab puts the module together in two pieces of code. The first is a **matching engine**: a book that stores each order in a queue at its price and fills incoming orders by price-time priority. The second is an **execution simulator**: a parent buy order cut into child orders on a schedule, filled under a simple impact model, and scored by implementation shortfall. All prices and paths are made up from fixed seeds, and the model is deliberately simple. It shows the shape of the trade-off between cost and risk, not the cost of any real order.',

    { h: 'The book as a dictionary of queues' },
    { sub: 'Storing orders' },
    'Each side of the book is a dictionary from price to a `deque` of `[order_id, size]` pairs, oldest first. Adding an order means finding or creating the queue at its price and appending to the right. `dict.setdefault(key, default)` returns the value at a key, creating it with the default if it is missing, which does both in one call.',
    {
      code: `from collections import deque

asks = {}
for oid, price, size in [("P", 21.05, 100), ("Q", 21.04, 300), ("R", 21.05, 200)]:
    asks.setdefault(price, deque()).append([oid, size])
print(min(asks), [o[0] for o in asks[21.05]])`,
      out: `21.04 ['P', 'R']`,
    },
    { sub: 'Finding the best price' },
    'The best ask is the lowest key and the best bid the highest, so `min` and `max` over the dictionary give them; an empty side has no best price. Real engines keep prices sorted so they never scan, but for learning a scan is clear and fast enough.',

    { h: 'Matching across levels' },
    'An incoming market buy takes from the asks: the lowest price first, and within it the oldest order first. That is two loops, one across levels and one within a level. When an order is used up it leaves the queue; when a queue is empty its price leaves the dictionary. A partly used order stays at the front with its size reduced. Every fill is recorded at the resting price. A limit order is the same loop with one extra test: stop as soon as the best opposite price is worse than the limit.',

    { h: 'Schedules in whole shares' },
    'A parent order of X shares over N periods needs whole-share slices that add up to X exactly. For TWAP, `divmod(X, N)` gives the base slice and the remainder, and the remainder is spread one share at a time over the first slices: 1,003 shares in 4 periods is 251, 251, 251, 250.',
    'For a front-loaded schedule, compute the Almgren-Chriss holdings `X × sinh(κ(N − j)) / sinh(κN)` from the previous lesson, round the **holdings** to whole shares, and take the differences. Rounding holdings, not trades, guarantees the total: the differences add up to the first holding minus the last, X − 0.',
    {
      code: `import math

X, N, k = 2000, 4, 0.6
x = [round(X * math.sinh(k * (N - j)) / math.sinh(k * N)) for j in range(N + 1)]
trades = [x[j] - x[j + 1] for j in range(N)]
print(x, trades, sum(trades))`,
      out: `[2000, 1076, 552, 233, 0] [924, 524, 319, 233] 2000`,
    },

    { h: 'The impact model' },
    { sub: 'One period, in order' },
    'Each period three things happen, in this order. The mid moves by a random amount with standard deviation σ (the market). You buy n shares at the mid plus η × n (your temporary impact; you pay more for buying more at once). Then the mid rises by γ × n and stays there (your permanent impact, which every later slice pays for). The shortfall adds n × (fill − arrival) for every slice.',
    { sub: 'Why the order matters' },
    'If permanent impact were applied before your own fill, every slice would pay for itself twice; if the random move came after the fill, your fills would never feel the market. Writing the order down and testing it on a tiny case by hand is the only way to be sure.',
    {
      code: `mid, arrival, eta, gamma = 30.0, 30.0, 1e-4, 1e-5
total = 0.0
for n in (500, 500):
    fill = mid + eta * n
    total += n * (fill - arrival)
    mid += gamma * n
print(round(total, 2))`,
      out: `52.5`,
    },
    'With no random moves, the first slice pays 5 cents of temporary impact on 500 shares, $25. The second pays the same plus the half cent of permanent impact left by the first: $27.50. Total $52.50.',

    { h: 'Comparing schedules fairly' },
    'With noise switched on, one run proves nothing: a schedule can look good because the price happened to fall. So each schedule is run over many paths, and the **mean** and **standard deviation** of the shortfall are compared. Using the same seeds for every schedule means each faces the same market moves, so the differences you see come from the schedule, not the draw. This is called using **common random numbers**.',
    'Expect the pattern from the optimal execution lesson: TWAP has the lower mean and the higher standard deviation; the front-loaded schedule pays more on average for a narrower range of outcomes.',

    { h: 'What the toy leaves out' },
    'Every child order here fills in full at a known price. Real ones can miss. Impact here is linear, while measured impact is closer to square-root. The spread and fees are missing, temporary impact vanishes instantly instead of decaying, volume is flat through the day, and nobody reacts to your pattern. Each gap is a place to extend the model, and each parameter (η, γ, σ) should eventually come from your own fills and TCA rather than from a guess.',
  ],
}
