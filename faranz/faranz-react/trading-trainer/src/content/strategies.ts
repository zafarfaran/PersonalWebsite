import type { Module } from '../types'

export const strategies: Module = {
  id: 'strategies',
  title: 'Spreads and structures',
  summary:
    'Combining options to shape risk: debit and credit verticals, straddles and strangles, iron condors, calendars, and how to match a structure to a view. Every structure comes with its maximum profit, maximum loss and breakevens.',
  lessons: [
    {
      id: 'strategies-why',
      title: 'Why spread',
      summary: 'Selling one option against another lowers the cost and fixes the worst case, and you pay for it with a capped profit.',
      widget: 'strategies-cap',
      text: [
        'A single bought option has a known worst case, the premium, but it is expensive and needs a big move to pay. A single sold option collects premium but can lose far more than it collected. A **spread** holds two or more options on the same underlying at once, so that one leg pays for, or protects, the other.',
        'The simplest example: the stock is at 100. You buy the 100 call for 3.00 and sell the 105 call for 1.20, same expiry. You pay a **net debit** of 1.80, which is $180 for one contract of 100 shares. That is the most you can lose. Above 105 the two calls move together, so the profit stops growing at the width of 5.00 minus the 1.80 you paid: $320. The breakeven at expiry is 100 + 1.80 = 101.80.',
        'Compare the call on its own: $300 at risk, breakeven 103, and no ceiling on the profit. The spread costs less, breaks even sooner and loses less, but if the stock runs to 120 the call makes $1,700 and the spread still makes $320. That is the trade: **defined risk and a lower cost, in exchange for a capped profit**.',
        'The sold leg also softens the Greeks (pricing module: the sensitivities of an option price). It decays and loses value to falling volatility at the same time as the bought leg, so the spread loses less to time and to a drop in implied volatility, and gains less from a fast move.',
        'A position is **defined risk** when its worst case is fixed by the strikes before you enter. Naked short options, short straddles and short strangles are **undefined risk**: the loss is limited only by how far the stock can move. Defined risk is what makes the sizing rules of the risk module work: you can only risk 1% of an account if you know what you can lose.',
        'Spreads are not free. Every leg has its own bid-ask spread and its own fee, so a two-leg trade costs roughly twice as much to get in and out of as one option. On a small target that cost is a large share of the edge.',
      ],
      rules: [
        'A spread: buy one option and sell another on the same underlying, so one leg pays for or protects the other.',
        'Debit spread: maximum loss = the net debit. Maximum profit = width − debit.',
        'Defined risk means the worst case is fixed by the strikes before you enter.',
        'The price of a lower cost and a defined loss is a capped profit.',
        'The short leg offsets the long leg: less decay, less vega, and less gain from a fast move.',
        'Each leg pays its own spread and fees.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'strategies-why-1',
          ask: 'The stock is at 100. You buy the 100 call for 3.00 and sell the 105 call for 1.20, same expiry. What do you pay for one spread, in dollars?',
          answer: 180,
          check: '(3.00 - 1.20) * 100',
          why: 'Net debit = 3.00 − 1.20 = 1.80 per share, times 100 shares = $180. Both calls expire worthless below 100, so that $180 is also the maximum loss.',
        },
        {
          kind: 'number',
          id: 'strategies-why-2',
          ask: 'Same spread: long 100 call, short 105 call, paid 1.80. What is the maximum profit at expiry for one spread, in dollars?',
          answer: 320,
          check: '(105 - 100 - 1.80) * 100',
          why: 'Above 105 the spread is worth its full width, 5.00. Subtract the 1.80 paid: 3.20 per share, $320 per contract. It cannot be worth more than the width however far the stock goes.',
        },
        {
          kind: 'number',
          id: 'strategies-why-3',
          ask: 'Same spread, paid 1.80. At what stock price at expiry do you break even?',
          answer: 101.8,
          check: '100 + 1.80',
          why: 'At expiry the spread is worth the stock price minus 100 (while below 105). It is worth the 1.80 you paid at 101.80. The call alone, bought for 3.00, needs 103.',
        },
        {
          kind: 'choice',
          id: 'strategies-why-4',
          ask: 'Same trade. At expiry the stock is at 120. How do the 100 call on its own (bought for 3.00) and the 100/105 call spread (bought for 1.80) compare, per contract?',
          options: ['The call makes $1,700 and the spread makes $320', 'Both make $1,700', 'The spread makes more because it cost less', 'The call makes $2,000 and the spread makes $500'],
          answer: 0,
          why: 'The call is worth 20.00, minus 3.00 paid: $1,700. The spread is capped at its width, 5.00, minus 1.80 paid: $320. The spread wins on a small move and loses on a big one. That is the cap you accepted.',
        },
        {
          kind: 'number',
          id: 'strategies-why-5',
          ask: 'Same trade. At expiry the stock is at 104. What is the P&L of the spread (paid 1.80) for one contract, in dollars?',
          answer: 220,
          check: '(max(104 - 100, 0) - max(104 - 105, 0) - 1.80) * 100',
          why: 'The 100 call is worth 4.00 and the 105 call is worthless: 4.00 − 1.80 = 2.20, so $220. The call alone would make 4.00 − 3.00 = $100 here. For moderate moves the cheaper spread does better.',
        },
        {
          kind: 'choice',
          id: 'strategies-why-6',
          ask: 'You own the 100/105 call spread. For a week the stock does not move from 100. Compared with owning the 100 call alone, what happens to your P&L?',
          options: [
            'You lose less to time decay, because the short 105 call is decaying in your favour at the same time',
            'You lose more, because you hold two options that both decay',
            'Nothing happens to either, because the stock did not move',
            'The spread gains, because a spread always has positive theta',
          ],
          answer: 0,
          why: 'Time decay hurts the option you bought and helps the one you sold, so the two partly cancel. Two decaying options do not decay twice against you: you are short one of them. Whether the net theta is positive depends on where the stock is relative to the strikes.',
        },
        {
          kind: 'choice',
          id: 'strategies-why-7',
          ask: 'In the figure, move the short strike from 115 down to 103. What happens to the readouts for the spread?',
          options: [
            'The debit, the maximum loss, the breakeven and the maximum profit all fall',
            'The debit rises and the maximum profit rises',
            'Only the maximum profit changes',
            'The breakeven moves above the short strike',
          ],
          answer: 0,
          why: 'A nearer short strike is worth more, so selling it pays more and the debit (which is the maximum loss) falls. The breakeven is the long strike plus the debit, so it falls too. But the width shrinks to 3, so the most you can make falls. Cheaper and safer always comes with a lower ceiling.',
        },
        {
          kind: 'output',
          id: 'strategies-why-8',
          ask: 'The P&L at expiry of the 100/105 call spread bought for 1.80, at three prices. What does this print?',
          code: `def call_value(price, strike):
    return max(price - strike, 0)

def spread_pnl(price):
    return round(100 * (call_value(price, 100) - call_value(price, 105) - 1.80), 2)

print([spread_pnl(p) for p in (95, 103, 110)])`,
          answer: '[-180.0, 120.0, 320.0]',
          why: 'At 95 both calls are worthless and you lose the debit. At 103 the long call is worth 3.00 and the short one nothing: 3.00 − 1.80 = 1.20. At 110 the spread is worth its full width of 5.00, and 5.00 − 1.80 = 3.20, the cap.',
        },
        {
          kind: 'bug',
          id: 'strategies-why-9',
          ask: 'This should give the P&L at expiry, per contract, of a call spread: long the lower strike, short the higher. Above the short strike it keeps rising, which a spread cannot do.',
          code: `def call_spread_pnl(price, k_long, k_short, debit):
    long_leg = max(price - k_long, 0)
    short_leg = max(price - k_short, 0)
    return (long_leg + short_leg - debit) * 100`,
          line: 4,
          fix: '    return (long_leg - short_leg - debit) * 100',
          why: 'You sold the higher call, so its value counts against you. Subtracting it is what caps the spread at its width: above the short strike every extra dollar gained on one leg is lost on the other.',
        },
        {
          kind: 'choice',
          id: 'strategies-why-10',
          ask: 'Which of these positions has a worst case that is fixed by its strikes before you enter?',
          options: ['A long 100/105 call spread', 'A naked short 105 call', 'A short 95/105 strangle', 'Short 100 shares of the stock'],
          answer: 0,
          why: 'The call spread cannot lose more than its debit. A naked short call and a short strangle lose more for every dollar the stock rises, with no limit. Short shares have the same unlimited upside risk. Those are undefined risk.',
        },
        {
          kind: 'design',
          id: 'strategies-why-11',
          ask: 'A friend is sure a $100 stock will rise and wants to put $3,000 into ten of the 100 calls at 3.00. Explain what a 100/105 call spread would change, both good and bad, before they decide anything.',
          checklist: [
            { point: 'The spread costs less: about $1,800 for ten at 1.80, so less is at risk', why: 'The debit is the maximum loss, and it is smaller than the cost of the calls.' },
            { point: 'The breakeven is lower: 101.80 instead of 103', why: 'A smaller move is enough to start making money.' },
            { point: 'The profit is capped at $320 per spread above 105', why: 'If the stock runs far, the calls make much more. That is the price of the lower cost.' },
            { point: 'Both positions can still lose everything put in', why: 'A defined loss is not a small loss. Below 100 at expiry both are worth nothing.' },
            { point: 'Two legs mean two bid-ask spreads and two fees on the way in and out', why: 'Costs are a larger share of a spread than of a single option.' },
            { point: 'Being "sure" is not a reason: size by what the account can lose, and paper trade first', why: 'Risk per trade comes from the account, not from confidence. This is education, not a recommendation to trade.' },
          ],
          why: 'A spread is not better or worse than a call. It changes the shape: less cost and less risk, a nearer breakeven, a capped profit, and more legs to pay for.',
        },
      ],
    },
    {
      id: 'strategies-debit',
      title: 'Debit verticals: bull call and bear put spreads',
      summary: 'Pay to own a directional view between two strikes: the debit is the most you can lose.',
      text: [
        'A **vertical spread** uses two options of the same type and the same expiry at different strikes. When you pay to enter, it is a **debit spread**. The two debit verticals are the directional ones: the **bull call spread** (buy a lower call, sell a higher call) for a rise, and the **bear put spread** (buy a higher put, sell a lower put) for a fall.',
        'The numbers follow from the width (the gap between strikes) and the debit. Maximum loss = the debit. Maximum profit = width − debit. Breakeven: lower strike + debit for a bull call spread, higher strike − debit for a bear put spread. Multiply by 100 for one contract.',
        { code: `# bear put spread: stock at 50
# buy the 50 put for 2.10, sell the 45 put for 0.60
debit = 2.10 - 0.60            # 1.50 -> max loss $150
max_profit = (50 - 45) - debit  # 3.50 -> $350 below 45
breakeven = 50 - debit          # 48.50` },
        "The strikes are your view written down. The long strike is where the trade starts to pay, the short strike is where you stop being paid, so a common rule of thumb is to put the short strike near your target. A spread whose debit is close to its width has little left to gain; one whose debit is tiny is a bet on a move the market thinks is unlikely.",
        'Greeks: a debit vertical has a smaller delta than its long leg alone (the short leg takes some away). Far from expiry it gains slowly even when you are right. Its theta depends on where the stock is: near the long strike, time works against you; near or beyond the short strike, time works for you, because the spread drifts towards its full width.',
        "On American-style options such as SPY, a short leg that is deep in the money can be **assigned early**, most often a short call before an ex-dividend date. Your long leg still covers you, but you wake up with a share position. SPX options are European style and cash settled, so there is no early assignment. Close a spread before expiry rather than leaving a leg near the money to be settled.",
      ],
      rules: [
        'Bull call: buy lower call, sell higher call. Bear put: buy higher put, sell lower put.',
        'Max loss = debit. Max profit = width − debit. Times 100 per contract.',
        'Breakeven: lower strike + debit (bull call), higher strike − debit (bear put).',
        'Put the long strike where the move starts and the short strike near your target.',
        'Near the short strike, time helps a debit spread; near the long strike, it hurts.',
        'American-style short legs can be assigned early; close spreads before expiry.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'strategies-debit-1',
          ask: 'The stock is at 50. You buy the 50 put for 2.10 and sell the 45 put for 0.60. What is the maximum loss for one spread, in dollars?',
          answer: 150,
          check: '(2.10 - 0.60) * 100',
          why: 'The debit is 2.10 − 0.60 = 1.50, so $150. If the stock is at or above 50 at expiry, both puts expire worthless and the whole debit is lost.',
        },
        {
          kind: 'number',
          id: 'strategies-debit-2',
          ask: 'Same bear put spread: long 50 put, short 45 put, debit 1.50. What is the maximum profit for one spread, in dollars?',
          answer: 350,
          check: '(50 - 45 - 1.50) * 100',
          why: 'Below 45 the spread is worth its width, 5.00. Take off the 1.50 paid: 3.50, so $350. A fall to 30 pays no more than a fall to 45.',
        },
        {
          kind: 'number',
          id: 'strategies-debit-3',
          ask: 'Same bear put spread, debit 1.50. What is the breakeven stock price at expiry?',
          answer: 48.5,
          check: '50 - 1.50',
          why: 'Between the strikes the spread is worth 50 minus the stock price. It is worth the 1.50 you paid at 48.50. For puts the breakeven is below the long strike, because you need a fall.',
        },
        {
          kind: 'number',
          id: 'strategies-debit-4',
          ask: 'Same bear put spread. At expiry the stock is at 47. What is the P&L for one spread, in dollars?',
          answer: 150,
          check: '(max(50 - 47, 0) - max(45 - 47, 0) - 1.50) * 100',
          why: 'The 50 put is worth 3.00, the 45 put is worthless. 3.00 − 1.50 = 1.50, so +$150.',
        },
        {
          kind: 'choice',
          id: 'strategies-debit-5',
          ask: 'You buy a QQQ 400/405 bull call spread for 2.00. At expiry QQQ is at 403. What is the P&L of one spread?',
          options: ['+$100', '+$300', '−$200', '+$50'],
          answer: 0,
          why: 'The 400 call is worth 3.00, the 405 call nothing. 3.00 − 2.00 = 1.00, so $100. The maximum of $300 needs 405 or higher; $300 is the tempting answer if you forget that the price stopped short of the short strike.',
        },
        {
          kind: 'choice',
          id: 'strategies-debit-6',
          ask: 'You hold a 100/110 bull call spread. Two days before expiry the stock is at 109 and the spread is worth about 8.45. If the stock stays at 109, what does time do to the spread?',
          options: [
            'It helps: the spread drifts up towards 9.00, its value at expiry',
            'It hurts: every long option loses value with time',
            'Nothing, because the two legs cancel exactly',
            'It helps, and the spread will reach its full width of 10.00',
          ],
          answer: 0,
          why: 'At expiry with the stock at 109 the long call is worth 9 and the short 110 call nothing. Today the short call, being near the money, still has more time value than the long call, which holds the spread below 9. As that time value melts, the spread rises. It cannot reach 10 unless the stock gets to 110.',
        },
        {
          kind: 'output',
          id: 'strategies-debit-7',
          ask: 'A bull call spread calculator. What does this print?',
          code: `def bull_call(k_long, k_short, debit):
    width = k_short - k_long
    max_loss = round(debit * 100)
    max_profit = round((width - debit) * 100)
    return max_loss, max_profit, k_long + debit

print(bull_call(400, 405, 2.0))`,
          answer: '(200, 300, 402.0)',
          why: 'Debit 2.00 is the maximum loss ($200). The width is 5, so the maximum profit is 3.00 ($300). The breakeven is the long strike plus the debit, 402.0, a float because the debit is a float.',
        },
        {
          kind: 'bug',
          id: 'strategies-debit-8',
          ask: 'This should describe a bear put spread. The maximum loss and profit are right, but the breakeven comes out below the short strike, where the spread is already at its maximum.',
          code: `def bear_put(k_long, k_short, debit):
    # k_long is the higher strike (bought), k_short the lower (sold)
    max_loss = debit * 100
    max_profit = (k_long - k_short - debit) * 100
    breakeven = k_short - debit
    return max_loss, max_profit, breakeven`,
          line: 5,
          fix: '    breakeven = k_long - debit',
          why: 'A put gains as the stock falls below its strike. The bought put has to be worth the debit, so the stock must be the debit below the long (higher) strike. For the 50/45 spread at 1.50 that is 48.50, not 43.50.',
        },
        {
          kind: 'write',
          id: 'strategies-debit-9',
          ask: 'Write the P&L at expiry of one bull call spread, in dollars per contract (100 shares).',
          starter: `def bull_call_pnl(price, k_long, k_short, debit):
    # long the k_long call, short the k_short call (k_long < k_short)
    # debit: what you paid per share
    pass`,
          solution: `def bull_call_pnl(price, k_long, k_short, debit):
    value = max(price - k_long, 0) - max(price - k_short, 0)
    return (value - debit) * 100`,
          tests: `out = bull_call_pnl(104, 100, 105, 1.80)
assert out is not None, "the function returns nothing yet"
assert abs(out - 220) < 1e-6, f"at 104 the 100/105 spread bought for 1.80 makes $220, got {out}"
assert abs(bull_call_pnl(90, 100, 105, 1.80) + 180) < 1e-6, "below the long strike you lose the whole debit: -180"
assert abs(bull_call_pnl(150, 100, 105, 1.80) - 320) < 1e-6, "far above the short strike the profit is capped at (5 - 1.80) * 100 = 320"
assert abs(bull_call_pnl(101.8, 100, 105, 1.80)) < 1e-6, "101.80 is the breakeven"`,
          hint: 'Value of the long call minus value of the short call, minus the debit, times 100.',
          why: 'Two hockey sticks, one bought and one sold. The short one cancels the long one above its strike, which flattens the profit at width minus debit.',
        },
        {
          kind: 'choice',
          id: 'strategies-debit-10',
          ask: 'You hold a SPY 500/505 bull call spread. SPY closes at 515 the day before it goes ex-dividend. Which risk does this spread have that the same spread on SPX would not?',
          options: [
            'The short 505 call can be assigned early, leaving you short SPY shares overnight, still covered by your long 500 call',
            'The long 500 call can be taken away from you',
            'SPY options cannot be closed before expiry',
            'There is no difference between the two',
          ],
          answer: 0,
          why: 'SPY options are American style and settle in shares, so a deep in-the-money short call may be exercised early, most often the day before an ex-dividend date. You then hold short shares and a long call. SPX options are European style and cash settled: no early exercise and no shares. Check the contract details with your broker.',
        },
        {
          kind: 'choice',
          id: 'strategies-debit-11',
          ask: 'A stock is at 190. You think it can reach about 200 by Friday and not much more. Which call spread expresses that view best?',
          options: ['Buy 190, sell 200', 'Buy 190, sell 250', 'Buy 200, sell 210', 'Buy 180, sell 185'],
          answer: 0,
          why: 'The long strike starts the payoff where the stock is and the short strike sits at the target, so you are paid for the move you expect. Selling 250 pays almost nothing for a move you do not expect. 200/210 needs the stock to go past your target before it earns. 180/185 is already in the money, costs close to its width and has little left to gain.',
        },
        {
          kind: 'design',
          id: 'strategies-debit-12',
          ask: 'Plan a bear put spread on a $50 stock you think may fall to about 45 within two weeks. Write down everything you would decide before placing it.',
          checklist: [
            { point: 'Strikes: buy around 50, sell around 45, matching the target', why: 'The width is the range you expect to be paid for.' },
            { point: 'Debit, maximum loss, maximum profit and breakeven, in dollars per contract', why: 'You know the worst case before entering. Here, for example, 1.50 means $150 at risk and $350 at best.' },
            { point: 'Number of contracts from a fixed fraction of the account divided by the debit', why: 'The debit is the risk per spread, so sizing is a division.' },
            { point: 'An expiry that leaves time for the move', why: 'A debit spread that needs a move loses if the move comes too late.' },
            { point: 'An exit plan: a target (for example a share of the maximum profit) and a stop or a date to give up', why: 'You rarely hold to expiry; decide in advance what makes you close.' },
            { point: 'Liquidity: tight bid-ask on both strikes, enter as one spread order at a limit price', why: 'Two wide markets can eat a large part of a $350 maximum.' },
            { point: 'What would make the view wrong', why: 'A plan without an invalidation turns into hoping.' },
          ],
          why: 'A debit spread fixes the risk, but you still choose the strikes, the size, the expiry and the exits. Writing them before the trade is what keeps it a plan.',
        },
      ],
    },
    {
      id: 'strategies-credit',
      title: 'Credit verticals: bull put and bear call spreads',
      summary: 'Collect premium with a protective leg: frequent small wins, rarer large losses, and a win rate you must beat.',
      widget: 'strategies-odds',
      text: [
        'A **credit spread** sells the option nearer the money and buys one further out, so you are paid to enter. The **bull put spread** (sell a higher put, buy a lower put) profits if the stock stays above the short strike. The **bear call spread** (sell a lower call, buy a higher call) profits if it stays below. You do not need the stock to move, only not to move against you.',
        'Maximum profit = the credit. Maximum loss = width − credit. Breakeven: short strike − credit for a bull put, short strike + credit for a bear call. Example: SPY at 500, sell the 490 put for 2.40, buy the 485 put for 1.40. Credit 1.00 ($100), maximum loss 4.00 ($400), breakeven 489.',
        'This is the core of credit trading: you risk $400 to make $100. If every trade ends at one extreme or the other, you break even only when you win more than **maximum loss ÷ (maximum profit + maximum loss)** of the time: 400 ÷ 500 = 80%. A high win rate is not an edge; it is the price of the payoff.',
        'The delta of the short option is a rough, model-based guide to its chance of finishing in the money (pricing module), so a short strike with a delta of 0.20 finishes out of the money about 80% of the time in the model. If the options are fairly priced, the high win rate and the large losses cancel and expectancy before costs is about zero. An edge exists only if the market overprices the move, and that must be measured, not assumed.',
        'Margin: under the exchange rule at the time of writing (2026, Cboe Margin Manual), a credit spread needs cash equal to its maximum potential loss, the width, and the premium collected can be put towards it, so about width − credit is tied up per spread. Brokers may ask for more: check with yours. As with debit spreads, a short leg in the money can be assigned early on American-style options, and a price between the strikes at expiry leaves you unsure what you will hold, so close before then.',
        'A bull put spread and a bull call spread on the same two strikes have almost the same payoff: one is paid a credit, the other pays a debit, and credit + debit ≈ width. Choosing between them is about fills, assignment and which options are liquid, not about a different bet.',
      ],
      rules: [
        'Bull put: sell higher put, buy lower put. Bear call: sell lower call, buy higher call.',
        'Max profit = credit. Max loss = width − credit. Times 100 per contract.',
        'Breakeven: short strike − credit (bull put), short strike + credit (bear call).',
        'Breakeven win rate = max loss ÷ (max profit + max loss). A high win rate is paid for by large losses.',
        'Short-strike delta is a rough model chance of finishing in the money, not a promise.',
        'Cash tied up is about width − credit under the exchange rule; your broker may want more.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'strategies-credit-1',
          ask: 'SPY is at 500. You sell the 490 put for 2.40 and buy the 485 put for 1.40. What is the maximum profit for one spread, in dollars?',
          answer: 100,
          check: '(2.40 - 1.40) * 100',
          why: 'Credit = 2.40 − 1.40 = 1.00, so $100. You keep all of it if SPY is above 490 at expiry, when both puts expire worthless.',
        },
        {
          kind: 'number',
          id: 'strategies-credit-2',
          ask: 'Same bull put spread: short 490 put, long 485 put, credit 1.00. What is the maximum loss for one spread, in dollars?',
          answer: 400,
          check: '(490 - 485 - 1.00) * 100',
          why: 'Below 485 the spread costs its full width, 5.00, to buy back. You received 1.00, so you lose 4.00, $400. The long 485 put is what stops the loss there.',
        },
        {
          kind: 'number',
          id: 'strategies-credit-3',
          ask: 'Same bull put spread, credit 1.00. What is the breakeven price of SPY at expiry?',
          answer: 489,
          check: '490 - 1.00',
          why: 'At 489 the short 490 put is worth 1.00, exactly the credit you received. Above it you keep part of the credit; below it you lose.',
        },
        {
          kind: 'number',
          id: 'strategies-credit-4',
          ask: 'Same spread: risk $400 to make $100. If every trade ends at full profit or full loss, what win rate do you need to break even? Give a percentage, for example 25%.',
          answer: 0.8,
          check: '400 / (100 + 400)',
          why: 'Break even when p × 100 = (1 − p) × 400, so p = 400 ÷ 500 = 80%. Below that you lose money while still winning most of your trades.',
        },
        {
          kind: 'choice',
          id: 'strategies-credit-5',
          ask: 'In the figure, set the width to 10 and the credit to 2.00, then set the chance of a win to 80%. What is the expectancy per trade, before costs?',
          options: ['About $0', 'About +$160', 'About +$200', 'About −$160'],
          answer: 0,
          why: 'Win: 0.8 × $200 = $160. Lose: 0.2 × $800 = $160. They cancel. An 80% win rate sounds good, but on these numbers it only breaks even, and fees then make it negative.',
        },
        {
          kind: 'number',
          id: 'strategies-credit-6',
          ask: 'A stock is at 80. You sell the 85 call for 1.30 and buy the 90 call for 0.50. At expiry the stock is at 87. What is your P&L for one spread, in dollars? Use a minus sign for a loss.',
          answer: -120,
          check: '(1.30 - 0.50 - max(87 - 85, 0) + max(87 - 90, 0)) * 100',
          why: 'Credit 0.80. The short 85 call is worth 2.00 against you, the 90 call nothing. 0.80 − 2.00 = −1.20, so −$120. The breakeven was 85.80, and 87 is past it.',
        },
        {
          kind: 'choice',
          id: 'strategies-credit-7',
          ask: 'You sell a put spread whose short put has a delta of −0.20. What is a fair way to read that?',
          options: [
            'Under the pricing model, roughly an 80% chance the short put finishes out of the money, so roughly an 80% chance of keeping the whole credit',
            'A guaranteed 80% win rate over many trades',
            'A 20% chance of making the maximum profit',
            'The spread loses 20% of its value each day',
          ],
          answer: 0,
          why: 'Delta is a rough, model-based probability of finishing in the money, built from implied volatility. It is not a guarantee, and real outcomes cluster: a sell-off can hit many of these trades at once.',
        },
        {
          kind: 'output',
          id: 'strategies-credit-8',
          ask: 'Expectancy of a 5-wide credit spread sold for 1.00, at two win rates, treating every trade as a full win or a full loss. What does this print?',
          code: `def expectancy(p_win, credit, width):
    win = credit * 100
    loss = (width - credit) * 100
    return round(p_win * win - (1 - p_win) * loss, 2)

print(expectancy(0.85, 1.0, 5), expectancy(0.75, 1.0, 5))`,
          answer: '25.0 -25.0',
          why: '0.85 × 100 − 0.15 × 400 = 85 − 60 = 25. At 75%: 75 − 100 = −25. Ten points of win rate turn a small gain into a small loss: the breakeven is 80%.',
        },
        {
          kind: 'bug',
          id: 'strategies-credit-9',
          ask: 'This describes a bear call spread per contract. The maximum loss comes out too large.',
          code: `def bear_call(k_short, k_long, credit):
    width = k_long - k_short
    max_profit = credit * 100
    max_loss = (width + credit) * 100
    breakeven = k_short + credit
    return max_profit, max_loss, breakeven`,
          line: 4,
          fix: '    max_loss = (width - credit) * 100',
          why: 'The most the spread can cost to close is its width, and you already received the credit, so the loss is width minus credit. Adding the credit counts the premium against you twice.',
        },
        {
          kind: 'number',
          id: 'strategies-credit-10',
          ask: 'Under the exchange rule described in the lesson, how much cash is tied up by one 5-wide credit spread sold for 1.00, after the credit is applied? In dollars.',
          answer: 400,
          check: '(5 - 1.00) * 100',
          why: 'The requirement is the maximum potential loss, the width of $500, and the $100 credit can be put towards it: $400, which is also the maximum loss. This was the rule at the time of writing (2026); brokers may require more, so check yours.',
        },
        {
          kind: 'choice',
          id: 'strategies-credit-11',
          ask: 'The 100/105 bull call spread costs 2.00. Roughly what credit would you expect for the 100/105 bull put spread on the same stock and expiry (sell the 105 put, buy the 100 put)?',
          options: ['About 3.00', 'About 2.00', 'About 5.00', 'About 1.00'],
          answer: 0,
          why: 'The two have nearly the same payoff, so they should cost the same in the end: debit + credit ≈ width, and 5.00 − 2.00 = 3.00. Rates, dividends and early exercise make it only roughly equal.',
        },
        {
          kind: 'design',
          id: 'strategies-credit-12',
          ask: 'A trader sold 5-wide put spreads for 1.00 each. Fifteen trades in a row won $100. The sixteenth gapped through both strikes and lost $400 on each of four contracts. Review what happened and what they should check.',
          checklist: [
            { point: 'Total: 15 × $100 = $1,500 won, then 4 × $400 = $1,600 lost, so behind overall', why: 'Many small wins and one large loss is the normal shape of this trade, not bad luck.' },
            { point: 'Compare the real win rate with the breakeven of 80%', why: '15 of 16 is about 94%, but the sample is small and losses cluster in sell-offs.' },
            { point: 'Size was raised to four contracts after the streak', why: 'Sizing up after wins puts the largest size on exactly when the loss arrives.' },
            { point: 'Was the risk counted as $400 per contract when sizing?', why: 'The risk of a credit spread is width − credit, not the credit.' },
            { point: 'Costs: fees and the bid-ask on two legs, in and out, on every trade', why: 'They come off a $100 maximum and can remove a thin edge.' },
            { point: 'A written exit rule for losing trades', why: 'Closing at a fixed loss can avoid the full width in a slow move; holding and hoping usually reaches it. A gap can still skip the stop.' },
          ],
          why: 'Credit spreads feel safe because they win often. The review has to be about money, not the count of wins: expectancy, size and how the loss was handled.',
        },
      ],
    },
    {
      id: 'strategies-straddle',
      title: 'Straddles and strangles',
      summary: 'Buying movement in either direction, or selling it: the short versions are undefined risk.',
      widget: 'strategies-straddle',
      text: [
        'A **long straddle** buys a call and a put at the same strike and expiry, usually at the money. A **long strangle** buys an out-of-the-money put and an out-of-the-money call. Both are bets on **movement**, not direction: one leg pays if the stock rises, the other if it falls.',
        'Long straddle, stock at 100: buy the 100 call for 4.00 and the 100 put for 3.50, debit 7.50 ($750). Maximum loss $750, if the stock finishes exactly at 100. Breakevens 92.50 and 107.50. The profit grows without limit upwards and up to 92.50 per share if the stock went to zero. A long strangle on 95 and 105 is cheaper but needs a larger move: breakevens are the put strike − debit and the call strike + debit, and the whole debit is lost anywhere between the strikes.',
        'The price of a straddle is the move the market expects (volatility module). Buying it is a bet that the real move will be bigger than that price. Around earnings or a Fed day you often pay for a big move and then lose to **IV crush**: implied volatility falls after the news, and a move smaller than the price paid loses even though the stock did move.',
        'Greeks of the long versions: delta near zero at the start, long gamma (delta grows in the direction of a move), long vega, and steep negative theta: every quiet day costs money.',
        '**Short** straddles and strangles sell both legs. The maximum profit is the credit. The risk is **undefined**: a rise has no limit, and a fall can lose down to the strike minus the credit. Sell the 95/105 strangle for 3.20 and a gap to 130 costs 25.00 − 3.20 = 21.80, $2,180 per contract, nearly seven times what was collected. Brokers ask for large margin on these and often allow them only at high approval levels. If you want to sell movement with a known worst case, buy wings: that is the iron condor of the next lesson.',
      ],
      rules: [
        'Long straddle: buy call and put at the same strike. Breakevens: strike ± debit. Max loss: the debit.',
        'Long strangle: buy OTM put and OTM call. Breakevens: put strike − debit and call strike + debit.',
        'The straddle price is the move the market expects. You profit only from a bigger one.',
        'Long straddles and strangles: long gamma and vega, negative theta. IV crush after events hurts them.',
        'Short straddles and strangles are undefined risk: the loss can be many times the credit.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'strategies-straddle-1',
          ask: 'The stock is at 100. You buy the 100 call for 4.00 and the 100 put for 3.50. What is the upper breakeven at expiry?',
          answer: 107.5,
          check: '100 + 4.00 + 3.50',
          why: 'The debit is 7.50. Above 100 only the call is worth anything, and it is worth 7.50 at 107.50.',
        },
        {
          kind: 'number',
          id: 'strategies-straddle-2',
          ask: 'Same straddle, debit 7.50. What is the lower breakeven at expiry?',
          answer: 92.5,
          check: '100 - 7.50',
          why: 'Below 100 only the put is worth anything, and it is worth 7.50 at 92.50. The stock has to leave the band from 92.50 to 107.50 before the trade pays.',
        },
        {
          kind: 'number',
          id: 'strategies-straddle-3',
          ask: 'Same straddle. At expiry the stock is at 112. What is the P&L for one straddle, in dollars?',
          answer: 450,
          check: '(max(112 - 100, 0) + max(100 - 112, 0) - 7.50) * 100',
          why: 'The call is worth 12.00 and the put nothing. 12.00 − 7.50 = 4.50, so $450. A 12% move made 60% on the money paid.',
        },
        {
          kind: 'number',
          id: 'strategies-straddle-4',
          ask: 'Same straddle. What is the maximum loss for one straddle, in dollars?',
          answer: 750,
          check: '(4.00 + 3.50) * 100',
          why: 'If the stock finishes exactly at 100 both options expire worthless and the whole $750 is lost. Anywhere near 100, most of it is.',
        },
        {
          kind: 'number',
          id: 'strategies-straddle-5',
          ask: 'Instead you buy the 95 put for 1.50 and the 105 call for 1.70, a strangle. At expiry the stock is at 108. What is the P&L for one strangle, in dollars? Use a minus sign for a loss.',
          answer: -20,
          check: '(max(108 - 105, 0) + max(95 - 108, 0) - 1.50 - 1.70) * 100',
          why: 'The 105 call is worth 3.00, the put nothing. The debit was 3.20, so −0.20: −$20. An 8% move still loses, because the upper breakeven is 108.20.',
        },
        {
          kind: 'number',
          id: 'strategies-straddle-6',
          ask: 'You sell the 95 put for 1.50 and the 105 call for 1.70 (a short strangle). Overnight the stock gaps to 130. What is the P&L at expiry for one strangle, in dollars? Use a minus sign for a loss.',
          answer: -2180,
          check: '(1.50 + 1.70 - max(130 - 105, 0) - max(95 - 130, 0)) * 100',
          why: 'Credit 3.20. The short 105 call is worth 25.00 against you: 3.20 − 25.00 = −21.80, so −$2,180, nearly seven times what you collected. Nothing caps it; at 150 it would be −$4,180.',
        },
        {
          kind: 'choice',
          id: 'strategies-straddle-7',
          ask: 'You buy an at-the-money straddle. Which describes its Greeks at the start?',
          options: [
            'Delta near zero, positive gamma, positive vega, negative theta',
            'Large positive delta, negative gamma, negative vega, positive theta',
            'Delta near zero, negative gamma, negative vega, positive theta',
            'All Greeks near zero because the call and put cancel',
          ],
          answer: 0,
          why: 'The call delta (about +0.5) and the put delta (about −0.5) cancel. Both options are bought, so their gamma, vega and theta add up: long gamma and vega, and both decaying against you. The third option describes the short straddle.',
        },
        {
          kind: 'choice',
          id: 'strategies-straddle-8',
          ask: 'Before earnings you buy a straddle for 8.00. After the report the stock jumps 5 points, implied volatility collapses, and the straddle is worth about 5.60. Why did you lose while being right that it would move?',
          options: [
            'The move was smaller than the 8.00 you paid for, and the fall in implied volatility took most of the remaining time value',
            'Straddles only pay on downward moves',
            'The market maker cancelled your profit',
            'You lost because delta was zero',
          ],
          answer: 0,
          why: 'The straddle price was the move the market expected. The stock moved less than that, and once the event passed the options lost the extra volatility they had been priced with. That is IV crush: a long straddle needs a move bigger than its price.',
        },
        {
          kind: 'choice',
          id: 'strategies-straddle-9',
          ask: 'In the figure, choose Short straddle and drag the move up to +20. What do you see?',
          options: [
            'The loss keeps growing as the move grows, with no floor: the maximum loss readout says unlimited',
            'The loss stops at the credit received',
            'The position profits more the further the stock moves',
            'The loss stops at the strike',
          ],
          answer: 0,
          why: 'Above the strike the short call loses a dollar for every dollar the stock rises, and nothing is bought to stop it. The credit is the best case, not a limit on the worst.',
        },
        {
          kind: 'output',
          id: 'strategies-straddle-10',
          ask: 'The P&L at expiry of the 100 straddle bought for 7.50, at four prices. What does this print?',
          code: `def straddle_pnl(price, strike, debit):
    value = max(price - strike, 0) + max(strike - price, 0)
    return round((value - debit) * 100)

print([straddle_pnl(p, 100, 7.5) for p in (90, 100, 105, 115)])`,
          answer: '[250, -750, -250, 750]',
          why: 'The straddle is worth the distance from the strike: 10, 0, 5 and 15. Take off 7.50 and multiply by 100. A 5-point move still loses $250.',
        },
        {
          kind: 'write',
          id: 'strategies-straddle-11',
          ask: 'Write the P&L at expiry, per contract, of a strangle: long by default, short when `short=True`. `premium` is the total paid (or received) for both legs, per share.',
          starter: `def strangle_pnl(price, put_k, call_k, premium, short=False):
    # long: pay premium, own the put_k put and the call_k call
    # short: receive premium, owe both
    pass`,
          solution: `def strangle_pnl(price, put_k, call_k, premium, short=False):
    value = max(put_k - price, 0) + max(price - call_k, 0)
    pnl = (value - premium) * 100
    return -pnl if short else pnl`,
          tests: `out = strangle_pnl(100, 95, 105, 3.20)
assert out is not None, "the function returns nothing yet"
assert abs(out + 320) < 1e-6, f"between the strikes a long strangle loses the premium: -320, got {out}"
assert abs(strangle_pnl(108, 95, 105, 3.20) + 20) < 1e-6, "at 108 the call is worth 3.00, so the long strangle makes -20"
assert abs(strangle_pnl(85, 95, 105, 3.20) - 680) < 1e-6, "at 85 the put is worth 10.00: +680"
assert abs(strangle_pnl(100, 95, 105, 3.20, short=True) - 320) < 1e-6, "the short strangle keeps the premium between the strikes: +320"
assert abs(strangle_pnl(130, 95, 105, 3.20, short=True) + 2180) < 1e-6, "a gap to 130 costs the short strangle 2180"`,
          why: "The value is the put intrinsic plus the call intrinsic; at most one is non-zero. The short version is the exact mirror: what the buyer wins, the seller loses, with no cap on the seller's side.",
        },
        {
          kind: 'design',
          id: 'strategies-straddle-12',
          ask: 'Someone wants to sell SPY strangles every week "for income" because they won 10 weeks in a row. Write what they should understand and decide before going on.',
          checklist: [
            { point: 'The position is undefined risk: a large gap can cost many times the weekly credit', why: 'Ten weeks of credits can go in one week.' },
            { point: 'A winning streak says little about the tail', why: 'The losses are rare and large, so ten weeks is a tiny sample.' },
            { point: 'Margin can rise sharply in a sell-off, forcing closes at the worst time', why: 'Undefined-risk margin depends on price and volatility, which jump together.' },
            { point: 'A defined-risk version: buy wings to turn it into an iron condor', why: 'It gives up some credit for a known maximum loss that sizing can use.' },
            { point: 'A written exit: a loss limit in dollars and a rule for event weeks', why: 'A stop is not a guarantee in a gap, but having none is worse.' },
            { point: 'Size from the realistic worst case, not from the credit', why: 'Sizing by premium collected is how accounts blow up.' },
            { point: "Paper trade the plan first and check the broker's approval level and margin rules", why: 'Selling naked options needs a high approval level, and the rules differ by broker.' },
          ],
          why: 'Selling movement can be a reasonable idea when options are overpriced, but the undefined tail decides whether the account survives. It must be sized and managed for the worst week, not the usual one.',
        },
      ],
    },
    {
      id: 'strategies-condor',
      title: 'Iron condors and iron butterflies',
      summary: 'Sell a range and buy wings: a credit with a known maximum loss.',
      widget: 'strategies-condor',
      text: [
        'An **iron condor** is a bull put spread and a bear call spread at the same expiry, one below the price and one above. Four legs, from low to high strike: long put, short put, short call, long call. You collect a credit and keep all of it if the stock finishes between the two short strikes.',
        'Example: SPY at 500. Buy the 480 put for 0.60, sell the 485 put for 1.10, sell the 515 call for 1.20, buy the 520 call for 0.70. Credit = 0.50 + 0.50 = 1.00 ($100). Maximum profit $100. Only one side can be in the money at expiry, so the maximum loss is one wing width minus the credit: 5.00 − 1.00 = 4.00, $400. With uneven wings, use the wider one. Breakevens: 485 − 1.00 = 484 and 515 + 1.00 = 516.',
        'An **iron butterfly** sells the put and the call at the same strike, at the money, and buys wings either side. The credit is larger and the risk smaller, but the full profit comes only if the stock finishes exactly at the middle strike. Stock at 100: sell the 100 put for 3.00 and the 100 call for 3.20, buy the 95 put for 1.20 and the 105 call for 1.40. Credit 3.60, maximum loss 5.00 − 3.60 = 1.40 ($140), breakevens 96.40 and 103.60.',
        'Greeks: both are short gamma and short vega with positive theta. Quiet days and falling implied volatility help; a sharp move or a jump in volatility hurts. Before expiry the loss from a move is smaller than the expiry diagram shows, but it grows fast as expiry nears.',
        "These are range trades with **defined risk**: the same idea as a short strangle, with bought wings that cap the loss. Under the exchange rule at the time of writing (2026), the margin is one side's maximum loss, since both cannot lose at once; brokers may want more. The costs are real: four legs means four bid-ask spreads and four fees each way, on a credit that is often small.",
      ],
      rules: [
        'Iron condor = bull put spread + bear call spread, same expiry.',
        'Max profit = total credit. Max loss = wider wing − credit. Times 100.',
        'Breakevens: short put − credit and short call + credit.',
        'Iron butterfly: short strikes together at the money. Larger credit, narrower profit zone.',
        'Short gamma, short vega, positive theta: a sharp move or rising IV is the risk.',
        'Four legs: four spreads and four fees each way.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'strategies-condor-1',
          ask: 'SPY is at 500. You buy the 480 put for 0.60, sell the 485 put for 1.10, sell the 515 call for 1.20 and buy the 520 call for 0.70. What is the maximum profit of one condor, in dollars?',
          answer: 100,
          check: '(-0.60 + 1.10 + 1.20 - 0.70) * 100',
          why: 'Credit from the put side 0.50, from the call side 0.50, total 1.00: $100. You keep it all if SPY ends between 485 and 515.',
        },
        {
          kind: 'number',
          id: 'strategies-condor-2',
          ask: 'Same iron condor: wings 5 wide, credit 1.00. What is the maximum loss of one condor, in dollars?',
          answer: 400,
          check: '(5 - 1.00) * 100',
          why: 'SPY can finish below 480 or above 520, not both. One side then costs its width, 5.00, and you keep the 1.00 credit: −4.00, $400. Adding both widths is the classic mistake.',
        },
        {
          kind: 'number',
          id: 'strategies-condor-3',
          ask: 'Same iron condor, credit 1.00. What is the upper breakeven at expiry?',
          answer: 516,
          check: '515 + 1.00',
          why: 'At 516 the short 515 call costs 1.00, which uses up the whole credit. The lower breakeven is 485 − 1.00 = 484.',
        },
        {
          kind: 'number',
          id: 'strategies-condor-4',
          ask: 'Same iron condor. At expiry SPY is at 483. What is the P&L of one condor, in dollars? Use a minus sign for a loss.',
          answer: -100,
          check: '(1.00 - max(485 - 483, 0) + max(480 - 483, 0)) * 100',
          why: 'The short 485 put is worth 2.00 against you, the 480 put nothing, the calls nothing. 1.00 − 2.00 = −1.00, so −$100.',
        },
        {
          kind: 'number',
          id: 'strategies-condor-5',
          ask: 'Stock at 100. You sell the 100 put for 3.00 and the 100 call for 3.20, and buy the 95 put for 1.20 and the 105 call for 1.40 (an iron butterfly). What is its maximum loss, in dollars?',
          answer: 140,
          check: '(5 - (3.00 + 3.20 - 1.20 - 1.40)) * 100',
          why: 'Credit = 6.20 − 2.60 = 3.60. The wings are 5 wide, so the worst case is 5.00 − 3.60 = 1.40, $140.',
        },
        {
          kind: 'number',
          id: 'strategies-condor-6',
          ask: 'Same iron butterfly, credit 3.60 around the 100 strike. What is the lower breakeven?',
          answer: 96.4,
          check: '100 - 3.60',
          why: 'At 96.40 the short 100 put costs 3.60, the whole credit. The upper one is 103.60. The profit zone is 7.20 wide, much narrower than it sounds from the size of the credit, and the full $360 needs a close at exactly 100.',
        },
        {
          kind: 'choice',
          id: 'strategies-condor-7',
          ask: 'In the figure, keep the short strikes where they are and widen the wings from 5 to 10. What happens to the readouts?',
          options: [
            'The credit rises a little and the maximum loss rises a lot',
            'The credit doubles and the maximum loss stays the same',
            'The maximum loss falls because the wings are further away',
            'Nothing changes because the wings are out of the money',
          ],
          answer: 0,
          why: 'Wings further out are cheaper, so you pay less for them and the credit rises, but only by a little. The maximum loss is width minus credit, and the width doubled. Wider wings raise the chance of a profit a little and the worst case a lot.',
        },
        {
          kind: 'choice',
          id: 'strategies-condor-8',
          ask: 'You hold an iron condor with two weeks left and the stock in the middle. Which mix of events hurts it most?',
          options: [
            'A fast move towards one short strike together with a rise in implied volatility',
            'A quiet week with falling implied volatility',
            'A small move inside the short strikes',
            'Time passing with nothing happening',
          ],
          answer: 0,
          why: 'The condor is short gamma (it loses on moves) and short vega (it loses when IV rises). The two often come together in a sell-off. Quiet time passing is what it is paid for.',
        },
        {
          kind: 'bug',
          id: 'strategies-condor-9',
          ask: 'The maximum loss of an iron condor with wings of different widths. It gives far too large a number.',
          code: `def condor_max_loss(put_width, call_width, credit):
    # per contract; only one side can finish in the money
    return (put_width + call_width - credit) * 100`,
          line: 3,
          fix: '    return (max(put_width, call_width) - credit) * 100',
          why: 'The stock cannot be below the puts and above the calls at the same time, so only one wing can be lost. The worst case is the wider wing minus the credit.',
        },
        {
          kind: 'output',
          id: 'strategies-condor-10',
          ask: 'The 480/485/515/520 iron condor for 1.00 at four prices at expiry. What does this print?',
          code: `def condor_pnl(price):
    put_side = -max(485 - price, 0) + max(480 - price, 0)
    call_side = -max(price - 515, 0) + max(price - 520, 0)
    return round((put_side + call_side + 1.00) * 100)

print([condor_pnl(p) for p in (470, 484, 500, 518)])`,
          answer: '[-400, 0, 100, -200]',
          why: 'At 470 the put side costs its full 5.00: −4.00. 484 is the lower breakeven. At 500 everything expires worthless and you keep 1.00. At 518 the short call costs 3.00: −2.00.',
        },
        {
          kind: 'write',
          id: 'strategies-condor-11',
          ask: 'Write the P&L at expiry of one iron condor, in dollars per contract.',
          starter: `def iron_condor_pnl(price, long_put, short_put, short_call, long_call, credit):
    # strikes from low to high; credit received per share
    pass`,
          solution: `def iron_condor_pnl(price, long_put, short_put, short_call, long_call, credit):
    puts = max(long_put - price, 0) - max(short_put - price, 0)
    calls = max(price - long_call, 0) - max(price - short_call, 0)
    return (puts + calls + credit) * 100`,
          tests: `out = iron_condor_pnl(500, 480, 485, 515, 520, 1.00)
assert out is not None, "the function returns nothing yet"
assert abs(out - 100) < 1e-6, f"between the short strikes you keep the credit: 100, got {out}"
assert abs(iron_condor_pnl(470, 480, 485, 515, 520, 1.00) + 400) < 1e-6, "below the long put the loss is width - credit: -400"
assert abs(iron_condor_pnl(600, 480, 485, 515, 520, 1.00) + 400) < 1e-6, "above the long call the loss is also -400, not more"
assert abs(iron_condor_pnl(516, 480, 485, 515, 520, 1.00)) < 1e-6, "516 is the upper breakeven"
assert abs(iron_condor_pnl(70, 80, 90, 110, 115, 1.50) + 850) < 1e-6, "with a 10-wide put wing the worst case is (10 - 1.50) * 100 = 850"`,
          why: 'Each side is a vertical: long option minus short option. Add the credit and multiply by 100. The bought wings are what stop the loss growing.',
        },
        {
          kind: 'design',
          id: 'strategies-condor-12',
          ask: 'Plan an iron condor on SPY for a week with no scheduled news. Say what you would decide before placing it.',
          checklist: [
            { point: 'Short strikes outside the expected move, from the straddle price or IV', why: 'The trade is a bet that the stock stays inside a range; set the range from what the market prices.' },
            { point: 'Wing width, credit, maximum loss and both breakevens in dollars', why: 'The worst case is wing − credit; it must be known before sizing.' },
            { point: 'Contracts = risk budget ÷ maximum loss per condor', why: 'Size from the loss, not from the credit.' },
            { point: 'Check the calendar for events that week (Fed, CPI, earnings of big index names)', why: 'A scheduled event can move the index through a short strike in one bar.' },
            { point: 'Exit rules: take profit at a share of the credit, cut at a loss amount, close before expiry', why: 'Much of the risk of a condor arrives in the last days, when gamma is high.' },
            { point: 'Costs of four legs: bid-ask and fees in and out, as a share of the credit', why: 'On a $100 credit, costs can be a large part of what you can make.' },
            { point: 'Enter as one four-leg order at a net limit price', why: 'Legging in leaves you with an unhedged position if the market moves between fills.' },
          ],
          why: 'An iron condor turns a range view into defined risk. Everything else, from strikes to exits, is about making sure the rare large loss does not outweigh the frequent small wins.',
        },
      ],
    },
    {
      id: 'strategies-calendar',
      title: 'Calendars and diagonals in brief',
      summary: 'Trading time and term structure: sell a near expiry, own a later one.',
      text: [
        'A **calendar spread** sells an option with a near expiry and buys the same type and strike with a later expiry. You pay a debit, because the later option has more time value. A **diagonal** is the same idea with different strikes.',
        'It works because near options decay faster. An at-the-money option is worth roughly 0.4 × σ × S × √t (σ is the implied volatility, S the price, t the years left), so its value falls with the square root of time: the 30-day option loses all its time value in 30 days, while the 60-day one loses less than a third of its value over the same days.',
        'Example, stock 100, implied volatility 20%: sell the 30-day 100 call for 2.29, buy the 60-day 100 call for 3.23, debit 0.94 ($94). If the stock is at 100 when the near call expires and IV is unchanged, the remaining call is worth about 2.29 and the spread made 1.35 ($135). If the stock has moved far either way, both calls are deep in or far out of the money, the spread is worth little, and you lose most of the debit.',
        'The two legs expire on different days, so there is no single expiry payoff diagram: what the long option is worth when the short one expires depends on implied volatility then. A calendar is **long vega**. If IV falls from 20% to 15%, the remaining call is worth about 1.72 instead of 2.29. The maximum profit is an estimate from a model; the maximum loss, if you close both legs when the near one expires, is about the debit (early assignment and dividends can complicate this on American-style options). Brokers often ask for extra margin on calendars.',
        'Term structure matters (volatility module): if the near expiry has high IV because of an event, a calendar sells that expensive near option. After the event the near IV drops, which helps, but the far IV usually drops too, which hurts. A common diagonal buys a longer-dated in-the-money call and sells a near out-of-the-money call against it; its worst case is also about the debit when the stock falls.',
      ],
      rules: [
        'Calendar: sell near expiry, buy later expiry, same strike. Diagonal: different strikes too.',
        'Near options decay faster: time value shrinks roughly with √t.',
        'Best outcome: the stock near the strike when the near option expires.',
        'Long vega: falling IV lowers what the remaining option is worth.',
        'No single expiry diagram: estimate profit with a model. Worst case about the debit if both are closed together.',
      ],
      questions: [
        {
          kind: 'choice',
          id: 'strategies-calendar-1',
          ask: 'Which of these is a call calendar spread?',
          options: [
            'Sell the 30-day 100 call, buy the 60-day 100 call',
            'Buy the 30-day 100 call, sell the 30-day 105 call',
            'Sell the 60-day 100 call, buy the 30-day 100 call',
            'Buy the 30-day 100 call and the 30-day 100 put',
          ],
          answer: 0,
          why: 'Same strike, same type, sell the near expiry and buy the far one. The second is a vertical, the third is a reversed (short) calendar, the fourth a straddle.',
        },
        {
          kind: 'number',
          id: 'strategies-calendar-2',
          ask: 'Stock at 100. You sell the 30-day 100 call for 2.29 and buy the 60-day 100 call for 3.23. What do you pay for one calendar, in dollars?',
          answer: 94,
          check: '(3.23 - 2.29) * 100',
          why: 'The debit is 3.23 − 2.29 = 0.94, so $94. If you close both legs when the near one expires, that is about the most you can lose.',
        },
        {
          kind: 'number',
          id: 'strategies-calendar-3',
          ask: 'Same calendar, debit 0.94. When the near call expires the stock is at exactly 100 and IV is unchanged, so the remaining call (30 days left) is worth 2.29. What is the P&L for one calendar if you sell it, in dollars?',
          answer: 135,
          check: '(2.29 - 0 - 0.94) * 100',
          why: 'The near call expires worthless at the money. You sell the far call for 2.29 against the 0.94 paid: +1.35, $135. This is the best case: the stock pinned at the strike.',
        },
        {
          kind: 'number',
          id: 'strategies-calendar-4',
          ask: 'Same calendar, but by the time the near call expires (stock still at 100) implied volatility has fallen from 20% to 15%, and the remaining call is worth 1.72. What is the P&L for one calendar, in dollars?',
          answer: 78,
          check: '(1.72 - 0.94) * 100',
          why: '1.72 − 0.94 = 0.78, so $78, down from $135 with the stock in exactly the same place. The calendar is long vega: a fall in IV lowers the value of the option you still own.',
        },
        {
          kind: 'choice',
          id: 'strategies-calendar-5',
          ask: 'Same calendar. When the near call expires the stock is at 110. The near call is worth 10.00 and the far call about 10.12. Roughly what is the result?',
          options: [
            'A loss of most of the debit: the spread is worth about 0.12 against 0.94 paid',
            'A large profit because the stock rose',
            'A loss of 10.00 per share',
            'Exactly breakeven',
          ],
          answer: 0,
          why: 'Deep in the money, both calls are almost all intrinsic value and have little time value, so the difference between them is small: 10.12 − 10.00 = 0.12. You lose about 0.82, $82. A calendar is a bet that the stock stays near the strike.',
        },
        {
          kind: 'choice',
          id: 'strategies-calendar-6',
          ask: 'You hold a call calendar. Implied volatility rises across all expiries while the stock stays still. What happens to the spread, most likely?',
          options: [
            'Its value rises, because the longer-dated option has more vega than the near one',
            'Its value falls, because you are short an option',
            'Nothing, because the two legs have the same strike',
            'It falls, because a calendar is short vega',
          ],
          answer: 0,
          why: 'Vega grows with time to expiry, so the bought far option gains more from a rise in IV than the sold near option loses. A calendar is long vega. Term structure can change unevenly, so this is the usual case, not a rule.',
        },
        {
          kind: 'output',
          id: 'strategies-calendar-7',
          ask: 'The rule of thumb for an at-the-money option: about 0.4 × σ × S × √t. What does this print?',
          code: `import math

def atm(days, iv=0.20, price=100):
    return round(0.4 * iv * price * math.sqrt(days / 365), 2)

print(atm(30), atm(60))`,
          answer: '2.29 3.24',
          why: '0.4 × 0.2 × 100 = 8, times √(30/365) ≈ 0.287 gives 2.29, and √(60/365) ≈ 0.405 gives 3.24. Twice the time is only √2 times the value, so over the next 30 days the near option loses 2.29 while the far one loses about 0.95. That gap is what a calendar collects.',
        },
        {
          kind: 'bug',
          id: 'strategies-calendar-8',
          ask: 'This values a call calendar at the moment the near call expires (`bs_call` is a Black-Scholes call price defined elsewhere). It overstates the value, because the far option is priced as if no time had passed.',
          code: `def calendar_value_at_front_expiry(price, strike, days_front, days_back, iv):
    front = max(price - strike, 0)
    back = bs_call(price, strike, days_back / 365, iv)
    return back - front`,
          line: 3,
          fix: '    back = bs_call(price, strike, (days_back - days_front) / 365, iv)',
          why: 'When the near option expires, the far one has days_back − days_front days left, not days_back. A 60-day option valued 30 days later is a 30-day option.',
        },
        {
          kind: 'choice',
          id: 'strategies-calendar-9',
          ask: 'You buy a 90-day 95 call and sell a 30-day 105 call against it, with the stock at 100. What is this?',
          options: [
            'A diagonal: different strikes and different expiries, a mildly bullish trade that collects decay from the near call',
            'A calendar, because there are two expiries',
            'A bear call spread',
            'A covered call, because you are long stock',
          ],
          answer: 0,
          why: 'Different strikes and expiries make it a diagonal. The long in-the-money call behaves partly like stock and the short near call collects decay, so it is sometimes compared with a covered call, but you do not own shares.',
        },
        {
          kind: 'number',
          id: 'strategies-calendar-10',
          ask: 'For that diagonal you pay 8.00 for the 90-day 95 call and receive 1.50 for the 30-day 105 call. If the stock collapses, roughly what is the most you can lose for one diagonal, in dollars?',
          answer: 650,
          check: '(8.00 - 1.50) * 100',
          why: 'The debit is 6.50, $650. If the stock falls far, both calls become nearly worthless and you lose about the whole debit. The gap between strikes (10) is larger than the debit, so a rise does not cost more than that.',
        },
        {
          kind: 'design',
          id: 'strategies-calendar-11',
          ask: 'You are considering an at-the-money calendar on a stock with earnings between the two expiries. Write what you would check first.',
          checklist: [
            { point: 'Which expiry contains the event: here it is the long (far) option', why: 'The far option carries the event premium, and it will lose it after the report.' },
            { point: 'The IV of each expiry, not one IV for both', why: 'Term structure decides whether you are selling the expensive option or buying it.' },
            { point: 'The P&L from a model at several prices and IV levels at the near expiry', why: 'There is no single expiry diagram; model the outcomes you care about.' },
            { point: 'The maximum loss of about the debit, if both legs are closed together', why: 'You size from that number.' },
            { point: 'A plan to close both legs together, never to leave the long leg alone by accident', why: 'A leftover leg is a different trade from the one you planned.' },
            { point: "Bid-ask spreads on both expiries and the broker's margin for calendars", why: 'Far-dated options can have wider markets, and some brokers ask for extra margin.' },
          ],
          why: 'Calendars trade time and volatility across expiries. They need a model to estimate and a clear picture of where the event premium sits.',
        },
      ],
    },
    {
      id: 'strategies-choose',
      title: 'Choosing a structure',
      summary: 'Match the structure to your view of direction, volatility and time, then count the cost of the legs.',
      text: [
        'A structure is the way you write a view. Three questions come first. **Direction**: up, down, or neither? **Volatility**: will the stock move more or less than the options price in, and is implied volatility high or low for this stock (IV rank, volatility module)? **Time**: by when?',
        'A starting map, not a rule. Up with cheap IV: a bull call spread (or a long call). Up with rich IV: a bull put spread. Down: a bear put spread (cheap IV) or a bear call spread (rich IV). A big move either way, IV cheap: a long straddle or strangle. A range, IV rich: an iron condor or butterfly rather than an undefined-risk short strangle. Near-term quiet with term structure in your favour: a calendar. No clear view: no trade.',
        "Then check the trade is worth taking. Every leg crosses its own bid-ask. A four-leg iron condor where each option is 0.10 wide costs about 0.05 per leg to fill at a fair price, 0.20 to get in and 0.20 to get out, $40 per condor on a $100 maximum profit. Add fees: at a made-up $0.65 per contract, four legs in and four out is $5.20 per condor. Fees differ by broker; check yours.",
        'Enter multi-leg trades as **one complex order** at a net limit price. **Legging in**, one option at a time, leaves you with a different, unhedged position if the market moves between the fills. Prefer liquid underlyings and strikes: SPY, QQQ and SPX have tight markets on many strikes; a thin single stock may be 0.30 wide on each leg.',
        'For a day trade, remember what the short leg does: it offsets the long one. A spread gains less from a fast move than a single option, and its value moves slowly until expiry is near. That is safer and slower. Most retail day traders lose money, and a structure does not change that: it changes the shape of the risk you take while finding out whether you have an edge, which you test on paper first.',
      ],
      rules: [
        'Write down direction, volatility and time before choosing a structure.',
        'Cheap IV: lean to debit structures. Rich IV: lean to credit structures. A starting point, not a rule.',
        'Prefer defined risk to undefined risk for the same view.',
        'Count every leg: bid-ask and fees in and out, as a share of the maximum profit.',
        'Enter multi-leg trades as one order at a net limit. Do not leg in.',
        'No clear view is a reason not to trade.',
      ],
      questions: [
        {
          kind: 'choice',
          id: 'strategies-choose-1',
          ask: 'You expect a modest rise over two weeks, and implied volatility on the stock is near the top of its yearly range. Which structure fits that view best?',
          options: ['A bull put spread', 'A long straddle', 'A bear call spread', 'A long out-of-the-money call'],
          answer: 0,
          why: 'Bullish and IV rich: sell premium with a bullish lean and defined risk. A straddle buys expensive volatility without a direction. A bear call is the wrong direction. A long call pays for rich IV and needs a bigger move.',
        },
        {
          kind: 'choice',
          id: 'strategies-choose-2',
          ask: 'You expect a large move but have no idea of the direction, and implied volatility is low compared with its history. Which fits?',
          options: ['A long straddle or strangle', 'An iron condor', 'A short strangle', 'A bull call spread'],
          answer: 0,
          why: 'A move in either direction and cheap options point to buying both sides. The iron condor and the short strangle are bets against a move. A bull call spread needs a direction.',
        },
        {
          kind: 'choice',
          id: 'strategies-choose-3',
          ask: 'You expect the index to stay in a range this week, IV is high, and you want a loss you can state in advance. Which fits?',
          options: ['An iron condor', 'A short strangle', 'A long straddle', 'A bull call spread'],
          answer: 0,
          why: 'The same range view as a short strangle, but the bought wings cap the loss. The short strangle is undefined risk; the straddle bets on a move; the call spread on a rise.',
        },
        {
          kind: 'number',
          id: 'strategies-choose-4',
          ask: 'An iron condor has four legs, each with a bid-ask spread of 0.10. You give up half the spread (0.05) on every leg when you open and again when you close. What does that cost per condor, in dollars?',
          answer: 40,
          check: '0.05 * 4 * 2 * 100',
          why: '0.05 × 4 legs = 0.20 each way, 0.40 round trip, times 100 shares = $40. On a $100 maximum profit, that is 40% before any fee.',
        },
        {
          kind: 'number',
          id: 'strategies-choose-5',
          ask: 'Your broker charges $0.65 per contract (a made-up fee for this exercise). You open and close 2 iron condors. What do the fees come to, in dollars?',
          answer: 10.4,
          check: '0.65 * 4 * 2 * 2',
          why: '4 legs × 2 condors = 8 contracts each way, 16 in total, × $0.65 = $10.40. A single option traded the same way would cost a quarter of that.',
        },
        {
          kind: 'number',
          id: 'strategies-choose-6',
          ask: 'One condor: $40 of bid-ask cost and $5.20 of fees for the round trip, on a maximum profit of $100. What share of the maximum profit do costs take? Give a percentage, for example 25%.',
          answer: 0.452,
          tol: 0.005,
          check: '(40 + 5.20) / 100',
          why: '45.20 ÷ 100 = 45.2%. Even a trade that keeps its full credit gives almost half of it away. Tight markets and fewer round trips matter more for multi-leg trades.',
        },
        {
          kind: 'choice',
          id: 'strategies-choose-7',
          ask: 'You want a bull call spread. You buy the long call first, planning to sell the short call a minute later at a better price. The stock drops before you do. What has happened?',
          options: [
            'You hold a lone long call that has lost value, and the short call now pays less: the spread you planned costs more than it would have',
            'Nothing, the two legs are linked by the broker',
            'You now hold a credit spread',
            'Your risk fell, because you hold fewer legs',
          ],
          answer: 0,
          why: 'Legging in leaves you with a different position between fills. Here it is a single long call that lost value. Entering the spread as one order at a net price avoids that risk.',
        },
        {
          kind: 'output',
          id: 'strategies-choose-8',
          ask: 'A view-to-structure table. What does this print?',
          code: `PLAYBOOK = {
    ('up', 'cheap'): 'bull call spread',
    ('up', 'rich'): 'bull put spread',
    ('down', 'cheap'): 'bear put spread',
    ('down', 'rich'): 'bear call spread',
    ('flat', 'rich'): 'iron condor',
    ('big move', 'cheap'): 'long strangle',
}
print(PLAYBOOK.get(('down', 'rich'), 'no trade'), '|', PLAYBOOK.get(('flat', 'cheap'), 'no trade'))`,
          answer: 'bear call spread | no trade',
          why: 'Down with rich IV maps to selling a call spread. Flat with cheap IV is not in the table, so `get` returns the default: when the options are cheap there is little to be paid for selling a range, and no trade is an answer.',
        },
        {
          kind: 'bug',
          id: 'strategies-choose-9',
          ask: 'This picks a structure from a direction and an IV rank from 0 to 100. A bearish view with cheap IV gets a bullish trade.',
          code: `def choose(direction, iv_rank):
    rich = iv_rank > 50
    if direction == 'up':
        return 'bull put spread' if rich else 'bull call spread'
    if direction == 'down':
        return 'bear call spread' if rich else 'bull put spread'
    return 'iron condor' if rich else 'no trade'`,
          line: 6,
          fix: "        return 'bear call spread' if rich else 'bear put spread'",
          why: 'Bearish with cheap IV is a debit put spread. A bull put spread profits if the stock stays up: the opposite of the view.',
        },
        {
          kind: 'write',
          id: 'strategies-choose-10',
          ask: 'Write the round-trip cost of a multi-leg trade, in dollars: half the bid-ask spread on every leg on the way in and on the way out, plus a fee per contract each way.',
          starter: `def round_trip_cost(legs, half_spread, fee, contracts):
    # legs: options per structure (4 for a condor)
    # half_spread: per share, given up on each leg each way
    # fee: dollars per contract each way; contracts: how many structures
    pass`,
          solution: `def round_trip_cost(legs, half_spread, fee, contracts):
    per_leg_each_way = half_spread * 100 + fee
    return round(per_leg_each_way * legs * 2 * contracts, 2)`,
          tests: `out = round_trip_cost(4, 0.05, 0.65, 1)
assert out is not None, "the function returns nothing yet"
assert abs(out - 45.20) < 1e-6, f"one condor: 4 legs x 2 ways x (5 + 0.65) = 45.20, got {out}"
assert abs(round_trip_cost(4, 0.05, 0.65, 2) - 90.40) < 1e-6, "two condors cost twice as much"
assert abs(round_trip_cost(1, 0.05, 0.65, 1) - 11.30) < 1e-6, "a single option: 2 x (5 + 0.65) = 11.30"
assert abs(round_trip_cost(2, 0.0, 0.65, 1) - 2.60) < 1e-6, "with no spread a two-leg trade still pays 4 fees: 2.60"`,
          why: 'Every leg pays half the spread (times 100 shares) and a fee, twice. Costs scale with legs, so a four-leg trade costs four times a single option to round-trip.',
        },
        {
          kind: 'choice',
          id: 'strategies-choose-11',
          ask: 'You expect a fast 1% rise in SPY in the next half hour, with a week until expiry. Compared with a single at-the-money call, how would a 5-wide bull call spread around the money behave on that move?',
          options: [
            'It gains less, because the short call gains value too and offsets the long one until expiry is near',
            'It gains more, because it cost less',
            'It gains exactly the same in dollars',
            'It loses, because spreads have negative delta',
          ],
          answer: 0,
          why: "A vertical far from expiry has a smaller net delta than its long leg: part of the long call's gain is matched by the short call's loss. The spread's value approaches its expiry shape only near expiry. For a quick intraday move it is slower, as well as safer.",
        },
        {
          kind: 'design',
          id: 'strategies-choose-12',
          ask: 'It is the morning of a CPI release. You think SPY may make a big move but have no view on direction. Lay out how you would choose a structure, or decide not to trade.',
          checklist: [
            { point: 'Compare the expected move priced in (straddle price) with what you think is likely', why: 'A long straddle only pays if the real move is bigger than its price.' },
            { point: 'Expect implied volatility to fall after the release', why: 'IV crush can make a long straddle lose on a move that is merely average.' },
            { point: 'Choose defined risk, and know the maximum loss in dollars', why: 'Event days produce gaps; undefined-risk positions are where accounts get hurt.' },
            { point: 'Check spreads and liquidity on the strikes you would use at that time of day', why: 'Markets can be wide around releases, and every leg pays.' },
            { point: 'Size from the maximum loss and the daily loss limit', why: 'The structure fixes the loss per trade; the account rules decide how many.' },
            { point: 'Accept that no trade is a valid outcome', why: 'Without a measured edge, sitting out an event costs nothing.' },
          ],
          why: 'Choosing a structure is a process: the view, the price of options, the risk, the costs and the size. Skipping the trade is one of the answers it can give.',
        },
      ],
    },
    {
      id: 'strategies-lab',
      title: 'Lab: a multi-leg strategy analyser',
      summary: 'Legs as data, P&L across prices, maximum profit and loss, and exact breakevens.',
      text: [
        'This lab builds the tool that every lesson in this module used by hand: give it a list of legs and it returns the P&L at any price at expiry, the maximum profit, the maximum loss (or says it is unlimited) and the breakevens. You can then check any structure before trading it, including ones the lessons did not cover.',
        'A leg is a dictionary: `{"type": "call", "strike": 105, "qty": -1, "premium": 1.20}`. A positive `qty` is bought, a negative one sold, and the premium is per share. The profit of a leg at expiry is `qty × (intrinsic value − premium)`, and a position is the sum of its legs times 100.',
        'The P&L at expiry is a straight line between strikes, so you do not need a fine grid to find the extremes. Check price 0, every strike, and the slope above the highest strike. That slope is 100 times the number of calls held net: positive means unlimited profit, negative means unlimited loss.',
        'Breakevens are where the line crosses zero. Inside each segment between strikes the line is straight, so the crossing can be found exactly by linear interpolation. Above the highest strike, if the slope is not zero, there may be one more crossing.',
        'Test the analyser on structures whose numbers you know from the lessons: the 480/485/515/520 condor for 1.00 must give $100, −$400, 484 and 516. A tool that agrees with hand calculations on known cases is one you can start to trust on new ones.',
      ],
      rules: [
        'Leg profit at expiry = qty × (intrinsic − premium). Position = sum × 100.',
        'Between strikes the P&L is a straight line: check 0, every strike and the slope above the top strike.',
        'Net calls held > 0: unlimited profit. < 0: unlimited loss.',
        'Breakevens by linear interpolation inside each segment.',
        'Test the tool on cases you already know.',
      ],
      questions: [
        {
          kind: 'write',
          id: 'strategies-lab-1',
          ask: 'Step 1: one leg. Return the profit per share at expiry of a single leg.',
          starter: `def leg_profit(leg, price):
    # leg: {"type": "call" or "put", "strike": ..., "qty": +n bought / -n sold, "premium": per share}
    pass`,
          solution: `def leg_profit(leg, price):
    if leg["type"] == "call":
        value = max(price - leg["strike"], 0)
    else:
        value = max(leg["strike"] - price, 0)
    return leg["qty"] * (value - leg["premium"])`,
          tests: `long_call = {"type": "call", "strike": 100, "qty": 1, "premium": 3.0}
out = leg_profit(long_call, 110)
assert out is not None, "the function returns nothing yet"
assert abs(out - 7.0) < 1e-9, f"a 100 call bought for 3.00 makes 7.00 at 110, got {out}"
assert abs(leg_profit(long_call, 90) + 3.0) < 1e-9, "below the strike a bought call loses its premium"
short_put = {"type": "put", "strike": 50, "qty": -1, "premium": 2.0}
assert abs(leg_profit(short_put, 60) - 2.0) < 1e-9, "a sold put above its strike keeps the premium: +2.00"
assert abs(leg_profit(short_put, 45) + 3.0) < 1e-9, "a 50 put sold for 2.00 loses 3.00 at 45"
assert abs(leg_profit({"type": "call", "strike": 100, "qty": 2, "premium": 3.0}, 110) - 14.0) < 1e-9, "qty 2 doubles the profit"`,
          why: 'Intrinsic value minus what was paid, then the sign and size of the holding. A sold leg is the same formula with a negative qty: it receives the premium and owes the intrinsic value.',
        },
        {
          kind: 'write',
          id: 'strategies-lab-2',
          ask: 'Step 2: the position. Return the P&L of a list of legs at one price, in dollars (100 shares per contract), rounded to cents.',
          starter: `def leg_profit(leg, price):
    if leg["type"] == "call":
        value = max(price - leg["strike"], 0)
    else:
        value = max(leg["strike"] - price, 0)
    return leg["qty"] * (value - leg["premium"])

def position_pnl(legs, price):
    pass`,
          solution: `def leg_profit(leg, price):
    if leg["type"] == "call":
        value = max(price - leg["strike"], 0)
    else:
        value = max(leg["strike"] - price, 0)
    return leg["qty"] * (value - leg["premium"])

def position_pnl(legs, price):
    return round(100 * sum(leg_profit(leg, price) for leg in legs), 2)`,
          tests: `spread = [{"type": "call", "strike": 100, "qty": 1, "premium": 3.0},
          {"type": "call", "strike": 105, "qty": -1, "premium": 1.2}]
out = position_pnl(spread, 104)
assert out is not None, "the function returns nothing yet"
assert abs(out - 220) < 1e-9, f"the 100/105 call spread for 1.80 makes 220 at 104, got {out}: did you multiply by 100?"
assert abs(position_pnl(spread, 90) + 180) < 1e-9, "below 100 the spread loses its debit: -180"
assert abs(position_pnl(spread, 130) - 320) < 1e-9, "above 105 it is capped at 320"
assert position_pnl([], 100) == 0, "no legs, no P&L"`,
          why: 'A structure is the sum of its legs. Rounding to cents keeps exact zeros exact, which the breakeven search later relies on.',
        },
        {
          kind: 'write',
          id: 'strategies-lab-3',
          numpy: true,
          ask: 'Step 3: the curve. Return the P&L at every price in a NumPy array of prices, as an array, using NumPy operations rather than a Python loop over prices.',
          starter: `import numpy as np

def pnl_curve(legs, prices):
    # prices: a 1-D array; returns an array of the same shape, in dollars
    pass`,
          solution: `import numpy as np

def pnl_curve(legs, prices):
    total = np.zeros_like(prices, dtype=float)
    for leg in legs:
        if leg["type"] == "call":
            value = np.maximum(prices - leg["strike"], 0)
        else:
            value = np.maximum(leg["strike"] - prices, 0)
        total += leg["qty"] * (value - leg["premium"])
    return 100 * total`,
          tests: `condor = [{"type": "put", "strike": 480, "qty": 1, "premium": 0.6},
          {"type": "put", "strike": 485, "qty": -1, "premium": 1.1},
          {"type": "call", "strike": 515, "qty": -1, "premium": 1.2},
          {"type": "call", "strike": 520, "qty": 1, "premium": 0.7}]
prices = np.array([470.0, 484.0, 500.0, 518.0, 600.0])
out = pnl_curve(condor, prices)
assert out is not None, "the function returns nothing yet"
assert np.shape(out) == (5,), f"one P&L per price: shape (5,), got {np.shape(out)}"
assert np.allclose(out, [-400, 0, 100, -200, -400]), f"the condor at 470, 484, 500, 518, 600 should give [-400, 0, 100, -200, -400], got {out}"
assert np.allclose(pnl_curve(condor[:2], np.array([400.0, 500.0])), [-450, 50]), "the put spread alone: -450 below 480 and +50 above 485"`,
          hint: '`np.maximum(prices - strike, 0)` gives the intrinsic value of a call at every price at once.',
          why: 'The loop is over legs (a handful), not over prices (possibly thousands). `np.maximum` applies the hockey stick to the whole array, which is how you draw a payoff diagram.',
        },
        {
          kind: 'write',
          id: 'strategies-lab-4',
          ask: 'Step 4: the extremes. Return `(best, worst)`: the maximum profit and the maximum loss in dollars (the loss as a negative number). Use `math.inf` or `-math.inf` when they are unlimited.',
          starter: `import math

def leg_profit(leg, price):
    if leg["type"] == "call":
        value = max(price - leg["strike"], 0)
    else:
        value = max(leg["strike"] - price, 0)
    return leg["qty"] * (value - leg["premium"])

def position_pnl(legs, price):
    return round(100 * sum(leg_profit(leg, price) for leg in legs), 2)

def extremes(legs):
    # check price 0 and every strike; the slope above the top strike is 100 * (net calls held)
    pass`,
          solution: `import math

def leg_profit(leg, price):
    if leg["type"] == "call":
        value = max(price - leg["strike"], 0)
    else:
        value = max(leg["strike"] - price, 0)
    return leg["qty"] * (value - leg["premium"])

def position_pnl(legs, price):
    return round(100 * sum(leg_profit(leg, price) for leg in legs), 2)

def extremes(legs):
    points = [0] + sorted({leg["strike"] for leg in legs})
    values = [position_pnl(legs, p) for p in points]
    net_calls = sum(leg["qty"] for leg in legs if leg["type"] == "call")
    best = math.inf if net_calls > 0 else max(values)
    worst = -math.inf if net_calls < 0 else min(values)
    return best, worst`,
          tests: `condor = [{"type": "put", "strike": 480, "qty": 1, "premium": 0.6},
          {"type": "put", "strike": 485, "qty": -1, "premium": 1.1},
          {"type": "call", "strike": 515, "qty": -1, "premium": 1.2},
          {"type": "call", "strike": 520, "qty": 1, "premium": 0.7}]
out = extremes(condor)
assert out is not None, "the function returns nothing yet"
assert out == (100, -400), f"the condor: best 100, worst -400, got {out}"
straddle = [{"type": "call", "strike": 100, "qty": 1, "premium": 4.0}, {"type": "put", "strike": 100, "qty": 1, "premium": 3.5}]
assert extremes(straddle) == (math.inf, -750), f"a long straddle has unlimited profit and loses at most 750, got {extremes(straddle)}"
short_strangle = [{"type": "put", "strike": 95, "qty": -1, "premium": 1.5}, {"type": "call", "strike": 105, "qty": -1, "premium": 1.7}]
assert extremes(short_strangle) == (320, -math.inf), f"a short strangle keeps at most 320 and its loss is unlimited, got {extremes(short_strangle)}"
short_put = [{"type": "put", "strike": 50, "qty": -1, "premium": 2.0}]
assert extremes(short_put) == (200, -4800), f"a short 50 put for 2.00 can lose 4800 if the stock goes to 0, got {extremes(short_put)}"`,
          hint: 'Below the lowest strike the line is straight down to price 0, so price 0 covers that side. Above the top strike only calls change value.',
          why: 'A piecewise straight line has its extremes at its corners or at its ends. The left end is price 0; the right end is flat, rising or falling forever depending on the calls held. The short put shows that "limited" can still be large: $4,800 against $200 collected.',
        },
        {
          kind: 'write',
          id: 'strategies-lab-5',
          ask: 'Step 5: breakevens. Return the sorted list of prices where the P&L at expiry is zero, each rounded to 2 decimals.',
          starter: `def leg_profit(leg, price):
    if leg["type"] == "call":
        value = max(price - leg["strike"], 0)
    else:
        value = max(leg["strike"] - price, 0)
    return leg["qty"] * (value - leg["premium"])

def position_pnl(legs, price):
    return round(100 * sum(leg_profit(leg, price) for leg in legs), 2)

def breakevens(legs):
    # straight lines between 0 and the strikes: interpolate where the sign changes
    # then check above the top strike, where the slope is 100 * (net calls held)
    pass`,
          solution: `def leg_profit(leg, price):
    if leg["type"] == "call":
        value = max(price - leg["strike"], 0)
    else:
        value = max(leg["strike"] - price, 0)
    return leg["qty"] * (value - leg["premium"])

def position_pnl(legs, price):
    return round(100 * sum(leg_profit(leg, price) for leg in legs), 2)

def breakevens(legs):
    strikes = sorted({leg["strike"] for leg in legs})
    points = [0] + strikes
    out = []
    for a, b in zip(points, points[1:]):
        pa, pb = position_pnl(legs, a), position_pnl(legs, b)
        if pa == 0:
            out.append(a)
        elif pa * pb < 0:
            out.append(a + (b - a) * pa / (pa - pb))
    top = strikes[-1]
    pt = position_pnl(legs, top)
    slope = 100 * sum(leg["qty"] for leg in legs if leg["type"] == "call")
    if pt == 0:
        out.append(top)
    elif slope != 0 and -pt / slope > 0:
        out.append(top - pt / slope)
    return [round(x, 2) for x in out]`,
          tests: `condor = [{"type": "put", "strike": 480, "qty": 1, "premium": 0.6},
          {"type": "put", "strike": 485, "qty": -1, "premium": 1.1},
          {"type": "call", "strike": 515, "qty": -1, "premium": 1.2},
          {"type": "call", "strike": 520, "qty": 1, "premium": 0.7}]
out = breakevens(condor)
assert out is not None, "the function returns nothing yet"
assert out == [484.0, 516.0], f"the condor breaks even at 484 and 516, got {out}"
spread = [{"type": "call", "strike": 100, "qty": 1, "premium": 3.0}, {"type": "call", "strike": 105, "qty": -1, "premium": 1.2}]
assert breakevens(spread) == [101.8], f"the 100/105 call spread for 1.80 breaks even at 101.80, got {breakevens(spread)}"
straddle = [{"type": "call", "strike": 100, "qty": 1, "premium": 4.0}, {"type": "put", "strike": 100, "qty": 1, "premium": 3.5}]
assert breakevens(straddle) == [92.5, 107.5], f"the straddle breaks even at 92.50 and 107.50, got {breakevens(straddle)}: did you check above the top strike?"
assert breakevens([{"type": "call", "strike": 100, "qty": 1, "premium": 3.0}]) == [103.0], "a lone long call breaks even above its strike, at 103"`,
          hint: 'In a segment from a to b with P&L pa and pb of opposite signs, the line crosses zero at a + (b − a) × pa ÷ (pa − pb).',
          why: 'Because the P&L is straight between corners, interpolation is exact, not an estimate. The tail above the top strike is where long calls and straddles find their upper breakeven, so it needs its own check.',
        },
        {
          kind: 'output',
          id: 'strategies-lab-6',
          ask: 'Step 6: run the corner check on the iron butterfly from the lessons (100 short strikes, 95 and 105 wings, credit 3.60). What does this print?',
          code: `def leg_profit(leg, price):
    value = max(price - leg["strike"], 0) if leg["type"] == "call" else max(leg["strike"] - price, 0)
    return leg["qty"] * (value - leg["premium"])

def position_pnl(legs, price):
    return round(100 * sum(leg_profit(leg, price) for leg in legs), 2)

fly = [{"type": "put", "strike": 95, "qty": 1, "premium": 1.2},
       {"type": "put", "strike": 100, "qty": -1, "premium": 3.0},
       {"type": "call", "strike": 100, "qty": -1, "premium": 3.2},
       {"type": "call", "strike": 105, "qty": 1, "premium": 1.4}]
values = [position_pnl(fly, p) for p in (0, 95, 100, 105)]
print(max(values), min(values))`,
          answer: '360.0 -140.0',
          why: 'At 100 both short options expire worthless and you keep the 3.60 credit: 360. At 95 or below, and at 105 or above, one wing is lost: 5.00 − 3.60 = 1.40. The net calls are zero (one short, one long), so the right side is flat and these corner values are the true extremes.',
        },
        {
          kind: 'bug',
          id: 'strategies-lab-7',
          ask: 'Step 7: a breakeven finder for one segment. On the condor segment from 480 (P&L −400) to 485 (P&L +100) it returns 479, outside the segment, instead of 484.',
          code: `def crossing(a, b, pa, pb):
    # the line from (a, pa) to (b, pb) crosses zero here
    return a + (b - a) * pb / (pa - pb)`,
          line: 3,
          fix: '    return a + (b - a) * pa / (pa - pb)',
          why: 'The fraction of the segment you travel before reaching zero is pa ÷ (pa − pb): here −400 ÷ −500 = 0.8 of 5 points, so 484. Using pb gives 100 ÷ −500 = −0.2, which steps backwards out of the segment to 479.',
        },
        {
          kind: 'design',
          id: 'strategies-lab-8',
          ask: 'Step 8: the analyser only knows expiry. Describe how you would extend and test it so that it can tell you the P&L of a structure tomorrow, before expiry, and how far to trust it.',
          checklist: [
            { point: 'Price each leg with Black-Scholes (from the pricing module), with its own time to expiry and IV', why: 'Before expiry a leg is worth more than its intrinsic value; calendars need a different time for each leg.' },
            { point: 'Let the user shift price, days passed and IV, and show the P&L for each', why: 'The before-expiry P&L depends on all three, not on price alone.' },
            { point: 'Check that with zero days left it gives exactly the expiry P&L', why: 'A known limit catches pricing bugs.' },
            { point: 'Compare its prices with real option quotes for the same strikes', why: 'The model is only as good as its inputs; the market includes skew the model ignores.' },
            { point: 'Add costs: half the bid-ask spread per leg and fees, on entry and exit', why: 'The P&L you can bank is after costs.' },
            { point: 'Report maximum loss and whether risk is defined at the top of every result', why: 'The first thing to know about any structure is how much it can lose.' },
          ],
          why: 'The expiry analyser is exact because expiry is simple. Before expiry you need a model, and a model needs tests against cases you know and against market prices before you trust it.',
        },
      ],
    },
  ],
}
