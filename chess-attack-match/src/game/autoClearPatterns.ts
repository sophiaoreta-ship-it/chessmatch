import { applyGravity } from './applyGravity'
import { clearTiles } from './clearTiles'
import { collapseBoardFully } from './collapseBoardFully'
import { DEFAULT_ALLOWED_PIECES } from './constants'
import { findAllPatterns } from './findAllPatterns'
import { createTile, cloneTile, randomPiece } from './generateBoard'
import { hasValidMoves } from './hasValidMoves'
import { safeShuffle } from './safeShuffle'
import type { BoardMatrix, PieceType } from './types'

/**
 * Automatically clear all existing patterns on the board (like Candy Crush auto-pops)
 * Continues until board is stable (no more patterns exist)
 * Used after initialization, gravity, and refill
 * 
 * @param board - The board to stabilize
 * @param recursionDepth - Internal parameter to prevent infinite recursion (max 2)
 */
export const autoClearPatterns = (board: BoardMatrix, recursionDepth = 0): BoardMatrix => {
    const MAX_RECURSION_DEPTH = 2
    if (recursionDepth > MAX_RECURSION_DEPTH) {
        console.warn('⚠️ Auto-clear recursion depth exceeded - returning board as-is')
        return board
    }

    let workingBoard = board
    let iterationCount = 0
    const MAX_AUTO_CLEAR_ITERATIONS = 20 // Safety limit

    while (iterationCount < MAX_AUTO_CLEAR_ITERATIONS) {
        // Find all chess patterns (L-shapes, diagonals, lines, clusters)
        const existingPatterns = findAllPatterns(workingBoard)

        // If no patterns found, board is stable
        if (existingPatterns.length === 0) {
            break
        }

        // Clear all found patterns
        workingBoard = clearTiles(workingBoard, existingPatterns)

        // Apply gravity - tiles fall down
        workingBoard = collapseBoardFully(workingBoard)

        // Refill from top (refillBoard will call autoClearPatterns recursively, but with depth+1)
        // To avoid double-clearing, we'll use a simpler refill here
        workingBoard = refillBoardWithoutAutoClear(workingBoard)

        // Continue loop to check if refill created new patterns
        iterationCount += 1
    }

    if (iterationCount >= MAX_AUTO_CLEAR_ITERATIONS) {
        console.warn('⚠️ Auto-clear iterations capped - board may still have patterns')
    }

    // Final check - if no valid moves exist, shuffle to ensure playability
    if (!hasValidMoves(workingBoard)) {
        workingBoard = safeShuffle(workingBoard)
        // After shuffle, check again for patterns (shuffle might create some)
        const patternsAfterShuffle = findAllPatterns(workingBoard)
        if (patternsAfterShuffle.length > 0) {
            // Recursively clear (with increased depth)
            workingBoard = autoClearPatterns(workingBoard, recursionDepth + 1)
        }
    }

    return workingBoard
}

/**
 * Refill board without auto-clearing (to avoid recursion in autoClearPatterns)
 */
const refillBoardWithoutAutoClear = (board: BoardMatrix): BoardMatrix => {
    const size = board.length
    const allowedPieces = collectPiecePool(board)
    let current = board.map((row) => row.map((tile) => cloneTile(tile)))

    // Loop until board is completely filled
    let iterations = 0
    const MAX_REFILL_ITERATIONS = size * 2

    while (iterations < MAX_REFILL_ITERATIONS) {
        let hasEmptySpaces = false

        // Fill top row
        for (let col = 0; col < size; col += 1) {
            const topTile = current[0][col]
            if (!topTile.isObstacle && topTile.pieceType === null) {
                const pieceType = randomPiece(allowedPieces)
                current[0][col] = createTile(0, col, pieceType)
                hasEmptySpaces = true
            }
        }

        // Apply gravity
        current = applyGravity(current)

        // Check for empty spaces
        for (let row = 1; row < size; row += 1) {
            for (let col = 0; col < size; col += 1) {
                const tile = current[row][col]
                if (!tile.isObstacle && tile.pieceType === null) {
                    hasEmptySpaces = true
                    break
                }
            }
            if (hasEmptySpaces) break
        }

        if (!hasEmptySpaces) break
        iterations += 1
    }

    // Ensure obstacles remain
    return current.map((row, rowIndex) =>
        row.map((tile, colIndex) => {
            if (board[rowIndex][colIndex].isObstacle) {
                return cloneTile(board[rowIndex][colIndex])
            }
            return tile
        }),
    )
}

const collectPiecePool = (board: BoardMatrix): PieceType[] => {
    const pool = new Set<PieceType>()
    board.forEach((row) =>
        row.forEach((tile) => {
            if (tile.pieceType) {
                pool.add(tile.pieceType)
            }
        }),
    )
    return pool.size > 0 ? Array.from(pool) : DEFAULT_ALLOWED_PIECES
}

