import type { Block } from '../../types'

/** The full theory for each lesson of the quant module, keyed by lesson id. */
export const quantTheory: Record<string, Block[]> = {
  'quant-returns': [
    { h: 'Why research starts from returns' },
    'A **price** on its own says little. A $1 move is large for a $10 stock and tiny for a $500 one. Quantitative research, the business of testing trading ideas with numbers, therefore works with **returns**: how much a price changed relative to where it was. Returns put every stock, every period and every strategy on one scale, so they can be averaged, compared and tested.',

    { h: 'Simple returns and log returns' },
    { sub: 'The simple return' },
    'The **simple return** from a price p0 to a later price p1 is `p1 / p0 − 1`. A stock that goes from $200 to $210 has a simple return of 0.05, or 5%. This is the number a broker statement shows.',
    { sub: 'The log return' },
    'The **log return** is `ln(p1 / p0)`, the natural logarithm of the price ratio. The volatility module used it to measure realised volatility. For small moves the two are almost equal; for large moves they part: a simple return of +5% is a log return of about +4.88%.',
    {
      code: `import numpy as np

p = np.array([200.0, 210.0, 199.5])
simple = p[1:] / p[:-1] - 1
logr = np.log(p[1:] / p[:-1])
print(simple.round(4).tolist())
print(round(np.prod(1 + simple) - 1, 4), round(logr.sum(), 4))`,
      out: `[0.05, -0.05]
-0.0025 -0.0025`,
    },
    'The stock rose 5% and then fell 5%, and ended a quarter of a percent lower. The second line shows both routes to the total: multiply `(1 + r)` for simple returns, or add log returns.',
    { sub: 'Which one for which job' },
    'Log returns **add over time**: the log return of a month is the sum of its daily log returns. That makes them the natural choice for time series work. Simple returns **add across assets**: if 30% of your money is in a stock that rose 4% and 70% in one that fell 2%, the portfolio made 0.3 × 4% − 0.7 × 2% = −0.2%. Averaging log returns across holdings gives a slightly wrong number that no account ever had. NumPy has `np.log1p(r)`, which turns a simple return r into a log return, and `np.expm1(x)`, which turns a log return back.',

    { h: 'Compounding and volatility drag' },
    'The **arithmetic mean** of returns is their plain average. It is not the rate at which money grows. A year of +20% followed by a year of −20% averages 0%, but 1.2 × 0.8 = 0.96, so 4% is gone.',
    'A useful approximation links the two. If returns have arithmetic mean μ and standard deviation σ per period, the compound growth rate in log terms is about `μ − σ²/2`. This gap is called **volatility drag**. A strategy averaging 8% a year with 20% volatility grows at roughly 8% − 2% = 6% a year. Higher volatility costs compound growth even when the average return is unchanged, which is one reason quants care about risk and not only about average return.',

    { h: 'The normal curve and how rare big days should be' },
    'The **normal distribution** is the bell curve. If returns followed it, you could say how often a move of any size happens from its mean and its standard deviation σ alone. A move of k standard deviations is called a kσ move. The chance of landing within kσ of the mean comes from the normal **cumulative distribution function**, Φ, which the standard library gives through the error function: `Φ(x) = 0.5 × (1 + erf(x / √2))`.',
    {
      code: `import math

phi = lambda x: 0.5 * (1 + math.erf(x / math.sqrt(2)))
for k in (1, 2, 3):
    print(k, round(2 * (1 - phi(k)), 4))`,
      out: `1 0.3173
2 0.0455
3 0.0027`,
    },
    'Each line is the chance of a move beyond kσ, up or down, on one day. A 3σ day should come about once in 370 days, roughly once every year and a half of trading. Dividing 1 by the daily chance, and then by 252 trading days, turns a probability into "once every so many years".',

    { h: 'Fat tails and kurtosis' },
    { sub: 'What real returns look like' },
    'Real daily returns are not normal. They have **fat tails**: more very quiet days and more very violent days than a normal curve with the same σ. On 19 October 1987 the S&P 500 fell about 20% in a day. At the volatility of the time that was around a 20σ move, which a normal curve says should essentially never happen. Smaller cases, 4σ and 5σ days, turn up many times in any long history.',
    { sub: 'Measuring tail thickness' },
    '**Kurtosis** measures how much of a distribution sits in its tails: `mean((r − m)⁴) ÷ v²`, where m is the mean and v the variance computed with `ddof=0` (dividing by n). A normal curve has kurtosis 3, so quants usually quote **excess kurtosis**, the same number minus 3. Normal gives 0; daily stock returns typically give well above 0. The fourth power makes a few big days dominate, so the number jumps around on small samples.',
    'A more direct check is to count. Standardise the returns into z-scores, count how many lie beyond 3σ or 4σ, and compare with n × 2 × (1 − Φ(k)), the count a normal curve expects. In the figure the returns come from a **Student t** distribution, a fat-tailed curve whose tail thickness is set by its **degrees of freedom**: few degrees of freedom, fat tails; many, close to normal.',

    { h: 'Why it matters on a trading day' },
    'Stops, position sizes, value-at-risk limits and option prices all lean on a guess of how big a bad day can be. If the guess comes from a bell curve, it understates the big days. Selling options, which collects small premiums and occasionally pays out large losses, is the clearest case: the rare day the normal curve calls impossible is the day that empties the account.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Adding simple returns over time instead of compounding them.',
        'Averaging log returns across the holdings of a portfolio.',
        'Judging a strategy by its average return and ignoring the drag of its volatility.',
        'Trusting a 1-in-a-thousand-years estimate from a normal curve.',
      ],
    },
  ],

  'quant-signal': [
    { h: 'The question behind every backtest' },
    'A backtest gives an average return above zero. Either the strategy has an edge, or it was luck. Statistics cannot prove an edge, but it can say how often luck alone would produce a result like yours. The starting point is the **null hypothesis**: the dull explanation that the true mean return is zero. A test asks how surprising your data would be if the null were true.',

    { h: 'The t statistic of a mean return' },
    { sub: 'The standard error' },
    'The average of n returns wanders around the true mean. How far it wanders is its **standard error**: `s ÷ √n`, where s is the sample standard deviation of the returns (`ddof=1`, dividing by n − 1). The backtest module used the same idea for a list of R multiples.',
    { sub: 'Standard errors from zero' },
    'The **t statistic** is the mean divided by its standard error: how many standard errors the average sits from zero. Take 400 daily returns with mean 0.06% and standard deviation 1.2%. The standard error is 1.2% ÷ 20 = 0.06%, so t = 1.0.',
    {
      code: `import math

mean, sd, n = 0.0006, 0.012, 400
t = mean / (sd / math.sqrt(n))
print(round(t, 2))`,
      out: `1.0`,
    },
    'A t of 1 is ordinary noise. Notice how n enters: four times the data halves the standard error and doubles t for the same average.',

    { h: 'From t to a p-value' },
    { sub: 'The normal approximation' },
    'The **p-value** is the chance, if the null were true, of a t at least as far from zero as yours. With more than about 30 returns, t behaves close to a normal variable, so the **two-sided** p-value, counting surprises in either direction, is `2 × (1 − Φ(|t|))`, with Φ the normal CDF from the previous lesson. t = 1 gives 0.32, t = 2 about 0.046, t = 3 about 0.0027. A **one-sided** p-value counts only one direction and is half as large; it is only fair if you fixed the direction before seeing the data.',
    { sub: 'What a p-value is not' },
    'A p-value of 0.04 does not mean a 4% chance that the strategy has no edge, nor a 96% chance that it works. It is computed assuming no edge. Whether an edge is real also depends on how plausible the idea was and how many ideas you tried before it.',

    { h: 'Testing many ideas' },
    'Each test at the 5% level has a 5% chance of a false alarm when there is no edge. Run m independent tests and the chance of at least one false alarm is `1 − 0.95^m`. For 10 tests that is 40%. Every parameter value, filter and variation you try counts as a test, even the ones you throw away.',
    'The **Bonferroni correction** keeps the overall false-alarm chance at 5% by testing each idea at `0.05 ÷ m`. For 10 ideas that is 0.005, which needs |t| above about 2.8. It is strict when the tests overlap, but it is a safe default. Harvey, Liu and Zhu (2016) argued, for the same reason, that a newly claimed return factor in finance should clear t = 3 rather than 2.',

    { h: 'A sign-flip test' },
    'The t-test leans on the normal curve, and returns have fat tails. A **sign-flip test** avoids that assumption. If the true mean were zero and returns were symmetric, each return would be as likely to be negative as positive. So flip the sign of each return at random, recompute the mean, repeat thousands of times, and see what share of the flipped means are at least as far from zero as the real one. That share is the p-value. `rng.choice([-1.0, 1.0], size=(n_sims, n))` draws all the signs at once.',
    {
      code: `import numpy as np

r = np.array([0.012, -0.004, 0.009, 0.006, -0.002, 0.011, 0.003, -0.001])
rng = np.random.default_rng(0)
signs = rng.choice([-1.0, 1.0], size=(20000, len(r)))
sims = np.abs((signs * r).mean(axis=1))
print(round(float((sims >= abs(r.mean())).mean()), 2))`,
      out: `0.12`,
    },
    'Here about 12% of the flipped means are as far from zero as the real one: eight returns, mostly positive, are still too few to rule out luck.',

    { h: 'Why found edges shrink' },
    'Most patterns found in market data are noise, and the real ones fade. McLean and Pontiff (2016) studied 97 published stock return predictors and found their returns about 26% lower out-of-sample and about 58% lower after publication, as investors learned of them and traded them away. Trading costs then take a further share, and an individual competes with firms that have better data, faster systems and cheaper execution. Treat a t of 2 as a reason to keep testing, not to trade.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Reading a p-value as the chance the strategy works.',
        'Using a one-sided test without having fixed the direction in advance.',
        'Reporting the best of many tries as if it were the only one.',
        'Forgetting that published results are the survivors of many unpublished ones.',
      ],
    },
  ],

  'quant-series': [
    { h: 'Prices through time' },
    'A **time series** is a sequence of values in time order: daily closes, minute returns, a strategy\'s daily profit. The order matters. The question this lesson asks is whether the past of a series tells you anything about its next value.',

    { h: 'The random walk' },
    'In a **random walk** each step is independent of every step before: `p[t] = p[t−1] + ε[t]`, where ε is random noise with mean zero. Knowing every past step tells you nothing about the next. Random walks still produce trends, double tops and levels that seem to hold, because long runs happen by chance. That is why the random walk is the **null model** for prices: a pattern only counts as interesting if it would be unusual in a random walk.',

    { h: 'Autocorrelation' },
    { sub: 'Correlation, briefly' },
    '**Correlation** measures how two series move together, from −1 (always opposite) through 0 (unrelated) to +1 (always together). `np.corrcoef(a, b)[0, 1]` computes it.',
    { sub: 'A series against its own past' },
    'The **autocorrelation at lag k** is the correlation between the series and itself k steps earlier. With NumPy slices, `r[:-k]` holds the earlier values and `r[k:]` the values k steps later, lined up item by item.',
    {
      code: `import numpy as np

r = np.array([0.5, 0.3, -0.2, -0.4, 0.1, 0.4, 0.2, -0.3])
lag = 1
print(round(np.corrcoef(r[:-lag], r[lag:])[0, 1], 2))`,
      out: `0.29`,
    },
    { sub: 'The noise band' },
    'Even a true random walk gives a sample autocorrelation that is not exactly zero. With n returns its standard error is about `1 ÷ √n`, so values inside ±2/√n are what noise produces. For 900 returns the band is ±0.067.',

    { h: 'Momentum and mean reversion' },
    'Positive lag-1 autocorrelation means a move tends to be followed by a move the same way: **momentum**, or trending. Negative means the next move tends to undo it: **mean reversion**. A simple model of either is `r[t] = φ × r[t−1] + ε[t]`, where φ (phi) is close to the lag-1 autocorrelation. Its forecast for tomorrow is φ times today\'s return: with φ = 0.2 and a −1% day, the forecast is −0.2%.',
    'Two rules bet on it. **Following** holds +1 after an up day and −1 after a down day, using `np.sign` of yesterday\'s return; **fading** does the opposite. The position for day t must come from day t − 1: pair `np.sign(r[:-1])` with `r[1:]`.',

    { h: 'The variance ratio' },
    'The **variance ratio** measures the same thing over a horizon of q periods: `VR(q) = variance of q-period returns ÷ (q × variance of 1-period returns)`. In a random walk variances add, so VR is 1. If moves undo each other, q-period moves are smaller and VR is below 1; if they build on each other, above 1. For two periods it works out as `VR(2) = 1 + ρ1`, with ρ1 the lag-1 autocorrelation, because the variance of a two-day return is 2σ² plus twice the covariance between the days.',
    'Overlapping q-period sums are quick to get from a running total that starts at 0: `c[q:] − c[:-q]`.',
    {
      code: `import numpy as np

r = np.array([1.0, 2.0, 3.0, 4.0, 5.0])
c = np.concatenate([[0.0], np.cumsum(r)])
print((c[3:] - c[:-3]).tolist())`,
      out: `[6.0, 9.0, 12.0]`,
    },

    { h: 'Stationarity and spurious correlation' },
    'A series is **stationary** if its mean, its variance and its autocorrelations stay the same over time. Prices are not stationary: a random walk has no fixed level, and its spread grows with time. Returns are much closer, though their volatility changes with the market. Statistics that assume a stable mean, such as a z-score or a correlation, belong on stationary series.',
    'Ignore this and you find **spurious correlations**. Two independent random walks that happen to drift the same way can show a correlation of price levels of 0.8 or more, while the correlation of their returns is near zero. Correlate returns, not prices.',

    { h: 'What real markets show' },
    'Daily returns of broad indexes have autocorrelations very close to zero. Research reports weak trend-following over months in many futures markets and short-term reversal in individual stocks; both effects are small and shrink after costs. A large autocorrelation in your own backtest is more often a lookahead bug than a discovery.',
  ],

  'quant-sharpe': [
    { h: 'Return for the risk taken' },
    'Two strategies both made 10% last year. One swung up and down 5% a month, the other 0.5%. They are not equally good: the second earned the same with far less risk, and could be sized up. The **Sharpe ratio** puts return and risk in one number: `(mean return − risk-free rate) ÷ standard deviation of returns`. The **risk-free rate** is what cash earns. For intraday strategies that hold no position overnight, many people leave it out; say which you did.',

    { h: 'Annualising' },
    { sub: 'Why the square root' },
    'Sharpe ratios are quoted per year, but most strategies are measured daily. Over 252 trading days the mean adds up, so the annual mean is about 252 times the daily mean. Variance also adds up, so the annual variance is 252 times the daily variance and the annual standard deviation is √252 ≈ 15.9 times the daily one. Their ratio, the Sharpe, therefore grows by 252 ÷ √252 = √252.',
    { sub: 'A worked example' },
    'Daily mean 0.05%, daily standard deviation 1.5%: the daily Sharpe is 0.033, and the annual Sharpe about 0.033 × 15.9 ≈ 0.53. This only holds if days are independent. If returns are autocorrelated, for example a strategy whose gains come in streaks, the √252 rule misstates the annual figure.',

    { h: 'Sortino and downside deviation' },
    'Standard deviation treats a big up day as risk. The **Sortino ratio** counts only the bad side: `mean ÷ downside deviation`, where the **downside deviation** is `√(mean(min(r, 0)²))` over all periods. Good periods enter as zeros; they still count in the average. With returns 3%, −2%, 1%, −1%: the mean is 0.25%; the squared downside values are 0.0004 and 0.0001, their average over four periods is 0.000125, and its square root is about 1.12%. Sortino ≈ 0.22 per period. `np.minimum(r, 0)` replaces every positive value with 0.',

    { h: 'Drawdown when returns compound' },
    'The backtest module measured drawdown on a running total of R. For percentage returns that compound, build the **equity curve** with a product: start at 1 and multiply by (1 + r) each period, `np.cumprod(1 + r)`. The drawdown at each point is `1 − equity ÷ running peak`, with the peak from `np.maximum.accumulate`. Put the starting 1 in front so a loss on the first day counts.',
    {
      code: `import numpy as np

r = np.array([0.05, -0.08, 0.02, -0.03])
equity = np.concatenate([[1.0], np.cumprod(1 + r)])
peak = np.maximum.accumulate(equity)
print(equity.round(4).tolist())
print(round(float((1 - equity / peak).max()), 4))`,
      out: `[1.0, 1.05, 0.966, 0.9853, 0.9558]
0.0898`,
    },

    { h: 'How uncertain a Sharpe ratio is' },
    { sub: 'The standard error' },
    'A measured Sharpe is an estimate, and a noisy one. With daily returns that are independent, the standard error of an annualised Sharpe is about `1 ÷ √years`. After 2 years of data a measured 0.8 has a standard error of about 0.71, so a rough 95% range, two standard errors either side, runs from about −0.6 to 2.2. Fat tails widen it further.',
    { sub: 'Sharpe and the t statistic' },
    'The t statistic of the mean daily return is the daily Sharpe times √n. With n = 252 × years, that is `t ≈ annual Sharpe × √years`. So the Sharpe ratio and the evidence for an edge are linked by time: a modest Sharpe needs many years before its t passes 2, and a short sample cannot confirm even a high one. Choosing the best of many backtests inflates the winner further; the **deflated Sharpe ratio** of Bailey and López de Prado adjusts for the number of trials.',

    { h: 'What Sharpe cannot see' },
    'Sharpe uses only the mean and standard deviation of the sample. A strategy that sells options far from the money earns small, steady gains and rare large losses. In a sample without the large loss it shows a high Sharpe and a tiny standard deviation. The risk is real but invisible to the ratio. Always read it beside the worst day, the maximum drawdown and the excess kurtosis.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Multiplying a daily Sharpe by 252 instead of √252.',
        'Computing downside deviation from the losing days only, which measures how losses differ rather than how big they are.',
        'Comparing a two-month Sharpe with a ten-year one as if they were equally reliable.',
        'Trusting a high Sharpe from a strategy that sells tail risk.',
      ],
    },
  ],

  'quant-features': [
    { h: 'Features and signals' },
    'A **feature** is a number you can compute at time t from data up to t: the stock\'s return over the last 5 days, its distance from VWAP, today\'s volume divided by its 20-day average. A **signal** turns one or more features into a forecast of the next return, or straight into a position. Machine learning calls the same things features and predictions. The rule from the backtest module applies to every feature: if it could not have been computed before the trade, it is lookahead.',

    { h: 'Putting features on one scale' },
    { sub: 'Time-series z-scores' },
    'A 2% five-day return is huge for a utility and ordinary for a small biotech. A **time-series z-score** compares today\'s value with the same asset\'s own history: `(x − mean of past window) ÷ standard deviation of past window`. A z of 1.5 means one and a half standard deviations above its usual level. The window must end at or before today.',
    { sub: 'Cross-sectional z-scores and ranks' },
    'A **cross-sectional** measure compares assets with each other on the same day. With features in a NumPy array of shape (days, assets), the cross-sectional z-score subtracts each row\'s mean and divides by each row\'s standard deviation: `x.mean(axis=1, keepdims=True)` keeps the shape so the result lines up with every value in the row. A **rank** replaces each value by its position in sorted order; `np.argsort(np.argsort(x))` gives 0 for the smallest. Ranks ignore outliers: a stock up 60% on takeover news is ranked first, no more.',

    { h: 'The information coefficient' },
    'The **information coefficient (IC)** measures how well a signal predicts: the correlation between the signal at t and the return from t to the next period. Line them up carefully: the signal of day t goes with the return of day t + 1. The **rank IC** is the correlation of the ranks of both, known as the **Spearman correlation**, which is less sensitive to a few extreme returns.',
    {
      code: `import numpy as np

signal = np.array([1.2, -0.5, 0.3, 2.0, -1.1, 0.0])
fwd = np.array([0.004, -0.010, 0.006, 0.002, -0.003, -0.001])
a = np.argsort(np.argsort(signal))
b = np.argsort(np.argsort(fwd))
print(round(float(np.corrcoef(a, b)[0, 1]), 2))`,
      out: `0.71`,
    },
    'In practice you compute one cross-sectional IC per day, across many stocks, and study the series of daily ICs: their mean, and the t statistic of that mean. ICs of 0.02 to 0.05 are a common rule of thumb for a useful daily stock signal. That looks tiny, because daily returns are mostly noise that no signal can predict.',

    { h: 'How much a small IC is worth' },
    'The **information ratio** is the Sharpe ratio of the return a signal adds over its benchmark. Grinold\'s **fundamental law of active management** says it is about `IC × √breadth`, where **breadth** is the number of independent bets a year. An IC of 0.03 with 250 independent bets gives about 0.03 × 15.8 ≈ 0.47. The catch is independence: a hundred trades on stocks that all move with the market are far fewer independent bets, so treat the law as an upper guide.',

    { h: 'Combining weak signals' },
    'Average k standardised signals, each with IC c, where every pair of signals is correlated at ρ. The IC of the average is `c × √k ÷ √(1 + (k − 1)ρ)`. With nine uncorrelated signals of IC 0.02 the average reaches 0.02 × 3 = 0.06. If they are correlated at 0.3, it is 0.06 ÷ √3.4 ≈ 0.033. Signals built from different information (price, volume, fundamentals) are less correlated, so they combine better than variations of one idea.',

    { h: 'Decay' },
    { sub: 'Decay with horizon' },
    'Compute the IC against returns 1, 2, 5 and 10 days ahead and plot it. A signal whose IC falls fast holds its information only briefly. To use it you must trade often, so its **turnover**, how much of the book changes hands, is high, and so are its costs.',
    { sub: 'Decay through time' },
    'Signals also lose strength over the years, as more people find and trade them. Compare the IC on recent data with the IC on old data. A signal that worked in the 1990s and not since is a history lesson.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Pairing the signal with the same day\'s return, which measures description, not prediction.',
        'Standardising with statistics from the whole data set, future included.',
        'Combining five versions of one idea and expecting five ideas\' worth of IC.',
        'Ignoring the cost of trading a fast-decaying signal.',
      ],
    },
  ],

  'quant-pairs': [
    { h: 'The idea of a pair' },
    'Some stocks are tied by their business. KO and PEP sell similar drinks to similar customers; two large oil producers both follow the oil price. Each stock wanders like a random walk, but the gap between them might not. A **pairs trade** buys one and sells the other when the gap looks too wide or too narrow, betting it will return to normal. Because one leg is long and the other short, a move of the whole market mostly cancels out.',

    { h: 'The spread and the hedge ratio' },
    'Work in log prices. The **spread** is `s = ln A − β × ln B`, where β is the **hedge ratio**. Estimate β by a least-squares regression of ln A on ln B with an intercept: the slope is `cov(a, b) ÷ var(b)`, the covariance of the two series divided by the variance of ln B. In log terms β says how many percent A tends to move for a 1% move in B, so it is the dollars of B to hold against each dollar of A. With β = 1.2 and $10,000 of A bought, you sell about $12,000 of B.',
    'Fit β on a window of past data and use it going forward. A β fitted on the whole history, test period included, uses the future and makes the spread look more stable than it was.',

    { h: 'Cointegration in plain words' },
    'Two series are **cointegrated** when each wanders without a fixed level but some combination of them, here the spread, is **stationary**: it keeps returning to a mean. The usual picture is a walker and a dog on a lead. Each goes where it likes, but they never get far apart.',
    { sub: 'Correlation is not cointegration' },
    'Correlation is about daily moves; cointegration is about levels. If company A grows a little faster than B every year, their daily returns can stay highly correlated while the gap between their prices widens for ever. Highly correlated returns are not enough: test the spread itself. The standard approach, due to Engle and Granger, fits β and then tests whether the spread mean-reverts.',

    { h: 'How fast the spread reverts' },
    { sub: 'The regression' },
    'Regress each day\'s change in the spread on the previous day\'s level: `Δs[t] = a + b × s[t−1]`. If b is negative, the spread is pulled back towards its mean. A b of −0.2 means about 20% of any gap closes each day.',
    { sub: 'The half-life' },
    'Each day the fraction (1 + b) of the gap remains, so after h days (1 + b)^h is left. Setting that to one half gives the **half-life**: `h = −ln 2 ÷ ln(1 + b)`. For b = −0.2, h = 0.693 ÷ 0.223 ≈ 3.1 days.',
    {
      code: `import numpy as np

s = np.array([0.08, 0.06, 0.05, 0.035, 0.03, 0.02, 0.018, 0.012])
x, dy = s[:-1], np.diff(s)
b = ((x - x.mean()) * (dy - dy.mean())).sum() / ((x - x.mean()) ** 2).sum()
print(round(b, 2), round(float(-np.log(2) / np.log(1 + b)), 1))`,
      out: `-0.24 2.6`,
    },
    'A half-life of a few days suits a short-term trade. One of several months ties up capital and leaves time for the relationship to change.',

    { h: 'Trading the z-score' },
    { sub: 'Entries and exits' },
    'Measure how stretched the spread is with its z-score over a past window: `(s − mean) ÷ standard deviation`. A common rule: when z rises above +2, **short the spread** (sell A, buy β of B); when it falls below −2, **buy the spread**. Hold until z crosses back through 0. The rule is a small **state machine**: what a z of 1 means depends on whether you are short, long or flat, so the code must remember the current position.',
    { sub: 'Stops' },
    'Add a stop for when the spread keeps widening, for example at |z| > 4, and a **time stop** that closes a trade after a few half-lives whatever the z-score says.',

    { h: 'How pairs break and what they cost' },
    'Relationships end. A takeover, a lawsuit, a failed product or a change in what a company sells can turn a stationary spread into a random walk with a drift. The z-score rule then fades a move that is not coming back, and keeps holding or reopening the losing side. Stops are what limit that loss.',
    'Costs are larger than for one stock: two legs going in and two coming out, four fills per round trip, plus a fee to borrow the stock you sell short. And if you screened hundreds of pairs to find the few that passed a cointegration test, some passed by chance, which is the multiple-testing problem from earlier in the module.',
  ],

  'quant-portfolio': [
    { h: 'Why combine positions' },
    'One small edge is a noisy thing to live on. Several edges, or the same edge on many stocks, can add up to something steadier, because their random parts partly cancel. How much they cancel depends on one number: the correlation between them.',

    { h: 'Correlation and portfolio volatility' },
    { sub: 'Two positions' },
    'For weights w (the fraction of capital in each position) and a **covariance matrix** C, whose entries are the correlation of each pair times their two volatilities, the portfolio variance is `w · C · w`. NumPy writes it `w @ cov @ w`, and `np.outer(vol, vol)` builds the matrix of volatility products.',
    {
      code: `import numpy as np

w = np.array([0.5, 0.5])
vol = np.array([0.30, 0.10])
corr = np.array([[1.0, 0.2], [0.2, 1.0]])
cov = corr * np.outer(vol, vol)
print(round(float(np.sqrt(w @ cov @ w)), 3))`,
      out: `0.167`,
    },
    'Half in a position with 30% volatility and half in one with 10%, correlated at 0.2, gives about 16.7%, well below the 20% average of the two.',
    { sub: 'Many positions' },
    'For n positions of equal size and volatility σ with average pairwise correlation ρ, the portfolio volatility is `σ × √(ρ + (1 − ρ) ÷ n)`. With σ = 30%, ρ = 0.3 and n = 20, that is 30% × √0.335 ≈ 17.4%. As n grows, the second term vanishes and the volatility approaches `σ × √ρ`, here about 16.4%. The shared part of the risk cannot be diversified away. Worse, correlations tend to rise in sell-offs, when forced selling moves everything together.',

    { h: 'Combining strategies' },
    'Strategies combine like positions. If k strategies each have Sharpe ratio S, are uncorrelated and are sized to equal risk, their returns add k times while the noise grows only √k times, so the combined Sharpe is `S × √k`. Nine uncorrelated strategies with a Sharpe of 0.3 each make one of about 0.9. Correlation between them reduces the gain.',

    { h: 'Volatility targeting' },
    '**Volatility targeting** sizes a position so its expected volatility stays at a chosen level: `weight = target volatility ÷ forecast volatility`. The forecast is usually recent realised volatility, the annualised standard deviation of the last 20 or 60 daily returns, which the volatility module covered. With a 15% target and a forecast of 30%, hold half your capital. Two rules keep it honest: the window must end the day before the weight is used, and a **leverage cap** stops a calm spell from blowing the weight up shortly before volatility returns.',

    { h: 'Turnover and costs' },
    '**Turnover** is the value you trade in a year divided by your capital. A strategy that replaces its whole book every week has a turnover of about 52 for the buys alone. Annual cost is about `turnover × cost per dollar traded`, where the cost per dollar includes half the spread, fees and slippage. At a turnover of 20 and 0.1% a trade, costs are 2% a year. Subtract them from the gross return before computing the Sharpe ratio: the **net** Sharpe is the one that matters.',

    { h: 'Capacity and competition' },
    { sub: 'Market impact' },
    'Large orders move prices. A widely used rule of thumb, the **square-root law**, says the impact cost per dollar traded is about a constant times the daily volatility times `√(order size ÷ daily volume)`. Four times the size means twice the cost per dollar, and eight times the total cost. Since the edge per dollar stays the same while the cost per dollar rises, every strategy has a **capacity**: a size beyond which costs eat the edge.',
    { sub: 'Who you are trading against' },
    'Quant firms have better data, faster systems, lower costs and teams of researchers. The large, liquid, fast edges go to them. An individual has a cost and speed disadvantage but also a size advantage: small accounts can trade edges too small for a fund to bother with, at slower horizons where speed matters less. How orders are actually sent, sliced and executed is the subject of the next module.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Adding up position volatilities as if correlation were 1, or assuming it is 0.',
        'Using calm-period correlations to plan for a crash.',
        'Sizing with a volatility forecast that includes the day being traded.',
        'Quoting a gross Sharpe for a high-turnover strategy.',
      ],
    },
  ],

  'quant-lab': [
    { h: 'What the lab builds' },
    'The lab takes one idea, **short-term mean reversion**, through the whole research process in NumPy. The signal is the z-score of the price against its own recent average. Above the average by more than a threshold, go short; below, go long. The steps are: generate prices, build the signal, turn it into positions, line positions up with returns, charge costs, measure the result, and choose a setting in-sample before scoring it out-of-sample. The backtest module covered in-sample and out-of-sample splits; here they are applied to a return series instead of a trade list.',

    { h: 'Prices with a known answer' },
    'Testing a pipeline on real prices first is a mistake: if it finds an edge you cannot tell whether the edge or a bug is responsible. Made-up prices with a known structure fix that. The lab\'s prices are a random walk plus a small **wobble**, u, that follows `u[t] = φ × u[t−1] + shock[t]`. With φ between 0 and 1, the wobble is pulled back towards zero, which puts a faint mean reversion into the returns.',
    { sub: 'Reproducible randomness' },
    'A **seed** fixes the random numbers, so every run gives the same series. The order of draws matters too: drawing the walk steps and then the shocks gives different series from the other order, even with the same seed. Setting φ and the noise to zero leaves the same walk with no wobble, a control with no edge in it.',

    { h: 'The signal and its lookahead test' },
    'The z-score at t uses the window of prices from `t − window + 1` to t inclusive. The close at t is known when the decision is made at that close, so including it is fair; anything later is not. Before the first full window the value is `nan`, "not a number".',
    'The simplest lookahead test there is: change a price late in the series and check that the signal at earlier times does not move. Use it on every feature you write.',

    { h: 'Positions and lining them up' },
    { sub: 'From z to a position' },
    'The position is −1 where z is above the entry level, +1 where it is below minus the entry, and 0 elsewhere. Comparisons with `nan` are always False, so the start of the series is flat with no special case.',
    { sub: 'The alignment' },
    'The position decided at the close of day t earns the return from close t to close t + 1. With `ret = np.diff(np.log(p))`, `ret[t]` is exactly that return, and the position array is one longer than the return array, so the earning positions are `pos[:-1]`.',
    {
      code: `import numpy as np

p = np.array([100.0, 102.0, 101.0, 103.0])
ret = np.diff(np.log(p))
pos = np.array([1.0, 0.0, -1.0, 0.0])
print(len(ret), len(pos[:-1]))`,
      out: `3 3`,
    },
    'Shift the positions by one in either direction and the result is nonsense: one way trades on returns already known, the other charges each decision with the move that caused it. Both produce Sharpe ratios no real strategy shows. As a rule of thumb, an annualised Sharpe beyond about 4 in either direction on daily data calls for a hunt for this bug.',

    { h: 'Costs on every change' },
    'Each change of position is a trade. Its size is `|pos[t] − pos[t−1]|`, with a position of 0 before the start: entering is 1, closing is 1, flipping from long to short is 2. `np.diff(pos, prepend=0)` gives the changes with that starting 0. Subtract cost times the trade size from each period\'s return.',
    {
      code: `import numpy as np

pos = np.array([1.0, 0.0, -1.0, 0.0])
print(np.abs(np.diff(pos, prepend=0))[:-1].tolist())`,
      out: `[1.0, 1.0, 1.0]`,
    },

    { h: 'The verdict and the control' },
    'Report the annualised Sharpe ratio, the mean over the standard deviation times √252, together with its t statistic, the same ratio times √n. Then choose the window that did best on the first part of the data and score that one choice, once, on the rest. Finally run the identical code on the control series with no wobble. A correct pipeline finds nothing there.',

    { h: 'Reading the result honestly' },
    'Even on made-up data with a real effect built in, the result is modest and depends on the seed. On real data the effect may be absent, or smaller than the cost of trading it, and firms with cheaper execution trade the obvious versions first. The usual honest conclusion is "not proven yet", followed by paper trading the frozen rules. That outcome is the process working: most ideas should end on the computer, before they cost money.',
  ],
}
