import { knightShapes } from './shapeDefinitions'
import type { BoardMatrix, Tile } from './types'

// Find valid L-shape patterns starting from a Knight tile
export const findKnightHints = (
    board: BoardMatrix,
    startTile: Tile,
): Tile[] => {
    if (startTile.pieceType !== 'knight') return []

    const size = board.length

    // Try each knight shape pattern anchored at this tile
    for (const shape of knightShapes) {
        const tiles: Tile[] = []
        let isValid = true

        for (const point of shape) {
            const row = startTile.row + point.row
            const col = startTile.col + point.col

            if (row < 0 || row >= size || col < 0 || col >= size) {
                isValid = false
                break
            }

            const tile = board[row][col]
            if (tile.pieceType !== 'knight') {
                isValid = false
                break
            }

            tiles.push(tile)
        }

        if (isValid && tiles.length === 4) {
            return tiles
        }
    }

    return []
}

// Find valid diagonal patterns starting from a Bishop tile
export const findBishopHints = (
    board: BoardMatrix,
    startTile: Tile,
): Tile[] => {
    if (startTile.pieceType !== 'bishop') return []

    const size = board.length

    // Check all 4 diagonal directions
    const directions = [
        { row: -1, col: -1 }, // up-left
        { row: -1, col: 1 }, // up-right
        { row: 1, col: -1 }, // down-left
        { row: 1, col: 1 }, // down-right
    ]

    for (const dir of directions) {
        const segment: Tile[] = [startTile]
        let row = startTile.row + dir.row
        let col = startTile.col + dir.col

        // Extend in this direction
        while (row >= 0 && row < size && col >= 0 && col < size) {
            const tile = board[row][col]
            if (tile.pieceType !== 'bishop') break
            segment.push(tile)
            row += dir.row
            col += dir.col
        }

        // Also check opposite direction
        row = startTile.row - dir.row
        col = startTile.col - dir.col
        while (row >= 0 && row < size && col >= 0 && col < size) {
            const tile = board[row][col]
            if (tile.pieceType !== 'bishop') break
            segment.unshift(tile)
            row -= dir.row
            col -= dir.col
        }

        // If we found a valid diagonal (4+ tiles), return it
        if (segment.length >= 4) {
            return segment
        }
    }

    return []
}

// Find valid row/column patterns starting from a Rook tile
export const findRookHints = (
    board: BoardMatrix,
    startTile: Tile,
): Tile[] => {
    if (startTile.pieceType !== 'rook') return []

    const size = board.length
    const horizontal: Tile[] = [startTile]
    const vertical: Tile[] = [startTile]

    // Check horizontal (left and right)
    for (let col = startTile.col - 1; col >= 0; col -= 1) {
        const tile = board[startTile.row][col]
        if (tile.pieceType !== 'rook') break
        horizontal.unshift(tile)
    }
    for (let col = startTile.col + 1; col < size; col += 1) {
        const tile = board[startTile.row][col]
        if (tile.pieceType !== 'rook') break
        horizontal.push(tile)
    }

    // Check vertical (up and down)
    for (let row = startTile.row - 1; row >= 0; row -= 1) {
        const tile = board[row][startTile.col]
        if (tile.pieceType !== 'rook') break
        vertical.unshift(tile)
    }
    for (let row = startTile.row + 1; row < size; row += 1) {
        const tile = board[row][startTile.col]
        if (tile.pieceType !== 'rook') break
        vertical.push(tile)
    }

    // Return the longer valid pattern (3+ tiles)
    if (horizontal.length >= 3 && horizontal.length >= vertical.length) {
        return horizontal
    }
    if (vertical.length >= 3) {
        return vertical
    }

    return []
}

// Find valid 2x2 pawn cluster patterns
export const findPawnHints = (
    board: BoardMatrix,
    startTile: Tile,
): Tile[] => {
    if (startTile.pieceType !== 'pawn') return []

    const size = board.length

    // Check all 4 possible 2x2 clusters that include this tile
    const clusters = [
        // Top-left corner
        [
            { row: startTile.row, col: startTile.col },
            { row: startTile.row, col: startTile.col + 1 },
            { row: startTile.row + 1, col: startTile.col },
            { row: startTile.row + 1, col: startTile.col + 1 },
        ],
        // Top-right corner
        [
            { row: startTile.row, col: startTile.col - 1 },
            { row: startTile.row, col: startTile.col },
            { row: startTile.row + 1, col: startTile.col - 1 },
            { row: startTile.row + 1, col: startTile.col },
        ],
        // Bottom-left corner
        [
            { row: startTile.row - 1, col: startTile.col },
            { row: startTile.row - 1, col: startTile.col + 1 },
            { row: startTile.row, col: startTile.col },
            { row: startTile.row, col: startTile.col + 1 },
        ],
        // Bottom-right corner
        [
            { row: startTile.row - 1, col: startTile.col - 1 },
            { row: startTile.row - 1, col: startTile.col },
            { row: startTile.row, col: startTile.col - 1 },
            { row: startTile.row, col: startTile.col },
        ],
    ]

    for (const cluster of clusters) {
        const tiles: Tile[] = []
        let isValid = true

        for (const pos of cluster) {
            if (pos.row < 0 || pos.row >= size || pos.col < 0 || pos.col >= size) {
                isValid = false
                break
            }

            const tile = board[pos.row][pos.col]
            if (tile.pieceType !== 'pawn') {
                isValid = false
                break
            }

            tiles.push(tile)
        }

        if (isValid && tiles.length === 4) {
            return tiles
        }
    }

    return []
}

// Main function to find pattern hints for any tile
export const findPatternHints = (
    board: BoardMatrix,
    tile: Tile,
): Tile[] => {
    if (!tile.pieceType) return []

    switch (tile.pieceType) {
        case 'knight':
            return findKnightHints(board, tile)
        case 'rook':
            return findRookHints(board, tile)
        case 'bishop':
            return findBishopHints(board, tile)
        case 'pawn':
            return findPawnHints(board, tile)
        default:
            return []
    }
}

