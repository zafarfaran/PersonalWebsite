import type { Block } from '../../types'

/** The full theory for each lesson of the qalpha module, keyed by lesson id. */
export const qalphaTheory: Record<string, Block[]> = {
  'qalpha-beta': [
    { h: 'Splitting a return in two' },
    "Any stock, fund or strategy rises and falls partly because the whole market does. On a day the S&P 500 drops 3%, most stocks drop too, whoever picked them. Before you can say a strategy is good, you have to remove the part of its return that came from the market's move. What is left is the part that might be skill. The two pieces have names: **beta**, the exposure to the market, and **alpha**, the return that remains after paying for that exposure.",
    'Both are measured on **excess returns**: the return minus the **risk-free rate**, the interest you could earn on cash with no risk (a short-term Treasury bill rate). A strategy that returns 4% when cash pays 4% has earned nothing for its risk.',

    { h: 'The market regression' },
    { sub: 'The equation' },
    'Write r for the asset\'s return, rm for the market\'s and rf for the risk-free rate, all over the same period. The model is `r − rf = α + β × (rm − rf) + ε`. It is a straight line fitted through a cloud of points, one point per day or month, with the market\'s excess return across and the asset\'s up. β (beta) is the slope, α (alpha) is the height of the line where the market\'s excess return is zero, and ε (epsilon) is the **residual**: each point\'s distance above or below the line, the part the market does not explain.',
    { sub: 'Least squares by hand' },
    'Least squares picks the line that makes the squared residuals as small as possible. For one input it has a closed form: `β = cov(r, rm) ÷ var(rm)` and `α = mean(r) − β × mean(rm)`. The **covariance** measures how two series move together; the **variance** is the covariance of a series with itself. Compute both with the same divisor: `np.cov` divides by n − 1 by default, so pair it with `np.var(m, ddof=1)`. Dividing by the asset\'s variance instead of the market\'s is a common slip; it gives the slope of the market on the asset, a different number.',
    'In NumPy, `np.polyfit(x, y, 1)` fits the same line and returns the slope first, then the intercept. In practice people use `statsmodels.OLS`, which also reports a standard error for each coefficient; the version below computes the t statistic by hand.',
    {
      code: `import numpy as np

rng = np.random.default_rng(1)
m = rng.normal(0.0004, 0.01, 500)                  # two years of market days
r = 0.0001 + 0.8 * m + rng.normal(0, 0.012, 500)   # a made-up stock
beta = np.cov(r, m)[0, 1] / np.var(m, ddof=1)
alpha = r.mean() - beta * m.mean()
resid = r - alpha - beta * m
t = alpha / (resid.std(ddof=1) / np.sqrt(len(r)))
print(round(beta, 2), round(alpha * 252, 3), round(t, 2))`,
      out: `0.8 -0.195 -1.37`,
    },
    'The data was built with a beta of 0.8 and a true alpha of 0.01% a day, about 2.5% a year (daily figures annualise by × 252 trading days). The fit recovers the beta well. The alpha comes out at −19.5% a year, with a t of −1.4: two years of noisy days cannot even get its sign right. Beta is easy to measure; alpha is not.',

    { h: 'Beta is not skill' },
    'Market exposure is cheap. An index fund gives you a beta of 1 for a tiny fee, and borrowing or futures give more. So a manager should be judged against the return their beta alone would have earned: `rf + β × (rm − rf)`. Take a year when the market made 10% and cash paid 2%. A fund with beta 1.3 "should" have made 2% + 1.3 × 8% = 12.4%. If it made 13%, its alpha was 0.6%, not the 3% by which it beat the market. In a falling year the same high beta loses more than the market, which is why a record built in a bull market says little.',

    { h: 'Hedging beta away' },
    'If you like a stock but not the market risk that comes with it, **hedge**: sell short β dollars of an index fund such as SPY for each dollar of the stock. A $20,000 position in a stock with beta 0.9 is hedged by $18,000 of SPY short. The hedged return each day is about `r − β × rm`: on a day SPY rises 2% and the stock 3%, the hedged position makes 3% − 0.9 × 2% = 1.2% of the stock\'s value. Averaged over many days that number estimates alpha, and its standard deviation is the **residual volatility**. The hedge is only as good as the beta estimate, which drifts over time and is noisy over short windows; many practitioners shrink estimates part of the way towards 1.',

    { h: 'How long it takes to prove an alpha' },
    { sub: 'The information ratio' },
    'The **information ratio** is `IR = α ÷ residual volatility`, both per year. A daily residual volatility converts to annual by × √252: 1% a day is about 15.9% a year. An alpha of 2% against 16% residual volatility is an IR of 0.125.',
    { sub: 'Years of data' },
    'As with the Sharpe ratio in the quant module, the t statistic of the alpha is about `IR × √years`. To reach t = 2 you need `years = (2 ÷ IR)²`. At IR 0.125 that is 256 years. Lowering residual volatility, by holding many hedged positions so that their noise averages out, is the main way to make a small alpha measurable. Until then, the reason a strategy should work matters as much as its record.',

    { h: 'Mistakes that make a record look like alpha' },
    {
      list: [
        'Comparing with the market\'s return and ignoring a beta above 1 in a rising market.',
        'Reading a fitted alpha without its t statistic and the number of years behind it.',
        'Mixing ddof between the covariance and the variance, or dividing by the wrong variance.',
        'Ignoring tilts the market alone misses, such as small or cheap stocks (the next lesson).',
        'Believing a record that leaves out dropped picks, or is the best of many lists shown to you.',
        'Forgetting costs and spreads at the size you would really trade.',
      ],
    },
  ],

  'qalpha-factors': [
    { h: 'What a factor is' },
    'The market is one source of return everyone can buy. Research since the 1980s found others: groups of stocks sharing a trait that, on average over long periods, did better or worse than their beta implied. A **factor** turns a trait into a portfolio. Each month, sort stocks on the trait, buy one end and short the other, and record the return of that long-short portfolio. That series is the **factor return**.',
    'A **factor model** regresses an asset\'s excess return on several factor returns at once: `r − rf = α + β·MKT + s·SMB + h·HML + m·UMD + ε`. Each coefficient is a **loading**, the asset\'s exposure to that factor. Alpha is now what is left after the market and every factor in the model.',

    { h: 'The classic factors' },
    { sub: 'Size and value' },
    '**Size** (SMB, small minus big) buys small companies and shorts large ones (Banz 1981; Fama and French 1993). **Value** (HML, high minus low) buys stocks with a high ratio of book value to market price, cheap stocks, and shorts expensive ones.',
    { sub: 'Momentum' },
    '**Momentum** (UMD, up minus down) buys the stocks with the best returns over roughly the past year and shorts the worst (Jegadeesh and Titman 1993; Carhart 1997). The standard version measures the return from 12 months ago to 1 month ago and skips the latest month, because returns over a single month tend to partly reverse the next month, an effect called **short-term reversal**. In code, with monthly prices `p`, the 12-1 signal at the end of month t is `p[t − 1] / p[t − 12] − 1`.',
    { sub: 'Quality, low volatility and carry' },
    '**Quality** or profitability (RMW, strong minus weak operating profitability) buys firms with high profits relative to their assets (Novy-Marx 2013; Fama and French 2015). **Low volatility** or **betting against beta** (Frazzini and Pedersen 2014) finds that low-beta stocks earned more than their beta predicts and high-beta stocks less; one explanation is that investors who cannot borrow buy high-beta stocks to get more risk, bidding them up. How large the effect is depends on how beta is estimated (Novy-Marx and Velikov 2022). **Carry** is the return an asset earns if its price stays the same: in currencies, roughly the gap between two interest rates (Koijen, Moskowitz, Pedersen and Vrugt 2018). Carry trades have often unwound sharply in crises.',

    { h: 'Reading a factor regression' },
    'Suppose a fund\'s excess return last year was 7%, with loadings 0.9 on the market, 0.5 on SMB and 0.3 on HML, and those factors returned 5%, 2% and 3%. The factors explain 4.5% + 1.0% + 0.9% = 6.4%, so the alpha is 0.6%. Against the market alone the alpha would look like 7% − 4.5% = 2.5%. The difference was a tilt towards small and cheap stocks that anyone can buy through a fund.',
    {
      code: `import numpy as np

rng = np.random.default_rng(5)
F = rng.normal(0, 0.04, (120, 2))                  # market and value, monthly
r = 0.001 + F @ np.array([1.0, 0.6]) + rng.normal(0, 0.01, 120)
X = np.column_stack([np.ones(120), F])
coef, *_ = np.linalg.lstsq(X, r, rcond=None)
print(np.round(coef, 4).tolist())`,
      out: `[0.0001, 1.0038, 0.585]`,
    },
    'The column of ones gives the intercept, the alpha; without it the loadings are forced to explain the average return too, and the alpha disappears into them. The loadings come back close to the true 1.0 and 0.6. The alpha, built at 0.1% a month, comes back as 0.01%: ten years of monthly data pin down loadings far better than they pin down an alpha.',

    { h: 'How the evidence has faded' },
    'Every one of these factors has had long bad spells, and several have weakened since they were published. The US size premium was weak after the early 1980s and lives mostly in the smallest stocks. Value lost about half its value against growth from 2007 to 2020, by most measures the deepest drawdown in its recorded history. Momentum **crashes** in sharp rebounds: from March to May 2009 the past-loser decile rose about 163% while the past winners gained about 8% (Daniel and Moskowitz, "Momentum Crashes"). A short position can lose more than 100% of its value, so a long-short book can lose more than its capital.',
    'Even a real premium can hide for a decade. With independent yearly returns, the n-year Sharpe ratio is the yearly one × √n, so the chance of losing over n years is about Φ(−SR × √n), where Φ is the normal cumulative distribution from the quant module.',
    {
      code: `import math

phi = lambda x: 0.5 * (1 + math.erf(x / math.sqrt(2)))
for years in (1, 5, 20):
    print(years, round(phi(-0.4 * math.sqrt(years)), 2))`,
      out: `1 0.34
5 0.19
20 0.04`,
    },
    'A factor with a true Sharpe of 0.4 loses money in about one five-year spell in five. People abandon real premiums during such spells, and keep dead ones alive because a bad decade looks like the same thing.',

    { h: 'Why this matters to your own research' },
    'Most new signals are partly old factors. Regress your signal\'s long-short returns on the standard factors. If the alpha collapses once momentum is added and the momentum loading is large, you have rebuilt momentum: it is cheaper to buy, and your signal will crash when momentum does. Factor returns for the US and many other markets are free from Kenneth French\'s data library at the time of writing (2026). Build your factor returns over the same dates and the same way as your test, and report the alpha with its t and the number of years.',
  ],

  'qalpha-xsection': [
    { h: 'Two ways to compare' },
    'A signal can compare an asset with its own past or with other assets today. The two give very different portfolios, even when they use the same number, such as the past year\'s return.',
    { sub: 'Time-series signals' },
    'A **time-series** signal looks at each asset alone: hold an index when its 12-month return is positive, otherwise stay flat or go short. **Time-series momentum** across dozens of futures markets is the best known case (Moskowitz, Ooi and Pedersen 2012). Because each asset decides on its own, all can be long at once. With eight markets of equal risk, six long and two short, the **net exposure** is (6 − 2) ÷ 8 = 0.5 of the gross: the book carries a direction.',
    { sub: 'Cross-sectional signals' },
    'A **cross-sectional** signal ranks assets against each other on the same date: rank 500 stocks by 12-1 momentum, buy the top and short the bottom. It bets on **relative** returns. With equal dollars long and short, the book is **dollar neutral**, and much of the market\'s move cancels. If $50,000 long rises 2% and $50,000 short rises 4%, the book loses $1,000 in a rising market; in a falling market it can make money if its shorts fall further than its longs.',

    { h: 'Ranks' },
    'Ranking from the quant module turns any signal into its order. In NumPy, `np.argsort(x)` gives the **positions** of the values from smallest to largest. Applying `argsort` a second time turns that order into each value\'s **rank**, 0 for the smallest. One `argsort` alone is a classic bug that a sorted test input will not catch.',
    {
      code: `import numpy as np

s = np.array([1.4, -0.3, 0.8, -2.1, 0.0, 2.5, -0.9, 0.5, 1.1])
ranks = np.argsort(np.argsort(s))
group = ranks * 3 // len(s)
print(ranks.tolist())
print(group.tolist())`,
      out: `[7, 2, 5, 0, 3, 8, 1, 4, 6]
[2, 0, 1, 0, 1, 2, 0, 1, 2]`,
    },
    'The second line assigns each stock to one of three groups: `rank × q // n`, with `//` the floor division that drops the remainder. The three lowest ranks land in group 0, the next three in group 1, the top three in group 2.',

    { h: 'Quantile portfolios' },
    'The standard test of a cross-sectional signal is the **quantile test**. Each period, sort stocks by the signal and cut them into q equal groups: **quintiles** for q = 5, **deciles** for q = 10. Record each group\'s average return over the next period, never the same period the signal used. Average those numbers over all periods to get one bar per group.',
    { sub: 'The staircase' },
    'A signal with information shows a **monotonic** pattern, bars rising steadily from the lowest group to the highest. The **long-short spread**, top group minus bottom group, is the return of a dollar-neutral portfolio before costs. A spread of 0.5% a month adds to about 6% a year without compounding.',
    { sub: 'Reading the shape' },
    'If the bottom group is far below and the other four are level, the signal only says which stocks to avoid. The money is on the short side, among small, volatile stocks that are costly to borrow and prone to **short squeezes**, sudden jumps as short sellers rush to buy back. A long-only fund gains little from such a signal. If the middle groups jump around, the spread may be one lucky tail.',
    { sub: 'Noise and the t of the spread' },
    'Even a signal with no information gives bars of a few tenths of a percent, up and down. Treat the spread as a series, one value per month, and compute its t statistic: mean ÷ (standard deviation ÷ √months). More quantiles widen the spread but put fewer stocks in each end, so the t does not rise with them.',

    { h: 'Rank weights' },
    'Quantiles throw away the middle. **Rank weights** use every stock: take `rank − mean rank`, then divide by half the sum of the absolute values, so the long weights add to +1 and the shorts to −1. With four stocks ranked 0 to 3, the centred ranks are −1.5, −0.5, 0.5, 1.5 and the weights −0.75, −0.25, 0.25, 0.75. A value 100 times larger than the rest gets no more weight than any other top stock.',

    { h: 'Mistakes in a quantile test' },
    {
      list: [
        "Using today's index members for the whole history: the survivors flatter any signal.",
        'Letting the signal and the scored return overlap in time.',
        'Reporting the spread without its t statistic over periods.',
        'Ignoring that the spread is gross: both sides cost trading, and shorts cost borrow fees.',
        'Looking only at the average, not at the spread by year and in crashes.',
      ],
    },
  ],

  'qalpha-clean': [
    { h: 'Why raw signals need cleaning' },
    'A raw signal is whatever the data gave you, errors included. A misprinted price, a takeover target up 70% in a day, a company with almost no book value whose book-to-price ratio explodes: each produces a value far from the rest. When you standardise across stocks, that one value moves the mean and inflates the standard deviation, and every other stock is squeezed towards zero. The portfolio then becomes a bet on the outlier. Cleaning sets rules, decided before testing, for what the signal is allowed to say.',

    { h: 'Winsorising' },
    { sub: 'Clipping at percentiles' },
    '**Winsorising** caps extreme values instead of dropping them. Each day, compute a low and a high **percentile** of that day\'s cross-section, often the 1st and 99th, and clip everything outside to those values with `np.clip`. `np.percentile` interpolates between sorted values, so on a handful of values a "99th percentile" lies most of the way to the largest one and trims almost nothing. Percentile clipping needs a wide cross-section.',
    { sub: 'Other choices' },
    'You can instead clip at a fixed number of standard deviations, such as ±3, or replace values with ranks, which keeps only the order and is the strongest cleaning of all.',

    { h: 'Z-scores after clipping' },
    'A cross-sectional **z-score** subtracts the day\'s mean and divides by the day\'s standard deviation, `(x − mean) ÷ sd`, so signals in different units share one scale. Clip first and standardise after, or standardise, clip at ±3 and standardise again.',
    {
      code: `import numpy as np

x = np.array([0.2, -0.5, 0.1, 0.4, -0.2, 0.0, 0.3, -0.1, 0.6, 9.0])
z_raw = (x - x.mean()) / x.std()
c = np.clip(x, -1.0, 1.0)
z_clip = (c - c.mean()) / c.std()
print(np.round(z_raw[:3], 2).tolist(), round(z_raw[-1], 2))
print(np.round(z_clip[:3], 2).tolist(), round(z_clip[-1], 2))`,
      out: `[-0.29, -0.55, -0.33] 2.98
[0.05, -1.68, -0.2] 2.03`,
    },
    'Raw, the one bad value of 9.0 pushes the mean up, so nine ordinary stocks all get negative z-scores close together. Clipped at 1.0, the ordinary stocks spread out again and the distinction between −0.5 and 0.6 becomes visible. `x.std()` here is the **population** standard deviation, dividing by n.',
    { sub: 'Missing values' },
    'A stock with no value today gets a z-score of 0 after the others are standardised: no data means no view. Filling it with a value reported later is lookahead. Dropping the stock from the whole history because of one gap invents a universe you could not have traded.',

    { h: 'Neutralising to sectors' },
    'A signal can carry bets you never chose. A value signal is heavy in banks and light in technology; a low-volatility signal is long utilities. **Sector neutralising** subtracts each sector\'s own mean from its stocks. Subtracting the overall mean instead shifts everyone equally and leaves the sector bet in place.',
    {
      code: `import numpy as np

s = np.array([2.0, 1.0, 0.0, -1.0, -0.5, -1.5])
sector = np.array(['bank', 'bank', 'bank', 'tech', 'tech', 'tech'])
out = s.copy()
for k in np.unique(sector):
    out[sector == k] = s[sector == k] - s[sector == k].mean()
print(out.tolist())`,
      out: `[1.0, 0.0, -1.0, 0.0, 0.5, -0.5]`,
    },
    'Before, every bank scored above every tech stock: the signal said "banks over tech". After, each sector sums to zero, and the signal only says which bank beats which bank and which tech stock beats which. The order inside each sector is unchanged.',

    { h: 'Neutralising to beta' },
    { sub: 'Dollar neutral is not market neutral' },
    'Equal dollars long and short still leave a market bet if the two sides have different betas. A $500,000 long side with average beta 1.4 and a $500,000 short side with beta 0.9 has a net beta exposure of $700,000 − $450,000 = $250,000. A 3% market fall costs about $7,500.',
    { sub: 'The regression residual' },
    '**Beta neutralising** regresses the signal on the stocks\' betas across stocks, with an intercept, and keeps the residual. Least squares makes the residual uncorrelated with every column of the regression: the column of ones makes it sum to zero (dollar neutral), and the beta column makes its beta-weighted sum zero (beta neutral).',
    {
      code: `import numpy as np

beta = np.array([0.6, 0.9, 1.0, 1.2, 1.5])
s = np.array([-1.0, 0.5, 0.2, 1.0, 1.8])
X = np.column_stack([np.ones(5), beta])
coef, *_ = np.linalg.lstsq(X, s, rcond=None)
res = s - X @ coef
print(round(abs(res.sum()), 10), round(abs(res @ beta), 10))`,
      out: `0.0 0.0`,
    },

    { h: 'Neutralising is a choice' },
    'Removing a sector or market bet usually lowers risk and makes the remaining signal easier to judge. It can also lower return, if the sector bet was where the information was. Comparing both versions and keeping whichever backtests better is one more test on the same data. Decide which bet you mean to hold, from a reason, before you look; then use exactly the same cleaning steps in research and in live trading.',
  ],

  'qalpha-judge': [
    { h: 'A report card for a signal' },
    'A signal that ranks stocks needs more than one number. You want to know how strong it is, how steady, how fast it fades, how much trading it needs and what that trading costs, and how much of it a real portfolio can capture. This lesson builds those measures; the quant module defined the first of them.',

    { h: 'The IC as a time series' },
    { sub: 'One IC per period' },
    'The **information coefficient** (IC) is the correlation, across stocks on one date, between the signal and the return that follows. Computed every period it becomes a series. Its mean is the signal\'s strength, its standard deviation how erratic it is, and `ICIR = mean ÷ sd` is a per-period information ratio. A **rank IC** uses the correlation of ranks instead of raw values, which ignores outliers.',
    { sub: 'Its t statistic' },
    'The t statistic of the mean IC is `ICIR × √T`, with T the number of periods. Count periods, not stocks. On one day, 500 stocks are moved by the same news and mood, so a day\'s IC is one draw, however many stocks went into it. Dividing by √stocks instead of √periods inflates t many times.',
    {
      code: `import numpy as np

rng = np.random.default_rng(3)
S = rng.normal(size=(120, 400))                # 120 months, 400 stocks
F = 0.03 * S + rng.normal(size=(120, 400))     # returns with a faint link
ic = np.array([np.corrcoef(S[t], F[t])[0, 1] for t in range(120)])
icir = ic.mean() / ic.std(ddof=1)
print(round(ic.mean(), 3), round(icir, 2), round(icir * np.sqrt(120), 1), round((ic > 0).mean(), 2))`,
      out: `0.029 0.63 6.9 0.71`,
    },
    'A mean IC of 0.029, which sounds tiny, gives t = 6.9 over ten years of months, because it is steady. The last number is the **hit rate**: the share of months with a positive IC, here 71%. In practice the Python library `alphalens` produces these tables from pandas data; the arithmetic is what is shown here.',

    { h: 'IC decay and the hit rate' },
    '**IC decay** measures the IC against returns 1, 2, 5, 10 and 20 days ahead. A signal whose IC halves in two days must be traded fast and pays the spread often. A weaker signal that keeps its IC for weeks can be traded slowly and cheaply, and after costs often wins.',
    'A hit rate can also mean the share of positions that moved the way the signal said. Good signals sit near 51% to 55%. A hit rate ignores the size of moves: right on many small ones and wrong on a few large ones loses money.',

    { h: 'Turnover and what it costs' },
    { sub: 'Measuring turnover' },
    '**Turnover** at a rebalance is the money traded as a fraction of capital: `Σ|w_new − w_old|`, summed over stocks. Flipping a 0.25 long into a 0.25 short is a trade of 0.5, closing and opening. Over a matrix of weights, `np.diff(W, axis=0)` gives each period\'s changes.',
    {
      code: `import numpy as np

w_old = np.array([0.4, 0.3, 0.3, -0.5, -0.5])
w_new = np.array([0.4, 0.6, 0.0, -0.5, -0.5])
turn = np.abs(w_new - w_old).sum()
print(round(turn, 2), round(turn * 52 * 0.0015, 4))`,
      out: `0.6 0.0468`,
    },
    { sub: 'Annual cost and break-even cost' },
    'Annual cost is about `turnover per rebalance × rebalances a year × cost per dollar traded`. Above, a weekly rebalance trading 0.6 at 0.15% a dollar costs 4.68% a year. The **break-even cost** turns this round: divide the gross annual return by the dollars traded a year. A signal earning 4% gross while trading 10 times its capital breaks even at 0.4% per dollar traded. Compare that with what you really pay in spread, fees and price impact, not a broker\'s headline fee.',

    { h: 'Breadth and the transfer coefficient' },
    'The quant module gave **Grinold\'s fundamental law**, `IR ≈ IC × √breadth`, where **breadth** is the number of independent bets a year. 500 stocks that move together are far fewer than 500 bets. The law assumes you can hold exactly what the signal asks for. Real portfolios cannot: a long-only fund cannot short, position caps cut the biggest bets, sector limits bind. The **transfer coefficient** (TC), the correlation between the weights you hold and the weights the signal wants, scales the law: `IR ≈ TC × IC × √breadth` (Clarke, de Silva and Thorley 2002). An IC of 0.04 with 100 bets a year gives 0.4 unconstrained; at TC 0.4 it gives 0.16. Long-only funds often have a TC between 0.3 and 0.6.',

    { h: 'Putting the report together' },
    {
      list: [
        'Mean IC, ICIR and t, with the number of periods.',
        'IC by horizon, and how fast it decays.',
        'The quantile staircase and the long-short spread.',
        'Turnover, annual cost and the break-even cost.',
        'IC by year, to see whether the signal is fading.',
        'Correlation with known factors and with signals you already trade.',
        'The number of variants tried before this one.',
      ],
    },
  ],

  'qalpha-combine': [
    { h: 'Why combine' },
    'No single signal is strong. A fund usually runs several, each with a small IC, and blends them into one score per stock. The quant module showed that k signals with equal ICs and equal correlation give an equal blend whose IC rises with k when the correlation is low. This lesson handles any weights, any ICs and any correlations, and shows why fitting the weights is dangerous.',

    { h: 'The IC of a blend' },
    { sub: 'The formula' },
    'Take standardised signals (each z-scored across stocks, mean 0, standard deviation 1). Write `ic` for the vector of their ICs and C for their **correlation matrix**: the table whose entry in row i, column j is the correlation between signals i and j, with 1 on the diagonal. A blend with weights w has `IC = (w · ic) ÷ √(w · C · w)`. The top is the information the weights collect; the bottom is the standard deviation of the blend, which grows less when the signals overlap less.',
    { sub: 'Two checks' },
    'Multiplying every weight by the same number leaves the IC unchanged: only the direction of w matters. With one weight of 1 and the rest 0, the formula returns that signal\'s own IC.',

    { h: 'The best weights' },
    'The weights that maximise the blend\'s IC are proportional to `C⁻¹ · ic`, the inverse of the correlation matrix times the ICs. They are the same weights a regression of next-period returns on the signals would find. In NumPy, `np.linalg.solve(C, ic)` computes them without forming the inverse, which is more accurate.',
    { sub: 'Uncorrelated signals' },
    'If C is the identity (no overlap), the best weights are proportional to the ICs and the best IC is `√(Σ ic²)`. Two independent signals of 0.02 and 0.05 reach about 0.054: independent information adds like the sides of a right triangle.',
    { sub: 'Overlapping signals' },
    'Overlap changes the answer, sometimes sharply.',
    {
      code: `import numpy as np

ic = np.array([0.03, 0.03, 0.025])
C = np.array([[1.0, 0.7, 0.1], [0.7, 1.0, 0.1], [0.1, 0.1, 1.0]])
blend = lambda w: float(w @ ic / np.sqrt(w @ C @ w))
best = np.linalg.solve(C, ic)
print(round(blend(np.ones(3)), 4), round(blend(best), 4), np.round(best / best.sum(), 2).tolist())`,
      out: `0.0388 0.0391 [0.3, 0.3, 0.4]`,
    },
    'The first two signals are 0.7 correlated, two versions of one idea. The third is weaker but nearly independent, and the best blend gives it the largest weight. Note also how little the best weights gain over equal weights: 0.0391 against 0.0388. When a weaker signal is highly correlated with a stronger one, the best weight on the weaker one can be zero or even negative.',

    { h: 'Units before weights' },
    'Adding raw signals weights them by their spread, not by your choice. A signal ranging from 0.2 to 3 added to one ranging around ±0.3 decides the ranking alone. Standardise every signal the same way each period, then weight.',

    { h: 'Fitted weights overfit' },
    'The ICs and correlations you plug in are estimates, and with the usual few years of data their errors are large. `C⁻¹` amplifies those errors, most of all when signals are correlated. In-sample, fitted weights always beat equal weights, because they were chosen to. Out of sample they often do not.',
    {
      code: `import numpy as np

rng = np.random.default_rng(11)
X = rng.normal(size=(200, 12))     # 12 signals, no information
y = rng.normal(size=200)
w, *_ = np.linalg.lstsq(X[:100], y[:100], rcond=None)
ic = lambda s, r: np.corrcoef(s, r)[0, 1]
print(round(ic(X[:100] @ w, y[:100]), 2), round(ic(X[100:] @ w, y[100:]), 2))`,
      out: `0.32 -0.04`,
    },
    'Twelve signals of pure noise, weights fitted by least squares on the first 100 periods: an in-sample IC of 0.32 from nothing, and about zero on the next 100. Each free weight is a chance to fit noise. The usual defences:',
    {
      list: [
        'Start from equal weights, or weights proportional to IC.',
        'If you fit, shrink the fitted weights part of the way towards equal.',
        'Keep weights positive unless there is a reason for a negative one.',
        'Fit on one period and judge on a later one, once.',
      ],
    },

    { h: 'What a new signal adds' },
    'A colleague\'s new signal with a respectable IC may be one you already hold in another form. Regress it across stocks, each period, on the signals you already trade, and measure the IC of the **residual**, the part your blend does not already contain. Two signals of IC 0.04 with correlation 0.8 blend to only about 0.042. Correlations between signals also change; crowded signals tend to become more correlated in a sell-off, when many funds cut the same positions. A blend of signals that disagree can also trade less than its parts, since their trades partly cancel.',
  ],

  'qalpha-research': [
    { h: 'Research as a search' },
    'Testing an idea is a search through choices: lookback, skip, universe, quantiles, weighting, rebalance frequency, filters. Each choice tried on the same data is another chance for noise to look like an edge. The quant module showed that testing many ideas raises the chance of a false alarm. This lesson turns that into a process and a number you can compute.',

    { h: 'Start from a hypothesis' },
    'A **hypothesis** with a reason says who is on the other side of the trade and why they keep paying. There are three broad kinds. A **risk premium**: you are paid for holding something unpleasant, such as stocks that fall hardest in crashes. A **behavioural bias**: investors under-react to news or chase recent winners. A **constraint**: some investors cannot short or borrow, so they push prices in predictable ways. A pattern with no reason is more likely to be noise and less likely to last.',
    'Then write the test down before running it: universe, dates, how the data is kept **point in time** (as it was known on each date, not as later revised), the exact signal, horizon, quantiles, weighting, cost model, and the result that counts as success. Decide also what you will do if it fails.',

    { h: 'Three slices of data' },
    { sub: 'Train, validate, hold out' },
    'Split the history. Explore and build on a **training** period. Choose between versions on a **validation** period. Keep a **holdout**, usually the most recent years, and test the final choice on it once.',
    { sub: 'A holdout is used up when you look' },
    'If the holdout result disappoints and you change something and test again, the holdout has become validation: the change was chosen by looking at it. After that only new data, such as months of paper trading, is an honest test.',
    { sub: 'Count the tries' },
    'Keep a log of every version you run, including the ones you discard. That count, N, is part of the result.',

    { h: 'The best of many noise strategies' },
    'Suppose N strategies have no edge at all. Each one\'s estimated annual Sharpe ratio is noise with mean 0 and standard error σ ≈ `1 ÷ √years`. The best of them is not zero. Its expected value is about:',
    'Expected max ≈ `σ × ((1 − γ) × Φ⁻¹(1 − 1/N) + γ × Φ⁻¹(1 − 1/(N·e)))`',
    'Here γ ≈ 0.5772 is the **Euler-Mascheroni constant**, e ≈ 2.718, and Φ⁻¹ is the **inverse normal CDF**: given a probability p it returns the z below which a share p of a normal distribution lies. Φ⁻¹(0.975) is the familiar 1.96. The standard library has it as `statistics.NormalDist().inv_cdf`; SciPy users would call `scipy.stats.norm.ppf`.',
    {
      code: `import math
from statistics import NormalDist

def expected_max_sharpe(n, years):
    g, inv = 0.5772156649, NormalDist().inv_cdf
    return (1 / math.sqrt(years)) * ((1 - g) * inv(1 - 1 / n) + g * inv(1 - 1 / (n * math.e)))

for n in (10, 50, 1000):
    print(n, round(expected_max_sharpe(n, 10), 2))`,
      out: `10 0.5
50 0.72
1000 1.03`,
    },
    'With ten years of data, the best of 50 worthless strategies is expected to show a Sharpe of 0.72; of 1,000, above 1. The bar rises slowly with N and falls with the square root of the years: four times the data halves it. A simulation agrees:',
    {
      code: `import numpy as np

rng = np.random.default_rng(8)
best = rng.normal(0, 1 / np.sqrt(10), (2000, 50)).max(axis=1)
print(round(best.mean(), 2))`,
      out: `0.71`,
    },

    { h: 'The deflated Sharpe ratio' },
    'Bailey and López de Prado (2014) proposed the **deflated Sharpe ratio**: the probability that the true Sharpe is above the expected best of the noise. A simple version is `Φ((SR − expected max) ÷ σ)`, with Φ the normal CDF. With one try the expected max is 0 and this is the ordinary one-sided test. Take a Sharpe of 1.2 found as the best of 50 over 10 years: σ ≈ 0.316, (1.2 − 0.72) ÷ 0.316 ≈ 1.52, and Φ(1.52) ≈ 0.94. A common bar is 0.95, so even this does not quite pass. The full version also widens σ for skewed and fat-tailed returns, which most strategies have.',

    { h: 'What the published record shows' },
    'Harvey, Liu and Zhu (2016) argued that a new factor should clear t = 3, not 2, given how many have been tried. Hou, Xue and Zhang ("Replicating Anomalies", 2020) re-tested 452 published anomalies with the effect of tiny **microcap** stocks limited: about 65% failed the single-test bar of |t| = 1.96, and about 82% failed a multiple-testing bar of 2.78. Their failure rate depends on how microcaps and weighting are handled, and critics say their list counts many variants of the same idea. Jensen, Kelly and Pedersen ("Is There a Replication Crisis in Finance?", 2023) were more hopeful: most factors replicate in a global sample, though with smaller effects than first published.',
    'Both camps agree on the habits: count your tries, expect your effect to shrink, and treat your own best result as weaker than it looks. Most ideas fail an honest protocol; that is cheap compared with trading them.',
  ],

  'qalpha-lab': [
    { h: 'What the lab builds' },
    'The lab tests one known factor from start to finish: **cross-sectional momentum**. At the end of each month, rank stocks by their return over the past 12 months skipping the latest one, buy the top fifth, short the bottom fifth, hold for a month, and repeat. Every step from this module appears once: the signal, quantile returns, the IC, weights, turnover, costs and a control. Testing a known factor first is a check that the machinery works before it is pointed at new ideas.',

    { h: 'A made-up universe with a known answer' },
    'All data in the lab is made up from a fixed seed. Each stock\'s monthly return has three parts: a common **market** move, a slowly wandering **expected return** of its own, and **noise**. The expected return, mu, follows `mu[t] = 0.95 × mu[t − 1] + shock[t]`, the AR(1) process from the series module: each month it keeps 95% of last month\'s value and adds a small shock. A stock whose mu drifted up has likely done well recently and is likely to keep a high mu next month. That is momentum, built in on purpose and kept small next to 8% monthly noise.',
    { sub: 'The control' },
    'A **control** is the same data with the effect removed. Drawing the random numbers in a fixed order (market, then noise, then shocks) and multiplying the shocks by a `strength` parameter means strength 0 gives exactly the same market and noise with no drift. A correct pipeline must find nothing there. If it finds an edge in the control, the code has a bug.',

    { h: 'The signal and its timing' },
    'The signal at the end of month t is the compounded return of months t − 11 to t − 1: `np.prod(1 + R[t − 11:t], axis=0) − 1`. Python slices stop before the end index, so `R[t − 11:t]` holds 11 months ending at t − 1. Rows before enough history exist are `nan`, "not a number", and are skipped.',
    {
      code: `import numpy as np

R = np.arange(1, 16, dtype=float).reshape(15, 1) / 100    # month t earns (t + 1)%
t = 13
window = R[t - 11:t]
print(len(window), window[0, 0], window[-1, 0], R[t + 1, 0])`,
      out: `11 0.03 0.13 0.15`,
    },
    'The window holds months 2 to 12 (returns 3% to 13%), and the signal at month 13 is scored on month 14. A slice that ran to `t + 2` would include the scored month itself. That is lookahead, and on noisy data it produces large spreads that no one could earn, in the control as much as in the real universe.',
    { sub: 'Two cheap lookahead tests' },
    'Change the return of month t and check that the signal at t does not move (the skip works). Change month t + 1 and check again (no future data). Write these tests for every feature.',

    { h: 'Quantiles and the IC' },
    'For each usable month, rank the signal with a double `argsort`, form groups with `rank × q // n`, and average the next month\'s returns in each group. Each row of the result is one month; the column means form the staircase, and the last column minus the first is the spread series. The **rank IC** of each month is the correlation between the ranks of the signal and the ranks of the next month\'s returns. Ranks make the IC independent of the signal\'s scale.',

    { h: 'Weights, turnover and costs' },
    { sub: 'Long-short weights' },
    'With n stocks and q groups, k = n // q. Put +1/k on the k highest signals and −1/k on the k lowest. Each row is then 100% long and 100% short: gross exposure 2.',
    { sub: 'Lining up and charging costs' },
    'The weights set at the end of month t earn the returns of month t + 1, so the gross return series is `(W[:-1] * R[1:]).sum(axis=1)`. The trade at each rebalance is `Σ|W[t] − W[t − 1]|`, with all-zero weights before the start: building the book trades its full gross, and flipping a name from long to short trades twice its weight.',
    {
      code: `import numpy as np

W = np.array([[0.0, 0.0, 0.0, 0.0], [0.5, 0.5, -0.5, -0.5], [0.5, -0.5, 0.5, -0.5]])
print(np.abs(np.diff(W, axis=0, prepend=0)).sum(axis=1).tolist())`,
      out: `[0.0, 2.0, 2.0]`,
    },
    '`prepend=0` adds a row of zeros before the first row, so the first difference is the build of the book. Net return is gross minus cost per dollar times this trade. Momentum ranks change slowly, so each month replaces only part of the book, yet at 0.2% a dollar a turnover near 1 a month still costs over 2% a year.',

    { h: 'Reading the verdict' },
    'Report the mean IC with its t, the staircase, the annualised net Sharpe (monthly mean ÷ standard deviation × √12) and the same numbers for the control. A clean result on made-up data shows the code is correct, not that real momentum pays as much.',
    'On real data, more work follows. Regress the spread on published factors: you will find the momentum factor, which is cheaply available in funds. Count the variants you tried. Look at the worst year: momentum crashes in sharp rebounds, and position size must survive one. Check costs at your size, including borrow on the shorts, and a universe free of survivorship. Plot the IC by year; published factors tend to fade. None of this says momentum will or will not pay in future; it says how to find out honestly.',
  ],
}
