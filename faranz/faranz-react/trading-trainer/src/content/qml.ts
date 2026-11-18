import type { Module } from '../types'

export const qml: Module = {
  id: 'qml',
  title: 'Machine learning for trading',
  summary:
    'Why markets are a hard place for machine learning, how to frame a forecast without leaking the future, linear models with regularisation, trees and ensembles, validation that respects time, turning a forecast into positions, and the ways it all fails, with every model written in NumPy.',
  lessons: [
    {
      id: 'qml-why',
      title: 'Why finance is hard for machine learning',
      summary: 'Low signal to noise, few independent samples and a target that moves: what a realistic forecast looks like.',
      widget: 'qml-snr',
      text: [
        "Machine learning finds patterns that predict a target from features. It works best when the pattern is strong, the data is plentiful and the world stays the same. Markets fail all three. The quant module showed that daily returns are close to a random walk; a model can only find what is left over, and what is left over is small.",
        "**Low signal to noise.** If a feature has correlation ρ with the next return, a straight-line forecast explains `R² = ρ²` of the variance. A correlation of 0.05, which would be a good daily signal, explains 0.25%. For two normal variables with correlation ρ, the forecast gets the sign right with probability `1/2 + arcsin(ρ)/π`: 51.6% at ρ = 0.05. In image recognition a model is right 95% of the time; here 52% may be the best there is.",
        "**Few independent samples.** Ten years of daily data is 2,520 rows, not millions. The standard error of a measured correlation is about `1/√n`, so with n = 2,520 anything inside ±0.04 is noise. Labels that overlap make it worse: a 20-day forward return measured every day shares 19 days with its neighbour, so 2,520 rows hold only about 126 independent 20-day outcomes.",
        "**A target that moves.** The relationship between features and returns changes: rates regimes, new market structure, and other traders who find the same pattern and trade it away. A cat stays a cat after you label it; a pattern in prices weakens when people act on it. Data from 2005 may describe a market that no longer exists.",
        "This sets the scale. Gu, Kelly and Xiu (published in the Review of Financial Studies in 2020) forecast the monthly returns of nearly 30,000 US stocks from 1957 to 2016 with over 900 predictors. Their best models, neural networks and trees, reached an out-of-sample R² of about 0.3% to 0.4% a month in the working paper's main table, and they called that a strong result. Expect numbers like these, and treat anything far better with suspicion. In practice the models are fitted with scikit-learn, XGBoost, LightGBM or PyTorch; in this module you write them in NumPy to see what they do.",
      ],
      rules: [
        'R² of a single feature = ρ². ρ = 0.05 explains 0.25%.',
        'Sign accuracy for normal data = 1/2 + arcsin(ρ)/π. Good is 51% to 53%.',
        'Noise band of a correlation ≈ ±2/√n, with n the number of independent samples.',
        'Overlapping h-period labels: about n/h independent outcomes.',
        'The target moves: other traders and new regimes change the relationship.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'qml-why-1',
          ask: "A feature has a correlation of 0.05 with the next day's return. What share of the variance of daily returns can a straight-line forecast from it explain? Give a percentage, for example 25%.",
          answer: 0.0025,
          tol: 0.0001,
          check: '0.05 ** 2',
          why: "R² = ρ² = 0.0025, a quarter of one percent. The other 99.75% of each day's move is noise as far as the model is concerned, which is why a good daily model still looks useless on a scatter plot.",
        },
        {
          kind: 'number',
          id: 'qml-why-2',
          ask: 'Feature and next return are normal with correlation 0.1. Using `1/2 + arcsin(ρ)/π`, how often does the forecast get the sign of the next return right? Give a percentage to one decimal place, for example 50.0%.',
          answer: 0.532,
          tol: 0.0006,
          check: '0.5 + math.asin(0.1) / math.pi',
          hint: 'arcsin(0.1) is about 0.1002 radians.',
          why: 'About 53.2%. A correlation of 0.1 would be an unusually strong daily signal, and it still loses on almost half the days. Judge a model on how much it makes over many days, not on how often it is right.',
        },
        {
          kind: 'number',
          id: 'qml-why-3',
          ask: 'A true daily correlation of 0.03 gives a t statistic of about ρ × √n. How many independent daily observations do you need for t = 2? Give a whole number of days.',
          answer: 4444,
          tol: 50,
          check: '(2 / 0.03) ** 2',
          why: '√n = 2 ÷ 0.03 ≈ 66.7, so n ≈ 4,444 days, about 17.6 years. By the time you have enough data to be sure of a weak signal, the market that produced it may have changed.',
        },
        {
          kind: 'number',
          id: 'qml-why-4',
          ask: 'You label each of 2,520 days with the return over the next 20 days. Roughly how many non-overlapping 20-day outcomes does the data contain?',
          answer: 126,
          tol: 1,
          check: '2520 / 20',
          why: '2,520 ÷ 20 = 126. Each row shares 19 of its 20 days with the next one, so the rows are far from independent. Statistics that count 2,520 samples overstate the evidence.',
        },
        {
          kind: 'output',
          id: 'qml-why-5',
          ask: 'The noise band for a correlation measured on 400 days, and the sign accuracy implied by ρ = 0.05. What does this print?',
          code: `import numpy as np

n, rho = 400, 0.05
band = 2 / np.sqrt(n)
hit = 0.5 + np.arcsin(rho) / np.pi
print(round(band, 2), round(hit, 3))`,
          answer: '0.1 0.516',
          why: 'The band is ±0.10, twice the size of the correlation you hope to find, so 400 days cannot tell a real ρ of 0.05 from zero. The hit rate it implies is 51.6%.',
        },
        {
          kind: 'choice',
          id: 'qml-why-6',
          ask: 'In the figure, set the true correlation to 0.05 and the sample to 250 days. Press **New sample** several times. What do you see?',
          options: [
            'The measured correlation stays close to 0.05 each time',
            'The measured correlation jumps around, sometimes below zero, because the noise band is about ±0.13',
            'The hit rate is always above 51.6%',
            'The scatter shows a clear upward slope',
          ],
          answer: 1,
          why: 'With 250 points the standard error of a correlation is about 0.063, so a true 0.05 is often measured as negative and sometimes as 0.15. One year of data cannot tell you which features matter.',
        },
        {
          kind: 'choice',
          id: 'qml-why-7',
          ask: 'Gu, Kelly and Xiu report a monthly out-of-sample R² of about 0.4% for their best stock return models. What does this say?',
          options: [
            'The models are useless: 0.4% is too small to matter',
            'The models explain 0.4% of the month-to-month variation in single stock returns, which is small but, spread over thousands of stocks and many months, can be worth trading before costs',
            'The models are right 0.4% more often than chance',
            'The figure must be in-sample, since out-of-sample R² is always negative',
          ],
          answer: 1,
          why: 'Tiny R² is normal for returns. Its value comes from breadth: many stocks, every month. Whether it survives costs is a separate question, and portfolios built from such forecasts often lean on small, costly stocks.',
        },
        {
          kind: 'choice',
          id: 'qml-why-8',
          ask: 'A model learned on 2010 to 2019 that low-volatility stocks drift up after quiet weeks. In 2022 the relationship reverses. Which feature of financial data is this?',
          options: [
            'Low signal to noise',
            'Non-stationarity: the relationship between features and returns changes over time',
            'Overlapping labels',
            'A coding bug',
          ],
          answer: 1,
          why: 'Markets change: rates, participants and the trades others run. A model is a summary of the past. It can only help to the extent that the future resembles the data it was fitted on, and nothing guarantees that.',
        },
        {
          kind: 'bug',
          id: 'qml-why-9',
          ask: 'This should make a feature `x` and a return `y` with correlation `rho`. With rho = 0.5 the measured correlation comes out near 0.55, not 0.5.',
          code: `import numpy as np

def correlated(rho, n, seed):
    rng = np.random.default_rng(seed)
    x = rng.normal(0, 1, n)
    e = rng.normal(0, 1, n)
    y = rho * x + (1 - rho ** 2) * e
    return x, y`,
          line: 7,
          fix: '    y = rho * x + np.sqrt(1 - rho ** 2) * e',
          why: 'The noise must have variance 1 − ρ² so that y has variance 1 and correlation ρ with x. Multiplying by 1 − ρ² instead of its square root gives too little noise and a stronger correlation than intended, so a test built on it would flatter every model.',
        },
        {
          kind: 'write',
          id: 'qml-why-10',
          numpy: true,
          ask: 'Write `hit_rate(rho, n, seed)`: draw `x` and `e` as standard normals of length n (in that order) with `np.random.default_rng(seed)`, set `y = rho·x + √(1 − rho²)·e`, and return the share of rows where `x` and `y` have the same sign.',
          starter: `import numpy as np

def hit_rate(rho, n, seed):
    rng = np.random.default_rng(seed)
    pass`,
          solution: `import numpy as np

def hit_rate(rho, n, seed):
    rng = np.random.default_rng(seed)
    x = rng.normal(0, 1, n)
    e = rng.normal(0, 1, n)
    y = rho * x + np.sqrt(1 - rho ** 2) * e
    return float((np.sign(x) == np.sign(y)).mean())`,
          tests: `out = hit_rate(0.1, 1000, 0)
assert out is not None, "the function returns nothing yet"
assert 0 <= out <= 1, f"a share must be between 0 and 1, got {out}"
assert hit_rate(1.0, 1000, 0) == 1.0, "with rho = 1, y equals x and every sign matches"
big = hit_rate(0.1, 400000, 1)
theory = 0.5 + np.arcsin(0.1) / np.pi
assert abs(big - theory) < 0.004, f"on many rows the hit rate should be close to 1/2 + arcsin(rho)/pi = {theory:.4f}, got {big:.4f}"
assert abs(hit_rate(0.0, 400000, 2) - 0.5) < 0.004, "with no correlation, the sign is a coin flip"`,
          why: 'The simulation confirms the formula and shows how slowly the hit rate rises with ρ. Running it with a small n, say 250, and different seeds shows how much the measured hit rate wanders around the true one.',
        },
        {
          kind: 'design',
          id: 'qml-why-11',
          ask: 'A friend shows you a model that predicts the daily direction of SPY with 58% accuracy in a backtest over the last three years. Before believing it, what do you ask?',
          checklist: [
            { point: 'How the accuracy was measured: on data the model never saw, in time order', why: 'In-sample or shuffled accuracy says little; only a forward test counts.' },
            { point: 'Whether any feature uses information from the day being predicted or later', why: 'A hit rate far above 53% on daily direction is more often a leak than an edge.' },
            { point: 'How many models, features and settings were tried before this one', why: 'The best of many noise models shows a high hit rate by luck.' },
            { point: "What a simple baseline scores: always up, or yesterday's direction", why: 'SPY rose on a little over half of days in many periods; 53% may come free.' },
            { point: 'The noise band: about ±2/√n on 750 days is ±3.7 points of hit rate', why: 'Three years is a short sample for a daily model.' },
            { point: 'Profit after costs, not accuracy', why: 'Being right on small days and wrong on big ones loses money.' },
          ],
          why: 'A daily direction model with a real, stable 58% hit rate would be extraordinary. The cheap explanations, a leak, a search over many models or a lucky period, are far more likely, and each can be checked.',
        },
      ],
    },
    {
      id: 'qml-framing',
      title: 'Framing the problem',
      summary: 'Features known at t, labels from after t, the horizon, classification or regression, and the leaks hidden in labels.',
      text: [
        'A supervised model learns from rows. Each row has **features**, numbers known at time t, and a **label**, the thing to predict, which comes from after t. For daily data: the features are computed from closes up to day t, and the label is the return from the close of t to the close of t + h, the **horizon**. Every feature must pass the lookahead test from the backtest module: could you have computed it at the close of t?',
        { code: `import numpy as np

p = np.array([100.0, 101.0, 99.0, 102.0, 103.0, 101.0])
r = np.log(p[1:] / p[:-1])       # r[i]: from close i to close i+1
X = r[:-1]                       # feature at t: the return that ended at t
y = r[1:]                        # label at t: the next return` },
        '**The horizon.** A 1-day label is mostly noise. A 20-day label carries more signal per row but the rows overlap, so there are fewer independent outcomes. Choose the horizon you would trade at, and measure evidence in independent periods.',
        "**Regression or classification.** Regression predicts the return itself. Classification predicts a class, such as up or down. A class label throws away size: +0.01% and +4% are both 'up', and a model that is right on many small days and wrong on a few big ones looks accurate and loses money. Two fixes are common: a **dead zone**, labelling small moves 0, and the **triple-barrier** label from López de Prado's book Advances in Financial Machine Learning (2018): from each start, label +1 if price hits a profit target first, −1 if it hits a stop first, and 0 (or the sign of the return) if a time limit comes first. It matches the trade you would actually run.",
        '**Leaks in features and labels.** The usual ones: a label that includes the day the features were measured; a feature z-scored with the mean and standard deviation of the whole sample, including the future; a centred moving average; in pandas, `shift(-1)` used on a feature instead of the label. Each one makes a model look skilled in the backtest and helpless live. Scaling labels by trailing volatility, `y / σ(past 20 days)`, also helps: calm and wild periods then count equally in the fit.',
      ],
      rules: [
        'Features at t use data up to the close of t. The label starts after t.',
        'Pair X[:-1] with r[1:]: each feature with the return that follows it.',
        'Overlapping h-day labels share h − 1 days with each neighbour.',
        'Up/down labels throw away size. Use a dead zone, triple barrier or regression.',
        'Fit every scaler on past data only, never on the whole sample.',
      ],
      questions: [
        {
          kind: 'output',
          id: 'qml-framing-1',
          ask: 'Daily returns in percent, paired as feature and label. What does this print?',
          code: `import numpy as np

r = np.array([1.0, -2.0, 0.5, 3.0])
X = r[:-1]
y = r[1:]
print(list(zip(X.tolist(), y.tolist())))`,
          answer: '[(1.0, -2.0), (-2.0, 0.5), (0.5, 3.0)]',
          why: 'Each feature, the return that ended at t, is paired with the return that came next. The last return has no label after it and the first has no feature before it, so 4 returns give 3 rows.',
        },
        {
          kind: 'bug',
          id: 'qml-framing-2',
          ask: 'This builds rows of (5-day past return, next-day return). The model built on it is right 70% of the time in the backtest. Which line leaks?',
          code: `import numpy as np

def rows(r):
    X, y = [], []
    for t in range(5, len(r) - 1):
        X.append(r[t - 4:t + 1].sum())
        y.append(r[t])
    return np.array(X), np.array(y)`,
          line: 7,
          fix: '        y.append(r[t + 1])',
          why: 'The feature sums r[t − 4] to r[t], so it already contains r[t]. Using r[t] as the label means the model predicts a number it has been given. The label must be the return after t, r[t + 1].',
        },
        {
          kind: 'bug',
          id: 'qml-framing-3',
          ask: 'This z-scores a feature against its recent past for a backtest. The backtest is good and paper trading is not. Which line looks into the future?',
          code: `import numpy as np

def zscore_feature(x, window):
    x = np.asarray(x, dtype=float)
    z = np.full(len(x), np.nan)
    for t in range(window, len(x)):
        past = x[:]
        z[t] = (x[t] - past.mean()) / past.std()
    return z`,
          line: 7,
          fix: '        past = x[t - window:t]',
          why: 'The whole series includes every future value, so early z-scores know where the series will go. The window must end at t: `x[t − window:t]` uses only the past.',
        },
        {
          kind: 'number',
          id: 'qml-framing-4',
          ask: 'A stock closes at $100 today. Five trading days later it closes at $104. What is the 5-day forward log return label for today? Give 4 decimal places.',
          answer: 0.0392,
          tol: 0.0001,
          check: 'math.log(104 / 100)',
          why: "ln(1.04) ≈ 0.0392. The label belongs to today's row, but it is only known five days later. In a walk-forward test, a row can only be used for training once its label has fully happened.",
        },
        {
          kind: 'number',
          id: 'qml-framing-5',
          ask: "You label every day with the return over the next 10 trading days. How many days does today's label share with tomorrow's?",
          answer: 9,
          tol: 0,
          check: '10 - 1',
          why: 'Today covers days 1 to 10 ahead, tomorrow days 2 to 11: nine days in common. Neighbouring rows are near-copies, which matters for validation and for counting evidence.',
        },
        {
          kind: 'choice',
          id: 'qml-framing-6',
          ask: 'A classifier predicts up or down for the next day and is right 56% of the time out of sample. Its trades lose money before costs. What is the most likely reason?',
          options: [
            'The accuracy is too low to make money',
            'It is right mostly on small moves and wrong on the large ones, so the losses outweigh the wins',
            'Classifiers cannot be used for trading',
            'The test set was too large',
          ],
          answer: 1,
          why: 'Profit is the sum of position × return, and an up/down label gives a 0.1% day and a 3% day the same weight. Train on returns (regression) or on labels that carry size, and judge the model by its P&L, not its accuracy.',
        },
        {
          kind: 'output',
          id: 'qml-framing-7',
          ask: 'Labels with a dead zone of ±0.5%. What does this print?',
          code: `import numpy as np

r = np.array([0.012, -0.003, 0.004, -0.009, 0.0005, 0.006])
lab = np.where(r > 0.005, 1, np.where(r < -0.005, -1, 0))
print(lab.tolist())`,
          answer: '[1, 0, 0, -1, 0, 1]',
          why: 'Moves inside ±0.5% become 0: the model is not asked to call days that are mostly noise and would not cover costs. Choose the width of the dead zone before looking at results, often from costs or volatility.',
        },
        {
          kind: 'write',
          id: 'qml-framing-8',
          numpy: true,
          ask: 'Write `make_rows(prices, lookback, horizon)`. With `lp = log(prices)`, the feature at t is `lp[t] − lp[t − lookback]` and the label is `lp[t + horizon] − lp[t]`. Use every t that has both, in order, and return `(X, y)` as NumPy arrays.',
          starter: `import numpy as np

def make_rows(prices, lookback, horizon):
    lp = np.log(np.asarray(prices, dtype=float))
    pass`,
          solution: `import numpy as np

def make_rows(prices, lookback, horizon):
    lp = np.log(np.asarray(prices, dtype=float))
    t = np.arange(lookback, len(lp) - horizon)
    return lp[t] - lp[t - lookback], lp[t + horizon] - lp[t]`,
          tests: `out = make_rows([100, 110, 121, 133.1, 146.41], 1, 1)
assert out is not None, "the function returns nothing yet"
X, y = out
assert len(X) == 3 and len(y) == 3, f"5 prices with lookback 1 and horizon 1 give 3 rows, got {len(X)}"
assert np.allclose(X, np.log(1.1)) and np.allclose(y, np.log(1.1)), "each step is +10%: features and labels should all be ln(1.1)"
p = np.array([100.0, 100, 100, 100, 200, 100, 100])
X, y = make_rows(p, 2, 1)
assert len(X) == 4, f"7 prices with lookback 2 and horizon 1 give t = 2..5, 4 rows, got {len(X)}"
assert X[0] == 0 and y[1] > 0 and X[2] > 0, "feature at t = 2 is flat; the label at t = 3 is the jump to 200; the feature at t = 4 has seen the jump"
assert y[2] < 0, "the label at t = 4 is the fall from 200 back to 100"
X, y = make_rows(np.exp(np.arange(30.0)), 5, 3)
assert np.allclose(X, 5) and np.allclose(y, 3), "log prices rising by 1 a day: features are 5, labels 3"`,
          why: 'Writing the index once, `t`, and deriving both columns from it keeps the feature and the label lined up. Most leaks come from building the two in separate places with separate shifts.',
        },
        {
          kind: 'write',
          id: 'qml-framing-9',
          ask: 'Write `triple_barrier(prices, t, up, down, max_h)`: starting at `prices[t]`, step forward one bar at a time for up to `max_h` bars. Return 1 if the return from the start first reaches `+up` or more, −1 if it first reaches `−down` or less, and 0 if neither happens within `max_h` bars (or the data ends).',
          starter: `def triple_barrier(prices, t, up, down, max_h):
    p0 = prices[t]
    pass`,
          solution: `def triple_barrier(prices, t, up, down, max_h):
    p0 = prices[t]
    for k in range(1, max_h + 1):
        if t + k >= len(prices):
            break
        r = prices[t + k] / p0 - 1
        if r >= up:
            return 1
        if r <= -down:
            return -1
    return 0`,
          tests: `p = [100, 101, 99, 103, 96]
out = triple_barrier(p, 0, 0.02, 0.02, 4)
assert out is not None, "the function returns nothing yet"
assert out == 1, f"from 100, the path reaches 103 (+3%) before 96 (-4%): label 1, got {out}"
assert triple_barrier(p, 0, 0.05, 0.03, 4) == -1, "with a 5% target and a 3% stop, 96 hits the stop first"
assert triple_barrier(p, 0, 0.02, 0.02, 2) == 0, "within 2 bars neither barrier is touched: 0"
assert triple_barrier(p, 3, 0.01, 0.10, 5) == 0, "from 103 only one bar is left and it falls 6.8%, short of the 10% stop: 0"
assert triple_barrier([100, 98], 0, 0.05, 0.02, 3) == -1, "a move of exactly -2% touches the stop"`,
          why: 'The label now says what a trade with that target, stop and time limit would have done. Set the barriers from volatility (for example a multiple of the daily standard deviation), so they mean the same thing in calm and wild markets.',
        },
        {
          kind: 'choice',
          id: 'qml-framing-10',
          ask: 'Why divide a forward return label by the trailing 20-day volatility before fitting?',
          options: [
            'It makes the model more accurate on every day',
            'So that a few days in a violent market do not dominate the fit, and calm and wild periods count about equally',
            'Because volatility is a leak and must be removed',
            'Because regression requires labels between −1 and 1',
          ],
          answer: 1,
          why: 'Squared error weighs big numbers heavily. Without scaling, the fit is mostly about March 2020 and other crises. Trailing volatility uses only the past, so the scaled label is still clean; dividing by future volatility would be a leak.',
        },
        {
          kind: 'design',
          id: 'qml-framing-11',
          ask: 'You want a model to help with swing trades in QQQ held for about a week. Write down the framing before any code.',
          checklist: [
            { point: 'The decision time: features computed at the close, trade at the next open or close', why: 'The timestamp of each feature defines what is allowed.' },
            { point: 'The label: 5-day forward return (or a triple barrier with your real stop and target)', why: 'Match the label to the trade you would place.' },
            { point: 'Regression on returns, or classes with a dead zone', why: 'Plain up/down labels ignore size and reward the wrong model.' },
            { point: 'Each feature written with its exact window, all ending at t', why: 'Writing them down is how you find a centred window or a shift in the wrong direction.' },
            { point: 'Label scaling by trailing volatility', why: 'Stops crisis weeks dominating the fit.' },
            { point: 'The count of independent outcomes: about days ÷ 5', why: 'Sets how much evidence a test can give.' },
            { point: 'Costs per trade and a baseline to beat, such as holding QQQ', why: 'A model must beat what you could do with no model.' },
          ],
          why: 'Most of the damage in financial machine learning is done before a model is chosen: a label that includes the feature day, a scaler fitted on all the data, a horizon that does not match the trade.',
        },
      ],
    },
    {
      id: 'qml-linear',
      title: 'Linear models first',
      summary: 'Least squares, ridge and lasso, and why regularisation matters more in markets than almost anywhere.',
      widget: 'qml-ridge',
      text: [
        'Start with a linear model: the forecast is `b0 + X·b`. **Least squares (OLS)** picks b to minimise the squared error on the training data: `b = (XᵀX)⁻¹ Xᵀy`. It is fast and transparent, and with weak signals and many features it fits noise. With p features of pure noise and n rows, the in-sample R² is about `p/n` even though the true R² is zero: 50 features on 250 days give about 20%, and out of sample the forecast is worse than predicting zero.',
        '**Ridge** adds a penalty λ × Σb² to the squared error, which pulls every coefficient towards zero: `b = (XᵀX + λI)⁻¹ Xᵀy`. For a single feature this is `Σxy ÷ (Σx² + λ)`: the OLS slope shrunk. **Lasso** uses λ × Σ|b| instead, and sets some coefficients exactly to zero, so it also selects features. For one standardised feature the lasso coefficient is the **soft threshold** of the OLS slope z: `sign(z) × max(|z| − λ, 0)`.',
        { code: `import numpy as np

def ridge(X, y, lam):
    Xc, yc = X - X.mean(0), y - y.mean()
    b = np.linalg.solve(Xc.T @ Xc + lam * np.eye(X.shape[1]), Xc.T @ yc)
    return y.mean() - X.mean(0) @ b, b` },
        "Regularisation matters most where signal is weak and data is scarce, which describes markets. Shrinking towards zero says 'assume no effect unless the data insists', which is the right prior when most features are noise. In Gu, Kelly and Xiu's study, OLS on all 920 predictors had an out-of-sample R² of −3.46% a month, while penalised and reduced models were positive. Standardise features before penalising (each with mean 0 and standard deviation 1, from training data only), or the penalty falls unevenly. Do not penalise the intercept.",
        'Choose λ by validation in time order: fit on earlier data, score on later data, pick the λ that scores best, then test once on data after that. Ridge spreads weight across correlated features; lasso tends to pick one of them, and which one can flip from sample to sample. **Elastic net** mixes the two penalties. In practice: `sklearn.linear_model.Ridge`, `Lasso`, `ElasticNet`, and `RidgeCV` (whose default cross-validation is not time-aware: pass it a time-series split).',
      ],
      rules: [
        'OLS on p noise features and n rows: in-sample R² ≈ p/n, real R² 0.',
        'Ridge: b = (XᵀX + λI)⁻¹Xᵀy. One feature: Σxy ÷ (Σx² + λ).',
        'Lasso: soft threshold, sign(z)·max(|z| − λ, 0). Some coefficients become exactly 0.',
        'Standardise with training statistics; do not penalise the intercept.',
        'Pick λ on later data than you fit on, then test once on later data still.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'qml-linear-1',
          ask: 'You regress 250 daily returns on 50 features that are pure noise. Using R² ≈ p/n, about what in-sample R² do you expect? Give a percentage, for example 25%.',
          answer: 0.2,
          tol: 0.005,
          check: '50 / 250',
          why: 'About 20%, from nothing. Each extra coefficient fits a little of the noise. A daily model with an in-sample R² like this is a warning, not a result; out of sample it will do worse than a forecast of zero.',
        },
        {
          kind: 'output',
          id: 'qml-linear-2',
          ask: 'OLS and ridge for one feature with no intercept. What does this print?',
          code: `import numpy as np

x = np.array([1.0, -1.0, 2.0, -2.0])
y = np.array([0.5, -0.5, 1.5, -0.5])
ols = (x @ y) / (x @ x)
ridge = (x @ y) / (x @ x + 10)
print(round(ols, 2), round(ridge, 2))`,
          answer: '0.5 0.25',
          why: 'Σxy = 5 and Σx² = 10, so OLS gives 0.5. Adding λ = 10 to the denominator halves it to 0.25. The larger λ is relative to Σx², the closer the slope is pulled to zero.',
        },
        {
          kind: 'number',
          id: 'qml-linear-3',
          ask: 'For one feature, Σxy = 6 and Σx² = 10. What is the ridge coefficient with λ = 20?',
          answer: 0.2,
          tol: 0.001,
          check: '6 / (10 + 20)',
          why: '6 ÷ 30 = 0.2, against an OLS slope of 0.6. With only 10 units of information in Σx², a penalty of 20 dominates: the data is too thin to push the coefficient far from zero.',
        },
        {
          kind: 'number',
          id: 'qml-linear-4',
          ask: 'Lasso on one standardised feature: the OLS slope is z = 0.3 and λ = 0.2. What is the lasso coefficient, sign(z) × max(|z| − λ, 0)?',
          answer: 0.1,
          tol: 0.001,
          check: 'math.copysign(max(abs(0.3) - 0.2, 0), 0.3)',
          why: '0.3 − 0.2 = 0.1. Had the slope been 0.15, the lasso coefficient would be exactly 0: the feature is dropped. Ridge never drops a feature; it only shrinks it.',
        },
        {
          kind: 'bug',
          id: 'qml-linear-5',
          ask: 'This ridge fit gives strange coefficients that do not shrink sensibly as λ grows. Which line is wrong?',
          code: `import numpy as np

def ridge(X, y, lam):
    Xc = X - X.mean(axis=0)
    yc = y - y.mean()
    b = np.linalg.solve(Xc.T @ Xc + lam, Xc.T @ yc)
    return y.mean() - X.mean(axis=0) @ b, b`,
          line: 6,
          fix: '    b = np.linalg.solve(Xc.T @ Xc + lam * np.eye(X.shape[1]), Xc.T @ yc)',
          why: 'Adding a number to a NumPy matrix adds it to every element, including the off-diagonal ones. The penalty belongs on the diagonal only, λI, which is what shrinks each coefficient towards zero.',
        },
        {
          kind: 'choice',
          id: 'qml-linear-6',
          ask: 'In the figure, start at the smallest λ and slide it up. How do the in-sample and out-of-sample R² move?',
          options: [
            'Both rise together',
            'In-sample R² falls steadily; out-of-sample R² rises from below zero to a peak, then falls back towards zero as λ grows very large',
            'Both fall together',
            'Out-of-sample R² is highest at the smallest λ',
          ],
          answer: 1,
          why: 'With little penalty the model fits noise: high in-sample R², negative out of sample. More penalty gives up in-sample fit and gains out of sample, until it shrinks the real effects away too. The peak is what validation tries to find.',
        },
        {
          kind: 'choice',
          id: 'qml-linear-7',
          ask: 'Two features are near copies: a 20-day and a 21-day momentum. What do ridge and lasso do with them?',
          options: [
            'Both drop one of them',
            'Ridge gives both similar weights; lasso tends to keep one and zero the other, and which one can change from sample to sample',
            'Ridge drops both; lasso keeps both',
            'Neither can be fitted when features are correlated',
          ],
          answer: 1,
          why: 'Ridge spreads weight across correlated features, which makes it stable. Lasso picks one, which looks like a finding ("21 days matters") but is often a coin toss between near-identical features. Do not read much into which one lasso keeps.',
        },
        {
          kind: 'choice',
          id: 'qml-linear-8',
          ask: "One feature is a stock's price in dollars (values around 200), the other a z-score (around ±1). You fit ridge without standardising. What happens?",
          options: [
            'Nothing: ridge is unaffected by units',
            'The penalty barely touches the large-scale feature and crushes the small-scale one, so the result depends on units, not information',
            'Ridge will refuse to fit',
            'Both coefficients are shrunk by the same proportion',
          ],
          answer: 1,
          why: 'A feature with large values needs only a tiny coefficient, which the penalty hardly charges for. Standardise each feature with training statistics so that λ treats them alike. Also, a price level is rarely a sensible feature: it is not stationary.',
        },
        {
          kind: 'write',
          id: 'qml-linear-9',
          numpy: true,
          ask: 'Write `ridge_fit(X, y, lam)` returning `(b0, b)`. Centre X and y with their means, solve `(XcᵀXc + λI) b = Xcᵀyc`, and set `b0 = mean(y) − mean(X)·b`, so the intercept is not penalised.',
          starter: `import numpy as np

def ridge_fit(X, y, lam):
    X = np.asarray(X, dtype=float)
    y = np.asarray(y, dtype=float)
    pass`,
          solution: `import numpy as np

def ridge_fit(X, y, lam):
    X = np.asarray(X, dtype=float)
    y = np.asarray(y, dtype=float)
    mx, my = X.mean(axis=0), y.mean()
    Xc, yc = X - mx, y - my
    b = np.linalg.solve(Xc.T @ Xc + lam * np.eye(X.shape[1]), Xc.T @ yc)
    return float(my - mx @ b), b`,
          tests: `rng = np.random.default_rng(0)
X = rng.normal(0, 1, (200, 3))
y = 0.5 + X @ np.array([1.0, -2.0, 0.0]) + rng.normal(0, 0.1, 200)
out = ridge_fit(X, y, 0.0)
assert out is not None, "the function returns nothing yet"
b0, b = out
ols = np.linalg.lstsq(np.c_[np.ones(200), X], y, rcond=None)[0]
assert abs(b0 - ols[0]) < 1e-8 and np.allclose(b, ols[1:]), "with lam = 0 the answer must match ordinary least squares with an intercept"
b0_big, b_big = ridge_fit(X, y, 1e6)
assert np.all(np.abs(b_big) < 0.01), "a huge lam shrinks every coefficient towards 0"
assert abs(b0_big - y.mean()) < 0.01, "the intercept is not penalised: with b near 0 it is the mean of y"
_, b50 = ridge_fit(X, y, 50.0)
assert np.linalg.norm(b50) < np.linalg.norm(ols[1:]), "ridge coefficients are smaller than the OLS ones"`,
          why: 'Centring removes the intercept from the penalised problem; it is recovered afterwards from the means. In a real pipeline you would also standardise X with training statistics before calling this.',
        },
        {
          kind: 'write',
          id: 'qml-linear-10',
          numpy: true,
          ask: 'Write `lasso_cd(X, y, lam, n_iter)` by coordinate descent, for X whose columns already have mean 0 and standard deviation 1 (`ddof=0`) and y with mean 0. Start from b = 0. In each of `n_iter` sweeps, for each j: compute `rho = mean(X[:, j] · (y − X·b + X[:, j]·b[j]))` and set `b[j] = sign(rho) × max(|rho| − lam, 0)`. Return b.',
          starter: `import numpy as np

def lasso_cd(X, y, lam, n_iter=100):
    X = np.asarray(X, dtype=float)
    y = np.asarray(y, dtype=float)
    b = np.zeros(X.shape[1])
    pass`,
          solution: `import numpy as np

def lasso_cd(X, y, lam, n_iter=100):
    X = np.asarray(X, dtype=float)
    y = np.asarray(y, dtype=float)
    b = np.zeros(X.shape[1])
    for _ in range(n_iter):
        for j in range(X.shape[1]):
            partial = y - X @ b + X[:, j] * b[j]
            rho = np.mean(X[:, j] * partial)
            b[j] = np.sign(rho) * max(abs(rho) - lam, 0.0)
    return b`,
          tests: `rng = np.random.default_rng(1)
X = rng.normal(0, 1, (500, 6))
X = (X - X.mean(0)) / X.std(0)
y = X @ np.array([0.5, 0, 0, -0.3, 0, 0]) + rng.normal(0, 0.5, 500)
y = y - y.mean()
out = lasso_cd(X, y, 0.0)
assert out is not None, "the function returns nothing yet"
ols = np.linalg.lstsq(X, y, rcond=None)[0]
assert np.allclose(out, ols, atol=1e-3), "with lam = 0 lasso is ordinary least squares"
assert np.all(lasso_cd(X, y, 10.0) == 0), "a lam above every |rho| sets all coefficients to exactly 0"
b = lasso_cd(X, y, 0.1)
assert b[0] > 0.3 and b[3] < -0.15, f"the two real effects survive a moderate lam, got {np.round(b, 3)}"
assert np.sum(b == 0) >= 3, f"most of the noise features should be exactly 0 at lam = 0.1, got {np.round(b, 3)}"`,
          why: 'Each update is the one-feature soft threshold applied to what the other features leave unexplained. The exact zeros are the point of lasso: it reports which features it has dropped. `sklearn.linear_model.Lasso` runs the same algorithm.',
        },
        {
          kind: 'design',
          id: 'qml-linear-11',
          ask: 'You have 12 years of daily data and 40 candidate features for a next-day SPY forecast. Describe how you fit a ridge model and choose λ without fooling yourself.',
          checklist: [
            { point: 'Split by time: fit years 1 to 8, validate years 9 to 10, hold out 11 to 12', why: 'λ must be chosen on data after the fit, and the final test on data after that.' },
            { point: "Standardise features with the fitting period's mean and standard deviation only", why: 'Statistics from the whole sample leak the future into every row.' },
            { point: 'A grid of λ on a log scale, from almost none to very large', why: 'The useful range spans orders of magnitude.' },
            { point: 'Score each λ by out-of-sample R² against a forecast of zero, and by net P&L', why: 'A negative R² means worse than no model.' },
            { point: 'Prefer a λ on a plateau, and lean to the larger side', why: 'A sharp peak is often noise; more shrinkage is the safer error.' },
            { point: 'Refit on years 1 to 10 with the chosen λ and test once on the holdout', why: 'Touching the holdout more than once turns it into validation.' },
          ],
          why: 'Ridge itself is two lines. The discipline is in the split, the scaling and touching the final test once.',
        },
      ],
    },
    {
      id: 'qml-trees',
      title: 'Trees and ensembles',
      summary: 'A decision stump, trees, bagging and boosting: what they add over a linear model and what they cost.',
      widget: 'qml-boost',
      text: [
        "A **decision stump** is the smallest tree: one feature, one threshold. Rows with the feature at or below the threshold get the mean label of that group; rows above get the other group's mean. Fitting it means trying every threshold and keeping the one with the lowest total squared error. A **tree** repeats the split inside each group, to a chosen depth. A deep tree can put every training row in its own leaf, which on returns is pure memorisation.",
        '**Bagging** (bootstrap aggregation) fits many deep trees, each on a **bootstrap sample** (n rows drawn with replacement), and averages them. Averaging B models, each with variance σ² and pairwise correlation ρ, gives variance `ρσ² + (1 − ρ)σ²/B`: more trees remove the second term, and only less correlated trees reduce the first. A **random forest** decorrelates its trees by letting each split consider only a random subset of features.',
        '**Boosting** works the other way: start from a constant forecast, fit a small tree (often a stump) to the **residuals**, the part of y still unexplained, add a fraction of it (the **learning rate**, for example 0.1), and repeat. Each round fixes some of what the earlier rounds missed. With enough rounds boosting fits the training data almost perfectly, noise included, so the number of rounds is chosen by validation in time order.',
        { code: `def boost(x, y, rounds, lr):
    pred = np.full(len(y), y.mean())
    for _ in range(rounds):
        t, lo, hi = best_stump(x, y - pred)      # fit the residuals
        pred += lr * np.where(x <= t, lo, hi)
    return pred` },
        'What trees buy: **non-linear effects and interactions** without you writing them, such as momentum that only works when volatility is low; no need to scale features; little harm from outliers in features. What they cost: they fit noise more readily than a linear model, need more data, have more settings to tune, and cannot extrapolate beyond the range of the training data. Bootstrapping rows with overlapping labels draws near-copies, which makes bagged trees more alike than they look. In practice: `sklearn.ensemble.RandomForestRegressor`, `HistGradientBoostingRegressor`, XGBoost and LightGBM. On financial data, fit a regularised linear model first; a tree ensemble has to beat it out of sample to earn its place.',
      ],
      rules: [
        'Stump: one threshold, two means, chosen to minimise squared error.',
        'Bagging: average trees fitted on bootstrap samples. Variance ρσ² + (1 − ρ)σ²/B.',
        'Random forest: random feature subsets decorrelate the trees.',
        'Boosting: fit small trees to residuals, add lr × each. Rounds chosen by time-ordered validation.',
        'Trees find interactions but overfit noise. Beat a ridge baseline out of sample first.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'qml-trees-1',
          ask: "Labels sorted by a feature are 1, 3, 6, 8, 10. A stump splits between 3 and 6 and predicts each side's mean. What is the total squared error after the split?",
          answer: 10,
          tol: 0.01,
          check: '(1-2)**2 + (3-2)**2 + (6-8)**2 + (8-8)**2 + (10-8)**2',
          why: 'Left mean 2, errors 1 + 1 = 2. Right mean 8, errors 4 + 0 + 4 = 8. Total 10, down from 53.2 with no split. A stump picks the threshold with the largest drop.',
        },
        {
          kind: 'output',
          id: 'qml-trees-2',
          ask: 'A brute-force stump search. What does this print?',
          code: `import numpy as np

x = np.array([1.0, 2.0, 3.0, 4.0, 5.0, 6.0])
y = np.array([0.1, 0.0, 0.2, 1.0, 1.1, 0.9])
best = None
for t in x[:-1]:
    lo, hi = y[x <= t], y[x > t]
    sse = ((lo - lo.mean()) ** 2).sum() + ((hi - hi.mean()) ** 2).sum()
    if best is None or sse < best[0]:
        best = (sse, t)
print(best[1])`,
          answer: '3.0',
          why: 'Splitting after x = 3 separates the low labels (around 0.1) from the high ones (around 1.0), leaving the smallest squared error. Each candidate threshold is a value of x, with the rows at or below it on the left.',
        },
        {
          kind: 'write',
          id: 'qml-trees-3',
          numpy: true,
          ask: 'Write `best_stump(x, y)`: try each distinct value t of x except the largest as a threshold, with left = rows where `x <= t`. Return `(t, left_mean, right_mean)` for the threshold with the smallest total squared error (the first one on ties).',
          starter: `import numpy as np

def best_stump(x, y):
    x = np.asarray(x, dtype=float)
    y = np.asarray(y, dtype=float)
    pass`,
          solution: `import numpy as np

def best_stump(x, y):
    x = np.asarray(x, dtype=float)
    y = np.asarray(y, dtype=float)
    best = None
    for t in np.unique(x)[:-1]:
        lo, hi = y[x <= t], y[x > t]
        sse = ((lo - lo.mean()) ** 2).sum() + ((hi - hi.mean()) ** 2).sum()
        if best is None or sse < best[0]:
            best = (sse, float(t), float(lo.mean()), float(hi.mean()))
    return best[1:]`,
          tests: `out = best_stump([1, 2, 3, 4, 5, 6], [0.1, 0.0, 0.2, 1.0, 1.1, 0.9])
assert out is not None, "the function returns nothing yet"
t, lo, hi = out
assert t == 3.0, f"the best split is after x = 3, got {t}"
assert abs(lo - 0.1) < 1e-9 and abs(hi - 1.0) < 1e-9, f"the side means are 0.1 and 1.0, got {lo}, {hi}"
t, lo, hi = best_stump([5, 1, 4, 2, 3], [9, 1, 9, 1, 1])
assert t == 3.0 and lo == 1.0 and hi == 9.0, "x need not be sorted: the split is between 3 and 4"
t, _, _ = best_stump([1, 1, 2, 2], [0, 0, 5, 5])
assert t == 1.0, "use distinct values: the only threshold that splits is 1"`,
          why: 'Every tree method is this search, repeated inside each leaf and over every feature. Libraries sort once and update the sums as the threshold moves, which makes it fast; the logic is the same.',
        },
        {
          kind: 'number',
          id: 'qml-trees-4',
          ask: 'You bag 100 trees. Each has forecast variance 1 and the trees are correlated at 0.5. Using ρσ² + (1 − ρ)σ²/B, what is the variance of the average?',
          answer: 0.505,
          tol: 0.001,
          check: '0.5 * 1 + (1 - 0.5) * 1 / 100',
          why: '0.5 + 0.005 = 0.505. A thousand trees would give 0.5005: past a point, more trees do nothing. Only making the trees less alike lowers the floor, which is what random feature subsets do.',
        },
        {
          kind: 'choice',
          id: 'qml-trees-5',
          ask: 'Why does a random forest let each split look at only a random subset of the features?',
          options: [
            'To make each tree faster to fit, with no effect on accuracy',
            'To make the trees less correlated, so averaging them removes more variance',
            'To stop the forest from ever using the best feature',
            'To make the trees deeper',
          ],
          answer: 1,
          why: 'If one feature is strong, every tree splits on it first and the trees end up alike. Hiding it from some splits forces variety, which lowers ρ in ρσ² + (1 − ρ)σ²/B.',
        },
        {
          kind: 'number',
          id: 'qml-trees-6',
          ask: "Boosting starts from a forecast of 0 for every row. The first stump says +2 for a row and the learning rate is 0.1. What is that row's forecast after one round?",
          answer: 0.2,
          tol: 0.001,
          check: '0 + 0.1 * 2',
          why: 'Each round adds only a tenth of what the stump suggests. Small steps make boosting less greedy and let later rounds correct earlier ones, at the price of needing more rounds.',
        },
        {
          kind: 'bug',
          id: 'qml-trees-7',
          ask: 'This boosting loop should fit each stump to what is still unexplained. The training error stops improving and then gets worse. Which line is wrong?',
          code: `import numpy as np

def boost(x, y, rounds, lr, best_stump):
    pred = np.full(len(y), y.mean())
    for _ in range(rounds):
        t, lo, hi = best_stump(x, y)
        pred += lr * np.where(x <= t, lo, hi)
    return pred`,
          line: 6,
          fix: '        t, lo, hi = best_stump(x, y - pred)',
          why: 'Fitted to y itself, every round finds the same stump and keeps adding it, so the forecast drifts away from y instead of closing the gap. Boosting fits the residual, y − pred.',
        },
        {
          kind: 'bug',
          id: 'qml-trees-8',
          ask: 'This should draw a bootstrap sample for bagging. Every tree in the bag comes out identical. Which line is wrong?',
          code: `import numpy as np

def bootstrap_rows(n, seed):
    rng = np.random.default_rng(seed)
    return rng.choice(n, size=n, replace=False)`,
          line: 5,
          fix: '    return rng.choice(n, size=n, replace=True)',
          why: 'Drawing n rows out of n without replacement returns every row once, only shuffled, so every tree sees the same data. A bootstrap draws with replacement: some rows appear twice, about a third not at all.',
        },
        {
          kind: 'choice',
          id: 'qml-trees-9',
          ask: 'You believe momentum predicts returns only when volatility is low. Which model can find this without you building a product feature such as momentum × low-volatility flag?',
          options: [
            'Ridge regression on momentum and volatility',
            'A tree, which can split on volatility and then on momentum inside the low-volatility branch',
            'Lasso, which will select the interaction',
            'None: interactions cannot be learned',
          ],
          answer: 1,
          why: 'A linear model adds effects; it only sees an interaction if you supply the product. Trees model interactions by their structure. That flexibility is also how they fit noise, so the gain must show out of sample.',
        },
        {
          kind: 'choice',
          id: 'qml-trees-10',
          ask: 'In the figure, use the noisy data and raise the number of boosting rounds from 1 to 300. What happens to the two errors?',
          options: [
            'Training and test error both keep falling',
            'Training error keeps falling; test error falls at first, then rises as the model fits noise',
            'Test error keeps falling; training error rises',
            'Nothing changes after the first round',
          ],
          answer: 1,
          why: 'Each round removes some training error, signal or noise alike. Once the signal is used up, later rounds fit noise and the test error turns up. On returns the signal runs out quickly, so pick the number of rounds on a later validation period and expect a small number.',
        },
        {
          kind: 'write',
          id: 'qml-trees-11',
          numpy: true,
          ask: 'Write `boost(x, y, rounds, lr)`: start with `pred` equal to the mean of y everywhere; in each round fit `best_stump(x, y − pred)` and add `lr × (left_mean where x <= t, else right_mean)`. Return `pred`. `best_stump` is given.',
          starter: `import numpy as np

def best_stump(x, y):
    best = None
    for t in np.unique(x)[:-1]:
        lo, hi = y[x <= t], y[x > t]
        sse = ((lo - lo.mean()) ** 2).sum() + ((hi - hi.mean()) ** 2).sum()
        if best is None or sse < best[0]:
            best = (sse, t, lo.mean(), hi.mean())
    return best[1:]

def boost(x, y, rounds, lr):
    x = np.asarray(x, dtype=float)
    y = np.asarray(y, dtype=float)
    pass`,
          solution: `import numpy as np

def best_stump(x, y):
    best = None
    for t in np.unique(x)[:-1]:
        lo, hi = y[x <= t], y[x > t]
        sse = ((lo - lo.mean()) ** 2).sum() + ((hi - hi.mean()) ** 2).sum()
        if best is None or sse < best[0]:
            best = (sse, t, lo.mean(), hi.mean())
    return best[1:]

def boost(x, y, rounds, lr):
    x = np.asarray(x, dtype=float)
    y = np.asarray(y, dtype=float)
    pred = np.full(len(y), y.mean())
    for _ in range(rounds):
        t, lo, hi = best_stump(x, y - pred)
        pred = pred + lr * np.where(x <= t, lo, hi)
    return pred`,
          tests: `x = np.arange(6.0)
y = np.array([0.0, 0.0, 0.0, 1.0, 1.0, 1.0])
out = boost(x, y, 1, 1.0)
assert out is not None, "the function returns nothing yet"
assert np.allclose(out, y), "one round with lr = 1 on a step should reproduce the step"
assert np.allclose(boost(x, y, 0, 0.1), 0.5), "with no rounds the forecast is the mean of y"
rng = np.random.default_rng(3)
xs = rng.uniform(0, 1, 200)
ys = np.sin(6 * xs) + rng.normal(0, 0.3, 200)
e = [np.mean((boost(xs, ys, k, 0.1) - ys) ** 2) for k in (1, 20, 200)]
assert e[0] > e[1] > e[2], f"training error must fall as rounds are added, got {np.round(e, 4)}"`,
          why: 'The training error always falls, which is exactly why it cannot be used to choose the number of rounds. On data with a weak signal, check the error on a later period after every round and stop when it turns.',
        },
        {
          kind: 'design',
          id: 'qml-trees-12',
          ask: 'A colleague wants to replace your ridge forecast with gradient boosting on the same 15 features and 10 years of daily data. What do you require before switching?',
          checklist: [
            { point: 'The same walk-forward test, same periods and costs, for both models', why: 'A fair race needs the same track.' },
            { point: 'The number of rounds, depth and learning rate chosen inside each training window', why: 'Tuning on the test periods flatters the more flexible model most.' },
            { point: 'Improvement in out-of-sample R² or IC and in net P&L, not in training fit', why: 'Boosting always wins in-sample.' },
            { point: 'Stability: results across sub-periods and across random seeds', why: 'A gain that lives in one year or one seed is noise.' },
            { point: 'A reason the relationship is non-linear or has interactions', why: 'Without one, the extra flexibility mostly fits noise.' },
            { point: 'The cost of running it: retraining time, settings to monitor, explainability', why: 'A small gain may not pay for a model nobody can check.' },
          ],
          why: 'With weak signals and short histories, simple models are often as good out of sample. A more complex model has to win on the same honest test, by enough to matter.',
        },
      ],
    },
    {
      id: 'qml-validation',
      title: 'Validation for time series',
      summary: 'Walk-forward splits, purging and embargo, tuning inside the window, and why shuffled k-fold leaks.',
      widget: 'qml-leak',
      text: [
        "**k-fold cross-validation** cuts the rows into k folds, trains on k − 1 and tests on the one left, k times. In most machine learning the folds are drawn at random. On market data that leaks twice. The future trains the past, so a model tested on 2015 has learned from 2020. And neighbouring rows are near-copies: with overlapping labels and slow-moving features, a test row's neighbour in time sits in the training set with almost the same features and almost the same label. A model that memorises scores well on the test fold without having learned anything that carries forward.",
        '**Walk-forward** validation respects time: train on a window, test on the block that follows, move forward and repeat. The window can **expand** (all data so far: more data, slower to adapt) or **roll** (the last N rows: adapts faster, noisier). Join the test blocks and you have a record made the way you would trade.',
        "**Purging.** Row t's label covers days t + 1 to t + h. A training row whose label window overlaps the label window of any test row has seen part of the test outcome. With test rows starting at s, the training rows from s − h + 1 to s − 1 overlap: drop those h − 1 rows. **Embargo**: when training data also comes after the test block (as in purged k-fold), drop a further stretch after the test block too, because features built from rolling windows carry the test period's information forward. Both ideas are set out in López de Prado's Advances in Financial Machine Learning (2018).",
        '**Tune inside the training window.** Choosing λ, depth or the number of boosting rounds by test-block score turns the test into training. Split each training window again in time order: fit on its earlier part, pick the setting on its later part, refit, then score the test block once. In practice, `sklearn.model_selection.TimeSeriesSplit` gives walk-forward splits and has a `gap` argument for purging; purged k-fold and combinatorial purged cross-validation are not in scikit-learn and are written by hand or taken from other packages.',
      ],
      rules: [
        'Never shuffle rows of a time series into folds.',
        'Walk-forward: train on the past window, test on the next block, roll forward.',
        'Purge: with horizon h, drop the h − 1 training rows before a test block.',
        'Embargo: also drop rows after a test block when training data follows it.',
        'Tune settings inside each training window, then score the test block once.',
      ],
      questions: [
        {
          kind: 'choice',
          id: 'qml-validation-1',
          ask: 'In the figure the labels are pure noise, so no model can truly beat 50%. Set the label horizon to 20 days. What do the two schemes report?',
          options: [
            'Both about 50%',
            'Shuffled k-fold reports well above 50%; purged walk-forward stays near 50%',
            'Walk-forward reports well above 50%; shuffled k-fold stays near 50%',
            'Both well above 50%',
          ],
          answer: 1,
          why: 'With 20-day overlapping labels, a shuffled test row has neighbours in the training set that share 19 of its 20 days. The nearest-neighbour model copies their label and looks skilled. Walk-forward with purging takes those neighbours away and the skill disappears, as it must on noise.',
        },
        {
          kind: 'choice',
          id: 'qml-validation-2',
          ask: 'In the figure, set the horizon to 1 day. Why does the gap between the two schemes almost close?',
          options: [
            '1-day labels do not overlap, so neighbouring rows no longer share their label',
            'The model is better at 1-day labels',
            'Walk-forward is wrong for long horizons',
            'Shuffling has no effect at all on time series',
          ],
          answer: 0,
          why: 'The leak in this example comes from shared label days. With h = 1 neighbours have independent labels, so copying them gives nothing. Slow features can still leak information about regimes, which is why time order is the rule regardless.',
        },
        {
          kind: 'number',
          id: 'qml-validation-3',
          ask: 'Labels are 10-day forward returns (row t covers days t + 1 to t + 10). A test block starts at row 1,000. How many training rows immediately before it must be purged?',
          answer: 9,
          tol: 0,
          check: '10 - 1',
          why: 'Rows 991 to 999 have label windows that end on days 1,001 to 1,009, inside the windows of the first test rows. Row 990 ends on day 1,000 and does not overlap. Purging h − 1 = 9 rows is the minimum; many people round up to h.',
        },
        {
          kind: 'number',
          id: 'qml-validation-4',
          ask: 'You have 2,520 days. Walk-forward uses a 1,000-day training window and 250-day test blocks, stepping forward 250 days each time. How many complete test blocks are there?',
          answer: 6,
          tol: 0,
          check: '(2520 - 1000) // 250',
          why: '1,520 days remain after the first training window: 6 full blocks of 250 with 20 days left over. Six blocks of about a year each are enough to see whether results hold from year to year, not enough to be sure of a weak edge.',
        },
        {
          kind: 'output',
          id: 'qml-validation-5',
          ask: 'Walk-forward splits with a rolling window. What does this print?',
          code: `def splits(n, train, test):
    out = []
    s = train
    while s + test <= n:
        out.append((s - train, s, s + test))
        s += test
    return out

print(splits(10, 4, 3))`,
          answer: '[(0, 4, 7), (3, 7, 10)]',
          why: 'Each tuple is (train start, test start, test end): train on rows 0 to 3, test 4 to 6; then train on 3 to 6, test 7 to 9. The window rolls forward by one test block each time and always ends where the test begins.',
        },
        {
          kind: 'write',
          id: 'qml-validation-6',
          ask: 'Write `walk_forward(n, train, test, expanding)`: return a list of `(train_start, test_start, test_end)` with test blocks `[s, s + test)` for s = train, train + test, … while `s + test <= n`. With `expanding=True` the training window always starts at 0; otherwise it is the last `train` rows before s.',
          starter: `def walk_forward(n, train, test, expanding):
    pass`,
          solution: `def walk_forward(n, train, test, expanding):
    out = []
    s = train
    while s + test <= n:
        out.append((0 if expanding else s - train, s, s + test))
        s += test
    return out`,
          tests: `out = walk_forward(10, 4, 3, False)
assert out is not None, "the function returns nothing yet"
assert out == [(0, 4, 7), (3, 7, 10)], f"rolling: expected [(0, 4, 7), (3, 7, 10)], got {out}"
assert walk_forward(10, 4, 3, True) == [(0, 4, 7), (0, 7, 10)], "expanding: every training window starts at 0"
assert walk_forward(2520, 1000, 250, False)[-1] == (1250, 2250, 2500), "the last full block of 250 ends at 2500"
assert len(walk_forward(2520, 1000, 250, True)) == 6, "2520 days give 6 full test blocks"
assert walk_forward(5, 4, 3, False) == [], "too little data for one test block gives no splits"
for a, s, e in walk_forward(100, 30, 10, False):
    assert a < s < e and s - a == 30, "training always ends where testing starts, never after"`,
          why: 'Writing the splits as plain index triples makes the rule visible: every training index is smaller than every test index. Add purging by moving the training end back h − 1 rows.',
        },
        {
          kind: 'write',
          id: 'qml-validation-7',
          numpy: true,
          ask: 'Write `purged_train(n, test_start, test_end, h, embargo)` for purged k-fold: return the sorted training row indices (a NumPy array) out of `0..n−1`, excluding the test rows `[test_start, test_end)`, the `h − 1` rows before the test block, and the `h − 1 + embargo` rows after it.',
          starter: `import numpy as np

def purged_train(n, test_start, test_end, h, embargo):
    idx = np.arange(n)
    pass`,
          solution: `import numpy as np

def purged_train(n, test_start, test_end, h, embargo):
    idx = np.arange(n)
    lo = test_start - (h - 1)
    hi = test_end + (h - 1) + embargo
    return idx[(idx < lo) | (idx >= hi)]`,
          tests: `out = purged_train(20, 8, 12, 1, 0)
assert out is not None, "the function returns nothing yet"
assert out.tolist() == [0, 1, 2, 3, 4, 5, 6, 7, 12, 13, 14, 15, 16, 17, 18, 19], f"h = 1 and no embargo: only the test rows are removed, got {out.tolist()}"
out = purged_train(20, 8, 12, 3, 0)
assert out.tolist() == [0, 1, 2, 3, 4, 5, 14, 15, 16, 17, 18, 19], f"h = 3: drop 2 rows each side of the test block, got {out.tolist()}"
out = purged_train(20, 8, 12, 3, 2)
assert out.tolist() == [0, 1, 2, 3, 4, 5, 16, 17, 18, 19], f"an embargo of 2 removes 2 more rows after the block, got {out.tolist()}"
assert purged_train(20, 0, 5, 3, 0).tolist() == list(range(7, 20)), "a test block at the start has nothing before it to purge"`,
          why: 'Purging removes labels that overlap the test outcomes; the embargo removes rows after the test block whose features were built from it. The cost is a little less training data, which is cheap compared with a leak.',
        },
        {
          kind: 'bug',
          id: 'qml-validation-8',
          ask: 'This picks λ for one walk-forward block. Its test results are much better than the live results. Which line is the problem?',
          code: `def run_block(fit, score, Xtr, ytr, Xva, yva, Xte, yte, lams):
    best, best_s = None, -1e9
    for lam in lams:
        model = fit(Xtr, ytr, lam)
        s = score(model, Xte, yte)
        if s > best_s:
            best, best_s = lam, s
    return score(fit(Xtr, ytr, best), Xte, yte)`,
          line: 5,
          fix: '        s = score(model, Xva, yva)',
          why: 'Choosing λ by its score on the test block and then reporting that score is selection on the test data. Choose on the validation part (inside the training period, before the test block), and score the test block once with the chosen λ.',
        },
        {
          kind: 'bug',
          id: 'qml-validation-9',
          ask: 'This is meant to be a walk-forward split: train on everything before the test block. Which line breaks the rule?',
          code: `import numpy as np

def split(n, test_start, test_end):
    test = np.arange(test_start, test_end)
    train = np.r_[0:test_start, test_end:n]
    return train, test`,
          line: 5,
          fix: '    train = np.arange(0, test_start)',
          why: 'Adding the rows after the test block is k-fold, not walk-forward: the model learns from the future it is tested on. Only rows before the test block, minus the purge, may train it.',
        },
        {
          kind: 'choice',
          id: 'qml-validation-10',
          ask: 'Expanding or rolling training window: which is the honest trade-off?',
          options: [
            'Expanding is always better because it uses more data',
            'Expanding uses more data and gives steadier estimates but adapts slowly to change; rolling adapts faster but each fit is noisier',
            'Rolling is always better because markets change',
            'They give identical results',
          ],
          answer: 1,
          why: 'It is the usual bias and variance trade-off, in time. With weak signals more data often wins; with relationships that drift, old data hurts. Treat the window length as a setting to choose inside the training data, like λ.',
        },
        {
          kind: 'design',
          id: 'qml-validation-11',
          ask: 'Write the validation plan for a ridge model on daily US stock data with 10-day forward return labels and 15 years of history.',
          checklist: [
            { point: 'Walk-forward in time order, with test blocks of about a year', why: 'Matches how the model would be used and shows year-to-year stability.' },
            { point: 'Purge at least 9 rows before each test block', why: '10-day labels overlap the start of the test block.' },
            { point: "Standardise features with each training window's statistics only", why: 'Scaling on all data is a leak.' },
            { point: 'Tune λ on the later part of each training window, never on the test block', why: 'Selection on the test block inflates the result.' },
            { point: 'A final holdout period, run once at the end', why: 'Walk-forward results still guide your design choices; the holdout does not.' },
            { point: 'Count independent outcomes as days ÷ 10 when judging significance', why: 'Overlapping labels inflate the apparent sample.' },
            { point: 'Score net of costs against a no-model baseline', why: 'The comparison that decides whether to trade.' },
          ],
          why: 'Each item closes a different leak. Missing any one of them can make noise look like skill, and the result will not survive live trading.',
        },
      ],
    },
    {
      id: 'qml-strategy',
      title: 'Judging a model as a strategy',
      summary: 'From forecast to position, why accuracy is not profit, costs and thresholds, baselines, and feature importance.',
      widget: 'qml-threshold',
      text: [
        'A forecast is not a trade. Common ways to turn one into a position: the **sign** (long 1 when the forecast is positive, short 1 when negative); **proportional** (position = forecast ÷ its typical size, capped); **threshold** (trade only when |forecast| is above k, flat otherwise). The position decided at the close of t earns the return from t to t + 1, and every change of position pays costs: `net = pos × r − cost × |pos − previous pos|`.',
        '**Accuracy is not profit.** P&L is the sum of position × return. A model that is right 55% of the time with an average win of 0.8% and an average loss of 1.2% loses 0.10% a trade. For normal data the sign strategy earns on average `ρ × σ × √(2/π)` a day, where ρ is the correlation (the IC) of forecast and return and σ the daily volatility, so its annual Sharpe ratio before costs is about `ρ × √(2/π) × √252`: 0.63 for ρ = 0.05. Costs come out of that, and a sign strategy that flips often pays the spread on many days.',
        "**Baselines.** Compare with what you could do without a model: holding the asset (US equity indexes have risen on a little over half of days in long samples), flat (zero), and a naive rule such as yesterday's sign. Report the IC, hit rate, turnover and Sharpe net of costs, each with its noise band, for the model and the baselines.",
        "**Feature importance.** **Permutation importance** shuffles one feature's column in the test data and measures how much the score drops; a feature the model relies on causes a large drop. Compute it on test data, not training data, where an overfitted model also relies on noise. Two correlated features share their importance, so each can look unimportant on its own. Importance from tree split counts favours features with many distinct values. In practice: `sklearn.inspection.permutation_importance`, and the SHAP library for per-forecast attributions. Importance says what the model uses, not what drives the market.",
      ],
      rules: [
        'Position at the close of t earns r from t to t + 1. Costs on every change: cost × |Δpos|.',
        'Accuracy is not profit: expectancy = hit × avg win − miss × avg loss.',
        'Sign strategy Sharpe before costs ≈ ρ × √(2/π) × √252.',
        "Beat baselines net of costs: buy and hold, flat, yesterday's sign.",
        'Permutation importance on test data. Correlated features share it.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'qml-strategy-1',
          ask: 'A model is right 55% of the time. Its average winning day makes 0.8% and its average losing day loses 1.2%. What is the expectancy per trade? Give a percentage, for example 0.25%.',
          answer: -0.001,
          tol: 0.00005,
          check: '0.55 * 0.008 - 0.45 * 0.012',
          why: '0.55 × 0.8% − 0.45 × 1.2% = 0.44% − 0.54% = −0.10%. A better-than-coin hit rate with losers larger than winners loses money. The risk module taught the same sum for trades; it applies to model forecasts unchanged.',
        },
        {
          kind: 'number',
          id: 'qml-strategy-2',
          ask: "A forecast has correlation (IC) 0.05 with the next day's return, and both are normal. Using ρ × √(2/π) × √252, what is the annual Sharpe ratio of the sign strategy before costs? Give 2 decimal places.",
          answer: 0.63,
          tol: 0.01,
          check: '0.05 * math.sqrt(2 / math.pi) * math.sqrt(252)',
          why: 'About 0.63. A daily IC of 0.05 would be a good signal, and it gives a respectable but not dazzling Sharpe before costs. The sign strategy is in the market every day, so costs on its flips can take most of it.',
        },
        {
          kind: 'number',
          id: 'qml-strategy-3',
          ask: 'A sign strategy flips from +1 to −1 or back every day, a change of 2 units. Costs are 5 basis points (0.05%) per unit traded. What does that cost over 252 days? Give a percentage, for example 25%.',
          answer: 0.252,
          tol: 0.002,
          check: '2 * 0.0005 * 252',
          why: '2 × 0.05% × 252 = 25.2% a year. No daily forecast with a realistic IC earns that much. Turnover is the first thing to check in any model that trades every day.',
        },
        {
          kind: 'output',
          id: 'qml-strategy-4',
          ask: 'Positions, returns and costs in percent. What does this print?',
          code: `import numpy as np

pos = np.array([1, 1, -1, 0, 1])
r = np.array([0.5, -0.2, -1.0, 0.3, 0.4])
trades = np.abs(np.diff(pos, prepend=0))
net = pos * r - 0.1 * trades
print(trades.tolist(), round(net.sum(), 2))`,
          answer: '[1, 0, 2, 1, 1] 1.2',
          why: 'Gross: 0.5 − 0.2 + 1.0 + 0 + 0.4 = 1.7. Trades total 5 units at 0.1 each, 0.5. Net 1.2. `prepend=0` charges for the first entry from flat; the flip from +1 to −1 counts double.',
        },
        {
          kind: 'bug',
          id: 'qml-strategy-5',
          ask: 'This should charge costs only when the position changes. A strategy that holds +1 all year is charged every day. Which line is wrong?',
          code: `import numpy as np

def net_returns(pos, r, cost):
    pos = np.asarray(pos, dtype=float)
    r = np.asarray(r, dtype=float)
    trades = np.abs(pos)
    return pos * r - cost * trades`,
          line: 6,
          fix: '    trades = np.abs(np.diff(pos, prepend=0))',
          why: 'Costs come from trading, the change in position, not from holding it. Charging |pos| every day makes a steady model look expensive and hides how costly a jittery model is by comparison.',
        },
        {
          kind: 'choice',
          id: 'qml-strategy-6',
          ask: 'Two models on the same test period, net of costs. A is right 56% of the time, B 51%. Which statement fits the chart?',
          chart: {
            title: 'Cumulative net return, %',
            x: 'day',
            y: '%',
            series: [
              { name: 'Model A (56% right)', points: [0, 0.4, 0.9, 1.1, 1.6, -2.5, -2.1, -1.6, -1.2, -4.9, -4.4, -3.8], color: 'bad' },
              { name: 'Model B (51% right)', points: [0, -0.3, -0.5, 0.2, -0.1, 2.6, 2.3, 2.0, 2.4, 5.1, 4.8, 5.2], color: 'good' },
            ],
          },
          options: [
            'The chart must be wrong: a higher hit rate always earns more',
            'A wins many small days and is wrong on the few big ones; B is wrong often but right on the big days, so B makes money and A loses',
            'B is better only because of lower costs',
            'Both models have the same expected return',
          ],
          answer: 1,
          why: 'P&L depends on which days you are right, weighted by their size. Regression on returns, size-aware labels and judging by net P&L keep you from choosing A.',
        },
        {
          kind: 'choice',
          id: 'qml-strategy-7',
          ask: 'In the figure, set costs to 5 bp and raise the threshold from 0 to 1.5. What happens?',
          options: [
            'Far fewer days in the market and far lower costs; the gross return falls too, but the net Sharpe ratio improves because the days dropped were the weakest forecasts',
            'More trades and higher costs',
            'The hit rate falls to zero',
            'Nothing: the threshold only changes the gross return',
          ],
          answer: 0,
          why: 'At k = 0 the strategy changes position on about half the days and costs eat nearly all of its edge. Trading only the strongest forecasts cuts turnover sharply while keeping the days where the expected return is largest. Raised too far, it trades so rarely that the result is noise. The threshold is a setting to choose on validation data like any other.',
        },
        {
          kind: 'write',
          id: 'qml-strategy-8',
          numpy: true,
          ask: 'Write `strategy(pred, r, cost, k)`: position = sign(pred) where |pred| > k, else 0; `r[i]` is the return earned by the position decided with `pred[i]`. Return the array of daily net returns, `pos × r − cost × |change in pos|`, with the first change measured from 0.',
          starter: `import numpy as np

def strategy(pred, r, cost, k):
    pred = np.asarray(pred, dtype=float)
    r = np.asarray(r, dtype=float)
    pass`,
          solution: `import numpy as np

def strategy(pred, r, cost, k):
    pred = np.asarray(pred, dtype=float)
    r = np.asarray(r, dtype=float)
    pos = np.where(np.abs(pred) > k, np.sign(pred), 0.0)
    return pos * r - cost * np.abs(np.diff(pos, prepend=0.0))`,
          tests: `out = strategy([1, 1, -1, 0.1, 2], [0.5, -0.2, -1.0, 0.3, 0.4], 0.1, 0.5)
assert out is not None, "the function returns nothing yet"
assert np.allclose(out, [0.4, -0.2, 0.8, -0.1, 0.3]), f"expected [0.4, -0.2, 0.8, -0.1, 0.3], got {np.round(out, 4).tolist()}"
assert np.allclose(strategy([0.1, -0.2], [1.0, 1.0], 0.1, 0.5), 0), "forecasts below the threshold give no position and no cost"
assert np.allclose(strategy([1, 1, 1], [0.1, 0.1, 0.1], 0.05, 0), [0.05, 0.1, 0.1]), "holding a position costs nothing after entry"`,
          why: 'Everything that decides real P&L is in these two lines: the rule from forecast to position, the alignment of position with the return it earns, and the cost of each change.',
        },
        {
          kind: 'write',
          id: 'qml-strategy-9',
          numpy: true,
          ask: 'Write `perm_importance(predict, X, y, j, seed)`: compute the mean squared error of `predict(X)` against y; then shuffle column j of a copy of X with `np.random.default_rng(seed).permutation` and compute the error again. Return the increase (shuffled MSE − base MSE).',
          starter: `import numpy as np

def perm_importance(predict, X, y, j, seed):
    X = np.asarray(X, dtype=float)
    y = np.asarray(y, dtype=float)
    pass`,
          solution: `import numpy as np

def perm_importance(predict, X, y, j, seed):
    X = np.asarray(X, dtype=float)
    y = np.asarray(y, dtype=float)
    base = np.mean((predict(X) - y) ** 2)
    Xp = X.copy()
    Xp[:, j] = np.random.default_rng(seed).permutation(Xp[:, j])
    return float(np.mean((predict(Xp) - y) ** 2) - base)`,
          tests: `rng = np.random.default_rng(0)
X = rng.normal(0, 1, (2000, 3))
y = 2 * X[:, 0] + 0.5 * X[:, 1] + rng.normal(0, 0.1, 2000)
model = lambda Z: 2 * Z[:, 0] + 0.5 * Z[:, 1]
out = perm_importance(model, X, y, 0, 1)
assert out is not None, "the function returns nothing yet"
assert out > 6, f"shuffling the main feature should raise the error by about 2 x 2^2 = 8, got {out:.2f}"
assert 0.3 < perm_importance(model, X, y, 1, 1) < 0.7, "the second feature matters less: about 2 x 0.5^2 = 0.5"
assert abs(perm_importance(model, X, y, 2, 1)) < 1e-12, "a feature the model ignores has zero importance"
X0 = X.copy()
perm_importance(model, X, y, 0, 1)
assert np.array_equal(X, X0), "do not shuffle the caller's array: work on a copy"`,
          why: 'The test asks only one thing of the model: how much worse it gets when one input carries no information. Run it on test data; on training data an overfitted model leans on noise features too.',
        },
        {
          kind: 'choice',
          id: 'qml-strategy-10',
          ask: 'Your model uses a 20-day and a 21-day momentum feature. Permutation importance says each matters little. What is the likely explanation?',
          options: [
            'Momentum has no value in this model',
            'The two features carry the same information, so when one is shuffled the model still has the other; together they may matter a lot',
            'Permutation importance is always wrong for linear models',
            'The features were not standardised',
          ],
          answer: 1,
          why: 'Shuffling one of two near-copies removes little information. Shuffle them together, or group correlated features, before concluding that an idea does not matter.',
        },
        {
          kind: 'design',
          id: 'qml-strategy-11',
          ask: "You are writing up a model's walk-forward results for someone who will decide whether to trade it. What goes in the report?",
          checklist: [
            { point: 'IC and hit rate out of sample, each with a noise band', why: 'Shows whether there is any signal at all.' },
            { point: 'The rule from forecast to position, decided before the test', why: 'A rule chosen after seeing results is part of the fit.' },
            { point: 'Turnover and the cost assumption, with results at two or three cost levels', why: 'Costs decide most daily strategies.' },
            { point: "Net Sharpe, drawdown and t statistic against baselines: buy and hold, flat, yesterday's sign", why: 'A model is only worth what it adds to a simple alternative.' },
            { point: 'Results by year or by test block', why: 'One good year can carry a whole test.' },
            { point: 'How many models and settings were tried', why: 'The reader needs it to judge luck.' },
            { point: 'Permutation importance on test data, and whether it makes sense', why: 'A model that leans on an odd feature may be leaking.' },
          ],
          why: 'The report should let a sceptic find the flaw. Leaving out the baselines, the costs or the count of trials hides exactly what they need.',
        },
      ],
    },
    {
      id: 'qml-failure',
      title: 'Failure modes',
      summary: 'Overfitting the search, regime change, crowding, and an honest note on deep learning and reinforcement learning.',
      text: [
        '**Overfitting the search.** Every model, feature set and setting you try is a test. The best of many noise models looks good by luck: the quant module showed it for t statistics and the alpha module for Sharpe ratios. Bailey, Borwein, López de Prado and Zhu (Journal of Computational Finance, 2017) proposed estimating the **probability of backtest overfitting**: split the history into blocks, choose the best configuration on some blocks, and see how often it ranks below the median on the rest. If it often does, the selection is picking luck.',
        '**Regime change and crowding.** A model learns the past. When volatility, rates or market structure shift, the relationships it learned can stop holding or reverse, and nothing in the model tells you. Crowding is the market version: many firms use similar data and similar models, so they hold similar positions and sell them at the same time. In August 2007 many quantitative equity funds suffered large losses over a few days, widely attributed to crowded positions being unwound together (Khandani and Lo studied it the same year).',
        "**Deep learning, honestly.** Neural networks need lots of data, and returns give little. Gu, Kelly and Xiu found shallow networks did as well as or better than deeper ones on monthly stock returns. Many online demonstrations of networks that 'predict' prices plot predicted against actual price: since tomorrow's price is close to today's, a model that outputs today's price looks almost perfect. Compare against that naive forecast, and score returns, not prices. Networks earn their keep more often on data with more structure, such as text, order books and alternative data, than on daily returns.",
        "**Reinforcement learning, honestly.** Reinforcement learning trains an agent by trial and error against an environment. In trading the environment is a backtest, so the agent learns the backtest's quirks: fills at prices you could not get, no market impact, one historical path. Rewards are noisy, the environment changes, and there is only one history to learn from. Public, independent evidence of reinforcement learning agents trading profitably out of sample after costs is thin. Treat a claim of one as you would any backtest: count the trials, check the fills, test forward.",
        'The defence against all of these is the same: few, simple models with a reason behind them; time-ordered validation with purging; a holdout used once; costs; baselines; small live size; and the expectation that live results will be worse than the backtest.',
      ],
      rules: [
        'Every configuration tried is a test. The best of many is biased upward.',
        'Probability of backtest overfitting: how often the in-sample best is below median out of sample.',
        'Regimes change, and crowded trades unwind together.',
        'Score returns, not prices, and beat the naive forecast.',
        'Reinforcement learning learns the simulator. Its fills and impact must be right.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'qml-failure-1',
          ask: 'You try 50 models with no edge on 500 days. For one model the chance of a hit rate of at least 53% is about 1 − Φ(z) with z = 0.03 ÷ √(0.25/500) ≈ 1.34, roughly 9%. What is the chance at least one of the 50 reaches 53%, treating them as independent? Give a percentage, for example 25%.',
          answer: 0.99,
          tol: 0.005,
          check: '1 - (1 - (1 - 0.5 * (1 + math.erf((0.03 / math.sqrt(0.25 / 500)) / math.sqrt(2))))) ** 50',
          why: '1 − 0.91⁵⁰ ≈ 99%. Fifty tries all but guarantee a 53% model from nothing. Real candidate models are correlated with each other, which lowers this, but the lesson stands: report how many you tried.',
        },
        {
          kind: 'number',
          id: 'qml-failure-2',
          ask: 'One model, decided in advance, hits 52% on 250 days. With no edge, the chance of 52% or better is 1 − Φ(z) with z = 0.02 ÷ √(0.25/250). What is it? Give a percentage, for example 25%.',
          answer: 0.264,
          tol: 0.005,
          check: '1 - 0.5 * (1 + math.erf((0.02 / math.sqrt(0.25 / 250)) / math.sqrt(2)))',
          why: 'z ≈ 0.63 and the chance is about 26%. A year at 52% is what a coin does more than a quarter of the time. It is not evidence of anything.',
        },
        {
          kind: 'number',
          id: 'qml-failure-3',
          ask: 'A model reports an out-of-sample R² of 0.4%. If it were a single linear feature, what correlation with returns would that be? Give 3 decimal places.',
          answer: 0.063,
          tol: 0.001,
          check: 'math.sqrt(0.004)',
          why: '√0.004 ≈ 0.063. Good return models live at correlations like this. A model claiming a correlation of 0.3 with next-day returns is claiming an R² of 9%, which would be far beyond anything reported.',
        },
        {
          kind: 'output',
          id: 'qml-failure-4',
          ask: 'A "model" that forecasts tomorrow\'s price as today\'s, scored on price levels and on returns. What does this print?',
          code: `import numpy as np

rng = np.random.default_rng(0)
p = 100 * np.exp(np.cumsum(rng.normal(0, 0.01, 1000)))
pred = p[:-1]
level = np.corrcoef(pred, p[1:])[0, 1]
ret = np.corrcoef(np.diff(p)[:-1], np.diff(p)[1:])[0, 1]
print(level > 0.95, abs(ret) < 0.1)`,
          answer: 'True True',
          why: "On price levels the naive forecast correlates above 0.95 with the outcome: prices barely move from one day to the next. On returns, yesterday's change says almost nothing about today's. A level chart that looks perfect proves nothing; score changes.",
        },
        {
          kind: 'choice',
          id: 'qml-failure-5',
          ask: "A video shows a neural network's predicted price tracing the actual price almost perfectly, one day behind. What is most likely going on?",
          chart: {
            title: 'Price, actual and "predicted"',
            x: 'day',
            y: '$',
            series: [
              { name: 'actual', points: [100, 101, 103, 102, 104, 106, 105, 103, 104, 107, 108, 106], color: 'blue' },
              { name: 'predicted', points: [100, 100, 101, 103, 102, 104, 106, 105, 103, 104, 107, 108], color: 'accent' },
            ],
          },
          options: [
            'The network has learned to forecast prices',
            "The network has learned to output roughly today's price, the naive forecast, which looks perfect on a price chart and has no value",
            'The network is forecasting one day too late because of a slow computer',
            'This is what a good model with an R² of 0.4% looks like',
          ],
          answer: 1,
          why: 'The predicted line is the actual line shifted one day right. Score it on returns or against the naive forecast and the skill vanishes. Many "AI predicts stocks" demonstrations are this picture.',
        },
        {
          kind: 'bug',
          id: 'qml-failure-6',
          ask: 'This picks the best of many models and reports what to expect live. The live result is much worse. Which line is the problem?',
          code: `import numpy as np

def pick_and_report(train_scores, test_scores):
    train_scores = np.asarray(train_scores)
    test_scores = np.asarray(test_scores)
    best = np.argmax(test_scores)
    return best, test_scores[best]`,
          line: 6,
          fix: '    best = np.argmax(train_scores)',
          why: 'Choosing the model by its test score and then quoting that score reports the luckiest result, not an expectation. Choose on training (or validation) data; the test score of the chosen model is then an honest estimate.',
        },
        {
          kind: 'write',
          id: 'qml-failure-7',
          numpy: true,
          ask: 'Write `best_of_noise(n_models, n_days, seed)`: with `rng = np.random.default_rng(seed)`, draw a ±1 forecast matrix of shape (n_models, n_days) with `rng.choice([-1, 1], ...)`, then a ±1 outcome row of length n_days, for an in-sample period; then the same again (forecasts first, then outcomes) for an out-of-sample period. Pick the model with the highest in-sample hit rate and return `(its in-sample hit rate, its out-of-sample hit rate)`.',
          starter: `import numpy as np

def best_of_noise(n_models, n_days, seed):
    rng = np.random.default_rng(seed)
    pass`,
          solution: `import numpy as np

def best_of_noise(n_models, n_days, seed):
    rng = np.random.default_rng(seed)
    f_in = rng.choice([-1, 1], size=(n_models, n_days))
    y_in = rng.choice([-1, 1], size=n_days)
    f_out = rng.choice([-1, 1], size=(n_models, n_days))
    y_out = rng.choice([-1, 1], size=n_days)
    hits_in = (f_in == y_in).mean(axis=1)
    best = int(np.argmax(hits_in))
    return float(hits_in[best]), float((f_out[best] == y_out).mean())`,
          tests: `out = best_of_noise(10, 250, 0)
assert out is not None, "the function returns nothing yet"
a, b = out
assert 0 <= a <= 1 and 0 <= b <= 1, f"hit rates are between 0 and 1, got {out}"
ins, outs = zip(*[best_of_noise(200, 250, s) for s in range(20)])
assert np.mean(ins) > 0.56, f"the best of 200 coin-flip models should look good in-sample, got {np.mean(ins):.3f}"
assert abs(np.mean(outs) - 0.5) < 0.02, f"out of sample the chosen model is a coin flip, got {np.mean(outs):.3f}"
assert best_of_noise(200, 250, 3) == best_of_noise(200, 250, 3), "the same seed must give the same result"`,
          why: 'In-sample, the winner of 200 coin flips shows a hit rate near 59%. Out of sample it falls back to 50%. The gap between the two is the price of the search, and it is the gap a single in-sample number hides.',
        },
        {
          kind: 'choice',
          id: 'qml-failure-8',
          ask: 'A reinforcement learning agent trained on five years of minute bars shows a smooth equity curve in its simulator. What is the first thing to check?',
          options: [
            'Whether the network was deep enough',
            'Whether the simulator fills orders at prices that could really be had, with spread, impact and delay, since the agent will exploit any free lunch the simulator offers',
            'Whether the agent trades every minute',
            'Whether it was trained on a GPU',
          ],
          answer: 1,
          why: "An agent optimises whatever the simulator rewards. If the simulator fills at the mid or at the bar's close with no impact, the agent learns to harvest that, and it disappears live. Simulator realism comes before any model question.",
        },
        {
          kind: 'choice',
          id: 'qml-failure-9',
          ask: "Your model and many other firms' models all go long the same set of stocks. What risk does this add?",
          options: [
            'None: if many firms agree, the trade is safer',
            'Crowding: when some of those firms cut risk, they sell the same stocks together and prices move against everyone holding them, as in August 2007',
            'Only the risk of higher commissions',
            'The model becomes more accurate',
          ],
          answer: 1,
          why: 'Agreement means shared exposure. A loss at one firm can force selling that hurts the others, and the losses are larger and more correlated than any backtest of one fund suggests.',
        },
        {
          kind: 'choice',
          id: 'qml-failure-10',
          ask: 'What did Bailey, Borwein, López de Prado and Zhu propose measuring with their probability of backtest overfitting?',
          options: [
            'The chance that a single backtest contains a coding bug',
            'How often the configuration chosen as best in-sample ranks below the median of the candidates out of sample, across many splits of the data',
            'The probability that a strategy is profitable next year',
            'The share of trades that hit their stop',
          ],
          answer: 1,
          why: 'If selection picked up real skill, the in-sample winner should usually stay above median out of sample. If it is below median about half the time, the selection is choosing luck.',
        },
        {
          kind: 'design',
          id: 'qml-failure-11',
          ask: 'Someone offers you a "deep learning trading model with 70% accuracy" on daily stock direction. List what you would need to see before taking it seriously.',
          checklist: [
            { point: 'A comparison with the naive forecast and with always-long, on returns, not price levels', why: 'Price-level charts make a lagged copy look perfect.' },
            { point: 'Time-ordered, purged validation and a holdout run once', why: '70% from shuffled splits or a leaky label is common; 70% honestly would be extraordinary.' },
            { point: "Every feature's timestamp and how it was scaled", why: 'A single look-ahead feature explains a hit rate like this.' },
            { point: 'How many architectures, features and seeds were tried', why: 'The best of many runs is biased upward.' },
            { point: 'Net P&L after realistic costs, by year', why: 'Accuracy is not profit, and one year can carry the result.' },
            { point: 'A live or paper record after the model was frozen', why: 'Only data the model never saw tests it.' },
          ],
          why: 'Treat an extraordinary claim as a bug report until shown otherwise. The checks above find most of the bugs, and none of them needs access to the model itself.',
        },
      ],
    },
    {
      id: 'qml-lab',
      title: 'Lab: a walk-forward ridge forecaster',
      summary: 'Made-up data, standardisation, ridge, walk-forward forecasts, positions net of costs, scoring, a leak to find, and λ chosen inside each window.',
      text: [
        'This lab builds a return forecaster end to end and judges it as a strategy. The data is made up from a fixed seed: 20 features, of which two carry a weak signal, and returns that are mostly noise, so there is something faint to find and much to overfit.',
        'The steps: generate the data, standardise with training statistics, fit ridge, produce walk-forward forecasts that only ever use the past, turn forecasts into positions net of costs, score them with a Sharpe ratio and t statistic, find a leak, and choose λ inside each training window. Each step repeats the helpers it needs.',
        'Real returns may hold no such signal, or one that costs more to trade than it pays. The point is the pipeline: once it is honest on made-up data, it can be trusted to tell you the truth on real data, which will usually be that there is little to find.',
      ],
      rules: [
        'Fix the seed, so every run gives the same data.',
        'Standardise and fit on the training window only.',
        'Forecasts for a block use only rows before it.',
        'Charge costs on every change of position.',
        'Report the Sharpe with its t statistic, beside a baseline.',
        'Choose λ inside the training window, never on the test block.',
      ],
      questions: [
        {
          kind: 'write',
          id: 'qml-lab-1',
          numpy: true,
          ask: 'Step 1: made-up data. With `rng = np.random.default_rng(seed)`, draw `X = rng.normal(0, 1, (n, p))`, then `noise = rng.normal(0, 0.01, n)`. Set `beta` to zeros with `beta[0] = 0.08` and `beta[1] = −0.05`, and `y = 0.01 × (X @ beta) + noise`. Return `(X, y)`. Row t holds features known at t and y[t] is the return that follows.',
          starter: `import numpy as np

def make_data(n, p, seed):
    rng = np.random.default_rng(seed)
    pass`,
          solution: `import numpy as np

def make_data(n, p, seed):
    rng = np.random.default_rng(seed)
    X = rng.normal(0, 1, (n, p))
    noise = rng.normal(0, 0.01, n)
    beta = np.zeros(p)
    beta[0], beta[1] = 0.08, -0.05
    return X, 0.01 * (X @ beta) + noise`,
          tests: `out = make_data(100, 20, 0)
assert out is not None, "the function returns nothing yet"
X, y = out
assert X.shape == (100, 20) and y.shape == (100,), f"shapes should be (100, 20) and (100,), got {X.shape} and {y.shape}"
X2, y2 = make_data(100, 20, 0)
assert np.array_equal(X, X2) and np.array_equal(y, y2), "the same seed must give the same data"
X, y = make_data(200000, 20, 1)
c0 = np.corrcoef(X[:, 0], y)[0, 1]
c1 = np.corrcoef(X[:, 1], y)[0, 1]
assert 0.07 < c0 < 0.09 and -0.06 < c1 < -0.04, f"feature 0 should correlate about +0.08 with y and feature 1 about -0.05, got {c0:.3f}, {c1:.3f}"
assert abs(np.corrcoef(X[:, 5], y)[0, 1]) < 0.01, "the other features are noise"`,
          why: 'The signal is deliberately weak: the true model explains under 1% of the variance of y, in line with real return forecasts. With 20 features and a few hundred rows, OLS will find plenty of patterns that are not there.',
        },
        {
          kind: 'write',
          id: 'qml-lab-2',
          numpy: true,
          ask: "Step 2: `standardise(train, test)`. Compute each column's mean and standard deviation (`ddof=0`) on `train` only, and return both arrays transformed with them.",
          starter: `import numpy as np

def standardise(train, test):
    train = np.asarray(train, dtype=float)
    test = np.asarray(test, dtype=float)
    pass`,
          solution: `import numpy as np

def standardise(train, test):
    train = np.asarray(train, dtype=float)
    test = np.asarray(test, dtype=float)
    m, s = train.mean(axis=0), train.std(axis=0)
    return (train - m) / s, (test - m) / s`,
          tests: `out = standardise([[1.0, 10.0], [3.0, 30.0]], [[5.0, 20.0]])
assert out is not None, "the function returns nothing yet"
a, b = out
assert np.allclose(a, [[-1, -1], [1, 1]]), f"the training data becomes mean 0 and sd 1, got {a.tolist()}"
assert np.allclose(b, [[3, 0]]), f"the test row uses the training mean and sd: (5-2)/1 = 3 and (20-20)/10 = 0, got {b.tolist()}"
_, b2 = standardise([[1.0, 10.0], [3.0, 30.0]], [[5.0, 20.0], [100.0, 1000.0]])
assert np.allclose(b2[0], [3, 0]), "adding a test row must not change how other test rows are scaled"`,
          why: 'The last test is the leak check: if a later test row changes how an earlier one is scaled, information is flowing backwards. Fitting the scaler on the training window only stops it.',
        },
        {
          kind: 'write',
          id: 'qml-lab-3',
          numpy: true,
          ask: 'Step 3: `ridge_fit(X, y, lam)` returning `(b0, b)`: centre X and y, solve `(XcᵀXc + λI) b = Xcᵀyc`, and set `b0 = mean(y) − mean(X)·b`.',
          starter: `import numpy as np

def ridge_fit(X, y, lam):
    X = np.asarray(X, dtype=float)
    y = np.asarray(y, dtype=float)
    pass`,
          solution: `import numpy as np

def ridge_fit(X, y, lam):
    X = np.asarray(X, dtype=float)
    y = np.asarray(y, dtype=float)
    mx, my = X.mean(axis=0), y.mean()
    Xc, yc = X - mx, y - my
    b = np.linalg.solve(Xc.T @ Xc + lam * np.eye(X.shape[1]), Xc.T @ yc)
    return float(my - mx @ b), b`,
          tests: `rng = np.random.default_rng(0)
X = rng.normal(0, 1, (300, 4))
y = 1.0 + X @ np.array([0.5, 0.0, -0.5, 0.0]) + rng.normal(0, 0.1, 300)
out = ridge_fit(X, y, 0.0)
assert out is not None, "the function returns nothing yet"
b0, b = out
ols = np.linalg.lstsq(np.c_[np.ones(300), X], y, rcond=None)[0]
assert abs(b0 - ols[0]) < 1e-8 and np.allclose(b, ols[1:]), "lam = 0 must match least squares with an intercept"
b0_big, b_big = ridge_fit(X, y, 1e7)
assert np.all(np.abs(b_big) < 1e-3) and abs(b0_big - y.mean()) < 0.01, "a huge lam shrinks b to 0 and leaves the intercept at the mean of y"`,
          why: 'The same ridge as in the linear models lesson. In the next step it is called once per test block, always on the training window only.',
        },
        {
          kind: 'write',
          id: 'qml-lab-4',
          numpy: true,
          ask: 'Step 4: `walk_forward(X, y, train, test, lam)`. Return an array of forecasts the length of y, NaN where no forecast is made. For s = train, train + test, … while `s + test <= len(y)`: standardise `X[s − train:s]` and `X[s:s + test]` with the training statistics, fit ridge on the training rows, and forecast the test rows. `standardise` and `ridge_fit` are given.',
          starter: `import numpy as np

def standardise(train, test):
    m, s = train.mean(axis=0), train.std(axis=0)
    return (train - m) / s, (test - m) / s

def ridge_fit(X, y, lam):
    mx, my = X.mean(axis=0), y.mean()
    Xc, yc = X - mx, y - my
    b = np.linalg.solve(Xc.T @ Xc + lam * np.eye(X.shape[1]), Xc.T @ yc)
    return my - mx @ b, b

def walk_forward(X, y, train, test, lam):
    pred = np.full(len(y), np.nan)
    pass`,
          solution: `import numpy as np

def standardise(train, test):
    m, s = train.mean(axis=0), train.std(axis=0)
    return (train - m) / s, (test - m) / s

def ridge_fit(X, y, lam):
    mx, my = X.mean(axis=0), y.mean()
    Xc, yc = X - mx, y - my
    b = np.linalg.solve(Xc.T @ Xc + lam * np.eye(X.shape[1]), Xc.T @ yc)
    return my - mx @ b, b

def walk_forward(X, y, train, test, lam):
    pred = np.full(len(y), np.nan)
    s = train
    while s + test <= len(y):
        tr, te = standardise(X[s - train:s], X[s:s + test])
        b0, coef = ridge_fit(tr, y[s - train:s], lam)
        pred[s:s + test] = b0 + te @ coef
        s += test
    return pred`,
          tests: `rng = np.random.default_rng(0)
X = rng.normal(0, 1, (1000, 5))
y = 0.01 * X[:, 0] + rng.normal(0, 0.01, 1000)
out = walk_forward(X, y, 500, 100, 1.0)
assert out is not None, "the function returns nothing yet"
assert out.shape == (1000,), f"one entry per row, got shape {out.shape}"
assert np.isnan(out[:500]).all() and not np.isnan(out[500:]).any(), "no forecast for the first training window, a forecast for every row after it"
y2 = y.copy()
y2[700:] = 99.0
out2 = walk_forward(X, y2, 500, 100, 1.0)
assert np.allclose(out[:700], out2[:700], equal_nan=True), "forecasts before row 700 must not change when y from row 700 on changes: that would be a leak"
assert np.corrcoef(out[500:], y[500:])[0, 1] > 0.3, "with a strong made-up signal the forecasts should correlate with y"`,
          why: 'The key test changes the future and checks that earlier forecasts do not move. It is the simplest leak detector there is, and it works on any pipeline: if editing tomorrow changes today, something looks ahead.',
        },
        {
          kind: 'write',
          id: 'qml-lab-5',
          numpy: true,
          ask: 'Step 5: `net_returns(pred, y, cost)`. Position = sign(pred), and 0 where pred is NaN. Return `pos × y − cost × |change in pos|`, with the first change measured from 0.',
          starter: `import numpy as np

def net_returns(pred, y, cost):
    pred = np.asarray(pred, dtype=float)
    y = np.asarray(y, dtype=float)
    pass`,
          solution: `import numpy as np

def net_returns(pred, y, cost):
    pred = np.asarray(pred, dtype=float)
    y = np.asarray(y, dtype=float)
    pos = np.where(np.isnan(pred), 0.0, np.sign(pred))
    return pos * y - cost * np.abs(np.diff(pos, prepend=0.0))`,
          tests: `out = net_returns([np.nan, 0.2, 0.1, -0.3], [0.5, 0.01, -0.02, -0.01], 0.001)
assert out is not None, "the function returns nothing yet"
assert np.allclose(out, [0.0, 0.009, -0.02, 0.008]), f"expected [0, 0.009, -0.02, 0.008], got {np.round(out, 4).tolist()}"
assert np.allclose(net_returns([np.nan, np.nan], [1.0, -1.0], 0.1), 0), "no forecast, no position, no cost"`,
          why: 'The first row with a forecast pays to enter; the flip from long to short pays twice. On the made-up data, try costs of 0, 2 and 5 basis points and watch how quickly a daily sign strategy runs out of edge.',
        },
        {
          kind: 'write',
          id: 'qml-lab-6',
          numpy: true,
          ask: 'Step 6: `score(net)`: drop NaNs, then return `(annual Sharpe, t statistic)` with Sharpe = mean ÷ sd × √252 (sample sd, `ddof=1`) and t = mean ÷ (sd ÷ √n).',
          starter: `import numpy as np

def score(net):
    net = np.asarray(net, dtype=float)
    pass`,
          solution: `import numpy as np

def score(net):
    net = np.asarray(net, dtype=float)
    net = net[~np.isnan(net)]
    m, s = net.mean(), net.std(ddof=1)
    return float(m / s * np.sqrt(252)), float(m / (s / np.sqrt(len(net))))`,
          tests: `out = score([0.01, -0.005, 0.002, 0.004, np.nan])
assert out is not None, "the function returns nothing yet"
r = np.array([0.01, -0.005, 0.002, 0.004])
sr, t = out
assert abs(sr - r.mean() / r.std(ddof=1) * np.sqrt(252)) < 1e-9, "Sharpe = mean / sd x sqrt(252), with ddof=1, after dropping NaN"
assert abs(t - r.mean() / (r.std(ddof=1) / 2)) < 1e-9, "t = mean / (sd / sqrt(n)), with n = 4 here"
sr, t = score(np.r_[np.full(126, 0.01), np.full(126, -0.01)] + 0.001)
assert abs(t - sr) < 1e-9, "with exactly 252 days, t equals the annual Sharpe"`,
          why: 'The t statistic is the daily Sharpe times √n, so it equals the annual Sharpe times √years. A Sharpe of 0.8 over four years of test blocks gives t = 1.6: not yet distinguishable from luck.',
        },
        {
          kind: 'bug',
          id: 'qml-lab-7',
          ask: 'Step 7: a colleague "simplified" the walk-forward by standardising once up front. The test Sharpe went up. Which line leaks?',
          code: `import numpy as np

def walk_forward_fast(X, y, train, test, lam, ridge_fit):
    Z = (X - X.mean(axis=0)) / X.std(axis=0)
    pred = np.full(len(y), np.nan)
    for s in range(train, len(y) - test + 1, test):
        b0, b = ridge_fit(Z[s - train:s], y[s - train:s], lam)
        pred[s:s + test] = b0 + Z[s:s + test] @ b
    return pred`,
          line: 4,
          fix: '    Z = X',
          why: "The mean and standard deviation of all of X include every future row, so each training window is scaled with information from its test block and beyond. Remove the global scaling and standardise inside the loop with the training window's statistics, as in step 4. A result that improves when you take a shortcut deserves suspicion.",
        },
        {
          kind: 'write',
          id: 'qml-lab-8',
          numpy: true,
          ask: "Step 8: `choose_lambda(X, y, lams, val)` for one training window. Fit on all but the last `val` rows (standardised with those rows' statistics), forecast the last `val` rows, and return the λ in `lams` with the highest correlation between forecast and actual on them (the first on ties). `standardise` and `ridge_fit` are given.",
          starter: `import numpy as np

def standardise(train, test):
    m, s = train.mean(axis=0), train.std(axis=0)
    return (train - m) / s, (test - m) / s

def ridge_fit(X, y, lam):
    mx, my = X.mean(axis=0), y.mean()
    Xc, yc = X - mx, y - my
    b = np.linalg.solve(Xc.T @ Xc + lam * np.eye(X.shape[1]), Xc.T @ yc)
    return my - mx @ b, b

def choose_lambda(X, y, lams, val):
    pass`,
          solution: `import numpy as np

def standardise(train, test):
    m, s = train.mean(axis=0), train.std(axis=0)
    return (train - m) / s, (test - m) / s

def ridge_fit(X, y, lam):
    mx, my = X.mean(axis=0), y.mean()
    Xc, yc = X - mx, y - my
    b = np.linalg.solve(Xc.T @ Xc + lam * np.eye(X.shape[1]), Xc.T @ yc)
    return my - mx @ b, b

def choose_lambda(X, y, lams, val):
    tr, va = standardise(X[:-val], X[-val:])
    best, best_ic = None, -np.inf
    for lam in lams:
        b0, coef = ridge_fit(tr, y[:-val], lam)
        ic = np.corrcoef(b0 + va @ coef, y[-val:])[0, 1]
        if ic > best_ic:
            best, best_ic = lam, ic
    return best`,
          tests: `rng = np.random.default_rng(0)
X = rng.normal(0, 1, (400, 30))
y = 0.3 * X[:, 0] + rng.normal(0, 1, 400)
out = choose_lambda(X, y, [0.0, 300.0, 1e5], 100)
assert out is not None, "the function returns nothing yet"
assert out in (0.0, 300.0, 1e5), f"return one of the candidates, got {out}"
Xs = rng.normal(0, 1, (400, 3))
ys = Xs @ np.array([1.0, 0.0, 0.0]) + rng.normal(0, 0.1, 400)
assert choose_lambda(Xs, ys, [1e6, 0.0], 100) == 0.0, "on clean data with a strong signal, no shrinkage beats a crushing lam"
assert choose_lambda(Xs, ys, [5.0], 100) == 5.0, "with one candidate, return it"
assert choose_lambda(Xs, ys, [100.0, 100.0], 100) == 100.0, "ties go to the first"
calls = []
_rf = ridge_fit
def spy_fit(X, y, lam):
    calls.append(len(y))
    return _rf(X, y, lam)
ridge_fit = spy_fit
choose_lambda(X, y, [1.0], 100)
ridge_fit = _rf
assert calls == [300], f"fit on the first 300 rows only, never on the validation rows, got fits on {calls} rows"`,
          why: 'The validation rows sit at the end of the training window, before the test block, so λ is chosen with information the trader would have had. In the full pipeline, call this inside each walk-forward step and use the λ it returns for that block only.',
        },
        {
          kind: 'design',
          id: 'qml-lab-9',
          ask: 'Step 9: the pipeline runs on the made-up data and shows a positive Sharpe net of 2 bp costs. You now point it at real daily data for a liquid ETF. What do you check before believing the result?',
          checklist: [
            { point: 'The leak test from step 4 still passes on the real features', why: 'Real features are built by code that can look ahead; the made-up ones could not.' },
            { point: "Each feature's timestamp against the close it is used at", why: 'Data published after the close, or revised later, leaks.' },
            { point: 'The t statistic of the net returns, and the number of configurations tried', why: 'A positive Sharpe over a few years is often luck.' },
            { point: 'Baselines: buy and hold, flat, and a single-feature model', why: 'The ridge must add something a simpler rule does not.' },
            { point: 'Results at higher costs and by test block', why: 'An edge that dies at 5 bp or lives in one year is not one to trade.' },
            { point: 'A pure-noise run: shuffle y in time blocks and rerun', why: 'An honest pipeline finds nothing in noise; if it finds something, it has a bug.' },
            { point: 'Paper trading, then the smallest size', why: 'Live results are usually worse than the backtest.' },
          ],
          why: 'The lab built an honest pipeline. Honest pipelines mostly report that real daily returns are hard to forecast after costs, and that answer is worth having before money is at risk.',
        },
      ],
    },
  ],
}
