import { findAllPatterns } from './findAllPatterns'
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
    // Can swap if both have pieces (even if obstacles)
    if (tile.pieceType === null || other.pieceType === null) return false
    // Can't swap if obstacle without piece
    if (tile.isObstacle && tile.pieceType === null) return false
    if (other.isObstacle && other.pieceType === null) return false
    return true
}

/**
 * Find a valid swap that would create a match
 * Returns the two tiles that should be swapped, or null if no valid swap found
 */
export const findSwapHint = (board: BoardMatrix): [Tile, Tile] | null => {
    const size = board.length

    // First, check if there are existing patterns (easier hint)
    const existingPatterns = findAllPatterns(board)
    if (existingPatterns.length > 0) {
        // Return the first two tiles from the first pattern as a hint
        const firstMatch = existingPatterns[0]
        if (firstMatch.tiles.length >= 2) {
            return [firstMatch.tiles[0], firstMatch.tiles[1]]
        }
    }

    // If no existing patterns, find a swap that would create a match
    for (let row = 0; row < size; row += 1) {
        for (let col = 0; col < size; col += 1) {
            const tile = board[row][col]
            if (!tile || tile.pieceType === null) continue

            // Check right neighbor
            const right = board[row][col + 1]
            if (canSwap(tile, right)) {
                const swapped = swap(board, tile, right)
                const matches = findAllPatterns(swapped)
                // Check if swap created matches involving the swapped tiles
                const swappedIds = new Set([tile.id, right.id])
                const hasValidMatch = matches.some((match) =>
                    match.tiles.some((t) => swappedIds.has(t.id)),
                )
                if (hasValidMatch) {
                    return [tile, right]
                }
            }

            // Check down neighbor
            const down = board[row + 1]?.[col]
            if (canSwap(tile, down)) {
                const swapped = swap(board, tile, down)
                const matches = findAllPatterns(swapped)
                // Check if swap created matches involving the swapped tiles
                const swappedIds = new Set([tile.id, down.id])
                const hasValidMatch = matches.some((match) =>
                    match.tiles.some((t) => swappedIds.has(t.id)),
                )
                if (hasValidMatch) {
                    return [tile, down]
                }
            }
        }
    }

    return null
}



