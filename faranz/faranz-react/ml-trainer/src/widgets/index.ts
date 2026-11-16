import type { ComponentType } from 'react'
import { mathsWidgets } from './maths'
import { classicalWidgets } from './classical'
import { featuresWidgets } from './features'
import { evaluationWidgets } from './evaluation'
import { neuralWidgets } from './neural'
import { pytorchWidgets } from './pytorch'
import { transformersWidgets } from './transformers'
import { aiengWidgets } from './aieng'
import { mlopsWidgets } from './mlops'
import { designWidgets } from './design'

/** Every interactive figure, by the name a lesson refers to it with. Names start with the module: "maths-vectors". */
export const WIDGETS: Record<string, ComponentType> = {
  ...mathsWidgets,
  ...classicalWidgets,
  ...featuresWidgets,
  ...evaluationWidgets,
  ...neuralWidgets,
  ...pytorchWidgets,
  ...transformersWidgets,
  ...aiengWidgets,
  ...mlopsWidgets,
  ...designWidgets,
}
