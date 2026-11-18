import type { ModuleVideos } from './types'

export const qmlVideos: ModuleVideos = {
  lessons: {
    'qml-why': [
      { id: 'BRUlSm4gdQ4', title: 'The 7 Reasons Most Machine Learning Funds Fail Marcos Lopez de Prado from QuantCon 2018', by: 'Quantopian' },
      { id: 'EuBBz3bI-aA', title: 'Machine Learning Fundamentals: Bias and Variance', by: 'StatQuest with Josh Starmer' },
    ],
    'qml-linear': [
      { id: 'Q81RR3yKn30', title: 'Regularization Part 1: Ridge (L2) Regression', by: 'StatQuest with Josh Starmer' },
      { id: 'NGf0voTMlcs', title: 'Regularization Part 2: Lasso (L1) Regression', by: 'StatQuest with Josh Starmer' },
    ],
    'qml-trees': [
      { id: '_L39rN6gz7Y', title: 'Decision and Classification Trees, Clearly Explained!!!', by: 'StatQuest with Josh Starmer' },
      { id: '3CC4N4z3GJc', title: 'Gradient Boost Part 1 (of 4): Regression Main Ideas', by: 'StatQuest with Josh Starmer' },
    ],
    'qml-validation': [
      { id: 'OGpENuxjRWM', title: 'Forecasting Principles & Practice: 5.10 Time series cross-validation', by: 'OTexts' },
      { id: 'fSytzGwwBVw', title: 'Machine Learning Fundamentals: Cross Validation', by: 'StatQuest with Josh Starmer' },
    ],
    'qml-strategy': [
      { id: 'VUvShOEFdQo', title: '13.4.2 Feature Permutation Importance (L13: Feature Selection)', by: 'Sebastian Raschka' },
    ],
    'qml-failure': [
      { id: 'KNCgvjyKrcw', title: 'Quantopian Lecture Series: Overfitting', by: 'Quantopian' },
      { id: 'ssFbVironJU', title: 'Learn from the Experts Episode 4: Avoiding Overfitting via Cross-Validation with Joakim', by: 'Quantopian' },
    ],
  },
  module: [
    { id: 'OUAMdi281mQ', title: 'Class 3: Artificial Intelligence in Finance', by: 'MIT OpenCourseWare' },
    { id: 'J4Wdy0Wc_xQ', title: 'StatQuest: Random Forests Part 1 - Building, Using and Evaluating', by: 'StatQuest with Josh Starmer' },
  ],
  playlists: [
    {
      list: 'PLblh5JKOoLUICTaGLRoHQDuF_7q2GfuJF',
      title: 'Machine Learning',
      by: 'StatQuest with Josh Starmer',
      about: 'Short, clear explanations of the models and ideas in this module: bias and variance, cross-validation, ridge and lasso, trees, random forests and boosting.',
      lessons: ['qml-linear', 'qml-trees', 'qml-validation'],
    },
    {
      list: 'PLRFLF1OxMm_UL7WUWM31iynp0jMVf_vLW',
      title: 'Quantopian Lecture Series',
      by: 'Quantopian',
      about: 'Lectures on quantitative research from the former Quantopian platform, including overfitting, model misspecification and testing signals honestly.',
      lessons: ['qml-why', 'qml-failure'],
    },
  ],
}
