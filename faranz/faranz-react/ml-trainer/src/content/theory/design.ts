import type { Block } from '../../types'

/** The full theory for each lesson of the design module, keyed by lesson id. */
export const designTheory: Record<string, Block[]> = {
  'design-framework': [
    { h: 'What a design question is' },
    'A **machine learning system** is the whole chain around a model: where the data and labels come from, how a prediction is computed when needed, what the product does with it, and how you notice when it goes wrong. A design question asks you to plan that chain from a vague request such as "use ML to make deliveries more reliable". The asker wants to see you turn it into decisions, each said out loud with the option you turned down. A fixed order of steps stops you skipping the ones that sink real projects.',
    { sub: 'The nine steps' },
    {
      list: [
        '**Goal and constraints**: who uses it, what decision the prediction drives, how many requests, how fast, what each kind of mistake costs.',
        '**Metrics**: one the business watches in the live product, one you can compute on old data.',
        '**Task and baseline**: the exact input, output and moment of prediction, plus a rule with no ML that you must beat.',
        '**Data and labels**: where the right answers come from, how late, and for which cases they are missing.',
        '**Features**: the inputs, limited to what is known when the prediction is made.',
        '**Model**: the simplest thing that can work.',
        '**Serving**: how the prediction reaches the product, inside a time limit, with a fallback.',
        '**Evaluation and rollout**: test the way it will be used, then release in small steps.',
        '**Monitoring**: what will drift or break, and how you will see it.',
      ],
    },
    'One example runs through this lesson: a food delivery app wants to warn customers, at the moment they order, when their order is likely to arrive more than 15 minutes late.',

    { h: 'Goal, metrics and baseline' },
    { sub: 'Clarifying the goal' },
    'Before any design, ask: who sees the warning and what do they do with it, how many orders an hour, how long the app can wait, and which mistake is worse (a false warning, or silence about a very late order). The answers decide almost everything later. Scoring 5,000 restaurants one by one is easy; scoring 50 million items is not.',
    { sub: 'Two kinds of metric' },
    'A **metric** is a number that says how well something works. The **product metric** (or online metric) is what the business watches in the live app, such as complaints per thousand orders; it exists only once real users see the system. The **offline metric** is computed on logged data before launch, such as the share of truly late orders the model would have flagged. You need both, and a reason to believe they move together.',
    'Pick metrics that cannot rise while the product gets worse: rewarded for "warnings shown", the model would warn on every order. Add **guardrail metrics**, numbers that must not get worse, such as the cancellation rate.',
    { sub: 'The baseline' },
    'A **baseline** is the score of a simple method with no machine learning, on the same data, such as "warn when it is raining and the restaurant is over 5 km away". A model score means nothing alone: against a baseline of 0.71, a model at 0.73 adds little; against 0.55, it does real work.',
    'Work the baseline out by hand. Of 1,000 orders, 40 were late. A "model" that never warns is right on 960, an **accuracy** (share of correct predictions) of 0.96, while catching no late order. When one class is rare, accuracy flatters a useless rule.',
    {
      code: `labels = [0] * 960 + [1] * 40     # 1 means late
never_warn = labels.count(0) / len(labels)
print(never_warn)`,
      out: '0.96',
    },
    'A reminder from the evaluation module: **AUC** is a score between 0.5 (random guessing) and 1 (perfect) for how well a model ranks positives above negatives. "Above 0.5" is not the test. "Above the baseline by a margin worth the cost" is.',

    { h: 'Labels and features' },
    'A **label** is the right answer you train on, here "arrived more than 15 minutes late", from delivery timestamps. Labels are usually the weak point: ask who produces them, when, and for which cases they are missing. If labels came from complaints instead, every late order nobody complained about would be filed as on time.',
    'A **feature** is an input to the model, and it must be known at the moment of prediction. The courier\'s actual pickup time sits in the historical table next to the label, but at order time it does not exist yet. Using it is **leakage**: offline results look excellent and the live model fails.',

    { h: 'Model and serving' },
    'Start with **logistic regression** or **gradient-boosted trees** (many small decision trees added together; strong on tables of numbers). Say what evidence would make you move to something larger, such as error analysis showing that a free-text field carries signal the trees cannot use.',
    'Serving is a time budget. If the app must answer within 250 ms and network plus the rest of the backend take 170 ms, the model has 80 ms for fetching features, scoring and any clean-up. Plan a **fallback**, usually the baseline rule, for when the model is slow or down.',

    { h: 'Rollout and monitoring' },
    'Evaluate offline on a split that copies real use: train on older weeks, test on later weeks. Then run in **shadow mode**: the new model scores live traffic beside the old system, but its answers are only logged. That finds missing features and slow responses with no customer affected. Next comes an **A/B test**: a small share of users (often 1%) gets the new system, and you compare the product metric and guardrails between the groups. A release gate in code compares against the baseline, not a fixed number:',
    {
      code: `def gain_over_baseline(model_score, baseline_score):
    return round(model_score - baseline_score, 3)

print(gain_over_baseline(0.73, 0.71))`,
      out: '0.02',
    },
    'Monitoring then covers the inputs, the predictions, and the real metric once the labels arrive.',

    { h: 'How answers go wrong' },
    {
      list: [
        'Naming a model architecture in the first minute, before the goal and scale are known.',
        'No baseline, or an offline metric that can improve while the product gets worse.',
        'Assuming the labels exist and are clean, or using a feature known only after the decision.',
        'Tuning on the test set until the result looks better. That uses it up as evidence.',
      ],
    },
    'In a 45-minute interview, a rough split is 10 minutes on the first three steps, 20 on the next four, and the rest on rollout and monitoring. It is a rule of thumb.',
  ],

  'design-estimates': [
    { h: 'Why rough numbers come first' },
    'A **back-of-envelope estimate** is a sum you do in a minute with rounded numbers to learn the size of a problem. You do not need the exact answer, only one within about a factor of two. That is enough to decide whether you can score every item, whether an index fits in a machine\'s memory, and how many machines you will pay for.',
    'Round hard. A day has 24 × 60 × 60 = 86,400 seconds. For mental sums many people use 100,000, which gives answers about 14% too low. That is fine for picking an architecture.',

    { h: 'Requests per second' },
    { sub: 'Average load' },
    '**QPS** means queries (requests) per second. The average is daily users × requests per user ÷ seconds in a day. Example: 4 million users making 30 requests each is 120 million requests a day. 120,000,000 ÷ 86,400 ≈ 1,389 QPS. With the shortcut, 120,000,000 ÷ 100,000 = 1,200. Both say "about a thousand or so".',
    'A common slip is dividing by 24 × 60 = 1,440. That is the number of minutes in a day, so it gives requests per minute, 60 times too high.',
    { sub: 'Peak load and replicas' },
    'Traffic is not flat. The evening **peak** is often 2 to 5 times the average, and you size for the peak. A **replica** is one copy of the service running on its own machine or process. If a replica handles one request at a time and each takes 40 ms, it serves 1000 ÷ 40 = 25 QPS. You plan to run it at about 70% of that (its **utilisation**), so a spike or a lost machine does not tip the service over.',
    'Replicas = peak QPS ÷ (QPS per replica × utilisation), rounded up. With an average of 1,000 QPS, a peak factor of 4, 25 QPS per replica and 70%: peak is 4,000, each replica is planned at 25 × 0.7 = 17.5, and 4,000 ÷ 17.5 = 228.6, so 229 replicas. Always round up: 228 would leave the peak short.',
    {
      code: `import math

def replicas(avg_qps, peak_factor, latency_ms, utilisation=0.7):
    per_replica = 1000 / latency_ms
    return math.ceil(avg_qps * peak_factor / (per_replica * utilisation))

print(replicas(1000, 4, 40))
print(replicas(1000, 4, 20))`,
      out: `229
115`,
    },
    'Halving the time per request doubles what each replica serves, so the replica count roughly halves. Replicas grow with peak QPS × latency. A faster model, a cache or batching pays back directly in machines.',

    { h: 'Latency budgets' },
    '**Latency** is how long one request takes. The budget starts from what the user feels and you subtract each stage. Stages that run one after another add up. Stages that run in parallel cost as much as the slowest one.',
    { sub: 'Percentiles' },
    'Budgets are set against a **percentile**, not the average. The **p99** latency is the time that 99% of requests beat; the slowest 1% take longer. At scale 1% is a lot: at 5,000 QPS, 1% is 50 requests every second slower than p99, over 4 million a day.',
    { sub: 'How many items you can score' },
    'Say the budget is 250 ms, and network, fetching candidates and fetching features take 50, 35 and 25 ms in sequence. That leaves 250 − 110 = 140 ms. If scoring one item takes 0.5 ms, you can score 140 ÷ 0.5 = 280 items. The number of items the model sees is not a free choice: it falls out of the budget.',
    {
      code: `budget = 250
used = {'network': 50, 'candidates': 35, 'features': 25}
left = budget - sum(used.values())
print(left, int(left / 0.5))`,
      out: '140 280',
    },
    'Any slack that is left over is what protects the p99 when one stage has a slow moment.',

    { h: 'Storage' },
    'Storage is count × size of one thing. A **float32** number takes 4 bytes. An **embedding** (a list of numbers that stands for an item, from the maths module) of 128 dimensions therefore takes 128 × 4 = 512 bytes. For 50 million items: 50,000,000 × 512 = 25.6 × 10⁹ bytes, about 25.6 GB (taking 1 GB as 10⁹ bytes).',
    'Whether that fits in the memory of one machine decides the design. An ordinary server might have 64 GB. Above that you **shard** (split the index across machines) or compress the vectors. **Product quantisation** is one compression method that can shrink an index ten times or more, at some cost in how many true neighbours it finds.',
    'The same sum sizes a feature store, a database of precomputed inputs per user. 5 million users × 100 float32 features × 4 bytes = 2 GB, which fits comfortably in memory.',

    { h: 'Training data and cost' },
    { sub: 'Log volume' },
    'Training data is events per day × bytes per event × days kept. 200 million impressions a day at 2 KB each is 4 × 10¹¹ bytes, 0.4 TB a day (1 TB = 10¹² bytes), so 12 TB for 30 days. Numbers like this are why systems keep only a sample of the negative examples and train on a cluster.',
    { sub: 'Cost per thousand predictions' },
    'Cost per thousand = machine price per hour ÷ predictions per hour × 1,000. A machine at $2.40 an hour serving a steady 200 predictions per second makes 200 × 3,600 = 720,000 predictions an hour. $2.40 ÷ 720,000 × 1,000 ≈ $0.0033 per thousand. A call to a large language model can cost hundreds or thousands of times more, so do this sum before you design around one.',

    { h: 'Mistakes in quick sums' },
    {
      list: [
        'Sizing for the average and not the peak. The service falls over every evening.',
        'Forgetting headroom, or rounding replicas down.',
        'Adding stages that run in parallel. Take the slowest one instead.',
        'Budgeting against average latency. The tail is many users.',
        'Mixing up bits and bytes, or minutes and seconds.',
      ],
    },
  ],

  'design-recsys': [
    { h: 'What a recommendation feed does' },
    'A **recommender** picks, for one user at one moment, a short list of items from a huge catalogue: songs, videos, products, posts. The example in this lesson is the home screen of a music app with 8 million daily users and 30 million songs, showing 25 songs each time the app opens, with about 200 ms of server time.',
    'The product metric is time spent listening, with **guardrails** (numbers that must not get worse) such as hides and next-week return, because time alone can be pushed up by content people regret.',

    { h: 'The funnel' },
    'No model can score 30 million songs in 200 ms: at 0.01 ms each that is 300 seconds. So the work is split into stages, each handling fewer items more carefully than the one before. This shape is a **funnel**.',
    {
      list: [
        '**Candidate generation** (also called **retrieval**): pick about 1,000 songs out of 30 million, quickly and roughly.',
        '**Light ranking**: a small model scores those 1,000 and keeps the best few hundred.',
        '**Heavy ranking**: a larger model scores the survivors carefully.',
        '**Re-ranking**: apply rules a score cannot express, then cut to the 25 shown.',
      ],
    },
    { sub: 'Retrieval with two towers' },
    'A common retrieval model is the **two-tower** model. One small network (the user tower) turns the user\'s history into an **embedding**, a list of, say, 64 numbers; another (the item tower) does the same for each song. They are trained so that a user lands close to the songs that user enjoys. Song embeddings are computed in advance and stored in an **approximate nearest-neighbour index** (ANN), which finds the closest vectors without checking all of them. So retrieval takes about 20 ms however large the catalogue grows.',
    'Check that the index fits in memory: 30 million songs × 64 numbers × 4 bytes (a float32) = 7.68 × 10⁹ bytes, about 7.7 GB. That fits on one serving machine.',
    'Other sources sit beside the embedding search: new songs from followed artists, songs popular this week. Their scores cannot be compared, so a simple merge takes one item from each source in turn, skipping any already taken, until the list is full.',
    { sub: 'Ranking' },
    'The ranker predicts P(listened ≥ 30 s), the probability the user plays the song for at least 30 seconds. A good first ranker is **gradient-boosted trees** (many small decision trees added together), with user features (recent listens, counts over 1, 7 and 30 days), song features (age, artist, genre, share of plays that finish) and context (time of day, device).',
    { sub: 'Re-ranking' },
    'Each score is computed for one song alone, so the ranker cannot see that its top ten are by one artist. Re-ranking fixes the list as a whole: at most two songs per artist, a few slots for new releases, nothing played in the last hour.',
    {
      code: `ranked = ['x1', 'x2', 'y1', 'x3', 'z1', 'y2']   # first letter = artist
feed, count = [], {}
for song in ranked:
    artist = song[0]
    if count.get(artist, 0) < 2:
        feed.append(song)
        count[artist] = count.get(artist, 0) + 1
print(feed)`,
      out: "['x1', 'x2', 'y1', 'z1', 'y2']",
    },
    '`count.get(artist, 0)` reads how many songs by that artist are already in the feed, with 0 if none yet. `x3` is dropped although it scored fourth.',

    { h: 'Working out the time budget' },
    'Each stage costs (items × time per item) plus any fixed time, and stages in sequence add. Take retrieval 20 ms, a light ranker on 1,000 songs at 0.01 ms each (10 ms), a heavy ranker on 150 songs at 0.4 ms each (60 ms) and re-ranking 5 ms. Total: 20 + 10 + 60 + 5 = 95 ms.',
    'The heavy ranker dominates. If the budget is too tight, cut the number of songs it sees by letting the light ranker filter harder. Do not cut retrieval: retrieving fewer saves little time and loses songs you never get to consider. If the ranker times out, serve the **baseline**: the most-played songs of the last day in the user\'s country.',

    { h: 'Labels and their biases' },
    'Labels come from behaviour, called **implicit feedback**: a song played for at least 30 seconds is a positive, one skipped quickly a negative. A click alone rewards attractive titles and covers. Explicit star ratings are honest but too rare to train on.',
    { sub: 'Two biases' },
    'First, only songs the old system chose to show have labels. Second, **position bias**: items shown higher get more plays whatever their quality. If slot 1 gets four times the plays of slot 8, part of that gap is the slot itself. Fixes: give position to the model as a training feature and set it to one fixed value when serving, or shuffle a small share of slots at random to measure the effect.',

    { h: 'Measuring each stage' },
    { sub: 'Recall at k for retrieval' },
    'Retrieval has one job: not to lose the good songs. **Recall at k** is the share of the songs the user went on to play that appear in the first k candidates. If the user played 4 songs and 3 of them were among the 1,000 candidates, recall at 1,000 is 3 ÷ 4 = 0.75. You divide by the number of songs played, not by k. Dividing by k gives **precision at k** (3 ÷ 1,000 = 0.003), a different question.',
    {
      code: `def recall_at_k(candidates, played, k):
    hits = len(set(candidates[:k]) & set(played))
    return hits / len(played)

print(recall_at_k(['a', 'b', 'c', 'd'], ['b', 'd', 'q', 'r'], 3))`,
      out: '0.25',
    },
    '`&` between two sets keeps the items in both. Only `b` is in the first 3 candidates, so recall is 1 ÷ 4.',
    { sub: 'Ranking metrics' },
    'The ranker is judged on order: **NDCG at k** rewards putting the best items highest (it is explained step by step in the search lesson), and **log loss** measures how good the predicted probabilities are. Neither matters for retrieval, because the ranker reorders the candidates anyway.',
    { sub: 'The offline/online gap' },
    'Offline numbers come from logs gathered under the old system, while a new ranker would surface different songs with no labels. So an offline gain often shrinks online. The **A/B test** decides: 1% of users, then 5%, for at least a week so weekday patterns and novelty wash out.',

    { h: 'Cold start and feedback loops' },
    '**Cold start** is the problem of a new item or user with no interactions. Waiting is circular: no plays, no labels, no plays. Give the item tower content features (genre, audio, artist) so a new song gets an embedding at once, and reserve a few slots for new songs so they earn their first labels. New users get popular items.',
    'A feed trains on what it showed, so popular songs get more popular. That is a **feedback loop**. Monitor the share of plays going to the top 1% of songs, the share of new songs, the freshness of features and the mix of candidate sources.',
  ],

  'design-search': [
    { h: 'How search differs from a feed' },
    'Search is the recommendation funnel with a query in front: the user says what they want in a few words, and the right results must be at the top. The example is an online bookshop with 2 million books, 20 million searches a day and about 200 ms at p99 (the time 99% of requests beat). The product metric is purchases per search session, with the **zero-result rate** (searches that return nothing) and latency as guardrails.',

    { h: 'The path of a query' },
    { sub: 'Query understanding' },
    'Before retrieval, fix spelling and recognise parts such as an author or format ("tolkein hobit paperback" becomes author Tolkien, title word "hobbit", format paperback). Keyword retrieval on a misspelt word returns little, and the ranker only orders what retrieval returns, so these cheap steps (about 20 ms) often help more than a better ranker.',
    { sub: 'Two retrievers in parallel' },
    '**BM25** is a classic keyword score: a document scores higher when it contains the query words, especially rare ones, and lower when it is very long. It is strong on exact matches such as an ISBN or a precise title. **Vector retrieval** embeds the query and each book and finds the closest vectors; it catches synonyms and paraphrases that keywords miss. Run both at the same time. Stages that run in parallel cost as much as the slowest one: if keyword search takes 25 ms and vector search 35 ms, the pair costs 35, not 60. With 20 ms of query understanding and a 90 ms ranker, the request takes 20 + 35 + 90 = 145 ms.',
    { sub: 'Merging the two lists' },
    'BM25 scores and vector similarities have different scales, so adding them lets one drown the other. **Reciprocal rank fusion** uses only positions. Each document scores 1 ÷ (k + rank) for each list it appears in, rank counted from 1, and the scores add. k is a constant, often 60, that stops the first place from dominating.',
    {
      code: `def rrf(rankings, k=60):
    scores = {}
    for ranking in rankings:
        for rank, doc in enumerate(ranking, start=1):
            scores[doc] = scores.get(doc, 0) + 1 / (k + rank)
    return sorted(scores, key=scores.get, reverse=True)

print(rrf([['x', 'y', 'z'], ['z', 'x']]))`,
      out: "['x', 'z', 'y']",
    },
    'Here x scores 1/61 + 1/62 and z scores 1/63 + 1/61, so x edges ahead; y appears once and comes last. `enumerate(..., start=1)` makes ranks start at 1.',
    { sub: 'The learned ranker' },
    'The ranker scores a few hundred merged candidates using features such as BM25 scores for title and description, query and book embedding similarity, popularity, rating, price, stock, age and whether the detected format matches. A standard first choice is gradient-boosted trees with a ranking objective called **LambdaMART**, trained on groups of results that belong to the same query. Later a **cross-encoder**, a model that reads query and title together, can re-score the top 50. The baseline is BM25 with a popularity boost, and it is also the fallback.',

    { h: 'Metrics for the top of the list' },
    { sub: 'Precision at k' },
    '**Precision at k** is the share of the first k results that are relevant. If the first four results are relevant, not, not, relevant, precision at 4 is 2 ÷ 4 = 0.5. It ignores order inside the top k.',
    { sub: 'MRR' },
    'When a query has one right answer ("return policy" on a help site), what matters is how far down the user must look. The **reciprocal rank** is 1 ÷ the position of the first right result, or 0 if it never appears. **MRR** (mean reciprocal rank) averages that over queries. Right answers at positions 2, 1 and 4 give (0.5 + 1 + 0.25) ÷ 3 ≈ 0.58. Moving an answer from position 2 to 1 gains far more than moving it from 9 to 8.',
    { sub: 'DCG and NDCG' },
    'When results have graded relevance (perfect 3, good 2, fair 1, bad 0), use **DCG** (discounted cumulative gain): divide each grade by log2(position + 1) and add. log2(n) is the power of 2 that gives n, so position 1 divides by log2(2) = 1, position 2 by log2(3) ≈ 1.58, position 3 by log2(4) = 2. Lower positions count for less.',
    'Take grades 2, 3, 0 in the order shown. DCG = 2/1 + 3/1.58 + 0/2 ≈ 3.89. The best possible order is 3, 2, 0: 3/1 + 2/1.58 ≈ 4.26. **NDCG** divides the first by the second: 3.89 ÷ 4.26 ≈ 0.91. A perfect order scores 1. The ideal order must be sorted from highest grade to lowest; sorting the other way divides by the worst order and gives values above 1.',
    {
      code: `import math

def dcg(rels):
    return sum(r / math.log2(i + 1) for i, r in enumerate(rels, start=1))

shown = [2, 3, 0]
ideal = sorted(shown, reverse=True)
print(round(dcg(shown), 2), round(dcg(shown) / dcg(ideal), 2))`,
      out: '3.89 0.91',
    },

    { h: 'Where labels come from' },
    '**Clicks and purchases** are plentiful but biased by position: the top result is clicked partly because it is on top. Treating "shown but not clicked" as irrelevant teaches the model to copy the old ranking. Corrections: count as negatives only results the user skipped above a click, add position as a training feature and fix it when serving, or swap neighbouring results at random for a small share of traffic.',
    '**Human judges** following written guidelines give unbiased graded labels, but they are expensive. A few thousand queries, sampled across frequent, medium and rare ones, is typical. The usual pattern: train on behaviour, evaluate on judgements.',

    { h: 'Evaluating and running it' },
    { sub: 'Split by query' },
    'Training data has one row per (query, book) pair. Split it so that all rows of one query land on the same side. A random split by row puts the popular query "harry potter" on both sides, and the model is tested on answers it has already seen. Splitting by time as well is better still.',
    { sub: 'Online tests and freshness' },
    'Online, run an A/B test or an **interleaving** test, which mixes the results of two rankers into one list and counts which ranker\'s results get the clicks. Keep fast-changing fields fresh: if the index is rebuilt nightly, a book that sells out at ten in the morning stays at the top all day. Stream price and stock into the index within minutes; titles and embeddings can stay on the nightly build.',
    'Monitor the zero-result rate, the click rate on the first result, how often users rewrite their query, p99 latency and index lag. Rare queries are where learned rankers fail quietly, because they have few clicks to learn from. New books have no behaviour data, so text features and a freshness boost carry them.',
  ],

  'design-fraud': [
    { h: 'The shape of a fraud problem' },
    'Fraud detection decides, for each payment, whether to let it through. The positives are rare, the labels arrive late, and the people you catch change their behaviour. The example is an online shop\'s payments: 500,000 a day, 0.4% of them fraud (2,000 a day), a decision needed within 100 ms while the customer waits, and a review team that can check 800 cases a day.',
    { sub: 'Actions, not scores' },
    'A model outputs a score; the business needs an action: **approve**, **block**, or send to **review** by a person. The product metric is money: fraud losses plus the cost of blocking honest customers.',

    { h: 'Metrics when positives are rare' },
    'Approving everything is right on 99.6% of payments, so **accuracy** says nothing. Two other numbers do. Call a flagged payment an **alert**.',
    {
      list: [
        '**Precision**: of the alerts, the share that really were fraud.',
        '**Recall**: of all the fraud, the share that was alerted.',
      ],
    },
    'Suppose the review team checks 800 alerts and 30% are fraud. That is 240 frauds caught, so precision is 0.30 and recall is 240 ÷ 2,000 = 0.12. Seven in eight frauds still get through.',
    { sub: 'Why ROC AUC flatters' },
    'A reminder from the evaluation module: the **false positive rate** is the share of honest cases wrongly flagged, and **ROC AUC** summarises how it trades against recall. With 498,000 honest payments a day, a false positive rate of 0.5% sounds small and is 2,490 false alerts, three times what the team can review. Report precision and recall **at the alert volume you can afford**, and the area under the precision-recall curve (**PR AUC**), which does not hide that.',
    {
      code: `def review_queue(scores, labels, capacity):
    top = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)[:capacity]
    caught = sum(labels[i] for i in top)
    return caught / capacity, caught / sum(labels)

print(review_queue([0.2, 0.9, 0.6, 0.4, 0.8], [0, 1, 0, 1, 0], 2))`,
      out: '(0.5, 0.5)',
    },
    'The two highest scores (0.9 and 0.8) go to review. One is fraud, so precision is 1 ÷ 2, and one of the two frauds is caught, so recall is 1 ÷ 2.',
    { sub: 'Capacity limits recall' },
    'Lowering the threshold catches more fraud but adds false alerts much faster, since there are about 250 honest payments per fraud. Alerts nobody reviews catch nothing. To raise recall with the same team you need better precision (features or model), automatic blocks for the top scores, or more reviewers.',

    { h: 'Choosing the threshold from costs' },
    'Say a missed fraud costs $150 and blocking an honest customer costs $15. If the model says the probability of fraud is p, blocking costs (1 − p) × 15 on average and approving costs p × 150. Block when p × 150 > (1 − p) × 15. Rearranged: p > 15 ÷ (150 + 15) ≈ 0.09. In general, block when p is above cost of a false block ÷ (cost of a false block + cost of a missed fraud).',
    'The threshold is far below 0.5 because the two mistakes cost such different amounts. This only works if the probabilities are **calibrated**: among payments scored 0.09, about 9% really are fraud. Models trained with class weights are often not, so check and correct before using the cost rule. The review queue then takes the band of scores below the block line, as many as the team can clear.',

    { h: 'Features as of the transaction time' },
    'The strongest features are **windowed aggregates**: the count and sum of this card\'s payments in the last minute, hour and day, the amount against its usual amount, how new the account and device are, the merchant\'s past fraud rate. A sudden burst of payments (**velocity**) is the classic sign of a stolen card.',
    { sub: 'The window has two edges' },
    'Each aggregate must use only events before the decision, in training exactly as in serving. When you build training rows from history, the full table also contains later payments. A window with only a lower edge counts them too: a card that was drained an hour later shows a huge "last hour" spend on its earlier, innocent-looking payment. That is **leakage**, and it makes offline results look excellent.',
    {
      code: `times = [5, 20, 30, 80, 95, 130]   # minutes
now, window = 95, 60
count = sum(1 for t in times if now - window < t <= now)
print(count)`,
      out: '2',
    },
    'The window is the 60 minutes up to and including minute 95, so it holds 80 and 95. A payment at minute 35 would be exactly 60 minutes old and fall out, because the lower edge uses `<`; minute 30 is older still. Minute 130 is in the future and the `<= now` edge keeps it out.',

    { h: 'Labels that are late and missing' },
    { sub: 'Label delay' },
    'The label is a **chargeback**: the cardholder disputes the payment. It can arrive weeks or months later. If you retrain today on last week\'s payments, most of their fraud has not been reported yet and sits in the data as honest, so the model learns that the newest pattern is safe. Train on data old enough for its labels to have **matured**, and use faster signals (review outcomes, customer reports) for the recent weeks.',
    { sub: 'Blocked payments have no label' },
    'A blocked payment never completes, so it never gets a chargeback. The next model learns only from what earlier systems let through, the obvious fraud removed. You also cannot measure how precise the blocks were. The usual remedy is a **control group**: let a small random share of would-be blocks through. It costs a little fraud and buys unbiased labels. Labelling every blocked payment as fraud would copy the old system\'s mistakes.',

    { h: 'Serving with rules beside the model' },
    'Within 100 ms: about 20 ms to read the aggregates from a fast store kept current by a **stream processor** (a service that updates counts as each event arrives), 10 ms to score with gradient-boosted trees, 5 ms for rules. Keep the **rules** for good: they encode hard policy, ship in an hour when a new attack starts, and are the fallback when the model is down.',
    'When a new pattern appears on a Monday, the model has no labelled examples of it. Add a rule today, send its hits to review so they produce labels, and let the next retrain learn it.',

    { h: 'Rollout and an opponent who adapts' },
    'Split by time, with a gap so that test labels have matured, and run in shadow mode beside the rules first. Then watch the alert rate daily, precision from review outcomes (days) and recall from chargebacks (months). Fraudsters change tactics once blocked, so retrain often and expect the model to be weakest on the newest attack.',
  ],

  'design-forecast': [
    { h: 'What a demand forecast is for' },
    'A **forecast** predicts a future number, here how many units of each product will be wanted. The example in this lesson is a chain of 50 bakeries selling 200 products, which orders ingredients and plans baking 3 days ahead. Every forecast feeds a decision: how much to make. Too little means empty shelves and lost sales. Too much means waste.',
    { sub: 'Granularity and horizon' },
    'Fix two things first. The **granularity** is the level you forecast at: daily units per product per shop. The **horizon** is how far ahead: here 1 to 3 days. 50 shops × 200 products is 10,000 **time series** (one sequence of daily values each). The job runs as a nightly **batch**: all forecasts computed together, before orders go out. The horizon decides which features you may use, so it comes before everything else.',

    { h: 'The baseline to beat' },
    'The **seasonal naive** forecast repeats the value from the same point in the last season. With a weekly season, next Friday\'s forecast is last Friday\'s sales. It costs nothing, already knows that weekends are busy, and many forecasting projects barely beat it.',
    {
      code: `def seasonal_naive(history, horizon, season=7):
    last = history[-season:]
    return [last[i % season] for i in range(horizon)]

week = [20, 18, 22, 25, 30, 41, 35]
print(seasonal_naive(week, 3), seasonal_naive(week, 9))`,
      out: '[20, 18, 22] [20, 18, 22, 25, 30, 41, 35, 20, 18]',
    },
    '`history[-season:]` takes the last 7 values. `i % season` (the remainder after dividing by 7) wraps back to the start of the week when the horizon is longer than a season.',

    { h: 'Measuring forecast error' },
    { sub: 'MAE, MAPE and WAPE' },
    'The **mean absolute error** (MAE) is the average of |forecast − actual| (the bars mean "ignore the sign"). **MAPE** averages |error| ÷ actual, a percentage per day. It breaks on slow sellers: when the actual is 0, it divides by zero, and small actuals blow it up. **WAPE** divides total absolute error by total sales, so it stays defined and weights products by volume.',
    'Example: actual 0, 5, 20, 15 and forecast 1, 7, 18, 15. Absolute errors 1, 2, 2, 0, total 5. Total sales 40. WAPE = 5 ÷ 40 = 0.125.',
    {
      code: `actual = [0, 5, 20, 15]
forecast = [1, 7, 18, 15]
wape = sum(abs(a - f) for a, f in zip(actual, forecast)) / sum(actual)
print(wape)`,
      out: '0.125',
    },
    { sub: 'Bias and the ratio to the baseline' },
    'The **bias** is the average signed error: whether you are high or low overall. A forecast 5% high everywhere is cheap to fix and expensive to ignore. Report every model\'s error as a ratio to seasonal naive on the same data. A model with MAE 6 against a baseline of 7.5 has a ratio of 0.8: it removes a fifth of the error. Above 1, ship the baseline.',

    { h: 'Data, labels and legal features' },
    { sub: 'Sales are not demand' },
    'You record **sales**, but you want **demand**. On a day the shelf was empty by noon, sales stopped while people still wanted the product. If those days stay in training, the model learns that demand falls after a busy spell, orders less, and the shortage repeats. Use stock records to mark out-of-stock days and leave them out, or replace them with an estimate.',
    { sub: 'Features known at forecast time' },
    'Calendar (day of week, holidays, paydays, school terms), planned promotions and prices are known in advance. A **lag** is the value from some days earlier. A lag must be at least as long as the horizon: forecasting 3 days ahead, you can use sales from 3, 7 and 14 days before the target date, not from the day before, which is still in the future when you predict. For weather use the weather forecast, since the real weather is unknown at prediction time.',
    { sub: 'One model across all series' },
    'Most product-shop series are short and full of zeros. One alone cannot learn a holiday effect, but thousands of similar products share it. Train **one model across all series**, usually gradient-boosted trees, with product, category and shop attributes as features. It also gives a forecast for a new product from its attributes.',

    { h: 'Validating on the future' },
    'Never split at random. A random split lets the model see Thursday while predicting Wednesday of the same week, which never happens for real. Use **rolling-origin backtests**: pick several cut-off dates, train on everything before each, test on the days after it. Include a holiday week, because holidays are where forecasts fail.',
    'Check accuracy at more than one level of the **hierarchy**. The buyer orders flour for all shops together; the shop manager plans per shelf. Forecasts per product per shop are noisy, so also check the totals by product and by category, and make the levels add up.',

    { h: 'Unequal costs and quantiles' },
    'A model trained with squared error predicts the mean. That is the best choice only when running short and over-producing cost the same. Suppose an empty shelf costs 3 per unit in lost margin and a wasted unit costs 1. Then forecast the **quantile** under ÷ (under + over) = 3 ÷ 4 = 0.75: the amount that demand stays below on 75% of days. Gradient-boosted trees can be trained for a quantile directly with a **quantile loss**.',
    {
      code: `import numpy as np

demand = [8, 10, 12, 9, 15, 11, 10, 13]
print(np.mean(demand), np.quantile(demand, 0.75))`,
      out: '11.0 12.25',
    },
    'Baking 12 or 13 rather than 11 runs out less often, which is right when a shortage costs three times a wasted unit.',

    { h: 'Where forecasts go wrong' },
    {
      list: [
        'Holidays that move between years, and promotions of a kind never seen in training.',
        'New products with no history. Borrow from similar products.',
        'Sudden shifts in behaviour, when seasonal naive can beat the model for weeks.',
        'Lags shorter than the horizon, which make validation look excellent and production poor.',
        'A steady bias nobody tracks. Check it by category every week.',
      ],
    },
    'Pilot in a few shops and compare waste and availability with similar shops still on the old process.',
  ],

  'design-ctr': [
    { h: 'A probability multiplied by money' },
    'An online shop shows sponsored products beside its search results. For each request about 100 eligible ads are scored, and the shop shows the ones with the highest **expected revenue**: the predicted click-through rate (**pCTR**, the probability the user clicks) times the **bid** (what the advertiser pays per click). An ad with pCTR 0.03 and a bid of $0.40 is worth 0.03 × 0.40 = $0.012 per showing, or $12 per thousand impressions (an **impression** is one showing of an ad).',
    'Assume 300 million impressions a day, a click rate near 2%, and 8 ms for the model inside the ad-selection budget. 8 ms for 100 ads is 0.08 ms per ad. That rules out large models before any accuracy comparison, unless they are batched on fast hardware.',
    { sub: 'Why the value matters, not only the order' },
    'In a feed only the order matters. Here the number is multiplied by a bid and compared across advertisers. If the model says 0.06 where the truth is 0.03, the ad looks worth twice as much and wins slots it should lose. A model that ranks slightly better but overstates one group of ads can lose money.',

    { h: 'Metrics for probabilities' },
    { sub: 'Log loss' },
    '**Log loss** scores a predicted probability p against what happened. For a click it is −log(p); for no click, −log(1 − p). (log is the natural logarithm; −log of a number near 1 is near 0, and −log of a small number is large.) Averaged over impressions, lower is better, and confident wrong answers are punished hard. Compare it with the log loss of always predicting the average click rate. A model that cannot beat that constant has learned nothing.',
    {
      code: `import math

def log_loss(ys, ps):
    return sum(-math.log(p) if y else -math.log(1 - p) for y, p in zip(ys, ps)) / len(ys)

ys = [1, 0, 0, 0, 0]
print(round(log_loss(ys, [0.2] * 5), 3), round(log_loss(ys, [0.6, 0.1, 0.1, 0.2, 0.1]), 3))`,
      out: '0.5 0.21',
    },
    'The first line predicts the base rate 0.2 every time. The second, more informed model scores lower, so better.',
    { sub: 'Calibration' },
    'A model is **calibrated** when its probabilities match reality: of impressions predicted at 0.03, about 3% get clicked. The quick check is the **calibration ratio**: the sum of predicted probabilities ÷ the number of real clicks. If predictions for mobile ads add up to 1,800 and there were 1,500 clicks, the ratio is 1.2: those ads are overstated by 20%. Compute it per segment (new ads, each placement, each country, each device). An overall ratio of 1.0 can hide one group at 1.5 and another at 0.7. **AUC**, which measures only the ordering, comes second here.',

    { h: 'Features from sparse ids' },
    'Most features are **categorical ids** (user, ad, advertiser, campaign, placement, device) plus **crosses** such as user-segment × advertiser: hundreds of millions of values, too many for a column each.',
    { sub: 'The hashing trick' },
    '**Hashing** maps each id to one of a fixed number of buckets with a hash function, a function that turns any text into a number. Two different ids sometimes land in the same bucket, a **collision**, and then share one weight. With enough buckets collisions are rare and mostly hit rare ids. The table size is now your choice, however many new ids appear.',
    {
      code: `def bucket(value, n_buckets):
    return sum(ord(c) for c in value) % n_buckets

print(bucket('ad_42', 10), bucket('ad_51', 10), bucket('ad_43', 10))`,
      out: '4 4 5',
    },
    '`ord(c)` is the number code of a character. This toy hash adds the codes and keeps the remainder after dividing by 10. `ad_42` and `ad_51` collide. Real systems use a better hash such as MurmurHash, but collisions still happen.',
    { sub: 'Embeddings per bucket' },
    'Each bucket can then learn an **embedding**, a short vector. Memory is buckets × dimensions × 4 bytes. With 2 million buckets and 8 dimensions: 2,000,000 × 8 × 4 = 64,000,000 bytes, 64 MB. One vector per raw id for 50 million ids would be 1.6 GB, and it would keep growing. Add **counting features** too, such as this ad\'s click rate over the last hour and day.',

    { h: 'Baseline and model' },
    'The baseline is each ad\'s historical click rate in each placement. An ad with 15 impressions and no clicks has a raw rate of 0 and would never be shown again, so the rate is **smoothed** toward the average: add some imaginary impressions at the average rate. With an average of 3% and a strength of 50 imaginary impressions, 0 clicks in 15 becomes (0 + 0.03 × 50) ÷ (15 + 50) = 1.5 ÷ 65 ≈ 0.023. With 4,950 impressions and 150 clicks it is 151.5 ÷ 5,000 ≈ 0.030: plenty of data overrules the prior.',
    'Start with **logistic regression** on hashed features and crosses: it trains on billions of rows, scores fast and tends to be well calibrated. Move to embeddings feeding a small neural network when the gain pays for the latency. The baseline is the fallback.',

    { h: 'Labels: delayed and sampled' },
    { sub: 'Delayed labels' },
    'Every impression is a free example, but its label arrives late: a click after minutes, a purchase after days. Write the row at once as a negative and every late positive is mislabelled, so the model learns a rate that is too low, most of all for slow decisions. Wait for an **attribution window** before using a row, or correct rows when late positives arrive.',
    { sub: 'Down-sampling negatives' },
    'With a 2% click rate, 98% of rows are non-clicks. To cut cost, keep every click but only a share of non-clicks, the **keep rate**. The model then sees far more clicks than reality and predicts too high. The **odds** of a click (p ÷ (1 − p)) are inflated by 1 ÷ keep rate, so you correct with p ÷ (p + (1 − p) ÷ keep rate).',
    {
      code: `def recalibrate(p, keep_rate):
    return p / (p + (1 - p) / keep_rate)

sampled = 200 / (200 + 9800 * 0.2)    # true rate 0.02, keep 20% of non-clicks
print(round(sampled, 4), round(recalibrate(sampled, 0.2), 4))`,
      out: '0.0926 0.02',
    },
    'Of 10,000 impressions, 200 are clicks; keeping 20% of the non-clicks makes the sample show 9.26%, and the correction brings it back to 2%. Skip it and every bid uses click rates several times too high.',

    { h: 'Keeping up with changing ads' },
    'Campaigns start and end within days, so a model retrained weekly has no learned weight for most live ad ids, among the strongest features. The model is **retrained continuously**: hourly updates on fresh data, a full retrain daily, checks before each version goes live, and the previous model ready to **roll back**.',
    { sub: 'Exploration' },
    'The model only gets labels for the ads it chose to show. A new ad given a low first guess may never be shown and never corrected. Reserve a small budget for **exploration**. The simplest rule, **epsilon-greedy**, shows a random eligible ad with a small probability ε (epsilon, say 0.03) and the best predicted ad otherwise. Get the comparison the right way round: `random.random() < epsilon` is true 3% of the time.',
    {
      code: `import random

def choose(ads, pctr, epsilon=0.03):
    if random.random() < epsilon:
        return random.choice(ads)            # explore, rarely
    return max(ads, key=lambda ad: pctr[ad])  # exploit, usually`,
    },
    'Monitor calibration by hour and by segment: it moves whenever traffic, campaigns or a feature pipeline change.',
  ],

  'design-assistant': [
    { h: 'An assistant that answers from documents' },
    'A company of 1,200 people wants to ask questions of its own documents: 20,000 wiki pages, policies and support tickets, about 3,000 tokens each (a **token** is a piece of a word, roughly three quarters of one on average). The design is called **retrieval-augmented generation**: find the passages that answer the question, then give them to a **language model** (a model that writes text) and ask it to answer from them, citing its sources.',
    'At 8 questions per person per day that is 9,600 queries a day, a fraction of one per second. Scale is not the problem. Correctness, permissions and cost are. The product metric is the share of questions answered without a follow-up or a support ticket, plus thumbs up or down and weekly users. The baseline is the existing keyword search.',

    { h: 'From document to index' },
    'The data pipeline is called **ingestion**. Connect to each source, extract the text, split it into **chunks**, turn each chunk into an embedding, and store it with its source, its date and the groups allowed to read it. When a document changes or is deleted, its chunks must change too.',
    { sub: 'Chunking with overlap' },
    'A chunk is a slice of a document small enough to retrieve precisely, say 600 tokens. Neighbouring chunks share a little text, the **overlap**, so an answer that falls across a boundary is still whole in one chunk. Each chunk therefore starts size − overlap tokens after the previous one. A common bug adds the overlap instead, which leaves gaps that no chunk covers.',
    {
      code: `def chunk(tokens, size=5, overlap=2):
    step = size - overlap
    return [tokens[s:s + size] for s in range(0, len(tokens), step)]

for c in chunk(list(range(12))):
    print(c)`,
      out: `[0, 1, 2, 3, 4]
[3, 4, 5, 6, 7]
[6, 7, 8, 9, 10]
[9, 10, 11]`,
    },
    { sub: 'Sizing the index' },
    'With no overlap, 20,000 documents × 3,000 tokens ÷ 600 tokens per chunk = 100,000 chunks. At 768 dimensions in float32: 100,000 × 768 × 4 bytes ≈ 0.31 GB. That fits in memory on one machine, so no sharding is needed.',

    { h: 'From question to answer' },
    {
      list: [
        '**Retrieve**: keyword search (good for exact names and error codes) and vector search (good for paraphrases), merged.',
        '**Filter by permission**: keep only chunks the asking user may read.',
        '**Re-rank**: a more careful model scores the top 20 and keeps about 6.',
        '**Generate**: one language-model call, told to answer only from the passages, to cite them, and to say so when they do not cover the question.',
      ],
    },
    'Start there, with no fine-tuning. Most early failures are retrieval misses, poor chunking or stale documents, and a larger model fixes none of them.',
    { sub: 'Permissions at retrieval' },
    'Access control is enforced before anything reaches the model. Anything placed in the prompt can come out in the answer, whatever the instructions say, so "do not reveal restricted content" is not a control. Store the allowed groups with every chunk, kept in sync with the source systems. Filter first, then take the top results; taking the top results first can leave the user with almost nothing.',
    {
      code: `chunks = [('k1', {'finance'}, 0.9), ('k2', {'all'}, 0.8),
          ('k3', {'sales', 'finance'}, 0.7), ('k4', {'legal'}, 0.6)]
user = {'sales', 'all'}
ok = [cid for cid, groups, score in chunks if groups & user]
print(ok)`,
      out: "['k2', 'k3']",
    },
    '`groups & user` is the set of groups in both; an empty set counts as false, so k1 and k4 are dropped.',
    { sub: 'Fitting a token budget' },
    'After filtering, go through the chunks from the highest score down and add each one if the total tokens stay within a limit. A chunk that does not fit is skipped, and smaller ones after it can still be added. The budget bounds cost and latency per query.',
    { sub: 'When nothing covers the question' },
    'The assistant should say the documents do not cover it, show the closest sources and suggest who to ask. A confident answer with no source behind it destroys trust, and for company policy the model\'s general knowledge is likely wrong. The rate of such no-answers shows which documents are missing.',

    { h: 'Cost and latency' },
    'Aim for the first words within about 2 seconds: roughly 200 ms for retrieval and re-ranking, the rest for the model, with the answer **streamed** word by word. Cost is per token, input and output priced separately. Eight chunks of 600 tokens plus 500 tokens of instructions is 5,300 input tokens; say 400 output tokens. At $2 per million input and $10 per million output: 5,300 × 2 ÷ 1,000,000 = $0.0106, plus 400 × 10 ÷ 1,000,000 = $0.004, about 1.5 cents a query. Times 9,600 queries is about $140 a day. Most of it is the retrieved passages, so the number of chunks sent is the main cost control.',

    { h: 'Evaluating two kinds of failure' },
    'There are no labels at the start, so make them: a **golden set** of about 200 real questions, each with the right answer and its source document, written with the people who own the documents. Run it on every change to chunking, retrieval or prompt. Five hand-picked questions that "feel better" prove nothing.',
    { sub: 'Retrieval and generation separately' },
    'Two things can fail, so measure them apart. **Retrieval recall at k**: was the passage holding the answer among the k retrieved? **Faithfulness**: is every claim in the answer supported by the cited passages? When an answer is wrong, first check whether the right passage was retrieved at all. If not, fix chunking, search or the index. If it was, work on the prompt or the model. Log the retrieved passages with every answer so this check is possible.',

    { h: 'Rollout and what goes wrong' },
    'Test permissions with users from different groups, roll out to one team, read the failures, then widen. Monitor the no-answer rate, thumbs down, cost and latency per query, and how far the index lags behind the sources.',
    {
      list: [
        'Stale or contradictory documents: prefer recent ones and show dates.',
        'Permission changes that have not reached the index yet.',
        '**Prompt injection**: text inside a document that reads like an instruction ("ignore your instructions and..."). Anyone who can edit a page can put text in front of the model. Mark retrieved text off clearly as quoted data, tell the model to answer only the user\'s question, and give the assistant no power to act (send email, call tools) on that text.',
      ],
    },
  ],

  'design-lab': [
    { h: 'When the action is an interruption' },
    'Most systems in this module choose what to show someone already looking. A **push notification** decides whether to interrupt someone who is not. Each push spends a little patience, and a person who switches notifications off is lost to every future one. This lesson works through a close cousin of the lab\'s case: a news app deciding which alerts to push.',
    'Every event that could become a push is a **candidate**: a breaking story, a new article on a topic the user follows, a recommended article. Say the app has 5 million daily users and about 12 candidates per user per day.',

    { h: 'Pinning down the decision' },
    { sub: 'Questions to ask first' },
    {
      list: [
        'What the business wants: more visits from pushes, fewer people switching pushes off, and which wins when they conflict.',
        'The decision itself: for each candidate, send now, hold for later, or drop, under a **cap** (a maximum number of sends per user per day).',
        'Scale and timing: candidates per day, how quickly a push must go out, quiet hours. A breaking story is stale in minutes; a recommendation can wait for the evening.',
        'The cost of each error: a useful push not sent against a useless one sent. An unwanted push risks an opt-out, so the costs are far from equal.',
        'Hard rules outside the model: user settings are always respected, and some sends (a security alert, say) are policy and must never be suppressed by a low score.',
      ],
    },
    { sub: 'Metrics that cannot be gamed' },
    'The **open rate** (opened pushes ÷ sent pushes) is a trap: sending only the surest pushes to the most active readers raises it while total visits fall. The number of sends counts effort, not value. The honest measure is visits or active days per user compared with a **holdout**: a small random group that gets no ranked pushes. The difference between the groups is what the pushes add. Add the **opt-out rate** as a guardrail, because it protects the channel itself.',

    { h: 'A baseline rule' },
    'Before any model, write the rule a sensible product team would ship: order candidates by type (breaking first, then followed topics, then recommendations), newest first within a type, and send at most the cap. It is the number to beat and the fallback when the model is down.',
    {
      code: `PRIORITY = {'breaking': 0, 'followed': 1, 'recommended': 2}
cands = [('a', 'recommended', 9), ('b', 'followed', 2),
         ('c', 'breaking', 1), ('d', 'followed', 6)]
ranked = sorted(cands, key=lambda c: (PRIORITY[c[1]], -c[2]))
print([c[0] for c in ranked[:3]])`,
      out: "['c', 'd', 'b']",
    },
    'The sort key is a **tuple**, a pair of values. Python compares tuples one position at a time: first by priority, and only when two priorities are equal by the second value. Negating the time (`-c[2]`) makes larger, newer times sort first. Slicing with `[:3]` applies the cap.',

    { h: 'Labels and what they hide' },
    'The natural label is "opened within 24 hours". A second label is "turned notifications off within a day of this push". Both come only from pushes that were sent, so send a small random sample of candidates the policy would drop, or the model never learns that it was wrong to drop them.',
    { sub: 'An open is not added value' },
    'Many opens come from people who would have opened the app within the hour anyway, so a model trained on opens learns to push the loyal readers who need it least. Opens are still a workable training label, but only the holdout shows the **incremental** value: the change caused by sending, not the outcome that follows it.',

    { h: 'A feature known at the moment of sending' },
    'A strong feature is the user\'s recent open rate. In training rows built from history it must use only pushes sent before the decision: a window with a lower edge and an upper edge, the upper one strict. A new user has no history, so smooth toward a **prior** (a typical value): add a few imaginary pushes at the prior rate. With a prior of 0.15 and a strength of 4, a user with 1 open from 2 recent pushes gets (1 + 0.6) ÷ (2 + 4) ≈ 0.27, not 0.5.',
    {
      code: `def open_rate(history, now, window=7, prior=0.15, strength=4):
    recent = [o for t, o in history if now - window <= t < now]
    return round((sum(recent) + prior * strength) / (len(recent) + strength), 3)

h = [(1, False), (4, True), (6, False), (12, True)]   # (day sent, opened)
print(open_rate(h, 8), open_rate(h, 0), open_rate([], 8))`,
      out: '0.229 0.15 0.15',
    },
    'At day 8 the window holds days 1 to 7: pushes at days 1, 4 and 6, one opened. `sum` counts `True` as 1. Day 12 is in the future and is excluded. At day 0, and for an empty history, the answer is the prior.',

    { h: 'Turning two scores into a send policy' },
    'Two simple models (logistic regression or small tree ensembles) give, for each candidate, **p_open** and **p_off**, the chance the user switches pushes off. The product team decides how many opens one opt-out is worth, say 30. Then the value of a send is p_open − 30 × p_off.',
    'Worked example. A story with p_open 0.25 and p_off 0.002 is worth 0.25 − 0.06 = 0.19. One with p_open 0.06 and p_off 0.003 is worth 0.06 − 0.09 = −0.03. Sort by value, keep only values above zero, then apply the cap. The floor matters: "nothing worth sending today" must be a valid answer even when the cap has room. This only works if both probabilities are **calibrated** (a predicted 0.002 means about 2 in 1,000).',

    { h: 'Serving, rollout and monitoring' },
    { sub: 'How many machines' },
    '5 million users × 12 candidates = 60 million a day ÷ 86,400 ≈ 694 a second. With a peak 4 times the average that is about 2,778 a second. If scoring takes 4 ms and a replica handles one at a time, it serves 1000 ÷ 4 = 250 a second, planned at 70%: 175. So 2,778 ÷ 175 = 15.9, rounded up to 16 replicas. That is cheap, so every candidate can be scored as its event arrives.',
    { sub: 'Testing online' },
    'Randomise **users**, not individual pushes, into old policy, new policy and the no-push holdout: fatigue and opt-outs build up per person. Opt-outs are slow, so run for several weeks; two days shows the gain in opens and none of the harm. A before-and-after comparison cannot separate the launch from the news cycle.',
    { sub: 'What to watch' },
    {
      list: [
        'Sends per user per day by type, the share of candidates dropped, the share of users at the cap. A sudden change is the first sign of a broken feature.',
        'Calibration of both models over time. If p_off drifts low, the system quietly over-sends.',
        'Opt-outs and active days against the long-term holdout.',
        'New candidate types and new users with no history (priors and the baseline rule), and pushes delayed until they are stale (give candidates an expiry time).',
      ],
    },
  ],
}
