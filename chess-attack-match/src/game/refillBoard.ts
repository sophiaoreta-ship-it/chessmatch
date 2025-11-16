import { applyGravity } from './applyGravity'
import { createTile, cloneTile, randomPiece } from './generateBoard'
import { DEFAULT_ALLOWED_PIECES } from './constants'
import type { BoardMatrix, PieceType } from './types'

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

export const refillBoard = (board: BoardMatrix): BoardMatrix => {
    const size = board.length
    const allowedPieces = collectPiecePool(board)
    let current = board.map((row) => row.map((tile) => cloneTile(tile)))

    // Loop until board is completely filled
    let iterations = 0
    const MAX_REFILL_ITERATIONS = size * 2 // Safety limit

    while (iterations < MAX_REFILL_ITERATIONS) {
        let hasEmptySpaces = false

        // Step 1: Fill ONLY the top row (row 0) where there are empty spaces
        // Reduced pattern probability during refill to prevent infinite cascades
        const PATTERN_REFILL_CHANCE = 0.15 // 15% chance to create pairs during refill (reduced from 40%)
        for (let col = 0; col < size; col += 1) {
            const topTile = current[0][col]
            if (!topTile.isObstacle && topTile.pieceType === null) {
                let pieceType = randomPiece(allowedPieces)

                // Sometimes match adjacent pieces to create patterns
                if (Math.random() < PATTERN_REFILL_CHANCE) {
                    const leftPiece = col > 0 ? current[0][col - 1]?.pieceType : null
                    if (leftPiece && allowedPieces.includes(leftPiece)) {
                        pieceType = leftPiece
                    }
                }

                current[0][col] = createTile(0, col, pieceType)
                hasEmptySpaces = true
            }
        }

        // Step 2: Apply gravity so new tiles fall down
        current = applyGravity(current)

        // Step 3: Check if there are still empty spaces (not in top row)
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

        // If no empty spaces remain (except top row which we'll check next iteration), we're done
        if (!hasEmptySpaces) {
            break
        }

        iterations += 1
    }

    if (iterations >= MAX_REFILL_ITERATIONS) {
        console.warn('⚠️ Refill iterations capped - filling remaining empty spaces')
        // Emergency fill any remaining empty spaces
        for (let row = 0; row < size; row += 1) {
            for (let col = 0; col < size; col += 1) {
                const tile = current[row][col]
                if (!tile.isObstacle && tile.pieceType === null) {
                    const pieceType = randomPiece(allowedPieces)
                    current[row][col] = createTile(row, col, pieceType)
                }
            }
        }
    }

    // Ensure obstacle cells remain obstacles
    let filledBoard = current.map((row, rowIndex) =>
        row.map((tile, colIndex) => {
            if (board[rowIndex][colIndex].isObstacle) {
                return cloneTile(board[rowIndex][colIndex])
            }
            return tile
        }),
    )

    // Note: Auto-clearing patterns after refill is now handled with animations
    // in the game state management (useGameStore.ts) to provide visual feedback

    return filledBoard
}


