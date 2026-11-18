import type { Module } from '../types'

const BS = `import math

def N(x):
    return 0.5 * (1 + math.erf(x / math.sqrt(2)))

def bs_call(S, K, days, vol, r=0.0):
    if days <= 0:
        return max(S - K, 0.0)
    T = days / 365
    d1 = (math.log(S / K) + (r + vol ** 2 / 2) * T) / (vol * math.sqrt(T))
    d2 = d1 - vol * math.sqrt(T)
    return S * N(d1) - K * math.exp(-r * T) * N(d2)`

const LAB_CORE = `import math

def norm_cdf(x):
    return 0.5 * (1 + math.erf(x / math.sqrt(2)))

def norm_pdf(x):
    return math.exp(-x ** 2 / 2) / math.sqrt(2 * math.pi)

def d1_d2(S, K, T, r, vol):
    d1 = (math.log(S / K) + (r + vol ** 2 / 2) * T) / (vol * math.sqrt(T))
    return d1, d1 - vol * math.sqrt(T)

def bs_call(S, K, T, r, vol):
    d1, d2 = d1_d2(S, K, T, r, vol)
    return S * norm_cdf(d1) - K * math.exp(-r * T) * norm_cdf(d2)`

export const pricing: Module = {
  id: 'pricing',
  title: 'What an option is worth before expiry: the Greeks',
  summary: 'The five inputs that set an option price, how much each one moves it, and how to add the Greeks up into a P&L estimate before you trade.',
  lessons: [
    {
      id: 'pricing-drivers',
      title: 'What drives the price',
      summary: 'Stock price, strike, time, volatility and rates, and extrinsic value as the price of uncertainty.',
      widget: 'pricing-value',
      text: [
        'At expiry an option is worth its **intrinsic value** and nothing more (the options module). Before expiry it trades above that. The extra is **extrinsic value**: what buyers pay for the chance that the stock moves further their way before expiry. A bought option can lose at most its premium but can gain a lot, so uncertainty works in the holder\'s favour and the seller charges for it.',
        'Five inputs set the price: the **stock price** S, the **strike** K, the **time** to expiry T, the **volatility** σ (how much the stock tends to move, per year) and the **interest rate** r (and dividends, if any). Four can be looked up. Volatility cannot: the market\'s figure for it is called implied volatility, the subject of the next module.',
        'Directions, all else equal. A call is worth more when S rises, K is lower, T is longer, σ is higher, and a little more when r is higher. A put is worth more when S falls, K is higher, T is longer (almost always) and σ is higher, and a little less when r is higher. More time and more volatility both mean more chances for a big move, so both raise calls and puts alike.',
        'Extrinsic value is largest at the money and shrinks as you go deeper in or further out. A useful rule of thumb for an at-the-money option: **price ≈ 0.4 × S × σ × √T**, with T in years. Doubling volatility doubles it; it takes four times the time to double it.',
        'Each sensitivity has a Greek name: **delta** for the stock price, **gamma** for how delta changes, **theta** for time, **vega** for volatility and **rho** for rates. Rho barely matters for the short-dated options a day trader uses, so this module spends its time on the other four.',
      ],
      rules: [
        'Option price = intrinsic + extrinsic. An out-of-the-money option is all extrinsic.',
        'More time and more volatility raise both calls and puts.',
        'Extrinsic value peaks at the money and is zero at expiry.',
        'At the money: price ≈ 0.4 × S × σ × √T, with T in years.',
        'Volatility is the one input you cannot look up.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'pricing-drivers-1',
          ask: 'The stock is at 102. The 100 call costs 4.50. How much of that is extrinsic value, in dollars per share?',
          answer: 2.5,
          check: '4.50 - max(102 - 100, 0)',
          why: 'Intrinsic is 102 − 100 = 2. The other 2.50 is extrinsic: the price of the chance of a bigger move before expiry. It will be gone by expiry whatever happens.',
        },
        {
          kind: 'number',
          id: 'pricing-drivers-2',
          ask: 'The stock is at 97. The 100 put costs 4.10. What is its extrinsic value, in dollars per share?',
          answer: 1.1,
          check: '4.10 - max(100 - 97, 0)',
          why: 'A put\'s intrinsic value is K − S = 3 when positive. The rest, 1.10, is extrinsic.',
        },
        {
          kind: 'number',
          id: 'pricing-drivers-3',
          ask: 'The stock is at 100 and the 110 call costs 0.80. How many dollars per contract of that price is extrinsic value?',
          answer: 80,
          check: '(0.80 - max(100 - 110, 0)) * 100',
          why: 'Out of the money there is no intrinsic value, so all of the 0.80 is extrinsic: 80 dollars per contract that will go to zero at expiry unless the stock gets above 110.',
        },
        {
          kind: 'choice',
          id: 'pricing-drivers-4',
          ask: 'Which of the five inputs to an option price can you not look up on a screen before you trade?',
          options: ['The strike', 'The time to expiry', 'The volatility the stock will have until expiry', 'The interest rate'],
          answer: 2,
          why: 'Strike, expiry, stock price and rates are known. Future volatility is not, so the market agrees on a figure through the option price itself: the implied volatility.',
        },
        {
          kind: 'number',
          id: 'pricing-drivers-5',
          ask: 'Use the rule of thumb for an at-the-money option: the stock is at 400, volatility is 20% a year and there are 3 months (0.25 years) to expiry. Roughly what is the call worth, in dollars per share?',
          answer: 16,
          tol: 0.3,
          check: '0.4 * 400 * 0.20 * math.sqrt(0.25)',
          hint: '0.4 × S × σ × √T.',
          why: '0.4 × 400 × 0.20 × 0.5 = 16. The full Black-Scholes value with no rates is 15.95, so the rule is close enough to sanity-check a quote in your head.',
        },
        {
          kind: 'choice',
          id: 'pricing-drivers-6',
          ask: 'An at-the-money call with 30 days left is worth 2.29 at a volatility of 20%. Nothing else changes, but volatility goes to 40%. Roughly what is it worth now?',
          options: ['About 2.29: volatility does not change the value of a call', 'About 3.24', 'About 4.57', 'About 9.16'],
          answer: 2,
          why: 'At the money the price is close to proportional to σ, so doubling σ about doubles it: Black-Scholes gives 4.57. Quadrupling (9.16) would need four times the volatility.',
        },
        {
          kind: 'choice',
          id: 'pricing-drivers-7',
          ask: 'An at-the-money option has 120 days left. How much time must pass, with the stock and volatility unchanged, before it is worth about half as much?',
          options: ['60 days, when half the time is gone', '90 days, leaving 30', '119 days', 'It loses value in a straight line, so 60 days'],
          answer: 1,
          why: 'Value goes with √T. Half the value means a quarter of the time left: √(30/120) = 0.5. So the first 90 days take half the value and the last 30 days take the other half.',
        },
        {
          kind: 'choice',
          id: 'pricing-drivers-8',
          ask: 'In the figure, keep volatility at 20% and slide the days to expiry from 30 down to 1. What happens to the curve?',
          options: [
            'It moves up, because the option is closer to paying out',
            'It sinks onto the dashed hockey stick, with only a little extrinsic value left close to the strike',
            'It stays the same; only volatility moves it',
            'It sinks evenly at every stock price',
          ],
          answer: 1,
          why: 'With one day left there is little time for a big move, so the option is worth almost exactly its intrinsic value except near the strike, where it is still a coin flip. At 100 the value falls from 2.29 to 0.42.',
        },
        {
          kind: 'choice',
          id: 'pricing-drivers-9',
          ask: 'The stock is at 100. Same expiry, three calls: the 90, the 100 and the 110 strike. Which has the most extrinsic value?',
          options: ['The 90 call, because it costs the most', 'The 100 call', 'The 110 call, because it is all extrinsic', 'All three have the same'],
          answer: 1,
          why: 'Extrinsic value is largest at the money, where the outcome is most uncertain. The 90 call costs more, but most of its price is intrinsic; the 110 call is all extrinsic but there is little of it.',
        },
        {
          kind: 'output',
          id: 'pricing-drivers-10',
          ask: 'Splitting call prices into extrinsic value. What does this print?',
          code: `S = 50
chain = {45: 5.60, 50: 1.90, 55: 0.40}
for K, price in chain.items():
    intrinsic = max(S - K, 0)
    print(K, round(price - intrinsic, 2))`,
          answer: '45 0.6\n50 1.9\n55 0.4',
          why: 'The 45 call has 5 of intrinsic, leaving 0.60. The 50 and 55 calls have none, so their whole price is extrinsic. The at-the-money strike carries the most.',
        },
        {
          kind: 'bug',
          id: 'pricing-drivers-11',
          ask: 'This should return the extrinsic value of a call or a put. Puts come out wrong.',
          code: `def extrinsic(price, S, K, kind):
    if kind == 'call':
        intrinsic = max(S - K, 0)
    else:
        intrinsic = max(S - K, 0)
    return price - intrinsic`,
          line: 5,
          fix: '        intrinsic = max(K - S, 0)',
          why: 'A put is the right to sell at K, so it is worth K − S when the stock is below the strike. With the call formula an in-the-money put shows no intrinsic value and looks far more expensive than it is.',
        },
        {
          kind: 'choice',
          id: 'pricing-drivers-12',
          ask: 'You trade options that expire today or this week. Which of the five inputs changes their price the least from one day to the next?',
          options: ['The stock price', 'Volatility', 'Time', 'The interest rate'],
          answer: 3,
          why: 'A one-point change in rates moves a 2-day at-the-money option on a 100 stock by well under a cent. The stock price, time and volatility all move it far more. Rates matter for options a year or more out.',
        },
        {
          kind: 'design',
          id: 'pricing-drivers-13',
          ask: 'A friend says a call is "cheap" because it costs only 0.20. Write down what you would check before agreeing that any option is cheap.',
          checklist: [
            { point: 'How much of the price is intrinsic and how much extrinsic', why: 'A low price out of the money is all extrinsic and goes to zero at expiry unless the stock moves past the strike.' },
            { point: 'How far the stock must move to reach the strike plus the premium, and in how long', why: 'A cheap option is usually cheap because that move is unlikely in the time left.' },
            { point: 'The volatility implied by the price, against the stock\'s usual movement', why: 'Cheap or dear is a statement about volatility, not about the dollar price.' },
            { point: 'The bid-ask spread as a share of the price', why: 'A 0.05 spread on a 0.20 option costs a quarter of its value to get in and out.' },
            { point: 'That the whole premium can be lost', why: 'A low price per contract does not make the trade low risk: the chance of losing all of it is high.' },
            { point: 'How many contracts the low price tempts you into', why: 'Buying many cheap contracts can put more of the account at risk than one dearer one.' },
          ],
          why: 'A price on its own says nothing about value. What matters is what the price implies about the stock\'s movement and how likely the option is to be worth anything at expiry.',
        },
      ],
    },
    {
      id: 'pricing-delta',
      title: 'Delta',
      summary: 'Change per $1 of stock, the number of shares an option acts like, a rough probability, and the delta of puts.',
      text: [
        '**Delta** is how much the option price changes when the stock rises $1, with nothing else changing. A call\'s delta is between 0 and 1; a put\'s is between −1 and 0. It is quoted per share, so a contract (100 shares) with delta 0.40 gains about $40 for a $1 rise.',
        'At the money delta is about 0.50. Deep in the money it moves towards 1: the option moves almost dollar for dollar with the stock. Far out of the money it is near 0: the option barely reacts. As expiry nears, deltas spread apart towards 0 or 1.',
        'Delta is also a **hedge ratio**: the number of shares the option behaves like. Ten calls at delta 0.55 act like 550 shares, and shorting 550 shares would leave you roughly flat on direction. Add up every leg as delta × 100 × contracts, with short positions negative, and you get the **position delta**: your exposure in shares.',
        'As a rule of thumb, delta is roughly the chance that the option finishes in the money: a 0.20-delta call has about a 1 in 5 chance. This is a model figure based on the market\'s prices, not a forecast, and for calls it slightly overstates the model\'s own probability.',
        'For a call and a put with the same strike and expiry (no dividends, rates near zero), **put delta = call delta − 1**. If the call is 0.30, the put is −0.70. Delta is not fixed: it changes as the stock moves (that is gamma, next lesson), as time passes and as volatility changes.',
      ],
      rules: [
        'Delta: option change for a $1 stock move. Calls 0 to 1, puts −1 to 0.',
        'Per contract, multiply by 100. Short positions flip the sign.',
        'Position delta = Σ delta × 100 × contracts: your exposure in shares.',
        'Delta ≈ chance of finishing in the money, as a rough guide only.',
        'Same strike and expiry: put delta ≈ call delta − 1.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'pricing-delta-1',
          ask: 'A call has delta 0.60. The stock rises $1.50 in a few minutes. Roughly how much does the call price change, in dollars per share?',
          answer: 0.9,
          check: '0.60 * 1.50',
          why: '0.60 × 1.50 = 0.90 per share. Over a few minutes time and volatility barely change, so delta tells most of the story for a small move.',
        },
        {
          kind: 'number',
          id: 'pricing-delta-2',
          ask: 'Same call (delta 0.60), same $1.50 rise, and you hold 3 contracts. Roughly what is your P&L in dollars?',
          answer: 270,
          check: '0.60 * 1.50 * 100 * 3',
          why: '0.90 per share × 100 shares × 3 contracts = $270. Forgetting the 100 multiplier is the most common error when sizing option trades.',
        },
        {
          kind: 'number',
          id: 'pricing-delta-3',
          ask: 'A put has delta −0.35. The stock falls $2. Roughly how much does the put price change, in dollars per share (positive for a gain in value)?',
          answer: 0.7,
          check: '-0.35 * -2',
          why: 'Delta × move = −0.35 × −2 = +0.70. A negative delta means the put gains when the stock falls.',
        },
        {
          kind: 'number',
          id: 'pricing-delta-4',
          ask: 'You are long 5 calls with delta 0.40 and short 2 puts with delta −0.30. What is your position delta, in shares?',
          answer: 260,
          check: '0.40 * 100 * 5 + (-0.30) * 100 * (-2)',
          why: 'The calls give 0.40 × 100 × 5 = 200. Short puts flip the sign: −0.30 × 100 × −2 = +60. Selling a put is a bullish position, so the two add up to the exposure of 260 shares.',
        },
        {
          kind: 'number',
          id: 'pricing-delta-5',
          ask: 'You hold 10 calls with delta 0.55. How many shares would you short to make the position roughly flat on direction?',
          answer: 550,
          check: '0.55 * 100 * 10',
          why: 'The calls act like 0.55 × 100 × 10 = 550 shares. Short 550 shares and a small move nets to about zero. The hedge does not stay right: as the stock moves, delta changes and so must the share count.',
        },
        {
          kind: 'number',
          id: 'pricing-delta-6',
          ask: 'The 50 call on a stock that pays no dividend has delta 0.65. Roughly what is the delta of the 50 put with the same expiry? Give a negative number.',
          answer: -0.35,
          check: '0.65 - 1',
          why: 'Put delta ≈ call delta − 1 = −0.35. Long a call and short a put at the same strike behaves like 100 shares, delta 1, which is where the rule comes from.',
        },
        {
          kind: 'choice',
          id: 'pricing-delta-7',
          ask: 'A call has delta 0.20. Which statement is fair?',
          options: [
            'It will finish in the money 20% of the time, guaranteed by the model',
            'As a rough guide the market prices it near a 1 in 5 chance of finishing in the money; real odds can differ',
            'It gains 20% for each $1 the stock rises',
            'It is a bad trade because the odds are below 50%',
          ],
          answer: 1,
          why: 'Delta is a model sensitivity that happens to sit close to the model\'s probability of finishing in the money. It is not a forecast. It also says nothing on its own about whether the trade is good: that depends on the price paid against the payoff.',
        },
        {
          kind: 'choice',
          id: 'pricing-delta-8',
          ask: 'The stock is at 100. The 95 call (delta 0.82) costs 5.57 and the 105 call (delta 0.21) costs 0.64, same expiry. The stock jumps $1 right after you buy. Which is true?',
          options: [
            'The 105 call gains more dollars per contract because it is cheaper',
            'The 95 call gains more dollars (about 82 against 21 per contract) while the 105 call gains a larger percentage of its price',
            'Both gain the same, since the stock moved the same',
            'The 95 call gains the larger percentage too',
          ],
          answer: 1,
          why: 'Dollars follow delta: 0.82 against 0.21 per share. Percentages follow delta ÷ price: about 15% against about 33%. A cheap out-of-the-money call is a leveraged bet that also loses its value faster when the move does not come.',
        },
        {
          kind: 'choice',
          id: 'pricing-delta-9',
          ask: 'The stock sits at 100 for three weeks. What happens to the delta of a 105 call over that time?',
          options: ['It rises towards 0.50', 'It stays the same, because the stock did not move', 'It falls towards 0', 'It turns negative'],
          answer: 2,
          why: 'With less time left, a move to 105 becomes less likely and the call reacts less to the stock. At 20% volatility its delta falls from about 0.21 with 30 days left to about 0.04 with 7 days left.',
        },
        {
          kind: 'output',
          id: 'pricing-delta-10',
          ask: 'Each leg is (kind, delta per share, contracts), with negative contracts for short. What does this print?',
          code: `positions = [("call", 0.45, 4), ("put", -0.30, -2), ("call", 0.80, -1)]
total = 0
for kind, delta, qty in positions:
    total += delta * qty * 100
print(round(total))`,
          answer: '160',
          why: '0.45 × 4 × 100 = 180. The short puts add −0.30 × −2 × 100 = 60. The short call takes away 80. 180 + 60 − 80 = 160 shares of exposure.',
        },
        {
          kind: 'bug',
          id: 'pricing-delta-11',
          ask: 'This should return the position delta in shares. It reports a large long delta for a book that is mostly short calls.',
          code: `def position_delta(legs):
    # legs: list of (delta_per_share, contracts); contracts < 0 means short
    total = 0
    for delta, contracts in legs:
        total += delta * abs(contracts) * 100
    return total`,
          line: 5,
          fix: '        total += delta * contracts * 100',
          why: '`abs` throws the sign of the position away, so a short call counts as long. Short exposure must come out with the opposite sign or the hedge is placed the wrong way.',
        },
        {
          kind: 'design',
          id: 'pricing-delta-12',
          ask: 'You hold 10 calls with delta 0.50 and want to be roughly flat on direction over lunch without closing them. Plan the hedge and say what can go wrong.',
          checklist: [
            { point: 'Short about 500 shares (0.50 × 100 × 10)', why: 'Position delta is the share count the hedge must offset.' },
            { point: 'The hedge drifts as the stock moves, because delta changes', why: 'If the stock rises, the calls\' delta grows and 500 shares no longer cover it. That is gamma.' },
            { point: 'A rule for when to adjust, for example when position delta passes ±100 shares', why: 'Adjusting on every tick costs spread and fees; never adjusting leaves you exposed.' },
            { point: 'Theta keeps running while you are hedged', why: 'You pay time decay on the calls even though the direction is neutralised.' },
            { point: 'Shorting needs a margin account and borrowable shares, and adds costs', why: 'The hedge has its own requirements and fees.' },
            { point: 'Compare with closing or reducing the calls', why: 'Selling some calls may be cheaper and simpler than running a share hedge.' },
          ],
          why: 'Delta says how many shares to hedge with today. It does not say how many you will need after the next move, which is why hedges need rules for adjustment and why they are never free.',
        },
      ],
    },
    {
      id: 'pricing-gamma',
      title: 'Gamma',
      summary: 'How delta changes as the stock moves, and why at-the-money options near expiry are explosive.',
      widget: 'pricing-delta',
      text: [
        '**Gamma** is how much delta changes when the stock rises $1. A delta-0.50 call with gamma 0.08 has delta 0.58 after a $1 rise and 0.42 after a $1 fall. Gamma is positive for every bought option, call or put, and negative for every sold one.',
        'Because delta grows as the move goes your way, a long option gains more on a move in its favour than delta alone says, and loses less on a move against it. The estimate per share for a move m is **Δ·m + ½·Γ·m²**. The ½Γm² term is positive either way: that is what being long gamma means. Short options have it the other way round: losses grow faster than gains.',
        'Gamma is largest at the money, and it rises sharply as expiry nears. With volatility at 20% a 100 strike at the money has gamma about 0.07 with 30 days left and about 0.38 with one day left. For an at-the-money option, gamma grows roughly with 1 ÷ √T: a sixteenth of the time left means four times the gamma.',
        'Near expiry this turns an at-the-money option into a switch. A $1 move can take delta from 0.30 to 0.70, so a cheap option can double or vanish within minutes. For a seller of such an option, the loss per dollar of move grows with every dollar: this is why selling options close to expiry is far more dangerous than the small premium suggests.',
        'Gamma has a price. Long options with high gamma also have high time decay (theta, next lesson). Buying gamma means paying every day for the chance of a move; selling it means collecting that payment while carrying the risk of the move.',
      ],
      rules: [
        'Gamma: change in delta per $1 of stock. Long options +, short options −.',
        'New delta ≈ old delta + Γ × move.',
        'P&L per share ≈ Δ·m + ½·Γ·m².',
        'Gamma peaks at the money and rises fast as expiry nears (roughly 1 ÷ √T).',
        'High gamma comes with high theta: you pay for it daily.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'pricing-gamma-1',
          ask: 'A call has delta 0.50 and gamma 0.08. The stock rises $2. Roughly what is its new delta?',
          answer: 0.66,
          check: '0.50 + 0.08 * 2',
          why: '0.50 + 0.08 × 2 = 0.66. Each dollar adds 0.08 of delta. Over large moves gamma itself changes, so this is an approximation.',
        },
        {
          kind: 'number',
          id: 'pricing-gamma-2',
          ask: 'Same call (delta 0.50, gamma 0.08), stock up $2, nothing else changes. Using delta and gamma, about how much does the option gain, in dollars per share?',
          answer: 1.16,
          check: '0.50 * 2 + 0.5 * 0.08 * 2 ** 2',
          hint: 'Δ·m + ½·Γ·m².',
          why: 'Delta gives 1.00. Gamma adds ½ × 0.08 × 4 = 0.16 because delta was rising during the move. Delta alone would understate the gain.',
        },
        {
          kind: 'number',
          id: 'pricing-gamma-3',
          ask: 'Same call, but the stock falls $2. About how much does it change, in dollars per share (negative for a loss)?',
          answer: -0.84,
          check: '0.50 * -2 + 0.5 * 0.08 * (-2) ** 2',
          why: '−1.00 + 0.16 = −0.84. The gamma term is positive in both directions, so a long option gains more going up than it loses going down by the same amount. Theta is what you pay for that.',
        },
        {
          kind: 'choice',
          id: 'pricing-gamma-4',
          ask: 'You sold one call. The stock starts rising. What does gamma do to your position?',
          options: [
            'Your delta becomes more negative with every dollar, so each dollar costs more than the last',
            'Nothing: gamma only matters to buyers',
            'Your losses slow down as the call goes in the money',
            'Your delta becomes positive',
          ],
          answer: 0,
          why: 'A short call has negative delta and negative gamma. As the stock rises the call\'s delta grows, so your short delta grows too and losses accelerate. A naked short call has no cap on that loss.',
        },
        {
          kind: 'choice',
          id: 'pricing-gamma-5',
          ask: 'In the figure, keep volatility at 20% and the stock at 100. Slide the days to expiry from 30 down to 1. What happens?',
          options: [
            'The delta curve flattens and gamma falls',
            'The delta curve becomes a steep step at the strike, and gamma rises from about 0.07 to about 0.38',
            'Delta at the strike moves from 0.50 to 1',
            'Nothing changes, since the stock did not move',
          ],
          answer: 1,
          why: 'Delta at the strike stays near 0.50, but its slope, gamma, jumps more than fivefold. With one day left the option switches from near-zero to near-one delta within a couple of dollars.',
        },
        {
          kind: 'number',
          id: 'pricing-gamma-6',
          ask: 'An at-the-money option has gamma 0.05 with 16 days left. The stock and volatility stay the same. Roughly what is its gamma with 1 day left?',
          answer: 0.2,
          check: '0.05 * math.sqrt(16 / 1)',
          hint: 'At the money, gamma grows like 1 ÷ √T.',
          why: 'Time is 16 times shorter, so gamma is about √16 = 4 times larger: 0.20. This is why the last days of an option\'s life feel so different from the first weeks.',
        },
        {
          kind: 'choice',
          id: 'pricing-gamma-7',
          ask: 'The stock is at 100 and volatility is 20%. Which option has the most gamma?',
          options: ['The 100 call with 30 days left', 'The 100 call with 1 day left', 'The 105 call with 1 day left', 'The 90 call with 30 days left'],
          answer: 1,
          why: 'Gamma peaks at the money and near expiry: about 0.38 here. The 105 call with one day left is so far out of the money for that time that its gamma is close to zero; the deep in-the-money 90 call already has a delta near 1 with little room to change.',
        },
        {
          kind: 'output',
          id: 'pricing-gamma-8',
          ask: 'The delta-and-gamma estimate for a move up and a move down. What does this print?',
          code: `def pnl(delta, gamma, move):
    return delta * move + 0.5 * gamma * move ** 2

print(round(pnl(0.5, 0.1, 3), 2), round(pnl(0.5, 0.1, -3), 2))`,
          answer: '1.95 -1.05',
          why: '1.5 + 0.45 = 1.95 up, and −1.5 + 0.45 = −1.05 down. The same gamma term helps in both directions. That curve is called convexity.',
        },
        {
          kind: 'bug',
          id: 'pricing-gamma-9',
          ask: 'This should estimate the change in an option price from delta and gamma. It is wrong for every move other than +1.',
          code: `def pnl_estimate(delta, gamma, move):
    first = delta * move
    second = gamma * move
    return first + second`,
          line: 3,
          fix: '    second = 0.5 * gamma * move ** 2',
          why: 'The gamma term is ½·Γ·m². Written as Γ·m it is negative on down moves and grows with the move rather than its square, which hides the asymmetry of options.',
        },
        {
          kind: 'number',
          id: 'pricing-gamma-10',
          ask: 'You are short 10 at-the-money calls expiring today, each with gamma 0.30. The stock rises $1. By how many shares does your position delta change? Give a negative number if it falls.',
          answer: -300,
          check: '-10 * 0.30 * 100 * 1',
          why: 'Position gamma is −10 × 0.30 × 100 = −300 shares per dollar. One dollar up and you are 300 shares shorter than before. Two dollars and it is about 600: this is how a small short position turns large in an afternoon.',
        },
        {
          kind: 'write',
          id: 'pricing-gamma-11',
          ask: 'Estimate delta and gamma from any pricing function by moving the stock a little up and down: delta = (f(S+h) − f(S−h)) ÷ 2h and gamma = (f(S+h) − 2f(S) + f(S−h)) ÷ h².',
          starter: `def delta_gamma(price, S, h=0.01):
    # price: a function of the stock price
    # returns (delta, gamma)
    pass`,
          solution: `def delta_gamma(price, S, h=0.01):
    up, mid, down = price(S + h), price(S), price(S - h)
    return (up - down) / (2 * h), (up - 2 * mid + down) / h ** 2`,
          tests: `out = delta_gamma(lambda s: s, 100)
assert out is not None, "the function returns nothing yet"
d, g = out
assert abs(d - 1) < 1e-6 and abs(g) < 1e-4, f"for shares, delta is 1 and gamma 0, got {d} and {g}"
d, g = delta_gamma(lambda s: s ** 2 / 2, 3)
assert abs(d - 3) < 1e-6, f"for s²/2 at 3, delta should be 3, got {d}"
assert abs(g - 1) < 1e-4, f"for s²/2, gamma should be 1, got {g}: is it divided by h squared?"
${BS}
d, g = delta_gamma(lambda s: bs_call(s, 100, 30, 0.2), 100)
assert abs(d - 0.5114) < 1e-3, f"the 30-day at-the-money call at 20% has delta 0.5114, got {d}"
assert abs(g - 0.0695) < 1e-3, f"and gamma 0.0695, got {g}"`,
          hint: 'Price the option three times: at S + h, S and S − h.',
          why: 'Two repricings give the slope (delta) and three give the curvature (gamma). This works for any model, which makes it a good check on formula Greeks.',
        },
        {
          kind: 'design',
          id: 'pricing-gamma-12',
          ask: 'Explain to a friend why selling an at-the-money call that expires today for 0.40 is not free money, even though it "usually expires worthless".',
          checklist: [
            { point: 'Gamma is at its highest: a small move swings delta from near 0 to near 1', why: 'Losses accelerate with every dollar the stock moves through the strike.' },
            { point: 'A naked short call has no cap on its loss', why: 'One sharp move can cost many times the 0.40 collected.' },
            { point: 'The 0.40 is the market\'s price for that risk, not a gift', why: 'Over many trades, sellers are paid roughly what the risk is worth before costs.' },
            { point: 'Many small wins and a few large losses can add up to a net loss', why: 'A high win rate says nothing about the average result.' },
            { point: 'A defined-risk structure (buying a further call) caps the loss', why: 'It turns an open-ended risk into a known maximum (the strategies module).' },
            { point: 'Position size and a stop decided in advance', why: 'With negative gamma there is little time to decide once the move starts.' },
          ],
          why: 'Short gamma near expiry collects small, steady payments and carries the risk of a fast, large loss. The premium looks small because it is priced against that risk, not because the risk is small.',
        },
      ],
    },
    {
      id: 'pricing-theta',
      title: 'Theta',
      summary: 'Time decay: why it speeds up near expiry, and what one day costs.',
      widget: 'pricing-decay',
      text: [
        '**Theta** is how much the option price changes when one day passes and nothing else changes. Most platforms quote it per calendar day (some per trading day: check yours). A bought option usually has negative theta; a sold one has positive theta. A call with theta −0.05 loses about 5 cents per share, $5 per contract, per day.',
        'Decay is not a straight line. An at-the-money option is worth about 0.4 × S × σ × √T, so its value falls with the square root of the time left: half its value goes in the last quarter of its life. Its theta grows roughly like 1 ÷ √T. With volatility at 20%, a 100 strike at the money loses about 0.04 a day with 30 days left, 0.08 a day with 7 days left and 0.21 on the last day.',
        'Out-of-the-money options lose fewer dollars a day, but a bigger share of their price, and most of their value is gone well before the last week. An option that expires today loses all its remaining extrinsic value by the close, and in the last hours that loss is fast.',
        'Calendar theta counts weekends and holidays. How much of the weekend\'s decay is already in Friday\'s prices is set by the market, not by a formula, so do not expect a free gain from selling on Friday and buying back on Monday.',
        'Theta is the price of gamma. A long option pays theta every day for the chance that a move pays more. Setting the gamma gain equal to the theta cost gives the **break-even move** for one day: ½·Γ·m² = |θ|, so m = √(2|θ| ÷ Γ). If the stock usually moves less than that in a day, the option loses on most days.',
      ],
      rules: [
        'Theta: change in price per day with nothing else changing. Long options pay it, short options earn it.',
        'At the money, value falls with √T: half of it goes in the last quarter of the life.',
        'Theta speeds up near expiry, roughly as 1 ÷ √T.',
        'Break-even daily move for a long option: √(2|θ| ÷ Γ).',
        'Know whether your platform quotes theta per calendar day or per trading day.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'pricing-theta-1',
          ask: 'You hold 4 calls with theta −0.05. The stock and volatility do not change for 3 days. Roughly how much have you lost, in dollars?',
          answer: -60,
          check: '-0.05 * 3 * 100 * 4',
          why: '−0.05 × 3 days × 100 × 4 = −$60. Over a few days theta is close to constant; over weeks it grows, so a longer estimate needs repricing.',
        },
        {
          kind: 'number',
          id: 'pricing-theta-2',
          ask: 'An at-the-money option is worth 1.60 with 16 days left. The stock and volatility stay the same. Roughly what is it worth with 4 days left?',
          answer: 0.8,
          check: '1.60 * math.sqrt(4 / 16)',
          hint: 'Value goes with √T.',
          why: 'A quarter of the time left gives √(1/4) = half the value: 0.80. Twelve days took half the value, and the last four will take the other half.',
        },
        {
          kind: 'choice',
          id: 'pricing-theta-3',
          ask: 'You buy a call and the stock does not move for two days. Volatility stays the same. What happened to your P&L?',
          options: [
            'Nothing: no move, no change',
            'It fell by roughly two days of theta, plus the spread you paid to enter',
            'It rose, because the option is closer to expiry',
            'It fell by the whole extrinsic value',
          ],
          answer: 1,
          why: 'A flat stock is not neutral for a bought option. Two days of decay come off the price, and marking to the bid also costs the half spread you crossed to buy.',
        },
        {
          kind: 'number',
          id: 'pricing-theta-4',
          ask: 'A long option has theta −0.08 and gamma 0.14. How large a stock move in a day, in dollars, does the gamma gain need to cover one day of theta? Give two decimals.',
          answer: 1.07,
          tol: 0.01,
          check: 'math.sqrt(2 * 0.08 / 0.14)',
          hint: 'Set ½·Γ·m² equal to |θ| and solve for m.',
          why: 'm = √(2 × 0.08 ÷ 0.14) ≈ 1.07. Moves smaller than that, in either direction, leave the option behind on the day. This ignores changes in volatility.',
        },
        {
          kind: 'choice',
          id: 'pricing-theta-5',
          ask: 'In the figure, set the OTM strike to +5 and volatility to 20%. Compare the two calls at 30 days left and at 7 days left. What do you see?',
          options: [
            'Both have lost about half their value',
            'The 100 call has lost about half (2.29 to 1.10); the 105 call has lost over 90% (0.64 to 0.04)',
            'The 105 call has kept more of its value because it is cheaper',
            'Neither has lost much yet: decay happens on the last day',
          ],
          answer: 1,
          why: 'At the money, decay is slow and then fast at the end. Out of the money, the chance of reaching the strike shrinks as time runs out, so the option loses most of its value earlier. A cheap out-of-the-money option held for a week while the stock stays still is close to a total loss.',
        },
        {
          kind: 'output',
          id: 'pricing-theta-6',
          ask: 'The rule of thumb for an at-the-money call as time runs out. What does this print?',
          code: `import math

S, vol = 100, 0.20
for days in [64, 16, 4, 1]:
    print(days, round(0.4 * S * vol * math.sqrt(days / 365), 2))`,
          answer: '64 3.35\n16 1.67\n4 0.84\n1 0.42',
          why: 'Each step divides the time left by 4 and halves the value. The decay in dollars per day is far larger at the end: 1.68 over 48 days, then 0.83 over 12, then 0.42 over 3.',
        },
        {
          kind: 'bug',
          id: 'pricing-theta-7',
          ask: 'This should give the rough at-the-money price for a number of days left. It gives values about 19 times too large.',
          code: `import math

def atm_price(S, vol, days):
    T = days / 365
    return 0.4 * S * vol * math.sqrt(days)`,
          line: 5,
          fix: '    return 0.4 * S * vol * math.sqrt(T)',
          why: 'Volatility is per year, so time must be in years too. √365 ≈ 19.1, which is the size of the error. Mixing days and years is the usual bug in option code.',
        },
        {
          kind: 'number',
          id: 'pricing-theta-8',
          ask: 'A pricing library returns theta as −14.6 per year. What is that per calendar day, in dollars per share? Give two decimals.',
          answer: -0.04,
          tol: 0.001,
          check: '-14.6 / 365',
          why: '−14.6 ÷ 365 = −0.04. Formulas give theta per year; platforms show it per day. If your platform uses trading days it divides by about 252 instead, and the number looks larger.',
        },
        {
          kind: 'choice',
          id: 'pricing-theta-9',
          ask: 'A seller of an at-the-money option collects positive theta every day. What is the catch?',
          options: [
            'There is none if the stock stays in a range',
            'The seller is short gamma: a large move costs more than many days of theta',
            'Theta is taxed',
            'Theta is only paid at expiry',
          ],
          answer: 1,
          why: 'Positive theta and negative gamma come together. The seller wins on quiet days and loses on big moves, and one big move can wipe out weeks of decay.',
        },
        {
          kind: 'write',
          id: 'pricing-theta-10',
          ask: 'Write `daily_theta`: the change in a call price when one day passes, with the stock and volatility unchanged. Use the `bs_call` given (it takes days left and returns the value at expiry when days is 0).',
          starter: `${BS}

def daily_theta(S, K, days, vol):
    # price with one day less, minus price now
    pass`,
          solution: `${BS}

def daily_theta(S, K, days, vol):
    return bs_call(S, K, days - 1, vol) - bs_call(S, K, days, vol)`,
          tests: `out = daily_theta(100, 100, 30, 0.2)
assert out is not None, "the function returns nothing yet"
assert out < 0, "a bought call loses value as a day passes: theta should be negative"
assert abs(out + 0.0385) < 1e-3, f"the 30-day at-the-money call at 20% loses about 0.0385 in a day, got {out}"
last = daily_theta(100, 100, 1, 0.2)
assert abs(last + 0.4176) < 1e-3, f"on the last day the at-the-money call loses all of its 0.4176, got {last}"
assert abs(daily_theta(100, 100, 7, 0.2)) > 2 * abs(daily_theta(100, 100, 60, 0.2)), "decay should be much faster with 7 days left than with 60"`,
          why: 'Repricing with one day less is what theta measures. On the last day the whole remaining value goes, which no per-year formula shows as neatly.',
        },
        {
          kind: 'design',
          id: 'pricing-theta-11',
          ask: 'You want to buy a call on Thursday and hold it for a move you expect "next week". Write down how theta shapes the plan.',
          checklist: [
            { point: 'Choose an expiry with time to spare beyond the expected move', why: 'An option expiring Friday loses most of its value before next week arrives.' },
            { point: 'Count the weekend: calendar theta runs on Saturday and Sunday', why: 'You pay for days when the market is closed.' },
            { point: 'Work out the daily break-even move from theta and gamma', why: 'If the stock usually moves less than that, the position bleeds on most days.' },
            { point: 'Set a time stop: if the move has not come by a set day, exit', why: 'Waiting costs more each day as expiry nears.' },
            { point: 'Size so that losing the whole premium is acceptable', why: 'A bought option can expire worthless.' },
            { point: 'Consider a spread to cut the theta paid', why: 'Selling a further option offsets part of the decay, at the price of a capped gain.' },
          ],
          why: 'Being right about direction is not enough with a bought option: the move has to come soon enough and be large enough to beat the decay. Planning the timing is part of the trade.',
        },
      ],
    },
    {
      id: 'pricing-vega',
      title: 'Vega',
      summary: 'Sensitivity to implied volatility, and why a right call on direction can still lose.',
      text: [
        '**Vega** is how much the option price changes when implied volatility (IV) rises by one percentage point, say from 20% to 21%. Calls and puts with the same strike and expiry have the same vega. Bought options have positive vega, sold options negative.',
        'Vega is largest at the money and for long expiries. For an at-the-money option, vega ≈ 0.4 × S × √T ÷ 100 per point. On a 100 stock that is about 0.40 a point with a year left, about 0.11 with 30 days and about 0.02 with one day.',
        'IV is not fixed. It tends to rise when the market falls or before news, and to fall once the news is out or the market is calm. When IV falls, every bought option loses value, whatever the stock does. That is how you can be right about direction and still lose: the stock rises, but the fall in IV takes more than delta gives.',
        'Example: an at-the-money 30-day call at IV 40% costs 4.57. A day later the stock is up $2, but IV has dropped to 30%. The call is worth 4.50. Delta and gamma added about 1.12, the 10-point fall in IV took about 1.14 and a day of theta about 0.08. The volatility module covers why and when IV drops.',
        'For options that expire today or this week, vega is small next to delta and gamma, and moves in IV matter less than moves in the stock. For options months out, vega can be the largest Greek in the position.',
      ],
      rules: [
        'Vega: change in price for a one-point rise in IV. Long options +, short options −.',
        'Vega is largest at the money and grows with time to expiry (≈ 0.4 × S × √T ÷ 100).',
        'A fall in IV lowers calls and puts alike.',
        'Right direction can still lose if IV falls or the move is too slow.',
        'Short-dated options: vega is small. Long-dated: it can dominate.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'pricing-vega-1',
          ask: 'You hold 2 calls with vega 0.12. IV rises 3 points and nothing else changes. What is your P&L in dollars?',
          answer: 72,
          check: '0.12 * 3 * 100 * 2',
          why: '0.12 × 3 = 0.36 per share, × 100 × 2 = $72. Vega is quoted per point, so a 3-point rise is three times vega.',
        },
        {
          kind: 'number',
          id: 'pricing-vega-2',
          ask: 'Use the rule of thumb: an at-the-money option on a 200 stock with 3 months (0.25 years) left. Roughly what is its vega, in dollars per share per IV point?',
          answer: 0.4,
          check: '0.4 * 200 * math.sqrt(0.25) / 100',
          why: '0.4 × 200 × 0.5 ÷ 100 = 0.40. Black-Scholes gives 0.398. A one-point change in IV moves this option by about 40 cents per share.',
        },
        {
          kind: 'choice',
          id: 'pricing-vega-3',
          ask: 'You buy a call before a company announcement. The news is good, the stock rises $2, and your call is worth less than you paid. What is the most likely reason?',
          options: [
            'The broker made an error',
            'Implied volatility fell after the news, and the vega loss outweighed the delta gain',
            'Delta turned negative',
            'Gamma works against long calls on up moves',
          ],
          answer: 1,
          why: 'Before news the market prices in a move, so IV is high. After it, IV drops and every option on the stock loses value. If the move was smaller than what was priced in, the drop in IV takes more than delta adds.',
        },
        {
          kind: 'number',
          id: 'pricing-vega-4',
          ask: 'A call has delta 0.50 and vega 0.11. The stock rises $1 while IV falls 5 points. Ignoring gamma and theta, what is the change in the call price, in dollars per share?',
          answer: -0.05,
          tol: 0.005,
          check: '0.50 * 1 + 0.11 * -5',
          why: 'Delta gives +0.50, vega gives 0.11 × −5 = −0.55. Net −0.05: the stock went your way and the option still lost.',
        },
        {
          kind: 'choice',
          id: 'pricing-vega-5',
          ask: 'The stock is at 100. Which option has the largest vega?',
          options: ['The 100 call with one year left', 'The 100 call with one week left', 'The 130 call with one week left', 'The 100 call expiring today'],
          answer: 0,
          why: 'Vega grows with √T and is largest at the money: about 0.40 a point for one year here, against about 0.06 for one week. Far out of the money with little time, vega is near zero.',
        },
        {
          kind: 'choice',
          id: 'pricing-vega-6',
          ask: 'A 100 call and a 100 put on the same stock with the same expiry. How do their vegas compare?',
          options: ['The call has more vega', 'The put has more vega', 'They have the same vega', 'The put has negative vega'],
          answer: 2,
          why: 'Both are worth more when volatility rises, and by the same amount: put-call parity links them through the stock and the strike, neither of which depends on volatility.',
        },
        {
          kind: 'output',
          id: 'pricing-vega-7',
          ask: 'Delta and vega parts of the P&L for three scenarios (stock move, IV change in points). What does this print?',
          code: `vega, delta = 0.15, 0.50
for move, iv_change in [(2, 0), (2, -8), (-1, 4)]:
    print(round(delta * move + vega * iv_change, 2))`,
          answer: '1.0\n-0.2\n0.1',
          why: 'A $2 rise gives 1.00. The same rise with IV down 8 points gives 1.00 − 1.20 = −0.20. A $1 fall with IV up 4 gives −0.50 + 0.60 = +0.10: the call gained although the stock fell.',
        },
        {
          kind: 'bug',
          id: 'pricing-vega-8',
          ask: 'This should give the P&L per share from a change in IV. The results are always tiny.',
          code: `def vega_pnl(vega_per_point, iv_before, iv_after):
    # IVs are given in percent, for example 24.0
    change = (iv_after - iv_before) / 100
    return vega_per_point * change`,
          line: 3,
          fix: '    change = iv_after - iv_before',
          why: 'Vega is already per percentage point, and the IVs are given in percent, so the change in points is the plain difference. Dividing by 100 shrinks the answer a hundredfold.',
        },
        {
          kind: 'number',
          id: 'pricing-vega-9',
          ask: 'A call has delta 0.40 and vega 0.10. IV falls 6 points. Ignoring gamma and theta, how far must the stock rise, in dollars, for the call to break even?',
          answer: 1.5,
          check: '0.10 * 6 / 0.40',
          why: 'The IV drop costs 0.10 × 6 = 0.60. Delta earns 0.40 per dollar, so the stock must rise 0.60 ÷ 0.40 = $1.50 to stand still.',
        },
        {
          kind: 'number',
          id: 'pricing-vega-10',
          ask: 'You are short 2 puts, each with vega 0.09. The market drops and IV jumps 10 points. Ignoring every other Greek, what is your P&L from vega, in dollars?',
          answer: -180,
          check: '-2 * 0.09 * 10 * 100',
          why: 'A short option has negative vega: −2 × 0.09 × 10 × 100 = −$180. Short puts are hurt twice in a sell-off: by delta as the stock falls and by vega as IV rises.',
        },
        {
          kind: 'write',
          id: 'pricing-vega-11',
          ask: 'Write `vega_per_point`: reprice the call with IV half a point higher and half a point lower and return the difference. Use the `bs_call` given.',
          starter: `${BS}

def vega_per_point(S, K, days, vol):
    # vol is a decimal: 0.20 means 20%
    pass`,
          solution: `${BS}

def vega_per_point(S, K, days, vol):
    return bs_call(S, K, days, vol + 0.005) - bs_call(S, K, days, vol - 0.005)`,
          tests: `out = vega_per_point(100, 100, 30, 0.2)
assert out is not None, "the function returns nothing yet"
assert out > 0, "a bought call gains when IV rises: vega should be positive"
assert abs(out - 0.1143) < 1e-3, f"the 30-day at-the-money call has vega 0.1143 per point, got {out}: is the bump one point (0.01) in total?"
assert abs(vega_per_point(100, 100, 365, 0.2) - 0.397) < 2e-3, "with a year left vega should be about 0.397"
assert vega_per_point(100, 130, 7, 0.2) < 0.01, "far out of the money with a week left, vega should be close to zero"`,
          why: 'One point is 0.01 in decimal volatility. Bumping half a point each way and taking the difference gives the change for one point, centred on today\'s IV.',
        },
        {
          kind: 'design',
          id: 'pricing-vega-12',
          ask: 'Your call lost money although the stock rose. Write the review of the trade.',
          checklist: [
            { point: 'Split the P&L into delta, gamma, theta and vega parts', why: 'It shows which input cost you, rather than guessing.' },
            { point: 'Compare IV at entry and at exit', why: 'A fall in IV is the usual reason a right call loses.' },
            { point: 'Check whether an event (earnings, a data release) fell inside the trade', why: 'IV often rises before an event and falls after it.' },
            { point: 'Compare the move with the break-even move for the time held', why: 'A small move may not cover theta.' },
            { point: 'Check the spread paid at entry and exit', why: 'Crossing a wide spread twice can cost more than a small move earns.' },
            { point: 'Write one change for next time, for example checking IV before entry', why: 'A review is only useful if it changes the next decision.' },
          ],
          why: 'An option\'s P&L has several sources. Separating them turns "the market is rigged" into a specific lesson about IV, timing or cost.',
        },
      ],
    },
    {
      id: 'pricing-black-scholes',
      title: 'The Black-Scholes model',
      summary: 'Its inputs, what it assumes, pricing a call and a put, and put-call parity.',
      text: [
        'The **Black-Scholes** model gives a fair price for a European option from five inputs: S, K, T in years, r as a continuously compounded rate, and σ as an annual volatility. The Greeks in this module are its slopes.',
        { code: `d1 = (ln(S/K) + (r + σ²/2)·T) / (σ·√T)
d2 = d1 − σ·√T
call = S·N(d1) − K·e^(−rT)·N(d2)
put  = K·e^(−rT)·N(−d2) − S·N(−d1)` },
        '**N** is the standard normal cumulative distribution: the chance that a normal draw falls below x. In Python, `N(x) = 0.5 * (1 + math.erf(x / math.sqrt(2)))`. N(d1) is the call\'s delta. N(d2) is the model\'s probability that the call finishes in the money, under the model\'s own risk-neutral assumptions, not a forecast.',
        'The assumptions: the stock moves in a continuous random walk with constant volatility and no jumps, rates are constant, there are no dividends (in the basic version), exercise is only at expiry, and you can trade at any moment without costs. Real markets break all of these: prices gap on news, volatility changes, and options on the same stock trade at different implied volatilities by strike. Traders use the model as a common language to turn prices into implied volatility and Greeks, not as the truth.',
        '**Put-call parity** links a call and a put with the same strike and expiry: **C − P = S − K·e^(−rT)** for European options on a stock without dividends. A long call plus a short put pays the same as owning the stock and owing K at expiry, so they must cost the same. It holds exactly for SPX (European, cash settled); for American options on a dividend-paying ETF such as SPY it holds only roughly. A quote that seems to break parity is far more often stale, wide or reflecting a dividend than free money.',
      ],
      rules: [
        'Inputs: S, K, T (years), r, σ (annual). Output: a model price.',
        'N(d1) is the call delta; N(d2) is the model probability of finishing in the money.',
        'The model assumes constant volatility, no jumps and no costs. Markets do not oblige.',
        'Put-call parity: C − P = S − K·e^(−rT) (European, no dividends).',
        'Use the model to translate between prices, IV and Greeks, not as a forecast.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'pricing-black-scholes-1',
          ask: 'S = 100, K = 100, T = 1 year, r = 0 and σ = 20%. What is d1?',
          answer: 0.1,
          tol: 0.001,
          check: '(math.log(100 / 100) + (0 + 0.2 ** 2 / 2) * 1) / (0.2 * math.sqrt(1))',
          hint: 'ln(1) = 0.',
          why: 'ln(S/K) = 0, so d1 = (σ²/2)·T ÷ (σ√T) = 0.02 ÷ 0.2 = 0.10. d2 = d1 − σ√T = −0.10.',
        },
        {
          kind: 'number',
          id: 'pricing-black-scholes-2',
          ask: 'An at-the-money option (S = K) with r = 0, σ = 40% and T = 0.25 years. What is d2?',
          answer: -0.1,
          tol: 0.001,
          check: '(0 + 0.4 ** 2 / 2 * 0.25) / (0.4 * math.sqrt(0.25)) - 0.4 * math.sqrt(0.25)',
          why: 'With S = K and r = 0, d1 = σ√T ÷ 2 = 0.10 and d2 = −σ√T ÷ 2 = −0.10. So at the money the model gives the call slightly less than a 50% chance of finishing in the money, while its delta is slightly more than 0.50.',
        },
        {
          kind: 'number',
          id: 'pricing-black-scholes-3',
          ask: 'A one-year call with S = 100, K = 100 and r = 5% costs 10.45. Using put-call parity, what should the put with the same strike and expiry cost? Give two decimals.',
          answer: 5.57,
          tol: 0.01,
          check: '10.45 - 100 + 100 * math.exp(-0.05 * 1)',
          hint: 'P = C − S + K·e^(−rT).',
          why: 'P = 10.45 − 100 + 100 × e^(−0.05) = 10.45 − 100 + 95.12 = 5.57. With positive rates, an at-the-money call is worth more than the put.',
        },
        {
          kind: 'number',
          id: 'pricing-black-scholes-4',
          ask: 'Rates are close to zero and the stock pays no dividend. The stock is at 50 and the 45 put costs 0.80. What should the 45 call cost, in dollars per share?',
          answer: 5.8,
          check: '0.80 + 50 - 45',
          why: 'With r ≈ 0, C = P + S − K = 0.80 + 5 = 5.80. The call\'s extrinsic value (0.80) equals the put\'s: at the same strike they carry the same time value.',
        },
        {
          kind: 'output',
          id: 'pricing-black-scholes-5',
          ask: 'The normal CDF from `math.erf`. What does this print?',
          code: `import math

def N(x):
    return 0.5 * (1 + math.erf(x / math.sqrt(2)))

print(round(N(0), 2), round(N(1.96), 3))`,
          answer: '0.5 0.975',
          why: 'Half of a normal distribution lies below its centre, and 97.5% lies below 1.96 standard deviations. Those two values are a quick test of any N you write.',
        },
        {
          kind: 'bug',
          id: 'pricing-black-scholes-6',
          ask: 'This Black-Scholes call gives prices that are too low, and sometimes below intrinsic value.',
          code: `import math

def N(x):
    return 0.5 * (1 + math.erf(x / math.sqrt(2)))

def bs_call(S, K, T, r, vol):
    d1 = (math.log(S / K) + (r + vol ** 2 / 2) * T) / (vol * math.sqrt(T))
    d2 = d1 + vol * math.sqrt(T)
    return S * N(d1) - K * math.exp(-r * T) * N(d2)`,
          line: 8,
          fix: '    d2 = d1 - vol * math.sqrt(T)',
          why: 'd2 is d1 minus σ√T. Adding it raises N(d2), so too much of the discounted strike is subtracted and the call comes out too cheap.',
        },
        {
          kind: 'choice',
          id: 'pricing-black-scholes-7',
          ask: 'A stock reports earnings tomorrow and often gaps 8% on the news. Which Black-Scholes assumption is most clearly broken?',
          options: ['Rates are constant', 'The stock moves continuously with constant volatility and no jumps', 'Exercise only at expiry', 'The strike is fixed'],
          answer: 1,
          why: 'A gap is a jump, and the volatility around the event is far higher than on a normal day. Traders handle this by pricing a higher implied volatility for expiries that include the event.',
        },
        {
          kind: 'choice',
          id: 'pricing-black-scholes-8',
          ask: 'Rates are near zero. A stock is at 100; the 100 call shows 3.00 and the 100 put 1.00, same expiry. Parity says they should be about equal. What is the sensible first conclusion?',
          options: [
            'Buy the put and sell the call: it is free money',
            'Check for a dividend before expiry, stale or wide quotes, and early exercise, which commonly explain such gaps',
            'Black-Scholes is wrong',
            'The call is overpriced and will fall',
          ],
          answer: 1,
          why: 'Gaps like this in listed quotes usually have a reason: a dividend lowers calls and raises puts, quotes may be stale or wide, or the options are American. True arbitrage is rare and taken by professionals in milliseconds.',
        },
        {
          kind: 'choice',
          id: 'pricing-black-scholes-9',
          run: true,
          ask: 'What does this print?',
          code: `import math

def N(x):
    return 0.5 * (1 + math.erf(x / math.sqrt(2)))

S, K, T, r, vol = 100, 100, 1.0, 0.05, 0.20
d1 = (math.log(S / K) + (r + vol ** 2 / 2) * T) / (vol * math.sqrt(T))
d2 = d1 - vol * math.sqrt(T)
print(round(S * N(d1) - K * math.exp(-r * T) * N(d2), 2))`,
          options: ['7.97', '10.45', '5.57', '10.0'],
          answer: 1,
          why: 'd1 = 0.35, d2 = 0.15, and the call is 100 × 0.6368 − 95.12 × 0.5596 = 10.45. With no rates it would be 7.97; 5.57 is the matching put.',
        },
        {
          kind: 'write',
          id: 'pricing-black-scholes-10',
          ask: 'Write the Black-Scholes price of a European call. T is in years, r and vol are decimals.',
          starter: `import math

def N(x):
    return 0.5 * (1 + math.erf(x / math.sqrt(2)))

def bs_call(S, K, T, r, vol):
    pass`,
          solution: `import math

def N(x):
    return 0.5 * (1 + math.erf(x / math.sqrt(2)))

def bs_call(S, K, T, r, vol):
    d1 = (math.log(S / K) + (r + vol ** 2 / 2) * T) / (vol * math.sqrt(T))
    d2 = d1 - vol * math.sqrt(T)
    return S * N(d1) - K * math.exp(-r * T) * N(d2)`,
          tests: `out = bs_call(100, 100, 1.0, 0.05, 0.2)
assert out is not None, "the function returns nothing yet"
assert abs(out - 10.4506) < 1e-3, f"S=100, K=100, T=1, r=5%, vol=20% should give 10.4506, got {out}"
assert abs(bs_call(100, 100, 30 / 365, 0, 0.2) - 2.2872) < 1e-3, "the 30-day at-the-money call at 20% with no rates should be 2.2872"
assert abs(bs_call(100, 105, 30 / 365, 0, 0.2) - 0.6449) < 1e-3, "the 105 call should be 0.6449"
assert bs_call(150, 100, 0.1, 0, 0.2) >= 50, "a deep in-the-money call is worth at least its intrinsic value"`,
          why: 'Two lines for d1 and d2 and one for the price. Check any implementation against a known value before trusting the Greeks built on it.',
        },
        {
          kind: 'write',
          id: 'pricing-black-scholes-11',
          ask: 'Write `put_from_parity`: the European put price from the call price with the same strike and expiry, using put-call parity.',
          starter: `import math

def put_from_parity(call, S, K, T, r):
    # C - P = S - K * e^(-rT)
    pass`,
          solution: `import math

def put_from_parity(call, S, K, T, r):
    return call - S + K * math.exp(-r * T)`,
          tests: `out = put_from_parity(10.4506, 100, 100, 1.0, 0.05)
assert out is not None, "the function returns nothing yet"
assert abs(out - 5.5735) < 1e-3, f"from the 10.4506 call the put should be 5.5735, got {out}: is the strike discounted?"
assert abs(put_from_parity(2.2872, 100, 100, 30 / 365, 0) - 2.2872) < 1e-9, "with no rates an at-the-money put and call cost the same"
assert abs(put_from_parity(5.80, 50, 45, 0.1, 0) - 0.80) < 1e-9, "a 5.80 call with S=50, K=45 and no rates means a 0.80 put"`,
          why: 'Rearranged, P = C − S + K·e^(−rT). Parity needs no model and no volatility, which makes it a quick consistency check on a chain.',
        },
      ],
    },
    {
      id: 'pricing-estimate',
      title: 'Estimating P&L with the Greeks',
      summary: 'Delta, gamma, theta and vega together for a move over a day, and Greeks for a whole position.',
      widget: 'pricing-estimate',
      text: [
        'Each Greek prices one kind of change. Added together they estimate the change in an option price when several things move at once: **ΔP ≈ Δ·m + ½·Γ·m² + θ·days + vega·ΔIV**, where m is the stock move in dollars, days the days that pass and ΔIV the change in IV in points. That is per share; multiply by 100 and by the contracts, with short positions negative.',
        'Worked example: a 100 call with 30 days left, the stock at 100 and IV at 20%. Its Greeks are Δ 0.51, Γ 0.07, θ −0.038 and vega 0.114. Over one day the stock rises $2 and IV falls 1 point. Estimate: 1.02 + 0.14 − 0.04 − 0.11 = +1.01. Repricing the option with the full model gives +1.02.',
        'The estimate is good for small moves over short times, because the Greeks themselves change. For large moves or near expiry, gamma changes fast and the estimate drifts: reprice instead. The two together also tell you which input is driving the trade.',
        '**Position Greeks** add up the legs: for each Greek, Σ Greek × 100 × contracts, with short legs negative. Long 2 of the 100 calls (Δ 0.55) and short 2 of the 105 calls (Δ 0.30) is a position delta of (0.55 − 0.30) × 200 = 50 shares. The same sum works for gamma, theta and vega, and tells you what the whole position does when the stock, the clock or IV moves.',
        'Before a trade, a small what-if table (stock ±1 and ±2, IV ±2 points, the end of the day) tells you what you stand to make or lose. It is a model estimate: fills, spreads and fast markets can give a different result.',
      ],
      rules: [
        'ΔP ≈ Δ·m + ½·Γ·m² + θ·days + vega·ΔIV (per share).',
        'Multiply by 100 and by contracts; short legs are negative.',
        'Position Greek = Σ Greek × 100 × contracts.',
        'Trust the estimate for small moves over short times; reprice for big moves or near expiry.',
        'Build a what-if table before you trade, and remember it ignores the spread.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'pricing-estimate-1',
          ask: 'A call has Δ 0.40, Γ 0.05, θ −0.06 and vega 0.10. Over one day the stock rises $2 and IV rises 1 point. What is the estimated change in the call price, in dollars per share?',
          answer: 0.94,
          check: '0.40 * 2 + 0.5 * 0.05 * 2 ** 2 + (-0.06) * 1 + 0.10 * 1',
          why: '0.80 + 0.10 − 0.06 + 0.10 = 0.94. Delta does most of the work; the other three nearly cancel here.',
        },
        {
          kind: 'number',
          id: 'pricing-estimate-2',
          ask: 'Same call and same day, and you hold 3 contracts. What is the estimated P&L in dollars?',
          answer: 282,
          check: '(0.40 * 2 + 0.5 * 0.05 * 2 ** 2 - 0.06 + 0.10) * 100 * 3',
          why: '0.94 × 100 × 3 = $282.',
        },
        {
          kind: 'number',
          id: 'pricing-estimate-3',
          ask: 'You are long 2 calls with Δ 0.55 and short 2 calls with Δ 0.30 (a call spread). What is the position delta, in shares?',
          answer: 50,
          check: '0.55 * 100 * 2 + 0.30 * 100 * -2',
          why: '110 − 60 = 50 shares. The short call takes away part of the long call\'s exposure.',
        },
        {
          kind: 'number',
          id: 'pricing-estimate-4',
          ask: 'Same spread: the long calls have θ −0.06 and the short calls θ −0.04. What is the position theta, in dollars per day?',
          answer: -4,
          check: '-0.06 * 100 * 2 + (-0.04) * 100 * -2',
          why: 'Long legs: −0.06 × 200 = −12. Short legs earn their decay: −0.04 × −200 = +8. Net −$4 a day, a third of what the calls alone would cost.',
        },
        {
          kind: 'number',
          id: 'pricing-estimate-5',
          ask: 'You are long 3 puts with vega 0.08 and short 3 puts with vega 0.05. What is the position vega, in dollars per IV point?',
          answer: 9,
          check: '0.08 * 100 * 3 + 0.05 * 100 * -3',
          why: '24 − 15 = $9 per point. A spread has far less vega than a single option, which is one reason spreads suffer less when IV falls.',
        },
        {
          kind: 'choice',
          id: 'pricing-estimate-6',
          ask: 'In the figure, set days that pass and the IV change to 0, then drag the move to +10. The estimate shows about 8.59 and the repriced value about 7.83. Why do they differ?',
          options: [
            'The figure has a rounding error',
            'The estimate keeps gamma fixed, but as the call goes deep in the money its gamma falls, so the real gain is smaller',
            'Theta is missing from the repricing',
            'Vega changes with the stock',
          ],
          answer: 1,
          why: 'The Greeks are slopes at today\'s price. Over a $10 move delta stops growing as it nears 1, so the ½Γm² term overstates the gain. For big moves, reprice.',
        },
        {
          kind: 'output',
          id: 'pricing-estimate-7',
          ask: 'Position Greeks for two legs. What does this print?',
          code: `legs = [
    {"qty": 2, "delta": 0.60, "theta": -0.05},
    {"qty": -1, "delta": 0.35, "theta": -0.04},
]
delta = sum(l["qty"] * l["delta"] * 100 for l in legs)
theta = sum(l["qty"] * l["theta"] * 100 for l in legs)
print(round(delta), round(theta))`,
          answer: '85 -6',
          why: 'Delta: 120 − 35 = 85 shares. Theta: −10 + 4 = −6 dollars a day. The short leg reduces both.',
        },
        {
          kind: 'bug',
          id: 'pricing-estimate-8',
          ask: 'This should return the position theta in dollars per day. A long call with a short call against it shows more decay than the long call alone.',
          code: `def position_theta(legs):
    # legs: list of (contracts, theta_per_share); contracts < 0 means short
    total = 0
    for qty, theta in legs:
        total += abs(qty) * theta * 100
    return total`,
          line: 5,
          fix: '        total += qty * theta * 100',
          why: 'A short option earns its theta, so its contribution must have the opposite sign. With `abs` the short leg\'s decay is added as a cost instead of a credit.',
        },
        {
          kind: 'write',
          id: 'pricing-estimate-9',
          ask: 'Write `pnl_estimate`: the estimated P&L in dollars from the Greeks per share, the stock move, the days that pass, the IV change in points and the number of contracts (negative for short).',
          starter: `def pnl_estimate(delta, gamma, theta, vega, move, days, iv_points, contracts):
    pass`,
          solution: `def pnl_estimate(delta, gamma, theta, vega, move, days, iv_points, contracts):
    per_share = delta * move + 0.5 * gamma * move ** 2 + theta * days + vega * iv_points
    return per_share * 100 * contracts`,
          tests: `out = pnl_estimate(0.40, 0.05, -0.06, 0.10, 2, 1, 1, 3)
assert out is not None, "the function returns nothing yet"
assert abs(out - 282) < 1e-6, f"the example in this lesson's questions gives 282 dollars, got {out}"
assert abs(pnl_estimate(0.5, 0.1, 0, 0, -3, 0, 0, 1) + 105) < 1e-6, "a $3 fall with delta 0.5 and gamma 0.1 gives -1.05 a share, -105 dollars: is gamma times move squared over 2?"
assert abs(pnl_estimate(0.5, 0.1, -0.05, 0.1, 0, 2, 0, -2) - 20) < 1e-6, "short 2 options earn 2 days of 0.05 theta: +20 dollars"
assert abs(pnl_estimate(0.5, 0.1, 0, 0.12, 0, 0, -3, 1) + 36) < 1e-6, "an IV drop of 3 points with vega 0.12 costs 36 dollars on one contract"`,
          why: 'Four terms, then the multiplier and the contracts. With the sign carried by the contracts, the same function handles short positions.',
        },
        {
          kind: 'write',
          id: 'pricing-estimate-10',
          ask: 'Write `position_greeks`: given legs as dicts with `qty` (negative for short) and per-share `delta`, `gamma`, `theta` and `vega`, return a dict of the four position Greeks in shares or dollars.',
          starter: `def position_greeks(legs):
    # returns {"delta": ..., "gamma": ..., "theta": ..., "vega": ...}
    pass`,
          solution: `def position_greeks(legs):
    out = {}
    for name in ["delta", "gamma", "theta", "vega"]:
        out[name] = sum(leg["qty"] * leg[name] * 100 for leg in legs)
    return out`,
          tests: `legs = [
    {"qty": 2, "delta": 0.55, "gamma": 0.06, "theta": -0.06, "vega": 0.11},
    {"qty": -2, "delta": 0.30, "gamma": 0.05, "theta": -0.04, "vega": 0.09},
]
out = position_greeks(legs)
assert out is not None, "the function returns nothing yet"
assert set(out) == {"delta", "gamma", "theta", "vega"}, f"return the four Greeks by name, got {set(out)}"
assert abs(out["delta"] - 50) < 1e-9, f"delta should be 110 - 60 = 50 shares, got {out['delta']}"
assert abs(out["gamma"] - 2) < 1e-9, f"gamma should be 12 - 10 = 2, got {out['gamma']}"
assert abs(out["theta"] + 4) < 1e-9, f"theta should be -12 + 8 = -4 dollars a day, got {out['theta']}"
assert abs(out["vega"] - 4) < 1e-9, f"vega should be 22 - 18 = 4 dollars a point, got {out['vega']}"`,
          why: 'Every position Greek is the same weighted sum. Seeing all four at once tells you whether a position is mainly a bet on direction, on movement, on time or on IV.',
        },
        {
          kind: 'choice',
          id: 'pricing-estimate-11',
          ask: 'Your estimate says a call should be up 1.01 after the stock rose $2. The quote on your screen shows it up only 0.70. Which explanation should you check first?',
          options: [
            'The Greeks are always wrong',
            'IV fell more than you assumed, or you are comparing a bid with an earlier mid or ask',
            'Gamma made the move smaller',
            'Delta is per contract, not per share',
          ],
          answer: 1,
          why: 'The two usual gaps are IV changing differently from your assumption and the spread: a position marked at the bid shows less than the mid-price change. Both are real costs of the trade, not model failures.',
        },
        {
          kind: 'design',
          id: 'pricing-estimate-12',
          ask: 'Before the open you plan to hold 2 calls through the day. Build the what-if table you would make, and say what you would do with it.',
          checklist: [
            { point: 'Rows for stock moves of −2, −1, 0, +1, +2 dollars', why: 'Covers the usual range of a day for many large stocks, in both directions.' },
            { point: 'Columns for IV unchanged and ±2 points', why: 'Shows how much of the result depends on IV rather than direction.' },
            { point: 'One day of theta in every cell', why: 'Holding through the day costs decay even if nothing moves.' },
            { point: 'Dollar amounts for 2 contracts, not per share', why: 'Risk is decided in dollars against the account.' },
            { point: 'Compare the worst cell with your maximum risk per trade', why: 'If a normal day can lose more than you allow, the size is too large.' },
            { point: 'Reprice the extreme cells instead of trusting the Greek estimate', why: 'For big moves the estimate drifts.' },
            { point: 'Allow for the spread on exit', why: 'The table is at mid; you will likely sell nearer the bid.' },
          ],
          why: 'A what-if table turns the Greeks into the numbers you care about before the money is at stake, and shows whether the trade is a bet on direction, on time or on IV.',
        },
      ],
    },
    {
      id: 'pricing-lab',
      title: 'Lab: Black-Scholes and its Greeks from scratch',
      summary: 'The normal CDF, d1 and d2, call and put prices, delta, gamma, theta and vega, and a P&L estimate checked against repricing.',
      text: [
        'This lab builds an option calculator in plain Python: the normal distribution from `math.erf`, the Black-Scholes call and put, the four Greeks a day trader uses, and a P&L estimate tested against full repricing. Every number your broker\'s screen shows for a European option comes from a calculation like this one.',
        'Conventions, used in every step: T is in years (days ÷ 365), r and vol are decimals, theta is per calendar day (the yearly formula ÷ 365) and vega is per IV point (the formula ÷ 100). Most bugs in option code come from mixing these.',
        'Formula Greeks are easy to get subtly wrong, so each one is checked against repricing: move the input a little, price again, and compare the slope with the formula. If they agree, the formula is right.',
        'The last step puts it together: estimate the P&L of a move from the Greeks, reprice for the truth, and see where the estimate holds and where it breaks.',
      ],
      rules: [
        'N(x) = 0.5 × (1 + erf(x ÷ √2)).',
        'T in years; theta per day = yearly theta ÷ 365; vega per point = formula ÷ 100.',
        'Check formula Greeks against a small bump and reprice.',
        'Put-call parity is a free test of a call and put pricer.',
        'The Greek estimate is a local approximation: reprice for large moves.',
      ],
      questions: [
        {
          kind: 'write',
          id: 'pricing-lab-1',
          ask: 'Step 1: the normal distribution. Write `norm_cdf` (the chance a standard normal draw is below x) using `math.erf`, and `norm_pdf` (the bell curve height e^(−x²/2) ÷ √(2π)).',
          starter: `import math

def norm_cdf(x):
    pass

def norm_pdf(x):
    pass`,
          solution: `import math

def norm_cdf(x):
    return 0.5 * (1 + math.erf(x / math.sqrt(2)))

def norm_pdf(x):
    return math.exp(-x ** 2 / 2) / math.sqrt(2 * math.pi)`,
          tests: `out = norm_cdf(0)
assert out is not None, "norm_cdf returns nothing yet"
assert abs(out - 0.5) < 1e-12, f"half the distribution is below 0, got {out}"
assert abs(norm_cdf(1.96) - 0.975) < 1e-3, f"norm_cdf(1.96) should be about 0.975, got {norm_cdf(1.96)}: is x divided by sqrt(2)?"
assert abs(norm_cdf(1.3) + norm_cdf(-1.3) - 1) < 1e-12, "norm_cdf(x) + norm_cdf(-x) should be 1"
assert norm_pdf(0) is not None, "norm_pdf returns nothing yet"
assert abs(norm_pdf(0) - 0.398942) < 1e-6, f"the peak of the bell curve is 0.3989, got {norm_pdf(0)}"
assert abs(norm_pdf(1) - norm_pdf(-1)) < 1e-12, "the bell curve is symmetric"`,
          why: 'The browser has no scipy, but `math.erf` is enough. The pdf is needed for gamma, theta and vega. 0.3989 is the 0.4 in the rules of thumb for at-the-money prices and vega.',
        },
        {
          kind: 'write',
          id: 'pricing-lab-2',
          ask: 'Step 2: d1 and d2. Return both as a tuple.',
          starter: `import math

def d1_d2(S, K, T, r, vol):
    # T in years, r and vol as decimals
    pass`,
          solution: `import math

def d1_d2(S, K, T, r, vol):
    d1 = (math.log(S / K) + (r + vol ** 2 / 2) * T) / (vol * math.sqrt(T))
    d2 = d1 - vol * math.sqrt(T)
    return d1, d2`,
          tests: `out = d1_d2(100, 100, 1.0, 0.0, 0.2)
assert out is not None, "the function returns nothing yet"
d1, d2 = out
assert abs(d1 - 0.1) < 1e-9 and abs(d2 + 0.1) < 1e-9, f"S=K=100, T=1, r=0, vol=20% gives d1=0.1 and d2=-0.1, got {d1}, {d2}"
d1, d2 = d1_d2(100, 100, 1.0, 0.05, 0.2)
assert abs(d1 - 0.35) < 1e-9 and abs(d2 - 0.15) < 1e-9, f"with r=5% d1=0.35 and d2=0.15, got {d1}, {d2}"
d1, d2 = d1_d2(100, 105, 30 / 365, 0.0, 0.2)
assert abs(d1 + 0.8222) < 1e-3, f"for the 30-day 105 call d1 is -0.8222, got {d1}: is T in years?"`,
          why: 'd1 and d2 are where the five inputs meet. A wrong T (days instead of years) shows up here, before it spreads into every price and Greek.',
        },
        {
          kind: 'write',
          id: 'pricing-lab-3',
          ask: 'Step 3: prices. Write `bs_call` and `bs_put` using the helpers given.',
          starter: `import math

def norm_cdf(x):
    return 0.5 * (1 + math.erf(x / math.sqrt(2)))

def d1_d2(S, K, T, r, vol):
    d1 = (math.log(S / K) + (r + vol ** 2 / 2) * T) / (vol * math.sqrt(T))
    return d1, d1 - vol * math.sqrt(T)

def bs_call(S, K, T, r, vol):
    pass

def bs_put(S, K, T, r, vol):
    pass`,
          solution: `import math

def norm_cdf(x):
    return 0.5 * (1 + math.erf(x / math.sqrt(2)))

def d1_d2(S, K, T, r, vol):
    d1 = (math.log(S / K) + (r + vol ** 2 / 2) * T) / (vol * math.sqrt(T))
    return d1, d1 - vol * math.sqrt(T)

def bs_call(S, K, T, r, vol):
    d1, d2 = d1_d2(S, K, T, r, vol)
    return S * norm_cdf(d1) - K * math.exp(-r * T) * norm_cdf(d2)

def bs_put(S, K, T, r, vol):
    d1, d2 = d1_d2(S, K, T, r, vol)
    return K * math.exp(-r * T) * norm_cdf(-d2) - S * norm_cdf(-d1)`,
          tests: `c = bs_call(100, 100, 1.0, 0.05, 0.2)
p = bs_put(100, 100, 1.0, 0.05, 0.2)
assert c is not None and p is not None, "a function returns nothing yet"
assert abs(c - 10.4506) < 1e-3, f"the one-year call at r=5% is 10.4506, got {c}"
assert abs(p - 5.5735) < 1e-3, f"the one-year put at r=5% is 5.5735, got {p}"
assert abs(bs_put(100, 105, 30 / 365, 0, 0.2) - 5.6449) < 1e-3, "the 30-day 105 put with no rates is 5.6449"
for S in [80, 100, 120]:
    gap = bs_call(S, 100, 0.5, 0.03, 0.3) - bs_put(S, 100, 0.5, 0.03, 0.3) - (S - 100 * math.exp(-0.03 * 0.5))
    assert abs(gap) < 1e-9, f"put-call parity fails at S={S}: C - P should equal S - K*exp(-rT)"`,
          why: 'The put formula mirrors the call with the signs of d1 and d2 flipped. Put-call parity at several stock prices is a test that needs no reference values.',
        },
        {
          kind: 'output',
          id: 'pricing-lab-4',
          ask: 'Step 4: parity as a check. What does this print?',
          code: `import math

def N(x):
    return 0.5 * (1 + math.erf(x / math.sqrt(2)))

S, K, T, r, vol = 100, 100, 1.0, 0.05, 0.2
d1 = (math.log(S / K) + (r + vol ** 2 / 2) * T) / (vol * math.sqrt(T))
d2 = d1 - vol * math.sqrt(T)
call = S * N(d1) - K * math.exp(-r * T) * N(d2)
put = K * math.exp(-r * T) * N(-d2) - S * N(-d1)
print(round(call - put, 2), round(S - K * math.exp(-r * T), 2))`,
          answer: '4.88 4.88',
          why: '10.45 − 5.57 = 4.88, and 100 − 100 × e^(−0.05) = 4.88. If your two pricers disagree with parity, one of them has a bug.',
        },
        {
          kind: 'write',
          id: 'pricing-lab-5',
          ask: 'Step 5: delta and gamma of a call. Delta = N(d1); gamma = pdf(d1) ÷ (S × vol × √T).',
          starter: `${LAB_CORE}

def call_delta(S, K, T, r, vol):
    pass

def gamma(S, K, T, r, vol):
    pass`,
          solution: `${LAB_CORE}

def call_delta(S, K, T, r, vol):
    d1, _ = d1_d2(S, K, T, r, vol)
    return norm_cdf(d1)

def gamma(S, K, T, r, vol):
    d1, _ = d1_d2(S, K, T, r, vol)
    return norm_pdf(d1) / (S * vol * math.sqrt(T))`,
          tests: `out = call_delta(100, 100, 30 / 365, 0, 0.2)
assert out is not None, "call_delta returns nothing yet"
assert abs(out - 0.5114) < 1e-3, f"the 30-day at-the-money call has delta 0.5114, got {out}"
assert gamma(100, 100, 30 / 365, 0, 0.2) is not None, "gamma returns nothing yet"
assert abs(gamma(100, 100, 30 / 365, 0, 0.2) - 0.0695) < 1e-3, f"and gamma 0.0695, got {gamma(100, 100, 30 / 365, 0, 0.2)}"
S, K, T, r, vol, h = 103, 100, 0.2, 0.04, 0.25, 0.01
numeric_delta = (bs_call(S + h, K, T, r, vol) - bs_call(S - h, K, T, r, vol)) / (2 * h)
numeric_gamma = (bs_call(S + h, K, T, r, vol) - 2 * bs_call(S, K, T, r, vol) + bs_call(S - h, K, T, r, vol)) / h ** 2
assert abs(call_delta(S, K, T, r, vol) - numeric_delta) < 1e-5, "delta disagrees with repricing the call a cent up and down"
assert abs(gamma(S, K, T, r, vol) - numeric_gamma) < 1e-4, "gamma disagrees with repricing"`,
          why: 'The tests compare the formulas with bump-and-reprice at an awkward point (S=103, r=4%). Agreement there is far stronger evidence than one textbook value.',
        },
        {
          kind: 'write',
          id: 'pricing-lab-6',
          ask: 'Step 6: theta per calendar day and vega per IV point, for a call. Yearly theta = −S·pdf(d1)·vol ÷ (2√T) − r·K·e^(−rT)·N(d2); vega per 1.00 of vol = S·pdf(d1)·√T.',
          starter: `${LAB_CORE}

def call_theta_per_day(S, K, T, r, vol):
    pass

def vega_per_point(S, K, T, r, vol):
    pass`,
          solution: `${LAB_CORE}

def call_theta_per_day(S, K, T, r, vol):
    d1, d2 = d1_d2(S, K, T, r, vol)
    yearly = -S * norm_pdf(d1) * vol / (2 * math.sqrt(T)) - r * K * math.exp(-r * T) * norm_cdf(d2)
    return yearly / 365

def vega_per_point(S, K, T, r, vol):
    d1, _ = d1_d2(S, K, T, r, vol)
    return S * norm_pdf(d1) * math.sqrt(T) / 100`,
          tests: `out = call_theta_per_day(100, 100, 30 / 365, 0, 0.2)
assert out is not None, "call_theta_per_day returns nothing yet"
assert abs(out + 0.0381) < 1e-3, f"the 30-day at-the-money call loses about 0.0381 a day, got {out}: divide the yearly figure by 365"
v = vega_per_point(100, 100, 30 / 365, 0, 0.2)
assert v is not None, "vega_per_point returns nothing yet"
assert abs(v - 0.1143) < 1e-3, f"its vega is 0.1143 per point, got {v}: divide by 100"
S, K, T, r, vol = 103, 100, 0.2, 0.04, 0.25
dt = 1 / 365 / 100
numeric_theta = (bs_call(S, K, T - dt, r, vol) - bs_call(S, K, T + dt, r, vol)) / (2 * dt) / 365
assert abs(call_theta_per_day(S, K, T, r, vol) - numeric_theta) < 1e-5, "theta disagrees with repricing with a little less time"
numeric_vega = bs_call(S, K, T, r, vol + 0.005) - bs_call(S, K, T, r, vol - 0.005)
assert abs(vega_per_point(S, K, T, r, vol) - numeric_vega) < 1e-4, "vega disagrees with repricing half a point up and down"`,
          why: 'The yearly theta formula has two parts: decay of the time value and the effect of rates on the discounted strike. Dividing by 365 and by 100 puts both Greeks in the units a trading screen shows.',
        },
        {
          kind: 'bug',
          id: 'pricing-lab-7',
          ask: 'Step 7: a units bug. This vega is used in a P&L estimate, and a 2-point drop in IV shows a loss of about 23 dollars per share on a 2.29 option.',
          code: `import math

def vega_per_point(S, K, T, r, vol):
    d1 = (math.log(S / K) + (r + vol ** 2 / 2) * T) / (vol * math.sqrt(T))
    pdf = math.exp(-d1 ** 2 / 2) / math.sqrt(2 * math.pi)
    return S * pdf * math.sqrt(T)`,
          line: 6,
          fix: '    return S * pdf * math.sqrt(T) / 100',
          why: 'The formula gives the change for a move of 1.00 in vol, that is 100 points. Per point it must be divided by 100: 11.43 becomes 0.1143, and a 2-point drop costs 0.23, not 23.',
        },
        {
          kind: 'write',
          id: 'pricing-lab-8',
          ask: 'Step 8: estimate against truth. Return `(estimate, actual)` for a call: the Greek estimate Δ·m + ½Γm² + θ·days + vega·ΔIV, and the change found by repricing with the new stock price, time and vol. All helpers are given.',
          starter: `${LAB_CORE}

def greeks(S, K, T, r, vol):
    d1, d2 = d1_d2(S, K, T, r, vol)
    delta = norm_cdf(d1)
    gamma = norm_pdf(d1) / (S * vol * math.sqrt(T))
    theta = (-S * norm_pdf(d1) * vol / (2 * math.sqrt(T)) - r * K * math.exp(-r * T) * norm_cdf(d2)) / 365
    vega = S * norm_pdf(d1) * math.sqrt(T) / 100
    return delta, gamma, theta, vega

def estimate_vs_reprice(S, K, days, r, vol, move, days_passed, iv_points):
    # days: days to expiry now; iv_points: change in IV in points (e.g. -1)
    pass`,
          solution: `${LAB_CORE}

def greeks(S, K, T, r, vol):
    d1, d2 = d1_d2(S, K, T, r, vol)
    delta = norm_cdf(d1)
    gamma = norm_pdf(d1) / (S * vol * math.sqrt(T))
    theta = (-S * norm_pdf(d1) * vol / (2 * math.sqrt(T)) - r * K * math.exp(-r * T) * norm_cdf(d2)) / 365
    vega = S * norm_pdf(d1) * math.sqrt(T) / 100
    return delta, gamma, theta, vega

def estimate_vs_reprice(S, K, days, r, vol, move, days_passed, iv_points):
    T = days / 365
    delta, gamma, theta, vega = greeks(S, K, T, r, vol)
    estimate = delta * move + 0.5 * gamma * move ** 2 + theta * days_passed + vega * iv_points
    new_T = (days - days_passed) / 365
    actual = bs_call(S + move, K, new_T, r, vol + iv_points / 100) - bs_call(S, K, T, r, vol)
    return estimate, actual`,
          tests: `out = estimate_vs_reprice(100, 100, 30, 0, 0.2, 2, 1, -1)
assert out is not None, "the function returns nothing yet"
est, act = out
assert abs(est - 1.0094) < 2e-3, f"the lesson's example estimate is about 1.01, got {est}"
assert abs(act - 1.0163) < 2e-3, f"repricing gives about 1.02, got {act}: is the new IV vol + iv_points / 100 and the time days - days_passed?"
est, act = estimate_vs_reprice(100, 100, 30, 0, 0.2, 10, 0, 0)
assert abs(est - 8.589) < 0.01 and abs(act - 7.833) < 0.01, f"a 10 dollar move: estimate 8.59, repriced 7.83, got {est}, {act}"
small = estimate_vs_reprice(100, 100, 30, 0, 0.2, 0.5, 0, 0)
assert abs(small[0] - small[1]) < 0.002, "for a 50 cent move the estimate and the repricing should agree to a fraction of a cent"`,
          why: 'For a $2 move over a day the two agree within a cent or so; for $10 the estimate is off by more than 0.75 because gamma falls as the call goes deep in the money. Knowing where the shortcut breaks is the point of building both.',
        },
      ],
    },
  ],
}
