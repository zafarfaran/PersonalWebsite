import type { Block } from '../../types'

/** The full theory for each lesson of the portfolio module, keyed by lesson id. */
export const portfolioTheory: Record<string, Block[]> = {
  'portfolio-variance': [
    { h: 'A portfolio as a list of weights' },
    'Up to now most lessons looked at one position or one strategy at a time. A real account holds several, and the question changes from "how risky is this trade" to "how risky is the whole book". To answer it you describe the book by its **weights**: the fraction of your capital in each asset. $60,000 in one ETF and $40,000 in another, out of $100,000, is the weight list [0.6, 0.4].',
    'A weight can be negative. A **short** position, where you sell borrowed shares and buy them back later, gets a negative weight. A book can be 130% long one asset and 30% short another and still have weights that add up to 1, because the short raises the cash that pays for the extra long.',
    'The expected return of the book is the weighted sum of the expected returns, written `w · μ`, where μ (the Greek letter mu) is the list of expected returns and the dot means "multiply pairs and add". This works because simple returns add across assets, as the quant module showed: 30% of your money earning 10% and 70% earning 2% gives 0.3 × 10% + 0.7 × 2% = 4.4%.',

    { h: 'Why risk does not add up' },
    { sub: 'Two assets' },
    "Risk is measured by **volatility**, σ (sigma), the standard deviation of returns, and its square, the **variance**. For two assets the variance of the book is `σp² = w1²σ1² + w2²σ2² + 2·w1·w2·ρ·σ1·σ2`. The new ingredient is ρ (rho), the **correlation** between the two assets: +1 if they always move together in proportion, 0 if they are unrelated, −1 if one always moves against the other.",
    { sub: 'A worked example' },
    'Take 60% in an asset with 30% volatility and 40% in one with 15%, with correlation 0.2. The pieces are 0.36 × 0.09 = 0.0324, 0.16 × 0.0225 = 0.0036 and 2 × 0.6 × 0.4 × 0.2 × 0.3 × 0.15 = 0.00432. They sum to 0.0403, and the square root is about 20.1%. The weighted average of the two volatilities is 24%. The gap between 24% and 20.1% is **diversification**: risks that are not perfectly correlated partly cancel.',

    { h: 'The covariance matrix' },
    { sub: 'Building it' },
    'With many assets the formula is written as a table. The **covariance** of two assets is `ρ·σi·σj`, and the **covariance matrix** Σ (capital sigma) holds every pair: variances on the diagonal, covariances off it. The book variance is then `w · Σ · w`, which NumPy writes `w @ cov @ w`. You build Σ from a list of volatilities and a correlation matrix with `corr * np.outer(vol, vol)`; going the other way, divide Σ by `np.outer(vol, vol)` where `vol = np.sqrt(np.diag(cov))`.',
    {
      code: `import numpy as np

vol = np.array([0.30, 0.15])
corr = np.array([[1.0, 0.2], [0.2, 1.0]])
cov = corr * np.outer(vol, vol)
w = np.array([0.6, 0.4])
print(cov.round(4).tolist())
print(round(float(w @ cov @ w), 4), round(float(np.sqrt(w @ cov @ w)), 4))`,
      out: `[[0.09, 0.009], [0.009, 0.0225]]
0.0403 0.2008`,
    },
    { sub: 'Estimating it from returns' },
    'From data you estimate Σ with `np.cov`. Give it a T × n array, T days in rows and n assets in columns, and say `rowvar=False`, because by default NumPy treats each row as a variable. Daily variances and covariances become yearly ones by multiplying by 252, the trading days in a year; volatilities by multiplying by √252.',
    {
      code: `import numpy as np

rng = np.random.default_rng(5)
R = rng.normal(0, 0.01, (500, 3))     # 500 days, 3 assets
S = np.cov(R, rowvar=False)
print(S.shape, round(float(np.sqrt(S[0, 0] * 252)), 3))`,
      out: '(3, 3) 0.155',
    },

    { h: 'The least risky mix of two assets' },
    'Setting the derivative of the two-asset variance to zero gives the weight in asset 1 with the lowest risk: `w1 = (σ2² − ρσ1σ2) ÷ (σ1² + σ2² − 2ρσ1σ2)`. At ρ = −1 the two can cancel completely, and the right mix has no risk at all. At ρ = +1 they are the same bet at two sizes, so among long-only mixes the quieter asset alone is safest. When ρ is high the formula can return a negative weight: the least risky book then shorts the noisier asset to hedge the other.',

    { h: 'When a matrix cannot be right' },
    'Not every table of numbers is a possible covariance matrix. No portfolio can have negative variance, so `w · Σ · w` must be zero or more for every w. In linear algebra terms the **eigenvalues** of Σ, numbers that describe how much variance it assigns to each independent direction, must all be zero or positive; such a matrix is called **positive semi-definite**. `np.linalg.eigvalsh` returns them for a symmetric matrix. Correlations typed by hand, or estimated pair by pair over different dates, can break the rule, and an optimiser fed such a matrix chases the impossible portfolio.',
    {
      code: `import numpy as np

corr = np.array([[1.0, 0.5, 0.5],
                 [0.5, 1.0, 0.5],
                 [0.5, 0.5, 1.0]])
print(np.linalg.eigvalsh(corr).round(2).tolist())`,
      out: '[0.5, 0.5, 2.0]',
    },
    'All three are positive, so this matrix is consistent. The large one, 2.0, is the shared move of all three assets.',

    { h: 'How many numbers you are estimating' },
    'A matrix for n assets has n variances and n(n − 1)/2 distinct covariances, n(n + 1)/2 numbers in all: 55 for 10 assets, 1,275 for 50. Each is estimated with error from a limited history, which is the root of the problems in the next two lessons.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Calling `np.cov` on a days × assets array without `rowvar=False` and getting a days × days matrix.',
        'Adding volatilities instead of variances and covariances, which ignores diversification.',
        'Counting an option by its premium instead of by its exposure in shares (its delta).',
        'Judging diversification by the number of positions. Ten stocks in one sector can be close to one bet.',
      ],
    },
  ],

  'portfolio-frontier': [
    { h: 'The question Markowitz asked' },
    'In 1952 Harry Markowitz framed portfolio choice as a trade between two numbers: expected return and variance. Plot every possible portfolio on a chart with risk across and expected return up. The portfolios with the highest return for each level of risk form a curve called the **efficient frontier**. A portfolio below it is **dominated**: another portfolio has the same risk and more return. The method is called **mean-variance optimisation**.',

    { h: 'The optimiser in one formula' },
    { sub: 'Trading return against risk' },
    'One way to pose the problem is to choose weights w that make `w · μ − (λ/2) · w · Σ · w` as large as possible. The first term rewards expected return; the second charges for variance. λ (lambda) is your **risk aversion**: the larger it is, the more variance costs you. Here μ is the expected return above cash, the **excess return**. With no constraints, calculus gives `w = Σ⁻¹μ ÷ λ`, where Σ⁻¹ is the inverse of the covariance matrix. For one asset it reduces to `μ ÷ (λσ²)`: with 4% excess return, 15% volatility and λ = 2, the weight is 0.04 ÷ (2 × 0.0225) ≈ 0.89.',
    { sub: 'Two special portfolios' },
    'The **minimum variance** portfolio is `Σ⁻¹1` (Σ⁻¹ times a list of ones) scaled to sum to 1. It ignores expected returns altogether. The **tangency** or maximum Sharpe portfolio is `Σ⁻¹μ` scaled to sum to 1. The Sharpe ratio, from the quant module, is excess return divided by volatility. The best Sharpe ratio any mix can reach satisfies `S² = μ · Σ⁻¹ · μ`. When the assets are uncorrelated this is the sum of the squares of their own Sharpe ratios, so combining unrelated edges raises the best Sharpe ratio. When the assets are uncorrelated, Σ is diagonal and Σ⁻¹μ is each μi divided by its own variance σi², so a riskier asset needs a much larger expected return to earn the same weight. If you can also hold cash, every efficient portfolio is the tangency portfolio scaled up or down with cash.',

    { h: 'Solving instead of inverting' },
    'Computers rarely form Σ⁻¹ directly. `np.linalg.solve(cov, mu)` finds the x with `Σx = μ`, which is Σ⁻¹μ, more accurately and faster.',
    {
      code: `import numpy as np

mu = np.array([0.04, 0.06, 0.02])
cov = np.array([[0.0225, 0.006, 0.0], [0.006, 0.04, 0.0], [0.0, 0.0, 0.0025]])
raw = np.linalg.solve(cov, mu)
w = raw / raw.sum()
print(w.round(3).tolist(), round(float(np.sqrt(mu @ raw)), 3))`,
      out: '[0.134, 0.12, 0.746] 0.543',
    },
    'The quiet third asset, 5% volatility with a 2% excess return, has the best Sharpe ratio on its own (0.4) and gets three quarters of the weight. The second number is the best Sharpe ratio of the mix, 0.54, above any single asset.',

    { h: 'Why the inputs are the problem' },
    'The formula is exact, but μ and Σ are guesses from history. The average of yearly returns wanders around the true mean by about `σ ÷ √years`, its **standard error**. For an asset with 15% volatility and 25 years of data that is 3%, about as large as the premium you are trying to measure. Covariances are estimated better, because they use every day of data and not only the start and end, but they still carry error.',
    'The optimiser cannot tell signal from noise. It gives the most weight to assets whose returns happened to be overestimated and whose risks happened to be underestimated. Richard Michaud called mean-variance optimisers **estimation-error maximisers** in 1989. In the figure, the true covariance is used and only the means are estimated, and the weights still swing from sample to sample.',

    { h: 'How correlation magnifies small differences' },
    'When two assets are highly correlated, a long position in one and a short in the other has little estimated risk. A small gap in their expected returns then looks like a near riskless profit, and the optimiser bets heavily on it.',
    {
      code: `import numpy as np

s, rho = 0.15, 0.95
cov = np.array([[s * s, rho * s * s], [rho * s * s, s * s]])
for gap in (0.0, 0.005, 0.01):
    raw = np.linalg.solve(cov, np.array([0.05 + gap, 0.05]))
    print(gap, (raw / raw.sum()).round(2).tolist())`,
      out: `0.0 [0.5, 0.5]
0.005 [1.43, -0.43]
0.01 [2.27, -1.27]`,
    },
    'Half a percentage point of difference, far inside the estimation error, turns 50/50 into 143% long and 43% short. On paper the optimal weights are rarely the optimal weights in fact.',

    { h: 'Checking an optimiser before you trust it' },
    {
      list: [
        'Ask how each expected return was set and how wide its standard error is.',
        'Look at the largest longs and shorts; long-short pairs of near-identical assets are the classic sign of error maximisation.',
        'Nudge one input by a small amount, or drop a year of data, and see how far the weights move.',
        'Compare out of sample, on data the optimiser never saw, with equal weight and other simple rules.',
        'Count the turnover: unstable weights mean trading every month, and trading costs money.',
      ],
    },
  ],

  'portfolio-shrink': [
    { h: 'Pulling estimates towards something stable' },
    'The last lesson ended with an optimiser that turns noise into large bets. The fixes all share one idea: give the optimiser less freedom to act on noise. **Shrinkage** does it by blending each noisy estimate with a simple, stable one. **Constraints** do it by forbidding extreme weights. **Simple baselines** do it by estimating as little as possible.',

    { h: 'The shrinkage formula' },
    { sub: 'A blend of sample and target' },
    'The shrunk covariance is `δ·F + (1 − δ)·S`. S is the **sample covariance** from `np.cov`. F is the **target**, a simpler matrix with far fewer free numbers. δ (delta), the **shrinkage intensity**, between 0 and 1, sets how far you pull: 0 keeps the sample, 1 uses only the target. Each entry is blended separately, so a sample covariance of 0.010 with a target of 0.004 and δ = 0.5 becomes 0.007.',
    { sub: 'Choosing the target' },
    "A common target is **constant correlation**: keep each asset's own variance, but replace every correlation by the average of all the off-diagonal correlations, called r̄. Variances are estimated well, so they stay; correlations are noisy, so they are pulled together. Another target is a scaled **identity matrix**, which treats all assets as equally risky and unrelated.",
    { sub: 'Choosing δ' },
    "Ledoit and Wolf (2004) derived the δ that minimises the expected error of the blend, estimated from the data itself. In Python, scikit-learn has `sklearn.covariance.LedoitWolf`, which shrinks towards a scaled identity. That library is not available in this course's browser exercises, so you will build the constant correlation version by hand and pick δ yourself; values from 0.2 to 0.5 are common.",

    { h: 'Building the constant correlation target' },
    'The average correlation must leave out the diagonal, which is all 1s. Sum the whole correlation matrix, subtract the n ones, and divide by the n(n − 1) off-diagonal entries.',
    {
      code: `import numpy as np

S = np.array([[0.04, 0.018, 0.002],
              [0.018, 0.0225, 0.003],
              [0.002, 0.003, 0.01]])
vol = np.sqrt(np.diag(S))
corr = S / np.outer(vol, vol)
n = len(vol)
rbar = (corr.sum() - n) / (n * (n - 1))
print(corr.round(2)[0].tolist(), round(float(rbar), 3))`,
      out: '[1.0, 0.6, 0.1] 0.3',
    },
    'The target then has `rbar × σi × σj` off the diagonal and the sample variances on it. `np.fill_diagonal(F, np.diag(S))` puts them back.',

    { h: 'When there is too little data' },
    'A covariance estimated from T days can describe at most T − 1 independent directions: its **rank**, the number of directions with non-zero variance, is at most T − 1. If you have more assets than days, the matrix is **singular**. Some combination of assets appears to have zero risk, and a minimum variance optimiser will find it and pile in.',
    {
      code: `import numpy as np

rng = np.random.default_rng(1)
for T in (20, 40, 80):
    R = rng.normal(0, 0.01, (T, 40))
    print(T, np.linalg.matrix_rank(np.cov(R, rowvar=False)))`,
      out: `20 19
40 39
80 40`,
    },
    'Forty assets need more than 40 days before the matrix is full rank. Even then the smallest directions are underestimated, so a minimum variance portfolio built on the raw sample **promises** less risk than it **delivers** on new data. Shrinkage adds variance back in every direction and narrows that gap.',

    { h: 'Constraints and simple baselines' },
    { sub: 'Constraints act like shrinkage' },
    'A rule of no short positions, or a cap of, say, 20% per asset, stops the optimiser from building the extreme long-short pairs that error creates. Jagannathan and Ma (2003) showed that a no-short constraint on minimum variance has much the same effect as shrinking the largest covariances. A constrained portfolio looks a little worse on the data it was fitted to and often better on new data.',
    { sub: 'Equal weight and inverse volatility' },
    '**Equal weight**, 1/N in each of N assets, estimates nothing. **Inverse volatility**, `wi ∝ 1/σi` (each weight proportional to one over the volatility, then scaled to sum to 1), needs only volatilities. With volatilities of 10% and 30% the raw weights are 10 and 3.3, so 75% and 25%. DeMiguel, Garlappi and Uppal (2009) compared 14 optimised rules with 1/N on seven data sets and found none beat it consistently out of sample. Counting parameters shows why: an optimiser for n assets needs n means plus n(n + 1)/2 covariances.',

    { h: 'Choosing a method in practice' },
    {
      list: [
        'Start from equal weight and inverse volatility, and make every other method beat them.',
        'Prefer minimum variance or risk parity on a shrunk matrix over anything that needs expected returns.',
        'Add caps and a no-short rule unless you have a reason not to.',
        'Judge on data the method did not see, after costs. Volatility differences are measurable; small Sharpe differences over a few years are noise.',
      ],
    },
  ],

  'portfolio-riskparity': [
    { h: 'Capital is not risk' },
    'A portfolio described as 60% stocks and 40% bonds sounds balanced. In risk terms it is not: stocks are roughly two to three times as volatile as high-grade bonds, and variance grows with the square of volatility. Nearly all the ups and downs of such a book come from its stocks. To see this you need a way to split the risk of the book among its holdings.',

    { h: 'Risk contributions' },
    { sub: 'The formula' },
    'The **risk contribution** of asset i is `RCi = wi × (Σw)i ÷ σp`, where `(Σw)i` is entry i of the matrix Σ multiplied by the weights, and σp the portfolio volatility. The contributions add up exactly to σp. Divide each by σp instead of using it as is, which means dividing `wi × (Σw)i` by the variance σp², and you get **risk shares** that add up to 1.',
    {
      code: `import numpy as np

vol = np.array([0.18, 0.05])
cov = np.diag(vol ** 2)            # uncorrelated, to keep it simple
w = np.array([0.5, 0.5])
var = w @ cov @ w
rc = w * (cov @ w) / np.sqrt(var)  # contributions in volatility units
print(rc.round(4).tolist(), round(float(rc.sum()), 4), round(float(np.sqrt(var)), 4))
print((w * (cov @ w) / var).round(3).tolist())`,
      out: `[0.0867, 0.0067] 0.0934 0.0934
[0.928, 0.072]`,
    },
    'The first line shows the contributions in volatility units adding up to the portfolio volatility. The second shows the shares: half the capital, 93% of the risk.',
    { sub: 'Reading the shares' },
    'With uncorrelated assets the share of asset i is `wi²σi² ÷ σp²`. A share can be negative when an asset moves against the rest: it is then a hedge that lowers total risk. Risk reports by holding, by sector or by factor are all this calculation.',

    { h: 'Risk parity' },
    { sub: 'Equal risk contributions' },
    '**Risk parity** chooses weights so each asset brings the same share of risk, called **equal risk contribution** (ERC). It needs volatilities and correlations but no expected returns, which avoids the noisiest input. For two assets the answer is inverse volatility whatever the correlation: the asset with a third of the volatility gets three times the weight.',
    { sub: 'Solving for more assets' },
    "With three or more assets there is no closed formula. A simple method adjusts one weight at a time. Holding the others fixed, asset i's contribution `wi × (Σw)i` is a quadratic in wi, `Σii·wi² + a·wi`, where `a` is the part of `(Σw)i` from the other assets. Setting it equal to 1/n and taking the positive root gives the new wi. Repeating passes over all assets settles them together.",
    {
      code: `import numpy as np

vol = np.array([0.15, 0.05, 0.20])
corr = np.array([[1.0, 0.2, 0.4], [0.2, 1.0, 0.1], [0.4, 0.1, 1.0]])
cov = corr * np.outer(vol, vol)
n = 3
w = np.ones(n) / n
for _ in range(100):
    for i in range(n):
        a = cov[i] @ w - cov[i, i] * w[i]
        w[i] = (-a + np.sqrt(a * a + 4 * cov[i, i] / n)) / (2 * cov[i, i])
w = w / w.sum()
rc = w * (cov @ w)
print(w.round(3).tolist(), (rc / rc.sum()).round(3).tolist())`,
      out: '[0.192, 0.657, 0.151] [0.333, 0.333, 0.333]',
    },
    'Bridgewater launched its All Weather fund on balanced-risk lines in 1996, and Edward Qian of PanAgora is credited with coining the name "risk parity" in the mid 2000s.',

    { h: 'Leverage to a risk budget' },
    'Leaning on quiet assets makes a risk parity book quiet: often 4% to 6% volatility. To reach a **risk budget** such as 10%, it borrows: `leverage L = target ÷ σp`. Borrowing costs money. The levered expected return is `L × rp − (L − 1) × borrowing rate`. With rp = 5%, L = 1.5 and a 4% borrowing rate that is 7.5% − 2% = 5.5%: risk rose by half, return by a tenth. Leverage magnifies losses as well, and futures, the usual tool, carry the borrowing cost inside their price.',
    '**Volatility targeting**, from the quant module, sets L from a forecast of volatility made with past data only, and adds a cap. The cap matters most after a calm spell, when the forecast is low and leverage would otherwise be at its highest shortly before a shock.',

    { h: 'When correlations change' },
    'Risk parity balances the risks you estimated. If stocks and bonds start moving together, the same weights carry more risk and the shares drift apart. In 2022 inflation and rising interest rates hit both: the S&P 500 lost 18.1% including dividends and the Bloomberg US Aggregate bond index lost 13.0%, its worst calendar year since it began in 1976. Levered bond positions made the loss larger, and many risk parity funds had a bad year.',
    {
      list: [
        'Balancing capital and calling it balanced risk.',
        'Dividing contributions by σp and calling them shares, or the reverse.',
        'Forgetting the cost of leverage, and that it rises with interest rates.',
        'Re-solving weights from a window that includes the days being traded.',
      ],
    },
  ],

  'portfolio-kelly': [
    { h: 'From a coin flip to a strategy' },
    'The risk module introduced the **Kelly fraction**: for a bet with win probability p that pays b to 1, staking `p − (1 − p) ÷ b` of your capital makes your money grow fastest over many bets. It assumes known odds and bets one after another. A trading strategy is closer to a stream of small, continuous returns with an average and a spread. The same idea, maximum long-run growth, gives a formula for how much leverage to run.',

    { h: 'Growth with leverage' },
    { sub: 'The growth formula' },
    "Let μ be the strategy's expected excess return a year and σ its volatility. Held at **leverage** f (f = 2 means $2 of exposure for each $1 of capital) and rebalanced often, the expected log growth of your capital above cash is about `g(f) = f·μ − f²σ²/2`. The first term is the return you lever up. The second is **volatility drag**, from the quant module: compounding loses about half the variance each period, and the variance of a levered position grows with f².",
    { sub: 'Finding the top' },
    'The curve is a hill. Its top is where the slope `μ − f·σ²` is zero, at `f* = μ ÷ σ²`, the **continuous Kelly leverage**. Putting f* back in gives the best growth, `μ² ÷ (2σ²)`, which is `S²/2` with S = μ/σ the Sharpe ratio.',
    {
      code: `mu, sigma = 0.04, 0.10
for f in (1, 2, 4, 6, 7):
    g = f * mu - (f * sigma) ** 2 / 2
    print(f, round(g, 3))`,
      out: `1 0.035
2 0.06
4 0.08
6 0.06
7 0.035`,
    },
    'Kelly here is 0.04 ÷ 0.01 = 4 times capital, with growth 8% a year above cash (S = 0.4, and 0.4² ÷ 2 = 0.08). Two times and six times leverage grow at the same rate, but six times carries three times the volatility.',

    { h: 'Fractions of Kelly' },
    'Running a fraction c of Kelly gives growth `S² × (c − c²/2)`, so the share of the best growth you keep is `(c − c²/2) ÷ 0.5`. Volatility is c times the Kelly volatility. Past c = 2 the growth turns negative: every trade still has a positive expected return, and the account shrinks anyway because of drag.',
    {
      code: `for c in (0.25, 0.5, 1.0, 2.0):
    keep = (c - c * c / 2) / 0.5
    print(c, round(keep, 2), round(0.7 ** (2 / c - 1), 3))`,
      out: `0.25 0.44 0.082
0.5 0.75 0.343
1.0 1.0 0.7
2.0 0.0 1.0`,
    },
    'The second column is the share of the best growth kept. The third is explained next.',

    { h: 'How deep the drawdowns go' },
    'For a strategy with these smooth, known returns there is a clean result: the chance that your wealth ever falls to a fraction x of its current level is `x^(2/c − 1)`. The third column above uses x = 0.7, a 30% fall: at full Kelly a 70% chance it happens at some point, at a quarter Kelly about 8%. At full Kelly the chance of ever losing half is one in two. Few people can sit through that, and a strategy you abandon in a drawdown never earns its long-run growth.',

    { h: 'Kelly with several assets' },
    'For several assets the growth is `w · μ − w · Σ · w / 2` and its maximum is at `f = Σ⁻¹μ`. That is the mean-variance portfolio of the frontier lesson with λ = 1. The weights are not scaled to sum to 1: Kelly says how much to hold in total.',
    {
      code: `import numpy as np

mu = np.array([0.04, 0.02])
cov = np.array([[0.04, 0.006], [0.006, 0.0144]])
f = np.linalg.solve(cov, mu)
print(f.round(2).tolist(), round(float(f.sum()), 2))`,
      out: '[0.84, 1.04] 1.88',
    },

    { h: 'When the inputs are wrong' },
    { sub: 'Overestimating the edge' },
    'Every input to Kelly is an estimate. If your backtest Sharpe ratio is k times the true one, your "Kelly" leverage is k times the true Kelly. A backtest that doubles the true Sharpe ratio, easy after a short sample or some fitting, puts you at twice Kelly and zero growth. The hill is flat near the top and steep beyond it, so betting too little costs little and betting too much costs a lot.',
    { sub: 'What the formula assumes' },
    {
      list: [
        'μ and σ are known and do not change.',
        'Returns are smooth: no gaps, jumps or limit moves.',
        'You can rebalance continuously, at no cost.',
        'You care only about long-run growth, not about the path.',
      ],
    },
    'None holds in markets. A strategy that sells options earns small, steady amounts and loses in rare jumps, so its σ from calm years hides its real risk. Use Kelly as a ceiling, and run a quarter to a half of a cautious estimate.',
  ],

  'portfolio-var': [
    { h: 'Putting one number on a bad day' },
    'Volatility treats gains and losses alike and assumes you care about typical days. Risk managers want to know about the bad days: how much can the book lose, and how often. Several measures answer different versions of that question, and each has blind spots.',

    { h: 'Value at risk' },
    { sub: 'The definition' },
    '**Value at risk** (VaR) at confidence level α over a horizon is the loss that is exceeded with probability 1 − α. A 1-day 99% VaR of $50,000 means that on about 1 day in 100 the loss should be larger than $50,000. J.P. Morgan made the measure standard when it published its RiskMetrics method in 1994. VaR is reported as a positive number, a loss.',
    { sub: 'Parametric VaR' },
    '**Parametric** VaR assumes returns are normal (the bell curve from the quant module). Then `VaR = z × σ × value`, where σ is the volatility over the horizon and z is the point of the standard normal curve with probability α below it. The standard library gives z through `statistics.NormalDist`.',
    {
      code: `from statistics import NormalDist

for level in (0.95, 0.975, 0.99):
    print(level, round(NormalDist().inv_cdf(level), 3))`,
      out: `0.95 1.645
0.975 1.96
0.99 2.326`,
    },
    { sub: 'Historical VaR' },
    "**Historical** VaR makes no assumption about the shape. Sort past daily returns from worst to best and read the loss at the 1 − α point. With 1,000 days, 99% VaR is near the 10th worst loss. Conventions differ on the exact point: some take the k-th worst with k = n × (1 − α), others interpolate. NumPy's `np.quantile(r, 0.01)` returns the 1% point of the returns r, interpolating between observations. With few observations in the tail, the number is noisy.",

    { h: 'Expected shortfall' },
    'VaR says where the bad days begin, not how bad they are. **Expected shortfall** (ES, also called CVaR) is the average loss on the days beyond VaR. Historically, it is the mean of the k worst returns, with a minus sign. For normal returns there is a formula: `ES = σ × φ(z) ÷ (1 − α)`, where `φ(z) = e^(−z²/2) ÷ √(2π)` is the height of the bell curve at z.',
    {
      code: `from statistics import NormalDist
import math

sigma, value = 0.02, 500_000
z = NormalDist().inv_cdf(0.975)
phi = math.exp(-z * z / 2) / math.sqrt(2 * math.pi)
print(round(z * sigma * value), round(sigma * phi / 0.025 * value))`,
      out: '19600 23378',
    },
    "For a $500,000 book with 2% daily volatility, 97.5% VaR is $19,600 and 97.5% ES is about $23,400. ES is never below VaR at the same level. It is also **subadditive**: the ES of two books combined is never more than the sum of their ES values, so merging books cannot appear to create risk. VaR can fail that test. The Basel Committee's Fundamental Review of the Trading Book, published in 2016 and revised in 2019, moved bank market risk capital from 99% VaR to 97.5% ES (at the time of writing, 2026; adoption dates differ by country).",

    { h: 'Scaling with time' },
    'If daily returns are independent and equally volatile, variance grows in proportion to time, so volatility and VaR grow with its square root: `VaR(h days) ≈ VaR(1 day) × √h`. A 1-day VaR of $10,000 becomes about $22,400 over 5 days. Volatility clusters and losses can follow each other, so treat this as rough.',

    { h: 'Testing a VaR model' },
    "A VaR model makes a testable promise. Count the **exceptions**, the days the loss was larger than that day's VaR. At 99% you expect 1% of days; over 250 days, 2.5. How surprising a given count is comes from the **binomial distribution**: the chance of exactly j exceptions in n days is `comb(n, j) × p^j × (1 − p)^(n − j)`, where `comb(n, j)` counts the ways to choose j days from n.",
    {
      code: `import math

n, p = 500, 0.01
for k in (5, 10, 15):
    tail = sum(math.comb(n, j) * p ** j * (1 - p) ** (n - j) for j in range(k, n + 1))
    print(k, round(tail, 3))`,
      out: `5 0.56
10 0.031
15 0.0`,
    },
    'Over 500 days, 5 or more exceptions is normal for a correct model, 10 or more happens only 3% of the time, and 15 is almost impossible. Bank supervisors use a version of this over 250 days called the **traffic light** test: 0 to 4 exceptions green, 5 to 9 yellow, 10 or more red (rules at the time of writing; check the current ones). Too few exceptions is also a finding: the model may overstate risk.',

    { h: 'Stress tests and drawdown' },
    { sub: 'Stress tests' },
    "VaR and ES learn from the past. A **stress test** instead applies a chosen shock to today's positions and adds up the result. A stock position moves by roughly its beta (its sensitivity to the index, from the qalpha module) times the index move: $300,000 of stocks with beta 0.9 in a 25% index fall loses about $67,500. Scenarios should include moves the sample lacks, and combinations that calm data say are unlikely, such as stocks and bonds falling together. Options must be repriced in the scenario, not estimated from their delta.",
    { sub: 'Drawdown' },
    '**Drawdown**, from the risk module, is the fall of compounded wealth from its running peak. It measures the path: a string of moderate losses can produce a drawdown far larger than any single day.',
    {
      code: `import numpy as np

r = np.array([0.02, -0.05, 0.01, -0.03, 0.04, -0.02])
wealth = np.cumprod(1 + r)
peak = np.maximum.accumulate(wealth)
dd = 1 - wealth / peak
print(dd.round(4).tolist(), round(float(dd.max()), 4))`,
      out: '[0.0, 0.05, 0.0405, 0.0693, 0.0321, 0.0514] 0.0693',
    },

    { h: 'What each measure misses' },
    {
      list: [
        'VaR ignores the size of losses beyond it. A book that sells far out of the money options can lose rarely and heavily and show a small VaR.',
        'ES and VaR both assume the sample contains the kind of day that will hurt you.',
        'Stress tests say what a scenario costs, not how likely it is.',
        'Drawdown is known only after it has happened.',
        'All of them are about the book as it stands today; a book that changes fast needs them recomputed.',
      ],
    },
  ],

  'portfolio-factors': [
    { h: 'Most risk is shared' },
    "On a day the market falls 3%, most stocks fall. Some of each stock's movement comes from forces that hit many stocks at once, and some is its own. A **risk model** separates the two. That makes the covariance matrix far easier to estimate, shows what a book is really betting on, and tells you how to hedge.",

    { h: 'Factor models' },
    { sub: 'One factor' },
    "The simplest model has one **factor**, the market: `ri = βi·rm + εi`. Here rm is the market return, βi (beta) the stock's sensitivity to it, which the qalpha module estimated by regression, and εi the **idiosyncratic** part, the stock's own move, assumed unrelated across stocks. Under this model the covariance of two stocks is `βi·βj·σm²` and the variance of one is `βi²·σm² + σεi²`.",
    { sub: 'Many factors' },
    'With k factors (the market, sectors, value, momentum, size and so on) the model is `r = B·f + ε`, where B is an n × k table of exposures. The covariance matrix becomes `Σ = B·F·Bᵀ + D`: F is the k × k covariance of the factors, Bᵀ is B transposed (rows and columns swapped), and D is a diagonal matrix of idiosyncratic variances. In NumPy, D is `np.diag(d)` for a vector d. Adding the plain vector d to a matrix instead would **broadcast** it, adding d to every row, so it would land off the diagonal too, with no error raised.',
    {
      code: `import numpy as np

B = np.array([[1.0, 0.5], [1.2, -0.3], [0.8, 0.0]])   # 3 stocks, 2 factors
F = np.diag([0.03, 0.01])
d = np.array([0.04, 0.05, 0.02])
C = B @ F @ B.T + np.diag(d)
print(C.round(4).tolist())
print(round(float(np.linalg.eigvalsh(C).min()), 4))`,
      out: `[[0.0725, 0.0345, 0.024], [0.0345, 0.0941, 0.0288], [0.024, 0.0288, 0.0392]]
0.0243`,
    },
    { sub: 'Why it helps' },
    "The model needs n × k exposures, k(k + 1)/2 factor covariances and n idiosyncratic variances. For 200 stocks and 5 factors that is 1,000 + 15 + 200 = 1,215 numbers instead of 20,100. And because D is positive, the matrix is always valid: the smallest eigenvalue above is positive. Commercial risk models, such as MSCI's Barra models, are this idea with many carefully built factors.",

    { h: 'Exposure and its two kinds of risk' },
    'Exposures add up by weight. The **portfolio beta** is `βp = Σ wi·βi`. Under the one-factor model the book variance splits into **systematic** risk, `βp²·σm²`, which no amount of stock picking removes, and idiosyncratic risk, `Σ wi²·σεi²`, which shrinks as you spread across more names.',
    {
      code: `import numpy as np

beta = np.array([0.9, 1.1, 1.4, 0.6])
w = np.array([0.25, 0.25, 0.25, 0.25])
idio = np.array([0.20, 0.25, 0.35, 0.15])
sm = 0.18
bp = w @ beta
sys_var, idio_var = bp ** 2 * sm ** 2, np.sum(w ** 2 * idio ** 2)
print(round(float(bp), 3), round(float(sys_var), 4), round(float(idio_var), 4))`,
      out: '1.0 0.0324 0.0155',
    },
    'Four stocks, each mostly idiosyncratic on its own, and still two thirds of the book variance is the market.',

    { h: 'Hedging the market out' },
    { sub: 'Sizing the hedge' },
    'A **beta hedge** sells enough of an index to cancel the market exposure: `βp × book value` in dollars. A $500,000 book with beta 1.2 needs $600,000 of index short; with SPY at a made-up $500 that is 1,200 shares. Dollar neutral (equal dollars long and short) is not the same as beta neutral when the two sides have different betas.',
    { sub: 'What a hedge leaves' },
    'The hedge removes the market factor, and only as well as β was estimated. Betas drift, and many stocks show higher betas in sell-offs than in calm data. Idiosyncratic risk and other factors (a sector tilt, a value or momentum tilt) remain. A hedged book is smaller in risk, not free of it.',

    { h: 'Concentration' },
    'A book of 30 names can still be a few bets. The **effective number of positions** is `1 ÷ Σ wi²`, the inverse of the **Herfindahl index** Σ wi². Ten equal weights give 10. Weights of 50%, 25% and 25% give 1 ÷ 0.375 ≈ 2.7. Risk shares by name, sector and factor, from the risk parity lesson, show concentration in risk terms, which also counts correlation.',

    { h: 'Correlations in a crisis' },
    'Under the one-factor model the correlation of two beta-1 stocks is `σm² ÷ (σm² + σε²)`: the shared variance over the total. When the market gets louder, that ratio rises even though nothing about the firms changed.',
    {
      code: `for sm in (0.12, 0.20, 0.35):
    print(sm, round(sm ** 2 / (sm ** 2 + 0.3 ** 2), 2))`,
      out: `0.12 0.14
0.2 0.31
0.35 0.58`,
    },
    'This is what "correlations go to one" means in practice, and why diversification measured in calm months is overstated for the months that matter. Links between strategies can also be hidden from any correlation matrix: many funds holding the same trades must all sell at once. Long-Term Capital Management lost about $4.6 billion in 1998 when trades that looked unrelated fell together, and quant equity funds suffered the same way in August 2007, as the statarb module described.',
  ],

  'portfolio-lab': [
    { h: 'What the lab builds' },
    'The lab turns the module into one tool that compares four ways of weighting a portfolio on equal terms. The data are six made-up assets from a one-factor model with a fixed seed, so every run gives the same numbers: three stock-like assets with betas near 1, two quiet bond-like assets and one in between. Because you wrote the model, you know what is true, and you can check that the tool finds it.',

    { h: 'Walk-forward testing' },
    { sub: 'Windows and rebalance dates' },
    'A **walk-forward** test steps through time as a trader would. On each **rebalance date** t you estimate from a **window** of the days before t, set weights, hold them for the next step of days, then move on. With a 250-day window (about a year) and a 21-day step (about a month), the schedule looks like this:',
    {
      code: `window, step, T = 250, 21, 400
for t in range(window, T, step):
    print(t, (t - window, t - 1), (t, min(t + step, T) - 1))`,
      out: `250 (0, 249) (250, 270)
271 (21, 270) (271, 291)
292 (42, 291) (292, 312)
313 (63, 312) (313, 333)
334 (84, 333) (334, 354)
355 (105, 354) (355, 375)
376 (126, 375) (376, 396)
397 (147, 396) (397, 399)`,
    },
    'Each line is a rebalance date, the days used to estimate, and the days traded. The estimation days always end the day before trading starts. In Python, the slice `R[t - window:t]` gives exactly those rows, because a slice stops before its end index.',
    { sub: 'Look-ahead' },
    '**Look-ahead** is using data you could not have had. A slice that ends at t + 1 or later lets the estimate see the days it is judged on. In a risk estimate the effect is often small, which makes it easy to miss and still always flattering.',

    { h: 'Estimating and weighting' },
    "Each window gives a sample covariance, shrunk towards the constant correlation target with a chosen δ. Four rules turn it into weights: equal weight (no estimates), inverse volatility (the diagonal only), minimum variance (`Σ⁻¹1` scaled to sum to 1) and equal risk contribution (the one-weight-at-a-time loop). The daily return of the book is the weights times that day's asset returns, `R[day] @ w`. Holding fixed weights each day is a simplification: real weights drift as prices move, and each rebalance costs money the loop leaves out.",

    { h: 'Targeting volatility' },
    "Methods that lean on quiet assets give quiet books. To compare them at the same risk, scale each day's return by `min(cap, target ÷ forecast)`, with the forecast the standard deviation of the previous `lookback` days of book returns, times √252. The forecast for day i must stop at day i − 1. The cap limits leverage when the forecast is low; when it binds, the book runs below target, and that is a choice you make on purpose.",

    { h: 'Measuring the result' },
    { sub: 'Four numbers' },
    {
      list: [
        'Annual return: the mean daily return × 252.',
        'Annual volatility: the daily standard deviation (`ddof=1`) × √252.',
        'Sharpe ratio: annual return ÷ annual volatility; the made-up returns stand for excess returns, so no cash rate is subtracted.',
        'Maximum drawdown: the largest fall of `np.cumprod(1 + r)` below its running peak `np.maximum.accumulate`, as a fraction.',
      ],
    },
    { sub: 'How sure you can be' },
    'The standard error of a yearly Sharpe ratio is about `1 ÷ √years`. A few years cannot separate methods whose Sharpe ratios differ by a few tenths.',
    {
      code: `import math

for years in (2, 5, 20):
    print(years, round(1 / math.sqrt(years), 2))`,
      out: `2 0.71
5 0.45
20 0.22`,
    },

    { h: 'Reading the comparison honestly' },
    'Volatility is predictable from the past, so differences in realised volatility between methods are real evidence. Differences in return and Sharpe ratio over a few years are mostly noise. The data came from a model in which quiet assets stay quiet; real ones can change, as bonds did in 2022. Costs, turnover and borrowing for leverage are left out, so every number is an upper bound. Before trusting any result, vary the window, δ, the rebalance frequency and the seed, add costs, and compare against the two baselines.',
  ],
}
