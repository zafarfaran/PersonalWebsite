import type { Module } from '../types'

export const evaluation: Module = {
  id: 'evaluation',
  title: 'Evaluation and experiments',
  summary: 'How to know whether a model is good, and how to avoid fooling yourself while finding out.',
  lessons: [
    {
      id: 'evaluation-splits',
      title: 'Training, validation and test sets',
      summary: 'Three sets with three jobs, and how the wrong way of cutting the data inflates the score.',
      text: [
        'A model is only useful on data it has not seen, so that is where you measure it. The **training set** fits the weights. The **validation set** is for every decision you make along the way: which model, which features, which hyperparameters, when to stop. The **test set** is opened once, at the end, to estimate how the chosen model will do in production.',
        'The split must copy how the model will be used. A **random** split is right only when the rows are independent and tomorrow looks like today. A **stratified** split keeps the class proportions the same in each part, which matters when one class is rare: a plain random split of 1,000 rows with 20 positives can leave a test set with one or two of them.',
        'When several rows come from the same patient, user or device, split **by group**: all the rows of a group go to the same side. Otherwise the model recognises the patient instead of learning the disease. When you predict the future, split **by time**: train on the past, validate on what came after. A random split lets the model fill in between neighbouring days, which production never allows.',
        { code: `from sklearn.model_selection import train_test_split, GroupShuffleSplit

# rare class: keep its share the same on both sides
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, stratify=y, random_state=0)

# several rows per user: keep each user on one side
splitter = GroupShuffleSplit(n_splits=1, test_size=0.2, random_state=0)
train_idx, test_idx = next(splitter.split(X, y, groups=user_id))

# forecasting: cut at a date
train, test = df[df.date < "2024-07-01"], df[df.date >= "2024-07-01"]` },
        '**Leakage** is any route by which information from the validation or test rows reaches training. The usual routes: duplicates on both sides, a scaler or encoder fitted on all the data before the split, a feature that is only known after the outcome, and a group or a time period cut in two. The symptom is a score that is too good, followed by a model that disappoints in production.',
        'On sizes: the test set has to be large enough for the number you report to mean something, and the standard error from the maths module tells you how large. With millions of rows, 1% can be plenty. With a thousand, use cross-validation, which is the next lesson.',
      ],
      rules: [
        'Train fits the weights, validation makes the choices, test is used once.',
        'Split the way production splits: by time for forecasts, by group when rows share a user or patient.',
        'Stratify when a class is rare.',
        'Fit scalers, encoders and imputers on the training rows only.',
        'A feature must be known at the moment of prediction, not after the outcome.',
        'A score that looks too good is a leak until proved otherwise.',
      ],
      questions: [
        {
          kind: 'choice',
          id: 'evaluation-splits-1',
          ask: 'A dataset has 10 chest X-rays from each of 2,000 patients. A random split by image gives 97% accuracy. At a new hospital the model manages 81%. Which split would have warned you?',
          options: [
            'A stratified split by diagnosis',
            'A split by patient, so that all ten images of a patient are on the same side',
            'A larger random test set',
            'A random split with a different seed',
          ],
          answer: 1,
          why: 'With images of the same patient on both sides, the model can score well by recognising the patient (their anatomy, the scanner, the hospital). Production only ever sees new patients, so the split must too. A bigger random test set measures the same wrong thing more precisely.',
        },
        {
          kind: 'choice',
          id: 'evaluation-splits-2',
          ask: 'You train 30 variants of a model and keep the one with the best score on a set S. Which set must S be?',
          options: ['The training set', 'The validation set', 'The test set', 'Any of them, as long as it is large'],
          answer: 1,
          why: 'Choosing between models is a decision, and decisions belong to the validation set. Choose on the training set and you reward memorising. Choose on the test set and its score is no longer an honest estimate, because the winner was picked partly for its luck on those rows.',
        },
        {
          kind: 'output',
          id: 'evaluation-splits-3',
          ask: 'Twenty rows, four of them positive. What does this print?',
          code: `from sklearn.model_selection import train_test_split

y = [0] * 16 + [1] * 4
X = list(range(20))
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, stratify=y, random_state=0)
print(len(y_te), sum(y_te))`,
          answer: '5 1',
          why: 'A quarter of 20 rows is 5. With `stratify=y` the test set keeps the 20% share of positives, so exactly 1 of the 5 is positive, whatever the seed. Without it you could get 0, and a recall you cannot compute.',
        },
        {
          kind: 'bug',
          id: 'evaluation-splits-4',
          ask: 'The test score from this code is slightly too good. Which line leaks?',
          code: `from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=0)
scaler = StandardScaler().fit(X)
X_tr = scaler.transform(X_tr)
X_te = scaler.transform(X_te)`,
          line: 5,
          fix: 'scaler = StandardScaler().fit(X_tr)',
          why: 'Fitted on all of `X`, the scaler has seen the mean and spread of the test rows. For a scaler the leak is small; for target encoding, imputation or feature selection the same mistake can be large. The habit is the same for all: fit on the training rows, transform the rest.',
        },
        {
          kind: 'choice',
          id: 'evaluation-splits-5',
          ask: 'You forecast next week\'s demand for each shop from two years of daily sales. A random split of the days gives an error of 12 units. Training on the first 20 months and testing on the last 4 gives 19. Which do you report?',
          options: [
            '12: the random split uses the data more evenly',
            '19: the model will only ever be asked about days after its training data',
            'The average of the two, 15.5',
            '12, because the time split has less training data',
          ],
          answer: 1,
          why: 'With a random split, the model is tested on a Tuesday while having trained on the Monday and Wednesday around it. In production there is no Wednesday yet. The time split is the only one that copies the real task, so its number is the honest one.',
        },
        {
          kind: 'output',
          id: 'evaluation-splits-6',
          ask: 'A check worth running on every split. What does this print?',
          code: `users_train = ["a", "a", "b", "c", "c"]
users_test = ["c", "d", "d"]

print(sorted(set(users_train) & set(users_test)))`,
          answer: "['c']",
          why: 'The intersection of the two sets of users should be empty. User c is on both sides, so the test score is partly a memory test. One line like this, as an assert in the pipeline, catches a group leak before it costs anything.',
        },
        {
          kind: 'bug',
          id: 'evaluation-splits-7',
          ask: 'This should send every row of the chosen groups to the test side. The test list comes out wrong.',
          code: `def group_split(groups, test_groups):
    # groups: the group of each row    test_groups: a set of group names
    train_idx = [i for i, g in enumerate(groups) if g not in test_groups]
    test_idx = [i for i, g in enumerate(groups) if i in test_groups]
    return train_idx, test_idx`,
          line: 4,
          fix: '    test_idx = [i for i, g in enumerate(groups) if g in test_groups]',
          why: 'The line tests the row number `i` against the group names, which never matches, so the test side is empty. The row belongs to the test side when its group `g` is one of the test groups.',
        },
        {
          kind: 'choice',
          id: 'evaluation-splits-8',
          ask: 'A churn model reaches an AUC of 0.99 on the validation set. Its most important feature is `days_since_cancellation_request`. What is going on?',
          options: [
            'The model is excellent and ready to ship',
            'The feature is only filled in once a customer has started to leave, so it hands the model the answer',
            'The validation set is too small',
            'The model needs more regularisation',
          ],
          answer: 1,
          why: 'This is target leakage: a column that is a consequence of the outcome. At the moment you need the prediction, the value does not exist yet. Ask of every feature: "would I have this value at prediction time?". A score near perfect on a hard problem is the cue to ask.',
        },
        {
          kind: 'choice',
          id: 'evaluation-splits-9',
          ask: 'You discover that 6% of the test rows are exact duplicates of training rows. After removing them the test accuracy falls from 0.95 to 0.88. Which number describes the model?',
          options: [
            '0.95: duplicates are real data too',
            '0.88: the duplicates were being answered from memory',
            'Neither: the test set is now too small to use',
            '0.915, the midpoint',
          ],
          answer: 1,
          why: 'A row the model has trained on tells you nothing about how it handles a new one. The drop is the size of the leak. Deduplicate before splitting, and for near-duplicates (the same photo resized, the same text with a new date) split by group.',
        },
        {
          kind: 'write',
          id: 'evaluation-splits-10',
          ask: 'Write a stratified split. Given the label of each row and a test fraction, return two lists of row numbers so that each class sends that fraction of its rows (rounded down) to the test side.',
          starter: `def stratified_split(labels, test_frac):
    # returns (train_idx, test_idx): two lists of row numbers
    pass`,
          solution: `def stratified_split(labels, test_frac):
    by_class = {}
    for i, label in enumerate(labels):
        by_class.setdefault(label, []).append(i)
    train_idx, test_idx = [], []
    for rows in by_class.values():
        n_test = int(len(rows) * test_frac)
        test_idx += rows[:n_test]
        train_idx += rows[n_test:]
    return sorted(train_idx), sorted(test_idx)`,
          tests: `labels = [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]
out = stratified_split(labels, 0.25)
assert out is not None, "the function returns nothing yet"
train_idx, test_idx = out
assert sorted(list(train_idx) + list(test_idx)) == list(range(12)), "every row must be in exactly one of the two lists"
assert len(test_idx) == 3, f"a quarter of the 8 negatives and of the 4 positives is 3 rows, got {len(test_idx)}"
assert sum(labels[i] for i in test_idx) == 1, "the test rows should hold a quarter of the positives: 1 of 4"
assert sum(labels[i] for i in train_idx) == 3, "the training rows should hold the other 3 positives"
labels = ["a"] * 10 + ["b"] * 10
train_idx, test_idx = stratified_split(labels, 0.5)
assert sorted(labels[i] for i in test_idx) == ["a"] * 5 + ["b"] * 5, "half of each class should go to the test rows"`,
          why: 'Group the row numbers by class, then cut each group separately. That is all stratification is. A real one shuffles each group first; the cut is the same.',
        },
        {
          kind: 'write',
          id: 'evaluation-splits-11',
          ask: 'Write a split by time. Given the timestamp of each row (in any order) and a test fraction, return two lists of row numbers: the latest rows go to the test side, everything earlier to training.',
          starter: `def time_split(timestamps, test_frac):
    # returns (train_idx, test_idx), each in time order
    # the test side gets int(n * test_frac) rows: the latest ones
    pass`,
          solution: `def time_split(timestamps, test_frac):
    order = sorted(range(len(timestamps)), key=lambda i: timestamps[i])
    n_test = int(len(timestamps) * test_frac)
    cut = len(timestamps) - n_test
    return order[:cut], order[cut:]`,
          tests: `out = time_split([5, 1, 4, 2, 3], 0.4)
assert out is not None, "the function returns nothing yet"
train_idx, test_idx = out
assert sorted(test_idx) == [0, 2], f"the two latest rows are rows 0 and 2 (times 5 and 4), got {sorted(test_idx)}"
assert list(train_idx) == [1, 3, 4], f"the training rows in time order are 1, 3, 4, got {list(train_idx)}"
ts = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
train_idx, test_idx = time_split(ts, 0.2)
assert len(test_idx) == 2 and len(train_idx) == 8, "20% of 10 rows is 2 test rows"
assert max(ts[i] for i in train_idx) < min(ts[i] for i in test_idx), "every training row must come before every test row"`,
          why: 'Sort the row numbers by time and cut once. The property that matters is the last assert: nothing in training is later than anything in test. In practice you often leave a gap between the two as well, as wide as the delay before a label is known.',
        },
        {
          kind: 'design',
          id: 'evaluation-splits-12',
          ask: 'You have two years of loan applications, each with the features known at application and whether the loan defaulted within 12 months. Many customers applied more than once. Design the split you would use to evaluate a default model.',
          checklist: [
            { point: 'Split by time: train on the older applications, test on the most recent', why: 'The model will score future applicants. Economic conditions and the applicant mix drift, and only a time split measures that.' },
            { point: 'Use only applications whose 12-month outcome window has closed', why: 'A loan from three months ago has not had time to default. Counting it as "good" mislabels the newest rows.' },
            { point: 'Keep each customer on one side', why: 'Repeat applicants look alike. If one application is in training and another in test, the model is recalling a customer it knows.' },
            { point: 'Carve a validation period out of the training side, also by time', why: 'Tuning needs its own held-out data, so that the test period is touched once.' },
            { point: 'Fit all preprocessing on the training period only', why: 'Scalers, encoders and imputers fitted on everything carry information back from the future.' },
            { point: 'Check that every feature was known at the moment of application', why: 'Columns filled in later (collections contact, account status) are consequences of the outcome and leak it.' },
            { point: 'Check the number of defaults in the test period', why: 'Defaults are rare. With a few dozen of them, the standard error of recall or precision is too wide to compare models.' },
          ],
          why: 'The split has to copy the real task: score a new applicant today, learn the outcome a year later. Time, groups, label delay and feature timing each open a different leak, and a default model usually has all four.',
        },
      ],
    },
    {
      id: 'evaluation-crossval',
      title: 'Cross-validation and tuning without cheating',
      summary: 'Getting a score with an error bar from limited data, and keeping the test set honest.',
      widget: 'evaluation-folds',
      text: [
        'One validation split gives one number, and on a small dataset that number depends heavily on which rows happened to land in it. **k-fold cross-validation** cuts the data into k parts, called folds. Each fold takes a turn as the validation set while the model trains on the other k − 1. You get k scores. Their mean is your estimate, and their spread says how far to trust it.',
        'The figure shows the layout. A rough error bar is the standard deviation of the fold scores divided by √k. It is a rule of thumb, because the folds share most of their training rows and so are not independent, but it is enough to stop you celebrating a gain of 0.3 points when the folds differ by 3. Five or ten folds is the usual choice. The splitting rules of the last lesson still apply: use `StratifiedKFold`, `GroupKFold` or `TimeSeriesSplit` where they fit, and shuffle if the rows are sorted.',
        { code: `from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline

model = make_pipeline(StandardScaler(), LogisticRegression())
scores = cross_val_score(model, X_train, y_train, cv=5)
print(scores.mean(), scores.std())` },
        'Everything that learns from data must happen inside the fold. Put the scaler, the imputer and the feature selection in a `Pipeline`, so that each is fitted on the training folds only. Selecting features on all the rows and then cross-validating is the classic way to get a fine score out of pure noise.',
        'Every time you pick the best of several options by its validation score, that score becomes optimistic: the winner is partly the best and partly the luckiest. Try 50 configurations and the top score overstates what you will get. This is why the **test set is used once**. Look at it ten times and choose by it, and it has become a validation set: you no longer have an unbiased number.',
        'With little data and a lot of tuning, use **nested cross-validation**: an inner loop chooses the hyperparameters, and an outer loop scores the whole procedure, tuning included, on folds the tuning never saw. In everyday work the cheaper version is enough: tune with cross-validation on the training data, then score the final model once on a held-out test set.',
      ],
      rules: [
        'k-fold: every row is validated exactly once and trained on k − 1 times.',
        'Report the mean of the fold scores with their spread, never the mean alone.',
        'Preprocessing and feature selection go inside the pipeline, so that they are refitted in every fold.',
        'The best of many tries is optimistic. The more you try, the more it is.',
        'The test set gives one honest number, once. Choosing by it spends it.',
        'Nested cross-validation scores the tuning procedure, not one tuned model.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'evaluation-crossval-1',
          ask: 'You run 5-fold cross-validation on 1,000 rows. How many rows does each of the five models train on?',
          answer: 800,
          check: '1000 * 4 / 5',
          why: 'Each fold holds 200 rows. A model trains on the other four folds: 800 rows. So a cross-validated score describes a model trained on 80% of the data, which makes it very slightly pessimistic about the final model trained on all of it.',
        },
        {
          kind: 'output',
          id: 'evaluation-crossval-2',
          ask: 'What does this print?',
          code: `from sklearn.model_selection import KFold

X = list(range(6))
for train_idx, val_idx in KFold(n_splits=3).split(X):
    print(val_idx)`,
          answer: '[0 1]\n[2 3]\n[4 5]',
          why: 'Without `shuffle=True`, `KFold` takes the folds as consecutive blocks in the order of the rows. Every row is validated once. If the rows are sorted by class or by date, those blocks are not alike, which is the subject of a later question.',
        },
        {
          kind: 'number',
          id: 'evaluation-crossval-3',
          ask: 'The figure has 120 rows. With k = 6, how many rows does each round train on?',
          answer: 100,
          check: '120 - 120 / 6',
          why: 'Each block holds 120 ÷ 6 = 20 rows. One block validates and the other five train: 100 rows. The readout under the figure shows the same sum for any k.',
        },
        {
          kind: 'choice',
          id: 'evaluation-crossval-4',
          ask: 'In the figure, raise k from 3 to 10 and watch the fold scores and their mean. What happens, and why?',
          options: [
            'The fold scores move closer together, because there are more of them',
            'The fold scores scatter more, because each is measured on fewer rows, while their mean stays where it was',
            'The mean rises, because each model trains on more rows',
            'Nothing changes: k has no effect on the scores',
          ],
          answer: 1,
          why: 'With 3 folds each score comes from 40 rows; with 10, from 12. Fewer rows means a noisier score, so the spread roughly doubles (about 5 to about 12 points), yet the mean stays at 75%. A single fold score is weak evidence. The mean with its error bar is what to quote.',
        },
        {
          kind: 'output',
          id: 'evaluation-crossval-5',
          ask: 'Five fold accuracies. What does this print?',
          code: `import numpy as np

scores = np.array([0.80, 0.84, 0.82, 0.78, 0.86])
print(round(float(scores.mean()), 2), round(float(scores.std() / np.sqrt(5)), 3))`,
          answer: '0.82 0.013',
          hint: 'The distances from the mean are 0.02, 0.02, 0, 0.04 and 0.04.',
          why: 'The mean is 0.82. The squared distances average 0.0008, so the standard deviation is about 0.028, and dividing by √5 gives 0.013. Report "0.82 ± 0.013". A rival model at 0.83 is inside that bar and has not been shown to be better.',
        },
        {
          kind: 'bug',
          id: 'evaluation-crossval-6',
          ask: 'This tunes the regularisation strength and then reports a test accuracy. The reported number is too high. Which line is to blame?',
          code: `best_score, best_c = 0, None
for c in [0.01, 0.1, 1, 10]:
    model = LogisticRegression(C=c).fit(X_train, y_train)
    score = model.score(X_test, y_test)
    if score > best_score:
        best_score, best_c = score, c
final = LogisticRegression(C=best_c).fit(X_train, y_train)
print("test accuracy:", final.score(X_test, y_test))`,
          line: 4,
          fix: '    score = model.score(X_val, y_val)',
          why: 'The loop picks `C` by its score on the test set, so the final "test accuracy" is the best of four looks at the same rows. Choose on validation data (or by cross-validation on the training data) and the last line becomes an honest, single use of the test set.',
        },
        {
          kind: 'choice',
          id: 'evaluation-crossval-7',
          ask: 'You try 200 random hyperparameter settings. The best scores 0.874 in cross-validation; most of the rest are between 0.855 and 0.868, and the fold-to-fold error bar is about 0.01. What should you expect from the winner on the test set?',
          options: [
            'Exactly 0.874, because cross-validation is unbiased',
            'Probably a little under 0.874: the top of 200 noisy scores is partly luck',
            'Clearly more than 0.874, because the best setting generalises best',
            'About 0.5: the search has overfitted completely',
          ],
          answer: 1,
          why: 'Each score is the true quality plus noise, and picking the maximum picks a setting whose noise happened to be positive. With differences this close to the error bar, much of the lead is luck. The setting is still a reasonable choice. Its score is what you should not quote.',
        },
        {
          kind: 'choice',
          id: 'evaluation-crossval-8',
          ask: 'A colleague has 200 patients and 5,000 gene measurements each. They keep the 50 genes most correlated with the label, using all 200 rows, then report 91% accuracy from 5-fold cross-validation. What is wrong?',
          options: [
            'Nothing: the model was cross-validated',
            'Five folds is too few for 200 rows',
            'The gene selection saw the labels of every validation row, so the folds are no longer unseen',
            '50 features is too many for 200 rows',
          ],
          answer: 2,
          why: 'Among 5,000 columns of noise, some will correlate with any 200 labels by chance. Selecting them on all rows bakes the validation labels into the features. The selection must be a step of the pipeline, refitted inside each fold. Done that way, noise scores about 50%.',
        },
        {
          kind: 'bug',
          id: 'evaluation-crossval-9',
          ask: 'The rows are sorted by class. Every fold reports a terrible score, although a single random split works well.',
          code: `from sklearn.model_selection import KFold, cross_val_score

# X, y: all of class 0 first, then all of class 1
cv = KFold(n_splits=5)
scores = cross_val_score(model, X, y, cv=cv)
print(scores.mean(), scores.std())`,
          line: 4,
          fix: 'cv = KFold(n_splits=5, shuffle=True, random_state=0)',
          why: 'Unshuffled folds are consecutive blocks. On sorted data a validation block can hold a single class while the training rows hold mostly the other. Shuffle, or better, use `StratifiedKFold(shuffle=True)` so that each fold keeps the class proportions.',
        },
        {
          kind: 'choice',
          id: 'evaluation-crossval-10',
          ask: 'You have vibration readings from 40 machines, about 50 readings each, and want to predict failures on machines the model has never seen. Which splitter fits?',
          options: ['`KFold(shuffle=True)`', '`StratifiedKFold`', '`GroupKFold` with the machine as the group', '`TimeSeriesSplit`'],
          answer: 2,
          why: 'Readings from one machine resemble each other. Any splitter that scatters a machine across folds lets the model recognise the machine. `GroupKFold` keeps each machine whole, so every fold tests on unseen machines, which is the job.',
        },
        {
          kind: 'choice',
          id: 'evaluation-crossval-11',
          ask: 'With only 300 rows you tune 100 configurations by 5-fold cross-validation and want to tell your manager what accuracy to expect. There is no spare data for a test set. What gives an honest number?',
          options: [
            'The best cross-validation score of the 100',
            'The average cross-validation score of the 100',
            'Nested cross-validation: tune inside each outer training fold, score on the outer fold the tuning never saw',
            'The training accuracy of the best configuration',
          ],
          answer: 2,
          why: 'The best of 100 is optimistic, and the average describes configurations you will not use. Nested cross-validation repeats the whole search inside each outer fold and scores its winner on untouched rows, so it measures the procedure "tune, then predict", which is what you will ship.',
        },
        {
          kind: 'write',
          id: 'evaluation-crossval-12',
          ask: 'Write the index generator behind k-fold. For n rows and k folds, return k pairs of lists `(train_idx, val_idx)`. The validation blocks are consecutive, and when n does not divide evenly the first folds get one extra row each.',
          starter: `def kfold(n, k):
    # returns a list of k pairs (train_idx, val_idx)
    pass`,
          solution: `def kfold(n, k):
    sizes = [n // k + (1 if i < n % k else 0) for i in range(k)]
    folds, start = [], 0
    for size in sizes:
        val_idx = list(range(start, start + size))
        train_idx = [i for i in range(n) if i < start or i >= start + size]
        folds.append((train_idx, val_idx))
        start += size
    return folds`,
          tests: `out = kfold(6, 3)
assert out is not None, "the function returns nothing yet"
assert len(out) == 3, f"3 folds expected, got {len(out)}"
assert [list(v) for _, v in out] == [[0, 1], [2, 3], [4, 5]], "the validation blocks of kfold(6, 3) should be [0, 1], [2, 3], [4, 5]"
assert list(out[1][0]) == [0, 1, 4, 5], "the training rows are all the rows outside the validation block"
folds = kfold(10, 3)
assert [len(v) for _, v in folds] == [4, 3, 3], "when n does not divide evenly the first folds get the extra rows: sizes 4, 3, 3"
assert sorted(i for _, v in folds for i in v) == list(range(10)), "every row should be in exactly one validation block"
assert all(not set(t) & set(v) for t, v in folds), "a row cannot be in training and validation in the same fold"`,
          why: 'Work out the block sizes, walk along the rows, and give each block a turn as validation. The last two asserts are the two promises of k-fold: every row is validated once, and never by a model that trained on it.',
        },
      ],
    },
    {
      id: 'evaluation-metrics',
      title: 'The confusion matrix, precision, recall and F1',
      summary: 'Four counts that describe every classifier, and the metrics built from them.',
      widget: 'evaluation-threshold',
      text: [
        'Accuracy is the share of predictions that are right. It is the first metric everyone reaches for, and it fails as soon as the classes are unbalanced. If 1% of transactions are fraud, a model that says "not fraud" every time is 99% accurate and catches nothing.',
        'The **confusion matrix** counts the four things that can happen. **True positives** (TP) are real positives the model flagged. **False positives** (FP) are false alarms. **False negatives** (FN) are positives it missed. **True negatives** (TN) are negatives it left alone. Every classification metric is a ratio of these four.',
        '**Precision** is TP / (TP + FP): of the cases the model flagged, how many were real. **Recall** is TP / (TP + FN): of the real cases, how many the model found. They pull against each other. Flag more and recall rises while precision falls. In the figure, slide the threshold and watch cases move from one cell to another.',
        '**F1** is the harmonic mean of the two, `2PR / (P + R)`. It is high only when both are high, so a model cannot buy a good F1 with one of them alone. It also treats both kinds of error as equally bad, which is rarely true of a product.',
        'So decide which error costs more before choosing a metric. A missed tumour costs far more than an extra scan: favour recall and accept false alarms. A real email in the spam folder costs more than one spam in the inbox: favour precision. State it as a constraint, such as "the best recall at a precision of at least 90%", and you have one number to optimise.',
        'In scikit-learn, `confusion_matrix(y_true, y_pred)` puts the truth in the rows and orders the classes 0 then 1, so it reads `[[TN, FP], [FN, TP]]`. Check the layout before reading any confusion matrix, because other tools draw it the other way round. With several classes, each class has its own precision and recall: the **macro** average treats every class equally, while the **micro** average counts every row equally and so follows the large classes.',
      ],
      rules: [
        'Precision: of what I flagged, how much was real. Recall: of what was real, how much I found.',
        'On unbalanced data, compare accuracy with the share of the majority class before being impressed.',
        'F1 = `2PR / (P + R)`. It sits close to the smaller of the two.',
        'Choose the metric from the cost of each kind of error in the product.',
        'scikit-learn\'s confusion matrix is `[[TN, FP], [FN, TP]]`: truth in rows, prediction in columns.',
        'Macro average: every class counts the same. Micro: every row counts the same.',
      ],
      questions: [
        {
          kind: 'output',
          id: 'evaluation-metrics-1',
          ask: 'What does this print?',
          code: `from sklearn.metrics import confusion_matrix

y_true = [1, 0, 1, 1, 0, 0, 0, 1]
y_pred = [1, 0, 0, 1, 1, 0, 0, 0]
print(confusion_matrix(y_true, y_pred))`,
          answer: '[[3 1]\n [2 2]]',
          hint: 'Rows are the truth (0 then 1), columns are the prediction (0 then 1).',
          why: 'Top row, the four real negatives: 3 predicted 0 (TN) and 1 predicted 1 (FP). Bottom row, the four real positives: 2 missed (FN) and 2 found (TP).',
        },
        {
          kind: 'output',
          id: 'evaluation-metrics-2',
          ask: 'Six real positives, four flags. What does this print?',
          code: `from sklearn.metrics import precision_score, recall_score

y_true = [1, 1, 1, 1, 1, 1, 0, 0, 0, 0]
y_pred = [1, 1, 1, 0, 0, 0, 1, 0, 0, 0]
print(precision_score(y_true, y_pred), recall_score(y_true, y_pred))`,
          answer: '0.75 0.5',
          why: 'The model flagged 4 rows and 3 of them are positive: precision 3/4. There are 6 positives and it found 3: recall 3/6. The same three true positives, divided by two different totals.',
        },
        {
          kind: 'number',
          id: 'evaluation-metrics-3',
          ask: 'Of 1,000 people screened, 10 have the disease. A model flags 30 people, 8 of whom have it. What is its accuracy?',
          answer: 0.976,
          tol: 0.002,
          check: '(8 + (990 - 22)) / 1000',
          hint: 'Count the mistakes: the sick people it missed and the healthy people it flagged.',
          why: 'It makes 2 misses and 22 false alarms: 24 errors, so 97.6%. Saying "healthy" to everyone scores 99.0% and finds nobody. The model with the lower accuracy is the useful one, with a recall of 80%.',
        },
        {
          kind: 'choice',
          id: 'evaluation-metrics-4',
          ask: 'In the figure, set positives to 5%. Move the threshold from 0.5 to 0.9. Accuracy rises from about 84% to about 95%. What has the model become?',
          options: [
            'A much better model: accuracy is up 11 points',
            'A model that flags almost nothing: recall has fallen from 84% to about 5%, and its accuracy matches always saying "negative"',
            'A model with perfect precision and recall',
            'A model that flags everything',
          ],
          answer: 1,
          why: 'With 95% negatives, flagging nothing is right 95% of the time. Raising the threshold moves the model towards that useless answer, and accuracy rewards it. On rare positives, accuracy mostly measures how seldom the model flags.',
        },
        {
          kind: 'choice',
          id: 'evaluation-metrics-5',
          ask: 'In the figure, keep the threshold at 0.5 and lower the share of positives from 50% to 5%. Which metric collapses, and which does not move?',
          options: [
            'Recall collapses; precision does not move',
            'Precision collapses (about 84% to about 22%); recall does not move',
            'Both collapse',
            'Neither moves: the model has not changed',
          ],
          answer: 1,
          why: 'Recall only looks at the positives, and the model treats each of them as before. Precision compares true positives with false alarms, and there are now 19 negatives for every positive to raise alarms. A precision measured on balanced data says little about a deployment where positives are rare.',
        },
        {
          kind: 'number',
          id: 'evaluation-metrics-6',
          ask: 'A model has precision 0.9 and recall 0.1. What is its F1?',
          answer: 0.18,
          tol: 0.005,
          check: '2 * 0.9 * 0.1 / (0.9 + 0.1)',
          why: '2 × 0.9 × 0.1 / (0.9 + 0.1) = 0.18. The ordinary average would say 0.5. The harmonic mean stays near the smaller number, so a model that finds a tenth of the positives cannot hide behind its precision.',
        },
        {
          kind: 'bug',
          id: 'evaluation-metrics-7',
          ask: 'Precision and recall from the three counts. One of the two comes out wrong.',
          code: `def precision_recall(tp, fp, fn):
    precision = tp / (tp + fn)
    recall = tp / (tp + fn)
    return precision, recall`,
          line: 2,
          fix: '    precision = tp / (tp + fp)',
          why: 'Precision divides by everything the model flagged: true positives plus false positives. Dividing by TP + FN gives recall a second time.',
        },
        {
          kind: 'bug',
          id: 'evaluation-metrics-8',
          ask: 'This unpacks a scikit-learn confusion matrix for 0/1 labels and computes precision. The result is wrong.',
          code: `from sklearn.metrics import confusion_matrix

cm = confusion_matrix(y_true, y_pred)
tp, fp, fn, tn = cm.ravel()
precision = tp / (tp + fp)`,
          line: 4,
          fix: 'tn, fp, fn, tp = cm.ravel()',
          why: 'The matrix is `[[TN, FP], [FN, TP]]`, so flattened it reads TN, FP, FN, TP. Unpacked the other way, "precision" is TN / (TN + FP), which on rare positives is close to 1 and looks like great news.',
        },
        {
          kind: 'output',
          id: 'evaluation-metrics-9',
          ask: 'Eight rows of class 0 and two of class 1. What does this print?',
          code: `from sklearn.metrics import recall_score

y_true = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1]
y_pred = [0, 0, 0, 0, 0, 0, 0, 0, 0, 1]
print(recall_score(y_true, y_pred, average="macro"), recall_score(y_true, y_pred, average="micro"))`,
          answer: '0.75 0.9',
          why: 'Recall is 1.0 for class 0 and 0.5 for class 1. The macro average gives each class one vote: 0.75. The micro average counts rows: 9 of 10 right, 0.9. Macro is the one that notices a small class doing badly.',
        },
        {
          kind: 'choice',
          id: 'evaluation-metrics-10',
          ask: 'Two spam filters. A: precision 0.99, recall 0.70, F1 0.82. B: precision 0.90, recall 0.95, F1 0.92. Mail marked as spam is hidden from the user. Which do you ship?',
          options: [
            'B: its F1 is higher',
            'A: with B, one in ten hidden emails is a real one, and a lost real email costs far more than a spam that gets through',
            'B: its recall is higher, and recall matters most',
            'Either: the difference is within noise',
          ],
          answer: 1,
          why: 'F1 weighs the two errors equally and the product does not. A false positive here is an invoice or a job offer the user never sees. The right statement of the goal is "the highest recall at a precision of at least 99%", and A meets it.',
        },
        {
          kind: 'choice',
          id: 'evaluation-metrics-11',
          ask: 'A moderation system has two models. One removes posts automatically. The other sends posts to a queue for human review. How should their operating points differ?',
          options: [
            'Both should maximise accuracy',
            'The automatic one needs high precision, since nobody catches its false alarms; the queue can trade precision for recall, since reviewers filter it',
            'The queue needs the higher precision, because reviewers are expensive',
            'They should use the same threshold, for consistency',
          ],
          answer: 1,
          why: 'The cost of a false positive depends on what happens next. An automatic removal of a harmless post is a harm with no check. A harmless post in a review queue costs a few seconds of a reviewer. Same kind of model, different error costs, different metric.',
        },
        {
          kind: 'write',
          id: 'evaluation-metrics-12',
          ask: 'Write precision, recall and F1 from two lists of 0/1 labels. When a ratio has a zero denominator, return 0.0 for it.',
          starter: `def precision_recall_f1(y_true, y_pred):
    # count TP, FP and FN, then return (precision, recall, f1)
    pass`,
          solution: `def precision_recall_f1(y_true, y_pred):
    tp = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 1)
    fp = sum(1 for t, p in zip(y_true, y_pred) if t == 0 and p == 1)
    fn = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 0)
    precision = tp / (tp + fp) if tp + fp else 0.0
    recall = tp / (tp + fn) if tp + fn else 0.0
    f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
    return precision, recall, f1`,
          tests: `out = precision_recall_f1([1, 1, 1, 1, 0, 0], [1, 1, 0, 0, 1, 0])
assert out is not None, "the function returns nothing yet"
p, r, f = out
assert abs(p - 2 / 3) < 1e-9, f"2 of the 3 flagged rows are positive, so precision is 0.667, got {p}"
assert abs(r - 0.5) < 1e-9, f"2 of the 4 positives were found, so recall is 0.5, got {r}"
assert abs(f - 4 / 7) < 1e-9, f"F1 is 2PR / (P + R) = 0.571, got {f}"
assert precision_recall_f1([1, 0, 1], [1, 0, 1]) == (1.0, 1.0, 1.0), "perfect predictions should give (1.0, 1.0, 1.0)"
try:
    nothing = precision_recall_f1([1, 1, 0], [0, 0, 0])
except ZeroDivisionError:
    raise AssertionError("a model that flags nothing makes TP + FP zero: return 0.0 instead of dividing")
assert nothing == (0.0, 0.0, 0.0), "a model that flags nothing should get (0.0, 0.0, 0.0)"`,
          why: 'Three counts and three ratios. True negatives appear nowhere, which is why these metrics stay meaningful when negatives vastly outnumber positives. The zero cases are real: a model that flags nothing has no precision to speak of.',
        },
      ],
    },
    {
      id: 'evaluation-curves',
      title: 'Thresholds, ROC, precision-recall and calibration',
      summary: 'A classifier outputs a score. Where to cut it, and whether the score means what it says, are separate questions.',
      widget: 'evaluation-roc',
      text: [
        'Most classifiers output a score, and `predict` quietly cuts it at 0.5. That cut is a product decision, and 0.5 is rarely the right one. Precision, recall and the confusion matrix all belong to one threshold. To judge the model apart from the threshold, sweep the threshold over every value and draw a curve.',
        'The **ROC curve** plots the true positive rate (recall) against the false positive rate, FP / (FP + TN). The area under it, **ROC AUC**, has a plain meaning: the probability that a randomly chosen positive gets a higher score than a randomly chosen negative. 0.5 is a random ranking and 1.0 a perfect one. It depends only on the order of the scores, and it does not change with the class balance.',
        'That last property is also its weakness. With 1 positive in 1,000, a false positive rate of 1% sounds small and means ten false alarms for every real case. The **precision-recall curve** shows this, because precision sets the false alarms against the true hits. Its baseline is the share of positives, not 0.5. On rare positives, watch the PR curve and its area, the **average precision**. The figure draws both curves for the same scores.',
        { code: `from sklearn.metrics import roc_auc_score, average_precision_score, precision_recall_curve

scores = model.predict_proba(X_val)[:, 1]       # scores, not 0/1 predictions
roc_auc_score(y_val, scores)
average_precision_score(y_val, scores)
precision, recall, thresholds = precision_recall_curve(y_val, scores)` },
        'To pick a threshold, use costs. If a false alarm costs 1 and a miss costs 50, choose the threshold that minimises `FP × 1 + FN × 50` on validation data. With calibrated probabilities there is a shortcut: act when `p × cost of a miss` is more than `(1 − p) × cost of a false alarm`, which is when p is above `c_fp / (c_fp + c_fn)`. Choose the threshold on validation data and report on test, like any other tuned setting.',
        'A score is **calibrated** if it means what it says: of the cases given 0.8, about 80% are positive. Ranking and calibration are different things. A model can have a high AUC and be badly calibrated, and any reshaping of the scores that keeps their order changes calibration without changing AUC. Check with a reliability table: bucket the predictions and compare the average prediction with the observed rate in each bucket. Fix it with Platt scaling or isotonic regression fitted on held-out data. It matters whenever the number itself is used, as in an expected cost.',
      ],
      rules: [
        'A threshold is a product decision. Choose it from costs, on validation data.',
        'ROC AUC is the chance that a random positive outscores a random negative. It ignores class balance.',
        'On rare positives, read the precision-recall curve. Its baseline is the positive rate.',
        'Give `roc_auc_score` the scores, not thresholded predictions.',
        'With calibrated probabilities, flag when p > `c_fp / (c_fp + c_fn)`.',
        'Calibrated: of the cases scored 0.8, about 80% are positive. A good AUC does not imply it.',
      ],
      questions: [
        {
          kind: 'output',
          id: 'evaluation-curves-1',
          ask: 'What does this print?',
          code: `from sklearn.metrics import roc_auc_score

y_true = [0, 0, 1, 1]
scores = [0.1, 0.4, 0.35, 0.8]
print(roc_auc_score(y_true, scores))`,
          answer: '0.75',
          hint: 'Take every pair of one positive and one negative. In how many does the positive have the higher score?',
          why: 'There are 2 × 2 = 4 pairs. The positive at 0.8 beats both negatives. The positive at 0.35 beats 0.1 and loses to 0.4. Three of four pairs are in the right order: 0.75.',
        },
        {
          kind: 'write',
          id: 'evaluation-curves-2',
          ask: 'Write ROC AUC by counting pairs: the share of (positive, negative) pairs in which the positive has the higher score. A tie counts as half.',
          starter: `def auc(y_true, scores):
    # y_true: 0/1 labels    scores: one number per row
    pass`,
          solution: `def auc(y_true, scores):
    pos = [s for t, s in zip(y_true, scores) if t == 1]
    neg = [s for t, s in zip(y_true, scores) if t == 0]
    wins = 0.0
    for p in pos:
        for n in neg:
            if p > n:
                wins += 1
            elif p == n:
                wins += 0.5
    return wins / (len(pos) * len(neg))`,
          tests: `out = auc([0, 0, 1, 1], [0.1, 0.4, 0.35, 0.8])
assert out is not None, "the function returns nothing yet"
assert abs(out - 0.75) < 1e-9, f"3 of the 4 pairs are in the right order, so the AUC is 0.75, got {out}"
assert auc([0, 1, 0, 1], [0.1, 0.9, 0.2, 0.8]) == 1.0, "every positive above every negative should give 1.0"
assert auc([1, 1, 0, 0], [0.1, 0.2, 0.8, 0.9]) == 0.0, "every positive below every negative should give 0.0"
assert abs(auc([0, 1, 0, 1], [0.5, 0.5, 0.5, 0.5]) - 0.5) < 1e-9, "tied scores count as half a win: a constant score has AUC 0.5"
assert abs(auc([0, 0, 0, 1], [1, 2, 3, 2.5]) - 2 / 3) < 1e-9, "one positive that beats 2 of 3 negatives should give 0.667"`,
          why: 'This is the definition, and it gives the same number as the area under the ROC curve. It shows why AUC only cares about order, and why the class balance cancels out: the count is divided by the number of pairs. Real libraries sort instead of comparing every pair.',
        },
        {
          kind: 'choice',
          id: 'evaluation-curves-3',
          ask: 'In the figure, lower the share of positives from 50% to 2% and watch both curves. What happens?',
          options: [
            'Both curves sink',
            'The ROC curve and its AUC (0.92) stay exactly where they were; the PR curve sinks and average precision falls from about 0.92 to about 0.37',
            'The ROC curve sinks; the PR curve does not move',
            'Neither moves: the model is the same',
          ],
          answer: 1,
          why: 'The true and false positive rates are each computed within one class, so the mix of classes cannot change them. Precision mixes the two classes, and with 49 negatives per positive the false alarms take over. Same model, same AUC, a very different product.',
        },
        {
          kind: 'choice',
          id: 'evaluation-curves-4',
          ask: 'In the figure, slide the threshold from 0.3 up to 0.7. Which way do the dots move?',
          options: [
            'Towards the top right of the ROC plot: more recall, more false positives',
            'Towards the bottom left of the ROC plot (fewer false positives, less recall) and towards the top left of the PR plot (more precision, less recall)',
            'They do not move: the curves are fixed',
            'Up on both plots',
          ],
          answer: 1,
          why: 'A higher threshold flags fewer cases, so both the true and the false positive rate fall, and what is still flagged is more likely to be real. The curves are fixed by the model. The threshold only chooses where on them you stand.',
        },
        {
          kind: 'bug',
          id: 'evaluation-curves-5',
          ask: 'This reports a ROC AUC that is lower than it should be, and the curve has only one corner.',
          code: `from sklearn.metrics import roc_auc_score

model.fit(X_train, y_train)
scores = model.predict(X_val)
print(roc_auc_score(y_val, scores))`,
          line: 4,
          fix: 'scores = model.predict_proba(X_val)[:, 1]',
          why: '`predict` returns 0 or 1: the scores already cut at 0.5. AUC needs the ranking, and two distinct values give a ranking with nearly everything tied. Pass the probability of the positive class (or `decision_function`).',
        },
        {
          kind: 'output',
          id: 'evaluation-curves-6',
          ask: 'Precision and recall at two thresholds. What does this print?',
          code: `scores = [0.9, 0.8, 0.7, 0.6, 0.4, 0.2]
y_true = [1, 1, 0, 1, 1, 0]

for threshold in [0.5, 0.75]:
    flagged = [t for t, s in zip(y_true, scores) if s >= threshold]
    print(threshold, sum(flagged) / len(flagged), sum(flagged) / sum(y_true))`,
          answer: '0.5 0.75 0.75\n0.75 1.0 0.5',
          why: 'At 0.5 four rows are flagged and three are positive, out of four positives: 0.75 and 0.75. At 0.75 two are flagged, both positive: precision 1.0, recall 0.5. One model, two different sets of metrics.',
        },
        {
          kind: 'number',
          id: 'evaluation-curves-7',
          ask: 'A fraud model\'s probabilities are calibrated. Sending a transaction to review costs £1. A fraud that is not reviewed costs £9. Above what probability should a transaction be sent to review?',
          answer: 0.1,
          check: '1 / (1 + 9)',
          hint: 'Review when p × 9 is more than (1 − p) × 1.',
          why: 'Reviewing wastes £1 with probability 1 − p. Not reviewing loses £9 with probability p. They balance at 9p = 1 − p, so p = 0.1. When misses are expensive the right threshold is far below 0.5.',
        },
        {
          kind: 'number',
          id: 'evaluation-curves-8',
          ask: 'Fraud is 0.1% of 100,000 transactions. At its operating threshold a model has 90% recall and a 2% false positive rate. What is its precision? (Two decimals.)',
          answer: 0.0431,
          tol: 0.005,
          check: '90 / (90 + 0.02 * 99900)',
          hint: 'Count the frauds flagged, then the honest transactions flagged.',
          why: 'There are 100 frauds and 90 are flagged. Of the 99,900 honest transactions, 2% are flagged: 1,998. So 90 of 2,088 flags are real, about 4%. A point that looks excellent on the ROC curve means 22 false alarms per fraud.',
        },
        {
          kind: 'choice',
          id: 'evaluation-curves-9',
          ask: 'Positives are 0.5% of the data. A model has an average precision of 0.10. Is it worthless?',
          options: [
            'Yes: anything below 0.5 is worse than random',
            'No: a random ranking would score about 0.005, so this is roughly twenty times better than chance',
            'Yes: average precision should be near 1',
            'It cannot be judged without the ROC AUC',
          ],
          answer: 1,
          why: 'The baseline of the PR curve is the positive rate, here 0.005. The 0.5 baseline belongs to ROC AUC. Always read average precision next to the share of positives, and compare models only on data with the same share.',
        },
        {
          kind: 'choice',
          id: 'evaluation-curves-10',
          ask: 'Every score s (between 0 and 1) of a classifier is replaced by s². What happens to its ROC AUC and to its calibration?',
          options: [
            'Both get worse',
            'The AUC is unchanged, because the order of the scores is the same; the calibration changes, because 0.8 has become 0.64',
            'The AUC falls; the calibration is unchanged',
            'Neither changes',
          ],
          answer: 1,
          why: 'AUC only uses the order, and squaring keeps the order. Calibration is about the values. This is why a model can rank very well and still give probabilities you must not plug into a cost calculation.',
        },
        {
          kind: 'output',
          id: 'evaluation-curves-11',
          ask: 'A two-bucket reliability table. What does this print?',
          code: `probs = [0.9, 0.9, 0.9, 0.9, 0.9, 0.1, 0.1, 0.1, 0.1, 0.1]
y_true = [1, 1, 1, 0, 0, 0, 0, 0, 0, 0]

high = [t for t, p in zip(y_true, probs) if p > 0.5]
low = [t for t, p in zip(y_true, probs) if p <= 0.5]
print(sum(high) / len(high), sum(low) / len(low))`,
          answer: '0.6 0.0',
          why: 'The model said 0.9 and 60% of those cases were positive. It said 0.1 and none were. It separates the classes well and is overconfident at the top. With more data you would use about ten buckets.',
        },
        {
          kind: 'choice',
          id: 'evaluation-curves-12',
          ask: 'A model has an AUC of 0.93. In the bucket of predictions around 0.85, only 60% of cases are positive. The predictions feed an expected-loss calculation. What should you do?',
          options: [
            'Nothing: an AUC of 0.93 shows the probabilities are good',
            'Lower the threshold to 0.6',
            'Fit a calibrator (Platt scaling or isotonic regression) on held-out data, and check the reliability table again',
            'Retrain with a larger model',
          ],
          answer: 2,
          why: 'The ranking is fine and the numbers are too confident. A calibrator learns a map from score to observed rate that keeps the order, so the ranking is not harmed. Fit it on data the model did not train on, because on its own training rows the model looks better calibrated than it is.',
        },
      ],
    },
    {
      id: 'evaluation-regression',
      title: 'Regression metrics and baselines',
      summary: 'Measuring errors in the units of the target, and checking that the model beats a guess.',
      text: [
        'When the target is a number, the error on one example is `prediction − truth`, and a metric is a way of averaging those. **MAE** (mean absolute error) averages their sizes. It is in the units of the target and reads directly: "off by 12 minutes on average". **RMSE** (root mean squared error) squares the errors, averages them and takes the root. It is in the same units, but the squaring makes large errors count far more.',
        'So the choice says what you care about. If one delivery that is two hours late is worse than eight that are fifteen minutes late, use RMSE. If every unit of error costs the same, or the outliers are mostly bad data, use MAE. RMSE is never smaller than MAE, and a wide gap between them means a few big misses. They also reward different guesses: the mean minimises squared error, the median minimises absolute error.',
        '**R²** is `1 − (the model\'s squared error) / (the squared error of always predicting the mean)`. 1 is perfect, 0 is no better than the mean, and negative is worse than the mean, which does happen on test data. R² has no units, which makes it easy to quote and hard to act on. It also depends on how spread out the targets are, so it cannot be compared across datasets.',
        { code: `from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

mae = mean_absolute_error(y_true, y_pred)
rmse = mean_squared_error(y_true, y_pred) ** 0.5
r2 = r2_score(y_true, y_pred)       # truth first: for R² the order matters` },
        'A metric means little without a **baseline**. Before any model, score the dumbest predictor: the training mean or median for ordinary regression, the last value (or the value a week ago) for a time series. An MAE of 4.1 sounds fine until you learn that "same as yesterday" gets 4.3. Last-value baselines are hard to beat, and a forecast that follows the series one step behind has learned exactly that baseline.',
        '**Percentage errors** make targets on different scales comparable. MAPE averages `|error| / |truth|`. It breaks when the truth is zero or close to it, and it is lopsided: a forecast can never be more than 100% too low but can be any amount too high, so optimising MAPE pushes forecasts down. When small targets matter, prefer the weighted version (total absolute error ÷ total of the truth), or quote the error as a ratio to the baseline\'s.',
      ],
      rules: [
        'MAE is the typical error. RMSE is in the same units, but big misses dominate it.',
        'RMSE ≥ MAE always. A wide gap means a few large errors.',
        'The mean minimises squared error; the median minimises absolute error.',
        'R² = 1 − SSE / SSE of the mean. Zero means "no better than the mean", and it can be negative.',
        'Score a naive baseline first: the mean, the median or the last value.',
        'MAPE fails near zero and favours forecasts that are too low.',
      ],
      questions: [
        {
          kind: 'output',
          id: 'evaluation-regression-1',
          ask: 'What does this print?',
          code: `from sklearn.metrics import mean_absolute_error, mean_squared_error

y_true = [10, 20, 30, 40]
y_pred = [12, 18, 30, 50]
mae = mean_absolute_error(y_true, y_pred)
rmse = mean_squared_error(y_true, y_pred) ** 0.5
print(mae, round(rmse, 1))`,
          answer: '3.5 5.2',
          hint: 'The errors are 2, −2, 0 and 10. √27 is about 5.2.',
          why: 'MAE: (2 + 2 + 0 + 10) / 4 = 3.5. RMSE: the squares 4, 4, 0 and 100 average 27, and √27 ≈ 5.2. The one error of 10 supplies 100 of the 108 in the sum of squares, which is why RMSE sits well above MAE.',
        },
        {
          kind: 'choice',
          id: 'evaluation-regression-2',
          ask: 'Two delivery-time models. A: MAE 10 minutes, RMSE 10. B: MAE 8 minutes, RMSE 16. A delivery more than 30 minutes late triggers a refund. Which do you ship?',
          options: [
            'B: it is 2 minutes better on average',
            'A: equal MAE and RMSE means its errors are all about the same size, while B\'s gap means a few very large misses, which are the ones that cost money',
            'B: a higher RMSE means it is more sensitive',
            'Either: the two metrics disagree, so nothing can be said',
          ],
          answer: 1,
          why: 'RMSE equals MAE only when every error has the same size. B is usually closer and occasionally far off. When cost grows faster than the error, as with refunds past a deadline, the squared metric is the one that matches the business.',
        },
        {
          kind: 'bug',
          id: 'evaluation-regression-3',
          ask: 'This RMSE reports almost zero for a model that is plainly wrong on most rows.',
          code: `def rmse(y_true, y_pred):
    errors = [p - t for t, p in zip(y_true, y_pred)]
    mean_square = sum(errors) / len(errors)
    return abs(mean_square) ** 0.5`,
          line: 3,
          fix: '    mean_square = sum(e * e for e in errors) / len(errors)',
          why: 'Without the square, errors of +5 and −5 cancel and the "mean square" is the average signed error, which is the bias. A model can be unbiased and still wrong on every row.',
        },
        {
          kind: 'number',
          id: 'evaluation-regression-4',
          ask: 'The true values are 1, 2 and 3. A model predicts 2 for all three. What is its R²?',
          answer: 0,
          check: '1 - sum((np.array([1, 2, 3]) - 2) ** 2) / sum((np.array([1, 2, 3]) - np.mean([1, 2, 3])) ** 2)',
          why: 'The model predicts the mean, so its squared error (1 + 0 + 1 = 2) equals the squared error of the mean baseline, and R² = 1 − 2/2 = 0. R² is a comparison with that baseline, built into the metric.',
        },
        {
          kind: 'output',
          id: 'evaluation-regression-5',
          ask: 'The predictions are the truth in reverse order. What does this print?',
          code: `from sklearn.metrics import r2_score

y_true = [1, 2, 3]
y_pred = [3, 2, 1]
print(r2_score(y_true, y_pred))`,
          answer: '-3.0',
          why: 'The squared errors are 4, 0 and 4: a total of 8. Predicting the mean gives 2. So R² = 1 − 8/2 = −3. R² is not the square of anything and has no floor at zero. A negative value on test data says the model does worse than a constant.',
        },
        {
          kind: 'choice',
          id: 'evaluation-regression-6',
          ask: 'You must give one constant guess for house prices, which have a long tail of very expensive homes, and you will be scored by MAE. Which constant is best?',
          options: ['The mean price', 'The median price', 'The most expensive price', 'Zero'],
          answer: 1,
          why: 'The median minimises the total absolute error; the mean minimises the total squared error. On a skewed target they are far apart. It also means a model trained with squared loss is not aiming at the metric if the metric is MAE.',
        },
        {
          kind: 'output',
          id: 'evaluation-regression-7',
          ask: 'The naive forecast "today will be the same as yesterday". What does this print?',
          code: `series = [100, 102, 101, 105, 110]
naive = series[:-1]        # yesterday's value, used as the forecast
actual = series[1:]
errors = [abs(a - f) for a, f in zip(actual, naive)]
print(sum(errors) / len(errors))`,
          answer: '3.0',
          why: 'The day-to-day changes are 2, 1, 4 and 5, which average 3.0. That is the MAE of the last-value baseline, computed in three lines. Any forecasting model has to beat it to be worth running.',
        },
        {
          kind: 'choice',
          id: 'evaluation-regression-8',
          ask: 'Your gradient-boosted model forecasts daily sales with an MAE of 41 units. "The same weekday last week" has an MAE of 43. What do you conclude?',
          options: [
            'The model works: 41 is a low error',
            'The model barely beats a one-line rule. Find out whether the gap is outside the noise, and what the model adds, before paying to run it',
            'The baseline is wrong: baselines should be much worse',
            'The model is overfitting',
          ],
          answer: 1,
          why: '41 means nothing alone. Next to 43 it means a 5% gain for a system that needs training, monitoring and retraining. The gain may still be real and worth it, but that has to be shown, with an error bar.',
        },
        {
          kind: 'bug',
          id: 'evaluation-regression-9',
          ask: 'The MAE of the "predict the mean" baseline, to compare a model against. The baseline comes out a little too good.',
          code: `import numpy as np

def baseline_mae(y_train, y_test):
    guess = np.mean(y_test)
    return np.mean(np.abs(y_test - guess))`,
          line: 4,
          fix: '    guess = np.mean(y_train)',
          why: 'A baseline is a model, and it follows the same rule: it may learn only from the training rows. The mean of the test targets is information no deployed predictor has.',
        },
        {
          kind: 'number',
          id: 'evaluation-regression-10',
          ask: 'Two products. True sales are 100 and 10. The forecasts are 110 and 5. What is the MAPE, as a percentage?',
          answer: 30,
          check: 'np.mean(np.abs(np.array([110, 5]) - np.array([100, 10])) / np.array([100, 10])) * 100',
          why: 'The percentage errors are 10/100 = 10% and 5/10 = 50%, which average 30%. The small product dominates, although its error of 5 units is half the other one. In units, the weighted version says 15 of 110, about 14%.',
        },
        {
          kind: 'choice',
          id: 'evaluation-regression-11',
          ask: 'A team wants to report MAPE for demand forecasts. Many products sell zero units on many days. What is the problem, and what would you use?',
          options: [
            'No problem: MAPE handles zeros',
            'MAPE divides by the true value, so it is undefined at zero and huge near it; report total absolute error ÷ total sales, or MAE next to a naive baseline',
            'MAPE is too strict; use R² only',
            'Drop the zero days and keep MAPE',
          ],
          answer: 1,
          why: 'One day with a true value of 0 breaks the average, and days with 1 or 2 units swamp it. Dropping those days hides the part of the problem that matters most for stock. The weighted version divides once, by a total that is not near zero.',
        },
        {
          kind: 'write',
          id: 'evaluation-regression-12',
          ask: 'Write MAE and RMSE for two lists of numbers, without NumPy.',
          starter: `def mae_rmse(y_true, y_pred):
    # returns (mae, rmse)
    pass`,
          solution: `def mae_rmse(y_true, y_pred):
    errors = [p - t for t, p in zip(y_true, y_pred)]
    mae = sum(abs(e) for e in errors) / len(errors)
    rmse = (sum(e * e for e in errors) / len(errors)) ** 0.5
    return mae, rmse`,
          tests: `out = mae_rmse([10, 20, 30, 40], [12, 18, 30, 50])
assert out is not None, "the function returns nothing yet"
mae, rmse = out
assert abs(mae - 3.5) < 1e-9, f"the absolute errors are 2, 2, 0 and 10, so the MAE is 3.5, got {mae}"
assert abs(rmse - 27 ** 0.5) < 1e-9, f"the squared errors average 27, so the RMSE is about 5.196, got {rmse}"
mae, rmse = mae_rmse([0, 0], [5, -5])
assert abs(mae - 5) < 1e-9 and abs(rmse - 5) < 1e-9, "errors of +5 and -5 must not cancel: both metrics are 5"
mae, rmse = mae_rmse([1, 2, 3], [1, 2, 3])
assert mae == 0 and rmse == 0, "perfect predictions give (0, 0)"`,
          why: 'One list of errors, averaged two ways. Take the absolute value or the square before averaging, never after, or errors of opposite sign cancel.',
        },
      ],
    },
    {
      id: 'evaluation-errors',
      title: 'Error analysis',
      summary: 'What to do after the metric: read the mistakes, slice the score, and choose the next fix.',
      text: [
        'A metric says how often the model is wrong. It does not say why, and "why" is what tells you what to do next. Error analysis is the habit of opening the validation set and reading the mistakes. It is the most reliable way to improve a model, and it is skipped constantly because it feels like manual work.',
        'Start with the worst: the examples with the highest loss, where the model was confident and wrong. Read fifty to a hundred. Give each a short tag for the apparent cause ("blurry photo", "sarcasm", "wrong label", "new product"), then count the tags. The count turns a pile of anecdotes into a list of priorities.',
        'The size of a tag is a ceiling on the gain. If 8% of the errors are blurry photos, fixing blur perfectly removes at most 8% of the errors. Work on what is both common and fixable. This sum takes an afternoon, and it regularly saves a month spent on the wrong problem.',
        'Then **slice**: compute the metric per segment (country, device, new against returning users, class, length of input). An average hides segments. A model at 94% overall can be at 70% for one language. Check the size of each slice before reacting, because a slice of 30 rows has a standard error of several points.',
        'Some of the worst mistakes will not be the model\'s. They are **label errors**, and confident disagreement is how you find them. In the training set, wrong labels teach the wrong thing. In the test set, they put a ceiling on the score you can measure and can change which of two models looks better. Fix the test labels first.',
        'Finally, compare training and validation error to decide the kind of fix. High error on both: the model underfits, so add features or capacity. Low on training and high on validation: it overfits, so add data or regularise. Good on validation and bad in production: the data differs, so the fix is in the data and not in the model.',
      ],
      rules: [
        'Read the highest-loss examples before changing the model.',
        'Tag each mistake, count the tags, and fix the biggest fixable group first.',
        'A tag\'s share of the errors is the most that fixing it can gain.',
        'Report metrics per segment, with the size of each segment.',
        'Confident and wrong is where label errors hide. Clean the test set first.',
        'High train error: underfitting. Low train, high validation: overfitting. Good validation, bad production: the data differs.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'evaluation-errors-1',
          ask: 'A classifier has a 10% error rate. You read 100 of its errors and tag them: 55 abbreviations the tokenizer splits badly, 12 wrong labels, 8 blurry scans, 25 other. If you fixed the abbreviation problem completely, what would the error rate be, at best? (In percent.)',
          answer: 4.5,
          check: '10 * (1 - 0.55)',
          why: '55% of the errors would go, leaving 45% of 10%: 4.5%. Perfecting the blurry scans would only reach 9.2%. Ten minutes of counting tells you which project is worth a week.',
        },
        {
          kind: 'output',
          id: 'evaluation-errors-2',
          ask: 'Ranking examples by their loss. What does this print?',
          code: `import numpy as np

y = np.array([1, 0, 1, 0, 1])
p = np.array([0.9, 0.2, 0.05, 0.6, 0.7])    # predicted probability of class 1
loss = -np.log(np.where(y == 1, p, 1 - p))
print(np.argsort(-loss)[:2])`,
          answer: '[2 3]',
          hint: 'The loss is −log of the probability given to the true class. Which rows gave the truth the lowest probability?',
          why: 'Row 2 is a positive that got 0.05: very confident and wrong. Row 3 is a negative that got 0.6, so the truth got 0.4. Those are the two largest losses, and the first two examples to open.',
        },
        {
          kind: 'bug',
          id: 'evaluation-errors-3',
          ask: 'This should return the k examples the model got most wrong. It returns the ones it got most right.',
          code: `import numpy as np

def worst(y, p, k):
    # y: 0/1 labels    p: predicted probability of class 1
    loss = -np.log(np.where(y == 1, p, 1 - p))
    return np.argsort(loss)[:k]`,
          line: 6,
          fix: '    return np.argsort(-loss)[:k]',
          why: '`argsort` sorts from smallest to largest, so the first k are the lowest losses. Negate the loss (or take the last k) to get the highest.',
        },
        {
          kind: 'choice',
          id: 'evaluation-errors-4',
          ask: 'You open the 100 highest-loss validation examples and find that 40 of them are mislabelled: the model was right. What do you do first?',
          options: [
            'Train for longer, so that the model fits those examples',
            'Delete every high-loss example from the data',
            'Correct those labels, estimate how common label errors are in the test set, and only then compare models',
            'Switch to a larger model',
          ],
          answer: 2,
          why: 'With that many wrong labels at the top, the measured error is partly the annotators\' and model comparisons are not trustworthy. Deleting all high-loss examples also throws away the hard, correctly labelled ones, which are the most useful rows you have.',
        },
        {
          kind: 'number',
          id: 'evaluation-errors-5',
          ask: 'A test set has 1,000 rows, and 50 of its labels are wrong. A model that gives the correct answer on every row would be measured at what accuracy? (In percent.)',
          answer: 95,
          check: '(1000 - 50) / 1000 * 100',
          why: 'It disagrees with the 50 wrong labels, so it scores 95%. That is the ceiling. Two models at 93% and 94% are both close to it, and their order may be decided by which one happens to copy the annotators\' mistakes.',
        },
        {
          kind: 'output',
          id: 'evaluation-errors-6',
          ask: 'Accuracy for each country. What does this print?',
          code: `rows = [("uk", 1, 1), ("uk", 0, 0), ("uk", 1, 1), ("uk", 0, 0),
        ("de", 1, 0), ("de", 0, 0)]      # (country, truth, prediction)

for country in ["uk", "de"]:
    hits = [t == p for c, t, p in rows if c == country]
    print(country, sum(hits) / len(hits), len(hits))`,
          answer: 'uk 1.0 4\nde 0.5 2',
          why: 'Overall the model is right on 5 of 6 rows, 83%. Sliced, it is perfect in one country and a coin flip in the other. The count beside each score matters as much: two rows prove nothing yet.',
        },
        {
          kind: 'choice',
          id: 'evaluation-errors-7',
          ask: 'Overall accuracy is 92%. The slice "tablet users" shows 80%, on 25 rows. What is the right reaction?',
          options: [
            'Start a project to fix tablets: 12 points is a large gap',
            'Ignore it: slices are always noisy',
            'The standard error on 25 rows is about 8 points, so the gap is suggestive at most: collect more tablet rows and look again',
            'Remove tablet users from the validation set',
          ],
          answer: 2,
          why: '√(0.8 × 0.2 / 25) = 0.08. A gap of one and a half standard errors turns up often by chance, more so when you look at many slices. It is worth a larger sample. It is not yet worth a project.',
        },
        {
          kind: 'choice',
          id: 'evaluation-errors-8',
          ask: 'These are the training and validation losses of a model over eight epochs. What kind of fix does it need?',
          chart: {
            x: 'epoch',
            y: 'loss',
            series: [
              { name: 'training', points: [0.9, 0.6, 0.4, 0.3, 0.2, 0.15, 0.1, 0.08], color: 'blue' },
              { name: 'validation', points: [0.95, 0.7, 0.55, 0.5, 0.52, 0.58, 0.66, 0.75], color: 'bad' },
            ],
          },
          options: [
            'More capacity: the model is too small',
            'More data, stronger regularisation or earlier stopping: it fits the training rows and no longer generalises',
            'A higher learning rate',
            'New labels: the test set is wrong',
          ],
          answer: 1,
          why: 'Training loss keeps falling while validation loss turns up after epoch 4. That gap is overfitting. A bigger model would widen it. Underfitting would show both curves stuck high together.',
        },
        {
          kind: 'choice',
          id: 'evaluation-errors-9',
          ask: 'A model has 2% error on training data, 3% on validation data and 15% on live traffic. Where is the problem?',
          options: [
            'The model overfits: regularise it',
            'The model underfits: make it larger',
            'The live data differs from the data you split: collect and label live examples, compare them with the validation set, and evaluate on them',
            'The learning rate is too high',
          ],
          answer: 2,
          why: 'Training and validation agree, so the model learned what the dataset has to teach. The dataset is what does not match production. No change to the model fixes that. Start by reading the live errors and making the validation set look like live traffic.',
        },
        {
          kind: 'write',
          id: 'evaluation-errors-10',
          ask: 'Write the slicing function: for each segment, return its accuracy and its number of rows.',
          starter: `def accuracy_by_segment(segments, y_true, y_pred):
    # segments: the segment name of each row
    # returns a dict: name -> (accuracy, number of rows)
    pass`,
          solution: `def accuracy_by_segment(segments, y_true, y_pred):
    hits, counts = {}, {}
    for name, t, p in zip(segments, y_true, y_pred):
        counts[name] = counts.get(name, 0) + 1
        hits[name] = hits.get(name, 0) + (1 if t == p else 0)
    return {name: (hits[name] / counts[name], counts[name]) for name in counts}`,
          tests: `segments = ["uk", "uk", "uk", "uk", "de", "de"]
y_true = [1, 0, 1, 0, 1, 0]
y_pred = [1, 0, 1, 0, 0, 0]
out = accuracy_by_segment(segments, y_true, y_pred)
assert out is not None, "the function returns nothing yet"
assert set(out) == {"uk", "de"}, f"one entry per segment expected, got {sorted(out)}"
assert tuple(out["uk"]) == (1.0, 4), f"uk: 4 of 4 right, so (1.0, 4), got {out['uk']}"
assert tuple(out["de"]) == (0.5, 2), f"de: 1 of 2 right, so (0.5, 2). Divide by the rows of the segment, not by all rows. Got {out['de']}"
one = accuracy_by_segment(["a"], [1], [0])
assert tuple(one["a"]) == (0.0, 1), "a segment with one wrong row should give (0.0, 1)"`,
          why: 'Two counters per segment. Returning the row count with the accuracy is the point: it lets the reader see at once which numbers rest on thousands of rows and which on a handful.',
        },
        {
          kind: 'design',
          id: 'evaluation-errors-11',
          ask: 'A classifier routes support tickets into 12 categories. Validation accuracy is 88% and the product team wants 93%. You have one week. How do you decide what to work on?',
          checklist: [
            { point: 'Look at the confusion matrix per class', why: 'It shows which pairs of categories are mixed up. Often two or three pairs carry most of the errors.' },
            { point: 'Read about 100 of the highest-loss errors and tag the apparent cause of each', why: 'The causes are not in any metric. Reading is the only way to see them.' },
            { point: 'Count the tags and work out the ceiling for each', why: 'The share of errors with a tag is the most that fixing it can gain. It ranks the candidate projects.' },
            { point: 'Check for wrong and ambiguous labels, and how often two people agree', why: 'If annotators agree only 93% of the time, 93% is near the ceiling and the fix is in the category definitions.' },
            { point: 'Slice accuracy by segment (channel, language, ticket length, date), with counts', why: 'A weak segment suggests a targeted fix, such as more data for one language.' },
            { point: 'Compare training and validation error', why: 'It says whether to add capacity and features (underfitting) or data and regularisation (overfitting).' },
            { point: 'Pick the largest fixable group, fix it, and measure again on the same validation set', why: 'One change at a time, on fixed data, is the only way to know what worked. The test set stays closed until the end.' },
          ],
          why: 'The week goes on whatever the errors point to, not on the idea that is most interesting. A day of reading and counting usually decides the other four.',
        },
        {
          kind: 'design',
          id: 'evaluation-errors-12',
          ask: 'An image moderation model has good metrics overall, but users in one country complain that harmless posts are being removed. How do you investigate, and what might you change?',
          checklist: [
            { point: 'Compute precision and recall for that country alone, with the number of rows and an interval', why: 'It confirms or rejects the complaint with numbers, and shows whether the slice is big enough to measure.' },
            { point: 'Check how much of the training data comes from that country', why: 'The usual cause of a weak segment is that the model has seen little of it.' },
            { point: 'Read the false positives from that country and tag them', why: 'The cause may be specific: local dress, a script the model reads as text spam, a regional event.' },
            { point: 'Audit the labels for that country', why: 'Annotators unfamiliar with a culture mislabel its content, and the model learns their mistakes.' },
            { point: 'Compare the score distributions and the precision at the current threshold across countries', why: 'One global threshold can mean a very different precision in a segment where the scores are shifted.' },
            { point: 'Collect and label more data from the segment, then retrain', why: 'More representative data fixes the cause. A per-country threshold only treats the symptom, though it can be a quick mitigation.' },
            { point: 'Add the country slice to the standard evaluation, and check the other slices after the fix', why: 'A fix for one segment can hurt another, and without a permanent slice the problem will return unnoticed.' },
          ],
          why: 'An average can be good while a group of users gets a bad product. The method is the same as for any error analysis, applied to one slice: measure, read, find the cause in the data, fix, and keep measuring.',
        },
      ],
    },
    {
      id: 'evaluation-experiments',
      title: 'Offline against online',
      summary: 'Why a better offline score is only a hypothesis, and how an A/B test checks it.',
      text: [
        'An offline metric is measured on logged data, with a metric you chose. The business cares about something else: purchases, retention, time saved. A model with a better AUC can lose online for reasons no test set can see. The offline metric may not track the business one. The model changes what users do, so the logs no longer describe them: a recommender is scored on clicks that the old recommender caused. Features that were complete in the warehouse arrive late or missing in production. And a slower, better model can lose to a faster, worse one.',
        'So an offline gain is a hypothesis and the **A/B test** is the experiment. Split users at random into control (the old model) and treatment (the new one), run both over the same period, and compare the metric you care about. Randomise by the unit that has the experience, usually the user and not the request, so that nobody sees both models and the samples are independent.',
        'Decide the sample size before starting. The maths module gave the standard error of one proportion. An experiment compares two, and the variances add: the standard error of the difference is `√(se_a² + se_b²)`. A workable rule for an 80% chance of detecting a real effect at the 5% level is `n ≈ 16 × p(1 − p) / d²` users **per group**, where p is the base rate and d the smallest absolute change worth detecting. Halve d and n quadruples. Small effects on rare events need very large experiments.',
        'Decide the length too. Run for whole weeks, since weekday and weekend users differ. Do not stop the first time the dashboard shows p < 0.05. This is **peeking**: look every day, and a test with no real effect will cross the line at some point far more often than 5% of the time. Fix the duration in advance, or use a sequential method designed for repeated looks.',
        'Early results mislead in both directions. A **novelty effect** is a lift that fades once users are used to the change. The opposite happens when people need time to learn a new layout. Look at the effect day by day before believing the average.',
        'One metric decides the test. Beside it, set **guardrail metrics** that must not get worse: latency, error rate, unsubscribes, refunds, revenue. A model that lifts clicks by 2% and complaints by 20% has not won. Write down the primary metric, the guardrails, the sample size and the duration before the test starts, because every choice made after seeing the data is another try at finding a winner.',
      ],
      rules: [
        'An offline gain is a hypothesis. The online test is the evidence.',
        'Randomise by user, and run both groups over the same period.',
        'Standard error of a difference: `√(se_a² + se_b²)`.',
        'Users per group ≈ `16 × p(1 − p) / d²`. Half the effect needs four times the users.',
        'Fix the sample size and the duration in advance, in whole weeks. Do not stop at the first significant result.',
        'Guardrail metrics must not get worse, whatever the primary metric does.',
      ],
      questions: [
        {
          kind: 'choice',
          id: 'evaluation-experiments-1',
          ask: 'A new ranking model improves offline NDCG by 4%. In the A/B test, purchases do not move. The p95 latency went from 120 ms to 400 ms. What is the most likely story?',
          options: [
            'The offline evaluation had a bug',
            'The better ranking is real, and the slower pages cost about as much as the ranking gains: test a faster version before giving up on the model',
            'A/B tests are too noisy to detect ranking changes',
            'Users dislike better results',
          ],
          answer: 1,
          why: 'Offline evaluation scores the ranking and nothing else. Online, the user gets the whole system, and waiting loses purchases. Latency is the first guardrail to check when an offline gain disappears, and it is often fixable by distilling or caching.',
        },
        {
          kind: 'choice',
          id: 'evaluation-experiments-2',
          ask: 'A new recommender suggests items the old one never showed. Evaluated on last month\'s click logs, it scores worse than the old model. Why might that be unfair to it?',
          options: [
            'Click logs are always wrong',
            'The logs only record reactions to what the old model chose to show, so the new model gets no credit for good items nobody was offered',
            'The new model has too many parameters',
            'Offline metrics are always lower than online ones',
          ],
          answer: 1,
          why: 'Logged data is shaped by the model that produced it. An item that was never shown has no clicks, whether or not users would have liked it. This feedback loop is a main reason offline and online results disagree for recommenders, and only an online test settles it.',
        },
        {
          kind: 'choice',
          id: 'evaluation-experiments-3',
          ask: 'A team switches every user to the new model on Monday. Conversion that week is 4% higher than the week before. What does that show?',
          options: [
            'The new model lifts conversion by 4%',
            'Very little: the two weeks differ in more than the model (season, marketing, a holiday). Both models have to run in the same period on randomly split users',
            'The new model lifts conversion by at least 2%',
            'The old model was broken',
          ],
          answer: 1,
          why: 'A before-and-after comparison cannot separate the model from everything else that changed. Random assignment over the same period makes the two groups alike in everything except the model, which is what lets you blame the difference on it.',
        },
        {
          kind: 'bug',
          id: 'evaluation-experiments-4',
          ask: 'This assigns traffic to the two models. Users report that the page looks different each time they reload.',
          code: `import zlib

def assign(user_id, request_id):
    # a user must get the same model on every request
    bucket = zlib.crc32(str(request_id).encode()) % 100
    return "treatment" if bucket < 50 else "control"`,
          line: 5,
          fix: '    bucket = zlib.crc32(str(user_id).encode()) % 100',
          why: 'Hashing the request puts each request in a random group, so one user sees both models. Their behaviour then reflects a mixture, and requests from the same user are not independent samples. Hash the user and the assignment is stable.',
        },
        {
          kind: 'output',
          id: 'evaluation-experiments-5',
          ask: 'The standard error of the difference between two conversion rates. What does this print?',
          code: `import math

n = 5000                       # users in each group
p_a, p_b = 0.50, 0.52          # control, treatment
se = math.sqrt(p_a * (1 - p_a) / n + p_b * (1 - p_b) / n)
print(round(se, 2), round((p_b - p_a) / se, 1))`,
          answer: '0.01 2.0',
          hint: 'Each term is about 0.25 / 5000 = 0.00005.',
          why: 'The two variances add to about 0.0001, whose root is 0.01. The lift of 0.02 is two standard errors: right at the edge of the usual 5% level. Note that the noise of the difference is √2 times the noise of either rate alone.',
        },
        {
          kind: 'number',
          id: 'evaluation-experiments-6',
          ask: 'Conversion is 10%. You want an 80% chance of detecting an absolute lift of 1 point (10% to 11%). Using n ≈ 16 × p(1 − p) / d², how many users does each group need?',
          answer: 14400,
          check: '16 * 0.1 * 0.9 / 0.01 ** 2',
          why: '16 × 0.09 / 0.0001 = 14,400 per group, so 28,800 in all. This is why a model change that moves conversion by a tenth of a point cannot be tested on a small product.',
        },
        {
          kind: 'number',
          id: 'evaluation-experiments-7',
          ask: 'Same product, conversion 10%. Now the smallest lift worth detecting is half a point (0.005). How many users does each group need?',
          answer: 57600,
          check: '16 * 0.1 * 0.9 / 0.005 ** 2',
          why: 'Half the effect, four times the users: 4 × 14,400 = 57,600. The cost of an experiment is set by the smallest effect you insist on seeing, so agree that number with the business first.',
        },
        {
          kind: 'choice',
          id: 'evaluation-experiments-8',
          ask: 'You need 14,400 users per group. 2,000 new users enter the experiment each day, split evenly. How long should it run?',
          options: [
            '8 days',
            '15 days: stop as soon as the sample is reached',
            '21 days: the sample is reached on day 15, and you round up to whole weeks',
            '7 days: one week covers every weekday',
          ],
          answer: 2,
          why: '28,800 users at 2,000 a day takes 14.4 days. Stopping on day 15 would count one weekday three times and the others twice, and weekday behaviour differs. Whole weeks keep the mix balanced.',
        },
        {
          kind: 'choice',
          id: 'evaluation-experiments-9',
          ask: 'A test was planned for 14 days. On day 4 the dashboard shows p = 0.04 in favour of the new model, and the product manager wants to ship. What is the right answer?',
          options: [
            'Ship: the result is significant',
            'Keep running to day 14. A threshold of 0.05 is only valid for one planned look, and a test checked daily crosses it by chance far more often than 5% of the time',
            'Stop the test and declare it a failure',
            'Restart the test with only the users who converted',
          ],
          answer: 1,
          why: 'Each look is another chance for noise to cross the line, and you stop on the first one that does. That is the "best of many tries" effect again. Early results are also the ones most inflated by novelty.',
        },
        {
          kind: 'choice',
          id: 'evaluation-experiments-10',
          ask: 'This is the daily lift of a redesigned home page over 14 days. Averaged over the whole test it is 3.3%. What do you tell the team?',
          chart: { x: 'day', y: 'lift over control (%)', series: [{ name: 'lift', points: [9.5, 8.1, 6.8, 5.2, 4.4, 3.1, 2.6, 1.9, 1.4, 1.0, 0.8, 0.5, 0.4, 0.3], color: 'accent' }] },
          options: [
            'The redesign lifts the metric by 3.3%',
            'The lift is a novelty effect: it has decayed to almost nothing, so the long-run gain is close to zero, not 3.3%',
            'The test is broken: the lift should be constant',
            'The redesign lifts the metric by 9.5%',
          ],
          answer: 1,
          why: 'Users explored the new page and then went back to their habits. The average is dominated by the first days. The honest estimate is the level the curve settles at, which you can only see by plotting the effect over time.',
        },
        {
          kind: 'choice',
          id: 'evaluation-experiments-11',
          ask: 'A new email-ranking model lifts click-through by 3%, with a clear margin. Unsubscribes, a guardrail metric, are up 15%, also with a clear margin. What is the decision?',
          options: [
            'Ship: the primary metric won',
            'Do not ship: a guardrail was broken. Work out what the model is doing to earn those clicks',
            'Run the test again until the guardrail passes',
            'Drop the guardrail from the next test',
          ],
          answer: 1,
          why: 'Guardrails exist for this case: a short-term metric improved by something that damages the product. Each unsubscribed user is lost to every future email. Re-running until it passes is peeking by another name.',
        },
        {
          kind: 'design',
          id: 'evaluation-experiments-12',
          ask: 'Your team has a new recommendation model that beats the current one offline. Plan the online test that decides whether it ships.',
          checklist: [
            { point: 'One primary metric tied to the business, chosen in advance', why: 'With several candidate metrics, one of them will look good by chance. Name the one that decides.' },
            { point: 'Guardrail metrics: latency, errors, unsubscribes or complaints, revenue', why: 'They catch a win on the primary metric that was bought with harm elsewhere.' },
            { point: 'Randomise by user, with a stable assignment', why: 'A user who sees both models contaminates both groups, and requests from one user are not independent.' },
            { point: 'Compute the sample size from the base rate and the smallest effect worth shipping', why: 'It tells you before you start whether the test can detect anything, and how long it must run.' },
            { point: 'Fix the duration in whole weeks, and do not stop early on a significant result', why: 'Weekly cycles bias a partial week, and peeking inflates false positives.' },
            { point: 'Start with a small share of traffic, and check that the split is the size you intended', why: 'A ramp catches crashes cheaply. A split that is not 50/50 when it should be means the assignment or the logging is broken.' },
            { point: 'Look at the effect by day and by segment', why: 'A fading lift is novelty. A gain in one segment and a loss in another may call for a different decision than the average.' },
            { point: 'Write down the decision rule, including what happens if the result is flat', why: 'Deciding after seeing the data invites motivated reasoning. A flat result with higher serving cost is a "no".' },
          ],
          why: 'The plan is written before the test because every choice left open is a choice that will be made with the results in view. The offline score earned the model a test. Only the test can earn it the traffic.',
        },
      ],
    },
    {
      id: 'evaluation-lab',
      title: 'Lab: an evaluation report for a binary classifier',
      summary: 'Build, from labels and scores, the report you would want before a classifier ships.',
      text: [
        'One accuracy figure is not an evaluation. This lab builds the report you would hand to a team before a binary classifier ships: the confusion counts at a threshold, precision, recall and F1, the trade-off across thresholds, one number for ranking quality, a threshold chosen from costs, an error bar, and a comparison with a model that does nothing.',
        'The inputs are the same throughout: `y_true`, a list of 0/1 labels, and `scores`, the model\'s score for each row. A row is flagged when its score is at or above the threshold. Everything is plain Python, so that you can see what the library calls do. Each step is small, and later steps start with the earlier functions already written.',
        'The rows must be held out. Choose the threshold on validation data and produce the final report on test data, once. One of the steps is about exactly that.',
        'In real work you would call scikit-learn for most of this. Writing it once by hand is what lets you read such a report critically, and notice the one that quotes accuracy on a 2% positive class with no interval and no baseline.',
      ],
      rules: [
        'State the threshold, the four counts, and precision and recall. Never accuracy alone.',
        'Show the trade-off across thresholds, and one number that does not depend on a threshold.',
        'Choose the threshold from the cost of each error, on validation data.',
        'Put an interval on every headline number. The bootstrap gives one for any metric.',
        'Compare with the baseline that does nothing.',
      ],
      questions: [
        {
          kind: 'write',
          id: 'evaluation-lab-1',
          ask: 'Step 1. Count the four outcomes at a threshold. A row is flagged when its score is at or above the threshold.',
          starter: `def confusion_counts(y_true, scores, threshold):
    # returns (tp, fp, fn, tn)
    pass`,
          solution: `def confusion_counts(y_true, scores, threshold):
    tp = fp = fn = tn = 0
    for t, s in zip(y_true, scores):
        flagged = s >= threshold
        if flagged and t == 1:
            tp += 1
        elif flagged:
            fp += 1
        elif t == 1:
            fn += 1
        else:
            tn += 1
    return tp, fp, fn, tn`,
          tests: `y_true = [1, 1, 0, 1, 0, 0]
scores = [0.9, 0.8, 0.7, 0.6, 0.4, 0.2]
out = confusion_counts(y_true, scores, 0.5)
assert out is not None, "the function returns nothing yet"
assert tuple(out) == (3, 1, 0, 2), f"at 0.5 the first four rows are flagged: (tp, fp, fn, tn) = (3, 1, 0, 2), got {out}"
assert tuple(confusion_counts(y_true, scores, 0.8)) == (2, 0, 1, 3), "a score equal to the threshold is flagged: at 0.8 expect (2, 0, 1, 3)"
assert tuple(confusion_counts(y_true, scores, 1.0)) == (0, 0, 3, 3), "above every score nothing is flagged: (0, 0, 3, 3)"
assert sum(confusion_counts(y_true, scores, 0.3)) == 6, "the four counts must add up to the number of rows"`,
          why: 'Every row lands in exactly one of four cells, decided by two yes/no facts: was it flagged, and was it positive. Everything else in the report is built from these counts.',
        },
        {
          kind: 'write',
          id: 'evaluation-lab-2',
          ask: 'Step 2. Turn the counts into precision, recall and F1. A ratio with a zero denominator is 0.0.',
          starter: `def prf(tp, fp, fn):
    # returns (precision, recall, f1)
    pass`,
          solution: `def prf(tp, fp, fn):
    precision = tp / (tp + fp) if tp + fp else 0.0
    recall = tp / (tp + fn) if tp + fn else 0.0
    f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
    return precision, recall, f1`,
          tests: `out = prf(3, 1, 0)
assert out is not None, "the function returns nothing yet"
p, r, f = out
assert abs(p - 0.75) < 1e-9, f"3 true positives among 4 flags: precision 0.75, got {p}"
assert abs(r - 1.0) < 1e-9, f"no positives missed: recall 1.0, got {r}"
assert abs(f - 6 / 7) < 1e-9, f"F1 = 2PR / (P + R) = 0.857, got {f}"
p, r, f = prf(2, 0, 1)
assert abs(p - 1.0) < 1e-9 and abs(r - 2 / 3) < 1e-9 and abs(f - 0.8) < 1e-9, "prf(2, 0, 1) should be (1.0, 0.667, 0.8)"
try:
    nothing = prf(0, 0, 3)
except ZeroDivisionError:
    raise AssertionError("with nothing flagged, TP + FP is zero: return 0.0 instead of dividing")
assert tuple(nothing) == (0.0, 0.0, 0.0), "with no true positives all three are 0.0"`,
          why: 'True negatives are not an input. That is the property that keeps these three numbers honest when negatives are 99% of the data.',
        },
        {
          kind: 'write',
          id: 'evaluation-lab-3',
          ask: 'Step 3. Compute the precision-recall points. Use every distinct score as a threshold, from the highest down, and return a list of `(threshold, precision, recall)`.',
          starter: `def confusion_counts(y_true, scores, threshold):
    tp = sum(1 for t, s in zip(y_true, scores) if s >= threshold and t == 1)
    fp = sum(1 for t, s in zip(y_true, scores) if s >= threshold and t == 0)
    fn = sum(1 for t, s in zip(y_true, scores) if s < threshold and t == 1)
    tn = sum(1 for t, s in zip(y_true, scores) if s < threshold and t == 0)
    return tp, fp, fn, tn

def pr_points(y_true, scores):
    # one (threshold, precision, recall) per distinct score, highest threshold first
    pass`,
          solution: `def confusion_counts(y_true, scores, threshold):
    tp = sum(1 for t, s in zip(y_true, scores) if s >= threshold and t == 1)
    fp = sum(1 for t, s in zip(y_true, scores) if s >= threshold and t == 0)
    fn = sum(1 for t, s in zip(y_true, scores) if s < threshold and t == 1)
    tn = sum(1 for t, s in zip(y_true, scores) if s < threshold and t == 0)
    return tp, fp, fn, tn

def pr_points(y_true, scores):
    points = []
    for threshold in sorted(set(scores), reverse=True):
        tp, fp, fn, tn = confusion_counts(y_true, scores, threshold)
        points.append((threshold, tp / (tp + fp), tp / (tp + fn)))
    return points`,
          tests: `y_true = [1, 1, 0, 1, 0, 0]
scores = [0.9, 0.8, 0.7, 0.6, 0.4, 0.2]
out = pr_points(y_true, scores)
assert out is not None, "the function returns nothing yet"
assert len(out) == 6, f"six distinct scores give six points, got {len(out)}"
assert [p[0] for p in out] == [0.9, 0.8, 0.7, 0.6, 0.4, 0.2], "the thresholds should run from the highest score down"
want = [(1, 1 / 3), (1, 2 / 3), (2 / 3, 2 / 3), (0.75, 1), (0.6, 1), (0.5, 1)]
for (t, p, r), (wp, wr) in zip(out, want):
    assert abs(p - wp) < 1e-9, f"at threshold {t} the precision should be {wp:.3f}, got {p}"
    assert abs(r - wr) < 1e-9, f"at threshold {t} the recall should be {wr:.3f}, got {r}"
tied = pr_points([1, 0, 0], [0.5, 0.5, 0.1])
assert len(tied) == 2, "rows with the same score share one threshold: two points expected"
assert abs(tied[0][1] - 0.5) < 1e-9 and abs(tied[0][2] - 1.0) < 1e-9, "at 0.5 both tied rows are flagged: precision 0.5, recall 1.0"`,
          why: 'Lowering the threshold one score at a time flags one more group of rows, so recall can only rise while precision wanders. At the highest score at least one row is flagged, so the precision is always defined. This list is the precision-recall curve.',
        },
        {
          kind: 'write',
          id: 'evaluation-lab-4',
          ask: 'Step 4. Summarise the curve in one number, the average precision: go down the points and add `(recall − previous recall) × precision`, starting from a recall of 0.',
          starter: `def average_precision(points):
    # points: (threshold, precision, recall), highest threshold first, as made by pr_points
    pass`,
          solution: `def average_precision(points):
    total, previous = 0.0, 0.0
    for _, precision, recall in points:
        total += (recall - previous) * precision
        previous = recall
    return total`,
          tests: `points = [(0.9, 1, 1 / 3), (0.8, 1, 2 / 3), (0.7, 2 / 3, 2 / 3), (0.6, 0.75, 1), (0.4, 0.6, 1), (0.2, 0.5, 1)]
out = average_precision(points)
assert out is not None, "the function returns nothing yet"
assert abs(out - 11 / 12) < 1e-9, f"1/3 x 1 + 1/3 x 1 + 1/3 x 0.75 = 0.917, got {out}"
assert abs(average_precision([(0.9, 1.0, 0.5), (0.8, 1.0, 1.0), (0.1, 0.5, 1.0)]) - 1.0) < 1e-9, "when every positive outranks every negative the average precision is 1.0"
assert abs(average_precision([(0.5, 0.25, 1.0)]) - 0.25) < 1e-9, "a constant score flags everything at once: the result is the share of positives"`,
          why: 'Each positive that is found adds a step of recall, weighted by the precision at that moment. Steps that only add false positives add nothing, because recall does not move. This is the sum scikit-learn computes in `average_precision_score`. Its baseline is the share of positives.',
        },
        {
          kind: 'write',
          id: 'evaluation-lab-5',
          ask: 'Step 5. Choose the threshold from costs. Try every distinct score, and also `float("inf")` (flag nothing). Return `(threshold, cost)` for the lowest total cost `fp × cost_fp + fn × cost_fn`. If two thresholds tie, return the higher one.',
          starter: `def confusion_counts(y_true, scores, threshold):
    tp = sum(1 for t, s in zip(y_true, scores) if s >= threshold and t == 1)
    fp = sum(1 for t, s in zip(y_true, scores) if s >= threshold and t == 0)
    fn = sum(1 for t, s in zip(y_true, scores) if s < threshold and t == 1)
    tn = sum(1 for t, s in zip(y_true, scores) if s < threshold and t == 0)
    return tp, fp, fn, tn

def best_threshold(y_true, scores, cost_fp, cost_fn):
    # returns (threshold, total cost)
    pass`,
          solution: `def confusion_counts(y_true, scores, threshold):
    tp = sum(1 for t, s in zip(y_true, scores) if s >= threshold and t == 1)
    fp = sum(1 for t, s in zip(y_true, scores) if s >= threshold and t == 0)
    fn = sum(1 for t, s in zip(y_true, scores) if s < threshold and t == 1)
    tn = sum(1 for t, s in zip(y_true, scores) if s < threshold and t == 0)
    return tp, fp, fn, tn

def best_threshold(y_true, scores, cost_fp, cost_fn):
    best = None
    for threshold in [float("inf")] + sorted(set(scores), reverse=True):
        tp, fp, fn, tn = confusion_counts(y_true, scores, threshold)
        cost = fp * cost_fp + fn * cost_fn
        if best is None or cost < best[1]:
            best = (threshold, cost)
    return best`,
          tests: `y_true = [1, 1, 0, 1, 0, 0]
scores = [0.9, 0.8, 0.7, 0.6, 0.4, 0.2]
out = best_threshold(y_true, scores, 1, 5)
assert out is not None, "the function returns nothing yet"
assert tuple(out) == (0.6, 1), f"when a miss costs 5, flag down to 0.6: one false positive, total cost 1. Got {out}"
assert tuple(best_threshold(y_true, scores, 5, 1)) == (0.8, 1), "when a false alarm costs 5, stop at 0.8: one miss, total cost 1"
assert tuple(best_threshold(y_true, scores, 1, 1)) == (0.8, 1), "0.8 and 0.6 both cost 1 at equal costs: return the higher threshold"
assert tuple(best_threshold([0, 0], [0.3, 0.6], 1, 1)) == (float("inf"), 0), "with no positives the cheapest choice is to flag nothing: (inf, 0)"`,
          why: 'The same model gets a different threshold for each cost ratio: expensive misses pull it down, expensive false alarms push it up. Nothing here assumes the scores are calibrated, because the costs are counted on real outcomes.',
        },
        {
          kind: 'bug',
          id: 'evaluation-lab-6',
          ask: 'Step 6. Put the pieces together on real splits. The cost this prints is lower than the model will achieve in production. Which line is wrong?',
          code: `val_y, val_s, test_y, test_s = load_splits()

threshold, _ = best_threshold(test_y, test_s, cost_fp=1, cost_fn=5)
tp, fp, fn, tn = confusion_counts(test_y, test_s, threshold)
print("threshold:", threshold)
print("cost on test:", fp * 1 + fn * 5)`,
          line: 3,
          fix: 'threshold, _ = best_threshold(val_y, val_s, cost_fp=1, cost_fn=5)',
          why: 'The threshold is a tuned setting. Chosen on the test rows, it is the best of many tries on those rows, and the reported cost is optimistic. Tune it on validation data, then measure once on test.',
        },
        {
          kind: 'write',
          id: 'evaluation-lab-7',
          ask: 'Step 7. Put an interval on any metric with the bootstrap. Repeat `n_boot` times: draw n row numbers at random with replacement, and compute the metric on those rows. Sort the results and return the values at positions `int(0.025 * n_boot)` and `int(0.975 * n_boot)`.',
          starter: `import random

def bootstrap_interval(y_true, y_pred, metric, n_boot=1000, seed=0):
    # metric(y_true, y_pred) returns a number; returns (low, high)
    rng = random.Random(seed)
    pass`,
          solution: `import random

def bootstrap_interval(y_true, y_pred, metric, n_boot=1000, seed=0):
    rng = random.Random(seed)
    n = len(y_true)
    values = []
    for _ in range(n_boot):
        rows = [rng.randrange(n) for _ in range(n)]
        values.append(metric([y_true[i] for i in rows], [y_pred[i] for i in rows]))
    values.sort()
    return values[int(0.025 * n_boot)], values[int(0.975 * n_boot)]`,
          tests: `def accuracy(y_true, y_pred):
    return sum(t == p for t, p in zip(y_true, y_pred)) / len(y_true)

y_true = [1, 0] * 200
y_pred = y_true[:320] + [1 - t for t in y_true[320:]]      # 320 of 400 right
out = bootstrap_interval(y_true, y_pred, accuracy)
assert out is not None, "the function returns nothing yet"
low, high = out
assert low < 0.8 < high, f"the interval should contain the measured accuracy of 0.8, got {out}. Resample whole rows: a label must stay with its prediction"
assert abs(low - 0.76) < 0.02 and abs(high - 0.84) < 0.02, f"for 320 right out of 400 the interval is about (0.76, 0.84), got {out}"
s_low, s_high = bootstrap_interval(y_true[300:340], y_pred[300:340], accuracy)
assert s_high - s_low > 2 * (high - low), "with a tenth of the rows the interval should be about three times wider"
assert tuple(bootstrap_interval([1, 0, 1], [1, 0, 1], accuracy, n_boot=50)) == (1.0, 1.0), "if every row is right, every resample is right: (1.0, 1.0)"
assert tuple(bootstrap_interval([1, 0], [1, 1], lambda t, p: 0.3, n_boot=20)) == (0.3, 0.3), "call the metric that was passed in"`,
          why: 'Resampling the rows imitates drawing a new test set, and the spread of the metric over the resamples is its uncertainty. For accuracy it agrees with the formula from the maths module. Its value is that it works unchanged for F1, average precision or any metric with no formula.',
        },
        {
          kind: 'write',
          id: 'evaluation-lab-8',
          ask: 'Step 8. Assemble the report at a threshold: the four counts, precision, recall, F1, accuracy, and `baseline_accuracy`, the accuracy of always predicting the more common class.',
          starter: `def confusion_counts(y_true, scores, threshold):
    tp = sum(1 for t, s in zip(y_true, scores) if s >= threshold and t == 1)
    fp = sum(1 for t, s in zip(y_true, scores) if s >= threshold and t == 0)
    fn = sum(1 for t, s in zip(y_true, scores) if s < threshold and t == 1)
    tn = sum(1 for t, s in zip(y_true, scores) if s < threshold and t == 0)
    return tp, fp, fn, tn

def prf(tp, fp, fn):
    precision = tp / (tp + fp) if tp + fp else 0.0
    recall = tp / (tp + fn) if tp + fn else 0.0
    f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
    return precision, recall, f1

def report(y_true, scores, threshold):
    # returns a dict with the keys: tp, fp, fn, tn, precision, recall, f1, accuracy, baseline_accuracy
    pass`,
          solution: `def confusion_counts(y_true, scores, threshold):
    tp = sum(1 for t, s in zip(y_true, scores) if s >= threshold and t == 1)
    fp = sum(1 for t, s in zip(y_true, scores) if s >= threshold and t == 0)
    fn = sum(1 for t, s in zip(y_true, scores) if s < threshold and t == 1)
    tn = sum(1 for t, s in zip(y_true, scores) if s < threshold and t == 0)
    return tp, fp, fn, tn

def prf(tp, fp, fn):
    precision = tp / (tp + fp) if tp + fp else 0.0
    recall = tp / (tp + fn) if tp + fn else 0.0
    f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
    return precision, recall, f1

def report(y_true, scores, threshold):
    tp, fp, fn, tn = confusion_counts(y_true, scores, threshold)
    precision, recall, f1 = prf(tp, fp, fn)
    n = len(y_true)
    positives = sum(y_true)
    return {
        "tp": tp, "fp": fp, "fn": fn, "tn": tn,
        "precision": precision, "recall": recall, "f1": f1,
        "accuracy": (tp + tn) / n,
        "baseline_accuracy": max(positives, n - positives) / n,
    }`,
          tests: `y_true = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1]
scores = [0.1, 0.2, 0.2, 0.3, 0.3, 0.4, 0.6, 0.7, 0.4, 0.9]
out = report(y_true, scores, 0.5)
assert out is not None, "the function returns nothing yet"
for key in ["tp", "fp", "fn", "tn", "precision", "recall", "f1", "accuracy", "baseline_accuracy"]:
    assert key in out, f"the report is missing the key {key!r}"
assert (out["tp"], out["fp"], out["fn"], out["tn"]) == (1, 2, 1, 6), f"the counts at 0.5 should be tp 1, fp 2, fn 1, tn 6, got {out}"
assert abs(out["precision"] - 1 / 3) < 1e-9 and abs(out["recall"] - 0.5) < 1e-9, "precision should be 1/3 and recall 0.5"
assert abs(out["f1"] - 0.4) < 1e-9, f"F1 should be 0.4, got {out['f1']}"
assert abs(out["accuracy"] - 0.7) < 1e-9, f"7 of 10 rows are right: accuracy 0.7, got {out['accuracy']}"
assert abs(out["baseline_accuracy"] - 0.8) < 1e-9, f"always saying 0 is right on 8 of 10 rows: 0.8, got {out['baseline_accuracy']}"
flipped = report([1, 1, 1, 0], [0.9, 0.8, 0.7, 0.1], 0.5)
assert abs(flipped["baseline_accuracy"] - 0.75) < 1e-9, "the baseline predicts the more common class, which can be class 1"`,
          why: 'On the test data the model\'s accuracy (0.7) is below the do-nothing baseline (0.8), yet it finds half the positives and the baseline finds none. Seeing both numbers side by side is what stops a reader from being impressed, or dismayed, by accuracy alone.',
        },
        {
          kind: 'design',
          id: 'evaluation-lab-9',
          ask: 'Step 9. The numbers are computed. The report now goes to the people who decide whether the model ships. What else must it say, beyond what these functions return?',
          checklist: [
            { point: 'Which rows were used: how the data was split, the time period, and that the test set was used once', why: 'Every number depends on the split. A reader cannot judge a score without knowing whether the rows copy production.' },
            { point: 'The number of rows and of positives, and an interval on each headline metric', why: 'A recall measured on 40 positives is a wide range, not a number.' },
            { point: 'The threshold, the costs behind it, and the data it was chosen on', why: 'Precision and recall belong to a threshold. The reader should see that it follows from the product\'s costs.' },
            { point: 'A comparison on the same rows with a baseline and with the model in production', why: 'The decision is "better than what we have?", and only a comparison on identical rows answers it.' },
            { point: 'Metrics by segment, with the size of each', why: 'An average can hide a group of users for whom the model is much worse.' },
            { point: 'A reliability table, if the probabilities are used as numbers', why: 'Ranking metrics say nothing about whether 0.8 means 80%.' },
            { point: 'Examples of the worst errors and what they have in common', why: 'They tell the team how the model fails, which no table does, and what to fix next.' },
            { point: 'What offline numbers cannot show, and the plan for an online test', why: 'Latency, feedback loops and user behaviour only appear in production. The report earns the model a test.' },
          ],
          why: 'A report is an argument that a model is fit for a purpose. The metrics are its evidence. The split, the baseline, the intervals and the known weaknesses are what make that evidence believable.',
        },
      ],
    },
  ],
}
