import { applyGravity } from './applyGravity'
import type { BoardMatrix } from './types'

const hasFloatingTiles = (board: BoardMatrix): boolean => {
    const size = board.length
    for (let col = 0; col < size; col += 1) {
        for (let row = size - 1; row > 0; row -= 1) {
            const tile = board[row][col]
            const tileAbove = board[row - 1][col]
            // Check if there's an empty space with a tile above it
            if (
                !tile.isObstacle &&
                tile.pieceType === null &&
                !tileAbove.isObstacle &&
                tileAbove.pieceType !== null
            ) {
                return true
            }
        }
    }
    return false
}

export const collapseBoardFully = (board: BoardMatrix): BoardMatrix => {
    let current = board
    let iterations = 0
    const MAX_COLLAPSE_ITERATIONS = 64 // 8x8 board max possible drops

    // Keep applying gravity until no more tiles can fall
    while (hasFloatingTiles(current) && iterations < MAX_COLLAPSE_ITERATIONS) {
        current = applyGravity(current)
        iterations += 1
    }

    if (iterations >= MAX_COLLAPSE_ITERATIONS) {
        console.warn('⚠️ Collapse iterations capped to prevent infinite loop')
    }

    return current
}


