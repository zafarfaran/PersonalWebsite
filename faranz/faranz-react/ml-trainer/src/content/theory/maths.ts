import type { Block } from '../../types'

/** The full theory for each lesson of the maths module, keyed by lesson id. */
export const mathsTheory: Record<string, Block[]> = {
  'maths-vectors': [
    { h: 'What a vector is' },
    'A **vector** is a list of numbers in a fixed order. That is the whole definition. `(3, 4)` is a vector with two numbers. `(170, 65, 31)` is a vector with three.',
    'The numbers are called **entries** (or components), and how many there are is the **dimension**. So `(3, 4)` is a 2-dimensional vector. The order matters: `(3, 4)` and `(4, 3)` are different vectors.',
    { sub: 'Why machine learning turns everything into vectors' },
    'A model can only do arithmetic, so whatever you give it has to become numbers first. A person in a table becomes (height, weight, age). A small grey image becomes the brightness of each pixel, one after another. A word becomes a list of a few hundred numbers called an **embedding**. Once two things are vectors of the same dimension you can compare them, add them, and feed them to the same model.',

    { h: 'Two ways to picture one' },
    'As a **point**: (3, 4) is the place you reach by going 3 to the right and 4 up. As an **arrow**: the arrow from the origin (0, 0) to that point. An arrow has a length and a direction, and those two things are what the rest of this lesson measures.',
    'You cannot draw an arrow with 300 entries, and you do not need to. Every formula below works the same for any number of entries. You reason with the 2-D picture and let the arithmetic handle the rest.',

    { h: 'Adding and scaling' },
    '**Add** two vectors of the same dimension entry by entry: (1, 2) + (3, 1) = (4, 3). As arrows: walk along the first, then along the second, and see where you end up.',
    '**Scale** a vector by multiplying every entry by one number: 2 × (3, 4) = (6, 8). The arrow keeps its direction and becomes twice as long. Multiplying by a negative number turns it round to point the other way.',
    {
      code: `import numpy as np

a = np.array([1, 2])
b = np.array([3, 1])
print(a + b)
print(2 * a)`,
      out: `[4 3]
[2 4]`,
    },
    'Plain Python lists do not behave like this: `[1, 2] + [3, 1]` joins them into `[1, 2, 3, 1]`. Use NumPy arrays when you want vector arithmetic.',

    { h: 'The dot product' },
    'The **dot product** takes two vectors of the same dimension and gives back one number. Multiply the first entries together, multiply the second entries together, and so on, then add up the results. It is written `a·b`.',
    { sub: 'A worked example' },
    'Take a = (2, 3) and b = (4, −1). First entries: 2 × 4 = 8. Second entries: 3 × (−1) = −3. Add them: 8 − 3 = 5. So a·b = 5.',
    { sub: 'What the number tells you' },
    {
      list: [
        '**Positive**: the arrows point broadly the same way, less than 90° apart.',
        '**Zero**: the arrows are at right angles. Such vectors are called **orthogonal**.',
        '**Negative**: the arrows are more than 90° apart.',
      ],
    },
    'The exact relation is `a·b = |a| |b| cos θ`. Here `|a|` means the length of a, and θ (the Greek letter theta) is the angle between the two arrows. You will rarely work out the angle. What you use is the sign of the dot product and its size.',
    { sub: 'Where it shows up' },
    "A linear model's prediction is the dot product of its weights and your features: each feature times how much it matters, all added up. A neuron does the same and then bends the result. Attention in a transformer is a table of dot products between word vectors. Know this one operation well and most formulas in the field become readable.",

    { h: 'Length' },
    'The **length** of a vector, also called its **norm** and written `|a|`, is how long the arrow is. By Pythagoras, (3, 4) has length √(3² + 4²) = √25 = 5. For any vector: square every entry, add the squares, take the square root. Since a·a is exactly that sum of squares, the length is `√(a·a)`.',
    'A vector of length 1 is a **unit vector**. Dividing a vector by its own length gives a unit vector that points the same way. This is called **normalising**: (3, 4) ÷ 5 = (0.6, 0.8).',

    { h: 'Cosine similarity' },
    'The dot product mixes two things: how well the directions agree, and how long the arrows are. Often you only care about direction. Two documents on the same topic should count as alike even when one is three times as long.',
    'Divide the dot product by both lengths. The lengths cancel and only cos θ is left. That number is the **cosine similarity**: 1 means the same direction, 0 means unrelated (at right angles), −1 means opposite.',
    {
      code: `import numpy as np

a = np.array([1.0, 0.0])
b = np.array([1.0, 1.0])
cos = a @ b / (np.linalg.norm(a) * np.linalg.norm(b))
print(round(cos, 2))`,
      out: '0.71',
    },
    '`a @ b` is the dot product in NumPy, the same as `np.dot(a, b)`. `np.linalg.norm(a)` is the length. The answer 0.71 is the cosine of 45°, the angle between the two arrows.',

    { h: 'Mistakes to watch for' },
    {
      list: [
        'Taking the dot product of vectors with different dimensions. It is not defined, and NumPy raises an error.',
        'Leaving out the square root in the length. The sum of squares is the length squared.',
        'Comparing embeddings by raw dot product when their lengths differ. Long vectors score high for the wrong reason. Normalise first, or use cosine similarity.',
        'Reading a cosine of 0 as "opposite". Opposite is −1. Zero means unrelated.',
      ],
    },
  ],

  'maths-matrices': [
    { h: 'A grid of numbers' },
    'A **matrix** is a rectangle of numbers arranged in rows and columns. Its **shape** is written (rows, columns). A matrix with 2 rows and 3 columns has shape (2, 3). The entry in row i and column j is written `A[i, j]`, counting from 0 in NumPy.',
    'A dataset is one: one example per row, one feature per column. 100 people described by (height, weight, age) form a matrix of shape (100, 3).',
    { sub: 'A matrix as a machine' },
    'The more useful view is that a matrix is a machine that takes a vector in and gives a vector out. Writing `A @ v` means "feed v into A". Much of machine learning is a chain of these machines.',

    { h: 'Multiplying a matrix by a vector' },
    { sub: 'Row by row' },
    'Each entry of `A @ v` is the dot product of one row of A with v. Take A with rows (2, 0) and (1, 3), and v = (4, 5). First row: 2×4 + 0×5 = 8. Second row: 1×4 + 3×5 = 19. So `A @ v` = (8, 19). One row gives one output entry, so a matrix with 2 rows always returns 2 numbers.',
    'For this to work, each row must have as many entries as v. A matrix of shape (2, 3) accepts vectors of 3 numbers and returns vectors of 2.',
    { sub: 'Column by column' },
    'The same product can be read another way. The **columns** of A here are (2, 1) and (0, 3). `A @ v` is 4 lots of the first column plus 5 lots of the second: 4×(2, 1) + 5×(0, 3) = (8, 4) + (0, 15) = (8, 19). Same answer.',
    'This view explains what the matrix does. Feed in (1, 0) and you get the first column back. Feed in (0, 1) and you get the second. The columns are where the two unit arrows land, and every other vector is a mix of those two, so the columns decide where everything lands.',
    {
      code: `import numpy as np

A = np.array([[2, 0],
              [1, 3]])
v = np.array([4, 5])
print(A @ v)
print(4 * A[:, 0] + 5 * A[:, 1])`,
      out: `[ 8 19]
[ 8 19]`,
    },
    '`A[:, 0]` means "every row, column 0": the first column. In plain Python, without NumPy, you would loop over the rows of a list of lists and take a dot product with each, using `zip` to pair up entries and `sum` to add them.',

    { h: 'Multiplying two matrices' },
    'To compute `A @ B`, apply A to every column of B and stand the results side by side. Entry [i, j] of the result is row i of A dotted with column j of B.',
    { sub: 'The shape rule' },
    'A shape (m, n) times a shape (n, p) gives a shape (m, p). The two inner numbers must be equal, and they disappear. The outer numbers stay. So (5, 2) @ (2, 7) gives (5, 7), and (5, 2) @ (3, 7) is an error. Write the shapes next to each other before you run anything and most shape bugs show up on paper.',
    { sub: 'Order matters' },
    'With ordinary numbers 3 × 4 = 4 × 3. With matrices, `A @ B` and `B @ A` are usually different, even when both shapes fit. Stretching then shearing is not the same as shearing then stretching. A matrix that swaps two things is a good test: on the right of A it acts on the columns of A, on the left it acts on the rows.',

    { h: 'A neural network layer' },
    'A layer of a neural network is one matrix product plus a vector. Stack a **batch** (a group of examples processed together) into X with shape (batch, features). The **weights** W have shape (features, outputs). The **bias** b is a vector with one number per output. The layer computes `X @ W + b`, which has shape (batch, outputs).',
    'Take 64 examples with 8 features and a layer with 3 outputs: (64, 8) @ (8, 3) gives (64, 3). The weights never mention the batch size, so the same layer works on 64 examples or on 1. When layers are stacked, each weight matrix must start with the width of the layer feeding it: if one layer outputs 20 numbers per example, the next weight matrix has shape (20, something).',

    { h: 'The determinant' },
    'The **determinant** is one number for a square matrix (same number of rows and columns). For a 2 by 2 matrix with rows (a, b) and (c, d) it is `ad − bc`. For rows (3, 1) and (2, 4): 3×4 − 1×2 = 10.',
    'It measures how the matrix changes area. Draw the unit square (the square with corners (0, 0) and (1, 1)), push it through the matrix, and the area of the shape that comes out is the determinant (ignoring its sign). A determinant of 10 makes areas ten times bigger. A determinant of 1 keeps area the same, even if the shape is stretched one way and squashed the other.',
    { sub: 'When it is zero' },
    'A determinant of 0 means the matrix squashes the whole plane onto a line or a point. Different inputs then land on the same output, so you cannot undo the machine. The matrix has no **inverse** (a matrix that reverses it) and is called **singular**. This happens when one row or column is a fixed multiple or combination of the others: rows (1, 3) and (2, 6) give 1×6 − 3×2 = 0.',
    'In data this is a real problem. If one feature column can be computed exactly from others, linear regression has no single best answer. Its solution needs to invert the matrix XᵀX, where Xᵀ is the **transpose** of X (rows and columns swapped), and that matrix becomes singular.',

    { h: 'Common mistakes' },
    {
      list: [
        'Writing `W @ X` instead of `X @ W` for a layer. Check the inner sizes.',
        'Assuming `A @ B` equals `B @ A`.',
        'Reading a determinant of 1 as "nothing happened". It only means area is unchanged.',
        'Keeping two features where one is a fixed function of the other, such as the same price in two currencies at a fixed rate.',
      ],
    },
  ],

  'maths-shapes': [
    { h: 'Every array has a shape' },
    'A NumPy array has a **shape**: a tuple saying how many entries it has along each direction. A single list of 5 numbers has shape `(5,)`. The comma is there because it is a tuple with one item. A table of 4 rows and 6 columns has shape `(4, 6)`. A batch of 16 colour photos, each 3 colour channels of 64 by 64 pixels, has shape `(16, 3, 64, 64)`.',
    'Each direction is called an **axis**, numbered from 0. In a `(4, 6)` array, axis 0 runs down the rows (size 4) and axis 1 runs across the columns (size 6). The number of axes is the array\'s number of dimensions, `ndim`.',
    'Shape bugs are the most common bugs in numerical code. Some crash, which is the good case. Others run and give a wrong number. The habit that prevents both is to know the shape of every array on every line, and to print `x.shape` when you are not sure.',

    { h: 'Reducing along an axis' },
    'Functions such as `sum`, `mean`, `std` (standard deviation) and `max` can work along one axis. They collapse that axis and remove it from the shape.',
    { sub: 'An example with numbers' },
    'Take `X = [[1, 2, 3], [5, 6, 7]]`, shape `(2, 3)`. `X.sum(axis=0)` adds down each column: (1+5, 2+6, 3+7) = `[6, 8, 10]`, shape `(3,)`. Axis 0 is gone and one value per column is left. `X.sum(axis=1)` adds across each row: `[6, 18]`, shape `(2,)`, one value per row.',
    'You can pass several axes at once. On a `(16, 3, 64, 64)` image batch, `.mean(axis=(2, 3))` removes height and width and leaves `(16, 3)`: one average per image per channel. A rule that helps: the axis you name is the one that disappears.',
    { sub: 'Keeping the axis' },
    'With `keepdims=True` the reduced axis stays, with size 1. `X.sum(axis=1, keepdims=True)` has shape `(2, 1)` instead of `(2,)`. That looks like a small difference, but it decides whether the result combines correctly with X afterwards.',
    {
      code: `import numpy as np

X = np.array([[1, 2, 3],
              [5, 6, 7]])
print(X.sum(axis=0), X.sum(axis=1))
print(X.sum(axis=1).shape, X.sum(axis=1, keepdims=True).shape)`,
      out: `[ 6  8 10] [ 6 18]
(2,) (2, 1)`,
    },

    { h: 'Reshaping' },
    '`reshape` gives the same numbers a new shape, as long as the total count stays the same. A `(6,)` array can become `(2, 3)` or `(3, 2)`. If you write `-1` for one size, NumPy works it out from the others: `x.reshape(-1, 1)` on a `(6,)` array gives `(6, 1)`, a single column. `x.reshape(-1)` flattens anything back into one long `(n,)` vector. `squeeze` removes axes of size 1.',

    { h: 'Broadcasting' },
    '**Broadcasting** is what NumPy does when you combine two arrays of different shapes with `+`, `-`, `*` or `/`. It follows one rule.',
    { sub: 'The rule' },
    'Write the two shapes one under the other, lined up on the right. Compare the sizes pair by pair. Each pair must be equal, or one of them must be 1. A size of 1 is stretched (copied) to match the other. A missing size on the left counts as 1.',
    {
      list: [
        '`(4, 6)` with `(6,)`: line up the 6s, the missing size becomes 1 and stretches to 4. Result `(4, 6)`: the vector is applied to every row.',
        '`(4, 6)` with `(4,)`: the 4 is lined up against the 6. Not equal, neither is 1. Error.',
        '`(4, 6)` with `(4, 1)`: 1 stretches to 6, and the 4s match. Result `(4, 6)`: one number per row.',
        '`(2, 1)` with `(1, 5)`: both stretch. Result `(2, 5)`: every row value combined with every column value.',
      ],
    },
    'Centring each column of a dataset is broadcasting at work: `X - X.mean(axis=0)` is `(n, d) - (d,)`, which subtracts the column means from every row. Dividing each row by its own total needs the totals as a column, so use `keepdims=True` to get `(n, 1)`.',
    { sub: 'Every against every' },
    'Adding a new axis of size 1 on purpose lets you pair every item of one set with every item of another. `a[:, None]` turns a `(3,)` array into `(3, 1)`, and `b[None, :]` turns a `(4,)` array into `(1, 4)`. Their difference has shape `(3, 4)`: each entry of a minus each entry of b. The same trick on 2-D arrays, `A[:, None, :] - B[None, :, :]`, gives every row of A minus every row of B, which is how distances between all pairs of points are computed without a loop.',

    { h: 'The silent bug' },
    'The dangerous pair is `(n,)` and `(n, 1)`. Line them up: n against 1, and missing against n. Both stretch, and the result is `(n, n)`. No error is raised.',
    {
      code: `import numpy as np

y = np.array([10, 20])          # targets, shape (2,)
pred = np.array([[11], [19]])   # model output, shape (2, 1)
print((pred - y).shape)
print((pred.reshape(-1) - y).shape)`,
      out: `(2, 2)
(2,)`,
    },
    'A model often returns a column `(n, 1)` while the targets are `(n,)`. Subtract them and you get every prediction minus every target. Square and average, and the loss is a single number that looks fine, but it measures the wrong thing and the model learns nonsense. Make both the same shape first, with `reshape(-1)` or `squeeze`.',

    { h: 'Habits that prevent shape bugs' },
    {
      list: [
        'Write the shape as a comment next to every line that creates an array.',
        'Per-column statistics use `axis=0`. Per-row statistics use `axis=1`.',
        'Test with a non-square array. When rows equal columns, the wrong axis can run without error.',
        'Use `keepdims=True` when the result must be combined with the original array.',
        'Add `assert x.shape == (n, d)` where a wrong shape would be costly.',
      ],
    },
  ],

  'maths-derivatives': [
    { h: 'Why training needs slopes' },
    'Training a model means adjusting its **weights** (the numbers inside it) so that its **loss** goes down. The loss is one number that measures how wrong the model is: small is good. With one weight, you can draw the loss as a curve: weight along the bottom, loss up the side.',
    'To improve, you need to know which way to move the weight. If you nudge it up a little, does the loss go up or down, and how fast? That answer is the **derivative**: the slope of the curve at the point where you are.',

    { h: 'What a derivative is' },
    'Take two points on the curve, one at x and one a small step h to the right. The line through them is a **chord**, and its slope is rise over run: `(f(x + h) − f(x)) / h`. Now make h smaller and smaller. The chord turns into the line that touches the curve at x, and its slope settles on one number. That number is the derivative of f at x, written f′(x).',
    { sub: 'Reading the sign' },
    {
      list: [
        '**Positive**: the curve rises to the right. Increasing x increases f. To make f smaller, decrease x.',
        '**Negative**: the curve falls to the right. To make f smaller, increase x.',
        '**Zero**: the curve is flat at that point. It might be a minimum (bottom of a valley), a maximum (top of a hill), or a flat stretch that carries on rising afterwards.',
      ],
    },
    'Training always moves a weight against the sign of the slope. A slope of −2 says "go up". A slope of 0 only says "flat here": it does not prove you are at the lowest point.',
    'The size matters too. A slope of 10 means f changes about ten times as much as x for a small step. A slope near zero means moving x barely changes f.',

    { h: 'Rules for working them out' },
    'You rarely need the limit. Three rules cover the functions in this course.',
    {
      list: [
        '**Power rule**: xⁿ has derivative n·xⁿ⁻¹. So x² gives 2x, x³ gives 3x², and x (which is x¹) gives 1.',
        '**Constants**: a number on its own, such as 7, has derivative 0, because it does not change. A number multiplying a term stays in front: 4x³ gives 4 × 3x² = 12x².',
        '**Sums**: differentiate each term separately and add. Subtraction works the same way.',
      ],
    },
    { sub: 'A worked example' },
    'Take f(x) = 4x³ − 2x + 7. Term by term: 4x³ gives 12x², −2x gives −2, and 7 gives 0. So f′(x) = 12x² − 2. At x = 1 the slope is 12 − 2 = 10. At x = 0 it is −2, so there the curve is falling.',
    'A polynomial can be stored as a list of coefficients, lowest power first: `[7, -2, 0, 4]` means 7 − 2x + 0x² + 4x³. The rule turns the coefficient c of xⁿ into n·c for xⁿ⁻¹, so every coefficient is multiplied by its power and moves one place down, and the constant drops off. Here that gives `[-2, 0, 12]`.',

    { h: 'Slopes by computer' },
    'You can estimate a derivative without any rules: evaluate f at two nearby points and divide. This is a **numerical derivative**.',
    { sub: 'One-sided and central differences' },
    'The **one-sided difference** `(f(x + h) − f(x)) / h` uses x and a point to its right. Its error is roughly proportional to h: halve h and the error roughly halves. For f(x) = x² at x = 2 the true slope is 4, and with h = 0.1 the estimate is (4.41 − 4) / 0.1 = 4.1.',
    'The **central difference** `(f(x + h) − f(x − h)) / (2h)` uses one point on each side. The two points are 2h apart, so you divide by 2h, not by h. Its error shrinks with h², much faster, so it is the one people use.',
    {
      code: `def f(x):
    return x ** 2

h = 0.1
print(round((f(2 + h) - f(2)) / h, 6))
print(round((f(2 + h) - f(2 - h)) / (2 * h), 6))`,
      out: `4.1
4.0`,
    },
    'For x² the central difference happens to be exact. For most functions it is close but not exact.',
    { sub: 'Not too small' },
    'It is tempting to make h as tiny as possible. That fails. A Python float keeps about 16 significant digits, so 2 + 1e-20 is stored as exactly 2. Then f(x + h) equals f(x), the top of the fraction is 0, and the estimate is 0 whatever the true slope. For a central difference on ordinary floats, h around 1e-5 is a good choice.',
    { sub: 'Gradient checks' },
    'Libraries work out derivatives for you. When you write a derivative by hand, the standard test is a **gradient check**: compute it with the central difference as well, and confirm the two agree to several decimal places.',

    { h: 'Flat curves and learning' },
    'The **sigmoid** is an S-shaped function used in older networks: it turns any number into one between 0 and 1. Far to the left or right it is almost flat, so its derivative there is almost 0. This is called **saturation**. A weight whose effect passes through a saturated sigmoid barely changes the output when it moves, so the slope it receives is tiny and it learns very slowly. Over many layers this becomes the **vanishing gradient** problem, one reason modern networks prefer other functions.',

    { h: 'Mistakes to avoid' },
    {
      list: [
        'Dividing a central difference by h instead of 2h. Every estimate comes out twice too big.',
        'Choosing h so small that rounding wipes out the difference.',
        'Treating a zero slope as proof of a minimum.',
        'Forgetting that constants vanish and that numbers in front of a term multiply through.',
      ],
    },
  ],

  'maths-gradient': [
    { h: 'Slopes with many weights' },
    'The previous lesson had one weight and one slope. A real model has thousands or millions of weights, and the loss depends on all of them at once. You need to know, for each weight separately, which way to move it.',
    { sub: 'Partial derivatives' },
    'A **partial derivative** is the slope with respect to one input while every other input is held fixed. It is written ∂f/∂x (read "partial f by partial x"). To work it out, treat the other inputs as constant numbers and use the usual rules.',
    'Take f(x, y) = x² + 5xy. For ∂f/∂x, y is a constant: x² gives 2x and 5xy gives 5y, so ∂f/∂x = 2x + 5y. For ∂f/∂y, x is a constant: x² gives 0 and 5xy gives 5x, so ∂f/∂y = 5x. At the point (1, 2): ∂f/∂x = 2 + 10 = 12 and ∂f/∂y = 5.',
    { sub: 'The gradient' },
    'Put all the partial derivatives into one vector and you have the **gradient**, written ∇f (the symbol is called "nabla"). At (1, 2) above, ∇f = (12, 5). The gradient points in the direction in which f rises fastest. Its length (square every entry, add, take the square root, as for any vector) says how steep the surface is there. Training libraries report this length as the **gradient norm**.',

    { h: 'Gradient descent' },
    'Picture the loss as hilly ground with one direction for each weight, and the aim of reaching the lowest valley. The gradient points uphill, so you step the opposite way. **Gradient descent** repeats one update:',
    { code: `w = w - lr * gradient` },
    'Here lr is the **learning rate**: a small positive number that sets the size of each step. Subtract, never add: adding the gradient climbs the hill.',
    { sub: 'A worked example' },
    'Let the loss be (w − 2)², with its minimum at w = 2. Its slope is 2(w − 2). Start at w = 5 with a learning rate of 0.25. Slope: 2 × 3 = 6. Step: 0.25 × 6 = 1.5. New weight: 5 − 1.5 = 3.5. Next slope: 2 × 1.5 = 3, step 0.75, weight 2.75. Each step halves the distance to 2.',
    {
      code: `w = 5.0
for step in range(4):
    grad = 2 * (w - 2)
    w = w - 0.25 * grad
    print(step, w)`,
      out: `0 3.5
1 2.75
2 2.375
3 2.1875`,
    },
    'Steps get smaller on their own as you approach the minimum, because the slope gets smaller. At the minimum the slope is 0 and the weight stops moving.',

    { h: 'Choosing the learning rate' },
    'The learning rate is usually the most important setting in training.',
    {
      list: [
        '**Too small**: the loss falls smoothly but very slowly, staying near its starting value for a long time.',
        '**About right**: the loss falls quickly at first, then levels off.',
        '**Too large**: each step jumps past the bottom of the valley to the other side. The loss bounces up and down, and if it is large enough each jump lands higher than the last. The loss grows, and eventually becomes `nan` ("not a number").',
      ],
    },
    'In the example above, a learning rate of 0.5 on (w − 2)² lands exactly on 2 in one step. A rate of 1.0 jumps from 5 to −1 and back to 5 forever. Anything above 1.0 makes each jump bigger. The limit depends on how steep the loss is: the steeper the curve, the smaller the safe step. When the loss explodes, the usual fix is to divide the learning rate by 3 to 10. When it crawls, multiply it.',

    { h: 'Stretched valleys' },
    'With two or more weights, the loss can be much steeper in one direction than another. This happens when features have very different scales: a feature measured in thousands produces large slopes for its weight, one measured in fractions produces small ones. The loss surface becomes a long, narrow valley.',
    'One learning rate must then suit both directions. Small enough to be safe in the steep direction, it is far too small in the shallow one, which barely moves. Large enough to move along the shallow one, it makes the steep one bounce from side to side. The path zig-zags across the valley and creeps along it.',
    { sub: 'Two fixes' },
    '**Feature scaling** puts every feature on a similar scale, for example by subtracting its average and dividing by its spread. The valley becomes round and one learning rate suits every direction.',
    '**Momentum** keeps a **velocity** v, a running memory of past steps. Each step updates `v = beta * v - lr * grad` and then `w = w + v`. With beta (a number between 0 and 1, often 0.9) the new velocity keeps most of the old one. Steps that keep pointing the same way build up speed. Steps that flip back and forth cancel. With beta = 0, momentum becomes plain gradient descent.',

    { h: 'Mini-batches' },
    'The loss is an average over every training example, so its exact gradient needs a pass over all the data. With millions of examples that is slow. **Mini-batch gradient descent** shuffles the data, cuts it into small **batches** (say 32 examples), and takes one step per batch using the gradient computed on that batch alone. One full pass through the data is an **epoch**.',
    'Each batch gradient is a noisy estimate of the true one. But a step costs a tiny fraction of a full pass, so you take far more steps in the same time, and the noise can help the weights get out of flat areas. Choosing a batch and then computing the gradient on the full data anyway gives all the cost and none of the saving.',

    { h: 'Mistakes to avoid' },
    {
      list: [
        'Adding the gradient instead of subtracting it.',
        'Raising the learning rate when the loss is bouncing. Lower it.',
        'Training on unscaled features, which forces a tiny learning rate.',
        'Reading a slowly falling loss near its starting value as "converged". Converged means levelled off at a low value.',
      ],
    },
  ],

  'maths-chain': [
    { h: 'Functions inside functions' },
    'A neural network is a long chain of small steps. Multiply by a weight, add a bias, bend the result, compare it with the target. Each step on its own is easy to differentiate. The question is how to get the slope of the loss at the end with respect to a weight at the start. The **chain rule** answers it.',
    { sub: 'The rule' },
    'Suppose y depends on u, and u depends on x. The derivative of y with respect to x is written dy/dx. The chain rule says:',
    { code: `dy/dx = dy/du × du/dx` },
    'In words: slopes along a chain multiply. If u changes 3 times as fast as x, and y changes 2 times as fast as u, then y changes 6 times as fast as x.',
    { sub: 'A worked example' },
    'Take y = (2x + 5)². It is a square wrapped around a line. Call the inside u = 2x + 5, so y = u². The outside slope dy/du is 2u = 2(2x + 5). The inside slope du/dx is 2. Multiply: dy/dx = 2(2x + 5) × 2 = 4(2x + 5). At x = 1 that is 4 × 7 = 28.',

    { h: 'Backpropagation' },
    '**Backpropagation** (backprop) is the chain rule done in a sensible order. It has two passes.',
    {
      list: [
        '**Forward pass**: compute the network from input to loss, and store every intermediate value.',
        '**Backward pass**: start at the loss, whose slope with respect to itself is 1, and walk back one step at a time.',
      ],
    },
    'At each step backward you already hold the gradient of the loss with respect to that step\'s output. Multiply it by the step\'s **local slope** (how its output changes with its input) and you get the gradient with respect to its input. Pass that further back. One backward pass gives the gradient of every weight.',
    { sub: 'One neuron by hand' },
    'Take a neuron z = w·x, then y = z + b, error e = y − t, and loss L = e², where t is the target. Use x = 3, w = 2, b = 1, t = 4.',
    'Forward: z = 6, y = 7, e = 3, L = 9.',
    'Backward, writing dL_de for "the gradient of L with respect to e":',
    {
      list: [
        'L = e² has local slope 2e, so dL_de = 6.',
        'e = y − t has local slope 1 with respect to y, so dL_dy = 6.',
        'y = z + b has local slope 1 for both z and b, so dL_dz = 6 and dL_db = 6.',
        'z = w·x has local slope x with respect to w, so dL_dw = 6 × 3 = 18.',
      ],
    },
    'The last line is the one people get wrong. Nudge w by a small amount and z moves by x times that amount, so the local slope with respect to w is x, not w. The slope with respect to x is w, and that is what you would pass back to an earlier layer.',
    {
      code: `x, w, b, t = 3.0, 2.0, 1.0, 4.0
y = w * x + b
L = (y - t) ** 2
dL_dy = 2 * (y - t)
dL_dw = dL_dy * x
dL_db = dL_dy
print(L, dL_dw, dL_db)`,
      out: '9.0 18.0 6.0',
    },
    'Both gradients are positive, so lowering w and b would lower the loss.',

    { h: 'Local slopes worth knowing' },
    {
      list: [
        '**Addition**: passes the gradient through unchanged to both inputs.',
        '**Multiplication** a·b: the gradient for a is the incoming gradient times b, and for b it is times a.',
        '**ReLU**, max(0, z): slope 1 where z is positive, 0 where it is negative. It either passes the gradient on or blocks it completely.',
        '**Sigmoid** s = 1 / (1 + e⁻ᶻ): slope s(1 − s). Its largest value is 0.25, at z = 0.',
      ],
    },
    'Every one of these is multiplied with the incoming gradient. Adding them is never right.',
    'With two layers, h = w1·x and y = w2·h, the gradient for w2 is dL_dy × h. The gradient for w1 must first pass back through w2: dL_dh = dL_dy × w2, then dL_dw1 = dL_dh × x. So early gradients contain the later weights.',

    { h: 'A value used twice' },
    'When one value feeds two later steps, changing it affects the loss along both routes. The gradients from the routes **add**. If one route sends back 4 and the other sends back −1, the total is 3.',
    'For y = x·x + x at x = 2: the product uses x twice, each side contributing x = 2, and the addition contributes 1, so the gradient is 2 + 2 + 1 = 5. That matches the derivative of x² + x, which is 2x + 1.',
    'This is why frameworks such as PyTorch **accumulate**: they add each new gradient to the one already stored. Inside one backward pass that is correct. Between training steps the stored gradients must be reset to zero (`zero_grad()`), or each update mixes in gradients from old weights and training becomes unstable with no error message.',

    { h: 'Vanishing and exploding gradients' },
    'The gradient reaching an early layer is a product of one local slope per layer. Products of many numbers behave badly. Ten slopes of 0.5 multiply to about 0.001. Thirty slopes of 1.2 multiply to about 237. Since a sigmoid slope is at most 0.25, a deep stack of sigmoids sends almost nothing back to the first layers: the **vanishing gradient** problem. Slopes a little above 1 give **exploding gradients**, where the loss jumps to `nan`.',
    'ReLU (slope exactly 1 when active), careful starting weights, normalisation layers and residual connections all aim to keep this product close to 1. **Gradient clipping**, which caps the gradient size, is a guard against explosions.',

    { h: 'Common errors' },
    {
      list: [
        'Multiplying by w where the local slope is x.',
        'Adding the local slope to the incoming gradient instead of multiplying.',
        'Forgetting to sum gradients for a value used in two places.',
        'Forgetting to zero gradients between steps.',
        'Checking hand-written backprop without a gradient check, which compares it with a central-difference estimate.',
      ],
    },
  ],

  'maths-probability': [
    { h: 'Probability as a share' },
    'A **probability** is a number from 0 to 1 that says how likely something is. 0 means it never happens, 1 means it always does, 0.25 means it happens in a quarter of cases. The thing whose probability you talk about is an **event**, and its probability is written P(event).',
    'The easiest way to think about probability is as a share of a crowd. "P(rain) = 0.3" means: out of many days like this one, about 30% are rainy. A classifier that outputs 0.8 for "spam" is saying: of many emails like this one, about 80% would be spam. When a calculation gets confusing, imagine a concrete crowd, such as 10,000 cases, and count.',

    { h: 'Combining events' },
    { sub: 'Both: multiply, if independent' },
    'Two events are **independent** when knowing that one happened tells you nothing about the other. Two separate dice rolls are independent. For independent events, the probability that both happen is the product: a 6 on one die and a 6 on another is 1/6 × 1/6 = 1/36.',
    'Independence is an assumption, and it is often false. Two models trained on similar data tend to fail on the same hard examples, so the chance that both are wrong is much higher than the product of their error rates.',
    { sub: 'Either: add, if exclusive' },
    'Two events are **mutually exclusive** when they cannot both happen, such as a die showing 2 and showing 5. For exclusive events, the probability that one or the other happens is the sum: 1/6 + 1/6 = 1/3. If an email is labelled exactly one of "work" (0.6), "personal" (0.3) or "promo" (0.1), the chance it is work or promo is 0.7. All the exclusive options together add up to 1.',

    { h: 'Expected value' },
    'The **expected value** of a number that comes out at random is its long-run average: each possible value times its probability, all added up. A game pays 10 with probability 0.2 and 0 otherwise: the expected payout is 10 × 0.2 + 0 × 0.8 = 2. You never receive exactly 2 in one game, and that is fine. The expected value need not be a value that can actually occur.',

    { h: 'Conditional probability' },
    'The **conditional probability** P(A | B), read "the probability of A given B", is the probability of A counting only the cases where B happened. You shrink the crowd to the B cases, then ask what share of them are A.',
    { sub: 'An example with counts' },
    'A shop has 200 visitors from email and 800 from search. 20 email visitors and 40 search visitors buy. P(buy | email) = 20/200 = 0.1. P(buy | search) = 40/800 = 0.05. Each divides by the size of its own group, not by all 1,000 visitors.',
    { sub: 'The order matters' },
    'P(A | B) and P(B | A) are different numbers. Most people who are professional basketball players are tall, but most tall people are not professional basketball players. Confusing the two is the most common mistake in the subject.',
    'For a detector, the two directions have names you will meet again. The **sensitivity** or **recall** is P(flagged | real): of the real cases, the share that gets caught. The **precision** is P(real | flagged): of the flagged cases, the share that is real. The **false positive rate** is P(flagged | not real): of the cases that are not real, the share flagged by mistake. Note that it applies only to the cases that are not real, not to everyone.',

    { h: "Bayes' rule" },
    "**Bayes' rule** turns one direction into the other:",
    { code: `P(A | B) = P(B | A) × P(A) / P(B)` },
    'P(A) is the **prior** or **base rate**: how common A is before you see any evidence. P(A | B) is the **posterior**: your updated belief after seeing B. You rarely need the formula if you count people instead.',
    { sub: 'Counting people' },
    'A disease affects 2% of people. A test catches 80% of cases (sensitivity) and wrongly flags 10% of healthy people (false positive rate). Someone tests positive. How likely are they to be ill?',
    {
      list: [
        'Take 10,000 people. 200 are ill and 9,800 are healthy.',
        'Of the 200 ill, 80% test positive: 160 **true positives**. The other 40 are **false negatives**.',
        'Of the 9,800 healthy, 10% test positive: 980 **false positives**. The other 8,820 are **true negatives**.',
        'Positives in total: 160 + 980 = 1,140. Of those, 160 are ill: 160 / 1,140 ≈ 0.14.',
      ],
    },
    {
      code: `prior, sens, fpr = 0.02, 0.8, 0.1
tp = prior * sens
fp = (1 - prior) * fpr
print(round(tp / (tp + fp), 3))`,
      out: '0.14',
    },
    'A positive result means only a 14% chance of illness, though the test catches 80% of cases. The healthy group is so much larger that its few false alarms outnumber the real cases. This is the **base rate effect**. Raise the base rate and the answer rises sharply, with the same test. Fraud models, spam filters and defect detectors all look for rare things, so their precision is governed by this same sum.',

    { h: 'Traps' },
    {
      list: [
        'Swapping P(A | B) and P(B | A).',
        'Applying the false positive rate to everyone instead of only the negatives.',
        'Multiplying probabilities of events that are not independent.',
        'Adding probabilities of events that can both happen.',
        'Judging a detector without the base rate of the place where it will be used.',
      ],
    },
  ],

  'maths-distributions': [
    { h: 'Describing a column of numbers' },
    'Before building any model, you look at each column of your data and ask two things: where do the values sit, and how spread out are they? A **distribution** is the full picture of how often each value turns up. A few summary numbers describe most of it.',
    'One example runs through this lesson: five delivery times in minutes, 3, 5, 7, 9 and 11.',

    { h: 'Mean, variance and standard deviation' },
    { sub: 'The mean' },
    'The **mean** is the ordinary average: add the values and divide by how many there are. (3 + 5 + 7 + 9 + 11) / 5 = 35 / 5 = 7. It is the balance point: if the values were weights on a ruler, the ruler would balance at the mean.',
    { sub: 'The variance' },
    'The **variance** measures spread. Take each value\'s distance from the mean, square it, and average the squares. Distances: −4, −2, 0, 2, 4. Squares: 16, 4, 0, 4, 16. Average: 40 / 5 = 8. Squaring makes every distance positive and weighs large distances more.',
    'This lesson divides by the number of values, which is what NumPy\'s `np.var` and `np.std` do by default. Some tools divide by one fewer; the difference matters only for small samples.',
    { sub: 'The standard deviation' },
    'The variance is in squared units (minutes squared), which is hard to picture. Its square root, the **standard deviation** (std, or the Greek letter σ), is back in minutes: √8 ≈ 2.83. Read it as the typical distance of a value from the mean.',
    {
      code: `import numpy as np

t = np.array([3, 5, 7, 9, 11])
print(t.mean(), t.var(), round(float(t.std()), 2))`,
      out: '7.0 8.0 2.83',
    },
    { sub: 'Yes/no outcomes' },
    'A yes/no outcome can be stored as 1 for yes and 0 for no. If yes has probability p, the mean is p and the variance is p(1 − p). It is largest at p = 0.5 (0.25) and shrinks to 0 as the outcome becomes certain. With p = 0.1 it is 0.1 × 0.9 = 0.09.',

    { h: 'The normal distribution' },
    'Draw a histogram of many heights, measurement errors or exam scores and you usually see a bell shape: most values near the middle, fewer and fewer further out, symmetric on both sides. This is the **normal distribution**. It is fixed by two numbers, its mean (the centre) and its standard deviation (the width). It turns up so often because a sum or average of many small, separate effects tends towards this shape.',
    { sub: 'The 68 / 95 / 99.7 rule' },
    {
      list: [
        'About 68% of values lie within 1 standard deviation of the mean.',
        'About 95% lie within 2.',
        'About 99.7% lie within 3.',
      ],
    },
    'Because the curve is symmetric, what lies outside splits evenly between the two sides. With mean 50 and std 5, 95% lie between 40 and 60, so 5% lie outside, and about 2.5% lie above 60.',

    { h: 'z-scores and standardising' },
    'A **z-score** says how many standard deviations a value sits from the mean: `z = (x − mean) / std`. With mean 50 and std 5, the value 57.5 has z = 7.5 / 5 = 1.5. A z of 0 is exactly average, negative is below it.',
    'Turning every value in a column into its z-score is **standardising**. Afterwards the column has mean 0 and standard deviation 1, whatever units it started in. Gradient descent and models based on distances work much better when columns are on the same scale.',
    'In practice the mean and std are computed on the training data only, and those same two numbers are used to transform the test data and any new data later. Scaling the test set by its own statistics gives it a different transformation from the one the model learnt on.',

    { h: 'Long tails and the median' },
    'Not every column is a bell. Incomes, house prices and website visits have a **long tail**: most values are modest and a few are enormous. Such a distribution is called **skewed**.',
    'The mean adds everything up, so one huge value drags it. The **median** is the middle value once the list is sorted (or the average of the two middle values when the count is even). It ignores how far out the extremes are. For 2, 3, 4, 5 and 1,000 the mean is 202.8 and the median is 4. For skewed columns the median describes a typical case better.',
    'Taking the **logarithm** of a long-tailed column often makes it close to a bell. On a log scale, 1,000 to 10,000 is the same step as 10,000 to 100,000, so the few huge values stop dominating. Standardising alone does not fix skew: it shifts and rescales the column but keeps its shape.',

    { h: 'Correlation' },
    'Two columns can move together. **Correlation** is a number from −1 to 1 that measures how closely they follow a straight line: near 1, one rises as the other rises; near −1, one falls as the other rises; near 0, no straight-line link.',
    'Correlation says nothing about cause. Umbrella sales and car accidents rise together, because rain drives both. A hidden third factor like this is a **confounder**. A model will happily use such a link, which can break as soon as conditions change.',

    { h: 'Mistakes to watch for' },
    {
      list: [
        'Reporting only the mean of a skewed column.',
        'Forgetting the square root when going from variance to standard deviation.',
        'Scaling test data with its own statistics.',
        'Reading correlation as cause.',
      ],
    },
  ],

  'maths-sampling': [
    { h: 'Every metric is measured on a sample' },
    'A test accuracy is computed on one particular test set. A conversion rate comes from one particular week of users. Each of these is a **sample**: a limited set of cases drawn from a much larger world you care about. Draw a different sample and you get a different number. The useful question is how different, because that decides whether a gap between two numbers means anything.',

    { h: 'How much an average wobbles' },
    'Suppose single response times have a standard deviation σ of 20 ms (recall: the standard deviation is the typical distance of a value from the mean). You measure 25 of them and take the average. If you repeated this with another 25, and another, the averages would vary too, but much less than single values, because high and low values partly cancel.',
    { sub: 'The standard error' },
    'The standard deviation of an average is called its **standard error** (SE). For an average of n values:',
    { code: `SE = σ / √n` },
    'Here 20 / √25 = 20 / 5 = 4 ms. With 100 values it is 20 / 10 = 2 ms. Note the square root: four times the data halves the standard error, and a hundred times the data cuts it to a tenth. Precision gets expensive quickly.',
    {
      code: `import math

sigma = 20
for n in (25, 100, 400):
    print(n, sigma / math.sqrt(n))`,
      out: `25 4.0
100 2.0
400 1.0`,
    },
    { sub: 'The central limit theorem' },
    'Something else happens as n grows. Whatever shape the single values have, even lopsided or with long tails, the averages of large enough samples form a bell curve (a normal distribution) around the true mean. This is the **central limit theorem**. It is why the bell curve rules of the previous lesson apply to averages and accuracies.',

    { h: 'Proportions and accuracy' },
    'An accuracy is a **proportion**: the share of answers that were right. Each answer is a yes/no outcome with variance p(1 − p), where p is the accuracy, so the standard error of a proportion measured on n examples is:',
    { code: `SE = √(p(1 − p) / n)` },
    'The n goes inside the square root. Put it outside and the error comes out far too small, and every difference looks real.',
    { sub: 'A worked example' },
    'A model gets 160 right out of 200: p = 0.8. Then p(1 − p) = 0.16, divided by 200 is 0.0008, and the square root is about 0.028. The standard error is about 2.8 percentage points.',

    { h: 'Confidence intervals' },
    'In a bell curve, 95% of values lie within about 2 standard deviations of the centre (more exactly, 1.96). So a rough **95% confidence interval** is the measured value plus or minus 1.96 standard errors. For the model above: 0.8 ± 1.96 × 0.028, about 0.745 to 0.855. The honest report is "80%, give or take about 5.5 points".',
    'The same works for any average. Ten measurements with mean 50 and standard deviation 6 have standard error 6 / √10 ≈ 1.9, so the interval is roughly 50 ± 3.7.',
    { sub: 'Comparing two models' },
    'Before you believe that one model beats another, compare the gap with the noise. If each score has a standard error of 3 points, a gap of 1 point is well inside the noise and tells you nothing. You need a much larger test set, or a comparison on the same examples that looks at where the two models disagree.',

    { h: 'p-values' },
    'A **p-value** answers one specific question: if there were really no difference, how often would you see a gap at least as large as the one you measured, purely by chance? A p-value of 0.02 means "under no real difference, a gap this big would appear about 2% of the time". A common rule of thumb calls results with p below 0.05 **significant**.',
    'It is not the probability that the result is real, nor the probability that it is a fluke, and it says nothing about how large the effect is.',
    { sub: 'Many tries' },
    'If you test many ideas that in truth do nothing, about 5% will pass p < 0.05 by luck. To find the chance that at least one of k independent useless tests passes, work out the chance that none passes, 0.95 multiplied by itself k times, and subtract from 1. With 10 tests: 1 − 0.95¹⁰ ≈ 0.40.',
    'The same thing happens when you try many settings and keep the best on one validation set: the winner looks better than it is. Confirm a winner on fresh data.',

    { h: 'Pitfalls' },
    {
      list: [
        'Reporting a metric with no interval.',
        'Dividing by n instead of √n.',
        'Declaring a winner from a gap smaller than the standard error.',
        'Reading a p-value as the probability the result is true.',
        'Testing many ideas and trusting the one that passed.',
      ],
    },
  ],

  'maths-entropy': [
    { h: 'Scoring a probability' },
    'A classifier does not only name a class: it gives a probability for each one. "Cat 0.7, dog 0.2, fox 0.1." To train it, you need one number that says how good those probabilities were, given the true answer.',
    'The natural score is the **likelihood**: the probability the model gave to what actually happened. If the picture was a cat, this model scores 0.7. A model that said 0.95 for cat did better, and one that said 0.05 did badly.',
    { sub: 'Maximum likelihood' },
    'Fitting a model by **maximum likelihood** means choosing its settings so that the observed data gets the highest probability. A small example: a coin lands heads 3 times in 4 flips. If P(heads) is q, the probability of that outcome grows with q³(1 − q), which is largest at q = 0.75. The best estimate is the observed frequency, 3/4. Training a classifier does the same thing with a far more flexible model.',

    { h: 'Logarithms' },
    'The **natural logarithm** ln(x) (written `math.log` in Python) answers: e to what power gives x? Here e ≈ 2.718 is a fixed constant, and **exp**(x) means e raised to the power x. Three facts are all you need.',
    {
      list: [
        'ln(1) = 0.',
        'For x between 0 and 1, ln(x) is negative, and it heads to minus infinity as x approaches 0. ln(0.5) ≈ −0.69, ln(0.1) ≈ −2.30, ln(0.001) ≈ −6.91.',
        'ln(a × b) = ln(a) + ln(b). The log of a product is the sum of the logs.',
      ],
    },

    { h: 'From likelihood to cross-entropy' },
    { sub: 'Products underflow' },
    'Over a dataset, the likelihood is the product of the probabilities for every example. Multiply a thousand numbers below 1 and the result is smaller than the smallest number a float can hold (about 1e-308). It becomes exactly 0 and all information is lost. Taking the log turns the product into a sum of ordinary-sized numbers.',
    { sub: 'Flip the sign' },
    'Logs of probabilities are negative, and training wants a loss to make small. So flip the sign. The loss for one example is:',
    { code: `loss = −ln(probability given to the true class)` },
    'This is the **negative log-likelihood**, also called the **cross-entropy loss**. Minimising it is the same as maximising the likelihood. Forget the minus sign and minimising the "loss" teaches the model to be wrong.',
    { sub: 'What it punishes' },
    'A probability of 1 for the truth costs 0. A probability of 0.8 costs 0.22. A probability of 0.1 costs 2.30. A probability of 0.001 costs 6.91. The cost grows without limit as the probability heads to 0. A model that is confident and wrong pays far more than one that is unsure: two answers at 0.5 cost 1.39 together, while one at 0.999 and one at 0.001 cost about 6.91.',
    'A useful number to remember: a model that gives every one of K classes the same probability 1/K has loss −ln(1/K) = ln(K). For 4 classes that is ln(4) ≈ 1.39. A new, untrained model should start near this value.',

    { h: 'Entropy and its floor' },
    'Some outcomes cannot be predicted, whatever the model. If, given the inputs, a label really is a coin flip, the best possible probability is 0.5 and the best possible loss is 0.69. That irreducible loss is the **entropy** of the true distribution: the cross-entropy of the truth scored against itself. No model can go below it.',
    'The extra loss a model pays above the entropy, because its probabilities differ from the true ones, is the **KL divergence** (Kullback–Leibler). It is 0 only when the model\'s probabilities equal the true ones. So a loss that stops falling above zero is not always a sign of a weak model: the labels may not be fully determined by the features.',

    { h: 'Softmax' },
    'A network\'s last layer produces arbitrary numbers, one per class, called **logits**. They can be negative or larger than 1. **Softmax** turns them into probabilities: take exp of each, then divide each by their total. Everything becomes positive, larger logits get larger shares, and the shares add up to 1.',
    {
      code: `import numpy as np

z = np.array([1.0, 3.0, 0.0])
p = np.exp(z) / np.exp(z).sum()
print(p.round(3), round(float(-np.log(p[1])), 3))`,
      out: '[0.114 0.844 0.042] 0.17',
    },
    'With the true class at index 1, the loss is −ln(0.844) ≈ 0.17.',
    { sub: 'Only differences matter' },
    'Add the same number c to every logit and every exp is multiplied by the same factor e^c, which cancels in the division. The probabilities do not change. That gives a free safety trick: subtract the largest logit before exponentiating. Then the largest exp is exp(0) = 1, and nothing can overflow, even for logits like 900, where exp on its own would fail.',
    { sub: 'Working in logs throughout' },
    'If the true class has a tiny probability, it can underflow to 0, and ln(0) fails. The fix is to never form that probability: ln(softmax(z)[k]) = z[k] − ln(Σ exp(z)), and ln(Σ exp(z)) = top + ln(Σ exp(z − top)), where top is the largest logit and Σ means "add up over all classes". This is why library loss functions take logits, not probabilities.',

    { h: 'Mistakes to avoid' },
    {
      list: [
        'Dropping the minus sign in the loss.',
        'Multiplying probabilities instead of adding logs.',
        'Exponentiating large logits without subtracting the maximum.',
        'Picking the true-class probabilities with `probs[:, labels]`, which gives an (n, n) array. Use `probs[np.arange(n), labels]` to take one entry per row.',
      ],
    },
  ],

  'maths-eigen': [
    { h: 'Directions a matrix does not turn' },
    'A matrix is a machine that takes a vector and returns another (the matrices lesson). Most vectors come out pointing in a new direction. A few special ones come out along the same line they went in on: longer, shorter, or flipped round, but not turned. Such a vector is an **eigenvector** of the matrix. The factor it is scaled by is its **eigenvalue**, written λ (the Greek letter lambda):',
    { code: `A @ v = λ v` },
    { sub: 'Checking one by hand' },
    'Take A with rows (5, 2) and (2, 2). Feed in v = (2, 1): first row 5×2 + 2×1 = 12, second row 2×2 + 2×1 = 6. The result (12, 6) is 6 × (2, 1). Same direction, six times as long, so (2, 1) is an eigenvector with eigenvalue 6. Feed in (1, −2): 5 − 4 = 1 and 2 − 4 = −2, giving (1, −2) unchanged, so eigenvalue 1. (1, 0) comes out as (5, 2), a new direction, so it is not one.',
    'A negative eigenvalue means the vector is flipped.',
    { sub: 'Not every matrix has them' },
    'A rotation by 45° turns every arrow, so no direction stays on its own line. It has no real eigenvectors. Matrices that are **symmetric** (entry [i, j] equals entry [j, i], so the grid is a mirror image across its diagonal) always have a full set, at right angles to each other, with real eigenvalues.',

    { h: 'The covariance matrix' },
    'The symmetric matrix that matters most in data work is the **covariance matrix**. Take a dataset X of shape (n, d). First **centre** it: subtract each column\'s mean, so every column averages 0. Call the result Xc. Then:',
    { code: `C = Xc.T @ Xc / n` },
    'Here `.T` is the **transpose** (rows and columns swapped). C has shape (d, d), one row and one column per feature. Its diagonal holds the variance of each feature (the average squared distance from the mean). Each other entry is the **covariance** of two features: the average of their centred values multiplied together. Positive means they tend to rise together.',
    { sub: 'A small example' },
    'Three rows: (1, 1), (2, 3), (3, 5). Column means 2 and 3. Centred rows: (−1, −2), (0, 0), (1, 2). Variance of feature 1: (1 + 0 + 1) / 3 ≈ 0.67. Variance of feature 2: (4 + 0 + 4) / 3 ≈ 2.67. Covariance: ((−1)(−2) + 0 + 1×2) / 3 ≈ 1.33.',
    {
      code: `import numpy as np

X = np.array([[1.0, 1.0], [2.0, 3.0], [3.0, 5.0]])
Xc = X - X.mean(axis=0)
C = Xc.T @ Xc / len(X)
print(C.round(2).tolist())
print(np.linalg.eigh(C)[0].round(2).tolist())`,
      out: `[[0.67, 1.33], [1.33, 2.67]]
[0.0, 3.33]`,
    },
    'The second feature is twice the first plus a constant, so all the spread lies along one direction and the other eigenvalue is 0. Covariance eigenvalues are never negative.',

    { h: 'Principal component analysis' },
    'The eigenvector of C with the largest eigenvalue is the direction in which the data spreads out most, and the eigenvalue is the variance along it. The next eigenvector is the direction of greatest remaining spread at right angles to the first, and so on. These directions are the **principal components**.',
    '**PCA** (principal component analysis) keeps the top k of them and describes each row by its k coordinates along them, `Xc @ top`, where top is the (d, k) matrix of chosen eigenvectors.',
    { sub: 'How much is kept' },
    'Each eigenvalue is the variance along its direction, so the share kept is the sum of the kept eigenvalues divided by the sum of all of them. With eigenvalues 8, 1.5 and 0.5, keeping the top one keeps 8 / 10 = 80%. This **explained variance** is how you choose k.',
    { sub: 'Two traps' },
    '`np.linalg.eigh` (the function for symmetric matrices) returns eigenvalues in **ascending** order, smallest first, with the matching eigenvectors as the columns of its second result. The top directions are the last columns: reverse them with `vecs[:, ::-1]` before taking k. Taking the first k columns runs without error and keeps the least spread.',
    'PCA follows variance, and variance depends on units. A column in large units, such as salary in pounds, has a huge variance next to one in small units, such as years, and takes over the first component regardless of importance. Standardise the columns first (mean 0, standard deviation 1) unless they share comparable units.',

    { h: 'The singular value decomposition' },
    'Eigenvectors need a square matrix. The **singular value decomposition** (SVD) works for a matrix of any shape. It writes A as three factors, `A = U @ diag(s) @ Vt`, where s holds the **singular values**: how much A stretches along each of its main directions. They are never negative and NumPy returns them largest first, the opposite order to `eigh`. A matrix with rows (4, 0) and (0, 1) has singular values 4 and 1.',
    { sub: 'Low-rank approximation' },
    'The **rank** of a matrix is the number of truly independent directions it uses, which is the number of non-zero singular values. Keep only the k largest singular values, with the first k columns of U and first k rows of Vt, and multiply back: the result is the closest rank-k matrix to A. An (m, n) matrix stored this way needs about k × (m + n) numbers instead of m × n.',
    'LoRA, a common way to fine-tune large language models, uses this idea. Instead of a full (m, n) weight matrix, it trains two thin matrices B of shape (m, r) and A of shape (r, n), whose product has rank at most r. The trained count is m × r + r × n.',

    { h: 'The condition number' },
    'The ratio of the largest to the smallest singular value is the **condition number**. For the curvature of a loss surface, a large one means the long, narrow valley of the gradient-descent lesson: the steep direction caps the learning rate, and the shallow one then needs a huge number of steps. A large condition number also makes least-squares solutions swing with tiny changes in the data. Standardising features and dropping near-duplicate columns help.',

    { h: 'Mistakes to avoid' },
    {
      list: [
        'Forgetting to centre the data before computing the covariance.',
        'Taking the first columns from `eigh` as the top components.',
        'Running PCA on columns with very different units.',
        'Expecting every matrix to have real eigenvectors.',
      ],
    },
  ],

  'maths-lab': [
    { h: 'A complete model in a few lines' },
    '**Linear regression** predicts a number from features: a house price from its rooms and area, say. It is the smallest model with every part of a real one: a prediction, a loss, gradients, an update and a training loop. This lab ties together the earlier lessons of the module by building it with NumPy alone. The steps below use a tiny example with two rows and one feature, X = [[1], [3]] and targets y = (3, 7), which were made from w = 2 and b = 1.',

    { h: 'Prediction and loss' },
    { sub: 'The model' },
    'Each prediction is the dot product of a row with the weight vector w, plus a single number b, the bias. For a whole dataset X of shape (n, d), that is `X @ w + b`: (n, d) @ (d,) gives (n,), and the bias broadcasts to every row. With all weights zero, every prediction is b.',
    { sub: 'The mean squared error' },
    'The loss is the **mean squared error** (MSE): subtract the target from each prediction, square, and take the mean. Squaring makes errors of +1 and −1 cost the same and makes large errors count much more. Using the mean, not the sum, keeps the loss the same size whatever the number of rows. Perfect predictions give 0.',

    { h: 'The gradients' },
    'Write `err = pred − y`, one error per row. The loss is the mean of err². By the chain rule, the slope of err² is 2·err, and each weight j reaches the error of a row through that row\'s value X[row, j]. Adding over rows and dividing by n gives:',
    { code: `dL_dw = 2 * X.T @ err / n     # shape (d,), like w
dL_db = 2 * err.mean()         # one number` },
    '`X.T @ err` is (d, n) @ (n,), which is (d,): for each feature, the sum of its values times the errors. The bias reaches every row with slope 1, so its gradient is twice the mean error.',
    { sub: 'By hand' },
    'Start at w = 0, b = 0 on the tiny example. Predictions (0, 0), errors (−3, −7), loss (9 + 49) / 2 = 29. dL_dw = 2 × (1×(−3) + 3×(−7)) / 2 = −24. dL_db = 2 × (−5) = −10. Both negative, so both should go up.',

    { h: 'Checking the gradients' },
    'A gradient formula with a lost factor of 2 or a wrong axis still runs, and training still moves, so test it before you train. A **gradient check** estimates each slope numerically: copy w, nudge one entry up by a small h (around 1e-5), nudge it down by h, evaluate the loss both times, and divide the difference by 2h. Do this for each weight in turn to build a vector shaped like w, and compare it with the formula. Nudge a copy, so the original w is left unchanged.',
    'It costs two loss evaluations per weight, far too slow for training but fine for a test at a few random points.',

    { h: 'The training loop' },
    'Training repeats one update for every parameter: `w = w − lr * dL_dw` and `b = b − lr * dL_db`. Each parameter moves against its own gradient. Updating b with the gradient of w is a quiet bug: NumPy subtracts a vector from a number without complaint, and b becomes an array.',
    {
      code: `import numpy as np

X = np.array([[1.0], [3.0]])
y = np.array([3.0, 7.0])
w, b = np.zeros(1), 0.0
for _ in range(2000):
    err = X @ w + b - y
    w = w - 0.05 * 2 * X.T @ err / len(y)
    b = b - 0.05 * 2 * err.mean()
print(w.round(3), round(b, 3))`,
      out: '[2.] 1.0',
    },
    'The loop recovers the weights the data was made from. Testing a training loop on data with a known answer, before using real data, is a habit worth keeping.',

    { h: 'Scaling the features' },
    'Suppose one feature is a count of rooms (1 to 5) and another is floor area in square feet (hundreds to thousands). The loss is far steeper along the area weight, because its values are so large. As the gradient-descent lesson showed, the steepest direction caps the learning rate. A rate that suits the rooms weight makes the area weight overshoot by more each step until the loss becomes infinite or `nan`. A rate small enough for the area weight barely moves anything else.',
    'The fix is to **standardise** each column: subtract its mean and divide by its standard deviation, computed along axis 0, so each column has mean 0 and standard deviation 1. Keep the means and standard deviations, and return them from your function: every new row you predict on later must be transformed with those same numbers.',

    { h: 'The exact answer' },
    'Linear regression is unusual: its best weights can be found directly. Add a column of ones to X, so the bias becomes one more weight, with `A = np.column_stack([X, np.ones(n)])`. Setting the gradient to zero gives the equation `AᵀA θ = Aᵀy`, where θ (theta) holds all the weights followed by the bias. `np.linalg.solve(M, v)` returns the θ for which `M @ θ = v`, so `theta = np.linalg.solve(A.T @ A, A.T @ y)`. Then `theta[:-1]` is w and `theta[-1]` is b. This is the **least-squares solution**.',
    { sub: 'Using it as a reference' },
    'Gradient descent should land on the same numbers, even on noisy data, so each method tests the other. The exact route fails when AᵀA is singular, for example when one column is a combination of others, and it does not exist for models that are not linear. That is why the loop is the part that carries on into neural networks.',
  ],
}
