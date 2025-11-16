import { createTile, cloneTile, randomPiece } from './generateBoard'
import { DEFAULT_ALLOWED_PIECES } from './constants'
import type { BoardMatrix, PieceType } from './types'

const shuffleArray = <T,>(source: T[]): T[] => {
    const arr = [...source]
    for (let i = arr.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1))
            ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
}

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

export const shuffleBoard = (board: BoardMatrix): BoardMatrix => {
    const size = board.length
    const pieceValues = gatherPieces(board)
    const allowedPieces = resolveAllowedPieces(pieceValues)
    const shuffledPieces = shuffleArray(pieceValues)

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




