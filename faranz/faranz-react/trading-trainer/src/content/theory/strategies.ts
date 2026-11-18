import type { Block } from '../../types'

/** The full theory for each lesson of the strategies module, keyed by lesson id. */
export const strategiesTheory: Record<string, Block[]> = {
  'strategies-why': [
    { h: 'One option is a blunt tool' },
    'A reminder from the options module: a **call** gives the right to buy 100 shares at the **strike** price until expiry, a **put** the right to sell, and the **premium** is the price, quoted per share. One contract covers 100 shares, so a premium of 2.00 costs $200.',
    'A single bought option has two problems. It is expensive, so the stock has to move a long way before you break even. And most of what you pay is time value that melts away if the move is slow. A single sold option has the opposite problem: you collect the premium, but the loss when the stock runs against you can be many times larger.',
    'A **spread** is a position of two or more options on the same underlying, held together, where at least one is bought and one is sold. The sold option pays for part of the bought one. The bought option limits what the sold one can cost you. Each leg fixes a weakness of the other.',

    { h: 'A call spread built step by step' },
    'Take a stock at 50 with these made-up prices for the same expiry: the 50 call costs 2.00 and the 55 call costs 0.70.',
    { sub: 'The call alone' },
    'Buy the 50 call for 2.00. At expiry it is worth the stock price minus 50, or nothing below 50. You lose at most $200, break even at 52.00, and above that every dollar the stock rises is $100 more profit, with no ceiling.',
    { sub: 'Adding the short call' },
    'Now also sell the 55 call for 0.70. You pay 2.00 and receive 0.70, a **net debit** of 1.30, or $130 per spread. Below 50 both calls are worthless and you lose the $130. Between 50 and 55 only your long call has value. Above 55 the call you sold starts to cost you exactly what the one you own gains, so the value of the pair stops at the **width**, the gap between strikes: 5.00.',
    {
      list: [
        'Maximum loss: the debit, 1.30, so $130.',
        'Maximum profit: width − debit = 5.00 − 1.30 = 3.70, so $370.',
        'Breakeven at expiry: lower strike + debit = 51.30.',
      ],
    },

    { h: 'What you gave up' },
    'If the stock goes to 60, the call alone is worth 10.00 and makes $800. The spread is still worth 5.00 and makes $370. That is the bargain every spread makes: **lower cost and a defined loss, in exchange for a capped profit**. For moves up to a little past the short strike the spread does better, because it cost less. For big moves the single option wins.',
    'Moving the short strike changes the bargain. A nearer short strike is worth more, so you receive more for it: the debit, the maximum loss and the breakeven all fall, and so does the ceiling. A short strike far away is worth almost nothing, and the spread behaves almost like the call alone.',
    {
      code: `def spread_pnl(price, k1=50, k2=55, debit=1.30):
    value = max(price - k1, 0) - max(price - k2, 0)
    return round((value - debit) * 100)

print([spread_pnl(p) for p in (48, 52, 55, 70)])`,
      out: '[-130, 70, 370, 370]',
    },
    'The function subtracts the value of the sold call from the value of the bought one. Leave out that minus sign and the spread appears to keep rising above 55, which it cannot.',

    { h: 'Defined and undefined risk' },
    'A position has **defined risk** when its worst case is fixed by its strikes before you enter: you can write the maximum loss in dollars on paper. Every spread in which each sold option is covered by a bought one of the same type has defined risk. A position has **undefined risk** when nothing stops the loss: a naked short call (sold without owning the stock or a higher call), a short straddle or strangle, short shares. Their loss grows with every dollar the stock moves against them.',
    'This matters for survival more than for profit. The risk module turns a fixed fraction of your account into a number of contracts by dividing by the loss per contract. That division only works when the loss per contract is a known number.',

    { h: 'The Greeks of a spread' },
    'The **Greeks** (pricing module) measure how an option price responds to the stock price (delta), to time (theta) and to implied volatility (vega). In a spread, the sold leg has Greeks of the opposite sign to the bought leg, so they partly cancel. A call spread rises less than the call alone when the stock moves up, loses less when a day passes, and loses less when implied volatility falls. It is a quieter position. Whether time helps or hurts on balance depends on where the stock sits between the strikes.',

    { h: 'Costs and common mistakes' },
    'Each leg has its own **bid-ask spread** (the gap between the price buyers offer and sellers ask) and its own commission. Two legs roughly double the cost of getting in and out, and on a trade whose best case is a few hundred dollars that cost is a large share.',
    {
      list: [
        'Calling a defined loss a small loss. A spread bought for $130 can still lose all $130.',
        'Choosing a structure because it is "safer" without checking that the capped profit still pays for the risk.',
        'Forgetting the second leg in the arithmetic, or its sign.',
        'Ignoring the cost of two bid-ask spreads on every round trip.',
      ],
    },
  ],

  'strategies-debit': [
    { h: 'Vertical spreads' },
    'A **vertical spread** is two options of the same type (both calls or both puts) with the same expiry and different strikes. The name comes from old option price sheets, where strikes were listed in a column: the two legs sat one above the other. When the option you buy costs more than the one you sell, you pay to enter and the spread is a **debit spread**.',
    'There are two debit verticals, one for each direction.',
    {
      list: [
        '**Bull call spread**: buy a call at a lower strike, sell a call at a higher strike. It profits from a rise.',
        '**Bear put spread**: buy a put at a higher strike, sell a put at a lower strike. It profits from a fall.',
      ],
    },

    { h: 'The three numbers' },
    'Every debit vertical is described by its **width** (the difference between the strikes) and its **debit** (what you paid, per share). From those two numbers:',
    {
      list: [
        'Maximum loss = debit. It happens when both options expire worthless.',
        'Maximum profit = width − debit. It happens when both options are in the money, so the spread is worth its full width.',
        'Breakeven: for a bull call spread, lower strike + debit; for a bear put spread, higher strike − debit.',
      ],
    },
    'Note that maximum profit + maximum loss = width, always. A spread cannot be worth less than 0 or more than its width at expiry.',
    { sub: 'A bull call spread' },
    'Stock at 80. Buy the 80 call for 3.10, sell the 85 call for 1.40. Debit 1.70, so $170 at risk. Maximum profit 5.00 − 1.70 = 3.30, $330. Breakeven 81.70. At expiry with the stock at 83, the 80 call is worth 3.00 and the 85 call nothing: 3.00 − 1.70 = +1.30, $130.',
    { sub: 'A bear put spread' },
    'Stock at 120. Buy the 120 put for 4.00, sell the 110 put for 1.50. Debit 2.50, $250 at risk. Width 10, so maximum profit 7.50, $750, reached anywhere below 110. Breakeven 120 − 2.50 = 117.50: the bought put must be worth the debit, and a put is worth the strike minus the price. A common slip is to add the debit to the lower strike instead, which puts the breakeven where the spread is already at its maximum.',
    {
      code: `def bear_put_pnl(price, k_high, k_low, debit):
    value = max(k_high - price, 0) - max(k_low - price, 0)
    return round((value - debit) * 100)

print([bear_put_pnl(p, 120, 110, 2.50) for p in (125, 117.5, 112, 100)])`,
      out: '[-250, 0, 550, 750]',
    },

    { h: 'Choosing the strikes' },
    'The strikes are where you write your view. The long strike is where the trade starts paying; the short strike is where it stops. A common rule of thumb is to put the short strike near your price target, so you are paid for the move you expect and do not pay for a move you do not expect.',
    'The debit relative to the width tells you what the market thinks. A spread that costs nearly its full width is already deep in the money: little to gain, a lot to lose. One that costs a small fraction of its width is cheap because the market sees the move as unlikely. Neither is good or bad in itself; you are trading odds against payoff.',

    { h: 'How the Greeks behave' },
    'Delta is smaller than the long leg alone, because the short leg takes some of it away. Far from expiry the spread gains only slowly even when the stock moves your way: most of its value appears in the last days.',
    'Theta, the effect of a day passing, depends on where the stock is. If it sits near the long strike, the long option has the most time value to lose and time hurts. If it sits near or past the short strike, the short option has the most time value, and as that value disappears the spread climbs towards its full value at expiry. So a debit spread that is winning tends to keep improving if the stock stays put.',

    { h: 'Early assignment and expiry' },
    'Options on most single stocks and ETFs such as SPY are **American style**: the holder can exercise any day. If your short leg is deep in the money, its holder may exercise it early and you are **assigned**: you must deliver or take the shares. This happens most often to a short call the day before an **ex-dividend date**, the first day a buyer of the shares no longer receives the next dividend, because exercising captures it. Your long leg still covers you, but you hold shares or a short share position overnight.',
    'Index options such as SPX are **European style** (exercise only at expiry) and **cash settled** (no shares change hands), so early assignment cannot happen. Check the contract details with your broker. With either kind, close spreads before expiry rather than leaving a leg near the money to be settled automatically.',
  ],

  'strategies-credit': [
    { h: 'Being paid to take a side' },
    'A **credit spread** is a vertical where the option you sell is worth more than the one you buy, so you receive money up front: the **credit**. You sell the option nearer the money and buy one further out as protection.',
    {
      list: [
        '**Bull put spread**: sell a put at a higher strike, buy a put at a lower strike. It wins if the stock stays above the short strike.',
        '**Bear call spread**: sell a call at a lower strike, buy a call at a higher strike. It wins if the stock stays below the short strike.',
      ],
    },
    'A debit spread needs the stock to move your way. A credit spread needs it only not to move against you. That is why credit spreads win more often, and why the wins are small.',

    { h: 'The numbers of a credit spread' },
    {
      list: [
        'Maximum profit = credit, kept when both options expire worthless.',
        'Maximum loss = width − credit, when the spread finishes fully in the money and costs its width to close.',
        'Breakeven: short strike − credit for a bull put spread, short strike + credit for a bear call spread.',
      ],
    },
    { sub: 'A bull put spread' },
    'QQQ at 400. Sell the 390 put for 3.00, buy the 380 put for 1.50. Credit 1.50, $150. Width 10, so the maximum loss is 10 − 1.50 = 8.50, $850, reached anywhere below 380. Breakeven 388.50: there the short put is worth exactly the credit you took in.',
    { sub: 'A bear call spread' },
    'A stock at 60. Sell the 65 call for 0.90, buy the 70 call for 0.30. Credit 0.60, maximum loss 4.40 ($440), breakeven 65.60. If the stock ends at 67, the short call costs 2.00 and you keep 0.60 of credit: −1.40, so −$140.',

    { h: 'Probability against payoff' },
    'Risking $850 to make $150 can only pay if you win often. Treat each trade as either a full win or a full loss. **Expectancy**, the average result per trade, is then p × win − (1 − p) × loss, where p is the chance of a win. Setting it to zero gives the **breakeven win rate**: loss ÷ (win + loss).',
    {
      code: `def breakeven_win_rate(credit, width):
    win, loss = credit * 100, (width - credit) * 100
    return round(loss / (win + loss), 3)

print(breakeven_win_rate(1.50, 10), breakeven_win_rate(3.00, 10))`,
      out: '0.85 0.7',
    },
    'With a 1.50 credit on a 10-wide spread you must win 85% of the time to break even; a 3.00 credit needs 70%. Real trades often end in between (closed early, or expiring between the strikes), so this is a simplification, but it shows the trade-off clearly.',
    { sub: 'Reading delta as a probability' },
    'The delta of an option is a rough, model-based estimate of its chance of finishing in the money. A short put with a delta of −0.15 finishes out of the money about 85% of the time if the model and its implied volatility are right. That is not a guarantee: the model assumes smooth moves, and real markets gap. Losses also cluster, since one sell-off hits every bull put spread at once.',
    'If option prices are fair, the high win rate is exactly paid for by the large losses, and expectancy before costs is near zero. An edge exists only if implied volatility overstates the move that follows, which is something you test, not assume.',

    { h: 'Margin for credit spreads' },
    '**Margin** here means the cash your broker holds against a position that could lose money. Under the exchange rule at the time of writing (2026, the Cboe Margin Manual), a credit spread requires its maximum potential loss, which is the width, and the premium you receive can be applied to it. So a 10-wide spread for a 1.50 credit ties up about $1,000 − $150 = $850 of your own cash, the same as its maximum loss. Brokers may set higher requirements and rules change: check with yours.',

    { h: 'Credit and debit versions of the same bet' },
    'A bull put spread and a bull call spread on the same two strikes and expiry have almost the same payoff. One receives a credit, the other pays a debit, and credit + debit ≈ width. If the 380/390 call spread costs 6.00, expect the 380/390 put spread to pay about 4.00. Rates, dividends and early exercise make the match only approximate. The choice between them comes down to liquidity, fills and which leg is at risk of assignment.',

    { h: 'Mistakes that cost money' },
    {
      list: [
        'Sizing by the credit instead of the maximum loss.',
        'Reading a long winning streak as proof of an edge. Small wins are expected; the question is the size and frequency of the losses.',
        'Adding the credit to the width when computing the loss.',
        'Increasing size after a run of wins, so that the largest position meets the inevitable large loss.',
        'Leaving the spread open into expiry with the price between the strikes.',
      ],
    },
  ],

  'strategies-straddle': [
    { h: 'Betting on movement' },
    'Sometimes you expect a stock to move a lot but cannot say which way: an earnings report, a court ruling, a product launch. A **long straddle** buys a call and a put with the same strike and expiry, usually at the money. A **long strangle** buys an out-of-the-money put and an out-of-the-money call, with the put strike below the price and the call strike above. Whichever way the stock goes, one leg gains.',

    { h: 'Long straddle numbers' },
    'Stock at 200. Buy the 200 call for 6.00 and the 200 put for 5.50. The **debit** is 11.50, $1,150 per straddle.',
    {
      list: [
        'Maximum loss: the debit, if the stock finishes exactly at the strike and both options expire worthless.',
        'Upper breakeven: strike + debit = 211.50. Lower breakeven: strike − debit = 188.50.',
        'Maximum profit: unlimited upwards; downwards, up to the strike minus the debit (188.50 per share) if the stock went to zero.',
      ],
    },
    {
      code: `def straddle(price, k=200, debit=11.50):
    value = max(price - k, 0) + max(k - price, 0)
    return round((value - debit) * 100)

print([straddle(p) for p in (180, 195, 200, 215)])`,
      out: '[850, -650, -1150, 350]',
    },
    'At expiry the straddle is worth the distance between the stock and the strike. A move of 5 points still loses $650 here: the stock must leave the band between the breakevens.',

    { h: 'Long strangle numbers' },
    'Same stock: buy the 190 put for 2.40 and the 210 call for 2.60. Debit 5.00, $500. The whole debit is lost anywhere between 190 and 210. Breakevens: put strike − debit = 185, call strike + debit = 215. The strangle is cheaper than the straddle, but it needs a move of 15 points rather than 11.50 to break even, and it loses everything on a move that a straddle would partly recover.',

    { h: 'What the price of a straddle means' },
    'The at-the-money straddle price is the move the market expects by expiry (volatility module). Buying it is a bet that the real move will be larger. That is the whole trade, and it explains its most common failure.',
    { sub: 'IV crush' },
    'Before a scheduled event, **implied volatility** (IV, the volatility figure built into option prices) is high, because a large move is possible. After the news it drops sharply: this is **IV crush**. A straddle bought for 11.50 before earnings may be worth 8.00 the next morning after an 8-point move. The stock moved, the direction did not matter, and the trade still lost, because the move was smaller than the price and the extra time value vanished with the uncertainty.',
    { sub: 'The Greeks' },
    'At the start the call delta (about +0.5) and the put delta (about −0.5) cancel, so **delta** is near zero. Both options are bought, so their other Greeks add: **long gamma** (as the stock moves, delta grows in that direction, which is why moves pay), **long vega** (higher IV helps), and **negative theta**: every quiet day costs money, and the cost speeds up near expiry.',

    { h: 'Short straddles and strangles' },
    'Selling both legs reverses everything: the credit is the maximum profit, kept only if the stock finishes between the strikes (or at the strike, for a straddle), and the Greeks become short gamma, short vega, positive theta.',
    'The risk is **undefined**. Above the call strike the loss grows by $100 for every dollar the stock rises, with no limit. Below the put strike it grows until the stock reaches zero. Sell the 190/210 strangle above for 5.00 and a takeover bid that sends the stock to 240 costs 30.00 − 5.00 = 25.00, $2,500 per strangle, five times the credit. Gaps happen overnight and over weekends, when no stop can trigger.',
    'Brokers require large margin for naked short options, raise it when markets move, and usually allow them only at their highest approval level. If you want to sell movement with a loss you can state in advance, buy options further out on both sides: that is the iron condor of the next lesson.',

    { h: 'Common mistakes' },
    {
      list: [
        'Buying a straddle because "something will happen" without comparing the expected move to its price.',
        'Holding a long straddle through quiet days and letting theta eat it.',
        'Selling strangles sized by the credit, as if it were the risk.',
        'Treating a run of winning weeks on short strangles as evidence that the tail risk is small.',
      ],
    },
  ],

  'strategies-condor': [
    { h: 'Selling a range with a safety net' },
    'A short strangle bets that the stock stays in a range but has no limit on its loss. An **iron condor** adds a bought option beyond each sold one, so each side becomes a credit spread: a bull put spread below the price and a bear call spread above it, all with the same expiry. Four legs, from the lowest strike up: long put, short put, short call, long call. The bought options are called the **wings**.',

    { h: 'The numbers of an iron condor' },
    'Stock at 100. Buy the 80 put for 0.20, sell the 90 put for 0.90, sell the 110 call for 0.80, buy the 120 call for 0.15. The put side brings in 0.70 and the call side 0.65, a total **credit** of 1.35, $135.',
    {
      list: [
        'Maximum profit: the total credit, $135, kept when the stock finishes between 90 and 110.',
        'Maximum loss: wing width − credit = 10 − 1.35 = 8.65, $865. The stock cannot be below 80 and above 120 at the same time, so only one side can lose. Adding both widths overstates the risk.',
        'Breakevens: short put − credit = 88.65, short call + credit = 111.35.',
      ],
    },
    { sub: 'Uneven wings' },
    'If the put wing is 10 wide and the call wing 5 wide, the worst case is set by the wider one: 10 − credit. Traders sometimes skew the wings to lean one way; the arithmetic follows the wider side.',
    {
      code: `def condor(price, lp, sp, sc, lc, credit):
    puts = max(lp - price, 0) - max(sp - price, 0)
    calls = max(price - lc, 0) - max(price - sc, 0)
    return round((puts + calls + credit) * 100)

print([condor(p, 80, 90, 110, 120, 1.35) for p in (75, 88.65, 100, 115, 130)])`,
      out: '[-865, 0, 135, -365, -865]',
    },

    { h: 'The iron butterfly' },
    'An **iron butterfly** puts both short strikes at the same price, at the money, with wings on either side. Stock at 50: sell the 50 put for 2.00 and the 50 call for 2.10, buy the 45 put for 0.60 and the 55 call for 0.70. Credit 4.10 − 1.30 = 2.80, $280. Maximum loss 5 − 2.80 = 2.20, $220. Breakevens 47.20 and 52.80.',
    'Compared with a condor, the credit is larger and the maximum loss smaller, which looks better. The catch is the shape: the full $280 is earned only if the stock finishes exactly at 50, and the profit falls away on both sides. It is a bet on the stock staying very close to one price, not in a wide range.',

    { h: 'Greeks and how condors lose' },
    'Both structures are **short gamma** (a move hurts, and hurts faster as expiry nears), **short vega** (a rise in implied volatility makes the options you sold more expensive to buy back) and **positive theta** (each quiet day adds a little profit). The bad case is a fast move towards a short strike together with rising IV, which is what a sell-off usually looks like.',
    'Before expiry the P&L curve is smoother than the expiry diagram: a move that would cost the full wing at expiry costs less a week before. In the last days the curve sharpens towards the expiry shape, which is why many traders close condors before the final week.',
    { sub: 'Wider or narrower wings' },
    'Moving the wings further out makes them cheaper, so the credit rises a little, but the maximum loss rises by almost the full extra width. Narrow wings mean a small credit and a small worst case; wide wings mean a slightly larger credit and a much larger worst case. Neither is free.',

    { h: 'Margin and costs' },
    'Under the exchange rule at the time of writing (2026, Cboe Margin Manual), an iron condor requires only one side\'s maximum loss, because both sides cannot lose at once, and the credit can be applied. Brokers may ask for more. Four legs mean four bid-ask spreads and four commissions each way. On a credit of $135 that is a real share of what you can make.',

    { h: 'Planning one' },
    {
      list: [
        'Place the short strikes relative to the expected move from IV or the straddle price.',
        'Write down the credit, maximum loss and both breakevens in dollars before entering.',
        'Size from the maximum loss, not the credit.',
        'Check the calendar for scheduled events that could move the price through a short strike.',
        'Decide in advance when you take profit, when you cut a loss, and the date you close regardless.',
        'Enter all four legs as one order at a net price.',
      ],
    },
  ],

  'strategies-calendar': [
    { h: 'Spreads across time' },
    'Every spread so far used one expiry. A **calendar spread** (also called a time spread) sells an option that expires soon and buys an option of the same type and strike that expires later. The later option has more time value, so you pay a **debit**. A **diagonal spread** does the same with different strikes as well as different expiries.',

    { h: 'Why near options decay faster' },
    'For an at-the-money option a useful rule of thumb is: price ≈ 0.4 × σ × S × √t, where σ (sigma) is the implied volatility as a decimal, S the stock price and t the time left in years. The square root is the key. Doubling the time left does not double the price; it multiplies it by √2 ≈ 1.41.',
    {
      code: `import math

def atm(days, iv=0.30, price=50):
    return round(0.4 * iv * price * math.sqrt(days / 365), 2)

print(atm(30), atm(90), atm(60))`,
      out: '1.72 2.98 2.43',
    },
    'Read the numbers as a calendar on a $50 stock at 30% IV. The 30-day option is worth 1.72 and will be worth nothing at the money in 30 days. The 90-day option is worth 2.98 and in 30 days becomes a 60-day option, worth about 2.43. Over the same month the near option loses 1.72 and the far one only 0.55. A calendar collects that difference.',

    { h: 'The best and worst cases' },
    { sub: 'Stock at the strike' },
    'The calendar does best when the stock is at the strike as the near option expires: the sold option expires worthless and the bought one still has its largest possible time value, since time value is greatest at the money.',
    { sub: 'Stock far away' },
    'If the stock has run far above the strike, both calls are deep in the money and almost all their value is intrinsic (the stock price minus the strike). The difference between them, which is what the spread is worth, shrinks towards zero. The same happens far below the strike, where both are nearly worthless. Either way you lose most of the debit. A calendar is a bet that the stock stays near the strike.',
    { sub: 'The maximum loss' },
    'If you close both legs when the near option expires, the most you lose is about the debit, because the later option is never worth less than the near one at that moment. On American-style options, early assignment of the short leg and dividends can complicate this. Brokers often treat calendars as needing extra margin for that reason.',

    { h: 'No single payoff diagram' },
    'With one expiry, the P&L at expiry depends only on the stock price. A calendar has two expiries, so at the first one the P&L depends on what the remaining option is worth, and that depends on its implied volatility then. You estimate it with a pricing model such as Black-Scholes (pricing module), using the time the far option has left: its total days minus the days that have passed. Using the original number of days overstates its value.',
    {
      code: `import math

def bs_call(S, K, t, iv):
    n = lambda x: 0.5 * (1 + math.erf(x / math.sqrt(2)))
    d1 = (math.log(S / K) + iv * iv * t / 2) / (iv * math.sqrt(t))
    return S * n(d1) - K * n(d1 - iv * math.sqrt(t))

print(round(bs_call(50, 50, 60 / 365, 0.30), 2), round(bs_call(50, 50, 60 / 365, 0.24), 2))`,
      out: '2.42 1.94',
    },
    'The same 60-day option is worth 2.42 at 30% IV and 1.94 at 24%. That is **vega** at work. Longer-dated options have more vega than near ones, so a calendar is **long vega**: it gains when IV rises across expiries and loses when it falls, even if the stock does not move.',

    { h: 'Term structure and events' },
    '**Term structure** is how IV differs from one expiry to the next (volatility module). If an earnings date falls before the near expiry, the near option carries the event premium and the calendar sells it, which can help when the IV drops after the news. If the event falls between the two expiries, the far option is the one carrying the premium, and you are buying it. Check which expiry contains the event before placing the trade.',

    { h: 'Diagonals' },
    'A common diagonal buys a longer-dated in-the-money call and sells a near-term out-of-the-money call. The long call behaves partly like the shares and the short call collects time decay, so it is sometimes compared with a covered call (owning shares and selling a call against them), with less money tied up. If the stock falls far, both calls lose nearly all their value and you lose about the debit. If the gap between strikes is smaller than the debit, a sharp rise can also lose money, so check that the strikes are further apart than what you paid.',
  ],

  'strategies-choose': [
    { h: 'A structure is a written view' },
    'By now you have met many shapes. Each one is a way of writing a view about the future in option form. Choosing one starts with three questions, answered on paper before you look at any order screen.',
    {
      list: [
        '**Direction**: up, down, or neither?',
        '**Volatility**: will the stock move more or less than the options already price in? Is implied volatility high or low for this stock?',
        '**Time**: by when should the view play out?',
      ],
    },
    { sub: 'Measuring whether IV is high' },
    'A reminder from the volatility module: **IV rank** places today\'s implied volatility within its range over the past year, from 0 (the lowest) to 100 (the highest). A high IV rank means options are expensive compared with their own history, which favours selling premium; a low one favours buying it. It is a starting idea, not a rule: IV can be high for a good reason, such as an event that has not happened yet.',

    { h: 'A starting map' },
    'The table below is a map of common choices, not a recipe. Each entry has defined risk except where noted.',
    {
      list: [
        'Up, IV low: bull call spread, or a long call (whose loss is limited to its premium).',
        'Up, IV high: bull put spread.',
        'Down, IV low: bear put spread. Down, IV high: bear call spread.',
        'A big move either way, IV low: long straddle or strangle.',
        'A range, IV high: iron condor or iron butterfly, rather than a short strangle with undefined risk.',
        'Quiet near term, with a near expiry that is expensive: a calendar.',
        'No clear view, or IV that makes every structure poor value: no trade.',
      ],
    },
    {
      code: `def choose(direction, iv_rank):
    rich = iv_rank >= 50
    if direction == 'up':
        return 'bull put spread' if rich else 'bull call spread'
    if direction == 'down':
        return 'bear call spread' if rich else 'bear put spread'
    return 'iron condor' if rich else 'no trade'

print(choose('up', 20), '|', choose('neither', 70), '|', choose('neither', 10))`,
      out: 'bull call spread | iron condor | no trade',
    },
    'Writing the map as code forces every branch to be stated, including the branch where the answer is not to trade. The split at an IV rank of 50 is arbitrary; the point is that the rule is written down.',

    { h: 'Counting the cost of legs' },
    'Each leg is bought or sold at its own bid and ask. If you trade at the mid-price (halfway between) you pay nothing extra, but fills at a fair price usually cost about half the bid-ask spread per leg. Take a two-leg vertical whose legs are each 0.20 wide. Half the spread is 0.10 per leg, 0.20 to enter and 0.20 to exit, 0.40 per share, so $40 per spread. Add commissions: at a made-up fee of $1.00 per contract, two legs in and two out cost $4.00. On a spread whose best case is $200, costs take $44, 22%.',
    {
      code: `def round_trip(legs, half_spread, fee):
    return round(legs * 2 * (half_spread * 100 + fee), 2)

print(round_trip(2, 0.10, 1.00), round_trip(4, 0.10, 1.00))`,
      out: '44.0 88.0',
    },
    'Four legs cost twice what two legs cost. Fees differ by broker, and the figures here are made up for the example: check your own.',

    { h: 'Placing a multi-leg order' },
    'Brokers let you send all legs as one **complex order** (also called a spread order) with a single net limit price, such as "buy this call spread for 1.70 or better". Either the whole structure fills or nothing does. The alternative, **legging in**, means placing one leg and then the other. Between the fills you hold a different position from the one you planned: half a spread is a single naked option. If the market moves in that gap, the second leg fills at a worse price or the first leg loses value, and the spread costs more than it would have.',
    { sub: 'Liquidity' },
    'Prefer underlyings and strikes with tight markets. SPY, QQQ and SPX trade many strikes with narrow bid-ask spreads. A thinly traded single stock may be 0.30 wide or more on each leg, which can make a four-leg structure too expensive to be worth it.',

    { h: 'Spreads as day trades' },
    "A spread's short leg offsets its long leg. Far from expiry, a vertical's net delta is smaller than that of its long leg, so on a quick intraday move it gains less than a single option and its price moves slowly. That makes it safer and slower. Near expiry the offset weakens and the spread behaves more like its expiry diagram. The daytrading module returns to this when choosing an option for a day trade.",

    { h: 'The honest frame' },
    'Studies of retail day traders consistently find that most of them lose money, and no structure changes that on its own. What a structure does is shape the risk you carry while you find out whether you have an edge. Choose defined risk, size from the maximum loss, count the costs, and test the plan on paper before real money.',
  ],

  'strategies-lab': [
    { h: 'What the analyser does' },
    'The lessons in this module worked out maximum profit, maximum loss and breakevens by hand for each structure. The analyser does it for any list of legs. It gives the same answers on the structures you know, which is how you check it, and then it handles combinations no lesson covered.',

    { h: 'A leg as data' },
    'A leg is a Python dictionary with four keys: `type` ("call" or "put"), `strike`, `qty` and `premium`. A positive `qty` means bought, a negative one sold, and the size is the number of contracts. The premium is per share, as quoted.',
    { sub: 'Profit of one leg' },
    'At expiry an option is worth its **intrinsic value**: for a call, the price minus the strike if that is positive, otherwise 0; for a put, the strike minus the price if positive. The profit per share of a leg is `qty × (intrinsic − premium)`. A bought leg (qty +1) gains the intrinsic value and paid the premium. A sold leg (qty −1) received the premium and owes the intrinsic value: the same formula with the sign flipped.',
    { sub: 'Profit of a position' },
    'A position is the sum of its legs, multiplied by 100 shares per contract. Rounding to cents with `round(x, 2)` removes the tiny floating-point leftovers such as 1.0000000000000002, so that a P&L of exactly zero is stored as 0 and can be tested for.',

    { h: 'The whole curve with NumPy' },
    'To draw a payoff diagram you need the P&L at many prices. With NumPy you compute it for an array of prices at once. `np.maximum(prices - strike, 0)` takes the larger of each element and 0, giving the intrinsic value of a call at every price in one step. Loop over the legs (a handful), not over the prices (possibly thousands).',
    {
      code: `import numpy as np

prices = np.array([90.0, 100.0, 110.0])
call_100 = np.maximum(prices - 100, 0)
put_100 = np.maximum(100 - prices, 0)
print(call_100 + put_100)`,
      out: '[10.  0. 10.]',
    },
    'That is the value of a 100 straddle at three prices, before subtracting what it cost.',

    { h: 'Finding the extremes without a grid' },
    'At expiry the P&L is made of straight pieces that only bend at strikes. Between two strikes nothing changes slope. So the highest and lowest values on any finite stretch are at the corners: the strikes themselves, or the ends.',
    { sub: 'The left end' },
    'A stock price cannot go below 0, so price 0 is the left end. Checking it covers everything below the lowest strike, which is how a short put shows its real worst case: the strike minus the premium, times 100.',
    { sub: 'The right end' },
    'Above the highest strike every put is worthless and every call gains $100 per contract for each dollar. The slope there is 100 times the **net number of calls** held (bought calls minus sold calls). If it is positive, profit grows without limit; if negative, loss does; if zero, the line is flat and the corner values are the true extremes. Python represents an unlimited value with `math.inf` (and `-math.inf`), which compares larger (or smaller) than any number.',
    {
      code: `legs = [("call", 100, 1), ("call", 110, -2)]
net_calls = sum(q for kind, k, q in legs if kind == "call")
print(net_calls, "unlimited loss" if net_calls < 0 else "bounded above the top strike")`,
      out: '-1 unlimited loss',
    },
    'Buying one call and selling two higher ones (a ratio spread) leaves one call sold net, so the loss above the top strike has no limit, even though the position looks like a spread.',

    { h: 'Breakevens by interpolation' },
    'A breakeven is a price where the P&L is zero. Within one straight piece from price a to price b, with P&L pa at a and pb at b, the line crosses zero only if pa and pb have opposite signs, and the crossing is at a + (b − a) × pa ÷ (pa − pb). This is **linear interpolation**, and because the piece really is straight, the result is exact.',
    'Check it with numbers. From 40 (P&L −300) to 50 (P&L +200), the fraction of the way across is −300 ÷ (−300 − 200) = 0.6, so the crossing is at 46. Swapping pa for pb in the formula gives a negative fraction and a point outside the piece, which is a quick sign that something is wrong.',
    'Above the top strike there can be one more crossing, if the slope is not zero: at top − P&L(top) ÷ slope, provided that lies above the top strike. A long call has its only breakeven there.',

    { h: 'Testing it' },
    'Test on structures you can do by hand: a call spread, a straddle, a condor, a short put. Include cases at the edges: a breakeven exactly at a strike, an unlimited side, a single leg. Then the analyser is ready for the next step, which needs a pricing model: what the position is worth before expiry, when time and implied volatility also matter.',
  ],
}
