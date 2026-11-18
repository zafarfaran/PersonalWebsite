import type { Block } from '../../types'

/** The full theory for each lesson of the evaluation module, keyed by lesson id. */
export const evaluationTheory: Record<string, Block[]> = {
  'evaluation-splits': [
    { h: 'Why you hold data back' },
    'A model learns from examples. Each example is a **row**: the inputs, called **features**, and the answer you want, called the **label**. The point is good answers on rows it has never seen, such as a new patient.',
    'So that is where you have to measure it. A model can score perfectly on the rows it learned from by remembering them, the way a student who has seen the exam paper can score full marks without understanding anything. To get an honest score you keep some rows aside, out of sight, and test on those.',
    { sub: 'Three sets with three jobs' },
    {
      list: [
        'The **training set** is what the model learns from. Fitting the model sets its internal numbers, called **weights**, from these rows.',
        'The **validation set** is for every decision you make along the way: which kind of model, which features, which settings, when to stop training. Settings you choose yourself, rather than ones the model learns, are called **hyperparameters**.',
        'The **test set** is opened once, at the very end, to estimate how the chosen model will do in real use (**production**).',
      ],
    },
    'The reason for keeping validation and test apart: as soon as you pick a winner because it scored best on a set, that set has helped pick it, and its score flatters the winner. The test set stays honest only if nothing was ever chosen by it.',

    { h: 'Choosing how to cut' },
    'The rule behind every split: **cut the data the way production will cut it**. The test rows should be as new to the model as real future rows will be.',
    { sub: 'Random and stratified splits' },
    'A **random** split shuffles the rows and sends a fraction to each side. It is right when rows are independent of each other and the future looks like the past.',
    'When one class is rare, a random split can be unlucky. Say 40 rows hold 8 positives (the rare class you care about, such as "fraud"). A random 10-row test set could hold 0 of them, and you cannot measure how well the model finds positives with none to find. A **stratified** split keeps the share of each class the same on both sides.',
    {
      code: `from sklearn.model_selection import train_test_split

y = [0] * 32 + [1] * 8
X = list(range(40))
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, stratify=y, random_state=1)
print(len(y_tr), sum(y_tr))
print(len(y_te), sum(y_te))`,
      out: `30 6
10 2`,
    },
    '`test_size=0.25` sends a quarter of the rows to the test side. `stratify=y` tells the function to keep the class shares: 8 positives out of 40 is 20%, and 20% of 10 test rows is 2. `random_state` fixes the shuffle so that the split is the same every run. Since the labels are 0 or 1, `sum` counts the positives.',
    { sub: 'Splitting by group' },
    'Sometimes several rows belong together: ten scans of one patient, a hundred sessions of one user, readings from one machine. These rows look alike. If some go to training and others to test, the model can score well by recognising the patient rather than by learning the disease. Split **by group** instead: every row of a group goes to the same side.',
    {
      code: `from sklearn.model_selection import GroupShuffleSplit

X = list(range(8))
users = ["ann", "ann", "ben", "ben", "cat", "cat", "dan", "dan"]
splitter = GroupShuffleSplit(n_splits=1, test_size=0.25, random_state=0)
train_idx, test_idx = next(splitter.split(X, groups=users))
print(train_idx, test_idx)`,
      out: '[0 1 2 3 6 7] [4 5]',
    },
    'The splitter returns **row numbers** (indices), not the rows. A quarter of the four users, so one user, went to the test side, with both of their rows. `next(...)` takes the first split from the splitter, which can produce several.',
    { sub: 'Splitting by time' },
    'When the model predicts the future, train on the past and test on what came after. A random split mixes the days, so the model is tested on a Tuesday after training on the Monday and the Wednesday around it. In production there is no Wednesday yet. To split by time, sort the rows by date and cut once, so that every training row is earlier than every test row.',
    {
      code: `days = ["2024-03-02", "2024-01-15", "2024-02-20", "2024-01-03", "2024-03-10"]
order = sorted(range(len(days)), key=lambda i: days[i])
print(order)
print(order[:3], order[3:])`,
      out: `[3, 1, 2, 0, 4]
[3, 1, 2] [0, 4]`,
    },
    '`sorted(range(n), key=...)` sorts the row numbers by each row\'s date, so you keep track of which row is which. The two latest rows, 0 and 4, form the test side.',
    'One more time trap: some labels take a while to arrive. Whether a loan defaults within a year is only known a year later. Rows too recent for their outcome to be known should be left out, or they get counted as "no default" by mistake.',

    { h: 'Leakage' },
    '**Leakage** is any route by which information from the validation or test rows reaches training. The symptom is a score that looks too good, then a model that disappoints in production. The common routes:',
    {
      list: [
        '**Duplicates** on both sides. The model answers those test rows from memory. Remove duplicates before splitting.',
        '**Preprocessing fitted on all the data.** A scaler learns the mean and spread of a column; an imputer learns what to fill gaps with. Fitted before the split, they have seen the test rows. Fit them on the training rows only, then apply them to the rest.',
        '**Features known only after the outcome.** A column that is filled in because the event already happened hands the model the answer. Ask of every feature: would I have this value at the moment I make the prediction?',
        '**A group or a time period cut in two**, as above.',
      ],
    },
    { sub: 'A one-line check for groups' },
    'Python sets have an intersection operator `&` that keeps the items found in both. Applied to the groups on each side of a split, it should give an empty set.',
    {
      code: `train_patients = {"p1", "p2", "p3"}
test_patients = {"p4", "p5"}
print(train_patients & test_patients)`,
      out: 'set()',
    },
    '`set()` is how Python prints an empty set. Any name that appears there is a group on both sides.',

    { h: 'How big each set should be' },
    'The test set must be large enough that its score means something. The **standard error** from the maths module measures how much a score jumps around by chance, and it shrinks as the rows grow. With millions of rows, 1% can be plenty. With a thousand, cross-validation (the next lesson) is the better tool.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Choosing the best model by its test score.',
        'Trusting a bigger random test set when the real problem is groups or time. It measures the wrong thing more precisely.',
        'Reporting the easy number when the split that copies production gives a worse one.',
        'Celebrating a near-perfect score on a hard problem. Look for a leak first.',
      ],
    },
  ],

  'evaluation-crossval': [
    { h: 'The trouble with one split' },
    'A single validation set gives you one number. On a small dataset that number depends a lot on which rows happened to land in it. Cut the data a different way and the score might move by several points. You cannot tell from one number whether a new model is better or whether it got a kinder set of rows.',
    '**Cross-validation** fixes this by using every row for validation once, and giving you several scores instead of one.',

    { h: 'How k-fold works' },
    'Cut the rows into k equal parts, called **folds**. Then run k rounds. In each round one fold is the validation set and the model trains on the other k − 1 folds together. Each round trains a fresh model from scratch.',
    { sub: 'The arithmetic of folds' },
    'Take 600 rows and k = 3. Each fold holds 600 ÷ 3 = 200 rows. In each round the model trains on the other two folds, 400 rows, and is scored on 200. After three rounds every row has been validated exactly once and used for training twice.',
    'In general, each fold holds n ÷ k rows and each model trains on n − n ÷ k of them. When n does not divide evenly, some folds get one extra row: with 7 rows and 3 folds the sizes are 3, 2, 2, the first folds taking the spare rows.',
    {
      code: `from sklearn.model_selection import KFold

X = list(range(7))
for train_idx, val_idx in KFold(n_splits=3).split(X):
    print(train_idx, val_idx)`,
      out: `[3 4 5 6] [0 1 2]
[0 1 2 5 6] [3 4]
[0 1 2 3 4] [5 6]`,
    },
    'Each line is one round: the training row numbers, then the validation row numbers. Without `shuffle=True`, `KFold` takes the folds as **consecutive blocks** in the order the rows arrive. That is a problem if the rows are sorted, for example all of one class first: a validation block can then hold only one class. Pass `shuffle=True, random_state=0` to mix the rows first.',
    { sub: 'Choosing the splitter' },
    'The splitting rules of the previous lesson still apply inside cross-validation:',
    {
      list: [
        '`StratifiedKFold` keeps the class shares the same in every fold. Use it when a class is rare.',
        '`GroupKFold` keeps every group (a patient, a user, a machine) inside one fold, so each fold tests on unseen groups.',
        '`TimeSeriesSplit` always validates on rows later than the training rows, for forecasting.',
      ],
    },

    { h: 'Reading the scores' },
    'You now have k scores. Their **mean** (average) is your estimate. Their spread tells you how far to trust it. The spread is measured by the **standard deviation**: take each score\'s distance from the mean, square it, average the squares, then take the square root. A rough error bar on the mean is the standard deviation divided by √k.',
    { sub: 'A worked example' },
    'Five fold accuracies: 0.60, 0.65, 0.70, 0.65, 0.60. The mean is 3.20 ÷ 5 = 0.64. The distances from the mean are 0.04, 0.01, 0.06, 0.01, 0.04. Their squares add to 0.0070, and the average of the squares is 0.0014. The square root of that is about 0.037. Divide by √5 ≈ 2.24 and the error bar is about 0.017. You report "0.64 ± 0.017".',
    {
      code: `import numpy as np

scores = np.array([0.60, 0.65, 0.70, 0.65, 0.60])
print(round(float(scores.mean()), 2), round(float(scores.std()), 3), round(float(scores.std() / np.sqrt(5)), 3))`,
      out: '0.64 0.037 0.017',
    },
    'A rival model scoring 0.65 sits inside that error bar, so you have not shown it is better. The bar is a rule of thumb: the folds share most of their training rows, so they are not truly independent. It is still enough to stop you celebrating a gain smaller than the noise.',
    'k is usually 5 or 10. More folds means each model trains on more rows, but each score is measured on fewer rows, so the individual fold scores scatter more. Their mean stays about the same. That is why one fold score on its own is weak evidence.',

    { h: 'Keeping preprocessing inside the fold' },
    'Anything that learns from data must be fitted on the training folds only, in every round. That includes scalers, imputers, and **feature selection**, which means keeping the columns that look most related to the label. The tool for this is a **pipeline**: a chain of steps that is fitted as one model, so that every step is refitted inside each fold.',
    {
      code: `from sklearn.datasets import make_classification
from sklearn.model_selection import cross_val_score, StratifiedKFold
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

X, y = make_classification(n_samples=300, n_features=10, random_state=0)
model = make_pipeline(StandardScaler(), LogisticRegression())
scores = cross_val_score(model, X, y, cv=StratifiedKFold(n_splits=5, shuffle=True, random_state=0))
print(scores.round(2))`,
      out: '[0.97 0.93 0.92 0.92 0.92]',
    },
    '`make_classification` makes a synthetic dataset. `cross_val_score` runs all the rounds and returns one score per fold.',
    { sub: 'What happens if you select features first' },
    'Here the features are pure random noise with random labels, so no honest method can beat 50%. Selecting 20 of 2,000 columns on all the rows, then cross-validating, still looks good, because by chance some noise columns line up with these particular labels, validation rows included.',
    {
      code: `import numpy as np
from sklearn.feature_selection import SelectKBest, f_classif
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.linear_model import LogisticRegression

rng = np.random.default_rng(4)
X, y = rng.normal(size=(100, 2000)), rng.integers(0, 2, size=100)
X_bad = SelectKBest(f_classif, k=20).fit_transform(X, y)
print(round(cross_val_score(LogisticRegression(), X_bad, y, cv=5).mean(), 2))
good = make_pipeline(SelectKBest(f_classif, k=20), LogisticRegression())
print(round(cross_val_score(good, X, y, cv=5).mean(), 2))`,
      out: `0.83
0.5`,
    },

    { h: 'The best of many is optimistic' },
    'Every score is the true quality plus some luck. Try 50 settings and keep the top scorer, and you have partly picked the best setting and partly the luckiest one. The more options you compare, the more the winning score overstates what the winner will really do. The choice can still be sensible; it is the number you should not quote.',
    'This is why the **test set is used once**. Use it to choose between options, even a handful of times, and it becomes one more validation set with an optimistic score.',
    { sub: 'Nested cross-validation' },
    'With little data and lots of tuning, there may be nothing spare for a test set. **Nested cross-validation** runs two loops. The outer loop splits the data into folds. Inside each outer training part, an inner cross-validation does the whole tuning search. The winner of that search is then scored on the outer fold, which the tuning never saw. The result measures the procedure "tune, then predict", which is what you will actually ship. In everyday work with enough data, the cheaper route is fine: tune by cross-validation on the training data, then score the final model once on a held-out test set.',

    { h: 'Mistakes to avoid' },
    {
      list: [
        'Reporting the mean without the spread.',
        'Using unshuffled `KFold` on rows sorted by class or by anything else.',
        'Fitting a scaler or choosing features on all the rows before cross-validating.',
        'Scattering a group across folds with plain `KFold` when rows share a patient or machine.',
        'Quoting the best score of a big search as the expected performance.',
      ],
    },
  ],

  'evaluation-metrics': [
    { h: 'Why accuracy is not enough' },
    'A **classifier** is a model that puts each row into a class, such as "fraud" or "not fraud". When there are two classes, the one you are looking for is called **positive** (labelled 1) and the other **negative** (labelled 0). A **metric** is the number you use to say how good the model is.',
    '**Accuracy** is the share of predictions that are right. It is the obvious metric, and it breaks as soon as one class is much rarer than the other. Take 2,000 card transactions of which 20 are fraud. A model that always answers "not fraud" is right 1,980 times: 99% accuracy, and it catches no fraud at all. Before being impressed by an accuracy, compare it with the share of the biggest class, because that is what the do-nothing model scores.',

    { h: 'The confusion matrix' },
    'For one row, four things can happen. The **confusion matrix** counts each of them over the whole set.',
    {
      list: [
        '**True positive (TP)**: a real positive that the model flagged. A fraud caught.',
        '**False positive (FP)**: a negative that the model flagged. A false alarm.',
        '**False negative (FN)**: a real positive that the model missed.',
        '**True negative (TN)**: a negative that the model left alone.',
      ],
    },
    'Back to the 2,000 transactions. Suppose a model flags 25 of them, and 15 of those are fraud. Then TP = 15 and FP = 10. Of the 20 frauds it missed 5, so FN = 5. Everything else is a true negative: 2,000 − 15 − 10 − 5 = 1,970. Accuracy is (15 + 1,970) ÷ 2,000 = 99.25%, barely above the do-nothing model, yet this model catches three frauds in four.',
    { sub: 'The layout in scikit-learn' },
    '`confusion_matrix(y_true, y_pred)` puts the **truth in the rows** and the **prediction in the columns**, with class 0 first. So it reads `[[TN, FP], [FN, TP]]`.',
    {
      code: `from sklearn.metrics import confusion_matrix

y_true = [1, 1, 0, 0, 0, 1, 0, 0, 1, 0]
y_pred = [1, 0, 0, 1, 0, 1, 0, 0, 1, 0]
cm = confusion_matrix(y_true, y_pred)
print(cm)
tn, fp, fn, tp = cm.ravel()
print(tn, fp, fn, tp)`,
      out: `[[5 1]
 [1 3]]
5 1 1 3`,
    },
    '`ravel()` flattens the 2 × 2 grid into four numbers, row by row, so they come out in the order TN, FP, FN, TP. Unpack them in that order. Other tools and textbooks often draw the matrix the other way round, with positives first, so check the layout every time.',

    { h: 'Precision and recall' },
    '**Precision** is TP ÷ (TP + FP). Of everything the model flagged, what share was real? In the fraud example: 15 ÷ 25 = 0.6.',
    '**Recall** is TP ÷ (TP + FN). Of all the real positives, what share did the model find? In the fraud example: 15 ÷ 20 = 0.75.',
    'Both have TP on top. They differ in what they divide by: precision by everything flagged, recall by everything real. True negatives appear in neither, which is why both stay meaningful when negatives vastly outnumber positives. When the bottom of the fraction is zero (a model that flags nothing has no precision), the usual convention is to report 0.',
    { sub: 'The tug of war' },
    'Most models give each row a score and flag it when the score is above a **threshold**. Lower the threshold and the model flags more: it finds more real cases, so recall rises, but it also raises more false alarms, so precision usually falls. Raise the threshold and the reverse happens. In the figure, slide the threshold and watch rows move between the cells.',
    'Precision also depends on how rare the positives are. Recall only looks at the positive rows, so it does not care how many negatives there are. Precision compares hits with false alarms, and when negatives are many times more common there are many more of them to raise false alarms. The same model can have good precision on a balanced test set and poor precision in production where positives are rare.',
    {
      code: `from sklearn.metrics import precision_score, recall_score

y_true = [1, 1, 1, 1, 0, 0, 0, 0, 0, 0]
y_pred = [1, 1, 1, 0, 1, 1, 0, 0, 0, 0]
print(precision_score(y_true, y_pred), recall_score(y_true, y_pred))`,
      out: '0.6 0.75',
    },

    { h: 'F1 and choosing what to optimise' },
    '**F1** combines precision P and recall R into one number: `F1 = 2PR / (P + R)`. This is the **harmonic mean**, a kind of average that stays close to the smaller of the two. With P = 0.8 and R = 0.4: 2 × 0.8 × 0.4 = 0.64, divided by 1.2, gives 0.53. The ordinary average would say 0.6. A model cannot get a high F1 by being excellent at one and poor at the other.',
    { sub: 'Errors have different costs' },
    'F1 treats a false alarm and a miss as equally bad. Products rarely do. Decide which error costs more before you pick a metric.',
    {
      list: [
        'A missed tumour is far worse than an extra scan. Favour recall and accept false alarms.',
        'A real email hidden in the spam folder is worse than one spam in the inbox. Favour precision.',
        'What happens after the flag matters. If a human checks every flag, false alarms are cheap. If the flag triggers an automatic action, nobody catches them.',
      ],
    },
    'A clear way to write the goal is a constraint plus a target: "the highest recall at a precision of at least 95%". Then you compare models on one number.',

    { h: 'More than two classes' },
    'With several classes, each class gets its own precision and recall, computed as if that class were "positive" and all others "negative". Two ways to average them:',
    {
      list: [
        '**Macro average**: average the per-class numbers, so every class counts the same, however small.',
        '**Micro average**: pool the counts over all rows first, so every row counts the same and big classes dominate. For recall over all classes this equals accuracy.',
      ],
    },
    {
      code: `from sklearn.metrics import recall_score

y_true = [0, 0, 0, 0, 0, 0, 1, 1, 1, 2]
y_pred = [0, 0, 0, 0, 0, 0, 1, 1, 0, 0]
print(round(recall_score(y_true, y_pred, average="macro"), 3), recall_score(y_true, y_pred, average="micro"))`,
      out: '0.556 0.8',
    },
    'Per-class recall is 6/6 = 1 for class 0, 2/3 for class 1 and 0/1 = 0 for class 2. Macro averages those three: 0.556. Micro counts rows: 8 of 10 right, 0.8. Macro is the one that notices a small class being ignored.',

    { h: 'Common mistakes' },
    {
      list: [
        'Reporting accuracy on unbalanced data without comparing it with the majority share.',
        'Swapping the denominators: precision divides by TP + FP, recall by TP + FN.',
        'Unpacking a scikit-learn matrix as TP first. It is TN, FP, FN, TP.',
        'Trusting a precision measured on balanced data for a deployment where positives are rare.',
        'Choosing by F1 when the two errors clearly have different costs.',
      ],
    },
  ],

  'evaluation-curves': [
    { h: 'Scores and thresholds' },
    'Most classifiers do not output 0 or 1 directly. They output a **score** for each row, often a number between 0 and 1 that is meant as a probability of being positive. In scikit-learn, `predict_proba(X)[:, 1]` gives that score, and `predict(X)` cuts it at 0.5 and returns 0 or 1.',
    'That cut, the **threshold**, is your choice, and 0.5 is rarely the right one. Every precision, recall and confusion matrix belongs to one threshold. Change it and they all change, while the model itself stays the same.',
    { sub: 'One model, two thresholds' },
    {
      code: `scores = [0.95, 0.85, 0.6, 0.55, 0.3, 0.1]
y_true = [1, 0, 1, 1, 0, 0]
for threshold in [0.5, 0.8]:
    flagged = [t for t, s in zip(y_true, scores) if s >= threshold]
    tp = sum(flagged)
    print(threshold, round(tp / len(flagged), 2), round(tp / sum(y_true), 2))`,
      out: `0.5 0.75 1.0
0.8 0.5 0.33`,
    },
    '`flagged` holds the true labels of the rows whose score clears the threshold, so its sum is the number of true positives. Each line prints the threshold, the precision and the recall. At 0.5 four rows are flagged, three real: precision 0.75, and all three positives are found. At 0.8 only two are flagged, one real. Here raising the threshold lowered both, which happens on small data; on large data precision usually rises.',

    { h: 'The ROC curve and AUC' },
    'To judge the model apart from any one threshold, try every threshold and plot the results as a curve. The **ROC curve** puts the **false positive rate** on the horizontal axis and the **true positive rate** on the vertical one.',
    {
      list: [
        'True positive rate = TP ÷ (TP + FN). This is recall: the share of real positives flagged.',
        'False positive rate = FP ÷ (FP + TN): the share of real negatives wrongly flagged.',
      ],
    },
    'A very high threshold flags nothing: both rates are 0, the bottom left corner. A very low one flags everything: both are 1, the top right. Moving the threshold up slides you towards the bottom left. A good model climbs steeply first, reaching high recall while few negatives are flagged.',
    { sub: 'What the area means' },
    'The area under the ROC curve, **ROC AUC**, has a plain meaning: pick one positive and one negative at random; AUC is the probability that the positive gets the higher score. A tie counts as half. 0.5 is a random ordering and 1.0 a perfect one. You can compute it by hand by checking every (positive, negative) pair.',
    'Take positives with scores 0.7, 0.4, 0.9 and negatives with 0.2, 0.5, 0.1. That is 3 × 3 = 9 pairs. 0.7 beats all three negatives, 0.9 beats all three, and 0.4 beats 0.2 and 0.1 but loses to 0.5. So 8 of 9 pairs are in the right order: AUC = 0.889.',
    {
      code: `from sklearn.metrics import roc_auc_score

y_true = [0, 1, 0, 1, 0, 1]
scores = [0.2, 0.7, 0.5, 0.4, 0.1, 0.9]
print(round(roc_auc_score(y_true, scores), 3))
print(round(roc_auc_score(y_true, [s ** 3 for s in scores]), 3))`,
      out: `0.889
0.889`,
    },
    'The second line cubes every score. The order of the scores is unchanged, so the AUC is too: AUC only cares about order. Two consequences. Give it the scores, not the 0/1 output of `predict`, which throws the order away and leaves nearly everything tied. And since each rate is computed inside one class, the mix of classes cannot change the ROC curve.',

    { h: 'Precision-recall when positives are rare' },
    'That last property hides a problem. Say 1 transaction in 200 is fraud, out of 20,000: 100 frauds and 19,900 honest ones. A model with 80% recall and a 1% false positive rate sounds excellent. It flags 80 frauds and 1% of 19,900, which is 199 honest transactions. Precision is 80 ÷ 279, about 0.29: more than two false alarms for every fraud.',
    'The **precision-recall curve** plots precision against recall over all thresholds, and shows this. Its summary is the **average precision** (roughly the area under it). Its baseline is not 0.5: a random ordering gets a precision equal to the share of positives. With 1% positives, an average precision of 0.2 is twenty times better than chance. Compare average precision only between data with the same share of positives. In the figure, lower the share of positives and watch the PR curve sink while the ROC curve stays put.',
    {
      code: `from sklearn.metrics import average_precision_score, precision_recall_curve

y_true = [0, 1, 0, 1, 0, 1]
scores = [0.2, 0.7, 0.5, 0.4, 0.1, 0.9]
print(round(average_precision_score(y_true, scores), 3))
precision, recall, thresholds = precision_recall_curve(y_true, scores)`,
      out: '0.917',
    },

    { h: 'Choosing a threshold from costs' },
    'Put a price on each error. Suppose a review costs £5 and a missed fraud costs £20. On validation data, try thresholds and keep the one with the lowest total `FP × 5 + FN × 20`. Then report on the test set, as with any tuned setting.',
    { sub: 'The shortcut for probabilities' },
    'If the score p is a trustworthy probability, decide row by row. Flagging wastes the false alarm cost c_fp with probability 1 − p. Not flagging loses the miss cost c_fn with probability p. Flag when p × c_fn > (1 − p) × c_fp, which works out to p > c_fp ÷ (c_fp + c_fn). Here that is 5 ÷ 25 = 0.2. When misses are expensive, the threshold falls far below 0.5.',

    { h: 'Calibration' },
    'A score is **calibrated** when it means what it says: of all the rows given about 0.8, about 80% are positive. Ranking and calibration are separate. Cubing every score above kept the AUC, yet a 0.7 became 0.34, so the values no longer mean what they did. A model can rank very well and still be overconfident.',
    { sub: 'A reliability table' },
    'Group the predictions into buckets by score and, in each bucket, compare the average score with the share that were really positive.',
    {
      code: `probs = [0.8, 0.8, 0.8, 0.8, 0.8, 0.3, 0.3, 0.3, 0.3, 0.3]
y_true = [1, 1, 1, 1, 0, 1, 1, 0, 0, 0]
high = [t for t, p in zip(y_true, probs) if p > 0.5]
low = [t for t, p in zip(y_true, probs) if p <= 0.5]
print(sum(high) / len(high), sum(low) / len(low))`,
      out: '0.8 0.4',
    },
    'The top bucket said 0.8 and 80% were positive: calibrated. The bottom said 0.3 and 40% were: underconfident. With real data you use about ten buckets. To fix calibration, fit a small extra model that maps scores to observed rates while keeping their order: **Platt scaling** fits an S-shaped curve, **isotonic regression** fits a staircase. Fit it on held-out data, not the training rows, where the model looks more confident than it should. Calibration matters whenever the number itself is used, as in the cost rule above.',

    { h: 'Mistakes to avoid' },
    {
      list: [
        'Passing `predict` output to `roc_auc_score` instead of scores.',
        'Reading average precision against 0.5. Its baseline is the positive rate.',
        'Trusting ROC AUC alone when positives are rare.',
        'Choosing the threshold on the test set.',
        'Assuming a high AUC means the probabilities are right.',
      ],
    },
  ],

  'evaluation-regression': [
    { h: 'Errors on numbers' },
    '**Regression** means predicting a number: a delivery time, a price, tomorrow\'s sales. The value you are trying to predict is the **target**. On one row the **error** is `prediction − truth`. It can be positive (too high) or negative (too low). A regression metric is a way of turning all the errors into one number.',
    'The sign causes the first trap. If you average the raw errors, a +5 and a −5 cancel to 0, and a model that is wrong on every row can look perfect. The average signed error does mean something, the **bias** (whether the model leans high or low), but it is not a measure of how wrong it is. To measure size, remove the sign first: take the absolute value or the square of each error, and only then average.',

    { h: 'MAE and RMSE' },
    { sub: 'Mean absolute error' },
    '**MAE** is the average of the absolute errors (the errors with their sign dropped). It is in the units of the target and reads directly: "off by 12 minutes on average".',
    { sub: 'Root mean squared error' },
    '**RMSE** squares each error, averages the squares, then takes the square root. The root brings it back to the units of the target. Squaring makes big errors count far more: an error of 10 squares to 100, while an error of 2 squares to 4.',
    { sub: 'A worked example' },
    'The truth is 3, 5, 8, 10 and the predictions are 4, 5, 6, 15. The errors are 1, 0, −2, 5.',
    {
      list: [
        'MAE: the sizes 1, 0, 2, 5 add to 8. Divided by 4 rows: 2.0.',
        'RMSE: the squares 1, 0, 4, 25 add to 30. Divided by 4: 7.5. The square root of 7.5 is about 2.74.',
      ],
    },
    'The single error of 5 gives 25 of the 30 in the sum of squares, so RMSE ends up well above MAE.',
    {
      code: `from sklearn.metrics import mean_absolute_error, mean_squared_error

y_true = [3, 5, 8, 10]
y_pred = [4, 5, 6, 15]
mae = mean_absolute_error(y_true, y_pred)
rmse = mean_squared_error(y_true, y_pred) ** 0.5
print(mae, round(rmse, 2))`,
      out: '2.0 2.74',
    },
    '`mean_squared_error` returns the average of the squares (the **MSE**), so raising it to the power 0.5 takes the square root and gives RMSE.',
    { sub: 'Reading the two together' },
    'RMSE is never smaller than MAE. They are equal only when every error has the same size. A wide gap means most errors are small and a few are large. So the choice says what you care about. If one very late delivery is worse than several slightly late ones (for example because it triggers a refund), RMSE matches the cost. If every unit of error costs the same, or the big errors are mostly bad data, MAE fits better.',
    'They also favour different constant guesses. For the values 1, 2, 3, 4, 20, the **mean** is 6 and the **median** (the middle value once sorted) is 3. Guessing the mean for every row gives the lowest squared error; guessing the median gives the lowest absolute error (4.2 against 5.6). With a long tail of huge values, the two are far apart.',

    { h: 'R squared' },
    '**R²** compares the model with the simplest possible guess: always predicting the mean of the targets. Add up the model\'s squared errors (the **sum of squared errors**, SSE), and add up the squared errors of the mean guess. Then R² = 1 − (model\'s SSE) ÷ (mean guess SSE).',
    {
      list: [
        'R² = 1: no error at all.',
        'R² = 0: exactly as good as predicting the mean.',
        'R² below 0: worse than predicting the mean. This happens on test data.',
      ],
    },
    'For the example above, the mean of 3, 5, 8, 10 is 6.5. Its squared errors are 12.25, 2.25, 2.25 and 12.25, which add to 29. The model\'s add to 30. So R² = 1 − 30 ÷ 29, about −0.03. An MAE of 2 sounded fine, yet one big miss makes this model slightly worse than a constant.',
    {
      code: `from sklearn.metrics import r2_score

y_true = [3, 5, 8, 10]
print(round(r2_score(y_true, [4, 5, 6, 15]), 3))
print(r2_score(y_true, [6.5, 6.5, 6.5, 6.5]))`,
      out: `-0.034
0.0`,
    },
    'Pass the truth first: `r2_score` uses the spread of its first argument. R² has no units, so it is easy to quote and hard to act on, and it depends on the spread of the targets, so it cannot be compared across datasets.',

    { h: 'Baselines' },
    'A metric means little alone. A **baseline** is the dumbest reasonable predictor, scored the same way, before any model.',
    {
      list: [
        'For ordinary regression: the mean or median of the **training** targets, guessed for every row. Use the training rows, because a deployed predictor never sees the test targets.',
        'For a **time series** (values in time order): the last value ("same as yesterday"), or the same day last week.',
      ],
    },
    {
      code: `series = [50, 53, 51, 56, 58, 57]
naive = series[:-1]
actual = series[1:]
errors = [abs(a - f) for a, f in zip(actual, naive)]
print(errors, sum(errors) / len(errors))`,
      out: '[3, 2, 5, 2, 1] 2.6',
    },
    '`series[:-1]` drops the last value and serves as the forecasts; `series[1:]` drops the first and holds what really happened. `zip` lines up each day with the day before. A model must beat this 2.6 by more than the noise to be worth running. Last-value baselines are hard to beat, and a forecast that follows the series one step behind has learned only this.',

    { h: 'Percentage errors' },
    'To compare products sold in very different amounts, people use **MAPE**, the mean absolute percentage error: the average of |error| ÷ |truth|, where |x| means the size of x without its sign. Take a product with true sales 200 forecast at 180 (10% off) and one with true sales 4 forecast at 8 (100% off). MAPE is 55%, driven almost entirely by the small product, though its error is only 4 units.',
    { sub: 'Where MAPE breaks' },
    {
      list: [
        'When the truth is 0 it divides by zero, and near 0 it explodes.',
        'It is lopsided: a forecast that is too low can be at most 100% off, but one that is too high can be any amount off, so tuning for MAPE pushes forecasts down.',
      ],
    },
    'The **weighted** version divides once: total absolute error ÷ total of the truth. Here that is (20 + 4) ÷ 204, about 11.8%. Alternatively quote the error as a ratio to the baseline\'s error.',

    { h: 'Mistakes to avoid' },
    {
      list: [
        'Averaging signed errors and calling it an error metric.',
        'Taking the absolute value or the square after averaging instead of before.',
        'Quoting a metric with no baseline next to it.',
        'Computing a baseline from the test targets.',
        'Using MAPE on targets that are often zero or tiny.',
      ],
    },
  ],

  'evaluation-errors': [
    { h: 'What a metric cannot tell you' },
    'A metric says how often the model is wrong. It does not say why, and the reason is what tells you what to do next. **Error analysis** is the habit of opening the validation set and reading the mistakes one by one. It feels like manual work and gets skipped, yet it is the most dependable way to find the next improvement.',

    { h: 'Finding the worst mistakes' },
    'Start with the examples where the model was confident and wrong. The **loss** of a row measures that. For a classifier that outputs the probability of class 1, the usual loss is −log(probability the model gave to the true class), where log is the natural logarithm. Giving the truth 0.9 costs −log 0.9 ≈ 0.11. Giving it 0.05 costs −log 0.05 ≈ 3.0. The less probability the truth got, the bigger the loss.',
    {
      code: `import numpy as np

y = np.array([0, 1, 1, 0, 1, 0])
p = np.array([0.1, 0.3, 0.95, 0.8, 0.6, 0.3])   # probability of class 1
loss = -np.log(np.where(y == 1, p, 1 - p))
print(loss.round(2))
print(np.argsort(loss))
print(np.argsort(-loss)[:2])`,
      out: `[0.11 1.2  0.05 1.61 0.51 0.36]
[2 0 5 4 1 3]
[3 1]`,
    },
    '`np.where(y == 1, p, 1 - p)` picks, for each row, the probability given to the true class: p for a positive, 1 − p for a negative. Row 3 is a negative scored 0.8, so the truth got only 0.2 and the loss is the largest.',
    '`np.argsort` returns the row numbers that would sort the array **from smallest to largest**. So `argsort(loss)` starts with the best-handled rows. Sorting `-loss` instead puts the largest losses first, and `[:2]` takes the two worst: the first rows to read.',

    { h: 'Tagging and counting' },
    'Read fifty to a hundred of the worst errors. Give each a short tag for its apparent cause: "blurry photo", "sarcasm", "wrong label", "new product", "two categories that overlap". Then count the tags. The count turns a pile of anecdotes into a ranked list.',
    { sub: 'The ceiling on a fix' },
    'A tag\'s share of the errors is the most that fixing it can gain. Say a model has a 20% error rate and 30% of its errors are tagged "handwriting". Fixing handwriting perfectly removes 30% of the errors, leaving 70% of 20%, which is 14%. A tag covering 5% of errors could at best take 20% down to 19%. Work on what is both common and fixable. An afternoon of counting regularly saves a month spent on the wrong problem.',
    'For a classifier with many classes, the confusion matrix from an earlier lesson helps here too: it shows which pairs of classes get mixed up, and often two or three pairs carry most of the errors.',

    { h: 'Slicing the score' },
    'An average hides groups. **Slicing** means computing the metric separately for each segment: country, device, new against returning users, class, length of input. A model at 94% overall can be at 70% for one language.',
    {
      code: `rows = [("ios", 1, 1), ("ios", 0, 0), ("ios", 1, 0),
        ("web", 1, 1), ("web", 0, 0), ("web", 0, 0), ("web", 1, 1)]   # (segment, truth, prediction)
for name in ["ios", "web"]:
    hits = [t == p for s, t, p in rows if s == name]
    print(name, round(sum(hits) / len(hits), 2), len(hits))`,
      out: `ios 0.67 3
web 1.0 4`,
    },
    '`t == p` is `True` or `False`, and Python counts `True` as 1 when summing, so `sum(hits)` is the number right. Always print the size of the slice with its score.',
    { sub: 'Is the gap real' },
    'A small slice gives a noisy score. For an accuracy p measured on n rows, the standard error (from the maths module: the typical amount a score moves by chance) is about √(p × (1 − p) ÷ n). For p = 0.7 on 50 rows: √(0.21 ÷ 50) ≈ 0.065, so 6.5 points. A gap of one or two standard errors turns up often by chance, all the more when you check many slices. Treat it as a reason to collect more rows from that slice, not yet as a project.',

    { h: 'When the label is the mistake' },
    'Some of the confident mistakes are not the model\'s: the label is wrong and the model was right. Confident disagreement is exactly how you find these **label errors**.',
    {
      list: [
        'In the training set, wrong labels teach the model the wrong thing.',
        'In the test set, they cap the score you can measure. If 3% of test labels are wrong, a model that is always right still disagrees with them, and measures at most 97%. Two models near that cap may be ordered by which one copies the mistakes.',
      ],
    },
    'So fix test labels first, and estimate how common label errors are before comparing models. Do not throw away every high-loss row: many are hard but correctly labelled, and those are the most useful rows you have.',

    { h: 'Choosing the kind of fix' },
    { sub: 'Train, validation and live' },
    'Compare the error on the training rows, the validation rows and live traffic.',
    {
      list: [
        'High on training and on validation: the model **underfits**, it is too simple to capture the pattern. Add features or capacity (a bigger model).',
        'Low on training, much higher on validation: it **overfits**, it memorised the training rows. Add data, regularise (penalise complexity), or stop training earlier. On a plot of loss against **epochs** (passes over the training data), this shows as the training curve still falling while the validation curve turns back up.',
        'Good on validation, bad in production: the live data differs from the data you split. No model change fixes that. Collect and label live examples and make the validation set look like them.',
      ],
    },

    { h: 'Mistakes to avoid' },
    {
      list: [
        'Changing the model before reading any errors.',
        'Using `argsort` and forgetting it sorts from smallest to largest.',
        'Reacting to a slice of a few dozen rows as if its score were exact.',
        'Working on the most interesting cause instead of the largest fixable one.',
        'Changing several things at once, so you cannot tell which helped. Keep the validation set fixed and the test set closed until the end.',
      ],
    },
  ],

  'evaluation-experiments': [
    { h: 'Offline and online' },
    'Everything so far in this module is **offline** evaluation: scoring a model on logged, held-out data with a metric you chose, such as AUC. The business cares about something else, measured **online** on real users: purchases, retention, time saved. A better offline score is a reason to try a model, not proof that it helps.',
    { sub: 'Why the two disagree' },
    {
      list: [
        'The offline metric may not move with the business metric.',
        'Logs are shaped by the old model. A recommender\'s click logs only record reactions to items the old recommender showed. An item never shown has no clicks, however good, so a new model that suggests different items gets no credit offline. This is a **feedback loop**.',
        'Features that were complete in stored data can arrive late or missing in production.',
        'A better model that makes the page much slower can lose sales to waiting, which offline scores never see.',
      ],
    },

    { h: 'The A/B test' },
    'An **A/B test** is a controlled experiment. Split users at random into two groups. The **control** group gets the current model, the **treatment** group gets the new one. Both run over the same period, and you compare the metric you care about.',
    'A before-and-after comparison (old model last week, new model this week) cannot separate the model from everything else that changed: the season, a sale, a holiday. Random assignment over the same days makes the groups alike in everything except the model.',
    { sub: 'Randomise by user' },
    'Assign the unit that has the experience, usually the user, not each request. Otherwise one user sees both models, and their behaviour reflects a mixture. A stable assignment comes from hashing the user id: a **hash** turns any text into a number in a fixed, repeatable way.',
    {
      code: `import zlib

def assign(user_id):
    bucket = zlib.crc32(str(user_id).encode()) % 100
    return "treatment" if bucket < 50 else "control"

print([assign(u) for u in ["u1", "u2", "u3", "u1"]])`,
      out: "['treatment', 'control', 'treatment', 'treatment']",
    },
    '`zlib.crc32` hashes the bytes of the id, and `% 100` keeps the remainder after dividing by 100, a bucket from 0 to 99. Buckets below 50 go to treatment. User u1 gets the same group both times. Once the test runs, check the groups are close to the intended split: a lopsided split means the assignment or the logging is broken.',

    { h: 'Is the difference real' },
    'Each group\'s rate is a measurement with noise. From the maths module: a rate p measured on n users has a **standard error** (typical size of its chance wobble) of √(p(1 − p) ÷ n). Comparing two groups combines the noise of both. The variances (squared standard errors) add, so the standard error of the difference is `√(se_a² + se_b²)`.',
    { sub: 'A worked example' },
    'Control converts 20% of 2,000 users, treatment 22% of 2,000. Control: 0.2 × 0.8 ÷ 2,000 = 0.00008. Treatment: 0.22 × 0.78 ÷ 2,000 ≈ 0.0000858. They add to about 0.000166, whose square root is about 0.0129. The lift of 0.02 is 0.02 ÷ 0.0129 ≈ 1.55 standard errors.',
    {
      code: `import math

n = 2000
p_a, p_b = 0.20, 0.22
se = math.sqrt(p_a * (1 - p_a) / n + p_b * (1 - p_b) / n)
print(round(se, 4), round((p_b - p_a) / se, 2))`,
      out: '0.0129 1.55',
    },
    'The usual bar, called **significance at the 5% level**, is about 2 standard errors (1.96 to be exact): a gap that size turns up by chance only 5% of the time when the models are really equal. The chance of a gap at least as large as yours, if there were no real effect, is the **p-value**; "p < 0.05" means the gap clears the bar. Here 1.55 does not, so this test has not shown a lift.',

    { h: 'How many users and how long' },
    'Decide the sample size first. A workable rule, for an 80% chance of detecting a real effect at the 5% level, is `n ≈ 16 × p(1 − p) ÷ d²` users **per group**. Here p is the current rate and d is the smallest absolute change worth detecting, which you agree with the business first.',
    'With p = 0.05 and d = 0.01 (5% to 6%): 16 × 0.05 × 0.95 ÷ 0.0001 = 7,600 per group, 15,200 in all. Because d is squared, halving it multiplies n by four: 30,400 per group to see half a point. Small effects on rare events need very large experiments.',
    { sub: 'Run in whole weeks' },
    'Weekday and weekend users differ. If 3,000 users a day enter the test, 15,200 takes a little over 5 days, but stopping then would count some weekdays and not others. Round up to a whole week, here 7 days, so every day of the week is equally represented.',

    { h: 'Peeking' },
    'Fix the duration in advance and do not stop the first time the dashboard shows p < 0.05. Each look is another chance for noise to cross the bar, and stopping at the first crossing picks the luckiest moment. This is **peeking**, the "best of many tries" problem from cross-validation in another form. The simulation runs 2,000 tests where both groups are identical and compares one look at the end with a look every day.',
    {
      code: `import numpy as np

rng = np.random.default_rng(0)
a = rng.random((2000, 20, 200)) < 0.1     # 2,000 tests, 20 days, 200 users a day, no real effect
b = rng.random((2000, 20, 200)) < 0.1
n = 200 * np.arange(1, 21)                # users per group after each day
pa, pb = a.sum(axis=2).cumsum(axis=1) / n, b.sum(axis=2).cumsum(axis=1) / n
z = (pb - pa) / np.sqrt(pa * (1 - pa) / n + pb * (1 - pb) / n)
print(round(np.mean(abs(z[:, -1]) > 1.96), 2), round(np.mean((abs(z) > 1.96).any(axis=1)), 2))`,
      out: '0.05 0.25',
    },
    '`z` is the gap in standard errors after each day. Looking once at the end, 5% of the equal tests falsely "win". Looking daily, 25% do. To look early, use a **sequential** method built for repeated looks.',

    { h: 'Effects that change over time' },
    'Early results mislead in both directions. A **novelty effect** is a lift that fades once users are used to the change. The opposite happens when users need time to learn a new layout. An average over the whole test is dominated by the early days, so plot the effect day by day and trust the level it settles at.',

    { h: 'Guardrails and the written plan' },
    'One **primary metric** decides the test. Beside it, set **guardrail metrics** that must not get worse whatever the primary does: latency, error rate, complaints, unsubscribes, revenue. A model that lifts clicks while clearly raising complaints has not won. Re-running the test until a guardrail passes is peeking again.',
    { sub: 'Write it down first' },
    'Before the test starts, write down the primary metric, the guardrails, the sample size, the duration, and the decision for each outcome, including a flat one. Start on a small share of traffic to catch crashes cheaply. Every choice left open until the data is in is another chance to find a winner by luck.',
  ],

  'evaluation-lab': [
    { h: 'What an evaluation report contains' },
    'One accuracy figure is not an evaluation. Before a **binary classifier** (one that answers yes or no) ships, the people deciding want a report: the four confusion counts at a chosen threshold, precision, recall and F1, the trade-off across thresholds, one number for ranking quality, a threshold chosen from costs, an error bar, and a comparison with a model that does nothing.',
    'The inputs are two lists: `y_true`, the 0/1 labels, and `scores`, one score per row. A row is **flagged** when its score is **at or above** the threshold. The lab builds each piece in plain Python; in real work you would call scikit-learn.',
    'The running example below has five rows: labels 1, 0, 1, 0, 0 with scores 0.9, 0.7, 0.6, 0.4, 0.2.',

    { h: 'Counts and ratios at one threshold' },
    'Every row lands in exactly one cell, decided by two facts: was it flagged, and is it positive. Flagged and positive is TP, flagged and negative is FP, not flagged and positive is FN, the rest TN. The four counts add up to the number of rows.',
    'At threshold 0.5 in the example, the rows scored 0.9, 0.7 and 0.6 are flagged. Two of them are positive: TP = 2, FP = 1. No positive is missed: FN = 0. The two lowest rows are TN = 2.',
    { sub: 'Guarding against division by zero' },
    'Precision is TP ÷ (TP + FP), recall is TP ÷ (TP + FN), and F1 is 2PR ÷ (P + R). Each has a bottom that can be zero, for example when nothing is flagged. Python\'s conditional expression handles it in one line: `a / b if b else 0.0` divides when b is not zero and gives 0.0 otherwise.',

    { h: 'Sweeping the threshold' },
    'To see the whole trade-off, use every **distinct** score as a threshold, from the highest down. Rows with the same score are flagged together, so a repeated score gives one point, not two. Python\'s `set` drops repeats, and `sorted(..., reverse=True)` orders from largest to smallest.',
    {
      code: `scores = [0.3, 0.8, 0.3, 0.5]
print(sorted(set(scores), reverse=True))`,
      out: '[0.8, 0.5, 0.3]',
    },
    'At the highest score at least one row is flagged, so precision is always defined. As the threshold drops, recall can only stay level or rise, while precision moves up and down. The list of (threshold, precision, recall) points is the precision-recall curve.',
    { sub: 'Average precision as a sum' },
    'Average precision summarises that curve in one number. Walk down the points; each time recall rises, add the rise multiplied by the precision at that point, starting from a recall of 0. Steps that only add false positives add nothing, because recall does not move.',
    'In the example the points are: 0.9 (P = 1, R = 0.5), 0.7 (P = 0.5, R = 0.5), 0.6 (P = 0.67, R = 1), 0.4 (P = 0.5, R = 1), 0.2 (P = 0.4, R = 1). Recall rises twice: by 0.5 at precision 1, and by 0.5 at precision 0.67. The sum is 0.5 + 0.33 = 0.83, which is what scikit-learn\'s `average_precision_score` gives for these rows. A constant score flags everything at once, so its average precision equals the share of positives, the baseline.',

    { h: 'Choosing the threshold from costs' },
    'Give each error a price and add them up: total cost = FP × cost_fp + FN × cost_fn. Try every distinct score, and also "flag nothing", and keep the cheapest. "Flag nothing" is the threshold infinity, written `float("inf")` in Python: every number is below it, so no row clears it.',
    {
      code: `print(0.99 >= float("inf"), 5 < float("inf"))`,
      out: 'False True',
    },
    'With a false alarm costing 1 and a miss costing 3 in the example: flagging nothing misses both positives, 6. At 0.9: one miss, 3. At 0.7: one false alarm and one miss, 4. At 0.6: one false alarm, 1. At 0.4 and 0.2: 2 and 3. The best threshold is 0.6. Expensive misses pull the threshold down; expensive false alarms push it up. When two thresholds tie, a fixed rule (such as preferring the higher one) keeps the answer reproducible.',
    'The threshold is a tuned setting. Choose it on validation rows; chosen on the test rows, the reported cost is the best of many tries on those rows, and too low.',

    { h: 'An error bar for any metric' },
    'A metric from a few hundred rows has noise. The **bootstrap** estimates how much, for any metric, even ones with no formula. Imitate drawing a fresh test set: pick n row numbers at random **with replacement** (the same row may be picked more than once, others not at all), compute the metric on those rows, and repeat many times. Sort the results; the values 2.5% and 97.5% of the way along bound a 95% interval.',
    {
      code: `import random

rng = random.Random(0)
data = [3, 7, 4, 9, 5, 6, 8, 2, 7, 5]
means = []
for _ in range(1000):
    rows = [rng.randrange(len(data)) for _ in range(len(data))]
    means.append(sum(data[i] for i in rows) / len(rows))
means.sort()
print(means[25], means[975])`,
      out: '4.3 6.9',
    },
    'This bootstraps the mean of ten numbers. `random.Random(0)` is a generator with a fixed seed, so the result repeats; `rng.randrange(n)` picks a number from 0 to n − 1. With 1,000 repeats, positions 25 and 975 are the 2.5% and 97.5% points. For a classifier, resample whole rows, so each label stays with its prediction. Fewer rows give a wider interval, since noise shrinks with √n.',

    { h: 'The do-nothing baseline and the full report' },
    'Always set the model beside the classifier that predicts the more common class for every row, which can be either 0 or 1. Its accuracy is the larger class\'s share: with 30 positives in 100 rows, `max(30, 100 - 30) / 100` = 0.7. A model below this accuracy can still be useful, because it finds positives and the baseline finds none.',
    { sub: 'Beyond the numbers' },
    'The deciders also need:',
    {
      list: [
        'How the data was split, and that the test set was used once.',
        'The number of rows and positives, with an interval on each headline number.',
        'The threshold, the costs behind it, and the data it was chosen on.',
        'A comparison on the same rows with the baseline and the current production model.',
        'Metrics per segment with their sizes, a reliability table if the probabilities are used as numbers, and the worst errors.',
        'What offline numbers cannot show, and the plan for an online test.',
      ],
    },
  ],
}
