import type { Module } from '../types'

export const classical: Module = {
  id: 'classical',
  title: 'Classical machine learning',
  summary: 'Linear models, trees, ensembles, clustering and PCA: the models that still win on tabular data and that every later idea builds on.',
  lessons: [
    {
      id: 'classical-linear',
      title: 'Linear regression and least squares',
      summary: 'Predict a number as a weighted sum, and find the weights that make the squared error smallest.',
      widget: 'classical-linear',
      text: [
        'A linear model predicts a number as a weighted sum of the features plus a constant: `pred = w·x + b`. There is one weight per feature, and the bias `b` is the prediction when every feature is zero. With one feature it is a straight line with slope `w`.',
        'The **residual** of an example is its target minus its prediction. The **mean squared error** (MSE) squares every residual and averages them. **Least squares** means choosing the weights that make the MSE as small as possible. For a linear model there is an exact formula for that, which is what `LinearRegression` uses. Gradient descent on the same loss walks to the same weights, and is what you use when the data is too big for the formula.',
        { code: `from sklearn.linear_model import LinearRegression

model = LinearRegression().fit(X_train, y_train)
model.coef_, model.intercept_        # the weights and the bias
model.score(X_test, y_test)          # R² on data the model has not seen` },
        'Squaring has a cost. A residual of 10 adds 100 to the sum, a residual of 1 adds 1, so one point far from the rest can outweigh all the others and pull the line towards itself. The figure shows it. Look for such points before trusting a fit. If they are errors, fix or drop them. If they are real, a log transform of the target or a loss that grows more slowly (absolute error, Huber) keeps them from running the model.',
        'A weight says how much the prediction changes when its feature goes up by one unit and the others stay put. So its size depends on the units: a weight for metres is a thousand times smaller than the weight for the same length in kilometres. Compare weights only after putting the features on one scale. And when two features carry nearly the same information, the model can split the effect between them almost any way it likes: the predictions stay good, but the individual weights mean little.',
        'Always compare with the dumbest baseline: predicting the mean of the training targets for everyone. **R²** does this for you. It is `1 − MSE ÷ variance of the targets`: 1 is a perfect fit, 0 is no better than the mean, and on test data it can be negative, which means worse than the mean.',
      ],
      rules: [
        'Prediction: `w·x + b`. Residual: target − prediction. MSE: the average squared residual.',
        'Least squares finds the weights with the smallest MSE: by formula on small data, by gradient descent on large.',
        'Squared error lets one outlier pull the whole line. Look at the residuals.',
        'A weight is "per unit of its feature". Do not compare weights across features with different scales.',
        'R² of 0 means no better than predicting the mean. Measure it on held-out data, never on the rows you fitted.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'classical-linear-1',
          ask: 'A model with weights (2, −1) and bias 3 gets an example with features (4, 5). What does it predict?',
          answer: 6,
          check: 'np.dot([2, -1], [4, 5]) + 3',
          why: '2×4 + (−1)×5 + 3 = 8 − 5 + 3 = 6. A linear model is a dot product plus a bias.',
        },
        {
          kind: 'number',
          id: 'classical-linear-2',
          ask: 'The targets are 3, 6 and 5. The model predicts 3, 5 and 7. What is the mean squared error? (Two decimals.)',
          answer: 1.6667,
          tol: 0.01,
          check: 'np.mean((np.array([3, 6, 5]) - np.array([3, 5, 7])) ** 2)',
          why: 'The residuals are 0, 1 and −2. Squared: 0, 1 and 4. Their average is 5/3 ≈ 1.67. The sign of a residual disappears when it is squared.',
        },
        {
          kind: 'output',
          id: 'classical-linear-3',
          ask: 'What does this print?',
          code: `from sklearn.linear_model import LinearRegression

X = [[0], [1], [2], [3]]
y = [1, 3, 5, 7]
model = LinearRegression().fit(X, y)
print(round(float(model.coef_[0]), 2), round(float(model.intercept_), 2))`,
          answer: '2.0 1.0',
          hint: 'How much does y go up when x goes up by 1? What is y at x = 0?',
          why: 'The points lie exactly on y = 2x + 1, so least squares recovers slope 2 and intercept 1 with zero error. `X` is a list of rows, which is why each x sits in its own brackets.',
        },
        {
          kind: 'number',
          id: 'classical-linear-4',
          ask: 'How many times more does a residual of 10 add to the squared error than a residual of 2?',
          answer: 25,
          why: '10² = 100 against 2² = 4. A point five times further from the line counts twenty-five times as much, which is why far-off points dominate a least-squares fit.',
        },
        {
          kind: 'choice',
          id: 'classical-linear-5',
          ask: 'In the figure, press Reset and then "Make one outlier". One point of eight moves. The slope goes from 0.45 to 0.90 and the error from about 0.10 to about 1.89. Why does one point have that much pull?',
          options: [
            'Least squares gives every point the same pull, so this is a bug in the figure',
            'Its residual is large and is squared, so reducing that one residual is worth making all the others a little worse',
            'The point is on the right, and points on the right always count for more',
            'The line must pass through the highest point',
          ],
          answer: 1,
          why: 'The fit minimises the sum of squares, and the outlier contributes most of it. Tilting the line cuts that one huge term at the price of seven small ones. The slope has doubled although seven of the eight points did not change.',
        },
        {
          kind: 'output',
          id: 'classical-linear-6',
          ask: 'The same four x values, with the last target changed from 3 to 13. What does this print?',
          code: `from sklearn.linear_model import LinearRegression

X = [[0], [1], [2], [3]]
for y in ([0, 1, 2, 3], [0, 1, 2, 13]):
    model = LinearRegression().fit(X, y)
    print(round(float(model.coef_[0]), 2))`,
          answer: '1.0\n4.0',
          hint: 'The slope is Σ(x − mean x)(y − mean y) ÷ Σ(x − mean x)². The mean of x is 1.5.',
          why: 'The first targets lie on y = x, so the slope is 1. With the last target at 13 the mean of y is 4, the top of the formula is 6 + 1.5 − 1 + 13.5 = 20 and the bottom is 5, so the slope is 4. One bad value out of four has quadrupled it.',
        },
        {
          kind: 'bug',
          id: 'classical-linear-7',
          ask: 'This should report the mean squared error. It prints a number close to 0 even for a poor model.',
          code: `import numpy as np

def mse(y, pred):
    return np.mean(y - pred) ** 2`,
          line: 4,
          fix: '    return np.mean((y - pred) ** 2)',
          why: 'This averages the residuals first and squares afterwards. Positive and negative residuals cancel in the average, so a model that is wrong by +5 on half the rows and −5 on the rest scores 0. Square each residual, then average.',
        },
        {
          kind: 'bug',
          id: 'classical-linear-8',
          ask: 'The reported score is much better than the model does on new data.',
          code: `from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(X, y, random_state=0)
model = LinearRegression()
model.fit(X_test, y_test)
print(model.score(X_test, y_test))`,
          line: 6,
          fix: 'model.fit(X_train, y_train)',
          why: 'The model is fitted on the test rows and then scored on the same rows, so the score measures memory, not prediction. Fit on the training split and keep the test split for scoring only.',
        },
        {
          kind: 'choice',
          id: 'classical-linear-9',
          ask: 'A regression model scores R² = −0.3 on the test set. What does that tell you?',
          options: [
            'The score is impossible, so the code must be wrong',
            'The model explains 30% of the variance',
            'The model is worse than predicting the mean target for every row',
            'The features are negatively correlated with the target',
          ],
          answer: 2,
          why: 'R² is 1 − MSE ÷ variance. It is 0 when the model matches the "always predict the mean" baseline and negative when its error is larger than that. On training data least squares cannot do worse than the mean, but on new data it can.',
        },
        {
          kind: 'choice',
          id: 'classical-linear-10',
          ask: 'A house-price model has a weight of 150 for floor area in m² and 20,000 for the number of bedrooms. A colleague concludes that bedrooms matter far more than area. What is wrong with that?',
          options: [
            'Nothing: a larger weight means a more important feature',
            'The weights are per unit, and the units differ: 100 m² more area moves the price by 15,000, about the same as one more bedroom',
            'Weights can only be compared when they are negative',
            'Linear regression cannot use counts such as bedrooms',
          ],
          answer: 1,
          why: 'A weight is the change in the prediction per one unit of its feature, and one m² is a much smaller step than one bedroom. Standardise the features first if you want weights you can compare.',
        },
        {
          kind: 'choice',
          id: 'classical-linear-11',
          ask: 'You add "area in square feet" to a model that already has "area in m²". The test error is unchanged, but the two weights come out as +4,100 and −380 and swing wildly when you refit on a new sample. What is going on?',
          options: [
            'The two features carry the same information, so many pairs of weights fit equally well and the data cannot choose between them',
            'The model is underfitting',
            'Square feet are a better unit than m²',
            'The learning rate is too high',
          ],
          answer: 0,
          why: 'With near-duplicate features only the combined effect is pinned down. Predictions stay fine while the individual weights become unstable and unreadable. Drop one of the pair, or regularise (next lessons).',
        },
        {
          kind: 'write',
          id: 'classical-linear-12',
          numpy: true,
          ask: 'Write one step of gradient descent for the line `pred = w * x + b` under mean squared error. The gradients are `2 × mean(error × x)` for `w` and `2 × mean(error)` for `b`, where `error = pred − y`.',
          starter: `import numpy as np

def gradient_step(w, b, x, y, lr):
    # x, y: 1-D arrays of the same length
    # return the new (w, b)
    pass`,
          solution: `import numpy as np

def gradient_step(w, b, x, y, lr):
    error = w * x + b - y
    grad_w = 2 * np.mean(error * x)
    grad_b = 2 * np.mean(error)
    return w - lr * grad_w, b - lr * grad_b`,
          tests: `x = np.array([1.0, 2.0, 3.0])
y = np.array([2.0, 4.0, 6.0])
out = gradient_step(0.0, 0.0, x, y, 0.1)
assert out is not None, "the function returns nothing yet"
w, b = out
assert abs(w - 1.8666667) < 1e-5, f"from w=0, b=0 with lr 0.1 the new w should be about 1.8667, got {w}"
assert abs(b - 0.8) < 1e-9, f"from w=0, b=0 with lr 0.1 the new b should be 0.8, got {b}"
w, b = gradient_step(2.0, 0.0, x, y, 0.1)
assert abs(w - 2) < 1e-9 and abs(b) < 1e-9, "at the exact solution (w=2, b=0) the error is zero, so nothing should move"
w, b = 0.0, 0.0
for _ in range(2000):
    w, b = gradient_step(w, b, x, y, 0.05)
assert abs(w - 2) < 1e-3 and abs(b) < 1e-2, f"repeated steps should arrive at w=2, b=0, got w={w}, b={b}"`,
          why: 'The error times the input says how to change the slope, and the error alone says how to change the bias. Repeating this step reaches the same line that the least-squares formula gives in one go.',
        },
      ],
    },
    {
      id: 'classical-logistic',
      title: 'Logistic regression',
      summary: 'Turn a linear score into a probability, draw the boundary, and score it with log loss.',
      widget: 'classical-logistic',
      text: [
        'For a yes/no target, logistic regression computes the same linear score, `z = w·x + b`, and then squashes it with the **sigmoid**: `p = 1 / (1 + e⁻ᶻ)`. The result is between 0 and 1 and is read as the probability of class 1. A score of 0 gives 0.5, a large positive score gives nearly 1, a large negative score nearly 0.',
        'The **decision boundary** is where the score is zero, so `p = 0.5`. With one feature it is the point `x = −b / w`. With two it is a straight line, with more a flat plane: logistic regression is a linear classifier. The bias moves the boundary and the size of the weights sets how fast the probability changes as you cross it. Turning the probability into a decision needs a **threshold**. 0.5 is only the default: lower it to catch more positives at the price of more false alarms.',
        'The loss is **log loss**: `−log(p)` when the label is 1 and `−log(1 − p)` when it is 0, averaged over the examples. It is small when the model gives the truth a high probability and very large when the model is confident and wrong. There is no formula for the best weights, so they are found by gradient descent. The gradient has a familiar shape: `(p − y) × x`.',
        'Do not use linear regression for classes. Its output is not kept between 0 and 1, so it cannot be read as a probability. Worse, squared error punishes being too right: a point far on the correct side, with a score of 5 for a label of 1, counts as an error of 4, and the line swings to reduce it. Easy points far from the boundary end up moving the boundary.',
        { code: `from sklearn.linear_model import LogisticRegression

model = LogisticRegression(C=1.0).fit(X_train, y_train)
model.predict_proba(X_test)[:, 1]    # probability of class 1
model.predict(X_test)                # the class, using a threshold of 0.5` },
        'Two practical points. If the classes can be separated perfectly, the loss keeps falling as the weights grow, so unregularised weights head for infinity and the probabilities become 0 or 1. That is one reason scikit-learn regularises by default: `C` is the inverse of the strength, so a smaller `C` means a stronger pull towards small weights. Because of that penalty, scale the features first.',
      ],
      rules: [
        'Probability = sigmoid(w·x + b). Score 0 means 0.5.',
        'The boundary is where the score is zero. It is straight: a point, a line or a plane.',
        'Log loss: `−log` of the probability given to the true class. Confident and wrong costs most.',
        '`predict_proba` gives probabilities, `predict` applies a 0.5 threshold. Choose your own threshold from the costs.',
        'In scikit-learn a smaller `C` means stronger regularisation.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'classical-logistic-1',
          ask: 'A logistic model has w = 2 and b = −1. What probability does it give for x = 0.5?',
          answer: 0.5,
          check: '1 / (1 + math.exp(-(2 * 0.5 - 1)))',
          why: 'The score is 2×0.5 − 1 = 0, and the sigmoid of 0 is 0.5. This x is exactly on the decision boundary.',
        },
        {
          kind: 'output',
          id: 'classical-logistic-2',
          ask: 'What does this print?',
          code: `import math

def sigmoid(z):
    return 1 / (1 + math.exp(-z))

print(round(sigmoid(0), 2), round(sigmoid(2), 2), round(sigmoid(-2), 2))`,
          answer: '0.5 0.88 0.12',
          hint: 'e² is about 7.39. The curve is symmetric: sigmoid(−z) = 1 − sigmoid(z).',
          why: 'sigmoid(0) = 1/2. sigmoid(2) = 1 / (1 + 0.135) ≈ 0.88. By symmetry sigmoid(−2) = 1 − 0.88 = 0.12. A score of ±2 is already a fairly confident prediction.',
        },
        {
          kind: 'number',
          id: 'classical-logistic-3',
          ask: 'A model with one feature has w = 2 and b = −6. At which value of x is its decision boundary?',
          answer: 3,
          check: '6 / 2',
          why: 'The boundary is where w·x + b = 0, so x = −b / w = 6 / 2 = 3. Above 3 the model says class 1, below it class 0.',
        },
        {
          kind: 'number',
          id: 'classical-logistic-4',
          ask: 'A model says P(class 1) = 0.9. The true label is 0. What is the log loss for that example, using the natural logarithm? (Two decimals.)',
          answer: 2.3026,
          tol: 0.01,
          check: '-math.log(1 - 0.9)',
          hint: 'What probability did the model give to the class that turned out to be true?',
          why: 'The model gave the true class (0) a probability of 0.1, and −ln(0.1) ≈ 2.30. Had the label been 1, the loss would have been −ln(0.9) ≈ 0.11: about twenty times smaller.',
        },
        {
          kind: 'output',
          id: 'classical-logistic-5',
          ask: 'What does this print?',
          code: `from sklearn.linear_model import LogisticRegression

X = [[0], [1], [2], [3]]
y = [0, 0, 1, 1]
model = LogisticRegression().fit(X, y)
print(model.predict([[0.5], [2.5]]))
print(model.predict_proba([[1.5]]).round(2))`,
          answer: '[0 1]\n[[0.5 0.5]]',
          hint: 'The data is symmetric around x = 1.5. `predict_proba` returns one column per class.',
          why: 'The classes change between 1 and 2, and by symmetry the boundary is at 1.5. `predict` returns classes. `predict_proba` returns a row per example with a column per class, and exactly on the boundary both are 0.5.',
        },
        {
          kind: 'choice',
          id: 'classical-logistic-6',
          ask: 'In the figure, set w = 2 and b = −2, then w = 8 and b = −8. Both put the boundary at x = 1 and both get 10 of 12 points right. The log loss is about 0.26 for the first and 0.54 for the second. Why is the steeper curve worse?',
          options: [
            'Log loss always prefers small weights',
            'The two points on the wrong side of the boundary now get probabilities close to 0 for their true class, and that costs more than the extra confidence on the others gains',
            'The boundary has moved',
            'A steep sigmoid classifies fewer points correctly',
          ],
          answer: 1,
          why: 'Accuracy cannot tell the two models apart, log loss can. A steep curve is sure of itself everywhere, including on the two points it gets wrong, and −log of a tiny probability is huge. The best fit is as confident as the overlap in the data allows and no more.',
        },
        {
          kind: 'choice',
          id: 'classical-logistic-7',
          ask: 'A fraud model outputs probabilities. You lower the decision threshold from 0.5 to 0.2. What changes?',
          options: [
            'The model is retrained with new weights',
            'More transactions are flagged: more of the real fraud is caught, and there are more false alarms',
            'Fewer transactions are flagged, and the ones that are flagged are more often fraud',
            'The log loss goes down',
          ],
          answer: 1,
          why: 'The threshold is applied after the model, so the probabilities and the loss do not change. A lower bar flags more cases, which raises recall and lowers precision. Where to set it depends on what a missed fraud costs against what a false alarm costs.',
        },
        {
          kind: 'bug',
          id: 'classical-logistic-8',
          ask: 'This should flag every case with at least a 20% chance of being positive. It flags exactly the cases that the default threshold flags.',
          code: `from sklearn.linear_model import LogisticRegression

model = LogisticRegression().fit(X_train, y_train)
scores = model.predict(X_test)
flagged = scores > 0.2`,
          line: 4,
          fix: 'scores = model.predict_proba(X_test)[:, 1]',
          why: '`predict` returns the classes 0 and 1, already cut at 0.5, so comparing them with 0.2 changes nothing. `predict_proba` returns the probabilities, and column 1 is the positive class.',
        },
        {
          kind: 'choice',
          id: 'classical-logistic-9',
          ask: 'Someone fits ordinary linear regression to labels 0 and 1 and predicts class 1 when the output is above 0.5. Then a few new positive examples arrive that lie very far on the positive side. What happens to the linear-regression boundary, and what would happen with logistic regression?',
          options: [
            'Neither boundary moves, because the new points are easy',
            'The linear-regression line is pulled by the far points, since predicting 5 for a label of 1 counts as an error, and the boundary shifts. Logistic regression barely moves, since those points already have a loss near zero',
            'Logistic regression moves more, because it is more sensitive to outliers',
            'Both move by the same amount',
          ],
          answer: 1,
          why: 'Squared error punishes outputs that are "too correct", so far-away easy points drag the line and can push the 0.5 crossing into the wrong place. Under log loss a confident correct prediction costs almost nothing, so it has almost no say.',
        },
        {
          kind: 'choice',
          id: 'classical-logistic-10',
          ask: 'You train logistic regression with no regularisation on data where the two classes can be separated perfectly. The optimiser warns that it did not converge and the weights are enormous. Why?',
          options: [
            'The learning rate is too low',
            'Any boundary that separates the classes can be made better by scaling the weights up, so the loss keeps falling towards zero and there is no finite best answer',
            'Logistic regression cannot handle separable data and returns random weights',
            'The labels must be −1 and +1',
          ],
          answer: 1,
          why: 'With every point on the right side, larger weights make every probability closer to 0 or 1 and the loss smaller, without end. A penalty on the weights gives the problem a finite answer and keeps the probabilities honest.',
        },
        {
          kind: 'write',
          id: 'classical-logistic-11',
          ask: 'Write the average log loss for a list of labels (0 or 1) and a list of predicted probabilities of class 1.',
          starter: `import math

def log_loss(ys, ps):
    # -log(p) when y is 1, -log(1 - p) when y is 0, averaged
    pass`,
          solution: `import math

def log_loss(ys, ps):
    total = 0.0
    for y, p in zip(ys, ps):
        total += -math.log(p) if y == 1 else -math.log(1 - p)
    return total / len(ys)`,
          tests: `out = log_loss([1], [0.5])
assert out is not None, "the function returns nothing yet"
assert abs(out - 0.693147) < 1e-5, f"one example at p = 0.5 should cost about 0.693, got {out}"
assert abs(log_loss([1, 0], [0.9, 0.1]) - 0.105361) < 1e-5, "two good predictions (0.9 for a 1, 0.1 for a 0) should average about 0.105: is the y = 0 case using 1 - p?"
assert abs(log_loss([1, 0], [0.9, 0.8]) - 0.857399) < 1e-5, "0.9 for a 1 and 0.8 for a 0 should average about 0.857: remember to divide by the number of examples"
assert log_loss([0], [0.99]) > log_loss([0], [0.6]), "being confident and wrong should cost more than being unsure and wrong"`,
          why: 'Each example pays −log of the probability that the model gave to what happened. In real code the probabilities are clipped a hair away from 0 and 1 first, so that one certain mistake does not turn the loss into infinity.',
        },
      ],
    },
    {
      id: 'classical-overfit',
      title: 'Underfitting and overfitting',
      summary: 'Why the training error cannot be trusted, and how to read the gap between training and validation.',
      widget: 'classical-overfit',
      text: [
        'A model has a **capacity**: how complicated a pattern it can represent. The degree of a polynomial, the depth of a tree and the number of weights are all capacity. With too little, the model cannot follow the pattern and is wrong everywhere, on the training data too. That is **underfitting**. With too much, it follows the noise in the training rows as well as the pattern, and is wrong on anything new. That is **overfitting**.',
        'The training error cannot tell you which you have, because it only ever falls as capacity grows. So hold some data back. Fit on the **training set**, measure on a **validation set** the model has not seen, and compare. The validation error falls while the model is learning the pattern and rises once it starts learning noise. The capacity to choose is at the bottom of that curve.',
        'The two failures have names. **Bias** is error from a model too simple for the pattern: it is wrong in the same way whatever data you give it. **Variance** is error from a model that changes a lot with the particular rows it was trained on. Simple models have high bias and low variance, flexible ones the reverse. That is the trade-off.',
        'The numbers tell you which problem you have. Training and validation error both high and close together: underfitting. Add capacity or better features, or reduce regularisation. Training error low and validation error much higher: overfitting. Get more data, use a simpler model, regularise, or stop training earlier.',
        'More data reduces variance, not bias. In the figure, a degree-9 polynomial is hopeless on 12 points and fine on 60. A straight line is equally poor on both, because its problem is not a lack of data.',
        'There is one more trap. Once you pick a model because it had the best validation score, that score is flattering: you chose the winner of a noisy contest. Keep a third piece, the **test set**, and use it once at the end. With little data, use **cross-validation** in place of a single validation split: split the training data into k folds, train k times with a different fold held out each time, and average.',
      ],
      rules: [
        'Training error always improves with capacity. Decide on validation error.',
        'Both errors high and close: underfitting. Large gap: overfitting.',
        'Underfitting: more capacity, better features, less regularisation. More data will not help.',
        'Overfitting: more data, simpler model, regularisation, early stopping.',
        'Validation data is for choosing, test data is for the final number. Touch the test set once.',
        'With little data, cross-validate.',
      ],
      questions: [
        {
          kind: 'choice',
          id: 'classical-overfit-1',
          ask: 'Polynomials of degree 0 to 9 were fitted to the same training set. Which degree should you ship?',
          chart: {
            x: 'polynomial degree',
            y: 'error',
            series: [
              { name: 'training', points: [0.47, 0.24, 0.12, 0.04, 0.036, 0.027, 0.026, 0.01, 0.007, 0.004], color: 'accent' },
              { name: 'validation', points: [0.63, 0.31, 0.27, 0.05, 0.09, 0.2, 0.25, 0.4, 0.6, 0.8], color: 'blue' },
            ],
          },
          options: ['Degree 9: it has the lowest training error', 'Degree 3: it has the lowest validation error', 'Degree 1: simpler models are always safer', 'Degree 0: its two errors are closest together'],
          answer: 1,
          why: 'The training error keeps falling because a higher degree can always bend closer to the training points. The validation error is the estimate of how the model does on new data, and it is lowest at degree 3. To its left the model underfits, to its right it overfits.',
        },
        {
          kind: 'choice',
          id: 'classical-overfit-2',
          ask: 'A classifier scores 99% on the training set and 72% on the validation set. Which of these is the most sensible next step?',
          options: [
            'Train for longer, to push the training score to 100%',
            'Add more features and a bigger model',
            'Reduce capacity or add regularisation, and get more training data if you can',
            'Report 99%: it is the larger number',
          ],
          answer: 2,
          why: 'A 27-point gap is overfitting: the model has learnt the training rows, not the pattern. The cures constrain the model or give it more to learn from. A bigger model or longer training widens the gap.',
        },
        {
          kind: 'choice',
          id: 'classical-overfit-3',
          ask: 'A model has an error of 0.30 on the training set and 0.31 on the validation set. You need 0.10. A colleague proposes spending a month collecting twice as much data. What do you say?',
          options: [
            'Good idea: more data always helps',
            'It will not help much: the model cannot even fit the data it has, so it needs more capacity or better features, not more rows',
            'Collect ten times as much, not twice',
            'The model is overfitting, so use a smaller model first',
          ],
          answer: 1,
          why: 'Both errors are high and nearly equal, which is underfitting (high bias). More rows lower variance, and there is almost none here: the gap is 0.01. A model that is wrong on its own training data stays wrong when it sees more of the same.',
        },
        {
          kind: 'choice',
          id: 'classical-overfit-4',
          ask: 'In the figure, choose 12 training points and degree 9. The training error is about 0.004 and the validation error is about 4. Now switch to 60 training points and keep degree 9. What happens, and why?',
          options: [
            'Nothing changes: degree 9 is too high whatever the data',
            'The validation error drops to about 0.05: with many more points than coefficients the curve can no longer thread through the noise of each one',
            'The training error drops to zero',
            'Both errors rise, because there is more noise',
          ],
          answer: 1,
          why: 'Ten coefficients against twelve points can pass almost through every point, noise included, and the curve swings wildly between them. Against sixty points the same ten coefficients are pinned down by the pattern. Capacity is too high or too low only in relation to how much data there is.',
        },
        {
          kind: 'choice',
          id: 'classical-overfit-5',
          ask: 'In the figure, set the degree to 1. With 12 training points the validation error is about 0.31, and with 60 it is about 0.25. The training error is about 0.23 both times. What does that show?',
          options: [
            'A straight line is the right model for this data',
            'The line is underfitting: its error comes from being the wrong shape, so five times the data barely moves it',
            'The line is overfitting',
            'The validation set is too small to say anything',
          ],
          answer: 1,
          why: 'High training error that does not fall with more data is bias. The dashed curve bends and a straight line cannot. At degree 3 both errors drop to about 0.05, with either amount of data.',
        },
        {
          kind: 'output',
          id: 'classical-overfit-6',
          ask: 'A line and a parabola fitted to three points. What does this print?',
          code: `import numpy as np

x = np.array([0.0, 1.0, 2.0])
y = np.array([1.0, 0.0, 3.0])
for degree in (1, 2):
    coef = np.polyfit(x, y, degree)
    mse = np.mean((np.polyval(coef, x) - y) ** 2)
    print(degree, round(float(mse), 2))`,
          answer: '1 0.89\n2 0.0',
          hint: 'A parabola has three coefficients. For the line: slope 1, intercept 1/3.',
          why: 'The best line predicts 1/3, 4/3 and 7/3, giving squared residuals of 4/9, 16/9 and 4/9: an average of 8/9. A parabola has three coefficients for three points and passes through all of them. A training error of zero with as many parameters as points says nothing about the pattern.',
        },
        {
          kind: 'bug',
          id: 'classical-overfit-7',
          ask: 'This search over polynomial degrees always picks degree 9.',
          code: `X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=0)
best_degree, best_error = None, float("inf")
for degree in range(1, 10):
    model = make_pipeline(PolynomialFeatures(degree), LinearRegression())
    model.fit(X_train, y_train)
    error = mean_squared_error(y_train, model.predict(X_train))
    if error < best_error:
        best_degree, best_error = degree, error`,
          line: 6,
          fix: '    error = mean_squared_error(y_val, model.predict(X_val))',
          why: 'The error is measured on the rows the model was fitted to, and that error always falls as the degree rises. Model choice has to use rows the model has not seen: the validation split that was made on line 1 and never used.',
        },
        {
          kind: 'output',
          id: 'classical-overfit-8',
          ask: 'What does this print?',
          code: `import numpy as np
from sklearn.model_selection import KFold

X = np.arange(10).reshape(-1, 1)
for train, val in KFold(n_splits=5).split(X):
    print(len(train), len(val), val)
    break`,
          answer: '8 2 [0 1]',
          hint: 'Five folds of ten rows. Without shuffling, the folds are taken in order.',
          why: 'Ten rows in five folds is two rows per fold. Each round holds one fold out and trains on the other eight. Every row is used for validation exactly once, which is why cross-validation makes better use of a small dataset than a single split.',
        },
        {
          kind: 'choice',
          id: 'classical-overfit-9',
          ask: 'You retrain the same deep decision tree on five different random samples of your data. The five trees give very different predictions for the same customer. Which problem is this, and what helps?',
          options: [
            'High bias: use a deeper tree',
            'High variance: limit the tree, get more data, or average many trees',
            'A bug: the same model should always give the same prediction',
            'Underfitting: add more features',
          ],
          answer: 1,
          why: 'Variance is how much the fitted model changes with the sample it happened to get. Flexible models have a lot of it. Constraining the model, giving it more data, or averaging many of them (the idea behind random forests) all bring it down.',
        },
        {
          kind: 'choice',
          id: 'classical-overfit-10',
          ask: 'You try 50 settings and keep the one with the best validation accuracy: 91%. What should you report as the expected accuracy on new data?',
          options: [
            '91%: that is what the validation set is for',
            'The accuracy of that one chosen model on a test set that played no part in choosing it',
            'The average validation accuracy of all 50 settings',
            'The training accuracy of the chosen model',
          ],
          answer: 1,
          why: 'The best of 50 noisy scores is partly luck, so 91% is optimistic. The test set has not been used to make any choice, which makes its score an honest estimate. It stays honest only if you look once.',
        },
        {
          kind: 'design',
          id: 'classical-overfit-11',
          ask: 'A model you inherited scores 98% on its training data and 81% on validation. The team wants to ship it next week. Sketch how you would find out what is wrong and what you would try, in order.',
          why: 'A gap this size is overfitting until shown otherwise, but a gap can also come from a split that is wrong. Check the measurement before changing the model, then make the cheapest changes first.',
          checklist: [
            { point: 'Check how the split was made: random, by time, by customer?', why: 'If validation rows come from a different period or population than training rows, part of the gap is a change in the data, not overfitting.' },
            { point: 'Look for leakage and duplicates between training and validation', why: 'Leaks usually inflate validation scores, but a feature that only exists for training rows inflates the training score and produces exactly this gap.' },
            { point: 'Compare with a simple baseline on the same split', why: 'If logistic regression gets 80%, the complicated model adds one point and a lot of risk.' },
            { point: 'Reduce capacity or add regularisation and watch both scores', why: 'A shallower tree, fewer features or a stronger penalty should lower the training score and raise the validation score if the diagnosis is right.' },
            { point: 'Plot a learning curve: validation score against the amount of training data', why: 'If the curve is still rising, more data will close the gap. If it is flat, it will not.' },
            { point: 'Use early stopping if the model is trained in steps', why: 'Validation error that bottomed out long before training ended means the later steps only fitted noise.' },
            { point: 'Keep a test set untouched for the final number', why: 'After several rounds of tuning against the validation set, its score is optimistic too.' },
            { point: 'Tell the team that 81% is the number to plan with, not 98%', why: 'The training score says nothing about new data, and the decision to ship should rest on the honest estimate.' },
          ],
        },
      ],
    },
    {
      id: 'classical-regularisation',
      title: 'Regularisation: ridge and lasso',
      summary: 'A penalty on the size of the weights, the simplest cure for an overfitting linear model.',
      text: [
        'A linear model that overfits usually has large weights: it leans hard on a few features to explain noise. **Regularisation** adds a second term to the loss that charges for the size of the weights: `loss = error + α × penalty`. The model now has to justify every large weight by a matching drop in error. The strength `α` sets the exchange rate.',
        '**L2**, or **ridge**, uses the sum of the squared weights. It shrinks every weight towards zero, the large ones most, but never to exactly zero. When features are correlated it spreads the weight across them, which makes the fit stable. **L1**, or **lasso**, uses the sum of the absolute weights. It pushes some weights to exactly zero, which removes those features from the model: a built-in feature selection. Among correlated features it tends to keep one and drop the rest, somewhat arbitrarily.',
        { code: `from sklearn.linear_model import Lasso, Ridge, RidgeCV
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

ridge = make_pipeline(StandardScaler(), Ridge(alpha=1.0))
lasso = make_pipeline(StandardScaler(), Lasso(alpha=0.1))
tuned = make_pipeline(StandardScaler(), RidgeCV(alphas=[0.01, 0.1, 1, 10, 100]))` },
        'Scale the features first. The penalty treats all weights alike, but the size of a weight depends on the units of its feature. A feature measured in small numbers needs a large weight to have any effect, so it is penalised heavily. One measured in large numbers gets by on a tiny weight and escapes. Standardising puts every feature on the same footing. The scaler learns its mean and standard deviation from the training data only, which a pipeline takes care of. The bias is not penalised.',
        '`α` is a setting you choose, not one the model learns. With `α = 0` you have plain least squares. As `α` grows the weights shrink, the training error rises, and the validation error falls and then rises again. With a huge `α` every weight is near zero and the model predicts the mean. Try values spread over powers of ten and pick by validation error or cross-validation, which `RidgeCV` and `LassoCV` do for you.',
        'The names differ between models. `Ridge` and `Lasso` take `alpha`, where larger is stronger. `LogisticRegression` takes `C`, the inverse, where smaller is stronger. Neural networks call L2 "weight decay". It is the same idea each time.',
      ],
      rules: [
        'Regularised loss = error + α × (size of the weights).',
        'L2 (ridge): shrinks all weights, none to exactly zero. Stable with correlated features.',
        'L1 (lasso): sets some weights to exactly zero. Use it to select features.',
        'Standardise features before a penalised model, with a scaler fitted on the training data only.',
        'Choose α by validation, over powers of ten. Too small overfits, too large underfits.',
        '`alpha`: larger is stronger. `C`: smaller is stronger.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'classical-regularisation-1',
          ask: 'A model has weights (3, −4) and α = 0.1. What does the L2 penalty, α × Σw², add to the loss?',
          answer: 2.5,
          check: '0.1 * np.sum(np.array([3, -4]) ** 2)',
          why: '3² + (−4)² = 25, and 0.1 × 25 = 2.5. Squaring means the larger weight accounts for most of the penalty.',
        },
        {
          kind: 'number',
          id: 'classical-regularisation-2',
          ask: 'The same weights (3, −4) and α = 0.1. What does the L1 penalty, α × Σ|w|, add to the loss?',
          answer: 0.7,
          check: '0.1 * np.sum(np.abs(np.array([3, -4])))',
          why: '|3| + |−4| = 7, and 0.1 × 7 = 0.7. Under L1 every unit of weight costs the same, however small the weight already is. That constant pressure is what pushes small weights all the way to zero.',
        },
        {
          kind: 'choice',
          id: 'classical-regularisation-3',
          run: true,
          ask: 'The data lies exactly on y = 2x. The code prints the slope from plain least squares, then from ridge with α = 5, then with α = 45. What does it print?',
          code: `import numpy as np
from sklearn.linear_model import LinearRegression, Ridge

X = np.array([[0.0], [1.0], [2.0], [3.0]])
y = np.array([0.0, 2.0, 4.0, 6.0])
slopes = [LinearRegression().fit(X, y).coef_[0]]
for alpha in (5, 45):
    slopes.append(Ridge(alpha=alpha).fit(X, y).coef_[0])
print(*[round(float(s), 2) for s in slopes])`,
          options: ['2.0 2.0 2.0', '2.0 1.0 0.2', '0.2 1.0 2.0', '2.0 3.0 11.0'],
          answer: 1,
          why: 'Plain least squares recovers the true slope, 2. Ridge trades some error for a smaller weight, and the larger α is, the more it shrinks: 1.0 and then 0.2. The data has no noise here, so the shrinking only does harm. It pays off when the unpenalised weight is partly fitting noise.',
        },
        {
          kind: 'output',
          id: 'classical-regularisation-4',
          ask: 'The target depends on the first feature only. The code counts the weights that are not zero. What does it print?',
          code: `import numpy as np
from sklearn.linear_model import Lasso, Ridge

X = np.array([[1.0, 3], [2, 1], [3, 4], [4, 1], [5, 5], [6, 2]])
y = 2 * X[:, 0]
ridge = Ridge(alpha=0.5).fit(X, y)
lasso = Lasso(alpha=0.5).fit(X, y)
print((ridge.coef_ != 0).sum(), (lasso.coef_ != 0).sum())`,
          answer: '2 1',
          hint: 'Which penalty can make a weight exactly zero?',
          why: 'Ridge leaves the useless second feature with a small weight (about 0.008): shrunk, but not zero. Lasso sets it to exactly 0 and keeps only the first feature. That is the practical difference between the two.',
        },
        {
          kind: 'bug',
          id: 'classical-regularisation-5',
          ask: 'The test score of this ridge model is unreliable, and with a small test set it is sometimes far off.',
          code: `scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s = scaler.fit_transform(X_test)
model = Ridge(alpha=1.0).fit(X_train_s, y_train)
print(model.score(X_test_s, y_test))`,
          line: 3,
          fix: 'X_test_s = scaler.transform(X_test)',
          why: '`fit_transform` on the test set scales it with its own mean and standard deviation, so the same raw value becomes a different number in training and in test. Fit the scaler once, on the training data, and only `transform` everything else. A pipeline does this for you.',
        },
        {
          kind: 'choice',
          id: 'classical-regularisation-6',
          ask: 'A lasso model uses income in pounds (values around 50,000) and age in years (values around 40), without scaling. Which feature does the penalty hit harder?',
          options: [
            'Income, because its values are larger',
            'Age: to matter at all its weight must be large, and the penalty charges for the size of the weight. Income gets by on a tiny weight',
            'Both equally: the penalty does not depend on units',
            'Neither: lasso only penalises the bias',
          ],
          answer: 1,
          why: 'A weight of 0.001 on income moves the prediction by 50, and costs almost nothing. To move it by 50 through age takes a weight above 1. The penalty sees only the weights, so the feature with small numbers is the one that gets squeezed out. Standardise first.',
        },
        {
          kind: 'choice',
          id: 'classical-regularisation-7',
          ask: 'A ridge model was fitted for seven values of α, each ten times the one before, starting at 0.001 on the left. What is happening at the right-hand end of this chart?',
          chart: {
            x: 'α, tenfold steps from 0.001',
            y: 'error',
            series: [
              { name: 'training', points: [0.1, 0.11, 0.15, 0.22, 0.28, 0.47, 0.7], color: 'accent' },
              { name: 'validation', points: [0.42, 0.4, 0.33, 0.25, 0.29, 0.48, 0.71], color: 'blue' },
            ],
          },
          options: [
            'Overfitting: the penalty is too weak',
            'Underfitting: the penalty is so strong that the weights are near zero and the model cannot fit even the training data',
            'The validation set is too small',
            'The features were not scaled',
          ],
          answer: 1,
          why: 'On the right both errors are high and equal: the model has been flattened. On the left the training error is low and the validation error high: overfitting. The value to choose is at the bottom of the validation curve, the fourth point, α = 1.',
        },
        {
          kind: 'choice',
          id: 'classical-regularisation-8',
          ask: 'With α = 1,000,000, a ridge model gives almost the same prediction for every row. Which value is it?',
          options: ['Zero', 'The mean of the training targets', 'The largest training target', 'A random number'],
          answer: 1,
          why: 'The penalty forces every weight to nearly zero, but the bias is not penalised. With no features left to use, the bias that minimises squared error is the mean of the targets. That is the "predict the mean" baseline.',
        },
        {
          kind: 'choice',
          id: 'classical-regularisation-9',
          ask: 'You have 200 candidate features and 1,000 rows. You believe only a handful of the features matter, and the result must be explained to a regulator. Which model do you try first?',
          options: ['Plain least squares on all 200', 'Ridge', 'Lasso', 'A degree-3 polynomial of all features'],
          answer: 2,
          why: 'Lasso sets most weights to exactly zero and leaves a short list of features that you can show and defend. Ridge would keep all 200 with small weights. Plain least squares with 200 features on 1,000 rows will overfit.',
        },
        {
          kind: 'choice',
          id: 'classical-regularisation-10',
          ask: 'Two features are almost copies of each other and both predict the target. How do ridge and lasso typically treat the pair?',
          options: [
            'Ridge gives both a similar, moderate weight. Lasso tends to keep one and set the other to zero',
            'Ridge sets one to zero. Lasso keeps both',
            'Both set both weights to zero',
            'Both give one a large positive and the other a large negative weight',
          ],
          answer: 0,
          why: 'Splitting a weight in two halves its squared cost, so ridge shares it out. Under L1 splitting saves nothing, so lasso lands on one of the pair, and which one can change from sample to sample. Do not read much into which of two near-copies lasso kept.',
        },
        {
          kind: 'bug',
          id: 'classical-regularisation-11',
          ask: 'The model overfits, and this change was meant to regularise it more strongly than the default `C=1.0`. The gap got wider.',
          code: `from sklearn.linear_model import LogisticRegression

model = make_pipeline(StandardScaler(), LogisticRegression(C=100.0))
model.fit(X_train, y_train)`,
          line: 3,
          fix: 'model = make_pipeline(StandardScaler(), LogisticRegression(C=0.01))',
          why: '`C` is the inverse of the regularisation strength. Raising it to 100 weakens the penalty a hundredfold. For a stronger penalty, make `C` smaller.',
        },
        {
          kind: 'write',
          id: 'classical-regularisation-12',
          numpy: true,
          ask: 'Write the ridge loss: the mean squared error of `X @ w + b`, plus `alpha` times the sum of the squared weights. The bias is not penalised.',
          starter: `import numpy as np

def ridge_loss(w, b, X, y, alpha):
    # X: (n, d)   w: (d,)   y: (n,)
    pass`,
          solution: `import numpy as np

def ridge_loss(w, b, X, y, alpha):
    error = X @ w + b - y
    return np.mean(error ** 2) + alpha * np.sum(w ** 2)`,
          tests: `X = np.array([[1.0, 0.0], [0.0, 1.0]])
y = np.array([1.0, 2.0])
out = ridge_loss(np.array([1.0, 2.0]), 0.0, X, y, 0.1)
assert out is not None, "the function returns nothing yet"
assert abs(out - 0.5) < 1e-9, f"a perfect fit with weights (1, 2) and alpha 0.1 should cost only the penalty, 0.5, got {out}"
assert abs(ridge_loss(np.zeros(2), 0.0, X, y, 0.1) - 2.5) < 1e-9, "with zero weights there is no penalty and the loss is the MSE, 2.5"
assert abs(ridge_loss(np.array([1.0, 2.0]), 0.0, X, y, 0.0) - 0.0) < 1e-9, "with alpha = 0 the loss is the plain MSE"
assert abs(ridge_loss(np.zeros(2), 10.0, X, y, 1.0) - 72.5) < 1e-9, "the bias must not be penalised: with w = 0 and b = 10 the loss is the MSE, 72.5"
assert abs(ridge_loss(np.array([-3.0, 0.0]), 0.0, X, y, 1.0) - 19.0) < 1e-9, "a negative weight must add to the penalty: square the weights"`,
          why: 'Two terms pulling in opposite directions: the error wants weights that fit, the penalty wants weights that are small. α decides who wins. Minimising this by gradient descent gives the update that deep learning calls weight decay.',
        },
      ],
    },
    {
      id: 'classical-trees',
      title: 'Decision trees',
      summary: 'A model made of yes/no questions: how each split is chosen, and why depth has to be limited.',
      widget: 'classical-split',
      text: [
        'A decision tree asks a chain of yes/no questions of the form `feature ≤ threshold`. Each answer sends the example left or right until it reaches a leaf. A leaf predicts the most common class among the training rows that ended up there, or their mean for regression.',
        'To choose a question, the tree tries every feature and every threshold and scores how pure the two sides would be. The usual score is **Gini impurity**: `1 − Σ pₖ²`, where `pₖ` is the share of class k in the group. It is 0 when the group is all one class and 0.5 for an even mix of two. A split is scored by the **weighted** average of the two sides, each counted by its size. The drop from the parent impurity is the **gain**. With entropy in place of Gini the drop is called information gain, and in practice the two choose almost the same splits.',
        'Tree building is greedy: take the best split now, then repeat inside each side. Left alone, it keeps going until every leaf is pure, which on noisy data means a leaf for nearly every training row: 100% on the training set and a poor score on new data. Depth is capacity. Limit it with `max_depth` or `min_samples_leaf`, or prune afterwards with `ccp_alpha`, and choose the values on validation data.',
        { code: `from sklearn.tree import DecisionTreeClassifier, export_text

tree = DecisionTreeClassifier(max_depth=3, min_samples_leaf=5, random_state=0)
tree.fit(X_train, y_train)
print(export_text(tree, feature_names=names))   # the questions, as text` },
        'A split only compares a value with a threshold, so only the **order** of the values matters. Multiplying a feature by 1,000 or taking its logarithm moves the thresholds and leaves every prediction the same. Trees need no scaling, cope with features in mixed units, and pick up bends and interactions without being told.',
        'The weaknesses are as plain. A tree is unstable: change a few rows and the top split, and so everything below it, can change. Its predictions come in steps. And a regression tree cannot predict outside the range of targets it has seen, because every leaf is an average of training targets. One tree is rarely the best model. Many trees together usually are, which is the next lesson.',
      ],
      rules: [
        'A split is `feature ≤ threshold`. A leaf predicts the majority class or the mean.',
        'Gini impurity: `1 − Σ pₖ²`. Pure is 0, an even two-class mix is 0.5.',
        'Score a split by the size-weighted impurity of its two sides. Lower is better.',
        'An unlimited tree memorises. Set `max_depth` or `min_samples_leaf` by validation.',
        'Only the order of values matters: no scaling needed.',
        'A regression tree cannot extrapolate beyond the targets it was trained on.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'classical-trees-1',
          ask: 'A node holds 3 positive and 1 negative example. What is its Gini impurity?',
          answer: 0.375,
          tol: 0.005,
          check: '1 - (0.75 ** 2 + 0.25 ** 2)',
          why: 'The shares are 0.75 and 0.25. 1 − (0.5625 + 0.0625) = 0.375. It lies between 0 (pure) and 0.5 (an even mix).',
        },
        {
          kind: 'number',
          id: 'classical-trees-2',
          ask: 'A split sends 4 examples left, all of one class, and 6 examples right, 3 of each class. What is the weighted Gini impurity of the split?',
          answer: 0.3,
          tol: 0.005,
          check: '(4 * 0 + 6 * 0.5) / 10',
          hint: 'Left is pure. Right is an even mix. Weight each by its share of the 10 examples.',
          why: 'Left: 0. Right: 0.5. Weighted by size: 0.4 × 0 + 0.6 × 0.5 = 0.3.',
        },
        {
          kind: 'number',
          id: 'classical-trees-3',
          ask: 'Before that split, the node held 7 examples of one class and 3 of the other. The weighted impurity after the split is 0.3. What is the gain?',
          answer: 0.12,
          tol: 0.005,
          check: '(1 - 0.7 ** 2 - 0.3 ** 2) - 0.3',
          why: 'The parent impurity is 1 − (0.49 + 0.09) = 0.42. The gain is what the split removes: 0.42 − 0.30 = 0.12. The tree picks the split with the largest gain.',
        },
        {
          kind: 'choice',
          id: 'classical-trees-4',
          ask: 'In the figure, split on feature 1. At a threshold of 4.6 the shaded side is perfectly pure (9 blue) and the weighted Gini is 0.200. At 5.3 neither side is pure and the weighted Gini is 0.153. Which threshold does a tree choose?',
          options: [
            '4.6, because one side is pure',
            '5.3, because the weighted impurity of both sides together is lower',
            'Either: they are equally good',
            'Neither: a tree only splits when both sides become pure',
          ],
          answer: 1,
          why: 'A pure side is no use if the other side is left badly mixed. At 4.6 the 15 points on the right are 3 blue and 12 green. At 5.3 each side has 11 of one colour and 1 of the other. The score counts both sides, each by its size.',
        },
        {
          kind: 'choice',
          id: 'classical-trees-5',
          ask: 'In the figure, find the lowest weighted Gini you can reach with feature 1, then with feature 2. They are about 0.15 and about 0.45. What does the tree do at this node?',
          options: [
            'It splits on feature 2, because 0.45 is the larger number',
            'It splits on feature 1 and, at this node, does not use feature 2 at all',
            'It splits on both features at once',
            'It averages the two thresholds',
          ],
          answer: 1,
          why: 'One node asks one question about one feature: the one with the lowest weighted impurity. Feature 2 hardly separates the colours (0.45 is close to the 0.5 of no split), so it loses. A feature that never wins a split is ignored by the tree.',
        },
        {
          kind: 'output',
          id: 'classical-trees-6',
          ask: 'What does this print?',
          code: `from sklearn.tree import DecisionTreeClassifier

X = [[1], [2], [3], [4]]
y = [0, 0, 1, 1]
tree = DecisionTreeClassifier(random_state=0).fit(X, y)
print(tree.tree_.threshold[0])
print(tree.predict([[2.4], [2.6]]))`,
          answer: '2.5\n[0 1]',
          hint: 'The classes change between 2 and 3. The threshold is put halfway between two neighbouring values.',
          why: 'The only useful split is between 2 and 3, and scikit-learn puts the threshold at the midpoint, 2.5. Everything at or below it is class 0, everything above is class 1.',
        },
        {
          kind: 'output',
          id: 'classical-trees-7',
          ask: 'The labels here alternate and have nothing to do with x. What does this print?',
          code: `from sklearn.tree import DecisionTreeClassifier

X = [[1], [2], [3], [4], [5], [6]]
y = [0, 1, 0, 1, 0, 1]
tree = DecisionTreeClassifier(random_state=0).fit(X, y)
print(tree.score(X, y), tree.get_n_leaves())`,
          answer: '1.0 6',
          hint: 'With no limit, a tree splits until every leaf is pure.',
          why: 'With no depth limit the tree keeps splitting until each leaf is pure, which here takes one leaf per row. The training accuracy is a perfect 1.0 and means nothing: the tree has stored the data.',
        },
        {
          kind: 'output',
          id: 'classical-trees-8',
          ask: 'A regression tree and a straight line are fitted to the same four points and asked about x = 100. What does this print?',
          code: `from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor

X = [[1], [2], [3], [4]]
y = [10, 20, 30, 40]
tree = DecisionTreeRegressor(random_state=0).fit(X, y)
line = LinearRegression().fit(X, y)
print(float(tree.predict([[100]])[0]), round(float(line.predict([[100]])[0]), 1))`,
          answer: '40.0 1000.0',
          hint: 'Which leaf does x = 100 fall into, and what does that leaf hold?',
          why: 'x = 100 goes down the "greater than" branch every time and lands in the leaf that holds the largest training target, 40. The line continues the trend to 1,000. Tree models, forests and boosting included, do not extrapolate.',
        },
        {
          kind: 'bug',
          id: 'classical-trees-9',
          ask: 'This scores a split. It ranks a split that cuts one example off from 99 as highly as it should not.',
          code: `def gini(labels):
    n = len(labels)
    return 1 - sum((labels.count(c) / n) ** 2 for c in set(labels))

def split_impurity(left, right):
    n = len(left) + len(right)
    return (gini(left) + gini(right)) / 2`,
          line: 7,
          fix: '    return len(left) / n * gini(left) + len(right) / n * gini(right)',
          why: 'A plain average counts a side with one example as much as a side with 99. A single example is always pure, so cutting one off halves the score while achieving nothing. Weight each side by its share of the examples.',
        },
        {
          kind: 'choice',
          id: 'classical-trees-10',
          ask: 'You standardise every feature and retrain a decision tree with the same settings and seed. What changes?',
          options: [
            'The tree gets more accurate, as scaled features are easier to split',
            'The thresholds change to the new units, and the predictions stay the same',
            'The tree gets shallower',
            'The tree can no longer be trained',
          ],
          answer: 1,
          why: 'Standardising keeps the order of the values, and a split depends only on which rows fall on each side. The same rows are separated at every node, so the tree is the same tree in new units. Scaling is wasted effort for tree models.',
        },
        {
          kind: 'choice',
          id: 'classical-trees-11',
          ask: 'A decision tree with default settings scores 100% on training data and 78% on validation. Which change addresses that directly?',
          options: [
            'Set `max_depth=None`',
            'Set a smaller `max_depth` or a larger `min_samples_leaf`, chosen on validation data',
            'Scale the features',
            'Lower `min_samples_leaf` to 1',
          ],
          answer: 1,
          why: 'The defaults already grow the tree until every leaf is pure (`max_depth=None`, `min_samples_leaf=1`), which is why it memorised. A depth limit or a minimum leaf size forces each leaf to speak for several rows.',
        },
        {
          kind: 'write',
          id: 'classical-trees-12',
          ask: 'Write Gini impurity for a list of class labels. It should work for any number of classes.',
          starter: `def gini(labels):
    # 1 - sum of (share of each class) squared
    pass`,
          solution: `def gini(labels):
    n = len(labels)
    total = 0.0
    for c in set(labels):
        share = labels.count(c) / n
        total += share * share
    return 1 - total`,
          tests: `out = gini([1, 1, 1, 0])
assert out is not None, "the function returns nothing yet"
assert abs(out - 0.375) < 1e-9, f"3 of one class and 1 of another should give 0.375, got {out}"
assert abs(gini([1, 1, 1, 1])) < 1e-9, "a pure group has impurity 0"
assert abs(gini([0, 1]) - 0.5) < 1e-9, "an even mix of two classes has impurity 0.5"
assert abs(gini(["a", "b", "c"]) - 2 / 3) < 1e-9, "three equally common classes should give 2/3: handle any number of classes and any kind of label"`,
          why: 'Gini is the chance that two examples drawn from the group (with replacement) have different classes. It is cheap to compute, which matters when a tree evaluates it for every feature and threshold.',
        },
      ],
    },
    {
      id: 'classical-ensembles',
      title: 'Random forests and gradient boosting',
      summary: 'Two ways of combining many trees, and why the result is the default model for tables.',
      text: [
        'One tree is unstable. Many trees combined are among the best models there are. There are two ways to combine them, and they fix opposite problems.',
        '**Bagging** trains every tree on its own **bootstrap sample**: rows drawn from the training data with replacement. A **random forest** adds a second source of difference: at each split a tree may choose only among a random subset of the features (`max_features`). The trees are deep and each one overfits, but they overfit differently, and averaging their predictions cancels much of the error. This lowers variance. Adding trees does not make a forest overfit: the score levels off, and more trees only cost time. About a third of the rows are left out of each sample, and scoring each tree on its left-out rows gives the **out-of-bag** score, a validation estimate for free.',
        '**Boosting** builds trees one after another. Each new tree is small and is fitted to the errors that the trees so far still make, then added with a small weight, the `learning_rate`. This lowers bias: a string of weak corrections adds up to a strong model. Unlike a forest, boosting does overfit if you keep adding trees.',
        'The settings that matter: for a forest, a few hundred trees (`n_estimators`), then `max_features` and `min_samples_leaf`. For boosting, the learning rate and the number of trees work as a pair: a lower rate needs more trees, and usually ends up a little better. Depth is small, around 3 to 8. Do not guess the number of trees. Set it high and use **early stopping**: watch the validation loss and stop once it has not improved for some rounds.',
        { code: `from sklearn.ensemble import HistGradientBoostingClassifier, RandomForestClassifier

forest = RandomForestClassifier(n_estimators=300, oob_score=True, n_jobs=-1, random_state=0)

boost = HistGradientBoostingClassifier(
    learning_rate=0.05, max_iter=2000,           # max_iter is the number of trees
    early_stopping=True, validation_fraction=0.1, n_iter_no_change=20,
    random_state=0,
)` },
        'These models win on tabular data because of what tables are like: columns in different units, skewed values, outliers, missing entries, effects that bend and interact. Trees take all of that as it comes, with no scaling, and the histogram-based boosters (this one, XGBoost, LightGBM) handle missing values themselves. A sound routine is a linear or logistic baseline first, then gradient boosting. They are the wrong tool for images, audio and text, where neural networks learn the features, and like any tree they do not extrapolate.',
      ],
      rules: [
        'Forest: deep trees on bootstrap samples, averaged. Lowers variance. More trees never hurt, only cost time.',
        'Boosting: small trees in sequence, each fixing the remaining error. Lowers bias. Too many trees overfit.',
        'Lower learning rate needs more trees. Tune the two together.',
        'Use early stopping on validation data to choose the number of boosting rounds.',
        'On a table: baseline first, then gradient boosting. No scaling needed.',
      ],
      questions: [
        {
          kind: 'choice',
          id: 'classical-ensembles-1',
          ask: 'A random forest with 100 trees scores 0.86 on validation. You raise it to 2,000 trees. What do you expect?',
          options: [
            'A much worse score: 2,000 trees will overfit',
            'About the same or slightly better, and twenty times the training and prediction time',
            'A score close to 1.0',
            'The same score in the same time',
          ],
          answer: 1,
          why: 'Each tree in a forest is trained independently and their predictions are averaged. More trees make the average steadier and then stop mattering. The count is a budget question for a forest. In boosting it is not: there, too many trees do overfit.',
        },
        {
          kind: 'choice',
          id: 'classical-ensembles-2',
          ask: 'You build a "forest" of 100 trees, but train every tree on all the rows and let every split choose among all the features. How does it compare with one tree?',
          options: [
            'It is 100 times more accurate',
            'It is the same: the 100 trees are identical, so their average is one tree',
            'It overfits less, because averaging always helps',
            'It underfits',
          ],
          answer: 1,
          why: 'Averaging only cancels errors that differ from tree to tree. The bootstrap samples and the random feature subsets exist to make the trees disagree. Without them tree building is deterministic and every tree is the same.',
        },
        {
          kind: 'output',
          id: 'classical-ensembles-3',
          ask: 'Five rows, and one bootstrap sample of them. What does this print?',
          code: `rows = [0, 1, 2, 3, 4]
sample = [3, 0, 3, 4, 0]      # five draws with replacement
out_of_bag = [r for r in rows if r not in sample]
print(out_of_bag)`,
          answer: '[1, 2]',
          why: 'Drawing with replacement repeats some rows (0 and 3) and misses others (1 and 2). The missed rows are out-of-bag for this tree: it never saw them, so they can be used to test it. On a large dataset about 37% of rows are out-of-bag for each tree.',
        },
        {
          kind: 'output',
          id: 'classical-ensembles-4',
          ask: 'Five trees vote on three examples. Each row is one tree. What does this print?',
          code: `import numpy as np

votes = np.array([[1, 0, 1],
                  [0, 0, 1],
                  [1, 1, 1],
                  [1, 0, 0],
                  [1, 0, 1]])
print((votes.mean(axis=0) > 0.5).astype(int))`,
          answer: '[1 0 1]',
          hint: '`axis=0` averages down each column: one share of yes-votes per example.',
          why: 'The share of trees voting 1 is 0.8, 0.2 and 0.8. No tree is right about everything (trees 2, 3 and 4 each disagree with the majority once), yet the majority is unaffected by any one of them. That is variance being averaged away.',
        },
        {
          kind: 'output',
          id: 'classical-ensembles-5',
          ask: 'Boosting by hand. Each round a "tree" predicts the current residuals exactly and is added with a learning rate of 0.5. What does this print?',
          code: `import numpy as np

y = np.array([10.0, 20.0, 30.0])
pred = np.full(3, y.mean())          # start from the mean
for _ in range(2):
    residual = y - pred              # what is still wrong
    pred = pred + 0.5 * residual     # add half of the correction
print(pred.tolist())`,
          answer: '[12.5, 20.0, 27.5]',
          hint: 'Start at 20 for everyone. Each round closes half of the remaining gap.',
          why: 'Start: 20, 20, 20. Round one closes half the gap: 15, 20, 25. Round two closes half of what is left: 12.5, 20, 27.5. Every tree fits what the ensemble still gets wrong, and the learning rate decides how much of each correction to take.',
        },
        {
          kind: 'choice',
          id: 'classical-ensembles-6',
          ask: 'A boosted model with learning rate 0.1 and 100 trees works well. You lower the rate to 0.01 and keep 100 trees. Training and validation scores both get worse. Why?',
          options: [
            'A lower learning rate overfits',
            'Each tree now contributes a tenth as much, so 100 trees are far too few: the model is underfitting',
            'The trees have become too deep',
            'The validation set has changed',
          ],
          answer: 1,
          why: 'The learning rate and the number of trees are a pair. A rate ten times smaller needs roughly ten times the trees to get as far. Both scores falling together is the sign of underfitting.',
        },
        {
          kind: 'choice',
          id: 'classical-ensembles-7',
          ask: 'The loss of a boosted model as trees are added. How many trees should the final model have?',
          chart: {
            x: 'trees (hundreds)',
            y: 'log loss',
            series: [
              { name: 'training', points: [0.69, 0.45, 0.33, 0.26, 0.21, 0.17, 0.14, 0.12, 0.1, 0.08], color: 'accent' },
              { name: 'validation', points: [0.69, 0.48, 0.39, 0.35, 0.34, 0.345, 0.36, 0.38, 0.4, 0.43], color: 'blue' },
            ],
          },
          options: ['900: the training loss is still falling', 'About 400: the validation loss is lowest there', '100: the two curves are closest', 'It makes no difference after 100'],
          answer: 1,
          why: 'After about 400 trees each new tree fits noise: the training loss keeps falling while the validation loss climbs. Early stopping automates this choice by halting when the validation loss has stopped improving.',
        },
        {
          kind: 'bug',
          id: 'classical-ensembles-8',
          ask: 'This picks the number of boosting rounds from the validation error after each round. The number it picks gives a terrible model.',
          code: `model = GradientBoostingRegressor(n_estimators=2000, learning_rate=0.05)
model.fit(X_train, y_train)
errors = [mean_squared_error(y_val, p) for p in model.staged_predict(X_val)]
best = int(np.argmax(errors)) + 1
print("use", best, "trees")`,
          line: 4,
          fix: 'best = int(np.argmin(errors)) + 1',
          why: '`argmax` finds the round with the highest validation error, which is usually the first. The best round is the one with the lowest error: `argmin`. The `+ 1` is right, as round 0 is a model with one tree.',
        },
        {
          kind: 'bug',
          id: 'classical-ensembles-9',
          ask: 'This was meant to stop adding trees once the validation score stops improving. It always builds all 2,000.',
          code: `model = HistGradientBoostingClassifier(
    learning_rate=0.05,
    max_iter=2000,
    early_stopping=False,
    n_iter_no_change=20,
    random_state=0,
)
model.fit(X_train, y_train)`,
          line: 4,
          fix: '    early_stopping=True,',
          why: 'With early stopping off, `n_iter_no_change` is ignored and all `max_iter` trees are built. Turned on, the model holds back a slice of the training data and stops after 20 rounds without improvement.',
        },
        {
          kind: 'choice',
          id: 'classical-ensembles-10',
          ask: 'A table has columns in pounds, days and counts, some very skewed, and 8% of the cells are missing. You are about to train `HistGradientBoostingClassifier`. Which preparation is needed?',
          options: [
            'Standardise every column and fill in every missing value first',
            'Neither: trees split on order, so scale does not matter, and this model handles missing values itself',
            'Take the log of every column',
            'Drop every row that has a missing value',
          ],
          answer: 1,
          why: 'A split depends only on the order of a column, so rescaling or a log changes nothing. The histogram-based boosters learn at each split which side missing values should go to. This lack of preparation is a large part of why they are the default for tables.',
        },
        {
          kind: 'choice',
          id: 'classical-ensembles-11',
          ask: 'For which of these problems is gradient boosting the wrong first choice?',
          options: [
            'Predicting churn from 40 columns of account data',
            'Scoring loan applications from a credit file',
            'Classifying photographs of products from their pixels',
            'Forecasting demand per shop from price, promotion and calendar columns',
          ],
          answer: 2,
          why: 'In a table each column means something by itself, and that is where trees are strong. One pixel means nothing alone: the signal is in patterns across neighbouring pixels, which convolutional networks and transformers are built to learn.',
        },
        {
          kind: 'design',
          id: 'classical-ensembles-12',
          ask: 'You are given a table of 200,000 customers with 40 columns of mixed types and a label saying whether each one left within three months. Sketch how you would get a strong, trustworthy churn model with gradient boosting.',
          why: 'The model is the easy part. Most of the result comes from an honest split, a baseline to beat and disciplined tuning.',
          checklist: [
            { point: 'Split by time, or at least by customer, before anything else', why: 'The model will be used on future customers. A random split of rows lets it see the future and the same customer on both sides.' },
            { point: 'Check every column for leakage', why: 'A column filled in after the customer left (a cancellation reason, a final invoice) gives a perfect score in training and nothing in production.' },
            { point: 'Fit a simple baseline first', why: 'Logistic regression on a few columns tells you how much the boosted model really adds, and catches broken pipelines early.' },
            { point: 'Start with defaults: learning rate around 0.05 to 0.1, many trees, early stopping', why: 'Early stopping chooses the number of trees for you, and the defaults are usually within a few points of the best.' },
            { point: 'Tune a few settings only: depth or leaves, minimum leaf size, learning rate', why: 'These control capacity. A wide search over everything mostly fits the validation set.' },
            { point: 'Choose a metric that fits a rare class and the decision', why: 'If 5% churn, accuracy is 95% for a model that predicts nobody leaves. Use precision and recall at the threshold you will act on, or PR-AUC.' },
            { point: 'Look at which features drive the predictions', why: 'Importances that make no sense, or one feature that dominates, point to leakage or a data error.' },
            { point: 'Report the final score once, on an untouched test period', why: 'After tuning, the validation score is optimistic. The test period is the estimate to give the business.' },
          ],
        },
      ],
    },
    {
      id: 'classical-kmeans',
      title: 'k-means clustering',
      summary: 'Grouping points with no labels: the two-step loop, how to choose k, and the cases where it fails.',
      widget: 'classical-kmeans',
      text: [
        'Clustering is **unsupervised**: there are no labels, only points, and the task is to find groups. k-means describes each of `k` groups by its **centroid**, the mean of its points.',
        'The algorithm is a loop of two steps. **Assign**: give every point to its nearest centroid. **Update**: move every centroid to the mean of the points it was given. Repeat until nothing changes. Each step can only lower the total squared distance from the points to their centroids (scikit-learn calls it `inertia_`), so the loop always stops. But it stops at the nearest dip, which need not be the best grouping.',
        'Where it stops depends on where the centroids start. A bad start gives a bad answer, as Start B in the figure shows. The remedy is to start from spread-out points (the `k-means++` method, the default), run several times from different starts, and keep the run with the lowest inertia: `n_init=10`. Fix `random_state` if you need the same clusters every time.',
        { code: `from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

Xs = StandardScaler().fit_transform(X)
km = KMeans(n_clusters=3, n_init=10, random_state=0).fit(Xs)
km.labels_, km.cluster_centers_, km.inertia_` },
        'You have to choose `k`, and inertia cannot choose it for you: it always falls as `k` grows, down to zero when every point is its own cluster. Plot inertia against `k` and look for the **elbow**, where the gains level off, or compare silhouette scores. Often the better guide is the use: how many groups can the people who asked for them act on?',
        'k-means fails in known ways. It measures plain distance, so a feature with large numbers decides everything: standardise first. It assumes round clusters of similar size, so long, curved or nested shapes are cut wrongly (a Gaussian mixture or DBSCAN suits those). Outliers drag centroids. And it always returns `k` clusters, whether or not the data has any.',
      ],
      rules: [
        'Loop: assign each point to the nearest centroid, move each centroid to the mean of its points.',
        'The total squared distance never rises, so it converges, but only to a local optimum.',
        'Run from several starts (`n_init`) and keep the lowest inertia.',
        'Inertia always falls with k. Use the elbow, the silhouette score, or the purpose.',
        'Standardise the features first: distance is dominated by large units.',
        'It finds round blobs, and it finds k of them even when there are none.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'classical-kmeans-1',
          ask: 'On a number line, a cluster has been assigned the points 1, 2 and 9. Where does the update step move its centroid?',
          answer: 4,
          check: 'np.mean([1, 2, 9])',
          why: 'The new centroid is the mean of the assigned points: (1 + 2 + 9) / 3 = 4. Notice that the far point at 9 has pulled it away from the other two.',
        },
        {
          kind: 'number',
          id: 'classical-kmeans-2',
          ask: 'A point is at (1, 2). Centroid A is at (4, 6) and centroid B is at (1, 8). What is the squared distance from the point to the centroid it is assigned to?',
          answer: 25,
          check: 'min(np.sum((np.array([1, 2]) - np.array(c)) ** 2) for c in ([4, 6], [1, 8]))',
          why: 'To A: 3² + 4² = 25. To B: 0² + 6² = 36. A is nearer, so the point joins A and adds 25 to the total.',
        },
        {
          kind: 'output',
          id: 'classical-kmeans-3',
          ask: 'What does this print?',
          code: `from sklearn.cluster import KMeans

X = [[0], [1], [10], [11]]
km = KMeans(n_clusters=2, n_init=10, random_state=0).fit(X)
print(sorted(km.cluster_centers_.ravel().tolist()), km.inertia_)`,
          answer: '[0.5, 10.5] 1.0',
          hint: 'Inertia is the sum of the squared distances from each point to its centroid.',
          why: 'The clusters are {0, 1} and {10, 11}, with centroids at their means. Every point is 0.5 from its centroid, so the inertia is 4 × 0.25 = 1.0.',
        },
        {
          kind: 'output',
          id: 'classical-kmeans-4',
          ask: 'The same four points, clustered with k = 1, 2 and 4. What does this print?',
          code: `from sklearn.cluster import KMeans

X = [[0], [1], [10], [11]]
print([round(KMeans(n_clusters=k, n_init=10, random_state=0).fit(X).inertia_, 2) for k in (1, 2, 4)])`,
          answer: '[101.0, 1.0, 0.0]',
          hint: 'With k = 1 the centroid is the mean of everything, 5.5.',
          why: 'k = 1: the squared distances to 5.5 are 30.25, 20.25, 20.25 and 30.25, which sum to 101. k = 2: 1.0. k = 4: every point is its own centroid, so 0. Inertia always falls as k grows, so the lowest inertia cannot be how you choose k.',
        },
        {
          kind: 'choice',
          id: 'classical-kmeans-5',
          ask: 'Inertia for k = 1 to 8 on some customer data: 1000, 520, 180, 150, 128, 110, 96, 85. Which k does the elbow suggest?',
          options: ['8, because inertia is lowest there', '3: the drop from 2 to 3 is large and every later drop is small', '1, because it is the simplest', '2, because it has the single largest drop'],
          answer: 1,
          why: 'Going from 1 to 2 and from 2 to 3 removes 480 and 340. After that each extra cluster removes 30 or less. Three clusters capture the structure, and further ones split groups that belong together. Real elbows are often less clear than this one.',
        },
        {
          kind: 'choice',
          id: 'classical-kmeans-6',
          ask: 'In the figure, step Start A until it converges: the total squared distance ends at about 56. Do the same with Start B: it ends at about 253. What does that show?',
          options: [
            'Start B needs more steps',
            'k-means stops at a local optimum that depends on the starting centroids, so run it from several starts and keep the lowest total',
            'The data has two clusters, not three',
            'The assign step has a bug',
          ],
          answer: 1,
          why: 'In Start B two centroids begin inside the same blob and share it, leaving one centroid to cover the other two blobs. No single assign or update step can fix that, so the loop stops there. More steps do nothing. Another start does.',
        },
        {
          kind: 'choice',
          id: 'classical-kmeans-7',
          ask: 'In the figure, the total squared distance falls or holds at every half-step. Why can neither step make it rise?',
          options: [
            'Because the centroids start far apart',
            'Assign moves each point to a centroid that is nearer or the same, and the mean is the position that minimises the squared distance to a set of points',
            'Because the learning rate is small',
            'It can rise: the figure is a lucky case',
          ],
          answer: 1,
          why: 'Each step is the best possible move for one half of the problem with the other half held still. A total that never rises and cannot go below zero must settle, which is why k-means always converges.',
        },
        {
          kind: 'bug',
          id: 'classical-kmeans-8',
          ask: 'The update step. It crashes, or with some shapes gives centroids in the wrong place.',
          code: `import numpy as np

def update(X, labels, k):
    # X: (n, d)   labels: (n,)   returns centroids: (k, d)
    centroids = np.zeros((k, X.shape[1]))
    for j in range(k):
        centroids[j] = X[labels == j].mean(axis=1)
    return centroids`,
          line: 7,
          fix: '        centroids[j] = X[labels == j].mean(axis=0)',
          why: '`axis=1` averages across the features of each point and gives one number per point. A centroid is the mean over the points, one number per feature: `axis=0`.',
        },
        {
          kind: 'output',
          id: 'classical-kmeans-9',
          ask: 'Four customers: age in years and income in pounds. The code asks whether the first two customers share a cluster, without scaling and then with it. What does this print?',
          code: `import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

X = np.array([[20, 30000.0], [60, 31000.0], [22, 32000.0], [58, 33000.0]])
raw = KMeans(n_clusters=2, n_init=10, random_state=0).fit_predict(X)
scaled = KMeans(n_clusters=2, n_init=10, random_state=0).fit_predict(StandardScaler().fit_transform(X))
print(raw[0] == raw[1], scaled[0] == scaled[1])`,
          answer: 'True False',
          hint: 'In raw units, how far apart are the first two customers in age, and how far in income?',
          why: 'Unscaled, a gap of 40 years is nothing next to a gap of 1,000 pounds, so the 20-year-old and the 60-year-old are grouped by income. After standardising, both features count equally, the two age groups are the clearest structure, and the first two customers are separated.',
        },
        {
          kind: 'choice',
          id: 'classical-kmeans-10',
          ask: 'Your data forms two long, thin, parallel stripes. You run k-means with k = 2. What is the likely result?',
          options: [
            'One cluster per stripe',
            'Each cluster takes one end of both stripes, cutting across them',
            'An error, because the clusters are not round',
            'All points in one cluster',
          ],
          answer: 1,
          why: 'k-means minimises distance to a centre, which favours compact round groups. Splitting the stripes across their length gives a lower total distance than one centroid per stripe. For stretched or curved groups use a Gaussian mixture or a density-based method such as DBSCAN.',
        },
        {
          kind: 'choice',
          id: 'classical-kmeans-11',
          ask: 'You run k-means with k = 4 on points scattered evenly at random over a square. What do you get?',
          options: [
            'An error saying that no clusters were found',
            'Four tidy-looking clusters that divide the square, which mean nothing',
            'One cluster',
            'A different number of clusters, chosen automatically',
          ],
          answer: 1,
          why: 'k-means always returns k clusters. It partitions whatever it is given and has no way of saying "there is no structure here". Clusters are a proposal, to be checked against the elbow or silhouette and against whether they are useful.',
        },
        {
          kind: 'write',
          id: 'classical-kmeans-12',
          numpy: true,
          ask: 'Write the assign step: for every point, the index of its nearest centroid.',
          starter: `import numpy as np

def assign(X, centroids):
    # X: (n, d)   centroids: (k, d)   returns: (n,) of integers
    pass`,
          solution: `import numpy as np

def assign(X, centroids):
    distances = ((X[:, None, :] - centroids[None, :, :]) ** 2).sum(axis=2)
    return distances.argmin(axis=1)`,
          tests: `X = np.array([[0.0, 0.0], [1.0, 0.0], [9.0, 9.0], [10.0, 10.0]])
C = np.array([[0.0, 0.0], [10.0, 10.0]])
out = assign(X, C)
assert out is not None, "the function returns nothing yet"
out = np.asarray(out)
assert out.shape == (4,), f"one label per point: expected shape (4,), got {out.shape}"
assert out.tolist() == [0, 0, 1, 1], f"the first two points are nearest centroid 0 and the last two nearest centroid 1, got {out.tolist()}"
assert np.asarray(assign(X, C[::-1])).tolist() == [1, 1, 0, 0], "with the centroids swapped the labels should swap too"
C3 = np.array([[0.0, 0.0], [5.0, 5.0], [10.0, 10.0]])
assert np.asarray(assign(np.array([[4.0, 6.0], [0.0, 1.0], [8.0, 9.0]]), C3)).tolist() == [1, 0, 2], "wrong with three centroids: take the smallest distance over the centroids, for each point"`,
          why: 'Broadcasting (n, 1, d) against (1, k, d) gives every point minus every centroid, shape (n, k, d). Summing the squares over the last axis leaves an (n, k) table of distances, and `argmin` along each row picks the nearest centroid. A loop over centroids is as good.',
        },
        {
          kind: 'design',
          id: 'classical-kmeans-13',
          ask: 'Marketing asks you to "segment our customers with k-means". Sketch how you would do it and how you would check that the segments mean anything.',
          why: 'Clustering has no right answer to score against, so the work is in the preparation and in checking that the result is stable and useful.',
          checklist: [
            { point: 'Ask what the segments are for', why: 'Segments for pricing need different features, and a different number of groups, from segments for email campaigns.' },
            { point: 'Choose a small set of features that matter for that purpose', why: 'Every feature gets a vote in the distance. Irrelevant columns add noise that hides the structure.' },
            { point: 'Fix skew and outliers, then standardise', why: 'Spend and counts have long tails. A few huge customers would otherwise each become their own cluster, and unscaled columns would dominate.' },
            { point: 'Run several values of k with several starts each', why: 'One run from one start can be a poor local optimum. Compare inertia and silhouette across k.' },
            { point: 'Check stability: do the same segments appear on another sample or seed?', why: 'Segments that change when the data is resampled are noise, not structure.' },
            { point: 'Describe each cluster in plain terms from its centroid and size', why: 'If you cannot say what makes a segment different, nobody can act on it.' },
            { point: 'Test whether the segments differ on something not used to build them', why: 'Different churn or response rates per segment are evidence that the grouping reflects real behaviour.' },
            { point: 'Say plainly that k-means returns k groups whether or not they exist', why: 'Stakeholders tend to treat clusters as discovered facts. They are one useful way of slicing the data.' },
          ],
        },
      ],
    },
    {
      id: 'classical-pca',
      title: 'PCA: fewer features, most of the spread',
      summary: 'Find the directions along which the data varies most, and keep only those.',
      widget: 'classical-pca',
      text: [
        'Real tables have features that move together: height and weight, clicks and page views. **PCA** (principal component analysis) replaces them with new axes. The first **principal component** is the direction along which the data is most spread out. The second is the direction of greatest remaining spread at right angles to the first, and so on. Each point is then described by its position along the first few of these axes, which gives you fewer columns that keep most of the variation.',
        'How much is kept is the **explained variance ratio**: the share of the total variance that lies along each component. The shares add up to 1. Keep enough components to reach, say, 90 or 95%, or keep two if the aim is a picture. In scikit-learn, `n_components=0.95` means "as many as it takes to explain 95%".',
        { code: `from sklearn.decomposition import PCA
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

pca = make_pipeline(StandardScaler(), PCA(n_components=0.95))
Z_train = pca.fit_transform(X_train)     # learn the directions on training data
Z_test = pca.transform(X_test)           # reuse them
pca[-1].explained_variance_ratio_` },
        'PCA centres the data itself, but it does not scale it. Variance depends on units, so a column in large numbers looks like the direction of greatest spread and becomes the first component by itself. Standardise first unless all the features share a unit. Like a scaler, PCA is fitted on the training data only and then applied to everything else.',
        'Use it to draw high-dimensional data in two dimensions, to compress many correlated features, to speed up or steady models that depend on distances (k-nearest neighbours, k-means), and to remove collinearity before a linear model.',
        'Know when not to. Each component is a mix of all the original features, so you lose the meaning of your columns. Tree ensembles on tabular data rarely gain from it. And PCA never looks at the target: it keeps the directions with the most spread, which need not be the ones that predict anything. The signal can sit in a low-variance direction that PCA throws away.',
      ],
      rules: [
        'Components are directions of greatest variance, each at right angles to the ones before.',
        'The explained variance ratios add up to 1. Keep enough components for the share you need.',
        'Standardise before PCA unless the features share a unit.',
        'Fit PCA on the training data only, then `transform` the rest.',
        'Components are mixes of all features: you gain compactness and lose meaning.',
        'PCA ignores the target. High variance is not the same as useful.',
      ],
      questions: [
        {
          kind: 'choice',
          id: 'classical-pca-1',
          ask: 'In the figure, turn the line until the share kept is as high as it goes: about 89.5%, near 32°. Now add 90° to the angle. What share is kept there, and why?',
          options: [
            'About 89.5% again: the direction does not matter',
            'About 10.5%: the two directions are at right angles, so between them they hold all of the variance',
            '0%: nothing varies at right angles to the first component',
            '50%: any second direction keeps half',
          ],
          answer: 1,
          why: 'In two dimensions the first component and the direction at right angles to it share out the whole variance: 89.5% + 10.5% = 100%. The second direction is the second principal component, and dropping it loses a tenth of the spread.',
        },
        {
          kind: 'output',
          id: 'classical-pca-2',
          ask: 'The second column is exactly twice the first. What does this print?',
          code: `import numpy as np
from sklearn.decomposition import PCA

X = np.array([[1.0, 2.0], [2.0, 4.0], [3.0, 6.0], [4.0, 8.0]])
pca = PCA().fit(X)
print(pca.explained_variance_ratio_.round(2).tolist())`,
          answer: '[1.0, 0.0]',
          why: 'All four points lie on one straight line, so one direction holds all the variance and nothing is left for the second. Two columns, one piece of information: the case where PCA compresses without losing anything.',
        },
        {
          kind: 'output',
          id: 'classical-pca-3',
          ask: 'Four points on the axes. What does this print?',
          code: `import numpy as np
from sklearn.decomposition import PCA

X = np.array([[2.0, 0.0], [0.0, 1.0], [-2.0, 0.0], [0.0, -1.0]])
pca = PCA().fit(X)
print(pca.explained_variance_ratio_.round(2).tolist())`,
          answer: '[0.8, 0.2]',
          hint: 'Compare the sum of squares along x with the sum of squares along y.',
          why: 'The data is already centred. Along x the squares sum to 4 + 4 = 8, along y to 1 + 1 = 2. So the x direction is the first component with 8 / 10 of the variance, and y is the second with 2 / 10.',
        },
        {
          kind: 'number',
          id: 'classical-pca-4',
          ask: 'A PCA on three features gives components with variances 6, 3 and 1. What share of the total variance do the first two components keep?',
          answer: 0.9,
          check: '(6 + 3) / (6 + 3 + 1)',
          why: '(6 + 3) / 10 = 0.9. With `n_components=0.9` scikit-learn would keep exactly these two, and with `n_components=0.95` it would need all three.',
        },
        {
          kind: 'output',
          id: 'classical-pca-5',
          ask: 'What does this print?',
          code: `import numpy as np
from sklearn.decomposition import PCA

rng = np.random.default_rng(0)
X = rng.normal(size=(6, 4))
pca = PCA(n_components=2)
Z = pca.fit_transform(X)
print(Z.shape, pca.components_.shape)`,
          answer: '(6, 2) (2, 4)',
          hint: 'Rows are examples. Each component is a direction in the original feature space.',
          why: 'Six rows stay six rows, now with two columns: the positions along the two components. `components_` holds one row per component, and each is a direction in the original four features, so it has four entries.',
        },
        {
          kind: 'output',
          id: 'classical-pca-6',
          ask: 'The first column counts from 0 to 5. The second switches between 0 and 100. The code prints the direction of the first component (with the signs dropped). What does it print?',
          code: `import numpy as np
from sklearn.decomposition import PCA

X = np.array([[0, 0], [1, 100], [2, 0], [3, 100], [4, 0], [5, 100.0]])
pca = PCA(n_components=1).fit(X)
print(np.abs(pca.components_[0]).round(2).tolist())`,
          answer: '[0.01, 1.0]',
          hint: 'Which column has by far the larger variance in raw units?',
          why: 'The second column varies by 100s and the first by single units, so nearly all the variance lies along the second column and the component points almost exactly along it. PCA has found the column with the biggest numbers. After standardising, the direction would be [0.71, 0.71].',
        },
        {
          kind: 'bug',
          id: 'classical-pca-7',
          ask: 'The columns are in very different units. The first component turns out to be almost exactly the one column with the largest numbers.',
          code: `from sklearn.decomposition import PCA
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

model = make_pipeline(PCA(n_components=5), StandardScaler(), LogisticRegression())
model.fit(X_train, y_train)`,
          line: 6,
          fix: 'model = make_pipeline(StandardScaler(), PCA(n_components=5), LogisticRegression())',
          why: 'The steps of a pipeline run in order, so PCA sees the raw columns and the scaler arrives too late. Scale first, then find the directions.',
        },
        {
          kind: 'bug',
          id: 'classical-pca-8',
          ask: 'A model trained on `Z_train` does badly on `Z_test`, although it does well on a validation split taken from the training data.',
          code: `from sklearn.decomposition import PCA

pca = PCA(n_components=10).fit(X_train)
Z_train = pca.transform(X_train)
Z_test = PCA(n_components=10).fit_transform(X_test)`,
          line: 5,
          fix: 'Z_test = pca.transform(X_test)',
          why: 'A second PCA fitted on the test set finds its own directions, which can be ordered, rotated or flipped differently. Column 3 of `Z_test` then means something other than column 3 of `Z_train`. Fit once on the training data and reuse it.',
        },
        {
          kind: 'choice',
          id: 'classical-pca-9',
          ask: 'A table has 30 named features. You plan to train gradient boosting and must be able to explain what drives the predictions. A colleague suggests running PCA first "to help the model". What do you say?',
          options: [
            'Yes: PCA always improves accuracy',
            'Probably not: trees handle correlated features well, and the components are mixes of all 30 features, so the explanation would be lost',
            'Yes, but keep all 30 components',
            'Only if the features are scaled',
          ],
          answer: 1,
          why: 'Tree ensembles rarely gain from PCA on a table of this size, and "component 4 matters most" explains nothing to anyone. PCA earns its place with many correlated features, with distance-based models, or for a plot.',
        },
        {
          kind: 'choice',
          id: 'classical-pca-10',
          ask: 'Two classes differ only along a direction in which the data varies very little. Along the direction of greatest variance they overlap completely. You keep one principal component and train a classifier on it. What happens?',
          options: [
            'The classifier does well: PCA keeps the important direction',
            'The classifier is close to guessing: PCA kept the direction with the most spread and dropped the one that separates the classes',
            'PCA notices the labels and keeps the separating direction',
            'It depends on the classifier',
          ],
          answer: 1,
          why: 'PCA is unsupervised. It ranks directions by variance and never sees the labels. When the signal lives in a low-variance direction, cutting components cuts the signal. Check the score with and without PCA before keeping it.',
        },
        {
          kind: 'choice',
          id: 'classical-pca-11',
          ask: 'After PCA on customer data, a stakeholder asks which original feature the first component "is". What is the honest answer?',
          options: [
            'The feature with the largest mean',
            'None of them: it is a weighted mix of all the features, and you can only show which ones have the largest weights in it',
            'The first column of the table',
            'The target',
          ],
          answer: 1,
          why: 'A component is a direction, a combination of every original feature. The weights in `components_` show what goes into the mix, and sometimes that reads as "overall size" or "spend against frequency", but often it has no tidy name.',
        },
        {
          kind: 'write',
          id: 'classical-pca-12',
          numpy: true,
          ask: 'Write what the figure computes: the variance of the data after projecting it onto a direction. Centre the columns, make the direction a unit vector, project, and return the variance (dividing by the number of points).',
          starter: `import numpy as np

def variance_along(X, direction):
    # X: (n, d)   direction: (d,), any length
    pass`,
          solution: `import numpy as np

def variance_along(X, direction):
    centred = X - X.mean(axis=0)
    unit = direction / np.linalg.norm(direction)
    return float(np.var(centred @ unit))`,
          tests: `X = np.array([[0.0, 0.0], [2.0, 0.0], [4.0, 0.0]])
out = variance_along(X, np.array([1.0, 0.0]))
assert out is not None, "the function returns nothing yet"
assert abs(out - 8 / 3) < 1e-9, f"the points 0, 2, 4 along x have variance 8/3, got {out}"
assert abs(variance_along(X, np.array([0.0, 1.0]))) < 1e-9, "nothing varies along y for these points, so the variance should be 0"
assert abs(variance_along(X, np.array([3.0, 0.0])) - 8 / 3) < 1e-9, "the length of the direction must not matter: divide it by its norm"
D = np.array([[1.0, 1.0], [2.0, 2.0], [3.0, 3.0]])
assert abs(variance_along(D, np.array([1.0, 1.0])) - 4 / 3) < 1e-9, "points on the diagonal, projected onto the diagonal, should give 4/3"
assert abs(variance_along(D, np.array([1.0, -1.0]))) < 1e-9, "at right angles to the diagonal nothing varies"`,
          why: 'Projecting is a dot product with a unit vector. PCA is the search for the unit vector that makes this number as large as possible, then the next largest at right angles, and so on.',
        },
      ],
    },
    {
      id: 'classical-lab',
      title: 'Lab: logistic regression from scratch',
      summary: 'Build a working classifier in NumPy, one function at a time, and train it by gradient descent.',
      text: [
        'In this lab you build logistic regression with nothing but NumPy: the sigmoid, the prediction, the loss, the gradient, the update and the training loop. It is about thirty lines in the end, and those lines are the skeleton of every neural network you will train later. Only the model in the middle gets bigger.',
        'The data is a matrix `X` of shape `(n, d)`, one row per example, and a vector `y` of `n` labels, each 0 or 1. The model is a weight vector `w` of shape `(d,)` and a single bias `b`. The prediction is `p = sigmoid(X @ w + b)`, one probability per row.',
        'The loss is the average log loss. Its gradients are short: with `p − y` as the error of each row, the gradient for the weights is `X.T @ (p − y) / n` and for the bias it is the mean of `p − y`. Training repeats one line: move `w` and `b` a small step against their gradients.',
        'Each step below is run by itself, so the helper functions you have already written are given again in the starter code. Keep every array one-dimensional where the comments say `(n,)`: mixing `(n,)` with `(n, 1)` is the classic silent bug here.',
      ],
      rules: [
        'Forward: `p = sigmoid(X @ w + b)`.',
        'Loss: the mean of `−log(p)` for label 1 and `−log(1 − p)` for label 0, with `p` clipped away from 0 and 1.',
        'Gradients: `X.T @ (p − y) / n` for the weights, `mean(p − y)` for the bias.',
        'Step: `w = w − lr × grad_w`, `b = b − lr × grad_b`. Repeat.',
        'Check a hand-written gradient against a numerical one before trusting it.',
        'Watch the loss fall. A loss of 0.693 that does not move means the model has learnt nothing.',
      ],
      questions: [
        {
          kind: 'write',
          id: 'classical-lab-1',
          numpy: true,
          ask: 'Step 1. Write the sigmoid so that it works on a single number and on a NumPy array of any shape.',
          starter: `import numpy as np

def sigmoid(z):
    # 1 / (1 + e^-z), element by element
    pass`,
          solution: `import numpy as np

def sigmoid(z):
    return 1 / (1 + np.exp(-z))`,
          tests: `out = sigmoid(0.0)
assert out is not None, "the function returns nothing yet"
assert abs(out - 0.5) < 1e-12, f"sigmoid(0) should be 0.5, got {out}"
z = np.array([-2.0, 0.0, 2.0])
s = sigmoid(z)
assert s.shape == (3,), f"an array of shape (3,) should give shape (3,), got {s.shape}"
assert np.allclose(s, [0.11920292, 0.5, 0.88079708]), f"sigmoid([-2, 0, 2]) should be about [0.119, 0.5, 0.881], got {s}"
assert np.allclose(sigmoid(-z), 1 - s), "sigmoid(-z) should equal 1 - sigmoid(z)"
assert sigmoid(np.zeros((2, 3))).shape == (2, 3), "it should keep the shape of a 2-D array"`,
          why: '`np.exp` works element by element, so one line covers numbers, vectors and matrices. Using `math.exp` here would fail on arrays.',
        },
        {
          kind: 'write',
          id: 'classical-lab-2',
          numpy: true,
          ask: 'Step 2. Write the forward pass: the probability of class 1 for every row of `X`.',
          starter: `import numpy as np

def sigmoid(z):
    return 1 / (1 + np.exp(-z))

def predict_proba(X, w, b):
    # X: (n, d)   w: (d,)   b: a number   returns: (n,)
    pass`,
          solution: `import numpy as np

def sigmoid(z):
    return 1 / (1 + np.exp(-z))

def predict_proba(X, w, b):
    return sigmoid(X @ w + b)`,
          tests: `X = np.array([[1.0, 2.0], [0.0, 0.0], [-1.0, 1.0]])
out = predict_proba(X, np.array([1.0, -1.0]), 0.0)
assert out is not None, "the function returns nothing yet"
assert out.shape == (3,), f"one probability per row: expected shape (3,), got {out.shape}"
assert np.allclose(out, [0.26894142, 0.5, 0.11920292]), f"with w = (1, -1) and b = 0 the scores are -1, 0 and -2, got probabilities {out}"
assert np.allclose(predict_proba(X, np.zeros(2), 2.0), 0.88079708), "with zero weights every row should get sigmoid(b)"`,
          why: '`X @ w` is one dot product per row, giving the scores, shape `(n,)`. The bias is added to each and the sigmoid turns scores into probabilities. This is the whole model.',
        },
        {
          kind: 'write',
          id: 'classical-lab-3',
          numpy: true,
          ask: 'Step 3. Write the average log loss. Clip the probabilities to the range [1e-12, 1 − 1e-12] first, so that a prediction of exactly 0 or 1 cannot produce infinity.',
          starter: `import numpy as np

def log_loss(y, p):
    # y: (n,) of 0 and 1   p: (n,) probabilities of class 1
    pass`,
          solution: `import numpy as np

def log_loss(y, p):
    p = np.clip(p, 1e-12, 1 - 1e-12)
    return float(-np.mean(y * np.log(p) + (1 - y) * np.log(1 - p)))`,
          tests: `y = np.array([1.0, 0.0])
out = log_loss(y, np.array([0.5, 0.5]))
assert out is not None, "the function returns nothing yet"
assert abs(out - 0.693147) < 1e-5, f"predicting 0.5 for everything should cost about 0.693, got {out}"
assert abs(log_loss(y, np.array([0.9, 0.1])) - 0.105361) < 1e-5, "0.9 for a 1 and 0.1 for a 0 should average about 0.105"
assert abs(log_loss(y, np.array([0.9, 0.8])) - 0.857399) < 1e-5, "0.9 for a 1 and 0.8 for a 0 should average about 0.857: is the y = 0 case using 1 - p?"
with np.errstate(all="ignore"):
    worst = log_loss(y, np.array([0.0, 1.0]))
assert np.isfinite(worst), "a certain and wrong prediction gave inf or nan: clip p before taking the log"
assert worst > 20, "a certain and wrong prediction should still cost a lot (about 27.6)"`,
          why: 'Multiplying by `y` and by `1 − y` picks the right term for each row with no `if`. The clip matters in practice: one probability that rounds to exactly 0 or 1 would otherwise make the whole loss `inf` or `nan`.',
        },
        {
          kind: 'write',
          id: 'classical-lab-4',
          numpy: true,
          ask: 'Step 4. Write the gradients of the average log loss with respect to `w` and `b`. With `p` as the predictions: `X.T @ (p − y) / n` and `mean(p − y)`.',
          starter: `import numpy as np

def sigmoid(z):
    return 1 / (1 + np.exp(-z))

def gradients(X, y, w, b):
    # returns (grad_w, grad_b): shapes (d,) and a number
    pass`,
          solution: `import numpy as np

def sigmoid(z):
    return 1 / (1 + np.exp(-z))

def gradients(X, y, w, b):
    error = sigmoid(X @ w + b) - y
    return X.T @ error / len(y), float(np.mean(error))`,
          tests: `X = np.array([[0.0, 1.0], [1.0, 3.0], [2.0, 0.0], [3.0, 2.0]])
y = np.array([0.0, 0.0, 1.0, 1.0])
out = gradients(X, y, np.zeros(2), 0.0)
assert out is not None, "the function returns nothing yet"
gw, gb = out
assert np.shape(gw) == (2,), f"grad_w should have one entry per feature: expected shape (2,), got {np.shape(gw)}"
assert np.allclose(gw, [-0.5, 0.25]), f"at w = 0, b = 0 every p is 0.5 and grad_w should be [-0.5, 0.25], got {gw}"
assert abs(gb) < 1e-12, f"at w = 0, b = 0 with balanced labels grad_b should be 0, got {gb}"
def loss(w, b):
    p = 1 / (1 + np.exp(-(X @ w + b)))
    return -np.mean(y * np.log(p) + (1 - y) * np.log(1 - p))
w, b, h = np.array([0.3, -0.2]), 0.1, 1e-6
gw, gb = gradients(X, y, w, b)
for i in range(2):
    step = np.zeros(2)
    step[i] = h
    numeric = (loss(w + step, b) - loss(w - step, b)) / (2 * h)
    assert abs(gw[i] - numeric) < 1e-6, f"grad_w[{i}] does not match a numerical gradient check: {gw[i]} against {numeric}"
numeric = (loss(w, b + h) - loss(w, b - h)) / (2 * h)
assert abs(gb - numeric) < 1e-6, f"grad_b does not match a numerical gradient check: {gb} against {numeric}"`,
          why: 'Each row pushes the weights in the direction of its features, in proportion to how wrong the prediction was. `X.T @ error` adds up those pushes for all rows at once. The last tests are a gradient check: nudge each parameter, measure the change in the loss, and compare.',
        },
        {
          kind: 'bug',
          id: 'classical-lab-5',
          ask: 'Step 5. A colleague wrote the update step. It crashes with a shape error on any dataset where the number of rows differs from the number of features.',
          code: `import numpy as np

def step(X, y, w, b, lr):
    # X: (n, d)   y: (n,)   w: (d,)
    p = 1 / (1 + np.exp(-(X @ w + b)))
    grad_w = X @ (p - y) / len(y)
    grad_b = np.mean(p - y)
    return w - lr * grad_w, b - lr * grad_b`,
          line: 6,
          fix: '    grad_w = X.T @ (p - y) / len(y)',
          why: '`p − y` has one entry per row, shape `(n,)`. `X @ …` needs a vector with one entry per feature, so `(n, d) @ (n,)` does not fit. The gradient needs one number per feature: `X.T @ (p − y)` is `(d, n) @ (n,)`, shape `(d,)`. Write the shapes next to the line and the bug shows itself.',
        },
        {
          kind: 'write',
          id: 'classical-lab-6',
          numpy: true,
          ask: 'Step 6. Write the training loop. Start from zero weights and a zero bias, take `steps` steps of gradient descent with learning rate `lr`, and return `(w, b)`.',
          starter: `import numpy as np

def sigmoid(z):
    return 1 / (1 + np.exp(-z))

def gradients(X, y, w, b):
    error = sigmoid(X @ w + b) - y
    return X.T @ error / len(y), float(np.mean(error))

def train(X, y, lr, steps):
    # returns (w, b) with w of shape (d,)
    pass`,
          solution: `import numpy as np

def sigmoid(z):
    return 1 / (1 + np.exp(-z))

def gradients(X, y, w, b):
    error = sigmoid(X @ w + b) - y
    return X.T @ error / len(y), float(np.mean(error))

def train(X, y, lr, steps):
    w = np.zeros(X.shape[1])
    b = 0.0
    for _ in range(steps):
        grad_w, grad_b = gradients(X, y, w, b)
        w = w - lr * grad_w
        b = b - lr * grad_b
    return w, b`,
          tests: `X = np.array([[0.0], [1.0], [2.0], [3.0]])
y = np.array([0.0, 0.0, 1.0, 1.0])
out = train(X, y, 0.5, 0)
assert out is not None, "the function returns nothing yet"
w, b = out
assert np.shape(w) == (1,) and np.allclose(w, 0) and b == 0, "with no steps the weights and the bias should still be zero"
w, b = train(X, y, 0.5, 1)
assert np.allclose(w, [0.25]) and abs(b) < 1e-12, f"after one step with lr 0.5, w should be [0.25] and b should be 0, got {w} and {b}"
w, b = train(X, y, 0.5, 2000)
p = sigmoid(X @ w + b)
assert ((p >= 0.5) == (y == 1)).all(), "after 2000 steps all four points should be classified correctly"
assert abs(-b / w[0] - 1.5) < 0.05, f"the boundary should be at about x = 1.5, got {-b / w[0]}"
loss = -np.mean(y * np.log(p) + (1 - y) * np.log(1 - p))
assert loss < 0.2, f"the loss should have fallen well below the starting 0.693, got {loss}"`,
          why: 'Zero is a fine starting point for logistic regression: the loss has a single valley. The loop is gradients, then update, repeated. Swap the two helper functions for a network and its backward pass and this is how deep learning trains too.',
        },
        {
          kind: 'write',
          id: 'classical-lab-7',
          numpy: true,
          ask: 'Step 7. Write the accuracy of the model: the share of rows where the predicted class matches the label. Predict class 1 when the probability is at least `threshold`.',
          starter: `import numpy as np

def sigmoid(z):
    return 1 / (1 + np.exp(-z))

def accuracy(X, y, w, b, threshold=0.5):
    # returns a number between 0 and 1
    pass`,
          solution: `import numpy as np

def sigmoid(z):
    return 1 / (1 + np.exp(-z))

def accuracy(X, y, w, b, threshold=0.5):
    predicted = sigmoid(X @ w + b) >= threshold
    return float(np.mean(predicted == (y == 1)))`,
          tests: `X = np.array([[0.0], [1.0], [2.0], [3.0]])
y = np.array([0.0, 0.0, 1.0, 1.0])
out = accuracy(X, y, np.array([2.0]), -3.0)
assert out is not None, "the function returns nothing yet"
assert out == 1.0, f"a boundary at x = 1.5 gets all four right, so the accuracy should be 1.0, got {out}"
assert accuracy(X, y, np.array([2.0]), -5.0) == 0.75, "a boundary at x = 2.5 gets three of four right: 0.75"
assert accuracy(X, y, np.array([-2.0]), 3.0) == 0.0, "a model that points the wrong way gets none right"
assert accuracy(X, y, np.array([2.0]), -5.0, threshold=0.1) == 1.0, "use the threshold argument: at 0.1 the point at x = 2 (p = 0.27) counts as class 1"`,
          why: 'The model outputs probabilities, and the threshold turns them into decisions. Accuracy is the simplest check, and a weak one on its own: it hides how confident the model was and misleads when one class is rare.',
        },
        {
          kind: 'output',
          id: 'classical-lab-8',
          ask: 'Step 8. Everything together on a tiny dataset. What does this print?',
          code: `import numpy as np

X = np.array([[0.0], [1.0], [2.0], [3.0]])
y = np.array([0.0, 0.0, 1.0, 1.0])
w, b = np.zeros(1), 0.0
for _ in range(2000):
    p = 1 / (1 + np.exp(-(X @ w + b)))
    w = w - 0.5 * X.T @ (p - y) / len(y)
    b = b - 0.5 * np.mean(p - y)
print((p >= 0.5).astype(int), round(float(-b / w[0]), 1))`,
          answer: '[0 0 1 1] 1.5',
          hint: 'The second number is where the decision boundary ends up. The data is symmetric.',
          why: 'The labels switch between x = 1 and x = 2, and the data is symmetric, so the boundary −b / w settles at 1.5 and all four points are classified correctly. This is the answer `LogisticRegression` gave for the same data in the earlier lesson, reached with eight lines of NumPy.',
        },
        {
          kind: 'design',
          id: 'classical-lab-9',
          ask: 'Step 9. You run your from-scratch model on a real dataset with 30 columns. The loss prints `nan` after a few steps, or sits at 0.693 and never moves. Sketch what you would check, in order.',
          why: 'Almost every failure of a hand-written training loop is one of a short list: scale, learning rate, shapes, labels or a wrong gradient. Working through that list in order of cheapness is a skill you will use on every model you train.',
          checklist: [
            { point: 'Print the shapes of X, y, w and the predictions', why: 'A `y` of shape (n, 1) against predictions of shape (n,) broadcasts to (n, n) without an error and wrecks the loss and the gradient.' },
            { point: 'Check that the labels are exactly 0 and 1', why: 'Labels of −1 and +1, or strings, make the log-loss formula meaningless.' },
            { point: 'Standardise the features', why: 'A column in the thousands produces huge scores, the sigmoid saturates at 0 or 1, and gradient descent either explodes or crawls.' },
            { point: 'Lower the learning rate by 10 and watch the first steps', why: 'A loss that jumps about or grows is overshooting. A loss that falls smoothly, if slowly, shows the loop is right.' },
            { point: 'Clip the probabilities before the logarithm', why: 'log(0) is −inf and one such row turns the average into `nan`.' },
            { point: 'Run a numerical gradient check on a few parameters', why: 'It tells you in seconds whether the gradient code or something else is at fault.' },
            { point: 'Try to overfit ten rows', why: 'A correct loop can drive the loss on ten rows close to zero. If it cannot, there is a bug, not a modelling problem.' },
            { point: 'Compare with `LogisticRegression` on the same data', why: 'A reference implementation says what loss and accuracy are reachable, so you know whether to keep debugging.' },
          ],
        },
      ],
    },
  ],
}
