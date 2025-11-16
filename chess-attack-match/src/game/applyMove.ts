import { cloneTile } from './generateBoard'
import type { BoardMatrix, Move } from './types'

const copyBoard = (board: BoardMatrix): BoardMatrix =>
    board.map((row) => row.map((tile) => cloneTile(tile)))

export const applyMove = (board: BoardMatrix, move: Move): BoardMatrix => {
    const size = board.length
    const { from, to } = move

    if (
        from.row < 0 ||
        from.row >= size ||
        from.col < 0 ||
        from.col >= size ||
        to.row < 0 ||
        to.row >= size ||
        to.col < 0 ||
        to.col >= size
    ) {
        return board
    }

    if (from.row === to.row && from.col === to.col) {
        return board
    }

    const clone = copyBoard(board)
    const source = clone[from.row][from.col]
    const target = clone[to.row][to.col]

    if (source.isObstacle || target.isObstacle) {
        return board
    }

    clone[from.row][from.col] = cloneTile(target, { row: from.row, col: from.col })
    clone[to.row][to.col] = cloneTile(source, { row: to.row, col: to.col })

    return clone
}



