import type { Block } from '../../types'

/** The full theory for each lesson of the neural module, keyed by lesson id. */
export const neuralTheory: Record<string, Block[]> = {
  'neural-neuron': [
    { h: 'What a neuron computes' },
    'A neural network is built from one small unit repeated many times, the **neuron**. It takes a list of numbers in and gives one number out, in three steps.',
    {
      list: [
        'It multiplies each input by its own number, called a **weight**, and adds the products. This is the dot product from the maths module: `w·x`, each entry of w times the matching entry of x, all summed.',
        'It adds one more number, the **bias** `b`. The result is called the **pre-activation** and is written `z = w·x + b`.',
        'It passes z through a fixed function `f`, the **activation function**, and outputs `a = f(z)`.',
      ],
    },
    "The weights and the bias are the neuron's **parameters**: the numbers that training adjusts. The activation function is chosen by you and never changes.",
    { sub: 'A worked example' },
    'Take a neuron with weights (1, 3), bias −2, and the activation **ReLU**, which keeps positive numbers and turns negative ones into 0: `ReLU(z) = max(0, z)`. Feed it the input (4, 1). The weighted sum is 1×4 + 3×1 = 7. Add the bias: z = 7 − 2 = 5. That is positive, so the output is 5.',
    {
      code: `import numpy as np

w = np.array([1.0, 3.0])
b = -2.0
x = np.array([4.0, 1.0])
z = w @ x + b
print(z, max(0.0, z))`,
      out: '5.0 5.0',
    },

    { h: 'What the weights and the bias do' },
    'A large weight makes its input count for a lot, a negative weight makes it push the output down, and a weight of 0 ignores it.',
    { sub: 'The switching point' },
    'A ReLU neuron is **on** when z is positive and **off** (outputting 0) when z is negative. With one input, z = w×x + b, and it crosses zero where x = −b/w. With weight 4 and bias −2, the neuron is off below x = 0.5 and on above it. The bias slides the switching point; the weight sets how steeply the output rises after it.',

    { h: 'A layer is one matrix product' },
    "A **layer** is many neurons that all read the same inputs, each with its own weights and bias. Put each neuron's weights in a column of a matrix `W`, and the biases in a vector `b`. A batch of examples goes in as a matrix `X` with one example per row. Then the whole layer is `f(X @ W + b)`, where `@` is matrix multiplication: every row of X is dotted with every column of W in one go.",
    {
      code: `import numpy as np

X = np.array([[1.0, 2.0], [0.0, -1.0]])         # 2 examples, 2 inputs
W = np.array([[1.0, -1.0, 0.5], [2.0, 0.0, 1.0]])  # 3 neurons
b = np.array([0.0, 1.0, -1.0])
print(np.maximum(0, X @ W + b))`,
      out: `[[5.  0.  1.5]
 [0.  1.  0. ]]`,
    },
    'Each row of the output is one example, each column one neuron. `np.maximum(0, Z)` compares 0 with every entry and keeps the larger. Do not confuse it with `np.max`, which returns the largest value of one array and reads a second argument as an axis.',

    { h: 'Why the activation matters' },
    'Without an activation, a layer is `X @ W + b`, which is **linear**: it can only draw straight lines and flat planes. Stacking two such layers gives `(X @ W1 + b1) @ W2 + b2`. Multiply out the brackets and you get `X @ (W1 @ W2) + (b1 @ W2 + b2)`. That is one linear layer whose weight matrix is the product W1 @ W2. However many linear layers you stack, they collapse into one.',
    {
      code: `import numpy as np

W1 = np.array([[2.0, 0.0], [1.0, 3.0]])
W2 = np.array([[1.0], [-1.0]])
x = np.array([[2.0, 1.0]])
print((x @ W1) @ W2, x @ (W1 @ W2))`,
      out: '[[2.]] [[2.]]',
    },
    'A bend between the layers stops the collapse and lets a deep network follow curves.',

    { h: 'Choosing an activation' },
    'Training asks, for every weight, which way to nudge it to make the predictions less wrong. The answer, the **gradient**, is passed backward through the network, and at each neuron it is multiplied by the **slope** of the activation at z: how much f(z) changes when z changes a little. Slope 1 passes it unchanged, a small slope shrinks it, slope 0 blocks it.',
    { sub: 'ReLU' },
    'ReLU has slope 1 where z > 0 and slope 0 where z < 0. The backward pass therefore multiplies the incoming gradient by a **mask**, `(z > 0)`, which is 1 where the neuron was on and 0 where it was off. The mask comes from z, not from the gradient. ReLU is cheap and does not shrink gradients: the default for **hidden layers** (all but the last). GELU is a smooth relative.',
    { sub: 'Sigmoid and tanh' },
    'The **sigmoid** `σ(z) = 1 / (1 + e^(−z))` squashes any number into the range 0 to 1. Its slope is `σ(z) × (1 − σ(z))`. **Tanh** squashes into −1 to 1, is centred on zero, and has slope 1 at z = 0. Both flatten out for large positive or negative z, where the slope is close to 0. A neuron stuck there is **saturated** and passes almost no gradient.',
    {
      code: `import numpy as np

z = np.array([-4.0, -1.0, 4.0])
s = 1 / (1 + np.exp(-z))
print(np.round(s * (1 - s), 3))`,
      out: '[0.018 0.197 0.018]',
    },
    'The sigmoid slope peaks at z = 0 and falls fast either side, so a stack of sigmoid layers shrinks the gradient at every layer.',

    { h: 'Dead ReLUs' },
    'A ReLU neuron that is off for some inputs is normal. One that is off for every input in the data is **dead**: output 0 and slope 0 everywhere, so no gradient reaches its weights and nothing can revive it. The usual causes are a **learning rate** (the size of each training step) so high that one step throws the weights far away, or a large negative bias. Count the units that output 0 for a whole batch to find them. A lower learning rate and a sound starting point for the weights prevent most. A **leaky ReLU** gives negative z a small slope, such as 0.01, so it cannot die.',

    { h: 'The output layer' },
    'The task chooses the last layer. To predict a number (**regression**), use no activation. A ReLU there can die and get stuck predicting 0; a sigmoid or tanh caps the range. If the target must be positive, predict its logarithm. To pick a class (**classification**), the last layer outputs raw scores called **logits**, and the step that turns them into probabilities happens inside the loss, which is more stable numerically.',

    { h: 'Mistakes to watch for' },
    {
      list: [
        'Stacking layers with no activation between them.',
        'Writing `np.max(0, z)` for ReLU instead of `np.maximum(0, z)`.',
        'Building the ReLU backward mask from the gradient instead of from z.',
        'Putting a ReLU or sigmoid on a regression output.',
      ],
    },
  ],

  'neural-forward': [
    { h: 'The forward pass' },
    'The **forward pass** is how a network turns inputs into outputs: the batch goes through the layers in order, and each layer is a matrix product, a bias and an activation. For a network with one hidden layer of ReLU units and a linear output layer:',
    {
      code: `def forward(X, W1, b1, W2, b2):
    Z1 = X @ W1 + b1        # pre-activations of the hidden layer
    H = np.maximum(0, Z1)   # hidden outputs
    out = H @ W2 + b2       # output layer, no activation
    return Z1, H, out`,
    },
    'The middle values `Z1` and `H` are returned as well, because the backward pass (the next lesson) needs them. The output layer reads `H`, the values after the ReLU. If it read `Z1` by mistake, nothing would crash, since the shapes are the same, but the network would be two linear layers in a row.',

    { h: 'Following the shapes' },
    'A matrix of shape `(r, c)` has r rows and c columns. A product `(a, b) @ (b, c)` needs the inner sizes to match and gives `(a, c)`. With n examples of d features each, hidden width h and k outputs:',
    {
      list: [
        '`X` is (n, d) and `W1` is (d, h), so `Z1` and `H` are (n, h).',
        '`W2` is (h, k), so the output is (n, k): one row of k numbers per example.',
        'The biases have one entry per unit: `b1` is (h,) and `b2` is (k,). NumPy adds them to every row.',
      ],
    },
    'The batch size n runs down the first axis of every activation and never appears in a weight shape. The same weights serve any batch size.',
    {
      code: `import numpy as np

X = np.zeros((5, 4))
W1, b1 = np.zeros((4, 6)), np.zeros(6)
W2, b2 = np.zeros((6, 2)), np.zeros(2)
H = np.maximum(0, X @ W1 + b1)
print(H.shape, (H @ W2 + b2).shape)`,
      out: '(5, 6) (5, 2)',
    },

    { h: 'Counting parameters' },
    'A dense layer from a inputs to b outputs has a weight for every pair, a × b, plus one bias per output, b. A network that takes 100 inputs, has 32 hidden units and 5 outputs has 100×32 + 32 = 3,232 parameters in the first layer and 32×5 + 5 = 165 in the second, 3,397 in all. Nearly all of them sit where the input is wide. Image models with thousands of input pixels show this even more sharply.',

    { h: 'Hidden units as hinges' },
    'With a single input x, each hidden ReLU unit computes `max(0, w×x + b)`. Drawn as a graph, that is a **hinge**: flat at 0 on one side of the switching point x = −b/w, a straight ramp on the other. The point where it bends is called a **kink**. The output layer multiplies each hinge by its output weight and adds them up, plus the output bias.',
    { sub: 'A worked example' },
    'Take two units. Unit A has w = 1, b = 0, so its kink is at x = 0. Unit B has w = 1, b = −1, kink at x = 1. Output weights are 1 for A and −2 for B. For x below 0 both are off, so the output is 0. Between 0 and 1 only A is on, and the output rises with slope 1. Above 1 both are on and the slope becomes 1 − 2 = −1, so the line turns downward. Three straight pieces, from two kinks.',
    {
      code: `import numpy as np

x = np.array([-1.0, 0.5, 1.0, 3.0])
a = np.maximum(0, x)
b = np.maximum(0, x - 1)
print(1 * a - 2 * b)`,
      out: '[ 0.   0.5  1.  -1. ]',
    },
    'At x = 3 the output has come back down: 3 from unit A, minus 2 × 2 from unit B, gives −1.',
    { sub: 'What follows from the picture' },
    {
      list: [
        'The output is always made of straight pieces, a **piecewise linear** function. More units give more and shorter pieces, never a true smooth curve.',
        'Each unit adds at most one kink, so h hidden units cut the line into at most h + 1 pieces. Fewer if two kinks coincide or a unit never switches on.',
        "Changing a unit's output weight only changes the curve where that unit is on. Where it outputs 0, its weight is multiplied by 0. In training, likewise, an example only sends gradient to the units it switched on.",
        'Outside the range of its kinks, a ReLU network carries on in a straight line.',
      ],
    },

    { h: 'How much one hidden layer can do' },
    'A known result, the **universal approximation theorem**, says that one hidden layer, if wide enough, can get as close as you like to any continuous function on a bounded range. Read it carefully. It says a good set of weights exists. It says nothing about how many units that takes, whether training will find those weights, or how well the network does on new data. In practice deeper networks often reach the same accuracy with fewer parameters, because later layers build on what earlier ones computed. That is a rule of thumb, not a guarantee.',

    { h: 'Logits and softmax' },
    'For classification, the output layer gives one raw score per class, the **logits**. The **softmax** function turns them into probabilities: raise e (about 2.718) to the power of each logit, then divide each result by their sum. The results are positive and add up to 1. Logits (2, 1, 0) give roughly (0.67, 0.24, 0.09).',
    'Apply softmax in exactly one place. Most loss functions take logits and apply softmax themselves. If your forward pass already returns probabilities, softmax runs twice. No error appears, but the second softmax only ever sees inputs between 0 and 1, so its outputs stay close together: the model can never become confident, and the loss stalls at a high value.',
    {
      code: `import numpy as np

def softmax(z):
    e = np.exp(z)
    return e / e.sum()

p = softmax(np.array([2.0, 1.0, 0.0]))
print(np.round(p, 2), np.round(softmax(p), 2))`,
      out: '[0.67 0.24 0.09] [0.45 0.3  0.25]',
    },

    { h: 'Mistakes to watch for' },
    {
      list: [
        'Feeding `Z1` instead of `H` to the next layer: no crash, no non-linearity.',
        'Forgetting a bias when counting parameters, or putting the batch size into a weight shape.',
        'Returning probabilities from the forward pass into a loss that expects logits.',
        'Reading the approximation theorem as a promise that one wide layer will train well.',
      ],
    },
  ],

  'neural-backprop': [
    { h: 'What the backward pass computes' },
    'Training needs to know, for every weight, how the **loss** (one number measuring how wrong the predictions are) would change if that weight moved a little. That quantity is the **gradient** of the loss with respect to the weight, written ∂L/∂w and read "how much L changes per small change in w". **Backpropagation** computes all of them in one sweep from the output back to the input.',
    'It rests on the **chain rule** from the maths module: if the loss depends on z, and z depends on w, then ∂L/∂w = ∂L/∂z × ∂z/∂w. You multiply the local slopes along the path. A network is a long path, so you start at the loss and work backward one layer at a time, reusing what you have already computed.',

    { h: 'Where the backward pass starts' },
    'The first gradient is the one at the network output. It depends on the loss.',
    {
      list: [
        '**Softmax with mean cross-entropy** (the usual classification loss): `(P − Y) / n`. P holds the predicted probabilities, Y the labels in **one-hot** form (a row of zeros with a 1 in the true class), and n is the batch size.',
        '**Mean squared error**, the average of (out − Y)²: `2 * (out − Y) / n`.',
      ],
    },
    'The `/ n` comes from taking the mean over the batch. Put it here, once. Without it the gradient is a sum over the examples, so it grows with the batch size, and a learning rate tuned for batches of 32 becomes eight times too large at 256.',

    { h: 'Three patterns for a dense layer' },
    'Every dense layer `Z = A @ W + b` (A is its input) is handled the same way. Call the gradient at its output `delta`, of the same shape as Z. Then:',
    {
      list: [
        'gradient for the weights: `dW = A.T @ delta`',
        'gradient for the bias: `db = delta.sum(axis=0)`',
        'gradient for the input, passed to the layer below: `dA = delta @ W.T`',
      ],
    },
    '`.T` is the **transpose**: rows become columns, so an (n, d) matrix becomes (d, n).',
    { sub: 'Let the shapes choose' },
    'A gradient always has the same shape as the thing it belongs to. With A of shape (n, d), W of (d, k) and delta of (n, k), dW must be (d, k). The only product of A and delta that gives that is (d, n) @ (n, k), which is `A.T @ delta`. The reversed `delta.T @ A` gives (k, d), the wrong way round. The same reasoning fixes `delta @ W.T`.',
    { sub: 'Why the bias gradient is a sum' },
    'The bias is added to every row of the batch, so it takes part in n calculations, and a value used several times collects the gradient from each use. Summing down the rows, `axis=0`, gives one number per output, matching the bias. `axis=1` would give one number per example instead.',
    { sub: 'Through the ReLU' },
    'Between the two layers sits the ReLU. As the first lesson showed, its backward step multiplies by the mask of units that were on: `dZ1 = dH * (Z1 > 0)`. `(H > 0)` is the same mask. The mask must come from the forward values, never from the sign of the gradient.',

    { h: 'A worked example by hand' },
    'One example x = (3, 1), one linear layer with weights (0.5, 1) and no bias, target 2, squared error. Forward: 3×0.5 + 1×1 = 2.5. The gradient at the output is 2 × (2.5 − 2) = 1. Each weight gets that times its own input: 3 and 1. The weight on the bigger input gets the bigger gradient, because nudging it moves the output more.',
    {
      code: `import numpy as np

X = np.array([[3.0, 1.0]])
W = np.array([[0.5], [1.0]])
delta = 2 * (X @ W - 2.0)
print(X.T @ delta)`,
      out: `[[3.]
 [1.]]`,
    },

    { h: 'The whole two-layer backward pass' },
    'For the network of the last lesson, the steps run in reverse order of the forward pass: output gradient, then `dW2 = H.T @ d_out` and `db2 = d_out.sum(axis=0)`, then `dH = d_out @ W2.T`, then the ReLU mask, then `dW1 = X.T @ dZ1` and `db1 = dZ1.sum(axis=0)`. A deeper network repeats the dense-layer step once per layer, with an activation step between.',
    'Compute every gradient before changing any weight. `dH` needs the same `W2` the forward pass used. If you update `W2` first and then compute `dH`, the gradient for the first layer is slightly wrong, with no error raised.',

    { h: 'Checking gradients numerically' },
    'Hand-written backward code is easy to get subtly wrong, so you test it against a slow method that cannot be wrong in the same way. The **central difference**: nudge one weight up by a small h, compute the loss, nudge it down by h, compute the loss, put it back. The slope is `(L(w + h) − L(w − h)) / (2h)`. The two points are 2h apart, so divide by 2h, not h.',
    'Compare the two numbers with the **relative error**: the difference divided by the larger of the two sizes. Use float64 and a tiny network. As a rule of thumb, below about 1e-6 is a pass and above 1e-3 is a bug, not rounding.',
    {
      code: `import numpy as np

rng = np.random.default_rng(0)
A, W, T = rng.standard_normal((4, 3)), rng.standard_normal((3, 2)), rng.standard_normal((4, 2))
loss = lambda W: 0.5 * ((A @ W - T) ** 2).sum()
dW = A.T @ (A @ W - T)        # backward: delta is A @ W - T
E = np.zeros_like(W); E[0, 1] = 1e-5
num = (loss(W + E) - loss(W - E)) / 2e-5
print(abs(num - dW[0, 1]) / max(abs(num), abs(dW[0, 1])) < 1e-6)`,
      out: 'True',
    },
    'To check a whole array, loop over every position (`np.ndindex(W.shape)` yields each index in turn) and restore each weight after nudging it. That costs two forward passes per weight, which is why it is a test and not a way to train.',
    { sub: 'Reading the result' },
    'If the check passes for the last layer and fails for an earlier one, the bug is between them. A clean factor such as exactly 2, or exactly the batch size, usually means a missing constant rather than wrong calculus.',

    { h: 'Mistakes to watch for' },
    {
      list: [
        'Summing the bias gradient along `axis=1`.',
        'Building the ReLU mask from the gradient instead of from `Z1`.',
        'Forgetting the `/ n`, or dividing by it twice.',
        'Updating a weight before the gradients that depend on it are computed.',
        'Dividing a central difference by h instead of 2h.',
      ],
    },
  ],

  'neural-init': [
    { h: 'Why the starting weights matter' },
    'Before training, every weight needs a first value. This choice, the **initialisation**, decides whether a deep network can learn at all. Two things matter: the weights must differ from one another, and they must have the right size.',

    { h: 'Breaking symmetry' },
    'Suppose every weight starts at the same value, say 0.3. Every hidden unit in a layer then computes the same output, receives the same gradient, and takes the same step. After the update they are still equal, and so on for ever. A layer of a hundred units behaves like one. This is the **symmetry** problem, and any constant start has it.',
    { sub: 'All zeros with ReLU' },
    'Starting at zero is worse. The hidden outputs H are all 0, so `dW2 = H.T @ d_out` is zero. W2 is zero, so `dH = d_out @ W2.T` is zero, and so is dW1. Only the output bias gets a gradient, so the network learns to predict one constant, the average target.',
    'Random weights break the symmetry. Biases can start at zero, since the random weights already make the units differ.',

    { h: 'Getting the scale right' },
    'Two terms first. The **variance** of a set of numbers is the average squared distance from their mean. The **standard deviation** (std) is its square root and is the typical size of a number in the set. For numbers centred on zero, the variance equals the **mean square**, the average of the squares.',
    'A unit adds up n inputs, each times a weight. If the weights have variance σ² (σ is the Greek letter sigma, here the std of the weights), the sum has a variance of about `n × σ²` times the mean square of the inputs. So each layer multiplies the size of the signal by a factor.',
    { sub: 'Small factors compound' },
    'With 50 inputs and weights of std 0.1, the factor on the variance is 50 × 0.01 = 0.5. That seems mild, but across ten layers it is 0.5¹⁰, about a thousandth. The signal fades to nothing. Slightly above 1 instead, and it grows until it explodes, or saturates a tanh. Gradients travelling backward are multiplied in the same way, so they vanish or explode too.',

    { h: 'Xavier and He' },
    'The fix is to choose σ² so that the factor is 1.',
    {
      list: [
        '**Xavier** (also called Glorot) initialisation: variance `1 / n_in`, or `2 / (n_in + n_out)`, where n_in and n_out are the numbers of inputs and outputs of the layer. Suited to tanh and sigmoid.',
        '**He** initialisation: variance `2 / n_in`. A ReLU sets about half its inputs to zero, which halves the mean square; the extra factor of 2 cancels that. Suited to ReLU.',
      ],
    },
    'With Xavier in a ReLU network, each layer halves the variance, so the size shrinks by 1/√2 ≈ 0.7 per layer. Match the initialisation to the activation.',
    { sub: 'Variance is not the multiplier' },
    'A draw from `rng.standard_normal` has std 1. Multiplying by c gives std c. So to get variance 2 / n_in you multiply by its square root, `np.sqrt(2 / n_in)`. For 50 inputs that is √0.04 = 0.2. Multiplying by 2 / n_in itself gives weights far too small. Pass the random generator `rng` into the function, so the same seed gives the same weights and a run can be repeated.',
    {
      code: `import numpy as np

rng = np.random.default_rng(0)
x = rng.standard_normal((1000, 256))
for name, std in [("too small", 0.03), ("He", np.sqrt(2 / 256))]:
    h = x
    for _ in range(10):
        h = np.maximum(0, h @ (rng.standard_normal((256, 256)) * std))
    print(name, f"{np.sqrt((h ** 2).mean()):.2g}")`,
      out: `too small 2.2e-05
He 0.94`,
    },
    'Ten ReLU layers, 256 units each. The printed number is the typical size of the final activations. With std 0.03 the signal is nearly gone; with He it holds steady.',
    { sub: 'When the size looks fine but is not' },
    'With tanh and weights that are too large, the size can stay near 1 because tanh cannot go past ±1. But many units then sit near ±1, where the slope of tanh is almost zero. They are saturated, and almost no gradient passes. Look at how many units are near ±1, not only at the average size.',

    { h: 'Normalisation layers' },
    'Initialisation sets a good start; normalisation layers keep activations in range while the weights change.',
    { sub: 'Batch normalisation' },
    '**Batch normalisation** treats each feature (column) on its own: subtract its mean over the batch, divide by its standard deviation over the batch (plus a tiny `eps` to avoid dividing by zero), then multiply by a learned scale γ (gamma) and add a learned shift β (beta). It makes deep networks much less sensitive to the initialisation and the learning rate.',
    {
      code: `import numpy as np

x = np.array([[1.0, 10.0], [3.0, 30.0], [5.0, 50.0]])
mean, var = x.mean(axis=0), x.var(axis=0)
print(np.round((x - mean) / np.sqrt(var + 1e-5), 2))`,
      out: `[[-1.22 -1.22]
 [ 0.    0.  ]
 [ 1.22  1.22]]`,
    },
    'During training it also keeps **running averages** of the means and variances. At **inference** (using the trained model on new data) it must use those averages, not the current batch. Otherwise a prediction depends on what else is in the batch, and with one example at a time, x minus its own mean is zero, so every output equals β. Very small batches also give it noisy statistics.',
    { sub: 'Layer normalisation' },
    '**Layer normalisation** standardises each example across its own features. It never looks across the batch, so it behaves the same in training and inference and works with any batch size, even 1 or 2. It is the standard choice in transformers and other sequence models.',

    { h: 'Standardise the inputs' },
    'All of this assumes inputs of size about 1. Raw features such as a distance in metres next to a count of rooms are on very different scales. The large one makes the first pre-activations huge and the loss far steeper along some weights than others, so only a tiny learning rate is stable. Standardise each input: subtract its mean and divide by its std, computed on the training set, and reuse those same numbers at inference.',

    { h: 'Mistakes to watch for' },
    {
      list: [
        'Starting all weights at the same value, including zero.',
        'Multiplying by the variance instead of its square root.',
        'Using Xavier for ReLU layers, or He for tanh.',
        'Leaving batch norm in training mode at inference.',
        'Feeding raw, unscaled features to the network.',
      ],
    },
  ],

  'neural-optimisers': [
    { h: 'From gradient to step' },
    'Backpropagation gives a gradient g for every weight. An **optimiser** is the rule that turns that gradient into a change of the weight. The simplest is **gradient descent**: `w -= lr * g`. The minus sign moves the weight against the gradient, downhill on the loss, and the **learning rate** `lr` sets the step size.',
    'Computing the gradient on the whole dataset is slow, so in practice each step uses a **mini-batch**, a small random sample such as 64 examples. This is **stochastic gradient descent** (**SGD**; stochastic means random). One pass through the whole training set is an **epoch**.',

    { h: 'Momentum' },
    'Picture the loss as a long, narrow valley. Plain SGD zigzags from wall to wall and creeps along the floor. **Momentum** keeps a running **velocity** `v` and steps along it instead of the raw gradient:',
    {
      code: `v = beta * v + g
w -= lr * v`,
    },
    'β (beta) is usually 0.9. Gradients that point the same way step after step add up, so progress along the valley floor speeds up. Gradients that flip sign, across the valley, cancel out.',
    { sub: 'How large the step grows' },
    'With a gradient that never changes, the velocity becomes g × (1 + β + β² + …). That sum levels off at `1 / (1 − β)`. With β = 0.5 the step grows to twice the plain step; with β = 0.8, five times. Adding momentum therefore raises the effective learning rate along steady directions, and you often lower `lr` to match.',
    {
      code: `w, v = 0.0, 0.0
for g in [2.0, 2.0, 2.0]:
    v = 0.5 * v + g
    w = w - 0.1 * v
    print(v, round(w, 2))`,
      out: `2.0 -0.2
3.0 -0.5
3.5 -0.85`,
    },
    'The velocity heads for 2 / (1 − 0.5) = 4. It is extra state, one per weight, kept between steps.',

    { h: 'Adam' },
    '**Adam** keeps two running averages per weight: `m`, of the gradient, and `v`, of the squared gradient. It steps by `lr * m / √v`. Since √v has the same scale as the gradient, the ratio is about ±1, so each weight moves by about `lr` per step whatever the size of its gradient. That is why Adam is forgiving: a learning rate of about 1e-3 or 3e-4 works on most problems.',
    { sub: 'The details' },
    'The averages use `b1 = 0.9` for m and `b2 = 0.999` for v: `m = b1 * m + (1 − b1) * g`, and the same for v with g × g. They start at zero, so early on they are too small. **Bias correction** fixes that by dividing m by `1 − b1^t` and v by `1 − b2^t`, where t counts steps from 1. The step is `lr * m_hat / (√v_hat + eps)`, with a tiny `eps` such as 1e-8 to avoid dividing by zero. Forgetting the square root is a classic bug: a small gradient divided by its own square becomes a huge step.',
    {
      code: `import numpy as np

def adam_run(g, steps=3, lr=0.01, b1=0.9, b2=0.999, eps=1e-8):
    w, m, v = 0.0, 0.0, 0.0
    for t in range(1, steps + 1):
        m, v = b1 * m + (1 - b1) * g, b2 * v + (1 - b2) * g * g
        w -= lr * (m / (1 - b1 ** t)) / (np.sqrt(v / (1 - b2 ** t)) + eps)
    return round(w, 4)
print(adam_run(500.0), adam_run(0.05))`,
      out: '-0.03 -0.03',
    },
    'Two gradients ten thousand times apart, the same three steps of 0.01. A consequence: learning rates do not carry over between optimisers. With SGD the step is lr × gradient, and gradients are often small, so 0.1 can be right. With Adam, 0.1 moves every weight by 0.1 per step, which is enormous.',

    { h: 'Weight decay and AdamW' },
    '**Weight decay** shrinks every weight a little at each step, `w -= lr * wd * w`, which keeps weights small and the model smoother. With plain SGD this is the same as adding an **L2 penalty**, wd/2 × the sum of squared weights, to the loss. With Adam it is not: a penalty added to the gradient gets divided by √v like everything else, so weights with large gradients are barely decayed. **AdamW** applies the decay as a separate step outside the adaptive part, and is the version to use. A typical value is about 0.01. Leave biases and normalisation parameters undecayed.',

    { h: 'Learning rate schedules' },
    'A **schedule** changes the learning rate over the run.',
    { sub: 'Warm-up' },
    "At the start the weights are random, gradients are large, and Adam's averages rest on a few batches. A **warm-up** raises the rate in a straight line from 0 to its peak over the first few hundred or thousand steps, so that one bad early step cannot wreck the run, for example by killing ReLU units.",
    { sub: 'Decay' },
    'Later the rate should fall, so the weights settle into a minimum instead of bouncing around it. A **step** schedule cuts it suddenly, for example by ten at half-way and again at three quarters, and each cut shows as a sudden drop in the loss. A **cosine** schedule falls smoothly along half a cosine curve: with `progress` running from 0 at the end of the warm-up to 1 at the last step, the rate is `peak × 0.5 × (1 + cos(π × progress))`. Measure progress from the end of the warm-up, so the two parts meet at the peak without a jump.',
    {
      code: `import math

peak, warmup, total = 0.002, 500, 5000
for step in [250, 500, 2750, 5000]:
    if step < warmup:
        print(step, peak * step / warmup)
    else:
        p = (step - warmup) / (total - warmup)
        print(step, round(peak * 0.5 * (1 + math.cos(math.pi * p)), 6))`,
      out: `250 0.001
500 0.002
2750 0.001
5000 0.0`,
    },
    'Warm-up then cosine is a sound default; the peak still needs tuning. With a warm-up of 0 the first branch never runs, so nothing divides by zero.',

    { h: 'Batch size' },
    'A bigger batch gives a less noisy gradient but fewer steps per epoch. Go from 64 to 256 at the same rate and you take a quarter of the steps, so the model travels less far in the same number of epochs. A common rule of thumb scales the learning rate in proportion to the batch size, with a warm-up; check it on validation loss. Memory sets the upper limit.',

    { h: 'Choosing settings for a new model' },
    {
      list: [
        'Start from a known default, such as AdamW at 3e-4 to 1e-3, or the recipe of a similar published model.',
        'Fix the batch size from memory and speed first, since the best rate depends on it.',
        'Sweep the learning rate on a **log scale** (1e-5, 3e-5, 1e-4, …) with short runs. Its good range is about one power of ten wide.',
        'Use warm-up then cosine, with a modest weight decay.',
        'Fix the random seed and change one thing at a time, judged on validation loss.',
        'Watch the first few hundred steps. If the loss spikes, **clip** the gradient: when its overall size (norm) exceeds a limit, scale it down to that limit.',
      ],
    },
  ],

  'neural-regularise': [
    { h: 'What overfitting looks like' },
    'You train on the **training set** and measure on a **validation set** the model never trains on (a reminder from the evaluation module). A model **overfits** when it keeps improving on the training data while the validation loss stops falling or rises. It is memorising the training examples, noise included, instead of learning the pattern. The sign is a **gap**: training loss low, validation loss much higher.',
    'Every remedy below either gives the model more to learn from or restrains how much it can memorise. A sensible order runs from the first kind to the second.',

    { h: 'More data and augmentation' },
    '**More data** comes first. It is the only remedy that adds knowledge; the others only limit the model. When more cannot be had, **augmentation** manufactures it: random crops, flips, small rotations or shifts, added noise, each applied fresh every time an example is used.',
    { sub: 'Two conditions' },
    {
      list: [
        'The change must keep the label true. Turning a photo of a digit upside down makes a 6 look like a 9, so the model would learn from wrong labels. A slightly cropped photo of a car is still a car.',
        'Augment the training set only. Augmenting validation data changes what you are measuring.',
      ],
    },

    { h: 'Weight decay' },
    '**Weight decay** (from the optimisers lesson) pulls every weight towards zero at each step. Small weights give a smoother function that follows the noise less. Its strength is one number, tuned on the validation loss on a log scale (0.001, 0.01, 0.1). Too much and the model can no longer fit even the training data: both losses end high and close together. That is **underfitting**, and the gap has closed by making training worse, not validation better.',

    { h: 'Dropout' },
    '**Dropout** sets each activation of a layer to zero with probability p during training, a new random choice at every step. The network cannot rely on any single unit, so it spreads what it knows across many.',
    { sub: 'Inverted dropout' },
    "Removing units makes the layer's total smaller. To keep its expected size the same, the surviving activations are divided by `1 − p`. This is **inverted dropout**. With p = 0.25, survivors are multiplied by 1 / 0.75 ≈ 1.33.",
    {
      code: `import numpy as np

h = np.array([3.0, 6.0, 9.0, 12.0])
mask = np.array([1, 1, 0, 1])   # the third unit is dropped
p = 0.25
print(h * mask / (1 - p))`,
      out: '[ 4.  8.  0. 16.]',
    },
    { sub: 'Training mode and evaluation mode' },
    'Because the scaling happens in training, at evaluation dropout does nothing at all: it returns the activations unchanged, with no mask and no scaling. A model left with dropout on at evaluation gives a different, noisier answer each time it sees the same input. If the same weights on the same data give a different score in your training loop and in your evaluation script, check first that both switch the model to the right mode; dropout and batch norm both behave differently in the two.',

    { h: 'Early stopping' },
    '**Early stopping** watches the validation loss after every epoch and keeps a copy (a **checkpoint**) of the weights from the best epoch so far. A counter of bad epochs goes up each time the loss fails to beat the best, and resets to 0 at each improvement. When it reaches the **patience**, a number you choose, training stops and the best checkpoint is kept.',
    { sub: 'A trace by hand' },
    'Validation losses 0.9, 0.7, 0.72, 0.65, 0.66, 0.67, with patience 2. The best is 0.9, then 0.7 (counter 0). 0.72 is worse (counter 1). 0.65 is a new best (counter back to 0). 0.66 and 0.67 are worse (1, then 2), so training stops and the epoch with 0.65 is kept. Whatever would have come after is never seen, which is the price of a short patience on a noisy curve.',
    {
      list: [
        'Watch validation loss, never training loss. Training loss keeps falling as the model memorises, so it would always pick the last epoch.',
        'Decide whether an equal loss counts as an improvement. The usual rule is that it does not: the loss must be strictly lower.',
      ],
    },
    { sub: 'An honest final number' },
    'The validation loss of the chosen epoch is slightly flattering: it is the best of many noisy measurements, picked because it was best. The effect grows with every decision made against the same validation set. Report the final result on a **test set** that played no part in any choice.',

    { h: 'A smaller model, last' },
    'A smaller model has less room to memorise, but it also has less room to learn. A large model with enough data and regularisation usually beats a small one, so shrinking comes last. Starting from **pretrained weights**, a model already trained on a large related dataset, is often better: it brings knowledge your data could not supply.',
    { sub: 'The order to follow' },
    {
      list: [
        'Check the split: same kind of data in both sets, no duplicates across them, labels of similar quality. A gap can come from a bad split, which no regulariser fixes.',
        'Get more data, then augment it.',
        'Add weight decay and dropout, tuned on validation loss.',
        'Use early stopping and keep the best checkpoint.',
        'Only then try a smaller or pretrained model, changing one thing at a time.',
      ],
    },
  ],

  'neural-curves': [
    { h: 'Two curves on one chart' },
    'Every training run should plot two **loss curves**: training loss and validation loss against the epoch or step. Their shapes tell you what is wrong before any other test does. To read them, first know two reference numbers for the problem.',

    { h: 'The loss of a model that knows nothing' },
    'For classification the usual loss is **cross-entropy**: minus the natural logarithm (ln) of the probability the model gave to the true class. A confident right answer, 0.95, costs −ln 0.95 ≈ 0.05. A confident wrong one costs a lot.',
    'A freshly initialised network knows nothing and gives each of k classes a probability of about 1/k. Its loss is therefore −ln(1/k) = **ln(k)**. For 5 classes that is 1.61; for 1,000 it is 6.91. The first recorded loss should be close to this.',
    {
      code: `import math

for k in [2, 5, 1000]:
    print(k, round(math.log(k), 2))`,
      out: `2 0.69
5 1.61
1000 6.91`,
    },
    'A first loss far above ln(k) points to a problem with initialisation or input scaling. The second reference number is roughly how low a good model gets on this problem: the **noise floor**. A loss that stops at that floor is finished, not stuck.',

    { h: 'The learning rate in the training curve' },
    {
      list: [
        '**Too high**: the loss jumps up and down with no downward trend, or climbs. Validation bounces in step with it. Divide the rate by 3 to 10.',
        '**Too low**: the loss falls in a slow, almost straight line and is still falling when the run ends. A model at its limit would flatten; this one has not. Raise the rate, often by ten.',
        '**About right**: a steep fall that bends into a slow decline.',
      ],
    },

    { h: 'The gap between the curves' },
    { sub: 'Overfitting' },
    'Training loss keeps falling towards zero while validation loss reaches a minimum and turns up. The epoch at that minimum holds the weights to keep. To do better, add data, augmentation or regularisation.',
    { sub: 'Underfitting' },
    'Both curves flatten early at a high value, close together. There is no gap, so regularising more would make it worse. The model or its features are too weak, or it is regularised too hard: give it more capacity, better inputs, or less regularisation.',

    { h: 'A curve stuck at chance' },
    'A loss that sits at ln(k) means the predictions do not depend on the inputs: the network has learnt only that the classes are about equally common. That is nearly always a bug, not a tuning problem. Common causes: labels shuffled out of step with their inputs, inputs that are all zero, gradients that never reach the weights, or weights that are never updated.',
    { sub: 'Overfit one small batch' },
    'The test that separates bugs from tuning: take one fixed batch of 10 to 20 examples, switch dropout and weight decay off, and train on it alone. A working network memorises it, driving the loss close to zero within a few hundred steps. If it cannot, the problem is in the model, the loss or the update code, and no amount of data or tuning will help.',

    { h: 'Three more shapes' },
    {
      list: [
        '**Jagged but trending down**: each point is the loss of a small batch, so it scatters. If validation falls smoothly, training is healthy. Plot a moving average, or use a bigger batch.',
        '**Validation below training**: normal when dropout or augmentation is on only in training, which makes the training task harder, and because each training point averages an epoch during which the model was still improving. With neither in play, suspect a validation set that is easier than, or shared with, the training set.',
        '**A spike, then `nan`**: one step was too large, or a calculation such as log(0) went wrong. Once a weight is NaN (not a number), every later loss is NaN. Lower the rate, add warm-up, clip the gradient, and look at the batch where the jump began. A log-scale axis makes such a spike easy to see.',
      ],
    },

    { h: 'A quiet shape bug' },
    'Some bugs give a loss that looks like a number and trains on nonsense. Subtracting a target of shape (n,) from predictions of shape (n, 1) does not fail: NumPy **broadcasts** them, stretching both into an (n, n) table of every prediction minus every target.',
    {
      code: `import numpy as np

pred = np.array([[1.0], [2.0], [3.0]])   # (3, 1)
y = np.array([1.0, 2.0, 3.0])            # (3,)
print((pred - y).shape, round(((pred - y) ** 2).mean(), 2))`,
      out: '(3, 3) 1.33',
    },
    'The predictions are perfect, yet the loss is 1.33. A softmax applied twice, from the forward-pass lesson, is the same kind of silent bug.',

    { h: 'When the loss will not go down' },
    'Work from cheap and likely to expensive and unlikely:',
    {
      list: [
        'Compare the loss with ln(k), or with the loss of always predicting the mean.',
        'Look at one batch as the model receives it: shapes, value ranges, each label with its input.',
        'Overfit one small batch.',
        'Check the loss wiring: logits where logits are expected, matching shapes.',
        'Check gradients: finite, not all zero, reaching every layer, and weights that change after a step. Dead ReLUs and parameters left out of the optimiser show up here.',
        'Sweep the learning rate over several powers of ten.',
        'Check initialisation and input scaling.',
        'Only then change the architecture: return to a small model known to work and add pieces back one at a time.',
      ],
    },
  ],

  'neural-lab': [
    { h: 'The XOR problem' },
    '**XOR** ("exclusive or") takes two bits and outputs 1 when exactly one of them is 1. The four inputs (0, 0), (0, 1), (1, 0), (1, 1) have the labels 0, 1, 1, 0. Plot them on a square and the two 1s sit on one diagonal, the two 0s on the other. No straight line puts the 1s on one side and the 0s on the other, so no linear model can solve it. One hidden layer can, which makes XOR the classic first test of a network written by hand.',
    { sub: 'A solution exists' },
    'Two ReLU units are enough. Let unit A compute `max(0, x1 − x2)` and unit B `max(0, x2 − x1)`, and add them. For (1, 0), A gives 1 and B 0: total 1. For (0, 1), A 0 and B 1: total 1. For (0, 0) and (1, 1) both give 0. Training has to find weights like these by itself.',

    { h: 'The pieces you will build' },
    'In this order, which is the order to build any model: initialise, forward pass, loss, backward pass, gradient check, update, training loop, metric. Each piece is checked before the next depends on it.',
    { sub: 'Initialisation' },
    'He initialisation (from the initialisation lesson) for both weight matrices: draw with `rng.standard_normal` and multiply by √(2 / inputs to that layer). The first layer has 2 inputs; the second has as many as there are hidden units. Biases start at zero. Pass the random generator in, and draw the matrices in a fixed order, so that one seed fixes the whole run.',
    { sub: 'Forward pass with a sigmoid output' },
    'The hidden layer is `Z1 = X @ W1 + b1`, then `H = max(0, Z1)`. The output is one probability per example, so it goes through a sigmoid: `P = 1 / (1 + e^(−(H @ W2 + b2)))`. Return `Z1`, `H` and `P`, since the backward pass needs all three.',

    { h: 'Binary cross-entropy' },
    'With two classes the loss for one example with label y and predicted probability p is `−(y ln p + (1 − y) ln(1 − p))`. When y = 1 only the first term counts, −ln p; when y = 0 only the second, −ln(1 − p). The loss is the mean over the examples. A model that always says 0.5 costs ln 2 ≈ 0.69, the know-nothing value for this problem.',
    {
      code: `import numpy as np

P = np.array([[0.8], [0.3]])
Y = np.array([[1.0], [0.0]])
print(round(float(-(Y * np.log(P) + (1 - Y) * np.log(1 - P)).mean()), 4))`,
      out: '0.2899',
    },
    'Here −ln 0.8 ≈ 0.223 and −ln 0.7 ≈ 0.357, and their mean is 0.29.',
    { sub: 'Clip before the logarithm' },
    'If p is exactly 0 or 1, one of the logarithms is log(0), which is minus infinity, and 0 × that is NaN. One NaN poisons the whole run. `np.clip(P, 1e-12, 1 - 1e-12)` keeps p a hair away from both ends first.',

    { h: 'Backward pass and gradient check' },
    'A sigmoid output with binary cross-entropy has the same convenient gradient as softmax with cross-entropy: at the output pre-activation it is `(P − Y) / n`. From there the backward-pass lesson applies unchanged: the dense-layer patterns for W2 and b2, back through W2, the ReLU mask from Z1, then W1 and b1.',
    'Check it numerically before training: a wrong gradient can still lower the loss for a while and fool you. For each weight, compute the central difference and compare it with your gradient using a relative error, here `|numeric − analytic| / max(|numeric| + |analytic|, 1e-8)`. The `1e-8` guards the case where both are 0. A gradient that is wrong by a factor of 4 gives 3/5 = 0.6 with this formula, far from a pass.',
    'Avoid a check point exactly on a ReLU kink, where z = 0: the slope there is not defined and the numerical gradient is meaningless. Non-zero biases in a test move the points off the kink.',

    { h: 'Update and training loop' },
    'One step of gradient descent replaces each parameter p with `p − lr * g`. Building new arrays, rather than changing the old ones in place with `-=`, keeps every old weight intact until all gradients are used, which rules out the update-order bug from the backward-pass lesson.',
    'The loop runs a fixed number of steps. Each step: forward pass, record the loss, backward pass, update. Record the loss before the update, so the first entry is the loss of the fresh network, near 0.69. For four points the whole dataset is one batch, so a loss close to zero at the end is the overfit-one-batch test passing.',

    { h: 'Measuring accuracy' },
    '**Accuracy** is the share of examples classified correctly. Call a probability above 0.5 a prediction of 1; exactly 0.5 counts as 0. Shape matters here. If P is (n, 1) and Y is (n,), comparing them broadcasts to (n, n) and gives a wrong number with no error. Flatten both first.',
    {
      code: `import numpy as np

P = np.array([[0.7], [0.4], [0.9]])
Y = np.array([1.0, 1.0, 1.0])
print((P > 0.5).shape == (Y == 1).shape, np.reshape(P, -1) > 0.5)`,
      out: 'False [ True False  True]',
    },
    '`np.reshape(P, -1)` turns any shape into one flat row; the −1 means "as many as needed".',

    { h: 'When some seeds fail' },
    'With very few hidden units, some random starts stall: the loss stops part of the way down, below 0.69 but well above 0, and a point or two stays wrong. A gradient check that passes, and other seeds that succeed, rule out a bug. What differs is the starting weights.',
    {
      list: [
        'Look at each hidden unit: on which of the four inputs is it on? A unit off for all four is dead, with zero gradient, so more steps or a different learning rate cannot revive it.',
        'Give the network spare units. With more random hinges, enough of them start in useful places.',
        'Or keep units alive: a leaky ReLU, tanh, or small positive starting biases.',
        'Fix the seed for reproducibility, but report results over several seeds. One run proves little either way.',
      ],
    },
  ],
}
