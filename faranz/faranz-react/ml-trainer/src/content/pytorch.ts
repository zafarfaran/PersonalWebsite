import type { Module } from '../types'

export const pytorch: Module = {
  id: 'pytorch',
  title: 'PyTorch in practice',
  summary: 'The framework most models are written in, taught through the code you will read, write and debug.',
  lessons: [
    {
      id: 'pytorch-tensors',
      title: 'Tensors: shape, dtype, device',
      summary: 'The array everything is made of, and the handful of operations that cause most shape bugs.',
      widget: 'pytorch-shapes',
      text: [
        'A tensor is an n-dimensional array with three properties you will check constantly: its **shape**, its **dtype** and its **device**. `torch.tensor([1, 2, 3])` is `int64`; add a decimal point and it is `float32`. Model weights are `float32` and class labels are `int64`, and many errors are one of the two being the other. A tensor lives on the CPU or on a GPU, and an operation between tensors on different devices raises an error.',
        '`reshape` and `view` keep the numbers in the same row-by-row order and read them with a new shape; a `-1` means "work this size out". `unsqueeze(d)` inserts an axis of size 1 at position `d`, and `squeeze(d)` removes one. `squeeze()` with no argument removes every axis of size 1, including a batch that happens to hold one example, so name the axis. `permute` reorders the axes, which moves the numbers. An image loaded from a file is `(height, width, channels)` and a convolution wants `(channels, height, width)`: that is a `permute`, never a `reshape`.',
        { code: `x = torch.arange(6).reshape(2, 3)   # [[0, 1, 2], [3, 4, 5]]
x.unsqueeze(0).shape     # (1, 2, 3)   a batch of one
x.permute(1, 0)          # [[0, 3], [1, 4], [2, 5]]   axes swapped
x.reshape(3, 2)          # [[0, 1], [2, 3], [4, 5]]   same shape, different contents
x.sum(dim=0)             # [3, 5, 7]   the axis you sum over disappears` },
        '`view`, `permute`, `unsqueeze`, slicing and (when it can) `reshape` return a **view**: a new tensor object that shares memory with the old one. Write into one and the other changes. `.clone()` makes a real copy. Most "my data changed by itself" bugs are a view that was written to.',
        'Broadcasting works as in NumPy: line the shapes up from the right, and each pair of sizes must be equal or one of them 1. The same trap applies: `(n, 1)` against `(n,)` gives `(n, n)` without an error. A reduction such as `sum(dim=1)` removes the axis unless you pass `keepdim=True`.',
        '`torch.from_numpy(a)` shares memory with the array and keeps its dtype, which for NumPy floats is `float64`, so call `.float()` before feeding a model. Going back, `t.numpy()` only works for a CPU tensor that is not tracking gradients: the full form is `t.detach().cpu().numpy()`.',
      ],
      rules: [
        'Know the shape, dtype and device of every tensor. Weights are `float32`, class labels are `int64`.',
        '`reshape` re-reads the numbers in the same order. `permute` moves axes. They are not interchangeable.',
        '`unsqueeze(d)` adds a size-1 axis, `squeeze(d)` removes one. Always name the axis.',
        'Views share memory. Use `.clone()` when you need a copy.',
        '`(n, 1)` with `(n,)` broadcasts to `(n, n)`. Make shapes match before subtracting.',
        'NumPy and back: `torch.from_numpy(a).float()` and `t.detach().cpu().numpy()`.',
      ],
      questions: [
        {
          kind: 'output',
          id: 'pytorch-tensors-1',
          ask: 'What does this print?',
          code: `import torch

x = torch.arange(6).reshape(2, 3)
print(x.unsqueeze(0).shape)`,
          answer: 'torch.Size([1, 2, 3])',
          why: '`unsqueeze(0)` puts a new axis of size 1 at the front. This is how a single example becomes a batch of one before it goes into a model.',
        },
        {
          kind: 'output',
          id: 'pytorch-tensors-2',
          ask: 'What does this print?',
          code: `import torch

a = torch.zeros(4)
b = a.view(2, 2)
b[0, 0] = 5
print(a)`,
          answer: 'tensor([5., 0., 0., 0.])',
          why: '`view` does not copy. `b` is another way of reading the memory of `a`, so writing into `b` changes `a`. Use `a.clone().view(2, 2)` if you need them to be separate.',
        },
        {
          kind: 'output',
          id: 'pytorch-tensors-3',
          ask: 'What does this print?',
          code: `import torch

a = torch.tensor([1, 2, 3])
b = torch.tensor([1.0, 2.0])
print(a.dtype, b.dtype)`,
          answer: 'torch.int64 torch.float32',
          why: 'Whole numbers become `int64` and decimals become `float32`. That is the right default for labels and for inputs, but a feature column typed without decimal points arrives as integers and has to be converted with `.float()`.',
        },
        {
          kind: 'output',
          id: 'pytorch-tensors-4',
          ask: 'What does this print?',
          code: `import numpy as np
import torch

a = np.array([1.0, 2.0, 3.0])
t = torch.from_numpy(a)
a[0] = 9
print(t)`,
          answer: 'tensor([9., 2., 3.], dtype=torch.float64)',
          hint: 'Two things: does `from_numpy` copy, and what is the dtype of a NumPy array of floats?',
          why: '`from_numpy` shares memory with the array, so the change shows through. It also keeps NumPy\'s `float64`. A `float32` model fed this tensor fails with a dtype error, which is why the usual line is `torch.from_numpy(a).float()`.',
        },
        {
          kind: 'choice',
          id: 'pytorch-tensors-5',
          ask: 'In the figure, choose `x.permute(1, 0)` and then `x.reshape(3, 2)`. Both results have shape (3, 2). What is the difference?',
          options: [
            'None: two tensors with the same shape made from the same data are equal',
            '`permute` turns the rows into columns, so the numbers move; `reshape` keeps them in the same reading order and only breaks the lines in different places',
            '`reshape` copies the data and `permute` does not',
            '`permute` only works on square tensors',
          ],
          answer: 1,
          why: 'After `permute` the first row is [0, 3]; after `reshape` it is [0, 1]. The shapes agree, so nothing downstream complains. Using `reshape` where a `permute` is needed scrambles the data without an error.',
        },
        {
          kind: 'bug',
          id: 'pytorch-tensors-6',
          ask: 'This prepares a batch of images for a convolutional network. It runs, the shapes are right, and the model never learns.',
          code: `def to_model_input(images):
    # images: NumPy array (batch, height, width, 3), values 0 to 255
    x = torch.from_numpy(images).float() / 255
    x = x.reshape(x.shape[0], 3, x.shape[1], x.shape[2])
    return x`,
          line: 4,
          fix: '    x = x.permute(0, 3, 1, 2)',
          why: 'Moving the channel axis from last to second is a reordering of axes. `reshape` gives the requested shape but reads the numbers in the old order, so each "channel" is a jumble of pixels from all three colours.',
        },
        {
          kind: 'choice',
          id: 'pytorch-tensors-7',
          ask: 'A regression model returns `pred` with shape (32, 1). The targets `y` have shape (32,). What is the shape of `pred - y`?',
          code: `pred = model(x)                  # (32, 1)
loss = ((pred - y) ** 2).mean()  # y: (32,)`,
          options: ['(32,)', '(32, 1)', '(32, 32)', 'It raises a shape error'],
          answer: 2,
          why: 'Aligned from the right, 1 against 32 stretches and the missing axis stretches too: every prediction minus every target. The mean is still one number, so training runs and learns to predict the average. Use `pred.squeeze(1)` first.',
        },
        {
          kind: 'output',
          id: 'pytorch-tensors-8',
          ask: 'What does this print?',
          code: `import torch

x = torch.zeros(1, 3, 1)
print(x.squeeze().shape, x.squeeze(0).shape)`,
          answer: 'torch.Size([3]) torch.Size([3, 1])',
          why: 'With no argument, `squeeze` removes every axis of size 1. With an axis, it removes only that one. Code that calls `squeeze()` on model output breaks the day a batch holds a single example, because the batch axis goes too.',
        },
        {
          kind: 'output',
          id: 'pytorch-tensors-9',
          ask: 'What does this print?',
          code: `import torch

x = torch.arange(6).reshape(2, 3)
print(x.sum(dim=0))`,
          answer: 'tensor([3, 5, 7])',
          why: 'Summing over `dim=0` removes axis 0 (the two rows) and leaves one total per column: 0+3, 1+4, 2+5. The figure shows the same operation.',
        },
        {
          kind: 'bug',
          id: 'pytorch-tensors-10',
          ask: 'This crashes with "mean(): could not infer output dtype. Input dtype must be either a floating point or complex dtype".',
          code: `def accuracy(logits, labels):
    # logits: (batch, classes)   labels: (batch,)
    preds = logits.argmax(dim=1)
    return (preds == labels).mean().item()`,
          line: 4,
          fix: '    return (preds == labels).float().mean().item()',
          why: 'A comparison gives a tensor of booleans, and PyTorch does not take the mean of booleans or integers. Convert to float first. NumPy would have done it for you, which is why the habit carries over wrongly.',
        },
        {
          kind: 'choice',
          id: 'pytorch-tensors-11',
          ask: 'A model works on the CPU. On the GPU its `forward` fails with "Expected all tensors to be on the same device". The line at fault is `mask = torch.ones(x.shape[0], 1)`. What is the right fix?',
          options: [
            'Move the input back with `x = x.cpu()` at the top of `forward`',
            'Create the tensor where the input is: `torch.ones(x.shape[0], 1, device=x.device)`',
            'Call `model.to("cuda")` a second time',
            'Wrap the line in `torch.no_grad()`',
          ],
          answer: 1,
          why: 'A new tensor is created on the CPU unless you say otherwise. `model.to(device)` moves the parameters, not tensors made later inside `forward`. Taking the device from the input keeps the code working on either.',
        },
        {
          kind: 'write',
          id: 'pytorch-tensors-12',
          ask: 'Write the broadcasting rule. Given two shapes as tuples, return the shape of the result, or `None` if they cannot be broadcast.',
          starter: `def broadcast_shape(a, b):
    # line the shapes up from the right
    # sizes must be equal, or one of them must be 1
    pass`,
          solution: `def broadcast_shape(a, b):
    out = []
    for i in range(1, max(len(a), len(b)) + 1):
        x = a[-i] if i <= len(a) else 1
        y = b[-i] if i <= len(b) else 1
        if x != y and x != 1 and y != 1:
            return None
        out.append(max(x, y))
    return tuple(reversed(out))`,
          tests: `assert broadcast_shape((2, 3), (3,)) is not None, "the function returns nothing yet"
assert broadcast_shape((2, 3), (3,)) == (2, 3), "(2, 3) with (3,) should give (2, 3)"
assert broadcast_shape((3, 1), (1, 4)) == (3, 4), "(3, 1) with (1, 4) should give (3, 4)"
assert broadcast_shape((32, 1), (32,)) == (32, 32), "(32, 1) with (32,) should give (32, 32): the classic silent bug"
assert broadcast_shape((8, 3, 4, 4), (3, 1, 1)) == (8, 3, 4, 4), "a per-channel value (3, 1, 1) should broadcast over a batch of images"
assert broadcast_shape((2, 3), (2,)) is None, "(2, 3) with (2,) cannot be broadcast: 3 against 2"
assert broadcast_shape((), (5,)) == (5,), "a scalar broadcasts with anything"`,
          why: 'Walk both shapes from the right, treating a missing axis as size 1. Being able to run this rule in your head is what lets you spot the (32, 32) case before it costs you a day.',
        },
      ],
    },
    {
      id: 'pytorch-autograd',
      title: 'Autograd: gradients for free',
      summary: 'How PyTorch records a calculation and walks it backward, and the four ways people trip over it.',
      text: [
        'Set `requires_grad=True` on a tensor and PyTorch records every operation done with it. Call `backward()` on the final number and it walks that record in reverse, applying the chain rule, and stores the result in the `.grad` of each tensor you started from. The parameters of a model require gradients already, so in practice you only call `loss.backward()`.',
        { code: `x = torch.tensor(3.0, requires_grad=True)
y = x ** 2
y.backward()
x.grad        # tensor(6.)   dy/dx = 2x` },
        '`backward()` **adds** to `.grad`, it does not replace it. That is deliberate: a value used in two places gets the sum of both gradients. The consequence is that gradients from the previous step are still there unless you zero them. Also, `backward()` starts from a single number: reduce a tensor with `.sum()` or `.mean()` first.',
        'Inside `with torch.no_grad():` nothing is recorded. Use it for evaluation, where it saves memory and time, and for changing weights by hand. `x.detach()` gives a tensor with the same values that is cut off from the record, so gradients treat it as a constant. `.item()` turns a one-element tensor into a Python number. Keep a running total with `loss.item()`: adding up `loss` itself keeps the record of every batch alive and memory grows until the process dies.',
        'In-place operations (`+=`, `relu_()`, `x[0] = 1`) overwrite values. Some backward steps need the value that was overwritten, and PyTorch then raises an error at `backward()`. A parameter itself cannot be changed in place while it is being tracked. Under `no_grad`, `w -= lr * w.grad` is the correct update. `w = w - lr * w.grad` is not: it makes a new tensor with the same name, and the parameter that requires gradients is gone.',
      ],
      rules: [
        '`loss.backward()` fills `.grad` for every parameter the loss depends on.',
        '`.grad` accumulates. Zero it before the next backward pass.',
        '`backward()` needs a scalar: reduce with `.mean()` or `.sum()`.',
        '`torch.no_grad()` for evaluation and manual updates. `detach()` to cut one tensor out of the graph.',
        'Log with `loss.item()`, never with `loss`.',
        'Update weights in place under `no_grad`. Avoid other in-place changes to tensors that are being tracked.',
      ],
      questions: [
        {
          kind: 'output',
          id: 'pytorch-autograd-1',
          ask: 'What does this print?',
          code: `import torch

x = torch.tensor(3.0, requires_grad=True)
y = x ** 2
y.backward()
print(x.grad)`,
          answer: 'tensor(6.)',
          why: 'The derivative of x² is 2x, which is 6 at x = 3. `backward()` computed it from the recorded operations and stored it on `x`.',
        },
        {
          kind: 'output',
          id: 'pytorch-autograd-2',
          ask: 'Nothing zeroes the gradient here. What does this print?',
          code: `import torch

w = torch.tensor(2.0, requires_grad=True)
for _ in range(3):
    loss = 4 * w
    loss.backward()
print(w.grad)`,
          answer: 'tensor(12.)',
          why: 'Each backward pass computes a gradient of 4 and adds it to what is already there: 4, 8, 12. In a training loop this is the gradient of this batch plus every batch before it, which is why `zero_grad()` exists.',
        },
        {
          kind: 'output',
          id: 'pytorch-autograd-3',
          ask: 'What does this print?',
          code: `import torch

x = torch.ones(2, requires_grad=True)
with torch.no_grad():
    y = x * 2
z = x * 2
print(y.requires_grad, z.requires_grad)`,
          answer: 'False True',
          why: 'Inside `no_grad` the multiplication is not recorded, so `y` has no history and cannot be differentiated. The same line outside the block is tracked.',
        },
        {
          kind: 'output',
          id: 'pytorch-autograd-4',
          ask: '`x` is used twice in this expression. What does this print?',
          code: `import torch

x = torch.tensor(2.0, requires_grad=True)
y = x * x + 3 * x
y.backward()
print(x.grad)`,
          answer: 'tensor(7.)',
          why: 'The derivative is 2x + 3 = 7. Each use of `x` sends back its own gradient (4 from the square, 3 from the other term) and they add. This adding is the same mechanism that makes `.grad` accumulate between steps.',
        },
        {
          kind: 'output',
          id: 'pytorch-autograd-5',
          ask: 'What does this print?',
          code: `import torch

x = torch.tensor(2.0, requires_grad=True)
y = x * 3
z = y.detach() * x
z.backward()
print(x.grad)`,
          answer: 'tensor(6.)',
          hint: 'After `detach()`, autograd no longer knows that the value came from `x`.',
          why: '`y.detach()` is the constant 6 as far as autograd can tell, so z = 6x and the gradient is 6. Without the detach, z = 3x² and the gradient would be 12. Detaching is how you stop a gradient from flowing down one path.',
        },
        {
          kind: 'bug',
          id: 'pytorch-autograd-6',
          ask: 'Gradient descent by hand on a linear model. It crashes on the last line of the first pass: "\'NoneType\' object has no attribute \'zero_\'".',
          code: `w = torch.zeros(3, requires_grad=True)
for x, y in data:
    loss = ((x @ w - y) ** 2).mean()
    loss.backward()
    with torch.no_grad():
        w = w - 0.1 * w.grad
    w.grad.zero_()`,
          line: 6,
          fix: '        w -= 0.1 * w.grad',
          why: '`w = w - ...` creates a new tensor and gives it the name `w`. Made under `no_grad`, it does not require gradients and has no `.grad`. The in-place `-=` changes the values of the original parameter and keeps it.',
        },
        {
          kind: 'bug',
          id: 'pytorch-autograd-7',
          ask: 'Training works, but memory use climbs with every batch until the process is killed.',
          code: `total = 0.0
for x, y in loader:
    optimizer.zero_grad()
    loss = loss_fn(model(x), y)
    loss.backward()
    optimizer.step()
    total += loss
print(total / len(loader))`,
          line: 7,
          fix: '    total += loss.item()',
          why: '`loss` is a tensor attached to the record of the whole forward pass. Adding it to `total` makes `total` a tensor that holds on to every batch\'s graph. `.item()` takes the number and lets the graph be freed.',
        },
        {
          kind: 'choice',
          id: 'pytorch-autograd-8',
          ask: 'This raises "one of the variables needed for gradient computation has been modified by an inplace operation". Why?',
          code: `x = torch.ones(3, requires_grad=True)
y = x.exp()
y += 1
y.sum().backward()`,
          options: [
            'The backward step of `exp` reuses its own output, and `y += 1` overwrote it. `y = y + 1` makes a new tensor and works',
            '`x` requires gradients, so no in-place operation may appear anywhere after it',
            '`backward()` was called on a sum and not on `y` itself',
            '`exp` cannot be differentiated at 1',
          ],
          answer: 0,
          why: 'The derivative of exp(x) is exp(x), so autograd keeps the output to use on the way back. Changing it in place would give a wrong gradient, and PyTorch refuses. Many in-place operations are fine; the error tells you when one is not.',
        },
        {
          kind: 'choice',
          id: 'pytorch-autograd-9',
          ask: 'You want to plot a model\'s predictions. `preds.numpy()` raises "Can\'t call numpy() on Tensor that requires grad". The model is on a GPU. Which line is right?',
          options: ['`preds.requires_grad = False`, then `preds.numpy()`', '`preds.detach().cpu().numpy()`', '`np.array(preds)`', '`preds.item()`'],
          answer: 1,
          why: 'NumPy cannot hold a gradient record or GPU memory. `detach()` drops the record, `cpu()` moves the data, `numpy()` converts. `.item()` only works for a single number, and `requires_grad` cannot be switched off on a tensor that was computed from others.',
        },
        {
          kind: 'choice',
          id: 'pytorch-autograd-10',
          ask: 'A loss function is called with `reduction="none"`, so `loss` has one value per example. `loss.backward()` raises "grad can be implicitly created only for scalar outputs". What do you do?',
          options: [
            'Call `loss.backward()` once per example in a loop',
            'Reduce it to one number first: `loss.mean().backward()`',
            'Call `loss.detach().backward()`',
            'Set `requires_grad=True` on `loss`',
          ],
          answer: 1,
          why: 'A gradient is defined for one number with respect to many. Taking the mean gives that number, and it is what the default reduction does anyway. Detaching would throw away the very record that `backward` needs.',
        },
        {
          kind: 'write',
          id: 'pytorch-autograd-11',
          ask: 'Mimic what `.grad` does. `grads` lists the gradient that each `backward()` call computes. Each one is added to the stored gradient, then a step `w -= lr * stored` is taken. The stored gradient is reset to 0 after the step only if `zero_grad` is true. Return the final `w`.',
          starter: `def train(w, grads, lr, zero_grad=True):
    stored = 0.0
    # for each gradient: accumulate, step, and zero if asked
    pass`,
          solution: `def train(w, grads, lr, zero_grad=True):
    stored = 0.0
    for g in grads:
        stored += g
        w -= lr * stored
        if zero_grad:
            stored = 0.0
    return w`,
          tests: `out = train(1.0, [1.0, 1.0, 1.0], 0.1)
assert out is not None, "the function returns nothing yet"
assert abs(out - 0.7) < 1e-9, f"three steps with gradient 1 and lr 0.1 should move w from 1.0 to 0.7, got {out}"
out = train(1.0, [1.0, 1.0, 1.0], 0.1, zero_grad=False)
assert abs(out - 0.4) < 1e-9, f"without zeroing, the steps use gradients 1, 2 and 3, so w should end at 0.4, got {out}"
assert train(5.0, [], 0.1) == 5.0, "with no backward calls w should not change"
assert abs(train(0.0, [2.0, -2.0], 0.5, zero_grad=False) + 1.0) < 1e-9, "without zeroing, [2, -2] gives steps with 2 and then 0: w should be -1.0"`,
          why: 'Without zeroing, every step uses the sum of all gradients so far: the steps get larger and point in a stale direction. This is what a training loop with no `zero_grad()` does, and it does it without any error.',
        },
      ],
    },
    {
      id: 'pytorch-modules',
      title: 'Modules, layers and losses',
      summary: 'How a model is put together, how to count what is in it, and which loss wants what.',
      text: [
        'A model is a class that inherits from `nn.Module`. In `__init__` you create the layers and assign them to `self`; that assignment registers their parameters. In `forward` you say how an input flows through them. You call the model as `model(x)`, which runs `forward`.',
        { code: `class Net(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc1 = nn.Linear(20, 64)
        self.fc2 = nn.Linear(64, 3)

    def forward(self, x):
        return self.fc2(torch.relu(self.fc1(x)))   # logits: no softmax` },
        'Only layers that PyTorch can see are trained, moved by `.to(device)` and saved. Layers kept in a plain Python list are invisible: use `nn.ModuleList` or `nn.Sequential`. To see what a model holds, count: `sum(p.numel() for p in model.parameters())`. An `nn.Linear(a, b)` has `a × b` weights and `b` biases. Activations such as ReLU have none.',
        'For classification with several classes use `nn.CrossEntropyLoss`. It takes the raw scores (**logits**) of shape `(batch, classes)` and the targets as class indices of shape `(batch,)` and dtype `int64`: not probabilities, not one-hot. It applies log-softmax itself. If the model also ends in a softmax, the softmax is applied twice: there is no error, and training is slow and poor. A freshly initialised model should score about `ln(classes)`.',
        'For a yes/no output, or several independent yes/no labels, use one logit per label with `nn.BCEWithLogitsLoss`. The targets are floats of the same shape as the logits. The sigmoid is inside the loss, where it can be computed without overflow. So in both cases the last layer of the model has no activation. Apply `softmax` or `sigmoid` yourself only when you need probabilities, at prediction time.',
      ],
      rules: [
        'Layers assigned to `self` are registered. Lists of layers need `nn.ModuleList`.',
        '`nn.Linear(a, b)` has `a × b + b` parameters.',
        '`CrossEntropyLoss(logits, class_indices)`: logits `(batch, classes)`, targets `(batch,)` of `int64`.',
        'Never put a softmax before `CrossEntropyLoss` or a sigmoid before `BCEWithLogitsLoss`.',
        '`BCEWithLogitsLoss(logits, targets)`: same shape, targets as floats.',
        'Loss at the start should be about `ln(classes)`.',
      ],
      questions: [
        {
          kind: 'output',
          id: 'pytorch-modules-1',
          ask: 'What does this print?',
          code: `import torch.nn as nn

layer = nn.Linear(10, 5)
print(sum(p.numel() for p in layer.parameters()))`,
          answer: '55',
          why: 'A weight matrix of 10 × 5 = 50 numbers and one bias for each of the 5 outputs.',
        },
        {
          kind: 'number',
          id: 'pytorch-modules-2',
          ask: 'A network for 28×28 images is `nn.Linear(784, 100)`, a ReLU, then `nn.Linear(100, 10)`. How many parameters does it have?',
          answer: 79510,
          check: '784 * 100 + 100 + 100 * 10 + 10',
          hint: 'Weights and biases for each linear layer. The ReLU has none.',
          why: '78,400 weights and 100 biases in the first layer, 1,000 weights and 10 biases in the second. Almost all of the model is the first layer, which is typical of fully connected networks on images.',
        },
        {
          kind: 'output',
          id: 'pytorch-modules-3',
          ask: 'What does this print?',
          code: `import torch.nn as nn

model = nn.Sequential(nn.Linear(4, 8), nn.ReLU(), nn.Linear(8, 2))
print([name for name, _ in model.named_parameters()])`,
          answer: "['0.weight', '0.bias', '2.weight', '2.bias']",
          why: 'Parameters are named after the layer that owns them. Layer 1, the ReLU, has nothing to learn and does not appear. These names are the keys you see again in a saved checkpoint.',
        },
        {
          kind: 'output',
          id: 'pytorch-modules-4',
          ask: 'What does this print?',
          code: `import torch
import torch.nn as nn

model = nn.Sequential(nn.Linear(4, 8), nn.ReLU(), nn.Linear(8, 2))
x = torch.zeros(5, 4)
print(model(x).shape)`,
          answer: 'torch.Size([5, 2])',
          why: 'The batch size of 5 passes through untouched. Each layer changes only the last axis: 4 to 8, then 8 to 2. The result is 2 logits for each of 5 examples.',
        },
        {
          kind: 'output',
          id: 'pytorch-modules-5',
          ask: 'All logits are zero, so the model has no preference among 4 classes. What does this print?',
          code: `import torch
import torch.nn.functional as F

logits = torch.zeros(2, 4)
targets = torch.tensor([1, 3])
print(round(F.cross_entropy(logits, targets).item(), 4))`,
          answer: '1.3863',
          hint: 'Equal logits give each class a probability of 1/4.',
          why: 'Each true class gets probability 0.25, and −ln(0.25) = ln(4) ≈ 1.3863. This is the loss of a model that knows nothing, and the number to expect on the first step of training.',
        },
        {
          kind: 'bug',
          id: 'pytorch-modules-6',
          ask: 'This classifier trains without errors, but the loss falls very slowly and stalls well above where it should.',
          code: `class Net(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc1 = nn.Linear(20, 64)
        self.fc2 = nn.Linear(64, 3)

    def forward(self, x):
        x = torch.relu(self.fc1(x))
        return torch.softmax(self.fc2(x), dim=1)

loss_fn = nn.CrossEntropyLoss()`,
          line: 9,
          fix: '        return self.fc2(x)',
          why: '`CrossEntropyLoss` applies its own softmax. Fed probabilities between 0 and 1, the second softmax can only produce nearly equal outputs, so the loss cannot get low and the gradients are tiny. Return logits.',
        },
        {
          kind: 'choice',
          id: 'pytorch-modules-7',
          ask: 'A model returns logits of shape (32, 10). What must the targets passed to `nn.CrossEntropyLoss` look like for ordinary single-label classification?',
          options: [
            'Shape (32,), dtype int64: one class index per example',
            'Shape (32, 10), dtype int64: one-hot rows',
            'Shape (32,), dtype float32: the class index as a float',
            'Shape (32, 1), dtype int64',
          ],
          answer: 0,
          why: 'One integer per example, saying which class is right. Float indices raise "expected scalar type Long", integer one-hot rows raise an error too, and a trailing axis of size 1 does not match. (Recent versions also accept float class probabilities of shape (32, 10), which is for soft labels.)',
        },
        {
          kind: 'bug',
          id: 'pytorch-modules-8',
          ask: 'Creating the optimiser for this model fails with "optimizer got an empty parameter list".',
          code: `class MLP(nn.Module):
    def __init__(self, sizes):
        super().__init__()
        self.layers = [nn.Linear(a, b) for a, b in zip(sizes, sizes[1:])]

    def forward(self, x):
        for layer in self.layers[:-1]:
            x = torch.relu(layer(x))
        return self.layers[-1](x)`,
          line: 4,
          fix: '        self.layers = nn.ModuleList([nn.Linear(a, b) for a, b in zip(sizes, sizes[1:])])',
          why: 'PyTorch registers a layer when it is assigned to an attribute as a module. A plain list hides the layers: `parameters()` is empty, `.to(device)` leaves them behind and they are missing from the checkpoint. `nn.ModuleList` is a list that registers its contents.',
        },
        {
          kind: 'choice',
          id: 'pytorch-modules-9',
          ask: 'You are building a spam / not-spam classifier with a single output. Which pairing is right?',
          options: [
            'Last layer `nn.Linear(64, 1)` then `nn.Sigmoid()`, with `nn.BCEWithLogitsLoss`',
            'Last layer `nn.Linear(64, 1)` with no activation, with `nn.BCEWithLogitsLoss` and float targets',
            'Last layer `nn.Linear(64, 1)` with no activation, with `nn.CrossEntropyLoss`',
            'Last layer `nn.Linear(64, 1)` then `nn.Softmax(dim=1)`, with `nn.BCEWithLogitsLoss`',
          ],
          answer: 1,
          why: 'The loss applies the sigmoid itself, in a form that cannot overflow. A sigmoid in the model applies it twice. Cross-entropy over a single logit is always zero, and a softmax over one value is always 1: both leave nothing to learn.',
        },
        {
          kind: 'bug',
          id: 'pytorch-modules-10',
          ask: 'A binary classifier. It crashes with "result type Float can\'t be cast to the desired output type Long".',
          code: `model = nn.Sequential(nn.Linear(10, 32), nn.ReLU(), nn.Linear(32, 1))
loss_fn = nn.BCEWithLogitsLoss()

for x, y in loader:                  # y: (batch,) of 0s and 1s, int64
    logits = model(x).squeeze(1)     # (batch,)
    loss = loss_fn(logits, y)
    loss.backward()`,
          line: 6,
          fix: '    loss = loss_fn(logits, y.float())',
          why: '`BCEWithLogitsLoss` wants float targets of the same shape as the logits, because a target can be any value between 0 and 1. `CrossEntropyLoss` is the one that wants integer class indices. Mixing up the two conventions is a daily error.',
        },
        {
          kind: 'write',
          id: 'pytorch-modules-11',
          ask: 'Count the parameters of a fully connected network. `sizes` lists the width of every layer from input to output, so `[784, 100, 10]` is two linear layers.',
          starter: `def count_params(sizes):
    # each linear layer: weights (inputs x outputs) plus one bias per output
    pass`,
          solution: `def count_params(sizes):
    return sum(a * b + b for a, b in zip(sizes, sizes[1:]))`,
          tests: `out = count_params([10, 5])
assert out is not None, "the function returns nothing yet"
assert out == 55, f"Linear(10, 5) has 50 weights and 5 biases, got {out}"
assert count_params([784, 100, 10]) == 79510, "784 -> 100 -> 10 should have 79,510 parameters: did you count the biases?"
assert count_params([4, 8, 8, 2]) == 130, "4 -> 8 -> 8 -> 2 should have 40 + 72 + 18 = 130"
assert count_params([7]) == 0, "a single size has no layers and no parameters"`,
          why: 'Pair each size with the next: that is one layer. Checking this number against `sum(p.numel() for p in model.parameters())` is a quick test that the model you built is the model you meant.',
        },
        {
          kind: 'write',
          id: 'pytorch-modules-12',
          ask: 'Write what `BCEWithLogitsLoss` computes for one example: the loss for a logit `z` and a target `y` of 0 or 1. It must not overflow or fail for large positive or negative logits.',
          hint: 'The stable form is max(z, 0) − z·y + log(1 + exp(−|z|)).',
          starter: `import math

def bce_with_logits(z, y):
    # -[y * log(sigmoid(z)) + (1 - y) * log(1 - sigmoid(z))], computed safely
    pass`,
          solution: `import math

def bce_with_logits(z, y):
    return max(z, 0.0) - z * y + math.log1p(math.exp(-abs(z)))`,
          tests: `import math
out = bce_with_logits(0.0, 1.0)
assert out is not None, "the function returns nothing yet"
assert abs(out - math.log(2)) < 1e-9, f"a logit of 0 is a 50/50 guess: the loss should be ln 2 = 0.6931, got {out}"
assert abs(bce_with_logits(2.0, 0.0) - 2.1269280110) < 1e-6, "z = 2 with target 0 should give about 2.1269"
assert abs(bce_with_logits(2.0, 1.0) - 0.1269280110) < 1e-6, "z = 2 with target 1 should give about 0.1269"
try:
    big = [bce_with_logits(1000.0, 1.0), bce_with_logits(-1000.0, 1.0), bce_with_logits(1000.0, 0.0), bce_with_logits(-1000.0, 0.0)]
except (OverflowError, ValueError):
    raise AssertionError("fails for logits of 1000 or -1000: do not compute the sigmoid and then take its log")
assert all(abs(a - b) < 1e-6 for a, b in zip(big, [0.0, 1000.0, 1000.0, 0.0])), f"for logits of +-1000 the losses should be [0, 1000, 1000, 0], got {big}"`,
          why: 'Computing a sigmoid and then its log breaks at both ends: the exponential overflows, or the sigmoid rounds to exactly 0 or 1 and the log fails. The rearranged form only ever exponentiates a negative number. This is why the sigmoid lives inside the loss.',
        },
      ],
    },
    {
      id: 'pytorch-loop',
      title: 'The training loop',
      summary: 'Five lines that every model is trained with, and the mistakes that hide in them.',
      text: [
        'Every training script has the same core. For each batch: clear the old gradients, run the model, measure the loss, compute new gradients, update the weights. Learn it well enough to write it without looking.',
        { code: `for epoch in range(epochs):
    model.train()
    for x, y in train_loader:
        optimizer.zero_grad()
        logits = model(x)
        loss = loss_fn(logits, y)
        loss.backward()
        optimizer.step()

    model.eval()
    correct = 0
    with torch.no_grad():
        for x, y in val_loader:
            correct += (model(x).argmax(dim=1) == y).sum().item()
    print(epoch, correct / len(val_loader.dataset))` },
        'The order matters. `zero_grad()` can go anywhere except between `backward()` and `step()`, where it would erase the gradients before they are used. `backward()` must come before `step()`. The loss function takes the model output first and the target second. Both `zero_grad` and `backward` are calls: without the brackets the line does nothing and raises nothing.',
        'A model has two modes. `model.train()` makes dropout drop and batch normalisation use the statistics of the current batch. `model.eval()` turns dropout off and makes batch normalisation use its stored averages. `eval()` does not stop gradients from being recorded, and `torch.no_grad()` does not change how layers behave: validation needs both. Switch back to `train()` at the start of every epoch.',
        'Report numbers per example, not per batch. Predictions are `logits.argmax(dim=1)`: the largest score along the class axis. Count correct predictions and divide by the number of examples. A loss function returns the mean over the batch, so to average over a dataset whose last batch is smaller, weight each batch loss by its size.',
        'The classic mistakes all run without an error: no `zero_grad()`, evaluating in train mode, validating without `no_grad`, staying in eval mode after validation, and passing something other than raw logits to the loss.',
      ],
      rules: [
        'zero_grad, forward, loss, backward, step. In that order, every batch.',
        '`model.train()` before training batches, `model.eval()` before validation.',
        'Validation runs under `torch.no_grad()`. `eval()` alone still records gradients.',
        'Loss functions take `(output, target)`.',
        'Predictions are `argmax(dim=1)`. Divide counts by the number of examples.',
        'A missing step in the loop rarely crashes. It trains badly.',
      ],
      questions: [
        {
          kind: 'bug',
          id: 'pytorch-loop-1',
          ask: 'The loss falls for a few batches, then swings wildly and gets worse. No error is raised.',
          code: `for x, y in train_loader:
    optimizer.zero_grad
    logits = model(x)
    loss = loss_fn(logits, y)
    loss.backward()
    optimizer.step()`,
          line: 2,
          fix: '    optimizer.zero_grad()',
          why: 'Without the brackets the line names the method and never calls it. The gradients of every batch pile up, so each step uses the sum of all gradients so far. Python does not complain about an unused expression.',
        },
        {
          kind: 'output',
          id: 'pytorch-loop-2',
          ask: 'A loop with no `zero_grad()`. The gradient of the loss is 3 on every pass. What does this print?',
          code: `import torch

w = torch.tensor([1.0], requires_grad=True)
opt = torch.optim.SGD([w], lr=0.1)
for _ in range(2):
    loss = (w * 3).sum()
    loss.backward()
    opt.step()
print(w)`,
          answer: 'tensor([0.1000], requires_grad=True)',
          hint: 'The first step uses a gradient of 3. What is stored in `w.grad` on the second pass?',
          why: 'First step: 1 − 0.1 × 3 = 0.7. On the second pass the new gradient of 3 is added to the old one, so the step uses 6: 0.7 − 0.6 = 0.1. With `zero_grad()` the answer would be 0.4.',
        },
        {
          kind: 'bug',
          id: 'pytorch-loop-3',
          ask: 'The validation accuracy from this function is lower than it should be, and changes each time it is called on the same model and data.',
          code: `def evaluate(model, loader):
    model.train()
    correct = 0
    with torch.no_grad():
        for x, y in loader:
            correct += (model(x).argmax(dim=1) == y).sum().item()
    return correct / len(loader.dataset)`,
          line: 2,
          fix: '    model.eval()',
          why: 'In train mode dropout removes a random part of the network on every call, and batch normalisation uses (and updates) batch statistics. `no_grad` does not change either. Evaluation must run in eval mode.',
        },
        {
          kind: 'output',
          id: 'pytorch-loop-4',
          ask: 'What does this print?',
          code: `import torch
import torch.nn as nn

drop = nn.Dropout(p=0.5)
x = torch.ones(4)
drop.eval()
print(drop(x))`,
          answer: 'tensor([1., 1., 1., 1.])',
          why: 'In eval mode dropout passes its input through unchanged. The whole network is used, which is what you want when predicting.',
        },
        {
          kind: 'output',
          id: 'pytorch-loop-5',
          ask: 'The same layer in train mode, on a thousand ones. Which values can appear in the output? What does this print?',
          code: `import torch
import torch.nn as nn

drop = nn.Dropout(p=0.5)
drop.train()
out = drop(torch.ones(1000))
print(sorted(set(out.tolist())))`,
          answer: '[0.0, 2.0]',
          hint: 'Dropout keeps the expected value of each unit the same in both modes.',
          why: 'Half the values are set to 0 and the survivors are scaled by 1 / (1 − p) = 2, so the average stays about 1. That scaling is why nothing needs to change at evaluation time, and why outputs in train mode are noisy.',
        },
        {
          kind: 'bug',
          id: 'pytorch-loop-6',
          ask: 'A model with 10 classes. The reported accuracy is nonsense, or the comparison fails with a shape error, depending on the batch size.',
          code: `correct = 0
with torch.no_grad():
    for x, y in val_loader:
        logits = model(x)              # (batch, 10)
        preds = logits.argmax(dim=0)
        correct += (preds == y).sum().item()
accuracy = correct / len(val_loader.dataset)`,
          line: 5,
          fix: '        preds = logits.argmax(dim=1)',
          why: '`dim=0` finds, for each class, the example with the highest score: 10 numbers that are positions in the batch. The predicted class of each example is the largest score along the class axis, `dim=1`, giving one number per example.',
        },
        {
          kind: 'bug',
          id: 'pytorch-loop-7',
          ask: 'This crashes at the loss. Even if it ran, the model could not learn from it.',
          code: `for x, y in train_loader:
    optimizer.zero_grad()
    logits = model(x)
    loss = loss_fn(logits.argmax(dim=1), y)
    loss.backward()
    optimizer.step()`,
          line: 4,
          fix: '    loss = loss_fn(logits, y)',
          why: 'The loss needs the raw scores for every class. `argmax` throws them away and returns whole numbers, which have no gradient: there is no small change to the weights that changes an argmax smoothly. Use `argmax` for accuracy only.',
        },
        {
          kind: 'bug',
          id: 'pytorch-loop-8',
          ask: 'This should return the average loss per example over a dataset. With 1,000 examples and a batch size of 64 it returns a number about 64 times too small.',
          code: `def mean_loss(model, loader, loss_fn):
    model.eval()
    total, n = 0.0, 0
    with torch.no_grad():
        for x, y in loader:
            loss = loss_fn(model(x), y)    # mean over the batch
            total += loss.item()
            n += len(y)
    return total / n`,
          line: 7,
          fix: '            total += loss.item() * len(y)',
          why: 'The loss is already an average over the batch. Adding up batch averages and dividing by the number of examples divides twice. Multiply each batch loss by its size, which also gives the smaller last batch its correct weight.',
        },
        {
          kind: 'choice',
          id: 'pytorch-loop-9',
          ask: 'Training is fine, but the script runs out of GPU memory during validation, which uses the same batch size. The validation code calls `model.eval()` and loops over the loader. What is missing?',
          options: [
            '`optimizer.zero_grad()` before the validation loop',
            '`with torch.no_grad():` around the validation loop, so that no gradient record is kept',
            '`model.train()` after the loop',
            'A smaller learning rate',
          ],
          answer: 1,
          why: '`eval()` changes how dropout and batch normalisation behave and nothing else. Without `no_grad`, every forward pass keeps its activations for a backward pass that never comes. If results are also collected in a list as tensors, those records pile up.',
        },
        {
          kind: 'choice',
          id: 'pytorch-loop-10',
          ask: 'An `evaluate()` function calls `model.eval()` and is run at the end of every epoch. Nothing ever calls `model.train()`. What happens?',
          options: [
            'Nothing: the mode only matters during evaluation',
            'From the second epoch on, the model trains with dropout switched off and batch normalisation frozen on its stored averages',
            'The optimiser stops updating the weights',
            'An error is raised when `backward()` is called in eval mode',
          ],
          answer: 1,
          why: 'The mode is a switch that stays where it was left. Gradients still flow in eval mode, so training continues without its regularisation and with batch-norm statistics that no longer follow the data. Put `model.train()` at the top of each epoch.',
        },
        {
          kind: 'choice',
          id: 'pytorch-loop-11',
          ask: 'Which order of the three optimiser-related calls is wrong?',
          options: [
            '`zero_grad()`, `backward()`, `step()`',
            '`backward()`, `step()`, `zero_grad()`',
            '`backward()`, `zero_grad()`, `step()`',
            '`zero_grad()` at the top of the loop, before the forward pass',
          ],
          answer: 2,
          why: 'Zeroing between `backward()` and `step()` wipes the gradients that were only now computed, and the step moves nothing (or, with momentum or weight decay, moves on stale information). Zeroing before the forward pass or after the step are both fine.',
        },
        {
          kind: 'design',
          id: 'pytorch-loop-12',
          ask: 'Without looking, write the skeleton of one epoch: training over the training loader, then validation with an accuracy. Then check it against this list.',
          why: 'Being able to write the loop from memory is the base skill of the framework. Each item on the list is a line whose absence does not crash anything: you find out from a bad curve days later.',
          checklist: [
            { point: '`model.train()` before the training batches', why: 'The previous validation left the model in eval mode.' },
            { point: '`optimizer.zero_grad()` once per batch, not between backward and step', why: 'Gradients accumulate. Without it each step uses every earlier batch as well.' },
            { point: 'Forward pass, then `loss_fn(logits, y)` with raw logits first and targets second', why: 'The loss applies its own softmax and needs differentiable scores.' },
            { point: '`loss.backward()` and then `optimizer.step()`', why: 'Backward computes the gradients and step uses them. The other order steps on old or empty gradients.' },
            { point: '`model.eval()` and `with torch.no_grad():` for validation', why: 'One fixes the behaviour of dropout and batch norm, the other stops the gradient record. They do different jobs.' },
            { point: 'Predictions by `argmax(dim=1)`, correct count divided by the number of examples', why: 'Dividing by the number of batches, or taking argmax over the batch axis, gives a number that looks like an accuracy and is not.' },
            { point: 'Logging with `.item()`', why: 'Keeping loss tensors keeps their graphs and leaks memory.' },
          ],
        },
      ],
    },
    {
      id: 'pytorch-data',
      title: 'Datasets and DataLoaders',
      summary: 'How examples get from disk into batches, and where the input pipeline goes wrong.',
      text: [
        'A `Dataset` answers two questions: how many examples there are (`__len__`) and what example number `i` is (`__getitem__`). That is all. Reading the file, decoding the image and applying transforms happen inside `__getitem__`, one example at a time.',
        { code: `class Reviews(Dataset):
    def __init__(self, texts, labels):
        self.texts, self.labels = texts, labels

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, i):
        return encode(self.texts[i]), self.labels[i]

loader = DataLoader(Reviews(texts, labels), batch_size=32, shuffle=True)` },
        'A `DataLoader` turns a dataset into batches. It picks indices, calls `__getitem__` for each, and hands the list of examples to a **collate** function that stacks them: tensors gain a batch axis in front and Python numbers become a tensor. `len(loader)` is the number of batches, rounded up; `drop_last=True` discards a final short batch.',
        'The default collate stacks, so every example must have the same shape. Sentences of different lengths do not, and the fix is your own `collate_fn` that pads each batch to the length of its longest member.',
        '`shuffle=True` draws a new random order every epoch. Training needs it: data stored in order (all of class 0, then all of class 1) gives batches of a single class and gradients that pull one way and then the other. `num_workers` loads batches in parallel worker processes. With 0, loading runs in the training process, and a GPU waiting for data is the most common reason for slow training.',
        'Validation is different. Shuffling it changes nothing, and random augmentation makes it worse: the metric would be measured on different, harder images every epoch. The validation set gets the fixed transforms only (resize, crop from the centre, normalise), so that a change in the number means a change in the model.',
      ],
      rules: [
        'A dataset is `__len__` plus `__getitem__` for one example.',
        'The loader batches, shuffles and collates. `len(loader)` counts batches.',
        'Shuffle the training loader. Do not augment the validation set.',
        'Examples of different sizes need a `collate_fn` that pads.',
        'GPU idle and one CPU core busy: raise `num_workers`.',
      ],
      questions: [
        {
          kind: 'output',
          id: 'pytorch-data-1',
          ask: 'What does this print?',
          code: `import torch
from torch.utils.data import Dataset, DataLoader

class Squares(Dataset):
    def __len__(self):
        return 10

    def __getitem__(self, i):
        return torch.tensor(i * i)

loader = DataLoader(Squares(), batch_size=4)
print(len(loader), [len(batch) for batch in loader])`,
          answer: '3 [4, 4, 2]',
          why: 'Ten examples in batches of four make three batches, and the last holds the two that are left. Code that assumes every batch has `batch_size` examples breaks on that last one.',
        },
        {
          kind: 'output',
          id: 'pytorch-data-2',
          ask: 'Each example is a tensor of 3 features and a Python integer label. What does this print?',
          code: `import torch
from torch.utils.data import Dataset, DataLoader

class Points(Dataset):
    def __len__(self):
        return 10

    def __getitem__(self, i):
        return torch.zeros(3), i % 2

x, y = next(iter(DataLoader(Points(), batch_size=4)))
print(x.shape, y.shape, y.dtype)`,
          answer: 'torch.Size([4, 3]) torch.Size([4]) torch.int64',
          why: 'The collate function stacks the four feature tensors into (4, 3) and turns the four Python integers into one `int64` tensor of shape (4,): exactly what `CrossEntropyLoss` wants as targets.',
        },
        {
          kind: 'output',
          id: 'pytorch-data-3',
          ask: 'Anything with a length and indexing can be a dataset, including a list. What does this print?',
          code: `from torch.utils.data import DataLoader

loader = DataLoader(list(range(6)), batch_size=3, shuffle=False)
print([batch.tolist() for batch in loader])`,
          answer: '[[0, 1, 2], [3, 4, 5]]',
          why: 'Without shuffling the loader walks the dataset in order. With `shuffle=True` the same six numbers would be dealt into two batches in a new random order every epoch.',
        },
        {
          kind: 'number',
          id: 'pytorch-data-4',
          ask: 'A dataset has 1,000 examples. The loader uses `batch_size=32` and `drop_last=True`. How many batches are there in an epoch?',
          answer: 31,
          check: '1000 // 32',
          why: '31 full batches use 992 examples and the last 8 are dropped. Without `drop_last` there would be 32 batches. Dropping is common in training (a batch of 1 breaks batch normalisation) and wrong in validation, where every example must count.',
        },
        {
          kind: 'bug',
          id: 'pytorch-data-5',
          ask: 'The loader stops after a handful of examples, although the data has thousands of rows of 20 features.',
          code: `class Table(Dataset):
    def __init__(self, X, y):
        self.X, self.y = X, y      # X: (n, 20)   y: (n,)

    def __len__(self):
        return len(self.X[0])

    def __getitem__(self, i):
        return self.X[i], self.y[i]`,
          line: 6,
          fix: '        return len(self.X)',
          why: '`len(self.X[0])` is the length of the first row: the number of features, 20. The loader believes the dataset has 20 examples and never asks for more. The length is the number of rows.',
        },
        {
          kind: 'bug',
          id: 'pytorch-data-6',
          ask: 'The image files are stored class by class: all cats, then all dogs. The training loss jumps up and down and the model ends up predicting only one class.',
          code: `train_ds = ImageFolder('data/train', transform=train_tf)
val_ds = ImageFolder('data/val', transform=val_tf)

train_loader = DataLoader(train_ds, batch_size=64, shuffle=False, num_workers=4)
val_loader = DataLoader(val_ds, batch_size=64, shuffle=False, num_workers=4)`,
          line: 4,
          fix: 'train_loader = DataLoader(train_ds, batch_size=64, shuffle=True, num_workers=4)',
          why: 'Unshuffled, every batch holds a single class. The model learns "always cat", then "always dog", and finishes on whichever class came last. Shuffling makes each batch a fair sample of the data. The validation loader is right as it is.',
        },
        {
          kind: 'bug',
          id: 'pytorch-data-7',
          ask: 'The validation accuracy is lower than expected and differs between two evaluations of the same checkpoint.',
          code: `train_tf = T.Compose([T.RandomResizedCrop(224), T.RandomHorizontalFlip(), T.ToTensor()])
val_tf = T.Compose([T.Resize(256), T.CenterCrop(224), T.ToTensor()])

train_ds = ImageFolder('data/train', transform=train_tf)
val_ds = ImageFolder('data/val', transform=train_tf)`,
          line: 5,
          fix: "val_ds = ImageFolder('data/val', transform=val_tf)",
          why: 'The validation set is getting random crops and flips. Each evaluation sees different, harder versions of the images, so the number is noisy and too low. Validation uses the fixed transforms.',
        },
        {
          kind: 'choice',
          id: 'pytorch-data-8',
          ask: 'A dataset returns each sentence as a tensor of token ids, and sentences differ in length. The first batch fails with "stack expects each tensor to be equal size". What is the standard fix?',
          options: [
            'Set `batch_size=1`',
            'Pass a `collate_fn` that pads the sentences in each batch to the same length',
            'Set `shuffle=False`',
            'Raise `num_workers`',
          ],
          answer: 1,
          why: 'The default collate stacks, which needs equal shapes. A custom `collate_fn` receives the list of examples and can pad them to the longest in that batch (and return the true lengths or a mask). A batch size of 1 runs, and is far too slow.',
        },
        {
          kind: 'choice',
          id: 'pytorch-data-9',
          ask: 'Training on a GPU is slow. The GPU shows about 25% use, one CPU core sits at 100%, and the loader has `num_workers=0`. What do you change first?',
          options: [
            'Buy a faster GPU',
            'Raise `num_workers`, so that several processes decode and augment batches in parallel',
            'Lower the batch size',
            'Turn off shuffling',
          ],
          answer: 1,
          why: 'The GPU is waiting for data. With no workers, a single process loads and transforms every image between training steps. More workers feed the GPU faster. A faster GPU would spend the same time waiting.',
        },
        {
          kind: 'choice',
          id: 'pytorch-data-10',
          ask: 'Why is random augmentation applied to the training set and not to the validation set?',
          options: [
            'Augmentation is too slow to run twice',
            'Training wants variety so that the model cannot memorise; validation wants the same fixed task every time, so that a change in the metric comes from the model',
            'The validation set is too small to augment',
            'Augmented validation images would leak into training',
          ],
          answer: 1,
          why: 'Augmentation is a training aid. A validation metric is a measuring instrument: if the images change between evaluations, you can no longer compare epoch 5 with epoch 6, or one run with another.',
        },
        {
          kind: 'write',
          id: 'pytorch-data-11',
          numpy: true,
          ask: 'Rebuild the batching half of a DataLoader. Yield arrays of indices, `batch_size` at a time. If `rng` is given, shuffle with `rng.permutation(n)`; otherwise go in order. With `drop_last`, skip a final short batch.',
          starter: `import numpy as np

def batches(n, batch_size, rng=None, drop_last=False):
    # yield one array of indices per batch
    pass`,
          solution: `import numpy as np

def batches(n, batch_size, rng=None, drop_last=False):
    order = np.arange(n) if rng is None else rng.permutation(n)
    for start in range(0, n, batch_size):
        idx = order[start:start + batch_size]
        if drop_last and len(idx) < batch_size:
            break
        yield idx`,
          tests: `out = batches(10, 4)
assert out is not None, "the function returns nothing yet: use yield"
got = [[int(i) for i in b] for b in out]
assert got == [[0, 1, 2, 3], [4, 5, 6, 7], [8, 9]], f"10 examples in batches of 4, in order, got {got}"
got = [[int(i) for i in b] for b in batches(10, 4, drop_last=True)]
assert got == [[0, 1, 2, 3], [4, 5, 6, 7]], f"with drop_last the short batch [8, 9] should be skipped, got {got}"
got = [int(i) for b in batches(10, 4, rng=np.random.default_rng(0)) for i in b]
assert sorted(got) == list(range(10)), "a shuffled epoch should still visit every index exactly once"
want = [int(i) for i in np.random.default_rng(0).permutation(10)]
assert got == want, "shuffle with rng.permutation(n), so that a given rng always gives the same order"
rng = np.random.default_rng(1)
first = [int(i) for b in batches(50, 8, rng=rng) for i in b]
second = [int(i) for b in batches(50, 8, rng=rng) for i in b]
assert first != second, "calling it again with the same rng (a new epoch) should give a new order"`,
          why: 'One permutation per epoch, cut into slices. Every example is seen once per epoch, in a new order each time. Passing the generator in, and not creating one inside, is what makes a run repeatable.',
        },
        {
          kind: 'write',
          id: 'pytorch-data-12',
          ask: 'Write the heart of a padding `collate_fn`. Given a list of sequences (lists of token ids) of different lengths, return the sequences padded on the right to the longest length, and the original lengths.',
          starter: `def pad_batch(seqs, pad=0):
    # returns (padded, lengths)
    pass`,
          solution: `def pad_batch(seqs, pad=0):
    lengths = [len(s) for s in seqs]
    longest = max(lengths)
    padded = [list(s) + [pad] * (longest - len(s)) for s in seqs]
    return padded, lengths`,
          tests: `out = pad_batch([[5, 6, 7], [8]])
assert out is not None, "the function returns nothing yet"
padded, lengths = out
assert padded == [[5, 6, 7], [8, 0, 0]], f"the short sequence should be padded with zeros on the right, got {padded}"
assert lengths == [3, 1], f"lengths should be the original lengths [3, 1], got {lengths}"
padded, lengths = pad_batch([[1], [2, 3]], pad=-1)
assert padded == [[1, -1], [2, 3]], "use the pad value that was passed in"
padded, _ = pad_batch([[1, 2], [3, 4]])
assert padded == [[1, 2], [3, 4]], "sequences of equal length need no padding"
seqs = [[1], [2, 3]]
pad_batch(seqs)
assert seqs == [[1], [2, 3]], "do not change the input lists"`,
          why: 'Pad to the longest in the batch, not the longest in the dataset: batches of short sentences stay small. The lengths (or a mask built from them) go to the model so that it can ignore the padding.',
        },
      ],
    },
    {
      id: 'pytorch-cnn',
      title: 'Convolutions and transfer learning',
      summary: 'What a kernel does to an image, the arithmetic of sizes, and how to reuse a network someone else trained.',
      widget: 'pytorch-conv',
      text: [
        'A convolution slides a small grid of weights, the **kernel**, across an image. At each position it multiplies the patch under it by the kernel, entry by entry, and adds up the result: one output number per position. A kernel that is negative on one side and positive on the other responds to edges. One whose weights are all equal blurs. In a network the kernel weights are learned.',
        'The output size along each side is `⌊(n + 2p − k) / s⌋ + 1`, for input size `n`, kernel `k`, padding `p` and stride `s`. A 3×3 kernel with no padding loses one pixel on each side. Padding of 1 keeps the size. A stride of 2 halves it. You need this sum whenever a convolution feeds a linear layer.',
        'Images have channels, and so do feature maps. `nn.Conv2d(3, 16, kernel_size=3)` takes 3 channels in and gives 16 out. Each of the 16 kernels spans all 3 input channels, so the weight has shape `(16, 3, 3, 3)` and the layer has `16 × 3 × 3 × 3 + 16 = 448` parameters, whatever the image size. Input and output are `(batch, channels, height, width)`. **Pooling** shrinks a feature map with no parameters: `nn.MaxPool2d(2)` keeps the largest value in each 2×2 block.',
        'You rarely train a vision model from nothing. **Transfer learning** starts from a network trained on a large dataset, whose early layers already detect edges, textures and parts. Freeze those layers, replace the last layer (the **head**) with one sized for your classes, and train only the head.',
        { code: `model = resnet18(weights='DEFAULT')
for p in model.parameters():
    p.requires_grad = False                          # freeze the backbone
model.fc = nn.Linear(model.fc.in_features, 5)        # new head: trainable by default
optimizer = torch.optim.Adam(model.fc.parameters(), lr=1e-3)` },
        'Once the head has settled you can **fine-tune**: unfreeze some or all of the backbone and keep training with a learning rate 10 to 100 times smaller. The pretrained weights are already good, and large steps would wreck them. With little data, stay with the frozen backbone.',
      ],
      rules: [
        'Output size: `⌊(n + 2p − k) / s⌋ + 1`.',
        '3×3 kernel with padding 1 keeps the size. Stride 2 halves it.',
        '`Conv2d(in, out, k)` has `out × in × k × k + out` parameters, independent of the image size.',
        'Pooling shrinks height and width and has no parameters.',
        'Transfer learning: freeze, replace the head, train the head.',
        'Fine-tune the backbone with a much smaller learning rate.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'pytorch-cnn-1',
          ask: 'A 32×32 image goes through a convolution with a 5×5 kernel, stride 1 and no padding. What is the height of the output?',
          answer: 28,
          check: '(32 + 2 * 0 - 5) // 1 + 1',
          why: '(32 − 5) / 1 + 1 = 28. A kernel of size k with no padding fits in n − k + 1 positions.',
        },
        {
          kind: 'output',
          id: 'pytorch-cnn-2',
          ask: 'What does this print?',
          code: `import torch
import torch.nn as nn

conv = nn.Conv2d(3, 16, kernel_size=3, stride=2, padding=1)
x = torch.zeros(8, 3, 32, 32)
print(conv(x).shape)`,
          answer: 'torch.Size([8, 16, 16, 16])',
          hint: 'Batch stays. Channels become the number of kernels. Then the size formula for height and width.',
          why: 'The batch of 8 is untouched, the channels go from 3 to 16, and each side is ⌊(32 + 2 − 3) / 2⌋ + 1 = 16. A stride-2 convolution with padding 1 halves the image.',
        },
        {
          kind: 'number',
          id: 'pytorch-cnn-3',
          ask: 'How many parameters does `nn.Conv2d(3, 16, kernel_size=3)` have?',
          answer: 448,
          check: '16 * 3 * 3 * 3 + 16',
          why: '16 kernels, each 3 channels deep and 3×3 wide, is 432 weights, plus 16 biases. The count does not depend on the image size, which is why convolutional layers are so much smaller than linear layers on images.',
        },
        {
          kind: 'choice',
          id: 'pytorch-cnn-4',
          ask: 'In the figure, with stride 1 and padding 0 the 8×8 image gives a 6×6 output. Set padding to 1. What changes, and why does it matter in a deep network?',
          options: [
            'The output becomes 10×10, so later layers see more detail',
            'The output stays 8×8. Without padding every 3×3 layer removes 2 pixels per side, and the pixels at the border are seen by fewer kernel positions',
            'The output becomes 4×4, which saves memory',
            'Nothing changes: padding only affects the kernel',
          ],
          answer: 1,
          why: '⌊(8 + 2 − 3) / 1⌋ + 1 = 8. Padding of 1 with a 3×3 kernel is the standard pairing because the size is then controlled only by strides and pooling, and a network can be made as deep as you like.',
        },
        {
          kind: 'choice',
          id: 'pytorch-cnn-5',
          ask: 'In the figure, choose the Edge kernel and click an output cell in the middle of the bright square, where every pixel under the kernel is the same. The output is 0. Why?',
          options: [
            'The kernel only looks at the centre pixel',
            'The kernel\'s weights add up to 0, so on a flat patch the positive and negative parts cancel. It responds only where brightness changes from left to right',
            'Bright pixels are ignored by convolutions',
            'The stride skipped that position',
          ],
          answer: 1,
          why: 'The kernel computes right column minus left column. On a flat patch that is zero, whatever the brightness. At the left side of the square it is strongly positive and at the right side strongly negative: it has found the vertical edges.',
        },
        {
          kind: 'output',
          id: 'pytorch-cnn-6',
          ask: 'What does this print?',
          code: `import torch
import torch.nn as nn

x = torch.arange(16.0).reshape(1, 1, 4, 4)
out = nn.MaxPool2d(2)(x)
print(out.flatten().tolist())`,
          answer: '[5.0, 7.0, 13.0, 15.0]',
          hint: 'The image is the numbers 0 to 15 in four rows. Take the largest of each 2×2 block.',
          why: 'The four blocks are {0, 1, 4, 5}, {2, 3, 6, 7}, {8, 9, 12, 13} and {10, 11, 14, 15}. Max pooling keeps the largest of each, halving the height and the width with no parameters.',
        },
        {
          kind: 'bug',
          id: 'pytorch-cnn-7',
          ask: 'Adapting a pretrained ResNet-18 to 5 classes. The first forward pass fails with "mat1 and mat2 shapes cannot be multiplied (32x512 and 1000x5)".',
          code: `model = resnet18(weights='DEFAULT')
for p in model.parameters():
    p.requires_grad = False
model.fc = nn.Linear(model.fc.out_features, 5)
optimizer = torch.optim.Adam(model.fc.parameters(), lr=1e-3)`,
          line: 4,
          fix: 'model.fc = nn.Linear(model.fc.in_features, 5)',
          why: 'The new head replaces the old one, so it must accept what the old one accepted: 512 features from the backbone. `out_features` is the old head\'s 1,000 ImageNet classes. Read the error: 32x512 is the batch arriving, 1000x5 is the layer it met.',
        },
        {
          kind: 'choice',
          id: 'pytorch-cnn-8',
          ask: 'This crashes at `loss.backward()` with "element 0 of tensors does not require grad". Why?',
          code: `model = resnet18(weights='DEFAULT')
model.fc = nn.Linear(model.fc.in_features, 5)
for p in model.parameters():
    p.requires_grad = False
optimizer = torch.optim.Adam(model.fc.parameters(), lr=1e-3)`,
          options: [
            'The optimiser was given too few parameters',
            'The freezing loop runs after the head is replaced, so the new head is frozen too and nothing in the model can be trained',
            'Pretrained models cannot be trained further',
            'The learning rate is too small',
          ],
          answer: 1,
          why: '`model.parameters()` includes the new `fc`. With every parameter frozen, the loss depends on nothing that requires a gradient. Freeze first, then replace the head: a new layer is trainable by default.',
        },
        {
          kind: 'output',
          id: 'pytorch-cnn-9',
          ask: 'The first layer is frozen. What does this print?',
          code: `import torch.nn as nn

model = nn.Sequential(nn.Linear(4, 8), nn.ReLU(), nn.Linear(8, 2))
for p in model[0].parameters():
    p.requires_grad = False
print(sum(p.numel() for p in model.parameters() if p.requires_grad))`,
          answer: '18',
          why: 'Only the last layer is still trainable: 8 × 2 weights and 2 biases. Printing the trainable count after freezing is the quick way to check that you froze what you meant to.',
        },
        {
          kind: 'choice',
          id: 'pytorch-cnn-10',
          ask: 'The new head has been trained at a learning rate of 1e-3 and validation accuracy has levelled off. You unfreeze the whole backbone to fine-tune. Which learning rate is the sensible choice?',
          options: [
            '1e-1, to make up for the time the backbone was frozen',
            '1e-3, the same as before',
            '1e-5 to 1e-4, so that the pretrained weights are adjusted gently',
            '0, so that the backbone does not change',
          ],
          answer: 2,
          why: 'The pretrained features are the reason transfer learning works. Large steps overwrite them with noise from a small dataset, and accuracy often drops sharply in the first epoch. A rate 10 to 100 times smaller moves them a little. Feed the images with the same normalisation the backbone was trained with.',
        },
        {
          kind: 'write',
          id: 'pytorch-cnn-11',
          ask: 'Write the output-size formula for a convolution or pooling layer along one side.',
          starter: `def conv_out(n, kernel, stride=1, padding=0):
    # n: input size along one side
    pass`,
          solution: `def conv_out(n, kernel, stride=1, padding=0):
    return (n + 2 * padding - kernel) // stride + 1`,
          tests: `out = conv_out(32, 5)
assert out is not None, "the function returns nothing yet"
assert out == 28, f"32 with a 5x5 kernel should give 28, got {out}"
assert conv_out(32, 3, padding=1) == 32, "a 3x3 kernel with padding 1 keeps the size"
assert conv_out(32, 3, stride=2, padding=1) == 16, "stride 2 with padding 1 halves 32 to 16"
assert conv_out(8, 3, stride=2) == 3, "8 with a 3x3 kernel and stride 2 gives 3: round down, and return an int"
assert isinstance(conv_out(8, 3, stride=2), int), "the size should be an int, not a float"
assert conv_out(224, 7, stride=2, padding=3) == 112, "the first layer of a ResNet takes 224 to 112"
assert conv_out(28, 2, stride=2) == 14, "2x2 pooling with stride 2 halves 28 to 14"`,
          why: 'Pad both sides, subtract the kernel, count the strides that fit, add one for the starting position. Rounding down matters: positions where the kernel would hang off the edge are dropped.',
        },
        {
          kind: 'write',
          id: 'pytorch-cnn-12',
          numpy: true,
          ask: 'Write what `Conv2d` does for one channel with no padding: slide the kernel over the image, and at each position sum the patch times the kernel. Do not flip the kernel.',
          starter: `import numpy as np

def conv2d(image, kernel, stride=1):
    # image: (H, W)   kernel: (k, k)   returns (out_h, out_w)
    pass`,
          solution: `import numpy as np

def conv2d(image, kernel, stride=1):
    k = kernel.shape[0]
    out_h = (image.shape[0] - k) // stride + 1
    out_w = (image.shape[1] - k) // stride + 1
    out = np.zeros((out_h, out_w))
    for i in range(out_h):
        for j in range(out_w):
            patch = image[i * stride:i * stride + k, j * stride:j * stride + k]
            out[i, j] = (patch * kernel).sum()
    return out`,
          tests: `image = np.arange(16.0).reshape(4, 4)
out = conv2d(image, np.ones((2, 2)))
assert out is not None, "the function returns nothing yet"
assert out.shape == (3, 3), f"a 4x4 image with a 2x2 kernel should give 3x3, got {out.shape}"
assert np.allclose(out, [[10, 14, 18], [26, 30, 34], [42, 46, 50]]), "with a kernel of ones each output is the sum of a 2x2 patch"
out = conv2d(image, np.array([[1.0, 0.0], [0.0, -1.0]]))
assert np.allclose(out, -5), "top-left minus bottom-right of each patch should be -5 everywhere: is the kernel flipped?"
out = conv2d(image, np.ones((2, 2)), stride=2)
assert out.shape == (2, 2), f"with stride 2 the output should be 2x2, got {out.shape}"
assert np.allclose(out, [[10, 18], [42, 50]]), "with stride 2 the patches should not overlap"
wide = conv2d(np.ones((3, 5)), np.ones((3, 3)))
assert wide.shape == (1, 3), f"a 3x5 image with a 3x3 kernel should give 1x3, got {wide.shape}"
assert np.allclose(wide, 9), "nine ones under a kernel of ones should give 9"`,
          why: 'Two loops over output positions and one multiply-and-sum. Real layers do the same over every input channel at once and add a bias. Deep learning libraries do not flip the kernel, so strictly this is cross-correlation; since the kernel is learned, it makes no difference.',
        },
      ],
    },
    {
      id: 'pytorch-debug',
      title: 'Debugging a model that will not train',
      summary: 'A fixed order of cheap checks that finds most problems before you touch a hyperparameter.',
      text: [
        'A model that does not learn rarely raises an error. The temptation is to change the learning rate and hope. Resist it: first prove that the code is right, with checks that take minutes.',
        '**Overfit one batch.** Take a single small batch and train on it alone for a few hundred steps. A correct model and loop will drive the loss close to zero, because memorising 8 examples is easy. If it cannot, there is a bug in the model, the loss or the loop, and no amount of data or tuning will help.',
        '**Check the loss at the start.** An untrained classifier should give every class about the same probability, so the first loss should be near `ln(classes)`: 0.69 for 2 classes, 2.30 for 10. Much higher means the first logits are large, usually from inputs that were not normalised or a bad initialisation. Stuck at exactly that value means nothing is being learned at all.',
        '**Check shapes and values.** Print the shape and dtype of one batch, of the model output and of the targets. The silent broadcast of `(n, 1)` against `(n,)` lives here. A `nan` loss comes from a learning rate that is too high, the log of zero, a division by zero or bad input data. `torch.isnan(x).any()` finds it; note that `nan` is not equal to itself.',
        '**Look at the gradients.** After `backward()`, the norm of each parameter\'s `.grad` tells you whether the signal arrives. Zero means a dead or disconnected layer. Enormous means exploding gradients, and the fix is clipping, placed between `backward()` and `step()`: it rescales the whole gradient when its norm is above a limit.',
        { code: `loss.backward()
torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
optimizer.step()` },
        '**Fix the seeds** with `torch.manual_seed` while you debug. Otherwise you cannot tell whether a change helped or the run was lucky.',
      ],
      rules: [
        'Before tuning anything, overfit one batch. If the loss will not go near zero, there is a bug.',
        'The first loss should be about `ln(classes)`.',
        'Print shapes and dtypes of inputs, outputs and targets once.',
        '`nan`: lower the learning rate, look for `log(0)` and division by zero, check the data.',
        'Gradient norms: zero is a dead layer, huge is an explosion. Clip between backward and step.',
        'Set seeds so that two runs can be compared.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'pytorch-debug-1',
          ask: 'A classifier with 10 classes has been created and not yet trained. Roughly what cross-entropy loss should the first batch give? (Two decimals.)',
          answer: 2.3026,
          tol: 0.01,
          check: 'math.log(10)',
          why: 'With no knowledge each class gets about 1/10, and −ln(1/10) = ln(10) ≈ 2.30. Know this number for your problem before you start a run.',
        },
        {
          kind: 'choice',
          id: 'pytorch-debug-2',
          ask: 'The same 10-class classifier prints a loss of 11.5 on the very first batch. What is the most likely cause?',
          options: [
            'Nothing is wrong: the loss always starts high',
            'The first logits are huge, usually because the inputs were not normalised (raw pixel values of 0 to 255) or the initial weights are too large',
            'The learning rate is too high',
            'The model is overfitting',
          ],
          answer: 1,
          why: 'A loss far above ln(10) means the model is confidently wrong before it has learned anything, which takes large logits. The learning rate has not acted yet on the first batch, and overfitting needs training to have happened.',
        },
        {
          kind: 'choice',
          id: 'pytorch-debug-3',
          ask: 'A 10-class classifier is trained for 10 epochs. The training loss stays between 2.29 and 2.31 throughout. What does this curve say?',
          chart: { x: 'epoch', y: 'training loss', series: [{ name: 'training loss', points: [2.31, 2.3, 2.3, 2.31, 2.3, 2.29, 2.3, 2.3, 2.31, 2.3], color: 'bad' }] },
          options: [
            'The model is overfitting',
            'The learning rate is too high',
            'The model is still guessing uniformly: nothing is being learned. Check that gradients reach the weights, that the optimiser holds the model\'s parameters, and that the labels match the inputs',
            'Training has converged',
          ],
          answer: 2,
          why: '2.30 is ln(10), the loss of a model that knows nothing. A learning rate that is too high gives a loss that jumps or explodes, not a flat line. This is a wiring problem: frozen or disconnected parameters, a learning rate of zero, or labels that were shuffled apart from their inputs.',
        },
        {
          kind: 'choice',
          id: 'pytorch-debug-4',
          ask: 'You train on a single batch of 8 examples for 500 steps. The loss falls from 2.3 to 1.9 and stays there. What do you conclude?',
          options: [
            'The model needs more data',
            'The model needs more regularisation',
            'There is a bug in the model, the loss or the loop: a working setup memorises 8 examples almost perfectly',
            'Everything is fine: 1.9 is lower than 2.3',
          ],
          answer: 2,
          why: 'Eight examples can be memorised by almost any network. Failing to do so cannot be blamed on data or on generalisation. Look for a softmax before the loss, a wrong target, a detached tensor or a missing step in the loop.',
        },
        {
          kind: 'bug',
          id: 'pytorch-debug-5',
          ask: 'A hand-written loss. Early in training it works. Once the model becomes confident, the loss turns into `inf` and then `nan`.',
          code: `def nll(logits, y):
    # logits: (batch, classes)   y: (batch,) class indices
    logp = torch.log(torch.softmax(logits, dim=1))
    return -logp[torch.arange(len(y)), y].mean()`,
          line: 3,
          fix: '    logp = torch.log_softmax(logits, dim=1)',
          why: 'When one logit is far above another, the softmax of the smaller one rounds to exactly 0 in float32, and log(0) is −inf. `log_softmax` computes the same quantity without ever forming the tiny probability. The built-in losses do this for you.',
        },
        {
          kind: 'bug',
          id: 'pytorch-debug-6',
          ask: 'A regression model. The loss falls to the variance of the targets and stays there, and PyTorch prints a warning about target size.',
          code: `for x, y in loader:            # x: (batch, 8)   y: (batch,)
    optimizer.zero_grad()
    pred = model(x)            # (batch, 1)
    loss = F.mse_loss(pred, y)
    loss.backward()
    optimizer.step()`,
          line: 4,
          fix: '    loss = F.mse_loss(pred.squeeze(1), y)',
          why: '(batch, 1) against (batch,) broadcasts to (batch, batch): every prediction is compared with every target. The best the model can do is predict the mean for everyone. Printing the two shapes once would have shown it.',
        },
        {
          kind: 'output',
          id: 'pytorch-debug-7',
          ask: 'What does this print?',
          code: `import torch

x = torch.tensor([1.0, float('nan')])
print(torch.isnan(x).any().item(), (x == x).all().item())`,
          answer: 'True False',
          why: '`isnan` finds the bad value. The second test is False because `nan` is not equal to anything, itself included. One `nan` in a batch makes the loss `nan`, and one `nan` loss makes every weight `nan` at the next step.',
        },
        {
          kind: 'output',
          id: 'pytorch-debug-8',
          ask: 'The gradient here is (6, 8), which has length 10. What does this print?',
          code: `import torch

w = torch.tensor([3.0, 4.0], requires_grad=True)
(w ** 2).sum().backward()
torch.nn.utils.clip_grad_norm_([w], max_norm=1.0)
print(w.grad)`,
          answer: 'tensor([0.6000, 0.8000])',
          why: 'Clipping rescales the whole gradient so that its length is 1. The direction is kept: (6, 8) becomes (0.6, 0.8). A gradient shorter than the limit is left alone.',
        },
        {
          kind: 'output',
          id: 'pytorch-debug-9',
          ask: 'The first layer is set so that its outputs are negative for this input. What does this print?',
          code: `import torch
import torch.nn as nn

model = nn.Sequential(nn.Linear(2, 2), nn.ReLU(), nn.Linear(2, 1))
with torch.no_grad():
    model[0].weight.fill_(-1.0)
    model[0].bias.fill_(-1.0)

model(torch.ones(4, 2)).sum().backward()
print(model[0].weight.grad.norm().item())`,
          answer: '0.0',
          hint: 'What does a ReLU pass backward when its input is negative?',
          why: 'Every input to the ReLU is −3, so it outputs 0 and passes back a gradient of 0. The first layer gets no signal and will never change: a dead layer. A gradient norm of exactly zero is how you find one.',
        },
        {
          kind: 'output',
          id: 'pytorch-debug-10',
          ask: 'What does this print?',
          code: `import torch

torch.manual_seed(0)
a = torch.rand(2)
torch.manual_seed(0)
b = torch.rand(2)
print(torch.equal(a, b))`,
          answer: 'True',
          why: 'Setting the seed resets the random number generator, so the same numbers come out again. With a fixed seed, weight initialisation, shuffling and dropout repeat, and a difference between two runs is caused by your change.',
        },
        {
          kind: 'write',
          id: 'pytorch-debug-11',
          ask: 'Write gradient clipping by norm for a gradient given as a flat list of numbers. If its length (the square root of the sum of squares) is above `max_norm`, scale every entry so that the length equals `max_norm`. Otherwise return it unchanged.',
          starter: `def clip_by_norm(grad, max_norm):
    # returns a new list
    pass`,
          solution: `def clip_by_norm(grad, max_norm):
    norm = sum(g * g for g in grad) ** 0.5
    if norm <= max_norm:
        return list(grad)
    return [g * max_norm / norm for g in grad]`,
          tests: `out = clip_by_norm([6.0, 8.0], 1.0)
assert out is not None, "the function returns nothing yet"
assert abs(out[0] - 0.6) < 1e-9 and abs(out[1] - 0.8) < 1e-9, f"(6, 8) has length 10; clipped to 1 it should be (0.6, 0.8), got {out}"
assert clip_by_norm([0.3, 0.4], 1.0) == [0.3, 0.4], "a gradient shorter than max_norm should not be changed"
out = clip_by_norm([3.0, -4.0], 2.5)
assert abs(out[0] - 1.5) < 1e-9 and abs(out[1] + 2.0) < 1e-9, f"signs must be kept: (3, -4) clipped to 2.5 is (1.5, -2.0), got {out}"
assert clip_by_norm([0.0, 0.0], 1.0) == [0.0, 0.0], "a zero gradient should stay zero, without dividing by zero"
out = clip_by_norm([1.0, 1.0, 1.0, 1.0], 1.0)
assert abs(sum(g * g for g in out) ** 0.5 - 1.0) < 1e-9, "after clipping the length should equal max_norm"`,
          why: 'One scale factor for the whole gradient keeps its direction and limits its size. Clipping each entry separately would change the direction. It caps the damage of a rare huge gradient; it does not repair a learning rate that is too high everywhere.',
        },
        {
          kind: 'design',
          id: 'pytorch-debug-12',
          ask: 'A colleague\'s image classifier has trained overnight and its accuracy is at chance. They ask you what to try. Write down what you would check, in order, before changing any hyperparameter.',
          why: 'The order goes from cheap and certain to slow and uncertain. Most models that do not train have a bug that the first four checks expose in minutes, and tuning cannot fix a bug.',
          checklist: [
            { point: '1. Look at one batch: shapes, dtypes, value range, and a few inputs next to their labels', why: 'Wrong normalisation, a channel order mix-up or labels out of step with inputs are visible at once and invisible in a loss curve.' },
            { point: '2. Check the loss on the first batch against ln(classes)', why: 'Far above means huge initial logits. It takes one forward pass to find out.' },
            { point: '3. Overfit a single small batch until the loss is near zero', why: 'This separates "the code is wrong" from "the problem is hard". If it fails, stop and find the bug.' },
            { point: '4. Read the loop: zero_grad, logits (not probabilities) into the loss, backward, step, train and eval modes', why: 'Each of these fails without an error message.' },
            { point: '5. Check that the optimiser holds the right parameters and that their gradient norms are neither zero nor enormous', why: 'Frozen, unregistered or dead layers show up as zero or missing gradients. Explosions show up as huge ones.' },
            { point: '6. Look for nan or inf in the inputs and the loss', why: 'One bad value poisons every weight at the next step.' },
            { point: '7. Fix the seed, then try a lower learning rate and a simpler baseline', why: 'Only once the code is known to be right is tuning worth the time, and a seed makes two runs comparable.' },
          ],
        },
      ],
    },
    {
      id: 'pytorch-speed',
      title: 'Speed, memory and checkpoints',
      summary: 'Getting the work onto the GPU, fitting it into memory, and not losing a week of training to a crash.',
      widget: 'pytorch-batch',
      text: [
        'A GPU does the same arithmetic as a CPU, many times faster, on data that has been copied to it. `model.to(device)` moves a model in place. `x.to(device)` does not: it returns a new tensor, so write `x = x.to(device)`. Do it for every batch, inputs and targets alike.',
        'GPU memory is the usual limit. Training keeps the activations of every layer for the backward pass, and their size grows in proportion to the batch size. "CUDA out of memory" means: use a smaller batch. A smaller batch means more steps per epoch, `⌈examples / batch size⌉`, and noisier gradients.',
        '**Gradient accumulation** gets a large batch out of small ones. Call `backward()` on several batches before a single `step()`; the gradients add up. Divide each loss by the number of batches so that the sum is an average. The memory needed is that of the small batch. **Mixed precision** runs most of the forward pass in 16-bit floats: about half the activation memory and faster on recent GPUs. A `GradScaler` multiplies the loss up before `backward()` so that small 16-bit gradients do not round to zero.',
        { code: `scaler = torch.amp.GradScaler()
for x, y in loader:
    x, y = x.to(device, non_blocking=True), y.to(device, non_blocking=True)
    optimizer.zero_grad()
    with torch.autocast(device_type='cuda', dtype=torch.float16):
        loss = loss_fn(model(x), y)
    scaler.scale(loss).backward()
    scaler.step(optimizer)
    scaler.update()` },
        '`pin_memory=True` on the `DataLoader` keeps batches in memory that can be copied to the GPU quickly, and `non_blocking=True` lets that copy overlap with other work. It helps only when training on a GPU.',
        'Long runs crash. Save a **checkpoint**: a dictionary with `model.state_dict()` (every parameter by name), `optimizer.state_dict()` and the epoch. The optimiser state matters: momentum and Adam keep running averages for every weight, and a resumed run without them starts with a jolt. Load with `map_location=device`, so that a checkpoint saved on a GPU opens on a machine without one.',
      ],
      rules: [
        '`model.to(device)` works in place. Tensors need `x = x.to(device)`.',
        'Memory grows with batch size. Out of memory: halve the batch.',
        'Gradient accumulation: k backward calls per step, each loss divided by k.',
        'Mixed precision: `autocast` for the forward pass, `GradScaler` for backward and step.',
        '`pin_memory=True` speeds up copies to the GPU and does nothing on a CPU.',
        'Checkpoint the model state, the optimiser state and the epoch. Load with `map_location`.',
      ],
      questions: [
        {
          kind: 'bug',
          id: 'pytorch-speed-1',
          ask: 'On a GPU this fails at the forward pass with "Expected all tensors to be on the same device".',
          code: `device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = Net().to(device)

for x, y in loader:
    x.to(device)
    y = y.to(device)
    loss = loss_fn(model(x), y)`,
          line: 5,
          fix: '    x = x.to(device)',
          why: 'For a tensor, `.to()` returns a copy on the new device and leaves the original where it was. The result has to be assigned. Modules are different: `model.to(device)` moves the model itself, which is why this slip is so easy to make.',
        },
        {
          kind: 'output',
          id: 'pytorch-speed-2',
          ask: 'What does this print?',
          code: `import torch.nn as nn

model = nn.Linear(2, 1)
print(list(model.state_dict().keys()))`,
          answer: "['weight', 'bias']",
          why: 'A state dict maps each parameter\'s name to its tensor. It holds numbers only, no code: to load it you first build the same model in Python and then call `load_state_dict`.',
        },
        {
          kind: 'output',
          id: 'pytorch-speed-3',
          ask: 'Two layers created separately start with different random weights. What does this print?',
          code: `import torch
import torch.nn as nn

a = nn.Linear(2, 1)
b = nn.Linear(2, 1)
b.load_state_dict(a.state_dict())
print(torch.equal(a.weight, b.weight), a.weight is b.weight)`,
          answer: 'True False',
          why: '`load_state_dict` copies the values into the existing parameters of `b`. The two layers now hold equal numbers and remain separate objects: training one does not change the other.',
        },
        {
          kind: 'bug',
          id: 'pytorch-speed-4',
          ask: 'Resuming from a checkpoint fails with "Missing key(s) in state_dict ... Unexpected key(s) in state_dict: model, optimizer, epoch".',
          code: `torch.save({'epoch': epoch, 'model': model.state_dict(), 'optimizer': optimizer.state_dict()}, 'ckpt.pt')

# later, to resume
ckpt = torch.load('ckpt.pt', map_location=device)
model.load_state_dict(ckpt)
optimizer.load_state_dict(ckpt['optimizer'])
start_epoch = ckpt['epoch'] + 1`,
          line: 5,
          fix: "model.load_state_dict(ckpt['model'])",
          why: 'The file holds a dictionary with three entries, and the model\'s weights are one of them. Passing the whole dictionary offers the model keys named "model" and "epoch" where it expects parameter names.',
        },
        {
          kind: 'bug',
          id: 'pytorch-speed-5',
          ask: 'Gradient accumulation over 4 batches, to imitate a batch 4 times larger. With the learning rate that worked for the large batch, training becomes unstable.',
          code: `accum = 4
for i, (x, y) in enumerate(loader):
    loss = loss_fn(model(x), y)
    loss.backward()
    if (i + 1) % accum == 0:
        optimizer.step()
        optimizer.zero_grad()`,
          line: 3,
          fix: '    loss = loss_fn(model(x), y) / accum',
          why: 'Four backward calls add four mean gradients together, so the step is four times larger than one on a single big batch. Dividing each loss by the number of accumulated batches turns the sum into the average.',
        },
        {
          kind: 'choice',
          id: 'pytorch-speed-6',
          ask: 'In the figure, with float32, a batch of 64 fits on the card and a batch of 128 does not. You want every weight update to be based on 256 examples. Which setting does it?',
          options: [
            'Batch size 256 with accumulation 1',
            'Batch size 64 with accumulation 4',
            'Batch size 128 with accumulation 2',
            'It cannot be done on this card',
          ],
          answer: 1,
          why: 'Memory depends on the batch that passes through the model at one time, not on how many are accumulated. Four batches of 64 give a gradient from 256 examples at the memory cost of 64. The price is fewer updates per epoch, as the figure shows.',
        },
        {
          kind: 'number',
          id: 'pytorch-speed-7',
          ask: 'A dataset has 50,000 examples and the batch size is 128. How many batches are there in one epoch, counting the short last one?',
          answer: 391,
          check: 'math.ceil(50000 / 128)',
          why: '50,000 / 128 = 390.6, so 390 full batches and one short one. Halve the batch size and the number of steps per epoch doubles: check it in the figure.',
        },
        {
          kind: 'choice',
          id: 'pytorch-speed-8',
          ask: 'What does mixed precision do, and what is the `GradScaler` for?',
          options: [
            'It trains half of the layers at a time; the scaler picks which half',
            'It runs most operations in 16-bit floats, which saves memory and time; the scaler multiplies the loss up so that small gradients do not round to zero in 16 bits',
            'It stores the weights as integers; the scaler converts them back',
            'It lowers the learning rate automatically; the scaler is the schedule',
          ],
          answer: 1,
          why: 'A 16-bit float has a narrow range, and a small gradient can underflow to exactly zero. Scaling the loss scales every gradient into a safe range, and the scaler divides it out again before the optimiser step. The weights themselves stay in 32 bits.',
        },
        {
          kind: 'choice',
          id: 'pytorch-speed-9',
          ask: 'A training run with Adam is resumed from a checkpoint that contains only `model.state_dict()`. The loss jumps up straight after resuming and takes a while to recover. Why?',
          options: [
            'The weights were saved in the wrong precision',
            'Adam\'s running averages for every weight (and any learning-rate schedule position) were not saved, so the optimiser starts from scratch on a half-trained model',
            'The data loader lost its shuffle order',
            'Checkpoints can only be loaded at the end of an epoch',
          ],
          answer: 1,
          why: 'Adam scales each step by statistics it has built up over thousands of batches. A new optimiser has none, and its first steps are badly sized for where the model now is. Save and restore `optimizer.state_dict()` together with the model.',
        },
        {
          kind: 'choice',
          id: 'pytorch-speed-10',
          ask: 'A checkpoint saved during training on a GPU is opened on a laptop with no GPU. `torch.load("ckpt.pt")` fails while trying to restore tensors onto a CUDA device. What is the fix?',
          options: [
            '`torch.load("ckpt.pt", map_location="cpu")`',
            'Retrain the model on the laptop',
            'Rename the file to `ckpt_cpu.pt`',
            'Call `model.cuda()` before loading',
          ],
          answer: 0,
          why: 'Tensors are saved with the device they were on, and loading tries to put them back there. `map_location` says where they should go instead. Passing it every time makes the loading code work on any machine.',
        },
        {
          kind: 'choice',
          id: 'pytorch-speed-11',
          ask: 'When is `pin_memory=True` on a `DataLoader` worth setting?',
          options: [
            'Always: it makes loading from disk faster',
            'When training on a GPU: batches are kept in memory that can be copied to the GPU faster, best together with `.to(device, non_blocking=True)`',
            'Only when `num_workers=0`',
            'Only for validation loaders',
          ],
          answer: 1,
          why: 'Pinning concerns the copy from main memory to the GPU and nothing else. On a CPU-only machine there is no such copy, so it only uses memory. It does not speed up reading or decoding files: that is what `num_workers` is for.',
        },
        {
          kind: 'design',
          id: 'pytorch-speed-12',
          ask: 'Your training script stops with "CUDA out of memory" on the first batch. The model is the one you want and you cannot get a larger GPU. What are your options, and what does each cost?',
          why: 'There is a standard ladder, from free to expensive. Knowing what each rung costs lets you fit a model on the hardware you have without quietly changing the experiment.',
          checklist: [
            { point: 'Halve the batch size until it fits', why: 'Activation memory is proportional to batch size. It is the first and simplest lever.' },
            { point: 'Use gradient accumulation to keep the effective batch size, dividing the loss by the number of accumulated batches', why: 'Same gradient as the large batch at the memory of the small one. It costs nothing but care; batch normalisation still sees the small batch.' },
            { point: 'Turn on mixed precision with `autocast` and a `GradScaler`', why: 'About half the activation memory and usually faster, for a few extra lines.' },
            { point: 'Check that validation runs under `torch.no_grad()` and that nothing keeps loss tensors or outputs in a list', why: 'Kept graphs are a leak that looks like a model that is too large.' },
            { point: 'Reduce what goes through the model: smaller images, shorter sequences', why: 'Memory grows with input size as well as batch size. This changes the task, so say so in the results.' },
            { point: 'Freeze part of the network', why: 'Frozen layers at the start need no stored activations for a backward pass. Useful when fine-tuning a pretrained model.' },
            { point: 'Only then consider a smaller model', why: 'It is the one option that changes what you set out to train.' },
          ],
        },
      ],
    },
    {
      id: 'pytorch-lab',
      title: 'Lab: read and repair a training script',
      summary: 'One complete script, from dataset to checkpoint, taken apart piece by piece.',
      text: [
        'This lab works through a whole training script for a small classifier: points in the plane, two classes. PyTorch does not run in the browser, so you will read parts of it and say what they print, find the broken line in versions with a bug, and rebuild three of its pieces in NumPy. The script below is the correct version. Read it once from top to bottom before you start.',
        { code: `import torch
from torch import nn
from torch.utils.data import Dataset, DataLoader

class Points(Dataset):
    def __init__(self, X, y):
        self.X = torch.as_tensor(X, dtype=torch.float32)
        self.y = torch.as_tensor(y, dtype=torch.long)

    def __len__(self):
        return len(self.X)

    def __getitem__(self, i):
        return self.X[i], self.y[i]

def evaluate(model, loader, device):
    model.eval()
    correct = 0
    with torch.no_grad():
        for x, y in loader:
            x, y = x.to(device), y.to(device)
            correct += (model(x).argmax(dim=1) == y).sum().item()
    return correct / len(loader.dataset)` },
        { code: `def main(X_train, y_train, X_val, y_val, epochs=20):
    torch.manual_seed(0)
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    train_loader = DataLoader(Points(X_train, y_train), batch_size=32, shuffle=True)
    val_loader = DataLoader(Points(X_val, y_val), batch_size=128)

    model = nn.Sequential(nn.Linear(2, 16), nn.ReLU(), nn.Linear(16, 2)).to(device)
    loss_fn = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=1e-2)

    best = 0.0
    for epoch in range(epochs):
        model.train()
        for x, y in train_loader:
            x, y = x.to(device), y.to(device)
            optimizer.zero_grad()
            loss = loss_fn(model(x), y)
            loss.backward()
            optimizer.step()

        acc = evaluate(model, val_loader, device)
        if acc > best:
            best = acc
            torch.save({'epoch': epoch, 'model': model.state_dict(),
                        'optimizer': optimizer.state_dict()}, 'best.pt')
    return best` },
        'Every real training script is this one with more around it: a larger model, a learning-rate schedule, logging. The parts are always a dataset, loaders, a model, a loss, an optimiser, the loop, an evaluation and a checkpoint. When a script misbehaves, go through those parts in that order.',
        'The steps follow the script from top to bottom. The NumPy steps are separate from each other, so each one repeats what it needs.',
      ],
      rules: [
        'A training script has eight parts: dataset, loaders, model, loss, optimiser, loop, evaluation, checkpoint.',
        'Inputs are `float32`, class labels are `int64`, and both go to the device with the model.',
        'The model returns logits. The loss turns them into a number, `argmax` turns them into predictions.',
        'Evaluation: eval mode, no gradients, divide by the number of examples.',
        'Save state dicts for the model and the optimiser, and keep the best checkpoint by validation score.',
      ],
      questions: [
        {
          kind: 'output',
          id: 'pytorch-lab-1',
          ask: 'Step 1, the dataset and loader. Ten points with two features each, labels alternating 0 and 1. What does this print?',
          code: `import torch
from torch.utils.data import Dataset, DataLoader

class Points(Dataset):
    def __init__(self, X, y):
        self.X = torch.as_tensor(X, dtype=torch.float32)
        self.y = torch.as_tensor(y, dtype=torch.long)

    def __len__(self):
        return len(self.X)

    def __getitem__(self, i):
        return self.X[i], self.y[i]

X = [[i, i] for i in range(10)]
y = [i % 2 for i in range(10)]
loader = DataLoader(Points(X, y), batch_size=4)
xb, yb = next(iter(loader))
print(len(loader), xb.shape, yb.tolist())`,
          answer: '3 torch.Size([4, 2]) [0, 1, 0, 1]',
          why: 'Ten examples in batches of 4 make 3 batches. The first batch stacks four points of 2 features into (4, 2), with their four labels. Without shuffling they come in order.',
        },
        {
          kind: 'bug',
          id: 'pytorch-lab-2',
          ask: 'Step 2. With this version of the dataset, the first call to the loss fails with "expected scalar type Long but found Float".',
          code: `class Points(Dataset):
    def __init__(self, X, y):
        self.X = torch.as_tensor(X, dtype=torch.float32)
        self.y = torch.as_tensor(y, dtype=torch.float32)

    def __len__(self):
        return len(self.X)

    def __getitem__(self, i):
        return self.X[i], self.y[i]`,
          line: 4,
          fix: '        self.y = torch.as_tensor(y, dtype=torch.long)',
          why: '`CrossEntropyLoss` uses each target as an index into the row of logits, so it must be an integer type. The error appears at the loss, far from its cause in the dataset. Fixing the dtype where the data enters is cleaner than converting in the loop.',
        },
        {
          kind: 'write',
          id: 'pytorch-lab-3',
          numpy: true,
          ask: 'Step 3. Rebuild the training loader in NumPy: shuffle once with `rng.permutation`, then yield `(X_batch, y_batch)` pairs of `batch_size` rows, the last one possibly shorter.',
          starter: `import numpy as np

def minibatches(X, y, batch_size, rng):
    # X: (n, d)   y: (n,)
    # yield (X_batch, y_batch) in a shuffled order
    pass`,
          solution: `import numpy as np

def minibatches(X, y, batch_size, rng):
    order = rng.permutation(len(X))
    for start in range(0, len(X), batch_size):
        idx = order[start:start + batch_size]
        yield X[idx], y[idx]`,
          tests: `X = np.arange(20.0).reshape(10, 2)
y = np.arange(10)
out = minibatches(X, y, 4, np.random.default_rng(0))
assert out is not None, "the function returns nothing yet: use yield"
got = list(out)
assert len(got) == 3, f"10 rows in batches of 4 should give 3 batches, got {len(got)}"
assert [len(xb) for xb, _ in got] == [4, 4, 2], "the batch sizes should be 4, 4 and 2"
assert got[0][0].shape == (4, 2) and got[0][1].shape == (4,), "each batch is a pair: X of shape (4, 2) and y of shape (4,)"
seen = np.concatenate([yb for _, yb in got])
assert sorted(seen.tolist()) == list(range(10)), "every example should appear exactly once in an epoch"
assert seen.tolist() == np.random.default_rng(0).permutation(10).tolist(), "shuffle with rng.permutation(len(X))"
for xb, yb in got:
    assert np.allclose(xb[:, 0], 2 * yb), "X and y must be shuffled together: each row has to keep its own label"`,
          why: 'One permutation of the row numbers, used to index both arrays, keeps every input with its label. Shuffling `X` and `y` separately is a bug that produces a loss stuck at ln(classes).',
        },
        {
          kind: 'output',
          id: 'pytorch-lab-4',
          ask: 'Step 4, the model. What does this print?',
          code: `import torch
from torch import nn

model = nn.Sequential(nn.Linear(2, 16), nn.ReLU(), nn.Linear(16, 2))
x = torch.zeros(8, 2)
print(model(x).shape, sum(p.numel() for p in model.parameters()))`,
          answer: 'torch.Size([8, 2]) 82',
          hint: 'Two linear layers, each with weights and biases.',
          why: 'Eight examples in, two logits each out. The parameters are 2×16 + 16 = 48 in the first layer and 16×2 + 2 = 34 in the second. Checking the output shape and the parameter count on a dummy batch is the first test of any model.',
        },
        {
          kind: 'write',
          id: 'pytorch-lab-5',
          numpy: true,
          ask: 'Step 5, the loss. Write what `CrossEntropyLoss` computes: the mean over the batch of −log(softmax probability of the true class). It must work on logits in the thousands.',
          hint: 'Subtract the largest logit of each row first. Then log-softmax is z − log(Σ exp(z)).',
          starter: `import numpy as np

def cross_entropy(logits, targets):
    # logits: (n, classes)   targets: (n,) class indices
    pass`,
          solution: `import numpy as np

def cross_entropy(logits, targets):
    z = logits - logits.max(axis=1, keepdims=True)
    logp = z - np.log(np.exp(z).sum(axis=1, keepdims=True))
    return -logp[np.arange(len(targets)), targets].mean()`,
          tests: `out = cross_entropy(np.zeros((2, 4)), np.array([1, 3]))
assert out is not None, "the function returns nothing yet"
assert abs(out - np.log(4)) < 1e-9, f"equal logits over 4 classes should give ln 4 = 1.3863, got {out}"
logits = np.array([[2.0, 0.0], [0.0, 2.0]])
assert abs(cross_entropy(logits, np.array([0, 1])) - 0.1269280110) < 1e-6, "right and fairly confident on both rows should give about 0.1269"
assert abs(cross_entropy(logits, np.array([1, 1])) - 1.1269280110) < 1e-6, "one right and one wrong should give about 1.1269: is it the mean over the batch?"
with np.errstate(all="ignore"):
    big = cross_entropy(np.array([[1000.0, 0.0], [0.0, 1000.0]]), np.array([0, 0]))
assert np.isfinite(big), "the loss is inf or nan for large logits: subtract the row maximum before exponentiating"
assert abs(big - 500.0) < 1e-6, f"logits of 1000 with one row right and one wrong should give 500, got {big}"`,
          why: 'Pick out the log-probability of the true class in each row and average. Subtracting the row maximum changes nothing mathematically and keeps `exp` from overflowing. This is why the loss takes logits: it can do the softmax and the log together, safely.',
        },
        {
          kind: 'bug',
          id: 'pytorch-lab-6',
          ask: 'Step 6, the loop. This version crashes on the first batch with "\'float\' object has no attribute \'backward\'".',
          code: `for epoch in range(epochs):
    model.train()
    for x, y in train_loader:
        x, y = x.to(device), y.to(device)
        optimizer.zero_grad()
        loss = loss_fn(model(x), y).item()
        loss.backward()
        optimizer.step()`,
          line: 6,
          fix: '        loss = loss_fn(model(x), y)',
          why: '`.item()` turns the loss into a plain Python number, which has no history to differentiate. Keep the tensor for `backward()` and call `.item()` only on the copy you log.',
        },
        {
          kind: 'write',
          id: 'pytorch-lab-7',
          numpy: true,
          ask: 'Step 7, evaluation. Write the accuracy that `evaluate` computes: the share of rows whose largest logit is at the true class.',
          starter: `import numpy as np

def accuracy(logits, targets):
    # logits: (n, classes)   targets: (n,) class indices
    pass`,
          solution: `import numpy as np

def accuracy(logits, targets):
    return float((logits.argmax(axis=1) == targets).mean())`,
          tests: `logits = np.array([[2.0, 1.0], [0.0, 3.0], [1.0, 0.5], [0.2, 0.9]])
out = accuracy(logits, np.array([0, 1, 1, 1]))
assert out is not None, "the function returns nothing yet"
assert abs(out - 0.75) < 1e-9, f"three of four predictions are right: 0.75, got {out}"
assert accuracy(logits, np.array([0, 1, 0, 1])) == 1.0, "all four right should give 1.0"
tall = np.array([[0.1, 0.9, 0.0], [0.8, 0.1, 0.1]])
assert accuracy(tall, np.array([1, 0])) == 1.0, "take the argmax along the class axis (axis=1), not along the batch"
assert accuracy(-logits, np.array([0, 1, 0, 1])) == 0.0, "all four wrong should give 0.0"`,
          why: 'The predicted class is the position of the largest logit in each row. No softmax is needed: it does not change which entry is largest. The mean of the right/wrong flags is the accuracy, already divided by the number of examples.',
        },
        {
          kind: 'bug',
          id: 'pytorch-lab-8',
          ask: 'Step 8, the checkpoint. Saving fails with "cannot pickle \'generator\' object".',
          code: `acc = evaluate(model, val_loader, device)
if acc > best:
    best = acc
    torch.save({
        'epoch': epoch,
        'model': model.parameters(),
        'optimizer': optimizer.state_dict(),
    }, 'best.pt')`,
          line: 6,
          fix: "        'model': model.state_dict(),",
          why: '`parameters()` is a generator made for handing to an optimiser: it has no names and cannot be saved. `state_dict()` is the dictionary of names to tensors that `load_state_dict` reads back.',
        },
        {
          kind: 'design',
          id: 'pytorch-lab-9',
          ask: 'Step 9. The script runs and reports 97% validation accuracy on the toy data. Before you use it as the starting point for a real project, what would you check and what would you add?',
          why: 'A script that runs is not yet a script you can trust. These additions are what separates a demonstration from something you can leave training overnight and believe in the morning.',
          checklist: [
            { point: 'Check the first loss against ln(classes) and overfit one batch', why: 'Two fast tests that the model, loss and loop are wired correctly before any long run.' },
            { point: 'Print the shape and dtype of one batch, the logits and the targets', why: 'Shape and dtype mistakes are the most common bugs and several of them are silent.' },
            { point: 'Compare with a simple baseline, such as always predicting the largest class', why: '97% means little if 96% of the examples belong to one class.' },
            { point: 'Keep validation data separate, unshuffled and unaugmented, and hold back a test set that is used once', why: 'Choosing the best checkpoint by validation accuracy makes that number optimistic. The test set gives the honest one.' },
            { point: 'Log the training loss and the validation metric every epoch', why: 'The curves show overfitting, a bad learning rate or a stalled run. A single final number shows none of them.' },
            { point: 'Test that resuming from the checkpoint works, with model, optimiser and epoch restored and `map_location` set', why: 'A checkpoint that has never been loaded is not a backup.' },
            { point: 'Set `num_workers` and `pin_memory` on the loaders and move every batch to the device', why: 'On real data the input pipeline, not the model, is usually what limits speed.' },
            { point: 'Fix the seeds and record the settings of each run', why: 'Otherwise you cannot reproduce a good result or explain a bad one.' },
          ],
        },
      ],
    },
  ],
}
