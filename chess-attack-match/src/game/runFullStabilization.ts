import { MAX_CASCADE_ITERATIONS } from './constants'
import { clearTiles } from './clearTiles'
import { collapseBoardFully } from './collapseBoardFully'
import { findMatches } from './findMatches'
import { createTile, randomPiece } from './generateBoard'
import { DEFAULT_ALLOWED_PIECES } from './constants'
import { refillBoard } from './refillBoard'
import type { BoardMatrix, Match, PieceType } from './types'

export interface StabilizationReport {
    board: BoardMatrix
    cascades: Match[]
    clearedByPiece: Record<PieceType, number>
    iterations: number
}

export const runFullStabilizationWithReport = (
    board: BoardMatrix,
): StabilizationReport => {
    let current = board
    let iterations = 0
    const cascades: Match[] = []
    const clearedByPiece: Record<PieceType, number> = {
        knight: 0,
        rook: 0,
        bishop: 0,
        pawn: 0,
    }

    while (iterations < MAX_CASCADE_ITERATIONS) {
        const matches = findMatches(current)

        if (matches.length === 0) {
            break
        }

        matches.forEach((match) => {
            cascades.push({
                pieceType: match.pieceType,
                tiles: match.tiles.map((tile) => ({ ...tile })),
            })
            clearedByPiece[match.pieceType] += match.tiles.length
        })

            current = clearTiles(current, matches)
            // Step 1: Collapse - tiles above fall down to fill gaps
            current = collapseBoardFully(current)
            // Step 2: Refill - new tiles generate only in top row and fall down
            current = refillBoard(current)
            
            // Final safety check: ensure no empty spaces remain
            const size = current.length
            const allowedPieces = DEFAULT_ALLOWED_PIECES
            for (let row = 0; row < size; row += 1) {
                for (let col = 0; col < size; col += 1) {
                    const tile = current[row][col]
                    if (!tile.isObstacle && tile.pieceType === null) {
                        // This should never happen after refill, but ensure it's filled
                        console.warn(`⚠️ Empty tile detected at ${row},${col} after refill - filling now`)
                        const pieceType = randomPiece(allowedPieces)
                        current[row][col] = createTile(row, col, pieceType)
                    }
                }
            }

            iterations += 1
    }

    if (iterations === MAX_CASCADE_ITERATIONS) {
        console.warn('⚠️ Cascade capped to prevent infinite loop')
    }

    return {
        board: current,
        cascades,
        clearedByPiece,
        iterations,
    }
}

export const runFullStabilization = (board: BoardMatrix): BoardMatrix =>
    runFullStabilizationWithReport(board).board


