import { knightShapes } from './shapeDefinitions'
import type { BoardMatrix, Tile } from './types'
import { validatePattern } from './validatePattern'

const tryTiles = (tiles: Tile[]): Tile[] | null => {
    const result = validatePattern(tiles)
    return result.isValid ? tiles : null
}

export const findFirstPattern = (board: BoardMatrix): Tile[] | null => {
    const size = board.length

    // Knights: iterate shapes anchored at top-left positions
    for (const shape of knightShapes) {
        const maxRow = Math.max(...shape.map((point) => point.row))
        const maxCol = Math.max(...shape.map((point) => point.col))

        for (let baseRow = 0; baseRow <= size - (maxRow + 1); baseRow += 1) {
            for (let baseCol = 0; baseCol <= size - (maxCol + 1); baseCol += 1) {
                const tiles = shape.map(
                    (point) => board[baseRow + point.row][baseCol + point.col],
                )
                // Skip if any tile is invalid (no piece, obstacle without piece, or wrong type)
                if (tiles.some((tile) => tile.pieceType === null || tile.pieceType !== 'knight')) continue
                const match = tryTiles(tiles)
                if (match) return match
            }
        }
    }

    // Rooks: horizontal lines
    for (let row = 0; row < size; row += 1) {
        let col = 0
        while (col < size) {
            const startTile = board[row][col]
            // Skip empty tiles or obstacles without pieces
            if (startTile.pieceType === null) {
                col += 1
                continue
            }

            const segment: Tile[] = [startTile]
            const type = startTile.pieceType
            col += 1

            while (col < size && board[row][col].pieceType === type) {
                segment.push(board[row][col])
                col += 1
            }

            if (type === 'rook' && segment.length >= 3) {
                const match = tryTiles(segment)
                if (match) return match
            }
        }
    }

    // Rooks: vertical lines
    for (let col = 0; col < size; col += 1) {
        let row = 0
        while (row < size) {
            const startTile = board[row][col]
            // Skip empty tiles or obstacles without pieces
            if (startTile.pieceType === null) {
                row += 1
                continue
            }

            const segment: Tile[] = [startTile]
            const type = startTile.pieceType
            row += 1

            while (row < size && board[row][col].pieceType === type) {
                segment.push(board[row][col])
                row += 1
            }

            if (type === 'rook' && segment.length >= 3) {
                const match = tryTiles(segment)
                if (match) return match
            }
        }
    }

    const traverseDiagonal = (
        startRow: number,
        startCol: number,
        deltaRow: number,
        deltaCol: number,
    ) => {
        let row = startRow
        let col = startCol
        let segment: Tile[] = []
        let currentType: Tile['pieceType'] | null = null

        while (row >= 0 && row < size && col >= 0 && col < size) {
            const tile = board[row][col]
            // Skip empty tiles (obstacles with pieces are valid)
            if (tile.pieceType === null) {
                if (currentType === 'bishop' && segment.length >= 4) {
                    const match = tryTiles(segment)
                    if (match) return match
                }
                segment = []
                currentType = null
                row += deltaRow
                col += deltaCol
                continue
            }

            if (segment.length === 0) {
                segment = [tile]
                currentType = tile.pieceType
            } else if (tile.pieceType === currentType) {
                segment.push(tile)
            } else {
                if (currentType === 'bishop' && segment.length >= 4) {
                    const match = tryTiles(segment)
                    if (match) return match
                }
                segment = [tile]
                currentType = tile.pieceType
            }

            row += deltaRow
            col += deltaCol
        }

        if (currentType === 'bishop' && segment.length >= 4) {
            const match = tryTiles(segment)
            if (match) return match
        }
        return null
    }

    // Bishops: major diagonals (down-right)
    for (let col = 0; col < size; col += 1) {
        const match = traverseDiagonal(0, col, 1, 1)
        if (match) return match
    }
    for (let row = 1; row < size; row += 1) {
        const match = traverseDiagonal(row, 0, 1, 1)
        if (match) return match
    }

    // Bishops: minor diagonals (down-left)
    for (let col = 0; col < size; col += 1) {
        const match = traverseDiagonal(0, col, 1, -1)
        if (match) return match
    }
    for (let row = 1; row < size; row += 1) {
        const match = traverseDiagonal(row, size - 1, 1, -1)
        if (match) return match
    }

    // Pawns: 4 tiles forming a 2x2 square cluster
    for (let row = 0; row < size - 1; row += 1) {
        for (let col = 0; col < size - 1; col += 1) {
            // Check 2x2 cluster: all 4 corners
            const cluster: Tile[] = [
                board[row][col],         // Top-left
                board[row][col + 1],     // Top-right
                board[row + 1][col],     // Bottom-left
                board[row + 1][col + 1], // Bottom-right
            ]

            // All 4 tiles must be pawns
            if (cluster.every((tile) => tile.pieceType === 'pawn')) {
                const match = tryTiles(cluster)
                if (match) return match
            }
        }
    }

    return null
}

