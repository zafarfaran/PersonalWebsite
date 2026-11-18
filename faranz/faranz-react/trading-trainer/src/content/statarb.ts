import type { Module } from '../types'

export const statarb: Module = {
  id: 'statarb',
  title: 'Statistical arbitrage and pairs',
  summary:
    'Relative value trading done properly: market-neutral books of many small bets, finding pairs, the Engle-Granger test, the spread as an Ornstein-Uhlenbeck process, entry, exit and stop rules, baskets and residual reversal, and the ways it breaks, with a full pairs backtest in NumPy.',
  lessons: [
    {
      id: 'statarb-idea',
      title: 'Relative value and market neutral',
      summary: 'Betting on prices against each other, not on the market: dollar and beta neutral books, many small bets, and why the edge got crowded.',
      widget: 'statarb-neutral',
      text: [
        '**Statistical arbitrage** bets on relative prices. Buy what looks cheap against something similar, sell short what looks rich, and size the two sides so that a move of the whole market mostly cancels. The quant module traded one pair; a stat arb book holds dozens or hundreds of such bets at once, each with a small edge, and leans on their number.',
        "Two ways to balance a book. **Dollar neutral**: the long dollars equal the short dollars. **Beta neutral**: the market exposure cancels, `Σ dollarsᵢ × βᵢ = 0`, where β is each stock's sensitivity to the market. A dollar-neutral book that is long high-beta stocks and short low-beta ones still rises and falls with the market. **Gross exposure** is long plus short dollars; **net** is long minus short. Gross ÷ capital is the leverage.",
        "Breadth is the point. The quant module's fundamental law says the information ratio grows with the square root of the number of independent bets. N bets, each with Sharpe S and average pairwise correlation ρ, combine to about `S × √N ÷ √(1 + (N − 1)ρ)`. Twenty-five bets with S = 0.2 give 1.0 if independent, but only about 0.54 if ρ = 0.1. Bets that share a common driver are fewer bets than they look.",
        'A short history. A group at Morgan Stanley in the mid-1980s, associated with Gerry Bamberger and Nunzio Tartaglia, traded pairs of stocks by computer and was reported to have made about $50 million in 1987; it broke up in 1989 and its alumni spread the idea to other firms. Gatev, Goetzmann and Rouwenhorst (2006) found average excess returns of about 11% a year for simple pairs on US stocks from 1962 to 2002. Do and Faff (2010) found those profits shrinking decade by decade. As more capital chased the same trades, the gaps closed faster and the edge thinned.',
        'It is not arbitrage in the textbook sense: nothing locks in a profit. A stat arb position is a statistical bet that a relationship continues, and it can lose for a long time. Two legs mean double costs, the short leg pays a borrow fee, and every other fund running similar models holds similar positions.',
      ],
      rules: [
        'Dollar neutral: long $ = short $. Beta neutral: Σ dollars × β = 0.',
        'Gross = long + short; net = long − short; leverage = gross ÷ capital.',
        'N bets with Sharpe S and correlation ρ: S × √N ÷ √(1 + (N − 1)ρ).',
        'It is a statistical bet, not a locked-in profit.',
        'Crowded trades thin the edge and fail together.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'statarb-idea-1',
          ask: 'You are long $100,000 of a stock with β = 1.2 and short $100,000 of a stock with β = 0.8. The book is dollar neutral. If the market falls 5% and nothing else happens, what is your P&L in dollars?',
          answer: -2000,
          check: '-0.05 * (100000 * 1.2 - 100000 * 0.8)',
          why: 'The beta-weighted exposure is $120,000 − $80,000 = $40,000 long the market. A 5% fall costs 0.05 × $40,000 = $2,000. Equal dollars do not mean no market risk.',
        },
        {
          kind: 'number',
          id: 'statarb-idea-2',
          ask: 'You buy $60,000 of a stock with β = 1.5. How many dollars of a stock with β = 1.0 must you short to be beta neutral?',
          answer: 90000,
          check: '60000 * 1.5 / 1.0',
          why: 'The long leg carries 60,000 × 1.5 = $90,000 of market exposure, so the short leg needs $90,000 at β = 1.0. The book is beta neutral but not dollar neutral: it is $30,000 net short in dollars.',
        },
        {
          kind: 'number',
          id: 'statarb-idea-3',
          ask: 'A $100,000 account holds $150,000 of longs and $130,000 of shorts. What is its gross leverage?',
          answer: 2.8,
          check: '(150000 + 130000) / 100000',
          why: 'Gross exposure is $280,000, 2.8 times capital, even though the net exposure is only $20,000. Leverage is measured on gross: a 5% move against both legs costs $14,000, 14% of the account.',
        },
        {
          kind: 'number',
          id: 'statarb-idea-4',
          ask: 'You run 25 pairs, each with a Sharpe ratio of 0.2, sized to equal risk and independent of each other. What Sharpe ratio does the book have?',
          answer: 1,
          check: '0.2 * math.sqrt(25)',
          why: '0.2 × √25 = 1.0. Each bet is weak; many independent weak bets make a usable whole. That is the business model of stat arb, and its weak point is the word "independent".',
        },
        {
          kind: 'number',
          id: 'statarb-idea-5',
          ask: 'Same 25 pairs with Sharpe 0.2 each, but every pair of bets is correlated at 0.1. Using S × √N ÷ √(1 + (N − 1)ρ), what is the Sharpe ratio of the book? Give two decimals.',
          answer: 0.54,
          tol: 0.006,
          check: '0.2 * math.sqrt(25) / math.sqrt(1 + 24 * 0.1)',
          why: '1.0 ÷ √3.4 ≈ 0.54. A correlation of 0.1 looks harmless, but across 25 bets it nearly halves the benefit of breadth. In a crowded unwind the correlation between stat arb bets jumps, and the book behaves like one big bet.',
        },
        {
          kind: 'output',
          id: 'statarb-idea-6',
          ask: 'Four positions, in signed dollars (negative is short), and their betas. What does this print?',
          code: `import numpy as np

dollars = np.array([50000, 30000, -40000, -45000])
betas = np.array([1.2, 0.9, 1.0, 1.1])
print(int(dollars.sum()), int(np.abs(dollars).sum()), round(float(dollars @ betas)))`,
          answer: '-5000 165000 -2500',
          why: 'Net is −$5,000, gross $165,000, and the beta-weighted exposure 60,000 + 27,000 − 40,000 − 49,500 = −$2,500. Three different numbers describe one book; a risk report needs all three.',
        },
        {
          kind: 'bug',
          id: 'statarb-idea-7',
          ask: 'This should return the dollars to short so that a long leg is beta neutral. For $60,000 long at β = 1.5 against a short stock with β = 1.0 it returns $40,000 instead of $90,000.',
          code: `def beta_neutral_short(long_dollars, beta_long, beta_short):
    # dollars to short so both legs carry the same market exposure
    return long_dollars * beta_short / beta_long`,
          line: 3,
          fix: '    return long_dollars * beta_long / beta_short',
          why: 'The short dollars must satisfy short × β_short = long × β_long, so short = long × β_long ÷ β_short. Inverting the ratio leaves the book with a large net market exposure in the direction of the high-beta leg.',
        },
        {
          kind: 'write',
          id: 'statarb-idea-8',
          numpy: true,
          ask: 'Write `exposures(dollars, betas, capital)`: from signed dollar positions and their betas, return a tuple `(gross_leverage, net_dollars, beta_dollars)`: gross ÷ capital, the sum of the signed dollars, and the sum of dollars × beta.',
          starter: `import numpy as np

def exposures(dollars, betas, capital):
    d = np.asarray(dollars, dtype=float)
    b = np.asarray(betas, dtype=float)
    pass`,
          solution: `import numpy as np

def exposures(dollars, betas, capital):
    d = np.asarray(dollars, dtype=float)
    b = np.asarray(betas, dtype=float)
    return float(np.abs(d).sum() / capital), float(d.sum()), float(d @ b)`,
          tests: `out = exposures([150000, -130000], [1.0, 1.0], 100000)
assert out is not None, "the function returns nothing yet"
g, n, bd = out
assert abs(g - 2.8) < 1e-9, f"gross leverage is (150,000 + 130,000) / 100,000 = 2.8, got {g}"
assert abs(n - 20000) < 1e-9, f"net is 150,000 - 130,000 = 20,000, got {n}"
g, n, bd = exposures([100000, -100000], [1.2, 0.8], 50000)
assert abs(n) < 1e-9 and abs(bd - 40000) < 1e-9, f"dollar neutral but 40,000 beta dollars long, got net {n}, beta dollars {bd}"
assert abs(g - 4.0) < 1e-9, "gross uses absolute values: shorts add to gross"`,
          why: 'Gross uses absolute values, because a short loses money when its price rises in the same way a long loses when its price falls. Net and beta-weighted net are signed. A book can be flat on one and heavily exposed on another.',
        },
        {
          kind: 'choice',
          id: 'statarb-idea-9',
          ask: 'In the figure, the long stock has β = 1.4 and the short stock β = 0.7. Set the hedge to 1.0 (dollar neutral), then to 2.0. What happens?',
          options: [
            'Nothing changes: both settings are market neutral',
            'At 1.0 the book still has a beta near 0.7 and follows the market; at 2.0 the beta is near 0 and the book stops tracking the market',
            'At 2.0 the book doubles its market exposure',
            'The market line moves when you change the hedge',
          ],
          answer: 1,
          why: "Beta of the book = 1.4 − 0.7 × hedge, which is 0.7 at 1.0 and 0 at 2.0. Dollar neutral leaves most of the long leg's extra beta in place. What is left at 2.0 is the relative move of the two stocks, the thing stat arb means to trade.",
        },
        {
          kind: 'choice',
          id: 'statarb-idea-10',
          ask: 'Someone says statistical arbitrage is "risk-free because it is hedged". What is the best reply?',
          options: [
            'They are right, as long as the book is beta neutral',
            'Hedging removes most market risk, but the bet that the relationship continues can still lose, and similar funds can force prices against you',
            'They are right for pairs in the same industry',
            'Stat arb has more market risk than buying an index fund',
          ],
          answer: 1,
          why: 'The hedge removes one risk, the market, and leaves the risk you chose to take: that prices converge. They may not, and crowded positions can diverge further when other holders sell. "Arbitrage" in the name is history, not a promise.',
        },
        {
          kind: 'design',
          id: 'statarb-idea-11',
          ask: 'You plan a small market-neutral book of 20 equity pairs. Write the exposure limits and checks you will run every day before trading.',
          checklist: [
            { point: 'Net dollars and beta-weighted net, both close to zero within a set band', why: 'Dollar neutral alone can hide a large market bet.' },
            { point: 'Gross leverage cap, for example no more than 2 times capital', why: 'Leverage turns a small adverse move in many spreads into a large loss.' },
            { point: 'A maximum size per pair, a small share of capital', why: 'One broken pair should hurt, not end the book.' },
            { point: 'Sector and factor exposure: how many pairs share a sector or a style', why: 'Bets with a common driver are fewer bets than they look.' },
            { point: 'Short borrow availability and fee for every short leg', why: 'A recalled or expensive borrow can force you out at a bad time.' },
            { point: 'The correlation of pair returns, recent against long run', why: 'Rising correlation means breadth is shrinking and an unwind would hit all at once.' },
            { point: 'A daily loss limit for the whole book', why: 'It stops a crowded unwind from compounding over several days.' },
          ],
          why: 'Market neutral describes one exposure. The checks cover the others: leverage, concentration, borrow and correlation, which are how stat arb books actually get hurt.',
        },
      ],
    },
    {
      id: 'statarb-finding',
      title: 'Finding pairs',
      summary: 'Where candidate pairs come from, correlation against cointegration, the distance method, and the multiple-testing trap in screening.',
      widget: 'statarb-coint',
      text: [
        'Start from economics, not from a scan of everything. Good candidates share what drives their value: two large banks, two railroads, two share classes of one company, a stock and its sector ETF. Both should be liquid and easy to borrow. The economic link is the reason to expect a gap to close.',
        '**Correlation of returns** measures whether two stocks move together day to day. It says nothing about whether their price levels stay together. If one company grows 3% a year faster than the other, daily returns can be correlated at 0.9 while the gap between their prices widens for ever. A pair trader needs the **spread** to be stationary, which is **cointegration**; correlation is neither required nor enough.',
        "The **distance method** of Gatev, Goetzmann and Rouwenhorst is the simplest screen. Over a 12-month **formation period**, scale each stock's total-return price to 1 at the start. For every pair, add up the squared differences of the two scaled series (the **SSD**). Pick the pairs with the smallest SSD and trade them over the next 6 months, opening when the scaled prices diverge by two formation standard deviations and closing when they cross. The authors say they chose 12 and 6 months arbitrarily and kept them fixed to avoid data snooping.",
        { code: `import numpy as np

def ssd(a, b):
    a, b = np.asarray(a, dtype=float), np.asarray(b, dtype=float)
    return float(((a / a[0] - b / b[0]) ** 2).sum())` },
        'The distance method has blind spots. It trades the two stocks one for one, with no hedge ratio. And the smallest SSD often belongs to pairs whose spread barely moves, so the gap, when it opens, is too small to pay the costs of four fills.',
        'Screening is multiple testing. 100 stocks make `100 × 99 ÷ 2 = 4,950` pairs; at a 5% significance level about 250 of them pass a cointegration test by chance alone. Prefer a small list chosen for economic reasons, test it on a formation window, and judge it on a later window it has not seen.',
      ],
      rules: [
        'Start from an economic link, then test. A scan of everything finds noise.',
        'Correlated returns are not cointegrated prices. Test the spread.',
        'Distance method: scale to 1, smallest SSD, open at 2 sd, close when they cross.',
        'n stocks give n(n − 1)/2 pairs. Expect 5% false passes at the 5% level.',
        'Form on one window, trade on the next.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'statarb-finding-1',
          ask: 'You screen 100 stocks against each other. How many distinct pairs is that?',
          answer: 4950,
          check: '100 * 99 / 2',
          why: 'Each stock pairs with 99 others, and each pair is counted twice that way, so 100 × 99 ÷ 2 = 4,950. The count grows with the square of the universe: 500 stocks give 124,750 pairs.',
        },
        {
          kind: 'number',
          id: 'statarb-finding-2',
          ask: 'None of those 4,950 pairs is truly cointegrated. You test each at the 5% level. About how many will pass anyway?',
          answer: 247.5,
          tol: 3,
          check: '4950 * 0.05',
          why: "About 250 false discoveries. A screen that reports \"250 cointegrated pairs\" may have found nothing at all. The quant module's multiple-testing rule applies: count every pair you tested.",
        },
        {
          kind: 'number',
          id: 'statarb-finding-3',
          ask: 'With a Bonferroni correction for 4,950 tests at an overall 5% level, what p-value must each pair beat? Give a decimal, for example 0.00002.',
          answer: 0.0000101,
          tol: 0.0000002,
          check: '0.05 / 4950',
          why: '0.05 ÷ 4,950 ≈ 0.00001. Almost no real pair clears a bar this high with a few years of data, which is the honest reason to test a short list chosen in advance rather than everything.',
        },
        {
          kind: 'output',
          id: 'statarb-finding-4',
          ask: 'The sum of squared differences of two scaled price series. What does this print?',
          code: `import numpy as np

a = np.array([50.0, 51.0, 52.0, 51.0])
b = np.array([20.0, 20.6, 20.6, 20.2])
print(round(float(((a / a[0] - b / b[0]) ** 2).sum()), 4))`,
          answer: '0.0003',
          why: 'Scaled, A is 1, 1.02, 1.04, 1.02 and B is 1, 1.03, 1.03, 1.01. The differences are 0, −0.01, 0.01, 0.01, and their squares add to 0.0003.',
        },
        {
          kind: 'bug',
          id: 'statarb-finding-5',
          ask: 'This distance should compare the shapes of two price paths. It ranks a $500 stock and a $20 stock as the worst possible pair even when they move identically.',
          code: `import numpy as np

def ssd(a, b):
    a, b = np.asarray(a, dtype=float), np.asarray(b, dtype=float)
    d = a - b
    return float((d ** 2).sum())`,
          line: 5,
          fix: '    d = a / a[0] - b / b[0]',
          why: 'Raw prices differ by their level, so the distance mostly measures how far apart the prices are, not how differently they move. Scaling each series to 1 at the start puts them on one footing.',
        },
        {
          kind: 'number',
          id: 'statarb-finding-6',
          ask: 'In the distance method, two scaled prices stand at 1.12 and 1.05. In the formation period the standard deviation of their difference was 0.03. How many standard deviations apart are they? Give two decimals.',
          answer: 2.33,
          tol: 0.006,
          check: '(1.12 - 1.05) / 0.03',
          why: '0.07 ÷ 0.03 ≈ 2.33, beyond the 2 standard deviation trigger, so the rule shorts the high one and buys the low one, one for one, until the scaled prices cross.',
        },
        {
          kind: 'choice',
          id: 'statarb-finding-7',
          ask: 'Two stocks over ten days. Their daily moves are almost always in the same direction and of similar size. What does the chart say about them as a pair?',
          chart: {
            title: 'Two prices',
            x: 'day',
            y: 'price',
            series: [
              { name: 'A', points: [100, 101.5, 103, 102.5, 105, 107, 106.5, 109, 111, 113], color: 'accent' },
              { name: 'B', points: [100, 100.6, 101.2, 100.6, 102.1, 103.2, 102.6, 104.1, 105.2, 106.3], color: 'blue' },
            ],
          },
          options: [
            'A strong pair: the returns are highly correlated',
            'Correlated returns, but the gap keeps widening: no sign of a stationary spread, so not a pair yet',
            'A strong pair: short A and buy B now, since the gap is at its widest',
            'They cannot be correlated, because their prices differ',
          ],
          answer: 1,
          why: 'Each day they move together, but A gains a little more on almost every day, so the gap grows steadily. A z-score rule would keep shorting A and buying B into a trend. Correlation is about daily moves; the trade needs the level of the gap to come back.',
        },
        {
          kind: 'choice',
          id: 'statarb-finding-8',
          ask: 'A distance screen of 300 stocks gives you its 20 smallest-SSD pairs. The top one is two utilities whose scaled prices have never differed by more than 0.4%. What is the main worry?',
          options: [
            'None: the smaller the distance, the better the pair',
            'Its spread barely moves, so even a 2 standard deviation gap may be too small to cover four fills and borrow',
            'Utilities cannot be shorted',
            'Small distances mean the stocks are not correlated',
          ],
          answer: 1,
          why: 'The SSD rewards pairs that hug each other, which often means tiny spread volatility. A gap of two tiny standard deviations is still tiny. Check the expected gain per trade against costs before trading the pair.',
        },
        {
          kind: 'choice',
          id: 'statarb-finding-9',
          ask: 'In the figure, switch between **Cointegrated** and **Correlated, drifting**. Which statement matches what you see?',
          options: [
            'The cointegrated pair always has the higher return correlation',
            'The drifting pair has the higher return correlation, yet its spread trends away; the cointegrated pair has lower correlation, yet its spread keeps coming back',
            'Both spreads come back to the same level',
            'Return correlation and spread behaviour always agree',
          ],
          answer: 1,
          why: 'The two ideas measure different things. A pair trader cares about the lower panel, the spread, and a high correlation in the readout does not make it stationary.',
        },
        {
          kind: 'write',
          id: 'statarb-finding-10',
          numpy: true,
          ask: 'Write `best_pair(P)`: `P` has shape (days, stocks). Scale every column to 1 at its first row, compute the SSD for every pair of columns i < j, and return the pair `(i, j)` with the smallest SSD.',
          starter: `import numpy as np

def best_pair(P):
    P = np.asarray(P, dtype=float)
    pass`,
          solution: `import numpy as np

def best_pair(P):
    P = np.asarray(P, dtype=float)
    S = P / P[0]
    best, pair = None, None
    for i in range(S.shape[1]):
        for j in range(i + 1, S.shape[1]):
            d = float(((S[:, i] - S[:, j]) ** 2).sum())
            if best is None or d < best:
                best, pair = d, (i, j)
    return pair`,
          tests: `P = np.array([[10.0, 50.0, 20.0], [10.5, 52.5, 19.0], [11.0, 55.0, 18.0]])
out = best_pair(P)
assert out is not None, "the function returns nothing yet"
assert tuple(out) == (0, 1), f"columns 0 and 1 move by the same percentages: (0, 1), got {out}"
rng = np.random.default_rng(3)
base = 100 * np.exp(np.cumsum(rng.normal(0, 0.01, 250)))
Q = np.column_stack([base * np.exp(rng.normal(0, 0.03, 250)), 3 * base * np.exp(rng.normal(0, 0.002, 250)), base * np.exp(rng.normal(0, 0.002, 250)), 100 * np.exp(np.cumsum(rng.normal(0, 0.01, 250)))])
assert tuple(best_pair(Q)) == (1, 2), f"columns 1 and 2 track the same path at different price levels, got {best_pair(Q)}"`,
          why: 'Scaling by the first row removes the price level, so a $150 stock and a $50 stock that move alike score as close. The double loop is the n(n − 1)/2 count from the lesson: fine for a hundred stocks, slow for thousands.',
        },
        {
          kind: 'design',
          id: 'statarb-finding-11',
          ask: 'You want pairs among the 30 largest US banks. Describe your screening process from the list of stocks to a short list you are willing to paper trade.',
          checklist: [
            { point: 'Group by business model: money-centre, regional, card lenders, custody banks', why: 'An economic link is the reason to expect a gap to close.' },
            { point: 'Drop stocks that are illiquid, hard to borrow or facing a merger or spin-off', why: 'Costs and corporate events decide whether a pair can be traded at all.' },
            { point: 'Use a formation window to test each candidate spread, and a later window to judge it', why: 'A pair that passes on the data that chose it proves nothing.' },
            { point: 'Count the pairs tested and raise the bar to match', why: '435 pairs among 30 stocks will give about 20 false passes at 5%.' },
            { point: 'Check the spread volatility against round-trip costs', why: 'A spread that barely moves cannot pay for four fills.' },
            { point: 'Look at how the spread behaved in stress, for example in March 2023', why: 'Bank pairs can split sharply when one bank has a funding problem.' },
            { point: 'Keep a short list, freeze the rules, and paper trade', why: 'Only data the screen never saw can test it.' },
          ],
          why: 'A screen is a search, and a search finds things by chance. Economic grouping, a holdout window and an honest count of tests are what separate a pair from a coincidence.',
        },
      ],
    },
    {
      id: 'statarb-coint',
      title: 'Cointegration properly: Engle-Granger',
      summary: 'The two steps: a regression for the hedge ratio, then a unit-root test on the residual with the right critical values.',
      text: [
        '**Step one.** Regress the log price of A on the log price of B with an intercept: `ln A = α + β × ln B + e`. The slope is `β = cov(a, b) ÷ var(b)` and the intercept `α = mean(a) − β × mean(b)`. The residual e is the spread. The hedge in shares follows from it: hold β dollars of B for each dollar of A, so `shares of B = β × dollars of A ÷ price of B`.',
        '**Step two.** Test the residual for a **unit root**, the property of a random walk. Run the **Dickey-Fuller** regression `Δe[t] = γ × e[t−1] + ε` and compute the t statistic of γ, `γ̂ ÷ se(γ̂)`. A clearly negative γ means the spread is pulled back. The **augmented** version adds a few lagged Δe terms to soak up short-term autocorrelation.',
        { code: `import numpy as np

def df_t(e):
    x, dy = e[:-1], np.diff(e)
    g = (x * dy).sum() / (x * x).sum()
    se = np.sqrt(((dy - g * x) ** 2).sum() / (len(dy) - 1) / (x * x).sum())
    return g / se` },
        'The t statistic is **not** compared with the normal curve, and not even with the plain Dickey-Fuller table. Step one chose β to make the residual as small and as steady as possible, so residuals look stationary more often than chance would suggest. For two series with a constant, the Engle-Granger 5% critical value is about **−3.34** (−3.90 at 1%, −3.04 at 10%, large-sample values from MacKinnon), against −2.86 for a plain Dickey-Fuller test and −1.65 for a one-sided normal test. In Python, `statsmodels.tsa.stattools.coint` does all of this; for more than two series the **Johansen** test (`coint_johansen`) is the usual tool.',
        'The order matters. Regressing A on B and B on A give different slopes, and their product is the R² of the fit, not 1. The tests can disagree too. And regressing one random walk on another often gives a high R² and an impressive slope by pure chance, the **spurious regression** that step two exists to catch.',
        'β is an estimate from one window. Fit it on past data only, check it on later windows, and expect it to drift. A residual that passes the test in one window and fails in the next is the most common result, not a surprise.',
      ],
      rules: [
        'Step 1: ln A = α + β ln B + e. β = cov ÷ var, α = mean(a) − β mean(b).',
        'Step 2: Δe = γ e[t−1] + ε. The t of γ must beat about −3.34 at 5% for two series.',
        'Never use normal or plain Dickey-Fuller critical values on a fitted residual.',
        'A on B and B on A differ: the slopes multiply to R².',
        'Shares of B = β × dollars of A ÷ price of B.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'statarb-coint-1',
          ask: 'Over the formation window, the covariance of ln A and ln B is 0.0018 and the variance of ln B is 0.0015. What is the hedge ratio β?',
          answer: 1.2,
          check: '0.0018 / 0.0015',
          why: 'β = cov ÷ var = 1.2. A moves about 1.2% for each 1% move in B, so each dollar of A is hedged with $1.20 of B.',
        },
        {
          kind: 'number',
          id: 'statarb-coint-2',
          ask: 'In the same window the mean of ln A is 4.60 and the mean of ln B is 3.90, with β = 1.2. What is the intercept α? Give two decimals.',
          answer: -0.08,
          tol: 0.001,
          check: '4.60 - 1.2 * 3.90',
          why: 'α = 4.60 − 1.2 × 3.90 = −0.08. The intercept makes the residual average zero over the window; without it, the spread would carry a constant offset that looks like a permanent signal.',
        },
        {
          kind: 'number',
          id: 'statarb-coint-3',
          ask: 'You buy $30,000 of A. The hedge ratio is 1.2 and B trades at $45. How many shares of B do you short?',
          answer: 800,
          check: '1.2 * 30000 / 45',
          why: 'β × $30,000 = $36,000 of B, and $36,000 ÷ $45 = 800 shares. In practice you round to whole shares, which leaves a small mismatch.',
        },
        {
          kind: 'number',
          id: 'statarb-coint-4',
          ask: 'The Dickey-Fuller regression on a residual gives γ̂ = −0.06 with a standard error of 0.015. What is the t statistic?',
          answer: -4,
          check: '-0.06 / 0.015',
          why: '−0.06 ÷ 0.015 = −4.0, beyond the Engle-Granger 5% value of about −3.34 (and the 1% value of −3.90). The test rejects a unit root: the evidence favours cointegration in this window.',
        },
        {
          kind: 'choice',
          id: 'statarb-coint-5',
          ask: 'The Engle-Granger test on a candidate pair gives t = −2.9. What do you conclude at the 5% level?',
          options: [
            'Cointegrated: −2.9 is far beyond −1.65 from the normal curve',
            'Cointegrated: −2.9 is beyond the Dickey-Fuller value of −2.86',
            'Not shown: for a fitted residual of two series the 5% value is about −3.34, and −2.9 does not reach it',
            'The test cannot be read without the R²',
          ],
          answer: 2,
          why: 'Fitting β makes residuals look stationary, so the bar is higher than for a series you did not fit. Using the plain Dickey-Fuller table here is a common way to find pairs that are not there.',
        },
        {
          kind: 'number',
          id: 'statarb-coint-6',
          ask: 'Regressing ln A on ln B gives a slope of 1.25 and an R² of 0.9. What slope do you get regressing ln B on ln A? Give two decimals.',
          answer: 0.72,
          tol: 0.006,
          check: '0.9 / 1.25',
          why: 'The two slopes multiply to R², so the reverse slope is 0.9 ÷ 1.25 = 0.72, not 1 ÷ 1.25 = 0.8. The hedge ratio depends on which stock you call the dependent one; check both directions.',
        },
        {
          kind: 'output',
          id: 'statarb-coint-7',
          ask: 'Two random walks drawn independently, then one regressed on the other. What R² does this print?',
          code: `import numpy as np

rng = np.random.default_rng(3)
a = np.cumsum(rng.normal(size=1000))
b = np.cumsum(rng.normal(size=1000))
beta = np.cov(a, b)[0, 1] / np.var(b, ddof=1)
e = a - a.mean() - beta * (b - b.mean())
print(round(float(1 - e.var() / a.var()), 1))`,
          answer: '0.8',
          why: "Two series with nothing to do with each other \"explain\" 80% of each other's variance, because both wandered over the same stretch. This is the spurious regression. Step two, the unit-root test on e, is what exposes it.",
        },
        {
          kind: 'bug',
          id: 'statarb-coint-8',
          ask: 'This Dickey-Fuller t statistic should regress the change of the residual on its previous level. It gives large positive values for every spread, stationary or not.',
          code: `import numpy as np

def df_t(e):
    x = e[:-1]
    dy = e[1:]
    g = (x * dy).sum() / (x * x).sum()
    se = np.sqrt(((dy - g * x) ** 2).sum() / (len(dy) - 1) / (x * x).sum())
    return g / se`,
          line: 5,
          fix: '    dy = np.diff(e)',
          why: 'With `e[1:]` it regresses the level on the lagged level, which gives a slope near 1 for any persistent series. The test needs the change, `e[t] − e[t−1]`, so that a pull back towards zero shows up as a negative γ.',
        },
        {
          kind: 'write',
          id: 'statarb-coint-9',
          numpy: true,
          ask: 'Write `ols(y, x)`: the least-squares fit of `y = α + β x`. Return `(alpha, beta)` with `β = cov ÷ var` and `α = mean(y) − β mean(x)`.',
          starter: `import numpy as np

def ols(y, x):
    y = np.asarray(y, dtype=float)
    x = np.asarray(x, dtype=float)
    pass`,
          solution: `import numpy as np

def ols(y, x):
    y = np.asarray(y, dtype=float)
    x = np.asarray(x, dtype=float)
    beta = ((x - x.mean()) * (y - y.mean())).sum() / ((x - x.mean()) ** 2).sum()
    return float(y.mean() - beta * x.mean()), float(beta)`,
          tests: `out = ols([1.0, 3.0, 5.0], [0.0, 1.0, 2.0])
assert out is not None, "the function returns nothing yet"
a, b = out
assert abs(b - 2) < 1e-12 and abs(a - 1) < 1e-12, f"y = 1 + 2x gives (1, 2), got {out}"
rng = np.random.default_rng(1)
lb = 4 + np.cumsum(rng.normal(0, 0.01, 500))
la = 0.5 + 1.3 * lb + rng.normal(0, 0.005, 500)
a, b = ols(la, lb)
assert abs(b - 1.3) < 0.05, f"should recover beta near 1.3, got {b:.3f}"
assert abs((la - a - b * lb).mean()) < 1e-9, "with the intercept, the residual averages zero"`,
          why: 'With an intercept the residuals average exactly zero, which is why the Dickey-Fuller step can leave out a constant. The same two lines give the hedge ratio in every later lesson.',
        },
        {
          kind: 'write',
          id: 'statarb-coint-10',
          numpy: true,
          ask: 'Write `engle_granger(la, lb)`: fit `ln A = α + β ln B` by least squares, take the residual e, regress `Δe` on `e[t−1]` with no constant, and return `(beta, t)` where t is the t statistic of the slope (standard error with n − 1 degrees of freedom, as in the lesson).',
          starter: `import numpy as np

def engle_granger(la, lb):
    la = np.asarray(la, dtype=float)
    lb = np.asarray(lb, dtype=float)
    pass`,
          solution: `import numpy as np

def engle_granger(la, lb):
    la = np.asarray(la, dtype=float)
    lb = np.asarray(lb, dtype=float)
    beta = ((lb - lb.mean()) * (la - la.mean())).sum() / ((lb - lb.mean()) ** 2).sum()
    e = la - (la.mean() - beta * lb.mean()) - beta * lb
    x, dy = e[:-1], np.diff(e)
    g = (x * dy).sum() / (x * x).sum()
    se = np.sqrt(((dy - g * x) ** 2).sum() / (len(dy) - 1) / (x * x).sum())
    return float(beta), float(g / se)`,
          tests: `rng = np.random.default_rng(0)
lb = 4 + np.cumsum(rng.normal(0, 0.01, 1000))
u = np.zeros(1000)
for t in range(1, 1000):
    u[t] = 0.9 * u[t - 1] + rng.normal(0, 0.01)
out = engle_granger(0.5 + 1.3 * lb + u, lb)
assert out is not None, "the function returns nothing yet"
b, t = out
assert abs(b - 1.3) < 0.1, f"beta should be near 1.3, got {b:.3f}"
assert t < -5, f"a spread with phi = 0.9 should give a t far below -3.34, got {t:.2f}"
r = np.random.default_rng(1)
a = np.cumsum(r.normal(size=1000))
c = np.cumsum(r.normal(size=1000))
b2, t2 = engle_granger(a, c)
assert -3.34 < t2 < 0, f"these two independent walks should not pass at 5%, got t = {t2:.2f}"`,
          hint: 'Reuse the slope formula for β; for γ there is no intercept, so it is Σ x Δe ÷ Σ x².',
          why: 'The second test case is worth printing: two independent walks give t ≈ −2.9, which would "pass" a plain Dickey-Fuller test at 5% but not the Engle-Granger one. That gap is exactly the bias from fitting β first.',
        },
        {
          kind: 'design',
          id: 'statarb-coint-11',
          ask: 'A candidate pair passes Engle-Granger at 5% on two years of daily data. What else do you check before you call it cointegrated?',
          checklist: [
            { point: 'Run the test in both directions, A on B and B on A', why: 'The slopes and the verdicts can differ.' },
            { point: 'Re-run it on separate sub-periods and on a later window', why: 'Cointegration that holds in one window only is likely chance.' },
            { point: 'Plot the rolling hedge ratio', why: 'A β that drifts a lot means the relationship is changing.' },
            { point: 'Use the augmented test with a few lags', why: 'Autocorrelated changes can bias the simple test.' },
            { point: 'Count how many pairs were tested to find this one', why: 'Among many tested pairs, 5% pass by chance.' },
            { point: 'Name the economic reason the two should stay together', why: 'Without one, a passing test is a curiosity, not a trade.' },
            { point: 'Estimate the half-life and the spread volatility', why: 'A real but slow or tiny reversion may still not be worth trading.' },
          ],
          why: 'One passing test is one draw from a noisy process. Robustness across directions, windows and lags, plus a reason, is what makes it a candidate rather than a coincidence.',
        },
      ],
    },
    {
      id: 'statarb-ou',
      title: 'The spread as a mean-reverting process',
      summary: 'The Ornstein-Uhlenbeck model in plain words, its link to an AR(1), half-life, long-run mean and width, and how much to trust the estimates.',
      widget: 'statarb-ou',
      text: [
        'The **Ornstein-Uhlenbeck (OU)** process is the standard model of a mean-reverting spread: `ds = θ(μ − s)dt + σ dW`. In words: each instant the spread is pulled towards its long-run mean μ at a speed θ in proportion to how far away it is, and random shocks of size σ push it about. Far from μ the pull is strong; near μ the noise dominates.',
        "Sampled once a day, an OU process is an **AR(1)**: `s[t] = c + φ × s[t−1] + ε`, with `φ = e^(−θ)` for a one-day step. The long-run mean is `μ = c ÷ (1 − φ)`. The quant module's regression of the change, `Δs = a + b × s[t−1]`, is the same model with `b = φ − 1`. The **half-life** is `ln 2 ÷ θ = −ln 2 ÷ ln φ` days.",
        "Two more numbers come from the fit. The expected path from today's value is `E[s(t+h)] = μ + φ^h × (s(t) − μ)`: the gap shrinks by the factor φ each day. The spread's long-run standard deviation, the width of its usual range, is `σ_eq = σ_ε ÷ √(1 − φ²)`, where σ_ε is the standard deviation of the daily shocks. That is the natural unit for a z-score.",
        { code: `import numpy as np

def fit_ar1(s):
    x, y = s[:-1], s[1:]
    phi = ((x - x.mean()) * (y - y.mean())).sum() / ((x - x.mean()) ** 2).sum()
    c = y.mean() - phi * x.mean()
    return c, phi, (y - c - phi * x).std()` },
        'The estimates are noisy. With a few hundred days, φ is uncertain in its second decimal, and near 1 that changes the half-life a lot: φ = 0.97 is 23 days, φ = 0.99 is 69. Least squares also tends to estimate φ too low in short samples, which makes reversion look faster than it is. You need many half-lives of data, and a half-life longer than the window you fitted it on is a warning, not a number.',
      ],
      rules: [
        'OU: pulled to μ at speed θ. Daily it is an AR(1) with φ = e^(−θ).',
        'Half-life = ln 2 ÷ θ = −ln 2 ÷ ln φ.',
        "μ = c ÷ (1 − φ). Expected gap after h days: φ^h × today's gap.",
        'Width of the range: σ_eq = σ_ε ÷ √(1 − φ²).',
        'Estimates need many half-lives of data, and short samples flatter the speed.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'statarb-ou-1',
          ask: 'A spread fitted as an AR(1) on daily data has φ = 0.95. What is its half-life in days? Give one decimal.',
          answer: 13.5,
          tol: 0.06,
          check: '-math.log(2) / math.log(0.95)',
          why: '−ln 2 ÷ ln 0.95 = 0.693 ÷ 0.0513 ≈ 13.5 days. Each day keeps 95% of the gap, and 0.95 to the power 13.5 is one half.',
        },
        {
          kind: 'number',
          id: 'statarb-ou-2',
          ask: 'An OU spread has a speed of reversion θ = 0.1 per day. What is its half-life in days? Give one decimal.',
          answer: 6.9,
          tol: 0.06,
          check: 'math.log(2) / 0.1',
          why: 'ln 2 ÷ 0.1 ≈ 6.9 days. The equivalent daily φ is e^(−0.1) ≈ 0.905, and −ln 2 ÷ ln 0.905 gives the same 6.9.',
        },
        {
          kind: 'number',
          id: 'statarb-ou-3',
          ask: 'An AR(1) fit of a spread gives c = 0.02 and φ = 0.9. What is the long-run mean μ the spread reverts to?',
          answer: 0.2,
          check: '0.02 / (1 - 0.9)',
          why: 'μ = c ÷ (1 − φ) = 0.02 ÷ 0.1 = 0.2. At s = 0.2 the expected next value is 0.02 + 0.9 × 0.2 = 0.2, so it stays put. The intercept c is not the mean.',
        },
        {
          kind: 'number',
          id: 'statarb-ou-4',
          ask: 'Daily shocks to a spread have a standard deviation of 0.01 and φ = 0.9. What is the long-run standard deviation of the spread, σ_ε ÷ √(1 − φ²)? Give three decimals.',
          answer: 0.023,
          tol: 0.0006,
          check: '0.01 / math.sqrt(1 - 0.9 ** 2)',
          why: "0.01 ÷ √0.19 ≈ 0.023. The spread wanders about 2.3 times as far as one day's shock, because shocks pile up before the pull undoes them. The slower the reversion, the wider the range.",
        },
        {
          kind: 'number',
          id: 'statarb-ou-5',
          ask: 'A spread sits 0.06 above its long-run mean, and φ = 0.9 per day. What gap do you expect after 5 days? Give three decimals.',
          answer: 0.035,
          tol: 0.0006,
          check: '0.06 * 0.9 ** 5',
          why: '0.06 × 0.9⁵ ≈ 0.035. About 41% of the gap is expected to close in five days. Expected is the word: the actual path will scatter widely around it.',
        },
        {
          kind: 'output',
          id: 'statarb-ou-6',
          ask: 'The expected path of a spread from today. What does this print?',
          code: `mu, phi, s0 = 0.0, 0.8, 0.10
print([round(mu + phi ** h * (s0 - mu), 3) for h in (0, 1, 2, 5)])`,
          answer: '[0.1, 0.08, 0.064, 0.033]',
          why: 'The gap shrinks by the factor 0.8 each day: 0.1, 0.08, 0.064, and after five days 0.1 × 0.8⁵ ≈ 0.033. The half-life here is about 3.1 days.',
        },
        {
          kind: 'bug',
          id: 'statarb-ou-7',
          ask: 'This should give the long-run mean from an AR(1) fit. For c = 0.02 and φ = 0.9 it returns 0.022 instead of 0.2.',
          code: `def long_run_mean(c, phi):
    # s[t] = c + phi * s[t - 1] + noise
    return c / phi`,
          line: 3,
          fix: '    return c / (1 - phi)',
          why: 'At the mean, s = c + φs, so s(1 − φ) = c and μ = c ÷ (1 − φ). Dividing by φ gives a number close to c, which puts the "mean" far from where the spread actually lives and makes every z-score wrong.',
        },
        {
          kind: 'write',
          id: 'statarb-ou-8',
          numpy: true,
          ask: 'Write `fit_ar1(s)`: regress `s[1:]` on `s[:-1]` with an intercept and return `(c, phi, sigma)`, where sigma is the population standard deviation (`ddof=0`) of the residuals.',
          starter: `import numpy as np

def fit_ar1(s):
    s = np.asarray(s, dtype=float)
    pass`,
          solution: `import numpy as np

def fit_ar1(s):
    s = np.asarray(s, dtype=float)
    x, y = s[:-1], s[1:]
    phi = ((x - x.mean()) * (y - y.mean())).sum() / ((x - x.mean()) ** 2).sum()
    c = y.mean() - phi * x.mean()
    return float(c), float(phi), float((y - c - phi * x).std())`,
          tests: `s = np.array([1.0, 0.5, 0.25, 0.125, 0.0625])
out = fit_ar1(s)
assert out is not None, "the function returns nothing yet"
c, phi, sig = out
assert abs(phi - 0.5) < 1e-9 and abs(c) < 1e-9 and sig < 1e-9, f"a gap that halves each day: c = 0, phi = 0.5, no noise, got {out}"
rng = np.random.default_rng(2)
x = np.zeros(20000)
for t in range(1, 20000):
    x[t] = 0.03 + 0.85 * x[t - 1] + rng.normal(0, 0.01)
c, phi, sig = fit_ar1(x)
assert abs(phi - 0.85) < 0.02, f"phi should be near 0.85, got {phi:.3f}"
assert abs(c / (1 - phi) - 0.2) < 0.01, f"the long-run mean c / (1 - phi) should be near 0.2, got {c / (1 - phi):.3f}"
assert abs(sig - 0.01) < 0.0005, f"sigma should be near 0.01, got {sig:.4f}"`,
          why: 'Three numbers describe the whole model: where it reverts to, how fast, and how noisy. Everything a pairs rule needs, the z-score unit, the half-life and the expected gain, comes from them.',
        },
        {
          kind: 'write',
          id: 'statarb-ou-9',
          ask: 'Write `ou_summary(c, phi, sigma)`: return `(mu, half_life, sd_eq)` from AR(1) parameters. If phi is not strictly between 0 and 1, return `half_life` and `sd_eq` as `float("inf")` (and mu as `float("inf")` when phi is exactly 1).',
          starter: `import math

def ou_summary(c, phi, sigma):
    pass`,
          solution: `import math

def ou_summary(c, phi, sigma):
    if not 0 < phi < 1:
        mu = float("inf") if phi == 1 else c / (1 - phi)
        return mu, float("inf"), float("inf")
    return c / (1 - phi), -math.log(2) / math.log(phi), sigma / math.sqrt(1 - phi ** 2)`,
          tests: `out = ou_summary(0.02, 0.9, 0.01)
assert out is not None, "the function returns nothing yet"
mu, hl, sd = out
assert abs(mu - 0.2) < 1e-9, f"mu = 0.02 / (1 - 0.9) = 0.2, got {mu}"
assert abs(hl - 6.5788) < 1e-3, f"half-life = -ln 2 / ln 0.9 = 6.58 days, got {hl}"
assert abs(sd - 0.01 / math.sqrt(0.19)) < 1e-9, f"sd_eq = 0.01 / sqrt(1 - 0.81), got {sd}"
mu, hl, sd = ou_summary(0.0, 1.0, 0.01)
assert hl == float("inf") and sd == float("inf"), "phi = 1 is a random walk: no half-life and no fixed width"
assert ou_summary(0.0, 1.02, 0.01)[1] == float("inf"), "phi above 1 is explosive: no half-life"`,
          why: 'A φ of 1 or more means no reversion at all, and the formulas would give nonsense or an error. Code that turns a fit into trading parameters must say "not mean reverting" plainly instead.',
        },
        {
          kind: 'choice',
          id: 'statarb-ou-10',
          ask: 'In the figure, set the half-life to 5 days, then to 60 days. The shocks are the same and the width of the range is held fixed. What changes?',
          options: [
            'Nothing: the same shocks give the same path',
            'At 5 days the spread crosses its mean many times; at 60 days it spends long stretches on one side, so there are far fewer trades and each one takes much longer',
            'At 60 days the spread is wider',
            'At 5 days the fitted half-life is always exactly 5',
          ],
          answer: 1,
          why: 'Half-life sets how often the spread comes back, which sets the number of trades and how long capital is tied up. Compare the fitted half-life in the readout with the true one: at 60 days the estimate from 500 days of data is far less precise.',
        },
        {
          kind: 'choice',
          id: 'statarb-ou-11',
          ask: 'From 120 days of data you estimate a half-life of 40 days. How much should you trust it?',
          options: [
            'Fully: least squares is unbiased',
            'Very little: the sample holds only three half-lives, φ ≈ 0.983 is hard to tell from 1, and short samples tend to make reversion look faster than it is',
            'It is probably too slow: the true half-life is shorter',
            'Fully, if the R² is high',
          ],
          answer: 1,
          why: 'With so few reversions in the sample, the same data are consistent with a half-life of 20 days or with no reversion at all. You would want several years of data for a spread this slow, and even then treat the number as rough.',
        },
      ],
    },
    {
      id: 'statarb-rules',
      title: 'Trading rules: entry, exit, stops and sizing',
      summary: 'Z-score entries and exits, price and time stops, whether the gap pays for four fills, and how to size the two legs.',
      widget: 'statarb-rules',
      text: [
        'Turn the spread into a **z-score**: `z = (s − μ) ÷ σ_eq`, with μ and σ_eq fitted on the formation window (or on a trailing window that ends yesterday). Short the spread (sell A, buy β of B) when z rises above an **entry** level, buy it when z falls below minus that level, and close when z comes back to an **exit** level, usually 0 or a little short of it.',
        "Each trade aims to capture about `(entry − exit) × σ_eq` of spread. It pays four fills (open and close, two legs) and, while it is open, the borrow fee on the short leg. If a fill costs c as a fraction of the dollars traded, a round trip on $D of A and β × $D of B costs about `2 × (1 + β) × D × c`. A gap that cannot beat that number is not a trade, however good the statistics look.",
        "Two kinds of stop. A **price stop** closes when |z| goes past a wider level, for example 3.5 or 4: the spread has gone further than the model expects, which is what a broken pair looks like. A **time stop** closes after a few half-lives: after three half-lives only 1/8 of the gap is expected to remain, so a trade still open is probably not following the model. Both stops cost money on pairs that were fine, because some of those trades would have come back. That is the price of surviving the pairs that were not.",
        { code: `z = [0.4, 2.2, 2.6, 1.1, -0.1]
pos = 0
for x in z:
    if pos == 0 and abs(x) > 2:
        pos = -1 if x > 0 else 1
    elif pos == -1 and x < 0:
        pos = 0
print(pos)` },
        "Every number in the rule must be known at the time of the trade. A z-score that uses the mean of the whole sample, or a position applied to the same day's move that created it, is look-ahead and makes any backtest look better than trading will. Decide at the close of day t and earn the move from t to t + 1.",
        "Size the legs, then size the pair. The legs: β dollars of B per dollar of A from the log regression. The pair: by risk, not by dollars. If the spread changes by a standard deviation of σ_Δ a day and you accept $R of daily swings on one pair, hold `D = R ÷ σ_Δ` of A. Adding to a losing pair as z widens (scaling in) improves the average entry when the pair holds and doubles the loss when it breaks; if you do it, cap the total.",
      ],
      rules: [
        'z = (s − μ) ÷ σ_eq, from past data only. Short above +entry, buy below −entry, close near 0.',
        'Gain per trade ≈ (entry − exit) × σ_eq. Costs ≈ 2 × (1 + β) × D × c, plus borrow.',
        'Price stop at a wider |z|; time stop after a few half-lives.',
        'Decide on the close of day t, earn the move from t to t + 1.',
        'Legs by β, pair size by risk: D = R ÷ σ_Δ.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'statarb-rules-1',
          ask: 'A spread stands at 0.31. Over the formation window its mean was 0.25 and its long-run standard deviation 0.025. What is its z-score?',
          answer: 2.4,
          check: '(0.31 - 0.25) / 0.025',
          why: '(0.31 − 0.25) ÷ 0.025 = 2.4. Above an entry of 2, the rule shorts the spread: sell A, buy β of B.',
        },
        {
          kind: 'number',
          id: 'statarb-rules-2',
          ask: 'You enter at z = 2 and exit at z = 0 on a spread with σ_eq = 0.03, holding $40,000 of A. If the trade works as planned, about how much does it make before costs, in dollars?',
          answer: 2400,
          check: '(2 - 0) * 0.03 * 40000',
          why: 'The spread moves (2 − 0) × 0.03 = 0.06 in log terms, and P&L ≈ D × Δs = $40,000 × 0.06 = $2,400. That is the planned gain, not the expected one: some trades stop out and some take far longer than planned.',
        },
        {
          kind: 'number',
          id: 'statarb-rules-3',
          ask: 'You buy $40,000 of A and short $48,000 of B (β = 1.2). Each fill costs 0.1% of the dollars traded, counting commission, half the bid-ask spread and impact. What does the round trip cost in dollars?',
          answer: 176,
          check: '2 * (40000 + 48000) * 0.001',
          why: 'Two legs, each opened and closed: 2 × $88,000 × 0.001 = $176. Borrow on the $48,000 short comes on top for every day the trade is open.',
        },
        {
          kind: 'number',
          id: 'statarb-rules-4',
          ask: 'A tight pair has σ_eq = 0.005 and β = 1. Each fill costs 0.1% of the dollars traded, and you exit at z = 0. What is the smallest entry z at which the planned gain, entry × σ_eq, covers the round-trip cost of 2 × (1 + β) × c?',
          answer: 0.8,
          check: '2 * (1 + 1) * 0.001 / 0.005',
          why: 'Costs are 0.004 of D and each unit of z is worth 0.005, so z must be at least 0.8 to break even on a trade that works. At an entry of 2 the planned gain is 0.01, so 40% of it goes on costs before any trade fails.',
        },
        {
          kind: 'number',
          id: 'statarb-rules-5',
          ask: 'A spread has a half-life of 8 days, and your time stop closes any trade still open after 3 half-lives. If the spread follows the model, what fraction of the entry gap is expected to remain at the time stop? Give a decimal.',
          answer: 0.125,
          check: '0.5 ** 3',
          why: 'Each half-life halves the expected gap: ½ × ½ × ½ = 1/8. A trade still near its entry level after 24 days is behaving unlike the model, which is a reason to close it, not to wait.',
        },
        {
          kind: 'number',
          id: 'statarb-rules-6',
          ask: 'The daily change of a spread has a standard deviation of 0.008, and you accept daily swings of about $400 on one pair. How many dollars of A do you hold?',
          answer: 50000,
          check: '400 / 0.008',
          why: 'D = R ÷ σ_Δ = $400 ÷ 0.008 = $50,000, with β × $50,000 of B on the other side. Sizing by spread risk gives a noisy pair less money and a quiet one more, so each pair contributes about the same risk.',
        },
        {
          kind: 'output',
          id: 'statarb-rules-7',
          ask: 'A pair rule with an entry at |z| > 2, an exit at 0 and a stop at |z| > 4. What does this print?',
          code: `z = [0.5, 2.3, 1.6, 0.4, -0.2, -2.1, -4.3, -1.0]
pos, out = 0, []
for x in z:
    if pos == 0 and abs(x) > 2:
        pos = -1 if x > 0 else 1
    elif pos != 0 and abs(x) > 4:
        pos = 0
    elif (pos == -1 and x < 0) or (pos == 1 and x > 0):
        pos = 0
    out.append(pos)
print(out)`,
          answer: '[0, -1, -1, -1, 0, 1, 0, 0]',
          why: 'Short at 2.3, closed when z crosses 0 at −0.2. Long at −2.1, stopped at −4.3. At −1.0 the rule stays flat because |z| is inside the entry band. A stopped-out trade is a loss of more than 2σ; the first trade made about 2.5σ.',
        },
        {
          kind: 'bug',
          id: 'statarb-rules-8',
          ask: 'A rolling z-score for a backtest. The backtest looks much better than paper trading the same rule. Which line is wrong?',
          code: `import numpy as np

def zscores(s, w):
    s = np.asarray(s, dtype=float)
    z = np.full(len(s), np.nan)
    for t in range(w - 1, len(s)):
        win = s[t - w + 1:t + w]
        z[t] = (s[t] - win.mean()) / win.std()
    return z`,
          line: 7,
          fix: '        win = s[t - w + 1:t + 1]',
          why: 'The window runs up to t + w, so the mean and standard deviation on day t use the next w − 1 days of the spread. The z-score then knows where the spread is heading. The window must end at t.',
        },
        {
          kind: 'bug',
          id: 'statarb-rules-9',
          ask: 'Daily P&L of a pair position. `pos[t]` is set at the close of day t from that day\'s z-score. The backtest wins on almost every trade. Which line is wrong?',
          code: `import numpy as np

def pair_pnl(s, pos):
    s, pos = np.asarray(s, dtype=float), np.asarray(pos, dtype=float)
    ds = np.diff(s)
    return float((pos[1:] * ds).sum())`,
          line: 6,
          fix: '    return float((pos[:-1] * ds).sum())',
          why: '`ds[t]` is the move from day t to t + 1, and the position held over that move is the one set at the close of day t, `pos[:-1]`. With `pos[1:]` the position is chosen after seeing the move it is paid on.',
        },
        {
          kind: 'write',
          id: 'statarb-rules-10',
          ask: 'Write `pair_positions(z, entry, exit, stop)`: return a list of positions (−1 short the spread, +1 long, 0 flat), one per z. Flat: go short if z > entry, long if z < −entry. Short: close if z <= exit. Long: close if z >= −exit. In a position, if |z| >= stop, close it and do not enter again until |z| is back below entry. Check the stop first.',
          starter: `def pair_positions(z, entry, exit, stop):
    out = []
    return out`,
          solution: `def pair_positions(z, entry, exit, stop):
    out, pos, cool = [], 0, False
    for x in z:
        if cool and abs(x) < entry:
            cool = False
        if pos != 0 and abs(x) >= stop:
            pos, cool = 0, True
        elif (pos == -1 and x <= exit) or (pos == 1 and x >= -exit):
            pos = 0
        elif pos == 0 and not cool and abs(x) > entry and abs(x) < stop:
            pos = -1 if x > 0 else 1
        out.append(pos)
    return out`,
          tests: `out = pair_positions([0.5, 2.3, 1.0, -0.1], 2, 0, 4)
assert out is not None and len(out) == 4, "return one position per z"
assert out == [0, -1, -1, 0], f"short at 2.3, close at -0.1: [0, -1, -1, 0], got {out}"
assert pair_positions([-2.5, -1.0, 0.2], 2, 0, 4) == [1, 1, 0], "long below -entry, close when z gets back to -exit"
assert pair_positions([2.5, 0.4], 2, 0.5, 4) == [-1, 0], "with exit 0.5, a short closes at z <= 0.5"
assert pair_positions([2.5, 4.2, 3.0, 2.6, 1.5, 2.4], 2, 0, 4) == [-1, 0, 0, 0, 0, -1], "after a stop, wait until |z| < entry before entering again"`,
          hint: 'Keep a flag that is set by a stop and cleared once |z| falls below the entry level.',
          why: 'The cooling-off flag matters: without it the rule re-enters at 3.0 right after being stopped at 4.2, fading a spread that has told you something is wrong.',
        },
        {
          kind: 'choice',
          id: 'statarb-rules-11',
          ask: 'In the figure, choose **Holds** and move the stop from off to 3. Then choose **Breaks at day 250** and set the stop to 3.5. What do you see?',
          options: [
            'The stop improves P&L in both worlds',
            'On the pair that holds, the stop cuts net P&L in the first half from about 9.6% to about 4.9%; on the broken pair it cuts the second-half loss from about 5.3% to about 1.4%',
            'The stop changes nothing, because the spread never reaches 3',
            'On the broken pair the stop turns the loss into a large profit',
          ],
          answer: 1,
          why: 'A stop sells insurance against a break and pays for it in the pairs that would have come back. Which world you are in is only clear afterwards, so the stop level is a trade-off you choose in advance, not something to optimise on one history.',
        },
        {
          kind: 'design',
          id: 'statarb-rules-12',
          ask: 'Write the complete trading rules for one pair before you paper trade it.',
          checklist: [
            { point: 'The formation window and how often β, μ and σ_eq are re-estimated', why: 'Fixed in advance, so the rule cannot be tuned after the fact.' },
            { point: 'Entry, exit and price-stop levels in z', why: 'Each one a number, not a feeling on the day.' },
            { point: 'A time stop in half-lives', why: 'Trades that do not revert on the model\'s schedule are evidence against the model.' },
            { point: 'The rule after a stop: when, if ever, to trade the pair again', why: 'Re-entering at once fades a spread that has broken.' },
            { point: 'Leg sizes from β and pair size from spread risk', why: 'Equal dollars per pair gives noisy pairs too much weight.' },
            { point: 'The cost of a round trip and the borrow fee, checked against the planned gain', why: 'A gap that cannot pay four fills is not a trade.' },
            { point: 'Orders: both legs together, limit prices, what to do if only one leg fills', why: 'A half-filled pair is an outright position in one stock.' },
          ],
          why: 'The rules exist so that every decision is made before the money is at risk. Most damage in pairs trading comes from decisions made in the moment: adding to a loser, skipping a stop, re-entering a broken pair.',
        },
      ],
    },
    {
      id: 'statarb-baskets',
      title: 'Baskets, ETFs and residual reversal',
      summary: 'Spreads with more than two legs: index arbitrage, an ETF against its holdings, and trading what is left of a stock after removing the market.',
      text: [
        'A spread can have many legs. Regress the log price of one stock on several related ones, `ln A = α + β₁ ln B₁ + β₂ ln B₂ + … + e`, and trade e. NumPy fits it with `np.linalg.lstsq`. The Johansen test is the usual way to test cointegration among more than two series. More legs fit the past better and cost more to trade, and every extra β is another estimate that can drift.',
        "**Index arbitrage** compares a stock index future with the index itself. A simple fair value is `F = S × (1 + (r − q) × T)`: the index S, plus interest r for T years, minus the dividends q you would not receive. When the future trades above fair value by more than costs, sell the future and buy the stocks; below, the reverse. Firms with fast connections and very low costs close these gaps within moments, so for an individual the gap is almost always inside the costs.",
        "An **ETF** holds a basket. Its **NAV** (net asset value) per share is the basket's value divided by the ETF shares outstanding, and the **premium** is `price ÷ NAV − 1`. Large dealers called **authorised participants** can create ETF shares by handing in the basket, or redeem shares for it, and they do so when the premium or discount beats their costs. That keeps equity ETFs close to NAV. When the holdings trade rarely, NAV is stale: in March 2020 LQD, a large US corporate bond ETF, closed at a discount of about 5% to its published NAV on some days. The ETF price was arguably the better estimate of what the bonds were worth.",
        "**Residual reversal** trades many stocks at once. Regress each stock's daily returns on the market or its sector ETF, `r = β × r_m + ε`, and keep the residual ε: the part of the move the market does not explain. Add up the residuals over a window and treat that sum as a spread, with the AR(1) fit of the previous lessons. Avellaneda and Lee (2010) did this on US stocks with a 60-day window, opening when the residual was 1.25 equilibrium standard deviations from its mean and closing nearer it, at 0.75 for shorts and 0.5 for longs. They reported Sharpe ratios after costs well above 1 for 1997 to 2002 and clearly lower from 2003 to 2007.",
        "The simplest version is the **contrarian** portfolio of Lo and MacKinlay (1990), used by Khandani and Lo in their study of August 2007: `wᵢ = −(rᵢ − r̄) ÷ N`, where rᵢ is yesterday's return of stock i and r̄ the average of all N. Yesterday's losers are bought and its winners sold, in proportion to how far they moved from the average. The weights add to zero, so the book is dollar neutral by construction.",
      ],
      rules: [
        'Many legs: fit with lstsq, test with Johansen; more legs, more cost and more drift.',
        'Index future fair value ≈ S × (1 + (r − q) × T). The gap is usually inside your costs.',
        'ETF premium = price ÷ NAV − 1. Stale NAV in stress is not free money.',
        'Residual = r − β r_m. Cumulate it, fit an AR(1), trade its z-score.',
        'Contrarian weights −(rᵢ − r̄) ÷ N add to zero.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'statarb-baskets-1',
          ask: 'An index stands at 5,000. Interest is 4% a year, the dividend yield 1.5% a year. Using F = S × (1 + (r − q) × T), what is the fair value of a future expiring in 6 months?',
          answer: 5062.5,
          tol: 0.1,
          check: '5000 * (1 + (0.04 - 0.015) * 0.5)',
          why: '5,000 × (1 + 0.025 × 0.5) = 5,062.5. The future trades above the index because holding it instead of the stocks saves interest, less the dividends you give up.',
        },
        {
          kind: 'number',
          id: 'statarb-baskets-2',
          ask: 'With the fair value at 5,062.5, the future trades at 5,070. Your total cost to put on and take off the trade, futures and all the stocks, is 5 index points. What is left per unit, in index points, if the gap closes completely?',
          answer: 2.5,
          check: '(5070 - 5062.5) - 5',
          why: '7.5 points of gap less 5 points of cost leaves 2.5, and only if both legs fill at the prices you saw. Buying and selling 500 stocks at once is exactly where an individual\'s costs and speed lose to a dealer\'s.',
        },
        {
          kind: 'number',
          id: 'statarb-baskets-3',
          ask: "An ETF trades at $50.30. Its holdings are worth $50.10 per ETF share. What is its premium? Give a percentage to two decimals, for example 0.25%.",
          answer: 0.004,
          tol: 0.00005,
          check: '50.30 / 50.10 - 1',
          why: '50.30 ÷ 50.10 − 1 ≈ 0.40%. An authorised participant can deliver the basket, receive new ETF shares and sell them, if 0.40% beats the cost of buying all the holdings and the creation fee.',
        },
        {
          kind: 'number',
          id: 'statarb-baskets-4',
          ask: 'A stock has β = 1.5 to the market. Today the market rose 1% and the stock rose 3%. What was its residual return? Give a percentage, for example 0.5%.',
          answer: 0.015,
          tol: 0.0001,
          check: '0.03 - 1.5 * 0.01',
          why: '3% − 1.5 × 1% = 1.5%. Half of the move was the market; the other 1.5% is the part a residual reversal strategy bets will partly fade.',
        },
        {
          kind: 'output',
          id: 'statarb-baskets-5',
          ask: 'Contrarian weights from yesterday\'s returns of four stocks. What does this print?',
          code: `import numpy as np

r = np.array([0.02, -0.01, 0.0, 0.03])
w = -(r - r.mean()) / len(r)
print(w.round(4).tolist(), round(float(w.sum()), 10))`,
          answer: '[-0.0025, 0.005, 0.0025, -0.005] 0.0',
          why: 'The average is 1%. The stock that rose 3% is sold hardest and the one that fell 1% bought hardest. The weights add to zero: the book is dollar neutral by construction.',
        },
        {
          kind: 'output',
          id: 'statarb-baskets-6',
          ask: 'One stock regressed on two others with `lstsq`. What does this print?',
          code: `import numpy as np

rng = np.random.default_rng(0)
B = rng.normal(size=(500, 2))
a = 0.6 * B[:, 0] + 0.3 * B[:, 1] + rng.normal(0, 0.01, 500)
X = np.column_stack([np.ones(500), B])
coef = np.linalg.lstsq(X, a, rcond=None)[0]
print(coef.round(2).tolist())`,
          answer: '[0.0, 0.6, 0.3]',
          why: 'The column of ones gives the intercept, and the other two coefficients recover the weights the data were built with. In a real basket the noise is large and the weights shift between windows.',
        },
        {
          kind: 'bug',
          id: 'statarb-baskets-7',
          ask: 'These contrarian weights should be dollar neutral. On a day when every stock rose, the book is net short. Which line is wrong?',
          code: `import numpy as np

def contrarian(r):
    r = np.asarray(r, dtype=float)
    w = -r / len(r)
    return w`,
          line: 5,
          fix: '    w = -(r - r.mean()) / len(r)',
          why: 'Without subtracting the average, a day when everything rose makes every weight negative: the book is a bet against the market, not a bet on relative moves. Removing the mean leaves only how each stock did against the others.',
        },
        {
          kind: 'write',
          id: 'statarb-baskets-8',
          numpy: true,
          ask: 'Write `market_residuals(R, m)`: `R` has shape (days, stocks) of returns and `m` the market returns. For each stock, β = cov(r, m) ÷ var(m). Return `(betas, E)` where `E = R − m × β` column by column (no intercept).',
          starter: `import numpy as np

def market_residuals(R, m):
    R = np.asarray(R, dtype=float)
    m = np.asarray(m, dtype=float)
    pass`,
          solution: `import numpy as np

def market_residuals(R, m):
    R = np.asarray(R, dtype=float)
    m = np.asarray(m, dtype=float)
    mc = m - m.mean()
    betas = (mc[:, None] * (R - R.mean(axis=0))).sum(axis=0) / (mc ** 2).sum()
    return betas, R - m[:, None] * betas`,
          tests: `m = np.array([0.01, -0.02, 0.015, 0.0])
R = np.column_stack([2 * m, 0.5 * m + np.array([0.001, -0.001, 0.0, 0.0])])
out = market_residuals(R, m)
assert out is not None, "the function returns nothing yet"
b, E = out
assert np.shape(E) == (4, 2), f"E has one column per stock: (4, 2), got {np.shape(E)}"
assert abs(b[0] - 2) < 1e-9, f"the first stock is exactly 2 times the market: beta 2, got {b[0]}"
assert np.allclose(E[:, 0], 0), "a stock that is exactly beta times the market has zero residuals"
rng = np.random.default_rng(4)
mm = rng.normal(0, 0.01, 2000)
RR = np.column_stack([1.3 * mm + rng.normal(0, 0.01, 2000), 0.7 * mm + rng.normal(0, 0.01, 2000)])
b, E = market_residuals(RR, mm)
assert abs(b[0] - 1.3) < 0.05 and abs(b[1] - 0.7) < 0.05, f"betas should be near 1.3 and 0.7, got {b}"
assert abs(np.corrcoef(E[:, 0], mm)[0, 1]) < 0.05, "residuals should be close to uncorrelated with the market"`,
          hint: 'Centre m and each column of R, then sum the products down the rows: `axis=0`.',
          why: 'Once the market is removed, what is left of each stock is mostly its own news and noise, and the stocks become close to independent bets. That is what lets a residual book hold hundreds of small positions with real breadth.',
        },
        {
          kind: 'choice',
          id: 'statarb-baskets-9',
          ask: 'In a market panic a bond ETF closes 4% below its published NAV. A colleague wants to buy the ETF and short a few of the bonds as a near-riskless trade. What is the main flaw?',
          options: [
            'None: authorised participants guarantee the gap closes by tomorrow',
            'The NAV is built from stale or indicative bond prices; the bonds may not be sellable anywhere near those prices, so the discount may be mostly a mismeasured NAV',
            'ETFs cannot trade below NAV, so the data are wrong',
            'Shorting bonds is not allowed',
          ],
          answer: 1,
          why: 'A spread is only an arbitrage if you can trade both sides at the prices in the calculation. When the underlying market is barely trading, the ETF often reflects new information first, and the NAV catches up.',
        },
        {
          kind: 'choice',
          id: 'statarb-baskets-10',
          ask: 'Why is index arbitrage between an index future and its 500 stocks a poor first project for an individual with a retail broker?',
          options: [
            'Index futures cannot be traded by individuals',
            'The gaps are usually smaller than the individual\'s costs, and firms with faster links and far lower costs close the rest within moments',
            'The fair value formula is unknown',
            'It is illegal outside exchanges',
          ],
          answer: 1,
          why: 'The idea is simple and public, so the remaining edge belongs to whoever can trade the basket fastest and cheapest. Where an individual can compete is in slower, smaller spreads that large firms find too small to bother with, and even there costs decide.',
        },
        {
          kind: 'design',
          id: 'statarb-baskets-11',
          ask: 'You want to paper trade a residual reversal book on 50 large US stocks. Describe how you would build it, from returns to orders.',
          checklist: [
            { point: 'Pick the factor to remove: the market or each stock\'s sector ETF, fitted on a trailing window', why: 'The residual is only as good as the model that defines it.' },
            { point: 'Cumulate the residuals and fit an AR(1) per stock; skip stocks whose half-life is too long', why: 'Avellaneda and Lee dropped stocks that did not revert fast enough for their window.' },
            { point: 'Entry and exit levels on the residual z-score, fixed in advance', why: 'Thresholds chosen on the data you test on flatter the result.' },
            { point: 'Hedge the net market exposure with an index ETF or future', why: 'Many single-stock residual bets add up to a market bet if left alone.' },
            { point: 'A cap per stock and per sector', why: 'Several residuals can share one cause, such as an industry shock.' },
            { point: 'Costs per fill and borrow on every short, applied in the backtest', why: 'Short holding periods mean high turnover, and turnover is where the edge goes.' },
            { point: 'A record of daily P&L split into market, sector and residual parts', why: 'It shows whether you are earning the bet you meant to make.' },
          ],
          why: 'A residual book is pairs trading across a whole universe. It gains breadth, and with it the same exposure to crowding: every fund removing the same factors holds similar residuals.',
        },
      ],
    },
    {
      id: 'statarb-breaks',
      title: 'How it breaks',
      summary: 'August 2007, crowded unwinds, regime change, borrow costs and squeezes, and deciding that a pair is not coming back.',
      text: [
        "In the week of 6 August 2007 many quantitative long-short equity funds lost heavily while the wider market barely moved on the first days. Khandani and Lo rebuilt the event with the contrarian strategy of the last lesson: unleveraged, it lost 1.16%, 2.83% and 2.86% on 7, 8 and 9 August, then made 5.92% on the 10th. At the 8-to-1 leverage they thought typical, that is about −25% in three days. Their explanation, which they called a hypothesis: one or more large funds sold similar portfolios fast, prices moved against everyone holding them, others cut risk and added to the move, and when the selling stopped prices snapped back. Many funds had already cut and missed the rebound.",
        'The lesson is **crowding**. When many funds run similar models, their positions overlap, and the correlation between their bets jumps exactly when one of them has to sell. The volatility of an equal-weight book of N bets, each with volatility σ and average correlation ρ, is `σ × √((1 + (N − 1)ρ) ÷ N)`. A rise in ρ from 0.02 to 0.3 makes a 50-bet book nearly three times as volatile overnight. Leverage, chosen for calm markets, then turns that into a margin problem.',
        '**Regime change** breaks single pairs. A takeover bid, a spin-off, a new business line, a lawsuit or a change of index membership changes what each company is worth. The old spread mean no longer applies, and the z-score rule keeps fading a move that is permanent. Signs: the half-life fitted on recent data grows, β drifts, the spread sets a new extreme and stays there.',
        "**Borrow** is part of the trade. The short leg pays a fee, a few tenths of a percent a year for most large stocks, but tens of percent for a hard-to-borrow one, and the lender can recall the shares. In a **short squeeze**, short sellers forced to buy push the price up further. In October 2008 Porsche announced that it controlled about 74% of Volkswagen through shares and cash-settled options; with much of the rest held by the state of Lower Saxony, few shares were free, and VW's ordinary shares went from about €211 to over €1,000 within two trading days. Anyone short VW as one leg of a pair lost on that leg far more than any spread model allowed for.",
        'Decide in advance what ends a pair. A price stop, a time stop, a maximum loss per pair, and a rule to re-test after any corporate event. A pair that has stopped out goes back through the full screen on new data before it trades again. Expect many pairs to fail this: the spreads that pass a test are the ones that happened to behave in the past, and the edge across the industry has been shrinking for decades.',
      ],
      rules: [
        'Crowded books unwind together: correlations jump when someone sells.',
        'Book vol = σ × √((1 + (N − 1)ρ) ÷ N). Breadth vanishes as ρ rises.',
        'Leverage set for calm markets becomes a margin call in a crowded unwind.',
        'Corporate events can make a spread move permanently. Re-test after any.',
        'Borrow fees and recalls are part of the cost; squeezes hit the short leg.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'statarb-breaks-1',
          ask: 'A book of 50 equal-sized bets, each with volatility σ, has average pair correlation 0.02. In an unwind the correlation rises to 0.3. By what factor does the volatility of the book rise? Give two decimals.',
          answer: 2.82,
          tol: 0.01,
          check: 'math.sqrt((1 + 49 * 0.3) / (1 + 49 * 0.02))',
          why: '√(15.7 ÷ 1.98) ≈ 2.82. The positions did not change, only how they move together. A risk limit set on calm-market volatility is suddenly almost three times too large.',
        },
        {
          kind: 'number',
          id: 'statarb-breaks-2',
          ask: 'A market-neutral book runs at a gross leverage of 6: $600,000 of positions on $100,000 of capital. In a crowded unwind every position moves 2% against you. What percentage of capital do you lose? Give a percentage, for example 5%.',
          answer: 0.12,
          tol: 0.001,
          check: '6 * 0.02',
          why: '$600,000 × 2% = $12,000, which is 12% of capital. A 2% move that a single stock makes on an ordinary day becomes a large loss when every position makes it in the same direction at once.',
        },
        {
          kind: 'number',
          id: 'statarb-breaks-3',
          ask: "Khandani and Lo's unleveraged contrarian strategy returned −1.16%, −2.83% and −2.86% on 7, 8 and 9 August 2007. Their leveraged version multiplied each day by 4. Adding the daily figures, what was the leveraged loss over the three days? Give a percentage, for example −10%.",
          answer: -0.274,
          tol: 0.001,
          check: '4 * (-0.0116 - 0.0283 - 0.0286)',
          why: '4 × −6.85% = −27.4%, a little over a quarter of capital. The next day the unleveraged strategy made 5.92%, but a fund that had cut its positions on the way down did not get it back.',
        },
        {
          kind: 'number',
          id: 'statarb-breaks-4',
          ask: 'You short $20,000 of a hard-to-borrow stock as one leg of a pair. The borrow fee is 40% a year, charged on calendar days over a 360-day year. The trade lasts 10 calendar days and is planned to make $300 before borrow. What is left after borrow, in dollars? Give two decimals.',
          answer: 77.78,
          tol: 0.01,
          check: '300 - 20000 * 0.40 * 10 / 360',
          why: 'Borrow is $20,000 × 0.40 × 10 ÷ 360 ≈ $222.22, three quarters of the planned gain. Fees this high usually mean many others are short too, so the squeeze risk is also higher.',
        },
        {
          kind: 'output',
          id: 'statarb-breaks-5',
          ask: 'A spread that reverts for 400 days and then changes regime. The half-life is fitted on two windows. What does this print?',
          code: `import numpy as np

rng = np.random.default_rng(5)
s = np.zeros(800)
for t in range(1, 800):
    phi = 0.85 if t < 400 else 0.995
    s[t] = phi * s[t - 1] + rng.normal(0, 0.01)
def hl(x):
    p = np.polyfit(x[:-1], x[1:], 1)[0]
    return round(float(-np.log(2) / np.log(p)))
print(hl(s[:400]), hl(s[400:]))`,
          answer: '5 41',
          why: 'In the second window the fitted half-life is about eight times longer: the pull towards the mean has nearly gone. The true value there is about 138 days; with only 400 days, the fit flatters the speed, as the OU lesson warned. A half-life that lengthens on recent data is one of the earliest signs of a break.',
        },
        {
          kind: 'bug',
          id: 'statarb-breaks-6',
          ask: 'A stop check for a pair position. Shorts are stopped correctly, but a long position whose z falls to −6 is never stopped. Which line is wrong?',
          code: `def stopped(pos, z, stop):
    # pos is -1 (short the spread) or +1 (long the spread)
    if pos == 0:
        return False
    return z > stop`,
          line: 5,
          fix: '    return abs(z) > stop',
          why: 'A long spread position loses as z falls further below zero, so its stop is on the negative side. `abs(z)` covers both. A one-sided stop is the kind of bug that does nothing for months and then lets one broken pair run.',
        },
        {
          kind: 'write',
          id: 'statarb-breaks-7',
          numpy: true,
          ask: 'Write `contrarian_returns(R)`: `R` has shape (days, stocks). For each day t from 1 on, take weights `w = −(r − r̄) ÷ N` from day t − 1 and earn `Σ w × R[t]`. Return a NumPy array of these daily returns, length days − 1.',
          starter: `import numpy as np

def contrarian_returns(R):
    R = np.asarray(R, dtype=float)
    pass`,
          solution: `import numpy as np

def contrarian_returns(R):
    R = np.asarray(R, dtype=float)
    W = -(R - R.mean(axis=1, keepdims=True)) / R.shape[1]
    return (W[:-1] * R[1:]).sum(axis=1)`,
          tests: `R = np.array([[0.02, -0.02], [-0.01, 0.01], [0.0, 0.0]])
out = contrarian_returns(R)
assert out is not None, "the function returns nothing yet"
assert len(out) == 2, f"one return per day after the first: 2, got {len(out)}"
assert abs(out[0] - 0.0002) < 1e-12, f"weights -0.01 and +0.01, then returns -1% and +1%: 0.0002, got {out[0]}"
assert abs(out[1]) < 1e-12, "a flat day earns nothing"
rng = np.random.default_rng(8)
m = rng.normal(0, 0.01, (300, 1))
X = m + rng.normal(0, 0.01, (300, 20))
assert abs(contrarian_returns(X).mean()) < 0.0005, "on returns with no reversal the strategy should average close to zero"`,
          why: 'The weights use only yesterday, and the market move cancels because the weights add to zero. On data with no reversal it earns nothing on average; in a liquidation, when yesterday\'s losers keep falling, it loses every day the selling lasts.',
        },
        {
          kind: 'choice',
          id: 'statarb-breaks-8',
          ask: 'The equity curve of a diversified stat arb book of 80 pairs over twenty days. What does the shape most suggest?',
          chart: {
            title: 'Book equity, % of start',
            x: 'day',
            y: 'equity',
            series: [{ name: 'book', points: [100, 100.2, 100.4, 100.5, 100.7, 100.8, 101, 101.1, 100.2, 97.6, 94.8, 99.3, 99.6, 99.8, 100, 100.1, 100.3, 100.4, 100.6, 100.7], color: 'accent' }],
          },
          options: [
            'One pair broke, and the rest of the book was unaffected',
            'A crowded unwind: many unrelated pairs lost together for a few days, then much of the loss reversed when the selling stopped',
            'The market crashed, which a neutral book cannot survive',
            'The strategy stopped working permanently on day 9',
          ],
          answer: 1,
          why: 'One broken pair cannot move an 80-pair book by 6% in three days, and a permanent break would not reverse. Losses across many pairs at once followed by a snap back is the pattern Khandani and Lo described for August 2007.',
        },
        {
          kind: 'choice',
          id: 'statarb-breaks-9',
          ask: 'Your pair is long one bank and short another. The bank you are short announces it has agreed to be bought at a 30% premium. What do you do?',
          options: [
            'Add to the position: the z-score is now extreme',
            'Close or re-assess the pair at once: the target now trades on the deal, not with its old partner, so the spread\'s old mean no longer applies',
            'Wait for the time stop',
            'Nothing: the hedge ratio covers it',
          ],
          answer: 1,
          why: 'A takeover is a regime change. The target\'s price now tracks the deal terms and the chance the deal closes, so the history that set the spread\'s mean is irrelevant. The z-score will look like a once-in-a-lifetime entry, and that is the trap.',
        },
        {
          kind: 'choice',
          id: 'statarb-breaks-10',
          ask: "In October 2008, VW's ordinary shares rose from about €211 to over €1,000 in two trading days after Porsche disclosed control of about 74% of the company. Why did this hurt funds that held VW short only as one leg of a hedged trade?",
          options: [
            'It did not: hedged trades are immune to single-stock moves',
            'The hedge was sized for normal moves; few shares were free to buy back, so the short leg rose far more than the long leg could offset',
            'Because the long leg also fell to zero',
            'Because Porsche cancelled their borrow',
          ],
          answer: 1,
          why: 'A hedge ratio assumes the two legs keep their usual relationship. In a squeeze the short leg is driven by forced buying, not by the business, and a spread can move many standard deviations in a day.',
        },
        {
          kind: 'design',
          id: 'statarb-breaks-11',
          ask: 'A pair in your paper book has lost three times its planned gain and is now at z = −3.8. Write the post-mortem you run before deciding anything.',
          checklist: [
            { point: 'Check the news: earnings, deals, lawsuits, index changes, guidance', why: 'A corporate event can make the move permanent.' },
            { point: 'Refit β, the mean and the half-life on recent data and compare', why: 'A drifting β or a lengthening half-life is evidence of a break.' },
            { point: 'Check whether other pairs in the book lost on the same days', why: 'Losses across many pairs at once point to crowding, not to this pair.' },
            { point: 'Check the borrow fee and availability of the short leg', why: 'A rising fee or a recall changes the trade and warns of a squeeze.' },
            { point: 'Compare the loss with the stop and loss limits you set in advance', why: 'The rules were written for this moment; changing them now is the usual mistake.' },
            { point: 'If you close, decide whether and when the pair may be re-screened', why: 'It should pass the full screen on new data, not return because z looks attractive.' },
          ],
          why: 'The point of a post-mortem is to tell a broken pair from a noisy one using evidence, and to stop the z-score, which always looks most tempting at the worst moment, from making the decision.',
        },
      ],
    },
    {
      id: 'statarb-lab',
      title: 'Lab: a pairs backtest in NumPy',
      summary: 'From two made-up log price series to a hedge ratio, a spread, its half-life, z-score positions and net P&L, fitted in sample and judged out of sample.',
      text: [
        'This lab builds a complete pairs backtest from scratch on made-up data: B is a random walk and A is built from B plus a mean-reverting spread, with a fixed seed. Real data will be messier and a real spread far less obliging.',
        'The steps follow the module. Fit the hedge ratio by least squares on a **formation** window. Build the spread and fit an AR(1) to get its mean, width and half-life. Turn the spread into a z-score using only formation statistics. Generate positions with entry, exit and stop. Compute daily P&L, with each position earning the next day\'s move, net of costs on every change of position. Finally run the whole thing with the parameters frozen on the formation window and traded on the later window.',
        'Each step is self-contained: it repeats the helpers it needs, so you can run any step on its own.',
        'The result to look at is the out-of-sample net P&L next to the in-sample one. Even on data built to be cointegrated, the in-sample number is the better of the two because it was used to choose β, μ and σ. On real pairs the gap is usually larger, and often the out-of-sample number is negative.',
      ],
      rules: [
        'Fit β, μ, σ_eq and half-life on the formation window only.',
        'z on the trading window uses formation μ and σ_eq.',
        'Position set at the close of t earns the move from t to t + 1.',
        'Charge costs on every change of position, on both legs.',
        'Judge the rule on data it never saw; the in-sample result is an upper bound.',
      ],
      questions: [
        {
          kind: 'write',
          id: 'statarb-lab-1',
          numpy: true,
          ask: 'Step 1. Write `hedge(la, lb)`: fit `la = α + β lb` by least squares and return `(alpha, beta)`.',
          starter: `import numpy as np

def hedge(la, lb):
    la, lb = np.asarray(la, dtype=float), np.asarray(lb, dtype=float)
    pass`,
          solution: `import numpy as np

def hedge(la, lb):
    la, lb = np.asarray(la, dtype=float), np.asarray(lb, dtype=float)
    beta = ((lb - lb.mean()) * (la - la.mean())).sum() / ((lb - lb.mean()) ** 2).sum()
    return float(la.mean() - beta * lb.mean()), float(beta)`,
          tests: `out = hedge([1.0, 2.0, 3.0], [0.0, 1.0, 2.0])
assert out is not None, "the function returns nothing yet"
assert abs(out[0] - 1) < 1e-12 and abs(out[1] - 1) < 1e-12, f"la = 1 + lb gives (1, 1), got {out}"
rng = np.random.default_rng(0)
lb = 4 + np.cumsum(rng.normal(0, 0.01, 750))
u = np.zeros(750)
for t in range(1, 750):
    u[t] = 0.9 * u[t - 1] + rng.normal(0, 0.005)
la = 0.2 + 1.1 * lb + u
a, b = hedge(la[:500], lb[:500])
assert abs(b - 1.1) < 0.1, f"beta should be near 1.1, got {b:.3f}"`,
          why: 'The hedge ratio sets the dollars of B per dollar of A. Fit it on the formation window only; refitting it on the data you later trade is the most common leak in pairs backtests.',
        },
        {
          kind: 'write',
          id: 'statarb-lab-2',
          numpy: true,
          ask: 'Step 2. Write `spread_stats(s)`: fit `s[t] = c + φ s[t−1] + ε` and return `(mu, sd_eq, half_life)`, with `mu = c ÷ (1 − φ)`, `sd_eq = σ_ε ÷ √(1 − φ²)` (σ_ε the `ddof=0` standard deviation of the residuals) and `half_life = −ln 2 ÷ ln φ`.',
          starter: `import numpy as np

def spread_stats(s):
    s = np.asarray(s, dtype=float)
    pass`,
          solution: `import numpy as np

def spread_stats(s):
    s = np.asarray(s, dtype=float)
    x, y = s[:-1], s[1:]
    phi = ((x - x.mean()) * (y - y.mean())).sum() / ((x - x.mean()) ** 2).sum()
    c = y.mean() - phi * x.mean()
    sig = (y - c - phi * x).std()
    return float(c / (1 - phi)), float(sig / np.sqrt(1 - phi ** 2)), float(-np.log(2) / np.log(phi))`,
          tests: `rng = np.random.default_rng(1)
s = np.zeros(20000)
for t in range(1, 20000):
    s[t] = 0.01 + 0.9 * s[t - 1] + rng.normal(0, 0.01)
out = spread_stats(s)
assert out is not None, "the function returns nothing yet"
mu, sd, hl = out
assert abs(mu - 0.1) < 0.005, f"mu = 0.01 / (1 - 0.9) = 0.1, got {mu:.4f}"
assert abs(sd - 0.01 / np.sqrt(0.19)) < 0.001, f"sd_eq should be near 0.0229, got {sd:.4f}"
assert abs(hl - 6.58) < 0.7, f"half-life should be near 6.6 days, got {hl:.2f}"`,
          why: 'Three numbers turn a spread into a trading rule: where it reverts to, how wide it swings, and how fast it comes back. The half-life also sets the time stop.',
        },
        {
          kind: 'write',
          id: 'statarb-lab-3',
          ask: 'Step 3. Write `positions(z, entry, exit, stop)`: −1, 0 or +1 per z. Flat: short if z > entry, long if z < −entry (only if |z| < stop). Short closes when z <= exit, long when z >= −exit, either closes when |z| >= stop, and after a stop no new trade until |z| < entry.',
          starter: `def positions(z, entry, exit, stop):
    return [0] * len(z)`,
          solution: `def positions(z, entry, exit, stop):
    out, pos, cool = [], 0, False
    for x in z:
        if cool and abs(x) < entry:
            cool = False
        if pos != 0 and abs(x) >= stop:
            pos, cool = 0, True
        elif (pos == -1 and x <= exit) or (pos == 1 and x >= -exit):
            pos = 0
        elif pos == 0 and not cool and entry < abs(x) < stop:
            pos = -1 if x > 0 else 1
        out.append(pos)
    return out`,
          tests: `out = positions([0.0, 2.5, 1.0, -0.2, -2.2, 0.1], 2, 0, 4)
assert out is not None, "the function returns nothing yet"
assert list(out) == [0, -1, -1, 0, 1, 0], f"short at 2.5, flat at -0.2, long at -2.2, flat at 0.1: got {out}"
assert positions([2.5, 4.5, 3.0, 1.0, 2.5], 2, 0, 4) == [-1, 0, 0, 0, -1], "after a stop, wait for |z| < entry before trading again"
assert positions([5.0], 2, 0, 4) == [0], "do not open a trade beyond the stop"`,
          why: 'The same state machine as in the rules lesson. The last test matters: opening a trade when z is already past the stop means entering a pair that the rules would immediately call broken.',
        },
        {
          kind: 'output',
          id: 'statarb-lab-4',
          ask: 'Step 4. Daily P&L per $1 of A: the position set at the close of day t earns the spread move from t to t + 1, less a cost of `c × (1 + β)` for every unit change of position. What does this print?',
          code: `import numpy as np

s = np.array([0.00, 0.03, 0.02, 0.00, -0.01])
pos = np.array([0, -1, -1, 0, 0])
beta, c = 1.0, 0.001
gross = pos[:-1] * np.diff(s)
cost = c * (1 + beta) * np.abs(np.diff(pos))
print(round(float(gross.sum()), 4), round(float((gross - cost).sum()), 4))`,
          answer: '0.03 0.026',
          why: 'The short opened at the close of day 1 earns 0.01 and 0.02 as the spread falls from 0.03 to 0.00: 0.03 gross. Two changes of position cost 2 × 0.002 = 0.004, leaving 0.026. The move from day 0 to 1 is not earned: the position was set at its end.',
        },
        {
          kind: 'write',
          id: 'statarb-lab-5',
          numpy: true,
          ask: 'Step 5. Write `pnl(la, lb, beta, pos, c)`: the daily net P&L per $1 of A as a NumPy array of length n − 1. The spread move is `Δla − β Δlb`; the position from day t earns the move from t to t + 1; subtract `c × (1 + β) × |pos[t+1] − pos[t]|` on each day.',
          starter: `import numpy as np

def pnl(la, lb, beta, pos, c):
    la, lb, pos = np.asarray(la, dtype=float), np.asarray(lb, dtype=float), np.asarray(pos, dtype=float)
    pass`,
          solution: `import numpy as np

def pnl(la, lb, beta, pos, c):
    la, lb, pos = np.asarray(la, dtype=float), np.asarray(lb, dtype=float), np.asarray(pos, dtype=float)
    move = np.diff(la) - beta * np.diff(lb)
    return pos[:-1] * move - c * (1 + beta) * np.abs(np.diff(pos))`,
          tests: `la = np.array([0.0, 0.03, 0.02, 0.0, -0.01])
lb = np.zeros(5)
out = pnl(la, lb, 1.0, [0, -1, -1, 0, 0], 0.001)
assert out is not None, "the function returns nothing yet"
assert len(out) == 4, f"one P&L per day after the first: 4, got {len(out)}"
assert abs(out.sum() - 0.026) < 1e-12, f"0.03 gross less 0.004 of costs: 0.026, got {out.sum():.4f}"
assert abs(out[0] + 0.002) < 1e-12, "the day the position opens pays the entry cost and earns nothing"
out2 = pnl([0.0, 0.01, 0.02], [0.0, 0.01, 0.02], 1.0, [1, 1, 1], 0.0)
assert abs(out2.sum()) < 1e-12, "if both legs move together with beta 1, the spread does not move and P&L is zero"`,
          why: 'Working in log moves per $1 of A keeps the arithmetic small and makes the cost formula plain: every change of position trades $1 of A and $β of B.',
        },
        {
          kind: 'bug',
          id: 'statarb-lab-6',
          ask: 'Step 6. The z-score for the trading window. The backtest out of sample looks as good as in sample. Which line is wrong?',
          code: `import numpy as np

def trade_z(la, lb, split, alpha, beta, mu, sd_eq):
    s = np.asarray(la) - alpha - beta * np.asarray(lb)
    test = s[split:]
    return (test - test.mean()) / sd_eq`,
          line: 6,
          fix: '    return (test - mu) / sd_eq',
          why: 'Centring on the mean of the trading window uses the whole future of that window: if the spread drifts away, the z-score drifts with it and hides the break. The formation mean μ is the only mean you knew when trading started.',
        },
        {
          kind: 'write',
          id: 'statarb-lab-7',
          numpy: true,
          ask: 'Step 7. Write `backtest(la, lb, split, entry, exit, stop, c)`: fit α and β on the first `split` days, build the spread for all days, get μ and sd_eq from the formation spread, compute z for every day with those numbers, make positions, and return `(in_sample, out_of_sample)`: the summed net P&L of the positions run on days `[:split]` and on days `[split:]`, each run started flat. Helpers are in the starter.',
          starter: `import numpy as np

def hedge(la, lb):
    beta = ((lb - lb.mean()) * (la - la.mean())).sum() / ((lb - lb.mean()) ** 2).sum()
    return la.mean() - beta * lb.mean(), beta

def spread_stats(s):
    x, y = s[:-1], s[1:]
    phi = ((x - x.mean()) * (y - y.mean())).sum() / ((x - x.mean()) ** 2).sum()
    c = y.mean() - phi * x.mean()
    return c / (1 - phi), (y - c - phi * x).std() / np.sqrt(1 - phi ** 2)

def positions(z, entry, exit, stop):
    out, pos, cool = [], 0, False
    for x in z:
        if cool and abs(x) < entry:
            cool = False
        if pos != 0 and abs(x) >= stop:
            pos, cool = 0, True
        elif (pos == -1 and x <= exit) or (pos == 1 and x >= -exit):
            pos = 0
        elif pos == 0 and not cool and entry < abs(x) < stop:
            pos = -1 if x > 0 else 1
        out.append(pos)
    return np.array(out, dtype=float)

def pnl(la, lb, beta, pos, c):
    move = np.diff(la) - beta * np.diff(lb)
    return pos[:-1] * move - c * (1 + beta) * np.abs(np.diff(pos))

def backtest(la, lb, split, entry, exit, stop, c):
    la, lb = np.asarray(la, dtype=float), np.asarray(lb, dtype=float)
    pass`,
          solution: `import numpy as np

def hedge(la, lb):
    beta = ((lb - lb.mean()) * (la - la.mean())).sum() / ((lb - lb.mean()) ** 2).sum()
    return la.mean() - beta * lb.mean(), beta

def spread_stats(s):
    x, y = s[:-1], s[1:]
    phi = ((x - x.mean()) * (y - y.mean())).sum() / ((x - x.mean()) ** 2).sum()
    c = y.mean() - phi * x.mean()
    return c / (1 - phi), (y - c - phi * x).std() / np.sqrt(1 - phi ** 2)

def positions(z, entry, exit, stop):
    out, pos, cool = [], 0, False
    for x in z:
        if cool and abs(x) < entry:
            cool = False
        if pos != 0 and abs(x) >= stop:
            pos, cool = 0, True
        elif (pos == -1 and x <= exit) or (pos == 1 and x >= -exit):
            pos = 0
        elif pos == 0 and not cool and entry < abs(x) < stop:
            pos = -1 if x > 0 else 1
        out.append(pos)
    return np.array(out, dtype=float)

def pnl(la, lb, beta, pos, c):
    move = np.diff(la) - beta * np.diff(lb)
    return pos[:-1] * move - c * (1 + beta) * np.abs(np.diff(pos))

def backtest(la, lb, split, entry, exit, stop, c):
    la, lb = np.asarray(la, dtype=float), np.asarray(lb, dtype=float)
    alpha, beta = hedge(la[:split], lb[:split])
    s = la - alpha - beta * lb
    mu, sd = spread_stats(s[:split])
    z = (s - mu) / sd
    res = []
    for a, b in ((0, split), (split, len(s))):
        pos = positions(z[a:b], entry, exit, stop)
        res.append(float(pnl(la[a:b], lb[a:b], beta, pos, c).sum()))
    return res[0], res[1]`,
          tests: `rng = np.random.default_rng(0)
lb = 4 + np.cumsum(rng.normal(0, 0.01, 750))
u = np.zeros(750)
for t in range(1, 750):
    u[t] = 0.9 * u[t - 1] + rng.normal(0, 0.005)
la = 0.2 + 1.1 * lb + u
out = backtest(la, lb, 500, 2.0, 0.0, 4.0, 0.0005)
assert out is not None, "the function returns nothing yet"
ins, oos = out
assert ins > 0, f"on a built-in cointegrated pair the in-sample P&L should be positive, got {ins:.4f}"
assert oos > 0, f"and here out of sample too, got {oos:.4f}"
broken = la.copy()
broken[500:] += np.cumsum(np.full(250, 0.002))
ins2, oos2 = backtest(broken, lb, 500, 2.0, 0.0, 4.0, 0.0005)
assert abs(ins2 - ins) < 1e-12, "changing only the trading window must not change the in-sample result"
assert oos2 < oos, f"a spread that drifts away after day 500 should do worse out of sample, got {oos2:.4f} against {oos:.4f}"`,
          hint: 'Use the formation window for α, β, μ and sd_eq. Then run `positions` and `pnl` separately on `[0, split)` and `[split, n)`.',
          why: 'The second test is the reason for splitting: a break after the formation window cannot leak into the fitted parameters, so the out-of-sample number reports it honestly. Print both numbers for your own runs; the in-sample one is an upper bound.',
        },
        {
          kind: 'design',
          id: 'statarb-lab-8',
          ask: 'Your backtest on a real pair shows a good out-of-sample result. Before you paper trade it, what do you check and report?',
          checklist: [
            { point: 'In-sample and out-of-sample net P&L side by side, with the number of trades in each', why: 'A result built on four trades is an anecdote.' },
            { point: 'How many pairs and parameter settings were tried to find this one', why: 'The best of many tries is biased upwards.' },
            { point: 'Costs at a realistic level, and the result at double that cost', why: 'Small edges disappear when costs are a little worse than assumed.' },
            { point: 'Borrow fees and availability over the period for the short leg', why: 'A backtest that shorts freely may describe a trade that could not be done.' },
            { point: 'Rolling β and half-life across the whole period', why: 'A drifting relationship means the parameters you trade with will be stale.' },
            { point: 'The worst trade, the longest trade and the largest drawdown', why: 'These are what you will live through, not the average.' },
            { point: 'Results with nearby entry, exit and stop levels', why: 'A rule that only works at one setting is fitted to noise.' },
          ],
          why: 'A pairs backtest has many places to flatter itself: chosen pairs, fitted parameters, cheap costs, free borrow. The report should make each of them visible so that paper trading tests the rule, not your hopes.',
        },
      ],
    },
  ],
}
