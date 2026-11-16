import type { Module } from '../types'

export const features: Module = {
  id: 'features',
  title: 'Data and feature engineering',
  summary: 'On real problems the work you do on the data decides more than the choice of model, and this module is that work.',
  lessons: [
    {
      id: 'features-explore',
      title: 'Look at the data first',
      summary: 'A checklist for the first hour with a new dataset, before any model.',
      text: [
        'Most failed models fail because of something that was visible in the data on day one. So the first hour with a new table goes on looking, not modelling. Start with the question that is skipped most often: **one row is one what?** One customer, one order, one order line, one customer per month? If you want one prediction per customer and the table has one row per order, you have to aggregate first, and you have to know that before you split or count anything.',
        { code: `df.shape                                     # rows, columns
df.dtypes                                    # numbers or dates stored as text show up as object
df.isna().mean().sort_values()               # share missing, per column
df.duplicated().sum()                        # exact duplicate rows
df['customer_id'].nunique()                  # compare with the row count: one row = one what?
df['churned'].value_counts(normalize=True)   # the target
df.describe()                                # min and max find the impossible values` },
        '**Types.** A price column with dtype `object` holds text, often because of one stray value such as `"1,200"` or `"unknown"`. A date read as text cannot be subtracted or sorted properly. And an integer is not always a quantity: `store_id` and `postcode` are labels, and their mean is meaningless.',
        '**Missing values** do not always look missing. Besides `NaN` there are stand-ins: `-1`, `0`, `999`, an empty string, `"N/A"`. `isna()` counts none of them. Look at the most common values of every column and at its minimum and maximum.',
        '**Impossible values** tell you how the data was made: an age of 212, a negative price, a delivery date before the order date, a signup in the future. Do not delete them on sight. Find out where they come from. A negative price may be a refund, and that changes what a row means.',
        "**The target.** Look at its distribution before anything else is built. If 3% of customers churn, a model that always says 'stays' is 97% accurate, and that number is the baseline every later result is compared with. Ask how the target was recorded and when it becomes known. Then check for duplicate rows: they inflate counts and, later, leak between training and test sets.",
      ],
      rules: [
        'Say what one row is before doing anything else.',
        'Check shape, types, share missing, duplicates and the target, in that order, every time.',
        'Missing values hide as `-1`, `0`, `999` and empty strings. `isna()` will not find them.',
        'An integer column may be a label (an id, a postcode), not a quantity.',
        'Trace impossible values to their cause before you drop or clip them.',
        'The share of the largest class is the accuracy of doing nothing. Know it.',
      ],
      questions: [
        {
          kind: 'choice',
          id: 'features-explore-1',
          ask: 'A table has 50,000 rows and these columns: `order_id`, `customer_id`, `product`, `quantity`, `price`. `order_id` has 18,000 distinct values and `customer_id` has 6,000. What is one row?',
          options: ['One customer', 'One order', 'One line of an order: a product within an order', 'It cannot be worked out from this'],
          answer: 2,
          why: 'There are more rows than orders and more orders than customers, and each row names a product. So a row is an order line. To predict something per customer you must first aggregate 50,000 rows down to 6,000.',
        },
        {
          kind: 'output',
          id: 'features-explore-2',
          ask: 'Ages from a signup form. What does this print?',
          code: `ages = [34, None, 51, -1, 29, None, 999, 42]
missing = [a for a in ages if a is None]
print(len(missing), len(missing) / len(ages))`,
          answer: '2 0.25',
          why: 'Two values are None, a quarter of the column. But −1 and 999 are almost certainly stand-ins for "not given", so the real share is a half. A check for None or NaN finds only the honest missing values.',
        },
        {
          kind: 'output',
          id: 'features-explore-3',
          ask: 'Rows of (customer, date, amount). What does this print?',
          code: `rows = [
    ('u1', '2024-03-01', 20.0),
    ('u2', '2024-03-01', 35.5),
    ('u1', '2024-03-01', 20.0),
    ('u3', '2024-03-02', 12.0),
    ('u1', '2024-03-01', 20.0),
]
print(len(rows), len(set(rows)), len(rows) - len(set(rows)))`,
          answer: '5 3 2',
          why: 'Five rows, three distinct ones, so two are exact repeats. This is what `df.duplicated().sum()` counts. Whether they are real (the same purchase made three times) or a loading error is a question for whoever owns the data.',
        },
        {
          kind: 'number',
          id: 'features-explore-4',
          ask: 'Of 1,000 customers, 30 churned. What accuracy does a model get that predicts "stays" for everyone?',
          answer: 0.97,
          check: '1 - 30 / 1000',
          why: '970 of 1,000 are right: 97%. Any model you build has to beat this, and on a target this lopsided accuracy is the wrong thing to report at all.',
        },
        {
          kind: 'bug',
          id: 'features-explore-5',
          ask: 'A first-look script. One line does not print what its comment says.',
          code: `import pandas as pd

df = pd.read_csv('customers.csv')
print(df.shape)                    # rows, columns
print(df.dtypes)                   # type of every column
print(df.isna().mean(axis=1))      # share of missing values in each column
print(df.duplicated().sum())       # number of exact duplicate rows
print(df['churned'].value_counts(normalize=True))`,
          line: 6,
          fix: 'print(df.isna().mean())            # share of missing values in each column',
          why: '`axis=1` averages across each row, so it prints one number per row: 50,000 numbers nobody reads. The default, `axis=0`, goes down each column and gives the share missing per column.',
        },
        {
          kind: 'choice',
          id: 'features-explore-6',
          ask: 'After `pd.read_csv`, the column `monthly_fee` has dtype `object`, although nearly every value looks like `29.99`. What is the most likely cause and the right first move?',
          options: [
            'pandas stores all decimals as object; nothing needs doing',
            'A few values are text such as "free" or "1,299.00"; list the values that do not parse as numbers before converting',
            'The column is missing; drop it',
            'The file is corrupt; ask for a new export',
          ],
          answer: 1,
          why: 'One non-numeric value turns the whole column into text. `pd.to_numeric(df["monthly_fee"], errors="coerce")` shows which rows fail. Look at them first: "free" is information, not noise.',
        },
        {
          kind: 'choice',
          id: 'features-explore-7',
          ask: 'In a table of orders, `price` has a minimum of −45.00 and a maximum of 9,999,999. What do you do first?',
          options: [
            'Clip the column to the 1st and 99th percentiles',
            'Delete the rows with those values',
            'Find out what those rows are: the negative may be a refund and the maximum a placeholder',
            'Standardise the column so that the scale no longer matters',
          ],
          answer: 2,
          why: 'Each has a cause, and the cause decides the treatment. Refunds might be a feature in their own right. A placeholder should become a missing value. Clipping or deleting first destroys the evidence.',
        },
        {
          kind: 'output',
          id: 'features-explore-8',
          ask: 'A range check on an age column. What does this print?',
          code: `ages = [34, 212, 51, -1, 29, 0, 42]
bad = [a for a in ages if not 0 < a < 120]
print(bad)`,
          answer: '[212, -1, 0]',
          why: 'Three values fall outside a sensible range. 212 is likely a typing error, −1 a missing-value code, and 0 may be either. A simple range check per column finds what `isna()` cannot.',
        },
        {
          kind: 'choice',
          id: 'features-explore-9',
          ask: '`df.describe()` shows `store_id` with mean 512.3 and standard deviation 290. A teammate plans to standardise it with the other numeric columns. What is wrong?',
          options: [
            'Nothing: it is numeric, so it should be scaled',
            'It is a label, not a quantity: store 600 is not "more" than store 300, so it should be treated as a category',
            'The standard deviation is too large to standardise',
            'Ids must always be dropped',
          ],
          answer: 1,
          why: 'The numbers are names. A linear model would learn that higher ids mean more or less of the target, which is nonsense. Treat it as a category (or drop it). Dropping is not always right: the store may matter a great deal.',
        },
        {
          kind: 'write',
          id: 'features-explore-10',
          ask: 'Write the missing-value report. `rows` is a list of dicts that all have the same keys. Return a dict from column name to the share of rows where the value is `None` or an empty string.',
          starter: `def missing_share(rows):
    # {column: share of rows where the value is None or ''}
    pass`,
          solution: `def missing_share(rows):
    out = {}
    for col in rows[0]:
        missing = sum(1 for r in rows if r[col] is None or r[col] == '')
        out[col] = missing / len(rows)
    return out`,
          tests: `rows = [
    {'age': 34, 'city': 'Leeds', 'orders': 0},
    {'age': None, 'city': '', 'orders': 2},
    {'age': 51, 'city': 'York', 'orders': 0},
    {'age': None, 'city': 'Bath', 'orders': 5},
]
out = missing_share(rows)
assert out is not None, "the function returns nothing yet"
assert set(out) == {'age', 'city', 'orders'}, f"there should be one entry per column, got {sorted(out)}"
assert out['age'] == 0.5, f"age is None in 2 of 4 rows, so 0.5; got {out['age']}"
assert out['city'] == 0.25, f"an empty string counts as missing: city should be 0.25, got {out['city']}"
assert out['orders'] == 0, "0 is a real value, not a missing one: orders should be 0.0"`,
          why: 'The trap is writing `if not r[col]`: that also counts 0, and a customer with no orders is not a customer with unknown orders. Decide what "missing" means for each column and test for exactly that.',
        },
        {
          kind: 'design',
          id: 'features-explore-11',
          ask: 'You are given `deliveries.csv` (400,000 rows) and asked to predict whether a parcel will arrive late. Describe what you do in the first hour, before any model.',
          why: 'None of this is modelling, and all of it changes what you model. The grain, the target definition and the timing of each column decide the whole design.',
          checklist: [
            { point: 'Establish what one row is and whether a parcel can appear more than once', why: 'Re-deliveries or status updates as separate rows would mean the same parcel on both sides of a split.' },
            { point: 'Find out exactly how "late" is defined and when it is recorded', why: 'The target might be late against the promised date, or against the first attempt. They are different problems.' },
            { point: 'Look at the share of late parcels, overall and over time', why: 'It gives the do-nothing baseline, and a rate that jumps in December tells you to validate by time.' },
            { point: 'Check types: dates parsed as dates, ids not treated as quantities', why: 'You cannot compute a delivery time from text dates, and a depot id is a label.' },
            { point: 'Measure missing values per column, including stand-ins such as 0, −1 and empty strings', why: 'A weight of 0 kg is a missing weight. `isna()` will not say so.' },
            { point: 'Look for impossible values: delivered before dispatch, negative distances, dates in the future', why: 'They reveal how the data was made, and often a time-zone or join error that affects every row.' },
            { point: 'Count exact and near duplicates', why: 'They inflate the data and leak across a random split.' },
            { point: 'For each column, ask whether it is known at the moment of prediction', why: 'A column such as `delivery_attempts` is filled in after the outcome. Using it is leakage.' },
          ],
        },
      ],
    },
    {
      id: 'features-missing',
      title: 'Missing values and outliers',
      summary: 'Why a value is missing matters more than how you fill it in.',
      text: [
        'A value is missing for a reason, and the reason decides what to do. Sometimes it is chance: a sensor dropped a reading. Sometimes it depends on other columns: older accounts have no `referral_code` because the field did not exist then. Sometimes it depends on the value itself: people with high incomes leave the income box empty. In the last two cases **the fact that it is missing is information**, and filling the gap silently throws that information away.',
        "The practical recipe: fill a numeric column with the **median** (the mean is dragged about by a long tail), fill a categorical column with the most common value or, better, with a category of its own such as `'missing'`, and add a **flag column** that is 1 where the value was missing. The flag lets the model treat those rows differently. Gradient-boosted trees such as scikit-learn's `HistGradientBoostingClassifier` accept `NaN` directly, which is often the best option of all.",
        { code: `from sklearn.impute import SimpleImputer

imputer = SimpleImputer(strategy='median', add_indicator=True)
X_train = imputer.fit_transform(X_train)   # the median is learned here
X_test = imputer.transform(X_test)         # and reused here` },
        'The median is a number **learned from data**, so it must come from the training rows only. Compute it on everything and the test set has leaked into your features. The effect is usually small for a median, but the habit matters: the same mistake with other steps is not small. `fit` on training data, `transform` everywhere else.',
        'An **outlier** is either an error or a real extreme, and they need opposite handling. Errors (an age of 212) become missing values. Real extremes (one order of £40,000) can be **clipped** to a limit taken from the training data, such as the 1st and 99th percentiles, or tamed with a log. Both stop a few rows from dominating a linear model. Tree models split on order, not size, and are little affected.',
        'Before clipping, ask whether the extreme is the thing you are looking for. In fraud detection, fault detection and anything else about rare events, the outliers are the signal. Clip them and you have removed the pattern the model exists to find.',
      ],
      rules: [
        'Ask why the value is missing. If the reason relates to the target, missingness is a feature.',
        'Numeric: median plus a "was missing" flag. Categorical: a `missing` category.',
        'Make the flag before you fill, or it will be all zeros.',
        'Imputation values and clipping limits are learned from training rows only.',
        'Errors become missing values. Real extremes get clipped or logged.',
        'When the task is to find rare events, the outlier is the signal: do not clip it away.',
      ],
      questions: [
        {
          kind: 'output',
          id: 'features-missing-1',
          ask: 'One column with a missing value. What does this print?',
          code: `import numpy as np
from sklearn.impute import SimpleImputer

X = np.array([[20.0], [np.nan], [30.0], [100.0]])
imputer = SimpleImputer(strategy='median', add_indicator=True)
print(imputer.fit_transform(X)[1].tolist())`,
          answer: '[30.0, 1.0]',
          why: 'The median of 20, 30 and 100 is 30, so the gap is filled with 30. `add_indicator=True` appends a column that is 1 where the value was missing. The second row is therefore [30, 1].',
        },
        {
          kind: 'number',
          id: 'features-missing-2',
          ask: 'The training values of a column are 10, 20, 30 and 1000. A test row has no value. What does a median imputer fill in?',
          answer: 25,
          check: 'np.median([10, 20, 30, 1000])',
          why: 'With four values the median is the average of the middle two: (20 + 30) / 2 = 25. The mean would be 265, a value unlike three of the four rows.',
        },
        {
          kind: 'output',
          id: 'features-missing-3',
          ask: 'Yearly incomes in thousands. What does this print?',
          code: `import statistics

incomes = [28, 30, 32, 35, 900]
print(statistics.mean(incomes), statistics.median(incomes))`,
          answer: '205 32',
          why: 'One very high income pulls the mean to 205, which describes nobody. The median, 32, is a typical person. Fill a skewed column with the mean and every missing row becomes an unusually rich customer.',
        },
        {
          kind: 'choice',
          id: 'features-missing-4',
          ask: 'In a loan dataset, `income` is empty for 20% of applicants, and those applicants default twice as often as the rest. You fill the gaps with the median and add nothing else. What have you lost?',
          options: [
            'Nothing: the median is the best guess for each of them',
            'The model can no longer tell these applicants from people who really earn the median, so the strongest hint in the column is gone',
            'The column now has the wrong mean',
            'The model will crash on the filled values',
          ],
          answer: 1,
          why: 'Leaving the box empty is itself predictive here. After a silent fill those rows look ordinary. A flag column `income_missing` keeps the information, at the cost of one extra column.',
        },
        {
          kind: 'bug',
          id: 'features-missing-5',
          ask: 'This should fill missing incomes and record which rows were filled. The flag column comes out as all zeros.',
          code: `def add_income_features(df, train_median):
    out = df.copy()
    out['income'] = df['income'].fillna(train_median)
    out['income_missing'] = out['income'].isna().astype(int)
    return out`,
          line: 4,
          fix: "    out['income_missing'] = df['income'].isna().astype(int)",
          why: 'By line 4 `out["income"]` has already been filled, so nothing in it is missing. The flag must be read from the original column, before the fill.',
        },
        {
          kind: 'bug',
          id: 'features-missing-6',
          ask: 'Imputing income in the training and the test table. One line lets the test data shape its own features.',
          code: `import pandas as pd

train = pd.read_csv('train.csv')
test = pd.read_csv('test.csv')

for df in (train, test):
    df['income_missing'] = df['income'].isna().astype(int)
    df['income'] = df['income'].fillna(df['income'].median())`,
          line: 8,
          fix: "    df['income'] = df['income'].fillna(train['income'].median())",
          why: 'On the second pass `df` is the test table, so the test rows are filled with the test median. In production you predict one row at a time and there is no test median to compute. The value must be learned once, from the training rows.',
        },
        {
          kind: 'write',
          id: 'features-missing-7',
          ask: 'Write median imputation with a flag. `train` and `values` are lists in which `None` means missing. Return two lists for `values`: the filled values, and flags (1 where the value was missing, else 0). The median comes from the known values of `train`.',
          starter: `def impute_with_flag(train, values):
    # returns (filled, flags)
    pass`,
          solution: `def impute_with_flag(train, values):
    known = sorted(v for v in train if v is not None)
    mid = len(known) // 2
    median = known[mid] if len(known) % 2 else (known[mid - 1] + known[mid]) / 2
    filled = [median if v is None else v for v in values]
    flags = [1 if v is None else 0 for v in values]
    return filled, flags`,
          tests: `out = impute_with_flag([10, None, 30, 1000, 20], [None, 5, None])
assert out is not None, "the function returns nothing yet"
filled, flags = out
assert flags == [1, 0, 1], f"flags should be [1, 0, 1], got {flags}"
assert filled == [25, 5, 25], f"the median of 10, 20, 30, 1000 is 25, so the result is [25, 5, 25]; got {filled}"
filled, flags = impute_with_flag([1, 2, 3], [None, 100, 200])
assert filled[0] == 2, f"the median must come from train (2), not from the values being filled; got {filled[0]}"
filled, flags = impute_with_flag([1, 2, 3], [0, None])
assert filled == [0, 2] and flags == [0, 1], "0 is a real value: only None is missing"
assert impute_with_flag([7, None, None], [None])[0] == [7], "ignore the None values in train when taking the median"`,
          why: 'Two inputs, because there are two roles: the rows you learn from and the rows you fill. Keeping them apart in the function signature is what stops test data from reaching the median.',
        },
        {
          kind: 'output',
          id: 'features-missing-8',
          ask: 'Clipping limits are taken from the training column and applied to new values. What does this print?',
          code: `import numpy as np

train = np.array([1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 500.0])
low, high = np.percentile(train, [10, 90])
new = np.array([0.0, 5.0, 900.0])
print(np.clip(new, low, high).tolist())`,
          answer: '[2.0, 5.0, 10.0]',
          hint: 'With 11 sorted values, the 10th percentile is the 2nd value and the 90th is the 10th.',
          why: 'The limits are 2 and 10. Values inside pass unchanged; 0 is raised to 2 and 900 is lowered to 10. The limits come from training data, so a new extreme cannot move them.',
        },
        {
          kind: 'choice',
          id: 'features-missing-9',
          ask: 'You are building a card-fraud model. A teammate clips `amount` at the 99th percentile "to remove outliers" before training. What is the problem?',
          options: [
            'Clipping needs the 99.9th percentile to be safe',
            'Fraud often shows up as an unusual amount: after clipping, a £9,000 purchase looks the same as a £400 one',
            'Clipping changes the mean of the column',
            'There is none: outliers always hurt models',
          ],
          answer: 1,
          why: 'When the job is to find rare, extreme events, the extreme values carry the signal. Keep the raw amount (or its log) and, if a linear model needs it, add the clipped version as a second column.',
        },
        {
          kind: 'choice',
          id: 'features-missing-10',
          ask: 'The categorical column `referral_source` is empty for 35% of customers. Which treatment is the best default?',
          options: [
            'Fill with the most common source, so the column has no gaps',
            "Fill with a new category such as 'missing'",
            'Drop the 35% of rows',
            'Drop the column',
          ],
          answer: 1,
          why: 'A category of its own keeps "no source recorded" apart from real sources and lets the model learn what it means. Filling with the mode silently relabels a third of the customers. Dropping rows discards data and breaks at prediction time, when you cannot refuse to answer.',
        },
      ],
    },
    {
      id: 'features-scaling',
      title: 'Scaling and transforms',
      summary: 'Putting columns on a common scale, taming long tails, and knowing which models care.',
      widget: 'features-scaling',
      text: [
        'A table mixes columns in pounds, years and counts. Many models are sensitive to that. **Standardising** a column subtracts its mean and divides by its standard deviation, so it ends with mean 0 and standard deviation 1. **Min-max scaling** maps the training minimum to 0 and the maximum to 1. Standardising is the usual default. Min-max suits inputs with hard bounds, such as pixel values.',
        'Which models need it: anything trained by gradient descent (neural networks, logistic regression), anything with a penalty on the weights (ridge, lasso: the penalty treats all weights alike, so the columns must be comparable), and anything built on distances (k-nearest neighbours, k-means, SVMs, PCA). Which do not: decision trees, random forests and gradient-boosted trees. A tree asks only whether a value is above a threshold, so any transform that keeps the order of the values leaves its splits unchanged.',
        'Scaling changes the units on the axis and nothing else. It does not change the shape. A **long-tailed** column such as income, price or number of orders stays long-tailed after standardising: most rows are squeezed near the bottom and a few sit many standard deviations out. Min-max is worse: one huge value becomes 1 and pushes everything else towards 0.',
        'For a long tail, take the **logarithm** first. A log turns "ten times bigger" into "a fixed amount bigger", which is usually how such quantities matter. Use `np.log1p(x)`, which is `log(1 + x)`, so that zeros are allowed. Then standardise. The figure shows the three versions of one column.',
        { code: `from sklearn.preprocessing import StandardScaler

scaler = StandardScaler().fit(X_train)     # mean and std of the training rows
X_train = scaler.transform(X_train)
X_test = scaler.transform(X_test)          # same numbers reused: test values may fall outside the training range` },
        'As with imputing, the mean, standard deviation, minimum and maximum are learned from the training rows and reused. Test values can then land outside the training range, for example above 1 after min-max scaling. That is correct and expected.',
      ],
      rules: [
        'Standardise: `(x − mean) / std`, with the mean and std of the training rows.',
        'Gradient descent, weight penalties and distances need scaled inputs. Trees do not.',
        'Scaling does not change the shape of a column. A long tail needs a log.',
        'Use `log1p` when the column contains zeros.',
        'Min-max scaling is fragile: one extreme value squashes all the others.',
      ],
      questions: [
        {
          kind: 'output',
          id: 'features-scaling-1',
          ask: 'A scaler is fitted on three training values and applied to a test value. What does this print?',
          code: `import numpy as np
from sklearn.preprocessing import StandardScaler

train = np.array([[10.0], [20.0], [30.0]])
test = np.array([[40.0]])
scaler = StandardScaler().fit(train)
print(scaler.mean_[0], round(float(scaler.transform(test)[0, 0]), 2))`,
          answer: '20.0 2.45',
          hint: 'The training standard deviation is √(200/3) ≈ 8.16.',
          why: 'The training mean is 20 and the standard deviation about 8.16, so 40 becomes (40 − 20) / 8.16 ≈ 2.45. The test value plays no part in the mean or the standard deviation.',
        },
        {
          kind: 'number',
          id: 'features-scaling-2',
          ask: 'A min-max scaler is fitted on training prices that run from 20 to 70. What does it give for a test price of 95?',
          answer: 1.5,
          check: '(95 - 20) / (70 - 20)',
          why: '(95 − 20) / (70 − 20) = 1.5. Min-max promises the range 0 to 1 only for the data it was fitted on. A value above 1 on new data is correct behaviour, not a bug to be "fixed" by refitting on the test set.',
        },
        {
          kind: 'choice',
          id: 'features-scaling-3',
          ask: 'You multiply one feature by 1,000 (metres instead of kilometres) and retrain. Which model makes exactly the same predictions as before?',
          options: ['k-nearest neighbours', 'Ridge regression', 'A random forest', 'k-means clustering'],
          answer: 2,
          why: 'A tree splits on "is the value above a threshold", and the threshold scales along with the values. Distances (k-NN, k-means) are now dominated by this feature, and the ridge penalty now bears on its weight 1,000 times less.',
        },
        {
          kind: 'choice',
          id: 'features-scaling-4',
          ask: 'In the figure, switch from **raw** to **log**. What happens?',
          options: [
            'The skew stays the same and the mean moves away from the median',
            'The skew falls to near zero, and the mean and median almost meet',
            'The largest value becomes the smallest',
            'Nothing changes except the labels on the axis',
          ],
          answer: 1,
          why: 'The log pulls in the long right tail, leaving a roughly symmetric bell. A linear model or a neural network can then use the whole range of the column instead of being driven by a few huge orders.',
        },
        {
          kind: 'choice',
          id: 'features-scaling-5',
          ask: 'In the figure, switch between **raw** and **standardised** and compare the skew. What do you see, and what does it mean?',
          options: [
            'The skew drops to 0: standardising makes a column normal',
            'The skew is identical: standardising changes the units, not the shape',
            'The skew doubles: standardising makes tails worse',
            'The skew changes sign',
          ],
          answer: 1,
          why: 'Subtracting a constant and dividing by a constant moves and stretches the axis. The histogram is the same picture. "Mean 0, std 1" does not mean bell-shaped: the largest order is still many standard deviations out.',
        },
        {
          kind: 'output',
          id: 'features-scaling-6',
          ask: 'Customer spend with a long tail. (Base 10 is used here so the numbers are round.) What does this print?',
          code: `import numpy as np

spend = np.array([0, 9, 99, 9999])
print(np.log10(spend + 1))`,
          answer: '[0. 1. 2. 4.]',
          why: 'Adding 1 first makes a spend of 0 legal and maps it to 0. The values span four orders of magnitude before and a range of 4 after: each step of 1 is "ten times more".',
        },
        {
          kind: 'bug',
          id: 'features-scaling-7',
          ask: 'Adding a log feature to a table where many customers have spent nothing. The model then fails with "Input contains infinity".',
          code: `import numpy as np

def log_spend(spend):
    # spend: array of totals in pounds, many of them 0
    return np.log(spend)`,
          line: 5,
          fix: '    return np.log1p(spend)',
          why: 'log(0) is −infinity. `np.log1p(x)` computes log(1 + x), which is 0 at 0 and close to log(x) for large values.',
        },
        {
          kind: 'bug',
          id: 'features-scaling-8',
          ask: 'Standardising a training and a test array, column by column. A model trained on the result does badly on the test set.',
          code: `def standardise(train, test):
    mean = train.mean(axis=0)
    std = train.std(axis=0)
    train_scaled = (train - mean) / std
    test_scaled = (test - test.mean(axis=0)) / std
    return train_scaled, test_scaled`,
          line: 5,
          fix: '    test_scaled = (test - mean) / std',
          why: 'Centring the test set on its own mean puts it on a different scale from the one the model learned. If test prices are higher on average, that shift is real information and this line erases it.',
        },
        {
          kind: 'write',
          id: 'features-scaling-9',
          numpy: true,
          ask: 'Standardise with training statistics. `train` is `(n, d)` and `test` is `(m, d)`. Return both scaled with the per-column mean and standard deviation of `train`. A column that is constant in `train` has standard deviation 0: divide it by 1 instead.',
          starter: `import numpy as np

def standardise(train, test):
    # returns (train_scaled, test_scaled)
    pass`,
          solution: `import numpy as np

def standardise(train, test):
    mean = train.mean(axis=0)
    std = train.std(axis=0)
    std = np.where(std == 0, 1.0, std)
    return (train - mean) / std, (test - mean) / std`,
          tests: `train = np.array([[10.0, 1.0], [20.0, 1.0], [30.0, 1.0]])
test = np.array([[40.0, 1.0], [20.0, 3.0]])
out = standardise(train, test)
assert out is not None, "the function returns nothing yet"
tr, te = out
assert tr.shape == (3, 2) and te.shape == (2, 2), "the shapes should not change"
assert np.allclose(tr[:, 0].mean(), 0) and np.allclose(tr[:, 0].std(), 1), "the first training column should have mean 0 and std 1"
assert not np.isnan(tr).any() and not np.isinf(tr).any(), "the constant column gave nan or inf: divide by 1 where the std is 0"
assert np.allclose(tr[:, 1], 0), "a constant column should become all zeros"
assert np.allclose(te[0, 0], 2.4494897), f"40 with training mean 20 and std 8.16 should be about 2.449, got {te[0, 0]}"
assert np.allclose(te[1, 0], 0), "20 is the training mean, so it should become 0: are you using the test mean?"
assert np.allclose(te[1, 1], 2), "in the constant column, 3 should become (3 - 1) / 1 = 2"`,
          why: 'The statistics are computed once, from `train`, and used twice. The guard for a zero standard deviation matters in practice: a column that happens to be constant in the training rows would otherwise fill the array with NaN.',
        },
        {
          kind: 'choice',
          id: 'features-scaling-10',
          ask: 'A k-nearest-neighbours model uses `age` (18 to 90) and `income` (0 to 200,000), both unscaled. What does "nearest" mean to it?',
          options: [
            'Closest in age and income equally',
            'Closest in income, almost regardless of age: a gap of £1,000 counts for more than a gap of 70 years',
            'Closest in age, because age has the smaller range',
            'k-NN rescales columns itself, so both count equally',
          ],
          answer: 1,
          why: 'Distance adds squared differences, and the income differences are thousands of times larger. Age is ignored in practice. After standardising, one standard deviation of each counts the same.',
        },
        {
          kind: 'choice',
          id: 'features-scaling-11',
          ask: 'Order values are mostly between £5 and £200, with one order of £50,000. You min-max scale the column. Where do the ordinary orders end up?',
          options: ['Spread evenly between 0 and 1', 'All between 0 and about 0.004', 'All close to 1', 'Around 0.5'],
          answer: 1,
          why: '200 / 50,000 = 0.004. One value sets the top of the range and every other row is squashed into a sliver near 0. Take the log first, or clip, or use a scaler built on the median and quartiles.',
        },
      ],
    },
    {
      id: 'features-categorical',
      title: 'Encoding categories',
      summary: 'Turning text labels into numbers without inventing an order or leaking the answer.',
      widget: 'features-encoding',
      text: [
        'Models take numbers, so a column such as `city` has to be encoded. **One-hot** encoding makes a 0/1 column per category. It is the safe default for a handful of categories, because it claims nothing about how they relate. Numbering the categories 0, 1, 2 instead tells a linear model that the third city is "twice" the second, which is false.',
        'When the categories do have an order (`small < medium < large`, education levels, star ratings) an **ordinal** encoding is right: map them to 0, 1, 2 in the true order. Give the order yourself. Left alone, `OrdinalEncoder` sorts alphabetically.',
        { code: `from sklearn.preprocessing import OneHotEncoder, OrdinalEncoder

OneHotEncoder(handle_unknown='ignore', min_frequency=20)   # unseen -> all zeros; rare ones share a column
OrdinalEncoder(categories=[['small', 'medium', 'large']])  # the order is stated, not guessed

# smoothed target encoding for one category
encoded = (sum_of_targets + m * global_mean) / (count + m)` },
        '**High-cardinality** columns (postcode, product id, with thousands of values) make one-hot very wide, and most categories have too few rows to learn from. Three alternatives, each one column or a fixed number: **frequency** encoding replaces the category with how often it occurs in training (cheap, but two different categories of the same size become identical); **hashing** sends each category to one of a fixed number of buckets (no vocabulary to store, and new categories still land somewhere, at the price of collisions); **target** encoding replaces the category with the average target of its training rows.',
        'Target encoding is the strongest of these and the easiest to get wrong. Computed naively, each row\'s encoding includes **its own label**. For a category seen once, the encoding is the label. The model learns to trust the column, scores superbly in training and falls over on new data. Two fixes, used together: compute each training row\'s value **out-of-fold**, from the other folds only, and **smooth** towards the overall mean so that rare categories are not taken at face value. `m` in the formula is how many rows of evidence it takes to move away from the overall mean. scikit-learn\'s `TargetEncoder` does both.',
        'Production will send categories that training never saw: a new city, a new product. Decide the behaviour in advance. One-hot: all zeros (`handle_unknown=\'ignore\'`). Frequency: 0. Target encoding: the overall mean. An encoder that raises an error on an unseen value will take the service down on its first new customer.',
      ],
      rules: [
        'Few categories with no order: one-hot. Ordered: ordinal, with the order stated explicitly.',
        'Integer codes for unordered categories invent an order. Linear models and distances believe it.',
        'Many categories: frequency, hashing or target encoding, or group the rare ones as `other`.',
        'Target encoding must be out-of-fold and smoothed, and fitted on training rows only.',
        'Decide what an unseen category becomes before it reaches production.',
      ],
      questions: [
        {
          kind: 'output',
          id: 'features-categorical-1',
          ask: 'An encoder fitted on three cities meets a fourth. What does this print?',
          code: `from sklearn.preprocessing import OneHotEncoder

enc = OneHotEncoder(handle_unknown='ignore', sparse_output=False)
enc.fit([['london'], ['paris'], ['rome']])
print(enc.transform([['paris'], ['oslo']]).tolist())`,
          answer: '[[0.0, 1.0, 0.0], [0.0, 0.0, 0.0]]',
          why: 'The columns are london, paris, rome in sorted order, so paris is the middle one. Oslo was never seen: with `handle_unknown="ignore"` it becomes all zeros. With the default setting, `transform` would raise an error instead.',
        },
        {
          kind: 'output',
          id: 'features-categorical-2',
          ask: 'T-shirt sizes are given to an ordinal encoder with default settings. What does this print?',
          code: `from sklearn.preprocessing import OrdinalEncoder

enc = OrdinalEncoder()
print(enc.fit_transform([['S'], ['M'], ['L'], ['XL']]).ravel().tolist())`,
          answer: '[2.0, 1.0, 0.0, 3.0]',
          hint: 'The encoder sorts the categories as text.',
          why: 'Alphabetical order is L, M, S, XL, so S gets 2 and L gets 0: large is now "smaller" than small. Pass `categories=[["S", "M", "L", "XL"]]` to state the real order.',
        },
        {
          kind: 'choice',
          id: 'features-categorical-3',
          ask: 'A teammate encodes `city` (500 cities) as the integers 0 to 499 and feeds it to a logistic regression. What does the model assume?',
          options: [
            'Nothing: it treats each integer as a separate category',
            'That the chance of the outcome rises or falls steadily with the code, so city 400 is "more" than city 200',
            'That all cities behave alike',
            'That the column should be ignored',
          ],
          answer: 1,
          why: 'A linear model has one weight for the column and multiplies it by the code. The codes are arbitrary, so the pattern it fits is noise. Tree models suffer less, since they can cut the range into pieces, but still waste splits on a made-up order.',
        },
        {
          kind: 'number',
          id: 'features-categorical-4',
          ask: 'In 120 training rows, `city` is "leeds" in 30. What is the frequency encoding of "leeds"?',
          answer: 0.25,
          check: '30 / 120',
          why: '30 / 120 = 0.25. The encoding says how common the category is, nothing else. It is useful when popularity itself relates to the target.',
        },
        {
          kind: 'choice',
          id: 'features-categorical-5',
          ask: 'In the figure, choose **frequency**. Leeds and york both get 0.25, yet leeds visitors buy a third of the time and york visitors two thirds. What does this show?',
          options: [
            'The table has an error',
            'Frequency encoding cannot tell apart categories that are equally common, however differently they behave',
            'Frequency encoding leaks the target',
            'Leeds and york should be merged',
          ],
          answer: 1,
          why: 'The encoding keeps one fact, the count, and drops the identity. That is the price of squeezing a category into one number without looking at the target.',
        },
        {
          kind: 'choice',
          id: 'features-categorical-6',
          ask: 'In the figure, choose **target** and **naive**. Bath appears once and is encoded as 1.00. Switch to **out-of-fold**. What does bath get, and why?',
          options: [
            'Still 1.00, because bath always buys',
            '0.00, because bath is rare',
            'The buying rate of the other folds (0.50): no other row is from bath, so there is nothing else to go on',
            'It is dropped from the table',
          ],
          answer: 2,
          why: 'Naive, the only evidence about bath is the row itself, so the feature equals the label. Out-of-fold, a row may not see its own label, and with no other bath rows it falls back to the overall rate. That is also what a new city will get in production.',
        },
        {
          kind: 'number',
          id: 'features-categorical-7',
          ask: 'A city appears in 2 training rows and both customers bought. The overall buying rate is 0.2. With smoothing m = 8, what is the smoothed target encoding?',
          answer: 0.36,
          check: '(2 + 8 * 0.2) / (2 + 8)',
          hint: '(sum of targets + m × overall rate) / (count + m)',
          why: '(2 + 8 × 0.2) / (2 + 8) = 3.6 / 10 = 0.36. Two rows are weak evidence, so the value stays near the overall rate of 0.2 and well away from the naive 1.0.',
        },
        {
          kind: 'bug',
          id: 'features-categorical-8',
          ask: 'Target encoding of `city` for a model that predicts returns. Which line uses the labels of the test rows?',
          code: `import pandas as pd
from sklearn.model_selection import train_test_split

df = pd.read_csv('orders.csv')
train, test = train_test_split(df, test_size=0.2, random_state=0)
city_rate = df.groupby('city')['returned'].mean()
overall = train['returned'].mean()
test = test.assign(city_te=test['city'].map(city_rate).fillna(overall))`,
          line: 6,
          fix: "city_rate = train.groupby('city')['returned'].mean()",
          why: 'Grouping the whole table puts every test row\'s label into the rate for its city, and the test rows are then scored with a feature built from their own answers. The rates must come from `train`. (For the training rows themselves, the encoding should also be out-of-fold.)',
        },
        {
          kind: 'write',
          id: 'features-categorical-9',
          ask: 'Write one-hot encoding. `categories` is the list of categories learned from training, in column order. Return one row of 0s and 1s per value. A value that is not in `categories` becomes all zeros.',
          starter: `def one_hot(values, categories):
    # one list of 0/1 per value, one position per category
    pass`,
          solution: `def one_hot(values, categories):
    return [[1 if v == c else 0 for c in categories] for v in values]`,
          tests: `out = one_hot(['paris', 'rome'], ['london', 'paris', 'rome'])
assert out is not None, "the function returns nothing yet"
assert out == [[0, 1, 0], [0, 0, 1]], f"paris and rome should give [[0, 1, 0], [0, 0, 1]], got {out}"
assert one_hot(['oslo'], ['london', 'paris', 'rome']) == [[0, 0, 0]], "a category not seen in training should be all zeros, not an error"
assert one_hot([], ['a', 'b']) == [], "no values should give no rows"
assert all(len(row) == 2 for row in one_hot(['a', 'z', 'b'], ['a', 'b'])), "every row needs one position per category"`,
          why: 'The categories are an input, not something worked out from the values being encoded. That is what keeps the columns the same in training and in production, whatever arrives.',
        },
        {
          kind: 'write',
          id: 'features-categorical-10',
          ask: 'Write frequency encoding. Return, for each item of `values`, the share of `train` rows that have that category. A category that does not occur in `train` gets 0.0.',
          starter: `def frequency_encode(train, values):
    # share of training rows with each value's category
    pass`,
          solution: `def frequency_encode(train, values):
    counts = {}
    for c in train:
        counts[c] = counts.get(c, 0) + 1
    return [counts.get(v, 0) / len(train) for v in values]`,
          tests: `out = frequency_encode(['a', 'a', 'b', 'c'], ['a', 'b', 'z'])
assert out is not None, "the function returns nothing yet"
assert out == [0.5, 0.25, 0.0], f"expected [0.5, 0.25, 0.0], got {out}"
assert frequency_encode(['a', 'b'], ['a', 'a', 'a']) == [0.5, 0.5, 0.5], "the shares come from train, not from the values being encoded"
assert frequency_encode(['x'], []) == [], "no values should give an empty list"`,
          why: 'Count once on the training rows, then look each value up. `counts.get(v, 0)` is the decision about unseen categories, made in one place.',
        },
        {
          kind: 'choice',
          id: 'features-categorical-11',
          ask: 'You have 200,000 rows and a `postcode` column with 30,000 distinct values. What is the main trouble with plain one-hot encoding here?',
          options: [
            'One-hot cannot represent more than 255 categories',
            'It adds 30,000 columns, most of them 1 in only a few rows, so the model memorises noise for the rare postcodes',
            'It invents an order between postcodes',
            'It leaks the target',
          ],
          answer: 1,
          why: 'With under 7 rows per postcode on average, most columns carry too little evidence to learn from. Group rare postcodes as "other", use a coarser level (the district), or use frequency or smoothed target encoding.',
        },
        {
          kind: 'choice',
          id: 'features-categorical-12',
          ask: 'You hash `product_id` (2 million products, new ones every day) into 4,096 buckets. What do you gain and what do you pay?',
          options: [
            'Gain: every product keeps its own column. Pay: memory',
            'Gain: a fixed width, no vocabulary to store and no failure on new products. Pay: unrelated products share a bucket',
            'Gain: the target is used. Pay: leakage',
            'Gain: an order between products. Pay: nothing',
          ],
          answer: 1,
          why: 'A hash function maps any string to a bucket, including one never seen before. With 2 million products in 4,096 buckets, hundreds share each one. The model sees their mixture. More buckets means fewer collisions and more columns.',
        },
      ],
    },
    {
      id: 'features-leakage',
      title: 'Leakage and pipelines',
      summary: 'How information from the answer or from the test set gets into the features, and how to stop it.',
      text: [
        '**Leakage** means the model was trained or scored with information it will not have when it is used. The result is always the same: a wonderful score offline and a poor one in production. It is the most expensive mistake in applied machine learning because nothing crashes.',
        '**Target leakage** is a feature that is a consequence of the target, or is recorded after it. To predict churn at the start of the month you cannot use `cancellation_reason`. To predict default when a loan is applied for, you cannot use `missed_payments` on that loan. One test settles it for every column: **at the moment the prediction is made, would this value exist?** A feature that is almost perfectly predictive on its own should be treated as a suspect.',
        "**Train/test contamination** is any step that learns from data being fitted before the split, or on all the rows: a scaler's mean, an imputer's median, a target encoding, a vocabulary, a choice of the 20 best features. Each lets the test rows shape the features they are then scored on. Steps that learn nothing, such as taking a log or extracting the month from a date, are safe anywhere.",
        "**Duplicates and groups across the split.** If the same row, or rows from the same customer, patient or session, land on both sides, the model is partly being tested on its training data. Remove exact duplicates before splitting. When rows come in groups, split by group (`GroupKFold`, `GroupShuffleSplit`) so that a customer is entirely in training or entirely in test.",
        { code: `from sklearn.pipeline import make_pipeline

pipe = make_pipeline(SimpleImputer(strategy='median'), StandardScaler(), LogisticRegression())
pipe.fit(X_train, y_train)                         # every step is fitted on X_train only
pipe.score(X_test, y_test)                         # and only applied to X_test
cross_val_score(pipe, X_train, y_train, cv=5)      # refitted from scratch inside every fold` },
        'A **Pipeline** makes contamination hard to commit. It bundles the preprocessing steps and the model into one object. `fit` fits every step on the rows it is given, and `predict` only applies them. Hand the pipeline to `cross_val_score` or `GridSearchCV` and each fold refits every step on its own training part. It is also the thing you save and deploy, so training and serving cannot drift apart.',
      ],
      rules: [
        'For every feature: would this value exist at the moment of prediction?',
        'Split first. Fit every learned step on the training rows only.',
        'Put preprocessing in a Pipeline and cross-validate the whole pipeline.',
        'Remove duplicates before splitting. Split by group when rows share a customer or patient.',
        'A score that looks too good, or one feature that explains everything, is leakage until shown otherwise.',
      ],
      questions: [
        {
          kind: 'bug',
          id: 'features-leakage-1',
          ask: 'Which line lets the test rows influence the features?',
          code: `from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

X_train, X_test, y_train, y_test = train_test_split(X, y, random_state=0)
scaler = StandardScaler().fit(X)
model = LogisticRegression().fit(scaler.transform(X_train), y_train)
print(model.score(scaler.transform(X_test), y_test))`,
          line: 6,
          fix: 'scaler = StandardScaler().fit(X_train)',
          why: 'Fitting on `X` computes the mean and standard deviation from all rows, test rows included. The split came first, but the scaler ignored it.',
        },
        {
          kind: 'choice',
          id: 'features-leakage-2',
          ask: 'At the start of each month you predict which customers will cancel during it. Which of these columns must not be a feature?',
          options: ['`tenure_months`', '`plan`', '`cancellation_reason`', '`support_tickets_last_90_days`'],
          answer: 2,
          why: 'A cancellation reason exists only for customers who have cancelled. It is empty for everyone else, so "is it filled in" predicts the target perfectly, and it will be empty for every customer at the moment you predict.',
        },
        {
          kind: 'bug',
          id: 'features-leakage-3',
          ask: 'A pipeline is used, and the test score is still too good. Find the line.',
          code: `from sklearn.feature_selection import SelectKBest, f_classif
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=0)
pipe = make_pipeline(SelectKBest(f_classif, k=20), LogisticRegression(max_iter=1000))
pipe.fit(X, y)
print(pipe.score(X_test, y_test))`,
          line: 8,
          fix: 'pipe.fit(X_train, y_train)',
          why: 'A pipeline keeps its steps together. It cannot stop you from handing it the wrong rows. Fitted on all of `X`, both the feature selection and the model have seen every test row and its label.',
        },
        {
          kind: 'choice',
          id: 'features-leakage-4',
          ask: 'The features are pure noise and the labels are random, so no honest model can beat 50%. Why does this report about 85%?',
          code: `rng = np.random.default_rng(0)
X = rng.normal(size=(100, 5000))        # noise
y = rng.integers(0, 2, size=100)        # coin flips

X_best = SelectKBest(f_classif, k=20).fit_transform(X, y)
scores = cross_val_score(LogisticRegression(max_iter=1000), X_best, y, cv=5)
print(scores.mean())                    # about 0.85`,
          options: [
            'Logistic regression overfits with 20 features',
            'The 20 columns were chosen using the labels of all 100 rows, including the rows later used for validation',
            'Five folds are too few',
            'The random seed happened to be a lucky one',
          ],
          answer: 1,
          why: 'Among 5,000 noise columns some line up with the labels by chance. Choosing them with every label, then cross-validating, tests the model on rows that helped pick its features. With the selector inside the pipeline the same data scores about 50%.',
        },
        {
          kind: 'bug',
          id: 'features-leakage-5',
          ask: 'A house-price model. The first print shows 1,840 duplicated listings. Which line should change so the test score can be trusted?',
          code: `import pandas as pd
from sklearn.model_selection import train_test_split

df = pd.read_csv('listings.csv')
print(df.duplicated().sum())
train, test = train_test_split(df, test_size=0.2, random_state=0)
model.fit(train[features], train['price'])
print(model.score(test[features], test['price']))`,
          line: 6,
          fix: 'train, test = train_test_split(df.drop_duplicates(), test_size=0.2, random_state=0)',
          why: 'A random split sends some copies of a listing to training and others to test. The model then "predicts" prices it has memorised. Remove duplicates before the split, not after.',
        },
        {
          kind: 'bug',
          id: 'features-leakage-6',
          ask: 'One row per order, many orders per customer, and the target is a property of the customer. The cross-validation score is far higher than the score on new customers.',
          code: `from sklearn.model_selection import GroupKFold, KFold, cross_val_score

groups = df['customer_id']
cv = KFold(n_splits=5, shuffle=True, random_state=0)
scores = cross_val_score(model, X, y, cv=cv, groups=groups)
print(scores.mean())`,
          line: 4,
          fix: 'cv = GroupKFold(n_splits=5)',
          why: '`KFold` ignores `groups` (scikit-learn only warns), so each customer\'s orders are spread over training and validation and the model recognises the customer. `GroupKFold` keeps every customer on one side.',
        },
        {
          kind: 'output',
          id: 'features-leakage-7',
          ask: 'A check to run after any split. Rows are (customer, amount). What does this print?',
          code: `train = [('c1', 120), ('c2', 80), ('c3', 95), ('c2', 80)]
test = [('c4', 60), ('c2', 80), ('c5', 95)]

same_rows = set(train) & set(test)
same_customers = {c for c, _ in train} & {c for c, _ in test}
print(len(same_rows), sorted(same_customers))`,
          answer: "1 ['c2']",
          why: 'The row (c2, 80) is on both sides, and so customer c2 is too. Two lines of set arithmetic catch the most common cause of a test score that is too good.',
        },
        {
          kind: 'output',
          id: 'features-leakage-8',
          ask: 'The mean a scaler would learn, with and without the test row. What does this print?',
          code: `import numpy as np

train = np.array([1.0, 2.0, 3.0])
test = np.array([10.0])
print(train.mean(), np.concatenate([train, test]).mean())`,
          answer: '2.0 4.0',
          why: 'Fitted on everything, the mean moves from 2 to 4 because of a row the model is not supposed to know about. On large tables the shift from a scaler is small. From a target encoding or a feature selection it is not.',
        },
        {
          kind: 'choice',
          id: 'features-leakage-9',
          ask: 'Does anything leak here?',
          code: `X_train, X_test, y_train, y_test = train_test_split(X, y, random_state=0)
pipe = make_pipeline(SimpleImputer(strategy='median'), StandardScaler(), LogisticRegression(max_iter=1000))
search = GridSearchCV(pipe, {'logisticregression__C': [0.1, 1, 10]}, cv=5)
search.fit(X_train, y_train)
print(search.score(X_test, y_test))`,
          options: [
            'Yes: the imputer and scaler see the validation folds during the search',
            'Yes: the test set is used to choose C',
            'No: each fold refits the whole pipeline on its training part, and the test set is touched once, at the end',
            'Yes: the scaler should be fitted before the split',
          ],
          answer: 2,
          why: 'Because the imputer and scaler are inside the pipeline, the search clones and refits them for every fold. C is chosen on validation folds cut from the training set, and the test set gives one final, honest number.',
        },
        {
          kind: 'choice',
          id: 'features-leakage-10',
          ask: 'Which of these steps is safe to apply to the whole table before splitting?',
          options: [
            'Filling missing ages with the median age',
            'Replacing `city` with the average target for that city',
            'Adding `log1p(spend)` and the weekday of `order_date`',
            'Keeping the 30 columns most correlated with the target',
          ],
          answer: 2,
          why: 'A log and a weekday are computed from the row alone: nothing is learned from other rows, so nothing can leak. The other three learn a median, a set of target means and a choice of columns, and each must be fitted on training rows only.',
        },
        {
          kind: 'design',
          id: 'features-leakage-11',
          ask: 'A churn model scores 0.99 AUC on your test set. In its first month in production it scores 0.62. How do you find out what went wrong?',
          why: 'A gap this large is almost always leakage, not drift. The search goes from the cheapest check to the most involved.',
          checklist: [
            { point: 'Look at feature importance for one or two features that carry nearly all of it', why: 'A single dominant feature is the usual signature of target leakage.' },
            { point: 'For each top feature, ask when its value is written and whether it exists at prediction time', why: 'Columns filled in after the outcome (a cancellation date, a final status) are the classic cause.' },
            { point: 'Compare each feature in the training table with what production actually sends', why: 'A feature can be complete in the warehouse and empty, stale or computed differently at serving time.' },
            { point: 'Check that every fitted step (imputer, scaler, encoder, selection) was fitted on training rows only', why: 'Contamination inflates the offline score, though rarely by this much on its own.' },
            { point: 'Check for the same customers, or duplicated rows, on both sides of the split', why: 'With many rows per customer, a random split lets the model recognise people instead of predicting.' },
            { point: 'Re-split by time: train on earlier months, test on later ones', why: 'It imitates production. If the score falls towards 0.62, the random split was hiding the problem.' },
            { point: 'Remove the suspect features, retrain, and see whether offline and production now agree', why: 'A lower offline score that matches production is the honest one, and the starting point for real improvement.' },
          ],
        },
      ],
    },
    {
      id: 'features-time',
      title: 'Time, dates and aggregates',
      summary: 'Features from timestamps and histories, built only from what was known at the time.',
      widget: 'features-time',
      text: [
        'A timestamp is not a feature until you take it apart. Useful parts: hour, day of week, month, a weekend flag, a holiday flag, and **time since** something (days since signup, days since the last order). Durations are often the strongest of these.',
        'Hours, weekdays and months go round in a circle: hour 23 is next to hour 0, but as numbers they are 23 apart. **Cyclical encoding** puts the value on a circle with two columns, `sin(2π·h/24)` and `cos(2π·h/24)`, so that neighbours in time are neighbours in the features. Linear models and neural networks need this. Trees manage with the plain integer.',
        'For anything that unfolds in time, the best predictors are the past of the series itself. A **lag** is the value some steps back (sales 7 days ago). A **rolling window** summarises a stretch of the past (the mean of the previous 7 days). An **aggregate** does the same for an entity: a customer\'s number of orders, average basket, days since the last purchase.',
        { code: `df = df.sort_values(['store', 'date'])
sales = df.groupby('store')['sales']
df['dow'] = df['date'].dt.dayofweek
df['lag_7'] = sales.shift(7)                                             # same weekday last week
df['mean_7'] = sales.transform(lambda s: s.shift(1).rolling(7).mean())   # the 7 days before today` },
        'The rule that governs all of these is **as-of correctness**: a feature for a prediction made at time t may use only what was known at time t. A rolling mean that includes today contains the answer. A customer\'s `total_spend` computed over the whole table includes purchases made after the row you are predicting. If the forecast is made k days ahead, the newest usable value is k days old. In pandas, `shift` before `rolling`.',
        'Evaluation has to respect time too. A random split trains on Wednesday to predict Tuesday, with Monday and Wednesday as lag features on either side. Split by date: train on the earlier period, test on the later one.',
      ],
      rules: [
        'Break dates into parts and durations: hour, weekday, month, days since.',
        'Encode cyclic parts with sin and cos so that 23:00 and 00:00 are neighbours.',
        'Lags and rolling windows must end before the moment of prediction: shift, then roll.',
        'An aggregate for a row may use only events before that row\'s timestamp.',
        'If you predict k steps ahead, the smallest honest lag is k.',
        'Split by time, never at random, when the rows are ordered in time.',
      ],
      questions: [
        {
          kind: 'output',
          id: 'features-time-1',
          ask: 'Parts of a date. `weekday()` counts from Monday = 0. What does this print?',
          code: `from datetime import date

d = date(2024, 3, 9)      # a Saturday
print(d.weekday(), d.month, d.weekday() >= 5)`,
          answer: '5 3 True',
          why: 'Saturday is weekday 5, March is month 3, and "weekday of 5 or 6" is the weekend flag. Three features from one column, and a model cannot work any of them out from a raw timestamp.',
        },
        {
          kind: 'number',
          id: 'features-time-2',
          ask: 'A customer signed up on 1 March and the prediction is made on 31 March of the same year. What is the feature `days_since_signup`?',
          answer: 30,
          check: '31 - 1',
          why: '31 − 1 = 30 days. Durations measured back from the prediction date are safe: both ends are known at the time. "Days until the customer cancelled" would not be.',
        },
        {
          kind: 'choice',
          id: 'features-time-3',
          ask: 'A logistic regression gets `hour` as an integer from 0 to 23. Orders peak around midnight, from 22:00 to 02:00. Why does the model struggle?',
          options: [
            'Integers cannot be used in logistic regression',
            'To the model 23 and 0 are at opposite ends, and one weight can only say "later is better" or "later is worse"',
            'There are too few hours',
            'Hours need to be standardised first',
          ],
          answer: 1,
          why: 'The peak straddles the break in the numbering, and a single weight on the raw hour can only fit a steady rise or fall. Sin and cos columns (or one-hot hours) make midnight one region. A tree can cope with the integer by making two cuts.',
        },
        {
          kind: 'write',
          id: 'features-time-4',
          ask: 'Write cyclical encoding of an hour (0 to 23, possibly fractional): return `(sin, cos)` of the angle the hour makes on a 24-hour clock.',
          starter: `import math

def encode_hour(hour):
    # the angle is 2 * pi * hour / 24
    pass`,
          solution: `import math

def encode_hour(hour):
    angle = 2 * math.pi * hour / 24
    return math.sin(angle), math.cos(angle)`,
          tests: `out = encode_hour(0)
assert out is not None, "the function returns nothing yet"
assert abs(out[0]) < 1e-9 and abs(out[1] - 1) < 1e-9, f"hour 0 should give (0, 1), got {out}"
s, c = encode_hour(6)
assert abs(s - 1) < 1e-9 and abs(c) < 1e-9, f"hour 6 is a quarter of the way round: (1, 0), got {(s, c)}"
s, c = encode_hour(12)
assert abs(s) < 1e-9 and abs(c + 1) < 1e-9, f"hour 12 is half way round: (0, -1), got {(s, c)}"
def gap(a, b):
    (s1, c1), (s2, c2) = encode_hour(a), encode_hour(b)
    return ((s1 - s2) ** 2 + (c1 - c2) ** 2) ** 0.5
assert abs(gap(23, 0) - gap(0, 1)) < 1e-9, "23:00 and 00:00 should be as close as 00:00 and 01:00"
assert gap(0, 12) > gap(0, 6) > gap(0, 1), "hours further apart on the clock should be further apart in the features"`,
          why: 'Two columns are needed: sin alone gives 03:00 and 09:00 the same value. Together they place each hour at a point on a circle, where 23:00 sits beside 00:00.',
        },
        {
          kind: 'output',
          id: 'features-time-5',
          ask: 'A lag-1 feature and the day-on-day change, built by hand. What does this print?',
          code: `sales = [10, 12, 9, 15, 11]
lag_1 = [None] + sales[:-1]
change = [s - l for s, l in zip(sales[1:], lag_1[1:])]
print(lag_1, change)`,
          answer: '[None, 10, 12, 9, 15] [2, -3, 6, -4]',
          why: 'The lag moves every value one place later, so each day sees yesterday. The first day has no yesterday: it is missing, and that has to be handled like any other missing value.',
        },
        {
          kind: 'write',
          id: 'features-time-6',
          ask: 'Write a rolling mean that does not look ahead. For position i, return the mean of the `window` values **before** i (not including i). Where fewer than `window` earlier values exist, return `None`.',
          starter: `def rolling_mean_before(values, window):
    # out[i] = mean of values[i - window : i], or None
    pass`,
          solution: `def rolling_mean_before(values, window):
    out = []
    for i in range(len(values)):
        if i < window:
            out.append(None)
        else:
            out.append(sum(values[i - window:i]) / window)
    return out`,
          tests: `out = rolling_mean_before([10, 20, 30, 40], 2)
assert out is not None, "the function returns nothing yet"
assert len(out) == 4, "one value per position"
assert out[:2] == [None, None], f"the first 2 positions have fewer than 2 earlier values, so None; got {out[:2]}"
assert out[2] == 15, f"position 2 should be the mean of 10 and 20 = 15, got {out[2]} (25 means today's value is included)"
assert out[3] == 25, f"position 3 should be the mean of 20 and 30 = 25, got {out[3]}"
a = rolling_mean_before([5, 5, 5, 5, 100], 3)
b = rolling_mean_before([5, 5, 5, 5, -100], 3)
assert a[4] == b[4] == 5, "changing today's value must not change today's feature"
assert rolling_mean_before([1, 2, 3], 1) == [None, 1, 2], "with window 1 the feature is yesterday's value"`,
          why: 'The slice `values[i - window:i]` stops just before i. Changing today\'s value leaves today\'s feature untouched, which is the test for look-ahead in any feature built from a series.',
        },
        {
          kind: 'bug',
          id: 'features-time-7',
          ask: 'Features to predict each day\'s `sales` per store. The model is near perfect in validation and useless when deployed.',
          code: `df = df.sort_values(['store', 'date'])
sales = df.groupby('store')['sales']
df['dow'] = df['date'].dt.dayofweek
df['lag_7'] = sales.shift(7)
df['mean_7'] = sales.transform(lambda s: s.rolling(7).mean())`,
          line: 5,
          fix: "df['mean_7'] = sales.transform(lambda s: s.shift(1).rolling(7).mean())",
          why: '`rolling(7)` ends at the current row, so today\'s sales are one seventh of today\'s feature. Shift by one first and the window covers the seven days before.',
        },
        {
          kind: 'choice',
          id: 'features-time-8',
          ask: 'In the figure, set the **lag** to 0. The window turns red. Why?',
          options: [
            'The window has become too long',
            'The window now ends on the day being predicted, so the feature contains the value it is meant to predict',
            'A lag of 0 makes the mean undefined',
            'The series has a weekly pattern',
          ],
          answer: 1,
          why: 'With lag 0 the last day in the window is the target day itself. In training the feature will look superb. In production that value does not exist yet.',
        },
        {
          kind: 'number',
          id: 'features-time-9',
          ask: 'Stock is ordered 3 days ahead, so the forecast for a day must be made 3 days before it. In the figure, what is the smallest lag that uses only values known when the forecast is made?',
          answer: 3,
          why: 'When the forecast is made, the newest known value is from 3 days before the target day. Lags 1 and 2 use days that have not happened yet. The horizon of the forecast sets the smallest honest lag.',
        },
        {
          kind: 'output',
          id: 'features-time-10',
          ask: 'A per-customer aggregate that looks back only. Orders are (customer, day, amount). What does this print?',
          code: `orders = [('ann', 1, 20), ('bob', 2, 50), ('ann', 3, 30), ('ann', 5, 10)]

def spend_before(customer, day):
    return sum(amount for c, d, amount in orders if c == customer and d < day)

print(spend_before('ann', 3), spend_before('ann', 6))`,
          answer: '20 60',
          why: 'On day 3 only the day-1 order is in the past: 20. The day-3 order itself is excluded by `d < day`. By day 6 all three count. The same customer has a different feature value at different times, as she should.',
        },
        {
          kind: 'choice',
          id: 'features-time-11',
          ask: 'To predict whether an order will be returned, you compute `customer_return_rate` once per customer over the whole table and join it to every order. What is wrong?',
          options: [
            'Nothing: it is a per-customer feature, so one value per customer is right',
            'For each order, the rate includes that order\'s own outcome and the customer\'s later orders',
            'Return rates cannot be averaged',
            'The join duplicates rows',
          ],
          answer: 1,
          why: 'For a customer with one order, the "rate" is the label. The feature for an order must be computed from that customer\'s orders before it. This is the aggregate form of the rolling-window mistake.',
        },
        {
          kind: 'bug',
          id: 'features-time-12',
          ask: 'Daily sales with lag features. Which line makes the validation score better than anything you will see in production?',
          code: `import pandas as pd
from sklearn.model_selection import train_test_split

df = pd.read_csv('daily_sales.csv', parse_dates=['date']).sort_values('date')
df['lag_1'] = df.groupby('store')['sales'].shift(1)
train, test = train_test_split(df, test_size=0.2, random_state=0)`,
          line: 6,
          fix: 'train, test = train_test_split(df, test_size=0.2, shuffle=False)',
          why: 'A shuffled split scatters test days among training days, so the model is tested on days whose neighbours it trained on. With the table sorted by date, `shuffle=False` keeps the last 20% of days for testing.',
        },
      ],
    },
    {
      id: 'features-text',
      title: 'Text and embeddings as features',
      summary: 'Bag of words, TF-IDF, n-grams and pretrained embeddings, and when each is the right tool.',
      text: [
        'The oldest way to turn text into numbers still works. A **bag of words** makes one column per word in the vocabulary and counts how often each occurs in a document. Word order is thrown away. The vocabulary is learned from the training texts, so a word that first appears later has no column and is dropped without any error.',
        '**TF-IDF** reweights the counts. A word in nearly every document ("the", or "order" in an order-support inbox) says little, so it is scaled down. A word in few documents says a lot, so it is scaled up. The inverse document frequency is roughly `log(N / df)`: N documents, of which df contain the word.',
        '**N-grams** bring back a little word order by also counting pairs (and triples) of adjacent words. With single words, "not good" is "good" plus a stray "not". With bigrams, `not good` has a column of its own. The price is a much larger vocabulary. `min_df` drops words seen in too few documents and keeps it in check.',
        { code: `pipe = make_pipeline(
    TfidfVectorizer(ngram_range=(1, 2), min_df=2),
    LogisticRegression(max_iter=1000),
)
pipe.fit(train_texts, y_train)     # the vocabulary and the IDF weights come from the training texts only` },
        'A **pretrained embedding model** takes the other road: it maps each text to a dense vector of a few hundred numbers, placed so that texts with similar meaning are close together. "My parcel never came" and "the delivery did not arrive" share almost no words, yet land near each other. You then train a small model on the vectors.',
        'Which to use. TF-IDF with a linear model is fast, cheap and easy to inspect, strong when you have thousands of labelled examples, and the right tool when exact tokens matter: product codes, error codes, names. Embeddings win when labelled data is scarce, when the same thing is said in many ways or in several languages, and when meaning matters more than wording. Build the TF-IDF baseline first. It takes minutes and tells you what the embeddings have to beat.',
      ],
      rules: [
        'Bag of words: one column per vocabulary word, counts as values, word order lost.',
        'TF-IDF scales down words that occur everywhere and scales up rare ones.',
        'Bigrams keep phrases such as "not good" together, at the cost of a larger vocabulary.',
        'The vectoriser is fitted on training texts only. Unseen words are dropped silently.',
        'Exact tokens and plenty of labels: TF-IDF. Paraphrase, little data, many languages: embeddings.',
        'Always build the TF-IDF plus linear model baseline first.',
      ],
      questions: [
        {
          kind: 'output',
          id: 'features-text-1',
          ask: 'Two short reviews as a bag of words. What does this print?',
          code: `from sklearn.feature_extraction.text import CountVectorizer

docs = ['late delivery', 'great delivery great price']
vec = CountVectorizer()
X = vec.fit_transform(docs)
print(vec.get_feature_names_out().tolist())
print(X.toarray().tolist())`,
          answer: "['delivery', 'great', 'late', 'price']\n[[1, 0, 1, 0], [1, 2, 0, 1]]",
          why: 'The vocabulary is the four distinct words in alphabetical order. Each row counts them: the second review has "great" twice. Nothing records which word came first.',
        },
        {
          kind: 'output',
          id: 'features-text-2',
          ask: 'A vectoriser fitted on two messages meets a new one. What does this print?',
          code: `from sklearn.feature_extraction.text import CountVectorizer

vec = CountVectorizer().fit(['refund please', 'where is my order'])
print(vec.transform(['refund my parcel please']).toarray().sum())`,
          answer: '3',
          why: '"refund", "my" and "please" are in the vocabulary. "parcel" is not, so it is dropped with no warning: three counts, not four. If production text is full of words the training set never had, the model sees almost nothing.',
        },
        {
          kind: 'output',
          id: 'features-text-3',
          ask: 'Single words and pairs of adjacent words. What does this print?',
          code: `from sklearn.feature_extraction.text import CountVectorizer

vec = CountVectorizer(ngram_range=(1, 2)).fit(['not good at all'])
print(len(vec.vocabulary_))`,
          answer: '7',
          why: 'Four single words, plus three pairs: "not good", "good at", "at all". On real text, bigrams multiply the vocabulary many times over, which is why `min_df` is usually set with them.',
        },
        {
          kind: 'choice',
          id: 'features-text-4',
          ask: 'A sentiment model on single-word counts gives "the food was not good" a positive score. Which change addresses the cause most directly?',
          options: [
            'Remove the word "not" as a stop word',
            'Use `ngram_range=(1, 2)` so that "not good" becomes a feature of its own',
            'Lower-case the text',
            'Switch from counts to TF-IDF',
          ],
          answer: 1,
          why: 'With single words the model sees "good", which is positive nearly everywhere, and a weak "not". A bigram column lets it learn that "not good" is negative. Removing "not" as a stop word would make it worse, and many stop-word lists do exactly that.',
        },
        {
          kind: 'number',
          id: 'features-text-5',
          ask: 'A collection has 1,000 documents and a word occurs in 10 of them. Using idf = ln(N / df), what is its inverse document frequency? (One decimal.)',
          answer: 4.6,
          tol: 0.06,
          check: 'math.log(1000 / 10)',
          why: 'ln(1000 / 10) = ln(100) ≈ 4.6. A word in all 1,000 documents gets ln(1) = 0: it tells documents apart not at all. (scikit-learn uses a slightly smoothed version of this formula.)',
        },
        {
          kind: 'output',
          id: 'features-text-6',
          ask: 'Which word gets the lowest IDF weight and which the highest? What does this print?',
          code: `from sklearn.feature_extraction.text import TfidfVectorizer

docs = ['the parcel', 'the parcel', 'the refund']
vec = TfidfVectorizer().fit(docs)
idf = dict(zip(vec.get_feature_names_out(), vec.idf_))
print(min(idf, key=idf.get), max(idf, key=idf.get))`,
          answer: 'the refund',
          why: '"the" is in all three documents, so it is weighted least. "refund" is in one, so it is weighted most. The weights are learned from the documents, which is why the vectoriser belongs inside the pipeline.',
        },
        {
          kind: 'bug',
          id: 'features-text-7',
          ask: 'A ticket classifier. This fails with a shape error, or, when the shapes happen to match, scores at chance level.',
          code: `from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

vec = TfidfVectorizer(min_df=2)
X_train = vec.fit_transform(train_texts)
X_test = vec.fit_transform(test_texts)
clf = LogisticRegression(max_iter=1000).fit(X_train, y_train)
print(clf.score(X_test, y_test))`,
          line: 6,
          fix: 'X_test = vec.transform(test_texts)',
          why: 'Refitting builds a new vocabulary from the test texts, so column 17 means one word in training and another in test. `transform` reuses the training vocabulary and IDF weights.',
        },
        {
          kind: 'choice',
          id: 'features-text-8',
          ask: 'You set `min_df=5` on a TF-IDF vectoriser. What does it do, and why would you want it?',
          options: [
            'Keeps only the 5 most common words, to speed things up',
            'Drops words that appear in fewer than 5 training documents: typos and one-offs that the model could only memorise',
            'Drops words that appear more than 5 times, because they are too common',
            'Limits every document to 5 words',
          ],
          answer: 1,
          why: 'A word seen in one or two documents gives the model a column it can use to memorise those documents. Removing such words shrinks the vocabulary a great deal, especially with bigrams, and usually costs nothing in accuracy.',
        },
        {
          kind: 'choice',
          id: 'features-text-9',
          ask: 'You have 300 labelled support tickets in four languages. Customers describe the same fault in very different words. Which first approach is most likely to work?',
          options: [
            'A bag of words with a linear model',
            'TF-IDF with trigrams',
            'A multilingual pretrained embedding model, with a logistic regression on its vectors',
            'Training a neural network on the 300 tickets from scratch',
          ],
          answer: 2,
          why: 'Word-count features need to have seen each wording, in each language, with a label, and 300 tickets cannot provide that. The embedding model already places texts of similar meaning close together, so a small classifier on top needs few examples.',
        },
        {
          kind: 'choice',
          id: 'features-text-10',
          ask: 'Engineers search incident reports for error codes such as `E1047` and part numbers such as `KX-220`. Where is TF-IDF likely to beat a general-purpose embedding model?',
          options: [
            'Nowhere: embeddings are always better',
            'Here: the codes are exact tokens, which TF-IDF matches precisely and weights highly because they are rare',
            'Only when the reports are very long',
            'Only when there are no labels',
          ],
          answer: 1,
          why: 'To an embedding model `E1047` and `E1048` look almost the same, though they are different faults. An exact, rare token is where word-based features are strongest. Many search systems combine the two for this reason.',
        },
        {
          kind: 'design',
          id: 'features-text-11',
          ask: 'You must route incoming support tickets to one of 12 teams. You have 5,000 tickets that were routed by hand. How do you build the text features, and how do you decide whether embeddings are worth their cost?',
          why: 'The answer is a comparison, not a guess: a cheap baseline, an honest split, and a decision made on numbers that include cost.',
          checklist: [
            { point: 'Split by time, with the most recent tickets as the test set', why: 'Products and wording change. A random split hides how the model does on next month\'s tickets.' },
            { point: 'Build a TF-IDF (words and bigrams, `min_df` set) plus logistic regression pipeline first', why: 'It takes minutes, is hard to beat with 5,000 labels, and gives the number everything else is measured against.' },
            { point: 'Keep the vectoriser inside the pipeline so it is fitted on training folds only', why: 'The vocabulary and IDF weights are learned from data, like a scaler\'s mean.' },
            { point: 'Look at the per-team results and the most confused pairs of teams', why: 'An overall accuracy hides a small team whose tickets are always misrouted.' },
            { point: 'Try embeddings from a pretrained model with the same classifier on top, on the same split', why: 'A like-for-like comparison shows what the embeddings add, especially for the rare teams and unusual wordings.' },
            { point: 'Try both together: TF-IDF columns alongside the embedding', why: 'They fail differently. Exact tokens such as product names help one, paraphrase helps the other.' },
            { point: 'Weigh the gain against latency, cost per ticket and the extra dependency', why: 'Two points of accuracy may not justify a model call on every ticket, or may be well worth it.' },
          ],
        },
      ],
    },
    {
      id: 'features-selection',
      title: 'Interactions, selection and importance',
      summary: 'Features made from other features, which ones to keep, and how to measure what a feature is worth.',
      text: [
        'Many of the best features are simple combinations of columns you already have. **Ratios** and **differences** express what matters directly: debt divided by income, price per square metre, this month\'s spend minus last month\'s, days between order and dispatch. A linear model cannot build a ratio from its parts at all. A tree model can only approximate one with many small steps. Handing it over as a column makes the pattern easy to find.',
        'A **cross** joins two categorical columns into one: `device` and `time_of_day` become `mobile_night`, `desktop_day` and so on. A linear model with separate device and time columns can only add their effects. The cross lets it learn that mobile users click more at night. Crosses multiply the number of categories, so use them where you have a reason.',
        '**Remove** what cannot help. Constant columns, exact duplicate columns, ids that are unique per row, and one of each pair of near-identical columns (the same length in metres and in feet). Fewer features mean faster training, fewer things to break in production and a model that is easier to explain.',
        'To rank what is left you need a measure of **importance**. Tree models offer one for free, based on how much each feature reduced impurity during training. It is computed on the training data and it favours columns with many distinct values, so a random id can rank high. **Permutation importance** is the honest alternative: on held-out data, shuffle one column, and see how far the score falls. A column the model does not rely on costs nothing when scrambled.',
        { code: `from sklearn.inspection import permutation_importance

result = permutation_importance(model, X_val, y_val, n_repeats=10, random_state=0)
result.importances_mean        # the average fall in score when each column is shuffled` },
        'Two cautions. When two features carry the same information, shuffling one hurts little because the model leans on the other, so both can look unimportant: check groups of correlated features together. And choosing features is part of training. Pick them by looking at the test score and the test set is no longer a test. Select on a validation set or inside cross-validation, and keep the test set for one final number.',
      ],
      rules: [
        'Give the model ratios and differences that match how the problem works.',
        'Cross two categories when their effect depends on the combination.',
        'Drop constant columns, duplicate columns and row ids.',
        'Trust permutation importance on held-out data over built-in importance.',
        'Correlated features share importance: each can look weak while the pair is strong.',
        'Select features on validation data, never on the test set.',
      ],
      questions: [
        {
          kind: 'choice',
          id: 'features-selection-1',
          ask: 'For loan default, `debt` and `income` are both features, and what really matters is debt relative to income. Why add `debt / income` as a column even for a gradient-boosted tree model?',
          options: [
            'Trees cannot use two columns at once',
            'A tree can only approximate a ratio with many axis-aligned cuts, so the explicit column gets the same pattern with fewer splits and less data',
            'It removes the need for the original columns',
            'Ratios are always normally distributed',
          ],
          answer: 1,
          why: 'Each split looks at one column and one threshold. A line of constant debt/income is a diagonal, which takes a staircase of splits to follow. One split on the ratio does the same job.',
        },
        {
          kind: 'output',
          id: 'features-selection-2',
          ask: 'Crossing two categorical columns. What does this print?',
          code: `rows = [('mobile', 'night'), ('desktop', 'day'), ('mobile', 'day'), ('mobile', 'night')]
crossed = [device + '_' + part for device, part in rows]
print(crossed[0], len(set(crossed)))`,
          answer: 'mobile_night 3',
          why: 'The cross is a new categorical column with one value per combination that occurs: three here. It is then encoded like any other category.',
        },
        {
          kind: 'number',
          id: 'features-selection-3',
          ask: 'You cross `city` (50 values) with `hour` (24 values) and one-hot encode the result. What is the largest number of columns that can produce?',
          answer: 1200,
          check: '50 * 24',
          why: '50 × 24 = 1,200. Crosses multiply. Each combination also has far fewer rows than either column alone, so crosses of large columns need a lot of data, or a coarser version such as four parts of the day.',
        },
        {
          kind: 'choice',
          id: 'features-selection-4',
          ask: 'A logistic regression predicts ad clicks from one-hot `device` and one-hot `time_of_day`. Mobile users click most at night and desktop users most by day. What is missing?',
          options: [
            'Scaling of the one-hot columns',
            'A crossed feature of device and time of day: the model can only add a device effect to a time effect',
            'More training rounds',
            'A log transform',
          ],
          answer: 1,
          why: 'With separate columns the model learns one adjustment for mobile and one for night and adds them. It cannot say "night is good for mobile and bad for desktop". The cross has a weight for each combination.',
        },
        {
          kind: 'output',
          id: 'features-selection-5',
          ask: 'Finding columns that cannot help. What does this print?',
          code: `import numpy as np

X = np.array([[1, 5, 1, 0],
              [2, 5, 2, 1],
              [3, 5, 3, 0]])
constant = [j for j in range(4) if X[:, j].std() == 0]
copies = [j for j in range(4) if any((X[:, j] == X[:, i]).all() for i in range(j))]
print(constant, copies)`,
          answer: '[1] [2]',
          why: 'Column 1 is 5 in every row: it can never separate one row from another. Column 2 repeats column 0. Both can go without losing anything.',
        },
        {
          kind: 'number',
          id: 'features-selection-6',
          ask: 'A model scores 0.90 on validation data. With the `tenure` column shuffled, three repeats score 0.84, 0.86 and 0.85. What is the permutation importance of `tenure`?',
          answer: 0.05,
          tol: 0.001,
          check: '0.90 - np.mean([0.84, 0.86, 0.85])',
          why: 'The shuffled scores average 0.85, so the model loses 0.05 without the real values. Repeating the shuffle and averaging removes the luck of one particular shuffle.',
        },
        {
          kind: 'write',
          id: 'features-selection-7',
          numpy: true,
          ask: 'Write permutation importance for one column. `predict` takes an array `X` and returns predicted labels. Return the accuracy on `(X, y)` minus the accuracy after column `col` has been shuffled. Do not modify `X`.',
          starter: `import numpy as np

def permutation_drop(predict, X, y, col, seed=0):
    rng = np.random.default_rng(seed)
    # accuracy before, minus accuracy with column col shuffled (use rng.permutation)
    pass`,
          solution: `import numpy as np

def permutation_drop(predict, X, y, col, seed=0):
    rng = np.random.default_rng(seed)
    base = (predict(X) == y).mean()
    shuffled = X.copy()
    shuffled[:, col] = rng.permutation(shuffled[:, col])
    return base - (predict(shuffled) == y).mean()`,
          tests: `X = np.column_stack([np.arange(40.0), np.tile([0.0, 1.0], 20)])
y = (X[:, 0] >= 20).astype(int)
predict = lambda A: (A[:, 0] >= 20).astype(int)   # a model that uses column 0 only
before = X.copy()
out = permutation_drop(predict, X, y, 0)
assert out is not None, "the function returns nothing yet"
assert np.array_equal(X, before), "X was changed: shuffle a copy, or every later measurement is wrong"
assert out > 0.1, f"shuffling the column the model relies on should cost accuracy, got a drop of {out}"
assert permutation_drop(predict, X, y, 1) == 0, "the model ignores column 1, so shuffling it should cost exactly 0"
assert np.array_equal(X, before), "X was changed: shuffle a copy"`,
          why: 'Score, scramble one column in a copy, score again. Nothing is retrained, so it works with any model. The copy matters: shuffling in place would leave the column scrambled for every measurement after it.',
        },
        {
          kind: 'bug',
          id: 'features-selection-8',
          ask: 'Ranking features by permutation importance. The ranking flatters features the model has memorised.',
          code: `from sklearn.inspection import permutation_importance

model.fit(X_train, y_train)
result = permutation_importance(model, X_train, y_train, n_repeats=10, random_state=0)
ranked = sorted(zip(feature_names, result.importances_mean), key=lambda pair: -pair[1])
for name, drop in ranked:
    print(name, round(drop, 3))`,
          line: 4,
          fix: 'result = permutation_importance(model, X_val, y_val, n_repeats=10, random_state=0)',
          why: 'On the training data a feature the model has overfitted to looks valuable: scrambling it breaks the memorised answers. Importance measured on held-out rows shows what helps on new data.',
        },
        {
          kind: 'choice',
          id: 'features-selection-9',
          ask: 'A random forest ranks `row_id` (unique per row, pure noise) third by its built-in importance. Its permutation importance on validation data is about 0. Which do you believe, and why?',
          options: [
            'The built-in importance: it comes from the model itself',
            'Permutation importance: built-in importance is measured on training data and rewards columns with many distinct values that the trees used to memorise rows',
            'Neither: importance cannot be measured',
            'Both: the column is important in training, so keep it',
          ],
          answer: 1,
          why: 'A column with a unique value per row offers endless ways to split the training data, and deep trees take them. Those splits mean nothing on new rows, which is exactly what scrambling the column on validation data reveals. Drop the id.',
        },
        {
          kind: 'choice',
          id: 'features-selection-10',
          ask: 'A house-price model has `area_m2` and `area_sqft`. Each has a small permutation importance, yet removing both ruins the model. What explains it?',
          options: [
            'Permutation importance is broken for numeric columns',
            'The two carry the same information, so when one is shuffled the model still has the other: the importance is shared between them',
            'Area does not matter for price',
            'The model is underfitting',
          ],
          answer: 1,
          why: 'Importance per column answers "what if only this one were lost". For duplicated information the answer is "not much". Drop one of the pair, or shuffle them together, to see what the information is really worth.',
        },
        {
          kind: 'bug',
          id: 'features-selection-11',
          ask: 'Choosing between candidate sets of features. The reported final score is optimistic.',
          code: `best_score, best_features = 0, None
for features in candidate_sets:
    model.fit(X_train[features], y_train)
    score = model.score(X_test[features], y_test)
    if score > best_score:
        best_score, best_features = score, features
print('test score:', best_score)`,
          line: 4,
          fix: '    score = model.score(X_val[features], y_val)',
          why: 'The best of many tries on the test set is partly luck, and that luck is baked into the number you report. Choose on validation data, then score the chosen set on the test set once.',
        },
        {
          kind: 'design',
          id: 'features-selection-12',
          ask: 'A model uses 400 features. It is slow, and its results change noticeably between retrains. How do you cut the features down without fooling yourself?',
          why: 'Selection is a modelling step like any other: it is done on training and validation data, checked for stability, and judged once on the test set.',
          checklist: [
            { point: 'Record the current validation score, with its variation across folds or seeds, as the baseline', why: 'Without the noise level you cannot tell a real loss from a random wobble.' },
            { point: 'Drop constant columns, exact duplicates and per-row ids first', why: 'They cannot help, so removing them is free.' },
            { point: 'Group highly correlated features and keep one from each group', why: 'Redundant features split importance between them and make the ranking unstable.' },
            { point: 'Rank the rest by permutation importance on validation data, repeated several times', why: 'It measures what helps on unseen rows, and the repeats show which rankings are noise.' },
            { point: 'Remove features in batches and re-check the validation score after each batch', why: 'Importance is measured one feature at a time. Removing many at once can cost more than the sum.' },
            { point: 'Run the selection inside cross-validation, not once on all the data', why: 'Features chosen with the validation rows make those rows look easier than new data will be.' },
            { point: 'Keep the test set out of every decision and use it once, on the final set', why: 'Any choice made on the test set turns it into training data.' },
            { point: 'Weigh the cost of producing each feature in production against its gain', why: 'A feature that needs a slow join or a fragile upstream table may not be worth a small improvement.' },
          ],
        },
      ],
    },
    {
      id: 'features-lab',
      title: 'Lab: a preprocessing pipeline that cannot leak',
      summary: 'Build, from plain Python, the fit-then-transform pipeline that turns a customer row into a feature vector.',
      text: [
        'This lab builds by hand what a scikit-learn `Pipeline` with a `ColumnTransformer` does, for a small customer table. Writing it once makes the rule behind every earlier lesson concrete: **everything learned from data is learned in `fit`, from training rows, and stored. `transform` only applies it.**',
        { code: `# one customer                                          # orders: (customer, date, amount)
{'customer': 'c9', 'age': None, 'plan': 'pro',          ('c9', '2024-03-05', 50.0)
 'signup': '2024-03-01'}                                ('c9', '2024-03-20', 25.0)` },
        'The feature vector has eight numbers: the age, standardised, and a flag saying whether it was missing; the plan, one-hot; days since signup and a weekend-signup flag; and the number and total value of the customer\'s orders before the prediction date.',
        'Three kinds of step appear. **Learned** steps (the median, mean and standard deviation of age, and the list of plans) have a fit function and a transform function. **Stateless** steps (date parts) need no fitting. **As-of** steps (the order history) take the prediction date and look only backwards from it.',
        'Each step below is self-contained, and the last one puts them together and transforms a customer the pipeline has never seen: no age, and a plan that did not exist in training.',
      ],
      rules: [
        'Fit learns numbers from training rows and stores them. Transform applies them and learns nothing.',
        'Every transform must work on a single new row, with missing values and unseen categories.',
        'Features from history take an "as of" date and use only what came before it.',
        'The stored state plus the transform code is the thing you deploy.',
        'Test the pipeline with the awkward row: missing, unseen and brand new.',
      ],
      questions: [
        {
          kind: 'write',
          id: 'features-lab-1',
          ask: '**Step 1: learn the numbers for a numeric column.** From the training values (`None` means missing) return a dict with the `median` of the known values, and the `mean` and `std` of the column after its gaps have been filled with that median. If the std is 0, store 1.0.',
          starter: `import statistics

def fit_numeric(train_values):
    # returns {'median': ..., 'mean': ..., 'std': ...}
    # statistics.median(list) gives the median
    pass`,
          solution: `import statistics

def fit_numeric(train_values):
    known = [v for v in train_values if v is not None]
    median = statistics.median(known)
    filled = [median if v is None else v for v in train_values]
    mean = sum(filled) / len(filled)
    std = (sum((v - mean) ** 2 for v in filled) / len(filled)) ** 0.5
    return {'median': median, 'mean': mean, 'std': std if std > 0 else 1.0}`,
          tests: `out = fit_numeric([20, None, 40])
assert out is not None, "the function returns nothing yet"
assert set(out) == {'median', 'mean', 'std'}, f"the dict needs the keys median, mean and std, got {sorted(out)}"
assert out['median'] == 30, f"the median of the known values 20 and 40 is 30, got {out['median']}"
assert abs(out['mean'] - 30) < 1e-9, f"after filling, the values are 20, 30, 40: mean 30, got {out['mean']}"
assert abs(out['std'] - 8.1649658) < 1e-6, f"the std of 20, 30, 40 is about 8.165 (divide by n), got {out['std']}"
out = fit_numeric([10, 20, 30, None, 1000])
assert out['median'] == 25, f"the median of 10, 20, 30, 1000 is 25, got {out['median']}"
assert abs(out['mean'] - 217) < 1e-9, f"the mean is taken after filling the gap with 25: 217, got {out['mean']}"
assert fit_numeric([5, 5, None])['std'] == 1.0, "a constant column has std 0: store 1.0 so that scaling does not divide by zero"`,
          why: 'Three numbers are the whole state for this column. The mean and std are taken after filling, because that is the column the scaler will see.',
        },
        {
          kind: 'write',
          id: 'features-lab-2',
          ask: '**Step 2: apply them to one value.** Given a value (or `None`) and the stats from step 1, return `[scaled, flag]`: fill a missing value with the median, standardise with the stored mean and std, and set the flag to 1 if the value was missing, else 0.',
          starter: `def transform_numeric(value, stats):
    # stats: {'median': ..., 'mean': ..., 'std': ...}
    # returns [scaled value, 1 if it was missing else 0]
    pass`,
          solution: `def transform_numeric(value, stats):
    flag = 1 if value is None else 0
    filled = stats['median'] if value is None else value
    return [(filled - stats['mean']) / stats['std'], flag]`,
          tests: `stats = {'median': 30, 'mean': 32, 'std': 10}
out = transform_numeric(52, stats)
assert out is not None, "the function returns nothing yet"
assert out == [2.0, 0], f"(52 - 32) / 10 = 2.0, and it was not missing: [2.0, 0]; got {out}"
out = transform_numeric(None, stats)
assert out[1] == 1, "a missing value should set the flag to 1"
assert abs(out[0] + 0.2) < 1e-9, f"a missing value is filled with the median 30, then scaled: (30 - 32) / 10 = -0.2; got {out[0]}"
assert transform_numeric(0, stats) == [-3.2, 0], "0 is a real value, not a missing one: [(0 - 32) / 10, 0]"
assert stats == {'median': 30, 'mean': 32, 'std': 10}, "transform must not change the stored statistics"`,
          why: 'The function takes one value and the stored numbers and computes nothing new from data. That is what makes it safe to call on a test row or on a single request in production.',
        },
        {
          kind: 'write',
          id: 'features-lab-3',
          ask: '**Step 3: categories.** Write `fit_categories`, which returns the sorted list of distinct training values (ignoring `None`), and `one_hot`, which turns one value into a list of 0s and 1s in that order. An unseen or missing value gives all zeros.',
          starter: `def fit_categories(train_values):
    # sorted list of the distinct values, without None
    pass

def one_hot(value, categories):
    # a list with one 0/1 per category
    pass`,
          solution: `def fit_categories(train_values):
    return sorted({v for v in train_values if v is not None})

def one_hot(value, categories):
    return [1 if value == c else 0 for c in categories]`,
          tests: `cats = fit_categories(['pro', 'basic', None, 'pro', 'basic'])
assert cats is not None, "fit_categories returns nothing yet"
assert cats == ['basic', 'pro'], f"expected ['basic', 'pro'] (sorted, no repeats, no None), got {cats}"
out = one_hot('pro', cats)
assert out is not None, "one_hot returns nothing yet"
assert out == [0, 1], f"'pro' is the second category: [0, 1], got {out}"
assert one_hot('basic', cats) == [1, 0], "'basic' is the first category: [1, 0]"
assert one_hot('enterprise', cats) == [0, 0], "a plan never seen in training should give all zeros, not an error"
assert one_hot(None, cats) == [0, 0], "a missing plan should give all zeros"`,
          why: 'Sorting fixes the column order, so the same plan always lands in the same position. The all-zeros row for an unseen plan is a decision made now, not an exception raised at three in the morning.',
        },
        {
          kind: 'write',
          id: 'features-lab-4',
          ask: '**Step 4: a date feature.** Dates are ISO strings such as `"2024-03-01"`. Return `[days, weekend]`: the number of days from `signup` to `as_of`, and 1 if the signup day was a Saturday or Sunday, else 0.',
          starter: `from datetime import date

def signup_features(signup, as_of):
    # date.fromisoformat('2024-03-01') parses a string; subtracting two dates gives .days
    # returns [days since signup, 1 if the signup was at a weekend else 0]
    pass`,
          solution: `from datetime import date

def signup_features(signup, as_of):
    start = date.fromisoformat(signup)
    days = (date.fromisoformat(as_of) - start).days
    return [days, 1 if start.weekday() >= 5 else 0]`,
          tests: `out = signup_features('2024-03-01', '2024-03-31')
assert out is not None, "the function returns nothing yet"
assert out == [30, 0], f"1 March 2024 was a Friday, 30 days before 31 March: [30, 0]; got {out}"
assert signup_features('2024-03-09', '2024-03-10') == [1, 1], "9 March 2024 was a Saturday: [1, 1]"
assert signup_features('2024-03-10', '2024-03-10') == [0, 1], "a Sunday signup on the prediction date itself: [0, 1]"
assert signup_features('2024-02-28', '2024-03-01')[0] == 2, "2024 is a leap year: 28 February to 1 March is 2 days"
assert signup_features('2023-12-31', '2024-01-01')[0] == 1, "the count must work across a change of year"`,
          why: 'Nothing is fitted: the features come from the row and the prediction date alone, so this step cannot leak. Measuring to `as_of`, not to today, makes the training rows look the way they would have looked at prediction time.',
        },
        {
          kind: 'write',
          id: 'features-lab-5',
          ask: '**Step 5: an aggregate that only looks back.** `orders` is a list of `(customer, date, amount)` with ISO date strings. Return `[count, total]` for the orders of `customer` made strictly before `as_of`.',
          starter: `def orders_before(orders, customer, as_of):
    # ISO date strings compare correctly as text: '2024-03-05' < '2024-03-31'
    # returns [number of earlier orders, their total amount]
    pass`,
          solution: `def orders_before(orders, customer, as_of):
    amounts = [amount for c, day, amount in orders if c == customer and day < as_of]
    return [len(amounts), sum(amounts)]`,
          tests: `orders = [
    ('c9', '2024-03-05', 50.0),
    ('c1', '2024-03-06', 10.0),
    ('c9', '2024-03-20', 25.0),
    ('c9', '2024-03-31', 70.0),
    ('c9', '2024-04-02', 99.0),
]
out = orders_before(orders, 'c9', '2024-03-31')
assert out is not None, "the function returns nothing yet"
assert out[0] != 5 and out[0] != 4, "only this customer's orders count, and only those before the date"
assert out == [2, 75.0], f"c9 has two orders before 31 March, worth 75: [2, 75.0]; got {out} (an order on the day itself is not in the past)"
assert orders_before(orders, 'c9', '2024-05-01') == [4, 244.0], "by 1 May all four of c9's orders are in the past"
assert orders_before(orders, 'c9', '2024-03-01') == [0, 0], "before the first order the answer is [0, 0]"
assert orders_before(orders, 'nobody', '2024-05-01') == [0, 0], "a customer with no orders gets [0, 0]"`,
          why: 'The date is an argument, so the same customer gets different values at different prediction times, and an order made on or after that date can never be counted. A total computed over the whole table would include the future.',
        },
        {
          kind: 'bug',
          id: 'features-lab-6',
          ask: '**Step 6: who gets to fit?** This splits customers by signup date and learns the state. One line lets the test customers in.',
          code: `def build(rows, cutoff):
    train = [r for r in rows if r['signup'] < cutoff]
    test = [r for r in rows if r['signup'] >= cutoff]
    state = {
        'age': fit_numeric([r['age'] for r in rows]),
        'plans': fit_categories([r['plan'] for r in train]),
    }
    return state, train, test`,
          line: 5,
          fix: "        'age': fit_numeric([r['age'] for r in train]),",
          why: 'The split is correct and the plans are learned from `train`, but the age statistics are computed from every row. The median, mean and std then carry the test customers\' ages into the features they are scored on.',
        },
        {
          kind: 'write',
          id: 'features-lab-7',
          ask: '**Step 7: put it together.** The helpers from steps 1 to 5 are given. Write `fit`, which learns the state from training rows as `{"age": stats, "plans": categories}`, and `transform`, which turns one row into the vector `[age scaled, age missing, one-hot plan..., days since signup, weekend signup, orders before, total before]`.',
          starter: `import statistics
from datetime import date

def fit_numeric(train_values):
    known = [v for v in train_values if v is not None]
    median = statistics.median(known)
    filled = [median if v is None else v for v in train_values]
    mean = sum(filled) / len(filled)
    std = (sum((v - mean) ** 2 for v in filled) / len(filled)) ** 0.5
    return {'median': median, 'mean': mean, 'std': std if std > 0 else 1.0}

def transform_numeric(value, stats):
    filled = stats['median'] if value is None else value
    return [(filled - stats['mean']) / stats['std'], 1 if value is None else 0]

def fit_categories(train_values):
    return sorted({v for v in train_values if v is not None})

def one_hot(value, categories):
    return [1 if value == c else 0 for c in categories]

def signup_features(signup, as_of):
    start = date.fromisoformat(signup)
    return [(date.fromisoformat(as_of) - start).days, 1 if start.weekday() >= 5 else 0]

def orders_before(orders, customer, as_of):
    amounts = [amount for c, day, amount in orders if c == customer and day < as_of]
    return [len(amounts), sum(amounts)]

def fit(train_rows):
    # rows are dicts with the keys customer, age, plan, signup
    # returns {'age': ..., 'plans': ...}
    pass

def transform(row, state, orders, as_of):
    # one flat list: age pair + plan one-hot + signup pair + orders pair
    pass`,
          solution: `import statistics
from datetime import date

def fit_numeric(train_values):
    known = [v for v in train_values if v is not None]
    median = statistics.median(known)
    filled = [median if v is None else v for v in train_values]
    mean = sum(filled) / len(filled)
    std = (sum((v - mean) ** 2 for v in filled) / len(filled)) ** 0.5
    return {'median': median, 'mean': mean, 'std': std if std > 0 else 1.0}

def transform_numeric(value, stats):
    filled = stats['median'] if value is None else value
    return [(filled - stats['mean']) / stats['std'], 1 if value is None else 0]

def fit_categories(train_values):
    return sorted({v for v in train_values if v is not None})

def one_hot(value, categories):
    return [1 if value == c else 0 for c in categories]

def signup_features(signup, as_of):
    start = date.fromisoformat(signup)
    return [(date.fromisoformat(as_of) - start).days, 1 if start.weekday() >= 5 else 0]

def orders_before(orders, customer, as_of):
    amounts = [amount for c, day, amount in orders if c == customer and day < as_of]
    return [len(amounts), sum(amounts)]

def fit(train_rows):
    return {
        'age': fit_numeric([r['age'] for r in train_rows]),
        'plans': fit_categories([r['plan'] for r in train_rows]),
    }

def transform(row, state, orders, as_of):
    return (
        transform_numeric(row['age'], state['age'])
        + one_hot(row['plan'], state['plans'])
        + signup_features(row['signup'], as_of)
        + orders_before(orders, row['customer'], as_of)
    )`,
          tests: `import copy
train_rows = [
    {'customer': 'c1', 'age': 20, 'plan': 'basic', 'signup': '2024-01-01'},
    {'customer': 'c2', 'age': None, 'plan': 'pro', 'signup': '2024-01-10'},
    {'customer': 'c3', 'age': 40, 'plan': 'basic', 'signup': '2024-02-01'},
]
orders = [('c9', '2024-03-05', 50.0), ('c9', '2024-03-20', 25.0), ('c9', '2024-04-02', 99.0), ('c3', '2024-03-01', 10.0)]
state = fit(train_rows)
assert state is not None, "fit returns nothing yet"
assert state['plans'] == ['basic', 'pro'], f"the plans seen in training are ['basic', 'pro'], got {state['plans']}"
assert state['age']['median'] == 30, f"the median training age is 30, got {state['age']['median']}"
saved = copy.deepcopy(state)
new = {'customer': 'c9', 'age': None, 'plan': 'enterprise', 'signup': '2024-03-01'}
out = transform(new, state, orders, '2024-03-31')
assert out is not None, "transform returns nothing yet"
assert len(out) == 8, f"the vector should have 8 numbers (2 + 2 + 2 + 2), got {len(out)}"
assert out[:2] == [0.0, 1], f"a missing age is filled with the median, which scales to 0.0, with flag 1; got {out[:2]}"
assert out[2:4] == [0, 0], f"'enterprise' was never seen in training: its one-hot is [0, 0]; got {out[2:4]}"
assert out[4:6] == [30, 0], f"signed up on Friday 1 March, 30 days before 31 March: [30, 0]; got {out[4:6]}"
assert out[6:] == [2, 75.0], f"two orders worth 75 before 31 March (the April one is in the future): [2, 75.0]; got {out[6:]}"
assert state == saved, "transform must not change the fitted state"
old = transform(train_rows[2], state, orders, '2024-03-31')
assert abs(old[0] - 1.2247449) < 1e-6 and old[1] == 0, f"age 40 with training mean 30 and std 8.165 scales to about 1.2247; got {old[:2]}"
assert old[2:4] == [1, 0] and old[6:] == [1, 10.0], "c3 is on the basic plan and has one earlier order worth 10"`,
          why: '`fit` touches only training rows and returns a small dict. `transform` takes one row, that dict, and a date, and survives a customer with no age and an unknown plan. Save the dict next to the model and training and serving run the same code.',
        },
        {
          kind: 'design',
          id: 'features-lab-8',
          ask: '**Step 8: before you trust it.** The pipeline works on the example. What checks and tests would you add before it feeds a model in production?',
          why: 'A preprocessing bug rarely raises an error: it produces plausible numbers that are wrong. Tests are the only way such bugs are found before the model\'s score is.',
          checklist: [
            { point: 'A test that fits on training rows, then changes a test row, and checks the fitted state is unchanged', why: 'It proves that no statistic depends on anything outside the training rows.' },
            { point: 'A test with a row that has every value missing and every category unseen', why: 'This is the row that breaks pipelines in production. It should give a valid vector of the usual length.' },
            { point: 'A look-ahead test: add an order dated after `as_of` and check the features do not move', why: 'It is the direct test of as-of correctness for every history feature.' },
            { point: 'A check that the vector has the same length and column order for every row', why: 'A column that moves is a silent error: the model reads the wrong number.' },
            { point: 'Save the fitted state with the model and load it at serving time, with no refitting', why: 'Refitting on live data gives features on a different scale from the one the model learned.' },
            { point: 'One shared `transform` for training and serving, not two implementations', why: 'Two versions drift apart, and the difference shows up only as a worse model.' },
            { point: 'Monitoring in production: the rate of missing values and of unseen categories per feature', why: 'A jump in either means the data has changed and the stored state is going stale.' },
          ],
        },
      ],
    },
  ],
}
