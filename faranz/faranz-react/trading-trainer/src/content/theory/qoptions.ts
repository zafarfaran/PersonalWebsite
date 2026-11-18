import type { Block } from '../../types'

/** The full theory for each lesson of the qoptions module, keyed by lesson id. */
export const qoptionsTheory: Record<string, Block[]> = {
  'qoptions-replication': [
    { h: 'What an option price has to explain' },
    'The pricing module gave you the Black-Scholes formula and its Greeks: delta, the change in the option per $1 move in the stock; gamma, the change in delta; theta, the loss of value per unit of time. It did not say why the formula is right. This lesson gives the argument, because every method in the rest of the module, trees, simulation and hedging, is the same argument in a different form.',
    'The question is simple to state. Before expiry nobody knows what an option will pay. Why should its price be one particular number rather than whatever buyers and sellers happen to agree on?',

    { h: 'Copying an option in one step' },
    { sub: 'A world with two outcomes' },
    'Take a stock at $80 that, one period from now, will be at either $96 or $64. A call struck at $80 will then be worth $16 (up) or $0 (down). Cash earns 1% over the period. Nothing else can happen. This toy world is called a **one-step tree**.',
    { sub: 'The hedge ratio' },
    'Look for a mix of shares and cash that pays exactly what the call pays. The shares must account for the whole difference between the two payoffs: the call differs by $16 between the states, the stock by $32. So hold 16 ÷ 32 = 0.5 shares. This number, the change in the option over the change in the stock, is the **hedge ratio**. It is delta, measured over one step instead of at an instant.',
    { sub: 'The cash' },
    'Half a share is worth $48 up and $32 down. The call pays $16 and $0, so you need $32 less in both states: borrow 32 ÷ 1.01 = $31.68 today, which grows to $32. The copy costs 0.5 × 80 − 31.68 = $8.32.',
    {
      code: `def replicate(S0, Su, Sd, pay_u, pay_d, r):
    shares = (pay_u - pay_d) / (Su - Sd)
    cash = (pay_u - shares * Su) / (1 + r)
    return shares, cash, shares * S0 + cash

for pays in [(16.0, 0.0), (0.0, 16.0)]:
    sh, cash, price = replicate(80.0, 96.0, 64.0, *pays, 0.01)
    print(round(sh, 2), round(cash, 2), round(price, 2))`,
      out: `0.5 -31.68 8.32
-0.5 47.52 7.52`,
    },
    'The second line is a put struck at $80, paying $0 up and $16 down. Its copy is short half a share and lends $47.52: a put is a short position in the stock plus a loan, which is why its delta is negative.',

    { h: 'Why the copy fixes the price' },
    'An **arbitrage** is a set of trades that cannot lose and may win. If the call traded at $9, you would sell it, build the copy for $8.32 and keep $0.68, whatever the stock does: in each state the copy pays exactly what you owe on the call. If the call traded at $7.50, you would do the reverse. So the only price with no arbitrage is the cost of the copy.',
    'Notice what was never used: the chance that the stock goes up. Two people with opposite views on the stock can each build the copy, so they must agree on the call. Their views are already in the stock price of $80.',

    { h: 'Risk-neutral pricing' },
    { sub: 'The weights' },
    'There is a shortcut to the same number. Find the weight q that would make the stock earn exactly the cash rate on average: `q × Su + (1 − q) × Sd = S0 × (1 + r)`, so `q = (S0 × (1 + r) − Sd) ÷ (Su − Sd)`. Here q = (80.8 − 64) ÷ 32 = 0.525. Then the call is worth its q-weighted payoff, discounted: 0.525 × 16 ÷ 1.01 = $8.32, the same as the copy. The put is 0.475 × 16 ÷ 1.01 = $7.52.',
    { sub: 'What q is and is not' },
    'q is called the **risk-neutral probability**, because it prices things as if nobody needed paying for risk. It is not a forecast. It is the set of weights that reproduces the cost of copying, and one q prices every payoff on the same tree. Its real job is convenience: averaging is easier than solving for the copy, and in large models it is the only practical route.',

    { h: 'From one step to Black-Scholes' },
    'Cut time into very short steps and rebalance the copy at each one. Over an instant, a portfolio of one option and −Δ shares has no random part left: its small moves in the stock cancel. A riskless portfolio must earn the risk-free rate r. Written as an equation, that is the **Black-Scholes equation**: `θ + ½σ²S²Γ + rSΔ − rV = 0`, where V is the option value and σ the volatility.',
    'With r = 0 it reads `θ = −½σ²S²Γ`: an option that gains from movement (positive gamma) must lose to time at a matching rate. Take a $50 stock with σ = 30% and an option with Γ = 0.05: θ = −0.5 × 0.09 × 2,500 × 0.05 = −$5.63 a year. The expected return of the stock, μ, appears nowhere, so the formula needs σ and r but no view on direction.',

    { h: 'Where the argument breaks' },
    'The copy is exact only if the stock has two outcomes per step, you can trade at every instant without costs, and σ is known. Add a third outcome, a gap overnight or a jump on earnings, and two instruments cannot match three payoffs. Such a market is called **incomplete**, and no-arbitrage then gives a range of prices, not one. Costs and unknown volatility widen the range further. Market makers quote inside it and charge for the risk they cannot hedge away, which is part of why real options do not trade at one textbook value.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Thinking a bullish view makes a call worth more. The view belongs in the stock; the option price follows from it.',
        'Reading q as the market\'s forecast of an up move.',
        'Forgetting that under q the stock must grow at the risk-free rate, so the formula for q contains S0 × (1 + r).',
        'Treating the copy as exact in markets that gap. It is exact only in the model.',
      ],
    },
  ],

  'qoptions-binomial': [
    { h: 'From one step to many' },
    'One step with two outcomes is too crude for a real stock, but the replication argument works at every step of a longer tree. Chain many short steps together and the end prices spread out into something close to the range a real stock can reach. That is a **binomial tree**, and it is the standard way to price options that can be exercised early.',

    { h: 'Building the tree' },
    { sub: 'Step size and volatility' },
    'Split the time to expiry T into N steps of `Δt = T ÷ N`. The Cox-Ross-Rubinstein choice (1979), called **CRR**, multiplies the price each step by `u = e^(σ√Δt)` or by `d = 1 ÷ u`. The step size σ√Δt is the volatility of one step, so the tree has the right spread of outcomes. With σ = 30% and quarterly steps (Δt = 0.25), u = e^0.15 ≈ 1.162 and d ≈ 0.861.',
    { sub: 'The weights with interest' },
    'The risk-neutral weight is the one from the one-step lesson, with continuous compounding: `q = (e^(rΔt) − d) ÷ (u − d)`. It makes the stock grow at the rate r on average over each step.',
    { sub: 'The node prices' },
    'Because an up step followed by a down step returns to the same price, the tree **recombines**: after i steps there are only i + 1 prices, `S0 × u^j × d^(i−j)` for j up steps. That keeps the work small: N steps need about N²/2 node values, not 2^N.',

    { h: 'Working backwards' },
    'At expiry each node is worth the payoff. One step earlier, each node is worth the discounted q-average of the two nodes it leads to: `e^(−rΔt) × (q × V_up + (1 − q) × V_down)`. Repeat until one node is left: that is today\'s price. This is **backward induction**. A small example by hand: a $50 stock, steps of ×1.2 or ×0.8, r = 0, so q = 0.5. After two steps the prices are 72, 48 and 32, and a call struck at $50 pays 22, 0 and 0. Only the top node pays, with weight 0.5 × 0.5, so the call is worth 0.25 × 22 = $5.50.',
    {
      code: `import math, numpy as np

def crr_call(S, K, T, r, sigma, N):
    dt = T / N
    u = math.exp(sigma * math.sqrt(dt)); d = 1 / u
    q = (math.exp(r * dt) - d) / (u - d)
    j = np.arange(N + 1)
    V = np.maximum(S * u**j * d**(N - j) - K, 0)
    for _ in range(N):
        V = math.exp(-r * dt) * (q * V[1:] + (1 - q) * V[:-1])
    return float(V[0])

print([round(crr_call(50, 50, 0.5, 0.03, 0.3, n), 3) for n in (20, 21, 400)])`,
      out: `[4.523, 4.624, 4.572]`,
    },
    '`V[1:]` and `V[:-1]` are the up and down children of every node in the row, so each pass of the loop moves one step back in time for the whole row at once.',

    { h: 'How the tree converges' },
    'Black-Scholes gives 4.575 for this option. With 20 steps the tree is 5 cents low, with 21 it is 5 cents high, with 400 it is within 3 tenths of a cent. The error shrinks roughly like 1 ÷ N, but it **zigzags**: with an even N a node sits right at the strike, with an odd N the strike falls between nodes, and the error changes sign. Averaging the prices for N and N + 1 cancels much of it. Always look at several N before trusting a tree.',

    { h: 'American options and early exercise' },
    { sub: 'The check at every node' },
    'An **American** option can be exercised on any day up to expiry; a **European** one only at expiry. In the tree, an American holder at a node compares holding on (the discounted average) with exercising now (the intrinsic value, for a put K − S) and takes the larger. That one extra `max` is all it takes.',
    { sub: 'A put worth exercising' },
    'Take the same $50 stock with steps of ×1.2 or ×0.8, cash growing 4% a step, so q = (1.04 − 0.8) ÷ 0.4 = 0.6, and a put struck at $50. At the down node, $40, holding is worth (0.6 × 2 + 0.4 × 18) ÷ 1.04 = $8.08, but exercising pays $10 now. The American put takes $10, and today it is worth $4.29 against $3.55 for the European one. Taking the strike early lets you earn interest on it.',
    { sub: 'Calls without dividends' },
    'For a call on a stock with no dividends the check never fires. The call is always worth at least `S − K × e^(−rT)`, the value of the stock minus the strike paid later, and that is more than `S − K`. Exercising would throw away both the time value and the interest on the strike. A dividend changes this, because the call holder does not receive it: exercising the day before the stock goes ex-dividend can be worth it. Reminder from the options module: SPY options are American and SPY pays dividends; SPX options are European.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Checking a tree at one N and missing the zigzag.',
        'Comparing the held value with zero instead of with the exercise value, which gives the European price.',
        'Using Black-Scholes for deep in-the-money American puts, which undervalues them.',
        'Forgetting dividends when pricing American options on ETFs.',
      ],
    },
  ],

  'qoptions-montecarlo': [
    { h: 'Pricing by simulation' },
    'Risk-neutral pricing says an option is worth its average payoff under the risk-neutral rules, discounted at the risk-free rate. **Monte Carlo** pricing takes that sentence literally: simulate many possible prices at expiry, compute the payoff on each, average them and discount. It is slow for simple options, but it works for almost any payoff and any model, which is why it is the workhorse for exotic options.',

    { h: 'Simulating the stock' },
    { sub: 'Geometric Brownian motion' },
    'Black-Scholes assumes the stock follows **geometric Brownian motion**: its log return over a period T is normal, with volatility σ√T. Under the risk-neutral rules the price at expiry is `S_T = S0 × e^((r − σ²/2)T + σ√T × Z)`, where Z is a **standard normal** draw (mean 0, standard deviation 1). NumPy draws them with `np.random.default_rng(seed).standard_normal(n)`; the seed makes the draws the same on every run.',
    { sub: 'Why the −σ²/2' },
    'The average of e^(σ√T × Z) is not 1 but e^(σ²T/2), the volatility drag from the quant module working the other way. Subtracting σ²/2 in the exponent cancels it, so the average of S_T is S0 × e^(rT): the stock grows at the risk-free rate on average, as risk-neutral pricing requires. Leaving it out is the most common Monte Carlo bug, and one line catches it.',
    {
      code: `import numpy as np

rng = np.random.default_rng(1)
z = rng.standard_normal(100_000)
for drift in (0.03 - 0.5 * 0.3**2, 0.03):
    ST = 50 * np.exp(drift * 2 + 0.3 * np.sqrt(2) * z)
    print(round(float(ST.mean() * np.exp(-0.03 * 2)), 2))`,
      out: `49.88
54.58`,
    },
    'With the correct drift the discounted average is $49.88, within simulation noise of today\'s $50. Without the −σ²/2 it is $54.58: the simulated stock grows too fast and every call priced from it comes out too dear.',

    { h: 'The estimate and its error' },
    { sub: 'Standard error' },
    'A Monte Carlo price is an average of random numbers, so it is itself random. Its **standard error** is `sd ÷ √n`, where sd is the standard deviation of the discounted payoffs and n the number of paths. With sd = $20 and 40,000 paths, the standard error is 20 ÷ 200 = $0.10.',
    { sub: 'The interval' },
    'About 95% of the time the true price lies within 1.96 standard errors of the estimate, so report `price ± 1.96 × se`. Here that is ±$0.196. Over many seeds, about 95 intervals in 100 should contain the true value; far fewer means the error bar is computed wrongly.',
    { sub: 'The square-root law' },
    'Because of the √n, halving the error needs four times the paths and cutting it by ten needs a hundred times. Brute force gets expensive fast, which is why quants reduce the variance instead.',

    { h: 'Antithetic variates' },
    'For each draw Z, also use −Z, and average the two discounted payoffs into one **pair average**. If the payoff rises with the stock, a high Z and its mirror err in opposite directions and partly cancel. The two halves of a pair are not independent, so the standard error must be computed from the n pair averages: standard deviation of the pairs ÷ √(number of pairs).',
    {
      code: `import numpy as np

rng = np.random.default_rng(2)
z = rng.standard_normal(50_000)
S0, K, T, r, s = 50.0, 45.0, 0.5, 0.03, 0.3
pay = lambda x: np.exp(-r * T) * np.maximum(K - S0 * np.exp((r - s * s / 2) * T + s * np.sqrt(T) * x), 0)
plain = np.concatenate([pay(z), pay(rng.standard_normal(50_000))])
pairs = 0.5 * (pay(z) + pay(-z))
print(round(plain.mean(), 3), round(plain.std(ddof=1) / np.sqrt(100_000), 4))
print(round(pairs.mean(), 3), round(pairs.std(ddof=1) / np.sqrt(50_000), 4))`,
      out: `1.77 0.0109
1.761 0.0094`,
    },
    'Both use 100,000 payoffs on an out-of-the-money put whose Black-Scholes price is 1.770. The antithetic error is about 14% smaller here. The gain is modest because the payoff is zero over most draws, where Z and −Z do not offset; for payoffs closer to a straight line in the stock it is much larger.',

    { h: 'Control variates' },
    'A **control variate** is a quantity simulated on the same paths whose true average you know. The discounted S_T is the usual one: its true mean is S0. If the simulated mean of the control came out too high, the option estimate probably did too, so correct it: `estimate − β × (control mean − S0)`, with `β = cov(payoff, control) ÷ var(control)`, both measured from the simulation. If the correlation between payoff and control is ρ, the variance is multiplied by `1 − ρ²`. With ρ = 0.8 that is 0.36, the same as 2.8 times as many paths, for almost no extra work.',

    { h: 'When to use Monte Carlo' },
    'For a European call or put, Black-Scholes is exact and Monte Carlo is a check. Simulation earns its place when the payoff depends on the **path**: an **Asian option** pays on the average price over its life, a **barrier option** dies if a level is touched. It also suits options on several assets and models with no formula. You then simulate every step, not only the last price. American options are awkward because the exercise decision needs the future value at each node; trees, or the regression method of Longstaff and Schwartz (2001), handle them. In practice, low-discrepancy sequences such as Sobol points (`scipy.stats.qmc` in SciPy) can replace random draws and converge faster.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Reporting a price without its standard error.',
        'Leaving out the −σ²/2, or simulating with the real drift μ instead of r.',
        'Computing the antithetic error over 2n draws as if they were independent.',
        'Trusting a tight interval on a model that leaves out dividends or skew: the interval measures only simulation noise.',
      ],
    },
  ],

  'qoptions-iv': [
    { h: 'Implied volatility as a root' },
    'The volatility module defined **implied volatility** (IV): the σ that makes the Black-Scholes price equal the market price. In numerical terms you are looking for the **root** of `f(σ) = BS(σ) − P`, the value of σ where f is zero. Because the option price rises steadily with σ, there is at most one root. There is no formula for it, so it must be found by trying values. This lesson is about doing that fast and safely, thousands of times a minute.',

    { h: 'Bisection, the safe method' },
    'The volatility lab used **bisection**: start with a bracket [lo, hi] whose ends give prices below and above P, price the middle, and keep the half that still contains the root. Each step halves the bracket, so reaching a width w from a starting width W takes about `log2(W ÷ w)` steps, rounded up.',
    {
      code: `import math

print(math.ceil(math.log2(2.0 / 0.001)))`,
      out: `11`,
    },
    'From a bracket 2 wide to a width of 0.001 takes 11 prices. Each further digit costs about 3.3 more. Bisection cannot fail as long as the bracket holds the root, which is why it is kept as the safety net.',

    { h: "Newton's method" },
    { sub: 'Following the tangent' },
    "**Newton's method** uses the slope of the curve. At the current guess, draw the tangent line to f and see where it crosses zero; that is the next guess. The slope of the option price in σ is **vega**, so the step is `σ_new = σ − (BS(σ) − P) ÷ vega(σ)`.",
    { sub: 'Units of vega' },
    'Vega must be per 1.00 of volatility, the derivative itself. Quotes of vega "per point" are 100 times smaller. Suppose at σ = 0.40 the model gives $7.20, the market $6.00, and vega is $24 per 1.00: the step is 1.20 ÷ 24 = 0.05, so the next guess is 0.35. With vega per point (0.24) you would step 5.0 and land far outside any sensible range.',
    { sub: 'How fast it closes in' },
    'Near the root the error is roughly squared at each step, so the number of correct digits about doubles: 0.01, then 0.0001, then 0.00000001.',
    {
      code: `import math
N = lambda x: 0.5 * (1 + math.erf(x / math.sqrt(2)))
def bs_call(S, K, T, r, s):
    d1 = (math.log(S / K) + (r + s * s / 2) * T) / (s * math.sqrt(T))
    return S * N(d1) - K * math.exp(-r * T) * N(d1 - s * math.sqrt(T))
def vega(S, K, T, r, s):
    d1 = (math.log(S / K) + (r + s * s / 2) * T) / (s * math.sqrt(T))
    return S * math.sqrt(T) * math.exp(-d1 * d1 / 2) / math.sqrt(2 * math.pi)
price = bs_call(50, 55, 0.5, 0.03, 0.32)
s = math.sqrt(2 * math.pi / 0.5) * price / 50
for i in range(4):
    s -= (bs_call(50, 55, 0.5, 0.03, s) - price) / vega(50, 55, 0.5, 0.03, s)
    print(i + 1, round(s, 6))`,
      out: `1 0.326329
2 0.320007
3 0.32
4 0.32`,
    },
    'The price was made at 32%, so this is a **round trip**: price, then solve, and check you get the input back. Three steps reach six decimal places.',

    { h: 'A good place to start' },
    'Near the money the call price is about `0.4 × S × σ × √T`, the rule from the volatility module. The 0.4 is 1 ÷ √(2π). Solving for σ gives the **Brenner-Subrahmanyam** starting guess `σ0 = √(2π ÷ T) × P ÷ S`. For a 1-year option at $8 on a $100 stock, σ0 = 2.507 × 0.08 ≈ 0.20. The code above used it for a slightly out-of-the-money option and was off by less than a point. Far from the money it is a poor guess, which is one reason to safeguard the solver.',

    { h: 'When Newton fails' },
    { sub: 'Flat curves' },
    'Far out of the money or close to expiry, the price barely moves with σ at low volatilities, so vega is tiny. Dividing by a tiny vega gives a huge step: the next guess can be σ = 20 or below zero, and the solver diverges.',
    { sub: 'Prices with no answer' },
    'Some prices have no implied volatility at all. With rates near zero a call cannot be worth less than its intrinsic value, nor more than the stock. In general the **no-arbitrage bounds** are `max(0, S − K × e^(−rT)) < C < S` for a call and `max(0, K × e^(−rT) − S) < P < K × e^(−rT)` for a put. A quote outside them is stale or wrong, and the right output is no number, not a forced one.',
    { sub: 'The safeguarded solver' },
    'Combine the two methods. Keep a bracket that always contains the root: after each price, move hi down if the model was too dear and lo up if it was too cheap. Take the Newton step if it lands strictly inside the bracket, and bisect if it does not. You get Newton\'s speed near the answer and bisection\'s guarantee everywhere. SciPy\'s `scipy.optimize.brentq` is a general solver of this safe kind. For IV specifically, Peter Jäckel\'s 2015 method "Let\'s Be Rational" reaches full double precision in about two steps for any input; the vollib family of Python libraries is built on it (checked in 2026).',

    { h: 'Noise in the quotes' },
    'A quote has a bid and an ask, and each has its own IV. The width in volatility points is about the spread divided by vega per point: a $0.30 spread on an option with $0.10 of vega per point is 3 points of IV. In-the-money options are mostly intrinsic value, so a cent of noise moves their IV a lot. Solve from **out-of-the-money** options and get in-the-money IVs through put-call parity, which ties a call and a put of the same strike together.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Using vega per point in the Newton step.',
        'Adding the step instead of subtracting it.',
        'Forcing an IV out of a price below intrinsic value.',
        'Reading IV changes smaller than the bid-ask width as signals.',
      ],
    },
  ],

  'qoptions-surface': [
    { h: 'From one implied volatility to a surface' },
    'Solve every option on a chain for its IV and you get a number for each strike and each expiry. Laid out on a grid, strike one way and expiry the other, they form the **volatility surface**. The volatility module showed its two slices: the **skew**, IV across strikes for one expiry, and the **term structure**, IV across expiries. A quant desk treats the whole surface as one object: it is stored each day, smoothed, checked, and used to price anything not quoted on screen.',

    { h: 'Measuring strikes' },
    'Strike in dollars does not compare across days or underlyings: a $500 strike means one thing with SPY at $480 and another with SPY at $560. Surfaces are usually drawn against **moneyness**, `ln(K ÷ F)`, where F is the **forward price**, the price for delivery at expiry implied by the stock, rates and dividends. Zero is at the money forward, negative is below. Some desks use the option\'s delta instead. Either way, today\'s surface lines up with yesterday\'s.',

    { h: 'A wrong model that stays useful' },
    'If Black-Scholes described the market, every strike and expiry would show the same IV and the surface would be flat. It is not flat, so the model is wrong about the world. It survives because it is used as a **translation**: one price maps to exactly one volatility, and back. Traders quote, compare and hedge in IV, and plug each strike\'s own σ back into Black-Scholes to get its price. The risk is to forget that the Greeks from the formula come from a model that does not hold, which matters most for far strikes and in crashes.',

    { h: 'Shapes that are not allowed' },
    'Noisy quotes and careless fitting can produce surfaces that contain free money. Three rules, stated for calls on one expiry with r = 0, catch most of them.',
    { sub: 'Prices fall with strike, but not too fast' },
    'A call with a higher strike is worth less. And a **call spread**, long the lower strike and short the higher, pays at most the gap between the strikes, so `C(K1) − C(K2) ≤ K2 − K1`. With a 50 call at $6.00 and a 55 call, the 55 call cannot be below $1.00.',
    { sub: 'Convexity and butterflies' },
    'A **butterfly** is long one call at K − h, short two at K and long one at K + h. Its payoff is zero outside the wings and rises to h at the middle strike, never negative. So its price `C(K − h) − 2C(K) + C(K + h)` can never be negative. In words, call prices are **convex** in strike: the slope from strike to strike must keep rising. With uneven strikes, compare the slopes between neighbours rather than butterflies.',
    { sub: 'Calendars and total variance' },
    'Across expiries the rule is on **total variance**, `w = σ² × T`, the variance the option carries over its whole life. At the same moneyness w must not fall as T grows; if it did, a calendar spread would gain for nothing. An inverted term structure, with near IV above far IV, is allowed as long as w still rises: a 1-month IV of 40% allows a 3-month IV as low as 40% × √(1/3) ≈ 23%, not lower.',

    { h: 'Reading the market\'s distribution' },
    'Breeden and Litzenberger (1978) showed that the butterfly holds more information. Divide its price by h² and you get the **risk-neutral density**: how much probability the market, under the pricing weights, puts on each final price per dollar (multiplied by e^(rT) when rates are not zero). The density times h is the probability of ending within the butterfly\'s band.',
    {
      code: `import numpy as np

K = np.array([40, 45, 50, 55, 60.0])
C = np.array([10.6, 6.6, 3.5, 1.6, 0.6])
h = 5.0
fly = C[:-2] - 2 * C[1:-1] + C[2:]
print(fly.round(2).tolist(), (fly / h**2).round(3).tolist(), round(float((fly / h).sum()), 2))`,
      out: `[0.9, 1.2, 0.9] [0.036, 0.048, 0.036] 0.6`,
    },
    'Three butterflies centred on 45, 50 and 55, each positive. The densities are per dollar; times the $5 spacing they give probabilities that add to 0.6 between about $42.50 and $57.50, leaving 0.4 for the wings. An index skew, with dear low strikes, produces a density with a fatter left tail than the lognormal Black-Scholes curve: the market prices crashes as more likely than the model does.',

    { h: 'Fitting a surface in practice' },
    'Raw IVs are too noisy to price from, so desks fit a smooth curve per expiry and join the expiries. Names you will meet: **SVI** (Gatheral, 2004), a five-parameter curve for total variance against moneyness; **local volatility** (Dupire, 1994), a volatility that depends on the price and the date and reproduces today\'s surface exactly; and **stochastic volatility** models such as Heston (1993), where σ itself moves randomly. They agree on today\'s quoted prices and disagree on everything else: the price of exotic options, the hedge ratios, and how the surface moves tomorrow. After fitting, check the convexity and calendar rules, and decide how to extend the surface past the last quoted strike, where there is no data.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Fitting raw in-the-money and zero-bid quotes and calling the bumps skew.',
        'Dividing a butterfly by h once instead of twice when reading a density.',
        'Checking calendars on IV instead of on total variance.',
        'Treating a fitted model as true and trusting its prices far outside the quoted strikes.',
      ],
    },
  ],

  'qoptions-hedging': [
    { h: 'Hedging in the real world' },
    'The replication argument needs a hedge adjusted continuously at no cost. A real desk adjusts a few times a day at most, and pays a spread each time. Between adjustments the hedge drifts out of date, and what is left over is the subject of this lesson. A reminder from the pricing module: **delta** is how much the option moves per $1 in the stock, **gamma** is how fast delta changes, and **theta** is the value lost per day.',

    { h: 'One step of a hedged option' },
    { sub: 'Gamma against theta' },
    'Hold a long option and short delta shares. Over one step the stock moves ΔS. The shares cancel the first-order move, so what remains is about `½ × Γ × ΔS² + θ × Δt`. The first term is always a gain for the option holder, because a square is never negative; the second is always a loss. A long hedged option is a bet that the moves will be large enough; a short one, that they will be small.',
    { sub: 'The breakeven move' },
    'The two terms cancel when ½ΓΔS² = −θΔt. Under Black-Scholes that happens at `ΔS = S × σ_i × √Δt`, a one-standard-deviation move at the implied volatility σ_i. For a $50 stock at 30% implied, hedged daily, it is 50 × 0.30 ÷ √252 ≈ $0.95.',
    {
      code: `gamma, theta = 0.08, -0.03
for move in (0.4, 0.8, 1.2):
    print(move, round(0.5 * gamma * move**2 + theta, 4))`,
      out: `0.4 -0.0236
0.8 -0.0044
1.2 0.0276`,
    },
    'With Γ = 0.08 and θ = −$0.03 a day, the breakeven is √(2 × 0.03 ÷ 0.08) ≈ $0.87. Smaller days lose, larger days win, and the gain grows with the square of the move.',

    { h: 'Realised against implied' },
    'Add the steps up to expiry. The square of a move, divided by S², averages σ_r² × Δt, where σ_r is the volatility the stock **realises**. Theta, set by the price you paid, corresponds to σ_i. The total P&L of a hedged long option is about `Σ ½ × Γ × S² × (σ_r² − σ_i²) × Δt`. If you treat ΓS² as constant, it is ½ΓS²(σ_r² − σ_i²)T: with Γ = 0.03, S = $50, σ_r = 35%, σ_i = 30% and T = 0.5, about ½ × 75 × 0.0325 × 0.5 ≈ $0.61 per share. Buy an option and hedge it, and you are long realised volatility at the implied price. That is how option traders bet on volatility without betting on direction.',

    { h: 'Hedging error' },
    { sub: 'Noise that shrinks slowly' },
    'Even when σ_r equals σ_i exactly, a discretely hedged option does not end at zero. Each step leaves a random leftover, and over N steps they add up to a spread whose standard deviation falls roughly like 1 ÷ √N. Four times as many hedges halve it: from a spread of $1.20 with 20 hedges to about $0.60 with 80.',
    { sub: 'Costs that grow fast' },
    'Every hedge crosses a bid-ask spread, so costs grow about in proportion to N. Hedging more often trades noise for cost, and past some point the cost wins. Desks usually hedge when delta drifts outside a band rather than on a clock, with narrower bands where gamma is large.',

    { h: 'The path matters' },
    'The sum weights each step by Γ × S². Gamma is largest near the strike and close to expiry. If the big moves come early, far from the strike, they hardly count; the same moves in the last week with the stock at the strike count enormously. So two paths with the same realised volatility can give very different P&L. What decides the result is the **gamma-weighted** realised volatility, not the plain number.',

    { h: 'Simulating a hedge in code' },
    'A hedging simulation keeps two numbers per path: **cash** and **shares**. Selling a call at its Black-Scholes price and buying delta shares gives `cash = premium − delta × S`. At each later time, before expiry, compute the new delta with the time left and trade the difference at the current price: `cash −= (new − shares) × S`. At expiry the P&L is `cash + shares × S − max(S − K, 0)`. Two checks: on a path that never moves the seller keeps the whole premium, and with σ_r equal to σ_i the average over many paths is near zero.',
    'The classic bug is lookahead: using the delta set after a move to earn that move, or trading at the price before the move. Either makes the hedge look perfect. The quant module showed the same bug in signals.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Thinking a delta-hedged position has no risk.',
        'Expecting zero P&L whenever realised equals implied, ignoring the path.',
        'Hedging as often as possible without counting the spread paid each time.',
        'Letting a backtest of a hedge use deltas or prices from after the move.',
      ],
    },
  ],

  'qoptions-varprem': [
    { h: 'Volatility has a price and a delivery' },
    'An option seller is paid an implied volatility and delivers, through the hedge, the volatility the market realises. The hedging lesson showed that the P&L of a hedged option is roughly the gap between the two. So implied and realised volatility can be treated like the price and the delivery of an asset, and you can ask what the asset has earned.',

    { h: 'The variance risk premium' },
    'For stock indexes, implied variance has on average been above the variance later realised. A CFA Institute blog post in 2024 compared the VIX since 1990, which averaged about 19.6, with the S&P 500 volatility realised over the following 30 days, which averaged about 15.5: implied ran roughly 4 points above, over about 35 years of data. Carr and Wu (2009), using option portfolios on five indexes and 35 stocks, found strongly negative **variance risk premiums** from the buyer\'s side, not explained by the usual factors. In variance terms, an implied 18% against a realised 14% is 0.0324 − 0.0196 = 0.0128.',
    'The reason is insurance. Index options protect portfolios, and the protection pays out in crashes, when money is worth most to the buyer. People pay more than the average payout for that. The seller collects the difference by agreeing to pay at the worst moments. These averages are dated and past premiums do not promise future ones.',

    { h: 'Variance swaps' },
    { sub: 'The payoff' },
    'A **variance swap** trades realised variance directly, with no options to hedge. At expiry the buyer receives `N_var × (σ_r² − K_var)`, with volatilities in points, so 20% counts as 20 and its square as 400 **variance points**. K_var is the strike, agreed at the start.',
    { sub: 'Vega notional' },
    'Swaps are sized by **vega notional**, roughly the dollars made per volatility point near the strike. Since a small change in σ changes σ² by about 2σ, `N_var = N_vega ÷ (2 × K_vol)`. With $5,000 of vega notional at a strike of 25, N_var = 5,000 ÷ 50 = 100.',
    { sub: 'Convexity' },
    'Realised 30 pays the buyer 100 × (900 − 625) = $27,500; realised 20 costs him 100 × (400 − 625) = $22,500. Five points up gains more than five points down loses, because the payoff is in variance. For the seller it is the other way: limited gains when markets are calm, losses that grow with the square of a spike.',

    { h: 'Selling volatility and its tail' },
    'A strategy that sells volatility month after month, through swaps, strangles or short VIX futures, shows many small gains and occasional large losses. In a sample without a crisis it looks like a steady income with a high Sharpe ratio. On 5 February 2018 the VIX closed at 37.32 after 17.31 the previous trading day, a rise of about 116% and its largest one-day percentage rise. Exchange-traded notes that were short VIX futures collapsed; Credit Suisse terminated its XIV note after its value fell more than 80% in a day. Years of gains went in an afternoon.',
    'The premium also shows in **VIX futures**. In calm markets they usually trade above the VIX and drift down to it as they expire. With the VIX at 14 and the next future at 16, a long future loses 14 ÷ 16 − 1 = 12.5% in a month if the VIX does not move. Short volatility products collect that drift until a spike reverses it.',

    { h: 'The VIX in outline' },
    'The VIX is not the IV of one option. In Cboe\'s methodology, as described at the time of writing (2026), it is the square root of a 30-day variance computed from a whole strip of out-of-the-money SPX options, using expiries with more than 23 and fewer than 37 days left, interpolated to 30 days. For each expiry, `σ² = (2 ÷ T) × Σ (ΔK ÷ K²) × e^(rT) × Q(K) − (1 ÷ T) × (F ÷ K0 − 1)²`. Q(K) is the mid price of the out-of-the-money option at strike K, puts below the forward F and calls above, with both averaged at K0, the first strike at or below F. ΔK is half the gap between the strikes either side, and at the ends the gap to the one neighbour. The last term corrects for K0 not sitting exactly at F.',
    {
      code: `import math
import numpy as np

K = np.array([80, 90, 100, 110, 120.0])
Q = np.array([0.10, 0.45, 1.60, 0.35, 0.05])
dK = np.full(5, 10.0)
T = 30 / 365
var = 2 / T * np.sum(dK / K**2 * Q)
print(round(100 * math.sqrt(var), 1))`,
      out: `25.3`,
    },
    'A toy strip with the forward exactly at 100, so the correction term is zero. The 1/K² weights make low strikes count more than high ones, so a dear put skew lifts the VIX above the at-the-money IV. The real index uses hundreds of strikes; with only five, the result depends a lot on the spacing.',

    { h: 'Sizing a short volatility position' },
    'Size by the loss in a stress scenario, never by the average month: for example the index down 20% with implied volatility doubled overnight, as in 1987, 2008, 2018 and 2020. Margin requirements rise in exactly those moments and can force a sale near the worst price. Buying wings to define the risk costs part of the premium and keeps the account alive to collect the rest.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Reading a high win rate as low risk.',
        'Sizing from a backtest that contains no crisis.',
        'Thinking you can own the VIX; you can own futures and products built on them, which behave differently.',
        'Treating the premium as free money instead of payment for crash risk.',
      ],
    },
  ],

  'qoptions-lab': [
    { h: 'What the lab builds' },
    'The lab builds a small option pricing library in Python and NumPy: Black-Scholes, a binomial tree for any payoff, Monte Carlo with a confidence interval, a safe implied volatility solver for calls and puts, and a delta hedging simulation. Every part is tested against another part or a known answer. That is how pricing code is trusted in practice: no single method is assumed right, but agreement between independent methods makes a shared bug unlikely. All data is made up or drawn from fixed seeds.',

    { h: 'Black-Scholes as the reference' },
    { sub: 'Calls and puts' },
    'Black-Scholes gives exact prices for European options on a stock without dividends, so it is the yardstick for the others. With `N(x) = 0.5 × (1 + erf(x ÷ √2))` from `math.erf`, the call is `S × N(d1) − K × e^(−rT) × N(d2)` and the put `K × e^(−rT) × N(−d2) − S × N(−d1)`, as in the pricing module.',
    { sub: 'Put-call parity as a test' },
    '**Put-call parity**, `C − P = S − K × e^(−rT)`, holds whatever the volatility. Checking it on several strikes tests the discounting and the signs without needing to know the right price at all.',

    { h: 'A tree for any payoff' },
    'A tree only needs to know what the option pays at a node. Pass that as a function, `payoff(prices, K)`, and one tree prices calls, puts, or anything else that depends on the price alone. Python treats functions as values, so `tree_price(..., put, True)` hands the tree the put rule and asks for early exercise.',
    'A **digital call** pays $1 if the stock ends above the strike and nothing otherwise. Its price is the discounted risk-neutral chance of ending above the strike, `e^(−rT) × N(d2)`, a direct view of the weights q.',
    {
      code: `import math

N = lambda x: 0.5 * (1 + math.erf(x / math.sqrt(2)))
S, K, T, r, s = 100.0, 100.0, 1.0, 0.02, 0.25
d2 = (math.log(S / K) + (r - s * s / 2) * T) / (s * math.sqrt(T))
print(round(math.exp(-r * T) * N(d2), 4))`,
      out: `0.4725`,
    },
    'Under the pricing weights the stock ends above the strike less than half the time, even with a positive rate, because the −σ²/2 pulls the median of a lognormal price below its mean. A tree with a digital payoff should give nearly the same number.',

    { h: 'Monte Carlo with an honest interval' },
    'The Monte Carlo step returns three numbers: the price and the two ends of its 95% interval, built from antithetic pairs. An interval can be tested in two ways. Black-Scholes should fall inside it. And over many seeds, about 95% of the intervals should contain the true price: with 40 seeds, about 38. Far fewer means the standard error is too small, for example computed over all draws instead of over pairs; all 40 every time, with wide intervals, suggests it is too large.',

    { h: 'A solver for calls and puts' },
    'The safeguarded solver from the lesson extends to puts with their own bounds: a European put is worth more than `max(0, K × e^(−rT) − S)` and less than `K × e^(−rT)`. Inside those bounds the put price also rises with σ, so the same bracket-and-Newton loop works for both. Test it with round trips on calls and puts, on a far out-of-the-money option with a short expiry where plain Newton fails, and on impossible prices where it should return None.',

    { h: 'Simulating the hedge' },
    { sub: 'Many paths at once' },
    'The hedging simulation runs all paths together as NumPy arrays: one array of prices, one of cash and one of shares, updated a step at a time. `math.erf` works on one number, so `np.vectorize(math.erf)` wraps it to work element by element on an array. It is slower than a true NumPy function but fine for a few thousand paths.',
    { sub: 'What to expect' },
    'Three results should appear. With realised volatility equal to implied, the average P&L is near zero. Sell at 20% when the stock realises 15% and the average gain is close to vega times the 5-point gap; realise 25% instead and you lose about as much. And cutting the number of hedges to a quarter roughly doubles the spread of P&L. Trading at the price before the move, instead of the price after, breaks all three.',

    { h: 'What a real pricer adds' },
    {
      list: [
        'Dividends and a proper forward price for each expiry.',
        'A volatility surface instead of one σ.',
        'Edge cases: expiry close to zero, tiny σ, very deep strikes.',
        'Comparison against an independent library on many random inputs.',
        'Written assumptions, so users know what the number leaves out.',
      ],
    },
  ],
}
