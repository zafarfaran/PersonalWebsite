import type { Block } from '../../types'

/** The full theory for each lesson of the classical module, keyed by lesson id. */
export const classicalTheory: Record<string, Block[]> = {
  'classical-linear': [
    { h: 'Predicting a number with a weighted sum' },
    'Machine learning starts with a table. Each row is an **example**. Some columns are **features**, the facts you know, and one column is the **target**, the number to predict.',
    'A **linear model** gives every feature a **weight**, multiplies each feature by its weight, adds the results, and adds one constant called the **bias**. In symbols, `pred = w·x + b`, where x is the list of features, w the list of weights, and `w·x` is the dot product from the maths module: multiply matching entries and add them up.',
    { sub: 'A small example' },
    'An exam-score model with features (hours studied, hours slept), weights (5, 2) and bias 10 predicts 5×3 + 2×7 + 10 = 39 for a student who studied 3 hours and slept 7. The bias is the prediction when every feature is 0. With one feature the model is a straight line, and the weight is its **slope**.',

    { h: 'Measuring how wrong the line is' },
    'The **residual** of an example is its target minus the prediction.',
    'Square every residual and take the average: that is the **mean squared error**, or **MSE**. Squaring removes the sign, so errors of +3 and −3 cannot cancel, and makes big errors count far more than small ones. Square first, then average. Averaging first lets the residuals cancel, and a bad model can score close to 0.',
    { sub: 'A worked example' },
    'Four students studied x = 1, 2, 3, 4 hours and scored y = 3, 5, 4, 8. Try the line pred = 1.4x + 1.5. The predictions are 2.9, 4.3, 5.7 and 7.1. The residuals are 0.1, 0.7, −1.7 and 0.9. Squared: 0.01, 0.49, 2.89 and 0.81, which add to 4.2. Divide by 4: the MSE is 1.05.',

    { h: 'Least squares: finding the best weights' },
    '**Least squares** means choosing the weights and bias that make the MSE as small as it can be. For a linear model there is an exact formula, so no search is needed. With one feature, write x̄ for the mean of x and ȳ for the mean of y. Then',
    { code: `slope = Σ(x − x̄)(y − ȳ) ÷ Σ(x − x̄)²
bias  = ȳ − slope × x̄` },
    'Σ (the Greek capital sigma) means "add up over all examples". For the students, x̄ = 2.5 and ȳ = 5. The x deviations are −1.5, −0.5, 0.5, 1.5 and the y deviations are −2, 0, −1, 3. The products add to 3 + 0 − 0.5 + 4.5 = 7, the squared x deviations add to 5, so the slope is 1.4 and the bias is 5 − 1.4×2.5 = 1.5: the line used above. No other line has a smaller MSE here.',
    {
      code: `from sklearn.linear_model import LinearRegression

X = [[1], [2], [3], [4]]
y = [3, 5, 4, 8]
model = LinearRegression().fit(X, y)
print(round(float(model.coef_[0]), 2), round(float(model.intercept_), 2))`,
      out: '1.4 1.5',
    },
    'scikit-learn wants `X` as a list of rows, even with one feature, hence the inner brackets. After `fit`, `coef_` holds the weights and `intercept_` the bias.',
    { sub: 'Gradient descent reaches the same answer' },
    'On very large data the formula is too slow, so you use **gradient descent** (from the maths module: small steps downhill on the loss). With error = pred − y, the **gradient** of the MSE is 2 × mean(error × x) for the weight and 2 × mean(error) for the bias. Each step moves against it: new w = w − lr × gradient, where the **learning rate** lr is a small step size. Take x = (1, 2), y = (2, 2), w = b = 0 and lr = 0.1. The errors are −2 and −2, the weight gradient is 2 × mean(−2, −4) = −6, the bias gradient is −4, so w becomes 0.6 and b becomes 0.4. Many such steps arrive at the least-squares line.',

    { h: 'Outliers and the cost of squaring' },
    'A residual of 6 costs 36, a residual of 2 costs 4: three times further, nine times the cost. One point far from the rest, an **outlier**, can supply most of the total, so the line tilts towards it to shrink that one big term, even though every other point fits a little worse. Look at the residuals before trusting a fit. Fix or drop outliers that are mistakes. For real ones, a log of the target or a loss that grows more slowly (absolute error, Huber) limits their pull.',

    { h: 'Reading the weights' },
    'A weight is the change in the prediction when its feature goes up by one unit and the others stay the same, so its size depends on the unit. Measure a length in kilometres instead of metres and its weight becomes a thousand times larger, with identical predictions. A big weight does not mean an important feature. Compare realistic changes instead (3 per gram times a typical 200 grams is 600), or first **standardise** the features onto one scale.',
    'When two features carry nearly the same information, such as temperature in °C and in °F, only their combined effect is pinned down. Many pairs of weights predict equally well, so the individual weights can come out huge, with opposite signs, and swing on a new sample. Predictions stay fine; the weights stop meaning anything. Drop one of the pair or regularise (two lessons on).',

    { h: 'Judging the fit with R²' },
    'The dumbest baseline predicts the mean target for every row. Its MSE is the **variance** of the targets, their average squared distance from the mean. **R²** compares the two: `R² = 1 − MSE ÷ variance`. For the students the variance is (4 + 0 + 1 + 9) ÷ 4 = 3.5, so R² = 1 − 1.05 ÷ 3.5 = 0.7.',
    {
      list: [
        'R² = 1: perfect predictions.',
        'R² = 0: no better than predicting the mean.',
        'R² below 0: worse than the mean. Possible on new rows, never on the training rows.',
      ],
    },
    { sub: 'Score on data the model has not seen' },
    'A score on the fitted rows measures memory, not prediction. Split first with `train_test_split`, `fit` on the training part only, and pass the test part to `model.score`, which returns R².',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Averaging the residuals before squaring them.',
        'Fitting and scoring on the same rows.',
        'Reading a large weight as an important feature.',
      ],
    },
  ],

  'classical-logistic': [
    { h: 'Predicting yes or no' },
    'Many targets are not numbers but answers to a yes/no question: is this email spam, will this customer leave. Write them as **labels** 1 (yes, the **positive class**) and 0 (no). What you want from a model is a **probability**: a number from 0 to 1 saying how likely the label is 1.',
    '**Logistic regression** does this in two steps. First it computes the same score as a linear model, `z = w·x + b` (each feature times its weight, added up, plus the bias). Then it squashes z into the range 0 to 1.',

    { h: 'The sigmoid' },
    'The squashing function is the **sigmoid**: `p = 1 / (1 + e⁻ᶻ)`. Here e is a fixed number, about 2.718, and e⁻ᶻ means e raised to the power −z. In Python it is `math.exp(-z)`.',
    { sub: 'How it behaves' },
    {
      list: [
        'z = 0 gives e⁰ = 1, so p = 1 / 2 = 0.5.',
        'Large positive z makes e⁻ᶻ tiny, so p is close to 1.',
        'Large negative z makes e⁻ᶻ huge, so p is close to 0.',
        'It is symmetric: sigmoid(−z) = 1 − sigmoid(z).',
      ],
    },
    {
      code: `import math

def sigmoid(z):
    return 1 / (1 + math.exp(-z))

print([round(sigmoid(z), 3) for z in (-3, -1, 0, 1, 3)])`,
      out: '[0.047, 0.269, 0.5, 0.731, 0.953]',
    },
    'Notice 0.269 + 0.731 = 1, the symmetry at work. A score of 3 already means 95% sure.',

    { h: 'The decision boundary and the threshold' },
    'To turn a probability into a yes or no you need a **threshold**: say yes when p is at least the threshold. The default is 0.5. Since p = 0.5 exactly when z = 0, the **decision boundary**, the place where the answer flips, is where `w·x + b = 0`.',
    { sub: 'Finding it with one feature' },
    'Solve w·x + b = 0 for x: the boundary is at `x = −b / w`. A model with w = 4 and b = −10 has its boundary at x = 10 / 4 = 2.5. Above 2.5 it says 1, below it 0. With two features the boundary is a straight line, with more a flat plane, so logistic regression is a **linear classifier**: it cannot bend its boundary.',
    'The bias slides the boundary. The size of the weights sets how steep the sigmoid is: w = 1 and b = −2.5 has the same boundary as w = 4 and b = −10, but its probabilities change slowly as you cross it, while the second jumps from near 0 to near 1.',
    { sub: 'Choosing the threshold' },
    '0.5 is a default, not a law. The threshold is applied after the model, so changing it does not retrain anything or change the probabilities. Lower it and more cases get a yes: you catch more of the real positives, and you also raise more false alarms. Raise it and the reverse happens. Pick it from what each kind of mistake costs.',

    { h: 'Log loss' },
    'To train the weights you need a loss that rewards good probabilities. **Log loss** charges each example −log of the probability the model gave to the label that really happened: `−log(p)` when the label is 1, `−log(1 − p)` when it is 0, averaged over the examples. Here log is the natural logarithm, `math.log` in Python.',
    { sub: 'Worked example' },
    'A model gives p = 0.8 for an email. If it is spam (label 1), the loss is −log(0.8) ≈ 0.22. If it is not spam (label 0), the model gave the truth only 0.2, and the loss is −log(0.2) ≈ 1.61. Had it said p = 0.99 for a non-spam email, the loss would be −log(0.01) ≈ 4.61. Being confident and wrong costs the most, and the cost has no upper limit as p heads for certainty.',
    'This is why log loss can tell apart two models with the same accuracy. A model with very steep probabilities is sure of itself everywhere, including on the points it gets wrong, and those few points can cost more than all the extra confidence earns elsewhere. The best model is as confident as the data allows and no more.',
    'There is no exact formula for the best weights, so they are found by gradient descent. The gradient for each example has a simple shape: `(p − y) × x`.',

    { h: 'Using it in scikit-learn' },
    {
      code: `from sklearn.linear_model import LogisticRegression

X = [[1], [2], [3], [4], [5], [6]]
y = [0, 0, 1, 0, 1, 1]
model = LogisticRegression().fit(X, y)
print(model.predict([[2], [5]]))
print(model.predict_proba([[3.5]]).round(2))`,
      out: `[0 1]
[[0.5 0.5]]`,
    },
    '`predict` returns classes, already cut at 0.5. `predict_proba` returns one row per example and one column per class: column 0 is P(label 0) and column 1 is P(label 1). To use your own threshold, take `predict_proba(X)[:, 1]` and compare it yourself. Comparing the output of `predict` with 0.3 changes nothing, because it is already 0s and 1s.',
    { sub: 'Regularisation and C' },
    'If the two classes can be separated perfectly, any separating boundary gets a lower loss when you scale all the weights up, because every probability moves closer to 0 or 1. The loss keeps falling forever, so there is no finite best answer, and the optimiser warns that it did not converge. scikit-learn therefore adds a penalty on large weights by default. Its strength is set by `C`, which is the inverse: a smaller C means a stronger pull towards small weights. Because the penalty treats all weights alike, put the features on a similar scale first.',

    { h: 'Why not linear regression for classes' },
    'Fitting an ordinary line to 0/1 labels gives outputs that can be 1.7 or −0.4, which are not probabilities. Worse, squared error punishes being too right. A positive example far on the correct side with an output of 4 counts as an error of 3, squared to 9, so the line tilts to reduce it and the 0.5 crossing moves, maybe to a wrong place. Under log loss that same example already has p near 1 and costs almost nothing, so it barely affects the boundary.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Comparing `predict` output with a threshold instead of using `predict_proba`.',
        'Forgetting that a smaller `C` means more regularisation, not less.',
        'Judging a classifier by accuracy alone when the probabilities matter.',
        'Using the log loss formula for label 1 on a label-0 example: for label 0, use 1 − p.',
      ],
    },
  ],

  'classical-overfit': [
    { h: 'Capacity: how complicated a model can get' },
    'Every model has a **capacity**: how complicated a pattern it can represent. A straight line has little. A **polynomial** such as y = a + bx + cx² + dx³ has more: its **degree** is the highest power of x (3 here), and it has degree + 1 **coefficients** (a, b, c, d) to set. The depth of a decision tree and the number of weights in a network are capacity too.',
    'Real data is a pattern plus **noise**: random wobble from measurement, luck and things you did not record. A good model learns the pattern and ignores the noise.',
    { sub: 'Two ways to fail' },
    {
      list: [
        '**Underfitting**: too little capacity. The model cannot follow the pattern, so it is wrong everywhere, on the training rows too. A straight line through data that curves is the classic case.',
        '**Overfitting**: too much capacity for the amount of data. The model bends to pass through every training point, noise included, and swings wildly in between. It looks perfect on the rows it saw and does badly on new ones.',
      ],
    },

    { h: 'Why the training error cannot be trusted' },
    'The error on the rows a model was fitted to only ever falls as capacity grows, because a more flexible model can always bend closer to those rows. With as many coefficients as points it can usually pass through all of them and score exactly zero.',
    {
      code: `import numpy as np

x = np.array([0.0, 1.0, 2.0, 3.0])
y = np.array([1.0, 3.0, 2.0, 5.0])
for degree in (1, 3):
    coef = np.polyfit(x, y, degree)
    mse = np.mean((np.polyval(coef, x) - y) ** 2)
    print(degree, round(float(mse), 2))`,
      out: `1 0.68
3 0.0`,
    },
    '`np.polyfit(x, y, degree)` finds the least-squares coefficients of a polynomial of that degree. `np.polyval(coef, x)` evaluates it at x. The cubic has four coefficients for four points and fits them exactly. That zero tells you nothing about how it will do on a fifth point.',

    { h: 'Training, validation and test sets' },
    'So hold data back. Split it into three parts:',
    {
      list: [
        'The **training set**: the model is fitted on these rows.',
        'The **validation set**: rows the model never trained on, used to compare models and settings and choose between them.',
        'The **test set**: kept locked away and used once, at the very end, for the number you report.',
      ],
    },
    { sub: 'Reading the validation curve' },
    'Fit models of increasing capacity and plot both errors. The training error falls steadily. The validation error falls while the model is learning the pattern, reaches a lowest point, and rises once the model starts fitting noise. Choose the capacity at the bottom of the validation curve. Left of it the model underfits, right of it it overfits.',
    { sub: 'Why a test set as well' },
    'If you try 30 settings and keep the one with the best validation score, that score is partly luck: you picked the winner of a noisy contest, so it is optimistic. The test set played no part in any choice, so its score is honest, as long as you look at it once.',

    { h: 'Bias and variance' },
    '**Bias** is error from a model too simple for the pattern. It is wrong in the same way whatever sample of data you train it on. **Variance** is error from a model that changes a lot with the particular rows it happened to get: train it on five different samples and you get five quite different models. Simple models have high bias and low variance, flexible ones the reverse. This is the **bias-variance trade-off**.',
    'More data lowers variance, not bias. A degree-9 polynomial on 15 points is wild; on 200 points the same 10 coefficients are pinned down by the pattern and behave. A straight line through curved data stays wrong however many points you add, because its problem is its shape. Whether capacity is too high depends on how much data you have. Averaging many flexible models also lowers variance, the idea behind random forests later in this module.',

    { h: 'Diagnosing from the numbers' },
    { sub: 'Both errors high and close' },
    'Say training error 0.40, validation 0.42. The model cannot even fit what it has seen: underfitting, high bias. Add capacity, add better features, or reduce regularisation. Collecting more rows will barely help.',
    { sub: 'Training error low, validation error much higher' },
    'Say 97% training accuracy and 75% validation. That gap is overfitting, high variance. Get more data, use a simpler model, regularise (next lesson), or stop training earlier. **Early stopping** applies to models trained in many steps: watch the validation error and stop when it stops falling. A bigger model or longer training widens the gap.',
    'Before blaming the model, check the measurement. A gap can also come from a bad split: validation rows from a different period or group of customers, **leakage** (information in the features that would not be available at prediction time), or duplicate rows across the split. Compare with a simple baseline on the same split. A **learning curve**, validation score against the amount of training data, shows whether more data would still help: rising means yes, flat means no.',

    { h: 'Cross-validation' },
    'With little data, one validation split is small and noisy. **Cross-validation** uses all of it. Cut the training data into k equal parts called **folds**. Train k times, each time holding out a different fold for validation and training on the rest, then average the k scores. Every row is used for validation exactly once.',
    {
      code: `import numpy as np
from sklearn.model_selection import KFold

X = np.arange(6).reshape(-1, 1)
for train, val in KFold(n_splits=3).split(X):
    print(train, val)`,
      out: `[2 3 4 5] [0 1]
[0 1 4 5] [2 3]
[0 1 2 3] [4 5]`,
    },
    '`KFold` gives the row numbers for each round. Without `shuffle=True` the folds are taken in order. `reshape(-1, 1)` turns the six numbers into six rows of one feature.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Choosing a model by its training error, which always favours the most complex one.',
        'Measuring the error on `X_train` inside a search loop instead of on the validation split.',
        'Reporting the best validation score, or the training score, as the expected performance.',
        'Collecting more data to cure underfitting.',
      ],
    },
  ],

  'classical-regularisation': [
    { h: 'Charging the model for large weights' },
    'A linear model that overfits usually has large weights: it leans hard on a few features to explain noise in the training rows. **Regularisation** fights this by adding a second term to the loss that grows with the size of the weights:',
    { code: `loss = error + α × penalty` },
    'The error is the usual MSE. The **penalty** measures how big the weights are. α (alpha) is the **regularisation strength**, a number you choose. Now a large weight has to earn its place by cutting the error by more than it adds to the penalty. α sets the exchange rate between the two.',
    'The bias is not penalised. It only shifts every prediction up or down and does not make the model wiggle.',
    'In NumPy, with `X` holding one row per example and `w` the weights, `X @ w` computes the dot product of every row with `w` at once, so `X @ w + b` is the list of all predictions.',

    { h: 'Two penalties' },
    { sub: 'L2, or ridge' },
    '**L2** regularisation, used by **ridge** regression, charges the sum of the squared weights: α × Σw². For weights (1, −2, 2) and α = 0.5 that is 0.5 × (1 + 4 + 4) = 4.5. Squaring means large weights pay most, so ridge shrinks every weight towards zero, the big ones hardest, but almost never to exactly zero.',
    { sub: 'L1, or lasso' },
    '**L1** regularisation, used by the **lasso**, charges the sum of the absolute values (the sizes ignoring sign, written |w|): α × Σ|w|. The same weights give 0.5 × (1 + 2 + 2) = 2.5. Under L1 every unit of weight costs the same, however small the weight already is. That constant pressure pushes weights that do not earn their keep all the way to exactly zero, removing those features from the model. Lasso does **feature selection** for you.',
    { sub: 'Near-duplicate features' },
    'Suppose two features are almost copies. Under L2, one weight of 4 costs 16, but two weights of 2 cost 4 + 4 = 8, so ridge shares the weight between them and stays stable. Under L1 the split saves nothing (4 against 2 + 2), so lasso tends to keep one and drop the other, and which one can change from sample to sample.',

    { h: 'Seeing it in code' },
    'Ridge with growing α on data that lies exactly on y = 3x:',
    {
      code: `import numpy as np
from sklearn.linear_model import Ridge

X = np.array([[0.0], [1.0], [2.0], [3.0]])
y = 3 * X[:, 0]
for alpha in (0.01, 1, 10, 100):
    model = Ridge(alpha=alpha).fit(X, y)
    print(alpha, round(float(model.coef_[0]), 2), round(float(model.intercept_), 2))`,
      out: `0.01 2.99 0.01
1 2.5 0.75
10 1.0 3.0
100 0.14 4.29`,
    },
    'The slope shrinks from 3 towards 0 as α grows. The intercept rises towards 4.5, the mean of the targets: with the slope squashed flat, the best the unpenalised bias can do is predict the mean for everyone. Here there is no noise, so the shrinking only does harm. It pays off when part of a weight is fitting noise.',
    'Now four features, of which only the first two matter:',
    {
      code: `import numpy as np
from sklearn.linear_model import Lasso, Ridge

rng = np.random.default_rng(0)
X = rng.normal(size=(50, 4))
y = 3 * X[:, 0] - 2 * X[:, 1] + rng.normal(scale=0.5, size=50)
print((Ridge(alpha=1).fit(X, y).coef_ != 0).sum())
print(Lasso(alpha=0.1).fit(X, y).coef_.round(2))`,
      out: `4
[ 2.86 -1.83  0.    0.  ]`,
    },
    'Ridge keeps all four weights non-zero, the useless ones merely small. Lasso sets the two useless weights to exactly 0. `rng.normal` draws random numbers, and the fixed seed 0 makes them the same on every run.',

    { h: 'Scale the features first' },
    'The penalty sees only the weights, but the size a weight needs depends on the units of its feature. Take house price from distance in metres (values in the thousands) and number of rooms (values up to 6). A weight of 0.01 on metres already moves the price a lot and costs almost nothing. Rooms need a weight of several thousand to matter, so the penalty squeezes rooms hardest, for no good reason.',
    "The fix is to **standardise**: subtract each feature's mean and divide by its **standard deviation** (its typical distance from the mean), so every feature has mean 0 and a spread of 1. `StandardScaler` does it. It must learn the mean and standard deviation from the training data only, with `fit_transform` on the training set and `transform`, not `fit_transform`, on everything else. Refitting on the test set scales the same raw value differently in training and test. A **pipeline**, `make_pipeline(StandardScaler(), Ridge(alpha=1.0))`, chains the steps and gets this right for you.",

    { h: 'Choosing α' },
    'α is a **hyperparameter**: a setting you choose, not one the model learns from the data. With α = 0 you have plain least squares. As α grows, the training error rises, and the validation error falls, reaches a lowest point, then rises. With a huge α every weight is near zero and the model predicts the mean of the targets: underfitting, with both errors high and close.',
    'Try values spread over powers of ten, such as 0.01, 0.1, 1, 10, 100, and pick the one with the lowest validation error or cross-validation score. `RidgeCV(alphas=[...])` and `LassoCV` do that search for you.',
    { sub: 'The same idea under other names' },
    '`Ridge` and `Lasso` take `alpha`: larger is stronger. `LogisticRegression` takes `C`, the inverse: smaller is stronger, so to regularise more you lower `C`. Neural networks call L2 **weight decay**.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Fitting a penalised model on unscaled features.',
        'Calling `fit_transform` on the test set.',
        'Raising `C` to regularise more.',
        'Penalising the bias, or forgetting that squared weights make negative weights count too.',
        'Reading much into which of two near-copies lasso kept.',
      ],
    },
  ],

  'classical-trees': [
    { h: 'A model made of questions' },
    'A **decision tree** predicts by asking a chain of yes/no questions, like a game of twenty questions. Each question has the form `feature ≤ threshold`, for example "age ≤ 30". The answer sends the example to the left (yes) or the right (no), where the next question waits. The questions are called **nodes**, the first one the **root**, and the end points **leaves**.',
    'A leaf holds the training rows that ended up there. For a classification tree it predicts their most common class. For a **regression tree**, one that predicts a number, it predicts their mean.',
    { sub: 'An example' },
    {
      code: `from sklearn.tree import DecisionTreeClassifier, export_text

X = [[1, 10], [2, 40], [3, 20], [6, 30], [7, 50], [8, 60]]
y = [0, 0, 0, 1, 1, 1]
tree = DecisionTreeClassifier(max_depth=2, random_state=0).fit(X, y)
print(export_text(tree, feature_names=["age", "income"]))`,
      out: `|--- age <= 4.50
|   |--- class: 0
|--- age >  4.50
|   |--- class: 1`,
    },
    '`export_text` prints the questions. One question was enough. The tree puts the threshold halfway between neighbouring values, here between 3 and 6, so 4.5. Income never wins a split, so the tree ignores it.',

    { h: 'Measuring how mixed a group is' },
    'To pick a question the tree needs a score for how mixed a group of rows is. The usual one is **Gini impurity**:',
    { code: `Gini = 1 − Σ pₖ²` },
    'Here pₖ is the share of the group that belongs to class k, and Σ adds up over all classes. A **pure** group, all one class, has a single share of 1, so Gini = 1 − 1 = 0. An even mix of two classes has shares 0.5 and 0.5: Gini = 1 − (0.25 + 0.25) = 0.5. Higher means more mixed.',
    { sub: 'Worked example' },
    'A group of 5 rows: 4 of class A and 1 of class B. The shares are 0.8 and 0.2. Squared: 0.64 and 0.04. Gini = 1 − 0.68 = 0.32. With three classes in equal shares each share is 1/3, and Gini = 1 − 3 × 1/9 = 2/3. The formula works for any number of classes.',
    'Gini has a plain meaning: the chance that two rows drawn at random from the group (putting the first back before drawing the second) have different classes. **Entropy** is another impurity score; with it, the drop below is called **information gain**. In practice the two choose almost the same splits.',

    { h: 'Choosing the best split' },
    "A split turns one group, the **parent**, into two. Its score is the **weighted** average of the two sides' impurities, each side counted by its share of the rows. Then the **gain** is the parent impurity minus that weighted score. The tree tries every feature and every threshold and keeps the split with the largest gain, which is the same as the lowest weighted impurity.",
    { sub: 'Worked example' },
    'A parent of 10 rows, 5 of each class, has Gini 0.5. A split sends 2 rows left, both class A (Gini 0), and 8 right, 3 A and 5 B. The right side: shares 0.375 and 0.625, squares 0.140625 and 0.390625, Gini = 1 − 0.53125 ≈ 0.469. Weighted: 0.2 × 0 + 0.8 × 0.469 = 0.375. Gain: 0.5 − 0.375 = 0.125.',
    { sub: 'Why the weighting matters' },
    'A plain average of the two sides would count a side with 1 row as much as a side with 99. A single row is always pure, so cutting one row off would look like a great split while achieving nothing. Likewise, one pure side is no use if the other side is left badly mixed: the score counts both sides, each by its size, and a split with no pure side can still win.',
    'Building is **greedy**: take the best split now, then repeat inside each side, never going back to reconsider.',

    { h: 'Depth and overfitting' },
    "Left alone, the tree keeps splitting until every leaf is pure. On noisy data that means close to one leaf per training row. The training accuracy is 100%, and it means nothing: the tree has stored the data, noise included, and does poorly on new rows. Depth is the tree's capacity (from the overfitting lesson: how complicated a pattern it can represent).",
    "scikit-learn's defaults, `max_depth=None` and `min_samples_leaf=1`, grow the tree all the way. To limit it, set a smaller `max_depth` (how many questions deep it may go) or a larger `min_samples_leaf` (the fewest rows a leaf may hold), or prune afterwards with `ccp_alpha`. Choose the values on validation data.",

    { h: 'What trees do well and badly' },
    { sub: 'No scaling needed' },
    "A split only asks which rows fall on each side of a threshold, so only the **order** of a feature's values matters. Multiply a feature by 1,000, standardise it or take its logarithm, and the same rows are separated at every node: the thresholds change to the new units and the predictions stay the same. Trees also pick up curves and interactions between features without being told.",
    { sub: 'Weaknesses' },
    {
      list: [
        '**Unstable**: change a few rows and the root split, and so everything below it, can change.',
        'Predictions come in steps, one value per leaf.',
        '**No extrapolation**: a regression tree cannot predict beyond the targets it has seen, because each leaf is an average of training targets.',
      ],
    },
    {
      code: `from sklearn.tree import DecisionTreeRegressor

X = [[1], [2], [3], [4], [5]]
y = [3, 5, 4, 9, 8]
tree = DecisionTreeRegressor(max_depth=1, random_state=0).fit(X, y)
print(tree.predict([[0], [2], [50]]))`,
      out: '[4.  4.  8.5]',
    },
    'With one split (between 3 and 4) the left leaf predicts the mean of 3, 5, 4, which is 4, and the right leaf the mean of 9, 8, which is 8.5. At x = 50 the tree still says 8.5, wherever the trend was heading. A straight line would keep climbing.',
    'Useful attributes: `tree.get_n_leaves()` counts the leaves, `tree.score(X, y)` gives accuracy, and `tree.tree_.threshold[0]` is the root threshold.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Averaging the two sides of a split without weighting them by size.',
        'Trusting a training accuracy of 100% from an unlimited tree.',
        'Scaling features for a tree, which changes nothing.',
        'Expecting a tree to predict values beyond those it was trained on.',
      ],
    },
  ],

  'classical-ensembles': [
    { h: 'Many trees instead of one' },
    'A single decision tree is unstable: small changes in the data give a different tree. An **ensemble** combines many models into one prediction, and ensembles of trees are among the best models there are for tables. There are two ways to build one, and they fix opposite problems. Recall from the overfitting lesson: **variance** is error from a model that changes a lot with its training sample, **bias** is error from a model too simple for the pattern.',

    { h: 'Bagging and random forests' },
    { sub: 'Bootstrap samples' },
    'A **bootstrap sample** is made by drawing rows from the training data **with replacement**: each draw picks any row, even one already picked, until you have as many rows as the original. Some rows appear twice or more, others not at all.',
    {
      code: `import numpy as np

rng = np.random.default_rng(1)
sample = rng.integers(0, 6, size=6)
print(sample.tolist(), [r for r in range(6) if r not in sample])`,
      out: '[2, 3, 4, 5, 0, 0] [1]',
    },
    'Row 0 was drawn twice and row 1 never. The rows a sample misses are **out-of-bag** for the tree trained on it. On a large dataset about 37% of rows are out-of-bag for each tree.',
    { sub: 'Averaging away variance' },
    '**Bagging** trains every tree on its own bootstrap sample and combines them: the average for numbers, a majority vote for classes. A **random forest** adds a second source of difference: at each split a tree may only choose among a random subset of the features, set by `max_features`. The trees are deep and each one overfits, but each in its own way, so averaging cancels much of their error. This lowers variance.',
    'The randomness is essential. Train every tree on all the rows with all the features and tree building gives the same tree every time: their average is that one tree.',
    {
      code: `import numpy as np

votes = np.array([[1, 1, 0, 0],
                  [0, 1, 0, 1],
                  [1, 1, 1, 0]])
print(votes.mean(axis=0), (votes.mean(axis=0) > 0.5).astype(int))`,
      out: '[0.66666667 1.         0.33333333 0.33333333] [1 1 0 0]',
    },
    'Each row is one tree, each column one example. `axis=0` averages down each column, giving the share of trees voting 1 for each example; above 0.5 the majority says 1. `astype(int)` turns True and False into 1 and 0.',
    { sub: 'Settings and the out-of-bag score' },
    'More trees never make a forest overfit: the average gets steadier, the score levels off, and extra trees only cost time. A few hundred (`n_estimators`) is typical; then tune `max_features` and `min_samples_leaf`. With `oob_score=True` each tree is scored on its out-of-bag rows, which gives a validation estimate without a separate split.',

    { h: 'Gradient boosting' },
    '**Boosting** builds trees one after another. It starts from a simple guess, such as the mean of the targets. Each new tree is small and is fitted to the **residuals**, what the ensemble still gets wrong (target minus current prediction). It is then added with a small weight, the **learning rate**. A long string of weak corrections adds up to a strong model, so boosting lowers bias.',
    { sub: 'Boosting by hand' },
    'Pretend each "tree" predicts the residuals exactly, and use a learning rate of 0.25 on targets 4, 8 and 12:',
    {
      code: `import numpy as np

y = np.array([4.0, 8.0, 12.0])
pred = np.full(3, y.mean())
for _ in range(3):
    pred = pred + 0.25 * (y - pred)
    print(pred.tolist())`,
      out: `[7.0, 8.0, 9.0]
[6.25, 8.0, 9.75]
[5.6875, 8.0, 10.3125]`,
    },
    'The start is 8 for everyone. Each round closes a quarter of the remaining gap. `np.full(3, v)` makes an array of three copies of v.',
    { sub: 'Learning rate, number of trees and early stopping' },
    'The two settings work as a pair. Halve the learning rate and each tree contributes half as much, so you need roughly twice the trees to get as far; too few and the model underfits, with training and validation scores both poor. A lower rate with more trees usually ends a little better. Trees are shallow, depth around 3 to 8.',
    'Unlike a forest, boosting does overfit if you keep adding trees: the training loss keeps falling while the validation loss bottoms out and climbs. Do not guess the count. Set it high and use **early stopping**: watch the validation loss after each tree and stop once it has not improved for some rounds. In `HistGradientBoostingClassifier`, `max_iter` is the number of trees, and early stopping only happens with `early_stopping=True`; then `n_iter_no_change` sets the patience and `validation_fraction` the slice of training data held back. If you instead collect the validation error after every round in a list, the best round is where the error is lowest (`np.argmin`), plus 1 because the list starts at the one-tree model.',

    { h: 'Why they win on tables' },
    'Tables have columns in different units, skewed values, outliers, missing entries, and effects that bend and interact. Trees take all of that as it comes: only the order of values matters, so no scaling or log is needed, and the histogram-based boosters (`HistGradientBoostingClassifier`, XGBoost, LightGBM) learn at each split which side missing values should go to. Each column means something by itself, which is what a split can use.',
    'They are the wrong tool for images, audio and text, where a single pixel or sound sample means nothing alone and the signal lies in patterns across neighbours. Neural networks learn those. And like any tree, they do not extrapolate. A sound routine for a table: a linear or logistic baseline first, then gradient boosting.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Fearing that more trees will make a forest overfit.',
        'Lowering the learning rate without adding trees.',
        'Setting `n_iter_no_change` but leaving early stopping off.',
        'Picking the number of rounds with `argmax` of the error instead of `argmin`.',
        'Scaling or imputing every column for a histogram booster that does not need it.',
      ],
    },
  ],

  'classical-kmeans': [
    { h: 'Finding groups without labels' },
    'Every model so far learnt from labelled examples: rows with the right answer attached. That is **supervised** learning. In **unsupervised** learning there are no labels, only points, and the task is to find structure. **Clustering** looks for groups of points that sit close together: customers who behave alike, documents on the same topic.',
    '**k-means** is the most used clustering method. You choose a number k, and it splits the points into k groups. Each group is described by its **centroid**: the mean of its points, entry by entry. The centroid of (1, 2), (3, 2) and (5, 8) is ((1 + 3 + 5) ÷ 3, (2 + 2 + 8) ÷ 3) = (3, 4).',
    { sub: 'Distance' },
    'k-means measures closeness with the **squared distance**: subtract the two points entry by entry, square the differences and add them. From (0, 0) to (3, 1) it is 3² + 1² = 10. (The ordinary distance is the square root of that, but the nearest centroid is the same either way.)',

    { h: 'The two-step loop' },
    'Start with k centroids somewhere, then repeat two steps until nothing changes:',
    {
      list: [
        '**Assign**: give every point to its nearest centroid.',
        '**Update**: move every centroid to the mean of the points it was given.',
      ],
    },
    { sub: 'Worked example' },
    'On a number line, points 1, 2, 3, 8 and 9, with k = 2 and centroids starting at 1 and 4. Assign: 1 and 2 go to the centroid at 1; 3, 8 and 9 go to the centroid at 4. Update: the centroids move to 1.5 and (3 + 8 + 9) ÷ 3 ≈ 6.67. Assign again: now 3 is nearer 1.5 (distance 1.5) than 6.67 (distance 3.67), so it changes group. Update: 2 and 8.5. Assign once more: nothing changes, so the loop stops with groups {1, 2, 3} and {8, 9}. Notice how one far point can pull a centroid: the mean of 3, 8 and 9 sat well away from 3.',
    { sub: 'Inertia, and why the loop stops' },
    'The **inertia** is the total squared distance from each point to its own centroid. Here it is 1 + 0 + 1 + 0.25 + 0.25 = 2.5. Neither step can raise it. Assign moves each point to a centroid that is nearer or the same. Update puts each centroid at the mean, and the mean is the single position with the smallest total squared distance to a set of points. A total that never rises and cannot drop below zero must settle, so k-means always stops.',

    { h: 'Starts and local optima' },
    "It stops at the nearest dip, a **local optimum**, which need not be the best grouping. Where it ends depends on where the centroids start. If two start inside the same blob, they share it and a third has to cover two other blobs on its own; no single step can repair that, and more steps change nothing. The remedies: start from points spread apart (the **k-means++** method, scikit-learn's default), run the whole thing from several starts with `n_init`, and keep the run with the lowest inertia. Fix `random_state` to get the same result each time.",
    {
      code: `from sklearn.cluster import KMeans

X = [[1], [2], [3], [8], [9]]
km = KMeans(n_clusters=2, n_init=10, random_state=0).fit(X)
print(sorted(km.cluster_centers_.ravel().tolist()), round(km.inertia_, 2))`,
      out: '[2.0, 8.5] 2.5',
    },
    "`cluster_centers_` holds one row per centroid; `ravel()` flattens it to a plain list. `labels_` gives each point's cluster number, and `fit_predict(X)` fits and returns those labels in one go.",

    { h: 'The steps in NumPy' },
    "With `X` of shape (n, d), n points with d features, the centroid of cluster j is `X[labels == j].mean(axis=0)`. `labels == j` picks out that cluster's rows, and `axis=0` averages down the columns, giving one number per feature. `axis=1` would average across each row instead, one number per point, which is wrong.",
    "For the assign step you need each point's squared distance to every centroid. For one point:",
    {
      code: `import numpy as np

C = np.array([[0.0, 0.0], [4.0, 4.0]])
p = np.array([4.0, 1.0])
d = ((C - p) ** 2).sum(axis=1)
print(d.tolist(), int(d.argmin()))`,
      out: '[17.0, 9.0] 1',
    },
    '`C - p` subtracts the point from every centroid row, `sum(axis=1)` adds up each row, and `argmin` returns the position of the smallest value. Do this for every point (with a loop, or with NumPy **broadcasting**, which lines up arrays of different shapes) to get the labels.',

    { h: 'Choosing k' },
    'Inertia cannot choose k for you. It always falls as k grows, down to 0 when every point is its own cluster. For the five points above, k = 1, 2, 3, 5 give inertia 53.2, 2.5, 1.0 and 0. Plot inertia against k and look for the **elbow**: the k after which each extra cluster removes only a little. Here that is k = 2, after a drop of over 50 and then drops of 1.5 or less. Real elbows are often less clear. The **silhouette score** is another check: for each point it compares the distance to its own cluster with the distance to the next nearest, and higher is better. Often the best guide is the purpose: how many groups can the people who asked for them act on.',

    { h: 'Where k-means goes wrong' },
    { sub: 'Units' },
    'Distance adds up differences across features, so a feature in large numbers decides everything. With age in years and income in pounds, a 30-year age gap is nothing beside a 500-pound income gap. Standardise first (subtract the mean, divide by the standard deviation) so each feature counts equally.',
    { sub: 'Shapes and existence' },
    {
      list: [
        'It favours compact, round groups of similar size. Long, thin or curved groups get cut across; a **Gaussian mixture** or the density-based **DBSCAN** suits those.',
        'Outliers drag centroids towards them.',
        'It always returns k clusters, even for points scattered evenly with no groups at all. Treat clusters as a proposal and check that they are stable across seeds and samples and useful for the purpose.',
      ],
    },
  ],

  'classical-pca': [
    { h: 'Too many columns that say the same thing' },
    'Real tables often have features that move together: height and weight, clicks and page views. Two such columns carry little more information than one. **PCA**, principal component analysis, replaces the original features with new axes chosen so that the first few hold most of the variation. You then keep only those, getting fewer columns while losing little.',
    { sub: 'Variance and spread' },
    'The **variance** of a list of numbers is the average squared distance from their mean. For 2, 4 and 9 the mean is 5, the distances are −3, −1 and 4, and the variance is (9 + 1 + 16) ÷ 3 ≈ 8.67. Big variance means spread out. PCA treats spread as information: a column that hardly varies cannot tell rows apart.',

    { h: 'Variance along a direction' },
    "First **centre** the data: subtract each column's mean, so the cloud of points sits around (0, 0). Then pick a direction and give it length 1 (a **unit vector**, from the maths module: divide a vector by its length). The **projection** of a point onto that direction is the dot product of the point with the unit vector: how far along that direction the point lies. Project every point, and take the variance of the results.",
    { sub: 'Worked example' },
    'Points (1, 1), (3, 1) and (2, 4) have mean (2, 2). Centred: (−1, −1), (1, −1), (0, 2). Along the x direction (1, 0) the projections are −1, 1, 0, variance 2/3. Along y (0, 1) they are −1, −1, 2, variance (1 + 1 + 4) ÷ 3 = 2. So the spread lies mostly along y.',
    {
      code: `import numpy as np

X = np.array([[1.0, 1.0], [3.0, 1.0], [2.0, 4.0]])
centred = X - X.mean(axis=0)
u = np.array([1.0, 1.0]) / np.linalg.norm([1.0, 1.0])
print(round(float(np.var(centred @ u)), 3))`,
      out: '1.333',
    },
    'Along the diagonal the variance is 4/3. `@` is the dot product, applied here to every row at once, and `np.var` divides by the number of points. A direction of length 3 would give a different number, which is why it must be made a unit vector first.',

    { h: 'Principal components' },
    'The first **principal component** is the direction with the largest variance. The second is the direction of largest remaining variance at right angles to the first, and so on, one per original feature. Each point is then described by its projections onto the components, its new coordinates.',
    { sub: 'Explained variance ratio' },
    'The variances along all the components add up to the total variance of the data, so each component holds a share of it: the **explained variance ratio**. The shares add up to 1. In two dimensions, if the first component holds 85%, the one at right angles holds the other 15%. If components have variances 8, 4, 2 and 1, the first two keep 12 ÷ 15 = 80%.',
    {
      code: `import numpy as np
from sklearn.decomposition import PCA

X = np.array([[3.0, 0.0], [0.0, 2.0], [-3.0, 0.0], [0.0, -2.0]])
print(PCA().fit(X).explained_variance_ratio_.round(2).tolist())`,
      out: '[0.69, 0.31]',
    },
    'The points are already centred. Squares along x add to 18, along y to 8, so x holds 18 ÷ 26 ≈ 0.69. If one column were an exact multiple of another, every point would lie on one line and the first component would hold everything: [1.0, 0.0].',

    { h: 'Using PCA in scikit-learn' },
    {
      code: `import numpy as np
from sklearn.decomposition import PCA

X = np.random.default_rng(0).normal(size=(8, 5))
pca = PCA(n_components=3)
Z = pca.fit_transform(X)
print(Z.shape, pca.components_.shape)`,
      out: '(8, 3) (3, 5)',
    },
    'Eight rows stay eight rows, now with three columns, one per kept component. `components_` has one row per component, and each row is a direction in the original five features. `n_components` can also be a fraction: `PCA(n_components=0.9)` keeps as many components as it takes to explain 90% of the variance.',
    { sub: 'Scale first, fit on training data only' },
    "PCA centres the data but does not scale it. A column measured in large numbers has a large variance in raw units and becomes the first component by itself: PCA finds the column with the biggest numbers. Unless all features share a unit, standardise first. In a pipeline the steps run in order, so the scaler goes before PCA: `make_pipeline(StandardScaler(), PCA(...), model)`. Like a scaler, PCA is fitted on the training data and then reused with `transform` on everything else. A second PCA fitted on the test set finds its own directions, possibly reordered or flipped, so its columns would mean something different.",

    { h: 'When to use it and when not' },
    {
      list: [
        'Use it to draw many-feature data in two dimensions, to compress many correlated features, to help distance-based models such as k-means, and to remove near-duplicate features before a linear model.',
        'Each component is a weighted mix of all the original features, so you lose their meaning. You can show which features weigh most in a component, but it is not any one of them.',
        'Tree ensembles on an ordinary table rarely gain from it, and you lose the ability to explain them.',
        'PCA never looks at the target. It keeps directions with the most spread, which need not be the ones that predict anything. If the classes differ along a low-variance direction, dropping components drops the signal. Compare scores with and without PCA.',
      ],
    },
  ],

  'classical-lab': [
    { h: 'What you are building' },
    'This lab rebuilds logistic regression (the logistic lesson: a linear score squashed by the sigmoid into a probability) using only NumPy. The pieces are the sigmoid, the forward pass, the loss, the gradients, the update step and the training loop. The same skeleton trains every neural network later in the course; only the model in the middle grows.',
    'The data is a matrix `X` of shape (n, d): n rows (examples) and d columns (features). The labels `y` have shape (n,), each 0 or 1. The model is a weight vector `w` of shape (d,) and one number `b`, the bias.',

    { h: 'Shapes and the @ operator' },
    "An array's **shape** lists its size along each axis. (3, 2) is three rows of two numbers. (3,) is a flat list of three numbers, a vector.",
    '`A @ B` is matrix multiplication. For a matrix `X` of shape (n, d) and a vector `w` of shape (d,), `X @ w` takes the dot product of every row with `w` and returns shape (n,): one score per row. `X.T` is the **transpose**, the matrix flipped so rows become columns, shape (d, n). So `X.T @ v`, for `v` of shape (n,), gives one number per feature: for each column of X, the sum of that column times v.',
    {
      code: `import numpy as np

X = np.array([[1.0, 2.0], [3.0, 0.0], [0.0, 1.0]])
w = np.array([0.5, -1.0])
v = np.array([1.0, 0.0, 2.0])
print(X.shape, (X @ w).tolist(), (X.T @ v).tolist())`,
      out: '(3, 2) [-1.5, 1.5, -1.0] [1.0, 4.0]',
    },
    'Check by hand: row one gives 1×0.5 + 2×(−1) = −1.5. For `X.T @ v`, column one gives 1×1 + 3×0 + 0×2 = 1. The inner sizes must match: (n, d) @ (d,) works, (n, d) @ (n,) fails unless n happens to equal d. Writing the shapes next to each line catches most bugs.',
    { sub: 'The silent shape bug' },
    'An array of shape (n, 1) is a column, not a flat vector. Subtracting a (3,) array from a (3, 1) array does not fail: NumPy **broadcasting** stretches both to (3, 3) and subtracts every pair. The loss and gradients come out wrong with no error. Keep labels and predictions flat, shape (n,).',

    { h: 'The forward pass' },
    'The **forward pass** turns inputs into predictions: the scores `X @ w + b`, one per row, then the sigmoid `1 / (1 + e⁻ᶻ)` on each. Use `np.exp`, which works element by element on numbers and arrays of any shape. `math.exp` only accepts single numbers and fails on an array.',
    'The bias is a single number added to every score. With all weights zero every row gets the same probability, sigmoid(b).',

    { h: 'The loss without an if' },
    'The log loss charges −log(p) for a label of 1 and −log(1 − p) for a label of 0. With arrays, write both terms and let the label choose: `y × log(p) + (1 − y) × log(1 − p)`. When y is 1 the second term is multiplied by 0, when y is 0 the first is. Average and negate.',
    {
      code: `import numpy as np

y = np.array([1.0, 0.0, 1.0])
p = np.array([0.7, 0.4, 0.9])
print(np.round(y * np.log(p) + (1 - y) * np.log(1 - p), 3).tolist())`,
      out: '[-0.357, -0.511, -0.105]',
    },
    { sub: 'Clipping' },
    'If a probability rounds to exactly 0 or 1, log(0) is minus infinity, and one such row makes the average `inf` or `nan` (not a number). **Clip** first: `np.clip(p, low, high)` replaces anything below `low` with `low` and anything above `high` with `high`. A tiny margin such as 1e-12 (0.000000000001) keeps the loss finite while a confident mistake still costs a lot.',
    'A useful landmark: predicting 0.5 for every row costs −log(0.5) = log 2 ≈ 0.693. A loss stuck at 0.693 means the model has learnt nothing.',

    { h: 'Gradients and the update' },
    'The logistic lesson gave the gradient for one example as (p − y) × x. Call `p − y` the **error** of each row. Averaged over the rows, the gradient for weight j is the mean over rows of error × (feature j). That is what `X.T @ error / n` computes for all weights at once: shape (d,), one number per feature. The bias has no feature attached, so its gradient is the mean of the error. Each row pushes the weights in the direction of its features, in proportion to how wrong it was.',
    'The **update** moves every parameter a small step against its gradient: new w = w − lr × grad_w, and the same for b, with learning rate lr. **Training** repeats gradients then update for a fixed number of steps, starting from zeros. Zero is a safe start here because the log loss of logistic regression has a single valley.',
    { sub: 'Checking a gradient numerically' },
    'A hand-written gradient can be wrong while the code runs fine. Check it: nudge one parameter up by a tiny h and down by h, and measure the slope of the loss, (loss(w + h) − loss(w − h)) ÷ 2h. It should match your formula to several decimals. For f(w) = (w − 3)² at w = 1:',
    {
      code: `def f(w):
    return (w - 3) ** 2

h = 1e-5
print(round((f(1 + h) - f(1 - h)) / (2 * h), 4))`,
      out: '-4.0',
    },
    'The exact slope is 2 × (1 − 3) = −4. Do the same for each weight in turn, holding the others still.',

    { h: 'Measuring accuracy' },
    'To turn probabilities into classes, compare with a threshold: `p >= threshold` gives an array of True and False. Comparing that with `y == 1` gives True where the prediction is right, and the mean of a True/False array is the share of Trues, because True counts as 1.',
    {
      code: `import numpy as np

y = np.array([1, 0, 0, 1])
pred = np.array([True, False, True, True])
print(float(np.mean(pred == (y == 1))))`,
      out: '0.75',
    },
    'Accuracy is a weak check on its own: it hides how confident the model was and misleads when one class is rare.',

    { h: 'When training goes wrong' },
    {
      list: [
        'Print the shapes of `X`, `y`, `w` and the predictions first.',
        'Check the labels are exactly 0 and 1, not −1 and +1 or strings.',
        'Standardise the features. A column in the thousands gives huge scores, the sigmoid saturates at 0 or 1, and training explodes or crawls.',
        'If the loss jumps about or grows, lower the learning rate by ten.',
        'Clip probabilities before the log to stop `nan`.',
        'Run a numerical gradient check.',
        'Try to overfit ten rows: a correct loop drives their loss close to 0.',
        'Compare with `LogisticRegression` on the same data to see what is reachable.',
      ],
    },
  ],
}
