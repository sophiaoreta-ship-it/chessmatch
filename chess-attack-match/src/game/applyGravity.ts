import { createEmptyTile, cloneTile } from './generateBoard'
import type { BoardMatrix } from './types'

export const applyGravity = (board: BoardMatrix): BoardMatrix => {
    const size = board.length
    const next: BoardMatrix = board.map((row, rowIndex) =>
        row.map((tile, colIndex) =>
            tile.isObstacle ? cloneTile(tile) : createEmptyTile(rowIndex, colIndex),
        ),
    )

    for (let col = 0; col < size; col += 1) {
        const obstacleRows = new Set<number>()
        for (let row = 0; row < size; row += 1) {
            const tile = board[row][col]
            if (tile.isObstacle) {
                obstacleRows.add(row)
                next[row][col] = cloneTile(tile)
            }
        }

        let writeRow = size - 1
        let obstacleGuard = 0
        const obstacleLimit = size + 2
        for (let row = size - 1; row >= 0; row -= 1) {
            if (obstacleRows.has(row)) {
                writeRow = row - 1
                continue
            }

            const tile = board[row][col]
            if (tile.isObstacle || tile.pieceType === null) {
                continue
            }

            while (writeRow >= 0 && obstacleRows.has(writeRow)) {
                if (obstacleGuard++ > obstacleLimit) {
                    console.warn('⚠️ Gravity obstacle guard triggered; breaking loop')
                    break
                }
                writeRow -= 1
            }

            if (writeRow < 0) {
                break
            }

            next[writeRow][col] = cloneTile(tile, { row: writeRow, col })
            writeRow -= 1
        }

        let cleanupGuard = 0
        const cleanupLimit = size + 2
        while (writeRow >= 0) {
            if (cleanupGuard++ > cleanupLimit) {
                console.warn('⚠️ Gravity cleanup guard triggered; breaking loop')
                break
            }
            if (!obstacleRows.has(writeRow)) {
                next[writeRow][col] = createEmptyTile(writeRow, col)
            }
            writeRow -= 1
        }
    }

    return next
}

