import type { Block } from '../../types'

/** The full theory for each lesson of the mlops module, keyed by lesson id. */
export const mlopsTheory: Record<string, Block[]> = {
  'mlops-reproducible': [
    { h: 'Why a run must be repeatable' },
    'A **training run** is one execution of your training script: it reads data, fits a model and reports a score. A run is **reproducible** when you, or a colleague, can run it again months later and get the same model and the same score.',
    'If you cannot repeat a run, you cannot debug it, you cannot tell whether a new idea beat the old one, and you cannot defend a number you reported.',
    { sub: 'The five ingredients of a run' },
    'Every run is decided by five things. Lose one and you are guessing.',
    {
      list: [
        '**Code**: the exact version of your scripts, usually a git **commit hash** (a short id such as `a41c9e0` that names one saved state of the code).',
        '**Data**: the exact rows used for training and validation.',
        '**Configuration** (config): the settings, such as the learning rate, the number of layers or the share of data kept for validation.',
        '**Environment**: the Python version and every library with its exact version number.',
        '**Seed**: the starting number for the random draws made along the way.',
      ],
    },

    { h: 'Seeds and random generators' },
    'Training uses randomness: shuffling rows, starting weights, dropout, sampling. A **random number generator** produces a long, fixed sequence of numbers that look random. The **seed** picks where that sequence starts.',
    { sub: 'A seed fixes the sequence, not each draw' },
    'Each draw from a generator moves along its sequence, so the second draw differs from the first. To get the first numbers again, make a fresh generator with the same seed.',
    {
      code: `import numpy as np

rng = np.random.default_rng(42)
print(rng.integers(0, 10, size=3))
print(rng.integers(0, 10, size=3))
rng = np.random.default_rng(42)
print(rng.integers(0, 10, size=3))`,
      out: `[0 7 6]
[4 4 8]
[0 7 6]`,
    },
    '`np.random.default_rng(42)` makes a generator seeded with 42, and `rng.integers(0, 10, size=3)` draws three whole numbers from 0 to 9. The third line matches the first because the generator was made again.',
    { sub: 'Own your generator' },
    "Python's `random` module and NumPy each have one **global generator** shared by all code in the program. Functions such as `random.shuffle` use it. Any library can draw from it or reseed it, and unless someone seeds it, it starts from the clock. Create your own generator from a seed and use that object for every draw.",
    {
      code: `import random

rows = ['a', 'b', 'c', 'd', 'e', 'f']
rng = random.Random(3)
rng.shuffle(rows)
print(rows)`,
      out: `['a', 'c', 'd', 'f', 'e', 'b']`,
    },
    "`random.Random(3)` is a private generator seeded with 3. `rng.shuffle(rows)` reorders the list in place with it. A common bug is to create `rng` and then call `random.shuffle(rows)` by habit, which uses the global generator instead. `shuffle` changes the list you pass in, so copy it first with `list(rows)` if the caller's list must keep its order.",
    { sub: 'What a seed does not promise' },
    'A seed repeats a run on the same machine and library versions. It does not promise identical numbers on different hardware. Computers round decimal results, and the rounding depends on the order of the additions. In Python, `0.1 + 0.2 + 0.3` gives `0.6000000000000001` while `0.3 + 0.2 + 0.1` gives `0.6`. A GPU adds numbers in a different order from a laptop CPU, so a loss can differ in the fourth or fifth decimal place. That is normal: compare within a small tolerance.',

    { h: 'Pinning the environment' },
    'A file such as `requirements.txt` lists the libraries a project needs. A line like `scipy>=1.9` means "any version from 1.9 upwards", so each fresh install gets whatever is newest. A newer version may change defaults or algorithms, and your score moves though your code did not.',
    'To **pin** a version is to write the exact one: `scipy==1.11.4`. A **lock file** pins every library, including the ones your libraries need. A **container image** (built with a tool such as Docker) freezes the whole system, Python included. Store which one each run used.',

    { h: 'Configuration in a file' },
    'Settings typed once on the command line or in a notebook cell are lost. Put them in a **config file**. A run loads the file, then applies **overrides** (changes given for this run only, for example a different learning rate on the command line). The result is the **resolved config**: what the run really used.',
    'Record the resolved config, not the file. If the file says a batch size of 32 and you override it to 128, the record must say 128.',
    { sub: 'A fingerprint for a config' },
    "A **hash function** turns any text into a short fixed-length string of hex digits (0 to 9 and a to f) called a **digest**. The same text always gives the same digest, and a tiny change gives a different one. Hashing a config gives a **fingerprint**: equal fingerprints mean equal settings. A dict must first become text, which `json.dumps` does. Two dicts with the same keys in a different order produce different text unless you pass `sort_keys=True`.",
    {
      code: `import hashlib, json

cfg = {'seed': 7, 'batch': 64}
text = json.dumps(cfg, sort_keys=True)
print(text)
print(hashlib.sha256(text.encode()).hexdigest()[:12])`,
      out: `{"batch": 64, "seed": 7}
871b6a3d9e98`,
    },
    '`.encode()` turns text into bytes, which hash functions take. `sha256` is a standard hash function, and `[:12]` keeps the first 12 characters of the digest.',

    { h: 'Versioning data and models' },
    'A table name such as `sales.daily` is not a version if the table is rebuilt nightly: the name points at different rows each day. Train from an **immutable snapshot** (a dated copy never changed) or record a **content hash** of the data. Store the trained model with its own version or hash too.',
    '**Experiment trackers** such as MLflow store the config and metrics of each run, DVC versions data, and a **model registry** keeps every trained model with its version. The habit matters more than the tool.',
    { sub: 'A split that never moves a user' },
    'Growing data causes a quiet problem. Shuffle all rows with a fixed seed and take 20% as validation. Next week, with new rows added, everyone lands in a new position. A user from validation may now be in training, so the model is tested on people it learned from. This is **leakage**.',
    'The fix is to decide by a hash of the user id. Hash the id, turn the hex digest into an integer with `int(digest, 16)` (16 because hex is base 16), and take the remainder after dividing by 100 with `% 100`. That gives a **bucket** from 0 to 99 that depends only on the id. Put the user in validation when the bucket is below the chosen share times 100.',
    {
      code: `import hashlib

for key in ['alice', 'bob', 'carol']:
    digest = hashlib.md5(key.encode()).hexdigest()
    bucket = int(digest, 16) % 100
    print(key, bucket, bucket < 30)`,
      out: `alice 0 True
bob 32 False
carol 56 False`,
    },
    "With a share of 0.3, buckets 0 to 29 go to validation. Raising the share only adds buckets, so no user ever moves out. Use `hashlib`, not Python's built-in `hash()`: for strings, `hash()` gives a different value in each new Python process.",

    { h: 'Mistakes to watch for' },
    {
      list: [
        'Creating a seeded generator, then calling the global `random` functions anyway.',
        'Calling `>=` ranges in the requirements a record.',
        'Hashing a dict written out without a fixed key order.',
        'Forgetting uncommitted code changes, how the split was made, where the model is stored and which hardware ran it.',
      ],
    },
  ],

  'mlops-serving': [
    { h: 'What serving means' },
    'Training gives you a model. **Serving** is how its predictions reach whatever uses them: a web page, an email campaign, an alarm on a factory floor. The same model can be served in very different ways, and the choice decides cost, freshness and how hard the system is to run.',
    { sub: 'Three patterns' },
    {
      list: [
        '**Batch**: a scheduled job scores everything at once (say, every night) and writes the results to a table. Whoever needs a prediction looks it up. Cheap, easy to rerun and check, but each prediction is as old as the last run.',
        '**Online**: a service waits for requests and answers each one as it arrives, with the freshest inputs. Someone is waiting, so it has a **latency budget**: the most time an answer may take.',
        '**Streaming**: events (clicks, sensor readings, payments) flow onto a **queue**, a list that producers add to and consumers read from. A consumer scores each event within seconds. Nobody waits on a reply, but results must be quick.',
      ],
    },
    'Pick the least demanding pattern that is fresh enough. A shop that reorders stock once a week does not need a live service. A fraud check at the till does.',

    { h: 'The path of a request' },
    'An online request passes through stages: receive and check the input, fetch **features** (the inputs the model needs, often looked up in a database), **preprocess** them into the shape the model expects, run the model, **postprocess** the output (for example turn a score into a label), and send the reply.',
    'Beginners assume the model is the slow part. Often it is not. A database lookup or a call across the network can take far longer than the arithmetic. Time each stage before you optimise anything. If the lookup takes 50 of 60 ms, a model twice as fast saves only a few milliseconds.',

    { h: 'Latency and percentiles' },
    '**Latency** is the time from request to answer. It varies: most requests are quick and a few are very slow. The **mean** (add all times, divide by how many) is pulled up by the slow ones and describes no real request. The **median** is the middle value of the sorted times and ignores the tail entirely. Neither alone is enough.',
    { sub: 'Reading p50, p95 and p99' },
    'A **percentile** is a position in the sorted list. **p50** is the median. **p95** is the time that only 5% of requests take longer than. **p99** is the time that only 1% exceed. These tail percentiles tell you how bad the slow experience is.',
    'One simple way to compute a percentile is the **nearest-rank rule**: sort the n values, compute the rank `ceil(p × n / 100)` (ceil means round up to a whole number), and take the value at that rank, counting from 1. The result is always a time some request really had.',
    {
      code: `import math

times = [12, 15, 11, 14, 13, 12, 16, 11, 13, 14,
         12, 15, 13, 12, 14, 11, 13, 12, 400, 14]
ordered = sorted(times)
def nearest_rank(values, p):
    return values[math.ceil(p * len(values) / 100) - 1]
print(sum(times) / len(times), nearest_rank(ordered, 50),
      nearest_rank(ordered, 90), nearest_rank(ordered, 99))`,
      out: '32.35 13 15 400',
    },
    'Twenty requests, one slow. The mean, about 32 ms, matches no request. The median (13 ms) and p90 (15 ms) are blind to the slow one. p99 lands on it: rank ceil(19.8) = 20, the slowest. A percentile jumps only when the slow group grows past its position: if 3% of requests are slow, p99 sits inside the slow group and p95 does not. The `- 1` is because Python lists count from 0, and `sorted` leaves the original list alone.',
    { sub: 'Rare slow calls become common slow pages' },
    'A page often calls a service many times. If each call is slow with probability p, independently, the chance that one call is fast is 1 − p, and the chance that all n calls are fast is (1 − p)ⁿ. So the chance that at least one is slow is **1 − (1 − p)ⁿ**. With p = 0.02 and n = 5 that is 1 − 0.98⁵ ≈ 0.096: nearly one page in ten. This is why the tail of a service is felt by far more users than its percentage suggests.',

    { h: 'Batching for throughput' },
    '**Throughput** is how many requests a service handles per second. Models, most of all on a GPU, can process several inputs together in much less time than one after another. Suppose one input takes 6 ms and a batch of 16 takes 20 ms. One at a time, a worker handles 1 / 0.006 ≈ 167 requests a second. In batches of 16 it handles 16 / 0.020 = 800. The cost: every request now takes at least 20 ms, plus the wait for its batch to fill.',
    { sub: 'Dynamic batching' },
    'A server with **dynamic batching** holds each request for a short maximum wait (a few milliseconds) to collect others, then runs whatever it has. Under heavy traffic batches fill fast and throughput rises. Under light traffic nothing else arrives, so every request sits out the full wait and is then processed alone: extra latency for no gain. Keep the maximum wait small compared with the latency budget.',

    { h: 'Timeouts and fallbacks' },
    'Anything a service calls can stall. A **timeout** is the most time you will wait for a call before giving up. A **fallback** is the answer you use when you give up: a cached prediction, a smaller model, or a sensible default such as the most popular items.',
    {
      code: `import requests

try:
    r = requests.get(FEATURE_URL, timeout=0.1)
    value = r.json()['value']
except requests.RequestException:
    value = DEFAULT_VALUE`,
    },
    "`requests` is a common Python library for web calls. Without `timeout=...` it waits for as long as the other side keeps the connection open, which can be minutes, so the `except` branch never runs and your fallback is useless. With a timeout, a slow call raises an error that the `except` catches. Retrying a slow service is usually worse: it adds load to something already struggling. An acceptable answer on time is usually worth more than the best answer late.",
    'Count every fallback. A rising fallback rate is a drop in quality that never appears as an error.',

    { h: 'Mistakes to watch for' },
    {
      list: [
        'Building an online service when a nightly batch table would do.',
        'Optimising the model before timing the other stages.',
        'Reporting only the mean latency.',
        'Forgetting that many calls per page multiply the chance of a slow page.',
        'Setting a long batching wait on a service that is often quiet.',
        'Making remote calls with no timeout, or adding a fallback and never counting how often it fires.',
      ],
    },
  ],

  'mlops-optimise': [
    { h: 'Measure before you optimise' },
    'A model that is too slow or too large for the machine it must run on has to be made cheaper. There are many tricks for that, but the first step is always to **profile**: time every stage of a request and record memory, on the hardware you will really serve from. Set a target, such as "p95 under 80 ms and under 500 MB of memory" (p95 is the time only 5% of requests exceed).',
    'Then change one thing at a time and measure again, both speed and quality, on the same evaluation data. Often the slow part is not the model. If a database lookup takes 120 ms and the model 20 ms, making the model instant still leaves 120 ms. The most any model work can save is the time the model takes.',

    { h: 'How big a model is' },
    'A model is mostly its **parameters** (the weights it learned). Each one is stored as a number of some type, and each type has a fixed size in bytes:',
    {
      list: [
        '**float32**: a decimal number in 32 bits, 4 bytes. The usual training type.',
        '**float16**: 16 bits, 2 bytes.',
        '**int8** or **uint8**: a whole number in 8 bits, 1 byte. int8 holds −128 to 127, uint8 holds 0 to 255.',
      ],
    },
    'Size is **parameters × bytes per parameter**. A model with 30 million float32 weights takes 30,000,000 × 4 = 120,000,000 bytes, which is 120 MB if you count a megabyte as a million bytes. Memory in use while serving is higher than the file: the intermediate results for every input in a batch and the runtime itself come on top.',
    {
      code: `import numpy as np

w = np.zeros((200, 100), dtype=np.float32)
print(w.nbytes, w.astype(np.float16).nbytes, w.astype(np.int8).nbytes)`,
      out: '80000 40000 20000',
    },
    '`w.nbytes` is how many bytes the array occupies: 20,000 values × 4 bytes. `astype` makes a copy with another type. Note that these weights are all zero, and they still take full space. A zero is stored like any other number.',

    { h: 'Quantisation' },
    '**Quantisation** stores each weight in fewer bits, most often 8 instead of 32. That makes the model four times smaller and often faster on ordinary processors. The price is a small error in every weight.',
    { sub: 'Levels and steps' },
    'With 8 bits you have 2⁸ = 256 possible **levels**, numbered 0 to 255. Take the smallest weight (lo) and the largest (hi). Level 0 stands for lo and level 255 for hi, with the others evenly spaced between. 256 levels have 255 gaps between them, so the **step** is `(hi − lo) / 255`, not divided by 256. Divide by 256 and the largest weight lands on level 256, which does not fit in 8 bits.',
    'Each weight moves to its nearest level: level = round((w − lo) / step). To get a float back, compute level × step + lo. A weight is never more than half a step from its level, so the error is at most step / 2.',
    {
      code: `import numpy as np

w = np.array([-0.6, -0.1, 0.0, 0.25, 0.9])
lo, hi = w.min(), w.max()
step = (hi - lo) / 255
q = np.round((w - lo) / step).astype(np.uint8)
restored = q * step + lo
print(q)
print(round(step, 5), round(float(np.abs(w - restored).max()), 5))`,
      out: `[  0  85 102 144 255]
0.00588 0.00294`,
    },
    'The range is 1.5, so the step is 1.5 / 255 ≈ 0.00588, and the worst error is half of that. To store the array you need only lo, the step, and one byte per weight.',
    { sub: 'Why outliers hurt' },
    'The range is set by the most extreme weight. Suppose almost every weight lies between −0.5 and 0.5, but one is 3.0. The range jumps from 1 to 3.5, the step grows 3.5 times, and every weight loses precision. Most levels then sit in empty space where no weight lives. The usual fixes are to **clip** the range (accept a large error on the few outliers so everything else gets a fine step) or to choose a separate range per layer or per **channel** (one slice of a layer).',
    'Quantising a trained model is cheap. If accuracy drops too far, **quantisation-aware training** trains the model while simulating the rounding, so it learns to cope.',

    { h: 'Pruning and distillation' },
    { sub: 'Pruning' },
    '**Pruning** removes weights. Setting scattered small weights to zero is **unstructured pruning**. In a normal (dense) array a zero takes the same space as any number, and dense arithmetic multiplies by it all the same, so the file is no smaller and nothing is faster. It pays only with a sparse storage format and a runtime that skips zeros. **Structured pruning** removes whole neurons, channels or layers, which makes the arrays themselves smaller, and that helps on any runtime.',
    { sub: 'Distillation' },
    '**Distillation** trains a small **student** model to copy a large **teacher**. The student learns from the teacher\'s full set of predicted probabilities, not only its top answer, because "70% cat, 25% dog" carries more information than "cat". The teacher can label any amount of unlabelled data, so you need no extra human labels. It costs a training run, but the student can be many times smaller and faster, far beyond what quantisation alone gives. You can quantise the student afterwards too.',

    { h: 'Exporting and checking' },
    '**Exporting** converts a model to a portable format (ONNX is a common one) so it runs without the training library, on a runtime built for fast prediction. Any conversion or compression can change outputs, so compare the old and new model on the same inputs.',
    {
      code: `import numpy as np

old = np.array([0.20, 0.50, 0.90, 0.40])
new = np.array([0.20, 0.50, 0.10, 0.40])
diff = np.abs(old - new)
print(round(diff.mean(), 2), round(diff.max(), 2))`,
      out: '0.2 0.8',
    },
    'One input out of four is badly wrong. With thousands of inputs, an average would bury that one case under many tiny differences. The check must hold for every input, so compare the **largest** difference with your tolerance.',

    { h: 'Caching and precomputing' },
    'The cheapest prediction is one you never compute. A **cache** stores answers to requests seen before. **Precomputing** fills it in advance for inputs you know will come.',
    'With a cache, the mean latency is a weighted average. If 70% of requests hit the cache at 1 ms and 30% go to the model at 40 ms, the mean is 0.7 × 1 + 0.3 × 40 = 12.7 ms. But the 30% still take 40 ms, so p95 and p99 do not move. A cache helps the mean and median, not the tail.',
    'A cached prediction belongs to the model that made it. Put the **model version** in the cache key, as well as the inputs, or a new model will keep serving the old one\'s answers. Also decide when entries expire.',

    { h: 'Mistakes to watch for' },
    {
      list: [
        'Optimising the model before profiling the whole request.',
        'Dividing by 2^bits instead of 2^bits − 1 when computing the step.',
        'Letting a few outlier weights set the range for everyone.',
        'Zeroing scattered weights and expecting a smaller, faster dense model.',
        'Checking an exported model with the mean difference instead of the maximum.',
        'Caching predictions without the model version in the key.',
      ],
    },
  ],

  'mlops-skew': [
    { h: 'A model fed the wrong numbers' },
    'A **feature** is one input to the model, such as "basket value" or "days since last order". **Training/serving skew** is when the service feeds the model different numbers from the ones it was trained on, for the same real-world thing. Nothing crashes. The offline score was good and predictions come back, but they are worse than they should be, from the first hour.',
    'That last point is the clue. When the world changes, a model gets worse slowly over weeks. A model that is bad from the day of release, with no errors in the logs, almost always has a problem with its inputs. The first check is to take some live requests and compare the features the service computed with what the training pipeline computes for the same customers.',

    { h: 'One feature written twice' },
    'The commonest cause is that a feature is coded twice: once in the training pipeline (often SQL or a data table library) and once in the service (application code, perhaps by another team). Both versions run without error and quietly disagree. The usual places they differ:',
    {
      list: [
        '**Units**: kilograms against grams, pounds against pence. One side is 1,000 or 100 times the other.',
        '**Windows**: "spend over the last 7 days" may include today on one side and stop at yesterday on the other.',
        '**Missing values**: one side fills a gap with the median, the other with 0. The model may read 0 as a real, meaningful value.',
        '**Time zones**: local time against UTC (the world reference clock) moves the hour of day.',
      ],
    },
    { sub: 'An example with units' },
    'Say training divides a weight in grams by 1,000 to get kilograms, and the service passes grams straight through. A 2,500 g parcel is 2.5 to training and 2,500 to the service. The model has never seen a parcel of 2,500 kg, and its predictions for every parcel go wrong in the same direction.',

    { h: 'Fitted preprocessing' },
    'Some preprocessing is **fitted**: it learns numbers from the training data. **Standardising** (from the features module: subtract the mean, divide by the standard deviation, the typical spread) is one. A mapping from category names to index numbers is another, and so is a word vocabulary.',
    'Fitted numbers must be saved at training time and loaded at serving time, never fitted again on live data. Refitting breaks in two ways. One request alone has a spread of 0, so dividing by it fails. And a batch standardised against itself is centred on itself, so a group of big spenders looks average.',
    {
      code: `import numpy as np

X_train = np.array([[40.0], [50.0], [60.0]])
mean, std = X_train.mean(axis=0), X_train.std(axis=0)
x_live = np.array([[90.0]])
print(((x_live - mean) / std).round(2))
print(x_live.std(axis=0))`,
      out: `[[4.9]]
[0.]`,
    },
    'With the saved training statistics, 90 becomes 4.9, correctly far above normal. The spread of the single live row is 0, so refitting on it would divide by zero.',
    { sub: 'Category mappings' },
    'A common way to number categories is to sort the distinct names and number them in order:',
    {
      code: `colours = ['red', 'green', 'blue']
index = {c: i for i, c in enumerate(sorted(set(colours)))}
print(index)`,
      out: `{'blue': 0, 'green': 1, 'red': 2}`,
    },
    '`set` removes repeats, `sorted` puts them in alphabetical order and `enumerate` pairs each with 0, 1, 2. If the service rebuilds this from the names it happens to see, a new or missing name shifts every number after it, and the model reads one colour as another. Save the mapping with the model, and decide in advance what an unseen name maps to.',

    { h: 'Time travel in training data' },
    'A training row describes a moment in the past: "on this date we predicted whether this customer would leave". Its features may only use what was known at that moment. If you count a customer\'s complaints from today\'s table, the count includes complaints made after the prediction date, sometimes the very ones made on the way out. The feature has seen the future, so the offline score looks excellent. In production there is no future to see, and the score drops. This is called **time travel** or leakage.',
    { sub: 'Point-in-time features' },
    'The cure is a **point-in-time** join: for each training row, take feature values as of that row\'s timestamp. Suppose a customer ordered on days 2, 5, 9 and 14, and the prediction was made on day 7.',
    {
      code: `order_days = [2, 5, 9, 14]
predict_day = 7
print(sum(1 for d in order_days if d < predict_day), len(order_days))`,
      out: '2 4',
    },
    'The correct "orders so far" is 2. Using all 4 is time travel. In code, the comparison must be with the row\'s own timestamp, never with the current time.',

    { h: 'Preventing and catching skew' },
    'Prevention is **one definition per feature**, used by both sides: a shared function or package that training and serving both call. A **feature store** (Feast and Tecton are examples) does this as a service: it computes each feature once, gives training the values as of any timestamp, and gives the service the current value. Two careful implementations with good unit tests still drift, because each test checks its own author\'s reading of the definition.',
    'Another route is to **log** the exact feature values the service used for every prediction, and build the next training set from those logs. That removes the second implementation, and each logged row is point-in-time correct because it was recorded when the prediction was made. The price is waiting: a new feature must be logged for a while before you can train on it.',
    { sub: 'A skew check' },
    'Detection is a comparison. Take the same entities through both paths and compare feature by feature. Numbers count as equal when they differ by less than a small tolerance, because rounding is not skew. Other values, such as text, must be exactly equal, and a feature present on only one side is a disagreement. `isinstance(x, (int, float))` tells you whether a value is a number. Run the check before a release and on a schedule afterwards.',

    { h: 'Mistakes to watch for' },
    {
      list: [
        'Retraining when a model is bad from day one, instead of comparing its inputs.',
        'Fitting scalers or category mappings again on live data.',
        'Filling missing values differently in training and serving.',
        'Comparing against the current time when building historical features.',
        'Trusting two implementations because each has its own tests.',
      ],
    },
  ],

  'mlops-monitoring': [
    { h: 'Why a live model needs watching' },
    'An ordinary program that breaks usually crashes or shows an error. A model that breaks keeps answering. The service is up, every reply has status 200 (the web code for "OK"), and the numbers inside are wrong. **Monitoring** means measuring a live model all the time so that you notice this.',
    { sub: 'Four layers to watch' },
    {
      list: [
        '**System health**: latency, error rate, requests per second, memory, timeouts, and how often a fallback answer was used.',
        '**Inputs**: missing values, values out of range, new categories, and the shape of each feature\'s distribution.',
        '**Predictions**: the distribution of the model\'s scores and the share of positive predictions.',
        '**Outcomes**: the real quality metric once the true answers (labels) arrive, and the business number the model is for.',
      ],
    },
    'The first three need no labels and are available at once. The fourth is the only direct measure of quality, but it is often late.',

    { h: 'Two kinds of drift' },
    'Things change after a model is trained. Two different changes share the name **drift**.',
    {
      list: [
        '**Data drift**: the inputs change. More customers from a new country, older users, higher prices. You can see it in the input monitors without any labels.',
        '**Concept drift**: the right answer for the same input changes. A product that sold well goes out of fashion, so the same browsing pattern no longer predicts a purchase. The inputs can look exactly as before, so only outcomes reveal it.',
      ],
    },
    'Data drift does not always hurt. If a model is equally good on young and old users, a shift towards older users changes nothing. Drift is a reason to look, then check the metric on each **slice** (a subgroup such as one country or one device type).',
    { sub: 'Sudden steps and slow slides' },
    'The shape of a drop is a clue. The world usually changes gradually. A metric that falls overnight to a new flat level points at something someone changed that day: a release, a broken feature pipeline, a renamed column upstream. Check what changed before blaming the world.',

    { h: 'Measuring drift with PSI' },
    'To compare a live distribution with the training one, the **population stability index** (PSI) cuts a feature\'s range into **bins** (intervals) and compares the share of rows in each bin. With t the training share and l the live share of a bin:',
    'PSI = Σ (l − t) × ln(l ÷ t)',
    'Σ means "add up over all bins", and ln is the natural logarithm (`math.log` in Python): ln of a number above 1 is positive, ln of a number below 1 is negative. If a bin gained rows, both (l − t) and ln(l ÷ t) are positive. If it lost rows, both are negative. Either way each term is positive, so every change adds to the score, and swapping which sample you call training gives the same score.',
    {
      code: `import math

train = [0.4, 0.6]
live = [0.3, 0.7]
psi = sum((l - t) * math.log(l / t) for t, l in zip(train, live))
print(round(psi, 3))`,
      out: '0.044',
    },
    'A common reading: under 0.1 stable, 0.1 to 0.25 worth a look, over 0.25 investigate. These cut-offs are a convention, not a law. Two samples from the same source never give exactly 0, and small samples give larger scores by chance.',
    { sub: 'Shares, empty bins and bin edges' },
    'Work with shares, not raw counts: divide each count by its sample\'s total so a week of data compares fairly with a year. If a bin is empty, its share is 0 and ln(0) is undefined, so raise any share below a tiny floor (say 0.0001) to that floor. A bin that was empty in training and full now then gives a large score, which is right.',
    'The bin edges must come from the training data and be used for both samples. A common choice is **quantiles** of the training data: the cut points that split it into equal-sized groups. If you cut each sample at its own quantiles, every bin holds the same share of each by construction and PSI is always about 0. Open the outer edges to infinity so live values beyond the training range still land in a bin.',
    {
      code: `import numpy as np

rng = np.random.default_rng(1)
train = rng.normal(0, 1, 5000)
live = rng.normal(0, 1, 5000) * 2
edges = np.quantile(train, np.linspace(0, 1, 5))
edges[0], edges[-1] = -np.inf, np.inf
print(np.histogram(train, edges)[0], np.histogram(live, edges)[0])`,
      out: '[1250 1250 1250 1250] [1846  615  667 1872]',
    },
    '`rng.normal(0, 1, 5000)` draws 5000 values centred on 0. The live sample has the same centre but twice the spread. `np.quantile` at 0, 0.25, 0.5, 0.75 and 1 gives four bins with a quarter of the training data each, and `np.histogram` counts how many values fall in each. The live counts pile into the outer bins. A monitor that tracked only the mean would see nothing. Compare whole distributions.',

    { h: 'When labels are late' },
    'Often the true answer arrives long after the prediction. Whether a customer cancels a yearly subscription is known a year later. Until then, inputs and predictions are your early warning. The share of positive predictions is the cheapest one: if a model flagged 10% of cases last month and 40% this week, something changed, label or no label.',
    'Two more tools help. A **proxy** is an earlier signal that goes with the real outcome, such as a customer turning off auto-renew long before the subscription ends. And a **cohort** is a group of predictions made in the same period: as each cohort\'s labels arrive, compute its real metric and track it month by month. All of this needs a log of every prediction with its features and model version, or the late labels cannot be joined back to the predictions they belong to.',

    { h: 'Alerts people read' },
    'An alert is useful only if someone acts on it. An alert that fires every day teaches the team to ignore it.',
    {
      list: [
        'Set each threshold from how much that number moves in normal, healthy weeks, not from a guess. With 200 features and one low fixed cut-off, something crosses it every day by chance.',
        'Alert on a breach that lasts, not on one noisy day.',
        'Give each alert an owner and a first step.',
        'Start with the features the model relies on most.',
        'Watch slices as well as totals: a collapse in one country can vanish inside a global average.',
      ],
    },
    { sub: 'Any against all' },
    'Python\'s `any(...)` is True if at least one item is true. `all(...)` is True only if every item is. For "high for three days running" you need `all`:',
    {
      code: `daily = [0.05, 0.31, 0.08, 0.29, 0.30]
recent = daily[-3:]
print(any(v > 0.25 for v in recent), all(v > 0.25 for v in recent))`,
      out: 'True False',
    },
    'The middle day of the last three was 0.08, so the breach did not last.',

    { h: 'Investigating a drop' },
    'When a metric falls, work from cheap and likely to expensive and rare. First, is the number right: the label pipeline, the metric code, the sample size. Then what changed that week. Then system health and fallbacks, then input quality feature by feature, then which slices the drop sits in, then drift. Only when the inputs are sound and the errors are new is it concept drift. Retraining comes last: retraining on broken inputs teaches the model the bug.',
  ],

  'mlops-rollout': [
    { h: 'A release is a risk' },
    'A new model that scored better offline can still fail in production: it may be slow, meet inputs it never saw, or not change what users do. Releasing safely means testing before the release, then exposing the model to real traffic in small steps, with a way back at every step.',

    { h: 'Three kinds of test' },
    {
      list: [
        '**Code tests** check functions you wrote: a feature function returns 0 for a customer with no history, the service rejects malformed input.',
        '**Data tests** check a batch of data: the right columns and types, values in range, few missing values, no duplicates, data that is fresh. Great Expectations is one tool for these.',
        '**Model tests** check the trained model: on a fixed test set it beats the current model and a plain baseline, no important slice gets much worse, it meets the latency and memory budget, and it loads and predicts inside the serving image.',
      ],
    },
    'Each catches what the others miss. Correct code can still train a bad model on bad data.',
    { sub: 'Writing a data test' },
    'A row fails if a value is missing **or** out of range. Check for `None` first: with `or`, Python stops as soon as the first part is True, so the range check never sees a missing value. Chained comparisons such as `lo <= value <= hi` mean "value is between lo and hi, inclusive".',
    {
      code: `LIMITS = {'height_cm': (50, 250)}
rows = [{'height_cm': 180}, {'height_cm': None}, {'height_cm': 900}]
for row in rows:
    v = row.get('height_cm')
    lo, hi = LIMITS['height_cm']
    print(v is None or not lo <= v <= hi)`,
      out: `False
True
True`,
    },
    { sub: 'Gating on slices' },
    'Compare the candidate with the current model on each slice, not only overall. A model 3 points better on average can be 6 points worse for one group. Write the rule down, for example "block if any slice is more than 2 points worse", and let the gate apply it.',

    { h: 'Shadow mode' },
    'In **shadow mode** the new model receives a copy of every real request, and its predictions are logged and thrown away. Users only ever see the old model. That tests the things that only real traffic shows: latency under real load, crashes on unusual inputs, skew between training and serving features, and whether the score distribution matches the offline one. It costs no user risk. What it cannot show is how users react, because they never see its output.',

    { h: 'Canary releases' },
    'A **canary** release sends a small share of real traffic, often 1% to 5%, to the new model. (The name comes from the canaries miners carried to warn of bad air.) You compare its error rate, latency and **guardrail metrics** (numbers that must not get worse) with the rest, widen the share in steps, and roll back automatically if it is worse by more than noise.',
    { sub: 'Choosing who is in the canary' },
    'Assign by a stable key such as a hash of the user id, turned into a bucket from 0 to 99, as in the reproducibility lesson. A user is in the canary when the bucket is **below** the percentage. Use `<`, not `<=`: with `<=`, bucket 0 passes even at 0%, so a rollback to 0% leaves 1% of users on the new model. Test the switch at 0 and 100.',
    'Do not assign each request at random. A user would see both models during one visit, and whether they buy or come back could not be credited to either.',
    { sub: 'Telling harm from noise' },
    'Small canaries see few events. If a service has 50,000 requests a day, an error rate of 2% and a 2% canary, the canary sees 1,000 requests and about 20 errors a day. A handful more errors could be chance.',
    'The **standard error** measures how much a rate wobbles by chance. For a rate p measured on n requests it is √(p(1 − p)/n). For the gap between two rates, add the two squared errors and take the root: √(p₁(1 − p₁)/n₁ + p₂(1 − p₂)/n₂). A common rule is to roll back when the canary\'s rate is above the control\'s by more than 2 standard errors. Only a canary that is worse counts: one with fewer errors is never rolled back.',
    {
      code: `import math

p1, n1 = 0.020, 20000     # control: 2.0% errors
p2, n2 = 0.030, 1000      # canary: 3.0% errors
se = math.sqrt(p1 * (1 - p1) / n1 + p2 * (1 - p2) / n2)
print(round(p2 - p1, 3), round(se, 4), p2 - p1 > 2 * se)`,
      out: '0.01 0.0055 False',
    },
    'A gap of 1 point on 1,000 canary requests is less than two standard errors, so it could be noise. The same gap on far more requests would be a real difference. Write the rule down before the release, so nobody argues about it during one.',

    { h: 'A/B tests' },
    'A canary asks "is it safe?". An **A/B test** asks "is it better?": users are split at random (by hash) into the old and new model, and one **primary metric** chosen in advance, such as purchases per visit, decides. Matching error rates in a canary say nothing about purchases.',
    'Fix the length and the number of users in advance, covering at least a full week, since weekday and weekend users behave differently. Do not stop the moment the result looks good. The **p-value** (from the evaluation module: the chance of a difference this large from noise alone) is valid for one look. Each extra look is another chance for noise to cross the line, so checking every morning and stopping at the first p below 0.05 makes false wins far more likely than 5%.',
    'After launch, keep a small **holdback** group on the old model. A model whose predictions shape its own future training data cannot otherwise be judged.',

    { h: 'Rollback and the release checklist' },
    '**Rollback** is the plan for being wrong. Keep the previous version deployed and one switch away, never overwrite versions in the model registry, and test the switch before you need it. A rollback restores everything the old model depends on: if the new model reads a new feature table, keep the old pipeline running until the new model has proved itself, or the old model has nothing to read.',
    'Before a model takes real traffic, tick off: the run is reproducible and registered; it beats the current model and a baseline, slice by slice; data tests and a feature comparison between training and serving pass; latency and memory are measured under load; timeouts and fallbacks are tested; monitoring and prediction logging are live before launch; rollback has been exercised; and someone owns the model, with notes on what it is not for.',
  ],

  'mlops-retraining': [
    { h: 'Why models go stale' },
    'A trained model is a snapshot of the world up to the day its training data ended. The world moves on: prices, habits and competitors change. A model\'s accuracy usually sinks slowly as the gap grows. **Retraining** means training a fresh model on newer data, so the snapshot is up to date again.',

    { h: 'When to retrain' },
    { sub: 'On a schedule' },
    'Retrain every week or every month. This is predictable and easy to plan for. It wastes compute when nothing has changed, and it is slow when something changes overnight: a shock on the 3rd waits until next month\'s run.',
    'There is a neat piece of arithmetic here. If accuracy falls by a steady amount each week and you retrain every N weeks, the loss climbs from 0 to its peak and resets. Its average over a cycle is half the peak. For example, losing 0.3 points a week with retraining every 10 weeks gives a peak loss of 3 points and an average loss of 1.5. Halving the interval halves the average loss and doubles the number of retrains.',
    { sub: 'On a trigger' },
    'Retrain when a measured number crosses a threshold: a drift score such as PSI (the population stability index from the monitoring lesson), a live error rate, or the number of new labels collected. A trigger reacts to events, but it is only as good as the monitoring behind it, and an error-rate trigger needs outcomes that arrive quickly.',
    'A trigger can also misfire. If the threshold sits above what a freshly trained model can reach, the new model is already "too bad" on its first day, and the trigger fires again as soon as it may. Set thresholds from what a fresh model achieves, and give the trigger a minimum gap between retrains. Many teams run a schedule with triggers as a backstop.',
    {
      code: `def reasons(age_days, error_rate, max_age=28, max_error=0.05):
    out = []
    if age_days >= max_age:
        out.append('too old')
    if error_rate is not None and error_rate > max_error:
        out.append('errors')
    return out

print(reasons(30, 0.02), reasons(3, None), reasons(40, 0.09))`,
      out: `['too old'] [] ['too old', 'errors']`,
    },
    'Returning a list of reasons, not only yes or no, tells whoever reads the log why a retrain happened. The `is not None` check matters when the number may be missing, for example before any labels have arrived.',

    { h: 'What to retrain on' },
    { sub: 'Label delay' },
    'A model can only learn from rows whose true outcome is known. The **label delay** is how long that takes. If outcomes arrive 14 days after a row is created, then on day 50 only rows from day 36 or earlier can be used:',
    {
      code: `today = 50
delay = 14
days = list(range(30, 50))
usable = [d for d in days if d + delay <= today]
print(len(usable), max(usable))`,
      out: '7 36',
    },
    'However often you retrain, the newest example is 14 days old. When labels are slow, retraining more often helps little. Effort spent getting labels, or an early proxy for them, sooner usually pays more.',
    { sub: 'The training window' },
    'Recent data matches today\'s world. A longer history gives more rows. After a big change, such as prices jumping, old rows describe a market that is gone and may outnumber the new ones. Train on a recent window, or give recent rows more weight, and let a test on the latest period decide between the options.',
    { sub: 'Splitting by time' },
    'Test on the most recent period, with a split by time: train on everything up to a cut day, test on what comes after. A random split lets the model study next week to predict last week. The two sides must not overlap: if one uses `<=` the cut and the other `>=` the cut, rows from the cut day land in both.',
    {
      code: `days = [1, 2, 3, 4, 5, 6, 7, 8]
cut = 6
train = [d for d in days if d <= cut]
test = [d for d in days if d > cut]
print(train, test)`,
      out: '[1, 2, 3, 4, 5, 6] [7, 8]',
    },

    { h: 'Gates for a retrained model' },
    'A retrained model is a new model and passes the same gates as any release. Run data checks before training: a column that is suddenly all zeros does not make training fail, the model quietly learns that the feature is useless. Then compare the new model with the one in service on the same recent held-out data before promoting it. Automatic retraining is fine. Automatic promotion without checks turns a data bug into a model bug.',
    'Compare versions on the same examples. If version 3 scored 0.80 on March\'s test data and version 4 scores 0.78 on April\'s, you cannot tell which is better: April may have been harder. Keep a fixed test set to compare versions over time, next to a fresh recent one for fitness today, and do not tune on either.',

    { h: 'Feedback loops' },
    'A model changes the data it later learns from. This is a **feedback loop**, and it can make the training data a record of the model\'s own choices.',
    {
      code: `shows = {'X': 0, 'Y': 0}
quality = {'X': 0.3, 'Y': 0.3}
for day in range(4):
    pick = max(shows, key=shows.get)
    shows[pick] += int(50 * quality[pick])
print(shows)`,
      out: `{'X': 60, 'Y': 0}`,
    },
    'Two items of equal quality. Each day the item with the most clicks so far is shown. X wins the first tie (`max` returns the first of equal values), gets clicks, and is shown for ever after. The data now says X is far better, and the model created that evidence.',
    { sub: 'What a model never sees' },
    'The same trap appears wherever a decision hides the outcome. A loan model rejects an applicant, so it never learns whether they would have repaid. A fraud model blocks a payment, so its true nature is never known. Mistakes about the rejected group can never be corrected.',
    'The remedy is to keep a small slice honest. Give a small random share of traffic a decision the model did not make: a random ordering, or approvals below the threshold, within a cost you can afford. That slice gives unbiased outcomes for measuring the model and for training the next one. This is called **exploration**.',

    { h: 'Mistakes to watch for' },
    {
      list: [
        'Retraining more often when the real limit is the label delay.',
        'Setting a trigger threshold that a fresh model cannot meet.',
        'Evaluating with a random split, or a time split whose sides overlap.',
        'Promoting every retrained model automatically.',
        'Comparing two versions scored on different test sets.',
        'Training only on outcomes the model allowed to happen.',
      ],
    },
  ],

  'mlops-lab': [
    { h: 'What a release gate is' },
    'A **release gate** is code that runs checks and returns a decision a pipeline can act on: ship, or hold with reasons. This lab builds one in plain Python, a function at a time. Each function is small. The value is that the rules are written down, run the same way every time, and say why they failed. A gate that only says no tends to be bypassed. A gate that names the reason gets fixed.',
    'The pieces follow the life of a release: check the input rows, measure drift against the training data, check latency, watch the error rate while live, decide on the canary, and combine everything.',

    { h: 'Checking input rows' },
    'A **schema** here is a dict mapping each column to its allowed range, for example `{\'height_cm\': (50, 250)}`. For each row and each column in the schema, a value is a problem if it is missing, not a number, or outside its range. Use `row.get(name)`, which returns None for a missing column instead of raising an error. Columns not in the schema are ignored.',
    { sub: 'Type first, then range' },
    '`isinstance(value, (int, float))` is True only for numbers, so None and the text `\'42\'` fail it. Python\'s `or` stops at the first True part, so with the type test first, the range test never compares text with a number. For the range, write `not lo <= value <= hi`. The other form, `value < lo or value > hi`, lets **NaN** through. NaN ("not a number") is a special float that compares False with everything:',
    {
      code: `nan = float('nan')
print(nan < 0 or nan > 10, not 0 <= nan <= 10)
print(isinstance('7', (int, float)), isinstance(7.5, (int, float)))`,
      out: `False True
False True`,
    },
    'Record problems as `(row index, column)` pairs. `enumerate(rows)` gives each row with its index.',

    { h: 'Binning and the drift score' },
    'To measure drift you first count values in bins, with edges saved at training time. With k sorted edges there are k + 1 bins: below the first edge, between each pair, and from the last edge up. The outer bins are open, so a live value beyond anything seen in training still lands somewhere, and those are the values a monitor most needs to count.',
    'Python\'s `bisect.bisect_right(edges, v)` returns how many edges are less than or equal to v. That is exactly the bin number, with a value equal to an edge going into the bin above it:',
    {
      code: `import bisect

edges = [100, 200]
for v in [50, 100, 150, 200, 999]:
    print(v, bisect.bisect_right(edges, v))`,
      out: `50 0
100 1
150 1
200 2
999 2`,
    },
    'Start with `counts = [0] * (len(edges) + 1)` and add 1 at each value\'s bin.',
    { sub: 'From counts to PSI' },
    'The drift score is the population stability index from the monitoring lesson. Bin the training and live values with the same edges. Turn each count into a share by dividing by that sample\'s size. Raise any share below a small floor `eps` to `eps`, so an empty bin cannot cause a division by zero or the log of zero. Then add up `(live − train) × ln(live ÷ train)` over the bins, using `math.log` for ln. A score above 0.25 is the usual "investigate" line. A bin that was empty in training and holds live values adds a large amount on its own.',

    { h: 'Latency against a budget' },
    'A latency budget is a statement about a percentile, usually p95. The nearest-rank percentile from the serving lesson sorts the times and takes the value at rank `ceil(p × n / 100)`, counting from 1. A summary returns a dict, for example `{\'p50\': 12, \'p95\': 40, \'p99\': 300, \'ok\': True}`, where `ok` compares p95 with the budget using `<=`. Never judge the budget on the mean: if 10% of requests take 500 ms and the rest 10 ms, the mean is 59 ms while one user in ten waits half a second.',

    { h: 'A rolling error-rate alert' },
    'A single failed request means little. A **rolling window** turns events into a rate: at each request, look at the last `window` requests and compute the share that failed. Only full windows count, so one early failure is not read as a 100% error rate. The first full window ends at index `window − 1`, and the window ending at index i is the slice `outcomes[i − window + 1 : i + 1]`:',
    {
      code: `errors = [0, 0, 0, 1, 0, 1, 1]
window = 3
for i in range(window - 1, len(errors)):
    part = errors[i - window + 1:i + 1]
    print(i, part, round(sum(part) / window, 2))`,
      out: `2 [0, 0, 0] 0.0
3 [0, 0, 1] 0.33
4 [0, 1, 0] 0.33
5 [1, 0, 1] 0.67
6 [0, 1, 1] 0.67`,
    },
    'An alert fires at the first index where the rate is strictly above the threshold, and the function returns None if that never happens. The window length is a trade-off: a short window reacts fast but flaps on and off, a long one is steady but slow.',

    { h: 'The canary decision and the gate' },
    { sub: 'Three outcomes' },
    'The canary rule from the release lesson compares error rates p₁ (control) and p₂ (canary) with the standard error of the difference, √(p₁(1 − p₁)/n₁ + p₂(1 − p₂)/n₂). The order of the tests is the policy. First, if the canary is worse by more than z standard errors, return rollback, whatever the sample size: clear harm ends the canary at once. Otherwise, if the canary has too few requests, return wait, since the absence of harm means nothing until harm has had a chance to show. Otherwise promote.',
    { sub: 'Combining the checks' },
    'The gate takes a report of all the results and returns a list of reasons to hold, in a fixed order. An empty list means ship. To name drifting features in alphabetical order, loop over `sorted(report[\'psi\'])`, which gives the dict\'s keys sorted, and add a text such as `\'drift: \' + name` for each one above the limit. A canary that is still waiting is not a pass. Use the limits passed in as arguments, never a hard-coded number.',

    { h: 'Where each check runs' },
    'The schema check runs before training and before prediction, by the same rules. Bin edges and training shares are computed once at training time and saved with the model version. Drift scores run on a schedule, with thresholds tuned from healthy weeks. The latency summary runs in a load test and continuously in production. The rolling alert runs live with an owner. The canary decision runs automatically during the ramp, wired to a tested rollback.',
    'Two things are still missing from such a gate. None of these checks says whether the predictions are right, so outcome metrics by slice must be added once labels arrive. And every gate result should be stored with the model, data and config versions, so a bad release can be traced.',
  ],
}
