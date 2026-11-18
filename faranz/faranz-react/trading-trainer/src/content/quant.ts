import type { Module } from '../types'

export const quant: Module = {
  id: 'quant',
  title: 'Quantitative trading: the statistics of an edge',
  summary:
    'Treating trading as research: the shape of returns, testing a signal against noise, how prices behave through time, measuring a strategy, building and combining signals, pairs, and turning signals into a portfolio, with NumPy throughout.',
  lessons: [
    {
      id: 'quant-returns',
      title: 'Returns and their distribution',
      summary: 'Simple and log returns, how they compound, and why the normal curve understates the big days.',
      widget: 'quant-tails',
      text: [
        'Quant research starts from returns, not prices. The **simple return** is `p1 / p0 − 1`. The **log return** is `ln(p1 / p0)`, the one the volatility module used. For small moves they are almost equal; for large ones they are not: +10% simple is +9.53% log.',
        "Each has one job it does well. Log returns **add up over time**: the log return of a week is the sum of its daily log returns. Simple returns **add up across assets**: a portfolio's return is the weighted sum of its holdings' simple returns. Compounding simple returns over time needs a product, `np.prod(1 + r) − 1`, not a sum.",
        { code: `import numpy as np

r = np.array([0.10, -0.10])          # +10% then -10%
print(np.prod(1 + r) - 1)            # -0.01: down 1%, not flat
print(np.log1p(r).sum())             # -0.01005: the log return of the two days` },
        'Volatility costs compound growth. A strategy with arithmetic mean return μ and standard deviation σ per period grows at about `μ − σ²/2` per period in log terms (the **volatility drag**). +50% then −50% averages 0% but leaves 75% of the money.',
        'Real returns have **fat tails**: more very quiet days and more very large days than a normal curve with the same standard deviation. **Excess kurtosis**, `mean((r − mean)⁴) / variance² − 3`, is 0 for a normal curve and well above 0 for daily stock returns. If daily returns were normal, a 4σ day would come about once in 63 years and a 5σ day once in several thousand; markets produce them far more often. On 19 October 1987 the S&P 500 fell about 20% in one day, a move of around 20 standard deviations at the volatility of the time. Any model, risk limit or option sale that assumes a bell curve understates the big days.',
      ],
      rules: [
        'Log returns add over time; simple returns add across assets.',
        'Compound simple returns with a product, never a sum.',
        'Growth is about μ − σ²/2: volatility costs compound return.',
        'Excess kurtosis = mean((r − m)⁴) / var² − 3. Normal is 0; markets are far above.',
        'Count days beyond 3σ and compare with what a normal curve expects. Expect many more.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'quant-returns-1',
          ask: 'A stock closes at $100, then $110, then $99. What is its total simple return over the two days? Give a percentage, for example 25%.',
          answer: -0.01,
          check: '99 / 100 - 1',
          why: 'Up 10% then down 10% is not flat: 1.10 × 0.90 = 0.99, a loss of 1%. The fall is 10% of a larger number than the rise was.',
        },
        {
          kind: 'number',
          id: 'quant-returns-2',
          ask: 'Same prices: $100, $110, $99. Add up the two daily log returns. Give the answer to 4 decimal places.',
          answer: -0.0101,
          tol: 0.00006,
          check: 'math.log(110 / 100) + math.log(99 / 110)',
          why: 'ln(1.1) + ln(0.9) = 0.0953 − 0.1054 = −0.0101, which is ln(99 / 100). Log returns add up over time to the log return of the whole period, which is why research code uses them for time series.',
        },
        {
          kind: 'choice',
          id: 'quant-returns-3',
          ask: 'A strategy makes +50% in year one and −50% in year two. Its average yearly return is 0%. Where is the account?',
          options: ['Back where it started', 'Down 25%', 'Down 50%', 'Up 25%'],
          answer: 1,
          why: '1.5 × 0.5 = 0.75: a quarter of the money is gone. The arithmetic mean says nothing about compound growth when returns vary. The more volatile the returns, the further the compound result falls below the average.',
        },
        {
          kind: 'number',
          id: 'quant-returns-4',
          ask: 'A strategy has an arithmetic mean return of 10% a year and a volatility of 30% a year. Using growth ≈ μ − σ²/2, what is its approximate compound (log) growth rate? Give a percentage, for example 25%.',
          answer: 0.055,
          check: '0.10 - 0.30 ** 2 / 2',
          why: '0.10 − 0.09 / 2 = 0.055, so about 5.5% a year. Nearly half the average return is lost to volatility drag. Two strategies with the same average return but different volatility do not end with the same money.',
        },
        {
          kind: 'output',
          id: 'quant-returns-5',
          ask: 'Three daily simple returns compounded two ways. What does this print?',
          code: `import numpy as np

r = np.array([0.10, -0.10, 0.05])
a = np.prod(1 + r) - 1
b = np.expm1(np.log1p(r).sum())
print(round(a, 4), round(b, 4))`,
          answer: '0.0395 0.0395',
          why: '1.10 × 0.90 × 1.05 = 1.0395. `log1p` turns simple returns into log returns, which add; `expm1` turns the sum back into a simple return. The two routes always agree, which is a good check on your own code.',
        },
        {
          kind: 'bug',
          id: 'quant-returns-6',
          ask: 'This should give the total return of a strategy from its daily simple returns. On [0.10, −0.10] it returns 0.0 instead of −0.01.',
          code: `import numpy as np

def total_return(r):
    r = np.asarray(r, dtype=float)
    return r.sum()`,
          line: 5,
          fix: '    return np.prod(1 + r) - 1',
          why: 'Simple returns compound by multiplying. Summing them ignores that each day works on the balance left by the day before, which overstates any volatile strategy. Summing is right only for log returns.',
        },
        {
          kind: 'number',
          id: 'quant-returns-7',
          ask: 'If daily returns were normal, the chance of a move beyond 4 standard deviations, up or down, on a given day is 2 × (1 − Φ(4)), where Φ is the normal CDF. With 252 trading days a year, about how many years apart are such days? Give a whole number.',
          answer: 63,
          tol: 2,
          check: '1 / (2 * (1 - 0.5 * (1 + math.erf(4 / math.sqrt(2)))) * 252)',
          hint: 'Φ(x) = 0.5 × (1 + erf(x / √2)). The chance is about 0.000063 a day.',
          why: 'About once in 63 years. Stock indexes have had many 4σ days in the last few decades. The normal curve is a poor model of the tails, which is where the money is lost.',
        },
        {
          kind: 'choice',
          id: 'quant-returns-8',
          ask: "A portfolio is half in stock A and half in stock B. Today A rose 10% and B fell 10%. Which gives the portfolio's return today?",
          options: [
            'The average of the simple returns: 0%',
            'The average of the log returns: about −0.5%',
            'The sum of the log returns',
            'The product of (1 + r) for each stock',
          ],
          answer: 0,
          why: 'Half the money gained 10% and half lost 10%, so the total is unchanged: simple returns add across assets, weighted by the money in each. Averaging log returns across assets is a common bug; it gives about −0.5%, which no account ever saw.',
        },
        {
          kind: 'choice',
          id: 'quant-returns-9',
          ask: 'In the figure, start at 30 degrees of freedom, then lower it to 3. The standard deviation is the same in both. What changes?',
          options: [
            'Nothing: the same standard deviation means the same risk',
            'More days far beyond 3σ than the normal curve expects, and also more very quiet days near the centre',
            'Only the centre changes; the tails stay normal',
            'The histogram becomes wider everywhere',
          ],
          answer: 1,
          why: 'With fat tails the variance is spent differently: many small days and a few huge ones. The standard deviation alone cannot see this, which is why a calm-looking series can still carry large tail risk.',
        },
        {
          kind: 'write',
          id: 'quant-returns-10',
          numpy: true,
          ask: 'Write `excess_kurtosis(r)`: `mean((r − m)⁴) / v² − 3`, where m is the mean and v the population variance (`ddof=0`).',
          starter: `import numpy as np

def excess_kurtosis(r):
    r = np.asarray(r, dtype=float)
    pass`,
          solution: `import numpy as np

def excess_kurtosis(r):
    r = np.asarray(r, dtype=float)
    d = r - r.mean()
    return (d ** 4).mean() / (d ** 2).mean() ** 2 - 3`,
          tests: `out = excess_kurtosis([1.0, -1.0, 1.0, -1.0])
assert out is not None, "the function returns nothing yet"
assert abs(out + 2) < 1e-9, f"a series that is always +1 or -1 has excess kurtosis -2, got {out}"
rng = np.random.default_rng(0)
k = excess_kurtosis(rng.normal(0, 0.01, 200000))
assert abs(k) < 0.05, f"normal returns should give about 0, got {k:.3f}"
t = rng.standard_t(5, 200000)
assert excess_kurtosis(t) > 2, "fat-tailed returns (Student t, 5 degrees of freedom) should give well above 0"
assert abs(excess_kurtosis(np.array([1.0, -1.0, 1.0, -1.0]) * 50) + 2) < 1e-9, "kurtosis does not depend on the scale of the returns"`,
          why: 'The fourth power gives huge weight to the largest deviations, so a handful of big days dominates the number. That also makes it unstable on small samples: one crash moves it a lot.',
        },
        {
          kind: 'write',
          id: 'quant-returns-11',
          numpy: true,
          ask: 'Write `tail_report(r, k)`: return a pair, the number of returns more than `k` sample standard deviations (`ddof=1`) from the mean, and the number a normal curve would expect, `n × 2 × (1 − Φ(k))`. Use `math.erf` for Φ.',
          starter: `import math
import numpy as np

def tail_report(r, k):
    r = np.asarray(r, dtype=float)
    # (observed count, expected count under a normal curve)
    pass`,
          solution: `import math
import numpy as np

def tail_report(r, k):
    r = np.asarray(r, dtype=float)
    z = (r - r.mean()) / r.std(ddof=1)
    observed = int((np.abs(z) > k).sum())
    phi = 0.5 * (1 + math.erf(k / math.sqrt(2)))
    return observed, len(r) * 2 * (1 - phi)`,
          tests: `out = tail_report(np.arange(10), 1.0)
assert out is not None, "the function returns nothing yet"
obs, exp = out
assert obs == 4, f"0..9 has mean 4.5 and sd 3.03, so 0, 1, 8 and 9 are beyond 1 sd: 4, got {obs}"
assert abs(exp - 10 * 2 * (1 - 0.5 * (1 + math.erf(1 / math.sqrt(2))))) < 1e-9, f"expected count is n x 2 x (1 - phi(k)), got {exp}"
rng = np.random.default_rng(1)
t = rng.standard_t(3, 5000)
o, e = tail_report(t, 3)
assert o > 2 * e, f"fat tails: far more than the {e:.1f} days a normal curve expects beyond 3 sd, got {o}"`,
          why: 'Counting the days beyond 3σ against the normal expectation is the quickest honest look at a return series. On real daily index returns the observed count is typically several times the expected one.',
        },
      ],
    },
    {
      id: 'quant-signal',
      title: 'Signal or noise',
      summary: 'The t-statistic of a mean return, what a p-value does and does not say, and what testing many ideas does to both.',
      text: [
        'The backtest module measured whether an average R stood out from zero with a t statistic. The same test applies to any series of returns: daily strategy returns, the next-day return after a signal, the return of one stock against another. Start from the **null hypothesis**, the dull explanation: the true mean is zero and what you see is luck. Then `t = mean ÷ (s ÷ √n)`, with s the sample standard deviation.',
        'The **p-value** is the chance of a result at least as far from zero as yours if the null were true. For more than about 30 observations the t statistic is close to normal, so the two-sided p-value is `2 × (1 − Φ(|t|))`, with `Φ(x) = 0.5 × (1 + erf(x / √2))`. t = 2 gives about 0.046. A p-value is not the chance that your strategy fails, and 1 − p is not the chance that it works.',
        'Test many ideas and some will pass by luck. With m independent tests of ideas that have no edge, at the 5% level, the chance that at least one passes is `1 − 0.95^m`: 64% for m = 20. The **Bonferroni** correction tests each at `0.05 ÷ m`, which for 100 tests needs |t| above about 3.5. Harvey, Liu and Zhu argued in 2016 that a newly claimed return factor should clear t = 3, not 2, because so many have been tried. Count every idea, parameter and filter you tried, not only the ones you kept.',
        'When returns are not normal, a **sign-flip test** builds the null distribution from your own data: flip the sign of each return at random many times, and see how often the flipped mean is as far from zero as the real one. It makes no assumption about the shape of returns, only that under the null each return was as likely to be negative as positive.',
        'Most patterns found in market data are noise, and the ones that are real tend to shrink. McLean and Pontiff (2016) found that the returns of published stock anomalies were about 26% lower out-of-sample and about 58% lower after publication. Costs then take a further share, and you compete with firms that have better data and cheaper execution. A t of 2 on a backtest is the start of the work, not the end.',
      ],
      rules: [
        't = mean ÷ (s ÷ √n). Below about 2, assume noise.',
        'Two-sided p ≈ 2 × (1 − Φ(|t|)). It is not the chance the strategy works.',
        'm tests at 5%: chance of a false find is 1 − 0.95^m. Bonferroni: test each at 0.05 ÷ m.',
        'Count every idea, parameter and filter you tried.',
        'Published edges shrink after publication and after costs. Assume yours will too.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'quant-signal-1',
          ask: 'A strategy has 250 daily returns with a mean of 0.05% and a standard deviation of 1%. What is the t statistic of the mean? Give two decimals.',
          answer: 0.79,
          tol: 0.006,
          check: '0.0005 / (0.01 / math.sqrt(250))',
          why: 'The standard error is 1% ÷ √250 ≈ 0.063%, so t = 0.05 ÷ 0.063 ≈ 0.79. A year of daily returns at this edge cannot tell it from zero. A mean of 12% a year sounds large; against daily noise it is small.',
        },
        {
          kind: 'number',
          id: 'quant-signal-2',
          ask: 'Using the normal approximation, what is the two-sided p-value for t = 2.5? Give a decimal to 3 places.',
          answer: 0.012,
          tol: 0.0006,
          check: '2 * (1 - 0.5 * (1 + math.erf(2.5 / math.sqrt(2))))',
          why: 'Φ(2.5) ≈ 0.9938, so 2 × 0.0062 ≈ 0.012. If the true mean were zero, a t this far from zero, either way, would turn up about 1.2% of the time, for one test on its own.',
        },
        {
          kind: 'choice',
          id: 'quant-signal-3',
          ask: 'Your backtest of one idea, decided in advance, gives p = 0.03. Which statement is right?',
          options: [
            'There is a 97% chance the strategy has an edge',
            'There is a 3% chance the strategy has no edge',
            'If the strategy had no edge, a result at least this strong would happen about 3% of the time',
            'The strategy will be profitable 97% of the time',
          ],
          answer: 2,
          why: 'A p-value is computed assuming the null is true. It says how surprising your result would be under that assumption, not how likely the assumption is. The chance the edge is real also depends on how many ideas you tried and how plausible this one was to begin with.',
        },
        {
          kind: 'number',
          id: 'quant-signal-4',
          ask: 'You test 20 strategy variations, none of which has an edge, each at the 5% level, and treat them as independent. What is the chance that at least one looks significant? Give a percentage, for example 25%.',
          answer: 0.64,
          tol: 0.005,
          check: '1 - 0.95 ** 20',
          why: 'The chance that none passes is 0.95²⁰ ≈ 0.36, so the chance that one or more does is about 64%. Twenty tries make a false discovery more likely than not.',
        },
        {
          kind: 'number',
          id: 'quant-signal-5',
          ask: 'You will test 50 ideas and want only a 5% chance of any false discovery. With the Bonferroni correction, what p-value must each idea beat? Give a decimal.',
          answer: 0.001,
          tol: 0.00001,
          check: '0.05 / 50',
          why: '0.05 ÷ 50 = 0.001, which for a two-sided test needs |t| above about 3.3. Bonferroni is strict when the tests overlap, as variations of one idea do, but it is a sound default when you cannot measure the overlap.',
        },
        {
          kind: 'output',
          id: 'quant-signal-6',
          ask: 'A t statistic and its two-sided p-value. What does this print?',
          code: `import math

mean, sd, n = 0.0008, 0.012, 900
t = mean / (sd / math.sqrt(n))
phi = 0.5 * (1 + math.erf(abs(t) / math.sqrt(2)))
print(round(t, 1), round(2 * (1 - phi), 3))`,
          answer: '2.0 0.046',
          why: 'The standard error is 0.012 ÷ 30 = 0.0004, so t = 2.0 and p ≈ 0.046: a little under the usual 5% line. That is about three and a half years of daily returns for an average of 0.08% a day.',
        },
        {
          kind: 'bug',
          id: 'quant-signal-7',
          ask: 'This should return the two-sided p-value of a mean return. For t = 2 it returns 0.023 instead of 0.046, so every idea looks twice as convincing as it is.',
          code: `import math

def p_value(t):
    phi = 0.5 * (1 + math.erf(abs(t) / math.sqrt(2)))
    return 1 - phi`,
          line: 5,
          fix: '    return 2 * (1 - phi)',
          why: 'A strategy could be wrong in either direction, so a result counts as extreme if it is far from zero on either side. The one-sided p-value is half the two-sided one; using it without having fixed the direction in advance halves your evidence bar.',
        },
        {
          kind: 'choice',
          id: 'quant-signal-8',
          ask: 'You tried 200 combinations of indicator settings on the same SPY history. The best has t = 3.1 (two-sided p ≈ 0.002). A Bonferroni threshold for 200 tests at 5% is about t = 3.66. What do you conclude?',
          options: [
            'It is significant: t is above 3',
            'It does not clear the bar for 200 tests: it is what the best of 200 noise tests often looks like',
            'It is significant because p is below 0.05',
            'Bonferroni does not apply to trading strategies',
          ],
          answer: 1,
          why: '0.002 × 200 = 0.4: across 200 tries, a result this strong would be common with no edge at all. The search, not the single test, is what has to be judged.',
        },
        {
          kind: 'write',
          id: 'quant-signal-9',
          numpy: true,
          ask: 'Write `t_and_p(r)`: return the t statistic of the mean of `r` (sample standard deviation, `ddof=1`) and its two-sided p-value from the normal approximation, as a pair.',
          starter: `import math
import numpy as np

def t_and_p(r):
    r = np.asarray(r, dtype=float)
    pass`,
          solution: `import math
import numpy as np

def t_and_p(r):
    r = np.asarray(r, dtype=float)
    t = r.mean() / (r.std(ddof=1) / math.sqrt(len(r)))
    phi = 0.5 * (1 + math.erf(abs(t) / math.sqrt(2)))
    return float(t), 2 * (1 - phi)`,
          tests: `out = t_and_p([0.01, -0.01, 0.01, -0.01])
assert out is not None, "the function returns nothing yet"
t, p = out
assert abs(t) < 1e-9 and abs(p - 1) < 1e-9, f"a mean of zero gives t = 0 and p = 1, got {out}"
r = np.array([0.02, 0.01, -0.005, 0.015, 0.0, 0.01, -0.01, 0.02, 0.005])
want = r.mean() / (r.std(ddof=1) / 3)
t, p = t_and_p(r)
assert abs(t - want) < 1e-9, f"expected t = {want:.4f}: use ddof=1 and divide by sqrt(n), got {t}"
assert abs(p - 2 * (1 - 0.5 * (1 + math.erf(want / math.sqrt(2))))) < 1e-9, "the p-value is two-sided: 2 x (1 - phi(|t|))"
assert abs(t_and_p(-r)[1] - p) < 1e-9, "a negative mean gives the same p-value as a positive one"`,
          why: 'Two lines of maths. The `abs` makes the test two-sided, so a strategy that reliably loses is as surprising as one that reliably wins, which matters if you would have traded either side.',
        },
        {
          kind: 'write',
          id: 'quant-signal-10',
          numpy: true,
          ask: 'Write `sign_flip_p(r, n_sims, seed)`: flip the sign of each return at random (each sign +1 or −1 with equal chance) `n_sims` times with `np.random.default_rng(seed)`, and return the share of simulated means whose absolute value is at least the absolute value of the real mean.',
          starter: `import numpy as np

def sign_flip_p(r, n_sims, seed):
    r = np.asarray(r, dtype=float)
    rng = np.random.default_rng(seed)
    pass`,
          solution: `import numpy as np

def sign_flip_p(r, n_sims, seed):
    r = np.asarray(r, dtype=float)
    rng = np.random.default_rng(seed)
    signs = rng.choice([-1.0, 1.0], size=(n_sims, len(r)))
    sims = np.abs((signs * r).mean(axis=1))
    return float((sims >= abs(r.mean())).mean())`,
          tests: `out = sign_flip_p(np.full(30, 0.01), 2000, 0)
assert out is not None, "the function returns nothing yet"
assert out < 0.01, f"30 gains in a row should almost never come from random signs, got p = {out}"
assert sign_flip_p([0.01, -0.01] * 15, 2000, 0) == 1.0, "a mean of zero: every simulated mean is at least as far from zero, so p = 1"
rng = np.random.default_rng(5)
r = rng.normal(0.002, 0.01, 200)
p1 = sign_flip_p(r, 5000, 1)
assert 0 < p1 < 1, f"p must be between 0 and 1, got {p1}"
assert p1 == sign_flip_p(r, 5000, 1), "the same seed must give the same p-value"
import math
t = r.mean() / (r.std(ddof=1) / math.sqrt(len(r)))
p_norm = 2 * (1 - 0.5 * (1 + math.erf(abs(t) / math.sqrt(2))))
assert abs(p1 - p_norm) < 0.03, f"on near-normal data the sign-flip p ({p1:.3f}) should be close to the normal p ({p_norm:.3f})"`,
          why: 'The simulated means show what the mean looks like when the signs carry no information. On well-behaved data the answer matches the t-test; on fat-tailed data it can differ, and it needs no formula you might misapply.',
        },
        {
          kind: 'design',
          id: 'quant-signal-11',
          ask: 'A blog post describes a published stock anomaly with t = 2.4 in data from 1990 to 2010, and says you can trade it. What do you check before spending time on it?',
          checklist: [
            { point: 'How many related ideas the authors and others tested before this one', why: 'Against many tries, t = 2.4 is weak evidence; a threshold near 3 is fairer.' },
            { point: 'Its returns after publication and after 2010', why: 'Published anomalies tend to shrink sharply once they are known and traded.' },
            { point: 'Costs: turnover, spreads, short borrow on the stocks it shorts', why: 'Many anomalies live in small, illiquid stocks where costs eat the edge.' },
            { point: 'Whether the data included delisted stocks and used only information available at the time', why: 'Survivorship and lookahead inflate old results.' },
            { point: 'Whether the effect holds on a plateau of settings and in other markets', why: 'An effect that needs one exact setting is likely fitted noise.' },
            { point: 'Who else trades it, and whether you have any advantage in data or execution', why: 'Firms with cheaper execution take the easy part of a known edge first.' },
            { point: 'An out-of-sample test on recent data, then paper trading', why: 'Only data the idea never saw can test it.' },
          ],
          why: 'A published result is a hypothesis with a head start, not an edge. Most do not survive costs and time; the checks are cheap compared with finding out live.',
        },
      ],
    },
    {
      id: 'quant-series',
      title: 'Time series behaviour',
      summary: 'Random walks, autocorrelation, stationarity, and how to tell momentum from mean reversion.',
      widget: 'quant-autocorr',
      text: [
        'In a **random walk** each change is independent of the ones before: `p[t] = p[t−1] + ε[t]`. Past returns say nothing about the next one. It is the null model for prices, and it explains a lot: trends, apparent support levels and patterns all appear in random walks.',
        'The **autocorrelation** at lag k is the correlation between `r[t]` and `r[t−k]`. Positive at lag 1 means moves tend to continue (**momentum**, trending); negative means they tend to reverse (**mean reversion**). With n returns and no real autocorrelation, the sample value has a standard error of about `1 ÷ √n`, so anything inside ±2/√n is noise.',
        { code: `import numpy as np

def autocorr(r, lag):
    return np.corrcoef(r[:-lag], r[lag:])[0, 1]` },
        'The **variance ratio** looks at the same thing over a horizon: `VR(q) = variance of q-period returns ÷ (q × variance of 1-period returns)`. For a random walk it is 1. Above 1 means trending, below 1 mean reverting; `VR(2) = 1 + ρ1`, where ρ1 is the lag-1 autocorrelation.',
        'A series is **stationary** when its mean, variance and autocorrelations do not change over time. Prices are not: a random walk wanders anywhere and its variance grows with time. Returns are much closer. Statistics built on prices mislead: two independent random walks often have price levels strongly correlated, while their returns are uncorrelated. Correlate returns, and z-score things that are stationary.',
        'Daily index returns have autocorrelation close to zero. Studies report weak trend-following over months in many futures markets and short-term reversal in individual stocks, each small and smaller after costs. Expect any pattern you find to be faint, and test it against the random walk first.',
      ],
      rules: [
        'A random walk is the null model. Test every pattern against it.',
        'Lag-1 autocorrelation > 0: momentum; < 0: mean reversion. Noise band ±2/√n.',
        'VR(q) = var of q-period returns ÷ (q × var of 1-period returns). Random walk: 1.',
        'Prices are not stationary. Correlate and model returns, not price levels.',
        'Real autocorrelations are small. A large one in a backtest is usually a bug.',
      ],
      questions: [
        {
          kind: 'output',
          id: 'quant-series-1',
          ask: 'What does this print?',
          code: `import numpy as np

r = np.array([1.0, -1.0, 1.0, -1.0, 1.0, -1.0])
print(round(np.corrcoef(r[:-1], r[1:])[0, 1], 2))`,
          answer: '-1.0',
          why: 'Every move is followed by the opposite move, so today and yesterday are perfectly negatively correlated: the most mean-reverting series there is. `r[:-1]` is each day, `r[1:]` the day after.',
        },
        {
          kind: 'number',
          id: 'quant-series-2',
          ask: 'You measure a lag-1 autocorrelation of 0.06 on 400 daily returns. What is the edge of the noise band, 2/√n?',
          answer: 0.1,
          check: '2 / math.sqrt(400)',
          why: '2 ÷ √400 = 0.1, and 0.06 is inside it. You need about 1,100 days before 0.06 is two standard errors from zero, and even then it would be small next to costs.',
        },
        {
          kind: 'number',
          id: 'quant-series-3',
          ask: 'A series has a lag-1 autocorrelation of −0.2 and no autocorrelation at other lags. What is its variance ratio VR(2)?',
          answer: 0.8,
          check: '1 + (-0.2)',
          why: 'The variance of a two-day return is 2σ² + 2ρσ² = 2σ²(1 + ρ), so VR(2) = 1 + ρ = 0.8. Two-day moves are smaller than a random walk would give: the second day tends to undo the first.',
        },
        {
          kind: 'choice',
          id: 'quant-series-4',
          ask: 'You plot the prices of two unrelated stocks over five years and find their correlation is 0.85. What should you do?',
          options: [
            'Treat them as one bet: they move together',
            'Compute the correlation of their returns instead; price levels of independent random walks are often highly correlated by chance',
            'Trade them as a pair, since 0.85 is high',
            'Use a longer history to make the correlation more reliable',
          ],
          answer: 1,
          why: 'Two series that both drifted up (or down) over the period correlate in levels whatever their daily moves did. This is a **spurious correlation**. Returns are close to stationary, so their correlation means something; a longer history of levels does not fix the problem.',
        },
        {
          kind: 'output',
          id: 'quant-series-5',
          ask: 'Two independent random walks, generated with a fixed seed. What does this print?',
          code: `import numpy as np

rng = np.random.default_rng(1)
a = np.cumsum(rng.normal(size=500))
b = np.cumsum(rng.normal(size=500))
print(round(np.corrcoef(a, b)[0, 1], 1), round(np.corrcoef(np.diff(a), np.diff(b))[0, 1], 1))`,
          answer: '0.9 0.0',
          why: 'The walks were drawn independently, yet their levels correlate at 0.9 because both happened to wander the same way. Their changes, the returns, correlate at about zero, which is the truth.',
        },
        {
          kind: 'bug',
          id: 'quant-series-6',
          ask: 'This should give the autocorrelation at a lag. It returns 1.0 for every series.',
          code: `import numpy as np

def autocorr(r, lag):
    r = np.asarray(r, dtype=float)
    return np.corrcoef(r[:-lag], r[:-lag])[0, 1]`,
          line: 5,
          fix: '    return np.corrcoef(r[:-lag], r[lag:])[0, 1]',
          why: 'It correlates the series with itself, unshifted. One side must be the earlier values and the other the values `lag` steps later: `r[:-lag]` against `r[lag:]`.',
        },
        {
          kind: 'write',
          id: 'quant-series-7',
          numpy: true,
          ask: 'Write `variance_ratio(r, q)`: the sample variance (`ddof=1`) of the overlapping q-period sums of `r`, divided by q times the sample variance of `r`.',
          starter: `import numpy as np

def variance_ratio(r, q):
    r = np.asarray(r, dtype=float)
    # q-period sums: r[0]+...+r[q-1], r[1]+...+r[q], ...
    pass`,
          solution: `import numpy as np

def variance_ratio(r, q):
    r = np.asarray(r, dtype=float)
    c = np.concatenate([[0.0], np.cumsum(r)])
    sums = c[q:] - c[:-q]
    return sums.var(ddof=1) / (q * r.var(ddof=1))`,
          tests: `out = variance_ratio([1.0, -1.0] * 50, 2)
assert out is not None, "the function returns nothing yet"
assert abs(out) < 1e-9, f"every two-day sum of an alternating series is 0, so VR(2) = 0, got {out}"
rng = np.random.default_rng(3)
e = rng.normal(0, 0.01, 20000)
assert abs(variance_ratio(e, 5) - 1) < 0.06, f"a random walk gives VR near 1, got {variance_ratio(e, 5):.3f}"
m = np.zeros(20000)
for t in range(1, 20000):
    m[t] = 0.3 * m[t - 1] + e[t]
assert variance_ratio(m, 5) > 1.4, "returns with autocorrelation 0.3 should give a VR well above 1"
assert abs(variance_ratio(e, 1) - 1) < 1e-9, "VR(1) is always 1"`,
          hint: 'With a running total c that starts at 0, the q-period sums are `c[q:] - c[:-q]`.',
          why: 'The running total turns every q-period sum into one subtraction. VR below 1 says moves tend to undo each other over q periods; above 1, that they build on each other.',
        },
        {
          kind: 'number',
          id: 'quant-series-8',
          ask: "Returns follow r[t] = φ × r[t−1] + ε[t] with φ = −0.1. Today's return was +2%. What is the expected return tomorrow? Give a percentage, for example 0.5%.",
          answer: -0.002,
          tol: 0.00002,
          check: '-0.1 * 0.02',
          why: '−0.1 × 2% = −0.2%. That is the whole forecast; the noise ε has a mean of zero. Against a daily standard deviation near 1%, a forecast of 0.2% is right in direction only a little more than half the time.',
        },
        {
          kind: 'choice',
          id: 'quant-series-9',
          ask: "In the figure, set φ to −0.4, then to +0.4. Which rule makes money in each case: following yesterday's direction, or fading it?",
          options: [
            'Following wins at both settings',
            'Fading wins at −0.4, following wins at +0.4',
            'Following wins at −0.4, fading wins at +0.4',
            'Neither: returns cannot be predicted',
          ],
          answer: 1,
          why: "With negative autocorrelation the next move tends to reverse yesterday's, so fading it pays; with positive, moves continue. Set φ to 0 and both drift around zero. Real markets sit very near 0, far from these settings.",
        },
        {
          kind: 'choice',
          id: 'quant-series-10',
          ask: 'Which of these is closest to stationary?',
          options: ['The daily closing price of SPY', "SPY's daily log returns", "The running total of a strategy's profits", 'The 200-day moving average of SPY'],
          answer: 1,
          why: "Prices, running totals and their averages all wander without a fixed level. Returns keep a roughly stable mean and spread, though even their variance changes with the market's mood, so \"close to stationary\" is the most you can say.",
        },
        {
          kind: 'write',
          id: 'quant-series-11',
          numpy: true,
          ask: 'Write `follow_pnl(r)`: the total return of a rule that holds +1 the day after an up day and −1 the day after a down day (0 after a flat day). Return the sum of `position × return` over the days you hold.',
          starter: `import numpy as np

def follow_pnl(r):
    r = np.asarray(r, dtype=float)
    # position for day t comes from the sign of r[t - 1]
    pass`,
          solution: `import numpy as np

def follow_pnl(r):
    r = np.asarray(r, dtype=float)
    pos = np.sign(r[:-1])
    return float((pos * r[1:]).sum())`,
          tests: `out = follow_pnl([0.01, 0.02, -0.01, -0.03, 0.01])
assert out is not None, "the function returns nothing yet"
assert abs(out - 0.03) < 1e-12, f"positions +1, +1, -1, -1 against 0.02, -0.01, -0.03, 0.01 earn 0.03, got {out}"
assert abs(follow_pnl([0.01, -0.01] * 10) + 0.19) < 1e-12, "an alternating series loses on every day after the first"
assert follow_pnl([0.0, 0.05]) == 0.0, "no position after a flat day"`,
          why: "The position for a day uses only the day before: `np.sign(r[:-1])` lined up against `r[1:]`. Using `r` against itself would trade on today's return, which is lookahead, and would make every rule look perfect.",
        },
      ],
    },
    {
      id: 'quant-sharpe',
      title: 'Measuring a strategy',
      summary: 'Sharpe and Sortino ratios, annualising, compounded drawdown, and why a high Sharpe from a short sample means little.',
      widget: 'quant-sharpe',
      text: [
        'The **Sharpe ratio** is the mean return per unit of volatility: `(mean − risk-free rate) ÷ standard deviation`, per period. For daily returns, annualise the mean by × 252 and the standard deviation by × √252, so the Sharpe ratio scales by √252 ≈ 15.9. This assumes independent days; autocorrelated returns make the √252 rule wrong. For a strategy that is flat overnight, many people leave out the risk-free rate; say which you did.',
        'The **Sortino ratio** puts only the bad days in the denominator: mean ÷ downside deviation, where downside deviation is `√(mean(min(r, 0)²))` over **all** periods. A strategy whose volatility is mostly upside scores better on Sortino than on Sharpe.',
        'Drawdown in percent comes from the compounded equity curve: `equity = cumprod(1 + r)`, starting at 1, and `drawdown = 1 − equity ÷ running peak`. The backtest module measured it on a running total of R; for returns that compound, use the product.',
        'A Sharpe ratio is an estimate with a large error. With daily returns, the standard error of an annualised Sharpe is about `1 ÷ √years` (more with fat tails). So `t ≈ Sharpe × √years`: a true Sharpe of 1 needs about four years of data to reach t = 2. A Sharpe of 3 over three months has a rough 95% range of −1 to 7. Pick the best of many backtests and the bias grows, which the **deflated Sharpe ratio** of Bailey and López de Prado tries to correct.',
        'Sharpe is blind to the tails. Selling options earns small steady gains with rare large losses; until the loss comes, its Sharpe looks excellent. Read Sharpe beside the worst day, the drawdown and the kurtosis, never on its own.',
      ],
      rules: [
        'Annual Sharpe = daily Sharpe × √252, if days are independent.',
        'Sortino: mean ÷ √(mean(min(r, 0)²)), over all periods.',
        'Percent drawdown from the compounded curve: 1 − equity ÷ peak.',
        'Standard error of an annual Sharpe ≈ 1 ÷ √years. t ≈ Sharpe × √years.',
        'A high Sharpe from a short sample or from selling tails means little.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'quant-sharpe-1',
          ask: "A strategy's daily returns have a mean of 0.04% and a standard deviation of 1%. Ignoring the risk-free rate, what is its annualised Sharpe ratio? Give two decimals.",
          answer: 0.63,
          tol: 0.006,
          check: '0.0004 / 0.01 * math.sqrt(252)',
          why: 'Daily Sharpe 0.04, times √252 ≈ 15.87, is about 0.63. Equivalently, annual mean 10.1% over annual volatility 15.9%.',
        },
        {
          kind: 'number',
          id: 'quant-sharpe-2',
          ask: 'A strategy has a true annual Sharpe ratio of 1. About how many years of daily returns do you need before its t statistic reaches 2?',
          answer: 4,
          check: '(2 / 1) ** 2',
          why: 't ≈ Sharpe × √years, so √years = 2 and years = 4. A Sharpe of 0.5, which is respectable, needs 16 years. Most strategies are judged on far less.',
        },
        {
          kind: 'number',
          id: 'quant-sharpe-3',
          ask: 'A strategy shows an annualised Sharpe of 3 over three months of daily returns. Using a standard error of 1 ÷ √years, what is the lower end of the rough 95% range, the estimate minus two standard errors?',
          answer: -1,
          check: '3 - 2 / math.sqrt(0.25)',
          why: 'Three months is a quarter of a year, so the standard error is 1 ÷ 0.5 = 2, and 3 − 4 = −1. The data cannot rule out a strategy that loses money.',
        },
        {
          kind: 'number',
          id: 'quant-sharpe-4',
          ask: 'Five periods of returns: 2%, −1%, 3%, −2%, 1%. What is the Sortino ratio per period (mean ÷ √(mean(min(r, 0)²)) over all five periods)? Give one decimal.',
          answer: 0.6,
          check: '(lambda r: r.mean() / np.sqrt(np.mean(np.minimum(r, 0) ** 2)))(np.array([0.02, -0.01, 0.03, -0.02, 0.01]))',
          why: 'The mean is 0.6%. The squared downside values are 0.0001 and 0.0004, and their sum divided by all five periods is 0.0001, whose square root is 1%. 0.6 ÷ 1 = 0.6.',
        },
        {
          kind: 'output',
          id: 'quant-sharpe-5',
          ask: 'What does this print?',
          code: `import numpy as np

r = np.array([-0.10, 0.05, -0.10, 0.20])
equity = np.concatenate([[1.0], np.cumprod(1 + r)])
peak = np.maximum.accumulate(equity)
print(round((1 - equity / peak).max(), 4))`,
          answer: '0.1495',
          why: 'The curve goes 1, 0.9, 0.945, 0.8505, 1.0206. The peak stays at 1 until the last day, and the lowest point is 0.8505: a drawdown of 14.95%. The two −10% days do not make −20%, because each falls from a smaller balance and the +5% between them helped a little.',
        },
        {
          kind: 'bug',
          id: 'quant-sharpe-6',
          ask: 'This should annualise a Sharpe ratio from daily returns. It reports Sharpe ratios of 10 and more for ordinary strategies.',
          code: `import numpy as np

def sharpe(r):
    r = np.asarray(r, dtype=float)
    return r.mean() / r.std(ddof=1) * 252`,
          line: 5,
          fix: '    return r.mean() / r.std(ddof=1) * np.sqrt(252)',
          why: 'The mean scales with time (× 252) but the standard deviation with its square root (× √252), so their ratio scales by 252 ÷ √252 = √252. Multiplying by 252 inflates every Sharpe about sixteen-fold.',
        },
        {
          kind: 'bug',
          id: 'quant-sharpe-7',
          ask: 'This Sortino ratio uses only the losing days for the downside deviation. A strategy with one small loss in a hundred days gets a downside deviation of 0 and divides by zero.',
          code: `import numpy as np

def sortino(r):
    r = np.asarray(r, dtype=float)
    down = r[r < 0].std()
    return r.mean() / down`,
          line: 5,
          fix: '    down = np.sqrt(np.mean(np.minimum(r, 0) ** 2))',
          why: 'Downside deviation is measured from zero over every period, with good days counting as zero. The standard deviation of the losers alone measures how much losses differ from each other, not how large they are, and is 0 when there is one loss.',
        },
        {
          kind: 'write',
          id: 'quant-sharpe-8',
          numpy: true,
          ask: 'Write `sharpe_sortino(r, periods=252)`: return the annualised Sharpe ratio (sample standard deviation, `ddof=1`) and the annualised Sortino ratio, both scaled by √periods, as a pair. Ignore the risk-free rate.',
          starter: `import numpy as np

def sharpe_sortino(r, periods=252):
    r = np.asarray(r, dtype=float)
    pass`,
          solution: `import numpy as np

def sharpe_sortino(r, periods=252):
    r = np.asarray(r, dtype=float)
    k = np.sqrt(periods)
    sharpe = r.mean() / r.std(ddof=1) * k
    sortino = r.mean() / np.sqrt(np.mean(np.minimum(r, 0) ** 2)) * k
    return float(sharpe), float(sortino)`,
          tests: `r = np.array([0.02, -0.01, 0.03, -0.02, 0.01])
out = sharpe_sortino(r, 1)
assert out is not None, "the function returns nothing yet"
sh, so = out
assert abs(so - 0.6) < 1e-9, f"per period, the Sortino of this series is 0.6, got {so}"
assert abs(sh - r.mean() / r.std(ddof=1)) < 1e-9, f"per period, Sharpe is mean / std(ddof=1), got {sh}"
sh2, so2 = sharpe_sortino(r)
assert abs(sh2 - sh * np.sqrt(252)) < 1e-9 and abs(so2 - so * np.sqrt(252)) < 1e-9, "annualise both by sqrt(252)"`,
          why: 'Both ratios share a numerator and differ in what counts as risk. Annualising both by √periods keeps them comparable with figures quoted elsewhere.',
        },
        {
          kind: 'write',
          id: 'quant-sharpe-9',
          numpy: true,
          ask: 'Write `max_drawdown_pct(r)`: the largest percentage fall of the compounded equity curve from its running peak, with the curve starting at 1 before the first return.',
          starter: `import numpy as np

def max_drawdown_pct(r):
    r = np.asarray(r, dtype=float)
    pass`,
          solution: `import numpy as np

def max_drawdown_pct(r):
    r = np.asarray(r, dtype=float)
    equity = np.concatenate([[1.0], np.cumprod(1 + r)])
    peak = np.maximum.accumulate(equity)
    return float((1 - equity / peak).max())`,
          tests: `out = max_drawdown_pct([0.10, -0.10])
assert out is not None, "the function returns nothing yet"
assert abs(out - 0.10) < 1e-9, f"up 10% then down 10% is a 10% drawdown, got {out}"
assert abs(max_drawdown_pct([-0.5, 1.0]) - 0.5) < 1e-9, "a 50% loss from the start is a 50% drawdown: start the curve at 1"
assert abs(max_drawdown_pct([-0.1, -0.1]) - 0.19) < 1e-9, "two 10% losses compound to 19%, not 20%"
assert max_drawdown_pct([0.01, 0.02]) == 0.0, "a curve that only rises has no drawdown"`,
          why: 'Two −10% days are a 19% drawdown, not 20%, because the second loss is on a smaller balance. For returns that compound, the product is the honest curve.',
        },
        {
          kind: 'choice',
          id: 'quant-sharpe-10',
          ask: 'In the figure, set the true Sharpe to 1 and look at the estimates after one year. What do you see?',
          options: [
            'All the estimates are close to 1',
            'They range from below 0 to above 2: one year cannot tell a Sharpe of 1 from no edge',
            'They are all above 1',
            'They are all exactly 1, since the true value is known',
          ],
          answer: 1,
          why: 'With a standard error of about 1 after one year, two standard errors either side is −1 to 3. Watch the funnel narrow only with the square root of time: four times the history halves the width.',
        },
        {
          kind: 'choice',
          id: 'quant-sharpe-11',
          ask: 'A strategy that sells far out-of-the-money SPX puts every week shows a Sharpe of 3 over 18 months and has never lost more than 1% in a week. What is the main reason to distrust that Sharpe?',
          options: [
            'Eighteen months is too long a sample',
            'Its losses are rare and large; a sample without the crash shows the steady premium and none of the tail',
            'Sharpe ratios above 2 are mathematically impossible',
            'Sortino would be lower',
          ],
          answer: 1,
          why: 'Short option strategies collect small gains and occasionally lose many months of them in days. Sharpe uses only the mean and standard deviation of the sample, so if the sample has no crash the ratio knows nothing of it. Look at the worst case, not the ratio.',
        },
        {
          kind: 'design',
          id: 'quant-sharpe-12',
          ask: 'You must choose between two backtested strategies. A: Sharpe 2.5 over 8 months, best of 40 variants. B: Sharpe 0.9 over 9 years, the only version tested. Write how you would compare them.',
          checklist: [
            { point: 'Standard errors: A is about 2.5 ± 1.2, B about 0.9 ± 0.33', why: "A's range runs from near zero to very high; B's is clearly above zero." },
            { point: 'The t statistics: A about 2.0, B about 2.7', why: 't ≈ Sharpe × √years puts the evidence on one scale.' },
            { point: 'A was the best of 40, so its Sharpe is biased upwards', why: 'Selection from many tries inflates the winner; a deflated Sharpe would be lower.' },
            { point: 'Tail measures for both: worst day, maximum drawdown, kurtosis', why: 'Sharpe hides tail risk.' },
            { point: 'Whether each covered different market conditions', why: 'Eight months may hold one regime; nine years hold several.' },
            { point: 'Costs and turnover in both', why: 'A high-turnover strategy loses more of its Sharpe to costs.' },
            { point: 'Paper trading before either goes live', why: 'Both are backtests; neither has met live data.' },
          ],
          why: 'The larger number rests on far weaker evidence. A modest Sharpe over a long, single test is usually more believable than a high one from a short search.',
        },
      ],
    },
    {
      id: 'quant-features',
      title: 'Building a signal',
      summary: 'Features, z-scores and ranks, the information coefficient, combining weak signals, and how signals decay.',
      text: [
        "A **feature** is a number known at time t, computed from data up to t: the last 5 days' return, the distance from VWAP, volume against its 20-day average. A **signal** turns features into a forecast or a position. Every feature must pass the lookahead test from the backtest module: could you have computed it before the trade?",
        "Features come in different units, so standardise them. A **time-series z-score** compares today with the same asset's own past: `(x − mean of past window) ÷ sd of past window`. A **cross-sectional z-score** or **rank** compares assets with each other on the same day. Ranks ignore outliers: one stock up 80% on a takeover does not swamp the rest.",
        "The **information coefficient (IC)** is the correlation between the signal at t and the return that follows it, usually computed across assets each day and then averaged. The **rank IC** uses ranks of both (Spearman correlation). Useful ICs are small: 0.02 to 0.05 is a typical rule of thumb for daily stock signals. Grinold's **fundamental law** says the information ratio is about `IC × √breadth`, where breadth is the number of independent bets a year. It is an approximation: correlated bets count for less than their number.",
        'Weak signals combine. Average k standardised signals, each with IC c and pairwise correlation ρ between them, and the IC of the average is `c × √k ÷ √(1 + (k − 1)ρ)`. Four uncorrelated signals with IC 0.03 make one with IC 0.06; if they are correlated at 0.5, only about 0.038. Combining helps most when the signals use different information.',
        '**Decay**: plot the IC against the horizon of the return it predicts. A fast-decaying signal must be traded quickly, which means high turnover and high costs. Signals also decay through time, as others find and trade them. Measure the IC on recent data separately from old data.',
      ],
      rules: [
        'A feature at t uses only data up to t.',
        'Time-series z-score: against your own past. Cross-sectional rank: against the others today.',
        'IC = correlation of the signal with the next return. 0.02 to 0.05 is useful.',
        'IR ≈ IC × √breadth, for independent bets.',
        'Average of k signals: IC × √k ÷ √(1 + (k − 1)ρ). Different information combines best.',
        'Fast decay means high turnover and high costs.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'quant-features-1',
          ask: "A stock's 5-day return is 3%. Over the past year its 5-day returns had a mean of 1% and a standard deviation of 1%. What is the time-series z-score of today's value?",
          answer: 2,
          check: '(0.03 - 0.01) / 0.01',
          why: '(3% − 1%) ÷ 1% = 2: today is two standard deviations above its own usual value. Note the window: it ends before today, so nothing from the future is in it.',
        },
        {
          kind: 'output',
          id: 'quant-features-2',
          ask: "Cross-sectional ranks of one day's feature values for five stocks. What does this print?",
          code: `import numpy as np

x = np.array([0.8, -0.3, 0.1, 5.0, -1.2])
ranks = np.argsort(np.argsort(x))
print(ranks.tolist())`,
          answer: '[3, 1, 2, 4, 0]',
          why: "Double `argsort` gives each value's position in sorted order: −1.2 is 0, −0.3 is 1, 0.1 is 2, 0.8 is 3, 5.0 is 4. The outlier at 5.0 gets rank 4, no more extreme than any other top value.",
        },
        {
          kind: 'number',
          id: 'quant-features-3',
          ask: 'You average four standardised signals, each with an IC of 0.03 and uncorrelated with each other. What is the IC of the average? Give a decimal.',
          answer: 0.06,
          tol: 0.0006,
          check: '0.03 * math.sqrt(4) / math.sqrt(1 + 3 * 0)',
          why: "c × √k = 0.03 × 2 = 0.06. The signals' errors are independent and partly cancel, while their information adds.",
        },
        {
          kind: 'number',
          id: 'quant-features-4',
          ask: 'Same four signals with IC 0.03 each, but now every pair is correlated at 0.5. What is the IC of their average? Give three decimals.',
          answer: 0.038,
          tol: 0.0006,
          check: '0.03 * math.sqrt(4) / math.sqrt(1 + 3 * 0.5)',
          why: '0.06 ÷ √2.5 ≈ 0.038. Four versions of the same idea are not four ideas. Momentum measured over 3, 6, 9 and 12 months is closer to the correlated case.',
        },
        {
          kind: 'number',
          id: 'quant-features-5',
          ask: 'A signal has an IC of 0.02 and gives 400 independent bets a year. By the fundamental law, about what information ratio (a Sharpe-like ratio of the active return) should it reach before costs?',
          answer: 0.4,
          check: '0.02 * math.sqrt(400)',
          why: '0.02 × 20 = 0.4. A tiny correlation becomes a usable ratio through many bets. The catch is "independent": 400 trades on stocks that move together are far fewer independent bets.',
        },
        {
          kind: 'choice',
          id: 'quant-features-6',
          ask: 'Your signal has an IC of 0.04 against next-day returns across 500 stocks. A colleague says a correlation of 0.04 is useless. What is the better view?',
          options: [
            'They are right: anything below 0.3 is noise',
            'A small IC applied across many independent bets can give a usable information ratio, if costs are low enough',
            'An IC of 0.04 means 4% of trades win',
            'IC does not matter, only the win rate does',
          ],
          answer: 1,
          why: 'Daily returns are mostly noise, so even good signals correlate weakly with them. The value comes from breadth. Whether it survives depends on how stable the IC is from day to day and on costs.',
        },
        {
          kind: 'bug',
          id: 'quant-features-7',
          ask: "This should measure a signal's IC against the next day's return: `signal[t]` should be paired with `ret[t + 1]`. It reports a very high IC for a signal built from today's return.",
          code: `import numpy as np

def ic_next_day(signal, ret):
    # signal[t] is known at the close of day t; ret[t] is the return of day t
    return np.corrcoef(signal[:-1], ret[:-1])[0, 1]`,
          line: 5,
          fix: '    return np.corrcoef(signal[:-1], ret[1:])[0, 1]',
          why: "Pairing the signal with the same day's return measures how well it describes today, not how well it predicts tomorrow. A signal made from today's return correlates strongly with today's return by construction.",
        },
        {
          kind: 'write',
          id: 'quant-features-8',
          numpy: true,
          ask: "Write `cs_zscore(x)`: `x` has shape (days, assets). Return the cross-sectional z-score: each value minus its row's mean, divided by its row's population standard deviation.",
          starter: `import numpy as np

def cs_zscore(x):
    x = np.asarray(x, dtype=float)
    pass`,
          solution: `import numpy as np

def cs_zscore(x):
    x = np.asarray(x, dtype=float)
    m = x.mean(axis=1, keepdims=True)
    s = x.std(axis=1, keepdims=True)
    return (x - m) / s`,
          tests: `x = np.array([[1.0, 2.0, 3.0], [10.0, 10.0, 40.0]])
out = cs_zscore(x)
assert out is not None, "the function returns nothing yet"
assert np.shape(out) == (2, 3), f"the shape should stay (days, assets), got {np.shape(out)}"
assert np.allclose(out.mean(axis=1), 0), "each row should have a mean of 0: standardise across assets, not across days"
assert np.allclose(out.std(axis=1), 1), "each row should have a standard deviation of 1"
assert np.allclose(out[0], [-1.2247449, 0, 1.2247449]), f"row 0 gives -1.22, 0, 1.22, got {out[0]}"`,
          hint: 'Reduce along `axis=1` and keep the dimension so the result broadcasts back over each row.',
          why: 'Each day is standardised on its own, so the signal compares stocks with each other on the same day and uses no data from other days. Standardising down the columns instead would mix in the future.',
        },
        {
          kind: 'write',
          id: 'quant-features-9',
          numpy: true,
          ask: 'Write `rank_ic(signal, fwd)`: the Spearman rank correlation of two 1-D arrays without ties, computed as the correlation of their ranks (use double `argsort` for ranks).',
          starter: `import numpy as np

def rank_ic(signal, fwd):
    signal = np.asarray(signal, dtype=float)
    fwd = np.asarray(fwd, dtype=float)
    pass`,
          solution: `import numpy as np

def rank_ic(signal, fwd):
    signal = np.asarray(signal, dtype=float)
    fwd = np.asarray(fwd, dtype=float)
    a = np.argsort(np.argsort(signal))
    b = np.argsort(np.argsort(fwd))
    return float(np.corrcoef(a, b)[0, 1])`,
          tests: `out = rank_ic([1, 2, 3, 4], [10, 20, 30, 40])
assert out is not None, "the function returns nothing yet"
assert abs(out - 1) < 1e-9, f"the same order gives 1, got {out}"
assert abs(rank_ic([1, 2, 3, 4], [40, 30, 20, 10]) + 1) < 1e-9, "the opposite order gives -1"
assert abs(rank_ic([1, 2, 3, 4], [1, 2, 3, 1000]) - 1) < 1e-9, "an outlier does not change the ranks, so the rank IC stays 1"
s = np.array([0.5, -1.0, 2.0, 0.1, -0.3])
f = np.array([0.01, -0.02, 0.00, 0.02, -0.01])
assert abs(rank_ic(s, f) - 0.6) < 1e-9, f"expected 0.6 for this example, got {rank_ic(s, f)}"`,
          why: 'Ranks make the measure depend only on order, so one wild return cannot create or destroy an IC. With ties you would average the tied ranks; real code uses a library for that.',
        },
        {
          kind: 'choice',
          id: 'quant-features-10',
          ask: "A signal's average IC against returns over different horizons. What does the chart tell you about how to trade it?",
          chart: {
            title: 'IC by horizon',
            x: 'horizon (days)',
            y: 'IC',
            series: [{ name: 'IC', points: [0.05, 0.03, 0.018, 0.011, 0.007, 0.004, 0.002], color: 'accent' }],
          },
          options: [
            'It predicts long-run returns best, so hold for weeks',
            'Most of its information is in the next day or two, so it needs fast trading and the costs that come with it',
            'It has no information at any horizon',
            'It is a momentum signal because the IC is positive',
          ],
          answer: 1,
          why: 'The IC roughly halves every day or two. Holding longer earns little more, and turning the position over daily to keep up with the signal pays spread and fees every day. Whether it is worth trading depends on whether the one-day IC beats those costs.',
        },
        {
          kind: 'design',
          id: 'quant-features-11',
          ask: 'You want to build a daily cross-sectional signal on 100 large US stocks from three features: 5-day return, distance from the 20-day average, and volume against its 20-day average. Describe the research steps.',
          checklist: [
            { point: 'Compute each feature with data up to the close of day t only', why: 'Lookahead is the commonest reason a signal looks good.' },
            { point: 'Rank or z-score each feature across stocks each day', why: 'It puts features in common units and limits outliers.' },
            { point: "Measure each feature's IC against next-day returns, day by day, with its mean and t statistic", why: 'The daily ICs are a sample; their t says whether the average is more than noise.' },
            { point: 'Check the correlation between the features before combining', why: 'Correlated features add less than their count suggests.' },
            { point: 'Plot IC by horizon to see how fast it decays', why: 'It sets the holding period and the turnover.' },
            { point: 'Fix the weights and settings on early data and test once on later data', why: 'Tuning on all the data makes the out-of-sample result meaningless.' },
            { point: 'Estimate turnover and costs before calling it an edge', why: 'A one-day signal pays the spread every day.' },
            { point: 'Use the stocks that were in the universe at each date', why: "Today's large stocks are survivors." },
          ],
          why: 'Each step guards against a way a signal can look better than it is. Most candidate features fail one of these checks, which is the normal outcome of research.',
        },
      ],
    },
    {
      id: 'quant-pairs',
      title: 'Pairs and mean reversion',
      summary: 'The spread of two related series, cointegration in plain words, z-score entries and exits, and how pairs break.',
      widget: 'quant-pairs',
      text: [
        'Two related stocks, say KO and PEP, each wander like random walks, but some combination of them may not. The **spread** is `s = ln A − β × ln B`, with the **hedge ratio** β from a least-squares fit of ln A on ln B over past data. In log terms, β is roughly the dollars of B to sell for each dollar of A bought.',
        '**Cointegration** means the spread is stationary even though neither price is: it keeps returning to a mean. Think of a walker and a dog on a lead, each wandering, never far apart. **Correlation is not cointegration**: two stocks can have highly correlated daily returns and still drift apart for years. The usual test (Engle and Granger) fits β, then tests whether the spread mean-reverts.',
        'A simple measure of how fast it reverts: regress the change of the spread on its last value, `Δs[t] = a + b × s[t−1]`. If b is negative, the spread is pulled back, and the **half-life**, the time to close half of a gap, is `−ln 2 ÷ ln(1 + b)` periods. A half-life of 5 days is tradable; 200 days ties up capital for most of a year.',
        'The trade: compute the z-score of the spread over a past window. When z rises above +2, **short the spread** (sell A, buy β of B); below −2, **buy it**. Exit when z crosses back through 0. Add a stop, for example at |z| > 4, and a time stop of a few half-lives.',
        '**Pairs break.** A takeover, a lawsuit, a product failure or a change in business mix can turn a stationary spread into a random walk, and a z-score strategy will keep adding to a loser. Costs are doubled (two legs, in and out), shorting costs a borrow fee, and fitting β on the same data you test exaggerates how stationary the spread looked. Most pairs that pass a test on past data do not stay cointegrated.',
      ],
      rules: [
        'Spread = ln A − β ln B, with β fitted on past data only.',
        'Cointegrated: the spread is stationary. Correlated returns are not enough.',
        'Half-life = −ln 2 ÷ ln(1 + b), from Δs = a + b × s[t−1].',
        'Enter at |z| > 2, exit at 0, stop at a wider z and after a set time.',
        'Pairs break on news. Use stops, small size, and expect two sets of costs.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'quant-pairs-1',
          ask: 'The spread of a pair is 0.15 today. Over the past 60 days it had a mean of 0.05 and a standard deviation of 0.04. What is its z-score?',
          answer: 2.5,
          check: '(0.15 - 0.05) / 0.04',
          why: '(0.15 − 0.05) ÷ 0.04 = 2.5. Above an entry of 2, the rule shorts the spread: sell A, buy B.',
        },
        {
          kind: 'number',
          id: 'quant-pairs-2',
          ask: 'You buy $20,000 of stock A. The hedge ratio from regressing ln A on ln B is 0.8. How many dollars of stock B do you sell short?',
          answer: 16000,
          check: '20000 * 0.8',
          why: 'In log terms a 1% move in B goes with a β% move in A, so you hedge each dollar of A with β dollars of B: 0.8 × $20,000 = $16,000.',
        },
        {
          kind: 'number',
          id: 'quant-pairs-3',
          ask: 'Regressing the daily change of a spread on its previous value gives b = −0.1. What is the half-life in days? Give one decimal.',
          answer: 6.6,
          tol: 0.06,
          check: '-math.log(2) / math.log(1 - 0.1)',
          why: 'Each day keeps 90% of the gap, so after h days 0.9^h is left; 0.9^h = 0.5 gives h = −ln 2 ÷ ln 0.9 ≈ 6.6 days.',
        },
        {
          kind: 'output',
          id: 'quant-pairs-4',
          ask: 'The rule: short the spread (−1) when z > 2, buy it (+1) when z < −2, and hold until z crosses 0. What positions does this print?',
          code: `z = [0.5, 2.3, 1.5, 0.2, -0.3, -2.1, -1.0, 0.1]
pos, out = 0, []
for x in z:
    if pos == 0 and x > 2:
        pos = -1
    elif pos == 0 and x < -2:
        pos = 1
    elif (pos == -1 and x < 0) or (pos == 1 and x > 0):
        pos = 0
    out.append(pos)
print(out)`,
          answer: '[0, -1, -1, -1, 0, 1, 1, 0]',
          why: 'The short opens at 2.3 and is held while z falls through 1.5 and 0.2, closing when z goes below 0 at −0.3. The long opens at −2.1 and closes at 0.1. The position remembers its state: falling below 2 is not a reason to exit.',
        },
        {
          kind: 'write',
          id: 'quant-pairs-5',
          ask: 'Write `pair_positions(z, entry, exit)`: from a list of z-scores, return the list of positions. Flat (0): go −1 if z > entry, +1 if z < −entry. Short (−1): go flat when z < exit. Long (+1): go flat when z > −exit.',
          starter: `def pair_positions(z, entry, exit):
    pos, out = 0, []
    for x in z:
        out.append(pos)
    return out`,
          solution: `def pair_positions(z, entry, exit):
    pos, out = 0, []
    for x in z:
        if pos == 0:
            if x > entry:
                pos = -1
            elif x < -entry:
                pos = 1
        elif pos == -1 and x < exit:
            pos = 0
        elif pos == 1 and x > -exit:
            pos = 0
        out.append(pos)
    return out`,
          tests: `out = pair_positions([0.5, 2.3, 1.5, 0.2, -0.3, -2.1, -1.0, 0.1], 2, 0)
assert out is not None, "the function returns nothing yet"
assert out == [0, -1, -1, -1, 0, 1, 1, 0], f"expected [0, -1, -1, -1, 0, 1, 1, 0], got {out}"
assert pair_positions([2.5, 1.0, 0.4], 2, 0.5) == [-1, -1, 0], "with exit 0.5, a short closes when z falls below 0.5"
assert pair_positions([-2.5, -1.0, -0.4], 2, 0.5) == [1, 1, 0], "a long closes when z rises above -0.5"
assert pair_positions([3.0, -3.0], 2, 0) == [-1, 0], "a jump from +3 to -3 closes the short; a new long waits for the next bar"`,
          why: 'A small state machine. It must remember the position, since the same z of 1.0 means "hold" when short and "nothing" when flat. Exiting before z reaches 0 trades some profit per trade for less time exposed to a pair that breaks.',
        },
        {
          kind: 'write',
          id: 'quant-pairs-6',
          numpy: true,
          ask: 'Write `hedge_ratio(log_a, log_b)`: the least-squares slope of ln A on ln B, with an intercept: `cov(a, b) ÷ var(b)`.',
          starter: `import numpy as np

def hedge_ratio(log_a, log_b):
    a = np.asarray(log_a, dtype=float)
    b = np.asarray(log_b, dtype=float)
    pass`,
          solution: `import numpy as np

def hedge_ratio(log_a, log_b):
    a = np.asarray(log_a, dtype=float)
    b = np.asarray(log_b, dtype=float)
    return float(((a - a.mean()) * (b - b.mean())).sum() / ((b - b.mean()) ** 2).sum())`,
          tests: `b = np.log([100.0, 102.0, 101.0, 105.0, 104.0])
out = hedge_ratio(1.5 * b + 0.2, b)
assert out is not None, "the function returns nothing yet"
assert abs(out - 1.5) < 1e-9, f"a = 1.5 b + 0.2 gives a slope of 1.5, got {out}"
rng = np.random.default_rng(2)
lb = np.cumsum(rng.normal(0, 0.01, 500)) + 4
la = 0.8 * lb + rng.normal(0, 0.002, 500) + 1
assert abs(hedge_ratio(la, lb) - 0.8) < 0.02, f"should recover a hedge ratio near 0.8, got {hedge_ratio(la, lb):.3f}"
assert abs(hedge_ratio(lb, lb) - 1) < 1e-9, "a series against itself has slope 1"`,
          why: 'The slope of a regression with an intercept is the covariance over the variance of the regressor. Fit it on a past window and use it forward; a β fitted on the whole history uses the future.',
        },
        {
          kind: 'write',
          id: 'quant-pairs-7',
          numpy: true,
          ask: 'Write `half_life(s)`: regress the change `s[t] − s[t−1]` on `s[t−1]` (with an intercept) to get the slope b, and return `−ln 2 ÷ ln(1 + b)`.',
          starter: `import numpy as np

def half_life(s):
    s = np.asarray(s, dtype=float)
    pass`,
          solution: `import numpy as np

def half_life(s):
    s = np.asarray(s, dtype=float)
    x = s[:-1]
    dy = np.diff(s)
    b = ((x - x.mean()) * (dy - dy.mean())).sum() / ((x - x.mean()) ** 2).sum()
    return float(-np.log(2) / np.log(1 + b))`,
          tests: `s = 0.5 ** np.arange(10)
out = half_life(s)
assert out is not None, "the function returns nothing yet"
assert abs(out - 1) < 1e-9, f"a gap that halves every step has a half-life of 1, got {out}"
rng = np.random.default_rng(4)
x = np.zeros(20000)
for t in range(1, 20000):
    x[t] = 0.9 * x[t - 1] + rng.normal()
assert abs(half_life(x) - 6.58) < 0.6, f"a spread with b = -0.1 has a half-life near 6.6, got {half_life(x):.2f}"`,
          why: 'The regression measures what share of the gap closes each period. The half-life turns that into a time you can compare with your holding period and your stops.',
        },
        {
          kind: 'bug',
          id: 'quant-pairs-8',
          ask: 'This half-life gives `nan` with a warning for every mean-reverting spread.',
          code: `import numpy as np

def half_life_from_b(b):
    # b: slope of the change of the spread on its last value
    return -np.log(2) / np.log(b)`,
          line: 5,
          fix: '    return -np.log(2) / np.log(1 + b)',
          why: 'A mean-reverting spread has b below zero, and the log of a negative number is undefined. Each period keeps the fraction 1 + b of the gap, so that is what goes in the log.',
        },
        {
          kind: 'choice',
          id: 'quant-pairs-9',
          ask: 'Two oil companies have daily returns correlated at 0.9. Does that make them a good pair for mean reversion?',
          options: [
            'Yes: high correlation means the spread must revert',
            'Not on its own: correlated returns can still drift apart for good; you need the spread itself to be stationary',
            'No: correlated stocks can never be cointegrated',
            'Yes, if the correlation is above 0.8',
          ],
          answer: 1,
          why: 'Correlation is about daily moves; cointegration is about the levels staying together. If one company grows a little faster every year, the returns stay correlated while the spread trends away. Test the spread.',
        },
        {
          kind: 'choice',
          id: 'quant-pairs-10',
          ask: 'In the figure, switch to **Breaks at day 250**. What does the z-score rule do after the break?',
          options: [
            'Nothing changes: the rule closes all trades as before',
            'The spread trends away, the rule fades it and holds or reopens losing trades, and without a stop the loss keeps growing',
            'It stops trading automatically',
            'It makes more money, because the moves are larger',
          ],
          answer: 1,
          why: 'After the break the spread is a random walk with drift, and "too far from the mean" is no longer a reason for it to come back. A stop at a wider z and a time stop are what limit the damage.',
        },
        {
          kind: 'design',
          id: 'quant-pairs-11',
          ask: 'Plan the research for a KO against PEP pairs strategy on daily closes, from data to a decision.',
          checklist: [
            { point: 'Fit β on a past window only, and roll it forward', why: 'A β fitted on all the data uses the future and makes the spread look more stationary.' },
            { point: 'Test the spread for mean reversion and estimate its half-life in-sample', why: 'Without reversion there is no trade; the half-life sets windows and time stops.' },
            { point: 'Fix the z window, entry, exit and stop in advance, and look for a plateau', why: 'Each tuned setting is a chance to fit noise.' },
            { point: 'Model costs on both legs, in and out, plus short borrow', why: 'Four fills a round trip can take most of a small edge.' },
            { point: 'Test out-of-sample once, on later data', why: 'Pairs that looked cointegrated often stop being so.' },
            { point: 'Check events that could break the pair: mergers, spin-offs, big changes in business', why: 'They are the main source of large losses.' },
            { point: 'Size small, with a z stop and a time stop', why: 'A broken pair can lose for a long time.' },
            { point: 'Count how many pairs you screened to find this one', why: 'Screening many pairs finds cointegration by chance.' },
          ],
          why: 'A pair is a bet that a relationship continues. The research is about whether it held when you were not looking, what it costs, and how you get out when it stops.',
        },
      ],
    },
    {
      id: 'quant-portfolio',
      title: 'From signal to portfolio',
      summary: 'Correlation and diversification, volatility targeting, costs and turnover, and how much money an edge can take.',
      text: [
        'Combine positions and their risks partly cancel. For n positions of equal size and volatility σ, with average pairwise correlation ρ, the portfolio volatility is `σ × √(ρ + (1 − ρ) ÷ n)`. As n grows it falls towards `σ × √ρ`, never below. Correlation is the limit on diversification, and correlations tend to rise in sell-offs, exactly when you want them low. For weights w and covariance matrix C, the variance is `w · C · w`.',
        'Strategies combine the same way. k uncorrelated strategies with equal Sharpe ratio S, sized to equal risk, have a combined Sharpe of `S × √k`. This is why quant firms run many small, unrelated edges rather than one big one.',
        '**Volatility targeting** sizes a position so its expected volatility is constant: `weight = target volatility ÷ forecast volatility`, with the forecast from recent realised volatility (past data only) and a cap on leverage. Positions shrink when markets get wild and grow when they calm down.',
        '**Costs and turnover.** Turnover is how much you trade in a year as a multiple of capital. Annual cost ≈ turnover × cost per dollar traded. A strategy that turns over 50 times a year at 0.05% a trade pays 2.5% a year, often most of its edge. Fast signals need cheap execution.',
        "**Capacity**: trading more moves the price against you. A common rule of thumb, the square-root law, puts the impact cost per dollar at a constant times the daily volatility times `√(order size ÷ daily volume)`. Cost per dollar grows with the square root of size, so total cost grows faster than size, and every edge has a size at which it disappears. Big firms with better data, cheaper execution and lower costs take the large, easy edges. An individual's room is in small, slower, less crowded niches. How the orders themselves are sent and executed is the subject of the next module.",
      ],
      rules: [
        'Equal-weight volatility: σ × √(ρ + (1 − ρ) ÷ n). The floor is σ√ρ.',
        'k uncorrelated equal strategies: Sharpe × √k.',
        'Volatility target: weight = target ÷ forecast, from past data, with a cap.',
        'Annual cost ≈ turnover × cost per dollar traded. Net Sharpe is what counts.',
        'Impact per dollar grows with √size. Every edge has a capacity.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'quant-portfolio-1',
          ask: 'Ten positions of equal size, each with volatility 20%, have an average pairwise correlation of 0.5. What is the portfolio volatility? Give a percentage to one decimal, for example 12.3%.',
          answer: 0.148,
          tol: 0.0006,
          check: '0.20 * math.sqrt(0.5 + 0.5 / 10)',
          why: '20% × √(0.5 + 0.05) = 20% × 0.742 ≈ 14.8%. Ten positions only cut the risk by a quarter, because half the variance is shared.',
        },
        {
          kind: 'number',
          id: 'quant-portfolio-2',
          ask: 'With many positions of volatility 20% and average correlation 0.25, what does the portfolio volatility approach? Give a percentage, for example 12%.',
          answer: 0.1,
          check: '0.20 * math.sqrt(0.25)',
          why: '20% × √0.25 = 10%. However many positions you add, the shared part of the risk stays. Three call trades on SPY, QQQ and a big tech stock sit near the high-correlation end.',
        },
        {
          kind: 'number',
          id: 'quant-portfolio-3',
          ask: 'You run four uncorrelated strategies, each with a Sharpe of 0.5, sized to equal risk. What is the Sharpe ratio of the combination?',
          answer: 1,
          check: '0.5 * math.sqrt(4)',
          why: '0.5 × √4 = 1.0. The returns add while the independent noise partly cancels. With correlation between them the gain is smaller.',
        },
        {
          kind: 'number',
          id: 'quant-portfolio-4',
          ask: "Your volatility target is 10% a year. The past 20 days' realised volatility of the asset, annualised, is 25%. What weight (the fraction of capital) do you hold? Give a decimal.",
          answer: 0.4,
          check: '0.10 / 0.25',
          why: '10% ÷ 25% = 0.4, so 40% of capital. If volatility falls to 8%, the rule asks for 1.25, which is where a leverage cap is needed.',
        },
        {
          kind: 'number',
          id: 'quant-portfolio-5',
          ask: 'A strategy earns 12% a year before costs with 10% volatility. It turns over 50 times its capital a year and each dollar traded costs 0.05%. What is its Sharpe ratio after costs (ignore the risk-free rate)? Give two decimals.',
          answer: 0.95,
          tol: 0.006,
          check: '(0.12 - 50 * 0.0005) / 0.10',
          why: 'Costs are 50 × 0.05% = 2.5% a year, so the net return is 9.5% and the Sharpe 0.95 instead of 1.2. Double the turnover or the cost per trade and it falls to 0.7.',
        },
        {
          kind: 'output',
          id: 'quant-portfolio-6',
          ask: 'Two positions, the covariance matrix from their volatilities and correlation. What does this print?',
          code: `import numpy as np

w = np.array([0.6, 0.4])
vol = np.array([0.20, 0.15])
corr = np.array([[1.0, 0.5], [0.5, 1.0]])
cov = corr * np.outer(vol, vol)
print(round(float(np.sqrt(w @ cov @ w)), 3))`,
          answer: '0.159',
          why: 'Variance = 0.36 × 0.04 + 0.16 × 0.0225 + 2 × 0.6 × 0.4 × 0.5 × 0.2 × 0.15 = 0.0252, and its square root is about 15.9%. With a correlation of 1 it would be 0.6 × 20% + 0.4 × 15% = 18%.',
        },
        {
          kind: 'bug',
          id: 'quant-portfolio-7',
          ask: "This volatility-targeting rule should set the weight for day `t` from the 20 days before it. In a backtest it trades with knowledge of day t's own return.",
          code: `import numpy as np

def weight(r, t, target):
    vol = r[t - 20:t + 1].std(ddof=1) * np.sqrt(252)
    return min(target / vol, 2.0)`,
          line: 4,
          fix: '    vol = r[t - 20:t].std(ddof=1) * np.sqrt(252)',
          why: 'The slice `t - 20:t + 1` includes `r[t]`, the return the weight is about to earn. On a big day the forecast jumps and the position shrinks before the move, which is impossible live. Use `r[t - 20:t]`.',
        },
        {
          kind: 'write',
          id: 'quant-portfolio-8',
          numpy: true,
          ask: 'Write `vol_target_weights(r, target, window, cap)`: for each day t from `window` on, weight = target ÷ (sample standard deviation of `r[t − window:t]` × √252), capped at `cap`. Days before `window` get weight 0. Return an array the length of `r`.',
          starter: `import numpy as np

def vol_target_weights(r, target, window, cap):
    r = np.asarray(r, dtype=float)
    w = np.zeros(len(r))
    return w`,
          solution: `import numpy as np

def vol_target_weights(r, target, window, cap):
    r = np.asarray(r, dtype=float)
    w = np.zeros(len(r))
    for t in range(window, len(r)):
        vol = r[t - window:t].std(ddof=1) * np.sqrt(252)
        w[t] = min(target / vol, cap)
    return w`,
          tests: `rng = np.random.default_rng(0)
r = np.concatenate([rng.normal(0, 0.01, 100), rng.normal(0, 0.03, 100)])
out = vol_target_weights(r, 0.10, 20, 2.0)
assert out is not None, "the function returns nothing yet"
assert len(out) == 200 and np.all(out[:20] == 0), "one weight per day, 0 before the first full window"
want = min(0.10 / (r[30:50].std(ddof=1) * np.sqrt(252)), 2.0)
assert abs(out[50] - want) < 1e-9, f"the weight on day 50 uses r[30:50], got {out[50]} want {want}"
assert out[60:100].mean() > 2 * out[150:200].mean(), "weights should fall when volatility triples"
r2 = r.copy(); r2[50] = 0.5
assert abs(vol_target_weights(r2, 0.10, 20, 2.0)[50] - out[50]) < 1e-12, "the weight on day 50 must not use day 50's return"
assert vol_target_weights(np.full(40, 0.0001) + np.tile([0, 1e-6], 20), 0.10, 20, 1.5)[30] == 1.5, "very calm data hits the cap"`,
          why: 'The window ends the day before, so the weight is set before the return it earns. The cap stops a quiet spell from levering the position up shortly before volatility returns.',
        },
        {
          kind: 'choice',
          id: 'quant-portfolio-9',
          ask: 'Under the square-root law of market impact, you double the size of every order. What happens to the impact cost per dollar traded and to the total impact cost?',
          options: [
            'Per dollar: unchanged; total: doubles',
            'Per dollar: up by about 41%; total: up by about 2.8 times',
            'Per dollar: doubles; total: quadruples',
            'Both fall, because larger orders get better prices',
          ],
          answer: 1,
          why: 'Cost per dollar grows with √size: √2 ≈ 1.41. Total cost is that times twice the dollars: 2 × 1.41 ≈ 2.83. So the net edge per dollar shrinks as the strategy grows, until at some size it is gone.',
        },
        {
          kind: 'choice',
          id: 'quant-portfolio-10',
          ask: 'Your three strategies had pairwise correlations near 0.1 for two years. In a sharp market sell-off, what should you expect?',
          options: [
            'The correlations stay near 0.1',
            "Correlations often jump, so they lose together and the portfolio's drawdown is deeper than the calm-period correlations suggest",
            'Correlations fall to zero',
            'Diversification works best in sell-offs',
          ],
          answer: 1,
          why: 'In stress, many positions are driven by the same thing: forced selling and a rush for cash. Plan limits with stressed correlations, not the average ones.',
        },
        {
          kind: 'design',
          id: 'quant-portfolio-11',
          ask: 'You have three weak signals that passed out-of-sample tests. Plan how to turn them into one traded portfolio, and say honestly where an individual can and cannot compete.',
          checklist: [
            { point: "Measure the correlation of the signals' returns and combine them, weighting by risk", why: 'Uncorrelated signals add the most; correlated ones are one bet.' },
            { point: 'Size with a volatility target and a leverage cap', why: 'It keeps risk steady as markets change.' },
            { point: 'Estimate turnover and costs at the size you will trade, and the net Sharpe', why: 'Costs decide whether a weak signal is worth trading.' },
            { point: 'Estimate capacity with an impact model', why: 'An edge that works at $10,000 can vanish at $1,000,000.' },
            { point: 'Set portfolio limits: maximum position, gross exposure, daily loss', why: "The risk module's limits apply to systematic trading too." },
            { point: 'Plan for correlations rising in stress', why: 'The worst drawdown comes when diversification fails.' },
            { point: 'Be plain about competition: firms have faster data, cheaper execution and more research', why: 'Fast, liquid, crowded edges belong to them; an individual looks for small, slower niches.' },
            { point: 'Paper trade the whole portfolio, then the smallest size', why: 'Live results differ from backtests in ways only live data shows.' },
          ],
          why: 'A portfolio is where small edges become usable, or where costs and correlation quietly remove them. Most individual quant traders find the net result smaller than the backtest, which is the expected outcome, not a failure of method.',
        },
      ],
    },
    {
      id: 'quant-lab',
      title: 'Lab: researching a mean reversion signal',
      summary: 'Made-up prices, a z-score signal, positions, returns net of costs, Sharpe and t-statistic, in-sample against out-of-sample, in NumPy.',
      text: [
        'This lab researches one idea from start to finish: **short-term mean reversion**. The signal is the z-score of the price against its own recent average; when price is stretched above it, go short, when below, go long. The question is whether it survives costs, statistics and a test on data it never saw.',
        'The prices are made up from a fixed seed: a random walk plus a small mean-reverting wobble, so there is a faint real effect to find. Real prices may have no such effect at all, or one that costs more to trade than it pays. The lab also runs the same code on a pure random walk, where a correct pipeline must find nothing.',
        'The steps: generate prices, build the signal from past data only, turn it into positions, line positions up with the returns they earn, charge costs on every change of position, measure the Sharpe ratio and t statistic, choose a window in-sample and score it once out-of-sample. Each step repeats the helpers it needs.',
      ],
      rules: [
        'Fix the seed, so every run gives the same data.',
        'The position decided at the close of t earns the return from t to t + 1.',
        'Costs on every change of position, in and out.',
        'Report the Sharpe with its t statistic, never alone.',
        'Choose in-sample, score once out-of-sample, and compare with a random walk.',
      ],
      questions: [
        {
          kind: 'write',
          id: 'quant-lab-1',
          numpy: true,
          ask: 'Step 1: made-up prices. With `rng = np.random.default_rng(seed)`, draw `walk_steps = rng.normal(0, 0.01, n)` then `shocks = rng.normal(0, noise, n)`. Build `u[0] = 0`, `u[t] = phi × u[t−1] + shocks[t]`. Return `100 × exp(cumsum(walk_steps) + u)`.',
          starter: `import numpy as np

def make_prices(n, seed, phi=0.7, noise=0.005):
    rng = np.random.default_rng(seed)
    # draw walk steps first, then shocks
    pass`,
          solution: `import numpy as np

def make_prices(n, seed, phi=0.7, noise=0.005):
    rng = np.random.default_rng(seed)
    walk = np.cumsum(rng.normal(0, 0.01, n))
    shocks = rng.normal(0, noise, n)
    u = np.zeros(n)
    for t in range(1, n):
        u[t] = phi * u[t - 1] + shocks[t]
    return 100 * np.exp(walk + u)`,
          tests: `out = make_prices(2000, 2)
assert out is not None, "the function returns nothing yet"
assert out.shape == (2000,), f"one price per day, got shape {out.shape}"
assert np.all(out > 0), "prices must be positive"
assert np.array_equal(out, make_prices(2000, 2)), "the same seed must give the same prices"
rw = make_prices(2000, 2, phi=0.0, noise=0.0)
assert abs(rw[0] - 100 * np.exp(np.random.default_rng(2).normal(0, 0.01, 1)[0])) < 1e-9, "draw the walk steps before the shocks"
r = np.diff(np.log(make_prices(40000, 0)))
ac = np.corrcoef(r[:-1], r[1:])[0, 1]
assert -0.06 < ac < -0.01, f"the wobble should give a small negative lag-1 autocorrelation of returns, got {ac:.3f}"`,
          why: 'The walk carries the price anywhere; the wobble u is pulled back towards 0 at a rate set by phi. Their sum has a faint mean reversion in its returns, about −0.03 at lag 1: realistic in size, and invisible to the eye.',
        },
        {
          kind: 'write',
          id: 'quant-lab-2',
          numpy: true,
          ask: 'Step 2: the signal. Return `z` the length of `p`: for t from `window − 1` on, `(p[t] − mean) ÷ std` of the window `p[t − window + 1 : t + 1]` (population std). Earlier values are `nan`.',
          starter: `import numpy as np

def zscore_signal(p, window):
    p = np.asarray(p, dtype=float)
    z = np.full(len(p), np.nan)
    return z`,
          solution: `import numpy as np

def zscore_signal(p, window):
    p = np.asarray(p, dtype=float)
    z = np.full(len(p), np.nan)
    for t in range(window - 1, len(p)):
        w = p[t - window + 1:t + 1]
        z[t] = (p[t] - w.mean()) / w.std()
    return z`,
          tests: `p = np.array([10.0, 11.0, 12.0, 11.0, 13.0, 9.0])
out = zscore_signal(p, 3)
assert out is not None, "the function returns nothing yet"
assert np.isnan(out[:2]).all(), "the first window - 1 values are nan"
w = p[1:4]
assert abs(out[3] - (11 - w.mean()) / w.std()) < 1e-12, f"z[3] uses p[1:4], got {out[3]}"
p2 = p.copy(); p2[5] = 100.0
assert abs(zscore_signal(p2, 3)[4] - out[4]) < 1e-12, "z at t must not change when a later price changes"
assert abs(out[4] - (13 - 12) / np.std([12.0, 11.0, 13.0])) < 1e-12, "z[4] compares 13 with the window 12, 11, 13"`,
          why: 'The window ends at t, the close the decision is made on, and nothing after it. The test that changes a later price and checks that earlier z values stay put is the simplest lookahead test there is: use it on every feature you write.',
        },
        {
          kind: 'write',
          id: 'quant-lab-3',
          numpy: true,
          ask: 'Step 3: positions. Return an array the length of `z`: −1 where z > entry, +1 where z < −entry, 0 elsewhere (including `nan`).',
          starter: `import numpy as np

def positions(z, entry):
    z = np.asarray(z, dtype=float)
    pass`,
          solution: `import numpy as np

def positions(z, entry):
    z = np.asarray(z, dtype=float)
    pos = np.zeros(len(z))
    pos[z > entry] = -1
    pos[z < -entry] = 1
    return pos`,
          tests: `out = positions([np.nan, 1.5, -0.2, -1.3, 0.9], 1.0)
assert out is not None, "the function returns nothing yet"
assert out.tolist() == [0, -1, 0, 1, 0], f"expected [0, -1, 0, 1, 0], got {out.tolist()}"
assert positions([2.0, -2.0], 2.0).tolist() == [0, 0], "exactly at the entry level is not beyond it"`,
          why: 'Stretched above its average, short; below, long. Comparisons with `nan` are always False, so the start of the series is flat without any special case. This rule holds a position only while the stretch lasts, unlike the pairs rule that waited for z to cross 0.',
        },
        {
          kind: 'bug',
          id: 'quant-lab-4',
          ask: 'Step 4: lining up. `pos[t]` is decided at the close of day t. On the made-up prices this version gives an annualised Sharpe of about −9, far beyond anything a real strategy shows.',
          code: `import numpy as np

def gross_returns(p, pos):
    ret = np.diff(np.log(p))       # ret[t] is the return from close t to close t + 1
    return pos[1:] * ret`,
          line: 5,
          fix: '    return pos[:-1] * ret',
          why: '`pos[1:]` pairs the position decided at close t + 1 with the return that ended at close t + 1: the very move that pushed the z-score to an extreme. A fade shorts after a rise, so it is charged with that rise every time. Misalignment does not only flatter: it can make a signal look impossibly bad too. Any Sharpe beyond about ±4 on daily data deserves a hunt for this bug. The position decided at t earns ret[t]: `pos[:-1] * ret`.',
        },
        {
          kind: 'write',
          id: 'quant-lab-5',
          numpy: true,
          ask: 'Step 5: net returns. Return `pos[t] × ret[t] − cost × |pos[t] − pos[t−1]|` for t from 0 to n − 2, where `ret = np.diff(np.log(p))` and the position before the start is 0.',
          starter: `import numpy as np

def strategy_returns(p, pos, cost):
    p = np.asarray(p, dtype=float)
    pos = np.asarray(pos, dtype=float)
    ret = np.diff(np.log(p))
    return pos[:-1] * ret`,
          solution: `import numpy as np

def strategy_returns(p, pos, cost):
    p = np.asarray(p, dtype=float)
    pos = np.asarray(pos, dtype=float)
    ret = np.diff(np.log(p))
    trades = np.abs(np.diff(pos, prepend=0))[:-1]
    return pos[:-1] * ret - cost * trades`,
          tests: `p = np.array([100.0, 101.0, 100.0, 99.0])
pos = np.array([1.0, -1.0, 0.0, 0.0])
out = strategy_returns(p, pos, 0.001)
assert out is not None, "the function returns nothing yet"
assert len(out) == 3, f"one return per day after the first, got {len(out)}"
ret = np.diff(np.log(p))
want = np.array([ret[0] - 0.001, -ret[1] - 0.002, 0 - 0.001])
assert np.allclose(out, want), f"expected {want}, got {out}: entering costs 1, flipping from +1 to -1 costs 2, closing costs 1"
assert np.allclose(strategy_returns(p, pos, 0.0), [ret[0], -ret[1], 0]), "with no cost, the position at t earns ret[t]"`,
          why: 'Flipping from long to short trades two units and pays twice. A signal that flips often pays a lot; this is where most short-term mean reversion strategies die.',
        },
        {
          kind: 'write',
          id: 'quant-lab-6',
          numpy: true,
          ask: 'Step 6: the verdict. Write `sharpe_t(net, periods=252)`: return the annualised Sharpe ratio (`ddof=1`, × √periods) and the t statistic of the mean (× √n), as a pair.',
          starter: `import numpy as np

def sharpe_t(net, periods=252):
    net = np.asarray(net, dtype=float)
    pass`,
          solution: `import numpy as np

def sharpe_t(net, periods=252):
    net = np.asarray(net, dtype=float)
    per = net.mean() / net.std(ddof=1)
    return float(per * np.sqrt(periods)), float(per * np.sqrt(len(net)))`,
          tests: `net = np.array([0.01, -0.005, 0.002, 0.004, -0.003, 0.006])
out = sharpe_t(net)
assert out is not None, "the function returns nothing yet"
sr, t = out
per = net.mean() / net.std(ddof=1)
assert abs(sr - per * np.sqrt(252)) < 1e-9, f"Sharpe is mean / std(ddof=1) x sqrt(252), got {sr}"
assert abs(t - per * np.sqrt(6)) < 1e-9, f"t is mean / (std / sqrt(n)), got {t}"
sr2, t2 = sharpe_t(np.tile(net, 252))
assert abs(t2 - sr2 * np.sqrt(len(net))) < 0.05, "with 252 x 6 days, t should be about Sharpe x sqrt(years) = Sharpe x sqrt(6)"`,
          why: 'The same ratio scaled two ways: by √periods to annualise, by √n to test. With daily data, t ≈ Sharpe × √years, the rule from the lesson on measuring a strategy.',
        },
        {
          kind: 'write',
          id: 'quant-lab-7',
          numpy: true,
          ask: 'Step 7: in-sample and out-of-sample. For each window in `windows`, compute the net returns over all the data. Choose the window with the best Sharpe on the first `cut` net returns, and return `(best_window, in_sample_sharpe, out_of_sample_sharpe)`, the last from net returns `cut` onwards.',
          starter: `import numpy as np

def zscore_signal(p, window):
    z = np.full(len(p), np.nan)
    for t in range(window - 1, len(p)):
        w = p[t - window + 1:t + 1]
        z[t] = (p[t] - w.mean()) / w.std()
    return z

def positions(z, entry):
    pos = np.zeros(len(z))
    pos[z > entry] = -1
    pos[z < -entry] = 1
    return pos

def strategy_returns(p, pos, cost):
    ret = np.diff(np.log(p))
    trades = np.abs(np.diff(pos, prepend=0))[:-1]
    return pos[:-1] * ret - cost * trades

def sharpe(net):
    return net.mean() / net.std(ddof=1) * np.sqrt(252)

def choose_window(p, windows, entry, cost, cut):
    pass`,
          solution: `import numpy as np

def zscore_signal(p, window):
    z = np.full(len(p), np.nan)
    for t in range(window - 1, len(p)):
        w = p[t - window + 1:t + 1]
        z[t] = (p[t] - w.mean()) / w.std()
    return z

def positions(z, entry):
    pos = np.zeros(len(z))
    pos[z > entry] = -1
    pos[z < -entry] = 1
    return pos

def strategy_returns(p, pos, cost):
    ret = np.diff(np.log(p))
    trades = np.abs(np.diff(pos, prepend=0))[:-1]
    return pos[:-1] * ret - cost * trades

def sharpe(net):
    return net.mean() / net.std(ddof=1) * np.sqrt(252)

def choose_window(p, windows, entry, cost, cut):
    best = None
    for w in windows:
        net = strategy_returns(p, positions(zscore_signal(p, w), entry), cost)
        ins, oos = sharpe(net[:cut]), sharpe(net[cut:])
        if best is None or ins > best[1]:
            best = (w, float(ins), float(oos))
    return best`,
          tests: `rng = np.random.default_rng(2)
walk = np.cumsum(rng.normal(0, 0.01, 2000))
shocks = rng.normal(0, 0.005, 2000)
u = np.zeros(2000)
for t in range(1, 2000):
    u[t] = 0.7 * u[t - 1] + shocks[t]
p = 100 * np.exp(walk + u)
out = choose_window(p, [5, 10, 20, 40], 1.0, 0.0005, 1000)
assert out is not None, "the function returns nothing yet"
w, ins, oos = out
want = {}
for ww in [5, 10, 20, 40]:
    net = strategy_returns(p, positions(zscore_signal(p, ww), 1.0), 0.0005)
    want[ww] = (sharpe(net[:1000]), sharpe(net[1000:]))
best = max(want, key=lambda k: want[k][0])
assert w == best, f"the best in-sample window is {best}, got {w}"
assert abs(ins - want[best][0]) < 1e-9 and abs(oos - want[best][1]) < 1e-9, "report that window's in-sample and out-of-sample Sharpe"
assert choose_window(p, [10], 1.0, 0.0005, 1000)[0] == 10, "with one window, that window is chosen"`,
          why: 'The choice uses only the first part; the score on the rest is the honest number. Print `want` and compare: the in-sample winner is not the out-of-sample winner, and its out-of-sample Sharpe is lower.',
        },
        {
          kind: 'output',
          id: 'quant-lab-8',
          ask: 'Step 8: the control. The same pipeline (window 10, entry 1, cost 0.05%) on the made-up prices and on the same random walk without the wobble. What does this print?',
          code: `import numpy as np

def make_prices(n, seed, phi=0.7, noise=0.005):
    rng = np.random.default_rng(seed)
    walk = np.cumsum(rng.normal(0, 0.01, n))
    shocks = rng.normal(0, noise, n)
    u = np.zeros(n)
    for t in range(1, n):
        u[t] = phi * u[t - 1] + shocks[t]
    return 100 * np.exp(walk + u)

def net_sharpe(p, window=10, entry=1.0, cost=0.0005):
    z = np.full(len(p), np.nan)
    for t in range(window - 1, len(p)):
        w = p[t - window + 1:t + 1]
        z[t] = (p[t] - w.mean()) / w.std()
    pos = np.where(z > entry, -1.0, np.where(z < -entry, 1.0, 0.0))
    net = pos[:-1] * np.diff(np.log(p)) - cost * np.abs(np.diff(pos, prepend=0))[:-1]
    return round(net.mean() / net.std(ddof=1) * np.sqrt(252), 1)

print(net_sharpe(make_prices(2000, 2)), net_sharpe(make_prices(2000, 2, phi=0.0, noise=0.0)))`,
          answer: '0.9 -0.1',
          why: 'With the wobble, the signal earns a Sharpe near 0.9 after costs; on the identical walk without it, the same code earns slightly less than nothing, as it should. Run a pipeline on data with no edge before you trust it on data that might have one. Even 0.9 over eight years gives t ≈ 2.5, and other seeds give much less.',
        },
        {
          kind: 'design',
          id: 'quant-lab-9',
          ask: 'Step 9: reading the result. On real daily data for one ETF, your pipeline chose window 10 in-sample (Sharpe 1.1 over 5 years) and scored 0.3 out-of-sample (2 years), after costs of 0.05% a trade. What do you conclude and what do you do next?',
          checklist: [
            { point: 'Out-of-sample t ≈ 0.3 × √2 ≈ 0.4: indistinguishable from zero', why: 'Two years cannot separate a Sharpe of 0.3 from no edge.' },
            { point: 'The in-sample 1.1 was the best of several windows, so it was biased upwards', why: 'The drop from 1.1 to 0.3 is what selection and noise usually do.' },
            { point: 'Check the costs: are 0.05% fills realistic for this ETF and this turnover?', why: 'Mean reversion trades often; costs set to the true spread and slippage may remove the rest.' },
            { point: 'Run the pipeline on a random walk or on shuffled returns', why: 'It confirms the code has no lookahead before you read anything into the result.' },
            { point: 'Look at neighbouring windows and entries for a plateau', why: 'A lone good setting is noise; a broad region is more believable.' },
            { point: 'Do not re-tune on the out-of-sample years; gather new data by paper trading the frozen rules', why: 'Re-using the test data turns it into training data.' },
            { point: 'Assume any real edge is smaller than measured and crowded by faster firms', why: 'Published and obvious mean reversion signals are traded by firms with better execution.' },
          ],
          why: 'The usual honest outcome is "not proven", reached cheaply on a computer. That is the lab working, not failing: most ideas should die here, before they cost money.',
        },
      ],
    },
  ],
}
