import type { Block } from '../../types'

/** The full theory for each lesson of the time series module, keyed by lesson id. */
export const qseriesTheory: Record<string, Block[]> = {
  'qseries-acf': [
    { h: 'A series that remembers' },
    'A **time series** is a list of numbers in time order: daily returns, a spread between two prices, daily volume. The question this lesson asks is whether the list remembers its past: whether today’s value tells you anything about tomorrow’s. The quant module measured that at one lag, the correlation between each day and the day before. Here you look at many lags at once and learn to read the picture without fooling yourself.',
    'Everything below is measured on made-up data generated with fixed seeds. Real daily index returns show much weaker patterns than the examples.',

    { h: 'The autocorrelation function' },
    { sub: 'The formula' },
    'Write the series as x[0], x[1], …, x[n−1] and its mean as m. The **autocorrelation at lag k**, written ρk (rho k), compares each value with the value k steps earlier: `ρk = Σ (x[t] − m)(x[t−k] − m) ÷ Σ (x[t] − m)²`. The top sum runs over every t from k to n − 1; the bottom sum runs over every point. ρk lies between −1 and 1. Positive means a value above the mean tends to be followed, k steps later, by another above the mean; negative means it tends to be followed by one below.',
    'This textbook version uses one mean and one denominator for every lag. Correlating the two shifted slices with `np.corrcoef` uses each slice’s own mean and spread, and gives a slightly different number. Libraries use the textbook version.',
    {
      code: `import numpy as np

x = np.array([2.0, 4.0, 3.0, 6.0, 5.0, 4.0, 6.0, 2.0])
d = x - x.mean()
den = (d ** 2).sum()
print([round(float((d[k:] * d[:-k]).sum() / den), 3) for k in (1, 2, 3)])`,
      out: `[-0.222, 0.167, -0.111]`,
    },
    '`d[k:]` is every value from position k on, and `d[:-k]` is every value up to k from the end, so the two line up each value with the one k steps before it.',
    { sub: 'The correlogram' },
    'A bar chart of ρ1, ρ2, ρ3 and so on is a **correlogram**. Its shape is the first thing to read about any series.',

    { h: 'The noise band' },
    '**White noise** is a series of independent draws with a fixed mean and spread: nothing to remember. Even then, sample autocorrelations are not exactly zero. Each has a standard error of about `1 ÷ √n`, so 95% of them fall within `±1.96 ÷ √n`, the dashed lines drawn on every correlogram. With 400 points the band is about ±0.098.',
    'The band is for one lag. Draw 20 bars and about one of them will cross it by chance alone. A single crossing at an odd lag, with no reason behind it, is what noise looks like.',

    { h: 'Partial autocorrelation' },
    'If today depends on yesterday, and yesterday on the day before, then today and two days ago are also correlated, though only through yesterday. The **partial autocorrelation** (PACF) at lag k removes that chain: it is the coefficient on `x[t−k]` when you regress `x[t]` on all of `x[t−1]` to `x[t−k]` together. In statsmodels the two functions are `acf` and `pacf` in `statsmodels.tsa.stattools`.',
    'Read together they suggest a model, covered in the next lesson. An **autoregression** of order p, AR(p), has a PACF that stops after lag p while its ACF fades away. A **moving average** model of order q, MA(q), has an ACF that stops after lag q while its PACF fades.',

    { h: 'Testing many lags at once' },
    { sub: 'The Ljung-Box statistic' },
    'To ask "is there any autocorrelation in the first m lags?" as one question, add up the squared autocorrelations. Box and Pierce (1970) used `n Σ ρk²`; Ljung and Box (1978) improved it for small samples: `Q = n(n + 2) Σ ρk² ÷ (n − k)` for k = 1 to m. Squaring stops positive and negative bars cancelling.',
    { sub: 'Comparing with chi-square' },
    'For white noise, Q follows a **chi-square distribution** with m degrees of freedom, the distribution of a sum of m squared standard normal numbers. Its 5% critical values are 7.81 for m = 3, 11.07 for m = 5, 18.31 for m = 10 and 31.41 for m = 20. Above the value, some autocorrelation is likely present. In statsmodels the function is `acorr_ljungbox`.',
    {
      code: `n = 250
rho = [0.10, -0.06, 0.04, 0.02, -0.05]
q = n * (n + 2) * sum(r ** 2 / (n - k) for k, r in enumerate(rho, start=1))
print(round(q, 2))`,
      out: `4.6`,
    },
    'Five lags give Q ≈ 4.6, far below 11.07: no evidence of memory, even though ρ1 = 0.10 looked largish on its own.',

    { h: 'Where this shows up in markets' },
    'Daily index returns usually give a flat correlogram. Returns computed from trade prices at short horizons often show a negative lag 1, because trades print alternately at the bid and the ask (the **bid-ask bounce**), which no one can trade on. Squared returns tell a different story: their correlogram is positive for weeks. Returns are close to unpredictable in sign but partly predictable in size, which is where the rest of this module goes.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Treating the one bar out of twenty that crosses the band as a discovery.',
        'Choosing the lags to test after seeing the correlogram.',
        'Reading a negative lag 1 in trade-price returns as a reversal you can trade.',
        'Checking only returns and never squared returns.',
      ],
    },
  ],

  'qseries-arma': [
    { h: 'Models that describe memory' },
    'The correlogram shows that a series remembers. A model says how. The two building blocks are the autoregression, where today depends on yesterday’s value, and the moving average, where today depends on yesterday’s surprise. Both are small, explicit and easy to fit, and both give forecasts you can check.',

    { h: 'The AR(1) model' },
    { sub: 'The equation' },
    'An **AR(1)**, autoregression of order one, says `x[t] = c + φ × x[t−1] + ε[t]`. c is a constant, φ (phi) a number usually between −1 and 1, and ε (epsilon) a **shock**: white noise with mean zero and standard deviation σ. Today is a share φ of yesterday, plus a constant, plus something new.',
    { sub: 'Mean, spread and memory' },
    'If |φ| < 1 the series has a fixed **mean** `μ = c ÷ (1 − φ)`, the level at which the equation gives back the same value. Its variance is `σ² ÷ (1 − φ²)`, larger than the shock variance because shocks pile up. Its ACF at lag k is `φ^k`, fading geometrically, and its PACF is φ at lag 1 and zero after.',
    'Take c = 1 and φ = 0.75. The mean is 1 ÷ 0.25 = 4. With σ = 1 the variance is 1 ÷ (1 − 0.5625) ≈ 2.29, a standard deviation of about 1.51.',

    { h: 'Forecasting with an AR(1)' },
    'Set the future shocks to their mean of zero and iterate. The gap between the series and its mean shrinks by φ each step, so the forecast h steps ahead is `μ + φ^h × (x[t] − μ)`. The **half-life**, the number of steps for half the gap to close, is `ln 0.5 ÷ ln φ`.',
    {
      code: `c, phi = 1.0, 0.75
mu = c / (1 - phi)
x = 8.0
path = []
for h in range(1, 5):
    x = c + phi * x
    path.append(round(x, 3))
print(mu, path)`,
      out: `4.0 [7.0, 6.25, 5.688, 5.266]`,
    },
    'The gap starts at 4 and becomes 3, 2.25, 1.69, 1.27: each is 0.75 of the one before. The half-life is ln 0.5 ÷ ln 0.75 ≈ 2.4 steps.',

    { h: 'The MA(1) model' },
    'An **MA(1)**, moving average of order one, says `x[t] = μ + ε[t] + θ × ε[t−1]`. The name has nothing to do with a moving average of prices on a chart. Today is a fresh shock plus part θ (theta) of yesterday’s shock. The series remembers one surprise for one step, so its lag-1 autocorrelation is `θ ÷ (1 + θ²)` and every later lag is zero. That ratio never exceeds 0.5 in size.',
    'Trade-price returns are a natural example. A trade at the ask followed by one at the bid creates a negative return that tends to reverse on the next trade, an MA(1) with negative θ caused by the spread, not by any change in value.',
    'An **ARMA(p, q)** combines p autoregressive lags and q moving average lags. **ARIMA** adds a differencing step for series that wander, the subject of the next lesson.',

    { h: 'Fitting an AR(1) by least squares' },
    { sub: 'A regression on the previous value' },
    'Because the AR(1) equation is a straight line in yesterday’s value, ordinary least squares fits it: regress `x[1:]` (each value) on `x[:-1]` (the value before) with an intercept. The slope is φ̂ (the hat means "estimated") and the intercept ĉ. The slope is the covariance of the pairs divided by the variance of the earlier values.',
    {
      code: `import numpy as np

rng = np.random.default_rng(3)
x = np.zeros(3000)
for t in range(1, 3000):
    x[t] = 2.0 + 0.3 * x[t - 1] + rng.normal()
phi, c = np.polyfit(x[:-1], x[1:], 1)
print(round(phi, 2), round(c / (1 - phi), 2))`,
      out: `0.31 2.89`,
    },
    'The fit recovers φ close to 0.3 and a mean close to the true 2 ÷ 0.7 ≈ 2.86. `np.polyfit` with degree 1 returns the slope first, then the intercept.',
    { sub: 'What libraries add' },
    'MA terms cannot be fitted by a regression because the shocks are never observed. Libraries use **maximum likelihood**, choosing the parameters that make the data most probable: `ARIMA` in `statsmodels.tsa.arima.model`, or `AutoReg` for pure autoregressions. To choose orders they compare an **information criterion** such as AIC, which rewards fit and charges for each extra parameter.',

    { h: 'How much an AR(1) can forecast' },
    'Least squares φ̂ is pulled towards zero in short samples, by roughly `(1 + 3φ) ÷ n`. More important is size: the share of next-step variance an AR(1) explains, its R², is φ². With φ = 0.1 that is 1%. Series with real persistence, such as spreads, volume and volatility, suit AR models well. For tomorrow’s sign of an index return, expect a forecast that barely beats zero and must still pay costs.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Mistaking the intercept c for the mean.',
        'Multiplying by φ × h instead of raising φ to the power h when forecasting.',
        'Reporting an in-sample fit as if it were a forecast.',
        'Forgetting that a small φ means a tiny R², whatever its t statistic.',
      ],
    },
  ],

  'qseries-unitroot': [
    { h: 'When the memory never fades' },
    'In an AR(1), φ sets how fast the past fades. At φ = 1 it never does: `x[t] = c + x[t−1] + ε[t]` is a **random walk**, with drift c. Every shock stays in the level for ever, so the series has no mean to return to and its variance grows without limit. Such a series has a **unit root**, from the algebra of the AR equation. Log prices behave much like this; returns, their changes, do not.',

    { h: 'Stationary and non-stationary' },
    { sub: 'What stationary means' },
    'A series is **stationary** when its mean, variance and autocorrelations stay the same over time. White noise and an AR(1) with |φ| < 1 are stationary. A random walk is not: after h steps its spread is σ√h. With daily shocks of 2%, the level a year (252 days) out has a standard deviation of 2% × √252 ≈ 32%.',
    { sub: 'Differencing' },
    '**Differencing** replaces each value by its change: `Δx[t] = x[t] − x[t−1]` (Δ, delta, means "change in"). For a random walk the changes are the shocks, which are stationary. A series that becomes stationary after one difference is **integrated of order one**, I(1). Returns are the differences of log prices, which is why research works with returns.',
    'Differencing a series that was already stationary does harm. If e is white noise, `e[t] − e[t−1]` is an MA(1) with θ = −1, so it shows a strong negative lag-1 autocorrelation that was never in the data. Check before you difference.',

    { h: 'The Dickey-Fuller test' },
    { sub: 'The regression' },
    'Subtract x[t−1] from both sides of the AR(1): `Δx[t] = c + (φ − 1) × x[t−1] + ε[t]`. Call γ (gamma) = φ − 1. A unit root means γ = 0; a stationary series that pulls back to its mean has γ < 0. Dickey and Fuller (1979) proposed regressing the change on the previous level and looking at the t statistic of γ̂, the estimate divided by its standard error.',
    { sub: 'The critical values' },
    'If the series has a unit root, that t statistic does not follow the normal curve. It leans to the left, so negative values far from zero arise by chance more often. The right yardsticks, for a regression with a constant and a long sample, are about −3.43 at 1%, −2.86 at 5% and −2.57 at 10%. A t of −2.2 would pass an ordinary test at 5% but does not reject a unit root here.',
    {
      code: `import numpy as np

rng = np.random.default_rng(5)
x = np.zeros(1000)
for t in range(1, 1000):
    x[t] = 0.95 * x[t - 1] + rng.normal()
dx, z = np.diff(x), x[:-1]
X = np.column_stack([np.ones(len(z)), z])
coef, *_ = np.linalg.lstsq(X, dx, rcond=None)
res = dx - X @ coef
se = np.sqrt(res @ res / (len(dx) - 2) * np.linalg.inv(X.T @ X)[1, 1])
print(round(coef[1], 3), round(coef[1] / se, 2))`,
      out: `-0.04 -4.5`,
    },
    'With φ = 0.95 the true γ is −0.05, the estimate is close to it, and the t statistic is beyond −3.43: the unit root is rejected. The **augmented** Dickey-Fuller test adds lagged changes to the regression to absorb other autocorrelation; in statsmodels it is `adfuller`, which also supplies the critical values (MacKinnon’s).',
    { sub: 'The weakness of the test' },
    'Near φ = 1 the test has low **power**, the chance of rejecting a false null. A series with φ = 0.99 reverts, but on a year of data γ = −0.01 is smaller than its standard error, and the test usually fails to reject. "Not rejected" means "not shown", never "proved to be a random walk".',

    { h: 'Spurious regression' },
    'Regress one random walk on another that is completely independent of it. The ordinary t statistic for the slope assumes stationary residuals. With two walks, the residual is itself a walk, the standard error is far too small, and |t| above 2 turns up most of the time with a sizeable R² (the share of variance the regression explains). Granger and Newbold demonstrated this in 1974 and called it **spurious regression**.',
    'Two cures. Regress changes on changes, which are stationary and give honest t statistics. Or test whether the residual of the levels regression is stationary; if it is, the two series are **cointegrated**, tied together in the long run, which the statarb module treats in detail with its own critical values.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Trusting a t statistic or R² from a regression of one price level on another.',
        'Comparing a Dickey-Fuller t with −1.96.',
        'Reading "cannot reject a unit root" as proof of one.',
        'Differencing everything by habit, including series that were already stationary.',
      ],
    },
  ],

  'qseries-ewma': [
    { h: 'Volatility comes in clusters' },
    'Look at any long chart of daily returns and you see calm stretches and wild stretches. Big moves, up or down, tend to follow big moves. This is **volatility clustering**. It means that while tomorrow’s direction is close to unpredictable, tomorrow’s typical size is not. Risk limits, option prices and position sizes all depend on a guess of that size, so forecasting it is worth doing well.',

    { h: 'Seeing it in the data' },
    'The correlogram of returns r is usually flat. The correlogram of squared returns r² or absolute returns |r| is positive at lag 1 and fades slowly over weeks. A large r² today raises the expected r² tomorrow. Since the daily mean return is tiny next to a typical daily move, r² is a rough measure of each day’s variance, and its memory is the memory of volatility.',

    { h: 'The trouble with a fixed window' },
    { sub: 'Equal weights' },
    'The volatility module measured realised volatility as the standard deviation of the last w returns. That gives each of the last w days the same weight and every earlier day none. In variance terms, with mean taken as zero, it is the average of the last w values of r².',
    { sub: 'The ghost effect' },
    'Suppose one 6% day hits a 20-day window. For 20 days the estimate is inflated, and on the 21st it drops at once when that day leaves the window, though nothing happened in the market. This step, caused by the calendar and not by the market, is the **ghost effect**.',

    { h: 'The exponentially weighted moving average' },
    { sub: 'The recursion' },
    'The **EWMA** of variance replaces the window with weights that shrink smoothly: `σ²[t] = λ × σ²[t−1] + (1 − λ) × r²[t−1]`. λ (lambda), the **decay factor**, is between 0 and 1. Each day keeps a share λ of the old estimate and adds a share 1 − λ of yesterday’s squared return. σ²[t] uses returns up to t − 1 only, so it is a genuine forecast of day t.',
    {
      code: `lam = 0.9
v = 0.0001          # yesterday's variance forecast: 1% a day
for r in [0.025, -0.004, 0.003]:
    v = lam * v + (1 - lam) * r * r
    print(round(v ** 0.5, 4))`,
      out: `0.0123
0.0118
0.0112`,
    },
    'A 2.5% day lifts the volatility forecast from 1% to 1.23%. Two quiet days then bring it down a little each day. Work in variances and take square roots only for display.',
    { sub: 'The weights' },
    'Unrolling the recursion, the squared return from k + 1 days before day t gets weight `(1 − λ) λ^k`. With λ = 0.9: 0.1, 0.09, 0.081 and so on. The **half-life**, after which a day’s weight has halved, is `ln 0.5 ÷ ln λ` days, and `1 ÷ (1 − λ)` is a rough effective window. λ = 0.9 has a half-life of about 6.6 days and an effective window of 10.',

    { h: 'The RiskMetrics convention' },
    'J.P. Morgan published RiskMetrics in 1994, and its Technical Document (4th edition, 1996) set λ = 0.94 for daily volatility and λ = 0.97 for monthly forecasts, values chosen to work reasonably across many markets at once. They became an industry default. They are not the best λ for any given series, and choosing λ yourself is another parameter to fit on early data only.',
    'EWMA has no long-run level. Its forecast for every future day equals today’s estimate, so a month-ahead forecast is as high after a shock as a day-ahead one. The next lesson fixes that.',

    { h: 'Using a volatility forecast' },
    'Volatility targeting, from the quant module, scales a position to `target ÷ forecast`, with the forecast annualised by √252. With a 12% target and a 1.2% daily forecast (19% a year), the weight is about 0.63. The forecast must use only past returns. Using the same day’s return makes the strategy shrink before each big day, which no real system could do.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Updating the forecast for day t with day t’s own return.',
        'Averaging volatilities instead of variances.',
        'Tuning λ on the whole backtest.',
        'Sizing up without a cap when the forecast is very low, right before a shock.',
      ],
    },
  ],

  'qseries-garch': [
    { h: 'From EWMA to GARCH' },
    'EWMA reacts to shocks and forgets them, but it has no sense of a normal level. Robert Engle’s **ARCH** model (1982) made variance depend on past squared returns, and Tim Bollerslev’s **GARCH** (1986, generalised ARCH) added dependence on past variance. Engle’s 2003 Nobel prize in economics cited the ARCH work. GARCH(1,1), with one lag of each, is the standard volatility model.',

    { h: 'The GARCH(1,1) recursion' },
    'The forecast of today’s variance is `σ²[t] = ω + α × r²[t−1] + β × σ²[t−1]`. Three parameters:',
    {
      list: [
        'ω (omega) > 0, a small constant that anchors the level.',
        'α (alpha) ≥ 0, the **reaction**: how much yesterday’s squared return moves the forecast.',
        'β (beta) ≥ 0, the **memory**: how much of yesterday’s forecast is kept.',
      ],
    },
    'EWMA is the special case ω = 0, α = 1 − λ, β = λ. Fits on daily stock index returns often land near α between 0.05 and 0.1 and β between 0.85 and 0.93, though values vary by market and sample.',

    { h: 'Persistence and the long-run level' },
    { sub: 'The long-run variance' },
    '**Persistence** is α + β. When it is below 1, the forecast has a resting point: the **long-run variance** `VL = ω ÷ (1 − α − β)`. With ω = 0.000004, α = 0.1 and β = 0.85, VL = 0.000004 ÷ 0.05 = 0.00008, a daily volatility of about 0.89% and an annual one of about 14.2%. ω looks negligible, but it fixes this level.',
    { sub: 'Half-life of a shock' },
    'Shocks fade at rate α + β per day, so their half-life is `ln 0.5 ÷ ln(α + β)`. Persistence of 0.95 gives about 13.5 days; 0.99 gives about 69. When α + β reaches or passes 1 with ω > 0, there is no long-run level and forecasts grow without limit. A fit like that usually means the sample mixes two different periods.',

    { h: 'Forecasting the term structure' },
    'Taking expectations of the recursion gives the forecast h days ahead: `E[σ²[t+h]] = VL + (α + β)^(h−1) × (σ²[t+1] − VL)`. The gap between tomorrow’s forecast and the long-run level shrinks by α + β each day.',
    {
      code: `vl, v1, p = 0.00008, 0.0003, 0.95
for h in (1, 5, 21, 63):
    v = vl + p ** (h - 1) * (v1 - vl)
    print(h, round((v * 252) ** 0.5, 3))`,
      out: `1 0.275
5 0.256
21 0.2
63 0.15`,
    },
    'Tomorrow is forecast at 27.5% annualised; three months out the forecast has come most of the way back towards the long-run 14.2%. To get a volatility for a whole horizon, average the daily variance forecasts over it and take the root. That **term structure** is what is compared with the implied volatility of an option of the same length. Implied volatility usually sits above such forecasts, a gap called the **variance risk premium**, so a gap alone is not a mispricing.',

    { h: 'Fitting by maximum likelihood' },
    { sub: 'The likelihood' },
    'Assume each return is its volatility times a standard normal draw: `r[t] = σ[t] × z[t]`. The **negative log-likelihood** of the data is `0.5 × Σ (ln 2π + ln σ²[t] + r²[t] ÷ σ²[t])`. A model that forecasts high variance pays through ln σ²; one that forecasts low variance on a day with a big move pays through r² ÷ σ². The fit chooses ω, α and β to make the total as small as possible, subject to ω > 0, α, β ≥ 0 and α + β < 1.',
    { sub: 'Variance targeting' },
    'A common shortcut fixes the long-run level at the sample variance: ω = sample variance × (1 − α − β). Only α and β remain, and a grid search over them is enough to see the method work. In practice the `arch` package by Kevin Sheppard (version 8 at the time of writing, 2026) fits it with `arch_model(r, vol="GARCH", p=1, q=1).fit()`; its documentation recommends returns in percent so the optimiser behaves.',

    { h: 'What GARCH does not capture' },
    'GARCH(1,1) treats a 3% rise and a 3% fall alike. Equity volatility rises more after falls, the **leverage effect**, which GJR-GARCH and EGARCH add. Returns divided by their GARCH volatility still have fat tails, so a Student t distribution often replaces the normal. Parameters fitted in a calm decade differ from those fitted through a crisis. GARCH knows past returns and nothing of the calendar: an earnings date or a central bank meeting is invisible to it. It forecasts the size of moves, not their direction.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Swapping α and β in the recursion.',
        'Accepting a fit with α + β above 1.',
        'Reading a gap between GARCH and implied volatility as a free trade.',
        'Taking square roots before averaging variances over a horizon.',
      ],
    },
  ],

  'qseries-realised': [
    { h: 'Measuring what happened' },
    'Forecasts need a yardstick: what the volatility of a day actually was. The square of the daily return is a poor one. A stock can trade 3% up and 3% down during the day and close unchanged, giving r² = 0 on a turbulent day. Intraday prices and the day’s range carry far more information about the day’s variance.',

    { h: 'Realised variance' },
    { sub: 'Summing intraday squares' },
    'Split the day into intervals and take the log return over each, `r[i] = ln(p[i] ÷ p[i−1])`. **Realised variance** (RV) is the sum of their squares, `RV = Σ r[i]²`, and **realised volatility** its square root. If prices moved like a random walk with no noise, RV would get closer to the true variance of the day as the intervals shrank.',
    {
      code: `import numpy as np

p = np.array([50.0, 50.2, 50.1, 50.4, 50.3, 50.5])
r = np.diff(np.log(p))
print(round(float(np.sqrt((r ** 2).sum())), 4))`,
      out: `0.0087`,
    },
    'Five intervals give a realised volatility of 0.87% for the day, while the close-to-close move was only 1%. Annualise a daily figure with √252, after averaging variances across days.',
    { sub: 'Sampling with a step' },
    'To sample every k-th price from a list of second-by-second prices, `p[::k]` keeps positions 0, k, 2k and so on. The same day can then be measured at any interval.',

    { h: 'Range estimators' },
    'Many data sets give only the open O, high H, low L and close C of each bar. The **range** ln(H ÷ L) says a lot about variance, because a wide range needs a lot of movement.',
    {
      list: [
        '**Parkinson** (1980): `σ² = (ln(H ÷ L))² ÷ (4 ln 2)`. The constant 4 ln 2 ≈ 2.77 is the expected squared range of a random walk with unit variance.',
        '**Garman-Klass** (1980): `σ² = 0.5 × (ln(H ÷ L))² − (2 ln 2 − 1) × (ln(C ÷ O))²`. Adding the open-to-close move removes some of the range that came from drift in one direction.',
      ],
    },
    'For a day with H = 51, L = 50 the Parkinson volatility is ln(1.02) ÷ √2.77 ≈ 1.19%. Both estimators give a variance per bar, assume no drift and continuous trading, and are much less noisy across many days than close-to-close returns. Because recorded highs and lows miss moves between trades, they tend to understate slightly. Rogers-Satchell and Yang-Zhang are later variants that handle drift and overnight gaps.',

    { h: 'Microstructure noise' },
    { sub: 'Why more data can be worse' },
    'Observed prices are not the efficient price. A trade prints at the bid or the ask, so recorded prices bounce around the true value by about half the spread. Call that error ω per price. Each return then contains two errors, and if they are independent each squared return gains about 2ω² on average. Over n returns RV gains about `2 n ω²`, a bias that grows the finer you sample. With 4,680 five-second returns and ω = 0.5 basis points, the bias is 2 × 4,680 × 0.00005² ≈ 0.0000234, a quarter of a variance of 0.0001.',
    {
      code: `import numpy as np

rng = np.random.default_rng(1)
true = np.cumsum(rng.normal(0, 0.01 / np.sqrt(23400), 23401))
seen = true + rng.normal(0, 0.0001, 23401)
for k in (1, 60, 300):
    r = np.diff(seen[::k])
    print(k, round(float(np.sqrt((r ** 2).sum())), 4))`,
      out: `1 0.0237
60 0.0103
300 0.0104`,
    },
    'The true daily volatility is 1%. Sampling every second gives more than double; every minute and every five minutes are close to the truth.',
    { sub: 'The signature plot' },
    'Plotting RV against the sampling interval gives the **volatility signature plot**, introduced by Andersen, Bollerslev, Diebold and Labys around 2000. It rises at the shortest intervals where noise dominates and flattens where it does not. Five-minute sampling is the usual compromise: Liu, Patton and Sheppard (2015) compared hundreds of estimators across many assets and found it hard to beat significantly. Realised kernels, pre-averaging and subsampling are designed to use finer data without the bias.',

    { h: 'The overnight gap and cleaning' },
    'Intraday measures cover only the hours you sample. US stocks move between the close and the next open on earnings, news and foreign markets, and that move is part of the daily variance. Add the squared close-to-open log return to intraday RV, or scale RV up, and say which you did. Half days have fewer intervals, opening and closing auctions behave differently, and one bad tick adds a huge squared return: apply the cleaning from the qdata module first. Mid-quotes, the average of bid and ask, remove most of the bounce.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Computing RV from every trade and reporting the inflated number.',
        'Comparing intraday RV with close-to-close volatility without adding the overnight move.',
        'Using the wrong constant in the Parkinson formula.',
        'Averaging daily volatilities instead of daily variances before annualising.',
      ],
    },
  ],

  'qseries-regimes': [
    { h: 'When the rules change' },
    'Every model so far had one set of parameters for all time. Markets do not oblige: volatility has calm years and violent months, correlations jump in a crisis, a relationship that held for a decade can stop. This lesson covers three ways to see change: rolling statistics, structural breaks and regime models. Each is easy to misuse in a backtest.',

    { h: 'Rolling statistics' },
    { sub: 'Only the past' },
    'A **rolling statistic** recomputes a mean, a volatility or a correlation over the last w observations, each day. For day t the window is `x[t − w + 1 : t + 1]` in Python slicing, the w values ending at t. A window that starts at t and runs forward uses the future and makes any filter built on it look prescient.',
    {
      code: `import numpy as np

x = np.array([4.0, 4.0, 4.0, 4.0, 8.0, 8.0, 8.0, 8.0])
w = 4
print([float(x[t - w + 1:t + 1].mean()) for t in range(w - 1, len(x))])`,
      out: `[4.0, 5.0, 6.0, 7.0, 8.0]`,
    },
    'The level jumps from 4 to 8, and the rolling mean takes the whole window to follow: it lags a change by up to w steps.',
    { sub: 'Noise in a short window' },
    'Short windows react fast and are noisy. The standard error of a volatility estimated from n returns is about `σ ÷ √(2n)`. With a 60-day window and true volatility of 30%, that is 30% ÷ √120 ≈ 2.7 points. Moves smaller than a couple of standard errors may be nothing at all.',

    { h: 'Structural breaks' },
    'A **structural break** is a date at which the parameters change. To find one, try every possible split, fit a separate mean on each side, and keep the split with the smallest total squared error. That search always finds something, even in pure noise, and the best split looks far more significant than a single test would suggest, because it was chosen as the best of many. Andrews’ sup-F test and the Bai-Perron method use critical values that allow for the search. A test of a date fixed in advance for a reason, such as a rule change, is a different and fairer question.',

    { h: 'A two-state market' },
    { sub: 'Staying probabilities' },
    'A **regime model** says the market is in one of a few states, here calm and stressed, each with its own mean and volatility. Each day it stays in its state with a fixed probability: p for calm, q for stressed. These form a **Markov chain**, where tomorrow’s state depends only on today’s.',
    { sub: 'Durations and long-run shares' },
    'A spell ends on any day with probability 1 − p, so its average length is `1 ÷ (1 − p)` days. With p = 0.95, calm spells last 20 days on average. Over a long time, the share of stressed days is `(1 − p) ÷ ((1 − p) + (1 − q))`: with p = 0.95 and q = 0.8 that is 0.05 ÷ 0.25 = 20%.',
    { sub: 'Mixtures have fat tails' },
    'If each state has normal returns but with different volatilities, the mix of the two is not normal. The overall variance is the weighted average of the two variances, but the shape has a tall centre from the calm days and long tails from the stressed ones.',
    {
      code: `import numpy as np

rng = np.random.default_rng(4)
stressed = rng.random(100000) < 0.2
r = np.where(stressed, rng.normal(0, 0.02, 100000), rng.normal(0, 0.007, 100000))
d = r - r.mean()
print(round(float(r.std()), 4), round(float((d ** 4).mean() / (d ** 2).mean() ** 2 - 3), 1))`,
      out: `0.0109 4.2`,
    },
    'An excess kurtosis above 4 from two normal regimes: one possible explanation of the fat tails the quant module measured.',

    { h: 'Markov switching and hindsight' },
    'James Hamilton’s **Markov-switching** model (1989) estimates both regimes and the staying probabilities from the data. The state is never observed, so the model gives a probability for each day. **Filtered** probabilities use data up to that day and could have been known at the time. **Smoothed** probabilities use the whole sample, future included, and are cleaner and earlier. A backtest that switches on smoothed probabilities, or on regimes drawn by eye on a chart, has lookahead. statsmodels offers `MarkovRegression`; the `hmmlearn` package fits hidden Markov models.',
    'A cruder causal rule labels a day stressed when a past-only volatility forecast, such as EWMA, is above a threshold. It is always late: the first stressed day cannot be flagged, and often the worst days come first.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Rolling windows that include the current or future days.',
        'Reporting the best of all possible break dates with an ordinary t statistic.',
        'Backtesting on smoothed regime probabilities.',
        'Adding a regime filter, a threshold and a window length, all tuned on the same data.',
      ],
    },
  ],

  'qseries-lab': [
    { h: 'What the lab builds' },
    'The lab is a small, complete volatility forecasting study. It generates returns with known volatility clustering, makes four competing forecasts of each day’s variance from earlier data only, fits the free parameters on the first part of the sample, and scores all four once on the rest. Every piece comes from earlier lessons; the lab is about putting them together without leaking the future.',

    { h: 'Data with a known truth' },
    'Real data never tell you the true variance of a day. Simulated data can. Generating returns from a GARCH(1,1) means drawing a standard normal z for each day, setting the return to `√v × z` where v is that day’s variance, and then updating v with the GARCH recursion. The variance of each day is fixed before its shock is drawn, which is exactly the information a forecaster has. Fixing the seed of the random generator makes every run identical, so a result can be checked and repeated. The simulation leaves out fat tails, breaks and asymmetry, so results on it are easier than on real data.',

    { h: 'The four forecasts' },
    { sub: 'Constant' },
    'The simplest forecast is the same number every day: the average of r² over the in-sample period. It is the baseline. A model that cannot beat it has learned nothing useful.',
    { sub: 'AR(1) on squared returns' },
    'Fitting `y[t] = c + φ × y[t−1]` to y = r² by least squares gives a forecast that reacts to yesterday’s squared return only. It is a crude version of Engle’s ARCH(1). A fitted line can dip below zero, so the forecast is floored at a small positive number: a variance can never be negative.',
    { sub: 'EWMA and GARCH' },
    'EWMA with the RiskMetrics λ = 0.94 needs no fitting. GARCH uses **variance targeting**: ω is set to target × (1 − α − β), so the long-run level equals the in-sample variance, and only α and β are chosen by maximum likelihood over a grid. The constant ln 2π in the likelihood is the same for every pair of parameters, so it can be dropped when comparing them.',

    { h: 'Keeping the future out' },
    'Three places leak the future in a study like this. A forecast for day t that uses r[t]. A parameter fitted on the whole sample. And, less obviously, a variance target or a constant forecast computed from all the data, which tells every model the average volatility of the very period it will be scored on. The split must come first, and everything that is estimated must be estimated from the in-sample part.',

    { h: 'Scoring a variance forecast' },
    { sub: 'Why r² is a noisy target' },
    'The true variance is unknown, so forecasts are scored against r², which equals the variance only on average. Some loss functions rank forecasts wrongly when the target is this noisy. Patton (2011) showed that the mean squared error and **QLIKE** do not: on average they prefer the forecast closest to the true variance.',
    { sub: 'QLIKE' },
    'With x = r² ÷ f for a forecast f, QLIKE is the average of `x − ln x − 1`. It is zero when x = 1 and positive otherwise. It punishes a forecast that is too low more than one too high by the same factor, which suits risk work, where underestimating risk is the costly mistake. Squared returns of exactly zero would make ln x undefined, so they are floored at a tiny value.',
    {
      code: `import numpy as np

r = np.array([0.012, -0.008, 0.02])
for f in (0.0002, 0.0001, 0.0004):
    x = r ** 2 / f
    print(f, round(float(np.mean(x - np.log(x) - 1)), 3))`,
      out: `0.0002 0.272
0.0001 0.592
0.0004 0.458`,
    },
    'The average r² of these three days is about 0.0002, and that forecast scores best. Forecasting half of it costs more than forecasting double it.',

    { h: 'Reading the result' },
    'On GARCH data, GARCH and EWMA should beat the constant, which the tests check. On returns with constant volatility, no model should beat the constant by much: that **control** catches pipelines that leak. On real data the margins are smaller and vary by period. A fair report gives all four losses, a test of whether the differences are larger than their own noise (the **Diebold-Mariano** test compares two forecasts through the series of daily loss differences), results in calm and stressed sub-periods, and the model’s known gaps. A better volatility forecast is an input to sizing, risk limits or option pricing. It is not, by itself, a way to make money.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Computing the variance target on the full sample.',
        'Scoring forecasts in-sample and calling it a result.',
        'Leaving out the constant baseline.',
        'Re-running the holdout after each tweak until it looks good.',
      ],
    },
  ],
}
