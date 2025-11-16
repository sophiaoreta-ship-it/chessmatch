import { createTile, cloneTile, randomPiece } from './generateBoard'
import { DEFAULT_ALLOWED_PIECES } from './constants'
import type { BoardMatrix, PieceType } from './types'

const gatherPieces = (board: BoardMatrix): PieceType[] => {
    const pieces: PieceType[] = []
    board.forEach((row) =>
        row.forEach((tile) => {
            if (tile.pieceType) {
                pieces.push(tile.pieceType)
            }
        }),
    )
    return pieces
}

const resolveAllowedPieces = (pieces: PieceType[]): PieceType[] => {
    if (pieces.length > 0) {
        return pieces
    }
    return DEFAULT_ALLOWED_PIECES
}

// Gentle shuffle: creates small clusters but ensures patterns can still form
export const gentleShuffle = (board: BoardMatrix): BoardMatrix => {
    const size = board.length
    const pieceValues = gatherPieces(board)
    const allowedPieces = resolveAllowedPieces(pieceValues)

    // Shuffle pieces randomly but with slight clustering tendency
    const shuffledPieces = [...pieceValues]
    for (let i = shuffledPieces.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffledPieces[i], shuffledPieces[j]] = [shuffledPieces[j], shuffledPieces[i]]
    }

    let pieceIndex = 0

    const next: BoardMatrix = board.map((row, rowIndex) =>
        row.map((tile, colIndex) => {
            if (tile.isObstacle) {
                return cloneTile(tile)
            }

            if (pieceIndex < shuffledPieces.length) {
                const pieceType = shuffledPieces[pieceIndex]
                pieceIndex += 1
                return createTile(rowIndex, colIndex, pieceType)
            }

            const fallbackPiece = randomPiece(allowedPieces)
            return createTile(rowIndex, colIndex, fallbackPiece)
        }),
    )

    // Ensure no accidental empties remain
    for (let row = 0; row < size; row += 1) {
        for (let col = 0; col < size; col += 1) {
            const tile = next[row][col]
            if (!tile.isObstacle && tile.pieceType === null) {
                const pieceType = randomPiece(allowedPieces)
                next[row][col] = createTile(row, col, pieceType)
            }
        }
    }

    return next
}

