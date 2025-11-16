import { findMatches } from './findMatches'
import type { BoardMatrix, Tile } from './types'

const cloneBoard = (board: BoardMatrix): BoardMatrix =>
    board.map((row) => row.map((tile) => ({ ...tile })))

const swap = (board: BoardMatrix, a: Tile, b: Tile): BoardMatrix => {
    const clone = cloneBoard(board)

    const from = clone[a.row][a.col]
    const to = clone[b.row][b.col]

    clone[a.row][a.col] = { ...to, row: a.row, col: a.col }
    clone[b.row][b.col] = { ...from, row: b.row, col: b.col }

    return clone
}

const canSwap = (tile: Tile | undefined, other: Tile | undefined): boolean => {
    if (!tile || !other) return false
    if (tile.isObstacle || other.isObstacle) return false
    if (tile.pieceType === null || other.pieceType === null) return false
    return true
}

export const hasValidMoves = (board: BoardMatrix): boolean => {
    const size = board.length

    for (let row = 0; row < size; row += 1) {
        for (let col = 0; col < size; col += 1) {
            const tile = board[row][col]
            if (!tile || tile.pieceType === null || tile.isObstacle) continue

            const right = board[row][col + 1]
            if (canSwap(tile, right)) {
                const swapped = swap(board, tile, right)
                if (findMatches(swapped).length > 0) {
                    return true
                }
            }

            const down = board[row + 1]?.[col]
            if (canSwap(tile, down)) {
                const swapped = swap(board, tile, down)
                if (findMatches(swapped).length > 0) {
                    return true
                }
            }
        }
    }

    return false
}


