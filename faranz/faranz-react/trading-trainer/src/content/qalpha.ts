import type { Module } from '../types'

export const qalpha: Module = {
  id: 'qalpha',
  title: 'Alpha research and factors',
  summary:
    'What is left of a return after the market and the known factors take their share: beta and alpha, the classic factors and how they faded, cross-sectional signals and quantile portfolios, cleaning and judging a signal, combining signals, and a research process that survives multiple testing.',
  lessons: [
    {
      id: 'qalpha-beta',
      title: 'Alpha and beta',
      summary: 'Regressing a return on the market: beta as exposure, alpha as what is left, and why leverage on the market is not skill.',
      widget: 'qalpha-beta',
      text: [
        "Every stock and every strategy carries some of the market's move. Regress its excess returns (return minus the risk-free rate) on the market's: `r − rf = α + β × (rm − rf) + ε`. **Beta** (β) is the slope: how many percent the asset moves for each 1% of the market. **Alpha** (α) is the intercept: the average return left after paying for that exposure. ε is the **residual**, the part the market does not explain.",
        "By least squares, `β = cov(r, rm) ÷ var(rm)` and `α = mean(r) − β × mean(rm)`, with both covariance and variance computed the same way (same `ddof`). A daily alpha annualises by × 252. In NumPy, `np.polyfit(rm, r, 1)` returns the slope then the intercept.",
        { code: `import numpy as np

def alpha_beta(r, m):
    beta = np.cov(r, m)[0, 1] / np.var(m, ddof=1)
    return r.mean() - beta * m.mean(), beta` },
        "Beta is not skill. Market exposure costs almost nothing through an index fund, so a fund that made 30% in a year the market made 20% has shown nothing if its beta was 1.5. Judge it against `rf + β × (market − rf)`, the return its beta alone would have earned. To strip beta from a position, **hedge** it: sell β dollars of the index for each dollar of stock, so the hedged return is about `r − β × rm`.",
        "Alpha is measured against noise. The standard deviation of the residual is the **residual volatility**; `information ratio = α ÷ residual volatility`, both annualised. As with Sharpe, its t statistic is about `IR × √years`, so an alpha of 3% with 12% residual volatility (IR 0.25) needs 64 years of data to reach t = 2. Beta itself drifts over time and is noisy over short windows; a common habit is to shrink estimates towards 1.",
        'Everything here is a model of returns, not a law. Alpha against the market alone may be exposure to something else the market does not capture, which is the subject of the next lesson.',
      ],
      rules: [
        'r − rf = α + β (rm − rf) + ε. β is exposure; α is what is left.',
        'β = cov(r, rm) ÷ var(rm), with the same ddof in both.',
        'Judge a return against rf + β (rm − rf), not against the market.',
        'Hedge: short β dollars of the index per dollar of stock.',
        'IR = α ÷ residual volatility; t ≈ IR × √years. Alpha takes decades to prove.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'qalpha-beta-1',
          ask: "Over the same 250 days, the covariance of a stock's daily returns with SPY's is 0.00018 and the variance of SPY's daily returns is 0.0001. What is the stock's beta?",
          answer: 1.8,
          check: '0.00018 / 0.0001',
          why: 'β = cov ÷ var(market) = 1.8. On a day SPY moves 1%, the fitted line expects the stock to move 1.8%. It says nothing about the direction the stock will go, only how strongly it follows the market.',
        },
        {
          kind: 'number',
          id: 'qalpha-beta-2',
          ask: "A fund returned 18% in a year when the market returned 15% and the risk-free rate was 3%. The fund's beta is 1.4. What was its alpha for the year? Give a percentage, for example 2.5%.",
          answer: -0.018,
          tol: 0.0002,
          check: '0.18 - (0.03 + 1.4 * (0.15 - 0.03))',
          why: 'Its beta alone would have earned 3% + 1.4 × 12% = 19.8%. It made 18%, so α = −1.8%. It beat the market and still did worse than a leveraged index position with the same risk.',
        },
        {
          kind: 'choice',
          id: 'qalpha-beta-3',
          ask: 'In a year SPY rose 25% and cash paid 4%. A trader made 32% holding high-beta tech stocks with a portfolio beta of 1.5. What does the regression say?',
          options: [
            'They have about 7% of alpha: 32% against 25%',
            'Their alpha is about −3.5%: beta 1.5 alone would have earned about 35.5%',
            'Alpha cannot be measured over a year, so the result says nothing at all',
            'Their alpha is 32%, because alpha is the total return',
          ],
          answer: 1,
          why: '4% + 1.5 × (25% − 4%) = 35.5%, so the stock picking cost about 3.5%. In a rising market high beta flatters a record; in a falling one the same portfolio loses more than the market. One year of data also leaves a wide error around any alpha estimate.',
        },
        {
          kind: 'output',
          id: 'qalpha-beta-4',
          ask: 'A stock built to be exactly 1.5 times the market plus a small daily alpha. What does this print?',
          code: `import numpy as np

m = np.array([0.01, -0.02, 0.005, 0.015, -0.01])
r = 0.0002 + 1.5 * m
beta, alpha = np.polyfit(m, r, 1)
print(round(beta, 2), round(alpha, 4))`,
          answer: '1.5 0.0002',
          why: '`np.polyfit(x, y, 1)` returns the slope first and the intercept second. With no noise the fit recovers both exactly; real data adds a residual and with it a standard error on each.',
        },
        {
          kind: 'bug',
          id: 'qalpha-beta-5',
          ask: 'This should return the beta of `r` on the market `m`. For a stock that moves exactly twice the market every day it returns 0.5 instead of 2.',
          code: `import numpy as np

def beta(r, m):
    r = np.asarray(r, dtype=float)
    m = np.asarray(m, dtype=float)
    return np.cov(r, m)[0, 1] / np.var(r, ddof=1)`,
          line: 6,
          fix: '    return np.cov(r, m)[0, 1] / np.var(m, ddof=1)',
          why: "Beta divides by the market's variance. Dividing by the stock's gives cov ÷ var(stock), which is the slope of the market on the stock: 2σ² ÷ 4σ² = 0.5. The ddof must match `np.cov`, which uses 1 by default.",
        },
        {
          kind: 'number',
          id: 'qalpha-beta-6',
          ask: 'You hold $50,000 of a stock with beta 1.2 and want no market exposure. How many dollars of SPY do you sell short?',
          answer: 60000,
          check: '50000 * 1.2',
          why: '1.2 × $50,000 = $60,000. A 1% market move then changes the stock by about $600 and the short by −$600. What is left is the residual, which is the bet you meant to make, plus the error in the beta estimate.',
        },
        {
          kind: 'number',
          id: 'qalpha-beta-7',
          ask: 'Your position is long a stock with beta 1.2, hedged with SPY at that beta. Today SPY rose 1% and the stock rose 2%. What was the hedged return, per dollar of stock? Give a percentage, for example 0.5%.',
          answer: 0.008,
          tol: 0.0001,
          check: '0.02 - 1.2 * 0.01',
          why: '2% − 1.2 × 1% = 0.8%. The hedge took away the 1.2% the market explains. Over many days, the average of this number is the alpha and its spread is the residual volatility.',
        },
        {
          kind: 'number',
          id: 'qalpha-beta-8',
          ask: 'A strategy has an alpha of 3% a year with residual volatility of 12% a year. Its information ratio is 0.25. About how many years of data are needed before the t statistic of the alpha reaches 2?',
          answer: 64,
          check: '(2 / 0.25) ** 2',
          why: 't ≈ IR × √years, so √years = 8 and years = 64. A real but modest alpha is close to impossible to prove from returns alone, which is why the reasoning behind a signal matters as much as its record.',
        },
        {
          kind: 'write',
          id: 'qalpha-beta-9',
          numpy: true,
          ask: 'Write `alpha_beta(r, m)`: return `(alpha, beta)` per period from the least-squares fit of `r` on `m`, with `beta = cov ÷ var` (both `ddof=1`) and `alpha = mean(r) − beta × mean(m)`.',
          starter: `import numpy as np

def alpha_beta(r, m):
    r = np.asarray(r, dtype=float)
    m = np.asarray(m, dtype=float)
    pass`,
          solution: `import numpy as np

def alpha_beta(r, m):
    r = np.asarray(r, dtype=float)
    m = np.asarray(m, dtype=float)
    beta = np.cov(r, m)[0, 1] / np.var(m, ddof=1)
    return float(r.mean() - beta * m.mean()), float(beta)`,
          tests: `m = np.array([0.01, -0.02, 0.005, 0.015, -0.01])
out = alpha_beta(0.0002 + 1.5 * m, m)
assert out is not None, "the function returns nothing yet"
a, b = out
assert abs(b - 1.5) < 1e-9, f"beta should be 1.5, got {b}"
assert abs(a - 0.0002) < 1e-12, f"alpha should be 0.0002, got {a}"
rng = np.random.default_rng(3)
m = rng.normal(0.0005, 0.01, 5000)
r = 0.0001 + 0.8 * m + rng.normal(0, 0.01, 5000)
a, b = alpha_beta(r, m)
pb, pa = np.polyfit(m, r, 1)
assert abs(b - pb) < 1e-9 and abs(a - pa) < 1e-9, "the answer should match np.polyfit(m, r, 1)"
assert abs(alpha_beta(2 * m, m)[1] - 2) < 1e-9, "divide by the variance of the market, not of the stock"`,
          why: 'Two lines, and the same answer as `np.polyfit`. Writing it out shows what beta is: how much of the market\'s variance the stock shares, per unit of that variance.',
        },
        {
          kind: 'choice',
          id: 'qalpha-beta-10',
          ask: 'In the figure, set the true alpha to 0 and the true beta to 2. The stock returns about 21% against the market\'s 15%. What do the fitted alpha and its t say?',
          options: [
            'The stock has about 6% of alpha, the gap between the two returns',
            'The fitted alpha is a few percent below zero with a t near zero: the extra return is all beta',
            'The t is above 2, so the stock has skill',
            'Beta cannot be estimated from one year of data',
          ],
          answer: 1,
          why: 'The extra return came from doubling the market\'s move in a year the market rose. The fitted alpha is noise around zero, here slightly negative. Set the market falling and the same stock would lose twice as much.',
        },
        {
          kind: 'choice',
          id: 'qalpha-beta-11',
          ask: 'In the figure, set beta to 1, the true alpha to 4% a year and the residual volatility to 1.5% a day. What does the t of the fitted alpha tell you after one year?',
          options: [
            'It is well above 2: a 4% alpha is easy to see',
            'It is close to 0: against 1.5% daily noise, one year cannot tell a 4% alpha from none',
            'It equals 4, the alpha in percent',
            'It is negative, so the alpha must be negative',
          ],
          answer: 1,
          why: 'Residual volatility of 1.5% a day is about 24% a year, so the IR is about 0.17 and the expected t after a year is 0.17. Lower the residual volatility to 0.5% a day and the same alpha becomes easier to see, which is why hedged, diversified books can measure small alphas faster.',
        },
        {
          kind: 'design',
          id: 'qalpha-beta-12',
          ask: 'A newsletter says its stock picks "beat the S&P 500 by 9% a year for three years". What do you need to know before you believe there is any alpha?',
          checklist: [
            { point: 'The beta of the picks, and the return that beta alone would have earned', why: 'High-beta picks beat a rising market with no skill.' },
            { point: 'The residual volatility and the t of the alpha over three years', why: 'Three years of a concentrated list leaves a wide error band around any alpha.' },
            { point: 'Exposure to known factors: small stocks, momentum, value, sectors', why: 'Return from a known tilt is cheaply available elsewhere, and is the next lesson.' },
            { point: 'Whether the record includes every pick, at prices that could have been traded', why: 'Survivorship and favourable fill prices inflate a record.' },
            { point: 'How many other lists or periods were tried before this one was advertised', why: 'The best of many records is the one you get shown.' },
            { point: 'Costs, taxes and spreads at the size you would trade', why: 'A gross alpha on small stocks can vanish after costs.' },
          ],
          why: 'Beating an index is not alpha. Alpha is what remains after the risks you could have bought cheaply, measured against the noise, from a record that was not picked from many.',
        },
      ],
    },
    {
      id: 'qalpha-factors',
      title: 'The classic factors',
      summary: 'Value, momentum, size, quality, low volatility and carry: how each is built, what the evidence says, and how it has faded.',
      text: [
        'A **factor** is a long-short portfolio built by sorting stocks on one characteristic and buying one end and selling the other. The return of that portfolio is the factor return. A **factor model** regresses an asset on several of them at once: `r − rf = α + β·MKT + s·SMB + h·HML + m·UMD + ε`. Alpha is then what is left after the market and the known factors.',
        "The classic ones: **size** (SMB, small minus big, Banz 1981, Fama and French 1993); **value** (HML, high minus low book-to-market); **momentum** (UMD, past 12-month winners minus losers, skipping the most recent month because one-month returns tend to reverse: Jegadeesh and Titman 1993, Carhart 1997); **quality** or profitability (RMW, strong minus weak operating profitability, Novy-Marx 2013, Fama and French 2015); **low volatility** or low beta (betting against beta, Frazzini and Pedersen 2014); **carry**, the return an asset earns if its price does not change, such as a currency's interest rate gap (Koijen, Moskowitz, Pedersen and Vrugt 2018).",
        { code: `import numpy as np

# F: factor returns, shape (months, k); r: the fund's excess returns
X = np.column_stack([np.ones(len(F)), F])
coef, *_ = np.linalg.lstsq(X, r, rcond=None)
alpha, loadings = coef[0], coef[1:]` },
        'The evidence has faded, and the factors have long losing spells. The US size premium was weak after the early 1980s and lives mostly in the smallest stocks. Value (HML) lost roughly half its value against growth from 2007 to 2020, the deepest drawdown in its recorded history by most measures. Momentum crashes in rebounds: from March to May 2009 the past-loser decile rose about 163% while the winners gained about 8% (Daniel and Moskowitz). Low beta results depend on how beta is estimated (Novy-Marx and Velikov 2022). A factor with a true Sharpe of 0.3 still loses money over a whole decade about one time in six.',
        "Why this matters to you: a new signal is often a known factor in disguise. If your 'alpha' disappears when you add momentum or value to the regression, you rediscovered a factor that index-like funds sell cheaply. Factor returns for the US and other markets are free from Kenneth French's data library at the time of writing (2026).",
      ],
      rules: [
        'A factor is a long-short sort on one characteristic.',
        'Alpha after factors: regress on market, size, value, momentum and the rest; read the intercept.',
        'Momentum: 12-month return skipping the last month.',
        'Every factor has had long losing spells; momentum crashes in sharp rebounds.',
        'A signal that dies when you add known factors is not new alpha.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'qalpha-factors-1',
          ask: "A fund's excess return last year was 9%. Its loadings are 1.1 on the market, 0.4 on SMB and 0.5 on HML, and those factors returned 6%, 1% and 2%. What is its alpha against this three-factor model? Give a percentage, for example 2.5%.",
          answer: 0.01,
          tol: 0.0002,
          check: '0.09 - (1.1 * 0.06 + 0.4 * 0.01 + 0.5 * 0.02)',
          why: 'The factors explain 6.6% + 0.4% + 1.0% = 8.0%, so 1% is left. Against the market alone the same fund would show 9% − 6.6% = 2.4% of alpha: most of the difference was a tilt to small and cheap stocks.',
        },
        {
          kind: 'choice',
          id: 'qalpha-factors-2',
          ask: "Why does the standard momentum signal use the return from 12 months ago to 1 month ago, and not the last 12 months?",
          options: [
            'Data for the last month is not available until the month after',
            'Returns over the most recent month tend to reverse, which works against the 12-month effect',
            'It makes the signal cheaper to compute',
            'Regulators forbid trading on the last month',
          ],
          answer: 1,
          why: 'Short-term reversal pulls the other way: last month\'s winners tend to give a little back next month. Skipping the month separates the two effects. It is a convention from the papers, not a law; test both.',
        },
        {
          kind: 'output',
          id: 'qalpha-factors-3',
          ask: 'A made-up fund built from three factor returns plus a small monthly alpha, then regressed on them. What does this print?',
          code: `import numpy as np

rng = np.random.default_rng(0)
F = rng.normal(0, 0.03, (60, 3))       # market, value, momentum, monthly
r = 0.002 + F @ np.array([1.1, 0.4, -0.2])
X = np.column_stack([np.ones(60), F])
coef, *_ = np.linalg.lstsq(X, r, rcond=None)
print(np.round(coef, 3).tolist())`,
          answer: '[0.002, 1.1, 0.4, -0.2]',
          why: 'The column of ones gives the intercept, the alpha; the other coefficients are the loadings. With no noise they come back exactly. In real data each has a standard error, and a negative momentum loading like this one means the fund leans against recent winners.',
        },
        {
          kind: 'bug',
          id: 'qalpha-factors-4',
          ask: 'This should give the 12-1 momentum signal at the end of month t: the return from the close of month t − 12 to the close of month t − 1. It includes the most recent month.',
          code: `import numpy as np

def momentum_12_1(p, t):
    # p: monthly closing prices, shape (months, stocks)
    return p[t] / p[t - 12] - 1`,
          line: 5,
          fix: '    return p[t - 1] / p[t - 12] - 1',
          why: 'Ending at `p[t]` folds in the last month, where returns tend to reverse. `p[t − 1] / p[t − 12] − 1` covers the eleven months from t − 12 to t − 1. Both use only data known at the end of month t, so neither is lookahead; they are different signals.',
        },
        {
          kind: 'number',
          id: 'qalpha-factors-5',
          ask: 'A momentum book is $1 long the past-winner decile and $1 short the past-loser decile per $1 of capital. In a rebound the winners gain 8% and the losers rise 163%, as in March to May 2009. What is the return on capital? Give a percentage, for example −25%.',
          answer: -1.55,
          tol: 0.005,
          check: '0.08 - 1.63',
          why: '+8% on the long, −163% on the short: −155% of capital. A short has no ceiling on its loss. In practice a book this levered would have been cut or margin-called on the way, which is how factor crashes turn into permanent losses.',
        },
        {
          kind: 'number',
          id: 'qalpha-factors-6',
          ask: 'A factor has a true annual Sharpe ratio of 0.3. Treating annual returns as independent and normal, what is the chance it loses money over a 10-year period? Use Φ(−0.3 × √10). Give a decimal to 2 places.',
          answer: 0.17,
          tol: 0.006,
          check: '0.5 * (1 + math.erf(-0.3 * math.sqrt(10) / math.sqrt(2)))',
          hint: 'Over n years the mean grows with n and the volatility with √n, so the ten-year Sharpe is 0.3 × √10 ≈ 0.95.',
          why: 'Φ(−0.95) ≈ 0.17: about one decade in six. A real premium can disappear for long enough that people decide it was never there. The 2007 to 2020 value drawdown was that kind of decade.',
        },
        {
          kind: 'write',
          id: 'qalpha-factors-7',
          numpy: true,
          ask: 'Write `factor_regression(r, F)`: regress `r` (shape (T,)) on the factor returns `F` (shape (T, k)) with an intercept, by `np.linalg.lstsq`, and return `(alpha, loadings)` with loadings an array of length k.',
          starter: `import numpy as np

def factor_regression(r, F):
    r = np.asarray(r, dtype=float)
    F = np.asarray(F, dtype=float)
    pass`,
          solution: `import numpy as np

def factor_regression(r, F):
    r = np.asarray(r, dtype=float)
    F = np.asarray(F, dtype=float)
    X = np.column_stack([np.ones(len(r)), F])
    coef, *_ = np.linalg.lstsq(X, r, rcond=None)
    return float(coef[0]), coef[1:]`,
          tests: `rng = np.random.default_rng(1)
F = rng.normal(0, 0.03, (120, 3))
r = 0.001 + F @ np.array([0.9, 0.3, 0.5])
out = factor_regression(r, F)
assert out is not None, "the function returns nothing yet"
a, b = out
assert abs(a - 0.001) < 1e-9, f"alpha should be 0.001, got {a}"
assert np.allclose(b, [0.9, 0.3, 0.5]), f"loadings should be [0.9, 0.3, 0.5], got {b}"
a2, b2 = factor_regression(r + 0.01, F)
assert abs(a2 - 0.011) < 1e-9, "adding 1% a month to every return adds 1% to alpha: include the column of ones"`,
          why: 'The column of ones lets the intercept absorb the average return the factors do not explain. Leave it out and the loadings are forced to explain everything, which biases them and hides the alpha.',
        },
        {
          kind: 'choice',
          id: 'qalpha-factors-8',
          ask: 'Your new stock signal has an alpha of 5% a year against the market, t = 2.6. Against market, size, value and momentum, the alpha is 0.4%, t = 0.2, with a momentum loading of 0.8. What have you found?',
          options: [
            'A new source of return worth 5% a year',
            'Mostly momentum in disguise: the signal adds little once momentum is held',
            'A signal that hedges momentum',
            'Proof that the factor model is wrong',
          ],
          answer: 1,
          why: 'Once momentum is in the regression, almost nothing is left. That is useful to know: you can get momentum exposure more cheaply, and your signal will crash when momentum does.',
        },
        {
          kind: 'choice',
          id: 'qalpha-factors-9',
          ask: 'In currency markets, what is carry?',
          options: [
            'The trend in the exchange rate over the past year',
            "The return you earn if prices do not change: roughly the interest rate gap between the two currencies",
            'The cost of holding a position overnight at a broker',
            'The spread between bid and ask',
          ],
          answer: 1,
          why: 'Holding a high-rate currency against a low-rate one earns the rate gap as long as the exchange rate stays put. Carry trades have often unwound sharply in crises, when the high-rate currency falls faster than the rate gap pays.',
        },
        {
          kind: 'choice',
          id: 'qalpha-factors-10',
          ask: 'The low volatility or betting-against-beta effect says what, in plain words?',
          options: [
            'High-beta stocks always fall in a crash',
            'Low-beta stocks have historically earned more than their beta implies, and high-beta stocks less; one explanation is that investors who cannot borrow buy high beta instead',
            'Low-volatility stocks have no risk',
            'Beta does not exist',
          ],
          answer: 1,
          why: 'The risk-return line implied by beta has been flatter in the data than the model says. The size of the effect depends on how beta is estimated and on costs, and like every factor it has had long poor spells.',
        },
        {
          kind: 'design',
          id: 'qalpha-factors-11',
          ask: 'You have a stock signal with an attractive backtest. Describe how you check whether it is new or a known factor in disguise.',
          checklist: [
            { point: 'Regress its long-short returns on market, size, value, momentum, profitability and low beta', why: 'The intercept is what the known factors do not explain.' },
            { point: 'Look at the loadings, not only the intercept', why: 'A large loading tells you what the signal really bets on and when it will crash.' },
            { point: 'Correlate the signal itself with the factor characteristics across stocks', why: 'A signal that is 0.7 correlated with past returns is mostly momentum.' },
            { point: 'Use factor returns built the same way and over the same dates as your test', why: 'Mismatched construction makes alphas appear and vanish.' },
            { point: 'Report the alpha with its t statistic and the number of years', why: 'A small alpha over a short sample is indistinguishable from zero.' },
            { point: 'Check whether the residual alpha survives costs', why: 'What remains after factors is usually small, and costs are not.' },
          ],
          why: 'Most new signals load on old factors. Knowing which ones tells you what you own, what it should cost and how it will behave in a crisis.',
        },
      ],
    },
    {
      id: 'qalpha-xsection',
      title: 'Cross-sectional and time-series signals',
      summary: 'Comparing assets with each other or with their own past; ranking, quantile portfolios and the long-short spread.',
      widget: 'qalpha-quantiles',
      text: [
        "A **time-series** signal compares an asset with its own past and decides long or short on its own: hold SPY when its 12-month return is positive, otherwise go flat or short. **Time-series momentum** across futures markets is the best-known case (Moskowitz, Ooi and Pedersen 2012). Its net exposure moves with the market: in a broad rally everything is long.",
        "A **cross-sectional** signal compares assets with each other on the same date: rank 500 stocks by 12-1 momentum, buy the top and sell the bottom. It bets on **relative** returns, so the long and short sides cancel much of the market's move. It can make money in a falling market if the losers fall further than the winners.",
        "To test a cross-sectional signal, form **quantile portfolios**: each period sort stocks by the signal, cut them into q equal groups (q = 5 gives **quintiles**, 10 gives **deciles**) and record each group's average return over the next period. A useful signal shows a **monotonic** staircase from the lowest group to the highest. The **long-short spread**, top minus bottom, is the return of a dollar-neutral portfolio, before costs.",
        { code: `import numpy as np

ranks = np.argsort(np.argsort(signal))      # 0 = lowest
group = ranks * q // len(signal)            # 0 .. q - 1
means = [fwd[group == k].mean() for k in range(q)]` },
        "Read the shape, not only the spread. If all of the spread comes from the bottom group, the edge lives on the short side, where borrow fees, short squeezes and hard-to-borrow stocks live too. If the middle groups jump around, the signal may be noise with a lucky tail. Rank weights (`rank − mean rank`, scaled to 100% long and 100% short) use every stock and are less sensitive to where the quantile cut falls.",
      ],
      rules: [
        'Time series: each asset against its own past; net exposure moves with the market.',
        'Cross section: assets against each other today; long top, short bottom.',
        'Quantile test: sort, cut into q groups, average the next-period return of each.',
        'Want a staircase, not one group doing all the work.',
        'The spread is gross. Shorts cost borrow, and both sides cost trading.',
      ],
      questions: [
        {
          kind: 'choice',
          id: 'qalpha-xsection-1',
          ask: 'The whole market falls 20% in a quarter. Which signal is more likely to make money, before costs?',
          options: [
            'A time-series rule that was long every stock with a positive past year',
            'A dollar-neutral cross-sectional rule, if its longs fell less than its shorts',
            'Both lose exactly the market return',
            'Neither can make money in a falling market',
          ],
          answer: 1,
          why: 'The cross-sectional book is long and short in equal dollars, so the market\'s fall largely cancels and only the relative move counts. The time-series rule was long going in and takes the fall until its signal flips.',
        },
        {
          kind: 'number',
          id: 'qalpha-xsection-2',
          ask: 'A signal\'s top quintile earned 1.2% a month on average and its bottom quintile 0.4%. What is the long-short spread a year, before costs, adding the months without compounding? Give a percentage, for example 5%.',
          answer: 0.096,
          tol: 0.0005,
          check: '(0.012 - 0.004) * 12',
          why: '0.8% a month × 12 = 9.6% a year, gross. Before treating it as an edge, look at its t statistic over the months, the shape of the middle quintiles, and the costs of rebuilding both sides every month.',
        },
        {
          kind: 'output',
          id: 'qalpha-xsection-3',
          ask: 'Six stocks assigned to three quantile groups by their signal. What does this print?',
          code: `import numpy as np

s = np.array([0.3, -1.2, 2.0, 0.1, -0.4, 0.9])
ranks = np.argsort(np.argsort(s))
group = ranks * 3 // len(s)
print(group.tolist())`,
          answer: '[1, 0, 2, 1, 0, 2]',
          why: 'The ranks are [3, 0, 5, 2, 1, 4]; times 3, divided by 6 and rounded down gives groups of two: −1.2 and −0.4 in group 0, 0.1 and 0.3 in group 1, 0.9 and 2.0 in group 2.',
        },
        {
          kind: 'bug',
          id: 'qalpha-xsection-4',
          ask: 'This should put each stock in a quantile group by its signal. The groups come out scrambled: high signals land in the bottom group.',
          code: `import numpy as np

def groups(signal, q):
    signal = np.asarray(signal, dtype=float)
    ranks = np.argsort(signal)
    return ranks * q // len(signal)`,
          line: 5,
          fix: '    ranks = np.argsort(np.argsort(signal))',
          why: 'One `argsort` gives the order, the index of the smallest stock first, not each stock\'s rank. The second `argsort` turns that order into a rank for every stock. A test with a sorted input would not catch this, since both give the same answer there.',
        },
        {
          kind: 'write',
          id: 'qalpha-xsection-5',
          numpy: true,
          ask: 'Write `quantile_means(signal, fwd, q)`: rank one period\'s `signal` (double `argsort`), assign groups `rank × q // n`, and return an array of length q with the mean of `fwd` in each group, lowest group first.',
          starter: `import numpy as np

def quantile_means(signal, fwd, q):
    signal = np.asarray(signal, dtype=float)
    fwd = np.asarray(fwd, dtype=float)
    pass`,
          solution: `import numpy as np

def quantile_means(signal, fwd, q):
    signal = np.asarray(signal, dtype=float)
    fwd = np.asarray(fwd, dtype=float)
    group = np.argsort(np.argsort(signal)) * q // len(signal)
    return np.array([fwd[group == k].mean() for k in range(q)])`,
          tests: `s = np.array([0.3, -1.2, 2.0, 0.1, -0.4, 0.9])
f = np.array([0.02, -0.03, 0.05, 0.00, -0.01, 0.04])
out = quantile_means(s, f, 3)
assert out is not None, "the function returns nothing yet"
assert len(out) == 3, f"one mean per group, got {len(out)}"
assert np.allclose(out, [-0.02, 0.01, 0.045]), f"expected [-0.02, 0.01, 0.045], got {out}"
assert np.allclose(quantile_means(-s, f, 3), [0.045, 0.01, -0.02]), "group 0 is the lowest signal"
rng = np.random.default_rng(0)
s2 = rng.normal(size=1000)
assert np.allclose(quantile_means(s2, s2, 10), np.sort(quantile_means(s2, s2, 10))), "a signal that is its own return gives a rising staircase"`,
          why: 'Mean by group is all a quantile test is. Run it each period and average the rows to get the staircase in the figure.',
        },
        {
          kind: 'write',
          id: 'qalpha-xsection-6',
          numpy: true,
          ask: 'Write `rank_weights(signal)`: weights proportional to `rank − mean rank`, scaled so the long weights add to 1 and the short weights to −1.',
          starter: `import numpy as np

def rank_weights(signal):
    signal = np.asarray(signal, dtype=float)
    pass`,
          solution: `import numpy as np

def rank_weights(signal):
    signal = np.asarray(signal, dtype=float)
    r = np.argsort(np.argsort(signal)).astype(float)
    d = r - r.mean()
    return d / (np.abs(d).sum() / 2)`,
          tests: `out = rank_weights([0.5, -1.0, 2.0, 0.1])
assert out is not None, "the function returns nothing yet"
assert np.allclose(out, [0.25, -0.75, 0.75, -0.25]), f"ranks 2, 0, 3, 1 give [0.25, -0.75, 0.75, -0.25], got {out}"
w = rank_weights(np.random.default_rng(2).normal(size=101))
assert abs(w.sum()) < 1e-12, "dollar neutral: the weights add to 0"
assert abs(w[w > 0].sum() - 1) < 1e-12 and abs(w[w < 0].sum() + 1) < 1e-12, "100% long and 100% short"
assert np.allclose(rank_weights([1.0, 2.0, 1000.0]), rank_weights([1.0, 2.0, 3.0])), "an outlier gets no more weight than any other top stock"`,
          why: 'Ranks spread the bet over every stock and ignore how extreme the top value is. Scaling to 100% each way makes the return comparable from day to day, whatever the number of stocks.',
        },
        {
          kind: 'choice',
          id: 'qalpha-xsection-7',
          ask: "A signal's average next-month return by quintile, lowest signal first. What does the shape tell you?",
          chart: {
            title: 'Mean next-month return by quintile (%)',
            x: 'quintile',
            y: '% a month',
            series: [{ name: 'return', points: [-0.4, 0.9, 1.0, 0.9, 1.1], color: 'accent' }],
          },
          options: [
            'A strong signal: the spread is 1.5% a month',
            'Almost all of the spread comes from the bottom quintile; the signal mainly says which stocks to avoid, and the edge sits on the short side',
            'A momentum signal, because the top quintile is highest',
            'The signal is useless because the line is not straight',
          ],
          answer: 1,
          why: 'Quintiles 2 to 5 are flat; only the bottom one stands out. Trading the spread means shorting those stocks, often small, volatile and costly to borrow. A long-only version gains almost nothing, and the short side carries the risk of squeezes.',
        },
        {
          kind: 'choice',
          id: 'qalpha-xsection-8',
          ask: 'In the figure, set the true IC to 0 and look at the bars, then set it to 0.05. What is the lesson?',
          options: [
            'At IC 0 the bars are all exactly zero',
            'At IC 0 the bars still wobble and the spread is not zero, so a single spread needs its t statistic; at 0.05 a clear staircase and a t well above 2 appear',
            'An IC of 0.05 is too small to show anything',
            'More quantiles always give a higher t',
          ],
          answer: 1,
          why: 'Five years of noise produce bars of a few tenths of a percent in either direction. The t of the spread across months, not its size in one picture, tells the two cases apart. Ten quantiles widen the spread but put fewer stocks in each end, so the t does not rise with it.',
        },
        {
          kind: 'number',
          id: 'qalpha-xsection-9',
          ask: 'A dollar-neutral book holds $100,000 long and $100,000 short. Over a month the longs rise 3% and the shorts rise 1%. What is the P&L in dollars, before costs?',
          answer: 2000,
          check: '100000 * 0.03 - 100000 * 0.01',
          why: '+$3,000 on the longs, −$1,000 on the shorts: +$2,000. The market rose and both sides went up, but only the 2% gap counted. Had the shorts risen 5%, the book would have lost money in a rising market.',
        },
        {
          kind: 'number',
          id: 'qalpha-xsection-10',
          ask: 'A time-series momentum rule holds 10 futures markets with equal risk, long when the past year is positive and short when negative. Seven are long and three short. What is its net exposure as a fraction of gross? Give a decimal.',
          answer: 0.4,
          check: '(7 - 3) / 10',
          why: '(7 − 3) ÷ 10 = 0.4, net long. A time-series book can be all long or all short, so it carries direction that a cross-sectional book mostly cancels. That is neither good nor bad, but it is a different bet.',
        },
        {
          kind: 'design',
          id: 'qalpha-xsection-11',
          ask: 'Plan a quantile test of a monthly cross-sectional signal on 500 US stocks over 15 years.',
          checklist: [
            { point: 'Use the stocks that were in the universe at each date, delisted ones included', why: "Today's 500 are survivors, and survivors flatter any signal." },
            { point: 'Compute the signal from data known at the end of each month, and measure the next month\'s return', why: 'The signal and the return must not overlap.' },
            { point: 'Sort into quintiles or deciles every month and record the mean return of each', why: 'The staircase shows whether the information is spread across the range or sits in one tail.' },
            { point: 'Report the spread with its t statistic over the months', why: 'Noise alone produces spreads of a few tenths of a percent.' },
            { point: 'Check how much of the spread comes from the short side', why: 'Short-side returns are the hardest and costliest to capture.' },
            { point: 'Measure turnover and subtract costs and borrow fees', why: 'The spread is gross; a monthly rebuild costs real money.' },
            { point: 'Look at the spread by year and in market crashes', why: 'An average can hide a decade of losses or a crash.' },
          ],
          why: 'A quantile test is simple to run and easy to fool. Each check removes one of the usual ways a spread looks larger than anything you could earn.',
        },
      ],
    },
    {
      id: 'qalpha-clean',
      title: 'Cleaning a signal',
      summary: 'Winsorising and z-scoring, neutralising to sectors and to the market, and what neutralising removes.',
      widget: 'qalpha-neutral',
      text: [
        'Raw signals are messy: a data error, a takeover target up 80%, a stock with a tiny book value whose ratio explodes. Left alone, a few values dominate a z-score and the portfolio. **Winsorising** caps them: clip each value at a low and a high percentile of the day\'s cross-section (often the 1st and 99th), or at ±3 standard deviations. Ranking, from the quant module, is the strongest version: it keeps only the order.',
        'Then **z-score** across stocks each day: subtract the day\'s mean and divide by its standard deviation, so signals in different units can be compared and combined. Winsorise first and z-score after, or z-score, clip at ±3 and z-score again: outliers distort the mean and standard deviation you divide by. A stock with a missing value gets 0 after z-scoring, which means no view, never a value carried back from the future.',
        { code: `import numpy as np

lo, hi = np.percentile(x, [1, 99])
x = np.clip(x, lo, hi)
z = (x - x.mean()) / x.std()` },
        'A signal can carry bets you did not mean to make. A value signal piles into banks and away from tech; a low-volatility signal is long utilities and low beta. **Sector neutralising** subtracts each sector\'s mean from its stocks, so the portfolio nets to zero in every sector and only the ranking within sectors is left. **Beta neutralising** regresses the signal on the stocks\' betas (with an intercept) across stocks and keeps the residual: weights in proportion to it have zero net beta and add to zero.',
        'Neutralising is a choice, not a free gain. It removes risk you did not intend, which usually makes the alpha easier to see and the drawdowns smaller. It also removes return if the sector or market bet was where the information was. Test both versions and decide which bet you want to hold, before you see which backtest looks better.',
      ],
      rules: [
        'Winsorise (or rank) before z-scoring; outliers distort the mean and the standard deviation.',
        'Z-score across stocks each day; missing values become 0, never a guess from later data.',
        'Sector neutral: subtract each sector\'s mean.',
        'Beta neutral: keep the residual of the signal regressed on beta, with an intercept.',
        'Neutralising removes unwanted risk, and sometimes return. Decide before you look.',
      ],
      questions: [
        {
          kind: 'output',
          id: 'qalpha-clean-1',
          ask: 'Winsorising five values at the 5th and 95th percentiles. What does this print?',
          code: `import numpy as np

x = np.array([1.0, 2.0, 3.0, 4.0, 100.0])
lo, hi = np.percentile(x, [5, 95])
print(np.round(np.clip(x, lo, hi), 1).tolist())`,
          answer: '[1.2, 2.0, 3.0, 4.0, 80.8]',
          why: 'With five values, the 95th percentile falls 80% of the way from 4 to 100, so the outlier is barely trimmed. Percentile clipping needs a wide cross-section; on a handful of values, clip at a fixed number of standard deviations or use ranks.',
        },
        {
          kind: 'number',
          id: 'qalpha-clean-2',
          ask: 'One day\'s signal is [−1, 0, 1, 2, 8]. You clip it at 3, then z-score with the population standard deviation. What is the z-score of the largest stock? Give two decimals.',
          answer: 1.41,
          tol: 0.006,
          check: '(lambda x: (x[-1] - x.mean()) / x.std())(np.clip(np.array([-1.0, 0, 1, 2, 8]), None, 3))',
          why: 'After clipping the values are [−1, 0, 1, 2, 3], mean 1 and standard deviation √2, so (3 − 1) ÷ 1.414 ≈ 1.41. Without clipping, the 8 would sit near 1.9 and push every other stock towards the middle.',
        },
        {
          kind: 'write',
          id: 'qalpha-clean-3',
          numpy: true,
          ask: 'Write `winsor_z(x, lo_pct, hi_pct)`: clip `x` at its `lo_pct` and `hi_pct` percentiles (`np.percentile`), then return the cross-sectional z-score (population standard deviation).',
          starter: `import numpy as np

def winsor_z(x, lo_pct, hi_pct):
    x = np.asarray(x, dtype=float)
    pass`,
          solution: `import numpy as np

def winsor_z(x, lo_pct, hi_pct):
    x = np.asarray(x, dtype=float)
    lo, hi = np.percentile(x, [lo_pct, hi_pct])
    c = np.clip(x, lo, hi)
    return (c - c.mean()) / c.std()`,
          tests: `rng = np.random.default_rng(0)
x = rng.normal(size=1000)
x[0] = 500.0
out = winsor_z(x, 1, 99)
assert out is not None, "the function returns nothing yet"
assert abs(out.mean()) < 1e-9 and abs(out.std() - 1) < 1e-9, "the result should have mean 0 and standard deviation 1"
assert out[0] < 3, f"the outlier should be clipped before z-scoring, got z = {out[0]:.1f}"
lo, hi = np.percentile(x, [1, 99])
c = np.clip(x, lo, hi)
assert np.allclose(out, (c - c.mean()) / c.std()), "clip first, then z-score the clipped values"`,
          why: 'Without the clip, one value of 500 would set the standard deviation at about 16 and squash every other z-score towards 0. Clipping first keeps the scale set by the ordinary stocks.',
        },
        {
          kind: 'write',
          id: 'qalpha-clean-4',
          numpy: true,
          ask: 'Write `sector_neutral(signal, sector)`: return the signal minus the mean of its own sector, for every stock. `sector` is an array of labels the same length as `signal`.',
          starter: `import numpy as np

def sector_neutral(signal, sector):
    signal = np.asarray(signal, dtype=float)
    sector = np.asarray(sector)
    out = signal.copy()
    return out`,
          solution: `import numpy as np

def sector_neutral(signal, sector):
    signal = np.asarray(signal, dtype=float)
    sector = np.asarray(sector)
    out = signal.copy()
    for s in np.unique(sector):
        mask = sector == s
        out[mask] = signal[mask] - signal[mask].mean()
    return out`,
          tests: `s = np.array([3.0, 1.0, -1.0, -3.0])
sec = np.array(['bank', 'bank', 'tech', 'tech'])
out = sector_neutral(s, sec)
assert out is not None, "the function returns nothing yet"
assert np.allclose(out, [1, -1, 1, -1]), f"each sector's mean is removed: expected [1, -1, 1, -1], got {out}"
rng = np.random.default_rng(1)
s2 = rng.normal(size=60)
sec2 = np.repeat(['a', 'b', 'c'], 20)
o2 = sector_neutral(s2, sec2)
for k in 'abc':
    assert abs(o2[sec2 == k].mean()) < 1e-12, f"sector {k} should net to zero"
assert np.allclose(o2[sec2 == 'a'] - o2[sec2 == 'a'].mean(), s2[sec2 == 'a'] - s2[sec2 == 'a'].mean()), "the order within a sector must not change"`,
          why: 'Before, the signal said "banks over tech"; after, it says which bank beats which bank. Weights proportional to the result net to zero in every sector.',
        },
        {
          kind: 'bug',
          id: 'qalpha-clean-5',
          ask: 'This should neutralise the signal within each sector. The sectors do not net to zero; the whole book still leans to the high-scoring sector.',
          code: `import numpy as np

def sector_neutral(signal, sector):
    out = signal.copy()
    for s in np.unique(sector):
        mask = sector == s
        out[mask] = signal[mask] - signal.mean()
    return out`,
          line: 7,
          fix: '        out[mask] = signal[mask] - signal[mask].mean()',
          why: "Subtracting the overall mean shifts every stock by the same amount, which leaves the sector differences untouched. Each sector's own mean has to come out.",
        },
        {
          kind: 'write',
          id: 'qalpha-clean-6',
          numpy: true,
          ask: 'Write `beta_neutral(signal, beta)`: regress the signal on the stocks\' betas across stocks, with an intercept, and return the residual.',
          starter: `import numpy as np

def beta_neutral(signal, beta):
    signal = np.asarray(signal, dtype=float)
    beta = np.asarray(beta, dtype=float)
    pass`,
          solution: `import numpy as np

def beta_neutral(signal, beta):
    signal = np.asarray(signal, dtype=float)
    beta = np.asarray(beta, dtype=float)
    X = np.column_stack([np.ones(len(beta)), beta])
    coef, *_ = np.linalg.lstsq(X, signal, rcond=None)
    return signal - X @ coef`,
          tests: `rng = np.random.default_rng(4)
beta = rng.uniform(0.5, 1.8, 200)
s = 2.0 * beta + rng.normal(size=200)
out = beta_neutral(s, beta)
assert out is not None, "the function returns nothing yet"
assert abs(out.sum()) < 1e-9, "with an intercept the residual adds to zero: a dollar-neutral book"
assert abs(out @ beta) < 1e-8, "weights proportional to the residual have zero net beta"
assert np.allclose(beta_neutral(3.0 * beta + 1.0, beta), 0), "a signal that is all beta has nothing left"`,
          why: 'Least-squares residuals are uncorrelated with every column of the regression. The column of ones makes them add to zero, and the beta column makes their beta-weighted sum zero: the book is dollar neutral and beta neutral.',
        },
        {
          kind: 'number',
          id: 'qalpha-clean-7',
          ask: 'A book is $1,000,000 long stocks with an average beta of 1.3 and $1,000,000 short stocks with an average beta of 0.8. SPY falls 2% and the stocks move exactly with their betas. What is the P&L in dollars?',
          answer: -10000,
          check: '1000000 * 1.3 * -0.02 - 1000000 * 0.8 * -0.02',
          why: 'Net beta exposure is $1.3M − $0.8M = $0.5M, and 2% of that is $10,000 lost. Dollar neutral is not market neutral: a low-volatility short side and a high-beta long side leave a market bet.',
        },
        {
          kind: 'choice',
          id: 'qalpha-clean-8',
          ask: 'In the figure, set the sector tilt to 1 with the raw signal, then press Sector neutral. What changes?',
          options: [
            'Nothing: the weights are the same',
            'Raw, banks net about +71% and energy about −43%, a large sector bet; neutral, every sector nets to 0% and only within-sector ranking is left',
            'Neutral makes the book long only',
            'Neutral doubles the bet on banks',
          ],
          answer: 1,
          why: 'The raw signal mixes two bets: which sector wins and which stock wins inside a sector. Neutralising keeps the second. If your research says the information is within sectors, the first bet is risk with no expected reward.',
        },
        {
          kind: 'choice',
          id: 'qalpha-clean-9',
          ask: 'Your signal has no value for 30 of 500 stocks today because their reports are late. What do you do?',
          options: [
            'Fill them with the value they will report next week',
            'Set their z-score to 0 after standardising the others, so the book takes no view on them',
            'Drop them from the universe for the whole backtest',
            'Give them the highest score so they are bought',
          ],
          answer: 1,
          why: 'Zero means no view. Filling with a later value is lookahead. Dropping stocks for the whole backtest because of a later gap is survivorship of a kind, and invents a universe you could not have traded.',
        },
        {
          kind: 'choice',
          id: 'qalpha-clean-10',
          ask: 'A value signal backtests at Sharpe 0.6 raw and 0.4 sector neutral. What is the honest reading?',
          options: [
            'Use the raw signal; its Sharpe is higher',
            'Part of the raw return came from sector bets; decide which bet you believe in and why, not by which number is higher',
            'Neutralising always lowers returns, so ignore it',
            'The neutral version is wrong',
          ],
          answer: 1,
          why: 'Picking whichever version backtests better is one more test on the same data. The sector bet may be real or may be one lucky period for banks; it also brings concentrated risk. Choose on reasoning, then test the chosen version out of sample.',
        },
        {
          kind: 'design',
          id: 'qalpha-clean-11',
          ask: 'Write the cleaning steps for a daily cross-sectional signal on 800 stocks in 11 sectors, from raw values to weights.',
          checklist: [
            { point: 'Compute the raw value from data known at that date only', why: 'Cleaning cannot fix lookahead.' },
            { point: 'Winsorise at percentiles of that day\'s cross-section, or rank', why: 'Outliers and data errors otherwise dominate.' },
            { point: 'Z-score across stocks that day', why: 'It puts the signal in common units for combining.' },
            { point: 'Neutralise to sector, and to beta if you mean to be market neutral', why: 'It removes bets you did not intend to make.' },
            { point: 'Set missing values to 0 after standardising', why: 'No data means no view, not a guess.' },
            { point: 'Scale to the gross exposure you want, with a cap per stock', why: 'One name should not carry the book.' },
            { point: 'Decide every choice before testing, and keep the same steps in backtest and live', why: 'Each choice tried on the data is another test; a mismatch between research and live code is a common bug.' },
          ],
          why: 'Cleaning decides what the signal is allowed to bet on. Written down in order, it can be tested once and reproduced exactly.',
        },
      ],
    },
    {
      id: 'qalpha-judge',
      title: 'Judging a signal',
      summary: 'The IC as a time series, IC decay, turnover and its cost, hit rate, and breadth with the transfer coefficient.',
      text: [
        "The quant module defined the **information coefficient (IC)**: the correlation, across stocks, between a signal and the next period's return. Compute it every period and you get a series. Its mean is the signal's strength, its standard deviation how erratic it is, and `ICIR = mean ÷ sd` is a per-period information ratio. The t statistic of the mean IC is `ICIR × √T` over T periods. Count periods, not stocks: 500 stocks on one day are one draw of the market's mood.",
        "**IC decay**: measure the IC against returns 1, 2, 5, 10 and 20 days ahead. A signal whose IC halves in two days must be traded fast. The **hit rate** is the share of periods with a positive IC, or the share of positions that moved the way the signal said. Hit rates near 51% to 55% are normal for good signals; a hit rate tells you nothing about the size of wins and losses.",
        { code: `import numpy as np

def turnover(w_old, w_new):
    return np.abs(w_new - w_old).sum()     # dollars traded per dollar of capital` },
        '**Turnover** is the money traded at each rebalance as a fraction of capital, `Σ|w_new − w_old|`. A signal whose ranks change slowly (high rank autocorrelation from one period to the next) has low turnover. Annual cost is about `turnover per rebalance × rebalances a year × cost per dollar traded`. The **break-even cost** is the gross return divided by the annual amount traded: if your real cost per dollar is above it, the signal loses money.',
        "Grinold's fundamental law, `IR ≈ IC × √breadth`, assumes you can hold exactly what the signal says. Real books have constraints: long only, position caps, sector limits. The **transfer coefficient** (TC), the correlation between the weights you hold and the weights the signal wants, scales it: `IR ≈ TC × IC × √breadth` (Clarke, de Silva and Thorley 2002). A long-only fund often has a TC of 0.3 to 0.6. Breadth counts independent bets, so 500 stocks that move together are far fewer.",
      ],
      rules: [
        'IC per period → mean, sd, ICIR = mean ÷ sd, t = ICIR × √periods.',
        'Plot IC by horizon; fast decay means fast trading.',
        'Turnover = Σ|w_new − w_old|. Cost ≈ turnover × rebalances × cost per dollar.',
        'Break-even cost = gross return ÷ annual turnover.',
        'IR ≈ TC × IC × √breadth. Constraints and correlated bets shrink it.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'qalpha-judge-1',
          ask: 'A daily signal has a mean IC of 0.03 with a standard deviation of 0.12 across 250 days. What is the t statistic of the mean IC? Give two decimals.',
          answer: 3.95,
          tol: 0.02,
          check: '0.03 / 0.12 * math.sqrt(250)',
          why: 'ICIR = 0.25 per day, and 0.25 × √250 ≈ 3.95. The ICs vary a lot from day to day; it is the number of days that makes the small mean stand out.',
        },
        {
          kind: 'output',
          id: 'qalpha-judge-2',
          ask: 'Eight periods of IC. What does this print?',
          code: `import numpy as np

ic = np.array([0.05, -0.02, 0.04, 0.01, 0.03, -0.01, 0.06, 0.02])
icir = ic.mean() / ic.std(ddof=1)
print(round(ic.mean(), 4), round(icir, 2), (ic > 0).mean())`,
          answer: '0.0225 0.8 0.75',
          why: 'Mean 0.0225, standard deviation about 0.028, so ICIR ≈ 0.8; six of eight periods are positive, a hit rate of 75%. With eight periods the t is 0.8 × √8 ≈ 2.3, and a different eight could easily show half that.',
        },
        {
          kind: 'bug',
          id: 'qalpha-judge-3',
          ask: 'This should give the t statistic of the mean daily IC. On 60 days of a 500-stock signal it reports t = 9 for a mean IC of 0.03.',
          code: `import numpy as np

def ic_t(ic_by_day, n_stocks):
    ic_by_day = np.asarray(ic_by_day, dtype=float)
    se = ic_by_day.std(ddof=1) / np.sqrt(n_stocks)
    return ic_by_day.mean() / se`,
          line: 5,
          fix: '    se = ic_by_day.std(ddof=1) / np.sqrt(len(ic_by_day))',
          why: 'The sample is the days, each with one IC. Dividing by √500 instead of √60 overstates t about threefold. The stocks are already inside each day\'s IC; counting them again treats one day\'s market mood as 500 separate pieces of evidence.',
        },
        {
          kind: 'number',
          id: 'qalpha-judge-4',
          ask: 'Weights before a rebalance are [0.5, 0.5, −0.5, −0.5] and after it [0.5, −0.5, 0.5, −0.5]. What is the turnover, Σ|w_new − w_old|?',
          answer: 2,
          check: 'np.abs(np.array([0.5, -0.5, 0.5, -0.5]) - np.array([0.5, 0.5, -0.5, -0.5])).sum()',
          why: 'Two names flip from +0.5 to −0.5, each a trade of 1.0: 2.0 times capital. A flip from long to short is two trades, closing and opening, which is why noisy signals are expensive.',
        },
        {
          kind: 'number',
          id: 'qalpha-judge-5',
          ask: 'A monthly long-short signal trades 0.6 of capital at each rebalance, and each dollar traded costs 0.1% in spread and impact. What is the annual cost? Give a percentage, for example 1.5%.',
          answer: 0.0072,
          tol: 0.0001,
          check: '0.6 * 12 * 0.001',
          why: '0.6 × 12 × 0.1% = 0.72% a year. Against a gross spread of 5% that is affordable. Rebalance daily with the same turnover each time and the cost is about 21 times larger.',
        },
        {
          kind: 'number',
          id: 'qalpha-judge-6',
          ask: 'A signal earns 6% a year gross and trades 7.2 times its capital a year. What cost per dollar traded would leave it at zero, the break-even cost? Give a percentage to two decimals, for example 0.25%.',
          answer: 0.00833,
          tol: 0.00005,
          check: '0.06 / 7.2',
          why: '6% ÷ 7.2 ≈ 0.83% per dollar traded. If your measured spread, fees and impact come to 0.3%, roughly two thirds of the gross edge is left; at 0.8% almost nothing is. Compare this number with what you really pay, not with a broker\'s headline fee.',
        },
        {
          kind: 'number',
          id: 'qalpha-judge-7',
          ask: 'A signal has an IC of 0.03 and 400 independent bets a year. A long-only fund can hold it only with a transfer coefficient of 0.5. What information ratio should it expect, before costs?',
          answer: 0.3,
          check: '0.5 * 0.03 * math.sqrt(400)',
          why: 'IC × √breadth = 0.6 unconstrained; the constraint halves it to 0.3. Long only cannot underweight a stock by more than its index weight, so most of the short-side information is lost.',
        },
        {
          kind: 'choice',
          id: 'qalpha-judge-8',
          ask: 'Two signals, IC by horizon. A is stronger at one day; B is weaker but holds its IC. Your costs are high. Which is likely better after costs, and why?',
          chart: {
            title: 'IC by horizon',
            x: 'days ahead',
            y: 'IC',
            series: [
              { name: 'A', points: [0.04, 0.02, 0.01, 0.005, 0.002], color: 'bad' },
              { name: 'B', points: [0.025, 0.024, 0.022, 0.02, 0.018], color: 'good' },
            ],
          },
          options: [
            'A, because its first-day IC is higher',
            'B: its information lasts, so it can be rebalanced rarely and traded slowly, at a fraction of the cost',
            'Neither: an IC below 0.05 is useless',
            'They are the same, because their average ICs are similar',
          ],
          answer: 1,
          why: "A's edge is gone in a few days, so holding it means rebuilding the book almost daily and paying the spread each time. B can be held for weeks. With high costs, slow and steady usually beats fast and strong.",
        },
        {
          kind: 'choice',
          id: 'qalpha-judge-9',
          ask: 'A signal picks the direction right 53% of the time. What can you conclude about its profitability?',
          options: [
            'It makes money, since 53% is above half',
            'Nothing yet: profit depends on the size of wins against losses and on costs, not on the hit rate alone',
            'It loses money, since 53% is too close to half',
            'It is significant at the 5% level',
          ],
          answer: 1,
          why: 'A signal that is right on many small moves and wrong on a few big ones can have a 53% hit rate and lose. The IC uses the size of the moves; expectancy and costs decide the money.',
        },
        {
          kind: 'write',
          id: 'qalpha-judge-10',
          numpy: true,
          ask: 'Write `ic_report(S, F)`: `S` and `F` have shape (periods, stocks), `S[t]` the signal and `F[t]` the return that follows it. Compute the Pearson IC of each row and return `(mean_ic, icir, t)` with `icir = mean ÷ sd (ddof=1)` and `t = icir × √periods`.',
          starter: `import numpy as np

def ic_report(S, F):
    S = np.asarray(S, dtype=float)
    F = np.asarray(F, dtype=float)
    pass`,
          solution: `import numpy as np

def ic_report(S, F):
    S = np.asarray(S, dtype=float)
    F = np.asarray(F, dtype=float)
    ic = np.array([np.corrcoef(s, f)[0, 1] for s, f in zip(S, F)])
    icir = ic.mean() / ic.std(ddof=1)
    return float(ic.mean()), float(icir), float(icir * np.sqrt(len(ic)))`,
          tests: `rng = np.random.default_rng(0)
S = rng.normal(size=(100, 300))
F = 0.05 * S + rng.normal(size=(100, 300))
out = ic_report(S, F)
assert out is not None, "the function returns nothing yet"
m, icir, t = out
ics = np.array([np.corrcoef(S[i], F[i])[0, 1] for i in range(100)])
assert abs(m - ics.mean()) < 1e-12, f"mean IC should be {ics.mean():.4f}, got {m}"
assert abs(icir - ics.mean() / ics.std(ddof=1)) < 1e-9, "ICIR is mean / std(ddof=1) of the row ICs"
assert abs(t - icir * 10) < 1e-9, "t = ICIR x sqrt(number of periods), here sqrt(100) = 10"
assert 0.02 < m < 0.08, f"this signal has a true IC near 0.05, got {m:.3f}"`,
          why: 'One correlation per period, then ordinary statistics on that series. In practice you would also do it with ranks and by horizon, and look at the series by year to see whether the signal is fading.',
        },
        {
          kind: 'write',
          id: 'qalpha-judge-11',
          numpy: true,
          ask: 'Write `mean_turnover(W)`: `W` has shape (periods, stocks), the weights held each period. Return the average of `Σ|W[t] − W[t−1]|` over t from 1 on (ignore the first build of the book).',
          starter: `import numpy as np

def mean_turnover(W):
    W = np.asarray(W, dtype=float)
    pass`,
          solution: `import numpy as np

def mean_turnover(W):
    W = np.asarray(W, dtype=float)
    return float(np.abs(np.diff(W, axis=0)).sum(axis=1).mean())`,
          tests: `W = np.array([[0.5, 0.5, -0.5, -0.5], [0.5, -0.5, 0.5, -0.5], [0.5, -0.5, 0.5, -0.5]])
out = mean_turnover(W)
assert out is not None, "the function returns nothing yet"
assert abs(out - 1.0) < 1e-12, f"turnovers 2.0 then 0.0 average to 1.0, got {out}"
assert mean_turnover(np.tile([0.5, -0.5], (5, 1))) == 0.0, "weights that never change have no turnover"
assert abs(mean_turnover(np.array([[1.0, -1.0], [-1.0, 1.0]])) - 4.0) < 1e-12, "flipping both names trades 4 times capital"`,
          why: '`np.diff` along the time axis gives each period\'s change in weights; the row sums of their absolute values are the dollars traded. Multiply the mean by the rebalances a year and the cost per dollar to get the yearly bill.',
        },
        {
          kind: 'design',
          id: 'qalpha-judge-12',
          ask: 'Write the one-page report card you would produce for any new signal before deciding whether to work on it further.',
          checklist: [
            { point: 'Mean IC, ICIR and t, with the number of periods', why: 'Strength and its uncertainty on one line.' },
            { point: 'IC by horizon, and the half-life of the decay', why: 'It sets the holding period.' },
            { point: 'Quantile staircase and the long-short spread', why: 'It shows where in the range the information lives.' },
            { point: 'Turnover per rebalance, annual cost and break-even cost', why: 'Most signals fail here.' },
            { point: 'IC by year, including the most recent years', why: 'Fading signals show up as a falling line.' },
            { point: 'Correlation with known factors and with signals you already trade', why: 'A signal that duplicates one you have adds little.' },
            { point: 'The number of variants tried to get here', why: 'It tells the reader how much to discount the t.' },
          ],
          why: 'The same page for every signal makes them comparable and makes it hard to quietly drop the bad news, such as costs or the count of attempts.',
        },
      ],
    },
    {
      id: 'qalpha-combine',
      title: 'Combining signals',
      summary: 'The IC of a weighted blend, the best weights, why fitted weights overfit, and what a new signal adds.',
      text: [
        'The quant module gave the IC of an equal average of k signals with the same IC and correlation. In general, with standardised signals of ICs `ic` and correlation matrix `C` between them, a blend with weights w has `IC = (w · ic) ÷ √(w · C · w)`. The numerator is the information you add; the denominator is how much the signals overlap.',
        { code: `import numpy as np

def blend_ic(w, ic, C):
    w, ic = np.asarray(w, float), np.asarray(ic, float)
    return (w @ ic) / np.sqrt(w @ C @ w)` },
        'The weights that maximise the blend\'s IC are proportional to `C⁻¹ · ic`, the same answer a regression of returns on the signals gives. Two signals with ICs 0.04 and 0.02 and correlation 0.5 get weights in the ratio 1 to 0: the weaker one adds nothing the stronger one does not already carry. If they were uncorrelated, the best blend would reach `√(0.04² + 0.02²) ≈ 0.045`.',
        '**Fitted weights overfit.** The ICs and correlations you plug in are estimates with large errors, and `C⁻¹` amplifies them. In-sample, the fitted blend always beats equal weights; out of sample it often does not, especially with many signals and few periods. Common defences: equal weights or weights by IC alone, shrinking fitted weights towards equal, only positive weights, and fitting on one period and judging on the next.',
        'Before adding a signal, measure what is new in it: regress it on the signals you already have across stocks and test the **residual**. A signal with an IC of 0.03 that is 0.9 correlated with one you trade adds almost nothing. Correlations between signals also change, and crowded signals tend to become correlated in a sell-off, when many funds cut the same positions.',
      ],
      rules: [
        'Blend IC = (w · ic) ÷ √(w C w), for standardised signals.',
        'Best weights ∝ C⁻¹ ic; a correlated, weaker signal may get none.',
        'Fitted weights look best in-sample and often lose out of sample.',
        'Shrink towards equal weights; keep weights positive unless you have a reason.',
        'Test a new signal on its residual against the ones you have.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'qalpha-combine-1',
          ask: 'Two standardised signals have ICs of 0.04 and 0.02 and a correlation of 0.5. What is the IC of their equal-weighted blend? Give three decimals.',
          answer: 0.035,
          tol: 0.0006,
          check: '(0.5 * 0.04 + 0.5 * 0.02) / math.sqrt(0.25 + 0.25 + 2 * 0.25 * 0.5)',
          why: 'w · ic = 0.03 and w C w = 0.75, so 0.03 ÷ 0.866 ≈ 0.035. That is below the stronger signal alone, 0.04: equal weight gave half the book to a signal that adds mostly overlap.',
        },
        {
          kind: 'number',
          id: 'qalpha-combine-2',
          ask: 'Two uncorrelated standardised signals have ICs 0.03 and 0.04. What IC does the best blend reach? Give a decimal.',
          answer: 0.05,
          tol: 0.0006,
          check: 'math.sqrt(0.03 ** 2 + 0.04 ** 2)',
          why: 'With C the identity, the best weights are proportional to the ICs and the blend reaches √(ic · ic) = 0.05. Independent information adds like the sides of a right triangle.',
        },
        {
          kind: 'output',
          id: 'qalpha-combine-3',
          ask: 'The IC of a blend from the weights, the ICs and the correlation matrix. What does this print?',
          code: `import numpy as np

ic = np.array([0.04, 0.02])
C = np.array([[1.0, 0.5], [0.5, 1.0]])
best = np.linalg.solve(C, ic)
for w in (np.array([1.0, 1.0]), best):
    print(round(float(w @ ic / np.sqrt(w @ C @ w)), 3))`,
          answer: '0.035\n0.04',
          why: '`np.linalg.solve(C, ic)` gives C⁻¹ ic = [0.04, 0.0]: all the weight on the first signal. The equal blend gets 0.035, the best gets 0.04. The scale of w does not matter, only its direction.',
        },
        {
          kind: 'number',
          id: 'qalpha-combine-4',
          ask: 'You trade a signal with IC 0.03. A new one also has IC 0.03 but is 0.9 correlated with it. What is the IC of their equal blend? Give three decimals.',
          answer: 0.031,
          tol: 0.0006,
          check: '0.03 * math.sqrt(2) / math.sqrt(1 + 0.9)',
          why: '0.03 × √2 ÷ √1.9 ≈ 0.031: almost no gain. Two versions of one idea are one idea. The same IC from a signal with 0.1 correlation would lift the blend to about 0.040.',
        },
        {
          kind: 'write',
          id: 'qalpha-combine-5',
          numpy: true,
          ask: 'Write `blend_ic(w, ic, C)`: the IC of a blend of standardised signals, `(w · ic) ÷ √(w C w)`.',
          starter: `import numpy as np

def blend_ic(w, ic, C):
    w = np.asarray(w, dtype=float)
    ic = np.asarray(ic, dtype=float)
    C = np.asarray(C, dtype=float)
    pass`,
          solution: `import numpy as np

def blend_ic(w, ic, C):
    w = np.asarray(w, dtype=float)
    ic = np.asarray(ic, dtype=float)
    C = np.asarray(C, dtype=float)
    return float(w @ ic / np.sqrt(w @ C @ w))`,
          tests: `C = np.array([[1.0, 0.5], [0.5, 1.0]])
out = blend_ic([1, 1], [0.04, 0.02], C)
assert out is not None, "the function returns nothing yet"
assert abs(out - 0.03 / np.sqrt(0.75)) < 1e-12, f"expected about 0.0346, got {out}"
assert abs(blend_ic([2, 2], [0.04, 0.02], C) - out) < 1e-12, "doubling every weight does not change the IC"
assert abs(blend_ic([1, 0], [0.04, 0.02], C) - 0.04) < 1e-12, "one signal alone has its own IC"
k = 4
assert abs(blend_ic(np.ones(k), np.full(k, 0.03), np.eye(k)) - 0.06) < 1e-12, "four uncorrelated signals of 0.03 give 0.06"`,
          why: 'The formula generalises the equal-weight rule from the quant module to any weights and any correlations. The last test is that rule: 0.03 × √4.',
        },
        {
          kind: 'write',
          id: 'qalpha-combine-6',
          numpy: true,
          ask: 'Write `best_weights(ic, C)`: return `C⁻¹ · ic` (use `np.linalg.solve`), scaled so the weights add to 1.',
          starter: `import numpy as np

def best_weights(ic, C):
    ic = np.asarray(ic, dtype=float)
    C = np.asarray(C, dtype=float)
    pass`,
          solution: `import numpy as np

def best_weights(ic, C):
    ic = np.asarray(ic, dtype=float)
    C = np.asarray(C, dtype=float)
    w = np.linalg.solve(C, ic)
    return w / w.sum()`,
          tests: `out = best_weights([0.03, 0.04], np.eye(2))
assert out is not None, "the function returns nothing yet"
assert np.allclose(out, [3 / 7, 4 / 7]), f"uncorrelated: weights proportional to IC, got {out}"
assert np.allclose(best_weights([0.04, 0.02], [[1, 0.5], [0.5, 1]]), [1, 0]), "the weaker, correlated signal gets no weight"
w = best_weights([0.03, 0.03, 0.02], [[1, 0.8, 0], [0.8, 1, 0], [0, 0, 1]])
assert abs(w.sum() - 1) < 1e-12, "the weights add to 1"
assert w[2] > w[0], "an independent signal earns more weight than two overlapping ones of higher IC"`,
          why: 'Solving the linear system is better practice than inverting C. The last test shows the point: two overlapping signals share their weight, and the independent one gets more than its IC alone suggests.',
        },
        {
          kind: 'bug',
          id: 'qalpha-combine-7',
          ask: 'This should blend a momentum signal (values around ±0.3) with a book-to-price signal (values from about 0.2 to 3) in equal parts. The blend ranks stocks almost exactly by book-to-price.',
          code: `import numpy as np

def combine(mom, value):
    z = lambda x: (x - x.mean()) / x.std()
    blend = mom + value
    return blend`,
          line: 5,
          fix: '    blend = z(mom) + z(value)',
          why: 'Raw values in different units are weighted by their spread, not by your choice. Book-to-price varies several times more than momentum, so it decides the ranking. Standardise each signal first, then weight.',
        },
        {
          kind: 'output',
          id: 'qalpha-combine-8',
          ask: 'Eight signals of pure noise and a pure-noise return, 120 periods. Weights are fitted by least squares on the first 60 and the blend is scored on both halves. What does this print?',
          code: `import numpy as np

rng = np.random.default_rng(7)
X = rng.normal(size=(120, 8))      # 8 signals with no information
y = rng.normal(size=120)           # next-period returns
w, *_ = np.linalg.lstsq(X[:60], y[:60], rcond=None)
ic = lambda s, r: np.corrcoef(s, r)[0, 1]
print(round(ic(X[:60] @ w, y[:60]), 2), round(ic(X[60:] @ w, y[60:]), 2))`,
          answer: '0.5 -0.1',
          why: 'Eight free weights on 60 points find a blend with an in-sample IC of 0.5 out of nothing. On the next 60 periods it scores about zero, here slightly negative. Every fitted weight is a chance to fit noise.',
        },
        {
          kind: 'choice',
          id: 'qalpha-combine-9',
          ask: 'You fit weights for six signals on 2015 to 2020. The fitted blend has an IC of 0.07 in-sample; the equal blend has 0.05. On 2021 to 2024 what should you expect?',
          options: [
            'The fitted blend keeps its lead of 0.02',
            'The fitted blend loses most of its lead and may fall below the equal blend; the in-sample gap is partly fitted noise',
            'Both will have exactly their in-sample ICs',
            'The equal blend will fall to zero',
          ],
          answer: 1,
          why: 'Fitted weights are chosen to look best on the data they were fitted on. Equal weights were not fitted, so their in-sample score is honest. A common compromise is halfway between the two.',
        },
        {
          kind: 'choice',
          id: 'qalpha-combine-10',
          ask: 'A colleague proposes a new signal with an IC of 0.025. What test tells you whether it is worth adding?',
          options: [
            'Its IC on its own: 0.025 is positive',
            'Regress it across stocks on the signals you already trade and measure the IC of the residual',
            'Its correlation with the market',
            'Its hit rate',
          ],
          answer: 1,
          why: 'Only the part of the signal your current blend does not already hold can add to it. A residual IC near zero means the new signal is your old ones in another form.',
        },
        {
          kind: 'design',
          id: 'qalpha-combine-11',
          ask: 'You have five signals that each passed their own tests. Plan how to combine them into one, and how to judge the result.',
          checklist: [
            { point: 'Standardise each signal the same way, every period', why: 'Otherwise the units decide the weights.' },
            { point: 'Estimate the correlation matrix of the signals and of their long-short returns', why: 'Overlap decides how much each adds.' },
            { point: 'Start from equal weights or weights by IC; compare fitted weights only out of sample', why: 'Fitted weights overfit, most with many signals and few periods.' },
            { point: 'If you fit weights, shrink them towards equal and keep them positive', why: 'It limits the damage from estimation error.' },
            { point: 'Test each signal\'s residual against the others', why: 'A signal with no residual IC adds cost, not information.' },
            { point: 'Check the blend\'s turnover, which can be lower than the parts\'', why: 'Signals that disagree partly cancel trades.' },
            { point: 'Score the blend once on a holdout', why: 'Choosing the blend is one more test.' },
          ],
          why: 'Combining is where research quietly overfits. Simple weights, a residual test and one honest holdout keep the blend from being a fit to the past.',
        },
      ],
    },
    {
      id: 'qalpha-research',
      title: 'The research process',
      summary: 'Hypotheses first, a holdout touched once, the expected best of many tries, the deflated Sharpe idea, and why most published factors shrink.',
      widget: 'qalpha-search',
      text: [
        'Start from a **hypothesis** with a reason: who is on the other side of the trade, and why do they keep paying? A risk premium (you are paid to hold something unpleasant), a behavioural bias, or a constraint (some investors cannot short or borrow). Write the test down before running it: universe, dates, signal, horizon, quantiles, costs and what result would count as success.',
        'Split the data. Explore on a **training** period, choose between versions on a **validation** period, and keep a **holdout** you test once, at the end. Look at the holdout, change something and test again, and it has become validation. Keep a log of every version you run: that count, N, is what the result has to be judged against.',
        "With N strategies that have no edge, the best one's Sharpe is not zero. Its expected value is about `σ × ((1 − γ) × Φ⁻¹(1 − 1/N) + γ × Φ⁻¹(1 − 1/(N·e)))`, where σ ≈ 1 ÷ √years is the standard error of an annual Sharpe, γ ≈ 0.5772 (the Euler-Mascheroni constant), e ≈ 2.718, and Φ⁻¹ is the inverse normal CDF (`statistics.NormalDist().inv_cdf` in the standard library). The best of 100 noise strategies over 5 years is expected to show a Sharpe of about 1.13. The **deflated Sharpe ratio** of Bailey and López de Prado (2014) asks how likely the true Sharpe is above that bar, and also corrects for skew and fat tails; a simple version is `Φ((SR − expected max) ÷ σ)`.",
        { code: `from statistics import NormalDist
import math

def expected_max_sharpe(n, years):
    g, inv = 0.5772156649, NormalDist().inv_cdf
    return (1 / math.sqrt(years)) * ((1 - g) * inv(1 - 1 / n) + g * inv(1 - 1 / (n * math.e)))` },
        "The published record is a warning. Harvey, Liu and Zhu (2016) argued for t above 3 for a new factor, as the quant module said. Hou, Xue and Zhang (2020) re-tested 452 anomalies with microcaps controlled and found 65% failed even t = 1.96, and 82% failed a multiple-testing bar of 2.78. Jensen, Kelly and Pedersen (2023) reached a more hopeful view: most factors replicate in a global sample, though with smaller effects. Both agree on the habit to keep: count your tries, expect shrinkage, and assume your own result is weaker than it looks.",
      ],
      rules: [
        'A hypothesis with a reason, written down before the test.',
        'Train, validate, and touch the holdout once.',
        'Log every version tried; N is part of the result.',
        'Best of N noise Sharpes ≈ σ((1 − γ)Φ⁻¹(1 − 1/N) + γΦ⁻¹(1 − 1/(Ne))), σ ≈ 1/√years.',
        'Most published anomalies shrink or fail on re-testing. Expect yours to.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'qalpha-research-1',
          ask: 'With 4 years of daily data, what is the approximate standard error of an annual Sharpe ratio, 1 ÷ √years?',
          answer: 0.5,
          check: '1 / math.sqrt(4)',
          why: 'Half a unit of Sharpe either way is one standard error. A strategy with a true Sharpe of 0.5 is one standard error from zero after four years.',
        },
        {
          kind: 'number',
          id: 'qalpha-research-2',
          ask: 'You tried 20 versions of an idea, none with any edge, on 4 years of data. Using the formula in the lesson, what Sharpe do you expect the best of them to show? Give two decimals.',
          answer: 0.95,
          tol: 0.01,
          check: '(lambda N, s, g: s * ((1 - g) * N.inv_cdf(1 - 1 / 20) + g * N.inv_cdf(1 - 1 / (20 * math.e))))(__import__("statistics").NormalDist(), 0.5, 0.5772156649)',
          hint: 'σ = 0.5. Φ⁻¹(0.95) ≈ 1.645 and Φ⁻¹(1 − 1/(20e)) ≈ Φ⁻¹(0.9816) ≈ 2.09.',
          why: '0.5 × (0.4228 × 1.645 + 0.5772 × 2.09) ≈ 0.95. Twenty honest tries of nothing produce a best Sharpe near 1. A reported 1.0 from 20 versions is what no edge looks like.',
        },
        {
          kind: 'number',
          id: 'qalpha-research-3',
          ask: 'Your best strategy out of 100 tried has a Sharpe of 1.5 over 5 years. The expected best of 100 noise strategies is 1.13 and σ = 1 ÷ √5 ≈ 0.447. Using the simple deflated Sharpe Φ((SR − expected max) ÷ σ), what is the probability? Give a decimal to 2 places.',
          answer: 0.79,
          tol: 0.011,
          check: '0.5 * (1 + math.erf(((1.5 - 1.1317) / (1 / math.sqrt(5))) / math.sqrt(2)))',
          why: '(1.5 − 1.13) ÷ 0.447 ≈ 0.82, and Φ(0.82) ≈ 0.79. Without the correction the same Sharpe would have a t of 3.4 and look conclusive. The usual bar for the deflated ratio is 0.95; this result does not reach it.',
        },
        {
          kind: 'output',
          id: 'qalpha-research-4',
          ask: 'The inverse normal CDF from the standard library. What does this print?',
          code: `from statistics import NormalDist

inv = NormalDist().inv_cdf
print(round(inv(0.99), 2), round(inv(0.975), 2))`,
          answer: '2.33 1.96',
          why: '`inv_cdf(p)` returns the z below which a share p of a normal distribution lies. 0.975 gives the familiar 1.96, the two-sided 5% line. No SciPy is needed for this.',
        },
        {
          kind: 'bug',
          id: 'qalpha-research-5',
          ask: 'This should give the expected best Sharpe of n noise strategies over a number of years. With 16 years it reports a bar four times too low instead of half as high as with 4 years.',
          code: `import math
from statistics import NormalDist

def expected_max_sharpe(n, years):
    g, inv = 0.5772156649, NormalDist().inv_cdf
    sigma = 1 / years
    return sigma * ((1 - g) * inv(1 - 1 / n) + g * inv(1 - 1 / (n * math.e)))`,
          line: 6,
          fix: '    sigma = 1 / math.sqrt(years)',
          why: 'The standard error of a Sharpe shrinks with the square root of time. Dividing by years makes long samples look far more decisive than they are, and lets a long search pass a bar that is too low.',
        },
        {
          kind: 'write',
          id: 'qalpha-research-6',
          ask: 'Write `expected_max_sharpe(n, years)` from the formula in the lesson. For n = 1 return 0.0 (one try has no selection).',
          starter: `import math
from statistics import NormalDist

def expected_max_sharpe(n, years):
    pass`,
          solution: `import math
from statistics import NormalDist

def expected_max_sharpe(n, years):
    if n == 1:
        return 0.0
    g, inv = 0.5772156649, NormalDist().inv_cdf
    sigma = 1 / math.sqrt(years)
    return sigma * ((1 - g) * inv(1 - 1 / n) + g * inv(1 - 1 / (n * math.e)))`,
          tests: `out = expected_max_sharpe(100, 5)
assert out is not None, "the function returns nothing yet"
assert abs(out - 1.1317) < 0.001, f"100 tries over 5 years: about 1.13, got {out}"
assert expected_max_sharpe(1, 5) == 0.0, "one try: no selection, 0"
assert abs(expected_max_sharpe(100, 20) - out / 2) < 1e-9, "four times the years halves the bar"
assert expected_max_sharpe(1000, 5) > expected_max_sharpe(100, 5), "more tries raise the bar"`,
          why: 'The bar rises with the number of tries, slowly (roughly with √(2 ln N)), and falls with the square root of the years. A long sample is the main defence against a long search.',
        },
        {
          kind: 'write',
          id: 'qalpha-research-7',
          ask: 'Write `deflated(sr, n, years)`: the simple deflated Sharpe `Φ((sr − expected max) ÷ σ)`, with σ = 1 ÷ √years. The helper is given.',
          starter: `import math
from statistics import NormalDist

def expected_max_sharpe(n, years):
    if n == 1:
        return 0.0
    g, inv = 0.5772156649, NormalDist().inv_cdf
    sigma = 1 / math.sqrt(years)
    return sigma * ((1 - g) * inv(1 - 1 / n) + g * inv(1 - 1 / (n * math.e)))

def deflated(sr, n, years):
    pass`,
          solution: `import math
from statistics import NormalDist

def expected_max_sharpe(n, years):
    if n == 1:
        return 0.0
    g, inv = 0.5772156649, NormalDist().inv_cdf
    sigma = 1 / math.sqrt(years)
    return sigma * ((1 - g) * inv(1 - 1 / n) + g * inv(1 - 1 / (n * math.e)))

def deflated(sr, n, years):
    sigma = 1 / math.sqrt(years)
    return NormalDist().cdf((sr - expected_max_sharpe(n, years)) / sigma)`,
          tests: `out = deflated(1.5, 100, 5)
assert out is not None, "the function returns nothing yet"
assert abs(out - 0.795) < 0.005, f"Sharpe 1.5, best of 100 over 5 years: about 0.79, got {out}"
assert abs(deflated(1.0, 1, 4) - NormalDist().cdf(2.0)) < 1e-9, "one try: the ordinary test, Phi(SR x sqrt(years))"
assert deflated(1.5, 1000, 5) < out, "more tries lower the probability"
assert deflated(1.5, 100, 20) > out, "more years raise it"`,
          why: 'With one try it is the ordinary one-sided test of the Sharpe. With many, the bar moves up to where the best of the noise would land. The full version of Bailey and López de Prado also widens σ for skew and fat tails.',
        },
        {
          kind: 'choice',
          id: 'qalpha-research-8',
          ask: 'In the figure, set 200 strategies and 3 years of data. Every strategy has a true Sharpe of 0. What do you see?',
          options: [
            'The best estimate is close to 0',
            'The best estimate is about 1.6, close to the dashed expected best, and several strategies show a Sharpe above 1',
            'No strategy shows a Sharpe above 0.5',
            'The estimates are all exactly 0',
          ],
          answer: 1,
          why: 'With a standard error of 0.58 and 200 draws, a winner near 1.6 is what pure noise produces. A researcher who reports only the winner has reported this noise. Move the years to 20 and the same search finds a best near 0.6.',
        },
        {
          kind: 'choice',
          id: 'qalpha-research-9',
          ask: 'Your strategy fails on the holdout. You notice a filter that would have fixed the holdout losses, add it, and re-test on the same holdout: it passes. What is the status of the result?',
          options: [
            'Proven: it passed the holdout',
            'The holdout has become part of the training data; you no longer have an untouched test, and need new data such as paper trading',
            'Better than before, since the filter has a reason',
            'Valid as long as only one filter was added',
          ],
          answer: 1,
          why: 'The filter was chosen by looking at the holdout, so the second pass tells you the filter fits that period. The honest options are to accept the failure or to gather fresh data the strategy has never seen.',
        },
        {
          kind: 'choice',
          id: 'qalpha-research-10',
          ask: 'What did Hou, Xue and Zhang (2020) find when they re-tested 452 published anomalies with microcaps controlled?',
          options: [
            'Almost all of them replicated',
            'About 65% failed even the single-test bar of |t| = 1.96, and about 82% failed a multiple-testing bar of 2.78',
            'They all worked better than first reported',
            'None could be tested because the data was missing',
          ],
          answer: 1,
          why: 'Many anomalies lived in tiny, illiquid stocks and in equal-weighted portfolios. Jensen, Kelly and Pedersen (2023) read the evidence more kindly with a different method, but even they find smaller effects than first published.',
        },
        {
          kind: 'design',
          id: 'qalpha-research-11',
          ask: 'Write the research protocol for a new idea: "stocks with rising analyst estimates outperform over the next month". Everything you decide before running the first test.',
          checklist: [
            { point: 'The reason the effect should exist and who is on the other side', why: 'A pattern without a reason is more likely to be noise.' },
            { point: 'Universe, dates and point-in-time data for the estimates', why: 'Estimates are revised; using today\'s file is lookahead.' },
            { point: 'The exact signal, horizon, quantiles and weighting', why: 'Fixing them first limits the number of tries.' },
            { point: 'The cost model and the success bar, including a t or deflated Sharpe threshold', why: 'The bar must be set before the result is known.' },
            { point: 'Training, validation and holdout periods', why: 'The holdout is tested once.' },
            { point: 'A log of every variant run', why: 'N decides how strong the result must be.' },
            { point: 'Factor regressions planned in advance', why: 'The idea may be momentum or quality in disguise.' },
            { point: 'What you will do if it fails', why: 'Deciding in advance prevents rescuing it with filters.' },
          ],
          why: 'A protocol written in advance turns a search into a test. Most ideas fail it, which is the cheap and correct outcome.',
        },
      ],
    },
    {
      id: 'qalpha-lab',
      title: 'Lab: testing cross-sectional momentum',
      summary: 'A made-up universe, the 12-1 momentum signal, quantile returns, IC, turnover, returns net of costs, and a control with no effect.',
      text: [
        'This lab tests one factor from start to finish: **cross-sectional momentum**. Each month, rank stocks by their return over the past twelve months skipping the most recent one, buy the top fifth, sell the bottom fifth, and hold for a month. The question is the one every alpha must answer: is there a staircase, how strong and stable is the IC, what does trading it cost, and does it survive a control where no effect exists.',
        'The universe is made up from a fixed seed: 200 stocks over 20 years of months. Each stock\'s return is a common market move, a slowly wandering expected return of its own, and noise. The slow drift is what makes past winners keep winning a little. The same code is then run with the drift switched off, where a correct pipeline must find nothing. Real momentum is weaker in some periods, crashes in rebounds, and trades in a market full of firms running the same sort.',
        'The steps: generate the returns, build the signal from past data only, compute quantile returns, find the lining-up bug, measure the IC, build long-short weights with their turnover, net the costs, and read the result against the control. Each step repeats the helpers it needs.',
      ],
      rules: [
        'Fix the seed; say the data is made up.',
        'The signal at the end of month t uses returns up to t − 1; it earns month t + 1.',
        'Ranks and quantiles each month; the spread is gross.',
        'Charge costs on every change of weight.',
        'Run the same pipeline on a universe with no effect before believing it.',
      ],
      questions: [
        {
          kind: 'write',
          id: 'qalpha-lab-1',
          numpy: true,
          ask: 'Step 1: the universe. With `rng = np.random.default_rng(seed)`, draw in this order `mkt = rng.normal(0.006, 0.04, n_months)`, `noise = rng.normal(0, 0.08, (n_months, n_assets))`, `shocks = rng.normal(0, 0.0025, (n_months, n_assets))`. Build `mu[0] = 0`, `mu[t] = 0.95 × mu[t−1] + strength × shocks[t]`. Return `mkt[:, None] + mu + noise`, shape (months, assets).',
          starter: `import numpy as np

def make_universe(n_assets, n_months, seed, strength=1.0):
    rng = np.random.default_rng(seed)
    pass`,
          solution: `import numpy as np

def make_universe(n_assets, n_months, seed, strength=1.0):
    rng = np.random.default_rng(seed)
    mkt = rng.normal(0.006, 0.04, n_months)
    noise = rng.normal(0, 0.08, (n_months, n_assets))
    shocks = rng.normal(0, 0.0025, (n_months, n_assets))
    mu = np.zeros((n_months, n_assets))
    for t in range(1, n_months):
        mu[t] = 0.95 * mu[t - 1] + strength * shocks[t]
    return mkt[:, None] + mu + noise`,
          tests: `R = make_universe(200, 240, 0)
assert R is not None, "the function returns nothing yet"
assert R.shape == (240, 200), f"shape is (months, assets), got {R.shape}"
assert np.array_equal(R, make_universe(200, 240, 0)), "the same seed must give the same returns"
rng = np.random.default_rng(0)
mkt = rng.normal(0.006, 0.04, 240)
assert np.allclose(R[0], mkt[0] + rng.normal(0, 0.08, (240, 200))[0]), "draw mkt, then noise, then shocks, and mu[0] is 0"
shocks = rng.normal(0, 0.0025, (240, 200))
R0 = make_universe(200, 240, 0, strength=0.0)
D = R - R0
assert abs(D[0]).max() == 0, "mu starts at zero, and strength 0 must keep the same market and noise"
assert np.allclose(D[1:] - 0.95 * D[:-1], shocks[1:]), "mu[t] = 0.95 * mu[t - 1] + strength * shocks[t]"
assert (R - R0).std() > 0.004, "with strength 1 each stock should have a slowly wandering mean"`,
          why: 'The drift mu moves slowly (0.95 a month), so a stock that did well because its mu was high is likely to keep a high mu next month. Its size is small next to the 8% monthly noise, as real effects are. Drawing in a fixed order makes strength 0 an exact control: same market, same noise, no drift.',
        },
        {
          kind: 'write',
          id: 'qalpha-lab-2',
          numpy: true,
          ask: 'Step 2: the signal. Return `sig` with the shape of `R`: for t from `lookback − 1` on, `sig[t] = prod(1 + R[t − lookback + 1 : t − skip + 1]) − 1` down each column; earlier rows are `nan`. With lookback 12 and skip 1 that is months t − 11 to t − 1.',
          starter: `import numpy as np

def momentum(R, lookback=12, skip=1):
    R = np.asarray(R, dtype=float)
    sig = np.full(R.shape, np.nan)
    return sig`,
          solution: `import numpy as np

def momentum(R, lookback=12, skip=1):
    R = np.asarray(R, dtype=float)
    sig = np.full(R.shape, np.nan)
    for t in range(lookback - 1, len(R)):
        sig[t] = np.prod(1 + R[t - lookback + 1:t - skip + 1], axis=0) - 1
    return sig`,
          tests: `R = np.full((14, 2), 0.01)
R[:, 1] = -0.01
out = momentum(R)
assert out is not None, "the function returns nothing yet"
assert out.shape == (14, 2), f"same shape as R, got {out.shape}"
assert np.isnan(out[:11]).all(), "rows before lookback - 1 are nan"
assert abs(out[11, 0] - (1.01 ** 11 - 1)) < 1e-12, f"11 months of +1% compound to {1.01 ** 11 - 1:.4f}, got {out[11, 0]}"
R2 = R.copy(); R2[11, 0] = 0.5
assert abs(momentum(R2)[11, 0] - out[11, 0]) < 1e-12, "the signal at t must skip month t"
R3 = R.copy(); R3[12, 0] = 0.5
assert abs(momentum(R3)[11, 0] - out[11, 0]) < 1e-12, "the signal at t must not use later months"`,
          why: 'The window ends at t − 1, so month t, the reversal month, is skipped, and nothing after t is used. The two tests that change one return and check that the signal does not move are the cheapest lookahead tests there are.',
        },
        {
          kind: 'write',
          id: 'qalpha-lab-3',
          numpy: true,
          ask: 'Step 3: quantile returns. For every t where `sig[t]` has no `nan` and `t + 1 < len(R)`, rank `sig[t]`, group by `rank × q // n`, and take the mean of `R[t + 1]` in each group. Return an array of shape (periods, q).',
          starter: `import numpy as np

def quantile_returns(sig, R, q):
    rows = []
    return np.array(rows)`,
          solution: `import numpy as np

def quantile_returns(sig, R, q):
    rows = []
    n = sig.shape[1]
    for t in range(len(R) - 1):
        if np.isnan(sig[t]).any():
            continue
        g = np.argsort(np.argsort(sig[t])) * q // n
        rows.append([R[t + 1][g == k].mean() for k in range(q)])
    return np.array(rows)`,
          tests: `sig = np.array([[np.nan, np.nan, np.nan, np.nan], [1.0, 2.0, 3.0, 4.0], [4.0, 3.0, 2.0, 1.0]])
R = np.array([[0, 0, 0, 0], [0, 0, 0, 0], [0.01, 0.02, 0.03, 0.04]])
out = quantile_returns(sig, R, 2)
assert out is not None and len(out) > 0, "the function returns nothing yet"
assert out.shape == (1, 2), f"one usable period (t = 1), two groups: shape (1, 2), got {out.shape}"
assert np.allclose(out[0], [0.015, 0.035]), f"the signal at t = 1 is scored on R[2]: expected [0.015, 0.035], got {out[0]}"`,
          why: 'Each row is one month: the signal known at its end, scored on the month after. Averaging the rows gives the staircase; the last column minus the first, row by row, is the long-short spread series.',
        },
        {
          kind: 'bug',
          id: 'qalpha-lab-4',
          ask: 'Step 4: the spread. This builds the 12-1 signal at the end of each month t and scores it on month t + 1. On the made-up universe it shows a top-minus-bottom spread of about 6.5% a month, and about 6% on the control with no drift at all.',
          code: `import numpy as np

def spread_series(R, q=5):
    out = []
    for t in range(11, len(R) - 1):
        sig = np.prod(1 + R[t - 11:t + 2], axis=0) - 1
        g = np.argsort(np.argsort(sig)) * q // R.shape[1]
        out.append(R[t + 1][g == q - 1].mean() - R[t + 1][g == 0].mean())
    return np.array(out)`,
          line: 6,
          fix: '        sig = np.prod(1 + R[t - 11:t], axis=0) - 1',
          why: 'The slice `R[t − 11:t + 2]` runs to month t + 1, the month being scored, so stocks are ranked partly on the return they are about to be paid. With 8% monthly noise that alone sorts winners from losers by several percent. The 12-1 window is `R[t − 11:t]`, months t − 11 to t − 1; fixed, the spread falls to about 0.65% a month, and to about 0.1% on the control. A control with no effect that still shows a big spread is the quickest lookahead test there is.',
        },
        {
          kind: 'write',
          id: 'qalpha-lab-5',
          numpy: true,
          ask: 'Step 5: the IC. Return an array with the rank IC (correlation of double-`argsort` ranks) of `sig[t]` against `R[t + 1]` for every t where `sig[t]` has no `nan` and `t + 1 < len(R)`.',
          starter: `import numpy as np

def ic_series(sig, R):
    out = []
    return np.array(out)`,
          solution: `import numpy as np

def ic_series(sig, R):
    rank = lambda x: np.argsort(np.argsort(x))
    out = []
    for t in range(len(R) - 1):
        if np.isnan(sig[t]).any():
            continue
        out.append(np.corrcoef(rank(sig[t]), rank(R[t + 1]))[0, 1])
    return np.array(out)`,
          tests: `sig = np.array([[np.nan] * 4, [1.0, 2.0, 3.0, 4.0], [1.0, 2.0, 3.0, 4.0], [0.0, 0.0, 0.0, 0.0]])
R = np.array([[0.0] * 4, [0.0] * 4, [0.01, 0.02, 0.03, 0.04], [0.04, 0.03, 0.02, 0.01]])
out = ic_series(sig, R)
assert out is not None and len(out) > 0, "the function returns nothing yet"
assert len(out) == 2, f"t = 1 and t = 2 are usable, got {len(out)} values"
assert np.allclose(out, [1.0, -1.0]), f"t = 1 is scored on R[2] (same order: 1) and t = 2 on R[3] (reversed: -1), got {out}"
assert np.allclose(ic_series(sig * 100 + 7, R), out), "a rank IC does not depend on the scale of the signal"`,
          why: 'One rank correlation per month. Its mean, ICIR and t, from the lesson on judging a signal, are the summary; its plot by year shows whether the effect is steady or came from a few months.',
        },
        {
          kind: 'write',
          id: 'qalpha-lab-6',
          numpy: true,
          ask: 'Step 6: weights. Return `W` with the shape of `sig`: for each row with no `nan`, +1/k on the k = n // q highest signals and −1/k on the k lowest, 0 elsewhere; rows with `nan` are all 0.',
          starter: `import numpy as np

def long_short_weights(sig, q):
    W = np.zeros(sig.shape)
    return W`,
          solution: `import numpy as np

def long_short_weights(sig, q):
    W = np.zeros(sig.shape)
    k = sig.shape[1] // q
    for t in range(len(sig)):
        if np.isnan(sig[t]).any():
            continue
        order = np.argsort(sig[t])
        W[t, order[-k:]] = 1 / k
        W[t, order[:k]] = -1 / k
    return W`,
          tests: `sig = np.array([[np.nan] * 4, [0.3, -0.1, 0.5, 0.0]])
out = long_short_weights(sig, 2)
assert out is not None, "the function returns nothing yet"
assert np.allclose(out[0], 0), "a row with nan is flat"
assert np.allclose(out[1], [0.5, -0.5, 0.5, -0.5]), f"top two long 0.5 each, bottom two short: got {out[1]}"
W = long_short_weights(np.random.default_rng(0).normal(size=(3, 100)), 5)
assert np.allclose(W.sum(axis=1), 0) and np.allclose(np.abs(W).sum(axis=1), 2), "each row is 100% long and 100% short"
assert ((W != 0).sum(axis=1) == 40).all(), "20 longs and 20 shorts out of 100 with q = 5"`,
          why: 'Equal weights inside the top and bottom fifths, the usual academic construction. The gross book is 2 times capital, one long and one short, so turnover and costs are measured on the same scale as in the lesson on judging a signal.',
        },
        {
          kind: 'write',
          id: 'qalpha-lab-7',
          numpy: true,
          ask: 'Step 7: net returns. For t from 0 to len(R) − 2, the gross return is `W[t] · R[t + 1]` and the cost is `cost × Σ|W[t] − W[t−1]|`, with the weights before the start all 0. Return `gross − cost`, length len(R) − 1.',
          starter: `import numpy as np

def net_returns(W, R, cost):
    W = np.asarray(W, dtype=float)
    R = np.asarray(R, dtype=float)
    gross = (W[:-1] * R[1:]).sum(axis=1)
    return gross`,
          solution: `import numpy as np

def net_returns(W, R, cost):
    W = np.asarray(W, dtype=float)
    R = np.asarray(R, dtype=float)
    gross = (W[:-1] * R[1:]).sum(axis=1)
    trades = np.abs(np.diff(W, axis=0, prepend=0)).sum(axis=1)[:-1]
    return gross - cost * trades`,
          tests: `W = np.array([[0.5, -0.5], [-0.5, 0.5], [-0.5, 0.5]])
R = np.array([[0.0, 0.0], [0.02, -0.02], [0.01, 0.03]])
out = net_returns(W, R, 0.001)
assert out is not None, "the function returns nothing yet"
assert len(out) == 2, f"one return per month after the first, got {len(out)}"
assert np.allclose(out, [0.02 - 0.001, 0.01 - 0.002]), f"month 0: build costs 1.0 x 0.1%; month 1: the flip trades 2.0, got {out}"
assert np.allclose(net_returns(W, R, 0.0), [0.02, 0.01]), "with no cost, the weights at t earn R[t + 1]"`,
          why: 'Building the book trades 1.0 (half long, half short); flipping both names trades 2.0. Momentum ranks change slowly, so most months only part of the book is replaced, but a turnover near 0.9 a month at 0.2% still costs about 2% a year.',
        },
        {
          kind: 'output',
          id: 'qalpha-lab-8',
          ask: 'Step 8: the verdict and the control. The full pipeline on the made-up universe with drift, and on the same universe with the drift switched off: mean IC, then annualised net Sharpe at 0.2% a dollar traded. What does this print?',
          code: `import numpy as np

def make_universe(n_assets, n_months, seed, strength=1.0):
    rng = np.random.default_rng(seed)
    mkt = rng.normal(0.006, 0.04, n_months)
    noise = rng.normal(0, 0.08, (n_months, n_assets))
    shocks = rng.normal(0, 0.0025, (n_months, n_assets))
    mu = np.zeros((n_months, n_assets))
    for t in range(1, n_months):
        mu[t] = 0.95 * mu[t - 1] + strength * shocks[t]
    return mkt[:, None] + mu + noise

def verdict(R, q=5, cost=0.002):
    rank = lambda x: np.argsort(np.argsort(x))
    sig = np.full(R.shape, np.nan)
    for t in range(11, len(R)):
        sig[t] = np.prod(1 + R[t - 11:t], axis=0) - 1
    ic = [np.corrcoef(rank(sig[t]), rank(R[t + 1]))[0, 1] for t in range(11, len(R) - 1)]
    W = np.zeros(R.shape)
    k = R.shape[1] // q
    for t in range(11, len(R)):
        o = np.argsort(sig[t])
        W[t, o[-k:]], W[t, o[:k]] = 1 / k, -1 / k
    net = (W[:-1] * R[1:]).sum(axis=1) - cost * np.abs(np.diff(W, axis=0, prepend=0)).sum(axis=1)[:-1]
    net = net[11:]
    return round(float(np.mean(ic)), 3), round(float(net.mean() / net.std(ddof=1) * np.sqrt(12)), 1)

print(verdict(make_universe(200, 240, 0)), verdict(make_universe(200, 240, 0, strength=0.0)))`,
          answer: '(0.026, 1.0) (0.003, -0.2)',
          why: 'With the drift the mean IC is 0.026 (t about 6 over 228 months) and the net Sharpe about 1.0, down from about 1.4 gross: turnover near 0.9 a month at 0.2% costs about 2% a year. With the drift off, the IC is noise and the costs push the Sharpe below zero, which is what a correct pipeline must show. A Sharpe of 1.0 on data built to contain the effect says the code works, not that real momentum pays this much.',
        },
        {
          kind: 'design',
          id: 'qalpha-lab-9',
          ask: 'Step 9: reading the result. Suppose the same pipeline on 20 years of real US stock data gives a mean rank IC of 0.02 (t = 2.4), a net Sharpe of 0.4, a turnover of 0.9 a month and a worst year of −45%. What do you conclude and what do you do next?',
          checklist: [
            { point: 'Run the factor regression: this is the published momentum factor, not new alpha', why: 'Rediscovering a known factor is a check that the code works, not an edge.' },
            { point: 'Count the variants tried: lookbacks, skips, quantiles, weights', why: 'A t of 2.4 after many tries is weaker than it looks.' },
            { point: 'Look at the worst year and when it came: a rebound after a crash?', why: 'Momentum crashes are the known tail; size must survive one.' },
            { point: 'Check costs at your size: spread, impact and short borrow on the losers', why: 'The short side holds the costliest stocks to trade.' },
            { point: 'Check the universe for survivorship and point-in-time membership', why: 'Missing delisted losers flatters the short side.' },
            { point: 'Plot the IC and spread by year', why: 'Published factors tend to fade after publication.' },
            { point: 'Compare with cheaply available momentum funds before building your own', why: 'If you only want the factor, someone sells it at low cost.' },
          ],
          why: 'The honest outcome of testing a known factor is "it is there, it is small, it has crashed, and it is already sold". The lab is a template for testing ideas that are not yet known, with the same discipline.',
        },
      ],
    },
  ],
}
