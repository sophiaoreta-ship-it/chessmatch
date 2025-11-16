import { knightShapes } from './shapeDefinitions'
import { validatePattern } from './validatePattern'
import type { BoardMatrix, Match, Tile } from './types'

// Find all valid chess patterns on the board
export const findAllPatterns = (board: BoardMatrix): Match[] => {
    const size = board.length
    const matches: Match[] = []
    const usedTiles = new Set<string>()

    // Helper to check if tiles are already used
    const areTilesUsed = (tiles: Tile[]): boolean => {
        return tiles.some((tile) => usedTiles.has(tile.id))
    }

    // Helper to mark tiles as used
    const markTilesUsed = (tiles: Tile[]): void => {
        tiles.forEach((tile) => usedTiles.add(tile.id))
    }

    // Knights: Find all L-shapes
    for (const shape of knightShapes) {
        const maxRow = Math.max(...shape.map((point) => point.row))
        const maxCol = Math.max(...shape.map((point) => point.col))

        for (let baseRow = 0; baseRow <= size - (maxRow + 1); baseRow += 1) {
            for (let baseCol = 0; baseCol <= size - (maxCol + 1); baseCol += 1) {
                const tiles = shape.map(
                    (point) => board[baseRow + point.row][baseCol + point.col],
                )

                // Allow obstacles with knight pieces, but skip if no piece or wrong type
                if (tiles.some((tile) => {
                    // Skip if no piece or wrong type
                    if (tile.pieceType === null || tile.pieceType !== 'knight') return true
                    // Skip if obstacle without piece (shouldn't happen, but safety check)
                    if (tile.isObstacle && tile.pieceType === null) return true
                    return false
                })) {
                    continue
                }

                if (areTilesUsed(tiles)) continue

                const result = validatePattern(tiles)
                if (result.isValid) {
                    matches.push({
                        pieceType: 'knight',
                        tiles: tiles.map((tile) => ({ ...tile })),
                    })
                    markTilesUsed(tiles)
                }
            }
        }
    }

    // Rooks: Horizontal lines
    for (let row = 0; row < size; row += 1) {
        let col = 0
        while (col < size) {
            const startTile = board[row][col]
            // Allow obstacles with pieces, but skip obstacles without pieces
            if (startTile.pieceType === null || (startTile.isObstacle && startTile.pieceType === null)) {
                col += 1
                continue
            }

            const segment: Tile[] = [startTile]
            const type = startTile.pieceType
            col += 1

            // Allow obstacles with pieces of the same type
            while (col < size && board[row][col].pieceType === type && !(board[row][col].isObstacle && board[row][col].pieceType === null)) {
                segment.push(board[row][col])
                col += 1
            }

            if (type === 'rook' && segment.length >= 3) {
                if (!areTilesUsed(segment)) {
                    const result = validatePattern(segment)
                    if (result.isValid) {
                        matches.push({
                            pieceType: 'rook',
                            tiles: segment.map((tile) => ({ ...tile })),
                        })
                        markTilesUsed(segment)
                    }
                }
            }
        }
    }

    // Rooks: Vertical lines
    for (let col = 0; col < size; col += 1) {
        let row = 0
        while (row < size) {
            const startTile = board[row][col]
            // Allow obstacles with pieces, but skip obstacles without pieces
            if (startTile.pieceType === null || (startTile.isObstacle && startTile.pieceType === null)) {
                row += 1
                continue
            }

            const segment: Tile[] = [startTile]
            const type = startTile.pieceType
            row += 1

            // Allow obstacles with pieces of the same type
            while (row < size && board[row][col].pieceType === type && !(board[row][col].isObstacle && board[row][col].pieceType === null)) {
                segment.push(board[row][col])
                row += 1
            }

            if (type === 'rook' && segment.length >= 3) {
                if (!areTilesUsed(segment)) {
                    const result = validatePattern(segment)
                    if (result.isValid) {
                        matches.push({
                            pieceType: 'rook',
                            tiles: segment.map((tile) => ({ ...tile })),
                        })
                        markTilesUsed(segment)
                    }
                }
            }
        }
    }

    // Bishops: Diagonals
    const traverseDiagonal = (
        startRow: number,
        startCol: number,
        deltaRow: number,
        deltaCol: number,
    ): void => {
        let row = startRow
        let col = startCol
        let segment: Tile[] = []
        let currentType: Tile['pieceType'] | null = null

        while (row >= 0 && row < size && col >= 0 && col < size) {
            const tile = board[row][col]
            // Allow obstacles with pieces, but skip obstacles without pieces
            if (tile.pieceType === null || (tile.isObstacle && tile.pieceType === null)) {
                if (currentType === 'bishop' && segment.length >= 3 && !areTilesUsed(segment)) {
                    const result = validatePattern(segment)
                    if (result.isValid) {
                        matches.push({
                            pieceType: 'bishop',
                            tiles: segment.map((t) => ({ ...t })),
                        })
                        markTilesUsed(segment)
                    }
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
                if (currentType === 'bishop' && segment.length >= 3 && !areTilesUsed(segment)) {
                    const result = validatePattern(segment)
                    if (result.isValid) {
                        matches.push({
                            pieceType: 'bishop',
                            tiles: segment.map((t) => ({ ...t })),
                        })
                        markTilesUsed(segment)
                    }
                }
                segment = [tile]
                currentType = tile.pieceType
            }

            row += deltaRow
            col += deltaCol
        }

        if (currentType === 'bishop' && segment.length >= 3 && !areTilesUsed(segment)) {
            const result = validatePattern(segment)
            if (result.isValid) {
                matches.push({
                    pieceType: 'bishop',
                    tiles: segment.map((t) => ({ ...t })),
                })
                markTilesUsed(segment)
            }
        }
    }

    // Major diagonals (down-right)
    for (let col = 0; col < size; col += 1) {
        traverseDiagonal(0, col, 1, 1)
    }
    for (let row = 1; row < size; row += 1) {
        traverseDiagonal(row, 0, 1, 1)
    }

    // Minor diagonals (down-left)
    for (let col = 0; col < size; col += 1) {
        traverseDiagonal(0, col, 1, -1)
    }
    for (let row = 1; row < size; row += 1) {
        traverseDiagonal(row, size - 1, 1, -1)
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
            if (cluster.every((tile) => {
                if (tile.pieceType === null || (tile.isObstacle && tile.pieceType === null)) return false
                return tile.pieceType === 'pawn'
            })) {
                if (!areTilesUsed(cluster)) {
                    const result = validatePattern(cluster)
                    if (result.isValid) {
                        matches.push({
                            pieceType: 'pawn',
                            tiles: cluster.map((tile) => ({ ...tile })),
                        })
                        markTilesUsed(cluster)
                    }
                }
            }
        }
    }

    return matches
}

