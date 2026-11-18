import type { Module } from '../types'

export const qoptions: Module = {
  id: 'qoptions',
  title: 'Options for quants',
  summary:
    'How option prices are computed rather than looked up: replication and risk-neutral pricing, binomial trees and early exercise, Monte Carlo with error bars, implied volatility solvers, the volatility surface and its no-arbitrage shape, delta hedging in discrete time, and volatility as an asset, all in NumPy.',
  lessons: [
    {
      id: 'qoptions-replication',
      title: 'Black-Scholes as an argument',
      summary: 'Copying an option with shares and cash, why the drift of the stock drops out, and what risk-neutral pricing means.',
      text: [
        'The pricing module gave the Black-Scholes formula as a result. Here is the argument behind it. Take a stock at $100 that will be at $120 or $80 in one period, and a call struck at $100, worth $20 or $0 at the end. Buy 0.5 shares and borrow $40: the pair is worth 0.5 × 120 − 40 = $20 in the up state and 0.5 × 80 − 40 = $0 in the down state. It pays exactly what the call pays, so with no interest the call must cost what the pair costs: 0.5 × 100 − 40 = **$10**. Any other price is an **arbitrage**, a riskless profit from buying the cheap one and selling the dear one.',
        'The number of shares is the **hedge ratio**, `(Vu − Vd) ÷ (Su − Sd)`: the change in the option over the change in the stock. It is delta, seen in one step. The chance of the up move never entered the sum. Two traders who disagree about where the stock is going must still agree on the price of the call, because both can build it from shares and cash.',
        'The same price comes from a shortcut. Find the probability q that makes the stock earn the risk-free rate on average: `q = (S0 × (1 + r) − Sd) ÷ (Su − Sd)`. Price the option as its average payoff under q, discounted at r. This is **risk-neutral pricing**. q is not a forecast; it is a set of weights that reproduces the replication price.',
        { code: `S0, Su, Sd, r = 100.0, 120.0, 80.0, 0.0
pay_u, pay_d = 20.0, 0.0
q = (S0 * (1 + r) - Sd) / (Su - Sd)               # 0.5
price = (q * pay_u + (1 - q) * pay_d) / (1 + r)   # 10.0` },
        'Shrink the period to an instant and keep rebalancing. A portfolio of one option and −Δ shares then has no random part over the next instant, so it must earn the risk-free rate. Written out, that is the Black-Scholes equation: `θ + ½σ²S²Γ + rSΔ − rV = 0`. The expected return of the stock appears nowhere, which is why the formula needs σ and r but not your view.',
        'The argument is only as good as its assumptions: you can trade continuously, without costs, the volatility is known, and the price moves without jumps. With three possible outcomes and only two instruments, or with a gap overnight, the copy is no longer exact and the price is a range, not a number. Market makers live in that range and charge for the risk they cannot hedge.',
      ],
      rules: [
        'Hedge ratio = (Vu − Vd) ÷ (Su − Sd); the option costs what its copy costs.',
        'The real chance of each move does not enter the price.',
        'Risk-neutral q = (S0 × (1 + r) − Sd) ÷ (Su − Sd). It is a weight, not a forecast.',
        'Price = average payoff under q, discounted at the risk-free rate.',
        'Black-Scholes equation: θ + ½σ²S²Γ + rSΔ − rV = 0. No μ in it.',
        'Jumps, costs and unknown volatility break the copy: then the price is a range.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'qoptions-replication-1',
          ask: 'A stock is at $50 and will be at $60 or $45 after one period. How many shares replicate one call struck at $50? Give a decimal to 3 places.',
          answer: 0.667,
          tol: 0.002,
          check: '(10 - 0) / (60 - 45)',
          why: 'The call pays $10 or $0. The hedge ratio is the change in the option over the change in the stock: 10 ÷ 15 ≈ 0.667 shares.',
        },
        {
          kind: 'number',
          id: 'qoptions-replication-2',
          ask: 'Same stock ($50 going to $60 or $45), same call struck at $50, interest rate zero. What is the call worth today, in dollars, to 2 decimal places?',
          answer: 3.33,
          tol: 0.006,
          check: '(10 / 15) * 50 - (10 / 15) * 45',
          hint: 'Hold 2/3 of a share and borrow enough that the portfolio is worth $0 in the down state.',
          why: 'Hold 2/3 of a share and borrow 2/3 × 45 = $30. The copy costs 2/3 × 50 − 30 = $3.33. The risk-neutral route agrees: q = (50 − 45) ÷ 15 = 1/3, and 1/3 × $10 = $3.33.',
        },
        {
          kind: 'choice',
          id: 'qoptions-replication-3',
          ask: 'In the same one-step tree, an analyst is sure the stock has a 90% chance of going up. What does that do to the price of the call?',
          options: [
            'It raises the price: the call is more likely to pay',
            'Nothing: the call can be copied with shares and cash, and the copy does not depend on the chance of an up move',
            'It lowers the price, because the stock is already expensive',
            'The price becomes 0.9 × $10 = $9',
          ],
          answer: 1,
          why: 'If the call traded above the cost of its copy, you would sell the call and buy the copy, with no risk whatever the stock does. The view on direction is already in the stock price; the option price follows from it.',
        },
        {
          kind: 'number',
          id: 'qoptions-replication-4',
          ask: 'A stock at $100 will be at $110 or $90 after one period, and cash earns 2% over the period. What is the risk-neutral probability q of the up move? Give a decimal.',
          answer: 0.6,
          tol: 0.001,
          check: '(100 * 1.02 - 90) / (110 - 90)',
          why: 'q = (102 − 90) ÷ 20 = 0.6. Under q the stock earns exactly the 2% that cash earns: 0.6 × 110 + 0.4 × 90 = 102.',
        },
        {
          kind: 'number',
          id: 'qoptions-replication-5',
          ask: 'Same tree ($100 to $110 or $90, 2% per period). What is a put struck at $100 worth today? Dollars, 2 decimal places.',
          answer: 3.92,
          tol: 0.006,
          check: '(0.4 * 10) / 1.02',
          why: 'The put pays $0 up and $10 down. Weighted by q = 0.6: 0.4 × 10 = 4, discounted by 1.02 gives $3.92. The same q prices every option on this stock in this tree.',
        },
        {
          kind: 'output',
          id: 'qoptions-replication-6',
          ask: 'Replication and risk-neutral pricing side by side, with a 5% rate over the period. What does this print?',
          code: `S0, Su, Sd, K, r = 100.0, 120.0, 80.0, 100.0, 0.05
cu, cd = max(Su - K, 0), max(Sd - K, 0)
shares = (cu - cd) / (Su - Sd)
cash = (cu - shares * Su) / (1 + r)
q = (S0 * (1 + r) - Sd) / (Su - Sd)
print(shares, round(shares * S0 + cash, 2), round((q * cu + (1 - q) * cd) / (1 + r), 2))`,
          answer: '0.5 11.9 11.9',
          why: 'Half a share and a loan of 40 ÷ 1.05 = $38.10 cost $11.90; q = (105 − 80) ÷ 40 = 0.625 and 0.625 × 20 ÷ 1.05 = $11.90. The two routes always agree, which makes one a check on the other. A positive rate makes the loan cheaper today and so lifts the call.',
        },
        {
          kind: 'bug',
          id: 'qoptions-replication-7',
          ask: 'This should price any payoff in a one-step tree. With r = 5% it prices the call struck at $100 in the $120 or $80 tree at $9.52 instead of $11.90. Which line is wrong?',
          code: `def risk_neutral_price(S0, Su, Sd, pay_u, pay_d, r):
    q = (S0 - Sd) / (Su - Sd)
    return (q * pay_u + (1 - q) * pay_d) / (1 + r)`,
          line: 2,
          fix: '    q = (S0 * (1 + r) - Sd) / (Su - Sd)',
          why: 'Under q the stock must grow at the risk-free rate, so the target is S0 × (1 + r), not S0. Leaving out the growth while still discounting the payoff makes calls too cheap and puts too dear.',
        },
        {
          kind: 'number',
          id: 'qoptions-replication-8',
          ask: 'With r = 0, the Black-Scholes equation becomes θ = −½σ²S²Γ. A stock is at $100, σ = 20% and an option on it has Γ = 0.02. What is its theta per year, in dollars?',
          answer: -4,
          tol: 0.01,
          check: '-0.5 * 0.2 ** 2 * 100 ** 2 * 0.02',
          why: '−0.5 × 0.04 × 10,000 × 0.02 = −4 dollars a year, about 1.6 cents a trading day. The equation ties theta to gamma: an option that gains from movement must lose to time at a matching rate, or the hedged position would be a free lunch.',
        },
        {
          kind: 'choice',
          id: 'qoptions-replication-9',
          ask: 'Why does the Black-Scholes formula contain the risk-free rate but not the expected return of the stock?',
          options: [
            'Because Black and Scholes assumed that investors do not care about risk',
            'Because a continuously rebalanced hedge removes all exposure to the stock, and a riskless position must earn the risk-free rate',
            'Because the expected return of a stock is always equal to the risk-free rate',
            'Because the expected return is hidden inside σ',
          ],
          answer: 1,
          why: 'The drift cancels out of the hedged position, so it cancels out of the price. Investors can be as risk-averse as they like; the stock still drifts at μ in the real world. Risk-neutral is a pricing device, not a claim about people.',
        },
        {
          kind: 'choice',
          id: 'qoptions-replication-10',
          ask: 'Now the stock at $100 can end at $120, $100 or $80, and you can trade only the stock and cash. What can you say about the price of a call struck at $100?',
          options: [
            'It is still unique: average the three payoffs',
            'Two instruments cannot copy a payoff over three outcomes, so no-arbitrage gives a range of prices, not one',
            'It is zero, because the middle outcome pays nothing',
            'It equals the one-step price with $120 and $80',
          ],
          answer: 1,
          why: 'With more outcomes than instruments the market is **incomplete**. Jumps and changing volatility do the same to real options: the hedge leaves a risk, and the price depends on how much the seller charges for carrying it.',
        },
        {
          kind: 'write',
          id: 'qoptions-replication-11',
          ask: 'Write `replicate(S0, Su, Sd, pay_u, pay_d, r)`: return `(shares, cash, price)`, where shares × Su + cash × (1 + r) = pay_u, shares × Sd + cash × (1 + r) = pay_d, and price = shares × S0 + cash. Cash is negative when you borrow.',
          starter: `def replicate(S0, Su, Sd, pay_u, pay_d, r):
    # (shares, cash, price)
    pass`,
          solution: `def replicate(S0, Su, Sd, pay_u, pay_d, r):
    shares = (pay_u - pay_d) / (Su - Sd)
    cash = (pay_u - shares * Su) / (1 + r)
    return shares, cash, shares * S0 + cash`,
          tests: `out = replicate(100.0, 120.0, 80.0, 20.0, 0.0, 0.0)
assert out is not None, "the function returns nothing yet"
sh, cash, price = out
assert abs(sh - 0.5) < 1e-12, f"hedge ratio (20 - 0) / (120 - 80) = 0.5, got {sh}"
assert abs(cash + 40) < 1e-12, f"borrow 40 so the copy is worth 0 in the down state, got cash = {cash}"
assert abs(price - 10) < 1e-12, f"the copy costs 0.5 x 100 - 40 = 10, got {price}"
sh, cash, price = replicate(100.0, 110.0, 90.0, 0.0, 10.0, 0.02)
assert abs(sh + 0.5) < 1e-12, f"a put is copied with a short position in the stock: -0.5 shares, got {sh}"
assert abs(price - 4 / 1.02) < 1e-9, f"the put is worth 0.4 x 10 / 1.02 = 3.92, got {price}"
assert abs(sh * 90 + cash * 1.02 - 10) < 1e-9, "the copy must pay 10 in the down state"`,
          why: 'Two equations, two unknowns. A put comes out with negative shares and positive cash: you short the stock and lend. That sign is the put delta you met in the pricing module.',
        },
        {
          kind: 'design',
          id: 'qoptions-replication-12',
          ask: 'A colleague expects a stock to rise 30% this year and argues that its calls are therefore worth more than Black-Scholes says, so the desk should buy them. How do you answer?',
          checklist: [
            { point: 'The option price follows from the stock price and the cost of hedging, not from a forecast of direction', why: 'Anyone can copy the call with shares and cash; the view is already in the stock price.' },
            { point: 'If the view is right, buying the stock (or a delta of it) expresses it more directly', why: 'A call adds a bet on volatility and pays for time decay; the view is about direction.' },
            { point: 'A call can be cheap or dear only through its implied volatility', why: 'Mispricing means the implied volatility differs from the volatility you expect, which is a different claim.' },
            { point: 'Ask for the evidence behind the 30% and how often such views have been right', why: 'A forecast of direction is the part most likely to be noise.' },
            { point: 'Size the trade so that a total loss of the premium is acceptable', why: 'A bought call can expire worthless even if the stock rises, if it rises too little or too late.' },
          ],
          why: 'Separate the two bets: direction belongs to the stock, the option adds volatility and time. Knowing which one you are taking is the first use of the replication argument.',
        },
      ],
    },
    {
      id: 'qoptions-binomial',
      title: 'Binomial trees and American options',
      summary: 'Building a tree that matches a volatility, pricing by working backwards, and checking for early exercise at every node.',
      widget: 'qoptions-tree',
      text: [
        'Repeat the one-step argument many times and you have a **binomial tree**. Split time T into N steps of `Δt = T ÷ N`. The Cox-Ross-Rubinstein (1979) choice matches a volatility σ: each step the price is multiplied by `u = e^(σ√Δt)` or by `d = 1 ÷ u`, and the risk-neutral probability is `q = (e^(rΔt) − d) ÷ (u − d)`. After N steps, j of them up, the price is `S0 × u^j × d^(N−j)`.',
        'Price by **backward induction**. At the last step the option is worth its payoff. One step earlier each node is worth the discounted q-average of its two children, `e^(−rΔt) × (q × V_up + (1 − q) × V_down)`. Repeat until you reach today. In NumPy each step is one line on a whole row of nodes.',
        { code: `import math, numpy as np

def crr_call(S, K, T, r, sigma, N):
    dt = T / N
    u = math.exp(sigma * math.sqrt(dt)); d = 1 / u
    q = (math.exp(r * dt) - d) / (u - d)
    j = np.arange(N + 1)
    V = np.maximum(S * u**j * d**(N - j) - K, 0)     # payoffs at expiry
    for _ in range(N):
        V = math.exp(-r * dt) * (q * V[1:] + (1 - q) * V[:-1])
    return V[0]` },
        'As N grows the tree price converges to Black-Scholes, with an error of order 1 ÷ N that zigzags between even and odd N because the strike falls on or between nodes. Averaging N and N + 1 cancels much of the zigzag. A few hundred steps give cents.',
        'The tree earns its keep on **American** options, which can be exercised any day. At each node, take the larger of holding on (the discounted average) and exercising now (the intrinsic value). An American call on a stock with no dividends is never worth exercising early: it is always worth at least `S − K × e^(−rT)`, more than the `S − K` you would get. An American put can be: deep in the money, taking K now and earning interest on it beats waiting. Dividends change the call case, because exercising the day before the ex-dividend date captures the dividend. SPY options are American; SPX options are European.',
      ],
      rules: [
        'CRR: u = e^(σ√Δt), d = 1 ÷ u, q = (e^(rΔt) − d) ÷ (u − d).',
        'Work backwards: node value = e^(−rΔt) × (q × V_up + (1 − q) × V_down).',
        'American: at every node take the larger of holding and exercising.',
        'No dividends: never exercise an American call early. Puts are different.',
        'Tree error shrinks like 1 ÷ N and zigzags; average N and N + 1.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'qoptions-binomial-1',
          ask: 'A CRR tree with monthly steps (Δt = 1/12) for a stock with σ = 20%. What is the up factor u? Give 4 decimal places.',
          answer: 1.0594,
          tol: 0.00006,
          check: 'math.exp(0.2 * math.sqrt(1 / 12))',
          why: 'u = e^(0.2 × 0.2887) = e^0.0577 ≈ 1.0594, so each step moves the price about 6% up or down. The size of the step comes from σ√Δt, the volatility of one step.',
        },
        {
          kind: 'number',
          id: 'qoptions-binomial-2',
          ask: 'Same tree (u = e^(0.2 × √(1/12)), d = 1/u) with r = 5% a year. What is the risk-neutral probability q of an up step? Give 4 decimal places.',
          answer: 0.5217,
          tol: 0.00006,
          check: '(math.exp(0.05 / 12) - math.exp(-0.2 * math.sqrt(1 / 12))) / (math.exp(0.2 * math.sqrt(1 / 12)) - math.exp(-0.2 * math.sqrt(1 / 12)))',
          why: 'q = (e^(0.05/12) − d) ÷ (u − d) ≈ 0.5217. It sits a little above one half because the stock must earn the risk-free rate on average and the down step is slightly smaller in dollars than the up step.',
        },
        {
          kind: 'number',
          id: 'qoptions-binomial-3',
          ask: 'A two-step tree: the stock starts at $100 and each step multiplies it by 1.1 or 0.9, with r = 0. What is a European call struck at $100 worth? Dollars, 2 decimal places.',
          answer: 5.25,
          tol: 0.006,
          check: '0.5 * 0.5 * (121 - 100)',
          hint: 'With r = 0, q = (1 − 0.9) ÷ (1.1 − 0.9).',
          why: 'q = 0.5. The final prices are 121, 99 and 81; only 121 pays, $21. The chance of two up steps under q is 0.25, so the call is worth 0.25 × 21 = $5.25.',
        },
        {
          kind: 'number',
          id: 'qoptions-binomial-4',
          ask: 'A two-step tree: the stock starts at $100, each step multiplies it by 1.1 or 0.9, and cash grows by 5% per step, so q = 0.75. A put struck at $100 held to the end is worth $5.24 at the down node ($90). If the put is American, what is it worth at that node? Dollars.',
          answer: 10,
          tol: 0.01,
          check: 'max(5.238, 100 - 90)',
          why: 'Exercising at $90 gives $10 now, more than the $5.24 from holding on. The American put takes the larger, $10, and that higher value feeds back to today: $2.55 against $1.42 for the European put in this tree.',
        },
        {
          kind: 'choice',
          id: 'qoptions-binomial-5',
          ask: 'You price an American call on a stock that pays no dividends with a tree, and check every node. Where does early exercise beat holding?',
          options: [
            'At deep in-the-money nodes close to expiry',
            'Nowhere: the call is always worth at least S − K × e^(−rT), which is more than S − K',
            'At every node where S > K',
            'Only when volatility is high',
          ],
          answer: 1,
          why: 'Exercising throws away the remaining time value and pays the strike early, losing the interest on it. With no dividend to capture, holding (or selling the call) always does better, so the American call is worth the same as the European one.',
        },
        {
          kind: 'output',
          id: 'qoptions-binomial-6',
          ask: 'The CRR tree for a 1-year at-the-money call (S = K = 100, r = 5%, σ = 20%). Black-Scholes gives 10.4506. What does this print?',
          code: `import math, numpy as np

def crr_call(S, K, T, r, sigma, N):
    dt = T / N
    u = math.exp(sigma * math.sqrt(dt)); d = 1 / u
    q = (math.exp(r * dt) - d) / (u - d)
    j = np.arange(N + 1)
    V = np.maximum(S * u**j * d**(N - j) - K, 0)
    for _ in range(N):
        V = math.exp(-r * dt) * (q * V[1:] + (1 - q) * V[:-1])
    return V[0]

print([round(float(crr_call(100, 100, 1, 0.05, 0.2, n)), 2) for n in (10, 11, 500)])`,
          answer: '[10.25, 10.61, 10.45]',
          why: 'Ten steps is 20 cents low, eleven is 16 cents high: the zigzag between even and odd N. Five hundred steps land on 10.45. Averaging the 10 and 11 step prices gives 10.43, already close.',
        },
        {
          kind: 'bug',
          id: 'qoptions-binomial-7',
          ask: 'This should price an American put on a tree. It returns the European price instead. Which line is wrong?',
          code: `import math, numpy as np

def american_put(S, K, T, r, sigma, N):
    dt = T / N
    u = math.exp(sigma * math.sqrt(dt)); d = 1 / u
    q = (math.exp(r * dt) - d) / (u - d)
    V = np.maximum(K - S * u**np.arange(N + 1) * d**(N - np.arange(N + 1)), 0)
    for i in range(N - 1, -1, -1):
        j = np.arange(i + 1)
        V = math.exp(-r * dt) * (q * V[1:] + (1 - q) * V[:-1])
        V = np.maximum(V, 0)
    return V[0]`,
          line: 11,
          fix: '        V = np.maximum(V, K - S * u**j * d**(i - j))',
          why: 'At each node the holder compares holding with exercising, and exercising a put pays K − S at that node. Comparing with 0 changes nothing, because the held value is never negative. The node prices at step i are S × u^j × d^(i−j).',
        },
        {
          kind: 'choice',
          id: 'qoptions-binomial-8',
          ask: 'In the figure, choose the European call and move the steps from 10 to 11 to 12. What happens to the tree price?',
          options: [
            'It rises steadily towards Black-Scholes',
            'It jumps above and below the Black-Scholes line in turn, and the jumps shrink as the steps grow',
            'It stays exactly on the Black-Scholes line for any number of steps',
            'It moves away from Black-Scholes as the steps grow',
          ],
          answer: 1,
          why: 'Whether the strike lands on a node or between two depends on whether N is even or odd, so the error flips sign. The size of the error falls roughly like 1 ÷ N. When you test a tree, test it at several N, never at one.',
        },
        {
          kind: 'write',
          id: 'qoptions-binomial-9',
          numpy: true,
          ask: 'Write `crr(S, K, T, r, sigma, N, kind, american)`: a CRR tree price for `kind` "call" or "put", with early exercise at every node when `american` is True.',
          starter: `import math
import numpy as np

def crr(S, K, T, r, sigma, N, kind="call", american=False):
    pass`,
          solution: `import math
import numpy as np

def crr(S, K, T, r, sigma, N, kind="call", american=False):
    dt = T / N
    u = math.exp(sigma * math.sqrt(dt))
    d = 1 / u
    q = (math.exp(r * dt) - d) / (u - d)
    disc = math.exp(-r * dt)
    def pay(x):
        return np.maximum(x - K, 0) if kind == "call" else np.maximum(K - x, 0)
    j = np.arange(N + 1)
    V = pay(S * u**j * d**(N - j))
    for i in range(N - 1, -1, -1):
        V = disc * (q * V[1:] + (1 - q) * V[:-1])
        if american:
            j = np.arange(i + 1)
            V = np.maximum(V, pay(S * u**j * d**(i - j)))
    return float(V[0])`,
          tests: `out = crr(100, 100, 1, 0.05, 0.2, 200)
assert out is not None, "the function returns nothing yet"
assert abs(out - 10.4506) < 0.03, f"a European call should be close to Black-Scholes 10.4506, got {out:.4f}"
eu = crr(100, 100, 1, 0.05, 0.2, 200, "put")
assert abs(eu - 5.5735) < 0.03, f"a European put should be close to Black-Scholes 5.5735, got {eu:.4f}"
am = crr(100, 100, 1, 0.05, 0.2, 200, "put", True)
assert am > eu + 0.4, f"an American put is worth more than the European one (about 6.09), got {am:.4f}"
assert abs(crr(100, 100, 1, 0.05, 0.2, 200, "call", True) - out) < 1e-9, "with no dividends, the American call equals the European call"
deep = crr(100, 150, 1, 0.05, 0.2, 100, "put", True)
assert abs(deep - 50) < 1e-9, f"a put 50 dollars in the money is exercised at once: worth 50, got {deep}"`,
          why: 'The only American line is the `np.maximum` with the exercise value. The deep in-the-money put shows it working: waiting earns nothing worth having, so the holder takes $50 today and earns interest on it.',
        },
        {
          kind: 'number',
          id: 'qoptions-binomial-10',
          ask: 'A tree prices an at-the-money call at $4.12 with 100 steps and $4.20 with 101 steps. What is the average of the two, the simple fix for the zigzag? Dollars, 2 decimal places.',
          answer: 4.16,
          tol: 0.006,
          check: '(4.12 + 4.20) / 2',
          why: 'Even and odd step counts err on opposite sides, so their average is usually much closer than either. It costs one extra tree.',
        },
        {
          kind: 'design',
          id: 'qoptions-binomial-11',
          ask: 'You need fair values for American puts on SPY, a dividend-paying ETF, for a backtest across many strikes and days. How do you build and check the pricer?',
          checklist: [
            { point: 'Use a tree with early exercise at every node rather than Black-Scholes', why: 'Black-Scholes is for European options; it undervalues deep in-the-money American puts.' },
            { point: 'Model the dividends: known cash amounts on known ex-dates, dropping the stock at those nodes', why: 'Dividends lower the stock and change both the put value and the early exercise boundary.' },
            { point: 'Test the tree against Black-Scholes on European options with no dividends', why: 'A known answer catches errors in u, d, q and discounting before you trust the American part.' },
            { point: 'Check convergence at several N and average N and N + 1', why: 'One step count can hide the zigzag; prices must settle as N grows.' },
            { point: 'Use the implied volatility of each strike and expiry, not one number', why: 'The surface differs by strike; one σ misprices the wings.' },
            { point: 'Check sanity bounds: the American put is at least K − S and at least the European put', why: 'A price below intrinsic value means a bug.' },
            { point: 'Time it: the tree runs once per option per day', why: 'Thousands of options a day need a vectorised tree or fewer steps with averaging.' },
          ],
          why: 'A pricer is a piece of software with known answers in special cases. Test it against them before putting its numbers into a backtest that will be believed.',
        },
      ],
    },
    {
      id: 'qoptions-montecarlo',
      title: 'Monte Carlo pricing',
      summary: 'Simulating the stock under the risk-neutral rules, averaging payoffs, and putting an error bar on the answer.',
      widget: 'qoptions-mc',
      text: [
        'Risk-neutral pricing says: price = discounted average payoff under q. **Monte Carlo** takes that literally. Under Black-Scholes the stock follows **geometric Brownian motion**, and its price at T is `S_T = S0 × e^((r − σ²/2)T + σ√T × Z)` with Z a standard normal draw. The −σ²/2 makes the average of S_T equal S0 × e^(rT), as risk-neutral rules require. Draw many Z, compute each payoff, average, discount.',
        { code: `import numpy as np

rng = np.random.default_rng(0)
z = rng.standard_normal(100_000)
ST = S0 * np.exp((r - 0.5 * sigma**2) * T + sigma * np.sqrt(T) * z)
pay = np.exp(-r * T) * np.maximum(ST - K, 0)
price, se = pay.mean(), pay.std(ddof=1) / np.sqrt(len(pay))` },
        'A Monte Carlo price is an estimate, so report it with its **standard error**, `sd ÷ √n`, and a 95% interval of about ±1.96 standard errors. The error shrinks with √n: four times the paths halve it, a hundred times cut it by ten. That is slow, and why the two tricks below matter.',
        '**Antithetic variates**: for every Z also use −Z and average each pair. For a payoff that rises with the stock the two halves err in opposite directions and partly cancel. Compute the standard error from the n pair averages, not from 2n draws, because the halves of a pair are not independent. **Control variates**: simulate something whose true mean you know, such as the discounted S_T (mean S0), and correct the estimate by β × (its simulated mean − S0), with `β = cov(payoff, control) ÷ var(control)`. With correlation ρ the variance falls by a factor `1 − ρ²`.',
        'For a plain European option Monte Carlo is a slow way to get Black-Scholes; use it as a check. It is the tool when the payoff depends on the path (an Asian option on the average price, a barrier that knocks out), when there are many underlyings, or when the model has no formula. American options are hard for it: the tree, or a regression method such as Longstaff-Schwartz (2001), handles early exercise.',
      ],
      rules: [
        'S_T = S0 × e^((r − σ²/2)T + σ√T × Z) under risk-neutral rules.',
        'Price = e^(−rT) × mean payoff. Always report the standard error, sd ÷ √n.',
        '95% interval ≈ ±1.96 standard errors. 4× the paths halves the error.',
        'Antithetic: pair Z with −Z; take the standard error over pair averages.',
        'Control variate: variance falls by 1 − ρ² for correlation ρ with the control.',
        'Use Monte Carlo for path dependence and many assets; trees for early exercise.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'qoptions-montecarlo-1',
          ask: 'A Monte Carlo run uses 10,000 paths, and the discounted payoffs have a standard deviation of $15. What is the standard error of the price, in dollars?',
          answer: 0.15,
          tol: 0.001,
          check: '15 / math.sqrt(10000)',
          why: '15 ÷ √10,000 = 15 ÷ 100 = $0.15. The price is known to about ±30 cents at 95%, which may be wider than the bid-ask spread you care about.',
        },
        {
          kind: 'number',
          id: 'qoptions-montecarlo-2',
          ask: 'With 10,000 paths the standard error is $0.15. How many paths do you need for a standard error of $0.03?',
          answer: 250000,
          tol: 1,
          check: '10000 * (0.15 / 0.03) ** 2',
          why: 'The error falls with √n. Cutting it by 5 needs 5² = 25 times the paths: 250,000. Variance reduction is cheaper than brute force.',
        },
        {
          kind: 'number',
          id: 'qoptions-montecarlo-3',
          ask: 'A Monte Carlo price is $6.20 with a standard error of $0.04. What is the half-width of the 95% interval, in dollars, to 3 decimal places?',
          answer: 0.078,
          tol: 0.0006,
          check: '1.96 * 0.04',
          why: '1.96 × 0.04 ≈ $0.078, so the interval is about $6.12 to $6.28. If Black-Scholes, or a known answer, falls far outside it, suspect the code, not bad luck.',
        },
        {
          kind: 'output',
          id: 'qoptions-montecarlo-4',
          ask: 'A check every Monte Carlo pricer should pass. What does this print?',
          code: `import numpy as np

rng = np.random.default_rng(0)
S0, r, sigma, T = 100.0, 0.05, 0.2, 1.0
z = rng.standard_normal(400_000)
ST = S0 * np.exp((r - 0.5 * sigma**2) * T + sigma * np.sqrt(T) * z)
print(round(float(ST.mean() * np.exp(-r * T)), 1))`,
          answer: '100.0',
          why: "Under risk-neutral rules the discounted stock price averages to today's price. If this check fails, the drift is wrong (μ instead of r, or the −σ²/2 left out) and every option price from the code is wrong too.",
        },
        {
          kind: 'bug',
          id: 'qoptions-montecarlo-5',
          ask: 'This pricer gives a 1-year at-the-money call (r = 5%, σ = 20%) a price near $11.79 instead of $10.45. Which line is wrong?',
          code: `import numpy as np

def mc_call(S0, K, T, r, sigma, n, seed):
    z = np.random.default_rng(seed).standard_normal(n)
    ST = S0 * np.exp(r * T + sigma * np.sqrt(T) * z)
    pay = np.exp(-r * T) * np.maximum(ST - K, 0)
    return pay.mean()`,
          line: 5,
          fix: '    ST = S0 * np.exp((r - 0.5 * sigma**2) * T + sigma * np.sqrt(T) * z)',
          why: 'The average of e^(σ√T Z) is e^(σ²T/2), not 1. Without the −σ²/2 the simulated stock grows faster than the risk-free rate, and every call comes out too dear. The check of the previous question catches it.',
        },
        {
          kind: 'choice',
          id: 'qoptions-montecarlo-6',
          ask: 'You use 50,000 antithetic pairs (100,000 payoffs). How should you compute the standard error?',
          options: [
            'The standard deviation of all 100,000 payoffs divided by √100,000',
            'The standard deviation of the 50,000 pair averages divided by √50,000',
            'The same as without antithetic variates, since the draws are random',
            'It cannot be computed for antithetic variates',
          ],
          answer: 1,
          why: 'The two halves of a pair are built from the same draw, so they are not independent. The pair averages are. Treating 100,000 payoffs as independent gives a wrong error bar, and it hides how much the trick helped.',
        },
        {
          kind: 'number',
          id: 'qoptions-montecarlo-7',
          ask: 'A control variate has a correlation of 0.95 with the payoff. By what factor does the variance of the estimate fall? Give a number to 1 decimal place.',
          answer: 10.3,
          tol: 0.06,
          check: '1 / (1 - 0.95 ** 2)',
          why: 'The variance is multiplied by 1 − 0.95² = 0.0975, a fall by a factor of about 10.3. The same accuracy needs a tenth of the paths. For deep in-the-money calls the stock is a strong control; for far out-of-the-money calls the correlation is lower and the gain smaller.',
        },
        {
          kind: 'choice',
          id: 'qoptions-montecarlo-8',
          ask: 'In the figure, start at 1,000 paths and move to 16,000. What happens to the 95% band around the estimate?',
          options: [
            'It narrows to about a quarter of its width',
            'It narrows to about a sixteenth of its width',
            'It stays the same width; only the estimate moves',
            'It widens, because more paths bring more extreme draws',
          ],
          answer: 0,
          why: 'Sixteen times the paths divide the error by √16 = 4. Switch on antithetic or control variates in the figure and compare the band at the same number of paths: the gain is worth many more paths.',
        },
        {
          kind: 'write',
          id: 'qoptions-montecarlo-9',
          numpy: true,
          ask: 'Write `mc_call(S0, K, T, r, sigma, n, seed)`: price a European call by Monte Carlo with `np.random.default_rng(seed).standard_normal(n)`, and return `(price, standard_error)`.',
          starter: `import numpy as np

def mc_call(S0, K, T, r, sigma, n, seed):
    z = np.random.default_rng(seed).standard_normal(n)
    pass`,
          solution: `import numpy as np

def mc_call(S0, K, T, r, sigma, n, seed):
    z = np.random.default_rng(seed).standard_normal(n)
    ST = S0 * np.exp((r - 0.5 * sigma**2) * T + sigma * np.sqrt(T) * z)
    pay = np.exp(-r * T) * np.maximum(ST - K, 0)
    return float(pay.mean()), float(pay.std(ddof=1) / np.sqrt(n))`,
          tests: `out = mc_call(100, 100, 1, 0.05, 0.2, 200000, 1)
assert out is not None, "the function returns nothing yet"
price, se = out
assert 0.02 < se < 0.04, f"with 200,000 paths the standard error should be about 0.033, got {se}"
assert abs(price - 10.4506) < 4 * se, f"the price should be within 4 standard errors of Black-Scholes 10.4506, got {price:.4f}"
p2, se2 = mc_call(100, 100, 1, 0.05, 0.2, 50000, 1)
assert abs(se2 / se - 2) < 0.1, f"a quarter of the paths should double the standard error, got a ratio of {se2 / se:.2f}"
assert mc_call(100, 100, 1, 0.05, 0.2, 1000, 7) == mc_call(100, 100, 1, 0.05, 0.2, 1000, 7), "the same seed must give the same answer"`,
          why: 'Two numbers, never one. The test that a quarter of the paths doubles the error is the √n law in action; it also catches an error bar computed with n instead of √n.',
        },
        {
          kind: 'write',
          id: 'qoptions-montecarlo-10',
          numpy: true,
          ask: 'Write `mc_call_anti(S0, K, T, r, sigma, n_pairs, seed)`: draw `n_pairs` normals, use each z and −z, average the two discounted payoffs of each pair, and return `(price, standard_error)` with the standard error taken over the pair averages.',
          starter: `import numpy as np

def mc_call_anti(S0, K, T, r, sigma, n_pairs, seed):
    z = np.random.default_rng(seed).standard_normal(n_pairs)
    pass`,
          solution: `import numpy as np

def mc_call_anti(S0, K, T, r, sigma, n_pairs, seed):
    z = np.random.default_rng(seed).standard_normal(n_pairs)
    def disc_pay(x):
        ST = S0 * np.exp((r - 0.5 * sigma**2) * T + sigma * np.sqrt(T) * x)
        return np.exp(-r * T) * np.maximum(ST - K, 0)
    pair = 0.5 * (disc_pay(z) + disc_pay(-z))
    return float(pair.mean()), float(pair.std(ddof=1) / np.sqrt(n_pairs))`,
          tests: `out = mc_call_anti(100, 100, 1, 0.05, 0.2, 100000, 3)
assert out is not None, "the function returns nothing yet"
price, se = out
assert abs(price - 10.4506) < 4 * se, f"the price should be within 4 standard errors of 10.4506, got {price:.4f}"
z = np.random.default_rng(3).standard_normal(200000)
ST = 100 * np.exp((0.05 - 0.02) + 0.2 * z)
plain = np.exp(-0.05) * np.maximum(ST - 100, 0)
plain_se = plain.std(ddof=1) / np.sqrt(200000)
assert se < 0.85 * plain_se, f"with the same 200,000 payoffs, antithetic pairs should give a smaller error than plain draws ({plain_se:.4f}), got {se:.4f}"
assert se > 0.3 * plain_se, f"an error far below the plain one suggests it was computed over 2n draws, not over pairs: got {se:.4f}"`,
          why: 'For a call the gain is real but modest, because the payoff is flat below the strike, where z and −z do not cancel. For payoffs closer to linear in the stock the gain is much larger.',
        },
        {
          kind: 'design',
          id: 'qoptions-montecarlo-11',
          ask: 'You must price a 3-month Asian call on SPY that pays the average daily close minus the strike, for a client. There is no formula in your toolkit. How do you build, check and report the price?',
          checklist: [
            { point: 'Simulate daily steps of the path under risk-neutral drift, not only the final price', why: 'The payoff depends on every close, so the path must be simulated day by day.' },
            { point: 'Report the price with its standard error and the number of paths', why: 'A Monte Carlo price without an error bar cannot be compared with a quote.' },
            { point: 'Use the geometric-average Asian option, which has a closed form, as a control variate', why: 'It is highly correlated with the arithmetic version and cuts the error a lot.' },
            { point: 'Check the code on a case with a known answer, such as a European call', why: 'It catches drift and discounting bugs before they reach the client.' },
            { point: 'Fix the seed and record it with the inputs', why: 'Someone must be able to reproduce the number.' },
            { point: 'Say which volatility was used and how sensitive the price is to it', why: 'The model input is the largest uncertainty, larger than the simulation error.' },
            { point: 'State whether dividends, skew and the day count were handled', why: 'A tidy error bar on a model with missing pieces is still wrong.' },
          ],
          why: 'The standard error measures only the simulation noise. The model error from σ, dividends and skew is usually larger, and the client needs to hear about both.',
        },
      ],
    },
    {
      id: 'qoptions-iv',
      title: 'Implied volatility numerically',
      summary: "Newton's method beside bisection, a good first guess, and the cases where a solver fails or should refuse to answer.",
      widget: 'qoptions-newton',
      text: [
        'The volatility module found implied volatility by bisection: halve a bracket until it is small. It never fails, but it gains one binary digit per step, so going from a bracket of 3 to a width of 0.000001 takes about 22 prices. When you solve every option on a chain every minute, that adds up.',
        "**Newton's method** uses the slope. The slope of the price with respect to σ is vega, so each step is `σ_new = σ − (BS(σ) − P) ÷ vega(σ)`, where P is the market price and vega is per 1.00 of volatility. Near the answer the number of correct digits roughly doubles each step: three or four steps usually reach full precision.",
        { code: `sigma = 0.5                                  # starting guess
for _ in range(6):
    diff = bs_call(S, K, T, r, sigma) - price
    sigma -= diff / vega(S, K, T, r, sigma)` },
        'A good start helps. Near the money, the price is about `0.4 × S × σ × √T`, which gives the **Brenner-Subrahmanyam** guess `σ0 ≈ √(2π ÷ T) × P ÷ S`. Far from the money there is no such shortcut.',
        'Newton fails where vega is tiny: far out of the money, or close to expiry. A tiny slope makes a huge step, which can throw σ below zero or to an absurd value. Before solving, check the price is inside the **no-arbitrage bounds**: a call must cost at least `max(0, S − K × e^(−rT))` and less than S. Outside them there is no implied volatility at all, which means a stale or wrong quote. The fix is a **safeguarded** solver: keep a bracket, take the Newton step when it stays inside, and bisect when it does not.',
        "In practice `scipy.optimize.brentq` gives a safe bracketing solver, and Peter Jäckel's 2015 method \"Let's Be Rational\", used by the vollib family of Python libraries, reaches machine precision in about two steps for any input. Two habits matter more than the method: solve from out-of-the-money options (an in-the-money call is mostly intrinsic value, so a cent of noise moves its IV a lot), and remember that the bid and the ask each have their own IV. A $0.10 spread with a vega of $0.05 per point is two points of IV.",
      ],
      rules: [
        'Newton: σ_new = σ − (BS(σ) − P) ÷ vega(σ). Fast near the answer.',
        'Bisection: slow but cannot fail inside a valid bracket.',
        'Start near √(2π ÷ T) × P ÷ S for options near the money.',
        'Check the bounds first: max(0, S − K × e^(−rT)) ≤ call < S. Outside: no IV.',
        'Tiny vega means huge Newton steps: safeguard with a bracket.',
        'IV width ≈ bid-ask spread ÷ vega per point. Solve from out-of-the-money options.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'qoptions-iv-1',
          ask: 'A 3-month (T = 0.25) at-the-money call on a $100 stock costs $4. What is the Brenner-Subrahmanyam starting guess √(2π ÷ T) × P ÷ S? Give a decimal to 3 places.',
          answer: 0.201,
          tol: 0.0006,
          check: 'math.sqrt(2 * math.pi / 0.25) * 4 / 100',
          why: '√(25.13) = 5.013, times 0.04 gives 0.201, about 20%. The true IV is very close to this, so Newton from here needs one or two steps.',
        },
        {
          kind: 'number',
          id: 'qoptions-iv-2',
          ask: 'At σ = 30% the model price is $5.00 and the market price is $4.00. Vega is $20 per 1.00 of volatility (20 cents per point). What σ does one Newton step give? Give a decimal.',
          answer: 0.25,
          tol: 0.0006,
          check: '0.30 - (5.00 - 4.00) / 20',
          why: 'σ_new = 0.30 − 1.00 ÷ 20 = 0.25. The model was a dollar too dear, and each point of volatility is worth 20 cents, so drop 5 points. Mixing up vega per point and per 1.00 makes the step 100 times too large or too small.',
        },
        {
          kind: 'number',
          id: 'qoptions-iv-3',
          ask: 'Bisection starts from the bracket [0.01, 3.01] and halves it each step. How many steps until the bracket is narrower than 0.0001? Give a whole number.',
          answer: 15,
          tol: 0.01,
          check: 'math.ceil(math.log2(3.0 / 0.0001))',
          why: 'After k steps the width is 3 ÷ 2^k. 2^15 = 32,768, so 3 ÷ 32,768 ≈ 0.00009. Each extra digit of accuracy costs about 3.3 more steps; Newton gains digits much faster once it is close.',
        },
        {
          kind: 'choice',
          id: 'qoptions-iv-4',
          ask: 'A stock is at $120, a 1-month call struck at $100 is quoted at $18.50, and rates are near zero. Your IV solver fails to converge. Why?',
          options: [
            'The volatility is very high, above the bracket',
            'The quote is below intrinsic value ($20), so no volatility gives that price: the quote is stale or wrong',
            "Newton's method cannot handle in-the-money calls",
            'The solver needs more steps',
          ],
          answer: 1,
          why: 'Even at zero volatility the call is worth about $20. A price below the lower bound has no implied volatility. Check the bounds before solving and flag the quote rather than forcing a number out of it.',
        },
        {
          kind: 'output',
          id: 'qoptions-iv-5',
          ask: "Newton's method from a poor start of 50%. The market price is $4 on a 3-month at-the-money call on a $100 stock, r = 0. What does this print?",
          code: `import math
N = lambda x: 0.5 * (1 + math.erf(x / math.sqrt(2)))
def bs_call(S, K, T, s):
    d1 = (math.log(S / K) + s * s / 2 * T) / (s * math.sqrt(T))
    return S * N(d1) - K * N(d1 - s * math.sqrt(T))
def vega(S, K, T, s):
    d1 = (math.log(S / K) + s * s / 2 * T) / (s * math.sqrt(T))
    return S * math.sqrt(T) * math.exp(-d1 * d1 / 2) / math.sqrt(2 * math.pi)
s = 0.5
for _ in range(3):
    s -= (bs_call(100, 100, 0.25, s) - 4.0) / vega(100, 100, 0.25, s)
    print(round(s, 6))`,
          answer: '0.199491\n0.200614\n0.200614',
          why: 'At the money the price is almost a straight line in σ, so the first step from 50% lands within 0.0012 of the answer and the second is exact to six places. Far from the money the curve bends more and the start matters much more.',
        },
        {
          kind: 'bug',
          id: 'qoptions-iv-6',
          ask: 'This Newton solver walks away from the answer, down through zero to negative volatilities, even from a good start. Which line is wrong?',
          code: `def newton_iv(price, S, K, T, r, sigma=0.2):
    for _ in range(50):
        diff = bs_call(S, K, T, r, sigma) - price
        if abs(diff) < 1e-10:
            return sigma
        sigma = sigma + diff / vega(S, K, T, r, sigma)
    return sigma`,
          line: 6,
          fix: '        sigma = sigma - diff / vega(S, K, T, r, sigma)',
          why: 'When the model price is above the market price, diff is positive and σ must come down. Adding the step moves it the wrong way: every step pushes σ further from the answer, and the solver diverges.',
        },
        {
          kind: 'number',
          id: 'qoptions-iv-7',
          ask: 'An option is quoted $2.40 bid, $2.60 ask, and its vega is $0.08 per volatility point. Roughly how many volatility points apart are the IVs of the bid and the ask?',
          answer: 2.5,
          tol: 0.01,
          check: '(2.60 - 2.40) / 0.08',
          why: '$0.20 ÷ $0.08 = 2.5 points. An IV printed to two decimals from the mid hides that the market only knows it to within a few points. Signals built on IV changes smaller than this are noise.',
        },
        {
          kind: 'choice',
          id: 'qoptions-iv-8',
          ask: 'In the figure, choose the far out-of-the-money option with a short expiry and start Newton at 20%. What happens?',
          options: [
            'It converges in one step, as at the money',
            'The curve is almost flat at the start, so the first step overshoots far past the answer, and the solver may leave the valid range',
            'It cannot move at all, because vega is exactly zero',
            'It converges, but to a different implied volatility',
          ],
          answer: 1,
          why: 'Where the price curve is flat the tangent hits the market price far away. A safeguarded solver detects that the step leaves the bracket and bisects instead. Then switch the figure to the at-the-money option: the same start converges at once.',
        },
        {
          kind: 'write',
          id: 'qoptions-iv-9',
          ask: "Write `newton_iv(price, S, K, T, r)` with Newton's method from the Brenner-Subrahmanyam start, stopping when the price error is below 1e-10. `bs_call` and `vega` are given.",
          starter: `import math

def N(x):
    return 0.5 * (1 + math.erf(x / math.sqrt(2)))

def bs_call(S, K, T, r, s):
    d1 = (math.log(S / K) + (r + s * s / 2) * T) / (s * math.sqrt(T))
    return S * N(d1) - K * math.exp(-r * T) * N(d1 - s * math.sqrt(T))

def vega(S, K, T, r, s):
    d1 = (math.log(S / K) + (r + s * s / 2) * T) / (s * math.sqrt(T))
    return S * math.sqrt(T) * math.exp(-d1 * d1 / 2) / math.sqrt(2 * math.pi)

def newton_iv(price, S, K, T, r):
    sigma = math.sqrt(2 * math.pi / T) * price / S
    pass`,
          solution: `import math

def N(x):
    return 0.5 * (1 + math.erf(x / math.sqrt(2)))

def bs_call(S, K, T, r, s):
    d1 = (math.log(S / K) + (r + s * s / 2) * T) / (s * math.sqrt(T))
    return S * N(d1) - K * math.exp(-r * T) * N(d1 - s * math.sqrt(T))

def vega(S, K, T, r, s):
    d1 = (math.log(S / K) + (r + s * s / 2) * T) / (s * math.sqrt(T))
    return S * math.sqrt(T) * math.exp(-d1 * d1 / 2) / math.sqrt(2 * math.pi)

def newton_iv(price, S, K, T, r):
    sigma = math.sqrt(2 * math.pi / T) * price / S
    for _ in range(50):
        diff = bs_call(S, K, T, r, sigma) - price
        if abs(diff) < 1e-10:
            break
        sigma -= diff / vega(S, K, T, r, sigma)
    return sigma`,
          tests: `out = newton_iv(bs_call(100, 100, 0.5, 0.03, 0.25), 100, 100, 0.5, 0.03)
assert out is not None, "the function returns nothing yet"
assert abs(out - 0.25) < 1e-8, f"pricing at 25% and solving back should give 0.25, got {out}"
for K, s in [(90, 0.35), (110, 0.18), (100, 0.6)]:
    got = newton_iv(bs_call(100, K, 1.0, 0.01, s), 100, K, 1.0, 0.01)
    assert abs(got - s) < 1e-8, f"strike {K}: expected {s}, got {got}"`,
          why: 'Round trips, price then solve, are the standard test for any IV solver. Try it on a far out-of-the-money strike with a short expiry and it will misbehave; the next question fixes that.',
        },
        {
          kind: 'write',
          id: 'qoptions-iv-10',
          ask: 'Write `safe_iv(price, S, K, T, r)`: return None if the price is outside the bounds `max(0, S − K e^(−rT)) < price < S`. Otherwise keep a bracket [lo, hi] = [1e-4, 5.0]; from σ = 0.5, after each price shrink the bracket on the correct side, then take the Newton step if it lands strictly inside the bracket and bisect if it does not. Stop when the price error is below 1e-10.',
          starter: `import math

def N(x):
    return 0.5 * (1 + math.erf(x / math.sqrt(2)))

def bs_call(S, K, T, r, s):
    d1 = (math.log(S / K) + (r + s * s / 2) * T) / (s * math.sqrt(T))
    return S * N(d1) - K * math.exp(-r * T) * N(d1 - s * math.sqrt(T))

def vega(S, K, T, r, s):
    d1 = (math.log(S / K) + (r + s * s / 2) * T) / (s * math.sqrt(T))
    return S * math.sqrt(T) * math.exp(-d1 * d1 / 2) / math.sqrt(2 * math.pi)

def safe_iv(price, S, K, T, r):
    pass`,
          solution: `import math

def N(x):
    return 0.5 * (1 + math.erf(x / math.sqrt(2)))

def bs_call(S, K, T, r, s):
    d1 = (math.log(S / K) + (r + s * s / 2) * T) / (s * math.sqrt(T))
    return S * N(d1) - K * math.exp(-r * T) * N(d1 - s * math.sqrt(T))

def vega(S, K, T, r, s):
    d1 = (math.log(S / K) + (r + s * s / 2) * T) / (s * math.sqrt(T))
    return S * math.sqrt(T) * math.exp(-d1 * d1 / 2) / math.sqrt(2 * math.pi)

def safe_iv(price, S, K, T, r):
    if not (max(0.0, S - K * math.exp(-r * T)) < price < S):
        return None
    lo, hi, sigma = 1e-4, 5.0, 0.5
    for _ in range(200):
        diff = bs_call(S, K, T, r, sigma) - price
        if abs(diff) < 1e-10:
            break
        if diff > 0:
            hi = sigma
        else:
            lo = sigma
        v = vega(S, K, T, r, sigma)
        step = sigma - diff / v if v > 0 else -1.0
        sigma = step if lo < step < hi else (lo + hi) / 2
    return sigma`,
          tests: `out = safe_iv(bs_call(100, 100, 0.5, 0.0, 0.3), 100, 100, 0.5, 0.0)
assert out is not None, "the function returns nothing yet for a valid price"
assert abs(out - 0.3) < 1e-7, f"at the money: expected 0.3, got {out}"
p = bs_call(100, 140, 0.05, 0.0, 0.9)
got = safe_iv(p, 100, 140, 0.05, 0.0)
assert got is not None and abs(got - 0.9) < 1e-6, f"far out of the money, short expiry: expected 0.9, got {got}"
assert safe_iv(18.5, 120, 100, 1 / 12, 0.0) is None, "a price below intrinsic value has no implied volatility: return None"
assert safe_iv(130.0, 120, 100, 1 / 12, 0.0) is None, "a call cannot cost more than the stock: return None"`,
          why: 'Newton gives the speed and the bracket gives the guarantee: the bracket always contains the answer because the price rises with σ, so the solver cannot wander off. Refusing to answer outside the bounds is a feature: it flags bad quotes instead of inventing volatilities.',
        },
        {
          kind: 'design',
          id: 'qoptions-iv-11',
          ask: 'You are building a nightly job that turns closing quotes for every SPX option into implied volatilities for research. What goes into it?',
          checklist: [
            { point: 'Use out-of-the-money calls and puts, and get in-the-money IVs from them through put-call parity', why: 'Out-of-the-money prices are mostly time value, so their IV is far less sensitive to quote noise.' },
            { point: 'Compute the forward (or the implied rate and dividend) from put-call parity at each expiry', why: 'A wrong forward shifts every IV and creates fake skew.' },
            { point: 'Check the no-arbitrage bounds before solving and flag quotes outside them', why: 'There is no IV to find for an impossible price; forcing one creates outliers.' },
            { point: 'Use a safeguarded solver with a bracket', why: 'Plain Newton blows up on far wings and short expiries.' },
            { point: 'Store IV for bid and ask, not only the mid', why: 'The spread in IV terms tells you how far to trust each point.' },
            { point: 'Drop or mark quotes with zero bid or very wide spreads', why: 'A $0.00 bid has no information about the volatility.' },
            { point: 'Record the snapshot time of the underlying and the options', why: 'An index level and option quotes taken at different moments give wrong IVs, worst at the close.' },
            { point: "Test with round trips and on yesterday's data before going live", why: 'Price then solve must give back the input; anything else is a bug.' },
          ],
          why: 'The solver is the easy part. The forward, the choice of quotes, the timing and the bounds decide whether the surface you build later is data or noise.',
        },
      ],
    },
    {
      id: 'qoptions-surface',
      title: 'The volatility surface',
      summary: 'Implied volatility across strikes and expiries, why Black-Scholes is wrong in a useful way, and the shapes no-arbitrage allows.',
      text: [
        'Solve every option on a chain for its IV and you get a **volatility surface**: one number for each strike K and expiry T. The volatility module showed its two slices: the skew across strikes (index puts dearer than calls) and the term structure across expiries. A quant treats the whole surface as the object: it is what gets stored, smoothed, compared day to day and fed to pricers.',
        'If Black-Scholes were right, the surface would be flat. It is not, so the model is wrong. It stays in use because it is wrong in a useful way: it is a translation, one price to one volatility, and back. Quote the surface, and Black-Scholes with the right σ for each strike returns the market price. Strikes are often measured by **moneyness**, `ln(K ÷ F)` with F the forward price, or by delta, so that surfaces from different days line up.',
        'Not every surface is possible. Three rules, in plain words, for calls on one expiry with r = 0: prices fall as the strike rises; they fall by no more than the strike difference, `C(K1) − C(K2) ≤ K2 − K1`; and they are **convex** in strike, so a **butterfly** `C(K − h) − 2C(K) + C(K + h)` is never negative, because its payoff never is. Across expiries, **total variance** `σ² × T` at the same moneyness must not fall as T grows, or a calendar spread is free money.',
        'The butterfly also reads the market\'s distribution. Breeden and Litzenberger (1978) showed that the second difference of call prices in strike, divided by h², is the risk-neutral **density** of the final price (times e^(−rT)). An index skew turns into a density with a fatter left tail than the lognormal one Black-Scholes assumes.',
        { code: `import numpy as np

K = np.array([95, 100, 105.0])
C = np.array([7.0, 4.0, 2.0])
h = 5.0
fly = C[0] - 2 * C[1] + C[2]       # 1.0: never below zero
density = fly / h**2               # 0.04 per dollar near $100` },
        'Raw quotes break these rules all the time because of spreads and stale prices, so desks fit a smooth curve per expiry and then check it. Names you will meet: SVI (Gatheral, 2004), a five-parameter curve per expiry; **local volatility** (Dupire, 1994), one σ(S, t) that reproduces the whole surface; and **stochastic volatility** (Heston, 1993), where σ itself moves randomly. Each fits today\'s surface differently and predicts tomorrow\'s differently. None is the truth.',
      ],
      rules: [
        'The surface is IV by strike and expiry. Black-Scholes is the translator, not the truth.',
        'Calls fall with strike, by no more than the strike difference (r = 0).',
        'Butterfly C(K − h) − 2C(K) + C(K + h) ≥ 0: call prices are convex in strike.',
        'Total variance σ²T must not fall with expiry at the same moneyness.',
        'Butterfly ÷ h² ≈ risk-neutral density of the final price.',
        'Fit a smooth surface, then check it for arbitrage before using it.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'qoptions-surface-1',
          ask: 'Calls on one expiry are quoted at $7.00 (strike 95), $4.00 (strike 100) and $2.00 (strike 105). What does the butterfly, long one 95 call, short two 100 calls, long one 105 call, cost? Dollars.',
          answer: 1,
          tol: 0.01,
          check: '7.00 - 2 * 4.00 + 2.00',
          why: '7 − 8 + 2 = $1.00. The butterfly pays nothing below 95 or above 105 and up to $5 at 100, so it must cost something between those, and never less than zero.',
        },
        {
          kind: 'number',
          id: 'qoptions-surface-2',
          ask: 'With that butterfly at $1.00 and strikes $5 apart (r = 0), the risk-neutral density near $100 is about 1.00 ÷ 5² per dollar. What is the approximate risk-neutral probability that the stock ends between $97.50 and $102.50? Give a decimal.',
          answer: 0.2,
          tol: 0.001,
          check: '1.00 / 5 ** 2 * 5',
          why: 'The density is 0.04 per dollar, over a $5 band: 0.2. The butterfly is a bet that pays only near the middle strike, so its price, divided by its maximum payoff ($5), is roughly the chance of ending there.',
        },
        {
          kind: 'choice',
          id: 'qoptions-surface-3',
          ask: 'Calls on one expiry: $6.00 (95), $4.00 (100), $1.50 (105), r = 0. What does this tell you?',
          options: [
            'Nothing unusual: prices fall as the strike rises',
            'The butterfly costs 6 − 8 + 1.5 = −$0.50: you would be paid to hold a position whose payoff is never negative, so the quotes contain an arbitrage, or more likely a stale or wrong price',
            'The 105 call is cheap, so buy it',
            'Volatility is rising across strikes',
          ],
          answer: 1,
          why: 'Convexity is broken. In live markets a negative butterfly on screen nearly always comes from a stale quote or a mid between wide bid and ask that you could not trade. In a fitted surface it is a bug that will make some model produce a negative density.',
        },
        {
          kind: 'number',
          id: 'qoptions-surface-4',
          ask: 'The 1-month IV at the money is 30%. What is the lowest 2-month at-the-money IV that does not allow a calendar arbitrage (total variance σ²T must not fall)? Give a decimal to 3 places.',
          answer: 0.212,
          tol: 0.0006,
          check: '0.30 * math.sqrt((1 / 12) / (2 / 12))',
          why: 'σ₂² × 2 ≥ 0.3² × 1, so σ₂ ≥ 0.3 ÷ √2 ≈ 0.212. An inverted term structure is allowed, after an event or in a selloff, but only down to this level. Below it, the 2-month option would hold less variance than the 1-month one.',
        },
        {
          kind: 'number',
          id: 'qoptions-surface-5',
          ask: 'With r = 0, the call struck at 100 is quoted at $12.00. What is the lowest price the call struck at 105 (same expiry) can have without arbitrage? Dollars.',
          answer: 7,
          tol: 0.01,
          check: '12.00 - (105 - 100)',
          why: 'A call spread long 100, short 105 pays at most $5, so it cannot cost more than $5: C(105) ≥ 12 − 5 = $7. A quote below that is a free call spread.',
        },
        {
          kind: 'output',
          id: 'qoptions-surface-6',
          ask: 'An implied density from five call prices. What does this print?',
          code: `import numpy as np

K = np.array([90, 95, 100, 105, 110.0])
C = np.array([11.5, 7.5, 4.5, 2.5, 1.2])
h = 5.0
dens = (C[:-2] - 2 * C[1:-1] + C[2:]) / h**2
print(dens.round(3).tolist(), round(float((dens * h).sum()), 2))`,
          answer: '[0.04, 0.04, 0.028] 0.54',
          why: 'Three butterflies centred on 95, 100 and 105. Each density times the $5 spacing is a probability, and the three add to 0.54: the chance, under q, of ending roughly between $92.50 and $107.50. The rest of the probability lies in the wings, which need more strikes to see.',
        },
        {
          kind: 'bug',
          id: 'qoptions-surface-7',
          ask: 'This should turn call prices on evenly spaced strikes into a density per dollar. With $5 spacing every number comes out five times too large. Which line is wrong?',
          code: `import numpy as np

def implied_density(C, h):
    C = np.asarray(C, dtype=float)
    fly = C[:-2] - 2 * C[1:-1] + C[2:]
    return fly / h`,
          line: 6,
          fix: '    return fly / h**2',
          why: 'A density is a second derivative of price in strike, so it divides by h twice. Check it by summing density × h over a wide range of strikes: the total must be close to 1, and the version dividing by h once gives 5.',
        },
        {
          kind: 'choice',
          id: 'qoptions-surface-8',
          ask: 'What does it mean that Black-Scholes is "wrong in a useful way"?',
          options: [
            'Its prices are wrong, so traders adjust them by a fixed amount',
            'Its assumption of one constant volatility is false, but as a map between price and volatility it lets every option be quoted, compared and hedged in one unit',
            'It is right for calls and wrong for puts',
            'It is right for SPX and wrong for single stocks',
          ],
          answer: 1,
          why: 'The skew shows the model is false. Quoting in IV still works because the map from price to σ is one to one. The danger is forgetting that the Greeks it gives come from a model that does not hold, which matters most for wing options and in crashes.',
        },
        {
          kind: 'choice',
          id: 'qoptions-surface-9',
          ask: 'An S&P 500 surface has the usual skew: out-of-the-money puts at higher IV than out-of-the-money calls. What does that say about the risk-neutral density of the index at expiry, compared with the lognormal one of Black-Scholes?',
          options: [
            'It is the same; skew is only about supply and demand',
            'It has a fatter left tail: large falls carry more probability than the lognormal gives',
            'It has a fatter right tail: large rises are more likely',
            'It is narrower everywhere',
          ],
          answer: 1,
          why: 'Dearer low strikes mean more weight in the butterflies there, which is more density in the left tail. This is the market pricing crash risk, the same fat tails you met in the quant module, now visible in option prices.',
        },
        {
          kind: 'write',
          id: 'qoptions-surface-10',
          numpy: true,
          ask: 'Write `convexity_violations(K, C)`: for strikes `K` (increasing, not necessarily evenly spaced) and call prices `C`, return the list of inner strikes K[i] where the slope to the left is larger than the slope to the right by more than 1e-9.',
          starter: `import numpy as np

def convexity_violations(K, C):
    K = np.asarray(K, dtype=float)
    C = np.asarray(C, dtype=float)
    pass`,
          solution: `import numpy as np

def convexity_violations(K, C):
    K = np.asarray(K, dtype=float)
    C = np.asarray(C, dtype=float)
    slope = np.diff(C) / np.diff(K)
    bad = slope[:-1] > slope[1:] + 1e-9
    return [float(k) for k in K[1:-1][bad]]`,
          tests: `out = convexity_violations([95, 100, 105], [7.0, 4.0, 2.0])
assert out is not None, "the function returns nothing yet"
assert out == [], f"7, 4, 2 is convex: no violations, got {out}"
assert convexity_violations([95, 100, 105], [6.0, 4.0, 1.5]) == [100.0], "6, 4, 1.5 breaks convexity at 100"
assert convexity_violations([90, 100, 105, 110], [12.0, 5.0, 2.0, 0.5]) == [], "uneven spacing: slopes -0.7, -0.6, -0.3 are rising, so no violation"
assert convexity_violations([90, 95, 100, 105, 110], [11.0, 8.0, 4.0, 2.5, 1.2]) == [95.0], "slope -0.6 from 90 to 95, then -0.8 from 95 to 100: convexity breaks at 95 only"`,
          why: 'Comparing slopes rather than butterflies handles uneven strikes, which real chains have. Run it on every expiry of a fitted surface before anything downstream uses it.',
        },
        {
          kind: 'write',
          id: 'qoptions-surface-11',
          numpy: true,
          ask: 'Write `calendar_ok(T, iv)`: for expiries `T` in years (increasing) and at-the-money IVs `iv`, return True if total variance `iv² × T` never falls from one expiry to the next, else False.',
          starter: `import numpy as np

def calendar_ok(T, iv):
    pass`,
          solution: `import numpy as np

def calendar_ok(T, iv):
    w = np.asarray(iv, dtype=float) ** 2 * np.asarray(T, dtype=float)
    return bool(np.all(np.diff(w) >= -1e-12))`,
          tests: `out = calendar_ok([1 / 12, 2 / 12, 3 / 12], [0.20, 0.21, 0.22])
assert out is not None, "the function returns nothing yet"
assert out is True, "rising IV and rising time: total variance rises"
assert calendar_ok([1 / 12, 2 / 12], [0.30, 0.22]) is True, "0.09/12 < 0.0968/12: an inverted curve that is still allowed"
assert calendar_ok([1 / 12, 2 / 12], [0.30, 0.20]) is False, "0.09 x 1/12 > 0.04 x 2/12: total variance falls"
assert calendar_ok([0.25], [0.2]) is True, "one expiry cannot break the rule"`,
          why: 'An inverted term structure, falling IV with expiry, is common before events and in selloffs. It becomes impossible only when the later option holds less total variance than the earlier one.',
        },
        {
          kind: 'design',
          id: 'qoptions-surface-12',
          ask: 'You have one end-of-day snapshot of all SPY options and must build a surface that a pricer will use tomorrow. What do you do?',
          checklist: [
            { point: 'Compute IVs from out-of-the-money options with a forward from put-call parity per expiry', why: 'Wrong forwards and in-the-money quotes are the main sources of fake skew.' },
            { point: 'Drop quotes with no bid, very wide spreads or tiny size', why: 'They carry little information about the volatility and add noise to the fit.' },
            { point: 'Fit a smooth curve per expiry (SVI or similar) in moneyness, weighting by the bid-ask spread', why: 'Raw points are too noisy to price from; a tight market deserves more weight.' },
            { point: 'Check butterfly and calendar arbitrage on the fitted surface', why: 'A surface with negative densities makes models misbehave.' },
            { point: 'Decide how to extrapolate beyond the last quoted strike', why: 'Wing prices depend on it and there is no data there.' },
            { point: 'Compare with yesterday and flag large changes', why: 'A jump in one expiry is more often a data error than a market event.' },
            { point: 'Account for American exercise and dividends when backing out IV for SPY', why: 'European formulas on American options bias the IVs, most for in-the-money puts.' },
          ],
          why: 'A surface is a model fitted to noisy data, and every number a pricer produces tomorrow depends on the choices made here.',
        },
      ],
    },
    {
      id: 'qoptions-hedging',
      title: 'Delta hedging in discrete time',
      summary: 'What is left when you hedge once a day instead of continuously: hedging error, gamma against theta, and realised against implied volatility.',
      widget: 'qoptions-hedge',
      text: [
        'The replication argument needs continuous hedging. A desk hedges a few times a day at most. Sell a call at an implied volatility σ_i, buy delta shares, and rebalance at fixed times. Between rebalances the hedge is stale, and the position gains or loses through **gamma**, delta\'s rate of change, which the pricing module introduced.',
        'Over one step a delta-hedged long option earns about `½ × Γ × ΔS² + θ × Δt`: a gain from the squared move, a loss from time. The two cancel when the move is the **breakeven move**, `S × σ_i × √Δt`, a one-standard-deviation move at the implied volatility. Days with larger moves pay the long gamma holder; quieter days pay the seller.',
        { code: `gamma, theta_day = 0.04, -0.08      # per share, theta per day
for move in [1.0, 2.0, 3.0]:
    print(move, 0.5 * gamma * move**2 + theta_day)
# 1.0 -0.06   2.0 0.0   3.0 0.1` },
        'Added up to expiry, the P&L of a hedged long option is about `Σ ½ × Γ × S² × (σ_r² − σ_i²) × Δt`, where σ_r is the volatility the stock actually realised. Buy an option and hedge it: you profit if realised volatility beats the implied you paid. Sell one: the reverse. This is how a volatility trader bets on volatility without betting on direction.',
        'Three things spoil the neat sum. **Hedging error**: with N rebalances the P&L has noise whose standard deviation falls roughly like 1 ÷ √N, so four times the hedges halve it. **Path**: the sum weights each day by Γ × S², so big moves near the strike close to expiry count far more than the same moves far from it; realised volatility equal to implied does not guarantee zero P&L. **Costs**: each rebalance crosses a spread, so hedging more often trades noise for cost. Real desks hedge on thresholds of delta, not every tick.',
      ],
      rules: [
        'Hedged long option per step ≈ ½ΓΔS² + θΔt.',
        'Breakeven move = S × σ_i × √Δt. Bigger moves pay long gamma.',
        'Total ≈ Σ ½ΓS²(σ_r² − σ_i²)Δt: realised against implied.',
        'Hedging error falls like 1 ÷ √N; costs rise like N.',
        'The P&L depends on the path: gamma decides which days count.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'qoptions-hedging-1',
          ask: 'SPY is at $400 and you hedge an option daily at an implied volatility of 20%. What is the breakeven daily move, in dollars, to 2 decimal places? Use 252 days a year.',
          answer: 5.04,
          tol: 0.006,
          check: '400 * 0.20 / math.sqrt(252)',
          why: '400 × 0.20 ÷ 15.87 ≈ $5.04. On days when SPY moves more than about $5, a long hedged option gains from gamma more than it loses to theta; on quieter days it loses.',
        },
        {
          kind: 'number',
          id: 'qoptions-hedging-2',
          ask: 'You are long a delta-hedged option with Γ = 0.05 per share and θ = −$0.40 per share per day. The stock moves $3 today. Using ½ΓΔS² + θ, what is the day\'s P&L per share, in dollars, to 3 decimal places?',
          answer: -0.175,
          tol: 0.0006,
          check: '0.5 * 0.05 * 3 ** 2 - 0.40',
          why: '0.5 × 0.05 × 9 = 0.225 from gamma, minus 0.40 of theta: −$0.175. The move was below the breakeven, √(2 × 0.40 ÷ 0.05) = $4, so time won.',
        },
        {
          kind: 'number',
          id: 'qoptions-hedging-3',
          ask: 'You hold a hedged long option for 3 months (T = 0.25). Treat Γ = 0.02 and S = $100 as constant. You paid 20% implied and the stock realises 25%. Using ½ΓS²(σ_r² − σ_i²)T, what is the expected P&L per share, in dollars, to 2 decimal places?',
          answer: 0.56,
          tol: 0.006,
          check: '0.5 * 0.02 * 100 ** 2 * (0.25 ** 2 - 0.20 ** 2) * 0.25',
          why: '0.5 × 0.02 × 10,000 = 100, times (0.0625 − 0.04) = 2.25, times 0.25 = $0.5625. You were right about volatility, and that is all the hedge lets you be right about. Γ and S change as the stock moves, so treat it as an estimate.',
        },
        {
          kind: 'choice',
          id: 'qoptions-hedging-4',
          ask: 'You sell a call at 20% implied volatility and delta hedge it daily to expiry. The stock realises 15%. What is the most likely outcome?',
          options: [
            'A loss, because the stock moved',
            'A profit on average, with some noise from discrete hedging and the path',
            'Exactly zero, because the position was hedged',
            'A profit equal to the whole premium',
          ],
          answer: 1,
          why: 'You sold variance at 20% and it came in at 15%, so the gamma losses were smaller than the theta collected. The amount varies from path to path; hedging removes direction, not all risk.',
        },
        {
          kind: 'output',
          id: 'qoptions-hedging-5',
          ask: 'A long hedged option with Γ = 0.04 per share and θ = −$0.06 per share per day, over moves of different sizes. What does this print?',
          code: `gamma, theta = 0.04, -0.06
for move in [0.5, 1.0, 1.5, 2.0]:
    print(move, round(0.5 * gamma * move**2 + theta, 3))`,
          answer: '0.5 -0.055\n1.0 -0.04\n1.5 -0.015\n2.0 0.02',
          why: 'The gamma gain grows with the square of the move. Breakeven is √(2 × 0.06 ÷ 0.04) ≈ $1.73: below it the holder loses, above it wins. A seller sees the same table upside down.',
        },
        {
          kind: 'bug',
          id: 'qoptions-hedging-6',
          ask: 'This adds up the P&L of a delta hedge along a path. `deltas[t]` is the hedge decided at time t, before the move to t + 1. The backtest of the hedge looks almost perfect. Which line is wrong?',
          code: `def hedge_gains(S, deltas):
    gains = 0.0
    for t in range(len(S) - 1):
        gains += deltas[t + 1] * (S[t + 1] - S[t])
    return gains`,
          line: 4,
          fix: '        gains += deltas[t] * (S[t + 1] - S[t])',
          why: 'The hedge for the move from t to t + 1 must be the one set at t. Using the delta decided after the move is lookahead: the hedge already knows where the stock went, so the hedging error vanishes. The quant module showed the same bug in a signal.',
        },
        {
          kind: 'number',
          id: 'qoptions-hedging-7',
          ask: 'Hedging 25 times over an option\'s life, the hedged P&L has a standard deviation of $0.80. About what is it with 100 rebalances, in dollars?',
          answer: 0.4,
          tol: 0.01,
          check: '0.80 / math.sqrt(100 / 25)',
          why: 'Four times the rebalances divide the error by √4 = 2. Each rebalance also costs a spread, so the error falls slowly while the costs grow steadily.',
        },
        {
          kind: 'choice',
          id: 'qoptions-hedging-8',
          ask: 'In the figure you are short the option. Set realised volatility equal to implied, then lower realised to 15%. What happens to the spread of final P&Ls?',
          options: [
            'It moves to the right (gains) and keeps a similar width',
            'It collapses to one number, because the hedge is perfect',
            'It moves to the left (losses)',
            'Nothing changes; realised volatility does not matter for a hedged position',
          ],
          answer: 0,
          why: 'Realised below implied pays the seller on average, so the centre moves right. The width comes from discrete hedging and the path, and only more frequent hedging narrows it. Move the hedges slider to see that.',
        },
        {
          kind: 'write',
          id: 'qoptions-hedging-9',
          numpy: true,
          ask: 'Write `short_call_hedge(S, K, T, sigma)`: `S` holds the stock price at n + 1 equally spaced times from 0 to T, r = 0. Sell one call at its Black-Scholes price at σ, hold the Black-Scholes delta (at σ, with the time left) in shares, rebalance at every time before T, and return the final P&L: cash + shares × S[n] − max(S[n] − K, 0). `bs_call` and `bs_delta` are given.',
          starter: `import math
import numpy as np

def N(x):
    return 0.5 * (1 + math.erf(x / math.sqrt(2)))

def bs_call(S, K, tau, s):
    d1 = (math.log(S / K) + s * s / 2 * tau) / (s * math.sqrt(tau))
    return S * N(d1) - K * N(d1 - s * math.sqrt(tau))

def bs_delta(S, K, tau, s):
    return N((math.log(S / K) + s * s / 2 * tau) / (s * math.sqrt(tau)))

def short_call_hedge(S, K, T, sigma):
    n = len(S) - 1
    dt = T / n
    pass`,
          solution: `import math
import numpy as np

def N(x):
    return 0.5 * (1 + math.erf(x / math.sqrt(2)))

def bs_call(S, K, tau, s):
    d1 = (math.log(S / K) + s * s / 2 * tau) / (s * math.sqrt(tau))
    return S * N(d1) - K * N(d1 - s * math.sqrt(tau))

def bs_delta(S, K, tau, s):
    return N((math.log(S / K) + s * s / 2 * tau) / (s * math.sqrt(tau)))

def short_call_hedge(S, K, T, sigma):
    n = len(S) - 1
    dt = T / n
    shares = bs_delta(S[0], K, T, sigma)
    cash = bs_call(S[0], K, T, sigma) - shares * S[0]
    for i in range(1, n):
        new = bs_delta(S[i], K, T - i * dt, sigma)
        cash -= (new - shares) * S[i]
        shares = new
    return cash + shares * S[n] - max(S[n] - K, 0.0)`,
          tests: `flat = [100.0] * 21
out = short_call_hedge(flat, 100.0, 0.25, 0.2)
assert out is not None, "the function returns nothing yet"
assert abs(out - bs_call(100, 100, 0.25, 0.2)) < 1e-9, f"a stock that never moves: the seller keeps the whole premium ({bs_call(100, 100, 0.25, 0.2):.4f}), got {out}"
rng = np.random.default_rng(4)
res = []
for k in range(300):
    z = rng.standard_normal(63)
    path = 100 * np.exp(np.concatenate([[0], np.cumsum(-0.5 * 0.2**2 / 252 + 0.2 / math.sqrt(252) * z)]))
    res.append(short_call_hedge(list(path), 100.0, 63 / 252, 0.2))
res = np.array(res)
assert abs(res.mean()) < 0.15, f"realised equal to implied: the average P&L should be near 0, got {res.mean():.3f}"
assert res.std() < 1.0, f"daily hedging should keep the spread of P&L well below the premium of about 4, got {res.std():.3f}"`,
          why: 'The flat path is the theta-only case: no move, no gamma loss, the seller keeps everything. On random paths at the implied volatility the average is near zero and the spread is the hedging error, much smaller than the unhedged risk.',
        },
        {
          kind: 'choice',
          id: 'qoptions-hedging-10',
          ask: 'You are short a hedged at-the-money call. Over its life the stock realises exactly the implied volatility, but almost all of the movement comes in the last week, with the stock close to the strike. What do you expect?',
          options: [
            'Zero P&L, since realised equalled implied',
            'A loss: the big moves came when gamma was largest, and the P&L weights each day by Γ × S²',
            'A profit, because the early quiet weeks paid theta',
            'Zero P&L because delta hedging removes all risk',
          ],
          answer: 1,
          why: 'Near expiry and near the strike gamma is huge, so the same variance costs the short far more there than it earned in the quiet weeks. Realised volatility measured evenly over the life is not the number that decides the P&L; gamma-weighted volatility is.',
        },
        {
          kind: 'design',
          id: 'qoptions-hedging-11',
          ask: 'A small fund is short SPX options and delta hedges with ES futures. How should it decide when to rebalance?',
          checklist: [
            { point: 'Estimate the cost of each hedge: spread, slippage and fees per futures contract', why: 'Every rebalance pays these; they set how often hedging is worth it.' },
            { point: 'Hedge on a delta band rather than on a clock', why: 'A threshold trades when the exposure has really changed and saves trades on quiet days.' },
            { point: 'Widen the band when gamma is small, narrow it near expiry and near the strike', why: 'The cost of being unhedged grows with gamma.' },
            { point: 'Simulate the P&L spread and the costs for several bands', why: 'The choice is a trade-off between noise and cost, best seen in a simulation of both.' },
            { point: 'Set a limit on the remaining delta and gamma overnight and before events', why: 'Gaps cannot be hedged after they happen.' },
            { point: 'Watch the gamma-weighted realised volatility, not only the plain number', why: 'It is the one the P&L actually depends on.' },
          ],
          why: 'Hedging frequency is a cost decision. There is no frequency that makes the risk vanish, only one that balances hedging error against what the hedges cost.',
        },
      ],
    },
    {
      id: 'qoptions-varprem',
      title: 'Volatility as an asset',
      summary: 'The variance risk premium, variance swaps, what selling volatility earns and what it risks, and the VIX in outline.',
      text: [
        'If implied volatility is the price of variance and realised volatility is what gets delivered, you can ask which is larger on average. For stock indexes the answer has long been implied. A CFA Institute blog post in 2024 compared the VIX since 1990 (average about 19.6) with the S&P 500 volatility realised over the following 30 days (average about 15.5): implied ran about 4 points above. Carr and Wu (2009) found strongly negative **variance risk premiums** across indexes, from the point of view of the buyer. Option buyers, on average, pay for insurance.',
        'A **variance swap** trades the premium directly. At expiry it pays `N_var × (σ_r² − K_var)`, with volatilities in points. It is usually sized by **vega notional**: `N_var = N_vega ÷ (2 × K_vol)`. With $10,000 of vega notional at a strike of 20, N_var = 250 per variance point; a realised 25 pays the buyer 250 × (625 − 400) = $56,250, a realised 15 costs him 250 × (225 − 400) = $43,750. The payoff is convex: the seller\'s losses grow with the square of the volatility.',
        'Selling volatility earns small, steady gains and occasional large losses, the shape the strategies module showed for credit spreads, now at the level of a whole strategy. The premium exists because it pays for bearing that crash risk; it is not free money. On 5 February 2018 the VIX closed at 37.32, up from 17.31 the trading day before, a rise of about 116%, its largest one-day percentage rise. Exchange-traded notes that were short VIX futures collapsed, and Credit Suisse terminated its XIV note after its value fell more than 80% in a day. Years of steady gains went in an afternoon.',
        'The **VIX** in outline (Cboe methodology, at the time of writing in 2026): it is not the IV of one option. It is the square root of a 30-day variance computed from a strip of out-of-the-money SPX puts and calls across strikes, `σ² = (2 ÷ T) × Σ (ΔK ÷ K²) × e^(rT) × Q(K) − (1 ÷ T) × (F ÷ K0 − 1)²`, using SPX options with more than 23 and fewer than 37 days to expiry, interpolated to 30 days. Q(K) is the mid quote, ΔK the strike spacing, F the forward and K0 the first strike at or below F. The 1/K² weights make low strikes count more, so the skew is in the VIX.',
        'You cannot hold the VIX. VIX futures usually sit above the index in calm markets and drift down to it as they expire, so a long position loses on the roll; that drift is the premium again, seen from the other side. Size any short volatility position by its loss in a stress scenario (a doubling of the VIX overnight, a 20% fall in the index), not by its average month.',
      ],
      rules: [
        'Variance risk premium: index implied variance has usually exceeded realised. Buyers pay for insurance.',
        'Variance swap pays N_var × (σ_r² − K_var); N_var = N_vega ÷ (2 × K_vol).',
        "The seller's loss grows with the square of the volatility.",
        'Short volatility: many small gains, rare large losses. The premium is payment for that tail.',
        'VIX = √ of a 30-day variance from a strip of out-of-the-money SPX options, weighted by ΔK ÷ K².',
        'Size short volatility by stress loss, never by the average month.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'qoptions-varprem-1',
          ask: 'A variance swap has a vega notional of $10,000 and a strike of 20 volatility points. What is its variance notional N_var = N_vega ÷ (2 × K_vol), in dollars per variance point?',
          answer: 250,
          tol: 0.01,
          check: '10000 / (2 * 20)',
          why: '10,000 ÷ 40 = 250. Near the strike, one volatility point is worth about 2 × 20 = 40 variance points, so the swap is worth about $10,000 per volatility point there, which is what vega notional means.',
        },
        {
          kind: 'number',
          id: 'qoptions-varprem-2',
          ask: 'You bought that variance swap (N_var = 250, strike 20). Volatility over its life comes in at 25. What is your P&L, in dollars?',
          answer: 56250,
          tol: 1,
          check: '250 * (25 ** 2 - 20 ** 2)',
          why: '250 × (625 − 400) = $56,250. A 5-point move up made more than 5 × $10,000 = $50,000 because the payoff is in variance, which is convex in volatility.',
        },
        {
          kind: 'number',
          id: 'qoptions-varprem-3',
          ask: 'Same swap, but volatility comes in at 15. What is your P&L as the buyer, in dollars? Give a negative number for a loss.',
          answer: -43750,
          tol: 1,
          check: '250 * (15 ** 2 - 20 ** 2)',
          why: '250 × (225 − 400) = −$43,750. A 5-point fall loses less than a 5-point rise gains. For the seller it is the other way round: capped gains when volatility is low, losses that grow without limit when it spikes.',
        },
        {
          kind: 'output',
          id: 'qoptions-varprem-4',
          ask: 'Twenty made-up years of selling one month of variance at 20% implied. Realised volatility is usually near 15%, but 5% of months are a crisis at 60%. What does this print: the share of winning months, the average month and the worst month?',
          code: `import numpy as np

rng = np.random.default_rng(3)
iv, n = 0.20, 240
rv = np.where(rng.random(n) < 0.05, 0.60, rng.normal(0.15, 0.03, n).clip(0.05))
pnl = 100 * (iv**2 - rv**2)      # short variance, per unit of notional
print(round(float((pnl > 0).mean()), 2), round(float(pnl.mean()), 2), round(float(pnl.min()), 2))`,
          answer: '0.92 0.59 -32.0',
          why: 'Ninety-two percent of months win, the average is positive, and the worst month loses 32, more than fifty average months of gains. The numbers are made up, but the shape is the real one, and in a short sample with no crisis it looks like a free lunch.',
        },
        {
          kind: 'number',
          id: 'qoptions-varprem-5',
          ask: 'The VIX is at 15 and the one-month VIX future is at 17. If the VIX stays at 15, the future converges to it by expiry. What is the return of a long position in the future? Give a percentage, for example −5%.',
          answer: -0.1176,
          tol: 0.001,
          check: '15 / 17 - 1',
          why: '15 ÷ 17 − 1 ≈ −11.8% in a month with no change in the VIX. This roll cost is why products that hold VIX futures lose value over time in calm markets, and why their sellers earned steadily until 2018.',
        },
        {
          kind: 'choice',
          id: 'qoptions-varprem-6',
          ask: 'What happened to short volatility products in February 2018?',
          options: [
            'They had their best month as volatility fell',
            'On 5 February the VIX rose about 116% in one day, from 17.31 to 37.32; notes that were short VIX futures lost most of their value and Credit Suisse terminated XIV',
            'They were banned by regulators after a slow decline',
            'Nothing unusual; the VIX moved less than 10%',
          ],
          answer: 1,
          why: 'Years of steady gains from selling volatility were lost in a day. The product did what its rules said; the risk had always been there, it had only not shown up in the data its buyers looked at.',
        },
        {
          kind: 'choice',
          id: 'qoptions-varprem-7',
          ask: 'Why does the variance risk premium exist, and why is it not a free lunch?',
          options: [
            'Option sellers have better models; anyone can collect it safely',
            'Buyers pay for protection against crashes, when losses hurt most; the seller earns it by taking those losses when they come',
            'It is a data error caused by stale quotes',
            'It exists only in single stocks, not indexes',
          ],
          answer: 1,
          why: 'Insurance costs more than its average payout because the payout comes at the worst time. The seller is paid for being exposed then, and any size that cannot survive a 2008, 2018 or 2020 will not survive to collect the average.',
        },
        {
          kind: 'number',
          id: 'qoptions-varprem-8',
          ask: 'Implied volatility is 20% and the volatility realised over the period is 15%. What is the variance risk premium in variance terms, σ_i² − σ_r², as a decimal to 4 places?',
          answer: 0.0175,
          tol: 0.00006,
          check: '0.20 ** 2 - 0.15 ** 2',
          why: '0.04 − 0.0225 = 0.0175. In volatility points the gap is 5; in variance it is 175 variance points, which is what a variance swap settles on.',
        },
        {
          kind: 'write',
          id: 'qoptions-varprem-9',
          numpy: true,
          ask: 'Write `vix_like(K, Q, F, T, r)`: K are increasing strikes, Q the out-of-the-money option mid prices (puts below F, calls above, the average of the two at K0). ΔK is half the distance between the neighbours on each side, and the gap to the only neighbour at the two ends. K0 is the largest strike at or below F. Return `100 × √σ²` with σ² = (2 ÷ T) × Σ (ΔK ÷ K²) × e^(rT) × Q − (1 ÷ T) × (F ÷ K0 − 1)².',
          starter: `import math
import numpy as np

def vix_like(K, Q, F, T, r):
    K = np.asarray(K, dtype=float)
    Q = np.asarray(Q, dtype=float)
    pass`,
          solution: `import math
import numpy as np

def vix_like(K, Q, F, T, r):
    K = np.asarray(K, dtype=float)
    Q = np.asarray(Q, dtype=float)
    dK = np.empty_like(K)
    dK[1:-1] = (K[2:] - K[:-2]) / 2
    dK[0] = K[1] - K[0]
    dK[-1] = K[-1] - K[-2]
    K0 = K[K <= F].max()
    var = 2 / T * np.sum(dK / K**2 * math.exp(r * T) * Q) - (F / K0 - 1) ** 2 / T
    return 100 * math.sqrt(var)`,
          tests: `N = lambda x: 0.5 * (1 + math.erf(x / math.sqrt(2)))
def bs(S, K, T, s, call):
    d1 = (math.log(S / K) + s * s / 2 * T) / (s * math.sqrt(T))
    c = S * N(d1) - K * N(d1 - s * math.sqrt(T))
    return c if call else c - S + K
T = 30 / 365
Ks = np.arange(50, 201, 1.0)
Q = [bs(100, k, T, 0.2, False) if k < 100 else bs(100, k, T, 0.2, True) if k > 100 else 0.5 * (bs(100, k, T, 0.2, True) + bs(100, k, T, 0.2, False)) for k in Ks]
out = vix_like(Ks, Q, 100.0, T, 0.0)
assert out is not None, "the function returns nothing yet"
assert abs(out - 20) < 0.3, f"a flat 20% surface with fine strikes should give about 20, got {out:.2f}"
Q2 = [bs(100, k, T, 0.3, False) if k < 100 else bs(100, k, T, 0.3, True) if k > 100 else 0.5 * (bs(100, k, T, 0.3, True) + bs(100, k, T, 0.3, False)) for k in Ks]
assert abs(vix_like(Ks, Q2, 100.0, T, 0.0) - 30) < 0.5, "a flat 30% surface should give about 30"
assert abs(vix_like([90, 100, 110], [1.0, 2.0, 1.0], 100.0, 0.1, 0.0) - 100 * math.sqrt(2 / 0.1 * (10 / 8100 + 20 / 10000 + 10 / 12100))) < 1e-9, "end strikes use the gap to their one neighbour"`,
          why: 'The strip of options holds the market\'s price of variance for every level the index might reach, and the 1/K² weights turn option prices into variance. On a flat surface it gives back the flat volatility; on a real skewed one it comes out above the at-the-money IV.',
        },
        {
          kind: 'bug',
          id: 'qoptions-varprem-10',
          ask: 'This VIX-style calculation gives values around 200 instead of 20 on a flat 20% surface with strikes near 100. Which line is wrong?',
          code: `import math
import numpy as np

def strip_variance(K, Q, dK, F, K0, T, r):
    total = np.sum(dK / K * math.exp(r * T) * Q)
    return 2 / T * total - (F / K0 - 1) ** 2 / T`,
          line: 5,
          fix: '    total = np.sum(dK / K**2 * math.exp(r * T) * Q)',
          why: 'The weight is ΔK ÷ K². With strikes near 100, dividing by K once leaves every term 100 times too big, so σ² is 100 times too large and its root, the VIX-like number, 10 times. A test on a flat surface, where the answer is known, catches it at once.',
        },
        {
          kind: 'design',
          id: 'qoptions-varprem-11',
          ask: 'Someone proposes a systematic strategy: sell one-month SPX strangles every month, because the variance risk premium is positive. What do you need to see before taking it seriously?',
          checklist: [
            { point: 'A backtest over periods that include 1987, 2008, February 2018 and March 2020, with real option prices', why: 'A sample without a crash shows only the gains.' },
            { point: 'The worst month and the worst drawdown, not the average or the win rate', why: 'The strategy lives or dies in its tail.' },
            { point: 'Sizing by a stress loss, such as the index down 20% with IV doubling', why: 'Margin can rise sharply at the worst moment and force a sale near the low.' },
            { point: 'Defined risk through wings, or a reason why undefined risk is acceptable', why: 'Buying protection costs part of the premium but caps the loss.' },
            { point: 'Costs: bid-ask on every leg, and the cost of closing early', why: 'A small premium with wide spreads leaves little after costs.' },
            { point: 'Evidence that the premium persists after the strategy became well known', why: 'Crowded short volatility makes the spikes worse when everyone exits.' },
            { point: 'A plan for the spike: rules decided in advance for adjusting or closing', why: 'Decisions made during a VIX doubling are the worst ones.' },
          ],
          why: 'A positive average premium is necessary and far from sufficient. The question is whether the account survives the months the premium is paying for.',
        },
      ],
    },
    {
      id: 'qoptions-lab',
      title: 'Lab: an option pricer in NumPy',
      summary: 'Black-Scholes, a binomial tree with early exercise, Monte Carlo with a confidence interval, a safe implied volatility solver and a delta hedging simulation, each checked against the others.',
      text: [
        'This lab builds a small pricing library and makes its parts check each other. Black-Scholes is the reference. The tree must agree with it on European options and add early exercise. Monte Carlo must put Black-Scholes inside its confidence interval. The implied volatility solver must give back the σ that produced a price. The hedging simulation must show a P&L near zero when realised volatility equals implied, and the right sign when it does not.',
        'Each step is self-contained: the functions it needs are repeated in its starter, so you can run it on its own. All prices are made up and all random numbers come from fixed seeds.',
        'A pricer that agrees with itself is not proven right, but one that disagrees is certainly wrong somewhere. Known answers, special cases and limits are the tests a quant writes first.',
      ],
      rules: [
        'Test each method against a known answer before trusting it on an unknown one.',
        'Trees: agree with Black-Scholes on European options, then add exercise.',
        'Monte Carlo: report an interval; Black-Scholes should fall inside it.',
        'IV: round trips must return the input; impossible prices must return nothing.',
        'Hedging: zero average P&L when realised equals implied; the sign of σ_i − σ_r for a short option otherwise.',
      ],
      questions: [
        {
          kind: 'write',
          id: 'qoptions-lab-1',
          ask: 'Step 1: Black-Scholes. Write `bs_price(S, K, T, r, sigma, kind)` for kind "call" or "put" on a stock without dividends, with N(x) = 0.5 × (1 + erf(x ÷ √2)).',
          starter: `import math

def bs_price(S, K, T, r, sigma, kind="call"):
    pass`,
          solution: `import math

def bs_price(S, K, T, r, sigma, kind="call"):
    N = lambda x: 0.5 * (1 + math.erf(x / math.sqrt(2)))
    d1 = (math.log(S / K) + (r + sigma**2 / 2) * T) / (sigma * math.sqrt(T))
    d2 = d1 - sigma * math.sqrt(T)
    if kind == "call":
        return S * N(d1) - K * math.exp(-r * T) * N(d2)
    return K * math.exp(-r * T) * N(-d2) - S * N(-d1)`,
          tests: `out = bs_price(100, 100, 1, 0.05, 0.2)
assert out is not None, "the function returns nothing yet"
assert abs(out - 10.4506) < 1e-4, f"call: expected 10.4506, got {out}"
p = bs_price(100, 100, 1, 0.05, 0.2, "put")
assert abs(p - 5.5735) < 1e-4, f"put: expected 5.5735, got {p}"
for K in (80, 100, 125):
    c, q = bs_price(100, K, 0.5, 0.03, 0.3), bs_price(100, K, 0.5, 0.03, 0.3, "put")
    assert abs(c - q - (100 - K * math.exp(-0.03 * 0.5))) < 1e-9, f"put-call parity fails at strike {K}"`,
          why: 'Put-call parity is the first test of any pricer: it holds whatever σ is, so it checks the discounting and the signs independently of the volatility.',
        },
        {
          kind: 'write',
          id: 'qoptions-lab-2',
          numpy: true,
          ask: 'Step 2: a tree for any payoff. Write `tree_price(S, K, T, r, sigma, N, payoff, american)` where `payoff(prices, K)` returns the exercise value of an array of prices. Use the CRR tree and, if `american`, take the larger of holding and exercising at every node.',
          starter: `import math
import numpy as np

def call(x, K):
    return np.maximum(x - K, 0.0)

def put(x, K):
    return np.maximum(K - x, 0.0)

def tree_price(S, K, T, r, sigma, N, payoff, american=False):
    pass`,
          solution: `import math
import numpy as np

def call(x, K):
    return np.maximum(x - K, 0.0)

def put(x, K):
    return np.maximum(K - x, 0.0)

def tree_price(S, K, T, r, sigma, N, payoff, american=False):
    dt = T / N
    u = math.exp(sigma * math.sqrt(dt))
    d = 1 / u
    q = (math.exp(r * dt) - d) / (u - d)
    disc = math.exp(-r * dt)
    j = np.arange(N + 1)
    V = payoff(S * u**j * d**(N - j), K)
    for i in range(N - 1, -1, -1):
        V = disc * (q * V[1:] + (1 - q) * V[:-1])
        if american:
            j = np.arange(i + 1)
            V = np.maximum(V, payoff(S * u**j * d**(i - j), K))
    return float(V[0])`,
          tests: `out = tree_price(100, 100, 1, 0.05, 0.2, 400, call)
assert out is not None, "the function returns nothing yet"
assert abs(out - 10.4506) < 0.02, f"European call should match Black-Scholes 10.4506, got {out:.4f}"
assert abs(tree_price(100, 100, 1, 0.05, 0.2, 400, put) - 5.5735) < 0.02, "European put should match Black-Scholes 5.5735"
am = tree_price(100, 100, 1, 0.05, 0.2, 400, put, True)
assert 6.0 < am < 6.2, f"American put is about 6.09, got {am:.4f}"
digital = lambda x, K: (x > K).astype(float)
dg = tree_price(100, 100, 1, 0.0, 0.2, 401, digital)
assert 0.43 < dg < 0.49, f"a digital call pays 1 above the strike; with r = 0 its price is the risk-neutral chance, about 0.46, got {dg:.3f}"`,
          why: 'Passing the payoff as a function turns one tree into a pricer for calls, puts, digitals or anything that depends only on the price at each node. The digital shows what q-probabilities are: the price of a bet that pays $1.',
        },
        {
          kind: 'output',
          id: 'qoptions-lab-3',
          ask: 'Step 3: three numbers for the same at-the-money put (S = K = 100, T = 1, r = 5%, σ = 20%). What does this print?',
          code: `import math
import numpy as np

def put_tree(S, K, T, r, s, N, american):
    dt = T / N; u = math.exp(s * math.sqrt(dt)); d = 1 / u
    q = (math.exp(r * dt) - d) / (u - d)
    V = np.maximum(K - S * u**np.arange(N + 1) * d**(N - np.arange(N + 1)), 0)
    for i in range(N - 1, -1, -1):
        V = math.exp(-r * dt) * (q * V[1:] + (1 - q) * V[:-1])
        if american:
            V = np.maximum(V, K - S * u**np.arange(i + 1) * d**(i - np.arange(i + 1)))
    return V[0]

N_ = lambda x: 0.5 * (1 + math.erf(x / math.sqrt(2)))
d1 = (math.log(1) + (0.05 + 0.02) * 1) / 0.2
bs = 100 * math.exp(-0.05) * N_(-(d1 - 0.2)) - 100 * N_(-d1)
print(round(bs, 2), round(float(put_tree(100, 100, 1, 0.05, 0.2, 500, False)), 2), round(float(put_tree(100, 100, 1, 0.05, 0.2, 500, True)), 2))`,
          answer: '5.57 5.57 6.09',
          why: 'The European tree agrees with Black-Scholes to the cent, which validates the tree. Then the American flag adds about 52 cents: the value of being able to take the strike early and earn interest on it, with rates at 5%.',
        },
        {
          kind: 'write',
          id: 'qoptions-lab-4',
          numpy: true,
          ask: 'Step 4: Monte Carlo with an interval. Write `mc_price(S, K, T, r, sigma, n_pairs, seed, kind)` using antithetic pairs from `np.random.default_rng(seed).standard_normal(n_pairs)`. Return `(price, low, high)`, the 95% interval being price ± 1.96 standard errors over the pair averages.',
          starter: `import numpy as np

def mc_price(S, K, T, r, sigma, n_pairs, seed, kind="call"):
    z = np.random.default_rng(seed).standard_normal(n_pairs)
    pass`,
          solution: `import numpy as np

def mc_price(S, K, T, r, sigma, n_pairs, seed, kind="call"):
    z = np.random.default_rng(seed).standard_normal(n_pairs)
    def disc_pay(x):
        ST = S * np.exp((r - 0.5 * sigma**2) * T + sigma * np.sqrt(T) * x)
        pay = np.maximum(ST - K, 0) if kind == "call" else np.maximum(K - ST, 0)
        return np.exp(-r * T) * pay
    pair = 0.5 * (disc_pay(z) + disc_pay(-z))
    price = float(pair.mean())
    half = 1.96 * float(pair.std(ddof=1)) / np.sqrt(n_pairs)
    return price, price - half, price + half`,
          tests: `out = mc_price(100, 100, 1, 0.05, 0.2, 100000, 11)
assert out is not None, "the function returns nothing yet"
p, lo, hi = out
assert lo < p < hi, "the price must sit inside its interval"
assert lo < 10.4506 < hi, f"Black-Scholes 10.4506 should fall inside the 95% interval ({lo:.4f}, {hi:.4f})"
assert hi - lo < 0.12, f"with 100,000 pairs the interval should be narrower than 12 cents, got {hi - lo:.4f}"
p2, lo2, hi2 = mc_price(100, 100, 1, 0.05, 0.2, 100000, 11, "put")
assert lo2 < 5.5735 < hi2, f"the put: Black-Scholes 5.5735 should fall inside ({lo2:.4f}, {hi2:.4f})"
inside = sum(lo3 < 10.4506 < hi3 for _, lo3, hi3 in (mc_price(100, 100, 1, 0.05, 0.2, 2000, s) for s in range(40)))
assert inside >= 33, f"about 95% of intervals should contain the true price; {inside} of 40 did"`,
          why: 'The last test checks the interval itself: across 40 seeds, about 38 should contain the true price. An interval that almost never misses is too wide; one that misses often is computed wrongly.',
        },
        {
          kind: 'write',
          id: 'qoptions-lab-5',
          ask: 'Step 5: a safe implied volatility for calls and puts. Write `implied_vol(price, S, K, T, r, kind)`: return None outside the bounds (call: max(0, S − Ke^(−rT)) < price < S; put: max(0, Ke^(−rT) − S) < price < Ke^(−rT)). Otherwise use Newton steps inside a bracket [1e-4, 5], bisecting when a step leaves it, until the price error is below 1e-10.',
          starter: `import math

def N(x):
    return 0.5 * (1 + math.erf(x / math.sqrt(2)))

def bs_price(S, K, T, r, s, kind="call"):
    d1 = (math.log(S / K) + (r + s * s / 2) * T) / (s * math.sqrt(T))
    d2 = d1 - s * math.sqrt(T)
    if kind == "call":
        return S * N(d1) - K * math.exp(-r * T) * N(d2)
    return K * math.exp(-r * T) * N(-d2) - S * N(-d1)

def vega(S, K, T, r, s):
    d1 = (math.log(S / K) + (r + s * s / 2) * T) / (s * math.sqrt(T))
    return S * math.sqrt(T) * math.exp(-d1 * d1 / 2) / math.sqrt(2 * math.pi)

def implied_vol(price, S, K, T, r, kind="call"):
    pass`,
          solution: `import math

def N(x):
    return 0.5 * (1 + math.erf(x / math.sqrt(2)))

def bs_price(S, K, T, r, s, kind="call"):
    d1 = (math.log(S / K) + (r + s * s / 2) * T) / (s * math.sqrt(T))
    d2 = d1 - s * math.sqrt(T)
    if kind == "call":
        return S * N(d1) - K * math.exp(-r * T) * N(d2)
    return K * math.exp(-r * T) * N(-d2) - S * N(-d1)

def vega(S, K, T, r, s):
    d1 = (math.log(S / K) + (r + s * s / 2) * T) / (s * math.sqrt(T))
    return S * math.sqrt(T) * math.exp(-d1 * d1 / 2) / math.sqrt(2 * math.pi)

def implied_vol(price, S, K, T, r, kind="call"):
    pv = K * math.exp(-r * T)
    lo_b, hi_b = (max(0.0, S - pv), S) if kind == "call" else (max(0.0, pv - S), pv)
    if not (lo_b < price < hi_b):
        return None
    lo, hi, s = 1e-4, 5.0, 0.5
    for _ in range(200):
        diff = bs_price(S, K, T, r, s, kind) - price
        if abs(diff) < 1e-10:
            break
        if diff > 0:
            hi = s
        else:
            lo = s
        v = vega(S, K, T, r, s)
        step = s - diff / v if v > 0 else -1.0
        s = step if lo < step < hi else (lo + hi) / 2
    return s`,
          tests: `out = implied_vol(bs_price(100, 105, 0.5, 0.02, 0.27), 100, 105, 0.5, 0.02)
assert out is not None, "the function returns nothing yet for a valid call price"
assert abs(out - 0.27) < 1e-7, f"call round trip: expected 0.27, got {out}"
got = implied_vol(bs_price(100, 90, 0.25, 0.02, 0.35, "put"), 100, 90, 0.25, 0.02, "put")
assert got is not None and abs(got - 0.35) < 1e-7, f"put round trip: expected 0.35, got {got}"
got = implied_vol(bs_price(100, 150, 0.04, 0.0, 1.1), 100, 150, 0.04, 0.0)
assert got is not None and abs(got - 1.1) < 1e-6, f"far out of the money, short expiry: expected 1.1, got {got}"
assert implied_vol(1.0, 100, 120, 0.5, 0.0, "put") is None, "a put worth less than its intrinsic value of 20 has no IV"
assert implied_vol(150.0, 100, 50, 0.5, 0.0, "put") is None, "a put cannot be worth more than the discounted strike"`,
          why: 'Puts need their own bounds: at most the discounted strike, at least the discounted strike minus the stock. With them, the same safeguarded loop handles both kinds, since price rises with σ for both.',
        },
        {
          kind: 'bug',
          id: 'qoptions-lab-6',
          ask: 'Step 6: one step of a hedging simulation for a short call, over all paths at once. `cash` and `shares` hold each path\'s account and hedge before the step. The simulated P&L comes out with a large positive mean even when realised equals implied volatility. Which line is wrong?',
          code: `import numpy as np

def hedge_step(S_old, S_new, cash, shares, new_delta, r, dt):
    cash = cash * np.exp(r * dt)
    cash = cash - (new_delta - shares) * S_old
    return cash, new_delta`,
          line: 5,
          fix: '    cash = cash - (new_delta - shares) * S_new',
          why: 'The hedge is adjusted after the stock has moved, so the shares are bought or sold at the new price. Trading at the old price is a fill you could never get: for a short call you buy as the stock rises, and this version buys at the lower price you missed.',
        },
        {
          kind: 'write',
          id: 'qoptions-lab-7',
          numpy: true,
          ask: 'Step 7: the hedging simulation. Write `hedge_sim(S0, K, T, sig_imp, sig_real, n_steps, n_paths, seed)` with r = 0: sell one call at its Black-Scholes price at `sig_imp`, hold the delta at `sig_imp`, simulate the stock with `sig_real` (GBM with drift −σ²/2 per year, normals from `np.random.default_rng(seed).standard_normal((n_steps, n_paths))`, one row per step), rebalance after every step but the last, and return the array of final P&Ls.',
          starter: `import math
import numpy as np

erf = np.vectorize(math.erf)

def bs_call(S, K, tau, s):
    d1 = (np.log(S / K) + s * s / 2 * tau) / (s * np.sqrt(tau))
    N = lambda x: 0.5 * (1 + erf(x / math.sqrt(2)))
    return S * N(d1) - K * N(d1 - s * np.sqrt(tau))

def bs_delta(S, K, tau, s):
    d1 = (np.log(S / K) + s * s / 2 * tau) / (s * np.sqrt(tau))
    return 0.5 * (1 + erf(d1 / math.sqrt(2)))

def hedge_sim(S0, K, T, sig_imp, sig_real, n_steps, n_paths, seed):
    z = np.random.default_rng(seed).standard_normal((n_steps, n_paths))
    dt = T / n_steps
    pass`,
          solution: `import math
import numpy as np

erf = np.vectorize(math.erf)

def bs_call(S, K, tau, s):
    d1 = (np.log(S / K) + s * s / 2 * tau) / (s * np.sqrt(tau))
    N = lambda x: 0.5 * (1 + erf(x / math.sqrt(2)))
    return S * N(d1) - K * N(d1 - s * np.sqrt(tau))

def bs_delta(S, K, tau, s):
    d1 = (np.log(S / K) + s * s / 2 * tau) / (s * np.sqrt(tau))
    return 0.5 * (1 + erf(d1 / math.sqrt(2)))

def hedge_sim(S0, K, T, sig_imp, sig_real, n_steps, n_paths, seed):
    z = np.random.default_rng(seed).standard_normal((n_steps, n_paths))
    dt = T / n_steps
    S = np.full(n_paths, float(S0))
    shares = bs_delta(S, K, T, sig_imp)
    cash = bs_call(S, K, T, sig_imp) - shares * S
    for i in range(n_steps):
        S = S * np.exp(-0.5 * sig_real**2 * dt + sig_real * math.sqrt(dt) * z[i])
        if i < n_steps - 1:
            new = bs_delta(S, K, T - (i + 1) * dt, sig_imp)
            cash = cash - (new - shares) * S
            shares = new
    return cash + shares * S - np.maximum(S - K, 0)`,
          tests: `out = hedge_sim(100, 100, 0.25, 0.2, 0.2, 48, 3000, 1)
assert out is not None, "the function returns nothing yet"
assert len(out) == 3000, f"one P&L per path, got {len(out)}"
assert abs(out.mean()) < 0.06, f"realised equal to implied: mean P&L should be near 0, got {out.mean():.3f}"
cheap = hedge_sim(100, 100, 0.25, 0.2, 0.15, 48, 3000, 1)
assert cheap.mean() > 0.8, f"short at 20, realised 15: expect about +1.0 per share, got {cheap.mean():.3f}"
dear = hedge_sim(100, 100, 0.25, 0.2, 0.25, 48, 3000, 1)
assert dear.mean() < -0.8, f"short at 20, realised 25: expect about -1.0 per share, got {dear.mean():.3f}"
coarse = hedge_sim(100, 100, 0.25, 0.2, 0.2, 12, 3000, 1)
ratio = coarse.std() / out.std()
assert 1.7 < ratio < 2.3, f"a quarter of the hedges should about double the spread, got a ratio of {ratio:.2f}"`,
          why: 'The three facts of the hedging lesson in one function: zero on average at fair volatility, a gain or loss of about vega × (σ_i − σ_r) otherwise, and an error that halves with four times the hedges. The made-up paths have no jumps and no costs, so real hedging is worse.',
        },
        {
          kind: 'design',
          id: 'qoptions-lab-8',
          ask: 'Step 8: before anyone uses your pricer for real decisions, what else must be true of it, and what would you add?',
          checklist: [
            { point: 'Compare it with an independent reference library on many random inputs', why: 'Your tests check self-consistency; an outside reference catches shared mistakes.' },
            { point: 'Handle dividends and the forward price', why: 'Index and ETF options without dividends in the model are mispriced, most for puts and long expiries.' },
            { point: 'Feed it a volatility surface, not one σ', why: 'One volatility misprices every strike away from the money.' },
            { point: 'Test the edges: T near zero, σ near zero, deep in and out of the money', why: 'Divisions by σ√T and logs of tiny numbers break there first.' },
            { point: 'Check speed on a full chain, and vectorise where it is slow', why: 'A pricer that takes minutes per chain will be bypassed.' },
            { point: 'Write down the assumptions: no jumps, constant rates, the day count', why: 'Users must know what the number leaves out.' },
            { point: 'Keep the tests and run them on every change', why: 'Pricing bugs are silent; only tests notice them.' },
          ],
          why: 'The lab built the core. Real pricers spend most of their code on data, conventions and edge cases, and the tests are what make them trustworthy.',
        },
      ],
    },
  ],
}
