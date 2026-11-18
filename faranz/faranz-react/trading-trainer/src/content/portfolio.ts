import type { Module } from '../types'

export const portfolio: Module = {
  id: 'portfolio',
  title: 'Portfolio construction and risk',
  summary:
    'Turning several positions or strategies into one book: the covariance matrix, mean-variance optimisation and why it misbehaves, shrinkage and simple baselines, risk parity and leverage, Kelly sizing, VaR and expected shortfall, factor exposures and hedging, all in NumPy.',
  lessons: [
    {
      id: 'portfolio-variance',
      title: 'Portfolio mean, variance and the covariance matrix',
      summary: 'How the risk of a book comes from the risks of its parts and how they move together, written as a matrix.',
      widget: 'portfolio-twoasset',
      text: [
        "A portfolio is a set of **weights** w, the fraction of capital in each asset (negative for a short). Its expected return is the weighted sum `w · μ`, because simple returns add across assets. Its risk is not a weighted sum. For two assets, `σp² = w1²σ1² + w2²σ2² + 2·w1·w2·ρ·σ1·σ2`, where ρ is their correlation. The last term is where diversification lives: below ρ = 1, the mix is less risky than the average of its parts.",
        'For n assets the same sum is written with the **covariance matrix** Σ: the variances σi² on the diagonal, the covariances `ρij·σi·σj` off it. Then `σp² = w · Σ · w`, in NumPy `w @ cov @ w`. You build Σ from volatilities and a correlation matrix with `corr * np.outer(vol, vol)`, or estimate it from a T × n array of returns with `np.cov(R, rowvar=False)`. Daily covariances times 252 give annual ones.',
        { code: `import numpy as np

vol = np.array([0.20, 0.10])
corr = np.array([[1.0, 0.3], [0.3, 1.0]])
cov = corr * np.outer(vol, vol)
w = np.array([0.5, 0.5])
print(round(float(np.sqrt(w @ cov @ w)), 4))   # 0.1245, below the 0.15 average` },
        'With two assets you can find the mix with the least risk by hand: `w1 = (σ2² − ρσ1σ2) ÷ (σ1² + σ2² − 2ρσ1σ2)`. At ρ = −1 that mix has no risk at all; at ρ = 1 there is no diversification and the least risky long-only choice is all in the quieter asset.',
        'A covariance matrix has to be internally consistent: no portfolio can have negative variance, so every **eigenvalue** must be zero or positive (the matrix is **positive semi-definite**). Correlations estimated pair by pair over different dates, or typed in by hand, can break this. Check with `np.linalg.eigvalsh`. The matrix also grows fast: n assets need n(n + 1)/2 numbers, 125,250 for 500 stocks, each one estimated with error. Later lessons deal with that.',
      ],
      rules: [
        'Portfolio return = w · μ. Portfolio variance = w · Σ · w.',
        'Two assets: σp² = w1²σ1² + w2²σ2² + 2w1w2ρσ1σ2. Diversification comes from ρ < 1.',
        'Σ = corr × outer(vol, vol). From returns: np.cov(R, rowvar=False), columns are assets.',
        'Annualise daily variances and covariances by × 252, volatilities by × √252.',
        'A valid Σ has no negative eigenvalues. Check before you optimise on it.',
        'n assets need n(n + 1)/2 estimates. Every one carries error.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'portfolio-variance-1',
          ask: 'Half your capital is in an asset with 20% volatility and half in one with 10% volatility. Their correlation is 0. What is the volatility of the portfolio? Give a percentage to one decimal, for example 12.3%.',
          answer: 0.112,
          tol: 0.0006,
          check: 'math.sqrt(0.25 * 0.04 + 0.25 * 0.01)',
          why: 'σp² = 0.25 × 0.04 + 0.25 × 0.01 = 0.0125, so σp ≈ 11.2%. The average of the two volatilities is 15%; with no correlation the mix is well below it.',
        },
        {
          kind: 'number',
          id: 'portfolio-variance-2',
          ask: 'Asset A expects 8% a year and asset B 3%. You hold 130% of capital in A and −30% in B (a short, paid for by the cash it raises). What is the expected return of the portfolio? Give a percentage to one decimal, for example 12.3%.',
          answer: 0.095,
          tol: 0.0006,
          check: '1.3 * 0.08 - 0.3 * 0.03',
          why: '1.3 × 8% − 0.3 × 3% = 10.4% − 0.9% = 9.5%. Weights that sum to 1 can include shorts; the return is still the weighted sum. The risk of this book is higher than A alone if B moves with A, because you are short it and long more A.',
        },
        {
          kind: 'number',
          id: 'portfolio-variance-3',
          ask: 'Two assets with volatilities 20% and 10% and correlation 0. What weight in the 20% asset gives the lowest portfolio volatility? Give a decimal.',
          answer: 0.2,
          check: '(0.01 - 0) / (0.04 + 0.01 - 0)',
          why: 'w1 = σ2² ÷ (σ1² + σ2²) = 0.01 ÷ 0.05 = 0.2. With no correlation, each asset is held in inverse proportion to its variance, so the riskier one still gets a fifth: a little of it lowers risk.',
        },
        {
          kind: 'number',
          id: 'portfolio-variance-4',
          ask: 'You want a full covariance matrix for 100 stocks. How many separate numbers (variances and distinct covariances) must you estimate?',
          answer: 5050,
          tol: 0.5,
          check: '100 * 101 / 2',
          why: '100 variances plus 100 × 99 ÷ 2 = 4,950 covariances: 5,050. Two years of daily data is about 500 rows per stock, so each number rests on thin evidence. That is the root of the optimiser problems in the next two lessons.',
        },
        {
          kind: 'output',
          id: 'portfolio-variance-5',
          ask: 'Turning a covariance matrix back into correlations. What does this print?',
          code: `import numpy as np

cov = np.array([[0.04, 0.006], [0.006, 0.01]])
vol = np.sqrt(np.diag(cov))
corr = cov / np.outer(vol, vol)
print(vol.round(2).tolist(), round(float(corr[0, 1]), 2))`,
          answer: '[0.2, 0.1] 0.3',
          why: 'The diagonal holds variances, so their square roots are the volatilities, 20% and 10%. The covariance 0.006 divided by 0.2 × 0.1 = 0.02 gives a correlation of 0.3.',
        },
        {
          kind: 'bug',
          id: 'portfolio-variance-6',
          ask: 'R holds 250 days of returns for 4 assets, one column per asset (shape 250 × 4). This should print the shape of their covariance matrix, (4, 4), but prints (250, 250).',
          code: `import numpy as np

rng = np.random.default_rng(0)
R = rng.normal(0, 0.01, (250, 4))
cov = np.cov(R)
print(cov.shape)`,
          line: 5,
          fix: 'cov = np.cov(R, rowvar=False)',
          why: '`np.cov` treats each row as a variable by default, so it returned the covariance between 250 days. `rowvar=False` says the columns are the variables. Checking the shape is the cheapest test there is.',
        },
        {
          kind: 'output',
          id: 'portfolio-variance-7',
          ask: 'Someone typed in this correlation matrix by hand: A and B move together, A and C move together, but B and C move against each other. What does this print?',
          code: `import numpy as np

corr = np.array([[1.0, 0.9, 0.9],
                 [0.9, 1.0, -0.9],
                 [0.9, -0.9, 1.0]])
print(round(float(np.linalg.eigvalsh(corr).min()), 2))`,
          answer: '-0.8',
          why: 'A negative eigenvalue means some portfolio would have negative variance, which is impossible. If A tracks B and A tracks C closely, B and C cannot move strongly against each other. An optimiser fed this matrix will find that impossible portfolio and pile into it.',
        },
        {
          kind: 'choice',
          id: 'portfolio-variance-8',
          ask: 'In the figure, set the correlation to −1, then to +1. Where is the least risky mix in each case?',
          options: [
            'At −1, a mix of about one third in A has zero volatility; at +1, the least risky choice is all in B',
            'At both settings, 50/50 is the least risky mix',
            'At −1, all in B; at +1, a mix with zero volatility',
            'Correlation moves the curve up and down but not left and right',
          ],
          answer: 0,
          why: 'At ρ = −1 the two move in perfect opposition, and holding them in inverse proportion to their volatilities, σB ÷ (σA + σB) = 10 ÷ 30 in A, cancels all risk. At ρ = +1 they are one bet at two sizes, so the quieter asset alone is the least risky long-only choice. Real assets sit in between, and nearer +1 than you would like.',
        },
        {
          kind: 'write',
          id: 'portfolio-variance-9',
          numpy: true,
          ask: 'Write `port_vol(w, vol, corr)`: build the covariance matrix from the volatilities and the correlation matrix, and return the portfolio volatility `√(w · Σ · w)` as a float.',
          starter: `import numpy as np

def port_vol(w, vol, corr):
    w, vol, corr = np.asarray(w, float), np.asarray(vol, float), np.asarray(corr, float)
    pass`,
          solution: `import numpy as np

def port_vol(w, vol, corr):
    w, vol, corr = np.asarray(w, float), np.asarray(vol, float), np.asarray(corr, float)
    cov = corr * np.outer(vol, vol)
    return float(np.sqrt(w @ cov @ w))`,
          tests: `out = port_vol([0.5, 0.5], [0.2, 0.1], [[1, 0], [0, 1]])
assert out is not None, "the function returns nothing yet"
assert abs(out - 0.0125 ** 0.5) < 1e-9, f"50/50 of 20% and 10% vol, uncorrelated: about 0.1118, got {out}"
assert abs(port_vol([0.6, 0.4], [0.2, 0.15], [[1, 1], [1, 1]]) - 0.18) < 1e-9, "with correlation 1 the volatility is the weighted average, 0.18"
assert abs(port_vol([1, 1], [0.1, 0.1], [[1, -1], [-1, 1]])) < 1e-9, "equal holdings with correlation -1 cancel: 0"
c = [[1, 0.3, 0.1], [0.3, 1, 0.5], [0.1, 0.5, 1]]
w = np.array([0.2, 0.5, 0.3]); v = np.array([0.25, 0.15, 0.3])
assert abs(port_vol(w, v, c) - np.sqrt(w @ (np.array(c) * np.outer(v, v)) @ w)) < 1e-12, "three assets: use corr * outer(vol, vol)"`,
          why: 'Two lines carry the whole lesson: the covariance matrix from volatilities and correlations, and the quadratic form `w @ cov @ w`. Every risk number in this module is built on them.',
        },
        {
          kind: 'write',
          id: 'portfolio-variance-10',
          numpy: true,
          ask: 'Write `min_var_two(s1, s2, rho)`: the weight in asset 1 that gives the lowest volatility for two assets with volatilities s1 and s2 and correlation rho, using `w1 = (s2² − rho·s1·s2) ÷ (s1² + s2² − 2·rho·s1·s2)`.',
          starter: `def min_var_two(s1, s2, rho):
    pass`,
          solution: `def min_var_two(s1, s2, rho):
    c = rho * s1 * s2
    return (s2 ** 2 - c) / (s1 ** 2 + s2 ** 2 - 2 * c)`,
          tests: `import numpy as np
out = min_var_two(0.2, 0.1, 0.0)
assert out is not None, "the function returns nothing yet"
assert abs(out - 0.2) < 1e-12, f"20% and 10% vol, uncorrelated: 0.2 in the first, got {out}"
assert abs(min_var_two(0.2, 0.1, -1.0) - 1 / 3) < 1e-12, "at rho = -1 the weight is s2 / (s1 + s2)"
assert abs(min_var_two(0.15, 0.15, 0.4) - 0.5) < 1e-12, "equal volatilities: 50/50 whatever the correlation"
w = np.linspace(-1, 2, 30001)
v = (w * 0.25) ** 2 + ((1 - w) * 0.12) ** 2 + 2 * w * (1 - w) * 0.6 * 0.25 * 0.12
assert abs(min_var_two(0.25, 0.12, 0.6) - w[v.argmin()]) < 1e-3, "the weight must minimise the variance found by a grid search"`,
          why: 'The formula comes from setting the derivative of the two-asset variance to zero. At high correlation the weight in the riskier asset can go negative: the minimum-risk portfolio shorts it to hedge the other.',
        },
        {
          kind: 'design',
          id: 'portfolio-variance-11',
          ask: 'A trader says their book is diversified: eight long positions in large US technology stocks plus calls on QQQ, sized equally. Plan how you would check that claim with numbers.',
          checklist: [
            { point: 'Estimate the correlation matrix from daily returns over a recent window', why: 'Stocks in one sector often have pairwise correlations of 0.5 or more, which caps diversification.' },
            { point: 'Compute the portfolio volatility as √(w · Σ · w) and compare it with the average single-name volatility', why: 'If the two are close, the book is close to one bet.' },
            { point: 'Convert the calls to their delta in shares of QQQ before adding them', why: 'An option counts for its exposure, not for its premium.' },
            { point: 'Check that Σ has no negative eigenvalues', why: 'Gaps or mismatched dates can make an inconsistent matrix.' },
            { point: 'Look at correlations in past sell-offs, not only the average', why: 'Correlations tend to rise exactly when the book falls.' },
            { point: 'State how much of the variance comes from the shared market move', why: "It shows how much a broad index hedge would remove, the subject of this module's factor lesson." },
          ],
          why: 'Counting positions says little; the covariance matrix says how many independent bets there are. A sector book with calls on the sector index is usually one large bet in several pieces.',
        },
      ],
    },
    {
      id: 'portfolio-frontier',
      title: 'Mean-variance optimisation and the efficient frontier',
      summary: 'The optimiser Markowitz described, the portfolios it picks, and why it turns small errors in its inputs into large bets.',
      widget: 'portfolio-optimiser',
      text: [
        'Harry Markowitz framed the question in 1952: among all portfolios, which give the most expected return for each level of risk? The answers form the **efficient frontier**. Anything below it is beaten by a portfolio with the same risk and more return. A common way to pose it is to maximise `w · μ − (λ/2) · w · Σ · w`, where λ is how much you dislike variance. With no constraints the answer is `w = Σ⁻¹μ ÷ λ`.',
        'Two special portfolios come out of the same matrix. The **minimum variance** portfolio, `w ∝ Σ⁻¹1` scaled to sum to 1, needs no expected returns at all. The **tangency** or maximum Sharpe portfolio is `w ∝ Σ⁻¹μ` with μ the expected returns above cash. Its Sharpe ratio squared is `μ · Σ⁻¹ · μ`; for uncorrelated assets that is the sum of the squared single Sharpe ratios. With cash available, every efficient choice is a mix of cash and the tangency portfolio, levered up or down.',
        { code: `import numpy as np

mu = np.array([0.06, 0.03])           # expected excess returns
cov = np.diag([0.04, 0.01])           # 20% and 10% vol, uncorrelated
raw = np.linalg.solve(cov, mu)        # Σ⁻¹μ without forming the inverse
print((raw / raw.sum()).round(3))      # [0.333 0.667]` },
        "The trouble is the inputs. The standard error of an asset's average yearly return is about `σ ÷ √years`: with 20% volatility and 10 years of data it is 6.3%, larger than most risk premiums. Covariances are estimated better but still with error. The optimiser does not know which numbers are noise. It piles into assets whose returns were overestimated and whose risks were underestimated. Michaud (1989) called mean-variance optimisers **estimation-error maximisers**.",
        'Correlation makes it worse. Two assets with 0.9 correlation look like a near-perfect hedge for each other, so a 1% difference in their expected returns can turn a 50/50 split into a large long in one and a short in the other. The optimal weights on paper are rarely the optimal weights in fact, and the next lesson is about taming them.',
      ],
      rules: [
        'Mean-variance: w = Σ⁻¹μ ÷ λ. Tangency: Σ⁻¹μ scaled; minimum variance: Σ⁻¹1 scaled to sum to 1.',
        'Use np.linalg.solve(cov, mu), not an explicit inverse.',
        'Max Sharpe² = μ · Σ⁻¹ · μ. Uncorrelated assets: √(S1² + S2² + …).',
        'Standard error of a mean yearly return ≈ σ ÷ √years. Expected returns are the noisiest input.',
        'High correlation plus small differences in μ gives large long-short bets.',
        'Optimal on the sample is not optimal out of sample.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'portfolio-frontier-1',
          ask: 'Two uncorrelated assets: A expects 8% above cash with 20% volatility, B 2% above cash with 10% volatility. The tangency weights are proportional to μi ÷ σi². What fraction of the tangency portfolio is in A? Give a decimal to 2 places.',
          answer: 0.5,
          tol: 0.006,
          check: '(0.08 / 0.04) / (0.08 / 0.04 + 0.02 / 0.01)',
          why: 'A: 0.08 ÷ 0.04 = 2; B: 0.02 ÷ 0.01 = 2. Equal raw weights, so 50% each. A has four times the excess return of B but four times the variance too. The optimiser trades return against variance, not against volatility.',
        },
        {
          kind: 'number',
          id: 'portfolio-frontier-2',
          ask: 'Two uncorrelated strategies each have a Sharpe ratio of 0.4. What is the Sharpe ratio of the best mix of them? Give two decimals.',
          answer: 0.57,
          tol: 0.006,
          check: 'math.sqrt(0.4 ** 2 + 0.4 ** 2)',
          why: '√(0.16 + 0.16) ≈ 0.57. This is the general form of the "Sharpe × √k" rule from the quant module: for uncorrelated assets the best mix has Sharpe² equal to the sum of the single Sharpe² values.',
        },
        {
          kind: 'number',
          id: 'portfolio-frontier-3',
          ask: 'One risky asset expects 6% a year above cash with 20% volatility. With risk aversion λ = 3, the mean-variance weight is μ ÷ (λσ²). What fraction of capital goes into the asset? Give a decimal.',
          answer: 0.5,
          check: '0.06 / (3 * 0.2 ** 2)',
          why: '0.06 ÷ (3 × 0.04) = 0.5, the rest in cash. Halve λ and the weight doubles to 1.0. The Kelly lesson shows that λ = 1 is the growth-maximising choice, and far too aggressive.',
        },
        {
          kind: 'number',
          id: 'portfolio-frontier-4',
          ask: 'An asset class has 20% volatility. You estimate its expected yearly return from 10 years of data. What is the standard error of that estimate? Give a percentage to one decimal, for example 12.3%.',
          answer: 0.063,
          tol: 0.0006,
          check: '0.20 / math.sqrt(10)',
          why: '20% ÷ √10 ≈ 6.3%. If the true premium is 5%, a ten-year average could easily read anywhere from about −8% to +18%. Quadrupling the data only halves the error, and markets change over 40 years.',
        },
        {
          kind: 'output',
          id: 'portfolio-frontier-5',
          ask: 'Two assets with equal 20% volatility and correlation 0.9. First both expect 5%, then the first expects 6%. What does this print?',
          code: `import numpy as np

s, rho = 0.20, 0.9
cov = np.array([[s * s, rho * s * s], [rho * s * s, s * s]])
for mu in ([0.05, 0.05], [0.06, 0.05]):
    raw = np.linalg.solve(cov, np.array(mu))
    print((raw / raw.sum()).round(2).tolist())`,
          answer: '[0.5, 0.5]\n[1.36, -0.36]',
          why: 'One percentage point of difference, well inside the estimation error, moves the tangency portfolio from 50/50 to 136% long and 36% short. With high correlation the optimiser sees the pair as a near-hedge and bets heavily on the gap between them.',
        },
        {
          kind: 'bug',
          id: 'portfolio-frontier-6',
          ask: 'This should return the tangency weights Σ⁻¹μ scaled to sum to 1. For uncorrelated assets with μ = [0.06, 0.03] and variances [0.04, 0.01] it returns [0.889, 0.111] instead of [0.333, 0.667].',
          code: `import numpy as np

def tangency(mu, cov):
    raw = cov @ mu
    return raw / raw.sum()`,
          line: 4,
          fix: '    raw = np.linalg.solve(cov, mu)',
          why: '`cov @ mu` multiplies by Σ instead of Σ⁻¹, so riskier assets get more weight, the opposite of the intent. `np.linalg.solve(cov, mu)` finds x with Σx = μ, which is Σ⁻¹μ, without forming the inverse.',
        },
        {
          kind: 'choice',
          id: 'portfolio-frontier-7',
          ask: 'In the figure, set 10 years of data and step through the five samples, then set 80 years. What do you see?',
          options: [
            'With 10 years the estimated weights jump between samples and often include large shorts; with 80 years they sit closer to the true optimum, though still not on it',
            'The estimated weights match the true ones at every setting',
            'More data makes the weights more extreme',
            'The estimated portfolio always has a higher true Sharpe than the true optimum',
          ],
          answer: 0,
          why: 'Each sample is a different but equally plausible history. With 10 years the mean estimates are too noisy and the optimiser chases the noise; its true Sharpe falls well below the best possible, often below equal weight. Even 80 years leaves visible error, and no market stays the same for 80 years.',
        },
        {
          kind: 'choice',
          id: 'portfolio-frontier-8',
          ask: 'Your optimiser puts 180% in one bond ETF and −95% in another that tracks almost the same bonds. What is the most likely explanation?',
          options: [
            'The optimiser found a real arbitrage between them',
            'The two have very high correlation and slightly different estimated returns, so the optimiser treats the gap as a near riskless bet',
            'There is a bug in the covariance matrix',
            'Bond ETFs always get extreme weights',
          ],
          answer: 1,
          why: 'A long-short pair of near-identical assets has very low estimated risk, so a tiny estimated return gap looks like a great Sharpe ratio. The gap is almost certainly noise. This is the error-maximising behaviour the next lesson tames with shrinkage and constraints.',
        },
        {
          kind: 'write',
          id: 'portfolio-frontier-9',
          numpy: true,
          ask: 'Write `tangency_weights(mu, cov)`: return Σ⁻¹μ scaled so the weights sum to 1. Use `np.linalg.solve`.',
          starter: `import numpy as np

def tangency_weights(mu, cov):
    mu, cov = np.asarray(mu, float), np.asarray(cov, float)
    pass`,
          solution: `import numpy as np

def tangency_weights(mu, cov):
    mu, cov = np.asarray(mu, float), np.asarray(cov, float)
    raw = np.linalg.solve(cov, mu)
    return raw / raw.sum()`,
          tests: `out = tangency_weights([0.06, 0.03], np.diag([0.04, 0.01]))
assert out is not None, "the function returns nothing yet"
assert np.allclose(out, [1 / 3, 2 / 3]), f"uncorrelated: weights proportional to mu / variance, [0.333, 0.667], got {out}"
assert abs(out.sum() - 1) < 1e-12, "the weights must sum to 1"
cov = np.array([[0.04, 0.012, 0.0], [0.012, 0.0225, 0.003], [0.0, 0.003, 0.01]])
mu = np.array([0.05, 0.04, 0.02])
w = tangency_weights(mu, cov)
sr = lambda x: (x @ mu) / np.sqrt(x @ cov @ x)
rng = np.random.default_rng(0)
best_random = max(sr(x / x.sum()) for x in rng.random((2000, 3)))
assert sr(w) >= best_random - 1e-9, "no random long-only mix should beat the tangency Sharpe ratio"`,
          why: 'The test compares your answer with thousands of random portfolios: none beats it on the numbers given. That is the optimiser doing its job on its inputs, which is exactly the problem when the inputs are noisy.',
        },
        {
          kind: 'write',
          id: 'portfolio-frontier-10',
          numpy: true,
          ask: 'Write `min_variance_weights(cov)`: return Σ⁻¹1 scaled to sum to 1, the fully invested portfolio with the lowest variance.',
          starter: `import numpy as np

def min_variance_weights(cov):
    cov = np.asarray(cov, float)
    pass`,
          solution: `import numpy as np

def min_variance_weights(cov):
    cov = np.asarray(cov, float)
    raw = np.linalg.solve(cov, np.ones(len(cov)))
    return raw / raw.sum()`,
          tests: `out = min_variance_weights(np.diag([0.04, 0.01]))
assert out is not None, "the function returns nothing yet"
assert np.allclose(out, [0.2, 0.8]), f"uncorrelated 20% and 10% vol: [0.2, 0.8], got {out}"
cov = np.array([[0.04, 0.018, 0.004], [0.018, 0.0225, 0.006], [0.004, 0.006, 0.01]])
w = min_variance_weights(cov)
assert abs(w.sum() - 1) < 1e-12, "the weights must sum to 1"
rng = np.random.default_rng(1)
for _ in range(500):
    d = rng.normal(0, 0.05, 3); d -= d.mean()
    assert (w + d) @ cov @ (w + d) >= w @ cov @ w - 1e-12, "moving away from the answer must not lower the variance"`,
          why: 'The minimum variance portfolio uses only Σ, so it avoids the noisiest input, expected returns. That is why it holds up better out of sample than the tangency portfolio, and why the lab uses it.',
        },
        {
          kind: 'design',
          id: 'portfolio-frontier-11',
          ask: 'A colleague ran a mean-variance optimiser on 5 years of monthly returns for 20 ETFs and wants to trade the result. List what you would check before any money follows it.',
          checklist: [
            { point: 'How the expected returns were set, and their standard errors', why: 'Five-year averages are mostly noise; the weights inherit that noise.' },
            { point: 'Whether 60 monthly rows are enough for a 20 × 20 covariance matrix', why: '210 numbers from 60 observations each is thin; the matrix may be near singular.' },
            { point: 'The largest longs and shorts, and whether they come from near-duplicate ETFs', why: 'Extreme long-short pairs are the signature of error maximisation.' },
            { point: 'How much the weights change if you drop one year or nudge one expected return by 1%', why: 'Weights that swing on small changes cannot be trusted.' },
            { point: 'Out-of-sample performance against equal weight and inverse volatility', why: 'Simple baselines are hard to beat once estimation error is counted.' },
            { point: 'Turnover and costs when re-optimised each month', why: 'Unstable weights mean heavy trading, which costs money every month.' },
          ],
          why: 'The maths of the optimiser is correct; its inputs are not known. Testing how sensitive the answer is to those inputs is the honest version of using it.',
        },
      ],
    },
    {
      id: 'portfolio-shrink',
      title: 'Taming the optimiser: shrinkage, constraints and simple baselines',
      summary: 'Pulling noisy estimates towards something sensible, limiting what the optimiser may do, and the baselines it has to beat.',
      text: [
        "**Shrinkage** blends a noisy estimate with a simple, stable target: `Σ_shrunk = δ·F + (1 − δ)·S`, where S is the sample covariance, F the target and δ between 0 and 1 the **shrinkage intensity**. A common target keeps each asset's own variance but replaces every correlation with the average one (**constant correlation**). Ledoit and Wolf (2004) showed how to choose δ from the data; in Python, scikit-learn has `sklearn.covariance.LedoitWolf`, which shrinks towards a scaled identity matrix.",
        'Shrinkage matters most when there are many assets for the amount of data. With T observations of n assets, the sample covariance has rank at most T − 1. If n ≥ T it is **singular**: some portfolio appears to have zero risk, and the optimiser will find it. Even below that point, the smallest eigenvalues are too small, and minimum variance weights promise far less risk than they deliver.',
        { code: `import numpy as np

rng = np.random.default_rng(0)
R = rng.normal(0, 0.01, (30, 50))          # 30 days, 50 assets
print(np.linalg.matrix_rank(np.cov(R, rowvar=False)))   # 29: singular` },
        '**Constraints** are a cruder kind of shrinkage: no shorts, a cap on each weight, limits by sector. Jagannathan and Ma (2003) showed that a no-short constraint on minimum variance works much like shrinking the largest covariances. Expected returns can be shrunk too, towards a common value, or dropped altogether by using minimum variance.',
        '**Simple baselines** set the bar. Equal weight (1/N) needs no estimates at all. **Inverse volatility**, `wi ∝ 1/σi`, needs only volatilities, which are the most stable estimates there are, and ignores correlations. DeMiguel, Garlappi and Uppal (2009) tested 14 optimised models on seven data sets and found none consistently beat 1/N out of sample; by their estimate the sample mean-variance rule would need around 3,000 months of data to do so with 25 assets. An optimiser that cannot beat these baselines after costs, out of sample, is not worth its complexity.',
      ],
      rules: [
        'Shrink: δ·target + (1 − δ)·sample, with δ between 0 and 1.',
        'With n assets and T days, rank ≤ T − 1. n ≥ T means a singular matrix.',
        'Sample minimum variance promises less risk than it delivers.',
        'No-short limits and caps act as shrinkage. Use them.',
        'Inverse volatility: wi ∝ 1/σi. Equal weight: 1/N. Beat these out of sample or do not bother.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'portfolio-shrink-1',
          ask: 'Three assets have volatilities of 10%, 20% and 40%. With inverse volatility weighting, what fraction goes into the 10% asset? Give a decimal to 3 places.',
          answer: 0.571,
          tol: 0.0006,
          check: '(1 / 0.1) / (1 / 0.1 + 1 / 0.2 + 1 / 0.4)',
          why: 'The raw weights are 10, 5 and 2.5, which sum to 17.5, so the quiet asset gets 10 ÷ 17.5 ≈ 0.571. Each asset then brings the same stand-alone volatility, which is the link to risk parity.',
        },
        {
          kind: 'number',
          id: 'portfolio-shrink-2',
          ask: 'A sample covariance is 0.012. The constant correlation target for the same pair is 0.006. With shrinkage intensity δ = 0.3, what is the shrunk covariance? Give 4 decimals.',
          answer: 0.0102,
          tol: 0.00001,
          check: '0.3 * 0.006 + 0.7 * 0.012',
          why: '0.3 × 0.006 + 0.7 × 0.012 = 0.0018 + 0.0084 = 0.0102. Shrinkage pulls the unusually large covariance part of the way towards the average; the diagonal variances stay as they were.',
        },
        {
          kind: 'number',
          id: 'portfolio-shrink-3',
          ask: 'A mean-variance optimiser over 25 assets needs an expected return for each and a full covariance matrix. How many numbers must be estimated in total?',
          answer: 350,
          tol: 0.5,
          check: '25 + 25 * 26 / 2',
          why: '25 means plus 25 × 26 ÷ 2 = 325 variances and covariances: 350. Equal weight needs none of them and inverse volatility needs 25, which is a large part of why they hold up out of sample.',
        },
        {
          kind: 'output',
          id: 'portfolio-shrink-4',
          ask: 'Fifty assets, 30 days of returns. What does this print?',
          code: `import numpy as np

rng = np.random.default_rng(0)
R = rng.normal(0, 0.01, (30, 50))
S = np.cov(R, rowvar=False)
print(S.shape, np.linalg.matrix_rank(S))`,
          answer: '(50, 50) 29',
          why: 'Thirty observations, minus one for the mean, span at most 29 directions. The other 21 directions have zero estimated variance, so the optimiser sees riskless portfolios that do not exist. Shrinkage adds back variance in every direction.',
        },
        {
          kind: 'output',
          id: 'portfolio-shrink-5',
          ask: 'Forty made-up stocks with a known true covariance, estimated from 60 days. Each line prints the risk the minimum variance portfolio promises and the risk it really has, first from the sample covariance, then from a 50% shrunk one. What does this print?',
          code: `import numpy as np

rng = np.random.default_rng(4)
n, T = 40, 60
beta, idio = rng.uniform(0.5, 1.5, n), rng.uniform(0.01, 0.02, n)
true = 0.0001 * np.outer(beta, beta) + np.diag(idio ** 2)
R = np.outer(rng.normal(0, 0.01, T), beta) + rng.normal(0, 1, (T, n)) * idio
S = np.cov(R, rowvar=False)
vol = np.sqrt(np.diag(S))
rbar = ((S / np.outer(vol, vol)).sum() - n) / (n * (n - 1))
F = rbar * np.outer(vol, vol)
np.fill_diagonal(F, np.diag(S))
for C in (S, 0.5 * F + 0.5 * S):
    w = np.linalg.solve(C, np.ones(n)); w /= w.sum()
    print(round(float(np.sqrt(w @ C @ w * 252)), 2), round(float(np.sqrt(w @ true @ w * 252)), 2))`,
          answer: '0.06 0.18\n0.11 0.14',
          why: 'From the raw sample, the optimiser promises 6% a year and delivers 18%, no better than equal weight here (about 17.8%). Shrunk, it promises 11% and delivers 14%, close to the best possible (about 12%). The promise is always too low; shrinkage makes it less wrong and the portfolio better.',
        },
        {
          kind: 'bug',
          id: 'portfolio-shrink-6',
          ask: 'This should build the constant correlation target: every off-diagonal correlation replaced by the average off-diagonal correlation. On three assets with all correlations 0.2 it uses 0.47 instead of 0.2.',
          code: `import numpy as np

def cc_target(S):
    vol = np.sqrt(np.diag(S))
    corr = S / np.outer(vol, vol)
    n = len(vol)
    rbar = corr.mean()
    F = rbar * np.outer(vol, vol)
    np.fill_diagonal(F, np.diag(S))
    return F`,
          line: 7,
          fix: '    rbar = (corr.sum() - n) / (n * (n - 1))',
          why: 'The diagonal of a correlation matrix is all 1s, and `corr.mean()` averages them in. With 3 assets that is (3 + 6 × 0.2) ÷ 9 ≈ 0.47. Subtract the n ones and divide by the n(n − 1) off-diagonal entries.',
        },
        {
          kind: 'write',
          id: 'portfolio-shrink-7',
          numpy: true,
          ask: 'Write `inverse_vol_weights(vols)`: weights proportional to 1/σ, summing to 1.',
          starter: `import numpy as np

def inverse_vol_weights(vols):
    vols = np.asarray(vols, float)
    pass`,
          solution: `import numpy as np

def inverse_vol_weights(vols):
    vols = np.asarray(vols, float)
    w = 1 / vols
    return w / w.sum()`,
          tests: `out = inverse_vol_weights([0.1, 0.2, 0.4])
assert out is not None, "the function returns nothing yet"
assert np.allclose(out, [10 / 17.5, 5 / 17.5, 2.5 / 17.5]), f"expected [0.571, 0.286, 0.143], got {out}"
assert abs(out.sum() - 1) < 1e-12, "the weights must sum to 1"
assert np.allclose(inverse_vol_weights([0.3, 0.3]), [0.5, 0.5]), "equal volatilities give equal weights"
assert np.allclose(inverse_vol_weights([0.1, 0.2]) * [0.1, 0.2], 1 / 15), "each weight times its volatility is the same"`,
          why: 'Each weight times its volatility is the same number, so every asset brings the same stand-alone risk. It ignores correlation, which is both its weakness and why it is stable.',
        },
        {
          kind: 'write',
          id: 'portfolio-shrink-8',
          numpy: true,
          ask: 'Write `shrink_cov(S, delta)`: return `delta × F + (1 − delta) × S`, where F is the constant correlation target (sample variances on the diagonal, `rbar × σi × σj` off it, rbar the average off-diagonal sample correlation).',
          starter: `import numpy as np

def shrink_cov(S, delta):
    S = np.asarray(S, float)
    return S`,
          solution: `import numpy as np

def shrink_cov(S, delta):
    S = np.asarray(S, float)
    vol = np.sqrt(np.diag(S))
    corr = S / np.outer(vol, vol)
    n = len(vol)
    rbar = (corr.sum() - n) / (n * (n - 1))
    F = rbar * np.outer(vol, vol)
    np.fill_diagonal(F, np.diag(S))
    return delta * F + (1 - delta) * S`,
          tests: `S = np.array([[0.04, 0.012, 0.0], [0.012, 0.01, 0.002], [0.0, 0.002, 0.0225]])
out = shrink_cov(S, 0.5)
assert out is not None, "the function returns nothing yet"
assert np.allclose(np.diag(out), np.diag(S)), "the variances on the diagonal must not change"
assert np.allclose(shrink_cov(S, 0.0), S), "delta = 0 returns the sample matrix"
vol = np.sqrt(np.diag(S)); c = S / np.outer(vol, vol)
rbar = (c[0, 1] + c[0, 2] + c[1, 2]) / 3
full = shrink_cov(S, 1.0)
assert np.allclose(full / np.outer(vol, vol) - np.eye(3) * (1 - rbar), rbar), f"delta = 1: every correlation equals the average off-diagonal one, {rbar:.4f}"
assert np.allclose(out, 0.5 * full + 0.5 * S), "delta blends target and sample linearly"
assert np.allclose(out, out.T), "the result must stay symmetric"`,
          why: 'Variances are left alone because they are estimated well; correlations are pulled together because they are not. Picking δ by hand (0.2 to 0.5 is common) is a judgement; Ledoit and Wolf give a formula for it, which scikit-learn implements for an identity target.',
        },
        {
          kind: 'choice',
          id: 'portfolio-shrink-9',
          ask: 'What did DeMiguel, Garlappi and Uppal (2009) find when they compared 14 optimised portfolio rules with equal weighting, out of sample?',
          options: [
            'Every optimised rule beat equal weight by a wide margin',
            'None of them consistently beat equal weight on Sharpe ratio, certainty-equivalent return or turnover',
            'Equal weight lost money in every data set',
            'Only rules with short selling beat equal weight',
          ],
          answer: 1,
          why: 'The gain from optimising was eaten by estimation error. It does not mean optimisation is useless: it means an optimiser must prove itself against 1/N out of sample, with its estimation error counted.',
        },
        {
          kind: 'choice',
          id: 'portfolio-shrink-10',
          ask: 'You add a no-short constraint and a 20% cap per asset to a minimum variance optimiser on 30 stocks. On the sample, its volatility rises a little. What should you expect out of sample?',
          options: [
            'Worse, because the constrained portfolio had higher risk in sample',
            'Often similar or lower realised risk and much less turnover, because the constraints block the bets built on estimation error',
            'Exactly the in-sample number',
            'Higher returns, because constraints add return',
          ],
          answer: 1,
          why: 'The unconstrained optimum is fitted to the noise in the sample, so its in-sample risk is flattering. Constraints give up a little of that flattering fit and remove the extreme weights that fail later. They add no return; they reduce error.',
        },
        {
          kind: 'design',
          id: 'portfolio-shrink-11',
          ask: 'You will allocate between 12 ETFs (stocks, bonds, commodities, regions) and rebalance monthly. Plan how you choose the weighting method.',
          checklist: [
            { point: 'Start from equal weight and inverse volatility as the baselines', why: 'They need little or no estimation and are hard to beat.' },
            { point: 'If you optimise, use minimum variance or risk parity with a shrunk covariance, not raw expected returns', why: 'Return estimates are the noisiest input.' },
            { point: 'Add a no-short rule and caps per asset and per asset class', why: 'Constraints act as shrinkage and stop concentration.' },
            { point: 'Estimate on a rolling past window and test on the months after it', why: 'Only out-of-sample results count.' },
            { point: 'Compare realised volatility, drawdown, Sharpe and turnover after costs', why: 'Volatility differences are measurable; Sharpe differences between methods are mostly noise over a few years.' },
            { point: 'Prefer the simpler method unless the complex one wins clearly', why: 'Complexity has a cost in errors and in trust.' },
          ],
          why: 'The question is not which method is best in theory but which survives estimation error at your data length. Simple methods usually do, so they are where you start.',
        },
      ],
    },
    {
      id: 'portfolio-riskparity',
      title: 'Risk parity, volatility targeting and leverage',
      summary: 'Measuring how much of the risk each holding brings, balancing it, and levering a quiet portfolio up to a risk budget, with what that costs.',
      widget: 'portfolio-riskparity',
      text: [
        'Capital weights hide where risk comes from. The **risk contribution** of asset i is `RCi = wi × (Σw)i ÷ σp`, where `(Σw)i` is row i of Σ times w. The contributions add up to the portfolio volatility, so dividing each by σp gives the share of risk each asset brings. A 60/40 portfolio of stocks at 16% volatility and bonds at 6%, uncorrelated, gets about 94% of its risk from stocks.',
        '**Risk parity** sets weights so every asset brings the same share of risk (**equal risk contribution**, ERC). For two assets that is inverse volatility. With more assets there is no formula; you solve for it, for example by adjusting one weight at a time until each `wi × (Σw)i` is equal. Bridgewater launched its All Weather strategy on this idea in 1996, and Edward Qian of PanAgora is credited with the name "risk parity" in the mid 2000s.',
        { code: `import numpy as np

w = np.array([0.6, 0.4])
cov = np.diag([0.16 ** 2, 0.06 ** 2])
rc = w * (cov @ w) / (w @ cov @ w)   # shares of risk, sum to 1
print(rc.round(3))                    # [0.941 0.059]` },
        'A risk parity portfolio leans on low-volatility assets such as bonds, so its volatility is low. To reach a **risk budget**, say 10% a year, it is levered: `leverage = target ÷ portfolio volatility`. Leverage costs money. The levered return is `L × rp − (L − 1) × borrowing rate`, so a rise in rates cuts it, and leverage magnifies whatever the assets do. **Volatility targeting** of the whole portfolio, from the quant module, scales L up and down with a forecast from past data only, with a cap.',
        "Risk parity assumes the assets' risks partly offset. In 2022 they did not: the S&P 500 lost 18.1% including dividends and the Bloomberg US Aggregate bond index lost 13.0%, its worst calendar year since it began in 1976, as interest rates rose. Levered bond holdings made it worse, and risk parity funds had a bad year. Balancing risk balances the estimates of risk you feed it, and those estimates assumed correlations that changed.",
      ],
      rules: [
        'RCi = wi (Σw)i ÷ σp. They sum to σp; divide by σp for shares.',
        'Risk parity: equal risk shares. Two assets: inverse volatility.',
        'Leverage to a budget: L = target ÷ σp, with a cap.',
        'Levered return = L·rp − (L − 1)·borrow rate. Rates and costs matter.',
        'It balances estimated risk. When correlations change, so does the balance.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'portfolio-riskparity-1',
          ask: 'A 70/30 portfolio: stocks with 15% volatility, bonds with 5%, correlation 0. What share of the portfolio variance comes from stocks? Give a percentage to one decimal, for example 12.3%.',
          answer: 0.98,
          tol: 0.0006,
          check: '(0.7 ** 2 * 0.15 ** 2) / (0.7 ** 2 * 0.15 ** 2 + 0.3 ** 2 * 0.05 ** 2)',
          why: 'Stocks: 0.49 × 0.0225 = 0.011025. Bonds: 0.09 × 0.0025 = 0.000225. Stocks bring 0.011025 ÷ 0.01125 = 98.0%. With no correlation each risk share is wi²σi² ÷ σp². A "balanced" 70/30 is a stock portfolio for risk purposes.',
        },
        {
          kind: 'number',
          id: 'portfolio-riskparity-2',
          ask: 'Two assets, stocks at 15% volatility and bonds at 5%. What weight in stocks gives equal risk contributions? Give a decimal.',
          answer: 0.25,
          check: '(1 / 0.15) / (1 / 0.15 + 1 / 0.05)',
          why: 'For two assets ERC is inverse volatility, whatever the correlation: (1/0.15) ÷ (1/0.15 + 1/0.05) = 6.67 ÷ 26.67 = 0.25. Three quarters in bonds is what equal risk looks like, and why the portfolio needs leverage to reach a normal return.',
        },
        {
          kind: 'number',
          id: 'portfolio-riskparity-3',
          ask: 'A risk parity portfolio expects 4% a year at 5% volatility. You lever it 2× to reach 10% volatility and borrow at 3%. What is the expected levered return? Give a percentage, for example 12%.',
          answer: 0.05,
          check: '2 * 0.04 - 1 * 0.03',
          why: '2 × 4% − 1 × 3% = 5%. The risk doubled, but the return did not: the borrowed half pays 3%. If the borrowing rate rose to 4%, the levered portfolio would expect exactly what the unlevered one does, at twice the risk.',
        },
        {
          kind: 'number',
          id: 'portfolio-riskparity-4',
          ask: 'Your target is 10% a year. The portfolio volatility forecast from the past 60 days is 6%, and leverage is capped at 1.5. What leverage do you run? Give a decimal.',
          answer: 1.5,
          check: 'min(0.10 / 0.06, 1.5)',
          why: '10 ÷ 6 = 1.67, above the cap, so 1.5. The cap matters most after a quiet spell, when the forecast is low and the next shock has not yet arrived.',
        },
        {
          kind: 'output',
          id: 'portfolio-riskparity-5',
          ask: 'Risk shares for an equal-weight mix of stocks, bonds and commodities. What does this print?',
          code: `import numpy as np

vol = np.array([0.16, 0.06, 0.18])
corr = np.array([[1.0, 0.0, 0.3], [0.0, 1.0, 0.0], [0.3, 0.0, 1.0]])
cov = corr * np.outer(vol, vol)
w = np.ones(3) / 3
rc = w * (cov @ w) / (w @ cov @ w)
print(rc.round(2).tolist())`,
          answer: '[0.43, 0.05, 0.52]',
          why: 'Equal capital is far from equal risk: bonds, at 6% volatility, bring 5% of it. Commodities bring the most because they are the most volatile and correlated with stocks. The shares sum to 1.',
        },
        {
          kind: 'bug',
          id: 'portfolio-riskparity-6',
          ask: "This should return each asset's share of portfolio risk, summing to 1. For a 60/40 portfolio with 16% and 6% volatility, uncorrelated, it returns about [0.093, 0.006].",
          code: `import numpy as np

def risk_shares(w, cov):
    w, cov = np.asarray(w, float), np.asarray(cov, float)
    port_vol = np.sqrt(w @ cov @ w)
    return w * (cov @ w) / port_vol`,
          line: 6,
          fix: '    return w * (cov @ w) / port_vol ** 2',
          why: 'Dividing by σp gives the risk contributions in volatility units, which sum to σp ≈ 0.099. For shares that sum to 1, divide by σp², the variance. Both are useful; mixing them up makes every asset look like a small risk.',
        },
        {
          kind: 'write',
          id: 'portfolio-riskparity-7',
          numpy: true,
          ask: "Write `risk_shares(w, cov)`: each asset's share of portfolio variance, `wi × (Σw)i ÷ (w · Σ · w)`.",
          starter: `import numpy as np

def risk_shares(w, cov):
    w, cov = np.asarray(w, float), np.asarray(cov, float)
    pass`,
          solution: `import numpy as np

def risk_shares(w, cov):
    w, cov = np.asarray(w, float), np.asarray(cov, float)
    return w * (cov @ w) / (w @ cov @ w)`,
          tests: `cov = np.diag([0.16 ** 2, 0.06 ** 2])
out = risk_shares([0.6, 0.4], cov)
assert out is not None, "the function returns nothing yet"
assert np.allclose(out, [0.9412, 0.0588], atol=1e-4), f"60/40 at 16% and 6% vol: about [0.941, 0.059], got {out}"
c = np.array([[0.04, 0.01, -0.002], [0.01, 0.0225, 0.0], [-0.002, 0.0, 0.01]])
s = risk_shares([0.2, 0.3, 0.5], c)
assert abs(s.sum() - 1) < 1e-12, "the shares must sum to 1"
assert np.allclose(risk_shares([0.25, 0.75], np.array([[0.0225, 0.0015], [0.0015, 0.0025]])), [0.5, 0.5]), "inverse volatility weights for two assets give equal shares, whatever the correlation"`,
          why: 'A share can be negative when an asset hedges the rest; it then lowers total risk. Reports of risk by holding, by sector or by factor are all this calculation.',
        },
        {
          kind: 'write',
          id: 'portfolio-riskparity-8',
          numpy: true,
          ask: 'Write `erc_weights(cov, iters=200)`: start from equal weights. In each pass, for each asset i in turn, set `a = (Σw)i − Σii·wi` and replace wi by the positive root of `Σii·wi² + a·wi − 1/n = 0`, which is `(−a + √(a² + 4·Σii/n)) ÷ (2·Σii)`. After all passes return the weights scaled to sum to 1.',
          starter: `import numpy as np

def erc_weights(cov, iters=200):
    cov = np.asarray(cov, float)
    n = len(cov)
    w = np.ones(n) / n
    return w`,
          solution: `import numpy as np

def erc_weights(cov, iters=200):
    cov = np.asarray(cov, float)
    n = len(cov)
    w = np.ones(n) / n
    for _ in range(iters):
        for i in range(n):
            a = cov[i] @ w - cov[i, i] * w[i]
            w[i] = (-a + np.sqrt(a * a + 4 * cov[i, i] / n)) / (2 * cov[i, i])
    return w / w.sum()`,
          tests: `out = erc_weights(np.diag([0.0225, 0.0025]))
assert out is not None, "the function returns nothing yet"
assert np.allclose(out, [0.25, 0.75], atol=1e-6), f"two assets: inverse volatility, [0.25, 0.75], got {out}"
vol = np.array([0.16, 0.06, 0.18])
corr = np.array([[1.0, 0.0, 0.3], [0.0, 1.0, 0.0], [0.3, 0.0, 1.0]])
cov = corr * np.outer(vol, vol)
w = erc_weights(cov)
assert abs(w.sum() - 1) < 1e-9 and np.all(w > 0), "weights are positive and sum to 1"
rc = w * (cov @ w)
assert np.allclose(rc / rc.sum(), 1 / 3, atol=1e-6), f"each asset should bring a third of the risk, got {rc / rc.sum()}"`,
          why: "Each step makes asset i's contribution wi(Σw)i equal to 1/n given the others, and repeating the passes settles every asset at once. Portfolio libraries solve the same problem with a general optimiser; this loop shows what they are solving.",
        },
        {
          kind: 'choice',
          id: 'portfolio-riskparity-9',
          ask: 'In the figure, press Equal risk, then move the stock-bond correlation from −0.3 to 0.6. What happens?',
          options: [
            'Nothing: equal risk weights do not depend on correlation',
            'The weights stay where they were, but the risk shares drift apart and the portfolio volatility rises, so less leverage reaches 10% and the hedge you relied on is weaker',
            'The portfolio volatility falls',
            'Bonds take over all the risk',
          ],
          answer: 1,
          why: 'Risk parity weights are solved for one covariance matrix. When the correlation rises, the same weights carry more risk and the shares change; pressing Equal risk again gives new weights. In 2022 stocks and bonds fell together, and levered bond positions added to the loss.',
        },
        {
          kind: 'choice',
          id: 'portfolio-riskparity-10',
          ask: 'A levered risk parity fund holds bonds at 2× through futures. Which change hurts it most, all else equal?',
          options: [
            'Stock-bond correlation falls from 0 to −0.3',
            'Interest rates rise sharply: bond prices fall and the cost of the leverage rises',
            'Bond volatility falls',
            'A new asset class is added',
          ],
          answer: 1,
          why: 'Rising rates hit the levered bond leg twice: price losses on more bonds than the capital would buy, and a higher financing cost. A lower correlation and quieter bonds help the strategy. This is the 2022 story.',
        },
        {
          kind: 'design',
          id: 'portfolio-riskparity-11',
          ask: 'You want to run a small risk parity portfolio of four ETFs (stocks, long bonds, gold, commodities) at a 10% volatility target. Write the rules.',
          checklist: [
            { point: 'Estimate the covariance from a past window only, with some shrinkage, and re-solve monthly', why: 'Weights must come from data available at the time.' },
            { point: 'Solve for equal risk contributions and check the shares after rounding to whole shares', why: 'The goal is equal risk, not equal capital.' },
            { point: 'Set leverage as target ÷ forecast volatility with a hard cap', why: 'A quiet spell must not lever you up shortly before a shock.' },
            { point: 'Count the cost of leverage: margin rate or the financing built into futures', why: 'A rise in rates can remove the return that leverage was meant to add.' },
            { point: 'Stress test a year like 2022, with stocks and bonds falling together', why: 'The strategy depends on correlations that can change.' },
            { point: 'A drawdown limit that cuts leverage, decided in advance', why: 'Levered losses compound; a rule made in calm conditions is easier to follow.' },
            { point: 'Compare with an unlevered inverse volatility version', why: 'If leverage does not improve the risk-adjusted result after costs, it is risk without reward.' },
          ],
          why: 'Risk parity balances estimated risks and then borrows to reach a budget. Both steps rest on assumptions about volatility, correlation and rates, so the rules must say what happens when those change.',
        },
      ],
    },
    {
      id: 'portfolio-kelly',
      title: 'Bet sizing: the Kelly criterion for strategies',
      summary: 'The leverage that maximises long-run growth for a strategy with a mean and a volatility, and why everyone who uses it runs a fraction of it.',
      widget: 'portfolio-kelly',
      text: [
        "The risk module gave Kelly for a bet with a win rate and a payoff. A strategy is not a coin flip: it has an expected excess return μ and a volatility σ a year. Held at leverage f and rebalanced often, its log growth above cash is about `g(f) = f·μ − f²σ²/2`. The first term is the return you lever up; the second is volatility drag, which grows with the square of leverage. The maximum is at `f* = μ ÷ σ²`, and there `g = S²/2`, where S = μ/σ is the Sharpe ratio.",
        { code: `mu, sigma = 0.05, 0.20            # 5% excess return, 20% volatility
f = mu / sigma ** 2                 # Kelly leverage
g = f * mu - (f * sigma) ** 2 / 2   # growth above cash at that leverage
print(round(f, 2), round(g, 5))     # 1.25 0.03125` },
        'For several assets the same reasoning gives `f = Σ⁻¹μ`, the mean-variance weights with λ = 1 from the frontier lesson. Kelly is the least risk-averse investor who still cares about the long run. With realistic inputs it asks for a lot of leverage, which is the first warning.',
        "Running a fraction c of Kelly gives growth `S²(c − c²/2)`. Half Kelly keeps three quarters of the growth at half the volatility. Twice Kelly gives zero growth, and more than that loses money while every bet still has a positive expectation. Drawdowns are the second warning. With true parameters and continuous trading, the chance that wealth ever falls to a fraction x of its current level is `x^(2/c − 1)`: at full Kelly a 50% chance of halving at some point, at half Kelly 12.5%.",
        'The third warning is that μ is estimated. If your backtest overstates the Sharpe ratio by a factor of two, which a short or overfitted sample does easily, your full Kelly is twice the true Kelly and your growth is zero. The curve is flat near the top and steep beyond it, so erring low costs little and erring high costs a lot. Kelly also assumes the returns are steady, with no jumps or gaps, and that you rebalance continuously. Short volatility strategies break all three. Treat Kelly as a ceiling and run a fraction, a quarter to a half being common.',
      ],
      rules: [
        'Continuous Kelly: f* = μ ÷ σ². Growth at Kelly = S²/2.',
        'Fraction c of Kelly: growth S²(c − c²/2). Half Kelly: 75% of the growth, half the volatility.',
        'Twice Kelly: zero growth. Above it, you lose money with a positive edge.',
        'Chance of ever falling to x of current wealth: x^(2/c − 1). Full Kelly halves half the time.',
        'Several assets: f = Σ⁻¹μ, the λ = 1 mean-variance portfolio.',
        'μ is an estimate. Overestimate it and you are past Kelly without knowing. Run a fraction.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'portfolio-kelly-1',
          ask: 'A strategy expects 8% a year above cash with 20% volatility. What leverage does continuous Kelly suggest? Give a multiple of capital, for example 1.5.',
          answer: 2,
          check: '0.08 / 0.20 ** 2',
          why: 'f* = μ ÷ σ² = 0.08 ÷ 0.04 = 2. Note the σ²: doubling the volatility at the same μ cuts the Kelly leverage by four. Two times leverage on a 20% volatility strategy is 40% volatility, which few people could hold.',
        },
        {
          kind: 'number',
          id: 'portfolio-kelly-2',
          ask: 'A strategy has a Sharpe ratio of 0.5. At full Kelly, what log growth a year above cash does the formula promise? Give a percentage to one decimal, for example 12.3%.',
          answer: 0.125,
          tol: 0.0006,
          check: '0.5 ** 2 / 2',
          why: 'g = S²/2 = 0.25 ÷ 2 = 12.5% a year above cash. That is the best any leverage can do, and only if 0.5 is the true Sharpe ratio, it stays constant, and you can hold the drawdowns.',
        },
        {
          kind: 'number',
          id: 'portfolio-kelly-3',
          ask: 'You run half Kelly instead of full Kelly. What fraction of the full Kelly growth rate do you keep? Give a decimal.',
          answer: 0.75,
          check: '(0.5 - 0.5 ** 2 / 2) / (1 - 1 / 2)',
          why: 'Growth at fraction c is proportional to c − c²/2: 0.375 at half Kelly, 0.5 at full, so you keep 75%. Volatility halves. Giving up a quarter of the growth for half the swings is why half Kelly is the usual ceiling.',
        },
        {
          kind: 'number',
          id: 'portfolio-kelly-4',
          ask: 'With true parameters and continuous trading, the chance of ever falling to half your current wealth at a fraction c of Kelly is 0.5^(2/c − 1). What is it at half Kelly? Give a percentage to one decimal, for example 12.3%.',
          answer: 0.125,
          tol: 0.0006,
          check: '0.5 ** (2 / 0.5 - 1)',
          why: 'At c = 0.5 the exponent is 2 ÷ 0.5 − 1 = 3, so 0.5³ = 12.5%. At full Kelly the exponent is 1 and the chance is 50%. These are best cases: with estimated parameters and fat tails the real numbers are worse.',
        },
        {
          kind: 'number',
          id: 'portfolio-kelly-5',
          ask: 'Two uncorrelated assets: one expects 5% above cash with 20% volatility, the other 3% with 10% volatility. Kelly weights are μi ÷ σi² each. What is the total leverage, the sum of the two weights? Give a multiple of capital, for example 1.5.',
          answer: 4.25,
          check: '0.05 / 0.04 + 0.03 / 0.01',
          why: '1.25 + 3.0 = 4.25 times capital, mostly in the quiet asset. Multi-asset Kelly is Σ⁻¹μ, the most aggressive mean-variance portfolio, and with ordinary inputs it wants heavy leverage. It inherits all the estimation error of the frontier lesson too.',
        },
        {
          kind: 'output',
          id: 'portfolio-kelly-6',
          ask: 'Growth at half, full and one and a half times Kelly. What does this print?',
          code: `mu, sigma = 0.06, 0.15
kelly = mu / sigma ** 2
for c in (0.5, 1.0, 1.5):
    f = c * kelly
    print(c, round(f, 2), round(f * mu - (f * sigma) ** 2 / 2, 3))`,
          answer: '0.5 1.33 0.06\n1.0 2.67 0.08\n1.5 4.0 0.06',
          why: 'The growth curve is symmetric around Kelly: half Kelly and 1.5 times Kelly grow at the same 6% a year. But 1.5 times Kelly runs three times the leverage of half Kelly, so three times the volatility and far deeper drawdowns for the same growth.',
        },
        {
          kind: 'bug',
          id: 'portfolio-kelly-7',
          ask: 'This should return the Kelly leverage for a strategy with excess return `mu` and volatility `sigma`. For mu = 0.08 and sigma = 0.2 it returns 0.4 instead of 2.0.',
          code: `def kelly_leverage(mu, sigma, cap=None):
    f = mu / sigma
    if cap is not None:
        f = min(f, cap)
    return f`,
          line: 2,
          fix: '    f = mu / sigma ** 2',
          why: 'Kelly divides by the variance, not the volatility. μ ÷ σ is the Sharpe ratio, 0.4 here. The distinction matters: the variance term is what makes Kelly leverage fall so fast as volatility rises.',
        },
        {
          kind: 'write',
          id: 'portfolio-kelly-8',
          numpy: true,
          ask: 'Write `kelly_weights(mu, cov, fraction=1.0)`: the multi-asset Kelly weights Σ⁻¹μ times `fraction`. Use `np.linalg.solve`.',
          starter: `import numpy as np

def kelly_weights(mu, cov, fraction=1.0):
    mu, cov = np.asarray(mu, float), np.asarray(cov, float)
    pass`,
          solution: `import numpy as np

def kelly_weights(mu, cov, fraction=1.0):
    mu, cov = np.asarray(mu, float), np.asarray(cov, float)
    return fraction * np.linalg.solve(cov, mu)`,
          tests: `out = kelly_weights([0.05, 0.03], np.diag([0.04, 0.01]))
assert out is not None, "the function returns nothing yet"
assert np.allclose(out, [1.25, 3.0]), f"uncorrelated: mu / variance, [1.25, 3.0], got {out}"
assert np.allclose(kelly_weights([0.05, 0.03], np.diag([0.04, 0.01]), 0.5), [0.625, 1.5]), "half Kelly halves every weight"
cov = np.array([[0.04, 0.012], [0.012, 0.0225]])
mu = np.array([0.06, 0.04])
w = kelly_weights(mu, cov)
g = lambda x: x @ mu - x @ cov @ x / 2
assert all(g(w) >= g(w + d) - 1e-12 for d in np.random.default_rng(0).normal(0, 0.1, (200, 2))), "no nearby weights should give higher growth w.mu - w.cov.w / 2"`,
          why: 'The test checks that your weights maximise the growth `w · μ − w · Σ · w / 2`. They are not scaled to sum to 1: Kelly says how much to hold in total as well as how to split it, and the total is usually more than the capital.',
        },
        {
          kind: 'choice',
          id: 'portfolio-kelly-9',
          ask: 'In the figure, set the true Sharpe ratio to 0.5, your estimate to 2× the truth and the fraction of your Kelly to 1. What happens?',
          options: [
            'Growth is about zero: you run twice the true Kelly leverage, at twice the volatility, and the chance of ever halving is 100%',
            'Growth doubles because the estimate is higher',
            'Nothing changes: Kelly corrects for estimation error',
            'Growth falls a little but drawdowns shrink',
          ],
          answer: 0,
          why: 'Overstating the Sharpe ratio by 2× doubles the leverage, which lands exactly where drag eats all the return. A backtest Sharpe of twice the true one is common after a short sample or some overfitting. Halve the fraction and you are back at true Kelly; halve it again and you are safer still.',
        },
        {
          kind: 'choice',
          id: 'portfolio-kelly-10',
          ask: 'A strategy that sells short-dated index puts shows a Sharpe ratio of 2 over three calm years, with 6% volatility. Its Kelly leverage looks enormous. Why is that number least trustworthy for this kind of strategy?',
          options: [
            'Kelly only applies to long positions',
            'The mean and volatility do not describe its risk: it earns small, steady amounts and loses in rare jumps that three calm years may not contain, and Kelly assumes no jumps',
            'A Sharpe ratio of 2 is too low for Kelly',
            'Options cannot be levered',
          ],
          answer: 1,
          why: 'Continuous Kelly uses only μ and σ and assumes smooth paths. A short volatility book has a small σ until the day it gaps. Sized by Kelly on calm data, one gap can take most of the account. This is where the risk module rule, Kelly as a ceiling and never a target, matters most.',
        },
        {
          kind: 'design',
          id: 'portfolio-kelly-11',
          ask: 'Your backtest of a futures trend strategy shows a Sharpe ratio of 1.2 over 6 years at 12% volatility. Decide how much leverage to run, and write down how you got there.',
          checklist: [
            { point: 'Haircut the Sharpe ratio for overfitting and costs before using it, for example halve it', why: 'Backtests overstate edges; Kelly on an inflated μ is past true Kelly.' },
            { point: 'Compute Kelly on the haircut numbers: f* = μ ÷ σ²', why: 'It gives the ceiling, not the target.' },
            { point: 'Run a quarter to a half of that', why: 'Most of the growth for much less volatility, and room for error in μ.' },
            { point: 'Check the volatility and drawdown that leverage implies, and that you could hold them', why: 'A size you abandon in a drawdown is worse than a smaller one you keep.' },
            { point: 'Check margin and the worst historical gap at that leverage', why: 'Kelly assumes smooth paths; futures gap over weekends and events.' },
            { point: 'Re-estimate on new live data and reduce if live results fall short', why: 'The edge can fade; size should follow the evidence.' },
          ],
          why: 'Kelly gives the shape of the answer: leverage rises with the edge and falls with the square of volatility. The inputs are uncertain, the downside of overbetting is steep, and the upside of exact Kelly is small, so the honest answer is a fraction of a cautious estimate.',
        },
      ],
    },
    {
      id: 'portfolio-var',
      title: 'Measuring risk: VaR, expected shortfall, stress tests and drawdown',
      summary: 'What each risk number says, how to compute it from returns, and what each one misses.',
      text: [
        "**Value at risk** (VaR) at 99% over one day is a loss you expect to exceed on only 1% of days. J.P. Morgan made it standard when it published its RiskMetrics method in 1994. **Parametric** VaR assumes normal returns: `VaR = z × σ × value`, with z = 2.326 at 99% and 1.645 at 95%. **Historical** VaR sorts past returns and reads off the loss at the 1% point. Neither says how large the loss is on that 1% of days.",
        "**Expected shortfall** (ES), also called CVaR, answers that: the average loss on the days beyond VaR. For a normal distribution, ES at 97.5% is almost the same as VaR at 99%; for fat tails it is larger. That is one reason the Basel Committee's Fundamental Review of the Trading Book replaced 99% VaR with 97.5% ES for bank market risk capital (published in 2016 and revised in 2019; timing differs by country). ES is also **subadditive**: the ES of two books combined is never more than the sum of their ES values. VaR can break that.",
        { code: `import numpy as np

r = np.array([-0.05, -0.03, -0.02, -0.01, -0.008] + [0.001] * 95)
k = int(len(r) * 0.05)                          # 5 worst days of 100
worst = np.sort(r)[:k]
print(-worst[-1], round(-worst.mean(), 4))      # 95% VaR 0.008, ES 0.0236` },
        "Time scaling uses `VaR(h days) = VaR(1 day) × √h`, which assumes independent, identically distributed returns: volatility clusters, so it is a rough guide. A VaR model is checked by **backtesting**: count the days the loss beat VaR. At 99% over 250 days you expect 2.5. Under the Basel **traffic light** test, 0 to 4 exceptions is green, 5 to 9 yellow and 10 or more red (rules at the time of writing, 2026; check the current rules for your jurisdiction).",
        "VaR and ES come from the past and assume the near future looks like it. **Stress tests** ask instead what a chosen shock would do to today's positions: stocks −30%, rates +2%, a 2008 or a 2020. **Drawdown**, from the risk and quant modules, measures the path: how far the account fell from a peak, which is what ends careers and funds. None of these is enough on its own. A book that sells far out of the money options can show a tiny VaR, because its loss days are rarer than 1%, and still carry a loss many times larger.",
      ],
      rules: [
        'Parametric VaR = z × σ × value. z = 1.645 at 95%, 2.326 at 99%.',
        'Historical VaR: the loss at the (1 − α) point of sorted returns. ES: the average loss beyond it.',
        'ES 97.5% ≈ VaR 99% for normal returns, larger for fat tails.',
        'h-day VaR ≈ 1-day VaR × √h, only if days are independent.',
        'Backtest: at 99% expect 1 exception in 100 days. Too many means the model understates risk.',
        'VaR misses the size of the tail. Stress tests and drawdown cover what statistics from the past cannot.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'portfolio-var-1',
          ask: 'A $1,000,000 book has a daily volatility of 1.5%. Assuming normal returns, what is its 1-day 99% VaR? Use z = 2.326. Give dollars, to the nearest hundred.',
          answer: 34890,
          tol: 150,
          check: '2.326 * 0.015 * 1_000_000',
          why: '2.326 × 1.5% × $1,000,000 ≈ $34,900. On 99 days in 100 the loss should be smaller. The number says nothing about the hundredth day.',
        },
        {
          kind: 'number',
          id: 'portfolio-var-2',
          ask: 'A 1-day 99% VaR is $20,000. Using the square-root-of-time rule, what is the 10-day VaR? Give dollars, to the nearest hundred.',
          answer: 63246,
          tol: 150,
          check: '20000 * math.sqrt(10)',
          why: '$20,000 × √10 ≈ $63,200. The rule assumes the days are independent with the same volatility. Volatility clusters and losses can trend, so over a bad fortnight the true figure can be larger.',
        },
        {
          kind: 'number',
          id: 'portfolio-var-3',
          ask: 'Daily returns are normal with σ = 1%. ES at 97.5% is σ × φ(1.96) ÷ 0.025, where φ(x) = e^(−x²/2) ÷ √(2π). What is it? Give a percentage to two decimals, for example 1.23%.',
          answer: 0.0234,
          tol: 0.00006,
          check: '0.01 * math.exp(-1.96 ** 2 / 2) / math.sqrt(2 * math.pi) / 0.025',
          why: 'φ(1.96) ≈ 0.0584, and 0.0584 ÷ 0.025 ≈ 2.34, so ES ≈ 2.34%. The 99% VaR is 2.33%: for normal returns the two measures nearly coincide, which is why regulators chose 97.5% for ES. With fat tails ES pulls ahead.',
        },
        {
          kind: 'output',
          id: 'portfolio-var-4',
          ask: 'One hundred made-up daily returns. What does this print?',
          code: `import numpy as np

r = np.array([-0.06, -0.035, -0.03, -0.02, -0.015] + [0.002] * 95)
k = int(len(r) * 0.05)
worst = np.sort(r)[:k]
var = -worst[-1]
es = -worst.mean()
print(var, round(es, 3))`,
          answer: '0.015 0.032',
          why: 'The 5 worst days of 100 mark the 95% tail. VaR is the smallest of those losses, 1.5%; ES is their average, (6 + 3.5 + 3 + 2 + 1.5) ÷ 5 = 3.2%. Make the 6% loss a 16% loss and VaR does not change at all; ES does.',
        },
        {
          kind: 'number',
          id: 'portfolio-var-5',
          ask: 'A 99% one-day VaR model is backtested over 250 trading days. If the model is right, how many days should the loss exceed VaR, on average?',
          answer: 2.5,
          check: '250 * 0.01',
          why: '1% of 250 days is 2.5. Zero exceptions over a year is also worth a look: it can mean the model overstates risk, which ties up capital and blocks good trades.',
        },
        {
          kind: 'output',
          id: 'portfolio-var-6',
          ask: 'Your 99% VaR model had 8 exceptions in 250 days. If the model were right, how likely is 8 or more? What does this print?',
          code: `import math

n, p = 250, 0.01
prob = sum(math.comb(n, k) * p ** k * (1 - p) ** (n - k) for k in range(8, n + 1))
print(round(prob, 3))`,
          answer: '0.004',
          why: 'About 0.4%: a correct model would very rarely produce 8 exceptions. Under the Basel traffic light it is in the yellow zone. The likely story is that the model understates the tails or reacts too slowly to rising volatility.',
        },
        {
          kind: 'number',
          id: 'portfolio-var-7',
          ask: 'Stress test: you hold $400,000 of stocks with a beta of 1.2 to the index, and $200,000 of bonds. The scenario is the index down 30% and bonds down 5%. What is the loss? Give dollars as a positive number.',
          answer: 154000,
          tol: 1,
          check: '400000 * 1.2 * 0.30 + 200000 * 0.05',
          why: 'Stocks: $400,000 × 1.2 × 30% = $144,000. Bonds: $200,000 × 5% = $10,000. Total $154,000. A scenario where both legs fall, as in 2022, is the one a correlation estimated from calm years leaves out.',
        },
        {
          kind: 'choice',
          id: 'portfolio-var-8',
          ask: 'A book sells far out of the money index puts. It loses on about 1 day in 200, but those losses are large. What does its 99% one-day VaR show?',
          options: [
            'A large number, because the puts are risky',
            'A small number, often a gain, because the loss days are rarer than 1% and sit beyond the VaR point',
            'Exactly the worst loss',
            'Nothing, because VaR cannot be computed for options',
          ],
          answer: 1,
          why: 'VaR is a single point of the distribution. If the losses happen less than 1% of the time, the 99% point lies in the quiet days. ES at the same level averages the tail and sees them; a stress test sees them directly.',
        },
        {
          kind: 'choice',
          id: 'portfolio-var-9',
          ask: 'Your manager asks one question: "On our worst days, how much do we lose on average?" Which measure answers it?',
          options: [
            'Value at risk',
            'Expected shortfall',
            'Volatility',
            'Maximum drawdown',
          ],
          answer: 1,
          why: 'ES is the average loss beyond the VaR point. VaR is where the bad days begin, volatility treats gains and losses alike, and maximum drawdown is the worst peak-to-trough fall of the path, a different question about how losses chain together.',
        },
        {
          kind: 'bug',
          id: 'portfolio-var-10',
          ask: 'This should return the 95% historical expected shortfall as a positive number: the average loss on the days at or below the VaR point. It returns a number close to minus the average return.',
          code: `import numpy as np

def expected_shortfall(r, alpha=0.95):
    r = np.asarray(r, float)
    cut = np.quantile(r, 1 - alpha)
    tail = r[r >= cut]
    return -tail.mean()`,
          line: 6,
          fix: '    tail = r[r <= cut]',
          why: 'The tail is the returns at or below the cut. With `>=` it averages the best 95% of days, so the result is about minus the mean return. A sign slip like this turns a risk report into nonsense; test it on a series whose answer you know.',
        },
        {
          kind: 'write',
          id: 'portfolio-var-11',
          numpy: true,
          ask: 'Write `hist_var_es(r, alpha)`: sort the returns, take the k = round(n × (1 − alpha)) worst (at least 1), and return `(var, es)` as positive numbers, VaR the smallest loss among them and ES their average loss.',
          starter: `import numpy as np

def hist_var_es(r, alpha):
    r = np.asarray(r, float)
    pass`,
          solution: `import numpy as np

def hist_var_es(r, alpha):
    r = np.asarray(r, float)
    k = max(1, int(round(len(r) * (1 - alpha))))
    worst = np.sort(r)[:k]
    return float(-worst[-1]), float(-worst.mean())`,
          tests: `r = [-0.06, -0.035, -0.03, -0.02, -0.015] + [0.002] * 95
out = hist_var_es(r, 0.95)
assert out is not None, "the function returns nothing yet"
var, es = out
assert abs(var - 0.015) < 1e-12, f"95% VaR should be 0.015, the 5th worst loss, got {var}"
assert abs(es - 0.032) < 1e-12, f"95% ES should be 0.032, the average of the 5 worst, got {es}"
v99, e99 = hist_var_es(r, 0.99)
assert abs(v99 - 0.06) < 1e-12 and abs(e99 - 0.06) < 1e-12, "at 99% of 100 days, k = 1: both are the worst loss"
x = np.random.default_rng(3).standard_t(3, 2000) * 0.01
v, e = hist_var_es(x, 0.975)
assert e >= v > 0, "ES is never smaller than VaR"`,
          why: 'With 100 days, 99% VaR rests on one observation, so historical tail estimates need long samples and are still noisy. Conventions differ (some interpolate between observations); state yours in the report.',
        },
        {
          kind: 'design',
          id: 'portfolio-var-12',
          ask: 'You run a small multi-strategy book: equity longs, an index put spread overlay and a bond position. Design the daily risk report.',
          checklist: [
            { point: '1-day 99% VaR and 97.5% ES, historical over a long window, with the method stated', why: 'Two measures of the tail, one of where it starts and one of how deep it goes.' },
            { point: 'A count of VaR exceptions over the last 250 days', why: 'It tests whether the model is understating risk.' },
            { point: "Stress scenarios on today's positions: stocks −20% and −35%, rates ±2%, volatility doubling, stocks and bonds falling together", why: 'Shocks bigger than the sample, and correlations that change.' },
            { point: 'Option positions repriced in the scenarios, not approximated by delta', why: 'Options are not linear; a delta number misses gamma and volatility moves.' },
            { point: 'Current drawdown from the peak against a preset limit', why: 'It is the path that forces decisions.' },
            { point: 'Limits for each number and the action when one is breached', why: 'A number with no consequence is decoration.' },
          ],
          why: 'Each measure misses something: VaR the depth of the tail, ES the shocks the sample lacks, stress tests the probability, drawdown the cause. A report that combines them, with limits that trigger action, covers more of the ways a book loses money.',
        },
      ],
    },
    {
      id: 'portfolio-factors',
      title: 'Risk models, beta hedging and concentration',
      summary: 'Explaining a book by a few shared factors, hedging the market out of it, counting how many real bets it holds, and what happens to all of that in a crisis.',
      text: [
        "Most of a stock's risk is shared. A **factor model** writes each return as exposures to a few factors plus a part of its own: `ri = βi·rm + εi` with one factor, the market, or `r = B·f + ε` with k factors (market, sectors, value, momentum and so on). The covariance matrix becomes `Σ = B·F·Bᵀ + D`, where B is the n × k matrix of exposures, F the k × k factor covariance and D the diagonal of **idiosyncratic** (stock-specific) variances. For 500 stocks and 10 factors that is 5,555 numbers instead of 125,250, and the matrix is always valid. Commercial risk models, such as MSCI's Barra models, are this idea at scale.",
        "The exposures of a portfolio add up by weight: portfolio beta `βp = Σ wi·βi`. Its variance splits into **systematic** risk, `βp²·σm²`, and idiosyncratic risk, `Σ wi²·σεi²`. The idiosyncratic part shrinks as you add names; the systematic part does not. A **beta hedge** sells `βp × book value` of the index, for example SPY, to set the market exposure to zero. It removes the market part only, and only as well as β was estimated: betas drift and are often higher in sell-offs.",
        { code: `import numpy as np

w = np.array([0.4, 0.35, 0.25]) * 1_000_000    # dollars in three stocks
beta = np.array([1.3, 0.9, 1.1])
hedge = w @ beta                               # dollars of index to sell
print(round(hedge), round(hedge / 600))       # 1110000 1850 SPY shares at $600` },
        '**Concentration** is how few bets you really hold. The **effective number of positions** is `1 ÷ Σ wi²` (the inverse of the Herfindahl index): 10 equal weights give 10, a book with 40% in one name gives fewer than 4 however many names it lists. The risk shares from the risk parity lesson, by name, sector or factor, show the same thing in risk terms.',
        "In a crisis the factor part takes over. With one factor, the correlation between two stocks of beta 1 is `σm² ÷ (σm² + σε²)`. With 15% market volatility and 25% idiosyncratic volatility that is 0.26; if market volatility jumps to 40% it is 0.72. Nothing about the companies changed: the shared factor got louder. That is what traders mean by correlations going to one, and why a book that looked diversified in calm data can lose all at once. Long-Term Capital Management held many trades that looked unrelated and lost about $4.6 billion in a few months of 1998 when they moved together.",
      ],
      rules: [
        'Factor model: Σ = B·F·Bᵀ + D. Few numbers, always a valid matrix.',
        'Portfolio beta = Σ wi βi. Systematic variance = βp² σm².',
        'Beta hedge: sell βp × book value of the index. It removes only the market part, as well as β is known.',
        'Effective number of positions = 1 ÷ Σ wi².',
        'One factor: pairwise correlation = σm² ÷ (σm² + σε²). Market volatility up, correlation up.',
        'Diversification estimated in calm data is overstated for a crisis.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'portfolio-factors-1',
          ask: 'A book is 50% in a stock with beta 1.2, 30% in one with beta 0.8 and 20% in one with beta 1.5. What is the portfolio beta? Give two decimals.',
          answer: 1.14,
          tol: 0.006,
          check: '0.5 * 1.2 + 0.3 * 0.8 + 0.2 * 1.5',
          why: '0.6 + 0.24 + 0.3 = 1.14. Betas add by weight, like returns. The book moves about 1.14% for each 1% the index moves, on the fitted relationship.',
        },
        {
          kind: 'number',
          id: 'portfolio-factors-2',
          ask: 'That book is worth $2,000,000 with beta 1.14. SPY trades at $600 (a made-up price). How many SPY shares do you sell short to hedge out the market?',
          answer: 3800,
          tol: 1,
          check: '2_000_000 * 1.14 / 600',
          why: '$2,000,000 × 1.14 = $2,280,000 of SPY, which is 3,800 shares. Hedging only $2,000,000 would leave 0.14 of market exposure, $280,000 worth, in a book you believe is neutral.',
        },
        {
          kind: 'number',
          id: 'portfolio-factors-3',
          ask: 'Two stocks, each with beta 1 and 25% idiosyncratic volatility. In a crisis market volatility rises to 40%. Under the one-factor model, what is their correlation? Give two decimals.',
          answer: 0.72,
          tol: 0.006,
          check: '0.4 ** 2 / (0.4 ** 2 + 0.25 ** 2)',
          why: '0.16 ÷ (0.16 + 0.0625) ≈ 0.72, up from 0.26 when the market ran at 15%. The firms are the same; the shared factor got louder. Diversification measured in calm months is overstated for the months that matter.',
        },
        {
          kind: 'number',
          id: 'portfolio-factors-4',
          ask: 'A book has weights 40%, 20%, 20%, 10% and 10%. What is its effective number of positions, 1 ÷ Σ wi²? Give two decimals.',
          answer: 3.85,
          tol: 0.006,
          check: '1 / (0.4 ** 2 + 0.2 ** 2 + 0.2 ** 2 + 0.1 ** 2 + 0.1 ** 2)',
          why: 'Σ wi² = 0.16 + 0.04 + 0.04 + 0.01 + 0.01 = 0.26, and 1 ÷ 0.26 ≈ 3.85. Five names, but the risk of fewer than four equal ones, and that is before counting correlations between them.',
        },
        {
          kind: 'number',
          id: 'portfolio-factors-5',
          ask: 'A risk model covers 500 stocks with 10 factors. It needs 500 × 10 exposures, the 10 × 10 factor covariance (55 distinct numbers) and 500 idiosyncratic variances. How many numbers in total?',
          answer: 5555,
          tol: 0.5,
          check: '500 * 10 + 10 * 11 / 2 + 500',
          why: '5,000 + 55 + 500 = 5,555, against 125,250 for a full sample covariance matrix. Fewer numbers means less estimation error, at the price of assuming the factors capture what stocks share.',
        },
        {
          kind: 'output',
          id: 'portfolio-factors-6',
          ask: 'Twenty stocks, equal weight, each with beta 1 and 30% idiosyncratic volatility; the market has 15% volatility. What does this print?',
          code: `import numpy as np

n = 20
w = np.ones(n) / n
beta, sm, se = np.ones(n), 0.15, np.full(n, 0.30)
sys_var = (w @ beta) ** 2 * sm ** 2
idio_var = np.sum(w ** 2 * se ** 2)
print(round(sys_var / (sys_var + idio_var), 2), round(float(np.sqrt(sys_var + idio_var)), 3))`,
          answer: '0.83 0.164',
          why: 'Systematic variance 0.0225, idiosyncratic 0.09 ÷ 20 = 0.0045. The market brings 83% of the variance of twenty stocks, each of which is mostly idiosyncratic on its own. That is what a beta hedge removes, and what remains is a much smaller risk.',
        },
        {
          kind: 'bug',
          id: 'portfolio-factors-7',
          ask: 'This should build the covariance matrix of a factor model from exposures `B` (n × k), factor covariance `F` (k × k) and a vector `d` of idiosyncratic variances. The off-diagonal covariances come out too large.',
          code: `import numpy as np

def factor_cov(B, F, d):
    B, F, d = np.asarray(B, float), np.asarray(F, float), np.asarray(d, float)
    return B @ F @ B.T + d`,
          line: 5,
          fix: '    return B @ F @ B.T + np.diag(d)',
          why: 'Adding the vector `d` broadcasts it across every row, so it lands in every column, not only on the diagonal. Idiosyncratic risks are independent between stocks, so they belong only on the diagonal: `np.diag(d)`. NumPy raises no error; only a check of the result shows it.',
        },
        {
          kind: 'write',
          id: 'portfolio-factors-8',
          numpy: true,
          ask: 'Write `factor_cov(B, F, d)`: return `B·F·Bᵀ + diag(d)`.',
          starter: `import numpy as np

def factor_cov(B, F, d):
    B, F, d = np.asarray(B, float), np.asarray(F, float), np.asarray(d, float)
    pass`,
          solution: `import numpy as np

def factor_cov(B, F, d):
    B, F, d = np.asarray(B, float), np.asarray(F, float), np.asarray(d, float)
    return B @ F @ B.T + np.diag(d)`,
          tests: `B = np.array([[1.0], [1.0]])
out = factor_cov(B, [[0.0225]], [0.0625, 0.0625])
assert out is not None, "the function returns nothing yet"
assert np.allclose(out, [[0.085, 0.0225], [0.0225, 0.085]]), f"one factor, two beta-1 stocks: [[0.085, 0.0225], [0.0225, 0.085]], got {out}"
B = np.array([[1.2, 0.3], [0.8, -0.2], [1.0, 0.5]])
F = np.array([[0.03, 0.002], [0.002, 0.01]])
d = np.array([0.04, 0.02, 0.05])
C = factor_cov(B, F, d)
assert C.shape == (3, 3), "the result is n x n"
K = B @ F @ B.T
assert np.allclose(C - np.diag(np.diag(C)), K - np.diag(np.diag(K))), "off the diagonal only the factors contribute"
assert np.linalg.eigvalsh(C).min() > 0, "a factor covariance with positive idiosyncratic variances is always valid"`,
          why: "The factor part gives the covariances between stocks; the idiosyncratic part adds only to each stock's own variance. The resulting matrix is valid by construction, one reason risk models are built this way.",
        },
        {
          kind: 'write',
          id: 'portfolio-factors-9',
          numpy: true,
          ask: 'Write `hedge_shares(dollars, betas, index_price)`: the whole number of index shares to sell short so the book has zero beta, rounded to the nearest share.',
          starter: `import numpy as np

def hedge_shares(dollars, betas, index_price):
    pass`,
          solution: `import numpy as np

def hedge_shares(dollars, betas, index_price):
    exposure = float(np.dot(dollars, betas))
    return int(round(exposure / index_price))`,
          tests: `out = hedge_shares([400000, 350000, 250000], [1.3, 0.9, 1.1], 600)
assert out is not None, "the function returns nothing yet"
assert out == 1850, f"$1,110,000 of beta-weighted exposure at $600: 1850 shares, got {out}"
assert isinstance(out, int), "return a whole number of shares"
assert hedge_shares([1_000_000], [1.0], 500) == 2000, "a beta-1 million at $500 is 2000 shares"
assert hedge_shares([500000, -500000], [1.2, 1.2], 600) == 0, "a long and a short with the same beta need no hedge"`,
          why: 'Beta-weighted dollars, not plain dollars, set the hedge. Short positions count with their sign. The hedge is only as good as the betas, which are estimates and drift.',
        },
        {
          kind: 'choice',
          id: 'portfolio-factors-10',
          ask: 'Your long book of 30 stocks is beta hedged with SPY using betas estimated over the past year. The market falls 25% in a month. Which outcome is most likely?',
          options: [
            'The book is flat, because the hedge removes all risk',
            'The book still moves: idiosyncratic risk was never hedged, and betas measured in calm data often rise in a sell-off, leaving the book net long',
            'The book gains exactly 25%',
            'The hedge doubles the loss',
          ],
          answer: 1,
          why: 'A beta hedge zeroes the market exposure as estimated. Stock-specific moves remain, other factors (sector, size, momentum) remain, and the betas themselves change in a crisis. Hedging cuts risk a lot; it does not remove it.',
        },
        {
          kind: 'choice',
          id: 'portfolio-factors-11',
          ask: 'A fund holds 15 market-neutral strategies with low pairwise correlations measured over five calm years. What is the main risk the correlation matrix hides?',
          options: [
            'None: low correlation means independent outcomes',
            'Shared exposures that only show up in stress, such as the same crowded positions, leverage or need for liquidity, so the strategies can lose together',
            'That the strategies are too diversified',
            'That correlations are always negative in crises',
          ],
          answer: 1,
          why: 'Correlations from calm data miss what links strategies in a crisis: many funds holding the same trades and all cutting at once. That is what happened to LTCM in 1998 and to quant equity funds in August 2007, covered in the statarb module.',
        },
        {
          kind: 'design',
          id: 'portfolio-factors-12',
          ask: 'You run a long-short equity book that is meant to be market neutral. Design the checks you run every week.',
          checklist: [
            { point: 'Net beta-weighted exposure, with betas re-estimated on a recent window', why: 'Dollar neutral is not beta neutral, and betas drift.' },
            { point: 'Exposure to sectors and style factors (value, momentum, size)', why: 'A book can be market neutral and still be one large factor bet.' },
            { point: 'Effective number of positions and the largest single-name risk shares', why: 'Concentration hides behind a long list of names.' },
            { point: 'Share of variance from factors against idiosyncratic risk', why: 'If factors dominate, you are not running the stock-picking book you think you are.' },
            { point: 'The same numbers under crisis correlations or a stressed period', why: 'Correlations rise when markets fall; calm-data risk is understated.' },
            { point: 'Short-side risks: borrow cost, recall and crowded shorts', why: 'Squeezes hit the short leg in a way a covariance matrix does not show.' },
          ],
          why: 'Neutrality is a claim about estimated exposures. Checking it from several angles, and under stressed assumptions, is how you find the bet you did not mean to make before the market finds it for you.',
        },
      ],
    },
    {
      id: 'portfolio-lab',
      title: 'Lab: building and comparing portfolios out of sample',
      summary: 'A walk-forward comparison of equal weight, inverse volatility, minimum variance and risk parity, with a volatility target, on made-up returns.',
      text: [
        'This lab builds the whole module into one tool. Six made-up assets come from a one-factor model with a fixed seed: three stock-like assets with betas near 1, two quiet bond-like assets and one in between. Every step repeats the helpers it needs, so each runs on its own.',
        { code: `import numpy as np

def make_returns(seed=7, T=1500):
    rng = np.random.default_rng(seed)
    beta = np.array([1.0, 1.2, 0.8, 0.1, 0.0, 0.5])
    idio = np.array([0.008, 0.012, 0.010, 0.003, 0.004, 0.012])
    m = rng.normal(0.0004, 0.01, T)          # the shared market factor
    return np.outer(m, beta) + rng.normal(0, 1, (T, 6)) * idio + 0.0001` },
        'You will estimate a shrunk covariance from a past window only, turn it into weights four ways, roll forward month by month so every weight is used only on days after it was set (a **walk-forward** test), lever each result to a volatility target, and summarise return, volatility, Sharpe ratio and maximum drawdown.',
        'Read the results with the honesty of the earlier lessons. Differences in volatility between methods are large and stable; differences in Sharpe ratio over a few years of data are mostly noise. Each method is fed only data it could have seen, and costs are left out, so the numbers are an upper bound.',
      ],
      rules: [
        'Estimate only on the past window. A slice that reaches day t or later is look-ahead.',
        'Shrink the covariance before it reaches an optimiser.',
        'Equal weight and inverse volatility are the baselines every method must beat.',
        'Volatility targeting sets the risk level; it does not create an edge, and a cap limits it.',
        'Volatility differences between methods are evidence. Small Sharpe differences are not.',
      ],
      questions: [
        {
          kind: 'write',
          id: 'portfolio-lab-1',
          numpy: true,
          ask: 'Step 1. Write `est_cov(R, delta)`: the sample covariance of the T × n array R (columns are assets), shrunk by `delta` towards the constant correlation target.',
          starter: `import numpy as np

def est_cov(R, delta):
    R = np.asarray(R, float)
    pass`,
          solution: `import numpy as np

def est_cov(R, delta):
    R = np.asarray(R, float)
    S = np.cov(R, rowvar=False)
    vol = np.sqrt(np.diag(S))
    corr = S / np.outer(vol, vol)
    n = len(vol)
    rbar = (corr.sum() - n) / (n * (n - 1))
    F = rbar * np.outer(vol, vol)
    np.fill_diagonal(F, np.diag(S))
    return delta * F + (1 - delta) * S`,
          tests: `rng = np.random.default_rng(0)
R = rng.normal(0, 0.01, (300, 4)) + rng.normal(0, 0.01, (300, 1))
out = est_cov(R, 0.3)
assert out is not None, "the function returns nothing yet"
S = np.cov(R, rowvar=False)
assert out.shape == (4, 4), f"the result must be n x n (4, 4), got {out.shape}: did you use rowvar=False?"
assert np.allclose(est_cov(R, 0.0), S), "delta = 0 must return the sample covariance"
assert np.allclose(np.diag(out), np.diag(S)), "shrinkage must leave the variances alone"
v = np.sqrt(np.diag(S)); c1 = est_cov(R, 1.0) / np.outer(v, v)
off = c1[~np.eye(4, dtype=bool)]
assert np.allclose(off, off[0]), "delta = 1 gives the same correlation everywhere off the diagonal"`,
          why: 'This is the shrinkage lesson as a building block. A δ of 0.3 is a judgement call; Ledoit and Wolf give a way to estimate it from the data.',
        },
        {
          kind: 'write',
          id: 'portfolio-lab-2',
          numpy: true,
          ask: "Step 2. Write `weights(cov, method)` for method `'equal'`, `'invvol'` (∝ 1/σ), `'minvar'` (Σ⁻¹1 scaled to sum to 1) and `'erc'` (equal risk contributions by the loop from the risk parity lesson, 200 passes). All must sum to 1.",
          starter: `import numpy as np

def weights(cov, method):
    cov = np.asarray(cov, float)
    n = len(cov)
    return np.ones(n) / n`,
          solution: `import numpy as np

def weights(cov, method):
    cov = np.asarray(cov, float)
    n = len(cov)
    if method == 'equal':
        return np.ones(n) / n
    if method == 'invvol':
        w = 1 / np.sqrt(np.diag(cov))
        return w / w.sum()
    if method == 'minvar':
        w = np.linalg.solve(cov, np.ones(n))
        return w / w.sum()
    if method == 'erc':
        w = np.ones(n) / n
        for _ in range(200):
            for i in range(n):
                a = cov[i] @ w - cov[i, i] * w[i]
                w[i] = (-a + np.sqrt(a * a + 4 * cov[i, i] / n)) / (2 * cov[i, i])
        return w / w.sum()
    raise ValueError(method)`,
          tests: `cov = np.diag([0.04, 0.01])
out = weights(cov, 'equal')
assert out is not None, "the function returns nothing yet"
assert np.allclose(out, [0.5, 0.5]), "equal weight is 1/n"
assert np.allclose(weights(cov, 'invvol'), [1 / 3, 2 / 3]), "inverse volatility on 20% and 10%: [1/3, 2/3]"
assert np.allclose(weights(cov, 'minvar'), [0.2, 0.8]), "minimum variance, uncorrelated: inverse variance, [0.2, 0.8]"
assert np.allclose(weights(cov, 'erc'), [1 / 3, 2 / 3], atol=1e-6), "two assets: equal risk is inverse volatility"
vol = np.array([0.16, 0.06, 0.18]); c = np.array([[1, 0, 0.3], [0, 1, 0], [0.3, 0, 1]]) * np.outer(vol, vol)
w = weights(c, 'erc'); rc = w * (c @ w)
assert np.allclose(rc / rc.sum(), 1 / 3, atol=1e-6), "erc: each asset brings the same share of risk"`,
          why: 'Four rules that need different amounts of estimation: none, volatilities, the full matrix, and the full matrix again. The more a rule needs, the more estimation error it can absorb.',
        },
        {
          kind: 'output',
          id: 'portfolio-lab-3',
          ask: 'Step 3. Two of the rules on a known covariance for three assets: stocks, bonds and commodities. What does this print?',
          code: `import numpy as np

vol = np.array([0.16, 0.06, 0.18])
corr = np.array([[1.0, 0.0, 0.3], [0.0, 1.0, 0.0], [0.3, 0.0, 1.0]])
cov = corr * np.outer(vol, vol)
iv = (1 / vol) / (1 / vol).sum()
mv = np.linalg.solve(cov, np.ones(3)); mv /= mv.sum()
print(iv.round(2).tolist(), mv.round(2).tolist())`,
          answer: '[0.22, 0.59, 0.2] [0.09, 0.84, 0.07]',
          why: 'Inverse volatility already leans on bonds. Minimum variance goes further, to 84%, because it weights by variance and also uses the correlation between stocks and commodities to cut both. Both leave a portfolio far quieter than equal weight, which is why the volatility target comes later.',
        },
        {
          kind: 'write',
          id: 'portfolio-lab-4',
          numpy: true,
          ask: 'Step 4. Write `backtest(R, method, window=250, step=21, delta=0.3)`: for t = window, window + step, …, set weights from `est_cov(R[t − window:t], delta)` and apply them to days t to t + step − 1, returning the array of daily portfolio returns. `est_cov` and `weights` are given.',
          starter: `import numpy as np

def est_cov(R, delta):
    S = np.cov(R, rowvar=False)
    vol = np.sqrt(np.diag(S))
    corr = S / np.outer(vol, vol)
    n = len(vol)
    rbar = (corr.sum() - n) / (n * (n - 1))
    F = rbar * np.outer(vol, vol)
    np.fill_diagonal(F, np.diag(S))
    return delta * F + (1 - delta) * S

def weights(cov, method):
    n = len(cov)
    if method == 'equal':
        return np.ones(n) / n
    w = np.linalg.solve(cov, np.ones(n)) if method == 'minvar' else 1 / np.sqrt(np.diag(cov))
    return w / w.sum()

def backtest(R, method, window=250, step=21, delta=0.3):
    return np.zeros(0)`,
          solution: `import numpy as np

def est_cov(R, delta):
    S = np.cov(R, rowvar=False)
    vol = np.sqrt(np.diag(S))
    corr = S / np.outer(vol, vol)
    n = len(vol)
    rbar = (corr.sum() - n) / (n * (n - 1))
    F = rbar * np.outer(vol, vol)
    np.fill_diagonal(F, np.diag(S))
    return delta * F + (1 - delta) * S

def weights(cov, method):
    n = len(cov)
    if method == 'equal':
        return np.ones(n) / n
    w = np.linalg.solve(cov, np.ones(n)) if method == 'minvar' else 1 / np.sqrt(np.diag(cov))
    return w / w.sum()

def backtest(R, method, window=250, step=21, delta=0.3):
    out = []
    for t in range(window, len(R), step):
        w = weights(est_cov(R[t - window:t], delta), method)
        out.extend(R[t:t + step] @ w)
    return np.array(out)`,
          tests: `rng = np.random.default_rng(7)
beta = np.array([1.0, 1.2, 0.8, 0.1, 0.0, 0.5]); idio = np.array([0.008, 0.012, 0.010, 0.003, 0.004, 0.012])
R = np.outer(rng.normal(0.0004, 0.01, 1500), beta) + rng.normal(0, 1, (1500, 6)) * idio + 0.0001
out = backtest(R, 'equal')
assert out is not None and len(out) > 0, "the function returns nothing yet"
assert len(out) == 1250, f"days 250 to 1499 are out of sample: 1250 returns, got {len(out)}"
assert np.allclose(out, R[250:].mean(axis=1)), "equal weight is the average of the six returns each day"
mv = backtest(R, 'minvar')
w0 = weights(est_cov(R[:250], 0.3), 'minvar')
assert np.allclose(mv[:21], R[250:271] @ w0), "the first month must use weights from days 0 to 249 only"
w1 = weights(est_cov(R[21:271], 0.3), 'minvar')
assert np.allclose(mv[21:42], R[271:292] @ w1), "the second month must use the window that ends the day before it starts"`,
          why: 'Each month uses only the 250 days before it, which is what makes this out of sample. Holding fixed weights each day is a simplification: real weights drift between rebalances, and every rebalance costs money that this loop leaves out.',
        },
        {
          kind: 'bug',
          id: 'portfolio-lab-5',
          ask: 'Step 5. A colleague changed the backtest, and the minimum variance result improved. One line now uses data it could not have had.',
          code: `import numpy as np

def backtest(R, method, window=250, step=21, delta=0.3):
    out = []
    for t in range(window, len(R), step):
        cov = est_cov(R[t - window:t + step], delta)
        w = weights(cov, method)
        out.extend(R[t:t + step] @ w)
    return np.array(out)`,
          line: 6,
          fix: '        cov = est_cov(R[t - window:t], delta)',
          why: 'The slice runs to t + step, so the covariance includes the very month the weights are then judged on. Look-ahead in a risk estimate rarely looks dramatic, which is what makes it dangerous: it always flatters, and nothing in the output warns you.',
        },
        {
          kind: 'write',
          id: 'portfolio-lab-6',
          numpy: true,
          ask: 'Step 6. Write `vol_target(r, target=0.10, lookback=60, cap=2.0)`: for each day i from `lookback` on, leverage = min(cap, target ÷ (std of r[i − lookback:i], ddof=1, × √252)), and the scaled return is leverage × r[i]. Return the array of scaled returns (length len(r) − lookback).',
          starter: `import numpy as np

def vol_target(r, target=0.10, lookback=60, cap=2.0):
    r = np.asarray(r, float)
    return r[lookback:]`,
          solution: `import numpy as np

def vol_target(r, target=0.10, lookback=60, cap=2.0):
    r = np.asarray(r, float)
    out = np.empty(len(r) - lookback)
    for i in range(lookback, len(r)):
        lev = min(cap, target / (r[i - lookback:i].std(ddof=1) * np.sqrt(252)))
        out[i - lookback] = lev * r[i]
    return out`,
          tests: `r = np.random.default_rng(1).normal(0, 0.005, 800)
out = vol_target(r)
assert out is not None, "the function returns nothing yet"
assert len(out) == 740, f"one scaled return per day after the lookback: 740, got {len(out)}"
lev0 = min(2.0, 0.10 / (r[:60].std(ddof=1) * np.sqrt(252)))
assert abs(out[0] - lev0 * r[60]) < 1e-15, "day 60 uses days 0 to 59 only"
assert np.all(np.abs(out) <= 2.0 * np.abs(r[60:]) + 1e-15), "leverage must never exceed the cap"
loud = np.random.default_rng(2).normal(0, 0.02, 800)
v = vol_target(loud).std(ddof=1) * np.sqrt(252)
assert 0.085 < v < 0.115, f"a noisy series should be scaled to about 10% a year, got {v:.3f}"`,
          why: 'Leverage for day i uses the 60 days before it, never day i itself. The cap matters for quiet portfolios: a minimum variance book can need more leverage than the cap allows, and that limit is a deliberate choice, not a flaw.',
        },
        {
          kind: 'write',
          id: 'portfolio-lab-7',
          numpy: true,
          ask: 'Step 7. Write `summary(r)`: return `(ann_ret, ann_vol, sharpe, max_dd)` for daily returns r, with ann_ret = mean × 252, ann_vol = std (ddof=1) × √252, sharpe = ann_ret ÷ ann_vol, and max_dd the largest fall of compounded wealth from its running peak, as a positive fraction.',
          starter: `import numpy as np

def summary(r):
    r = np.asarray(r, float)
    pass`,
          solution: `import numpy as np

def summary(r):
    r = np.asarray(r, float)
    ann_ret = r.mean() * 252
    ann_vol = r.std(ddof=1) * np.sqrt(252)
    wealth = np.cumprod(1 + r)
    dd = 1 - wealth / np.maximum.accumulate(wealth)
    return float(ann_ret), float(ann_vol), float(ann_ret / ann_vol), float(dd.max())`,
          tests: `out = summary([0.01, -0.02, 0.01, 0.01])
assert out is not None, "the function returns nothing yet"
ret, vol, sr, mdd = out
assert abs(ret - 0.0025 * 252) < 1e-12, f"annual return is mean x 252, got {ret}"
assert abs(vol - np.std([0.01, -0.02, 0.01, 0.01], ddof=1) * np.sqrt(252)) < 1e-12, "annual vol is std (ddof=1) x sqrt(252)"
assert abs(sr - ret / vol) < 1e-12, "Sharpe is return / vol"
assert abs(mdd - 0.02) < 1e-12, f"the only fall is the 2% day, got {mdd}"
assert abs(summary([0.1, -0.5, 0.2])[3] - 0.5) < 1e-12, "a 50% day from a peak is a 50% drawdown"`,
          why: 'Drawdown is measured on compounded wealth, from its running maximum. The Sharpe ratio here is against zero, since the made-up returns stand for excess returns; with real data subtract cash first.',
        },
        {
          kind: 'output',
          id: 'portfolio-lab-8',
          ask: 'Step 8. The comparison. For each method this prints the realised volatility of the walk-forward portfolio, then of the same portfolio after a 10% volatility target with a 2× cap. What does it print?',
          code: `import numpy as np

rng = np.random.default_rng(7)
beta = np.array([1.0, 1.2, 0.8, 0.1, 0.0, 0.5]); idio = np.array([0.008, 0.012, 0.010, 0.003, 0.004, 0.012])
R = np.outer(rng.normal(0.0004, 0.01, 1500), beta) + rng.normal(0, 1, (1500, 6)) * idio + 0.0001

def est_cov(R, d):
    S = np.cov(R, rowvar=False); v = np.sqrt(np.diag(S)); n = len(v)
    rbar = ((S / np.outer(v, v)).sum() - n) / (n * (n - 1))
    F = rbar * np.outer(v, v); np.fill_diagonal(F, np.diag(S))
    return d * F + (1 - d) * S

def weights(C, m):
    n = len(C)
    w = np.ones(n) if m == 'equal' else 1 / np.sqrt(np.diag(C)) if m == 'invvol' else np.linalg.solve(C, np.ones(n))
    return w / w.sum()

def vol_target(r, lb=60):
    return np.array([min(2.0, 0.1 / (r[i - lb:i].std(ddof=1) * np.sqrt(252))) * r[i] for i in range(lb, len(r))])

ann = lambda x: round(float(x.std(ddof=1) * np.sqrt(252)), 3)
for m in ('equal', 'invvol', 'minvar'):
    r = np.concatenate([R[t:t + 21] @ weights(est_cov(R[t - 250:t], 0.3), m) for t in range(250, 1500, 21)])
    print(m, ann(r), ann(vol_target(r)))`,
          answer: 'equal 0.112 0.102\ninvvol 0.065 0.102\nminvar 0.039 0.078',
          why: 'Minimum variance delivers the lowest risk out of sample, as theory says. The volatility target brings equal weight and inverse volatility to about 10%, but minimum variance is so quiet that the 2× cap binds and it stays near 7.8%. Volatility is predictable; whether one method earns more per unit of risk is a much noisier question.',
        },
        {
          kind: 'design',
          id: 'portfolio-lab-9',
          ask: 'Step 9. Your walk-forward run shows minimum variance with the highest Sharpe ratio and lowest drawdown over five made-up years. Write up what you can and cannot conclude, and what you would test next before using any of it with real money.',
          checklist: [
            { point: 'Lower volatility for minimum variance is a solid finding; a higher Sharpe ratio over five years is weak evidence', why: 'The standard error of a Sharpe ratio over five years is about 1 ÷ √5 ≈ 0.45, larger than the gaps between methods.' },
            { point: 'The data were made up from a model where the quiet assets are truly quiet', why: 'Real low-volatility assets can change character, as bonds did in 2022.' },
            { point: 'Add trading costs for each rebalance and compare turnover between methods', why: 'Minimum variance trades more than equal weight; costs can erase a small gain.' },
            { point: 'Check the leverage the volatility target needs and what it costs to borrow', why: 'A quiet book levered to 10% depends on financing and on the cap.' },
            { point: 'Vary the window, δ, the rebalance frequency and the seed', why: 'A result that holds only for one setting is fitted, not found.' },
            { point: 'Stress test the final weights in a scenario where stocks and bonds fall together', why: 'Covariance-based methods inherit the correlation assumptions of the window.' },
            { point: 'Compare everything with the equal weight and inverse volatility baselines', why: 'A complex method must beat simple ones out of sample, after costs.' },
          ],
          why: 'The lab shows the mechanics of a fair comparison. Its numbers come from a model you chose, without costs, so they are a check of the code and of intuition, not evidence that any method will earn more on real markets.',
        },
      ],
    },
  ],
}
