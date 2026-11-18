import type { Module } from '../types'

export const markets: Module = {
  id: 'markets',
  title: 'How markets work',
  summary: 'What you are trading, who is on the other side, how your order gets filled and what each trade really costs, before you risk a dollar.',
  lessons: [
    {
      id: 'markets-instruments',
      title: 'Shares, ETFs and indexes',
      summary: 'What SPY, QQQ and SPX are, how a position makes or loses money, and why day traders stay in liquid names.',
      text: [
        'A **share** is a small piece of ownership of one company, traded under a short code called a **ticker**: AAPL for Apple, MSFT for Microsoft. If you own 20 shares and the price rises by $1, your position gains $20. Profit and loss is always quantity times price change.',
        'An **index** is a number worked out from a basket of stocks. The S&P 500 follows 500 large US companies, weighted by their market value; the Nasdaq-100 follows 100 large companies listed on Nasdaq. **SPX** is the ticker for the S&P 500 index level. You cannot buy an index: it is a number, not a thing you can own. SPX has options of its own, which the options module covers.',
        'An **ETF** (exchange-traded fund) is a fund that holds a basket and trades like a single share. **SPY** holds the S&P 500 and trades at roughly one tenth of the index level, not exactly, because of dividends and the fund fee. **QQQ** holds the Nasdaq-100. Buying one share of SPY gives you a small slice of all 500 companies at once.',
        'Judge a move as a percentage of the price, not in dollars. A $1 rise on a $30 stock is 3.3%; on a $600 ETF it is 0.17%. Your dollar result depends on how many dollars you have in the position, not on how many shares.',
        'Day traders stick to **liquid** names: ones where millions of shares change hands every day and where the options have many active strikes. Liquid means tight prices, fast fills and the ability to get out when you want. A thinly traded stock can cost you more to enter and leave than the move you were trying to catch, and a single company can gap on its own news in a way an index ETF rarely does.',
      ],
      rules: [
        'A share is ownership; an ETF is a basket that trades like one share; an index is a number you cannot buy.',
        'SPY tracks the S&P 500 at roughly a tenth of SPX. QQQ tracks the Nasdaq-100.',
        'Dollar P&L = quantity × price change. Percent return = price change ÷ entry price.',
        'Compare positions by their dollar size, not by their number of shares.',
        'Trade liquid names: high volume, tight quotes, active option strikes.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'markets-instruments-1',
          ask: 'You buy 50 shares of QQQ at $480.00 and sell them at $483.20. What is your profit in dollars, before costs?',
          answer: 160,
          check: '50 * (483.20 - 480.00)',
          why: 'Quantity times price change: 50 × $3.20 = $160. Costs come later in the module; this is the gross result.',
        },
        {
          kind: 'number',
          id: 'markets-instruments-2',
          ask: 'For the same trade (bought at $480.00, sold at $483.20), what is the percent return? Give a percentage to two decimal places, for example 1.25%.',
          answer: 0.006667,
          tol: 0.0001,
          check: '(483.20 - 480.00) / 480.00',
          why: 'Price change ÷ entry price = 3.20 ÷ 480 ≈ 0.67%. Always divide by the price you paid, not the price you sold at.',
        },
        {
          kind: 'choice',
          id: 'markets-instruments-3',
          ask: 'The S&P 500 index (SPX) stands at 6,000. Roughly where would you expect SPY to trade?',
          options: ['Around $6,000', 'Around $600', 'Around $60', 'There is no fixed relationship'],
          answer: 1,
          why: 'SPY trades at about one tenth of the index level. It is not exact, because the fund pays out dividends and charges a small fee, so check the real ratio before you convert a level from one to the other.',
        },
        {
          kind: 'choice',
          id: 'markets-instruments-4',
          ask: 'You want to own the S&P 500 in your brokerage account. Which of these can you buy as shares?',
          options: ['SPX', 'SPY', 'The S&P 500 itself, through any broker', 'None: only funds can own it'],
          answer: 1,
          why: 'SPX is the index level: a number published from the prices of 500 stocks. You cannot own a number. SPY is a fund that holds the stocks and trades like a share, so you can buy it.',
        },
        {
          kind: 'choice',
          id: 'markets-instruments-5',
          ask: 'A small company trades about 200,000 shares a day. SPY trades tens of millions. Why does a day trader usually prefer SPY even if the small stock moves more?',
          options: [
            'SPY always goes up over a day',
            'In SPY you can get in and out quickly at tight prices; in the thin stock the cost of entering and leaving can eat the move',
            'Small stocks cannot be day traded',
            'SPY has lower prices per share',
          ],
          answer: 1,
          why: 'Liquidity is what lets you trade at prices close to the last one and leave when your plan says so. A big move you cannot exit at a fair price is not a gain you can keep.',
        },
        {
          kind: 'number',
          id: 'markets-instruments-6',
          ask: 'SPX falls 45 points. If SPY moves one tenth as much, how many dollars does a 100-share SPY position lose?',
          answer: 450,
          check: '100 * 45 / 10',
          why: 'SPY falls about $4.50, and 100 × $4.50 = $450. Learn to translate index points into the dollars of what you actually hold.',
        },
        {
          kind: 'output',
          id: 'markets-instruments-7',
          ask: 'Two open positions, each as (quantity, entry price, current price). What does this print?',
          code: `positions = {"SPY": (100, 600.00, 601.50), "QQQ": (40, 480.00, 477.00)}
total = 0
for ticker, (qty, entry, now) in positions.items():
    total += qty * (now - entry)
print(round(total, 2))`,
          answer: '30.0',
          why: 'SPY: 100 × 1.50 = +150. QQQ: 40 × (−3.00) = −120. Together +30. One winner and one loser can net to almost nothing, which is why you look at the account total.',
        },
        {
          kind: 'bug',
          id: 'markets-instruments-8',
          ask: 'This should return the percent return of a long trade as a fraction (0.01 for 1%). The numbers come out slightly wrong.',
          code: `def pct_return(entry, exit):
    change = exit - entry
    return change / exit`,
          line: 3,
          fix: '    return change / entry',
          why: 'Returns are measured against what you paid. Dividing by the exit price understates gains and overstates losses: a rise from 100 to 110 would show 9.1% instead of 10%.',
        },
        {
          kind: 'choice',
          id: 'markets-instruments-9',
          ask: 'You hold $10,000 of one tech stock or $10,000 of QQQ overnight, and the stock reports earnings after the close. Which position is more likely to open 10% lower the next morning?',
          options: ['QQQ, because it holds many tech stocks', 'The single stock', 'Both equally', 'Neither: prices cannot jump overnight'],
          answer: 1,
          why: 'One company can gap a long way on its own news. QQQ holds about 100 companies, so one report moves it far less. Prices can and do jump between the close and the next open.',
        },
        {
          kind: 'number',
          id: 'markets-instruments-10',
          ask: 'You hold 100 shares of a $30 stock and 100 shares of a $600 ETF. Both rise 1%. What is your total gain in dollars?',
          answer: 630,
          check: '100 * 30 * 0.01 + 100 * 600 * 0.01',
          why: 'The $30 stock gains $30 and the $600 ETF gains $600. The same number of shares can be very different amounts of money at risk, so size positions in dollars.',
        },
        {
          kind: 'write',
          id: 'markets-instruments-11',
          ask: 'Write a function that returns the dollar profit and the percent return (as a fraction) of a long trade.',
          starter: `def pnl_and_return(qty, entry, exit):
    # qty shares bought at entry and sold at exit
    # returns (dollar profit, return as a fraction of the entry price)
    pass`,
          solution: `def pnl_and_return(qty, entry, exit):
    pnl = qty * (exit - entry)
    return pnl, (exit - entry) / entry`,
          tests: `out = pnl_and_return(50, 480.0, 483.2)
assert out is not None, "the function returns nothing yet"
pnl, ret = out
assert abs(pnl - 160) < 1e-6, f"50 shares from 480 to 483.20 make $160, got {pnl}"
assert abs(ret - 3.2 / 480) < 1e-9, f"the return is 3.20 / 480 = 0.006667, got {ret}: divide by the entry price"
pnl, ret = pnl_and_return(10, 100.0, 90.0)
assert abs(pnl + 100) < 1e-9 and abs(ret + 0.1) < 1e-9, f"a fall from 100 to 90 on 10 shares is -$100 and -10%, got {pnl} and {ret}"`,
          why: 'Two lines of arithmetic, but they are the two numbers you will look at on every trade: what it made in dollars and what it made relative to what you put in.',
        },
      ],
    },
    {
      id: 'markets-spread',
      title: 'Bid, ask and the spread',
      summary: 'The quote, the mid, and why crossing the spread is a cost you pay on every trade.',
      text: [
        'A **quote** has two prices. The **bid** is the highest price someone is willing to pay right now. The **ask** (or offer) is the lowest price someone is willing to sell at right now. Each comes with a **size**: how many shares or contracts are wanted at that price. A quote of 1.20 x 1.30 means you can sell at 1.20 or buy at 1.30 this instant.',
        'The **spread** is ask − bid. The **mid** is (bid + ask) ÷ 2, the halfway point. Your broker usually values open positions at the mid or the last trade, but if you had to close a long position immediately you would get the bid, not the mid.',
        'If you buy at the ask and sell at the bid straight away, with no price change, you lose the whole spread. That is the cost of trading immediately. On SPY a quote of 600.00 x 600.01 costs you a cent a share. On an option quoted 1.20 x 1.30 it costs 0.10 a share, which is $10 per contract because one contract is on 100 shares.',
        'Judge a spread as a percentage of the price: spread ÷ mid. A cent on a $600 ETF is a tiny fraction of a percent; 0.10 on a $1.25 option is 8%. Option spreads are far wider in percentage terms than share spreads, which matters more the shorter you hold.',
        'The **last** price is the most recent trade, which may be seconds or minutes old. It is history. What you can trade at now is the quote. You can try to do better than the far side with a **limit order** near the mid, at the risk of not being filled.',
      ],
      rules: [
        'The bid is what you can sell at now; the ask is what you can buy at now.',
        'Spread = ask − bid. Mid = (bid + ask) ÷ 2.',
        'Buy at the ask and sell at the bid with no move and you lose the whole spread.',
        'Measure a spread as a percentage of the mid. One option contract is 100 shares, so multiply by 100 for dollars.',
        'The last price is history; the quote is what you can trade at now.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'markets-spread-1',
          ask: 'An option is quoted 1.20 x 1.30. What is the mid price?',
          answer: 1.25,
          check: '(1.20 + 1.30) / 2',
          why: 'Halfway between bid and ask: (1.20 + 1.30) ÷ 2 = 1.25.',
        },
        {
          kind: 'number',
          id: 'markets-spread-2',
          ask: 'You buy one contract of that option at the ask (1.30) and sell it a second later at the bid (1.20). The quote has not moved. How many dollars did you lose?',
          answer: 10,
          check: '(1.30 - 1.20) * 100',
          why: 'You lost the spread, 0.10, on 100 shares: $10. Nothing moved and you are already down. That is the price of trading immediately on both sides.',
        },
        {
          kind: 'number',
          id: 'markets-spread-3',
          ask: 'What is the spread of the 1.20 x 1.30 option as a percentage of the mid? Give a percentage, for example 5%.',
          answer: 0.08,
          tol: 0.001,
          check: '(1.30 - 1.20) / ((1.30 + 1.20) / 2)',
          why: '0.10 ÷ 1.25 = 8%. The option has to rise 8% before a buyer at the ask to be able to sell at the bid for what they paid.',
        },
        {
          kind: 'number',
          id: 'markets-spread-4',
          ask: 'SPY is quoted 600.00 x 600.02. You buy 100 shares at the ask and sell them at the bid with no change in the quote. How many dollars did the spread cost you?',
          answer: 2,
          check: '(600.02 - 600.00) * 100',
          why: '0.02 × 100 = $2 on a $60,000 position, about 0.003%. Compare that with the 8% of the option above: the same idea, a completely different size of cost.',
        },
        {
          kind: 'choice',
          id: 'markets-spread-5',
          ask: 'An option last traded at 2.50. The quote now is 2.10 x 2.60. You send an order to sell one contract immediately. Roughly what price do you get?',
          options: ['2.50, the last price', '2.35, the mid', '2.10, the bid', '2.60, the ask'],
          answer: 2,
          why: 'An order that must fill now sells to the best bid. The last trade is history: the market has moved since. Traders who watch the last price instead of the quote are surprised by their fills.',
        },
        {
          kind: 'number',
          id: 'markets-spread-6',
          ask: 'You bought 5 contracts at 2.70. The option is now quoted 2.90 x 3.10 and your platform shows a gain at the mid. If you close now by selling at the bid, what is your profit in dollars?',
          answer: 100,
          check: '(2.90 - 2.70) * 5 * 100',
          why: 'At the mid (3.00) the platform shows (3.00 − 2.70) × 500 = $150. What you can actually take is the bid: (2.90 − 2.70) × 500 = $100. On a wide spread, the gain on screen is larger than the gain you can collect.',
        },
        {
          kind: 'output',
          id: 'markets-spread-7',
          ask: 'Three quotes as (bid, ask). What does this print?',
          code: `quotes = {"A": (4.90, 5.10), "B": (0.45, 0.55), "C": (12.00, 12.10)}
for name, (bid, ask) in quotes.items():
    mid = (bid + ask) / 2
    print(name, round((ask - bid) / mid * 100, 1))`,
          answer: 'A 4.0\nB 20.0\nC 0.8',
          why: 'Spread as a percent of mid: 0.20 ÷ 5.00 = 4%, 0.10 ÷ 0.50 = 20%, 0.10 ÷ 12.05 ≈ 0.8%. B and C have the same 0.10 spread, but on the cheap option it is a fifth of the price.',
        },
        {
          kind: 'bug',
          id: 'markets-spread-8',
          ask: 'This should return the spread as a fraction of the mid. For a 1.20 x 1.30 quote it returns about 0.054 instead of 0.08.',
          code: `def spread_pct(bid, ask):
    mid = bid + ask / 2
    return (ask - bid) / mid`,
          line: 2,
          fix: '    mid = (bid + ask) / 2',
          why: 'Division happens before addition, so this computes bid + (ask ÷ 2) = 1.85. The brackets make it the average of the two.',
        },
        {
          kind: 'choice',
          id: 'markets-spread-9',
          ask: 'An option is quoted 1.20 x 1.30. You place a buy limit order at 1.25, the mid. A minute later the quote is 1.35 x 1.45 and you own nothing. What happened?',
          options: [
            'The broker made an error',
            'Nobody sold to you at 1.25 before the price moved away, so the order is still waiting unfilled',
            'Your order was filled at 1.35',
            'Limit orders only fill at the bid',
          ],
          answer: 1,
          why: 'A limit order fixes the worst price you accept, not whether you get filled. Working the mid saves spread when it fills, and misses the trade when the price runs. Both outcomes belong to the choice.',
        },
        {
          kind: 'design',
          id: 'markets-spread-10',
          ask: 'Write the rules you will use to decide whether a quote is tight enough to trade, for the kind of short trades you plan to make.',
          why: 'A spread is a fixed toll on every round trip. Rules decided in advance stop you from entering a contract whose spread eats most of what you hope to make.',
          checklist: [
            { point: 'A maximum spread as a percentage of the mid', why: 'Dollars alone mislead: 0.10 is small on a $12 option and huge on a $0.50 one.' },
            { point: 'Compare the round-trip spread cost with the profit you expect from the trade', why: 'If the spread is a third of your target, most of the edge is gone before the trade starts.' },
            { point: 'Check the sizes on the bid and the ask, not only the prices', why: 'A tight quote for one contract tells you little about filling ten.' },
            { point: 'Use limit orders near the mid and decide how far you will chase', why: 'It saves part of the spread, and a chase limit stops you paying any price.' },
            { point: 'Value open positions at the bid (for longs) when deciding whether to exit', why: 'The mid flatters you; the bid is what you can actually get.' },
            { point: 'Prefer a more liquid alternative when the spread fails your rule', why: 'Another strike, another expiry or the ETF itself may express the same idea for less.' },
          ],
        },
        {
          kind: 'write',
          id: 'markets-spread-11',
          ask: 'Write a function that returns the mid, the spread and the spread as a fraction of the mid. A quote where the bid is above the ask is an error: raise `ValueError`.',
          starter: `def quote_stats(bid, ask):
    # returns (mid, spread, spread / mid)
    pass`,
          solution: `def quote_stats(bid, ask):
    if bid > ask:
        raise ValueError("bid above ask")
    mid = (bid + ask) / 2
    spread = ask - bid
    return mid, spread, spread / mid`,
          tests: `out = quote_stats(1.20, 1.30)
assert out is not None, "the function returns nothing yet"
mid, spread, pct = out
assert abs(mid - 1.25) < 1e-9, f"the mid of 1.20 x 1.30 is 1.25, got {mid}"
assert abs(spread - 0.10) < 1e-9, f"the spread is 0.10, got {spread}"
assert abs(pct - 0.08) < 1e-9, f"the spread is 8% of the mid, so 0.08, got {pct}"
assert abs(quote_stats(600.00, 600.02)[2] - 0.02 / 600.01) < 1e-9, "SPY at 600.00 x 600.02: 0.02 / 600.01"
try:
    quote_stats(1.30, 1.20)
    raise AssertionError("a bid above the ask should raise ValueError")
except ValueError:
    pass`,
          why: 'Three numbers you will want for every contract you consider. A crossed quote usually means stale data, and a function that silently returns a negative spread would let bad data into your decisions.',
        },
      ],
    },
    {
      id: 'markets-book',
      title: 'The order book and liquidity',
      summary: 'Depth, market makers, and what happens when your order is bigger than the best price.',
      widget: 'markets-book',
      text: [
        'Behind the quote is the **order book**: every resting limit order, grouped by price. Buyers wait on the bid side at or below the best bid, sellers on the ask side at or above the best ask. The amount waiting at each price is the **depth**. The best bid and ask are the **top of the book**.',
        'Much of the resting size comes from **market makers**: firms that post bids and asks all day and earn the spread when both sides trade. They are not your personal opponents, and they are not charities either. When news hits or prices move fast they widen their quotes or pull them, so displayed size can vanish exactly when you want it.',
        'A market order takes liquidity: it fills against resting orders, best price first. If it is bigger than the size at the best price it **walks the book**, taking the next level and the next. With asks of 300 at 10.00 and 500 at 10.01, a market buy of 600 shares gets 300 at 10.00 and 300 at 10.01: an **average fill** of 10.005.',
        '**Slippage** is the difference between the price you expected and the average price you got, times the quantity. Measured against the best ask of 10.00, the 600 shares above slipped 0.005 × 600 = $3. In a thin book, or in options where only 10 or 20 contracts may sit at the best price, slippage can be much larger.',
        { code: `asks = [(10.00, 300), (10.01, 500)]    # (price, size), best first
# buying 600: 300 at 10.00, then 300 at 10.01
avg = (300 * 10.00 + 300 * 10.01) / 600   # 10.005` },
        'Liquidity is the ability to trade size near the current price. Volume, tight spreads and deep books all point to it. When the book is thin, trade smaller, use limit orders, or choose a more liquid instrument.',
      ],
      rules: [
        'The book lists resting limit orders: bids below, asks above, with the size at each price.',
        'A market order fills at the best price first and walks to worse prices if it is larger than the top level.',
        'Average fill = total dollars ÷ quantity filled.',
        'Slippage = (average fill − expected price) × quantity, for a buy; the other way round for a sell.',
        'Displayed size can vanish in fast markets: market makers widen or pull quotes.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'markets-book-1',
          ask: 'The ask side of a book is 300 at 10.00, 500 at 10.01 and 1,000 at 10.03. You send a market order to buy 1,000 shares. What is your average fill price? Give three decimal places.',
          answer: 10.011,
          tol: 0.0005,
          check: '(300 * 10.00 + 500 * 10.01 + 200 * 10.03) / 1000',
          hint: 'Take 300, then 500, then whatever is left from the third level.',
          why: '300 × 10.00 + 500 × 10.01 + 200 × 10.03 = $10,011, so the average is 10.011. The order walked three levels.',
        },
        {
          kind: 'number',
          id: 'markets-book-2',
          ask: 'For that same order, how many dollars of slippage did you suffer, measured against the best ask of 10.00?',
          answer: 11,
          check: '(300 * 10.00 + 500 * 10.01 + 200 * 10.03) - 1000 * 10.00',
          why: '$10,011 paid against $10,000 at the best ask: $11. If you had planned the trade at 10.00, your real entry was 1.1 cents a share worse.',
        },
        {
          kind: 'choice',
          id: 'markets-book-3',
          ask: 'Which of these orders adds liquidity to the book rather than taking it?',
          options: [
            'A market order to buy',
            'A buy limit order below the best ask, which waits in the book',
            'A buy limit order above the best ask',
            'A sell market order',
          ],
          answer: 1,
          why: 'An order that rests and waits adds depth for others to trade against. A market order, or a limit that crosses the opposite quote, fills at once against resting orders and takes liquidity away.',
        },
        {
          kind: 'output',
          id: 'markets-book-4',
          ask: 'An option book, ask side, in contracts. What does this print?',
          code: `asks = [(2.10, 20), (2.15, 30), (2.25, 50)]  # (price, contracts)
want, cost, filled = 40, 0.0, 0
for price, size in asks:
    take = min(size, want - filled)
    cost += take * price
    filled += take
    if filled == want:
        break
print(filled, round(cost / filled, 4))`,
          answer: '40 2.125',
          why: '20 at 2.10 and 20 at 2.15: (42 + 43) ÷ 40 = 2.125. The loop stops when the order is complete, so the third level is never touched.',
        },
        {
          kind: 'number',
          id: 'markets-book-5',
          ask: 'In that option fill (40 contracts, average 2.125, best ask 2.10), how many dollars of slippage is that? Remember one contract is 100 shares.',
          answer: 100,
          check: '(2.125 - 2.10) * 40 * 100',
          why: '0.025 × 40 contracts × 100 = $100. Two and a half cents a share sounds small; on 4,000 shares of exposure it is real money.',
        },
        {
          kind: 'bug',
          id: 'markets-book-6',
          ask: 'This should return the average fill of a market buy that walks the book. It reports a fill for more shares than were ordered.',
          code: `def average_fill(asks, qty):
    cost, filled = 0.0, 0
    for price, size in asks:
        take = size
        cost += take * price
        filled += take
        if filled >= qty:
            break
    return cost / filled`,
          line: 4,
          fix: '        take = min(size, qty - filled)',
          why: 'The last level should only give what is still needed. Taking the whole level buys more than the order and averages in prices you never paid.',
        },
        {
          kind: 'choice',
          id: 'markets-book-7',
          ask: 'In the figure, choose the Thin book and set the market buy to 1,000 shares, then switch to Deep. What do you see?',
          options: [
            'Both books give the same average fill, because the best ask is 100.01 in each',
            'Thin walks four levels to an average of about 100.11 and $101 of slippage; Deep fills at about 100.01 with $2',
            'Thin fills better because there are fewer orders in the way',
            'Deep walks more levels because it has more orders',
          ],
          answer: 1,
          why: 'The top of the book is the same; what lies behind it is not. In the thin book the same order costs about fifty times as much slippage. The quote alone does not tell you what size you can trade.',
        },
        {
          kind: 'choice',
          id: 'markets-book-8',
          ask: 'A big economic number is released and the price starts moving fast. What usually happens to the book?',
          options: [
            'Market makers add size to profit from the volume',
            'Market makers widen or pull their quotes, so spreads widen and displayed depth shrinks',
            'Nothing: the book is fixed until the next day',
            'All resting orders are cancelled by the exchange',
          ],
          answer: 1,
          why: 'When prices move fast, a quote that sits still is likely to be traded against at a bad price, so liquidity providers step back. The depth you saw a moment before is not there when you hit the market.',
        },
        {
          kind: 'number',
          id: 'markets-book-9',
          ask: 'You sell 600 shares at market into bids of 200 at 50.00, 200 at 49.98 and 500 at 49.95. How many dollars of slippage is that against the best bid of 50.00?',
          answer: 14,
          check: '50.00 * 600 - (200 * 50.00 + 200 * 49.98 + 200 * 49.95)',
          why: 'You receive 10,000 + 9,996 + 9,990 = $29,986 instead of 600 × 50.00 = $30,000. For a sell, slippage is what you expected minus what you got: $14.',
        },
        {
          kind: 'design',
          id: 'markets-book-10',
          ask: 'You want to buy 30 contracts of an option whose ask shows only 5 contracts, with the next levels several cents higher. Plan how you would enter.',
          why: 'Large orders in thin books pay for their size. Planning the entry turns hidden slippage into a decision you make on purpose.',
          checklist: [
            { point: 'Do not send one market order for all 30', why: 'It would walk the book through every level and pay the worst of them.' },
            { point: 'Use limit orders and set the highest price you will pay', why: 'A limit puts a ceiling on slippage; the cost is that some may not fill.' },
            { point: 'Split the order into smaller pieces and let the book refill', why: 'Market makers often replace size after a fill, at a price close to the old one.' },
            { point: 'Ask whether the trade still works with a partial fill', why: 'Getting 10 of 30 is a likely outcome and your plan should cover it.' },
            { point: 'Consider a more liquid strike, expiry or the underlying instead', why: 'The same view may be available where the book is deeper.' },
            { point: 'Size down if the slippage would be a large share of the expected profit', why: 'Your size should fit the market, not the other way round.' },
          ],
        },
        {
          kind: 'write',
          id: 'markets-book-11',
          ask: 'Write a function that returns the slippage in dollars of a market buy of `qty` shares, measured against the best ask. If the book does not hold enough shares, raise `ValueError`.',
          starter: `def slippage(asks, qty):
    # asks: list of (price, size), best (lowest) price first
    pass`,
          solution: `def slippage(asks, qty):
    cost, filled = 0.0, 0
    for price, size in asks:
        take = min(size, qty - filled)
        cost += take * price
        filled += take
        if filled == qty:
            break
    if filled < qty:
        raise ValueError("not enough liquidity")
    return cost - qty * asks[0][0]`,
          tests: `asks = [(10.00, 300), (10.01, 500), (10.03, 1000)]
out = slippage(asks, 1000)
assert out is not None, "the function returns nothing yet"
assert abs(out - 11) < 1e-6, f"1,000 shares cost $10,011 against $10,000 at the best ask: $11, got {out}"
assert abs(slippage(asks, 300)) < 1e-6, "an order that fits in the top level has no slippage"
assert abs(slippage(asks, 600) - 3) < 1e-6, f"600 shares: 300 at 10.00 and 300 at 10.01, $3 of slippage, got {slippage(asks, 600)}"
try:
    slippage(asks, 5000)
    raise AssertionError("an order larger than the whole book should raise ValueError")
except ValueError:
    pass`,
          why: 'Walk the levels, take what you need from each, and compare the total with what the same shares would have cost at the best ask. Running this on a snapshot of the book before you trade tells you what a market order would really cost.',
        },
      ],
    },
    {
      id: 'markets-orders',
      title: 'Order types and when they go wrong',
      summary: 'Market, limit, stop, stop-limit and bracket orders, time in force, and the way each one fails.',
      widget: 'markets-stops',
      text: [
        'A **market order** fills now at whatever prices the book offers. You are sure to be filled, but not of the price. A **limit order** names the worst price you accept: a buy limit at 10.00 pays 10.00 or less. You are sure of the price, but not of being filled. A buy limit placed above the current ask is **marketable**: it fills at once at the ask, with the limit as a ceiling.',
        'A **stop order** sits dormant until a trade happens at or through its **stop price**, and then becomes a market order. A sell stop below the price is the usual way to exit a long trade that goes wrong. Because it becomes a market order, it fills at the next available price: in a fast fall, or when the stock opens far below your stop, that can be much worse than the stop price.',
        'A **stop-limit** becomes a limit order instead when triggered. It caps the price you accept, but if the market goes straight through your limit you are not filled at all, and you still hold the losing position. One order type risks a bad price; the other risks no exit.',
        'A **bracket** order sends an entry together with two exits: a limit order at your profit target and a stop at your loss level. When one exit fills the other is cancelled (one-cancels-other, OCO). It puts your plan into the system before emotion gets a vote.',
        "**Time in force** says how long an order lives. DAY orders expire at the end of the session. GTC (good till cancelled) orders stay until filled or cancelled, though brokers set a limit on how long. IOC (immediate or cancel) fills what it can at once and cancels the rest. Outside regular hours many brokers accept only limit orders, and only if you mark them for the extended session. Rules differ by broker: read yours.",
      ],
      rules: [
        'Market: sure fill, unknown price. Limit: known worst price, maybe no fill.',
        'A stop is a trigger: once the stop price trades it sends a market order (or a limit, for a stop-limit).',
        'A sell stop can fill well below its price on a gap or in a fast market.',
        'A stop-limit can fail to fill and leave you in a losing trade.',
        'A bracket attaches a target and a stop to the entry; when one fills the other is cancelled.',
        'DAY orders die at the close; GTC orders live until filled or cancelled, within broker limits.',
      ],
      questions: [
        {
          kind: 'choice',
          id: 'markets-orders-1',
          ask: 'You bought a stock at 100 and placed a sell stop at 98. It closes at 99. After bad news overnight it opens at 94. Roughly where does your stop fill?',
          options: ['At 98, the stop price', 'Around 94, near the opening price', 'It does not fill, because 98 never traded', 'At 99, the last close'],
          answer: 1,
          why: 'The first trade at or below 98 is the opening trade near 94. That triggers the stop, which becomes a market order and fills there. A stop is a trigger, not a guaranteed price.',
        },
        {
          kind: 'number',
          id: 'markets-orders-2',
          ask: 'In that gap you held 200 shares bought at 100 and the stop filled at 94. How many dollars did you lose? (You had planned to lose $400.)',
          answer: 1200,
          check: '(100 - 94) * 200',
          why: '200 × $6 = $1,200, three times the planned loss. Size your positions knowing that a gap can skip your stop, especially when you hold overnight or through news.',
        },
        {
          kind: 'choice',
          id: 'markets-orders-3',
          ask: 'Same gap, but you used a stop-limit: stop 98, limit 97.50. The stock opens at 94 and keeps falling. What is your position at the end of the day?',
          options: [
            'Out at 97.50',
            'Out at 94',
            'Still long: the order triggered but no buyer paid 97.50 or more, so it never filled',
            'Out at 98',
          ],
          answer: 2,
          why: 'The stop-limit turned into a sell limit at 97.50, far above the market. It waits there unfilled while the loss grows. That is the trade-off: price control in exchange for the risk of no exit.',
        },
        {
          kind: 'choice',
          id: 'markets-orders-4',
          ask: 'A stock is quoted 10.00 x 10.02. You place a buy limit order at 10.05. What happens?',
          options: [
            'It waits until the price rises to 10.05',
            'It fills at once at 10.02 (or better), because your limit is above the ask',
            'It is rejected',
            'It fills at 10.05',
          ],
          answer: 1,
          why: 'A limit is the worst price you accept, not the price you ask for. Sellers are offering at 10.02, which is better than your limit, so you buy there. This is a marketable limit: a market order with a ceiling.',
        },
        {
          kind: 'choice',
          id: 'markets-orders-5',
          ask: 'You want to buy an option quoted 1.20 x 1.40 with little size showing. Which entry is most sensible?',
          options: [
            'A market order, to be sure of the fill',
            'A limit order near the mid, raised in small steps up to a price you decided in advance',
            'A buy stop at 1.40',
            'A GTC market order',
          ],
          answer: 1,
          why: 'On a wide, thin quote a market order pays the ask or worse. A limit near the mid often fills inside the spread, and the price you decided in advance stops you chasing.',
        },
        {
          kind: 'output',
          id: 'markets-orders-6',
          ask: 'A sell stop at 97.50 watches a list of trade prices. What does this print?',
          code: `prices = [100.0, 99.2, 98.6, 97.4, 96.9, 98.0]
stop = 97.5
for i, p in enumerate(prices):
    if p <= stop:
        print(i, p)
        break`,
          answer: '3 97.4',
          why: 'The first price at or below 97.50 is 97.4, at index 3. That is where the stop triggers. Note it is already 0.10 below the stop: the trade that triggers is often through the stop price.',
        },
        {
          kind: 'bug',
          id: 'markets-orders-7',
          ask: 'This should say whether a stop has been triggered by the latest trade price. Sell stops on long positions trigger when they should not.',
          code: `def stop_triggered(price, stop, side):
    # side "sell": a stop below the market, protecting a long position
    # side "buy": a stop above the market, protecting a short position
    if side == "sell":
        return price >= stop
    return price >= stop`,
          line: 5,
          fix: '        return price <= stop',
          why: 'A sell stop sits below the market and fires when the price falls to it. With `>=` it fires at once, since the price starts above the stop, closing every long trade the moment it opens.',
        },
        {
          kind: 'number',
          id: 'markets-orders-8',
          ask: 'A bracket order: buy 300 shares at 50.00, stop at 49.40, target at 51.20. What is the reward-to-risk ratio (the dollars at the target divided by the dollars at the stop)?',
          answer: 2,
          check: '(51.20 - 50.00) / (50.00 - 49.40)',
          why: 'Reward 1.20 × 300 = $360; risk 0.60 × 300 = $180; ratio 2. The share count cancels out. The stop risk is only the planned figure: a gap can make it larger.',
        },
        {
          kind: 'choice',
          id: 'markets-orders-9',
          ask: 'In the figure, choose Gap, set the stop to 98.0 and compare Stop with Stop-limit (limit 0.50 below the stop). What do you see?',
          options: [
            'Both fill at 98.0',
            'Stop fills at 96.2, well below 98; Stop-limit triggers but never fills, and the position ends at 95.7',
            'Stop does not trigger because 98.0 never traded',
            'Stop-limit fills at 97.5',
          ],
          answer: 1,
          why: 'The opening print at 96.2 triggers both. The stop becomes a market order and fills there. The stop-limit becomes a sell limit at 97.50 that the price never returns to. Neither got you out at 98.',
        },
        {
          kind: 'choice',
          id: 'markets-orders-10',
          ask: 'On Friday afternoon you place a DAY limit order to buy, and it does not fill. What happens to it on Monday morning?',
          options: ['It is still working', "It expired at the end of Friday's session", 'It turns into a market order at the open', 'It becomes a GTC order'],
          answer: 1,
          why: 'DAY orders end with the session. If you want an order to carry over you need GTC, and then you must remember it is there: forgotten GTC orders fill at surprising moments.',
        },
        {
          kind: 'design',
          id: 'markets-orders-11',
          ask: 'You plan a day trade in a liquid ETF with a set entry, stop and target. Choose the orders you will use and say what you will do if things go wrong.',
          why: 'Order choice is part of the plan. Deciding it in advance prevents the two classic mistakes: a market order into a thin book and no stop at all.',
          checklist: [
            { point: 'Entry with a limit or marketable limit, not a bare market order', why: 'It caps what you pay if the quote jumps as you click.' },
            { point: 'A bracket (target limit and stop) placed as soon as the entry fills', why: 'The exits are in the system even if you freeze or lose your connection.' },
            { point: 'A choice between stop and stop-limit, with the reason', why: 'Stop risks a worse price; stop-limit risks no exit. You should know which risk you are taking.' },
            { point: 'The order duration (DAY) so nothing is left open by accident', why: 'A forgotten order can open a position you never meant to hold.' },
            { point: 'What you do if the stop fills far worse than planned', why: 'Gaps and fast markets happen; the loss can exceed the plan and sizing must allow for it.' },
            { point: 'A backup way to reach the broker (phone, second device)', why: 'Platforms fail at busy times, which are the times you most need to exit.' },
          ],
        },
        {
          kind: 'write',
          id: 'markets-orders-12',
          ask: 'Model a sell stop on daily bars. Each bar is (open, high, low, close). Return the fill price of the first bar that triggers the stop, or `None` if none does. If a bar opens at or below the stop it fills at the open (a gap); if it only trades down to the stop during the bar, assume it fills at the stop.',
          starter: `def fill_sell_stop(bars, stop):
    # bars: list of (open, high, low, close)
    pass`,
          solution: `def fill_sell_stop(bars, stop):
    for o, h, l, c in bars:
        if o <= stop:
            return o
        if l <= stop:
            return stop
    return None`,
          tests: `bars = [(100, 101, 99.5, 100.5), (100.4, 100.8, 97.6, 98.2)]
out = fill_sell_stop(bars, 98.0)
assert out is not None, "the second bar trades down to 97.6, so the stop should fill"
assert out == 98.0, f"the bar trades through the stop during the day, so assume a fill at 98.0, got {out}"
gap = [(100, 101, 99.5, 99.0), (94.0, 95.0, 93.0, 93.5)]
assert fill_sell_stop(gap, 98.0) == 94.0, f"the bar opens at 94, below the stop: it fills at the open, got {fill_sell_stop(gap, 98.0)}"
assert fill_sell_stop([(100, 102, 99, 101)], 98.0) is None, "if no bar reaches the stop there is no fill"`,
          why: 'Checking the open before the low is what makes the model honest about gaps. A backtest that always fills stops at the stop price understates losses. Even this model is optimistic: in a fast market a fill can be below the stop within the bar too.',
        },
      ],
    },
    {
      id: 'markets-day',
      title: 'The trading day',
      summary: 'Premarket, the open, midday, the close and after hours: when volume is there and when spreads are wide.',
      widget: 'markets-session',
      text: [
        'US stock exchanges hold their **regular session** from 9:30 to 16:00 Eastern Time (ET), Monday to Friday, except holidays and a few early closes. Brokers also offer **premarket** and **after-hours** sessions (often from 4:00 or 7:00 to 9:30, and from 16:00 to 20:00 ET; some offer more), where volume is thin, spreads are wide and many brokers accept only limit orders. Most stock options trade only 9:30 to 16:00; options on SPY, QQQ and some indexes trade to 16:15. Exchanges have been adding extra option sessions, so at the time of writing (2026) check the hours with your broker.',
        'The **open** prices in everything that happened overnight at once. Volume is at its highest, the swings are widest and option spreads are often wider than later, while market makers settle on prices. Many experienced day traders let the first minutes pass before they act.',
        'From late morning to early afternoon volume falls and moves often turn choppy. In the last hour volume rises again into the **close**, when funds that trade at the closing price send their orders. Plot volume by time of day and you get a U shape.',
        'Scheduled news moves markets at known times: major US economic data such as CPI and the jobs report at 8:30 ET, before the open, and Federal Reserve rate decisions at 14:00 ET. Companies usually report earnings before the open or after the close, so their stocks often **gap**: open far from the previous close.',
        'Everything is quoted in Eastern Time. If you live elsewhere, convert, and remember that clocks change on different dates in different countries, so the gap between your time and New York can change by an hour for a few weeks each year.',
      ],
      rules: [
        'Regular session: 9:30 to 16:00 ET. Extended sessions are thinner and wider.',
        'Volume is highest at the open and the close and lowest around midday.',
        'The first minutes have the widest swings and often the widest option spreads.',
        'Know the calendar: 8:30 ET data, 14:00 ET Fed decisions, earnings dates.',
        'News outside the session shows up as a gap at the next open.',
      ],
      questions: [
        {
          kind: 'choice',
          id: 'markets-day-1',
          ask: 'At which of these times (Eastern Time) are spreads usually widest and liquidity thinnest in a large US stock?',
          options: ['7:15, premarket', '10:30', '13:00', '15:45'],
          answer: 0,
          why: 'Before the open few people trade, so quotes are wide and thin. Midday is quieter than the open but still the regular session, with market makers quoting tightly.',
        },
        {
          kind: 'number',
          id: 'markets-day-2',
          ask: 'You live in London, which for most of the year is 5 hours ahead of New York. At what hour, on a 24-hour clock, does the US regular session close in London? Give the hour, for example 15.',
          answer: 21,
          check: '16 + 5',
          why: '16:00 ET + 5 hours = 21:00 in London. For a few weeks in spring and autumn the gap is 4 hours, because the US and the UK change their clocks on different dates.',
        },
        {
          kind: 'number',
          id: 'markets-day-3',
          ask: 'How many 5-minute bars are there in one regular session?',
          answer: 78,
          check: '(16 * 60 - (9 * 60 + 30)) / 5',
          why: '9:30 to 16:00 is 6.5 hours, or 390 minutes, and 390 ÷ 5 = 78.',
        },
        {
          kind: 'number',
          id: 'markets-day-4',
          ask: 'In the figure, choose Option spread, set contracts to 10 and compare a trade at 9:30 with one at 12:30. How many more dollars does the round-trip spread cost at 9:30?',
          answer: 50,
          check: '(0.09 - 0.04) * 10 * 100',
          why: 'The spread is 0.09 at the open and 0.04 at midday in the figure: 0.05 × 10 contracts × 100 = $50 more. The same trade costs more at the open, and that cost must come out of the move.',
        },
        {
          kind: 'output',
          id: 'markets-day-5',
          ask: 'Made-up volume for each half hour of a session, starting at 9:30. What does this print?',
          code: `vol = [30, 18, 14, 12, 10, 9, 9, 10, 11, 13, 16, 22, 26]  # millions
first_hour = sum(vol[:2])
last_hour = sum(vol[-2:])
both = first_hour + last_hour
print(both, round(both / sum(vol) * 100))`,
          answer: '96 48',
          why: 'First hour 48, last hour 48, total 200. Two of the six and a half hours hold about half the volume: the U shape in numbers.',
        },
        {
          kind: 'choice',
          id: 'markets-day-6',
          ask: 'At 8:00 ET you send a market order to buy a stock that is up sharply on news. Your broker does not route market orders in the premarket. What happens?',
          options: [
            'It is rejected and nothing happens',
            'It waits and fills at the open, at whatever price the stock opens at, which you have not seen',
            'It fills at the 8:00 price',
            'It fills at the previous close',
          ],
          answer: 1,
          why: 'A queued market order is executed at the open, often at or near the most volatile price of the day. If you must act around the open, use a limit order so you decide the worst price. Some brokers reject such orders instead: know which yours does.',
        },
        {
          kind: 'choice',
          id: 'markets-day-7',
          ask: 'A much higher than expected inflation (CPI) number comes out at 8:30 ET. Where do you expect to see the effect first in stocks?',
          options: ['Not until 14:00', 'In premarket trading and in a gap at the 9:30 open', "Only in the next day's prices", 'Only in after-hours trading'],
          answer: 1,
          why: 'The number is released before the regular session, so the reaction appears in premarket prices and then in the opening price. Know the calendar before you plan a trade at the open.',
        },
        {
          kind: 'bug',
          id: 'markets-day-8',
          ask: 'This should say whether a time (Eastern) is in the regular session. It says 9:15 is in the session.',
          code: `def in_regular_session(hour, minute):
    # Eastern Time; the regular session is 9:30 to 16:00
    t = hour * 60 + minute
    return 9 * 60 <= t < 16 * 60`,
          line: 4,
          fix: '    return 9 * 60 + 30 <= t < 16 * 60',
          why: 'The session opens at 9:30, which is 570 minutes after midnight, not 540. Getting the boundary wrong would let a backtest or an alert act on premarket prices you could not have traded at regular-session spreads.',
        },
        {
          kind: 'choice',
          id: 'markets-day-9',
          ask: 'A company reports earnings at 16:05. What is a likely consequence for someone holding its options at the close?',
          options: [
            'Nothing until the next close',
            'The stock may open far from its close the next morning, and the options with it, before you can act during the regular session',
            'Options keep trading until 20:00 so you can always exit',
            'The exchange halts the stock for a week',
          ],
          answer: 1,
          why: 'Most stock options stop trading at 16:00, while the shares can move in after-hours trading. By the next open the price can have gapped, with no chance to exit in between.',
        },
        {
          kind: 'design',
          id: 'markets-day-10',
          ask: 'Write the part of your plan that says when in the day you will trade and when you will not.',
          why: 'Time of day changes spreads, volume and the size of moves. Deciding in advance keeps you out of the hours that do not suit your setups.',
          checklist: [
            { point: 'The times you are allowed to open new trades, in Eastern Time and in your own time zone', why: 'Converting in advance avoids clock mistakes, including the weeks when clocks change.' },
            { point: 'Whether you trade the first minutes, and if not, how long you wait', why: 'The open has the widest swings and spreads.' },
            { point: 'The scheduled events of the day and what you do around them', why: 'An 8:30 report or a 14:00 Fed decision can move prices more than a normal hour.' },
            { point: 'A last time to open new trades and a time by which day trades are closed', why: 'Positions left open by accident face overnight gaps.' },
            { point: 'A rule for premarket and after-hours (for example, no trading)', why: 'Thin sessions have wide spreads and few buyers when you want out.' },
            { point: 'Checking the holiday and early-close calendar', why: 'On an early close the last hour comes earlier than you expect.' },
          ],
        },
        {
          kind: 'number',
          id: 'markets-day-11',
          ask: 'An option is quoted with a 0.30 spread in the first minutes after the open and a 0.10 spread at midday. You trade 4 contracts, round trip. How many dollars more does the spread cost if you trade at the open?',
          answer: 80,
          check: '(0.30 - 0.10) * 4 * 100',
          why: '(0.30 − 0.10) × 4 × 100 = $80. If your typical profit on such a trade is $150, trading at the open spends half of it before the trade begins.',
        },
      ],
    },
    {
      id: 'markets-accounts',
      title: 'Accounts, margin and borrowing',
      summary: 'Cash and margin accounts, settlement, buying power, short selling, margin calls and the rules on day trading.',
      text: [
        'In a **cash account** you pay for everything in full. When you sell, the money **settles** one business day later (T+1, for US stocks and options at the time of writing in 2026). Buying with unsettled money and then selling that position before the money settles is a **good faith violation**; repeat it and the broker restricts the account. You cannot short or borrow in a cash account.',
        'A **margin account** lets you borrow from the broker against your positions. For stocks, the US initial requirement (Regulation T) is 50%: $10,000 of your money can buy $20,000 of stock. The minimum **maintenance** requirement is 25% of the position value, and many brokers ask for more. Your **equity** is what the positions are worth minus what you owe. In general you cannot borrow to buy options: you pay the full premium.',
        'Borrowing multiplies results. Exposure ÷ equity tells you by how much: $20,000 of stock on $10,000 of equity is 2 times, so a 10% fall in the stock is a 20% fall in your equity. If equity falls below the maintenance level you get a **margin call**: deposit money or sell. The broker may sell your positions without asking, at a time it chooses.',
        '**Short selling** means borrowing shares, selling them, and buying them back later, hoping to buy back lower. It needs a margin account, you pay to borrow, and the loss has no ceiling because a price can keep rising.',
        'For years, a US **pattern day trader** rule required $25,000 in a margin account for anyone making four or more day trades in five business days. At the time of writing (2026), FINRA has replaced it with intraday margin requirements: approved in April 2026 and effective from 4 June 2026, with brokers allowed to phase it in until 20 October 2027. Brokers may still apply the old limits during the phase-in, and can set stricter house rules. Rules differ outside the US. Ask your broker which rules apply to your account.',
      ],
      rules: [
        'Cash account: trade with settled money; US stock and option trades settle T+1 at the time of writing.',
        'Margin: borrowing against your positions. Reg T initial 50% for stocks; maintenance at least 25%, often more.',
        'Exposure ÷ equity is how many times your results are multiplied, losses as much as gains.',
        'A margin call is met by depositing or selling, and the broker may sell for you.',
        'A short sale has no limit to its loss.',
        'The pattern day trader rule was replaced in 2026, with a phase-in to October 2027: check which rules your broker applies.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'markets-accounts-1',
          ask: 'You have $10,000 of equity in a margin account. Under a 50% initial requirement, what is the largest amount of stock you can buy, in dollars?',
          answer: 20000,
          check: '10000 / 0.5',
          why: 'Your money must cover 50% of the purchase, so $10,000 supports $20,000. Your broker may allow less for some stocks.',
        },
        {
          kind: 'number',
          id: 'markets-accounts-2',
          ask: 'You buy $20,000 of SPY with $10,000 of your own money and $10,000 borrowed. SPY falls 10%. By what percentage has your equity fallen? Give a percentage, for example 15%.',
          answer: 0.2,
          check: '(20000 * 0.10) / 10000',
          why: 'The position loses $2,000, all of it from your $10,000: a 20% loss. Twice the exposure gives twice the move in your equity, in both directions.',
        },
        {
          kind: 'number',
          id: 'markets-accounts-3',
          ask: 'You owe the broker $10,000 against your stock. The maintenance requirement is 25%: equity must be at least 25% of the stock value. Below what stock value do you get a margin call? Give dollars to the nearest dollar.',
          answer: 13333.33,
          tol: 1,
          check: '10000 / (1 - 0.25)',
          hint: 'Equity = value − loan. Find the value where (value − loan) ÷ value = 0.25.',
          why: 'value − 10,000 = 0.25 × value gives value = 10,000 ÷ 0.75 ≈ $13,333. From $20,000 that is a fall of a third. With a higher house requirement, the call comes sooner.',
        },
        {
          kind: 'choice',
          id: 'markets-accounts-4',
          ask: 'In a cash account you sell a stock on Monday morning for $5,000. With that unsettled money you buy XYZ at noon, and you sell XYZ at 15:00 the same day. What is the problem?',
          options: [
            'None: the money was in your account',
            'A good faith violation: you sold XYZ before the money that paid for it had settled',
            'You broke the short selling rules',
            'Cash accounts cannot sell on Mondays',
          ],
          answer: 1,
          why: 'The Monday sale settles on Tuesday (T+1). Buying with it is allowed, but selling the new position before the money has settled is a violation. Repeated violations lead to restrictions such as 90 days of trading with settled cash only; the details vary by broker.',
        },
        {
          kind: 'number',
          id: 'markets-accounts-5',
          ask: 'You short 100 shares at $50. The stock rises to $80 and you buy back. How many dollars did you lose, before borrow costs?',
          answer: 3000,
          check: '100 * (80 - 50)',
          why: 'You sold at 50 and bought back at 80: 100 × $30 = $3,000. The most a short can make is the full $50 a share, if the stock goes to zero; the loss keeps growing as long as the price rises.',
        },
        {
          kind: 'choice',
          id: 'markets-accounts-6',
          ask: 'What is the largest possible loss on a short stock position?',
          options: ['The amount you received when you sold', 'Twice the amount you received', 'There is no fixed limit', 'The margin requirement'],
          answer: 2,
          why: 'There is no ceiling on how high a price can go, so there is none on the loss. Brokers can also recall borrowed shares and force you to buy back at a bad moment.',
        },
        {
          kind: 'choice',
          id: 'markets-accounts-7',
          ask: 'At the time of writing (2026), what is the state of the US pattern day trader rule with its $25,000 minimum?',
          options: [
            'Unchanged since 2001',
            'Replaced by FINRA intraday margin rules, effective June 2026 with a phase-in to October 2027; brokers may still apply their own limits',
            'Raised to $50,000',
            'It applies only to cash accounts',
          ],
          answer: 1,
          why: 'FINRA replaced the rule with intraday margin standards in 2026. During the phase-in some brokers may keep the old limits, and any broker can set stricter house rules. Check with yours before you plan to day trade.',
        },
        {
          kind: 'output',
          id: 'markets-accounts-8',
          ask: 'An account with a long SPY position and a short QQQ position. What does this print?',
          code: `equity = 25_000
positions = [("SPY", 60, 600.0), ("QQQ", -20, 480.0)]  # (ticker, shares, price)
gross = sum(abs(q) * p for _, q, p in positions)
print(gross, round(gross / equity, 2))`,
          answer: '45600.0 1.82',
          why: 'Gross exposure counts long and short positions alike: 36,000 + 9,600 = 45,600, which is 1.82 times the equity. A short is exposure too, not a reduction of it.',
        },
        {
          kind: 'bug',
          id: 'markets-accounts-9',
          ask: 'This should return the stock value at which equity falls to the maintenance level. For a $10,000 loan at 25% it returns $40,000, which would mean a margin call at once.',
          code: `def margin_call_value(loan, maintenance):
    # the value at which (value - loan) / value == maintenance
    return loan / maintenance`,
          line: 3,
          fix: '    return loan / (1 - maintenance)',
          why: 'Solve value − loan = maintenance × value: value = loan ÷ (1 − maintenance). For $10,000 and 25% that is $13,333.',
        },
        {
          kind: 'choice',
          id: 'markets-accounts-10',
          ask: 'You have $10,000 in a margin account and want to buy call options. In general, how much premium can you pay?',
          options: ['$20,000, using margin', '$10,000: bought options are paid in full', '$40,000', '$2,500'],
          answer: 1,
          why: 'Bought options generally cannot be bought with borrowed money: you pay the whole premium. Margin buying power for stocks does not carry over to option purchases.',
        },
        {
          kind: 'write',
          id: 'markets-accounts-11',
          ask: 'Write a function that returns how far (as a fraction) a long stock position bought with `equity` of your money and `loan` of borrowed money can fall before a margin call at the given maintenance level.',
          starter: `def max_drop_before_call(equity, loan, maintenance):
    # the position is worth equity + loan at the start
    # a call comes when (value - loan) / value falls to maintenance
    pass`,
          solution: `def max_drop_before_call(equity, loan, maintenance):
    start = equity + loan
    call_value = loan / (1 - maintenance)
    return 1 - call_value / start`,
          tests: `out = max_drop_before_call(10000, 10000, 0.25)
assert out is not None, "the function returns nothing yet"
assert abs(out - 1 / 3) < 1e-9, f"$20,000 of stock with $10,000 borrowed can fall a third before a call at 25%, got {out}"
assert abs(max_drop_before_call(10000, 0, 0.25) - 1) < 1e-9, "with no loan there is never a margin call: the position can fall 100%"
assert max_drop_before_call(10000, 10000, 0.40) < max_drop_before_call(10000, 10000, 0.25), "a higher maintenance level means a call comes sooner"`,
          why: 'The call value is loan ÷ (1 − maintenance); compare it with the starting value. More borrowing or a stricter broker both shrink the room before a call. Knowing the number in advance is better than learning it from a margin call.',
        },
        {
          kind: 'design',
          id: 'markets-accounts-12',
          ask: 'You have $5,000 and want to start learning to day trade options. Plan how you would set up your account.',
          why: 'The account type decides what can go wrong and how fast. A small account in the wrong setup can be restricted or wiped out by rules the trader never read.',
          checklist: [
            { point: 'Paper trade first, with the same broker platform if possible', why: 'You learn the orders and the rules without paying for mistakes.' },
            { point: 'A cash account, or a margin account used without borrowing, and why', why: 'Borrowing multiplies losses; a cash account cannot owe the broker money.' },
            { point: 'How settlement (T+1) limits the trades you can make with the same cash', why: 'Good faith violations lead to restrictions.' },
            { point: 'Which day trading rules your broker applies at the time you open the account', why: 'The pattern day trader rule is being phased out until October 2027, and house rules vary.' },
            { point: 'The option approval level you ask for, starting with bought options and defined-risk trades', why: 'It keeps undefined-risk trades out of reach while you learn.' },
            { point: 'Tax and regulation where you live, checked with a professional', why: 'They differ by country and this course does not give tax advice.' },
          ],
        },
      ],
    },
    {
      id: 'markets-costs',
      title: 'What a trade costs',
      summary: 'Commissions, fees, the spread and slippage, and how much of a small edge they eat.',
      widget: 'markets-costs',
      text: [
        'Every round trip pays four things. **Commission**: many US brokers charge nothing for stock trades, and a per-contract fee for options; $0.65 per contract per side is common at the time of writing and is used in the examples here, but check your own. **Fees**: exchange, clearing and regulatory charges of a few cents per contract or a tiny charge on stock sales. The **spread**, which you cross going in and coming out. And **slippage**, the extra you lose to price movement between deciding and filling.',
        'Option costs are per contract, so they scale with how many contracts you trade, not with the dollar size. Three contracts at $0.65 each way is 3 × 0.65 × 2 = $3.90 in commission. If the option is quoted 0.10 wide and you buy at the ask and sell at the bid, the spread adds 0.10 × 100 × 3 = $30. Together $33.90 on a trade that might aim to make $100.',
        'Compare costs with the profit you expect per trade, not with your account size. $34 is tiny against a $25,000 account and enormous against a $100 target. Cheap options are hit hardest: a 0.05 spread is 2.5% of a $2.00 option and 25% of a $0.20 one.',
        { code: `win, loss, cost = 100, 100, 10   # average win and loss before costs, cost per trade
breakeven = (loss + cost) / (win + loss)
print(breakeven)   # 0.55: a coin-flip trade now needs 55% winners` },
        'Costs raise the win rate you need. With wins and losses of $100 and $10 of cost per trade, you need to win 55% of the time to break even, as the code shows. Trade often and the costs pile up: four trades a day at $12.50 is $12,500 over a year of about 250 trading days. Record your fills against the mid when you enter, so you measure your real costs instead of guessing them.',
      ],
      rules: [
        'A round trip pays commission and fees on both sides, the full spread, and any slippage.',
        'Option costs are per contract: they grow with the number of contracts.',
        'Judge costs against the profit you expect per trade, not against the account.',
        'Costs raise the win rate you need: breakeven = (average loss + cost) ÷ (average win + average loss).',
        'Measure your real costs: record each fill against the mid at the time.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'markets-costs-1',
          ask: 'You trade 3 option contracts, in and out, at $0.65 per contract per side. What is the total commission in dollars?',
          answer: 3.9,
          check: '3 * 0.65 * 2',
          why: '3 contracts × $0.65 × 2 sides = $3.90. Forgetting the exit side halves the cost on paper and not in reality.',
        },
        {
          kind: 'number',
          id: 'markets-costs-2',
          ask: 'Same 3 contracts. The option is quoted 0.10 wide and you buy at the ask and sell at the bid, with no change in the mid. What is the total cost of the round trip, commission included, in dollars?',
          answer: 33.9,
          check: '0.10 * 100 * 3 + 3 * 0.65 * 2',
          why: 'Spread: 0.10 × 100 × 3 = $30. Commission: $3.90. Total $33.90. The spread, not the commission, is the main cost here.',
        },
        {
          kind: 'number',
          id: 'markets-costs-3',
          ask: 'You expect this trade to make $120 before costs. What share of that do the $33.90 of costs take? Give a percentage, for example 12%.',
          answer: 0.2825,
          tol: 0.002,
          check: '33.90 / 120',
          why: '33.90 ÷ 120 ≈ 28%. More than a quarter of the expected profit is gone before the market does anything.',
        },
        {
          kind: 'number',
          id: 'markets-costs-4',
          ask: 'Your average win and average loss are both $100 before costs, and each trade costs $10. What win rate do you need to break even? Give a percentage, for example 52%.',
          answer: 0.55,
          tol: 0.002,
          check: '(100 + 10) / (100 + 100)',
          why: 'Each win nets $90 and each loss costs $110. Breakeven needs p × 90 = (1 − p) × 110, so p = 110 ÷ 200 = 55%. Without costs it would be 50%.',
        },
        {
          kind: 'choice',
          id: 'markets-costs-5',
          ask: 'Two options both have a 0.05 spread. One costs 0.20, the other 2.00. For a quick round trip, which is cheaper to trade as a share of the money you put in?',
          options: ['The 0.20 option, because it is cheaper', 'The 2.00 option: 0.05 is 2.5% of it but 25% of the 0.20 option', 'They cost the same, because the spread is the same', 'It depends only on the commission'],
          answer: 1,
          why: 'The same spread is ten times larger as a share of the cheaper option, and per-contract commission is too. Cheap options look affordable and are expensive to trade.',
        },
        {
          kind: 'output',
          id: 'markets-costs-6',
          ask: 'What does this print?',
          code: `trades_per_day = 4
cost_per_trade = 12.50
days = 250
print(trades_per_day * cost_per_trade * days)`,
          answer: '12500.0',
          why: '4 × 12.50 × 250 = $12,500 a year in costs. Your trading has to make that much before it makes anything for you.',
        },
        {
          kind: 'bug',
          id: 'markets-costs-7',
          ask: 'This should return the dollar cost of an option round trip: commission on both sides plus the full spread. For 3 contracts at $0.65 and a 0.11 spread it gives $34.95 instead of $36.90.',
          code: `def round_trip_cost(contracts, commission, spread):
    # commission is per contract per side; half the spread is paid going in, half coming out
    fees = contracts * commission
    return fees + contracts * spread * 100`,
          line: 3,
          fix: '    fees = 2 * contracts * commission',
          why: 'Commission is charged when you open and again when you close. Counting it once understates the cost on every trade.',
        },
        {
          kind: 'choice',
          id: 'markets-costs-8',
          ask: 'In the figure, set the gross edge to $10 per contract per trade, the spread to 0.10, commission to 0.65 and slippage to 0. What is the net result per trade per contract?',
          options: ['+$10.00', '+$8.70', '−$1.30', '$0.00'],
          answer: 2,
          why: 'Spread 0.10 × 100 = $10, commission 2 × 0.65 = $1.30: $11.30 of costs against $10 of edge, so −$1.30. A real edge, traded through a wide spread, becomes a steady loss.',
        },
        {
          kind: 'choice',
          id: 'markets-costs-9',
          ask: 'Your paper trading shows a profit, but your first month of real trading with the same rules loses money. Which cost is most often missing from paper results?',
          options: [
            'Income tax',
            'Realistic fills: paper platforms often fill at the mid or the last price, while real orders pay the spread and slippage',
            'Data fees',
            'Exchange holidays',
          ],
          answer: 1,
          why: 'Many simulators assume fills that a real order in a real book would not get. Compare your paper fills with the bid and ask at the time and adjust before trusting paper results.',
        },
        {
          kind: 'write',
          id: 'markets-costs-10',
          ask: 'Write a function that returns the win rate needed to break even, given the average win and the average loss before costs (both positive) and the cost of each trade.',
          starter: `def breakeven_win_rate(avg_win, avg_loss, cost):
    # a win nets avg_win - cost, a loss costs avg_loss + cost
    pass`,
          solution: `def breakeven_win_rate(avg_win, avg_loss, cost):
    return (avg_loss + cost) / (avg_win + avg_loss)`,
          tests: `out = breakeven_win_rate(100, 100, 0)
assert out is not None, "the function returns nothing yet"
assert abs(out - 0.5) < 1e-9, f"equal wins and losses with no costs need 50%, got {out}"
assert abs(breakeven_win_rate(100, 100, 10) - 0.55) < 1e-9, f"$10 of cost on $100 wins and losses needs 55%, got {breakeven_win_rate(100, 100, 10)}"
assert abs(breakeven_win_rate(200, 100, 15) - 115 / 300) < 1e-9, "wins of 200, losses of 100 and a cost of 15 need 115 / 300"`,
          why: 'Set p × (win − cost) = (1 − p) × (loss + cost) and solve: p = (loss + cost) ÷ (win + loss). Every dollar of cost moves the bar up, and the smaller the average win and loss, the more it moves.',
        },
        {
          kind: 'design',
          id: 'markets-costs-11',
          ask: 'Design how you will measure your real trading costs over your first 20 trades, paper or real.',
          why: 'Costs you estimate are usually lower than costs you pay. Measured costs tell you which setups and instruments can still make money after them.',
          checklist: [
            { point: 'Record the bid, ask and mid at the moment of each entry and exit', why: 'Your fill against the mid is your real spread cost and slippage.' },
            { point: 'Record commission and fees from the broker statement, not from memory', why: 'Small fees add up and are easy to forget.' },
            { point: 'Compute cost per trade in dollars and as a share of the average win', why: 'That is the number that decides whether an edge survives.' },
            { point: 'Separate costs by instrument and time of day', why: 'The same setup can be affordable at midday and not at the open.' },
            { point: 'Recompute your breakeven win rate with the measured costs', why: 'It tells you what your setups must achieve.' },
            { point: 'If you paper trade, compare paper fills with the real quotes', why: 'Simulated fills are often too kind.' },
          ],
        },
      ],
    },
    {
      id: 'markets-lab',
      title: 'Lab: a limit order book in Python',
      summary: 'Build a small order book: add orders, read the quote, fill market and limit orders, and measure average fill and slippage.',
      text: [
        'The order book is where every trade in this course happens, so building one is the best way to see why fills differ from quotes. In this lab you write a small book in plain Python, one function at a time.',
        'The book is a dictionary with two lists of `[price, size]` levels: `"bids"` sorted from the highest price down and `"asks"` from the lowest price up. The first entry of each list is the top of the book.',
        'You will add resting limit orders, read the quote (bid, ask, mid and spread), fill market orders that walk the book, report the average fill and the slippage, and match a limit order that partly fills and partly rests. A real exchange also keeps the time order of orders at each price, handles cancels and much more. The last step asks what you would add.',
        'Each step repeats what it needs from the steps before, so every step runs on its own.',
      ],
      rules: [
        'Bids are kept highest first, asks lowest first: the top of the book is the first entry.',
        'Orders at the same price join one level; a level that is fully taken is removed.',
        'A market order takes the best level first and walks on until it is filled or the book is empty.',
        'Average fill = dollars ÷ shares; slippage is measured against the price you expected, signed so that a cost is positive.',
        'A limit order fills only at its price or better; whatever is left rests in the book.',
      ],
      questions: [
        {
          kind: 'write',
          id: 'markets-lab-1',
          ask: 'Step 1: add a resting limit order. A buy goes on the bid side, a sell on the ask side. An order at a price that already has a level adds to its size. Keep bids sorted highest first and asks lowest first, and return the book.',
          starter: `def add_order(book, side, price, size):
    # book: {"bids": [[price, size], ...], "asks": [[price, size], ...]}
    # side: "buy" or "sell"
    pass`,
          solution: `def add_order(book, side, price, size):
    levels = book["bids"] if side == "buy" else book["asks"]
    for level in levels:
        if level[0] == price:
            level[1] += size
            return book
    levels.append([price, size])
    levels.sort(key=lambda lv: -lv[0] if side == "buy" else lv[0])
    return book`,
          tests: `book = {"bids": [], "asks": []}
out = add_order(book, "buy", 9.98, 100)
assert out is not None, "the function returns nothing yet: return the book"
add_order(book, "buy", 9.99, 200)
add_order(book, "buy", 9.97, 300)
assert book["bids"] == [[9.99, 200], [9.98, 100], [9.97, 300]], f"bids should be highest first, got {book['bids']}"
add_order(book, "sell", 10.02, 400)
add_order(book, "sell", 10.01, 100)
assert book["asks"] == [[10.01, 100], [10.02, 400]], f"asks should be lowest first, got {book['asks']}"
add_order(book, "sell", 10.01, 50)
assert book["asks"] == [[10.01, 150], [10.02, 400]], f"an order at an existing price adds to that level, got {book['asks']}"
assert book["bids"][0] == [9.99, 200], "a sell order should not touch the bids"`,
          why: 'Two sorted lists are all a simple book needs. Keeping the best price first means every later function reads the top of the book as `[0]`.',
        },
        {
          kind: 'write',
          id: 'markets-lab-2',
          ask: 'Step 2: the quote. Return `(bid, ask, mid, spread)` from the top of the book. If either side is empty, that price is `None` and so are the mid and the spread.',
          starter: `def quote(book):
    pass`,
          solution: `def quote(book):
    bid = book["bids"][0][0] if book["bids"] else None
    ask = book["asks"][0][0] if book["asks"] else None
    if bid is None or ask is None:
        return bid, ask, None, None
    return bid, ask, (bid + ask) / 2, ask - bid`,
          tests: `book = {"bids": [[9.99, 200], [9.98, 100]], "asks": [[10.01, 150], [10.02, 400]]}
out = quote(book)
assert out is not None, "the function returns nothing yet"
bid, ask, mid, spread = out
assert bid == 9.99 and ask == 10.01, f"the best bid is 9.99 and the best ask 10.01, got {bid} and {ask}"
assert abs(mid - 10.00) < 1e-9, f"the mid is 10.00, got {mid}"
assert abs(spread - 0.02) < 1e-9, f"the spread is 0.02, got {spread}"
assert quote({"bids": [[9.99, 200]], "asks": []}) == (9.99, None, None, None), "with no asks there is no ask, mid or spread"`,
          why: 'The quote is only the first entry of each side. An empty side happens in thin markets and after hours, and code that assumes both sides exist will crash or, worse, compute a mid from nothing.',
        },
        {
          kind: 'write',
          id: 'markets-lab-3',
          ask: 'Step 3: a market buy. Take shares from the asks, best first, until the order is filled or the asks run out. Remove levels that are used up, shrink a level that is partly used, and return the list of fills as `(price, size)`.',
          starter: `def market_buy(book, qty):
    fills = []
    # take from book["asks"][0] until qty is filled or there are no asks
    return fills`,
          solution: `def market_buy(book, qty):
    fills = []
    asks = book["asks"]
    while qty > 0 and asks:
        price, size = asks[0]
        take = min(size, qty)
        fills.append((price, take))
        qty -= take
        if take == size:
            asks.pop(0)
        else:
            asks[0][1] = size - take
    return fills`,
          tests: `book = {"bids": [[9.99, 200]], "asks": [[10.00, 300], [10.01, 500], [10.03, 1000]]}
out = market_buy(book, 1000)
assert out is not None, "the function returns nothing yet"
assert out == [(10.00, 300), (10.01, 500), (10.03, 200)], f"1,000 shares take 300, 500 and 200 from three levels, got {out}"
assert book["asks"] == [[10.03, 800]], f"the first two levels are gone and 800 remain at 10.03, got {book['asks']}"
book = {"bids": [], "asks": [[10.00, 100]]}
assert market_buy(book, 250) == [(10.00, 100)], "if the book runs out, fill what is there"
assert book["asks"] == [], "an emptied level is removed"
assert book["bids"] == [], "a buy should not touch the bids"`,
          why: 'This is walking the book in code. The fills list is the record of what really happened, level by level, and the book that remains is thinner for the next trader.',
        },
        {
          kind: 'bug',
          id: 'markets-lab-4',
          ask: 'Step 4: a market sell. It should sell into the bids, best first. Instead it fills at the ask prices and leaves the bids untouched.',
          code: `def market_sell(book, qty):
    fills = []
    bids = book["asks"]
    while qty > 0 and bids:
        price, size = bids[0]
        take = min(size, qty)
        fills.append((price, take))
        qty -= take
        if take == size:
            bids.pop(0)
        else:
            bids[0][1] = size - take
    return fills`,
          line: 3,
          fix: '    bids = book["bids"]',
          why: 'A seller trades with buyers, who wait on the bid side. Selling "at the ask" would credit you with prices nobody was willing to pay, and a simulator with this bug would show every round trip as free.',
        },
        {
          kind: 'write',
          id: 'markets-lab-5',
          ask: 'Step 5: the fill report. From a list of fills, return `(filled, average price, slippage in dollars)`. Slippage is measured against `expected` and is positive when it costs you: for a buy, paying more than expected; for a sell, receiving less. With no fills return `(0, None, 0.0)`.',
          starter: `def fill_report(fills, expected, side):
    # fills: list of (price, size); side: "buy" or "sell"
    pass`,
          solution: `def fill_report(fills, expected, side):
    filled = sum(size for _, size in fills)
    if filled == 0:
        return 0, None, 0.0
    dollars = sum(price * size for price, size in fills)
    avg = dollars / filled
    slip = (avg - expected) * filled if side == "buy" else (expected - avg) * filled
    return filled, avg, slip`,
          tests: `out = fill_report([(10.00, 300), (10.01, 500), (10.03, 200)], 10.00, "buy")
assert out is not None, "the function returns nothing yet"
filled, avg, slip = out
assert filled == 1000, f"1,000 shares were filled, got {filled}"
assert abs(avg - 10.011) < 1e-9, f"the average fill is 10.011, got {avg}"
assert abs(slip - 11) < 1e-6, f"slippage against 10.00 is $11, got {slip}"
filled, avg, slip = fill_report([(50.00, 200), (49.98, 200), (49.95, 200)], 50.00, "sell")
assert abs(slip - 14) < 1e-6, f"selling 600 for $29,986 instead of $30,000 is $14 of slippage, a cost, so positive: got {slip}"
assert fill_report([], 10.0, "buy") == (0, None, 0.0), "no fills: (0, None, 0.0)"`,
          why: 'One sign convention for both sides (positive is a cost) lets you add slippage across all your trades. Reported per trade, it is the number that tells you whether your orders fit the market you trade.',
        },
        {
          kind: 'write',
          id: 'markets-lab-6',
          ask: 'Step 6: a limit buy. Fill against asks at or below the limit price, best first. Whatever is left rests on the bid side at the limit price (use `add_order`). Return the fills.',
          starter: `def add_order(book, side, price, size):
    levels = book["bids"] if side == "buy" else book["asks"]
    for level in levels:
        if level[0] == price:
            level[1] += size
            return book
    levels.append([price, size])
    levels.sort(key=lambda lv: -lv[0] if side == "buy" else lv[0])
    return book

def limit_buy(book, limit, qty):
    fills = []
    # take asks priced at or below limit; rest the remainder as a bid at limit
    return fills`,
          solution: `def add_order(book, side, price, size):
    levels = book["bids"] if side == "buy" else book["asks"]
    for level in levels:
        if level[0] == price:
            level[1] += size
            return book
    levels.append([price, size])
    levels.sort(key=lambda lv: -lv[0] if side == "buy" else lv[0])
    return book

def limit_buy(book, limit, qty):
    fills = []
    asks = book["asks"]
    while qty > 0 and asks and asks[0][0] <= limit:
        price, size = asks[0]
        take = min(size, qty)
        fills.append((price, take))
        qty -= take
        if take == size:
            asks.pop(0)
        else:
            asks[0][1] = size - take
    if qty > 0:
        add_order(book, "buy", limit, qty)
    return fills`,
          tests: `book = {"bids": [[9.99, 200]], "asks": [[10.00, 300], [10.01, 500], [10.03, 1000]]}
out = limit_buy(book, 10.01, 1000)
assert out is not None, "the function returns nothing yet"
assert out == [(10.00, 300), (10.01, 500)], f"only asks at or below 10.01 fill: 300 and 500, got {out}"
assert book["bids"] == [[10.01, 200], [9.99, 200]], f"the 200 left over rest as the new best bid at 10.01, got {book['bids']}"
assert book["asks"] == [[10.03, 1000]], f"the ask at 10.03 is above the limit and stays, got {book['asks']}"
book = {"bids": [], "asks": [[10.05, 100]]}
assert limit_buy(book, 10.00, 100) == [], "a limit below the best ask fills nothing"
assert book["bids"] == [[10.00, 100]], "and rests in full on the bid side"`,
          why: 'This is the limit order trade-off in code: it never pays more than 10.01, and part of it may wait unfilled. The leftover becomes the new best bid, which is how resting orders get into the book in the first place.',
        },
        {
          kind: 'output',
          id: 'markets-lab-7',
          ask: 'Step 7: put it together. What does this print?',
          code: `book = {"bids": [[49.98, 300], [49.97, 500]], "asks": [[50.00, 200], [50.02, 400], [50.05, 1000]]}

def market_buy(book, qty):
    fills = []
    while qty > 0 and book["asks"]:
        price, size = book["asks"][0]
        take = min(size, qty)
        fills.append((price, take))
        qty -= take
        if take == size:
            book["asks"].pop(0)
        else:
            book["asks"][0][1] -= take
    return fills

fills = market_buy(book, 500)
avg = sum(p * s for p, s in fills) / sum(s for _, s in fills)
print(len(fills), round(avg, 3), book["asks"][0])`,
          answer: '2 50.012 [50.02, 100]',
          why: '200 at 50.00 and 300 at 50.02: two fills, $25,006 for 500 shares, an average of 50.012. The new best ask is 50.02 with 100 left, so the spread is now 0.04 instead of 0.02: your order made the market wider for the next buyer.',
        },
        {
          kind: 'design',
          id: 'markets-lab-8',
          ask: 'Step 8: your book is a toy. List what you would add to make it a more honest simulator for testing your own order handling.',
          why: 'A simulator is useful only if its fills are no kinder than real ones. Knowing what is missing tells you how far to trust its results.',
          checklist: [
            { point: 'Time priority: orders at the same price fill first come, first served, with order ids', why: 'Your resting order waits behind everyone who was there before you.' },
            { point: 'Cancelling and changing orders', why: 'Most resting orders are cancelled, not filled, and the book changes all the time.' },
            { point: 'Quotes that fade or move after your order arrives', why: 'Displayed size can vanish when prices move fast.' },
            { point: 'Commissions and fees on each fill', why: 'A round trip that ignores costs looks better than it is.' },
            { point: 'Latency: a delay between your decision and the order reaching the book', why: 'The quote you saw is often not the quote you meet.' },
            { point: 'Stop and stop-limit orders that trigger on trades', why: 'They show the gap and no-fill risks from the order types lesson.' },
            { point: 'Hidden size and tick sizes (prices on a grid of allowed steps)', why: 'Real books are not exactly what is displayed.' },
          ],
        },
      ],
    },
  ],
}
