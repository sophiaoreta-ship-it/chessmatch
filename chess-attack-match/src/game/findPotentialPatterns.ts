import type { BoardMatrix, Tile } from './types'

// Find tiles that could potentially form patterns with a given tile
export const findPotentialPatternTiles = (
    board: BoardMatrix,
    tile: Tile,
): Set<string> => {
    if (!tile.pieceType) return new Set()

    const potential = new Set<string>()
    const size = board.length
    const pieceType = tile.pieceType

    // Check adjacent tiles of the same type (potential for lines/clusters)
    const directions = [
        { row: -1, col: 0 }, // up
        { row: 1, col: 0 }, // down
        { row: 0, col: -1 }, // left
        { row: 0, col: 1 }, // right
        { row: -1, col: -1 }, // up-left
        { row: -1, col: 1 }, // up-right
        { row: 1, col: -1 }, // down-left
        { row: 1, col: 1 }, // down-right
    ]

    directions.forEach((dir) => {
        const newRow = tile.row + dir.row
        const newCol = tile.col + dir.col

        if (
            newRow >= 0 &&
            newRow < size &&
            newCol >= 0 &&
            newCol < size
        ) {
            const adjacent = board[newRow][newCol]
            if (
                adjacent.pieceType === pieceType &&
                !adjacent.isObstacle
            ) {
                potential.add(adjacent.id)
            }
        }
    })

    return potential
}

