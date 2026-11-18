import type { Block } from '../../types'

/** The full theory for each lesson of the pricing module, keyed by lesson id. */
export const pricingTheory: Record<string, Block[]> = {
  'pricing-drivers': [
    { h: 'Value at expiry and value today' },
    'A quick reminder from the options module. A **call** is the right to buy 100 shares at a fixed price, the **strike**, until a date, the **expiry**. A **put** is the right to sell at the strike. The price you pay for the option is the **premium**, quoted per share, so a quote of 2.00 costs $200 for one contract.',
    'At expiry an option is worth exactly its **intrinsic value**: what you would gain by using it right now. For a call that is the stock price minus the strike, or zero if that is negative. For a put it is the strike minus the stock price, or zero. An option with intrinsic value is **in the money**; one at the strike is **at the money**; one with no intrinsic value is **out of the money**.',
    'Before expiry, options trade for more than their intrinsic value. Suppose a stock is at 83 and the 80 call costs 4.90. Its intrinsic value is 83 − 80 = 3.00. The other 1.90 is **extrinsic value**, also called time value. An out-of-the-money option has no intrinsic value at all, so its whole price is extrinsic.',

    { h: 'Why anyone pays extrinsic value' },
    'Extrinsic value is the price of uncertainty. A bought option can lose at most its premium, but if the stock moves a long way in its favour it can gain far more. The holder benefits from big moves and is protected from the worst of the bad ones. The seller takes the other side of that and wants to be paid for it.',
    'Think of it as an insurance premium. A house insurer charges more when there is more time left on the policy and when fires are more likely. An option seller charges more when there is more time left and when the stock moves more. By expiry the policy has run out and so has the extrinsic value: it falls to zero whatever happens.',

    { h: 'The five inputs' },
    {
      list: [
        '**Stock price (S)**: where the shares trade now.',
        '**Strike (K)**: the fixed price in the contract.',
        '**Time to expiry (T)**: usually measured in years in formulas, so 45 days is 45 ÷ 365 ≈ 0.123.',
        '**Volatility (σ, the Greek letter sigma)**: how much the stock tends to move, as a yearly percentage. 25% means a typical yearly move of about a quarter of the price.',
        '**Interest rate (r)**: the rate on cash. Dividends also matter for stocks that pay them.',
      ],
    },
    'Four of these you can read off a screen. Volatility over the life of the option is unknown. The market settles on a figure through the option price itself, and that figure is called **implied volatility**. The volatility module is about it.',
    { sub: 'Which way each input pushes' },
    'Holding everything else fixed: a call gains when the stock rises and a put gains when it falls. A lower strike makes a call worth more and a put worth less. More time and more volatility both mean a wider range of possible prices at expiry, and since the option holder keeps the good outcomes and is protected from the bad ones, both raise the value of calls and puts alike. Higher rates raise calls slightly and lower puts slightly. For options that expire within days, rates hardly matter.',

    { h: 'Where extrinsic value is largest' },
    'At the money the outcome is most uncertain: the option could end worth a lot or nothing. Deep in the money the option is almost certain to be exercised and behaves like the stock; far out of the money it is almost certain to expire worthless. In both cases there is little uncertainty left to pay for, so extrinsic value is largest at the strike and shrinks on both sides.',
    { sub: 'A rule of thumb for at-the-money options' },
    'For an option at the money, the price is close to 0.4 × S × σ × √T, with T in years. The 0.4 comes from the bell curve of the normal distribution (its peak is 0.399). Take a stock at 80, volatility 25% and 45 days left:',
    {
      code: `import math

S, vol, days = 80, 0.25, 45
T = days / 365
print(round(0.4 * S * vol * math.sqrt(T), 2))`,
      out: '2.81',
    },
    'The full model gives 2.80. Two things follow from the rule. The price is proportional to volatility, so doubling volatility roughly doubles it. And it grows with the square root of time, so you need four times as much time to double it, and an option with a quarter of its time left is worth about half as much.',

    { h: 'The Greeks as names for sensitivities' },
    'Traders name how much the price moves for each input with a Greek letter. **Delta** for the stock price, **gamma** for how fast delta itself changes, **theta** for the passing of time, **vega** for volatility and **rho** for interest rates. The next lessons take them one at a time. Rho gets no lesson of its own: for short-dated options a one-point change in rates moves the price by a fraction of a cent.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Calling an option cheap because its price is low. A 0.15 option is usually cheap because it is unlikely to pay anything.',
        'Forgetting that extrinsic value goes to zero by expiry. If the stock ends where it is now, an at-the-money option loses its whole price.',
        'Expecting the option to rise when the stock does, whatever else happens. Time and volatility move the price too.',
        'Using the put formula for a call or the other way round when splitting intrinsic from extrinsic value.',
      ],
    },
  ],

  'pricing-delta': [
    { h: 'What delta measures' },
    '**Delta** is how much the option price changes when the stock rises by $1, with time and volatility held still. If a call has delta 0.45 and the stock goes from 80 to 81, the call rises by about 0.45, from say 2.80 to 3.25.',
    'A call\'s delta lies between 0 and 1: it can never gain more than the stock. A put\'s delta lies between −1 and 0, because a put gains when the stock falls. A put with delta −0.40 rises by about 0.40 when the stock drops $1.',
    { sub: 'Per share and per contract' },
    'Delta is quoted per share. A contract covers 100 shares, so a delta of 0.45 means about $45 per contract per $1 of stock. For a move of $2 on 3 contracts at delta 0.45, the estimate is 0.45 × 2 × 100 × 3 = $270. Leaving out the 100 is a common and costly slip.',

    { h: 'How delta changes with the strike' },
    'At the money delta is close to 0.50: the option is about as likely to end up worth something as not, and it moves about half as much as the stock. Deep in the money delta approaches 1, and the option moves almost dollar for dollar with the stock. Far out of the money it approaches 0, and the option hardly reacts.',
    'This decides what a $1 move does to different calls. With a stock at 80, with 45 days left and volatility at 25%, a deep in-the-money 70 call has delta about 0.94 and costs about 10.18, while an 85 call has delta 0.26 and costs 1.05. A $1 rise gives the first about 94 cents and the second about 26 cents per share. In percentage terms the cheap call does better (about 25% against about 9%), which is why cheap calls attract beginners. The same gearing works against you when the move does not come.',
    { sub: 'How delta changes with time' },
    'With less time left, an out-of-the-money option is less likely to reach its strike, so its delta shrinks towards 0. The 85 call above has delta 0.26 with 45 days left but only about 0.07 with 10 days left, if the stock stays at 80. An in-the-money option\'s delta grows towards 1 for the same reason. At the money it stays near 0.50.',

    { h: 'Delta as a share count' },
    'Delta also tells you how many shares an option acts like. A call with delta 0.45 behaves, for small moves, like 45 shares. This is the **hedge ratio**: if you hold that call and short 45 shares, small moves in the stock roughly cancel out.',
    { sub: 'Position delta' },
    'With several options, add up the share equivalents. For each leg multiply delta by 100 and by the number of contracts, counting short positions as negative contracts. The total is the **position delta**.',
    {
      code: `legs = [(0.45, 3), (-0.40, 2), (0.70, -1)]   # (delta per share, contracts)
total = sum(delta * qty * 100 for delta, qty in legs)
print(round(total))`,
      out: '-15',
    },
    'Three calls at 0.45 give +135 shares. Two long puts at −0.40 give −80. One short call at 0.70 gives −70. The book acts like being short 15 shares. Notice that a short put would count as positive: a negative delta times negative contracts. Selling a put is a bet that the stock does not fall.',

    { h: 'Delta as a rough probability' },
    'Delta sits close to the chance, as priced by the market, that the option finishes in the money. A 0.25-delta call is roughly a 1 in 4 shot. Traders use this as a quick guide, for example to pick a strike.',
    'Treat it with care. The probability comes from the model and the market\'s implied volatility, not from a forecast of where the stock will go. For calls, delta is slightly higher than the model\'s own probability. And a probability says nothing about whether a trade is good: that also depends on what you pay and what you can win.',

    { h: 'Put delta from call delta' },
    'Owning a call and selling a put with the same strike and expiry gives the same result at expiry as owning 100 shares bought at the strike. Shares have delta 1, so call delta minus put delta is about 1, and **put delta ≈ call delta − 1**. A 0.45-delta call means the matching put is about −0.55. This holds exactly in the basic model with no dividends and no interest; in practice it is close.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Forgetting the multiplier of 100 when turning delta into dollars.',
        'Adding short positions with the wrong sign, which can turn a hedge into a doubling of risk.',
        'Reading delta as a forecast. It is a price sensitivity that happens to look like a probability.',
        'Treating a hedge as permanent. Delta moves with the stock, with time and with volatility, so a hedge drifts.',
      ],
    },
  ],

  'pricing-gamma': [
    { h: 'Delta does not stay still' },
    'Delta is the slope of the option price against the stock price, and that slope changes as the stock moves. A call that starts at the money with delta 0.50 will have a higher delta after the stock rises and a lower one after it falls. **Gamma** is how much delta changes for a $1 move in the stock.',
    'If a call has delta 0.52 and gamma 0.06, then after a $1 rise its delta is about 0.58, and after a $1 fall about 0.46. Bought options, calls and puts alike, have positive gamma. Sold options have negative gamma.',

    { h: 'The gamma term in a P&L estimate' },
    'Since delta grows during a rise, the option gains more than the starting delta suggests. Over a move of m dollars, delta goes from Δ to roughly Δ + Γ·m, so on average it is Δ + ½·Γ·m. The change in price is about that average times the move:',
    'ΔP ≈ Δ·m + ½·Γ·m²',
    { sub: 'A worked example' },
    'Take delta 0.52 and gamma 0.06. A $3 rise: 0.52 × 3 = 1.56, plus ½ × 0.06 × 9 = 0.27, so about +1.83. A $3 fall: −1.56 + 0.27 = −1.29. The gamma term adds the same amount whichever way the stock goes, because m² is positive either way.',
    {
      code: `def move_pnl(delta, gamma, m):
    return delta * m + 0.5 * gamma * m ** 2

print(round(move_pnl(0.52, 0.06, 3), 2), round(move_pnl(0.52, 0.06, -3), 2))`,
      out: '1.83 -1.29',
    },
    'This shape, gaining more on the way up than you lose on the way down by the same distance, is called **convexity**. A long option has it. A short option has the opposite: each dollar against you costs more than the one before.',

    { h: 'Where gamma is large' },
    'Gamma is largest at the money, where delta is changing fastest from near 0 to near 1. Deep in or far out of the money delta is already pinned near 1 or 0, so gamma is small.',
    { sub: 'Gamma and time to expiry' },
    'The closer the expiry, the more of delta\'s change is squeezed into a narrow range of prices around the strike. For an at-the-money option, gamma grows roughly like 1 ÷ √T. With a stock at 80 and volatility at 25%, the 80 call has gamma about 0.057 with 45 days left, 0.17 with 5 days and 0.38 with one day. A quarter of the time left means about twice the gamma.',
    'Out-of-the-money options behave differently near expiry. If the strike is far away relative to the time left, gamma collapses towards zero, because no realistic move will bring the option into play.',

    { h: 'Why options near expiry are explosive' },
    'With gamma at 0.38, a $1 move takes delta from 0.50 to about 0.83, and a $1 move the other way to about 0.17. (Gamma itself shrinks during the move, so the straight-line guess of 0.88 overshoots.) The option acts like a switch: small moves in the stock decide whether it is worth something or nothing. The 80 call worth 0.42 with a day left is worth about 1.10 if the stock goes to 81 and about 0.09 if it goes to 79.',
    { sub: 'Position gamma' },
    'Like delta, gamma adds up across a position: Γ × 100 × contracts, negative for short. Short 8 options with gamma 0.25 is a position gamma of −200: each $1 move against you adds 200 shares of exposure in the wrong direction. That is how a small short position near expiry becomes a large loss in an afternoon, and why sellers of near-expiry options need a hard plan for exits.',

    { h: 'Estimating Greeks by repricing' },
    'Any pricing function can give delta and gamma without a formula. Price the option at S + h, S and S − h for a small h. The slope (f(S+h) − f(S−h)) ÷ 2h is delta; the curvature (f(S+h) − 2f(S) + f(S−h)) ÷ h² is gamma. This is useful to check formula Greeks, and it works for any model.',

    { h: 'Gamma is paid for' },
    'Long gamma is not free. Options with high gamma lose value fast with time, which is the next lesson. A buyer of gamma pays every day for the chance of a large move; a seller collects that payment and carries the risk. Neither side has an edge from the Greeks alone: the question is whether the moves that happen are larger or smaller than the ones priced in.',
  ],

  'pricing-theta': [
    { h: 'Time as a cost' },
    '**Theta** is how much the option price changes when one day passes and nothing else changes: same stock price, same volatility. A bought option loses extrinsic value as time runs out, so its theta is negative. A sold option gains it, so a seller\'s theta is positive.',
    'A call with theta −0.04 loses about 4 cents a share per day, $4 a contract. Hold 5 contracts for 3 quiet days and the estimate is −0.04 × 3 × 100 × 5 = −$60.',
    { sub: 'Calendar days or trading days' },
    'Formulas give theta per year. Most platforms divide by 365 and show it per calendar day; some divide by about 252, the number of trading days, which gives a larger number per day. A yearly theta of −11.0 is −0.030 per calendar day or −0.044 per trading day. Find out which your platform uses before comparing numbers.',

    { h: 'Decay speeds up' },
    'For an at-the-money option the price is close to 0.4 × S × σ × √T. Because of the square root, value does not drain in a straight line. Halving the time left takes away only about 29% of the value; a quarter of the time left still leaves half of it. So half the value of an at-the-money option goes in the last quarter of its life.',
    {
      code: `import math

S, vol = 80, 0.25
for days in [80, 20, 5]:
    print(days, round(0.4 * S * vol * math.sqrt(days / 365), 2))`,
      out: '80 3.75\n20 1.87\n5 0.94',
    },
    'From 80 to 20 days the option loses 1.88 over 60 days, about 3 cents a day. From 20 to 5 days it loses 0.93 over 15 days, about 6 cents a day. The last 5 days take the remaining 0.94, about 19 cents a day. Theta for an at-the-money option grows roughly like 1 ÷ √T.',
    'Note the line `days / 365`: volatility is quoted per year, so time must be in years. Using days directly makes every value about 19 times too large, since √365 ≈ 19.1.',

    { h: 'In and out of the money' },
    'An out-of-the-money option has less extrinsic value to lose, so its theta in dollars is smaller. As a share of its price it is larger. With the stock at 80 and 45 days left, the 85 call costs about 1.05; with 10 days left and no move it is worth about 0.11. It has lost about 90% of its value in 35 days, while the at-the-money 80 call over the same days loses a little over half. Most of an out-of-the-money option\'s value goes well before the last week.',
    { sub: 'The last day' },
    'An option that expires today loses all its remaining extrinsic value by the close. With the stock exactly at the strike, an at-the-money option with one day left on our 80 stock is worth about 0.42; by the end of the day only intrinsic value is left. A per-year formula hides this. Repricing with one day less, f(days − 1) − f(days), shows it directly, and on the last day it equals minus the whole remaining extrinsic value.',

    { h: 'Weekends and holidays' },
    'Calendar theta counts every day, including Saturday and Sunday. Market makers know the weekend is coming, and how much of its decay is already in the prices on Friday is decided by the market, not a formula. Do not expect an easy gain from selling options on Friday and buying them back cheaper on Monday.',

    { h: 'Theta pays for gamma' },
    'A long option has positive gamma (it gains from moves in either direction) and negative theta (it loses while waiting). On any day, the gamma gain from a move of m dollars is about ½·Γ·m², and the cost of the day is |θ|. Setting them equal gives the **break-even move**:',
    'm = √(2 × |θ| ÷ Γ)',
    { sub: 'An example' },
    'An option with theta −0.05 and gamma 0.10 needs √(2 × 0.05 ÷ 0.10) = √1 = $1 of movement in a day, up or down, to cover its decay. If the stock usually moves less than that, the option loses ground on most days. This leaves out vega and the spread, so the real hurdle is a little higher.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Thinking a flat stock means a flat P&L. A bought option loses value every day nothing happens.',
        'Buying an option that expires before the move is expected to arrive.',
        'Mixing days and years in a formula.',
        'Selling options for their theta without counting the gamma risk that comes with it: a seller wins small on quiet days and can lose large on a big one.',
      ],
    },
  ],

  'pricing-vega': [
    { h: 'Volatility as an input you cannot see' },
    'The first lesson listed volatility as the one input you cannot look up. The market fills the gap: given an option price, you can work backwards to the volatility that makes the model match it. That number is the **implied volatility**, or **IV**. When people say options are "expensive", they mean IV is high. The volatility module covers how IV is found and what moves it.',
    '**Vega** is how much the option price changes when IV rises by one **percentage point**, for example from 25% to 26%. A call with vega 0.11 gains about 11 cents a share if IV rises one point, and loses 11 cents if it falls one point.',

    { h: 'Vega for calls, puts, buyers and sellers' },
    'Higher volatility makes both calls and puts more valuable, because a wider spread of outcomes helps the holder of either. A call and a put with the same strike and expiry have the same vega. Put-call parity (lesson six) links their prices through the stock and the strike, and neither of those depends on volatility.',
    'Bought options have positive vega. Sold options have negative vega: if you are short 3 puts with vega 0.07 and IV jumps 8 points, the vega loss is 3 × 0.07 × 8 × 100 = $168. Sellers of puts are often hit twice in a sell-off: the stock falls and IV rises.',
    { sub: 'Units' },
    'The formula for vega gives the change for a volatility move of 1.00, which is 100 percentage points. Platforms divide by 100 to show it per point. If you write your own code and the IVs are in percent (25.0), the change in points is the plain difference of the two IVs. Mixing the two conventions makes vega a hundred times too big or too small.',

    { h: 'Where vega is large' },
    'Vega is largest at the money and grows with time to expiry. For an at-the-money option it is about 0.4 × S × √T ÷ 100. On a stock at 80 that gives about 0.32 a point with a year left, about 0.11 with 45 days and under 0.02 with one day. A long-dated option is mostly a bet on volatility; a same-day option is mostly a bet on the stock price.',
    {
      code: `import math

S = 80
for days in [365, 45, 1]:
    print(days, round(0.4 * S * math.sqrt(days / 365) / 100, 3))`,
      out: '365 0.32\n45 0.112\n1 0.017',
    },

    { h: 'Right on direction, still losing' },
    'IV moves for reasons of its own. It tends to rise before scheduled news, such as a company\'s results, and when markets fall. It tends to fall once the news is out. A buyer who pays a high IV before the news can see the stock move the right way and still lose.',
    { sub: 'A worked example' },
    'A stock is at 80 and you buy the 80 call with 45 days left. Its delta is 0.52 and its vega 0.11. The news comes out, the stock rises $1, and IV drops 8 points. Delta adds about 0.52 and gamma a few cents. Vega takes away 0.11 × 8 = 0.88. Before theta, you are down about 0.33 a share on a correct call.',
    'Turn it round to find the hurdle: to cover an IV drop costing 0.88, at a delta of 0.52 the stock must rise about 0.88 ÷ 0.52 ≈ $1.69 before the trade breaks even.',

    { h: 'How much vega matters to a day trader' },
    'For options that expire today or this week, vega is small next to delta and gamma: a two-point change in IV moves a one-day option by a few cents, while a $1 move in the stock moves it by fifty. For options weeks or months out, vega can be the largest part of the P&L. Know which kind you hold.',
    'You can estimate vega for any model by repricing: price the option with IV half a point higher and half a point lower and take the difference. That gives the change for one point, centred on today\'s IV.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Buying options when IV is high before news, then blaming the market when the stock moves the right way and the option falls.',
        'Forgetting that sold options lose when IV rises.',
        'Dividing the IV change by 100 when vega is already per point.',
        'Treating vega as fixed: it shrinks as expiry approaches and as the option moves away from the money.',
      ],
    },
  ],

  'pricing-black-scholes': [
    { h: 'A formula for the price' },
    'In 1973 Fischer Black and Myron Scholes, with work by Robert Merton, published a formula for the fair price of a European option. A **European** option can only be exercised at expiry; an **American** one at any time. The formula, called **Black-Scholes**, turns the five inputs into a price, and every Greek in this module is one of its slopes.',

    { h: 'The normal distribution and N' },
    'The formula uses the **standard normal distribution**, the bell curve with centre 0 and spread 1. **N(x)** is the chance that a draw from it is below x. N(0) = 0.5, since half the bell is below its centre. N(1.645) ≈ 0.95. N(−x) = 1 − N(x), by symmetry.',
    'Python\'s standard library has no N, but it has `math.erf`, the error function, and N(x) = 0.5 × (1 + erf(x ÷ √2)).',
    {
      code: `import math

def N(x):
    return 0.5 * (1 + math.erf(x / math.sqrt(2)))

print(round(N(0), 2), round(N(1.645), 3), round(N(-1), 4))`,
      out: '0.5 0.95 0.1587',
    },

    { h: 'The formula' },
    'Time T is in years, r is the yearly interest rate as a decimal (continuously compounded), σ is the yearly volatility as a decimal and ln is the natural logarithm. First two helper numbers:',
    {
      list: [
        'd1 = (ln(S ÷ K) + (r + σ² ÷ 2) × T) ÷ (σ × √T)',
        'd2 = d1 − σ × √T',
      ],
    },
    'Then the prices:',
    {
      list: [
        'call = S × N(d1) − K × e^(−rT) × N(d2)',
        'put = K × e^(−rT) × N(−d2) − S × N(−d1)',
      ],
    },
    'K × e^(−rT) is the strike discounted to today: the money you would need now, earning r, to have K at expiry.',
    { sub: 'A worked example' },
    'Take S = 80, K = 75, six months (T = 0.5), r = 4% and σ = 30%. ln(80 ÷ 75) = 0.0645. σ²/2 = 0.045, so r + σ²/2 = 0.085, times 0.5 is 0.0425. σ√T = 0.30 × 0.7071 = 0.2121. So d1 = (0.0645 + 0.0425) ÷ 0.2121 = 0.5046 and d2 = 0.2925.',
    {
      code: `import math

def N(x):
    return 0.5 * (1 + math.erf(x / math.sqrt(2)))

S, K, T, r, vol = 80, 75, 0.5, 0.04, 0.30
d1 = (math.log(S / K) + (r + vol ** 2 / 2) * T) / (vol * math.sqrt(T))
d2 = d1 - vol * math.sqrt(T)
call = S * N(d1) - K * math.exp(-r * T) * N(d2)
put = K * math.exp(-r * T) * N(-d2) - S * N(-d1)
print(round(d1, 4), round(d2, 4), round(call, 2), round(put, 2))`,
      out: '0.5046 0.2925 10.23 3.75',
    },
    { sub: 'What the pieces mean' },
    'N(d1) is the call\'s delta: 0.69 here. N(d2) is the probability, inside the model, that the call finishes in the money: 0.62 here. That probability uses the model\'s "risk-neutral" assumptions, in which every asset is expected to grow at the interest rate, so it is not a forecast of the real-world chance. A typical bug is writing d2 = d1 + σ√T, which makes calls too cheap.',

    { h: 'What the model assumes' },
    {
      list: [
        'The stock moves in a continuous random walk with constant volatility: no jumps, no calm and stormy spells.',
        'The interest rate is constant and known.',
        'No dividends (extended versions handle them).',
        'Exercise only at expiry.',
        'You can trade any amount at any moment, with no costs or spreads.',
      ],
    },
    'None of these is true. Stocks gap on news, volatility changes from week to week, and options on the same stock trade at different implied volatilities depending on the strike. Traders still use the model, because it gives everyone a common way to turn a price into an implied volatility and a set of Greeks. Think of it as a translator, not an oracle.',

    { h: 'Put-call parity' },
    'Own one call and sell one put with the same strike K and expiry. At expiry, if the stock is above K you exercise the call and buy at K; if it is below K the put is exercised against you and you buy at K. Either way you end up buying the stock for K. That is the same as owning the stock today and owing K at expiry. Two positions with the same result must cost the same, so:',
    'C − P = S − K × e^(−rT)',
    'In the example, 10.23 − 3.75 = 6.48, and 80 − 75 × e^(−0.02) = 80 − 73.51 = 6.49 (the 0.01 gap is rounding). With rates near zero it simplifies to C − P = S − K, so at the money the call and the put cost the same.',
    { sub: 'Using parity in practice' },
    'Parity lets you check a chain and find one price from the other. It holds exactly for European options on an index without dividends, such as SPX. For American options on a share or ETF that pays dividends, such as SPY, it holds only roughly: an expected dividend lowers calls and raises puts, and early exercise adds a little value. A quote that seems to break parity is usually stale, wide or reflecting a dividend. Do not treat it as free money.',
  ],

  'pricing-estimate': [
    { h: 'Several things move at once' },
    'On a real day the stock moves, the clock runs and IV changes, all together. Each Greek prices one of those changes, so adding the Greek terms gives an estimate of the total change in the option price. With m the stock move in dollars, t the days that pass and ΔIV the change in IV in points:',
    'ΔP ≈ Δ × m + ½ × Γ × m² + θ × t + vega × ΔIV',
    'This is per share. Multiply by 100 and by the number of contracts, with short positions counted as negative, to get dollars.',

    { h: 'A worked example' },
    'A stock is at 80. You hold the 80 call with 45 days left, at an IV of 25%. The model gives delta 0.5175, gamma 0.0568, theta −0.0311 per day and vega 0.1120 per point. Over the next day the stock rises $1.50 and IV rises 2 points.',
    {
      list: [
        'Delta: 0.5175 × 1.5 = 0.7763',
        'Gamma: ½ × 0.0568 × 1.5² = 0.0639',
        'Theta: −0.0311 × 1 = −0.0311',
        'Vega: 0.1120 × 2 = 0.2240',
      ],
    },
    'The total is +1.033 per share, $103 per contract. Repricing the call from scratch with the stock at 81.50, 44 days left and IV at 27% gives +1.027. The estimate is within a cent.',
    {
      code: `delta, gamma, theta, vega = 0.5175, 0.0568, -0.0311, 0.1120
m, days, d_iv, contracts = 1.5, 1, 2, 2
per_share = delta * m + 0.5 * gamma * m ** 2 + theta * days + vega * d_iv
print(round(per_share, 3), round(per_share * 100 * contracts))`,
      out: '1.033 207',
    },

    { h: 'When the estimate breaks' },
    'The Greeks are slopes measured at today\'s price, time and IV. Over a small change they barely move, so the estimate is good. Over a large change they move too. On a big rise, delta of a call heads towards 1 and stops growing, so gamma falls and the ½Γm² term overstates the gain. Near expiry gamma and theta change by the hour. In those cases, price the option again with the new inputs instead of adding Greeks.',
    { sub: 'Estimate and quote do not match' },
    'Even a good estimate can differ from your screen. IV may have moved by more or less than you assumed. You may be comparing the mid-price at entry with the bid now: the spread is a real cost the Greeks do not see. Check those two before doubting the arithmetic.',

    { h: 'Position Greeks' },
    'For a position with several legs, each position Greek is a sum over the legs: Greek per share × 100 × contracts, with short legs negative. The result is in shares for delta, shares per dollar for gamma, dollars per day for theta and dollars per IV point for vega.',
    { sub: 'An example with a spread' },
    'You buy 3 of the 80 calls (delta 0.52, theta −0.031, vega 0.112) and sell 3 of the 85 calls (delta 0.26, theta −0.025, vega 0.091). Position delta: (0.52 − 0.26) × 300 = 78 shares. Position theta: (−0.031 + 0.025) × 300 = −$1.80 a day. Position vega: (0.112 − 0.091) × 300 = $6.30 a point. The short calls take away part of the exposure to direction and most of the exposure to time and IV. A short leg earns its decay, so its theta enters with the opposite sign; using the absolute number of contracts gets this wrong.',
    {
      code: `legs = [{"qty": 3, "theta": -0.031}, {"qty": -3, "theta": -0.025}]
print(round(sum(l["qty"] * l["theta"] * 100 for l in legs), 2))`,
      out: '-1.8',
    },

    { h: 'A what-if table before you trade' },
    'Before entering, lay out what the position does across a few scenarios: stock moves of −2, −1, 0, +1 and +2 dollars, IV unchanged and two points either way, one day of decay. Fill each cell from the Greeks, in dollars for your actual number of contracts, and reprice the extreme cells. Then compare the worst cell with the most you allow yourself to lose on one trade. If an ordinary day can cost more than that, the size is too large.',
    'The table shows something else too: which input your trade depends on. If most of the result comes from delta, it is a bet on direction. If theta dominates, you are paying or collecting time. If vega dominates, IV decides the outcome.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Using the Greek estimate for a large move instead of repricing.',
        'Forgetting the ½ or the square in the gamma term.',
        'Adding a short leg\'s theta as a cost rather than a credit.',
        'Planning at the mid-price and forgetting that you exit nearer the bid.',
      ],
    },
  ],

  'pricing-lab': [
    { h: 'What you are building' },
    'The lab builds an option calculator from nothing but Python\'s `math` module: the normal distribution, the Black-Scholes call and put, delta, gamma, theta and vega, and a function that compares the Greek estimate of a P&L with the result of full repricing. Each step is small and tested before the next one uses it.',
    'Building it yourself is the fastest way to understand what a trading platform shows you, and to catch the units mistakes that make numbers off by a factor of 100 or 365.',

    { h: 'Units used throughout' },
    {
      list: [
        '**T** in years: days ÷ 365.',
        '**r** and **vol** as decimals: 4% is 0.04, 25% is 0.25.',
        '**Theta** per calendar day: the yearly formula ÷ 365.',
        '**Vega** per IV point: the formula ÷ 100.',
      ],
    },

    { h: 'The pieces' },
    { sub: 'The normal distribution' },
    'N(x), the cumulative normal, is 0.5 × (1 + erf(x ÷ √2)). The bell curve itself, the density, is e^(−x²/2) ÷ √(2π), written pdf(x). Its peak, pdf(0), is about 0.3989, which is where the 0.4 in the at-the-money rules of thumb comes from.',
    {
      code: `import math

def norm_pdf(x):
    return math.exp(-x ** 2 / 2) / math.sqrt(2 * math.pi)

print(round(norm_pdf(0), 4), round(norm_pdf(1), 4))`,
      out: '0.3989 0.242',
    },
    { sub: 'd1, d2 and the prices' },
    'd1 = (ln(S/K) + (r + σ²/2)T) ÷ (σ√T) and d2 = d1 − σ√T. The call is S·N(d1) − K·e^(−rT)·N(d2); the put is K·e^(−rT)·N(−d2) − S·N(−d1). Put-call parity, C − P = S − K·e^(−rT), is a test of both that needs no reference values: it must hold at any stock price.',
    { sub: 'The Greeks of a call' },
    {
      list: [
        'Delta = N(d1).',
        'Gamma = pdf(d1) ÷ (S × σ × √T). The same for calls and puts.',
        'Theta per year = −S × pdf(d1) × σ ÷ (2√T) − r × K × e^(−rT) × N(d2). Divide by 365 for a day.',
        'Vega for a vol move of 1.00 = S × pdf(d1) × √T. Divide by 100 for one point. The same for calls and puts.',
      ],
    },
    'The first part of theta is the decay of time value; the second is the effect of the strike\'s discount shrinking as time passes. With r = 0 only the first part is left.',

    { h: 'Checking a formula by repricing' },
    'A formula Greek is a slope, so you can check it by moving one input a little and pricing again. For delta, price at S + h and S − h and divide the difference by 2h. For vega per point, price with vol half a point higher and half a point lower and take the difference. For theta, price with a little less and a little more time. If the formula and the bump agree to several decimal places at an awkward point (a stock not at the strike, a non-zero rate), the formula is right.',
    {
      code: `import math

def N(x):
    return 0.5 * (1 + math.erf(x / math.sqrt(2)))

def call(S, K, T, r, vol):
    d1 = (math.log(S / K) + (r + vol ** 2 / 2) * T) / (vol * math.sqrt(T))
    return S * N(d1) - K * math.exp(-r * T) * N(d1 - vol * math.sqrt(T))

h = 0.01
bump = (call(80 + h, 80, 45 / 365, 0, 0.25) - call(80 - h, 80, 45 / 365, 0, 0.25)) / (2 * h)
print(round(bump, 4))`,
      out: '0.5175',
    },
    'The bump gives 0.5175, the same as N(d1) for this option.',

    { h: 'Estimate against truth' },
    'The last step adds the Greek terms for a scenario and compares them with repricing at the new stock price, the new time (days left minus days passed, in years) and the new vol (vol plus the change in points ÷ 100). For the 80 call with 45 days left, a $1.50 rise over a day with IV up 2 points gives an estimate of 1.033 and a repriced change of 1.027. For a $10 move the two part by much more, because gamma is not constant over that range.',
    { sub: 'Why this matters on a trading day' },
    'The Greeks on a broker\'s screen come from a calculation like this one, usually with a smarter model for American exercise and dividends. Knowing how they are built tells you when to trust them (small moves, short horizons) and when to reprice (big moves, the last days before expiry).',

    { h: 'Bugs to watch for' },
    {
      list: [
        'T in days instead of years: prices about 19 times too large.',
        'd2 = d1 + σ√T instead of minus: calls too cheap.',
        'Vega not divided by 100: IV moves look a hundred times too costly.',
        'Theta not divided by 365: a day looks like a year of decay.',
        'Using the new vol as vol + points instead of vol + points ÷ 100.',
      ],
    },
  ],
}
