import { applyMove } from './applyMove'
import { createsMatch } from './createsMatch'
import { hasValidMoves } from './hasValidMoves'
import { runFullStabilization } from './runFullStabilization'
import { safeShuffle } from './safeShuffle'
import type { BoardMatrix, Move } from './types'

export const applyPlayerMove = (board: BoardMatrix, move: Move): BoardMatrix => {
    const swapped = applyMove(board, move)

    if (!createsMatch(swapped, move)) {
        return board
    }

    const afterCascade = runFullStabilization(swapped)

    if (!hasValidMoves(afterCascade)) {
        return safeShuffle(afterCascade)
    }

    return afterCascade
}



