import { findMatches } from './findMatches'
import type { BoardMatrix, Move } from './types'

const keyFor = (row: number, col: number) => `${row}:${col}`

export const createsMatch = (board: BoardMatrix, move: Move): boolean => {
    const matches = findMatches(board)
    if (matches.length === 0) {
        return false
    }

    const movedKeys = new Set<string>([
        keyFor(move.from.row, move.from.col),
        keyFor(move.to.row, move.to.col),
    ])

    return matches.some((match) =>
        match.tiles.some((tile) => movedKeys.has(keyFor(tile.row, tile.col))),
    )
}



