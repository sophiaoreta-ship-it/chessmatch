import type { BoardMatrix } from './types'

export const isBoardCleared = (board: BoardMatrix): boolean => {
    for (let row = 0; row < board.length; row += 1) {
        for (let col = 0; col < board[row].length; col += 1) {
            const tile = board[row][col]
            // Board is cleared if no active pieces remain (only obstacles or empty)
            if (!tile.isObstacle && tile.pieceType !== null) {
                return false
            }
        }
    }
    return true
}


