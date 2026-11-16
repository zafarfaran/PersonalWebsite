import type { Module } from '../types'

export const maths: Module = {
  id: 'maths',
  title: 'Maths for machine learning',
  summary: 'The linear algebra, calculus and probability that the rest of the course is built on, each piece shown as a picture and as code.',
  lessons: [
    {
      id: 'maths-vectors',
      title: 'Vectors and the dot product',
      summary: 'A list of numbers, an arrow, and the one operation that measures how alike two of them are.',
      widget: 'maths-vectors',
      text: [
        'In machine learning everything becomes a vector: a row of a table, the pixels of an image, the meaning of a word. A vector is a list of numbers. With two numbers you can draw it as an arrow, and the picture carries over to a thousand numbers even though you cannot draw it.',
        'The **dot product** of two vectors multiplies them position by position and adds up the results: `a·b = a₁b₁ + a₂b₂ + …`. It is the most used operation in the field. A linear model is a dot product of weights and features. A neuron is a dot product followed by a bend. Attention is a table of dot products.',
        'Geometrically, `a·b = |a| |b| cos θ`: the two lengths times the cosine of the angle between the arrows. So it is large when the arrows are long and point the same way, zero when they are at right angles, and negative when they point apart.',
        'The **length** (or norm) of a vector is `√(a·a)`. Divide the dot product by both lengths and only the cosine is left. That is **cosine similarity**: 1 for the same direction, 0 for unrelated, −1 for opposite, whatever the lengths. It is how embeddings are compared.',
      ],
      rules: [
        'Dot product: multiply matching entries, add them up. The result is one number.',
        'Positive: same direction. Zero: at right angles. Negative: opposite.',
        'Length is `√(a·a)`. Dividing a vector by its length gives a unit vector.',
        'Cosine similarity = dot product ÷ both lengths. It ignores how long the vectors are.',
      ],
      questions: [
        { kind: 'number', id: 'maths-vectors-1', ask: 'What is the dot product of (2, 3) and (4, −1)?', answer: 5, check: 'np.dot([2, 3], [4, -1])', why: '2×4 + 3×(−1) = 8 − 3 = 5.' },
        {
          kind: 'choice',
          id: 'maths-vectors-2',
          ask: 'Two vectors have a dot product of exactly 0. Neither is the zero vector. What does that tell you?',
          options: ['They point in the same direction', 'They are at right angles to each other', 'They have the same length', 'One is a multiple of the other'],
          answer: 1,
          why: 'The dot product is |a| |b| cos θ. With both lengths non-zero it can only be zero when cos θ = 0, which is at 90°. Such vectors are called orthogonal.',
        },
        {
          kind: 'output',
          id: 'maths-vectors-3',
          ask: 'What does this print?',
          code: `import numpy as np

a = np.array([3, 4])
print(np.linalg.norm(a))`,
          answer: '5.0',
          why: 'The norm is the length: √(3² + 4²) = √25 = 5. NumPy returns a float, so it prints 5.0.',
        },
        {
          kind: 'number',
          id: 'maths-vectors-4',
          ask: 'What is the cosine similarity of (1, 0) and (1, 1)? Give two decimals.',
          answer: 0.7071,
          tol: 0.01,
          check: 'np.dot([1, 0], [1, 1]) / (np.linalg.norm([1, 0]) * np.linalg.norm([1, 1]))',
          hint: 'Dot product ÷ (length × length). The length of (1, 1) is √2.',
          why: 'The dot product is 1, the lengths are 1 and √2, so the cosine is 1/√2 ≈ 0.71. The arrows are 45° apart.',
        },
        {
          kind: 'choice',
          id: 'maths-vectors-5',
          ask: 'You compare documents by their embedding vectors. One document is simply twice as long as another on the same topic, and its vector comes out about twice as long. Which measure says the two are alike?',
          options: ['The dot product, because it grows with length', 'Cosine similarity, because it ignores length', 'The difference of the two lengths', 'Neither can'],
          answer: 1,
          why: 'Both vectors point the same way, so the cosine is close to 1 whatever their lengths. The raw dot product would rank the long document as "more similar" to everything.',
        },
        {
          kind: 'bug',
          id: 'maths-vectors-6',
          ask: 'This should scale a vector to length 1. It does not.',
          code: `def normalize(v):
    length = sum(x * x for x in v)
    return [x / length for x in v]`,
          line: 2,
          fix: '    length = sum(x * x for x in v) ** 0.5',
          why: 'The sum of squares is the length squared. Without the square root, (3, 4) is divided by 25 instead of 5.',
        },
        {
          kind: 'write',
          id: 'maths-vectors-7',
          ask: 'Write cosine similarity for two lists of numbers, without NumPy.',
          starter: `def cosine_similarity(a, b):
    # dot product divided by both lengths
    pass`,
          solution: `def cosine_similarity(a, b):
    dot = sum(x * y for x, y in zip(a, b))
    length_a = sum(x * x for x in a) ** 0.5
    length_b = sum(y * y for y in b) ** 0.5
    return dot / (length_a * length_b)`,
          tests: `assert abs(cosine_similarity([1, 0], [1, 0]) - 1) < 1e-9, "the same vector should give 1"
assert abs(cosine_similarity([1, 0], [0, 5])) < 1e-9, "right angles should give 0"
assert abs(cosine_similarity([1, 2, 3], [-2, -4, -6]) + 1) < 1e-9, "opposite directions should give -1"
assert abs(cosine_similarity([1, 0], [1, 1]) - 0.5 ** 0.5) < 1e-9, "45 degrees should give 0.7071"`,
          why: 'Three sums: one for the dot product and one for each length. Scaling either vector changes the top and the bottom by the same factor, so the result does not move.',
        },
        {
          kind: 'output',
          id: 'maths-vectors-8',
          ask: 'What does this print?',
          code: `import numpy as np

a = np.array([1, 2])
b = np.array([-2, 1])
c = np.array([-1, -2])
print(a @ b, a @ c)`,
          answer: '0 -5',
          hint: 'For two vectors, `@` is the dot product.',
          why: 'a·b = −2 + 2 = 0: b is a turned a quarter of the way round, at right angles. a·c = −1 − 4 = −5: c is a flipped, so the dot product is negative, and equal to minus the squared length of a.',
        },
        {
          kind: 'choice',
          id: 'maths-vectors-9',
          ask: 'In the figure, put a at (2, 1) and b at (4, 2), so both point the same way. Then shrink b to (1, 0.5). What happens to the readouts?',
          options: [
            'The dot product and cos θ both fall to a quarter',
            'The dot product falls from 10 to 2.5 and cos θ stays at 1',
            'The dot product stays at 10 and cos θ falls',
            'Neither changes',
          ],
          answer: 1,
          why: 'The dot product is |a| |b| cos θ, so it scales with the length of b. The cosine has the lengths divided out, so only the angle moves it. A retrieval system that ranks by raw dot product is ranking partly by vector length.',
        },
        {
          kind: 'number',
          id: 'maths-vectors-10',
          ask: 'You divide the vector (6, 8) by its length to make a unit vector. What is its first entry?',
          answer: 0.6,
          check: '(np.array([6, 8]) / np.linalg.norm([6, 8]))[0]',
          why: 'The length is √(36 + 64) = 10, so the unit vector is (0.6, 0.8). Its own length is √(0.36 + 0.64) = 1. For unit vectors the dot product and the cosine similarity are the same number, which is why embeddings are often stored already normalised.',
        },
        {
          kind: 'bug',
          id: 'maths-vectors-11',
          ask: 'A linear model: the prediction is the dot product of the weights and the features, plus a bias. It only seems to use the last feature.',
          code: `def predict(weights, features, bias):
    total = 0.0
    for w, x in zip(weights, features):
        total = w * x
    return total + bias`,
          line: 4,
          fix: '        total += w * x',
          why: 'A dot product adds up all the products. Assigning instead of adding throws away every term but the last, so the model ignores all the other features.',
        },
        {
          kind: 'write',
          id: 'maths-vectors-12',
          numpy: true,
          ask: 'Search by embedding: return the row numbers of the `k` documents whose vectors have the highest cosine similarity to the query, best first.',
          starter: `import numpy as np

def top_k(query, docs, k):
    # query: (d,)   docs: (n, d), one embedding per row
    # returns the row numbers of the k most similar docs, best first
    pass`,
          solution: `import numpy as np

def top_k(query, docs, k):
    scores = docs @ query / (np.linalg.norm(docs, axis=1) * np.linalg.norm(query))
    return np.argsort(-scores)[:k]`,
          tests: `docs = np.array([[1.0, 0.0], [10.0, 10.0], [0.0, 2.0], [-1.0, 0.0], [3.0, 1.0]])
out = top_k(np.array([1.0, 0.0]), docs, 2)
assert out is not None, "the function returns nothing yet"
assert len(out) == 2, "return exactly k row numbers"
assert list(out) == [0, 4], f"the rows closest in direction to (1, 0) are 0 then 4, got {list(out)}: a long vector should not win on length alone"
assert list(top_k(np.array([0.0, 1.0]), docs, 3)) == [2, 1, 4], "for the query (0, 1) the order should be rows 2, 1, 4"
assert list(top_k(np.array([1.0, 1.0]), docs, 1)) == [1], "for the query (1, 1) the best row is 1"`,
          hint: '`docs @ query` gives every dot product at once. `np.linalg.norm(docs, axis=1)` gives the length of every row. `np.argsort` sorts ascending.',
          why: 'One matrix product gives all the dot products, and dividing by the lengths turns them into cosines. Sorting the negated scores puts the best first. This is the core of a vector search, before any index makes it fast.',
        },
      ],
    },
    {
      id: 'maths-matrices',
      title: 'Matrices: machines that move vectors',
      summary: 'What a matrix does to a vector, how shapes combine, and why a layer is one line of code.',
      widget: 'maths-matrix',
      text: [
        'A matrix is a grid of numbers, and a dataset is one: a row for every example, a column for every feature. But a matrix is also a machine. Give it a vector and it returns another: `A @ v`. Each entry of the result is the dot product of one row of `A` with `v`.',
        'There is a second way to see the same product, and it is the more useful one: `A @ v` is a mix of the **columns** of `A`, with the entries of `v` as the amounts. So the columns say where the unit arrows land, and that decides where everything lands.',
        'Multiplying two matrices chains two machines. The shapes have to fit: `(m, n) @ (n, p)` gives `(m, p)`. The inner numbers must match and they disappear. This one rule finds most shape bugs before you run anything. The order matters: `A @ B` is usually not `B @ A`.',
        'A layer of a neural network is exactly this. A batch `X` of shape `(batch, features)` times weights `W` of shape `(features, outputs)`, plus a bias: `X @ W + b`, giving `(batch, outputs)`.',
        'The **determinant** says how much a square matrix stretches area. When it is zero the matrix squashes space flat, different inputs land on the same output, and there is no way back: the matrix has no inverse. In data terms, one column is a combination of others.',
      ],
      rules: [
        '`(m, n) @ (n, p)` → `(m, p)`. The inner sizes must match.',
        '`A @ v` mixes the columns of `A`, using the entries of `v` as amounts.',
        'A layer is `X @ W + b`, with `X` as `(batch, features)` and `W` as `(features, outputs)`.',
        'Order matters: `A @ B` is not `B @ A` in general.',
        'Determinant zero means the matrix flattens space and cannot be inverted.',
      ],
      questions: [
        {
          kind: 'choice',
          id: 'maths-matrices-1',
          ask: '`A` has shape (3, 4) and `B` has shape (4, 2). What is the shape of `A @ B`?',
          options: ['(3, 2)', '(4, 4)', '(2, 3)', 'It is an error'],
          answer: 0,
          why: 'The inner sizes (4 and 4) match and vanish. The outer sizes stay: 3 rows from A, 2 columns from B.',
        },
        {
          kind: 'output',
          id: 'maths-matrices-2',
          ask: 'What does this print?',
          code: `import numpy as np

A = np.array([[1, 2],
              [3, 4]])
v = np.array([1, 1])
print(A @ v)`,
          answer: '[3 7]',
          why: 'Each entry is a row of A dotted with v: 1+2 = 3 and 3+4 = 7. Seen the other way, it is one of each column added together.',
        },
        { kind: 'number', id: 'maths-matrices-3', ask: 'What is the determinant of [[2, 1], [4, 2]]?', answer: 0, check: 'np.linalg.det(np.array([[2, 1], [4, 2]]))', why: 'ad − bc = 2×2 − 1×4 = 0. The second row is twice the first, so the matrix squashes the plane onto a line.' },
        {
          kind: 'choice',
          id: 'maths-matrices-4',
          ask: 'A batch of 32 examples with 10 features each goes through a layer with 5 outputs, written `X @ W + b`. What shape is `W`?',
          options: ['(32, 5)', '(5, 10)', '(10, 5)', '(32, 10)'],
          answer: 2,
          why: 'X is (32, 10). For X @ W to work the inner sizes must match, so W starts with 10, and the result should be (32, 5), so W is (10, 5). The batch size never appears in the weights.',
        },
        {
          kind: 'output',
          id: 'maths-matrices-5',
          ask: 'What does this print?',
          code: `import numpy as np

A = np.array([[1, 2],
              [3, 4]])
B = np.array([[0, 1],
              [1, 0]])
print(A @ B)`,
          answer: '[[2 1]\n [4 3]]',
          hint: 'B swaps things. Multiplying on the right acts on the columns of A.',
          why: 'B is a swap. On the right it swaps the columns of A. On the left (B @ A) it would swap the rows instead: the order matters.',
        },
        {
          kind: 'bug',
          id: 'maths-matrices-6',
          ask: 'This layer crashes with a shape error whenever the batch size differs from the number of features.',
          code: `def layer(X, W, b):
    # X: (batch, features)   W: (features, outputs)   b: (outputs,)
    return W @ X + b`,
          line: 3,
          fix: '    return X @ W + b',
          why: '(features, outputs) @ (batch, features) does not fit: the inner sizes are outputs and batch. X @ W is (batch, features) @ (features, outputs) = (batch, outputs).',
        },
        {
          kind: 'choice',
          id: 'maths-matrices-7',
          ask: 'A feature matrix has a column for temperature in °C and another for the same temperature in °F. Why does that hurt ordinary linear regression?',
          options: [
            'The columns have different units',
            'One column is a fixed combination of the other, so the matrix the solution needs to invert is singular',
            'Regression cannot use temperatures',
            'It doubles the training time',
          ],
          answer: 1,
          why: 'With an intercept in the model, °F is exactly 1.8 × °C + 32. The columns carry no separate information, the matrix XᵀX has determinant zero, and infinitely many weight settings fit equally well.',
        },
        {
          kind: 'number',
          id: 'maths-matrices-8',
          ask: 'The columns of `A` are (1, 0) and (3, 2). What is the first entry of `A @ v` for v = (2, 1)?',
          answer: 5,
          check: '(np.array([[1, 3], [0, 2]]) @ np.array([2, 1]))[0]',
          hint: 'Take 2 of the first column and 1 of the second.',
          why: '`A @ v` mixes the columns: 2 × (1, 0) + 1 × (3, 2) = (5, 2). You never needed the rows.',
        },
        {
          kind: 'choice',
          id: 'maths-matrices-9',
          ask: 'In the figure, choose Stretch. The unit square becomes a wide, low rectangle, yet the determinant reads 1. Why?',
          options: [
            'The determinant only changes when the matrix rotates',
            'The square is made twice as wide and half as tall, so its area is unchanged, and the determinant measures area',
            'The determinant is always 1 when the matrix has zeros in it',
            'The figure rounds the determinant',
          ],
          answer: 1,
          why: 'The determinant is the factor by which areas change: 2 × 0.5 − 0 × 0 = 1. A determinant of 1 does not mean "nothing happened", only that no area was gained or lost. Zero is the special value, because then area is destroyed and so is information.',
        },
        {
          kind: 'output',
          id: 'maths-matrices-10',
          ask: 'A shear and a stretch, applied in both orders. What does this print?',
          code: `import numpy as np

A = np.array([[1, 1],
              [0, 1]])
B = np.array([[2, 0],
              [0, 1]])
print(np.array_equal(A @ B, B @ A))`,
          answer: 'False',
          why: 'A @ B is [[2, 1], [0, 1]] and B @ A is [[2, 2], [0, 1]]. Stretching and then shearing is not the same as shearing and then stretching. Swapping the order of two layers, or of a matrix and its transpose, changes the result even when the shapes still fit.',
        },
        {
          kind: 'bug',
          id: 'maths-matrices-11',
          ask: 'A network with one hidden layer of 16 units and one output. It fails with a shape error on the last line.',
          code: `import numpy as np

rng = np.random.default_rng(0)
X = rng.normal(size=(32, 10))     # 32 examples, 10 features
W1 = rng.normal(size=(10, 16))    # into the hidden layer
W2 = rng.normal(size=(10, 1))     # hidden layer to the output
hidden = np.maximum(0, X @ W1)
out = hidden @ W2`,
          line: 6,
          fix: 'W2 = rng.normal(size=(16, 1))     # hidden layer to the output',
          why: '`hidden` is (32, 10) @ (10, 16) = (32, 16). The next weights must start with 16, the width of the layer feeding them, not with the number of input features. Write the shape after every line and the mismatch is visible before you run anything.',
        },
        {
          kind: 'write',
          id: 'maths-matrices-12',
          ask: 'Write the product of a matrix and a vector, without NumPy. The matrix is a list of rows.',
          starter: `def matvec(A, v):
    # A: a list of rows, each a list of numbers   v: a list of numbers
    # each entry of the result is one row of A dotted with v
    pass`,
          solution: `def matvec(A, v):
    return [sum(a * x for a, x in zip(row, v)) for row in A]`,
          tests: `out = matvec([[1, 2], [3, 4]], [1, 1])
assert out is not None, "the function returns nothing yet"
assert out == [3, 7], f"[[1, 2], [3, 4]] times [1, 1] should be [3, 7], got {out}"
assert matvec([[1, 0], [0, 1]], [5, -2]) == [5, -2], "the identity matrix should return the vector unchanged"
out = matvec([[1, 2, 3], [4, 5, 6]], [1, 0, -1])
assert len(out) == 2, "a matrix with 2 rows gives a result with 2 entries, whatever the length of v"
assert out == [-2, -2], f"[[1, 2, 3], [4, 5, 6]] times [1, 0, -1] should be [-2, -2], got {out}"`,
          why: 'One dot product per row. A (2, 3) matrix takes a vector of 3 numbers and returns 2: the inner sizes match and vanish, as the shape rule says.',
        },
      ],
    },
    {
      id: 'maths-shapes',
      title: 'Shapes, axes and broadcasting',
      summary: 'The NumPy habits that prevent most bugs in numerical code.',
      text: [
        'Every array has a **shape**: `(3,)` is a vector of three numbers, `(2, 3)` is two rows of three, `(32, 3, 224, 224)` is a batch of images. Most bugs in ML code are shape bugs, and the worst of them do not crash. Get into the habit of knowing the shape of every array on every line.',
        'An operation along an **axis** removes that axis. `X.sum(axis=0)` on a `(n, d)` array adds down the rows and leaves `(d,)`: one number per column. `axis=1` leaves `(n,)`: one number per row. `keepdims=True` keeps the axis with size 1, which matters for what comes next.',
        '**Broadcasting** is how NumPy combines arrays of different shapes. Line the shapes up from the right. Each pair of sizes must be equal, or one of them must be 1; a size of 1 is stretched to match. So `(n, d) - (d,)` subtracts a row from every row, which is how you centre columns.',
        { code: `X.shape           # (n, d)
X.mean(axis=0)    # (d,)    one mean per column
X - X.mean(axis=0)            # (n, d) - (d,)   -> (n, d)   ok
X / X.sum(axis=1)             # (n, d) / (n,)   -> error, or worse, wrong
X / X.sum(axis=1, keepdims=True)   # (n, d) / (n, 1) -> (n, d)   ok` },
        'The dangerous case is `(n,)` against `(n, 1)`. They broadcast to `(n, n)` without any error. Subtract predictions of shape `(n, 1)` from targets of shape `(n,)` and you get a square matrix of every prediction against every target. The loss still comes out as a number, and the model trains on nonsense.',
      ],
      rules: [
        'Know the shape of every array. Print it or assert it when in doubt.',
        'A reduction along an axis removes that axis: `axis=0` leaves one value per column.',
        'Broadcasting: align shapes from the right; sizes must be equal or 1.',
        '`(n,)` with `(n, 1)` gives `(n, n)`. Make predictions and targets the same shape before subtracting.',
        '`keepdims=True` keeps a reduced axis as size 1 so the result broadcasts back.',
      ],
      questions: [
        {
          kind: 'output',
          id: 'maths-shapes-1',
          ask: 'What does this print?',
          code: `import numpy as np

X = np.zeros((3, 4))
print(X.sum(axis=0).shape)`,
          answer: '(4,)',
          why: 'Summing along axis 0 removes axis 0 (the 3 rows) and leaves one value per column: 4 of them.',
        },
        {
          kind: 'choice',
          id: 'maths-shapes-2',
          ask: 'An array of shape (3, 1) is added to an array of shape (1, 4). What is the shape of the result?',
          options: ['(3, 4)', '(1, 1)', '(4, 3)', 'It is an error'],
          answer: 0,
          why: 'Aligned from the right: 1 against 4 stretches to 4, and 3 against 1 stretches to 3. Every row value is combined with every column value.',
        },
        {
          kind: 'output',
          id: 'maths-shapes-3',
          ask: 'Targets and predictions for three examples. What does this print?',
          code: `import numpy as np

y = np.array([1, 2, 3])            # targets
pred = np.array([[1], [2], [3]])   # predictions from a model
print((y - pred).shape)`,
          answer: '(3, 3)',
          hint: 'Write the two shapes under each other, lined up from the right.',
          why: '(3,) against (3, 1) broadcasts to (3, 3): every target minus every prediction. No error is raised, and a loss computed from it is wrong. Fix it with pred.squeeze(1) or y.reshape(-1, 1).',
        },
        {
          kind: 'bug',
          id: 'maths-shapes-4',
          ask: 'This should give every column mean 0 and standard deviation 1.',
          code: `def standardize(X):
    # X: (n, d), one row per example
    mean = X.mean(axis=1)
    std = X.std(axis=0)
    return (X - mean) / std`,
          line: 3,
          fix: '    mean = X.mean(axis=0)',
          why: 'axis=1 gives one mean per row, shape (n,). That either fails to broadcast against (n, d), or, when n happens to equal d, silently subtracts the wrong numbers. Per-column statistics need axis=0.',
        },
        {
          kind: 'output',
          id: 'maths-shapes-5',
          ask: 'What does this print?',
          code: `import numpy as np

a = np.array([[1, 2],
              [3, 4]])
print(a.mean(axis=1))`,
          answer: '[1.5 3.5]',
          why: 'axis=1 averages across each row: (1+2)/2 and (3+4)/2.',
        },
        {
          kind: 'choice',
          id: 'maths-shapes-6',
          ask: '`x` has shape (5,). What is the shape of `x.reshape(-1, 1)`?',
          options: ['(5,)', '(1, 5)', '(5, 1)', '(1, 1)'],
          answer: 2,
          why: 'The −1 means "work this one out". With one column, five values need five rows. This is the usual way to turn a flat vector into a column.',
        },
        {
          kind: 'write',
          id: 'maths-shapes-7',
          numpy: true,
          ask: 'Divide every row of a 2-D array by the sum of that row, so that each row adds up to 1. No loops.',
          starter: `import numpy as np

def row_normalize(X):
    # X: (n, d) with positive entries
    pass`,
          solution: `import numpy as np

def row_normalize(X):
    return X / X.sum(axis=1, keepdims=True)`,
          tests: `X = np.array([[1.0, 1.0, 2.0], [0.0, 5.0, 5.0]])
out = row_normalize(X)
assert out is not None, "the function returns nothing yet"
assert out.shape == (2, 3), f"the shape should stay (2, 3), got {out.shape}"
assert np.allclose(out.sum(axis=1), 1), "every row should add up to 1"
assert np.allclose(out[0], [0.25, 0.25, 0.5]), "the first row should be [0.25, 0.25, 0.5]"
S = np.array([[1.0, 3.0], [2.0, 2.0]])
assert np.allclose(row_normalize(S), [[0.25, 0.75], [0.5, 0.5]]), "wrong for a square array: are you dividing by the column sums?"`,
          why: 'The row sums have shape (n,). With keepdims=True they are (n, 1), which broadcasts across the columns. Without it, a square array would silently be divided by the wrong sums.',
        },
        {
          kind: 'output',
          id: 'maths-shapes-8',
          ask: 'What does this print?',
          code: `import numpy as np

X = np.ones((4, 3))
print(X.sum(axis=1).shape, X.sum(axis=1, keepdims=True).shape)`,
          answer: '(4,) (4, 1)',
          why: 'Summing along axis 1 removes it and leaves one value per row: (4,). With keepdims=True the axis stays with size 1, giving a column (4, 1) that broadcasts against the original (4, 3).',
        },
        {
          kind: 'number',
          id: 'maths-shapes-9',
          ask: 'A batch of images has shape (8, 3, 32, 32): 8 images, 3 colour channels, 32 by 32 pixels. You take `.mean(axis=(2, 3))`. How many numbers are in the result?',
          answer: 24,
          check: 'np.zeros((8, 3, 32, 32)).mean(axis=(2, 3)).size',
          why: 'Axes 2 and 3 (height and width) are removed, leaving (8, 3): one mean per image per channel, 24 numbers. To get one mean per channel across the whole batch, as you need for normalising images, reduce over axes (0, 2, 3) instead.',
        },
        {
          kind: 'bug',
          id: 'maths-shapes-10',
          ask: 'A mean squared error. It returns a number without complaint, but the number is wrong and the model does not learn.',
          code: `def mse(model_out, y):
    # model_out: (n, 1), straight from the last layer   y: (n,)
    pred = model_out.reshape(-1, 1)
    return ((pred - y) ** 2).mean()`,
          line: 3,
          fix: '    pred = model_out.reshape(-1)',
          why: 'reshape(-1, 1) keeps the predictions as a column, so (n, 1) − (n,) broadcasts to (n, n): every prediction against every target. Flattening to (n,) makes the subtraction go pair by pair.',
        },
        {
          kind: 'choice',
          id: 'maths-shapes-11',
          ask: '`X` has shape (5, 3). Which of these raises an error?',
          options: ['`X + np.ones(3)`', '`X + np.ones(5)`', '`X + np.ones((5, 1))`', '`X + np.ones((1, 3))`'],
          answer: 1,
          why: 'Shapes are lined up from the right, so (5,) is compared with the last axis of X, which is 3: neither equal nor 1. To add one number per row you need a column, (5, 1). If X were (5, 5) the same line would run and add along the wrong axis, which is the worse outcome.',
        },
        {
          kind: 'write',
          id: 'maths-shapes-12',
          numpy: true,
          ask: 'Return the squared distance from every row of `A` to every row of `B`, as an array of shape (n, m). No loops: use broadcasting.',
          starter: `import numpy as np

def pairwise_sq_dists(A, B):
    # A: (n, d)   B: (m, d)   result: (n, m)
    pass`,
          solution: `import numpy as np

def pairwise_sq_dists(A, B):
    diff = A[:, None, :] - B[None, :, :]
    return (diff ** 2).sum(axis=2)`,
          tests: `A = np.array([[0.0, 0.0], [1.0, 1.0], [3.0, 4.0]])
B = np.array([[0.0, 0.0], [3.0, 4.0]])
out = pairwise_sq_dists(A, B)
assert out is not None, "the function returns nothing yet"
assert out.shape == (3, 2), f"3 rows against 2 rows should give shape (3, 2), got {out.shape}"
assert np.allclose(out, [[0, 25], [2, 13], [25, 0]]), "the distances are wrong: entry [i, j] is the squared distance from A[i] to B[j]"
C = np.array([[1.0, 2.0, 3.0]])
assert np.allclose(pairwise_sq_dists(C, C), [[0.0]]), "a point is at distance 0 from itself"`,
          hint: '`A[:, None, :]` has shape (n, 1, d) and `B[None, :, :]` has shape (1, m, d). What do they broadcast to?',
          why: '(n, 1, d) − (1, m, d) broadcasts to (n, m, d): every row of A minus every row of B. Summing the squares over the last axis removes it and leaves (n, m). Here the "every against every" behaviour of broadcasting is what you want. It is how nearest-neighbour search and k-means compute distances.',
        },
      ],
    },
    {
      id: 'maths-derivatives',
      title: 'Derivatives: the slope of the loss',
      summary: 'How a small change in an input changes the output, and why training needs exactly that number.',
      widget: 'maths-derivative',
      text: [
        'Training a model means turning knobs (the weights) until a number (the loss) is as small as possible. To know which way to turn a knob you need one fact: if I nudge this weight up a little, does the loss go up or down, and how fast? That is the **derivative**.',
        'The derivative of `f` at `x` is the slope of the curve at that point: `(f(x + h) − f(x)) / h` as `h` shrinks to nothing. If it is positive, increasing `x` increases `f`. If it is negative, increasing `x` decreases `f`. If it is zero the curve is flat there: a minimum, a maximum, or a flat spot on the way.',
        'A handful of rules cover almost everything: the derivative of `xⁿ` is `n·xⁿ⁻¹`; constants multiply through; sums are done term by term. So `3x² + 2x` has derivative `6x + 2`.',
        'You will rarely differentiate by hand: frameworks do it. But the picture matters, because it explains what goes wrong. The sigmoid curve is nearly flat at both ends, so its derivative there is nearly zero, so a weight feeding a saturated sigmoid gets almost no signal about which way to move.',
        'The formula with a small `h` is also a tool. Computing a derivative numerically and comparing it with the one your code produces is called a **gradient check**, and it is the standard way to test hand-written gradients.',
      ],
      rules: [
        'The derivative is the slope: how much the output changes per unit change in the input.',
        'Positive slope: move the input down to reduce the output. Negative: move it up.',
        'Slope zero is where minima and maxima are.',
        'Power rule: `xⁿ` → `n·xⁿ⁻¹`.',
        'A numerical slope `(f(x+h) − f(x−h)) / 2h` checks a derivative you wrote by hand.',
      ],
      questions: [
        { kind: 'number', id: 'maths-derivatives-1', ask: 'What is the derivative of f(x) = x² at x = 3?', answer: 6, why: 'The derivative of x² is 2x, and 2×3 = 6. At x = 3 the curve rises six units for every unit you move right.' },
        { kind: 'number', id: 'maths-derivatives-2', ask: 'What is the derivative of f(x) = 3x² + 2x at x = 1?', answer: 8, why: 'Term by term: 3x² gives 6x and 2x gives 2. At x = 1 that is 6 + 2 = 8.' },
        {
          kind: 'choice',
          id: 'maths-derivatives-3',
          ask: 'The loss as a function of one weight has slope +4 at the current value. To reduce the loss, what should you do to the weight?',
          options: ['Increase it', 'Decrease it', 'Leave it: the loss is at a minimum', 'Multiply it by 4'],
          answer: 1,
          why: 'A positive slope means the loss goes up as the weight goes up. So go the other way. Gradient descent always steps against the sign of the slope.',
        },
        {
          kind: 'output',
          id: 'maths-derivatives-4',
          ask: 'A slope estimated with a rather large step. What does this print?',
          code: `def f(x):
    return x ** 2

h = 0.5
print((f(3 + h) - f(3)) / h)`,
          answer: '6.5',
          why: '(12.25 − 9) / 0.5 = 6.5. The true slope is 6: with a one-sided difference the error is about h. Shrink h, or use points on both sides, and it gets closer.',
        },
        {
          kind: 'choice',
          id: 'maths-derivatives-5',
          ask: 'The derivative of a function is 0 at some point. Which of these must be true?',
          options: ['It is the lowest point of the function', 'The function is flat at that point', 'The function is zero there', 'The function has no other flat points'],
          answer: 1,
          why: 'A zero derivative only says the curve is flat there. It can be a minimum, a maximum, or a level stretch (a saddle, in more dimensions). Optimisers can stall at all three.',
        },
        {
          kind: 'choice',
          id: 'maths-derivatives-6',
          ask: 'In the figure, choose sigmoid and move the point far to the right. The derivative is close to 0. What does that mean for a weight that feeds this sigmoid?',
          options: [
            'The weight is already perfect',
            'Changing the weight barely changes the output, so the weight gets almost no signal to learn from',
            'The weight will grow without limit',
            'The sigmoid outputs 0 there',
          ],
          answer: 1,
          why: 'A flat curve passes on almost nothing. This is saturation, and stacked up over many layers it is the vanishing-gradient problem. It is the main reason ReLU replaced sigmoid inside deep networks.',
        },
        {
          kind: 'write',
          id: 'maths-derivatives-7',
          ask: 'Write a numerical derivative using the central difference: the slope between a point just left of x and one just right of it.',
          starter: `def derivative(f, x, h=1e-5):
    # slope of f at x, from the points x - h and x + h
    pass`,
          solution: `def derivative(f, x, h=1e-5):
    return (f(x + h) - f(x - h)) / (2 * h)`,
          tests: `import math
assert derivative(lambda x: x ** 2, 3.0) is not None, "the function returns nothing yet"
assert abs(derivative(lambda x: x ** 2, 3.0) - 6) < 1e-6, "the slope of x**2 at 3 should be 6"
assert abs(derivative(math.sin, 0.0) - 1) < 1e-6, "the slope of sin at 0 should be 1"
assert abs(derivative(lambda x: 5.0, 2.0)) < 1e-9, "a constant has slope 0"
# a one-sided difference is too rough to pass this one
assert abs(derivative(lambda x: x ** 3, 1.0, h=0.01) - 3) < 1e-3, "use points on both sides of x"`,
          why: 'Taking points on both sides cancels the largest error term, so the estimate is far more accurate than a one-sided difference with the same h. This is the function used in gradient checks.',
        },
        {
          kind: 'number',
          id: 'maths-derivatives-8',
          ask: 'What is the derivative of f(x) = 2x³ − 5x at x = 2?',
          answer: 19,
          check: '(lambda f, x, h: (f(x + h) - f(x - h)) / (2 * h))(lambda x: 2 * x ** 3 - 5 * x, 2.0, 1e-5)',
          hint: 'Power rule on each term: x³ gives 3x². The constants multiply through.',
          why: '2x³ gives 6x² and −5x gives −5, so the derivative is 6x² − 5 = 24 − 5 = 19. The answer here is confirmed by a numerical slope, which is exactly what a gradient check does.',
        },
        {
          kind: 'choice',
          id: 'maths-derivatives-9',
          ask: 'In the figure, choose x² and put the point at x = 1. Set h to 1, then to 0.5, then to 0.01, and watch the error between the chord slope and the derivative. What is the pattern?',
          options: [
            'The error is the same for every h',
            'The error shrinks in step with h: 1, then 0.5, then 0.01',
            'The error grows as h shrinks',
            'The error is zero for every h, because x² is smooth',
          ],
          answer: 1,
          why: 'For x² the one-sided chord slope is 2x + h, so the error is exactly h. In general the error of a one-sided difference is roughly proportional to h, which is why the central difference, whose error goes as h², is the one used in gradient checks.',
        },
        {
          kind: 'output',
          id: 'maths-derivatives-10',
          ask: 'If a small `h` is good, a tiny one should be better. What does this print?',
          code: `def f(x):
    return x ** 2

h = 1e-20
print((f(3 + h) - f(3)) / h)`,
          answer: '0.0',
          hint: 'A float holds about 16 significant digits. What is 3 + 1e-20 as a float?',
          why: 'A float cannot tell 3 + 1e-20 from 3, so the two values of f are identical and the slope comes out as 0 instead of 6. Numerical derivatives need an h that is small but not too small: around 1e-5 for a central difference on ordinary floats.',
        },
        {
          kind: 'bug',
          id: 'maths-derivatives-11',
          ask: 'A gradient check: compare a hand-written derivative with a numerical one. It rejects derivatives that are correct.',
          code: `def gradient_ok(f, df, x, h=1e-5):
    numeric = (f(x + h) - f(x - h)) / h
    return abs(numeric - df(x)) < 1e-6`,
          line: 2,
          fix: '    numeric = (f(x + h) - f(x - h)) / (2 * h)',
          why: 'The two points are 2h apart, so the rise must be divided by 2h. Dividing by h gives twice the true slope, and every correct derivative fails the check (except where the slope is 0).',
        },
        {
          kind: 'write',
          id: 'maths-derivatives-12',
          ask: 'A polynomial is stored as a list of coefficients, lowest power first: `[5, 0, 3]` means 5 + 0x + 3x². Return the coefficients of its derivative in the same form.',
          starter: `def poly_derivative(coeffs):
    # coeffs[n] is the coefficient of x**n; there are at least two of them
    # the term c * x**n becomes n * c * x**(n - 1)
    pass`,
          solution: `def poly_derivative(coeffs):
    return [n * c for n, c in enumerate(coeffs)][1:]`,
          tests: `out = poly_derivative([0, 2, 3])
assert out is not None, "the function returns nothing yet"
assert out == [2, 6], f"2x + 3x**2 has derivative 2 + 6x, so [2, 6], got {out}"
assert poly_derivative([5, 0, 3]) == [0, 6], "5 + 3x**2 has derivative 6x, so [0, 6]: the constant term disappears"
assert poly_derivative([7, 4]) == [4], "7 + 4x has derivative 4, so [4]"
assert poly_derivative([1, 1, 1, 1]) == [1, 2, 3], "1 + x + x**2 + x**3 has derivative 1 + 2x + 3x**2"`,
          why: 'Each term is handled on its own: multiply the coefficient by the power and move it down one place. The constant has power 0, so it contributes nothing and drops off the front. Those are the power rule, the constant rule and the sum rule in one line.',
        },
      ],
    },
    {
      id: 'maths-gradient',
      title: 'Gradients and gradient descent',
      summary: 'Many weights at once: the direction of steepest ascent, and stepping against it.',
      widget: 'maths-descent',
      text: [
        'A real model has millions of weights, and the loss depends on all of them. A **partial derivative** is the slope with respect to one weight while the others are held still. Collect one for every weight and you have the **gradient**: a vector that points in the direction in which the loss rises fastest.',
        'Gradient descent is one line, repeated: `w = w - lr * gradient`. Step against the gradient, by an amount set by the **learning rate**. Every training method in deep learning is a refinement of this line.',
        'The learning rate is the setting that matters most. Too small and training crawls. Too large and each step overshoots the valley; the loss bounces, or climbs and becomes `nan`. The limit depends on the steepest direction of the loss surface, which is what the figure shows.',
        'When features have very different scales, the loss surface is a long narrow valley: steep across, shallow along. No single learning rate suits both directions. **Scaling the features** makes the valley round. **Momentum** keeps a running average of past steps, which cancels the zig-zag and keeps speed along the valley floor.',
        'Computing the gradient over all the data for every step is too slow. **Mini-batch** gradient descent estimates it from a small random batch. The estimate is noisy, but you can take thousands of cheap steps in the time of one exact one, and the noise even helps to get out of poor flat spots.',
      ],
      rules: [
        'The gradient is the vector of slopes, one per weight. It points uphill.',
        'Update: `w = w - lr * gradient`.',
        'Loss rising or bouncing: the learning rate is too high. Falling very slowly: too low.',
        'Scale your features: a stretched loss surface forces a tiny learning rate.',
        'Mini-batches give a noisy but cheap gradient. More, cheaper steps win.',
      ],
      questions: [
        { kind: 'number', id: 'maths-gradient-1', ask: 'f(x, y) = x² + 3y. What is the partial derivative with respect to x at the point (2, 5)?', answer: 4, why: 'Hold y still and it is a constant, so only x² matters: its derivative is 2x = 4. (The partial with respect to y is 3 everywhere.)' },
        {
          kind: 'number',
          id: 'maths-gradient-2',
          ask: 'The loss is w². The weight is 4 and the learning rate is 0.1. What is the weight after one step of gradient descent?',
          answer: 3.2,
          hint: 'The gradient of w² is 2w.',
          why: 'The gradient is 2×4 = 8. The step is 0.1 × 8 = 0.8, taken downhill: 4 − 0.8 = 3.2.',
        },
        {
          kind: 'output',
          id: 'maths-gradient-3',
          ask: 'Two steps on the loss w². What does this print?',
          code: `w = 1.0
for _ in range(2):
    grad = 2 * w
    w = w - 0.5 * grad
print(w)`,
          answer: '0.0',
          why: 'First step: 1 − 0.5×2 = 0. Second step: the gradient at 0 is 0, so nothing moves. For this particular bowl a learning rate of 0.5 jumps straight to the bottom; 1.0 would bounce between +1 and −1 forever, and anything above would diverge.',
        },
        {
          kind: 'choice',
          id: 'maths-gradient-4',
          ask: 'This is the training loss of a model over the first 12 steps. What is the most likely cause?',
          chart: { x: 'step', y: 'training loss', series: [{ name: 'loss', points: [2.3, 2.9, 2.1, 3.8, 2.6, 5.2, 3.9, 8.8, 6.1, 15.3, 11.2, 31.0], color: 'bad' }] },
          options: ['The learning rate is too low', 'The learning rate is too high', 'The model is overfitting', 'The model is too small'],
          answer: 1,
          why: 'The loss swings and grows: each step overshoots the valley by more than the last. Overfitting shows in the gap between training and validation loss, not in a training loss that explodes. Lower the learning rate, typically by 3 to 10 times.',
        },
        {
          kind: 'bug',
          id: 'maths-gradient-5',
          ask: 'This is meant to minimise a function, given a function that returns its gradient. The loss goes up instead.',
          code: `def gradient_descent(grad, w, lr=0.1, steps=100):
    for _ in range(steps):
        w = w + lr * grad(w)
    return w`,
          line: 3,
          fix: '        w = w - lr * grad(w)',
          why: 'The gradient points uphill. Adding it climbs. Descent subtracts it.',
        },
        {
          kind: 'choice',
          id: 'maths-gradient-6',
          ask: 'In the figure, set stretch to 20 and the learning rate to 0.11. The path blows up. With stretch 1 the same learning rate works well. What is the practical lesson?',
          options: [
            'Always use a learning rate below 0.1',
            'Features on very different scales make the loss surface stretched, which forces a small learning rate; scale them first',
            'Gradient descent cannot handle two weights',
            'Momentum should always be 0',
          ],
          answer: 1,
          why: 'The largest safe learning rate is set by the steepest direction (here 2 ÷ stretch). Standardising the inputs makes the directions similar, so one learning rate can suit all of them.',
        },
        {
          kind: 'write',
          id: 'maths-gradient-7',
          ask: 'Write gradient descent for one weight. `grad` is a function that returns the slope of the loss at a weight.',
          starter: `def minimize(grad, w, lr, steps):
    # repeat: step against the gradient
    pass`,
          solution: `def minimize(grad, w, lr, steps):
    for _ in range(steps):
        w = w - lr * grad(w)
    return w`,
          tests: `out = minimize(lambda w: 2 * (w - 3), 0.0, 0.1, 200)
assert out is not None, "the function returns nothing yet"
assert abs(out - 3) < 1e-6, f"the minimum of (w - 3)**2 is at 3, got {out}"
assert abs(minimize(lambda w: 2 * w, 4.0, 0.1, 1) - 3.2) < 1e-9, "one step from 4 with lr 0.1 on w**2 should give 3.2"
assert minimize(lambda w: 2 * w, 5.0, 0.1, 0) == 5.0, "with no steps the weight should not change"`,
          why: 'The whole algorithm is the one line inside the loop. Everything else in an optimiser (momentum, Adam, schedules) changes how the step is computed, not this shape.',
        },
        {
          kind: 'number',
          id: 'maths-gradient-8',
          ask: 'f(x, y) = x² + y². The gradient at (3, 4) is a vector. What is its length?',
          answer: 10,
          check: 'np.linalg.norm([2 * 3, 2 * 4])',
          hint: 'One partial derivative per input, then the length of that vector.',
          why: 'The partials are 2x = 6 and 2y = 8, so the gradient is (6, 8), with length 10. It points straight away from the minimum at the origin, and its length says how steep the surface is there. Frameworks report this number as the gradient norm.',
        },
        {
          kind: 'output',
          id: 'maths-gradient-9',
          ask: 'Two weights. The loss is ten times steeper along the second one. What does this print?',
          code: `import numpy as np

w = np.array([1.0, 1.0])
steepness = np.array([1.0, 10.0])   # loss = 0.5 * (w[0]**2 + 10 * w[1]**2)
for _ in range(2):
    grad = steepness * w
    w = w - 0.2 * grad
print(w.round(2).tolist())`,
          answer: '[0.64, 1.0]',
          why: 'The shallow weight creeps: 1 → 0.8 → 0.64. The steep one has gradient 10, so a step of 0.2 × 10 = 2 throws it from 1 to −1 and back to 1: it bounces forever. One learning rate is too small for one direction and at the limit for the other. That is the stretched valley.',
        },
        {
          kind: 'choice',
          id: 'maths-gradient-10',
          ask: 'A 10-class classifier starts at a loss of 2.30, the value for random guessing. This is its training loss over the first 12 steps. What should you try first?',
          chart: { x: 'step', y: 'training loss', series: [{ name: 'loss', points: [2.3, 2.295, 2.29, 2.285, 2.28, 2.275, 2.27, 2.265, 2.26, 2.255, 2.25, 2.245], color: 'accent' }] },
          options: ['Lower the learning rate: the loss is unstable', 'Raise the learning rate: the loss is falling steadily but very slowly', 'Stop: the model has converged', 'Add regularisation: the model is overfitting'],
          answer: 1,
          why: 'The loss falls smoothly by a tiny, constant amount per step and is still next to its starting value. That is a learning rate that is too low. A converged model flattens out at a low loss, and an unstable one bounces. Raise the rate by 3 to 10 times and look again.',
        },
        {
          kind: 'bug',
          id: 'maths-gradient-11',
          ask: 'One epoch of mini-batch gradient descent. It gives the right answer but each step is as slow as using all the data.',
          code: `import numpy as np

def sgd_epoch(X, y, w, grad, lr=0.01, batch=32):
    order = np.random.permutation(len(X))
    for start in range(0, len(X), batch):
        rows = order[start:start + batch]
        w = w - lr * grad(X, y, w)
    return w`,
          line: 7,
          fix: '        w = w - lr * grad(X[rows], y[rows], w)',
          why: 'The batch is chosen and then never used: every step computes the gradient over the whole dataset. Passing only the rows of the batch gives a noisier gradient at a fraction of the cost, which is the whole point of mini-batches.',
        },
        {
          kind: 'write',
          id: 'maths-gradient-12',
          ask: 'Write one step of gradient descent with momentum for one weight. The velocity is updated as `v = beta * v - lr * grad`, and then the weight moves by the velocity.',
          starter: `def momentum_step(w, v, grad, lr, beta):
    # v: the velocity, which remembers past steps
    # returns (new_w, new_v)
    pass`,
          solution: `def momentum_step(w, v, grad, lr, beta):
    v = beta * v - lr * grad
    return w + v, v`,
          tests: `out = momentum_step(4.0, 0.0, 8.0, 0.1, 0.9)
assert out is not None, "the function returns nothing yet"
w, v = out
assert abs(w - 3.2) < 1e-9 and abs(v + 0.8) < 1e-9, f"from rest, the first step is plain gradient descent: (3.2, -0.8), got {out}"
w, v = momentum_step(3.2, -0.8, 6.4, 0.1, 0.9)
assert abs(v + 1.36) < 1e-9, f"the velocity should be 0.9 * -0.8 - 0.1 * 6.4 = -1.36, got {v}"
assert abs(w - 1.84) < 1e-9, f"the weight should move by the new velocity to 1.84, got {w}"
w, v = momentum_step(1.0, 5.0, 2.0, 0.1, 0.0)
assert abs(w - 0.8) < 1e-9, "with beta = 0 the old velocity is forgotten and the step is plain gradient descent"`,
          why: 'With beta at 0.9, each step keeps 90% of the previous one. Steps that keep pointing the same way add up, and steps that flip sign cancel. That is how momentum speeds up the crawl along a valley and damps the zig-zag across it.',
        },
      ],
    },
    {
      id: 'maths-chain',
      title: 'The chain rule is backpropagation',
      summary: 'How the gradient of every weight in a deep network is found in one backward pass.',
      widget: 'maths-chain',
      text: [
        'A network is a chain of simple steps: multiply, add, bend, compare with the target. Each step has a simple derivative. The **chain rule** says how to combine them: if `y` depends on `u` and `u` depends on `x`, then `dy/dx = dy/du × du/dx`. Slopes along a chain multiply.',
        'So `(3x + 1)²` is a square wrapped around a line. The outside gives `2(3x + 1)`, the inside gives `3`, and the derivative is their product, `6(3x + 1)`.',
        '**Backpropagation** is the chain rule applied in a sensible order. Run the network forward and keep every intermediate value. Then walk backward from the loss. At each step you already hold the gradient of the loss with respect to the step\'s output; multiply by the step\'s own local slope and you have the gradient with respect to its input. One backward pass gives the gradient of every weight.',
        { code: `# forward                # backward (each line: gradient so far × local slope)
z = w * x                #   dL_dw = dL_dz * x
y = z + b                #   dL_dz = dL_dy * 1      dL_db = dL_dy * 1
e = y - t                #   dL_dy = dL_de * 1
L = e ** 2               #   dL_de = 2 * e` },
        'Two details are worth knowing. When a value is used in two places, the gradients from both places **add**. And because gradients are products, a long chain of small local slopes shrinks to nothing (vanishing gradients) while a chain of large ones explodes. Much of network design, such as ReLU, careful initialisation, normalisation and residual connections, exists to keep that product near 1.',
      ],
      rules: [
        'Chain rule: slopes along a chain multiply.',
        'Backprop: go forward and store values, then go backward multiplying by one local slope at a time.',
        'Gradient of an input = gradient of the output × local slope.',
        'A value used twice gets the sum of both gradients.',
        'Many small slopes multiplied vanish; many large ones explode.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'maths-chain-1',
          ask: 'y = (3x + 1)². What is dy/dx at x = 1?',
          answer: 24,
          hint: 'Outside: the square. Inside: 3x + 1.',
          why: 'Outside slope: 2(3x + 1) = 8 at x = 1. Inside slope: 3. Multiply: 24.',
        },
        {
          kind: 'number',
          id: 'maths-chain-2',
          ask: 'In the figure, with x = 2, t = 3, w = 0.5 and b = 1: the prediction is y = 2 and the error is e = −1. What is ∂L/∂w?',
          answer: -4,
          why: 'Backward: ∂L/∂e = 2e = −2. That passes unchanged through the subtraction and the addition. At z = w·x the local slope with respect to w is x = 2, so ∂L/∂w = −2 × 2 = −4. Negative means: raise w to lower the loss.',
        },
        {
          kind: 'output',
          id: 'maths-chain-3',
          ask: 'Backprop by hand for one neuron. What does this print?',
          code: `x, w, b, t = 2.0, 1.0, 0.0, 5.0

y = w * x + b
loss = (y - t) ** 2

dloss_dy = 2 * (y - t)
dloss_dw = dloss_dy * x
print(loss, dloss_dw)`,
          answer: '9.0 -12.0',
          why: 'y = 2, so the loss is (2 − 5)² = 9. The gradient at y is 2 × (−3) = −6, and multiplying by the local slope x = 2 gives −12.',
        },
        {
          kind: 'bug',
          id: 'maths-chain-4',
          ask: 'The backward step for a sigmoid: given the gradient arriving from above, return the gradient with respect to x.',
          code: `import math

def sigmoid_backward(grad_out, x):
    s = 1 / (1 + math.exp(-x))
    return grad_out + s * (1 - s)`,
          line: 5,
          fix: '    return grad_out * s * (1 - s)',
          why: 'The chain rule multiplies the incoming gradient by the local slope, which for a sigmoid is s(1 − s). Adding them gives a number with no meaning.',
        },
        {
          kind: 'choice',
          id: 'maths-chain-5',
          ask: 'The largest value the sigmoid\'s slope s(1 − s) can take is 0.25. What happens to the gradient that reaches the first layer of a network with 10 sigmoid layers?',
          options: ['It is at most 0.25', 'It has been multiplied by ten factors of at most 0.25, so it is at most about a millionth of its size', 'It grows by a factor of 10', 'Nothing: sigmoids pass gradients through unchanged'],
          answer: 1,
          why: '0.25¹⁰ is about 0.000001. The early layers get almost no signal and barely learn. This is the vanishing-gradient problem.',
        },
        {
          kind: 'choice',
          id: 'maths-chain-6',
          ask: 'A value `h` feeds two later steps of a computation. Going backward, one of them sends back a gradient of 3 and the other sends back −1. What is the gradient of the loss with respect to `h`?',
          options: ['3', '−3', '2', 'It cannot be computed'],
          answer: 2,
          why: 'Changing h changes the loss through both routes, and the effects add: 3 + (−1) = 2. This is why frameworks accumulate gradients, and why you have to zero them between steps.',
        },
        {
          kind: 'write',
          id: 'maths-chain-7',
          ask: 'One neuron with a ReLU: `y = max(0, w*x + b)` and the loss is `(y - t)**2`. Return the gradients of the loss with respect to `w` and `b`.',
          starter: `def grads(w, b, x, t):
    # forward
    z = w * x + b
    y = max(0.0, z)
    # backward: return (dL_dw, dL_db)
    pass`,
          solution: `def grads(w, b, x, t):
    z = w * x + b
    y = max(0.0, z)
    dL_dy = 2 * (y - t)
    dL_dz = dL_dy * (1.0 if z > 0 else 0.0)
    return dL_dz * x, dL_dz`,
          tests: `out = grads(1.0, 0.0, 2.0, 5.0)
assert out is not None, "the function returns nothing yet"
dw, db = out
assert abs(dw + 12) < 1e-9 and abs(db + 6) < 1e-9, f"with w=1, b=0, x=2, t=5 the gradients are (-12, -6), got {out}"
dw, db = grads(-1.0, 0.0, 2.0, 5.0)
assert dw == 0 and db == 0, "when the ReLU is off (z < 0) no gradient passes through it"
def loss(w, b, x, t):
    return (max(0.0, w * x + b) - t) ** 2
h = 1e-6
dw, db = grads(0.7, 0.3, 1.5, 2.0)
assert abs(dw - (loss(0.7 + h, 0.3, 1.5, 2.0) - loss(0.7 - h, 0.3, 1.5, 2.0)) / (2 * h)) < 1e-4, "dL_dw does not match a numerical gradient check"
assert abs(db - (loss(0.7, 0.3 + h, 1.5, 2.0) - loss(0.7, 0.3 - h, 1.5, 2.0)) / (2 * h)) < 1e-4, "dL_db does not match a numerical gradient check"`,
          why: 'The ReLU has local slope 1 where its input is positive and 0 where it is negative: it passes the gradient through or blocks it. The last tests are a gradient check, the same method used to test real backward code.',
        },
        {
          kind: 'number',
          id: 'maths-chain-8',
          ask: 'A badly initialised network multiplies the gradient by 1.5 at each of its 20 layers on the way back. By what factor has the gradient grown when it reaches the first layer? (Nearest whole number.)',
          answer: 3325,
          tol: 5,
          check: '1.5 ** 20',
          why: '1.5²⁰ ≈ 3,325. A local slope only a little above 1, repeated, explodes, in the same way that slopes a little below 1 vanish. The symptoms are a loss that jumps to `nan`. The usual remedies are better initialisation, normalisation layers and gradient clipping.',
        },
        {
          kind: 'output',
          id: 'maths-chain-9',
          ask: 'Here `x` is used three times on the way to `y`. What does this print?',
          code: `x = 3.0
a = x * x          # x is used twice here
y = a + x          # and once more here

dy_da = 1.0
dy_dx = dy_da * x + dy_da * x + 1.0
print(y, dy_dx)`,
          answer: '12.0 7.0',
          why: 'y = 9 + 3 = 12. The gradient reaching x is the sum over every place x was used: x from each side of the product, and 1 from the addition, so 3 + 3 + 1 = 7. That matches the derivative of x² + x, which is 2x + 1.',
        },
        {
          kind: 'bug',
          id: 'maths-chain-10',
          ask: 'Backprop for `y = w * x + b` with loss `(y - t) ** 2`. A gradient check passes for `b` and fails for `w`.',
          code: `def backward(w, b, x, t):
    z = w * x
    y = z + b
    e = y - t
    dL_de = 2 * e
    dL_dy = dL_de
    dL_db = dL_dy
    dL_dw = dL_dy * w
    return dL_dw, dL_db`,
          line: 8,
          fix: '    dL_dw = dL_dy * x',
          why: 'The local slope of `w * x` with respect to `w` is `x`: nudge w by a little and z moves by x times as much. Multiplying by `w` gives the slope with respect to x instead, which is the gradient you would pass back to an earlier layer.',
        },
        {
          kind: 'choice',
          id: 'maths-chain-11',
          ask: 'A framework adds each new gradient to the one already stored on a weight. You forget to reset the stored gradients to zero between training steps. What happens?',
          options: [
            'Nothing: the old gradients are overwritten',
            'Each update uses the sum of the gradients from every step so far, so the steps grow and point in stale directions',
            'The gradients are averaged, which makes training smoother',
            'The framework raises an error on the second step',
          ],
          answer: 1,
          why: 'Accumulating is correct inside one backward pass, where a value used twice needs both gradients added. Across steps it is a bug: the update mixes in gradients computed at old weights. The loss usually becomes unstable, with no error message. It is the reason for the `zero_grad()` call in every training loop.',
        },
        {
          kind: 'write',
          id: 'maths-chain-12',
          ask: 'Two weights in a chain: `h = w1 * x`, `y = w2 * h`, and the loss is `(y - t)**2`. Return the gradients of the loss with respect to `w1` and `w2`.',
          starter: `def grads(w1, w2, x, t):
    # forward
    h = w1 * x
    y = w2 * h
    # backward: return (dL_dw1, dL_dw2)
    pass`,
          solution: `def grads(w1, w2, x, t):
    h = w1 * x
    y = w2 * h
    dL_dy = 2 * (y - t)
    dL_dw2 = dL_dy * h
    dL_dh = dL_dy * w2
    dL_dw1 = dL_dh * x
    return dL_dw1, dL_dw2`,
          tests: `out = grads(1.0, 3.0, 2.0, 5.0)
assert out is not None, "the function returns nothing yet"
d1, d2 = out
assert abs(d2 - 4) < 1e-9, f"with w1=1, w2=3, x=2, t=5: y = 6, dL_dy = 2, and dL_dw2 = dL_dy * h = 4, got {d2}"
assert abs(d1 - 12) < 1e-9, f"dL_dw1 = dL_dy * w2 * x = 12, got {d1}: the gradient has to pass back through w2 first"
def loss(w1, w2, x, t):
    return (w2 * (w1 * x) - t) ** 2
h = 1e-6
d1, d2 = grads(0.7, -1.3, 1.5, 2.0)
assert abs(d1 - (loss(0.7 + h, -1.3, 1.5, 2.0) - loss(0.7 - h, -1.3, 1.5, 2.0)) / (2 * h)) < 1e-4, "dL_dw1 does not match a numerical gradient check"
assert abs(d2 - (loss(0.7, -1.3 + h, 1.5, 2.0) - loss(0.7, -1.3 - h, 1.5, 2.0)) / (2 * h)) < 1e-4, "dL_dw2 does not match a numerical gradient check"`,
          why: 'The gradient of the first weight contains the second weight: it had to travel back through that layer. In a deep network every early gradient is a product of the later weights and slopes, which is where vanishing and exploding gradients come from.',
        },
      ],
    },
    {
      id: 'maths-probability',
      title: 'Probability and Bayes\' rule',
      summary: 'Conditional probability, base rates, and why a good test can still be wrong most of the time.',
      widget: 'maths-bayes',
      text: [
        'A model\'s output is usually a probability, and so is nearly every statement about how good a model is. A few rules do most of the work.',
        'For independent events, probabilities multiply: two fair coins both landing heads is `0.5 × 0.5`. The **conditional probability** `P(A | B)` is the probability of A among only the cases where B happened. It is a different number from `P(B | A)`, and confusing the two is the most common mistake in the subject.',
        '**Bayes\' rule** turns one into the other: `P(A | B) = P(B | A) × P(A) / P(B)`. In words: start from how common A is (the **prior**, or base rate), and update by how much more likely the evidence is when A is true.',
        'The figure shows why the base rate matters. If one person in a hundred has a condition, a test that catches 90% of cases and gives false alarms on 5% of healthy people is still wrong about most of the people it flags, because there are so many more healthy people to raise false alarms.',
        'This is not only about medicine. A fraud model, a spam filter and a defect detector all look for something rare. The share of flagged cases that are real is the model\'s **precision**, and it is governed by exactly this sum.',
      ],
      rules: [
        '`P(A | B)` is not `P(B | A)`.',
        'Independent events: multiply. "Either" of two exclusive events: add.',
        'Bayes: posterior ∝ likelihood × prior.',
        'When the thing you look for is rare, most alarms are false, even from a good detector.',
        'When in doubt, count people: imagine 10,000 cases and split them.',
      ],
      questions: [
        { kind: 'number', id: 'maths-probability-1', ask: 'Two independent events have probabilities 0.5 and 0.2. What is the probability that both happen?', answer: 0.1, why: 'Independent events multiply: 0.5 × 0.2 = 0.1.' },
        {
          kind: 'number',
          id: 'maths-probability-2',
          ask: '1% of transactions are fraud. A model flags 90% of fraud, and also flags 5% of honest transactions. A transaction is flagged. What is the probability it is fraud? (Two decimals.)',
          answer: 0.1538,
          tol: 0.006,
          check: '(0.01 * 0.9) / (0.01 * 0.9 + 0.99 * 0.05)',
          hint: 'Take 10,000 transactions. How many frauds are flagged? How many honest ones?',
          why: 'Of 10,000 transactions, 100 are fraud and 90 of those are flagged. Of the 9,900 honest ones, 495 are flagged. So 90 of 585 flagged transactions are fraud: about 15%.',
        },
        {
          kind: 'choice',
          id: 'maths-probability-3',
          ask: '"95% of the emails our filter marks as spam really are spam." Which quantity is that?',
          options: ['P(marked | spam)', 'P(spam | marked)', 'P(spam)', 'P(marked)'],
          answer: 1,
          why: 'It is a statement about the emails that were marked: of those, how many are spam. That is P(spam | marked), the precision. P(marked | spam), the share of all spam that gets caught, is the recall, and it can be very different.',
        },
        { kind: 'number', id: 'maths-probability-4', ask: 'What is the expected value of one roll of a fair six-sided die?', answer: 3.5, check: 'np.mean([1, 2, 3, 4, 5, 6])', why: 'Each face has probability 1/6: (1+2+3+4+5+6)/6 = 3.5. An expected value is a long-run average and need not be a value that can actually occur.' },
        {
          kind: 'output',
          id: 'maths-probability-5',
          ask: 'Visitors and buyers by where they came from. What does this print?',
          code: `visits = {'ad': 30, 'organic': 70}
bought = {'ad': 3, 'organic': 14}

print(bought['ad'] / visits['ad'], bought['organic'] / visits['organic'])`,
          answer: '0.1 0.2',
          why: 'These are conditional probabilities: P(buy | ad) = 3/30 and P(buy | organic) = 14/70. Each divides by the size of its own group, not by all 100 visitors.',
        },
        {
          kind: 'choice',
          id: 'maths-probability-6',
          ask: 'In the figure, keep sensitivity at 90% and the false positive rate at 5%, and raise the base rate from 1% to 30%. What happens to P(sick | positive), and why?',
          options: [
            'It stays the same, because the test has not changed',
            'It rises sharply, because there are now far more real cases among the positives than false alarms',
            'It falls, because more people are sick',
            'It becomes exactly 90%',
          ],
          answer: 1,
          why: 'The test is the same but the population is not. With more real cases and fewer healthy people, true positives swamp the false ones. A model\'s precision depends on how common the positive class is where you deploy it.',
        },
        {
          kind: 'write',
          id: 'maths-probability-7',
          ask: 'Write Bayes\' rule for a detector: the probability that a flagged case is real.',
          starter: `def posterior(prior, sensitivity, false_positive_rate):
    # prior: share of cases that are real
    # sensitivity: share of real cases that get flagged
    # false_positive_rate: share of other cases that get flagged
    pass`,
          solution: `def posterior(prior, sensitivity, false_positive_rate):
    true_positives = prior * sensitivity
    false_positives = (1 - prior) * false_positive_rate
    return true_positives / (true_positives + false_positives)`,
          tests: `out = posterior(0.01, 0.9, 0.05)
assert out is not None, "the function returns nothing yet"
assert abs(out - 0.15384615) < 1e-6, f"1% base rate, 90% sensitivity, 5% false positives should give about 0.154, got {out}"
assert abs(posterior(0.5, 0.9, 0.1) - 0.9) < 1e-9, "at a 50% base rate with these numbers the answer is 0.9"
assert posterior(0.2, 0.8, 0.0) == 1.0, "with no false positives every flagged case is real"`,
          why: 'Flagged cases are real ones that were caught plus other ones flagged by mistake. The answer is the first group as a share of both.',
        },
        {
          kind: 'number',
          id: 'maths-probability-8',
          ask: 'Every support ticket gets exactly one label: billing (probability 0.2), bug (0.3) or other (0.5). What is the probability that a ticket is billing or bug?',
          answer: 0.5,
          check: '0.2 + 0.3',
          why: 'A ticket cannot be both, so the events are exclusive and their probabilities add: 0.2 + 0.3 = 0.5. Multiplying is for "both of two independent things", adding is for "either of two exclusive things".',
        },
        {
          kind: 'output',
          id: 'maths-probability-9',
          ask: 'The results of a fraud model on 1,000 transactions. What does this print?',
          code: `flagged_fraud, flagged_honest = 40, 60
missed_fraud, passed_honest = 10, 890

p_flagged_given_fraud = flagged_fraud / (flagged_fraud + missed_fraud)
p_fraud_given_flagged = flagged_fraud / (flagged_fraud + flagged_honest)
print(p_flagged_given_fraud, p_fraud_given_flagged)`,
          answer: '0.8 0.4',
          why: 'Of the 50 frauds, 40 were flagged: P(flagged | fraud) = 0.8. Of the 100 flagged, 40 were fraud: P(fraud | flagged) = 0.4. The same 40 on top, a different group underneath. "It catches 80% of fraud" and "60% of its alarms are false" describe the same model.',
        },
        {
          kind: 'bug',
          id: 'maths-probability-10',
          ask: 'This counts people to find the share of flagged cases that are real. Its answers are slightly too low.',
          code: `def share_real(prior, sensitivity, false_positive_rate, n=10000):
    real = n * prior
    caught = real * sensitivity
    false_alarms = n * false_positive_rate
    return caught / (caught + false_alarms)`,
          line: 4,
          fix: '    false_alarms = (n - real) * false_positive_rate',
          why: 'The false positive rate is conditional: it applies to the cases that are not real, not to everyone. With a 1% prior the slip is small (500 false alarms instead of 495), but at a 30% prior it counts 3,000 where there are 2,100.',
        },
        {
          kind: 'choice',
          id: 'maths-probability-11',
          ask: 'Two classifiers are each wrong on 10% of cases. A colleague says that if you only act when both agree, the two will both be wrong on 0.1 × 0.1 = 1% of cases. What is the flaw?',
          options: [
            'The probabilities should be added, giving 20%',
            'Multiplying assumes the errors are independent; models trained on similar data tend to fail on the same hard cases, so both are wrong together far more often than 1%',
            'There is no flaw: 1% is right',
            'Probabilities cannot be multiplied at all',
          ],
          answer: 1,
          why: 'The product rule holds only for independent events. Errors of similar models are strongly related: the blurry image fools both. This is why an ensemble helps most when its members are different from each other, and why redundancy bought from identical copies is worth little.',
        },
        {
          kind: 'write',
          id: 'maths-probability-12',
          ask: 'Count people. Given the base rate, the sensitivity and the false positive rate, split `n` cases into the four groups.',
          starter: `def count_people(prior, sensitivity, false_positive_rate, n=10000):
    # returns (true_positives, false_positives, false_negatives, true_negatives)
    pass`,
          solution: `def count_people(prior, sensitivity, false_positive_rate, n=10000):
    real = n * prior
    other = n - real
    true_positives = real * sensitivity
    false_positives = other * false_positive_rate
    return true_positives, false_positives, real - true_positives, other - false_positives`,
          tests: `out = count_people(0.01, 0.9, 0.05)
assert out is not None, "the function returns nothing yet"
assert len(out) == 4, "return four counts: (true positives, false positives, false negatives, true negatives)"
tp, fp, fn, tn = out
assert abs(tp - 90) < 1e-6, f"100 of 10,000 are real and 90% of them are caught: 90 true positives, got {tp}"
assert abs(fp - 495) < 1e-6, f"5% of the 9,900 others are flagged: 495 false positives, got {fp}"
assert abs(fn - 10) < 1e-6, f"the real cases that were missed: 10 false negatives, got {fn}"
assert abs(tn - 9405) < 1e-6, f"the others that were not flagged: 9,405 true negatives, got {tn}"
assert abs(sum(count_people(0.3, 0.8, 0.1, n=200)) - 200) < 1e-6, "the four groups should add up to n"
tp, fp, fn, tn = count_people(0.5, 1.0, 0.0, n=10)
assert abs(tp - 5) < 1e-6 and abs(tn - 5) < 1e-6 and abs(fp) < 1e-6 and abs(fn) < 1e-6, "a perfect detector at a 50% base rate gives 5 true positives and 5 true negatives out of 10"`,
          why: 'Split by what is true first, then split each group by what the detector says. Every question about a detector (its precision, how many alarms a team must review, how many cases slip through) can be read off these four counts.',
        },
      ],
    },
    {
      id: 'maths-distributions',
      title: 'Distributions, mean and variance',
      summary: 'Describing a column of numbers, and the bell curve that turns up everywhere.',
      widget: 'maths-normal',
      text: [
        'Before any modelling you look at each column of your data and ask where its values sit and how spread out they are. The **mean** is the balance point. The **variance** is the average squared distance from the mean, and the **standard deviation** is its square root, which is in the same units as the data.',
        'The **normal distribution** is the bell curve, fixed by its mean and standard deviation. About 68% of values fall within one standard deviation of the mean, 95% within two, and 99.7% within three. It shows up so often because sums and averages of many small effects drift towards it.',
        'A **z-score** says how many standard deviations a value is from the mean: `(x − mean) / std`. Doing that to a whole column is **standardising** it. Afterwards the column has mean 0 and standard deviation 1, and columns that used to be in different units can be compared, which is what gradient descent and distance-based models need.',
        'Real data is often not bell-shaped. Incomes, prices and counts have a long tail to the right. Then the mean is dragged towards the tail and the **median** (the middle value) describes a typical case better. Taking the logarithm of such a column often makes it close to normal.',
        'Two columns can move together. **Correlation** runs from −1 to 1 and measures how closely they follow a straight line. It says nothing about why: both may be driven by a third thing. A model will happily use a correlation that will not hold tomorrow.',
      ],
      rules: [
        'Mean: the balance point. Standard deviation: the typical distance from it.',
        '68 / 95 / 99.7% of a normal distribution lies within 1 / 2 / 3 standard deviations.',
        'z-score = `(x − mean) / std`. Standardising a column gives it mean 0 and std 1.',
        'Long tail: prefer the median, and try a log transform.',
        'Correlation is not causation.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'maths-distributions-1',
          ask: 'What is the variance of the values 2, 4, 6? (Divide by the number of values. Two decimals.)',
          answer: 2.6667,
          tol: 0.01,
          check: 'np.var([2, 4, 6])',
          why: 'The mean is 4. The squared distances are 4, 0 and 4, and their average is 8/3 ≈ 2.67.',
        },
        {
          kind: 'output',
          id: 'maths-distributions-2',
          ask: 'What does this print?',
          code: `import numpy as np

x = np.array([1.0, 2.0, 3.0, 4.0])
print(x.mean(), round(float(x.std()), 2))`,
          answer: '2.5 1.12',
          why: 'The mean is 2.5. The squared distances are 2.25, 0.25, 0.25 and 2.25, which average 1.25, and √1.25 ≈ 1.12.',
        },
        { kind: 'number', id: 'maths-distributions-3', ask: 'Scores have mean 100 and standard deviation 15. What is the z-score of 130?', answer: 2, why: '(130 − 100) / 15 = 2. The score is two standard deviations above the mean, higher than about 97.5% of scores if they are normally distributed.' },
        {
          kind: 'choice',
          id: 'maths-distributions-4',
          ask: 'In the figure, set the range from −2σ to +2σ around the mean. About how much of a normal distribution lies inside it?',
          options: ['68%', '90%', '95%', '99.7%'],
          answer: 2,
          why: 'About 95% lies within two standard deviations. This is where "plus or minus two standard errors" for a 95% interval comes from.',
        },
        {
          kind: 'choice',
          id: 'maths-distributions-5',
          ask: 'Nine people in a room earn about 40,000 a year. A tenth person who earns 10 million walks in. Which statement is right?',
          options: ['The mean and the median both barely change', 'The mean jumps to over a million; the median stays about 40,000', 'The median jumps; the mean barely changes', 'Both jump to over a million'],
          answer: 1,
          why: 'The mean adds everything up, so one extreme value drags it. The median only cares about the middle of the sorted list. For skewed columns, summarise and impute with the median.',
        },
        {
          kind: 'choice',
          id: 'maths-distributions-6',
          ask: 'Across a year, daily ice-cream sales and daily drownings are strongly correlated. What is the most sensible reading?',
          options: ['Ice cream causes drowning', 'Drowning causes ice-cream sales', 'Both go up in hot weather: a third factor drives the two', 'The correlation must be a calculation error'],
          answer: 2,
          why: 'A confounder (temperature) moves both. A model trained on such data can predict well and still be useless for deciding what to change. Features that are only correlated with the target are also the first to break when conditions shift.',
        },
        { kind: 'number', id: 'maths-distributions-7', ask: 'A yes/no outcome happens with probability 0.2. What is its variance?', answer: 0.16, why: 'For a yes/no (Bernoulli) outcome the variance is p(1 − p) = 0.2 × 0.8 = 0.16. It is largest at p = 0.5 and falls to 0 as the outcome becomes certain.' },
        {
          kind: 'write',
          id: 'maths-distributions-8',
          ask: 'Standardise a list of numbers: return their z-scores. Use the standard deviation that divides by the number of values.',
          starter: `def zscores(xs):
    # (x - mean) / std for every x
    pass`,
          solution: `def zscores(xs):
    mean = sum(xs) / len(xs)
    std = (sum((x - mean) ** 2 for x in xs) / len(xs)) ** 0.5
    return [(x - mean) / std for x in xs]`,
          tests: `out = zscores([2, 4, 6])
assert out is not None, "the function returns nothing yet"
assert len(out) == 3, "one z-score per value"
assert abs(out[1]) < 1e-9, "the mean value should get a z-score of 0"
assert abs(out[2] - 1.2247448714) < 1e-6, f"6 should get about 1.2247, got {out[2]}"
z = zscores([10, 20, 30, 40, 100])
assert abs(sum(z)) < 1e-9, "z-scores should have mean 0"
assert abs(sum(v * v for v in z) / len(z) - 1) < 1e-9, "z-scores should have standard deviation 1"`,
          why: 'Subtract the mean, divide by the standard deviation. In a real pipeline the mean and standard deviation come from the training data only and are reused on the test data.',
        },
        {
          kind: 'output',
          id: 'maths-distributions-9',
          ask: 'What does this print?',
          code: `import numpy as np

x = np.array([1, 2, 3, 4, 100])
print(x.mean(), np.median(x))`,
          answer: '22.0 3.0',
          why: 'The values add up to 110, so the mean is 22: larger than four of the five values. The median is the middle of the sorted list, 3, and would still be 3 if the 100 were a million.',
        },
        {
          kind: 'bug',
          id: 'maths-distributions-10',
          ask: 'Standardising the columns of a training set and a test set before fitting a model.',
          code: `def scale(train, test):
    mean, std = train.mean(axis=0), train.std(axis=0)
    train_scaled = (train - mean) / std
    test_scaled = (test - test.mean(axis=0)) / test.std(axis=0)
    return train_scaled, test_scaled`,
          line: 4,
          fix: '    test_scaled = (test - mean) / std',
          why: 'The test set must go through exactly the transformation the model was trained with. Scaled by its own statistics, a value of 0 means something different in the two sets, and in production a single new row has no mean or standard deviation of its own at all.',
        },
        {
          kind: 'number',
          id: 'maths-distributions-11',
          ask: 'Heights are normally distributed with mean 170 cm and standard deviation 10 cm. Using the 68 / 95 / 99.7 rule, what fraction of people are taller than 190 cm?',
          answer: 0.025,
          tol: 0.005,
          check: '(1 - math.erf(2 / math.sqrt(2))) / 2',
          hint: '190 is two standard deviations above the mean. The curve is symmetric.',
          why: '95% lie within two standard deviations, so 5% lie outside, split evenly between the two tails: about 2.5% above 190. (The exact figure is 2.3%.) The same sum tells you how many "outliers" to expect from a column that is perfectly healthy.',
        },
        {
          kind: 'choice',
          id: 'maths-distributions-12',
          ask: 'A column of house prices has most values between 100,000 and 500,000 and a few at 20 million. You want to use it in a linear model. What is the usual first step?',
          options: [
            'Use it as it is: the model will cope',
            'Take the logarithm of the column, which pulls in the long tail and makes it closer to a bell curve',
            'Delete every row above the mean',
            'Replace every value by the mean',
          ],
          answer: 1,
          why: 'On a log scale, 100,000 to 1 million is the same distance as 1 million to 10 million, so the few huge values stop dominating the mean, the standard deviation and the squared error. Standardising alone does not help: it moves and rescales the column but keeps its lopsided shape.',
        },
      ],
    },
    {
      id: 'maths-sampling',
      title: 'Sampling, noise and confidence',
      summary: 'How far to trust a number that was measured on a sample, such as a test accuracy.',
      widget: 'maths-clt',
      text: [
        'Every metric you report was measured on a sample: a test set, a week of traffic, the users in an experiment. Measure it again on a different sample and you get a different number. The question that separates careful engineers from the rest is: how different?',
        'The **standard error** answers it. For an average of `n` values with standard deviation `σ`, the average itself wobbles with standard deviation `σ / √n`. The figure shows this: averages of bigger samples cluster more tightly, and they form a bell curve whatever the data looked like (the central limit theorem).',
        'A rough **95% confidence interval** is the measured value plus or minus two standard errors. For an accuracy or any other proportion `p` measured on `n` examples, the standard error is `√(p(1 − p) / n)`. An accuracy of 90% on 100 test examples is really "somewhere between 84% and 96%".',
        'So a model that scores 91% is not shown to be better than one that scores 90% on a few hundred examples: the difference is inside the noise. Because the error shrinks with the square root of `n`, halving it takes four times the data.',
        'A **p-value** is the probability of seeing a difference at least this large if there were truly no difference. It is not the probability that the result is real. And if you try twenty ideas and keep whichever passes `p < 0.05`, you should expect one to pass by luck alone.',
      ],
      rules: [
        'Standard error of an average: `σ / √n`.',
        'Standard error of a proportion: `√(p(1 − p) / n)`.',
        '95% interval ≈ value ± 2 standard errors.',
        'To halve the noise you need four times the data.',
        'Compare the difference between two models with the noise before you believe it.',
        'Try many things and some will look significant by chance.',
      ],
      questions: [
        { kind: 'number', id: 'maths-sampling-1', ask: 'Values have standard deviation 10. What is the standard error of the average of 100 of them?', answer: 1, why: 'σ / √n = 10 / √100 = 1.' },
        {
          kind: 'number',
          id: 'maths-sampling-2',
          ask: 'A model gets 90% accuracy on a test set of 100 examples. What is the standard error of that accuracy?',
          answer: 0.03,
          tol: 0.002,
          check: 'math.sqrt(0.9 * 0.1 / 100)',
          why: '√(0.9 × 0.1 / 100) = √0.0009 = 0.03. So the 95% interval is roughly 84% to 96%: a wide range for a number usually quoted as "90%".',
        },
        {
          kind: 'choice',
          id: 'maths-sampling-3',
          ask: 'On a test set of 200 examples, model A scores 91% and model B scores 90%. What can you conclude?',
          options: ['A is better', 'B is better', 'Nothing yet: the standard error of each score is about 2%, so a 1% gap is well inside the noise', 'The two models are identical'],
          answer: 2,
          why: '√(0.9 × 0.1 / 200) ≈ 0.021. A gap of half a standard error tells you nothing. You need a much larger test set, or a paired comparison on the same examples.',
        },
        {
          kind: 'choice',
          id: 'maths-sampling-4',
          ask: 'An A/B test reports p = 0.03 for the new model. What does that mean?',
          options: [
            'There is a 97% chance the new model is better',
            'There is a 3% chance the new model is better',
            'If there were really no difference, a gap this large or larger would show up about 3% of the time',
            'The new model is 3% better',
          ],
          answer: 2,
          why: 'A p-value is computed assuming no difference. It says how surprising the data would be in that case. It is not the probability that the result is true, and it says nothing about how big the effect is.',
        },
        {
          kind: 'choice',
          id: 'maths-sampling-5',
          ask: 'In the figure, the spread of the averages is about 0.32 at n = 10. Roughly what sample size brings it down to 0.16?',
          options: ['15', '20', '40', '100'],
          answer: 2,
          why: 'The spread goes as 1/√n. Halving it needs four times the sample: 40.',
        },
        {
          kind: 'output',
          id: 'maths-sampling-6',
          ask: 'What does this print?',
          code: `import math

p, n = 0.8, 400
se = math.sqrt(p * (1 - p) / n)
print(round(se, 3), round(1.96 * se, 3))`,
          answer: '0.02 0.039',
          why: '√(0.8 × 0.2 / 400) = √0.0004 = 0.02. The half-width of the 95% interval is 1.96 × 0.02 ≈ 0.039: the accuracy is 80% give or take about 4 points.',
        },
        {
          kind: 'choice',
          id: 'maths-sampling-7',
          ask: 'You try 20 different features, one at a time, and test each for an improvement at p < 0.05. Exactly one passes. What is the sensible reaction?',
          options: [
            'Ship it: it passed the test',
            'Be suspicious: with 20 tries you expect about one to pass by chance even if none of them helps',
            'The test was done incorrectly',
            'All 20 features should be shipped',
          ],
          answer: 1,
          why: 'At a 5% threshold, 20 useless ideas produce one false "win" on average. Confirm the winner on fresh data before believing it. The same thing happens when you tune on the test set: the best of many tries looks better than it is.',
        },
        {
          kind: 'write',
          id: 'maths-sampling-8',
          ask: 'Return a 95% confidence interval for an accuracy, given how many answers were correct out of n. Use the value ± 1.96 standard errors.',
          starter: `import math

def accuracy_interval(correct, n):
    # returns (low, high)
    pass`,
          solution: `import math

def accuracy_interval(correct, n):
    p = correct / n
    se = math.sqrt(p * (1 - p) / n)
    return p - 1.96 * se, p + 1.96 * se`,
          tests: `out = accuracy_interval(90, 100)
assert out is not None, "the function returns nothing yet"
low, high = out
assert abs(low - 0.8412) < 1e-3 and abs(high - 0.9588) < 1e-3, f"90 of 100 should give about (0.841, 0.959), got {out}"
low, high = accuracy_interval(9000, 10000)
assert abs((high - low) - 0.01176) < 1e-4, "with 100 times the data the interval should be 10 times narrower"
low, high = accuracy_interval(50, 100)
assert abs((low + high) / 2 - 0.5) < 1e-9, "the interval should be centred on the measured accuracy"`,
          why: 'The proportion, its standard error, and two of those either side. Put an interval next to every metric you report and most arguments about which model is better settle themselves.',
        },
        {
          kind: 'number',
          id: 'maths-sampling-9',
          ask: 'You test 20 ideas that in truth do nothing, each at p < 0.05, and the tests are independent. What is the probability that at least one of them passes? (Two decimals.)',
          answer: 0.64,
          tol: 0.01,
          check: '1 - 0.95 ** 20',
          hint: 'Work out the probability that none passes, then subtract from 1.',
          why: 'Each test stays quiet with probability 0.95, so all twenty stay quiet with probability 0.95²⁰ ≈ 0.36. The chance of at least one false win is 0.64: more likely than not. The same holds for 20 hyperparameter settings compared on one validation set.',
        },
        {
          kind: 'output',
          id: 'maths-sampling-10',
          ask: 'The standard error of an average, for three sample sizes. What does this print?',
          code: `import math

sigma = 12
for n in (9, 36, 144):
    print(sigma / math.sqrt(n))`,
          answer: '4.0\n2.0\n1.0',
          why: '12/3, 12/6 and 12/12. Each time the sample is made four times larger the noise halves. Going from 9 to 144 examples, 16 times the data, buys only a factor of 4 in precision.',
        },
        {
          kind: 'bug',
          id: 'maths-sampling-11',
          ask: 'The standard error of an accuracy. It reports errors that are far too small, so every difference looks significant.',
          code: `import math

def accuracy_se(correct, n):
    p = correct / n
    return math.sqrt(p * (1 - p)) / n`,
          line: 5,
          fix: '    return math.sqrt(p * (1 - p) / n)',
          why: 'The n belongs inside the square root: the error shrinks with √n, not with n. As written, 90 correct out of 100 gives 0.003 instead of 0.03, and an interval ten times too narrow.',
        },
        {
          kind: 'write',
          id: 'maths-sampling-12',
          ask: 'Return a 95% confidence interval for the average of a list of measurements, such as response times: the mean ± 1.96 standard errors. Use the standard deviation that divides by the number of values.',
          starter: `import math

def mean_interval(values):
    # returns (low, high)
    pass`,
          solution: `import math

def mean_interval(values):
    n = len(values)
    mean = sum(values) / n
    std = math.sqrt(sum((v - mean) ** 2 for v in values) / n)
    se = std / math.sqrt(n)
    return mean - 1.96 * se, mean + 1.96 * se`,
          tests: `out = mean_interval([4, 6] * 8)
assert out is not None, "the function returns nothing yet"
low, high = out
assert abs((low + high) / 2 - 5) < 1e-9, "the interval should be centred on the mean, 5"
assert abs(low - 4.51) < 1e-9 and abs(high - 5.49) < 1e-9, f"16 values with standard deviation 1 have standard error 0.25, so the interval is (4.51, 5.49), got {out}"
low, high = mean_interval([4, 6] * 32)
assert abs((high - low) - 0.49) < 1e-9, "with four times the data the interval should be half as wide: is the standard error std / sqrt(n)?"
low, high = mean_interval([3, 3, 3])
assert low == 3 and high == 3, "values with no spread give an interval of zero width"`,
          why: 'The standard deviation describes the spread of single values. Dividing by √n turns it into the spread of their average. A latency of "5 ms give or take half a millisecond" is a claim you can compare with another system. A bare "5 ms" is not.',
        },
      ],
    },
    {
      id: 'maths-entropy',
      title: 'Likelihood, cross-entropy and softmax',
      summary: 'Where the loss function of every classifier comes from.',
      widget: 'maths-entropy',
      text: [
        'A classifier outputs probabilities. To train it you need one number that says how good those probabilities were. The natural choice is the **likelihood**: the probability the model gave to what actually happened. A model that said 0.9 for the right answer did better than one that said 0.6.',
        'Over a dataset the likelihoods multiply, and a product of thousands of numbers below 1 underflows to zero. Take the logarithm and the product becomes a sum. Flip the sign so that smaller is better, and you have the **negative log-likelihood**: for each example, `−log(probability given to the true class)`. That is the **cross-entropy loss**.',
        'Look at what `−log` does. A probability of 1 for the truth costs 0. A probability of 0.5 costs 0.69. A probability of 0.01 costs 4.6. The loss punishes confident mistakes very hard, which is why a single mislabelled example can dominate a batch.',
        '**Entropy** is the cross-entropy of the truth with itself: the loss that even a perfect model is left with, because the outcome is uncertain. The gap between a model\'s cross-entropy and the entropy is the **KL divergence**. The figure shows all three.',
        'A network\'s last layer produces arbitrary scores, called **logits**. **Softmax** turns them into probabilities: exponentiate each, then divide by the total. Larger scores get larger shares, everything is positive, and the shares add up to 1.',
        { code: `def softmax(z):
    z = z - z.max()          # the result is the same, and exp cannot overflow
    e = np.exp(z)
    return e / e.sum()` },
      ],
      rules: [
        'Cross-entropy loss for one example: `−log(p of the true class)`.',
        'Confident and wrong is punished far harder than unsure.',
        'Minimising cross-entropy is the same as maximising likelihood.',
        'Softmax: exponentiate, then divide by the sum. Only differences between logits matter.',
        'Subtract the largest logit before exponentiating, so that nothing overflows.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'maths-entropy-1',
          ask: 'A model gives probability 0.5 to the true class. What is the cross-entropy loss for that example, using the natural logarithm? (Two decimals.)',
          answer: 0.6931,
          tol: 0.01,
          check: '-math.log(0.5)',
          why: '−ln(0.5) ≈ 0.69. This is also the loss of a model that always answers "50/50" on a two-class problem: a useful number to recognise when a classifier is not learning.',
        },
        {
          kind: 'choice',
          id: 'maths-entropy-2',
          ask: 'Model A gives the true class a probability of 0.4 on two examples. Model B gives it 0.99 on one and 0.01 on the other. Which has the lower total cross-entropy?',
          options: ['A: about 1.83 against about 4.62', 'B: it is nearly certain on one example', 'They are equal', 'It cannot be said without the labels'],
          answer: 0,
          why: 'A: 2 × −ln(0.4) ≈ 1.83. B: −ln(0.99) − ln(0.01) ≈ 0.01 + 4.61. One confident mistake costs more than two unsure answers. Cross-entropy rewards honest uncertainty.',
        },
        {
          kind: 'output',
          id: 'maths-entropy-3',
          ask: 'What does this print?',
          code: `import numpy as np

z = np.array([2.0, 2.0])
p = np.exp(z) / np.exp(z).sum()
print(p)`,
          answer: '[0.5 0.5]',
          why: 'Equal logits get equal shares, whatever their value. Softmax only looks at the differences between the scores.',
        },
        {
          kind: 'choice',
          id: 'maths-entropy-4',
          ask: 'You add 10 to every logit before the softmax. What happens to the probabilities?',
          options: ['They all increase', 'They move closer to equal', 'Nothing: they are unchanged', 'The largest one becomes 1'],
          answer: 2,
          why: 'Every exponential is multiplied by the same factor e¹⁰, which cancels in the division. This is why subtracting the maximum logit first is safe, and why it is done: it prevents overflow.',
        },
        {
          kind: 'bug',
          id: 'maths-entropy-5',
          ask: 'The cross-entropy loss for one example. Training with it makes the model worse and worse.',
          code: `import math

def cross_entropy(probs, label):
    # probs: the predicted probability of each class
    # label: the index of the true class
    return math.log(probs[label])`,
          line: 6,
          fix: '    return -math.log(probs[label])',
          why: 'The log of a probability is negative or zero. Without the minus sign, the "loss" is lowest when the true class gets a probability near 0, so minimising it teaches the model to be wrong.',
        },
        {
          kind: 'choice',
          id: 'maths-entropy-6',
          ask: 'A coin lands heads 7 times in 10 flips. Which value of P(heads) makes that outcome most likely?',
          options: ['0.5, because coins are fair', '0.7', '1.0', 'Any value: the flips are random'],
          answer: 1,
          why: 'The maximum-likelihood estimate of a probability is the observed frequency, 7/10. Fitting a classifier with cross-entropy does the same thing with a far more flexible model: it finds the parameters under which the observed labels are most probable.',
        },
        {
          kind: 'choice',
          id: 'maths-entropy-7',
          ask: 'In the figure, set the true rate p to 0.5. The entropy line sits at about 0.69 and no setting of q gets the loss below it. What does that mean in practice?',
          options: [
            'The model is broken',
            'When the outcome is truly a coin flip given the inputs, no model can have a loss below 0.69: some loss is noise that cannot be removed',
            'More training will bring the loss to 0',
            'The learning rate is too low',
          ],
          answer: 1,
          why: 'Entropy is the floor. A loss that stops falling above zero is not always underfitting: the labels may simply not be determined by the features. Knowing roughly where the floor is tells you when to stop tuning.',
        },
        {
          kind: 'write',
          id: 'maths-entropy-8',
          ask: 'Write softmax for a list of numbers, without NumPy. It must not overflow on large inputs.',
          starter: `import math

def softmax(zs):
    # exponentiate, then divide by the total
    pass`,
          solution: `import math

def softmax(zs):
    top = max(zs)
    exps = [math.exp(z - top) for z in zs]
    total = sum(exps)
    return [e / total for e in exps]`,
          tests: `out = softmax([0.0, 0.0])
assert out is not None, "the function returns nothing yet"
assert all(abs(p - 0.5) < 1e-9 for p in out), "equal scores should get equal probabilities"
out = softmax([1.0, 2.0, 3.0])
assert abs(sum(out) - 1) < 1e-9, "the probabilities should add up to 1"
assert abs(out[2] - 0.6652409558) < 1e-6, f"softmax([1, 2, 3])[2] should be about 0.6652, got {out[2]}"
try:
    big = softmax([1000.0, 1000.0])
except OverflowError:
    raise AssertionError("overflow on large scores: subtract the largest score before exponentiating")
assert all(abs(p - 0.5) < 1e-9 for p in big), "softmax([1000, 1000]) should be [0.5, 0.5]"`,
          why: 'math.exp(1000) overflows. Subtracting the largest score first makes the largest exponent 0 and changes nothing else, because softmax depends only on differences.',
        },
        {
          kind: 'number',
          id: 'maths-entropy-9',
          ask: 'A 10-class classifier has not learned anything yet and gives every class the same probability. What is its cross-entropy loss? (Natural logarithm, two decimals.)',
          answer: 2.3026,
          tol: 0.01,
          check: '-math.log(1 / 10)',
          why: 'Each class gets 0.1, so the loss is −ln(0.1) = ln(10) ≈ 2.30. For K classes it is ln(K). Check the first loss a new model prints against this number: well above it means the initial outputs are confidently wrong, and stuck at it means nothing is being learned.',
        },
        {
          kind: 'output',
          id: 'maths-entropy-10',
          ask: 'A model gave probability 0.01 to the true class on each of 200 examples. The likelihood of the dataset, two ways. What does this print?',
          code: `import math

probs = [0.01] * 200
product = 1.0
for p in probs:
    product *= p
total = sum(math.log(p) for p in probs)
print(product, round(total))`,
          answer: '0.0 -921',
          hint: 'The smallest positive float is about 1e-308. And ln(0.01) ≈ −4.605.',
          why: 'The product is 10⁻⁴⁰⁰, far below what a float can hold, so it underflows to exactly 0 and all information is lost. The sum of logs is 200 × −4.605 ≈ −921, an ordinary number. This is why losses are sums of logs and never products of probabilities.',
        },
        {
          kind: 'bug',
          id: 'maths-entropy-11',
          ask: 'The average cross-entropy over a batch. It returns a number, but not the right one.',
          code: `import numpy as np

def cross_entropy(probs, labels):
    # probs: (n, classes)   labels: (n,), the index of the true class of each row
    picked = probs[:, labels]
    return -np.log(picked).mean()`,
          line: 5,
          fix: '    picked = probs[np.arange(len(labels)), labels]',
          why: '`probs[:, labels]` takes those columns from every row and gives an (n, n) array: each row scored against every example\'s label. Pairing a row index with each label picks one probability per row, shape (n,). Another shape bug that does not crash.',
        },
        {
          kind: 'write',
          id: 'maths-entropy-12',
          ask: 'Write the cross-entropy loss for one example straight from the logits, without NumPy. It must work when the logits are large, and when the true class has a probability too small for a float.',
          starter: `import math

def cross_entropy(zs, label):
    # zs: the logits, one per class   label: the index of the true class
    # -log(softmax(zs)[label]), computed without forming the probabilities
    pass`,
          solution: `import math

def cross_entropy(zs, label):
    top = max(zs)
    log_total = top + math.log(sum(math.exp(z - top) for z in zs))
    return log_total - zs[label]`,
          tests: `out = cross_entropy([0.0, 0.0], 0)
assert out is not None, "the function returns nothing yet"
assert abs(out - 0.6931471806) < 1e-9, f"equal logits for two classes should give ln(2) = 0.6931, got {out}"
assert abs(cross_entropy([1.0, 2.0, 3.0], 2) - 0.4076059644) < 1e-9, "for logits [1, 2, 3] and label 2 the loss is about 0.4076"
assert abs(cross_entropy([11.0, 12.0, 13.0], 2) - 0.4076059644) < 1e-9, "adding 10 to every logit should not change the loss"
try:
    easy = cross_entropy([1000.0, 0.0], 0)
except OverflowError:
    raise AssertionError("overflow on large logits: subtract the largest logit before exponentiating")
assert abs(easy) < 1e-9, "when the true class has by far the largest logit the loss is 0"
try:
    hard = cross_entropy([1000.0, 0.0], 1)
except ValueError:
    raise AssertionError("log(0): the probability of the true class underflowed. Use log(softmax) = z[label] - log(sum(exp(z))) instead of taking the log of a probability")
assert abs(hard - 1000) < 1e-6, f"when the true class is 1000 below the top logit the loss is 1000, got {hard}"`,
          hint: 'log(softmax(z)[k]) = z[k] − log(Σ exp(z)). And log(Σ exp(z)) = top + log(Σ exp(z − top)).',
          why: 'Computing probabilities first and taking the log afterwards breaks when a probability underflows to 0. Working with logs throughout never forms that probability. This is why framework loss functions take logits, not probabilities, and why you should not put a softmax in front of them.',
        },
      ],
    },
    {
      id: 'maths-eigen',
      title: 'Eigenvectors, covariance and the SVD',
      summary: 'The directions a matrix only stretches, and how they find the directions that matter in data.',
      text: [
        'Most vectors change direction when a matrix acts on them. A few do not: they come out along the same line, only longer, shorter or flipped. Such a vector is an **eigenvector** of the matrix, and the factor it is scaled by is its **eigenvalue**: `A @ v = λ v`. For `[[2, 1], [1, 2]]` the vector (1, 1) comes out as (3, 3), so it is an eigenvector with eigenvalue 3. The vector (1, −1) comes out unchanged: eigenvalue 1.',
        'The matrix this matters most for is the **covariance matrix** of a dataset. Subtract the mean of every column, then `C = Xc.T @ Xc / n`. The diagonal holds the variance of each feature, and the other entries say how two features move together. `C` is symmetric, so its eigenvectors are at right angles to each other and its eigenvalues are real and never negative.',
        'The eigenvector of `C` with the largest eigenvalue is the direction along which the data varies most, and the eigenvalue is the variance along it. The next eigenvector is the best direction at right angles to the first, and so on. **PCA** keeps the top `k` directions and describes each row by its coordinates along them. The share of the variance kept is the sum of the kept eigenvalues over the sum of all of them. PCA follows variance, so a feature in large units dominates: standardise first unless the units are comparable.',
        { code: `Xc = X - X.mean(axis=0)           # centre the columns first
C = Xc.T @ Xc / len(X)            # (d, d)
vals, vecs = np.linalg.eigh(C)    # ascending: the top direction is the last column
top = vecs[:, ::-1][:, :k]        # (d, k), largest first
Z = Xc @ top                      # (n, k): the compressed data` },
        'The **singular value decomposition** does a similar job for any matrix, square or not: `A = U @ diag(s) @ Vt`, with the singular values `s` sorted from largest to smallest. Keep only the first `k` and you have the closest matrix of rank `k` to `A`. A matrix of shape (m, n) stored that way costs about `k × (m + n)` numbers instead of `m × n`.',
        'These ideas turn up all over practical work. PCA is used to shrink embeddings and to draw high-dimensional data in two dimensions. LoRA fine-tunes a large model by learning a low-rank update `B @ A` to a weight matrix instead of the whole matrix. And the ratio of the largest to the smallest singular value, the **condition number**, says how stretched a problem is: when it is huge, gradient descent crawls, and a least-squares solution swings with tiny changes in the data.',
      ],
      rules: [
        '`A @ v = λ v`: an eigenvector keeps its direction, and the eigenvalue is the stretch.',
        'Covariance: centre the columns, then `Xc.T @ Xc / n`. Symmetric, with eigenvalues that are never negative.',
        'The top eigenvector of the covariance is the direction of greatest variance. That is PCA.',
        'Centre, and usually standardise, before PCA. `np.linalg.eigh` returns eigenvalues in ascending order.',
        'Keeping the `k` largest singular values gives the best approximation of rank `k`.',
        'Condition number = largest ÷ smallest singular value. Large means slow gradient descent and unstable solutions.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'maths-eigen-1',
          ask: '(1, 1) is an eigenvector of [[4, 1], [2, 3]]. What is its eigenvalue?',
          answer: 5,
          check: '(np.array([[4, 1], [2, 3]]) @ np.array([1, 1]))[0] / 1',
          hint: 'Multiply the matrix by the vector and see how much longer it came out.',
          why: 'The matrix sends (1, 1) to (4 + 1, 2 + 3) = (5, 5), which is 5 × (1, 1). Same direction, five times as long: the eigenvalue is 5.',
        },
        {
          kind: 'output',
          id: 'maths-eigen-2',
          ask: 'Three vectors go through the same matrix. What does this print?',
          code: `import numpy as np

A = np.array([[3, 1],
              [0, 2]])
for v in ([1, 0], [0, 1], [1, -1]):
    print((A @ np.array(v)).tolist())`,
          answer: '[3, 0]\n[1, 2]\n[2, -2]',
          why: '(1, 0) comes out as (3, 0) and (1, −1) as (2, −2): both kept their direction, so they are eigenvectors, with eigenvalues 3 and 2. (0, 1) comes out as (1, 2), which points somewhere new, so it is not one.',
        },
        {
          kind: 'choice',
          id: 'maths-eigen-3',
          ask: 'The matrix [[0, −1], [1, 0]] turns every vector by 90° (the Rotate preset in the figure of the matrices lesson). How many directions does it leave unchanged?',
          options: ['Every direction', 'Two: along the axes', 'None: every arrow is turned, so it has no real eigenvectors', 'One: the direction (1, 1)'],
          answer: 2,
          why: 'An eigenvector must come out along its own line, and a quarter turn moves every line. Not every matrix has real eigenvectors. Symmetric matrices, such as a covariance matrix, always have a full set, which is why PCA always works.',
        },
        {
          kind: 'output',
          id: 'maths-eigen-4',
          ask: 'A dataset of four rows and two features. What does this print?',
          code: `import numpy as np

X = np.array([[0.0, 0.0],
              [2.0, 4.0],
              [4.0, 8.0],
              [2.0, 4.0]])
Xc = X - X.mean(axis=0)
C = Xc.T @ Xc / len(X)
print(C.tolist())`,
          answer: '[[2.0, 4.0], [4.0, 8.0]]',
          hint: 'The column means are 2 and 4. Centre first, then each entry of C is an average of products.',
          why: 'Centred, the rows are (−2, −4), (0, 0), (2, 4), (0, 0). The variances are 8/4 = 2 and 32/4 = 8, and the covariance is 16/4 = 4. The second feature is exactly twice the first, so the determinant of C is 0: all the variance lies along one direction, (1, 2).',
        },
        {
          kind: 'number',
          id: 'maths-eigen-5',
          ask: 'The covariance matrix of three features has eigenvalues 6, 3 and 1. What share of the variance is kept if you reduce the data to its top two principal components?',
          answer: 0.9,
          check: '(6 + 3) / (6 + 3 + 1)',
          why: 'Each eigenvalue is the variance along its direction. The total is 10 and the top two hold 9 of it: 90%. This ratio, the explained variance, is how you choose how many components to keep.',
        },
        {
          kind: 'output',
          id: 'maths-eigen-6',
          ask: 'What does this print?',
          code: `import numpy as np

C = np.array([[2.0, 1.0],
              [1.0, 2.0]])
vals, vecs = np.linalg.eigh(C)
print(vals.round(2).tolist())`,
          answer: '[1.0, 3.0]',
          why: 'The eigenvalues are 1 (for the direction (1, −1)) and 3 (for (1, 1)). `eigh` returns them smallest first, so the direction of greatest variance is the last column of `vecs`, not the first.',
        },
        {
          kind: 'bug',
          id: 'maths-eigen-7',
          ask: 'PCA: reduce the data to its `k` most informative directions. The output has the right shape but keeps almost none of the variance.',
          code: `import numpy as np

def pca(X, k):
    Xc = X - X.mean(axis=0)
    C = Xc.T @ Xc / len(X)
    vals, vecs = np.linalg.eigh(C)
    top = vecs[:, :k]
    return Xc @ top`,
          line: 7,
          fix: '    top = vecs[:, ::-1][:, :k]',
          why: '`eigh` sorts eigenvalues in ascending order, so the first `k` columns are the directions of least variance. Reverse the columns before taking `k` of them. Nothing crashes, and the result looks like valid PCA output: check the explained variance.',
        },
        {
          kind: 'choice',
          id: 'maths-eigen-8',
          ask: 'You run PCA on customer data with two columns: age in years and income in pounds a year. The first component turns out to be almost exactly the income column. Why?',
          options: [
            'Income is the most important feature for the business',
            'Income is measured in much larger numbers, so it has by far the larger variance, and PCA follows variance',
            'PCA always returns the last column first',
            'Age and income are uncorrelated',
          ],
          answer: 1,
          why: 'Variance depends on units: incomes vary by tens of thousands, ages by tens. PCA has no idea which feature matters, only which one has the biggest numbers. Standardise the columns first, so that each has variance 1, and the components reflect how features move together.',
        },
        {
          kind: 'output',
          id: 'maths-eigen-9',
          ask: 'The singular values of a 3 by 2 matrix. What does this print?',
          code: `import numpy as np

A = np.array([[0.0, 2.0],
              [3.0, 0.0],
              [0.0, 0.0]])
s = np.linalg.svd(A, compute_uv=False)
print(s.round(2).tolist())`,
          answer: '[3.0, 2.0]',
          why: 'This matrix stretches one direction by 3 and the other by 2. Singular values are those stretch factors, always returned largest first (the opposite order to `eigh`), and they exist for a matrix of any shape.',
        },
        {
          kind: 'number',
          id: 'maths-eigen-10',
          ask: 'A weight matrix in a large model is 1,000 by 1,000. LoRA leaves it frozen and learns an update `B @ A` with `B` of shape (1000, 8) and `A` of shape (8, 1000). How many numbers are trained?',
          answer: 16000,
          check: '1000 * 8 + 8 * 1000',
          why: '8,000 in each factor: 16,000 instead of 1,000,000, under 2% of the matrix. The product `B @ A` is still 1,000 by 1,000 but has rank at most 8. The bet is that the change a fine-tune needs is close to low-rank, which in practice it often is.',
        },
        {
          kind: 'choice',
          id: 'maths-eigen-11',
          ask: 'The loss surface of a regression has curvature 1,000 in its steepest direction and 0.001 in its shallowest, a condition number of a million. What does plain gradient descent do?',
          options: [
            'It converges in one step',
            'The learning rate has to be small enough for the steep direction, and at that rate progress along the shallow direction is almost nil',
            'It diverges whatever the learning rate',
            'The condition number has no effect on training',
          ],
          answer: 1,
          why: 'The steepest direction caps the learning rate, and the shallowest then needs on the order of a million steps. This is the stretched valley of the gradient-descent lesson, with a number on it. Standardising features, removing near-duplicate columns and adding a little regularisation all bring the condition number down.',
        },
        {
          kind: 'write',
          id: 'maths-eigen-12',
          numpy: true,
          ask: 'Return the best rank-`k` approximation of a matrix: keep its `k` largest singular values and drop the rest.',
          starter: `import numpy as np

def low_rank(A, k):
    U, s, Vt = np.linalg.svd(A, full_matrices=False)   # A == (U * s) @ Vt
    # keep the first k columns of U, values of s and rows of Vt
    pass`,
          solution: `import numpy as np

def low_rank(A, k):
    U, s, Vt = np.linalg.svd(A, full_matrices=False)
    return (U[:, :k] * s[:k]) @ Vt[:k]`,
          tests: `A = np.array([[3.0, 0.0], [0.0, 1.0], [0.0, 0.0]])
out = low_rank(A, 1)
assert out is not None, "the function returns nothing yet"
assert out.shape == A.shape, f"the approximation has the same shape as A, {A.shape}, got {out.shape}"
assert np.allclose(out, [[3, 0], [0, 0], [0, 0]]), "with one singular value kept, this matrix keeps its 3 and loses its 1"
assert np.allclose(low_rank(A, 2), A), "with every singular value kept you should get A back"
B = np.outer([1.0, 2.0, 3.0], [1.0, -1.0, 2.0, 0.5]) + 0.01 * np.arange(12.0).reshape(3, 4)
R = low_rank(B, 1)
assert np.linalg.matrix_rank(R) == 1, "low_rank(B, 1) should have rank 1"
assert np.abs(R - B).max() < 0.1, "a matrix that is nearly rank 1 should be close to its rank-1 approximation"`,
          why: 'Singular values come sorted, so the first `k` carry the most. Slicing all three factors to `k` and multiplying them back gives a full-size matrix built from `k × (m + n + 1)` numbers. Image compression, embedding compression and LoRA all rest on this.',
        },
      ],
    },
    {
      id: 'maths-lab',
      title: 'Lab: linear regression from nothing but NumPy',
      summary: 'Predictions, loss, gradients, a gradient check, a training loop and the exact answer to compare it with.',
      text: [
        'Linear regression is the smallest model that has every part of a real one: predictions, a loss, gradients, an update and a training loop. This lab builds it with NumPy and nothing else. By the end you will have trained it, tested its gradients and checked the result against the exact answer.',
        'The model predicts `X @ w + b`: one dot product per row, plus a bias. The loss is the **mean squared error**, the average of `(prediction − target)²`. Its gradients follow from the chain rule. With `err = pred − y`, they are `∂L/∂w = 2 · X.T @ err / n` and `∂L/∂b = 2 · mean(err)`.',
        'Hand-written gradients are where bugs hide, so you test them before you train. Nudge each weight by a small `h` in both directions, measure the slope of the loss, and compare it with what the formula says. This is a **gradient check**.',
        'Training is the line `w = w − lr · gradient` in a loop. The data in this lab is made from known weights, w = (2, −1) and b = 0.5, with no noise, so you can see whether the loop finds them. Testing a training loop on data with a known answer is a habit worth keeping.',
        'Two more steps make it real. Features on very different scales stretch the loss surface and force a tiny learning rate, so you standardise them first. And linear regression has an exact answer, the **least-squares solution**: add a column of ones to `X` to make `A`, and solve `AᵀA θ = Aᵀy`. Gradient descent should land on the same numbers. Most models have no such formula, which is why the loop is the part you carry forward.',
      ],
      rules: [
        'Model: `X @ w + b`. Loss: `mean((pred − y)²)`.',
        'Gradients: `2 * X.T @ err / n` for `w` and `2 * err.mean()` for `b`, where `err = pred − y`.',
        'Gradient-check every hand-written gradient before you train with it.',
        'Test a training loop on data made from known weights: it should recover them.',
        'Standardise the features, and keep the mean and std to apply to new data.',
        'Least squares gives the exact answer for a linear model. Use it as a reference.',
      ],
      questions: [
        {
          kind: 'write',
          id: 'maths-lab-1',
          numpy: true,
          ask: 'Step 1: the model. Return the prediction for every row of `X`: the dot product of the row with the weights, plus the bias.',
          starter: `import numpy as np

def predict(X, w, b):
    # X: (n, d)   w: (d,)   b: a number   result: (n,)
    pass`,
          solution: `import numpy as np

def predict(X, w, b):
    return X @ w + b`,
          tests: `X = np.array([[1.0, 2.0], [2.0, 0.0], [3.0, 1.0]])
out = predict(X, np.array([2.0, -1.0]), 0.5)
assert out is not None, "the function returns nothing yet"
assert np.shape(out) == (3,), f"one prediction per row: the shape should be (3,), got {np.shape(out)}"
assert np.allclose(out, [0.5, 4.5, 5.5]), f"with w = (2, -1) and b = 0.5 the predictions are [0.5, 4.5, 5.5], got {out}"
assert np.allclose(predict(X, np.zeros(2), 3.0), [3.0, 3.0, 3.0]), "with zero weights every prediction is the bias"`,
          why: '`X @ w` is (n, d) @ (d,) = (n,): every row dotted with the weights in one call. The bias is a single number and broadcasts to all rows.',
        },
        {
          kind: 'write',
          id: 'maths-lab-2',
          numpy: true,
          ask: 'Step 2: the loss. Return the mean squared error between predictions and targets, as one number.',
          starter: `import numpy as np

def mse(pred, y):
    # pred: (n,)   y: (n,)   result: one number
    pass`,
          solution: `import numpy as np

def mse(pred, y):
    return ((pred - y) ** 2).mean()`,
          tests: `y = np.array([2.0, 2.0, 5.0])
out = mse(np.array([1.0, 2.0, 3.0]), y)
assert out is not None, "the function returns nothing yet"
assert np.ndim(out) == 0, "the loss should be a single number, not an array"
assert abs(out - 5 / 3) < 1e-9, f"the squared errors are 1, 0 and 4, and their mean is 1.6667, got {out}: is it the mean, not the sum?"
assert mse(y, y) == 0, "perfect predictions have a loss of 0"
assert abs(mse(np.array([3.0, 3.0, 6.0]), y) - 1) < 1e-9, "errors of +1 and -1 should cost the same: square them"`,
          why: 'Subtract, square, average. Squaring makes every error positive and makes large errors count far more than small ones. Taking the mean, not the sum, keeps the loss and its gradients the same size whatever the number of rows.',
        },
        {
          kind: 'write',
          id: 'maths-lab-3',
          numpy: true,
          ask: 'Step 3: the gradients. Return the gradient of the mean squared error with respect to `w` (a vector) and `b` (a number).',
          starter: `import numpy as np

def predict(X, w, b):
    return X @ w + b

def gradients(X, y, w, b):
    err = predict(X, w, b) - y      # (n,)
    # returns (dL_dw, dL_db): shapes (d,) and a number
    pass`,
          solution: `import numpy as np

def predict(X, w, b):
    return X @ w + b

def gradients(X, y, w, b):
    err = predict(X, w, b) - y
    return 2 * X.T @ err / len(y), 2 * err.mean()`,
          tests: `X = np.array([[1.0], [2.0]])
y = np.array([2.0, 4.0])
out = gradients(X, y, np.array([0.0]), 0.0)
assert out is not None, "the function returns nothing yet"
dw, db = out
assert np.shape(dw) == (1,), f"dL_dw should have the shape of w, (1,), got {np.shape(dw)}"
assert np.allclose(dw, [-10.0]), f"here err = (-2, -4), so dL_dw = 2 * (1 * -2 + 2 * -4) / 2 = -10, got {dw}"
assert abs(db + 6) < 1e-9, f"dL_db = 2 * mean(err) = -6, got {db}"
X = np.array([[1.0, 2.0], [2.0, 0.0], [3.0, 1.0], [0.0, 3.0]])
w_true = np.array([2.0, -1.0])
y = X @ w_true + 0.5
dw, db = gradients(X, y, w_true, 0.5)
assert np.allclose(dw, 0) and abs(db) < 1e-9, "at the weights that made the data the loss is 0 and so are the gradients"
def loss(w, b):
    return ((X @ w + b - y) ** 2).mean()
w, b, h = np.array([0.3, 0.8]), -0.2, 1e-6
dw, db = gradients(X, y, w, b)
for i in range(2):
    step = np.zeros(2)
    step[i] = h
    numeric = (loss(w + step, b) - loss(w - step, b)) / (2 * h)
    assert abs(dw[i] - numeric) < 1e-5, f"dL_dw[{i}] is {dw[i]} but a numerical check gives {numeric}"
numeric = (loss(w, b + h) - loss(w, b - h)) / (2 * h)
assert abs(db - numeric) < 1e-5, f"dL_db is {db} but a numerical check gives {numeric}"`,
          hint: 'The loss is mean(err²). The slope of err² is 2·err, and each weight reaches err through its own column of X.',
          why: 'Chain rule: the loss is the mean of err², whose slope is 2·err/n per row, and each row\'s err depends on weight j through X[row, j]. Summing over rows is `X.T @ err`. The bias reaches every row with slope 1, so its gradient is twice the mean error.',
        },
        {
          kind: 'write',
          id: 'maths-lab-4',
          numpy: true,
          ask: 'Step 4: the gradient check. Write the numerical gradient of a loss that takes a weight vector: nudge one weight at a time by `h` in both directions.',
          starter: `import numpy as np

def numerical_gradient(loss, w, h=1e-5):
    # loss: a function of a float vector w that returns a number
    # returns a vector shaped like w: entry i is the slope of the loss along w[i]
    pass`,
          solution: `import numpy as np

def numerical_gradient(loss, w, h=1e-5):
    grad = np.zeros_like(w)
    for i in range(len(w)):
        step = np.zeros_like(w)
        step[i] = h
        grad[i] = (loss(w + step) - loss(w - step)) / (2 * h)
    return grad`,
          tests: `w = np.array([1.0, -2.0, 3.0])
out = numerical_gradient(lambda w: (w ** 2).sum(), w)
assert out is not None, "the function returns nothing yet"
assert np.shape(out) == (3,), f"one slope per weight: the shape should be (3,), got {np.shape(out)}"
assert np.allclose(out, [2.0, -4.0, 6.0], atol=1e-7), f"the gradient of the sum of squares at (1, -2, 3) is (2, -4, 6), got {out}: nudge one weight at a time, in both directions"
assert np.array_equal(w, [1.0, -2.0, 3.0]), "w itself should not be changed: nudge a copy"
X = np.array([[1.0, 2.0], [2.0, 0.0], [3.0, 1.0], [0.0, 3.0]])
y = np.array([0.5, 4.5, 5.5, -2.5])
def loss(w):
    return ((X @ w - y) ** 2).mean()
w = np.array([0.3, 0.8])
formula = 2 * X.T @ (X @ w - y) / len(y)
assert np.allclose(numerical_gradient(loss, w), formula, atol=1e-6), "the numerical gradient should agree with the formula 2 * X.T @ err / n"
wrong = X.T @ (X @ w - y) / len(y)
assert not np.allclose(numerical_gradient(loss, w), wrong, atol=1e-6), "the check should catch a formula that has lost its factor of 2"`,
          why: 'It costs two loss evaluations per weight, far too slow for training but ideal for testing. If the formula and the numerical slope agree to several digits at a few random points, the gradient code is right. If they do not, you have found the bug before it cost you a training run.',
        },
        {
          kind: 'bug',
          id: 'maths-lab-5',
          ask: 'Step 5: one update. This takes a single step of gradient descent. The weights come out right, but the bias does not, and it has changed from a number into an array.',
          code: `def step(X, y, w, b, lr):
    err = X @ w + b - y
    dw = 2 * X.T @ err / len(y)
    db = 2 * err.mean()
    w = w - lr * dw
    b = b - lr * dw
    return w, b`,
          line: 6,
          fix: '    b = b - lr * db',
          why: 'The bias was updated with the gradient of the weights. NumPy broadcasts a number minus a vector without complaint, so `b` becomes a vector of shape (d,) and the next prediction is wrong or fails. Every parameter moves against its own gradient.',
        },
        {
          kind: 'write',
          id: 'maths-lab-6',
          numpy: true,
          ask: 'Step 6: the training loop. Start from zero weights and a zero bias, take `steps` steps of gradient descent, and return the weights and the bias.',
          starter: `import numpy as np

def gradients(X, y, w, b):
    err = X @ w + b - y
    return 2 * X.T @ err / len(y), 2 * err.mean()

def train(X, y, lr, steps):
    w, b = np.zeros(X.shape[1]), 0.0
    # repeat: get the gradients, step against them
    pass`,
          solution: `import numpy as np

def gradients(X, y, w, b):
    err = X @ w + b - y
    return 2 * X.T @ err / len(y), 2 * err.mean()

def train(X, y, lr, steps):
    w, b = np.zeros(X.shape[1]), 0.0
    for _ in range(steps):
        dw, db = gradients(X, y, w, b)
        w = w - lr * dw
        b = b - lr * db
    return w, b`,
          tests: `X = np.array([[1.0, 2.0], [2.0, 0.0], [3.0, 1.0], [0.0, 3.0], [4.0, 2.0], [1.0, 1.0]])
y = X @ np.array([2.0, -1.0]) + 0.5
out = train(X, y, 0.05, 0)
assert out is not None, "the function returns nothing yet"
w, b = out
assert np.allclose(w, 0) and b == 0, "with no steps the weights and the bias stay at zero"
w, b = train(np.array([[1.0], [2.0]]), np.array([2.0, 4.0]), 0.1, 1)
assert np.allclose(w, [1.0]) and abs(b - 0.6) < 1e-9, f"one step from zero with lr 0.1 on this data gives w = [1.0] and b = 0.6, got {w} and {b}"
w, b = train(X, y, 0.05, 5000)
assert np.allclose(w, [2.0, -1.0], atol=1e-3), f"the data was made with w = (2, -1), and training should find it, got {w}"
assert abs(b - 0.5) < 1e-3, f"the data was made with b = 0.5, got {b}"`,
          why: 'The loop is three lines: gradients, update the weights, update the bias. On data made from known weights with no noise, it recovers them. Every training loop you write later, however large the model, has this shape.',
        },
        {
          kind: 'write',
          id: 'maths-lab-7',
          numpy: true,
          ask: 'Step 7: scaling. Standardise the columns of `X`, and also return the mean and standard deviation of each column so that new data can be scaled the same way.',
          starter: `import numpy as np

def standardize(X):
    # X: (n, d)   returns (X_scaled, mean, std) with shapes (n, d), (d,), (d,)
    pass`,
          solution: `import numpy as np

def standardize(X):
    mean = X.mean(axis=0)
    std = X.std(axis=0)
    return (X - mean) / std, mean, std`,
          tests: `X = np.array([[1.0, 500.0], [2.0, 900.0], [3.0, 1200.0], [4.0, 2000.0]])
out = standardize(X)
assert out is not None, "the function returns nothing yet"
assert len(out) == 3, "return three things: the scaled array, the means and the standard deviations"
Xs, mean, std = out
assert np.shape(Xs) == (4, 2), f"the scaled array keeps the shape (4, 2), got {np.shape(Xs)}"
assert np.shape(mean) == (2,) and np.shape(std) == (2,), "one mean and one standard deviation per column: use axis=0"
assert np.allclose(mean, [2.5, 1150.0]), f"the column means are 2.5 and 1150, got {mean}"
assert np.allclose(Xs.mean(axis=0), 0), "every scaled column should have mean 0"
assert np.allclose(Xs.std(axis=0), 1), "every scaled column should have standard deviation 1"
new = np.array([[2.5, 1150.0]])
assert np.allclose((new - mean) / std, 0), "a new row equal to the column means should scale to zeros using the returned mean and std"`,
          why: 'The statistics are part of the model: whatever you subtract and divide by during training must be applied, unchanged, to every row you predict on later. Returning them is what makes that possible.',
        },
        {
          kind: 'output',
          id: 'maths-lab-8',
          ask: 'Step 8: why scaling matters. The same training loop with the same learning rate, on raw features and on standardised ones. It returns the final loss. What does this print?',
          code: `import numpy as np

def train(X, y, lr, steps):
    w, b = np.zeros(X.shape[1]), 0.0
    for _ in range(steps):
        err = X @ w + b - y
        w = w - lr * 2 * X.T @ err / len(y)
        b = b - lr * 2 * err.mean()
    return ((X @ w + b - y) ** 2).mean()

# rooms, and floor area in square feet
X = np.array([[1.0, 500.0], [2.0, 900.0], [3.0, 1200.0], [4.0, 2000.0]])
y = np.array([1.0, 2.0, 2.5, 4.0])
Xs = (X - X.mean(axis=0)) / X.std(axis=0)

raw = train(X, y, 0.1, 200)
scaled = train(Xs, y, 0.1, 200)
print(np.isfinite(raw), scaled < 0.01)`,
          answer: 'False True',
          hint: 'The largest safe learning rate is set by the steepest direction of the loss. How steep is the direction of a feature whose values are in the thousands?',
          why: 'With areas in the thousands, the curvature along that weight is in the millions, so a learning rate of 0.1 overshoots by more at every step until the loss overflows to infinity or nan. After standardising, both directions have curvature near 1 and the same rate converges. The alternative, a learning rate around a millionth, would be stable but would barely move the other weights.',
        },
        {
          kind: 'write',
          id: 'maths-lab-9',
          numpy: true,
          ask: 'Step 9: the exact answer. Solve least squares directly: add a column of ones to `X` to make `A`, solve `AᵀA θ = Aᵀy`, and return the weights and the bias.',
          starter: `import numpy as np

def least_squares(X, y):
    A = np.column_stack([X, np.ones(len(X))])   # (n, d + 1): the last column stands for the bias
    # solve (A.T @ A) theta = A.T @ y with np.linalg.solve, then split theta into (w, b)
    pass`,
          solution: `import numpy as np

def least_squares(X, y):
    A = np.column_stack([X, np.ones(len(X))])
    theta = np.linalg.solve(A.T @ A, A.T @ y)
    return theta[:-1], theta[-1]`,
          tests: `X = np.array([[1.0, 2.0], [2.0, 0.0], [3.0, 1.0], [0.0, 3.0], [4.0, 2.0], [1.0, 1.0]])
y = X @ np.array([2.0, -1.0]) + 0.5
out = least_squares(X, y)
assert out is not None, "the function returns nothing yet"
w, b = out
assert np.shape(w) == (2,), f"w should have one entry per feature, shape (2,), got {np.shape(w)}"
assert np.allclose(w, [2.0, -1.0]) and abs(b - 0.5) < 1e-8, f"the data was made with w = (2, -1) and b = 0.5, got {w} and {b}"
def train(X, y, lr, steps):
    w, b = np.zeros(X.shape[1]), 0.0
    for _ in range(steps):
        err = X @ w + b - y
        w, b = w - lr * 2 * X.T @ err / len(y), b - lr * 2 * err.mean()
    return w, b
y_noisy = y + np.array([0.3, -0.2, 0.1, 0.4, -0.3, -0.1])
w, b = least_squares(X, y_noisy)
w_gd, b_gd = train(X, y_noisy, 0.05, 20000)
assert np.allclose(w, w_gd, atol=1e-5) and abs(b - b_gd) < 1e-5, f"on noisy data the exact solution {w}, {b} should match gradient descent {w_gd}, {b_gd}"`,
          hint: '`np.linalg.solve(M, v)` returns the `theta` for which `M @ theta = v`. The bias is the last entry of `theta`.',
          why: 'Setting the gradient to zero gives a linear system, and solving it gives in one step the weights that gradient descent approaches over thousands. The two agree, which is a test of both. The exact route breaks down when `AᵀA` is singular or badly conditioned, and does not exist for models that are not linear, which is where the loop takes over.',
        },
      ],
    },
  ],
}
