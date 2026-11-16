/**
 * Videos that go with the lessons. Every id here was looked up on YouTube and
 * the title and channel are the ones YouTube returned. They were chosen by
 * title and by the reputation of the channel, as a second explanation of the
 * same idea in someone else's words.
 */
export interface Video {
  /** The YouTube video id. */
  id: string
  title: string
  by: string
}

const v = (id: string, title: string, by: string): Video => ({ id, title, by })

const V = {
  vectors: v('fNk_zzaMoSs', 'Vectors (Essence of linear algebra, chapter 1)', '3Blue1Brown'),
  transforms: v('kYB8IZa5AuE', 'Linear transformations and matrices', '3Blue1Brown'),
  matmul: v('XkY2DOUCWMU', 'Matrix multiplication as composition', '3Blue1Brown'),
  determinant: v('Ip3X9LOh2dk', 'The determinant', '3Blue1Brown'),
  eigen: v('PFDu9oVAE-g', 'Eigenvectors and eigenvalues', '3Blue1Brown'),
  broadcasting: v('Qz3ZICklYas', 'NumPy Broadcasting Explained', 'OptnGrow'),
  calculus: v('WUvTyaaNkzM', 'The essence of calculus', '3Blue1Brown'),
  derivative: v('9vKqVkMQHKk', 'The paradox of the derivative', '3Blue1Brown'),
  chainRule: v('YG15m2VwSjA', 'Visualizing the chain rule and product rule', '3Blue1Brown'),
  chainRuleSq: v('wl1myxrtQHQ', 'The Chain Rule, Clearly Explained', 'StatQuest'),
  descentSq: v('sDv4f4s2SB8', 'Gradient Descent, Step-by-Step', 'StatQuest'),
  descent: v('IHZwWFHWa-w', 'Gradient descent, how neural networks learn', '3Blue1Brown'),
  bayes: v('HZGCoVF3YvM', 'Bayes theorem, the geometry of changing beliefs', '3Blue1Brown'),
  bayesSq: v('9wCnvr7Xw4E', "Bayes' Theorem, Clearly Explained", 'StatQuest'),
  normal: v('rzFX5NWojp0', 'The Normal Distribution, Clearly Explained', 'StatQuest'),
  clt: v('zeJD6dqJ5lo', 'But what is the Central Limit Theorem?', '3Blue1Brown'),
  standardError: v('A82brFpdr9g', 'Standard Deviation vs Standard Error', 'StatQuest'),
  intervals: v('TqOeMYtOc1w', 'Confidence Intervals, Clearly Explained', 'StatQuest'),
  pValues: v('vemZtEM63GY', 'p-values: What they are and how to interpret them', 'StatQuest'),
  likelihood: v('pYxNSUDSFH4', 'In Statistics, Probability is not Likelihood', 'StatQuest'),
  mle: v('XepXtl9YKwc', 'Maximum Likelihood, clearly explained', 'StatQuest'),
  crossEntropy: v('6ArSys5qHAU', 'Neural Networks Part 6: Cross Entropy', 'StatQuest'),
  softmax: v('KpKog-L9veg', 'Neural Networks Part 5: ArgMax and SoftMax', 'StatQuest'),

  leastSquares: v('PaFPbb66DxQ', 'The Main Ideas of Fitting a Line to Data', 'StatQuest'),
  linear: v('nk2CQITm_eo', 'Linear Regression, Clearly Explained', 'StatQuest'),
  logistic: v('yIYKR4sgzI8', 'Logistic Regression', 'StatQuest'),
  biasVariance: v('EuBBz3bI-aA', 'Machine Learning Fundamentals: Bias and Variance', 'StatQuest'),
  ridge: v('Q81RR3yKn30', 'Regularization Part 1: Ridge (L2) Regression', 'StatQuest'),
  ridgeLasso: v('Xm2C_gTAl8c', 'Ridge vs Lasso Regression, Visualized', 'StatQuest'),
  trees: v('_L39rN6gz7Y', 'Decision and Classification Trees, Clearly Explained', 'StatQuest'),
  regressionTrees: v('g9c66TUylZ4', 'Regression Trees, Clearly Explained', 'StatQuest'),
  forests: v('J4Wdy0Wc_xQ', 'Random Forests Part 1: Building, Using and Evaluating', 'StatQuest'),
  boosting: v('3CC4N4z3GJc', 'Gradient Boost Part 1: Regression Main Ideas', 'StatQuest'),
  xgboost: v('OtD8wVaFm6E', 'XGBoost Part 1: Regression', 'StatQuest'),
  kmeans: v('4b5d3muPQmA', 'K-means clustering', 'StatQuest'),
  pcaShort: v('HMOI_lkzW08', 'PCA main ideas in only 5 minutes', 'StatQuest'),
  pca: v('FgakZw6K1QQ', 'Principal Component Analysis (PCA), Step-by-Step', 'StatQuest'),
  mlIntro: v('Gv9_4yMHFhI', 'A Gentle Introduction to Machine Learning', 'StatQuest'),

  encoding: v('589nCGeWG1w', 'One-Hot, Label, Target and K-Fold Target Encoding', 'StatQuest'),
  orderedEncoding: v('KXOTSkPL2X4', 'CatBoost Part 1: Ordered Target Encoding', 'StatQuest'),
  leakage: v('9Wlno8DTbYQ', 'Data Leakage Explained', 'TileStats'),
  word2vec: v('viZrOnJclY0', 'Word Embedding and Word2Vec, Clearly Explained', 'StatQuest'),

  crossValidation: v('fSytzGwwBVw', 'Machine Learning Fundamentals: Cross Validation', 'StatQuest'),
  confusion: v('Kdsp6soqA7o', 'Machine Learning Fundamentals: The Confusion Matrix', 'StatQuest'),
  sensitivity: v('vP06aMoz4v8', 'Machine Learning Fundamentals: Sensitivity and Specificity', 'StatQuest'),
  roc: v('4jRBRDbJemM', 'ROC and AUC, Clearly Explained', 'StatQuest'),
  abTests: v('VpTlNRUcIDo', 'A/B Testing Fundamentals: What Every Data Scientist Needs to Know', 'Emma Ding'),

  network: v('aircAruvnKk', 'But what is a neural network?', '3Blue1Brown'),
  networkSq: v('CqOfi41LfDw', 'The Essential Main Ideas of Neural Networks', 'StatQuest'),
  relu: v('68BZ5f7P94E', 'Neural Networks Pt. 3: ReLU In Action', 'StatQuest'),
  backprop: v('Ilg3gGewQ5U', 'Backpropagation, intuitively', '3Blue1Brown'),
  backpropCalculus: v('tIeHLnjs5U8', 'Backpropagation calculus', '3Blue1Brown'),
  micrograd: v('VMj-3S1tku0', 'The spelled-out intro to neural networks and backpropagation: building micrograd', 'Andrej Karpathy'),
  backpropNinja: v('q8SA3rM6ckI', 'Building makemore Part 4: Becoming a Backprop Ninja', 'Andrej Karpathy'),
  mlp: v('TCH_1BHY58I', 'Building makemore Part 2: MLP', 'Andrej Karpathy'),
  activations: v('P6sfmUTpUmc', 'Building makemore Part 3: Activations & Gradients, BatchNorm', 'Andrej Karpathy'),
  batchNorm: v('DtEq44FTPM4', 'Batch Normalization, explained', 'CodeEmporium'),
  optimisers: v('NE88eqLngkg', 'Optimization for Deep Learning (Momentum, RMSprop, AdaGrad, Adam)', 'DeepBean'),
  adam: v('JXQT_vxqwIs', 'Adam Optimization Algorithm', 'DeepLearningAI'),
  dropout: v('ARq74QuavAo', 'Understanding Dropout', 'DeepLearningAI'),
  mit: v('ErnWZxJovaM', 'MIT Introduction to Deep Learning (6.S191)', 'Alexander Amini'),
  fastai: v('8SF_h3xF3cE', 'Practical Deep Learning for Coders: Lesson 1', 'Jeremy Howard'),

  pytorchCourse: v('V_xro1bcAuA', 'PyTorch for Deep Learning & Machine Learning: Full Course', 'freeCodeCamp.org'),
  pytorchLoeber: v('c36lUUr864M', 'Deep Learning With PyTorch: Full Course', 'Patrick Loeber'),
  autograd: v('M0fX15_-xrY', 'The Fundamentals of Autograd', 'PyTorch Foundation'),
  convolution: v('KuXjwB4LzSA', 'But what is a convolution?', '3Blue1Brown'),
  cnn: v('YRhxdVk_sIs', 'Convolutional Neural Networks (CNNs) explained', 'deeplizard'),
  alexnet: v('UZDiGooFs54', 'The moment we stopped understanding AI [AlexNet]', 'Welch Labs'),
  transfer: v('t6oHGXt04ik', 'PyTorch Transfer Learning with a ResNet', 'langfab'),

  tokenizer: v('zduSFxRajkE', "Let's build the GPT Tokenizer", 'Andrej Karpathy'),
  transformer: v('wjZofJX0v4M', 'Transformers, the tech behind LLMs', '3Blue1Brown'),
  attention: v('eMlx5fFNoYc', 'Attention in transformers, step-by-step', '3Blue1Brown'),
  facts: v('9-Jl0dxWQs8', 'How might LLMs store facts', '3Blue1Brown'),
  attentionSq: v('PSs6nxngL6k', 'Attention for Neural Networks, Clearly Explained', 'StatQuest'),
  transformerSq: v('zxQyTK8quyY', "Transformer Neural Networks, ChatGPT's foundation, Clearly Explained", 'StatQuest'),
  decoderOnly: v('bQ5BoolX9Ag', 'Decoder-Only Transformers, Clearly Explained', 'StatQuest'),
  transformerMaths: v('bCz4OMemCcA', 'Attention is all you need: model explanation, inference and training', 'Umar Jamil'),
  narrated: v('-QH8fRhqFHM', 'The Narrated Transformer Language Model', 'Jay Alammar'),
  buildGpt: v('kCc8FmEb1nY', "Let's build GPT: from scratch, in code, spelled out", 'Andrej Karpathy'),
  gpt2: v('l8pRSuU81PU', "Let's reproduce GPT-2 (124M)", 'Andrej Karpathy'),
  lora: v('PXWYUTMt-AU', 'LoRA: Low-Rank Adaptation of Large Language Models, explained visually', 'Umar Jamil'),
  sampling: v('M4X07FFRKik', 'Gentle Introduction to LLM Sampling: Greedy, Top-k, Top-p, and Temperature', 'neuralkian'),
  kvCache: v('80bIUggRJf4', 'The KV Cache: Memory Usage in Transformers', 'Efficient NLP'),
  llmBrief: v('LPZh9BOjkQs', 'Large Language Models explained briefly', '3Blue1Brown'),
  llmIntro: v('zjkBMFhNj_g', 'Intro to Large Language Models (1hr talk)', 'Andrej Karpathy'),
  llmDeep: v('7xTGNNLPyMI', 'Deep Dive into LLMs like ChatGPT', 'Andrej Karpathy'),

  prompts: v('dOxUroR57xs', 'Prompt Engineering Overview', 'Elvis Saravia'),
  useLlms: v('EWvNQjAaOHw', 'How I use LLMs', 'Andrej Karpathy'),
  maximise: v('ahnGLM-RC1Y', 'A Survey of Techniques for Maximizing LLM Performance', 'OpenAI'),
  hackers: v('jkrNMKz9pWU', "A Hackers' Guide to Language Models", 'Jeremy Howard'),
  stateOfGpt: v('bZQun8Y4L2A', 'State of GPT', 'Microsoft Developer'),
  ragWhat: v('T-D1OfcDW1M', 'What is Retrieval-Augmented Generation (RAG)?', 'IBM Technology'),
  ragVectors: v('rhZgXNdhWDY', 'Retrieval Augmented Generation Explained: Embedding, Sentence BERT, Vector Database', 'Umar Jamil'),
  ragScratch: v('sVcwVQRHIc8', 'Learn RAG From Scratch', 'freeCodeCamp.org'),
  agents: v('uhJJgc-0iTQ', 'Building more effective AI agents', 'Anthropic'),
  evals: v('GL0XhAj5LPE', 'LLM Evals: Common Mistakes', 'Hamel Husain'),
  evalsMethod: v('PgzOBNse2EA', 'Evals, error analysis, and better prompts', 'How I AI'),
  injection: v('FgxwCaL6UTA', 'Prompt Injection, explained', 'Simon Willison'),
  weirdWorld: v('h8Jth_ijZyY', 'Catching up on the weird world of LLMs', 'North Bay Python'),

  mlops: v('QkaDZg-2oM4', 'What is MLOps?', 'KodeKloud'),
  quantisation: v('0VdNflU08yA', 'Quantization explained with PyTorch', 'Umar Jamil'),
  monitoring: v('uVqfYkcodeE', 'ML Monitoring (CS329S Machine Learning Systems Design, Stanford)', 'WhyLabs'),

  systems: v('c_AUuTuPA5k', 'Stanford MLSys Seminar Episode 5: Chip Huyen', 'Stanford MLSys Seminars'),
  principles: v('t9cwk3zB7N0', 'Principles Of Good ML Systems Design', 'Toronto Machine Learning Society'),
  recommendations: v('jkKAeIx7F8c', 'Machine Learning System Design Interview: YouTube Recommendations', 'Jay Feng'),
  recsysFacebook: v('5xcd0V9m6Xs', 'Deep Recommender Systems at Facebook', 'Stanford MLSys Seminars'),
  ranking: v('7_E4wnZGJKo', 'Design a Ranking Model (mock interview with a senior Meta ML engineer)', 'Aced (formerly Exponent)'),
  fraud: v('3PRJjNaqcdY', 'MLE System Design Interview: Fraud Detection', 'MeetAPro'),
}

/** Videos for a lesson, by lesson id. */
export const LESSON_VIDEOS: Record<string, Video[]> = {
  'maths-vectors': [V.vectors],
  'maths-matrices': [V.transforms, V.matmul, V.determinant],
  'maths-shapes': [V.broadcasting],
  'maths-derivatives': [V.calculus, V.derivative],
  'maths-gradient': [V.descentSq, V.descent],
  'maths-chain': [V.chainRule, V.chainRuleSq, V.backpropCalculus],
  'maths-probability': [V.bayes, V.bayesSq],
  'maths-distributions': [V.normal],
  'maths-sampling': [V.clt, V.standardError, V.intervals, V.pValues],
  'maths-entropy': [V.likelihood, V.mle, V.crossEntropy, V.softmax],
  'maths-eigen': [V.eigen, V.pca],
  'maths-lab': [V.linear, V.descentSq],

  'classical-linear': [V.leastSquares, V.linear],
  'classical-logistic': [V.logistic],
  'classical-overfit': [V.biasVariance],
  'classical-regularisation': [V.ridge, V.ridgeLasso],
  'classical-trees': [V.trees, V.regressionTrees],
  'classical-ensembles': [V.forests, V.boosting, V.xgboost],
  'classical-kmeans': [V.kmeans],
  'classical-pca': [V.pcaShort, V.pca],
  'classical-lab': [V.logistic, V.descentSq],

  'features-categorical': [V.encoding, V.orderedEncoding],
  'features-leakage': [V.leakage],
  'features-text': [V.word2vec],

  'evaluation-crossval': [V.crossValidation],
  'evaluation-metrics': [V.confusion, V.sensitivity],
  'evaluation-curves': [V.roc],
  'evaluation-experiments': [V.abTests, V.pValues],

  'neural-neuron': [V.network, V.networkSq, V.relu],
  'neural-forward': [V.mlp],
  'neural-backprop': [V.backprop, V.micrograd, V.backpropNinja],
  'neural-init': [V.activations, V.batchNorm],
  'neural-optimisers': [V.optimisers, V.adam],
  'neural-regularise': [V.dropout],
  'neural-lab': [V.micrograd],

  'pytorch-tensors': [V.pytorchLoeber],
  'pytorch-autograd': [V.autograd],
  'pytorch-loop': [V.pytorchCourse],
  'pytorch-cnn': [V.convolution, V.cnn, V.transfer],
  'pytorch-debug': [V.activations],

  'transformers-tokens': [V.tokenizer],
  'transformers-embeddings': [V.word2vec, V.transformer],
  'transformers-attention': [V.attention, V.attentionSq],
  'transformers-block': [V.transformerMaths, V.narrated, V.facts],
  'transformers-training': [V.buildGpt, V.lora],
  'transformers-sampling': [V.sampling],
  'transformers-context': [V.kvCache, V.llmDeep],
  'transformers-lab': [V.buildGpt],

  'aieng-prompts': [V.prompts, V.useLlms],
  'aieng-structured': [V.maximise],
  'aieng-retrieval': [V.ragVectors],
  'aieng-rag': [V.ragWhat, V.ragScratch],
  'aieng-agents': [V.agents],
  'aieng-evals': [V.evals, V.evalsMethod],
  'aieng-production': [V.injection, V.weirdWorld],
  'aieng-lab': [V.ragScratch],

  'mlops-reproducible': [V.mlops],
  'mlops-optimise': [V.quantisation],
  'mlops-monitoring': [V.monitoring],

  'design-framework': [V.systems, V.principles],
  'design-recsys': [V.recommendations, V.recsysFacebook],
  'design-search': [V.ranking],
  'design-fraud': [V.fraud],
}

/** Longer courses and talks that go with a whole module, by module id. */
export const MODULE_VIDEOS: Record<string, Video[]> = {
  maths: [V.vectors, V.calculus],
  classical: [V.mlIntro, V.logistic, V.forests],
  neural: [V.network, V.mit, V.fastai],
  pytorch: [V.pytorchCourse, V.pytorchLoeber, V.alexnet],
  transformers: [V.llmBrief, V.llmIntro, V.transformerSq, V.decoderOnly, V.gpt2],
  aieng: [V.hackers, V.stateOfGpt, V.maximise],
  design: [V.systems],
}

export const watchUrl = (video: Video) => `https://www.youtube.com/watch?v=${video.id}`
