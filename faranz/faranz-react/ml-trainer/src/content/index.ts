import type { Module } from '../types'
import { maths } from './maths'
import { classical } from './classical'
import { features } from './features'
import { evaluation } from './evaluation'
import { neural } from './neural'
import { pytorch } from './pytorch'
import { transformers } from './transformers'
import { aieng } from './aieng'
import { mlops } from './mlops'
import { design } from './design'
import { THEORY } from './theory'

/** The course, in the order it is meant to be taken. A module with no lessons yet is left out. */
export const MODULES: Module[] = [maths, classical, features, evaluation, neural, pytorch, transformers, aieng, mlops, design]
  .filter(m => m.lessons.length > 0)
  .map(m => ({ ...m, lessons: m.lessons.map(l => ({ ...l, theory: THEORY[l.id] })) }))
