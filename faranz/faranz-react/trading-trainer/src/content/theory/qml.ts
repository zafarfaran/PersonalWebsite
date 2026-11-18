import type { Block } from '../../types'

/** The full theory for each lesson of the qml module, keyed by lesson id. */
export const qmlTheory: Record<string, Block[]> = {
  'qml-why': [
    { h: 'What machine learning does' },
    '**Machine learning** is a family of methods that learn a rule from examples. You give it many rows, each with **features** (inputs, such as the last five days of returns) and a **target** (what you want to predict, such as tomorrow\'s return), and it finds a function that maps one to the other. The methods in this module, linear models, trees and ensembles, are all ways of finding that function. In industry they are fitted with libraries such as scikit-learn, XGBoost, LightGBM and PyTorch. Here you write small versions in NumPy so you can see what each one does.',
    'The same methods that read handwriting or sort photos struggle with prices. Three facts about markets explain most of why.',

    { h: 'Signal and noise in returns' },
    { sub: 'How much a feature explains' },
    'The **correlation** ρ (rho) between a feature and the next return measures how closely they move together, from −1 to +1. If you forecast the return with a straight line through the feature, the share of the return\'s variance the line explains is **R² = ρ²**. A correlation of 0.08, which would be a strong daily signal, gives R² = 0.0064: under two-thirds of one percent. The rest is noise the model cannot see.',
    { sub: 'How often the sign is right' },
    'Traders often ask how often a model calls the direction correctly, its **hit rate**. When the feature and the return are both normally distributed with correlation ρ, the chance that they have the same sign is `1/2 + arcsin(ρ)/π`, where arcsin is the inverse sine in radians.',
    {
      code: `import math

for rho in (0.02, 0.08, 0.2):
    print(rho, round(0.5 + math.asin(rho) / math.pi, 4))`,
      out: `0.02 0.5064
0.08 0.5255
0.2 0.5641`,
    },
    'Even a correlation of 0.2, far beyond what daily features usually reach, is right only about 56% of the time. A model with a realistic signal is wrong on almost half of the days, which is normal, and is why it must be judged by what it earns over many days.',
    { sub: 'Making test data with a chosen correlation' },
    'To test code you often need a made-up feature x and return y with a known correlation. Draw x and an independent noise e, both standard normal, and set `y = ρx + √(1 − ρ²)e`. The square root makes the variance of y equal to ρ² + (1 − ρ²) = 1, so the correlation comes out at exactly ρ on average. Leave the square root out and the noise is too small and the correlation too strong.',

    { h: 'How much data there really is' },
    { sub: 'The noise band of a correlation' },
    'A correlation measured on n independent pairs wanders around the true value with a standard error of about `1/√n` when the true value is small. Twice that, `2/√n`, is a rough noise band: a measured correlation inside it cannot be told from zero. With 900 days the band is ±0.067. The t statistic of a correlation is about `ρ × √n`, so to reach t = 2 for a true ρ you need about `(2/ρ)²` observations. For ρ = 0.05 that is 1,600 days, more than six years.',
    { sub: 'Overlapping labels' },
    'If each day is labelled with the return over the next h days, neighbouring labels share h − 1 days. Ten years of daily rows with a 5-day label holds about 2,520 ÷ 5 = 504 independent 5-day outcomes, not 2,520. Counting every row as independent makes evidence look far stronger than it is.',

    { h: 'A target that moves' },
    'A model assumes the link between features and target stays the same. In markets it does not. Interest rates, regulation, the mix of traders and the trades other quants run all change, so a series whose behaviour changes over time is called **non-stationary**. Prices also react to being predicted: when many traders act on a pattern, their trades move prices and weaken it. A photograph of a dog does not change because a model labelled it.',

    { h: 'What large studies find' },
    'Gu, Kelly and Xiu, "Empirical Asset Pricing via Machine Learning" (Review of Financial Studies, 2020), is one of the largest tests. They forecast the monthly returns of nearly 30,000 US stocks from 1957 to 2016 with 94 company characteristics, their interactions with eight economy-wide variables, and industry dummies: over 900 predictors. In the working paper\'s main table the out-of-sample R², measured on later years the models never saw, was about 0.3% to 0.4% a month for trees and neural networks, and negative for plain least squares on all predictors. The authors considered that a strong result, and it is: spread across thousands of stocks it can matter. It is also a guide to scale. A daily model that claims far more deserves suspicion before excitement.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Expecting accuracy like image recognition, and treating 52% as failure or 65% as normal.',
        'Counting overlapping rows as independent evidence.',
        'Assuming a relationship found in old data still holds.',
        'Judging a model by its hit rate instead of by what it earns after costs.',
      ],
    },
  ],

  'qml-framing': [
    { h: 'Rows, features and labels' },
    'A supervised model learns from a table of rows. Each row stands for one decision time t. Its **features** are numbers you could have computed at t. Its **label** is the outcome you want to predict, which only becomes known after t. The model learns to map features to labels, and is later used on new rows where only the features are known.',
    { sub: 'The decision time' },
    'For daily data, take the decision time to be the close of day t. Features can use any data up to and including that close. The label is usually the return from the close of t to the close of t + h, where h is the **horizon**. The backtest module called the failure of this rule **lookahead**: using information you could not have had. In machine learning the same failure is often called **leakage**.',
    { sub: 'Lining up in code' },
    'With returns in an array, the cleanest way to build rows is to choose the index t once and derive both columns from it.',
    {
      code: `import numpy as np

r = np.array([0.4, -0.1, 0.3, -0.6, 0.2])
X = r[:-1]          # the return that ended at t
y = r[1:]           # the return that follows t
print(X.tolist())
print(y.tolist())`,
      out: `[0.4, -0.1, 0.3, -0.6]
[-0.1, 0.3, -0.6, 0.2]`,
    },
    'Each feature sits above the return that came after it. With prices, the **log return** from t to t + h is `ln(p[t+h] / p[t])`, and a feature such as the past k-day return is `ln(p[t] / p[t−k])`. Both depend only on t, so writing them from the same index keeps them aligned.',

    { h: 'Choosing the horizon' },
    'A 1-day label is mostly noise. A longer label averages away some noise and may carry more of a slow signal, but labels measured every day then overlap: with h = 6, today\'s label and tomorrow\'s share 5 of their 6 days. The rows look plentiful and are not. Choose the horizon you would actually hold a trade for, and count evidence in non-overlapping periods.',

    { h: 'Regression or classification' },
    '**Regression** predicts a number, here the return. **Classification** predicts a category, such as up or down. Classification is attractive because accuracy is easy to read, but an up/down label treats a 0.05% day and a 4% day the same. A model can be right on most small days and wrong on the few large ones, look accurate, and lose money.',
    { sub: 'A dead zone' },
    'One fix is a **dead zone**: label a move +1 only if it is above some threshold, −1 if below minus the threshold, and 0 otherwise. With a threshold of 1%, returns of 1.5%, 0.3% and −2% become 1, 0 and −1. The threshold is often set from trading costs or from volatility, and it should be fixed before you look at results.',
    { sub: 'The triple barrier' },
    'Marcos López de Prado\'s book Advances in Financial Machine Learning (2018) popularised the **triple-barrier** label, which follows the trade you would really place. From the start price, set an upper barrier (a profit target), a lower barrier (a stop) and a time limit. Walk forward bar by bar: the label is +1 if the upper barrier is touched first, −1 if the lower one is, and 0 if time runs out first (some versions use the sign of the return at the time limit instead). For example, with a 4% target, a 2% stop and 5 bars, the path 50, 50.5, 49.2, 48.9 hits the stop on the third bar (48.9 is 2.2% below 50), so the label is −1.',

    { h: 'Leaks in features and labels' },
    { sub: 'A label that overlaps its feature' },
    'If a feature sums the returns up to and including day t, the label must start at t + 1. Using the return of day t as the label hands the answer to the model. The tell-tale sign is a hit rate that looks too good, such as 70% on daily direction.',
    { sub: 'Scaling with the whole sample' },
    'A **z-score** rescales a number as (x − mean) ÷ standard deviation. If the mean and standard deviation come from the whole history, every early row has been scaled with information from the future. Compute them from a trailing window that ends at t, or, for a model, from the training period only. Other common leaks: centred moving averages, which use days after t, and in pandas `shift(-1)` applied to a feature, which pulls tomorrow\'s value into today\'s row.',

    { h: 'Scaling the label by volatility' },
    'Model fitting usually minimises squared error, which gives large numbers large weight. A few crisis weeks can then dominate the whole fit. Dividing each label by the **trailing volatility**, the standard deviation of the previous 20 or so daily returns, puts calm and wild periods on a similar scale. It stays clean because it uses only the past. Dividing by future volatility would be a leak.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Building features and labels with separate shifts, so they drift out of line.',
        'Scaling features with statistics from the whole dataset.',
        'Using up/down labels and then being surprised that accuracy does not pay.',
        'Choosing the dead zone or barriers after seeing which values work best.',
      ],
    },
  ],

  'qml-linear': [
    { h: 'The linear forecast' },
    'A **linear model** forecasts the label as a weighted sum of the features plus a constant: `forecast = b0 + b1·x1 + b2·x2 + …`. The weights b are the **coefficients** and b0 is the **intercept**. In matrix form, with the features of all rows in a matrix X (one row per day, one column per feature), the forecasts are `b0 + X·b`. Linear models are fast, easy to inspect, and hard to beat on noisy data, which is why they come first.',
    { sub: 'Least squares' },
    '**Ordinary least squares (OLS)** chooses b to make the sum of squared errors on the training rows as small as possible. The answer is `b = (XᵀX)⁻¹ Xᵀy`, where Xᵀ is X transposed (rows and columns swapped) and ⁻¹ is the matrix inverse. In NumPy, `np.linalg.lstsq(X, y)` or `np.linalg.solve(X.T @ X, X.T @ y)` computes it; scikit-learn\'s `LinearRegression` does the same.',

    { h: 'Why least squares overfits weak signals' },
    'OLS uses every coefficient to reduce training error, whether the feature is real or noise. With p features of pure noise and n rows, the **in-sample R²**, the share of variance explained on the training data, comes out at about p/n even though the true value is zero.',
    {
      code: `import numpy as np

rng = np.random.default_rng(0)
n, p = 200, 20
X = rng.normal(0, 1, (n, p))
y = rng.normal(0, 1, n)
b = np.linalg.lstsq(np.c_[np.ones(n), X], y, rcond=None)[0]
fit = np.c_[np.ones(n), X] @ b
print(round(1 - ((y - fit) ** 2).sum() / ((y - y.mean()) ** 2).sum(), 2))`,
      out: `0.09`,
    },
    'Twenty noise features on 200 rows "explain" about 10% (here 9%). On new data the same coefficients make forecasts worse than predicting zero, because they add noise to every forecast. With weak market signals this is the normal case, not a rare one.',

    { h: 'Ridge regression' },
    { sub: 'The penalty' },
    '**Ridge** adds a cost for large coefficients: it minimises the squared error plus λ × Σb², where λ (lambda) is a number you choose. λ = 0 is OLS. As λ grows, every coefficient is pulled towards zero. The solution is `b = (XᵀX + λI)⁻¹ Xᵀy`, where I is the **identity matrix**, ones on the diagonal and zeros elsewhere, so λ is added to the diagonal of XᵀX only. Adding λ to every entry of the matrix is a common bug.',
    { sub: 'One feature' },
    'With one feature and no intercept, XᵀX is the number Σx² and Xᵀy is Σxy, so OLS gives `Σxy ÷ Σx²` and ridge gives `Σxy ÷ (Σx² + λ)`. With Σxy = 3 and Σx² = 12, OLS gives 0.25; ridge with λ = 12 gives 3 ÷ 24 = 0.125, half as much. The less information the data holds (small Σx²), the more a given λ shrinks.',

    { h: 'Lasso regression' },
    { sub: 'The soft threshold' },
    '**Lasso** uses the penalty λ × Σ|b| instead. Its effect is different: small coefficients are set exactly to zero, so lasso also chooses which features to keep. For a single standardised feature whose OLS slope is z, the lasso coefficient is the **soft threshold** `sign(z) × max(|z| − λ, 0)`: move z towards zero by λ, and stop at zero. With z = −0.5 and λ = 0.2 it gives −0.3; with z = 0.12 and λ = 0.2 it gives 0.',
    { sub: 'Coordinate descent' },
    'With many features lasso has no closed formula. **Coordinate descent** solves it one coefficient at a time: holding the others fixed, compute what feature j would explain of the remaining error, `rho = mean(xj × (y − X·b + xj·bj))`, and set bj to the soft threshold of rho. Sweep over all features repeatedly until nothing changes. This is the algorithm inside `sklearn.linear_model.Lasso`, for features standardised to mean 0 and standard deviation 1. **Elastic net** combines both penalties.',

    { h: 'Standardising and the intercept' },
    'Penalties compare coefficients, so the features must be on the same scale. A feature measured in dollars needs a tiny coefficient and is barely penalised; one measured as a z-score is penalised hard. **Standardise** each feature to mean 0 and standard deviation 1 using the training period\'s statistics only. The intercept should not be penalised: centre X and y by subtracting their means, fit b on the centred data, then recover `b0 = mean(y) − mean(X)·b`.',

    { h: 'Choosing λ' },
    'λ is chosen by how well the model forecasts data it did not see: fit on an earlier period, score several λ values on a later one, pick the best, then test once on a period later still. Scan λ on a log scale (0.1, 1, 10, 100, …). When results are flat across a range, prefer the larger λ: more shrinkage is the safer mistake with weak signals. In Gu, Kelly and Xiu\'s study, OLS on all 920 predictors scored an out-of-sample R² of −3.46% a month, while penalised and dimension-reduced linear models were positive. scikit-learn\'s `RidgeCV` and `LassoCV` choose λ automatically, but by default with ordinary cross-validation, which is not time-aware; pass a time-series splitter.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Trusting in-sample R² from many features and few rows.',
        'Penalising unstandardised features, or penalising the intercept.',
        'Reading lasso\'s choice between two near-identical features as a discovery.',
        'Choosing λ on the same data used to report results.',
      ],
    },
  ],

  'qml-trees': [
    { h: 'From lines to splits' },
    'A linear model draws a straight line (or flat surface) through the data. A **decision tree** instead cuts the data into boxes with yes-or-no questions such as "is the 20-day return below 2%?" and forecasts the average label in each box. Trees can follow bends and thresholds that a straight line cannot, and they are the building blocks of two of the most used methods in applied machine learning: random forests and gradient boosting.',

    { h: 'The decision stump' },
    { sub: 'Finding the best split' },
    'The smallest tree, a **stump**, asks one question about one feature. For each candidate threshold t, the rows with x ≤ t go left and the rest go right, and each side forecasts its own mean. The **sum of squared errors (SSE)** adds up (label − forecast)² over all rows. The best threshold is the one with the smallest SSE.',
    {
      code: `import numpy as np

x = np.array([1.0, 2.0, 3.0, 4.0])
y = np.array([2.0, 4.0, 9.0, 11.0])
for t in x[:-1]:
    lo, hi = y[x <= t], y[x > t]
    sse = ((lo - lo.mean()) ** 2).sum() + ((hi - hi.mean()) ** 2).sum()
    print(t, sse)`,
      out: `1.0 26.0
2.0 4.0
3.0 26.0`,
    },
    'Splitting after x = 2 leaves means of 3 and 10 and an SSE of 4, far below the other choices. The candidates are the distinct values of x except the largest, since a split above every row puts nothing on the right.',
    { sub: 'Deeper trees' },
    'A **tree** repeats the search inside each box, to a chosen **depth**. Depth 3 gives up to 8 boxes, called **leaves**. A tree grown until each leaf holds one row reproduces the training data exactly and has learned nothing general. On returns, depth is one of the main settings that decides how much noise a tree fits.',

    { h: 'Bagging and random forests' },
    { sub: 'Averaging many trees' },
    'Deep trees are unstable: change a few rows and the tree changes a lot. **Bagging**, short for bootstrap aggregation, fits many trees and averages them. Each tree sees a **bootstrap sample**: n rows drawn from the n available **with replacement**, so some rows appear twice and roughly a third are left out. Drawing without replacement would give every tree the same rows in a different order.',
    { sub: 'Why correlation limits the gain' },
    'If each tree\'s forecast has variance σ² and any two trees are correlated by ρ, the average of B trees has variance `ρσ² + (1 − ρ)σ²/B`. With ρ = 0.3, σ² = 2 and B = 50 that is 0.6 + 0.028. More trees shrink only the second term; the first is a floor set by how alike the trees are. A **random forest** lowers ρ by letting each split choose among a random subset of the features, so the trees do not all start with the same strong feature.',

    { h: 'Boosting' },
    '**Gradient boosting** builds trees one after another. Start with a constant forecast, the mean of y. Compute the **residuals**, y − forecast. Fit a small tree, often a stump, to the residuals, and add a fraction of its forecast to the running forecast. That fraction is the **learning rate**; 0.1 means each tree moves the forecast a tenth of the way it suggests. Repeat for many **rounds**.',
    'If a stump suggests −1.5 for a row and the learning rate is 0.05, the row\'s forecast moves by −0.075 in that round. Fitting to the residuals is what makes each round fix what earlier rounds missed; fitting to y every time would add the same stump over and over. Training error falls with every round, so the number of rounds must be chosen on later data, and on noisy data the best number is often small.',

    { h: 'What trees buy and what they cost' },
    'Trees capture **non-linear effects** (a feature matters only above some level) and **interactions** (a feature matters only when another is in some range) without you constructing them. They are unaffected by rescaling a feature and little affected by outliers in features. The costs: they fit noise more readily, need more data, have more settings, cannot extrapolate beyond the training range, and are harder to inspect. With overlapping labels, bootstrap samples contain near-duplicate rows, so the trees are more alike than they seem. In practice: scikit-learn\'s `RandomForestRegressor` and `HistGradientBoostingRegressor`, and the XGBoost and LightGBM libraries.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Choosing depth or rounds by training error, which always prefers more.',
        'Skipping the ridge baseline and crediting the tree with an edge a line would have found.',
        'Tuning many settings on the same test period, which flatters the most flexible model.',
        'Reading the tree\'s splits as facts about the market.',
      ],
    },
  ],

  'qml-validation': [
    { h: 'Why validation decides everything' },
    '**Validation** means estimating how a model will do on data it has not seen. In markets almost every model looks good on its training data, so validation is where the truth comes out. The standard method in most machine learning, shuffled k-fold cross-validation, gives wrong answers on time series. This lesson is about why, and what to use instead.',

    { h: 'k-fold cross-validation and its two leaks' },
    { sub: 'How k-fold works' },
    '**k-fold cross-validation** splits the rows into k groups (folds), usually at random. It trains on k − 1 folds, tests on the remaining one, and repeats so every fold is tested once. The average test score is the estimate. scikit-learn\'s `cross_val_score` does this by default.',
    { sub: 'The future trains the past' },
    'With random folds, a model tested on rows from 2016 has been trained on rows from 2021. It may have learned how the 2016 period ended, from data that did not exist in 2016. A trader in 2016 could not have done that.',
    { sub: 'Neighbours are near-copies' },
    'With overlapping labels, today\'s label and tomorrow\'s share most of their days, and features built on trailing windows change slowly. A test row\'s neighbour in time is then in the training set with almost the same features and almost the same label. A model that memorises, such as a nearest-neighbour rule or a deep tree, scores well by copying the neighbour. In the figure this happens on pure noise.',

    { h: 'Walk-forward validation' },
    '**Walk-forward** validation keeps time order: train on a window, test on the block right after it, step forward by one block and repeat. An **expanding** window always starts at the first row; a **rolling** window keeps the most recent N rows. With 1,500 days, a 1,000-day window and 100-day test blocks stepping by 100, there are 5 test blocks. Joining them gives an out-of-sample record built the way you would trade: always deciding with the past, acting on the future.',
    {
      code: `def splits(n, train, test, expanding):
    s, out = train, []
    while s + test <= n:
        out.append((0 if expanding else s - train, s, s + test))
        s += test
    return out

print(splits(12, 5, 2, False))`,
      out: `[(0, 5, 7), (2, 7, 9), (4, 9, 11)]`,
    },
    'Each triple is (train start, test start, test end). The last two rows are left over because they do not make a full test block.',

    { h: 'Purging and embargo' },
    { sub: 'Purging' },
    'Say row t\'s label covers days t + 1 to t + h. Even in walk-forward, the training rows immediately before a test block have labels that run into the test period. With h = 4 and a test block starting at row 300, rows 297, 298 and 299 have labels ending on days 301, 302 and 303, which overlap the labels of the first test rows; row 296 ends on day 300 and does not. **Purging** drops those h − 1 rows from training. Some people drop h to be safe.',
    { sub: 'Embargo' },
    'In **purged k-fold**, where training data can come after the test block, purge the h − 1 rows after the block as well, and then drop a further stretch, the **embargo**, because features computed from trailing windows after the block still contain the block\'s data. Both ideas come from López de Prado\'s Advances in Financial Machine Learning (2018). scikit-learn\'s `TimeSeriesSplit` gives walk-forward splits and has a `gap` argument that leaves rows out between train and test; purged k-fold itself is not in scikit-learn.',

    { h: 'Tuning inside the window' },
    'Every setting chosen by looking at results, such as λ, depth, rounds or window length, is part of the fit. If you choose it by the score on the test block and report that score, the test block has become training data. The fix is **nested** validation: inside each training window, hold out its last part as a **validation** set, fit on the rest for each candidate setting, pick the best on validation, refit on the whole window, and only then score the test block, once. Keep a final **holdout** period, at the very end, that you look at only when everything is decided.',

    { h: 'Expanding or rolling' },
    'An expanding window uses all the history: more data, steadier fits, slow to adapt when the market changes. A rolling window forgets old data: quicker to adapt, noisier fits. Neither is right in general. With weak signals more data usually helps; with relationships that drift, old data can hurt. Treat the window length as a setting chosen inside the training data.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Using shuffled k-fold, the library default, on daily data.',
        'Forgetting to purge when labels span several days.',
        'Picking settings by test score and then reporting that score.',
        'Running the final holdout, changing the model and running it again.',
      ],
    },
  ],

  'qml-strategy': [
    { h: 'From forecast to position' },
    'A model outputs a forecast. A strategy needs a **position**: how much to hold. The rule that turns one into the other is part of the strategy and must be fixed before the test, like any other setting.',
    { sub: 'Three common rules' },
    {
      list: [
        '**Sign**: long one unit if the forecast is positive, short one unit if negative. Always in the market.',
        '**Proportional**: position = forecast ÷ its typical size, capped at some maximum. Bigger bets on stronger forecasts.',
        '**Threshold**: trade the sign only when |forecast| is above k, otherwise stay flat. Fewer, stronger trades.',
      ],
    },
    { sub: 'Alignment and costs' },
    'The position decided at the close of day t earns the return from t to t + 1. Each change of position costs money: spread, fees and slippage, together often quoted in **basis points** (bp, hundredths of a percent) of the amount traded. Going from +1 to −1 is a change of 2 units. The daily net return is `pos × r − cost × |pos − previous pos|`.',
    {
      code: `import numpy as np

pos = np.array([0, 1, 1, 1, -1])
r = np.array([0.2, 0.6, -0.4, 0.3, -0.5])
cost = 0.05 * np.abs(np.diff(pos, prepend=0))
print((pos * r - cost).round(2).tolist())`,
      out: `[0.0, 0.55, -0.4, 0.3, 0.4]`,
    },
    'Holding a position costs nothing after entry; only the entry and the flip are charged. Charging |pos| every day instead is a common bug that punishes steady strategies.',

    { h: 'Accuracy is not profit' },
    'The **expectancy** of a trade, from the risk module, is hit rate × average win − miss rate × average loss. A model right 60% of the time with average wins of 0.5% and losses of 0.9% has expectancy 0.3% − 0.36% = −0.06% per trade. What matters is being right on the days that move most, which an up/down hit rate does not measure.',
    { sub: 'What an IC is worth' },
    'The **information coefficient (IC)** is the correlation between forecasts and the returns that follow. For normal data, the sign strategy earns on average `ρ × σ × √(2/π)` per day, where ρ is the IC and σ the daily volatility of returns; √(2/π) ≈ 0.80 is the average size of a standard normal number. Its daily standard deviation is about σ, so its annual **Sharpe ratio** (mean ÷ standard deviation, scaled by √252 for daily data) is about `ρ × 0.80 × √252` before costs. An IC of 0.03 gives about 0.38.',
    { sub: 'What turnover costs' },
    '**Turnover** is how much you trade. A strategy that changes by one unit on average every day, at 3 bp per unit, pays 1 × 0.03% × 252 ≈ 7.6% a year. Daily sign strategies flip often, so their costs can exceed their edge. A threshold cuts turnover, at the price of giving up the weaker forecasts.',

    { h: 'Baselines' },
    'A model is only worth what it adds over doing something simple. Compare it with: holding the asset all the time (US stock indexes have risen on a little over half of trading days over long histories, so "always up" already scores above 50%); being flat; and a naive rule such as repeating yesterday\'s direction. Report each model\'s IC, hit rate, turnover and net Sharpe beside the baselines, with the t statistic so the reader can judge luck.',

    { h: 'Feature importance' },
    { sub: 'Permutation importance' },
    '**Permutation importance** asks how much worse the model gets when one feature is made useless. Take the test data, compute the model\'s error, then shuffle one feature\'s column (so its values no longer line up with the rows) and compute the error again. The increase is that feature\'s importance. Shuffle a copy, not the original data. For a linear model with coefficient b on a standardised feature, shuffling raises the mean squared error by about 2b², which is a handy check.',
    { sub: 'Its limits' },
    'Compute it on test data: on training data an overfitted model leans on noise features, and they look important. Two features that carry the same information share importance, so each looks unimportant alone; shuffle them together to see their joint value. Split counts in trees favour features with many distinct values. scikit-learn provides `sklearn.inspection.permutation_importance`, and the SHAP library splits each forecast into feature contributions. Importance tells you what the model uses, not why markets move.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Reporting accuracy and not P&L.',
        'Charging costs on positions held rather than on changes.',
        'Leaving out the buy-and-hold baseline.',
        'Choosing the threshold after seeing which one did best on the test period.',
      ],
    },
  ],

  'qml-failure': [
    { h: 'Why models that test well fail live' },
    'Most machine learning trading models that look good in research disappoint live. The reasons are known and mostly the same each time: the search found luck, the market changed, others were doing the same thing, or the test was not as honest as it looked. This lesson collects them, with an honest note on the two methods that get the most attention, deep learning and reinforcement learning.',

    { h: 'Overfitting the search' },
    { sub: 'The best of many' },
    'Each model, feature set, horizon or setting you try is a test. If none has an edge, each one\'s result is noise, and the best of many noise results is high by construction. Hit rates are a clear case. With no edge, the hit rate over n days has standard deviation √(0.25/n). Over 400 days that is 0.025, so a 54% result is 1.6 standard deviations above 50%. Using the normal **cumulative distribution function** Φ (the chance a standard normal number is below z), one model reaches it with chance 1 − Φ(1.6) ≈ 5.5%.',
    {
      code: `import math

phi = lambda z: 0.5 * (1 + math.erf(z / math.sqrt(2)))
p = 1 - phi(0.04 / math.sqrt(0.25 / 400))
for m in (1, 10, 100):
    print(m, round(1 - (1 - p) ** m, 3))`,
      out: `1 0.055
10 0.431
100 0.996`,
    },
    'With 100 tries, a 54% model from pure noise is almost certain. Real candidate models are correlated, which softens this, but the rule holds: keep a count of everything you tried, and judge the winner against that count.',
    { sub: 'Measuring it' },
    'Bailey, Borwein, López de Prado and Zhu ("The Probability of Backtest Overfitting", Journal of Computational Finance, 2017) proposed a direct measure. Split the history into blocks, and for many combinations choose the best configuration on half of the blocks and see where it ranks on the other half. The **probability of backtest overfitting** is how often the in-sample winner ranks below the median out of sample. If it is near one half, the selection is picking luck. The same logic explains a common bug: choosing a model by its test score and then reporting that score as what to expect.',

    { h: 'Regime change and crowding' },
    { sub: 'Regimes' },
    'A **regime** is a stretch of time with its own behaviour: low or high volatility, rising or falling rates, trending or choppy. A model fitted in one regime can fail in the next, and it gives no warning. Results reported by year or by test block show whether a model works across regimes or lives on one.',
    { sub: 'Crowding' },
    'When many firms use similar data and models, they hold similar positions. If some of them must cut risk, their selling moves prices against all the others, who may then sell too. In August 2007 many quantitative equity funds lost heavily over a few days; Khandani and Lo\'s study that year attributed it largely to similar positions being unwound at once. A backtest of one strategy cannot show this risk, because it does not include everyone else.',

    { h: 'Deep learning, honestly' },
    '**Neural networks** are flexible functions built from many layers of simple units; **deep learning** means networks with many layers. They excel when data is plentiful and structured, as with images and text. Daily returns are neither. Gu, Kelly and Xiu found that shallow networks did as well as or better than deeper ones for monthly stock returns. A common trap in online demonstrations is plotting predicted against actual prices. Tomorrow\'s price is close to today\'s, so a network that outputs roughly today\'s price, the **naive forecast**, looks almost perfect on a price chart while having no skill. Always score changes or returns, and compare with the naive forecast. Networks are more often useful on text, order book data and other alternative data.',

    { h: 'Reinforcement learning, honestly' },
    '**Reinforcement learning** trains an agent to take actions that maximise a reward, by trial and error in an environment. In trading the environment is a simulator built from past data, so the agent learns whatever the simulator rewards. If it fills orders at prices you could not get, ignores market impact or has a delay of zero, the agent will learn to exploit that. There is only one history to train on, rewards are very noisy, and the market changes. Independent, public evidence of such agents trading profitably out of sample after costs is thin at the time of writing (2026). Treat claims like any backtest: count the trials, check the fills, test forward.',

    { h: 'The defences' },
    {
      list: [
        'Few, simple models, each with a reason to work.',
        'A count of every model and setting tried.',
        'Walk-forward validation with purging, and a holdout run once.',
        'Results by year, net of realistic costs, against simple baselines.',
        'Paper trading, then the smallest size, expecting live results to be worse.',
      ],
    },
  ],

  'qml-lab': [
    { h: 'What the lab builds' },
    'The lab assembles the module into one pipeline: made-up data, a ridge regression forecaster, walk-forward forecasts, positions, costs and a score. Each piece is small. The value is in how they connect, because a leak in any one of them makes the whole result worthless, and the final numbers give no sign of it.',

    { h: 'The data' },
    { sub: 'A known answer' },
    'The data comes from a fixed **seed**, a number that makes the random generator produce the same values every run. There are 20 features, standard normal, and the return is `0.01 × (X·β) + noise`, where only the first two entries of β are non-zero and the noise has a standard deviation of 1%. Because you built it, you know the truth: two features matter a little and eighteen do not. A good pipeline should find a faint signal and be modest about it.',
    { sub: 'How weak the signal is' },
    'The signal part has a standard deviation of 0.01 × √(0.08² + 0.05²) ≈ 0.094%, against 1% of noise, so the true model explains under 1% of the variance. That is in line with real daily forecasts, and it means most patterns the model could find in a few hundred rows are noise.',

    { h: 'Fitting on the past only' },
    { sub: 'Standardising' },
    'Each feature is rescaled to mean 0 and standard deviation 1 with the training window\'s statistics, and the same numbers are applied to the test rows. A good check: adding or changing a later test row must not change how earlier rows are scaled.',
    { sub: 'Ridge' },
    'Ridge is fitted on the centred training data, `b = (XᵀX + λI)⁻¹Xᵀy`, with the intercept recovered from the means. With λ = 0 it must match least squares, which is a check worth keeping in the tests.',
    { sub: 'Walk-forward' },
    'For each test block, the model is standardised and fitted on the rows immediately before it, and forecasts the block. Rows before the first test block get no forecast (NaN, "not a number"). The most useful test of the whole lab changes the labels from some row onward and checks that forecasts before that row do not move. If editing the future changes the past, something looks ahead.',

    { h: 'From forecasts to a score' },
    'Positions are the sign of the forecast, flat where there is none, and costs are charged on each change of position. The score is the annualised Sharpe ratio, mean ÷ standard deviation × √252, with its t statistic, mean ÷ (standard deviation ÷ √n). Since t equals the daily Sharpe times √n, it also equals the annual Sharpe times √years.',
    {
      code: `import numpy as np

rng = np.random.default_rng(0)
X = rng.normal(0, 1, (20000, 20))
y = 0.01 * (X[:, 0] * 0.08 - X[:, 1] * 0.05) + rng.normal(0, 0.01, 20000)
print(round(np.corrcoef(X[:, 0], y)[0, 1], 3))
print(round(np.corrcoef(X[:, 2], y)[0, 1], 3))`,
      out: `0.08
0.001`,
    },
    'With 20,000 made-up rows, far more than any real daily history, the real feature shows its correlation of about 0.08 and the noise feature sits near zero. On 1,500 days the noise band is ±0.05, so the real feature would barely stand out, and some noise features would look as good by chance.',

    { h: 'Choosing λ without peeking' },
    'λ is chosen inside each training window: hold out its last part, fit on the rest for each candidate λ, keep the λ whose forecasts correlate best with the held-out returns, and use it for the next test block only. Choosing λ by the test blocks\' results would turn them into training data. The lab also includes a bug to find: scaling all of X at once before the loop, which looks like a harmless shortcut and leaks the future into every window.',

    { h: 'What to take from it' },
    {
      list: [
        'A pipeline is honest only if every step uses data from before the decision.',
        'Leak tests that edit the future are cheap and catch most mistakes.',
        'A Sharpe ratio needs its t statistic and a baseline beside it.',
        'On real data, expect this pipeline to report a weak or no edge after costs, and trust it when it does.',
      ],
    },
  ],
}
