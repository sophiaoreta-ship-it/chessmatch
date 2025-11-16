import { createObstacleTile } from './createObstacleTile'
import { createSpecialTokenTile } from './createSpecialTokenTile'
import type {
    BoardMatrix,
    ObstacleConfig,
    PieceType,
    SpecialTokenConfig,
    Tile,
} from './types'

export const randomPiece = (allowed: PieceType[]): PieceType => {
    if (allowed.length === 0) {
        throw new Error('generateBoard requires at least one allowed piece')
    }
    const index = Math.floor(Math.random() * allowed.length)
    return allowed[index]
}

const makeId = (prefix: string, row: number, col: number) =>
    `${prefix}-${row}-${col}-${Math.random().toString(36).slice(2, 8)}`

export const createTile = (
    row: number,
    col: number,
    pieceType: PieceType,
): Tile => ({
    id: makeId(pieceType, row, col),
    row,
    col,
    pieceType,
})

export const createEmptyTile = (row: number, col: number): Tile => ({
    id: makeId('empty', row, col),
    row,
    col,
    pieceType: null,
})

export const cloneTile = (tile: Tile, overrides: Partial<Tile> = {}): Tile => ({
    ...tile,
    ...overrides,
})

// Pattern probability settings - increased for more clusters
const PATTERN_CREATION_CHANCE = 0.5 // 50% chance to create a pair that can form a match
const CLUSTER_CREATION_CHANCE = 0.3 // 30% chance to create L-shapes or diagonals

const createsImmediateMatch = (
    board: BoardMatrix,
    row: number,
    col: number,
    candidate: PieceType,
): boolean => {
    // Only prevent matches of 4+ pieces (more lenient - allows 3s which can form patterns)
    const horizontal =
        col >= 3 &&
        board[row][col - 1]?.pieceType === candidate &&
        board[row][col - 2]?.pieceType === candidate &&
        board[row][col - 3]?.pieceType === candidate

    const vertical =
        row >= 3 &&
        board[row - 1]?.[col]?.pieceType === candidate &&
        board[row - 2]?.[col]?.pieceType === candidate &&
        board[row - 3]?.[col]?.pieceType === candidate

    return horizontal || vertical
}

// Check if placing a piece would create a pair (2 in a row) - good for pattern formation
const wouldCreatePair = (
    board: BoardMatrix,
    row: number,
    col: number,
    candidate: PieceType,
): boolean => {
    const horizontal =
        col >= 1 && board[row][col - 1]?.pieceType === candidate

    const vertical =
        row >= 1 && board[row - 1]?.[col]?.pieceType === candidate

    return horizontal || vertical
}

// Check if placing a piece would create a diagonal pair (for bishops)
const wouldCreateDiagonalPair = (
    board: BoardMatrix,
    row: number,
    col: number,
    candidate: PieceType,
): boolean => {
    const upLeft = row >= 1 && col >= 1 && board[row - 1]?.[col - 1]?.pieceType === candidate
    const upRight = row >= 1 && col < board.length - 1 && board[row - 1]?.[col + 1]?.pieceType === candidate
    const downLeft = row < board.length - 1 && col >= 1 && board[row + 1]?.[col - 1]?.pieceType === candidate
    const downRight = row < board.length - 1 && col < board.length - 1 && board[row + 1]?.[col + 1]?.pieceType === candidate

    return upLeft || upRight || downLeft || downRight
}

// Check if placing a piece would create an L-shape start (for knights)
const wouldCreateLShapeStart = (
    board: BoardMatrix,
    row: number,
    col: number,
    candidate: PieceType,
): boolean => {
    // Check for potential L-shape: need 2 adjacent pieces in one direction
    const hasHorizontalPair = col >= 1 && board[row][col - 1]?.pieceType === candidate
    const hasVerticalPair = row >= 1 && board[row - 1]?.[col]?.pieceType === candidate

    // Check if there's a perpendicular piece nearby to form L
    if (hasHorizontalPair) {
        const hasUp = row >= 1 && board[row - 1]?.[col]?.pieceType === candidate
        const hasDown = row < board.length - 1 && board[row + 1]?.[col]?.pieceType === candidate
        return hasUp || hasDown
    }
    if (hasVerticalPair) {
        const hasLeft = col >= 1 && board[row][col - 1]?.pieceType === candidate
        const hasRight = col < board.length - 1 && board[row][col + 1]?.pieceType === candidate
        return hasLeft || hasRight
    }
    return false
}

export const generateBoard = (
    size: number,
    allowedTypes: PieceType[],
    obstacles: ObstacleConfig[] = [],
    specialTokens: SpecialTokenConfig[] = [],
): BoardMatrix => {
    const board: BoardMatrix = Array.from({ length: size }, (_, row) =>
        Array.from({ length: size }, (_, col) => createEmptyTile(row, col)),
    )

    // Place obstacles first - they contain chess pieces inside
    obstacles.forEach(({ position, type, hitsRequired }) => {
        const { row, col } = position
        if (row >= 0 && row < size && col >= 0 && col < size) {
            board[row][col] = createObstacleTile(row, col, type, hitsRequired, allowedTypes)
        }
    })

    // Place special tokens
    specialTokens.forEach(({ position, type }) => {
        const { row, col } = position
        if (row >= 0 && row < size && col >= 0 && col < size && !board[row][col].isObstacle) {
            const piece = randomPiece(allowedTypes)
            board[row][col] = createSpecialTokenTile(row, col, piece, type)
        }
    })

    // Fill remaining spaces with regular pieces
    // Increased pattern probability: create pairs and allow 3-matches
    for (let row = 0; row < size; row += 1) {
        for (let col = 0; col < size; col += 1) {
            if (board[row][col].isObstacle || board[row][col].pieceType !== null) continue

            let piece = randomPiece(allowedTypes)
            let attempts = 0
            const rand = Math.random()

            // Enhanced cluster creation: prioritize creating patterns
            if (createsImmediateMatch(board, row, col, piece)) {
                // Only avoid matches of 4+ (more lenient)
                while (createsImmediateMatch(board, row, col, piece) && attempts < 16) {
                    piece = randomPiece(allowedTypes)
                    attempts += 1
                }
            } else if (rand < CLUSTER_CREATION_CHANCE) {
                // Try to create L-shapes for knights
                if (allowedTypes.includes('knight') && wouldCreateLShapeStart(board, row, col, 'knight')) {
                    piece = 'knight'
                }
                // Try to create diagonal pairs for bishops
                else if (allowedTypes.includes('bishop') && wouldCreateDiagonalPair(board, row, col, 'bishop')) {
                    piece = 'bishop'
                }
                // Try to create row/column pairs for rooks
                else if (allowedTypes.includes('rook') && wouldCreatePair(board, row, col, 'rook')) {
                    piece = 'rook'
                }
            } else if (rand < PATTERN_CREATION_CHANCE) {
                // Create pairs (2 in a row) to increase pattern probability
                if (wouldCreatePair(board, row, col, piece)) {
                    // Keep this piece as it creates a pair
                } else {
                    // Try to match adjacent pieces to create pairs
                    const leftPiece = col > 0 ? board[row][col - 1]?.pieceType : null
                    const topPiece = row > 0 ? board[row - 1]?.[col]?.pieceType : null

                    if (leftPiece && allowedTypes.includes(leftPiece)) {
                        piece = leftPiece
                    } else if (topPiece && allowedTypes.includes(topPiece)) {
                        piece = topPiece
                    }
                }
            }

            board[row][col] = createTile(row, col, piece)
        }
    }

    // Safety check: ensure all tiles are filled (no empty tiles)
    for (let row = 0; row < size; row += 1) {
        for (let col = 0; col < size; col += 1) {
            const tile = board[row][col]
            // Obstacles should have pieces inside, regular tiles should have pieces
            if (!tile.isObstacle && tile.pieceType === null) {
                // Fill any remaining empty tiles
                board[row][col] = createTile(row, col, randomPiece(allowedTypes))
            }
        }
    }

    return board
}

