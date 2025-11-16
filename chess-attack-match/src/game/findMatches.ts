import type { BoardMatrix, Match, Tile } from './types'

const collectRun = (tiles: Tile[]): Match | null => {
    if (tiles.length < 3) {
        return null
    }
    const [first] = tiles
    if (!first || first.pieceType === null) {
        return null
    }

    return {
        pieceType: first.pieceType,
        tiles: tiles.map((tile) => ({ ...tile })),
    }
}

export const findMatches = (board: BoardMatrix): Match[] => {
    const size = board.length
    const matches: Match[] = []

    // Horizontal runs
    for (let row = 0; row < size; row += 1) {
        let col = 0
        while (col < size) {
            const tile = board[row][col]
            if (!tile || tile.pieceType === null || tile.isObstacle) {
                col += 1
                continue
            }

            const run: Tile[] = [tile]
            let nextCol = col + 1

            while (
                nextCol < size &&
                board[row][nextCol] &&
                !board[row][nextCol].isObstacle &&
                board[row][nextCol].pieceType === tile.pieceType
            ) {
                run.push(board[row][nextCol])
                nextCol += 1
            }

            const match = collectRun(run)
            if (match) {
                matches.push(match)
            }

            col = nextCol
        }
    }

    // Vertical runs
    for (let col = 0; col < size; col += 1) {
        let row = 0
        while (row < size) {
            const tile = board[row][col]
            if (!tile || tile.pieceType === null || tile.isObstacle) {
                row += 1
                continue
            }

            const run: Tile[] = [tile]
            let nextRow = row + 1

            while (
                nextRow < size &&
                board[nextRow] &&
                board[nextRow][col] &&
                !board[nextRow][col].isObstacle &&
                board[nextRow][col].pieceType === tile.pieceType
            ) {
                run.push(board[nextRow][col])
                nextRow += 1
            }

            const match = collectRun(run)
            if (match) {
                matches.push(match)
            }

            row = nextRow
        }
    }

    return matches
}

