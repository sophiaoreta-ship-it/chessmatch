import { randomPiece } from './generateBoard'
import type { ObstacleType, PieceType, Tile } from './types'

const getDefaultHitsRequired = (type: ObstacleType): number => {
    switch (type) {
        case 'ice':
            return 1
        case 'crate':
            return 2
        case 'stone':
            return 3
        case 'vine':
            return 1
        case 'lock':
            return 2
        case 'cobweb':
            return 1
        case 'frozen':
            return 2
        default:
            return 1
    }
}

const makeId = (prefix: string, row: number, col: number) =>
    `${prefix}-${row}-${col}-${Math.random().toString(36).slice(2, 8)}`

export const createObstacleTile = (
    row: number,
    col: number,
    obstacleType: ObstacleType,
    hitsRequired?: number,
    allowedPieces?: PieceType[],
): Tile => {
    // Obstacles contain a chess piece inside - use random piece from allowed types
    const pieceType = allowedPieces && allowedPieces.length > 0
        ? randomPiece(allowedPieces)
        : null

    return {
        id: makeId('obstacle', row, col),
        row,
        col,
        pieceType,
        isObstacle: true,
        obstacleType,
        obstacleHits: hitsRequired ?? getDefaultHitsRequired(obstacleType),
    }
}

