import type { Block } from '../../types'

/** The full theory for each lesson of the features module, keyed by lesson id. */
export const featuresTheory: Record<string, Block[]> = {
  'features-explore': [
    { h: 'Why you look before you model' },
    'A dataset for machine learning is usually a table. Each **row** is one example and each **column** one fact about it. One column is the **target**, the thing you want to predict, such as whether a customer leaves. The others are the **features**, the inputs the model learns from.',
    'Most models that fail in practice fail because of something visible in the table on the first day: numbers stored as text, missing values disguised as zeros, a target that is almost always the same. A model will not warn you. So the first hour with new data goes on looking, with no model at all.',

    { h: 'One row is one what' },
    'The first question is what a single row stands for: the **grain** of the table. Imagine a gym table with `visit_id`, `member_id`, `date`, `minutes`. One row could be one member, one visit, or one class booked during a visit. If you want one prediction per member ("will this member cancel?") and a row is one visit, you must first **aggregate**: combine all the rows of each member into one row, for example their number of visits and average minutes.',
    { sub: 'Counting distinct values' },
    'You find the grain by counting. Compare the number of rows with the number of **distinct** (different) values in each id column. Suppose the table has 9,000 rows, `member_id` has 700 distinct values and `visit_id` has 9,000. Every row has its own visit id, so one row is one visit. If `visit_id` had only 4,000 distinct values, a visit would span several rows.',
    'In Python, `set(values)` keeps one copy of each distinct value, so `len(set(values))` counts them. The same trick on whole rows counts exact duplicates.',
    {
      code: `visits = [
    ('m1', '2024-05-02', 45),
    ('m2', '2024-05-02', 30),
    ('m1', '2024-05-02', 45),
    ('m3', '2024-05-03', 60),
]
print(len(visits), len(set(visits)))`,
      out: '4 3',
    },
    'Four rows, three distinct ones: one row is an exact repeat, either a real second visit or a loading error. Ask whoever owns the data. Duplicates inflate counts, and later they can land on both sides of a train and test split, which makes the model look better than it is.',

    { h: 'The first-look checklist in pandas' },
    '**pandas** is the usual Python library for tables. A table is a **DataFrame**, by convention called `df`. The same handful of lines, in the same order, covers most of the first look:',
    {
      code: `df = pd.read_csv('visits.csv')
df.shape                          # (number of rows, number of columns)
df.dtypes                         # the type pandas gave each column
df.isna().mean()                  # share of missing values, per column
df.duplicated().sum()             # number of exact duplicate rows
df['member_id'].nunique()         # number of distinct members
df['cancelled'].value_counts(normalize=True)   # share of each target value
df.describe()                     # count, mean, std, min, max per number column`,
    },
    {
      list: [
        '`df.isna()` gives a table of True and False, True where a value is missing (`NaN`, "not a number", is how pandas marks a gap). True counts as 1 and False as 0, so `.mean()` gives the share missing. The default goes down each column (`axis=0`); `axis=1` averages across each row instead.',
        '`value_counts(normalize=True)` gives shares that add up to 1 instead of raw counts.',
        '`describe()` gives, for each number column, the **mean** (the average), the **std** (standard deviation, roughly how far values typically sit from the mean), and the min and max.',
      ],
    },

    { h: 'Types that lie' },
    'Each pandas column has a **dtype**, its data type: `int64` for whole numbers, `float64` for decimals, `object` for text. A column of fees that should be numbers but shows `object` contains at least one value pandas could not read as a number, such as `"2,500"` or `"waived"`. One such value turns the whole column into text. `pd.to_numeric(df["fee"], errors="coerce")` converts what it can and puts `NaN` where it fails, so you can list the failing rows and look at them before deciding anything. A value like "waived" is information. Dates read as text cannot be subtracted or sorted correctly until parsed as dates.',
    { sub: 'Numbers that are really labels' },
    'A column of whole numbers is not always a quantity. `gym_id` or a postcode are names written with digits. Gym 40 is not "twice" gym 20, so the mean of `gym_id` that `describe()` prints means nothing. Treat such a column as a **category** (a label from a fixed set), not as a number to scale or average.',

    { h: 'Missing and impossible values' },
    'A missing value does not always look missing. Systems often store a stand-in: `-1`, `0`, `999`, an empty string, or the text `"N/A"`. `isna()` counts none of these, and neither does a check like `x is None`. To find them, look at the most common values of each column and at its minimum and maximum.',
    {
      code: `minutes = [45, None, 30, 0, 999, 60, None, 50]
honest = [m for m in minutes if m is None]
suspect = [m for m in minutes if m is not None and not 1 <= m <= 300]
print(len(honest) / len(minutes), suspect)`,
      out: '0.25 [0, 999]',
    },
    '`1 <= m <= 300` is a **range check**: Python reads it as "m is at least 1 and at most 300". Two values are honestly missing, but 0 and 999 minutes are almost certainly stand-ins too, so the real share missing is closer to a half than a quarter. Be careful in the other direction as well: writing `if not m` treats 0 as missing, and for a column like "number of classes booked", 0 is a real answer.',
    { sub: 'Impossible values have causes' },
    'An age of 230, a negative price, a delivery before the order: these are **impossible values**, and each has a cause. Do not delete or cut them on sight; find the rows and ask why. A negative amount may be a refund, worth a column of its own. A huge round number may be a placeholder that should become a missing value. The cause decides the treatment.',

    { h: 'The target and the baseline' },
    'Look at the target before building anything. Suppose 50 of 2,000 members cancelled. A "model" that always predicts "stays" is right for 1,950 of 2,000, which is 1,950 / 2,000 = 0.975, or 97.5% **accuracy** (the share of predictions that are correct). This is the **baseline**: what doing nothing scores. In general it equals the share of the most common target value. Any real model must beat it, and when one value is this common, accuracy alone hides almost everything.',
    'Also ask how the target was recorded, and whether its rate changes over time. A rate that jumps every December tells you to test on later months, not a random sample.',

    { h: 'When each column becomes known' },
    'One last check for every column: would you know its value at the moment you make the prediction? A column such as "number of delivery attempts" is filled in after the outcome when predicting a late delivery. A model trained with it looks excellent and is useless in practice. A later lesson calls this leakage.',
  ],

  'features-missing': [
    { h: 'Why values go missing' },
    'A **missing value** is a cell with no value in it. In Python it is usually `None`; in NumPy and pandas it is `NaN` ("not a number"). Most models cannot take a gap, so you decide what goes there. That decision depends more on why the value is missing than on the fill formula.',
    { sub: 'Three kinds of reason' },
    {
      list: [
        '**By chance.** A sensor dropped a reading, a form failed to save. The gap says nothing about the row.',
        '**Because of another column.** Accounts opened before 2019 have no `promo_code` because the field did not exist yet. The gap tells you something about the account age.',
        '**Because of the value itself.** People with very high or very low weight are more likely to leave the weight box empty. The gap is a hint about the missing number.',
      ],
    },
    'In the second and third cases the **fact that the value is missing** is information. If, say, members who leave `weight` empty cancel twice as often, then "left it empty" is one of the most useful things the column tells you. Fill the gap with an ordinary number and that hint is gone: the row now looks like everyone else.',

    { h: 'Filling numbers with the median' },
    'Filling a gap with a chosen value is called **imputation**. For a number column the usual choice is the **median**: sort the known values and take the middle one. With an even count there are two middle values and the median is their average.',
    { sub: 'Mean or median' },
    'Take the known monthly spends 12, 15, 18, 20 and 435. The **mean** (add them up, divide by how many) is 500 / 5 = 100. The median is the middle value, 18. One big spender has dragged the mean to 100, a value that describes nobody. A column like this, with most values small and a few very large, has a **long tail**. Filling gaps with the mean would turn every missing row into a big spender. The median ignores how far out the extreme value sits.',
    {
      code: `import statistics

spend = [12, 15, 18, 20, 435]
print(statistics.mean(spend), statistics.median(spend))
print(statistics.median([12, 15, 18, 20]))`,
      out: `100 18
16.5`,
    },
    'With four values the two in the middle are 15 and 18, so the median is (15 + 18) / 2 = 16.5.',

    { h: 'Keeping the fact that it was missing' },
    'To keep the hint, add a **flag column** (also called an indicator): a new column that is 1 where the value was missing and 0 where it was present. The model then sees both the filled number and whether it was real.',
    { sub: 'Order matters' },
    'Make the flag from the original column, before you fill it. After filling, nothing is missing, so a flag computed from the filled column is all zeros.',
    {
      code: `weight = [70, None, 82, None, 64]
fill = 70
flag = [1 if w is None else 0 for w in weight]
filled = [fill if w is None else w for w in weight]
print(flag, filled)`,
      out: '[0, 1, 0, 1, 0] [70, 70, 82, 70, 64]',
    },
    'Only `None` counts as missing here. A value of 0 is a real value and must stay 0.',
    { sub: 'Categories and trees' },
    'For a **categorical** column (one holding labels, such as `payment_method`), filling gaps with the most common label quietly claims every unknown customer pays by card. Give the gaps a category of their own, such as `"missing"`, so the model can learn what "not recorded" means. Some models take gaps directly: scikit-learn\'s gradient-boosted trees, `HistGradientBoostingClassifier`, accept `NaN` and learn which way to send it, which is often the best option.',
    'Dropping rows with gaps is rarely right: it wastes data, and in production you cannot refuse to predict because one box is empty.',

    { h: 'Learn the fill value from training rows only' },
    'Data is split into a **training set**, which the model learns from, and a **test set**, kept aside to measure it on unseen rows. The median is learned from data, so it must come from the training rows only. Otherwise the test set has leaked into the features. In production rows arrive one at a time, and there is no "test median" at all.',
    'scikit-learn tools follow one pattern for this. `fit` learns the numbers from training data. `transform` applies them. `fit_transform` does both on the same data.',
    {
      code: `import numpy as np
from sklearn.impute import SimpleImputer

train = np.array([[5.0], [np.nan], [9.0], [40.0], [7.0]])
imp = SimpleImputer(strategy='median', add_indicator=True)
imp.fit(train)
print(imp.transform(np.array([[np.nan], [3.0]])).tolist())`,
      out: '[[8.0, 1.0], [3.0, 0.0]]',
    },
    'The known training values are 5, 7, 9 and 40, so the median is (7 + 9) / 2 = 8. `add_indicator=True` adds the flag as an extra column on the right.',

    { h: 'Outliers: errors and real extremes' },
    'An **outlier** is a value far from the rest. It is one of two things, and they need opposite treatment. An **error** (an age of 230, a weight of 9,999 kg) is not a real measurement: turn it into a missing value. A **real extreme** (one member who trains six hours a day) is true but can dominate models that work with sizes, such as linear models.',
    { sub: 'Clipping with percentiles' },
    'For real extremes, **clip** the column: any value below a lower limit is raised to it, any value above an upper limit is lowered to it. The limits are usually **percentiles**. The p-th percentile is the value below which p% of the data lies. With 21 sorted values, NumPy places the 5th percentile at position 0.05 × 20 = 1, which is the 2nd value, and the 95th at position 19, the 20th value. Take the limits from the training rows and reuse them.',
    {
      code: `import numpy as np

train = np.arange(0.0, 21.0)          # 0, 1, 2, ..., 20
low, high = np.percentile(train, [5, 95])
print(low, high)
print(np.clip(np.array([-4.0, 10.0, 75.0]), low, high).tolist())`,
      out: `1.0 19.0
[1.0, 10.0, 19.0]`,
    },
    'Another way to tame a long tail is to take the **logarithm**, which shrinks big values much more than small ones (the next lesson covers it). Tree models are little affected by outliers either way: they split on the order of the values, not their size.',
    { sub: 'When the outlier is the point' },
    'If the task is to find rare events, such as fraud, machine faults or unusual network traffic, the extreme values are often the signal. Clip them and a suspicious transfer looks like an ordinary one. Keep the raw column, and if a linear model needs a tamer version, add the clipped one as a second column.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Filling silently, with no flag, when missingness relates to the target.',
        'Using the mean on a long-tailed column.',
        'Computing fill values or clipping limits on the test set, or on all the data.',
        'Treating 0 as missing with a check like `if not x`.',
      ],
    },
  ],

  'features-scaling': [
    { h: 'Columns in different units' },
    'A table of house sales might hold `area` in square metres (40 to 300), `age` in years (0 to 120) and `price` in pounds (80,000 to 2,000,000). The numbers live on wildly different scales. Some models treat a difference of 1 the same whatever column it is in, so the column with the biggest numbers drowns out the others. **Scaling** puts the columns on a common footing.',

    { h: 'Standardising' },
    '**Standardising** a column means: subtract its mean, then divide by its standard deviation. Written as a formula, `z = (x − mean) / std`, where x is the original value and z the new one. Afterwards the column has mean 0 and standard deviation 1, and a value of 2 means "two standard deviations above average", whatever the original unit was. This is the usual default.',
    { sub: 'Standard deviation by hand' },
    'The **standard deviation** measures how spread out the values are. Take the training values 4, 8, 12 and 16.',
    {
      list: [
        'Mean: (4 + 8 + 12 + 16) / 4 = 10.',
        'Distance of each value from the mean: −6, −2, 2, 6.',
        'Square them: 36, 4, 4, 36. Their mean is 80 / 4 = 20. This is the **variance**.',
        'Take the square root: √20 ≈ 4.47. That is the standard deviation.',
      ],
    },
    'A new value of 20 becomes (20 − 10) / 4.47 ≈ 2.24. NumPy and scikit-learn divide by the count (4 here) when they compute this, as above.',
    {
      code: `import numpy as np
from sklearn.preprocessing import StandardScaler

train = np.array([[4.0], [8.0], [12.0], [16.0]])
scaler = StandardScaler().fit(train)
print(scaler.mean_[0], round(float(scaler.scale_[0]), 2))
print(round(float(scaler.transform([[20.0]])[0, 0]), 2))`,
      out: `10.0 4.47
2.24`,
    },
    '`scaler.mean_` and `scaler.scale_` hold the mean and standard deviation learned by `fit`. As in the previous lesson, they come from the training rows only, and the same numbers are reused for the test rows and for every new row in production. Never centre the test set on its own mean: if new houses are bigger on average, that shift is real information, and recentring erases it.',
    'A column that is constant in the training rows has standard deviation 0, and dividing by 0 gives `nan` or `inf`. A common guard is to divide such a column by 1 instead, which leaves it at 0 everywhere after the mean is removed. `np.where(std == 0, 1.0, std)` does that.',

    { h: 'Min-max scaling' },
    '**Min-max scaling** maps the training minimum to 0 and the training maximum to 1: `(x − min) / (max − min)`. It suits inputs with hard natural limits, such as pixel brightness from 0 to 255. If training ages run from 20 to 60, a new age of 70 becomes (70 − 20) / (60 − 20) = 1.25. A value above 1 on new data is correct behaviour. The 0 to 1 range is only promised for the data the scaler was fitted on.',
    'Min-max is fragile. One extreme value sets the top of the range for everyone. If house prices are mostly under £500,000 and one sold for £20,000,000, the ordinary houses all land between 0 and about 0.025. A scaler built on the median and the quartiles, scikit-learn\'s `RobustScaler`, is less affected by such a value.',

    { h: 'Which models care' },
    { sub: 'Models that need scaling' },
    {
      list: [
        '**Models trained by gradient descent**, such as logistic regression and neural networks. Training adjusts the weights in many small steps, and badly mismatched scales make those steps slow and unstable.',
        '**Models with a penalty on the weights**, such as ridge and lasso regression. The penalty pushes all weights towards 0 equally, which only makes sense if the columns are comparable.',
        '**Models built on distances**, such as k-nearest neighbours, k-means clustering, support vector machines and PCA.',
      ],
    },
    'The distance between two rows is usually the **Euclidean distance**: square the difference in each column, add them up, take the square root. Compare two houses that differ by 100 m² in area and by £5,000 in price. Unscaled, the distance is √(100² + 5,000²) ≈ 5,001. The price gap decides almost everything and area barely counts.',
    { sub: 'Models that do not' },
    '**Decision trees**, random forests and gradient-boosted trees ask one kind of question: is this value above a threshold? Multiply a column by 1,000 and the threshold moves with it, so every split, and every prediction, stays the same. Any change that keeps the order of the values leaves a tree unchanged.',

    { h: 'Long tails and the logarithm' },
    'Scaling changes the units on the axis and nothing else. A histogram (a bar chart of how many values fall in each range) of a standardised column has exactly the same shape as before. A **long-tailed** or **skewed** column, where most values are small and a few are huge, stays skewed. "Mean 0 and std 1" does not mean bell-shaped. In a skewed column the mean is pulled towards the tail, well away from the median.',
    'The fix is the **logarithm**. log10(x) asks "10 to what power gives x?": log10(1,000) = 3. It turns "ten times bigger" into "1 bigger", which pulls in the tail and leaves a much more even shape. log(0) is minus infinity, which breaks a model, so use `np.log1p(x)`, which computes log(1 + x) and gives 0 at 0. Log first, then standardise.',
    {
      code: `import numpy as np

visits = np.array([0, 99, 999, 99999])
print(np.log10(visits + 1))
print(np.log1p(0.0))`,
      out: `[0. 2. 3. 5.]
0.0`,
    },
    '`np.log1p` uses the natural logarithm (base e ≈ 2.718) rather than base 10. The base changes the numbers by a constant factor, not the shape.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Fitting the scaler on all the data, or refitting it on the test set.',
        'Expecting standardising to fix a long tail. Only a transform like the log changes the shape.',
        'Using `np.log` on a column with zeros.',
        'Min-max scaling a column with one huge value.',
        'Scaling for a tree model and expecting it to help. It does no harm, but changes nothing.',
      ],
    },
  ],

  'features-categorical': [
    { h: 'Turning labels into numbers' },
    'A **categorical** column holds labels from a fixed set: `colour` is red, green or blue; `country` is one of about 200 names. Models do arithmetic, so labels must become numbers first. This is called **encoding**. The way you encode decides what the model is allowed to believe about the categories, and a careless choice tells it things that are false.',
    { sub: 'Why plain integer codes mislead' },
    'The obvious move is to number the categories: red = 0, green = 1, blue = 2. A linear model has one weight for the column and multiplies it by the code, so it now believes blue is "twice" green and that the effect grows steadily from red to blue. The codes were arbitrary, so whatever pattern it fits is noise. Distance-based models are fooled the same way. Trees suffer less, because they can cut the range into pieces, but they waste splits on an order that does not exist.',

    { h: 'One-hot encoding' },
    '**One-hot** encoding makes one 0/1 column per category. A row has a 1 in the column of its own category and 0 everywhere else. Red becomes `[1, 0, 0]` if the columns are blue, green, red. It claims nothing about how categories relate, which makes it the safe default for a handful of categories with no order.',
    {
      code: `from sklearn.preprocessing import OneHotEncoder

enc = OneHotEncoder(handle_unknown='ignore', sparse_output=False)
enc.fit([['red'], ['green'], ['blue']])
print(enc.categories_[0].tolist())
print(enc.transform([['red'], ['pink']]).tolist())`,
      out: `['blue', 'green', 'red']
[[0.0, 0.0, 1.0], [0.0, 0.0, 0.0]]`,
    },
    'scikit-learn sorts the categories alphabetically to choose the column order. The input is a list of rows, each a list with one value. `sparse_output=False` asks for an ordinary array rather than a compressed one. `pink` was never seen during `fit`. With `handle_unknown=\'ignore\'` it becomes all zeros; with the default setting, `transform` raises an error.',
    'Written by hand, one-hot is one line: for each value, `[1 if v == c else 0 for c in categories]`, where `categories` is the list learned from training. Keeping that list fixed is what keeps the columns the same in training and in production.',

    { h: 'Ordered categories' },
    'Some categories do have an order: small < medium < large, or one to five stars. Then an **ordinal** encoding is right: 0, 1, 2 in the true order. Give the order yourself. Left to its default, `OrdinalEncoder` sorts the labels as text, the same way one-hot sorts its columns.',
    {
      code: `from sklearn.preprocessing import OrdinalEncoder

rows = [['low'], ['high'], ['medium']]
print(OrdinalEncoder().fit_transform(rows).ravel().tolist())
enc = OrdinalEncoder(categories=[['low', 'medium', 'high']])
print(enc.fit_transform(rows).ravel().tolist())`,
      out: `[1.0, 0.0, 2.0]
[0.0, 2.0, 1.0]`,
    },
    'Sorted as text, "high" comes before "low", so high gets 0. With the order stated, low is 0, medium 1, high 2. `.ravel()` flattens the one-column result into a flat list.',

    { h: 'Many categories' },
    'A column with thousands of distinct values, such as a postcode or a product id, is called **high-cardinality** (cardinality is the number of distinct values). One-hot would add thousands of columns, and most categories have only a handful of rows, too few to learn anything from. The model ends up memorising noise. One fix is to group rare categories into one called `other`; `OneHotEncoder(min_frequency=20)` does this for categories seen fewer than 20 times. Three other encodings give one column, or a fixed number of columns.',
    { sub: 'Frequency encoding' },
    'Replace each category with the share of training rows that have it. If 40 of 160 training rows are from Bristol, Bristol becomes 40 / 160 = 0.25. A category never seen in training gets 0. It is cheap and useful when popularity matters, but two categories that are equally common get the same number however differently they behave.',
    { sub: 'Hashing' },
    'A **hash function** turns any string into a number. Taking that number modulo the number of buckets sends each category to one of, say, 1,024 buckets. There is no vocabulary to store, and a category never seen before still lands somewhere. The price is **collisions**: unrelated categories share a bucket, and the model sees their mixture. More buckets mean fewer collisions and more columns.',
    { sub: 'Target encoding' },
    'Replace each category with the average target of its training rows. If the target is "bought" (1) or "did not" (0), and Bristol customers bought 30% of the time, Bristol becomes 0.3. This is often the most informative of the three, and the easiest to get wrong.',

    { h: 'Making target encoding safe' },
    'Computed naively, each training row\'s encoding includes its own label. For a category seen once, the encoding is the label itself. The model learns to trust the column completely, scores superbly in training and fails on new data. This is **leakage**: the answer has slipped into a feature.',
    {
      list: [
        '**Out-of-fold.** Split the training rows into, say, 5 parts called **folds**. Encode the rows of each fold using only the other 4 folds. No row ever sees its own label. A category that appears in no other fold falls back to the overall average.',
        '**Smoothing.** Pull rare categories towards the overall average: `(sum of targets + m × overall mean) / (count + m)`. Here m says how many rows of evidence it takes to move away from the overall mean.',
      ],
    },
    'A worked example: a category has 3 training rows, 2 of them bought, so its raw rate is 2 / 3 ≈ 0.67. The overall rate is 0.1 and m = 7. Smoothed: (2 + 7 × 0.1) / (3 + 7) = 2.7 / 10 = 0.27. Three rows are weak evidence, so the value stays near 0.1. With 300 rows and 200 buys it would be (200 + 0.7) / 307 ≈ 0.65, close to the raw rate. scikit-learn\'s `TargetEncoder` does both steps.',
    'The averages must come from training rows only. In pandas that is `train.groupby(\'city\')[\'bought\'].mean()`: group the training rows by city and average the target in each group. Use `df` (all the data) there and the test labels end up inside the test features.',

    { h: 'Categories nobody has seen' },
    'Production will send categories training never saw: a new city, a product launched last week. Decide in advance what they become. One-hot: all zeros. Frequency: 0. Target encoding: the overall mean. An encoder that raises an error on an unseen value takes the service down on its first new customer.',

  ],

  'features-leakage': [
    { h: 'What leakage is' },
    '**Leakage** means the model was trained or scored using information it will not have when it is really used. The result is always the same: a wonderful score on your test data and a poor one in **production** (the live system where the model makes real predictions). Nothing crashes and no error appears, which is why it is so costly. The only symptom is a score that looks too good.',
    'There are three common routes for it: a feature that gives away the answer, a preprocessing step that learns from the test rows, and the same rows or people on both sides of the split.',

    { h: 'Target leakage' },
    '**Target leakage** is a feature that is a consequence of the target, or is only recorded after the target is known. Suppose a hospital wants to predict, on admission, whether a patient will need intensive care. A column `icu_bed_number` is filled in only for patients who went to intensive care. It predicts the target almost perfectly in the historical table, and it will be empty for every patient at the moment of admission.',
    { sub: 'One question for every column' },
    'Ask of each feature: **at the moment the prediction is made, would this value exist?** Values recorded later, final statuses, reasons for an outcome and anything counted "over the whole period" fail the test. A single feature that is almost perfectly predictive on its own should be treated as a suspect until you know when it is written.',

    { h: 'Learning from the test rows' },
    'Recall from earlier lessons: the training set is what the model learns from, and the test set is kept aside to measure it. Many preprocessing steps also learn numbers from data: an imputer learns a median, a scaler learns a mean and standard deviation, a target encoder learns averages per category, and **feature selection** (keeping only the columns most related to the target) learns which columns to keep. If any of these is fitted before the split, or on all the rows, the test rows have shaped the features they are then scored on. This is **train/test contamination**.',
    {
      code: `import numpy as np

train = np.array([2.0, 4.0, 6.0])
test = np.array([20.0])
print(train.mean(), np.concatenate([train, test]).mean())`,
      out: '4.0 8.0',
    },
    '`np.concatenate` joins two arrays into one. One test row has moved the mean from 4 to 8. On a big table a scaler shifts only a little, but a target encoding or a feature selection fitted on all rows can turn noise into an impressive score.',
    { sub: 'An example on pure noise' },
    'Below, the 3,000 columns are random numbers and the labels are coin flips, so no honest model can beat 50%. **Cross-validation** (`cross_val_score` with `cv=5`) splits the rows into 5 parts called folds, trains on 4, scores on the fifth, repeats for each fold and averages the scores. `SelectKBest(f_classif, k=10)` keeps the 10 columns that look most related to the labels.',
    {
      code: `import numpy as np
from sklearn.feature_selection import SelectKBest, f_classif
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score

rng = np.random.default_rng(1)
X, y = rng.normal(size=(80, 3000)), rng.integers(0, 2, size=80)
X_best = SelectKBest(f_classif, k=10).fit_transform(X, y)
print(round(cross_val_score(LogisticRegression(), X_best, y, cv=5).mean(), 2))`,
      out: '0.85',
    },
    'Among 3,000 random columns, some line up with the labels by chance. They were chosen using every label, including those of the rows later used for scoring, so the scoring rows helped pick the features.',
    { sub: 'Steps that learn nothing' },
    'A step that uses only the row itself, such as taking `log1p` of a value or reading the weekday from a date, learns nothing from other rows. It is safe before the split.',

    { h: 'Pipelines' },
    'A **Pipeline** bundles the preprocessing steps and the model into one object. Calling `fit` fits every step, in order, on the rows you pass. Calling `predict` or `score` only applies them. `make_pipeline` builds one and names each step after its class in lower case.',
    {
      code: `import numpy as np
from sklearn.feature_selection import SelectKBest, f_classif
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline

rng = np.random.default_rng(1)
X, y = rng.normal(size=(80, 3000)), rng.integers(0, 2, size=80)
pipe = make_pipeline(SelectKBest(f_classif, k=10), LogisticRegression())
print(round(cross_val_score(pipe, X, y, cv=5).mean(), 2))`,
      out: '0.46',
    },
    'The same noise now scores about 50%, the honest answer. Handed a pipeline, `cross_val_score` refits every step, the selection included, on the training part of each fold. `GridSearchCV`, which tries several settings of a model and keeps the best by cross-validation, does the same. Its settings are named `stepname__setting`, for example `logisticregression__C`. The pipeline is also what you save and deploy, so training and serving apply identical steps.',
    'A pipeline does not stop you passing it the wrong rows. `pipe.fit(X, y)` on the full table, followed by a score on the test rows, leaks in the same way. Split first, then fit on the training part only.',

    { h: 'Duplicates and groups across the split' },
    'If the same row lands in both training and test, the model is partly tested on rows it has memorised. Remove exact duplicates before splitting (pandas: `df.drop_duplicates()`), not after.',
    { sub: 'Splitting by group' },
    'Often rows come in groups: many orders per customer, many scans per patient. If a customer\'s orders sit on both sides, the model can recognise the customer instead of predicting. Split so each group is entirely on one side. `GroupKFold` does this for cross-validation, given a `groups` column such as `customer_id`. Plain `KFold` ignores `groups`. A quick check after any split uses Python sets, where `&` keeps what two sets share:',
    {
      code: `train = [('p1', 7), ('p2', 3), ('p3', 5)]
test = [('p4', 2), ('p3', 9)]
print(set(train) & set(test))
print({p for p, _ in train} & {p for p, _ in test})`,
      out: `set()
{'p3'}`,
    },
    'No row is shared, but patient p3 appears on both sides. `{p for p, _ in train}` is a set comprehension that keeps the first item of each pair.',

    { h: 'Finding leakage after the fact' },
    'A churn model scores 0.98 on an offline measure (for example **AUC**, a score from 0.5 for guessing to 1 for perfect ranking) and 0.6 in production. That gap is almost always leakage. Check, roughly in order of cost:',
    {
      list: [
        'Which one or two features carry nearly all the importance, and when are they written?',
        'Does each feature in the training table match what production actually sends?',
        'Was every learned step fitted on training rows only?',
        'Are the same customers or duplicated rows on both sides of the split?',
        'Does the score drop when you train on earlier months and test on later ones?',
      ],
    },
    'Remove the suspects and retrain. A lower offline score that matches production is the honest one.',
  ],

  'features-time': [
    { h: 'Taking a timestamp apart' },
    'A **timestamp** such as `2024-07-14 21:30` is a single point in time. As one raw number it is almost useless to a model: it only grows. The useful information is in its parts and in the gaps between timestamps.',
    {
      list: [
        '**Calendar parts**: hour, day of the week, month, a weekend flag, a holiday flag.',
        '**Durations**, "time since" something: days since signup, days since the last order. These are often the strongest.',
      ],
    },
    {
      code: `from datetime import date

d = date(2024, 7, 14)
print(d.weekday(), d.month, d.weekday() >= 5)
print((d - date(2024, 6, 30)).days)`,
      out: `6 7 True
14`,
    },
    '`weekday()` counts from Monday = 0, so Sunday is 6, and `weekday() >= 5` is the weekend flag. Subtracting two dates gives a gap whose `.days` is the number of days between them. A duration measured back from the prediction date uses two values that are both known at that moment, so it is safe.',

    { h: 'Hours and months go round in a circle' },
    'Hour 23 is one hour from hour 0, but as numbers they are 23 apart. A linear model has one weight per column, so with `hour` as a plain number it can only say "later in the day means more" or "later means less". If something peaks around midnight, the peak straddles the break in the numbering and the model cannot fit it.',
    { sub: 'Sine and cosine' },
    '**Cyclical encoding** places the hour on a circle, like the hand of a 24-hour clock. The angle of the hand is `2π × h / 24`, where π ≈ 3.14 and 2π is one full turn. **sin** and **cos** of an angle are the up-down and left-right positions of the hand\'s tip on a circle of radius 1. Hour 0 points straight up: sin 0, cos 1. Hour 6 is a quarter turn: sin 1, cos 0. Hour 18 is three quarters: sin −1, cos 0.',
    'Two columns are needed. With sin alone, 04:00 and 08:00 get the same value. Together, every hour is a distinct point on the circle, and hours that are close in time are close as points.',
    {
      code: `import math

def clock(h):
    a = 2 * math.pi * h / 24
    return math.sin(a), math.cos(a)

print(round(math.dist(clock(22), clock(2)), 2), round(math.dist(clock(2), clock(6)), 2))`,
      out: '1.0 1.0',
    },
    '`math.dist` is the straight-line distance between two points. 22:00 to 02:00 is now exactly as far as 02:00 to 06:00, four hours each. The same works for months with 12 in place of 24. Neural networks and linear models need this. Trees manage with the plain number, by making two cuts.',

    { h: 'Lags and rolling windows' },
    'When the rows form a series in time (daily sales, hourly traffic), the best predictors are usually the past values of the series itself.',
    { sub: 'Lags' },
    'A **lag** is the value some steps back: lag 7 of daily sales is the sales of the same weekday last week. Building one moves every value later. The first rows have no earlier value and are missing.',
    {
      code: `visits = [4, 7, 5, 9, 6, 8]
lag_2 = [None, None] + visits[:-2]
print(lag_2)`,
      out: '[None, None, 4, 7, 5, 9]',
    },
    '`visits[:-2]` is every value except the last two. Each position now holds the value from two days before.',
    { sub: 'Rolling windows' },
    'A **rolling window** summarises a stretch of the past, for example the mean of the previous 3 days. For position i that is the mean of `values[i - 3:i]`. The slice ends at position i − 1, so today is not included. A quick test for look-ahead: change today\'s value. If today\'s feature changes, it contains the answer.',
    'In pandas, with one row per store per day, sorted by store and date:',
    {
      code: `df = df.sort_values(['store', 'date'])
sales = df.groupby('store')['sales']
df['lag_7'] = sales.shift(7)
df['mean_3'] = sales.transform(lambda s: s.shift(1).rolling(3).mean())`,
    },
    '`groupby(\'store\')` makes each store its own series. `shift(k)` moves values k rows later. `rolling(3).mean()` is the mean of the current row and the 2 before it, so it includes today. Shifting by 1 first makes the window cover the 3 days before today. `transform` applies the function to each store and puts the results back on the original rows. `df[\'date\'].dt.dayofweek` gives the weekday of a pandas date column.',

    { h: 'As-of correctness' },
    'All of this follows one rule, **as-of correctness**: a feature for a prediction made at time t may use only what was known at time t.',
    { sub: 'The forecast horizon' },
    'If the forecast is made k days ahead, the newest value you can use is k days old. Forecasting Friday\'s sales on Tuesday, three days ahead, means lags of 1 and 2 refer to Thursday and Wednesday, which have not happened yet. The **horizon** (how far ahead you predict) sets the smallest honest lag.',
    { sub: 'Aggregates over a history' },
    'An **aggregate** summarises an entity\'s history: a customer\'s number of orders, average basket, total spend. Computed once over the whole table and joined to every row, it includes events after the row, and even the row\'s own outcome. Compute it from events strictly before each row\'s time instead.',
    {
      code: `events = [('kim', 2, 15), ('lee', 3, 40), ('kim', 4, 25), ('kim', 8, 5)]

def spend_before(person, day):
    return sum(amt for p, d, amt in events if p == person and d < day)

print(spend_before('kim', 2), spend_before('kim', 5), spend_before('kim', 9))`,
      out: '0 40 45',
    },
    'The same customer has a different value at different times, as she should. The `d < day` excludes the event on the day itself.',

    { h: 'Splitting by time' },
    'A random split mixes the days: the model trains on Monday and Wednesday and is tested on Tuesday, with lag features reaching into the training days around it. That is far easier than the real task of predicting next week. Split by date instead: train on the earlier period, test on the later one. With a table sorted by date, `train_test_split(df, test_size=0.2, shuffle=False)` keeps the last 20% of rows for testing.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Hours or months as plain integers in a linear model.',
        'Using sin without cos.',
        'A rolling window that includes the current row: roll without shifting first.',
        'Lags shorter than the forecast horizon.',
        'Customer totals computed over the whole table.',
        'Shuffled splits on data ordered in time.',
      ],
    },
  ],

  'features-text': [
    { h: 'Text has to become numbers' },
    'Reviews, support tickets and emails are text, and a model needs a fixed-length row of numbers for each one. Each piece of text is called a **document**, and the whole set of documents is the **corpus**. There are two main roads: count the words, or use a **pretrained model** (one already trained by someone else on a huge amount of text) to turn each document into a vector of numbers that captures its meaning.',

    { h: 'Bag of words' },
    'A **bag of words** makes one column for each distinct word in the training documents. That list of words is the **vocabulary**. The value in a cell is how many times the word occurs in that document. Word order is thrown away: the document becomes a bag of words shaken together.',
    {
      code: `from sklearn.feature_extraction.text import CountVectorizer

docs = ['parcel arrived late', 'late again and late again']
vec = CountVectorizer()
X = vec.fit_transform(docs)
print(vec.get_feature_names_out().tolist())
print(X.toarray().tolist())`,
      out: `['again', 'and', 'arrived', 'late', 'parcel']
[[0, 0, 1, 1, 1], [2, 1, 0, 2, 0]]`,
    },
    '`CountVectorizer` lower-cases the text, splits it into words, and sorts the vocabulary alphabetically. By default it ignores one-letter words such as "a". `fit_transform` learns the vocabulary and counts in one step. The result is stored in a compressed form, since most cells are 0; `.toarray()` turns it into an ordinary array. `vec.vocabulary_` is a dictionary from each word to its column number.',
    { sub: 'Words the vocabulary has never seen' },
    'The vocabulary is learned from the training documents, and new text is counted against it with `transform`. A word that is not in the vocabulary has no column, so it is dropped, with no error or warning.',
    {
      code: `print(vec.transform(['my parcel is late']).toarray().tolist())`,
    },
    'Run after the code above, this prints `[[0, 0, 0, 1, 1]]`: "parcel" and "late" are counted, while "my" and "is" vanish. If production text is full of words training never had, the model sees almost nothing. Never call `fit_transform` on the test texts: that builds a new vocabulary, so column 3 means one word in training and another in test.',

    { h: 'TF-IDF' },
    'Raw counts treat every word alike, but a word in nearly every document ("the", or "parcel" in a delivery company\'s inbox) tells documents apart hardly at all. **TF-IDF** fixes this. **TF**, term frequency, is the count. **IDF**, inverse document frequency, is a weight per word: high for words in few documents, low for words in many. The value is TF × IDF.',
    { sub: 'The IDF formula' },
    'The basic form is `idf = ln(N / df)`, where N is the number of documents, **df** (document frequency) is how many of them contain the word, and **ln** is the natural logarithm (the log with base e ≈ 2.718). With 50 documents: a word in 5 of them gets ln(50 / 5) = ln(10) ≈ 2.3; a word in all 50 gets ln(1) = 0. scikit-learn uses a smoothed version, `ln((1 + N) / (1 + df)) + 1`, so no word gets exactly 0, but the order is the same.',
    {
      code: `from sklearn.feature_extraction.text import TfidfVectorizer

docs = ['the refund', 'the parcel', 'the parcel', 'the parcel']
vec = TfidfVectorizer().fit(docs)
print({w: round(float(i), 2) for w, i in zip(vec.get_feature_names_out(), vec.idf_)})`,
      out: `{'parcel': 1.22, 'refund': 1.92, 'the': 1.0}`,
    },
    '`vec.idf_` holds the learned weights. "the" is in every document and gets the lowest weight; "refund" is in one and gets the highest. The weights are learned from data, like a scaler\'s mean, so the vectoriser must be fitted on training texts only. Putting it first in a pipeline does that for you.',

    { h: 'N-grams and pruning the vocabulary' },
    'With single words, "not good" is the positive word "good" plus a weak "not", and a review saying "not good" can score as positive. An **n-gram** is a run of n adjacent words: pairs are **bigrams**, triples **trigrams**. `ngram_range=(1, 2)` counts single words and bigrams, so "not good" gets a column of its own and the model can learn that it is negative.',
    {
      code: `from sklearn.feature_extraction.text import CountVectorizer

vec = CountVectorizer(ngram_range=(1, 2)).fit(['not very good'])
print(sorted(vec.vocabulary_))`,
      out: `['good', 'not', 'not very', 'very', 'very good']`,
    },
    'Three words give three single words plus two pairs. On real text, bigrams multiply the vocabulary many times over. `min_df=5` drops every term found in fewer than 5 training documents: typos and one-offs that the model could only use to memorise particular documents. It shrinks the vocabulary a great deal and rarely costs accuracy.',
    { sub: 'A warning about stop words' },
    '**Stop words** are very common words ("the", "is", "and") that some setups remove. Many stop-word lists include "not" and "no". Removing them destroys exactly the information that bigrams were meant to keep.',

    { h: 'Pretrained embeddings' },
    'An **embedding model** maps each whole text to a dense vector of a few hundred numbers. "Dense" means nearly every entry is non-zero, unlike a bag of words, which is mostly zeros. It was trained so that texts with similar meaning get vectors pointing in similar directions; recall from the maths module that **cosine similarity** measures this, 1 for the same direction. "The courier never showed up" and "my delivery did not arrive" share no important words, yet their vectors land close together. You then train a small model, such as a logistic regression, on the vectors.',
    'Multilingual embedding models place the same meaning close together across languages, so a complaint in Spanish lands near the same complaint in English.',

    { h: 'Choosing between them' },
    { sub: 'TF-IDF is better when' },
    {
      list: [
        'You have thousands of labelled examples, enough to see each common wording.',
        'Exact tokens matter: product codes, error codes, names. A rare exact token gets a high IDF weight, while an embedding model may see two different codes as almost the same.',
        'You need speed, low cost and a model you can inspect word by word.',
      ],
    },
    { sub: 'Embeddings are better when' },
    {
      list: [
        'Labelled data is scarce, a few hundred examples.',
        'The same thing is said in many ways, or in several languages.',
        'Meaning matters more than exact wording.',
      ],
    },
    'Build the TF-IDF plus linear model baseline first. It takes minutes and gives the number embeddings must beat. Compare on the same honest split (for tickets, the most recent ones as the test set), look at results per class, and weigh any gain against the cost and delay of calling an embedding model for every document. The two can also be combined, side by side as columns, since they fail in different ways.',
  ],

  'features-selection': [
    { h: 'Features built from other features' },
    'Some of the best features are new columns made from columns you already have. **Feature engineering** is this work of turning raw columns into inputs that express how the problem really works.',
    { sub: 'Ratios and differences' },
    'A **ratio** divides one column by another: price per square metre, debt divided by income, goals per match. A **difference** subtracts: this month\'s spend minus last month\'s, days between order and dispatch. When the thing that matters is relative, hand it over directly.',
    'A linear model cannot build a ratio from its parts: it can only add weighted columns. A tree can only approximate one. Each split in a tree looks at one column and one threshold, so it cuts the data with straight lines parallel to an axis. "Debt is a third of income" is a diagonal line, which takes a staircase of many splits, and much data, to follow. One split on the ratio column does the same job.',

    { h: 'Crossing categories' },
    'A **cross** joins two categorical columns into one whose values are the combinations: `plan` (basic, pro) and `region` (north, south) become `basic_north`, `pro_south` and so on.',
    {
      code: `rows = [('basic', 'north'), ('pro', 'south'), ('pro', 'north'), ('pro', 'south')]
crossed = [plan + '_' + region for plan, region in rows]
print(crossed, len(set(crossed)))`,
      out: `['basic_north', 'pro_south', 'pro_north', 'pro_south'] 3`,
    },
    'The cross is then encoded like any other category. Why bother: with separate one-hot columns, a linear model learns one adjustment for "pro" and one for "south" and adds them. It cannot say "pro sells well in the south but badly in the north". The cross gives each combination its own weight.',
    'Crosses multiply. Crossing a column of 30 values with one of 12 can make up to 30 × 12 = 360 categories, each with far fewer rows than either column alone. Cross where you have a reason, or use a coarser version of a column (four parts of the day rather than 24 hours).',

    { h: 'Removing what cannot help' },
    'Some columns can be dropped for free: fewer features train faster, break less often in production, and are easier to explain.',
    {
      list: [
        '**Constant columns**: the same value in every row. They cannot separate one row from another.',
        '**Duplicate columns**: an exact copy of another column.',
        '**Row ids**: unique per row, so they carry no pattern that repeats.',
        '**Near duplicates**: the same quantity in two units, such as metres and feet. Keep one.',
      ],
    },
    {
      code: `import numpy as np

X = np.array([[4, 0, 8], [6, 0, 12], [5, 0, 10]])
print([j for j in range(3) if X[:, j].std() == 0])
print(X[:, 2] / X[:, 0])`,
      out: `[1]
[2. 2. 2.]`,
    },
    '`X[:, j]` is column j. A standard deviation of 0 means every value is the same, so column 1 is constant. Column 2 is always twice column 0: the same information in different units. To test whether two columns are exact copies, `(X[:, a] == X[:, b]).all()` is True when every entry matches.',

    { h: 'Measuring importance' },
    'To decide what to keep, you need a measure of how much the model relies on each feature: its **importance**.',
    { sub: 'Built-in importance of trees' },
    'Tree models report an importance for each column, based on how much its splits cleaned up the training data. It is free, but it is measured on the training data, and it favours columns with many distinct values. A column with a unique value per row, such as an id, offers endless ways to split the training rows, and deep trees use them to memorise. Such a column can rank high while being worthless on new data.',
    { sub: 'Permutation importance' },
    'The honest alternative uses **held-out data**: rows the model was not trained on, such as a **validation set** (a slice of the training data kept aside for making choices). Score the model on it. Then shuffle one column, so its values are scrambled across rows and no longer match their rows, and score again. The drop in score is that column\'s **permutation importance**. Nothing is retrained, so it works with any model. Shuffling is random, so repeat it several times and average.',
    {
      code: `import numpy as np

X = np.array([[1.0, 0], [2, 1], [3, 0], [4, 1], [5, 0], [6, 1]])
y = np.array([0, 0, 0, 1, 1, 1])
predict = lambda A: (A[:, 0] > 3).astype(int)   # uses column 0 only
rng = np.random.default_rng(3)
drops = []
for _ in range(5):
    S = X.copy()
    S[:, 0] = rng.permutation(S[:, 0])
    drops.append((predict(X) == y).mean() - (predict(S) == y).mean())
print(round(float(np.mean(drops)), 2))`,
      out: '0.53',
    },
    'Accuracy before is 1.0, and scrambling column 0 costs on average 0.53. Shuffling column 1, which this model ignores, would cost exactly 0. `X.copy()` matters: shuffling `X` itself would leave the column scrambled for every measurement after. In scikit-learn, `permutation_importance(model, X_val, y_val, n_repeats=10, random_state=0)` does this, and `.importances_mean` holds the average drop per column. Pass validation rows, not training rows: on training data, a feature the model has memorised looks valuable.',

    { h: 'Two traps when selecting' },
    { sub: 'Correlated features share importance' },
    'If two features carry the same information, shuffling one costs little, because the model still has the other. Both can look unimportant while removing both ruins the model. Shuffle such a group together, or keep one from each group of near-identical columns before ranking.',
    { sub: 'Selecting on the test set' },
    'Choosing features is part of training. If you try many sets and keep the one with the best test score, part of that score is luck, and the luck is now baked into the number you report. Make every choice on validation data or inside cross-validation, remove features in batches and re-check the validation score after each batch, and score the final set on the test set once. Also weigh each feature\'s gain against the cost of producing it in production.',
  ],

  'features-lab': [
    { h: 'What the lab builds' },
    'Every lesson in this module has come back to one rule: numbers learned from data are learned from the training rows only, and then reused. This lab builds, in plain Python, the piece of code that turns one raw customer record into a **feature vector**: the fixed-length list of numbers a model takes as input. In scikit-learn the same job is done by a `Pipeline`, with a `ColumnTransformer` that sends each column to its own preprocessing step. Writing it by hand shows what those objects store and why they cannot leak.',

    { h: 'Fit and transform' },
    'The whole design rests on splitting each step into two functions.',
    {
      list: [
        '**fit** looks at the training rows, learns some numbers, and returns them. Those numbers are the **state**, usually a small dictionary.',
        '**transform** takes one row and the state, and returns numbers for that row. It learns nothing and changes nothing.',
      ],
    },
    'Because transform needs only one row and the stored state, it works the same on a test row, on a row from last year, and on a single request arriving in production. Here is the pattern for a min-max scaler (the training minimum maps to 0 and the maximum to 1):',
    {
      code: `def fit_minmax(values):
    known = [v for v in values if v is not None]
    return {'low': min(known), 'high': max(known)}

def transform_minmax(value, state):
    return (value - state['low']) / (state['high'] - state['low'])

state = fit_minmax([12, None, 20, 16])
print(state, transform_minmax(18, state), transform_minmax(24, state))`,
      out: `{'low': 12, 'high': 20} 0.75 1.5`,
    },
    'The state is two numbers. A new value of 24, above anything in training, becomes 1.5. That is correct: the state was learned once and is not refitted to suit the new row.',

    { h: 'Three kinds of step' },
    { sub: 'Learned steps' },
    'These have a fit and a transform. For a number column, fit learns the median of the known values, then fills the gaps with it and learns the mean and standard deviation of the filled column, since that is the column the scaler will see. Recall the standard deviation: the square root of the average squared distance from the mean, dividing by the count n. Store 1.0 instead of 0 for a constant column so that scaling never divides by zero. `statistics.median(list)` gives the median. Transform fills a missing value with the stored median, standardises it as `(x − mean) / std`, and adds a 0/1 flag for "was missing". A value of 0 is real and is not flagged.',
    'For a category column, fit learns the sorted list of distinct training values, ignoring `None`. A set such as `{v for v in values if v is not None}` removes repeats, and `sorted` fixes the order, so the same category always lands in the same position. Transform one-hot encodes against that list; an unseen or missing category gives all zeros.',
    { sub: 'Stateless steps' },
    'Some steps learn nothing: taking a log, or reading parts of a date. They need no fit and cannot leak. `date.fromisoformat(\'2024-02-27\')` turns an ISO date string (year-month-day) into a date; subtracting two dates and reading `.days` gives the gap; `weekday()` counts Monday as 0, so 5 and 6 are the weekend.',
    {
      code: `from datetime import date

joined = date.fromisoformat('2024-02-27')
print(joined.weekday(), (date.fromisoformat('2024-03-02') - joined).days)`,
      out: '1 4',
    },
    'Tuesday is weekday 1, and 2024 is a leap year, so 27 February to 2 March is 4 days. Letting the `date` type do the arithmetic handles leap years and changes of year for you.',
    { sub: 'As-of steps' },
    'Features from history, such as a customer\'s number of earlier orders, take the prediction date (`as_of`) as an argument and use only events strictly before it. ISO date strings sort correctly as text, so `day < as_of` works directly on strings like `\'2024-03-09\' < \'2024-11-01\'`. This is true only because every part has a fixed width with leading zeros: `\'9\' < \'11\'` is False as text.',

    { h: 'Putting the steps together' },
    'The top-level `fit` calls each learned step\'s fit on the training rows and gathers the results into one state dictionary, one entry per column. The top-level `transform` calls each step on one row and joins the pieces into one flat list. In Python, `+` on lists joins them end to end:',
    {
      code: `age_part = [1.5, 0]
plan_part = [0, 1]
date_part = [12, 0]
print(age_part + plan_part + date_part)`,
      out: '[1.5, 0, 0, 1, 12, 0]',
    },
    'The order of the pieces must be the same for every row, every time. A model reads position 3 as "the third feature"; if a piece goes missing or moves, it reads the wrong number and raises no error.',
    { sub: 'Who gets to fit' },
    'Split first, then fit on the training part only, for every learned step. A common slip is to split correctly, fit one step on the training rows, and fit another on all the rows by mistake. A single `fit(train_rows)` function that does all the fitting in one place makes that slip harder.',

    { h: 'Testing a pipeline you can trust' },
    'Preprocessing bugs rarely crash. They produce plausible numbers that are wrong, and the first sign is a worse model. Tests catch them earlier.',
    {
      list: [
        '**The awkward row**: every value missing, every category unseen, a brand-new customer with no history. It should give a valid vector of the usual length.',
        '**No refitting in transform**: copy the state with `copy.deepcopy(state)` before transforming, then check the state is unchanged afterwards.',
        '**Training rows only**: change a test row and check the fitted state does not move.',
        '**Look-ahead**: add an event dated after `as_of` and check the features stay the same.',
        '**Fixed shape**: every row gives the same length and column order.',
      ],
    },

    { h: 'From lab to production' },
    'The stored state plus the transform code is what you deploy, saved next to the model. At serving time you load the state and call the same transform function; you never refit on live data, which would put features on a different scale from the one the model learned. Keep one transform shared by training and serving: two separate versions drift apart. Once live, watch the share of missing values and of unseen categories in each feature. A jump means the incoming data has changed and the stored state is going stale.',
  ],
}
