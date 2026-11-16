import type { Module } from '../types'

const XOR_HELPERS = `import numpy as np

def init_params(n_in, n_hidden, n_out, rng):
    W1 = rng.standard_normal((n_in, n_hidden)) * np.sqrt(2 / n_in)
    W2 = rng.standard_normal((n_hidden, n_out)) * np.sqrt(2 / n_hidden)
    return W1, np.zeros(n_hidden), W2, np.zeros(n_out)

def forward(X, W1, b1, W2, b2):
    Z1 = X @ W1 + b1
    H = np.maximum(0, Z1)
    P = 1 / (1 + np.exp(-(H @ W2 + b2)))
    return Z1, H, P

def bce(P, Y):
    P = np.clip(P, 1e-12, 1 - 1e-12)
    return float(-(Y * np.log(P) + (1 - Y) * np.log(1 - P)).mean())`

const XOR_BACKWARD = `def backward(X, Y, Z1, H, P, W2):
    d_out = (P - Y) / X.shape[0]
    dZ1 = (d_out @ W2.T) * (Z1 > 0)
    return X.T @ dZ1, dZ1.sum(axis=0), H.T @ d_out, d_out.sum(axis=0)`

export const neural: Module = {
  id: 'neural',
  title: 'Neural networks',
  summary: 'What a network computes, how backpropagation and an optimiser make it learn, and how to tell from a loss curve why it is not learning.',
  lessons: [
    {
      id: 'neural-neuron',
      title: 'Neurons, layers and activations',
      summary: 'A weighted sum, a bias and a bend: what each part does and which bend to choose.',
      widget: 'neural-activation',
      text: [
        'A neuron takes a weighted sum of its inputs, adds a bias, and passes the result through an **activation** function: `a = f(w·x + b)`. The weights say how much each input counts. The bias moves the point at which the neuron switches on: a ReLU neuron with one input turns on where `w*x + b` crosses zero, at `x = −b/w`. A **layer** is many neurons reading the same inputs, which is one matrix product: `f(X @ W + b)`.',
        'The activation is what makes depth worth having. Without it, two layers are `(X @ W1 + b1) @ W2 + b2`, which multiplies out to `X @ (W1 @ W2) + (b1 @ W2 + b2)`: one linear layer with different numbers in it. Ten linear layers are still one linear layer. A bend between the layers is what lets the network represent curves.',
        '**ReLU**, `max(0, z)`, is the default for hidden layers. Its slope is exactly 1 when the neuron is on, so gradients pass through without shrinking, and it is cheap. **Sigmoid** squashes to (0, 1) and its slope is never more than 0.25. **Tanh** squashes to (−1, 1), is centred on zero and has a slope of up to 1. Both go flat at the ends, so both saturate. Inside a deep network prefer ReLU or one of its smooth relatives such as GELU.',
        'ReLU has its own failure. If `z` is negative for every example in the data, the neuron outputs 0 everywhere, its slope is 0 everywhere, and no gradient ever reaches its weights again. It is a **dead ReLU**. The usual causes are a learning rate high enough to throw the weights far in one step, or a large negative bias. You find them by counting units that output zero for a whole batch. A lower learning rate and sound initialisation prevent most of them; a **leaky ReLU**, with a small slope such as 0.01 on the negative side, cannot die.',
        'The output layer follows the task, not the hidden layers. For regression it has no activation. For classification it also returns raw scores (logits), and the sigmoid or softmax is folded into the loss, which is more stable numerically.',
      ],
      rules: [
        'A neuron is `f(w·x + b)`; a layer is `f(X @ W + b)`.',
        'Without a non-linearity between them, any number of layers collapse into one linear layer.',
        'Hidden layers: ReLU by default. Sigmoid and tanh saturate, and the sigmoid slope is at most 0.25.',
        'ReLU passes the gradient where `z > 0` and blocks it elsewhere.',
        'A ReLU that is off for every input is dead: zero output, zero gradient, no recovery.',
        'Output layer: linear for regression, logits for classification.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'neural-neuron-1',
          ask: 'A ReLU neuron has weights (2, −1) and bias 1. What does it output for the input (3, 4)?',
          answer: 3,
          check: 'max(0, np.dot([2, -1], [3, 4]) + 1)',
          why: 'The weighted sum is 2×3 − 1×4 = 2, plus the bias gives z = 3. That is positive, so the ReLU passes it unchanged.',
        },
        {
          kind: 'number',
          id: 'neural-neuron-2',
          ask: 'A ReLU neuron with one input has weight 2 and bias −4. Above which value of x is it switched on?',
          answer: 2,
          check: '4 / 2',
          why: 'It is on where 2x − 4 > 0, so where x > 2. The switching point is −b/w: the bias moves it and the weight sets how steep the ramp is after it.',
        },
        {
          kind: 'output',
          id: 'neural-neuron-3',
          ask: 'Two layers with no activation between them, and one layer whose weights are their product. What does this print?',
          code: `import numpy as np

W1 = np.array([[1, 2],
               [0, 1]])
W2 = np.array([[2],
               [1]])
x = np.array([[1, 1]])
print((x @ W1) @ W2, x @ (W1 @ W2))`,
          answer: '[[5]] [[5]]',
          why: 'x @ W1 is [1, 3], and that times W2 is 2 + 3 = 5. W1 @ W2 is the single layer [[4], [1]], which gives 4 + 1 = 5 as well. The two-layer network is exactly one linear layer.',
        },
        {
          kind: 'choice',
          id: 'neural-neuron-4',
          ask: 'A colleague stacks ten dense layers with no activations "to give the model more capacity". What can this network represent?',
          options: [
            'Any function, given enough units',
            'Only what a single linear layer can: straight lines and flat planes',
            'Polynomials up to degree ten',
            'Nothing: it cannot be trained at all',
          ],
          answer: 1,
          why: 'A product of matrices is a matrix. The ten layers multiply out to one linear map, with more parameters to train and no more expressive power. It trains fine, which is why the mistake goes unnoticed.',
        },
        {
          kind: 'output',
          id: 'neural-neuron-5',
          ask: 'ReLU and the mask that its backward pass uses. What does this print?',
          code: `import numpy as np

z = np.array([-2, 1, 3])
a = np.maximum(0, z)
mask = (z > 0).astype(int)
print(a, mask)`,
          answer: '[0 1 3] [0 1 1]',
          why: 'The forward pass replaces negative entries with 0. The mask is the local slope: 1 where the neuron was on and 0 where it was off. The backward pass multiplies the incoming gradient by it.',
        },
        {
          kind: 'bug',
          id: 'neural-neuron-6',
          ask: 'This ReLU raises an error as soon as it is called on an array.',
          code: `import numpy as np

def relu(z):
    # z: an array of any shape
    return np.max(0, z)`,
          line: 5,
          fix: '    return np.maximum(0, z)',
          why: '`np.max(a, axis)` reduces one array to its largest value, so here `z` is read as an axis. `np.maximum(a, b)` compares two arrays entry by entry, which is what a ReLU needs.',
        },
        {
          kind: 'choice',
          id: 'neural-neuron-7',
          ask: 'In the figure, choose ReLU, set the weight to 1 and the bias to −3, then slide the input x across its whole range. What do you see, and what does it mean?',
          options: [
            'The output follows x, so the neuron works as usual',
            'The output and the slope stay at 0 for every input: no gradient reaches the weight, so the neuron can never learn its way back',
            'The slope is 1 everywhere, so the neuron learns fast',
            'The output saturates at 1',
          ],
          answer: 1,
          why: 'With x between −2 and 2, z = x − 3 is always negative. The neuron is off for every input, so its gradient is zero for every input. That is a dead ReLU. Switch to the leaky ReLU and the slope is small but not zero.',
        },
        {
          kind: 'choice',
          id: 'neural-neuron-8',
          ask: 'After a few steps at a high learning rate, 40% of the hidden ReLU units output 0 for every example in a large batch. What has happened?',
          options: [
            'Nothing: a ReLU unit is meant to be off for about half of its inputs',
            'A large update pushed their weights so far that z is negative for every input. Their gradient is now zero, so they stay that way',
            'They have saturated like a sigmoid and will recover slowly',
            'The network has overfitted',
          ],
          answer: 1,
          why: 'Being off for some inputs is normal and useful. Being off for all of them is death: nothing flows back to fix it. Lower the learning rate (or warm it up), check the initialisation, or use a leaky ReLU.',
        },
        {
          kind: 'number',
          id: 'neural-neuron-9',
          ask: 'In the figure, choose sigmoid and set w = 1, b = 0, x = 0, so that z = 0. What is the slope there? It is the largest slope a sigmoid ever has.',
          answer: 0.25,
          check: '(1 / (1 + math.exp(0))) * (1 - 1 / (1 + math.exp(0)))',
          why: 'At z = 0 the sigmoid is 0.5 and its slope is 0.5 × 0.5 = 0.25. Every sigmoid layer therefore shrinks the gradient by at least four times. Tanh reaches a slope of 1 at zero, and ReLU has a slope of 1 over its whole active side.',
        },
        {
          kind: 'choice',
          id: 'neural-neuron-10',
          ask: 'A network predicts a house price, which is always positive. What goes on the output layer?',
          options: ['ReLU, so that the prediction can never be negative', 'Sigmoid', 'No activation: a linear output', 'Tanh'],
          answer: 2,
          why: 'Regression outputs are linear. A ReLU on the output can die: an example whose z is negative gets a prediction of 0 and a gradient of 0. Sigmoid and tanh cap the output. If predictions must be positive, predict the logarithm of the price.',
        },
        {
          kind: 'write',
          id: 'neural-neuron-11',
          numpy: true,
          ask: 'Write ReLU and its backward step. `relu_backward` receives the gradient with respect to the output and returns the gradient with respect to `z`. Use a slope of 0 at exactly `z = 0`.',
          starter: `import numpy as np

def relu(z):
    # max(0, z) for every entry
    pass

def relu_backward(grad_out, z):
    # grad_out: gradient of the loss with respect to relu(z)
    pass`,
          solution: `import numpy as np

def relu(z):
    return np.maximum(0, z)

def relu_backward(grad_out, z):
    return grad_out * (z > 0)`,
          tests: `z = np.array([[-1.0, 2.0], [0.0, 3.0]])
out = relu(z)
assert out is not None, "relu returns nothing yet"
assert out.shape == (2, 2), f"relu should keep the shape (2, 2), got {out.shape}"
assert np.array_equal(out, [[0, 2], [0, 3]]), "relu should replace negative entries with 0 and keep the rest"
assert z[0, 0] == -1.0, "relu should not change its input in place"
g = relu_backward(np.full((2, 2), 5.0), z)
assert g is not None, "relu_backward returns nothing yet"
assert np.array_equal(g, [[0, 5], [0, 5]]), "the gradient passes where z > 0 and is blocked elsewhere"
g = relu_backward(np.array([1.0, -2.0, 3.0]), np.array([4.0, 5.0, -6.0]))
assert np.array_equal(g, [1, -2, 0]), "multiply the incoming gradient by the mask of z: do not clip the gradient itself"`,
          why: 'The mask comes from the forward value z, not from the gradient. A negative gradient passes through an active unit unchanged.',
        },
      ],
    },
    {
      id: 'neural-forward',
      title: 'The forward pass',
      summary: 'Shapes through a small network, how many parameters it has, and how hidden units add up to a curve.',
      widget: 'neural-hinges',
      text: [
        'The forward pass pushes a batch through the layers in order. Each layer is a matrix product, a bias and an activation. Keep the intermediate values: the backward pass needs them.',
        {
          code: `def forward(X, W1, b1, W2, b2):
    Z1 = X @ W1 + b1          # (n, d) @ (d, h) -> (n, h)
    H = np.maximum(0, Z1)     # (n, h)
    return H @ W2 + b2        # (n, h) @ (h, k) -> (n, k)   logits`,
        },
        'The batch size `n` runs down the first axis of every activation and never appears in a weight. A dense layer from `a` inputs to `b` outputs has `a × b` weights and `b` biases. A 784 → 128 → 10 classifier has 784×128 + 128 = 100,480 parameters in the first layer and 128×10 + 10 = 1,290 in the second. Almost all of them sit where the wide input is.',
        'The figure shows what the hidden layer does with a single input. Each ReLU unit is a hinge: zero on one side of its kink and a ramp on the other. The output layer scales the hinges and adds them up. The result is made of straight pieces, with at most one kink per hidden unit, so `h` units give at most `h + 1` pieces. More units, more pieces, a closer fit.',
        'A wide enough hidden layer can approximate any continuous function on a bounded range as closely as you like. That says a good set of weights exists. It does not say how many units it takes or that training will find them. In practice, depth tends to reach the same accuracy with fewer parameters than width alone, because later layers reuse what earlier layers computed. That is a rule of thumb, not a theorem you can lean on.',
        'The last layer returns logits. Apply softmax in one place only, inside the loss. A forward pass that returns probabilities into a loss that expects logits applies softmax twice: no error is raised, and the model trains badly.',
      ],
      rules: [
        'Shapes: `(n, d) @ (d, h)` → `(n, h)`. The batch size is never in a weight shape.',
        'Parameters of a dense layer: inputs × outputs, plus outputs.',
        'A ReLU hidden unit is a hinge. The network output is a sum of scaled hinges: piecewise linear.',
        'On one input, `h` hidden ReLU units give at most `h + 1` straight pieces.',
        'Return logits from the forward pass, and keep `Z1` and `H` for the backward pass.',
      ],
      questions: [
        {
          kind: 'output',
          id: 'neural-forward-1',
          ask: 'A batch of 32 examples goes through a two-layer network. What does this print?',
          code: `import numpy as np

X = np.zeros((32, 20))
W1, b1 = np.zeros((20, 64)), np.zeros(64)
W2, b2 = np.zeros((64, 3)), np.zeros(3)

H = np.maximum(0, X @ W1 + b1)
out = H @ W2 + b2
print(H.shape, out.shape)`,
          answer: '(32, 64) (32, 3)',
          why: 'The inner sizes cancel at each product: (32, 20) @ (20, 64) is (32, 64), and (32, 64) @ (64, 3) is (32, 3). The batch size 32 stays on the first axis all the way through.',
        },
        {
          kind: 'number',
          id: 'neural-forward-2',
          ask: 'How many parameters does a 784 → 128 → 10 network of dense layers have, counting biases?',
          answer: 101770,
          check: '784 * 128 + 128 + 128 * 10 + 10',
          hint: 'Each layer: inputs × outputs weights, plus one bias per output.',
          why: '784×128 + 128 = 100,480 for the first layer and 128×10 + 10 = 1,290 for the second. The layer attached to the wide input holds nearly all of them.',
        },
        {
          kind: 'output',
          id: 'neural-forward-3',
          ask: 'One example through a hidden layer of two ReLU units and a linear output. What does this print?',
          code: `import numpy as np

x = np.array([[1.0, 2.0]])
W1 = np.array([[1.0, -1.0],
               [1.0, 1.0]])
b1 = np.array([0.0, -2.0])
W2 = np.array([[2.0],
               [3.0]])

h = np.maximum(0, x @ W1 + b1)
print(h, h @ W2)`,
          answer: '[[3. 0.]] [[6.]]',
          why: 'x @ W1 is [3, 1]. Adding the bias gives [3, −1], and the ReLU turns that into [3, 0]. The output is 3×2 + 0×3 = 6: the second unit is off, so its output weight plays no part.',
        },
        {
          kind: 'bug',
          id: 'neural-forward-4',
          ask: 'This network runs without errors but can only fit straight lines.',
          code: `def forward(X, W1, b1, W2, b2):
    Z1 = X @ W1 + b1
    H = np.maximum(0, Z1)
    return Z1 @ W2 + b2`,
          line: 4,
          fix: '    return H @ W2 + b2',
          why: '`Z1` and `H` have the same shape, so nothing crashes. But the output layer reads the values from before the ReLU, and the network is two linear layers in a row: one linear layer.',
        },
        {
          kind: 'number',
          id: 'neural-forward-5',
          ask: 'A network with one input, one hidden layer of 5 ReLU units and a linear output draws a line made of straight pieces. At most how many pieces?',
          answer: 6,
          why: 'Each hidden unit adds at most one kink, at x = −b/w. Five kinks cut the line into at most six pieces. Fewer if two units share a kink or one is dead.',
        },
        {
          kind: 'choice',
          id: 'neural-forward-6',
          ask: 'In the figure, set the hidden units to 4, pick unit 3 (its kink is at x = 0) and change the scale of its output weight. Which part of the curve moves?',
          options: [
            'The whole curve',
            'Only the part to the right of x = 0, where that unit is on',
            'Only the part to the left of x = 0',
            'Only the single point at x = 0',
          ],
          answer: 1,
          why: 'To the left of its kink the unit outputs 0, and 0 times any weight is 0. The same holds in training: an example only sends gradient to the weights of the units it switched on.',
        },
        {
          kind: 'number',
          id: 'neural-forward-7',
          ask: 'In the figure, set the hidden units to 8. How many parameters does that network have? (One input, 8 hidden units, one output.)',
          answer: 25,
          check: '1 * 8 + 8 + 8 * 1 + 1',
          why: 'Eight input weights, eight hidden biases, eight output weights and one output bias. The input weight and bias of a unit set where its kink is; the output weight sets how much the slope changes there.',
        },
        {
          kind: 'choice',
          id: 'neural-forward-8',
          ask: 'In the figure, raise the hidden units from 2 to 8. The largest error falls a long way. What is the fitted line at 8 units?',
          options: [
            'A smooth curve, because enough ReLU units round off the corners',
            'Still straight pieces, only more and shorter ones',
            'A polynomial of degree 8',
            'The same two pieces, moved closer to the target',
          ],
          answer: 1,
          why: 'A sum of hinges is always piecewise linear. More units mean more kinks, so the pieces follow the target more closely, but there is never a true curve. Between and beyond its kinks a ReLU network extrapolates in straight lines.',
        },
        {
          kind: 'choice',
          id: 'neural-forward-9',
          ask: 'A single hidden layer, if wide enough, can approximate any continuous function on a bounded range. What is the right practical reading of that result?',
          options: [
            'One hidden layer is always enough, so depth is wasted effort',
            'A good set of weights exists. Nothing is said about how many units it takes or whether training will find them',
            'It holds for sigmoid only, so ReLU networks cannot do it',
            'With enough units the test error is guaranteed to reach zero',
          ],
          answer: 1,
          why: 'The result is about existence. It is silent on width, on optimisation and on generalisation, which are the three things you have to deal with in practice.',
        },
        {
          kind: 'choice',
          id: 'neural-forward-10',
          ask: 'Your forward pass ends with a softmax and returns probabilities. The loss function you call expects logits and applies softmax itself. What happens on a 10-class problem?',
          options: [
            'A shape error',
            'Nothing: softmax of a softmax is the same softmax',
            'It runs, but the loss cannot fall far: the second softmax sees inputs between 0 and 1 and can never produce a confident probability',
            'The loss becomes NaN at the first step',
          ],
          answer: 2,
          why: 'The most confident input the second softmax can get is (1, 0, …, 0), which it turns into a probability of e / (e + 9) ≈ 0.23 for the true class: a loss of about 1.46 at best. Nothing crashes. Return logits and apply softmax once, in the loss.',
        },
        {
          kind: 'write',
          id: 'neural-forward-11',
          numpy: true,
          ask: 'Write the forward pass of a two-layer network: a hidden layer with ReLU, then a linear output layer. Return the output only.',
          starter: `import numpy as np

def forward(X, W1, b1, W2, b2):
    # X: (n, d)   W1: (d, h)   b1: (h,)   W2: (h, k)   b2: (k,)
    pass`,
          solution: `import numpy as np

def forward(X, W1, b1, W2, b2):
    H = np.maximum(0, X @ W1 + b1)
    return H @ W2 + b2`,
          tests: `X = np.array([[1.0, 2.0], [-1.0, 0.0], [0.0, 0.0]])
W1 = np.array([[1.0, -1.0, 0.0], [1.0, 1.0, 2.0]])
b1 = np.array([0.0, -2.0, 1.0])
W2 = np.array([[2.0], [3.0], [-1.0]])
b2 = np.array([0.5])
out = forward(X, W1, b1, W2, b2)
assert out is not None, "the function returns nothing yet"
assert out.shape == (3, 1), f"3 examples and 1 output should give shape (3, 1), got {out.shape}"
assert abs(out[0, 0] - 1.5) < 1e-9, f"the first row should give 1.5, got {out[0, 0]}: is there a ReLU on the hidden layer, and only there?"
assert abs(out[1, 0] + 0.5) < 1e-9, f"the second row should give -0.5, got {out[1, 0]}: the output layer has no activation"
assert abs(out[2, 0] + 0.5) < 1e-9, f"an all-zero input should give -0.5, got {out[2, 0]}: have you added both biases?"`,
          why: 'Two lines: the hidden layer with its ReLU, then the output layer with nothing after it. Outputs can be negative, and an all-zero input still produces something because of the biases.',
        },
      ],
    },
    {
      id: 'neural-backprop',
      title: 'Backpropagation through layers',
      summary: 'The backward pass of a two-layer network in NumPy, shape by shape, and how to prove it is right.',
      text: [
        'The maths module ran the chain rule backward through one neuron. A layer works the same way, with matrices. Start from the gradient of the loss with respect to the network output, which depends on the loss: for softmax with mean cross-entropy it is `(P − Y) / n`, where `P` holds the predicted probabilities and `Y` the one-hot labels. For a mean squared error it is `2 * (out − Y) / n`.',
        {
          code: `# forward                          shape
Z1 = X @ W1 + b1                   # (n, h)
H = np.maximum(0, Z1)              # (n, h)
out = H @ W2 + b2                  # (n, k)

# backward
d_out = (softmax(out) - Y) / n     # (n, k)
dW2 = H.T @ d_out                  # (h, k)   same shape as W2
db2 = d_out.sum(axis=0)            # (k,)
dH = d_out @ W2.T                  # (n, h)
dZ1 = dH * (Z1 > 0)                # (n, h)   the ReLU passes or blocks
dW1 = X.T @ dZ1                    # (d, h)   same shape as W1
db1 = dZ1.sum(axis=0)              # (h,)`,
        },
        'Every dense layer `Z = A @ W + b` follows three patterns. With `delta` as the gradient at `Z`: the weights get `A.T @ delta`, the bias gets `delta.sum(axis=0)`, and the layer below gets `delta @ W.T`. You do not need to memorise the transposes. A gradient has the same shape as the thing it is the gradient of, and there is only one way to multiply the pieces so that the shapes fit.',
        'The bias gradient is a sum over the batch because the same bias is used by every row, and a value used many times collects the gradient from every use. The division by `n` belongs in `d_out`, once. Leave it out and the gradient is a sum over the batch, so it grows with the batch size and the learning rate you tuned means something different at every batch size.',
        'Hand-written gradients are tested with a **gradient check**. Nudge one weight up and down by a small `h`, measure the loss both times, and compare `(L(w + h) − L(w − h)) / (2h)` with what the backward pass says. Use float64 and a tiny network. As a rule of thumb, a relative error below about 1e-6 is a pass and one above 1e-3 is a bug. If the check passes for a later layer and fails for an earlier one, the bug is in between.',
        'Compute every gradient before you change any weight. `dH` must be computed with the `W2` that the forward pass used. Update `W2` first and the gradient for the first layer is quietly wrong.',
      ],
      rules: [
        'For `Z = A @ W + b` with `delta = ∂L/∂Z`: `dW = A.T @ delta`, `db = delta.sum(axis=0)`, `dA = delta @ W.T`.',
        'A gradient has the shape of the thing it is the gradient of. Let the shapes choose the transposes.',
        'Through a ReLU: multiply by the mask `Z > 0` from the forward pass.',
        'Divide by the batch size once, in the gradient of the loss.',
        'Compute all gradients first, then update all weights.',
        'Test every hand-written backward pass with a gradient check.',
      ],
      questions: [
        {
          kind: 'output',
          id: 'neural-backprop-1',
          ask: 'A batch of 8, 16 hidden units, 3 outputs. What does this print?',
          code: `import numpy as np

H = np.ones((8, 16))
d_out = np.ones((8, 3))
W2 = np.ones((16, 3))

dW2 = H.T @ d_out
dH = d_out @ W2.T
print(dW2.shape, dH.shape)`,
          answer: '(16, 3) (8, 16)',
          why: '`dW2` has the shape of `W2`: (16, 8) @ (8, 3) is (16, 3). `dH` has the shape of `H`: (8, 3) @ (3, 16) is (8, 16).',
        },
        {
          kind: 'choice',
          id: 'neural-backprop-2',
          ask: 'A layer computes `Z = A @ W`, with `A` of shape (n, h) and `W` of shape (h, k). `delta` is the gradient at `Z`, shape (n, k), and h, k and n are all different. Which expression is the gradient for `W`?',
          options: ['`A.T @ delta`', '`delta.T @ A`', '`A @ delta.T`', '`delta @ A.T`'],
          answer: 0,
          why: 'The answer must have shape (h, k). `A.T @ delta` is (h, n) @ (n, k) = (h, k). `delta.T @ A` gives (k, h), the transpose, and the other two do not multiply at all.',
        },
        {
          kind: 'output',
          id: 'neural-backprop-3',
          ask: 'One example, one linear layer with no bias, squared error. What does this print?',
          code: `import numpy as np

X = np.array([[1.0, 2.0]])
W = np.array([[1.0],
              [1.0]])
y = np.array([[1.0]])

out = X @ W
delta = 2 * (out - y)       # gradient of (out - y)**2
print(X.T @ delta)`,
          answer: '[[4.]\n [8.]]',
          why: 'The output is 1 + 2 = 3, so delta is 2 × (3 − 1) = 4. Each weight gets delta times its own input: 4×1 and 4×2. The weight on the larger input gets the larger gradient.',
        },
        {
          kind: 'bug',
          id: 'neural-backprop-4',
          ask: 'The backward step of a dense layer. With a batch of 32 and 10 outputs, the bias update fails with a shape error.',
          code: `def dense_backward(delta, A, W):
    # A: (n, d) the layer's input   W: (d, k)   delta: (n, k) gradient at the layer's output
    dW = A.T @ delta
    db = delta.sum(axis=1)
    dA = delta @ W.T
    return dW, db, dA`,
          line: 4,
          fix: '    db = delta.sum(axis=0)',
          why: 'The bias has one entry per output, shape (k,). Summing along axis 1 leaves one number per example, shape (n,). The bias is shared by every row of the batch, so its gradient is the sum over the rows: axis 0.',
        },
        {
          kind: 'bug',
          id: 'neural-backprop-5',
          ask: 'The backward pass of the two-layer network. A gradient check passes for `W2` and `b2` and fails for `W1` and `b1`.',
          code: `def backward(X, Y, Z1, H, out, W2):
    n = X.shape[0]
    d_out = (softmax(out) - Y) / n
    dW2 = H.T @ d_out
    db2 = d_out.sum(axis=0)
    dH = d_out @ W2.T
    dZ1 = dH * (dH > 0)
    dW1 = X.T @ dZ1
    db1 = dZ1.sum(axis=0)
    return dW1, db1, dW2, db2`,
          line: 7,
          fix: '    dZ1 = dH * (Z1 > 0)',
          why: 'The ReLU mask says which units were on in the forward pass, so it comes from `Z1` (or `H`). Masking by the sign of the gradient throws away every negative gradient. Because the second layer checked out, the bug had to be after `dW2` and before `dW1`.',
        },
        {
          kind: 'bug',
          id: 'neural-backprop-6',
          ask: 'A numerical gradient for one weight, for use in a gradient check. It reports exactly twice the true gradient.',
          code: `def numeric_grad(loss, W, i, j, h=1e-5):
    old = W[i, j]
    W[i, j] = old + h
    up = loss(W)
    W[i, j] = old - h
    down = loss(W)
    W[i, j] = old
    return (up - down) / h`,
          line: 8,
          fix: '    return (up - down) / (2 * h)',
          why: 'The two points are 2h apart, so the slope is the difference divided by 2h. A check that is off by a clean factor (2, or the batch size) almost always points to a missing constant, not to wrong calculus.',
        },
        {
          kind: 'choice',
          id: 'neural-backprop-7',
          ask: 'Every formula here is right, yet the gradient for `W1` comes out slightly wrong. Why?',
          code: `dW2 = H.T @ d_out
W2 -= lr * dW2
dH = d_out @ W2.T
dW1 = X.T @ (dH * (Z1 > 0))
W1 -= lr * dW1`,
          options: [
            '`dH` is computed from `W2` after it was updated. The backward pass must use the weights that the forward pass used',
            '`dW2` should be `d_out.T @ H`',
            'The ReLU mask should be `H > 0`, not `Z1 > 0`',
            '`W1` has to be updated before `W2`',
          ],
          answer: 0,
          why: 'The forward pass ran with the old `W2`, so the chain rule needs the old `W2`. Compute all the gradients, then apply all the updates. (`H > 0` and `Z1 > 0` are the same mask for a ReLU.)',
        },
        {
          kind: 'choice',
          id: 'neural-backprop-8',
          ask: 'A backward pass uses `d_out = P - Y`, with no division by the batch size. With batches of 32 it trains well. With batches of 256 and the same learning rate the loss becomes NaN. Why?',
          options: [
            'Large batches give noisier gradients',
            'The gradient is a sum over the batch, so it is now 8 times larger and so is every step',
            'NumPy cannot multiply matrices with 256 rows accurately',
            'The bias gradient needs `axis=1` for large batches',
          ],
          answer: 1,
          why: 'Without the 1/n the gradient scales with the batch size, and the learning rate silently scales with it. Divide once, in the gradient of the loss, and a learning rate keeps its meaning when the batch size changes.',
        },
        {
          kind: 'choice',
          id: 'neural-backprop-9',
          ask: 'You gradient-check a new backward pass in float64. The relative error is 3e-9 for most weights and 0.4 for the weights of one layer. What do you conclude?',
          options: [
            'Fine: numerical gradients are always rough',
            'The backward code for that layer, or for the step that feeds it, has a bug',
            'The step h is too small',
            'The learning rate is too high',
          ],
          answer: 1,
          why: 'A correct gradient agrees with the central difference to many digits. An error of 0.4 is not rounding, it is a wrong formula. The learning rate plays no part in a gradient check: no weights are updated.',
        },
        {
          kind: 'write',
          id: 'neural-backprop-10',
          numpy: true,
          ask: 'Write the backward step of a dense layer `Z = A @ W + b`. Given `delta`, the gradient of the loss at `Z`, return the gradients for `W`, for `b` and for the input `A`.',
          starter: `import numpy as np

def dense_backward(delta, A, W):
    # A: (n, d)   W: (d, k)   delta: (n, k)
    # return (dW, db, dA)
    pass`,
          solution: `import numpy as np

def dense_backward(delta, A, W):
    return A.T @ delta, delta.sum(axis=0), delta @ W.T`,
          tests: `rng = np.random.default_rng(0)
A = rng.standard_normal((4, 3))
W = rng.standard_normal((3, 2))
b = rng.standard_normal(2)
T = rng.standard_normal((4, 2))
def loss(A, W, b):
    return 0.5 * ((A @ W + b - T) ** 2).sum()
delta = A @ W + b - T
out = dense_backward(delta, A, W)
assert out is not None, "the function returns nothing yet"
dW, db, dA = out
assert dW.shape == (3, 2), f"dW should have the shape of W, (3, 2), got {dW.shape}"
assert db.shape == (2,), f"db should have the shape of b, (2,), got {db.shape}"
assert dA.shape == (4, 3), f"dA should have the shape of A, (4, 3), got {dA.shape}"
h = 1e-6
E = np.zeros((3, 2))
E[1, 0] = h
assert abs(dW[1, 0] - (loss(A, W + E, b) - loss(A, W - E, b)) / (2 * h)) < 1e-5, "dW does not match a numerical gradient check"
e = np.array([0.0, h])
assert abs(db[1] - (loss(A, W, b + e) - loss(A, W, b - e)) / (2 * h)) < 1e-5, "db does not match a numerical gradient check"
F = np.zeros((4, 3))
F[2, 1] = h
assert abs(dA[2, 1] - (loss(A + F, W, b) - loss(A - F, W, b)) / (2 * h)) < 1e-5, "dA does not match a numerical gradient check"`,
          why: 'Three lines, and the shapes decide each one. A network of any depth is this function called once per layer, from the last to the first, with the activation masks in between.',
        },
        {
          kind: 'write',
          id: 'neural-backprop-11',
          numpy: true,
          ask: 'Write a numerical gradient for a whole array of weights, using the central difference. `f(W)` returns the loss as one number. Leave `W` as you found it.',
          starter: `import numpy as np

def numeric_grad(f, W, h=1e-5):
    # W: a float array of any shape
    grad = np.zeros_like(W)
    for idx in np.ndindex(W.shape):   # every position in W
        pass
    return grad`,
          solution: `import numpy as np

def numeric_grad(f, W, h=1e-5):
    grad = np.zeros_like(W)
    for idx in np.ndindex(W.shape):
        old = W[idx]
        W[idx] = old + h
        up = f(W)
        W[idx] = old - h
        down = f(W)
        W[idx] = old
        grad[idx] = (up - down) / (2 * h)
    return grad`,
          tests: `W = np.array([[1.0, -2.0], [3.0, 0.5]])
before = W.copy()
g = numeric_grad(lambda M: (M ** 2).sum(), W)
assert g is not None, "the function returns nothing yet"
assert g.shape == (2, 2), f"the gradient should have the shape of W, (2, 2), got {g.shape}"
assert np.allclose(g, 2 * before, atol=1e-6), "the gradient of the sum of squares is 2 * W"
assert np.allclose(W, before, rtol=0, atol=1e-9), "put every weight back to its old value after nudging it"
v = np.array([1.0, 2.0, 3.0])
g = numeric_grad(lambda u: u[0] * u[1] + u[2] ** 3, v, h=0.01)
assert np.allclose(g, [2.0, 1.0, 27.0001], atol=1e-6), "use the central difference: (f(w + h) - f(w - h)) / (2 * h)"`,
          why: 'One weight at a time: nudge up, nudge down, restore, divide by 2h. It costs two forward passes per weight, which is why it is a test for backprop and not a replacement for it.',
        },
      ],
    },
    {
      id: 'neural-init',
      title: 'Initialisation and normalisation',
      summary: 'Where the weights start decides whether a deep network can train at all.',
      widget: 'neural-depth',
      text: [
        'Start every weight at zero and the network cannot learn. All hidden units compute the same value, so they receive the same gradient and stay identical for ever: a layer of a hundred units behaves like one. With ReLU it is worse: the hidden outputs are all zero, so the gradients of both weight matrices are zero and only the output bias moves. Any constant start has the same **symmetry** problem. Random weights break it. Biases can start at zero.',
        'The scale of the random weights matters as much. A unit with `n` inputs and weights of variance σ² has a pre-activation variance of about `n × σ²` times the mean square of its inputs. So each layer multiplies the size of the signal by a factor. Slightly below 1, repeated over many layers, and the signal fades to nothing. Slightly above, and it explodes or saturates. Gradients on the way back are multiplied in the same way. The figure shows it.',
        '**Xavier** (Glorot) initialisation sets the variance to `1 / n_in` (or `2 / (n_in + n_out)`), which holds the size steady for tanh and sigmoid layers. A ReLU zeroes about half of its inputs, which halves the mean square, so **He** initialisation doubles the variance to `2 / n_in`. Match the initialisation to the activation.',
        { code: `W = rng.standard_normal((n_in, n_out)) * np.sqrt(2 / n_in)   # He: std = sqrt(2 / n_in)
b = np.zeros(n_out)` },
        '**Batch normalisation** standardises each feature across the batch: subtract the batch mean, divide by the batch standard deviation, then apply a learned scale and shift. It keeps activations in a sensible range whatever the weights do, which makes deep networks much less sensitive to initialisation and learning rate. During training it uses the statistics of the current batch and keeps running averages; at inference it must use the running averages. Forgetting to switch modes is a classic bug, and very small batches give it poor statistics.',
        '**Layer normalisation** standardises across the features of each example on its own. It does not look at the batch, so it behaves the same in training and at inference and works with any batch size. It is the standard choice in transformers and other sequence models. Whatever you use inside the network, standardise the inputs too, with the mean and standard deviation of the training set: raw features on large or mixed scales saturate the first layer and stretch the loss surface.',
      ],
      rules: [
        'Never start all weights at the same value. Random weights, zero biases.',
        'Each layer multiplies the signal size by a factor; over many layers it must stay near 1.',
        'He for ReLU: std = `√(2 / n_in)`. Xavier for tanh and sigmoid: std = `√(1 / n_in)`.',
        'Batch norm: batch statistics in training, running averages at inference.',
        'Layer norm: per example, independent of the batch, same in training and inference.',
        'Standardise the inputs with statistics from the training set.',
      ],
      questions: [
        {
          kind: 'output',
          id: 'neural-init-1',
          ask: 'Every weight starts at 0.5. The gradients for the three hidden units are the three columns of `dW1`. What does this print?',
          code: `import numpy as np

X = np.array([[1.0, 2.0], [3.0, 4.0]])
y = np.array([[1.0], [0.0]])
W1 = np.full((2, 3), 0.5)
W2 = np.full((3, 1), 0.5)

H = np.maximum(0, X @ W1)
d_out = (H @ W2 - y) / 2
dW1 = X.T @ ((d_out @ W2.T) * (H > 0))
print(np.allclose(dW1[:, 0], dW1[:, 1]), np.allclose(dW1[:, 1], dW1[:, 2]))`,
          answer: 'True True',
          why: 'The three units start equal, compute the same output and get the same gradient. After the update they are still equal, and so on for ever. Three units do the work of one.',
        },
        {
          kind: 'choice',
          id: 'neural-init-2',
          ask: 'A two-layer ReLU network starts with all weights and biases at zero. What can it learn?',
          options: [
            'Everything, only more slowly',
            'Only a constant: the hidden outputs are zero, so both weight gradients are zero and only the output bias moves',
            'Nothing at all: every parameter stays at zero',
            'It learns the first layer but not the second',
          ],
          answer: 1,
          why: '`H` is all zeros, so `dW2 = H.T @ d_out` is zero. `W2` is zero, so `dH = d_out @ W2.T` is zero and so is `dW1`. The output bias still gets a gradient, so the network learns to predict the average and nothing more.',
        },
        {
          kind: 'number',
          id: 'neural-init-3',
          ask: 'A ReLU layer has 200 inputs. What standard deviation does He initialisation give its weights?',
          answer: 0.1,
          tol: 0.001,
          check: 'math.sqrt(2 / 200)',
          why: 'std = √(2 / n_in) = √0.01 = 0.1. The more inputs a unit adds up, the smaller each weight has to be to keep the sum the same size.',
        },
        {
          kind: 'number',
          id: 'neural-init-4',
          ask: 'A layer has 100 inputs, each with a mean square of 1. Its weights are drawn with standard deviation 0.05. What is the variance of each pre-activation?',
          answer: 0.25,
          check: '100 * 0.05 ** 2',
          why: 'n × σ² = 100 × 0.0025 = 0.25. The variance fell to a quarter, so the typical size halved. Ten such layers shrink the signal by about a thousand times.',
        },
        {
          kind: 'choice',
          id: 'neural-init-5',
          ask: 'In the figure, choose ReLU and switch from He to Xavier. The activation size now falls by a factor of about 0.7 at every layer. Why?',
          options: [
            'A ReLU zeroes about half of the signal. Xavier, with variance 1/n, does not make up for that; He, with 2/n, does',
            'Xavier draws its weights from a different kind of random distribution',
            'With Xavier most ReLU units are dead',
            'Ten layers are too many for any initialisation',
          ],
          answer: 0,
          why: 'Halving the mean square at every layer multiplies the size by 1/√2 ≈ 0.7. He doubles the weight variance to cancel it. Ten layers at 0.7 leave about 2% of the signal, and the gradients shrink the same way.',
        },
        {
          kind: 'choice',
          id: 'neural-init-6',
          ask: 'In the figure, choose Tanh and the "Too large" initialisation. The activation size stays close to 1, yet this network will train badly. Why?',
          options: [
            'A size near 1 always means healthy activations',
            'About half of the units sit above 0.95 in size: they are saturated, where the slope of tanh is nearly zero, so almost no gradient gets through',
            'Tanh cannot be used with ten layers',
            'The weights are too small to break symmetry',
          ],
          answer: 1,
          why: 'Tanh cannot explode: it squashes large values to ±1. But a unit pinned at ±1 has a slope near zero, and the gradient through it vanishes. The size looks fine while the readout of saturated units shows the damage.',
        },
        {
          kind: 'bug',
          id: 'neural-init-7',
          ask: 'He initialisation for a ReLU layer. With 512 inputs the activations fade away after a few layers.',
          code: `def init_layer(n_in, n_out, rng):
    W = rng.standard_normal((n_in, n_out)) * (2 / n_in)
    b = np.zeros(n_out)
    return W, b`,
          line: 2,
          fix: '    W = rng.standard_normal((n_in, n_out)) * np.sqrt(2 / n_in)',
          why: '2 / n_in is the variance. Multiplying standard normal numbers by a factor sets their standard deviation, so the factor must be the square root. With 512 inputs the weights were 16 times too small.',
        },
        {
          kind: 'bug',
          id: 'neural-init-8',
          ask: 'Batch normalisation. In training the model does well. In production, where requests arrive one at a time, every prediction is the same.',
          code: `def batchnorm(x, gamma, beta, running_mean, running_var, training, eps=1e-5):
    # x: (batch, features)
    if training:
        mean, var = x.mean(axis=0), x.var(axis=0)
    else:
        mean, var = x.mean(axis=0), x.var(axis=0)
    return gamma * (x - mean) / np.sqrt(var + eps) + beta`,
          line: 6,
          fix: '        mean, var = running_mean, running_var',
          why: 'With a batch of one, the batch mean is the example itself, so `x - mean` is zero and the output is `beta` for every input. At inference batch norm must use the running averages collected during training, so that a prediction does not depend on what else is in the batch.',
        },
        {
          kind: 'choice',
          id: 'neural-init-9',
          ask: 'You train a sequence model with a batch size of 2. Which normalisation fits?',
          options: [
            'Batch norm: it always trains fastest',
            'Layer norm: it normalises each example over its own features, so it does not depend on the batch and is the same in training and at inference',
            'Neither: normalisation needs batches of at least 32',
            'Batch norm, using the batch statistics at inference too',
          ],
          answer: 1,
          why: 'A mean and a standard deviation estimated from two examples are mostly noise, and batch norm would inject that noise into every layer. Layer norm never looks across the batch.',
        },
        {
          kind: 'choice',
          id: 'neural-init-10',
          ask: 'A network takes two raw inputs: age (20 to 80) and income (10,000 to 500,000). The loss swings wildly unless the learning rate is tiny. What do you fix first?',
          options: [
            'Swap ReLU for sigmoid',
            'Standardise each input with the mean and standard deviation of the training set',
            'Add more layers',
            'Start the weights at zero so that large inputs cannot blow up',
          ],
          answer: 1,
          why: 'He initialisation assumes inputs of size about 1. An input of 500,000 makes the first pre-activations huge, and the loss surface is far steeper along the income weight than the age weight. Standardising fixes both. Use training-set statistics and reuse them at inference.',
        },
        {
          kind: 'write',
          id: 'neural-init-11',
          numpy: true,
          ask: 'Write He initialisation for a dense ReLU layer. Draw the weights with `rng.standard_normal((n_in, n_out))` and scale them. Biases start at zero.',
          starter: `import numpy as np

def he_init(n_in, n_out, rng):
    # return (W, b) with W of shape (n_in, n_out) and b of shape (n_out,)
    pass`,
          solution: `import numpy as np

def he_init(n_in, n_out, rng):
    W = rng.standard_normal((n_in, n_out)) * np.sqrt(2 / n_in)
    return W, np.zeros(n_out)`,
          tests: `out = he_init(200, 50, np.random.default_rng(0))
assert out is not None, "the function returns nothing yet"
W, b = out
assert W.shape == (200, 50), f"W should have shape (n_in, n_out) = (200, 50), got {W.shape}"
assert b.shape == (50,) and not b.any(), "the biases should be zeros of shape (n_out,)"
assert abs(W.std() - 0.1) < 0.01, f"the standard deviation should be sqrt(2 / n_in) = 0.1, got {W.std():.4f}"
expected = np.random.default_rng(0).standard_normal((200, 50)) * np.sqrt(2 / 200)
assert np.allclose(W, expected), "draw with rng.standard_normal((n_in, n_out)) and multiply by sqrt(2 / n_in)"
W2, _ = he_init(8, 3, np.random.default_rng(1))
assert abs(W2.std() - 0.5) < 0.25, "the scale should follow n_in: with 8 inputs the standard deviation is 0.5"`,
          why: 'Passing the generator in keeps the function reproducible: the same seed gives the same weights, which is what makes a training run something you can debug.',
        },
      ],
    },
    {
      id: 'neural-optimisers',
      title: 'Optimisers and schedules',
      summary: 'How the step is computed from the gradient, and how the learning rate should change over a run.',
      widget: 'neural-schedule',
      text: [
        'Every optimiser turns a gradient `g` into an update. Plain **SGD** is `w -= lr * g` on a mini-batch. **Momentum** keeps a velocity, `v = beta * v + g`, and steps along it: `w -= lr * v`. Gradients that agree from step to step add up, and with `beta = 0.9` a steady gradient builds to a step ten times the plain one. Gradients that flip sign cancel. That is why it is fast along a valley and calm across it.',
        '**Adam** keeps a running average of the gradient and of its square, and divides one by the root of the other. The effect is that each weight moves by about `lr` per step whatever the scale of its gradient. That makes Adam forgiving: a learning rate near 1e-3 or 3e-4 works on most problems. The bias correction makes up for the averages starting at zero.',
        {
          code: `m = b1 * m + (1 - b1) * g              # b1 = 0.9
v = b2 * v + (1 - b2) * g * g          # b2 = 0.999
m_hat = m / (1 - b1 ** t)              # t counts steps from 1
v_hat = v / (1 - b2 ** t)
w -= lr * m_hat / (np.sqrt(v_hat) + eps)`,
        },
        '**Weight decay** shrinks every weight a little at each step: `w -= lr * wd * w`. With plain SGD that equals an L2 penalty on the loss. With Adam it does not: a penalty added to the gradient is divided by the adaptive scale like everything else. **AdamW** applies the decay as its own step, and it is the version to use. Decay is usually left off biases and normalisation parameters.',
        'A fixed learning rate is rarely the best one. At the start the weights are random, gradients are large and the averages in Adam rest on a handful of batches, so a **warm-up** ramps the rate up from near zero over the first few hundred or thousand steps. Later the rate should fall, so that the weights can settle instead of bouncing around the minimum: in sudden **steps**, or smoothly along a **cosine**. Warm-up followed by cosine decay is a sound default. The peak rate still has to be tuned.',
        'The **batch size** sets how noisy each gradient is and how many updates an epoch contains. A larger batch gives a cleaner gradient but fewer updates per epoch, so the learning rate usually has to rise with it; scaling the rate in proportion to the batch size, with a warm-up, is a common rule of thumb. Memory sets the upper limit.',
      ],
      rules: [
        'Momentum: `v = beta * v + g`, then `w -= lr * v`. A steady gradient builds to `1 / (1 − beta)` times the plain step.',
        'Adam moves each weight by about `lr` per step, whatever the size of its gradient.',
        'Rates do not transfer between optimisers: 0.1 can suit SGD and is far too high for Adam.',
        'Use AdamW for weight decay with Adam, not an L2 term in the loss.',
        'Default schedule: warm-up, then cosine decay. Tune the peak.',
        'Change the batch size and the learning rate needs retuning.',
      ],
      questions: [
        {
          kind: 'output',
          id: 'neural-optimisers-1',
          ask: 'Two steps of SGD with momentum on a gradient that stays at 1. What does this print?',
          code: `w, v = 1.0, 0.0
lr, beta = 0.1, 0.9

for g in [1.0, 1.0]:
    v = beta * v + g
    w = w - lr * v
print(round(w, 2))`,
          answer: '0.71',
          why: 'First step: v = 1, w = 0.9. Second step: v = 0.9 + 1 = 1.9, w = 0.9 − 0.19 = 0.71. Plain SGD would be at 0.8: the velocity is already building.',
        },
        {
          kind: 'number',
          id: 'neural-optimisers-2',
          ask: 'With momentum 0.9 and a gradient that never changes, the step grows and then levels off. How many times larger than the plain SGD step does it become?',
          answer: 10,
          check: '1 / (1 - 0.9)',
          hint: 'The velocity is g × (1 + 0.9 + 0.9² + …).',
          why: 'The sum 1 + 0.9 + 0.81 + … is 1 / (1 − 0.9) = 10. Adding momentum to a run therefore raises the effective learning rate along steady directions by about ten times, so the rate often has to come down.',
        },
        {
          kind: 'output',
          id: 'neural-optimisers-3',
          ask: 'The first Adam step for a gradient of 100 and for a gradient of 0.01. What does this print?',
          code: `import math

def first_adam_step(g, lr=0.001, b1=0.9, b2=0.999, eps=1e-8):
    m = (1 - b1) * g
    v = (1 - b2) * g * g
    m_hat = m / (1 - b1)
    v_hat = v / (1 - b2)
    return lr * m_hat / (math.sqrt(v_hat) + eps)

print(round(first_adam_step(100.0), 4), round(first_adam_step(0.01), 4))`,
          answer: '0.001 0.001',
          why: 'After bias correction m is g and v is g², so the step is lr × g / |g| = lr. A gradient ten thousand times larger moves the weight by the same amount. The learning rate, not the gradient, sets the step size in Adam.',
        },
        {
          kind: 'choice',
          id: 'neural-optimisers-4',
          ask: 'A model trains well with SGD and momentum at a learning rate of 0.1. You switch to Adam and keep 0.1. The loss explodes. Why?',
          options: [
            'Adam cannot train this kind of model',
            'Adam moves every weight by about the learning rate at every step, so 0.1 per step is enormous. Start near 0.001',
            'Adam needs a larger batch size',
            'Momentum and Adam cannot be compared',
          ],
          answer: 1,
          why: 'In SGD the step is lr × gradient, and gradients are often small, so 0.1 can be fine. Adam normalises the gradient away. Its usual range is 1e-4 to 1e-3.',
        },
        {
          kind: 'bug',
          id: 'neural-optimisers-5',
          ask: 'One Adam step. Weights with small gradients take enormous steps and training diverges.',
          code: `def adam_step(w, m, v, g, t, lr=0.001, b1=0.9, b2=0.999, eps=1e-8):
    m = b1 * m + (1 - b1) * g
    v = b2 * v + (1 - b2) * g * g
    m_hat = m / (1 - b1 ** t)
    v_hat = v / (1 - b2 ** t)
    w = w - lr * m_hat / (v_hat + eps)
    return w, m, v`,
          line: 6,
          fix: '    w = w - lr * m_hat / (np.sqrt(v_hat) + eps)',
          why: '`v_hat` averages the squared gradient, so its square root has the scale of the gradient and the ratio is about ±1. Without the root, a gradient of 0.01 is divided by 0.0001 and the step is 100 times the learning rate.',
        },
        {
          kind: 'choice',
          id: 'neural-optimisers-6',
          ask: 'You train with Adam and add weight decay the old way, as an L2 term `wd * w` added to the gradient. What goes wrong, and what is the fix?',
          options: [
            'Nothing: an L2 penalty and weight decay are the same thing for every optimiser',
            'The decay term is divided by the per-weight scale along with the gradient, so weights with large gradients are barely decayed. Use AdamW, which shrinks the weights in a separate step',
            'Adam cannot be combined with any regularisation',
            'The decay is applied twice',
          ],
          answer: 1,
          why: 'The two are the same only for plain SGD. Inside Adam the penalty is rescaled per weight, which is not what you asked for. AdamW decouples it: `w -= lr * wd * w`, outside the adaptive part.',
        },
        {
          kind: 'choice',
          id: 'neural-optimisers-7',
          ask: 'In the figure, choose warm-up + cosine, set the warm-up to 2000 steps and drag to step 200. The rate is 10% of the peak. Why start so low?',
          options: [
            'To save computation in the early steps',
            'The weights are random, the gradients are large and the running averages in Adam rest on a few batches. Small steps stop an early bad update from wrecking the run',
            'Because the loss surface is flat at the start, so large steps would be wasted',
            'To reduce overfitting',
          ],
          answer: 1,
          why: 'The first steps are the least trustworthy and can do the most damage: a huge early update can kill ReLU units or send the loss to NaN. Warm-up costs a small share of the run and lets you use a higher peak rate.',
        },
        {
          kind: 'number',
          id: 'neural-optimisers-8',
          ask: 'In the figure, choose Step and drag to step 8000. What percentage of the peak rate is left?',
          answer: 1,
          why: 'This schedule divides the rate by ten at 50% and again at 75% of the run, so the last quarter runs at 1% of the peak. Each cut usually shows as a sudden drop in the loss curve: the weights stop bouncing and settle lower.',
        },
        {
          kind: 'choice',
          id: 'neural-optimisers-9',
          ask: 'You raise the batch size from 64 to 512 and change nothing else. After the same number of epochs the model is worse. What is the most likely reason?',
          options: [
            'Large batches compute the wrong gradient',
            'There are 8 times fewer weight updates per epoch at the same learning rate. Raise the rate (a common rule of thumb scales it with the batch size, with a warm-up) or train for longer',
            'The gradient is now too noisy',
            'Large batches always overfit',
          ],
          answer: 1,
          why: 'A larger batch gives a less noisy gradient, not a more useful step by itself. With the same rate the model takes an eighth of the steps and travels a shorter distance. The scaling rule is a starting point, not a law: check it on validation loss.',
        },
        {
          kind: 'design',
          id: 'neural-optimisers-10',
          ask: 'You are handed a new model and dataset with no training recipe. How do you choose the optimiser, the learning rate, the schedule and the batch size?',
          checklist: [
            { point: 'Start from a known default: AdamW at about 3e-4 to 1e-3, or the recipe of a published model of the same kind', why: 'A default that trains is worth more than a clever choice that might not. You tune from a working baseline.' },
            { point: 'Pick the batch size from memory and throughput first, then leave it alone', why: 'The best learning rate depends on the batch size, so fix one before you tune the other.' },
            { point: 'Sweep the learning rate on a log scale (for example 1e-5 to 1e-2, three values per power of ten) with short runs', why: 'The rate is the setting that matters most, and its good range is about one power of ten wide. A linear sweep misses it.' },
            { point: 'Use warm-up followed by cosine decay, with the warm-up at a few per cent of the run', why: 'It protects the first steps and lets the weights settle at the end, with only the peak left to tune.' },
            { point: 'Add a modest weight decay (about 0.01 with AdamW), not on biases or normalisation parameters', why: 'It is cheap regularisation. Decaying biases and norm scales gains nothing and can hurt.' },
            { point: 'Compare runs on validation loss, with the seed fixed, changing one thing at a time', why: 'Otherwise you cannot tell which change helped, or whether the difference is noise.' },
            { point: 'Watch the first few hundred steps and clip gradients if the loss spikes', why: 'Most failed runs fail early. Clipping the gradient norm is a cheap guard against a single bad batch.' },
          ],
          why: 'The order matters: get a baseline that trains, fix the batch size, find the learning rate, and only then refine. Most of the gain comes from the learning rate.',
        },
        {
          kind: 'write',
          id: 'neural-optimisers-11',
          ask: 'Write one step of SGD with momentum: update the velocity, then the weight. Return both.',
          starter: `def momentum_step(w, v, grad, lr, beta):
    # v = beta * v + grad, then step along v
    # return (w, v)
    pass`,
          solution: `def momentum_step(w, v, grad, lr, beta):
    v = beta * v + grad
    w = w - lr * v
    return w, v`,
          tests: `out = momentum_step(1.0, 0.0, 1.0, 0.1, 0.9)
assert out is not None, "the function returns nothing yet"
w, v = out
assert abs(v - 1.0) < 1e-12, f"first step: v = 0.9 * 0 + 1 = 1.0, got {v}"
assert abs(w - 0.9) < 1e-12, f"first step: w = 1 - 0.1 * 1 = 0.9, got {w}"
w, v = momentum_step(w, v, 1.0, 0.1, 0.9)
assert abs(v - 1.9) < 1e-12, f"second step: v = 0.9 * 1 + 1 = 1.9, got {v}"
assert abs(w - 0.71) < 1e-12, f"the step uses the velocity, not the raw gradient: 0.9 - 0.1 * 1.9 = 0.71, got {w}"
w, v = momentum_step(2.0, 5.0, -3.0, 0.5, 0.0)
assert abs(w - 3.5) < 1e-12 and abs(v + 3.0) < 1e-12, "with beta = 0 this is plain SGD: w = 2 + 0.5 * 3 = 3.5"`,
          why: 'Two lines, in this order. The velocity is state that lives next to the weights: an optimiser has to keep one per parameter between steps.',
        },
        {
          kind: 'write',
          id: 'neural-optimisers-12',
          ask: 'Write the warm-up + cosine schedule from the figure. For `step < warmup` the rate rises in a straight line from 0 to `peak`. After that it follows half a cosine from `peak` down to 0 at `step = total`.',
          starter: `import math

def lr_at(step, peak, warmup, total):
    # the learning rate to use at this step
    pass`,
          solution: `import math

def lr_at(step, peak, warmup, total):
    if step < warmup:
        return peak * step / warmup
    progress = (step - warmup) / (total - warmup)
    return peak * 0.5 * (1 + math.cos(math.pi * progress))`,
          tests: `assert lr_at(50, 0.01, 100, 1000) is not None, "the function returns nothing yet"
assert abs(lr_at(0, 0.01, 100, 1000)) < 1e-12, "warm-up starts from 0"
assert abs(lr_at(50, 0.01, 100, 1000) - 0.005) < 1e-12, "half-way through the warm-up the rate is half the peak"
assert abs(lr_at(100, 0.01, 100, 1000) - 0.01) < 1e-12, "the rate reaches the peak when the warm-up ends"
assert abs(lr_at(550, 0.01, 100, 1000) - 0.005) < 1e-12, "half-way through the decay the rate is half the peak: measure progress from the end of the warm-up"
assert abs(lr_at(1000, 0.01, 100, 1000)) < 1e-12, "the rate is 0 at the last step"
assert abs(lr_at(500, 2.0, 0, 1000) - 1.0) < 1e-12, "with warmup = 0 this is a plain cosine, and it must not divide by zero"`,
          why: 'Progress through the decay is measured from the end of the warm-up, so the two parts meet at the peak with no jump. A schedule is a pure function of the step, which makes it easy to test and to plot before you train.',
        },
      ],
    },
    {
      id: 'neural-regularise',
      title: 'Fighting overfitting',
      summary: 'What to reach for, and in what order, when training loss falls and validation loss does not.',
      text: [
        'A network overfits when it keeps getting better on the training data while it stops getting better, or gets worse, on data it has not seen. The first remedy is **more data**. It is the only one that makes the model know more; the rest only restrain it. When more data cannot be had, **augmentation** makes it: flips, crops, noise, small shifts. Two conditions apply. The change must not alter the label, and it is applied to the training set only.',
        '**Weight decay** pulls every weight towards zero, and small weights give smoother functions that follow the noise less. It is one number to tune on the validation set. Too much and the model cannot fit even the training data: both losses end up high.',
        '**Dropout** zeroes each activation with probability `p` during training, so that the network cannot rely on any single unit. The survivors are divided by `1 − p` (inverted dropout), which keeps the expected size of the layer unchanged. At evaluation dropout does nothing at all. A model evaluated with dropout still on gives noisy, worse predictions.',
        {
          code: `def dropout(h, p, rng, training):
    if not training:
        return h
    mask = rng.random(h.shape) >= p      # keep each unit with probability 1 - p
    return h * mask / (1 - p)`,
        },
        '**Early stopping** watches the validation loss, keeps the weights from the best epoch, and stops when `patience` epochs pass without an improvement. It costs nothing and should always be on. But the validation score of the chosen epoch is now slightly flattering, because you picked the best of many: the honest number comes from a test set that played no part in any choice.',
        'A **smaller model** has less room to memorise, and it is the last thing to try, not the first. A large model with enough data and regularisation usually beats a small one. A sensible order is: check that the split is sound, get more data, augment, add weight decay and dropout, keep the best checkpoint, and only then shrink the model.',
      ],
      rules: [
        'Overfitting is a gap: training loss falls, validation loss stalls or rises.',
        'More data first, then augmentation that keeps the label, on training data only.',
        'Dropout: mask and divide by `1 − p` in training; do nothing at evaluation.',
        'Early stopping: keep the best validation checkpoint, stop after `patience` bad epochs.',
        'Too much regularisation underfits: both losses high.',
        'Report the final number on a test set that took part in no decision.',
      ],
      questions: [
        {
          kind: 'output',
          id: 'neural-regularise-1',
          ask: 'Inverted dropout with p = 0.5 and a mask that drops the second unit. What does this print?',
          code: `import numpy as np

h = np.array([1.0, 2.0, 3.0, 4.0])
mask = np.array([1, 0, 1, 1])
p = 0.5
print(h * mask / (1 - p))`,
          answer: '[2. 0. 6. 8.]',
          why: 'The dropped unit becomes 0 and the others are divided by 1 − p = 0.5, so they double. On average over many masks each unit keeps its original value.',
        },
        {
          kind: 'number',
          id: 'neural-regularise-2',
          ask: 'Dropout with p = 0.2. By what factor are the surviving activations multiplied during training?',
          answer: 1.25,
          check: '1 / (1 - 0.2)',
          why: '1 / (1 − 0.2) = 1.25. A fifth of the units are gone, so the rest are scaled up to keep the expected total the same. That is what lets evaluation use the layer untouched.',
        },
        {
          kind: 'bug',
          id: 'neural-regularise-3',
          ask: 'A dropout layer. The model gives a different prediction every time it is asked about the same input in production.',
          code: `def dropout(h, p, rng, training):
    mask = rng.random(h.shape) >= p
    if not training:
        return h * mask
    return h * mask / (1 - p)`,
          line: 4,
          fix: '        return h',
          why: 'At evaluation dropout must do nothing. Here it still zeroes random units, so the output is random and, without the scaling, too small as well.',
        },
        {
          kind: 'choice',
          id: 'neural-regularise-4',
          ask: 'A model with dropout 0.5 scores 91% on the validation set inside the training loop and 84% from the evaluation script, on the same data and the same weights. What is the first thing to check?',
          options: [
            'Whether the validation set is too small',
            'Whether the evaluation script switches the model to evaluation mode, so that dropout is off',
            'Whether the learning rate was too high',
            'Whether the model has overfitted',
          ],
          answer: 1,
          why: 'Same weights and same data should give the same score. A difference means the two code paths compute different things, and layers that behave differently in training and evaluation (dropout, batch norm) are the usual cause.',
        },
        {
          kind: 'bug',
          id: 'neural-regularise-5',
          ask: 'Early stopping. The loop always runs to the last epoch and saves a badly overfitted model.',
          code: `best, bad_epochs = float('inf'), 0
for epoch in range(max_epochs):
    train_one_epoch(model, train_data)
    loss = evaluate(model, train_data)
    if loss < best:
        best, bad_epochs = loss, 0
        save(model)
    else:
        bad_epochs += 1
    if bad_epochs >= patience:
        break`,
          line: 4,
          fix: '    loss = evaluate(model, val_data)',
          why: 'Training loss keeps falling as the model memorises, so it never stops improving and the last, most overfitted epoch is always "best". Early stopping has to watch data the model does not train on.',
        },
        {
          kind: 'choice',
          id: 'neural-regularise-6',
          ask: 'Which of these augmentations is a mistake?',
          options: [
            'Random crops of photos, when training a cat-or-dog classifier',
            'Mirroring images left to right, when training a classifier of handwritten letters',
            'Adding faint background noise to speech clips, when training a speech recogniser',
            'Small random rotations of photos of leaves, when training a plant classifier',
          ],
          answer: 1,
          why: 'An augmentation must keep the label true. A mirrored "b" is a "d", and a mirrored "R" is no letter at all, so the model is trained on wrong labels. A mirrored cat is still a cat.',
        },
        {
          kind: 'choice',
          id: 'neural-regularise-7',
          ask: 'To fight overfitting you raise the weight decay from 0.01 to 5. Training loss and validation loss are now both high and close together. What happened?',
          options: [
            'The model is overfitting more than before',
            'The model is underfitting: the decay is so strong that the weights cannot grow enough to fit even the training data',
            'The validation set has leaked into training',
            'Weight decay has no effect at that value',
          ],
          answer: 1,
          why: 'Regularisation trades fit for smoothness. Too much and there is no fit left. The gap has closed, but by making training worse and not validation better. Tune the strength on validation loss, on a log scale.',
        },
        {
          kind: 'choice',
          id: 'neural-regularise-8',
          ask: 'You train for 50 epochs, keep the epoch with the lowest validation loss, and report that validation loss as the performance of the model. What is wrong with the number?',
          options: [
            'Nothing: the validation set was never trained on',
            'It is optimistic: it is the best of 50 noisy measurements, chosen because it was the best. Report on a test set that took no part in the choice',
            'It is pessimistic, because early epochs drag it down',
            'Validation loss cannot be compared between epochs',
          ],
          answer: 1,
          why: 'Picking the minimum of many noisy numbers picks up favourable noise along with real quality. The effect is small for one model and grows with every decision you make against the same validation set.',
        },
        {
          kind: 'design',
          id: 'neural-regularise-9',
          ask: 'A classifier reaches 99% accuracy on its training set and 82% on its validation set. What do you do, and in what order?',
          checklist: [
            { point: 'Check the split before anything else: same distribution, no duplicates across the sets, labels of similar quality', why: 'A gap can come from a validation set that differs from the training set. Regularising cannot fix that.' },
            { point: 'Get more training data if it can be had', why: 'It is the one remedy that adds knowledge. Everything else only limits what the model can memorise.' },
            { point: 'Add augmentation that keeps the labels true, on the training set only', why: 'It multiplies the data you have. Augmenting validation data changes what you are measuring.' },
            { point: 'Add or tune weight decay and dropout, judged by validation loss', why: 'They are cheap, and each is one number. Too much shows up as underfitting.' },
            { point: 'Use early stopping and keep the best checkpoint', why: 'The model at the validation minimum is better than the one at the last epoch, at no cost.' },
            { point: 'Try a smaller model, or start from pretrained weights, only after the above', why: 'Shrinking removes capacity you may need. Pretrained features bring knowledge that your data could not supply.' },
            { point: 'Change one thing at a time and keep a test set untouched until the end', why: 'Otherwise you cannot tell what helped, and every choice made on validation data makes its score a little too good.' },
          ],
          why: 'The order runs from what adds information to what removes capacity. Start by making sure the gap is real.',
        },
        {
          kind: 'write',
          id: 'neural-regularise-10',
          numpy: true,
          ask: 'Write inverted dropout for a given mask (1 keeps a unit, 0 drops it). In training, apply the mask and rescale. At evaluation, return the activations unchanged.',
          starter: `import numpy as np

def dropout(h, mask, p, training):
    # h and mask have the same shape; p is the probability of dropping a unit
    pass`,
          solution: `import numpy as np

def dropout(h, mask, p, training):
    if not training:
        return h
    return h * mask / (1 - p)`,
          tests: `h = np.array([[1.0, 2.0, 3.0, 4.0]])
mask = np.array([[1, 0, 1, 1]])
out = dropout(h, mask, 0.5, True)
assert out is not None, "the function returns nothing yet"
assert np.allclose(out, [[2, 0, 6, 8]]), "in training: zero the dropped units and divide the rest by (1 - p)"
assert np.allclose(dropout(h, mask, 0.2, True), [[1.25, 0, 3.75, 5]]), "divide by (1 - p), not by p"
assert np.array_equal(dropout(h, mask, 0.5, False), [[1.0, 2.0, 3.0, 4.0]]), "at evaluation dropout does nothing: no mask and no scaling"
assert np.array_equal(h, [[1.0, 2.0, 3.0, 4.0]]), "do not change h in place"`,
          why: 'All the work happens in training, so that evaluation is the plain network. The older form scaled by 1 − p at evaluation instead, which is easy to forget when a model is exported.',
        },
        {
          kind: 'write',
          id: 'neural-regularise-11',
          ask: 'Early stopping, given the validation loss of each epoch in order. Training stops as soon as `patience` epochs in a row fail to beat the best loss so far; later epochs never happen. Return the index of the epoch whose checkpoint is kept. An equal loss is not an improvement.',
          starter: `def best_epoch(losses, patience):
    # losses: validation loss after each epoch
    pass`,
          solution: `def best_epoch(losses, patience):
    best, best_i, bad = float('inf'), -1, 0
    for i, loss in enumerate(losses):
        if loss < best:
            best, best_i, bad = loss, i, 0
        else:
            bad += 1
            if bad >= patience:
                break
    return best_i`,
          tests: `out = best_epoch([5, 4, 3, 3.5, 3.2, 2, 1], 2)
assert out is not None, "the function returns nothing yet"
assert out == 2, f"with patience 2, training stops after 3.5 and 3.2, so the losses 2 and 1 are never seen: the answer is epoch 2, got {out}"
assert best_epoch([5, 4, 3, 3.5, 3.2, 2, 1], 3) == 6, "with patience 3 training is never stopped, so the last epoch is the best"
assert best_epoch([3, 3, 3, 3], 5) == 0, "an equal loss is not an improvement: keep the first epoch"
assert best_epoch([1, 2, 2, 0.5, 2, 2, 0.1], 3) == 6, "the count of bad epochs goes back to 0 at every improvement"
assert best_epoch([2, 1], 1) == 1, "an improvement in the last epoch still counts"`,
          why: 'The first test shows the price of early stopping: a short patience can stop before a later, better epoch. Patience trades compute against that risk, and noisy validation curves need more of it.',
        },
      ],
    },
    {
      id: 'neural-curves',
      title: 'Reading loss curves',
      summary: 'What each shape of training and validation curve says is wrong, and what to do about it.',
      text: [
        'Plot the training loss and the validation loss of every run. Before you read the curves, know two numbers. The first is the loss of a model that knows nothing: for `k` classes with cross-entropy it is `ln(k)`, which is 0.69 for two classes, 2.30 for ten and 4.61 for a hundred. A fresh network should start close to it. The second is roughly how low a good model gets on this problem.',
        'The **learning rate** shows in the shape of the training curve. Too high: the loss jumps up and down with no downward trend, or climbs. Too low: it falls in a slow, almost straight line and is still falling when the run ends. About right: a steep fall that bends into a slow decline.',
        'The **gap** between the curves shows the fit. Overfitting: training loss keeps falling while validation loss flattens and turns up. Underfitting: both curves flatten early at a high value, close together; the model or its features are too weak, or it is regularised too hard.',
        'A loss that sits at `ln(k)` means the predictions do not depend on the inputs. That is nearly always a bug and not a tuning problem: labels out of step with inputs, gradients that never reach the weights, weights that are never updated, inputs that are all zero. The test is to **overfit one small batch**. A working network drives the loss on ten or twenty examples to almost zero within a few hundred steps. If it cannot, no amount of data or tuning will help.',
        'Three more shapes are worth knowing. A jagged training curve that trends down is noise from a small batch: smooth it or enlarge the batch. Validation loss below training loss is normal when dropout or augmentation is on only in training, and because the training loss is averaged over an epoch during which the model was still improving; with neither in play, suspect an easy or leaked validation set. A sudden spike followed by `nan` is a step that was too large or a numerical accident such as `log(0)`: lower the learning rate, add warm-up, clip gradients.',
      ],
      rules: [
        'A model that knows nothing has a cross-entropy of `ln(k)`. Stuck there means a bug.',
        'Bouncing or rising: learning rate too high. Slow straight decline: too low.',
        'Training falls, validation rises: overfitting. Both high and flat: underfitting.',
        'Before tuning anything, check that the model can overfit one small batch.',
        'A noisy curve with a clear trend is a small batch, not a problem.',
        'Spike then NaN: lower the rate, warm up, clip gradients, look for `log(0)`.',
      ],
      questions: [
        {
          kind: 'choice',
          id: 'neural-curves-1',
          ask: 'A 10-class classifier, batch size 256, loss recorded once per epoch. What is the most likely problem?',
          chart: {
            x: 'epoch',
            y: 'loss',
            series: [
              { name: 'training', points: [2.3, 1.71, 2.62, 1.48, 2.95, 1.66, 2.41, 1.92, 3.1, 1.58, 2.77, 1.83, 2.52, 1.69, 2.88, 1.75], color: 'accent' },
              { name: 'validation', points: [2.31, 1.8, 2.55, 1.62, 2.9, 1.75, 2.48, 2.01, 3.02, 1.7, 2.7, 1.95, 2.6, 1.78, 2.81, 1.86], color: 'blue' },
            ],
          },
          options: ['The learning rate is too high', 'The learning rate is too low', 'The model is overfitting', 'The batch is too small'],
          answer: 0,
          why: 'Both curves swing by more than a full unit from one epoch to the next and never trend down: each step overshoots. A whole epoch of large batches averages away batch noise, so this is not a small-batch effect. Divide the rate by 3 to 10 and try again.',
        },
        {
          kind: 'choice',
          id: 'neural-curves-2',
          ask: 'Sixteen epochs of the same classifier with a different setting. What do you change?',
          chart: {
            x: 'epoch',
            y: 'loss',
            series: [
              { name: 'training', points: [2.3, 2.28, 2.26, 2.24, 2.22, 2.2, 2.18, 2.16, 2.14, 2.12, 2.1, 2.08, 2.06, 2.04, 2.02, 2.0], color: 'accent' },
              { name: 'validation', points: [2.3, 2.285, 2.265, 2.245, 2.225, 2.205, 2.19, 2.17, 2.15, 2.13, 2.11, 2.09, 2.07, 2.05, 2.035, 2.015], color: 'blue' },
            ],
          },
          options: [
            'Add dropout: the model is overfitting',
            'Raise the learning rate, by about ten times to begin with',
            'Use a larger model: this one has reached its limit',
            'Stop: the model has converged',
          ],
          answer: 1,
          why: 'The loss falls steadily in a straight line and shows no sign of levelling off: the model is learning, far too slowly. A model at its limit flattens out. Converged curves are flat, and these are not.',
        },
        {
          kind: 'choice',
          id: 'neural-curves-3',
          ask: 'Training and validation loss over 16 epochs. What is happening, and what do you do?',
          chart: {
            x: 'epoch',
            y: 'loss',
            series: [
              { name: 'training', points: [2.3, 1.6, 1.2, 0.95, 0.76, 0.61, 0.49, 0.39, 0.31, 0.24, 0.19, 0.15, 0.11, 0.09, 0.07, 0.05], color: 'accent' },
              { name: 'validation', points: [2.32, 1.68, 1.33, 1.12, 0.99, 0.92, 0.9, 0.92, 0.97, 1.04, 1.12, 1.21, 1.3, 1.4, 1.5, 1.6], color: 'blue' },
            ],
          },
          options: [
            'Underfitting: use a larger model',
            'Overfitting from about epoch 6: keep the checkpoint from there, and add data, augmentation or regularisation',
            'The learning rate is too high: lower it',
            'A bug in the validation code: the two curves should match',
          ],
          answer: 1,
          why: 'Validation loss reaches its minimum near epoch 6 and climbs while training loss heads for zero: the model is now memorising. The epoch-6 weights are the ones to keep. To do better than 0.9, the model needs more data or more restraint.',
        },
        {
          kind: 'choice',
          id: 'neural-curves-4',
          ask: 'A 10-class classifier. Both curves flatten early. What does this say?',
          chart: {
            x: 'epoch',
            y: 'loss',
            series: [
              { name: 'training', points: [2.3, 1.8, 1.56, 1.47, 1.43, 1.41, 1.4, 1.4, 1.39, 1.39, 1.39, 1.39, 1.38, 1.38, 1.38, 1.38], color: 'accent' },
              { name: 'validation', points: [2.31, 1.83, 1.6, 1.5, 1.46, 1.44, 1.43, 1.43, 1.42, 1.42, 1.42, 1.42, 1.42, 1.41, 1.41, 1.41], color: 'blue' },
            ],
          },
          options: [
            'Overfitting: add dropout and weight decay',
            'Underfitting: the model cannot fit even the training data. Give it more capacity or better features, or regularise less',
            'The learning rate is too high',
            'The run is healthy and has converged to a good model',
          ],
          answer: 1,
          why: 'There is no gap, so there is nothing to regularise away. The trouble is that the training loss itself is stuck high. More regularisation would make it worse. (If 1.4 were known to be the noise floor of the problem, this would be a finished model: that is why you need the reference numbers.)',
        },
        {
          kind: 'choice',
          id: 'neural-curves-5',
          ask: 'A 10-class classifier over 16 epochs. The loss settles at 2.30 and stays there. What is the most likely cause?',
          chart: {
            x: 'epoch',
            y: 'loss',
            series: [
              { name: 'training', points: [2.46, 2.36, 2.31, 2.3, 2.3, 2.3, 2.3, 2.3, 2.3, 2.3, 2.3, 2.3, 2.3, 2.3, 2.3, 2.3], color: 'accent' },
              { name: 'validation', points: [2.44, 2.35, 2.31, 2.3, 2.31, 2.3, 2.3, 2.3, 2.3, 2.3, 2.3, 2.3, 2.3, 2.3, 2.3, 2.3], color: 'blue' },
            ],
          },
          options: [
            'The model is too small for the problem',
            'A bug: 2.30 is ln(10), the loss of predicting every class equally. The predictions do not depend on the inputs, for example because the labels are out of step with the inputs',
            'The model is overfitting',
            'The learning rate is a little too low',
          ],
          answer: 1,
          why: 'The network has learnt the one thing that needs no input: that the classes are equally common. Even a tiny model beats ln(10) if inputs and labels are wired up properly. Look at the data pipeline and the gradient flow before you touch a hyperparameter.',
        },
        {
          kind: 'number',
          id: 'neural-curves-6',
          ask: 'You start training a classifier with 100 classes, with cross-entropy loss. About what loss do you expect at the very first step? (Two decimals.)',
          answer: 4.61,
          tol: 0.05,
          check: 'math.log(100)',
          why: 'A fresh network gives every class about the same probability, 1/100, and −ln(1/100) = ln(100) ≈ 4.61. A first loss far above that points to an initialisation or scaling problem, and a loss still at 4.61 after hundreds of steps is the flat-line bug.',
        },
        {
          kind: 'choice',
          id: 'neural-curves-7',
          ask: 'Training loss is recorded at every step with a batch size of 4. Validation loss is computed on the whole validation set. How do you read the jagged training curve?',
          chart: {
            x: 'step (hundreds)',
            y: 'loss',
            series: [
              { name: 'training', points: [2.3, 1.62, 2.05, 1.35, 1.78, 1.02, 1.55, 0.88, 1.31, 0.72, 1.18, 0.6, 1.05, 0.49, 0.95, 0.52, 0.86, 0.38, 0.8, 0.41], color: 'accent' },
              { name: 'validation', points: [2.28, 1.95, 1.72, 1.52, 1.36, 1.22, 1.11, 1.02, 0.94, 0.88, 0.83, 0.79, 0.75, 0.72, 0.7, 0.68, 0.66, 0.65, 0.64, 0.63], color: 'blue' },
            ],
          },
          options: [
            'The learning rate is too high: divide it by ten',
            'It is noise: each point is the loss of only four examples. The trend is down and validation falls smoothly, so training is healthy. Plot a moving average, or use a larger batch',
            'The model is overfitting, because training loss dips below validation loss',
            'There is a bug in the loss function',
          ],
          answer: 1,
          why: 'Four examples give a rough estimate of the loss, so the points scatter. The smooth validation curve, measured on many examples, shows the model improving steadily. A learning rate that was too high would make the validation curve bounce as well.',
        },
        {
          kind: 'choice',
          id: 'neural-curves-8',
          ask: 'The model uses dropout of 0.5 and heavy augmentation. Validation loss is below training loss for the whole run. What do you make of it?',
          chart: {
            x: 'epoch',
            y: 'loss',
            series: [
              { name: 'training', points: [2.3, 1.7, 1.35, 1.12, 0.98, 0.88, 0.81, 0.76, 0.72, 0.69, 0.67, 0.65], color: 'accent' },
              { name: 'validation', points: [1.95, 1.38, 1.08, 0.9, 0.79, 0.71, 0.65, 0.61, 0.58, 0.56, 0.54, 0.53], color: 'blue' },
            ],
          },
          options: [
            'Validation data must have leaked into the training set',
            'It is expected here: dropout and augmentation make the training task harder and are switched off for validation, and each training point averages an epoch in which the model was still improving',
            'The model is overfitting',
            'The validation loss is computed wrongly: it can never be below the training loss',
          ],
          answer: 1,
          why: 'The two curves measure different things: training loss is taken on distorted inputs with half the units missing. Without dropout or augmentation the same picture would be suspicious, and you would look for a validation set that is easier than, or shared with, the training set.',
        },
        {
          kind: 'choice',
          id: 'neural-curves-9',
          ask: 'Training loss by step, on a log scale. The next value recorded after the last point was `nan`. What happened, and what do you try?',
          chart: {
            x: 'step (hundreds)',
            y: 'training loss',
            log: true,
            series: [{ name: 'training', points: [2.3, 1.6, 1.21, 0.98, 0.84, 0.75, 0.69, 0.64, 0.61, 0.58, 0.57, 0.93, 4.8, 61], color: 'bad' }],
          },
          options: [
            'Overfitting: add weight decay',
            'One step was too large and the weights blew up. Lower the learning rate or add warm-up, clip the gradient norm, and check for `log(0)` or a division by zero',
            'The batch is too small',
            'The model is too small',
          ],
          answer: 1,
          why: 'A healthy run that explodes within a few steps is numerical, not statistical. Once a weight is infinite or NaN, every later loss is NaN. Find the first step where the loss or the gradient norm jumped and look at that batch too: one corrupt example can be enough.',
        },
        {
          kind: 'choice',
          id: 'neural-curves-10',
          ask: 'A 10-class model will not learn. You train it on one fixed batch of 16 examples, with dropout and weight decay off. After 500 steps the loss on that batch is still 2.1. What does that tell you?',
          options: [
            'The model needs more training data',
            'There is a bug in the model, the loss or the update: a working network memorises 16 examples easily',
            'The model is overfitting',
            'The learning rate schedule needs a longer warm-up',
          ],
          answer: 1,
          why: 'Sixteen examples can be memorised by almost any network, driving the loss near zero. Failing this test rules out data size, regularisation and generalisation in one go and leaves the code. It takes a minute and should be the first thing you run on any new model.',
        },
        {
          kind: 'design',
          id: 'neural-curves-11',
          ask: 'The loss is not going down. What do you check, and in what order?',
          checklist: [
            { point: 'Compare the loss with ln(number of classes), or with the loss of predicting the mean', why: 'Stuck exactly at chance means the predictions ignore the inputs, which points to a bug. Stuck below chance points to capacity or optimisation.' },
            { point: 'Look at one batch as the model receives it: shapes, value ranges, and whether each label belongs to its input', why: 'Shuffling inputs without labels, all-zero inputs and unscaled features are the commonest causes, and none of them raises an error.' },
            { point: 'Try to overfit one small batch with regularisation off', why: 'It separates bugs from tuning. A correct model reaches almost zero loss on a handful of examples.' },
            { point: 'Check the wiring of the loss: logits where logits are expected, and predictions and targets of the same shape', why: 'A double softmax or an (n,) against (n, 1) broadcast gives a loss that looks like a number and trains on nonsense.' },
            { point: 'Check the gradients: finite, not all zero, reaching every layer, and that the weights change after a step', why: 'A detached layer, parameters missing from the optimiser, or dead ReLUs all show up as zero gradients or weights that never move.' },
            { point: 'Sweep the learning rate over several powers of ten', why: 'Too high and too low both look like "not learning". Only once the code is known to work is this the likely cause.' },
            { point: 'Check initialisation and input scaling', why: 'Zero or badly scaled weights and raw inputs give vanishing or exploding signals from the first step.' },
            { point: 'Only then change the architecture: fall back to a small model known to work, and add pieces back one at a time', why: 'Each piece you add back either keeps the model learning or reveals itself as the culprit.' },
          ],
          why: 'The order goes from cheap and likely to expensive and unlikely: data and code first, then the learning rate, then the model. Most networks that will not learn have a bug, not a bad hyperparameter.',
        },
      ],
    },
    {
      id: 'neural-lab',
      title: 'Lab: a network that learns XOR',
      summary: 'Build a two-layer network in NumPy from an empty file: initialise, forward, loss, backward, check, update, train, measure.',
      text: [
        'XOR is the smallest problem that a linear model cannot solve. The four points (0, 0), (0, 1), (1, 0), (1, 1) have the labels 0, 1, 1, 0, and no straight line separates the ones from the zeros. A network with one hidden layer can do it, which makes XOR the classic first test of a network written by hand.',
        'You will build every piece yourself: He initialisation, a forward pass with a ReLU hidden layer and a sigmoid output, the binary cross-entropy loss, the backward pass, a gradient check that proves the backward pass right, the update step, the training loop and an accuracy measure. Frameworks do all of this for you. Having written it once, you will know what they are doing and where to look when they misbehave.',
        'The output is one probability per example, `P = sigmoid(H @ W2 + b2)`, and the loss is the mean of `−(y log p + (1 − y) log(1 − p))`. As with softmax, the gradient of this loss at the pre-activation of the output is `(P − Y) / n`. The labels are kept as a column, shape `(4, 1)`, so that they line up with the predictions.',
        'Each step stands alone: where a step needs functions from earlier steps, they are already in the starter code. The order of the steps is the order in which you should build any model: forward pass first, then the loss, then the gradients and their check, and only then training.',
      ],
      rules: [
        'Build in this order: forward, loss, backward, gradient check, update, loop, metric.',
        'Gradient-check the backward pass before you train. A wrong gradient can still reduce the loss for a while.',
        'Clip probabilities before taking a logarithm.',
        'Keep predictions and labels in the same shape: `(n, 1)` against `(n,)` broadcasts to `(n, n)`.',
        'Fix the seed, and try several: one lucky or unlucky seed proves little.',
      ],
      questions: [
        {
          kind: 'write',
          id: 'neural-lab-1',
          numpy: true,
          ask: 'Step 1: the parameters. Use He initialisation for both weight matrices and zeros for both biases. Draw `W1` first and then `W2`, each with `rng.standard_normal`.',
          starter: `import numpy as np

def init_params(n_in, n_hidden, n_out, rng):
    # return (W1, b1, W2, b2)
    # W1: (n_in, n_hidden)   b1: (n_hidden,)   W2: (n_hidden, n_out)   b2: (n_out,)
    pass`,
          solution: `import numpy as np

def init_params(n_in, n_hidden, n_out, rng):
    W1 = rng.standard_normal((n_in, n_hidden)) * np.sqrt(2 / n_in)
    W2 = rng.standard_normal((n_hidden, n_out)) * np.sqrt(2 / n_hidden)
    return W1, np.zeros(n_hidden), W2, np.zeros(n_out)`,
          tests: `out = init_params(2, 8, 1, np.random.default_rng(0))
assert out is not None, "the function returns nothing yet"
W1, b1, W2, b2 = out
assert W1.shape == (2, 8), f"W1 should have shape (n_in, n_hidden) = (2, 8), got {W1.shape}"
assert W2.shape == (8, 1), f"W2 should have shape (n_hidden, n_out) = (8, 1), got {W2.shape}"
assert b1.shape == (8,) and b2.shape == (1,), "the biases should have shapes (n_hidden,) and (n_out,)"
assert not b1.any() and not b2.any(), "the biases should start at zero"
rng = np.random.default_rng(0)
e1 = rng.standard_normal((2, 8)) * np.sqrt(2 / 2)
e2 = rng.standard_normal((8, 1)) * np.sqrt(2 / 8)
assert np.allclose(W1, e1), "W1: draw rng.standard_normal((n_in, n_hidden)) first and scale it by sqrt(2 / n_in)"
assert np.allclose(W2, e2), "W2: draw rng.standard_normal((n_hidden, n_out)) second and scale it by sqrt(2 / n_hidden)"`,
          why: 'Each layer is scaled by its own number of inputs: 2 for the first and the hidden width for the second. The generator is passed in so that a seed fixes the whole run.',
        },
        {
          kind: 'write',
          id: 'neural-lab-2',
          numpy: true,
          ask: 'Step 2: the forward pass. A ReLU hidden layer, then a sigmoid output. Return the hidden pre-activation `Z1`, the hidden output `H` and the probabilities `P`: the backward pass will need all three.',
          starter: `import numpy as np

def forward(X, W1, b1, W2, b2):
    # return (Z1, H, P) with shapes (n, h), (n, h), (n, 1)
    pass`,
          solution: `import numpy as np

def forward(X, W1, b1, W2, b2):
    Z1 = X @ W1 + b1
    H = np.maximum(0, Z1)
    P = 1 / (1 + np.exp(-(H @ W2 + b2)))
    return Z1, H, P`,
          tests: `X = np.array([[0.0, 0.0], [0.0, 1.0], [1.0, 0.0], [1.0, 1.0]])
W1 = np.array([[1.0, 1.0], [1.0, 1.0]])
b1 = np.array([0.0, -1.0])
W2 = np.array([[1.0], [-2.0]])
b2 = np.array([0.0])
out = forward(X, W1, b1, W2, b2)
assert out is not None, "the function returns nothing yet"
Z1, H, P = out
assert Z1.shape == (4, 2) and H.shape == (4, 2), f"Z1 and H should have shape (4, 2), got {Z1.shape} and {H.shape}"
assert P.shape == (4, 1), f"P should have shape (4, 1), got {P.shape}"
assert np.allclose(Z1[0], [0, -1]), "Z1 is the value before the ReLU: for the input (0, 0) it is the bias, [0, -1]"
assert np.allclose(H, [[0, 0], [1, 0], [1, 0], [2, 1]]), "H is the ReLU of Z1"
assert np.allclose(P[:, 0], [0.5, 0.7310586, 0.7310586, 0.5]), "P is the sigmoid of H @ W2 + b2: here about [0.5, 0.731, 0.731, 0.5]"`,
          why: 'The weights in the test are a hand-made solution to XOR: the first unit counts the ones and the second cancels the case of two. The output score is 0, 1, 1, 0, so a network of this shape can represent the answer. Training has to find weights like these.',
        },
        {
          kind: 'write',
          id: 'neural-lab-3',
          numpy: true,
          ask: 'Step 3: the loss. Binary cross-entropy, averaged over the examples: the mean of `−(y log p + (1 − y) log(1 − p))`. Clip `P` to the range [1e-12, 1 − 1e-12] first so that a probability of exactly 0 or 1 cannot produce `log(0)`. Return a Python float.',
          starter: `import numpy as np

def bce(P, Y):
    # P: predicted probabilities, Y: labels (0 or 1), same shape
    pass`,
          solution: `import numpy as np

def bce(P, Y):
    P = np.clip(P, 1e-12, 1 - 1e-12)
    return float(-(Y * np.log(P) + (1 - Y) * np.log(1 - P)).mean())`,
          tests: `Y = np.array([[0.0], [1.0], [1.0], [0.0]])
out = bce(np.full((4, 1), 0.5), Y)
assert out is not None, "the function returns nothing yet"
assert abs(out - 0.693147) < 1e-5, f"predicting 0.5 everywhere should cost ln(2) = 0.6931, got {out}"
out = bce(np.array([[0.9], [0.1]]), np.array([[1.0], [0.0]]))
assert abs(out - 0.105361) < 1e-5, f"0.9 for a 1 and 0.1 for a 0 should cost -ln(0.9) = 0.1054, got {out}"
out = bce(np.array([[0.2], [0.2]]), np.array([[1.0], [0.0]]))
assert abs(out - 0.916291) < 1e-5, f"the mean of -ln(0.2) and -ln(0.8) is 0.9163, got {out}: use log(1 - p) for the examples labelled 0"
import warnings
with warnings.catch_warnings():
    warnings.simplefilter("ignore")
    out = bce(np.array([[1.0], [0.0]]), np.array([[1.0], [0.0]]))
assert np.isfinite(out) and out < 1e-6, f"perfect predictions should cost about 0, got {out}: clip P before taking the logarithm"`,
          why: 'Without the clip, a perfect prediction computes 0 × log(0), which is NaN, and one NaN poisons the whole run. The first test is the reference number for this problem: a network that knows nothing scores ln(2) ≈ 0.693.',
        },
        {
          kind: 'write',
          id: 'neural-lab-4',
          numpy: true,
          ask: 'Step 4: the backward pass. The gradient of the mean loss at the output pre-activation is `(P − Y) / n`. Work back from there and return the gradients for `W1`, `b1`, `W2` and `b2`, in that order.',
          starter: `import numpy as np

def forward(X, W1, b1, W2, b2):
    Z1 = X @ W1 + b1
    H = np.maximum(0, Z1)
    P = 1 / (1 + np.exp(-(H @ W2 + b2)))
    return Z1, H, P

def backward(X, Y, Z1, H, P, W2):
    # return (dW1, db1, dW2, db2)
    pass`,
          solution: `import numpy as np

def forward(X, W1, b1, W2, b2):
    Z1 = X @ W1 + b1
    H = np.maximum(0, Z1)
    P = 1 / (1 + np.exp(-(H @ W2 + b2)))
    return Z1, H, P

def backward(X, Y, Z1, H, P, W2):
    d_out = (P - Y) / X.shape[0]
    dW2 = H.T @ d_out
    db2 = d_out.sum(axis=0)
    dZ1 = (d_out @ W2.T) * (Z1 > 0)
    dW1 = X.T @ dZ1
    db1 = dZ1.sum(axis=0)
    return dW1, db1, dW2, db2`,
          tests: `rng = np.random.default_rng(3)
X = np.array([[0.0, 0.0], [0.0, 1.0], [1.0, 0.0], [1.0, 1.0]])
Y = np.array([[0.0], [1.0], [1.0], [0.0]])
params = [rng.standard_normal((2, 5)), rng.standard_normal(5), rng.standard_normal((5, 1)), rng.standard_normal(1)]
def loss(ps):
    P = forward(X, *ps)[2]
    return float(-(Y * np.log(P) + (1 - Y) * np.log(1 - P)).mean())
Z1, H, P = forward(X, *params)
out = backward(X, Y, Z1, H, P, params[2])
assert out is not None, "the function returns nothing yet"
assert len(out) == 4, "return four gradients: dW1, db1, dW2, db2"
names = ["dW1", "db1", "dW2", "db2"]
for name, g, p in zip(names, out, params):
    assert g.shape == p.shape, f"{name} should have the shape of its parameter, {p.shape}, got {g.shape}"
h = 1e-6
for k in [2, 3, 0, 1]:
    p = params[k]
    num = np.zeros_like(p)
    for idx in np.ndindex(p.shape):
        old = p[idx]
        p[idx] = old + h
        up = loss(params)
        p[idx] = old - h
        down = loss(params)
        p[idx] = old
        num[idx] = (up - down) / (2 * h)
    assert np.allclose(out[k], num, atol=1e-6), f"{names[k]} does not match a numerical gradient check"`,
          why: 'The tests are a gradient check on every parameter, starting with the output layer so that the first failure tells you how far back the bug is. The hidden biases in the test are not zero: with a zero bias the input (0, 0) sits exactly on the kink of the ReLU, where a numerical slope is not defined.',
        },
        {
          kind: 'write',
          id: 'neural-lab-5',
          numpy: true,
          ask: 'Step 5: a gradient check you can reuse. Given a loss function `f(W)`, the weights `W` and the gradient `dW` from your backward pass, return the largest relative error over all entries: `|numeric − dW| / max(|numeric| + |dW|, 1e-8)`, with the numeric gradient from a central difference. Leave `W` unchanged.',
          starter: `import numpy as np

def grad_error(f, W, dW, h=1e-5):
    # the largest relative error between dW and a numerical gradient
    worst = 0.0
    for idx in np.ndindex(W.shape):   # every position in W
        pass
    return worst`,
          solution: `import numpy as np

def grad_error(f, W, dW, h=1e-5):
    worst = 0.0
    for idx in np.ndindex(W.shape):
        old = W[idx]
        W[idx] = old + h
        up = f(W)
        W[idx] = old - h
        down = f(W)
        W[idx] = old
        numeric = (up - down) / (2 * h)
        error = abs(numeric - dW[idx]) / max(abs(numeric) + abs(dW[idx]), 1e-8)
        worst = max(worst, error)
    return worst`,
          tests: `W = np.array([[1.0, -2.0], [3.0, 0.5]])
before = W.copy()
f = lambda M: float((M ** 3).sum())
out = grad_error(f, W, 3 * W ** 2)
assert out is not None, "the function returns nothing yet"
assert out < 1e-7, f"a correct gradient should give an error below 1e-7, got {out}"
assert np.allclose(W, before, rtol=0, atol=1e-9), "put every weight back after nudging it"
wrong = 3 * before ** 2
wrong[1, 0] *= 4
out = grad_error(f, W, wrong)
assert abs(out - 0.6) < 1e-3, f"one entry that is 4 times too large should give a relative error of 3/5 = 0.6, got {out}"
out = grad_error(f, W, 12 * before ** 2)
assert abs(out - 0.6) < 1e-3, f"a gradient that is 4 times too large everywhere should give 0.6, got {out}"
Z = np.zeros((2, 2))
assert grad_error(lambda M: float((M ** 2).sum()), Z, np.zeros((2, 2))) < 1e-7, "when both gradients are 0 the error is 0: guard the division"`,
          why: 'The relative error makes one threshold work for large and small gradients alike. A gradient that is exactly 4 times too large on a batch of 4 would be the missing division by n, and the check reports it as 0.6, nowhere near a pass.',
        },
        {
          kind: 'write',
          id: 'neural-lab-6',
          numpy: true,
          ask: 'Step 6: the update. Given a list of parameter arrays and a matching list of gradients, return a new list after one step of gradient descent. Do not modify the arrays you were given.',
          starter: `import numpy as np

def sgd_step(params, grads, lr):
    # params and grads are lists of arrays of matching shapes
    pass`,
          solution: `import numpy as np

def sgd_step(params, grads, lr):
    return [p - lr * g for p, g in zip(params, grads)]`,
          tests: `W = np.array([[1.0, 2.0], [3.0, 4.0]])
b = np.array([0.5, -0.5])
out = sgd_step([W, b], [np.ones((2, 2)), np.array([1.0, -1.0])], 0.1)
assert out is not None, "the function returns nothing yet"
assert len(out) == 2, "return one updated array per parameter"
assert np.allclose(out[0], [[0.9, 1.9], [2.9, 3.9]]), "each weight moves against its gradient: w - lr * g"
assert np.allclose(out[1], [0.4, -0.4]), "the bias is updated in the same way: b - lr * g"
assert W[0, 0] == 1.0 and b[0] == 0.5, "build new arrays: p - lr * g, not p -= lr * g"`,
          why: 'Returning new arrays keeps the old weights intact until every gradient has been used, which removes the update-order bug by construction. Real frameworks update in place to save memory, and so have to be careful about exactly that.',
        },
        {
          kind: 'write',
          id: 'neural-lab-7',
          numpy: true,
          ask: 'Step 7: the training loop. Initialise with `init_params(2, n_hidden, 1, rng)`. Then, `steps` times: run the forward pass, record the loss, run the backward pass, update every parameter. Return the final parameters as a tuple `(W1, b1, W2, b2)` and the list of recorded losses.',
          starter: `${XOR_HELPERS}

${XOR_BACKWARD}

def train(X, Y, n_hidden, lr, steps, rng):
    # return (params, losses): losses[i] is the loss before update i
    pass`,
          solution: `${XOR_HELPERS}

${XOR_BACKWARD}

def train(X, Y, n_hidden, lr, steps, rng):
    params = init_params(2, n_hidden, 1, rng)
    losses = []
    for _ in range(steps):
        Z1, H, P = forward(X, *params)
        losses.append(bce(P, Y))
        grads = backward(X, Y, Z1, H, P, params[2])
        params = tuple(p - lr * g for p, g in zip(params, grads))
    return params, losses`,
          tests: `X = np.array([[0.0, 0.0], [0.0, 1.0], [1.0, 0.0], [1.0, 1.0]])
Y = np.array([[0.0], [1.0], [1.0], [0.0]])
out = train(X, Y, 8, 0.5, 2000, np.random.default_rng(0))
assert out is not None, "the function returns nothing yet"
params, losses = out
assert len(params) == 4, "return the four parameters (W1, b1, W2, b2)"
assert len(losses) == 2000, f"record one loss per step: expected 2000, got {len(losses)}"
start = bce(forward(X, *init_params(2, 8, 1, np.random.default_rng(0)))[2], Y)
assert abs(losses[0] - start) < 1e-9, "the first recorded loss should be the loss of the freshly initialised network, before any update"
assert losses[-1] < losses[0], "the loss should fall: are you stepping against the gradient?"
assert losses[-1] < 0.05, f"after 2000 steps the loss should be below 0.05, got {losses[-1]:.3f}: is every parameter being updated?"
P = forward(X, *params)[2]
assert ((P > 0.5) == (Y == 1)).all(), "the trained network should get all four XOR points right"`,
          why: 'Forward, loss, backward, update: every training loop ever written has this shape. The loss starts near ln(2) ≈ 0.69, the know-nothing value, and ends near zero, which for four points is the overfit-one-batch test passing.',
        },
        {
          kind: 'write',
          id: 'neural-lab-8',
          numpy: true,
          ask: 'Step 8: the metric. Return the share of examples classified correctly, calling a probability above 0.5 a prediction of 1. `P` may arrive as a column of shape `(n, 1)` while `Y` is flat with shape `(n,)`, or the other way round: the answer must be right either way.',
          starter: `import numpy as np

def accuracy(P, Y):
    # P: probabilities, Y: labels (0 or 1). Return a float between 0 and 1.
    pass`,
          solution: `import numpy as np

def accuracy(P, Y):
    predicted = np.reshape(P, -1) > 0.5
    actual = np.reshape(Y, -1) == 1
    return float((predicted == actual).mean())`,
          tests: `P = np.array([[0.9], [0.2], [0.6], [0.4]])
Y = np.array([[1.0], [0.0], [0.0], [0.0]])
out = accuracy(P, Y)
assert out is not None, "the function returns nothing yet"
assert abs(out - 0.75) < 1e-9, f"three of the four predictions are right: expected 0.75, got {out}"
out = accuracy(P, np.array([1.0, 0.0, 0.0, 0.0]))
assert abs(out - 0.75) < 1e-9, f"with P of shape (4, 1) and Y of shape (4,) the answer is still 0.75, got {out}: flatten both before comparing"
out = accuracy(np.array([0.9, 0.2, 0.6, 0.4]), Y)
assert abs(out - 0.75) < 1e-9, f"with P of shape (4,) and Y of shape (4, 1) the answer is still 0.75, got {out}"
assert accuracy(np.array([[0.5]]), np.array([[0.0]])) == 1.0, "a probability of exactly 0.5 is not above 0.5, so it counts as a prediction of 0"`,
          why: 'Comparing a (4, 1) array with a (4,) array broadcasts to (4, 4) and silently reports 0.5 here instead of 0.75. Flattening both sides makes the metric safe whatever shape the caller uses.',
        },
        {
          kind: 'design',
          id: 'neural-lab-9',
          ask: 'With 8 hidden units the lab network solves XOR for every seed from 0 to 19. With 4 hidden units and the same settings, 5 of those 20 seeds stall with 3 of the 4 points right and a loss that stays near 0.35 or 0.48. How do you find out why, and what do you do about it?',
          checklist: [
            { point: 'Place the number: 0.35 to 0.48 is below ln(2) ≈ 0.69, so the network has learnt part of the problem', why: 'A loss at chance would suggest a wiring bug. A loss stuck part of the way down suggests the optimiser is stuck or capacity has been lost.' },
            { point: 'Rule out a bug: the gradient check passes, and the same code solves the other seeds', why: 'Code that works for 15 seeds out of 20 is not wrong. What differs between seeds is the starting weights.' },
            { point: 'Look at the hidden layer of a stalled run: for each unit, on which of the four inputs is it on?', why: 'A unit that is off for all four inputs is dead, and units that respond in the same way are redundant. Too few useful hinges are left to bend the output twice.' },
            { point: 'Check that the gradients of the stuck units are zero', why: 'That confirms the run cannot recover with more steps, and that waiting or a longer schedule is no remedy.' },
            { point: 'Do not start by tuning the learning rate', why: 'The loss is flat, not bouncing. A different rate does not revive a unit whose gradient is exactly zero.' },
            { point: 'Give the network spare units: 8 instead of 4', why: 'With more random hinges the chance that enough of them start in a useful place rises sharply. Extra width is cheap insurance.' },
            { point: 'Or keep units alive: a leaky ReLU or tanh, or small positive starting biases', why: 'Each of these leaves a non-zero gradient for a unit that starts in a bad place, so it can move.' },
            { point: 'Report results over several seeds, not one', why: 'A single run would have told you either "it works" or "it is broken". Both would have been wrong.' },
          ],
          why: 'A network with the bare minimum of units depends on a lucky start. Real networks are wide partly for this reason: among many random units, enough are useful from the first step.',
        },
      ],
    },
  ],
}
