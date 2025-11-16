import { knightShapes } from './shapeDefinitions'
import type { BoardMatrix, Tile } from './types'
import { validatePattern } from './validatePattern'

// Find the best pattern match for a partial selection
export const findPatternSnap = (
    board: BoardMatrix,
    selectedTiles: Tile[],
): Tile[] | null => {
    if (selectedTiles.length < 2) return null

    const firstTile = selectedTiles[0]
    if (!firstTile.pieceType) return null

    const pieceType = firstTile.pieceType
    const size = board.length

    // Knight: Try to complete L-shape from 2-3 selected tiles
    if (pieceType === 'knight') {
        // If we have 2-3 tiles, try to find a valid L-shape that includes them
        for (const shape of knightShapes) {
            const maxRow = Math.max(...shape.map((point) => point.row))
            const maxCol = Math.max(...shape.map((point) => point.col))

            for (let baseRow = 0; baseRow <= size - (maxRow + 1); baseRow += 1) {
                for (let baseCol = 0; baseCol <= size - (maxCol + 1); baseCol += 1) {
                    const candidateTiles = shape.map(
                        (point) => board[baseRow + point.row][baseCol + point.col],
                    )

                    // Check if all selected tiles are in this candidate
                    const candidateIds = new Set(candidateTiles.map((t) => t.id))
                    const hasAllSelected = selectedTiles.every((t) =>
                        candidateIds.has(t.id),
                    )

                    if (
                        hasAllSelected &&
                        candidateTiles.every((t) => t.pieceType === 'knight')
                    ) {
                        const result = validatePattern(candidateTiles)
                        if (result.isValid) {
                            return candidateTiles
                        }
                    }
                }
            }
        }
    }

    // Rook: Auto-complete horizontal or vertical line
    if (pieceType === 'rook') {
        // Check if selected tiles form a line
        const sameRow = selectedTiles.every((t) => t.row === firstTile.row)
        const sameCol = selectedTiles.every((t) => t.col === firstTile.col)

        if (sameRow) {
            // Complete horizontal line
            const row = firstTile.row
            const cols = selectedTiles.map((t) => t.col).sort()
            const minCol = cols[0]
            const maxCol = cols[cols.length - 1]

            const line: Tile[] = []
            for (let col = minCol; col <= maxCol; col += 1) {
                const tile = board[row][col]
                if (tile.pieceType === 'rook') {
                    line.push(tile)
                } else {
                    break
                }
            }

            if (line.length >= 4) {
                const result = validatePattern(line)
                if (result.isValid) return line
            }
        }

        if (sameCol) {
            // Complete vertical line
            const col = firstTile.col
            const rows = selectedTiles.map((t) => t.row).sort()
            const minRow = rows[0]
            const maxRow = rows[rows.length - 1]

            const line: Tile[] = []
            for (let row = minRow; row <= maxRow; row += 1) {
                const tile = board[row][col]
                if (tile.pieceType === 'rook') {
                    line.push(tile)
                } else {
                    break
                }
            }

            if (line.length >= 4) {
                const result = validatePattern(line)
                if (result.isValid) return line
            }
        }
    }

    // Bishop: Auto-complete diagonal line
    if (pieceType === 'bishop') {
        // Check if selected tiles are on a diagonal
        const majorDiagonal = firstTile.row - firstTile.col
        const minorDiagonal = firstTile.row + firstTile.col

        const onMajor = selectedTiles.every(
            (t) => t.row - t.col === majorDiagonal,
        )
        const onMinor = selectedTiles.every(
            (t) => t.row + t.col === minorDiagonal,
        )

        if (onMajor) {
            // Complete major diagonal
            const tiles = selectedTiles.sort((a, b) => a.row - b.row)
            const startRow = tiles[0].row
            const startCol = tiles[0].col
            const endRow = tiles[tiles.length - 1].row
            const endCol = tiles[tiles.length - 1].col

            const line: Tile[] = []
            let row = startRow
            let col = startCol
            const dirRow = endRow > startRow ? 1 : -1
            const dirCol = endCol > startCol ? 1 : -1

            while (
                row >= 0 &&
                row < size &&
                col >= 0 &&
                col < size &&
                board[row][col].pieceType === 'bishop'
            ) {
                line.push(board[row][col])
                if (row === endRow && col === endCol) break
                row += dirRow
                col += dirCol
            }

            if (line.length >= 4) {
                const result = validatePattern(line)
                if (result.isValid) return line
            }
        }

        if (onMinor) {
            // Complete minor diagonal
            const tiles = selectedTiles.sort((a, b) => a.row - b.row)
            const startRow = tiles[0].row
            const startCol = tiles[0].col
            const endRow = tiles[tiles.length - 1].row
            const endCol = tiles[tiles.length - 1].col

            const line: Tile[] = []
            let row = startRow
            let col = startCol
            const dirRow = endRow > startRow ? 1 : -1
            const dirCol = endCol > startCol ? -1 : 1

            while (
                row >= 0 &&
                row < size &&
                col >= 0 &&
                col < size &&
                board[row][col].pieceType === 'bishop'
            ) {
                line.push(board[row][col])
                if (row === endRow && col === endCol) break
                row += dirRow
                col += dirCol
            }

            if (line.length >= 4) {
                const result = validatePattern(line)
                if (result.isValid) return line
            }
        }
    }

    // Pawn: Try to complete 4-tile 2x2 cluster
    if (pieceType === 'pawn' && selectedTiles.length >= 1 && selectedTiles.length < 4) {
        const first = selectedTiles[0]
        
        // Check all 4 possible 2x2 clusters that include this tile
        const clusters = [
            // Top-left corner
            [
                { row: first.row, col: first.col },
                { row: first.row, col: first.col + 1 },
                { row: first.row + 1, col: first.col },
                { row: first.row + 1, col: first.col + 1 },
            ],
            // Top-right corner
            [
                { row: first.row, col: first.col - 1 },
                { row: first.row, col: first.col },
                { row: first.row + 1, col: first.col - 1 },
                { row: first.row + 1, col: first.col },
            ],
            // Bottom-left corner
            [
                { row: first.row - 1, col: first.col },
                { row: first.row - 1, col: first.col + 1 },
                { row: first.row, col: first.col },
                { row: first.row, col: first.col + 1 },
            ],
            // Bottom-right corner
            [
                { row: first.row - 1, col: first.col - 1 },
                { row: first.row - 1, col: first.col },
                { row: first.row, col: first.col - 1 },
                { row: first.row, col: first.col },
            ],
        ]
        
        for (const cluster of clusters) {
            // Check if all positions are valid
            if (cluster.some(pos => pos.row < 0 || pos.row >= size || pos.col < 0 || pos.col >= size)) {
                continue
            }
            
            const clusterTiles = cluster.map(pos => board[pos.row][pos.col])
            
            // Check if all selected tiles are in this cluster
            const clusterIds = new Set(clusterTiles.map(t => t.id))
            const hasAllSelected = selectedTiles.every(t => clusterIds.has(t.id))
            
            if (!hasAllSelected) continue
            
            // Check if all tiles in cluster are pawns
            if (clusterTiles.every(tile => tile.pieceType === 'pawn')) {
                const result = validatePattern(clusterTiles)
                if (result.isValid) return clusterTiles
            }
        }
    }

    return null
}

