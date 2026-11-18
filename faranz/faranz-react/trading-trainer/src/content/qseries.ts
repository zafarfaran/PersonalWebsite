import type { Module } from '../types'

export const qseries: Module = {
  id: 'qseries',
  title: 'Time series and volatility models',
  summary:
    'How returns depend on their own past: the correlogram, AR and MA models, unit roots and spurious regressions, volatility clustering with EWMA and GARCH, realised and range-based volatility, and regimes, all built in NumPy on made-up data.',
  lessons: [
    {
      id: 'qseries-acf',
      title: 'Autocorrelation and the correlogram',
      summary: 'The autocorrelation function across many lags, the partial autocorrelation, the noise band, and the Ljung-Box test that looks at many lags at once.',
      widget: 'qseries-correlogram',
      text: [
        'The quant module measured the autocorrelation at one lag. Time series work looks at all lags together. The sample **autocorrelation function** (ACF) at lag k is `ρk = Σ (x[t] − m)(x[t−k] − m) ÷ Σ (x[t] − m)²`, with m the mean of the whole series and the bottom sum over every point. It is close to, but not the same as, `np.corrcoef` of two shifted slices. A bar chart of ρ1, ρ2, ρ3 and so on is the **correlogram**.',
        'If the series is **white noise** (independent draws with a fixed mean and variance), each ρk has a standard error of about `1 ÷ √n`. The dashed lines on a correlogram sit at `±1.96 ÷ √n`. Expect about one bar in twenty to cross them by chance, so one crossing at lag 13 out of 20 lags is no finding.',
        'The **partial autocorrelation** (PACF) at lag k is the correlation between `x[t]` and `x[t−k]` after removing what lags 1 to k − 1 already explain. It equals the last coefficient when you regress `x[t]` on `x[t−1], …, x[t−k]`. The two plots together hint at a model: an AR(p) has a PACF that stops after lag p and an ACF that fades; an MA(q) has an ACF that stops after lag q.',
        'Looking at 20 bars and picking the tallest is a multiple test. The **Ljung-Box** statistic tests them together: `Q = n(n + 2) Σ ρk² ÷ (n − k)` for k = 1 to m. For white noise Q follows a chi-square distribution with m degrees of freedom: the 5% critical value is 7.81 for m = 3, 11.07 for m = 5, 18.31 for m = 10 and 31.41 for m = 20. A Q above it says some autocorrelation is there, not which lag or whether it can be traded.',
        'In practice you call `acf`, `pacf` and `acorr_ljungbox` from statsmodels. Daily index returns usually show a flat correlogram. Squared or absolute returns do not: their ACF is positive and fades slowly over weeks. That is volatility clustering, the subject of later lessons, and the reason the same returns can be unpredictable in sign and partly predictable in size.',
      ],
      rules: [
        'ACF: Σ (x[t] − m)(x[t−k] − m) ÷ Σ (x[t] − m)², over the whole series.',
        'Noise band ±1.96/√n. One bar in twenty crosses it by chance.',
        'PACF at lag k: the last coefficient of a regression on k lags.',
        'AR(p): PACF stops after p. MA(q): ACF stops after q.',
        'Ljung-Box Q = n(n + 2) Σ ρk²/(n − k); compare with chi-square on m degrees of freedom.',
        'Check the correlogram of squared returns too: size clusters even when sign does not.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'qseries-acf-1',
          ask: 'A correlogram is drawn from 1,000 daily returns. Where do the 95% noise lines sit, ±1.96/√n? Give the positive edge to 3 decimal places.',
          answer: 0.062,
          tol: 0.001,
          check: '1.96 / math.sqrt(1000)',
          why: '1.96 ÷ 31.6 ≈ 0.062. Four years of daily data cannot tell an autocorrelation of 0.05 from zero, and 0.05 is already large for index returns.',
        },
        {
          kind: 'output',
          id: 'qseries-acf-2',
          ask: 'The textbook ACF at lag 1, worked on a tiny series. What does this print?',
          code: `import numpy as np

x = np.array([1.0, 3.0, 2.0, 4.0, 3.0, 5.0])
d = x - x.mean()
rho1 = (d[1:] * d[:-1]).sum() / (d ** 2).sum()
print(round(rho1, 2))`,
          answer: '-0.1',
          why: "The mean is 3, so the deviations are −2, 0, −1, 1, 0, 2. The lagged products sum to −1 and the squares to 10. `np.corrcoef` on the two slices would give a different number, because it uses each slice's own mean and spread.",
        },
        {
          kind: 'number',
          id: 'qseries-acf-3',
          ask: 'With n = 500 returns you measure ρ1 = 0.08, ρ2 = −0.05 and ρ3 = 0.03. What is the Ljung-Box Q for m = 3 lags? Give two decimals.',
          answer: 4.93,
          tol: 0.02,
          check: '500 * 502 * (0.08 ** 2 / 499 + 0.05 ** 2 / 498 + 0.03 ** 2 / 497)',
          hint: 'Q = n(n + 2) × (ρ1²/(n − 1) + ρ2²/(n − 2) + ρ3²/(n − 3)).',
          why: 'Q ≈ 4.93, below the 5% critical value of 7.81 for 3 degrees of freedom: these three bars together are what white noise often produces. ρ1 = 0.08 is also inside its own band, 1.96/√500 ≈ 0.088.',
        },
        {
          kind: 'choice',
          id: 'qseries-acf-4',
          ask: "You run Ljung-Box with m = 10 on a strategy's daily returns and get Q = 14.2. The 5% critical value for 10 degrees of freedom is 18.31. What do you conclude?",
          options: [
            'There is significant autocorrelation, since Q is well above zero',
            'No evidence of autocorrelation over the first 10 lags at the 5% level',
            'The returns are proven independent',
            'Lag 10 is significant',
          ],
          answer: 1,
          why: 'Q below the critical value means the first ten autocorrelations together look like white noise. It does not prove independence: a test can miss a small effect, and it says nothing about squared returns or lags beyond 10.',
        },
        {
          kind: 'choice',
          id: 'qseries-acf-5',
          ask: 'You plot 20 lags of the ACF of 1,500 daily returns. Only lag 13 crosses the noise band, at 0.055. What is the most sensible reading?',
          options: [
            'A 13-day cycle: trade it',
            'About one bar in twenty crosses by chance, and nothing explains lag 13: treat it as noise',
            'The data must be wrong',
            'Remove lag 13 and test again',
          ],
          answer: 1,
          why: 'With 20 bars at a 5% band you expect one crossing from noise alone. A lone crossing at a lag with no story behind it is the classic false find; the Ljung-Box test on all 20 lags is the fair check.',
        },
        {
          kind: 'number',
          id: 'qseries-acf-6',
          ask: 'A series follows an AR(1) with φ = 0.6, so its theoretical ACF at lag k is φ^k. What is the ACF at lag 3? Give three decimals.',
          answer: 0.216,
          tol: 0.001,
          check: '0.6 ** 3',
          why: '0.6³ = 0.216. The ACF of an AR(1) fades geometrically rather than stopping, while its PACF is 0.6 at lag 1 and zero after: that pairing is how you recognise one.',
        },
        {
          kind: 'choice',
          id: 'qseries-acf-7',
          ask: 'In the figure, choose AR(1), then MA(1), each with a coefficient of 0.6. Which description matches what you see?',
          options: [
            'AR(1): ACF fades over several lags, PACF one bar. MA(1): ACF one bar, PACF fades with alternating signs',
            'Both show one bar in the ACF and nothing else',
            'AR(1): ACF one bar. MA(1): ACF fades',
            'The two look the same: the correlogram cannot tell them apart',
          ],
          answer: 0,
          why: 'An AR(1) carries a shock forward with shrinking weight, so its ACF fades; only lag 1 adds new information, so its PACF stops. An MA(1) remembers one shock for one step, so its ACF stops at lag 1. On real return data the bars are far smaller and noisier than here.',
        },
        {
          kind: 'bug',
          id: 'qseries-acf-8',
          ask: 'This should give the sample ACF at lag k. It returns a value close to 1.0 for every lag.',
          code: `import numpy as np

def acf_at(x, k):
    d = np.asarray(x, dtype=float)
    d = d - d.mean()
    return (d[k:] * d[k:]).sum() / (d ** 2).sum()`,
          line: 6,
          fix: '    return (d[k:] * d[:-k]).sum() / (d ** 2).sum()',
          why: 'Each value must be multiplied by the value k steps earlier: `d[k:]` against `d[:-k]`. Multiplying a slice by itself gives a sum of squares, nearly the whole denominator.',
        },
        {
          kind: 'write',
          id: 'qseries-acf-9',
          numpy: true,
          ask: 'Write `acf(x, nlags)`: return a NumPy array of the sample autocorrelations at lags 1 to `nlags`, using the whole-series mean and the whole-series sum of squares in the denominator.',
          starter: `import numpy as np

def acf(x, nlags):
    x = np.asarray(x, dtype=float)
    pass`,
          solution: `import numpy as np

def acf(x, nlags):
    x = np.asarray(x, dtype=float)
    d = x - x.mean()
    den = (d ** 2).sum()
    return np.array([(d[k:] * d[:-k]).sum() / den for k in range(1, nlags + 1)])`,
          tests: `out = acf([1.0, 3.0, 2.0, 4.0, 3.0, 5.0], 2)
assert out is not None, "the function returns nothing yet"
assert len(out) == 2, f"one value per lag 1..nlags, got {len(out)}"
assert abs(out[0] + 0.1) < 1e-12, f"lag 1 of [1,3,2,4,3,5] is -0.1, got {out[0]}"
assert abs(out[1] - 0.4) < 1e-12, f"lag 2 of [1,3,2,4,3,5] is 0.4, got {out[1]}"
rng = np.random.default_rng(0)
e = rng.normal(size=20000)
a = acf(e, 5)
assert np.all(np.abs(a) < 0.03), f"white noise should give values near 0, got {a.round(3)}"
x = np.zeros(20000)
for t in range(1, 20000):
    x[t] = 0.7 * x[t - 1] + e[t]
assert abs(acf(x, 2)[1] - 0.49) < 0.03, "an AR(1) with phi 0.7 has lag-2 autocorrelation near 0.49"`,
          why: 'One mean and one denominator for every lag, so values at long lags shrink a little towards zero, which keeps the whole function well behaved. This is what `statsmodels.tsa.stattools.acf` returns, after a 1 for lag 0.',
        },
        {
          kind: 'write',
          id: 'qseries-acf-10',
          numpy: true,
          ask: 'Write `ljung_box(x, m)`: the Ljung-Box statistic `n(n + 2) Σ ρk² ÷ (n − k)` for k = 1 to m, with ρk the whole-series sample ACF.',
          starter: `import numpy as np

def ljung_box(x, m):
    x = np.asarray(x, dtype=float)
    n = len(x)
    pass`,
          solution: `import numpy as np

def ljung_box(x, m):
    x = np.asarray(x, dtype=float)
    n = len(x)
    d = x - x.mean()
    den = (d ** 2).sum()
    q = 0.0
    for k in range(1, m + 1):
        rho = (d[k:] * d[:-k]).sum() / den
        q += rho ** 2 / (n - k)
    return n * (n + 2) * q`,
          tests: `out = ljung_box([1.0, 3.0, 2.0, 4.0, 3.0, 5.0], 1)
assert out is not None, "the function returns nothing yet"
assert abs(out - 6 * 8 * 0.01 / 5) < 1e-12, f"n=6, rho1=-0.1: Q = 6*8*0.01/5 = 0.096, got {out}"
rng = np.random.default_rng(4)
e = rng.normal(size=2000)
q = ljung_box(e, 10)
assert q < 18.31, f"this white noise should stay under 18.31 for m = 10, got {q:.2f}"
x = np.zeros(2000)
for t in range(1, 2000):
    x[t] = 0.2 * x[t - 1] + e[t]
assert ljung_box(x, 10) > 40, "an AR(1) with phi 0.2 on 2000 points should give a Q far above 18.31"`,
          why: 'Squaring removes the signs, so positive and negative bars both count against white noise. The n(n + 2)/(n − k) weights correct the plain sum of squares (the Box-Pierce statistic) for small samples.',
        },
        {
          kind: 'design',
          id: 'qseries-acf-11',
          ask: "A colleague shows you the correlogram of a stock's 5-minute returns from trade prices. Lag 1 is −0.12, far outside the band, and they want to trade the reversal. What do you check first?",
          checklist: [
            { point: 'Whether the returns use trade prices that bounce between bid and ask', why: 'Bid-ask bounce alone makes consecutive returns negatively correlated, with no tradable edge.' },
            { point: 'The same correlogram on mid-quote returns', why: 'If the negative lag 1 vanishes on mids, it was the spread.' },
            { point: 'The size of the predicted move against the spread and fees', why: 'A reversal smaller than the half-spread cannot be captured by crossing it.' },
            { point: 'A Ljung-Box test on lags chosen in advance', why: 'Picking the tallest bar after looking is a multiple test.' },
            { point: 'Whether the effect holds out of sample and across days', why: 'One period can be driven by one event or one data error.' },
            { point: 'The correlogram of squared returns', why: 'Size clusters even when sign does not; it tells you whether volatility, not direction, is the thing to model.' },
          ],
          why: 'Short-horizon negative autocorrelation in trade prices is mostly the spread. The correlogram finds structure; it does not say whether anyone can earn it after costs.',
        },
      ],
    },
    {
      id: 'qseries-arma',
      title: 'AR, MA and ARMA models',
      summary: 'What an autoregression and a moving average model say in plain words, their mean, variance and forecasts, and fitting an AR(1) by least squares.',
      text: [
        'An **AR(1)** (autoregression of order 1) says today is a share of yesterday plus a new shock: `x[t] = c + φ × x[t−1] + ε[t]`, with ε white noise of standard deviation σ. If |φ| < 1 it pulls back towards its **mean** `μ = c ÷ (1 − φ)`; its variance is `σ² ÷ (1 − φ²)`; its ACF is φ^k. The h-step forecast is `μ + φ^h × (x[t] − μ)`: the gap to the mean shrinks by φ each step, with a half-life of `ln 0.5 ÷ ln φ` steps.',
        "An **MA(1)** (moving average of order 1, nothing to do with a moving average of prices) says today is a fresh shock plus part of yesterday's shock: `x[t] = μ + ε[t] + θ × ε[t−1]`. Its lag-1 autocorrelation is `θ ÷ (1 + θ²)` and every later one is zero: it remembers one step. Trade-price returns that bounce between bid and ask look like an MA(1) with negative θ. An **ARMA(p, q)** mixes p AR lags and q MA lags; ARIMA adds differencing, the subject of the next lesson.",
        'Fitting an AR(1) is a regression of `x[1:]` on `x[:-1]` with an intercept: the slope is φ̂ and the intercept ĉ. In NumPy, `phi, c = np.polyfit(x[:-1], x[1:], 1)` gives slope then intercept. MA terms cannot be fitted this way, because the shocks are not observed; libraries use maximum likelihood (`ARIMA` in `statsmodels.tsa.arima.model`, or `AutoReg` for pure AR). Orders are usually chosen with an information criterion such as AIC, which charges for every extra parameter.',
        { code: `import numpy as np

x = np.array([0.0, 1.0, 0.4, 0.5, -0.2, 0.1, 0.3, -0.1])
phi, c = np.polyfit(x[:-1], x[1:], 1)   # slope, intercept
forecast = c + phi * x[-1]` },
        "Least squares φ̂ is biased towards zero in short samples, by roughly `(1 + 3φ) ÷ n`. And the share of variance an AR(1) explains is only φ²: with φ = 0.05, which would be large for daily index returns, a forecast explains 0.25% of the next day's variance. AR models earn their keep on series that really are persistent: spreads, volume and, above all, volatility. For the sign of tomorrow's index return, expect almost nothing.",
      ],
      rules: [
        'AR(1): mean c/(1 − φ), variance σ²/(1 − φ²), ACF φ^k.',
        'Forecast h steps: μ + φ^h (x − μ). Half-life ln 0.5 / ln φ.',
        'MA(1): lag-1 ACF θ/(1 + θ²), zero after. It remembers one shock.',
        'Fit an AR(1) by regressing x[1:] on x[:-1] with an intercept.',
        'R² of an AR(1) is φ². Small φ on returns means almost no forecast.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'qseries-arma-1',
          ask: 'A spread follows x[t] = 0.02 + 0.6 × x[t−1] + ε[t]. What is its long-run mean?',
          answer: 0.05,
          tol: 0.0001,
          check: '0.02 / (1 - 0.6)',
          why: 'μ = c ÷ (1 − φ) = 0.02 ÷ 0.4 = 0.05. The intercept is not the mean: at x = 0.05 the model gives 0.02 + 0.03 = 0.05, which is why that is where it settles.',
        },
        {
          kind: 'number',
          id: 'qseries-arma-2',
          ask: 'An AR(1) has mean 0 and φ = 0.8. Today x = 10. What is the forecast three steps ahead? Give two decimals.',
          answer: 5.12,
          tol: 0.005,
          check: '10 * 0.8 ** 3',
          why: 'The gap to the mean shrinks by 0.8 each step: 10 × 0.8³ = 5.12. Multiplying by 0.8 × 3 instead of raising to the power 3 is the usual slip.',
        },
        {
          kind: 'number',
          id: 'qseries-arma-3',
          ask: 'An AR(1) has φ = 0.9 and shocks with standard deviation 1. What is the standard deviation of the series itself? Give two decimals.',
          answer: 2.29,
          tol: 0.006,
          check: 'math.sqrt(1 / (1 - 0.9 ** 2))',
          why: 'Variance σ² ÷ (1 − φ²) = 1 ÷ 0.19 ≈ 5.26, so the standard deviation is about 2.29. Persistence piles shocks on top of each other, so a series can swing far wider than its daily shocks suggest.',
        },
        {
          kind: 'number',
          id: 'qseries-arma-4',
          ask: 'An MA(1) has θ = 0.5. What is its lag-1 autocorrelation? Give one decimal.',
          answer: 0.4,
          tol: 0.001,
          check: '0.5 / (1 + 0.5 ** 2)',
          why: 'θ ÷ (1 + θ²) = 0.5 ÷ 1.25 = 0.4, and every later lag is 0. An MA(1) can never reach a lag-1 autocorrelation above 0.5 in size, whatever θ is.',
        },
        {
          kind: 'number',
          id: 'qseries-arma-5',
          ask: "You fit an AR(1) to daily returns and get φ = 0.05. What share of the next day's variance does the forecast explain, R² = φ²? Give a percentage, for example 25%.",
          answer: 0.0025,
          tol: 0.00005,
          check: '0.05 ** 2',
          why: '0.05² = 0.0025, a quarter of one percent. The other 99.75% is the shock. A forecast this weak can still be real, but it must be traded cheaply and very often to matter.',
        },
        {
          kind: 'output',
          id: 'qseries-arma-6',
          ask: 'An AR(1) made up with φ = 0.5 and a fixed seed, then fitted by least squares. What does this print?',
          code: `import numpy as np

rng = np.random.default_rng(7)
x = np.zeros(2000)
for t in range(1, 2000):
    x[t] = 0.5 * x[t - 1] + rng.normal()
phi, c = np.polyfit(x[:-1], x[1:], 1)
print(round(phi, 1), round(c, 1) + 0.0)`,
          answer: '0.5 0.0',
          why: 'With 2,000 points the fitted slope is close to the true 0.5 and the intercept close to 0. `polyfit` with degree 1 returns the slope first. The `+ 0.0` turns a printed −0.0 into 0.0.',
        },
        {
          kind: 'bug',
          id: 'qseries-arma-7',
          ask: 'This should forecast an AR(1) h steps ahead. For μ = 0, φ = 0.8, x = 10 and h = 3 it returns 24.0 instead of 5.12.',
          code: `def ar1_forecast(mu, phi, x, h):
    gap = x - mu
    return mu + phi * h * gap`,
          line: 3,
          fix: '    return mu + phi ** h * gap',
          why: 'Each step multiplies the gap by φ, so h steps multiply it by φ^h. `phi * h` grows with the horizon, so the forecast runs away instead of returning to the mean.',
        },
        {
          kind: 'write',
          id: 'qseries-arma-8',
          numpy: true,
          ask: 'Write `fit_ar1(x)`: regress `x[1:]` on `x[:-1]` with an intercept by least squares and return `(c, phi)`.',
          starter: `import numpy as np

def fit_ar1(x):
    x = np.asarray(x, dtype=float)
    # return (c, phi)
    pass`,
          solution: `import numpy as np

def fit_ar1(x):
    x = np.asarray(x, dtype=float)
    y, z = x[1:], x[:-1]
    phi = ((z - z.mean()) * (y - y.mean())).sum() / ((z - z.mean()) ** 2).sum()
    c = y.mean() - phi * z.mean()
    return float(c), float(phi)`,
          tests: `out = fit_ar1([1.0, 2.0, 3.0, 4.0, 5.0])
assert out is not None, "the function returns nothing yet"
c, phi = out
assert abs(phi - 1) < 1e-9 and abs(c - 1) < 1e-9, f"x rising by 1 each step: x[t] = 1 + 1 * x[t-1], got c={c}, phi={phi}"
rng = np.random.default_rng(1)
x = np.zeros(5000)
x[0] = 2.0
for t in range(1, 5000):
    x[t] = 0.6 + 0.7 * x[t - 1] + rng.normal(0, 0.5)
c, phi = fit_ar1(x)
assert abs(phi - 0.7) < 0.03, f"phi should be near 0.7, got {phi:.3f}"
assert abs(c / (1 - phi) - 2.0) < 0.1, f"the implied mean c/(1-phi) should be near 2, got {c / (1 - phi):.3f}"`,
          why: 'The slope is the covariance of each value with the next over the variance of the earlier values; the intercept makes the line pass through the two means. It is the same arithmetic as `np.polyfit(x[:-1], x[1:], 1)`.',
        },
        {
          kind: 'write',
          id: 'qseries-arma-9',
          numpy: true,
          ask: 'Write `ar1_path(c, phi, x_last, h)`: return a NumPy array of the forecasts for 1, 2, …, h steps ahead of an AR(1), each step `c + phi × previous forecast`.',
          starter: `import numpy as np

def ar1_path(c, phi, x_last, h):
    pass`,
          solution: `import numpy as np

def ar1_path(c, phi, x_last, h):
    out = np.empty(h)
    prev = x_last
    for i in range(h):
        prev = c + phi * prev
        out[i] = prev
    return out`,
          tests: `out = ar1_path(0.0, 0.8, 10.0, 3)
assert out is not None, "the function returns nothing yet"
assert np.allclose(out, [8.0, 6.4, 5.12]), f"mean 0, phi 0.8 from 10: 8, 6.4, 5.12, got {out}"
p = ar1_path(0.02, 0.6, 0.0, 200)
assert abs(p[-1] - 0.05) < 1e-9, f"a long way out the forecast reaches the mean c/(1-phi) = 0.05, got {p[-1]}"
assert len(ar1_path(1.0, 0.5, 0.0, 7)) == 7, "one forecast per step"`,
          why: 'Iterating the model with the shock set to its mean of zero is the forecast. It always heads to c ÷ (1 − φ), faster for small φ: a forecast of a persistent series stays informative for longer.',
        },
        {
          kind: 'choice',
          id: 'qseries-arma-10',
          ask: 'A correlogram shows an ACF that fades slowly over many lags and a PACF with one large bar at lag 1 and nothing after. Which model is the natural first try?',
          options: ['MA(1)', 'AR(1)', 'White noise', 'MA(5)'],
          answer: 1,
          why: 'A fading ACF with a PACF that stops after lag 1 is the signature of an AR(1). An MA(1) is the reverse: an ACF that stops after lag 1 and a PACF that fades.',
        },
        {
          kind: 'design',
          id: 'qseries-arma-11',
          ask: "You fitted an AR(1) to five years of a stock's daily returns and found φ = −0.06 with t = −2.1. Plan how you would decide whether the forecast is worth trading.",
          checklist: [
            { point: 'Count how many lags, stocks and periods you tried before this one', why: 't = 2.1 after many tries is what noise looks like.' },
            { point: 'Fit on the first part of the data and forecast the rest without refitting', why: 'In-sample fit always flatters; only out-of-sample forecasts count.' },
            { point: 'Turn the forecast into positions and charge spread and fees on each change', why: 'An R² of 0.36% leaves a tiny gross edge that costs can erase.' },
            { point: 'Check whether the effect is the bid-ask bounce in closing prints', why: 'Negative autocorrelation in trade prices can be the spread, not a reversal you can earn.' },
            { point: 'Compare with a forecast of zero', why: 'The naive baseline is hard to beat for returns; say how much better you are.' },
            { point: 'Look at the stability of φ in rolling windows', why: 'A coefficient that flips sign across years is not a property of the stock.' },
          ],
          why: 'A significant coefficient is a starting point. The test that matters is a forecast made only with past data, turned into trades, net of costs, against doing nothing.',
        },
      ],
    },
    {
      id: 'qseries-unitroot',
      title: 'Stationarity, unit roots and spurious regression',
      summary: 'Why φ = 1 changes everything, differencing, the Dickey-Fuller test, and why regressing one price on another lies.',
      widget: 'qseries-spurious',
      text: [
        'An AR(1) with φ = 1 is a random walk: `x[t] = c + x[t−1] + ε[t]`. Shocks never fade, the variance grows with time, and there is no mean to return to. Such a series has a **unit root**. Log prices behave like this; returns do not. The quant module warned against correlating prices. This lesson says why, and how to test for it.',
        '**Differencing**, `Δx[t] = x[t] − x[t−1]`, turns a random walk into its shocks, which are stationary. A series that needs one difference is called **integrated of order one**, I(1). Do not difference a series that is already stationary: differencing white noise creates an MA(1) with lag-1 autocorrelation −0.5, a pattern that is not in the data.',
        'The **Dickey-Fuller** test regresses the change on the previous level: `Δx[t] = a + γ × x[t−1] + e[t]`, with γ = φ − 1. A unit root means γ = 0; mean reversion means γ < 0. When the null is true the t statistic of γ̂ does **not** follow the normal curve, so it is compared with Dickey-Fuller critical values. With a constant and a large sample they are about −3.43 at 1%, −2.86 at 5% and −2.57 at 10%. The augmented version (`adfuller` in statsmodels) adds lagged changes to soak up autocorrelation in e.',
        'The test has little **power** near φ = 1: a spread with φ = 0.98, a half-life of about 34 days, will often fail to reject a unit root on one year of data. Failing to reject is not proof of a random walk. And testing many series and keeping the ones that pass is a multiple test like any other; the statarb module builds on this for pairs.',
        'Regress one random walk on another, independent one, and the slope usually looks highly significant with a large R². Granger and Newbold showed this **spurious regression** in 1974: the usual t statistics assume stationary residuals, and the residual of two independent walks is itself a walk. Regress changes on changes, or test that the residual is stationary (cointegration), before believing a regression on levels.',
      ],
      rules: [
        'φ = 1 is a unit root: shocks never fade and variance grows with time.',
        'Difference an I(1) series once. Never difference a stationary one.',
        'Dickey-Fuller: Δx = a + γ x[t−1]; compare t(γ) with −2.86 at 5%, not −1.96.',
        'Failing to reject a unit root is not proof of one: the test is weak near φ = 1.',
        'Regressions on price levels give spurious t statistics. Use changes, or test the residual.',
      ],
      questions: [
        {
          kind: 'choice',
          id: 'qseries-unitroot-1',
          ask: 'Which of these has a unit root?',
          options: [
            'x[t] = 0.5 × x[t−1] + ε[t]',
            'x[t] = 0.01 + x[t−1] + ε[t]',
            'x[t] = ε[t] + 0.9 × ε[t−1]',
            'x[t] = 2 + ε[t]',
          ],
          answer: 1,
          why: 'With φ = 1 every shock stays in the level for ever; the 0.01 adds a drift. φ = 0.5 decays, the MA(1) remembers one shock, and the last is white noise around 2.',
        },
        {
          kind: 'number',
          id: 'qseries-unitroot-2',
          ask: 'A log price follows a random walk with daily shocks of standard deviation 1%. What is the standard deviation of its change over 100 days? Give a percentage, for example 25%.',
          answer: 0.1,
          tol: 0.0005,
          check: '0.01 * math.sqrt(100)',
          why: 'Variance adds over independent steps: 100 × 1%², so the standard deviation is 1% × √100 = 10%. The spread of a random walk keeps growing; a stationary series has a fixed spread however far out you look.',
        },
        {
          kind: 'number',
          id: 'qseries-unitroot-3',
          ask: 'A Dickey-Fuller regression on a spread gives γ̂ = −0.03 with a standard error of 0.012. What is the t statistic? Give one decimal.',
          answer: -2.5,
          tol: 0.01,
          check: '-0.03 / 0.012',
          why: '−0.03 ÷ 0.012 = −2.5. The next question is what to compare it with.',
        },
        {
          kind: 'choice',
          id: 'qseries-unitroot-4',
          ask: 'The t statistic of γ̂ is −2.5, from a regression with a constant on 1,000 points. What do you conclude at the 5% level?',
          options: [
            'Reject the unit root: −2.5 is beyond −1.96',
            'Do not reject: the Dickey-Fuller 5% value is about −2.86, and −2.5 is not beyond it',
            'The spread is proven to be a random walk',
            'Reject: any negative γ̂ means mean reversion',
          ],
          answer: 1,
          why: 'Under a unit root the t statistic is pushed to the left, so the bar is −2.86, not −1.96. Not rejecting leaves the question open: the spread might revert slowly, and the test lacks the power to see it.',
        },
        {
          kind: 'number',
          id: 'qseries-unitroot-5',
          ask: 'You difference a series that was already white noise. The result is e[t] − e[t−1]. What is its lag-1 autocorrelation? Give one decimal.',
          answer: -0.5,
          tol: 0.001,
          check: '-1 / (1 + (-1) ** 2)',
          hint: 'It is an MA(1) with θ = −1. Lag-1 autocorrelation is θ/(1 + θ²).',
          why: 'θ ÷ (1 + θ²) = −1 ÷ 2 = −0.5. Over-differencing invents a strong reversal pattern. A model fitted to it would "find" mean reversion that was never there.',
        },
        {
          kind: 'output',
          id: 'qseries-unitroot-6',
          ask: 'Five hundred regressions of one independent random walk on another, 200 steps each. What share have |t| > 2 on the slope?',
          code: `import numpy as np

rng = np.random.default_rng(0)
hits = 0
for _ in range(500):
    a = np.cumsum(rng.normal(size=200))
    b = np.cumsum(rng.normal(size=200))
    X = np.column_stack([np.ones(200), a])
    coef, *_ = np.linalg.lstsq(X, b, rcond=None)
    res = b - X @ coef
    se = np.sqrt(res @ res / 198 * np.linalg.inv(X.T @ X)[1, 1])
    hits += abs(coef[1] / se) > 2
print(round(hits / 500, 1))`,
          answer: '0.8',
          why: 'About 80% of the pairs look "significant", where a valid test would give about 5%. The t statistic assumes the residual is stationary; here it is a random walk, and the standard error is far too small.',
        },
        {
          kind: 'bug',
          id: 'qseries-unitroot-7',
          ask: 'This should return the Dickey-Fuller t statistic. On every series, stationary or not, it gives a huge positive number.',
          code: `import numpy as np

def df_t(x):
    x = np.asarray(x, dtype=float)
    dx = x[1:]
    X = np.column_stack([np.ones(len(dx)), x[:-1]])
    coef, *_ = np.linalg.lstsq(X, dx, rcond=None)
    res = dx - X @ coef
    s2 = res @ res / (len(dx) - 2)
    return coef[1] / np.sqrt(s2 * np.linalg.inv(X.T @ X)[1, 1])`,
          line: 5,
          fix: '    dx = np.diff(x)',
          why: 'The left side must be the change, `np.diff(x)`. Regressing the level on its own lag gives φ̂, close to 1 for most series, so its t statistic is enormous. The test is about γ = φ − 1.',
        },
        {
          kind: 'write',
          id: 'qseries-unitroot-8',
          numpy: true,
          ask: 'Write `df_t(x)`: regress `Δx[t]` on a constant and `x[t−1]` by least squares and return the t statistic of the slope γ̂ (residual variance divided by n − 2, where n is the number of changes).',
          starter: `import numpy as np

def df_t(x):
    x = np.asarray(x, dtype=float)
    pass`,
          solution: `import numpy as np

def df_t(x):
    x = np.asarray(x, dtype=float)
    dx = np.diff(x)
    z = x[:-1]
    zc = z - z.mean()
    g = (zc * (dx - dx.mean())).sum() / (zc ** 2).sum()
    a = dx.mean() - g * z.mean()
    res = dx - a - g * z
    s2 = (res ** 2).sum() / (len(dx) - 2)
    return float(g / np.sqrt(s2 / (zc ** 2).sum()))`,
          tests: `rng = np.random.default_rng(2)
e = rng.normal(size=3000)
out = df_t(e)
assert out is not None, "the function returns nothing yet"
assert out < -20, f"white noise reverts at once: t should be very negative, got {out:.1f}"
w = np.cumsum(e)
assert -2.86 < df_t(w) < 1.5, f"this random walk should not reject, got {df_t(w):.2f}"
x = np.zeros(3000)
for t in range(1, 3000):
    x[t] = 0.9 * x[t - 1] + e[t]
assert df_t(x) < -5, f"phi = 0.9 on 3000 points should reject strongly, got {df_t(x):.2f}"
X = np.column_stack([np.ones(2999), x[:-1]])
coef, *_ = np.linalg.lstsq(X, np.diff(x), rcond=None)
res = np.diff(x) - X @ coef
se = np.sqrt(res @ res / 2997 * np.linalg.inv(X.T @ X)[1, 1])
assert abs(df_t(x) - coef[1] / se) < 1e-6, "match the least squares t statistic with a constant"`,
          why: "The regression is ordinary least squares; only the critical values are special. This is the plain test. `adfuller` adds lagged changes and looks up MacKinnon's critical values for you.",
        },
        {
          kind: 'choice',
          id: 'qseries-unitroot-9',
          ask: 'In the figure, step through several pairs in Levels, then switch to Changes. What do you see?',
          options: [
            'Levels and changes give similar t statistics',
            'In levels most pairs show |t| well above 2 with sizeable R²; in changes the t statistics sit near zero',
            'Changes show larger t statistics than levels',
            'Only some pairs are spurious, and they are easy to spot by eye',
          ],
          answer: 1,
          why: 'The series are independent by construction, so the changes are rightly unrelated. The levels drift, and two drifting lines line up by chance. Nothing in a levels scatter warns you.',
        },
        {
          kind: 'choice',
          id: 'qseries-unitroot-10',
          ask: 'A spread really mean-reverts with φ = 0.98. On 250 days, the Dickey-Fuller test does not reject a unit root. What does that tell you?',
          options: [
            'The spread is a random walk',
            'Little: near φ = 1 the test often fails to reject even when the series does revert; you need more data or a stronger reason',
            'The test is broken',
            'φ must be exactly 1',
          ],
          answer: 1,
          why: 'With φ = 0.98, γ = −0.02, and a year of data gives a standard error of γ̂ of about the same size. The test has low power here. A failure to reject is absence of evidence, not evidence of a random walk.',
        },
        {
          kind: 'design',
          id: 'qseries-unitroot-11',
          ask: 'A research note regresses the S&P 500 level on the price of copper over ten years: R² = 0.72, slope t = 25. It proposes buying the S&P when it is "cheap" against copper. Review it.',
          checklist: [
            { point: 'Both series are close to random walks in levels', why: 'Regressions of one unit-root series on another give spurious t and R².' },
            { point: 'Rerun the regression on returns', why: 'If the relationship is real, changes should be related too; often they barely are.' },
            { point: 'Test the residual for stationarity with the right critical values', why: 'Only a stationary residual (cointegration) makes "cheap against copper" a meaningful level.' },
            { point: 'Ask why the two should be tied economically', why: 'A link with no reason behind it is likely chance and likely to drift apart.' },
            { point: 'Check the stability of the slope in subperiods', why: 'A spurious slope changes size and even sign from period to period.' },
            { point: 'Count the other series the author tried', why: 'Screening many pairs for a high R² finds some by luck.' },
          ],
          why: 'High R² and huge t on levels are what independent random walks produce most of the time. The burden is on a test of the residual and on an economic reason.',
        },
      ],
    },
    {
      id: 'qseries-ewma',
      title: 'Volatility clustering and EWMA',
      summary: 'Big days follow big days: squared returns, the exponentially weighted moving average of variance, and the RiskMetrics decay.',
      widget: 'qseries-ewma',
      text: [
        'Returns barely predict their own sign, but large moves cluster: a violent day is more likely after violent days. That is **volatility clustering**. It shows in the correlogram of `r²` or `|r|`, which is positive and fades over weeks while the correlogram of `r` is flat. Volatility is therefore partly forecastable, which is why risk systems, option traders and position sizing rules forecast it.',
        'The volatility module estimated volatility as the standard deviation over a fixed window. A 20-day window gives each of the last 20 squared returns equal weight and the 21st none. A big day lifts the estimate for exactly 20 days and then falls out of it at once, a drop that reflects the calendar and not the market (the **ghost effect**).',
        'The **exponentially weighted moving average** (EWMA) of variance uses all past returns with weights that shrink geometrically: `σ²[t] = λ × σ²[t−1] + (1 − λ) × r²[t−1]`. The return from k + 1 days before day t gets weight `(1 − λ) λ^k`. The estimate for day t uses returns up to day t − 1 only, so it is a forecast. Returns are treated as having mean zero, since the daily mean is tiny next to the daily move.',
        { code: `def ewma_var(r, lam, var0):
    out = [var0]
    for x in r[:-1]:
        out.append(lam * out[-1] + (1 - lam) * x * x)
    return out   # out[t] uses returns before t` },
        "The **half-life** of a shock is `ln 0.5 ÷ ln λ` days, and `1 ÷ (1 − λ)` is a rough effective window. J.P. Morgan's RiskMetrics (Technical Document, 4th edition, 1996) used λ = 0.94 for daily data, a half-life of about 11 days, and λ = 0.97 for monthly forecasts. These are conventions chosen to suit many series at once, not the best λ for yours. EWMA has no long-run level: its forecast for every future day equals today's estimate.",
      ],
      rules: [
        'Signs barely cluster; sizes do. Look at the ACF of r², not only r.',
        'EWMA: σ²[t] = λ σ²[t−1] + (1 − λ) r²[t−1]. Only past returns.',
        'Weight on the return k + 1 days back: (1 − λ) λ^k.',
        'Half-life ln 0.5 / ln λ; effective window about 1/(1 − λ).',
        'RiskMetrics: λ = 0.94 daily, 0.97 monthly. A convention, not a law.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'qseries-ewma-1',
          ask: "Yesterday's EWMA daily volatility was 1%, λ = 0.94, and yesterday's return was −3%. What is today's EWMA volatility? Give a percentage to two decimals, for example 1.25%.",
          answer: 0.01217,
          tol: 0.00006,
          check: 'math.sqrt(0.94 * 0.01 ** 2 + 0.06 * 0.03 ** 2)',
          why: '0.94 × 0.0001 + 0.06 × 0.0009 = 0.000148, and √0.000148 ≈ 1.22%. One 3σ day raises the estimate by about a fifth at once. Work in variance, then take the root; averaging volatilities gives the wrong number.',
        },
        {
          kind: 'number',
          id: 'qseries-ewma-2',
          ask: 'What is the half-life in days of a shock under EWMA with λ = 0.94? Give one decimal.',
          answer: 11.2,
          tol: 0.06,
          check: 'math.log(0.5) / math.log(0.94)',
          why: 'ln 0.5 ÷ ln 0.94 ≈ 11.2: after about eleven days a return has half the weight it had the day after it happened. Within two to three weeks the estimate has mostly forgotten a shock.',
        },
        {
          kind: 'number',
          id: 'qseries-ewma-3',
          ask: 'Under EWMA with λ = 0.94, what weight does the squared return from 10 days before the forecast day get, (1 − λ) λ^9? Give three decimals.',
          answer: 0.034,
          tol: 0.0006,
          check: '0.06 * 0.94 ** 9',
          why: '0.06 × 0.94⁹ ≈ 0.06 × 0.573 ≈ 0.034. Yesterday gets 0.06, and the weights fall smoothly, so no single day drops out with a jump.',
        },
        {
          kind: 'number',
          id: 'qseries-ewma-4',
          ask: 'Roughly how many days is the effective window, 1 ÷ (1 − λ), for the RiskMetrics monthly decay λ = 0.97? Give a whole number.',
          answer: 33,
          tol: 0.5,
          check: '1 / (1 - 0.97)',
          why: '1 ÷ 0.03 ≈ 33 days, against about 17 for λ = 0.94. A higher λ is smoother and slower: fewer false alarms, later reactions.',
        },
        {
          kind: 'output',
          id: 'qseries-ewma-5',
          ask: 'Made-up returns with volatility clustering, generated with a fixed seed. The lag-1 autocorrelation of returns, then of squared returns. What does this print?',
          code: `import numpy as np

def acf1(x):
    d = x - x.mean()
    return (d[1:] * d[:-1]).sum() / (d ** 2).sum()

rng = np.random.default_rng(3)
r, s2 = np.zeros(5000), 0.0001
for t in range(5000):
    r[t] = np.sqrt(s2) * rng.standard_normal()
    s2 = 0.000002 + 0.1 * r[t] ** 2 + 0.88 * s2
print(round(acf1(r), 1) + 0.0, round(acf1(r ** 2), 1))`,
          answer: '0.0 0.3',
          why: 'The sign of today says nothing about tomorrow, but the size does: big squared returns follow big ones. Daily stock and index returns show the same pattern, which is why volatility can be forecast when direction mostly cannot.',
        },
        {
          kind: 'bug',
          id: 'qseries-ewma-6',
          ask: "This should give, for each day t, the EWMA variance forecast made before day t's return is known. A volatility-targeted backtest built on it looks far too good.",
          code: `import numpy as np

def ewma_forecasts(r, lam, var0):
    r = np.asarray(r, dtype=float)
    v = np.empty(len(r))
    v[0] = var0
    for t in range(1, len(r)):
        v[t] = lam * v[t - 1] + (1 - lam) * r[t] ** 2
    return v`,
          line: 8,
          fix: '        v[t] = lam * v[t - 1] + (1 - lam) * r[t - 1] ** 2',
          why: 'The forecast for day t may use returns up to day t − 1 only. Using `r[t]` lets the estimate see the day it is sizing, so the strategy shrinks before every big move: lookahead.',
        },
        {
          kind: 'write',
          id: 'qseries-ewma-7',
          numpy: true,
          ask: 'Write `ewma_var(r, lam, var0)`: return an array `v` the same length as `r`, with `v[0] = var0` and `v[t] = lam × v[t−1] + (1 − lam) × r[t−1]²`.',
          starter: `import numpy as np

def ewma_var(r, lam, var0):
    r = np.asarray(r, dtype=float)
    pass`,
          solution: `import numpy as np

def ewma_var(r, lam, var0):
    r = np.asarray(r, dtype=float)
    v = np.empty(len(r))
    v[0] = var0
    for t in range(1, len(r)):
        v[t] = lam * v[t - 1] + (1 - lam) * r[t - 1] ** 2
    return v`,
          tests: `out = ewma_var([0.03, 0.0], 0.94, 0.0001)
assert out is not None, "the function returns nothing yet"
assert len(out) == 2, f"one forecast per day, got {len(out)}"
assert abs(out[1] - 0.000148) < 1e-12, f"0.94 * 0.0001 + 0.06 * 0.03**2 = 0.000148, got {out[1]}"
r = np.array([0.0, 0.0, 0.05, 0.0])
v = ewma_var(r, 0.9, 0.0)
assert v[2] == 0.0, "the forecast for day 2 must not see day 2's return"
assert abs(v[3] - 0.1 * 0.0025) < 1e-12, "day 3 reacts to day 2's 5% move"
rng = np.random.default_rng(0)
x = rng.normal(0, 0.02, 4000)
assert abs(np.sqrt(ewma_var(x, 0.97, 0.0001)[-500:].mean()) - 0.02) < 0.002, "on constant 2% volatility the forecast settles near 2%"`,
          why: 'One multiply and one add per day. The starting value matters for the first few weeks, so it is usually set to the sample variance of an early stretch and those weeks are left out of any test.',
        },
        {
          kind: 'choice',
          id: 'qseries-ewma-8',
          ask: 'In the figure, find the single 5% fall on day 250. Follow the rolling 20-day estimate (blue) and the EWMA line (yellow) over the next 25 days. What is the difference?',
          options: [
            'They behave the same',
            'The rolling estimate jumps, stays flat for 20 days, then drops at once; EWMA jumps and then comes down a little every day',
            'EWMA stays high longer than the rolling window',
            'The rolling estimate does not react to a single day',
          ],
          answer: 1,
          why: "Each big day stays in the rolling window with full weight for 20 days and then leaves at once: the ghost effect. EWMA shrinks each day's weight a little every day, so its estimate drifts down without the cliff.",
        },
        {
          kind: 'choice',
          id: 'qseries-ewma-9',
          ask: 'You raise λ from 0.90 to 0.98. What happens to the EWMA estimate?',
          options: [
            'It reacts faster to a new shock and is noisier',
            'It is smoother and slower: a new shock moves it less, and it forgets more slowly',
            'Its long-run level rises',
            'Nothing, since the weights still add to one',
          ],
          answer: 1,
          why: 'λ is the weight kept on the old estimate, so a larger λ gives each new return less weight (1 − λ) and keeps old returns longer. The choice trades responsiveness against noise; EWMA has no long-run level to move.',
        },
        {
          kind: 'number',
          id: 'qseries-ewma-10',
          ask: 'A strategy targets 10% annual volatility. The EWMA forecast of its daily volatility is 1.5%. What fraction of full size should it hold, target ÷ (daily × √252)? Give two decimals.',
          answer: 0.42,
          tol: 0.006,
          check: '0.10 / (0.015 * math.sqrt(252))',
          why: '1.5% × 15.87 ≈ 23.8% a year, and 10 ÷ 23.8 ≈ 0.42. Volatility targeting from the quant module needs exactly this kind of forecast; a lookahead in the forecast makes the target look met when it was not.',
        },
        {
          kind: 'design',
          id: 'qseries-ewma-11',
          ask: 'You will use an EWMA volatility forecast to size a daily trend strategy on an index future. Decide how you would set it up and test it.',
          checklist: [
            { point: 'The forecast for day t uses returns to day t − 1 only', why: 'Lookahead in the forecast makes every risk number look better than it was.' },
            { point: 'Choose λ by forecast accuracy on early data, then fix it', why: 'Tuning λ on the full backtest is another parameter fitted in-sample.' },
            { point: 'A warm-up period left out of the results', why: 'The first weeks depend on the starting variance, not on the data.' },
            { point: 'A cap on leverage when forecast volatility is very low', why: 'Calm spells forecast low volatility right up to the shock; sizing up without a cap is how volatility targeting gets hurt.' },
            { point: 'Costs from the extra trading that resizing causes', why: 'Daily rescaling adds turnover; small changes may not be worth trading.' },
            { point: 'How it behaved through gaps and sudden shocks', why: 'EWMA learns about a shock only after it happens; it cannot protect the first day.' },
          ],
          why: 'EWMA is a forecast with known weaknesses: it reacts after the fact and has no anchor. Using it for sizing works only with the forecast kept honest and with limits for the moments it is wrong.',
        },
      ],
    },
    {
      id: 'qseries-garch',
      title: 'GARCH(1,1)',
      summary: "Engle's ARCH and Bollerslev's GARCH: the recursion, persistence, the long-run variance, forecasts that return to it, and fitting by likelihood.",
      widget: 'qseries-garch',
      text: [
        'Engle introduced ARCH models in 1982 (the work was cited in his 2003 Nobel prize in economics) and Bollerslev generalised them to **GARCH** in 1986. GARCH(1,1) adds a constant to EWMA: `σ²[t] = ω + α × r²[t−1] + β × σ²[t−1]`, with ω > 0, α ≥ 0, β ≥ 0. α is how hard a new shock hits, β how much of the old estimate is kept. Fits on daily stock index returns often give α between about 0.05 and 0.1 and β between about 0.85 and 0.93.',
        '**Persistence** is α + β. If it is below 1 the variance has a **long-run level** `VL = ω ÷ (1 − α − β)`, and shocks fade with a half-life of `ln 0.5 ÷ ln(α + β)` days. EWMA is the special case ω = 0, α = 1 − λ, β = λ: persistence exactly 1 and no long-run level. If α + β ≥ 1 with ω > 0, forecasts grow without limit: a fitted model like that is a warning, often of a break in the data.',
        'The forecast of the variance h days ahead returns to the long-run level geometrically: `E[σ²[t+h]] = VL + (α + β)^(h−1) × (σ²[t+1] − VL)`. After a shock the forecast term structure slopes down towards VL; in a calm spell it slopes up. Averaging the daily variance forecasts over a horizon gives a volatility for that horizon, which is how a GARCH forecast is compared with an option’s implied volatility.',
        'GARCH is fitted by **maximum likelihood**: assuming `r[t] = σ[t] × z[t]` with z standard normal, choose ω, α, β to minimise the negative log-likelihood `0.5 × Σ (ln 2π + ln σ²[t] + r²[t] ÷ σ²[t])`. A common shortcut, **variance targeting**, sets ω = sample variance × (1 − α − β) and searches only α and β. In Python the `arch` package by Kevin Sheppard (version 8 at the time of writing, 2026) does this with `arch_model(r, vol="GARCH", p=1, q=1)`; its documentation advises scaling daily returns to percent first.',
        'Limits: GARCH(1,1) treats up and down moves alike, while equity volatility rises more after falls (the leverage effect, handled by GJR-GARCH and EGARCH). Standardised residuals still have fat tails, so a Student t error is common. And the fit describes one period: parameters move between calm and crisis samples. It forecasts the size of moves, not their direction, and a good volatility forecast is not a trading edge by itself.',
      ],
      rules: [
        'σ²[t] = ω + α r²[t−1] + β σ²[t−1].',
        'Persistence α + β. Below 1: long-run variance ω / (1 − α − β).',
        'Forecast: VL + (α + β)^(h−1) (σ²[t+1] − VL). Half-life ln 0.5 / ln(α + β).',
        'EWMA is GARCH with ω = 0 and α + β = 1: no long-run level.',
        'Fit by maximum likelihood; variance targeting fixes ω from the sample variance.',
        'Plain GARCH ignores the asymmetry and fat tails of equity returns.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'qseries-garch-1',
          ask: 'A GARCH(1,1) has ω = 0.000002, α = 0.08, β = 0.90. What is its long-run daily volatility, √(ω ÷ (1 − α − β))? Give a percentage, for example 1.25%.',
          answer: 0.01,
          tol: 0.00005,
          check: 'math.sqrt(0.000002 / (1 - 0.08 - 0.90))',
          why: '0.000002 ÷ 0.02 = 0.0001, whose root is 1% a day, about 15.9% a year. ω on its own looks negligible; it is the anchor the whole model returns to.',
        },
        {
          kind: 'number',
          id: 'qseries-garch-2',
          ask: "Same model: ω = 0.000002, α = 0.08, β = 0.90. Yesterday's variance forecast was 0.0001 (1% a day) and the return was −2%. What is today's volatility forecast? Give a percentage to two decimals.",
          answer: 0.011136,
          tol: 0.00006,
          check: 'math.sqrt(0.000002 + 0.08 * 0.02 ** 2 + 0.90 * 0.0001)',
          why: '0.000002 + 0.08 × 0.0004 + 0.9 × 0.0001 = 0.000124, so about 1.11%. A 2σ day lifts the forecast by about a ninth.',
        },
        {
          kind: 'number',
          id: 'qseries-garch-3',
          ask: 'A fitted GARCH(1,1) has α + β = 0.98. What is the half-life of a volatility shock in days? Give one decimal.',
          answer: 34.3,
          tol: 0.1,
          check: 'math.log(0.5) / math.log(0.98)',
          why: 'ln 0.5 ÷ ln 0.98 ≈ 34.3 days, about a month and a half of trading. Persistence near 1 means volatility shocks fade slowly, which is what daily index data usually show.',
        },
        {
          kind: 'number',
          id: 'qseries-garch-4',
          ask: "Long-run variance VL = 0.0001, tomorrow's forecast σ²[t+1] = 0.0004 and α + β = 0.95. What is the forecast of daily volatility 10 days ahead, √(VL + 0.95⁹ × (σ²[t+1] − VL))? Give a percentage to two decimals.",
          answer: 0.017,
          tol: 0.00006,
          check: 'math.sqrt(0.0001 + 0.95 ** 9 * (0.0004 - 0.0001))',
          why: "0.95⁹ ≈ 0.630, so the variance is 0.0001 + 0.630 × 0.0003 ≈ 0.000289 and the volatility about 1.70%, between tomorrow's 2% and the long-run 1%. Work in variance and take the root at the end.",
        },
        {
          kind: 'choice',
          id: 'qseries-garch-5',
          ask: 'Which GARCH(1,1) is the same as EWMA with λ = 0.94?',
          options: [
            'ω = 0, α = 0.06, β = 0.94',
            'ω = 0, α = 0.94, β = 0.06',
            'ω = 0.000002, α = 0.06, β = 0.90',
            'ω = 0.0001, α = 0, β = 0.94',
          ],
          answer: 0,
          why: 'EWMA puts weight 1 − λ on the new squared return and λ on the old estimate, with nothing added: ω = 0, α = 0.06, β = 0.94. Swapping α and β is the common slip; it gives a model that almost ignores its past.',
        },
        {
          kind: 'choice',
          id: 'qseries-garch-6',
          ask: 'A fit on a short, turbulent sample returns ω > 0, α = 0.15 and β = 0.87. What is wrong?',
          options: [
            'Nothing: both are below 1',
            'α + β = 1.02 > 1: there is no long-run variance and the forecast grows without limit; suspect a break or too short a sample',
            'β must always be below α',
            'α is too small to matter',
          ],
          answer: 1,
          why: 'Persistence above 1 makes the variance non-stationary, so forecasts explode. It often appears when the sample spans a shift from calm to crisis, which looks to the model like one endlessly persistent shock.',
        },
        {
          kind: 'output',
          id: 'qseries-garch-7',
          ask: 'Long-run annual volatility and half-life from fitted parameters. What does this print?',
          code: `import math

omega, alpha, beta = 0.000003, 0.09, 0.89
vl = omega / (1 - alpha - beta)
annual = math.sqrt(vl * 252)
half = math.log(0.5) / math.log(alpha + beta)
print(round(annual, 3), round(half))`,
          answer: '0.194 34',
          why: 'VL = 0.000003 ÷ 0.02 = 0.00015, and √(0.00015 × 252) ≈ 0.194, about 19% a year. Persistence 0.98 gives a half-life of about 34 days, as in the earlier question.',
        },
        {
          kind: 'bug',
          id: 'qseries-garch-8',
          ask: 'This GARCH(1,1) filter with α = 0.08 and β = 0.90 has almost no memory: each forecast is mostly yesterday’s squared return.',
          code: `import numpy as np

def garch_var(r, omega, alpha, beta):
    r = np.asarray(r, dtype=float)
    v = np.empty(len(r))
    v[0] = omega / (1 - alpha - beta)
    for t in range(1, len(r)):
        v[t] = omega + alpha * v[t - 1] + beta * r[t - 1] ** 2
    return v`,
          line: 8,
          fix: '        v[t] = omega + alpha * r[t - 1] ** 2 + beta * v[t - 1]',
          why: 'α belongs on the new squared return and β on the previous variance. Swapped, the model keeps only 8% of its memory each day and puts 90% on one noisy squared return.',
        },
        {
          kind: 'write',
          id: 'qseries-garch-9',
          numpy: true,
          ask: 'Write `garch_var(r, omega, alpha, beta)`: return the array of one-step variance forecasts, starting at the long-run variance `omega ÷ (1 − alpha − beta)` and then `v[t] = omega + alpha × r[t−1]² + beta × v[t−1]`.',
          starter: `import numpy as np

def garch_var(r, omega, alpha, beta):
    r = np.asarray(r, dtype=float)
    pass`,
          solution: `import numpy as np

def garch_var(r, omega, alpha, beta):
    r = np.asarray(r, dtype=float)
    v = np.empty(len(r))
    v[0] = omega / (1 - alpha - beta)
    for t in range(1, len(r)):
        v[t] = omega + alpha * r[t - 1] ** 2 + beta * v[t - 1]
    return v`,
          tests: `out = garch_var([-0.02, 0.0], 0.000002, 0.08, 0.90)
assert out is not None, "the function returns nothing yet"
assert abs(out[0] - 0.0001) < 1e-12, f"start at the long-run variance 0.0001, got {out[0]}"
assert abs(out[1] - 0.000124) < 1e-12, f"0.000002 + 0.08*0.0004 + 0.9*0.0001 = 0.000124, got {out[1]}"
v = garch_var(np.zeros(500), 0.000002, 0.08, 0.90)
assert abs(v[-1] - 0.000002 / 0.1) < 1e-9, "with no shocks at all the variance settles at omega / (1 - beta)"
assert garch_var([0.0, 0.05, 0.0], 0.000002, 0.08, 0.90)[1] == garch_var([0.0, 0.0, 0.0], 0.000002, 0.08, 0.90)[1], "the forecast for day 1 must not see day 1's return"`,
          why: 'The same loop as EWMA with a constant added, which is what pulls the forecast back towards its long-run level. Starting at VL avoids a warm-up guess.',
        },
        {
          kind: 'write',
          id: 'qseries-garch-10',
          numpy: true,
          ask: 'Write `garch_nll(r, omega, alpha, beta)`: the Gaussian negative log-likelihood `0.5 × Σ (ln 2π + ln v[t] + r[t]² ÷ v[t])`, with v from the GARCH recursion started at the long-run variance. Return `math.inf` if ω ≤ 0, α or β is negative, or `alpha + beta >= 1`.',
          starter: `import math
import numpy as np

def garch_nll(r, omega, alpha, beta):
    r = np.asarray(r, dtype=float)
    pass`,
          solution: `import math
import numpy as np

def garch_nll(r, omega, alpha, beta):
    r = np.asarray(r, dtype=float)
    if omega <= 0 or alpha < 0 or beta < 0 or alpha + beta >= 1:
        return math.inf
    v = np.empty(len(r))
    v[0] = omega / (1 - alpha - beta)
    for t in range(1, len(r)):
        v[t] = omega + alpha * r[t - 1] ** 2 + beta * v[t - 1]
    return float(0.5 * np.sum(math.log(2 * math.pi) + np.log(v) + r ** 2 / v))`,
          tests: `out = garch_nll([0.01], 0.00001, 0.0, 0.9)
assert out is not None, "the function returns nothing yet"
want = 0.5 * (math.log(2 * math.pi) + math.log(0.0001) + 1.0)
assert abs(out - want) < 1e-9, f"one return of 1% at variance 0.0001: {want:.4f}, got {out}"
assert garch_nll([0.01], 0.00001, 0.2, 0.85) == math.inf, "alpha + beta >= 1 has no long-run variance: return inf"
assert garch_nll([0.01], 0.00001, -0.1, 0.5) == math.inf, "negative parameters are not allowed"
rng = np.random.default_rng(8)
r, s2 = np.zeros(3000), 0.0001
for t in range(3000):
    r[t] = math.sqrt(s2) * rng.standard_normal()
    s2 = 0.000005 + 0.1 * r[t] ** 2 + 0.85 * s2
assert garch_nll(r, 0.000005, 0.1, 0.85) < garch_nll(r, 0.0001 * 0.05, 0.0, 0.95), "the true parameters should fit better than a model with no reaction to shocks"`,
          why: 'Each day pays ln v for claiming a wide distribution and r²/v for a move the model called unlikely; the best parameters balance the two. Libraries minimise this with a numerical optimiser; a grid over α and β with variance targeting is enough to see it work, as the lab does.',
        },
        {
          kind: 'choice',
          id: 'qseries-garch-11',
          ask: 'In the figure, set the current volatility well above the long-run level, then raise β so that α + β goes from about 0.90 to 0.99. What happens to the forecast curve?',
          options: [
            'It falls to the long-run level faster',
            "It falls back much more slowly: high persistence keeps today's volatility in the forecast for months",
            'It rises above the current volatility',
            'Nothing, because the long-run level is the same',
          ],
          answer: 1,
          why: 'The gap to the long-run variance shrinks by α + β each day. At 0.90 most of it is gone in a few weeks; at 0.99 the half-life is about 69 days. The persistence decides how much a one-month forecast differs from today.',
        },
        {
          kind: 'design',
          id: 'qseries-garch-12',
          ask: 'A GARCH(1,1) on SPY returns forecasts 14% volatility over the next month while the one-month at-the-money option is priced at 18% implied. Someone proposes selling the option on that gap. What do you weigh?',
          checklist: [
            { point: 'Implied volatility normally sits above forecast realised volatility', why: 'The variance risk premium is the usual state, so a gap is not by itself a mispricing.' },
            { point: 'The forecast error of GARCH at one month', why: 'Forecasts miss by several volatility points; the gap may be inside the error.' },
            { point: 'Events in the window that the model cannot see', why: 'GARCH knows past returns, not the calendar; an earnings date or a Fed day is priced into the option.' },
            { point: 'The tail: a short option loses most on the days GARCH did not forecast', why: 'Volatility forecasts react after shocks; the loss comes on the shock day.' },
            { point: 'How the model was fitted and on which period', why: 'Parameters from a calm sample understate persistence after a break.' },
            { point: 'Defined risk and size limits for any short volatility position', why: 'A naked short option can lose far more than the premium; the strategies and risk modules showed how to cap it.' },
          ],
          why: 'GARCH gives a disciplined forecast to compare with implied volatility, not a signal. The gap is expected, the error is large, and the risk of the trade sits on the days the model is most wrong.',
        },
      ],
    },
    {
      id: 'qseries-realised',
      title: 'Realised volatility and range estimators',
      summary: 'Volatility from intraday returns, from the high and low of a bar, and why sampling too often overstates it.',
      widget: 'qseries-signature',
      text: [
        "A daily squared return is a very noisy measure of that day's variance: a stock can swing 3% and close flat. With intraday prices you can do better. **Realised variance** (RV) for a day is the sum of squared intraday log returns, `RV = Σ r[i]²`, and realised volatility is its square root. With many intraday returns it is far less noisy than one daily r². Annualise a daily figure with √252 as before.",
        'If you only have open, high, low and close, the range helps. **Parkinson** (1980): `σ² = (ln(H ÷ L))² ÷ (4 ln 2)`. **Garman-Klass** (1980) adds the open and close: `σ² = 0.5 × (ln(H ÷ L))² − (2 ln 2 − 1) × (ln(C ÷ O))²`. Both give a variance per bar, assume no drift and continuous trading, and are much less noisy than a close-to-close squared return. Because the recorded high and low miss extremes between trades, they tend to understate a little.',
        'More frequent sampling should help, but at very short intervals prices bounce between bid and ask. This **microstructure noise** adds to every return, so RV from every trade overstates volatility. If each observed price carries an independent error of standard deviation ω, RV gains about `2 n ω²` from n returns. Plot RV against the sampling interval and it rises at the shortest intervals: the **volatility signature plot** (Andersen, Bollerslev, Diebold and Labys, around 2000).',
        'The common compromise is 5-minute returns. Liu, Patton and Sheppard (2015) compared hundreds of estimators across many assets and found it hard to beat 5-minute RV by a significant margin. Estimators built to resist noise (realised kernels, pre-averaging, subsampling) exist when you need finer data.',
        'Intraday RV and the range both miss the **overnight** move, which for US stocks is a sizeable share of daily variance. Add the squared close-to-open return, or scale, and treat half days, the opening auction and bad ticks with the cleaning rules of the qdata module. RV is a better yardstick for scoring forecasts than r², which matters in the lab.',
      ],
      rules: [
        'RV = Σ of squared intraday log returns; realised volatility is its square root.',
        'Parkinson: (ln H/L)² / (4 ln 2). Garman-Klass: 0.5 (ln H/L)² − (2 ln 2 − 1)(ln C/O)².',
        'Microstructure noise adds about 2nω² to RV: sampling every tick overstates it.',
        'A signature plot that rises at short intervals shows noise. Five minutes is the usual compromise.',
        'Intraday measures miss the overnight move. Add it back.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'qseries-realised-1',
          ask: "A day's five intraday log returns are 0.3%, −0.2%, 0.4%, −0.1% and 0.2%. What is that day's realised volatility, √(Σ r²)? Give a percentage to two decimals.",
          answer: 0.00583,
          tol: 0.00003,
          check: 'math.sqrt(sum(x ** 2 for x in [0.003, -0.002, 0.004, -0.001, 0.002]))',
          why: 'The squares sum to (9 + 4 + 16 + 1 + 4) × 10⁻⁶ = 34 × 10⁻⁶, and the root is about 0.58%. Signs do not matter: the day ended up 0.6%, but the path held more movement than the close shows.',
        },
        {
          kind: 'number',
          id: 'qseries-realised-2',
          ask: 'Average daily realised volatility over a month is 0.8%. Annualise it with √252. Give a percentage to one decimal.',
          answer: 0.127,
          tol: 0.0006,
          check: '0.008 * math.sqrt(252)',
          why: '0.8% × 15.87 ≈ 12.7%. Strictly you should average daily variances and take the root, which gives a slightly higher number when volatility varies across the month.',
        },
        {
          kind: 'number',
          id: 'qseries-realised-3',
          ask: "A day's high is 102 and its low is 99. What is the Parkinson daily volatility, √((ln(H/L))² ÷ (4 ln 2))? Give a percentage to two decimals.",
          answer: 0.01793,
          tol: 0.00006,
          check: 'math.sqrt(math.log(102 / 99) ** 2 / (4 * math.log(2)))',
          why: 'ln(102/99) ≈ 0.0299; squared, 0.000891; divided by 4 ln 2 ≈ 2.77 gives 0.000321, whose root is about 1.79%. The range of a day holds more information about its variance than its close alone.',
        },
        {
          kind: 'number',
          id: 'qseries-realised-4',
          ask: 'Same day: open 100, high 102, low 99, close 101. What is the Garman-Klass daily volatility, √(0.5 (ln H/L)² − (2 ln 2 − 1)(ln C/O)²)? Give a percentage to two decimals.',
          answer: 0.02018,
          tol: 0.00006,
          check: 'math.sqrt(0.5 * math.log(102 / 99) ** 2 - (2 * math.log(2) - 1) * math.log(101 / 100) ** 2)',
          why: '0.5 × 0.000891 = 0.000446, minus 0.386 × 0.000099 = 0.000038, leaves 0.000407: about 2.02%. On one day the estimators differ; their advantage is lower noise across many days.',
        },
        {
          kind: 'number',
          id: 'qseries-realised-5',
          ask: 'You compute RV from 390 one-minute returns. Each observed price carries independent noise with standard deviation ω = 0.0001 (1 basis point), and the true daily variance is 0.0001. By what share does noise inflate RV, 2nω² ÷ true variance? Give a percentage, for example 25%.',
          answer: 0.078,
          tol: 0.0005,
          check: '2 * 390 * 0.0001 ** 2 / 0.0001',
          why: '2 × 390 × 10⁻⁸ = 7.8 × 10⁻⁶, which is 7.8% of the true variance. With one-second data, n = 23,400, the bias would be several times the true variance. The bias grows with n, so finer data makes it worse.',
        },
        {
          kind: 'choice',
          id: 'qseries-realised-6',
          ask: 'In the figure, set the noise to zero, then raise it to 3 basis points. What happens to the signature plot?',
          options: [
            'Nothing changes',
            'With no noise it stays near the true volatility; with noise it rises sharply at the shortest intervals and settles at longer ones',
            'Noise lowers RV at short intervals',
            'Noise raises RV equally at every interval',
          ],
          answer: 1,
          why: 'The noise adds about 2ω² per return, and short intervals have many returns, so their RV rises most. Longer intervals have fewer returns, so the noise share is small, though the estimate itself is noisier. The flat part of the plot is where to sample.',
        },
        {
          kind: 'bug',
          id: 'qseries-realised-7',
          ask: 'This Parkinson estimator gives variances half as large as they should be.',
          code: `import math

def parkinson_var(high, low):
    x = math.log(high / low)
    return x ** 2 / (8 * math.log(2))`,
          line: 5,
          fix: '    return x ** 2 / (4 * math.log(2))',
          why: 'The constant is 4 ln 2 ≈ 2.77, from the expected squared range of a random walk over one period. With 8 ln 2 the volatility comes out √2 too small, and anything sized on it is too large.',
        },
        {
          kind: 'write',
          id: 'qseries-realised-8',
          numpy: true,
          ask: 'Write `realised_vol(prices, step)`: sample the intraday prices every `step` points (starting at the first), take log returns of the sampled prices, and return √(Σ r²).',
          starter: `import numpy as np

def realised_vol(prices, step):
    p = np.asarray(prices, dtype=float)
    pass`,
          solution: `import numpy as np

def realised_vol(prices, step):
    p = np.asarray(prices, dtype=float)
    s = p[::step]
    r = np.diff(np.log(s))
    return float(np.sqrt((r ** 2).sum()))`,
          tests: `out = realised_vol([100.0, 101.0, 100.0], 1)
assert out is not None, "the function returns nothing yet"
want = np.sqrt(np.log(1.01) ** 2 + np.log(100 / 101) ** 2)
assert abs(out - want) < 1e-12, f"two log returns of about +1% and -1%: {want:.5f}, got {out}"
assert realised_vol([100.0, 101.0, 100.0], 2) == 0.0, "sampling every 2 sees 100 then 100: no movement"
rng = np.random.default_rng(6)
true = np.cumsum(rng.normal(0, 0.01 / np.sqrt(23400), 23401))
noisy = 100 * np.exp(true + rng.choice([-0.0002, 0.0002], 23401))
assert realised_vol(noisy, 1) > 3 * realised_vol(noisy, 300), "bid-ask noise inflates RV at every-second sampling far above 5-minute sampling"
assert abs(realised_vol(100 * np.exp(true), 300) - 0.01) < 0.003, "5-minute RV on a clean path is near the true 1%"`,
          why: 'Sampling with `p[::step]` then summing squared log returns is the whole estimator. Comparing step = 1 with step = 300 on the same noisy path is the signature plot in two numbers.',
        },
        {
          kind: 'write',
          id: 'qseries-realised-9',
          numpy: true,
          ask: 'Write `garman_klass(o, h, l, c)`: take arrays of daily open, high, low and close, and return the array of daily Garman-Klass variances `0.5 (ln h/l)² − (2 ln 2 − 1)(ln c/o)²`.',
          starter: `import numpy as np

def garman_klass(o, h, l, c):
    o, h, l, c = (np.asarray(a, dtype=float) for a in (o, h, l, c))
    pass`,
          solution: `import numpy as np

def garman_klass(o, h, l, c):
    o, h, l, c = (np.asarray(a, dtype=float) for a in (o, h, l, c))
    return 0.5 * np.log(h / l) ** 2 - (2 * np.log(2) - 1) * np.log(c / o) ** 2`,
          tests: `out = garman_klass([100.0], [102.0], [99.0], [101.0])
assert out is not None, "the function returns nothing yet"
assert abs(out[0] - 0.00040735) < 1e-7, f"O 100, H 102, L 99, C 101 gives about 0.000407, got {out[0]}"
flat = garman_klass([100.0, 50.0], [100.0, 50.0], [100.0, 50.0], [100.0, 50.0])
assert np.allclose(flat, 0), "a bar that never moved has zero variance"
assert garman_klass([100.0], [101.0], [99.0], [100.0])[0] > garman_klass([100.0], [101.0], [99.0], [101.0])[0], "for the same range, a bigger open-to-close move lowers the estimate"`,
          why: 'Vectorised, it gives a variance for every bar at once. Averaged over a window and annualised it gives a range-based volatility, often close to 5-minute RV and far less noisy than close-to-close.',
        },
        {
          kind: 'choice',
          id: 'qseries-realised-10',
          ask: "You estimate a stock's daily volatility from 5-minute RV during regular hours only, and compare it with close-to-close volatility. The RV figure is consistently lower. What is the most likely reason?",
          options: [
            'RV is biased downwards by microstructure noise',
            'Regular-hours RV leaves out the overnight move from close to next open, which carries a real share of daily variance',
            'Close-to-close volatility is always wrong',
            'Five minutes is too long an interval',
          ],
          answer: 1,
          why: 'Earnings, news and foreign markets move prices while US markets are closed, and that gap appears in close-to-close returns but not in intraday RV. Noise pushes RV up, not down. Add the squared overnight return, or scale, before comparing.',
        },
        {
          kind: 'design',
          id: 'qseries-realised-11',
          ask: 'You have a year of one-minute bars for 50 stocks and want a daily volatility series for each, to score forecasts against. Plan the estimator.',
          checklist: [
            { point: 'A sampling interval chosen from a signature plot, often around 5 minutes', why: 'Too fine and noise inflates RV; too coarse and the estimate is noisy.' },
            { point: 'The overnight return added in, or a documented scaling', why: 'Intraday-only RV understates daily variance.' },
            { point: 'Cleaning: bad ticks, stale prices, the opening and closing auctions', why: 'One bad print adds a huge squared return to one day.' },
            { point: 'Half days and missing minutes handled explicitly', why: 'Fewer returns mechanically lower RV for that day.' },
            { point: 'Mid-quote prices rather than trades where possible', why: 'Mid-quotes remove most of the bid-ask bounce.' },
            { point: 'A cross-check against Garman-Klass and close-to-close', why: 'Large disagreements point at data problems.' },
          ],
          why: 'RV is only as good as the prices it sums. Most of the work is choosing the interval, handling the overnight gap and cleaning, decided once and applied to every stock alike.',
        },
      ],
    },
    {
      id: 'qseries-regimes',
      title: 'Regimes: rolling statistics, breaks and two states',
      summary: 'Seeing change with rolling windows, finding a break without fooling yourself, and a two-state view of calm and stressed markets.',
      widget: 'qseries-regime',
      text: [
        'The models so far assume one set of parameters for all time. Markets disagree: volatility, correlations and even the sign of autocorrelation change. The cheapest tool is a **rolling statistic**, a mean or volatility over the last w days, recomputed each day. It must use only the window ending today. And it is noisy: the standard error of a volatility estimated from n returns is about `σ ÷ √(2n)`, so a 20-day estimate of 20% volatility is uncertain by about ±3 points.',
        "A **structural break** is a date where the parameters change. Searching every date for the largest difference in means before and after is easy, and the best split always looks significant, because the search picked it. Tests that allow for the search (Andrews' sup-F, Bai-Perron) use larger critical values. A break you find in the past says the old model failed; it does not tell you when the next one comes.",
        'A **two-state** model says the market is in one of two regimes, calm or stressed, each with its own mean and volatility, and moves between them with fixed probabilities. If the chance of staying calm tomorrow is p, a calm spell lasts on average `1 ÷ (1 − p)` days. With staying probabilities p (calm) and q (stressed), the long-run share of stressed days is `(1 − p) ÷ ((1 − p) + (1 − q))`. Mixing two normal regimes gives returns with fat tails, one explanation of the tails the quant module measured.',
        'Hamilton (1989) introduced the **Markov-switching** model. The regime is never observed; the model gives a probability for it each day. **Filtered** probabilities use data up to that day; **smoothed** probabilities use the whole sample. A backtest that uses smoothed probabilities, or any regime label drawn with hindsight, has lookahead. statsmodels offers `MarkovRegression`, and the `hmmlearn` package fits hidden Markov models.',
        'A simpler causal regime is a threshold on a volatility forecast: stressed when the EWMA volatility is above some level. It is late by construction: it changes state after the first big days. Every regime filter trades that delay against false alarms, and adds parameters that can be overfitted.',
      ],
      rules: [
        'Rolling windows use only data up to today. Their noise is large: σ/√(2n) for volatility.',
        'The best split found by searching always looks significant. Use tests that allow for the search.',
        'Expected duration of a regime: 1 / (1 − p), where p is the chance of staying.',
        'Long-run share of the stressed state: (1 − p) / ((1 − p) + (1 − q)).',
        'Filtered probabilities are causal; smoothed ones see the future.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'qseries-regimes-1',
          ask: 'In a two-state model the chance of staying calm from one day to the next is 0.98. How long, on average, does a calm spell last, in days?',
          answer: 50,
          tol: 0.5,
          check: '1 / (1 - 0.98)',
          why: 'Each day the spell ends with probability 0.02, so it lasts 1 ÷ 0.02 = 50 days on average. Actual durations spread widely around that, from a few days to many months.',
        },
        {
          kind: 'number',
          id: 'qseries-regimes-2',
          ask: 'The chance of staying calm is 0.98 and of staying stressed is 0.90. In the long run, what share of days are stressed? Give a percentage to one decimal, for example 12.5%.',
          answer: 0.1667,
          tol: 0.0006,
          check: '(1 - 0.98) / ((1 - 0.98) + (1 - 0.90))',
          why: '0.02 ÷ (0.02 + 0.10) ≈ 16.7%. Stressed spells last about 10 days and calm ones about 50, so the market spends about one day in six stressed.',
        },
        {
          kind: 'number',
          id: 'qseries-regimes-3',
          ask: 'Returns are calm (daily volatility 0.8%) on 85% of days and stressed (2.5%) on 15%, each with mean zero. What is the overall daily volatility, √(0.85 × 0.8%² + 0.15 × 2.5%²)? Give a percentage to two decimals.',
          answer: 0.01217,
          tol: 0.00006,
          check: 'math.sqrt(0.85 * 0.008 ** 2 + 0.15 * 0.025 ** 2)',
          why: 'Variances mix by weight: 0.85 × 0.000064 + 0.15 × 0.000625 ≈ 0.000148, about 1.22%. That single number fits neither regime: most days are calmer than it, and the stressed days far wilder.',
        },
        {
          kind: 'number',
          id: 'qseries-regimes-4',
          ask: 'You estimate volatility from a 20-day rolling window and the true annual volatility is 20%. Using a standard error of σ ÷ √(2n), how uncertain is the estimate? Give a percentage to two decimals (annual points).',
          answer: 0.0316,
          tol: 0.0003,
          check: '0.20 / math.sqrt(2 * 20)',
          why: '20% ÷ √40 ≈ 3.2 points. A move in a 20-day estimate from 20% to 23% is inside one standard error: it may be a change of regime or nothing at all.',
        },
        {
          kind: 'choice',
          id: 'qseries-regimes-5',
          ask: 'A backtest switches a strategy off in stressed regimes, using the smoothed regime probabilities from a Markov-switching model fitted to the full history. Its drawdowns all but vanish. What is wrong?',
          options: [
            'Nothing: the model finds the regimes',
            'Smoothed probabilities use the whole sample, including the future; use filtered probabilities from a model fitted on past data only',
            'Two regimes are too few',
            'The model should be fitted on prices, not returns',
          ],
          answer: 1,
          why: 'Smoothed probabilities look back from the end of the sample, so a stressed spell is flagged from its first day. Only filtered probabilities, from parameters fitted on data before each date, were available in real time, and they flag stress later.',
        },
        {
          kind: 'choice',
          id: 'qseries-regimes-6',
          ask: "You search every date in ten years of a strategy's returns for the split with the biggest difference in mean, and find one with t = 3.2. What does that show?",
          options: [
            'A break at that date, significant at 1%',
            'Not much: the best of thousands of splits looks strong even in data with no break; it needs a test that allows for the search, or a date fixed in advance',
            'That the strategy stopped working on that date',
            'That the data are not stationary',
          ],
          answer: 1,
          why: 'Choosing the date by the result is a multiple test over every possible date. Critical values for a searched break are well above the usual ones; a break tied to a known event chosen beforehand is a different, honest test.',
        },
        {
          kind: 'output',
          id: 'qseries-regimes-7',
          ask: 'A rolling 3-day mean that uses only the window ending on each day. What does this print?',
          code: `import numpy as np

x = np.array([1.0, 2.0, 3.0, 10.0, 11.0, 12.0])
w = 3
roll = [x[t - w + 1:t + 1].mean() for t in range(w - 1, len(x))]
print([round(float(v), 1) for v in roll])`,
          answer: '[2.0, 5.0, 8.0, 11.0]',
          why: 'Each value averages the three days ending that day: (1+2+3)/3, (2+3+10)/3, (3+10+11)/3, (10+11+12)/3. The rolling mean takes the window length to move from the old level to the new one: it lags a break.',
        },
        {
          kind: 'bug',
          id: 'qseries-regimes-8',
          ask: 'This rolling volatility for day t is meant to use the w returns ending on day t. A strategy filtered on it never seems to be caught in a volatile spell.',
          code: `import numpy as np

def rolling_vol(r, w):
    r = np.asarray(r, dtype=float)
    out = np.full(len(r), np.nan)
    for t in range(w - 1, len(r)):
        out[t] = r[t:t + w].std(ddof=1)
    return out`,
          line: 7,
          fix: '        out[t] = r[t - w + 1:t + 1].std(ddof=1)',
          why: '`r[t:t + w]` is the window starting today and running into the future, so the filter saw the coming turbulence before it happened. The window must end at t: `r[t − w + 1 : t + 1]`.',
        },
        {
          kind: 'write',
          id: 'qseries-regimes-9',
          numpy: true,
          ask: 'Write `best_split(x, min_len)`: for every split k with at least `min_len` points on each side, add the sum of squared deviations of `x[:k]` from its mean to that of `x[k:]` from its mean; return the k with the smallest total.',
          starter: `import numpy as np

def best_split(x, min_len):
    x = np.asarray(x, dtype=float)
    pass`,
          solution: `import numpy as np

def best_split(x, min_len):
    x = np.asarray(x, dtype=float)
    best_k, best = None, np.inf
    for k in range(min_len, len(x) - min_len + 1):
        a, b = x[:k], x[k:]
        sse = ((a - a.mean()) ** 2).sum() + ((b - b.mean()) ** 2).sum()
        if sse < best:
            best_k, best = k, sse
    return best_k`,
          tests: `out = best_split([0.0, 0.0, 0.0, 5.0, 5.0, 5.0], 1)
assert out is not None, "the function returns nothing yet"
assert out == 3, f"the level jumps after three points: split at 3, got {out}"
rng = np.random.default_rng(9)
x = np.concatenate([rng.normal(0, 1, 300), rng.normal(1.5, 1, 200)])
assert abs(best_split(x, 20) - 300) <= 10, f"a clear shift at 300 should be found near 300, got {best_split(x, 20)}"
k = best_split(rng.normal(0, 1, 100), 30)
assert 30 <= k <= 70, f"each side needs at least min_len points, got split {k}"`,
          why: 'This is the least-squares break search. It always returns a split, even on pure noise, which is why the best split has to be judged against the search, not against an ordinary t-test.',
        },
        {
          kind: 'write',
          id: 'qseries-regimes-10',
          numpy: true,
          ask: 'Write `vol_regime(r, lam, var0, threshold)`: compute the EWMA variance forecast `v[t] = lam × v[t−1] + (1 − lam) × r[t−1]²` with `v[0] = var0`, and return an integer array that is 1 where √v[t] > threshold and 0 elsewhere.',
          starter: `import numpy as np

def vol_regime(r, lam, var0, threshold):
    r = np.asarray(r, dtype=float)
    pass`,
          solution: `import numpy as np

def vol_regime(r, lam, var0, threshold):
    r = np.asarray(r, dtype=float)
    v = np.empty(len(r))
    v[0] = var0
    for t in range(1, len(r)):
        v[t] = lam * v[t - 1] + (1 - lam) * r[t - 1] ** 2
    return (np.sqrt(v) > threshold).astype(int)`,
          tests: `out = vol_regime([0.0, 0.1, 0.0], 0.9, 0.0001, 0.02)
assert out is not None, "the function returns nothing yet"
assert list(out) == [0, 0, 1], f"the 10% day shows in the state the day after, not the same day: want [0, 0, 1], got {list(out)}"
rng = np.random.default_rng(2)
r = np.concatenate([rng.normal(0, 0.008, 300), rng.normal(0, 0.03, 100), rng.normal(0, 0.008, 300)])
s = vol_regime(r, 0.94, 0.008 ** 2, 0.015)
assert s[:280].mean() < 0.05, "the calm start should be labelled calm"
assert s[320:400].mean() > 0.9, "the stressed spell should be labelled stressed after a few days"
assert s[300] == 0, "the first stressed day cannot be seen in advance"`,
          why: 'A causal regime label: it uses only returns before each day. It is late, and the threshold is a parameter that can be overfitted, but unlike a smoothed probability it could have been traded.',
        },
        {
          kind: 'choice',
          id: 'qseries-regimes-11',
          ask: 'In the figure, raise the chance of staying stressed from 0.90 to 0.98 while keeping calm at 0.98. What changes?',
          options: [
            'Stressed spells become shorter',
            'Stressed spells last much longer and take up about half the days in the long run',
            'Nothing: only the calm probability matters',
            'The market never enters the stressed state',
          ],
          answer: 1,
          why: 'Expected stressed duration rises from 10 to 50 days and the long-run share from about 17% to 50%. Long spells are easier to detect and act on; short ones are mostly over by the time a filter notices them.',
        },
        {
          kind: 'design',
          id: 'qseries-regimes-12',
          ask: 'You want to add a regime filter to a trend-following strategy: full size in calm markets and half size in stressed ones. Plan how to build and test it honestly.',
          checklist: [
            { point: 'A causal regime signal: filtered probabilities, or a threshold on a past-only volatility forecast', why: 'Smoothed or hand-drawn regimes contain the future.' },
            { point: 'Parameters (λ, threshold, number of states) fixed on early data', why: 'Every free choice is another chance to overfit.' },
            { point: 'Measure the delay: how many days into a stressed spell the filter switches', why: 'The worst days are often the first ones, before any filter reacts.' },
            { point: 'Compare with no filter and with plain volatility targeting', why: 'A simple baseline may give the same benefit with fewer parameters.' },
            { point: 'Count the switches and charge the cost of each resize', why: 'A filter that flips often adds turnover and costs.' },
            { point: 'Test on periods with different kinds of stress', why: 'A filter tuned to one crash may miss the next, which looks different.' },
          ],
          why: 'Regime filters look excellent with hindsight and modest in real time. Building only on what was known each day, and comparing with simple baselines, separates a research result from a story.',
        },
      ],
    },
    {
      id: 'qseries-lab',
      title: 'Lab: forecasting volatility and scoring it out of sample',
      summary: 'Made-up returns with clustering, an AR(1) on squared returns, EWMA and GARCH forecasts, a likelihood fit, and an honest out-of-sample score.',
      text: [
        'This lab builds a volatility forecasting study from scratch. The returns are made up from a GARCH(1,1) with a fixed seed, so there is real clustering to find and you know the true variance. Real returns are less tidy: fat tails, breaks and asymmetry that this simulation leaves out.',
        'Four forecasts compete for the variance of each day, each made with data before that day only: a constant (the in-sample variance), an AR(1) fitted to squared returns, EWMA with λ = 0.94, and GARCH(1,1) fitted by maximum likelihood with variance targeting. All parameters come from the first part of the data; the last part is scored once.',
        'The score is **QLIKE**, `mean(r²/f − ln(r²/f) − 1)` with f the forecast, a loss that ranks forecasts fairly even though r² is a very noisy stand-in for the true variance (Patton, 2011). Lower is better. A lower loss means a better forecast, not a trading profit.',
        'Each step repeats the helpers it needs, so each can be run on its own.',
      ],
      rules: [
        'Fix the seed, and know the truth when you can.',
        'Every forecast for day t uses returns before t only.',
        'Fit every parameter in-sample, including the variance that targeting uses.',
        'Score with a loss that is fair to a noisy proxy, such as QLIKE.',
        'Always include the constant forecast as the baseline to beat.',
      ],
      questions: [
        {
          kind: 'write',
          id: 'qseries-lab-1',
          numpy: true,
          ask: 'Step 1: made-up returns. Write `simulate_garch(n, omega, alpha, beta, seed)`: with `z = np.random.default_rng(seed).standard_normal(n)`, start `v = omega / (1 − alpha − beta)`, and for each t set `var[t] = v`, `r[t] = √v × z[t]`, then `v = omega + alpha × r[t]² + beta × v`. Return `(r, var)`.',
          starter: `import numpy as np

def simulate_garch(n, omega, alpha, beta, seed):
    z = np.random.default_rng(seed).standard_normal(n)
    pass`,
          solution: `import numpy as np

def simulate_garch(n, omega, alpha, beta, seed):
    z = np.random.default_rng(seed).standard_normal(n)
    r, var = np.empty(n), np.empty(n)
    v = omega / (1 - alpha - beta)
    for t in range(n):
        var[t] = v
        r[t] = np.sqrt(v) * z[t]
        v = omega + alpha * r[t] ** 2 + beta * v
    return r, var`,
          tests: `out = simulate_garch(3000, 0.000002, 0.08, 0.9, 0)
assert out is not None, "the function returns nothing yet"
r, var = out
assert r.shape == (3000,) and var.shape == (3000,), "one return and one variance per day"
assert abs(var[0] - 0.0001) < 1e-12, f"start at the long-run variance 0.0001, got {var[0]}"
assert abs(var[1] - (0.000002 + 0.08 * r[0] ** 2 + 0.9 * var[0])) < 1e-15, "var[1] uses r[0] and var[0]"
assert np.allclose(r, simulate_garch(3000, 0.000002, 0.08, 0.9, 0)[0]), "the same seed must give the same returns"
d = r ** 2 - (r ** 2).mean()
assert (d[1:] * d[:-1]).sum() / (d ** 2).sum() > 0.05, "squared returns should be positively autocorrelated (clustering)"`,
          why: 'The variance for day t is set before its shock is drawn, exactly the information a forecaster has. Keeping `var` gives the truth to compare forecasts with, which real data never offers.',
        },
        {
          kind: 'write',
          id: 'qseries-lab-2',
          numpy: true,
          ask: 'Step 2: AR(1) on squared returns. Write `ar1_sq_forecast(r_in, r_all)`: fit `y[t] = c + φ × y[t−1]` by least squares on `y = r_in²`, then return forecasts for every day of `r_all`: `f[0]` = mean of `r_in²`, and `f[t] = c + φ × r_all[t−1]²`, floored at 1e-8.',
          starter: `import numpy as np

def ar1_sq_forecast(r_in, r_all):
    y = np.asarray(r_in, dtype=float) ** 2
    pass`,
          solution: `import numpy as np

def ar1_sq_forecast(r_in, r_all):
    y = np.asarray(r_in, dtype=float) ** 2
    phi, c = np.polyfit(y[:-1], y[1:], 1)
    s = np.asarray(r_all, dtype=float) ** 2
    f = np.empty(len(s))
    f[0] = y.mean()
    f[1:] = c + phi * s[:-1]
    return np.maximum(f, 1e-8)`,
          tests: `out = ar1_sq_forecast([0.01, 0.02, 0.01, 0.02, 0.01], [0.01, 0.02, 0.0])
assert out is not None, "the function returns nothing yet"
assert len(out) == 3, "one forecast per day of r_all"
y = np.array([0.01, 0.02, 0.01, 0.02, 0.01]) ** 2
phi, c = np.polyfit(y[:-1], y[1:], 1)
assert abs(out[0] - y.mean()) < 1e-15, "the first forecast is the in-sample mean of r squared"
assert abs(out[2] - max(c + phi * 0.02 ** 2, 1e-8)) < 1e-15, "f[t] uses r_all[t-1] squared"
assert np.all(ar1_sq_forecast([0.01, 0.02, 0.01, 0.02, 0.01], [0.0, 0.5, 0.0]) >= 1e-8), "forecasts are floored at 1e-8 so a variance is never negative"`,
          why: 'An AR(1) on r² is a crude ARCH(1): it reacts only to yesterday. It is a sensible middle baseline between a constant and the models with memory. The floor matters because a fitted line can go below zero.',
        },
        {
          kind: 'write',
          id: 'qseries-lab-3',
          numpy: true,
          ask: 'Step 3: EWMA. Write `ewma_forecast(r, lam, var0)`: `v[0] = var0`, `v[t] = lam × v[t−1] + (1 − lam) × r[t−1]²`.',
          starter: `import numpy as np

def ewma_forecast(r, lam, var0):
    r = np.asarray(r, dtype=float)
    pass`,
          solution: `import numpy as np

def ewma_forecast(r, lam, var0):
    r = np.asarray(r, dtype=float)
    v = np.empty(len(r))
    v[0] = var0
    for t in range(1, len(r)):
        v[t] = lam * v[t - 1] + (1 - lam) * r[t - 1] ** 2
    return v`,
          tests: `out = ewma_forecast([0.03, 0.0, 0.0], 0.94, 0.0001)
assert out is not None, "the function returns nothing yet"
assert abs(out[1] - 0.000148) < 1e-12, f"0.94*0.0001 + 0.06*0.0009 = 0.000148, got {out[1]}"
assert abs(out[2] - 0.94 * 0.000148) < 1e-12, "a zero return lets the forecast decay by lambda"
assert ewma_forecast([0.0, 0.2], 0.94, 0.0001)[1] == 0.0001 * 0.94, "the forecast for day 1 must not see day 1"`,
          why: 'No parameter to fit beyond λ, which this lab fixes at the RiskMetrics 0.94. It is the forecast many risk systems start from.',
        },
        {
          kind: 'write',
          id: 'qseries-lab-4',
          numpy: true,
          ask: 'Step 4: GARCH with variance targeting. Write `garch_forecast(r, alpha, beta, target)`: `omega = target × (1 − alpha − beta)`, `v[0] = target`, `v[t] = omega + alpha × r[t−1]² + beta × v[t−1]`.',
          starter: `import numpy as np

def garch_forecast(r, alpha, beta, target):
    r = np.asarray(r, dtype=float)
    pass`,
          solution: `import numpy as np

def garch_forecast(r, alpha, beta, target):
    r = np.asarray(r, dtype=float)
    omega = target * (1 - alpha - beta)
    v = np.empty(len(r))
    v[0] = target
    for t in range(1, len(r)):
        v[t] = omega + alpha * r[t - 1] ** 2 + beta * v[t - 1]
    return v`,
          tests: `out = garch_forecast([-0.02, 0.0], 0.08, 0.9, 0.0001)
assert out is not None, "the function returns nothing yet"
assert abs(out[0] - 0.0001) < 1e-12, "start at the target variance"
assert abs(out[1] - 0.000124) < 1e-12, f"omega 0.000002 + 0.08*0.0004 + 0.9*0.0001 = 0.000124, got {out[1]}"
v = garch_forecast(np.full(2000, 0.01), 0.08, 0.9, 0.0001)
assert abs(v[-1] - 0.0001) < 1e-9, "returns of exactly 1% at a 1% target keep the forecast at the target"`,
          why: 'Variance targeting ties ω to a sample variance, so the long-run level is fixed and only α and β are searched. The target must come from in-sample data, which step 7 is about.',
        },
        {
          kind: 'write',
          id: 'qseries-lab-5',
          numpy: true,
          ask: 'Step 5: the loss. Write `qlike(r, f)`: with `x = r² / f`, return `mean(x − ln x − 1)`. Treat r² below 1e-12 as 1e-12 so the log is defined.',
          starter: `import numpy as np

def qlike(r, f):
    r = np.asarray(r, dtype=float)
    f = np.asarray(f, dtype=float)
    pass`,
          solution: `import numpy as np

def qlike(r, f):
    r = np.asarray(r, dtype=float)
    f = np.asarray(f, dtype=float)
    x = np.maximum(r ** 2, 1e-12) / f
    return float(np.mean(x - np.log(x) - 1))`,
          tests: `out = qlike([0.01, -0.02], [0.0001, 0.0004])
assert out is not None, "the function returns nothing yet"
assert abs(out) < 1e-12, f"a forecast equal to r squared every day has zero loss, got {out}"
assert qlike([0.01], [0.0002]) > 0 and qlike([0.01], [0.00005]) > 0, "any miss, over or under, has positive loss"
assert qlike([0.01], [0.00005]) > qlike([0.01], [0.0002]), "QLIKE punishes forecasting too low more than too high by the same factor"
assert np.isfinite(qlike([0.0], [0.0001])), "a zero return must not give an infinite loss"`,
          why: 'x − ln x − 1 is zero at x = 1 and positive elsewhere, and its expected value is smallest when the forecast equals the true variance even though r² is noisy. It penalises under-forecasting risk more, which suits risk management.',
        },
        {
          kind: 'write',
          id: 'qseries-lab-6',
          numpy: true,
          ask: 'Step 6: fit GARCH. Write `fit_garch(r_in)`: with `target = mean(r_in²)`, search α in `np.arange(0.01, 0.31, 0.01)` and β in `np.arange(0.50, 0.995, 0.005)` with α + β < 0.999, compute the Gaussian negative log-likelihood `0.5 × Σ (ln v + r²/v)` of the variance-targeted GARCH on `r_in`, and return the `(alpha, beta)` with the lowest value.',
          starter: `import numpy as np

def garch_forecast(r, alpha, beta, target):
    omega = target * (1 - alpha - beta)
    v = np.empty(len(r))
    v[0] = target
    for t in range(1, len(r)):
        v[t] = omega + alpha * r[t - 1] ** 2 + beta * v[t - 1]
    return v

def fit_garch(r_in):
    r_in = np.asarray(r_in, dtype=float)
    target = np.mean(r_in ** 2)
    pass`,
          solution: `import numpy as np

def garch_forecast(r, alpha, beta, target):
    omega = target * (1 - alpha - beta)
    v = np.empty(len(r))
    v[0] = target
    for t in range(1, len(r)):
        v[t] = omega + alpha * r[t - 1] ** 2 + beta * v[t - 1]
    return v

def fit_garch(r_in):
    r_in = np.asarray(r_in, dtype=float)
    target = np.mean(r_in ** 2)
    best, best_ab = np.inf, None
    for a in np.arange(0.01, 0.31, 0.01):
        for b in np.arange(0.50, 0.995, 0.005):
            if a + b >= 0.999:
                continue
            v = garch_forecast(r_in, a, b, target)
            nll = 0.5 * np.sum(np.log(v) + r_in ** 2 / v)
            if nll < best:
                best, best_ab = nll, (float(a), float(b))
    return best_ab`,
          tests: `rng = np.random.default_rng(11)
z = rng.standard_normal(1500)
r, v = np.empty(1500), 0.0001
for t in range(1500):
    r[t] = np.sqrt(v) * z[t]
    v = 0.000002 + 0.08 * r[t] ** 2 + 0.9 * v
out = fit_garch(r)
assert out is not None, "the function returns nothing yet"
a, b = out
assert a + b < 0.999, "the fit must respect alpha + beta < 0.999"
assert 0.03 <= a <= 0.15, f"alpha should land near the true 0.08, got {a:.3f}"
assert 0.9 <= a + b <= 0.995, f"persistence should be near the true 0.98, got {a + b:.3f}"`,
          hint: 'The constant 0.5 × n × ln 2π does not change which pair wins, so it can be left out.',
          why: 'A grid of a few thousand pairs is slow but transparent; `arch_model(...).fit()` does the same job with an optimiser. Even with 1,500 days the estimates scatter around the truth, one reason fitted parameters move between samples.',
        },
        {
          kind: 'bug',
          id: 'qseries-lab-7',
          ask: 'Step 7: the split. This code is meant to fit on the first `n_in` days and score on the rest. One line lets the out-of-sample period leak into the forecasts.',
          code: `import numpy as np

def split_and_target(r, n_in):
    r = np.asarray(r, dtype=float)
    r_in, r_out = r[:n_in], r[n_in:]
    target = np.mean(r ** 2)
    return r_in, r_out, target`,
          line: 6,
          fix: '    target = np.mean(r_in ** 2)',
          why: "The variance target sets GARCH's long-run level and the constant forecast. Computing it on all the data tells both models the average variance of the period they are about to be scored on, a quiet form of lookahead.",
        },
        {
          kind: 'write',
          id: 'qseries-lab-8',
          numpy: true,
          ask: 'Step 8: score once. Write `score(r, n_in)`: with `r_in = r[:n_in]` and `target = mean(r_in²)`, build four forecasts over all of `r` (constant `target`; EWMA with λ = 0.94 and `var0 = target`; the AR(1) on r² from step 2; GARCH from step 4 with the α, β from `fit_garch(r_in)`), and return a dict of QLIKE on days `n_in` onward with keys `"constant"`, `"ar1"`, `"ewma"`, `"garch"`. The helpers are in the starter.',
          starter: `import numpy as np

def ewma_forecast(r, lam, var0):
    v = np.empty(len(r)); v[0] = var0
    for t in range(1, len(r)):
        v[t] = lam * v[t - 1] + (1 - lam) * r[t - 1] ** 2
    return v

def garch_forecast(r, alpha, beta, target):
    omega = target * (1 - alpha - beta)
    v = np.empty(len(r)); v[0] = target
    for t in range(1, len(r)):
        v[t] = omega + alpha * r[t - 1] ** 2 + beta * v[t - 1]
    return v

def ar1_sq_forecast(r_in, r_all):
    y = r_in ** 2
    phi, c = np.polyfit(y[:-1], y[1:], 1)
    s = r_all ** 2
    f = np.empty(len(s)); f[0] = y.mean(); f[1:] = c + phi * s[:-1]
    return np.maximum(f, 1e-8)

def fit_garch(r_in):
    target = np.mean(r_in ** 2)
    best, best_ab = np.inf, None
    for a in np.arange(0.01, 0.31, 0.01):
        for b in np.arange(0.50, 0.995, 0.005):
            if a + b < 0.999:
                v = garch_forecast(r_in, a, b, target)
                nll = 0.5 * np.sum(np.log(v) + r_in ** 2 / v)
                if nll < best:
                    best, best_ab = nll, (a, b)
    return best_ab

def qlike(r, f):
    x = np.maximum(r ** 2, 1e-12) / f
    return float(np.mean(x - np.log(x) - 1))

def score(r, n_in):
    r = np.asarray(r, dtype=float)
    pass`,
          solution: `import numpy as np

def ewma_forecast(r, lam, var0):
    v = np.empty(len(r)); v[0] = var0
    for t in range(1, len(r)):
        v[t] = lam * v[t - 1] + (1 - lam) * r[t - 1] ** 2
    return v

def garch_forecast(r, alpha, beta, target):
    omega = target * (1 - alpha - beta)
    v = np.empty(len(r)); v[0] = target
    for t in range(1, len(r)):
        v[t] = omega + alpha * r[t - 1] ** 2 + beta * v[t - 1]
    return v

def ar1_sq_forecast(r_in, r_all):
    y = r_in ** 2
    phi, c = np.polyfit(y[:-1], y[1:], 1)
    s = r_all ** 2
    f = np.empty(len(s)); f[0] = y.mean(); f[1:] = c + phi * s[:-1]
    return np.maximum(f, 1e-8)

def fit_garch(r_in):
    target = np.mean(r_in ** 2)
    best, best_ab = np.inf, None
    for a in np.arange(0.01, 0.31, 0.01):
        for b in np.arange(0.50, 0.995, 0.005):
            if a + b < 0.999:
                v = garch_forecast(r_in, a, b, target)
                nll = 0.5 * np.sum(np.log(v) + r_in ** 2 / v)
                if nll < best:
                    best, best_ab = nll, (a, b)
    return best_ab

def qlike(r, f):
    x = np.maximum(r ** 2, 1e-12) / f
    return float(np.mean(x - np.log(x) - 1))

def score(r, n_in):
    r = np.asarray(r, dtype=float)
    r_in = r[:n_in]
    target = np.mean(r_in ** 2)
    a, b = fit_garch(r_in)
    f = {
        "constant": np.full(len(r), target),
        "ar1": ar1_sq_forecast(r_in, r),
        "ewma": ewma_forecast(r, 0.94, target),
        "garch": garch_forecast(r, a, b, target),
    }
    return {k: qlike(r[n_in:], v[n_in:]) for k, v in f.items()}`,
          tests: `rng = np.random.default_rng(21)
z = rng.standard_normal(3000)
r, v = np.empty(3000), 0.0001
for t in range(3000):
    r[t] = np.sqrt(v) * z[t]
    v = 0.000002 + 0.08 * r[t] ** 2 + 0.9 * v
out = score(r, 2000)
assert out is not None, "the function returns nothing yet"
assert set(out) == {"constant", "ar1", "ewma", "garch"}, f"four forecasts, got {sorted(out)}"
assert out["garch"] < out["constant"], "on GARCH data, a fitted GARCH should beat the constant out of sample"
assert out["ewma"] < out["constant"], "EWMA should also beat the constant when volatility clusters"
assert abs(out["constant"] - qlike(r[2000:], np.full(1000, np.mean(r[:2000] ** 2)))) < 1e-12, "the constant uses the in-sample mean of r squared"
e = rng.normal(0, 0.01, 3000)
calm = score(e, 2000)
assert calm["garch"] > calm["constant"] - 0.02, "on returns with constant volatility, GARCH should not clearly beat the constant"`,
          why: 'The last test is the control: on returns with no clustering a correct pipeline finds no real advantage. If GARCH had won by a wide margin there, the code would be leaking information.',
        },
        {
          kind: 'design',
          id: 'qseries-lab-9',
          ask: 'Step 9: you run the same study on ten years of real daily SPY returns and GARCH wins by a small margin in QLIKE. Write down what you would report, and what you would not claim.',
          checklist: [
            { point: 'The losses of all four forecasts, with the constant as the baseline', why: 'A win only means something next to the simplest alternative.' },
            { point: 'Whether the difference is larger than its noise, for example a Diebold-Mariano style test on the daily loss differences', why: 'Small gaps in average loss are often within sampling error.' },
            { point: 'The scores with realised variance from intraday data as the target, if available', why: 'A less noisy proxy sharpens the comparison.' },
            { point: 'Results in calm and stressed sub-periods', why: 'A model that wins on average can lose badly in the periods that matter.' },
            { point: 'That parameters were fitted only on the in-sample years and the holdout scored once', why: 'Re-scoring after tweaks turns the holdout into in-sample data.' },
            { point: 'No claim of a trading profit', why: 'A better volatility forecast is an input to sizing or option pricing, not an edge by itself.' },
            { point: "The model's known gaps: asymmetry, fat tails, scheduled events", why: 'Readers need to know where the forecast will be wrong.' },
          ],
          why: "The honest result of a forecasting study is a ranking with its uncertainty and its limits. The lab's simulated win was guaranteed by construction; real data gives smaller, less stable margins.",
        },
      ],
    },
  ],
}
