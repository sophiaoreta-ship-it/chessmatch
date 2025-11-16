import { findMatches } from './findMatches'
import type { BoardMatrix } from './types'

export const hasAutomaticMatches = (board: BoardMatrix): boolean =>
    findMatches(board).length > 0



