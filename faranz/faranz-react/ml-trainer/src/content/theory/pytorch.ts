import type { Block } from '../../types'

/** The full theory for each lesson of the pytorch module, keyed by lesson id. */
export const pytorchTheory: Record<string, Block[]> = {
  'pytorch-tensors': [
    { h: 'What a tensor is' },
    "**PyTorch** is a Python library for building and training neural networks. Its basic object is the **tensor**: a grid of numbers, like a NumPy array. A single number is a tensor with no axes. A vector has one axis, a table two. A batch of colour images has four: which image, which colour channel, which row of pixels, which column.",
    'Every input, weight and output of a model is a tensor, and most PyTorch bugs come from one of three properties being different from what you thought.',
    { sub: 'Shape, dtype and device' },
    {
      list: [
        'The **shape** is the size of each axis. A table with 2 rows and 3 columns has shape (2, 3). An **axis** is also called a **dimension**, and they are numbered from 0.',
        'The **dtype** (data type) is the kind of number stored. `float32` holds decimals and is what model weights and inputs use. `int64` holds whole numbers and is what class labels use (class 0, class 1, class 2).',
        'The **device** is where the numbers live: `cpu` (ordinary memory) or `cuda` (the memory of a graphics card, a GPU, which does this arithmetic much faster).',
      ],
    },
    {
      code: `import torch

a = torch.tensor([[1, 2, 3], [4, 5, 6]])
print(a.shape)
print(a.dtype, a.device)
b = torch.tensor([0.5, 1.5])
print(b.dtype)`,
      out: `torch.Size([2, 3])
torch.int64 cpu
torch.float32`,
    },
    "Whole numbers give `int64`, and a decimal point gives `float32`. Features typed without decimal points arrive as integers and need `.float()` before they go into a model. `.long()` converts to `int64`.",

    { h: 'Changing the shape' },
    { sub: 'reshape and view' },
    "`reshape` reads the numbers in their row-by-row order and lays them out again in a new shape. `view` does the same. The total count must stay the same: 8 numbers can be (2, 4), (4, 2) or (8,), never (3, 3). Writing `-1` for one size means \"work this one out\": `reshape(-1, 2)` on 8 numbers gives (4, 2).",
    { sub: 'permute' },
    '`permute` reorders the axes themselves. `permute(1, 0)` on a table makes axis 1 (the columns) the new axis 0, so rows become columns. The numbers move to new places. Compare the two on the same tensor:',
    {
      code: `import torch

x = torch.arange(8).reshape(2, 4)
print(x.tolist())
print(x.permute(1, 0).tolist())
print(x.reshape(4, 2).tolist())`,
      out: `[[0, 1, 2, 3], [4, 5, 6, 7]]
[[0, 4], [1, 5], [2, 6], [3, 7]]
[[0, 1], [2, 3], [4, 5], [6, 7]]`,
    },
    "`torch.arange(8)` gives the numbers 0 to 7. Both results have shape (4, 2), but only `permute` turned columns into rows. `reshape` broke the same reading order into lines of two. Since the shapes agree, using one in place of the other scrambles your data in silence.",
    "Where this matters most: an image read from a file is stored as (height, width, channels). Convolutional networks want (channels, height, width). Moving the channel axis is a `permute`. For a batch shaped (batch, height, width, channels), keep axis 0 where it is and move axis 3 to second place.",
    { sub: 'unsqueeze and squeeze' },
    '`unsqueeze(d)` inserts a new axis of size 1 at position `d`. Models expect a batch, a stack of examples along axis 0, so a single example is turned into a batch of one with `unsqueeze(0)`. `squeeze(d)` removes the axis at `d` if its size is 1. `squeeze()` with no argument removes every axis of size 1.',
    {
      code: `import torch

x = torch.zeros(5, 2)
print(x.unsqueeze(1).shape)
p = torch.zeros(1, 1)
print(p.squeeze(1).shape)
print(p.squeeze().shape)`,
      out: `torch.Size([5, 1, 2])
torch.Size([1])
torch.Size([])`,
    },
    'Read `p` as model output for a batch of one example. The bare `squeeze()` threw the batch axis away too. Always name the axis.',

    { h: 'Views share memory' },
    'A **view** is a new tensor object that reads the same memory as an existing one. `view`, `permute`, `unsqueeze`, slicing such as `x[0]`, and usually `reshape`, return views. Write into one and the original changes. `.clone()` makes a separate copy.',
    {
      code: `import torch

a = torch.arange(4)
b = a.view(2, 2)
b[1, 1] = 100
print(a)`,
      out: 'tensor([  0,   1,   2, 100])',
    },

    { h: 'Summing along an axis and broadcasting' },
    { sub: 'Reductions' },
    'A **reduction** such as `sum`, `mean` or `max` turns many numbers into fewer. With `dim=0` you add along axis 0: that axis disappears and one total is left per column. `keepdim=True` keeps it with size 1.',
    {
      code: `import torch

m = torch.tensor([[1, 2], [3, 4], [5, 6]])
print(m.sum(dim=0))
print(m.sum(dim=1))
print(m.sum(dim=1, keepdim=True).shape)`,
      out: `tensor([ 9, 12])
tensor([ 3,  7, 11])
torch.Size([3, 1])`,
    },
    '`argmax(dim=1)` is a relative: for each row it gives the position of the largest value. On a table of class scores, one row per example, that is the predicted class of each example.',
    { sub: 'Broadcasting' },
    '**Broadcasting** is how PyTorch combines tensors of different shapes, by the same rule as NumPy. Write the two shapes one above the other, lined up from the right. A missing axis on the left counts as size 1. For each pair of sizes: if they are equal, fine; if one is 1, it is stretched to match the other; otherwise it is an error. A tensor with no axes, shape (), broadcasts with anything.',
    'Worked example: (5, 1, 4) with (3, 1). Line up from the right: 4 with 1 gives 4; 1 with 3 gives 3; 5 with nothing (counts as 1) gives 5. The result is (5, 3, 4). And (2, 4) with (3,): 4 against 3, neither is 1, so it is an error.',
    'The trap: a model predicting one number per example often returns (n, 1), while the targets are (n,). Subtracting gives (n, n), every prediction minus every target, with no error.',
    {
      code: `import torch

pred = torch.zeros(4, 1)
y = torch.zeros(4)
print((pred - y).shape)
print((pred.squeeze(1) - y).shape)`,
      out: `torch.Size([4, 4])
torch.Size([4])`,
    },

    { h: 'Dtype and device in practice' },
    "Comparing two tensors with `==` gives a tensor of `True` and `False` values (dtype `bool`). PyTorch will not take the `mean` of booleans or of integers, so convert first: `(preds == labels).float().mean()` is the fraction that match. `.item()` turns a tensor holding one number into a plain Python number.",
    "Tensors in one operation must be on the same device. `model.to('cuda')` moves the model's weights, and `x.to('cuda')` returns a copy of `x` on the GPU. A tensor you create later, such as `torch.zeros(3)`, is made on the CPU unless you say otherwise. Inside a model, create new tensors where the input is: `torch.zeros(3, device=x.device)` works on a CPU and on a GPU.",
    { sub: 'To and from NumPy' },
    "`torch.from_numpy(a)` makes a tensor that shares memory with the NumPy array `a`, and it keeps the array's dtype. NumPy decimals are `float64`, which a `float32` model refuses, so the usual line is `torch.from_numpy(a).float()`.",
    {
      code: `import numpy as np
import torch

a = np.array([0.5, 1.5])
t = torch.from_numpy(a)
print(t.dtype, t.float().dtype)
print(t.detach().cpu().numpy())`,
      out: `torch.float64 torch.float32
[0.5 1.5]`,
    },
    "Going back with `.numpy()` only works on a CPU tensor that is not part of a gradient calculation (the next lesson). `t.detach().cpu().numpy()` is the form that always works.",

    { h: 'Mistakes to watch for' },
    {
      list: [
        'Using `reshape` to move the channel axis of images. Use `permute`.',
        'Subtracting (n, 1) from (n,) and getting (n, n). Check shapes before arithmetic between predictions and targets.',
        "Feeding `float64` from NumPy or `int64` features to a model. Call `.float()`.",
        'Making a new tensor inside `forward` without `device=`, which breaks on a GPU.',
      ],
    },
  ],

  'pytorch-autograd': [
    { h: 'Why PyTorch computes gradients' },
    "Training a model means nudging its weights so that the **loss**, the one number that measures how wrong the predictions are, goes down. To know which way to nudge each weight you need its **gradient**: how much the loss changes when that weight changes a tiny bit. That is the **derivative** from the maths module. For a weight w and a loss L it is written dL/dw. If dL/dw is positive, making w a little smaller lowers the loss.",
    "A real model has millions of weights, and working out each derivative by hand is impossible. **Autograd** is the part of PyTorch that does it for you. It records the calculation as it runs and then works backward through the record, applying the **chain rule** (the rule for the derivative of one function inside another) at each step.",

    { h: 'Recording and walking backward' },
    { sub: 'requires_grad and backward' },
    'Create a tensor with `requires_grad=True` and PyTorch records every operation done with it. This record is called the **computation graph**. Call `.backward()` on the final number and PyTorch walks the graph in reverse and stores dL/dw in the `.grad` attribute of each tensor you started from.',
    {
      code: `import torch

w = torch.tensor(4.0, requires_grad=True)
loss = 5 * w ** 2
loss.backward()
print(w.grad)`,
      out: 'tensor(40.)',
    },
    'By hand: the derivative of 5w² is 10w, and at w = 4 that is 40. Autograd got the same number from the record of the two operations (square, then multiply by 5). The weights inside a model already have `requires_grad=True`, so in practice the only call you write is `loss.backward()`.',
    { sub: 'A value used twice' },
    'When one tensor is used in two places, each use sends back its own gradient and the two are added. Take y = x·x + 4x at x = 3. The square sends back 2x = 6, the other term sends back 4, and `x.grad` ends up as 10, which matches the derivative 2x + 4.',
    { sub: 'backward needs one number' },
    'A gradient is defined for one number with respect to many inputs. If the final tensor holds several values, one per example say, reduce it to a single number with `.mean()` or `.sum()` first. Otherwise PyTorch stops with an error.',
    {
      code: `import torch

v = torch.tensor([1.0, 2.0], requires_grad=True)
try:
    (v * 3).backward()
except RuntimeError as e:
    print(e)`,
      out: 'grad can be implicitly created only for scalar outputs',
    },
    'A **scalar** is a single number. `(v * 3).sum().backward()` works.',

    { h: 'Gradients add up' },
    "`backward()` adds the new gradient to whatever is already in `.grad`. It does not replace it. That is the same adding as for a value used twice, and it is deliberate, but it means the gradient from the previous training step is still there unless you clear it.",
    {
      code: `import torch

w = torch.tensor(1.0, requires_grad=True)
for step in range(2):
    loss = 3 * w
    loss.backward()
    print(w.grad)
w.grad.zero_()
print(w.grad)`,
      out: `tensor(3.)
tensor(6.)
tensor(0.)`,
    },
    "The true gradient is 3 each time, yet after the second call `.grad` holds 6. `w.grad.zero_()` sets it back to 0 (a method ending in `_` changes the tensor in place). In a training loop the optimiser's `zero_grad()` does this for every weight. Forget it and each step uses the sum of all gradients so far: steps grow larger and point in an out-of-date direction, with no error.",

    { h: 'Turning the recording off' },
    { sub: 'no_grad' },
    'Inside a `with torch.no_grad():` block nothing is recorded, and results do not require gradients. Use it when you only want predictions, for example on validation data: it saves memory and time. Use it also when you change weights by hand, because the update itself should not become part of the graph.',
    { sub: 'detach and item' },
    "`t.detach()` returns a tensor with the same values, cut off from the graph. Autograd then treats it as a constant. Suppose x = 5, y = 2x, and z = y.detach() × x. To autograd, z is 10 × x, so dz/dx = 10. Without the detach z would be 2x², with gradient 4x = 20. Detaching is how you stop a gradient flowing down one path.",
    '`.item()` turns a tensor holding one number into a plain Python number.',
    {
      code: `import torch

w = torch.tensor(2.0, requires_grad=True)
with torch.no_grad():
    a = w * 10
b = w * 10
print(a.requires_grad, b.requires_grad, b.detach().requires_grad)
print(b.item())`,
      out: `False True False
20.0`,
    },
    "To log the loss, add `loss.item()` to your running total, never `loss`. The tensor `loss` is attached to the whole graph of its forward pass. A total built from such tensors keeps every batch's graph alive, and memory grows until the program is killed. Likewise, to hand a result to NumPy or a plotting library, use `t.detach().cpu().numpy()`: NumPy cannot hold a graph or GPU memory.",

    { h: 'Changing tensors in place' },
    "An **in-place** operation overwrites a tensor's own values: `+=`, `x[0] = 1`, or methods ending in `_` such as `relu_()`. Some backward steps need a value from the forward pass. The derivative of exp(x) is exp(x) again, so autograd keeps the output of `exp` to reuse. If you overwrite that output in place, PyTorch raises \"modified by an inplace operation\" at `backward()`. Writing `y = y + 1` makes a new tensor and leaves the saved one alone.",
    { sub: 'Updating weights by hand' },
    'A weight that requires gradients cannot be changed in place while it is being recorded. Under `no_grad` it can, and that is the correct way to take a gradient step yourself:',
    {
      code: `import torch

w = torch.tensor(1.0, requires_grad=True)
loss = (w - 3) ** 2
loss.backward()
with torch.no_grad():
    w -= 0.1 * w.grad
w.grad.zero_()
print(w)`,
      out: 'tensor(1.4000, requires_grad=True)',
    },
    'The gradient is 2(w − 3) = −4, so w moves by −0.1 × −4 = 0.4, towards 3. The number 0.1 is the **learning rate**, the size of each step. Writing `w = w - 0.1 * w.grad` instead looks the same but is not: it builds a new tensor and gives it the name `w`. Made under `no_grad`, that new tensor does not require gradients and its `.grad` is `None`, so the next line fails.',

    { h: 'Mistakes to watch for' },
    {
      list: [
        'Forgetting to zero gradients between steps. They accumulate.',
        'Calling `backward()` on a tensor with more than one value. Reduce with `.mean()` or `.sum()`.',
        'Adding `loss` instead of `loss.item()` to a running total, which leaks memory.',
        'Calling `.numpy()` on a tensor that requires gradients or lives on a GPU.',
        'Updating weights with `w = w - ...` instead of `w -= ...` under `no_grad`.',
        'Using `detach()` to fix an error in `backward()`: it throws away the graph that `backward()` needs.',
      ],
    },
  ],

  'pytorch-modules': [
    { h: 'A model is a class' },
    'In PyTorch a model is a Python class that inherits from `nn.Module` (`nn` is `torch.nn`, the part of PyTorch with ready-made layers). The class has two methods. In `__init__` you create the layers and store them on `self`. In `forward` you say how an input flows through them. You then call the model like a function, `model(x)`, and PyTorch runs `forward` for you.',
    {
      code: `import torch
import torch.nn as nn

class Net(nn.Module):
    def __init__(self):
        super().__init__()
        self.hidden = nn.Linear(3, 4)
        self.out = nn.Linear(4, 2)

    def forward(self, x):
        return self.out(torch.relu(self.hidden(x)))

model = Net()
print(model(torch.zeros(6, 3)).shape)`,
      out: 'torch.Size([6, 2])',
    },
    '`super().__init__()` runs the setup of `nn.Module` and must come first. `torch.relu` is the **ReLU** activation: it keeps positive numbers and turns negative ones into 0. Without a bend like this between them, two linear layers would collapse into one.',

    { h: 'Layers and their parameters' },
    { sub: 'What a linear layer holds' },
    "`nn.Linear(a, b)` takes vectors of `a` numbers and gives back vectors of `b` numbers. Each of the `b` outputs is a weighted sum of all `a` inputs plus a constant, so the layer stores an a × b grid of **weights** and `b` **biases**. These learnable numbers are the **parameters**. `nn.Linear(3, 4)` has 3 × 4 + 4 = 16, and `nn.Linear(4, 2)` has 4 × 2 + 2 = 10. ReLU has nothing to learn, so the model above has 26 parameters.",
    'A linear layer only changes the last axis. A batch of shape (6, 3) becomes (6, 4) and then (6, 2): six examples in, six answers out.',
    { sub: 'Registering and counting' },
    "Assigning a layer to an attribute of `self` **registers** it: PyTorch now knows it belongs to the model. Only registered parameters are returned by `model.parameters()`, handed to the optimiser, moved by `.to(device)` and saved to disk. Layers kept in a plain Python list are invisible. Use `nn.ModuleList`, a list that registers what it holds, or `nn.Sequential`, which also runs its layers one after another.",
    {
      code: `import torch.nn as nn

model = nn.Sequential(nn.Linear(3, 4), nn.ReLU(), nn.Linear(4, 2))
print(sum(p.numel() for p in model.parameters()))
for name, p in model.named_parameters():
    print(name, tuple(p.shape))`,
      out: `26
0.weight (4, 3)
0.bias (4,)
2.weight (2, 4)
2.bias (2,)`,
    },
    "`p.numel()` is the number of entries in a tensor. Inside `nn.Sequential`, layers are named by position, so the ReLU at position 1 has no entry. In a class, parameters take the attribute name: `hidden.weight`, `out.bias`. These names are the keys of a saved model. Comparing the count with what you expected is a quick check that you built what you meant.",

    { h: 'Logits and the cross-entropy loss' },
    'A classifier with k classes ends in a layer with k outputs. Those raw scores are called **logits**. They can be any number, positive or negative.',
    { sub: 'Softmax' },
    "**Softmax** turns logits into probabilities: raise e (about 2.718) to the power of each logit, then divide each result by their total. The outputs are positive and add up to 1. Logits (2, 1, 0) become about (0.665, 0.245, 0.090). Equal logits give equal probabilities: with 5 classes, 0.2 each.",
    { sub: 'Cross-entropy' },
    "The **cross-entropy** loss for one example is −ln(p), where p is the probability the model gave the correct class and ln is the natural logarithm. A confident right answer (p near 1) costs almost 0. A model that gives the right class 0.665 pays −ln(0.665) ≈ 0.408. A model that knows nothing gives every class 1/k and pays ln(k). So the loss at the very start of training should be close to ln(number of classes): about 1.609 for 5 classes. A much larger first loss means something is wrong.",
    {
      code: `import torch
import torch.nn.functional as F

logits = torch.zeros(3, 10)
targets = torch.tensor([2, 7, 9])
print(round(F.cross_entropy(logits, targets).item(), 4))`,
      out: '2.3026',
    },
    "That is ln(10). `F.cross_entropy` is the function form of `nn.CrossEntropyLoss()`. Both take the logits of shape (batch, classes) first and the targets second, as one class index per example: shape (batch,), dtype `int64`. Not probabilities, not one-hot rows (a row of zeros with a 1 at the class), not floats.",
    "The loss applies softmax itself, in a numerically safe way. So the model's last layer must have no activation. If `forward` also ends in a softmax, the probabilities are put through softmax a second time. Numbers between 0 and 1 give nearly equal outputs, the loss cannot get low, and the gradients are tiny. No error is raised.",

    { h: 'Yes or no outputs' },
    "For a yes/no question (spam or not), or several independent yes/no labels, the model outputs one logit per label. The **sigmoid** function, 1 / (1 + e^(−z)), turns a logit z into a probability between 0 and 1. The loss is **binary cross-entropy**: −ln(p) when the target is 1 and −ln(1 − p) when it is 0. In one line: −[y·ln(p) + (1 − y)·ln(1 − p)].",
    "`nn.BCEWithLogitsLoss` takes logits and targets of the **same shape**, with the targets as **floats** (they may be any value from 0 to 1). It includes the sigmoid, so again the model ends with no activation. Integer targets raise an error about casting Float to Long: convert with `y.float()`. `CrossEntropyLoss` on a single logit is no help, since a softmax over one value is always 1.",
    { sub: 'Why the sigmoid lives inside the loss' },
    "Computed in two steps, the sigmoid of a very negative logit rounds to exactly 0, and ln(0) is minus infinity. In plain Python, e^(−z) for a large negative z overflows. Rearranged with algebra, the same loss is max(z, 0) − z·y + ln(1 + e^(−|z|)), which only ever raises e to a negative power. That is the form the built-in loss uses.",
    {
      code: `import torch
import torch.nn as nn

z = torch.tensor([-200.0])
y = torch.tensor([1.0])
print(-torch.log(torch.sigmoid(z)))
print(nn.BCEWithLogitsLoss()(z, y))`,
      out: `tensor([inf])
tensor(200.)`,
    },

    { h: 'Mistakes to watch for' },
    {
      list: [
        'Ending the model in softmax before `CrossEntropyLoss`, or sigmoid before `BCEWithLogitsLoss`.',
        'Passing float, one-hot or (batch, 1) targets to `CrossEntropyLoss`. It wants (batch,) of `int64`.',
        'Passing `int64` targets to `BCEWithLogitsLoss`. It wants floats shaped like the logits.',
        'Keeping layers in a Python list. The optimiser then reports an empty parameter list.',
        'Forgetting the biases when counting parameters.',
      ],
    },
    "Apply `softmax` or `sigmoid` yourself only when you want probabilities to show or act on, at prediction time.",
  ],

  'pytorch-loop': [
    { h: 'The five steps of training' },
    'Training repeats one small routine for every **batch**, a group of examples processed together:',
    {
      list: [
        '`optimizer.zero_grad()`: clear the gradients left from the last batch.',
        '`logits = model(x)`: the **forward pass**, run the model.',
        '`loss = loss_fn(logits, y)`: measure how wrong it was. Model output first, target second.',
        '`loss.backward()`: the **backward pass**, fill `.grad` of every parameter.',
        '`optimizer.step()`: change every parameter using its gradient.',
      ],
    },
    'One pass over the whole training set is an **epoch**. A training run is many epochs, each followed by a check on **validation** data, examples kept aside to measure how well the model does on data it did not learn from.',

    { h: 'The optimiser' },
    "An **optimiser** is the object that updates the parameters. You create it once and give it the parameters it should look after: `torch.optim.SGD(model.parameters(), lr=0.1)`. **SGD** (stochastic gradient descent) does the update from the previous lesson for every parameter: w ← w − lr × w.grad, where `lr` is the learning rate. `zero_grad()` sets every `.grad` back to zero.",
    { sub: 'A worked example' },
    'One weight starts at w = 2, the loss is (w − 5)², and lr = 0.1. The gradient is 2(w − 5) = −6, so the step is −0.1 × −6 = +0.6 and w becomes 2.6. Next the gradient is 2(2.6 − 5) = −4.8, and w becomes 3.08. Each step moves w closer to 5, where the loss is smallest.',
    {
      code: `import torch

w = torch.tensor([2.0], requires_grad=True)
optimizer = torch.optim.SGD([w], lr=0.1)
for step in range(3):
    optimizer.zero_grad()
    loss = ((w - 5) ** 2).sum()
    loss.backward()
    optimizer.step()
    print(step, round(w.item(), 3))`,
      out: `0 2.6
1 3.08
2 3.464`,
    },
    'Remove `zero_grad()` and the second step would use −6 + −4.8 = −10.8, the gradient of this batch plus the last one. Steps grow and soon overshoot.',
    { sub: 'Order and brackets' },
    "`backward()` must come before `step()`, because `step()` uses the gradients that `backward()` stores. `zero_grad()` can go at the top of the loop or after `step()`, but never between `backward()` and `step()`: there it wipes the fresh gradients and the step moves nothing. Write the brackets. `optimizer.zero_grad` without them names the method and does not call it, and Python raises no error.",

    { h: 'Training mode and evaluation mode' },
    'Two kinds of layer behave differently while training and while predicting:',
    {
      list: [
        '**Dropout** sets a random fraction p of its inputs to 0 on every call during training, so the network cannot rely on any single unit. The survivors are multiplied by 1 / (1 − p) so the average stays the same. When predicting, it passes everything through unchanged.',
        '**Batch normalisation** rescales values using the mean and spread of the current batch during training, and keeps running averages of them. When predicting, it uses those stored averages.',
      ],
    },
    '`model.train()` switches every layer to training behaviour and `model.eval()` to prediction behaviour. The switch stays where you left it.',
    {
      code: `import torch
import torch.nn as nn

torch.manual_seed(0)
drop = nn.Dropout(p=0.75)
x = torch.ones(8)
drop.train()
print(drop(x))
drop.eval()
print(drop(x))`,
      out: `tensor([0., 0., 0., 0., 0., 0., 4., 0.])
tensor([1., 1., 1., 1., 1., 1., 1., 1.])`,
    },
    "With p = 0.75 the survivors are scaled by 1 / 0.25 = 4. `torch.manual_seed(0)` fixes the random choices so the output is the same every run.",
    { sub: 'eval and no_grad do different jobs' },
    "`model.eval()` changes how dropout and batch normalisation behave. It does not stop gradients being recorded. `torch.no_grad()` stops the recording and changes nothing about the layers. Validation needs both: without `eval()` results are noisy and wrong, without `no_grad()` every forward pass keeps memory for a backward pass that never comes, which can run a GPU out of memory. Then call `model.train()` at the start of the next epoch, or the model goes on training without dropout.",

    { h: 'The whole loop' },
    {
      code: `for epoch in range(epochs):
    model.train()
    for x, y in train_loader:
        optimizer.zero_grad()
        loss = loss_fn(model(x), y)
        loss.backward()
        optimizer.step()
    model.eval()
    with torch.no_grad():
        correct = sum((model(x).argmax(dim=1) == y).sum().item() for x, y in val_loader)
    print(epoch, correct / len(val_loader.dataset))`,
    },
    "`train_loader` and `val_loader` hand out batches (the data lesson shows how). `len(val_loader.dataset)` is the number of examples, not batches.",

    { h: 'Measuring per example' },
    { sub: 'Accuracy' },
    "Logits have shape (batch, classes). The predicted class of each example is the position of its largest score along the class axis: `argmax(dim=1)`, one number per example. `argmax(dim=0)` would instead give, for each class, which example scored highest. Count correct predictions and divide by the number of examples. Never pass `argmax` output to the loss: it is whole numbers with no gradient, and the loss needs the raw logits.",
    { sub: 'Average loss' },
    'A loss function returns the mean over its batch. Suppose two batches: 4 examples with mean loss 0.5, then 2 examples with mean loss 2.0. The total loss is 4 × 0.5 + 2 × 2.0 = 6, over 6 examples, so 1.0 per example. Averaging the two batch means gives 1.25, which is wrong because the batches differ in size. Adding the batch means and dividing by 6 gives 0.42, wrong again because each mean was already divided once. Multiply each batch loss by its size, add, then divide by the number of examples. Use `loss.item()` for this, so no graphs are kept.',

    { h: 'Mistakes to watch for' },
    'None of these raise an error. Each one shows up only as a poor or strange learning curve.',
    {
      list: [
        'No `zero_grad()`, or `zero_grad` without brackets.',
        'Evaluating in train mode, or never switching back to `train()`.',
        'Validating without `no_grad()`.',
        'Passing probabilities or `argmax` output to the loss instead of logits.',
        'Dividing by the number of batches instead of the number of examples.',
      ],
    },
  ],

  'pytorch-data': [
    { h: 'Getting examples into batches' },
    'The training loop asks for one batch at a time. Something has to read the data from disk, turn each example into tensors, group examples into batches and shuffle them. PyTorch splits that work between two objects. A **Dataset** knows how to fetch one example. A **DataLoader** asks the dataset for examples and turns them into batches.',

    { h: 'The Dataset' },
    'A dataset is any object that answers two questions. `__len__` returns how many examples there are. `__getitem__(i)` returns example number `i`, usually as a pair (input, label). Those double-underscore names are what Python calls for `len(ds)` and `ds[i]`. Reading a file, decoding an image and applying transforms all happen inside `__getitem__`, one example at a time, so the whole dataset never has to fit in memory.',
    {
      code: `import torch
from torch.utils.data import Dataset

class Cubes(Dataset):
    def __len__(self):
        return 7

    def __getitem__(self, i):
        return torch.tensor([float(i), float(i ** 3)]), i % 3

ds = Cubes()
print(len(ds), ds[2])`,
      out: '7 (tensor([2., 8.]), 2)',
    },
    'Each example here is a tensor of 2 features and a Python integer label. For data stored as a table `X` with one row per example, the length is `len(X)`, the number of rows. `len(X[0])` would be the length of the first row, the number of features: a quiet way to lose most of your data. Anything with a length and indexing, a plain Python list included, can serve as a dataset.',

    { h: 'The DataLoader' },
    { sub: 'Batches and collate' },
    '`DataLoader(ds, batch_size=3)` picks indices, calls `ds[i]` for each, and passes the list of examples to a **collate** function. The default collate stacks them: tensors gain a new batch axis at the front, and Python numbers become one tensor (whole numbers become `int64`, the dtype class labels need).',
    {
      code: `import torch
from torch.utils.data import Dataset, DataLoader

class Cubes(Dataset):
    def __len__(self):
        return 7

    def __getitem__(self, i):
        return torch.tensor([float(i), float(i ** 3)]), i % 3

loader = DataLoader(Cubes(), batch_size=3)
print(len(loader))
for x, y in loader:
    print(x.shape, y)`,
      out: `3
torch.Size([3, 2]) tensor([0, 1, 2])
torch.Size([3, 2]) tensor([0, 1, 2])
torch.Size([1, 2]) tensor([0])`,
    },
    '`len(loader)` is the number of **batches**, not examples. Seven examples in batches of 3 make 7 ÷ 3 = 2.33, rounded up to 3 batches, and the last one holds what is left. Code that assumes every batch has `batch_size` examples breaks on it. `drop_last=True` throws away a final short batch, so the count is rounded down instead: 2. That is common in training, where a batch of one example breaks batch normalisation. It is wrong for validation, where every example must count. `len(loader.dataset)` gives the number of examples.',
    '`next(iter(loader))` fetches the first batch on its own, which is handy for checking shapes.',
    { sub: 'Shuffling' },
    "`shuffle=True` draws a new random order of indices every epoch. Training needs it. Data on disk is often stored in order, all of one class and then all of the next. Unshuffled, every batch holds a single class: the model learns \"always class A\", then \"always class B\", and ends on whichever came last. Shuffled, each batch is a fair sample.",
    {
      code: `import torch
from torch.utils.data import DataLoader

torch.manual_seed(0)
loader = DataLoader(list(range(5)), batch_size=5, shuffle=True)
for epoch in range(2):
    print([b.tolist() for b in loader])`,
      out: `[[1, 4, 2, 3, 0]]
[[2, 3, 4, 0, 1]]`,
    },
    'Every index appears once per epoch, in a fresh order each time. Under the hood it is one random **permutation** (a reordering) of 0 to n − 1 per epoch, cut into slices of `batch_size`. Fixing the seed of the random generator makes the orders repeat from run to run.',
    { sub: 'Workers' },
    "`num_workers` sets how many extra processes load and transform batches in parallel. With 0, the training process does the loading itself between steps. If the GPU shows low use while one CPU core sits at 100%, the GPU is waiting for data, and raising `num_workers` (to 4 or 8, say) is the first thing to try.",

    { h: 'Examples of different sizes' },
    'Stacking needs every example to have the same shape. Sentences turned into lists of token ids (one whole number per word piece) have different lengths, and the default collate fails with "stack expects each tensor to be equal size". The fix is your own `collate_fn`, which receives the list of examples for one batch and **pads** the shorter ones with a filler value up to the longest in that batch.',
    {
      code: `import torch
from torch.utils.data import DataLoader

def pad_collate(batch):
    longest = max(len(s) for s in batch)
    return torch.tensor([s + [0] * (longest - len(s)) for s in batch])

loader = DataLoader([[4, 9], [7], [1, 2, 3]], batch_size=3, collate_fn=pad_collate)
print(next(iter(loader)))`,
      out: `tensor([[4, 9, 0],
        [7, 0, 0],
        [1, 2, 3]])`,
    },
    'Pad to the longest in the batch, not in the whole dataset, so batches of short sentences stay small. A real collate also returns the original lengths (here 2, 1, 3), so the model can ignore the padding. Setting `batch_size=1` also avoids the error, but is far too slow.',

    { h: 'Transforms and augmentation' },
    'For images, the `torchvision` library provides **transforms**, small steps applied in `__getitem__`, chained with `T.Compose`. `T.ToTensor()` turns an image into a float tensor of shape (channels, height, width) with values from 0 to 1. `ImageFolder` is a ready-made dataset that reads images from one folder per class.',
    '**Augmentation** means random changes to training images, such as a random crop or a random left-right flip. The model sees a slightly different version of each image every epoch and cannot memorise them. The validation set gets fixed transforms only: resize, crop from the centre, convert.',
    {
      code: `import torchvision.transforms as T

train_tf = T.Compose([T.RandomResizedCrop(128), T.RandomHorizontalFlip(), T.ToTensor()])
val_tf = T.Compose([T.Resize(146), T.CenterCrop(128), T.ToTensor()])

train_loader = DataLoader(ImageFolder('photos/train', transform=train_tf), batch_size=32, shuffle=True)
val_loader = DataLoader(ImageFolder('photos/val', transform=val_tf), batch_size=32)`,
    },
    'A validation score is a measuring instrument. With random transforms the images change between evaluations, the number is noisy and too low, and you can no longer compare one epoch with the next. Shuffling validation data does no harm, but it does nothing either.',

    { h: 'Mistakes to watch for' },
    {
      list: [
        '`__len__` returning the number of features instead of the number of examples.',
        'Forgetting `shuffle=True` on the training loader.',
        'Giving the validation set the training transforms.',
        'Treating `len(loader)` as the number of examples.',
        'Using `drop_last=True` on the validation loader.',
        'Leaving `num_workers=0` while the GPU waits.',
      ],
    },
  ],

  'pytorch-cnn': [
    { h: 'Why images need a different layer' },
    'A linear layer connects every input to every output. A 224 × 224 colour image has 150,528 numbers, so a linear layer with 1,000 outputs would need 150 million weights, and it would have to learn the same edge detector separately for every place in the picture. A **convolution** instead slides one small grid of weights across the image and reuses it everywhere.',

    { h: 'What a convolution does' },
    'The small grid of weights is the **kernel**, typically 3 × 3. Place it over a patch of the image. Multiply each pixel by the kernel weight on top of it, add up the products, and you have one output number. Move the kernel one step and repeat. The grid of outputs is called a **feature map**.',
    { sub: 'A worked example' },
    'Take a 3 × 4 image that is dark (0) on the left and bright (9) on the right, and the 2 × 2 kernel with rows (−1, 1) and (−1, 1). It computes right column minus left column. Over the first patch, all zeros, the output is 0. Over the middle patch, with 0s on the left and 9s on the right, it is (−1 × 0) + (1 × 9) + (−1 × 0) + (1 × 9) = 18. Over the last patch, all 9s, it is −9 + 9 − 9 + 9 = 0.',
    {
      code: `import torch
import torch.nn.functional as F

image = torch.tensor([[0., 0., 9., 9.],
                      [0., 0., 9., 9.],
                      [0., 0., 9., 9.]])
kernel = torch.tensor([[-1., 1.], [-1., 1.]])
out = F.conv2d(image.reshape(1, 1, 3, 4), kernel.reshape(1, 1, 2, 2))
print(out.squeeze().tolist())`,
      out: '[[0.0, 18.0, 0.0], [0.0, 18.0, 0.0]]',
    },
    "The kernel's weights add up to 0, so on any flat patch the positive and negative parts cancel, however bright it is. It lights up only where brightness changes from left to right: it is an **edge detector**. A kernel with all weights equal averages its patch and blurs the image. In a network the kernel weights are not chosen by hand; they are learned. (Strictly, PyTorch does not flip the kernel, so the operation is called cross-correlation. Since the weights are learned, the difference does not matter.)",

    { h: 'The size of the output' },
    { sub: 'Padding and stride' },
    '**Padding** p adds p rows and columns of zeros around the image. **Stride** s is how far the kernel moves each step. For input size n and kernel size k, the output size along one side is ⌊(n + 2p − k) / s⌋ + 1. The brackets ⌊ ⌋ mean round down: positions where the kernel would hang off the edge are dropped.',
    {
      list: [
        'In the example above: n = 4 wide, k = 2, p = 0, s = 1 gives (4 − 2) / 1 + 1 = 3. Height 3 gives 2.',
        'A 3 × 3 kernel with no padding loses one pixel on each side. A 20-pixel side becomes 18, and pixels at the border are covered by fewer kernel positions than those in the middle.',
        'A 3 × 3 kernel with padding 1 keeps the size: (20 + 2 − 3) + 1 = 20. This is the standard pairing, because then a network can be as deep as you like.',
        'Stride 2 roughly halves it: ⌊(20 + 2 − 3) / 2⌋ + 1 = 10.',
      ],
    },
    'You need this sum whenever convolutions feed a linear layer, which must be told exactly how many numbers arrive.',
    { sub: 'Channels' },
    'A colour image has 3 **channels** (red, green, blue), and a feature map can have many. Tensors for convolutions have shape (batch, channels, height, width). `nn.Conv2d(in, out, kernel_size=k)` holds `out` kernels, each of shape (in, k, k): every kernel spans all input channels and produces one output channel. So the weight has shape (out, in, k, k), and the layer has out × in × k × k + out parameters (one bias per output channel), whatever the image size.',
    {
      code: `import torch
import torch.nn as nn

conv = nn.Conv2d(1, 6, kernel_size=5, padding=2)
x = torch.zeros(4, 1, 28, 28)
print(conv(x).shape)
print(conv.weight.shape, sum(p.numel() for p in conv.parameters()))`,
      out: `torch.Size([4, 6, 28, 28])
torch.Size([6, 1, 5, 5]) 156`,
    },
    'The batch of 4 is untouched, channels go from 1 to 6, and (28 + 4 − 5) + 1 = 28 keeps the size. Parameters: 6 × 1 × 5 × 5 = 150 weights plus 6 biases.',

    { h: 'Pooling' },
    '**Pooling** shrinks a feature map and has no parameters. `nn.MaxPool2d(2)` cuts each channel into 2 × 2 blocks and keeps the largest value of each, halving height and width. On the 4 × 4 grid with rows (1, 5, 2, 0), (3, 4, 8, 1), (0, 2, 1, 1), (6, 1, 0, 3), the top-left block {1, 5, 3, 4} gives 5, the top-right {2, 0, 8, 1} gives 8, and the bottom two give 6 and 3. The same size formula applies, with the block as the kernel and a stride equal to its size.',

    { h: 'Transfer learning' },
    '**Transfer learning** starts from a network someone else trained on a large dataset, such as ResNet-18 trained on the 1,000 classes of ImageNet. Its early layers already detect edges, textures and parts, which are useful for almost any images. The last layer, the **head**, maps those features to the original classes. You replace it with one sized for your own classes.',
    {
      code: `from torchvision.models import resnet18

model = resnet18(weights='DEFAULT')
for p in model.parameters():
    p.requires_grad = False
model.fc = nn.Linear(model.fc.in_features, 3)
optimizer = torch.optim.Adam(model.fc.parameters(), lr=1e-3)`,
    },
    { sub: 'Freeze, replace, train' },
    "**Freezing** means setting `requires_grad = False` so a parameter is not trained. The rest of the network is the **backbone**. Order matters: freeze first, then replace the head, because a newly created layer is trainable by default. Freeze after replacing and the new head is frozen too; `backward()` then fails because nothing needs a gradient. The new head must accept what the old one accepted: `in_features` (512 for ResNet-18), not `out_features` (the old 1,000 classes). **Adam** is a popular optimiser that adapts the step size for each parameter.",
    {
      code: `import torch.nn as nn

model = nn.Sequential(nn.Linear(6, 4), nn.ReLU(), nn.Linear(4, 3))
for p in model.parameters():
    p.requires_grad = False
model[2] = nn.Linear(4, 2)
print(sum(p.numel() for p in model.parameters() if p.requires_grad))`,
      out: '10',
    },
    'Only the new head trains: 4 × 2 weights and 2 biases. Printing the trainable count after freezing checks that you froze what you meant to.',
    { sub: 'Fine-tuning' },
    'Once the head has settled, you can **fine-tune**: unfreeze some or all of the backbone and keep training with a learning rate 10 to 100 times smaller. Large steps would overwrite good pretrained weights with noise from a small dataset. With very little data, keep the backbone frozen. Feed images normalised the same way as the original training data.',

    { h: 'Mistakes to watch for' },
    {
      list: [
        'Getting the size sum wrong before a linear layer. Work it out, or print a shape.',
        'Building the new head from `out_features`.',
        'Freezing after replacing the head.',
        "Fine-tuning the backbone at the head's learning rate.",
      ],
    },
  ],

  'pytorch-debug': [
    { h: 'Bugs that do not crash' },
    'When a model does not learn, PyTorch usually raises no error. The loss curve is flat, or noisy, or ends too high. The tempting move is to change the learning rate and start another overnight run. Do the opposite: first prove the code is right, with a fixed order of checks that each take minutes. Most broken models fail one of them, and no amount of tuning repairs a bug.',

    { h: 'Know the first loss' },
    "Recall from the modules lesson: an untrained classifier gives every class about the same probability, 1/k for k classes, and cross-entropy then gives −ln(1/k) = ln(k). So you know the first loss before you start: ln(2) ≈ 0.69 for two classes, ln(4) ≈ 1.39 for four, ln(1000) ≈ 6.91 for a thousand. Run one batch through the new model and compare.",
    { sub: 'Far too high at the start' },
    'A first loss several times ln(k) means the model is confidently wrong before it has learned anything. That needs large logits, and large logits usually come from inputs that were not **normalised** (scaled to small values, for example raw pixels of 0 to 255 instead of 0 to 1) or from initial weights that are too large. The learning rate cannot be the cause: no step has been taken yet.',
    { sub: 'Stuck at that value' },
    'A loss that stays at ln(k) epoch after epoch means the model is still guessing evenly: nothing is learned at all. Too high a learning rate makes a loss jump about or explode, not sit flat. Look for wiring: an optimiser that holds the wrong parameters, layers that are frozen or not registered, a learning rate of zero, or labels shuffled apart from their inputs.',

    { h: 'Overfit one batch' },
    'Take one small batch, say 8 examples, and train on it alone for a few hundred steps. Memorising 8 examples is easy for almost any network, so a correct model, loss and loop drive the loss close to zero.',
    {
      code: `import torch
import torch.nn as nn

torch.manual_seed(0)
x, y = torch.randn(8, 5), torch.randint(0, 4, (8,))
model = nn.Sequential(nn.Linear(5, 32), nn.ReLU(), nn.Linear(32, 4))
opt = torch.optim.Adam(model.parameters(), lr=0.01)
for step in range(201):
    opt.zero_grad()
    loss = nn.functional.cross_entropy(model(x), y)
    loss.backward()
    opt.step()
    if step % 100 == 0:
        print(step, round(loss.item(), 3))`,
      out: `0 1.402
100 0.002
200 0.001`,
    },
    'The labels here are random, and the model still memorises them. The first loss, 1.40, is close to ln(4) = 1.39, as expected. If the loss on one batch levels off well above zero, stop: the fault is in the code, not the data. Typical suspects are a softmax before the loss, wrong targets, a detached tensor or a missing step in the loop.',

    { h: 'Shapes and bad values' },
    { sub: 'Print shapes once' },
    'Print the shape and dtype of one input batch, of the model output and of the targets. The silent broadcast from the tensors lesson hides here. A regression model (one that predicts a number) often outputs (batch, 1) while the targets are (batch,). The **mean squared error** loss, `F.mse_loss`, averages (prediction − target)² over the batch. Given those shapes it compares every prediction with every target, and the best the model can do is predict the average target for everyone. PyTorch prints a warning about the target size; read it.',
    { sub: 'nan and inf' },
    "`nan` (not a number) is what you get from 0 ÷ 0 or ∞ − ∞, and `inf` is infinity. One `nan` in a batch makes the loss `nan`, and one `nan` loss turns every weight into `nan` at the next step. Common causes: a learning rate that is too high, the log of 0, a division by 0, or bad values in the data. `torch.isnan(x).any()` finds them. Testing `x == x` also works, because `nan` is not equal to anything, itself included.",
    "A frequent source of log(0) is taking the softmax and then the log by hand. When one logit is far above another, the smaller probability rounds to exactly 0 in `float32`. `torch.log_softmax` computes the same quantity directly, without forming the tiny probability:",
    {
      code: `import torch

logits = torch.tensor([[0.0, 120.0]])
print(torch.log(torch.softmax(logits, dim=1)))
print(torch.log_softmax(logits, dim=1))`,
      out: `tensor([[-inf, 0.]])
tensor([[-120.,    0.]])`,
    },
    'The built-in losses already do this. Prefer them over hand-written versions.',

    { h: 'Gradient norms' },
    "After `backward()`, look at the **norm** (length) of each parameter's `.grad`: `p.grad.norm()`, the square root of the sum of the squares of its entries. It tells you whether the learning signal arrives.",
    {
      list: [
        '**Exactly zero**: the layer gets no signal. A common cause is a **dead ReLU**: if every input to a ReLU is negative, it outputs 0 and passes back a gradient of 0, so the layers before it never change. A layer that is disconnected from the loss shows the same.',
        '**Enormous**: **exploding gradients**. One huge step can throw the weights far away, often followed by `nan`.',
      ],
    },
    { sub: 'Clipping' },
    '**Gradient clipping** limits the damage. `clip_grad_norm_` measures the length of the whole gradient and, if it is above `max_norm`, scales every entry by the same factor so the length equals `max_norm`. The direction is kept. A shorter gradient is left alone. It goes between `backward()` and `step()`.',
    {
      code: `import torch

w = torch.tensor([2.5, 6.0], requires_grad=True)
(w ** 2).sum().backward()
print(w.grad, w.grad.norm().item())
torch.nn.utils.clip_grad_norm_([w], max_norm=2.6)
print(w.grad)`,
      out: `tensor([ 5., 12.]) 13.0
tensor([1.0000, 2.4000])`,
    },
    'The gradient (5, 12) has length √(25 + 144) = 13. Scaling by 2.6 / 13 = 0.2 gives (1.0, 2.4), of length 2.6. Clipping each entry on its own would change the direction. Clipping caps a rare huge gradient; it does not fix a learning rate that is too high everywhere.',

    { h: 'Fix the seeds' },
    'A **seed** is the starting point of the random number generator. `torch.manual_seed(42)` resets it, so the same "random" numbers come out again: the same initial weights, the same shuffling, the same dropout. While debugging, fix it. Otherwise you cannot tell whether a change helped or the run was lucky.',

    { h: 'The order of checks' },
    {
      list: [
        'Look at one batch: shapes, dtypes, range of values, a few inputs beside their labels.',
        'Compare the first loss with ln(k).',
        'Overfit one small batch.',
        'Read the loop: zero_grad, logits into the loss, backward, step, train and eval modes.',
        'Check the optimiser holds the right parameters and their gradient norms are sensible.',
        'Look for `nan` and `inf`.',
        'Only then fix the seed and tune the learning rate or try a simpler baseline.',
      ],
    },
  ],

  'pytorch-speed': [
    { h: 'Getting work onto the GPU' },
    "A GPU does the same arithmetic as a CPU, many times faster, but only on data copied into its own memory. The usual set-up line picks the device: `device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')`.",
    { sub: 'Models move, tensors are copied' },
    "`model.to(device)` moves the model's parameters in place. For a tensor, `.to()` is different: it returns a new tensor and leaves the original where it was. So write `x = x.to(device)`. A bare `x.to(device)` does nothing useful and raises no error until the next line mixes devices. The same is true when `.to()` changes the dtype:",
    {
      code: `import torch

x = torch.tensor([1, 2])
y = x.to(torch.float32)
print(x.dtype, y.dtype)`,
      out: 'torch.int64 torch.float32',
    },
    'Move every batch, inputs and targets alike, inside the loop.',
    { sub: 'Feeding the GPU' },
    "`pin_memory=True` on a `DataLoader` keeps batches in a kind of main memory that can be copied to the GPU faster, and `x.to(device, non_blocking=True)` lets that copy run while other work goes on. Both concern only the copy to the GPU. On a CPU-only machine there is no such copy and pinning only uses memory. Reading and decoding files faster is the job of `num_workers`, not of pinning.",

    { h: 'Memory and batch size' },
    'During training each layer keeps its outputs (its **activations**) for the backward pass, and their size grows in proportion to the batch size. GPU memory is usually what runs out first, with "CUDA out of memory". The first lever is a smaller batch. A smaller batch means more steps per epoch, ⌈examples ÷ batch size⌉ (⌈ ⌉ means round up), and noisier gradients. For 10,000 examples: batches of 64 give ⌈156.25⌉ = 157 steps, batches of 32 give 313.',
    'Other levers, roughly from cheapest to dearest: run validation under `torch.no_grad()` and keep no loss tensors in lists, since stored graphs look like a model that is too big; use gradient accumulation or mixed precision (below); freeze early layers, which then store no activations for backward; feed smaller images or shorter sequences, which changes the task; and last, use a smaller model.',

    { h: 'Gradient accumulation' },
    '**Gradient accumulation** gets the gradient of a large batch from several small ones. Since `backward()` adds to `.grad`, call it on k small batches and take one `step()`. Memory is that of one small batch. Each loss is a mean over its batch, so k of them added would be k times too big: divide each loss by k so the sum becomes an average.',
    {
      code: `import torch
import torch.nn as nn

torch.manual_seed(0)
model, loss_fn = nn.Linear(2, 1), nn.MSELoss()
X, Y = torch.randn(8, 2), torch.randn(8, 1)
loss_fn(model(X), Y).backward()
full = model.weight.grad.clone()
model.zero_grad()
for i in range(0, 8, 2):
    (loss_fn(model(X[i:i + 2]), Y[i:i + 2]) / 4).backward()
print(torch.allclose(full, model.weight.grad))`,
      out: 'True',
    },
    'Four batches of 2, each loss divided by 4, give the same gradient as one batch of 8. `torch.allclose` checks that two tensors are equal up to rounding. In a real loop, step and zero the gradients when `(i + 1) % k == 0`. The cost is fewer updates per epoch. Batch normalisation still sees only the small batch.',

    { h: 'Mixed precision' },
    '`float32` uses 32 bits per number; `float16` uses 16. **Mixed precision** runs most of the forward pass in 16 bits, which roughly halves activation memory and is faster on recent GPUs. The weights themselves stay in 32 bits. The catch is range: very small numbers round to exactly zero in 16 bits.',
    {
      code: `import torch

print(torch.tensor(0.00000001, dtype=torch.float16))
print(torch.tensor(0.00000001 * 65536, dtype=torch.float16))`,
      out: `tensor(0., dtype=torch.float16)
tensor(0.0007, dtype=torch.float16)`,
    },
    'A **GradScaler** therefore multiplies the loss by a large factor before `backward()`, which scales every gradient into a safe range, and divides it out again before the optimiser step. `torch.autocast` turns 16-bit on for the code inside it.',
    {
      code: `scaler = torch.amp.GradScaler()
for x, y in loader:
    x, y = x.to(device), y.to(device)
    optimizer.zero_grad()
    with torch.autocast(device_type='cuda', dtype=torch.float16):
        loss = loss_fn(model(x), y)
    scaler.scale(loss).backward()
    scaler.step(optimizer)
    scaler.update()`,
    },

    { h: 'Checkpoints' },
    'Long runs crash, machines get reclaimed. A **checkpoint** is a file that lets you carry on where you stopped.',
    { sub: 'The state dict' },
    "`model.state_dict()` is a dictionary from each parameter's name to its tensor. It holds numbers only, no code. To load it you first build the same model class in Python, then call `model.load_state_dict(sd)`, which copies the values into that model's existing parameters. The two models then hold equal numbers but stay separate objects.",
    {
      code: `import torch.nn as nn

class Net(nn.Module):
    def __init__(self):
        super().__init__()
        self.body = nn.Linear(3, 2)
        self.head = nn.Linear(2, 1)

for name, t in Net().state_dict().items():
    print(name, tuple(t.shape))`,
      out: `body.weight (2, 3)
body.bias (2,)
head.weight (1, 2)
head.bias (1,)`,
    },
    { sub: 'Saving and resuming' },
    "Save a dictionary holding the model state, the optimiser state and the epoch. The optimiser state matters: SGD with **momentum** (a running average of past gradients) and Adam keep running averages for every weight, built up over thousands of batches, plus the position of any learning-rate schedule. Resume without them and the first steps are badly sized, so the loss jumps up.",
    {
      code: `torch.save({'epoch': epoch, 'model': model.state_dict(),
            'optimizer': optimizer.state_dict()}, 'run.pt')

state = torch.load('run.pt', map_location=device)
model.load_state_dict(state['model'])
optimizer.load_state_dict(state['optimizer'])
start_epoch = state['epoch'] + 1`,
    },
    "Hand each object its own entry: passing the whole dictionary to `model.load_state_dict` fails with missing and unexpected keys. Tensors are saved with the device they were on, and loading tries to put them back there. `map_location` says where they go instead, so a checkpoint saved on a GPU opens on a laptop without one.",

    { h: 'Mistakes to watch for' },
    {
      list: [
        'Writing `x.to(device)` without assigning the result.',
        'Accumulating gradients without dividing each loss by k.',
        'Saving only the model state, then resuming with a fresh optimiser.',
        'Loading without `map_location`.',
        'Expecting `pin_memory` to speed up reading files.',
      ],
    },
  ],

  'pytorch-lab': [
    { h: 'The eight parts of a training script' },
    'Every training script, from a toy to a large model, is built from the same eight parts, in this order. The lab script is a small example of each. When a script misbehaves, go through them in the same order.',
    {
      list: [
        '**Dataset**: one example at a time, with the right dtypes.',
        '**Loaders**: batches, shuffled for training, in order for validation.',
        '**Model**: an `nn.Module` that returns logits.',
        '**Loss**: turns logits and targets into one number.',
        '**Optimiser**: holds the parameters and updates them.',
        '**Loop**: zero_grad, forward, loss, backward, step.',
        '**Evaluation**: eval mode, no gradients, accuracy per example.',
        '**Checkpoint**: state dicts saved when the validation score improves.',
      ],
    },
    'The sections below go through the parts that the lab asks about, with what each one must get right. Some steps ask you to rebuild a part in NumPy, so the NumPy versions are shown too. In NumPy the axis argument is called `axis` and `keepdims` has an s; in PyTorch they are `dim` and `keepdim`.',

    { h: 'Dataset and loaders' },
    { sub: 'Fixing dtypes at the door' },
    '`torch.as_tensor(data, dtype=...)` turns a list or a NumPy array into a tensor of the dtype you name. Doing this once, in the dataset, settles the two dtypes for good: inputs `float32`, class labels `torch.long` (another name for `int64`).',
    {
      code: `import torch

X = torch.as_tensor([[0.5, 2], [1, 1], [3, 0]], dtype=torch.float32)
y = torch.as_tensor([1, 0, 1], dtype=torch.long)
print(X.dtype, y.dtype)`,
      out: 'torch.float32 torch.int64',
    },
    '`CrossEntropyLoss` uses each target as a position in the row of logits, so float labels fail at the loss with "expected scalar type Long but found Float". The error shows up far from its cause. Fixing the dtype where the data comes in is cleaner than converting in the loop.',
    { sub: 'Shuffling inputs and labels together' },
    'In NumPy, an array of positions can index another array: `X[[4, 2]]` picks rows 4 and 2. To shuffle, draw one permutation of the row numbers with `rng.permutation(n)` and use it to index both `X` and `y`, so every row keeps its own label. Then cut it into slices of `batch_size`; the last slice may be shorter.',
    {
      code: `import numpy as np

rng = np.random.default_rng(3)
X = np.array([[10, 11], [20, 21], [30, 31], [40, 41], [50, 51]])
y = np.array([1, 2, 3, 4, 5])
order = rng.permutation(len(X))
print(order)
print(X[order[:2]].tolist(), y[order[:2]].tolist())`,
      out: `[4 2 1 3 0]
[[50, 51], [30, 31]] [5, 3]`,
    },
    'Shuffling `X` and `y` with two separate permutations is a classic bug. Every input then has a random label, and the loss stays at ln(classes) because there is nothing to learn.',

    { h: 'Model and loss' },
    "The lab's model is `nn.Sequential` with two linear layers and a ReLU between them. Check any new model on a dummy batch, such as `torch.zeros(batch, features)`: the output shape should be (batch, classes), and the parameter count should match your sum of `in × out + out` for each linear layer.",
    { sub: 'Cross-entropy by hand' },
    'The loss is the mean over the batch of −ln(probability of the true class). Done literally, with exp, divide and log, it breaks for large logits, because e to the power 800 is too big for a float:',
    {
      code: `import numpy as np

z = np.array([[3.0, 1.0, 0.0], [800.0, 802.0, 0.0]])
with np.errstate(over='ignore'):
    print(np.exp(z[1]))`,
      out: '[inf inf  1.]',
    },
    "The fix uses a fact about softmax: adding the same number to every logit in a row changes nothing, because the common factor cancels in the division. So subtract each row's largest logit first. Every exponent is then 0 or below, and nothing overflows. After that, the log of the softmax, the **log-softmax**, is z − ln(Σ exp(z)), where Σ means the sum over the row.",
    {
      code: `import numpy as np

z = np.array([[3.0, 1.0, 0.0], [800.0, 802.0, 0.0]])
s = z - z.max(axis=1, keepdims=True)
logp = s - np.log(np.exp(s).sum(axis=1, keepdims=True))
targets = np.array([0, 1])
picked = logp[np.arange(2), targets]
print(picked.round(3).tolist(), round(-picked.mean(), 3))`,
      out: '[-0.17, -0.127] 0.148',
    },
    '`keepdims=True` keeps each row maximum as shape (2, 1), so it broadcasts back across its row. `logp[np.arange(2), targets]` picks one entry per row: row 0 at column 0, row 1 at column 1. The loss is minus the mean of those. The same trick is why PyTorch losses take logits: they can do softmax and log together, safely.',

    { h: 'Loop and evaluation' },
    { sub: 'Keep the tensor for backward' },
    "`backward()` needs the loss tensor with its graph. `.item()` turns it into a plain Python float, which has no history and no `backward` method. Call `.item()` only on the copy you log, after `backward()`.",
    { sub: 'Accuracy' },
    'The predicted class is the position of the largest logit in each row, `argmax` along the class axis. No softmax is needed, because softmax never changes which entry is largest. In NumPy the mean of a boolean array is the fraction of `True` values, which is already divided by the number of examples. (PyTorch needs `.float()` first.)',
    {
      code: `import numpy as np

logits = np.array([[0.3, 1.2, -0.5], [2.0, 0.1, 0.4], [0.0, 0.2, 0.9]])
targets = np.array([1, 0, 0])
preds = logits.argmax(axis=1)
print(preds, round((preds == targets).mean(), 3))`,
      out: '[1 0 2] 0.667',
    },

    { h: 'Checkpoint' },
    "The script saves a checkpoint only when validation accuracy beats the best so far, so `best.pt` always holds the best model seen. The model entry must be `model.state_dict()`, the dictionary of names to tensors. `model.parameters()` is a **generator**, a Python object that hands out values one at a time when looped over: it has no names, is meant for the optimiser, and cannot be saved.",

    { h: 'From a working script to a trustworthy one' },
    'A script that runs and prints a good number is not yet one to trust. Before building on it:',
    {
      list: [
        'Run the cheap checks from the debugging lesson: first loss against ln(classes), overfit one batch, print shapes and dtypes.',
        'Compare with a **baseline**, such as always predicting the most common class. 95% accuracy means little if 94% of examples are one class.',
        'Keep a **test set** apart and use it once at the end. Picking the best checkpoint by validation score makes that score a little optimistic.',
        'Log training loss and validation score every epoch, not only at the end.',
        'Load the checkpoint once to prove resuming works, with `map_location`.',
        'Set `num_workers` and `pin_memory` for real data, and fix and record the seeds.',
      ],
    },
  ],
}
