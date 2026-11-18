import type { Block } from '../../types'

/** The full theory for each lesson of the statistical arbitrage module, keyed by lesson id. */
export const statarbTheory: Record<string, Block[]> = {
  'statarb-idea': [
    { h: 'Betting on prices against each other' },
    "Most trades are a view on direction: the stock will rise, the index will fall. **Relative value** trading asks a different question: is this stock cheap or rich compared with something very like it? If Coca-Cola and PepsiCo usually move together and Coca-Cola has fallen behind for no clear reason, a relative value trader buys Coca-Cola and sells PepsiCo, and does not care much whether the market as a whole goes up or down. The bet is on the gap.",
    "**Statistical arbitrage**, usually shortened to stat arb, is relative value done with models and in bulk. A model says which prices look out of line, and the book holds dozens or hundreds of such bets at once. Each one is weak. The hope is that many weak, independent bets add up to a steady whole. The quant module traded a single pair; this module builds the full version.",

    { h: 'Selling short and the two sides of a book' },
    'To bet against a stock you **sell it short**: borrow shares from a lender through your broker, sell them, and buy them back later to return them. You gain if the price falls. While the short is open you pay a **borrow fee**, and the lender can ask for the shares back.',
    { sub: 'Dollar neutral' },
    'A book is **dollar neutral** when the dollars held long equal the dollars sold short. $50,000 long and $50,000 short is dollar neutral. It sounds as if the market cannot hurt it. It can.',
    { sub: 'Beta neutral' },
    "**Beta** (β) measures how much a stock tends to move for each 1% move of the market, as the alpha module showed with a regression. Suppose you are long $50,000 of a stock with β = 1.3 and short $50,000 of one with β = 0.9. The long leg acts like $65,000 of the market and the short leg like $45,000, so the book still carries $20,000 of market exposure. If the market rises 4%, the book gains about $800 for that reason alone. A book is **beta neutral** when `Σ dollarsᵢ × βᵢ = 0`, with shorts counted as negative dollars. To get there here you would short $50,000 × 1.3 ÷ 0.9 ≈ $72,222 of the second stock.",
    { sub: 'Gross, net and leverage' },
    '**Gross exposure** is long dollars plus short dollars; **net exposure** is long minus short. **Leverage** is gross divided by your capital. A $100,000 account with $90,000 long and $90,000 short is flat on net but has gross leverage of 1.8. Losses are driven by gross: if both legs move 3% against you, you lose 3% of $180,000, which is $5,400.',

    { h: 'Why many small bets' },
    "The quant module's **fundamental law of active management** says that the quality of a strategy grows with the square root of the number of independent bets. If N bets each have a Sharpe ratio S (average return divided by its volatility) and are sized to the same risk, the book's Sharpe ratio is about `S × √N` when they are independent. When every pair of bets has correlation ρ, the formula becomes `S × √N ÷ √(1 + (N − 1)ρ)`.",
    {
      code: `import math

def book_sharpe(s, n, rho):
    return s * math.sqrt(n) / math.sqrt(1 + (n - 1) * rho)

for rho in (0.0, 0.05, 0.2):
    print(rho, round(book_sharpe(0.15, 40, rho), 2))`,
      out: `0.0 0.95
0.05 0.55
0.2 0.32`,
    },
    'Forty bets with a Sharpe of 0.15 each would make a book of about 0.95 if they were independent. A correlation of only 0.05 between them cuts that to 0.55, and 0.2 cuts it to 0.32. Bets that share a driver, such as the same sector or the same model used by other funds, are fewer bets than they look.',

    { h: 'A short history' },
    'In the mid-1980s a group at Morgan Stanley, associated with Gerry Bamberger and Nunzio Tartaglia, traded pairs of stocks by computer. It was reported to have made around $50 million in 1987, broke up in 1989, and its members carried the idea to other firms. Academic work followed. Gatev, Goetzmann and Rouwenhorst (2006) tested simple pairs on US stocks from 1962 to 2002 and found average excess returns of about 11% a year before some costs. Do and Faff (2010) extended the data and found the returns falling decade by decade. As more money ran similar models, gaps closed faster and the edge thinned. That is the usual life story of a public trading idea.',

    { h: 'Why it is not really arbitrage' },
    'In textbooks an **arbitrage** locks in a profit with no risk, such as buying and selling the same thing at two prices at once. Stat arb locks in nothing. It bets that a relationship seen in the past continues, and relationships change. A stat arb book can lose for months. It pays two sets of costs on every trade, one per leg, plus borrow on the shorts. And because many funds use similar models, they hold similar positions, which matters greatly when one of them has to sell. A later lesson covers August 2007, when that happened.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Calling a dollar-neutral book market neutral without checking its beta.',
        'Measuring risk on net exposure instead of gross.',
        'Counting 30 pairs in one sector as 30 independent bets.',
        'Believing that a hedged trade cannot lose much.',
      ],
    },
  ],

  'statarb-finding': [
    { h: 'Where pairs come from' },
    'A **pair** is two securities whose prices you expect to stay together, so that when they move apart you can bet on them coming back. The search for pairs is where most of the mistakes in stat arb are made, because a computer can test thousands of combinations and some of them will look excellent by luck.',
    'Start from economics. Two companies that sell the same thing to the same customers, face the same costs and are valued by the same investors have a reason to move together: two large railroads, two oil majors, two classes of share in one company, a stock and the ETF of its sector. Then check the practical side: both must trade enough to get in and out cheaply, and the one you short must be easy to borrow.',

    { h: 'Correlation and cointegration measure different things' },
    { sub: 'Correlation of returns' },
    '**Correlation** of daily returns measures whether two stocks tend to move in the same direction on the same day. It runs from −1 to 1. Two bank stocks might have a daily return correlation of 0.8.',
    { sub: 'Cointegration of prices' },
    'A pair trader needs something else: the **spread**, the gap between the two log prices after scaling one by a hedge ratio, must keep returning to its usual level. A series that keeps returning to a fixed level and has a stable spread of values is called **stationary**. When a combination of two wandering prices is stationary, the prices are **cointegrated**. The quant module compared this to a walker and a dog on a lead.',
    'The two ideas can disagree. Suppose stock X grows its profits a little faster than stock Y every year. Day to day they move together, so their returns are highly correlated. But X gains a few hundredths of a percent more on an average day, and over two years the gap between them grows and never comes back. High correlation, no cointegration: a z-score rule would short X all the way up. The reverse also happens: a pair can be cointegrated while its daily returns are only moderately correlated, because each stock has a lot of daily noise that cancels out over weeks.',

    { h: 'The distance method' },
    'Gatev, Goetzmann and Rouwenhorst used a simple screen. Take a 12-month **formation period**. Divide each stock\'s total-return price by its first value so every series starts at 1. For each pair, add up the squared differences between the two scaled series over the period: the **sum of squared differences**, or SSD. The pairs with the smallest SSD are the ones that tracked each other most closely.',
    {
      code: `import numpy as np

a = np.array([40.0, 40.8, 41.6, 40.4])
b = np.array([80.0, 82.4, 82.4, 80.8])
d = a / a[0] - b / b[0]
print(d.round(3).tolist(), round(float((d ** 2).sum()), 5))`,
      out: `[0.0, -0.01, 0.01, 0.0] 0.0002`,
    },
    'Scaled, A goes 1, 1.02, 1.04, 1.01 and B goes 1, 1.03, 1.03, 1.01, so their differences are tiny and the SSD is 0.0002. Without the scaling, the $40 gap in price level would swamp everything.',
    'In the following 6-month **trading period**, the method opens a trade when the scaled prices of a chosen pair move apart by more than two standard deviations of their difference, measured in the formation period: short the one that rose, buy the one that fell, in equal dollars. It closes when the two scaled prices cross. The authors chose 12 and 6 months without optimising them and kept them fixed, to avoid tuning the rule to the data.',
    { sub: 'What the distance method misses' },
    'It uses no hedge ratio: one dollar of each stock, even if one is far more volatile. And the closest pairs often have a spread that hardly moves at all, so even a two-standard-deviation gap may be smaller than the cost of four fills.',

    { h: 'The multiple testing trap' },
    'From n stocks you can form `n × (n − 1) ÷ 2` pairs: each stock pairs with n − 1 others, and each pair is counted twice. Fifty stocks give 1,225 pairs. If you test every pair for cointegration at the 5% significance level, then even if none were truly cointegrated about 5% would pass by chance: around 61 false discoveries. The quant module called this data snooping.',
    'The **Bonferroni correction** controls it bluntly: to keep a 5% chance of even one false pass across m tests, demand a p-value below 0.05 ÷ m from each. For 1,225 tests that is about 0.00004, a bar real pairs rarely clear with a few years of data. The practical answer is a short list chosen in advance for economic reasons, a formation window to test it on, and a later window it has never seen to judge it.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Screening every stock against every other and trusting the top of the list.',
        'Choosing pairs by return correlation.',
        'Picking the tightest pair without checking whether its gaps can pay for costs.',
        'Testing and judging on the same window.',
      ],
    },
  ],

  'statarb-coint': [
    { h: 'What the Engle-Granger test is for' },
    "The previous lesson said a pair needs a stationary spread. The **Engle-Granger** method, named after the economists Robert Engle and Clive Granger, is the standard two-step way to check that for two price series. Step one finds the hedge ratio by regression. Step two tests whether the leftover, the spread, behaves like a random walk or keeps returning. The qseries module introduced unit roots and the Dickey-Fuller idea; here it is applied to a fitted spread, where it needs a different table of critical values.",

    { h: 'Step one: the hedge ratio by regression' },
    { sub: 'The regression' },
    'Work in natural logs of prices, written ln A and ln B, so that a change is close to a percentage change. Fit a straight line `ln A = α + β × ln B + e` by **least squares**, which picks α and β to make the sum of squared errors e as small as possible. With a and b standing for the two log price series, the answers are `β = cov(a, b) ÷ var(b)` and `α = mean(a) − β × mean(b)`, where cov is the covariance and var the variance.',
    { sub: 'A worked example' },
    'Say the covariance of the two log series over a year is 0.0021 and the variance of ln B is 0.0014. Then β = 1.5. If the mean of ln A is 4.20 and the mean of ln B is 2.90, α = 4.20 − 1.5 × 2.90 = −0.15. The residual `e = ln A − α − β ln B` is the spread, and because of the intercept it averages exactly zero over the window.',
    { sub: 'From β to shares' },
    'In log terms β is the dollars of B per dollar of A. With $20,000 of A, you short 1.5 × $20,000 = $30,000 of B. If B trades at $60, that is 500 shares.',

    { h: 'Step two: testing the residual for a unit root' },
    'A **unit root** is the property that makes a random walk wander without any pull back. The **Dickey-Fuller** test checks for it by regressing the daily change of the spread on its previous level, with no intercept: `Δe[t] = γ × e[t−1] + ε`. If the spread is pulled back towards zero, a high value is followed by a fall and a low value by a rise, so γ is negative. The test statistic is the t statistic `γ̂ ÷ se(γ̂)`: the estimate divided by its standard error.',
    {
      code: `import numpy as np

rng = np.random.default_rng(7)
e = np.zeros(500)
for t in range(1, 500):
    e[t] = 0.8 * e[t - 1] + rng.normal(0, 0.01)
x, dy = e[:-1], np.diff(e)
g = (x * dy).sum() / (x * x).sum()
se = np.sqrt(((dy - g * x) ** 2).sum() / (len(dy) - 1) / (x * x).sum())
print(round(g, 2), round(g / se, 1))`,
      out: `-0.18 -7.0`,
    },
    'This spread was built to keep 80% of its gap each day, so the true γ is −0.2 and the fit finds −0.18. The t statistic of −7.0 is far beyond any critical value. The **augmented** Dickey-Fuller test adds a few lagged changes of e to the regression to absorb short-term patterns in the changes; the logic is the same.',

    { h: 'Why the critical values are different' },
    'A **critical value** is the line the t statistic must cross to reject the idea of a unit root at a given significance level. You cannot use the normal curve here (−1.65 at 5% one-sided), and you cannot use the plain Dickey-Fuller table either (about −2.86 at 5% with a constant). Step one chose β to make the residual as small and as steady as possible, so even two unrelated random walks produce residuals that look more stationary than chance would suggest. MacKinnon\'s tables for the Engle-Granger residual test with two series and a constant give large-sample values of about −3.90 at 1%, −3.34 at 5% and −3.04 at 10%.',
    'In Python the full test is `statsmodels.tsa.stattools.coint(y, x)`, which returns the statistic, a p-value and these critical values. For three or more series together the usual tool is the **Johansen** test, `statsmodels.tsa.vector_ar.vecm.coint_johansen`. Neither runs in this course\'s browser, so the lessons build the small version in NumPy.',

    { h: 'Spurious regression and direction' },
    { sub: 'Spurious regression' },
    'Regress one random walk on another unrelated one and you often get a large R² (the share of variance the fit explains) and a slope that looks significant. Both wandered over the same stretch of time, and least squares lines them up. This is **spurious regression**, and step two exists to catch it: the residual of a spurious fit still has a unit root.',
    { sub: 'Which stock goes on the left' },
    'Regressing A on B and B on A give different slopes. The slope of A on B is cov ÷ var(b), of B on A it is cov ÷ var(a), and their product is cov² ÷ (var(a) × var(b)), which is R², not 1. So with an R² of 0.8 and a slope of 1.6 one way, the other way gives 0.8 ÷ 1.6 = 0.5. The test result can differ by direction too, so run both.',

    { h: 'One window is one draw' },
    'The β and the test both come from one stretch of history. Fit them on past data only, check them on later windows, and expect drift. A pair that passes in one year and fails in the next is the normal case. A trading desk treats a passing test as the start of the checks, not the end.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Comparing the residual t statistic with −1.65 or −2.86.',
        'Fitting β on the same data used to judge the trade.',
        'Running only one direction of the regression.',
        'Trusting a high R² between two price series.',
      ],
    },
  ],

  'statarb-ou': [
    { h: 'A model for a spread that comes back' },
    'Once a spread passes the test, you want to know how it behaves: where it returns to, how fast, and how far it usually strays. The standard model is the **Ornstein-Uhlenbeck process**, OU for short, named after two physicists who used it for particles jostled by molecules. Think of a ball attached by a spring to a post while someone keeps nudging it: the further it is from the post, the harder the spring pulls back.',

    { h: 'The pieces of the model' },
    'Written as a formula, `ds = θ(μ − s)dt + σ dW`. Read it in words. In a short time dt the spread s moves towards its **long-run mean** μ by an amount proportional to how far away it is; θ (theta) is the **speed of reversion**. On top, a random shock of size σ arrives, dW standing for a small piece of pure noise. Far from μ the pull dominates; near μ the noise dominates.',
    { sub: 'The daily version is an AR(1)' },
    'Data come once a day, and sampled daily an OU process becomes an **AR(1)**, an autoregression of order one, which the qseries module fitted: `s[t] = c + φ × s[t−1] + ε`. The link is `φ = e^(−θ)` for a one-day step. The long-run mean is `μ = c ÷ (1 − φ)`, because at the mean s = c + φs. The quant module wrote the same model as a regression of the change, `Δs = a + b × s[t−1]`, with `b = φ − 1`.',
    { sub: 'Half-life' },
    'The **half-life** is the time for half of a gap to close on average: `ln 2 ÷ θ`, or `−ln 2 ÷ ln φ` in days. With φ = 0.92 it is about 8.3 days.',

    { h: 'Expected path and usual width' },
    'From today\'s value, the expected value h days ahead is `μ + φ^h × (s − μ)`: the gap shrinks by the factor φ each day. A spread 0.05 above its mean with φ = 0.92 is expected to be 0.05 × 0.92⁵ ≈ 0.033 above it after five days.',
    'The usual width of the range is the long-run standard deviation, `σ_eq = σ_ε ÷ √(1 − φ²)`, where σ_ε is the standard deviation of the daily shocks ε. With σ_ε = 0.008 and φ = 0.92, σ_eq = 0.008 ÷ √0.1536 ≈ 0.0204. Shocks pile up before the pull undoes them, so the spread wanders well beyond a single day\'s shock, and the slower the pull the wider it wanders. σ_eq is the natural unit for the z-scores of the next lesson.',
    {
      code: `import math

c, phi, sig = 0.004, 0.92, 0.008
mu = c / (1 - phi)
half_life = -math.log(2) / math.log(phi)
sd_eq = sig / math.sqrt(1 - phi ** 2)
print(round(mu, 3), round(half_life, 1), round(sd_eq, 4))`,
      out: `0.05 8.3 0.0204`,
    },

    { h: 'Fitting it to data' },
    'Regress `s[1:]` on `s[:-1]` with an intercept. The slope is φ, the intercept c, and the standard deviation of the residuals σ_ε. Those three numbers give μ, half-life and σ_eq through the formulas above. If the fitted φ is 1 or more there is no reversion at all: the half-life is infinite or undefined, and code that turns a fit into trading rules must say so instead of producing a number.',

    { h: 'How much to trust the numbers' },
    { sub: 'Noise in φ' },
    'With a few hundred days of data, φ is uncertain in its second decimal, and near 1 that matters a great deal. φ = 0.96 is a half-life of 17 days; φ = 0.99 is 69 days. The data rarely tell those apart with confidence.',
    { sub: 'Bias in short samples' },
    'Least squares tends to estimate φ too low in short samples, so reversion looks faster than it is. The rule of thumb is to want many half-lives of data: a 30-day half-life fitted on 90 days rests on three reversions and is barely evidence at all. In the figure, notice how the fitted half-life drifts further from the true one as the true one grows.',

    { h: 'On a real trading day' },
    'The half-life sets how many trades a pair offers in a year and how long money is tied up in each. A 5-day half-life might give a trade every few weeks; a 60-day half-life might give two a year, each lasting months, with all the borrow fees and news risk that implies. Many desks only trade spreads whose half-life is a small fraction of the fitting window.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Treating the intercept c as the mean.',
        'Quoting a half-life to one decimal from a few months of data.',
        'Producing a half-life when φ is 1 or above.',
        'Ignoring that slow reversion means a wide, long-lasting range.',
      ],
    },
  ],

  'statarb-rules': [
    { h: 'From a model to a rule' },
    'The OU fit says where the spread lives and how fast it comes back. A **trading rule** turns that into actions: when to open, which way, when to close and when to give up. Every part of it should be fixed before trading, so that nothing is decided in the heat of a loss.',

    { h: 'The z-score and the three levels' },
    'The **z-score** expresses how far the spread is from its mean in units of its usual width: `z = (s − μ) ÷ σ_eq`. A spread of 0.08 with μ = 0.05 and σ_eq = 0.015 has z = 2.',
    { sub: 'Entry' },
    'When z rises above the **entry** level, say 2, the spread is rich: **short the spread**, which means sell A and buy β dollars of B for each dollar of A. When z falls below −2, buy the spread: buy A and sell β of B.',
    { sub: 'Exit' },
    'Close when z comes back to the **exit** level, often 0. Closing a little early, at 0.5 for a short, gives up part of the move but closes more trades before something goes wrong. Avellaneda and Lee, in the residual strategy of the next lesson, opened at 1.25 and closed shorts at 0.75 and longs at −0.5.',
    { sub: 'Stops' },
    'A **price stop** closes the trade if |z| passes a wider level, say 3.5: the spread has gone further than the model expects, which is what a broken pair looks like. A **time stop** closes the trade after a set number of half-lives. After k half-lives the expected remaining gap is `0.5^k` of the start; after two it is a quarter. A trade still near its entry by then is not behaving like the model. After a stop, many rules wait until |z| is back inside the entry band before trading the pair again, so they do not fade a spread that has broken.',

    { h: 'Does the gap pay for the trade' },
    'If the plan works, a trade captures about `(entry − exit) × σ_eq` of spread. On $D of A, P&L is about D times the change in the spread, because the spread is in log terms. Entering at 2 and exiting at 0 on σ_eq = 0.015 with $30,000 of A plans to make 0.03 × $30,000 = $900.',
    'Costs: four fills (two legs, opened and closed). If each fill costs c as a fraction of the dollars traded, counting commission, half the bid-ask spread and market impact, the round trip on $D of A and $βD of B is `2 × (1 + β) × D × c`. With β = 1.1 and c = 0.05%, that is 2 × 2.1 × $30,000 × 0.0005 = $63, plus borrow on the short leg for each day held. A tight pair whose planned gain is close to its cost is not worth trading, however strong its test result.',

    { h: 'No peeking' },
    'A backtest must use only what was known at the time. Two leaks are common. A z-score built from the mean and standard deviation of the whole sample, or of a window that reaches into the future, already knows where the spread is going. And a position set from day t\'s closing z-score cannot earn the move that happened during day t. The clean convention is: decide at the close of day t, earn the move from t to t + 1.',
    {
      code: `import numpy as np

s = np.array([0.00, 0.02, 0.03, 0.01, 0.00])
pos = np.array([0, 0, -1, -1, 0])
print(round(float((pos[:-1] * np.diff(s)).sum()), 3))
print(round(float((pos[1:] * np.diff(s)).sum()), 3))`,
      out: `0.03
0.01`,
    },
    'The first line pays each position on the next move. The short opened at 0.03 earns the fall to 0.00. The second line pays positions on the move that created them, which here happens to be smaller but in a real backtest with z-score entries systematically helps, because the entry day\'s move is the one that pushed z past the threshold.',

    { h: 'Sizing the legs and the pair' },
    { sub: 'The legs' },
    'The hedge ratio sets the legs: β dollars of B per dollar of A, rounded to whole shares.',
    { sub: 'The pair' },
    'Size each pair by its risk rather than by dollars. If the spread\'s daily change has a standard deviation σ_Δ and you accept about $R of daily swings on one pair, hold `D = R ÷ σ_Δ` of A. With σ_Δ = 0.01 and R = $300, that is $30,000. A noisy pair then gets less money and a quiet one more, so no single pair dominates the book.',
    'Some traders add to a pair as z widens, called **scaling in**. If the pair holds, the average entry improves; if it breaks, the loss is larger. Cap the total size per pair if you do it.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Ignoring costs because the backtest has many winning trades.',
        'Using a z-score with any knowledge of the future.',
        'Re-entering straight after a stop.',
        'Setting the stop level by finding what worked best on one history.',
      ],
    },
  ],

  'statarb-baskets': [
    { h: 'Beyond two stocks' },
    'A pair is the simplest spread. The same idea works with more legs: a stock against a group of peers, a futures contract against the index it tracks, an ETF against the stocks it holds, or every stock in a universe against the market. Each version trades the gap between a price and a fair value built from other prices.',

    { h: 'Spreads with several legs' },
    'Regress the log price of A on several others: `ln A = α + β₁ ln B₁ + β₂ ln B₂ + e`. In NumPy, stack a column of ones and the B series into a matrix X and call `np.linalg.lstsq(X, y, rcond=None)`, which returns the intercept and the βs. The residual e is the spread. For testing cointegration among three or more series at once, practitioners use the Johansen test in statsmodels.',
    {
      code: `import numpy as np

X = np.array([[1, 1.0, 2.0], [1, 2.0, 1.0], [1, 3.0, 3.0], [1, 4.0, 2.0]])
y = 0.5 + 0.7 * X[:, 1] + 0.2 * X[:, 2]
coef = np.linalg.lstsq(X, y, rcond=None)[0]
print(coef.round(2).tolist())`,
      out: `[0.5, 0.7, 0.2]`,
    },
    'With no noise the fit recovers the weights exactly. Real data add noise, and each extra leg is one more estimate that can drift and one more set of fills to pay for.',

    { h: 'Index arbitrage' },
    { sub: 'Fair value of a future' },
    'A **stock index future** is a contract to buy or sell the index at a set price on a future date. Holding the future instead of the stocks saves the interest on the money you did not spend but misses the dividends. A simple fair value is `F = S × (1 + (r − q) × T)`, where S is the index level, r the interest rate a year, q the dividend yield a year and T the time to expiry in years. With S = 4,000, r = 5%, q = 2% and three months to go, F = 4,000 × (1 + 0.03 × 0.25) = 4,030. Real desks use exact dividend forecasts and their own funding rates.',
    { sub: 'Who earns the gap' },
    'If the future trades above fair value by more than the costs, sell the future and buy every stock in the index; if below, the reverse. This is **index arbitrage**. It is close to a true arbitrage, which is exactly why fast firms with very low costs close the gaps almost at once. For an individual the visible gap is nearly always inside the costs.',

    { h: 'ETFs and their holdings' },
    'An **exchange-traded fund** holds a basket and trades on an exchange like a stock. Its **net asset value** (NAV) per share is the value of the holdings divided by the number of ETF shares. The **premium** is `price ÷ NAV − 1`; a negative premium is a discount. An ETF at $40.10 with a NAV of $40.00 is at a 0.25% premium.',
    'What keeps the price close to NAV is the **creation and redemption** mechanism. Large dealers called **authorised participants** can hand the fund a basket of the holdings and receive new ETF shares (creation), or hand back ETF shares and receive the basket (redemption). When the premium is bigger than their costs they create and sell ETF shares; at a discount they buy ETF shares and redeem them. For large equity ETFs this keeps the gap to a few hundredths of a percent most of the time.',
    'The NAV is only as good as the prices it is built from. In March 2020, when corporate bonds were barely trading, LQD, a large investment-grade corporate bond ETF, closed about 5% below its published NAV on some days. Many observers argued that the ETF price was the more honest number and the NAV was stale. A discount that cannot be captured at real prices is not an arbitrage.',

    { h: 'Residual reversal' },
    { sub: 'Removing the market' },
    "Take one stock's daily return r and the market's return r_m. With β from a regression, the **residual** is `ε = r − β × r_m`: the part of today's move the market does not explain. A stock with β = 0.8 that rose 2.5% on a day the market rose 1% has a residual of 1.7%.",
    { sub: 'Trading the residual' },
    'Add up each stock\'s residuals over a trailing window. That running sum behaves like a spread between the stock and its hedge, and the AR(1) fit gives its mean, width and half-life. Avellaneda and Lee (working paper 2008, published 2010) did this across US stocks with a 60-day window, using sector ETFs or statistical factors in place of the market. They opened a trade when the residual z-score passed ±1.25, closed shorts below 0.75 and longs above −0.5, and skipped stocks whose reversion was too slow for the window. They reported a Sharpe ratio after costs of about 1.44 for their factor version over 1997 to 2007, with clear decay: about 0.9 from 2003 to 2007.',
    { sub: 'The contrarian portfolio' },
    'Lo and MacKinlay (1990) described a simpler version: weight each stock by `wᵢ = −(rᵢ − r̄) ÷ N`, where rᵢ is its return yesterday, r̄ the average over all N stocks. A stock that beat the average is sold in proportion; one that lagged is bought. The weights always add to zero.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Treating an ETF discount to a stale NAV as free money.',
        'Competing on speed in index arbitrage with retail costs.',
        'Adding legs to a basket until the past fits perfectly.',
        'Forgetting to hedge the net market exposure that many residual bets add up to.',
      ],
    },
  ],

  'statarb-breaks': [
    { h: 'Every model fails somewhere' },
    'A stat arb book makes small gains most days and is exposed to a few kinds of large loss. They are worth knowing by name, because each has a different warning sign and a different defence: a crowded unwind, a regime change in one pair, and the costs and squeezes of the short leg.',

    { h: 'August 2007' },
    { sub: 'What happened' },
    'In the week of 6 August 2007, many quantitative long-short equity funds lost heavily. The market itself was quiet on the 7th and 8th. Andrew Lo and Amir Khandani rebuilt the episode with the contrarian strategy of the previous lesson applied to US stocks. Unleveraged, it lost 1.16% on 7 August, 2.83% on the 8th and 2.86% on the 9th, then gained 5.92% on the 10th. They thought leverage of about 8 to 1 was typical, which multiplies those days by 4: a loss of about a quarter of capital in three days.',
    { sub: 'Their explanation' },
    'Khandani and Lo called their account a hypothesis based on indirect evidence. One or more large funds, probably a multi-strategy fund hit by losses in credit, sold their equity market-neutral book quickly. Selling the longs and buying back the shorts pushed prices against every fund holding similar positions. Those funds hit their risk limits and cut too, adding to the move. When the selling stopped, prices bounced back, but many funds had already cut and did not get the rebound.',

    { h: 'Crowding in numbers' },
    'The danger is that bets which look independent in calm markets become correlated when similar holders sell at once. The volatility of an equal-weight book of N bets, each with volatility σ and average correlation ρ, is `σ × √((1 + (N − 1)ρ) ÷ N)`.',
    {
      code: `import math

def book_vol(sigma, n, rho):
    return sigma * math.sqrt((1 + (n - 1) * rho) / n)

for rho in (0.01, 0.1, 0.4):
    print(rho, round(book_vol(0.02, 100, rho), 4))`,
      out: `0.01 0.0028
0.1 0.0066
0.4 0.0127`,
    },
    'A book of 100 bets, each with 2% daily volatility, is very calm at ρ = 0.01. At ρ = 0.4 it is about 4.5 times as volatile, with the same positions. Leverage chosen for the calm number becomes a margin call at the stressed one, and forced selling raises ρ further.',

    { h: 'Regime change in a single pair' },
    'A **regime change** is a lasting shift in what drives a price. For a pair, the usual causes are corporate events: a takeover bid for one company, a spin-off, a large acquisition that changes its business, a lawsuit, a change of index membership. After the event the old mean of the spread no longer applies, and a z-score rule built on it keeps betting on a return that will not come.',
    { sub: 'Warning signs' },
    {
      list: [
        'The half-life fitted on recent data is much longer than before.',
        'The rolling hedge ratio drifts away from its old value.',
        'The spread sets a new extreme and stays near it rather than bouncing.',
        'There is news about one leg and not the other.',
      ],
    },

    { h: 'The short leg' },
    { sub: 'Borrow fees and recalls' },
    'Borrow fees for large, liquid US stocks are usually a fraction of a percent a year, but a stock that many people want to short can cost tens of percent. Fees are commonly charged daily on a 360-day year, so a 25% fee on a $10,000 short for 18 days costs $10,000 × 0.25 × 18 ÷ 360 = $125. The lender can also recall the shares, forcing you to buy them back at a time you did not choose. Check the rules and rates with your broker; they change.',
    { sub: 'Short squeezes' },
    'In a **short squeeze**, short sellers rush to buy back shares, and their buying pushes the price higher, which forces more of them to buy. On 26 October 2008 Porsche disclosed that it controlled about 74% of Volkswagen through shares and cash-settled options. With the state of Lower Saxony holding much of the rest, few shares were free to buy. VW\'s ordinary shares went from about €211 to over €1,000 within two trading days. A fund short VW as one leg of a hedged trade lost far more on that leg than its hedge ratio could cover.',

    { h: 'Deciding that a pair is finished' },
    'Write down in advance what ends a pair: a price stop, a time stop, a maximum loss per pair in dollars, and a rule that any corporate event triggers a full re-test. A pair that has stopped out goes back through the screen on new data before it trades again. Expect many not to return: pairs that pass a test are partly the ones that happened to behave in the past, and the edge across the industry has been falling for decades.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Sizing leverage from calm-market volatility.',
        'Adding to a pair after a takeover bid because the z-score looks extreme.',
        'Ignoring the borrow fee until it shows up on the statement.',
        'Cutting everything at the bottom of an unwind without a plan made in advance.',
      ],
    },
  ],

  'statarb-lab': [
    { h: 'What the lab builds' },
    'The lab assembles the module into one honest pairs backtest in NumPy, on made-up data with a fixed seed. Log price B is a random walk. Log price A is built from B times a hedge ratio, plus a constant, plus a mean-reverting spread. Because the pair is cointegrated by construction, the lab can show what a backtest looks like when the model is right, and then what happens when the spread breaks after the fitting window.',

    { h: 'Two windows' },
    { sub: 'Formation' },
    'The first part of the data, the **formation window**, is used to fit everything: α and β by least squares, then μ, σ_eq and the half-life from an AR(1) fit of the spread.',
    { sub: 'Trading' },
    'The rest, the **trading window**, is traded with those numbers frozen. The z-score on every trading day is `(s − μ) ÷ σ_eq` with the formation μ and σ_eq. Centring on the trading window\'s own mean would use information from its future: if the spread drifts, a moving centre drifts with it and hides the break.',

    { h: 'The pipeline step by step' },
    {
      list: [
        'Hedge ratio: β = cov(ln A, ln B) ÷ var(ln B), α = mean(ln A) − β mean(ln B), on formation data.',
        'Spread for all days: s = ln A − α − β ln B.',
        'AR(1) on the formation spread: φ, c and σ_ε, then μ = c ÷ (1 − φ), σ_eq = σ_ε ÷ √(1 − φ²), half-life = −ln 2 ÷ ln φ.',
        'z-score for all days with the formation μ and σ_eq.',
        'Positions from z with entry, exit and stop, and a pause after a stop.',
        'Daily P&L per $1 of A, net of costs, summed separately on each window.',
      ],
    },

    { h: 'P&L per dollar of A' },
    'Working per $1 of A keeps the arithmetic small. The spread move from day t to t + 1 is `Δln A − β Δln B`. A position of +1 (long the spread) earns that move; −1 earns minus it. Each unit change of position trades $1 of A and $β of B, so it costs `c × (1 + β)` where c is the cost per dollar traded. Opening and later closing a trade are two changes, four fills.',
    {
      code: `import numpy as np

la = np.array([0.00, 0.02, 0.05, 0.03, 0.01])
lb = np.array([0.00, 0.01, 0.01, 0.01, 0.01])
pos = np.array([0, 0, -1, -1, 0])
beta, c = 1.0, 0.0005
move = np.diff(la) - beta * np.diff(lb)
net = pos[:-1] * move - c * (1 + beta) * np.abs(np.diff(pos))
print(move.round(3).tolist(), round(float(net.sum()), 4))`,
      out: `[0.01, 0.03, -0.02, -0.02] 0.038`,
    },
    'The short opened at the close of day 2 earns the two falls of 0.02, 0.04 in all, and two changes of position cost 2 × 0.001, leaving 0.038 per dollar of A. The rises on days 1 and 2 are not earned: no position was held over them.',

    { h: 'Reading the result' },
    'Report the in-sample and out-of-sample net P&L side by side, with the number of trades in each. On data built to be cointegrated both are usually positive, and the in-sample one tends to be better, because it was used to choose β, μ and σ_eq. On real pairs the gap is usually wider, and an out-of-sample loss is a common, informative result. Run the same backtest with costs doubled, with nearby entry and stop levels, and on a broken version of the data. A result that only survives one setting is fitted to noise.',

    { h: 'What the lab leaves out' },
    'Real trading adds borrow fees and recalls, fills at worse prices than the close, whole-share rounding, dividends on both legs, and the cost of searching many pairs to find this one. Each of these lowers the number. Treat the lab\'s output as an upper bound on what the rule could earn, and paper trade before trusting it with money.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Refitting β or μ on the trading window.',
        'Paying positions on the move that created them.',
        'Charging costs on one leg only.',
        'Reporting only the in-sample number.',
      ],
    },
  ],
}
