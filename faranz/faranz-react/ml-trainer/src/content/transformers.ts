import type { Module } from '../types'

export const transformers: Module = {
  id: 'transformers',
  title: 'Transformers and language models',
  summary: 'How a language model turns text into numbers, attends over them and produces the next token, and what that means for cost, speed and behaviour.',
  lessons: [
    {
      id: 'transformers-tokens',
      title: 'Tokenisation: text into integers',
      summary: 'Why models read subword pieces, how byte-pair encoding finds them, and why a token is not a word.',
      widget: 'transformers-bpe',
      text: [
        'A model computes on numbers, so the first step is a **tokeniser**: it cuts text into pieces from a fixed vocabulary and replaces each piece with its integer id. Two obvious choices both fail. **Characters** give a tiny vocabulary but very long sequences, and the model has to learn every spelling from scratch. **Words** give short sequences but a vocabulary of millions, and any word that was not in the training data has no id at all: it becomes a single "unknown" token and its meaning is lost.',
        '**Subword** tokens sit in between. Common words are one token, rare words are split into a few familiar pieces, and in the worst case a string falls back to single characters or bytes, so every text can be encoded. Vocabularies are typically 30,000 to 200,000 tokens.',
        '**Byte-pair encoding** (BPE) is the usual way to build the vocabulary. Start with single characters (real tokenisers start with bytes). Count every adjacent pair in the training text, merge the most frequent pair into one new token, and repeat until the vocabulary reaches the size you chose. To encode new text, apply the same merges in the order they were learned. The figure does this on six words.',
        'Tokens are not words. For English a rule of thumb is about 4 characters, or three quarters of a word, per token; code, names, rare words and other languages cost more. A leading space is usually part of the token, so `" cat"` and `"cat"` have different ids. Long numbers are cut into arbitrary chunks. The model never sees letters or digits, only ids, which is one reason models miscount letters and slip on long arithmetic. Context limits and prices are counted in tokens, so count with the real tokeniser before you guess.',
        '**Special tokens** are ids reserved for structure: start and end of text, padding, the markers that separate the turns of a chat. They are added by code, not produced from ordinary text, and text typed by a user that looks like one must be encoded as plain characters. Padding makes the sequences in a batch the same length and comes with a mask that tells the model to ignore it. A tokeniser belongs to its model: the ids only mean something to the weights that were trained with them.',
      ],
      rules: [
        'Text → tokens → integer ids. The model only ever sees the ids.',
        'BPE: merge the most frequent adjacent pair, add it to the vocabulary, repeat.',
        'A bigger vocabulary means fewer tokens per text and a bigger embedding table.',
        'English: about 4 characters or ¾ of a word per token. Count, do not guess.',
        'Always use the tokeniser the model was trained with.',
        'Special tokens are added by code. Never let user text turn into them.',
      ],
      questions: [
        {
          kind: 'choice',
          id: 'transformers-tokens-1',
          ask: 'A model with a word-level vocabulary meets a product name that was never in its training data. What does it receive?',
          options: ['The letters of the name, one at a time', 'A single "unknown" id, the same one as for every other unseen word', 'A new id created on the spot', 'Nothing: the word is skipped'],
          answer: 1,
          why: 'A word-level vocabulary is fixed after training, and everything outside it maps to one unknown token. The model cannot tell one unseen word from another. Subword tokenisers avoid this by splitting the word into pieces they do know.',
        },
        {
          kind: 'choice',
          id: 'transformers-tokens-2',
          ask: 'In the figure, press the merge button once. What happens?',
          options: [
            '`l` and `o` become the token `lo`: the vocabulary grows from 7 to 8 and the text shrinks from 31 tokens to 25',
            '`low` becomes one token straight away, because it is the most common word',
            'The vocabulary shrinks from 7 to 6, because two characters have been joined',
            'The token count stays at 31: a merge only changes the vocabulary',
          ],
          answer: 0,
          why: 'The pair `l`, `o` occurs six times, once in every word. Merging it adds one entry to the vocabulary and removes one token at each of the six places. BPE only ever joins two existing tokens at a time, so `low` needs a second merge.',
        },
        {
          kind: 'number',
          id: 'transformers-tokens-3',
          ask: 'In the figure, start again and merge three times. How many tokens is the text now?',
          answer: 15,
          tol: 0,
          hint: 'The readout shows it. The three merges are lo, low and lowe.',
          why: 'Three merges take 31 tokens to 25, 19 and 15: half the length for three extra vocabulary entries. The first merges are worth the most, because they are the most frequent pairs. Later ones save less and less.',
        },
        {
          kind: 'output',
          id: 'transformers-tokens-4',
          ask: 'The counting step of BPE on one word. What does this print?',
          code: `from collections import Counter

tokens = list("banana")
pairs = Counter(zip(tokens, tokens[1:]))
print(pairs[("a", "n")], pairs[("b", "a")], len(pairs))`,
          answer: '2 1 3',
          why: 'The adjacent pairs are ba, an, na, an, na. So (a, n) occurs twice, (b, a) once, and there are three different pairs. BPE would merge one of the pairs that occurs twice.',
        },
        {
          kind: 'bug',
          id: 'transformers-tokens-5',
          ask: 'This should return the most frequent pair of neighbouring tokens. It returns pairs that are never next to each other.',
          code: `from collections import Counter

def most_frequent_pair(words):
    # words: a list of token lists, one per word
    counts = Counter()
    for tokens in words:
        counts.update(zip(tokens, tokens[2:]))
    return counts.most_common(1)[0][0]`,
          line: 7,
          fix: '        counts.update(zip(tokens, tokens[1:]))',
          why: 'Zipping a list with itself shifted by one gives each token with its right-hand neighbour. Shifted by two it pairs each token with the one after that, so the counts describe pairs that cannot be merged.',
        },
        {
          kind: 'write',
          id: 'transformers-tokens-6',
          ask: 'Write one BPE merge: go through a list of tokens from left to right and replace every occurrence of the pair with one joined token.',
          starter: `def merge(tokens, pair):
    # tokens: a list of strings   pair: a tuple of two strings
    # return a new list in which each adjacent occurrence of the pair is one token
    pass`,
          solution: `def merge(tokens, pair):
    out = []
    i = 0
    while i < len(tokens):
        if i + 1 < len(tokens) and (tokens[i], tokens[i + 1]) == pair:
            out.append(tokens[i] + tokens[i + 1])
            i += 2
        else:
            out.append(tokens[i])
            i += 1
    return out`,
          tests: `out = merge(list("lower"), ("l", "o"))
assert out is not None, "the function returns nothing yet"
assert out == ["lo", "w", "e", "r"], f"merging l+o in lower should give ['lo', 'w', 'e', 'r'], got {out}"
assert merge(["lo", "w", "e", "r"], ("lo", "w")) == ["low", "e", "r"], "tokens can be longer than one character"
assert merge(list("banana"), ("a", "n")) == ["b", "an", "an", "a"], "every occurrence should be merged, not only the first"
assert merge(list("aaa"), ("a", "a")) == ["aa", "a"], "after a merge, skip both tokens: 'aaa' gives ['aa', 'a']"
assert merge(list("abc"), ("c", "a")) == ["a", "b", "c"], "a pair that does not occur should change nothing"
t = list("abab")
merge(t, ("a", "b"))
assert t == list("abab"), "return a new list and leave the input alone"`,
          why: 'After a match you step over both tokens, otherwise the second half would be used again. Training BPE is this function in a loop with a pair count before it, and encoding new text is this function applied once for each learned merge, in order.',
        },
        {
          kind: 'output',
          id: 'transformers-tokens-7',
          ask: 'A simplified encoder that always takes the longest piece in the vocabulary. What does this print?',
          code: `vocab = ["low", "er", "est", "l", "o", "w", "e", "r", "s", "t"]

def encode(word):
    out = []
    while word:
        piece = max((v for v in vocab if word.startswith(v)), key=len)
        out.append(piece)
        word = word[len(piece):]
    return out

print(encode("slower"))`,
          answer: "['s', 'low', 'er']",
          why: 'No piece longer than `s` starts the word, then `low` matches, then `er`. A word the vocabulary has never seen as a whole is still encoded, as three familiar pieces. That is the point of subword tokens.',
        },
        {
          kind: 'choice',
          id: 'transformers-tokens-8',
          ask: 'You plan to send a 1,500-word English document to a model. Roughly how many tokens should you budget for it?',
          options: ['About 1,100', 'About 1,500', 'About 2,000', 'About 6,000'],
          answer: 2,
          why: 'At about three quarters of a word per token, 1,500 words is about 2,000 tokens. It is a rule of thumb for ordinary English: code, tables, names and other languages can take far more, so for a real budget run the tokeniser.',
        },
        {
          kind: 'choice',
          id: 'transformers-tokens-9',
          ask: 'A model is asked how many times the letter r appears in "strawberry" and answers 2. What is the most direct explanation?',
          options: [
            'The model cannot count above 2',
            'It receives a few token ids for the word, not ten letters, so the spelling is not in front of it',
            'The tokeniser removed one of the letters',
            'The temperature was too high',
          ],
          answer: 1,
          why: 'The word arrives as two or three subword ids. Which letters each id contains is something the model has to have learned indirectly. The same thing makes long numbers hard: they are cut into chunks that do not line up with place value.',
        },
        {
          kind: 'choice',
          id: 'transformers-tokens-10',
          ask: 'You fine-tune a model and then, by mistake, serve it with the tokeniser of a different model. Both vocabularies have 32,000 entries. What happens?',
          options: [
            'An error: the tokeniser checks which model it is used with',
            'Nothing visible: tokenisers of the same size are interchangeable',
            'No error, but the output is nonsense, because the same id now stands for a different piece of text',
            'The model is a little slower',
          ],
          answer: 2,
          why: 'Every id is in range, so nothing crashes. But row 5,000 of the embedding table was trained for one piece of text and is now being fed another. Ship the tokeniser with the model and load them from the same place.',
        },
        {
          kind: 'choice',
          id: 'transformers-tokens-11',
          ask: 'A user types the literal text `<|endoftext|>` into your chat box. That string is also the name of a special token. What should the tokeniser do with the user message?',
          options: [
            'Encode it as the special token, since it matches',
            'Encode it as ordinary characters, so that it is several plain tokens',
            'Reject the whole message',
            'Delete everything after it',
          ],
          answer: 1,
          why: 'Special tokens carry structure: where a turn ends, who is speaking. If user text can produce them, a user can forge the end of their own message and the start of a system one. Encode untrusted text with special-token parsing turned off, and add the real special tokens in code.',
        },
        {
          kind: 'choice',
          id: 'transformers-tokens-12',
          ask: 'A batch holds one sequence of 12 tokens and one of 7. You pad the short one with 5 padding ids. What else does the model need?',
          options: [
            'Nothing: the padding id is 0, so it adds nothing',
            'A mask that marks which positions are real, so that attention and the loss ignore the padding',
            'A second tokeniser for the padded positions',
            'The short sequence repeated until it is 12 long',
          ],
          answer: 1,
          why: 'A padding id is an ordinary row of the embedding table as far as the arithmetic goes. Without an attention mask the real tokens attend to it, and without masking the loss the model is trained to predict padding. The id being 0 does not make its vector zero.',
        },
      ],
    },
    {
      id: 'transformers-embeddings',
      title: 'Embeddings and position',
      summary: 'A token id selects a row of a table, and a second signal says where in the sequence it stands.',
      text: [
        'An id is a label, not a quantity: token 500 is not "more" than token 499. So the first layer of the model is a table, the **embedding matrix**, with one row per vocabulary entry and `d_model` columns. An id selects its row. It is a lookup, the same as multiplying a one-hot vector by the matrix, only cheaper. The rows are ordinary weights and are learned with everything else.',
        { code: `tok = nn.Embedding(vocab_size, d_model)      # weights: (vocab, d)
pos = nn.Embedding(max_len, d_model)         # weights: (max_len, d)

x = tok(ids) + pos(torch.arange(ids.shape[1]))    # ids: (batch, T)  ->  x: (batch, T, d)` },
        'Training pushes tokens that are used in similar contexts towards similar rows, so nearby vectors (by cosine similarity) tend to mean similar things. But the table is context-free: `bank` gets the same row beside a river and beside a loan. Telling the two apart is the work of the layers above. The table is also large: vocabulary × width, so 50,000 × 768 is 38 million weights. The output layer that turns the final vectors back into one score per token has the same shape, and many models reuse the embedding matrix for it (**tied weights**).',
        'Attention, the next lesson, treats its input as a set. Shuffle the tokens and each one gets the same result as before. So "dog bites man" and "man bites dog" would be indistinguishable unless position is put into the vectors.',
        '**Learned positions** are a second table with one row per position, added to the token embedding. They are simple and work well, but the table has a fixed number of rows: a model built with 512 positions cannot take token 513. **Sinusoidal positions** use a fixed formula in place of a table: `PE(pos, 2i) = sin(pos / 10000^(2i/d))` and `PE(pos, 2i+1) = cos(…)` of the same angle. Each pair of columns is a clock hand, fast in the first columns and slow in the last, so every position gets a different pattern, with no weights and no hard limit.',
        'Many recent models put position in a third place: inside attention, as a rotation of the queries and keys that depends on how far apart two tokens are (rotary embeddings). The outline is the same in every scheme: without some position signal a transformer cannot see order.',
      ],
      rules: [
        'The embedding table has shape `(vocab, d_model)`. An id picks a row.',
        'Input embeddings are context-free: one vector per token, whatever surrounds it.',
        'Position must be added, because attention alone ignores order.',
        'Learned positions: a table indexed by 0, 1, 2, …, never by token id, with a hard maximum length.',
        'Sinusoidal positions: sines and cosines at many speeds, no weights.',
      ],
      questions: [
        {
          kind: 'output',
          id: 'transformers-embeddings-1',
          ask: 'What does this print?',
          code: `import torch
import torch.nn as nn

emb = nn.Embedding(10, 4)
ids = torch.tensor([[1, 5, 5], [0, 2, 9]])
print(emb(ids).shape)`,
          answer: 'torch.Size([2, 3, 4])',
          why: 'Every id is replaced by its row of 4 numbers, so a new axis of size 4 is added at the end: (batch, T) becomes (batch, T, d). The vocabulary size, 10, does not appear in the output shape.',
        },
        {
          kind: 'number',
          id: 'transformers-embeddings-2',
          ask: 'A model has a vocabulary of 30,000 tokens and `d_model` = 512. How many weights are in its token embedding table?',
          answer: 15360000,
          check: '30000 * 512',
          why: '30,000 rows of 512 numbers: 15.36 million. In a small model the embedding table can be a large share of all the weights, which is one reason the vocabulary is not made as big as possible.',
        },
        {
          kind: 'output',
          id: 'transformers-embeddings-3',
          ask: 'An embedding lookup in NumPy. What does this print?',
          code: `import numpy as np

E = np.arange(12).reshape(4, 3)    # 4 tokens, 3 numbers each
ids = [2, 0, 2]
print(E[ids].shape, E[ids][:, 0])`,
          answer: '(3, 3) [6 0 6]',
          why: 'Indexing with a list of ids stacks those rows: row 2 is [6 7 8] and row 0 is [0 1 2]. The first column of the result is 6, 0, 6. The same id gives the same row each time.',
        },
        {
          kind: 'output',
          id: 'transformers-embeddings-4',
          ask: 'A lookup and a one-hot product. What does this print?',
          code: `import numpy as np

E = np.arange(6).reshape(3, 2)
one_hot = np.array([0, 1, 0])
print(one_hot @ E, E[1])`,
          answer: '[2 3] [2 3]',
          why: 'A one-hot vector times the matrix picks out one row. The lookup gives the same answer without multiplying 50,000 zeros, which is why embedding layers index and do not multiply.',
        },
        {
          kind: 'output',
          id: 'transformers-embeddings-5',
          ask: 'Three made-up word vectors. What does this print?',
          code: `import numpy as np

E = {"king": np.array([1.0, 1.0]), "queen": np.array([0.8, 1.2]), "car": np.array([1.0, -1.0])}

def cos(a, b):
    return a @ b / (np.linalg.norm(a) * np.linalg.norm(b))

print(round(float(cos(E["king"], E["queen"])), 2), round(float(cos(E["king"], E["car"])), 2))`,
          answer: '0.98 0.0',
          why: 'king and queen point almost the same way, so the cosine is close to 1. king and car are at right angles: their dot product is 1 − 1 = 0. Nearest neighbours by cosine are how you inspect what an embedding table has learned.',
        },
        {
          kind: 'choice',
          id: 'transformers-embeddings-6',
          ask: 'The token `bank` appears in "river bank" and in "bank loan". What does the embedding table return for it in the two sentences?',
          options: [
            'Two different vectors, one for each meaning',
            'The same vector both times: the table knows only the id; the layers above use the context',
            'The average of the vectors of the neighbouring tokens',
            'A vector that depends on the position in the sentence',
          ],
          answer: 1,
          why: 'A lookup has one input, the id. The row for `bank` has to serve every sense of the word. The vector only becomes specific to the sentence after attention has mixed in the neighbours.',
        },
        {
          kind: 'bug',
          id: 'transformers-embeddings-7',
          ask: 'The input layer of a small language model. It runs, but the model behaves as if word order did not exist.',
          code: `def embed(ids, tok_emb, pos_emb):
    # ids: (batch, T) token ids
    # tok_emb: nn.Embedding(vocab_size, d)   pos_emb: nn.Embedding(max_len, d)
    T = ids.shape[1]
    positions = ids[:, :T]
    return tok_emb(ids) + pos_emb(positions)`,
          line: 5,
          fix: '    positions = torch.arange(T)',
          why: 'The position table must be indexed by 0, 1, 2, … up to T − 1. Indexed by the token ids it adds a second vector that depends only on the token, so nothing says where the token stands. It may also crash when an id is larger than `max_len`.',
        },
        {
          kind: 'choice',
          id: 'transformers-embeddings-8',
          ask: 'A model has no position signal at all. You feed it "dog bites man" and then "man bites dog". How do the vectors that come out of an attention layer compare?',
          options: [
            'They are unrelated: the sentences mean different things',
            'Each token gets exactly the same output vector in both, only in a different order',
            'The second sentence gives an error',
            'Only the vector for `bites` is the same',
          ],
          answer: 1,
          why: 'Each token computes a weighted average over the same set of vectors, with weights that depend only on content. Reordering the input reorders the output and changes nothing else. Who bit whom is invisible until position is added.',
        },
        {
          kind: 'choice',
          id: 'transformers-embeddings-9',
          ask: 'An encoder with a learned position table of 512 rows is given a document of 600 tokens. What happens?',
          options: [
            'It works: the extra positions reuse row 511',
            'An index error, or a silent cut at 512 if the tokeniser was told to truncate',
            'The model is slower but correct',
            'The positions wrap around to 0',
          ],
          answer: 1,
          why: 'There is no row 512 to look up. Libraries either raise an index error or, with truncation switched on, drop everything after token 512 without a word. If the end of your documents matters, check their token lengths before you choose the model.',
        },
        {
          kind: 'write',
          id: 'transformers-embeddings-10',
          ask: 'Write the sinusoidal position vector for one position: columns 0 and 1 use the angle `pos / 10000**(0/d)`, columns 2 and 3 use `pos / 10000**(2/d)`, and so on. Even columns take the sine, odd columns the cosine. `d` is even.',
          starter: `import math

def position(pos, d):
    # return a list of d numbers
    pass`,
          solution: `import math

def position(pos, d):
    out = []
    for i in range(0, d, 2):
        angle = pos / 10000 ** (i / d)
        out.append(math.sin(angle))
        out.append(math.cos(angle))
    return out`,
          tests: `import math
out = position(0, 4)
assert out is not None, "the function returns nothing yet"
assert len(out) == 4, f"position(0, 4) should have 4 numbers, got {len(out)}"
assert all(abs(a - b) < 1e-9 for a, b in zip(out, [0, 1, 0, 1])), f"position 0 is sin(0), cos(0), sin(0), cos(0) = [0, 1, 0, 1], got {out}"
out = position(1, 4)
assert abs(out[0] - math.sin(1)) < 1e-9 and abs(out[1] - math.cos(1)) < 1e-9, "the first pair is sin(pos), cos(pos)"
assert abs(out[2] - math.sin(0.01)) < 1e-9, "for d = 4 the second pair turns 100 times slower: sin(pos / 100)"
assert abs(out[3] - math.cos(0.01)) < 1e-9, "odd columns take the cosine of the same angle as the column before"
out = position(3, 8)
assert len(out) == 8, "position(3, 8) should have 8 numbers"
assert abs(out[6] - math.sin(3 / 10000 ** 0.75)) < 1e-9, "column 6 of 8 uses the angle pos / 10000**(6/8)"`,
          why: 'Each pair of columns is the sine and cosine of one angle, and the angle grows more slowly from pair to pair. The first pair tells neighbouring positions apart; the last pairs change so slowly that they separate positions thousands of tokens apart.',
        },
        {
          kind: 'choice',
          id: 'transformers-embeddings-11',
          ask: 'Which statement about learned and sinusoidal positions is right?',
          options: [
            'Sinusoidal positions add `max_len × d` weights; learned ones add none',
            'Learned positions are a table with a fixed number of rows; sinusoidal ones come from a formula and can be computed for any position',
            'Both need the token ids to be sorted',
            'Sinusoidal positions replace the token embedding',
          ],
          answer: 1,
          why: 'A learned table costs `max_len × d` weights and stops at its last row. The formula has no weights and no last row, though a model still tends to do badly on lengths it never saw in training. Either way the result is added to the token embedding, not used in place of it.',
        },
      ],
    },
    {
      id: 'transformers-attention',
      title: 'Attention from scratch',
      summary: 'Every token asks a question of every other token and takes a weighted average of the answers.',
      widget: 'transformers-attention',
      text: [
        'After the embedding layer each token has a vector that knows nothing about its neighbours. **Attention** fixes that: every token builds its new vector as a weighted average of vectors from the whole sequence, with weights that depend on content. It is how `it` can pick up what it refers to.',
        'Each token vector is sent through three learned matrices. The **query** says what this token is looking for. The **key** says what this token has to offer. The **value** is what it hands over if it is chosen. The score of token i looking at token j is the dot product of query i with key j: large when the two point the same way.',
        { code: `def attention(Q, K, V, mask=None):            # Q, K: (T, d_k)    V: (T, d_v)
    scores = Q @ K.T / np.sqrt(K.shape[-1])    # (T, T): row i is query i against every key
    if mask is not None:
        scores = np.where(mask, scores, -np.inf)
    weights = softmax(scores, axis=-1)         # each row adds up to 1
    return weights @ V                         # (T, d_v): a mix of values for every token` },
        'This is **scaled dot-product attention**. The softmax runs along each row, that is over positions, so every token ends up with weights that add to 1. The division by `√d_k` matters: dot products of long vectors are large, and large scores push the softmax to put everything on one token, where its gradient is almost zero. The scale slider in the figure shows both ends.',
        'A language model predicts the next token, so position i must not look at positions after i, or it would read the answer. The **causal mask** sets those scores to −∞ before the softmax, which gives them a weight of exactly 0 and shares the rest among the allowed positions. With the mask, one pass over a sequence trains every position at once, each one seeing only its own past.',
        '**Multi-head attention** runs several attentions side by side. With `d_model` = 768 and 12 heads, each head works with queries, keys and values of size 64, and the 12 outputs are joined back into 768 numbers. The cost is about the same as one wide head, but each head can follow a different relation: one the previous token, another the subject of the verb.',
      ],
      rules: [
        '`weights = softmax(Q @ K.T / √d_k)`, then `out = weights @ V`.',
        'The score matrix is `(T, T)`. The softmax is over the last axis: each row adds up to 1.',
        'Queries and keys decide how much. Values decide what is passed on.',
        'Mask with −∞ before the softmax, never with 0 and never after.',
        'Causal mask: lower triangle. Token i sees tokens 0 to i.',
        'Heads split `d_model`: head size = `d_model ÷ heads`.',
      ],
      questions: [
        {
          kind: 'choice',
          id: 'transformers-attention-1',
          ask: 'In the figure, choose `sat` as the query. With no mask, `cat` and `mat` get 0.38 each. Turn on the causal mask: `mat` drops to 0 and `cat` rises to 0.79. Why does `cat` rise?',
          options: [
            'The mask adds a bonus to the scores of earlier tokens',
            'The score of `cat` has not changed, but the softmax now divides by a total over fewer tokens, so the remaining ones share all the weight',
            'The query vector of `sat` changes when the mask is on',
            'The value of `mat` is given to `cat`',
          ],
          answer: 1,
          why: 'Masking sets the scores of later tokens to −∞, which contributes e^−∞ = 0 to the softmax total. The scores of the tokens that remain are untouched; they are divided by a smaller sum. Each row still adds up to 1.',
        },
        {
          kind: 'choice',
          id: 'transformers-attention-2',
          ask: 'In the figure, with no mask, the two `the` tokens get the same weight from every query, whatever the scale. Why?',
          options: [
            'Attention always gives equal weight to repeated words',
            'Their key vectors are identical, because these vectors hold no position information, so every query scores them the same',
            'The softmax rounds small weights to the same value',
            'Determiners are ignored by attention',
          ],
          answer: 1,
          why: 'A score is query · key, and two tokens with the same key get the same score from any query. In a real model the position signal makes the two keys differ. It is the "attention sees a set" point from the last lesson, made visible.',
        },
        {
          kind: 'number',
          id: 'transformers-attention-3',
          ask: 'In the figure, turn the mask off and slide the scale to 0. What weight does each of the six tokens get? (Two decimals.)',
          answer: 0.1667,
          tol: 0.01,
          check: '1 / 6',
          why: 'With every score at 0 the softmax is uniform: 1/6 ≈ 0.17 each. Attention becomes a plain average and the content of the tokens plays no part. At the other end of the slider one token takes nearly everything.',
        },
        {
          kind: 'choice',
          id: 'transformers-attention-4',
          ask: 'What goes wrong if you leave out the division by `√d_k` in a model with large `d_k`?',
          options: [
            'Nothing: softmax ignores the size of its inputs',
            'The scores are large, the softmax puts nearly all the weight on one token, and its gradients are close to zero, so training is slow or unstable',
            'The weights no longer add up to 1',
            'The causal mask stops working',
          ],
          answer: 1,
          why: 'The spread of a dot product grows with the number of dimensions. Softmax depends on differences between scores, so larger scores mean a sharper, saturated output. Dividing by √d_k keeps the scores at a similar size whatever the width. The rows add up to 1 either way.',
        },
        {
          kind: 'output',
          id: 'transformers-attention-5',
          ask: 'Shapes through one attention head. What does this print?',
          code: `import numpy as np

T, d_k, d_v = 5, 8, 16
Q = np.zeros((T, d_k))
K = np.zeros((T, d_k))
V = np.zeros((T, d_v))

scores = Q @ K.T
print(scores.shape, (scores @ V).shape)`,
          answer: '(5, 5) (5, 16)',
          why: '(5, 8) @ (8, 5) gives one score for every pair of tokens: (5, 5). Multiplying by the values, (5, 5) @ (5, 16), gives each of the 5 tokens a mix of value vectors. The score matrix grows with the square of the sequence length.',
        },
        {
          kind: 'output',
          id: 'transformers-attention-6',
          ask: 'A softmax with one masked position. What does this print?',
          code: `import numpy as np

scores = np.array([1.0, 1.0, -np.inf])
weights = np.exp(scores) / np.exp(scores).sum()
print(weights.tolist())`,
          answer: '[0.5, 0.5, 0.0]',
          why: 'e^−∞ is exactly 0, so the masked position gets no weight and adds nothing to the total. The two equal scores share the weight. This is the whole mechanism of masking.',
        },
        {
          kind: 'bug',
          id: 'transformers-attention-7',
          ask: 'Scaled dot-product attention. The output has the right shape, but the weights of one token over the sequence do not add up to 1.',
          code: `def attention(Q, K, V):
    # Q, K: (T, d_k)   V: (T, d_v)
    scores = Q @ K.T / np.sqrt(K.shape[-1])
    scores = scores - scores.max(axis=0, keepdims=True)
    weights = np.exp(scores) / np.exp(scores).sum(axis=0, keepdims=True)
    return weights @ V`,
          line: 5,
          fix: '    weights = np.exp(scores) / np.exp(scores).sum(axis=-1, keepdims=True)',
          why: 'Row i holds the scores of query i against every key, so the softmax must normalise along the last axis. Along axis 0 it makes each column add up to 1: every key spreads its weight over the queries, which is not attention. Line 4 only shifts the scores and is harmless once the softmax is right, but it should use the last axis too.',
        },
        {
          kind: 'bug',
          id: 'transformers-attention-8',
          ask: 'A causal attention layer. In training the loss falls quickly to almost zero, and the generated text is useless.',
          code: `def causal_attention(Q, K, V):
    T = Q.shape[0]
    scores = Q @ K.T / np.sqrt(K.shape[-1])
    allowed = np.tril(np.ones((T, T), dtype=bool))
    scores = np.where(allowed, scores, 0.0)
    weights = softmax(scores, axis=-1)
    return weights @ V`,
          line: 5,
          fix: '    scores = np.where(allowed, scores, -np.inf)',
          why: 'A score of 0 is not a weight of 0: e⁰ = 1, so later tokens still get a share. The model can then see the token it is asked to predict, learns to copy it, and has nothing to copy from when it generates. Only −∞ gives a weight of exactly zero.',
        },
        {
          kind: 'choice',
          id: 'transformers-attention-9',
          ask: 'Two tokens have identical keys but different values. A third token attends to both. What can you say?',
          options: [
            'It gives them the same weight, and what it receives from each is different',
            'It gives them different weights, because the values differ',
            'It receives the same vector from both',
            'It ignores both, because the keys clash',
          ],
          answer: 0,
          why: 'The weight comes from query · key only, so equal keys mean equal weights. The value is what is carried across, and it plays no part in deciding how much. Keeping "where to look" apart from "what to take" is the reason for three projections.',
        },
        {
          kind: 'number',
          id: 'transformers-attention-10',
          ask: 'A model has `d_model` = 768 and 12 attention heads. What is the size of the query vector inside one head?',
          answer: 64,
          check: '768 / 12',
          why: 'The heads split the width between them: 768 ÷ 12 = 64. Twelve small attentions cost about the same as one of width 768, and the outputs are joined back to 768.',
        },
        {
          kind: 'choice',
          id: 'transformers-attention-11',
          ask: 'What do you gain from 12 heads of size 64 over one head of size 768?',
          options: [
            'Twelve times fewer weights',
            'Each head has its own weights over the sequence, so one layer can follow several relations at once',
            'The causal mask is no longer needed',
            'The sequence can be twelve times longer',
          ],
          answer: 1,
          why: 'One softmax gives one set of weights for each token, which is one way of looking at the sentence. Separate heads can each attend somewhere else: the previous token, the matching bracket, the subject. The number of weights and the cost stay about the same.',
        },
        {
          kind: 'write',
          id: 'transformers-attention-12',
          numpy: true,
          ask: 'Write scaled dot-product attention for small matrices, with an optional causal mask. Return the output vectors, one row per token.',
          starter: `import numpy as np

def attention(Q, K, V, causal=False):
    # Q, K: (T, d_k)   V: (T, d_v)
    # scores -> (mask) -> softmax over each row -> weighted sum of the rows of V
    pass`,
          solution: `import numpy as np

def attention(Q, K, V, causal=False):
    T, d_k = K.shape
    scores = Q @ K.T / np.sqrt(d_k)
    if causal:
        scores = np.where(np.tril(np.ones((T, T), dtype=bool)), scores, -np.inf)
    scores = scores - scores.max(axis=-1, keepdims=True)
    weights = np.exp(scores)
    weights = weights / weights.sum(axis=-1, keepdims=True)
    return weights @ V`,
          tests: `V = np.array([[1.0, 0.0], [0.0, 1.0], [4.0, 4.0]])
Z = np.zeros((3, 2))
out = attention(Z, Z, V)
assert out is not None, "the function returns nothing yet"
assert out.shape == (3, 2), f"the output should have one row per token and d_v columns: (3, 2), got {out.shape}"
assert np.allclose(out, V.mean(axis=0)), "with all scores equal, every token should get the plain average of the values"
out = attention(Z, Z, V, causal=True)
assert np.allclose(out[0], V[0]), "with the causal mask the first token can only see itself"
assert np.allclose(out[1], [0.5, 0.5]), "with the causal mask the second token averages the first two values"
assert np.allclose(out[2], V.mean(axis=0)), "the last token still sees everything"
Q = np.array([[2.0, 0.0], [0.0, 0.0]])
K = np.array([[2.0, 0.0], [0.0, 0.0]])
I = np.eye(2)
out = attention(Q, K, I)
assert abs(out[0, 0] - 0.9442) < 1e-3, f"scores must be divided by sqrt(d_k): expected a weight of 0.944 here, got {out[0, 0]:.3f}"
assert np.allclose(out.sum(axis=1), 1), "the weights of each token must add up to 1: softmax over the last axis"
big = attention(Q * 100, K * 100, I)
assert np.all(np.isfinite(big)), "large scores overflow: subtract the row maximum before exponentiating"`,
          why: 'Four lines: scores, mask, softmax over each row, weights times values. Everything else in a transformer is built around this function. Subtracting the row maximum before the exponential keeps it finite, exactly as in the softmax of the maths module.',
        },
      ],
    },
    {
      id: 'transformers-block',
      title: 'The transformer block',
      summary: 'Attention plus a small network, wrapped in residual connections and normalisation, stacked many times.',
      text: [
        'A transformer is one **block** repeated. A block has two parts. **Attention** moves information between positions. Then an **MLP** works on each position alone: a linear layer that widens the vector (usually to 4 × `d_model`), a non-linearity such as GELU, and a linear layer back down. Attention gathers; the MLP computes on what was gathered. Most of the weights of a block are in the MLP.',
        { code: `def block(x):                      # x: (batch, T, d)
    x = x + attn(norm1(x))         # tokens exchange information
    x = x + mlp(norm2(x))          # each token is processed on its own
    return x                       # (batch, T, d): the same shape as it came in` },
        'Each part **adds** its result to its input: `x = x + f(x)`. This is a **residual connection**. The vectors form a stream that runs from the embedding to the output, and each layer writes a correction into it. For training it means the gradient has a direct path back through the additions and is not multiplied down by every layer, which is what makes stacks of dozens of blocks trainable.',
        '**Layer normalisation** rescales each token vector on its own to mean 0 and standard deviation 1 across its `d` features, then applies a learned scale and shift. It uses no statistics from the batch or from other positions, so it behaves the same in training and in generation. Modern models normalise before each part (pre-norm, as in the code) and once more after the last block.',
        'Shapes are simple because a block returns what it was given. Ids `(batch, T)` are embedded to `(batch, T, d)`, pass through N blocks unchanged in shape, and a final linear layer maps `d` to the vocabulary size: logits of shape `(batch, T, vocab)`, one next-token prediction for every position. The size knobs are depth N, width `d` and the number of heads. GPT-2 small has 12 blocks, width 768, 12 heads and about 124 million weights.',
        'Three families share this block. **Encoder-only** models (BERT) have no causal mask: every token sees both sides. They are trained to fill in masked tokens and give one vector per token, which suits classification, tagging and embeddings for search. They do not generate. **Decoder-only** models (GPT and nearly all current LLMs) use the causal mask and generate text. **Encoder-decoder** models (T5, the original transformer) read the input with an encoder and generate with a decoder that also attends to the encoder output: built for translation and summarising.',
      ],
      rules: [
        'Block: `x = x + attn(norm(x))`, then `x = x + mlp(norm(x))`.',
        'Attention mixes across positions. The MLP works on each position alone.',
        'Residual connections give gradients a direct path. Never drop the `x +`.',
        'Layer norm works over the features of one token: the last axis.',
        'Shape in equals shape out: `(batch, T, d)`. The logits are `(batch, T, vocab)`.',
        'Encoders understand, decoders generate. Pick by task.',
      ],
      questions: [
        {
          kind: 'output',
          id: 'transformers-block-1',
          ask: 'One block from PyTorch. What does this print?',
          code: `import torch
import torch.nn as nn

x = torch.zeros(2, 5, 16)
layer = nn.TransformerEncoderLayer(d_model=16, nhead=4, dim_feedforward=64, batch_first=True)
print(layer(x).shape)`,
          answer: 'torch.Size([2, 5, 16])',
          why: 'A block returns the shape it was given: 2 sequences, 5 tokens, 16 numbers each. The MLP width of 64 exists only inside the block. This is what allows any number of blocks to be stacked.',
        },
        {
          kind: 'number',
          id: 'transformers-block-2',
          ask: 'The MLP of a block maps `d` = 100 up to 400 and back down to 100, with a bias on both layers. How many weights does it have?',
          answer: 80500,
          check: '100 * 400 + 400 + 400 * 100 + 100',
          hint: 'A linear layer from n to m has n × m weights and m biases.',
          why: 'Up: 100 × 400 + 400 = 40,400. Down: 400 × 100 + 100 = 40,100. Together 80,500, or about 8d². The four attention matrices of the same block come to about 4d², so the MLP holds roughly two thirds of the block.',
        },
        {
          kind: 'bug',
          id: 'transformers-block-3',
          ask: 'A pre-norm transformer block. A model of 24 of these trains far worse than expected.',
          code: `def block(x, attn, mlp, norm1, norm2):
    # x: (batch, T, d)
    x = x + attn(norm1(x))
    x = mlp(norm2(x))
    return x`,
          line: 4,
          fix: '    x = x + mlp(norm2(x))',
          why: 'Without the addition the MLP output replaces the stream. Everything earlier layers wrote is kept only if the MLP learns to copy it, and the gradient must pass through every MLP on its way back. Both parts of the block need the residual.',
        },
        {
          kind: 'choice',
          id: 'transformers-block-4',
          ask: 'A 24-block model without residual connections barely learns, and the same model with them trains well. What do the residual connections change?',
          options: [
            'They add weights, so the model has more capacity',
            'They give the gradient a path of plain additions back to the early layers, so it is not shrunk by every layer on the way',
            'They make each block faster to compute',
            'They remove the need for a learning rate',
          ],
          answer: 1,
          why: 'The gradient of `x + f(x)` with respect to `x` is 1 plus the gradient through `f`. The 1 survives however deep the stack is. A residual connection adds no weights at all.',
        },
        {
          kind: 'output',
          id: 'transformers-block-5',
          ask: 'Layer normalisation on two token vectors, one ten times the other. What does this print?',
          code: `import numpy as np

x = np.array([[1.0, 2.0, 3.0],
              [10.0, 20.0, 30.0]])
mean = x.mean(axis=-1, keepdims=True)
std = x.std(axis=-1, keepdims=True)
y = (x - mean) / std
print(np.allclose(y[0], y[1]), y.mean(axis=-1))`,
          answer: 'True [0. 0.]',
          why: 'Each row is normalised by its own mean and standard deviation, so the factor of ten vanishes and both rows become the same. Layer norm keeps the size of the stream under control however much the layers before have added to it.',
        },
        {
          kind: 'bug',
          id: 'transformers-block-6',
          ask: 'Layer normalisation for a sequence. With it, a causal language model can see future tokens.',
          code: `def layer_norm(x, eps=1e-5):
    # x: (T, d), one row per token
    mean = x.mean(axis=0, keepdims=True)
    std = x.std(axis=-1, keepdims=True)
    return (x - mean) / (std + eps)`,
          line: 3,
          fix: '    mean = x.mean(axis=-1, keepdims=True)',
          why: 'axis=0 averages over the tokens of the sequence, so the output for token 2 depends on token 9. That mixes positions outside attention, where no causal mask applies. Layer norm uses only the features of one token: the last axis.',
        },
        {
          kind: 'choice',
          id: 'transformers-block-7',
          ask: 'You remove the attention part from every block and keep the MLPs. What can the model no longer do?',
          options: [
            'Use non-linear functions',
            'Let one position use information from another: every token would be processed alone',
            'Produce logits of the right shape',
            'Be trained with gradient descent',
          ],
          answer: 1,
          why: 'The MLP is applied to each position separately with the same weights. Attention is the only place where positions exchange anything. Without it the prediction after a token could depend on that token alone.',
        },
        {
          kind: 'choice',
          id: 'transformers-block-8',
          ask: 'A decoder-only model gets a batch of 4 sequences of 10 tokens. Its vocabulary is 50,000 and `d_model` is 768. What is the shape of the logits?',
          options: ['(4, 50000)', '(4, 10, 768)', '(4, 10, 50000)', '(10, 50000)'],
          answer: 2,
          why: 'The stack keeps (4, 10, 768) and the last linear layer maps 768 to 50,000 at every position. Each position predicts its own next token. When generating you use only the last position; in training you use all ten.',
        },
        {
          kind: 'choice',
          id: 'transformers-block-9',
          ask: 'You have 10,000 labelled support tickets to sort into 5 queues, thousands of tickets a minute, on a small budget. Which kind of model fits best?',
          options: [
            'A large decoder-only LLM, prompted with the queue descriptions for every ticket',
            'A small encoder-only model fine-tuned with a classification layer on top',
            'An encoder-decoder model trained to translate tickets into queue names',
            'A decoder-only model trained from scratch on the tickets',
          ],
          answer: 1,
          why: 'Classification needs a reading of the whole ticket, which is what an encoder gives, and one cheap forward pass per ticket. With 10,000 labels a fine-tuned small encoder is usually accurate, fast and cheap. A prompted LLM is the quick first version, not the cheapest one at this volume.',
        },
        {
          kind: 'choice',
          id: 'transformers-block-10',
          ask: 'Why is an encoder-only model such as BERT a poor choice for writing text one token after another?',
          options: [
            'It has no embedding table',
            'It was trained with every token seeing both sides, to fill in masked tokens, so it never learned to predict what comes next from the left side alone',
            'Its vocabulary is too small',
            'It has no MLP layers',
          ],
          answer: 1,
          why: 'Generation asks the model for the next token given only the past. An encoder was never trained on that task, and its vectors rely on context to the right that does not exist yet. The causal mask and the next-token objective are what make a decoder a generator.',
        },
        {
          kind: 'choice',
          id: 'transformers-block-11',
          ask: 'In an encoder-decoder model translating a sentence, what does the decoder attend to?',
          options: [
            'Only the tokens it has generated so far',
            'The tokens it has generated so far, under a causal mask, and the encoder output for the whole source sentence',
            'Only the encoder output',
            'The future tokens of the translation',
          ],
          answer: 1,
          why: 'The decoder has two attentions in each block: causal self-attention over its own output so far, and cross-attention whose keys and values come from the encoder. A decoder-only model gets the same effect by putting the source text in its own context.',
        },
        {
          kind: 'design',
          id: 'transformers-block-12',
          ask: 'In an interview you are asked to walk through a decoder-only transformer, from a string of text to the probabilities of the next token, giving the shape at each step. Sketch your answer.',
          checklist: [
            { point: 'The tokeniser turns the text into ids of shape (batch, T)', why: 'It fixes T, the length that everything after it pays for.' },
            { point: 'Token embedding lookup plus a position signal gives (batch, T, d)', why: 'Without position the model cannot see order.' },
            { point: 'N blocks, each `x + attn(norm(x))` then `x + mlp(norm(x))`, shape unchanged', why: 'Residual stream and pre-norm are what make depth trainable.' },
            { point: 'Attention uses a causal mask and several heads of size d ÷ heads', why: 'The mask is what makes it a next-token model and allows training on all positions at once.' },
            { point: 'The MLP widens to about 4d and comes back, applied to each position alone', why: 'It shows you know which part mixes positions and which does not.' },
            { point: 'A final norm and a linear layer to the vocabulary give logits (batch, T, vocab)', why: 'One prediction for every position; often the embedding matrix is reused here.' },
            { point: 'For generation: take the logits of the last position, softmax, choose a token, append, repeat', why: 'It connects the forward pass to decoding and to why output is produced one token at a time.' },
          ],
          why: 'The answer that lands is a pipeline with shapes: (batch, T) → (batch, T, d) → … → (batch, T, vocab). If you can say which axis each step works along, you can also debug one.',
        },
      ],
    },
    {
      id: 'transformers-training',
      title: 'Pretraining and fine-tuning',
      summary: 'One objective on a great deal of text, then small adjustments for the task you have.',
      text: [
        'A language model is **pretrained** on one task: predict the next token. Take a sequence, feed in all but the last token and ask for all but the first. With the causal mask, position t sees tokens 0 to t and is scored on token t + 1, so a sequence of T tokens gives T − 1 training examples from a single pass. The loss is cross-entropy, averaged over every position.',
        { code: `inputs, targets = ids[:, :-1], ids[:, 1:]          # shift by one
logits = model(inputs)                             # (batch, T-1, vocab)
loss = F.cross_entropy(logits.reshape(-1, vocab), targets.reshape(-1))` },
        '**Perplexity** is `exp(loss)`: the number of equally likely tokens the model is in effect choosing between. A model that knows nothing spreads its probability over the whole vocabulary: loss `ln(vocab)`, perplexity equal to the vocabulary size. For 50,000 tokens that is a loss of about 10.8, a useful number to check a new training run against. Perplexities can only be compared between models that use the same tokeniser on the same text.',
        'Pretraining transfers because predicting text well requires what most tasks need: grammar, facts, style, the structure of an argument or a program. **Fine-tuning** continues training from those weights on a small set of examples of your task, with a low learning rate. **Full fine-tuning** updates every weight. It is the most flexible and the most costly: memory for gradients of the whole model, a full copy to store for each task, and a real chance of overfitting a small dataset or losing general ability.',
        '**LoRA** freezes the pretrained matrix `W` of shape `(d_out, d_in)` and learns a low-rank correction beside it: `W + B @ A`, where `A` is `(r, d_in)` and `B` is `(d_out, r)` with a small rank `r` such as 8. That is `r × (d_in + d_out)` trainable weights where the full matrix has `d_in × d_out`. For a 4096 × 4096 matrix and r = 8: 65,536 against 16.8 million, about 0.4%. `B` starts at zero, so training begins from exactly the pretrained model, and afterwards `B @ A` can be added into `W`, which leaves no extra cost at inference. **Adapters** are the older variant: small extra layers inserted into each block and trained while the rest is frozen. They stay in the forward pass.',
        'Fine-tuning is rarely the first thing to try. Change the prompt and add examples first. If the model lacks knowledge, especially knowledge that changes, give it the text at request time. Fine-tune when you need a consistent style or output format, when a small tuned model can replace a large prompted one for cost or speed, or when you have labels for a narrow task. Do not fine-tune without a held-out set to measure against. These are rules of thumb, not laws.',
      ],
      rules: [
        'Inputs are `ids[:-1]`, targets are `ids[1:]`. One sequence trains every position.',
        'Perplexity = `exp(loss)`. An untrained model sits near loss `ln(vocab)`.',
        'Compare perplexity only with the same tokeniser and the same test text.',
        'LoRA trains `r × (d_in + d_out)` weights per matrix; the pretrained weights stay frozen.',
        '`B` starts at zero, so a LoRA model starts out identical to the base model.',
        'Prompt first, then retrieval, then fine-tuning. Always keep a held-out set.',
      ],
      questions: [
        {
          kind: 'output',
          id: 'transformers-training-1',
          ask: 'Making inputs and targets for next-token prediction. What does this print?',
          code: `ids = [5, 9, 2, 7]
inputs, targets = ids[:-1], ids[1:]
print(inputs, targets)`,
          answer: '[5, 9, 2] [9, 2, 7]',
          why: 'The target at each position is the token that follows it: after 5 comes 9, after 5 9 comes 2, after 5 9 2 comes 7. Four tokens give three predictions in one pass.',
        },
        {
          kind: 'bug',
          id: 'transformers-training-2',
          ask: 'The loss of a causal language model. Training loss drops to almost zero within a few hundred steps and the model generates rubbish.',
          code: `def lm_loss(model, ids):
    # ids: (batch, T) token ids
    inputs = ids[:, :-1]
    targets = ids[:, :-1]
    logits = model(inputs)          # (batch, T-1, vocab)
    return F.cross_entropy(logits.reshape(-1, logits.shape[-1]), targets.reshape(-1))`,
          line: 4,
          fix: '    targets = ids[:, 1:]',
          why: 'With the targets equal to the inputs, the model is asked to output the token it was given. Copying is trivial, so the loss collapses, and nothing about the next token is learned. A loss that falls too fast is as much a warning as one that does not fall.',
        },
        {
          kind: 'number',
          id: 'transformers-training-3',
          ask: 'A model has an average loss of 2.0 (natural log) on a test text. What is its perplexity? (One decimal.)',
          answer: 7.389,
          tol: 0.1,
          check: 'math.exp(2.0)',
          why: 'e² ≈ 7.4. On average the model is as unsure as if it were choosing between about 7 equally likely tokens at each step.',
        },
        {
          kind: 'number',
          id: 'transformers-training-4',
          ask: 'You start training a new model with a vocabulary of 50,000. About what loss should the first step report? (One decimal.)',
          answer: 10.82,
          tol: 0.1,
          check: 'math.log(50000)',
          hint: 'An untrained model gives every token about the same probability.',
          why: 'Uniform over 50,000 tokens means probability 1/50,000 for the right one, and −ln(1/50,000) ≈ 10.8. A first loss far above that points to bad initialisation; one far below it points to a leak such as unshifted targets.',
        },
        {
          kind: 'choice',
          id: 'transformers-training-5',
          ask: 'Model A reports perplexity 12 and model B reports 18 on the same test text. A uses a vocabulary of 32,000 tokens and B one of 100,000. What can you conclude?',
          options: [
            'A is the better model',
            'B is the better model, because its vocabulary is larger',
            'Not much: with different tokenisers the two are predicting different units, so the numbers are not comparable',
            'The two models are equally good',
          ],
          answer: 2,
          why: 'Perplexity is per token. A tokeniser with bigger pieces has fewer, harder predictions for the same text. To compare the models, convert to a common unit such as loss per character or per word, or compare them on the task itself.',
        },
        {
          kind: 'write',
          id: 'transformers-training-6',
          ask: 'Count the weights of a LoRA adapter for one matrix. Return two numbers: the trainable weights of the adapter, and the weights of the full matrix it sits beside.',
          starter: `def lora_params(d_out, d_in, r):
    # A is (r, d_in) and B is (d_out, r)
    # return (adapter weights, full matrix weights)
    pass`,
          solution: `def lora_params(d_out, d_in, r):
    return r * (d_in + d_out), d_out * d_in`,
          tests: `out = lora_params(1000, 1000, 4)
assert out is not None, "the function returns nothing yet"
assert len(out) == 2, "return two numbers: (adapter weights, full matrix weights)"
assert out == (8000, 1000000), f"a 1000 x 1000 matrix with r = 4: A has 4,000 weights and B has 4,000, the full matrix a million, got {out}"
assert lora_params(4096, 4096, 8) == (65536, 16777216), "a 4096 x 4096 matrix with r = 8 should give (65536, 16777216)"
assert lora_params(3000, 1000, 2) == (8000, 3000000), "for a matrix that is not square, A is (r, d_in) and B is (d_out, r): add the two"
assert lora_params(10, 10, 1)[0] == 20, "rank 1 on a 10 x 10 matrix is one column and one row: 20 weights"`,
          why: 'The adapter grows with the sum of the two sides and the full matrix with their product. That is the whole saving: at width 4096 and rank 8 you train 0.4% of the weights of the matrix.',
        },
        {
          kind: 'output',
          id: 'transformers-training-7',
          ask: 'A LoRA update for a 6 × 6 matrix with r = 2. What does this print?',
          code: `import numpy as np

rng = np.random.default_rng(0)
B = rng.normal(size=(6, 2))
A = rng.normal(size=(2, 6))
delta = B @ A
print(delta.shape, np.linalg.matrix_rank(delta))`,
          answer: '(6, 6) 2',
          why: 'The product has the full shape of the matrix it corrects, but only rank 2: every row is a mix of the two rows of A. LoRA bets that the change a task needs is of low rank, and in practice a small r is often enough.',
        },
        {
          kind: 'bug',
          id: 'transformers-training-8',
          ask: 'The forward pass of a layer with a LoRA adapter. It fails with a shape error whenever `r` differs from `d_in`.',
          code: `def lora_forward(x, W, A, B):
    # x: (d_in,)   W: (d_out, d_in), frozen
    # A: (r, d_in)   B: (d_out, r)
    base = W @ x
    update = A @ (B @ x)
    return base + update`,
          line: 5,
          fix: '    update = B @ (A @ x)',
          why: 'The input goes down to r numbers through A, (r, d_in) @ (d_in,), and back up to d_out through B. The other way round, B @ x asks for (d_out, r) @ (d_in,), which does not fit. Read the shapes from right to left.',
        },
        {
          kind: 'choice',
          id: 'transformers-training-9',
          ask: 'In LoRA, `A` is given small random values and `B` is set to zero. Why zero?',
          options: [
            'So that `B` is never trained',
            'So that `B @ A` is zero at the start and the model begins as exactly the pretrained model',
            'To save memory',
            'Because random values in both would make the rank too high',
          ],
          answer: 1,
          why: 'A random correction would damage the pretrained behaviour before the first step. With B at zero the first forward pass is the base model, and training moves away from it only as far as the data asks. B still gets a gradient, because A is not zero.',
        },
        {
          kind: 'choice',
          id: 'transformers-training-10',
          ask: 'You fine-tune on 400 examples for 8 epochs. What should you do?',
          chart: {
            x: 'epoch',
            y: 'loss',
            series: [
              { name: 'training', points: [2.1, 1.6, 1.2, 0.9, 0.6, 0.4, 0.25, 0.15], color: 'blue' },
              { name: 'held-out', points: [2.2, 1.8, 1.6, 1.55, 1.6, 1.75, 1.95, 2.2], color: 'bad' },
            ],
          },
          options: [
            'Train longer: the training loss is still falling',
            'Keep the weights from about epoch 4, where the held-out loss is lowest, and look for more data or a smaller rank',
            'Raise the learning rate',
            'Use the final weights: they have the lowest loss',
          ],
          answer: 1,
          why: 'After epoch 4 the model is memorising its 400 examples: training loss falls while held-out loss climbs. Small fine-tuning sets overfit within a few epochs. Without the held-out curve you would have shipped the worst checkpoint.',
        },
        {
          kind: 'choice',
          id: 'transformers-training-11',
          ask: 'Your product documentation changes every week, and you want a model to answer questions from it. What is the better first approach?',
          options: [
            'Fine-tune the model on the documentation every week',
            'Put the relevant passages into the prompt at request time, and leave the weights alone',
            'Train a new tokeniser on the documentation',
            'Raise the temperature so that the model explores more',
          ],
          answer: 1,
          why: 'Fine-tuning is a slow and unreliable way to store facts, and the facts here expire weekly. Text in the context is used directly and can be updated at once. Fine-tuning is for how the model behaves: format, tone, a narrow skill.',
        },
        {
          kind: 'design',
          id: 'transformers-training-12',
          ask: 'You are asked to fine-tune an open model so that it drafts support replies in your company\'s style. You have 3,000 past replies. Plan the work.',
          checklist: [
            { point: 'First measure a prompted baseline, with a few example replies in the prompt', why: 'If a prompt already does it, you save the whole project. If not, you have the number to beat.' },
            { point: 'Hold out a test set before anything else, and decide how replies will be judged', why: 'Without a fixed test set and a measure you cannot tell whether a run helped.' },
            { point: 'Clean the data: remove personal details, wrong or outdated answers and near-duplicates', why: 'The model copies whatever is in the examples, mistakes and private data included.' },
            { point: 'Format every example with the chat template and special tokens of the base model', why: 'A template that differs from the one used at inference quietly lowers quality.' },
            { point: 'Start with LoRA at a small rank and a low learning rate, not full fine-tuning', why: 'It fits on modest hardware, is quick to repeat, and overfits 3,000 examples less easily.' },
            { point: 'Watch held-out loss each epoch and keep the best checkpoint', why: 'Small sets overfit within a few epochs.' },
            { point: 'Check that general ability and safety behaviour have not got worse', why: 'Fine-tuning can erase things you were relying on.' },
            { point: 'Keep facts such as prices and policies out of the weights and supply them in the prompt', why: 'Style is stable and suits fine-tuning. Facts change and do not.' },
          ],
          why: 'The order matters more than the method: baseline, test set, data, then the smallest kind of training that works. Most failed fine-tuning projects skipped the first two.',
        },
      ],
    },
    {
      id: 'transformers-sampling',
      title: 'Decoding: choosing the next token',
      summary: 'The model gives a distribution. Greedy, temperature, top-k and top-p are ways of picking from it.',
      widget: 'transformers-sampling',
      text: [
        'The model does not write text. It outputs one score (logit) for every token in the vocabulary, for the next position only. **Decoding** is the loop around it: turn the logits into probabilities, choose a token, append it, run the model again. How you choose changes the text as much as the model does.',
        '**Greedy** decoding takes the most probable token every time. It is repeatable and safe for short factual answers, but over long outputs it is flat and prone to loops: once a phrase has been produced, repeating it is often the most probable continuation. **Sampling** draws the token at random according to the probabilities.',
        '**Temperature** divides the logits by T before the softmax. Below 1 the gaps between logits widen and the favourite gains; above 1 they narrow and the tail gains; at 1 you sample the distribution the model learned. T = 0 would divide by zero, so it is defined as greedy.',
        { code: `probs = softmax(logits / temperature)          # temperature first
probs = keep_top_k(probs, k)                   # zero all but the k most likely
probs = keep_top_p(probs, p)                   # zero the tail beyond cumulative probability p
probs = probs / probs.sum()                    # scale back up to 1
next_id = rng.choice(len(probs), p=probs)` },
        'A vocabulary has tens of thousands of unlikely tokens, and together they hold enough probability to be drawn now and then. One bad draw can derail a text. **Top-k** keeps the k most likely tokens. **Top-p** (nucleus sampling) keeps the shortest list of most likely tokens whose probabilities reach p. Top-p adapts: when the model is sure, one or two tokens survive, and when it is unsure, many do. For **repetition** there are penalties that lower the logits of tokens already used. They help prose, and hurt wherever repeating is correct, such as code and names.',
        'Temperature 0 is often not repeatable in practice. Greedy picks the largest logit, and the logits themselves vary a little from run to run: floating-point sums done in a different order on a GPU, a different batch, different hardware, a model updated behind the same name. When the top two logits are nearly tied, a difference in the last decimal flips the choice, and every later token then follows a different path. Do not write tests that need an exact string. As a rule of thumb, use a low temperature for extraction, classification and code, and 0.7 to 1 for writing that should vary.',
      ],
      rules: [
        'Greedy = argmax. Repeatable in principle, dull and loop-prone at length.',
        'Temperature divides the logits before the softmax. Lower is sharper, higher is flatter.',
        'Top-k keeps a fixed number of tokens. Top-p keeps a fixed amount of probability.',
        'After any cut, divide by the sum again so that the probabilities add up to 1.',
        'Temperature 0 is not a guarantee of identical output. Test for meaning, not exact strings.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'transformers-sampling-1',
          ask: 'In the figure, set temperature to 1, top-k to 8 and top-p to 0.9. How many tokens survive?',
          answer: 5,
          tol: 0,
          hint: 'Add up the dashed probabilities from the left until you reach 0.9.',
          why: 'The running total is 0.40, 0.60, 0.75, 0.85, 0.91. The fifth token is the first to take it past 0.9, so five are kept and the last three are cut. The five are then scaled up to add to 1.',
        },
        {
          kind: 'choice',
          id: 'transformers-sampling-2',
          ask: 'In the figure, remove the cuts (top-k 8, top-p 1) and lower the temperature from 1 to 0.5. What happens to `mat`, which started at 0.40?',
          options: [
            'It stays at 0.40: temperature only changes which tokens are cut',
            'It rises to about 0.67, and every other token falls',
            'It falls to about 0.25',
            'It becomes exactly 1',
          ],
          answer: 1,
          why: 'Dividing the logits by 0.5 doubles every gap between them, which squares the ratios between probabilities. The favourite gains and the tail shrinks. Only as the temperature approaches 0 does the favourite take everything.',
        },
        {
          kind: 'choice',
          id: 'transformers-sampling-3',
          ask: 'In the figure, set temperature to 2 with no cuts. `moon` goes from 0.02 to about 0.06, and the three least likely tokens together reach about 0.2. What does that mean for a long generated text?',
          options: [
            'Nothing: these tokens are still unlikely',
            'About one token in five would come from the tail, and a single odd token can send everything after it off course',
            'The text becomes more repetitive',
            'The model becomes slower',
          ],
          answer: 1,
          why: 'Rare per step is not rare per text: over a few hundred tokens, tail draws are certain. Every sampled token becomes input for the next step, so one strange choice is built on. This is why a high temperature is nearly always paired with top-p or top-k.',
        },
        {
          kind: 'output',
          id: 'transformers-sampling-4',
          ask: 'The probability of the top token at two temperatures. What does this print?',
          code: `import numpy as np

def softmax(z):
    e = np.exp(z - z.max())
    return e / e.sum()

logits = np.array([2.0, 1.0, 0.0])
print(round(float(softmax(logits / 1.0)[0]), 2), round(float(softmax(logits / 0.5)[0]), 2))`,
          answer: '0.67 0.87',
          why: 'At T = 1 the logits are 2, 1, 0 and the top token gets e² / (e² + e + 1) ≈ 0.67. At T = 0.5 they become 4, 2, 0 and it gets about 0.87. The order of the tokens never changes, only how much the favourite leads.',
        },
        {
          kind: 'bug',
          id: 'transformers-sampling-5',
          ask: 'Sampling with a temperature. Lowering the temperature makes the output more random, not less.',
          code: `def sample(logits, temperature, rng):
    # logits: (vocab,) array
    z = logits * temperature
    z = z - z.max()
    probs = np.exp(z) / np.exp(z).sum()
    return rng.choice(len(probs), p=probs)`,
          line: 3,
          fix: '    z = logits / temperature',
          why: 'Multiplying by a temperature below 1 shrinks the gaps between logits and flattens the distribution: the opposite of what is wanted. The logits are divided by the temperature, so that a small T makes large gaps.',
        },
        {
          kind: 'write',
          id: 'transformers-sampling-6',
          ask: 'Turn a list of logits into probabilities at a given temperature, without NumPy. Temperature 0 means greedy: all the probability on the largest logit. It must not overflow.',
          starter: `import math

def token_probs(logits, temperature):
    # divide by the temperature, then softmax
    # temperature 0: probability 1 for the largest logit
    pass`,
          solution: `import math

def token_probs(logits, temperature):
    if temperature == 0:
        top = logits.index(max(logits))
        return [1.0 if i == top else 0.0 for i in range(len(logits))]
    scaled = [z / temperature for z in logits]
    top = max(scaled)
    exps = [math.exp(z - top) for z in scaled]
    total = sum(exps)
    return [e / total for e in exps]`,
          tests: `out = token_probs([2.0, 1.0, 0.0], 1.0)
assert out is not None, "the function returns nothing yet"
assert abs(sum(out) - 1) < 1e-9, "the probabilities should add up to 1"
assert abs(out[0] - 0.6652) < 1e-3, f"at temperature 1 the first token should get about 0.665, got {out[0]}"
out = token_probs([2.0, 1.0, 0.0], 0.5)
assert abs(out[0] - 0.8668) < 1e-3, f"at temperature 0.5 the first token should get about 0.867: divide the logits by the temperature, got {out[0]}"
out = token_probs([2.0, 1.0, 0.0], 2.0)
assert abs(out[0] - 0.5065) < 1e-3, "at temperature 2 the distribution should be flatter: about 0.506 for the first token"
try:
    out = token_probs([1.0, 3.0, 2.0], 0)
except ZeroDivisionError:
    raise AssertionError("temperature 0 divides by zero: treat it as greedy")
assert out == [0.0, 1.0, 0.0], f"temperature 0 should put everything on the largest logit, got {out}"
try:
    out = token_probs([1000.0, 0.0], 0.5)
except OverflowError:
    raise AssertionError("overflow on large logits: subtract the largest scaled logit before exponentiating")
assert abs(out[0] - 1) < 1e-9, "a logit 1000 above the rest should get probability 1"`,
          why: 'Scale, subtract the maximum, exponentiate, normalise. The special case for 0 is how every library handles it: greedy is the limit of the formula as the temperature shrinks, but the formula itself cannot be evaluated there.',
        },
        {
          kind: 'bug',
          id: 'transformers-sampling-7',
          ask: 'Top-k filtering. With k = 5 the model produces only very strange tokens.',
          code: `def top_k(probs, k):
    # probs: (vocab,) array that adds up to 1
    keep = np.argsort(probs)[:k]
    out = np.zeros_like(probs)
    out[keep] = probs[keep]
    return out / out.sum()`,
          line: 3,
          fix: '    keep = np.argsort(probs)[-k:]',
          why: '`argsort` orders from smallest to largest, so the first k indices are the k least likely tokens. The most likely ones are at the end. The code runs without error and returns a valid distribution, over exactly the wrong tokens.',
        },
        {
          kind: 'output',
          id: 'transformers-sampling-8',
          ask: 'How many tokens top-p keeps for a model that is sure and for one that is not. What does this print?',
          code: `def nucleus_size(probs, p):
    total = 0.0
    for n, q in enumerate(sorted(probs, reverse=True), start=1):
        total += q
        if total >= p:
            return n

print(nucleus_size([0.92, 0.04, 0.02, 0.02], 0.9), nucleus_size([0.25, 0.25, 0.25, 0.25], 0.9))`,
          answer: '1 4',
          why: 'When one token holds 0.92, it alone reaches 0.9. When four tokens share the probability equally, all four are needed. Top-k with k = 2 would have kept two in both cases: a junk token in the first, and half the reasonable ones thrown away in the second.',
        },
        {
          kind: 'write',
          id: 'transformers-sampling-9',
          ask: 'Write top-p filtering without NumPy. Keep the most likely tokens, in order, until their probabilities add up to at least `p`. Set the rest to 0 and scale what is left to add up to 1. Keep the tokens in their original positions.',
          starter: `def top_p(probs, p):
    # probs: a list that adds up to 1, in any order
    # return a list of the same length
    pass`,
          solution: `def top_p(probs, p):
    order = sorted(range(len(probs)), key=lambda i: probs[i], reverse=True)
    keep = []
    total = 0.0
    for i in order:
        keep.append(i)
        total += probs[i]
        if total >= p:
            break
    out = [0.0] * len(probs)
    for i in keep:
        out[i] = probs[i] / total
    return out`,
          tests: `out = top_p([0.1, 0.5, 0.15, 0.25], 0.7)
assert out is not None, "the function returns nothing yet"
assert len(out) == 4, "return a list of the same length as the input"
assert out[0] == 0 and out[2] == 0, f"0.5 and 0.25 already reach 0.7, so the other two should be 0, got {out}"
assert abs(out[1] - 2 / 3) < 1e-9 and abs(out[3] - 1 / 3) < 1e-9, f"the survivors 0.5 and 0.25 should be scaled to 2/3 and 1/3, in their original places, got {out}"
out = top_p([0.1, 0.5, 0.15, 0.25], 0.5)
assert out == [0.0, 1.0, 0.0, 0.0], f"0.5 alone reaches p = 0.5, so only it survives, got {out}"
out = top_p([0.1, 0.5, 0.15, 0.25], 0.8)
assert out[0] == 0 and out[2] > 0, "0.5 + 0.25 = 0.75 is short of 0.8, so the third most likely token is needed too"
assert abs(sum(out) - 1) < 1e-9, "the result should add up to 1"
out = top_p([0.25, 0.25, 0.5], 1.0)
assert all(abs(a - b) < 1e-9 for a, b in zip(out, [0.25, 0.25, 0.5])), "p = 1 should keep everything"`,
          why: 'Sort by probability, walk down until the running total reaches p, and renormalise. The token that crosses the line is kept, so at least one token always survives.',
        },
        {
          kind: 'choice',
          id: 'transformers-sampling-10',
          ask: 'A code-completion model run greedily starts printing the same line over and over. A colleague suggests a strong repetition penalty. What is the catch?',
          options: [
            'Repetition penalties only work at temperature 0',
            'Code repeats legitimately (variable names, brackets, keywords), so a strong penalty pushes the model away from correct tokens',
            'A penalty makes generation much slower',
            'There is no catch',
          ],
          answer: 1,
          why: 'A penalty lowers the logit of every token already used, whether or not repeating it is right. In code and structured output most repetition is right. Try a small amount of sampling, or a stop condition, before a heavy penalty.',
        },
        {
          kind: 'choice',
          id: 'transformers-sampling-11',
          ask: 'A test calls a hosted model at temperature 0 and compares the reply with a stored string. It passes for weeks and then fails now and then. What is the most likely cause?',
          options: [
            'Temperature 0 samples at random from the top two tokens',
            'Tiny numerical differences between runs or servers flipped a near-tie between two tokens, and the text went a different way from there',
            'The tokeniser is random',
            'The model has learned from your earlier requests',
          ],
          answer: 1,
          why: 'Greedy decoding is only as repeatable as the logits. Different hardware, batching or a quiet model update change them in the last decimals, which is enough when two tokens are almost level. Assert on parsed fields or on meaning, pin the model version, and cache replies where you need the same answer twice.',
        },
        {
          kind: 'choice',
          id: 'transformers-sampling-12',
          ask: 'You extract invoice numbers and totals from documents into JSON. Which decoding settings are the sensible start?',
          options: [
            'Temperature 1.2, so that the model considers more options',
            'Temperature 0 or close to it: there is one right answer and variety has no value',
            'Top-k of 50,000',
            'A strong repetition penalty, so that no digit appears twice',
          ],
          answer: 1,
          why: 'For extraction the most probable token is what you want at every step, and sampling only adds ways to be wrong. A repetition penalty would be harmful here: invoice numbers repeat digits.',
        },
      ],
    },
    {
      id: 'transformers-context',
      title: 'Context windows, cost and latency',
      summary: 'Why long prompts are expensive, why output is slow, and what to do when the text does not fit.',
      text: [
        'The **context window** is the largest number of tokens a model can work over, and the prompt and the generated output share it. A request for 7,800 prompt tokens to a model with an 8,000-token window leaves room for 200 output tokens, whatever maximum you asked for.',
        'Attention compares every token with every other: T × T scores for each head in each layer. Double the length and that part of the work and memory goes up four times. This is why windows were small for years, and why long prompts are slow and costly even when they fit.',
        'Generation makes it worse in principle: each new token needs the model to be run again. The **KV cache** is what makes it bearable. Under a causal mask, the keys and values of earlier tokens do not depend on later ones, so they are computed once and kept. A new token then computes its own query, key and value and attends over the stored ones: work proportional to T for each new token, not T². The price is memory that grows with the length. **Prompt caching** in hosted APIs is the same idea across requests: a prefix that is identical to an earlier request can be reused, so stable text belongs at the start and whatever changes at the end.',
        { code: `latency ≈ time to first token + output tokens ÷ tokens per second
cost    ≈ input tokens × input price + output tokens × output price` },
        'Input tokens are processed together in one pass. Output tokens come one at a time, each needing its own pass. So output is the slow part, and providers charge several times more for an output token than for an input one. **Time to first token** grows with the length of the prompt. After that, text arrives at a steady **tokens per second**. Streaming shows the tokens as they are produced: the total time is the same, but the wait before anything appears is much shorter.',
        'When the text does not fit: count tokens with the real tokeniser and reserve room for the answer. Then cut (keep the system prompt and the most recent turns), select (send only the passages that matter), or condense (summarise older material, or summarise in pieces and then summarise the summaries). A larger window is the fourth option, not the first: it costs more, is slower, and models tend to use material in the middle of a very long context less reliably than material at the start and the end.',
      ],
      rules: [
        'Prompt and output share one window. Leave room for the answer.',
        'Attention cost grows with T²: twice the length, four times the work.',
        'The KV cache makes each new token cost about T, at the price of memory.',
        'Cached prefixes must match exactly: stable text first, changing text last.',
        'Latency ≈ time to first token + output tokens ÷ tokens per second.',
        'Too long: count, then cut, select or condense before reaching for a larger window.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'transformers-context-1',
          ask: 'A model has a context window of 8,000 tokens. Your prompt is 7,800 tokens and you ask for up to 1,000 output tokens. At most how many output tokens can you get?',
          answer: 200,
          tol: 0,
          check: '8000 - 7800',
          why: 'Input and output share the window: 8,000 − 7,800 = 200. Depending on the API the request is rejected or the answer stops mid-sentence. Budget the output before you fill the prompt.',
        },
        {
          kind: 'number',
          id: 'transformers-context-2',
          ask: 'A prompt grows from 1,000 tokens to 4,000. By what factor does the number of attention scores in each layer grow?',
          answer: 16,
          tol: 0,
          check: '(4000 / 1000) ** 2',
          why: 'The score matrix is T × T. Four times the length is 4² = 16 times the scores. The MLPs and the rest grow only four times, so on long inputs attention comes to dominate.',
        },
        {
          kind: 'output',
          id: 'transformers-context-3',
          ask: 'Attention scores needed to generate two tokens after a prompt of 10, with and without a KV cache. What does this print?',
          code: `prompt, new = 10, 2

# no cache: for each new token the whole sequence so far is recomputed
without = sum((prompt + i) ** 2 for i in range(1, new + 1))
# cache: only the newest token attends, over everything so far
with_cache = sum(prompt + i for i in range(1, new + 1))
print(without, with_cache)`,
          answer: '265 23',
          why: 'Without a cache: 11² + 12² = 265. With one: 11 + 12 = 23. The gap widens with length, which is why every serious implementation caches keys and values.',
        },
        {
          kind: 'choice',
          id: 'transformers-context-4',
          ask: 'Why is it valid to reuse the keys and values of earlier tokens when a new token is appended?',
          options: [
            'Because of the causal mask, an earlier token never attends to a later one, so nothing computed for it can change',
            'Because keys and values are the same for every token',
            'Because the new token is ignored by the earlier layers',
            'It is an approximation that loses a little accuracy',
          ],
          answer: 0,
          why: 'Position i depends only on positions 0 to i, in every layer. Appending token i + 1 changes nothing that was computed for the earlier ones, so the cache is exact. In an encoder without a causal mask, every vector would change and nothing could be reused.',
        },
        {
          kind: 'choice',
          id: 'transformers-context-5',
          ask: 'Every request to your service contains the same 20,000-token manual and a different user question. The provider offers prompt caching. How should you lay out the prompt?',
          options: [
            'Question first, then the manual',
            'The manual first, unchanged from request to request, and the question at the end',
            'Mix the question into the middle of the manual',
            'It makes no difference: caching matches text wherever it is',
          ],
          answer: 1,
          why: 'A cached prefix is only reused while the tokens match exactly from the start. With the question first, the first tokens differ on every request and nothing after them can be reused. A timestamp at the top of a system prompt has the same effect.',
        },
        {
          kind: 'number',
          id: 'transformers-context-6',
          ask: 'A model takes 0.5 seconds to produce its first token and then writes 50 tokens per second. About how long does a 400-token answer take, in seconds?',
          answer: 8.5,
          tol: 0.1,
          check: '0.5 + 400 / 50',
          why: '0.5 + 400 ÷ 50 = 8.5 seconds, of which 8 are the output. To make it faster, ask for a shorter answer: trimming the prompt would save a fraction of the half second.',
        },
        {
          kind: 'output',
          id: 'transformers-context-7',
          ask: 'The price of one request. What does this print?',
          code: `price_in, price_out = 3.0, 15.0          # dollars per million tokens
tokens_in, tokens_out = 20_000, 1_000

cost_in = tokens_in * price_in / 1_000_000
cost_out = tokens_out * price_out / 1_000_000
print(round(cost_in, 3), round(cost_out, 3))`,
          answer: '0.06 0.015',
          why: 'Six cents for the input and one and a half for the output. An output token costs five times as much here, but there are twenty times as many input tokens, so the prompt is where the money goes. Work out which side dominates before you optimise.',
        },
        {
          kind: 'choice',
          id: 'transformers-context-8',
          ask: 'Users complain that your assistant "thinks" for 4 seconds before any text appears, although the text then streams quickly. Where should you look first?',
          options: [
            'The maximum number of output tokens',
            'The size of the prompt: time to first token grows with the input the model has to process',
            'The temperature',
            'The repetition penalty',
          ],
          answer: 1,
          why: 'Before the first token, the model has to read the whole prompt (and the request has to wait its turn). Output length only affects what happens after that. Shorten or cache the prompt, or use a smaller model.',
        },
        {
          kind: 'choice',
          id: 'transformers-context-9',
          ask: 'You switch a chat interface from waiting for the complete reply to streaming. What changes?',
          options: [
            'The total time to the last token is much shorter',
            'The total time is about the same, but the user sees the first words after the time to first token and can start reading',
            'The reply costs fewer tokens',
            'The model becomes more accurate',
          ],
          answer: 1,
          why: 'Streaming changes when the tokens are shown, not how fast they are made. It improves the wait that people notice. It does nothing for a program that needs the whole reply before it can continue.',
        },
        {
          kind: 'bug',
          id: 'transformers-context-10',
          ask: 'This trims a chat history to fit the context window. On long conversations the reply is cut off after a few words, or the request is rejected.',
          code: `def fit(system_ids, history_ids, window, max_output):
    # keep the system prompt and the most recent part of the history
    budget = window - len(system_ids)
    start = max(0, len(history_ids) - budget)
    return system_ids + history_ids[start:]`,
          line: 3,
          fix: '    budget = window - len(system_ids) - max_output',
          why: 'The prompt was allowed to fill the whole window, which leaves nothing for the answer. The output has to be subtracted from the budget before the history is cut.',
        },
        {
          kind: 'write',
          id: 'transformers-context-11',
          ask: 'A chat history is a list of messages with known token counts, oldest first. Return how many of the most recent messages fit into a token budget. Messages are kept whole, and the kept ones must be consecutive.',
          starter: `def recent_that_fit(lengths, budget):
    # lengths: token counts of the messages, oldest first
    # return the number of most recent messages that fit
    pass`,
          solution: `def recent_that_fit(lengths, budget):
    kept = 0
    used = 0
    for n in reversed(lengths):
        if used + n > budget:
            break
        used += n
        kept += 1
    return kept`,
          tests: `out = recent_that_fit([100, 200, 50], 250)
assert out is not None, "the function returns nothing yet"
assert out == 2, f"with a budget of 250 the last two messages (200 + 50) fit and the oldest does not, got {out}"
assert recent_that_fit([100, 200, 50], 1000) == 3, "when everything fits, keep all the messages"
assert recent_that_fit([500], 100) == 0, "a single message that is too long gives 0"
assert recent_that_fit([], 100) == 0, "no messages gives 0"
assert recent_that_fit([50, 200, 100], 250) == 1, "count from the newest end: only the last message (100) fits before 200 breaks the budget"
assert recent_that_fit([300, 10, 10, 400], 420) == 3, "a total exactly equal to the budget still fits"
assert recent_that_fit([10, 400, 50], 100) == 1, "stop at the first message that does not fit: skipping it would leave a hole in the conversation"`,
          why: 'Walk backwards from the newest message and stop at the first one that would break the budget. Dropping the oldest turns first is the usual policy, because recent turns matter most to the next reply. The system prompt is budgeted separately and is never dropped.',
        },
        {
          kind: 'design',
          id: 'transformers-context-12',
          ask: 'Users want to ask questions about a contract of about 200,000 tokens. Your model has a window of 128,000 tokens. Answers should arrive within a few seconds. What do you do?',
          checklist: [
            { point: 'Count the tokens with the tokeniser of the model, not from the word count', why: 'Legal text, tables and numbers can take far more tokens than the rule of thumb says.' },
            { point: 'Reserve part of the window for the answer and the instructions', why: 'Input and output share the window. A full prompt leaves no room to reply.' },
            { point: 'Split the contract into sections and send only those relevant to each question', why: 'A question usually concerns a few clauses. A shorter prompt is cheaper and faster to the first token.' },
            { point: 'For questions about the whole document, summarise the sections and then work from the summaries', why: 'Selection cannot answer "what are the main risks". Condensing in stages can.' },
            { point: 'Keep the fixed part of the prompt at the start, so that it can be cached between questions', why: 'Repeated questions about the same material then reuse the prefix.' },
            { point: 'Put the question and the key instruction at the end, close to where the answer starts', why: 'Models tend to use the middle of a very long context less reliably.' },
            { point: 'Do not treat a larger window as the fix by default', why: 'Even if the text fits, every question pays for all the tokens in money and time to first token.' },
            { point: 'Test with questions whose answers sit in different parts of the contract', why: 'It shows whether your cutting or selecting loses material before users find out.' },
          ],
          why: 'The constraint is not only the window. Cost and time to first token grow with every token sent, so the aim is to send what the question needs and no more.',
        },
      ],
    },
    {
      id: 'transformers-lab',
      title: 'Lab: a tiny language model in NumPy',
      summary: 'Build the forward pass of a one-layer, one-head language model, its loss and its sampler, one function at a time.',
      text: [
        'You are going to build a complete, very small language model: text in, next-token probabilities out, and a loop that writes text with it. It has a character tokeniser, token and position embeddings, one causal attention head with a residual connection, and an output layer that reuses the embedding matrix. It is the model from this module with every size turned down.',
        'The weights are random, so what it writes is noise. That is fine. The aim is the plumbing: after this lab you will have written every step that data goes through between a string and a sampled token, and you will know the shape at each one. Training is the same forward pass with backpropagation and an optimiser on top, which the PyTorch module covers.',
        { code: `text  --encode-->  ids (T,)
      --embed--->  x (T, d)               token row + position row
      --attend-->  x + head(x)  (T, d)    causal mask, residual
      --unembed->  logits (T, vocab)      x @ tok_emb.T
      --loss---->  one number             logits[:-1] against ids[1:]
      --sample-->  next id                temperature, top-k, rng` },
        'Each step is run separately, so a step that needs earlier functions has them written out in its starting code. Read them: they are the answers to the steps before.',
        'Keep an eye on two things all the way through: the shape of every array, and which axis each operation runs along. Almost every bug in code like this is one of those two.',
      ],
      rules: [
        'Shapes: ids `(T,)` → vectors `(T, d)` → logits `(T, vocab)`.',
        'Causality test: the output for a prefix must not change when tokens are appended.',
        'Position t of the logits is scored against token t + 1.',
        'Generation uses the last row of the logits, then appends and runs again.',
        'Pass the random generator in. Code that makes its own cannot be tested or repeated.',
      ],
      questions: [
        {
          kind: 'write',
          id: 'transformers-lab-1',
          ask: 'Step 1: a character tokeniser. `build_vocab` returns the sorted list of distinct characters in a text. `encode` turns a string into a list of ids (positions in that list) and `decode` turns ids back into a string.',
          starter: `def build_vocab(text):
    # the distinct characters, sorted
    pass

def encode(text, vocab):
    # a list of ids, one per character
    pass

def decode(ids, vocab):
    # the string those ids stand for
    pass`,
          solution: `def build_vocab(text):
    return sorted(set(text))

def encode(text, vocab):
    to_id = {ch: i for i, ch in enumerate(vocab)}
    return [to_id[ch] for ch in text]

def decode(ids, vocab):
    return "".join(vocab[i] for i in ids)`,
          tests: `vocab = build_vocab("hello world")
assert vocab is not None, "build_vocab returns nothing yet"
assert vocab == [" ", "d", "e", "h", "l", "o", "r", "w"], f"the vocabulary of 'hello world' is its 8 distinct characters, sorted, got {vocab}"
ids = encode("hello", vocab)
assert ids is not None, "encode returns nothing yet"
assert ids == [3, 2, 4, 4, 5], f"'hello' should encode to [3, 2, 4, 4, 5], got {ids}"
assert all(isinstance(i, int) for i in ids), "ids should be plain integers"
out = decode([7, 5, 6, 4, 1], vocab)
assert out is not None, "decode returns nothing yet"
assert out == "world", f"[7, 5, 6, 4, 1] should decode to 'world', got {out!r}"
assert decode(encode("low word", vocab), vocab) == "low word", "decoding an encoded string should give the string back"`,
          why: 'A tokeniser is two lookups that undo each other. Sorting makes the ids the same on every run, which matters as soon as weights are saved: the rows of the embedding table are tied to these ids.',
        },
        {
          kind: 'write',
          id: 'transformers-lab-2',
          numpy: true,
          ask: 'Step 2: the input layer. Look up the row of `tok_emb` for each id and add the row of `pos_emb` for its position (0, 1, 2, …).',
          starter: `import numpy as np

def embed(ids, tok_emb, pos_emb):
    # ids: a list of T ids
    # tok_emb: (vocab, d)   pos_emb: (max_len, d)
    # return (T, d)
    pass`,
          solution: `import numpy as np

def embed(ids, tok_emb, pos_emb):
    ids = np.asarray(ids)
    return tok_emb[ids] + pos_emb[:len(ids)]`,
          tests: `tok_emb = np.arange(12.0).reshape(4, 3)
pos_emb = 100.0 * np.arange(15.0).reshape(5, 3)
out = embed([2, 0, 2], tok_emb, pos_emb)
assert out is not None, "the function returns nothing yet"
assert out.shape == (3, 3), f"three ids and d = 3 should give shape (3, 3), got {out.shape}"
assert np.allclose(out[0], [6, 107, 208]), f"position 0 holds token 2: row [6, 7, 8] plus position row [0, 100, 200], got {out[0]}"
assert np.allclose(out[1], [300, 401, 502]), "position 1 holds token 0: row [0, 1, 2] plus position row [300, 400, 500]. Index the position table by position, not by token id"
assert not np.allclose(out[0], out[2]), "the same token at positions 0 and 2 should get different vectors"
assert embed([1], tok_emb, pos_emb).shape == (1, 3), "a single id should give shape (1, 3)"`,
          why: 'Indexing an array with a list of ids stacks the chosen rows. The first T rows of the position table are added on top. From here on the model works with a (T, d) array and never sees an id again until the output.',
        },
        {
          kind: 'write',
          id: 'transformers-lab-3',
          numpy: true,
          ask: 'Step 3: the causal mask. Return a `(T, T)` array of booleans where entry `[i, j]` is True when token i may look at token j: itself and everything before it.',
          starter: `import numpy as np

def causal_mask(T):
    # True on and below the diagonal
    pass`,
          solution: `import numpy as np

def causal_mask(T):
    return np.tril(np.ones((T, T), dtype=bool))`,
          tests: `m = causal_mask(4)
assert m is not None, "the function returns nothing yet"
assert m.shape == (4, 4), f"the mask for 4 tokens should be (4, 4), got {m.shape}"
assert m.dtype == bool, "the mask should hold booleans, so that it can be used in np.where"
assert m[2, 0] and m[2, 1] and m[2, 2], "token 2 may look at tokens 0, 1 and 2"
assert not m[2, 3], "token 2 must not look at token 3"
assert not m[0, 1] and m[1, 0], "rows are the token that looks, columns the token looked at: the lower triangle is True"
assert m.sum() == 10, "for 4 tokens there are 1 + 2 + 3 + 4 = 10 allowed pairs"
assert causal_mask(1).tolist() == [[True]], "a single token may look at itself"`,
          why: 'Row i is the token that looks and column j the token looked at, so "the past" is the lower triangle. Getting the triangle the wrong way round gives a model that can only see the future, and no error.',
        },
        {
          kind: 'write',
          id: 'transformers-lab-4',
          numpy: true,
          ask: 'Step 4: one causal attention head. Project `x` to queries, keys and values (`x @ Wq` and so on), compute scaled dot-product scores, mask them, take the softmax of each row and return the weighted sum of the values.',
          starter: `import numpy as np

def softmax(z):
    # along the last axis
    z = z - z.max(axis=-1, keepdims=True)
    e = np.exp(z)
    return e / e.sum(axis=-1, keepdims=True)

def causal_mask(T):
    return np.tril(np.ones((T, T), dtype=bool))

def attention_head(x, Wq, Wk, Wv):
    # x: (T, d)   Wq, Wk, Wv: (d, d)
    # return (T, d)
    pass`,
          solution: `import numpy as np

def softmax(z):
    z = z - z.max(axis=-1, keepdims=True)
    e = np.exp(z)
    return e / e.sum(axis=-1, keepdims=True)

def causal_mask(T):
    return np.tril(np.ones((T, T), dtype=bool))

def attention_head(x, Wq, Wk, Wv):
    Q, K, V = x @ Wq, x @ Wk, x @ Wv
    scores = Q @ K.T / np.sqrt(K.shape[-1])
    scores = np.where(causal_mask(x.shape[0]), scores, -np.inf)
    return softmax(scores) @ V`,
          tests: `rng = np.random.default_rng(0)
x = rng.normal(size=(4, 6))
Wq, Wk, Wv = (rng.normal(size=(6, 6)) for _ in range(3))
out = attention_head(x, Wq, Wk, Wv)
assert out is not None, "the function returns nothing yet"
assert out.shape == (4, 6), f"the output should have the shape of x, (4, 6), got {out.shape}"
assert np.allclose(out[0], (x @ Wv)[0]), "the first token can only attend to itself, so its output is its own value vector"
x2 = x.copy()
x2[3] += 5.0
assert np.allclose(attention_head(x2, Wq, Wk, Wv)[:3], out[:3]), "changing the last token changed earlier outputs: the causal mask is missing or the wrong way round"
I = np.eye(2)
out = attention_head(I, 2 * I, 2 * I, I)
assert abs(out[1, 1] - 0.9442) < 1e-3, f"divide the scores by sqrt(d_k): the second token should give itself a weight of 0.944 here, got {out[1, 1]:.3f}"
assert np.allclose(out.sum(axis=1), 1), "with these values each output row is the weights themselves, and they must add up to 1"`,
          why: 'The second test is the one to remember: change a later token and check that earlier outputs do not move. It tests causality without knowing anything about the weights, and it works on a full model as well as on one head.',
        },
        {
          kind: 'write',
          id: 'transformers-lab-5',
          numpy: true,
          ask: 'Step 5: the forward pass. Embed the ids, add the output of the attention head to the embeddings (a residual connection), and turn each vector into one logit per vocabulary entry by multiplying with the transposed token embedding matrix.',
          starter: `import numpy as np

def softmax(z):
    z = z - z.max(axis=-1, keepdims=True)
    e = np.exp(z)
    return e / e.sum(axis=-1, keepdims=True)

def embed(ids, tok_emb, pos_emb):
    return tok_emb[np.asarray(ids)] + pos_emb[:len(ids)]

def attention_head(x, Wq, Wk, Wv):
    Q, K, V = x @ Wq, x @ Wk, x @ Wv
    scores = Q @ K.T / np.sqrt(K.shape[-1])
    allowed = np.tril(np.ones(scores.shape, dtype=bool))
    return softmax(np.where(allowed, scores, -np.inf)) @ V

def forward(ids, p):
    # p: a dict with tok_emb (vocab, d), pos_emb (max_len, d), Wq, Wk, Wv (d, d)
    # return logits of shape (T, vocab)
    pass`,
          solution: `import numpy as np

def softmax(z):
    z = z - z.max(axis=-1, keepdims=True)
    e = np.exp(z)
    return e / e.sum(axis=-1, keepdims=True)

def embed(ids, tok_emb, pos_emb):
    return tok_emb[np.asarray(ids)] + pos_emb[:len(ids)]

def attention_head(x, Wq, Wk, Wv):
    Q, K, V = x @ Wq, x @ Wk, x @ Wv
    scores = Q @ K.T / np.sqrt(K.shape[-1])
    allowed = np.tril(np.ones(scores.shape, dtype=bool))
    return softmax(np.where(allowed, scores, -np.inf)) @ V

def forward(ids, p):
    x = embed(ids, p["tok_emb"], p["pos_emb"])
    x = x + attention_head(x, p["Wq"], p["Wk"], p["Wv"])
    return x @ p["tok_emb"].T`,
          tests: `rng = np.random.default_rng(1)
vocab, d, max_len = 7, 4, 10
p = {"tok_emb": rng.normal(size=(vocab, d)), "pos_emb": rng.normal(size=(max_len, d)),
     "Wq": rng.normal(size=(d, d)), "Wk": rng.normal(size=(d, d)), "Wv": rng.normal(size=(d, d))}
ids = [3, 1, 4, 1, 5]
logits = forward(ids, p)
assert logits is not None, "the function returns nothing yet"
assert logits.shape == (5, 7), f"5 tokens and a vocabulary of 7 should give logits of shape (5, 7), got {logits.shape}"
assert np.allclose(forward(ids[:3], p), logits[:3]), "the logits of the first three positions must not depend on later tokens"
x = embed(ids, p["tok_emb"], p["pos_emb"])
q = dict(p, Wv=np.zeros((d, d)))
assert np.allclose(forward(ids, q), x @ p["tok_emb"].T), "with the values set to zero attention adds nothing, and the residual connection should carry the embeddings straight to the output"
assert not np.allclose(logits, x @ p["tok_emb"].T), "the attention output is not being added to the stream"
assert not np.allclose(logits[1], logits[3]), "token 1 appears at positions 1 and 3 and should get different logits there"`,
          why: 'Three lines: embed, add attention, unembed. The prefix test is the causality check from step 4 applied to the whole model, and it is also the property the KV cache relies on. A real model repeats the middle line many times, with an MLP and normalisation in each round.',
        },
        {
          kind: 'write',
          id: 'transformers-lab-6',
          numpy: true,
          ask: 'Step 6: the next-token loss. Position t of the logits predicts token t + 1. Return the mean cross-entropy over the T − 1 positions that have a next token, as a float.',
          starter: `import numpy as np

def lm_loss(logits, ids):
    # logits: (T, vocab)   ids: the T ids that were fed in
    # log-softmax of each row, pick the log-probability of the next token, average, negate
    pass`,
          solution: `import numpy as np

def lm_loss(logits, ids):
    logits = logits[:-1]
    targets = np.asarray(ids)[1:]
    z = logits - logits.max(axis=-1, keepdims=True)
    log_probs = z - np.log(np.exp(z).sum(axis=-1, keepdims=True))
    return float(-log_probs[np.arange(len(targets)), targets].mean())`,
          tests: `ids = [0, 1, 2, 3]
out = lm_loss(np.zeros((4, 5)), ids)
assert out is not None, "the function returns nothing yet"
assert abs(out - np.log(5)) < 1e-9, f"equal logits over 5 tokens should give a loss of ln(5) = 1.609, got {out}"
right = np.zeros((4, 5))
for t in range(3):
    right[t, ids[t + 1]] = 50.0
assert lm_loss(right, ids) < 1e-6, "logits that put all the weight on the next token should give a loss near 0"
copy = np.zeros((4, 5))
for t in range(4):
    copy[t, ids[t]] = 50.0
assert lm_loss(copy, ids) > 10, "logits that predict the current token should give a large loss: compare position t with token t + 1"
last = right.copy()
last[3, 0] = 50.0
assert abs(lm_loss(last, ids) - lm_loss(right, ids)) < 1e-12, "the last position has no next token and must not count"
big = lm_loss(1000.0 * right, ids)
assert np.isfinite(big), "large logits overflow: subtract the row maximum before exponentiating"`,
          why: 'Drop the last row of the logits and the first id, and the two line up. Working with log-probabilities directly, in place of taking the log of a softmax, keeps the loss finite when a logit is large. An untrained model should score close to ln(vocab).',
        },
        {
          kind: 'write',
          id: 'transformers-lab-7',
          numpy: true,
          ask: 'Step 7: the sampler. Given the logits of one position, divide by the temperature, keep the `k` largest, take the softmax and draw one id with `rng.choice`. Temperature 0 means greedy. Return a plain int.',
          starter: `import numpy as np

def sample(logits, temperature, k, rng):
    # logits: (vocab,)   rng: a np.random.Generator
    # temperature 0: return the index of the largest logit
    pass`,
          solution: `import numpy as np

def sample(logits, temperature, k, rng):
    if temperature == 0:
        return int(np.argmax(logits))
    z = logits / temperature
    cutoff = np.sort(z)[-k]
    z = np.where(z >= cutoff, z, -np.inf)
    probs = np.exp(z - z.max())
    probs = probs / probs.sum()
    return int(rng.choice(len(probs), p=probs))`,
          tests: `logits = np.log(np.array([0.15, 0.5, 0.05, 0.3]))
rng = np.random.default_rng(0)
out = sample(logits, 1.0, 4, rng)
assert out is not None, "the function returns nothing yet"
assert isinstance(out, int), "return a plain int, for example int(rng.choice(...))"
assert sample(logits, 0, 4, rng) == 1, "temperature 0 is greedy: return the index of the largest logit"
assert all(sample(logits, 1.0, 1, rng) == 1 for _ in range(50)), "with k = 1 only the most likely token can be drawn"
draws = [sample(logits, 1.0, 2, rng) for _ in range(500)]
assert set(draws) == {1, 3}, f"with k = 2 only tokens 1 and 3 should ever appear, got {sorted(set(draws))}"
share = draws.count(1) / len(draws)
assert abs(share - 0.625) < 0.07, f"after the cut, token 1 should be drawn about 0.5 / 0.8 = 62% of the time, got {share:.2f}"
draws = [sample(logits, 1.0, 4, rng) for _ in range(3000)]
assert abs(draws.count(1) / 3000 - 0.5) < 0.04, "at temperature 1 with no cut, token 1 should be drawn about half the time"
draws = [sample(logits, 0.5, 4, rng) for _ in range(3000)]
assert abs(draws.count(1) / 3000 - 0.685) < 0.04, "at temperature 0.5 token 1 should be drawn about 68% of the time: divide the logits by the temperature before the softmax"
a = [sample(logits, 1.0, 4, np.random.default_rng(7)) for _ in range(5)]
b = [sample(logits, 1.0, 4, np.random.default_rng(7)) for _ in range(5)]
assert a == b, "use the rng that is passed in, so that the same seed gives the same draws"`,
          why: 'Setting the cut logits to −∞ before the softmax removes them and renormalises in one step. Taking the generator as an argument is what makes the function testable: the caller decides the seed, and the same seed gives the same text.',
        },
        {
          kind: 'bug',
          id: 'transformers-lab-8',
          ask: 'Step 8: the generation loop, using `forward` and `sample` from the steps before. It runs, but what it writes ignores everything except the first token of the prompt.',
          code: `def generate(ids, n_new, p, rng, temperature=0.8, k=5):
    ids = list(ids)
    for _ in range(n_new):
        logits = forward(ids, p)             # (T, vocab)
        next_id = sample(logits[0], temperature, k, rng)
        ids.append(next_id)
    return ids`,
          line: 5,
          fix: '        next_id = sample(logits[-1], temperature, k, rng)',
          why: 'Row t of the logits is the prediction for the token after position t. The next token of the whole sequence comes from the last row. Row 0 is the prediction made after seeing only the first token, so every new token was drawn from the same distribution.',
        },
        {
          kind: 'design',
          id: 'transformers-lab-9',
          ask: 'Step 9: your model runs and writes noise. List what separates it from a small GPT that writes sensible text, roughly in the order you would add things.',
          checklist: [
            { point: 'A training loop: backpropagate the next-token loss and update the weights, on batches of text', why: 'The weights are random. Everything else is secondary until the loss goes down.' },
            { point: 'An MLP after the attention, with its own residual connection', why: 'Attention only mixes vectors. The MLP is where most of the computation and most of the weights are.' },
            { point: 'Layer normalisation before each part and before the output', why: 'Without it a deeper stack is hard to train.' },
            { point: 'Several heads, and several blocks stacked', why: 'One head in one layer can express one simple relation. Depth lets later layers build on earlier ones.' },
            { point: 'A subword tokeniser in place of characters', why: 'Sequences become several times shorter, so the same window covers far more text.' },
            { point: 'A batch axis and padding masks', why: 'Training one sequence at a time wastes the hardware.' },
            { point: 'A KV cache in the generation loop', why: 'Your loop recomputes the whole sequence for every new token: work that grows with T² per token.' },
            { point: 'A held-out text to report loss or perplexity on', why: 'Training loss alone cannot tell learning from memorising.' },
          ],
          why: 'Nothing on the list changes the path you built: ids, vectors, attention, logits, loss, sample. A production model is this pipeline with more of each part and a great deal of training.',
        },
      ],
    },
  ],
}
