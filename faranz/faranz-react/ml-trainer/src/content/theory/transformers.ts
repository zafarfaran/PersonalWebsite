import type { Block } from '../../types'

/** The full theory for each lesson of the transformers module, keyed by lesson id. */
export const transformersTheory: Record<string, Block[]> = {
  'transformers-tokens': [
    { h: 'Why text has to become integers' },
    'A language model only multiplies and adds numbers. So before it sees any text, a program called a **tokeniser** cuts the text into pieces called **tokens** and replaces each token with a whole number, its **id**. The full list of pieces the tokeniser knows is its **vocabulary**, and every piece in it has one fixed id. The model only ever sees the ids; its answers come out as ids, which the tokeniser turns back into text.',

    { h: 'Choosing the size of the pieces' },
    { sub: 'Characters' },
    'Make every character a token and the vocabulary is tiny, and any text can be written with it. The cost is length: a 600-character paragraph becomes 600 tokens, which is slow and expensive, and the model has to learn every spelling from scratch.',
    { sub: 'Whole words' },
    'Make every word a token and sequences are short, but there are millions of word forms and names, and the vocabulary is fixed once training ends. A word missing from the training text, such as a new brand name, has no id. It becomes one special **unknown** token, the same for every unseen word, so the model cannot tell them apart.',
    { sub: 'Subwords' },
    'Modern tokenisers use **subword** pieces. Frequent words are one token; rarer words are split into familiar pieces, so "unhelpfulness" might become "un", "help", "ful", "ness". At worst the tokeniser falls back to single characters or bytes, so nothing is ever unknown. Vocabularies hold 30,000 to 200,000 pieces. A bigger one means fewer tokens per text, but each entry needs its own row of weights, so the model grows.',

    { h: 'Byte-pair encoding' },
    '**Byte-pair encoding** (BPE) is the usual way to choose the subword pieces. It learns them from a pile of training text with one repeated step:',
    {
      list: [
        'Start with every word split into single characters. (Real tokenisers start with bytes, which works the same way.)',
        'Count every pair of neighbouring tokens across all the words.',
        'Take the most frequent pair, join it into one new token, add that token to the vocabulary and replace the pair everywhere it occurs.',
        'Repeat until the vocabulary reaches the size you chose in advance.',
      ],
    },
    { sub: 'A worked example' },
    'Take the four words "hug", "hug", "pug", "hugs". Split into characters they are 3 + 3 + 3 + 4 = 13 tokens, and the vocabulary is h, u, g, p, s: 5 entries. The neighbouring pairs and their counts are: (u, g) 4 times, (h, u) 3 times, (p, u) once, (g, s) once.',
    'Merge (u, g) into "ug". The vocabulary grows to 6, and the text loses one token at each of the 4 places: 13 − 4 = 9 tokens. Count again: (h, ug) occurs 3 times, so the next merge creates "hug" and the text drops to 6. Each merge joins exactly two existing tokens, so long tokens take several merges. Early merges save the most.',
    { sub: 'Counting pairs in Python' },
    {
      code: `from collections import Counter

tokens = list("mississippi")
pairs = Counter(zip(tokens, tokens[1:]))
print(pairs.most_common(3))
print(len(pairs))`,
      out: `[(('i', 's'), 2), (('s', 's'), 2), (('s', 'i'), 2)]
7`,
    },
    '`tokens[1:]` is the list shifted by one place, so `zip` pairs each token with its right-hand neighbour. `Counter` counts each pair, and `len(pairs)` is the number of different pairs. Shifting by two would pair tokens that are not neighbours, which BPE can never merge.',
    { sub: 'Applying one merge' },
    'Walk the list from left to right. Where the current token and the next form the pair, write out the joined token and step on by two, so the second half is not used again. Otherwise write out the current token and step on by one. With the pair (s, s), the tokens s, s, s become "ss", "s". Build a new list and leave the original alone.',
    'To encode new text, apply the learned merges in the order they were learned. A simpler scheme is greedy matching: repeatedly take the longest vocabulary piece the remaining text starts with. With the pieces "hug", "ug" and single letters, the unseen word "shugs" becomes "s", "hug", "s".',

    { h: 'Tokens are not words' },
    {
      list: [
        'For ordinary English, one token is about 4 characters, or three quarters of a word, so 300 words is roughly 400 tokens. Code, tables, names and most other languages need more.',
        'A leading space is usually part of the token, so " cat" and "cat" have different ids.',
        'Long numbers are cut into chunks that do not line up with units, tens and hundreds.',
        'The model never sees letters. A word arrives as one to three ids, and which letters are inside each id is something it could only have learned indirectly. That is why models miscount letters in a word and slip on long arithmetic.',
      ],
    },
    'Limits and prices are counted in tokens, so count with the real tokeniser:',
    {
      code: `import tiktoken

enc = tiktoken.get_encoding("cl100k_base")
ids = enc.encode("Tokenisers cut text into pieces.")
print(len(ids), ids)`,
    },

    { h: 'Special tokens and padding' },
    '**Special tokens** are ids reserved for structure: start and end of text, padding, and the markers between the turns of a chat. Your code adds them; they never come out of ordinary text. If a user types the written name of one and the tokeniser turns it into the real id, the user can fake the end of their message and the start of one with more authority. Encode user text with special-token parsing switched off, so such a string becomes plain tokens.',
    'Models process several sequences at once in a **batch**, which must all be the same length, so short ones are filled up with a **padding** token. The padding id still selects an ordinary vector inside the model, even if the id is 0. So padding comes with a **mask**: 1 for real positions, 0 for padding, telling the model not to look at the padding and not to be trained to predict it.',

    { h: 'A tokeniser belongs to its model' },
    'The ids only mean something to the weights that were trained with them. Id 7,000 might be " river" for one tokeniser and "ing" for another. Pair a model with the wrong tokeniser of the same size and every id is still in range, so nothing crashes, but the model reads different text from what you sent and replies with nonsense. Save and load the tokeniser together with the model.',
  ],

  'transformers-embeddings': [
    { h: 'From ids to vectors' },
    'An id is a label, not an amount: token 500 is not "more" than token 499, any more than locker 500 holds more than locker 499. Doing arithmetic on raw ids would invent a meaning that is not there.',
    'So the first layer of a transformer is a table called the **embedding matrix**. It has one row for every entry in the vocabulary, and each row is a **vector** (a list of numbers) of the same length. That length is called `d_model`, the width of the model. An id selects its row, and from then on the model works with that vector, called the token\'s **embedding**.',

    { h: 'The lookup' },
    { sub: 'Shapes' },
    'Text arrives in batches. The ids form a grid of shape `(batch, T)`: `batch` sequences, each `T` tokens long. The lookup replaces every id with its row of `d_model` numbers, which adds a new axis at the end: `(batch, T, d_model)`. The vocabulary size does not appear in the result.',
    {
      code: `import torch
import torch.nn as nn

torch.manual_seed(0)
emb = nn.Embedding(6, 3)            # 6 tokens in the vocabulary, 3 numbers each
ids = torch.tensor([[4, 1], [1, 1], [0, 5]])
out = emb(ids)
print(out.shape)
print(torch.equal(out[0, 1], out[1, 0]))`,
      out: `torch.Size([3, 2, 3])
True`,
    },
    '`nn.Embedding(6, 3)` is PyTorch\'s table: 6 rows of 3 numbers. Three sequences of two ids become a `(3, 2, 3)` result. The last line checks that id 1 gets the same vector wherever it appears.',
    { sub: 'Lookup and one-hot are the same thing' },
    'A **one-hot** vector is all zeros except for a single 1. Multiplying a one-hot vector by a matrix picks out one row, the row where the 1 sits. So the lookup is mathematically a one-hot product, but indexing skips the thousands of multiplications by zero.',
    {
      code: `import numpy as np

E = np.arange(8).reshape(4, 2)      # 4 tokens, 2 numbers each
print(E[[3, 1, 3]])
print(np.array([0, 0, 0, 1]) @ E)`,
      out: `[[6 7]
 [2 3]
 [6 7]]
[6 7]`,
    },
    'Indexing a NumPy array with a list of ids stacks those rows in order, repeats included. `@` is matrix multiplication, and the one-hot vector for id 3 gives row 3.',
    { sub: 'Size of the table' },
    'The table holds vocabulary × `d_model` numbers. With 40,000 tokens and width 256 that is 40,000 × 256 = 10,240,000 weights. In a small model this can be a large share of all the weights. The rows are ordinary weights: they start random and are learned with everything else. At the other end of the model, the layer that turns the final vectors back into one score per vocabulary token has the same shape, and many models reuse the embedding matrix for it. This is called **tied weights**.',

    { h: 'What the rows learn' },
    'Training pushes tokens used in similar contexts towards similar rows. You can inspect this with **cosine similarity** from the maths module: the dot product divided by both lengths, 1 for the same direction, 0 at right angles, −1 opposite. Neighbours of " Paris" tend to be other cities.',
    'The table has one input, the id. So it is **context-free**: " bat" gets the same row in "a cricket bat" and in "a bat flew out of the cave". One row has to serve every sense of the word. Telling the senses apart is the job of the attention layers above, which mix in the neighbouring tokens.',

    { h: 'Why position has to be added' },
    'Attention, the next lesson, treats its input as a set. Each token takes a weighted average over all the tokens, with weights that depend only on what the vectors contain. Shuffle the input and every token gets exactly the same output vector as before, in the shuffled order. Without extra information, "the cat chased the dog" and "the dog chased the cat" contain the same set of tokens, so the model cannot tell who chased whom. Position must be put into the vectors.',

    { h: 'Two ways to encode position' },
    { sub: 'Learned positions' },
    'Make a second table with one row per position: row 0 for the first token, row 1 for the second, and so on. Look up the row for each position and add it to the token embedding. The table is indexed by 0, 1, 2, … up to T − 1, never by the token ids; indexing it by ids would add a second token vector and say nothing about place.',
    {
      code: `x = tok_emb(ids) + pos_emb(torch.arange(T))   # (batch, T, d) + (T, d)`,
    },
    '`torch.arange(T)` is the list 0, 1, …, T − 1. The weakness is the fixed size. A table built with 1,024 rows has no row 1,024, so a longer input either raises an index error or, if the library was told to truncate, is cut off silently. Check the token length of your documents before choosing a model.',
    { sub: 'Sinusoidal positions' },
    'The original transformer used a formula in place of a table. The columns go in pairs. For column pair number k (columns 2k and 2k + 1), compute an angle, then put its sine in the even column and its cosine in the odd one:',
    { code: `angle = pos / 10000 ** (2k / d)
PE[pos, 2k]     = sin(angle)
PE[pos, 2k + 1] = cos(angle)` },
    'Here `pos` is the position, `d` is `d_model`, and the double star means "to the power of". Worked example with d = 4 and pos = 2. Pair 0: angle = 2 / 10000⁰ = 2, so the columns are sin 2 ≈ 0.909 and cos 2 ≈ −0.416. Pair 1: angle = 2 / 10000^(2/4) = 2 / 100 = 0.02, giving sin 0.02 ≈ 0.020 and cos 0.02 ≈ 1.000. At pos = 0 every angle is 0, so the vector is 0, 1, 0, 1.',
    'Each pair is a clock hand. The first turns fast and tells neighbours apart; later ones turn slower and separate positions far apart. Every position gets its own pattern, with no weights and no last row, though models still tend to do badly on lengths never seen in training. The result is added to the token embedding, not used in its place.',
    { sub: 'Rotary positions' },
    'Many recent models instead rotate the vectors inside attention by an amount that depends on position, so that what matters is how far apart two tokens are. Whatever the scheme, the rule holds: no position signal, no word order.',

    { h: 'Mistakes to watch for' },
    {
      list: [
        'Indexing the position table with token ids in place of 0 to T − 1.',
        'Expecting different embeddings for different senses of a word. The input table is context-free.',
        'Feeding more tokens than a learned position table has rows.',
        'Forgetting that the embedding table counts towards the model size.',
      ],
    },
  ],

  'transformers-attention': [
    { h: 'What attention is for' },
    'After the embedding layer every token has a vector that knows nothing about its neighbours. In "the trophy did not fit in the case because it was too big", " it" needs to pull in information from " trophy".',
    '**Attention** does this. Each token builds a new vector as a **weighted average** of vectors from the sequence: each token gets a weight between 0 and 1, the weights add up to 1, and tokens that matter more get bigger weights. The weights are computed from the content of the vectors, afresh for every sentence.',

    { h: 'Queries, keys and values' },
    'Each token vector is multiplied by three learned matrices, giving three new vectors:',
    {
      list: [
        'The **query** describes what this token is looking for.',
        'The **key** describes what this token has to offer, so that others can find it.',
        'The **value** is what this token hands over when it is chosen.',
      ],
    },
    "Think of a library: the query is your search, each book's key is its catalogue entry, the value is its contents. The match between query and key decides how much of each book you read; the contents play no part in that decision.",
    'The match is the **dot product** (from the maths module: multiply matching entries and add them up) of the query of token i with the key of token j. It is large when the two vectors point the same way. Two tokens with identical keys get the same score from any query, even if their values differ, so they get the same weight while handing over different things.',

    { h: 'Scaled dot-product attention' },
    { sub: 'Step 1: all scores at once' },
    'Stack the queries of all T tokens as the rows of a matrix Q of shape `(T, d_k)`, where `d_k` is the length of one query or key, and the keys likewise as K. Then `Q @ K.T` (K turned on its side) is a `(T, T)` table: row i holds query i against every key. 1,000 tokens give a million scores.',
    { sub: 'Step 2: scale' },
    'Divide every score by `√d_k`, the square root of the key length. A dot product adds up `d_k` products, so longer vectors give more spread-out scores. Large scores make the next step put almost all the weight on one token, where the **gradient** (the signal training uses to adjust weights) is close to zero and learning stalls. The division keeps scores at a similar size whatever the width.',
    { sub: 'Step 3: softmax along each row' },
    'The **softmax** (from the maths module) turns a row of scores into weights: raise e to the power of each score, then divide by the row total. It runs along the last axis, so each row, one query, adds up to 1. Running it down the columns would make each key share its weight among the queries, which is not attention. Code first subtracts the largest score of the row so that e to a big number does not overflow; the result is unchanged.',
    'The size of the scores sets how spread out the weights are. Scores 2, 1, 0, 0 give weights 0.61, 0.22, 0.08, 0.08. Times 10, the first token takes almost everything. Times 0, all scores are equal and the weights are uniform: 1/4 each, a plain average.',
    { sub: 'Step 4: mix the values' },
    'Stack the values as V, shape `(T, d_v)`. Then `weights @ V` has shape `(T, d_v)`: each token gets its weighted mix of the value vectors.',

    { h: 'A worked example' },
    'Three tokens. After scaling, the query of the second token scores 2, 0 and 0 against the three keys. e² ≈ 7.39 and e⁰ = 1, so the total is 9.39 and the weights are 7.39 / 9.39 ≈ 0.787, then 0.107 and 0.107. The values are (1, 0), (0, 1) and (1, 1). The output is 0.787 × (1, 0) + 0.107 × (0, 1) + 0.107 × (1, 1) = (0.894, 0.214).',

    { h: 'The causal mask' },
    'A language model is trained to predict the next token. If position i could see position i + 1, it would read the answer: the training loss would fall to almost zero and the model would be useless at generating, where the future does not exist yet. So position i may only attend to positions 0 to i: the **lower triangle** of the score table.',
    'The **causal mask** sets the forbidden scores to −∞ (minus infinity) before the softmax. Since e^−∞ = 0, they get a weight of exactly 0 and add nothing to the total. The remaining tokens keep their scores, but are divided by a smaller total, so their weights rise to fill the gap. In the example above, masking the third token leaves 7.39 / 8.39 ≈ 0.881 and 0.119.',
    'Two wrong ways are common. Setting forbidden scores to 0 does nothing useful: e⁰ = 1, so they still get a share. Zeroing weights after the softmax leaves rows that no longer add to 1.',
    {
      code: `import numpy as np

Q = np.array([[1.0, 0.0], [2.0, 2.0], [0.0, 1.0]])
K = np.array([[1.0, 1.0], [2.0, 0.0], [0.0, 2.0]])
scores = Q @ K.T / np.sqrt(K.shape[-1])
scores = np.where(np.tril(np.ones((3, 3), dtype=bool)), scores, -np.inf)
w = np.exp(scores - scores.max(axis=-1, keepdims=True))
w = w / w.sum(axis=-1, keepdims=True)
print(np.round(w, 2))`,
      out: `[[1.   0.   0.  ]
 [0.5  0.5  0.  ]
 [0.28 0.14 0.58]]`,
    },
    '`np.tril` keeps the lower triangle of a matrix of `True` values. `np.where` keeps a score where the mask is `True` and puts −∞ elsewhere. `axis=-1` means along each row, and `keepdims=True` lets the division line up row by row. The first token can only see itself.',

    { h: 'Multi-head attention' },
    'One softmax gives each token one set of weights, one way of reading the sentence. **Multi-head attention** runs several attentions side by side, each with its own matrices. The heads split the width: with `d_model` = 512 and 8 heads, each head uses vectors of 512 ÷ 8 = 64 numbers, and the 8 outputs are joined back into 512. Cost and weights stay about the same as one wide head, but each head can follow a different relation: the previous token, the matching bracket, the subject of the verb.',

    { h: 'Mistakes to watch for' },
    {
      list: [
        'Taking the softmax over the wrong axis. Each row must add up to 1.',
        'Masking with 0, or after the softmax. Use −∞, before.',
        'Leaving out the division by √d_k.',
        'Thinking the values decide the weights. Only queries and keys do.',
      ],
    },
  ],

  'transformers-block': [
    { h: 'One block, repeated' },
    'A transformer is one unit, the **block**, stacked many times. Each block takes a grid of vectors of shape `(batch, T, d)`, one vector of width d for every token, and returns a grid of the same shape. Because shape in equals shape out, you can stack as many as you like. A block has two parts, each wrapped the same way.',
    {
      code: `def block(x):                      # x: (batch, T, d)
    x = x + attn(norm1(x))         # tokens exchange information
    x = x + mlp(norm2(x))          # each token is worked on alone
    return x`,
    },

    { h: 'The two parts' },
    { sub: 'Attention gathers' },
    'Attention, from the last lesson, is the only place where one position can use information from another. Remove it and every token would be processed on its own, so the prediction after a token could depend on that token alone.',
    { sub: 'The MLP computes' },
    'The **MLP** (multi-layer perceptron, the small neural network from the neural module) is applied to every position separately, with the same weights. It is a **linear layer** that widens the vector, usually to 4 × d, a non-linear function such as **GELU** (a smooth relative of ReLU that bends the numbers so the network can learn curved relations), and a second linear layer back down to d.',
    'Recall that a linear layer from n numbers to m numbers has n × m weights plus m biases. For d = 64, widened to 256: up is 64 × 256 + 256 = 16,640, down is 256 × 64 + 64 = 16,448, so 33,088 in total, roughly 8d². The four matrices of attention (query, key, value and output) come to about 4d². So the MLP holds about two thirds of a block\'s weights.',

    { h: 'Residual connections' },
    'Each part adds its result to its input: `x = x + f(x)`. This is a **residual connection**. Picture the vectors as a stream running from the embedding layer to the output. Each part reads the stream and writes a correction into it; nothing is thrown away.',
    'The real reason is training. Training sends a gradient backwards through every layer, and each layer multiplies it by something. Through 24 layers, those factors can shrink it to almost nothing. The gradient of `x + f(x)` with respect to x is 1 plus the gradient through f. The 1 survives however deep the stack is, so early layers keep receiving a signal. A residual connection adds no weights. Drop the `x +` from either part and the output of that part replaces the stream, and deep stacks train badly.',

    { h: 'Layer normalisation' },
    'As each part adds to the stream, the numbers can grow. **Layer normalisation** rescales each token vector on its own: subtract the mean of its d numbers, then divide by their **standard deviation** (a measure of how spread out the numbers are around their mean). The result has mean 0 and standard deviation 1, and a learned scale and shift are applied afterwards.',
    'Take one token vector (2, 4, 6). Its mean is 4. The differences are −2, 0, 2; their squares average to 8/3, and the square root of that is about 1.63. So the normalised vector is about (−1.22, 0, 1.22). The vector (20, 40, 60) gives exactly the same result, because the factor of ten cancels.',
    {
      code: `import numpy as np

x = np.array([[2.0, 4.0, 6.0], [20.0, 40.0, 60.0]])
y = (x - x.mean(axis=-1, keepdims=True)) / x.std(axis=-1, keepdims=True)
print(np.round(y, 2))`,
      out: `[[-1.22  0.    1.22]
 [-1.22  0.    1.22]]`,
    },
    'The statistics run along the last axis, the features of one token. Taking them along the sequence axis would make one token\'s output depend on later tokens, a leak around the causal mask. Layer norm uses nothing from the batch either, so it behaves the same in training and in generation. Modern models normalise before each part, as in the block above (called **pre-norm**), and once more after the last block.',

    { h: 'From ids to logits' },
    {
      list: [
        'Ids, shape `(batch, T)`.',
        'Token embedding plus position: `(batch, T, d)`.',
        'N blocks, shape unchanged.',
        'A final norm, then a linear layer from d to the vocabulary size: `(batch, T, vocab)`.',
      ],
    },
    'Those last numbers are **logits**: one raw score per vocabulary token, at every position. Each position predicts its own next token. A softmax turns the scores at a position into probabilities. In training every position is used; when generating, only the last one. The size settings are depth N, width d and the number of heads. GPT-2 small has 12 blocks, width 768, 12 heads and about 124 million weights.',

    { h: 'Three families' },
    { sub: 'Encoder-only' },
    'No causal mask: every token sees both sides. Trained to fill in hidden tokens (BERT is the classic one). It gives one context-aware vector per token, which suits classification, tagging and embeddings for search. It never learned to predict the next token from the left alone, so it is a poor generator. For sorting large volumes of text into a few labels you have examples for, a small fine-tuned encoder is usually fast, cheap and accurate.',
    { sub: 'Decoder-only' },
    'Causal mask, trained to predict the next token, and it generates text. GPT and nearly all current chat models are built this way.',
    { sub: 'Encoder-decoder' },
    'An encoder reads the input; a decoder generates the output. Each decoder block has causal self-attention over what it has written so far and **cross-attention**, whose queries come from the decoder and whose keys and values come from the encoder output. Built for translation and summarising (T5, the original transformer).',
  ],

  'transformers-training': [
    { h: 'Pretraining on next-token prediction' },
    'A language model starts with random weights. **Pretraining** teaches it one task on an enormous amount of text: given the tokens so far, predict the next one. The text supplies its own answers, so nothing needs labelling.',
    { sub: 'Inputs and targets' },
    'Take a sequence of ids. The **inputs** are all of it except the last token; the **targets** are all of it except the first. That shifts the targets one place to the left, so the target at each position is the token that follows it.',
    {
      code: `ids = [3, 8, 1, 4, 6]
inputs, targets = ids[:-1], ids[1:]
for i in range(len(inputs)):
    print(inputs[: i + 1], "->", targets[i])`,
      out: `[3] -> 8
[3, 8] -> 1
[3, 8, 1] -> 4
[3, 8, 1, 4] -> 6`,
    },
    'Thanks to the causal mask, position t sees only tokens 0 to t, so one forward pass makes all four predictions: T tokens give T − 1 training examples. Forget the shift and use the inputs as targets, and the model is asked for the token it can already see. Copying is easy, the loss collapses towards zero, and nothing about the next token is learned.',

    { h: 'The loss and perplexity' },
    { sub: 'Cross-entropy' },
    'At each position the model gives a probability to every token in the vocabulary. The **cross-entropy loss** looks only at the probability p it gave to the correct next token and takes −ln p (ln is the natural logarithm, the log to base e). If the model gave the right token 0.25, the loss there is −ln 0.25 ≈ 1.386. Certainty in the right answer (p = 1) gives a loss of 0, and the loss grows without limit as p falls towards 0. The training loss is the average over every position in the batch.',
    { sub: 'Perplexity' },
    '**Perplexity** is e raised to the loss, written `exp(loss)`. It turns the loss into a count: the number of equally likely tokens the model is in effect choosing between at each step. A loss of 1.386 gives perplexity e^1.386 = 4, as unsure as picking among four tokens. A loss of 1.5 gives about 4.48.',
    'A check for a new training run: an untrained model spreads its probability evenly, so p = 1/vocab and the loss is ln(vocab). For a vocabulary of 1,000 that is about 6.91, perplexity 1,000. A first loss far above that suggests a bad start; far below suggests a leak, such as unshifted targets.',
    'Perplexity is per token. A tokeniser with bigger pieces makes fewer, harder predictions for the same text, so models with different tokenisers, or tested on different text, cannot be compared by perplexity. Compare loss per character or word, or results on the real task.',

    { h: 'Fine-tuning' },
    'Pretraining transfers to other tasks because predicting text well needs grammar, facts, style and the structure of arguments and programs. **Fine-tuning** continues training from the pretrained weights on a small set of examples of your task, with a low learning rate (small steps, so the existing knowledge is not wrecked).',
    '**Full fine-tuning** updates every weight: the most flexible and most costly option, needing gradient memory for the whole model, a full copy per task, and risking overfitting or lost general ability.',

    { h: 'LoRA' },
    '**LoRA** (low-rank adaptation) freezes a pretrained weight matrix W of shape `(d_out, d_in)` and learns a small correction beside it. The correction is the product of two thin matrices: A of shape `(r, d_in)` and B of shape `(d_out, r)`, where the **rank** r is small, such as 4 or 8. The layer computes `W @ x + B @ (A @ x)`. Read the shapes right to left: A squeezes the d_in input numbers down to r, then B expands them to d_out. In the other order the shapes do not fit.',
    { sub: 'Counting the weights' },
    'A has r × d_in weights and B has d_out × r, so the adapter trains r × (d_in + d_out). The full matrix has d_out × d_in. For a 2048 × 512 matrix with r = 4: 4 × (512 + 2048) = 10,240 trainable weights against 1,048,576, under 1%. The adapter grows with the sum of the sides; the matrix grows with their product.',
    { sub: 'Low rank' },
    'B @ A has the full shape of W, but its **rank** (the number of truly independent rows) is at most r: every row is a mix of the r rows of A. LoRA bets that the change a task needs is simple in this sense, and in practice a small r often works.',
    {
      code: `import numpy as np

rng = np.random.default_rng(1)
B = rng.normal(size=(5, 1))
A = rng.normal(size=(1, 5))
delta = B @ A
print(delta.shape, np.linalg.matrix_rank(delta))`,
      out: '(5, 5) 1',
    },
    { sub: 'Starting at zero' },
    'A starts with small random values and B starts at zero. Then B @ A is zero, so the first forward pass is exactly the pretrained model, and training moves away only as far as the data asks. B still learns, because its gradient depends on A, which is not zero. After training, B @ A can be added into W, so the tuned model runs at the original speed. **Adapters** are an older variant: small extra layers inserted into each block and trained while the rest is frozen. They stay in the forward pass.',

    { h: 'Overfitting and the held-out set' },
    'Keep back a **held-out** set the model never trains on, and measure its loss after each **epoch** (one pass through the training data). On a small dataset the training loss keeps falling while the held-out loss falls, levels off, then climbs: the model is memorising. Keep the **checkpoint** (saved weights) where held-out loss was lowest, not the last one, and look for more data or a smaller rank.',

    { h: 'When to fine-tune' },
    'These are rules of thumb. First try a better prompt with a few examples, and measure it as your baseline. If the model lacks knowledge, especially knowledge that changes, put the relevant text in the prompt at request time: fine-tuning stores facts slowly and unreliably, and facts go out of date. Fine-tune for behaviour: a consistent style or format, a narrow labelled task, or a small tuned model replacing a large prompted one.',
    "A sound plan: fix a test set and a way to judge outputs; clean the data, because the model copies whatever is there; use the base model's own chat template; start with LoRA at a small rank; watch the held-out loss; then check that general ability and safety have not got worse.",
  ],

  'transformers-sampling': [
    { h: 'From scores to a token' },
    'A model does not write text directly. For the next position it outputs one raw score, a **logit**, for every token in the vocabulary. The **softmax** (raise e to each logit, divide by the total) turns them into probabilities that add up to 1. **Decoding** is the loop around the model: get the probabilities, choose one token, append it to the input, run the model again. The rule you use to choose changes the text as much as the model does.',
    'The running example: three tokens with logits 3, 2 and 0. The softmax gives about 0.71, 0.26 and 0.04.',

    { h: 'Greedy decoding and sampling' },
    '**Greedy** decoding always takes the most probable token, the **argmax**. Here it would pick the first token every time. It is repeatable in principle and suits short answers with one right reply, such as extracting a number into JSON. Over long text it is flat and prone to loops: once a phrase has appeared, repeating it is often the most probable continuation.',
    '**Sampling** draws the token at random according to the probabilities: the first token 71% of the time, the second 26%, the third 4%. The text varies, but now unlikely tokens can be picked.',

    { h: 'Temperature' },
    '**Temperature**, written T, divides every logit by T before the softmax. Dividing by a number below 1 widens the gaps between logits, so the favourite gains. Dividing by a number above 1 narrows them, so the unlikely tokens gain. At T = 1 you sample the distribution the model learned. The order of the tokens never changes, only how far the favourite leads.',
    {
      code: `import numpy as np

def softmax(z):
    e = np.exp(z - z.max())
    return e / e.sum()

logits = np.array([3.0, 2.0, 0.0])
for T in [1.0, 0.5, 2.0]:
    print(T, np.round(softmax(logits / T), 2).tolist())`,
      out: `1.0 [0.71, 0.26, 0.04]
0.5 [0.88, 0.12, 0.0]
2.0 [0.55, 0.33, 0.12]`,
    },
    'At T = 0.5 the logits become 6, 4 and 0, and the favourite rises to 0.88. At T = 2 they become 1.5, 1 and 0. Subtracting the largest value before `np.exp` stops very large logits from overflowing and does not change the result. Multiplying by T instead of dividing is a common bug: it does the opposite of what you intend.',
    'T = 0 would mean dividing by zero, so libraries define it as greedy: all the probability on the largest logit. Greedy is the limit as T shrinks towards 0, but the formula itself cannot be computed there, so code needs a separate branch for it.',

    { h: 'Cutting off the tail' },
    'A vocabulary has tens of thousands of unlikely tokens. Each is rare, but together they hold real probability, and rare per step is not rare per text. If the tail holds 5% at each step, a 200-token reply draws about 10 tail tokens on average, and every sampled token becomes input for the next step, so one odd choice can send the rest off course. A higher temperature makes this worse, which is why it is paired with a cut.',
    { sub: 'Top-k' },
    '**Top-k** keeps the k most likely tokens and sets the rest to 0. With probabilities 0.05, 0.5, 0.1, 0.3, 0.05 and k = 2, only 0.5 and 0.3 survive. Watch out in NumPy: `np.argsort(p)` returns positions sorted from the smallest probability to the largest, here `[0 4 2 3 1]`. The k most likely are the last k, `np.argsort(p)[-k:]`, not the first k.',
    { sub: 'Top-p' },
    '**Top-p**, also called nucleus sampling, keeps the shortest list of most likely tokens whose probabilities add up to at least p. Sort from most to least likely and keep a running total. With the same probabilities and p = 0.85: 0.5, then 0.8 (not enough), then 0.9. The third token is the one that crosses the line, so it is kept too and three tokens survive. At least one token always survives.',
    'Top-p adapts to the model\'s confidence. When one token holds most of the probability, it survives almost alone. When many tokens are about equally likely, many survive. Top-k keeps the same number in both cases: junk when the model is sure, too few when it is not.',
    { sub: 'Renormalising' },
    'After any cut the survivors no longer add up to 1, so divide each by their total. The top-p survivors 0.5, 0.3 and 0.1 total 0.9 and become about 0.56, 0.33 and 0.11, each staying in its original position in the list. The usual order of operations is: temperature, softmax, top-k, top-p, renormalise, draw.',

    { h: 'Repetition penalties' },
    'A **repetition penalty** lowers the logits of tokens that have already appeared, which helps prose that keeps saying the same thing. It hurts wherever repetition is correct: variable names and brackets in code, digits in an invoice number, a person\'s name in a story. For loops in code, try a little sampling or a stop condition before a heavy penalty.',

    { h: 'Why temperature 0 still varies' },
    'Greedy decoding is only as repeatable as the logits, and they vary in the last decimal places between runs: a GPU adds numbers in a different order, your request is batched with others, the hardware differs, or the model behind a name is quietly updated. When the top two tokens are nearly tied, that tiny difference flips the choice, and every later token follows a different path. So do not write tests that demand an exact string; check parsed fields or meaning, pin the model version, and cache replies you need twice.',
    'As a rule of thumb, use temperature 0 or close to it for extraction, classification and code, and 0.7 to 1 with top-p for writing that should vary.',
  ],

  'transformers-context': [
    { h: 'The context window' },
    'The **context window** is the largest number of tokens a model can work over in one request. The prompt and the reply share it. With a 4,000-token window and a 3,500-token prompt, at most 500 tokens are left for the answer, whatever maximum you asked for. Depending on the service, the request is then rejected or the answer stops mid-sentence. So any code that trims a prompt must subtract the room for the answer first: budget = window − system prompt − maximum output, and only then fit the rest of the text into what is left.',

    { h: 'Why long inputs cost more than you expect' },
    'Attention compares every token with every other, so it makes T × T scores, for each head in each layer. The cost grows with the square of the length: three times the tokens means 3² = 9 times the scores, and ten times the tokens means 100 times. The MLPs grow only in proportion to T, so on long inputs attention comes to dominate. This is why windows were small for years, and why long prompts are slow and costly even when they fit.',

    { h: 'The KV cache' },
    { sub: 'The problem' },
    'A model writes one token at a time, and each new token needs another pass through the model. Done naively, every pass recomputes the whole sequence so far, so the work for each new token grows with T².',
    { sub: 'The fix' },
    'Under the causal mask, an earlier token never attends to a later one, in any layer. So when a token is appended, nothing computed for the earlier tokens changes, including their keys and values. The **KV cache** stores those keys and values. The new token computes only its own query, key and value and attends over the stored ones: work in proportion to T for each new token. This is exact, not an approximation. It would not work in an encoder without a causal mask, where every vector changes when a token is added. The price is memory that grows with the length of the text.',
    {
      code: `prompt, new = 100, 3
# no cache: each new token recomputes the whole sequence so far
without = sum((prompt + i) ** 2 for i in range(1, new + 1))
# cache: only the newest token attends, over everything so far
with_cache = sum(prompt + i for i in range(1, new + 1))
print(without, with_cache)`,
      out: '31214 306',
    },
    'For three new tokens after a 100-token prompt, the uncached loop computes 101² + 102² + 103² attention scores; the cached one computes 101 + 102 + 103.',
    { sub: 'Prompt caching' },
    'Hosted services apply the same idea across requests. If a request starts with exactly the same tokens as an earlier one, the work for that shared beginning (the **prefix**) can be reused, which is cheaper and faster. The match must be exact from the very first token. So put stable text first (instructions, a long reference document) and whatever changes (the user\'s question) last. A timestamp or user name at the top of the prompt makes every request different from the first token and defeats the cache.',

    { h: 'Latency and cost' },
    { code: `latency ≈ time to first token + output tokens ÷ tokens per second
cost    ≈ input tokens × input price + output tokens × output price` },
    'Input tokens are processed together in one pass. Output tokens come one at a time, each needing its own pass. That gives two separate waits:',
    {
      list: [
        '**Time to first token**: reading the whole prompt (plus any queueing). It grows with the length of the prompt.',
        '**Tokens per second**: the steady rate at which the reply is written after that.',
      ],
    },
    'Worked example: 0.8 seconds to the first token, then 40 tokens per second, for a 200-token answer: 0.8 + 200 ÷ 40 = 5.8 seconds. Most of the time is the output, so asking for a shorter answer helps far more than trimming the prompt. If instead users wait several seconds before anything appears and then the text flows quickly, look at the prompt length first.',
    '**Streaming** shows tokens as they are produced. The total time is about the same, but the first words appear after the time to first token, so people can start reading. It does nothing for a program that needs the whole reply before it can continue.',
    'Providers charge more for an output token than for an input one, often several times more, and quote prices per million tokens. With input at $0.50 and output at $2.00 per million, 8,000 input tokens cost 8,000 × 0.5 ÷ 1,000,000 = $0.004 and 500 output tokens cost $0.001. Output is dearer per token, but here the prompt is where the money goes. Work out which side dominates before you optimise.',

    { h: 'When the text does not fit' },
    'First count the tokens with the model\'s own tokeniser: legal text, tables and numbers take more tokens than the word-count rule suggests. Reserve room for the answer and instructions. Then:',
    {
      list: [
        '**Cut**: keep the system prompt and the most recent turns of a conversation, and drop the oldest.',
        '**Select**: split long documents into sections and send only those relevant to the question.',
        '**Condense**: summarise older material, or summarise each section and then work from the summaries. This handles questions about the whole document, which selection cannot.',
      ],
    },
    { sub: 'Trimming a chat history' },
    'Keep messages whole and keep the kept ones consecutive. Walk backwards from the newest message, adding up token counts, and stop at the first message that would break the budget. Do not skip a long message to fit an older one in, because that leaves a hole in the conversation. With messages of 120, 300, 80 and 150 tokens and a budget of 400: 150 fits, 150 + 80 = 230 fits, 230 + 300 is too much, so stop and keep the last two. A message that lands exactly on the budget still fits.',
    { sub: 'A larger window is the last option' },
    'A bigger window costs more, is slower to the first token, and every question pays for every token sent. Models also tend to use material in the middle of a very long context less reliably than material near the start and the end, so put the question and key instructions at the end. Test with questions whose answers sit in different parts of the text, to find out whether your cutting loses something before users do.',
  ],

  'transformers-lab': [
    { h: 'What you are building' },
    'This lab builds the complete path of a tiny language model in NumPy: a string goes in, next-token probabilities come out, and a loop writes text with them. The weights are random, so the text will be noise. The aim is the plumbing: every step between a string and a sampled token, and the shape of the data at each one. Training adds backpropagation and an optimiser on top of the same forward pass, which the PyTorch module covers.',
    'The parts, with T the number of tokens, d the vector width and vocab the vocabulary size:',
    {
      list: [
        'A character tokeniser: text to a list of T ids.',
        'Token and position embeddings: shape `(T, d)`.',
        'One causal attention head, added back with a residual connection: still `(T, d)`.',
        'An output layer that reuses the token embedding matrix: logits of shape `(T, vocab)`.',
        'A next-token loss, and a sampler that picks the next id.',
      ],
    },
    'Two things cause almost every bug in code like this: the shape of an array, and the axis an operation runs along. Check both at every step.',

    { h: 'A character tokeniser' },
    'The vocabulary is the distinct characters of a text, sorted, so the ids come out the same on every run. That matters because the rows of the embedding table are tied to these ids. Encoding uses a dictionary from character to position; decoding indexes the list and joins the characters.',
    {
      code: `text = "banana"
vocab = sorted(set(text))
to_id = {ch: i for i, ch in enumerate(vocab)}
print(vocab, to_id)
print("".join(vocab[i] for i in [1, 0, 2]))`,
      out: `['a', 'b', 'n'] {'a': 0, 'b': 1, 'n': 2}
ban`,
    },
    '`set` removes repeats, `sorted` gives a list in a fixed order, and `enumerate` pairs each character with its position. Encoding and decoding must undo each other: decode(encode(s)) gives s back.',

    { h: 'Embeddings, mask and attention' },
    { sub: 'The input layer' },
    'Indexing a NumPy array with a list of ids stacks the chosen rows, giving `(T, d)`. Add the first T rows of the position table, `pos_emb[:T]`, so that the same character at two positions gets two different vectors. Index the position table by position, never by id.',
    { sub: 'The causal mask' },
    '`np.tril(np.ones((T, T), dtype=bool))` is True on and below the diagonal. Row i is the token that looks and column j the token looked at, so token i may see columns 0 to i. For T tokens there are 1 + 2 + … + T allowed pairs; for T = 3 that is 6. A mask the wrong way round raises no error: the model sees only the future.',
    { sub: 'One head' },
    'Multiply x by three `(d, d)` weight matrices to get Q, K and V, then follow the attention lesson: scores `Q @ K.T / √d_k`, −∞ where the mask is False, softmax along the last axis, multiply by V. The first token can only see itself, so its output is its own value vector.',

    { h: 'Testing causality' },
    'You can test that a function is causal without knowing its weights: change a later input and check that earlier outputs do not move. A running average passes; an average over everything fails.',
    {
      code: `import numpy as np

x = np.array([1.0, 2.0, 3.0, 4.0])
running = lambda v: np.cumsum(v) / np.arange(1, len(v) + 1)
overall = lambda v: np.full(len(v), v.mean())
y = x.copy()
y[3] = 100.0
print(np.allclose(running(x)[:3], running(y)[:3]), np.allclose(overall(x)[:3], overall(y)[:3]))`,
      out: 'True False',
    },
    'The same test works on a whole model: the logits for the first three tokens must be the same whether or not more tokens follow. That property is also what makes the KV cache exact.',

    { h: 'Forward pass and loss' },
    'The forward pass is three lines: embed, add the attention output to the embeddings (the residual connection, so the embeddings still reach the output if attention adds nothing), and multiply by the transposed token embedding matrix, `tok_emb.T` of shape `(d, vocab)`, which turns each `(d,)` vector into one logit per vocabulary entry. Reusing the embedding matrix like this is the tied weights idea from the embeddings lesson.',
    { sub: 'Lining up the targets' },
    'Row t of the logits predicts token t + 1. So drop the last row of the logits (it has no next token) and the first id, and the two line up, giving T − 1 predictions.',
    { sub: 'A stable log-softmax' },
    'The loss needs the log of each softmax probability. Taking the log of a softmax can overflow or give log 0. Instead compute it directly: subtract the row maximum, then subtract the log of the sum of exponentials. To pick one entry per row, index with two arrays: `np.arange(n)` for the rows and the targets for the columns.',
    {
      code: `import numpy as np

logits = np.array([[2.0, 0.0, 1.0], [0.0, 3.0, 0.0]])
z = logits - logits.max(axis=-1, keepdims=True)
log_probs = z - np.log(np.exp(z).sum(axis=-1, keepdims=True))
picked = log_probs[np.arange(2), np.array([2, 1])]
print(np.round(picked, 3), round(float(-picked.mean()), 3))`,
      out: '[-1.408 -0.095] 0.751',
    },
    'Row 0 picks column 2 and row 1 picks column 1. The loss is the negative mean, 0.751. Equal logits over a vocabulary of size n give a loss of ln n, the value an untrained model should be near.',

    { h: 'Sampling and generating' },
    'The sampler takes the logits of one position. Temperature 0 means greedy: return `int(np.argmax(logits))`. Otherwise divide by the temperature, then apply top-k: `np.sort(z)` sorts from small to large, so `np.sort(z)[-k]` is the k-th largest value, and setting everything below it to −∞ removes those tokens. The softmax then renormalises the survivors in one step.',
    {
      code: `import numpy as np

z = np.array([0.5, 2.0, -1.0, 1.5, 0.0])
cutoff = np.sort(z)[-2]
print(np.where(z >= cutoff, z, -np.inf))`,
      out: '[-inf  2.  -inf  1.5 -inf]',
    },
    'Draw with `rng.choice(len(probs), p=probs)`, where `rng = np.random.default_rng(seed)` is created by the caller and passed in. A function that makes its own generator cannot be repeated or tested: the same seed must give the same draws. Wrap the result in `int(...)` to return a plain integer.',
    'Generation is a loop: run the forward pass on the ids so far, sample from the **last** row of the logits, append, repeat. Row 0 is the prediction after only the first token; sampling from it ignores the rest of the prompt.',

    { h: 'From this to a real GPT' },
    'Nothing changes the path you built. A real model adds a training loop on batches of text, an MLP and layer normalisation in each block, several heads and many stacked blocks, a subword tokeniser, a batch axis with padding masks, a KV cache in the generation loop, and a held-out text to report loss or perplexity on.',
  ],
}
