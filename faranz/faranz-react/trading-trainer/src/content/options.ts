import type { Module } from '../types'

export const options: Module = {
  id: 'options',
  title: 'Options from zero',
  summary: 'What a call and a put are, what they are worth at expiry, what buying and selling them can win or lose, and how to read a chain before you place an order.',
  lessons: [
    {
      id: 'options-basics',
      title: 'Calls and puts',
      summary: 'The right to buy, the right to sell, and the four numbers that define every contract.',
      text: [
        'An option is a contract on an **underlying**, such as SPY or AAPL. A **call** gives its buyer the right, but not the duty, to buy the underlying at a fixed price, the **strike**, up to a date, the **expiry**. A **put** gives its buyer the right to sell at the strike. The buyer pays for that right. The price is the **premium**.',
        'On the other side is the **seller** (also called the writer). The seller receives the premium and takes on the duty: a call seller must sell at the strike if the buyer uses the right, a put seller must buy. Every contract has both sides. Before costs, what the buyer makes the seller loses, and the other way round.',
        'Premiums are quoted per share, but one US equity option contract covers **100 shares**. A premium of 2.50 costs $250 per contract, plus fees. Forgetting the 100 is the first mistake almost everyone makes when sizing a trade.',
        'A call gains when the underlying rises, a put gains when it falls. "SPY 500 call, Friday" names the underlying, the strike, the kind and the expiry. Those four facts, plus the premium, fully describe what you hold.',
        'A bought option can lose its whole premium, and often does. Most retail day traders lose money, and the spread and fees from the markets module apply to every option trade. Start on paper, and when you do trade, start with one contract.',
      ],
      rules: [
        'Call: the right to buy at the strike. Put: the right to sell at the strike.',
        'The buyer pays the premium and has a right. The seller receives it and has a duty.',
        'One contract is 100 shares: dollars = premium × 100 × contracts.',
        'Calls profit from a rise, puts from a fall.',
        'A bought option can go to zero. Size it as money you can lose in full.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'options-basics-1',
          ask: 'You buy 3 calls at a premium of 1.85. How much do you pay, in dollars, before fees?',
          answer: 555,
          check: '1.85 * 100 * 3',
          why: 'Premiums are per share and each contract covers 100 shares: 1.85 × 100 × 3 = $555. Reading 1.85 as the price of the whole trade understates it a hundredfold.',
        },
        {
          kind: 'choice',
          id: 'options-basics-2',
          ask: 'You buy one AAPL 180 put. What have you bought?',
          options: [
            'The duty to buy 100 AAPL shares at 180 if asked',
            'The right to sell 100 AAPL shares at 180 until expiry',
            'The right to buy 100 AAPL shares at 180 until expiry',
            '100 AAPL shares with a stop at 180',
          ],
          answer: 1,
          why: 'A put is the right to sell at the strike. The duty to buy at 180 belongs to whoever sold you the put. You choose whether to use the right; the seller has no choice.',
        },
        {
          kind: 'choice',
          id: 'options-basics-3',
          ask: 'You sold one QQQ 450 call. The buyer exercises it. What must you do?',
          options: ['Buy 100 QQQ shares at 450', 'Nothing, you already kept the premium', 'Sell 100 QQQ shares at 450', 'Pay the buyer the premium back'],
          answer: 2,
          why: 'The call buyer has the right to buy at 450, so the seller must deliver 100 shares at 450, whatever QQQ trades at. If you do not own the shares you end up short them.',
        },
        {
          kind: 'number',
          id: 'options-basics-4',
          ask: 'You buy 2 calls at 3.20 and later sell them at 4.10. What is your profit in dollars, before fees?',
          answer: 180,
          check: '(4.10 - 3.20) * 100 * 2',
          why: 'The premium rose by 0.90 per share. Times 100 shares and 2 contracts that is $180.',
        },
        {
          kind: 'output',
          id: 'options-basics-5',
          ask: 'What does this print?',
          code: `premium = 0.45
contracts = 4
cost = premium * 100 * contracts
print(round(cost, 2))`,
          answer: '180.0',
          why: '0.45 × 100 × 4 = 180. A cheap-looking 0.45 is still $45 a contract. The `round` hides the tiny float error in 0.45 × 100.',
        },
        {
          kind: 'bug',
          id: 'options-basics-6',
          ask: 'This should return the dollar cost of buying some option contracts, fees included. It says 4 contracts at 2.00 cost $10.60.',
          code: `def total_cost(premium, contracts, fee_per_contract):
    premium_paid = premium * contracts
    fees = fee_per_contract * contracts
    return premium_paid + fees`,
          line: 2,
          fix: '    premium_paid = premium * 100 * contracts',
          why: 'The premium is quoted per share. Without the multiplier of 100 the premium paid is a hundred times too small: 4 contracts at 2.00 cost $800, plus fees.',
        },
        {
          kind: 'choice',
          id: 'options-basics-7',
          ask: 'You expect MSFT to fall over the next two weeks and you want to risk no more than what you pay up front. Which position fits?',
          options: ['Buy a call', 'Buy a put', 'Sell a put', 'Sell a call without owning the shares'],
          answer: 1,
          why: 'A bought put gains when the stock falls, and the most it can lose is the premium. Selling a call also profits from a fall, but its loss is open-ended if the stock rises. Selling a put is a bet on the stock not falling.',
        },
        {
          kind: 'number',
          id: 'options-basics-8',
          ask: 'You buy 5 contracts at 1.00 and your broker charges $0.65 per contract. How much cash leaves your account, in dollars?',
          answer: 503.25,
          check: '5 * 100 * 1.00 + 5 * 0.65',
          why: '5 × 100 × 1.00 = $500 of premium plus 5 × 0.65 = $3.25 of fees. You pay a fee again when you sell, so the round trip costs $6.50 in fees.',
        },
        {
          kind: 'choice',
          id: 'options-basics-9',
          ask: 'You own a call. The stock is below the strike on the last day. Who decides whether the call is exercised?',
          options: ['The seller, who will ask you to buy', 'You, the buyer: you can exercise or let it expire', 'The exchange, which always exercises', 'Nobody: it turns into shares automatically'],
          answer: 1,
          why: 'The buyer holds the right. Exercising a call to buy above the market price would lose money, so you let it expire. The seller never chooses; the seller only responds.',
        },
        {
          kind: 'design',
          id: 'options-basics-10',
          ask: 'You want to place your first option trade, on paper. Write down what you must know about the contract and the trade before you click buy.',
          checklist: [
            { point: 'The underlying, call or put, strike and expiry', why: 'These four facts define the contract. Getting one wrong (a put for a call, next month for this week) is a common and costly click.' },
            { point: 'The premium and the total in dollars: premium × 100 × contracts', why: 'The multiplier turns a small-looking number into the real amount at risk.' },
            { point: 'The most you can lose', why: 'For a bought option it is the whole premium plus fees. Write the number, not a vague word.' },
            { point: 'Fees on the way in and on the way out', why: 'Costs come off every trade and matter most on cheap options.' },
            { point: 'What has to happen to the underlying, and by when, for the trade to make money', why: 'An option has a deadline. A view without a time frame does not fit an option.' },
            { point: 'That it is on paper first, then one contract', why: 'Mistakes are cheapest before real money is involved, and smallest with the smallest size.' },
          ],
          why: 'An option trade is fully described by a few numbers. Writing them down before the order turns the trade into something you can check afterwards.',
        },
      ],
    },
    {
      id: 'options-moneyness',
      title: 'Intrinsic and extrinsic value',
      summary: 'Split a premium into what it is worth now and what you pay for time, and name where the strike sits.',
      widget: 'options-value',
      text: [
        "An option's premium has two parts. **Intrinsic value** is what you would get by exercising right now: for a call `max(S − K, 0)`, for a put `max(K − S, 0)`, where S is the stock price and K the strike. It is never negative, because you do not have to exercise.",
        '**Extrinsic value** (time value) is the rest: premium minus intrinsic. It is what you pay for the chance that the option becomes worth more before expiry. With the stock at 102, a 100 call at 3.50 has 2.00 of intrinsic value and 1.50 of extrinsic.',
        'An option with intrinsic value is **in the money** (ITM). One whose strike is at or very near the stock price is **at the money** (ATM). One with no intrinsic value is **out of the money** (OTM): its whole premium is extrinsic. A call and a put with the same strike sit on opposite sides: with the stock at 102, the 100 call is ITM and the 100 put is OTM.',
        'Extrinsic value is largest at the money and shrinks as the strike moves away in either direction. It also shrinks as expiry nears, and at expiry it is zero: the option is worth exactly its intrinsic value. An OTM option at expiry is worth nothing.',
        'This is the first thing to look at when you buy. Every cent of extrinsic value you pay will be gone by expiry. The underlying has to move far enough, soon enough, to replace it. How fast it goes is the subject of the pricing module.',
      ],
      rules: [
        'Intrinsic: call `max(S − K, 0)`, put `max(K − S, 0)`.',
        'Extrinsic = premium − intrinsic. It is all of an OTM premium.',
        'ITM has intrinsic value, OTM has none, ATM is a strike at the stock price.',
        'Extrinsic is largest at the money and is zero at expiry.',
        'At expiry an option is worth its intrinsic value and nothing more.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'options-moneyness-1',
          ask: 'SPY is at 412. The 400 call costs 15.30. How much of that is extrinsic value, per share?',
          answer: 3.3,
          check: '15.30 - max(412 - 400, 0)',
          why: 'Intrinsic is 412 − 400 = 12. The other 3.30 is extrinsic, the price of time, and it will be gone by expiry.',
        },
        {
          kind: 'number',
          id: 'options-moneyness-2',
          ask: 'SPY is at 412. The 420 put costs 10.50. How much is extrinsic value, per share?',
          answer: 2.5,
          check: '10.50 - max(420 - 412, 0)',
          why: 'A put has intrinsic value when the stock is below the strike: 420 − 412 = 8. The remaining 2.50 is extrinsic.',
        },
        {
          kind: 'choice',
          id: 'options-moneyness-3',
          ask: 'A stock trades at 50. Which of these options is in the money?',
          options: ['The 45 put', 'The 55 call', 'The 55 put', 'The 60 call'],
          answer: 2,
          why: 'A put is in the money when the strike is above the stock price: the right to sell at 55 is worth 5 when the stock is at 50. The 45 put and the two calls above 50 have no intrinsic value.',
        },
        {
          kind: 'output',
          id: 'options-moneyness-4',
          ask: 'What does this print?',
          code: `def intrinsic_call(S, K):
    return max(S - K, 0)

print([intrinsic_call(100, K) for K in (90, 100, 110)])`,
          answer: '[10, 0, 0]',
          why: 'With the stock at 100, the 90 call is 10 in the money, the 100 call is at the money and the 110 call is out of the money. The `max` with 0 means intrinsic value is never negative.',
        },
        {
          kind: 'bug',
          id: 'options-moneyness-5',
          ask: 'This should give the intrinsic value of a put. It says a 100 put with the stock at 90 is worth nothing.',
          code: `def intrinsic_put(S, K):
    # the right to sell at K when the stock is at S
    value = max(S - K, 0)
    return value`,
          line: 3,
          fix: '    value = max(K - S, 0)',
          why: 'A put pays when the stock is below the strike: you sell at K what is worth S. That is K − S. Using S − K gives the call formula.',
        },
        {
          kind: 'choice',
          id: 'options-moneyness-6',
          ask: 'In the figure, choose Call, set the stock to 105 and slide the days to expiry down to 0. What happens to the option price?',
          options: [
            'It falls until it equals the intrinsic value of 5, and the extrinsic value reaches 0',
            'It falls to 0, because options are worthless at expiry',
            'It stays the same, because the stock did not move',
            'It rises, because the option is close to paying out',
          ],
          answer: 0,
          why: 'As time runs out the extrinsic part shrinks to nothing and the price lands on the intrinsic value. Only out-of-the-money options are worth 0 at expiry. An in-the-money one is worth what it would pay if exercised.',
        },
        {
          kind: 'choice',
          id: 'options-moneyness-7',
          ask: 'For one stock and one expiry, which option usually has the most extrinsic value?',
          options: ['The deepest in-the-money call', 'The at-the-money option', 'The farthest out-of-the-money put', 'They all have the same'],
          answer: 1,
          why: 'Extrinsic value is greatest where the outcome is most uncertain, at the money. Deep in the money the option is almost all intrinsic; far out of the money it is cheap because it is unlikely to pay. The figure shows the hump.',
        },
        {
          kind: 'number',
          id: 'options-moneyness-8',
          ask: 'You buy an out-of-the-money call for 1.20. The stock does not move and the call expires still out of the money. How much have you lost on one contract, in dollars, before fees?',
          answer: 120,
          check: '1.20 * 100',
          why: 'An OTM premium is all extrinsic value, and extrinsic value is zero at expiry. The whole 1.20 × 100 = $120 is gone.',
        },
        {
          kind: 'write',
          id: 'options-moneyness-9',
          ask: 'Write `split(kind, S, K, premium)` that returns `(intrinsic, extrinsic)` per share for a call or a put.',
          starter: `def split(kind, S, K, premium):
    # kind is 'call' or 'put'
    # returns (intrinsic, extrinsic)
    pass`,
          solution: `def split(kind, S, K, premium):
    if kind == 'call':
        intrinsic = max(S - K, 0)
    else:
        intrinsic = max(K - S, 0)
    return intrinsic, premium - intrinsic`,
          tests: `out = split('call', 102, 100, 3.5)
assert out is not None, "the function returns nothing yet"
i, e = out
assert abs(i - 2) < 1e-9 and abs(e - 1.5) < 1e-9, f"a 100 call at 3.50 with the stock at 102 is 2 intrinsic and 1.50 extrinsic, got {out}"
i, e = split('put', 102, 100, 0.9)
assert abs(i) < 1e-9, "a 100 put with the stock at 102 is out of the money: intrinsic 0, not negative"
assert abs(e - 0.9) < 1e-9, "an out-of-the-money premium is all extrinsic"
i, e = split('put', 95, 100, 6.2)
assert abs(i - 5) < 1e-9 and abs(e - 1.2) < 1e-9, f"a 100 put with the stock at 95 is 5 intrinsic and 1.20 extrinsic, got {(i, e)}"`,
          why: 'Intrinsic value comes from the stock and the strike alone, floored at 0. Whatever the market charges above it is extrinsic.',
        },
        {
          kind: 'choice',
          id: 'options-moneyness-10',
          ask: 'A stock is at 80. You compare the 70 call at 10.40 and the 85 call at 1.10. Which statement is right?',
          options: [
            'The 85 call is cheaper, so it has less to lose',
            'The 70 call has 0.40 of extrinsic value, the 85 call has 1.10, so the 85 call needs a larger move only to break even',
            'Both have the same extrinsic value because they share an expiry',
            'The 70 call is out of the money',
          ],
          answer: 1,
          why: 'The 70 call is 10 in the money, so only 0.40 is time value. The 85 call is all time value and pays nothing unless the stock passes 85 plus 1.10 by expiry. Cheap in dollars is not the same as cheap in what has to happen.',
        },
      ],
    },
    {
      id: 'options-long',
      title: 'Payoff at expiry: long calls and puts',
      summary: 'The hockey stick: breakeven, the most you can lose and what a move is worth at expiry.',
      widget: 'options-payoff',
      text: [
        'At expiry an option is worth its intrinsic value, so you can draw exactly what it pays. The **payoff** of a long call is `max(S − K, 0)` and of a long put `max(K − S, 0)`, where S is now the stock price at expiry. The **profit** is payoff minus the premium you paid, times 100 times the number of contracts.',
        'Drawn against S, a long call is flat at minus the premium below the strike, then rises one for one above it: the **hockey stick**. A long put is the mirror: it rises as the stock falls below the strike and is flat above it.',
        'The **breakeven** is the stock price at expiry where profit is zero. Long call: strike + premium. Long put: strike − premium. Buy the 100 call at 3 and the stock must finish above 103 for you to make anything. Fees push the real breakeven a little further.',
        'The **maximum loss** of a bought option is the premium, and you lose all of it whenever the option finishes out of the money. The maximum profit of a call has no ceiling. A put can make at most strike − premium per share, if the stock goes to zero.',
        { code: `def long_call_profit(S, K, premium, contracts=1):
    return (max(S - K, 0) - premium) * 100 * contracts

print(long_call_profit(110, 100, 3))   # 700
print(long_call_profit(95, 100, 3))    # -300` },
        'This picture is only true **at expiry**. Before then the option also holds extrinsic value, and the pricing module covers how that changes. For a day trader who closes the same day, the expiry payoff is still the map of where the trade can end up.',
      ],
      rules: [
        'Profit = (payoff − premium) × 100 × contracts.',
        'Long call breakeven: strike + premium. Long put breakeven: strike − premium.',
        'Most a bought option can lose: the premium.',
        'A call has no profit cap. A put can make at most (strike − premium) × 100.',
        'The hockey stick is the picture at expiry, not before.',
      ],
      questions: [
        { kind: 'number', id: 'options-long-1', ask: 'You buy a 450 call for 5.00. What is the breakeven stock price at expiry?', answer: 455, check: '450 + 5.00', why: 'The call pays S − 450 above the strike and you paid 5, so you need S − 450 = 5. Below 455 at expiry the trade loses money, even though the call is in the money from 450.' },
        { kind: 'number', id: 'options-long-2', ask: 'You buy a 200 put for 4.00. What is the breakeven stock price at expiry?', answer: 196, check: '200 - 4.00', why: 'A put pays 200 − S below the strike, so you need 200 − S = 4, which is S = 196. The stock has to fall by more than the premium.' },
        {
          kind: 'number',
          id: 'options-long-3',
          ask: 'You own one 100 call bought at 2.50. The stock is at 104 at expiry. What is your profit in dollars, before fees?',
          answer: 150,
          check: '(max(104 - 100, 0) - 2.50) * 100',
          why: 'Payoff 4, minus the 2.50 paid, is 1.50 per share, or $150 per contract.',
        },
        {
          kind: 'number',
          id: 'options-long-4',
          ask: 'Same call: 100 strike, bought at 2.50. The stock finishes at 101. What is your profit in dollars? Give a loss as a negative number.',
          answer: -150,
          check: '(max(101 - 100, 0) - 2.50) * 100',
          why: 'The call is in the money and pays 1, but you paid 2.50, so you lose 1.50 per share, −$150. In the money is not the same as profitable: profit starts at the breakeven, 102.50.',
        },
        {
          kind: 'number',
          id: 'options-long-5',
          ask: 'You buy one 50 put for 1.50. What is the most it can make, in dollars, before fees?',
          answer: 4850,
          check: '(50 - 1.50) * 100',
          why: 'The best case is the stock going to zero: the put pays 50, minus 1.50 paid, is 48.50 per share or $4,850. Unlike a call, a put has a ceiling, because a price cannot go below zero.',
        },
        {
          kind: 'choice',
          id: 'options-long-6',
          ask: 'The chart shows the profit per share at expiry of one position, for stock prices from 90 to 110 in steps of 2. Which position is it?',
          chart: { x: 'stock price at expiry (90 to 110)', y: 'profit per share', series: [{ name: 'profit', points: [7, 5, 3, 1, -1, -3, -3, -3, -3, -3, -3] }] },
          options: ['A long 100 call bought for 3', 'A long 100 put bought for 3', 'A short 100 put sold for 3', 'A long 97 put bought for 1'],
          answer: 1,
          why: 'The line is flat at −3 above 100 and rises one for one as the price falls below 100, crossing zero at 97: a put with strike 100 bought for 3. A short put would be flat at +3.',
        },
        {
          kind: 'output',
          id: 'options-long-7',
          ask: 'What does this print?',
          code: `def call_profit(S, K, premium):
    return max(S - K, 0) - premium

print([call_profit(S, 100, 3) for S in (95, 100, 103, 110)])`,
          answer: '[-3, -3, 0, 7]',
          why: 'At or below the strike the call pays nothing and you lose the 3. At 103, the breakeven, profit is 0. Above it, every dollar is profit.',
        },
        {
          kind: 'bug',
          id: 'options-long-8',
          ask: 'This should return the profit per share of a long put at expiry. It reports a profit when the put expires worthless.',
          code: `def put_profit(S, K, premium):
    payoff = max(K - S, 0)
    return payoff + premium`,
          line: 3,
          fix: '    return payoff - premium',
          why: 'The buyer pays the premium, so it comes off the payoff. Adding it treats the trade as if you had been paid to take it.',
        },
        {
          kind: 'choice',
          id: 'options-long-9',
          ask: 'In the figure, choose a long call with the strike at 100 and raise the premium from 2 to 4. What changes?',
          options: [
            'The breakeven moves from 102 to 104 and the flat part of the line drops by $200 per contract',
            'The strike moves to 104',
            'Only the maximum profit changes',
            'Nothing: the premium does not affect the payoff',
          ],
          answer: 0,
          why: 'Paying more shifts the whole line down by the extra premium. The kink stays at the strike, but the stock must go 2 further to break even and the worst case grows by 2 × 100 = $200.',
        },
        {
          kind: 'choice',
          id: 'options-long-10',
          ask: 'Your call finishes exactly at its breakeven. You paid $0.65 per contract in fees each way. What is the result?',
          options: ['Exactly zero', 'A small loss, the fees', 'A small profit from the intrinsic value', 'It depends on the strike'],
          answer: 1,
          why: 'Breakeven ignores costs. At the breakeven the option gives back the premium, and the fees (and any spread you paid) are a loss. Your real breakeven is a little further away.',
        },
        {
          kind: 'write',
          id: 'options-long-11',
          ask: 'Write `long_profit(kind, S, K, premium, contracts)` that returns the dollar profit at expiry of bought calls or puts.',
          starter: `def long_profit(kind, S, K, premium, contracts):
    # kind is 'call' or 'put'; S is the stock price at expiry
    pass`,
          solution: `def long_profit(kind, S, K, premium, contracts):
    if kind == 'call':
        payoff = max(S - K, 0)
    else:
        payoff = max(K - S, 0)
    return (payoff - premium) * 100 * contracts`,
          tests: `out = long_profit('call', 110, 100, 3, 1)
assert out is not None, "the function returns nothing yet"
assert abs(out - 700) < 1e-9, f"a 100 call bought at 3 with the stock at 110 makes $700, got {out}"
assert abs(long_profit('call', 90, 100, 3, 2) + 600) < 1e-9, "two calls that expire worthless lose 2 x 300 = $600: did you multiply by 100 and the contracts?"
assert abs(long_profit('put', 90, 100, 3, 1) - 700) < 1e-9, "a 100 put bought at 3 with the stock at 90 makes $700"
assert abs(long_profit('put', 120, 100, 3, 1) + 300) < 1e-9, "a put that expires out of the money loses its premium, $300, not more"`,
          why: 'Payoff from the kind of option, minus the premium, times the multiplier and the number of contracts. The loss is capped at the premium because the payoff is never below zero.',
        },
      ],
    },
    {
      id: 'options-short',
      title: 'Selling options',
      summary: 'Short calls and puts: a capped gain, a large or open-ended loss, and the covered and cash-secured versions.',
      widget: 'options-mirror',
      text: [
        "Selling an option is taking the other side. You receive the premium up front and owe the buyer's payoff at expiry. Profit of a short call: `premium − max(S − K, 0)`. Short put: `premium − max(K − S, 0)`. Times 100 times contracts, as before.",
        "The picture is the buyer's hockey stick turned upside down. The best you can do is keep the premium, which happens whenever the option finishes out of the money. Breakevens are the same as the buyer's: strike + premium for a short call, strike − premium for a short put.",
        'The risk is the mirror image too. A **naked** short call, sold without owning the shares, loses one for one as the stock rises, with no limit. A naked short put loses as the stock falls, up to the strike minus the premium per share if it goes to zero. Sell a 100 put for 2 and see the stock gap to 70: you lose 28 per share, $2,800 per contract, fourteen times what you were paid.',
        'Two versions are better contained. A **covered call** is a call sold against 100 shares you own: if the stock rises you deliver the shares, so the call cannot lose more than the shares gain, but your upside stops at the strike. A **cash-secured put** keeps strike × 100 in cash: if assigned, you buy the shares with money you have set aside. The stock can still fall a long way below the strike; the cash only means you can pay.',
        'Sellers win often and win small. One bad expiry can take back many good ones. Brokers restrict naked selling to approved accounts and hold margin against it. The strategies module shows how to cap the loss by buying a further option. Until you can explain how a short option fails, do not sell one.',
      ],
      rules: [
        'Short profit = premium − payoff, × 100 × contracts. Most you can make: the premium.',
        "Same breakevens as the buyer's: call strike + premium, put strike − premium.",
        'Naked short call: loss without limit. Naked short put: loss up to (strike − premium) × 100.',
        'Covered call: shares cover the call, upside capped. Cash-secured put: cash to buy the shares, downside still there.',
        'High win rate, small wins: check what one loss costs before trusting the win rate.',
      ],
      questions: [
        { kind: 'number', id: 'options-short-1', ask: 'You sell a 30 put for 1.20. What is your breakeven stock price at expiry?', answer: 28.8, check: '30 - 1.20', why: 'The put costs you 30 − S below the strike and you were paid 1.20, so you break even at 28.80. Below that, every dollar the stock falls is a dollar per share lost.' },
        {
          kind: 'number',
          id: 'options-short-2',
          ask: 'You sold one 400 call for 4.00. The stock is at 420 at expiry. What is your profit in dollars? Give a loss as a negative number.',
          answer: -1600,
          check: '(4.00 - max(420 - 400, 0)) * 100',
          why: 'You owe 20 per share and were paid 4: a loss of 16 per share, −$1,600. Four times the premium collected, from a 5% move.',
        },
        { kind: 'number', id: 'options-short-3', ask: 'You want to sell one cash-secured 50 put. How much cash must you hold aside, in dollars?', answer: 5000, check: '50 * 100', why: 'If assigned you buy 100 shares at 50: $5,000. The premium you receive lowers your net cost, but the cash set aside is the full strike value.' },
        {
          kind: 'number',
          id: 'options-short-4',
          ask: 'You sold one 100 put for 2.00. Bad news overnight and the stock opens and expires at 70. What is your profit in dollars? Give a loss as a negative number.',
          answer: -2800,
          check: '(2.00 - max(100 - 70, 0)) * 100',
          why: 'You owe 30 per share and kept 2: −28 per share, −$2,800. That is fourteen times the $200 you were paid. A stop order would not have helped: the stock gapped past it.',
        },
        {
          kind: 'choice',
          id: 'options-short-5',
          ask: 'What is the maximum loss of one naked short call?',
          options: ['The premium received', 'The strike × 100', 'There is no limit', '(Strike − premium) × 100'],
          answer: 2,
          why: 'A stock price has no ceiling, and the short call loses one for one above the strike. (Strike − premium) × 100 is the most a short put can lose, which is large but finite.',
        },
        {
          kind: 'number',
          id: 'options-short-6',
          ask: 'You own 100 shares bought at 100 and sell one 105 call against them for 2.00. At expiry the stock is at 120. What is your total profit on shares and call, in dollars?',
          answer: 700,
          check: '(120 - 100) * 100 + (2.00 - max(120 - 105, 0)) * 100',
          why: 'The shares gain $2,000 and the short call loses (15 − 2) × 100 = $1,300. Net $700: the 5 from 100 to 105 plus the 2 of premium, per share. A covered call gives up everything above the strike.',
        },
        {
          kind: 'choice',
          id: 'options-short-7',
          ask: 'In the figure, choose Short call and turn on the buyer line. Move the stock price along. What do the two lines always do?',
          options: [
            'They add up to zero at every price: what the buyer makes, the seller loses',
            'They cross only at the strike',
            'The seller line is always above the buyer line',
            'They are the same line',
          ],
          answer: 0,
          why: 'The buyer and seller hold the same contract from opposite sides, so before fees their profits are equal and opposite. Every profitable buyer is paid by a seller, and the other way round.',
        },
        {
          kind: 'output',
          id: 'options-short-8',
          ask: 'What does this print?',
          code: `def short_put_profit(S, K, premium):
    return premium - max(K - S, 0)

print([short_put_profit(S, 50, 2) for S in (40, 48, 50, 60)])`,
          answer: '[-8, 0, 2, 2]',
          why: 'Above the strike the seller keeps the 2. At 48, the breakeven, it is 0. At 40 the seller owes 10 and loses 8. Gains stop at 2; losses keep growing as the price falls.',
        },
        {
          kind: 'bug',
          id: 'options-short-9',
          ask: 'This should return the dollar profit of short calls at expiry. It shows a profit when the stock rallies far above the strike.',
          code: `def short_call_profit(S, K, premium, contracts):
    owed = max(S - K, 0)
    per_share = owed - premium
    return per_share * 100 * contracts`,
          line: 3,
          fix: '    per_share = premium - owed',
          why: "The seller keeps the premium and pays what is owed. Writing it as owed − premium gives the buyer's profit, which makes a disaster look like a win.",
        },
        {
          kind: 'number',
          id: 'options-short-10',
          ask: 'A put seller has 9 expiries that each make $100 and one that loses $1,200. What is the net result over the 10, in dollars?',
          answer: -300,
          check: '9 * 100 - 1200',
          why: 'A 90% win rate and still a loss: 900 − 1,200 = −$300. With selling, the size of the rare loss decides the outcome, not how often you win. The risk module turns this into expectancy.',
        },
        {
          kind: 'design',
          id: 'options-short-11',
          ask: 'A friend plans to sell naked calls on a volatile stock every week "for income", because they "almost always expire worthless". What should they work out first?',
          checklist: [
            { point: 'The loss at a large move: for example a 30% gap up, in dollars per contract', why: 'A naked call has no loss limit. Putting a number on a plausible bad day shows what "almost always" costs when it fails.' },
            { point: 'That gaps happen overnight and on news, past any stop', why: 'A stop order cannot fill at prices the stock never traded at.' },
            { point: 'Win rate against the size of wins and losses', why: 'Ten small wins can be wiped out by one loss. Only the two together say whether the plan pays.' },
            { point: 'Margin, buying power and the broker permission level needed', why: 'Brokers hold margin against naked options and can raise it or close the position when the stock moves.' },
            { point: 'Assignment: they may have to deliver shares they do not own', why: 'Assignment turns a short call into a short stock position.' },
            { point: 'A defined-risk alternative, such as buying a higher call to cap the loss', why: 'A spread gives up some premium in exchange for a known worst case. The strategies module covers it.' },
            { point: 'Paper trading it through a volatile period first', why: 'The strategy looks best in calm markets. Testing it only there hides the failure.' },
          ],
          why: 'Selling options trades a high win rate for a rare, large loss. The plan is only sound if the rare loss is survivable and accounted for.',
        },
      ],
    },
    {
      id: 'options-chain',
      title: 'Reading an option chain',
      summary: 'Strikes, expiries, bid and ask, volume and open interest, and how to tell a tradable contract from a trap.',
      text: [
        'An **option chain** lists every contract for one underlying and one expiry. Strikes run down the middle, calls on one side, puts on the other. You choose the expiry from a list of dates. SPY and SPX list expiries on every weekday at the time of writing (2026); many single stocks have weekly and monthly ones.',
        { code: `SPY 501.20                expiry: Friday
        CALLS                         PUTS
 bid   ask   vol    OI   strike  bid   ask   vol    OI
 7.10  7.16  3100  9800   495    1.02  1.05  4200 12000
 3.40  3.44  9800 15000   500    2.25  2.28  8800 14000
 1.10  1.12  7600 11000   505    5.00  5.06  2100  6100
 0.10  0.35    12   300   520   18.20 19.40    3   150` },
        'The **bid** is the best price a buyer is offering, so it is what you can sell at now. The **ask** is what you can buy at. The **mid** is halfway. **Last** is the price of the most recent trade, which may be minutes or hours old: do not read it as the current price.',
        '**Volume** is the number of contracts traded today. **Open interest** (OI) is the number of contracts that exist, open and not yet closed. It is updated once a day, overnight. High volume and open interest mean many people trade the contract, and spreads tend to be tight.',
        'Measure the spread against the price: `(ask − bid) / mid`. The 500 call above is 0.04 wide on 3.42, about 1%. The 520 call is 0.25 wide on 0.225, more than 100%: buy at the ask and sell at the bid and you lose most of the premium without the stock moving. Thin strikes far from the money look cheap and cost the most to trade.',
        'In practice you pick the expiry first, then the strike, then check the quote: tight spread, real volume and open interest, a bid above zero. You enter with a limit order at or near the mid, never a market order on a thin option.',
      ],
      rules: [
        'Bid: what you can sell at. Ask: what you can buy at. Mid: halfway.',
        'Last can be stale. Trade off the live bid and ask.',
        'Volume is today; open interest is open contracts, updated overnight.',
        'Judge a spread as a share of the mid: `(ask − bid) / mid`.',
        'Use limit orders near the mid. Avoid wide, thin strikes.',
      ],
      questions: [
        { kind: 'number', id: 'options-chain-1', ask: 'A call is bid 2.40, ask 2.60. What is the mid?', answer: 2.5, check: '(2.40 + 2.60) / 2', why: 'Halfway between bid and ask: (2.40 + 2.60) / 2 = 2.50. A limit order near here often fills on liquid options; on thin ones you may have to give up some of the spread.' },
        {
          kind: 'number',
          id: 'options-chain-2',
          ask: 'Same quote, 2.40 by 2.60. What is the spread as a share of the mid? Give a percentage, for example 25%.',
          answer: 0.08,
          tol: 0.002,
          check: '(2.60 - 2.40) / ((2.40 + 2.60) / 2)',
          why: '0.20 / 2.50 = 8%. Buying at the ask and selling at the bid straight away loses 8% of the premium. A day trade has to make that back before it makes anything.',
        },
        {
          kind: 'number',
          id: 'options-chain-3',
          ask: 'You buy 10 of those contracts at the ask, 2.60, and sell them a minute later at the bid, 2.40. What did the round trip cost in dollars, before fees?',
          answer: 200,
          check: '(2.60 - 2.40) * 100 * 10',
          why: '0.20 × 100 × 10 = $200 lost to the spread with no price change at all. Size and spread together are the cost.',
        },
        {
          kind: 'choice',
          id: 'options-chain-4',
          ask: 'Which column tells you how many contracts of a strike are open and not yet closed?',
          options: ['Volume', 'Open interest', 'Last', 'Bid size'],
          answer: 1,
          why: 'Open interest counts open contracts and is updated once a day. Volume counts contracts traded today, which can be more or less than the open interest.',
        },
        {
          kind: 'choice',
          id: 'options-chain-5',
          ask: 'A put shows last 3.00, bid 2.10, ask 2.30. You want to sell the put you own right now with a market order. What price should you expect?',
          options: ['About 3.00, the last price', 'About 2.10, the bid', 'About 2.30, the ask', 'About 2.65, between last and ask'],
          answer: 1,
          why: 'A market sell order fills at the bid, or worse if the bid is small. The last trade happened earlier, at a different stock price. Reading P&L off the last price can make a position look better than it is.',
        },
        {
          kind: 'output',
          id: 'options-chain-6',
          ask: 'What does this print?',
          code: `quotes = {500: (3.40, 3.44), 505: (1.10, 1.12), 520: (0.10, 0.35)}

for strike, (bid, ask) in quotes.items():
    mid = (bid + ask) / 2
    print(strike, round((ask - bid) / mid * 100))`,
          answer: '500 1\n505 2\n520 111',
          why: 'The near strikes cost 1% and 2% of the price to cross. The far strike costs 111%: 0.25 wide on a mid of 0.225. A cheap option with a wide spread is the most expensive to trade.',
        },
        {
          kind: 'bug',
          id: 'options-chain-7',
          ask: 'This should return the spread as a share of the mid. For a quote of 2.40 by 2.60 it returns about 0.05.',
          code: `def spread_pct(bid, ask):
    mid = bid + ask / 2
    return (ask - bid) / mid`,
          line: 2,
          fix: '    mid = (bid + ask) / 2',
          why: 'Division happens before addition, so the line computes 2.40 + 1.30 = 3.70 and the result is 0.20 / 3.70. The brackets make it the average of the two, 2.50.',
        },
        {
          kind: 'choice',
          id: 'options-chain-8',
          ask: 'Two calls on the same stock and expiry. The 500 call: bid 4.00, ask 4.05, volume 50,000, OI 80,000. The 540 call: bid 0.05, ask 0.30, volume 12, OI 200. Which is the costlier to trade, relative to its price?',
          options: [
            'The 500 call, because it costs more in dollars',
            'The 540 call: its spread is larger than its mid',
            'They are the same, because they share an expiry',
            'The 540 call is cheaper because it has a lower ask',
          ],
          answer: 1,
          why: 'The 500 call spread is 0.05 on 4.025, about 1%. The 540 call spread is 0.25 on 0.175, about 140%. Low volume and open interest usually come with wide spreads like this.',
        },
        {
          kind: 'write',
          id: 'options-chain-9',
          ask: 'Write `tradable(quotes, max_pct)` that returns, sorted, the strikes whose bid is above zero and whose spread is at most `max_pct` of the mid. `quotes` maps strike to `(bid, ask)`.',
          starter: `def tradable(quotes, max_pct):
    # quotes: {strike: (bid, ask)}   max_pct: for example 0.05 for 5%
    # returns a sorted list of strikes
    pass`,
          solution: `def tradable(quotes, max_pct):
    out = []
    for strike, (bid, ask) in quotes.items():
        if bid <= 0:
            continue
        mid = (bid + ask) / 2
        if (ask - bid) / mid <= max_pct:
            out.append(strike)
    return sorted(out)`,
          tests: `quotes = {495: (7.10, 7.16), 500: (3.40, 3.44), 505: (1.10, 1.12), 520: (0.10, 0.35), 530: (0.0, 0.05)}
out = tradable(quotes, 0.05)
assert out is not None, "the function returns nothing yet"
assert out == [495, 500, 505], f"with a 5% limit the tradable strikes are 495, 500 and 505, got {out}"
assert tradable(quotes, 0.015) == [495, 500], "with a 1.5% limit only 495 and 500 are tight enough"
assert 530 not in tradable(quotes, 10), "a zero bid means you cannot sell the option at all: leave it out"
assert tradable({}, 0.05) == [], "no quotes, no strikes"`,
          why: 'A zero bid means nobody will buy it from you, so it is out whatever the spread. Measuring the spread against the mid lets you use one limit for options of very different prices.',
        },
        {
          kind: 'design',
          id: 'options-chain-10',
          ask: 'You expect SPY to rise over the next hour. Describe how you would go through the chain to choose a call, from opening it to sending the order.',
          checklist: [
            { point: 'Choose the expiry first, to fit how long the idea needs', why: 'An option with too little time can expire before the move; one with more time costs more.' },
            { point: 'Choose a strike near the money where the price and the move make sense', why: 'Far out-of-the-money strikes need a large move and often have wide spreads.' },
            { point: 'Check the spread as a share of the mid', why: 'The spread is a cost you pay in and out. A few percent can be the whole edge of a day trade.' },
            { point: 'Check volume and open interest, and that the bid is above zero', why: 'Activity is what lets you get out at a fair price.' },
            { point: 'Work out the total cost and the maximum loss in dollars', why: 'Premium × 100 × contracts is what can be lost.' },
            { point: 'Send a limit order at or near the mid, not a market order', why: 'A market order on an option fills at the far side of the spread, or worse.' },
            { point: 'Check for news or data due before you plan to exit', why: 'Scheduled events can move the stock and the option price sharply.' },
          ],
          why: 'Reading a chain is a short checklist. Most of the cost of a small option trade is decided by which contract you pick and how you enter it.',
        },
        {
          kind: 'choice',
          id: 'options-chain-11',
          ask: 'In the chain in the lesson, SPY is at 501.20. Which statement about the 500 strike is right?',
          options: [
            'The 500 call is in the money by 1.20 and the 500 put is out of the money',
            'Both the 500 call and the 500 put are in the money',
            'The 500 put is in the money because its ask is lower',
            'Both are out of the money because 500 is a round number',
          ],
          answer: 0,
          why: 'With SPY at 501.20 the right to buy at 500 is worth 1.20 now, so the call is in the money by that amount and the rest of its 3.42 mid is extrinsic. The put is out of the money: its whole mid of about 2.27 is extrinsic.',
        },
      ],
    },
    {
      id: 'options-exercise',
      title: 'Exercise, assignment and expiry',
      summary: 'What happens when an option is used, who gets assigned, how SPY and SPX settle, and why you close before the bell.',
      text: [
        "**Exercise** is the holder using the right. **Assignment** is the other half: the clearing house (the Options Clearing Corporation, OCC, in the US) picks a seller's broker, which picks one of its customers who is short that option. A short option can be assigned whether or not you expect it.",
        '**American-style** options can be exercised on any trading day up to expiry. Options on US shares and ETFs, SPY included, are American. **European-style** options can only be exercised at expiry. SPX, the index option, is European, so an SPX seller cannot be assigned early.',
        'Settlement differs too. A SPY option settles in **shares**: exercising one call buys 100 SPY at the strike. An SPX option settles in **cash**: (settlement value − strike) × 100 for a call. Standard monthly SPX options are AM-settled, from opening prices on expiry day, and stop trading the day before. The SPXW weeklies are PM-settled, from the close. These are the rules at the time of writing (2026); check the contract and your broker.',
        'At expiry, the OCC exercises long options that finish at least $0.01 in the money unless told otherwise (exercise by exception). A forgotten SPY call 1 dollar in the money becomes 100 shares, about $50,000 of SPY, on the next trading day. A short option a few cents in the money becomes an assignment. Brokers may close such positions for you, at their own prices, if you lack the buying power. The price can also move after the close and change what is in the money.',
        'Exercising early rarely pays: it throws away the extrinsic value, so selling the option usually gets more. One case where early assignment does happen is a short in-the-money call on a stock that is about to pay a dividend. For a day trader the rule is simple: close every position before the bell and never hold a short option into expiry by accident.',
      ],
      rules: [
        'Exercise: the holder uses the right. Assignment: a seller is chosen to deliver.',
        'American: any day up to expiry (SPY, stocks). European: at expiry only (SPX).',
        'SPY settles in 100 shares per contract. SPX settles in cash, × 100.',
        'In the money by $0.01 or more at expiry: exercised unless you say otherwise.',
        'Selling usually beats exercising early. Close positions before expiry.',
      ],
      questions: [
        {
          kind: 'choice',
          id: 'options-exercise-1',
          ask: 'You hold one SPY call and one SPX call, both in the money at expiry, and close neither. What do you receive?',
          options: [
            'Cash for both',
            '100 SPY shares bought at the strike for the SPY call, and cash for the SPX call',
            '100 shares of each',
            'Nothing for either: they expire worthless',
          ],
          answer: 1,
          why: 'SPY options settle in shares and SPX options settle in cash. The SPY exercise needs money or margin to pay for 100 shares at the strike.',
        },
        {
          kind: 'number',
          id: 'options-exercise-2',
          ask: 'You hold one SPX 5000 call. The settlement value is 5032.40. How much cash do you receive, in dollars?',
          answer: 3240,
          check: '(5032.40 - 5000) * 100',
          why: '(5032.40 − 5000) × 100 = $3,240. Subtract what you paid for the call to get the profit.',
        },
        {
          kind: 'number',
          id: 'options-exercise-3',
          ask: 'You forget one SPY 500 call that closes at 503 on expiry day. It is exercised. How much do the shares cost, in dollars?',
          answer: 50000,
          check: '500 * 100',
          why: '100 shares at 500 is $50,000. A small account cannot pay for that; the broker may close the shares at the next open at whatever price SPY trades.',
        },
        {
          kind: 'choice',
          id: 'options-exercise-4',
          ask: 'You are short one 100 put. The stock closes at 98 on expiry day and you did nothing. What happens next?',
          options: [
            'The put expires worthless and you keep the premium',
            'You will most likely be assigned and buy 100 shares at 100',
            'You will be assigned and sell 100 shares at 100',
            'The broker pays you the 2 dollars of intrinsic value',
          ],
          answer: 1,
          why: 'The put is 2 in the money, so it will almost certainly be exercised and you must buy 100 shares at 100 that are worth 98. You now own $10,000 of stock you may not have wanted.',
        },
        {
          kind: 'number',
          id: 'options-exercise-5',
          ask: 'You own a 100 call. The stock is at 110 and the call is bid 10.80. How many more dollars do you get by selling the call than by exercising it and selling the shares at 110?',
          answer: 80,
          check: '(10.80 - (110 - 100)) * 100',
          why: 'Exercising captures only the intrinsic value of 10. Selling the call gets 10.80, which includes 0.80 of extrinsic value: $80 more per contract.',
        },
        {
          kind: 'choice',
          id: 'options-exercise-6',
          ask: 'You hold a European-style SPX call that has gained a lot two weeks before expiry. How can you take the profit?',
          options: ['Exercise it now', 'Sell it in the market', 'You cannot until expiry', 'Ask to be assigned'],
          answer: 1,
          why: 'European style limits exercise to expiry, not trading. You can sell the option at any time the market is open, and that is how nearly all option positions are closed.',
        },
        {
          kind: 'output',
          id: 'options-exercise-7',
          ask: 'Cash settlement of SPX calls. What does this print?',
          code: `def cash_settle_call(value, K):
    return round(max(value - K, 0) * 100, 2)

print([cash_settle_call(5012.5, K) for K in (4990, 5010, 5020)])`,
          answer: '[2250.0, 250.0, 0]',
          why: 'Settlement is intrinsic value × 100: 22.50 → $2,250, 2.50 → $250, and the 5020 call is out of the money, so 0. The `max` returns the integer 0 there, which prints without a decimal point.',
        },
        {
          kind: 'bug',
          id: 'options-exercise-8',
          ask: 'This should return the cash an SPX put pays at settlement, per contract. A 5000 put with a settlement value of 4980 pays nothing.',
          code: `def cash_settle_put(value, K):
    intrinsic = max(value - K, 0)
    return intrinsic * 100`,
          line: 2,
          fix: '    intrinsic = max(K - value, 0)',
          why: 'A put pays the amount by which the settlement value is below the strike: 5000 − 4980 = 20, so $2,000.',
        },
        {
          kind: 'number',
          id: 'options-exercise-9',
          ask: 'You sold three SPY 450 puts and all three are assigned. How much cash do you pay for the shares, in dollars?',
          answer: 135000,
          check: '3 * 100 * 450',
          why: 'Three contracts is 300 shares at 450: $135,000. Assignment uses the strike price, not the market price.',
        },
        {
          kind: 'choice',
          id: 'options-exercise-10',
          ask: 'You are short an in-the-money call on a stock that goes ex-dividend tomorrow. The call has very little extrinsic value left. What is the risk?',
          options: [
            'None: you cannot be assigned before expiry',
            'You may be assigned early, have to deliver 100 shares, and owe the dividend if you end up short the shares',
            'The dividend is paid to you because you sold the call',
            'The option will be cancelled',
          ],
          answer: 1,
          why: 'An American call holder who wants the dividend can exercise before the ex-date. When the extrinsic value left is smaller than the dividend this is likely, and a seller is assigned.',
        },
        {
          kind: 'design',
          id: 'options-exercise-11',
          ask: 'It is 3:30 pm on expiry day. You hold 2 long SPY calls a little in the money and 1 short SPY put a little out of the money. Write what you do before the close and why.',
          checklist: [
            { point: 'Close the long calls rather than let them be exercised', why: 'Exercise would buy 200 shares you may not be able to pay for, and selling recovers any extrinsic value left.' },
            { point: 'Close the short put even though it is out of the money', why: 'A move in the last minutes or after the close can put it in the money and lead to assignment.' },
            { point: 'Check the buying power needed if anything is exercised or assigned', why: '100 shares per contract at the strike is a large sum next to a small account.' },
            { point: 'Use limit orders and allow for wider spreads near the close', why: 'Liquidity in a single strike can thin out in the last minutes.' },
            { point: "Know your broker's cut-off times and expiry policy", why: 'Brokers may close positions themselves before the close if they see a risk.' },
            { point: 'Write a standing rule: no option is held into expiry by accident', why: 'A habit removes the decision on the day.' },
          ],
          why: 'At expiry, small amounts in or out of the money turn into full share positions. Closing everything before the bell keeps the trade the size you meant it to be.',
        },
        {
          kind: 'choice',
          id: 'options-exercise-12',
          ask: 'You hold a standard monthly SPX option, AM-settled, into expiry. When is its settlement value set?',
          options: [
            'From the closing price on expiry day',
            'From opening prices on expiry day, after trading in it stopped the day before',
            'From the average price over the last week',
            'At the moment you choose to exercise',
          ],
          answer: 1,
          why: 'AM-settled SPX options stop trading the business day before expiry and settle from the opening prices of the index stocks on expiry day. The index can open far from where it closed, and you cannot trade out in between.',
        },
      ],
    },
    {
      id: 'options-leverage',
      title: 'Why options are not shares',
      summary: 'Large percentage swings, the cost of being right too late, and sizing for total loss.',
      widget: 'options-leverage',
      text: [
        'An option gives you exposure to 100 shares for a fraction of their price. This magnified exposure is what traders call **leverage**: the same dollars move much more. With a stock at 100, $1,000 buys 10 shares, or 4 calls at 2.50 that control 400 shares.',
        'Follow both to expiry with the strike at 100. Stock at 106: the shares make $60 (+6%), the calls pay 6 − 2.50 per share on 400 shares, +$1,400 (+140%). Stock at 102: shares +$20 (+2%), calls (2 − 2.50) × 400 = −$200 (−20%). Stock at 100 or below: the shares are flat or slightly down, the calls lose 100%. Small moves the right way can still lose. Large moves pay a lot.',
        'An option has a deadline. If the stock rises 10% the week after your call expired, you lost everything: right about the direction, wrong about the time. Shares can wait; options cannot. **Notional** exposure, contracts × 100 × the stock price, shows how much stock you are really trading: 4 contracts here is $40,000 of stock.',
        'So size an option by its premium, as money you can lose in full, and not by the number of shares it controls. If you would risk $200 on a trade, $200 of premium is the trade. Buying 10 contracts because "it is only 0.50" is $500 at risk and 1,000 shares of exposure.',
        'Percent returns on options swing from −100% to several hundred percent, so a few wins can look like skill. Judge them over many trades, after costs. The risk module covers sizing in full.',
      ],
      rules: [
        'Return on an option = profit ÷ premium paid. It swings far more than the stock.',
        'A move the right way but smaller than the premium still loses.',
        'Right too late is wrong: the option expires.',
        'Notional = contracts × 100 × stock price. Know it.',
        'Size by premium as money you can lose in full.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'options-leverage-1',
          ask: 'A stock is at 50. The 50 call costs 1.00. You put $500 into the calls and the stock is at 53 at expiry. What is your profit in dollars?',
          answer: 1000,
          check: '(max(53 - 50, 0) - 1.00) * 100 * (500 // (1.00 * 100))',
          why: '$500 buys 5 contracts, 500 shares of exposure. Each share earns 3 − 1 = 2, so 2 × 500 = $1,000.',
        },
        {
          kind: 'number',
          id: 'options-leverage-2',
          ask: 'Same stock, from 50 to 53. What is the return on buying the shares instead? Give a percentage, for example 25%.',
          answer: 0.06,
          tol: 0.001,
          check: '(53 - 50) / 50',
          why: '3 / 50 = 6%. The same move is worth 200% on the calls.',
        },
        {
          kind: 'number',
          id: 'options-leverage-3',
          ask: 'Same calls (50 strike, bought at 1.00), stock at 53 at expiry. What is the return on the premium paid? Give a percentage, for example 25%.',
          answer: 2,
          tol: 0.01,
          check: '(max(53 - 50, 0) - 1.00) / 1.00',
          why: 'You paid 1 and get back 3: a profit of 2 on 1, which is 200%.',
        },
        {
          kind: 'number',
          id: 'options-leverage-4',
          ask: 'Same calls, but the stock finishes at 50.80, up 1.6%. What is the return on the calls? Give a percentage, for example −25%.',
          answer: -0.2,
          tol: 0.002,
          check: '(max(50.80 - 50, 0) - 1.00) / 1.00',
          why: 'The call pays 0.80 on a premium of 1: −20%. You were right about the direction and still lost, because the move was smaller than the premium.',
        },
        {
          kind: 'choice',
          id: 'options-leverage-5',
          ask: 'You bought a weekly call. The stock was flat all week and the call expired out of the money. The next week the stock rose 8%. What is your result?',
          options: ['A large gain, because the stock rose 8%', 'A total loss of the premium', 'The call is still open until the stock reaches the strike', 'A small loss, because the move came close'],
          answer: 1,
          why: 'The call stopped existing at expiry, worthless. An option needs the move by a date. A share holder with the same view would be up 8%.',
        },
        {
          kind: 'choice',
          id: 'options-leverage-6',
          ask: 'The chart shows the return of $1,000 put into shares at 100 (blue) and into 100 calls bought at 2.50 (accent), at expiry, for stock prices of 90, 95, 100, 105, 110, 115 and 120. Which statement does it support?',
          chart: {
            x: 'stock price at expiry (90 to 120)',
            y: 'return, %',
            series: [
              { name: 'shares', points: [-10, -5, 0, 5, 10, 15, 20], color: 'blue' },
              { name: 'calls', points: [-100, -100, -100, 100, 300, 500, 700], color: 'accent' },
            ],
          },
          options: [
            'The calls always do better than the shares',
            'At 100 and below the calls lose everything while the shares lose at most 10% here; above the 102.50 breakeven the calls do far better',
            'The calls and the shares break even at the same price',
            'The calls lose less than the shares when the stock falls',
          ],
          answer: 1,
          why: 'Magnified exposure cuts both ways. The shares lose 5% if the stock falls 5%. The calls lose 100% if the stock merely fails to rise. Their breakeven is 102.50, not 100.',
        },
        {
          kind: 'choice',
          id: 'options-leverage-7',
          ask: 'In the figure, set the premium to 2.50 and the stock at expiry to 103. Then slowly lower the stock price. Where does the call return reach −100%?',
          options: ['At 102.50, the breakeven', 'At 100, the strike, and it stays at −100% below that', 'At 97.50', 'It never reaches −100%'],
          answer: 1,
          why: 'Between 100 and 102.50 the call pays something but less than its cost. At the strike it pays nothing, and below it still pays nothing. The share line keeps falling smoothly.',
        },
        {
          kind: 'output',
          id: 'options-leverage-8',
          ask: 'What does this print?',
          code: `budget = 1000
stock, strike, premium = 100, 100, 2.50
shares = budget // stock
calls = int(budget // (premium * 100))
end = 104
print(shares * (end - stock), calls * 100 * (max(end - strike, 0) - premium))`,
          answer: '40 600.0',
          why: '$1,000 buys 10 shares or 4 calls. At 104 the shares make 10 × 4 = $40 and the calls make 400 × 1.50 = $600. Same view, same money, fifteen times the dollar result, and at 100 the calls would have lost all $1,000.',
        },
        {
          kind: 'bug',
          id: 'options-leverage-9',
          ask: 'This should say how many contracts a budget buys. With $500 and a premium of 2.00 it says 250.',
          code: `def contracts_for(budget, premium):
    cost_per_contract = premium
    return int(budget // cost_per_contract)`,
          line: 2,
          fix: '    cost_per_contract = premium * 100',
          why: 'One contract costs premium × 100: $200 here, so $500 buys 2. Sizing as if the premium were the contract price is a hundredfold mistake.',
        },
        {
          kind: 'write',
          id: 'options-leverage-10',
          ask: 'Write `contracts_for_risk(risk, premium, fee)` that returns how many whole contracts you can buy so that premium plus fees, if lost in full, is at most `risk` dollars. `fee` is per contract, paid once to buy and once to sell.',
          starter: `def contracts_for_risk(risk, premium, fee):
    # risk: dollars you accept losing in full
    # premium: per share; fee: per contract, each way
    pass`,
          solution: `def contracts_for_risk(risk, premium, fee):
    per_contract = premium * 100 + 2 * fee
    return int(risk // per_contract)`,
          tests: `out = contracts_for_risk(500, 2.00, 0.65)
assert out is not None, "the function returns nothing yet"
assert out == 2, f"each contract can lose 200 + 1.30 = 201.30, so $500 covers 2, got {out}"
assert contracts_for_risk(200, 2.00, 0.65) == 0, "$200 is not enough for one contract once fees are added: the answer is 0, not 1"
assert contracts_for_risk(1000, 0.50, 0.65) == 19, "at 0.50 each contract risks 51.30, so $1,000 covers 19"
assert isinstance(contracts_for_risk(1000, 0.5, 0), int), "return a whole number of contracts"`,
          why: 'For a bought option the premium is the amount at risk, so the premium plus both fees is the loss of one contract. Rounding down keeps the total within the limit; 0 means the trade is too big for the risk.',
        },
        {
          kind: 'number',
          id: 'options-leverage-11',
          ask: 'You hold 3 QQQ calls and QQQ is at 400. What is your notional exposure, in dollars?',
          answer: 120000,
          check: '3 * 100 * 400',
          why: '3 contracts × 100 shares × 400 = $120,000 of QQQ. You paid far less, but the position controls that much stock, and a few percent of it can be more than the whole premium.',
        },
        {
          kind: 'design',
          id: 'options-leverage-12',
          ask: 'A friend with a $5,000 account wants to put all of it into weekly calls before an earnings report, because "if it pops I triple my money". Write what you would ask them to work out first.',
          checklist: [
            { point: 'What happens if the stock does not move enough, or falls: the whole $5,000 can be gone in a day', why: 'A bought option can lose 100%. All of the account in one trade means one bad outcome ends it.' },
            { point: 'The breakeven at expiry and how far that is from the price now', why: 'The stock must rise past strike + premium. Earnings options are often priced for a large move.' },
            { point: 'That option prices often fall after the news even when the stock moves the right way', why: 'The volatility module covers this IV crush. Being right on direction is not enough.' },
            { point: 'A fixed share of the account at risk per trade', why: 'Sizing by what you can afford to lose, a small share each time, is what lets you keep trading after a loss.' },
            { point: 'Spread and fees on the chosen strike', why: 'Cheap, far out-of-the-money weeklies often have wide spreads.' },
            { point: 'Whether the plan has been tested on paper or on past trades', why: 'One hoped-for outcome is a bet, not a plan.' },
          ],
          why: 'Magnified exposure makes the good case vivid and hides the likely one. The questions all turn a hope into numbers that include the loss.',
        },
      ],
    },
    {
      id: 'options-lab',
      title: 'Lab: a payoff engine in Python',
      summary: 'Single-leg payoffs, positions of several legs, breakevens and the worst and best case, built step by step.',
      text: [
        'Every later module needs one tool: given some option legs, what does the position make or lose at each price at expiry? This lab builds that engine in plain Python, one function at a time, and each step repeats the functions it needs.',
        "A **leg** is one line of a position, kept as a dictionary: `{'kind': 'call', 'side': 'long', 'strike': 100, 'premium': 2.5, 'qty': 1}`. Its profit at expiry is the payoff minus the premium, times 100 and the quantity, with the sign flipped for a short leg.",
        'A **position** is a list of legs, and its profit is the sum of theirs. Evaluate it on a grid of prices and you have the payoff diagram as numbers. From that list come the **breakevens** (where the profit crosses zero) and the best and worst case on the grid.',
        'A grid has edges, and a position can keep gaining or losing beyond them. Count calls: more long calls than short means profit grows without limit as the price rises; more short calls than long means the loss does. The last step puts this together into a report that says "unlimited" where it should.',
        'Test each function on cases you can work out by hand before trusting it on a position you cannot. A payoff engine that is wrong by a sign is worse than none.',
      ],
      rules: [
        'Leg profit = sign × (payoff − premium) × 100 × qty, with sign −1 for a short leg.',
        'Position profit is the sum of its legs.',
        'Breakevens are where the profit on the grid changes sign; interpolate between grid points.',
        'Net long calls: unlimited upside. Net short calls: unlimited loss. Run the grid from 0 to cover the downside.',
        'Test every function on cases you can work out by hand.',
      ],
      questions: [
        {
          kind: 'write',
          id: 'options-lab-1',
          ask: 'Step 1: the payoff per share at expiry of a call or a put.',
          starter: `def payoff(kind, S, K):
    # kind is 'call' or 'put'; S is the price at expiry, K the strike
    pass`,
          solution: `def payoff(kind, S, K):
    if kind == 'call':
        return max(S - K, 0)
    return max(K - S, 0)`,
          tests: `out = payoff('call', 105, 100)
assert out is not None, "the function returns nothing yet"
assert out == 5, f"a 100 call with the price at 105 pays 5, got {out}"
assert payoff('call', 95, 100) == 0, "an out-of-the-money call pays 0, never a negative amount"
assert payoff('put', 95, 100) == 5, "a 100 put with the price at 95 pays 5"
assert payoff('put', 105, 100) == 0, "an out-of-the-money put pays 0"`,
          why: 'The payoff is the intrinsic value at expiry, floored at zero because the holder does not have to exercise.',
        },
        {
          kind: 'write',
          id: 'options-lab-2',
          ask: 'Step 2: the dollar profit of one leg at expiry. A short leg has the opposite sign of a long one.',
          starter: `def payoff(kind, S, K):
    if kind == 'call':
        return max(S - K, 0)
    return max(K - S, 0)

def leg_profit(leg, S):
    # leg: {'kind', 'side' ('long' or 'short'), 'strike', 'premium', 'qty'}
    pass`,
          solution: `def payoff(kind, S, K):
    if kind == 'call':
        return max(S - K, 0)
    return max(K - S, 0)

def leg_profit(leg, S):
    per_share = payoff(leg['kind'], S, leg['strike']) - leg['premium']
    sign = 1 if leg['side'] == 'long' else -1
    return sign * per_share * 100 * leg['qty']`,
          tests: `long_call = {'kind': 'call', 'side': 'long', 'strike': 100, 'premium': 2, 'qty': 1}
out = leg_profit(long_call, 105)
assert out is not None, "the function returns nothing yet"
assert out == 300, f"a long 100 call bought at 2 makes $300 at 105, got {out}"
assert leg_profit(dict(long_call, side='short'), 105) == -300, "the short call loses what the long call makes"
assert leg_profit({'kind': 'put', 'side': 'long', 'strike': 100, 'premium': 3, 'qty': 2}, 90) == 1400, "two long 100 puts bought at 3 make $1,400 at 90: did you use qty?"
assert leg_profit({'kind': 'put', 'side': 'short', 'strike': 100, 'premium': 1.5, 'qty': 1}, 110) == 150, "a short put that expires out of the money keeps its $150 premium"`,
          why: 'One formula covers all four single legs. The long side earns payoff minus premium; the short side earns exactly the opposite.',
        },
        {
          kind: 'output',
          id: 'options-lab-3',
          ask: 'Step 3: check the leg function on a short put by hand. What does this print?',
          code: `def payoff(kind, S, K):
    if kind == 'call':
        return max(S - K, 0)
    return max(K - S, 0)

def leg_profit(leg, S):
    per_share = payoff(leg['kind'], S, leg['strike']) - leg['premium']
    sign = 1 if leg['side'] == 'long' else -1
    return sign * per_share * 100 * leg['qty']

leg = {'kind': 'put', 'side': 'short', 'strike': 50, 'premium': 2.0, 'qty': 1}
print([leg_profit(leg, S) for S in (40, 47, 50, 60)])`,
          answer: '[-800.0, -100.0, 200.0, 200.0]',
          why: 'At 40 the put pays 10 and the seller kept 2: −8 per share. At 47 it pays 3: −1. At and above the strike the seller keeps the $200. The values are floats because the premium is 2.0.',
        },
        {
          kind: 'write',
          id: 'options-lab-4',
          ask: 'Step 4: the profit of a whole position, a list of legs, at one price.',
          starter: `def payoff(kind, S, K):
    if kind == 'call':
        return max(S - K, 0)
    return max(K - S, 0)

def leg_profit(leg, S):
    per_share = payoff(leg['kind'], S, leg['strike']) - leg['premium']
    sign = 1 if leg['side'] == 'long' else -1
    return sign * per_share * 100 * leg['qty']

def position_profit(legs, S):
    pass`,
          solution: `def payoff(kind, S, K):
    if kind == 'call':
        return max(S - K, 0)
    return max(K - S, 0)

def leg_profit(leg, S):
    per_share = payoff(leg['kind'], S, leg['strike']) - leg['premium']
    sign = 1 if leg['side'] == 'long' else -1
    return sign * per_share * 100 * leg['qty']

def position_profit(legs, S):
    return sum(leg_profit(leg, S) for leg in legs)`,
          tests: `legs = [{'kind': 'call', 'side': 'long', 'strike': 100, 'premium': 3, 'qty': 1},
        {'kind': 'call', 'side': 'short', 'strike': 110, 'premium': 1, 'qty': 1}]
out = position_profit(legs, 120)
assert out is not None, "the function returns nothing yet"
assert out == 800, f"long 100 call at 3 and short 110 call at 1 make 1700 - 900 = $800 at 120, got {out}"
assert position_profit(legs, 90) == -200, "at 90 both calls expire: -300 + 100 = -$200"
assert position_profit(legs, 105) == 300, "at 105: 200 + 100 = $300"
assert position_profit([], 100) == 0, "an empty position makes nothing"`,
          why: 'Payoffs add, so a position is the sum of its legs. The example is a bull call spread, which the strategies module studies: the short call lowers the cost and caps the gain.',
        },
        {
          kind: 'write',
          id: 'options-lab-5',
          ask: 'Step 5: the breakevens. Given a sorted list of prices, return the prices where the profit is zero, interpolating in a straight line where it changes sign between two grid points.',
          starter: `def payoff(kind, S, K):
    if kind == 'call':
        return max(S - K, 0)
    return max(K - S, 0)

def leg_profit(leg, S):
    per_share = payoff(leg['kind'], S, leg['strike']) - leg['premium']
    sign = 1 if leg['side'] == 'long' else -1
    return sign * per_share * 100 * leg['qty']

def position_profit(legs, S):
    return sum(leg_profit(leg, S) for leg in legs)

def breakevens(legs, prices):
    # prices: sorted list; returns a list of prices, low to high
    pass`,
          solution: `def payoff(kind, S, K):
    if kind == 'call':
        return max(S - K, 0)
    return max(K - S, 0)

def leg_profit(leg, S):
    per_share = payoff(leg['kind'], S, leg['strike']) - leg['premium']
    sign = 1 if leg['side'] == 'long' else -1
    return sign * per_share * 100 * leg['qty']

def position_profit(legs, S):
    return sum(leg_profit(leg, S) for leg in legs)

def breakevens(legs, prices):
    out = []
    p = [position_profit(legs, S) for S in prices]
    for i in range(len(prices)):
        if p[i] == 0:
            out.append(prices[i])
        elif i + 1 < len(prices) and p[i] * p[i + 1] < 0:
            a, b = prices[i], prices[i + 1]
            out.append(a + (b - a) * -p[i] / (p[i + 1] - p[i]))
    return out`,
          tests: `grid = list(range(0, 201))
call = [{'kind': 'call', 'side': 'long', 'strike': 100, 'premium': 2.5, 'qty': 1}]
out = breakevens(call, grid)
assert out is not None, "the function returns nothing yet"
assert len(out) == 1 and abs(out[0] - 102.5) < 1e-9, f"a 100 call bought at 2.50 breaks even at 102.50, between grid points, got {out}"
short_put = [{'kind': 'put', 'side': 'short', 'strike': 50, 'premium': 2, 'qty': 3}]
assert [round(x, 6) for x in breakevens(short_put, grid)] == [48], "a short 50 put sold at 2 breaks even at 48, whatever the quantity"
straddle = [{'kind': 'call', 'side': 'long', 'strike': 100, 'premium': 3, 'qty': 1},
            {'kind': 'put', 'side': 'long', 'strike': 100, 'premium': 3, 'qty': 1}]
got = [round(x, 6) for x in breakevens(straddle, grid)]
assert got == [94, 106], f"a long call and put at 100, 3 each, break even at 94 and 106 (each once, even on a grid point), got {got}"`,
          hint: 'Between two prices a and b with profits pa and pb of opposite sign, the line crosses zero at a + (b − a) × (−pa) / (pb − pa).',
          why: 'Between grid points the expiry payoff is a straight line unless a strike falls in between, so linear interpolation is exact on a grid that includes every strike. Adding a grid point only when its own profit is zero stops a breakeven that lands on a grid point from being counted twice.',
        },
        {
          kind: 'bug',
          id: 'options-lab-6',
          ask: 'Step 6: a colleague wrote breakevens differently, passing the profit function in. For a long 100 call bought at 2.50, on a grid of whole numbers, it returns 101.5. Find the wrong line.',
          code: `def breakevens(legs, prices, profit):
    out = []
    p = [profit(legs, S) for S in prices]
    for i in range(len(prices) - 1):
        a, b = prices[i], prices[i + 1]
        if p[i] == 0:
            out.append(a)
        elif p[i] * p[i + 1] < 0:
            out.append(a + (b - a) * p[i] / (p[i + 1] - p[i]))
    return out`,
          line: 9,
          fix: '            out.append(a + (b - a) * -p[i] / (p[i + 1] - p[i]))',
          why: 'The crossing is a fraction −pa / (pb − pa) of the way from a to b. Without the minus sign the point lands on the wrong side of a: the profits at 102 and 103 are −50 and 50, and the formula gives 102 − 0.5 = 101.5 instead of 102.5.',
        },
        {
          kind: 'write',
          id: 'options-lab-7',
          ask: 'Step 7: the report. Return a dict with `max_profit` and `max_loss` (the highest and lowest profit on the grid, or `None` when it is unlimited as the price rises) and `breakevens`. Net long calls make the profit unlimited; net short calls make the loss unlimited.',
          starter: `def payoff(kind, S, K):
    if kind == 'call':
        return max(S - K, 0)
    return max(K - S, 0)

def leg_profit(leg, S):
    per_share = payoff(leg['kind'], S, leg['strike']) - leg['premium']
    sign = 1 if leg['side'] == 'long' else -1
    return sign * per_share * 100 * leg['qty']

def position_profit(legs, S):
    return sum(leg_profit(leg, S) for leg in legs)

def breakevens(legs, prices):
    out = []
    p = [position_profit(legs, S) for S in prices]
    for i in range(len(prices)):
        if p[i] == 0:
            out.append(prices[i])
        elif i + 1 < len(prices) and p[i] * p[i + 1] < 0:
            a, b = prices[i], prices[i + 1]
            out.append(a + (b - a) * -p[i] / (p[i + 1] - p[i]))
    return out

def report(legs, prices):
    # returns {'max_profit': ..., 'max_loss': ..., 'breakevens': [...]}
    pass`,
          solution: `def payoff(kind, S, K):
    if kind == 'call':
        return max(S - K, 0)
    return max(K - S, 0)

def leg_profit(leg, S):
    per_share = payoff(leg['kind'], S, leg['strike']) - leg['premium']
    sign = 1 if leg['side'] == 'long' else -1
    return sign * per_share * 100 * leg['qty']

def position_profit(legs, S):
    return sum(leg_profit(leg, S) for leg in legs)

def breakevens(legs, prices):
    out = []
    p = [position_profit(legs, S) for S in prices]
    for i in range(len(prices)):
        if p[i] == 0:
            out.append(prices[i])
        elif i + 1 < len(prices) and p[i] * p[i + 1] < 0:
            a, b = prices[i], prices[i + 1]
            out.append(a + (b - a) * -p[i] / (p[i + 1] - p[i]))
    return out

def report(legs, prices):
    curve = [position_profit(legs, S) for S in prices]
    net_calls = sum(leg['qty'] * (1 if leg['side'] == 'long' else -1) for leg in legs if leg['kind'] == 'call')
    return {
        'max_profit': None if net_calls > 0 else max(curve),
        'max_loss': None if net_calls < 0 else min(curve),
        'breakevens': breakevens(legs, prices),
    }`,
          tests: `grid = list(range(0, 201))
r = report([{'kind': 'call', 'side': 'long', 'strike': 100, 'premium': 2.5, 'qty': 1}], grid)
assert r is not None, "the function returns nothing yet"
assert r['max_profit'] is None, "a long call has unlimited profit: max_profit should be None"
assert r['max_loss'] == -250, f"a long call can lose its premium, -250, got {r['max_loss']}"
r = report([{'kind': 'call', 'side': 'short', 'strike': 100, 'premium': 2.5, 'qty': 1}], grid)
assert r['max_loss'] is None, "a naked short call has unlimited loss: max_loss should be None, not the worst point on the grid"
assert r['max_profit'] == 250, "a short call can make at most its premium"
r = report([{'kind': 'put', 'side': 'short', 'strike': 50, 'premium': 2, 'qty': 1}], grid)
assert r['max_loss'] == -4800 and r['max_profit'] == 200, f"a short 50 put sold at 2 can lose (50 - 2) x 100 = 4800 and make 200, got {r}"
spread = [{'kind': 'call', 'side': 'long', 'strike': 100, 'premium': 3, 'qty': 1},
          {'kind': 'call', 'side': 'short', 'strike': 110, 'premium': 1, 'qty': 1}]
r = report(spread, grid)
assert (r['max_profit'], r['max_loss']) == (800, -200), "a call spread is limited on both sides: 800 and -200"
assert [round(x, 6) for x in r['breakevens']] == [102], "the spread breaks even at 100 + 3 - 1 = 102"`,
          hint: 'Count long calls as +qty and short calls as −qty. Puts cannot make a position unlimited, because the price stops at 0.',
          why: 'Beyond the highest strike only calls still change the profit, by $100 per point for each net call. A grid from 0 catches the worst case on the downside, where puts stop paying more, so only the upside can be unlimited.',
        },
        {
          kind: 'design',
          id: 'options-lab-8',
          ask: 'You will use this engine to check positions before you trade them. How would you test it and what would you add before relying on it?',
          checklist: [
            { point: 'Test cases worked out by hand for each of the four single legs', why: 'Long and short calls and puts are where sign errors hide.' },
            { point: 'A test that buyer and seller of the same leg always sum to zero', why: 'That property catches many mistakes at once.' },
            { point: 'A grid that starts at 0 and includes every strike', why: 'Interpolation is exact only when strikes are on the grid, and the downside worst case is at 0.' },
            { point: 'Fees per contract on the way in and out', why: 'Real breakevens are further away than the clean ones.' },
            { point: 'A share leg, for covered calls', why: 'Positions often combine options with stock.' },
            { point: 'A clear warning that this is the payoff at expiry only', why: 'Before expiry the option still has extrinsic value; the pricing module adds that.' },
          ],
          why: 'A small engine checked on known cases is something you can trust. The additions turn it into a tool that matches real trades.',
        },
      ],
    },
  ],
}
