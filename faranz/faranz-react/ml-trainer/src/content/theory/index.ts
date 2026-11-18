import type { Block } from '../../types'
import { mathsTheory } from './maths'
import { classicalTheory } from './classical'
import { featuresTheory } from './features'
import { evaluationTheory } from './evaluation'
import { neuralTheory } from './neural'
import { pytorchTheory } from './pytorch'
import { transformersTheory } from './transformers'
import { aiengTheory } from './aieng'
import { mlopsTheory } from './mlops'
import { designTheory } from './design'

/** The full theory of every lesson, keyed by lesson id. */
export const THEORY: Record<string, Block[]> = { ...mathsTheory, ...classicalTheory, ...featuresTheory, ...evaluationTheory, ...neuralTheory, ...pytorchTheory, ...transformersTheory, ...aiengTheory, ...mlopsTheory, ...designTheory }
