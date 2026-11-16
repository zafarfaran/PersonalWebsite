import type { Module } from '../types'

export const mlops: Module = {
  id: 'mlops',
  title: 'Shipping and operating models',
  summary: 'What happens after the notebook: making a run reproducible, serving and shrinking the model, releasing it safely, and keeping it good while the world changes around it.',
  lessons: [
    {
      id: 'mlops-reproducible',
      title: 'Reproducible work',
      summary: 'Seeds, pinned environments, config in files, and what to write down for every run.',
      text: [
        'A result you cannot reproduce is a result you cannot debug, compare or defend. A training run is the product of four things: the **code**, the **data**, the **configuration** and the **environment**, plus the random numbers drawn along the way. Record all of them and you can get the run back. Lose one and you are guessing.',
        'Randomness comes from shuffling, weight initialisation, dropout and sampling. Give every generator a **seed**, and prefer a generator you create and pass around (`random.Random(seed)`, `np.random.default_rng(seed)`) over the global one, which any other code can disturb. A seed makes a run repeatable on the same machine and library versions. It does not promise identical numbers on different hardware or after an upgrade: there, compare within a tolerance.',
        'The environment is the interpreter, every library and its exact version. `numpy>=1.20` is a wish, not a record. **Pin** exact versions in a lock file or build a container image, and store which one a run used.',
        'Settings belong in a **config file**, not in your head, a notebook cell or a command you typed once. Load the file, apply any overrides, and save the final, resolved settings with the run.',
        { code: `run = {
    'code': 'git commit 3f9a2c1 (clean)',
    'data': 'orders snapshot 2024-05-01, sha256 9b1c...',
    'config': {'lr': 0.01, 'layers': 3, 'seed': 7},
    'environment': 'lock file hash 77e0...',
    'metrics': {'val_auc': 0.874},
    'model': 'registry: churn/14',
}` },
        'A model is only identified by the three together: this code, on this data, with this config. So data and models need versions as code does: an immutable snapshot or a content hash, never a table name that is overwritten each night. Experiment trackers (MLflow and Weights & Biases are examples), data versioning tools (DVC is one) and model registries exist to keep that record for you. The habit matters more than the tool.',
      ],
      rules: [
        'A run = code + data + config + environment + seed. Record all five, every time.',
        'Seed a generator you own and pass it in. Do not rely on global random state.',
        'Seeds repeat a run on the same setup. Across hardware or versions, expect small differences.',
        'Pin exact versions. A range in a requirements file is not a record.',
        'Log the resolved config: what the run used, after overrides.',
        'Version data by snapshot or hash. A table name is not a version.',
      ],
      questions: [
        {
          kind: 'output',
          id: 'mlops-reproducible-1',
          ask: 'What does this print?',
          code: `import numpy as np

rng = np.random.default_rng(0)
a = rng.permutation(5)
b = rng.permutation(5)

rng = np.random.default_rng(0)
c = rng.permutation(5)
print((a == b).all(), (a == c).all())`,
          answer: 'False True',
          hint: 'A seed fixes the whole sequence of draws, not each draw.',
          why: 'The seed fixes the sequence. The second draw from the same generator is a different point in it, so `b` differs from `a`. A new generator with the same seed starts the sequence again, so `c` equals `a`.',
        },
        {
          kind: 'bug',
          id: 'mlops-reproducible-2',
          ask: 'This split takes a seed, yet it gives a different validation set on every run.',
          code: `import random

def split(rows, seed, val_share=0.2):
    rng = random.Random(seed)
    rows = list(rows)
    random.shuffle(rows)
    n_val = int(len(rows) * val_share)
    return rows[n_val:], rows[:n_val]`,
          line: 6,
          fix: '    rng.shuffle(rows)',
          why: 'The seeded generator is created and then never used. `random.shuffle` draws from the global generator, which is seeded from the clock unless someone set it.',
        },
        {
          kind: 'choice',
          id: 'mlops-reproducible-3',
          ask: 'You rerun a training script from a month ago: same commit, same data snapshot, same seed, on the same machine. The validation score is noticeably different. The requirements file reads `numpy>=1.20` and `scikit-learn`. What is the most likely cause?',
          options: [
            'The seed has worn out and needs changing',
            'A fresh install picked up newer library versions, whose defaults or algorithms differ',
            'The dataset is too small to give a stable score',
            'Random seeds only work in notebooks',
          ],
          answer: 1,
          why: 'Unpinned requirements resolve to whatever is newest on the day of the install. Library upgrades change defaults and numerical details. Pin exact versions and record which lock file or image the run used.',
        },
        {
          kind: 'choice',
          id: 'mlops-reproducible-4',
          ask: 'The same commit, data, config and seed give a validation loss of 0.41237 on your laptop and 0.41241 on a GPU server. What should you conclude?',
          options: [
            'The seed was not applied on one of the machines',
            'This is expected: a seed fixes the random draws, not the order of floating-point operations on different hardware',
            'One of the machines has corrupted data',
            'The model is overfitting',
          ],
          answer: 1,
          why: 'Different hardware and libraries add numbers up in different orders, and rounding differs. Small differences are normal across setups. Check reproduction within a tolerance, and keep the setup fixed when you need exact repeats.',
        },
        {
          kind: 'output',
          id: 'mlops-reproducible-5',
          ask: 'A fingerprint for a config, used to tell whether two runs had the same settings. What does this print?',
          code: `import hashlib, json

a = {'lr': 0.01, 'layers': 3}
b = {'layers': 3, 'lr': 0.01}

def fingerprint(cfg):
    text = json.dumps(cfg, sort_keys=True)
    return hashlib.sha256(text.encode()).hexdigest()[:8]

print(fingerprint(a) == fingerprint(b), json.dumps(a) == json.dumps(b))`,
          answer: 'True False',
          why: 'The two dicts hold the same settings in a different order. Without `sort_keys=True` they serialise to different text and would hash differently. Anything you hash to identify a run must be written out in a fixed order.',
        },
        {
          kind: 'bug',
          id: 'mlops-reproducible-6',
          ask: 'The tracker shows a learning rate of 0.01 for a run that was started with an override of 0.1, and nobody can reproduce its score.',
          code: `def start_run(config, overrides, tracker):
    final = {**config, **overrides}
    tracker.log_params(config)
    model = train(final)
    tracker.log_metrics(evaluate(model))
    return model`,
          line: 3,
          fix: '    tracker.log_params(final)',
          why: 'The run trains with the resolved settings but records the file as it was before the overrides. Always log what was used.',
        },
        {
          kind: 'choice',
          id: 'mlops-reproducible-7',
          ask: 'A run record says the model was trained on the table `analytics.orders`. The table is rebuilt every night. Six months later, can the run be reproduced?',
          options: [
            'Yes: the table name identifies the data',
            'Yes, as long as the seed was recorded',
            'No: the rows behind that name have changed. The record needed a snapshot id, a dated immutable copy or a content hash',
            'No: tables cannot be used for training',
          ],
          answer: 2,
          why: 'A name that points at changing contents is not a version. Train from an immutable snapshot and store its id or hash with the run.',
        },
        {
          kind: 'choice',
          id: 'mlops-reproducible-8',
          ask: 'Your dataset gains new users every week. A user who was in validation last week must stay in validation this week, or their rows leak into training. Which split does that?',
          options: [
            'Shuffle all rows with a fixed seed and take the last 20%',
            'Hash each user id and put the user in validation when the hash falls in a fixed 20% of buckets',
            'Take the newest 20% of rows each week',
            'Use a different seed each week',
          ],
          answer: 1,
          why: 'A seeded shuffle of a list that has grown puts everyone in a new position. A hash depends only on the id, so each user lands on the same side every time, however many users are added.',
        },
        {
          kind: 'write',
          id: 'mlops-reproducible-9',
          ask: 'Write a train/validation split that gives the same result every time for the same seed. Shuffle a copy of the rows, then take the first `val_share` of them as validation (round the count down).',
          starter: `import random

def split(rows, val_share, seed):
    # returns (train, validation) as two lists
    pass`,
          solution: `import random

def split(rows, val_share, seed):
    rows = list(rows)
    random.Random(seed).shuffle(rows)
    n_val = int(len(rows) * val_share)
    return rows[n_val:], rows[:n_val]`,
          tests: `import random
data = list(range(100))
out = split(data, 0.2, 1)
assert out is not None, "the function returns nothing yet"
train, val = out
assert len(val) == 20 and len(train) == 80, f"100 rows with a share of 0.2 should give 80 and 20 rows, got {len(train)} and {len(val)}"
assert sorted(list(train) + list(val)) == data, "every row should be in exactly one of the two parts"
assert data == list(range(100)), "do not shuffle the caller's list: work on a copy"
random.seed(123)
train2, val2 = split(data, 0.2, 1)
assert list(val2) == list(val) and list(train2) == list(train), "the same seed must give the same split, whatever the global random state is"
assert list(split(data, 0.2, 2)[1]) != list(val), "a different seed should give a different split"
assert sorted(val) != data[:20] and sorted(val) != data[-20:], "shuffle before splitting"`,
          why: 'A generator created from the seed inside the function owes nothing to global state, so nothing outside can change the result. Copying the list keeps the caller\'s data in its original order.',
        },
        {
          kind: 'write',
          id: 'mlops-reproducible-10',
          ask: 'Write a split that never moves a key: hash the key with `hashlib.md5`, turn the hex digest into an integer, take it modulo 100, and return True when that bucket is below `share × 100`.',
          starter: `import hashlib

def in_validation(key, share):
    # key: a string such as a user id.  share: 0.2 means 20% of keys
    pass`,
          solution: `import hashlib

def in_validation(key, share):
    bucket = int(hashlib.md5(key.encode()).hexdigest(), 16) % 100
    return bucket < share * 100`,
          tests: `assert in_validation('user-1', 0.2) is not None, "the function returns nothing yet"
keys = [f'user-{i}' for i in range(2000)]
first = [in_validation(k, 0.2) for k in keys]
assert first == [in_validation(k, 0.2) for k in keys], "the same key must always get the same answer"
rate = sum(first) / len(first)
assert 0.15 < rate < 0.25, f"about 20% of keys should be in validation, got {rate:.0%}"
assert not any(in_validation(k, 0) for k in keys), "with a share of 0 nothing is in validation"
assert all(in_validation(k, 1) for k in keys), "with a share of 1 everything is in validation"
small = {k for k in keys if in_validation(k, 0.1)}
large = {k for k in keys if in_validation(k, 0.3)}
assert small <= large, "raising the share should only add keys, never move one out"`,
          why: 'The answer depends only on the key, so it survives new rows, reordering and reruns. Use a real hash function: Python\'s built-in `hash()` of a string changes from one process to the next.',
        },
        {
          kind: 'design',
          id: 'mlops-reproducible-11',
          ask: 'A colleague cannot reproduce a validation score you reported three months ago. What should have been recorded with that run for them to be able to?',
          checklist: [
            { point: 'The exact code: commit hash, and whether there were uncommitted changes', why: 'A branch name moves. A dirty working tree means the commit is not what ran.' },
            { point: 'The data version: snapshot id or content hash of the training and validation sets', why: 'Tables change. Without a fixed version nobody can tell whether the data or the model differs.' },
            { point: 'The full resolved configuration, after defaults and overrides', why: 'One unrecorded command-line flag is enough to change a score.' },
            { point: 'The environment: lock file or image, language version, key library versions', why: 'Library upgrades change defaults and numerics without any change to your code.' },
            { point: 'The seeds, and how the split was made', why: 'A different validation set gives a different score for the same model.' },
            { point: 'The metrics, and exactly which data and code they were computed with', why: 'A score means nothing without the evaluation set and metric definition behind it.' },
            { point: 'Where the trained model is stored, with its own version or hash', why: 'Often the fastest check is to load the saved model and evaluate it again.' },
            { point: 'Hardware and run time', why: 'It explains small numerical differences and tells the next person what the run costs.' },
          ],
          why: 'Reproducing a run means restoring every input to it. Each item is one input: leave any out and a difference in the score cannot be traced.',
        },
      ],
    },
    {
      id: 'mlops-serving',
      title: 'Serving a model',
      summary: 'Batch, online and streaming, the path of a request, and why you watch p99 and not the average.',
      widget: 'mlops-latency',
      text: [
        'There are three ways to put predictions in front of something that uses them. **Batch**: score everything on a schedule, store the results, look them up later. It is cheap and easy to debug, and the predictions are as old as the last run. **Online**: a service answers each request as it comes, with the freshest inputs and a latency budget. **Streaming**: events arrive on a queue and are scored as they pass, within seconds, with nobody waiting on the line. Pick the least demanding one that meets the need for freshness.',
        'An online request takes a path: receive and validate the input, fetch features, preprocess, run the model, postprocess, respond. The model is often not the slowest step. Feature lookups and network hops usually are. Time every stage before changing anything.',
        'Latency is a distribution with a long tail, so it is reported in **percentiles**. p50 is the median. p95 is the time that 5% of requests exceed, p99 the time that 1% exceed. The average hides the tail: a service can average 50 ms while one request in a hundred takes over half a second. And the tail is seen more than its share suggests. A page that makes 20 calls, each slow 1% of the time, hits a slow one on about 18% of page loads.',
        '**Batching** trades a little waiting for a lot of throughput. A model can process 8 inputs together in much less than 8 times the time of one, most of all on a GPU. A server with dynamic batching holds each request for a few milliseconds to collect company. Under heavy traffic that multiplies throughput. Under light traffic every request waits for a batch that never fills.',
        'Everything a service calls can stall, so every call gets a **timeout**, and the service needs a **fallback** for when the time is up: a cached prediction, a smaller model, a sensible default such as the most popular items. An acceptable answer on time is usually worth more than the best answer late. Count how often the fallback is used: it is a quality problem that never shows up as an error.',
      ],
      rules: [
        'Batch if predictions can be hours old. Online if a caller waits. Streaming for events with nobody waiting.',
        'Time each stage of the request path. The model is often not the slow part.',
        'Report p50, p95 and p99. The mean hides the tail.',
        'With many calls per page, rare slow calls become common slow pages: 1 − (1 − p)ⁿ.',
        'Batching raises throughput and adds waiting. Cap the wait.',
        'Every remote call has a timeout and a fallback, and fallbacks are counted.',
      ],
      questions: [
        {
          kind: 'output',
          id: 'mlops-serving-1',
          ask: 'Ten request times in milliseconds. What does this print?',
          code: `latencies = [20, 22, 25, 21, 23, 24, 20, 22, 21, 902]
latencies.sort()
mean = sum(latencies) / len(latencies)
median = (latencies[4] + latencies[5]) / 2
print(mean, median)`,
          answer: '110.0 22.0',
          why: 'One slow request drags the mean to 110 ms, a time no request took. The median stays at 22 ms. Neither number alone describes the service: you need the median and the tail.',
        },
        {
          kind: 'choice',
          id: 'mlops-serving-2',
          ask: 'In the figure, a slow request takes 600 ms. Move slow requests from 0.5% to 2%. p95 stays near 70 ms while p99 jumps from under 100 ms to about 600 ms. Why does only p99 move?',
          options: [
            'p99 is an average of the slowest requests, so it is more sensitive',
            'p99 is the time that 1% of requests exceed. Once more than 1% are slow, it sits inside the slow group; p95 does not until more than 5% are slow',
            'p95 is always about twice the median',
            'The figure rounds p95 down',
          ],
          answer: 1,
          why: 'A percentile is a position in the sorted list, not an average. It jumps when the slow group grows past that position. Push slow requests past 5% in the figure and p95 jumps too. The median hardly moves at any setting.',
        },
        {
          kind: 'number',
          id: 'mlops-serving-3',
          ask: 'Each call to a service is slow with probability 1%, independently. A page makes 20 calls. What is the probability that at least one of them is slow? (Two decimals.)',
          answer: 0.182,
          tol: 0.006,
          check: '1 - 0.99 ** 20',
          hint: 'Work out the chance that all 20 are fast, then subtract from 1.',
          why: '0.99²⁰ ≈ 0.818 is the chance that all are fast, so about 18% of pages meet a slow call. This is why p99 of a service is felt by far more than 1% of users.',
        },
        {
          kind: 'choice',
          id: 'mlops-serving-4',
          ask: 'Marketing sends a retention email every Monday to the customers most likely to leave. The churn model uses data that is updated nightly. How should the model be served?',
          options: [
            'An online service with autoscaling, called once per customer when the email is built',
            'A batch job that scores all customers before Monday and writes the scores to a table',
            'A streaming job that rescores a customer on every click',
            'On the customer\'s device',
          ],
          answer: 1,
          why: 'Nobody is waiting for an answer and the inputs change once a day. A scheduled batch job is cheaper, easier to rerun and easier to check than a service that must stay up.',
        },
        {
          kind: 'choice',
          id: 'mlops-serving-5',
          ask: 'Machines on a factory floor publish sensor readings to a queue. A model should flag a failing machine within a few seconds. No application sends a request and waits for a reply. Which serving pattern fits?',
          options: ['A nightly batch job', 'An online request/response service', 'A streaming consumer that scores each event as it arrives', 'Retraining the model every few seconds'],
          answer: 2,
          why: 'A nightly job is hours too late. A request/response service has no caller here. A consumer reading from the queue scores events as they pass and publishes alerts.',
        },
        {
          kind: 'output',
          id: 'mlops-serving-6',
          ask: 'Time spent in each stage of one request, in milliseconds. What does this print?',
          code: `stages = {'validate': 2, 'features': 70, 'model': 15, 'postprocess': 3}

total = sum(stages.values())
slowest = max(stages, key=stages.get)
print(total, slowest, round(stages['model'] / total, 2))`,
          answer: '90 features 0.17',
          why: 'The model is 15 of 90 ms, about a sixth. The feature lookup takes most of the time. Making the model twice as fast would save 7.5 ms; halving the lookup would save 35.',
        },
        {
          kind: 'number',
          id: 'mlops-serving-7',
          ask: 'A model takes 10 ms for one input and 18 ms for a batch of 8. One worker runs batches of 8 back to back. How many requests per second does it handle? (Nearest whole number.)',
          answer: 444,
          tol: 5,
          check: '8 / 0.018',
          why: '8 requests every 18 ms is about 444 a second, against 100 a second one at a time. Each request now takes at least 18 ms, plus the wait for its batch to fill.',
        },
        {
          kind: 'choice',
          id: 'mlops-serving-8',
          ask: 'A model server uses dynamic batching: it waits up to 20 ms to collect up to 32 requests. At night the service receives about one request a second. What do those users get?',
          options: [
            'Faster answers, because batches are more efficient',
            'About 20 ms of extra latency on every request, with no gain in throughput',
            'Errors, because the batch never fills',
            'The same latency as during the day',
          ],
          answer: 1,
          why: 'With one request a second, nothing else arrives during the wait, so each request sits out the full 20 ms and is then processed alone. Keep the maximum wait small against the latency budget.',
        },
        {
          kind: 'bug',
          id: 'mlops-serving-9',
          ask: 'This client has a fallback, yet when the model server stalls, callers hang for minutes.',
          code: `import requests

def get_score(features, cache, default=0.0):
    try:
        r = requests.post(MODEL_URL, json=features)
        r.raise_for_status()
        return r.json()['score']
    except requests.RequestException:
        return cache.get(features['user_id'], default)`,
          line: 5,
          fix: '        r = requests.post(MODEL_URL, json=features, timeout=0.2)',
          why: 'The fallback only runs when the call fails, and without a timeout a stalled call never fails: `requests` waits for as long as the server keeps the connection open. Every remote call needs an explicit timeout.',
        },
        {
          kind: 'choice',
          id: 'mlops-serving-10',
          ask: 'A recommendation model sits on a home page with a 150 ms budget. About 1% of calls to it take over a second. What should the page do for those calls?',
          options: [
            'Wait: the personalised answer is worth it',
            'Retry until the model answers',
            'Stop waiting at the budget, show a fallback such as popular items, and count how often that happens',
            'Show an error message',
          ],
          answer: 2,
          why: 'A decent list on time beats a perfect list late, and far beats an error. Retrying adds load to a service that is already slow. The count matters: a rising fallback rate is a silent drop in quality.',
        },
        {
          kind: 'write',
          id: 'mlops-serving-11',
          ask: 'Write a percentile by the nearest-rank rule: sort the values, and return the one at rank `ceil(p × n / 100)`, counting from 1. No averaging between values.',
          starter: `import math

def percentile(values, p):
    # p is between 1 and 100
    pass`,
          solution: `import math

def percentile(values, p):
    ordered = sorted(values)
    rank = math.ceil(p * len(ordered) / 100)
    return ordered[max(rank, 1) - 1]`,
          tests: `vals = list(range(1, 101))
assert percentile(vals, 50) is not None, "the function returns nothing yet"
assert percentile(vals, 50) == 50, f"p50 of 1..100 is 50, got {percentile(vals, 50)}"
assert percentile(vals, 99) == 99, f"p99 of 1..100 is 99, got {percentile(vals, 99)}"
assert percentile(vals, 100) == 100, "p100 is the largest value"
assert percentile([30, 10, 20], 50) == 20, "sort the values first"
mixed = [5, 1, 9]
percentile(mixed, 50)
assert mixed == [5, 1, 9], "do not reorder the caller's list"
assert percentile([1, 2, 3, 4], 50) == 2, "nearest rank picks a value from the list: rank ceil(0.5 * 4) = 2"
tail = [10] * 98 + [500, 1000]
assert percentile(tail, 50) == 10 and percentile(tail, 99) == 500, "with 98 fast requests and 2 slow ones, p50 is 10 and p99 is 500"`,
          why: 'Nearest rank always returns a latency that a request really had. In the last test the mean is 24.8 ms, the median 10 ms and p99 500 ms: three honest numbers that tell very different stories.',
        },
      ],
    },
    {
      id: 'mlops-optimise',
      title: 'Smaller and faster models',
      summary: 'Quantisation, pruning, distillation, export and caching, and measuring before any of them.',
      widget: 'mlops-quantise',
      text: [
        '**Measure before optimising.** Profile the whole request and find where the time and memory go. Set a target on the hardware you will serve from: p95 under some number of milliseconds, memory under some number of megabytes. Then change one thing and measure again, speed and quality both, on the same evaluation set. Often the win is in a feature lookup or a cache and the model was never the problem.',
        'Model size is arithmetic: **parameters × bytes per parameter**. A float32 takes 4 bytes, so 100 million parameters take 400 MB. Memory in use is higher than the file: activations for every item in the batch and the runtime itself come on top.',
        '**Quantisation** stores each weight in fewer bits. Going from float32 to 8-bit integers makes the model 4 times smaller and often faster on CPUs. The range of the weights is cut into 256 evenly spaced levels and each weight moves to the nearest, an error of at most half a step. One extreme weight stretches the range and makes every step coarser, which is why ranges are clipped or set per layer or per channel. Quantising after training is cheap. If accuracy drops too far, quantisation-aware training lets the model adapt.',
        '**Pruning** removes weights. Setting scattered weights to zero (unstructured pruning) does not shrink a dense file or speed up dense arithmetic: a zero takes the same room as any number. It pays only with sparse storage and a runtime that skips zeros. Removing whole neurons, channels or layers (structured pruning) makes the matrices themselves smaller, and that helps everywhere.',
        '**Distillation** trains a small student model to copy the outputs of a large teacher, its full probabilities and not only its top answer. The student is a different, smaller architecture, so it costs a training run, and it can be far smaller than quantising alone allows.',
        '**Exporting** to a portable format (ONNX is a common example) lets the model run without the training framework, on a runtime tuned for inference. After any conversion, check that the new model gives the same outputs as the old on the same inputs, within a tolerance. And the cheapest prediction is the one you do not compute: **cache** repeated requests and **precompute** results for inputs known in advance, with the model version in the key and a rule for when entries expire.',
      ],
      rules: [
        'Profile first. Optimise the stage that takes the time.',
        'Size = parameters × bytes per parameter. float32 is 4 bytes, int8 is 1.',
        'Quantisation: fewer bits, error up to half a step. Outliers widen the step for every weight.',
        'Zeros in a dense tensor save nothing. Structured pruning or sparse formats do.',
        'Distillation gives a new, smaller model and costs a training run.',
        'After export or compression, compare outputs and re-measure quality on the same data.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'mlops-optimise-1',
          ask: 'A model has 25 million parameters stored as float32. How large are the weights, in MB? (Take 1 MB as a million bytes.)',
          answer: 100,
          check: '25e6 * 4 / 1e6',
          why: '25 million × 4 bytes = 100 million bytes = 100 MB.',
        },
        {
          kind: 'number',
          id: 'mlops-optimise-2',
          ask: 'A model has 110 million float32 parameters. You quantise all of them to 8-bit integers. How many MB does that save? (1 MB = a million bytes.)',
          answer: 330,
          check: '110e6 * 4 / 1e6 - 110e6 * 1 / 1e6',
          why: '440 MB as float32, 110 MB as int8: a saving of 330 MB, or three quarters.',
        },
        {
          kind: 'output',
          id: 'mlops-optimise-3',
          ask: 'A weight matrix is pruned, then converted to 8-bit integers. What does this print?',
          code: `import numpy as np

w = np.ones((1000, 500), dtype=np.float32)
before = w.nbytes
w[:, 50:] = 0                  # prune 90% of the weights
print(before, w.nbytes, w.astype(np.int8).nbytes)`,
          answer: '2000000 2000000 500000',
          why: 'Half a million float32 values take 2 MB whether they are zero or not, so pruning alone saved nothing here. Changing the type to one byte per value cut the size by four.',
        },
        {
          kind: 'choice',
          id: 'mlops-optimise-4',
          ask: 'In the figure, set 8 bits and switch from range ±1 to range ±4 (one outlier). The step and the typical error both grow about fourfold, and only 59 of the 256 levels are in use. What is the practical lesson?',
          options: [
            '8 bits is never enough for real models',
            'The range is set by the most extreme weight, so a few outliers cost every weight precision: clip the range or choose it per layer or per channel',
            'Quantisation only works when weights are positive',
            'Outliers should be stored twice',
          ],
          answer: 1,
          why: 'Evenly spaced levels are spent where there are no weights. Clipping a handful of outliers costs a large error on them and buys a finer step for everything else, which is usually the better trade.',
        },
        {
          kind: 'bug',
          id: 'mlops-optimise-5',
          ask: 'This quantises weights to 8 bits. After the round trip, the largest weights in each layer come back badly wrong.',
          code: `import numpy as np

def quantise(w, bits=8):
    lo, hi = w.min(), w.max()
    step = (hi - lo) / (2 ** bits)
    q = np.round((w - lo) / step).astype(np.uint8)
    return q, lo, step`,
          line: 5,
          fix: '    step = (hi - lo) / (2 ** bits - 1)',
          why: '256 levels are numbered 0 to 255, so there are 255 steps between the smallest and the largest weight. Dividing by 256 sends the largest weight to level 256, which does not fit in 8 bits.',
        },
        {
          kind: 'choice',
          id: 'mlops-optimise-6',
          ask: 'The p95 latency of a service is 180 ms against a target of 100 ms. A trace shows: feature lookup 140 ms, model 25 ms, everything else 15 ms. The team proposes two weeks of work to quantise the model. What do you say?',
          options: [
            'Go ahead: quantisation always speeds a service up',
            'Fix the feature lookup first: even a model that took no time at all would leave the service at 155 ms',
            'Distil the model as well, to be safe',
            'Raise the target to 180 ms',
          ],
          answer: 1,
          why: 'The most that model work can save is 25 ms. The lookup is where the time goes, so cache it, batch it or move the data closer. This is what measuring first is for.',
        },
        {
          kind: 'number',
          id: 'mlops-optimise-7',
          ask: 'A cache answers 60% of requests in 2 ms. The other 40% go to the model and take 50 ms. What is the mean latency, in ms?',
          answer: 21.2,
          tol: 0.1,
          check: '0.6 * 2 + 0.4 * 50',
          why: '0.6 × 2 + 0.4 × 50 = 21.2 ms. Note what did not change: 40% of requests still take 50 ms, so p95 and p99 are where they were. A cache improves the mean and the median, not the tail.',
        },
        {
          kind: 'bug',
          id: 'mlops-optimise-8',
          ask: 'After a new model version went live, many users kept getting the old model\'s predictions.',
          code: `cache = {}

def cached_predict(model, model_version, features):
    key = tuple(sorted(features.items()))
    if key not in cache:
        cache[key] = model.predict(features)
    return cache[key]`,
          line: 4,
          fix: '    key = (model_version, tuple(sorted(features.items())))',
          why: 'The key says which inputs a result belongs to and not which model produced it. A cached prediction is only valid for the model that made it, so the version goes in the key.',
        },
        {
          kind: 'choice',
          id: 'mlops-optimise-9',
          ask: 'You zero out the 80% smallest weights of a network, scattered across every layer, and serve it with the same dense runtime as before. What happens to latency?',
          options: [
            'It falls by about 80%',
            'It barely changes: dense arithmetic multiplies by the zeros like any other number',
            'It rises, because zeros are slow',
            'It falls by half',
          ],
          answer: 1,
          why: 'Unstructured sparsity needs a sparse format and a runtime that skips zeros before it saves anything. Removing whole channels or neurons gives smaller dense matrices, which every runtime runs faster.',
        },
        {
          kind: 'choice',
          id: 'mlops-optimise-10',
          ask: 'A text classifier is accurate and 20 times too slow for its latency budget. Quantising to 8 bits makes it about 3 times faster. You have plenty of unlabelled text. What is the most promising next step?',
          options: [
            'Quantise to 1 bit',
            'Train a much smaller student model on the large model\'s predicted probabilities for that text',
            'Prune 5% of the weights',
            'Export it to another file format and hope',
          ],
          answer: 1,
          why: 'A gap that large needs a smaller architecture. Distillation produces one, and the teacher can label any amount of unlabelled text. The student can then be quantised too.',
        },
        {
          kind: 'bug',
          id: 'mlops-optimise-11',
          ask: 'This check runs after exporting a model to a portable format. It passed, yet the exported model gets about one input in a thousand badly wrong.',
          code: `import numpy as np

def export_matches(model, exported, inputs, tol=1e-4):
    a = model.predict(inputs)
    b = exported.predict(inputs)
    return np.abs(a - b).mean() < tol`,
          line: 6,
          fix: '    return np.abs(a - b).max() < tol',
          why: 'An average over thousands of inputs buries a few large differences. An equivalence check must hold for every input, so compare the largest difference with the tolerance.',
        },
        {
          kind: 'write',
          id: 'mlops-optimise-12',
          numpy: true,
          ask: 'Quantise an array to 8 bits and back. Map the smallest value to level 0 and the largest to level 255, round to the nearest level, store the levels as `uint8`, then turn them back into floats. Return the levels, the restored array and the largest absolute error.',
          starter: `import numpy as np

def quantise_roundtrip(w):
    # w: a float array whose values are not all equal
    # returns (levels as uint8, restored floats, largest absolute error)
    pass`,
          solution: `import numpy as np

def quantise_roundtrip(w):
    lo, hi = w.min(), w.max()
    step = (hi - lo) / 255
    q = np.round((w - lo) / step).astype(np.uint8)
    restored = q * step + lo
    return q, restored, float(np.abs(w - restored).max())`,
          tests: `w = np.linspace(0.0, 255.0, 256)
out = quantise_roundtrip(w)
assert out is not None, "the function returns nothing yet"
q, restored, err = out
assert q.dtype == np.uint8, f"the levels should be stored as uint8, got {q.dtype}"
assert np.array_equal(q, np.arange(256)), "the values 0, 1, ..., 255 should map to the levels 0, 1, ..., 255"
assert err < 1e-9, "values that sit exactly on the levels should come back unchanged"
rng = np.random.default_rng(0)
w = rng.normal(0, 0.5, 1000)
q, restored, err = quantise_roundtrip(w)
assert q.min() == 0 and q.max() == 255, "the smallest value should get level 0 and the largest level 255 (there are 255 steps, not 256)"
step = (w.max() - w.min()) / 255
assert np.allclose(restored, w, atol=step / 2 + 1e-9), "every restored value should be within half a step of the original"
assert abs(err - np.abs(w - restored).max()) < 1e-12, "the third result should be the largest absolute difference between w and the restored array"
assert 0 < err <= step / 2 + 1e-9, "the largest error should be above 0 and at most half a step"`,
          why: 'Three numbers describe the stored array: the lowest value, the step, and one byte per weight. The error is bounded by half a step, and the step is the range divided by 255, which is why the range matters so much.',
        },
      ],
    },
    {
      id: 'mlops-skew',
      title: 'Training/serving skew',
      summary: 'The model is fine and its inputs are not: one feature, computed two ways.',
      text: [
        '**Training/serving skew** means the model receives different numbers in production from the ones it was trained on, for the same real-world thing. Nothing crashes. The offline metrics were good, the service returns predictions, and the predictions are worse than they should be from the first hour.',
        'The usual cause is one feature implemented twice: once in the training pipeline, in SQL or a dataframe, and once in the service, in application code. The two drift apart in small ways: pounds against pence, a 30-day window against a calendar month, a missing value filled with the median in one and with 0 in the other, local time against UTC.',
        'Preprocessing is the second cause. Anything **fitted** on training data, such as scaling statistics, a category-to-index mapping or a vocabulary, must be saved and loaded at serving time, never fitted again on live data. Ship it with the model as one artefact.',
        'The third is **time travel**. A training row describes a moment in the past, and its features must use only what was known at that moment. Count a customer\'s orders from today\'s table for a prediction dated last March and the feature has seen the future. Offline scores look excellent, and production, which has no future to look at, cannot match them. The cure is a **point-in-time** join: for each training row, feature values as of that row\'s timestamp.',
        'Prevention is one definition used by both sides: a shared function or package that training and serving both call, or a **feature store** (Feast and Tecton are examples of the category), which computes a feature once and hands the same values to training, as of a timestamp, and to the service. Detection is a comparison: log the features the service used, recompute them with the training pipeline for the same entities, and expect them to be equal. Training directly from logged serving features removes the second implementation altogether.',
      ],
      rules: [
        'Good offline, bad online from the start, no errors: suspect skew before anything else.',
        'One definition per feature, called by both training and serving.',
        'Fit preprocessing on training data once. Save it. Load it when serving.',
        'A training feature may only use data from before the moment of prediction.',
        'Missing values, units, windows and time zones are where two implementations differ.',
        'Log the features that were served and compare them with the training pipeline, row for row.',
      ],
      questions: [
        {
          kind: 'bug',
          id: 'mlops-skew-1',
          ask: 'Offline the model is accurate. Online it treats almost every basket as enormous.',
          code: `# training pipeline
def features_train(row):
    return {'basket': row['basket_pence'] / 100,
            'hour': row['ts'].hour}

# prediction service
def features_serve(request):
    return {'basket': request['basket_pence'],
            'hour': request['ts'].hour}`,
          line: 8,
          fix: "    return {'basket': request['basket_pence'] / 100,",
          why: 'Training saw baskets in pounds and the service sends pence, a hundred times larger. Both functions run without error. Only comparing their outputs for the same order shows it.',
        },
        {
          kind: 'bug',
          id: 'mlops-skew-2',
          ask: 'Inputs are standardised before the model. In production a single request crashes or gives nonsense, and a batch of big spenders is scored as if they were average.',
          code: `def train(X):
    mean, std = X.mean(axis=0), X.std(axis=0)
    model = fit((X - mean) / std)
    return model, {'mean': mean, 'std': std}

def serve(model, stats, X_live):
    mean, std = X_live.mean(axis=0), X_live.std(axis=0)
    return model.predict((X_live - mean) / std)`,
          line: 7,
          fix: "    mean, std = stats['mean'], stats['std']",
          why: 'The statistics are fitted again on whatever arrives. One row has a standard deviation of 0, and any batch is centred on itself, so the model can no longer tell a high value from a typical one. Use the statistics saved at training time.',
        },
        {
          kind: 'bug',
          id: 'mlops-skew-3',
          ask: 'A feature for days since the last order. In production, customers who have never ordered are scored as the most engaged of all.',
          code: `# training: missing values are filled with the median
def days_since_train(df):
    col = df['days_since_order']
    return col.fillna(col.median())

# serving: the median from training is passed in
def days_since_serve(user, median_days):
    value = user.get('days_since_order')
    return 0 if value is None else value`,
          line: 9,
          fix: '    return median_days if value is None else value',
          why: 'In training a missing value became the median. In the service it becomes 0, which the model reads as "ordered today". The default for a missing value is part of the feature definition and has to match.',
        },
        {
          kind: 'bug',
          id: 'mlops-skew-4',
          ask: 'This builds a training feature for predictions made in the past. The offline score is far better than anything seen in production.',
          code: `def orders_before(orders, user_id, as_of):
    # how many orders the user had made when the prediction was needed
    return sum(1 for o in orders
               if o['user'] == user_id and o['time'] <= now())`,
          line: 4,
          fix: "               if o['user'] == user_id and o['time'] < as_of)",
          why: 'Counting up to now gives every historical row knowledge of what the user did afterwards, which often includes the outcome being predicted. A training feature must stop at the moment the prediction would have been made.',
        },
        {
          kind: 'number',
          id: 'mlops-skew-5',
          ask: 'A customer placed orders on days 3, 8, 12 and 20. You are building a training row for a prediction that was made on day 10. What is the right value of the feature "number of past orders"?',
          answer: 2,
          check: 'sum(t < 10 for t in [3, 8, 12, 20])',
          why: 'Only the orders on days 3 and 8 had happened by day 10. Using all 4 is time travel: the model would be trained on information it will never have when it predicts.',
        },
        {
          kind: 'output',
          id: 'mlops-skew-6',
          ask: 'Both sides compute "average spend over 3 days". Training uses the three days before the day being predicted. The service includes today. What does this print?',
          code: `history = [10, 20, 30, 40]     # spend on the four days before today
today = 100

train_feature = sum(history[-3:]) / 3
serve_feature = sum((history + [today])[-3:]) / 3
print(train_feature, round(serve_feature, 1))`,
          answer: '30.0 56.7',
          why: 'The same name, the same formula, and a window that is one day off: 30.0 against 56.7. Window boundaries are one of the commonest sources of skew.',
        },
        {
          kind: 'output',
          id: 'mlops-skew-7',
          ask: 'A city is turned into an index for the model. The service rebuilds the mapping from the cities it has seen. What does this print?',
          code: `train_cities = ['paris', 'rome', 'oslo']
live_cities = ['rome', 'oslo', 'lima']

train_index = {c: i for i, c in enumerate(sorted(set(train_cities)))}
live_index = {c: i for i, c in enumerate(sorted(set(live_cities)))}
print(train_index['oslo'], live_index['oslo'])`,
          answer: '0 1',
          why: 'The model learned that index 0 means Oslo. The rebuilt mapping sends Oslo to 1, which meant Paris in training. A mapping is fitted preprocessing: save it with the model and decide in advance what an unseen category maps to.',
        },
        {
          kind: 'choice',
          id: 'mlops-skew-8',
          ask: 'A model has an AUC of 0.91 on the held-out test set. In production it performs like a model at 0.70, from the first hour. There are no errors in the logs. What do you check first?',
          options: [
            'Whether the world changed since training: retrain on newer data',
            'Take some live requests and compare the feature values the service computed with what the training pipeline computes for the same entities',
            'Whether a larger model would do better',
            'Whether the test set was too small',
          ],
          answer: 1,
          why: 'A gap that is there from the first hour, with no errors, points at the inputs. The world does not usually change on the day of the release. A row-by-row feature comparison finds skew quickly, and retraining would not remove it.',
        },
        {
          kind: 'choice',
          id: 'mlops-skew-9',
          ask: 'A churn model is trained on today\'s snapshot of the customers table, with labels from six months ago. One feature is `support_tickets_total`. The offline score is excellent. Why be suspicious?',
          options: [
            'Ticket counts are not numeric',
            'The snapshot includes tickets raised after the prediction date, among them the complaints customers made on their way out',
            'Six months is too long ago to learn from',
            'The feature has too many distinct values',
          ],
          answer: 1,
          why: 'The feature contains the future, and here the future carries the label. In production, tickets a customer has not raised yet are not in the table. Features must be taken as of the prediction date.',
        },
        {
          kind: 'choice',
          id: 'mlops-skew-10',
          ask: 'The feature `spend_30d` is needed by a training pipeline and by a prediction service. Which arrangement best prevents skew?',
          options: [
            'A careful written definition, implemented by each team in its own language',
            'One implementation, in a shared package or a feature store, that both the pipeline and the service call',
            'Two implementations, each with thorough unit tests',
            'Retraining weekly, so that the model adapts to the service',
          ],
          answer: 1,
          why: 'Two implementations agree on the day they are written and drift afterwards. Unit tests check each against its own author\'s reading. A single definition cannot disagree with itself.',
        },
        {
          kind: 'choice',
          id: 'mlops-skew-11',
          ask: 'A team logs, for every prediction, the exact feature values the service used, and builds its next training set from those logs. Which problems does that remove?',
          options: [
            'Concept drift',
            'A second implementation of the features, and time travel: each logged row is what was known when the prediction was made',
            'The need for labels',
            'The need for a test set',
          ],
          answer: 1,
          why: 'Logged features are point-in-time correct by construction, and they come from the serving code itself. The price is that a new feature has to be logged for a while before it can be trained on.',
        },
        {
          kind: 'write',
          id: 'mlops-skew-12',
          ask: 'Write a skew check. You get the features computed by the training pipeline and by the service for the same entities, as two lists of dicts in the same order. Return a sorted list of the feature names that disagree in any row. Numbers disagree when they differ by more than `tol`; anything else disagrees when it is not equal; a feature that one side lacks disagrees.',
          starter: `def skewed_features(train_rows, serve_rows, tol=1e-6):
    # each row is a dict: feature name -> value
    pass`,
          solution: `def skewed_features(train_rows, serve_rows, tol=1e-6):
    bad = set()
    for t, s in zip(train_rows, serve_rows):
        for name in set(t) | set(s):
            if name not in t or name not in s:
                bad.add(name)
                continue
            a, b = t[name], s[name]
            if isinstance(a, (int, float)) and isinstance(b, (int, float)):
                if abs(a - b) > tol:
                    bad.add(name)
            elif a != b:
                bad.add(name)
    return sorted(bad)`,
          tests: `same = [{'basket': 12.5, 'hour': 9}, {'basket': 3.0, 'hour': 17}]
out = skewed_features(same, [dict(r) for r in same])
assert out is not None, "the function returns nothing yet"
assert out == [], f"identical features should give an empty list, got {out}"
serve = [{'basket': 1250, 'hour': 9}, {'basket': 300, 'hour': 17}]
assert skewed_features(same, serve) == ['basket'], "basket is in pounds on one side and pence on the other"
close = [{'basket': 12.5 + 1e-9, 'hour': 9}, {'basket': 3.0, 'hour': 17}]
assert skewed_features(same, close) == [], "differences smaller than tol are rounding, not skew"
one_row = [{'basket': 12.5, 'hour': 9}, {'basket': 3.0, 'hour': 18}]
assert skewed_features(same, one_row) == ['hour'], "a feature that differs in one row only still counts"
assert skewed_features([{'city': 'oslo', 'n': 1}], [{'city': 'Oslo', 'n': 1}]) == ['city'], "text values must be equal"
assert skewed_features([{'a': 1, 'b': 2}], [{'a': 1}]) == ['b'], "a feature missing on one side disagrees"
try:
    missing = skewed_features([{'days': None, 'z': 1}], [{'days': 0, 'z': 2}])
except TypeError:
    raise AssertionError("None on one side must be reported, not crash the check")
assert missing == ['days', 'z'], "None against 0 is a disagreement, and the names should come back sorted"`,
          why: 'This is the test that finds skew: the same entities through both paths, compared value by value. Run it on a sample of live requests before a release and on a schedule afterwards.',
        },
      ],
    },
    {
      id: 'mlops-monitoring',
      title: 'Monitoring and drift',
      summary: 'What to watch on a live model, the two kinds of drift, and alerts that people still read.',
      widget: 'mlops-drift',
      text: [
        'A model in production fails quietly. The service answers, the status is 200, and the number in the reply is wrong. So you watch four layers. **System health**: latency, error rate, throughput, memory. **Inputs**: missing values, ranges, shares of each category, distributions. **Predictions**: the distribution of scores and the share of positives. **Outcomes**: the real metric once the true labels arrive, and the business number the model exists for.',
        'Two different things are called drift. **Data drift**: the inputs change. More mobile users, a new country, higher prices. **Concept drift**: the right answer for the same input changes. Fraudsters switch tactics, or a recession changes who repays. Data drift is visible without labels and does not always hurt the model. Concept drift can happen with inputs that look unchanged, and only outcomes reveal it.',
        'A drift score puts a number on how much a distribution has moved. The **population stability index** cuts a feature into bins, with edges fixed from the training data, and compares the share of rows in each: `PSI = Σ (live − train) × ln(live ÷ train)`. A common reading is: under 0.1 stable, 0.1 to 0.25 worth a look, over 0.25 investigate. Those cut-offs are a convention. Two samples from the same distribution never give exactly 0, and small samples give larger scores by chance.',
        'Labels are often late. Whether a loan defaults is known months after the decision. Until then, inputs and predictions are your early warning. Use a **proxy** that arrives sooner, such as a missed first payment, and compute the real metric for each cohort as its labels mature. To do that at all you must log every prediction with its features and model version.',
        'An alert is only useful if someone acts on it. Set thresholds from how much the number moves in healthy weeks, not from a guess. Alert on a breach that lasts, and attach an owner and a first step. An alert that fires every day teaches people to ignore it. Look at slices as well as totals: a collapse in one country can vanish inside a global average.',
      ],
      rules: [
        'Watch four layers: system, inputs, predictions, outcomes.',
        'Data drift: the inputs moved. Concept drift: the right answer moved. Only labels show the second.',
        'Drift is a reason to look, not proof of harm. Check the metric, by slice.',
        'PSI = Σ (live − train) × ln(live ÷ train), over bins whose edges come from training.',
        'Late labels: watch inputs and predictions, use a proxy, evaluate cohorts as they mature.',
        'Thresholds come from normal variation. Alerts need an owner and must be rare enough to be read.',
      ],
      questions: [
        {
          kind: 'choice',
          id: 'mlops-monitoring-1',
          ask: 'Every input monitor on a spam filter is quiet: message lengths, languages and sender types look as they did in training. Yet precision has fallen for a month. Spammers have started writing messages that look like the old legitimate ones. What is this?',
          options: ['Data drift', 'Concept drift: the same kind of input now has a different right answer', 'Training/serving skew', 'A latency problem'],
          answer: 1,
          why: 'The inputs have not moved. What they mean has. No input monitor can see that. Only outcomes can, which is why labels, even a small hand-checked sample, are worth paying for.',
        },
        {
          kind: 'choice',
          id: 'mlops-monitoring-2',
          ask: 'In the figure, leave the live mean at 0 and raise the live spread to 1.5. The mean of the feature has not changed. What does the PSI do, and why?',
          options: [
            'It stays near 0, because the mean is the same',
            'It rises above 0.25, because PSI compares the share in every bin, and the outer bins have gained rows while the middle ones lost them',
            'It goes negative',
            'It cannot be computed when the spreads differ',
          ],
          answer: 1,
          why: 'The score is about 0.33. A monitor that tracks only the mean would report nothing, while the model now sees many more extreme values than it was trained on. Compare distributions, not one summary number.',
        },
        {
          kind: 'output',
          id: 'mlops-monitoring-3',
          ask: 'A feature with two bins. What does this print?',
          code: `import math

train = [0.5, 0.5]       # share of rows in each bin
live = [0.25, 0.75]

psi = sum((l - t) * math.log(l / t) for t, l in zip(train, live))
print(round(psi, 2))`,
          answer: '0.27',
          hint: 'ln(0.5) ≈ −0.69 and ln(1.5) ≈ 0.41.',
          why: '(−0.25) × ln(0.5) + 0.25 × ln(1.5) ≈ 0.173 + 0.101 = 0.27. Both terms are positive: a bin that lost rows and a bin that gained rows each add to the score.',
        },
        {
          kind: 'bug',
          id: 'mlops-monitoring-4',
          ask: 'These counts feed a PSI. It reports almost exactly 0 for every feature, even one whose values have doubled.',
          code: `import numpy as np

def bin_counts(train_values, live_values, bins=10):
    qs = np.linspace(0, 1, bins + 1)
    train_counts, _ = np.histogram(train_values, bins=np.quantile(train_values, qs))
    live_counts, _ = np.histogram(live_values, bins=np.quantile(live_values, qs))
    return train_counts, live_counts`,
          line: 6,
          fix: '    live_counts, _ = np.histogram(live_values, bins=np.quantile(train_values, qs))',
          why: 'Cut each sample at its own deciles and every bin holds a tenth of it by construction, so the shares always match. The edges must be fixed from the training data. In practice the outer edges are also opened to infinity, so that live values beyond the training range are still counted.',
        },
        {
          kind: 'write',
          id: 'mlops-monitoring-5',
          ask: 'Write the population stability index from two lists of bin counts. Turn each list into shares, raise any share below `eps` to `eps` so that an empty bin does not break the logarithm, and add up `(live − train) × ln(live ÷ train)`.',
          starter: `import math

def psi(train_counts, live_counts, eps=1e-4):
    # the two lists have one count per bin, in the same order
    pass`,
          solution: `import math

def psi(train_counts, live_counts, eps=1e-4):
    n_train, n_live = sum(train_counts), sum(live_counts)
    total = 0.0
    for t, l in zip(train_counts, live_counts):
        a = max(t / n_train, eps)
        b = max(l / n_live, eps)
        total += (b - a) * math.log(b / a)
    return total`,
          tests: `out = psi([50, 50], [50, 50])
assert out is not None, "the function returns nothing yet"
assert abs(out) < 1e-12, f"identical counts should give 0, got {out}"
assert abs(psi([10, 10], [500, 500])) < 1e-12, "compare shares, not raw counts: the two samples may differ in size"
assert abs(psi([50, 50], [25, 75]) - 0.274653) < 1e-5, f"[50, 50] against [25, 75] should give about 0.2747, got {psi([50, 50], [25, 75])}"
assert abs(psi([30, 70], [60, 40]) - psi([60, 40], [30, 70])) < 1e-12, "the score is the same whichever sample is called training"
try:
    empty = psi([50, 50, 0], [40, 40, 20])
except (ZeroDivisionError, ValueError):
    raise AssertionError("an empty bin breaks the division or the logarithm: floor each share at eps")
assert empty > 1, "live rows in a bin that was empty in training should give a large score"`,
          why: 'Shares make samples of different sizes comparable, and the floor keeps an empty bin from producing a division by zero or the log of zero. A bin that was empty in training and is populated now is the strongest signal there is, and the score shows it.',
        },
        {
          kind: 'output',
          id: 'mlops-monitoring-6',
          ask: 'Scores from a model at training time and in production last week, with no labels yet. What does this print?',
          code: `train_scores = [0.1, 0.2, 0.1, 0.8, 0.3, 0.9, 0.2, 0.1, 0.7, 0.2]
live_scores = [0.7, 0.8, 0.9, 0.6, 0.2, 0.9, 0.8, 0.7, 0.1, 0.9]

def positive_rate(scores):
    return sum(s >= 0.5 for s in scores) / len(scores)

print(positive_rate(train_scores), positive_rate(live_scores))`,
          answer: '0.3 0.8',
          why: 'The share of positive predictions went from 30% to 80%. No label is needed to see that something changed: either the inputs moved or a feature is broken. The prediction distribution is the cheapest early warning there is.',
        },
        {
          kind: 'choice',
          id: 'mlops-monitoring-7',
          ask: 'The share of requests from mobile devices rises from 40% to 60%, and the drift score on the device feature reaches 0.2. Accuracy measured on recent labels is unchanged on mobile, on desktop and overall. What should you do?',
          options: [
            'Retrain at once: drift means the model is broken',
            'Note it and keep watching the per-slice metrics: the inputs moved but the model is as good as before on each kind of input',
            'Remove the device feature',
            'Roll back to the previous model',
          ],
          answer: 1,
          why: 'Data drift changes the mix of inputs. It hurts only if the model is weaker on the part that grew. Here it is not, so there is nothing to fix yet. Drift scores tell you where to look; the metric tells you whether there is a problem.',
        },
        {
          kind: 'choice',
          id: 'mlops-monitoring-8',
          ask: 'Daily accuracy of a live model, from labels that arrive the next day. What is the most likely kind of cause?',
          chart: { x: 'day', y: 'accuracy', series: [{ name: 'accuracy', points: [0.9, 0.91, 0.9, 0.9, 0.91, 0.9, 0.78, 0.77, 0.78, 0.78, 0.77, 0.78], color: 'bad' }] },
          options: [
            'Gradual concept drift',
            'Something changed between two days: a release, a broken feature pipeline or an upstream schema change',
            'Random noise in the metric',
            'The model is overfitting',
          ],
          answer: 1,
          why: 'The world rarely changes overnight and then holds still. A step down to a new flat level points at a change in the system. Find out what was deployed or altered that day before blaming the data.',
        },
        {
          kind: 'bug',
          id: 'mlops-monitoring-9',
          ask: 'This should alert only when drift has stayed high for three days running. It pages someone after a single noisy day.',
          code: `def should_alert(daily_psi, threshold=0.25, days=3):
    # alert only when the last few days are all above the threshold
    recent = daily_psi[-days:]
    return len(recent) == days and any(v > threshold for v in recent)`,
          line: 4,
          fix: '    return len(recent) == days and all(v > threshold for v in recent)',
          why: '`any` fires when one of the three days is high, which is what the rule was meant to prevent. A breach that lasts needs `all`.',
        },
        {
          kind: 'choice',
          id: 'mlops-monitoring-10',
          ask: 'An alert fires whenever the daily PSI of any of 200 features exceeds 0.1. It fires most days and the team has stopped reading it. What is the best change?',
          options: [
            'Send it to more people',
            'Set each threshold from how much that feature moves in healthy weeks, require the breach to last, and alert first on the features the model depends on most',
            'Raise every threshold to 1.0',
            'Turn input monitoring off and wait for the accuracy to drop',
          ],
          answer: 1,
          why: 'With 200 features and a fixed low cut-off, something crosses it every day by chance or by season. Thresholds need a baseline. A very high fixed threshold swaps noise for blindness, and switching monitoring off loses the only early warning.',
        },
        {
          kind: 'design',
          id: 'mlops-monitoring-11',
          ask: 'Design the monitoring for a credit model that approves or rejects loan applications. The true label, default or not, arrives 90 days after a loan is granted.',
          checklist: [
            { point: 'System health: latency percentiles, error rate, timeouts and how often a fallback was used', why: 'A model that falls back to a default decision is failing even though the service is up.' },
            { point: 'Input checks on every request or batch: schema, missing rates, ranges, unseen categories', why: 'A broken upstream field is the commonest failure and can be caught on the day, without labels.' },
            { point: 'Input drift against the training data, on the features the model relies on most', why: 'It warns that applicants have changed months before the first default can be counted.' },
            { point: 'The score distribution and the approval rate, overall and by segment', why: 'A jump in approvals is visible at once and is costly in credit.' },
            { point: 'A proxy outcome that arrives early, such as a missed first or second payment', why: 'It correlates with default and shortens the wait from 90 days to about 30.' },
            { point: 'The real metric per cohort as it matures: default rate by score band, and calibration', why: 'This is the only direct measure of the model. Tracking it by month of approval shows a trend.' },
            { point: 'A log of every decision with its features, score and model version', why: 'Without it, labels arriving in 90 days cannot be joined to the prediction that was made.' },
            { point: 'Thresholds from a baseline period, with an owner and a first action for each alert', why: 'Alerts with no baseline are noise, and alerts with no owner are not acted on.' },
          ],
          why: 'With late labels, the fast layers (system, inputs, predictions, proxy) carry the early warning and the matured cohorts confirm it. One more point for credit: rejected applicants never get a label, so the outcome data only covers the people the model approved.',
        },
        {
          kind: 'design',
          id: 'mlops-monitoring-12',
          ask: 'The accuracy of a model in production fell last week. What do you check, and in what order?',
          checklist: [
            { point: 'First, whether the number is right: label pipeline, metric code, sample size, dashboard changes', why: 'A broken join or a small sample can produce a drop that never happened.' },
            { point: 'What changed that week: model version, service release, feature pipeline, upstream schema', why: 'Most sudden drops are caused by a change someone made. A timeline often ends the search.' },
            { point: 'System health: errors, timeouts and the fallback rate', why: 'If a slow dependency sends requests to a default answer, quality falls with no model change.' },
            { point: 'Input quality: missing rates, ranges, units, new categories, feature by feature', why: 'One feature that became all zeros or changed unit explains many incidents.' },
            { point: 'Where the drop is: by segment, region, device, traffic source and time of day', why: 'A drop confined to one slice points straight at its cause.' },
            { point: 'Input drift and the prediction distribution against training', why: 'It shows whether the population changed and which features moved.' },
            { point: 'Whether the relationship changed: an event, a season, a policy, a competitor', why: 'If the inputs are sound and the errors are new, it is concept drift, and only newer labels can fix it.' },
            { point: 'Only then the action: roll back, repair the pipeline or retrain, and add a check that would have caught it', why: 'Retraining on broken inputs teaches the model the bug. The cause decides the remedy.' },
          ],
          why: 'The order goes from cheap and likely to expensive and rare: is it real, what changed, is the system healthy, are the inputs sound, where is it, and only last has the world changed. Retraining is the last step, not the first.',
        },
      ],
    },
    {
      id: 'mlops-rollout',
      title: 'Releasing safely',
      summary: 'Tests for data and models, then shadow, canary and A/B, with a way back at every step.',
      text: [
        'A model release is a code release with a learned artefact attached, so it needs three kinds of test. **Code tests**: unit tests for feature functions and preprocessing. **Data tests**: schema, types, ranges, missing rates, duplicates, freshness (Great Expectations is an example of a tool for these). **Model tests**: the candidate beats the current model and a plain baseline on a fixed test set, no important slice gets much worse, it meets the latency and size budgets, and it loads and predicts inside the serving image.',
        'Better offline is not better online, so exposure goes up in steps. In **shadow mode** the new model receives a copy of real requests and its predictions are logged and never used. That tests latency, errors, skew and the score distribution at no risk to users. It cannot show how users react, because they never see the result.',
        'In a **canary** release a small share of traffic, often 1% to 5%, is served by the new model. Compare its error rate, latency and guardrail metrics with the rest, widen the share in steps, and roll back automatically if it is worse by more than noise. Assign by a stable key such as a hash of the user id, so that a user stays on one side.',
        'An **A/B test** answers a different question. A canary asks whether the model is safe. An A/B test asks whether it is better: a random split of users, one primary metric chosen in advance, a length fixed in advance that covers at least a full weekly cycle, and enough users to see the effect through the noise.',
        '**Rollback** is the plan for being wrong. The previous version stays deployed and one switch away, model versions in the registry are never overwritten, and the switch is tested before it is needed. If the new model needs new features, the old pipeline keeps running until the new model has proved itself.',
        'Before going live, walk a checklist: the run is reproducible, offline tests passed including slices, the features match between training and serving, latency is within budget under load, timeouts and fallbacks behave, monitoring and alerts are already live, rollback is tested, and someone owns the model.',
      ],
      rules: [
        'Test the code, the data and the model. Each catches what the others miss.',
        'Gate on slices as well as the overall score.',
        'Shadow: real traffic, no user impact. It finds technical problems, not user reactions.',
        'Canary asks "is it safe?". A/B asks "is it better?".',
        'Assign users by a stable hash, never per request.',
        'Keep the old version one switch away, and test the switch.',
      ],
      questions: [
        {
          kind: 'choice',
          id: 'mlops-rollout-1',
          ask: 'A new ranking model has run in shadow mode for a week. Which of these can the shadow run not tell you?',
          options: [
            'Whether its p99 latency fits the budget on real traffic',
            'Whether users click more on its rankings',
            'Whether it crashes on inputs that never appeared in the test set',
            'Whether its scores are distributed as they were offline',
          ],
          answer: 1,
          why: 'Shadow predictions are logged and thrown away, so users never see them and cannot react. Clicks on the new ranking can only be measured by showing it to someone: a canary or an A/B test.',
        },
        {
          kind: 'choice',
          id: 'mlops-rollout-2',
          ask: 'Which of these is a model test, as opposed to a code test or a data test?',
          options: [
            'The function that computes `spend_30d` returns 0 for a customer with no orders',
            'No more than 1% of rows in today\'s batch have a missing age',
            'On the fixed test set, the candidate is at least as accurate as the model in production, and no slice is more than 2 points worse',
            'The service returns status 400 for malformed JSON',
          ],
          answer: 2,
          why: 'A model test is a claim about the behaviour of the trained artefact. The first and last are code tests and the second is a data test. All three kinds are needed, since correct code can still train a bad model on bad data.',
        },
        {
          kind: 'output',
          id: 'mlops-rollout-3',
          ask: 'A release gate compares the candidate with the current model on each slice of the test set. What does this print?',
          code: `current = {'all': 0.90, 'new_users': 0.84, 'mobile': 0.88}
candidate = {'all': 0.92, 'new_users': 0.79, 'mobile': 0.89}

worse = [name for name in current if candidate[name] < current[name] - 0.02]
print(worse)`,
          answer: "['new_users']",
          why: 'The candidate is 2 points better overall and 5 points worse for new users. An overall average hides a slice that got worse. The gate should block the release, or at least force a decision about it.',
        },
        {
          kind: 'bug',
          id: 'mlops-rollout-4',
          ask: 'A data test for a batch of rows. It lets out-of-range values through and crashes on a missing one.',
          code: `SCHEMA = {'age': (18, 100), 'income': (0, 1_000_000)}

def bad_rows(rows):
    bad = []
    for i, row in enumerate(rows):
        for name, (lo, hi) in SCHEMA.items():
            value = row.get(name)
            if value is None and not lo <= value <= hi:
                bad.append(i)
                break
    return bad`,
          line: 8,
          fix: '            if value is None or not lo <= value <= hi:',
          why: 'A row is bad if the value is missing or out of range. With `and`, a present value is never checked, and a missing one goes on to be compared with a number, which raises a TypeError.',
        },
        {
          kind: 'bug',
          id: 'mlops-rollout-5',
          ask: 'This routes a share of users to the new model. After a rollback set `percent` to 0, some users were still served by the new model.',
          code: `import hashlib

def use_new_model(user_id, percent):
    # send a fixed share of users to the new model
    h = int(hashlib.md5(user_id.encode()).hexdigest(), 16)
    return h % 100 <= percent`,
          line: 6,
          fix: '    return h % 100 < percent',
          why: 'Buckets run from 0 to 99. With `<=`, bucket 0 passes even at 0%, so 1% of users stay on the new model, and every setting sends one bucket too many. Test the switch at 0 and at 100.',
        },
        {
          kind: 'choice',
          id: 'mlops-rollout-6',
          ask: 'An experiment assigns each request at random to the old or the new recommendation model. What is wrong with that?',
          options: [
            'Nothing: random assignment is what an experiment needs',
            'A user gets a mix of both models across a visit, so their behaviour cannot be credited to either one',
            'Random assignment is too slow for production',
            'The groups will have different sizes',
          ],
          answer: 1,
          why: 'The outcome you care about, whether the user buys or comes back, belongs to the user and not to one request. Assign by a hash of the user id, so that each person has a consistent experience and their outcome counts for one side.',
        },
        {
          kind: 'number',
          id: 'mlops-rollout-7',
          ask: 'A service handles 200,000 requests a day with an error rate of 1%. A canary takes 5% of the traffic. If the new model is no worse than the old, how many errors a day do you expect in the canary?',
          answer: 100,
          check: '200000 * 0.05 * 0.01',
          why: '10,000 canary requests a day × 1% = 100 errors, about 4 an hour. So after one hour the canary has too few errors to tell 1% from 2%. Crashes and latency show sooner; a modest rise in error rate needs hours of traffic or a larger share.',
        },
        {
          kind: 'write',
          id: 'mlops-rollout-8',
          ask: 'Decide whether a canary should be rolled back. Compare the two error rates. Return True when the canary\'s rate is above the control\'s by more than `z` standard errors of the difference, where the standard error is `√(p₁(1 − p₁)/n₁ + p₂(1 − p₂)/n₂)`.',
          starter: `import math

def should_rollback(control_errors, control_n, canary_errors, canary_n, z=2.0):
    # True: the canary is worse than the control by more than noise explains
    pass`,
          solution: `import math

def should_rollback(control_errors, control_n, canary_errors, canary_n, z=2.0):
    p1 = control_errors / control_n
    p2 = canary_errors / canary_n
    se = math.sqrt(p1 * (1 - p1) / control_n + p2 * (1 - p2) / canary_n)
    return p2 - p1 > z * se`,
          tests: `out = should_rollback(100, 10000, 5, 500)
assert out is not None, "the function returns nothing yet"
assert out == False, "1% against 1%: there is nothing to roll back"
assert should_rollback(100, 10000, 25, 500) == True, "5% against 1% on 500 requests is far outside the noise"
assert should_rollback(100, 10000, 2, 100) == False, "2 errors in 100 is twice the rate, but with so few requests it is within noise: compare the gap with the standard error"
assert should_rollback(100, 10000, 0, 500) == False, "a canary with fewer errors must not be rolled back"
assert should_rollback(1000, 100000, 1300, 100000) == True, "1.3% against 1.0% is a real difference when each side has 100,000 requests"
assert should_rollback(0, 1000, 0, 1000) == False, "no errors on either side: nothing to roll back"`,
          why: 'The decision compares the gap with the noise in the gap. Twice the error rate on 100 requests means little, while a rise of a third on 100,000 is certain. Writing the rule down before the release stops it being argued about during one.',
        },
        {
          kind: 'choice',
          id: 'mlops-rollout-9',
          ask: 'A canary at 5% ran for a day. Error rate and latency match the old model. A product manager concludes that the new model is better and should replace the old one. What is the right reply?',
          options: [
            'Agreed: the canary passed',
            'The canary shows the model is safe to run. Whether it is better needs an A/B test on the metric it is meant to improve',
            'The canary should be repeated at 1%',
            'A model that passes a canary can never be worse',
          ],
          answer: 1,
          why: 'Matching error rates and latency say that nothing broke. They say nothing about conversions, revenue or whatever the model is for. That takes a randomised comparison with a primary metric chosen in advance.',
        },
        {
          kind: 'choice',
          id: 'mlops-rollout-10',
          ask: 'An A/B test of a new model was planned for two weeks. After two days the new model is ahead by 1.5% with p = 0.04. The team has looked at the dashboard every morning and wants to stop and ship. What is the problem?',
          options: [
            'Nothing: p is below 0.05',
            'Checking daily and stopping at the first significant result makes false wins far more likely, and two days do not cover a weekly cycle',
            'A/B tests cannot be used for models',
            'The effect is too large to be real',
          ],
          answer: 1,
          why: 'Each look is another chance for noise to cross the line, so stopping when it first does inflates the false positive rate well beyond 5%. Weekday and weekend users also differ. Fix the length in advance and hold to it.',
        },
        {
          kind: 'choice',
          id: 'mlops-rollout-11',
          ask: 'A new model reads version 2 of a feature table; the old model reads version 1. On release day the team switches off the version 1 pipeline to save money. Three days later the new model has to be rolled back. What happens?',
          options: [
            'The old model works as before',
            'The old model has no fresh features to read: rollback was only possible on paper',
            'The new model retrains itself',
            'The registry restores version 1 of the table',
          ],
          answer: 1,
          why: 'A rollback restores everything the old version depends on, not only its weights. Keep the old pipeline running until the new model has proved itself, and test the rollback path before you need it.',
        },
        {
          kind: 'design',
          id: 'mlops-rollout-12',
          ask: 'Plan the rollout of a new ranking model for a shop\'s search results. It scored better offline than the model in production.',
          checklist: [
            { point: 'Offline gates: better on a fixed test set, no slice much worse, latency and memory within budget', why: 'It is the cheapest place to stop a bad model, and it fixes what "better" means.' },
            { point: 'Shadow mode on real traffic: latency, errors, score distribution, and logged features compared with training', why: 'It finds skew and performance problems before any user is affected.' },
            { point: 'A canary on a small share of users chosen by hash, with guardrail metrics and rollback rules written in advance', why: 'It limits the damage if something is wrong, and removes the argument about when to pull back.' },
            { point: 'An A/B test with one primary metric, such as purchases per search, and guardrails such as latency and returns', why: 'A ranking can raise clicks and lower sales. The primary metric must be the thing the business wants.' },
            { point: 'Length and sample size fixed beforehand, covering at least a full week', why: 'It prevents stopping early on noise and averages over weekday and weekend behaviour.' },
            { point: 'A tested rollback: the old model deployed and warm, one switch, old feature pipelines still running', why: 'The quickest fix for a bad release is to undo it, and that only works if it has been tried.' },
            { point: 'Monitoring and an owner for each stage of the ramp', why: 'Problems appear at 5%, 25% and 100% at different times, and someone has to be watching.' },
            { point: 'A plan for the feedback loop: a small holdback or some exploration after full launch', why: 'A ranker is trained on clicks from the positions it chose itself. Without a holdback its long-term effect cannot be measured.' },
          ],
          why: 'Each stage answers one question at the lowest risk that can answer it: does it work (offline), does it run (shadow), is it safe (canary), is it better (A/B), and can we undo it (rollback).',
        },
        {
          kind: 'design',
          id: 'mlops-rollout-13',
          ask: 'What goes into the release checklist for a model, to be ticked off before it takes real traffic?',
          checklist: [
            { point: 'Reproducible: code commit, data version, config and environment recorded; the artefact registered with a version', why: 'If it misbehaves you must be able to rebuild it and to say exactly what is running.' },
            { point: 'Evaluated on a fixed test set against the current model and a plain baseline, with slices', why: 'It shows the release is an improvement and that no group pays for the average.' },
            { point: 'Data tests in place for the inputs, and a feature parity check between training and serving', why: 'Most production failures are input failures, and skew is invisible without a comparison.' },
            { point: 'Performance measured under load on serving hardware: p95 and p99 latency, memory, throughput', why: 'A model that is accurate and too slow is not releasable.' },
            { point: 'Failure behaviour defined and tested: input validation, timeouts, fallback', why: 'Dependencies will fail. What users get then should be a decision, not an accident.' },
            { point: 'Monitoring, dashboards and alerts live before launch, and predictions logged with the model version', why: 'You cannot debug the first day of a release with monitoring added on the second.' },
            { point: 'A rollback plan that has been exercised', why: 'A rollback that has never been tried is a hope.' },
            { point: 'An owner, and notes on intended use, known limits and any privacy or fairness review', why: 'Someone must answer the alert, and the next engineer must know what the model is not for.' },
          ],
          why: 'The list covers the four ways a release goes wrong: the model is not what you think it is, it is not better, it does not run well, or nobody notices and nobody can undo it.',
        },
      ],
    },
    {
      id: 'mlops-retraining',
      title: 'Retraining and feedback loops',
      summary: 'When to retrain, what to retrain on, and what happens when a model writes its own training data.',
      widget: 'mlops-retrain',
      text: [
        'A model is a snapshot of the world on the day its training data ended, and the world moves on. Retraining refreshes the snapshot. There are two policies. On a **schedule**, weekly or monthly: predictable and easy to run, though it wastes compute when nothing has changed and is slow when something changes overnight. On a **trigger**, when a drift score, a live metric or the volume of new labels crosses a threshold: it reacts to events, and it is only as good as the monitoring behind it. Many teams run a schedule with a trigger as a backstop.',
        'A new model can only learn from rows whose outcomes have arrived, so the **label delay** limits how fresh it can be. With labels that take 30 days, the newest usable example is a month old however often you retrain. Choose the training window on purpose: recent data matches today\'s world, a longer history gives more rows. And evaluate on the most recent period, with a split by time. A random split lets the model study next week to predict last week.',
        'A retrained model is a new model and passes the same gates as any release: data checks before training, then a comparison with the model in service on the same recent held-out data. A pipeline that promotes whatever it trains will one day promote a model trained on a broken table.',
        'Models also change the data they later learn from: a **feedback loop**. A recommender shows some items, only shown items get clicks, and the clicks make those items look better still. A credit model rejects applicants and so never learns whether they would have repaid. A fraud model blocks payments whose true nature is then never known. The training data becomes a record of the model\'s own choices.',
        'The remedy is to keep a slice honest. Give a small random share of traffic a decision the model did not make: a random ordering, an approval that the model would have refused, within limits you can afford. That slice yields unbiased outcomes for measuring the model and for training it. Also keep a fixed test set to compare versions on equal terms, next to a fresh recent one, and do not tune on either.',
      ],
      rules: [
        'Schedule: predictable. Trigger: reacts to change, and needs monitoring you trust. Use both.',
        'Label delay sets how fresh a model can be, whatever the retraining interval.',
        'Split by time. Test on the most recent period.',
        'A retrained model goes through the same gates as any release. No automatic promotion.',
        'A model\'s decisions shape its future training data. Look for what it never gets to see.',
        'Keep a small random slice the model does not control, and compare versions on the same test set.',
      ],
      questions: [
        {
          kind: 'choice',
          id: 'mlops-retraining-1',
          ask: 'In the figure, set labels to arrive after 8 weeks, with retraining every 4 weeks: the average accuracy is about 0.815. Retrain every week instead and it reaches only 0.828, for four times the retrains. With no label delay, every 4 weeks gives 0.896. Why does retraining more often help so little?',
          options: [
            'Weekly retraining overfits',
            'Each new model learns from data that is already 8 weeks old, so it starts stale however often it is rebuilt',
            'The figure limits accuracy to 0.83',
            'Retraining too often damages the model',
          ],
          answer: 1,
          why: 'Staleness is the age of the newest labelled data, and the label delay is a floor under it. When labels are late, effort spent on getting labels or proxies sooner pays more than a tighter schedule.',
        },
        {
          kind: 'choice',
          id: 'mlops-retraining-2',
          ask: 'In the figure, choose "On a trigger", set labels to arrive after 8 weeks and retrain below 0.85. The model is retrained 26 times in the year. What has gone wrong?',
          options: [
            'The drift is too fast for any policy',
            'A freshly trained model already starts at about 0.83, below the trigger, so the trigger fires again as soon as it is allowed to',
            'Triggers do not work with label delay',
            'The schedule is still running in the background',
          ],
          answer: 1,
          why: 'A trigger set above what a new model can reach never switches off. Set thresholds from what a freshly trained model achieves, and give the trigger a minimum gap between retrains, as the figure does.',
        },
        {
          kind: 'choice',
          id: 'mlops-retraining-3',
          ask: 'A demand model is retrained on the first day of each month. On the 5th, a competitor closes and demand changes overnight. Forecasts are badly off for the rest of the month. What would have helped, and what does it need?',
          options: [
            'A longer training history, so that the event is averaged out',
            'A trigger that retrains when the live error crosses a threshold, which needs error monitoring you trust and outcomes that arrive quickly',
            'Retraining once a year, for stability',
            'A larger model',
          ],
          answer: 1,
          why: 'A schedule knows nothing about events. A trigger on the live error reacts within days. It can only fire if the outcome is measured promptly, and it still has to wait for enough data from after the change.',
        },
        {
          kind: 'output',
          id: 'mlops-retraining-4',
          ask: 'Labels arrive 30 days after a row is created. Today is day 100. What does this print?',
          code: `today = 100
label_delay = 30
rows = [{'day': d} for d in range(60, 100)]      # one row a day

usable = [r for r in rows if r['day'] + label_delay <= today]
print(len(usable), max(r['day'] for r in usable))`,
          answer: '11 70',
          why: 'Only rows from day 70 or earlier have their labels. Of the last 40 days of data, 11 can be trained on, and the newest of those is a month old.',
        },
        {
          kind: 'bug',
          id: 'mlops-retraining-5',
          ask: 'The split used to evaluate each retrained model. The test score is slightly too good every time.',
          code: `def retrain_split(rows, holdout_days=14):
    # rows are dicts with a 'day' number; test on the most recent days
    last = max(r['day'] for r in rows)
    cut = last - holdout_days
    train = [r for r in rows if r['day'] <= cut]
    test = [r for r in rows if r['day'] >= cut]
    return train, test`,
          line: 6,
          fix: "    test = [r for r in rows if r['day'] > cut]",
          why: 'Rows from the cut day land in both sets, so the model is tested on examples it trained on. The two sides of a time split must not overlap.',
        },
        {
          kind: 'choice',
          id: 'mlops-retraining-6',
          ask: 'Prices in your market roughly doubled three months ago. You have three years of sales history. How should the next model be trained and judged?',
          options: [
            'On all three years with equal weight, tested on a random 20% of rows',
            'On recent data, or with recent rows weighted more heavily, tested on the latest weeks. Try both windows and let that test decide',
            'On the oldest year only, because it is the most stable',
            'It should not be retrained until prices settle',
          ],
          answer: 1,
          why: 'Old rows describe a market that is gone, and they outnumber the new ones. A test on the most recent period tells you which window serves the present. A random split would reward fitting the old regime.',
        },
        {
          kind: 'choice',
          id: 'mlops-retraining-7',
          ask: 'A nightly job retrains a model and promotes it automatically. One night an upstream bug writes 0 into a key feature for every row. What happens, and which gate would have stopped it?',
          options: [
            'Nothing: the model ignores bad features',
            'A model trained on the broken table goes live. A data check before training, and a comparison with the current model on held-out data before promotion, would have stopped it',
            'The job fails with an error',
            'The old model is retrained by mistake',
          ],
          answer: 1,
          why: 'Training does not fail on a column of zeros. It learns that the feature is useless. Automatic retraining is fine. Automatic promotion without checks turns a data bug into a model bug.',
        },
        {
          kind: 'output',
          id: 'mlops-retraining-8',
          ask: 'Three items that users like equally. Each day the shop shows only the item with the most clicks so far. What does this print?',
          code: `clicks = {'A': 5, 'B': 5, 'C': 5}
appeal = {'A': 0.5, 'B': 0.5, 'C': 0.5}

for day in range(3):
    shown = max(clicks, key=clicks.get)          # ties go to the first item
    clicks[shown] += int(100 * appeal[shown])

print(clicks)`,
          answer: "{'A': 155, 'B': 5, 'C': 5}",
          why: 'A wins the first tie, is shown, gets clicks, and is shown for ever after. The data now says A is thirty times as popular as items that are exactly as good. The model created that evidence.',
        },
        {
          kind: 'choice',
          id: 'mlops-retraining-9',
          ask: 'A credit model approves applicants who score above a threshold. Each quarter it is retrained on the repayment outcomes of the loans it approved. What can it never learn, and what is the remedy?',
          options: [
            'How approved applicants behave; the remedy is a larger model',
            'Whether the applicants it rejects would have repaid; the remedy is to approve a small random sample below the threshold, within a loss you can afford',
            'How interest rates change; the remedy is to retrain daily',
            'Nothing is missing: more data always corrects a model',
          ],
          answer: 1,
          why: 'Rejected applicants produce no outcome, so a mistake about them can never be corrected and the model\'s view of that group hardens. A small random slice of approvals buys unbiased labels at a known cost.',
        },
        {
          kind: 'choice',
          id: 'mlops-retraining-10',
          ask: 'Each month a model is retrained and scored on a fresh random 10% of that month\'s data. Version 7 scored 0.88 on its month and version 8 scores 0.86 on its own. Is version 8 worse?',
          options: [
            'Yes: 0.86 is below 0.88',
            'You cannot tell: the two scores come from different test sets. Score both versions on the same recent data, and on a fixed test set',
            'No: newer models are always better',
            'Yes, and version 7 should be restored at once',
          ],
          answer: 1,
          why: 'A harder month lowers the score of any model. Versions can only be compared on the same examples. A fixed test set shows progress over time and a fresh one shows fitness for today, so keep both.',
        },
        {
          kind: 'number',
          id: 'mlops-retraining-11',
          ask: 'A model loses 0.5 points of accuracy for each week since it was trained, and labels arrive at once. It is retrained every 8 weeks. Averaged over a cycle, how many points below its fresh accuracy is it?',
          answer: 2,
          check: '0.5 * 8 / 2',
          why: 'The loss climbs evenly from 0 to 4 points and then resets, so it averages 2. The average age of a model on a schedule is half the interval: halving the interval halves the average loss and doubles the number of retrains.',
        },
        {
          kind: 'write',
          id: 'mlops-retraining-12',
          ask: 'Write the retraining policy: a schedule with triggers as a backstop. Return a list of the reasons to retrain, in this order: `\'schedule\'` when the model is at least `max_days` old, `\'drift\'` when the PSI is above `psi_limit`, `\'metric\'` when accuracy has fallen more than `max_drop` below the baseline. `accuracy` is None when no labels have arrived yet.',
          starter: `def retrain_reasons(days_since_training, psi, accuracy, baseline, max_days=30, psi_limit=0.25, max_drop=0.02):
    # returns a list such as [] or ['schedule', 'metric']
    pass`,
          solution: `def retrain_reasons(days_since_training, psi, accuracy, baseline, max_days=30, psi_limit=0.25, max_drop=0.02):
    reasons = []
    if days_since_training >= max_days:
        reasons.append('schedule')
    if psi > psi_limit:
        reasons.append('drift')
    if accuracy is not None and baseline - accuracy > max_drop:
        reasons.append('metric')
    return reasons`,
          tests: `out = retrain_reasons(5, 0.05, 0.90, 0.91)
assert out is not None, "the function returns nothing yet"
assert out == [], f"a young model with no drift and a steady metric needs no retraining, got {out}"
assert retrain_reasons(30, 0.05, 0.90, 0.91) == ['schedule'], "at max_days the schedule is due"
assert retrain_reasons(5, 0.30, 0.90, 0.91) == ['drift'], "a PSI above the limit is a reason"
assert retrain_reasons(5, 0.05, 0.85, 0.91) == ['metric'], "accuracy 6 points below the baseline is a reason"
assert retrain_reasons(5, 0.05, 0.95, 0.91) == [], "accuracy above the baseline is not a drop"
assert retrain_reasons(40, 0.40, 0.80, 0.91) == ['schedule', 'drift', 'metric'], "give every reason that applies, in the order schedule, drift, metric"
try:
    late = retrain_reasons(5, 0.05, None, 0.91)
except TypeError:
    raise AssertionError("accuracy can be None when labels have not arrived: skip the metric check then")
assert late == [], "with no labels yet there is no metric reason"`,
          why: 'The schedule bounds how old a model can get, the drift trigger works without labels, and the metric trigger is the direct one when labels exist. Returning the reasons, and not only yes or no, tells whoever reads the log why a retrain happened.',
        },
      ],
    },
    {
      id: 'mlops-lab',
      title: 'Lab: a monitoring and release gate',
      summary: 'Build the checks that stand between a model and its users, one function at a time.',
      text: [
        'This lab builds a small release gate in plain Python: the checks that run before and during a release and return a decision that a pipeline can act on. Each step is one function. Real systems use bigger tools for the same jobs, and the logic inside them is what you write here.',
        'The pieces follow the path of a release. A **schema check** stops broken input rows. **Binning with the training edges** and the **population stability index** measure whether live inputs still look like the training data. A **latency summary** holds the service to its budget. A **rolling error rate** raises an alert while the model is live. A **canary decision** compares the new model with the old on real traffic.',
        'The last function combines the results into one answer: ship, or hold with the reasons. A gate that gives reasons gets fixed. A gate that only says no gets bypassed.',
        'Every step stands alone. Where a step needs a function from an earlier one, it is given in the starter code.',
      ],
      rules: [
        'Check inputs before the model sees them: present, numeric, in range.',
        'Bin live data with the edges from training, and keep the outer bins open.',
        'Judge latency by percentiles against a budget, not by the mean.',
        'Alert on a rate over a window, never on a single event.',
        'Compare a canary with the control against the noise, and wait when there is too little data.',
        'A gate returns reasons, not only yes or no.',
      ],
      questions: [
        {
          kind: 'write',
          id: 'mlops-lab-1',
          ask: 'Step 1: the schema check. `schema` maps a column name to its allowed `(low, high)` range, ends included. Return a list of `(row index, column)` pairs, in row order and then schema order, for every value that is missing, None, not a number, or outside its range. Columns that are not in the schema are ignored.',
          starter: `def check_batch(rows, schema):
    # rows: a list of dicts.  schema: {'age': (18, 100), ...}
    pass`,
          solution: `def check_batch(rows, schema):
    problems = []
    for i, row in enumerate(rows):
        for name, (lo, hi) in schema.items():
            value = row.get(name)
            if not isinstance(value, (int, float)) or not lo <= value <= hi:
                problems.append((i, name))
    return problems`,
          tests: `schema = {'age': (18, 100), 'income': (0, 1000000)}
good = [{'age': 30, 'income': 52000.0}, {'age': 18, 'income': 0}]
out = check_batch(good, schema)
assert out is not None, "the function returns nothing yet"
assert out == [], f"valid rows, with values on the ends of the ranges, should give no problems, got {out}"
rows = [{'age': 30, 'income': 100}, {'age': 17, 'income': 100}, {'age': 40}, {'age': None, 'income': -5}]
try:
    found = check_batch(rows, schema)
except (KeyError, TypeError):
    raise AssertionError("a missing column or a None value must be reported, not crash the check")
assert found == [(1, 'age'), (2, 'income'), (3, 'age'), (3, 'income')], f"expected [(1, 'age'), (2, 'income'), (3, 'age'), (3, 'income')], got {found}"
try:
    text = check_batch([{'age': '42', 'income': 10}], schema)
except TypeError:
    raise AssertionError("a string where a number should be must be reported, not crash the check")
assert text == [(0, 'age')], "the string '42' is not a number: report it"
assert check_batch([{'age': float('nan'), 'income': 10}], schema) == [(0, 'age')], "NaN is inside no range: test for 'not low <= value <= high' and not for 'value < low or value > high'"
assert check_batch([{'age': 30, 'income': 10, 'note': 'x'}], schema) == [], "columns outside the schema are ignored"`,
          why: 'Type first, then range. Writing the range test as `not lo <= value <= hi` also catches NaN, which is neither below the low end nor above the high end and slips through the other form.',
        },
        {
          kind: 'write',
          id: 'mlops-lab-2',
          ask: 'Step 2: bin a feature with fixed edges. `edges` is a sorted list of cut points taken from the training data. With k edges there are k + 1 bins: below the first edge, between each pair, and from the last edge up. A value equal to an edge goes in the bin above it. Return the count in each bin.',
          starter: `def bin_counts(values, edges):
    # edges [10, 20] make three bins: under 10, 10 up to 20, 20 and over
    pass`,
          solution: `import bisect

def bin_counts(values, edges):
    counts = [0] * (len(edges) + 1)
    for v in values:
        counts[bisect.bisect_right(edges, v)] += 1
    return counts`,
          tests: `out = bin_counts([5, 15, 25], [10, 20])
assert out is not None, "the function returns nothing yet"
assert list(out) == [1, 1, 1], f"5, 15 and 25 fall in three different bins, got {out}"
assert list(bin_counts([10], [10, 20])) == [0, 1, 0], "a value equal to an edge belongs to the bin above the edge"
assert list(bin_counts([-100, 1000], [10, 20])) == [1, 0, 1], "values beyond the training range still count: the outer bins are open"
assert list(bin_counts([], [10, 20])) == [0, 0, 0], "no values gives a zero for every bin"
vals = [3, 7, 12, 12, 18, 20, 31, 45]
assert list(bin_counts(vals, [10, 20, 30])) == [2, 3, 1, 2], f"expected [2, 3, 1, 2], got {bin_counts(vals, [10, 20, 30])}"
assert sum(bin_counts(vals, [10, 20, 30])) == len(vals), "every value must land in exactly one bin"`,
          why: 'The edges are an input, fixed when the model was trained and saved with it. Open outer bins matter most: live values beyond anything seen in training are exactly what a monitor has to count.',
        },
        {
          kind: 'write',
          id: 'mlops-lab-3',
          ask: 'Step 3: the drift score. Using `bin_counts`, write the population stability index of a feature between its training values and its live values: shares per bin, each floored at `eps`, then `Σ (live − train) × ln(live ÷ train)`.',
          starter: `import bisect, math

def bin_counts(values, edges):
    counts = [0] * (len(edges) + 1)
    for v in values:
        counts[bisect.bisect_right(edges, v)] += 1
    return counts

def drift_score(train_values, live_values, edges, eps=1e-4):
    # bin both with the same edges, turn counts into shares, add up the PSI
    pass`,
          solution: `import bisect, math

def bin_counts(values, edges):
    counts = [0] * (len(edges) + 1)
    for v in values:
        counts[bisect.bisect_right(edges, v)] += 1
    return counts

def drift_score(train_values, live_values, edges, eps=1e-4):
    train = bin_counts(train_values, edges)
    live = bin_counts(live_values, edges)
    total = 0.0
    for t, l in zip(train, live):
        a = max(t / len(train_values), eps)
        b = max(l / len(live_values), eps)
        total += (b - a) * math.log(b / a)
    return total`,
          tests: `train = [5] * 50 + [15] * 50
out = drift_score(train, train, [10])
assert out is not None, "the function returns nothing yet"
assert abs(out) < 1e-12, f"a feature compared with itself should score 0, got {out}"
assert abs(drift_score(train, [5] * 5 + [15] * 5, [10])) < 1e-12, "use shares: a live sample of a different size with the same mix should score 0"
live = [5] * 25 + [15] * 75
assert abs(drift_score(train, live, [10]) - 0.274653) < 1e-5, f"a 50/50 split against 25/75 should give about 0.2747, got {drift_score(train, live, [10])}"
try:
    far = drift_score(train, [25] * 100, [10, 20])
except (ZeroDivisionError, ValueError):
    raise AssertionError("an empty bin breaks the division or the logarithm: floor each share at eps")
assert far > 1, "live values that all fall in a bin that was empty in training should give a very large score"`,
          why: 'Binning with the same edges, shares in place of counts, a floor for empty bins, and one sum. This function and a saved list of edges per feature make a working drift monitor.',
        },
        {
          kind: 'output',
          id: 'mlops-lab-4',
          ask: 'Step 4: read the monitor. The functions from steps 2 and 3 are applied to one feature. What does this print?',
          code: `import bisect, math

def bin_counts(values, edges):
    counts = [0] * (len(edges) + 1)
    for v in values:
        counts[bisect.bisect_right(edges, v)] += 1
    return counts

def psi(train, live, eps=1e-4):
    a = [max(c / sum(train), eps) for c in train]
    b = [max(c / sum(live), eps) for c in live]
    return sum((y - x) * math.log(y / x) for x, y in zip(a, b))

edges = [20, 40, 60]
train = bin_counts([10, 15, 25, 30, 35, 45, 50, 55, 65, 70], edges)
live = bin_counts([45, 50, 55, 58, 62, 65, 70, 75, 80, 30], edges)
print(train, live, psi(train, live) > 0.25)`,
          answer: '[2, 3, 3, 2] [0, 1, 4, 5] True',
          hint: 'Count how many values fall under 20, from 20 up to 40, from 40 up to 60, and from 60 up.',
          why: 'The live values have moved up: nothing is under 20 any more and half are at 60 or over. The empty first bin alone adds about 1.5 to the score, far past the 0.25 line.',
        },
        {
          kind: 'write',
          id: 'mlops-lab-5',
          ask: 'Step 5: the latency check. Using the nearest-rank `percentile`, return a dict with `p50`, `p95` and `p99` of the request times, and `ok`: True when p95 is within the budget.',
          starter: `import math

def percentile(values, p):
    ordered = sorted(values)
    return ordered[max(math.ceil(p * len(ordered) / 100), 1) - 1]

def latency_summary(times_ms, budget_ms):
    # returns {'p50': ..., 'p95': ..., 'p99': ..., 'ok': True or False}
    pass`,
          solution: `import math

def percentile(values, p):
    ordered = sorted(values)
    return ordered[max(math.ceil(p * len(ordered) / 100), 1) - 1]

def latency_summary(times_ms, budget_ms):
    p95 = percentile(times_ms, 95)
    return {'p50': percentile(times_ms, 50), 'p95': p95, 'p99': percentile(times_ms, 99), 'ok': p95 <= budget_ms}`,
          tests: `times = list(range(1, 101))
out = latency_summary(times, 95)
assert out is not None, "the function returns nothing yet"
assert out == {'p50': 50, 'p95': 95, 'p99': 99, 'ok': True}, f"for the times 1..100 and a budget of 95, expected p50 50, p95 95, p99 99 and ok True, got {out}"
assert latency_summary(times, 94)['ok'] == False, "a p95 of 95 ms is over a budget of 94 ms"
tail = [10] * 98 + [500, 1000]
out = latency_summary(tail, 100)
assert out['p50'] == 10 and out['p99'] == 500, f"98 fast requests and 2 slow ones: p50 is 10 and p99 is 500, got {out}"
assert out['ok'] == True, "the budget is judged on p95, which is 10 ms here"
slow = [10] * 90 + [400] * 10
assert latency_summary(slow, 100)['ok'] == False, "when 10% of requests take 400 ms, p95 is 400 ms: judge the budget on p95, not on the mean (49 ms) or the median"`,
          why: 'The budget is a statement about a percentile. In the last test the mean is 49 ms, well inside 100, while one user in ten waits 400 ms. A gate on the mean would have passed it.',
        },
        {
          kind: 'write',
          id: 'mlops-lab-6',
          ask: 'Step 6: a rolling error-rate alert. `outcomes` is a list with 1 for a failed request and 0 for a good one, in order. Return the index of the first request at which the error rate over the last `window` requests is above `threshold`. Only full windows count. Return None if that never happens.',
          starter: `def rolling_alert(outcomes, window, threshold):
    # index of the request that completes the first bad window, or None
    pass`,
          solution: `def rolling_alert(outcomes, window, threshold):
    for i in range(window - 1, len(outcomes)):
        if sum(outcomes[i - window + 1:i + 1]) / window > threshold:
            return i
    return None`,
          tests: `assert rolling_alert([1, 1, 1, 1], 2, 0.5) is not None, "the function returns nothing yet"
assert rolling_alert([1, 1, 1, 1], 2, 0.5) == 1, "the first full window of 2 ends at index 1"
assert rolling_alert([0, 0, 1, 1, 0, 0], 2, 0.5) == 3, "the window (0, 1) has a rate of 0.5, which is not above 0.5; the window (1, 1) ending at index 3 is"
assert rolling_alert([1, 0, 0, 0, 0], 4, 0.2) == 3, "1 error in the first 4 requests is 25%, above 20%"
assert rolling_alert([1], 4, 0.2) is None, "one failed request is not a full window: do not alert on it"
assert rolling_alert([0] * 50, 10, 0.1) is None, "no errors, no alert"
assert rolling_alert([0] * 10 + [1] * 3, 5, 0.4) == 12, "the rate over the last 5 requests first goes above 40% at index 12"
assert rolling_alert([0, 1, 0, 0, 0, 0, 1, 0, 0, 0], 5, 0.3) is None, "two errors far apart never share a bad window"`,
          why: 'A window turns single events into a rate, and waiting for a full window keeps one early failure from reading as 100%. The window length is the trade: short reacts fast and flaps, long is steady and slow.',
        },
        {
          kind: 'write',
          id: 'mlops-lab-7',
          ask: 'Step 7: the canary decision. Return `\'rollback\'` when the canary\'s error rate is above the control\'s by more than `z` standard errors of the difference, whatever the sample size. Otherwise return `\'wait\'` while the canary has fewer than `min_n` requests, and `\'promote\'` once it has enough.',
          starter: `import math

def canary_decision(control_errors, control_n, canary_errors, canary_n, min_n=500, z=2.0):
    # standard error of the difference: sqrt(p1 * (1 - p1) / n1 + p2 * (1 - p2) / n2)
    pass`,
          solution: `import math

def canary_decision(control_errors, control_n, canary_errors, canary_n, min_n=500, z=2.0):
    p1 = control_errors / control_n
    p2 = canary_errors / canary_n
    se = math.sqrt(p1 * (1 - p1) / control_n + p2 * (1 - p2) / canary_n)
    if p2 - p1 > z * se:
        return 'rollback'
    if canary_n < min_n:
        return 'wait'
    return 'promote'`,
          tests: `out = canary_decision(100, 10000, 5, 500)
assert out is not None, "the function returns nothing yet"
assert out == 'promote', f"1% against 1% with enough canary traffic: promote, got {out!r}"
assert canary_decision(100, 10000, 1, 100) == 'wait', "the same rates on only 100 canary requests: not enough to promote yet"
assert canary_decision(100, 10000, 25, 500) == 'rollback', "5% against 1% on 500 requests is far outside the noise"
assert canary_decision(100, 10000, 30, 100) == 'rollback', "30% errors is clearly worse even on 100 requests: do not wait for min_n to roll back"
assert canary_decision(100, 10000, 2, 100) == 'wait', "2 errors in 100 is twice the rate but within noise, and the sample is small: wait"
assert canary_decision(100, 10000, 0, 500) == 'promote', "a canary with fewer errors and enough traffic is promoted"
assert canary_decision(0, 1000, 0, 1000) == 'promote', "no errors on either side and enough traffic: promote"`,
          why: 'The order of the tests is the policy. Clear harm ends the canary at once, even on little data. The absence of harm only counts once there is enough traffic for harm to have shown.',
        },
        {
          kind: 'write',
          id: 'mlops-lab-8',
          ask: 'Step 8: the gate. Combine the results of the checks into one answer. Return a list of the reasons to hold the release, in this order: `\'schema\'` if there are schema problems; `\'drift: <feature>\'` for each feature with a PSI above `psi_limit`, in alphabetical order; `\'latency\'` if the latency check failed; `\'canary\'` if the canary decision is not `\'promote\'`. An empty list means ship.',
          starter: `def release_gate(report, psi_limit=0.25):
    # report = {'schema_problems': [...], 'psi': {'age': 0.03, ...}, 'latency_ok': True, 'canary': 'promote'}
    pass`,
          solution: `def release_gate(report, psi_limit=0.25):
    reasons = []
    if report['schema_problems']:
        reasons.append('schema')
    for name in sorted(report['psi']):
        if report['psi'][name] > psi_limit:
            reasons.append('drift: ' + name)
    if not report['latency_ok']:
        reasons.append('latency')
    if report['canary'] != 'promote':
        reasons.append('canary')
    return reasons`,
          tests: `clean = {'schema_problems': [], 'psi': {'age': 0.03, 'income': 0.08}, 'latency_ok': True, 'canary': 'promote'}
out = release_gate(clean)
assert out is not None, "the function returns nothing yet"
assert out == [], f"every check passed, so the list should be empty, got {out}"
assert release_gate({**clean, 'schema_problems': [(3, 'age')]}) == ['schema'], "schema problems hold the release"
assert release_gate({**clean, 'psi': {'income': 0.31, 'age': 0.4, 'visits': 0.1}}) == ['drift: age', 'drift: income'], "name each drifting feature, in alphabetical order"
assert release_gate({**clean, 'latency_ok': False}) == ['latency'], "a failed latency check holds the release"
assert release_gate({**clean, 'canary': 'wait'}) == ['canary'], "a canary that is still waiting is not a pass"
assert release_gate({**clean, 'canary': 'rollback'}) == ['canary'], "a canary that should be rolled back holds the release"
bad = {'schema_problems': [(0, 'age')], 'psi': {'age': 0.5}, 'latency_ok': False, 'canary': 'rollback'}
assert release_gate(bad) == ['schema', 'drift: age', 'latency', 'canary'], "give every reason, in the order schema, drift, latency, canary"
assert release_gate({**clean, 'psi': {'age': 0.2}}, psi_limit=0.1) == ['drift: age'], "use the psi_limit that was passed in"`,
          why: 'The gate is a few comparisons. Its value is that the rules are written down, run the same way every time, and say why. An engineer who reads "drift: income" knows where to look.',
        },
        {
          kind: 'design',
          id: 'mlops-lab-9',
          ask: 'Step 9: put it to work. You now have a schema check, a drift score, a latency summary, a rolling alert, a canary decision and a gate. Where does each one run in the life of a model, and what is still missing before you would trust this as the release process?',
          checklist: [
            { point: 'The schema check runs on every batch before training and on every request or batch before prediction', why: 'Bad rows should be stopped at the door in both places, by the same rules.' },
            { point: 'Bin edges and training shares are computed once at training time and saved with the model version', why: 'Drift is measured against what this model was trained on, so the reference must travel with it.' },
            { point: 'Drift scores run on a schedule over live inputs and over the model\'s scores, with thresholds set from healthy weeks', why: 'A fixed 0.25 is a starting point. Each feature has its own normal amount of movement.' },
            { point: 'The latency summary runs in a load test before release and continuously in production', why: 'A budget met on a laptop says little about p95 under real traffic.' },
            { point: 'The rolling alert runs live, has an owner and a first action, and counts fallbacks as well as errors', why: 'An alert nobody owns is not acted on, and a fallback is a failure that returns status 200.' },
            { point: 'The canary decision runs automatically during the ramp, wired to a rollback that has been tested', why: 'A decision that waits for a person at 3 a.m. is slower than the damage.' },
            { point: 'Missing: outcome metrics once labels arrive, overall and by slice, compared with the previous model', why: 'Every check so far is about inputs and system health. None of them says whether the predictions are right.' },
            { point: 'Missing: a record of each gate result with the model, data and config versions', why: 'When a release goes wrong you need to know what the gate saw and what exactly was shipped.' },
          ],
          why: 'The functions are the easy part. A release process is those functions run at the right moments, against references saved at training time, with thresholds from a baseline, owners for the alerts, and the outcome metric added as soon as labels allow.',
        },
      ],
    },
  ],
}
